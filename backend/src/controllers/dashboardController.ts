import { Request, Response } from 'express';
import prisma from '../utils/prisma';

export const getStats = async (req: Request, res: Response) => {
  try {
    const [incidents, volunteers, resolved] = await Promise.all([
      prisma.incidentReport.count(),
      prisma.user.count({ where: { role: 'VOLUNTEER' } }),
      prisma.incidentReport.count({ where: { status: 'RESOLVED' } })
    ]);

    res.json({
      activeIncidents: incidents,
      verifiedVolunteers: volunteers,
      resolvedCases: resolved
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
};
