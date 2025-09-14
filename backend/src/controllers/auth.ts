import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../db/client';
import { signJwt } from '../utils/jwt';

export async function register(req: Request, res: Response) {
  const { name, email, password, age, location } = req.body || {};
  if (!name || !email || !password) return res.status(400).json({ error: 'name, email, password required' });

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return res.status(409).json({ error: 'Email already in use' });

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { name, email, passwordHash, age: age ? Number(age) : null, location }
  });

  const token = signJwt({ userId: user.id });
  return res.json({ token, user: { id: user.id, name: user.name, age: user.age, location: user.location, email: user.email } });
}

export async function login(req: Request, res: Response) {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'email, password required' });

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.passwordHash) return res.status(401).json({ error: 'Invalid credentials' });

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

  const token = signJwt({ userId: user.id });
  return res.json({ token, user: { id: user.id, name: user.name, age: user.age, location: user.location, email: user.email } });
}
