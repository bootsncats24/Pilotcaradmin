// Client-side utilities for image management
export interface ImageMetadata {
  features: Record<string, string | null>;
  hero: string | null;
  testimonials: Record<string, string | null>;
}

export async function getImageMetadataClient(): Promise<ImageMetadata> {
  try {
    const res = await fetch('/api/admin/metadata');
    if (!res.ok) {
      throw new Error('Failed to fetch metadata');
    }
    return await res.json();
  } catch (error) {
    console.error('Error fetching image metadata:', error);
    return {
      features: {},
      hero: null,
      testimonials: {},
    };
  }
}

export function getImageUrl(category: 'features' | 'hero' | 'testimonials', filename: string | null): string | null {
  if (!filename) return null;
  return `/images/${category}/${filename}`;
}
