import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';

const LOCALES = ['en', 'ja', 'ne'];
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

export async function POST(request: NextRequest) {
  const { password } = await request.json().catch(() => ({}));

  if (password !== ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!process.env.MONGODB_URI) {
    return NextResponse.json({ error: 'MONGODB_URI not set.' }, { status: 500 });
  }

  const clientPromise = (await import('@/lib/mongodb')).default;
  const client = await clientPromise;
  const col = client.db('nanami-portfolio').collection('locales');

  const results: Record<string, string> = {};

  for (const locale of LOCALES) {
    try {
      const content = await readFile(join(process.cwd(), 'locales', `${locale}.json`), 'utf-8');
      const data = JSON.parse(content);
      await col.updateOne(
        { locale },
        { $set: { locale, data, updatedAt: new Date() } },
        { upsert: true }
      );
      results[locale] = 'migrated';
    } catch (e: any) {
      results[locale] = `failed: ${e.message}`;
    }
  }

  const allOk = Object.values(results).every((v) => v === 'migrated');
  return NextResponse.json({ success: allOk, results });
}
