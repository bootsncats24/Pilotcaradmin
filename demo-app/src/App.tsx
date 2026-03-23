import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import CustomerCSVImport from './pages/CustomerCSVImport';
import Destinations from './pages/Destinations';
import DestinationCSVImport from './pages/DestinationCSVImport';
import Invoices from './pages/Invoices';
import Transactions from './pages/Transactions';
import CSVImport from './pages/CSVImport';
import InvoiceCSVImport from './pages/InvoiceCSVImport';
import Categories from './pages/Categories';
import Receipts from './pages/Receipts';
import Mileage from './pages/Mileage';
import MileageCSVImport from './pages/MileageCSVImport';
import CalendarCSVImport from './pages/CalendarCSVImport';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Guide from './pages/Guide';
import Bills from './pages/Bills';
import Calendar from './pages/Calendar';
import InvoiceView from './components/InvoiceView';
import CustomerView from './components/CustomerView';
import DestinationView from './components/DestinationView';
import TransactionView from './components/TransactionView';
import MobileBottomNav from './MobileBottomNav';
import * as authService from './services/auth';
import { MockDataService } from './services/mockDataService';
import './App.css';

function Navigation() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [expensesMenuOpen, setExpensesMenuOpen] = React.useState(false);
  const [showLogo, setShowLogo] = React.useState(true);
  
  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const closeMenus = () => {
    setMobileMenuOpen(false);
    setExpensesMenuOpen(false);
  };

  const handleSync = () => {
    alert("This is a demo. Saving, syncing, and OCR are available in the full app.");
  };

  const handleLogoError = () => {
    // Hide logo immediately on error to prevent flickering
    setShowLogo(false);
  };
  
  return (
    <nav className="nav">
      <div className="nav-brand">
        {showLogo && (
          <img 
            src="/pilotcaradminlogo.png" 
            alt="Pilot Car Admin Logo" 
            onError={handleLogoError}
            style={{ display: 'block' }}
          />
        )}
        <span>Pilot Car Admin</span>
      </div>
      <button 
        className={`nav-toggle ${mobileMenuOpen ? 'active' : ''}`}
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        aria-label="Toggle menu"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>
      <div className={`nav-links ${mobileMenuOpen ? 'nav-links-open' : ''}`}>
        <Link to="/" className={isActive('/') ? 'active' : ''} onClick={closeMenus}>
          <span className="nav-icon">📊</span>
          <span className="nav-text">Dashboard</span>
        </Link>
        <Link to="/invoices" className={isActive('/invoices') ? 'active' : ''} onClick={closeMenus}>
          <span className="nav-icon">📄</span>
          <span className="nav-text">Invoices</span>
        </Link>
        <Link to="/customers" className={isActive('/customers') ? 'active' : ''} onClick={closeMenus}>
          <span className="nav-icon">👥</span>
          <span className="nav-text">Customers</span>
        </Link>
        <Link to="/destinations" className={isActive('/destinations') ? 'active' : ''} onClick={closeMenus}>
          <span className="nav-icon">📍</span>
          <span className="nav-text">Destinations</span>
        </Link>
        <Link to="/calendar" className={isActive('/calendar') ? 'active' : ''} onClick={closeMenus}>
          <span className="nav-icon">📅</span>
          <span className="nav-text">Calendar</span>
        </Link>
        <div 
          className={`nav-dropdown ${expensesMenuOpen ? 'open' : ''} ${isActive('/transactions') || isActive('/bills') || isActive('/receipts') || isActive('/mileage') || isActive('/csv-import') ? 'active' : ''}`}
          onMouseEnter={() => setExpensesMenuOpen(true)}
          onMouseLeave={() => setExpensesMenuOpen(false)}
        >
          <button className="nav-dropdown-toggle" onClick={() => setExpensesMenuOpen(!expensesMenuOpen)}>
            <span className="nav-icon">💰</span>
            <span className="nav-text">Expenses</span>
            <span className="nav-arrow">▼</span>
          </button>
          <div className="nav-dropdown-menu">
            <Link to="/transactions" className={isActive('/transactions') ? 'active' : ''} onClick={closeMenus}>
              <span className="nav-icon">💸</span>
              <span>Transactions</span>
            </Link>
            <Link to="/bills" className={isActive('/bills') ? 'active' : ''} onClick={closeMenus}>
              <span className="nav-icon">📋</span>
              <span>Bills</span>
            </Link>
            <Link to="/receipts" className={isActive('/receipts') ? 'active' : ''} onClick={closeMenus}>
              <span className="nav-icon">🧾</span>
              <span>Receipts</span>
            </Link>
            <Link to="/mileage" className={isActive('/mileage') ? 'active' : ''} onClick={closeMenus}>
              <span className="nav-icon">🚗</span>
              <span>Mileage</span>
            </Link>
            <Link to="/csv-import" className={isActive('/csv-import') ? 'active' : ''} onClick={closeMenus}>
              <span className="nav-icon">📥</span>
              <span>Import CSV</span>
            </Link>
          </div>
        </div>
        <Link to="/reports" className={isActive('/reports') ? 'active' : ''} onClick={closeMenus}>
          <span className="nav-icon">📈</span>
          <span className="nav-text">Reports</span>
        </Link>
        <Link to="/settings" className={isActive('/settings') ? 'active' : ''} onClick={closeMenus}>
          <span className="nav-icon">⚙️</span>
          <span className="nav-text">Settings</span>
        </Link>
        <Link to="/guide" className={isActive('/guide') ? 'active' : ''} onClick={closeMenus}>
          <span className="nav-icon">📖</span>
          <span className="nav-text">Guide</span>
        </Link>
        <button
          className="nav-sync-btn"
          onClick={handleSync}
          title="Sync App (Demo)"
        >
          <span className="nav-icon">🔄</span>
          <span className="nav-text">Sync</span>
        </button>
      </div>
    </nav>
  );
}

// Protected route component - simplified for demo
function ProtectedRoute({ children }: { children: React.ReactElement }) {
  // In demo mode, skip all authentication and license checks
  useEffect(() => {
    authService.setAuthenticated(true);
  }, []);

  return children;
}

function App() {
  return (
    <Router>
      <div className="app">
        <div className="demo-banner">
          🎯 Interactive UI Preview • This demo uses sample data. Saving, syncing, and OCR are available in the full app.
        </div>
        <Routes>
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <>
                  <div className="desktop-nav">
                    <Navigation />
                  </div>
                  <main className="main-content">
                    <Routes>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/customers" element={<Customers />} />
                      <Route path="/customers/import" element={<CustomerCSVImport />} />
                      <Route path="/customers/:id" element={<CustomerView />} />
                      <Route path="/destinations" element={<Destinations />} />
                      <Route path="/destinations/import" element={<DestinationCSVImport />} />
                      <Route path="/destinations/:id" element={<DestinationView />} />
                      <Route path="/invoices" element={<Invoices />} />
                      <Route path="/invoices/:id" element={<InvoiceView />} />
                      <Route path="/invoices/import" element={<InvoiceCSVImport />} />
                      <Route path="/transactions" element={<Transactions />} />
                      <Route path="/transactions/:id" element={<TransactionView />} />
                      <Route path="/bills" element={<Bills />} />
                      <Route path="/csv-import" element={<CSVImport />} />
                      <Route path="/categories" element={<Categories />} />
                      <Route path="/receipts" element={<Receipts />} />
                      <Route path="/mileage" element={<Mileage />} />
                      <Route path="/mileage/import" element={<MileageCSVImport />} />
                      <Route path="/calendar" element={<Calendar />} />
                      <Route path="/calendar/import" element={<CalendarCSVImport />} />
                      <Route path="/reports" element={<Reports />} />
                      <Route path="/settings" element={<Settings />} />
                      <Route path="/guide" element={<Guide />} />
                    </Routes>
                  </main>
                  <MobileBottomNav />
                </>
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
