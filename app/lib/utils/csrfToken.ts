/**
 * Get CSRF token from localStorage
 * This implements the double CSRF token pattern - token stored in both cookie and localStorage
 */
export function getCSRFToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('csrf_token');
}

/**
 * Get axios config with CSRF token header for protected requests
 */
export function getProtectedRequestConfig() {
  const csrfToken = getCSRFToken();

  return {
    withCredentials: true,
    headers: {
      'X-CSRF-Token': csrfToken || ''
    }
  };
}

/**
 * Get fetch options with CSRF token header for protected requests
 * Use this for fetch() calls instead of manually setting headers
 */
export function getProtectedFetchOptions(options: RequestInit = {}): RequestInit {
  const csrfToken = getCSRFToken();

  return {
    ...options,
    credentials: 'include',
    headers: {
      ...options.headers,
      'X-CSRF-Token': csrfToken || ''
    }
  };
}

