import { NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";

export const runtime = "nodejs";

export async function GET() {
  // Owner-controlled jar location:
  // - Override with `MCMERCHANT_LOADER_JAR_PATH`
  // - Default: repo-local `mcmerchant-loader/target/MCMerchantLoader-1.0.0.jar` (served under the new download filename)
  const jarPath =
    process.env.MCMERCHANT_LOADER_JAR_PATH ??
    path.join(process.cwd(), "mcmerchant-loader", "target", "MCMerchantLoader-1.0.0.jar");

  const jarFilename =
    process.env.MCMERCHANT_LOADER_JAR_FILENAME ?? "MCMerchantLoader-1.0.0.jar";

  try {
    await fs.promises.access(jarPath, fs.constants.R_OK);
  } catch {
    return NextResponse.json(
      {
        error: "loader_jar_not_found",
        jarPath,
        jarFilename,
        hint:
          "Set MCMERCHANT_LOADER_JAR_PATH (and optionally MCMERCHANT_LOADER_JAR_FILENAME) to point to the jar file you want to serve.",
      },
      { status: 404 }
    );
  }

  const stat = await fs.promises.stat(jarPath);
  const stream = fs.createReadStream(jarPath);

  return new NextResponse(stream as any, {
    status: 200,
    headers: {
      "Content-Type": "application/java-archive",
      "Content-Disposition": `attachment; filename="${jarFilename}"`,
      "Content-Length": String(stat.size),
      "Cache-Control": "no-store",
    },
  });
}

