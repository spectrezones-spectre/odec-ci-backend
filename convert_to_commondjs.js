const fs = require("fs");
const path = require("path");

const ROOT_DIR = __dirname;

function processFile(filePath) {
  let content = fs.readFileSync(filePath, "utf8");

  // Ignore si déjà exporté
  if (content.includes("module.exports")) return;

  // Cherche toutes les fonctions const
  const functionRegex = /const (\w+) = async|\bconst (\w+) = \(/g;
  let match;
  const exports = [];

  while ((match = functionRegex.exec(content)) !== null) {
    const name = match[1] || match[2];
    if (name) exports.push(name);
  }

  if (exports.length === 0) return;

  console.log("Ajout exports:", filePath);

  content += `\n\nmodule.exports = { ${exports.join(", ")} };\n`;

  fs.writeFileSync(filePath, content, "utf8");
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      if (file !== "node_modules") {
        walkDir(fullPath);
      }
    } else if (file.endsWith(".js")) {
      processFile(fullPath);
    }
  }
}

walkDir(ROOT_DIR);

console.log("🚀 Export ajouté automatiquement !");
