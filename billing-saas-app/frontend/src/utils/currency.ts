/**
 * Currency utilities for Indian Rupee (INR) formatting
 */

export const CURRENCY_CONFIG = {
  symbol: '₹',
  code: 'INR',
  locale: 'en-IN',
  name: 'Indian Rupee'
};

/**
 * Format number as Indian Rupee with proper localization
 */
export const formatCurrency = (amount: number): string => {
  return `${CURRENCY_CONFIG.symbol}${amount.toLocaleString(CURRENCY_CONFIG.locale)}`;
};

/**
 * Format number as Indian Rupee using Intl.NumberFormat for better precision
 */
export const formatCurrencyPrecise = (amount: number): string => {
  return new Intl.NumberFormat(CURRENCY_CONFIG.locale, {
    style: 'currency',
    currency: CURRENCY_CONFIG.code,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(amount);
};

/**
 * Format number with currency symbol (simple format)
 */
export const formatAmount = (amount: number): string => {
  return `${CURRENCY_CONFIG.symbol}${amount.toLocaleString()}`;
};

/**
 * Parse currency string to number (removes currency symbol and commas)
 */
export const parseCurrency = (currencyString: string): number => {
  const cleaned = currencyString.replace(/[₹,\s]/g, '');
  return parseFloat(cleaned) || 0;
};

/**
 * Get currency symbol
 */
export const getCurrencySymbol = (): string => {
  return CURRENCY_CONFIG.symbol;
};

/**
 * Get currency code
 */
export const getCurrencyCode = (): string => {
  return CURRENCY_CONFIG.code;
};

export default {
  format: formatCurrency,
  formatPrecise: formatCurrencyPrecise,
  formatAmount,
  parse: parseCurrency,
  symbol: getCurrencySymbol,
  code: getCurrencyCode,
  config: CURRENCY_CONFIG
};
