import Link from 'next/link';

const DISCORD_INVITE_URL =
  process.env.NEXT_PUBLIC_DISCORD_INVITE_URL?.trim() || '/contact';
const hasDirectDiscordLink = DISCORD_INVITE_URL.startsWith('http');

export default function CommunityRoadmap() {
  return (
    <section className="py-16 lg:py-20 bg-gradient-to-b from-gray-50 via-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-gray-100 bg-white shadow-xl overflow-hidden">
          <div className="p-7 sm:p-9 lg:p-12">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5 mb-6">
              <div className="max-w-3xl">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary-700 mb-2">
                  Community Driven Development
                </p>
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
                  Built With the Community in Mind
                </h2>
                <p className="mt-3 text-base sm:text-lg text-gray-700 leading-relaxed">
                  Feature direction is shaped by real pilot car drivers using the app every day.
                </p>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 border border-emerald-100 h-fit">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-semibold tracking-[0.16em] text-emerald-700 uppercase">
                  Active Roadmap
                </span>
              </div>
            </div>

            <div className="grid gap-4 sm:gap-5 lg:grid-cols-3 mb-7">
              <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5">
                <p className="text-sm font-semibold uppercase tracking-wide text-gray-900 mb-2">
                  Next 2 Months
                </p>
                <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                  Complete the mobile app and launch the first public beta.
                </p>
              </div>
              <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5">
                <p className="text-sm font-semibold uppercase tracking-wide text-gray-900 mb-2">
                  After Mobile Beta
                </p>
                <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                  Build an optional web-based version for cloud access and device syncing.
                </p>
              </div>
              <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5">
                <p className="text-sm font-semibold uppercase tracking-wide text-gray-900 mb-2">
                  Long-Term
                </p>
                <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                  Expand into route guidance and, if adoption grows, a free load board for drivers.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href={DISCORD_INVITE_URL}
                target={hasDirectDiscordLink ? '_blank' : undefined}
                rel={hasDirectDiscordLink ? 'noopener noreferrer' : undefined}
                className="inline-flex items-center justify-center rounded-xl bg-primary-700 text-white px-5 py-3 font-semibold hover:bg-primary-800 transition-colors"
              >
                Join the Discord Community
              </Link>
              <Link
                href="/about"
                className="inline-flex items-center justify-center rounded-xl border border-primary-200 bg-white text-primary-800 px-5 py-3 font-semibold hover:bg-primary-50 transition-colors"
              >
                Read Full Roadmap
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
