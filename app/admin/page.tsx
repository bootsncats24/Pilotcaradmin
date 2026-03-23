'use client';

import { useState, useEffect } from 'react';
import { getFeatureBySlug } from '@/lib/features';
import { ALL_FEATURES_PAGE_ITEMS } from '@/lib/all-features-page';

interface ImageMetadata {
  features: Record<string, string | null>;
  featureSections: Record<string, string | null>;
  homeFeatures: Record<string, string | null>;
  useCases: Record<string, string | null>;
  hero: string | null;
  heroContent: string | null;
  testimonials: Record<string, string | null>;
}

interface ImageList {
  features: string[];
  hero: string[];
  testimonials: string[];
}

const FEATURE_SLUGS = ['invoice', 'expenses', 'mileage-tracking', 'calendar', 'jobs', 'offline', 'sync', 'security'];
const USE_CASE_IDS = ['solo', 'small-fleet', 'large-operations', 'contractors'];
const HOME_FEATURE_SLUGS = ['mileage-tracking', 'invoice', 'jobs', 'offline', 'expenses', 'sync', 'security'];
export default function AdminPanel() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Image management state
  const [images, setImages] = useState<ImageList>({ features: [], hero: [], testimonials: [] });
  const [metadata, setMetadata] = useState<ImageMetadata>({
    features: {},
    featureSections: {},
    homeFeatures: {},
    useCases: {},
    hero: null,
    heroContent: null,
    testimonials: {},
  });
  const [selectedTab, setSelectedTab] = useState<'hero' | 'home-features' | 'all-features' | 'feature-sections' | 'use-cases' | 'testimonials'>('hero');
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState<string>('invoice');

  // Check authentication on mount
  useEffect(() => {
    checkAuth();
    if (isAuthenticated) {
      loadImages();
      loadMetadata();
    }
  }, [isAuthenticated]);

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/admin/login');
      const data = await res.json();
      setIsAuthenticated(data.authenticated);
    } catch (error) {
      setIsAuthenticated(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setIsAuthenticated(true);
        setPassword('');
        loadImages();
        loadMetadata();
      } else {
        setError(data.error || 'Invalid password');
      }
    } catch (error) {
      setError('Failed to login');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/admin/login', { method: 'DELETE' });
    setIsAuthenticated(false);
    setImages({ features: [], hero: [], testimonials: [] });
    setMetadata({
      features: {},
      featureSections: {},
      homeFeatures: {},
      useCases: {},
      hero: null,
      heroContent: null,
      testimonials: {},
    });
  };

  const loadImages = async () => {
    try {
      const res = await fetch('/api/admin/images');
      const data = await res.json();
      setImages(data);
    } catch (error) {
      console.error('Error loading images:', error);
    }
  };

  const loadMetadata = async () => {
    try {
      const res = await fetch('/api/admin/metadata');
      const data = await res.json();
      // Ensure all fields exist
      setMetadata({
        features: data.features || {},
        featureSections: data.featureSections || {},
        homeFeatures: data.homeFeatures || {},
        useCases: data.useCases || {},
        hero: data.hero || null,
        heroContent: data.heroContent || null,
        testimonials: data.testimonials || {},
      });
    } catch (error) {
      console.error('Error loading metadata:', error);
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }

    setUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('category', 'features'); // All images go to features folder

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (res.ok && data.success) {
        await loadImages();
        setError('');
      } else {
        setError(data.error || 'Failed to upload image');
      }
    } catch (error) {
      setError('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleDeleteImage = async (filename: string) => {
    if (!confirm(`Are you sure you want to delete ${filename}?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/images?category=features&filename=${encodeURIComponent(filename)}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        await loadImages();
        // Clear metadata if this image was assigned anywhere
        const newMetadata = { ...metadata };
        Object.keys(newMetadata.featureSections).forEach((key) => {
          if (newMetadata.featureSections[key] === filename) {
            newMetadata.featureSections[key] = null;
          }
        });
        Object.keys(newMetadata.features).forEach((key) => {
          if (newMetadata.features[key] === filename) {
            newMetadata.features[key] = null;
          }
        });
        Object.keys(newMetadata.homeFeatures).forEach((key) => {
          if (newMetadata.homeFeatures[key] === filename) {
            newMetadata.homeFeatures[key] = null;
          }
        });
        Object.keys(newMetadata.useCases).forEach((key) => {
          if (newMetadata.useCases[key] === filename) {
            newMetadata.useCases[key] = null;
          }
        });
        if (newMetadata.hero === filename) {
          newMetadata.hero = null;
        }
        if (newMetadata.heroContent === filename) {
          newMetadata.heroContent = null;
        }
        setMetadata(newMetadata);
        await saveMetadata(newMetadata);
      }
    } catch (error) {
      setError('Failed to delete image');
    }
  };

  const saveMetadata = async (newMetadata: ImageMetadata) => {
    try {
      const res = await fetch('/api/admin/metadata', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMetadata),
      });

      if (res.ok) {
        await loadMetadata();
      }
    } catch (error) {
      setError('Failed to save metadata');
    }
  };

  const assignImage = (key: string, filename: string | null, section: 'hero' | 'heroContent' | 'features' | 'featureSections' | 'homeFeatures' | 'useCases' | 'testimonials') => {
    // Update local state immediately for instant feedback
    const newMetadata = { ...metadata };

    if (section === 'hero') {
      newMetadata.hero = filename;
    } else if (section === 'heroContent') {
      newMetadata.heroContent = filename;
    } else if (section === 'features') {
      newMetadata.features[key] = filename || null;
    } else if (section === 'featureSections') {
      newMetadata.featureSections[key] = filename || null;
    } else if (section === 'homeFeatures') {
      newMetadata.homeFeatures[key] = filename || null;
    } else if (section === 'useCases') {
      newMetadata.useCases[key] = filename || null;
    } else if (section === 'testimonials') {
      newMetadata.testimonials[key] = filename || null;
    }

    setMetadata(newMetadata);
  };

  const handleSave = async () => {
    setError('');
    setLoading(true);
    
    try {
      const res = await fetch('/api/admin/metadata', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(metadata),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setError('');
        // Show success message briefly
        const successMsg = 'Images saved successfully!';
        setError(successMsg);
        setTimeout(() => setError(''), 3000);
        // Reload to verify
        await loadMetadata();
      } else {
        setError(data.error || 'Failed to save metadata');
      }
    } catch (error) {
      setError('Failed to save metadata. Please try again.');
      console.error('Save error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Login screen
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
          <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">Admin Login</h1>
          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-800"
                required
              />
            </div>
            {error && (
              <div className="mb-4 text-red-600 text-sm">{error}</div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-800 text-white py-2 px-4 rounded-md hover:bg-primary-900 disabled:opacity-50"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Admin dashboard
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Admin Panel - Photo Management</h1>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className={`mb-4 px-4 py-3 rounded ${
            error.includes('successfully') 
              ? 'bg-green-50 border border-green-200 text-green-700' 
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}>
            {error}
          </div>
        )}

        {/* Save Button */}
        <div className="mb-6 flex justify-between items-center bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4">
          <div className="text-sm text-yellow-800">
            <strong>Important:</strong> After selecting images, click the button below to save your changes.
          </div>
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-6 py-3 bg-primary-800 text-white rounded-md hover:bg-primary-900 disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-md"
          >
            {loading ? 'Saving...' : '💾 Save All Changes'}
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6 flex gap-4 border-b overflow-x-auto">
          {([
            { id: 'hero', label: 'Hero Image' },
            { id: 'home-features', label: 'Home Page Features' },
            { id: 'all-features', label: 'All Features Page' },
            { id: 'feature-sections', label: 'Feature Page Sections' },
            { id: 'use-cases', label: 'Use Cases' },
            { id: 'testimonials', label: 'Testimonials' },
          ] as const).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id)}
              className={`px-4 py-2 font-medium whitespace-nowrap ${
                selectedTab === tab.id
                  ? 'border-b-2 border-primary-800 text-primary-800'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Upload Section */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Upload Image</h2>
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-8 text-center ${
              dragActive ? 'border-primary-800 bg-primary-50' : 'border-gray-300'
            }`}
          >
            <input
              type="file"
              id="file-upload"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            <label
              htmlFor="file-upload"
              className="cursor-pointer block"
            >
              <div className="text-gray-600 mb-2">
                {uploading ? 'Uploading...' : 'Drag and drop an image here, or click to select'}
              </div>
              <div className="text-sm text-gray-500">
                Supported formats: JPEG, PNG, GIF, WebP (Max 5MB)
              </div>
            </label>
          </div>
        </div>

        {/* Content based on selected tab */}
        <div className="bg-white rounded-lg shadow p-6" style={{ position: 'relative', zIndex: 10 }}>
          {selectedTab === 'hero' && (
            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-bold mb-2">Hero Section Image</h2>
                <p className="text-gray-600 text-sm">
                  This image appears as a subtle background in the hero section on the homepage. 
                  Upload an image above, then select it here to set it as the hero background.
                </p>
              </div>

              {/* Current Selection Preview */}
              {metadata.hero && (
                <div className="mb-6 p-4 bg-primary-50 border-2 border-primary-200 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-primary-900">Current Hero Image</h3>
                    <button
                      onClick={() => assignImage('', null, 'hero')}
                      className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="relative w-full h-48 bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 rounded-lg overflow-hidden">
                    <img
                      src={`/images/features/${metadata.hero}`}
                      alt="Hero Preview"
                      className="w-full h-full object-cover opacity-20"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <p className="text-white font-semibold text-lg">Hero Section Preview</p>
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-gray-600">Filename: {metadata.hero}</p>
                </div>
              )}

              {/* Image Selection */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  {metadata.hero ? 'Change Hero Image' : 'Select Hero Image'}
                </label>
                <p className="text-sm text-gray-500 mb-4">
                  Click on any image below to select it as the hero background image. Don't forget to click "Save All Changes" at the top to apply your selection.
                </p>
                <div className="mb-4">
                  <button
                    onClick={() => assignImage('', null, 'hero')}
                    className={`px-4 py-2 rounded-md border-2 transition-all ${
                      !metadata.hero
                        ? 'bg-primary-800 text-white border-primary-800'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-primary-800'
                    }`}
                  >
                    {metadata.hero ? 'Clear Selection' : 'No Image (Use Gradient Only)'}
                  </button>
                </div>
                {images.features.length === 0 ? (
                  <div className="p-8 text-center border-2 border-dashed border-gray-300 rounded-lg">
                    <p className="text-gray-500 mb-2">No images uploaded yet</p>
                    <p className="text-sm text-gray-400">Upload an image above to get started</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 max-h-96 overflow-y-auto p-2 border border-gray-200 rounded-lg">
                    {images.features.map((img) => (
                      <div
                        key={img}
                        onClick={() => assignImage('', img, 'hero')}
                        className={`cursor-pointer border-2 rounded-lg overflow-hidden transition-all hover:shadow-lg ${
                          metadata.hero === img
                            ? 'border-primary-800 ring-2 ring-primary-800 shadow-lg scale-105'
                            : 'border-gray-300 hover:border-primary-600'
                        }`}
                        title="Click to select this image"
                      >
                        <div className="relative w-full h-32 bg-gray-100">
                          <img
                            src={`/images/features/${img}`}
                            alt={img}
                            className="w-full h-full object-cover"
                          />
                          {metadata.hero === img && (
                            <div className="absolute top-2 right-2 bg-primary-800 text-white text-xs px-2 py-1 rounded-full font-semibold">
                              Selected
                            </div>
                          )}
                        </div>
                        <div className="p-2 bg-white">
                          <p className="text-xs text-gray-600 truncate" title={img}>{img}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Instructions */}
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">💡 Tips for Hero Background Image</h4>
                <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                  <li>Hero background images appear at 10% opacity as a subtle background</li>
                  <li>Recommended: Wide landscape images (1920x1080 or similar)</li>
                  <li>The image should complement the purple gradient background</li>
                  <li>Images are automatically optimized and displayed responsively</li>
                </ul>
              </div>

              {/* Hero Content Image Section */}
              <div className="mt-12 pt-12 border-t-2 border-gray-200">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold mb-2">Hero Content Image (Right Side)</h2>
                  <p className="text-gray-600 text-sm">
                    This image appears in the right column of the hero section, replacing the default mockup. 
                    This is typically a screenshot or preview of your app/product.
                  </p>
                </div>

                {/* Current Selection Preview */}
                {metadata.heroContent && (
                  <div className="mb-6 p-4 bg-primary-50 border-2 border-primary-200 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-primary-900">Current Hero Content Image</h3>
                      <button
                        onClick={() => assignImage('', null, 'heroContent')}
                        className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                    <div className="relative w-full h-64 bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 rounded-lg overflow-hidden">
                      <img
                        src={`/images/features/${metadata.heroContent}`}
                        alt="Hero Content Preview"
                        className="w-full h-full object-contain p-4"
                      />
                    </div>
                    <p className="mt-2 text-sm text-gray-600">Filename: {metadata.heroContent}</p>
                  </div>
                )}

                {/* Image Selection */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    {metadata.heroContent ? 'Change Hero Content Image' : 'Select Hero Content Image'}
                  </label>
                  <p className="text-sm text-gray-500 mb-4">
                    Click on any image below to select it as the hero content image (shown on the right side). Don't forget to click "Save All Changes" at the top to apply your selection.
                  </p>
                  <div className="mb-4">
                    <button
                      onClick={() => assignImage('', null, 'heroContent')}
                      className={`px-4 py-2 rounded-md border-2 transition-all ${
                        !metadata.heroContent
                          ? 'bg-primary-800 text-white border-primary-800'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-primary-800'
                      }`}
                    >
                      {metadata.heroContent ? 'Clear Selection' : 'No Image (Use Default Mockup)'}
                    </button>
                  </div>
                  {images.features.length === 0 ? (
                    <div className="p-8 text-center border-2 border-dashed border-gray-300 rounded-lg">
                      <p className="text-gray-500 mb-2">No images uploaded yet</p>
                      <p className="text-sm text-gray-400">Upload an image above to get started</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 max-h-96 overflow-y-auto p-2 border border-gray-200 rounded-lg">
                      {images.features.map((img) => (
                        <div
                          key={img}
                          onClick={() => assignImage('', img, 'heroContent')}
                          className={`cursor-pointer border-2 rounded-lg overflow-hidden transition-all hover:shadow-lg ${
                            metadata.heroContent === img
                              ? 'border-primary-800 ring-2 ring-primary-800 shadow-lg scale-105'
                              : 'border-gray-300 hover:border-primary-600'
                          }`}
                          title="Click to select this image"
                        >
                          <div className="relative w-full h-32 bg-gray-100">
                            <img
                              src={`/images/features/${img}`}
                              alt={img}
                              className="w-full h-full object-cover"
                            />
                            {metadata.heroContent === img && (
                              <div className="absolute top-2 right-2 bg-primary-800 text-white text-xs px-2 py-1 rounded-full font-semibold">
                                Selected
                              </div>
                            )}
                          </div>
                          <div className="p-2 bg-white">
                            <p className="text-xs text-gray-600 truncate" title={img}>{img}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Instructions */}
                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">💡 Tips for Hero Content Image</h4>
                  <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                    <li>This image appears in the right column of the hero section</li>
                    <li>Recommended: App screenshot, product preview, or marketing image</li>
                    <li>Square or portrait orientation works well (e.g., 800x1000 or 1200x1500)</li>
                    <li>If no image is selected, a default CSS mockup will be shown</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {selectedTab === 'home-features' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Home Page Feature Cards</h2>
              <div className="space-y-6">
                {HOME_FEATURE_SLUGS.map((slug) => (
                  <div key={slug} className="border-b pb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
                      {slug.replace('-', ' ')} Feature Card
                    </label>
                    <div className="mb-4">
                      <button
                        onClick={() => assignImage(slug, null, 'homeFeatures')}
                        className={`px-4 py-2 rounded-md border-2 ${
                          !metadata.homeFeatures[slug]
                            ? 'bg-primary-800 text-white border-primary-800'
                            : 'bg-white text-gray-700 border-gray-300 hover:border-primary-800'
                        }`}
                      >
                        None
                      </button>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-h-64 overflow-y-auto mb-4">
                      {images.features.map((img) => (
                        <div
                          key={img}
                          onClick={() => assignImage(slug, img, 'homeFeatures')}
                          className={`cursor-pointer border-2 rounded-lg overflow-hidden transition-all ${
                            metadata.homeFeatures[slug] === img
                              ? 'border-primary-800 ring-2 ring-primary-800'
                              : 'border-gray-300 hover:border-primary-600'
                          }`}
                        >
                          <img
                            src={`/images/features/${img}`}
                            alt={img}
                            className="w-full h-24 object-contain bg-gray-100"
                          />
                          <div className="p-1 text-xs text-gray-600 truncate">{img}</div>
                        </div>
                      ))}
                    </div>
                    {metadata.homeFeatures[slug] && (
                      <div className="mt-2">
                        <p className="text-sm text-gray-600 mb-2">Selected: {metadata.homeFeatures[slug]}</p>
                        <img
                          src={`/images/features/${metadata.homeFeatures[slug]}`}
                          alt={slug}
                          className="max-w-md h-auto rounded"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedTab === 'feature-sections' && (() => {
            const feature = getFeatureBySlug(selectedFeature);
            const sectionCount = feature?.sections?.length || 0;
            const sectionIndices = Array.from({ length: sectionCount }, (_, i) => i);
            
            return (
              <div>
                <h2 className="text-xl font-semibold mb-4">Feature Page Sections</h2>
                <p className="text-sm text-gray-600 mb-4">
                  Select a feature below, then assign images to each section. Click on any image to select it for that section. 
                  All sections for each feature are shown (e.g., Calendar has 4 sections including "Smart scheduling features").
                </p>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Feature
                  </label>
                  <select
                    value={selectedFeature}
                    onChange={(e) => setSelectedFeature(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-800"
                    style={{ zIndex: 9999, position: 'relative', pointerEvents: 'auto' }}
                  >
                    {FEATURE_SLUGS.map((slug) => (
                      <option key={slug} value={slug}>{slug.replace('-', ' ')}</option>
                    ))}
                  </select>
                </div>
                {sectionCount === 0 ? (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-yellow-800">No sections found for this feature.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {sectionIndices.map((sectionIndex) => {
                      const sectionKey = `${selectedFeature}-${sectionIndex}`;
                      const sectionTitle = feature?.sections[sectionIndex]?.title || `Section ${sectionIndex + 1}`;
                      return (
                        <div key={sectionIndex} className="border-b pb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Section {sectionIndex + 1}: {sectionTitle}
                          </label>
                          <div className="mb-4">
                            <button
                              onClick={() => assignImage(sectionKey, null, 'featureSections')}
                              className={`px-4 py-2 rounded-md border-2 ${
                                !metadata.featureSections[sectionKey]
                                  ? 'bg-primary-800 text-white border-primary-800'
                                  : 'bg-white text-gray-700 border-gray-300 hover:border-primary-800'
                              }`}
                            >
                              None
                            </button>
                          </div>
                          <p className="text-xs text-gray-500 mb-2">Click an image below to assign it to this section:</p>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-h-64 overflow-y-auto mb-4">
                            {images.features.map((img) => (
                              <div
                                key={img}
                                onClick={() => assignImage(sectionKey, img, 'featureSections')}
                                className={`cursor-pointer border-2 rounded-lg overflow-hidden transition-all ${
                                  metadata.featureSections[sectionKey] === img
                                    ? 'border-primary-800 ring-2 ring-primary-800'
                                    : 'border-gray-300 hover:border-primary-600'
                                }`}
                                title="Click to select this image"
                              >
                                <img
                                  src={`/images/features/${img}`}
                                  alt={img}
                                  className="w-full h-24 object-contain bg-gray-100"
                                />
                                <div className="p-1 text-xs text-gray-600 truncate">{img}</div>
                              </div>
                            ))}
                          </div>
                          {metadata.featureSections[sectionKey] && (
                            <div className="mt-2">
                              <p className="text-sm text-gray-600 mb-2">Selected: {metadata.featureSections[sectionKey]}</p>
                              <img
                                src={`/images/features/${metadata.featureSections[sectionKey]}`}
                                alt={`Section ${sectionIndex + 1}`}
                                className="max-w-md h-auto rounded"
                              />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })()}

          {selectedTab === 'all-features' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">All Features Page Images</h2>
              <p className="text-sm text-gray-600 mb-4">
                These images are used on the main <code>/features</code> page. Assign one image per feature card.
              </p>
              <div className="space-y-6">
                {ALL_FEATURES_PAGE_ITEMS.map((slot) => (
                  <div key={slot.key} className="border-b pb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {slot.title}
                    </label>
                    <div className="mb-4">
                      <button
                        onClick={() => assignImage(slot.key, null, 'features')}
                        className={`px-4 py-2 rounded-md border-2 ${
                          !metadata.features[slot.key]
                            ? 'bg-primary-800 text-white border-primary-800'
                            : 'bg-white text-gray-700 border-gray-300 hover:border-primary-800'
                        }`}
                      >
                        None
                      </button>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-h-64 overflow-y-auto mb-4">
                      {images.features.map((img) => (
                        <div
                          key={img}
                          onClick={() => assignImage(slot.key, img, 'features')}
                          className={`cursor-pointer border-2 rounded-lg overflow-hidden transition-all ${
                            metadata.features[slot.key] === img
                              ? 'border-primary-800 ring-2 ring-primary-800'
                              : 'border-gray-300 hover:border-primary-600'
                          }`}
                        >
                          <img
                            src={`/images/features/${img}`}
                            alt={img}
                            className="w-full h-24 object-contain bg-gray-100"
                          />
                          <div className="p-1 text-xs text-gray-600 truncate">{img}</div>
                        </div>
                      ))}
                    </div>
                    {metadata.features[slot.key] && (
                      <div className="mt-2">
                        <p className="text-sm text-gray-600 mb-2">Selected: {metadata.features[slot.key]}</p>
                        <img
                          src={`/images/features/${metadata.features[slot.key]}`}
                          alt={slot.title}
                          className="max-w-md h-auto rounded"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedTab === 'use-cases' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Use Case Images</h2>
              <div className="space-y-6">
                {USE_CASE_IDS.map((useCaseId) => (
                  <div key={useCaseId} className="border-b pb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
                      {useCaseId.replace('-', ' ')} Use Case
                    </label>
                    <div className="mb-4">
                      <button
                        onClick={() => assignImage(useCaseId, null, 'useCases')}
                        className={`px-4 py-2 rounded-md border-2 ${
                          !metadata.useCases[useCaseId]
                            ? 'bg-primary-800 text-white border-primary-800'
                            : 'bg-white text-gray-700 border-gray-300 hover:border-primary-800'
                        }`}
                      >
                        None
                      </button>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-h-64 overflow-y-auto mb-4">
                      {images.features.map((img) => (
                        <div
                          key={img}
                          onClick={() => assignImage(useCaseId, img, 'useCases')}
                          className={`cursor-pointer border-2 rounded-lg overflow-hidden transition-all ${
                            metadata.useCases[useCaseId] === img
                              ? 'border-primary-800 ring-2 ring-primary-800'
                              : 'border-gray-300 hover:border-primary-600'
                          }`}
                        >
                          <img
                            src={`/images/features/${img}`}
                            alt={img}
                            className="w-full h-24 object-contain bg-gray-100"
                          />
                          <div className="p-1 text-xs text-gray-600 truncate">{img}</div>
                        </div>
                      ))}
                    </div>
                    {metadata.useCases[useCaseId] && (
                      <div className="mt-2">
                        <p className="text-sm text-gray-600 mb-2">Selected: {metadata.useCases[useCaseId]}</p>
                        <img
                          src={`/images/features/${metadata.useCases[useCaseId]}`}
                          alt={useCaseId}
                          className="max-w-md h-auto rounded"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedTab === 'testimonials' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Testimonial Photos</h2>
              <div className="space-y-6">
                {[0, 1, 2].map((index) => (
                  <div key={index} className="border-b pb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Testimonial {index + 1} Photo
                    </label>
                    <div className="mb-4">
                      <button
                        onClick={() => assignImage(index.toString(), null, 'testimonials')}
                        className={`px-4 py-2 rounded-md border-2 ${
                          !metadata.testimonials[index.toString()]
                            ? 'bg-primary-800 text-white border-primary-800'
                            : 'bg-white text-gray-700 border-gray-300 hover:border-primary-800'
                        }`}
                      >
                        None
                      </button>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-h-64 overflow-y-auto mb-4">
                      {images.testimonials.map((img) => (
                        <div
                          key={img}
                          onClick={() => assignImage(index.toString(), img, 'testimonials')}
                          className={`cursor-pointer border-2 rounded-lg overflow-hidden transition-all ${
                            metadata.testimonials[index.toString()] === img
                              ? 'border-primary-800 ring-2 ring-primary-800'
                              : 'border-gray-300 hover:border-primary-600'
                          }`}
                        >
                          <img
                            src={`/images/testimonials/${img}`}
                            alt={img}
                            className="w-full h-24 object-contain bg-gray-100"
                          />
                          <div className="p-1 text-xs text-gray-600 truncate">{img}</div>
                        </div>
                      ))}
                    </div>
                    {metadata.testimonials[index.toString()] && (
                      <div className="mt-2">
                        <p className="text-sm text-gray-600 mb-2">Selected: {metadata.testimonials[index.toString()]}</p>
                        <img
                          src={`/images/testimonials/${metadata.testimonials[index.toString()]}`}
                          alt={`Testimonial ${index + 1}`}
                          className="max-w-md h-auto rounded"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Image Gallery */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4">All Uploaded Images ({images.features.length})</h3>
            {images.features.length === 0 ? (
              <p className="text-gray-500">No images uploaded yet</p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {images.features.map((filename) => (
                  <div key={filename} className="relative group">
                    <img
                      src={`/images/features/${filename}`}
                      alt={filename}
                      className="w-full h-32 object-cover rounded border"
                    />
                    <button
                      onClick={() => handleDeleteImage(filename)}
                      className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 rounded text-sm opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
