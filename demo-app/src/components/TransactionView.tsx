import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Transaction, Receipt } from '../shared/types';
import { MockDataService } from '../services/mockDataService';
import { formatLocalDate } from '../utils/dateUtils';

export default function TransactionView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (id) {
        await loadTransaction(parseInt(id));
      }
    };
    load();
  }, [id]);

  const loadTransaction = async (transactionId: number) => {
    try {
      setLoading(true);
      const data = await MockDataService.getTransaction(transactionId);
      if (data) {
        setTransaction(data);
        
        // Load receipt if there is one
        if (data.receipt_id) {
          try {
            const receiptData = await MockDataService.getReceipt(data.receipt_id);
            setReceipt(receiptData || null);
          } catch (error) {
            console.error('Error loading receipt:', error);
          }
        }
      } else {
        alert('Transaction not found');
        navigate('/transactions');
      }
    } catch (error) {
      console.error('Error loading transaction:', error);
      alert(`Error loading transaction: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    if (transaction) {
      // Navigate to transactions page with edit state and return path
      navigate('/transactions', { 
        state: { 
          editTransactionId: transaction.id,
          returnPath: `/transactions/${transaction.id}`
        } 
      });
    }
  };

  const handleViewReceipt = () => {
    if (receipt) {
      // Navigate to receipts page - user can find the receipt there
      navigate('/receipts');
    }
  };

  if (loading) {
    return (
      <div className="card">
        <div style={{ textAlign: 'center', padding: '2rem' }}>Loading...</div>
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className="card">
        <div style={{ textAlign: 'center', padding: '2rem' }}>Transaction not found</div>
      </div>
    );
  }

  const getCategoryColor = () => {
    if (transaction.category_id && (transaction as any).category_color) {
      return (transaction as any).category_color;
    }
    return '#95a5a6';
  };

  return (
    <>
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <h1 className="page-title">Transaction Details</h1>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn btn-secondary" onClick={() => navigate('/transactions')}>
              Back to Transactions
            </button>
            {!transaction.is_locked && (
              <button className="btn btn-primary" onClick={handleEdit}>
                Edit Transaction
              </button>
            )}
            {transaction.is_locked && (
              <span className="badge badge-overdue" title="Locked by reconciliation">
                🔒 Locked
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="card">
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ marginBottom: '1rem', borderBottom: '2px solid #e8e8e8', paddingBottom: '0.5rem' }}>
            {transaction.description}
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
            <div>
              <h3 style={{ marginBottom: '0.75rem', color: '#555' }}>Transaction Information</h3>
              
              <div style={{ marginBottom: '1rem' }}>
                <strong>Date:</strong> {formatLocalDate(transaction.date)}
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <strong>Amount:</strong> 
                <span style={{ 
                  fontSize: '1.25rem', 
                  fontWeight: 'bold',
                  color: transaction.amount < 0 ? '#dc2626' : '#059669',
                  marginLeft: '0.5rem'
                }}>
                  ${Math.abs(transaction.amount).toFixed(2)}
                </span>
              </div>

              {transaction.vendor && (
                <div style={{ marginBottom: '1rem' }}>
                  <strong>Vendor:</strong> {transaction.vendor}
                </div>
              )}

              <div style={{ marginBottom: '1rem' }}>
                <strong>Type:</strong>
                <span className={`badge ${transaction.is_business ? 'badge-paid' : 'badge-cancelled'}`} style={{ marginLeft: '0.5rem' }}>
                  {transaction.is_business ? 'Business' : 'Personal'}
                </span>
              </div>

              {transaction.account_type && (
                <div style={{ marginBottom: '1rem' }}>
                  <strong>Account Type:</strong> {transaction.account_type}
                </div>
              )}
            </div>

            <div>
              <h3 style={{ marginBottom: '0.75rem', color: '#555' }}>Category & Classification</h3>
              
              {transaction.category_id ? (
                <div style={{ marginBottom: '1rem' }}>
                  <strong>Category:</strong>
                  <span 
                    className="badge" 
                    style={{ 
                      backgroundColor: getCategoryColor(),
                      marginLeft: '0.5rem'
                    }}
                  >
                    {(transaction as any).category_name || 'Unknown'}
                  </span>
                </div>
              ) : (
                <div style={{ marginBottom: '1rem' }}>
                  <strong>Category:</strong>
                  <span className="badge badge-draft" style={{ marginLeft: '0.5rem' }}>
                    Uncategorized
                  </span>
                </div>
              )}

              {transaction.created_at && (
                <div style={{ marginBottom: '1rem' }}>
                  <strong>Created:</strong> {formatLocalDate(transaction.created_at)}
                </div>
              )}

              {transaction.updated_at && (
                <div style={{ marginBottom: '1rem' }}>
                  <strong>Last Updated:</strong> {formatLocalDate(transaction.updated_at)}
                </div>
              )}

              {transaction.csv_import_id && (
                <div style={{ marginBottom: '1rem' }}>
                  <strong>Source:</strong> 
                  <span className="badge badge-sent" style={{ marginLeft: '0.5rem' }}>
                    CSV Import
                  </span>
                </div>
              )}
            </div>
          </div>

          {transaction.notes && (
            <div style={{ marginBottom: '2rem', padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
              <h3 style={{ marginBottom: '0.75rem', color: '#555' }}>Notes</h3>
              <p style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{transaction.notes}</p>
            </div>
          )}

          {receipt && (
            <div style={{ 
              marginBottom: '2rem', 
              padding: '1rem', 
              backgroundColor: '#f0f9ff', 
              border: '2px solid #0ea5e9', 
              borderRadius: '8px' 
            }}>
              <h3 style={{ marginTop: '0', marginBottom: '0.75rem', color: '#0c4a6e' }}>Attached Receipt</h3>
              <div style={{ marginBottom: '0.75rem' }}>
                <strong>Filename:</strong> {receipt.filename}
              </div>
              {receipt.vendor && (
                <div style={{ marginBottom: '0.75rem' }}>
                  <strong>Vendor:</strong> {receipt.vendor}
                </div>
              )}
              {receipt.total != null && (
                <div style={{ marginBottom: '0.75rem' }}>
                  <strong>Total:</strong> ${receipt.total.toFixed(2)}
                </div>
              )}
              {receipt.receipt_date && (
                <div style={{ marginBottom: '0.75rem' }}>
                  <strong>Receipt Date:</strong> {formatLocalDate(receipt.receipt_date)}
                </div>
              )}
              <button 
                className="btn btn-primary" 
                onClick={handleViewReceipt}
                style={{ marginTop: '0.5rem' }}
              >
                View Receipt
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
