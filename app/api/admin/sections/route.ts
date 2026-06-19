import { NextRequest, NextResponse } from 'next/server';
import { readLocale, writeLocale } from '@/lib/storage';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
const VALID_LOCALES = ['en', 'ja', 'ne'];
const SIMPLE_SECTIONS = ['nav', 'hero', 'about', 'contact', 'footer'];

// GET /api/admin/sections?locale=en&section=hero
export async function GET(req: NextRequest) {
  const locale = req.nextUrl.searchParams.get('locale') || 'en';
  const section = req.nextUrl.searchParams.get('section');

  if (!VALID_LOCALES.includes(locale)) return NextResponse.json({ error: 'Invalid locale' }, { status: 400 });

  const data = await readLocale(locale);

  if (section) {
    if (!SIMPLE_SECTIONS.includes(section)) return NextResponse.json({ error: 'Invalid section' }, { status: 400 });
    return NextResponse.json({ locale, section, data: data[section] || {} });
  }

  // Return all simple sections
  const result: Record<string, any> = {};
  for (const s of SIMPLE_SECTIONS) result[s] = data[s] || {};
  return NextResponse.json({ locale, data: result });
}

// POST /api/admin/sections  { locale, section, key, value, password }
export async function POST(req: NextRequest) {
  try {
    const { locale, section, key, value, password } = await req.json();
    if (password !== ADMIN_PASSWORD) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!VALID_LOCALES.includes(locale)) return NextResponse.json({ error: 'Invalid locale' }, { status: 400 });
    if (!SIMPLE_SECTIONS.includes(section)) return NextResponse.json({ error: 'Invalid section' }, { status: 400 });
    if (!key) return NextResponse.json({ error: 'Key is required' }, { status: 400 });

    const data = await readLocale(locale);
    if (!data[section]) data[section] = {};
    data[section][key] = value;
    await writeLocale(locale, data);

    return NextResponse.json({ success: true, message: `${section}.${key} updated` });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// PUT /api/admin/sections  { locale, section, data, password }  — replace entire section
export async function PUT(req: NextRequest) {
  try {
    const { locale, section, data: sectionData, password } = await req.json();
    if (password !== ADMIN_PASSWORD) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!VALID_LOCALES.includes(locale)) return NextResponse.json({ error: 'Invalid locale' }, { status: 400 });
    if (!SIMPLE_SECTIONS.includes(section)) return NextResponse.json({ error: 'Invalid section' }, { status: 400 });

    const data = await readLocale(locale);
    data[section] = sectionData;
    await writeLocale(locale, data);

    return NextResponse.json({ success: true, message: `${section} saved` });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
