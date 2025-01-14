const fs = require('fs');
const path = require('path');
const { createCanvas } = require('canvas');

const assetsDir = path.join(__dirname, '../assets');

// Create assets directory if it doesn't exist
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir);
}

// Function to create a simple PNG file
function createPNG(filename, width, height) {
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Fill with a gradient background
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, '#2196F3');
  gradient.addColorStop(1, '#21CBF3');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  // Add text
  ctx.fillStyle = 'white';
  ctx.font = `${width / 10}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('TalkToDev', width / 2, height / 2);

  // Save the file
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(path.join(assetsDir, filename), buffer);
}

const assets = [
  { name: 'icon.png', width: 1024, height: 1024 },
  { name: 'splash.png', width: 2048, height: 2048 },
  { name: 'adaptive-icon.png', width: 1024, height: 1024 },
  { name: 'favicon.png', width: 32, height: 32 }
];

assets.forEach(asset => {
  createPNG(asset.name, asset.width, asset.height);
  console.log(`Created ${asset.name} (${asset.width}x${asset.height})`);
}); 