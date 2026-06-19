import { readFile } from 'fs/promises';
import { join } from 'path';

async function readFromFile(locale: string): Promise<any> {
  const content = await readFile(join(process.cwd(), 'locales', `${locale}.json`), 'utf-8');
  return JSON.parse(content);
}

export async function readLocale(locale: string): Promise<any> {
  if (!process.env.MONGODB_URI) return readFromFile(locale);

  try {
    const { getDb } = await import('./mongodb');
    const db = await getDb();
    const doc = await db.collection('locales').findOne({ locale });
    if (doc?.data) return doc.data;

    // First run: seed from bundled file
    const seed = await readFromFile(locale);
    await writeLocale(locale, seed).catch(() => {});
    return seed;
  } catch {
    return readFromFile(locale);
  }
}

export async function writeLocale(locale: string, data: any): Promise<void> {
  if (!process.env.MONGODB_URI) {
    const { writeFile } = await import('fs/promises');
    await writeFile(join(process.cwd(), 'locales', `${locale}.json`), JSON.stringify(data, null, 2));
    return;
  }

  const { getDb } = await import('./mongodb');
  const db = await getDb();
  await db.collection('locales').updateOne(
    { locale },
    { $set: { locale, data, updatedAt: new Date() } },
    { upsert: true }
  );
}
