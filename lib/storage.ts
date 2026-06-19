import { Redis } from '@upstash/redis';
import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';

function getRedis(): Redis | null {
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    return new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
  }
  return null;
}

async function readFromFile(locale: string): Promise<any> {
  const filePath = join(process.cwd(), 'locales', `${locale}.json`);
  const content = await readFile(filePath, 'utf-8');
  return JSON.parse(content);
}

export async function readLocale(locale: string): Promise<any> {
  const redis = getRedis();
  if (redis) {
    const data = await redis.get<any>(`locale:${locale}`);
    if (data) return data;

    // First run: seed Redis from the bundled file
    const seed = await readFromFile(locale);
    await redis.set(`locale:${locale}`, seed);
    return seed;
  }

  // Local dev — read directly from file
  return readFromFile(locale);
}

export async function writeLocale(locale: string, data: any): Promise<void> {
  const redis = getRedis();
  if (redis) {
    await redis.set(`locale:${locale}`, data);
    return;
  }

  if (process.env.VERCEL) {
    throw new Error(
      'Redis is not configured. Add UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN in Vercel → Storage → Upstash Redis.'
    );
  }

  // Local dev — write to file
  const filePath = join(process.cwd(), 'locales', `${locale}.json`);
  await writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
}
