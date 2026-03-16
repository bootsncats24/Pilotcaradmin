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

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '2rem', marginTop: '2rem' }}>
          <div style={{ textAlign: 'center' }}>
            <h3>Total Income</h3>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#27ae60' }}>
              ${data.total_income.toFixed(2)}
            </div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <h3>Total Deductions</h3>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#e74c3c' }}>
              ${(data.total_expenses + (data.mileage_deduction || 0)).toFixed(2)}
            </div>
            <div style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
              Expenses: ${data.total_expenses.toFixed(2)}<br />
              Mileage: ${(data.mileage_deduction || 0).toFixed(2)}
            </div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <h3>Net Profit</h3>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#3498db' }}>
              ${data.net_profit.toFixed(2)}
            </div>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <h3>Schedule C Categories (IRS)</h3>
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
                  <td>{category}</td>
                  <td>${amount.toFixed(2)}</td>
                </tr>
              ))}
            <tr style={{ fontWeight: 'bold', borderTop: '2px solid #000' }}>
              <td>Total Expenses</td>
              <td>${data.total_expenses.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="card">
        <h3>Vehicle & Mileage Deduction</h3>
        <table className="table">
          <tbody>
            <tr>
              <td>Total Business Miles</td>
              <td><strong>{(data.total_business_miles || 0).toFixed(1)}</strong></td>
            </tr>
            <tr>
              <td>IRS Standard Mileage Rate</td>
              <td>${(data.total_business_miles && data.mileage_deduction ? (data.mileage_deduction / data.total_business_miles).toFixed(2) : '0.00')}/mile</td>
            </tr>
            <tr style={{ fontWeight: 'bold' }}>
              <td>Total Mileage Deduction</td>
              <td>${(data.mileage_deduction || 0).toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}












