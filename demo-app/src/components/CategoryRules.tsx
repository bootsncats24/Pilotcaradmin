import React, { useState } from 'react';
import { CategoryRule, Category } from '../shared/types';
import { MockDataService } from '../services/mockDataService';

interface CategoryRulesProps {
  rules: CategoryRule[];
  categories: Category[];
  onUpdate: () => void;
}

export default function CategoryRules({ rules, categories, onUpdate }: CategoryRulesProps) {
  const [newRule, setNewRule] = useState({
    keyword: '',
    category_id: 0,
    priority: 0,
  });

  const [saving, setSaving] = useState(false);

  const handleAdd = async () => {
    if (!newRule.keyword.trim()) {
      alert('Please enter a keyword');
      return;
    }

    if (!newRule.category_id) {
      alert('Please select a category');
      return;
    }

    try {
      setSaving(true);
      await MockDataService.createCategoryRule(newRule);
      setNewRule({ keyword: '', category_id: 0, priority: 0 });
      onUpdate();
    } catch (error) {
      console.error('Error creating rule:', error);
      alert('Error creating rule');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this rule?')) {
      return;
    }

    try {
      await MockDataService.deleteCategoryRule(id);
      onUpdate();
    } catch (error) {
      console.error('Error deleting rule:', error);
      alert('Error deleting rule');
    }
  };

  return (
    <div>
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <h3>Add New Rule</h3>
        <p>
          Rules automatically categorize transactions based on keywords in the description or vendor name.
          Higher priority rules are applied first.
        </p>

        <div className="form-row">
          <div className="form-group">
            <label>Keyword</label>
            <input
              type="text"
              value={newRule.keyword}
              onChange={(e) => setNewRule({ ...newRule, keyword: e.target.value })}
              placeholder="e.g., Chevron, Home Depot"
            />
          </div>

          <div className="form-group">
            <label>Category</label>
            <select
              value={newRule.category_id}
              onChange={(e) => setNewRule({ ...newRule, category_id: parseInt(e.target.value) })}
            >
              <option value="0">Select category...</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Priority</label>
            <input
              type="text"
              value={newRule.priority === 0 ? '' : String(newRule.priority)}
              onChange={(e) => {
                const numValue = e.target.value === '' ? 0 : parseInt(e.target.value);
                if (!isNaN(numValue)) {
                  setNewRule({ ...newRule, priority: numValue });
                }
              }}
              onBlur={(e) => {
                const numValue = parseInt(e.target.value);
                if (isNaN(numValue)) {
                  setNewRule({ ...newRule, priority: 0 });
                }
              }}
              placeholder="0"
              inputMode="numeric"
              style={{ width: '100px' }}
            />
          </div>

          <button
            type="button"
            className="btn btn-primary"
            onClick={handleAdd}
            disabled={saving}
            style={{ alignSelf: 'flex-end' }}
          >
            Add Rule
          </button>
        </div>
      </div>

      <div className="card">
        <h3>Existing Rules</h3>
        {rules.length === 0 ? (
          <p>No rules defined yet. Add your first rule above.</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Keyword</th>
                <th>Category</th>
                <th>Priority</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rules.map((rule) => (
                <tr key={rule.id}>
                  <td><strong>{rule.keyword}</strong></td>
                  <td>
                    <span
                      className="badge"
                      style={{
                        backgroundColor: categories.find((c) => c.id === rule.category_id)?.color || '#95a5a6',
                      }}
                    >
                      {(rule as any).category_name || 'Unknown'}
                    </span>
                  </td>
                  <td>{rule.priority}</td>
                  <td>
                    <button
                      className="btn btn-small btn-danger"
                      onClick={() => handleDelete(rule.id!)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}












