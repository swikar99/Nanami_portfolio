import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';

// process.env.VERCEL is auto-set to '1' by Vercel in every deployment
const onVercel = process.env.VERCEL === '1';

function blobPath(locale: string) {
  return `locales/${locale}.json`;
}

async function readFromFile(locale: string): Promise<any> {
  const content = await readFile(join(process.cwd(), 'locales', `${locale}.json`), 'utf-8');
  return JSON.parse(content);
}

export async function readLocale(locale: string): Promise<any> {
  const token = process.env.BLOB_READ_WRITE_TOKEN;

  // Local dev or build time (no token) → read from bundled file
  if (!onVercel || !token) return readFromFile(locale);

  const { list } = await import('@vercel/blob');
  const { blobs } = await list({ prefix: blobPath(locale), token });
  const exact = blobs.find((b) => b.pathname === blobPath(locale));
  if (exact) {
    const res = await fetch(exact.url);
    return res.json();
  }

  // First request ever: seed blob from bundled file
  const seed = await readFromFile(locale);
  await writeLocale(locale, seed);
  return seed;
}

export async function writeLocale(locale: string, data: any): Promise<void> {
  const token = process.env.BLOB_READ_WRITE_TOKEN;

  if (!token) {
    if (onVercel) {
      console.error('[storage] BLOB_READ_WRITE_TOKEN is not set. VERCEL env:', process.env.VERCEL, 'All env keys:', Object.keys(process.env).filter(k => k.startsWith('BLOB')));
      throw new Error(
        'BLOB_READ_WRITE_TOKEN not set. Go to Vercel → Project Settings → Environment Variables → make sure BLOB_READ_WRITE_TOKEN is saved with Production scope selected, then Redeploy.'
      );
    }
    // Local dev → write to file
    await writeFile(
      join(process.cwd(), 'locales', `${locale}.json`),
      JSON.stringify(data, null, 2),
      'utf-8'
    );
    return;
  }

  const { list, del, put } = await import('@vercel/blob');

  // Delete old blob(s) then write fresh
  const { blobs } = await list({ prefix: blobPath(locale), token });
  const existing = blobs.filter((b) => b.pathname === blobPath(locale));
  if (existing.length > 0) {
    await del(existing.map((b) => b.url), { token });
  }

  await put(blobPath(locale), JSON.stringify(data, null, 2), {
    access: 'public',
    contentType: 'application/json',
    addRandomSuffix: false,
    token,
  });
}
