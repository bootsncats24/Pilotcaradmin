import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Transaction, Category } from '../shared/types';
import { MockDataService } from '../services/mockDataService';
import TransactionForm from '../components/TransactionForm';
import TransactionFilters from '../components/TransactionFilters';

export default function Transactions() {
  const navigate = useNavigate();
  const location = useLocation();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | undefined>();
  const [openActionId, setOpenActionId] = useState<number | null>(null);
  const actionDropdownRef = useRef<HTMLDivElement | null>(null);
  const [returnPath, setReturnPath] = useState<string | null>(null);
  
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    categoryId: undefined as number | undefined,
    isBusiness: undefined as boolean | undefined,
    search: '',
    sortBy: 'newest' as 'newest' | 'amount-asc' | 'category',
  });

  useEffect(() => {
    loadData();
  }, [filters]);

  // Close the actions dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        actionDropdownRef.current &&
        !actionDropdownRef.current.contains(event.target as Node)
      ) {
        setOpenActionId(null);
      }
    };

    if (openActionId !== null) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openActionId]);

  // Handle edit from navigation state
  useEffect(() => {
    const editTransactionId = (location.state as any)?.editTransactionId;
    const returnPathFromState = (location.state as any)?.returnPath;
    if (editTransactionId && transactions.length > 0) {
      const transaction = transactions.find(t => t.id === editTransactionId);
      if (transaction) {
        setEditingTransaction(transaction);
        setShowForm(true);
        // Store return path if provided
        if (returnPathFromState) {
          setReturnPath(returnPathFromState);
        }
        // Clear the state
        window.history.replaceState({}, document.title);
      }
    }
  }, [location, transactions]);

  // Listen for database changes from sync
  useEffect(() => {
    const handleDatabaseChanged = (tableName: string) => {
      if (tableName === 'transactions') {
        console.log('[Transactions] Database changed, refreshing data...');
        loadData();
      }
    };

    if (window.electronAPI?.onDatabaseChanged) {
      window.electronAPI.onDatabaseChanged(handleDatabaseChanged);
    }

    return () => {
      if (window.electronAPI?.removeDatabaseChangedListener) {
        window.electronAPI.removeDatabaseChangedListener();
      }
    };
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [transData, catData] = await Promise.all([
        MockDataService.getTransactions(filters),
        MockDataService.getCategories(),
      ]);
      
      // Enrich transactions with category info if not already present
      const enrichedTransactions = (transData || []).map(trans => {
        if (trans.category_id && !(trans as any).category_name) {
          const category = catData.find(c => c.id === trans.category_id);
          if (category) {
            return {
              ...trans,
              category_name: category.name,
              category_color: category.color
            };
          }
        }
        return trans;
      });
      
      // Apply sorting
      let sortedTransactions = [...enrichedTransactions];
      
      switch (filters.sortBy) {
        case 'category':
          sortedTransactions.sort((a, b) => {
            const aCategoryName = (a as any).category_name || 'Uncategorized';
            const bCategoryName = (b as any).category_name || 'Uncategorized';
            if (aCategoryName === 'Uncategorized' && bCategoryName !== 'Uncategorized') return 1;
            if (aCategoryName !== 'Uncategorized' && bCategoryName === 'Uncategorized') return -1;
            return aCategoryName.localeCompare(bCategoryName);
          });
          break;
        case 'amount-asc':
          sortedTransactions.sort((a, b) => a.amount - b.amount);
          break;
        case 'newest':
        default:
          // Sort by date (newest first), then by id (newest first) as fallback
          sortedTransactions.sort((a, b) => {
            const dateCompare = new Date(b.date).getTime() - new Date(a.date).getTime();
            if (dateCompare !== 0) return dateCompare;
            return (b.id || 0) - (a.id || 0);
          });
          break;
      }
      
      setTransactions(sortedTransactions);
      setCategories(catData || []);
    } catch (error) {
      console.error('Error loading transactions:', error);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleNew = () => {
    setEditingTransaction(undefined);
    setShowForm(true);
  };

  const handleView = (id: number) => {
    navigate(`/transactions/${id}`);
  };

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await MockDataService.deleteTransaction(id);
      loadData();
    } catch (error) {
      console.error('Error deleting transaction:', error);
      alert('Error deleting transaction. It may be locked or reconciled.');
    }
  };

  const handleSave = () => {
    setShowForm(false);
    const savedReturnPath = returnPath;
    setEditingTransaction(undefined);
    setReturnPath(null);
    loadData();
    // Navigate back to the detail view if we came from there
    if (savedReturnPath) {
      navigate(savedReturnPath);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    const savedReturnPath = returnPath;
    setEditingTransaction(undefined);
    setReturnPath(null);
    // Navigate back to the detail view if we came from there
    if (savedReturnPath) {
      navigate(savedReturnPath);
    }
  };

  const handleFilterChange = (newFilters: any) => {
    setFilters({ ...filters, ...newFilters });
  };

  const getCategoryColor = (categoryId?: number) => {
    const category = categories.find((c) => c.id === categoryId);
    return category?.color || '#95a5a6';
  };

  const totalAmount = transactions.reduce((sum, t) => sum + t.amount, 0);
  const businessAmount = transactions.filter((t) => t.is_business).reduce((sum, t) => sum + t.amount, 0);

  if (showForm) {
    return (
      <>
        <div className="page-header">
          <h1 className="page-title">Transactions</h1>
        </div>
        <TransactionForm
          transaction={editingTransaction}
          categories={categories}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      </>
    );
  }

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Transactions</h1>
        <button 
          className="btn btn-primary" 
          onClick={handleNew}
          style={{
            padding: '0.625rem 1.25rem',
            borderRadius: '8px',
            fontSize: '0.9375rem',
            fontWeight: '600',
            boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)',
            transition: 'all 0.2s ease',
            border: 'none',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-1px)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(102, 126, 234, 0.3)';
          }}
        >
          New Transaction
        </button>
      </div>

      <TransactionFilters
        filters={filters}
        categories={categories}
        onChange={handleFilterChange}
      />

      <div className="card" style={{ marginBottom: '1rem', padding: '1rem' }}>
        <div className="demo-stat-strip">
          <div>
            <strong>Total:</strong> ${totalAmount.toFixed(2)}
          </div>
          <div>
            <strong>Business:</strong> ${businessAmount.toFixed(2)}
          </div>
          <div>
            <strong>Personal:</strong> ${(totalAmount - businessAmount).toFixed(2)}
          </div>
          <div>
            <strong>Count:</strong> {transactions.length}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="card">
          <div className="loading-spinner"></div>
        </div>
      ) : transactions.length === 0 ? (
        <div className="card empty-state" data-icon="transaction">
          <h3>No transactions found</h3>
          <p>Try adjusting your filters or add your first transaction</p>
        </div>
      ) : (
        <div className="card">
          <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Vendor</th>
                <th>Category</th>
                <th>Amount</th>
                <th>Type</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction) => (
                <tr
                  key={transaction.id}
                  onClick={() => handleView(transaction.id!)}
                  style={{ cursor: 'pointer' }}
                  className={openActionId === transaction.id ? 'action-dropdown-row-open' : ''}
                >
                  <td data-label="Date">{transaction.date}</td>
                  <td data-label="Description">{transaction.description}</td>
                  <td data-label="Vendor">{transaction.vendor || '-'}</td>
                  <td data-label="Category">
                    {transaction.category_id ? (
                      <span
                        className="badge"
                        style={{
                          backgroundColor: (transaction as any).category_color || getCategoryColor(transaction.category_id),
                          color: '#ffffff',
                          padding: '0.5rem 0.875rem',
                          borderRadius: '8px',
                          fontSize: '0.8125rem',
                          fontWeight: '600',
                          display: 'inline-block',
                          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                          textTransform: 'none',
                          letterSpacing: '0.3px'
                        }}
                      >
                        {(transaction as any).category_name || categories.find(c => c.id === transaction.category_id)?.name || 'Unknown'}
                      </span>
                    ) : (
                      <span 
                        className="badge badge-draft"
                        style={{
                          padding: '0.5rem 0.875rem',
                          borderRadius: '8px',
                          fontSize: '0.8125rem',
                          fontWeight: '600',
                          display: 'inline-block',
                          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                          textTransform: 'none'
                        }}
                      >
                        Uncategorized
                      </span>
                    )}
                  </td>
                  <td data-label="Amount">${transaction.amount.toFixed(2)}</td>
                  <td data-label="Type">
                    <span 
                      className={`badge ${transaction.is_business ? 'badge-paid' : 'badge-cancelled'}`}
                      style={{
                        padding: '0.5rem 0.875rem',
                        borderRadius: '8px',
                        fontSize: '0.8125rem',
                        fontWeight: '600',
                        display: 'inline-block',
                        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                        textTransform: 'none'
                      }}
                    >
                      {transaction.is_business ? 'Business' : 'Personal'}
                    </span>
                  </td>
                  <td
                    data-label="Actions"
                    onClick={(e) => e.stopPropagation()}
                    style={{ position: 'relative', overflow: 'visible' }}
                  >
                    <div
                      className={`action-dropdown ${openActionId === transaction.id ? 'open' : ''}`}
                      ref={openActionId === transaction.id ? actionDropdownRef : null}
                      onClick={(e) => e.stopPropagation()}
                      style={{ pointerEvents: 'auto', position: 'relative' }}
                    >
                      <button
                        className="action-dropdown-toggle"
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenActionId(
                            openActionId === transaction.id ? null : transaction.id || null
                          );
                        }}
                      >
                        <span>Actions</span>
                        <span className="action-arrow">▼</span>
                      </button>
                      <div className="action-dropdown-menu" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          className="action-dropdown-item"
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenActionId(null);
                            handleView(transaction.id!);
                          }}
                        >
                          View
                        </button>
                        <button
                          type="button"
                          className="action-dropdown-item"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!transaction.is_locked) {
                              setOpenActionId(null);
                              handleEdit(transaction);
                            }
                          }}
                          disabled={transaction.is_locked}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="action-dropdown-item action-dropdown-item-danger"
                          onClick={async (e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            if (!transaction.is_locked) {
                              // Don't close dropdown immediately - let confirm dialog show first
                              const confirmed = window.confirm('Are you sure you want to delete this transaction?');
                              if (confirmed) {
                                setOpenActionId(null);
                                await handleDelete(transaction.id!);
                              }
                            }
                          }}
                          disabled={transaction.is_locked}
                        >
                          Delete
                        </button>
                      </div>
                      {transaction.is_locked === true && (
                        <span className="badge badge-overdue" title="Locked by reconciliation">
                          🔒
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      )}
    </>
  );
}












