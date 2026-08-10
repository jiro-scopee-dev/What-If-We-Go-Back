import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const srcMuseum = path.join(root, "museum");
const dstMuseum = path.join(root, "public", "museum");
const srcImages = path.join(root, "image");
const dstThumbs = path.join(root, "public", "image", "thumbs");
const dstLarge = path.join(root, "public", "image", "large");

const pad = (n) => String(n).padStart(3, "0");

function copyFrames() {
  fs.mkdirSync(dstMuseum, { recursive: true });
  for (const stale of fs.readdirSync(dstMuseum).filter((f) => f.endsWith(".jpg"))) {
    fs.rmSync(path.join(dstMuseum, stale), { force: true });
  }
  const frames = fs
    .readdirSync(srcMuseum)
    .filter((f) => /^ezgif-frame-\d{3}\.png$/.test(f))
    .sort();
  let copied = 0;
  for (const f of frames) {
    const dst = path.join(dstMuseum, f);
    if (!fs.existsSync(dst)) {
      fs.copyFileSync(path.join(srcMuseum, f), dst);
      copied++;
    }
  }
  console.log(`museum frames: ${frames.length} total, ${copied} copied`);
}

async function processImages() {
  fs.mkdirSync(dstThumbs, { recursive: true });
  fs.mkdirSync(dstLarge, { recursive: true });
  const files = fs
    .readdirSync(srcImages)
    .filter((f) => /^\d+\.jpe?g$/i.test(f))
    .sort((a, b) => parseInt(a, 10) - parseInt(b, 10));
  console.log(`art pieces: ${files.length}`);

  let done = 0;
  for (const f of files) {
    const n = parseInt(f, 10);
    const base = `piece-${pad(n)}`;
    const src = path.join(srcImages, f);
    const thumbDst = path.join(dstThumbs, `${base}.webp`);
    const largeDst = path.join(dstLarge, `${base}.webp`);

    if (!fs.existsSync(largeDst)) {
      await sharp(src)
        .resize({ width: 1800, height: 1800, fit: "inside", withoutEnlargement: true })
        .webp({ quality: 80 })
        .toFile(largeDst);
    }
    if (!fs.existsSync(thumbDst)) {
      await sharp(src)
        .resize({ width: 760, height: 760, fit: "inside", withoutEnlargement: true })
        .webp({ quality: 76 })
        .toFile(thumbDst);
    }
    done++;
    if (done % 40 === 0 || done === files.length) {
      console.log(`  processed ${done}/${files.length}`);
    }
  }
  console.log("image processing complete");
}

copyFrames();
await processImages();
