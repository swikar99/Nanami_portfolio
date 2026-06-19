import { NextRequest, NextResponse } from 'next/server';

const LOGO_NAMES = ['logo.png', 'logo.svg', 'logo.jpg', 'logo.jpeg', 'logo.webp'];
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
const onVercel = process.env.VERCEL === '1';

export async function GET() {
  try {
    const token = process.env.BLOB_READ_WRITE_TOKEN;

    if (onVercel && token) {
      const { list } = await import('@vercel/blob');
      const { blobs } = await list({ prefix: 'logo/', token });
      if (blobs.length > 0) {
        const b = blobs[0];
        return NextResponse.json({ exists: true, filename: b.pathname.split('/').pop(), path: b.url });
      }
      return NextResponse.json({ exists: false, filename: null, path: null });
    } else {
      const { existsSync } = await import('fs');
      const { join } = await import('path');
      for (const filename of LOGO_NAMES) {
        if (existsSync(join(process.cwd(), 'public', filename))) {
          return NextResponse.json({ exists: true, filename, path: `/${filename}` });
        }
      }
      return NextResponse.json({ exists: false, filename: null, path: null });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Failed to read logo', details: (error as Error).message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const password = formData.get('password') as string;

    if (password !== ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/svg+xml', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type. Only PNG, JPG, SVG, and WEBP are allowed.' }, { status: 400 });
    }
    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large. Maximum size is 2MB.' }, { status: 400 });
    }

    const extension = file.name.split('.').pop() || 'png';
    const filename = `logo.${extension}`;
    const token = process.env.BLOB_READ_WRITE_TOKEN;

    if (onVercel && token) {
      const { list, del, put } = await import('@vercel/blob');
      const { blobs } = await list({ prefix: 'logo/', token });
      if (blobs.length > 0) {
        await del(blobs.map((b) => b.url), { token });
      }
      const blob = await put(`logo/${filename}`, file, { access: 'public', token, addRandomSuffix: false });
      return NextResponse.json({ success: true, filename, path: blob.url });
    } else {
      const { writeFile, unlink } = await import('fs/promises');
      const { existsSync } = await import('fs');
      const { join } = await import('path');
      for (const old of LOGO_NAMES) {
        const p = join(process.cwd(), 'public', old);
        if (existsSync(p)) {
          try { await unlink(p); } catch {}
        }
      }
      const bytes = await file.arrayBuffer();
      await writeFile(join(process.cwd(), 'public', filename), Buffer.from(bytes));
      return NextResponse.json({ success: true, filename, path: `/${filename}` });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Failed to upload logo', details: (error as Error).message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { password } = await request.json();

    if (password !== ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = process.env.BLOB_READ_WRITE_TOKEN;

    if (onVercel && token) {
      const { list, del } = await import('@vercel/blob');
      const { blobs } = await list({ prefix: 'logo/', token });
      if (blobs.length === 0) {
        return NextResponse.json({ error: 'No logo found to delete' }, { status: 404 });
      }
      await del(blobs.map((b) => b.url), { token });
      return NextResponse.json({ success: true });
    } else {
      const { unlink } = await import('fs/promises');
      const { existsSync } = await import('fs');
      const { join } = await import('path');
      let deleted = false;
      for (const filename of LOGO_NAMES) {
        const p = join(process.cwd(), 'public', filename);
        if (existsSync(p)) { await unlink(p); deleted = true; }
      }
      if (!deleted) return NextResponse.json({ error: 'No logo found to delete' }, { status: 404 });
      return NextResponse.json({ success: true });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete logo', details: (error as Error).message }, { status: 500 });
  }
}
