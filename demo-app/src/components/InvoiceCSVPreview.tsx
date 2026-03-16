import React, { useState, useEffect } from 'react';
import { Invoice, InvoiceItem, BillingType } from '../shared/types';
import { getInvoiceDisplayStatus } from '../utils/invoiceUtils';

interface InvoiceCSVPreviewProps {
  invoices: Invoice[];
  onImport: (selectedIndices: Set<number>) => void;
  onCancel: () => void;
}

const BILLING_TYPE_LABELS: Record<BillingType, string> = {
  mile: 'By Mile',
  mini_run: 'Mini Run',
  day_rate: 'Day Rate',
  hourly: 'Hourly',
  chase_pole: 'Chase/Pole',
  other: 'Other',
};

export default function InvoiceCSVPreview({ invoices, onImport, onCancel }: InvoiceCSVPreviewProps) {
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const [viewingIndex, setViewingIndex] = useState<number | null>(null);

  useEffect(() => {
    // Auto-select all invoices
    setSelected(new Set(invoices.map((_, i) => i)));
  }, [invoices]);

  const toggleSelect = (index: number) => {
    const newSelected = new Set(selected);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelected(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelected(new Set());
    } else {
      setSelected(new Set(invoices.map((_, i) => i)));
    }
    setSelectAll(!selectAll);
  };

  const handleImport = () => {
    if (selected.size === 0) {
      alert('Please select at least one invoice to import');
      return;
    }

    onImport(selected);
  };

  const selectedCount = selected.size;
  const totalAmount = invoices
    .filter((_, i) => selected.has(i))
    .reduce((sum, inv) => sum + inv.total, 0);

  return (
    <div className="card">
      <h2>Preview & Confirm Import</h2>
      
      <div style={{ marginBottom: '1rem', padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
        <div style={{ display: 'flex', gap: '2rem' }}>
          <div><strong>Total Invoices:</strong> {invoices.length}</div>
          <div><strong>Selected:</strong> {selectedCount}</div>
          <div><strong>Total Amount:</strong> ${totalAmount.toFixed(2)}</div>
        </div>
      </div>

      <div style={{ overflowX: 'auto', maxHeight: '600px', overflowY: 'auto' }}>
        <table className="table">
          <thead style={{ position: 'sticky', top: 0, backgroundColor: '#34495e', zIndex: 1 }}>
            <tr>
              <th>
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={toggleSelectAll}
                />
              </th>
              <th>Invoice #</th>
              <th>Customer</th>
              <th>Date</th>
              <th>Due Date</th>
              <th>Status</th>
              <th>Items</th>
              <th>Total</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((invoice, index) => {
              const isSelected = selected.has(index);
              const customerName = (invoice as any).customer_name || 'N/A';
              const itemsCount = invoice.items?.length || 0;

              return (
                <tr
                  key={index}
                  style={{
                    backgroundColor: isSelected ? 'inherit' : '#f8f9fa',
                    opacity: isSelected ? 1 : 0.6,
                  }}
                >
                  <td>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelect(index)}
                    />
                  </td>
                  <td>{invoice.invoice_number || 'N/A'}</td>
                  <td>{customerName}</td>
                  <td>{invoice.date}</td>
                  <td>{invoice.due_date || '-'}</td>
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
                  <td>{itemsCount} item{itemsCount !== 1 ? 's' : ''}</td>
                  <td>${invoice.total.toFixed(2)}</td>
                  <td>
                    <button
                      type="button"
                      className="btn btn-sm btn-primary"
                      onClick={() => setViewingIndex(index)}
                      style={{ padding: '0.25rem 0.5rem', fontSize: '0.875rem' }}
                    >
                      View
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {viewingIndex !== null && invoices[viewingIndex] && (() => {
        const currentInvoice = invoices[viewingIndex];
        if (!currentInvoice) return null;
        
        return (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
            }}
            onClick={() => setViewingIndex(null)}
          >
            <div
              style={{
                backgroundColor: 'white',
                padding: '2rem',
                borderRadius: '8px',
                maxWidth: '800px',
                maxHeight: '90vh',
                overflow: 'auto',
                position: 'relative',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setViewingIndex(null)}
                style={{
                  position: 'absolute',
                  top: '1rem',
                  right: '1rem',
                  background: 'none',
                  border: 'none',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  color: '#666',
                }}
              >
                ×
              </button>

              <h2>Invoice #{currentInvoice.invoice_number}</h2>
              <div style={{ marginTop: '1rem' }}>
                <p><strong>Customer:</strong> {(currentInvoice as any).customer_name || 'N/A'}</p>
                <p><strong>Date:</strong> {currentInvoice.date}</p>
                <p><strong>Due Date:</strong> {currentInvoice.due_date || 'N/A'}</p>
                <p><strong>Status:</strong> {currentInvoice.status}</p>
              </div>

              {currentInvoice.items && currentInvoice.items.length > 0 && (
              <div style={{ marginTop: '1.5rem' }}>
                <h3>Items:</h3>
                <table className="table" style={{ marginTop: '0.5rem' }}>
                  <thead>
                    <tr>
                      <th>Description</th>
                      <th>Type</th>
                      <th>Quantity</th>
                      <th>Rate</th>
                      <th>Miles</th>
                      <th>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentInvoice.items.map((item: InvoiceItem, i) => (
                      <tr key={i}>
                        <td>{item.description || 'N/A'}</td>
                        <td>{BILLING_TYPE_LABELS[item.type] || item.type}</td>
                        <td>{item.quantity}</td>
                        <td>${item.rate.toFixed(2)}</td>
                        <td>{item.miles || '-'}</td>
                        <td>${item.amount.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              )}

              <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem', justifyContent: 'space-between', alignItems: 'center' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (viewingIndex !== null && viewingIndex > 0) {
                      setViewingIndex(viewingIndex - 1);
                    }
                  }}
                  disabled={viewingIndex === null || viewingIndex === 0}
                >
                  ← Previous
                </button>
                <div style={{ alignSelf: 'center' }}>
                  Invoice {viewingIndex !== null ? viewingIndex + 1 : 0} of {invoices.length}
                </div>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (viewingIndex !== null && viewingIndex < invoices.length - 1) {
                      setViewingIndex(viewingIndex + 1);
                    }
                  }}
                  disabled={viewingIndex === null || viewingIndex >= invoices.length - 1}
                >
                  Next →
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {invoices.length > 0 && (
        <div style={{ marginTop: '1.5rem', padding: '1rem', backgroundColor: '#e7f3ff', borderRadius: '4px' }}>
          <h4>Invoice Details Preview:</h4>
          {invoices.slice(0, 3).map((invoice, index) => {
            if (!selected.has(index)) return null;
            return (
              <div key={index} style={{ marginTop: '1rem', padding: '1rem', background: 'white', borderRadius: '4px' }}>
                <strong>Invoice #{invoice.invoice_number}</strong> - {(invoice as any).customer_name || 'N/A'}
                <div style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>
                  {invoice.items && invoice.items.length > 0 ? (
                    <ul style={{ margin: '0.5rem 0', paddingLeft: '1.5rem' }}>
                      {invoice.items.map((item: InvoiceItem, i) => (
                        <li key={i}>
                          {item.description || BILLING_TYPE_LABELS[item.type] || item.type} - 
                          {item.miles ? ` ${item.miles} miles` : ''} - 
                          ${item.amount.toFixed(2)}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div>No items (will use default item)</div>
                  )}
                  {invoice.extras && invoice.extras.length > 0 && (
                    <div style={{ marginTop: '0.5rem' }}>
                      <strong>Extras:</strong>
                      <ul style={{ margin: '0.5rem 0', paddingLeft: '1.5rem' }}>
                        {invoice.extras.map((extra, i) => (
                          <li key={i}>{extra.description} - ${extra.amount.toFixed(2)}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          {invoices.length > 3 && (
            <div style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: '#7f8c8d' }}>
              ... and {invoices.length - 3} more invoice{invoices.length - 3 !== 1 ? 's' : ''}
            </div>
          )}
        </div>
      )}

      <div className="form-actions" style={{ marginTop: '1.5rem' }}>
        <button type="button" className="btn btn-secondary" onClick={onCancel}>
          Cancel
        </button>
        <button type="button" className="btn btn-success" onClick={handleImport} disabled={selectedCount === 0}>
          Import {selectedCount} Invoice{selectedCount !== 1 ? 's' : ''}
        </button>
      </div>
    </div>
  );
}











