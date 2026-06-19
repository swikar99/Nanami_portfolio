import { readFile } from 'fs/promises';
import { join } from 'path';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface WorkItem {
  key: string;
  order: number;
  icon: string;
  imageName: string;
  imageUrl: string;
  color: string;
  link: string;
  videoUrl: string;
  translations: {
    [locale: string]: { title: string; description: string };
  };
}

export interface MediaItem {
  key: string;
  order: number;
  type: 'video' | 'article';
  url: string;
  imageName: string;
  imageUrl: string;
  thumbnail: string;
  translations: {
    [locale: string]: string;
  };
}

// ─── Locale helpers ───────────────────────────────────────────────────────────

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

// ─── Work items ───────────────────────────────────────────────────────────────

export async function getWorkItems(): Promise<WorkItem[]> {
  if (!process.env.MONGODB_URI) return [];
  const { getDb } = await import('./mongodb');
  const db = await getDb();
  const docs = await db.collection('work_items').find().sort({ order: 1 }).toArray();
  return docs.map(({ _id, ...d }) => d) as WorkItem[];
}

export async function saveWorkItem(item: WorkItem): Promise<void> {
  if (!process.env.MONGODB_URI) return;
  const { getDb } = await import('./mongodb');
  const db = await getDb();
  await db.collection('work_items').updateOne(
    { key: item.key },
    { $set: { ...item, updatedAt: new Date() } },
    { upsert: true }
  );
}

export async function deleteWorkItem(key: string): Promise<void> {
  if (!process.env.MONGODB_URI) return;
  const { getDb } = await import('./mongodb');
  const db = await getDb();
  await db.collection('work_items').deleteOne({ key });
}

// ─── Media items ──────────────────────────────────────────────────────────────

export async function getMediaItems(): Promise<MediaItem[]> {
  if (!process.env.MONGODB_URI) return [];
  const { getDb } = await import('./mongodb');
  const db = await getDb();
  const docs = await db.collection('media_items').find().sort({ order: 1 }).toArray();
  return docs.map(({ _id, ...d }) => d) as MediaItem[];
}

export async function saveMediaItem(item: MediaItem): Promise<void> {
  if (!process.env.MONGODB_URI) return;
  const { getDb } = await import('./mongodb');
  const db = await getDb();
  await db.collection('media_items').updateOne(
    { key: item.key },
    { $set: { ...item, updatedAt: new Date() } },
    { upsert: true }
  );
}

export async function deleteMediaItem(key: string): Promise<void> {
  if (!process.env.MONGODB_URI) return;
  const { getDb } = await import('./mongodb');
  const db = await getDb();
  await db.collection('media_items').deleteOne({ key });
}

// ─── Social links ─────────────────────────────────────────────────────────────

export interface SocialLink {
  key: string;
  order: number;
  name: string;
  url: string;
  icon: string;
  gradient: string;
}

export async function getSocialLinks(): Promise<SocialLink[]> {
  if (!process.env.MONGODB_URI) return [];
  const { getDb } = await import('./mongodb');
  const db = await getDb();
  const docs = await db.collection('social_links').find().sort({ order: 1 }).toArray();
  return docs.map(({ _id, ...d }) => d) as SocialLink[];
}

export async function saveSocialLink(item: SocialLink): Promise<void> {
  if (!process.env.MONGODB_URI) return;
  const { getDb } = await import('./mongodb');
  const db = await getDb();
  await db.collection('social_links').updateOne(
    { key: item.key },
    { $set: { ...item, updatedAt: new Date() } },
    { upsert: true }
  );
}

export async function deleteSocialLink(key: string): Promise<void> {
  if (!process.env.MONGODB_URI) return;
  const { getDb } = await import('./mongodb');
  const db = await getDb();
  await db.collection('social_links').deleteOne({ key });
}
