import { Request, Response } from 'express';
import prisma from '../utils/prisma';

export const getMyTasks = async (req: any, res: Response) => {
  try {
    const tasks = await prisma.task.findMany({
      where: { assignedToId: req.user.userId },
      include: { incident: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
};

export const updateTaskStatus = async (req: any, res: Response) => {
  try {
    const { taskId, status } = req.body;
    const task = await prisma.task.update({
      where: { id: taskId },
      data: { status: status as any }
    });
    res.json(task);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update task status' });
  }
};

export const getVolunteerProfile = async (req: any, res: Response) => {
  try {
    const profile = await prisma.volunteerProfile.findUnique({
      where: { userId: req.user.userId }
    });
    res.json(profile);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch volunteer profile' });
  }
};
