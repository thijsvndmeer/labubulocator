import { Request, Response, NextFunction } from 'express';

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Authentication token missing' });
  }

  if (token !== process.env.SECRET_TOKEN) {
    return res.status(403).json({ message: 'Invalid authentication token' });
  }

  next();
};