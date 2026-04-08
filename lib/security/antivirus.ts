import net from "node:net";

type AntivirusConfig = {
  enabled: boolean;
  host: string;
  port: number;
  timeoutMs: number;
  failOpen: boolean;
};

export type AntivirusScanResult =
  | { status: "clean"; raw: string }
  | { status: "infected"; signature: string; raw: string };

function parseBool(value: string | undefined, fallback: boolean): boolean {
  if (!value) return fallback;
  const normalized = value.trim().toLowerCase();
  return normalized === "1" || normalized === "true" || normalized === "yes" || normalized === "on";
}

function getAntivirusConfig(): AntivirusConfig {
  const enabled = parseBool(process.env.CLAMAV_ENABLED, process.env.NODE_ENV === "production");
  const failOpen = parseBool(process.env.CLAMAV_FAIL_OPEN, false);
  const host = process.env.CLAMAV_HOST?.trim() || "127.0.0.1";
  const rawPort = Number(process.env.CLAMAV_PORT ?? 3310);
  const port = Number.isFinite(rawPort) && rawPort > 0 ? rawPort : 3310;
  const rawTimeout = Number(process.env.CLAMAV_TIMEOUT_MS ?? 15000);
  const timeoutMs = Number.isFinite(rawTimeout) && rawTimeout > 0 ? rawTimeout : 15000;

  return { enabled, failOpen, host, port, timeoutMs };
}

function parseClamAvResponse(raw: string): AntivirusScanResult {
  // clamd may include NUL bytes in some responses; strip them before parsing.
  const normalized = raw.replace(/\0/g, "").trim();
  if (/^OK$/i.test(normalized) || /:\s*OK$/i.test(normalized)) {
    return { status: "clean", raw: normalized };
  }

  const foundMatch = normalized.match(/:\s*(.+)\s+FOUND$/i);
  if (foundMatch?.[1]) {
    return {
      status: "infected",
      signature: foundMatch[1].trim(),
      raw: normalized
    };
  }

  throw new Error(`Unexpected ClamAV response: ${normalized || "<empty>"}`);
}

async function streamToClamd(bytes: Buffer, cfg: AntivirusConfig): Promise<AntivirusScanResult> {
  return await new Promise<AntivirusScanResult>((resolve, reject) => {
    const socket = net.createConnection({ host: cfg.host, port: cfg.port });
    const chunks: Buffer[] = [];
    let settled = false;

    const finish = (fn: () => void) => {
      if (settled) return;
      settled = true;
      try {
        socket.destroy();
      } catch {
        // ignore
      }
      fn();
    };

    socket.setTimeout(cfg.timeoutMs);

    socket.on("connect", () => {
      try {
        socket.write(Buffer.from("zINSTREAM\0", "utf8"));

        let offset = 0;
        const maxChunkSize = 128 * 1024;
        while (offset < bytes.length) {
          const end = Math.min(bytes.length, offset + maxChunkSize);
          const payload = bytes.subarray(offset, end);
          const len = Buffer.allocUnsafe(4);
          len.writeUInt32BE(payload.length, 0);
          socket.write(len);
          socket.write(payload);
          offset = end;
        }

        // Zero-length chunk indicates end of stream.
        const terminator = Buffer.alloc(4);
        terminator.writeUInt32BE(0, 0);
        socket.write(terminator);
      } catch (err) {
        finish(() => reject(err instanceof Error ? err : new Error(String(err))));
      }
    });

    socket.on("data", (data: Buffer) => {
      chunks.push(Buffer.from(data));
    });

    socket.on("timeout", () => {
      finish(() => reject(new Error(`ClamAV scan timed out after ${cfg.timeoutMs}ms`)));
    });

    socket.on("error", (err) => {
      finish(() => reject(err));
    });

    socket.on("end", () => {
      try {
        const raw = Buffer.concat(chunks).toString("utf8");
        const parsed = parseClamAvResponse(raw);
        finish(() => resolve(parsed));
      } catch (err) {
        finish(() => reject(err instanceof Error ? err : new Error(String(err))));
      }
    });
  });
}

export async function scanUploadWithAntivirus(file: File): Promise<AntivirusScanResult | null> {
  const cfg = getAntivirusConfig();
  if (!cfg.enabled) return null;

  const bytes = Buffer.from(await file.arrayBuffer());

  try {
    return await streamToClamd(bytes, cfg);
  } catch (err) {
    if (cfg.failOpen) return { status: "clean", raw: "CLAMAV_UNAVAILABLE_FAIL_OPEN" };
    throw err;
  }
}
