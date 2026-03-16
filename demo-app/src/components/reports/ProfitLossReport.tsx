import React from 'react';
import { ProfitLossReport as ProfitLossData } from '../../shared/types';
import { PDFExporter } from '../../utils/pdfExporter';
import { CSVExporter } from '../../utils/csvExporter';

interface ProfitLossReportProps {
  data: ProfitLossData;
  dateRange: { startDate: string; endDate: string };
}

export default function ProfitLossReport({ data, dateRange }: ProfitLossReportProps) {
  const handleExportPDF = () => {
    PDFExporter.exportProfitLoss({
      period: `${dateRange.startDate} to ${dateRange.endDate}`,
      income: data.income.total,
      expenses: data.expenses.by_category.map((c) => ({ category: c.category_name, amount: c.total })),
      netProfit: data.net_profit,
    });
  };

  const handleExportCSV = () => {
    const rows = [
      ['Profit & Loss Statement'],
      [`Period: ${dateRange.startDate} to ${dateRange.endDate}`],
      [''],
      ['INCOME'],
      ['Total Income', data.income.total.toFixed(2)],
      [''],
      ['EXPENSES'],
      ...data.expenses.by_category.map((cat) => [cat.category_name, cat.total.toFixed(2)]),
      ['Total Expenses', data.expenses.total.toFixed(2)],
      [''],
      ['NET PROFIT', data.net_profit.toFixed(2)],
    ];

    const csv = rows.map((row) => row.join(',')).join('\n');
    CSVExporter.download('profit-loss.csv', csv);
  };

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2>Profit & Loss Statement</h2>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn btn-secondary btn-small" onClick={handleExportCSV}>
            Export CSV
          </button>
          <button className="btn btn-primary btn-small" onClick={handleExportPDF}>
            Export PDF
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
        <div style={{ textAlign: 'center', padding: '1rem', backgroundColor: '#d4edda', borderRadius: '4px' }}>
          <div style={{ fontSize: '0.875rem', color: '#155724', marginBottom: '0.5rem' }}>Income</div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#155724' }}>
            ${data.income.total.toFixed(2)}
          </div>
        </div>

        <div style={{ textAlign: 'center', padding: '1rem', backgroundColor: '#fff3cd', borderRadius: '4px' }}>
          <div style={{ fontSize: '0.875rem', color: '#856404', marginBottom: '0.5rem' }}>Expenses</div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#856404' }}>
            ${data.expenses.total.toFixed(2)}
          </div>
        </div>

        <div
          style={{
            textAlign: 'center',
            padding: '1rem',
            backgroundColor: data.net_profit >= 0 ? '#d4edda' : '#f8d7da',
            borderRadius: '4px',
          }}
        >
          <div
            style={{
              fontSize: '0.875rem',
              color: data.net_profit >= 0 ? '#155724' : '#721c24',
              marginBottom: '0.5rem',
            }}
          >
            Net Profit
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: data.net_profit >= 0 ? '#155724' : '#721c24' }}>
            ${data.net_profit.toFixed(2)}
          </div>
        </div>
      </div>

      <h3>Expenses by Category</h3>
      <table className="table">
        <thead>
          <tr>
            <th>Category</th>
            <th>Transactions</th>
            <th>Total</th>
            <th>% of Expenses</th>
          </tr>
        </thead>
        <tbody>
          {data.expenses.by_category.map((cat) => (
            <tr key={cat.category_id}>
              <td>
                <span
                  className="badge"
                  style={{ backgroundColor: cat.category_color || '#95a5a6' }}
                >
                  {cat.category_name}
                </span>
              </td>
              <td>{cat.transaction_count}</td>
              <td>${cat.total.toFixed(2)}</td>
              <td>{((cat.total / data.expenses.total) * 100).toFixed(1)}%</td>
            </tr>
          ))}
          <tr style={{ fontWeight: 'bold', borderTop: '2px solid #000' }}>
            <td>Total</td>
            <td>{data.expenses.by_category.reduce((sum, c) => sum + c.transaction_count, 0)}</td>
            <td>${data.expenses.total.toFixed(2)}</td>
            <td>100%</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}












