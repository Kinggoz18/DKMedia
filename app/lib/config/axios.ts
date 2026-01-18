import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { BACKEND_URL } from './api';

// Detect if we are in the browser

/**
 * Create an axios instance configured for API requests
 * Only sends credentials (cookies) for POST/PUT/DELETE requests (protected endpoints)
 */
export const createApiClient = (): AxiosInstance => {
  const isBrowser = typeof window !== 'undefined';

  // Determine base URL based on environment
  const baseURL = isBrowser
    ? (import.meta.env.VITE_API_URL || '/api/v1')  // Browser: relative or VITE_API_URL
    : (process.env.VITE_INTERNAL_API_URL || 'http://127.0.0.1:4000/api/v1'); // Server: internal URL

  const apiClient = axios.create({
    baseURL,
    withCredentials: false, // Default to false, set per request for protected endpoints
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Request interceptor to add CSRF token from localStorage to headers
  apiClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      // Only send credentials for POST/PUT/DELETE/GET requests to protected CMS endpoints
      const isProtectedMethod = config.method === 'post' || config.method === 'put' || config.method === 'delete' || config.method === 'get';

      if (isProtectedMethod) {
        config.withCredentials = true; // Include cookies for protected endpoints

        // Get CSRF token from localStorage (MUST be from localStorage, not cookies)
        const csrfToken = getCSRFTokenFromLocalStorage();

        if (csrfToken) {
          config.headers['X-CSRF-Token'] = csrfToken;
        } else {
          console.warn('CSRF token not found in localStorage for protected request');
        }
      }

      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor for error handling
  apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
      // Handle 401 unauthorized - redirect to login
      if (error.response?.status === 401) {
        // Clear any stored auth data including CSRF token
        if (typeof window !== 'undefined' && window.localStorage) {
          localStorage.removeItem('userId');
          localStorage.removeItem('csrf_token');
          localStorage.removeItem('user');
        }

        // Redirect to login if not already there
        if (typeof window !== 'undefined' && !window.location.pathname.includes('/auth')) {
          window.location.href = '/auth';
        }
      }
      return Promise.reject(error);
    }
  );

  return apiClient;
};

/**
 * Get CSRF token from localStorage
 * This is the double CSRF token pattern - token stored in both cookie and localStorage
 */
function getCSRFTokenFromLocalStorage(): string | null {
  if (typeof window === 'undefined') return null;

  const csrfToken = localStorage.getItem('csrf_token');
  return csrfToken;
}

/**
 * Get userId from localStorage or session
 */
function getUserId(): string | null {
  if (typeof window === 'undefined') return null;

  // Try to get from localStorage first (stored by handleOAuthRedirect)
  const userId = localStorage.getItem('userId');
  if (userId) return userId;

  // Try to get from user object in localStorage (stored by AuthSlice)
  const userStr = localStorage.getItem('user');
  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      if (user.authId) {
        localStorage.setItem('userId', user.authId);
        return user.authId;
      }
    } catch (e) {
      // Ignore parse errors
    }
  }

  // Try to get from URL params (after auth redirect)
  const urlParams = new URLSearchParams(window.location.search);
  const authId = urlParams.get('authId');
  if (authId) {
    localStorage.setItem('userId', authId);
    return authId;
  }

  return null;
}

// Default axios instance
export const apiClient = createApiClient();

