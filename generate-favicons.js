import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

// Generate 24 spokes for Ashoka Chakra SVG
let spokesHtml = '';
for (let i = 0; i < 24; i++) {
  const angle = i * 15;
  spokesHtml += `<line x1="0" y1="0" x2="0" y2="-30" transform="rotate(${angle})" stroke="#000080" stroke-width="2"/>`;
}

const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="saffronGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FF9933"/>
      <stop offset="100%" stop-color="#E65100"/>
    </linearGradient>
    <linearGradient id="greenGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#138808"/>
      <stop offset="100%" stop-color="#085203"/>
    </linearGradient>
    <linearGradient id="blueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#000080"/>
      <stop offset="100%" stop-color="#1565C0"/>
    </linearGradient>
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="2" stdDeviation="3" flood-opacity="0.15"/>
    </filter>
  </defs>

  <!-- Crisp White Background Circle -->
  <circle cx="256" cy="256" r="252" fill="#FFFFFF"/>

  <!-- Outer Ring Saffron Arc Top -->
  <path d="M 105 160 A 205 205 0 0 1 425 145" fill="none" stroke="url(#saffronGrad)" stroke-width="30" stroke-linecap="round"/>

  <!-- Outer Ring Green Arc Bottom -->
  <path d="M 415 365 A 205 205 0 0 1 95 315" fill="none" stroke="url(#greenGrad)" stroke-width="30" stroke-linecap="round"/>

  <!-- Inner Swashes -->
  <path d="M 125 210 A 165 165 0 0 1 365 110" fill="none" stroke="url(#greenGrad)" stroke-width="20" stroke-linecap="round"/>
  <path d="M 370 120 A 165 165 0 0 1 435 225" fill="none" stroke="url(#saffronGrad)" stroke-width="20" stroke-linecap="round"/>
  <path d="M 420 300 A 175 175 0 0 1 170 425" fill="none" stroke="url(#greenGrad)" stroke-width="22" stroke-linecap="round"/>
  <path d="M 140 410 A 195 195 0 0 1 370 410" fill="none" stroke="url(#saffronGrad)" stroke-width="18" stroke-linecap="round"/>

  <!-- Signal / Wi-Fi Waves top-right -->
  <path d="M 385 110 A 35 35 0 0 1 420 145" fill="none" stroke="#138808" stroke-width="11" stroke-linecap="round"/>
  <path d="M 400 92 A 55 55 0 0 1 445 137" fill="none" stroke="#138808" stroke-width="11" stroke-linecap="round"/>

  <!-- Globe Network Grid -->
  <g fill="none">
    <circle cx="256" cy="215" r="90" stroke="#000080" stroke-width="8"/>
    <ellipse cx="256" cy="215" rx="90" ry="45" stroke="#000080" stroke-width="6"/>
    <ellipse cx="256" cy="215" rx="90" ry="18" stroke="#000080" stroke-width="5"/>
    <line x1="256" y1="125" x2="256" y2="305" stroke="#000080" stroke-width="6"/>
  </g>

  <!-- Network Nodes -->
  <circle cx="256" cy="125" r="9" fill="#FF9933"/>
  <circle cx="180" cy="175" r="9" fill="#000080"/>
  <circle cx="332" cy="175" r="9" fill="#FF9933"/>
  <circle cx="205" cy="235" r="7" fill="#000080"/>
  <circle cx="310" cy="235" r="7" fill="#000080"/>

  <!-- Blue Avatar/User Silhouette in Globe center -->
  <g fill="#000080">
    <circle cx="256" cy="180" r="22"/>
    <path d="M 216 250 C 216 215 296 215 296 250 C 296 270 216 270 216 250 Z"/>
  </g>

  <!-- Ashoka Chakra Wheel on Right -->
  <g transform="translate(352, 245)">
    <circle cx="0" cy="0" r="32" stroke="#000080" stroke-width="5" fill="#FFFFFF"/>
    <circle cx="0" cy="0" r="30" stroke="#000080" stroke-width="2" fill="none"/>
    <circle cx="0" cy="0" r="6" fill="#000080"/>
    ${spokesHtml}
  </g>

  <!-- Shopping Cart Icon on Left -->
  <g transform="translate(112, 230)" fill="none" stroke="#FF9933" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">
    <path d="M 0 0 L 8 0 L 16 22 L 38 22 L 44 8 L 12 8 Z"/>
    <circle cx="18" cy="29" r="3.5" fill="#FF9933"/>
    <circle cx="35" cy="29" r="3.5" fill="#FF9933"/>
  </g>

  <!-- Prominent Green CSC 'D' Symbol -->
  <g transform="translate(150, 235)">
    <!-- Base D -->
    <path d="M 20 20 L 60 20 C 115 20 140 45 140 85 C 140 125 115 150 60 150 L 20 150 Z" 
          fill="url(#greenGrad)" stroke="#085203" stroke-width="5"/>
    <path d="M 50 48 L 60 48 C 90 48 106 62 106 85 C 106 108 90 122 60 122 L 50 122 Z" 
          fill="#FFFFFF"/>

    <!-- White Hand with Blue Outline over D -->
    <g transform="translate(-15, 30)">
      <path d="M 18 55 C 10 40 24 28 35 38 L 48 24 C 55 16 66 24 58 35 L 68 24 C 75 16 86 24 78 35 L 85 28 C 92 20 102 30 92 42 L 72 75 C 58 92 32 90 18 70 Z" 
            fill="#FFFFFF" stroke="#000080" stroke-dasharray="none" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
      <!-- Inner Finger lines for hand details -->
      <path d="M 45 42 L 35 55 M 56 42 L 48 55 M 66 42 L 58 55" stroke="#000080" stroke-width="4" stroke-linecap="round"/>
    </g>
  </g>
</svg>`;

async function generateFavicons() {
  const publicDir = path.join(process.cwd(), 'public');
  const distDir = path.join(process.cwd(), 'dist');

  // Save SVG
  fs.writeFileSync(path.join(publicDir, 'favicon.svg'), svgContent);
  console.log('Saved favicon.svg');

  const svgBuffer = Buffer.from(svgContent);

  // Generate PNGs at various resolutions
  const sizes = [
    { name: 'favicon.png', size: 512 },
    { name: 'apple-touch-icon.png', size: 180 },
    { name: 'favicon-32x32.png', size: 32 },
    { name: 'favicon-16x16.png', size: 16 },
    { name: 'favicon.ico', size: 48 }, // ICO fallback as PNG
  ];

  for (const item of sizes) {
    const outputPath = path.join(publicDir, item.name);
    await sharp(svgBuffer)
      .resize(item.size, item.size)
      .png()
      .toFile(outputPath);
    console.log(`Generated ${item.name} (${item.size}x${item.size})`);

    // If dist exists, copy there too
    if (fs.existsSync(distDir)) {
      fs.copyFileSync(outputPath, path.join(distDir, item.name));
      fs.copyFileSync(path.join(publicDir, 'favicon.svg'), path.join(distDir, 'favicon.svg'));
    }
  }

  console.log('All favicons generated successfully!');
}

generateFavicons().catch(console.error);
