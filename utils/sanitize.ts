// Input Sanitization Utilities
// Security utilities for sanitizing user inputs

/**
 * Sanitizes user input by removing potentially dangerous characters
 * Protects against XSS and injection attacks
 */
export const sanitizeInput = (input: string): string => {
  if (!input || typeof input !== 'string') {
    return '';
  }
  
  return input
    // Remove HTML tags
    .replace(/<[^>]*>/g, '')
    // Remove script-related content
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    // Remove potentially dangerous characters
    .replace(/[<>]/g, '')
    // Trim whitespace
    .trim();
};

/**
 * Sanitizes input for safe display (less strict than sanitizeInput)
 */
export const sanitizeForDisplay = (input: string): string => {
  if (!input || typeof input !== 'string') {
    return '';
  }
  
  return input
    // Replace HTML entities
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

/**
 * Validates and sanitizes email format
 */
export const sanitizeEmail = (email: string): string => {
  if (!email || typeof email !== 'string') {
    return '';
  }
  
  // Remove any potentially dangerous characters
  const cleaned = email.toLowerCase().trim().replace(/[<>'"]/g, '');
  
  // Basic email validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  return emailRegex.test(cleaned) ? cleaned : '';
};

/**
 * Validates and sanitizes numeric input
 */
export const sanitizeNumber = (input: string | number, options?: {
  min?: number;
  max?: number;
  defaultValue?: number;
}): number => {
  const { min = -Infinity, max = Infinity, defaultValue = 0 } = options || {};
  
  const num = typeof input === 'number' ? input : parseFloat(String(input).replace(/[^0-9.-]/g, ''));
  
  if (isNaN(num)) {
    return defaultValue;
  }
  
  return Math.max(min, Math.min(max, num));
};

/**
 * Limits string length and adds ellipsis if needed
 */
export const truncateString = (input: string, maxLength: number): string => {
  if (!input || typeof input !== 'string') {
    return '';
  }
  
  if (input.length <= maxLength) {
    return input;
  }
  
  return input.slice(0, maxLength - 3) + '...';
};

/**
 * Removes all non-alphanumeric characters except spaces and Turkish characters
 */
export const sanitizeAlphanumeric = (input: string): string => {
  if (!input || typeof input !== 'string') {
    return '';
  }
  
  // Allow Turkish characters: ğ, ü, ş, ı, ö, ç, Ğ, Ü, Ş, İ, Ö, Ç
  return input.replace(/[^a-zA-Z0-9\s\u011f\u00fc\u015f\u0131\u00f6\u00e7\u011e\u00dc\u015e\u0130\u00d6\u00c7]/g, '').trim();
};

/**
 * Validates URL format
 */
export const isValidUrl = (url: string): boolean => {
  if (!url || typeof url !== 'string') {
    return false;
  }
  
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Sanitizes URL input
 */
export const sanitizeUrl = (url: string): string => {
  if (!isValidUrl(url)) {
    return '';
  }
  
  // Only allow http and https protocols
  const parsed = new URL(url);
  if (!['http:', 'https:'].includes(parsed.protocol)) {
    return '';
  }
  
  return url;
};

export default {
  sanitizeInput,
  sanitizeForDisplay,
  sanitizeEmail,
  sanitizeNumber,
  truncateString,
  sanitizeAlphanumeric,
  isValidUrl,
  sanitizeUrl,
};



