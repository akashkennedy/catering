import sharp from "sharp";
import { readFileSync } from "fs";
import { join } from "path";

const svgBuffer = readFileSync(join(import.meta.dirname, "icon.svg"));

const sizes = [
  { name: "icon-192x192.png", size: 192 },
  { name: "icon-512x512.png", size: 512 },
  { name: "apple-touch-icon.png", size: 180 },
];

async function generate() {
  for (const { name, size } of sizes) {
    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(join(import.meta.dirname, name));
    console.log(`Generated ${name} (${size}x${size})`);
  }
}

generate().catch((err) => {
  console.error(err);
  process.exit(1);
});
