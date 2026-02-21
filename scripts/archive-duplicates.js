const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const root = process.cwd();
const excludeDirs = new Set(['.git', 'node_modules', 'archive', '.next', 'dist', 'out']);
const fileMap = new Map();

function walk(dir) {
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    const rel = path.relative(root, full);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      if (excludeDirs.has(name)) continue;
      walk(full);
    } else if (stat.isFile()) {
      const base = path.basename(name);
      if (!fileMap.has(base)) fileMap.set(base, []);
      fileMap.get(base).push(rel.replace(/\\/g, '/'));
    }
  }
}

walk(root);

const toArchive = [];
for (const [base, paths] of fileMap) {
  if (paths.length <= 1) continue;

  // choose keeper
  let keeper = paths.find(p => p.includes('/digital-twin/src/')) || paths[0];

  for (const p of paths) {
    if (p === keeper) continue;
    toArchive.push({from: p, keeper});
  }
}

if (toArchive.length === 0) {
  console.log('No duplicate files found.');
  process.exit(0);
}

for (const item of toArchive) {
  const src = item.from;
  const dest = path.posix.join('archive/duplicates', src);
  const destDir = path.dirname(dest);
  try {
    fs.mkdirSync(destDir, { recursive: true });
    // Try git mv first to preserve history
    try {
      execSync(`git mv -- "${src}" "${dest}"`, { stdio: 'inherit' });
      console.log(`git mv ${src} -> ${dest}`);
    } catch (err) {
      // fallback to fs.rename
      const absSrc = path.join(root, src);
      const absDest = path.join(root, dest);
      fs.renameSync(absSrc, absDest);
      console.log(`fs.rename ${src} -> ${dest}`);
    }
  } catch (err) {
    console.error('Failed to move', src, err.message);
  }
}

console.log(`Archived ${toArchive.length} duplicate files to archive/duplicates/`);
