import jsPDF from 'jspdf';

export class PDFExporter {
  /**
   * Create a new PDF document
   */
  static createPDF(): jsPDF {
    return new jsPDF();
  }

  /**
   * Add header to PDF
   */
  static addHeader(doc: jsPDF, title: string, subtitle?: string): void {
    doc.setFontSize(20);
    doc.text(title, 20, 20);

    if (subtitle) {
      doc.setFontSize(12);
      doc.setTextColor(100);
      doc.text(subtitle, 20, 28);
      doc.setTextColor(0);
    }
  }

  /**
   * Add a table to PDF
   */
  static addTable(
    doc: jsPDF,
    headers: string[],
    rows: string[][],
    startY: number = 40
  ): number {
    const colWidth = (doc.internal.pageSize.width - 40) / headers.length;
    let y = startY;

    // Header row
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    headers.forEach((header, i) => {
      doc.text(header, 20 + i * colWidth, y);
    });

    // Data rows
    doc.setFont('helvetica', 'normal');
    y += 7;

    for (const row of rows) {
      if (y > doc.internal.pageSize.height - 20) {
        doc.addPage();
        y = 20;
      }

      row.forEach((cell, i) => {
        doc.text(String(cell), 20 + i * colWidth, y);
      });
      y += 6;
    }

    return y;
  }

  /**
   * Save PDF to file
   */
  static savePDF(doc: jsPDF, filename: string): void {
    doc.save(filename);
  }

  /**
   * Export Profit & Loss report
   */
  static exportProfitLoss(data: {
    period: string;
    income: number;
    expenses: { category: string; amount: number }[];
    netProfit: number;
  }): void {
    const doc = this.createPDF();

    this.addHeader(doc, 'Profit & Loss Statement', data.period);

    let y = 40;

    // Income section
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Income', 20, y);
    y += 8;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Total Income from Invoices', 30, y);
    doc.text(`$${data.income.toFixed(2)}`, 150, y, { align: 'right' });
    y += 10;

    // Expenses section
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Expenses', 20, y);
    y += 8;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    let totalExpenses = 0;
    for (const expense of data.expenses) {
      doc.text(expense.category, 30, y);
      doc.text(`$${expense.amount.toFixed(2)}`, 150, y, { align: 'right' });
      totalExpenses += expense.amount;
      y += 6;
    }

    y += 4;
    doc.setFont('helvetica', 'bold');
    doc.text('Total Expenses', 30, y);
    doc.text(`$${totalExpenses.toFixed(2)}`, 150, y, { align: 'right' });

    // Net profit
    y += 10;
    doc.setFontSize(14);
    doc.text('Net Profit', 20, y);
    doc.text(`$${data.netProfit.toFixed(2)}`, 150, y, { align: 'right' });

    this.savePDF(doc, `profit-loss-${data.period}.pdf`);
  }
}












