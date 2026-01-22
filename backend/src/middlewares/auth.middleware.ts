import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { User } from '../modules/users/user.model.js';
import { logger } from '../utils/logger.js';

export const protect = async (req: Request, res: Response, next: NextFunction) => {
    let token;

    token = req.cookies.jwt;

    // Debug logging for production cookie issues
    if (env.NODE_ENV === 'production') {
        logger.info(`[Auth] Cookies received: ${JSON.stringify(Object.keys(req.cookies || {}))}`);
        logger.info(`[Auth] JWT token present: ${!!token}`);
        logger.info(`[Auth] Origin: ${req.headers.origin || 'none'}`);
    }

    if (token) {
        try {
            const decoded: any = jwt.verify(token, env.JWT_SECRET);
            req.user = await User.findById(decoded.userId).select('-passwordHash');
            next();
        } catch (error) {
            logger.error(`[Auth] Token verification failed: ${error}`);
            res.status(401);
            next(new Error('Not authorized, token failed'));
        }
    } else {
        logger.warn(`[Auth] No token found in cookies`);
        res.status(401);
        next(new Error('Not authorized, no token'));
    }
};

export const authorize = (...roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (req.user && roles.includes(req.user.role)) {
            next();
        } else {
            res.status(403);
            throw new Error('Not authorized, invalid role');
        }
    };
};
