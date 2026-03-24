import React, { useState, useEffect } from 'react';
import { Bill, BillStatus } from '../shared/types';
import { MockDataService } from '../services/mockDataService';
import BillForm from '../components/BillForm';
import { formatLocalDate, getTodayLocalDate } from '../utils/dateUtils';

export default function Bills() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingBill, setEditingBill] = useState<Bill | undefined>();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showUpcomingOnly, setShowUpcomingOnly] = useState(false);

  useEffect(() => {
    loadBills();
  }, [statusFilter, showUpcomingOnly]);

  const loadBills = async () => {
    try {
      setLoading(true);
      const filters: any = {};
      if (statusFilter !== 'all') {
        filters.status = statusFilter;
      }
      if (showUpcomingOnly) {
        filters.upcoming = true;
      }
      const data = await MockDataService.getBills(filters);
      setBills(data || []);
    } catch (error) {
      console.error('Error loading bills:', error);
      setBills([]);
    } finally {
      setLoading(false);
    }
  };

  const handleNew = () => {
    setEditingBill(undefined);
    setShowForm(true);
  };

  const handleEdit = (bill: Bill) => {
    setEditingBill(bill);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this bill?')) {
      return;
    }

    try {
      await MockDataService.deleteBill(id);
      loadBills();
    } catch (error) {
      console.error('Error deleting bill:', error);
      alert('Error deleting bill');
    }
  };

  const handleMarkAsPaid = async (bill: Bill) => {
    const paymentDate = prompt('Enter payment date (YYYY-MM-DD):', getTodayLocalDate());
    if (!paymentDate) return;

    try {
      await MockDataService.markBillAsPaid(bill.id!, paymentDate, bill.amount);
      loadBills();
    } catch (error) {
      console.error('Error marking bill as paid:', error);
      alert('Error marking bill as paid');
    }
  };

  const handleSave = () => {
    setShowForm(false);
    setEditingBill(undefined);
    loadBills();
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingBill(undefined);
  };

  const filteredBills = bills.filter(bill =>
    bill.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bill.vendor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bill.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const today = getTodayLocalDate();
  const isOverdue = (dueDate: string) => dueDate < today;

  if (showForm) {
    return (
      <>
        <div className="page-header">
          <h1 className="page-title">Bills</h1>
        </div>
        <BillForm
          bill={editingBill}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      </>
    );
  }

  const totalUpcoming = bills.filter(b => b.status === 'active' && b.due_date >= today).length;
  const totalOverdue = bills.filter(b => b.status === 'active' && isOverdue(b.due_date)).length;
  const totalAmount = bills.filter(b => b.status === 'active').reduce((sum, b) => sum + b.amount, 0);

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Bills</h1>
        <button 
          className="btn btn-primary" 
          onClick={handleNew}
          style={{
            padding: '0.625rem 1.25rem',
            borderRadius: '8px',
            fontSize: '0.9375rem',
            fontWeight: '600',
            boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)',
            transition: 'all 0.2s ease',
            border: 'none',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-1px)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(102, 126, 234, 0.3)';
          }}
        >
          New Bill
        </button>
      </div>

      <div className="dashboard-grid">
        <div className="stat-card stat-card-primary">
          <div className="stat-card-icon">📅</div>
          <div className="stat-card-content">
            <h3 className="stat-card-label">Upcoming Bills</h3>
            <div className="stat-card-value" style={{ color: '#3498db' }}>
              {totalUpcoming}
            </div>
            <div className="stat-card-subtext">Due soon</div>
          </div>
        </div>
        <div className="stat-card stat-card-danger">
          <div className="stat-card-icon">⚠️</div>
          <div className="stat-card-content">
            <h3 className="stat-card-label">Overdue</h3>
            <div className="stat-card-value" style={{ color: '#e74c3c' }}>
              {totalOverdue}
            </div>
            <div className="stat-card-subtext">Require attention</div>
          </div>
        </div>
        <div className="stat-card stat-card-warning">
          <div className="stat-card-icon">💰</div>
          <div className="stat-card-content">
            <h3 className="stat-card-label">Total Amount</h3>
            <div className="stat-card-value" style={{ color: '#f39c12' }}>
              ${totalAmount.toFixed(2)}
            </div>
            <div className="stat-card-subtext">Active bills</div>
          </div>
        </div>
      </div>

      <div className="search-filter">
        <input
          type="text"
          placeholder="Search bills..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All Statuses</option>
          <option value="active">Active</option>
          <option value="paid">Paid</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <input
            type="checkbox"
            checked={showUpcomingOnly}
            onChange={(e) => setShowUpcomingOnly(e.target.checked)}
          />
          Show Upcoming Only
        </label>
      </div>

      {loading ? (
        <div className="card">
          <div className="loading-spinner"></div>
        </div>
      ) : filteredBills.length === 0 ? (
        <div className="card empty-state" data-icon="bill">
          <h3>No bills found</h3>
          <p>{searchTerm || statusFilter !== 'all' ? 'Try adjusting your filters' : 'Get started by creating your first bill'}</p>
        </div>
      ) : (
        <div className="card">
          <div className="table-wrapper">
            <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Vendor</th>
                <th>Amount</th>
                <th>Due Date</th>
                <th>Recurring</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBills.map((bill) => (
                <tr key={bill.id} style={{ backgroundColor: isOverdue(bill.due_date) && bill.status === 'active' ? '#ffebee' : 'inherit' }}>
                  <td data-label="Name">
                    <strong>{bill.name}</strong>
                    {bill.description && (
                      <div style={{ fontSize: '0.85rem', color: '#7f8c8d' }}>{bill.description}</div>
                    )}
                  </td>
                  <td data-label="Vendor">{bill.vendor || '-'}</td>
                  <td data-label="Amount">${bill.amount.toFixed(2)}</td>
                  <td data-label="Due Date">
                    {formatLocalDate(bill.due_date)}
                    {isOverdue(bill.due_date) && bill.status === 'active' && (
                      <span className="badge badge-overdue" style={{ marginLeft: '0.5rem' }}>Overdue</span>
                    )}
                  </td>
                  <td data-label="Recurring">
                    {bill.is_recurring ? (
                      <span className="badge badge-paid">
                        {bill.recurrence_type === 'daily' ? 'Daily' :
                         bill.recurrence_type === 'weekly' ? 'Weekly' :
                         bill.recurrence_type === 'monthly' ? 'Monthly' :
                         bill.recurrence_type === 'yearly' ? 'Yearly' : 'Recurring'}
                        {bill.recurrence_interval && bill.recurrence_interval > 1 ? ` (${bill.recurrence_interval})` : ''}
                      </span>
                    ) : (
                      <span style={{ color: '#95a5a6' }}>-</span>
                    )}
                  </td>
                  <td data-label="Status">
                    <span className={`badge badge-${bill.status === 'active' ? 'sent' : bill.status === 'paid' ? 'paid' : 'cancelled'}`}>
                      {bill.status.charAt(0).toUpperCase() + bill.status.slice(1)}
                    </span>
                  </td>
                  <td data-label="Actions">
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {bill.status === 'active' && (
                        <button
                          className="btn btn-small btn-success"
                          onClick={() => handleMarkAsPaid(bill)}
                        >
                          Mark Paid
                        </button>
                      )}
                      <button
                        className="btn btn-small btn-secondary"
                        onClick={() => handleEdit(bill)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-small btn-danger"
                        onClick={() => handleDelete(bill.id!)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      )}
    </>
  );
}

