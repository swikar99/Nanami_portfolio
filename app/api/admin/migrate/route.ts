import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { writeLocale } from '@/lib/storage';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

export async function POST(req: NextRequest) {
  try {
    const { password } = await req.json();
    if (password !== ADMIN_PASSWORD) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const locales = ['en', 'ja', 'ne'];
    const results: Record<string, string> = {};

    for (const locale of locales) {
      try {
        const raw = await readFile(join(process.cwd(), 'locales', `${locale}.json`), 'utf-8');
        const data = JSON.parse(raw);
        await writeLocale(locale, data);
        results[locale] = 'seeded';
      } catch (e: any) {
        results[locale] = `failed: ${e.message}`;
      }
    }

    return NextResponse.json({ success: true, results });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
