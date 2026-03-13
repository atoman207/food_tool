/**
 * Generates favicon.ico from public/pabicon.png
 * Run: node scripts/gen-favicon.mjs
 */
import sharp from "sharp";
import pngToIco from "png-to-ico";
import { writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const src = join(root, "public", "pabicon.png");
const out = join(root, "public", "favicon.ico");

const squarePng = await sharp(src)
  .resize(32, 32)
  .png()
  .toBuffer();

const ico = await pngToIco(squarePng);
writeFileSync(out, ico);
console.log("Created public/favicon.ico");
