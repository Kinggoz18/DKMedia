# DKMedia Unified App

A unified application combining the public website and CMS into a single Remix + Vite + Fastify application.

## Structure

- **Frontend**: Remix + Vite + Tailwind CSS
- **Backend**: Fastify + Node.js
- **Public Site**: Routes at `/`, `/media`, `/contact`
- **CMS**: Routes at `/auth`, `/cms`

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory with the following variables:
```
MONGODB_URL=your_mongodb_connection_string
BASE_PATH=/api/v1
DATABASE_NAME=your_database_name
FRONTEND_URL=http://localhost:5173
CRM_FRONTEND_URL=http://localhost:5173
NODE_ENV=development
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:4000/api/v1/auth/google/callback
EMAILJS_KEY=your_emailjs_key
```

3. Ensure you have a `server/secret-key` file for session encryption (copy from DKMEDIA_CMS_API if needed).

## Development

Run both the server and client in development mode:
```bash
npm run dev
```

This will:
- Start the Fastify server on port 4000
- Start the Vite dev server on port 5173 (with Remix)
- Proxy API requests from `/api` to the Fastify server

## Build

Build both server and client:
```bash
npm run build
```

## Production

Start the production server:
```bash
npm start
```

The Fastify server will serve both the API and the built frontend.

## API

The API is available at `/api/v1/*` and is served by the Fastify server.

## Remix Routes

- `app/routes/_index.tsx` - Home page
- `app/routes/media.tsx` - Media/Recaps page
- `app/routes/contact.tsx` - Contact page
- `app/routes/auth.tsx` - CMS Login
- `app/routes/cms.tsx` - CMS Dashboard
- `app/routes/cms.sections.*.tsx` - CMS section routes
