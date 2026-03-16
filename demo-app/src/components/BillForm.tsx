import React, { useState, useEffect } from 'react';
import { Bill, Category, RecurrenceType, BillStatus } from '../shared/types';
import { MockDataService } from '../services/mockDataService';
import { getTodayLocalDate } from '../utils/dateUtils';

interface BillFormProps {
  bill?: Bill;
  onSave: () => void;
  onCancel: () => void;
}

const RECURRENCE_OPTIONS: { value: RecurrenceType; label: string }[] = [
  { value: 'none', label: 'One-time' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
];

export default function BillForm({ bill, onSave, onCancel }: BillFormProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    amount: 0,
    due_date: getTodayLocalDate(),
    category_id: 0,
    vendor: '',
    account_number: '',
    website: '',
    notes: '',
    is_recurring: false,
    recurrence_type: 'none' as RecurrenceType,
    recurrence_interval: 1,
    status: 'active' as BillStatus,
    auto_pay: false,
  });
  const [amountInput, setAmountInput] = useState<string>('0');
  const [intervalInput, setIntervalInput] = useState<string>('1');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadCategories();
    if (bill) {
      loadBillData();
    }
  }, [bill]);

  const loadCategories = async () => {
    try {
      const data = await MockDataService.getCategories();
      setCategories(data || []);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadBillData = () => {
    if (!bill) return;
    
    setFormData({
      name: bill.name,
      description: bill.description || '',
      amount: bill.amount,
      due_date: bill.due_date,
      category_id: bill.category_id || 0,
      vendor: bill.vendor || '',
      account_number: bill.account_number || '',
      website: bill.website || '',
      notes: bill.notes || '',
      is_recurring: bill.is_recurring,
      recurrence_type: bill.recurrence_type,
      recurrence_interval: bill.recurrence_interval || 1,
      status: bill.status,
      auto_pay: bill.auto_pay || false,
    });
    setAmountInput(String(bill.amount));
    setIntervalInput(String(bill.recurrence_interval || 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert('Please enter a bill name');
      return;
    }

    if (formData.amount <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    setSaving(true);
    try {
      const billData = {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        amount: formData.amount,
        due_date: formData.due_date,
        category_id: formData.category_id > 0 ? formData.category_id : undefined,
        vendor: formData.vendor.trim() || undefined,
        account_number: formData.account_number.trim() || undefined,
        website: formData.website.trim() || undefined,
        notes: formData.notes.trim() || undefined,
        is_recurring: formData.is_recurring,
        recurrence_type: formData.recurrence_type,
        recurrence_interval: formData.is_recurring ? formData.recurrence_interval : undefined,
        next_due_date: formData.is_recurring ? formData.due_date : undefined,
        status: formData.status,
        auto_pay: formData.auto_pay,
      };

      if (bill?.id) {
        await MockDataService.updateBill(bill.id, billData);
      } else {
        await MockDataService.createBill(billData);
      }
      onSave();
    } catch (error: any) {
      console.error('Error saving bill:', error);
      alert(`Error saving bill: ${error?.message || 'Unknown error'}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="card">
      <h2>{bill?.id ? 'Edit Bill' : 'New Bill'}</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label>Bill Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
              placeholder="e.g., Internet Bill, Phone Bill"
            />
          </div>

          <div className="form-group">
            <label>Amount *</label>
            <input
              type="text"
              value={amountInput}
              onChange={(e) => {
                setAmountInput(e.target.value);
                const numValue = e.target.value === '' ? 0 : parseFloat(e.target.value);
                if (!isNaN(numValue)) {
                  setFormData(prev => ({ ...prev, amount: numValue }));
                }
              }}
              onBlur={(e) => {
                const numValue = parseFloat(e.target.value);
                if (isNaN(numValue) || numValue < 0) {
                  setAmountInput('0');
                  setFormData(prev => ({ ...prev, amount: 0 }));
                } else {
                  setAmountInput(String(numValue));
                  setFormData(prev => ({ ...prev, amount: numValue }));
                }
              }}
              required
              placeholder="0.00"
              inputMode="decimal"
            />
          </div>
        </div>

        <div className="form-group">
          <label>Description</label>
          <input
            type="text"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Optional description"
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Due Date *</label>
            <input
              type="date"
              value={formData.due_date}
              onChange={(e) => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
              required
            />
          </div>

          <div className="form-group">
            <label>Category</label>
            <select
              value={formData.category_id}
              onChange={(e) => setFormData(prev => ({ ...prev, category_id: parseInt(e.target.value) || 0 }))}
            >
              <option value={0}>No Category</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Vendor</label>
            <input
              type="text"
              value={formData.vendor}
              onChange={(e) => setFormData(prev => ({ ...prev, vendor: e.target.value }))}
              placeholder="e.g., Verizon, Comcast"
            />
          </div>

          <div className="form-group">
            <label>Account Number</label>
            <input
              type="text"
              value={formData.account_number}
              onChange={(e) => setFormData(prev => ({ ...prev, account_number: e.target.value }))}
              placeholder="Optional"
            />
          </div>
        </div>

        <div className="form-group">
          <label>Website/Login URL</label>
          <input
            type="url"
            value={formData.website}
            onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
            placeholder="https://..."
          />
        </div>

        <div className="card" style={{ marginTop: '1.5rem', marginBottom: '1.5rem', padding: '1rem', background: '#f8f9fa' }}>
          <h3 style={{ marginBottom: '1rem' }}>Recurring Bill Settings</h3>
          
          <div className="form-group">
            <label>
              <input
                type="checkbox"
                checked={formData.is_recurring}
                onChange={(e) => setFormData(prev => ({ ...prev, is_recurring: e.target.checked }))}
              />
              <span style={{ marginLeft: '0.5rem' }}>This is a recurring bill</span>
            </label>
          </div>

          {formData.is_recurring && (
            <>
              <div className="form-row">
                <div className="form-group">
                  <label>Recurrence Type</label>
                  <select
                    value={formData.recurrence_type}
                    onChange={(e) => setFormData(prev => ({ ...prev, recurrence_type: e.target.value as RecurrenceType }))}
                  >
                    {RECURRENCE_OPTIONS.filter(opt => opt.value !== 'none').map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Interval</label>
                  <input
                    type="text"
                    value={intervalInput}
                    onChange={(e) => {
                      setIntervalInput(e.target.value);
                      const numValue = e.target.value === '' ? 1 : parseInt(e.target.value);
                      if (!isNaN(numValue) && numValue >= 1) {
                        setFormData(prev => ({ ...prev, recurrence_interval: numValue }));
                      }
                    }}
                    onBlur={(e) => {
                      const numValue = parseInt(e.target.value);
                      if (isNaN(numValue) || numValue < 1) {
                        setIntervalInput('1');
                        setFormData(prev => ({ ...prev, recurrence_interval: 1 }));
                      } else {
                        setIntervalInput(String(numValue));
                        setFormData(prev => ({ ...prev, recurrence_interval: numValue }));
                      }
                    }}
                    placeholder="Every X"
                    inputMode="numeric"
                  />
                  <small>e.g., Every 2 weeks, Every 3 months</small>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as BillStatus }))}
            >
              <option value="active">Active</option>
              <option value="paid">Paid</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div className="form-group">
            <label>
              <input
                type="checkbox"
                checked={formData.auto_pay}
                onChange={(e) => setFormData(prev => ({ ...prev, auto_pay: e.target.checked }))}
              />
              <span style={{ marginLeft: '0.5rem' }}>Auto Pay Enabled</span>
            </label>
          </div>
        </div>

        <div className="form-group">
          <label>Notes</label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            rows={3}
            placeholder="Additional notes..."
          />
        </div>

        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={saving}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving...' : 'Save Bill'}
          </button>
        </div>
      </form>
    </div>
  );
}











