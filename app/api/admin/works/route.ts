import { NextRequest, NextResponse } from 'next/server';
import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';

const LOCALES_DIR = join(process.cwd(), 'locales');
const VALID_LOCALES = ['en', 'ja', 'ne'];

interface WorkItem {
  key: string;
  title: string;
  description: string;
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

// GET: Fetch all work items from a specific locale
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
    const work = data.work || {};

    // Transform to array format
    const workItems: WorkItem[] = Object.entries(work)
      .filter(([key]) => key !== 'title')
      .map(([key, value]: [string, any]) => ({
        key,
        title: value.title || '',
        description: value.description || '',
      }));

    return NextResponse.json({
      locale,
      title: work.title || 'Work',
      items: workItems
    });
  } catch (error) {
    console.error('Error reading work items:', error);
    return NextResponse.json(
      { error: 'Failed to read work items' },
      { status: 500 }
    );
  }
}

// POST: Create or update a work item
export async function POST(request: NextRequest) {
  try {
    const { locale, key, title, description, password } = await request.json();

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

    if (!key || !title || !description) {
      return NextResponse.json(
        { error: 'Key, title, and description are required' },
        { status: 400 }
      );
    }

    const data = await readLocaleFile(locale);

    if (!data.work) {
      data.work = { title: 'Work' };
    }

    data.work[key] = {
      title,
      description
    };

    await writeLocaleFile(locale, data);

    return NextResponse.json({
      success: true,
      message: `Work item '${key}' saved successfully`,
      item: { key, title, description }
    });
  } catch (error) {
    console.error('Error saving work item:', error);
    return NextResponse.json(
      { error: 'Failed to save work item', details: (error as Error).message },
      { status: 500 }
    );
  }
}

// PUT: Update work section title
export async function PUT(request: NextRequest) {
  try {
    const { locale, title, password } = await request.json();

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

    if (!data.work) {
      data.work = {};
    }

    data.work.title = title;

    await writeLocaleFile(locale, data);

    return NextResponse.json({
      success: true,
      message: 'Work section title updated successfully'
    });
  } catch (error) {
    console.error('Error updating work title:', error);
    return NextResponse.json(
      { error: 'Failed to update work title', details: (error as Error).message },
      { status: 500 }
    );
  }
}

// DELETE: Delete a work item
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

    if (!data.work || !data.work[key]) {
      return NextResponse.json(
        { error: 'Work item not found' },
        { status: 404 }
      );
    }

    delete data.work[key];

    await writeLocaleFile(locale, data);

    return NextResponse.json({
      success: true,
      message: `Work item '${key}' deleted successfully`
    });
  } catch (error) {
    console.error('Error deleting work item:', error);
    return NextResponse.json(
      { error: 'Failed to delete work item', details: (error as Error).message },
      { status: 500 }
    );
  }
}
