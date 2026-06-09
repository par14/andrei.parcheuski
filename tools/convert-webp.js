const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const folder = "public";

function convertToWebP(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const baseName = filePath.slice(0, -ext.length);

  sharp(filePath)
    .webp({ quality: 80 })
    .toFile(baseName + ".webp")
    .then(() => {
      fs.unlinkSync(filePath); // Remove original file
      console.log(`✅ Converted and removed: ${filePath}`);
    })
    .catch((err) => console.error(`❌ Error: ${filePath}`, err));
}

function walkDir(dir) {
  fs.readdirSync(dir).forEach((file) => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      walkDir(fullPath);
    } else if (/\.(jpe?g|png)$/i.test(fullPath)) {
      convertToWebP(fullPath);
    }
  });
}

walkDir(folder);
