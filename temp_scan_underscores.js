const fs = require('fs');
const path = require('path');
const root = path.join(process.cwd(), 'SRC', 'screens');
function walk(dir) {
  let res = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) res = res.concat(walk(p));
    else if (p.endsWith('.tsx')) res.push(p);
  }
  return res;
}
const pattern = /(['"])([^'"\\]*_[^'"\\]*)\1/g;
for (const file of walk(root)) {
  const text = fs.readFileSync(file, 'utf8');
  const lines = text.split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.includes('Text') || line.includes('placeholder') || line.includes('title=') || line.includes('typeCode') || line.includes('button')) {
      let m;
      while ((m = pattern.exec(line)) !== null) {
        console.log(`${path.relative(process.cwd(), file)}:${i + 1}: ${m[2]}`);
      }
    }
  }
}
