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

# Email Service (Resend)
RESEND_API_KEY=your_resend_api_key
RESEND_FROM_EMAIL=info@dkmedia305.com

# Queue System (RabbitMQ)
RABBITMQ_URL=amqp://localhost:5672

# Cache/State (Redis)
REDIS_URL=redis://localhost:6379
```

## New Environment Variables

### Email Service Configuration
- **RESEND_API_KEY** (required): Your Resend API key for sending emails. Get it from [resend.com](https://resend.com)
- **RESEND_FROM_EMAIL** (optional): Default sender email address. Defaults to `info@dkmedia305.com` if not set

### Queue System Configuration
- **RABBITMQ_URL** (optional): RabbitMQ connection URL. Defaults to `amqp://localhost:5672` if not set
  - Format: `amqp://[username:password@]host[:port]`
  - Example: `amqp://guest:guest@localhost:5672`

### Cache/State Configuration
- **REDIS_URL** (optional): Redis connection URL. Defaults to `redis://localhost:6379` if not set
  - Format: `redis://[password@]host[:port]`
  - Example: `redis://localhost:6379` or `redis://:password@localhost:6379`

## Email System Architecture

The application uses a queue-based email system with the following components:

1. **EmailService**: Publishes email jobs to RabbitMQ queue
2. **EmailQueueWorker**: Consumes and processes email jobs from RabbitMQ
3. **RedisQuotaService**: Tracks daily email quota (100 emails/day) and manages worker pause/resume state
4. **RabbitMQService**: Handles queue operations and job publishing

### Daily Email Quota
- **Limit**: 100 emails per day (Resend free tier limit)
- **Reset**: Automatically resets at UTC midnight (00:00:00 UTC)
- **Overflow Handling**: Emails exceeding the daily limit are automatically scheduled for the next UTC day

### Email Expiration
- All newsletter emails support an `expiresAt` field
- Expired emails are automatically discarded before sending
- Prevents sending stale or outdated content

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
