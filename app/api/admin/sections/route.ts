import { NextRequest, NextResponse } from 'next/server';
import { readLocale, writeLocale } from '@/lib/storage';

const VALID_LOCALES = ['en', 'ja', 'ne'];
const VALID_SECTIONS = ['nav', 'hero', 'about', 'contact', 'footer'];
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

export async function GET(request: NextRequest) {
  try {
    const locale = request.nextUrl.searchParams.get('locale') || 'en';
    const section = request.nextUrl.searchParams.get('section');

    if (!VALID_LOCALES.includes(locale)) {
      return NextResponse.json({ error: 'Invalid locale' }, { status: 400 });
    }
    if (!section || !VALID_SECTIONS.includes(section)) {
      return NextResponse.json({ error: 'Invalid section' }, { status: 400 });
    }

    const data = await readLocale(locale);
    return NextResponse.json({ locale, section, data: data[section] || {} });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to read section' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { locale, section, key, value, password } = await request.json();

    if (password !== ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (!locale || !VALID_LOCALES.includes(locale)) {
      return NextResponse.json({ error: 'Invalid locale' }, { status: 400 });
    }
    if (!section || !VALID_SECTIONS.includes(section)) {
      return NextResponse.json({ error: 'Invalid section' }, { status: 400 });
    }
    if (!key) {
      return NextResponse.json({ error: 'Key is required' }, { status: 400 });
    }

    const data = await readLocale(locale);
    if (!data[section]) data[section] = {};
    data[section][key] = value;
    await writeLocale(locale, data);

    return NextResponse.json({ success: true, message: `Field '${key}' updated in '${section}'` });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update section', details: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { locale, section, data: sectionData, password } = await request.json();

    if (password !== ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (!locale || !VALID_LOCALES.includes(locale)) {
      return NextResponse.json({ error: 'Invalid locale' }, { status: 400 });
    }
    if (!section || !VALID_SECTIONS.includes(section)) {
      return NextResponse.json({ error: 'Invalid section' }, { status: 400 });
    }

    const data = await readLocale(locale);
    data[section] = sectionData;
    await writeLocale(locale, data);

    return NextResponse.json({ success: true, message: `Section '${section}' updated` });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update section', details: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { locale, section, key, password } = await request.json();

    if (password !== ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (!locale || !VALID_LOCALES.includes(locale)) {
      return NextResponse.json({ error: 'Invalid locale' }, { status: 400 });
    }
    if (!section || !VALID_SECTIONS.includes(section)) {
      return NextResponse.json({ error: 'Invalid section' }, { status: 400 });
    }
    if (!key) {
      return NextResponse.json({ error: 'Key is required' }, { status: 400 });
    }

    const data = await readLocale(locale);
    if (!data[section]?.[key]) {
      return NextResponse.json({ error: 'Field not found' }, { status: 404 });
    }

    delete data[section][key];
    await writeLocale(locale, data);

    return NextResponse.json({ success: true, message: `Field '${key}' deleted from '${section}'` });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete field', details: (error as Error).message },
      { status: 500 }
    );
  }
}
