import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookedRun } from '../shared/types';
import { MockDataService } from '../services/mockDataService';
import BookedRunForm from '../components/BookedRunForm';
import { formatLocalDate, getTodayLocalDate } from '../utils/dateUtils';

export default function Calendar() {
  const navigate = useNavigate();
  const [runs, setRuns] = useState<BookedRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingRun, setEditingRun] = useState<BookedRun | undefined>();
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  useEffect(() => {
    loadRuns();
  }, [currentMonth, currentYear]);

  const loadRuns = async () => {
    try {
      setLoading(true);
      // Get first and last day of current month
      const firstDay = new Date(currentYear, currentMonth, 1);
      const lastDay = new Date(currentYear, currentMonth + 1, 0);
      const startDate = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-01`;
      const endDate = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(lastDay.getDate()).padStart(2, '0')}`;
      
      const data = await MockDataService.getBookedRuns({ startDate, endDate });
      setRuns(data || []);
    } catch (error) {
      console.error('Error loading booked runs:', error);
      setRuns([]);
    } finally {
      setLoading(false);
    }
  };

  const handleNew = (date?: string) => {
    setEditingRun(undefined);
    if (date) {
      setSelectedDate(date);
    }
    setShowForm(true);
  };

  const handleEdit = (run: BookedRun) => {
    setEditingRun(run);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this booked run?')) {
      return;
    }

    try {
      await MockDataService.deleteBookedRun(id);
      loadRuns();
    } catch (error) {
      console.error('Error deleting booked run:', error);
      alert('Error deleting booked run');
    }
  };

  const handleSave = () => {
    setShowForm(false);
    setEditingRun(undefined);
    setSelectedDate(null);
    loadRuns();
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingRun(undefined);
    setSelectedDate(null);
  };

  const navigateMonth = (direction: number) => {
    const newDate = new Date(currentYear, currentMonth + direction, 1);
    setCurrentMonth(newDate.getMonth());
    setCurrentYear(newDate.getFullYear());
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentMonth(today.getMonth());
    setCurrentYear(today.getFullYear());
  };

  const getDaysInMonth = () => {
    return new Date(currentYear, currentMonth + 1, 0).getDate();
  };

  const getFirstDayOfMonth = () => {
    return new Date(currentYear, currentMonth, 1).getDay();
  };

  const getRunsForDate = (date: number): BookedRun[] => {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(date).padStart(2, '0')}`;
    return runs.filter(run => {
      // If run has an estimated end date, show it on all days between start and end (inclusive)
      if (run.estimated_end_date && run.estimated_end_date >= run.run_date) {
        return dateStr >= run.run_date && dateStr <= run.estimated_end_date;
      }
      // Otherwise, only show on the start date
      return run.run_date === dateStr;
    });
  };

  const getStatusColor = (status: BookedRun['status']): string => {
    switch (status) {
      case 'confirmed': return '#27ae60';
      case 'pending': return '#f39c12';
      case 'completed': return '#3498db';
      case 'cancelled': return '#e74c3c';
      default: return '#95a5a6';
    }
  };

  const isToday = (date: number): boolean => {
    const today = new Date();
    return (
      date === today.getDate() &&
      currentMonth === today.getMonth() &&
      currentYear === today.getFullYear()
    );
  };

  const isPast = (date: number): boolean => {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(date).padStart(2, '0')}`;
    return dateStr < getTodayLocalDate();
  };

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const daysInMonth = getDaysInMonth();
  const firstDay = getFirstDayOfMonth();

  if (showForm) {
    return (
      <>
        <div className="page-header">
          <h1 className="page-title">Calendar</h1>
        </div>
        <BookedRunForm
          run={editingRun}
          initialDate={selectedDate || undefined}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      </>
    );
  }

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Calendar</h1>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button className="btn btn-secondary" onClick={goToToday}>
            Today
          </button>
          <button className="btn btn-primary" onClick={() => handleNew()}>
            New Run
          </button>
          <button className="btn btn-secondary" onClick={() => navigate('/calendar/import')}>
            Import CSV
          </button>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <button className="btn btn-secondary" onClick={() => navigateMonth(-1)}>
            ← Previous
          </button>
          <h2 style={{ margin: 0 }}>
            {monthNames[currentMonth]} {currentYear}
          </h2>
          <button className="btn btn-secondary" onClick={() => navigateMonth(1)}>
            Next →
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <div className="loading-spinner"></div>
          </div>
        ) : (
          <div className="calendar-grid">
            {/* Day headers */}
            {dayNames.map(day => (
              <div key={day} className="calendar-day-header">
                {day}
              </div>
            ))}

            {/* Empty cells for days before month starts */}
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} className="calendar-day-empty"></div>
            ))}

            {/* Days of the month */}
            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(date => {
              const dateRuns = getRunsForDate(date);
              const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(date).padStart(2, '0')}`;
              
              return (
                <div
                  key={date}
                  className={`calendar-day ${isToday(date) ? 'calendar-day-today' : ''} ${isPast(date) ? 'calendar-day-past' : ''}`}
                  onClick={() => handleNew(dateStr)}
                >
                  <div className="calendar-day-number">{date}</div>
                  <div className="calendar-day-runs">
                    {dateRuns.slice(0, 3).map(run => (
                      <div
                        key={run.id}
                        className="calendar-run-item"
                        style={{ backgroundColor: getStatusColor(run.status) }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(run);
                        }}
                        title={`${run.description} - ${run.status}`}
                      >
                        <div className="calendar-run-text">{run.description}</div>
                        {run.customer && (
                          <div className="calendar-run-customer">{run.customer.name}</div>
                        )}
                      </div>
                    ))}
                    {dateRuns.length > 3 && (
                      <div className="calendar-run-more">+{dateRuns.length - 3} more</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* List view for selected date or all upcoming runs */}
      <div className="card">
        <h3 style={{ marginBottom: '1rem' }}>Upcoming Runs</h3>
        {runs.filter(run => run.run_date >= getTodayLocalDate() && run.status !== 'cancelled' && run.status !== 'completed').length === 0 ? (
          <p style={{ color: '#7f8c8d' }}>No upcoming runs</p>
        ) : (
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Customer</th>
                  <th>From → To</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {runs
                  .filter(run => run.run_date >= getTodayLocalDate() && run.status !== 'cancelled' && run.status !== 'completed')
                  .sort((a, b) => a.run_date.localeCompare(b.run_date))
                  .map(run => (
                    <tr key={run.id}>
                      <td data-label="Date">{formatLocalDate(run.run_date)}</td>
                      <td data-label="Description">{run.description}</td>
                      <td data-label="Customer">{run.customer?.name || '-'}</td>
                      <td data-label="From → To">
                        {run.from_location && run.to_location
                          ? `${run.from_location} → ${run.to_location}`
                          : run.destination?.name || '-'}
                      </td>
                      <td data-label="Status">
                        <span
                          className="badge"
                          style={{ backgroundColor: getStatusColor(run.status) }}
                        >
                          {run.status.charAt(0).toUpperCase() + run.status.slice(1)}
                        </span>
                      </td>
                      <td data-label="Actions">
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                          <button
                            className="btn btn-small btn-secondary"
                            onClick={() => handleEdit(run)}
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-small btn-danger"
                            onClick={() => handleDelete(run.id!)}
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
      </div>
    </>
  );
}

