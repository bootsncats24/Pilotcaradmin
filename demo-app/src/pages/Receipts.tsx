import React, { useState, useEffect } from 'react';
import { Receipt, Transaction } from '../shared/types';
import { MockDataService } from '../services/mockDataService';
import ReceiptUpload from '../components/ReceiptUpload';
import ReceiptViewer from '../components/ReceiptViewer';

export default function Receipts() {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [viewingReceipt, setViewingReceipt] = useState<Receipt | null>(null);
  const [freshReceipt, setFreshReceipt] = useState<Receipt | null>(null);
  const [loadingReceipt, setLoadingReceipt] = useState(false);
  const [filter, setFilter] = useState<'all' | 'matched' | 'unmatched'>('all');

  useEffect(() => {
    loadData();
  }, []);

  // Load fresh receipt data when viewing a receipt
  useEffect(() => {
    const loadFreshReceipt = async () => {
      if (viewingReceipt?.id) {
        try {
          setLoadingReceipt(true);
          const fresh = await MockDataService.getReceipt(viewingReceipt.id);
          if (fresh) {
            console.log('📥 Loaded fresh receipt data:');
            console.log('  - Vendor:', fresh.vendor || 'NULL');
            console.log('  - Total:', fresh.total !== undefined ? fresh.total : 'NULL');
            console.log('  - Tax:', fresh.tax !== undefined ? fresh.tax : 'NULL');
            console.log('  - Date:', fresh.receipt_date || 'NULL');
            console.log('  - Full receipt object:', fresh);
            setFreshReceipt(fresh);
          } else {
            setFreshReceipt(viewingReceipt);
          }
        } catch (error) {
          console.error('Error loading fresh receipt:', error);
          setFreshReceipt(viewingReceipt);
        } finally {
          setLoadingReceipt(false);
        }
      } else {
        setFreshReceipt(null);
      }
    };
    loadFreshReceipt();
  }, [viewingReceipt?.id]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [receiptsData, transData] = await Promise.all([
        MockDataService.getReceipts(),
        MockDataService.getTransactions(),
      ]);
      setReceipts(receiptsData || []);
      setTransactions(transData || []);
    } catch (error) {
      console.error('Error loading receipts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this receipt?')) {
      return;
    }

    try {
      const receipt = receipts.find((r) => r.id === id);
      if (receipt) {
        // Delete file
        await window.electronAPI.receiptDelete(receipt.file_path);
        // Delete from database
        await MockDataService.deleteReceipt(id);
        loadData();
      }
    } catch (error) {
      console.error('Error deleting receipt:', error);
      alert('Error deleting receipt');
    }
  };

  const filteredReceipts = receipts.filter((r) => {
    if (filter === 'matched') return r.transaction_id != null;
    if (filter === 'unmatched') return r.transaction_id == null;
    return true;
  });

  const unmatchedCount = receipts.filter((r) => !r.transaction_id).length;

  if (showUpload) {
    return (
      <>
        <div className="page-header">
          <h1 className="page-title">Upload Receipts</h1>
        </div>
        <ReceiptUpload
          transactions={transactions}
          onSave={() => {
            setShowUpload(false);
            loadData();
          }}
          onCancel={() => setShowUpload(false)}
        />
      </>
    );
  }

  if (viewingReceipt) {
    if (loadingReceipt) {
      return (
        <>
          <div className="page-header">
            <h1 className="page-title">Receipt Details</h1>
            <button className="btn btn-secondary" onClick={() => setViewingReceipt(null)}>
              Back to List
            </button>
          </div>
          <div className="card">Loading receipt details...</div>
        </>
      );
    }
    
    return (
      <>
        <div className="page-header">
          <h1 className="page-title">Receipt Details</h1>
          <button className="btn btn-secondary" onClick={() => setViewingReceipt(null)}>
            Back to List
          </button>
        </div>
        <ReceiptViewer
          receipt={freshReceipt || viewingReceipt}
          transactions={transactions}
          onUpdate={() => {
            setViewingReceipt(null);
            loadData();
          }}
          onDelete={() => {
            handleDelete(viewingReceipt.id!);
            setViewingReceipt(null);
          }}
        />
      </>
    );
  }

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Receipts</h1>
        <button className="btn btn-primary" onClick={() => setShowUpload(true)}>
          Upload Receipts
        </button>
      </div>

      <div className="card" style={{ marginBottom: '1rem' }}>
        <div className="demo-inline-filter-row">
          <div>
            <strong>Filter:</strong>
          </div>
          <button
            className={`btn btn-small ${filter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilter('all')}
          >
            All ({receipts.length})
          </button>
          <button
            className={`btn btn-small ${filter === 'matched' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilter('matched')}
          >
            Matched ({receipts.length - unmatchedCount})
          </button>
          <button
            className={`btn btn-small ${filter === 'unmatched' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilter('unmatched')}
          >
            Unmatched ({unmatchedCount})
          </button>
        </div>
      </div>

      {loading ? (
        <div className="card">
          <div className="loading-spinner"></div>
        </div>
      ) : filteredReceipts.length === 0 ? (
        <div className="card empty-state" data-icon="receipt">
          <h3>No receipts found</h3>
          <p>Upload receipts to keep organized records for tax time</p>
        </div>
      ) : (
        <div className="demo-receipt-grid">
          {filteredReceipts.map((receipt) => (
            <div
              key={receipt.id}
              className="card"
              style={{
                padding: '1rem',
                transition: 'box-shadow 0.2s',
              }}
            >
              <div
                style={{
                  cursor: 'pointer',
                }}
                onClick={() => setViewingReceipt(receipt)}
              >
                <div style={{ marginBottom: '0.5rem' }}>
                  <strong>{receipt.vendor ?? 'Unknown Vendor'}</strong>
                </div>
                <div style={{ fontSize: '0.875rem', color: '#7f8c8d' }}>
                  {receipt.receipt_date || 'No date'}
                </div>
                {receipt.total && (
                  <div style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: '0.5rem 0' }}>
                    ${receipt.total.toFixed(2)}
                  </div>
                )}
                <div>
                  {receipt.transaction_id ? (
                    <span className="badge badge-paid">Matched</span>
                  ) : (
                    <span className="badge badge-overdue">Unmatched</span>
                  )}
                </div>
              </div>
              <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem' }}>
                <button
                  className="btn btn-small btn-secondary"
                  onClick={() => setViewingReceipt(receipt)}
                  style={{ flex: 1 }}
                >
                  View
                </button>
                <button
                  className="btn btn-small btn-danger"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(receipt.id!);
                  }}
                  style={{ flex: 1 }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}












