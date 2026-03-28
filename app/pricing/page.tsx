'use client';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

const GUMROAD_URL = 'https://siteops.gumroad.com/l/lgspw?wanted=true';
const DISCORD_INVITE_URL =
  process.env.NEXT_PUBLIC_DISCORD_INVITE_URL?.trim() || 'https://discord.gg/EJcMCTSn';

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero / Intro */}
      <section className="bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 text-white py-16 sm:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            Pricing · Pilot Car Admin 2026
          </h1>
          <p className="text-xl text-primary-100 mb-3">
            Bookkeeping and invoicing software built specifically for pilot car drivers.
          </p>
          <p className="text-primary-100 mb-2">
            Create invoices, track mileage for tax deductions, manage expenses, and monitor your
            business performance — all from a simple desktop application.
          </p>
          <p className="text-primary-100">
            Works completely offline, so your business data stays on your device.
          </p>
        </div>
      </section>

      {/* Desktop License */}
      <section className="py-12 sm:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="relative overflow-hidden">
            <div className="absolute top-4 right-4">
              <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700 uppercase tracking-wide">
                Launch Pricing Available
              </span>
            </div>

            <div className="grid gap-10 md:grid-cols-2 items-start">
              {/* Price / CTA */}
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                  Desktop License
                </h2>
                <p className="text-sm font-medium text-gray-500 mb-4 uppercase tracking-wide">
                  Windows Desktop Application
                </p>

                <div className="mb-4">
                  <div className="flex items-baseline gap-3">
                    <span className="text-xl text-gray-400 line-through">$199</span>
                    <span className="text-4xl font-extrabold text-primary-800">$149</span>
                    <span className="text-sm font-semibold text-green-700 bg-green-100 px-2 py-1 rounded">
                      Launch Price
                    </span>
                  </div>
                  <p className="mt-1 text-gray-600 text-sm">
                    One-time purchase. No subscription required.
                  </p>
                </div>

                <Button
                  href={GUMROAD_URL}
                  variant="primary"
                  className="w-full sm:w-auto mt-4 text-sm sm:text-base font-semibold"
                >
                  Buy Pilot Car Admin 2026 – $149
                </Button>

                <p className="mt-3 text-xs text-gray-500">
                  Button links directly to your Gumroad checkout.
                </p>
              </div>

              {/* Features */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
                  Includes:
                </h3>
                <ul className="space-y-2 text-sm text-gray-800">
                  <li>✔ Windows desktop application</li>
                  <li>
                    ✔ <strong>Pilot Car Admin mobile</strong> — included with your license; sync
                    mileage, expenses, invoices, and the rest of your data with the desktop app.{' '}
                    <strong>Android first</strong> at launch; <strong>iPhone</strong> version in
                    development.
                  </li>
                  <li>
                    ✔ <strong>Driver App</strong> — included with your license; a{' '}
                    <strong>separate</strong> app for fleet <strong>field run logging</strong> on
                    the phone (no rates on the device). Drivers export CSV; the office imports with
                    Invoice CSV Import in Pilot Car Admin on Windows.
                  </li>
                  <li>✔ Professional invoicing for pilot car runs</li>
                  <li>✔ Mileage tracking for tax deductions</li>
                  <li>✔ Expense and receipt tracking</li>
                  <li>✔ Recurring bill tracking</li>
                  <li>✔ Profit &amp; Loss and tax reports</li>
                  <li>✔ Business dashboard showing revenue, expenses, and net profit</li>
                  <li>✔ Secure local data storage (no cloud required)</li>
                </ul>

                <p className="mt-4 text-sm text-gray-700">
                  Your purchase includes all updates for the{' '}
                  <strong>Pilot Car Admin 2026</strong> version, including bug fixes and small
                  feature improvements.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Pilot Car Admin mobile: full sync companion (distinct from Driver App below) */}
      <section className="py-6">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
              Pilot Car Admin (mobile)
            </h2>
            <p className="text-sm font-medium text-gray-500 mb-3 uppercase tracking-wide">
              Same product on your phone · syncs with desktop · included with your license
            </p>
            <p className="text-sm text-gray-700 mb-3">
              This is the <strong>Pilot Car Admin</strong> mobile app—the one that keeps your
              business data in sync with the Windows app. It launches with Pilot Car Admin—{' '}
              <strong>Android first</strong>. The <strong>iPhone</strong> app is currently under
              development.
            </p>
            <p className="text-sm text-gray-700 mb-3">On your phone you can:</p>
            <ul className="list-disc list-inside text-sm text-gray-800 space-y-1 mb-3">
              <li>track mileage and expenses (including receipt capture)</li>
              <li>work with invoices, customers, and transactions</li>
              <li>sync securely with the desktop application on your network</li>
            </ul>
            <p className="text-sm text-gray-700">
              Your desktop license includes Pilot Car Admin mobile for <strong>Android</strong> at
              launch. iPhone access will follow when the iOS app ships.
            </p>
          </Card>
        </div>
      </section>

      {/* Driver App: fleet field run log (Pilot Car Driver Log) — CSV handoff to desktop */}
      <section className="py-6">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Driver App</h2>
            <p className="text-sm font-medium text-gray-500 mb-3 uppercase tracking-wide">
              Separate app · field run log for fleets · included with your license
            </p>
            <p className="text-sm text-gray-700 mb-3">
              The <strong>Driver App</strong> is <strong>not</strong> Pilot Car Admin mobile. It is a
              small, focused app (field run log) for fleets: drivers capture runs on a phone,{' '}
              <strong>without storing rates</strong> there. Billing, rates, and PDF invoices stay in
              Pilot Car Admin on Windows.
            </p>
            <p className="text-sm text-gray-700 mb-3">Drivers can:</p>
            <ul className="list-disc list-inside text-sm text-gray-800 space-y-1 mb-3">
              <li>maintain a run list (add, edit, delete)</li>
              <li>record customer, dates, from/to, billing type, miles or units, notes, and more</li>
              <li>use saved customers and destinations (including CSV import for those lists)</li>
              <li>export CSV aligned with Pilot Car Admin <strong>Invoice CSV Import</strong></li>
              <li>share or email the file to the office</li>
            </ul>
            <p className="text-sm text-gray-700">
              Your purchase includes the Driver App alongside the desktop license. Use it only if
              your workflow needs the driver-to-office CSV handoff.
            </p>
          </Card>
        </div>
      </section>

      {/* Why No Subscription / What You Receive / Support */}
      <section className="py-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <Card>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
              Why There’s No Subscription
            </h2>
            <p className="text-sm text-gray-700 mb-2">
              Pilot Car Admin is built as an offline-first desktop application, which means there
              are no required cloud servers, storage limits, or ongoing monthly fees.
            </p>
            <p className="text-sm text-gray-700 mb-2">
              You can make a one-time purchase and continue using the software for your day-to-day
              pilot car invoicing and business tracking without worrying about subscriptions.
            </p>
            <p className="text-sm text-gray-700 mb-2">
              Your business data stays stored on your own device - not locked behind an online
              account or dependent on an internet connection.
            </p>
            <p className="text-sm text-gray-700 mb-2">
              For drivers who prefer syncing, backups, or access across multiple devices, we are
              currently developing an optional online subscription-based version of Pilot Car
              Admin.
            </p>
            <p className="text-sm text-gray-700">
              This future version will provide cloud features while the offline desktop version
              will remain available as a one-time purchase solution.
            </p>
          </Card>

          <Card>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
              What You Receive After Purchase
            </h2>
            <p className="text-sm text-gray-700 mb-3">
              After completing your purchase through Gumroad you will receive:
            </p>
            <ul className="list-disc list-inside text-sm text-gray-800 space-y-1 mb-3">
              <li>a download link for the application</li>
              <li>your license key</li>
              <li>instructions for activating the software</li>
            </ul>
            <p className="text-sm text-gray-700">Activation takes less than a minute.</p>
          </Card>

          <Card>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Support</h2>
            <p className="text-sm text-gray-700 mb-2">
              If you need help installing or using the software, contact:
            </p>
            <p className="text-sm font-mono text-primary-800 mb-3">siteopstudio@gmail.com</p>
            <p className="text-sm text-gray-700 mb-3">
              Prefer Discord support? Join the community:
            </p>
            <a
              href={DISCORD_INVITE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-xl bg-primary-700 text-white px-5 py-2.5 font-semibold hover:bg-primary-800 transition-colors mb-3"
            >
              Join Discord
            </a>
            <p className="text-sm text-gray-700">
              Pilot Car Admin is built and maintained by <strong>SiteOps</strong>, a software studio
              focused on building practical tools for real-world operators.
            </p>
          </Card>

        </div>
      </section>
    </div>
  );
}
