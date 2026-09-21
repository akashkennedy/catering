import sharp from "sharp";
import { join } from "path";

const dir = import.meta.dirname;
const logoPath = join(dir, "..", "logo.png");

async function generate() {
  // Standard PWA icons: full-bleed logo.
  for (const { name, size } of [
    { name: "icon-192x192.png", size: 192 },
    { name: "icon-512x512.png", size: 512 },
    { name: "apple-touch-icon.png", size: 180 },
  ]) {
    await sharp(logoPath).resize(size, size, { fit: "cover" }).png().toFile(join(dir, name));
    console.log(`Generated ${name} (${size}x${size})`);
  }

  // Maskable icon: Android adaptive icons crop ~14% off each edge, so the
  // logo is centered at ~72% on a solid background (inside the safe zone).
  const inner = await sharp(logoPath).resize(368, 368, { fit: "cover" }).toBuffer();
  await sharp({
    create: { width: 512, height: 512, channels: 4, background: "#ffffff" },
  })
    .composite([{ input: inner, gravity: "center" }])
    .png()
    .toFile(join(dir, "icon-maskable-512.png"));
  console.log("Generated icon-maskable-512.png (512x512, padded)");
}

generate().catch((err) => {
  console.error(err);
  process.exit(1);
});
