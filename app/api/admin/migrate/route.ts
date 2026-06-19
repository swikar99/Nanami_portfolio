import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';

const LOCALES = ['en', 'ja', 'ne'];
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

function getBlobToken() {
  if (process.env.BLOB_READ_WRITE_TOKEN) return process.env.BLOB_READ_WRITE_TOKEN;
  const entry = Object.entries(process.env).find(
    ([k, v]) => k.endsWith('_READ_WRITE_TOKEN') && v?.startsWith('vercel_blob_rw_')
  );
  return entry?.[1];
}

export async function POST(request: NextRequest) {
  const { password } = await request.json().catch(() => ({}));

  if (password !== ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const token = getBlobToken();
  if (!token) {
    return NextResponse.json({ error: 'No blob token found. Connect a Blob store in Vercel → Storage.' }, { status: 500 });
  }

  const { put } = await import('@vercel/blob');
  const results: Record<string, string> = {};

  for (const locale of LOCALES) {
    try {
      const content = await readFile(join(process.cwd(), 'locales', `${locale}.json`), 'utf-8');
      const data = JSON.parse(content);
      await put(`locales/${locale}.json`, JSON.stringify(data, null, 2), {
        access: 'public',
        contentType: 'application/json',
        addRandomSuffix: false,
        allowOverwrite: true,
        token,
      });
      results[locale] = 'migrated';
    } catch (e: any) {
      results[locale] = `failed: ${e.message}`;
    }
  }

  const allOk = Object.values(results).every((v) => v === 'migrated');
  return NextResponse.json({ success: allOk, results });
}
