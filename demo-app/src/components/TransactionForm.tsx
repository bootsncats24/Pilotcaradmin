import React, { useState, useEffect } from 'react';
import { Transaction, Category } from '../shared/types';
import { MockDataService } from '../services/mockDataService';
import { AutoCategorizor } from '../utils/autoCategorizor';
import { getTodayLocalDate } from '../utils/dateUtils';

interface TransactionFormProps {
  transaction?: Transaction;
  categories: Category[];
  onSave: () => void;
  onCancel: () => void;
}

export default function TransactionForm({ transaction, categories, onSave, onCancel }: TransactionFormProps) {
  const [formData, setFormData] = useState({
    date: transaction?.date || getTodayLocalDate(),
    description: transaction?.description || '',
    amount: transaction?.amount || 0,
    vendor: transaction?.vendor || '',
    category_id: transaction?.category_id || undefined,
    is_business: transaction?.is_business !== undefined ? transaction.is_business : true,
    notes: transaction?.notes || '',
  });

  // Store amount as string for input to allow typing
  const [amountInput, setAmountInput] = useState<string>(String(transaction?.amount || 0));

  const [saving, setSaving] = useState(false);

  // Update amount input when transaction changes
  useEffect(() => {
    if (transaction?.amount !== undefined) {
      setAmountInput(String(transaction.amount));
    }
  }, [transaction?.amount]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      setFormData({ ...formData, [name]: (e.target as HTMLInputElement).checked });
    } else if (name === 'amount') {
      // Allow typing - store as string in input, convert to number in formData
      setAmountInput(value);
      const numValue = value === '' ? 0 : parseFloat(value);
      if (!isNaN(numValue)) {
        setFormData({ ...formData, [name]: numValue });
      }
    } else if (name === 'category_id') {
      setFormData({ ...formData, [name]: value ? parseInt(value) : undefined });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.description.trim()) {
      alert('Please enter a description');
      return;
    }

    if (formData.amount <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    try {
      setSaving(true);

      if (transaction?.id) {
        await MockDataService.updateTransaction(transaction.id, formData);
      } else {
        await MockDataService.createTransaction(formData as any);
      }

      onSave();
    } catch (error) {
      console.error('Error saving transaction:', error);
      alert('Error saving transaction');
    } finally {
      setSaving(false);
    }
  };

  const formContainerStyle: React.CSSProperties = {
    width: '100%',
    maxWidth: '1000px',
    margin: '0 auto',
    padding: '2rem',
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
    minHeight: '700px',
    display: 'block',
    visibility: 'visible',
    opacity: 1,
    position: 'relative',
    zIndex: 1,
  };

  const titleStyle: React.CSSProperties = {
    color: '#2c3e50',
    fontSize: '2rem',
    fontWeight: '700',
    marginBottom: '2rem',
    paddingBottom: '1rem',
    borderBottom: '2px solid #e0e0e0',
  };

  const formRowStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '2rem',
    marginBottom: '2rem',
    visibility: 'visible',
    opacity: 1,
    position: 'relative',
    zIndex: 10,
    width: '100%',
    minHeight: '100px',
  };

  const formGroupStyle: React.CSSProperties = {
    display: 'block',
    width: '100%',
    marginBottom: '2rem',
    visibility: 'visible',
    opacity: 1,
    position: 'relative',
    zIndex: 10,
    padding: '0.5rem',
    backgroundColor: 'transparent',
    minHeight: '80px',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    marginBottom: '0.75rem',
    color: '#000000',
    fontWeight: '700',
    fontSize: '1.1rem',
    visibility: 'visible',
    opacity: 1,
    position: 'relative',
    zIndex: 10,
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '1rem',
    border: '3px solid #0066cc',
    borderRadius: '6px',
    fontSize: '1.1rem',
    fontFamily: 'inherit',
    color: '#000000',
    backgroundColor: '#f0f8ff',
    boxSizing: 'border-box',
    minHeight: '50px',
    display: 'block',
    visibility: 'visible',
    opacity: 1,
    position: 'relative',
    zIndex: 10,
    marginTop: '0.5rem',
    marginBottom: '1rem',
  };

  const textareaStyle: React.CSSProperties = {
    ...inputStyle,
    minHeight: '150px',
    resize: 'vertical',
    visibility: 'visible',
    opacity: 1,
  };

  const selectStyle: React.CSSProperties = {
    ...inputStyle,
    cursor: 'pointer',
    visibility: 'visible',
    opacity: 1,
  };

  const checkboxContainerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '2rem',
    padding: '1rem',
    backgroundColor: '#f8f9fa',
    borderRadius: '6px',
  };

  const checkboxStyle: React.CSSProperties = {
    width: '20px',
    height: '20px',
    marginRight: '0.75rem',
    cursor: 'pointer',
  };

  const checkboxLabelStyle: React.CSSProperties = {
    ...labelStyle,
    marginBottom: '0',
    cursor: 'pointer',
  };

  const actionsStyle: React.CSSProperties = {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'flex-end',
    marginTop: '3rem',
    paddingTop: '2rem',
    borderTop: '2px solid #e0e0e0',
  };

  const buttonStyle: React.CSSProperties = {
    padding: '1rem 2rem',
    border: 'none',
    borderRadius: '6px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    minWidth: '150px',
  };

  const cancelButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    backgroundColor: '#95a5a6',
    color: '#ffffff',
  };

  const saveButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    backgroundColor: '#27ae60',
    color: '#ffffff',
  };

  return (
    <div style={formContainerStyle}>
      <h2 style={titleStyle}>
        {transaction ? 'Edit Transaction' : 'New Transaction'}
      </h2>

      <form onSubmit={handleSubmit} style={{ width: '100%', display: 'block' }}>
        <div style={formRowStyle}>
          <div style={formGroupStyle}>
            <label style={labelStyle}>Date *</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
              style={inputStyle}
            />
          </div>

          <div style={formGroupStyle}>
            <label style={labelStyle}>Amount *</label>
            <input
              type="text"
              name="amount"
              value={amountInput}
              onChange={handleChange}
              onBlur={(e) => {
                // On blur, ensure we have a valid number
                const numValue = parseFloat(e.target.value);
                if (isNaN(numValue) || numValue < 0) {
                  setAmountInput('0');
                  setFormData({ ...formData, amount: 0 });
                } else {
                  setAmountInput(String(numValue));
                  setFormData({ ...formData, amount: numValue });
                }
              }}
              required
              style={inputStyle}
              placeholder="0.00"
              inputMode="decimal"
            />
          </div>
        </div>

        <div style={formGroupStyle}>
          <label style={labelStyle}>Description *</label>
          <input
            type="text"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            style={inputStyle}
            placeholder="Enter transaction description"
          />
        </div>

        <div style={formRowStyle}>
          <div style={formGroupStyle}>
            <label style={labelStyle}>Vendor</label>
            <input
              type="text"
              name="vendor"
              value={formData.vendor}
              onChange={handleChange}
              style={inputStyle}
              placeholder="Enter vendor name"
            />
          </div>

          <div style={formGroupStyle}>
            <label style={labelStyle}>Category</label>
            <select
              name="category_id"
              value={formData.category_id || ''}
              onChange={handleChange}
              style={selectStyle}
            >
              <option value="">Uncategorized</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div style={checkboxContainerStyle}>
          <input
            type="checkbox"
            name="is_business"
            checked={formData.is_business}
            onChange={handleChange}
            style={checkboxStyle}
          />
          <label style={checkboxLabelStyle}>Business Expense</label>
        </div>

        <div style={formGroupStyle}>
          <label style={labelStyle}>Notes</label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            style={textareaStyle}
            placeholder="Enter any additional notes"
          />
        </div>

        <div style={actionsStyle}>
          <button 
            type="button" 
            onClick={onCancel} 
            disabled={saving}
            style={cancelButtonStyle}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            disabled={saving}
            style={saveButtonStyle}
          >
            {saving ? 'Saving...' : 'Save Transaction'}
          </button>
        </div>
      </form>
    </div>
  );
}
