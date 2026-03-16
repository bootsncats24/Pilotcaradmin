import React, { useState } from 'react';
import { Vehicle } from '../shared/types';
import { MockDataService } from '../services/mockDataService';

interface VehicleFormProps {
  vehicle?: Vehicle;
  onSave: () => void;
  onCancel: () => void;
}

export default function VehicleForm({ vehicle, onSave, onCancel }: VehicleFormProps) {
  const [formData, setFormData] = useState({
    name: vehicle?.name || '',
    make: vehicle?.make || '',
    model: vehicle?.model || '',
    year: vehicle?.year || undefined,
    license_plate: vehicle?.license_plate || '',
    is_active: vehicle?.is_active !== undefined ? vehicle.is_active : true,
  });

  const [yearInput, setYearInput] = useState<string>(vehicle?.year ? String(vehicle.year) : '');
  const [saving, setSaving] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      setFormData({ ...formData, [name]: (e.target as HTMLInputElement).checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert('Please enter a vehicle name');
      return;
    }

    try {
      setSaving(true);

      if (vehicle?.id) {
        await MockDataService.updateVehicle(vehicle.id, formData);
      } else {
        await MockDataService.createVehicle(formData);
      }

      onSave();
    } catch (error) {
      console.error('Error saving vehicle:', error);
      alert('Error saving vehicle');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card">
      <h2>{vehicle ? 'Edit Vehicle' : 'New Vehicle'}</h2>

      <div className="form-group">
        <label>Vehicle Name *</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="e.g., My Truck, Work Van"
          required
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Make</label>
          <input
            type="text"
            name="make"
            value={formData.make}
            onChange={handleChange}
            placeholder="e.g., Ford, Toyota"
          />
        </div>

        <div className="form-group">
          <label>Model</label>
          <input
            type="text"
            name="model"
            value={formData.model}
            onChange={handleChange}
            placeholder="e.g., F-150, Camry"
          />
        </div>

        <div className="form-group">
          <label>Year</label>
          <input
            type="text"
            value={yearInput}
            onChange={(e) => {
              setYearInput(e.target.value);
              const numValue = e.target.value === '' ? undefined : parseInt(e.target.value);
              if (e.target.value === '' || (!isNaN(numValue!) && numValue! >= 1900 && numValue! <= new Date().getFullYear() + 1)) {
                setFormData(prev => ({ ...prev, year: numValue }));
              }
            }}
            onBlur={(e) => {
              const numValue = e.target.value === '' ? undefined : parseInt(e.target.value);
              if (e.target.value !== '' && (isNaN(numValue!) || numValue! < 1900 || numValue! > new Date().getFullYear() + 1)) {
                setYearInput('');
                setFormData(prev => ({ ...prev, year: undefined }));
              } else if (numValue !== undefined) {
                setYearInput(String(numValue));
              }
            }}
            placeholder="2024"
            inputMode="numeric"
          />
        </div>
      </div>

      <div className="form-group">
        <label>License Plate</label>
        <input
          type="text"
          name="license_plate"
          value={formData.license_plate}
          onChange={handleChange}
          placeholder="ABC-1234"
        />
      </div>

      <div className="form-group">
        <label>
          <input
            type="checkbox"
            name="is_active"
            checked={formData.is_active}
            onChange={handleChange}
            style={{ marginRight: '0.5rem' }}
          />
          Active Vehicle
        </label>
        <small>Inactive vehicles won't appear in mileage entry selection</small>
      </div>

      <div className="form-actions">
        <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={saving}>
          Cancel
        </button>
        <button type="submit" className="btn btn-success" disabled={saving}>
          {saving ? 'Saving...' : 'Save Vehicle'}
        </button>
      </div>
    </form>
  );
}












