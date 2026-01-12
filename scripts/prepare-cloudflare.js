#!/usr/bin/env node

/**
 * prepare-cloudflare.js
 * 
 * Converts Next.js .next output to Cloudflare Pages format
 * Cloudflare Pages expects static files in a specific structure
 */

const fs = require('fs');
const path = require('path');

const sourceDir = '.next';
const outputDir = '.vercel/output/static';

// Create output directory
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
  console.log(`✅ Created output directory: ${outputDir}`);
}

// Copy static files
const staticSource = path.join(sourceDir, 'static');
const staticDest = path.join(outputDir, '_next/static');

function copyDir(src, dest) {
  if (!fs.existsSync(src)) {
    console.log(`ℹ️  No source directory: ${src}`);
    return;
  }

  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const files = fs.readdirSync(src);
  files.forEach(file => {
    const srcPath = path.join(src, file);
    const destPath = path.join(dest, file);
    const stat = fs.statSync(srcPath);

    if (stat.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  });
}

// Copy Next.js static assets
copyDir(staticSource, staticDest);
console.log(`✅ Copied Next.js static files to ${staticDest}`);

// Copy public files if they exist
const publicSource = 'public';
const publicDest = path.join(outputDir);

if (fs.existsSync(publicSource)) {
  copyDir(publicSource, publicDest);
  console.log(`✅ Copied public files to ${outputDest}`);
}

console.log('✅ Cloudflare Pages build preparation complete');
