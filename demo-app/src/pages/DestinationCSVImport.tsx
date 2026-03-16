import React from 'react';
import { useNavigate } from 'react-router-dom';
import { showDemoMessage } from '../data/mockData';

export default function DestinationCSVImport() {
  const navigate = useNavigate();

  React.useEffect(() => {
    showDemoMessage();
    navigate('/destinations');
  }, [navigate]);

  return (
    <div className="loading">
      <div className="spinner"></div>
    </div>
  );
}
