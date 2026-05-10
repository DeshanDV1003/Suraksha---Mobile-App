import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../utils/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, name, phone } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = await prisma.user.create({
      data: { 
        email, 
        password: hashedPassword, 
        name,
        phone,
        role: 'CITIZEN'
      }
    });

    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET);
    res.status(201).json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
  } catch (error) {
    res.status(500).json({ error: 'Registration failed' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET);
    res.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
};

export const getProfile = async (req: any, res: Response) => {
  try {
    const user = await prisma.user.findUnique({ 
      where: { id: req.user.userId },
      select: { id: true, email: true, name: true, role: true, phone: true, createdAt: true }
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
};

export const updatePushToken = async (req: any, res: Response) => {
  try {
    const { pushToken } = req.body;
    await prisma.user.update({
      where: { id: req.user.userId },
      data: { pushToken }
    });
    res.json({ message: 'Push token updated' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update push token' });
  }
};
