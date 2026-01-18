// API configuration
// Since the Fastify server serves both API and frontend on the same port (4000),
// we should always use relative paths. The server uses BASE_PATH which defaults to /api/v1
// Only use full URL if explicitly set via VITE_API_URL environment variable

// Detect if we are in the browser

function getApiBaseUrl(): string {
  const isBrowser = typeof window !== 'undefined';

  if (isBrowser) {
    // Browser: use relative URL or VITE_API_URL if set
    return import.meta.env.VITE_API_URL || '/api/v1';
  } else {
    // Server: use internal API URL (localhost)
    return process.env.VITE_INTERNAL_API_URL || 'http://127.0.0.1:4000/api/v1';
  }
}

export const BACKEND_URL = getApiBaseUrl();

