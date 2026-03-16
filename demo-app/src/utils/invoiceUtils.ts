import { Invoice, InvoiceStatus } from '../shared/types';

/**
 * Check if an invoice is paid.
 * Simple rule: If status is 'paid' OR payment_date is set, the invoice is paid.
 * 
 * @param invoice The invoice to check
 * @param debug Optional: if true, logs debug info for this invoice
 * @returns true if the invoice is paid, false otherwise
 */
export function isInvoicePaid(invoice: Invoice, debug: boolean = false): boolean {
  // Check if status is explicitly 'paid' (case-insensitive)
  const statusRaw = invoice.status || '';
  const status = String(statusRaw).toLowerCase().trim();
  
  if (debug) {
    console.error(`[isInvoicePaid DEBUG] Invoice ${invoice.invoice_number || invoice.id}:`);
    console.error(`  statusRaw: "${statusRaw}" (type: ${typeof invoice.status})`);
    console.error(`  status (lowercase): "${status}"`);
    console.error(`  status === 'paid'? ${status === 'paid'}`);
  }
  
  if (status === 'paid') {
    if (debug) console.error(`  → RETURNING TRUE (status is 'paid')`);
    return true;
  }
  
  // Check if payment_date is set (any non-empty, non-null value)
  const paymentDateRaw = invoice.payment_date;
  const paymentDateStr = String(paymentDateRaw || '');
  const paymentDateLower = paymentDateStr.toLowerCase().trim();
  
  const hasPaymentDate = paymentDateRaw != null && 
                         paymentDateRaw !== undefined && 
                         paymentDateRaw !== '' &&
                         paymentDateLower !== 'null' &&
                         paymentDateLower !== 'undefined';
  
  if (debug) {
    console.error(`  paymentDateRaw: ${JSON.stringify(paymentDateRaw)} (type: ${typeof paymentDateRaw})`);
    console.error(`  paymentDateStr: "${paymentDateStr}"`);
    console.error(`  paymentDateLower: "${paymentDateLower}"`);
    console.error(`  Checks: != null: ${paymentDateRaw != null}, !== undefined: ${paymentDateRaw !== undefined}, !== '': ${paymentDateRaw !== ''}`);
    console.error(`  hasPaymentDate: ${hasPaymentDate}`);
  }
  
  if (hasPaymentDate) {
    if (debug) console.error(`  → RETURNING TRUE (has payment_date)`);
    return true;
  }
  
  if (debug) console.error(`  → RETURNING FALSE (neither status='paid' nor payment_date set)`);
  return false;
}

/**
 * Get the display status for an invoice.
 * If the invoice is paid (by status or payment_date), returns 'paid'.
 * Otherwise returns the actual status.
 * 
 * @param invoice The invoice
 * @returns The status to display
 */
export function getInvoiceDisplayStatus(invoice: Invoice): InvoiceStatus {
  if (isInvoicePaid(invoice)) {
    return 'paid';
  }
  return invoice.status;
}
