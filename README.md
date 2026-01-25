# DKMedia

Unified app for the public site and CMS. Remix frontend with Fastify backend, all in one repo.

## Tech Stack

- Frontend: Remix, Vite, Tailwind CSS
- Backend: Fastify, Node.js
- Database: MongoDB
- Queue: RabbitMQ (email jobs)
- Cache: Redis (email quota tracking)

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file with:
```
MONGODB_URL=your_mongodb_connection_string
DATABASE_NAME=your_database_name
BASE_PATH=/api/v1
FRONTEND_URL=http://localhost:5173
CRM_FRONTEND_URL=http://localhost:5173
NODE_ENV=development
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:4000/api/v1/auth/google/callback
RESEND_API_KEY=your_resend_api_key
RESEND_FROM_EMAIL=info@dkmedia305.com
RABBITMQ_URL=amqp://localhost:5672
REDIS_URL=redis://localhost:6379
COOKIE_SECRET=your_cookie_secret
```

3. Copy `server/src/secret-key` to `server/dist/secret-key` (or create one for session encryption)

## Running

Development:
```bash
npm run dev
```
Starts Fastify on port 4000 and Vite dev server on port 5173.

Production:
```bash
npm run build
npm start
```

## Routes

- `/` - Home page
- `/media` - Media gallery
- `/contact` - Contact page
- `/auth` - CMS login
- `/cms` - CMS dashboard

API is at `/api/v1/*`.
