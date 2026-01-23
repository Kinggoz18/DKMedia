import fastify, { FastifyInstance } from 'fastify'
import { mongodb } from '@fastify/mongodb';
import fastifyMongodb from '@fastify/mongodb';
import { initAppRoutes } from './routes/routes.js';
import fastifySecureSession from '@fastify/secure-session'
import fastifyMultipart from '@fastify/multipart';
import fastifyRateLimit from '@fastify/rate-limit';
import fastifyStatic from '@fastify/static';
import fastifyCookie from '@fastify/cookie';
import mongoose from 'mongoose';

import cors from '@fastify/cors'
import fs from 'fs';

import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PassportConfig } from './config/passport.js';
import { createRequestHandler } from '@remix-run/node';
import type { ServerBuild } from '@remix-run/node';
import ScheduledEmailProcessor from './services/ScheduledEmailProcessor.js';

dotenv.config();

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure logs directory exists
const logsDir = path.join(__dirname, '/logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const server: FastifyInstance = fastify({
  trustProxy: true,
  logger: {
    level: "info",
    file: path.join(__dirname, '/logs/app.log')
  }
});
const MONGODB_URL = process.env.MONGODB_URL ?? "";
const BASE_PATH = process.env.BASE_PATH ?? "/api/v1";
const DATABASE_NAME = process.env.DATABASE_NAME ?? "";
const FRONTEND_URL = process.env.FRONTEND_URL ?? "http://localhost:5173";
const CRM_FRONTEND_URL = process.env.CRM_FRONTEND_URL ?? "http://localhost:5173";
const NODE_ENV = process.env.NODE_ENV ?? "development"

// ****************************************************** END OF TESTS ****************************************************** //
const connectToDatabase = async () => {
  try {
    if (MONGODB_URL === "" || !MONGODB_URL) throw new Error("MongoDb URL is undefined");

    // Connect Mongoose (needed for EmailTransportModel and ScheduledEmailModel)
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(MONGODB_URL);
    }

    const client = await mongodb.MongoClient.connect(MONGODB_URL);
    if (!client) throw new Error("Something went wrong while trying to connect to Mongodb");

    // Add mongodb plugin
    await server.register(fastifyMongodb, {
      forceClose: true,
      client: client
    });

    return server
  } catch (error: any) {
    server.log.error("An error occured trying to connect to mongodb");
    throw new Error(error?.message);
  }
}

export const startServer = async (server: FastifyInstance) => {
  try {
    if (BASE_PATH === "" || !BASE_PATH) throw new Error("Base path url is undefined");
    if (DATABASE_NAME === "" || !DATABASE_NAME) throw new Error("database name is undefined");

    const database = server.mongo.client.db(DATABASE_NAME);
    if (!database) throw new Error("Failed to load database");

    // Start scheduled email processor (uses database + cron job)
    const emailProcessor = new ScheduledEmailProcessor(server.log);
    emailProcessor.start();

    // Set up cookies
    await server.register(fastifyCookie, {
      secret: process.env.COOKIE_SECRET,
    });

    // Set up cors
    await server.register(cors, {
      origin: NODE_ENV === "development" ? true : [FRONTEND_URL, CRM_FRONTEND_URL],
      methods: ['GET', 'POST', 'DELETE', 'PUT'],
      allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'X-Requested-With', 'Accept', 'X-CSRF-Token'],
      credentials: true,
    })

    //Set up multipart for file processing
    await server.register(fastifyMultipart, {
      limits: {
        fileSize: 90 * 1024 * 1024, // 90MB file size limit
      },
    });

    //Set up secure session 
    // set up secure sessions for @fastify/passport to store data in
    server.register(fastifySecureSession, { key: fs.readFileSync(path.join(__dirname, 'secret-key')) })

    //Set up passport
    PassportConfig(server, database)

    //Set up rate limiting
    await server.register(fastifyRateLimit, {
      global: false,
      max: 100,
      timeWindow: 5 * 1000 * 60 //5 minutes 
    })

    // Register API routes
    await server.register((app, _, done) => initAppRoutes(app, database, done), {
      root: path.join(__dirname, 'public'),
      prefix: BASE_PATH,
    })

    // Serve static assets from Remix build (MUST be before Remix handler)
    // Root should be build/client (not build/client/assets) so /assets/* maps correctly
    const clientBuildPath = path.resolve(process.cwd(), 'build/client');

    // Check if client build exists
    if (!fs.existsSync(clientBuildPath)) {
      throw new Error(`Client build not found at ${clientBuildPath}. Run 'npm run build:client' first.`);
    }

    server.log.info(`Serving static files from: ${clientBuildPath}`);

    await server.register(fastifyStatic, {
      root: clientBuildPath,
      prefix: '/',
      wildcard: true,
      decorateReply: false,
    });

    // Load Remix server build
    const buildPath = path.resolve(process.cwd(), 'build/server/index.js');

    // Check if builds exist
    if (!fs.existsSync(buildPath)) {
      throw new Error(`Remix server build not found at ${buildPath}. Run 'npm run build:client' first.`);
    }

    if (!fs.existsSync(clientBuildPath)) {
      throw new Error(`Client build not found at ${clientBuildPath}. Run 'npm run build:client' first.`);
    }

    // Check build freshness - compare server and client build timestamps
    const serverBuildStats = fs.statSync(buildPath);
    const clientManifestPath = path.join(clientBuildPath, '.vite/manifest.json');

    if (fs.existsSync(clientManifestPath)) {
      const clientManifestStats = fs.statSync(clientManifestPath);
      if (clientManifestStats.mtime > serverBuildStats.mtime) {
        server.log.warn('⚠️  WARNING: Client build is newer than server build!');
        server.log.warn('⚠️  The server build may contain stale asset references.');
        server.log.warn('⚠️  Please rebuild: npm run build:client');
      }
    }

    server.log.info(`Loading Remix server build from: ${buildPath}`);
    server.log.info(`Server build timestamp: ${serverBuildStats.mtime.toISOString()}`);

    // Import the Remix server build
    // Note: ES modules cache imports, so server must restart after rebuilds
    // Use absolute path to ensure proper resolution
    const absoluteBuildPath = path.resolve(buildPath);
    // Use a timestamp to force Node to re-read the file from disk
    const buildUrl = `file://${absoluteBuildPath}?update=${Date.now()}`;
    const viteBuild = await import(buildUrl);
    // Remix build exports the build as a default or named export
    // Check what's actually exported
    const build = (viteBuild.default || viteBuild) as ServerBuild;

    if (!build || !build.assets) {
      server.log.error('Invalid Remix build - missing build.assets');
      throw new Error('Failed to load Remix server build - invalid build structure');
    }

    // Log some asset info for debugging
    const assetKeys = Object.keys(build.assets);
    const manifestAsset = assetKeys.find(key => key.includes('manifest'));
    server.log.info(`Remix build loaded successfully with ${assetKeys.length} assets`);
    if (manifestAsset) {
      server.log.info(`Manifest asset: ${manifestAsset}`);
    }

    // Create Remix request handler
    const remixHandler = createRequestHandler(build, NODE_ENV);

    // Handle all non-API routes with Remix SSR (catch-all, but after static files)
    // Use setNotFoundHandler - fastify-static will handle static files first
    server.setNotFoundHandler(async (request, reply) => {
      // Skip API routes
      if (request.url.startsWith(BASE_PATH)) {
        reply.code(404).send({ error: 'Not Found' });
        return;
      }

      // Skip static asset requests - they should be handled by fastifyStatic
      // If we reach here for /assets/*, it means the file doesn't exist
      if (request.url.startsWith('/assets/')) {
        server.log.warn(`Asset not found: ${request.url}`);
        reply.code(404).send({ error: 'Asset not found' });
        return;
      }

      // Convert Fastify request to Web Request
      const protocol = request.protocol || 'http';
      const host = request.headers.host || 'localhost:4000';
      const url = new URL(request.url, `${protocol}://${host}`);

      const headers = new Headers();
      Object.entries(request.headers).forEach(([key, value]) => {
        if (value) {
          headers.set(key, Array.isArray(value) ? value.join(', ') : value);
        }
      });

      const webRequest = new Request(url.toString(), {
        method: request.method,
        headers: headers,
        body: request.method !== 'GET' && request.method !== 'HEAD' && request.body
          ? JSON.stringify(request.body)
          : undefined,
      });

      try {
        const response = await remixHandler(webRequest);

        // Convert Web Response to Fastify reply
        reply.status(response.status);
        response.headers.forEach((value, key) => {
          reply.header(key, value);
        });

        const body = await response.text();
        reply.send(body);
      } catch (error: any) {
        server.log.error(error);
        reply.code(500).send({ error: error.message });
      }
    });

    return server;
  } catch (error: any) {
    server.log.error({ error })
    throw new Error(error.message)
  }
}

connectToDatabase() //Start the database
  .then((server) => startServer(server))  //Prepare the server
  .then((server) => { //Start listening
    server.listen({ port: 4000, host: NODE_ENV === "development" ? undefined : '0.0.0.0' }, (err, address) => {
      if (err) {
        server.log.error(err)
        process.exit(1);
      }
      server.log.info(`Server listening at ${address}`)
    })
  });


