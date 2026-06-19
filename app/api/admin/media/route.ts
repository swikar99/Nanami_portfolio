import { NextRequest, NextResponse } from 'next/server';
import { readLocale, writeLocale } from '@/lib/storage';

const VALID_LOCALES = ['en', 'ja', 'ne'];
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
const METADATA_KEYS = ['title', 'subtitle', 'featured', 'speeches', 'videos'];

export async function GET(request: NextRequest) {
  try {
    const locale = request.nextUrl.searchParams.get('locale') || 'en';

    if (!VALID_LOCALES.includes(locale)) {
      return NextResponse.json({ error: 'Invalid locale' }, { status: 400 });
    }

    const data = await readLocale(locale);
    const media = data.media || {};

    const items = Object.entries(media)
      .filter(([key]) => !METADATA_KEYS.includes(key))
      .map(([key, value]) => ({ key, value: value as string }));

    return NextResponse.json({
      locale,
      title: media.title || 'Media',
      featured: media.featured || 'Featured',
      speeches: media.speeches || 'Speeches',
      videos: media.videos || 'Videos',
      items,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to read media items' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { locale, key, value, password } = await request.json();

    if (password !== ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (!locale || !VALID_LOCALES.includes(locale)) {
      return NextResponse.json({ error: 'Invalid locale' }, { status: 400 });
    }
    if (!key || !value) {
      return NextResponse.json({ error: 'Key and value are required' }, { status: 400 });
    }

    const data = await readLocale(locale);
    if (!data.media) {
      data.media = { title: 'Media', featured: 'Featured', speeches: 'Speeches', videos: 'Videos' };
    }
    data.media[key] = value;
    await writeLocale(locale, data);

    return NextResponse.json({ success: true, message: `Media item '${key}' saved`, item: { key, value } });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to save media item', details: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { locale, title, featured, speeches, videos, password } = await request.json();

    if (password !== ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (!locale || !VALID_LOCALES.includes(locale)) {
      return NextResponse.json({ error: 'Invalid locale' }, { status: 400 });
    }

    const data = await readLocale(locale);
    if (!data.media) data.media = {};
    if (title !== undefined) data.media.title = title;
    if (featured !== undefined) data.media.featured = featured;
    if (speeches !== undefined) data.media.speeches = speeches;
    if (videos !== undefined) data.media.videos = videos;
    await writeLocale(locale, data);

    return NextResponse.json({ success: true, message: 'Media section metadata updated' });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update media metadata', details: (error as Error).message },
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
    if (METADATA_KEYS.includes(key)) {
      return NextResponse.json({ error: 'Cannot delete metadata fields' }, { status: 400 });
    }

    const data = await readLocale(locale);
    if (!data.media?.[key]) {
      return NextResponse.json({ error: 'Media item not found' }, { status: 404 });
    }

    delete data.media[key];
    await writeLocale(locale, data);

    return NextResponse.json({ success: true, message: `Media item '${key}' deleted` });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete media item', details: (error as Error).message },
      { status: 500 }
    );
  }
}
