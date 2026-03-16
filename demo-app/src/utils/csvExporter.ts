export class CSVExporter {
  /**
   * Convert data to CSV format
   */
  static toCSV(data: any[], columns: string[]): string {
    const header = columns.join(',');
    const rows = data.map((row) => {
      return columns.map((col) => {
        const value = row[col];
        if (value === null || value === undefined) return '';
        
        // Escape quotes and wrap in quotes if contains comma or quote
        const strValue = String(value);
        if (strValue.includes(',') || strValue.includes('"') || strValue.includes('\n')) {
          return `"${strValue.replace(/"/g, '""')}"`;
        }
        return strValue;
      }).join(',');
    });

    return [header, ...rows].join('\n');
  }

  /**
   * Download CSV file
   */
  static download(filename: string, csvContent: string): void {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  }

  /**
   * Export transactions to CSV
   */
  static exportTransactions(transactions: any[]): string {
    const columns = [
      'date',
      'description',
      'vendor',
      'category_name',
      'amount',
      'is_business',
      'notes',
    ];

    return this.toCSV(transactions, columns);
  }

  /**
   * Export mileage entries to CSV
   */
  static exportMileage(entries: any[]): string {
    const columns = [
      'date',
      'vehicle_name',
      'start_location',
      'end_location',
      'miles',
      'is_business',
      'purpose',
      'notes',
    ];

    return this.toCSV(entries, columns);
  }
}












