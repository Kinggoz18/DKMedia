import { mongodb, ObjectId } from "@fastify/mongodb";
import { FastifyBaseLogger, FastifyReply, FastifyRequest } from "fastify";
import { IReplyType } from "../interfaces/IReply.js";
import IService from "../interfaces/IService.js";
import { AuthSessionDocument, UserDocument, UserModel } from "../schema/user.js";
import { RequestQueryValidationType } from "../types/RequestQuery.type.js";
import dotenv from 'dotenv';
import { AuthCallbackValidationType } from "../types/userAuth.js";
import { ReplyError } from "../interfaces/ReplyError.js";
import { createHmac } from 'crypto';
import { generateToken, getCSRFToken, getExpiryTime } from '../util/generateCode.js';
import { AuthCodeDocument } from '../schema/authCode.js';

dotenv.config();
const CRM_FRONTEND_URL = process.env.CRM_FRONTEND_URL ?? "";
const SIGNUP_SECRET = process.env.SIGNUP_SECRET ?? "";
const SIGNUP_CODE_HASHED = process.env.SIGNUP_CODE_HASHED ?? "";
const NODE_ENV = process.env.NODE_ENV ?? 'development';
const isDev = NODE_ENV === 'development';

export class UserService implements IService<UserDocument> {
  dbModel = UserModel;
  dbCollection: mongodb.Collection<UserDocument>;
  logger: FastifyBaseLogger;
  private authSessionCollection: mongodb.Collection<AuthSessionDocument>;
  private authCodeCollection: mongodb.Collection<AuthCodeDocument>;

  constructor(
    dbCollection: mongodb.Collection<UserDocument>,
    logger: FastifyBaseLogger,
    authSessionCollection: mongodb.Collection<AuthSessionDocument>,
    authCodeCollection: mongodb.Collection<AuthCodeDocument>
  ) {
    this.dbCollection = dbCollection;
    this.authSessionCollection = authSessionCollection;
    this.authCodeCollection = authCodeCollection;
    this.logger = logger;

    if (!dbCollection) throw new Error("Failed to load user collection");
  }

  googleAuthHandler = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { userId, mode, erroMessage } = request.user as AuthCallbackValidationType;

      if (!userId || erroMessage) {
        return reply.redirect(`${CRM_FRONTEND_URL}/auth?errorMsg="${erroMessage}"`);
      }

      // Generate tokens for the authenticated user
      const accessToken = generateToken(userId, '15m', 'accessToken'); // Expires in 15m

      let csrfToken: string;
      let refreshToken: string;
      let rtExpiresAt: Date;

      // Fetch the most recently updated AuthCode using native MongoDB driver
      const mostRecentAuthCodes = await this.authCodeCollection
        .find({ userId })
        .sort({ updatedAt: -1 })
        .limit(1)
        .toArray();

      const mostRecentAuthCode = mostRecentAuthCodes.length > 0 ? mostRecentAuthCodes[0] : null;

      // If the user already has a login session, reuse refresh token
      if (mostRecentAuthCode) {
        this.logger.debug('Already logged in. Generating new access and CSRF token.');

        refreshToken = mostRecentAuthCode.refreshToken?.code;
        rtExpiresAt = mostRecentAuthCode.refreshToken?.expiryDate;
        csrfToken = await getCSRFToken(mostRecentAuthCode._id.toString());
      } else {
        // First time login - create new refresh token and auth code
        this.logger.debug('Not logged in. Generating both CSRF token and refresh token');

        refreshToken = generateToken(userId, '7d', 'refreshToken');
        rtExpiresAt = new Date(Date.now() + getExpiryTime('7d'));

        const newAuthCode = {
          userId: userId,
          refreshToken: { code: refreshToken, expiryDate: rtExpiresAt }
        };

        const insertResult = await this.authCodeCollection.insertOne(newAuthCode as AuthCodeDocument);
        if (!insertResult.insertedId) {
          throw new Error('Failed to create auth code');
        }

        const userAuth = await this.authCodeCollection.findOne({ _id: insertResult.insertedId });
        if (!userAuth) {
          throw new Error('Failed to retrieve created auth code');
        }

        csrfToken = await getCSRFToken(userAuth._id.toString());
      }

      // Cookie options
      const cookieOptions = {
        httpOnly: true,
        maxAge: getExpiryTime('365d'),
        sameSite: 'lax' as const,
        secure: !isDev,
        path: '/'
      };


      this.logger.debug('Auth codes created and cookies set');

      // Set cookies with tokens
      reply.setCookie('accessToken', accessToken, cookieOptions)
        .setCookie('csrf_token', csrfToken, cookieOptions)
        .setCookie('refreshToken', refreshToken, cookieOptions)
        .redirect(`${CRM_FRONTEND_URL}/auth?authId=${userId}&token=${csrfToken}`);

    } catch (error: any) {
      request.log.error(error?.message)
      return reply.redirect(`${CRM_FRONTEND_URL}/auth?errorMsg="${error?.message}"`);
    }
  };

  deleteUser = async (request: FastifyRequest, reply: FastifyReply) => {
    return 'delete user route'
  }

  getUser = async (request: FastifyRequest<{ Params: RequestQueryValidationType }>, reply: FastifyReply<{ Reply: IReplyType }>) => {
    const { id } = request.params;
    try {
      const { id } = request.params;
      const user = await this.dbCollection.findOne({ authId: id });

      if (!user) {
        throw new ReplyError("Failed to get user", 400);
      }

      return reply.code(200).send({ data: user, success: true })
    } catch (error: any) {
      request.log.error(error?.message)
      if (error instanceof ReplyError)
        return reply.status(error.code).send({ success: false, data: error.message });
      else return reply.status(500).send({ success: false, data: "Sorry, something went wrong" })
    }
  }

  authenticateSignupCode = async (request: FastifyRequest<{ Body: { code: string } }>, reply: FastifyReply<{ Reply: IReplyType }>) => {
    try {
      const { code } = request.body;
      if (!code || SIGNUP_SECRET === "") {
        throw new ReplyError("Signup code is missing", 400);
      }

      //Veirfy the code
      const hashedCode = this.createHash(code, SIGNUP_SECRET);

      if (hashedCode != SIGNUP_CODE_HASHED) {
        throw new ReplyError("Unathorized access", 400);
      }

      //Create the auth session
      const currentDate = new Date();  // Get the current date and time
      const expires = new Date(currentDate.getTime() + 5 * 60 * 1000);  // Add 5 minutes

      // Use plain object type instead of Document type to avoid Mongoose method conflicts
      const newAuthSession = {
        expires: expires,
      };

      const insertResult = await this.authSessionCollection.insertOne(newAuthSession as AuthSessionDocument);
      if (!insertResult.insertedId) {
        throw new ReplyError("Failed to create auth session", 400);
      }

      return reply.code(200).send({ data: insertResult.insertedId.toString(), success: true })
    } catch (error: any) {
      request.log.error(error?.message)
      if (error instanceof ReplyError)
        return reply.status(error.code).send({ success: false, data: error.message });
      else return reply.status(500).send({ success: false, data: "Sorry, something went wrong" })
    }
  }

  logoutUser = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      request.session.delete()
      return reply.send({ success: true, data: "logged out" });
    } catch (error: any) {
      request.log.error(error?.message)
      return reply.status(500).send({ success: false, data: "Sorry, something went wrong" })
    }
  }

  /**
   * Confirm authorized user endpoint - checks if user's tokens are valid
   * Used by CMS sections to verify authorization on navigation
   */
  confirmAuthorizedUser = async (request: FastifyRequest, reply: FastifyReply<{ Reply: IReplyType }>) => {
    try {
      // Check if user is attached to request (set by protectMiddleware)
      const user = (request as any).user;

      if (!user) {
        return reply.code(401).send({
          success: false,
          data: "Unauthorized. Please login again."
        });
      }

      // User is authorized
      return reply.code(200).send({
        success: true,
        data: {
          _id: user._id,
          authId: user.authId,
          displayName: user.displayName,
          email: user.email
        }
      });
    } catch (error: any) {
      request.log.error(error?.message);
      return reply.code(401).send({
        success: false,
        data: "Unauthorized. Please login again."
      });
    }
  }

  private createHash(code: string, secretKey: string) {
    return createHmac("sha256", secretKey)
      .update(code)
      .digest("hex");
  }
}