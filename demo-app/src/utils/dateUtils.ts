/**
 * Gets today's date as a local date string (YYYY-MM-DD) without timezone conversion.
 */
export function getTodayLocalDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const day = now.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Formats a date string (YYYY-MM-DD) directly without timezone conversion.
 * This prevents the off-by-one day problem when dates are stored as date-only strings.
 */
export function formatLocalDate(dateString: string | undefined | null, formatStr: string = 'MMM dd, yyyy'): string {
  if (!dateString) return 'N/A';
  
  try {
    // Parse date string (YYYY-MM-DD) directly without Date object to avoid timezone issues
    const [year, month, day] = dateString.split('-').map(Number);
    if (isNaN(year) || isNaN(month) || isNaN(day)) {
      return dateString;
    }
    
    // Format directly from the parsed values to avoid any timezone conversion
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthName = monthNames[month - 1];
    const dayStr = day.toString().padStart(2, '0'); // Zero-padded to match 'MMM dd, yyyy' format
    
    // Return formatted date directly - this completely avoids timezone conversion
    return `${monthName} ${dayStr}, ${year}`;
  } catch {
    return dateString;
  }
}












