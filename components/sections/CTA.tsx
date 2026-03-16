import Button from '../ui/Button';

export default function CTA() {
  return (
    <section className="py-20 bg-gradient-to-r from-primary-800 to-primary-700 text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold mb-4">
          Ready to Get Started?
        </h2>
        <p className="text-xl text-primary-100 mb-4">
          Join pilot car drivers who are already managing their business more
          efficiently with Pilot Car Admin.
        </p>
        <p className="text-primary-100 mb-8 text-sm sm:text-base">
          Have questions before buying? Send a quick message and we&apos;ll
          help you decide if Pilot Car Admin is a good fit.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-stretch sm:items-center">
          <Button
            href="/pricing"
            variant="primary"
            className="w-full sm:w-auto bg-white text-primary-800 hover:bg-primary-50 text-sm sm:text-base"
          >
            View Pricing
          </Button>
          <Button
            href="/contact"
            variant="secondary"
            className="w-full sm:w-auto bg-transparent border-2 border-white text-white hover:bg-white/10 text-sm sm:text-base"
          >
            Contact Us
          </Button>
        </div>
      </div>
    </section>
  );
}
