import { NextRequest, NextResponse } from 'next/server';
import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';

const LOCALES_DIR = join(process.cwd(), 'locales');
const VALID_LOCALES = ['en', 'ja', 'ne'];

interface MediaItem {
  key: string;
  value: string;
}

// Helper to read locale file
async function readLocaleFile(locale: string) {
  const filePath = join(LOCALES_DIR, `${locale}.json`);
  const content = await readFile(filePath, 'utf-8');
  return JSON.parse(content);
}

// Helper to write locale file
async function writeLocaleFile(locale: string, data: any) {
  const filePath = join(LOCALES_DIR, `${locale}.json`);
  await writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

// GET: Fetch all media items from a specific locale
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const locale = searchParams.get('locale') || 'en';

    if (!VALID_LOCALES.includes(locale)) {
      return NextResponse.json(
        { error: 'Invalid locale' },
        { status: 400 }
      );
    }

    const data = await readLocaleFile(locale);
    const media = data.media || {};

    // Transform to array format
    const mediaItems: MediaItem[] = Object.entries(media)
      .filter(([key]) => !['title', 'featured', 'speeches', 'videos'].includes(key))
      .map(([key, value]) => ({
        key,
        value: value as string,
      }));

    return NextResponse.json({
      locale,
      title: media.title || 'Media',
      featured: media.featured || 'Featured',
      speeches: media.speeches || 'Speeches',
      videos: media.videos || 'Videos',
      items: mediaItems
    });
  } catch (error) {
    console.error('Error reading media items:', error);
    return NextResponse.json(
      { error: 'Failed to read media items' },
      { status: 500 }
    );
  }
}

// POST: Create or update a media item
export async function POST(request: NextRequest) {
  try {
    const { locale, key, value, password } = await request.json();

    // Password check
    if (password !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (!locale || !VALID_LOCALES.includes(locale)) {
      return NextResponse.json(
        { error: 'Invalid locale' },
        { status: 400 }
      );
    }

    if (!key || !value) {
      return NextResponse.json(
        { error: 'Key and value are required' },
        { status: 400 }
      );
    }

    const data = await readLocaleFile(locale);

    if (!data.media) {
      data.media = { title: 'Media', featured: 'Featured', speeches: 'Speeches', videos: 'Videos' };
    }

    data.media[key] = value;

    await writeLocaleFile(locale, data);

    return NextResponse.json({
      success: true,
      message: `Media item '${key}' saved successfully`,
      item: { key, value }
    });
  } catch (error) {
    console.error('Error saving media item:', error);
    return NextResponse.json(
      { error: 'Failed to save media item', details: (error as Error).message },
      { status: 500 }
    );
  }
}

// PUT: Update media section metadata (title, featured, speeches, videos)
export async function PUT(request: NextRequest) {
  try {
    const { locale, title, featured, speeches, videos, password } = await request.json();

    // Password check
    if (password !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (!locale || !VALID_LOCALES.includes(locale)) {
      return NextResponse.json(
        { error: 'Invalid locale' },
        { status: 400 }
      );
    }

    const data = await readLocaleFile(locale);

    if (!data.media) {
      data.media = {};
    }

    if (title !== undefined) data.media.title = title;
    if (featured !== undefined) data.media.featured = featured;
    if (speeches !== undefined) data.media.speeches = speeches;
    if (videos !== undefined) data.media.videos = videos;

    await writeLocaleFile(locale, data);

    return NextResponse.json({
      success: true,
      message: 'Media section metadata updated successfully'
    });
  } catch (error) {
    console.error('Error updating media metadata:', error);
    return NextResponse.json(
      { error: 'Failed to update media metadata', details: (error as Error).message },
      { status: 500 }
    );
  }
}

// DELETE: Delete a media item
export async function DELETE(request: NextRequest) {
  try {
    const { locale, key, password } = await request.json();

    // Password check
    if (password !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (!locale || !VALID_LOCALES.includes(locale)) {
      return NextResponse.json(
        { error: 'Invalid locale' },
        { status: 400 }
      );
    }

    if (!key) {
      return NextResponse.json(
        { error: 'Key is required' },
        { status: 400 }
      );
    }

    const data = await readLocaleFile(locale);

    if (!data.media || !data.media[key]) {
      return NextResponse.json(
        { error: 'Media item not found' },
        { status: 404 }
      );
    }

    // Prevent deletion of metadata fields
    if (['title', 'featured', 'speeches', 'videos'].includes(key)) {
      return NextResponse.json(
        { error: 'Cannot delete metadata fields' },
        { status: 400 }
      );
    }

    delete data.media[key];

    await writeLocaleFile(locale, data);

    return NextResponse.json({
      success: true,
      message: `Media item '${key}' deleted successfully`
    });
  } catch (error) {
    console.error('Error deleting media item:', error);
    return NextResponse.json(
      { error: 'Failed to delete media item', details: (error as Error).message },
      { status: 500 }
    );
  }
}
