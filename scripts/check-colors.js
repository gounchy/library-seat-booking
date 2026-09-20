// Quét mã nguồn để chắc chắn mọi màu đều đến từ src/constants/theme.ts.
const fs = require('fs');
const path = require('path');

const SRC = path.join(__dirname, '..', 'src');
const TOKEN_FILE = path.join(SRC, 'constants', 'theme.ts');
const EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.jsx', '.css']);

const HEX = /#[0-9a-fA-F]{3,8}\b/;
const FUNCTIONAL = /\b(?:rgb|rgba|hsl|hsla)\s*\(/;
const NAMED = /['"](?:white|black|red|blue|green|gray|grey|yellow|orange|purple)['"]/;

function listFiles(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      return listFiles(full);
    }
    return EXTENSIONS.has(path.extname(entry.name)) ? [full] : [];
  });
}

let violations = 0;

for (const file of listFiles(SRC)) {
  if (file === TOKEN_FILE) {
    continue;
  }
  const isTest = /\.test\.[jt]sx?$/.test(file);
  const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);

  lines.forEach((line, index) => {
    const found = [];
    if (HEX.test(line)) {
      found.push('hex colour');
    }
    if (FUNCTIONAL.test(line)) {
      found.push('rgb/hsl colour');
    }
    if (!isTest && NAMED.test(line)) {
      found.push('named colour');
    }
    if (found.length > 0) {
      violations += 1;
      const where = path.relative(process.cwd(), file);
      console.log(`${where}:${index + 1}  [${found.join(', ')}]  ${line.trim()}`);
    }
  });
}

if (violations === 0) {
  console.log('OK: no colour literals outside src/constants/theme.ts');
} else {
  console.log(`\n${violations} violation(s). Move the colour into src/constants/theme.ts.`);
}
process.exitCode = violations === 0 ? 0 : 1;