/**
 * Validation utilities for input fields
 */

/**
 * Validate email format
 * @param email - Email address to validate
 * @returns true if valid, false otherwise
 */
export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

/**
 * Validate phone number format
 * Supports various formats: +1-555-123-4567, (555) 123-4567, 555-123-4567, 5551234567, etc.
 * @param phone - Phone number to validate
 * @returns true if valid, false otherwise
 */
export function isValidPhoneNumber(phone: string): boolean {
  if (!phone || typeof phone !== 'string') return false;
  
  // Remove all whitespace
  const cleaned = phone.replace(/\s/g, '');
  
  // Check for various phone number formats
  // Supports: +1-555-123-4567, (555)123-4567, 555-123-4567, 5551234567, +15551234567
  const phoneRegex = /^(\+?\d{1,4}[-.\s]?)?(\(?\d{1,4}\)?[-.\s]?)?\d{3,4}[-.\s]?\d{3,4}[-.\s]?\d{4}$/;
  
  // Also accept 10-digit numbers
  const tenDigitRegex = /^\d{10}$/;
  
  return phoneRegex.test(cleaned) || tenDigitRegex.test(cleaned);
}

/**
 * Validate that a date is not in the past
 * @param dateString - Date string in ISO format (YYYY-MM-DDTHH:mm)
 * @returns true if date is valid and not in the past, false otherwise
 */
export function isValidEventDate(dateString: string): boolean {
  if (!dateString || typeof dateString !== 'string') return false;
  
  try {
    const eventDate = new Date(dateString);
    const now = new Date();
    
    // Check if date is valid
    if (isNaN(eventDate.getTime())) return false;
    
    // Check if date is in the past (with 1 minute buffer to account for time differences)
    const oneMinuteAgo = new Date(now.getTime() - 60000);
    return eventDate >= oneMinuteAgo;
  } catch (error) {
    return false;
  }
}

/**
 * Validate that an end date is after the start date
 * @param startDateString - Start date string in ISO format
 * @param endDateString - End date string in ISO format
 * @returns true if end date is after start date, false otherwise
 */
export function isValidEndDate(startDateString: string, endDateString: string): boolean {
  if (!startDateString || !endDateString) return true; // Optional field
  
  try {
    const startDate = new Date(startDateString);
    const endDate = new Date(endDateString);
    
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) return false;
    
    return endDate > startDate;
  } catch (error) {
    return false;
  }
}
