import { NextResponse } from 'next/server';

export async function GET() {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  const adminPw = process.env.ADMIN_PASSWORD;

  const result: Record<string, any> = {
    VERCEL: process.env.VERCEL,
    BLOB_READ_WRITE_TOKEN: token ? `set (starts with ${token.slice(0, 20)}...)` : 'NOT SET',
    ADMIN_PASSWORD: adminPw ? 'set' : 'NOT SET',
    blobTest: null,
    blobError: null,
  };

  if (token) {
    try {
      const { list } = await import('@vercel/blob');
      const { blobs } = await list({ prefix: 'locales/', token });
      result.blobTest = `ok — ${blobs.length} blobs found`;
      result.blobs = blobs.map((b) => b.pathname);
    } catch (e: any) {
      result.blobTest = 'FAILED';
      result.blobError = e.message;
    }
  }

  return NextResponse.json(result);
}
