import React from 'react';
import { Link, useLocation } from 'react-router-dom';

type NavTab = {
  to: string;
  label: string;
  icon: string;
  matchPrefix: string;
};

const tabs: NavTab[] = [
  { to: '/', label: 'Dashboard', icon: '📊', matchPrefix: '/' },
  { to: '/invoices', label: 'Invoices', icon: '📄', matchPrefix: '/invoices' },
  { to: '/customers', label: 'Customers', icon: '👥', matchPrefix: '/customers' },
  { to: '/transactions', label: 'Expenses', icon: '💸', matchPrefix: '/transactions' },
  { to: '/reports', label: 'Reports', icon: '📈', matchPrefix: '/reports' },
  { to: '/settings', label: 'Settings', icon: '⚙️', matchPrefix: '/settings' },
];

export default function MobileBottomNav() {
  const location = useLocation();

  const isActive = (tab: NavTab) => {
    if (tab.matchPrefix === '/') return location.pathname === '/';
    return location.pathname.startsWith(tab.matchPrefix);
  };

  return (
    <nav className="mobile-bottom-nav" aria-label="Mobile navigation">
      {tabs.map((tab) => (
        <Link
          key={tab.to}
          to={tab.to}
          className={isActive(tab) ? 'active' : ''}
          aria-label={tab.label}
          aria-current={isActive(tab) ? 'page' : undefined}
        >
          <span className="mobile-bottom-nav-icon" aria-hidden="true">
            {tab.icon}
          </span>
          <span className="mobile-bottom-nav-label">{tab.label}</span>
        </Link>
      ))}
    </nav>
  );
}

