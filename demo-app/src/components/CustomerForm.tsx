import React, { useState, useEffect } from 'react';
import { Customer, CustomerPhone, CustomerEmail, CustomerAddress } from '../shared/types';
import { MockDataService } from '../services/mockDataService';

interface CustomerFormProps {
  customer?: Customer;
  onSave: () => void;
  onCancel: () => void;
}

export default function CustomerForm({ customer, onSave, onCancel }: CustomerFormProps) {
  const [formData, setFormData] = useState<Omit<Customer, 'id' | 'created_at' | 'updated_at'>>({
    name: '',
    tax_id: '',
    notes: '',
    phones: [],
    emails: [],
    addresses: [],
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (customer) {
      setFormData({
        name: customer.name || '',
        tax_id: customer.tax_id || '',
        notes: customer.notes || '',
        phones: customer.phones || [],
        emails: customer.emails || [],
        addresses: customer.addresses || [],
      });
    }
  }, [customer]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      alert('Name is required');
      return;
    }

    setSaving(true);
    try {
      if (customer?.id) {
        await MockDataService.updateCustomer(customer.id, formData);
      } else {
        await MockDataService.createCustomer(formData);
      }
      onSave();
    } catch (error) {
      console.error('Error saving customer:', error);
      alert('Error saving customer');
    } finally {
      setSaving(false);
    }
  };

  const addPhone = () => {
    setFormData(prev => ({
      ...prev,
      phones: [...(prev.phones || []), { phone: '', label: '' }]
    }));
  };

  const removePhone = (index: number) => {
    setFormData(prev => ({
      ...prev,
      phones: prev.phones?.filter((_, i) => i !== index) || []
    }));
  };

  const updatePhone = (index: number, field: keyof CustomerPhone, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      phones: prev.phones?.map((phone, i) => 
        i === index ? { ...phone, [field]: value } : phone
      ) || []
    }));
  };

  const addEmail = () => {
    setFormData(prev => ({
      ...prev,
      emails: [...(prev.emails || []), { email: '', label: '' }]
    }));
  };

  const removeEmail = (index: number) => {
    setFormData(prev => ({
      ...prev,
      emails: prev.emails?.filter((_, i) => i !== index) || []
    }));
  };

  const updateEmail = (index: number, field: keyof CustomerEmail, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      emails: prev.emails?.map((email, i) => 
        i === index ? { ...email, [field]: value } : email
      ) || []
    }));
  };

  const addAddress = () => {
    setFormData(prev => ({
      ...prev,
      addresses: [...(prev.addresses || []), { address: '', label: '' }]
    }));
  };

  const removeAddress = (index: number) => {
    setFormData(prev => ({
      ...prev,
      addresses: prev.addresses?.filter((_, i) => i !== index) || []
    }));
  };

  const updateAddress = (index: number, field: keyof CustomerAddress, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      addresses: prev.addresses?.map((address, i) => 
        i === index ? { ...address, [field]: value } : address
      ) || []
    }));
  };

  return (
    <div className="card" style={{ maxWidth: '900px', margin: '0 auto' }}>
      <h2>{customer?.id ? 'Edit Customer' : 'New Customer'}</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Name *</label>
          <input
            type="text"
            value={formData.name || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            required
            style={{ pointerEvents: 'auto', cursor: 'text' }}
          />
        </div>

        <div className="form-group">
          <label>Tax ID</label>
          <input
            type="text"
            value={formData.tax_id || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, tax_id: e.target.value }))}
            style={{ pointerEvents: 'auto', cursor: 'text' }}
          />
        </div>

        {/* Phone Numbers */}
        <div className="form-group">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <label style={{ margin: 0 }}>Phone Numbers</label>
            <button 
              type="button" 
              className="btn btn-small btn-secondary" 
              onClick={addPhone}
              style={{ flexShrink: 0, whiteSpace: 'nowrap' }}
            >
              + Add Phone
            </button>
          </div>
          {formData.phones?.map((phone, index) => (
            <div key={index} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <input
                type="tel"
                placeholder="Phone number"
                value={phone.phone}
                onChange={(e) => updatePhone(index, 'phone', e.target.value)}
                style={{ flex: '2 1 200px', minWidth: '200px', pointerEvents: 'auto', cursor: 'text' }}
              />
              <input
                type="text"
                placeholder="Label"
                value={phone.label || ''}
                onChange={(e) => updatePhone(index, 'label', e.target.value)}
                style={{ flex: '0 0 100px', maxWidth: '120px', pointerEvents: 'auto', cursor: 'text' }}
              />
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0, whiteSpace: 'nowrap', flexShrink: 0, fontSize: '0.875rem', height: '44px', padding: '0 0.5rem' }}>
                <input
                  type="checkbox"
                  checked={phone.is_primary || false}
                  onChange={(e) => updatePhone(index, 'is_primary', e.target.checked)}
                  style={{ width: '18px', height: '18px', margin: 0, cursor: 'pointer', flexShrink: 0 }}
                />
                Primary
              </label>
              <button 
                type="button" 
                className="btn btn-small btn-danger" 
                onClick={() => removePhone(index)}
                style={{ flexShrink: 0, whiteSpace: 'nowrap' }}
              >
                Remove
              </button>
            </div>
          ))}
          {(!formData.phones || formData.phones.length === 0) && (
            <p style={{ color: '#999', fontSize: '0.9rem' }}>No phone numbers added</p>
          )}
        </div>

        {/* Email Addresses */}
        <div className="form-group">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <label style={{ margin: 0 }}>Email Addresses</label>
            <button 
              type="button" 
              className="btn btn-small btn-secondary" 
              onClick={addEmail}
              style={{ flexShrink: 0, whiteSpace: 'nowrap' }}
            >
              + Add Email
            </button>
          </div>
          {formData.emails?.map((email, index) => (
            <div key={index} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <input
                type="email"
                placeholder="Email address"
                value={email.email}
                onChange={(e) => updateEmail(index, 'email', e.target.value)}
                style={{ flex: '2 1 250px', minWidth: '250px', pointerEvents: 'auto', cursor: 'text' }}
              />
              <input
                type="text"
                placeholder="Label"
                value={email.label || ''}
                onChange={(e) => updateEmail(index, 'label', e.target.value)}
                style={{ flex: '0 0 100px', maxWidth: '120px', pointerEvents: 'auto', cursor: 'text' }}
              />
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0, whiteSpace: 'nowrap', flexShrink: 0, fontSize: '0.875rem', height: '44px', padding: '0 0.5rem' }}>
                <input
                  type="checkbox"
                  checked={email.is_primary || false}
                  onChange={(e) => updateEmail(index, 'is_primary', e.target.checked)}
                  style={{ width: '18px', height: '18px', margin: 0, cursor: 'pointer', flexShrink: 0 }}
                />
                Primary
              </label>
              <button 
                type="button" 
                className="btn btn-small btn-danger" 
                onClick={() => removeEmail(index)}
                style={{ flexShrink: 0, whiteSpace: 'nowrap' }}
              >
                Remove
              </button>
            </div>
          ))}
          {(!formData.emails || formData.emails.length === 0) && (
            <p style={{ color: '#999', fontSize: '0.9rem' }}>No email addresses added</p>
          )}
        </div>

        {/* Addresses */}
        <div className="form-group">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <label style={{ margin: 0 }}>Addresses</label>
            <button 
              type="button" 
              className="btn btn-small btn-secondary" 
              onClick={addAddress}
              style={{ flexShrink: 0, whiteSpace: 'nowrap' }}
            >
              + Add Address
            </button>
          </div>
          {formData.addresses?.map((address, index) => (
            <div key={index} style={{ marginBottom: '0.5rem', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '4px' }}>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <input
                  type="text"
                  placeholder="Label (e.g., Main Office, Warehouse)"
                  value={address.label || ''}
                  onChange={(e) => updateAddress(index, 'label', e.target.value)}
                  style={{ flex: '1 1 200px', minWidth: '200px', pointerEvents: 'auto', cursor: 'text' }}
                />
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0, whiteSpace: 'nowrap', flexShrink: 0, fontSize: '0.875rem', height: '44px', padding: '0 0.5rem' }}>
                  <input
                    type="checkbox"
                    checked={address.is_primary || false}
                    onChange={(e) => updateAddress(index, 'is_primary', e.target.checked)}
                    style={{ width: '18px', height: '18px', margin: 0, cursor: 'pointer', flexShrink: 0 }}
                  />
                  Primary
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0, whiteSpace: 'nowrap', flexShrink: 0, fontSize: '0.875rem', height: '44px', padding: '0 0.5rem' }}>
                  <input
                    type="checkbox"
                    checked={address.is_billing || false}
                    onChange={(e) => updateAddress(index, 'is_billing', e.target.checked)}
                    style={{ width: '18px', height: '18px', margin: 0, cursor: 'pointer', flexShrink: 0 }}
                  />
                  Billing
                </label>
                <button 
                  type="button" 
                  className="btn btn-small btn-danger" 
                  onClick={() => removeAddress(index)}
                  style={{ flexShrink: 0, whiteSpace: 'nowrap' }}
                >
                  Remove
                </button>
              </div>
              <textarea
                placeholder="Address"
                value={address.address}
                onChange={(e) => updateAddress(index, 'address', e.target.value)}
                rows={2}
                style={{ width: '100%', pointerEvents: 'auto', cursor: 'text' }}
              />
            </div>
          ))}
          {(!formData.addresses || formData.addresses.length === 0) && (
            <p style={{ color: '#999', fontSize: '0.9rem' }}>No addresses added</p>
          )}
        </div>

        <div className="form-group">
          <label>Notes</label>
          <textarea
            value={formData.notes || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            rows={3}
            style={{ pointerEvents: 'auto', cursor: 'text' }}
          />
        </div>

        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={saving}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </form>
    </div>
  );
}
