import { mongodb } from "@fastify/mongodb";
import { FastifyBaseLogger, FastifyInstance } from "fastify";
import { Document } from "mongoose";
import IService from "../interfaces/IService.js";

/**
 * Base route interface
 */
export default interface IRoute<T extends Document> {
  /**
   * Service class
   */
  service: IService<T>;

  /**
   * Fastify server instance
   */
  server: FastifyInstance;

  /**
   * Mongodb collection
   */
  collection: mongodb.Collection<T>;

  /**
   * Fastify Logger
   */
  logger: FastifyBaseLogger;

  /**
   * Route base path
   */
  basePath: string;

  /**
   * Initialzies all auth routes and regsiters them
   */
  initRoutes(): void
}