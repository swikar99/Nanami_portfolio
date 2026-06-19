import { NextRequest, NextResponse } from 'next/server';
import { readLocale } from '@/lib/storage';

export async function GET(req: NextRequest) {
  const locale = req.nextUrl.searchParams.get('locale') || 'en';
  const section = req.nextUrl.searchParams.get('section');
  const data = await readLocale(locale);

  if (section) {
    return NextResponse.json({ locale, section, data: data[section] || {} });
  }
  return NextResponse.json({ locale, data });
}
