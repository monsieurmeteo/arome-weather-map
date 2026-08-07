import fs from 'fs';
import path from 'path';

function printFolderDetails(dirPath, depth = 0) {
  try {
    const items = fs.readdirSync(dirPath);
    let totalSize = 0;
    const subdirs = [];
    const files = [];

    for (const item of items) {
      const filePath = path.join(dirPath, item);
      const stat = fs.statSync(filePath);
      if (stat.isDirectory()) {
        subdirs.push({ name: item, path: filePath });
      } else {
        files.push({ name: item, size: stat.size });
        totalSize += stat.size;
      }
    }

    const indent = "  ".repeat(depth);
    console.log(`${indent}${path.basename(dirPath)}/ : ${(totalSize / 1024 / 1024).toFixed(2)} MB of direct files`);

    for (const sub of subdirs) {
      const subSize = printFolderDetails(sub.path, depth + 1);
      totalSize += subSize;
    }
    
    if (depth > 0) {
      return totalSize;
    }
  } catch (e) {
    // Ignore
  }
  return 0;
}

console.log("--- Inspecting .vercel/output/static/ ---");
printFolderDetails(path.resolve(process.cwd(), '.vercel/output/static'));
