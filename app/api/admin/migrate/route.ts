import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { writeLocale, saveWorkItem, saveMediaItem, saveSocialLink } from '@/lib/storage';
import type { WorkItem, MediaItem, SocialLink } from '@/lib/storage';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

const SEED_WORKS: WorkItem[] = [
  {
    key: 'himeberry', order: 0, icon: '🍓', imageName: 'himeberry',
    imageUrl: '/images/projects/himeberry.png',
    color: 'from-red-400 to-pink-400', link: 'https://www.himeberry.com', videoUrl: '',
    translations: {
      en: { title: 'HIMEBERRY', description: 'Premium strawberry cultivation in Nepal, creating sustainable livelihoods' },
      ja: { title: 'HIMEBERRY', description: 'ネパールでのプレミアムイチゴ栽培、持続可能な生計の創出' },
      ne: { title: 'HIMEBERRY', description: 'नेपालमा प्रिमियम स्ट्रबेरी खेती, दिगो आजीविका सिर्जना' },
    },
  },
  {
    key: 'ourFarms', order: 1, icon: '🌱', imageName: 'our-farms',
    imageUrl: '/images/projects/our-farms.png',
    color: 'from-green-400 to-emerald-400', link: 'https://thefocus-on.com/wakayama_nanami/', videoUrl: '',
    translations: {
      en: { title: 'Our Farms', description: 'Social enterprise connecting farmers to global markets' },
      ja: { title: 'Our Farms', description: '農家をグローバル市場につなぐソーシャルエンタープライズ' },
      ne: { title: 'Our Farms', description: 'किसानहरूलाई वैश्विक बजारसँग जोड्ने सामाजिक उद्यम' },
    },
  },
  {
    key: 'seplumo', order: 2, icon: '👗', imageName: 'seplumo',
    imageUrl: '/images/projects/seplumo.png',
    color: 'from-purple-400 to-pink-400', link: 'https://seplumo.com/', videoUrl: '',
    translations: {
      en: { title: 'SEPLUMO', description: 'Ethical select shop promoting sustainable fashion' },
      ja: { title: 'SEPLUMO', description: '持続可能なファッションを推進するエシカルセレクトショップ' },
      ne: { title: 'SEPLUMO', description: 'दिगो फेसनलाई बढावा दिने नैतिक सेलेक्ट शप' },
    },
  },
  {
    key: 'enwa', order: 3, icon: '🏢', imageName: 'enwa-tokyo',
    imageUrl: '/images/projects/enwa-tokyo.png',
    color: 'from-blue-400 to-cyan-400', link: 'https://www.enwa-tokyo.com/', videoUrl: '',
    translations: {
      en: { title: 'ENWA TOKYO', description: 'Cultural exchange and business development' },
      ja: { title: 'ENWA TOKYO', description: '文化交流とビジネス開発' },
      ne: { title: 'ENWA TOKYO', description: 'सांस्कृतिक आदानप्रदान र व्यापार विकास' },
    },
  },
  {
    key: 'jobmatchy', order: 4, icon: '💼', imageName: 'jobmatchy',
    imageUrl: '/images/projects/jobmatchy.png',
    color: 'from-orange-400 to-yellow-400', link: 'https://www.jobmatchy.jp/', videoUrl: '',
    translations: {
      en: { title: 'JOBMATCHY', description: 'Employment opportunities for international talent in Japan' },
      ja: { title: 'JOBMATCHY', description: '日本での国際的な人材の雇用機会' },
      ne: { title: 'JOBMATCHY', description: 'जापानमा अन्तर्राष्ट्रिय प्रतिभाका लागि रोजगारी अवसर' },
    },
  },
  {
    key: 'lernado', order: 5, icon: '🎓', imageName: 'lernado',
    imageUrl: '/images/projects/lernado.png',
    color: 'from-indigo-400 to-purple-400', link: 'https://lernado-school.com/', videoUrl: '',
    translations: {
      en: { title: 'Lernado School', description: 'Educational platform fostering global learning and development' },
      ja: { title: 'Lernado School', description: 'グローバルな学習と発展を促進する教育プラットフォーム' },
      ne: { title: 'Lernado School', description: 'वैश्विक सिकाइ र विकासलाई बढावा दिने शैक्षिक मञ्च' },
    },
  },
];

// YouTube thumbnail helper
function ytThumb(url: string) {
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/);
  return m ? `https://img.youtube.com/vi/${m[1]}/maxresdefault.jpg` : '';
}

const SEED_MEDIA: MediaItem[] = [
  {
    key: 'tedx', order: 0, type: 'video',
    url: 'https://www.youtube.com/watch?v=m2z6BRkCbSA',
    imageName: 'tedx', thumbnail: '🎤',
    imageUrl: ytThumb('https://www.youtube.com/watch?v=m2z6BRkCbSA'),
    translations: { en: 'TEDx Talk - Social Entrepreneurship', ja: 'TEDxトーク - ソーシャルアントレプレナーシップ', ne: 'TEDx वार्ता - सामाजिक उद्यमशीलता' },
  },
  {
    key: 'nepalEarthquake', order: 1, type: 'video',
    url: 'https://www.youtube.com/watch?v=c0A-E14HvhM',
    imageName: 'nepal-earthquake', thumbnail: '🏔️',
    imageUrl: ytThumb('https://www.youtube.com/watch?v=c0A-E14HvhM'),
    translations: { en: 'Nepal Earthquake Survival Story', ja: 'ネパール地震の生存ストーリー', ne: 'नेपाल भूकम्प बाँच्नुको कथा' },
  },
  {
    key: 'seplumo2019', order: 2, type: 'article',
    url: 'https://seplumo.com/blogs/news/art-of-life-%E3%82%A4%E3%83%B3%E3%82%BF%E3%83%93%E3%83%A5%E3%83%BC-2019-10',
    imageName: 'seplumo-interview', thumbnail: '📰', imageUrl: '',
    translations: { en: 'SEPLUMO - Art of Life Interview 2019', ja: 'SEPLUMO - Art of Life インタビュー 2019', ne: 'SEPLUMO - Art of Life अन्तर्वार्ता २०१९' },
  },
  {
    key: 'himeberryDelicious', order: 3, type: 'article',
    url: 'https://www.delicious-japan.com/posts/20230721-himeberry.html',
    imageName: 'himeberry-delicious', thumbnail: '🍓', imageUrl: '',
    translations: { en: 'HIMEBERRY - Delicious Japan Feature', ja: 'HIMEBERRY - Delicious Japan フィーチャー', ne: 'HIMEBERRY - Delicious Japan फिचर' },
  },
  {
    key: 'focusOn', order: 4, type: 'article',
    url: 'https://thefocus-on.com/wakayama_nanami/',
    imageName: 'focus-on', thumbnail: '🎙️', imageUrl: '',
    translations: { en: 'The Focus On - Nanami Wakayama Profile', ja: 'The Focus On - 若山なな美プロフィール', ne: 'The Focus On - Nanami Wakayama प्रोफाइल' },
  },
  {
    key: 'businessInsider', order: 5, type: 'article',
    url: 'https://www.businessinsider.jp/article/288780/',
    imageName: 'business-insider', thumbnail: '📊', imageUrl: '',
    translations: { en: 'Business Insider Japan Feature', ja: 'Business Insider Japan フィーチャー', ne: 'Business Insider Japan फिचर' },
  },
  {
    key: 'harajuku', order: 6, type: 'article',
    url: 'https://harajuku-omotesando-shimbun.com/archives/2337',
    imageName: 'harajuku-omotesando', thumbnail: '🏙️', imageUrl: '',
    translations: { en: 'Harajuku Omotesando Feature', ja: '原宿表参道フィーチャー', ne: 'Harajuku Omotesando फिचर' },
  },
  {
    key: 'erisSelect', order: 7, type: 'article',
    url: 'https://eris-select.com/things/seplumo/',
    imageName: 'eris-select', thumbnail: '👗', imageUrl: '',
    translations: { en: 'ERIS Select - SEPLUMO Interview', ja: 'ERIS セレクト - SEPLUMO インタビュー', ne: 'ERIS Select - SEPLUMO अन्तर्वार्ता' },
  },
  {
    key: 'awlf', order: 8, type: 'article',
    url: 'https://awlf.or.jp/ja/connect-with-asia-women/nanami-wakayama-ja/',
    imageName: 'awlf', thumbnail: '🌏', imageUrl: '',
    translations: { en: 'Asia Women Leaders Forum', ja: 'アジア女性リーダーズフォーラム', ne: 'एशिया महिला नेता फोरम' },
  },
  {
    key: 'facebookCommunity', order: 9, type: 'article',
    url: 'https://www.facebook.com/groups/1306700827523311/posts/1309221273937933',
    imageName: 'facebook-community', thumbnail: '🌱', imageUrl: '',
    translations: { en: 'Facebook Community - Our Farms Nepal', ja: 'Facebookコミュニティ - Our Farms Nepal', ne: 'Facebook समुदाय - Our Farms Nepal' },
  },
];

const SEED_SOCIALS: SocialLink[] = [
  { key: 'instagram', order: 0, name: 'Instagram', url: 'https://www.instagram.com/nanami733/', icon: 'Instagram', gradient: 'from-purple-600 via-pink-600 to-orange-500' },
  { key: 'facebook', order: 1, name: 'Facebook', url: 'https://www.facebook.com/nanami.wakayama.56/', icon: 'Facebook', gradient: 'from-blue-600 to-blue-700' },
  { key: 'linktree', order: 2, name: 'Linktree', url: 'https://linktr.ee/Nanaminmin', icon: 'Link', gradient: 'from-green-500 to-emerald-600' },
  { key: 'awlf', order: 3, name: 'AWLF', url: 'https://awlf.asia/ja/members/nanami-wakayama/', icon: 'Users', gradient: 'from-blue-500 to-cyan-600' },
];

export async function POST(req: NextRequest) {
  try {
    const { password } = await req.json();
    if (password !== ADMIN_PASSWORD) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const results: Record<string, any> = {};

    // Seed locale files
    for (const locale of ['en', 'ja', 'ne']) {
      try {
        const raw = await readFile(join(process.cwd(), 'locales', `${locale}.json`), 'utf-8');
        await writeLocale(locale, JSON.parse(raw));
        results[`locale_${locale}`] = 'seeded';
      } catch (e: any) {
        results[`locale_${locale}`] = `failed: ${e.message}`;
      }
    }

    // Seed work items
    for (const item of SEED_WORKS) {
      try {
        await saveWorkItem(item);
        results[`work_${item.key}`] = 'seeded';
      } catch (e: any) {
        results[`work_${item.key}`] = `failed: ${e.message}`;
      }
    }

    // Seed media items
    for (const item of SEED_MEDIA) {
      try {
        await saveMediaItem(item);
        results[`media_${item.key}`] = 'seeded';
      } catch (e: any) {
        results[`media_${item.key}`] = `failed: ${e.message}`;
      }
    }

    // Seed social links
    for (const item of SEED_SOCIALS) {
      try {
        await saveSocialLink(item);
        results[`social_${item.key}`] = 'seeded';
      } catch (e: any) {
        results[`social_${item.key}`] = `failed: ${e.message}`;
      }
    }

    return NextResponse.json({ success: true, results });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
