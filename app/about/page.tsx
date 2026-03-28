import { Metadata } from 'next';
import Link from 'next/link';
import Button from '@/components/ui/Button';

const DISCORD_INVITE_URL =
  process.env.NEXT_PUBLIC_DISCORD_INVITE_URL?.trim() || '/contact';
const hasDirectDiscordLink = DISCORD_INVITE_URL.startsWith('http');

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
                <p className="text-base text-primary-800 font-medium italic mb-4">
                  {'\u2014'} Drew Ng
                </p>
                <p className="text-lg text-gray-700 leading-relaxed mb-4">
                  One of the biggest problems I kept running into was invoicing.
                </p>
                <p className="text-lg text-gray-700 leading-relaxed mb-4">
                  There wasn&apos;t a simple program made for how pilot car drivers actually bill.
                </p>
                <p className="text-lg text-gray-700 leading-relaxed mb-4">
                  We don&apos;t bill like normal businesses.
                </p>
                <p className="text-lg text-gray-700 leading-relaxed mb-4">
                  We bill by the loaded mile, total miles, or day rate.
                </p>
                <p className="text-lg text-gray-700 leading-relaxed mb-4">
                  Most invoicing apps are built for generic industries.
                </p>
                <p className="text-lg text-gray-700 leading-relaxed mb-4">
                  You type a description, type a price, and do all the math yourself.
                </p>
                <p className="text-lg text-gray-700 leading-relaxed mb-4">
                  There&apos;s little customization and nothing designed for the way pilot car jobs really work.
                </p>
                <p className="text-lg text-gray-900 leading-relaxed font-semibold mb-4">
                  So I built the software I wish I had.
                </p>
                <p className="text-lg text-gray-700 leading-relaxed mb-4">
                  With Pilot Car Admin, you simply enter your customer, put in the miles and job address, and the app handles the rest.
                </p>
                <p className="text-lg text-gray-700 leading-relaxed mb-4">
                  It automatically calculates totals, generates professional invoices, and reminds you when invoices are past due.
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
                  <p className="mt-2 text-base sm:text-lg text-gray-600 max-w-3xl">
                    Pilot Car Admin will continue to evolve based on feedback from real pilot car drivers using the software every day.
                  </p>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 border border-emerald-100">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-semibold tracking-[0.16em] text-emerald-700 uppercase">
                    Community Driven
                  </span>
                </div>
              </div>
              <div className="space-y-6">
                <p className="text-base sm:text-lg text-gray-700 leading-relaxed">
                  The goal is to build practical tools that make running pilot car jobs and managing the business side easier.
                </p>
                <p className="text-base sm:text-lg text-gray-700 leading-relaxed">
                  Drivers are encouraged to share ideas, request features, and be part of the development process by joining our Discord community or contacting us directly by email.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Link
                    href={DISCORD_INVITE_URL}
                    target={hasDirectDiscordLink ? '_blank' : undefined}
                    rel={hasDirectDiscordLink ? 'noopener noreferrer' : undefined}
                    className="inline-flex items-center justify-center rounded-xl bg-primary-700 text-white px-5 py-2.5 font-semibold hover:bg-primary-800 transition-colors"
                  >
                    Join the Discord Community
                  </Link>
                  <Link
                    href="mailto:siteopsstudio@gmail.com"
                    className="inline-flex items-center justify-center rounded-xl border border-primary-200 bg-white text-primary-800 px-5 py-2.5 font-semibold hover:bg-primary-50 transition-colors"
                  >
                    Email the Team
                  </Link>
                </div>
              </div>

              <div className="mt-8 grid gap-6 lg:grid-cols-2">
                <div className="rounded-2xl bg-white/85 border border-gray-100 p-6 shadow-sm">
                  <div className="mb-4 flex items-center gap-2">
                    <div className="h-8 w-8 rounded-xl bg-primary-100 flex items-center justify-center text-primary-700 font-semibold">
                      R
                    </div>
                    <p className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
                      Current Roadmap
                    </p>
                  </div>
                  <p className="text-sm sm:text-base text-gray-700 leading-relaxed mb-3">
                    The immediate focus is completing development of the mobile app and launching the first public beta. This is expected within the next two months.
                  </p>
                  <p className="text-sm sm:text-base text-gray-700 leading-relaxed mb-3">
                    After the mobile release, development will shift toward building an optional web-based version of Pilot Car Admin for drivers who prefer cloud access and syncing across devices.
                  </p>
                  <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                    The online version will initially launch in beta. Because cloud infrastructure and database services have ongoing operating costs, long-term availability of the online version will depend on user adoption and demand.
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-900 text-slate-50 p-6 shadow-lg border border-slate-800 relative overflow-hidden">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(56,189,248,0.18),transparent_55%)]" />
                  <div className="relative">
                    <div className="mb-4 flex items-center gap-2">
                      <div className="h-8 w-8 rounded-xl bg-slate-800 flex items-center justify-center text-sky-300 font-semibold">
                        V
                      </div>
                      <p className="text-sm font-semibold text-slate-100 uppercase tracking-wide">
                        Long-Term Vision
                      </p>
                    </div>
                    <p className="text-sm sm:text-base text-slate-100/90 leading-relaxed mb-3">
                      As the Pilot Car Admin community grows, the goal is to continue expanding the software into a complete set of tools designed specifically for pilot car drivers.
                    </p>
                    <p className="text-sm sm:text-base text-slate-100/90 leading-relaxed mb-3">
                      Future plans include custom route guidance tools to help drivers better follow runs, manage detours, and stay organized during complex or multi-day jobs.
                    </p>
                    <p className="text-sm sm:text-base text-slate-100/90 leading-relaxed mb-3">
                      The vision is to provide practical features that support real-world pilot car operations, not generic navigation or logistics tools.
                    </p>
                    <p className="text-sm sm:text-base text-slate-100/90 leading-relaxed mb-3">
                      If adoption continues to grow, we would also like to launch a free load board for pilot car drivers to help connect drivers with available work and reduce time spent searching for loads.
                    </p>
                    <p className="text-sm sm:text-base text-slate-100/90 leading-relaxed">
                      The long-term objective is to build a simple ecosystem for invoicing, job tracking, routing, and business operations in one place, shaped by feedback from drivers using Pilot Car Admin every day.
                    </p>
                  </div>
                </div>
              </div>
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
