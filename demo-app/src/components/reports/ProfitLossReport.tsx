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
      <div className="demo-report-card-header">
        <h2>Profit & Loss Statement</h2>
        <div className="demo-button-group">
          <button className="btn btn-secondary btn-small" onClick={handleExportCSV}>
            Export CSV
          </button>
          <button className="btn btn-primary btn-small" onClick={handleExportPDF}>
            Export PDF
          </button>
        </div>
      </div>

      <div className="demo-stats-grid-3">
        <div className="demo-report-stat-cell" style={{ backgroundColor: '#d4edda' }}>
          <h3 style={{ color: '#155724' }}>Income</h3>
          <div className="demo-report-stat-value" style={{ color: '#155724' }}>
            ${data.income.total.toFixed(2)}
          </div>
        </div>

        <div className="demo-report-stat-cell" style={{ backgroundColor: '#fff3cd' }}>
          <h3 style={{ color: '#856404' }}>Expenses</h3>
          <div className="demo-report-stat-value" style={{ color: '#856404' }}>
            ${data.expenses.total.toFixed(2)}
          </div>
        </div>

        <div
          className="demo-report-stat-cell"
          style={{
            backgroundColor: data.net_profit >= 0 ? '#d4edda' : '#f8d7da',
          }}
        >
          <h3 style={{ color: data.net_profit >= 0 ? '#155724' : '#721c24' }}>Net Profit</h3>
          <div
            className="demo-report-stat-value"
            style={{ color: data.net_profit >= 0 ? '#155724' : '#721c24' }}
          >
            ${data.net_profit.toFixed(2)}
          </div>
        </div>
      </div>

      <h3>Expenses by Category</h3>
      <div className="table-wrapper">
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
              <td data-label="Category">
                <span
                  className="badge"
                  style={{ backgroundColor: cat.category_color || '#95a5a6' }}
                >
                  {cat.category_name}
                </span>
              </td>
              <td data-label="Transactions">{cat.transaction_count}</td>
              <td data-label="Total">${cat.total.toFixed(2)}</td>
              <td data-label="% of Expenses">{((cat.total / data.expenses.total) * 100).toFixed(1)}%</td>
            </tr>
          ))}
          <tr style={{ fontWeight: 'bold', borderTop: '2px solid #000' }}>
            <td data-label="Category">Total</td>
            <td data-label="Transactions">{data.expenses.by_category.reduce((sum, c) => sum + c.transaction_count, 0)}</td>
            <td data-label="Total">${data.expenses.total.toFixed(2)}</td>
            <td data-label="% of Expenses">100%</td>
          </tr>
        </tbody>
      </table>
      </div>
    </div>
  );
}












