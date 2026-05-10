import { Request, Response } from 'express';
import prisma from '../utils/prisma';

export const getAlerts = async (req: Request, res: Response) => {
  try {
    const alerts = await prisma.alert.findMany({
      where: { active: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(alerts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch alerts' });
  }
};

export const getCamps = async (req: Request, res: Response) => {
  try {
    const camps = await prisma.reliefCamp.findMany({
      where: { status: 'OPEN' },
      orderBy: { currentOccupancy: 'desc' }
    });
    res.json(camps);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch camps' });
  }
};

export const getResources = async (req: Request, res: Response) => {
  try {
    const resources = await prisma.resource.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(resources);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch resources' });
  }
};
