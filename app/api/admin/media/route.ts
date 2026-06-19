import { NextRequest, NextResponse } from 'next/server';
import { readLocale, writeLocale } from '@/lib/storage';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
const VALID_LOCALES = ['en', 'ja', 'ne'];
const META_KEYS = ['title', 'subtitle', 'featured', 'speeches', 'videos'];

export async function GET(req: NextRequest) {
  const locale = req.nextUrl.searchParams.get('locale') || 'en';
  if (!VALID_LOCALES.includes(locale)) return NextResponse.json({ error: 'Invalid locale' }, { status: 400 });

  const data = await readLocale(locale);
  const media = data.media || {};
  const items = Object.entries(media)
    .filter(([k]) => !META_KEYS.includes(k))
    .map(([key, value]) => ({ key, value }));

  return NextResponse.json({
    locale,
    meta: { title: media.title, subtitle: media.subtitle, featured: media.featured, speeches: media.speeches, videos: media.videos },
    items,
  });
}

export async function POST(req: NextRequest) {
  try {
    const { locale, key, value, password } = await req.json();
    if (password !== ADMIN_PASSWORD) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!VALID_LOCALES.includes(locale)) return NextResponse.json({ error: 'Invalid locale' }, { status: 400 });
    if (!key || !value) return NextResponse.json({ error: 'Key and value required' }, { status: 400 });

    const data = await readLocale(locale);
    if (!data.media) data.media = {};
    data.media[key] = value;
    await writeLocale(locale, data);

    return NextResponse.json({ success: true, item: { key, value } });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { locale, key, password } = await req.json();
    if (password !== ADMIN_PASSWORD) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!VALID_LOCALES.includes(locale)) return NextResponse.json({ error: 'Invalid locale' }, { status: 400 });
    if (!key || META_KEYS.includes(key)) return NextResponse.json({ error: 'Cannot delete meta fields' }, { status: 400 });

    const data = await readLocale(locale);
    if (data.media?.[key]) delete data.media[key];
    await writeLocale(locale, data);

    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
