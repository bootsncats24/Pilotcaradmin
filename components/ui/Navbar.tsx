'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import Button from './Button';

interface NavItem {
  href: string;
  label: string;
  dropdown?: { href: string; label: string }[];
}

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const dropdownRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      let clickedOutside = true;
      
      // Check if click is inside any dropdown
      Object.values(dropdownRefs.current).forEach((ref) => {
        if (ref && ref.contains(target)) {
          clickedOutside = false;
        }
      });

      // Also check if click is on a dropdown menu item (Link element)
      const linkElement = (target as Element).closest('a');
      if (linkElement && linkElement.getAttribute('href')?.startsWith('/')) {
        // Check if it's a dropdown item
        const isDropdownItem = Object.values(dropdownRefs.current).some((ref) => {
          return ref && ref.querySelector(`a[href="${linkElement.getAttribute('href')}"]`);
        });
        if (isDropdownItem) {
          clickedOutside = false;
        }
      }

      if (clickedOutside && openDropdown) {
        setOpenDropdown(null);
      }
    };

    if (openDropdown) {
      // Use click instead of mousedown to allow dropdown item clicks to work
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [openDropdown]);

  const navLinks: NavItem[] = [
    {
      href: '/features',
      label: 'Features',
      dropdown: [
        { href: '/invoice', label: 'Invoicing' },
        { href: '/expenses', label: 'Expenses' },
        { href: '/mileage-tracking', label: 'Mileage Tracking' },
        { href: '/calendar', label: 'Calendar & Scheduling' },
        { href: '/features', label: 'All Features' },
      ],
    },
    {
      href: '/pricing',
      label: 'Pricing',
    },
    {
      href: '/about',
      label: 'About',
    },
    {
      href: '/demo',
      label: 'Demo',
    },
    {
      href: '/contact',
      label: 'Contact',
    },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md shadow-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 transition-transform duration-200 hover:scale-105">
          <img 
            src="/pilotcaradminlogo.png" 
            alt="Pilot Car Admin 2026" 
            className="h-10 w-auto"
          />
          <span className="text-2xl font-bold text-primary-800">
            Pilot Car Admin 2026
          </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/"
              className="text-gray-700 hover:text-primary-800 font-medium transition-colors duration-200 relative group"
            >
              Home
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary-800 transition-all duration-300 group-hover:w-full"></span>
            </Link>
            {navLinks.map((link) => (
              <div 
                key={link.href} 
                className="relative"
                ref={(el) => {
                  if (link.dropdown) {
                    dropdownRefs.current[link.href] = el;
                  }
                }}
              >
                {link.dropdown ? (
                  <div
                    className="relative"
                    onMouseEnter={() => setOpenDropdown(link.href)}
                    onMouseLeave={() => setOpenDropdown(null)}
                  >
                    <Link
                      href={link.href}
                      className="text-gray-700 hover:text-primary-800 font-medium transition-colors duration-200 flex items-center gap-1 relative group py-2"
                    >
                      {link.label}
                      <svg
                        className={`w-4 h-4 transform transition-transform ${openDropdown === link.href ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                      <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary-800 transition-all duration-300 group-hover:w-full"></span>
                    </Link>
                    {openDropdown === link.href && (
                      <div 
                        className="absolute top-full left-0 pt-2 w-48 z-50"
                        onMouseEnter={() => setOpenDropdown(link.href)}
                        onMouseLeave={() => setOpenDropdown(null)}
                      >
                        <div className="bg-white rounded-lg shadow-xl border border-gray-200 py-2 animate-fade-in">
                          {link.dropdown.map((item) => (
                            <Link
                              key={item.href}
                              href={item.href}
                              className="block px-4 py-2 text-gray-700 hover:bg-primary-50 hover:text-primary-800 transition-colors cursor-pointer"
                              onClick={() => {
                                setOpenDropdown(null);
                              }}
                            >
                              {item.label}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    href={link.href}
                    className="text-gray-700 hover:text-primary-800 font-medium transition-colors duration-200 relative group"
                  >
                    {link.label}
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary-800 transition-all duration-300 group-hover:w-full"></span>
                  </Link>
                )}
              </div>
            ))}
            <Button href="/pricing" variant="primary">
              View Pricing
            </Button>
            <Button href="/pricing" variant="secondary" className="bg-primary-800 text-white hover:bg-primary-700">
              Buy Now & Save
            </Button>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden text-gray-700 hover:text-primary-800"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {isOpen ? (
                <path d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden pb-4 space-y-2">
            <Link
              href="/"
              className="block px-3 py-2 text-gray-700 hover:text-primary-800 hover:bg-primary-50 rounded-md transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Home
            </Link>
            {navLinks.map((link) => (
              <div key={link.href}>
                {link.dropdown ? (
                  <div>
                    <button
                      onClick={() => setOpenDropdown(openDropdown === link.href ? null : link.href)}
                      className="w-full flex items-center justify-between px-3 py-2 text-gray-700 hover:text-primary-800 hover:bg-primary-50 rounded-md transition-colors"
                    >
                      {link.label}
                      <svg
                        className={`w-4 h-4 transform transition-transform ${openDropdown === link.href ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {openDropdown === link.href && (
                      <div className="pl-4 space-y-1 mt-1">
                        {link.dropdown.map((item) => (
                          <Link
                            key={item.href}
                            href={item.href}
                            className="block px-3 py-2 text-sm text-gray-600 hover:text-primary-800 hover:bg-primary-50 rounded-md transition-colors"
                            onClick={() => {
                              setIsOpen(false);
                              setOpenDropdown(null);
                            }}
                          >
                            {item.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    href={link.href}
                    className="block px-3 py-2 text-gray-700 hover:text-primary-800 hover:bg-primary-50 rounded-md transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    {link.label}
                  </Link>
                )}
              </div>
            ))}
            <div className="pt-2 space-y-2">
              <Button href="/pricing" variant="primary" className="w-full">
                View Pricing
              </Button>
              <Button href="/pricing" variant="secondary" className="w-full bg-primary-800 text-white hover:bg-primary-700">
                Buy Now & Save
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
