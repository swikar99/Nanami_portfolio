import { NextRequest, NextResponse } from 'next/server';
import { writeFile, readFile } from 'fs/promises';
import { join } from 'path';

const LOCALES_DIR = join(process.cwd(), 'locales');
const VALID_LOCALES = ['en', 'ja', 'ne'];

// GET: Fetch all locale files
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const locale = searchParams.get('locale');

    if (locale && !VALID_LOCALES.includes(locale)) {
      return NextResponse.json(
        { error: 'Invalid locale' },
        { status: 400 }
      );
    }

    if (locale) {
      // Fetch specific locale
      const filePath = join(LOCALES_DIR, `${locale}.json`);
      const content = await readFile(filePath, 'utf-8');
      return NextResponse.json({
        locale,
        content: JSON.parse(content)
      });
    } else {
      // Fetch all locales
      const allLocales: Record<string, any> = {};
      for (const loc of VALID_LOCALES) {
        const filePath = join(LOCALES_DIR, `${loc}.json`);
        const content = await readFile(filePath, 'utf-8');
        allLocales[loc] = JSON.parse(content);
      }
      return NextResponse.json(allLocales);
    }
  } catch (error) {
    console.error('Error reading locale files:', error);
    return NextResponse.json(
      { error: 'Failed to read locale files' },
      { status: 500 }
    );
  }
}

// POST: Update locale file
export async function POST(request: NextRequest) {
  try {
    const { locale, content, password } = await request.json();

    // Simple password protection (in production, use proper authentication)
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

    if (!content) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }

    // Validate JSON
    const parsedContent = typeof content === 'string'
      ? JSON.parse(content)
      : content;

    // Write to file
    const filePath = join(LOCALES_DIR, `${locale}.json`);
    await writeFile(
      filePath,
      JSON.stringify(parsedContent, null, 2),
      'utf-8'
    );

    return NextResponse.json({
      success: true,
      message: `${locale}.json updated successfully`
    });
  } catch (error) {
    console.error('Error updating locale file:', error);
    return NextResponse.json(
      { error: 'Failed to update locale file', details: (error as Error).message },
      { status: 500 }
    );
  }
}
