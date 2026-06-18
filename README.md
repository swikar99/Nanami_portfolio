# Nanami Wakayama - Portfolio Website

A beautiful, modern portfolio website showcasing Nanami Wakayama's work as an entrepreneur, model, and social impact leader.

## 🌟 Features

### 🌍 Multi-Language Support
- **English (EN)** - Full translation
- **Japanese (日本語)** - Full translation
- **Nepali (नेपाली)** - Full translation
- Beautiful dropdown language switcher with flags
- Instant translation without page reload
- URL-based routing (`/en`, `/ja`, `/ne`)

### 🎨 Modern Design
- 3D animations with React Three Fiber
- Floating geometric shapes and particle effects
- Glass morphism design
- Smooth scroll animations
- Dark mode support
- Fully responsive (mobile, tablet, desktop)

### 🖼️ Smart Image System
- Automatic image detection
- Graceful fallbacks with emoji icons
- Supports PNG and JPG formats
- No broken images ever

### ✨ Sections
1. **Hero** - Animated profile with gradient ring
2. **About** - Professional bio with highlights
3. **Work** - 6 business projects with links
4. **Media** - Videos and article features
5. **Contact** - Social media links
6. **Footer** - Mission statement

## 🚀 Quick Start

### Development
```bash
npm run dev
```

Visit:
- English: http://localhost:3000/en
- Japanese: http://localhost:3000/ja
- Nepali: http://localhost:3000/ne

### Production Build
```bash
npm run build
npm start
```

## 📁 Project Structure

```
/app
  /[locale]           → Dynamic language routes
    /page.tsx         → Main page with all sections
/components
  /Navigation.tsx     → Navbar with language switcher
  /LanguageSwitcher.tsx → Dropdown menu
  /HeroSection.tsx    → Hero section
  /AboutSection.tsx   → About section
  /WorkSection.tsx    → Work/projects section
  /MediaSection.tsx   → Media section
  /ContactSection.tsx → Contact section
  /Footer.tsx         → Footer
/locales
  /en.json           → English translations (37 keys)
  /ja.json           → Japanese translations (37 keys)
  /ne.json           → Nepali translations (37 keys)
/public/images
  /profile/          → Profile photos
  /projects/         → Business images
  /media/            → Video & article thumbnails
```

## 🌐 Translation Status

**Total Translation Keys:** 37  
**Languages:** 3 (EN, JA, NE)  
**Total Translations:** 111

### All Sections Translated:
✅ Navigation (5 keys)  
✅ Hero Section (5 keys)  
✅ About Section (5 keys)  
✅ Work Section (13 keys)  
✅ Media Section (4 keys)  
✅ Contact Section (3 keys)  
✅ Footer (2 keys)  

## 🖼️ Adding Images

### Current Images (3/14):
- ✅ `profile/nanami-hero.png` - Hero profile
- ✅ `profile/nanami-about.png` - About profile  
- ✅ `projects/himeberry.png` - HIMEBERRY project

### To Add More Images:

1. **Save image with exact filename:**
   - `our-farms.png`, `seplumo.png`, `enwa-tokyo.png`, etc.

2. **Copy to correct folder:**
   ```bash
   cp your-image.png "public/images/projects/our-farms.png"
   ```

3. **Refresh browser** - Image appears automatically!

See [IMAGE_GUIDE.md](public/images/IMAGE_GUIDE.md) for detailed instructions.

## 🔗 Links

### Business Projects:
- [HIMEBERRY](https://www.himeberry.com) - Premium strawberry farming
- [Our Farms](https://thefocus-on.com/wakayama_nanami/) - Sustainable agriculture
- [SEPLUMO](https://seplumo.com/) - Ethical fashion
- [ENWA TOKYO](https://www.enwa-tokyo.com/) - Cultural exchange
- [JOBMATCHY](https://www.jobmatchy.jp/) - Employment platform
- [Lernado School](https://lernado-school.com/) - Education platform

### Social Media:
- [Instagram](https://www.instagram.com/nanami733/)
- [Facebook](https://www.facebook.com/nanami.wakayama.56/)
- [Linktree](https://linktr.ee/Nanaminmin)
- [AWLF](https://awlf.asia/ja/members/nanami-wakayama/)

## 🛠️ Tech Stack

- **Framework:** Next.js 16.1.1 with App Router
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **Animations:** Framer Motion, React Three Fiber
- **i18n:** next-intl v4.6+
- **Icons:** Lucide React
- **Build:** Turbopack

## 📝 Translation Management

### To Add New Translations:

1. Edit `/locales/[lang].json`
2. Add new key-value pair
3. Save - changes appear instantly

### To Add New Language:

1. Add locale to `i18n.ts`
2. Create `/locales/[locale].json`
3. Update `LanguageSwitcher.tsx` with language name and flag
4. Restart dev server

## ✅ Status

**Production Ready** ✨

- ✅ All features working
- ✅ All translations complete
- ✅ All links verified
- ✅ Responsive design
- ✅ No broken images
- ✅ Fast performance
- ✅ SEO friendly

## 📚 Documentation

- [FEATURES.md](FEATURES.md) - Complete feature list
- [IMAGE_GUIDE.md](public/images/IMAGE_GUIDE.md) - Image naming guide
- [TRANSLATION_CHECKLIST.md](TRANSLATION_CHECKLIST.md) - Translation verification
- [CURRENT_STATUS.md](public/images/CURRENT_STATUS.md) - Image status

## 🎯 What Makes This Special

1. **Fully Translated** - Every text in 3 languages
2. **Beautiful Dropdown** - Elegant language switcher
3. **Smart Images** - Auto-detect with fallbacks
4. **3D Effects** - Modern, engaging animations
5. **No Broken Elements** - Everything has graceful fallbacks
6. **Easy to Update** - Just add images or edit JSON

---

**Built with ❤️ for Nanami Wakayama**

*Showcasing social entrepreneurship, sustainable business, and cross-cultural collaboration between Japan and Nepal.*
