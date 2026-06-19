import { NextRequest, NextResponse } from 'next/server';

const VALID_CATEGORIES = ['profile', 'projects', 'media', 'hero', 'about', 'work', 'contact', 'nav', 'footer'];
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
const onVercel = process.env.VERCEL === '1';

export async function GET(request: NextRequest) {
  try {
    const category = request.nextUrl.searchParams.get('category');

    if (category && !VALID_CATEGORIES.includes(category)) {
      return NextResponse.json({ error: 'Invalid category' }, { status: 400 });
    }

    const images: Record<string, string[]> = {};
    const token = process.env.BLOB_READ_WRITE_TOKEN;
    const categoriesToFetch = category ? [category] : VALID_CATEGORIES;

    if (onVercel && token) {
      const { list } = await import('@vercel/blob');
      for (const cat of categoriesToFetch) {
        const { blobs } = await list({ prefix: `images/${cat}/`, token });
        images[cat] = blobs.map((b) => b.url);
      }
    } else {
      const { existsSync, readdirSync } = await import('fs');
      const { join } = await import('path');
      const IMAGES_DIR = join(process.cwd(), 'public', 'images');
      for (const cat of categoriesToFetch) {
        const catPath = join(IMAGES_DIR, cat);
        if (existsSync(catPath)) {
          images[cat] = readdirSync(catPath)
            .filter((f) => /\.(jpg|jpeg|png|gif|svg|webp)$/i.test(f))
            .map((f) => `/images/${cat}/${f}`);
        } else {
          images[cat] = [];
        }
      }
    }

    return NextResponse.json(images);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to read images', details: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const category = formData.get('category') as string;
    const password = formData.get('password') as string;

    if (password !== ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }
    if (!category || !VALID_CATEGORIES.includes(category)) {
      return NextResponse.json({ error: 'Invalid category' }, { status: 400 });
    }

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/svg+xml', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type. Only images are allowed.' }, { status: 400 });
    }
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large. Maximum size is 5MB.' }, { status: 400 });
    }

    const token = process.env.BLOB_READ_WRITE_TOKEN;

    if (onVercel && token) {
      const { put } = await import('@vercel/blob');
      const blob = await put(`images/${category}/${file.name}`, file, {
        access: 'public',
        token,
        addRandomSuffix: false,
      });
      return NextResponse.json({ success: true, filename: file.name, path: blob.url });
    } else {
      const { writeFile, mkdir } = await import('fs/promises');
      const { join } = await import('path');
      const dir = join(process.cwd(), 'public', 'images', category);
      await mkdir(dir, { recursive: true });
      const bytes = await file.arrayBuffer();
      await writeFile(join(dir, file.name), Buffer.from(bytes));
      return NextResponse.json({ success: true, filename: file.name, path: `/images/${category}/${file.name}` });
    }
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to upload image', details: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { category, filename, password } = await request.json();

    if (password !== ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (!category || !VALID_CATEGORIES.includes(category)) {
      return NextResponse.json({ error: 'Invalid category' }, { status: 400 });
    }
    if (!filename) {
      return NextResponse.json({ error: 'Filename is required' }, { status: 400 });
    }

    const token = process.env.BLOB_READ_WRITE_TOKEN;

    if (onVercel && token) {
      const { list, del } = await import('@vercel/blob');
      const { blobs } = await list({ prefix: `images/${category}/${filename}`, token });
      const target = blobs.find((b) => b.pathname === `images/${category}/${filename}`);
      if (target) await del(target.url, { token });
      return NextResponse.json({ success: true });
    } else {
      const { unlink } = await import('fs/promises');
      const { existsSync } = await import('fs');
      const { join } = await import('path');
      const filePath = join(process.cwd(), 'public', 'images', category, filename);
      if (!existsSync(filePath)) {
        return NextResponse.json({ error: 'File not found' }, { status: 404 });
      }
      await unlink(filePath);
      return NextResponse.json({ success: true });
    }
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete image', details: (error as Error).message },
      { status: 500 }
    );
  }
}
