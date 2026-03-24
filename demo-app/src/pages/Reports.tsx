import React, { useState, useEffect } from 'react';
import { Transaction, Invoice, Category, MileageEntry, Settings } from '../shared/types';
import { MockDataService } from '../services/mockDataService';
import { ReportGenerator } from '../utils/reportGenerator';
import ProfitLossReport from '../components/reports/ProfitLossReport';
import ExpenseByCategoryReport from '../components/reports/ExpenseByCategoryReport';
import TaxSummaryReport from '../components/reports/TaxSummaryReport';

type ReportType = 'profit-loss' | 'expense-category' | 'tax-summary';

export default function Reports() {
  const [reportType, setReportType] = useState<ReportType>('profit-loss');
  const [loading, setLoading] = useState(false);
  
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });

  const [reportData, setReportData] = useState<any>(null);

  useEffect(() => {
    generateReport();
  }, [reportType, dateRange]);

  const generateReport = async () => {
    try {
      setLoading(true);
      const generator = new ReportGenerator();

      switch (reportType) {
        case 'profit-loss':
          const plData = await generator.generateProfitLoss(dateRange.startDate, dateRange.endDate);
          setReportData(plData);
          break;
        
        case 'expense-category':
          const expData = await generator.generateExpenseByCategory(dateRange.startDate, dateRange.endDate);
          setReportData(expData);
          break;
        
        case 'tax-summary':
          const taxData = await generator.generateTaxSummary(parseInt(dateRange.startDate.split('-')[0]));
          setReportData(taxData);
          break;
      }
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Error generating report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Reports</h1>
      </div>

      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div className="demo-reports-type-row">
          <div>
            <strong>Report Type:</strong>
          </div>
          <button
            className={`btn ${reportType === 'profit-loss' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setReportType('profit-loss')}
          >
            Profit & Loss
          </button>
          <button
            className={`btn ${reportType === 'expense-category' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setReportType('expense-category')}
          >
            Expenses by Category
          </button>
          <button
            className={`btn ${reportType === 'tax-summary' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setReportType('tax-summary')}
          >
            Tax Summary
          </button>
        </div>

        {reportType !== 'tax-summary' && (
          <div className="demo-reports-date-row">
            <label>
              <strong>From:</strong>
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
              />
            </label>
            <label>
              <strong>To:</strong>
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
              />
            </label>
            <button className="btn btn-secondary btn-small" onClick={generateReport}>
              Refresh
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="card">Generating report...</div>
      ) : reportData ? (
        <>
          {reportType === 'profit-loss' && <ProfitLossReport data={reportData} dateRange={dateRange} />}
          {reportType === 'expense-category' && <ExpenseByCategoryReport data={reportData} dateRange={dateRange} />}
          {reportType === 'tax-summary' && <TaxSummaryReport data={reportData} />}
        </>
      ) : (
        <div className="card">No data available for the selected period</div>
      )}
    </>
  );
}












