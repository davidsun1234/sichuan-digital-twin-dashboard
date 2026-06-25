import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const requiredFiles = [
  "index.html",
  "styles.css",
  "app.js",
  "assets/sichuan.geojson",
  "README.md",
  "README.en.md",
  "LICENSE"
];

const forbiddenPatterns = [
  /sc-datav/i,
  /styled-components/i,
  /Demo0|Demo1|Demo2|Demo3/,
  /\/sc-datav\//,
  /pmzd/i
];

function read(file) {
  return fs.readFileSync(path.join(root, file), "utf8");
}

let failed = false;

for (const file of requiredFiles) {
  if (!fs.existsSync(path.join(root, file))) {
    console.error(`Missing required file: ${file}`);
    failed = true;
  }
}

const html = read("index.html");
if (!html.includes("./styles.css") || !html.includes("./app.js")) {
  console.error("index.html must reference ./styles.css and ./app.js");
  failed = true;
}

const geojson = JSON.parse(read("assets/sichuan.geojson"));
if (!Array.isArray(geojson.features) || geojson.features.length < 20) {
  console.error("assets/sichuan.geojson should contain Sichuan prefecture-level features");
  failed = true;
}

for (const file of ["index.html", "styles.css", "app.js", "README.md", "README.en.md"]) {
  if (!fs.existsSync(path.join(root, file))) continue;
  const content = read(file);
  for (const pattern of forbiddenPatterns) {
    if (pattern.test(content)) {
      console.error(`Forbidden legacy marker found in ${file}: ${pattern}`);
      failed = true;
    }
  }
}

if (failed) {
  process.exit(1);
}

console.log("Project check passed.");
