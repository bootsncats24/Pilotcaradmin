import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Invoice, InvoiceReminder, Bill, Transaction } from '../shared/types';
import { MockDataService } from '../services/mockDataService';
import { formatLocalDate, getTodayLocalDate } from '../utils/dateUtils';
import { isInvoicePaid, getInvoiceDisplayStatus } from '../utils/invoiceUtils';

export default function Dashboard() {
  const navigate = useNavigate();
  const [recentInvoices, setRecentInvoices] = useState<Invoice[]>([]);
  const [upcomingReminders, setUpcomingReminders] = useState<InvoiceReminder[]>([]);
  const [upcomingBills, setUpcomingBills] = useState<Bill[]>([]);
  const [recentExpenses, setRecentExpenses] = useState<Transaction[]>([]);
  const [stats, setStats] = useState({
    totalInvoices: 0,
    totalRevenue: 0,
    pendingInvoices: 0,
    overdueInvoices: 0,
    unpaidAmount: 0,
    sentInvoices: 0,
    draftInvoices: 0,
    paidInvoices: 0,
    thisMonthRevenue: 0,
    lastMonthRevenue: 0,
    totalExpenses: 0,
    thisMonthExpenses: 0,
    lastMonthExpenses: 0,
    businessExpenses: 0,
    personalExpenses: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
    
    // Refresh data when component becomes visible again
    const handleFocus = () => {
      loadDashboardData();
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      const [allInvoices, reminders, bills, allTransactions, categories] = await Promise.all([
        MockDataService.getInvoices(),
        MockDataService.getUpcomingReminders(7),
        MockDataService.getBills({ upcoming: true }),
        MockDataService.getTransactions(),
        MockDataService.getCategories(),
      ]);

      // Enrich invoices with customer names
      const enrichedInvoices = await Promise.all(
        allInvoices.map(async (inv) => {
          if (inv.customer_id && !inv.customer) {
            const customer = await MockDataService.getCustomer(inv.customer_id);
            return { ...inv, customer, customer_name: customer?.name };
          }
          return { ...inv, customer_name: inv.customer?.name };
        })
      );

      setRecentInvoices(enrichedInvoices.slice(0, 10));
      setUpcomingReminders(reminders);
      setUpcomingBills(bills.slice(0, 5));
      
      // Enrich expenses with category info
      const enrichedExpenses = allTransactions
        .filter(t => t.is_business)
        .map(expense => {
          if (expense.category_id) {
            const category = categories.find(c => c.id === expense.category_id);
            return {
              ...expense,
              category_name: category?.name || 'Uncategorized',
              category_color: category?.color || '#95a5a6'
            };
          }
          return expense;
        });
      setRecentExpenses(enrichedExpenses.slice(0, 10));

      // Separate paid invoices from unpaid invoices
      const paidInvoicesList = enrichedInvoices.filter(inv => isInvoicePaid(inv));
      const unpaidInvoicesList = enrichedInvoices.filter(inv => {
        if (inv.status === 'cancelled') return false;
        if (isInvoicePaid(inv)) return false;
        return true;
      });

      // Calculate revenue from PAID invoices only
      const totalRevenue = paidInvoicesList.reduce((sum, inv) => sum + inv.total, 0);

      const pendingInvoices = unpaidInvoicesList.filter(
        inv => inv.status === 'sent' || inv.status === 'draft'
      ).length;

      // Calculate overdue - ONLY from UNPAID invoices
      const todayStr = getTodayLocalDate();
      const overdueInvoices = unpaidInvoicesList.filter(inv => {
        if (isInvoicePaid(inv)) return false;
        if (!inv.due_date) return false;
        return inv.due_date < todayStr;
      });

      // Calculate unpaid amount - ONLY from UNPAID invoices
      const unpaidAmount = unpaidInvoicesList
        .filter(inv => {
          if (isInvoicePaid(inv)) return false;
          return inv.status === 'sent' || (inv.due_date && inv.due_date < todayStr);
        })
        .reduce((sum, inv) => sum + inv.total, 0);

      // Count invoices by status
      const sentInvoices = enrichedInvoices.filter(inv => inv.status === 'sent').length;
      const draftInvoices = enrichedInvoices.filter(inv => inv.status === 'draft').length;
      const paidInvoices = enrichedInvoices.filter(inv => isInvoicePaid(inv)).length;

      // Calculate monthly revenue
      const today = getTodayLocalDate();
      const currentYear = parseInt(today.substring(0, 4));
      const currentMonth = parseInt(today.substring(5, 7));
      
      const thisMonthStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}`;
      const lastMonth = currentMonth === 1 ? 12 : currentMonth - 1;
      const lastMonthYear = currentMonth === 1 ? currentYear - 1 : currentYear;
      const lastMonthStr = `${lastMonthYear}-${String(lastMonth).padStart(2, '0')}`;

      const thisMonthRevenue = enrichedInvoices
        .filter(inv => {
          if (!isInvoicePaid(inv)) return false;
          return inv.date.startsWith(thisMonthStr);
        })
        .reduce((sum, inv) => sum + inv.total, 0);

      const lastMonthRevenue = enrichedInvoices
        .filter(inv => {
          if (!isInvoicePaid(inv)) return false;
          return inv.date.startsWith(lastMonthStr);
        })
        .reduce((sum, inv) => sum + inv.total, 0);

      // Calculate expense statistics
      const totalExpenses = allTransactions.reduce((sum, t) => sum + t.amount, 0);
      const businessExpenses = allTransactions.filter(t => t.is_business).reduce((sum, t) => sum + t.amount, 0);
      const personalExpenses = totalExpenses - businessExpenses;

      const thisMonthExpenses = allTransactions
        .filter(t => t.date.startsWith(thisMonthStr))
        .reduce((sum, t) => sum + t.amount, 0);

      const lastMonthExpenses = allTransactions
        .filter(t => t.date.startsWith(lastMonthStr))
        .reduce((sum, t) => sum + t.amount, 0);

      setStats({
        totalInvoices: enrichedInvoices.length,
        totalRevenue,
        pendingInvoices,
        overdueInvoices: overdueInvoices.length,
        unpaidAmount,
        sentInvoices,
        draftInvoices,
        paidInvoices,
        thisMonthRevenue,
        lastMonthRevenue,
        totalExpenses,
        thisMonthExpenses,
        lastMonthExpenses,
        businessExpenses,
        personalExpenses,
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <div className="page-header">
          <h1 className="page-title">Dashboard</h1>
        </div>
        <div className="card dashboard-loading">
          <div className="loading-spinner"></div>
          <p>Loading dashboard data...</p>
        </div>
      </>
    );
  }

  const netProfit = stats.thisMonthRevenue - stats.thisMonthExpenses;
  const netProfitChange = stats.lastMonthRevenue > 0 && stats.lastMonthExpenses > 0
    ? ((netProfit - (stats.lastMonthRevenue - stats.lastMonthExpenses)) / (stats.lastMonthRevenue - stats.lastMonthExpenses)) * 100
    : 0;

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
      </div>

      {/* Main Stats Grid */}
      <div className="dashboard-grid">
        <div className="stat-card stat-card-primary" style={{ cursor: 'pointer' }} onClick={() => navigate('/invoices')}>
          <div className="stat-card-icon">📄</div>
          <div className="stat-card-content">
            <h3 className="stat-card-label">Total Invoices</h3>
            <div className="stat-card-value">{stats.totalInvoices}</div>
            <div className="stat-card-subtext">
              {stats.paidInvoices} paid • {stats.sentInvoices} sent • {stats.draftInvoices} draft
            </div>
          </div>
        </div>

        <div className="stat-card stat-card-success">
          <div className="stat-card-icon">💰</div>
          <div className="stat-card-content">
            <h3 className="stat-card-label">Total Revenue</h3>
            <div className="stat-card-value">${stats.totalRevenue.toFixed(2)}</div>
            <div className="stat-card-subtext">All time paid invoices</div>
          </div>
        </div>

        <div className="stat-card stat-card-success">
          <div className="stat-card-icon">📅</div>
          <div className="stat-card-content">
            <h3 className="stat-card-label">This Month Revenue</h3>
            <div className="stat-card-value">${stats.thisMonthRevenue.toFixed(2)}</div>
            {stats.lastMonthRevenue > 0 && (
              <div className={`stat-card-trend ${stats.thisMonthRevenue >= stats.lastMonthRevenue ? 'trend-up' : 'trend-down'}`}>
                {stats.thisMonthRevenue >= stats.lastMonthRevenue ? '↑' : '↓'} {Math.abs(((stats.thisMonthRevenue - stats.lastMonthRevenue) / stats.lastMonthRevenue) * 100).toFixed(1)}% vs last month
              </div>
            )}
          </div>
        </div>

        <div className="stat-card stat-card-warning" style={{ cursor: 'pointer' }} onClick={() => navigate('/invoices?status=unpaid')}>
          <div className="stat-card-icon">⏳</div>
          <div className="stat-card-content">
            <h3 className="stat-card-label">Unpaid Amount</h3>
            <div className="stat-card-value">${stats.unpaidAmount.toFixed(2)}</div>
            <div className="stat-card-subtext">{stats.pendingInvoices} pending invoices</div>
          </div>
        </div>

        <div className="stat-card stat-card-danger" style={{ cursor: 'pointer' }} onClick={() => navigate('/invoices')}>
          <div className="stat-card-icon">⚠️</div>
          <div className="stat-card-content">
            <h3 className="stat-card-label">Overdue Invoices</h3>
            <div className="stat-card-value">{stats.overdueInvoices}</div>
            <div className="stat-card-subtext">Require attention</div>
          </div>
        </div>

        <div className="stat-card stat-card-expense" style={{ cursor: 'pointer' }} onClick={() => navigate('/transactions')}>
          <div className="stat-card-icon">💸</div>
          <div className="stat-card-content">
            <h3 className="stat-card-label">Total Expenses</h3>
            <div className="stat-card-value">${stats.totalExpenses.toFixed(2)}</div>
            <div className="stat-card-subtext">
              ${stats.businessExpenses.toFixed(2)} business • ${stats.personalExpenses.toFixed(2)} personal
            </div>
          </div>
        </div>

        <div className="stat-card stat-card-expense">
          <div className="stat-card-icon">📊</div>
          <div className="stat-card-content">
            <h3 className="stat-card-label">This Month Expenses</h3>
            <div className="stat-card-value">${stats.thisMonthExpenses.toFixed(2)}</div>
            {stats.lastMonthExpenses > 0 && (
              <div className={`stat-card-trend ${stats.thisMonthExpenses <= stats.lastMonthExpenses ? 'trend-up' : 'trend-down'}`}>
                {stats.thisMonthExpenses <= stats.lastMonthExpenses ? '↓' : '↑'} {Math.abs(((stats.thisMonthExpenses - stats.lastMonthExpenses) / stats.lastMonthExpenses) * 100).toFixed(1)}% vs last month
              </div>
            )}
          </div>
        </div>

        <div className="stat-card stat-card-net">
          <div className="stat-card-icon">📈</div>
          <div className="stat-card-content">
            <h3 className="stat-card-label">Net Profit (This Month)</h3>
            <div className={`stat-card-value ${netProfit >= 0 ? 'text-success' : 'text-danger'}`}>
              ${netProfit.toFixed(2)}
            </div>
            <div className="stat-card-subtext">
              Revenue: ${stats.thisMonthRevenue.toFixed(2)} - Expenses: ${stats.thisMonthExpenses.toFixed(2)}
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="dashboard-two-column">
        <div className="card dashboard-card invoice-breakdown-card">
          <div className="card-header">
            <h3>Invoice Status Breakdown</h3>
          </div>
          <div className="invoice-status-list">
            <div className="invoice-status-item invoice-status-paid">
              <div className="invoice-status-indicator"></div>
              <div className="invoice-status-info">
                <span className="invoice-status-label">Paid</span>
                <span className="invoice-status-percentage">
                  {stats.totalInvoices > 0 ? Math.round((stats.paidInvoices / stats.totalInvoices) * 100) : 0}%
                </span>
              </div>
              <div className="invoice-status-count">{stats.paidInvoices}</div>
            </div>
            
            <div className="invoice-status-item invoice-status-sent">
              <div className="invoice-status-indicator"></div>
              <div className="invoice-status-info">
                <span className="invoice-status-label">Sent</span>
                <span className="invoice-status-percentage">
                  {stats.totalInvoices > 0 ? Math.round((stats.sentInvoices / stats.totalInvoices) * 100) : 0}%
                </span>
              </div>
              <div className="invoice-status-count">{stats.sentInvoices}</div>
            </div>
            
            <div className="invoice-status-item invoice-status-draft">
              <div className="invoice-status-indicator"></div>
              <div className="invoice-status-info">
                <span className="invoice-status-label">Draft</span>
                <span className="invoice-status-percentage">
                  {stats.totalInvoices > 0 ? Math.round((stats.draftInvoices / stats.totalInvoices) * 100) : 0}%
                </span>
              </div>
              <div className="invoice-status-count">{stats.draftInvoices}</div>
            </div>
            
            {stats.overdueInvoices > 0 && (
              <div className="invoice-status-item invoice-status-overdue">
                <div className="invoice-status-indicator"></div>
                <div className="invoice-status-info">
                  <span className="invoice-status-label">Overdue</span>
                  <span className="invoice-status-percentage">
                    {stats.totalInvoices > 0 ? Math.round((stats.overdueInvoices / stats.totalInvoices) * 100) : 0}%
                  </span>
                </div>
                <div className="invoice-status-count">{stats.overdueInvoices}</div>
              </div>
            )}
          </div>
          <div className="invoice-breakdown-footer">
            <button className="btn btn-primary" onClick={() => navigate('/invoices')} style={{ width: '100%' }}>
              View All Invoices
            </button>
          </div>
        </div>
      </div>

      {/* Recent Invoices - Full Width */}
      <div className="card dashboard-card">
        <div className="card-header">
          <h3>Recent Invoices</h3>
          <button className="btn btn-small btn-secondary" onClick={() => navigate('/invoices')}>
            View All
          </button>
        </div>
        {recentInvoices.length === 0 ? (
          <div className="empty-message">
            <p>No invoices yet</p>
            <p style={{ fontSize: '0.875rem', marginTop: '0.5rem', opacity: 0.7 }}>Create your first invoice to get started</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="table" style={{ tableLayout: 'fixed', width: '100%' }}>
              <colgroup>
                <col style={{ width: '14%', minWidth: '100px' }} />
                <col style={{ width: '30%', minWidth: '150px' }} />
                <col style={{ width: '16%', minWidth: '100px' }} />
                <col style={{ width: '20%', minWidth: '120px' }} />
                <col style={{ width: '20%', minWidth: '100px' }} />
              </colgroup>
              <thead>
                <tr>
                  <th style={{ width: '14%', padding: '1.25rem 1rem', textAlign: 'left' }}>Invoice #</th>
                  <th style={{ width: '30%', padding: '1.25rem 1rem', textAlign: 'left' }}>Customer</th>
                  <th style={{ width: '16%', padding: '1.25rem 1rem', textAlign: 'left' }}>Date</th>
                  <th style={{ width: '20%', padding: '1.25rem 1rem', textAlign: 'left' }}>Status</th>
                  <th style={{ width: '20%', padding: '1.25rem 1rem', textAlign: 'right' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {recentInvoices.map((invoice) => (
                  <tr
                    key={invoice.id}
                    style={{ cursor: 'pointer' }}
                    onClick={() => navigate(`/invoices/${invoice.id}`)}
                  >
                    <td
                      data-label="Invoice #"
                      style={{ width: '14%', padding: '1.25rem 1rem', textAlign: 'left' }}
                    >
                      {invoice.invoice_number}
                    </td>
                    <td
                      data-label="Customer"
                      style={{ width: '30%', padding: '1.25rem 1rem', textAlign: 'left' }}
                    >
                      {(invoice as any).customer_name || invoice.customer?.name || 'N/A'}
                    </td>
                    <td
                      data-label="Date"
                      style={{ width: '16%', padding: '1.25rem 1rem', textAlign: 'left' }}
                    >
                      {formatLocalDate(invoice.date)}
                    </td>
                    <td
                      data-label="Status"
                      style={{ width: '20%', padding: '1.25rem 1rem', textAlign: 'left' }}
                    >
                      {(() => {
                        const displayStatus = getInvoiceDisplayStatus(invoice);
                        return (
                          <span className={`badge badge-${displayStatus}`}>
                            {displayStatus.charAt(0).toUpperCase() + displayStatus.slice(1)}
                          </span>
                        );
                      })()}
                    </td>
                    <td
                      data-label="Total"
                      style={{ width: '20%', padding: '1.25rem 1rem', textAlign: 'right' }}
                    >
                      ${invoice.total.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="dashboard-two-column">
          <div className="card dashboard-card">
            <div className="card-header">
              <h3>Upcoming Reminders (Next 7 Days)</h3>
              <button className="btn btn-small btn-secondary" onClick={() => navigate('/invoices')}>
                View All
              </button>
            </div>
            {upcomingReminders.length === 0 ? (
              <div className="empty-message">
                <p>No upcoming reminders</p>
                <p style={{ fontSize: '0.875rem', marginTop: '0.5rem', opacity: 0.7 }}>All caught up!</p>
              </div>
            ) : (
              <div className="table-wrapper">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Invoice</th>
                      <th>Customer</th>
                      <th>Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {upcomingReminders.map((reminder) => (
                      <tr
                        key={reminder.id}
                        style={{ cursor: 'pointer' }}
                        onClick={() => navigate(`/invoices/${reminder.invoice_id}`)}
                      >
                        <td data-label="Date">{formatLocalDate(reminder.reminder_date)}</td>
                        <td data-label="Invoice">
                          {(reminder as any).invoice_number || 'N/A'}
                        </td>
                        <td data-label="Customer">
                          {(reminder as any).customer_name || 'N/A'}
                        </td>
                        <td data-label="Notes">{reminder.notes || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="card dashboard-card">
            <div className="card-header">
              <h3>Upcoming Bills</h3>
              <button className="btn btn-small btn-secondary" onClick={() => navigate('/bills')}>
                View All
              </button>
            </div>
            {upcomingBills.length === 0 ? (
              <div className="empty-message">
                <p>No upcoming bills</p>
                <p style={{ fontSize: '0.875rem', marginTop: '0.5rem', opacity: 0.7 }}>No bills scheduled</p>
              </div>
            ) : (
              <div className="table-wrapper">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Bill</th>
                      <th>Due Date</th>
                      <th>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {upcomingBills.map((bill) => {
                      const today = getTodayLocalDate();
                      const isOverdue = bill.due_date < today;
                      return (
                        <tr
                          key={bill.id}
                          style={{
                            cursor: 'pointer',
                            backgroundColor: isOverdue ? '#ffebee' : 'inherit',
                          }}
                          onClick={() => navigate('/bills')}
                        >
                          <td data-label="Bill">
                            <strong>{bill.name}</strong>
                            {bill.is_recurring && (
                              <span
                                className="badge badge-paid"
                                style={{ marginLeft: '0.5rem', fontSize: '0.7rem' }}
                              >
                                Recurring
                              </span>
                            )}
                          </td>
                          <td data-label="Due Date">
                            {formatLocalDate(bill.due_date)}
                            {isOverdue && (
                              <span
                                className="badge badge-overdue"
                                style={{ marginLeft: '0.5rem' }}
                              >
                                Overdue
                              </span>
                            )}
                          </td>
                          <td data-label="Amount">${bill.amount.toFixed(2)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

      {/* Recent Expenses Section - Full Width */}
      <div className="card dashboard-card">
        <div className="card-header">
          <h3>Recent Business Expenses</h3>
          <button className="btn btn-small btn-secondary" onClick={() => navigate('/transactions')}>
            View All
          </button>
        </div>
        {recentExpenses.length === 0 ? (
          <p className="empty-message">No expenses yet</p>
        ) : (
          <div className="table-wrapper">
            <table className="table" style={{ tableLayout: 'fixed', width: '100%' }}>
              <colgroup>
                <col style={{ width: '14%', minWidth: '100px' }} />
                <col style={{ width: '30%', minWidth: '150px' }} />
                <col style={{ width: '16%', minWidth: '100px' }} />
                <col style={{ width: '20%', minWidth: '120px' }} />
                <col style={{ width: '20%', minWidth: '100px' }} />
              </colgroup>
              <thead>
                <tr>
                  <th style={{ width: '14%', padding: '1.25rem 1rem', textAlign: 'left' }}>Date</th>
                  <th style={{ width: '30%', padding: '1.25rem 1rem', textAlign: 'left' }}>Description</th>
                  <th style={{ width: '16%', padding: '1.25rem 1rem', textAlign: 'left' }}>Vendor</th>
                  <th style={{ width: '20%', padding: '1.25rem 1rem', textAlign: 'left' }}>Category</th>
                  <th style={{ width: '20%', padding: '1.25rem 1rem', textAlign: 'right' }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {recentExpenses.map((expense) => {
                  const categoryName = (expense as any).category_name || 'Uncategorized';
                  const categoryColor = (expense as any).category_color || '#95a5a6';

                  return (
                    <tr
                      key={expense.id}
                      style={{ cursor: 'pointer' }}
                      onClick={() => navigate('/transactions')}
                    >
                      <td
                        data-label="Date"
                        style={{ width: '14%', padding: '1.25rem 1rem', textAlign: 'left' }}
                      >
                        {formatLocalDate(expense.date)}
                      </td>
                      <td
                        data-label="Description"
                        style={{ width: '30%', padding: '1.25rem 1rem', textAlign: 'left' }}
                      >
                        {expense.description}
                      </td>
                      <td
                        data-label="Vendor"
                        style={{ width: '16%', padding: '1.25rem 1rem', textAlign: 'left' }}
                      >
                        {expense.vendor || '-'}
                      </td>
                      <td
                        data-label="Category"
                        style={{ width: '20%', padding: '1.25rem 1rem', textAlign: 'left' }}
                      >
                        {expense.category_id ? (
                          <span className="badge" style={{ backgroundColor: categoryColor }}>
                            {categoryName}
                          </span>
                        ) : (
                          <span className="badge badge-draft">Uncategorized</span>
                        )}
                      </td>
                      <td
                        data-label="Amount"
                        style={{ width: '20%', padding: '1.25rem 1rem', textAlign: 'right' }}
                      >
                        ${expense.amount.toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
