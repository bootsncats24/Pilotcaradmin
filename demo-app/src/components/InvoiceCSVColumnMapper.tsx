import React from 'react';

interface InvoiceCSVColumnMapperProps {
  headers: string[];
  rows: any[];
  mapping: {
    invoiceNumberColumn: string;
    customerColumn: string;
    customerAddressColumn: string;
    customerPhoneColumn: string;
    customerEmailColumn: string;
    dateColumn: string;
    dueDateColumn: string;
    paymentDateColumn: string;
    statusColumn: string;
    descriptionColumn: string;
    typeColumn: string;
    quantityColumn: string;
    rateColumn: string;
    amountColumn: string;
    milesColumn: string;
    fromDestinationColumn: string;
    toDestinationColumn: string;
    runDateColumn: string;
    totalColumn: string;
    notesColumn: string;
  };
  onMappingChange: (mapping: any) => void;
  onNext: () => void;
  onCancel: () => void;
}

export default function InvoiceCSVColumnMapper({
  headers,
  rows,
  mapping,
  onMappingChange,
  onNext,
  onCancel,
}: InvoiceCSVColumnMapperProps) {
  const handleChange = (field: string, value: string) => {
    onMappingChange({ ...mapping, [field]: value });
  };

  const isValid = () => {
    // At minimum, we need invoice number or customer, date, and some amount/description
    return (
      (mapping.invoiceNumberColumn || mapping.customerColumn) &&
      mapping.dateColumn &&
      (mapping.amountColumn || mapping.descriptionColumn || mapping.totalColumn)
    );
  };

  const isAutoDetected = isValid() && (
    mapping.invoiceNumberColumn || mapping.customerColumn
  );

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

      <div style={{ marginBottom: '1rem', padding: '1rem', backgroundColor: '#e7f3ff', borderRadius: '4px' }}>
        <strong>Required Fields:</strong> At minimum, you need Invoice Number (or Customer), Date, and Amount/Description.
        Other fields are optional and will use defaults if not provided.
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Invoice Number *</label>
          <select
            value={mapping.invoiceNumberColumn}
            onChange={(e) => handleChange('invoiceNumberColumn', e.target.value)}
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
          <label>Customer Name *</label>
          <select
            value={mapping.customerColumn}
            onChange={(e) => handleChange('customerColumn', e.target.value)}
          >
            <option value="">Select column...</option>
            {headers.map((header) => (
              <option key={header} value={header}>
                {header}
              </option>
            ))}
          </select>
          <small>Required if Invoice Number is not provided</small>
        </div>
      </div>

      <div style={{ marginTop: '1.5rem', marginBottom: '1rem', padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
        <strong>Customer Information (Optional):</strong>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Customer Address</label>
          <select
            value={mapping.customerAddressColumn}
            onChange={(e) => handleChange('customerAddressColumn', e.target.value)}
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
          <label>Customer Phone</label>
          <select
            value={mapping.customerPhoneColumn}
            onChange={(e) => handleChange('customerPhoneColumn', e.target.value)}
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
          <label>Customer Email</label>
          <select
            value={mapping.customerEmailColumn}
            onChange={(e) => handleChange('customerEmailColumn', e.target.value)}
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

      <div className="form-row">
        <div className="form-group">
          <label>Invoice Date *</label>
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
          <label>Due Date</label>
          <select
            value={mapping.dueDateColumn}
            onChange={(e) => handleChange('dueDateColumn', e.target.value)}
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
          <label>Payment Date</label>
          <select
            value={mapping.paymentDateColumn}
            onChange={(e) => handleChange('paymentDateColumn', e.target.value)}
          >
            <option value="">Select column...</option>
            {headers.map((header) => (
              <option key={header} value={header}>
                {header}
              </option>
            ))}
          </select>
          <small>If provided, status will be set to "paid"</small>
        </div>

        <div className="form-group">
          <label>Status</label>
          <select
            value={mapping.statusColumn}
            onChange={(e) => handleChange('statusColumn', e.target.value)}
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

      <div style={{ marginTop: '1.5rem', marginBottom: '1rem', padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
        <strong>Invoice Item Fields:</strong>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Description</label>
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

        <div className="form-group">
          <label>Billing Type</label>
          <select
            value={mapping.typeColumn}
            onChange={(e) => handleChange('typeColumn', e.target.value)}
          >
            <option value="">Select column...</option>
            {headers.map((header) => (
              <option key={header} value={header}>
                {header}
              </option>
            ))}
          </select>
          <small>mile, mini_run, day_rate, hourly, chase_pole</small>
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Quantity</label>
          <select
            value={mapping.quantityColumn}
            onChange={(e) => handleChange('quantityColumn', e.target.value)}
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
          <label>Rate</label>
          <select
            value={mapping.rateColumn}
            onChange={(e) => handleChange('rateColumn', e.target.value)}
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
          <label>Amount</label>
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
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Miles</label>
          <select
            value={mapping.milesColumn}
            onChange={(e) => handleChange('milesColumn', e.target.value)}
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
          <label>From Destination</label>
          <select
            value={mapping.fromDestinationColumn}
            onChange={(e) => handleChange('fromDestinationColumn', e.target.value)}
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
          <label>To Destination</label>
          <select
            value={mapping.toDestinationColumn}
            onChange={(e) => handleChange('toDestinationColumn', e.target.value)}
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

      <div className="form-row">
        <div className="form-group">
          <label>Run Date</label>
          <select
            value={mapping.runDateColumn}
            onChange={(e) => handleChange('runDateColumn', e.target.value)}
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
          <label>Total Amount</label>
          <select
            value={mapping.totalColumn}
            onChange={(e) => handleChange('totalColumn', e.target.value)}
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
          <label>Notes</label>
          <select
            value={mapping.notesColumn}
            onChange={(e) => handleChange('notesColumn', e.target.value)}
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
        <button 
          type="button" 
          className="btn btn-primary" 
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (isValid()) {
              onNext();
            }
            // Button is disabled if not valid, so this shouldn't execute
          }} 
          disabled={!isValid()}
          title={!isValid() ? 'Please map all required columns (Invoice Number/Customer, Date, and Amount/Description/Total) to continue' : 'Continue to preview'}
        >
          Next: Preview Invoices
        </button>
      </div>
    </div>
  );
}







