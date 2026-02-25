/**
 * Central API configuration for the application.
 * This ensures consistency across different environments and services.
 */

// Using Netlify proxy with /api to avoid HTTPS→HTTP mixed content errors
// Frontend → /api → Netlify proxy → VPS backend
// Use environment variable for API URL (Standard React convention)
export const API_URL = process.env.REACT_APP_API_URL || 'https://api.market-mantra.com/api';

export default API_URL;
