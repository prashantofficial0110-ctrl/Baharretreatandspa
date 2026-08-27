import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';
import { db } from './db.js';

const JWT_SECRET = process.env.ADMIN_JWT_SECRET || 'bahar-retreat-spa-secure-token-secret-2026';

export interface TokenPayload {
  userId: string;
  username: string;
  role: string;
  exp: number;
}

export function generateAuthToken(payload: Omit<TokenPayload, 'exp'>, expiresInHours = 24): string {
  const exp = Math.floor(Date.now() / 1000) + expiresInHours * 3600;
  const data: TokenPayload = { ...payload, exp };
  const encodedPayload = Buffer.from(JSON.stringify(data)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(encodedPayload)
    .digest('base64url');
  return `${encodedPayload}.${signature}`;
}

export function verifyAuthToken(token: string): TokenPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 2) return null;

    const [encodedPayload, signature] = parts;
    const expectedSig = crypto
      .createHmac('sha256', JWT_SECRET)
      .update(encodedPayload)
      .digest('base64url');

    if (signature !== expectedSig) return null;

    const decodedStr = Buffer.from(encodedPayload, 'base64url').toString('utf-8');
    const payload: TokenPayload = JSON.parse(decodedStr);

    if (payload.exp < Math.floor(Date.now() / 1000)) {
      return null; // Expired
    }

    return payload;
  } catch (err) {
    return null;
  }
}

export interface AuthenticatedRequest extends Request {
  user?: TokenPayload;
}

export function requireAdminAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'Unauthorized: Authentication required.' });
  }

  const token = authHeader.substring(7).trim();
  const payload = verifyAuthToken(token);

  if (!payload) {
    return res.status(401).json({ success: false, error: 'Invalid or expired session token. Please log in again.' });
  }

  const user = db.getAdminById(payload.userId);
  if (!user) {
    return res.status(401).json({ success: false, error: 'User account no longer exists.' });
  }

  req.user = payload;
  next();
}
