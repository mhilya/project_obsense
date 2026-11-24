/**
 * Script untuk generate app icon dari logo OBSENSE
 * 
 * Cara pakai:
 * 1. Install sharp: npm install --save-dev sharp
 * 2. Run: node scripts/generate-app-icon.js
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Path ke logo source
const SOURCE_LOGO = path.join(__dirname, '../src/assets/images/Logo Obsense_remove bg.png');

// Output directories untuk Android
const ANDROID_RES = path.join(__dirname, '../android/app/src/main/res');

// Sizes untuk Android
const ANDROID_SIZES = {
  'mipmap-mdpi': 48,
  'mipmap-hdpi': 72,
  'mipmap-xhdpi': 96,
  'mipmap-xxhdpi': 144,
  'mipmap-xxxhdpi': 192,
};

async function generateIcons() {
  console.log('🎨 Generating app icons from OBSENSE logo...\n');

  // Check if source file exists
  if (!fs.existsSync(SOURCE_LOGO)) {
    console.error('❌ Error: Logo source not found at:', SOURCE_LOGO);
    console.error('   Please make sure "Logo Obsense_remove bg.png" exists in src/assets/images/');
    process.exit(1);
  }

  console.log('✅ Source logo found:', SOURCE_LOGO);
  console.log('📁 Output directory:', ANDROID_RES);
  console.log('');

  // Generate for each Android density
  for (const [folder, size] of Object.entries(ANDROID_SIZES)) {
    const outputDir = path.join(ANDROID_RES, folder);
    
    // Create directory if not exists
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
      console.log(`📂 Created directory: ${folder}`);
    }

    // Generate ic_launcher.png
    const outputFile = path.join(outputDir, 'ic_launcher.png');
    await sharp(SOURCE_LOGO)
      .resize(size, size, {
        fit: 'contain',
        background: { r: 59, g: 130, b: 246, alpha: 1 } // Primary blue color
      })
      .png()
      .toFile(outputFile);

    console.log(`✅ Generated: ${folder}/ic_launcher.png (${size}x${size})`);

    // Generate ic_launcher_round.png (same as ic_launcher for simplicity)
    const outputFileRound = path.join(outputDir, 'ic_launcher_round.png');
    await sharp(SOURCE_LOGO)
      .resize(size, size, {
        fit: 'contain',
        background: { r: 59, g: 130, b: 246, alpha: 1 }
      })
      .png()
      .toFile(outputFileRound);

    console.log(`✅ Generated: ${folder}/ic_launcher_round.png (${size}x${size})`);
  }

  console.log('\n✨ All icons generated successfully!');
  console.log('\n📋 Next steps:');
  console.log('   1. cd android');
  console.log('   2. .\\gradlew clean');
  console.log('   3. cd ..');
  console.log('   4. npm run android');
  console.log('\n🎉 Your app icon will be updated!');
}

// Run the script
generateIcons().catch(error => {
  console.error('❌ Error generating icons:', error);
  process.exit(1);
});
