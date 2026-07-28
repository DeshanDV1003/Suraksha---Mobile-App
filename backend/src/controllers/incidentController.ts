import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { broadcastNotification } from '../utils/notificationService';

export const createReport = async (req: any, res: Response) => {
  try {
    const { title, description, location, latitude, longitude, category } = req.body;
    
    const report = await prisma.incidentReport.create({
      data: {
        title,
        description,
        location,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        category,
        images: [],
        reporterId: req.user.userId,
        createdAt: req.body.offlineCreatedAt ? new Date(req.body.offlineCreatedAt) : new Date()
      }
    });

    // Notify via socket (handled in index.ts)
    const io = req.app.get('socketio');
    if (io) io.emit('new-incident', {
      ...report,
      wasOffline: req.body.wasOfflineSubmission || false,
      originalTime: report.createdAt
    });

    // Broadcast Push Notification for high severity
    const users = await prisma.user.findMany({
      where: { pushToken: { not: null } },
      select: { pushToken: true }
    });
    const tokens = users.map((u: any) => u.pushToken as string).filter((t: any) => t);
    
    if (tokens.length > 0) {
      broadcastNotification(
        tokens, 
        `🚨 New ${category} Alert`, 
        `${title} reported at ${location}.`
      );
    }

    res.status(201).json(report);
  } catch (error: any) {
    console.error('[createReport] Error:', error?.message || error);
    res.status(500).json({ error: error?.message || 'Failed to create report' });
  }
};

export const getMyReports = async (req: any, res: Response) => {
  try {
    const reports = await prisma.incidentReport.findMany({
      where: { reporterId: req.user.userId },
      orderBy: { createdAt: 'desc' }
    });
    res.json(reports);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
};

export const getAllIncidents = async (req: Request, res: Response) => {
  try {
    const incidents = await prisma.incidentReport.findMany({
      take: 20,
      orderBy: { createdAt: 'desc' },
      include: { reporter: { select: { name: true } } }
    });
    res.json(incidents);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch incidents' });
  }
};
