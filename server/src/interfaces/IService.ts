import { mongodb } from "@fastify/mongodb";
import { FastifyBaseLogger } from "fastify";
import { Document, Model } from "mongoose";

/**
 * Default service interface
 */
export default interface IService<T extends Document> {
  /**
   * Used for validation
   */
  dbModel: Model<T>

  /**
   * Used to communicate with the database
   */
  dbCollection: mongodb.Collection<T>

  /**
   * Used to log
   */
  logger: FastifyBaseLogger
}