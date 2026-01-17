// API configuration
// Since the Fastify server serves both API and frontend on the same port (4000),
// we should always use relative paths. The server uses BASE_PATH which defaults to /api/v1
// Only use full URL if explicitly set via VITE_API_URL environment variable

function getApiBaseUrl(): string {
  // If VITE_API_URL is explicitly set, use it
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // In server-side rendering context, use localhost
  if (typeof window === 'undefined') {
    // Check if we're in production build (has process.env)
    const serverUrl = process.env.SERVER_URL || 'http://localhost:4000';
    return `${serverUrl}/api/v1`;
  }
  
  // Client-side: use relative URL (will work with proxy in dev or same origin in prod)
  return '/api/v1';
}

export const BACKEND_URL = getApiBaseUrl();

