import fs from 'fs';
import path from 'path';

const targetDir = path.resolve(process.cwd(), '.vercel/output/static/archives_orage');

if (fs.existsSync(targetDir)) {
  console.log("Removing bulky archives_orage folder from .vercel/output/static...");
  fs.rmSync(targetDir, { recursive: true, force: true });
  console.log("Folder removed successfully!");
} else {
  console.log("Folder archives_orage not found in .vercel/output/static");
}
