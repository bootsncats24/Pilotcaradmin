import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Vehicle, MileageEntry, Settings } from '../shared/types';
import { MockDataService } from '../services/mockDataService';
import MileageEntryForm from '../components/MileageEntryForm';
import VehicleForm from '../components/VehicleForm';
import MileageReport from '../components/MileageReport';

type View = 'entries' | 'vehicles' | 'report';

export default function Mileage() {
  const navigate = useNavigate();
  const [view, setView] = useState<View>('entries');
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [entries, setEntries] = useState<MileageEntry[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [showEntryForm, setShowEntryForm] = useState(false);
  const [showVehicleForm, setShowVehicleForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState<MileageEntry | undefined>();
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | undefined>();

  const [filters, setFilters] = useState({
    vehicleId: undefined as number | undefined,
    startDate: '',
    endDate: '',
    isBusiness: undefined as boolean | undefined,
  });

  useEffect(() => {
    loadData();
  }, [filters]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [vehicleData, entryData, settingsData] = await Promise.all([
        MockDataService.getVehicles(),
        MockDataService.getMileageEntries(filters),
        MockDataService.getSettings(),
      ]);
      setVehicles(vehicleData || []);
      setEntries(entryData || []);
      setSettings(settingsData);
    } catch (error) {
      console.error('Error loading mileage data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNewEntry = () => {
    setEditingEntry(undefined);
    setShowEntryForm(true);
  };

  const handleEditEntry = (entry: MileageEntry) => {
    setEditingEntry(entry);
    setShowEntryForm(true);
  };

  const handleDeleteEntry = async (id: number) => {
    if (!confirm('Are you sure you want to delete this mileage entry?')) {
      return;
    }

    try {
      await MockDataService.deleteMileageEntry(id);
      loadData();
    } catch (error) {
      console.error('Error deleting entry:', error);
      alert('Error deleting entry');
    }
  };

  const handleNewVehicle = () => {
    setEditingVehicle(undefined);
    setShowVehicleForm(true);
  };

  const handleEditVehicle = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setShowVehicleForm(true);
  };

  const handleDeleteVehicle = async (id: number) => {
    if (!confirm('Are you sure you want to delete this vehicle?')) {
      return;
    }

    try {
      await MockDataService.deleteVehicle(id);
      loadData();
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      alert('Error deleting vehicle');
    }
  };

  const totalMiles = entries.reduce((sum, e) => sum + e.miles, 0);
  const businessMiles = entries.filter((e) => e.is_business).reduce((sum, e) => sum + e.miles, 0);
  const mileageRate = settings?.irs_mileage_rate || 0.67;
  const deduction = businessMiles * mileageRate;

  if (showEntryForm) {
    return (
      <>
        <div className="page-header">
          <h1 className="page-title">Mileage</h1>
        </div>
        <MileageEntryForm
          entry={editingEntry}
          vehicles={vehicles}
          onSave={() => {
            setShowEntryForm(false);
            setEditingEntry(undefined);
            loadData();
          }}
          onCancel={() => {
            setShowEntryForm(false);
            setEditingEntry(undefined);
          }}
          onVehicleAdded={() => {
            loadData();
          }}
        />
      </>
    );
  }

  if (showVehicleForm) {
    return (
      <>
        <div className="page-header">
          <h1 className="page-title">Vehicles</h1>
        </div>
        <VehicleForm
          vehicle={editingVehicle}
          onSave={() => {
            setShowVehicleForm(false);
            setEditingVehicle(undefined);
            loadData();
          }}
          onCancel={() => {
            setShowVehicleForm(false);
            setEditingVehicle(undefined);
          }}
        />
      </>
    );
  }

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Mileage Tracking</h1>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            className={`btn ${view === 'entries' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setView('entries')}
          >
            Mileage Log
          </button>
          <button
            className={`btn ${view === 'vehicles' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setView('vehicles')}
          >
            Vehicles
          </button>
          <button
            className={`btn ${view === 'report' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setView('report')}
          >
            Deduction Report
          </button>
        </div>
      </div>

      {view === 'entries' && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className="btn btn-primary" onClick={handleNewEntry}>
                New Mileage Entry
              </button>
              <button className="btn btn-secondary" onClick={() => navigate('/mileage/import')}>
                Import CSV
              </button>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <select
                value={filters.vehicleId || ''}
                onChange={(e) => setFilters({ ...filters, vehicleId: e.target.value ? parseInt(e.target.value) : undefined })}
                style={{ padding: '0.5rem' }}
              >
                <option value="">All Vehicles</option>
                {vehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name}
                  </option>
                ))}
              </select>

              <select
                value={filters.isBusiness === undefined ? '' : String(filters.isBusiness)}
                onChange={(e) => setFilters({ ...filters, isBusiness: e.target.value === '' ? undefined : e.target.value === 'true' })}
                style={{ padding: '0.5rem' }}
              >
                <option value="">All Types</option>
                <option value="true">Business</option>
                <option value="false">Personal</option>
              </select>
            </div>
          </div>

          <div className="card" style={{ marginBottom: '1rem', padding: '1rem' }}>
            <div style={{ display: 'flex', gap: '2rem' }}>
              <div><strong>Total Miles:</strong> {totalMiles.toFixed(1)}</div>
              <div><strong>Business Miles:</strong> {businessMiles.toFixed(1)}</div>
              <div><strong>IRS Rate:</strong> ${mileageRate}/mile</div>
              <div><strong>Deduction:</strong> ${deduction.toFixed(2)}</div>
            </div>
          </div>

          {loading ? (
            <div className="card">
              <div className="loading-spinner"></div>
            </div>
          ) : entries.length === 0 ? (
            <div className="card empty-state" data-icon="mileage">
              <h3>No mileage entries found</h3>
              <p>Start tracking your business miles for tax deductions</p>
            </div>
          ) : (
            <div className="card">
              <table className="table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Vehicle</th>
                    <th>Route</th>
                    <th>Miles</th>
                    <th>Type</th>
                    <th>Purpose</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((entry) => (
                    <tr key={entry.id}>
                      <td>{entry.date}</td>
                      <td>{(entry as any).vehicle_name || '-'}</td>
                      <td>
                        {entry.start_location && entry.end_location
                          ? `${entry.start_location} → ${entry.end_location}`
                          : '-'}
                      </td>
                      <td><strong>{entry.miles.toFixed(1)}</strong></td>
                      <td>
                        <span className={`badge ${entry.is_business ? 'badge-paid' : 'badge-cancelled'}`}>
                          {entry.is_business ? 'Business' : 'Personal'}
                        </span>
                      </td>
                      <td>{entry.purpose || '-'}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button
                            className="btn btn-small btn-secondary"
                            onClick={() => handleEditEntry(entry)}
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-small btn-danger"
                            onClick={() => handleDeleteEntry(entry.id!)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {view === 'vehicles' && (
        <>
          <button className="btn btn-primary" onClick={handleNewVehicle} style={{ marginBottom: '1rem' }}>
            Add Vehicle
          </button>

          {loading ? (
            <div className="card">
              <div className="loading-spinner"></div>
            </div>
          ) : vehicles.length === 0 ? (
            <div className="card empty-state" data-icon="mileage">
              <h3>No vehicles found</h3>
              <p>Add a vehicle to start tracking mileage</p>
            </div>
          ) : (
            <div className="card">
              <table className="table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Make/Model</th>
                    <th>Year</th>
                    <th>License Plate</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {vehicles.map((vehicle) => (
                    <tr key={vehicle.id}>
                      <td><strong>{vehicle.name}</strong></td>
                      <td>
                        {vehicle.make && vehicle.model ? `${vehicle.make} ${vehicle.model}` : '-'}
                      </td>
                      <td>{vehicle.year || '-'}</td>
                      <td>{vehicle.license_plate || '-'}</td>
                      <td>
                        <span className={`badge ${vehicle.is_active ? 'badge-paid' : 'badge-cancelled'}`}>
                          {vehicle.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button
                            className="btn btn-small btn-secondary"
                            onClick={() => handleEditVehicle(vehicle)}
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-small btn-danger"
                            onClick={() => handleDeleteVehicle(vehicle.id!)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {view === 'report' && (
        <MileageReport entries={entries} settings={settings} />
      )}
    </>
  );
}





