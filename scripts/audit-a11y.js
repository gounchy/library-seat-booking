// Cách dùng: node scripts/audit-a11y.js <ui.xml> <density-dpi>
// Kiểm tra mọi phần tử bấm được: phải có nhãn và có vùng chạm tối thiểu 44 x 44 dp.
const fs = require('fs');

const MIN_DP = 44;
const [file, densityArg] = process.argv.slice(2);

if (!file || !densityArg) {
  console.log('Usage: node scripts/audit-a11y.js <ui.xml> <density-dpi>');
  process.exit(1);
}

const pxPerDp = Number(densityArg) / 160;
const xml = fs.readFileSync(file, 'utf8');
const nodes = xml.match(/<node\s[^>]*>/g) ?? [];

function attr(node, name) {
  const match = node.match(new RegExp(`\\s${name}="([^"]*)"`));
  return match ? match[1] : '';
}

let checked = 0;
let problems = 0;

for (const node of nodes) {
  if (attr(node, 'clickable') !== 'true' || attr(node, 'enabled') !== 'true') {
    continue;
  }
  const bounds = attr(node, 'bounds').match(/\[(\d+),(\d+)\]\[(\d+),(\d+)\]/);
  if (!bounds) {
    continue;
  }
  const [x1, y1, x2, y2] = bounds.slice(1).map(Number);
  const widthDp = Math.round((x2 - x1) / pxPerDp);
  const heightDp = Math.round((y2 - y1) / pxPerDp);
  const label = attr(node, 'content-desc') || attr(node, 'text');
  const kind = attr(node, 'class').split('.').pop();

  const issues = [];
  if (!label) {
    issues.push('no label');
  }
  if (widthDp < MIN_DP || heightDp < MIN_DP) {
    issues.push(`target ${widthDp}x${heightDp}dp is below ${MIN_DP}x${MIN_DP}`);
  }

  checked += 1;
  if (issues.length > 0) {
    problems += 1;
  }
  const status = issues.length === 0 ? 'OK  ' : 'FAIL';
  const note = issues.length === 0 ? '' : ` <- ${issues.join(', ')}`;
  console.log(`${status} ${kind} "${label || '(none)'}" ${widthDp}x${heightDp}dp${note}`);
}

console.log(`\nChecked ${checked} clickable elements, ${problems} with problems.`);
process.exitCode = problems === 0 ? 0 : 1;