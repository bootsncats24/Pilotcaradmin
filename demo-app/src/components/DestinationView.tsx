import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Destination, Invoice } from '../shared/types';
import { MockDataService } from '../services/mockDataService';
import { formatLocalDate } from '../utils/dateUtils';
import { getInvoiceDisplayStatus } from '../utils/invoiceUtils';

export default function DestinationView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [destination, setDestination] = useState<Destination | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (id) {
        await loadDestination(parseInt(id));
        await loadDestinationInvoices(parseInt(id));
      }
    };
    load();
  }, [id]);

  const loadDestination = async (destinationId: number) => {
    try {
      setLoading(true);
      const data = await MockDataService.getDestination(destinationId);
      if (data) {
        setDestination(data);
      } else {
        alert('Destination not found');
        navigate('/destinations');
      }
    } catch (error) {
      console.error('Error loading destination:', error);
      alert(`Error loading destination: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const loadDestinationInvoices = async (destinationId: number) => {
    try {
      // Get invoices that use this destination
      const allInvoices = await MockDataService.getInvoices({});
      const filtered = (allInvoices || []).filter(inv => {
        // Check if destination is used in invoice items
        if (inv.items && inv.items.length > 0) {
          return inv.items.some((item: any) => 
            item.from_destination_id === destinationId || item.to_destination_id === destinationId
          );
        }
        // Check if destination is the main destination
        return inv.destination_id === destinationId;
      });
      setInvoices(filtered);
    } catch (error) {
      console.error('Error loading destination invoices:', error);
      setInvoices([]);
    }
  };

  const handleEdit = () => {
    if (destination) {
      // Navigate to destinations page with edit state
      navigate('/destinations', { 
        state: { 
          editDestinationId: destination.id 
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

  if (!destination) {
    return (
      <div className="card">
        <div style={{ textAlign: 'center', padding: '2rem' }}>Destination not found</div>
      </div>
    );
  }

  return (
    <>
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <h1 className="page-title">Destination Details</h1>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button className="btn btn-secondary" onClick={() => navigate('/destinations')}>
              Back to Destinations
            </button>
            <button className="btn btn-primary" onClick={handleEdit}>
              Edit Destination
            </button>
          </div>
        </div>
      </div>

      <div className="card">
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ marginBottom: '1rem', borderBottom: '2px solid #e8e8e8', paddingBottom: '0.5rem' }}>
            {destination.name}
          </h2>

          <div className="responsive-two-col" style={{ marginBottom: '2rem' }}>
            <div>
              <h3 style={{ marginBottom: '0.75rem', color: '#555' }}>Location Information</h3>
              
              {destination.address && (
                <div style={{ marginBottom: '1rem' }}>
                  <strong>Address:</strong>
                  <p style={{ marginTop: '0.5rem', marginLeft: '0', whiteSpace: 'pre-wrap' }}>
                    {destination.address}
                  </p>
                </div>
              )}
            </div>

            <div>
              <h3 style={{ marginBottom: '0.75rem', color: '#555' }}>Additional Information</h3>
              
              {destination.created_at && (
                <div style={{ marginBottom: '1rem' }}>
                  <strong>Created:</strong> {formatLocalDate(destination.created_at)}
                </div>
              )}
              {destination.updated_at && (
                <div style={{ marginBottom: '1rem' }}>
                  <strong>Last Updated:</strong> {formatLocalDate(destination.updated_at)}
                </div>
              )}
            </div>
          </div>

          {destination.notes && (
            <div style={{ marginBottom: '2rem', padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
              <h3 style={{ marginBottom: '0.75rem', color: '#555' }}>Notes</h3>
              <p style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{destination.notes}</p>
            </div>
          )}
        </div>

        <div style={{ borderTop: '2px solid #e8e8e8', paddingTop: '2rem' }}>
          <h3 style={{ marginBottom: '1rem' }}>Related Invoices ({invoices.length})</h3>
          {invoices.length === 0 ? (
            <p style={{ color: '#7f8c8d' }}>No invoices use this destination</p>
          ) : (
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>Invoice #</th>
                    <th>Date</th>
                    <th>Customer</th>
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
                      <td>{(invoice as any).customer_name || 'N/A'}</td>
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
                        <button
                          className="btn btn-small btn-primary"
                          onClick={() => navigate(`/invoices/${invoice.id}`)}
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
      </div>
    </>
  );
}
