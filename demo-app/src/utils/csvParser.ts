import Papa from 'papaparse';

export interface CSVRow {
  [key: string]: string;
}

export interface ParsedCSV {
  headers: string[];
  rows: CSVRow[];
  detectedFormat?: BankFormat;
}

export interface BankFormat {
  name: string;
  dateColumn?: string;
  descriptionColumn?: string;
  amountColumn?: string;
  debitColumn?: string;
  creditColumn?: string;
  vendorColumn?: string;
}

// Common bank formats for auto-detection
const BANK_FORMATS: BankFormat[] = [
  {
    name: 'Chase',
    dateColumn: 'Posting Date',
    descriptionColumn: 'Description',
    amountColumn: 'Amount',
  },
  {
    name: 'Bank of America',
    dateColumn: 'Date',
    descriptionColumn: 'Description',
    amountColumn: 'Amount',
  },
  {
    name: 'Wells Fargo',
    dateColumn: 'Date',
    descriptionColumn: 'Description',
    amountColumn: 'Amount',
  },
  {
    name: 'PayPal',
    dateColumn: 'Date',
    descriptionColumn: 'Name',
    amountColumn: 'Net',
    vendorColumn: 'Name',
  },
  {
    name: 'Stripe',
    dateColumn: 'Created (UTC)',
    descriptionColumn: 'Description',
    amountColumn: 'Amount',
  },
  {
    name: 'Square',
    dateColumn: 'Date',
    descriptionColumn: 'Description',
    amountColumn: 'Net Total',
  },
  {
    name: 'American Express',
    dateColumn: 'Date',
    descriptionColumn: 'Description',
    amountColumn: 'Amount',
  },
  {
    name: 'Capital One',
    dateColumn: 'Transaction Date',
    descriptionColumn: 'Description',
    debitColumn: 'Debit',
    creditColumn: 'Credit',
  },
  {
    name: 'Discover',
    dateColumn: 'Trans. Date',
    descriptionColumn: 'Description',
    amountColumn: 'Amount',
  },
];

export class CSVParser {
  /**
   * Parse a CSV file
   */
  static parseCSV(csvContent: string): Promise<ParsedCSV> {
    return new Promise((resolve, reject) => {
      Papa.parse(csvContent, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          if (results.errors.length > 0) {
            console.warn('CSV parsing warnings:', results.errors);
          }

          const headers = results.meta.fields || [];
          const rows = results.data as CSVRow[];

          // Try to detect the bank format
          const detectedFormat = this.detectBankFormat(headers);

          resolve({
            headers,
            rows,
            detectedFormat,
          });
        },
        error: (error: any) => {
          reject(error);
        },
      });
    });
  }

  /**
   * Read a file and parse it as CSV
   */
  static async parseFile(file: File): Promise<ParsedCSV> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = async (e) => {
        try {
          const content = e.target?.result as string;
          const parsed = await this.parseCSV(content);
          resolve(parsed);
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };

      reader.readAsText(file);
    });
  }

  /**
   * Detect bank format based on column headers
   */
  static detectBankFormat(headers: string[]): BankFormat | undefined {
    const headerLower = headers.map((h) => h.toLowerCase().trim());

    for (const format of BANK_FORMATS) {
      let matchCount = 0;
      const requiredMatches = 2; // At least 2 columns must match

      if (format.dateColumn && headerLower.includes(format.dateColumn.toLowerCase())) {
        matchCount++;
      }
      if (format.descriptionColumn && headerLower.includes(format.descriptionColumn.toLowerCase())) {
        matchCount++;
      }
      if (format.amountColumn && headerLower.includes(format.amountColumn.toLowerCase())) {
        matchCount++;
      }
      if (format.debitColumn && headerLower.includes(format.debitColumn.toLowerCase())) {
        matchCount++;
      }
      if (format.creditColumn && headerLower.includes(format.creditColumn.toLowerCase())) {
        matchCount++;
      }

      if (matchCount >= requiredMatches) {
        return format;
      }
    }

    return undefined;
  }

  /**
   * Intelligently auto-detect invoice column mappings
   */
  static autoDetectInvoiceColumns(rows: CSVRow[], headers: string[]): {
    invoiceNumberColumn: string | null;
    customerColumn: string | null;
    customerAddressColumn: string | null;
    customerPhoneColumn: string | null;
    customerEmailColumn: string | null;
    dateColumn: string | null;
    dueDateColumn: string | null;
    paymentDateColumn: string | null;
    statusColumn: string | null;
    descriptionColumn: string | null;
    typeColumn: string | null;
    quantityColumn: string | null;
    rateColumn: string | null;
    amountColumn: string | null;
    milesColumn: string | null;
    fromDestinationColumn: string | null;
    toDestinationColumn: string | null;
    runDateColumn: string | null;
    totalColumn: string | null;
    notesColumn: string | null;
  } {
    if (rows.length === 0) {
      return {
        invoiceNumberColumn: null,
        customerColumn: null,
        customerAddressColumn: null,
        customerPhoneColumn: null,
        customerEmailColumn: null,
        dateColumn: null,
        dueDateColumn: null,
        paymentDateColumn: null,
        statusColumn: null,
        descriptionColumn: null,
        typeColumn: null,
        quantityColumn: null,
        rateColumn: null,
        amountColumn: null,
        milesColumn: null,
        fromDestinationColumn: null,
        toDestinationColumn: null,
        runDateColumn: null,
        totalColumn: null,
        notesColumn: null,
      };
    }

    const sampleRows = rows.slice(0, Math.min(20, rows.length));
    
    const scores = headers.map(header => ({
      header,
      invoiceNumberScore: this.scoreInvoiceNumberColumn(header, sampleRows),
      customerScore: this.scoreCustomerColumn(header, sampleRows),
      customerAddressScore: this.scoreCustomerAddressColumn(header, sampleRows),
      customerPhoneScore: this.scoreCustomerPhoneColumn(header, sampleRows),
      customerEmailScore: this.scoreCustomerEmailColumn(header, sampleRows),
      dateScore: this.scoreDateColumn(header, sampleRows),
      dueDateScore: this.scoreDueDateColumn(header, sampleRows),
      paymentDateScore: this.scorePaymentDateColumn(header, sampleRows),
      statusScore: this.scoreStatusColumn(header, sampleRows),
      descriptionScore: this.scoreDescriptionColumn(header, sampleRows),
      typeScore: this.scoreBillingTypeColumn(header, sampleRows),
      quantityScore: this.scoreQuantityColumn(header, sampleRows),
      rateScore: this.scoreRateColumn(header, sampleRows),
      amountScore: this.scoreAmountColumn(header, sampleRows),
      milesScore: this.scoreMilesColumn(header, sampleRows),
      fromDestinationScore: this.scoreDestinationColumn(header, sampleRows, ['from', 'origin', 'start', 'pickup', 'pick up', 'pick-up', 'load']),
      toDestinationScore: this.scoreDestinationColumn(header, sampleRows, ['to', 'destination', 'end', 'delivery', 'deliver', 'drop off', 'dropoff', 'unload']),
      runDateScore: this.scoreRunDateColumn(header, sampleRows),
      totalScore: this.scoreTotalColumn(header, sampleRows),
      notesScore: this.scoreNotesColumn(header, sampleRows),
    }));

    // CRITICAL: Build exclusion list as we go - once a column is used, it can NEVER be used for another purpose
    // This prevents the same column from being mapped to multiple fields
    const usedColumns: string[] = [];
    
    // Find columns in priority order, excluding all previously used columns
    const invoiceNumberColumn = this.findBestMatch(scores, 'invoiceNumberScore', usedColumns);
    if (invoiceNumberColumn) usedColumns.push(invoiceNumberColumn);
    
    const customerColumn = this.findBestMatch(scores, 'customerScore', usedColumns);
    if (customerColumn) usedColumns.push(customerColumn);
    
    const customerAddressColumn = this.findBestMatch(scores, 'customerAddressScore', usedColumns);
    if (customerAddressColumn) usedColumns.push(customerAddressColumn);
    
    const customerPhoneColumn = this.findBestMatch(scores, 'customerPhoneScore', usedColumns);
    if (customerPhoneColumn) usedColumns.push(customerPhoneColumn);
    
    const customerEmailColumn = this.findBestMatch(scores, 'customerEmailScore', usedColumns);
    if (customerEmailColumn) usedColumns.push(customerEmailColumn);
    
    const dateColumn = this.findBestMatch(scores, 'dateScore', usedColumns);
    if (dateColumn) usedColumns.push(dateColumn);
    
    const dueDateColumn = this.findBestMatch(scores, 'dueDateScore', usedColumns);
    if (dueDateColumn) usedColumns.push(dueDateColumn);
    
    const paymentDateColumn = this.findBestMatch(scores, 'paymentDateScore', usedColumns);
    if (paymentDateColumn) usedColumns.push(paymentDateColumn);
    
    const statusColumn = this.findBestMatch(scores, 'statusScore', usedColumns);
    if (statusColumn) usedColumns.push(statusColumn);
    
    // Find destination columns BEFORE description to prevent them from being used as description
    const fromDestinationColumn = this.findBestMatch(scores, 'fromDestinationScore', usedColumns);
    if (fromDestinationColumn) usedColumns.push(fromDestinationColumn);
    
    const toDestinationColumn = this.findBestMatch(scores, 'toDestinationScore', usedColumns);
    if (toDestinationColumn) usedColumns.push(toDestinationColumn);
    
    // Exclude destination columns from description matching
    const excludedFromDescription = [fromDestinationColumn, toDestinationColumn].filter((x): x is string => x !== null);
    
    const descriptionColumn = this.findBestMatch(scores, 'descriptionScore', [...usedColumns, ...excludedFromDescription]);
    if (descriptionColumn) usedColumns.push(descriptionColumn);
    
    const typeColumn = this.findBestMatch(scores, 'typeScore', usedColumns);
    if (typeColumn) usedColumns.push(typeColumn);
    
    const quantityColumn = this.findBestMatch(scores, 'quantityScore', usedColumns);
    if (quantityColumn) usedColumns.push(quantityColumn);
    
    const rateColumn = this.findBestMatch(scores, 'rateScore', usedColumns);
    if (rateColumn) usedColumns.push(rateColumn);
    
    const amountColumn = this.findBestMatch(scores, 'amountScore', usedColumns);
    if (amountColumn) usedColumns.push(amountColumn);
    
    const milesColumn = this.findBestMatch(scores, 'milesScore', usedColumns);
    if (milesColumn) usedColumns.push(milesColumn);
    
    const runDateColumn = this.findBestMatch(scores, 'runDateScore', usedColumns);
    if (runDateColumn) usedColumns.push(runDateColumn);
    
    const totalColumn = this.findBestMatch(scores, 'totalScore', usedColumns);
    if (totalColumn) usedColumns.push(totalColumn);
    
    const notesColumn = this.findBestMatch(scores, 'notesScore', usedColumns);
    if (notesColumn) usedColumns.push(notesColumn);
    
    return {
      invoiceNumberColumn,
      customerColumn,
      customerAddressColumn,
      customerPhoneColumn,
      customerEmailColumn,
      dateColumn,
      dueDateColumn,
      paymentDateColumn,
      statusColumn,
      descriptionColumn,
      typeColumn,
      quantityColumn,
      rateColumn,
      amountColumn,
      milesColumn,
      fromDestinationColumn,
      toDestinationColumn,
      runDateColumn,
      totalColumn,
      notesColumn,
    };
  }

  /**
   * Intelligently auto-detect all column mappings
   */
  static autoDetectColumns(rows: CSVRow[], headers: string[]): {
    dateColumn: string | null;
    descriptionColumn: string | null;
    amountColumn: string | null;
    debitColumn: string | null;
    creditColumn: string | null;
    vendorColumn: string | null;
  } {
    if (rows.length === 0) {
      return {
        dateColumn: null,
        descriptionColumn: null,
        amountColumn: null,
        debitColumn: null,
        creditColumn: null,
        vendorColumn: null,
      };
    }

    // Sample more rows for better accuracy
    const sampleRows = rows.slice(0, Math.min(20, rows.length));
    
    // Score each column for different types
    const scores = headers.map(header => ({
      header,
      dateScore: this.scoreDateColumn(header, sampleRows),
      amountScore: this.scoreAmountColumn(header, sampleRows),
      descriptionScore: this.scoreDescriptionColumn(header, sampleRows),
      debitScore: this.scoreDebitColumn(header, sampleRows),
      creditScore: this.scoreCreditColumn(header, sampleRows),
      vendorScore: this.scoreVendorColumn(header, sampleRows),
    }));

    // Find best match for each column type
    const dateColumn = this.findBestMatch(scores, 'dateScore');
    const amountColumn = this.findBestMatch(scores, 'amountScore');
    const descriptionColumn = this.findBestMatch(scores, 'descriptionScore');
    const debitColumn = this.findBestMatch(scores, 'debitScore');
    const creditColumn = this.findBestMatch(scores, 'creditScore');
    const vendorColumn = this.findBestMatch(scores, 'vendorScore');

    return {
      dateColumn,
      descriptionColumn,
      amountColumn,
      debitColumn,
      creditColumn,
      vendorColumn,
    };
  }

  private static findBestMatch(scores: any[], scoreKey: string, excludeHeaders: string[] = []): string | null {
    const sorted = scores
      .filter(s => {
        // Exclude headers that are already used for other purposes
        if (excludeHeaders.includes(s.header)) {
          return false;
        }
        return s[scoreKey] > 0.3; // Minimum confidence threshold
      })
      .sort((a, b) => b[scoreKey] - a[scoreKey]);
    
    return sorted.length > 0 ? sorted[0].header : null;
  }

  private static scoreDateColumn(header: string, rows: CSVRow[]): number {
    const headerLower = header.toLowerCase().trim();
    let score = 0;

    // EXACT MATCH = HIGH PRIORITY (0.9) for simple "date" keyword
    if (headerLower === 'date') {
      score = 0.9;
    } else {
      // Expanded keyword list
      const exactKeywords = ['invoice date', 'invoice_date', 'service date', 'service_date', 'created date', 'created_date', 'transaction date', 'transaction_date', 'run date', 'run_date'];
      const partialKeywords = ['date', 'time', 'posted', 'transaction', 'trans', 'dt'];
      
      // Check exact multi-word matches first
      if (exactKeywords.some(kw => headerLower === kw)) {
        score += 0.8;
      } else if (partialKeywords.some(kw => headerLower.includes(kw))) {
        score += 0.6; // High score for partial matches
      }
    }

    // Check content - validate that values look like dates
    let dateCount = 0;
    for (const row of rows) {
      const value = row[header]?.trim();
      if (value && this.looksLikeDate(value)) {
        dateCount++;
      }
    }

    score += (dateCount / rows.length) * 0.4; // Reduced from 0.7 since keyword matching is stronger
    return Math.min(score, 1);
  }

  private static scoreAmountColumn(header: string, rows: CSVRow[]): number {
    const headerLower = header.toLowerCase().trim();
    let score = 0;

    // Penalize if it's clearly debit/credit
    if (headerLower.includes('debit') || headerLower.includes('credit')) {
      return 0;
    }

    // EXACT MATCH = HIGH PRIORITY (0.9) for simple standalone keywords
    if (headerLower === 'amount' || headerLower === 'total' || headerLower === 'price') {
      score = 0.9;
    } else {
      // Expanded keyword list
      const exactKeywords = ['invoice total', 'invoice_total', 'grand total', 'grand_total', 'total amount', 'total_amount', 'amount due', 'amount_due', 'total price', 'total_price', 'total cost', 'total_cost'];
      const partialKeywords = ['amount', 'total', 'price', 'cost', 'charge', 'sum', 'balance', 'net', 'gross'];
      
      // Check exact multi-word matches first
      if (exactKeywords.some(kw => headerLower === kw)) {
        score += 0.8;
      } else if (partialKeywords.some(kw => headerLower.includes(kw))) {
        score += 0.6; // High score for partial matches
      }
    }

    // Check content - validate that values look like amounts
    let amountCount = 0;
    for (const row of rows) {
      const value = row[header]?.trim();
      if (value && this.looksLikeAmount(value)) {
        amountCount++;
      }
    }

    score += (amountCount / rows.length) * 0.4; // Reduced from 0.7 since keyword matching is stronger
    return Math.min(score, 1);
  }

  private static scoreDescriptionColumn(header: string, rows: CSVRow[]): number {
    const headerLower = header.toLowerCase().trim();
    let score = 0;

    // EXACT MATCH = HIGH PRIORITY (0.9) for simple standalone keywords
    if (headerLower === 'description' || headerLower === 'item' || headerLower === 'service') {
      score = 0.9;
    } else {
      // Expanded keyword list
      const exactKeywords = ['item description', 'item_description', 'service description', 'service_description', 'description of service', 'description_of_service'];
      const partialKeywords = ['description', 'item', 'service', 'notes', 'memo', 'details', 'note', 'transaction', 'payee'];
      
      // Check exact multi-word matches first
      if (exactKeywords.some(kw => headerLower === kw)) {
        score += 0.8;
      } else if (partialKeywords.some(kw => headerLower.includes(kw))) {
        score += 0.6; // High score for partial matches
      }
    }

    // Check content - should have varied text
    const uniqueValues = new Set(rows.map(r => r[header]?.trim()).filter(Boolean));
    if (uniqueValues.size > rows.length * 0.5) {
      score += 0.2; // Reduced from 0.3
    }

    // Should have reasonable length text
    let textCount = 0;
    for (const row of rows) {
      const value = row[header]?.trim();
      if (value && value.length > 5 && value.length < 200) {
        textCount++;
      }
    }

    score += (textCount / rows.length) * 0.2;
    return Math.min(score, 1);
  }

  private static scoreDebitColumn(header: string, rows: CSVRow[]): number {
    const headerLower = header.toLowerCase();
    
    if (!headerLower.includes('debit') && !headerLower.includes('withdrawal') && !headerLower.includes('out')) {
      return 0;
    }

    let score = 0.5; // Good header match

    // Check content
    let amountCount = 0;
    let emptyCount = 0;
    for (const row of rows) {
      const value = row[header]?.trim();
      if (!value || value === '' || value === '0' || value === '0.00') {
        emptyCount++;
      } else if (this.looksLikeAmount(value)) {
        amountCount++;
      }
    }

    // Debit columns typically have some empty rows (when it's a credit)
    if (emptyCount > rows.length * 0.2) {
      score += 0.3;
    }

    score += (amountCount / rows.length) * 0.2;
    return Math.min(score, 1);
  }

  private static scoreCreditColumn(header: string, rows: CSVRow[]): number {
    const headerLower = header.toLowerCase();
    
    if (!headerLower.includes('credit') && !headerLower.includes('deposit') && !headerLower.includes('in')) {
      return 0;
    }

    let score = 0.5; // Good header match

    // Check content
    let amountCount = 0;
    let emptyCount = 0;
    for (const row of rows) {
      const value = row[header]?.trim();
      if (!value || value === '' || value === '0' || value === '0.00') {
        emptyCount++;
      } else if (this.looksLikeAmount(value)) {
        amountCount++;
      }
    }

    // Credit columns typically have some empty rows (when it's a debit)
    if (emptyCount > rows.length * 0.2) {
      score += 0.3;
    }

    score += (amountCount / rows.length) * 0.2;
    return Math.min(score, 1);
  }

  private static scoreVendorColumn(header: string, rows: CSVRow[]): number {
    const headerLower = header.toLowerCase();
    let score = 0;

    // Check header name
    const vendorKeywords = ['name', 'vendor', 'merchant', 'payee', 'from', 'to', 'counterparty'];
    if (vendorKeywords.some(kw => headerLower.includes(kw))) {
      score += 0.4;
    }

    // Should not be description or memo
    if (headerLower.includes('description') || headerLower.includes('memo') || headerLower.includes('detail')) {
      score -= 0.3;
    }

    // Check content - should have varied but not too long text
    const uniqueValues = new Set(rows.map(r => r[header]?.trim()).filter(Boolean));
    if (uniqueValues.size > rows.length * 0.3) {
      score += 0.3;
    }

    // Should be shorter than descriptions
    let shortTextCount = 0;
    for (const row of rows) {
      const value = row[header]?.trim();
      if (value && value.length > 2 && value.length < 50) {
        shortTextCount++;
      }
    }

    score += (shortTextCount / rows.length) * 0.3;
    return Math.min(score, 1);
  }

  /**
   * Guess column types based on content (deprecated - use autoDetectColumns)
   */
  static guessColumnTypes(rows: CSVRow[], headers: string[]): {
    dateColumns: string[];
    amountColumns: string[];
    textColumns: string[];
  } {
    const dateColumns: string[] = [];
    const amountColumns: string[] = [];
    const textColumns: string[] = [];

    // Sample first 10 rows for analysis
    const sampleRows = rows.slice(0, Math.min(10, rows.length));

    for (const header of headers) {
      let dateCount = 0;
      let amountCount = 0;

      for (const row of sampleRows) {
        const value = row[header]?.trim();
        if (!value) continue;

        // Check if it looks like a date
        if (this.looksLikeDate(value)) {
          dateCount++;
        }

        // Check if it looks like an amount
        if (this.looksLikeAmount(value)) {
          amountCount++;
        }
      }

      const sampleSize = sampleRows.length;
      if (dateCount / sampleSize > 0.7) {
        dateColumns.push(header);
      } else if (amountCount / sampleSize > 0.7) {
        amountColumns.push(header);
      } else {
        textColumns.push(header);
      }
    }

    return { dateColumns, amountColumns, textColumns };
  }

  /**
   * Check if a string looks like a date
   */
  private static looksLikeDate(value: string): boolean {
    // Common date patterns
    const datePatterns = [
      /^\d{1,2}[/-]\d{1,2}[/-]\d{2,4}$/, // MM/DD/YYYY or M/D/YY
      /^\d{4}[/-]\d{1,2}[/-]\d{1,2}$/, // YYYY-MM-DD
      /^\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\s+\d{1,2}:\d{2}/, // With time
      /^[A-Za-z]{3}\s+\d{1,2},?\s+\d{4}$/, // Jan 15, 2024
    ];

    return datePatterns.some((pattern) => pattern.test(value));
  }

  /**
   * Check if a string looks like a monetary amount
   */
  private static looksLikeAmount(value: string): boolean {
    // Remove common currency symbols and whitespace
    const cleaned = value.replace(/[$€£¥,\s]/g, '');

    // Check if it's a valid number (including negative)
    return /^-?\d+\.?\d*$/.test(cleaned);
  }

  /**
   * Parse a date string to YYYY-MM-DD format
   */
  static parseDate(dateStr: string): string | null {
    if (!dateStr) return null;

    try {
      // Try various date formats
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) {
        return null;
      }

      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');

      return `${year}-${month}-${day}`;
    } catch (error) {
      return null;
    }
  }

  /**
   * Parse an amount string to a number
   */
  static parseAmount(amountStr: string): number {
    if (!amountStr) return 0;

    // Remove currency symbols, commas, and whitespace
    const cleaned = amountStr.replace(/[$€£¥,\s()]/g, '');

    // Check if it was in parentheses (negative)
    const isNegative = amountStr.includes('(') && amountStr.includes(')');

    const amount = parseFloat(cleaned);
    return isNaN(amount) ? 0 : isNegative ? -Math.abs(amount) : amount;
  }

  /**
   * Extract vendor name from description
   */
  static extractVendor(description: string): string {
    if (!description) return '';

    // Remove common transaction codes and patterns
    let vendor = description
      .replace(/^(DEBIT CARD PURCHASE|PURCHASE|PAYMENT|CHECK|WITHDRAWAL|DEPOSIT)\s+/i, '')
      .replace(/\s+\d{4}\s*$/, '') // Remove trailing card numbers
      .replace(/\s+[A-Z]{2}\s*$/, '') // Remove state codes
      .trim();

    // Take first significant part (before numbers or special chars)
    const parts = vendor.split(/[\d#]/);
    if (parts.length > 0) {
      vendor = parts[0].trim();
    }

    return vendor.substring(0, 100); // Limit length
  }

  // Invoice-specific scoring methods
  private static scoreInvoiceNumberColumn(header: string, rows: CSVRow[]): number {
    const headerLower = header.toLowerCase().trim();
    let score = 0;

    // EXACT MATCH = MAXIMUM SCORE (1.0) for simple standalone keywords
    if (headerLower === 'invoice' || headerLower === 'inv' || headerLower === 'invoice#' || headerLower === 'inv#') {
      score = 1.0;
    } else {
      // Expanded keyword list with variations
      const exactKeywords = ['invoice number', 'invoice_number', 'invoice-number', 'invoice num', 'invoice no', 'invoice no.', 'invoice_id', 'invoice id'];
      const partialKeywords = ['invoice', 'inv', 'number', 'num', 'id', 'invoice#', 'inv#'];
      
      // Check exact multi-word matches first
      if (exactKeywords.some(kw => headerLower === kw)) {
        score += 0.9;
      } else if (partialKeywords.some(kw => headerLower.includes(kw))) {
        score += 0.8; // High score for partial matches
      }
    }

    // Check if values look like invoice numbers (alphanumeric, often with dashes)
    let invoiceNumberCount = 0;
    for (const row of rows) {
      const value = row[header]?.trim();
      if (value && /^[A-Z0-9\-_]+$/i.test(value) && value.length > 3) {
        invoiceNumberCount++;
      }
    }
    score += (invoiceNumberCount / rows.length) * 0.3; // Reduced from 0.5 since keyword matching is stronger
    return Math.min(score, 1);
  }

  private static scoreCustomerColumn(header: string, rows: CSVRow[]): number {
    const headerLower = header.toLowerCase().trim();
    let score = 0;

    // EXACT MATCH = HIGH PRIORITY (0.9) for simple standalone keywords
    if (headerLower === 'customer' || headerLower === 'client' || headerLower === 'company' || headerLower === 'name') {
      score = 0.9;
    } else {
      // Expanded keyword list
      const exactKeywords = ['customer name', 'customer_name', 'client name', 'client_name', 'company name', 'company_name', 'bill to', 'bill_to', 'billed to', 'billed_to'];
      const partialKeywords = ['customer', 'client', 'company', 'name', 'bill to', 'billed to'];
      
      // Check exact multi-word matches first
      if (exactKeywords.some(kw => headerLower === kw)) {
        score += 0.8;
      } else if (partialKeywords.some(kw => headerLower.includes(kw))) {
        score += 0.6; // High score for partial matches
      }
    }

    // Should have varied text, not too long
    const uniqueValues = new Set(rows.map(r => r[header]?.trim()).filter(Boolean));
    if (uniqueValues.size > rows.length * 0.3) {
      score += 0.2; // Reduced from 0.3
    }

    let textCount = 0;
    for (const row of rows) {
      const value = row[header]?.trim();
      if (value && value.length > 2 && value.length < 100) {
        textCount++;
      }
    }
    score += (textCount / rows.length) * 0.2; // Reduced from 0.3
    return Math.min(score, 1);
  }

  private static scoreCustomerAddressColumn(header: string, rows: CSVRow[]): number {
    const headerLower = header.toLowerCase();
    let score = 0;

    const keywords = ['address', 'addr', 'street', 'city', 'location', 'billing address', 'bill to address', 'customer address', 'client address'];
    if (keywords.some(kw => headerLower.includes(kw))) {
      score += 0.6;
    }

    // Addresses usually have varied values and contain numbers/streets
    const uniqueValues = new Set(rows.map(r => r[header]?.trim()).filter(Boolean));
    if (uniqueValues.size > rows.length * 0.2) {
      score += 0.2;
    }

    let addressLikeCount = 0;
    for (const row of rows) {
      const value = row[header]?.trim();
      if (value && value.length > 5 && value.length < 200) {
        // Addresses often contain numbers and street names
        if (/\d/.test(value) && /[A-Za-z]/.test(value)) {
          addressLikeCount++;
        }
      }
    }
    score += (addressLikeCount / rows.length) * 0.2;
    return Math.min(score, 1);
  }

  private static scoreCustomerPhoneColumn(header: string, rows: CSVRow[]): number {
    const headerLower = header.toLowerCase();
    let score = 0;

    const keywords = ['phone', 'tel', 'telephone', 'mobile', 'cell', 'contact', 'customer phone', 'client phone'];
    if (keywords.some(kw => headerLower.includes(kw))) {
      score += 0.6;
    }

    // Phone numbers should look like phone numbers
    let phoneLikeCount = 0;
    for (const row of rows) {
      const value = row[header]?.trim();
      if (value) {
        // Check for phone number patterns: (123) 456-7890, 123-456-7890, 123.456.7890, etc.
        const phonePattern = /[\d\-\(\)\.\s]{7,}/;
        if (phonePattern.test(value) && /\d{7,}/.test(value.replace(/[\D]/g, ''))) {
          phoneLikeCount++;
        }
      }
    }
    score += (phoneLikeCount / rows.length) * 0.4;
    return Math.min(score, 1);
  }

  private static scoreCustomerEmailColumn(header: string, rows: CSVRow[]): number {
    const headerLower = header.toLowerCase();
    let score = 0;

    const keywords = ['email', 'e-mail', 'mail', 'e mail', 'customer email', 'client email', 'contact email'];
    if (keywords.some(kw => headerLower.includes(kw))) {
      score += 0.6;
    }

    // Emails should look like email addresses
    let emailLikeCount = 0;
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    for (const row of rows) {
      const value = row[header]?.trim();
      if (value && emailPattern.test(value)) {
        emailLikeCount++;
      }
    }
    score += (emailLikeCount / rows.length) * 0.4;
    return Math.min(score, 1);
  }

  private static scoreDueDateColumn(header: string, rows: CSVRow[]): number {
    const headerLower = header.toLowerCase();
    let score = 0;

    const keywords = ['due', 'due date', 'payment due', 'deadline'];
    if (keywords.some(kw => headerLower.includes(kw))) {
      score += 0.4;
    }

    let dateCount = 0;
    for (const row of rows) {
      const value = row[header]?.trim();
      if (value && this.looksLikeDate(value)) {
        dateCount++;
      }
    }
    score += (dateCount / rows.length) * 0.6;
    return Math.min(score, 1);
  }

  private static scorePaymentDateColumn(header: string, rows: CSVRow[]): number {
    const headerLower = header.toLowerCase();
    let score = 0;

    // Check for payment date keywords (exact matches get higher score)
    const exactKeywords = ['payment date', 'payment_date', 'paid date', 'paid_date', 'date paid', 'date_paid', 'paid on', 'paid_on'];
    const partialKeywords = ['payment', 'paid'];
    
    if (exactKeywords.some(kw => headerLower === kw || headerLower.includes(kw))) {
      score += 0.5; // Higher score for exact matches
    } else if (partialKeywords.some(kw => headerLower.includes(kw))) {
      score += 0.3; // Lower score for partial matches
    }

    // Validate that values in the column look like dates
    let dateCount = 0;
    for (const row of rows) {
      const value = row[header]?.trim();
      if (value && this.looksLikeDate(value)) {
        dateCount++;
      }
    }
    score += (dateCount / rows.length) * 0.5;
    return Math.min(score, 1);
  }

  private static scoreStatusColumn(header: string, rows: CSVRow[]): number {
    const headerLower = header.toLowerCase();
    let score = 0;

    const keywords = ['status', 'state', 'stage'];
    if (keywords.some(kw => headerLower.includes(kw))) {
      score += 0.5;
    }

    // Check if values match common invoice statuses
    const statusValues = ['draft', 'sent', 'paid', 'overdue', 'cancelled', 'pending', 'complete'];
    let statusCount = 0;
    for (const row of rows) {
      const value = row[header]?.trim()?.toLowerCase();
      if (value && statusValues.some(s => value.includes(s))) {
        statusCount++;
      }
    }
    score += (statusCount / rows.length) * 0.5;
    return Math.min(score, 1);
  }

  private static scoreBillingTypeColumn(header: string, rows: CSVRow[]): number {
    const headerLower = header.toLowerCase().trim();
    let score = 0;

    // EXACT MATCH = HIGH PRIORITY (0.9) for simple standalone keywords
    if (headerLower === 'type' || headerLower === 'billing') {
      score = 0.9;
    } else {
      // Expanded keyword list
      const exactKeywords = ['billing type', 'billing_type', 'rate type', 'rate_type', 'charge type', 'charge_type', 'service type', 'service_type'];
      const partialKeywords = ['type', 'billing', 'billing type', 'rate type', 'charge type'];
      
      // Check exact multi-word matches first
      if (exactKeywords.some(kw => headerLower === kw)) {
        score += 0.8;
      } else if (partialKeywords.some(kw => headerLower.includes(kw))) {
        score += 0.6; // High score for partial matches
      }
    }

    const typeValues = ['mile', 'miles', 'mini run', 'mini_run', 'day rate', 'day_rate', 'hourly', 'chase', 'pole', 'chase_pole'];
    let typeCount = 0;
    for (const row of rows) {
      const value = row[header]?.trim()?.toLowerCase();
      if (value && typeValues.some(t => value.includes(t))) {
        typeCount++;
      }
    }
    score += (typeCount / rows.length) * 0.3; // Reduced from 0.6 since keyword matching is stronger
    return Math.min(score, 1);
  }

  private static scoreQuantityColumn(header: string, rows: CSVRow[]): number {
    const headerLower = header.toLowerCase().trim();
    let score = 0;

    // EXACT MATCH = HIGH PRIORITY (0.9) for simple standalone keywords
    if (headerLower === 'quantity' || headerLower === 'qty' || headerLower === 'qty.') {
      score = 0.9;
    } else {
      // Expanded keyword list
      const exactKeywords = ['item quantity', 'item_quantity', 'service quantity', 'service_quantity', 'quantity of', 'quantity_of', 'qty count', 'qty_count'];
      const partialKeywords = ['quantity', 'qty', 'qty.', 'amount', 'count', 'units'];
      
      // Check exact multi-word matches first
      if (exactKeywords.some(kw => headerLower === kw)) {
        score += 0.8;
      } else if (partialKeywords.some(kw => headerLower.includes(kw))) {
        score += 0.6; // High score for partial matches
      }
    }

    // Should be numeric, typically small numbers
    let numericCount = 0;
    for (const row of rows) {
      const value = row[header]?.trim();
      if (value && /^\d+(\.\d+)?$/.test(value.replace(/[,\s]/g, ''))) {
        const num = parseFloat(value);
        if (num > 0 && num < 1000) {
          numericCount++;
        }
      }
    }
    score += (numericCount / rows.length) * 0.3; // Reduced from 0.6 since keyword matching is stronger
    return Math.min(score, 1);
  }

  private static scoreRateColumn(header: string, rows: CSVRow[]): number {
    const headerLower = header.toLowerCase().trim();
    let score = 0;

    // EXACT MATCH = MAXIMUM SCORE (1.0) for specific rate types, HIGH PRIORITY (0.9) for simple keywords
    if (headerLower.includes('rate per mile') || headerLower.includes('price per mile') || 
        headerLower === 'rate per mile' || headerLower === 'price per mile' ||
        headerLower === 'rate_per_mile' || headerLower === 'price_per_mile') {
      score = 1.0; // Maximum for specific rate types
    } else if (headerLower === 'rate' || headerLower === 'price') {
      score = 0.9; // High priority for simple keywords
    } else {
      // Expanded keyword list
      const exactKeywords = ['unit price', 'unit_price', 'per unit', 'per_unit', 'per hour', 'per_hour', 'rate/mile', 'price/mile'];
      const partialKeywords = ['rate', 'price', 'unit price', 'per unit', 'per mile', 'per hour'];
      
      // Check exact multi-word matches first
      if (exactKeywords.some(kw => headerLower === kw || headerLower.includes(kw))) {
        score += 0.8;
      } else if (partialKeywords.some(kw => headerLower.includes(kw))) {
        score += 0.6; // High score for partial matches
      }
    }

    // Should be numeric amounts
    let amountCount = 0;
    for (const row of rows) {
      const value = row[header]?.trim();
      if (value && this.looksLikeAmount(value)) {
        amountCount++;
      }
    }
    score += (amountCount / rows.length) * 0.3; // Reduced from 0.6 since keyword matching is stronger
    return Math.min(score, 1);
  }

  private static scoreMilesColumn(header: string, rows: CSVRow[]): number {
    const headerLower = header.toLowerCase().trim();
    let score = 0;

    // EXACT MATCH = HIGH PRIORITY (0.9) for simple standalone keywords
    if (headerLower === 'miles' || headerLower === 'mileage' || headerLower === 'distance') {
      score = 0.9;
    } else {
      // Expanded keyword list
      const exactKeywords = ['total miles', 'total_miles', 'miles driven', 'miles_driven', 'distance miles', 'distance_miles', 'mileage total', 'mileage_total'];
      const partialKeywords = ['mile', 'miles', 'distance', 'mi', 'mileage'];
      
      // Check exact multi-word matches first
      if (exactKeywords.some(kw => headerLower === kw)) {
        score += 0.8;
      } else if (partialKeywords.some(kw => headerLower.includes(kw))) {
        score += 0.6; // High score for partial matches
      }
    }

    // Should be numeric, typically larger numbers
    let numericCount = 0;
    for (const row of rows) {
      const value = row[header]?.trim();
      if (value && /^\d+(\.\d+)?$/.test(value.replace(/[,\s]/g, ''))) {
        numericCount++;
      }
    }
    score += (numericCount / rows.length) * 0.3; // Reduced from 0.5 since keyword matching is stronger
    return Math.min(score, 1);
  }

  private static scoreDestinationColumn(header: string, rows: CSVRow[], keywords: string[]): number {
    const headerLower = header.toLowerCase().trim();
    let score = 0;

    // CRITICAL: Explicitly exclude customer/company-related columns - they should NEVER be destinations
    const customerKeywords = ['customer', 'client', 'company', 'bill to', 'billed to'];
    if (customerKeywords.some(kw => headerLower.includes(kw))) {
      return 0; // Zero score - this is NOT a destination column
    }

    // EXACT MATCH = MAXIMUM SCORE (1.0) for simple standalone keywords "from" and "to"
    if (headerLower === 'from' || headerLower === 'to') {
      score = 1.0; // Maximum score for simple keywords
    } else if (headerLower === 'pickup' || headerLower === 'delivery') {
      score = 0.9; // High score for pickup/delivery
    } else {
      // Enhanced keywords for pickup/delivery detection - be very aggressive
      const enhancedKeywords = [
        ...keywords,
        'pickup', 'pick up', 'pick-up', 'pick_up', 'pickup location', 'pickup_location', 'pickup-location',
        'delivery', 'deliver to', 'deliver-to', 'deliver_to', 'delivery location', 'delivery_location', 'delivery-location',
        'origin', 'orig', 'origination', 'origin location', 'origin_location', 'origin-location',
        'destination', 'dest', 'dest.', 'destination location', 'destination_location', 'destination-location',
        'drop off', 'dropoff', 'drop-off', 'drop_off', 'drop off location', 'dropoff location',
        'from location', 'from_location', 'from-location', 'from loc', 'from_loc',
        'to location', 'to_location', 'to-location', 'to loc', 'to_loc',
        'start location', 'start_location', 'start-location', 'start loc', 'start_loc',
        'end location', 'end_location', 'end-location', 'end loc', 'end_loc',
        'load location', 'load_location', 'load-location', 'load loc', 'load_loc',
        'unload location', 'unload_location', 'unload-location', 'unload loc', 'unload_loc',
        'pickup point', 'pickup_point', 'pickup-point',
        'delivery point', 'delivery_point', 'delivery-point',
        'pickup address', 'pickup_address', 'pickup-address',
        'delivery address', 'delivery_address', 'delivery-address',
        'pickup city', 'pickup_city', 'pickup-city',
        'delivery city', 'delivery_city', 'delivery-city',
      ];

      // Check for exact keyword matches first (highest priority)
      for (const kw of enhancedKeywords) {
        if (headerLower === kw || headerLower === kw + 's' || headerLower === kw + 'es') {
          score += 0.8; // Very high score for exact matches
          break;
        }
        if (headerLower.includes(kw)) {
          score += 0.6; // High score for partial matches
          break;
        }
      }

      // Also check if header starts with or ends with keywords
      for (const kw of enhancedKeywords) {
        if (headerLower.startsWith(kw) || headerLower.endsWith(kw)) {
          score += 0.4;
          break;
        }
      }
    }

    // Should be text, varied values (location names should vary)
    const uniqueValues = new Set(rows.map(r => r[header]?.trim()).filter(Boolean));
    if (uniqueValues.size > rows.length * 0.15) {
      score += 0.2; // Reduced from 0.3 since keyword matching is stronger
    }

    // Check if values look like location names (not numbers, not dates, have letters)
    let locationLikeCount = 0;
    for (const row of rows) {
      const value = row[header]?.trim();
      if (value && value.length > 2 && value.length < 100) {
        // Should have letters, not be pure numbers or dates
        if (/[A-Za-z]/.test(value) && !/^\d+$/.test(value) && !/^\d{1,2}[\/\-]\d{1,2}/.test(value)) {
          locationLikeCount++;
        }
      }
    }
    score += (locationLikeCount / rows.length) * 0.2; // Reduced from 0.3 since keyword matching is stronger
    
    return Math.min(score, 1);
  }

  private static scoreRunDateColumn(header: string, rows: CSVRow[]): number {
    const headerLower = header.toLowerCase().trim();
    let score = 0;

    // EXACT MATCH = HIGH PRIORITY for specific date types
    const exactKeywords = ['run date', 'run_date', 'service date', 'service_date', 'trip date', 'trip_date', 'delivery date', 'delivery_date'];
    const partialKeywords = ['run date', 'service date', 'trip date', 'delivery date'];
    
    if (exactKeywords.some(kw => headerLower === kw)) {
      score += 0.9; // High score for exact matches
    } else if (partialKeywords.some(kw => headerLower.includes(kw))) {
      score += 0.7; // High score for partial matches
    }

    let dateCount = 0;
    for (const row of rows) {
      const value = row[header]?.trim();
      if (value && this.looksLikeDate(value)) {
        dateCount++;
      }
    }
    score += (dateCount / rows.length) * 0.3; // Reduced from 0.6 since keyword matching is stronger
    return Math.min(score, 1);
  }

  private static scoreTotalColumn(header: string, rows: CSVRow[]): number {
    const headerLower = header.toLowerCase().trim();
    let score = 0;

    // EXACT MATCH = HIGH PRIORITY (0.9) for simple "total" keyword
    if (headerLower === 'total') {
      score = 0.9;
    } else {
      // Expanded keyword list
      const exactKeywords = ['grand total', 'grand_total', 'invoice total', 'invoice_total', 'amount due', 'amount_due'];
      const partialKeywords = ['total', 'grand total', 'sum', 'invoice total', 'amount due'];
      
      // Check exact multi-word matches first
      if (exactKeywords.some(kw => headerLower === kw)) {
        score += 0.8;
      } else if (partialKeywords.some(kw => headerLower.includes(kw))) {
        score += 0.6; // High score for partial matches
      }
    }

    let amountCount = 0;
    for (const row of rows) {
      const value = row[header]?.trim();
      if (value && this.looksLikeAmount(value)) {
        amountCount++;
      }
    }
    score += (amountCount / rows.length) * 0.3; // Reduced from 0.6 since keyword matching is stronger
    return Math.min(score, 1);
  }

  private static scoreNotesColumn(header: string, rows: CSVRow[]): number {
    const headerLower = header.toLowerCase();
    let score = 0;

    const keywords = ['note', 'notes', 'comment', 'comments', 'remarks', 'memo'];
    if (keywords.some(kw => headerLower.includes(kw))) {
      score += 0.5;
    }

    // Notes are often longer text or empty
    let textCount = 0;
    for (const row of rows) {
      const value = row[header]?.trim();
      if (!value || (value.length > 10 && value.length < 500)) {
        textCount++;
      }
    }
    score += (textCount / rows.length) * 0.5;
    return Math.min(score, 1);
  }

  /**
   * Intelligently auto-detect customer column mappings
   */
  static autoDetectCustomerColumns(rows: CSVRow[], headers: string[]): {
    nameColumn: string | null;
    phoneColumn: string | null;
    emailColumn: string | null;
    addressColumn: string | null;
    billingAddressColumn: string | null;
    taxIdColumn: string | null;
    notesColumn: string | null;
  } {
    if (rows.length === 0) {
      return {
        nameColumn: null,
        phoneColumn: null,
        emailColumn: null,
        addressColumn: null,
        billingAddressColumn: null,
        taxIdColumn: null,
        notesColumn: null,
      };
    }

    const sampleRows = rows.slice(0, Math.min(20, rows.length));
    
    const scores = headers.map(header => ({
      header,
      nameScore: this.scoreCustomerNameColumn(header, sampleRows),
      phoneScore: this.scoreCustomerPhoneColumn(header, sampleRows),
      emailScore: this.scoreCustomerEmailColumn(header, sampleRows),
      addressScore: this.scoreCustomerAddressColumn(header, sampleRows),
      billingAddressScore: this.scoreBillingAddressColumn(header, sampleRows),
      taxIdScore: this.scoreTaxIdColumn(header, sampleRows),
      notesScore: this.scoreNotesColumn(header, sampleRows),
    }));

    return {
      nameColumn: this.findBestMatch(scores, 'nameScore'),
      phoneColumn: this.findBestMatch(scores, 'phoneScore'),
      emailColumn: this.findBestMatch(scores, 'emailScore'),
      addressColumn: this.findBestMatch(scores, 'addressScore'),
      billingAddressColumn: this.findBestMatch(scores, 'billingAddressScore'),
      taxIdColumn: this.findBestMatch(scores, 'taxIdScore'),
      notesColumn: this.findBestMatch(scores, 'notesScore'),
    };
  }

  private static scoreCustomerNameColumn(header: string, rows: CSVRow[]): number {
    const headerLower = header.toLowerCase();
    let score = 0;

    const keywords = ['name', 'customer', 'company', 'business name', 'client', 'customer name', 'company name'];
    if (keywords.some(kw => headerLower === kw || headerLower.includes(kw))) {
      score += 0.5;
    }

    // Should have varied text, not too long
    const uniqueValues = new Set(rows.map(r => r[header]?.trim()).filter(Boolean));
    if (uniqueValues.size > rows.length * 0.3) {
      score += 0.3;
    }

    let textCount = 0;
    for (const row of rows) {
      const value = row[header]?.trim();
      if (value && value.length > 2 && value.length < 100) {
        textCount++;
      }
    }
    score += (textCount / rows.length) * 0.2;
    return Math.min(score, 1);
  }

  private static scoreBillingAddressColumn(header: string, rows: CSVRow[]): number {
    const headerLower = header.toLowerCase();
    let score = 0;

    const keywords = ['billing address', 'billing', 'bill to', 'bill to address', 'billing addr'];
    if (keywords.some(kw => headerLower.includes(kw))) {
      score += 0.6;
    }

    // Addresses usually have varied values and contain numbers/streets
    const uniqueValues = new Set(rows.map(r => r[header]?.trim()).filter(Boolean));
    if (uniqueValues.size > rows.length * 0.2) {
      score += 0.2;
    }

    let addressLikeCount = 0;
    for (const row of rows) {
      const value = row[header]?.trim();
      if (value && value.length > 5 && value.length < 200) {
        if (/\d/.test(value) && /[A-Za-z]/.test(value)) {
          addressLikeCount++;
        }
      }
    }
    score += (addressLikeCount / rows.length) * 0.2;
    return Math.min(score, 1);
  }

  private static scoreTaxIdColumn(header: string, rows: CSVRow[]): number {
    const headerLower = header.toLowerCase();
    let score = 0;

    const keywords = ['tax id', 'tax_id', 'taxid', 'ein', 'ssn', 'tax identification', 'employer id'];
    if (keywords.some(kw => headerLower.includes(kw))) {
      score += 0.6;
    }

    // Tax IDs are usually alphanumeric, 9-11 characters
    let taxIdLikeCount = 0;
    for (const row of rows) {
      const value = row[header]?.trim();
      if (value) {
        const cleaned = value.replace(/[-\s]/g, '');
        if (/^[A-Z0-9]{9,11}$/i.test(cleaned)) {
          taxIdLikeCount++;
        }
      }
    }
    score += (taxIdLikeCount / rows.length) * 0.4;
    return Math.min(score, 1);
  }

  /**
   * Intelligently auto-detect destination column mappings
   */
  static autoDetectDestinationColumns(rows: CSVRow[], headers: string[]): {
    nameColumn: string | null;
    addressColumn: string | null;
    notesColumn: string | null;
  } {
    if (rows.length === 0) {
      return {
        nameColumn: null,
        addressColumn: null,
        notesColumn: null,
      };
    }

    const sampleRows = rows.slice(0, Math.min(20, rows.length));
    
    const scores = headers.map(header => ({
      header,
      nameScore: this.scoreDestinationNameColumn(header, sampleRows),
      addressScore: this.scoreCustomerAddressColumn(header, sampleRows),
      notesScore: this.scoreNotesColumn(header, sampleRows),
    }));

    return {
      nameColumn: this.findBestMatch(scores, 'nameScore'),
      addressColumn: this.findBestMatch(scores, 'addressScore'),
      notesColumn: this.findBestMatch(scores, 'notesScore'),
    };
  }

  private static scoreDestinationNameColumn(header: string, rows: CSVRow[]): number {
    const headerLower = header.toLowerCase();
    let score = 0;

    const keywords = ['name', 'destination', 'location', 'place', 'site'];
    if (keywords.some(kw => headerLower === kw || headerLower.includes(kw))) {
      score += 0.5;
    }

    // Should have varied text, not too long
    const uniqueValues = new Set(rows.map(r => r[header]?.trim()).filter(Boolean));
    if (uniqueValues.size > rows.length * 0.3) {
      score += 0.3;
    }

    let textCount = 0;
    for (const row of rows) {
      const value = row[header]?.trim();
      if (value && value.length > 2 && value.length < 100) {
        textCount++;
      }
    }
    score += (textCount / rows.length) * 0.2;
    return Math.min(score, 1);
  }

  /**
   * Intelligently auto-detect mileage column mappings
   */
  static autoDetectMileageColumns(rows: CSVRow[], headers: string[]): {
    vehicleColumn: string | null;
    dateColumn: string | null;
    milesColumn: string | null;
    startOdometerColumn: string | null;
    endOdometerColumn: string | null;
    businessColumn: string | null;
    purposeColumn: string | null;
    startLocationColumn: string | null;
    endLocationColumn: string | null;
    notesColumn: string | null;
  } {
    if (rows.length === 0) {
      return {
        vehicleColumn: null,
        dateColumn: null,
        milesColumn: null,
        startOdometerColumn: null,
        endOdometerColumn: null,
        businessColumn: null,
        purposeColumn: null,
        startLocationColumn: null,
        endLocationColumn: null,
        notesColumn: null,
      };
    }

    const sampleRows = rows.slice(0, Math.min(20, rows.length));
    
    const scores = headers.map(header => ({
      header,
      vehicleScore: this.scoreVehicleColumn(header, sampleRows),
      dateScore: this.scoreDateColumn(header, sampleRows),
      milesScore: this.scoreMilesColumn(header, sampleRows),
      startOdometerScore: this.scoreOdometerColumn(header, sampleRows, ['start', 'begin', 'initial', 'from']),
      endOdometerScore: this.scoreOdometerColumn(header, sampleRows, ['end', 'final', 'to', 'finish']),
      businessScore: this.scoreBusinessColumn(header, sampleRows),
      purposeScore: this.scorePurposeColumn(header, sampleRows),
      startLocationScore: this.scoreLocationColumn(header, sampleRows, ['start', 'from', 'origin', 'begin']),
      endLocationScore: this.scoreLocationColumn(header, sampleRows, ['end', 'to', 'destination', 'finish']),
      notesScore: this.scoreNotesColumn(header, sampleRows),
    }));

    // Build exclusion list to prevent duplicate mappings
    const usedColumns: string[] = [];
    
    const vehicleColumn = this.findBestMatch(scores, 'vehicleScore', usedColumns);
    if (vehicleColumn) usedColumns.push(vehicleColumn);
    
    const dateColumn = this.findBestMatch(scores, 'dateScore', usedColumns);
    if (dateColumn) usedColumns.push(dateColumn);
    
    const milesColumn = this.findBestMatch(scores, 'milesScore', usedColumns);
    if (milesColumn) usedColumns.push(milesColumn);
    
    const startOdometerColumn = this.findBestMatch(scores, 'startOdometerScore', usedColumns);
    if (startOdometerColumn) usedColumns.push(startOdometerColumn);
    
    const endOdometerColumn = this.findBestMatch(scores, 'endOdometerScore', usedColumns);
    if (endOdometerColumn) usedColumns.push(endOdometerColumn);
    
    const businessColumn = this.findBestMatch(scores, 'businessScore', usedColumns);
    if (businessColumn) usedColumns.push(businessColumn);
    
    const purposeColumn = this.findBestMatch(scores, 'purposeScore', usedColumns);
    if (purposeColumn) usedColumns.push(purposeColumn);
    
    const startLocationColumn = this.findBestMatch(scores, 'startLocationScore', usedColumns);
    if (startLocationColumn) usedColumns.push(startLocationColumn);
    
    const endLocationColumn = this.findBestMatch(scores, 'endLocationScore', usedColumns);
    if (endLocationColumn) usedColumns.push(endLocationColumn);
    
    const notesColumn = this.findBestMatch(scores, 'notesScore', usedColumns);
    if (notesColumn) usedColumns.push(notesColumn);

    return {
      vehicleColumn,
      dateColumn,
      milesColumn,
      startOdometerColumn,
      endOdometerColumn,
      businessColumn,
      purposeColumn,
      startLocationColumn,
      endLocationColumn,
      notesColumn,
    };
  }

  private static scoreVehicleColumn(header: string, rows: CSVRow[]): number {
    const headerLower = header.toLowerCase().trim();
    let score = 0;

    // EXACT MATCH = HIGH PRIORITY (0.9) for simple standalone keywords
    if (headerLower === 'vehicle' || headerLower === 'car' || headerLower === 'truck') {
      score = 0.9;
    } else {
      // Expanded keyword list
      const exactKeywords = ['vehicle name', 'vehicle_name', 'vehicle-name', 'car name', 'car_name', 'truck name', 'truck_name'];
      const partialKeywords = ['vehicle', 'car', 'truck', 'auto', 'automobile'];
      
      // Check exact multi-word matches first
      if (exactKeywords.some(kw => headerLower === kw)) {
        score += 0.8;
      } else if (partialKeywords.some(kw => headerLower.includes(kw))) {
        score += 0.6; // High score for partial matches
      }
    }

    // Should have varied text, not too long
    const uniqueValues = new Set(rows.map(r => r[header]?.trim()).filter(Boolean));
    if (uniqueValues.size > rows.length * 0.2) {
      score += 0.2;
    }

    let textCount = 0;
    for (const row of rows) {
      const value = row[header]?.trim();
      if (value && value.length > 1 && value.length < 50) {
        textCount++;
      }
    }
    score += (textCount / rows.length) * 0.2;
    return Math.min(score, 1);
  }

  private static scoreOdometerColumn(header: string, rows: CSVRow[], keywords: string[]): number {
    const headerLower = header.toLowerCase().trim();
    let score = 0;

    // EXACT MATCH = HIGH PRIORITY for odometer-related keywords
    const exactKeywords = ['odometer', 'odo', 'odometer reading', 'odometer_reading', 'odometer-reading'];
    const keywordMatches = keywords.map(kw => [
      `${kw} odometer`, `${kw}_odometer`, `${kw}-odometer`,
      `odometer ${kw}`, `odometer_${kw}`, `odometer-${kw}`
    ]).flat();
    
    if (exactKeywords.some(kw => headerLower === kw)) {
      score = 0.9;
    } else if (keywordMatches.some(kw => headerLower === kw)) {
      score = 0.8;
    } else if (exactKeywords.some(kw => headerLower.includes(kw)) || 
               keywords.some(kw => headerLower.includes(kw)) && headerLower.includes('odo')) {
      score += 0.6;
    }

    // Should be numeric, typically large numbers (odometer readings)
    let numericCount = 0;
    for (const row of rows) {
      const value = row[header]?.trim();
      if (value && /^\d+(\.\d+)?$/.test(value.replace(/[,\s]/g, ''))) {
        const num = parseFloat(value);
        if (num >= 0 && num < 1000000) { // Reasonable odometer range
          numericCount++;
        }
      }
    }
    score += (numericCount / rows.length) * 0.4;
    return Math.min(score, 1);
  }

  private static scoreBusinessColumn(header: string, rows: CSVRow[]): number {
    const headerLower = header.toLowerCase().trim();
    let score = 0;

    // EXACT MATCH = HIGH PRIORITY for business/personal indicators
    const exactKeywords = ['business', 'personal', 'type', 'is business', 'is_business', 'is-business', 'business type', 'business_type'];
    const partialKeywords = ['business', 'personal', 'type'];
    
    if (exactKeywords.some(kw => headerLower === kw)) {
      score = 0.9;
    } else if (partialKeywords.some(kw => headerLower.includes(kw))) {
      score += 0.6;
    }

    // Check if values look like boolean indicators
    const businessValues = ['business', 'b', 'yes', 'y', 'true', '1', '1.0'];
    const personalValues = ['personal', 'p', 'no', 'n', 'false', '0', '0.0'];
    let booleanLikeCount = 0;
    for (const row of rows) {
      const value = row[header]?.trim().toLowerCase();
      if (value && (businessValues.includes(value) || personalValues.includes(value))) {
        booleanLikeCount++;
      }
    }
    score += (booleanLikeCount / rows.length) * 0.4;
    return Math.min(score, 1);
  }

  private static scorePurposeColumn(header: string, rows: CSVRow[]): number {
    const headerLower = header.toLowerCase().trim();
    let score = 0;

    // EXACT MATCH = HIGH PRIORITY for purpose/description
    if (headerLower === 'purpose' || headerLower === 'reason' || headerLower === 'description') {
      score = 0.9;
    } else {
      const exactKeywords = ['trip purpose', 'trip_purpose', 'trip-purpose', 'purpose of trip', 'purpose_of_trip'];
      const partialKeywords = ['purpose', 'reason', 'description', 'why', 'note'];
      
      if (exactKeywords.some(kw => headerLower === kw)) {
        score += 0.8;
      } else if (partialKeywords.some(kw => headerLower.includes(kw))) {
        score += 0.6;
      }
    }

    // Should have varied text
    const uniqueValues = new Set(rows.map(r => r[header]?.trim()).filter(Boolean));
    if (uniqueValues.size > rows.length * 0.3) {
      score += 0.2;
    }

    let textCount = 0;
    for (const row of rows) {
      const value = row[header]?.trim();
      if (value && value.length > 2 && value.length < 200) {
        textCount++;
      }
    }
    score += (textCount / rows.length) * 0.2;
    return Math.min(score, 1);
  }

  private static scoreLocationColumn(header: string, rows: CSVRow[], keywords: string[]): number {
    const headerLower = header.toLowerCase().trim();
    let score = 0;

    // Check for location-related keywords combined with start/end indicators
    const locationKeywords = ['location', 'loc', 'address', 'city', 'place'];
    const keywordCombinations = keywords.flatMap(kw => 
      locationKeywords.map(loc => [
        `${kw} ${loc}`, `${kw}_${loc}`, `${kw}-${loc}`,
        `${loc} ${kw}`, `${loc}_${kw}`, `${loc}-${kw}`
      ])
    ).flat();

    if (keywordCombinations.some(kw => headerLower === kw)) {
      score = 0.9;
    } else if (keywords.some(kw => headerLower.includes(kw)) && 
               locationKeywords.some(loc => headerLower.includes(loc))) {
      score += 0.7;
    } else if (keywords.some(kw => headerLower.startsWith(kw)) || 
               keywords.some(kw => headerLower.endsWith(kw))) {
      score += 0.5;
    }

    // Should be text, varied values (location names should vary)
    const uniqueValues = new Set(rows.map(r => r[header]?.trim()).filter(Boolean));
    if (uniqueValues.size > rows.length * 0.15) {
      score += 0.2;
    }

    // Check if values look like location names (not numbers, not dates, have letters)
    let locationLikeCount = 0;
    for (const row of rows) {
      const value = row[header]?.trim();
      if (value && value.length > 2 && value.length < 100) {
        if (/[A-Za-z]/.test(value) && !/^\d+$/.test(value) && !/^\d{1,2}[\/\-]\d{1,2}/.test(value)) {
          locationLikeCount++;
        }
      }
    }
    score += (locationLikeCount / rows.length) * 0.2;
    return Math.min(score, 1);
  }

  /**
   * Intelligently auto-detect calendar/booked run column mappings
   */
  static autoDetectCalendarColumns(rows: CSVRow[], headers: string[]): {
    dateColumn: string | null;
    endDateColumn: string | null;
    customerColumn: string | null;
    destinationColumn: string | null;
    fromLocationColumn: string | null;
    toLocationColumn: string | null;
    descriptionColumn: string | null;
    milesColumn: string | null;
    rateColumn: string | null;
    statusColumn: string | null;
    notesColumn: string | null;
  } {
    if (rows.length === 0) {
      return {
        dateColumn: null,
        endDateColumn: null,
        customerColumn: null,
        destinationColumn: null,
        fromLocationColumn: null,
        toLocationColumn: null,
        descriptionColumn: null,
        milesColumn: null,
        rateColumn: null,
        statusColumn: null,
        notesColumn: null,
      };
    }

    const sampleRows = rows.slice(0, Math.min(20, rows.length));
    
    const scores = headers.map(header => ({
      header,
      dateScore: this.scoreDateColumn(header, sampleRows),
      endDateScore: this.scoreEndDateColumn(header, sampleRows),
      customerScore: this.scoreCustomerColumn(header, sampleRows),
      destinationScore: this.scoreDestinationNameColumn(header, sampleRows),
      fromLocationScore: this.scoreLocationColumn(header, sampleRows, ['from', 'start', 'origin', 'pickup', 'pick up']),
      toLocationScore: this.scoreLocationColumn(header, sampleRows, ['to', 'end', 'destination', 'delivery', 'drop off']),
      descriptionScore: this.scoreDescriptionColumn(header, sampleRows),
      milesScore: this.scoreMilesColumn(header, sampleRows),
      rateScore: this.scoreRateColumn(header, sampleRows),
      statusScore: this.scoreBookedRunStatusColumn(header, sampleRows),
      notesScore: this.scoreNotesColumn(header, sampleRows),
    }));

    // Build exclusion list to prevent duplicate mappings
    const usedColumns: string[] = [];
    
    const dateColumn = this.findBestMatch(scores, 'dateScore', usedColumns);
    if (dateColumn) usedColumns.push(dateColumn);
    
    const endDateColumn = this.findBestMatch(scores, 'endDateScore', usedColumns);
    if (endDateColumn) usedColumns.push(endDateColumn);
    
    const customerColumn = this.findBestMatch(scores, 'customerScore', usedColumns);
    if (customerColumn) usedColumns.push(customerColumn);
    
    const destinationColumn = this.findBestMatch(scores, 'destinationScore', usedColumns);
    if (destinationColumn) usedColumns.push(destinationColumn);
    
    const fromLocationColumn = this.findBestMatch(scores, 'fromLocationScore', usedColumns);
    if (fromLocationColumn) usedColumns.push(fromLocationColumn);
    
    const toLocationColumn = this.findBestMatch(scores, 'toLocationScore', usedColumns);
    if (toLocationColumn) usedColumns.push(toLocationColumn);
    
    const descriptionColumn = this.findBestMatch(scores, 'descriptionScore', usedColumns);
    if (descriptionColumn) usedColumns.push(descriptionColumn);
    
    const milesColumn = this.findBestMatch(scores, 'milesScore', usedColumns);
    if (milesColumn) usedColumns.push(milesColumn);
    
    const rateColumn = this.findBestMatch(scores, 'rateScore', usedColumns);
    if (rateColumn) usedColumns.push(rateColumn);
    
    const statusColumn = this.findBestMatch(scores, 'statusScore', usedColumns);
    if (statusColumn) usedColumns.push(statusColumn);
    
    const notesColumn = this.findBestMatch(scores, 'notesScore', usedColumns);
    if (notesColumn) usedColumns.push(notesColumn);

    return {
      dateColumn,
      endDateColumn,
      customerColumn,
      destinationColumn,
      fromLocationColumn,
      toLocationColumn,
      descriptionColumn,
      milesColumn,
      rateColumn,
      statusColumn,
      notesColumn,
    };
  }

  private static scoreEndDateColumn(header: string, rows: CSVRow[]): number {
    const headerLower = header.toLowerCase().trim();
    let score = 0;

    // EXACT MATCH = HIGH PRIORITY for end date keywords
    const exactKeywords = ['end date', 'end_date', 'end-date', 'estimated end', 'estimated_end', 'estimated-end', 'end', 'finish date', 'finish_date'];
    const partialKeywords = ['end', 'finish', 'estimated end', 'completion date'];
    
    if (exactKeywords.some(kw => headerLower === kw)) {
      score = 0.9;
    } else if (partialKeywords.some(kw => headerLower.includes(kw)) && headerLower.includes('date')) {
      score += 0.7;
    }

    // Check content - validate that values look like dates
    let dateCount = 0;
    for (const row of rows) {
      const value = row[header]?.trim();
      if (value && this.looksLikeDate(value)) {
        dateCount++;
      }
    }
    score += (dateCount / rows.length) * 0.4;
    return Math.min(score, 1);
  }

  private static scoreBookedRunStatusColumn(header: string, rows: CSVRow[]): number {
    const headerLower = header.toLowerCase().trim();
    let score = 0;

    // EXACT MATCH = HIGH PRIORITY for status keywords
    if (headerLower === 'status' || headerLower === 'state') {
      score = 0.9;
    } else {
      const exactKeywords = ['run status', 'run_status', 'booking status', 'booking_status', 'appointment status'];
      const partialKeywords = ['status', 'state', 'stage'];
      
      if (exactKeywords.some(kw => headerLower === kw)) {
        score += 0.8;
      } else if (partialKeywords.some(kw => headerLower.includes(kw))) {
        score += 0.6;
      }
    }

    // Check if values match common statuses
    const statusValues = ['pending', 'confirmed', 'completed', 'cancelled', 'canceled'];
    let statusCount = 0;
    for (const row of rows) {
      const value = row[header]?.trim()?.toLowerCase();
      if (value && statusValues.some(s => value.includes(s))) {
        statusCount++;
      }
    }
    score += (statusCount / rows.length) * 0.4;
    return Math.min(score, 1);
  }
}

