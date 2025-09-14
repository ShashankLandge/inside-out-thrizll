import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export function signJwt(payload: object, expiresIn = '7d') {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn });
}

export function verifyJwt<T = any>(token: string): T {
  return jwt.verify(token, env.JWT_SECRET) as T;
}
