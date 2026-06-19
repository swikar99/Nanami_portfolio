import { NextRequest, NextResponse } from 'next/server';
import { readLocale, writeLocale } from '@/lib/storage';

const VALID_LOCALES = ['en', 'ja', 'ne'];

export async function GET(request: NextRequest) {
  try {
    const locale = request.nextUrl.searchParams.get('locale');

    if (locale && !VALID_LOCALES.includes(locale)) {
      return NextResponse.json({ error: 'Invalid locale' }, { status: 400 });
    }

    if (locale) {
      const content = await readLocale(locale);
      return NextResponse.json({ locale, content });
    }

    const allLocales: Record<string, any> = {};
    for (const loc of VALID_LOCALES) {
      allLocales[loc] = await readLocale(loc);
    }
    return NextResponse.json(allLocales);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to read locale files' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { locale, content, password } = await request.json();

    if (password !== (process.env.ADMIN_PASSWORD || 'admin123')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!locale || !VALID_LOCALES.includes(locale)) {
      return NextResponse.json({ error: 'Invalid locale' }, { status: 400 });
    }

    if (!content) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    const parsed = typeof content === 'string' ? JSON.parse(content) : content;
    await writeLocale(locale, parsed);

    return NextResponse.json({ success: true, message: `${locale}.json updated successfully` });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update locale file', details: (error as Error).message },
      { status: 500 }
    );
  }
}
