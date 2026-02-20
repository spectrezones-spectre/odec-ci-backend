const fs = require("fs");
const path = require("path");

function processFile(filePath) {
  let content = fs.readFileSync(filePath, "utf8");

  if (!content.includes("export")) return;

  const exportedNames = [];

  // export const
  content = content.replace(/export const (\w+)/g, (_, name) => {
    exportedNames.push(name);
    return `const ${name}`;
  });

  // export async function
  content = content.replace(/export async function (\w+)/g, (_, name) => {
    exportedNames.push(name);
    return `async function ${name}`;
  });

  // export function
  content = content.replace(/export function (\w+)/g, (_, name) => {
    exportedNames.push(name);
    return `function ${name}`;
  });

  // export default
  content = content.replace(/export default (\w+)/g, (_, name) => {
    exportedNames.push(name);
    return `${name}`;
  });

  if (exportedNames.length > 0) {
    content += `\n\nmodule.exports = { ${exportedNames.join(", ")} };`;
  }

  fs.writeFileSync(filePath, content);
}

function scanDir(dir) {
  fs.readdirSync(dir).forEach(file => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      scanDir(fullPath);
    } else if (file.endsWith(".js")) {
      processFile(fullPath);
    }
  });
}

scanDir("./modules");
scanDir("./middlewares");
scanDir("./config");

console.log("Conversion terminée 🚀");
