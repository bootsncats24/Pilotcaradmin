import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Destination } from '../shared/types';
import { MockDataService } from '../services/mockDataService';
import DestinationForm from '../components/DestinationForm';

export default function Destinations() {
  const navigate = useNavigate();
  const location = useLocation();
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingDestination, setEditingDestination] = useState<Destination | undefined>();
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadDestinations();
  }, []);

  // Handle edit from navigation state
  useEffect(() => {
    const editDestinationId = (location.state as any)?.editDestinationId;
    if (editDestinationId && destinations.length > 0) {
      const destination = destinations.find(d => d.id === editDestinationId);
      if (destination) {
        setEditingDestination(destination);
        setShowForm(true);
        // Clear the state
        window.history.replaceState({}, document.title);
      }
    }
  }, [location, destinations]);

  // Listen for database changes from sync
  useEffect(() => {
    const handleDatabaseChanged = (tableName: string) => {
      if (tableName === 'destinations') {
        console.log('[Destinations] Database changed, refreshing data...');
        loadDestinations();
      }
    };

    if (window.electronAPI?.onDatabaseChanged) {
      window.electronAPI.onDatabaseChanged(handleDatabaseChanged);
    }

    return () => {
      if (window.electronAPI?.removeDatabaseChangedListener) {
        window.electronAPI.removeDatabaseChangedListener();
      }
    };
  }, []);

  const loadDestinations = async () => {
    try {
      setLoading(true);
      const data = await MockDataService.getDestinations();
      setDestinations(data || []);
    } catch (error) {
      console.error('Error loading destinations:', error);
      setDestinations([]);
      // Don't show alert - just show empty state
    } finally {
      setLoading(false);
    }
  };

  const handleNew = () => {
    setEditingDestination(undefined);
    setShowForm(true);
  };

  const handleView = (id: number) => {
    navigate(`/destinations/${id}`);
  };

  const handleEdit = (destination: Destination) => {
    setEditingDestination(destination);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this destination?')) {
      return;
    }

    try {
      await MockDataService.deleteDestination(id);
      loadDestinations();
    } catch (error) {
      console.error('Error deleting destination:', error);
      alert('Error deleting destination');
    }
  };

  const handleSave = () => {
    setShowForm(false);
    setEditingDestination(undefined);
    loadDestinations();
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingDestination(undefined);
  };

  const filteredDestinations = destinations.filter(destination => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      destination.name.toLowerCase().includes(search) ||
      destination.address?.toLowerCase().includes(search) ||
      destination.notes?.toLowerCase().includes(search)
    );
  });

  if (showForm) {
    return (
      <>
        <div className="page-header">
          <h1 className="page-title">Destinations</h1>
        </div>
        <DestinationForm
          destination={editingDestination}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      </>
    );
  }

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Destinations</h1>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn btn-secondary" onClick={() => navigate('/destinations/import')}>
            Import CSV
          </button>
          <button className="btn btn-primary" onClick={handleNew}>
            New Destination
          </button>
        </div>
      </div>

      <div className="search-filter">
        <input
          type="text"
          placeholder="Search destinations..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="card">
          <div className="loading-spinner"></div>
        </div>
      ) : filteredDestinations.length === 0 ? (
        <div className="card empty-state" data-icon="destination">
          <h3>No destinations found</h3>
          <p>{searchTerm ? 'Try adjusting your search' : 'Get started by adding your first destination'}</p>
        </div>
      ) : (
        <div className="card">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Address</th>
                <th>Notes</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDestinations.map((destination) => (
                <tr key={destination.id}>
                  <td>
                    <strong>{destination.name}</strong>
                  </td>
                  <td>{destination.address || '-'}</td>
                  <td>
                    {destination.notes ? (
                      <div style={{ maxWidth: '300px' }}>
                        {destination.notes.length > 100 ? (
                          <span title={destination.notes}>
                            {destination.notes.substring(0, 100)}...
                          </span>
                        ) : (
                          destination.notes
                        )}
                      </div>
                    ) : (
                      '-'
                    )}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <button
                        className="btn btn-small btn-primary"
                        onClick={() => handleView(destination.id!)}
                      >
                        View
                      </button>
                      <button
                        className="btn btn-small btn-secondary"
                        onClick={() => handleEdit(destination)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-small btn-danger"
                        onClick={() => handleDelete(destination.id!)}
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
  );
}

