/**
 * Server-only gallery image pipeline.
 * Uploads are normalized with sharp: autorotate, max 1600px long edge
 * (no upscale), WebP q75, EXIF stripped. Landing grid renders uniform
 * 4:3 cover cards so any source ratio displays without malforming.
 */

export const GALLERY_MAX_IMAGES = 10;
export const GALLERY_MAX_EDGE = 1600;
export const GALLERY_INPUT_MAX_BYTES = 10 * 1024 * 1024;
export const GALLERY_OUTPUT_WARN_BYTES = 400 * 1024;

export type CompressedGalleryImage = {
  bytes: Buffer;
  mime: "image/webp";
  width: number;
  height: number;
};

function isSupportedInput(mime: string): boolean {
  return (
    mime === "image/jpeg" ||
    mime === "image/png" ||
    mime === "image/webp" ||
    mime === "image/avif" ||
    mime === "image/gif"
  );
}

export function newGalleryImageId(): string {
  try {
    return `gimg-${crypto.randomUUID()}`;
  } catch {
    return `gimg-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
  }
}

export function galleryImageUrl(imageId: string): string {
  return `/api/site-gallery-images/${imageId}`;
}

/** One compressed photo per menu — same 1600px WebP pipeline as gallery. */
export function newMenuImageId(): string {
  try {
    return `mimg-${crypto.randomUUID()}`;
  } catch {
    return `mimg-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
  }
}

export function menuImageUrl(imageId: string): string {
  return `/api/site-menu-images/${imageId}`;
}

/** Compress an uploaded image buffer to WebP. Throws on invalid input. */
export async function compressGalleryImage(
  input: Buffer,
  mime: string
): Promise<CompressedGalleryImage> {
  if (!isSupportedInput(mime)) {
    throw new Error("Only JPEG, PNG, WebP, AVIF, or GIF uploads are allowed.");
  }
  if (input.length > GALLERY_INPUT_MAX_BYTES) {
    throw new Error("Image is larger than 10MB. Please choose a smaller file.");
  }
  const sharp = (await import("sharp")).default;
  const pipeline = sharp(input, { animated: false }).rotate().resize({
    width: GALLERY_MAX_EDGE,
    height: GALLERY_MAX_EDGE,
    fit: "inside",
    withoutEnlargement: true,
  });
  let bytes = await pipeline.webp({ quality: 75, effort: 4 }).toBuffer();
  // Second pass at lower quality when the first pass is still very large.
  if (bytes.length > GALLERY_OUTPUT_WARN_BYTES) {
    bytes = await sharp(bytes).webp({ quality: 65, effort: 4 }).toBuffer();
  }
  const meta = await sharp(bytes).metadata();
  return {
    bytes,
    mime: "image/webp",
    width: meta.width ?? 0,
    height: meta.height ?? 0,
  };
}

/** Decode a BYTEA column from the Neon HTTP driver (Buffer or \x-hex string). */
export function decodeBytea(value: unknown): Buffer | null {
  if (Buffer.isBuffer(value)) return value;
  if (value instanceof Uint8Array) return Buffer.from(value);
  if (typeof value === "string") {
    if (value.startsWith("\\x")) {
      return Buffer.from(value.slice(2), "hex");
    }
    // Fallback: base64 payload.
    try {
      return Buffer.from(value, "base64");
    } catch {
      return null;
    }
  }
  return null;
}
