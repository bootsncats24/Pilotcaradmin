import { Metadata } from 'next';
import Button from '@/components/ui/Button';

export const metadata: Metadata = {
  title: 'About Pilot Car Admin 2026 | Built by a Driver, for Drivers',
  description: 'Learn why Pilot Car Admin 2026 was created by a pilot car driver with 10+ years on the road and 5 years as an office manager. Built with real-world experience in mind.',
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 text-white py-20 lg:py-28">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Built by a Driver,<br />
              <span className="text-primary-200">for Drivers</span>
            </h1>
            <p className="text-xl text-primary-100 max-w-2xl mx-auto">
              Real pilot car experience. Real software solutions.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 lg:py-24 bg-gradient-to-b from-gray-50 via-white to-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14 lg:space-y-16">
          {/* Why I Built Pilot Car Admin */}
          <div className="relative overflow-hidden mb-4 bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-primary-50">
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute -top-24 -right-24 w-72 h-72 bg-primary-100 rounded-full blur-3xl opacity-70" />
              <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-primary-50 rounded-full blur-3xl opacity-70" />
            </div>
            <div className="relative p-8 lg:p-12">
              <div className="flex items-center gap-3 mb-6">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-primary-100 text-primary-800 shadow-sm">
                  <span className="text-xl font-semibold">01</span>
                </span>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary-600">
                    Story
                  </p>
                  <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">
                    Why I Built Pilot Car Admin
                  </h2>
                </div>
              </div>
              <div className="prose prose-lg max-w-none">
                <p className="text-lg text-gray-700 leading-relaxed mb-4">
                  I started developing Pilot Car Admin after more than 10 years working as a pilot car driver.
                </p>
                <p className="text-lg text-gray-700 leading-relaxed mb-4">
                  One of the biggest problems I kept running into was invoicing. There wasn’t a simple program made for how pilot car drivers actually bill.
                </p>
                <div className="rounded-2xl border border-dashed border-primary-200 bg-primary-50/60 px-4 py-3 mb-4 text-sm sm:text-base text-primary-900 font-medium">
                  We don’t bill like normal businesses. We bill by the loaded mile, total miles, or day rate.
                </div>
                <p className="text-lg text-gray-700 leading-relaxed mb-4">
                  Most invoicing apps are built for generic industries — you type a description, type a price, and do all the math yourself. There’s little customization and nothing designed for the way pilot car jobs really work.
                </p>
                <p className="text-lg text-gray-900 leading-relaxed font-semibold mb-4">
                  So I built the software I wish I had.
                </p>
                <p className="text-lg text-gray-700 leading-relaxed mb-4">
                  With Pilot Car Admin, you simply enter your customer, put in the miles and job address, and the app handles the rest. It automatically calculates totals, generates professional invoices, and reminds you when invoices are past due.
                </p>
                <p className="text-lg text-gray-700 leading-relaxed">
                  It also includes expense tracking so you can manage the business side of pilot car driving in one place.
                </p>
              </div>
            </div>
          </div>

          {/* Built for Drivers & Backed by SiteOps */}
          <div className="grid gap-10 lg:gap-12 lg:grid-cols-2">
            {/* Built for Drivers — Not Accountants */}
            <div className="bg-white rounded-3xl shadow-lg p-7 lg:p-9 border border-gray-100 relative overflow-hidden">
              <div className="absolute -top-10 -right-10 h-28 w-28 rounded-full bg-primary-100 opacity-80 blur-xl" />
              <div className="relative">
                <div className="inline-flex items-center gap-2 rounded-full bg-primary-50 px-3 py-1 mb-4">
                  <span className="h-2 w-2 rounded-full bg-primary-500" />
                  <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary-700">
                    Philosophy
                  </span>
                </div>
                <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
                  Built for Drivers — Not Accountants
                </h2>
                <p className="text-base sm:text-lg text-gray-700 leading-relaxed mb-4">
                  Pilot Car Admin was designed specifically with pilot car drivers in mind. The goal was to create something simple, fast, and practical after long days on the road.
                </p>
                <p className="text-base sm:text-lg text-gray-700 leading-relaxed mb-4">
                  The software is completely offline. There are no subscriptions, no cloud data limits, and no worries about your business data being stored on servers you don’t control.
                </p>
                <p className="text-base sm:text-lg text-gray-900 leading-relaxed font-semibold">
                  Your data stays with you.
                </p>
              </div>
            </div>

            {/* Built by a Driver. Backed by SiteOps. */}
            <div className="bg-slate-900 text-slate-50 rounded-3xl shadow-xl p-7 lg:p-9 border border-slate-800 relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.17),transparent_55%)]" />
              <div className="relative">
                <div className="inline-flex items-center gap-2 rounded-full bg-slate-800/70 px-3 py-1 mb-4">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-100">
                    Who&apos;s Behind It
                  </span>
                </div>
                <h2 className="text-2xl lg:text-3xl font-bold mb-4">
                  Built by a Driver. Backed by SiteOps.
                </h2>
                <p className="text-base sm:text-lg text-slate-100/90 leading-relaxed mb-4">
                  Pilot Car Admin is developed and maintained through SiteOps, my software company focused on building practical tools for real-world operators.
                </p>
                <p className="text-base sm:text-lg text-slate-100/90 leading-relaxed">
                  SiteOps handles the engineering and long-term maintenance while the direction of the app comes directly from real pilot car experience.
                </p>
              </div>
            </div>
          </div>

          {/* Built With the Community in Mind */}
          <div className="mb-2 bg-white rounded-3xl shadow-xl p-8 lg:p-12 border border-gray-100 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.06),transparent_55%),radial-gradient(circle_at_bottom_right,_rgba(16,185,129,0.06),transparent_55%)]" />
            <div className="relative">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">
                    Built With the Community in Mind
                  </h2>
                  <p className="mt-2 text-base sm:text-lg text-gray-600">
                    Road-tested ideas from drivers guide where the app goes next.
                  </p>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 border border-emerald-100">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-semibold tracking-[0.16em] text-emerald-700 uppercase">
                    Active Development
                  </span>
                </div>
              </div>
              <div className="grid gap-6 md:grid-cols-3">
                <div className="rounded-2xl bg-white/80 border border-gray-100 p-5 shadow-sm">
                  <div className="mb-3 flex items-center gap-2">
                    <div className="h-8 w-8 rounded-xl bg-primary-100 flex items-center justify-center text-primary-700 font-semibold">
                      1
                    </div>
                    <p className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
                      Route Tools
                    </p>
                  </div>
                  <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                    Route tools to better follow runs and detours, built around how pilots actually move with a load.
                  </p>
                </div>
                <div className="rounded-2xl bg-white/80 border border-gray-100 p-5 shadow-sm">
                  <div className="mb-3 flex items-center gap-2">
                    <div className="h-8 w-8 rounded-xl bg-primary-100 flex items-center justify-center text-primary-700 font-semibold">
                      2
                    </div>
                    <p className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
                      Multi-Day Jobs
                    </p>
                  </div>
                  <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                    Improved tools for multi-day and complex jobs so long runs are easier to price, track, and invoice.
                  </p>
                </div>
                <div className="rounded-2xl bg-white/80 border border-gray-100 p-5 shadow-sm">
                  <div className="mb-3 flex items-center gap-2">
                    <div className="h-8 w-8 rounded-xl bg-primary-100 flex items-center justify-center text-primary-700 font-semibold">
                      3
                    </div>
                    <p className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
                      Free Load Board
                    </p>
                  </div>
                  <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                    Eventually launching a free load board if the user base grows large enough to support it.
                  </p>
                </div>
              </div>
              <p className="mt-6 text-base sm:text-lg text-gray-700 leading-relaxed">
                The goal is to keep building software that actually helps pilot car drivers run their business more easily.
              </p>
            </div>
          </div>

          {/* CTA Section */}
          <div className="bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 rounded-3xl p-8 lg:p-12 text-center border border-primary-600/70 shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.16),transparent_55%)]" />
            <div className="relative">
              <h3 className="text-2xl lg:text-3xl font-bold text-white mb-4">
                Ready to Get Started?
              </h3>
              <p className="text-lg text-primary-100 mb-6 max-w-2xl mx-auto">
                Built from real experience, designed for real work. One-time purchase. Your data, on your devices.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-stretch sm:items-center">
                <Button
                  href="/pricing"
                  variant="primary"
                  className="w-full sm:w-auto bg-white text-primary-800 hover:bg-primary-50 text-base px-8 py-3 font-semibold shadow-lg hover:shadow-xl"
                >
                  View Pricing
                </Button>
                <Button
                  href="/features"
                  variant="secondary"
                  className="w-full sm:w-auto bg-primary-900/70 border-2 border-white/80 text-white hover:bg-primary-800 text-base px-8 py-3 font-semibold"
                >
                  View Features
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
