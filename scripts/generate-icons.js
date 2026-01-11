/**
 * Generate app icons from SVG
 * Run with: node scripts/generate-icons.js
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const ASSETS_DIR = path.join(__dirname, '../assets');
const SVG_PATH = path.join(ASSETS_DIR, 'source/icon.svg');

// Read SVG and add background for app icons
const svgContent = fs.readFileSync(SVG_PATH, 'utf8');

// Create SVG with warm gradient background for app icon
const createIconSvg = (size, withBackground = true) => {
  if (!withBackground) {
    return Buffer.from(svgContent);
  }
  
  // Add gradient background
  const svgWithBg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="${size}" height="${size}">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#451a03"/>
          <stop offset="50%" stop-color="#431407"/>
          <stop offset="100%" stop-color="#1e1b4b"/>
        </linearGradient>
      </defs>
      <rect width="512" height="512" fill="url(#bg)"/>
      <circle cx="256" cy="256" r="80" fill="none" stroke="#f97316" stroke-width="12"/>
      <g stroke="#f97316" stroke-width="12" stroke-linecap="round">
        <line x1="256" y1="80" x2="256" y2="130"/>
        <line x1="256" y1="382" x2="256" y2="432"/>
        <line x1="80" y1="256" x2="130" y2="256"/>
        <line x1="382" y1="256" x2="432" y2="256"/>
        <line x1="131" y1="131" x2="166" y2="166"/>
        <line x1="346" y1="346" x2="381" y2="381"/>
        <line x1="131" y1="381" x2="166" y2="346"/>
        <line x1="346" y1="166" x2="381" y2="131"/>
      </g>
    </svg>
  `;
  return Buffer.from(svgWithBg);
};

// Create splash icon (just the sun, no background - Expo handles bg)
const createSplashSvg = (size) => {
  const splashSvg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="${size}" height="${size}">
      <circle cx="256" cy="256" r="80" fill="none" stroke="#f97316" stroke-width="12"/>
      <g stroke="#f97316" stroke-width="12" stroke-linecap="round">
        <line x1="256" y1="80" x2="256" y2="130"/>
        <line x1="256" y1="382" x2="256" y2="432"/>
        <line x1="80" y1="256" x2="130" y2="256"/>
        <line x1="382" y1="256" x2="432" y2="256"/>
        <line x1="131" y1="131" x2="166" y2="166"/>
        <line x1="346" y1="346" x2="381" y2="381"/>
        <line x1="131" y1="381" x2="166" y2="346"/>
        <line x1="346" y1="166" x2="381" y2="131"/>
      </g>
    </svg>
  `;
  return Buffer.from(splashSvg);
};

async function generateIcons() {
  console.log('Generating app icons...');
  
  // App icon (1024x1024 with background)
  await sharp(createIconSvg(1024, true))
    .resize(1024, 1024)
    .png()
    .toFile(path.join(ASSETS_DIR, 'icon.png'));
  console.log('✓ icon.png (1024x1024)');
  
  // Adaptive icon for Android (foreground only, with padding)
  await sharp(createIconSvg(1024, true))
    .resize(1024, 1024)
    .png()
    .toFile(path.join(ASSETS_DIR, 'adaptive-icon.png'));
  console.log('✓ adaptive-icon.png (1024x1024)');
  
  // Splash icon (just the sun logo, 200x200)
  await sharp(createSplashSvg(200))
    .resize(200, 200)
    .png()
    .toFile(path.join(ASSETS_DIR, 'splash-icon.png'));
  console.log('✓ splash-icon.png (200x200)');
  
  // Favicon (48x48) - transparent, sun only
  await sharp(createSplashSvg(48))
    .resize(48, 48)
    .png()
    .toFile(path.join(ASSETS_DIR, 'favicon.png'));
  console.log('✓ favicon.png (48x48, transparent)');
  
  // Icon transparent (128x128) - for in-app UI use
  await sharp(createSplashSvg(128))
    .resize(128, 128)
    .png()
    .toFile(path.join(ASSETS_DIR, 'icon-transparent.png'));
  console.log('✓ icon-transparent.png (128x128, transparent)');
  
  console.log('\nDone! All icons generated in assets/');
}

generateIcons().catch(console.error);

