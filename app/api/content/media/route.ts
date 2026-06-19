import { NextRequest, NextResponse } from 'next/server';
import { getMediaItems } from '@/lib/storage';

export async function GET(req: NextRequest) {
  const locale = req.nextUrl.searchParams.get('locale') || 'en';
  const items = await getMediaItems();
  const result = items.map((item) => ({
    key: item.key,
    type: item.type,
    url: item.url,
    imageName: item.imageName,
    imageUrl: item.imageUrl ?? '',
    thumbnail: item.thumbnail,
    label: item.translations[locale] ?? item.translations['en'] ?? item.key,
  }));
  return NextResponse.json({ locale, items: result });
}
