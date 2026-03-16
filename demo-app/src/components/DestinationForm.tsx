import React, { useState, useEffect } from 'react';
import { Destination } from '../shared/types';
import { MockDataService } from '../services/mockDataService';

interface DestinationFormProps {
  destination?: Destination;
  onSave: () => void;
  onCancel: () => void;
}

export default function DestinationForm({ destination, onSave, onCancel }: DestinationFormProps) {
  const [formData, setFormData] = useState<Omit<Destination, 'id' | 'created_at' | 'updated_at' | 'distance'>>({
    name: '',
    address: '',
    notes: '',
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (destination) {
      setFormData({
        name: destination.name || '',
        address: destination.address || '',
        notes: destination.notes || '',
      });
    }
  }, [destination]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      alert('Name is required');
      return;
    }

    setSaving(true);
    try {
      if (destination?.id) {
        await MockDataService.updateDestination(destination.id, formData);
      } else {
        await MockDataService.createDestination(formData);
      }
      onSave();
    } catch (error) {
      console.error('Error saving destination:', error);
      alert('Error saving destination');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: keyof typeof formData, value: string | number | undefined) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="card">
      <h2>{destination?.id ? 'Edit Destination' : 'New Destination'}</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Name *</label>
          <input
            type="text"
            value={formData.name || ''}
            onChange={(e) => handleChange('name', e.target.value)}
            required
            style={{ pointerEvents: 'auto', cursor: 'text' }}
          />
        </div>

        <div className="form-group">
          <label>Address</label>
          <textarea
            value={formData.address || ''}
            onChange={(e) => handleChange('address', e.target.value)}
            rows={2}
            style={{ pointerEvents: 'auto', cursor: 'text' }}
          />
        </div>

        <div className="form-group">
          <label>Notes</label>
          <textarea
            value={formData.notes || ''}
            onChange={(e) => handleChange('notes', e.target.value)}
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

