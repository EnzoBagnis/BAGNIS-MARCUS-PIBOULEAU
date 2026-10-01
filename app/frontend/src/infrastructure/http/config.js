/**
 * Centralized API configuration.
 */

// Fallback to local XAMPP structure if VITE_API_URL is not defined
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost/LPMF_projet_stage/app/backend/public';
