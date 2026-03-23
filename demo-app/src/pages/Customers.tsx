import { useState, useEffect } from 'react';
import { MockDataService } from '../services/mockDataService';

export default function Customers() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const data = await MockDataService.getCustomers();
      setCustomers(data);
    } catch (error) {
      console.error('Error loading customers:', error);
    } finally {
      setLoading(false);
    }
  };

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
        <h1 className="page-title">Customers</h1>
        <button className="btn btn-primary" onClick={() => alert('Add customer feature coming soon')}>
          + Add Customer
        </button>
      </div>

      <div className="card">
        {customers.length === 0 ? (
          <p style={{ color: '#6b7280' }}>No customers yet</p>
        ) : (
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>Email</th>
                  <th>Address</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer: any) => (
                  <tr key={customer.id}>
                    <td data-label="Name" style={{ fontWeight: 500, overflowWrap: 'anywhere' }}>{customer.name}</td>
                    <td data-label="Phone" style={{ overflowWrap: 'anywhere' }}>{customer.phone || '-'}</td>
                    <td data-label="Email" style={{ overflowWrap: 'anywhere' }}>{customer.email || '-'}</td>
                    <td data-label="Address" style={{ overflowWrap: 'anywhere' }}>{customer.address || '-'}</td>
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
