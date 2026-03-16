import React, { useState, useEffect } from 'react';
import { BookedRun, Customer, Destination } from '../shared/types';
import { MockDataService } from '../services/mockDataService';
import { getTodayLocalDate } from '../utils/dateUtils';
import ConfirmationModal from './ConfirmationModal';

interface BookedRunFormProps {
  run?: BookedRun;
  initialDate?: string;
  onSave: () => void;
  onCancel: () => void;
}

const STATUS_OPTIONS: { value: BookedRun['status']; label: string }[] = [
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

export default function BookedRunForm({ run, initialDate, onSave, onCancel }: BookedRunFormProps) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [formData, setFormData] = useState({
    run_date: initialDate || getTodayLocalDate(),
    estimated_end_date: '',
    customer_id: 0,
    destination_id: 0,
    from_location: '',
    to_location: '',
    description: '',
    estimated_miles: 0,
    estimated_rate: 0,
    status: 'pending' as BookedRun['status'],
    notes: '',
  });
  const [milesInput, setMilesInput] = useState<string>('0');
  const [rateInput, setRateInput] = useState<string>('0');
  const [saving, setSaving] = useState(false);
  const [manualCustomerName, setManualCustomerName] = useState('');
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [conflictingRunsData, setConflictingRunsData] = useState<{ runs: any[]; proceedCallback: () => void } | null>(null);

  useEffect(() => {
    loadData();
    if (run) {
      loadRunData();
    }
  }, [run]);

  const loadData = async () => {
    try {
      const [customersData, destinationsData] = await Promise.all([
        MockDataService.getCustomers(),
        MockDataService.getDestinations(),
      ]);
      setCustomers(customersData || []);
      setDestinations(destinationsData || []);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const loadRunData = () => {
    if (!run) return;
    
    setFormData({
      run_date: run.run_date,
      estimated_end_date: run.estimated_end_date || '',
      customer_id: run.customer_id || 0,
      destination_id: run.destination_id || 0,
      from_location: run.from_location || '',
      to_location: run.to_location || '',
      description: run.description,
      estimated_miles: run.estimated_miles || 0,
      estimated_rate: run.estimated_rate || 0,
      status: run.status,
      notes: run.notes || '',
    });
    setMilesInput(String(run.estimated_miles || 0));
    setRateInput(String(run.estimated_rate || 0));
    // If run has a customer, don't set manual name
    setManualCustomerName('');
  };

  const proceedWithSave = async () => {
    setSaving(true);
    try {
      let customerId = formData.customer_id > 0 ? formData.customer_id : undefined;
      
      // If manual customer name is provided, create a customer on the fly
      if (!customerId && manualCustomerName.trim()) {
        try {
          customerId = await MockDataService.createCustomer({
            name: manualCustomerName.trim(),
          });
        } catch (error) {
          console.error('Error creating customer:', error);
          alert('Failed to create customer. Please try again.');
          return;
        }
      }

      const runData = {
        run_date: formData.run_date,
        estimated_end_date: formData.estimated_end_date.trim() || undefined,
        customer_id: customerId,
        destination_id: formData.destination_id > 0 ? formData.destination_id : undefined,
        from_location: formData.from_location.trim() || undefined,
        to_location: formData.to_location.trim() || undefined,
        description: formData.description.trim(),
        estimated_miles: formData.estimated_miles > 0 ? formData.estimated_miles : undefined,
        estimated_rate: formData.estimated_rate > 0 ? formData.estimated_rate : undefined,
        status: formData.status,
        notes: formData.notes.trim() || undefined,
      };

      if (run?.id) {
        await MockDataService.updateBookedRun(run.id, runData);
      } else {
        await MockDataService.createBookedRun(runData);
      }
      onSave();
    } catch (error: any) {
      console.error('Error saving booked run:', error);
      alert(`Error saving booked run: ${error?.message || 'Unknown error'}`);
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.description.trim()) {
      alert('Please enter a description');
      return;
    }

    // Check for double-booking before saving (completely non-blocking, failsafe)
    try {
      const runDate = formData.run_date;
      const endDate = formData.estimated_end_date.trim() || runDate;
      
      const existingRuns = await MockDataService.getBookedRuns({
        endDate: endDate,
      });

      // Filter out cancelled and completed runs, and exclude the current run if editing
      const conflictingRuns = existingRuns.filter(existingRun => {
        try {
          // Exclude cancelled and completed runs
          if (existingRun.status === 'cancelled' || existingRun.status === 'completed') {
            return false;
          }
          
          // Exclude the current run if we're editing
          if (run?.id && existingRun.id === run.id) {
            return false;
          }
          
          // Check if dates overlap
          const existingStart = existingRun.run_date;
          const existingEnd = existingRun.estimated_end_date || existingRun.run_date;
          
          // Check if the new run's date range overlaps with existing run's date range
          // Two date ranges overlap if: start1 <= end2 && start2 <= end1
          return runDate <= existingEnd && existingStart <= endDate;
        } catch (err) {
          // Skip this run if there's any error
          return false;
        }
      });

      // If there are conflicting runs, ask for confirmation
      if (conflictingRuns.length > 0) {
        // Show custom confirmation modal
        setConflictingRunsData({
          runs: conflictingRuns,
          proceedCallback: () => {
            setShowConfirmationModal(false);
            setConflictingRunsData(null);
            proceedWithSave();
          }
        });
        setShowConfirmationModal(true);
        return;
      }
    } catch (error) {
      // Silently fail - never block the user from saving
      console.error('Error checking for double-booking (non-blocking):', error);
    }

    // No conflicts, proceed with save
    proceedWithSave();
  };

  return (
    <div className="card">
      <h2>{run?.id ? 'Edit Booked Run' : 'New Booked Run'}</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label>Run Date *</label>
            <input
              type="date"
              value={formData.run_date}
              onChange={(e) => {
                const newRunDate = e.target.value;
                setFormData(prev => {
                  // Clear estimated_end_date if it's before the new run_date
                  const updated = { ...prev, run_date: newRunDate };
                  if (prev.estimated_end_date && prev.estimated_end_date < newRunDate) {
                    updated.estimated_end_date = '';
                  }
                  return updated;
                });
              }}
              required
            />
          </div>

          <div className="form-group">
            <label>Estimated End Date</label>
            <input
              type="date"
              value={formData.estimated_end_date}
              onChange={(e) => setFormData(prev => ({ ...prev, estimated_end_date: e.target.value }))}
              min={formData.run_date}
            />
          </div>

          <div className="form-group">
            <label>Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as BookedRun['status'] }))}
            >
              {STATUS_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-group">
          <label>Description *</label>
          <input
            type="text"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            required
            placeholder="e.g., Oversized load from Dallas to Houston"
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Customer</label>
            <select
              value={formData.customer_id}
              onChange={(e) => {
                const newCustomerId = parseInt(e.target.value) || 0;
                setFormData(prev => ({ ...prev, customer_id: newCustomerId }));
                if (newCustomerId > 0) {
                  setManualCustomerName(''); // Clear manual name when selecting from dropdown
                }
              }}
            >
              <option value={0}>No Customer</option>
              {customers.map(customer => (
                <option key={customer.id} value={customer.id}>
                  {customer.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Destination</label>
            <select
              value={formData.destination_id}
              onChange={(e) => setFormData(prev => ({ ...prev, destination_id: parseInt(e.target.value) || 0 }))}
            >
              <option value={0}>No Destination</option>
              {destinations.map(dest => (
                <option key={dest.id} value={dest.id}>
                  {dest.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-group">
          <label>Or Enter Customer Name Manually</label>
          <input
            type="text"
            value={manualCustomerName}
            onChange={(e) => {
              setManualCustomerName(e.target.value);
              if (e.target.value) {
                setFormData(prev => ({ ...prev, customer_id: 0 })); // Clear selection when typing manually
              }
            }}
            placeholder="Enter customer name"
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>From Location</label>
            <input
              type="text"
              value={formData.from_location}
              onChange={(e) => setFormData(prev => ({ ...prev, from_location: e.target.value }))}
              placeholder="e.g., Dallas, TX"
            />
          </div>

          <div className="form-group">
            <label>To Location</label>
            <input
              type="text"
              value={formData.to_location}
              onChange={(e) => setFormData(prev => ({ ...prev, to_location: e.target.value }))}
              placeholder="e.g., Houston, TX"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Estimated Miles</label>
            <input
              type="text"
              value={milesInput}
              onChange={(e) => {
                setMilesInput(e.target.value);
                const numValue = e.target.value === '' ? 0 : parseFloat(e.target.value);
                if (!isNaN(numValue)) {
                  setFormData(prev => ({ ...prev, estimated_miles: numValue }));
                }
              }}
              onBlur={(e) => {
                const numValue = parseFloat(e.target.value);
                if (isNaN(numValue) || numValue < 0) {
                  setMilesInput('0');
                  setFormData(prev => ({ ...prev, estimated_miles: 0 }));
                } else {
                  setMilesInput(String(numValue));
                  setFormData(prev => ({ ...prev, estimated_miles: numValue }));
                }
              }}
              placeholder="0"
              inputMode="decimal"
            />
          </div>

          <div className="form-group">
            <label>Estimated Rate ($)</label>
            <input
              type="text"
              value={rateInput}
              onChange={(e) => {
                setRateInput(e.target.value);
                const numValue = e.target.value === '' ? 0 : parseFloat(e.target.value);
                if (!isNaN(numValue)) {
                  setFormData(prev => ({ ...prev, estimated_rate: numValue }));
                }
              }}
              onBlur={(e) => {
                const numValue = parseFloat(e.target.value);
                if (isNaN(numValue) || numValue < 0) {
                  setRateInput('0');
                  setFormData(prev => ({ ...prev, estimated_rate: 0 }));
                } else {
                  setRateInput(String(numValue));
                  setFormData(prev => ({ ...prev, estimated_rate: numValue }));
                }
              }}
              placeholder="0.00"
              inputMode="decimal"
            />
          </div>
        </div>

        <div className="form-group">
          <label>Notes</label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            rows={3}
            placeholder="Additional notes about this run..."
          />
        </div>

        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={saving}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving...' : 'Save Run'}
          </button>
        </div>
      </form>

      {conflictingRunsData && (
        <ConfirmationModal
          isOpen={showConfirmationModal}
          title="Double Booking Detected"
          message={`You already have ${conflictingRunsData.runs.length} ${conflictingRunsData.runs.length === 1 ? 'run' : 'runs'} scheduled on this date:\n\n${conflictingRunsData.runs.map(r => {
            try {
              return `- ${r.description} (${r.run_date}${r.estimated_end_date && r.estimated_end_date !== r.run_date ? ` to ${r.estimated_end_date}` : ''})`;
            } catch {
              return `- ${r.description || 'Run'}`;
            }
          }).join('\n')}\n\nAre you sure you want to schedule another run?`}
          onConfirm={conflictingRunsData.proceedCallback}
          onCancel={() => {
            setShowConfirmationModal(false);
            setConflictingRunsData(null);
          }}
          confirmText="Yes, Continue"
          cancelText="Cancel"
        />
      )}
    </div>
  );
}

