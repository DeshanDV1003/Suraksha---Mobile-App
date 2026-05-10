import { Request, Response } from 'express';
import prisma from '../utils/prisma';

export const getMyTokens = async (req: any, res: Response) => {
  try {
    const tokens = await prisma.reliefToken.findMany({
      where: { userId: req.user.userId },
      include: { claims: true },
      orderBy: { issuedAt: 'desc' }
    });
    res.json(tokens);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tokens' });
  }
};

export const getClaims = async (req: any, res: Response) => {
  try {
    const claims = await prisma.reliefTokenClaim.findMany({
      where: { token: { userId: req.user.userId } },
      orderBy: { claimedAt: 'desc' }
    });
    res.json(claims);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch claims' });
  }
};
