import crypto from 'crypto';
import jwt, { SignOptions } from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET ?? "";

function generateCode(length: number): string {
  let code = '';
  let schema = '0123456789';

  for (let i = 0; i < length; i++) {
    code += schema.charAt(Math.floor(Math.random() * schema.length));
  }

  return code;
}

// Double signed-csrf token as per: https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html#pseudo-code-for-implementing-hmac-csrf-tokens
const getCSRFToken = async (authId: string): Promise<string> => {
  const secret = JWT_SECRET;
  const randomValue = getRandomValue(128);

  // Create the CSRF Token
  const message =
    authId.length + '!' + authId + '!' + randomValue.length + '!' + randomValue;
  const hmac = crypto
    .createHmac('SHA256', secret)
    .update(message)
    .digest('hex');
  const csrfToken = hmac + '.' + randomValue;

  return csrfToken;
};

const getRandomValue = (length: number): string => {
  let text = '';
  const possible =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

// Method to validate the CSRF Token
const validateCSRFToken = (csrfToken: string, authId: string): boolean => {
  const [hmac, randomValue] = csrfToken.split('.');
  const secret = JWT_SECRET;

  if (!hmac || !randomValue) {
    return false;
  }

  const message =
    authId.length + '!' + authId + '!' + randomValue.length + '!' + randomValue;
  const recomputedHmac = crypto
    .createHmac('SHA256', secret)
    .update(message)
    .digest('hex');

  if (recomputedHmac === hmac) {
    return true;
  }

  return false;
};

const generateToken = (userId: string, expires: string, grantType: string): string => {
  const payload = { userId, grantType, jti: crypto.randomUUID() };
  // expiresIn accepts string (e.g., "2h", "7d") or number (seconds)
  // Using type assertion to satisfy jsonwebtoken types
  return jwt.sign(payload, JWT_SECRET, { expiresIn: expires } as SignOptions);
};

const getExpiryTime = (expireAt: string): number => {
  const durationFormat = expireAt
    .charAt(expireAt.length - 1)
    .toLocaleLowerCase();
  const duration = parseInt(expireAt.substring(0, expireAt.length - 1));

  if (isNaN(duration)) {
    return 60 * 1000; // Default to 1 minute
  }

  switch (durationFormat) {
    case 's':
      return duration * 1000;
    case 'm':
      return 60 * duration * 1000;
    case 'h':
      return 60 * 60 * duration * 1000;
    case 'd':
      return 60 * 60 * 24 * duration * 1000;
    default:
      return 60 * 1000; // Default to 1 minute
  }
};

const verifyToken = (token: string): any | string => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error: any) {
    return error.message;
  }
};

export {
  generateCode,
  getCSRFToken,
  validateCSRFToken,
  generateToken,
  getExpiryTime,
  verifyToken
};

