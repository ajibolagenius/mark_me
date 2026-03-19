# Extension Icons

PNG icons are required for Chrome extensions. Generate them from `icon.svg`:

```bash
# Using Inkscape (if available):
inkscape icon.svg -w 16 -h 16 -o icon16.png
inkscape icon.svg -w 32 -h 32 -o icon32.png
inkscape icon.svg -w 48 -h 48 -o icon48.png
inkscape icon.svg -w 128 -h 128 -o icon128.png

# Using ImageMagick:
convert -background none icon.svg -resize 16x16 icon16.png
convert -background none icon.svg -resize 32x32 icon32.png
convert -background none icon.svg -resize 48x48 icon48.png
convert -background none icon.svg -resize 128x128 icon128.png

# Using sharp (Node.js):
npx sharp-cli -i icon.svg -o icon16.png --width 16 --height 16
```

Required files: `icon16.png`, `icon32.png`, `icon48.png`, `icon128.png`
