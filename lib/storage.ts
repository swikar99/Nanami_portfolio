import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';

const useMongo = !!process.env.MONGODB_URI;

async function getCollection() {
  const clientPromise = (await import('./mongodb')).default;
  const client = await clientPromise;
  return client.db('nanami-portfolio').collection('locales');
}

async function readFromFile(locale: string): Promise<any> {
  const content = await readFile(join(process.cwd(), 'locales', `${locale}.json`), 'utf-8');
  return JSON.parse(content);
}

export async function readLocale(locale: string): Promise<any> {
  if (!useMongo) return readFromFile(locale);

  try {
    const col = await getCollection();
    const doc = await col.findOne({ locale });
    if (doc) return doc.data;

    // First request: seed MongoDB from bundled file
    const seed = await readFromFile(locale);
    await writeLocale(locale, seed).catch(() => {});
    return seed;
  } catch (e) {
    // MongoDB unavailable (build time, wrong creds, etc.) — fall back to bundled file
    console.error('[storage] MongoDB read failed, using bundled file:', (e as Error).message);
    return readFromFile(locale);
  }
}

export async function writeLocale(locale: string, data: any): Promise<void> {
  if (!useMongo) {
    await writeFile(
      join(process.cwd(), 'locales', `${locale}.json`),
      JSON.stringify(data, null, 2),
      'utf-8'
    );
    return;
  }

  try {
    const col = await getCollection();
    await col.updateOne(
      { locale },
      { $set: { locale, data, updatedAt: new Date() } },
      { upsert: true }
    );
  } catch (e: any) {
    console.error('[storage] MongoDB write failed:', e.message);
    throw new Error(`Database write failed: ${e.message}. Fix MONGODB_URI in Vercel → Settings → Environment Variables.`);
  }
}
