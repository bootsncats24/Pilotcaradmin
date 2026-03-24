import React from 'react';
import { Category } from '../shared/types';

interface TransactionFiltersProps {
  filters: {
    startDate: string;
    endDate: string;
    categoryId?: number;
    isBusiness?: boolean;
    search: string;
    sortBy?: 'newest' | 'amount-asc' | 'category';
  };
  categories: Category[];
  onChange: (filters: any) => void;
}

export default function TransactionFilters({ filters, categories, onChange }: TransactionFiltersProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'categoryId') {
      onChange({ [name]: value ? parseInt(value) : undefined });
    } else if (name === 'isBusiness') {
      onChange({ [name]: value === '' ? undefined : value === 'true' });
    } else {
      onChange({ [name]: value });
    }
  };

  const clearFilters = () => {
    onChange({
      startDate: '',
      endDate: '',
      categoryId: undefined,
      isBusiness: undefined,
      search: '',
      sortBy: 'newest',
    });
  };

  return (
    <div className="card" style={{ marginBottom: '1rem' }}>
      <div className="demo-filter-grid">
        <div className="form-group">
          <label>Search</label>
          <input
            type="text"
            name="search"
            value={filters.search}
            onChange={handleChange}
            placeholder="Search description or vendor..."
          />
        </div>

        <div className="form-group">
          <label>Start Date</label>
          <input
            type="date"
            name="startDate"
            value={filters.startDate}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>End Date</label>
          <input
            type="date"
            name="endDate"
            value={filters.endDate}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Category</label>
          <select
            name="categoryId"
            value={filters.categoryId || ''}
            onChange={handleChange}
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Type</label>
          <select
            name="isBusiness"
            value={filters.isBusiness === undefined ? '' : String(filters.isBusiness)}
            onChange={handleChange}
          >
            <option value="">All</option>
            <option value="true">Business</option>
            <option value="false">Personal</option>
          </select>
        </div>

        <div className="form-group">
          <label>Sort By</label>
          <select
            name="sortBy"
            value={filters.sortBy || 'newest'}
            onChange={handleChange}
          >
            <option value="newest">Newest to Oldest</option>
            <option value="amount-asc">Amount (Least to Most)</option>
            <option value="category">Category</option>
          </select>
        </div>

        <button
          type="button"
          className="btn btn-secondary btn-small"
          onClick={clearFilters}
          style={{ height: 'fit-content' }}
        >
          Clear Filters
        </button>
      </div>
    </div>
  );
}












