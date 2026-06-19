import { put, list, del } from '@vercel/blob';
import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';

// process.env.VERCEL is automatically set to '1' by Vercel in every deployment
// — no manual configuration needed
const onVercel = process.env.VERCEL === '1';

function blobPath(locale: string) {
  return `locales/${locale}.json`;
}

async function readFromFile(locale: string): Promise<any> {
  const content = await readFile(join(process.cwd(), 'locales', `${locale}.json`), 'utf-8');
  return JSON.parse(content);
}

function requireBlobToken(): string {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    throw new Error(
      'BLOB_READ_WRITE_TOKEN is missing. Go to Vercel → Project Settings → Environment Variables and add it, then redeploy.'
    );
  }
  return token;
}

export async function readLocale(locale: string): Promise<any> {
  if (!onVercel) return readFromFile(locale);

  requireBlobToken();
  const { blobs } = await list({ prefix: blobPath(locale) });
  const exact = blobs.find((b) => b.pathname === blobPath(locale));
  if (exact) {
    const res = await fetch(exact.url);
    return res.json();
  }

  // First run: seed blob from bundled file
  const seed = await readFromFile(locale);
  await writeLocale(locale, seed);
  return seed;
}

export async function writeLocale(locale: string, data: any): Promise<void> {
  if (!onVercel) {
    await writeFile(
      join(process.cwd(), 'locales', `${locale}.json`),
      JSON.stringify(data, null, 2),
      'utf-8'
    );
    return;
  }

  requireBlobToken();

  // Delete existing blob(s) for this locale then write fresh
  const { blobs } = await list({ prefix: blobPath(locale) });
  const existing = blobs.filter((b) => b.pathname === blobPath(locale));
  if (existing.length > 0) {
    await del(existing.map((b) => b.url));
  }

  await put(blobPath(locale), JSON.stringify(data, null, 2), {
    access: 'public',
    contentType: 'application/json',
    addRandomSuffix: false,
  });
}
