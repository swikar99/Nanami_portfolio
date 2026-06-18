# Image Naming Guide for Nanami Wakayama Portfolio

## 📋 Current Image Status

### ✅ Already Added:
- `profile/nanami-hero.png` - Hero section profile photo
- `profile/nanami-about.png` - About section profile photo
- `projects/himeberry.png` - HIMEBERRY project image

### ⏳ Still Needed (5 Project Images):
- `projects/our-farms.png` or `.jpg` - Our Farms株式会社
- `projects/seplumo.png` or `.jpg` - SEPLUMO ethical fashion
- `projects/enwa-tokyo.png` or `.jpg` - ENWA TOKYO
- `projects/jobmatchy.png` or `.jpg` - JOBMATCHY
- `projects/lernado.png` or `.jpg` - Lernado School

### 📺 Optional (Media Section):
- `media/video-1.jpg` - TEDx Talk thumbnail
- `media/video-2.jpg` - Nepal Earthquake Story thumbnail
- `media/article-1.jpg` through `article-8.jpg` - Article thumbnails

---

## 📁 Folder Structure

```
public/images/
├── profile/           ← Profile photos
│   ├── nanami-hero.png       ✅ Added
│   └── nanami-about.png      ✅ Added
├── projects/          ← Business/project images
│   ├── himeberry.png         ✅ Added
│   ├── our-farms.png         ⏳ Needed
│   ├── seplumo.png           ⏳ Needed
│   ├── enwa-tokyo.png        ⏳ Needed
│   ├── jobmatchy.png         ⏳ Needed
│   └── lernado.png           ⏳ Needed
└── media/             ← Video & article thumbnails
    ├── video-1.jpg           📺 Optional
    ├── video-2.jpg           📺 Optional
    └── article-1.jpg to 8    📺 Optional
```

---

## 🎯 How to Add Images

### Method 1: Direct Copy
```bash
# From your image location, copy to the portfolio:
cp your-image.png "/Users/swikarsingh/Desktop/Nanami portfolio /public/images/projects/our-farms.png"
```

### Method 2: File Manager
1. Navigate to: `/Users/swikarsingh/Desktop/Nanami portfolio /public/images/`
2. Open the appropriate folder (`profile/`, `projects/`, or `media/`)
3. Copy your image file there
4. Rename it to match the exact name needed (see lists above)

### Method 3: Drag and Drop
- Drag your images into the correct folder
- Rename them to match the exact filenames listed above

---

## 📐 Recommended Image Sizes

| Type | Size | Aspect Ratio | Notes |
|------|------|--------------|-------|
| **Hero Profile** | 800×800px | 1:1 (square) | Displayed in circular frame |
| **About Profile** | 1200×1200px | 1:1 (square) | Full image display |
| **Project Images** | 1200×800px | 3:2 (landscape) | Shown with text overlay |
| **Video Thumbnails** | 1920×1080px | 16:9 | Standard YouTube size |
| **Article Images** | 800×600px | 4:3 | Small card display |

---

## 🎨 Image Format Support

- **Preferred**: PNG (for transparency and quality)
- **Alternative**: JPG (for smaller file sizes)
- **Automatic Fallback**: The site tries PNG first, then JPG, then shows emoji/icon

---

## 💡 What Happens Without Images?

If you don't add an image, the portfolio automatically shows beautiful fallbacks:

### Projects (without images):
- 🍓 HIMEBERRY - Pink/red gradient background
- 🌱 Our Farms - Green gradient background
- 👗 SEPLUMO - Purple gradient background
- 🏢 ENWA TOKYO - Blue gradient background
- 💼 JOBMATCHY - Orange gradient background
- 🎓 Lernado - Indigo gradient background

### Media (without images):
- Videos show 🎤 and 🏔️ emoji icons
- Articles show FileText/Mic icons

**The portfolio looks great either way!** Images are optional but recommended for a more professional appearance.

---

## 🚀 Quick Start

1. **Prepare your images** - Resize to recommended dimensions
2. **Rename them** - Use exact names from the lists above
3. **Copy to folders** - Place in `/public/images/profile/`, `/projects/`, or `/media/`
4. **Refresh browser** - Images appear automatically!

**No code changes needed!** Just add the images with the correct names.
