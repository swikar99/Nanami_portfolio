import { NextRequest, NextResponse } from 'next/server';
import { readLocale, writeLocale } from '@/lib/storage';

const VALID_LOCALES = ['en', 'ja', 'ne'];
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

export async function GET(request: NextRequest) {
  try {
    const locale = request.nextUrl.searchParams.get('locale') || 'en';

    if (!VALID_LOCALES.includes(locale)) {
      return NextResponse.json({ error: 'Invalid locale' }, { status: 400 });
    }

    const data = await readLocale(locale);
    const work = data.work || {};

    const items = Object.entries(work)
      .filter(([key]) => key !== 'title')
      .map(([key, value]: [string, any]) => ({
        key,
        title: value.title || '',
        description: value.description || '',
      }));

    return NextResponse.json({ locale, title: work.title || 'Work', items });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to read work items' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { locale, key, title, description, password } = await request.json();

    if (password !== ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (!locale || !VALID_LOCALES.includes(locale)) {
      return NextResponse.json({ error: 'Invalid locale' }, { status: 400 });
    }
    if (!key || !title || !description) {
      return NextResponse.json({ error: 'Key, title, and description are required' }, { status: 400 });
    }

    const data = await readLocale(locale);
    if (!data.work) data.work = { title: 'Work' };
    data.work[key] = { title, description };
    await writeLocale(locale, data);

    return NextResponse.json({ success: true, message: `Work item '${key}' saved`, item: { key, title, description } });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to save work item', details: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { locale, title, password } = await request.json();

    if (password !== ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (!locale || !VALID_LOCALES.includes(locale)) {
      return NextResponse.json({ error: 'Invalid locale' }, { status: 400 });
    }

    const data = await readLocale(locale);
    if (!data.work) data.work = {};
    data.work.title = title;
    await writeLocale(locale, data);

    return NextResponse.json({ success: true, message: 'Work section title updated' });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update work title', details: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { locale, key, password } = await request.json();

    if (password !== ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (!locale || !VALID_LOCALES.includes(locale)) {
      return NextResponse.json({ error: 'Invalid locale' }, { status: 400 });
    }
    if (!key) {
      return NextResponse.json({ error: 'Key is required' }, { status: 400 });
    }

    const data = await readLocale(locale);
    if (!data.work?.[key]) {
      return NextResponse.json({ error: 'Work item not found' }, { status: 404 });
    }

    delete data.work[key];
    await writeLocale(locale, data);

    return NextResponse.json({ success: true, message: `Work item '${key}' deleted` });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete work item', details: (error as Error).message },
      { status: 500 }
    );
  }
}
