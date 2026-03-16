import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Invoice } from '../shared/types';
import { MockDataService } from '../services/mockDataService';
import InvoiceForm from '../components/InvoiceForm';
import { formatLocalDate } from '../utils/dateUtils';

export default function Invoices() {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | undefined>();

  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = async () => {
    try {
      setLoading(true);
      const [invoicesData, customersData] = await Promise.all([
        MockDataService.getInvoices(),
        MockDataService.getCustomers(),
      ]);
      
      const invoicesWithCustomers = invoicesData.map((inv: any) => {
        const customer = customersData.find((c: any) => c.id === inv.customer_id);
        return { ...inv, customer };
      });
      
      setInvoices(invoicesWithCustomers);
    } catch (error) {
      console.error('Error loading invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNew = () => {
    setEditingInvoice(undefined);
    setShowForm(true);
  };

  const handleView = (id: number) => {
    navigate(`/invoices/${id}`);
  };

  const handleSave = () => {
    setShowForm(false);
    setEditingInvoice(undefined);
    loadInvoices();
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingInvoice(undefined);
  };

  if (showForm) {
    return (
      <>
        <div className="page-header">
          <h1 className="page-title">Invoices</h1>
        </div>
        <InvoiceForm
          invoice={editingInvoice}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      </>
    );
  }

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Invoices</h1>
        <button className="btn btn-primary" onClick={handleNew}>
          + New Invoice
        </button>
      </div>

      <div className="card">
        {invoices.length === 0 ? (
          <p style={{ color: '#6b7280' }}>No invoices yet</p>
        ) : (
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Invoice #</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Due Date</th>
                  <th>Status</th>
                  <th>Amount</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice: any) => (
                  <tr key={invoice.id} style={{ cursor: 'pointer' }} onClick={() => handleView(invoice.id)}>
                    <td style={{ fontWeight: 500 }}>{invoice.invoice_number}</td>
                    <td>{invoice.customer?.name || 'Unknown'}</td>
                    <td>{formatLocalDate(invoice.date)}</td>
                    <td>{invoice.due_date ? formatLocalDate(invoice.due_date) : '-'}</td>
                    <td>
                      <span className={`badge badge-${invoice.status}`} style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: 500,
                        backgroundColor: invoice.status === 'paid' ? '#d1fae5' : 
                                       invoice.status === 'sent' ? '#fef3c7' :
                                       invoice.status === 'overdue' ? '#fee2e2' : 
                                       invoice.status === 'draft' ? '#e5e7eb' : '#f3f4f6',
                        color: invoice.status === 'paid' ? '#065f46' :
                              invoice.status === 'sent' ? '#92400e' :
                              invoice.status === 'overdue' ? '#991b1b' : 
                              invoice.status === 'draft' ? '#374151' : '#6b7280'
                      }}>
                        {invoice.status}
                      </span>
                    </td>
                    <td style={{ fontWeight: 500 }}>${invoice.total?.toLocaleString() || '0.00'}</td>
                    <td>
                      <button 
                        className="btn btn-small btn-secondary"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleView(invoice.id);
                        }}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
