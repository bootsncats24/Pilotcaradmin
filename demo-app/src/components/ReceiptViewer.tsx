import React, { useState, useEffect } from 'react';
import { Receipt, Transaction } from '../shared/types';
import { MockDataService } from '../services/mockDataService';

interface ReceiptViewerProps {
  receipt: Receipt;
  transactions: Transaction[];
  onUpdate: () => void;
  onDelete: () => void;
}

export default function ReceiptViewer({ receipt, transactions, onUpdate, onDelete }: ReceiptViewerProps) {
  const [imageData, setImageData] = useState<string>('');
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    transaction_id: receipt.transaction_id || undefined,
    vendor: receipt.vendor || '',
    total: receipt.total || 0,
    tax: receipt.tax || 0,
    receipt_date: receipt.receipt_date || '',
  });

  // Debug: Log receipt data when component receives it
  useEffect(() => {
    console.log('🔍 ReceiptViewer received receipt:', {
      id: receipt.id,
      vendor: receipt.vendor,
      total: receipt.total,
      tax: receipt.tax,
      receipt_date: receipt.receipt_date,
      transaction_id: receipt.transaction_id,
    });
  }, [receipt]);

  useEffect(() => {
    loadImage();
    // Only update formData when receipt prop changes AND we're not editing
    // This prevents resetting the form while user is typing
    if (!editing) {
      setFormData({
        transaction_id: receipt.transaction_id || undefined,
        vendor: receipt.vendor || '',
        total: receipt.total || 0,
        tax: receipt.tax || 0,
        receipt_date: receipt.receipt_date || '',
      });
    }
  }, [receipt, editing]);

  const loadImage = async () => {
    try {
      if (!receipt.file_path) {
        console.error('Receipt file_path is missing');
        setImageData('');
        return;
      }
      
      console.log('Loading receipt image from path:', receipt.file_path);
      const data = await window.electronAPI.receiptRead(receipt.file_path);
      
      if (!data) {
        console.error('No data returned from receiptRead');
        setImageData('');
        return;
      }
      
      const mimeType = receipt.file_type || 'image/jpeg';
      const dataUrl = `data:${mimeType};base64,${data}`;
      console.log('Setting image data, length:', dataUrl.length);
      setImageData(dataUrl);
    } catch (error) {
      console.error('Error loading receipt image:', error);
      setImageData('');
    }
  };

  const handleSave = async () => {
    try {
      await MockDataService.updateReceipt(receipt.id!, formData);
      setEditing(false);
      onUpdate();
    } catch (error) {
      console.error('Error updating receipt:', error);
      alert('Error updating receipt');
    }
  };

  return (
    <div className="responsive-two-col">
      <div className="card" style={{ position: 'relative', zIndex: 1 }}>
        <h3>Receipt Image</h3>
        {imageData ? (
          <img
            src={imageData}
            alt="Receipt"
            style={{
              width: '100%',
              maxHeight: '600px',
              objectFit: 'contain',
              border: '1px solid #ddd',
              borderRadius: '4px',
            }}
            onError={(e) => {
              console.error('Image failed to load:', e);
              const img = e.target as HTMLImageElement;
              img.style.display = 'none';
              setImageData('');
            }}
            onLoad={() => {
              console.log('Receipt image loaded successfully');
            }}
          />
        ) : (
          <div style={{ padding: '2rem', textAlign: 'center', backgroundColor: '#f8f9fa' }}>
            {receipt.file_path ? 'Loading receipt...' : 'No receipt image available'}
          </div>
        )}
      </div>

      <div className="card" style={{ position: 'relative', zIndex: 2, overflow: 'visible' }}>
        <h3>Receipt Details</h3>
        
        {editing ? (
          <>
            <div className="form-group">
              <label>Vendor</label>
              <input
                type="text"
                value={formData.vendor}
                onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                autoFocus
                autoComplete="off"
              />
            </div>

            <div className="form-group">
              <label>Date</label>
              <input
                type="date"
                value={formData.receipt_date}
                onChange={(e) => setFormData({ ...formData, receipt_date: e.target.value })}
                autoComplete="off"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Total</label>
                <input
                  type="text"
                  value={formData.total === 0 ? '' : String(formData.total)}
                  onChange={(e) => {
                    const numValue = e.target.value === '' ? 0 : parseFloat(e.target.value);
                    if (!isNaN(numValue)) {
                      setFormData({ ...formData, total: numValue });
                    }
                  }}
                  onBlur={(e) => {
                    const numValue = parseFloat(e.target.value);
                    if (isNaN(numValue) || numValue < 0) {
                      setFormData({ ...formData, total: 0 });
                    }
                  }}
                  placeholder="0.00"
                  inputMode="decimal"
                  autoComplete="off"
                />
              </div>

              <div className="form-group">
                <label>Tax</label>
                <input
                  type="text"
                  value={formData.tax === 0 ? '' : String(formData.tax)}
                  onChange={(e) => {
                    const numValue = e.target.value === '' ? 0 : parseFloat(e.target.value);
                    if (!isNaN(numValue)) {
                      setFormData({ ...formData, tax: numValue });
                    }
                  }}
                  onBlur={(e) => {
                    const numValue = parseFloat(e.target.value);
                    if (isNaN(numValue) || numValue < 0) {
                      setFormData({ ...formData, tax: 0 });
                    }
                  }}
                  placeholder="0.00"
                  inputMode="decimal"
                  autoComplete="off"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Link to Transaction</label>
              <select
                value={formData.transaction_id || ''}
                onChange={(e) => setFormData({ ...formData, transaction_id: e.target.value ? parseInt(e.target.value) : undefined })}
              >
                <option value="">No transaction</option>
                {transactions.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.date} - {t.description} - ${t.amount.toFixed(2)}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-actions" style={{ position: 'relative', zIndex: 10, pointerEvents: 'auto' }}>
              <button className="btn btn-secondary" onClick={() => setEditing(false)}>
                Cancel
              </button>
              <button className="btn btn-success" onClick={handleSave}>
                Save Changes
              </button>
            </div>
          </>
        ) : (
          <>
            <div style={{ marginBottom: '1rem' }}>
              <strong>Vendor:</strong> {receipt.vendor || 'Unknown'}
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <strong>Date:</strong> {receipt.receipt_date || 'Not set'}
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <strong>Total:</strong> ${receipt.total?.toFixed(2) || '0.00'}
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <strong>Tax:</strong> ${receipt.tax?.toFixed(2) || '0.00'}
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <strong>Matched:</strong>{' '}
              {receipt.transaction_id ? (
                <span className="badge badge-paid">Yes</span>
              ) : (
                <span className="badge badge-overdue">No</span>
              )}
            </div>

            <div className="form-actions" style={{ position: 'relative', zIndex: 10, pointerEvents: 'auto' }}>
              <button className="btn btn-secondary" onClick={() => {
                // Ensure formData is up-to-date when entering edit mode
                setFormData({
                  transaction_id: receipt.transaction_id || undefined,
                  vendor: receipt.vendor || '',
                  total: receipt.total || 0,
                  tax: receipt.tax || 0,
                  receipt_date: receipt.receipt_date || '',
                });
                setEditing(true);
              }}>
                Edit Details
              </button>
              <button className="btn btn-danger" onClick={onDelete} style={{ position: 'relative', zIndex: 11, pointerEvents: 'auto' }}>
                Delete Receipt
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}







