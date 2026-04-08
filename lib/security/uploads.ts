const MAX_COVER_IMAGE_BYTES = 5 * 1024 * 1024;
const MAX_JAR_BYTES = 50 * 1024 * 1024;

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
