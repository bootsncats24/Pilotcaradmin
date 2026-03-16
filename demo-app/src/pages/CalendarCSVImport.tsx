import React from 'react';
import { useNavigate } from 'react-router-dom';
import { showDemoMessage } from '../data/mockData';

export default function CalendarCSVImport() {
  const navigate = useNavigate();

  React.useEffect(() => {
    showDemoMessage();
    navigate('/calendar');
  }, [navigate]);

  return (
    <div className="loading">
      <div className="spinner"></div>
    </div>
  );
}
