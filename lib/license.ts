import { randomInt } from "node:crypto";

export function generateLicenseKey(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no confusable chars
  const segment = () =>
    Array.from({ length: 4 }, () =>
      chars[randomInt(chars.length)]
    ).join("");
  return `PDEX-${segment()}-${segment()}-${segment()}`;
}

