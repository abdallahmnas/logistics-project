import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../config/jwt';
import { User } from '../models';

// Extend Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

/**
 * Middleware to ensure the user is authenticated via JWT.
 * It checks the Authorization header for a Bearer token.
 */
export const requireAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    let token;

    // Check header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    if (!token) {
      res.status(401).json({ status: 'error', message: 'Not authorized, no token provided' });
      return;
    }

    const decoded = verifyToken(token);
    
    if (!decoded) {
      res.status(401).json({ status: 'error', message: 'Not authorized, token failed or expired' });
      return;
    }

    // Fetch user from DB (minus passwordHash) to ensure they still exist
    const user = await User.findByPk(decoded.id, {
      attributes: { exclude: ['passwordHash'] },
    });

    if (!user) {
      res.status(401).json({ status: 'error', message: 'User no longer exists' });
      return;
    }

    // Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth Middleware Error:', error);
    res.status(401).json({ status: 'error', message: 'Not authorized, token failed' });
    return;
  }
};

/**
 * Middleware to restrict access to specific roles.
 * Must be used AFTER requireAuth middleware.
 * 
 * @param roles Array of allowed roles
 */
export const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ status: 'error', message: 'Not authorized, user not found' });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({ 
        status: 'error', 
        message: 'Forbidden: You do not have permission to access this resource' 
      });
      return;
    }

    next();
  };
};

export const authenticate = requireAuth;
export const authorize = (...roles: string[]) => requireRole(roles);
