import { inflateRawSync } from "node:zlib";

const MAX_COVER_IMAGE_BYTES = 5 * 1024 * 1024;
const MAX_JAR_BYTES = 50 * 1024 * 1024;
const MAX_ZIP_ENTRIES = 12_000;
const MAX_DESCRIPTOR_BYTES = 256 * 1024;
const EOCD_SCAN_BYTES = 66_000;

const ALLOWED_IMAGE_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
  "image/avif"
]);

export function validateCoverImageFile(file: File): string | null {
  if (!file || file.size <= 0) return "Cover image file is empty.";
  if (file.size > MAX_COVER_IMAGE_BYTES) return "Cover image must be 5MB or smaller.";
  const t = String(file.type || "").toLowerCase();
  if (!ALLOWED_IMAGE_TYPES.has(t)) {
    return "Cover image must be PNG, JPEG, WEBP, GIF, or AVIF.";
  }
  return null;
}

export function validateJarFile(file: File): string | null {
  if (!file || file.size <= 0) return "Please select a .jar file.";
  if (file.size > MAX_JAR_BYTES) return "Plugin .jar must be 50MB or smaller.";
  const name = (file.name || "").toLowerCase();
  if (!name.endsWith(".jar")) return "Uploaded file must have .jar extension.";
  const t = String(file.type || "").toLowerCase();
  if (t && t !== "application/java-archive" && t !== "application/octet-stream") {
    return "Uploaded .jar has an unexpected content type.";
  }
  return null;
}

type ZipEntry = {
  name: string;
  method: number;
  compressedSize: number;
  uncompressedSize: number;
  localHeaderOffset: number;
};

function findEndOfCentralDirectory(buf: Buffer): number {
  const start = Math.max(0, buf.length - EOCD_SCAN_BYTES);
  for (let i = buf.length - 22; i >= start; i -= 1) {
    if (buf.readUInt32LE(i) === 0x06054b50) return i;
  }
  return -1;
}

function parseZipEntries(buf: Buffer): Map<string, ZipEntry> | null {
  const eocdOffset = findEndOfCentralDirectory(buf);
  if (eocdOffset < 0) return null;

  const totalEntries = buf.readUInt16LE(eocdOffset + 10);
  const centralDirectorySize = buf.readUInt32LE(eocdOffset + 12);
  const centralDirectoryOffset = buf.readUInt32LE(eocdOffset + 16);

  if (!Number.isFinite(totalEntries) || totalEntries <= 0 || totalEntries > MAX_ZIP_ENTRIES) return null;
  if (centralDirectoryOffset < 0 || centralDirectoryOffset >= buf.length) return null;
  if (centralDirectorySize <= 0 || centralDirectoryOffset + centralDirectorySize > buf.length) return null;

  const entries = new Map<string, ZipEntry>();
  let offset = centralDirectoryOffset;

  for (let i = 0; i < totalEntries; i += 1) {
    if (offset + 46 > buf.length) return null;
    if (buf.readUInt32LE(offset) !== 0x02014b50) return null;

    const method = buf.readUInt16LE(offset + 10);
    const compressedSize = buf.readUInt32LE(offset + 20);
    const uncompressedSize = buf.readUInt32LE(offset + 24);
    const fileNameLength = buf.readUInt16LE(offset + 28);
    const extraLength = buf.readUInt16LE(offset + 30);
    const commentLength = buf.readUInt16LE(offset + 32);
    const localHeaderOffset = buf.readUInt32LE(offset + 42);

    const fileNameStart = offset + 46;
    const fileNameEnd = fileNameStart + fileNameLength;
    if (fileNameEnd > buf.length) return null;

    const name = buf.toString("utf8", fileNameStart, fileNameEnd);
    const normalized = name.replace(/\\/g, "/").toLowerCase();
    if (normalized && !normalized.endsWith("/")) {
      entries.set(normalized, {
        name: normalized,
        method,
        compressedSize,
        uncompressedSize,
        localHeaderOffset
      });
    }

    offset = fileNameEnd + extraLength + commentLength;
    if (offset > buf.length) return null;
  }

  return entries;
}

function readZipEntry(buf: Buffer, entry: ZipEntry): Buffer | null {
  const offset = entry.localHeaderOffset;
  if (offset < 0 || offset + 30 > buf.length) return null;
  if (buf.readUInt32LE(offset) !== 0x04034b50) return null;

  const fileNameLength = buf.readUInt16LE(offset + 26);
  const extraLength = buf.readUInt16LE(offset + 28);
  const dataStart = offset + 30 + fileNameLength + extraLength;
  const dataEnd = dataStart + entry.compressedSize;

  if (dataStart < 0 || dataEnd > buf.length || dataEnd < dataStart) return null;
  const payload = buf.subarray(dataStart, dataEnd);

  if (entry.method === 0) {
    if (payload.length > MAX_DESCRIPTOR_BYTES) return null;
    return payload;
  }
  if (entry.method === 8) {
    try {
      const inflated = inflateRawSync(payload);
      if (inflated.length > MAX_DESCRIPTOR_BYTES) return null;
      return inflated;
    } catch {
      return null;
    }
  }
  return null;
}

function isValidPluginYml(text: string): boolean {
  const hasName = /^\s*name\s*:\s*.+$/im.test(text);
  const hasMain = /^\s*main\s*:\s*.+$/im.test(text);
  return hasName && hasMain;
}

function isValidPaperPluginYml(text: string): boolean {
  const hasName = /^\s*name\s*:\s*.+$/im.test(text);
  const hasEntrypoint = /^(\s*(main|loader|bootstrapper)\s*:\s*.+)$/im.test(text);
  return hasName && hasEntrypoint;
}

function isValidVelocityPluginJson(text: string): boolean {
  try {
    const parsed = JSON.parse(text) as Record<string, unknown>;
    const id = typeof parsed.id === "string" ? parsed.id.trim() : "";
    const main = typeof parsed.main === "string" ? parsed.main.trim() : "";
    return Boolean(id && main);
  } catch {
    return false;
  }
}

export async function validateUploadedPluginJar(file: File): Promise<string | null> {
  const basicErr = validateJarFile(file);
  if (basicErr) return basicErr;

  const bytes = Buffer.from(await file.arrayBuffer());
  if (bytes.length < 4 || bytes.readUInt32LE(0) !== 0x04034b50) {
    return "Uploaded file is not a valid JAR/ZIP archive.";
  }

  const entries = parseZipEntries(bytes);
  if (!entries || entries.size === 0) {
    return "Uploaded file is not a readable JAR archive.";
  }

  const hasClassFile = Array.from(entries.keys()).some((name) => name.endsWith(".class"));
  if (!hasClassFile) {
    return "Upload rejected: no compiled Java classes were found in this JAR.";
  }

  const pluginYml = entries.get("plugin.yml");
  if (pluginYml) {
    const raw = readZipEntry(bytes, pluginYml);
    const text = raw ? raw.toString("utf8") : "";
    if (isValidPluginYml(text)) return null;
  }

  const paperPluginYml = entries.get("paper-plugin.yml");
  if (paperPluginYml) {
    const raw = readZipEntry(bytes, paperPluginYml);
    const text = raw ? raw.toString("utf8") : "";
    if (isValidPaperPluginYml(text)) return null;
  }

  const bungeeYml = entries.get("bungee.yml");
  if (bungeeYml) {
    const raw = readZipEntry(bytes, bungeeYml);
    const text = raw ? raw.toString("utf8") : "";
    if (isValidPluginYml(text)) return null;
  }

  const velocityJson = entries.get("velocity-plugin.json");
  if (velocityJson) {
    const raw = readZipEntry(bytes, velocityJson);
    const text = raw ? raw.toString("utf8") : "";
    if (isValidVelocityPluginJson(text)) return null;
  }

  return "Upload rejected: JAR must contain a valid Minecraft plugin descriptor (plugin.yml, paper-plugin.yml, bungee.yml, or velocity-plugin.json).";
}
