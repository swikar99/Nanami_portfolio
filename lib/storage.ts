import { put, list, del } from '@vercel/blob';
import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';

const isVercel = !!process.env.BLOB_READ_WRITE_TOKEN;

function blobPath(locale: string) {
  return `locales/${locale}.json`;
}

async function readFromFile(locale: string): Promise<any> {
  const content = await readFile(join(process.cwd(), 'locales', `${locale}.json`), 'utf-8');
  return JSON.parse(content);
}

export async function readLocale(locale: string): Promise<any> {
  if (!isVercel) return readFromFile(locale);

  const { blobs } = await list({ prefix: blobPath(locale) });
  if (blobs.length > 0) {
    const res = await fetch(blobs[0].url);
    return res.json();
  }

  // First run: seed from bundled file
  const seed = await readFromFile(locale);
  await writeLocale(locale, seed);
  return seed;
}

export async function writeLocale(locale: string, data: any): Promise<void> {
  if (!isVercel) {
    await writeFile(
      join(process.cwd(), 'locales', `${locale}.json`),
      JSON.stringify(data, null, 2),
      'utf-8'
    );
    return;
  }

  // Delete old blob then write new one (Blob has no in-place update)
  const { blobs } = await list({ prefix: blobPath(locale) });
  if (blobs.length > 0) {
    await del(blobs.map((b) => b.url));
  }

  await put(blobPath(locale), JSON.stringify(data, null, 2), {
    access: 'public',
    contentType: 'application/json',
    addRandomSuffix: false,
  });
}
