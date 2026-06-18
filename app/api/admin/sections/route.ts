import { NextRequest, NextResponse } from 'next/server';
import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';

const LOCALES_DIR = join(process.cwd(), 'locales');
const VALID_LOCALES = ['en', 'ja', 'ne'];
const VALID_SECTIONS = ['nav', 'hero', 'about', 'contact', 'footer'];

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

// GET: Fetch a specific section from a locale
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const locale = searchParams.get('locale') || 'en';
    const section = searchParams.get('section');

    if (!VALID_LOCALES.includes(locale)) {
      return NextResponse.json(
        { error: 'Invalid locale' },
        { status: 400 }
      );
    }

    if (!section || !VALID_SECTIONS.includes(section)) {
      return NextResponse.json(
        { error: 'Invalid section' },
        { status: 400 }
      );
    }

    const data = await readLocaleFile(locale);
    const sectionData = data[section] || {};

    return NextResponse.json({
      locale,
      section,
      data: sectionData
    });
  } catch (error) {
    console.error('Error reading section:', error);
    return NextResponse.json(
      { error: 'Failed to read section' },
      { status: 500 }
    );
  }
}

// POST: Update a field in a section
export async function POST(request: NextRequest) {
  try {
    const { locale, section, key, value, password } = await request.json();

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

    if (!section || !VALID_SECTIONS.includes(section)) {
      return NextResponse.json(
        { error: 'Invalid section' },
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

    if (!data[section]) {
      data[section] = {};
    }

    data[section][key] = value;

    await writeLocaleFile(locale, data);

    return NextResponse.json({
      success: true,
      message: `Section '${section}' field '${key}' updated successfully`,
      data: { key, value }
    });
  } catch (error) {
    console.error('Error updating section:', error);
    return NextResponse.json(
      { error: 'Failed to update section', details: (error as Error).message },
      { status: 500 }
    );
  }
}

// PUT: Update entire section
export async function PUT(request: NextRequest) {
  try {
    const { locale, section, data: sectionData, password } = await request.json();

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

    if (!section || !VALID_SECTIONS.includes(section)) {
      return NextResponse.json(
        { error: 'Invalid section' },
        { status: 400 }
      );
    }

    const data = await readLocaleFile(locale);
    data[section] = sectionData;
    await writeLocaleFile(locale, data);

    return NextResponse.json({
      success: true,
      message: `Section '${section}' updated successfully`
    });
  } catch (error) {
    console.error('Error updating section:', error);
    return NextResponse.json(
      { error: 'Failed to update section', details: (error as Error).message },
      { status: 500 }
    );
  }
}

// DELETE: Delete a field from a section
export async function DELETE(request: NextRequest) {
  try {
    const { locale, section, key, password } = await request.json();

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

    if (!section || !VALID_SECTIONS.includes(section)) {
      return NextResponse.json(
        { error: 'Invalid section' },
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

    if (!data[section] || !data[section][key]) {
      return NextResponse.json(
        { error: 'Field not found' },
        { status: 404 }
      );
    }

    delete data[section][key];

    await writeLocaleFile(locale, data);

    return NextResponse.json({
      success: true,
      message: `Field '${key}' deleted from section '${section}'`
    });
  } catch (error) {
    console.error('Error deleting field:', error);
    return NextResponse.json(
      { error: 'Failed to delete field', details: (error as Error).message },
      { status: 500 }
    );
  }
}
