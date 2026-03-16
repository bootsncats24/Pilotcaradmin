import React from 'react';
import { BankFormat } from '../utils/csvParser';

interface CSVColumnMapperProps {
  headers: string[];
  rows: any[];
  mapping: {
    bankName: string;
    dateColumn: string;
    descriptionColumn: string;
    amountColumn: string;
    debitColumn: string;
    creditColumn: string;
    vendorColumn: string;
  };
  detectedFormat?: BankFormat;
  onMappingChange: (mapping: any) => void;
  onNext: () => void;
  onCancel: () => void;
}

export default function CSVColumnMapper({
  headers,
  rows,
  mapping,
  detectedFormat,
  onMappingChange,
  onNext,
  onCancel,
}: CSVColumnMapperProps) {
  const handleChange = (field: string, value: string) => {
    onMappingChange({ ...mapping, [field]: value });
  };

  const isValid = () => {
    return mapping.dateColumn && mapping.descriptionColumn && 
           (mapping.amountColumn || (mapping.debitColumn && mapping.creditColumn));
  };

  const isAutoDetected = mapping.dateColumn && mapping.descriptionColumn && 
                         (mapping.amountColumn || (mapping.debitColumn && mapping.creditColumn));

  return (
    <div className="card">
      <h2>
        {isAutoDetected ? '✓ Auto-Detected Column Mapping' : 'Map CSV Columns'}
      </h2>
      {isAutoDetected && (
        <div style={{ padding: '1rem', backgroundColor: '#d4edda', borderRadius: '4px', marginBottom: '1rem' }}>
          <strong>✓ Columns automatically detected!</strong> Review the mapping below and click Next to continue, or adjust if needed.
        </div>
      )}
      {detectedFormat && !isAutoDetected && (
        <div style={{ padding: '1rem', backgroundColor: '#fff3cd', borderRadius: '4px', marginBottom: '1rem' }}>
          <strong>⚠ Detected format:</strong> {detectedFormat.name} - Please verify the column mappings below.
        </div>
      )}

      <div className="form-group">
        <label>Bank Name (optional)</label>
        <input
          type="text"
          value={mapping.bankName}
          onChange={(e) => handleChange('bankName', e.target.value)}
          placeholder="e.g., Chase, PayPal"
        />
        <small>We'll remember your column mappings for this bank</small>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Date Column *</label>
          <select
            value={mapping.dateColumn}
            onChange={(e) => handleChange('dateColumn', e.target.value)}
          >
            <option value="">Select column...</option>
            {headers.map((header) => (
              <option key={header} value={header}>
                {header}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Description Column *</label>
          <select
            value={mapping.descriptionColumn}
            onChange={(e) => handleChange('descriptionColumn', e.target.value)}
          >
            <option value="">Select column...</option>
            {headers.map((header) => (
              <option key={header} value={header}>
                {header}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div style={{ marginBottom: '1rem', padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
        <strong>Amount Mapping:</strong> Choose either a single amount column OR separate debit/credit columns
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Amount Column</label>
          <select
            value={mapping.amountColumn}
            onChange={(e) => handleChange('amountColumn', e.target.value)}
          >
            <option value="">Select column...</option>
            {headers.map((header) => (
              <option key={header} value={header}>
                {header}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>OR Debit Column</label>
          <select
            value={mapping.debitColumn}
            onChange={(e) => handleChange('debitColumn', e.target.value)}
          >
            <option value="">Select column...</option>
            {headers.map((header) => (
              <option key={header} value={header}>
                {header}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Credit Column</label>
          <select
            value={mapping.creditColumn}
            onChange={(e) => handleChange('creditColumn', e.target.value)}
          >
            <option value="">Select column...</option>
            {headers.map((header) => (
              <option key={header} value={header}>
                {header}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="form-group">
        <label>Vendor Column (optional)</label>
        <select
          value={mapping.vendorColumn}
          onChange={(e) => handleChange('vendorColumn', e.target.value)}
        >
          <option value="">Auto-extract from description</option>
          {headers.map((header) => (
            <option key={header} value={header}>
              {header}
            </option>
          ))}
        </select>
      </div>

      <div style={{ marginTop: '2rem' }}>
        <h3>Preview (first 5 rows)</h3>
        <div style={{ overflowX: 'auto' }}>
          <table className="table">
            <thead>
              <tr>
                {headers.map((header) => (
                  <th key={header}>{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i}>
                  {headers.map((header) => (
                    <td key={header}>{row[header]}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="form-actions">
        <button type="button" className="btn btn-secondary" onClick={onCancel}>
          Cancel
        </button>
        <button type="button" className="btn btn-primary" onClick={onNext} disabled={!isValid()}>
          Next: Preview Transactions
        </button>
      </div>
    </div>
  );
}

