import React, { useState, useEffect } from 'react';
import { Category } from '../shared/types';

interface CSVPreviewProps {
  transactions: any[];
  categories: Category[];
  duplicates: Set<number>;
  onImport: (selectedIndices: Set<number>) => void;
  onCancel: () => void;
}

export default function CSVPreview({ transactions, categories, duplicates, onImport, onCancel }: CSVPreviewProps) {
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [selectAll, setSelectAll] = useState(false);

  useEffect(() => {
    // Auto-select all non-duplicates
    const nonDuplicates = new Set<number>();
    transactions.forEach((_, i) => {
      if (!duplicates.has(i)) {
        nonDuplicates.add(i);
      }
    });
    setSelected(nonDuplicates);
  }, [transactions, duplicates]);

  const toggleSelect = (index: number) => {
    const newSelected = new Set(selected);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelected(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelected(new Set());
    } else {
      setSelected(new Set(transactions.map((_, i) => i)));
    }
    setSelectAll(!selectAll);
  };

  const handleImport = () => {
    if (selected.size === 0) {
      alert('Please select at least one transaction to import');
      return;
    }

    onImport(selected);
  };

  const selectedCount = selected.size;
  const duplicateCount = duplicates.size;
  const totalAmount = transactions
    .filter((_, i) => selected.has(i))
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="card">
      <h2>Preview & Confirm Import</h2>
      
      <div style={{ marginBottom: '1rem', padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
        <div style={{ display: 'flex', gap: '2rem' }}>
          <div><strong>Total Rows:</strong> {transactions.length}</div>
          <div><strong>Selected:</strong> {selectedCount}</div>
          {duplicateCount > 0 && (
            <div style={{ color: '#e67e22' }}>
              <strong>⚠️ Duplicates:</strong> {duplicateCount}
            </div>
          )}
          <div><strong>Total Amount:</strong> ${totalAmount.toFixed(2)}</div>
        </div>
      </div>

      {duplicateCount > 0 && (
        <div style={{ marginBottom: '1rem', padding: '1rem', backgroundColor: '#fff3cd', borderRadius: '4px' }}>
          <strong>Duplicate Detection:</strong> We found {duplicateCount} potential duplicates based on date, amount, 
          and description. These are automatically unselected but you can still import them if needed.
        </div>
      )}

      <div style={{ overflowX: 'auto', maxHeight: '500px', overflowY: 'auto' }}>
        <table className="table">
          <thead style={{ position: 'sticky', top: 0, backgroundColor: '#34495e', zIndex: 1 }}>
            <tr>
              <th>
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={toggleSelectAll}
                />
              </th>
              <th>Date</th>
              <th>Description</th>
              <th>Vendor</th>
              <th>Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction, index) => {
              const isDuplicate = duplicates.has(index);
              const isSelected = selected.has(index);

              return (
                <tr
                  key={index}
                  style={{
                    backgroundColor: isDuplicate ? '#fff3cd' : isSelected ? 'inherit' : '#f8f9fa',
                    opacity: isSelected ? 1 : 0.6,
                  }}
                >
                  <td>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelect(index)}
                    />
                  </td>
                  <td>{transaction.date}</td>
                  <td>{transaction.description}</td>
                  <td>{transaction.vendor || '-'}</td>
                  <td>${transaction.amount.toFixed(2)}</td>
                  <td>
                    {isDuplicate ? (
                      <span className="badge badge-overdue">Duplicate</span>
                    ) : (
                      <span className="badge badge-paid">New</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="form-actions" style={{ marginTop: '1.5rem' }}>
        <button type="button" className="btn btn-secondary" onClick={onCancel}>
          Cancel
        </button>
        <button type="button" className="btn btn-success" onClick={handleImport} disabled={selectedCount === 0}>
          Import {selectedCount} Transaction{selectedCount !== 1 ? 's' : ''}
        </button>
      </div>
    </div>
  );
}












