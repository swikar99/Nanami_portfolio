import { NextRequest, NextResponse } from 'next/server';
import { getWorkItems } from '@/lib/storage';

export async function GET(req: NextRequest) {
  const locale = req.nextUrl.searchParams.get('locale') || 'en';
  const items = await getWorkItems();
  const result = items.map((item) => ({
    key: item.key,
    icon: item.icon,
    imageName: item.imageName,
    imageUrl: item.imageUrl ?? '',
    color: item.color,
    link: item.link,
    videoUrl: item.videoUrl,
    title: item.translations[locale]?.title ?? item.translations['en']?.title ?? item.key,
    description: item.translations[locale]?.description ?? item.translations['en']?.description ?? '',
  }));
  return NextResponse.json({ locale, items: result });
}
