import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export interface ImageMetadata {
  features: Record<string, string | null>; // Legacy - for backward compatibility
  featureSections: Record<string, string | null>; // Format: "feature-slug-section-index" e.g., "invoice-0", "mileage-tracking-1"
  homeFeatures: Record<string, string | null>; // Format: feature slug e.g., "invoice", "expenses"
  useCases: Record<string, string | null>; // Format: use case id e.g., "solo", "small-fleet"
  hero: string | null; // Hero background image (subtle background)
  heroContent: string | null; // Hero content image (right side mockup/content area)
  testimonials: Record<string, string | null>;
}

const METADATA_PATH = join(process.cwd(), 'lib', 'image-metadata.json');

export async function getImageMetadata(): Promise<ImageMetadata> {
  try {
    if (!existsSync(METADATA_PATH)) {
      return {
        features: {},
        featureSections: {},
        homeFeatures: {},
        useCases: {},
        hero: null,
        heroContent: null,
        testimonials: {},
      };
    }
    const data = await readFile(METADATA_PATH, 'utf-8');
    const parsed = JSON.parse(data);
    // Ensure all fields exist for backward compatibility
    return {
      features: parsed.features || {},
      featureSections: parsed.featureSections || {},
      homeFeatures: parsed.homeFeatures || {},
      useCases: parsed.useCases || {},
      hero: parsed.hero || null,
      heroContent: parsed.heroContent || null,
      testimonials: parsed.testimonials || {},
    };
  } catch (error) {
    console.error('Error reading image metadata:', error);
    return {
      features: {},
      featureSections: {},
      homeFeatures: {},
      useCases: {},
      hero: null,
      heroContent: null,
      testimonials: {},
    };
  }
}

export async function updateImageMetadata(metadata: ImageMetadata): Promise<void> {
  try {
    await writeFile(METADATA_PATH, JSON.stringify(metadata, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error writing image metadata:', error);
    throw error;
  }
}

export function getImageUrl(category: 'features' | 'hero' | 'testimonials', filename: string | null): string | null {
  if (!filename) return null;
  return `/images/${category}/${filename}`;
}

export function validateImageFile(file: File): { valid: boolean; error?: string } {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  const maxSize = 5 * 1024 * 1024; // 5MB

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.',
    };
  }

  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'File size too large. Maximum size is 5MB.',
    };
  }

  return { valid: true };
}
