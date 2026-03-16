import React, { useState } from 'react';
import { Category } from '../shared/types';

interface SplitItem {
  description: string;
  amount: number;
  category_id?: number;
  is_business: boolean;
}

interface TransactionSplitProps {
  totalAmount: number;
  categories: Category[];
  onSave: (splits: SplitItem[]) => void;
  onCancel: () => void;
}

export default function TransactionSplit({ totalAmount, categories, onSave, onCancel }: TransactionSplitProps) {
  const [splits, setSplits] = useState<SplitItem[]>([
    { description: '', amount: totalAmount, category_id: undefined, is_business: true },
  ]);
  const [amountInputs, setAmountInputs] = useState<string[]>([String(totalAmount)]);

  const addSplit = () => {
    setSplits([...splits, { description: '', amount: 0, category_id: undefined, is_business: true }]);
    setAmountInputs([...amountInputs, '0']);
  };

  const removeSplit = (index: number) => {
    if (splits.length > 1) {
      setSplits(splits.filter((_, i) => i !== index));
      setAmountInputs(amountInputs.filter((_, i) => i !== index));
    }
  };

  const updateSplit = (index: number, field: keyof SplitItem, value: any) => {
    const newSplits = [...splits];
    newSplits[index] = { ...newSplits[index], [field]: value };
    setSplits(newSplits);
  };

  const total = splits.reduce((sum, split) => sum + split.amount, 0);
  const balanced = Math.abs(total - totalAmount) < 0.01;

  const handleSubmit = () => {
    if (!balanced) {
      alert('Split amounts must equal the total transaction amount');
      return;
    }

    if (splits.some((s) => !s.description.trim())) {
      alert('All splits must have a description');
      return;
    }

    onSave(splits);
  };

  return (
    <div className="card">
      <h3>Split Transaction</h3>
      <p>Total Amount: ${totalAmount.toFixed(2)}</p>

      {splits.map((split, index) => (
        <div key={index} style={{ marginBottom: '1rem', padding: '1rem', border: '1px solid #ddd', borderRadius: '4px' }}>
          <div className="form-row">
            <div className="form-group">
              <label>Description</label>
              <input
                type="text"
                value={split.description}
                onChange={(e) => updateSplit(index, 'description', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Amount</label>
              <input
                type="text"
                value={amountInputs[index] || ''}
                onChange={(e) => {
                  const newInputs = [...amountInputs];
                  newInputs[index] = e.target.value;
                  setAmountInputs(newInputs);
                  const numValue = e.target.value === '' ? 0 : parseFloat(e.target.value);
                  if (!isNaN(numValue)) {
                    updateSplit(index, 'amount', numValue);
                  }
                }}
                onBlur={(e) => {
                  const numValue = parseFloat(e.target.value);
                  if (isNaN(numValue) || numValue < 0) {
                    const newInputs = [...amountInputs];
                    newInputs[index] = '0';
                    setAmountInputs(newInputs);
                    updateSplit(index, 'amount', 0);
                  } else {
                    const newInputs = [...amountInputs];
                    newInputs[index] = String(numValue);
                    setAmountInputs(newInputs);
                    updateSplit(index, 'amount', numValue);
                  }
                }}
                placeholder="0.00"
                inputMode="decimal"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Category</label>
              <select
                value={split.category_id || ''}
                onChange={(e) => updateSplit(index, 'category_id', e.target.value ? parseInt(e.target.value) : undefined)}
              >
                <option value="">Uncategorized</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  checked={split.is_business}
                  onChange={(e) => updateSplit(index, 'is_business', e.target.checked)}
                  style={{ marginRight: '0.5rem' }}
                />
                Business
              </label>
            </div>
          </div>

          {splits.length > 1 && (
            <button
              type="button"
              className="btn btn-small btn-danger"
              onClick={() => removeSplit(index)}
            >
              Remove Split
            </button>
          )}
        </div>
      ))}

      <button type="button" className="btn btn-secondary" onClick={addSplit} style={{ marginBottom: '1rem' }}>
        Add Split
      </button>

      <div style={{ marginBottom: '1rem', padding: '0.5rem', backgroundColor: balanced ? '#d4edda' : '#f8d7da', borderRadius: '4px' }}>
        <strong>Total: ${total.toFixed(2)}</strong>
        {!balanced && <span style={{ color: '#721c24', marginLeft: '1rem' }}>
          Difference: ${Math.abs(total - totalAmount).toFixed(2)}
        </span>}
      </div>

      <div className="form-actions">
        <button type="button" className="btn btn-secondary" onClick={onCancel}>
          Cancel
        </button>
        <button type="button" className="btn btn-success" onClick={handleSubmit} disabled={!balanced}>
          Save Splits
        </button>
      </div>
    </div>
  );
}












