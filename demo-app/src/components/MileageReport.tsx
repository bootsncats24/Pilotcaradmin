import React from 'react';
import { MileageEntry, Settings } from '../shared/types';
import { CSVExporter } from '../utils/csvExporter';
import { PDFExporter } from '../utils/pdfExporter';

interface MileageReportProps {
  entries: MileageEntry[];
  settings: Settings | null;
}

export default function MileageReport({ entries, settings }: MileageReportProps) {
  const mileageRate = settings?.irs_mileage_rate || 0.67;
  
  const totalMiles = entries.reduce((sum, e) => sum + e.miles, 0);
  const businessMiles = entries.filter((e) => e.is_business).reduce((sum, e) => sum + e.miles, 0);
  const personalMiles = totalMiles - businessMiles;
  const deduction = businessMiles * mileageRate;

  // Group by month
  const byMonth: { [key: string]: { miles: number; count: number } } = {};
  entries.filter((e) => e.is_business).forEach((entry) => {
    const month = entry.date.substring(0, 7); // YYYY-MM
    if (!byMonth[month]) {
      byMonth[month] = { miles: 0, count: 0 };
    }
    byMonth[month].miles += entry.miles;
    byMonth[month].count++;
  });

  const months = Object.keys(byMonth).sort().reverse();

  const handleExportCSV = () => {
    const csv = CSVExporter.exportMileage(entries);
    CSVExporter.download('mileage-report.csv', csv);
  };

  const handleExportPDF = () => {
    const doc = PDFExporter.createPDF();
    PDFExporter.addHeader(doc, 'Mileage Deduction Report', `IRS Rate: $${mileageRate}/mile`);

    let y = 40;
    
    doc.setFontSize(12);
    doc.text(`Total Business Miles: ${businessMiles.toFixed(1)}`, 20, y);
    y += 7;
    doc.text(`Total Personal Miles: ${personalMiles.toFixed(1)}`, 20, y);
    y += 7;
    doc.text(`IRS Mileage Rate: $${mileageRate}`, 20, y);
    y += 7;
    doc.setFont('helvetica', 'bold');
    doc.text(`Total Deduction: $${deduction.toFixed(2)}`, 20, y);
    y += 15;

    doc.setFont('helvetica', 'normal');
    doc.text('Monthly Breakdown:', 20, y);
    y += 10;

    const rows = months.map((month) => [
      month,
      byMonth[month].miles.toFixed(1),
      byMonth[month].count.toString(),
      `$${(byMonth[month].miles * mileageRate).toFixed(2)}`,
    ]);

    PDFExporter.addTable(doc, ['Month', 'Miles', 'Trips', 'Deduction'], rows, y);
    PDFExporter.savePDF(doc, 'mileage-deduction-report.pdf');
  };

  return (
    <div>
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <h2>IRS Mileage Deduction Summary</h2>
        
        <div className="responsive-two-col" style={{ marginTop: '1.5rem' }}>
          <div>
            <h3>Total Miles</h3>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#3498db' }}>
              {totalMiles.toFixed(1)}
            </div>
            <div style={{ marginTop: '1rem' }}>
              <div>Business: {businessMiles.toFixed(1)} miles</div>
              <div>Personal: {personalMiles.toFixed(1)} miles</div>
            </div>
          </div>

          <div>
            <h3>Tax Deduction</h3>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#27ae60' }}>
              ${deduction.toFixed(2)}
            </div>
            <div style={{ marginTop: '1rem' }}>
              <div>IRS Rate: ${mileageRate}/mile</div>
              <div>Business Miles: {businessMiles.toFixed(1)}</div>
            </div>
          </div>
        </div>

        <div className="form-actions" style={{ marginTop: '2rem' }}>
          <button type="button" className="btn btn-secondary" onClick={handleExportCSV}>
            Export to CSV
          </button>
          <button type="button" className="btn btn-primary" onClick={handleExportPDF}>
            Export to PDF
          </button>
        </div>
      </div>

      <div className="card">
        <h3>Monthly Breakdown</h3>
        {months.length === 0 ? (
          <p>No business mileage recorded yet.</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Month</th>
                <th>Business Miles</th>
                <th>Trips</th>
                <th>Deduction</th>
              </tr>
            </thead>
            <tbody>
              {months.map((month) => (
                <tr key={month}>
                  <td><strong>{month}</strong></td>
                  <td>{byMonth[month].miles.toFixed(1)}</td>
                  <td>{byMonth[month].count}</td>
                  <td>${(byMonth[month].miles * mileageRate).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}












