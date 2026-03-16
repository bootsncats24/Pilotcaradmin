'use client';

import { useEffect, useState } from 'react';

export default function DemoPage() {
  const [mounted, setMounted] = useState(false);
  const [demoUrl, setDemoUrl] = useState<string>('/demo-app/');

  useEffect(() => {
    setMounted(true);
    // In development, use the Vite dev server
    // In production, use the static files from public/demo-app
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
      <div style={{ 
        width: '100vw', 
        height: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: '#f3f4f6'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            width: '48px', 
            height: '48px', 
            border: '4px solid #e5e7eb',
            borderTop: '4px solid #6b21a8',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }}></div>
          <p style={{ color: '#6b7280', fontSize: '14px' }}>Loading demo...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        maxWidth: '100%',
        margin: 0,
        padding: 0,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Demo Banner */}
      <div style={{
        width: '100%',
        height: '40px',
        backgroundColor: '#6b21a8',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 16px',
        flexShrink: 0,
        fontSize: '14px',
        fontWeight: 500,
        margin: 0,
        boxSizing: 'border-box'
      }}>
        <span>🎯 Live Demo - Pilot Car Admin</span>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <button
            onClick={() => {
              if (window.parent !== window) {
                // If in iframe, try to close or navigate parent
                window.parent.postMessage({ type: 'close-demo' }, '*');
              } else {
                window.location.href = '/';
              }
            }}
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              color: 'white',
              padding: '4px 12px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            Close
          </button>
        </div>
      </div>
      
      {/* Iframe for demo app */}
      <iframe
        src={demoUrl}
        style={{
          width: '100%',
          height: 'calc(100vh - 40px)',
          border: 'none',
          display: 'block',
          margin: 0,
          padding: 0
        }}
        title="Pilot Car Admin Demo"
        allow="clipboard-read; clipboard-write"
      />
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}} />
    </div>
  );
}
