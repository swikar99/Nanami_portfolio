import { NextRequest, NextResponse } from 'next/server';
import { getMediaItems, saveMediaItem, deleteMediaItem } from '@/lib/storage';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

export async function GET() {
  const items = await getMediaItems();
  return NextResponse.json({ items });
}

export async function POST(req: NextRequest) {
  try {
    const { password, ...item } = await req.json();
    if (password !== ADMIN_PASSWORD) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!item.key) return NextResponse.json({ error: 'key is required' }, { status: 400 });
    await saveMediaItem(item);
    return NextResponse.json({ success: true, item });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { password, key } = await req.json();
    if (password !== ADMIN_PASSWORD) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    await deleteMediaItem(key);
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
