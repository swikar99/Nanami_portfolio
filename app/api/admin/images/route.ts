import { NextRequest, NextResponse } from 'next/server';
import { writeFile, readdir, unlink } from 'fs/promises';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';

const IMAGES_DIR = join(process.cwd(), 'public', 'images');
const VALID_CATEGORIES = ['profile', 'projects', 'media', 'hero', 'about', 'work', 'contact', 'nav', 'footer'];

// Ensure image directories exist
VALID_CATEGORIES.forEach(category => {
  const dir = join(IMAGES_DIR, category);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
});

// GET: Fetch all images
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');

    if (category && !VALID_CATEGORIES.includes(category)) {
      return NextResponse.json(
        { error: 'Invalid category' },
        { status: 400 }
      );
    }

    const images: Record<string, string[]> = {};

    const categoriesToFetch = category ? [category] : VALID_CATEGORIES;

    for (const cat of categoriesToFetch) {
      const categoryPath = join(IMAGES_DIR, cat);
      if (existsSync(categoryPath)) {
        const files = await readdir(categoryPath);
        images[cat] = files.filter(file =>
          /\.(jpg|jpeg|png|gif|svg|webp)$/i.test(file)
        );
      } else {
        images[cat] = [];
      }
    }

    return NextResponse.json(images);
  } catch (error) {
    console.error('Error reading images:', error);
    return NextResponse.json(
      { error: 'Failed to read images' },
      { status: 500 }
    );
  }
}

// POST: Upload image
export async function POST(request: NextRequest) {
  try {
    console.log('[API] Image upload request received');
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const category = formData.get('category') as string;
    const password = formData.get('password') as string;

    console.log('[API] Upload details:', {
      hasFile: !!file,
      filename: file?.name,
      fileSize: file?.size,
      fileType: file?.type,
      category,
      hasPassword: !!password
    });

    // Password check
    if (password !== process.env.ADMIN_PASSWORD) {
      console.log('[API] Unauthorized: Password mismatch');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (!file) {
      console.log('[API] Error: No file provided');
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    if (!category || !VALID_CATEGORIES.includes(category)) {
      console.log('[API] Error: Invalid category', category);
      return NextResponse.json(
        { error: 'Invalid category' },
        { status: 400 }
      );
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/svg+xml', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      console.log('[API] Error: Invalid file type', file.type);
      return NextResponse.json(
        { error: 'Invalid file type. Only images are allowed.' },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      console.log('[API] Error: File too large', file.size);
      return NextResponse.json(
        { error: 'File too large. Maximum size is 5MB.' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create filename
    const originalName = file.name;
    const filePath = join(IMAGES_DIR, category, originalName);

    console.log('[API] Writing file to:', filePath);

    // Write file
    await writeFile(filePath, buffer);

    console.log('[API] File written successfully');

    return NextResponse.json({
      success: true,
      message: `Image uploaded successfully`,
      filename: originalName,
      path: `/images/${category}/${originalName}`
    });
  } catch (error) {
    console.error('[API] Error uploading image:', error);
    return NextResponse.json(
      { error: 'Failed to upload image', details: (error as Error).message },
      { status: 500 }
    );
  }
}

// DELETE: Delete image
export async function DELETE(request: NextRequest) {
  try {
    const { category, filename, password } = await request.json();

    // Password check
    if (password !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (!category || !VALID_CATEGORIES.includes(category)) {
      return NextResponse.json(
        { error: 'Invalid category' },
        { status: 400 }
      );
    }

    if (!filename) {
      return NextResponse.json(
        { error: 'Filename is required' },
        { status: 400 }
      );
    }

    const filePath = join(IMAGES_DIR, category, filename);

    if (!existsSync(filePath)) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }

    await unlink(filePath);

    return NextResponse.json({
      success: true,
      message: `Image deleted successfully`
    });
  } catch (error) {
    console.error('Error deleting image:', error);
    return NextResponse.json(
      { error: 'Failed to delete image', details: (error as Error).message },
      { status: 500 }
    );
  }
}
