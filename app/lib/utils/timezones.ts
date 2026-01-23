/**
 * Comprehensive list of world timezones
 * Format: IANA timezone identifier (e.g., "America/New_York")
 */
export const TIMEZONES = [
  // North America
  { value: 'America/New_York', label: 'Eastern Time (US & Canada)' },
  { value: 'America/Chicago', label: 'Central Time (US & Canada)' },
  { value: 'America/Denver', label: 'Mountain Time (US & Canada)' },
  { value: 'America/Phoenix', label: 'Mountain Time - Arizona' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (US & Canada)' },
  { value: 'America/Anchorage', label: 'Alaska' },
  { value: 'America/Honolulu', label: 'Hawaii' },
  { value: 'America/Toronto', label: 'Toronto' },
  { value: 'America/Vancouver', label: 'Vancouver' },
  { value: 'America/Mexico_City', label: 'Mexico City' },
  { value: 'America/Montreal', label: 'Montreal' },
  
  // South America
  { value: 'America/Sao_Paulo', label: 'São Paulo' },
  { value: 'America/Buenos_Aires', label: 'Buenos Aires' },
  { value: 'America/Lima', label: 'Lima' },
  { value: 'America/Bogota', label: 'Bogota' },
  { value: 'America/Santiago', label: 'Santiago' },
  { value: 'America/Caracas', label: 'Caracas' },
  
  // Europe
  { value: 'Europe/London', label: 'London' },
  { value: 'Europe/Paris', label: 'Paris' },
  { value: 'Europe/Berlin', label: 'Berlin' },
  { value: 'Europe/Rome', label: 'Rome' },
  { value: 'Europe/Madrid', label: 'Madrid' },
  { value: 'Europe/Amsterdam', label: 'Amsterdam' },
  { value: 'Europe/Brussels', label: 'Brussels' },
  { value: 'Europe/Vienna', label: 'Vienna' },
  { value: 'Europe/Stockholm', label: 'Stockholm' },
  { value: 'Europe/Copenhagen', label: 'Copenhagen' },
  { value: 'Europe/Oslo', label: 'Oslo' },
  { value: 'Europe/Helsinki', label: 'Helsinki' },
  { value: 'Europe/Warsaw', label: 'Warsaw' },
  { value: 'Europe/Prague', label: 'Prague' },
  { value: 'Europe/Budapest', label: 'Budapest' },
  { value: 'Europe/Athens', label: 'Athens' },
  { value: 'Europe/Istanbul', label: 'Istanbul' },
  { value: 'Europe/Moscow', label: 'Moscow' },
  { value: 'Europe/Dublin', label: 'Dublin' },
  { value: 'Europe/Lisbon', label: 'Lisbon' },
  
  // Africa
  { value: 'Africa/Cairo', label: 'Cairo' },
  { value: 'Africa/Johannesburg', label: 'Johannesburg' },
  { value: 'Africa/Lagos', label: 'Lagos' },
  { value: 'Africa/Nairobi', label: 'Nairobi' },
  { value: 'Africa/Casablanca', label: 'Casablanca' },
  { value: 'Africa/Addis_Ababa', label: 'Addis Ababa' },
  
  // Asia
  { value: 'Asia/Dubai', label: 'Dubai' },
  { value: 'Asia/Karachi', label: 'Karachi' },
  { value: 'Asia/Kolkata', label: 'Mumbai, New Delhi' },
  { value: 'Asia/Dhaka', label: 'Dhaka' },
  { value: 'Asia/Bangkok', label: 'Bangkok' },
  { value: 'Asia/Singapore', label: 'Singapore' },
  { value: 'Asia/Hong_Kong', label: 'Hong Kong' },
  { value: 'Asia/Shanghai', label: 'Beijing, Shanghai' },
  { value: 'Asia/Tokyo', label: 'Tokyo' },
  { value: 'Asia/Seoul', label: 'Seoul' },
  { value: 'Asia/Manila', label: 'Manila' },
  { value: 'Asia/Jakarta', label: 'Jakarta' },
  { value: 'Asia/Kuala_Lumpur', label: 'Kuala Lumpur' },
  { value: 'Asia/Taipei', label: 'Taipei' },
  { value: 'Asia/Bangkok', label: 'Bangkok' },
  { value: 'Asia/Ho_Chi_Minh', label: 'Ho Chi Minh' },
  { value: 'Asia/Riyadh', label: 'Riyadh' },
  { value: 'Asia/Tehran', label: 'Tehran' },
  { value: 'Asia/Baghdad', label: 'Baghdad' },
  { value: 'Asia/Jerusalem', label: 'Jerusalem' },
  
  // Australia & Pacific
  { value: 'Australia/Sydney', label: 'Sydney' },
  { value: 'Australia/Melbourne', label: 'Melbourne' },
  { value: 'Australia/Brisbane', label: 'Brisbane' },
  { value: 'Australia/Perth', label: 'Perth' },
  { value: 'Australia/Adelaide', label: 'Adelaide' },
  { value: 'Pacific/Auckland', label: 'Auckland' },
  { value: 'Pacific/Fiji', label: 'Fiji' },
  { value: 'Pacific/Honolulu', label: 'Honolulu' },
  
  // UTC
  { value: 'UTC', label: 'UTC (Coordinated Universal Time)' },
];

/**
 * Get timezone label by value
 */
export function getTimezoneLabel(value: string): string {
  const timezone = TIMEZONES.find(tz => tz.value === value);
  return timezone ? timezone.label : value;
}

/**
 * Format date/time in a specific timezone
 */
export function formatDateTimeInTimezone(
  dateString: string,
  timezone: string,
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: timezone
  }
): string {
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', options).format(date);
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString;
  }
}

/**
 * Format time in a specific timezone
 */
export function formatTimeInTimezone(
  dateString: string,
  timezone: string
): string {
  return formatDateTimeInTimezone(dateString, timezone, {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: timezone
  });
}

/**
 * Format date (without time) in a specific timezone
 * Returns format like "Jan 23" or "January 23"
 */
export function formatDateInTimezone(
  dateString: string,
  timezone: string,
  format: 'short' | 'long' = 'short'
): string {
  const monthsShort = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const monthsLong = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  
  try {
    const date = new Date(dateString);
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      day: 'numeric',
      month: 'numeric',
      year: 'numeric'
    });
    
    const parts = formatter.formatToParts(date);
    const day = parts.find(p => p.type === 'day')?.value;
    const month = parseInt(parts.find(p => p.type === 'month')?.value || '1');
    const months = format === 'short' ? monthsShort : monthsLong;
    
    return `${months[month - 1]} ${day}`;
  } catch (error) {
    console.error('Error formatting date in timezone:', error);
    // Fallback to original date parsing
    try {
      const date = new Date(dateString);
      const months = format === 'short' ? monthsShort : monthsLong;
      return `${months[date.getMonth()]} ${date.getDate()}`;
    } catch {
      return dateString;
    }
  }
}
