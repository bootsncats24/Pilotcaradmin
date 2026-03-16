'use client';

import { useState, useEffect } from 'react';

interface DemoEmbedProps {
  className?: string;
}

export default function DemoEmbed({ className }: DemoEmbedProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className={`flex items-center justify-center p-8 bg-gray-100 rounded-lg ${className || ''}`}>
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-gray-300 border-t-primary-800 rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600">Loading demo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative w-full ${className || ''}`} style={{ minHeight: '600px' }}>
      <iframe
        src="/demo"
        className="w-full h-full border-0 rounded-lg shadow-lg"
        style={{ minHeight: '600px' }}
        title="Pilot Car Admin Live Demo"
        allow="clipboard-read; clipboard-write"
      />
    </div>
  );
}
