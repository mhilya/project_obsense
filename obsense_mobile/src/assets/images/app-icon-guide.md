# OBSENSE App Icon Guide

## Icon Design Specifications

### Visual Design
- **Background**: Blue gradient (`#3B82F6` to `#2563EB`) or solid blue `#3B82F6`
- **Foreground**: White letter "O" or health symbol
- **Style**: Modern, clean, professional
- **Corner Radius**: iOS style rounded square

### Color Palette
```
Primary Blue: #3B82F6
Dark Blue: #2563EB
White: #FFFFFF
```

## Size Requirements

### Android
- **Adaptive Icon**: 512x512px (foreground + background)
- **Legacy Icon**: 512x512px
- **Locations**:
  ```
  android/app/src/main/res/
    ├── mipmap-hdpi/ (72x72)
    ├── mipmap-mdpi/ (48x48)
    ├── mipmap-xhdpi/ (96x96)
    ├── mipmap-xxhdpi/ (144x144)
    └── mipmap-xxxhdpi/ (192x192)
  ```

### iOS
- **App Icon**: 1024x1024px
- **Location**:
  ```
  ios/ObsenseMobile/Images.xcassets/AppIcon.appiconset/
  ```

## Design Options

### Option 1: Letter "O"
- Large white "O" letter (SF Pro / System Bold)
- Centered on blue background
- Simple and memorable

### Option 2: Heart Symbol
- White heart icon (health theme)
- Centered on blue background
- Medical/wellness association

### Option 3: Combined
- Letter "O" with small heart accent
- More detailed, brand-specific

## Tools for Generation

1. **App Icon Generator** - https://appicon.co/
   - Upload 1024x1024 source
   - Exports all required sizes

2. **Figma** - Create custom design
   - Export as PNG at 1024x1024
   - Use above generator

3. **React Native Asset Generator**
   ```bash
   npm install -g yo generator-rn-toolbox
   yo rn-toolbox:assets --icon icon-source.png
   ```

## Implementation Steps

1. **Create/Export Icon**
   - Design at 1024x1024px
   - Export as PNG (no transparency for background)

2. **Generate All Sizes**
   - Use app icon generator
   - Download Android + iOS packages

3. **Android Setup**
   - Replace files in `android/app/src/main/res/mipmap-*`
   - Update `android/app/src/main/res/values/strings.xml` if needed

4. **iOS Setup**
   - Replace files in `ios/ObsenseMobile/Images.xcassets/AppIcon.appiconset/`
   - Ensure Contents.json is properly configured

5. **Clean Build**
   ```bash
   # Android
   cd android
   ./gradlew clean
   cd ..

   # iOS
   cd ios
   pod install
   cd ..
   
   # Rebuild
   npm run android
   npm run ios
   ```

## Example Icon Code (SVG Template)

```svg
<svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
  <!-- Background with rounded corners -->
  <rect width="1024" height="1024" rx="226" fill="url(#gradient)"/>
  
  <!-- Gradient definition -->
  <defs>
    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#3B82F6;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#2563EB;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Letter "O" -->
  <text 
    x="512" 
    y="680" 
    font-family="system-ui, -apple-system, sans-serif" 
    font-size="600" 
    font-weight="700" 
    fill="white" 
    text-anchor="middle">O</text>
</svg>
```

Save this as `app-icon.svg` and convert to PNG at 1024x1024 using any SVG to PNG converter.

## Verification

After implementation:
- [ ] Check icon on home screen (Android & iOS)
- [ ] Check icon in app drawer/search
- [ ] Check icon in settings
- [ ] Verify no pixelation or distortion
- [ ] Test on different device sizes

## Notes

- iOS icons should NOT have transparency (fill background)
- Android adaptive icons have foreground + background layers
- Always test on actual devices after deployment
- Consider seasonal/special edition icons for holidays

---

**Created**: September 23, 2026
**For**: OBSENSE Mobile Application
