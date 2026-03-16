import React, { useState, useEffect } from 'react';
import { MileageEntry, Vehicle } from '../shared/types';
import { MockDataService } from '../services/mockDataService';
import { getTodayLocalDate } from '../utils/dateUtils';

interface MileageEntryFormProps {
  entry?: MileageEntry;
  vehicles: Vehicle[];
  onSave: () => void;
  onCancel: () => void;
  onVehicleAdded?: () => void;
}

export default function MileageEntryForm({ entry, vehicles, onSave, onCancel, onVehicleAdded }: MileageEntryFormProps) {
  const [formData, setFormData] = useState({
    vehicle_id: entry?.vehicle_id || (vehicles[0]?.id || (vehicles.length > 0 ? 0 : undefined)),
    date: entry?.date || getTodayLocalDate(),
    start_odometer: entry?.start_odometer || undefined,
    end_odometer: entry?.end_odometer || undefined,
    miles: entry?.miles || 0,
    is_business: entry?.is_business !== undefined ? entry.is_business : true,
    purpose: entry?.purpose || '',
    start_location: entry?.start_location || '',
    end_location: entry?.end_location || '',
    notes: entry?.notes || '',
  });

  const [startOdometerInput, setStartOdometerInput] = useState<string>(entry?.start_odometer ? String(entry.start_odometer) : '');
  const [endOdometerInput, setEndOdometerInput] = useState<string>(entry?.end_odometer ? String(entry.end_odometer) : '');
  const [milesInput, setMilesInput] = useState<string>(String(entry?.miles || 0));

  const [saving, setSaving] = useState(false);
  const [showAddVehicle, setShowAddVehicle] = useState(false);
  const [newVehicleName, setNewVehicleName] = useState('');
  const [addingVehicle, setAddingVehicle] = useState(false);
  const [vehicleInputMode, setVehicleInputMode] = useState<'select' | 'manual'>('select');
  const [manualVehicleName, setManualVehicleName] = useState('');

  // Load last end_odometer when vehicle is selected (only for new entries)
  useEffect(() => {
    const loadLastOdometer = async () => {
      // Only load if it's a new entry (not editing) and vehicle is selected
      if (!entry?.id && formData.vehicle_id) {
        try {
          const lastEndOdometer = await MockDataService.getLastEndOdometerForVehicle(formData.vehicle_id);
          // Only set if start_odometer is not already set
          if (lastEndOdometer !== undefined && formData.start_odometer === undefined) {
            setFormData(prev => ({ ...prev, start_odometer: lastEndOdometer }));
            setStartOdometerInput(String(lastEndOdometer));
          }
        } catch (error) {
          console.error('Error loading last odometer:', error);
        }
      }
    };

    loadLastOdometer();
  }, [formData.vehicle_id]); // Only depend on vehicle_id

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      setFormData({ ...formData, [name]: (e.target as HTMLInputElement).checked });
    } else if (name === 'vehicle_id') {
      const numValue = parseFloat(value);
      // Clear start_odometer when vehicle changes so it can load the correct value for the new vehicle
      setFormData({ ...formData, [name]: isNaN(numValue) ? undefined : numValue, start_odometer: undefined });
      setStartOdometerInput('');
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleAddVehicle = async () => {
    if (!newVehicleName.trim()) {
      alert('Please enter a vehicle name');
      return;
    }

    try {
      setAddingVehicle(true);
      const vehicleId = await MockDataService.createVehicle({
        name: newVehicleName.trim(),
        make: '',
        model: '',
        year: undefined,
        license_plate: '',
        is_active: true,
      });
      
      setFormData({ ...formData, vehicle_id: vehicleId });
      setNewVehicleName('');
      setShowAddVehicle(false);
      if (onVehicleAdded) {
        onVehicleAdded();
      }
    } catch (error) {
      console.error('Error adding vehicle:', error);
      alert('Error adding vehicle');
    } finally {
      setAddingVehicle(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let finalVehicleId = formData.vehicle_id;

    // If in manual mode and vehicle name is provided, try to find or create vehicle
    if (vehicleInputMode === 'manual' && manualVehicleName.trim()) {
      // Check if vehicle exists
      const existingVehicle = vehicles.find(v => v.name.toLowerCase() === manualVehicleName.trim().toLowerCase());
      
      if (existingVehicle) {
        finalVehicleId = existingVehicle.id!;
      } else {
        // Create new vehicle
        try {
          const vehicleId = await MockDataService.createVehicle({
            name: manualVehicleName.trim(),
            make: '',
            model: '',
            year: undefined,
            license_plate: '',
            is_active: true,
          });
          finalVehicleId = vehicleId;
          if (onVehicleAdded) {
            onVehicleAdded();
          }
        } catch (error) {
          console.error('Error creating vehicle:', error);
          alert('Error creating vehicle');
          return;
        }
      }
    }

    if (!finalVehicleId) {
      alert('Please select or enter a vehicle');
      return;
    }

    if (formData.miles < 0) {
      alert('Miles cannot be negative');
      return;
    }

    try {
      setSaving(true);

      const submitData = { ...formData, vehicle_id: finalVehicleId };

      if (entry?.id) {
        await MockDataService.updateMileageEntry(entry.id, submitData as any);
      } else {
        await MockDataService.createMileageEntry(submitData as any);
      }

      onSave();
    } catch (error) {
      console.error('Error saving mileage entry:', error);
      alert('Error saving mileage entry');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card">
      <h2>{entry ? 'Edit Mileage Entry' : 'New Mileage Entry'}</h2>

      <div className="form-row">
        <div className="form-group">
          <label>Vehicle *</label>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
            <div style={{ flex: 1 }}>
              {vehicleInputMode === 'select' ? (
                <select 
                  name="vehicle_id" 
                  value={formData.vehicle_id || ''} 
                  onChange={handleChange}
                  style={{ width: '100%' }}
                >
                  {vehicles.length === 0 ? (
                    <option value="">No vehicles available</option>
                  ) : (
                    vehicles.map((vehicle) => (
                      <option key={vehicle.id} value={vehicle.id}>
                        {vehicle.name}
                      </option>
                    ))
                  )}
                </select>
              ) : (
                <input
                  type="text"
                  value={manualVehicleName}
                  onChange={(e) => setManualVehicleName(e.target.value)}
                  placeholder="Enter vehicle name"
                  style={{ width: '100%' }}
                  list="vehicle-suggestions"
                />
              )}
              <datalist id="vehicle-suggestions">
                {vehicles.map((vehicle) => (
                  <option key={vehicle.id} value={vehicle.name} />
                ))}
              </datalist>
            </div>
            <div style={{ display: 'flex', gap: '0.25rem', flexDirection: 'column' }}>
              <button
                type="button"
                className="btn btn-small btn-secondary"
                onClick={() => {
                  if (vehicleInputMode === 'select') {
                    // Switching to manual mode
                    setVehicleInputMode('manual');
                    setManualVehicleName('');
                  } else {
                    // Switching to select mode - try to match manual name to existing vehicle
                    if (manualVehicleName.trim()) {
                      const matchingVehicle = vehicles.find(
                        v => v.name.toLowerCase() === manualVehicleName.trim().toLowerCase()
                      );
                      if (matchingVehicle) {
                        setFormData({ ...formData, vehicle_id: matchingVehicle.id! });
                      }
                    }
                    setVehicleInputMode('select');
                  }
                }}
                style={{ whiteSpace: 'nowrap', fontSize: '0.875rem', padding: '0.375rem 0.5rem' }}
                title={vehicleInputMode === 'select' ? 'Switch to manual entry' : 'Switch to dropdown'}
              >
                {vehicleInputMode === 'select' ? '✏️' : '📋'}
              </button>
              {vehicleInputMode === 'select' && (
                <button
                  type="button"
                  className="btn btn-small btn-primary"
                  onClick={() => setShowAddVehicle(!showAddVehicle)}
                  style={{ whiteSpace: 'nowrap', fontSize: '0.875rem', padding: '0.375rem 0.5rem' }}
                  title="Add new vehicle"
                >
                  +
                </button>
              )}
            </div>
          </div>
          {showAddVehicle && vehicleInputMode === 'select' && (
            <div style={{ marginTop: '0.5rem', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '4px', backgroundColor: '#f9f9f9' }}>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <input
                  type="text"
                  value={newVehicleName}
                  onChange={(e) => setNewVehicleName(e.target.value)}
                  placeholder="Vehicle name"
                  style={{ flex: 1 }}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddVehicle();
                    }
                  }}
                />
                <button
                  type="button"
                  className="btn btn-small btn-success"
                  onClick={handleAddVehicle}
                  disabled={addingVehicle || !newVehicleName.trim()}
                >
                  {addingVehicle ? 'Adding...' : 'Add'}
                </button>
                <button
                  type="button"
                  className="btn btn-small btn-secondary"
                  onClick={() => {
                    setShowAddVehicle(false);
                    setNewVehicleName('');
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="form-group">
          <label>Date *</label>
          <input type="date" name="date" value={formData.date} onChange={handleChange} required />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Start Odometer</label>
          <input
            type="text"
            value={startOdometerInput}
            onChange={(e) => {
              setStartOdometerInput(e.target.value);
              const numValue = e.target.value === '' ? undefined : parseFloat(e.target.value);
              if (e.target.value === '' || !isNaN(numValue!)) {
                setFormData(prev => ({ ...prev, start_odometer: numValue }));
                // Auto-calculate miles if both odometer readings are provided
                if (numValue !== undefined && formData.end_odometer !== undefined && formData.end_odometer > numValue) {
                  const calculatedMiles = formData.end_odometer - numValue;
                  setMilesInput(String(calculatedMiles));
                  setFormData(prev => ({ ...prev, start_odometer: numValue, miles: calculatedMiles }));
                }
              }
            }}
            onBlur={(e) => {
              const numValue = e.target.value === '' ? undefined : parseFloat(e.target.value);
              if (e.target.value !== '' && (isNaN(numValue!) || numValue! < 0)) {
                setStartOdometerInput('');
                setFormData(prev => ({ ...prev, start_odometer: undefined }));
              } else if (numValue !== undefined) {
                setStartOdometerInput(String(numValue));
              }
            }}
            placeholder="0.0"
            inputMode="decimal"
          />
        </div>

        <div className="form-group">
          <label>End Odometer</label>
          <input
            type="text"
            value={endOdometerInput}
            onChange={(e) => {
              setEndOdometerInput(e.target.value);
              const numValue = e.target.value === '' ? undefined : parseFloat(e.target.value);
              if (e.target.value === '' || !isNaN(numValue!)) {
                setFormData(prev => ({ ...prev, end_odometer: numValue }));
                // Auto-calculate miles if both odometer readings are provided
                if (numValue !== undefined && formData.start_odometer !== undefined && numValue > formData.start_odometer) {
                  const calculatedMiles = numValue - formData.start_odometer;
                  setMilesInput(String(calculatedMiles));
                  setFormData(prev => ({ ...prev, end_odometer: numValue, miles: calculatedMiles }));
                }
              }
            }}
            onBlur={(e) => {
              const numValue = e.target.value === '' ? undefined : parseFloat(e.target.value);
              if (e.target.value !== '' && (isNaN(numValue!) || numValue! < 0)) {
                setEndOdometerInput('');
                setFormData(prev => ({ ...prev, end_odometer: undefined }));
              } else if (numValue !== undefined) {
                setEndOdometerInput(String(numValue));
              }
            }}
            placeholder="0.0"
            inputMode="decimal"
          />
        </div>

        <div className="form-group">
          <label>Miles *</label>
          <input
            type="text"
            value={milesInput}
            onChange={(e) => {
              setMilesInput(e.target.value);
              const numValue = e.target.value === '' ? 0 : parseFloat(e.target.value);
              if (!isNaN(numValue)) {
                setFormData(prev => ({ ...prev, miles: numValue }));
              }
            }}
            onBlur={(e) => {
              const numValue = parseFloat(e.target.value);
              if (isNaN(numValue) || numValue < 0) {
                setMilesInput('0');
                setFormData(prev => ({ ...prev, miles: 0 }));
              } else {
                setMilesInput(String(numValue));
                setFormData(prev => ({ ...prev, miles: numValue }));
              }
            }}
            placeholder="0.0"
            required
            inputMode="decimal"
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Start Location</label>
          <input
            type="text"
            name="start_location"
            value={formData.start_location}
            onChange={handleChange}
            placeholder="e.g., Office, Home"
          />
        </div>

        <div className="form-group">
          <label>End Location</label>
          <input
            type="text"
            name="end_location"
            value={formData.end_location}
            onChange={handleChange}
            placeholder="e.g., Client Site, Store"
          />
        </div>
      </div>

      <div className="form-group">
        <label>
          <input
            type="checkbox"
            name="is_business"
            checked={formData.is_business}
            onChange={handleChange}
            style={{ marginRight: '0.5rem' }}
          />
          Business Miles (Tax Deductible)
        </label>
      </div>

      <div className="form-group">
        <label>Purpose</label>
        <input
          type="text"
          name="purpose"
          value={formData.purpose}
          onChange={handleChange}
          placeholder="e.g., Client meeting, Supply pickup"
        />
      </div>

      <div className="form-group">
        <label>Notes</label>
        <textarea name="notes" value={formData.notes} onChange={handleChange} />
      </div>

      <div className="form-actions">
        <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={saving}>
          Cancel
        </button>
        <button type="submit" className="btn btn-success" disabled={saving}>
          {saving ? 'Saving...' : 'Save Entry'}
        </button>
      </div>
    </form>
  );
}





