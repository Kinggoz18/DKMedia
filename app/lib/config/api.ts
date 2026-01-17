// API configuration
// Since the Fastify server serves both API and frontend on the same port (4000),
// we should always use relative paths. The server uses BASE_PATH which defaults to /api/v1
// Only use full URL if explicitly set via VITE_API_URL environment variable
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

export const BACKEND_URL = API_BASE_URL;

