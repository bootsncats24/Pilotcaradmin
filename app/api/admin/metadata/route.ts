import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getImageMetadata, updateImageMetadata, ImageMetadata } from '@/lib/imageUtils';

// Check authentication
async function checkAuth(): Promise<boolean> {
  const cookieStore = await cookies();
  const session = cookieStore.get('admin_session');
  return !!session;
}

// GET - Get current metadata
export async function GET() {
  try {
    if (!(await checkAuth())) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const metadata = await getImageMetadata();
    return NextResponse.json(metadata);
  } catch (error) {
    console.error('Error getting metadata:', error);
    return NextResponse.json(
      { error: 'Failed to get metadata' },
      { status: 500 }
    );
  }
}

// POST - Update metadata
export async function POST(request: NextRequest) {
  try {
    if (!(await checkAuth())) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const metadata: ImageMetadata = {
      features: body.features || {},
      featureSections: body.featureSections || {},
      homeFeatures: body.homeFeatures || {},
      useCases: body.useCases || {},
      hero: body.hero || null,
      heroContent: body.heroContent || null,
      testimonials: body.testimonials || {},
    };

    await updateImageMetadata(metadata);

    return NextResponse.json({ success: true, metadata });
  } catch (error) {
    console.error('Error updating metadata:', error);
    return NextResponse.json(
      { error: 'Failed to update metadata' },
      { status: 500 }
    );
  }
}
