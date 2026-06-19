import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';

const onVercel = process.env.VERCEL === '1';

function getBlobToken(): string | undefined {
  if (process.env.BLOB_READ_WRITE_TOKEN) return process.env.BLOB_READ_WRITE_TOKEN;
  const entry = Object.entries(process.env).find(
    ([k, v]) => k.endsWith('_READ_WRITE_TOKEN') && v?.startsWith('vercel_blob_rw_')
  );
  return entry?.[1];
}

function blobPath(locale: string) {
  return `locales/${locale}.json`;
}

async function readFromFile(locale: string): Promise<any> {
  const content = await readFile(join(process.cwd(), 'locales', `${locale}.json`), 'utf-8');
  return JSON.parse(content);
}

export async function readLocale(locale: string): Promise<any> {
  const token = getBlobToken();
  if (!onVercel || !token) return readFromFile(locale);

  try {
    const { list } = await import('@vercel/blob');
    const { blobs } = await list({ prefix: blobPath(locale), token });
    const exact = blobs.find((b) => b.pathname === blobPath(locale));
    if (exact) {
      const res = await fetch(exact.url);
      return res.json();
    }
    // First request — seed blob from bundled file
    const seed = await readFromFile(locale);
    await writeLocale(locale, seed).catch(() => {});
    return seed;
  } catch (e) {
    console.error('[storage] Blob read failed, using bundled file:', (e as Error).message);
    return readFromFile(locale);
  }
}

export async function writeLocale(locale: string, data: any): Promise<void> {
  const token = getBlobToken();

  if (!onVercel || !token) {
    await writeFile(
      join(process.cwd(), 'locales', `${locale}.json`),
      JSON.stringify(data, null, 2),
      'utf-8'
    );
    return;
  }

  const { put } = await import('@vercel/blob');
  await put(blobPath(locale), JSON.stringify(data, null, 2), {
    access: 'public',
    contentType: 'application/json',
    addRandomSuffix: false,
    allowOverwrite: true,
    token,
  });
}
