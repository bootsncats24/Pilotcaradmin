import React from 'react';
import { TaxSummary } from '../../shared/types';

interface TaxSummaryReportProps {
  data: TaxSummary;
}

export default function TaxSummaryReport({ data }: TaxSummaryReportProps) {
  return (
    <div>
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <h2>Tax Summary for {data.year}</h2>

        <div className="demo-stats-grid-3" style={{ marginTop: '2rem' }}>
          <div className="demo-report-stat-cell">
            <h3>Total Income</h3>
            <div className="demo-report-stat-value" style={{ color: '#27ae60' }}>
              ${data.total_income.toFixed(2)}
            </div>
          </div>

          <div className="demo-report-stat-cell">
            <h3>Total Deductions</h3>
            <div className="demo-report-stat-value" style={{ color: '#e74c3c' }}>
              ${(data.total_expenses + (data.mileage_deduction || 0)).toFixed(2)}
            </div>
            <div className="demo-report-stat-note">
              Expenses: ${data.total_expenses.toFixed(2)}<br />
              Mileage: ${(data.mileage_deduction || 0).toFixed(2)}
            </div>
          </div>

          <div className="demo-report-stat-cell">
            <h3>Net Profit</h3>
            <div className="demo-report-stat-value" style={{ color: '#3498db' }}>
              ${data.net_profit.toFixed(2)}
            </div>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <h3>Schedule C Categories (IRS)</h3>
        <div className="table-wrapper">
        <table className="table">
          <thead>
            <tr>
              <th>IRS Category</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(data.expense_by_irs_category)
              .sort(([, a], [, b]) => b - a)
              .map(([category, amount]) => (
                <tr key={category}>
                  <td data-label="IRS Category">{category}</td>
                  <td data-label="Amount">${amount.toFixed(2)}</td>
                </tr>
              ))}
            <tr style={{ fontWeight: 'bold', borderTop: '2px solid #000' }}>
              <td data-label="IRS Category">Total Expenses</td>
              <td data-label="Amount">${data.total_expenses.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
        </div>
      </div>

      <div className="card">
        <h3>Vehicle & Mileage Deduction</h3>
        <div className="table-wrapper">
        <table className="table">
          <tbody>
            <tr>
              <td data-label="Item">Total Business Miles</td>
              <td data-label="Value"><strong>{(data.total_business_miles || 0).toFixed(1)}</strong></td>
            </tr>
            <tr>
              <td data-label="Item">IRS Standard Mileage Rate</td>
              <td data-label="Value">${(data.total_business_miles && data.mileage_deduction ? (data.mileage_deduction / data.total_business_miles).toFixed(2) : '0.00')}/mile</td>
            </tr>
            <tr style={{ fontWeight: 'bold' }}>
              <td data-label="Item">Total Mileage Deduction</td>
              <td data-label="Value">${(data.mileage_deduction || 0).toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
}












