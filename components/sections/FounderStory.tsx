export default function FounderStory() {
  return (
    <section className="py-16 lg:py-20 bg-gradient-to-b from-gray-50 via-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:gap-10 lg:grid-cols-5">
          <div className="lg:col-span-3 bg-white rounded-3xl shadow-xl border border-primary-50 overflow-hidden">
            <div className="p-8 lg:p-10">
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

              <div className="space-y-4">
                <p className="text-lg text-gray-700 leading-relaxed">
                  I started developing Pilot Car Admin after more than 10 years working as a pilot car driver.
                </p>
                <p className="text-base text-primary-800 font-medium italic">
                  {'\u2014'} Drew Ng
                </p>
                <p className="text-lg text-gray-700 leading-relaxed">
                  One of the biggest problems I kept running into was invoicing.
                </p>
                <p className="text-lg text-gray-700 leading-relaxed">
                  There wasn&apos;t a simple program made for how pilot car drivers actually bill.
                </p>
                <p className="text-lg text-gray-700 leading-relaxed">
                  We don&apos;t bill like normal businesses.
                </p>
                <p className="text-lg text-gray-700 leading-relaxed">
                  We bill by the loaded mile, total miles, or day rate.
                </p>
                <p className="text-lg text-gray-700 leading-relaxed">
                  Most invoicing apps are built for generic industries.
                </p>
                <p className="text-lg text-gray-700 leading-relaxed">
                  You type a description, type a price, and do all the math yourself.
                </p>
                <p className="text-lg text-gray-700 leading-relaxed">
                  There&apos;s little customization and nothing designed for the way pilot car jobs really work.
                </p>
                <p className="text-lg text-gray-900 leading-relaxed font-semibold">
                  So I built the software I wish I had.
                </p>
                <p className="text-lg text-gray-700 leading-relaxed">
                  With Pilot Car Admin, you simply enter your customer, put in the miles and job address, and the app handles the rest.
                </p>
                <p className="text-lg text-gray-700 leading-relaxed">
                  It automatically calculates totals, generates professional invoices, and reminds you when invoices are past due.
                </p>
                <p className="text-lg text-gray-700 leading-relaxed">
                  It also includes expense tracking so you can manage the business side of pilot car driving in one place.
                </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 bg-white rounded-3xl shadow-lg p-7 lg:p-9 border border-gray-100 relative overflow-hidden h-fit">
            <div className="absolute -top-10 -right-10 h-28 w-28 rounded-full bg-primary-100 opacity-80 blur-xl" />
            <div className="relative">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary-50 px-3 py-1 mb-4">
                <span className="h-2 w-2 rounded-full bg-primary-500" />
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary-700">
                  Philosophy
                </span>
              </div>
              <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
                Built for Drivers - Not Accountants
              </h3>
              <p className="text-base sm:text-lg text-gray-700 leading-relaxed mb-4">
                Pilot Car Admin was designed specifically with pilot car drivers in mind. The goal was to create something simple, fast, and practical after long days on the road.
              </p>
              <p className="text-base sm:text-lg text-gray-700 leading-relaxed mb-4">
                The software is completely offline. There are no subscriptions, no cloud data limits, and no worries about your business data being stored on servers you do not control.
              </p>
              <p className="text-base sm:text-lg text-gray-900 leading-relaxed font-semibold">
                Your data stays with you.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
