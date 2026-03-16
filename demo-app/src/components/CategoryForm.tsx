import React, { useState } from 'react';
import { Category } from '../shared/types';
import { MockDataService } from '../services/mockDataService';

interface CategoryFormProps {
  category?: Category;
  categories: Category[];
  onSave: () => void;
  onCancel: () => void;
}

const DEFAULT_COLORS = [
  '#e74c3c', '#f39c12', '#3498db', '#9b59b6', '#1abc9c',
  '#34495e', '#e67e22', '#2ecc71', '#16a085', '#c0392b',
  '#8e44ad', '#27ae60', '#2980b9', '#d35400', '#7f8c8d',
  '#2c3e50', '#95a5a6'
];

export default function CategoryForm({ category, categories, onSave, onCancel }: CategoryFormProps) {
  const [formData, setFormData] = useState({
    name: category?.name || '',
    description: category?.description || '',
    irs_category: category?.irs_category || '',
    parent_id: category?.parent_id || undefined,
    color: category?.color || DEFAULT_COLORS[0],
    sort_order: category?.sort_order || 0,
  });

  const [sortOrderInput, setSortOrderInput] = useState<string>(String(category?.sort_order || 0));
  const [saving, setSaving] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'parent_id') {
      setFormData({ ...formData, [name]: value ? parseInt(value) : undefined });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert('Please enter a category name');
      return;
    }

    try {
      setSaving(true);

      if (category?.id) {
        await MockDataService.updateCategory(category.id, formData);
      } else {
        await MockDataService.createCategory({ ...formData, is_system: false });
      }

      onSave();
    } catch (error) {
      console.error('Error saving category:', error);
      alert('Error saving category');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card">
      <h2>{category ? 'Edit Category' : 'New Category'}</h2>

      <div className="form-group">
        <label>Name *</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-group">
        <label>Description</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>IRS Schedule C Category</label>
          <input
            type="text"
            name="irs_category"
            value={formData.irs_category}
            onChange={handleChange}
            placeholder="e.g., Car and Truck Expenses"
          />
        </div>

        <div className="form-group">
          <label>Parent Category</label>
          <select
            name="parent_id"
            value={formData.parent_id || ''}
            onChange={handleChange}
          >
            <option value="">None</option>
            {categories.filter((c) => c.id !== category?.id).map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Color</label>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <input
              type="color"
              name="color"
              value={formData.color}
              onChange={handleChange}
            />
            <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
              {DEFAULT_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setFormData({ ...formData, color })}
                  style={{
                    width: '30px',
                    height: '30px',
                    backgroundColor: color,
                    border: formData.color === color ? '3px solid #000' : '1px solid #ddd',
                    borderRadius: '4px',
                    cursor: 'pointer',
                  }}
                  title={color}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="form-group">
          <label>Sort Order</label>
          <input
            type="text"
            value={sortOrderInput}
            onChange={(e) => {
              setSortOrderInput(e.target.value);
              const numValue = e.target.value === '' ? 0 : parseInt(e.target.value);
              if (!isNaN(numValue)) {
                setFormData(prev => ({ ...prev, sort_order: numValue }));
              }
            }}
            onBlur={(e) => {
              const numValue = parseInt(e.target.value);
              if (isNaN(numValue)) {
                setSortOrderInput('0');
                setFormData(prev => ({ ...prev, sort_order: 0 }));
              } else {
                setSortOrderInput(String(numValue));
                setFormData(prev => ({ ...prev, sort_order: numValue }));
              }
            }}
            placeholder="0"
            inputMode="numeric"
          />
        </div>
      </div>

      <div className="form-actions">
        <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={saving}>
          Cancel
        </button>
        <button type="submit" className="btn btn-success" disabled={saving}>
          {saving ? 'Saving...' : 'Save Category'}
        </button>
      </div>
    </form>
  );
}












