import React from 'react';
import { CategoryExpense } from '../../shared/types';

interface ExpenseByCategoryReportProps {
  data: CategoryExpense[];
  dateRange: { startDate: string; endDate: string };
}

export default function ExpenseByCategoryReport({ data, dateRange }: ExpenseByCategoryReportProps) {
  const total = data.reduce((sum, cat) => sum + cat.total, 0);

  return (
    <div className="card">
      <h2>Expenses by Category</h2>
      <p>Period: {dateRange.startDate} to {dateRange.endDate}</p>

      <div style={{ marginTop: '2rem', marginBottom: '2rem' }}>
        <div style={{ fontSize: '2rem', fontWeight: 'bold', textAlign: 'center' }}>
          Total Expenses: ${total.toFixed(2)}
        </div>
      </div>

      <div className="table-wrapper">
      <table className="table">
        <thead>
          <tr>
            <th>Category</th>
            <th>Transactions</th>
            <th>Total</th>
            <th>Average</th>
            <th>% of Total</th>
            <th>Visual</th>
          </tr>
        </thead>
        <tbody>
          {data.map((cat) => {
            const percentage = (cat.total / total) * 100;
            const average = cat.total / cat.transaction_count;

            return (
              <tr key={cat.category_id}>
                <td data-label="Category">
                  <span
                    className="badge"
                    style={{ backgroundColor: cat.category_color || '#95a5a6' }}
                  >
                    {cat.category_name}
                  </span>
                </td>
                <td data-label="Transactions">{cat.transaction_count}</td>
                <td data-label="Total"><strong>${cat.total.toFixed(2)}</strong></td>
                <td data-label="Average">${average.toFixed(2)}</td>
                <td data-label="% of Total">{percentage.toFixed(1)}%</td>
                <td data-label="Visual">
                  <div
                    style={{
                      width: `${percentage}%`,
                      minWidth: '20px',
                      height: '20px',
                      backgroundColor: cat.category_color || '#95a5a6',
                      borderRadius: '4px',
                    }}
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      </div>
    </div>
  );
}












