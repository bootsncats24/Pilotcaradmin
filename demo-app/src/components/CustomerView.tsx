import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Customer, Invoice } from '../shared/types';
import { MockDataService } from '../services/mockDataService';
import { formatLocalDate } from '../utils/dateUtils';
import { getInvoiceDisplayStatus } from '../utils/invoiceUtils';
import InvoiceActionsBar from './InvoiceActionsBar';

export default function CustomerView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (id) {
        await loadCustomer(parseInt(id));
        await loadCustomerInvoices(parseInt(id));
      }
    };
    load();
  }, [id]);

  const loadCustomer = async (customerId: number) => {
    try {
      setLoading(true);
      const data = await MockDataService.getCustomer(customerId);
      if (data) {
        setCustomer(data);
      } else {
        alert('Customer not found');
        navigate('/customers');
      }
    } catch (error) {
      console.error('Error loading customer:', error);
      alert(`Error loading customer: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const loadCustomerInvoices = async (customerId: number) => {
    try {
      const data = await MockDataService.getInvoices({ customerId });
      setInvoices(data || []);
    } catch (error) {
      console.error('Error loading customer invoices:', error);
      setInvoices([]);
    }
  };

  const handleEdit = () => {
    if (customer) {
      // Navigate to customers page with edit state
      navigate('/customers', { 
        state: { 
          editCustomerId: customer.id 
        } 
      });
    }
  };

  if (loading) {
    return (
      <div className="card">
        <div style={{ textAlign: 'center', padding: '2rem' }}>Loading...</div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="card">
        <div style={{ textAlign: 'center', padding: '2rem' }}>Customer not found</div>
      </div>
    );
  }

  return (
    <>
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <h1 className="page-title">Customer Details</h1>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button className="btn btn-secondary" onClick={() => navigate('/customers')}>
              Back to Customers
            </button>
            <button className="btn btn-primary" onClick={handleEdit}>
              Edit Customer
            </button>
          </div>
        </div>
      </div>

      <div className="card">
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ marginBottom: '1rem', borderBottom: '2px solid #e8e8e8', paddingBottom: '0.5rem' }}>
            {customer.name}
          </h2>

          <div className="responsive-two-col" style={{ marginBottom: '2rem' }}>
            <div>
              <h3 style={{ marginBottom: '0.75rem', color: '#555' }}>Contact Information</h3>
              
              {customer.phones && customer.phones.length > 0 ? (
                <div style={{ marginBottom: '1rem' }}>
                  <strong>Phones:</strong>
                  <ul style={{ marginTop: '0.5rem', marginLeft: '1.5rem' }}>
                    {customer.phones.map((phone, index) => (
                      <li key={index}>
                        {phone.phone}
                        {phone.label && <span style={{ color: '#666', marginLeft: '0.5rem' }}>({phone.label})</span>}
                        {phone.is_primary && (
                          <span className="badge badge-paid" style={{ marginLeft: '0.5rem', fontSize: '0.75rem' }}>
                            Primary
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : customer.phone ? (
                <div style={{ marginBottom: '1rem' }}>
                  <strong>Phone:</strong> {customer.phone}
                </div>
              ) : null}

              {customer.emails && customer.emails.length > 0 ? (
                <div style={{ marginBottom: '1rem' }}>
                  <strong>Emails:</strong>
                  <ul style={{ marginTop: '0.5rem', marginLeft: '1.5rem' }}>
                    {customer.emails.map((email, index) => (
                      <li key={index}>
                        {email.email}
                        {email.label && <span style={{ color: '#666', marginLeft: '0.5rem' }}>({email.label})</span>}
                        {email.is_primary && (
                          <span className="badge badge-paid" style={{ marginLeft: '0.5rem', fontSize: '0.75rem' }}>
                            Primary
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : customer.email ? (
                <div style={{ marginBottom: '1rem' }}>
                  <strong>Email:</strong> {customer.email}
                </div>
              ) : null}
            </div>

            <div>
              <h3 style={{ marginBottom: '0.75rem', color: '#555' }}>Address Information</h3>
              
              {customer.addresses && customer.addresses.length > 0 ? (
                <div style={{ marginBottom: '1rem' }}>
                  <strong>Addresses:</strong>
                  <ul style={{ marginTop: '0.5rem', marginLeft: '1.5rem' }}>
                    {customer.addresses.map((address, index) => (
                      <li key={index} style={{ marginBottom: '0.5rem' }}>
                        {address.address}
                        {address.label && <span style={{ color: '#666', marginLeft: '0.5rem' }}>({address.label})</span>}
                        {address.is_primary && (
                          <span className="badge badge-paid" style={{ marginLeft: '0.5rem', fontSize: '0.75rem' }}>
                            Primary
                          </span>
                        )}
                        {address.is_billing && (
                          <span className="badge badge-sent" style={{ marginLeft: '0.5rem', fontSize: '0.75rem' }}>
                            Billing
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : customer.address ? (
                <div style={{ marginBottom: '1rem' }}>
                  <strong>Address:</strong> {customer.address}
                </div>
              ) : null}

              {customer.billing_address && (!customer.addresses || customer.addresses.length === 0) && (
                <div style={{ marginBottom: '1rem' }}>
                  <strong>Billing Address:</strong> {customer.billing_address}
                </div>
              )}
            </div>
          </div>

          <div className="responsive-two-col" style={{ marginBottom: '2rem' }}>
            <div>
              <h3 style={{ marginBottom: '0.75rem', color: '#555' }}>Additional Information</h3>
              {customer.tax_id && (
                <div style={{ marginBottom: '1rem' }}>
                  <strong>Tax ID:</strong> {customer.tax_id}
                </div>
              )}
              {customer.created_at && (
                <div style={{ marginBottom: '1rem' }}>
                  <strong>Created:</strong> {formatLocalDate(customer.created_at)}
                </div>
              )}
              {customer.updated_at && (
                <div style={{ marginBottom: '1rem' }}>
                  <strong>Last Updated:</strong> {formatLocalDate(customer.updated_at)}
                </div>
              )}
            </div>
          </div>

          {customer.notes && (
            <div style={{ marginBottom: '2rem', padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
              <h3 style={{ marginBottom: '0.75rem', color: '#555' }}>Notes</h3>
              <p style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{customer.notes}</p>
            </div>
          )}
        </div>

        <div style={{ borderTop: '2px solid #e8e8e8', paddingTop: '2rem' }}>
          <h3 style={{ marginBottom: '1rem' }}>Invoices ({invoices.length})</h3>
          {invoices.length === 0 ? (
            <p style={{ color: '#7f8c8d' }}>No invoices for this customer</p>
          ) : (
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>Invoice #</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Total</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((invoice) => (
                    <tr key={invoice.id}>
                      <td>{invoice.invoice_number}</td>
                      <td>{formatLocalDate(invoice.date)}</td>
                      <td>
                        {(() => {
                          const displayStatus = getInvoiceDisplayStatus(invoice);
                          return (
                            <span className={`badge badge-${displayStatus}`}>
                              {displayStatus.charAt(0).toUpperCase() + displayStatus.slice(1)}
                            </span>
                          );
                        })()}
                      </td>
                      <td>${invoice.total.toFixed(2)}</td>
                      <td>
                        <InvoiceActionsBar
                          status={invoice.status}
                          onView={() => navigate(`/invoices/${invoice.id}`)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
