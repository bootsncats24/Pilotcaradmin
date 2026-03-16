import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { readdir, unlink } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

// Check authentication
async function checkAuth(): Promise<boolean> {
  const cookieStore = await cookies();
  const session = cookieStore.get('admin_session');
  return !!session;
}

// GET - List all images
export async function GET(request: NextRequest) {
  try {
    if (!(await checkAuth())) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category'); // Optional filter by category

    const images: Record<string, string[]> = {
      features: [],
      hero: [],
      testimonials: [],
    };

    const categories = category ? [category] : ['features', 'hero', 'testimonials'];

    for (const cat of categories) {
      const dirPath = join(process.cwd(), 'public', 'images', cat);
      if (existsSync(dirPath)) {
        try {
          const files = await readdir(dirPath);
          images[cat] = files.filter((file) => {
            const ext = file.toLowerCase().split('.').pop();
            return ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '');
          });
        } catch (error) {
          console.error(`Error reading ${cat} directory:`, error);
        }
      }
    }

    return NextResponse.json(images);
  } catch (error) {
    console.error('Error listing images:', error);
    return NextResponse.json(
      { error: 'Failed to list images' },
      { status: 500 }
    );
  }
}

// DELETE - Delete an image
export async function DELETE(request: NextRequest) {
  try {
    if (!(await checkAuth())) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const filename = searchParams.get('filename');

    if (!category || !filename) {
      return NextResponse.json(
        { error: 'Category and filename are required' },
        { status: 400 }
      );
    }

    if (!['features', 'hero', 'testimonials'].includes(category)) {
      return NextResponse.json(
        { error: 'Invalid category' },
        { status: 400 }
      );
    }

    const filepath = join(process.cwd(), 'public', 'images', category, filename);

    if (!existsSync(filepath)) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }

    await unlink(filepath);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting image:', error);
    return NextResponse.json(
      { error: 'Failed to delete image' },
      { status: 500 }
    );
  }
}
