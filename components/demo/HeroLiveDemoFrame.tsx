'use client';

import { useEffect, useState } from 'react';

/**
 * Embeds the same demo app URL as `/demo` (Vite dev server in local dev, static `/demo-app/` in prod).
 * Used in the marketing hero so the preview is interactive without nesting the full `/demo` shell.
 */
export default function HeroLiveDemoFrame() {
  const [mounted, setMounted] = useState(false);
  const [demoUrl, setDemoUrl] = useState('/demo-app/');

  useEffect(() => {
    setMounted(true);
    const isDevelopment =
      typeof window !== 'undefined' &&
      (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

    if (isDevelopment) {
      setDemoUrl('http://localhost:3001');
    } else {
      setDemoUrl('/demo-app/');
    }
  }, []);

  if (!mounted) {
    return (
      <div
        className="relative w-full rounded-xl sm:rounded-2xl overflow-hidden bg-primary-950/50 border border-white/20 ring-1 ring-black/20 shadow-[0_16px_40px_-12px_rgba(0,0,0,0.45)]
        min-h-[min(45dvh,300px)] sm:min-h-[260px] md:min-h-[300px] lg:min-h-[500px]
        flex items-center justify-center"
      >
        <div className="text-center px-4">
          <div
            className="inline-block w-9 h-9 sm:w-10 sm:h-10 border-[3px] sm:border-4 border-white/20 border-t-white rounded-full animate-spin mb-2 sm:mb-3"
            aria-hidden
          />
          <p className="text-white/85 text-xs sm:text-sm font-medium">Loading live demo…</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative w-full flex flex-col rounded-xl sm:rounded-2xl overflow-hidden bg-neutral-900/40 border border-white/20 ring-1 ring-black/25 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.5)]"
    >
      {/* Window chrome + live demo hint (touch-friendly copy on small screens) */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 px-2.5 py-2 sm:px-4 sm:py-2.5 bg-black/35 border-b border-white/10">
        <div className="flex gap-1 sm:gap-1.5 shrink-0" aria-hidden>
          <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-red-400/90" />
          <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-yellow-400/90" />
          <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-green-400/90" />
        </div>
        <p className="flex-1 text-center text-[11px] leading-tight sm:text-sm font-medium text-white/90 px-1 sm:px-2 line-clamp-2 sm:line-clamp-none sm:truncate">
          <span className="sm:hidden">Tap the demo below to try it</span>
          <span className="hidden sm:inline">Live demo — click inside to try</span>
        </p>
      </div>
      <iframe
        src={demoUrl}
        title="Pilot Car Admin live demo preview"
        allow="clipboard-read; clipboard-write"
        // Hero is above the fold — load immediately
        loading="eager"
        className="w-full border-0 bg-white block
          h-[min(45dvh,300px)] min-h-[248px]
          sm:h-[280px] sm:min-h-0
          md:h-[300px]
          lg:h-[min(50vh,500px)] xl:h-[min(54vh,560px)]"
      />
    </div>
  );
}
