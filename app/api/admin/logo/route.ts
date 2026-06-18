import { NextRequest, NextResponse } from 'next/server';
import { writeFile, readdir, unlink } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

const LOGO_DIR = join(process.cwd(), 'public');

// GET: Fetch current logo
export async function GET(request: NextRequest) {
  try {
    // Check for common logo file names
    const logoFiles = ['logo.png', 'logo.svg', 'logo.jpg', 'logo.jpeg', 'logo.webp'];

    for (const filename of logoFiles) {
      const logoPath = join(LOGO_DIR, filename);
      if (existsSync(logoPath)) {
        return NextResponse.json({
          exists: true,
          filename,
          path: `/${filename}`
        });
      }
    }

    return NextResponse.json({
      exists: false,
      filename: null,
      path: null
    });
  } catch (error) {
    console.error('Error reading logo:', error);
    return NextResponse.json(
      { error: 'Failed to read logo' },
      { status: 500 }
    );
  }
}

// POST: Upload/Update logo
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const password = formData.get('password') as string;

    // Password check
    if (password !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/svg+xml', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only PNG, JPG, SVG, and WEBP are allowed.' },
        { status: 400 }
      );
    }

    // Validate file size (max 2MB for logo)
    const maxSize = 2 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 2MB.' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Determine file extension
    const extension = file.name.split('.').pop() || 'png';
    const filename = `logo.${extension}`;

    // Delete old logo files first
    const oldLogoFiles = ['logo.png', 'logo.svg', 'logo.jpg', 'logo.jpeg', 'logo.webp'];
    for (const oldFile of oldLogoFiles) {
      const oldPath = join(LOGO_DIR, oldFile);
      if (existsSync(oldPath)) {
        try {
          await unlink(oldPath);
        } catch (err) {
          console.error(`Failed to delete old logo ${oldFile}:`, err);
        }
      }
    }

    // Write new logo file
    const filePath = join(LOGO_DIR, filename);
    await writeFile(filePath, buffer);

    return NextResponse.json({
      success: true,
      message: 'Logo uploaded successfully',
      filename,
      path: `/${filename}`
    });
  } catch (error) {
    console.error('Error uploading logo:', error);
    return NextResponse.json(
      { error: 'Failed to upload logo', details: (error as Error).message },
      { status: 500 }
    );
  }
}

// DELETE: Delete logo
export async function DELETE(request: NextRequest) {
  try {
    const { password } = await request.json();

    // Password check
    if (password !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Delete all logo files
    const logoFiles = ['logo.png', 'logo.svg', 'logo.jpg', 'logo.jpeg', 'logo.webp'];
    let deleted = false;

    for (const filename of logoFiles) {
      const logoPath = join(LOGO_DIR, filename);
      if (existsSync(logoPath)) {
        await unlink(logoPath);
        deleted = true;
      }
    }

    if (!deleted) {
      return NextResponse.json(
        { error: 'No logo found to delete' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Logo deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting logo:', error);
    return NextResponse.json(
      { error: 'Failed to delete logo', details: (error as Error).message },
      { status: 500 }
    );
  }
}
