import { NextResponse } from 'next/server';

export async function GET() {
  const mongoUri = process.env.MONGODB_URI;
  const adminPw = process.env.ADMIN_PASSWORD;

  const result: Record<string, any> = {
    VERCEL: process.env.VERCEL,
    MONGODB_URI: mongoUri
      ? `set (${mongoUri.replace(/:([^@]+)@/, ':****@')})`
      : 'NOT SET',
    ADMIN_PASSWORD: adminPw ? 'set' : 'NOT SET',
    mongoTest: null,
    mongoError: null,
    localesInDB: null,
  };

  if (mongoUri) {
    try {
      const clientPromise = (await import('@/lib/mongodb')).default;
      const client = await clientPromise;
      const col = client.db('nanami-portfolio').collection('locales');
      const docs = await col.find({}, { projection: { locale: 1 } }).toArray();
      result.mongoTest = 'connected';
      result.localesInDB = docs.map((d) => d.locale);
    } catch (e: any) {
      result.mongoTest = 'FAILED';
      result.mongoError = e.message;
    }
  }

  return NextResponse.json(result);
}
