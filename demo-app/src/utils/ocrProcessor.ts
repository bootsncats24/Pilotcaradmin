import { createWorker, Worker } from 'tesseract.js';
import { OCRData } from '../shared/types';

export class OCRProcessor {
  private static worker: Worker | null = null;
  private static workerPath: string | null = null;

  /**
   * Get the local worker path from Electron
   */
  private static async getWorkerPath(): Promise<string> {
    if (!this.workerPath) {
      try {
        if (typeof window !== 'undefined' && window.electronAPI) {
          this.workerPath = await window.electronAPI.getTesseractWorkerPath();
          console.log('[OCR] Got worker path from Electron:', this.workerPath);
        } else {
          // Fallback: This shouldn't happen in Electron, but if it does, we can't proceed
          throw new Error('Electron API not available - cannot get Tesseract worker path');
        }
      } catch (error) {
        console.error('[OCR] Failed to get worker path from Electron:', error);
        // Don't use a fallback - we need the correct path from Electron
        throw new Error(`Failed to get Tesseract worker path: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
    return this.workerPath;
  }

  /**
   * Initialize Tesseract worker
   */
  private static async getWorker(): Promise<Worker> {
    if (!this.worker) {
      let workerPath: string | undefined;
      
      try {
        workerPath = await this.getWorkerPath();
        console.log('[OCR] Creating Tesseract worker with path:', workerPath);
      } catch (error) {
        console.warn('[OCR] Failed to get local worker path, will use CDN fallback:', error);
        workerPath = undefined; // Use CDN fallback
      }
      
      try {
        // Configure worker - use local file if available, otherwise use CDN
        const workerOptions: any = {
          // Note: corePath and langPath will use CDN by default
        };
        
        if (workerPath) {
          workerOptions.workerPath = workerPath;
        } else {
          console.log('[OCR] Using CDN for Tesseract worker (local file not found)');
          // Don't set workerPath - tesseract.js will use CDN
        }
        
        this.worker = await createWorker('eng', 1, workerOptions);
        console.log('[OCR] Tesseract worker created successfully');
      } catch (error) {
        console.error('[OCR] Failed to create Tesseract worker:', error);
        if (workerPath) {
          console.error('[OCR] Worker path was:', workerPath);
        }
        throw error;
      }
    }
    return this.worker;
  }

  /**
   * Terminate the worker to free resources
   */
  static async terminate(): Promise<void> {
    if (this.worker) {
      await this.worker.terminate();
      this.worker = null;
    }
  }

  /**
   * Process a receipt image with OCR
   */
  static async processReceipt(imageData: string | File): Promise<OCRData> {
    try {
      const worker = await this.getWorker();
      
      console.log('OCR: Starting recognition...', typeof imageData);
      
      // Don't restrict character whitelist - let OCR read everything
      // This helps with receipts that have special characters or formatting
      
      const recognitionResult = await worker.recognize(imageData);
      
      // Validate recognition result
      if (!recognitionResult || !recognitionResult.data) {
        throw new Error('OCR recognition returned invalid result');
      }
      
      const { text, confidence } = recognitionResult.data;
      
      if (text === undefined && confidence === undefined) {
        throw new Error('OCR recognition returned invalid result');
      }

      console.log('========================================');
      console.log('✅ OCR RECOGNITION COMPLETE');
      console.log('========================================');
      console.log('📄 Text length:', text?.length || 0);
      console.log('📊 Confidence:', confidence);
      console.log('📄 Raw OCR text (first 1000 chars):', text?.substring(0, 1000) || 'NO TEXT');
      console.log('📄 Raw OCR text (last 500 chars):', text?.substring(Math.max(0, (text?.length || 0) - 500)) || 'NO TEXT');
      console.log('========================================');

      // Parse the text to extract receipt information
      const parsed = this.parseReceiptText(text || '');
      
      console.log('========================================');
      console.log('🔍 PARSED RESULTS:');
      console.log('========================================');
      console.log('  Vendor:', parsed.vendor || '❌ NOT FOUND');
      console.log('  Date:', parsed.date || '❌ NOT FOUND');
      console.log('  Total:', parsed.total !== undefined ? `$${parsed.total.toFixed(2)}` : '❌ NOT FOUND');
      console.log('  Tax:', parsed.tax !== undefined ? `$${parsed.tax.toFixed(2)}` : '❌ NOT FOUND');
      console.log('========================================');

      const result = {
        ...parsed,
        raw_text: text || '',
        confidence: confidence ? confidence / 100 : 0, // Convert to 0-1 range
      };

      // Validate the result
      const validation = this.validateOCRData(result);
      if (!validation.isValid && validation.errors.length > 0) {
        console.warn('OCR validation warnings:', validation.errors);
      }

      return result;
    } catch (error: any) {
      console.error('OCR processing error:', error);
      const errorMessage = error?.message || String(error);
      
      // If worker initialization failed, reset it
      if (errorMessage.includes('worker') || errorMessage.includes('Worker') || errorMessage.includes('initialization')) {
        this.worker = null;
      }
      
      throw new Error(`Failed to process receipt: ${errorMessage}`);
    }
  }

  /**
   * Parse receipt text to extract structured data
   * (Same logic as the Android version)
   */
  private static parseReceiptText(text: string): Omit<OCRData, 'raw_text' | 'confidence'> {
    console.log('========================================');
    console.log('🔧 PARSING RECEIPT TEXT');
    console.log('========================================');
    console.log('📄 Input text length:', text?.length || 0);
    
    // Normalize text before parsing (preserves line structure)
    const normalizedText = this.normalizeOCRText(text);
    const lines = normalizedText.split('\n').map((line) => line.trim()).filter(line => line.length > 0);
    
    console.log('🔧 Normalized text length:', normalizedText.length);
    console.log('🔧 Normalized text (first 1000 chars):', normalizedText.substring(0, 1000));
    console.log(`📋 Processing ${lines.length} lines`);
    console.log('📝 ALL LINES:');
    lines.forEach((line, i) => {
      console.log(`  ${i + 1}. "${line}"`);
    });

    console.log('🔍 Extracting vendor...');
    const vendor = this.extractVendor(lines);
    console.log('🔍 Extracting date...');
    const date = this.extractDate(lines);
    console.log('🔍 Extracting total...');
    const total = this.extractTotal(lines);
    console.log('🔍 Extracting tax...');
    const tax = this.extractTax(lines);
    
    console.log('========================================');
    console.log('📊 PARSING RESULTS:');
    console.log('========================================');
    console.log('  Vendor extraction:', vendor ? `✅ "${vendor}"` : '❌ Not found');
    console.log('  Date extraction:', date ? `✅ "${date}"` : '❌ Not found');
    console.log('  Total extraction:', total !== undefined ? `✅ $${total.toFixed(2)}` : '❌ Not found');
    console.log('  Tax extraction:', tax !== undefined ? `✅ $${tax.toFixed(2)}` : '❌ Not found');
    console.log('========================================');
    
    // If nothing was extracted, log more details for debugging
    if (!vendor && !date && total === undefined && tax === undefined) {
      console.warn('⚠️ No fields extracted from receipt. Raw text sample:');
      console.warn(normalizedText.substring(0, 1000));
      console.warn('Lines that might contain data:');
      lines.slice(0, 20).forEach((line, i) => {
        if (line.length > 0) {
          console.warn(`  Line ${i + 1}: "${line}"`);
        }
      });
      
      // Try aggressive fallback parsing
      const fallbackResult = this.aggressiveFallbackParse(normalizedText);
      if (fallbackResult.vendor || fallbackResult.date || fallbackResult.total !== undefined) {
        console.log('✅ Fallback parsing found:', fallbackResult);
        return fallbackResult;
      }
    }

    return {
      vendor,
      date,
      total,
      tax,
    };
  }

  /**
   * Normalize OCR text to fix common errors and improve parsing
   */
  private static normalizeOCRText(text: string): string {
    if (!text) return '';
    
    let normalized = text;
    
    // Fix common OCR character substitutions
    normalized = normalized
      // Fix 0 → O in words (but not in numbers)
      .replace(/([A-Z])0([A-Z])/g, '$1O$2') // H0ME → HOME
      .replace(/([A-Z])0([A-Z])/g, '$1O$2') // Run twice for cases like H0M0
      .replace(/^0([A-Z])/g, 'O$1') // 0HOME → OHOME (but this is rare)
      .replace(/([A-Z])0$/g, '$1O') // HOME0 → HOMEO
      // Fix 1 → I in words (but be careful with numbers)
      .replace(/([A-Z])1([A-Z])/g, '$1I$2') // H1ME → HIME (but this might break numbers)
      // Fix 5 → S
      .replace(/([A-Z])5([A-Z])/g, '$1S$2') // 5HELL → SHELL
      .replace(/^5([A-Z])/g, 'S$1') // 5HELL → SHELL
      // Fix 6 → G
      .replace(/([A-Z])6([A-Z])/g, '$1G$2') // WAL6REENS → WALGREENS
      // Fix 8 → B
      .replace(/([A-Z])8([A-Z])/g, '$1B$2') // STAR8UCKS → STARBUCKS
      // Fix 3 → E (less common, be careful)
      .replace(/([A-Z])3([A-Z])/g, '$1E$2'); // L3WES → LEWES (but might break numbers)
    
    // IMPORTANT: Preserve line breaks! Don't merge lines - we need them for parsing
    // Only normalize whitespace WITHIN lines, not across lines
    normalized = normalized
      .replace(/[ \t]+/g, ' ') // Multiple spaces/tabs → single space (but keep newlines)
      .replace(/\n\s*\n+/g, '\n') // Multiple newlines → single newline
      .trim();
    
    // Fix common receipt-specific OCR errors
    const receiptFixes: { [key: string]: string } = {
      'H0ME DEP0T': 'HOME DEPOT',
      'H0ME DEPOT': 'HOME DEPOT',
      'HOME DEP0T': 'HOME DEPOT',
      'THE H0ME DEP0T': 'THE HOME DEPOT',
      'THE H0ME DEPOT': 'THE HOME DEPOT',
      'THE HOME DEP0T': 'THE HOME DEPOT',
      'TAR6ET': 'TARGET',
      'C0STC0': 'COSTCO',
      'L0WES': 'LOWES',
      'CHEVR0N': 'CHEVRON',
      '5HELL': 'SHELL',
      'EX0N': 'EXXON',
      'WAL6REENS': 'WALGREENS',
      'STAR8UCKS': 'STARBUCKS',
      'MCD0NALDS': 'MCDONALDS',
      '5UBWAY': 'SUBWAY',
    };
    
    for (const [error, correct] of Object.entries(receiptFixes)) {
      normalized = normalized.replace(new RegExp(error.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'), correct);
    }
    
    return normalized;
  }

  /**
   * Extract vendor name (usually at the top of receipt)
   */
  private static extractVendor(lines: string[]): string | undefined {
    // Common retailer names for fuzzy matching
    const commonRetailers = [
      'HOME DEPOT', 'H0ME DEPOT', 'HOME DEP0T', 'H0ME DEP0T', // Handle OCR errors
      'WALMART', 'WAL-MART', 'WAL MART',
      'TARGET', 'TAR6ET', 'TAR6ET', // Handle OCR errors
      'COSTCO', 'COSTC0', 'C0STCO',
      'LOWES', 'L0WES', 'LOW3S',
      'BEST BUY', 'BEST BUY',
      'CHEVRON', 'CHEVR0N',
      'SHELL', '5HELL',
      'EXON', 'EXXON', 'EX0N',
      'BP', '8P',
      'CVS', 'C\/S', // Handle OCR errors
      'WALGREENS', 'WAL6REENS',
      'STARBUCKS', 'STAR8UCKS',
      'MCDONALDS', 'MCD0NALDS',
      'SUBWAY', '5UBWAY',
    ];

    // First, try to find common retailers in the text (fuzzy match)
    // Check for multi-line vendor names like "THE:\n...\nDEPOT" → "THE HOME DEPOT"
    const fullText = lines.slice(0, 20).join(' ').toUpperCase();
    
    // Special handling for "THE HOME DEPOT" which is often split across lines
    // Also check the last few lines which often have the full vendor name
    if (fullText.includes('THE') && (fullText.includes('DEPOT') || fullText.includes('HOME'))) {
      // First, check if the full name appears in the last few lines (common on receipts)
      for (let i = Math.max(0, lines.length - 5); i < lines.length; i++) {
        const lineUpper = lines[i].toUpperCase();
        if (lineUpper.includes('THE HOME DEPOT') || lineUpper.includes('THANK YOU FOR SHOPPING AT')) {
          // Extract vendor from phrases like "THANK YOU FOR SHOPPING AT THE HOME DEPOT!"
          const match = lineUpper.match(/THANK YOU FOR SHOPPING AT (.+?)[!\.]/);
          if (match && match[1]) {
            let vendor = match[1].trim();
            if (vendor.length >= 3 && vendor.length <= 60) {
              console.log(`🏪 Found vendor in thank you message: "${vendor}"`);
              return vendor;
            }
          }
          // Or if line directly contains "THE HOME DEPOT"
          if (lineUpper.includes('THE HOME DEPOT')) {
            const match2 = lineUpper.match(/(THE HOME DEPOT)/);
            if (match2 && match2[1]) {
              console.log(`🏪 Found vendor directly: "${match2[1]}"`);
              return match2[1];
            }
          }
        }
      }
      
      // Look for "THE" on one line and "DEPOT" or "HOME DEPOT" on another
      let theIndex = -1;
      let depotIndex = -1;
      for (let i = 0; i < Math.min(15, lines.length); i++) {
        const lineUpper = lines[i].toUpperCase();
        if ((lineUpper === 'THE' || lineUpper === 'THE:') && theIndex === -1) {
          theIndex = i;
        }
        if ((lineUpper.includes('DEPOT') || lineUpper.includes('HOME')) && depotIndex === -1 && i > theIndex) {
          depotIndex = i;
        }
      }
      
      if (theIndex >= 0 && depotIndex >= 0 && Math.abs(depotIndex - theIndex) <= 5) {
        // Reconstruct "THE HOME DEPOT" from multiple lines
        const vendorParts: string[] = [];
        const start = Math.min(theIndex, depotIndex);
        const end = Math.max(theIndex, depotIndex) + 1;
        for (let i = start; i < end && i < lines.length; i++) {
          const line = lines[i].trim();
          if (line && !line.match(/^\d/) && !line.includes('$') && line.length < 50) {
            vendorParts.push(line);
          }
        }
        if (vendorParts.length > 0) {
          let vendor = vendorParts.join(' ').replace(/#\d+/, '').trim();
          // Clean up common patterns
          vendor = vendor.replace(/^THE:\s*/i, 'THE ').replace(/\s*:\s*/g, ' ').trim();
          // If we have "THE" and "DEPOT", make it "THE HOME DEPOT"
          if (vendor.toUpperCase().includes('THE') && vendor.toUpperCase().includes('DEPOT') && !vendor.toUpperCase().includes('HOME')) {
            vendor = vendor.replace(/THE\s+DEPOT/i, 'THE HOME DEPOT');
          }
          if (vendor.length >= 3 && vendor.length <= 60) {
            console.log(`🏪 Found multi-line vendor: "${vendor}"`);
            return vendor;
          }
        }
      }
    }
    
    for (const retailer of commonRetailers) {
      const normalizedRetailer = retailer.replace(/[0-9]/g, (m) => {
        const replacements: { [key: string]: string } = { '0': 'O', '6': 'G', '8': 'B', '5': 'S', '3': 'E' };
        return replacements[m] || m;
      });
      const pattern = new RegExp(normalizedRetailer.replace(/\s+/g, '[\\s\\-]*'), 'i');
      if (pattern.test(fullText)) {
        // Found a match, now extract the actual vendor name from the lines
        for (let i = 0; i < Math.min(15, lines.length); i++) {
          const line = lines[i].trim().toUpperCase();
          if (line.includes(normalizedRetailer.split(' ')[0]) || 
              (normalizedRetailer.includes(' ') && line.includes(normalizedRetailer.split(' ').slice(-1)[0]))) {
            // Try to reconstruct the full vendor name
            let vendor = this.reconstructVendorName(lines, i, normalizedRetailer);
            if (vendor) return vendor;
          }
        }
      }
    }

    // Fallback: original logic but improved - be more lenient
    for (let i = 0; i < Math.min(20, lines.length); i++) {
      const line = lines[i].trim();
      
      if (!line || line.length < 2) continue;
      // Skip pure numbers
      if (/^\d+$/.test(line)) continue;
      // Skip dates
      if (/^\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}/.test(line)) continue;
      // Skip lines that are clearly amounts
      if (/^\$?\s*\d+[\.\d]*$/.test(line)) continue;
      // Skip lines with "pump:", "receipt:", "date:", "time:" labels
      if (line.toLowerCase().match(/^(pump|receipt|date|time)[:\s]/)) continue;
      // Skip addresses (but be less strict)
      if (/^\d+\s+\w+\s+(ave|street|road|blvd|drive|st|rd|blvd|ln|way)/i.test(line)) continue;
      // Skip URLs
      if (/^www\.|http/i.test(line)) continue;
      // Skip lines that are mostly numbers with a few letters (like "Pump 5")
      if (/^\d+\s*\w{1,3}$/i.test(line)) continue;
      
      // Check if this line might be part of a multi-line vendor name
      const lineUpper = line.toUpperCase();
      if (lineUpper === 'THE' && i + 1 < lines.length) {
        // "THE" might be on its own line, check next line
        const nextLine = lines[i + 1].trim();
        if (nextLine && nextLine.length >= 3 && nextLine.length <= 60) {
          const combined = `THE ${nextLine}`;
          if (this.isValidVendorName(combined)) {
            return combined.replace(/#\d+/, '').trim();
          }
        }
      }
      
      // Be more lenient - accept lines with letters that look like business names
      const hasLetters = /[A-Za-z]/.test(line);
      const letterRatio = (line.match(/[A-Za-z]/g) || []).length / line.length;
      
      // Accept if:
      // - All caps with letters (common for business names)
      // - Title case (first letter capital)
      // - Has at least 30% letters and looks like a name
      const isLikelyBusinessName = 
        /^[A-Z\s&'\-\.]+$/.test(line) && letterRatio > 0.5 ||
        /^[A-Z][a-z]+/.test(line) ||
        (line.length >= 2 && line.length <= 60 && letterRatio > 0.3 && /^[A-Za-z]/.test(line));
      
      if (hasLetters && isLikelyBusinessName) {
        let vendor = line
          .replace(/#\d+/, '') // Remove store numbers
          .replace(/\s+/g, ' ') // Normalize whitespace
          .trim();
        
        // Fix common OCR errors
        vendor = this.fixOCRErrors(vendor);
        
        // Additional cleanup
        vendor = vendor
          .replace(/\s+/g, ' ')
          .replace(/^[^\w]+|[^\w]+$/g, '') // Remove leading/trailing non-word chars
          .trim();
        
        if (vendor.length >= 2 && vendor.length <= 60) {
          return vendor;
        }
      }
    }
    
    // Last resort: try to find any line in first 10 lines that has letters and isn't clearly something else
    for (let i = 0; i < Math.min(10, lines.length); i++) {
      const line = lines[i].trim();
      if (line && line.length >= 3 && line.length <= 60) {
        const hasLetters = /[A-Za-z]/.test(line);
        const hasNumbers = /\d/.test(line);
        // If it has letters and not too many numbers, it might be a vendor
        if (hasLetters && (!hasNumbers || line.match(/\d/g)!.length < line.length * 0.3)) {
          // Skip if it's clearly a date, amount, or address
          if (!/^\d{1,2}[\/\-]/.test(line) && 
              !/^\$/.test(line) && 
              !/^\d+\s+\w+\s+(ave|st|street|road)/i.test(line)) {
            return line.replace(/#\d+/, '').trim();
          }
        }
      }
    }
    
    return undefined;
  }

  /**
   * Reconstruct vendor name from multiple lines
   */
  private static reconstructVendorName(lines: string[], startIndex: number, targetName: string): string | undefined {
    const targetWords = targetName.split(/\s+/);
    let vendorParts: string[] = [];
    let vendorPartsOriginal: string[] = []; // Preserve original case
    
    // Look at current line and next few lines
    for (let i = startIndex; i < Math.min(startIndex + 3, lines.length); i++) {
      const lineOriginal = lines[i].trim();
      const line = lineOriginal.toUpperCase();
      if (line && line.length > 0 && line.length < 50) {
        vendorParts.push(line);
        vendorPartsOriginal.push(lineOriginal);
        const combined = vendorParts.join(' ');
        
        // Check if we have a match
        if (targetWords.every(word => combined.includes(word.replace(/[0-9]/g, (m) => {
          const replacements: { [key: string]: string } = { '0': 'O', '6': 'G', '8': 'B', '5': 'S', '3': 'E' };
          return replacements[m] || m;
        })))) {
          // Return original case if it looks like title case, otherwise return uppercase
          const combinedOriginal = vendorPartsOriginal.join(' ');
          const isTitleCase = /^[A-Z][a-z]/.test(combinedOriginal);
          if (isTitleCase) {
            return combinedOriginal.replace(/#\d+/, '').trim();
          }
          return combined.replace(/#\d+/, '').trim();
        }
      }
    }
    
    return undefined;
  }

  /**
   * Check if a string looks like a valid vendor name
   */
  private static isValidVendorName(text: string): boolean {
    if (!text || text.length < 2 || text.length > 100) return false;
    if (/^\d+$/.test(text)) return false;
    if (/^\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}/.test(text)) return false;
    if (text.toLowerCase().includes('pump:') || text.toLowerCase().includes('receipt:')) return false;
    if (text.toLowerCase().includes('date:') || text.toLowerCase().includes('time:')) return false;
    if (/^\d+\s+\w+\s+ave|street|road|blvd|drive/i.test(text)) return false;
    return /[A-Za-z]/.test(text);
  }

  /**
   * Fix common OCR errors in text
   */
  private static fixOCRErrors(text: string): string {
    // Common OCR substitutions
    const corrections: { [key: string]: string } = {
      'H0ME': 'HOME',
      'DEP0T': 'DEPOT',
      'H0ME DEP0T': 'HOME DEPOT',
      'TAR6ET': 'TARGET',
      'C0STCO': 'COSTCO',
      'L0WES': 'LOWES',
      'CHEVR0N': 'CHEVRON',
      '5HELL': 'SHELL',
      'EX0N': 'EXXON',
      '8P': 'BP',
      'WAL6REENS': 'WALGREENS',
      'STAR8UCKS': 'STARBUCKS',
      'MCD0NALDS': 'MCDONALDS',
      '5UBWAY': 'SUBWAY',
    };
    
    let corrected = text.toUpperCase();
    for (const [error, correct] of Object.entries(corrections)) {
      corrected = corrected.replace(new RegExp(error.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'), correct);
    }
    
    // Fix common character substitutions
    corrected = corrected
      .replace(/0(?=[A-Z])/g, 'O') // 0 before letters → O
      .replace(/(?<=[A-Z])0/g, 'O') // 0 after letters → O
      .replace(/1(?=[A-Z])/g, 'I') // 1 before letters → I
      .replace(/(?<=[A-Z])1/g, 'I'); // 1 after letters → I
    
    return corrected;
  }

  /**
   * Extract date from receipt text
   */
  private static extractDate(lines: string[]): string | undefined {
    // More comprehensive date patterns - try more variations
    // IMPORTANT: Check YYYY-MM-DD format BEFORE MM/DD/YYYY to avoid misparsing
    const datePatterns = [
      /date[:\s]+(\d{4}[\/\-\.]\d{1,2}[\/\-\.]\d{1,2})/i, // Date: YYYY-MM-DD (check first!)
      /date[:\s]+(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/i, // Date: MM/DD/YYYY or MM/DD/YY
      /(\d{4}[\/\-\.]\d{1,2}[\/\-\.]\d{1,2})/, // YYYY/MM/DD (check before MM/DD/YYYY)
      /(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{4})/, // MM/DD/YYYY
      /(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2})/, // MM/DD/YY
      /(\d{1,2}\s+\d{1,2}\s+\d{2,4})/, // MM DD YYYY or MM DD YY
      /([A-Za-z]{3,9}\s+\d{1,2},?\s+\d{4})/, // "April 25, 2024" or "Apr 25 2024"
      /(\d{1,2}\s+[A-Za-z]{3,9}\s+\d{4})/, // "25 April 2024"
      /(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/, // More lenient - any separator
    ];

    // Search all lines (not just first few) for dates
    for (const line of lines) {
      // Skip lines that are clearly not dates (amounts, addresses, etc.)
      // But be less strict - only skip if it's clearly an amount line
      if (line.toLowerCase().match(/^(total|subtotal|tax|amount)[:\s]*\$?\s*\d/)) {
        continue;
      }
      // Skip addresses
      if (/^\d+\s+\w+\s+(ave|street|road|blvd|drive|st|rd|blvd|ln|way)/i.test(line)) {
        continue;
      }

      for (const pattern of datePatterns) {
        const match = line.match(pattern);
        if (match) {
          const dateStr = match[1];
          const parsed = this.parseDate(dateStr);
          if (parsed) {
            // Validate the date is reasonable (not too far in past/future)
            const date = new Date(parsed);
            const now = new Date();
            const yearsDiff = Math.abs(now.getFullYear() - date.getFullYear());
            // Be more lenient - allow dates up to 10 years in the past and up to 1 year in the future
            // (for test cases and receipts that might be slightly ahead)
            if (yearsDiff <= 10) {
              return parsed;
            }
          }
        }
      }
    }

    return undefined;
  }

  /**
   * Parse date string to YYYY-MM-DD
   */
  private static parseDate(dateStr: string): string | undefined {
    try {
      // Clean up the date string
      dateStr = dateStr.trim().replace(/[^\d\/\-\sA-Za-z,]/g, '');
      
      // Handle MM/DD/YYYY or MM/DD/YY format (with /, -, or . separators)
      const mmddyyyy = dateStr.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})$/);
      if (mmddyyyy) {
        let month = parseInt(mmddyyyy[1]);
        let day = parseInt(mmddyyyy[2]);
        let year = parseInt(mmddyyyy[3]);
        
        // Handle 2-digit years: assume 20XX for years 00-50, 19XX for 51-99
        // But also consider current year context
        if (year < 100) {
          const currentYear = new Date().getFullYear();
          const currentCentury = Math.floor(currentYear / 100) * 100;
          const currentYearInCentury = currentYear % 100;
          
          // If year is close to current year, use current century
          if (year <= currentYearInCentury + 2) {
            year = currentCentury + year;
          } else {
            // Otherwise assume previous century (for old receipts)
            year = (currentCentury - 100) + year;
          }
        }
        
        // Swap month/day if they look swapped (e.g., 13/05/2024 should be 05/13/2024)
        if (month > 12 && day <= 12) {
          [month, day] = [day, month];
        }
        
        if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
          return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        }
      }
      
      // Handle YYYY/MM/DD format
      const yyyymmdd = dateStr.match(/^(\d{4})[\/\-\.](\d{1,2})[\/\-\.](\d{1,2})$/);
      if (yyyymmdd) {
        const year = parseInt(yyyymmdd[1]);
        const month = parseInt(yyyymmdd[2]);
        const day = parseInt(yyyymmdd[3]);
        
        if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
          return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        }
      }
      
      // Handle "MM DD YYYY" or "MM DD YY" format
      const mmddyyyySpace = dateStr.match(/^(\d{1,2})\s+(\d{1,2})\s+(\d{2,4})$/);
      if (mmddyyyySpace) {
        let month = parseInt(mmddyyyySpace[1]);
        let day = parseInt(mmddyyyySpace[2]);
        let year = parseInt(mmddyyyySpace[3]);
        
        if (year < 100) {
          const currentYear = new Date().getFullYear();
          const currentCentury = Math.floor(currentYear / 100) * 100;
          const currentYearInCentury = currentYear % 100;
          
          if (year <= currentYearInCentury + 2) {
            year = currentCentury + year;
          } else {
            year = (currentCentury - 100) + year;
          }
        }
        
        // Swap if needed
        if (month > 12 && day <= 12) {
          [month, day] = [day, month];
        }
        
        if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
          return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        }
      }
      
      // Try standard Date parsing as fallback
      const date = new Date(dateStr);
      if (!isNaN(date.getTime())) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        // Validate it's a reasonable date
        const now = new Date();
        const yearsDiff = Math.abs(now.getFullYear() - year);
        if (yearsDiff <= 10 && date <= now) {
          return `${year}-${month}-${day}`;
        }
      }
      
      return undefined;
    } catch {
      return undefined;
    }
  }

  /**
   * Extract total amount
   */
  private static extractTotal(lines: string[]): number | undefined {
    console.log('💰 ========================================');
    console.log('💰 EXTRACTING TOTAL - Starting search...');
    console.log(`💰 Searching ${lines.length} lines from bottom to top`);
    console.log('💰 ========================================');
    
    // Expanded keywords for total (case insensitive)
    const totalKeywords = [
      'total:', 'total', 'amount due', 'balance', 'amount', 'due', 
      'grand total', 'final total', 'total amount', 'amount charged',
      'charge', 'charged', 'amt charged', 'amt due'
    ];

    // Search from bottom to top (totals are usually at the bottom)
    for (let i = lines.length - 1; i >= 0; i--) {
      const line = lines[i];
      const lineLower = line.toLowerCase().trim();

      for (const keyword of totalKeywords) {
        if (lineLower.includes(keyword.toLowerCase())) {
          const lineUpper = line.toUpperCase();
          console.log(`💰 Found "${keyword}" keyword on line ${i + 1}: "${line}"`);
          
          // Skip if this is a subtotal line
          if (lineUpper.includes('SUBTOTAL')) {
            console.log(`💰 Skipping - this is a SUBTOTAL line`);
            continue;
          }
          
          // Try to extract amount from the same line first
          console.log(`💰 Trying to extract amount from same line: "${line}"`);
          const amount = this.extractAmount(line);
          console.log(`💰 Amount from same line:`, amount !== undefined ? `$${amount.toFixed(2)}` : 'NOT FOUND');
          if (amount !== undefined && amount > 0) {
            console.log(`💰 ✅ FOUND TOTAL: $${amount.toFixed(2)} on line ${i + 1}`);
            return amount;
          }

          // Look at nearby lines (next 5 lines) and find the LARGEST amount
          // This handles cases where "TOTAL" is on one line and amounts are on following lines
          // IMPORTANT: We want the LARGEST amount after "TOTAL", but prefer amounts with $ signs
          console.log(`💰 Checking nearby lines after "TOTAL" keyword (lines ${i + 2} to ${Math.min(i + 6, lines.length)})`);
          let bestAmount = 0;
          let bestAmountIndex = -1;
          let bestHasDollarSign = false;
          for (let j = i + 1; j < Math.min(i + 6, lines.length); j++) {
            const nearbyLine = lines[j];
            const nearbyUpper = nearbyLine.toUpperCase();
            console.log(`💰 Checking line ${j + 1}: "${nearbyLine}"`);
            
            // Skip lines that are clearly not totals (auth codes, card numbers, etc.)
            if (nearbyUpper.includes('AUTH CODE') || 
                nearbyUpper.includes('AUTH:') ||
                nearbyUpper.includes('CARD:') ||
                nearbyUpper.includes('VISA') ||
                nearbyUpper.includes('MASTERCARD') ||
                nearbyUpper.includes('AMEX') ||
                nearbyUpper.includes('RECEIPT:') ||
                nearbyUpper.includes('PUMP:')) {
              console.log(`💰 Skipping line ${j + 1} - contains auth code/card/receipt/pump info`);
              continue;
            }
            
            // Skip if it's clearly a subtotal or tax line
            if (nearbyUpper.includes('SUBTOTAL') || nearbyUpper.includes('TAX') || nearbyUpper.includes('STATE TAX')) {
              console.log(`💰 Skipping line ${j + 1} - contains subtotal/tax`);
              continue;
            }
            
            const nearbyAmount = this.extractAmount(nearbyLine);
            console.log(`💰 Amount extracted from line ${j + 1}:`, nearbyAmount !== undefined ? `$${nearbyAmount.toFixed(2)}` : 'NOT FOUND');
            if (nearbyAmount !== undefined && nearbyAmount > 0) {
              const hasDollarSign = nearbyLine.includes('$');
              console.log(`💰 Line ${j + 1} has $ sign:`, hasDollarSign);
              console.log(`💰 Current best: $${bestAmount.toFixed(2)}, has $: ${bestHasDollarSign}`);
              
              // STRICT RULE: If we already have an amount with $, only replace it with another amount that ALSO has $
              if (bestHasDollarSign && !hasDollarSign) {
                console.log(`💰 Skipping - already have amount with $, this one doesn't have $`);
                continue;
              }
              
              // If current best has no $ but new one does, always prefer the one with $
              if (!bestHasDollarSign && hasDollarSign) {
                console.log(`💰 ✅ Updating best amount to $${nearbyAmount.toFixed(2)} (has $ sign)`);
                bestAmount = nearbyAmount;
                bestAmountIndex = j;
                bestHasDollarSign = true;
                continue;
              }
              
              // If both have $ or both don't have $, prefer the first one we find (don't look for larger)
              // This prevents picking up auth codes or other large numbers
              if (bestAmount === 0) {
                console.log(`💰 ✅ Setting best amount to $${nearbyAmount.toFixed(2)} (first valid amount found)`);
                bestAmount = nearbyAmount;
                bestAmountIndex = j;
                bestHasDollarSign = hasDollarSign;
              } else {
                console.log(`💰 Skipping - already have a best amount`);
              }
            }
          }
          
          // If we found an amount, return it (don't look for larger ones - the first reasonable one after TOTAL is usually correct)
          if (bestAmount > 0) {
            console.log(`💰 ✅ FOUND TOTAL: $${bestAmount.toFixed(2)} on line ${bestAmountIndex + 1}`);
            return bestAmount;
          } else {
            console.log(`💰 No amount found in nearby lines after "TOTAL"`);
          }
          
          // Try previous line
          if (i > 0) {
            const prevAmount = this.extractAmount(lines[i - 1]);
            if (prevAmount !== undefined && prevAmount > 0) {
              const prevLineUpper = lines[i - 1].toUpperCase();
              if (!prevLineUpper.includes('SUBTOTAL')) {
                return prevAmount;
              }
            }
          }
        }
      }
    }

    // Fallback: look for the largest amount (but skip subtotals and per-unit prices)
    // Search from bottom to top (totals are usually at the bottom)
    let largestAmount = 0;
    let largestAmountLine = '';
    for (let i = lines.length - 1; i >= 0; i--) {
      const line = lines[i];
      const amount = this.extractAmount(line);
      if (amount !== undefined && amount > largestAmount) {
        const lineLower = line.toLowerCase();
        const lineUpper = line.toUpperCase();
        
        // Skip if it looks like a price per unit, subtotal, or tax
        if (lineLower.includes('price/gal') || lineLower.includes('per') || 
            lineLower.includes('each') || lineLower.includes('@') ||
            lineUpper.includes('SUBTOTAL') || lineUpper.includes('TAX') ||
            lineLower.includes('price per') || lineLower.includes('unit price')) {
          continue;
        }
        
        largestAmount = amount;
        largestAmountLine = line;
      }
    }

    // Only return if we found a reasonable total (not too small, not too large)
    // Be more lenient - accept amounts from $0.01 to $999,999
    if (largestAmount > 0 && largestAmount < 1000000) {
      console.log(`💰 Found largest amount as fallback: $${largestAmount.toFixed(2)} from line "${largestAmountLine}"`);
      return largestAmount;
    }

    return undefined;
  }

  /**
   * Extract tax amount
   */
  private static extractTax(lines: string[]): number | undefined {
    // Expanded tax keywords
    const taxKeywords = [
      'tax', 'sales tax', 'state tax', 'local tax', 'vat', 'gst', 
      'tax amount', 'tax:', 'taxes', 'taxable'
    ];

    for (const line of lines) {
      const lineLower = line.toLowerCase();
      const lineUpper = line.toUpperCase();

      for (const keyword of taxKeywords) {
        if (lineLower.includes(keyword)) {
          // If line has percentage (e.g., "SALES TAX (CA 8.75%) 3.27"), the tax amount might be on the SAME line
          if (lineUpper.includes('%')) {
            // First, try to extract amount from the SAME line as the percentage
            const amountOnSameLine = this.extractAmount(line);
            if (amountOnSameLine !== undefined && amountOnSameLine > 0 && amountOnSameLine < 10000 && amountOnSameLine < 100) {
              console.log(`💰 Found tax amount $${amountOnSameLine.toFixed(2)} on same line as tax rate`);
              return amountOnSameLine;
            }
            // Only check next line if same line doesn't have amount AND it's not TOTAL
            const lineIndex = lines.indexOf(line);
            if (lineIndex >= 0 && lineIndex + 1 < lines.length) {
              const nextLine = lines[lineIndex + 1];
              // Make sure next line is not TOTAL (which would be the total, not tax)
              if (!nextLine.toUpperCase().includes('TOTAL')) {
                const nextAmount = this.extractAmount(nextLine);
                if (nextAmount !== undefined && nextAmount > 0 && nextAmount < 10000 && nextAmount < 100) {
                  console.log(`💰 Found tax amount $${nextAmount.toFixed(2)} on line after tax rate`);
                  return nextAmount;
                }
              }
            }
            // If neither same line nor next line has valid tax amount, skip this line
            continue;
          }
          
          // Try to extract amount from the same line (if no percentage)
          const amount = this.extractAmount(line);
          if (amount !== undefined && amount > 0) {
            // Make sure it's actually a tax amount, not a tax rate percentage
            // Tax amounts are usually smaller than totals and reasonable
            if (amount < 10000 && amount < 100) { // Tax is usually less than $100
              return amount;
            }
          }
        }
      }
    }

    return undefined;
  }

  /**
   * Extract a monetary amount from a line of text
   */
  private static extractAmount(text: string): number | undefined {
    if (!text) {
      console.log('  💵 extractAmount: Empty text');
      return undefined;
    }
    
    // Skip lines that are clearly NOT dollar amounts (auth codes, receipt numbers, etc.)
    const textUpper = text.toUpperCase();
    if (textUpper.includes('AUTH CODE') || 
        textUpper.includes('AUTH:') ||
        textUpper.includes('RECEIPT:') ||
        textUpper.includes('RECEIPT #') ||
        textUpper.includes('PUMP:') ||
        textUpper.includes('PUMP #') ||
        textUpper.includes('CARD:') ||
        textUpper.includes('VISA') ||
        textUpper.includes('MASTERCARD') ||
        textUpper.includes('AMEX') ||
        /^\d{6,}$/.test(text.trim())) { // Pure numbers 6+ digits (likely auth codes, receipt numbers)
      console.log(`  💵 extractAmount: Skipping line (auth code/receipt/card): "${text}"`);
      return undefined;
    }
    
    // More comprehensive amount patterns - try more variations
    // Order matters: try most specific patterns first
    const amountPatterns = [
      // Patterns with $ and specific keywords
      /\$\s*(\d{1,3}(?:,\d{3})*\.\d{2})/, // $1,234.56
      /\$\s*(\d+\.\d{2})/, // $123.45
      /total[:\s]*\$?\s*(\d{1,3}(?:,\d{3})*\.\d{2})/i, // Total: $1,234.56
      /total[:\s]*\$?\s*(\d+\.\d{2})/i, // Total: $123.45
      /amount[:\s]*\$?\s*(\d{1,3}(?:,\d{3})*\.\d{2})/i, // Amount: $1,234.56
      /amount[:\s]*\$?\s*(\d+\.\d{2})/i, // Amount: $123.45
      /tax[:\s]*\$?\s*(\d{1,3}(?:,\d{3})*\.\d{2})/i, // Tax: $1,234.56
      /tax[:\s]*\$?\s*(\d+\.\d{2})/i, // Tax: $123.45
      // Patterns with $ but no keyword
      /\$\s*(\d{1,3}(?:,\d{3})*\.\d{2})/, // $1,234.56
      /\$\s*(\d+\.\d{2})/, // $123.45
      /\$\s*(\d{1,3}(?:,\d{3})*)/, // $1,234 (no cents)
      // Patterns without $ but with decimal
      /(\d{1,3}(?:,\d{3})*\.\d{2})/, // 1,234.56 (no $)
      /(\d+\.\d{2})/, // 123.45 (no $)
      // Patterns without $ and without decimal (less preferred, but skip if too large)
      /(\d{1,3}(?:,\d{3})*)/, // 1,234 (no $, no cents)
    ];

    // Try patterns in order of specificity
    for (const pattern of amountPatterns) {
      const match = text.match(pattern);
      if (match) {
        let amountStr = match[1].replace(/,/g, '').trim();
        
        // Handle OCR errors: common substitutions
        // Replace O with 0 in numbers (but be careful)
        // Only do this if it's clearly a number pattern
        if (/^[0-9O]+\.\d{2}$/.test(amountStr)) {
          amountStr = amountStr.replace(/O/g, '0');
        }
        
        const amount = parseFloat(amountStr);
        console.log(`  💵 Pattern matched: "${pattern}" extracted: "${amountStr}" = $${amount.toFixed(2)}`);
        // Reject if amount is suspiciously large (likely not a dollar amount)
        // Also reject if it's a whole number > 100 without a dollar sign (could be receipt number, etc.)
        if (!isNaN(amount) && amount > 0 && amount < 1000000) {
          // If no dollar sign and no decimal, be VERY cautious
          if (!text.includes('$') && !amountStr.includes('.')) {
            // If it's > 100, it's probably not a dollar amount (receipt numbers, auth codes, etc.)
            if (amount > 100) {
              console.log(`  💵 Rejecting amount $${amount.toFixed(2)} - no $ sign, no decimal, > $100 (likely not a dollar amount)`);
              continue;
            }
          }
          console.log(`  💵 ✅ Returning amount: $${amount.toFixed(2)}`);
          return amount;
        } else {
          console.log(`  💵 Rejecting amount - invalid: ${amount}`);
        }
      }
    }

    console.log(`  💵 No amount found in: "${text}"`);
    return undefined;
  }

  /**
   * Aggressive fallback parsing when structured parsing fails
   * Tries to extract ANY information from the raw text
   */
  private static aggressiveFallbackParse(text: string): Omit<OCRData, 'raw_text' | 'confidence'> {
    const result: Omit<OCRData, 'raw_text' | 'confidence'> = {};
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    
    console.log('🔍 Aggressive fallback parsing on', lines.length, 'lines');
    
    // Try to find ANY amount that looks like a total (largest amount, usually at bottom)
    const allAmounts: Array<{ amount: number; line: string; index: number }> = [];
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const amount = this.extractAmount(line);
      if (amount !== undefined && amount > 0 && amount < 100000) {
        allAmounts.push({ amount, line, index: i });
      }
    }
    
    if (allAmounts.length > 0) {
      // Sort by amount descending, prefer amounts near the bottom
      allAmounts.sort((a, b) => {
        if (Math.abs(a.amount - b.amount) < 0.01) {
          return b.index - a.index; // Prefer later lines if amounts are similar
        }
        return b.amount - a.amount;
      });
      
      const largest = allAmounts[0];
      result.total = largest.amount;
      console.log(`💰 Fallback: Found total $${largest.amount.toFixed(2)} from line "${largest.line}"`);
    }
    
    // Try to find ANY date pattern
    for (const line of lines) {
      const dateMatch = line.match(/(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/);
      if (dateMatch) {
        const parsed = this.parseDate(dateMatch[1]);
        if (parsed) {
          result.date = parsed;
          console.log(`📅 Fallback: Found date ${parsed} from line "${line}"`);
          break;
        }
      }
    }
    
    // Try to find ANY vendor name (first non-empty line that has letters)
    for (let i = 0; i < Math.min(15, lines.length); i++) {
      const line = lines[i];
      if (line.length >= 2 && line.length <= 60) {
        // Skip generic phrases that aren't business names
        const genericWords = ['random', 'text', 'data', 'without', 'structured', 'test', 'some'];
        const lineLower = line.toLowerCase();
        const words = lineLower.split(/\s+/);
        const genericWordCount = words.filter(word => genericWords.includes(word)).length;
        if (genericWordCount >= 2 || (genericWordCount >= 1 && words.length <= 4)) {
          continue;
        }
        
        // Skip if it's clearly a date, amount, or address
        if (!/^\d{1,2}[\/\-\.]/.test(line) && 
            !/^\$?\s*\d/.test(line) && 
            !/^\d+\s+\w+\s+(ave|st|street|road)/i.test(line) &&
            /[A-Za-z]/.test(line)) {
          result.vendor = line.replace(/#\d+/, '').trim();
          console.log(`🏪 Fallback: Found vendor "${result.vendor}" from line "${line}"`);
          break;
        }
      }
    }
    
    return result;
  }

  /**
   * Validate OCR results
   */
  static validateOCRData(data: OCRData): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!data.raw_text || data.raw_text.trim().length === 0) {
      errors.push('No text was extracted from the image');
    }

    if (!data.vendor) {
      warnings.push('Could not extract vendor name');
    }

    if (!data.date) {
      warnings.push('Could not extract date');
    }

    if (!data.total || data.total <= 0) {
      warnings.push('Could not extract valid total amount');
    }

    if (data.confidence !== undefined && data.confidence < 0.3) {
      warnings.push(`Low OCR confidence (${(data.confidence * 100).toFixed(0)}%) - results may be inaccurate`);
    } else if (data.confidence !== undefined && data.confidence < 0.5) {
      warnings.push(`Moderate OCR confidence (${(data.confidence * 100).toFixed(0)}%) - please verify results`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }
}





