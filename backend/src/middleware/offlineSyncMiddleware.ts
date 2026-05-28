import { Request, Response, NextFunction } from 'express';

export const offlineSyncMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (req.headers['x-offline-sync'] === 'true') {
    const originalTimestamp = req.headers['x-original-timestamp'];
    if (originalTimestamp) {
      // Preserve when the user actually submitted, not when it arrived
      req.body.offlineCreatedAt = originalTimestamp;
      req.body.wasOfflineSubmission = true;
    }
  }
  next();
};
