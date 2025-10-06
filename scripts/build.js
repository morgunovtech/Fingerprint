#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const srcDir = path.join(root, 'src');
const distDir = path.join(root, 'dist');

function copyDir(src, dest){
  const entries = fs.readdirSync(src, {withFileTypes: true});
  fs.mkdirSync(dest, {recursive: true});
  for (const entry of entries){
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()){
      copyDir(srcPath, destPath);
    } else if (entry.isFile()){
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

if (!fs.existsSync(srcDir)){
  console.error('Source directory not found:', srcDir);
  process.exit(1);
}

fs.rmSync(distDir, {recursive: true, force: true});
fs.mkdirSync(distDir, {recursive: true});
copyDir(srcDir, distDir);

console.log('Build complete. Output directory:', distDir);
