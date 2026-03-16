import React from 'react';
import { useNavigate } from 'react-router-dom';
import { showDemoMessage } from '../data/mockData';

export default function CSVImport() {
  const navigate = useNavigate();

  React.useEffect(() => {
    showDemoMessage();
    navigate('/transactions');
  }, [navigate]);

  return (
    <div className="loading">
      <div className="spinner"></div>
    </div>
  );
}
