// Scans public/images/products/ and writes lib/product-images.json ({ slug: url }).
// Runs automatically before every build (npm "prebuild"), so dropping
// public/images/products/<product-slug>.webp into the folder is all that's needed.
import fs from "fs";
import path from "path";

const dir = path.join(process.cwd(), "public", "images", "products");
const out = path.join(process.cwd(), "lib", "product-images.json");
const map = {};

if (fs.existsSync(dir)) {
  for (const file of fs.readdirSync(dir).sort()) {
    const m = file.match(/^([a-z0-9]+(?:-[a-z0-9]+)*)\.(webp|jpg|jpeg|png)$/i);
    if (m) map[m[1].toLowerCase()] = `/images/products/${file}`;
  }
}

fs.writeFileSync(out, JSON.stringify(map, null, 2) + "\n");
console.log(`product images: ${Object.keys(map).length} found`);
