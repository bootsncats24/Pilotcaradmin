import Button from '../ui/Button';
import { getImageMetadata } from '@/lib/imageUtils';
import Image from 'next/image';

export default async function Hero() {
  const imageMetadata = await getImageMetadata();
  const heroImageUrl = imageMetadata.hero ? `/images/features/${imageMetadata.hero}` : null;
  const heroContentImageUrl = imageMetadata.heroContent ? `/images/features/${imageMetadata.heroContent}` : null;

  return (
    <section className="relative bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 text-white py-16 lg:py-28 overflow-hidden">
      {/* Mesh Gradient Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary-600/30 via-transparent to-transparent"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-primary-500/20 via-transparent to-transparent"></div>
      
      {/* Hero Image Background */}
      {heroImageUrl && (
        <div className="absolute inset-0 opacity-10">
          <Image
            src={heroImageUrl}
            alt="Hero"
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
        </div>
      )}
      
      {/* Enhanced animated background elements with better positioning */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-[800px] h-[800px] bg-primary-400 rounded-full blur-[120px] opacity-40 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-[800px] h-[800px] bg-primary-300 rounded-full blur-[120px] opacity-40 animate-pulse" style={{ animationDelay: '1.5s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] bg-primary-500 rounded-full blur-[150px] opacity-30 animate-pulse" style={{ animationDelay: '3s' }}></div>
      </div>

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]"></div>

      {/* Floating particles with better visibility */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white/20 animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${Math.random() * 3 + 1}px`,
              height: `${Math.random() * 3 + 1}px`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${Math.random() * 15 + 15}s`,
            }}
          />
        ))}
      </div>

      {/* Shine effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 animate-shimmer pointer-events-none"></div>

      {/* Animated gradient orbs that move */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-primary-400 rounded-full blur-[100px] opacity-30 animate-float-slow"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary-300 rounded-full blur-[100px] opacity-30 animate-float-slow" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-primary-500 rounded-full blur-[90px] opacity-25 animate-float-slow" style={{ animationDelay: '4s' }}></div>
      </div>

      {/* Geometric shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-64 h-64 border border-white/10 rotate-45 animate-spin-slow"></div>
        <div className="absolute bottom-1/4 left-1/4 w-48 h-48 border border-white/10 rounded-full animate-pulse"></div>
        <div className="absolute top-1/2 left-1/3 w-32 h-32 border-2 border-white/10 rotate-12 animate-float-slow"></div>
      </div>

      {/* Spotlight effect */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(255,255,255,0.1),transparent_70%)] pointer-events-none"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Content */}
          <div className="text-center lg:text-left">
          {/* Credibility Line */}
          <div className="mb-8 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 backdrop-blur-md rounded-full border border-white/20 shadow-lg hover:bg-white/15 transition-all duration-300 group">
              <div className="relative">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <div className="absolute inset-0 w-2 h-2 bg-green-400 rounded-full animate-ping opacity-75"></div>
              </div>
              <p className="text-white text-sm sm:text-base font-semibold tracking-wide group-hover:scale-105 transition-transform duration-300">
                Built by a pilot car driver, for pilot car drivers
              </p>
            </div>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold mb-8 leading-[1.1] animate-fade-in tracking-tight">
            <span className="block text-white drop-shadow-2xl mb-2 relative">
              <span className="relative z-10">Invoicing, mileage, and expenses</span>
              <span className="absolute inset-0 bg-gradient-to-r from-white/20 via-primary-200/30 to-white/20 blur-2xl -z-0"></span>
            </span>
            <span className="block text-white drop-shadow-2xl relative mt-2">
              <span className="relative z-10 inline-block">— without the headache</span>
              <span className="absolute inset-0 bg-gradient-to-r from-primary-400/20 via-primary-300/30 to-primary-400/20 blur-2xl -z-0"></span>
            </span>
          </h1>
          
          {/* Sub-headline */}
          <p className="text-lg sm:text-xl lg:text-2xl text-primary-100 mb-10 max-w-4xl mx-auto lg:mx-0 font-medium leading-relaxed animate-fade-in" style={{ animationDelay: '0.2s' }}>
            Professional invoicing and expense tracking designed from real pilot car work.
            <br className="hidden sm:block" />
            <span className="text-white font-semibold">
              Works offline, syncs with mobile, and keeps you paid.
            </span>
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start items-stretch sm:items-center mb-12 animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <Button
              href="/demo"
              variant="primary"
              className="w-full sm:w-auto group relative bg-white text-primary-800 hover:bg-primary-50 text-sm sm:text-base px-6 sm:px-8 py-3 sm:py-4 shadow-2xl hover:shadow-white/30 transform hover:scale-105 transition-all duration-300 font-bold rounded-xl overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-2">
                Try Live Demo
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
              <span className="absolute inset-0 bg-gradient-to-r from-primary-50 to-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></span>
            </Button>
            <Button
              href="/pricing"
              variant="secondary"
              className="w-full sm:w-auto group relative bg-white/10 backdrop-blur-md border-2 border-white/30 text-white hover:bg-white/20 hover:border-white/50 text-sm sm:text-base px-6 sm:px-8 py-3 sm:py-4 shadow-xl hover:shadow-white/20 transform hover:scale-105 transition-all duration-300 font-semibold rounded-xl"
            >
              <span className="relative z-10">View Pricing</span>
              <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
              <span className="absolute inset-0 rounded-xl border-2 border-white/0 group-hover:border-white/30 transition-all duration-300"></span>
            </Button>
          </div>

          {/* Additional Trust Elements */}
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 text-sm sm:text-base text-white animate-fade-in" style={{ animationDelay: '0.6s' }}>
            <div className="group flex items-center gap-3 px-5 py-3 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 hover:bg-white/20 hover:border-white/30 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105">
              <div className="relative">
                <svg className="w-6 h-6 text-blue-300 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <div className="absolute inset-0 bg-blue-300/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              <span className="font-semibold">Secure & Private</span>
            </div>
            <div className="group flex items-center gap-3 px-5 py-3 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 hover:bg-white/20 hover:border-white/30 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105">
              <div className="relative">
                <svg className="w-6 h-6 text-purple-300 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <div className="absolute inset-0 bg-purple-300/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              <span className="font-semibold">Works Offline</span>
            </div>
          </div>
          </div>

          {/* Right Column - App Preview/Mockup */}
          <div className="hidden lg:block relative animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <div className="relative">
              {/* Glow effect behind mockup */}
              <div className="absolute inset-0 bg-gradient-to-r from-primary-400/30 via-primary-300/40 to-primary-400/30 blur-3xl rounded-3xl transform scale-110"></div>
              
              {heroContentImageUrl ? (
                /* Custom image content */
                <div className="relative bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl p-8 transform hover:scale-105 transition-all duration-500 overflow-hidden">
                  <div className="relative w-full aspect-[4/5] rounded-2xl overflow-hidden">
                    <Image
                      src={heroContentImageUrl}
                      alt="App Preview"
                      fill
                      className="object-contain"
                      sizes="(max-width: 1024px) 0vw, 50vw"
                    />
                  </div>
                  {/* Floating badge */}
                  <div className="absolute -top-4 -right-4 bg-gradient-to-r from-primary-400 to-primary-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-xl animate-bounce-slow">
                    ✨ New
                  </div>
                </div>
              ) : (
                /* Default mockup container */
                <div className="relative bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl p-8 transform hover:scale-105 transition-all duration-500">
                  {/* Mockup header */}
                  <div className="flex items-center gap-2 mb-6">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-400/80"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-400/80"></div>
                      <div className="w-3 h-3 rounded-full bg-green-400/80"></div>
                    </div>
                    <div className="flex-1 h-6 bg-white/10 rounded-lg"></div>
                  </div>
                  
                  {/* Mockup content - App preview */}
                  <div className="space-y-4">
                    <div className="h-8 bg-white/10 rounded-lg"></div>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="h-20 bg-gradient-to-br from-primary-400/20 to-primary-500/20 rounded-lg border border-white/10"></div>
                      <div className="h-20 bg-gradient-to-br from-primary-300/20 to-primary-400/20 rounded-lg border border-white/10"></div>
                      <div className="h-20 bg-gradient-to-br from-primary-500/20 to-primary-600/20 rounded-lg border border-white/10"></div>
                    </div>
                    <div className="h-32 bg-white/5 rounded-lg border border-white/10 p-4 space-y-2">
                      <div className="h-4 bg-white/10 rounded w-3/4"></div>
                      <div className="h-4 bg-white/10 rounded w-1/2"></div>
                      <div className="h-4 bg-white/10 rounded w-2/3"></div>
                    </div>
                  </div>

                  {/* Floating badge */}
                  <div className="absolute -top-4 -right-4 bg-gradient-to-r from-primary-400 to-primary-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-xl animate-bounce-slow">
                    ✨ New
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
