'use client';

import { usePathname } from 'next/navigation';
import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';

export default function ConditionalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isDemoRoute = pathname?.startsWith('/demo');

  // Hide navbar for demo route, show for all other routes
  return (
    <>
      {!isDemoRoute && <Navbar />}
      <main style={isDemoRoute ? { margin: 0, padding: 0, height: '100vh', overflow: 'hidden', display: 'block' } : {}}>
        {children}
      </main>
      {!isDemoRoute && <Footer />}
    </>
  );
}
