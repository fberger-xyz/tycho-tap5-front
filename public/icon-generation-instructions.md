# Icon Generation Instructions

The TAP-5 logo SVG is located at: `/public/figma/logo/tap-5-logo.svg`

## Why PNG files are needed

iOS devices don't support SVG files for app icons. When you install a PWA on iPhone/iPad, it requires PNG files in specific sizes.

## Required PNG files

For the PWA to work properly on all devices, including iOS, you need to generate these PNG files from the SVG:

1. **apple-touch-icon.png** (180x180) - For iOS home screen
2. **icon-192x192.png** - For Android/Chrome
3. **icon-512x512.png** - For PWA splash screens

## How to generate the PNG files

### Option 1: Using an online converter (Recommended)

1. Go to https://cloudconvert.com/svg-to-png
2. Upload `/public/figma/logo/tap-5-logo.svg`
3. Set dimensions to 180x180, 192x192, and 512x512
4. Download and place files in `/public/`

### Option 2: Using Sharp (Node.js)

```bash
# Install sharp
pnpm add -D sharp

# Create a script
node -e "
const sharp = require('sharp');
const sizes = [
  { size: 180, name: 'apple-touch-icon.png' },
  { size: 192, name: 'icon-192x192.png' },
  { size: 512, name: 'icon-512x512.png' }
];

sizes.forEach(({ size, name }) => {
  sharp('./public/figma/logo/tap-5-logo.svg')
    .resize(size, size)
    .png()
    .toFile('./public/' + name)
    .then(() => console.log('Generated ' + name));
});
"

# Uninstall sharp after use
pnpm remove sharp
```

### Option 3: Using ImageMagick

```bash
# If you have ImageMagick installed
convert -background transparent -resize 180x180 public/figma/logo/tap-5-logo.svg public/apple-touch-icon.png
convert -background transparent -resize 192x192 public/figma/logo/tap-5-logo.svg public/icon-192x192.png
convert -background transparent -resize 512x512 public/figma/logo/tap-5-logo.svg public/icon-512x512.png
```

## Verification

After generating the PNG files, your `/public` directory should contain:
- apple-touch-icon.png (180x180)
- icon-192x192.png
- icon-512x512.png

The app will now display the TAP-5 logo correctly when installed on iOS devices.