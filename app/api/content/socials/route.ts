import { NextResponse } from 'next/server';
import { getSocialLinks } from '@/lib/storage';

export async function GET() {
  const items = await getSocialLinks();
  return NextResponse.json({ items });
}
