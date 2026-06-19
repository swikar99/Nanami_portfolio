import { NextResponse } from 'next/server';

function getBlobToken(): string | undefined {
  if (process.env.BLOB_READ_WRITE_TOKEN) return process.env.BLOB_READ_WRITE_TOKEN;
  const entry = Object.entries(process.env).find(
    ([k, v]) => k.endsWith('_READ_WRITE_TOKEN') && v?.startsWith('vercel_blob_rw_')
  );
  return entry?.[1];
}

export async function GET() {
  const token = getBlobToken();
  const tokenKeys = Object.keys(process.env).filter(k => k.includes('READ_WRITE_TOKEN'));

  const result: Record<string, any> = {
    VERCEL: process.env.VERCEL,
    ADMIN_PASSWORD: process.env.ADMIN_PASSWORD ? 'set' : 'NOT SET',
    blobToken: token ? `found (${token.slice(0, 20)}...)` : 'NOT FOUND',
    blobTokenKeys: tokenKeys,
    blobTest: null,
    blobError: null,
    blobs: [],
  };

  if (token) {
    try {
      const { list } = await import('@vercel/blob');
      const { blobs } = await list({ prefix: 'locales/', token });
      result.blobTest = `connected — ${blobs.length} locale blobs found`;
      result.blobs = blobs.map((b) => b.pathname);
    } catch (e: any) {
      result.blobTest = 'FAILED';
      result.blobError = e.message;
    }
  }

  return NextResponse.json(result);
}
