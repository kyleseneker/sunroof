#!/usr/bin/env node
/**
 * Generate splash screen with the actual icon.svg
 */

const sharp = require('sharp');
const path = require('path');

const splashSvg = (width, height) => {
  const iconSize = Math.min(width, height) * 0.28;
  const scale = iconSize / 512;
  const centerX = width / 2;
  const centerY = height / 2 - height * 0.05;
  const translateX = centerX - 256 * scale;
  const translateY = centerY - 256 * scale;

  // App gradient colors from src/constants/theme.ts
  const gradientStart = '#451a03'; // Dark amber
  const gradientMid = '#431407';   // Dark orange
  const gradientEnd = '#1e1b4b';   // Dark indigo

  return `
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <linearGradient id="bgGradient" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="${gradientStart}"/>
      <stop offset="50%" stop-color="${gradientMid}"/>
      <stop offset="100%" stop-color="${gradientEnd}"/>
    </linearGradient>
  </defs>
  
  <!-- Background - matches app gradient -->
  <rect width="${width}" height="${height}" fill="url(#bgGradient)"/>
  
  <!-- Sun icon (from icon.svg) -->
  <g transform="translate(${translateX}, ${translateY}) scale(${scale})">
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
  </g>
  
  <!-- App name -->
  <text x="${centerX}" y="${centerY + iconSize * 0.65}" 
        font-family="Helvetica Neue, Helvetica, Arial, sans-serif" 
        font-size="${iconSize * 0.28}" 
        font-weight="300" 
        fill="white" 
        text-anchor="middle">
    Sunroof
  </text>
  
  <!-- Tagline -->
  <text x="${centerX}" y="${centerY + iconSize * 0.88}" 
        font-family="Helvetica Neue, Helvetica, Arial, sans-serif" 
        font-size="${iconSize * 0.11}" 
        font-weight="400" 
        fill="rgba(255,255,255,0.5)" 
        text-anchor="middle">
    Capture now, relive later
  </text>
</svg>`;
};

async function generateSplashImages() {
  const assetsDir = path.join(__dirname, '..', 'assets');
  const outputDir = path.join(__dirname, '..', 'ios', 'Sunroof', 'Images.xcassets', 'SplashScreenLegacy.imageset');
  
  console.log('Generating splash screen images...');

  const sizes = [
    { name: 'image.png', width: 414, height: 736 },
    { name: 'image@2x.png', width: 828, height: 1472 },
    { name: 'image@3x.png', width: 1242, height: 2208 },
  ];

  for (const size of sizes) {
    await sharp(Buffer.from(splashSvg(size.width, size.height)))
      .png()
      .toFile(path.join(outputDir, size.name));
    console.log(`Generated ${size.name} (${size.width}x${size.height})`);
  }
  
  // Generate splash-icon.png
  const iconSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
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
</svg>`;
  
  await sharp(Buffer.from(iconSvg))
    .png()
    .toFile(path.join(assetsDir, 'splash-icon.png'));
  console.log('Updated assets/splash-icon.png');
  
  console.log('Done!');
}

generateSplashImages().catch(console.error);
