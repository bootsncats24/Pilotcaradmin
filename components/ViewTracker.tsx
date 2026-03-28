'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';

/**
 * Records a page view per route change (public pages only).
 * Unique visitors are deduped server-side via long-lived httpOnly cookie `pca_vid`.
 */
export default function ViewTracker() {
  const pathname = usePathname();
  const cancelledRef = useRef(false);

  useEffect(() => {
    cancelledRef.current = false;
    if (!pathname) return;
    if (pathname.startsWith('/admin')) return;
    if (pathname.startsWith('/demo')) return;

    const t = window.setTimeout(() => {
      if (cancelledRef.current) return;
      void fetch('/api/analytics/track', {
        method: 'POST',
        credentials: 'include',
        keepalive: true,
      }).catch(() => {});
    }, 0);

    return () => {
      cancelledRef.current = true;
      window.clearTimeout(t);
    };
  }, [pathname]);

  return null;
}
