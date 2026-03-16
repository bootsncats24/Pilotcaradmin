import { NextResponse } from 'next/server';
import { getImageMetadata } from '@/lib/imageUtils';

// Public API route to get image metadata (no auth required)
export async function GET() {
  try {
    const metadata = await getImageMetadata();
    return NextResponse.json(metadata, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error) {
    console.error('Error getting metadata:', error);
    return NextResponse.json(
      { features: {}, featureSections: {}, homeFeatures: {}, useCases: {}, hero: null, heroContent: null, testimonials: {} },
      { status: 200 } // Return empty metadata instead of error
    );
  }
}
