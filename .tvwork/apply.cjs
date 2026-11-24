// usage: node apply.cjs data-file.cjs   (data file exports { id: { desc, specs: [[label,value],...] } })
const fs = require("fs");
const path = require("path");
const dir = path.join(__dirname, "..", "content", "products");
const data = require(path.resolve(process.argv[2]));
let n = 0;
for (const [id, d] of Object.entries(data)) {
  const f = path.join(dir, id + ".json");
  if (!fs.existsSync(f)) { console.log("MISSING", id); continue; }
  const p = JSON.parse(fs.readFileSync(f, "utf8"));
  if (d.desc !== undefined) p.description = d.desc;
  if (d.specs) p.specs = d.specs.map(([label, value]) => ({ label, value }));
  fs.writeFileSync(f, JSON.stringify(p, null, 2) + "\n");
  n++;
}
console.log("updated", n);
