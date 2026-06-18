# Image Upload Guide

This portfolio stores all images in the filesystem (no database required).

## How It Works

1. **Upload via Admin Panel** → Files saved to `/public/images/[category]/`
2. **Or copy files manually** → Place images in the correct folders with correct names
3. **Frontend loads images** → Reads from `/public/images/[category]/`

## Required Image Files

### Hero Section (`/public/images/hero/`)
- `profile.png` (or .jpg, .jpeg, .webp) - Your profile photo

### Work Section (`/public/images/work/`)
- `himeberry.png` (or .jpg, .jpeg, .webp)
- `our-farms.png`
- `seplumo.png`
- `enwa-tokyo.png`
- `jobmatchy.png`
- `lernado.png`

### Media Section (`/public/images/media/`)
**Videos:**
- `tedx.jpg` (or .png, .jpeg, .webp)
- `nepal-earthquake.jpg`

**Articles:**
- `seplumo-interview.jpg`
- `himeberry-delicious.jpg`
- `focus-on.jpg`
- `business-insider.jpg`
- `harajuku-omotesando.jpg`
- `eris-select.jpg`
- `awlf.jpg`
- `facebook-community.jpg`

## Upload Methods

### Method 1: Admin Panel (Easiest)
1. Visit `http://localhost:3000/admin`
2. Login with password from `.env.local`
3. Click on Hero/Work/Media section
4. Click "Click to upload image"
5. File is automatically saved with correct path

### Method 2: Manual Copy (Fastest for bulk)
```bash
# Copy your images to the correct folders
cp ~/Desktop/my-photo.png "public/images/hero/profile.png"
cp ~/Desktop/himeberry.jpg "public/images/work/himeberry.png"
```

### Method 3: Drag & Drop
Just drag your image files into the folders in Finder/File Explorer

## Image Requirements

- **Format**: PNG, JPG, JPEG, WEBP, GIF, or SVG
- **Max Size**: 5MB per image (for admin panel uploads)
- **Naming**: Must match the exact names listed above (case-sensitive)

## Troubleshooting

**Images not showing?**
1. Check filename matches exactly (e.g., `profile.png` not `Profile.png`)
2. Refresh browser (Cmd/Ctrl + Shift + R for hard refresh)
3. Check file is in correct directory: `/public/images/[section]/[filename]`
4. Verify file extension (.png, .jpg, etc.)

**Upload failing in admin panel?**
1. Check browser console (F12 → Console tab)
2. Check terminal where `npm run dev` is running
3. Logs will show exactly what's wrong

## No Database Needed!

This system stores images as regular files in the filesystem. There is no database involved - images are saved directly to `/public/images/` and served from there.
