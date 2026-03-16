import React, { useState, useEffect } from 'react';
import { Category, CategoryRule } from '../shared/types';
import { MockDataService } from '../services/mockDataService';
import { showDemoMessage } from '../data/mockData';
import CategoryForm from '../components/CategoryForm';
import CategoryRules from '../components/CategoryRules';

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [rules, setRules] = useState<CategoryRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [showDefaultInfo, setShowDefaultInfo] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | undefined>();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [catData, rulesData] = await Promise.all([
        MockDataService.getCategories(),
        MockDataService.getCategoryRules(),
      ]);
      setCategories(catData || []);
      setRules(rulesData || []);
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNew = () => {
    setEditingCategory(undefined);
    setShowForm(true);
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this category?')) {
      return;
    }

    showDemoMessage();
    // In demo, don't actually delete, just reload to show it still exists
    loadData();
  };

  const handleSave = () => {
    setShowForm(false);
    setEditingCategory(undefined);
    loadData();
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingCategory(undefined);
  };

  const handleApplyRules = async () => {
    if (!confirm('Apply categorization rules to all uncategorized transactions?')) {
      return;
    }

    showDemoMessage();
  };

  const createDefaultCategories = async () => {
    showDemoMessage();
  };

  const getDefaultCategories = () => {
    return ['Fuel', 'Lodging', 'Meals', 'Supplies', 'Auto Membership', 'Personal'];
  };

  const getCategoryKeywords = (category: string): string[] => {
    const keywordMap: Record<string, string[]> = {
      'Fuel': ['gas', 'fuel', 'chevron', 'shell', 'exxon', 'mobil'],
      'Lodging': ['hotel', 'motel', 'inn', 'lodging', 'accommodation'],
      'Meals': ['restaurant', 'food', 'dining', 'meal', 'cafe'],
      'Supplies': ['supplies', 'walmart', 'target', 'store'],
      'Auto Membership': ['aaa', 'membership', 'auto club'],
      'Personal': ['personal', 'grocery', 'shopping']
    };
    return keywordMap[category] || [];
  };

  if (showForm) {
    return (
      <>
        <div className="page-header">
          <h1 className="page-title">Categories</h1>
        </div>
        <CategoryForm
          category={editingCategory}
          categories={categories}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      </>
    );
  }

  if (showRules) {
    return (
      <>
        <div className="page-header">
          <h1 className="page-title">Categorization Rules</h1>
          <button className="btn btn-secondary" onClick={() => setShowRules(false)}>
            Back to Categories
          </button>
        </div>
        <CategoryRules
          rules={rules}
          categories={categories}
          onUpdate={loadData}
        />
      </>
    );
  }

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Expense Categories</h1>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button className="btn btn-secondary" onClick={() => setShowDefaultInfo(!showDefaultInfo)}>
            {showDefaultInfo ? 'Hide' : 'Show'} Auto-Categories
          </button>
          <button className="btn btn-secondary" onClick={createDefaultCategories}>
            Add Default Categories
          </button>
          <button className="btn btn-secondary" onClick={() => setShowRules(true)}>
            Manage Rules
          </button>
          <button className="btn btn-secondary" onClick={handleApplyRules}>
            Apply Rules Now
          </button>
          <button className="btn btn-primary" onClick={handleNew}>
            New Category
          </button>
        </div>
      </div>

      {showDefaultInfo && (
        <div className="card" style={{ backgroundColor: '#e7f3ff', marginBottom: '1rem' }}>
          <h3>🤖 Built-in Auto-Categorization</h3>
          <p>The app automatically recognizes these categories when importing CSVs or uploading receipts:</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.5rem', marginTop: '1rem' }}>
            {getDefaultCategories().map(cat => (
              <div key={cat} style={{ padding: '0.5rem', backgroundColor: 'white', borderRadius: '4px', fontSize: '0.9rem', border: '1px solid #dee2e6' }}>
                <strong>{cat}</strong>
                <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.25rem' }}>
                  {getCategoryKeywords(cat).slice(0, 3).join(', ')}...
                </div>
              </div>
            ))}
          </div>
          <p style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#666' }}>
            💡 Click "Add Default Categories" to create these in your database. The app will automatically assign categories when it detects matching keywords in vendor names or descriptions.
          </p>
        </div>
      )}

      {loading ? (
        <div className="card">
          <div className="loading-spinner"></div>
        </div>
      ) : categories.length === 0 ? (
        <div className="card empty-state" data-icon="category">
          <h3>No categories found</h3>
          <p>Categories should have been created automatically. Try refreshing.</p>
        </div>
      ) : (
        <div className="card">
          <table className="table">
            <thead>
              <tr>
                <th>Color</th>
                <th>Name</th>
                <th>IRS Category</th>
                <th>Type</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr key={category.id}>
                  <td>
                    <div
                      style={{
                        width: '30px',
                        height: '30px',
                        backgroundColor: category.color || '#95a5a6',
                        borderRadius: '4px',
                      }}
                    />
                  </td>
                  <td><strong>{category.name}</strong></td>
                  <td>{category.irs_category || '-'}</td>
                  <td>
                    <span className={`badge ${category.is_system ? 'badge-sent' : 'badge-draft'}`}>
                      {category.is_system ? 'System' : 'Custom'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        className="btn btn-small btn-secondary"
                        onClick={() => handleEdit(category)}
                      >
                        Edit
                      </button>
                      {!category.is_system && (
                        <button
                          className="btn btn-small btn-danger"
                          onClick={() => handleDelete(category.id!)}
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
