import { FastifyRequest, FastifyReply } from 'fastify';
import { mongodb, ObjectId } from '@fastify/mongodb';
import { verifyToken, validateCSRFToken, generateToken, getExpiryTime } from '../util/generateCode.js';
import { AuthCodeDocument } from '../schema/authCode.js';
import { UserDocument } from '../schema/user.js';
import dotenv from 'dotenv';
dotenv.config();

const NODE_ENV = process.env.NODE_ENV ?? 'development';
const isDev = NODE_ENV === 'development';

/**
 * Factory function to create protectMiddleware with injected database collections
 * @param authCodeCollection MongoDB collection for auth codes
 * @param userCollection MongoDB collection for users
 * @returns Middleware function
 */
export const createProtectMiddleware = (
  authCodeCollection: mongodb.Collection<AuthCodeDocument>,
  userCollection: mongodb.Collection<UserDocument>
) => {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const { accessToken, csrf_token, refreshToken } = request.cookies || {};
    const csrfTokenFromHeader = request.headers['x-csrf-token'] as string;
    try {
      // Basic validations
      if (!accessToken) throw new Error('Unauthorized. Please login again.');
      if (!csrf_token) throw new Error('Unauthorized. Please login again.');
      if (!csrfTokenFromHeader) throw new Error('Unauthorized. CSRF token missing from header.');

      // Verify tokens
      const isATVerified: any = verifyToken(accessToken);
      const isRTVerified: any = verifyToken(refreshToken || '');

      // Determine userId and find userAuth
      let userId: string;

      // SECURITY FIX: Extract userId from verified JWT token, NOT from user input
      if (isATVerified && typeof isATVerified === 'object' && isATVerified.userId) {
        // Access token is valid - use userId from it
        userId = isATVerified.userId;
      } else if (isRTVerified && typeof isRTVerified === 'object' && isRTVerified.userId) {
        // Access token expired but refresh token is valid - use userId from refresh token
        userId = isRTVerified.userId;
      } else {
        // Both tokens invalid or expired - cannot proceed
        throw new Error('Invalid or expired tokens. Please login again.');
      }

      // Find user auth code using native MongoDB driver
      const userAuthcode = await authCodeCollection
        .find({ userId })
        .sort({ updatedAt: -1 })
        .limit(1)
        .toArray();

      if (!userAuthcode || userAuthcode.length === 0) {
        throw new Error('Unauthorized access. Authorization not found');
      }

      const userAuth = userAuthcode[0];

      // DOUBLE CSRF TOKEN VERIFICATION:
      // 1. Verify CSRF token from header (from localStorage) matches the authId
      // 2. Verify CSRF token from cookie matches the authId
      // 3. Both tokens must be valid and match each other
      const isValidatedHeader = validateCSRFToken(
        csrfTokenFromHeader?.toString() || '',
        userAuth._id.toString()
      );
      const isValidatedCookie = validateCSRFToken(
        csrf_token?.toString() || '',
        userAuth._id.toString()
      );

      if (!isValidatedHeader || !isValidatedCookie) {
        throw new Error('Unauthorized access. Invalid CSRF token.');
      }

      // Both tokens must match (double verification)
      if (csrfTokenFromHeader !== csrf_token) {
        throw new Error('Unauthorized access. CSRF token mismatch.');
      }

      // Token verification cases
      if (typeof isATVerified === 'string' && typeof isRTVerified === 'string') {
        // Case 1: Both tokens expired
        if (userAuth.refreshToken.code !== refreshToken) {
          throw new Error('Invalid refresh token');
        }
        await fetchNewRefreshToken(userAuth, request, reply, authCodeCollection);
        // After refreshing, get userId from userAuth
        userId = userAuth.userId;
      } else if (isATVerified && typeof isATVerified === 'object' && typeof isRTVerified === 'string') {
        // Case 2: Valid AT, expired RT
        await fetchNewRefreshToken(userAuth, request, reply, authCodeCollection);
      } else if (typeof isATVerified === 'string' && isRTVerified && typeof isRTVerified === 'object') {
        // Case 3: Expired AT, valid RT
        if (userAuth.refreshToken.code !== refreshToken) {
          throw new Error('Invalid refresh token');
        }
        await refreshAccessToken(userAuth, request, reply);
      } else if (isATVerified && typeof isATVerified === 'object' && isRTVerified && typeof isRTVerified === 'object') {
        // Case 4: Both tokens valid
        if (!isATVerified.userId || !isRTVerified.userId) {
          throw new Error('Unauthorized access');
        }
      } else {
        throw new Error('Invalid token state');
      }

      // Final user authorization - use userId from verified token
      const authorizedUser = await userCollection.findOne({ authId: userId });

      if (!authorizedUser) {
        throw new Error('User not found');
      }

      // Attach user to request for use in route handlers
      (request as any).user = authorizedUser;
    } catch (error: any) {
      reply.code(401).send({ success: false, error: error.message });
      return;
    }
  };
};

async function fetchNewRefreshToken(
  userAuth: AuthCodeDocument,
  request: FastifyRequest,
  reply: FastifyReply,
  authCodeCollection: mongodb.Collection<AuthCodeDocument>
) {
  const { refreshToken } = request.cookies || {};

  try {
    // Generate new tokens
    const newRefreshToken = generateToken(
      userAuth.userId,
      '7d',
      'refreshToken'
    );
    const newAccessToken = generateToken(
      userAuth.userId,
      '15m',
      'accessToken'
    );

    // Update userAuth with new tokens and expiry date
    const rtExpiresAt = new Date(Date.now() + getExpiryTime('7d')); // 7 days expiry

    await authCodeCollection.updateOne(
      { _id: userAuth._id },
      {
        $set: {
          refreshToken: { code: newRefreshToken, expiryDate: rtExpiresAt },
          updatedAt: new Date()
        }
      }
    );

    const cookieOptions = {
      httpOnly: true,
      maxAge: getExpiryTime('365d'),
      sameSite: 'lax' as const,
      secure: !isDev,
      path: '/'
    };

    // Set tokens as cookies
    reply.setCookie('accessToken', newAccessToken, cookieOptions)
      .setCookie('refreshToken', newRefreshToken, cookieOptions);
  } catch (error) {
    throw new Error('Failed to fetch new refresh token');
  }
}

async function refreshAccessToken(userAuth: AuthCodeDocument, request: FastifyRequest, reply: FastifyReply) {
  try {
    // Generate a new access token
    const newAccessToken = generateToken(userAuth.userId, '15m', 'accessToken');
    const cookieOptions = {
      httpOnly: true,
      maxAge: getExpiryTime('365d'),
      sameSite: 'lax' as const,
      secure: !isDev,
      path: '/'
    };

    reply.setCookie('accessToken', newAccessToken, cookieOptions);
  } catch (error) {
    throw new Error('Failed to refresh access token');
  }
}

// Export default middleware factory for backward compatibility (will be updated in routes)
export const protectMiddleware = createProtectMiddleware;

