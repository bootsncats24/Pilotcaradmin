import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Column 1 — Product */}
          <div>
            <h3 className="text-xl font-bold text-white mb-4">
              Pilot Car Admin
            </h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Simple bookkeeping and invoicing software built specifically for pilot car drivers.
              Works offline and keeps your business data on your device.
            </p>
          </div>

          {/* Column 2 — Product */}
          <div>
            <h4 className="text-white font-semibold mb-4">Product</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/features"
                  className="hover:text-white transition-colors duration-200"
                >
                  Features
                </Link>
              </li>
              <li>
                <Link
                  href="/pricing"
                  className="hover:text-white transition-colors duration-200"
                >
                  Pricing
                </Link>
              </li>
              <li>
                <Link
                  href="/demo"
                  className="hover:text-white transition-colors duration-200"
                >
                  Live Demo
                </Link>
              </li>
              <li>
                <Link
                  href="/download"
                  className="hover:text-white transition-colors duration-200"
                >
                  Download
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3 — Resources */}
          <div>
            <h4 className="text-white font-semibold mb-4">Resources</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/user-guide"
                  className="hover:text-white transition-colors duration-200"
                >
                  User Guide
                </Link>
              </li>
              <li>
                <Link
                  href="/faq"
                  className="hover:text-white transition-colors duration-200"
                >
                  FAQ
                </Link>
              </li>
              <li>
                <Link
                  href="/support"
                  className="hover:text-white transition-colors duration-200"
                >
                  Support
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4 — Company */}
          <div>
            <h4 className="text-white font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/about"
                  className="hover:text-white transition-colors duration-200"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="hover:text-white transition-colors duration-200"
                >
                  Contact
                </Link>
              </li>
              <li className="text-gray-400">
                Built by SiteOps
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar — Legal + Trust Signals */}
        <div className="border-t border-gray-800 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm">
              © {currentYear} Pilot Car Admin. All rights reserved.
            </p>
            <div className="flex flex-wrap gap-4 text-sm justify-center md:justify-end">
              <Link
                href="/privacy"
                className="hover:text-white transition-colors duration-200"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="hover:text-white transition-colors duration-200"
              >
                Terms of Service
              </Link>
              <Link
                href="/refund-policy"
                className="hover:text-white transition-colors duration-200"
              >
                Refund Policy
              </Link>
              <Link
                href="/contact"
                className="hover:text-white transition-colors duration-200"
              >
                Support
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
