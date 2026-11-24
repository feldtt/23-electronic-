// usage: node parse-batch.cjs batch.txt   -> applies desc+specs to content/products by model code
const fs = require("fs");
const path = require("path");
const dir = path.join(__dirname, "..", "content", "products");
const txt = fs.readFileSync(path.resolve(process.argv[2]), "utf8").replace(/\r/g, "");
const norm = (s) => String(s).toUpperCase().replace(/[^A-Z0-9]/g, "");
const byModel = {};
for (const f of fs.readdirSync(dir)) {
  const p = JSON.parse(fs.readFileSync(path.join(dir, f), "utf8"));
  if (p.category === "tv") byModel[norm(p.model || "")] = f;
}
const notes = [];
let n = 0;
for (const block of txt.split(/\n-{10,}\n/)) {
  const mm = block.match(/^\s*MODEL:\s*(.+)$/m);
  if (!mm) continue;
  const model = mm[1].trim();
  const file = byModel[norm(model)];
  if (!file) { console.log("NO PRODUCT FOR", model); continue; }
  const dm = block.split(/^DESKRIPSI:\s*$/m)[1];
  const [descRaw, rest] = dm.split(/^SPESIFIKASI:\s*$/m);
  const desc = descRaw.trim().split("\n").map((l) => l.trimEnd()).join("\r\n");
  const specPart = rest.split(/^Catatan:/m)[0];
  const specs = [];
  for (const line of specPart.split("\n")) {
    const m = line.match(/^([^:]{2,60}):\s*(.+)$/);
    if (m) specs.push({ label: m[1].trim(), value: m[2].trim() });
  }
  const cm = rest.match(/^Catatan:\s*(.+)$/m);
  if (cm) notes.push(`${model}: ${cm[1].trim()}`);
  const fp = path.join(dir, file);
  const p = JSON.parse(fs.readFileSync(fp, "utf8"));
  p.description = desc;
  p.specs = specs;
  fs.writeFileSync(fp, JSON.stringify(p, null, 2) + "\n");
  console.log("OK", file, specs.length, "spek");
  n++;
}
console.log("updated", n);
if (notes.length) console.log("\nCATATAN:\n" + notes.join("\n"));
