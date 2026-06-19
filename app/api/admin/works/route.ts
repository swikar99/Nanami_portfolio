import { NextRequest, NextResponse } from 'next/server';
import { readLocale, writeLocale } from '@/lib/storage';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
const VALID_LOCALES = ['en', 'ja', 'ne'];

export async function GET(req: NextRequest) {
  const locale = req.nextUrl.searchParams.get('locale') || 'en';
  if (!VALID_LOCALES.includes(locale)) return NextResponse.json({ error: 'Invalid locale' }, { status: 400 });

  const data = await readLocale(locale);
  const work = data.work || {};
  const items = Object.entries(work)
    .filter(([k]) => k !== 'title')
    .map(([key, val]: any) => ({ key, title: val.title, description: val.description }));

  return NextResponse.json({ locale, sectionTitle: work.title || 'My Work', items });
}

export async function POST(req: NextRequest) {
  try {
    const { locale, key, title, description, password } = await req.json();
    if (password !== ADMIN_PASSWORD) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!VALID_LOCALES.includes(locale)) return NextResponse.json({ error: 'Invalid locale' }, { status: 400 });
    if (!key || !title) return NextResponse.json({ error: 'Key and title are required' }, { status: 400 });

    const data = await readLocale(locale);
    if (!data.work) data.work = { title: 'My Work' };
    data.work[key] = { title, description: description || '' };
    await writeLocale(locale, data);

    return NextResponse.json({ success: true, item: { key, title, description } });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { locale, key, password } = await req.json();
    if (password !== ADMIN_PASSWORD) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!VALID_LOCALES.includes(locale)) return NextResponse.json({ error: 'Invalid locale' }, { status: 400 });
    if (!key) return NextResponse.json({ error: 'Key is required' }, { status: 400 });

    const data = await readLocale(locale);
    if (data.work?.[key]) delete data.work[key];
    await writeLocale(locale, data);

    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
