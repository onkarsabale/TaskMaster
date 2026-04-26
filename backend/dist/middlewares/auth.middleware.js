import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { User } from '../modules/users/user.model.js';
import { logger } from '../utils/logger.js';
export const protect = async (req, res, next) => {
    let token;
    // Try to get token from cookie first
    token = req.cookies.jwt;
    // If no cookie, try Authorization header (for cross-domain where cookies are blocked)
    if (!token && req.headers.authorization?.startsWith('Bearer ')) {
        token = req.headers.authorization.split(' ')[1];
        logger.info('[Auth] Using Authorization header token');
    }
    // Debug logging for production
    if (env.NODE_ENV === 'production') {
        logger.info(`[Auth] Cookies received: ${JSON.stringify(Object.keys(req.cookies || {}))}`);
        logger.info(`[Auth] JWT token present: ${!!token}`);
        logger.info(`[Auth] Auth header: ${req.headers.authorization ? 'present' : 'none'}`);
        logger.info(`[Auth] Origin: ${req.headers.origin || 'none'}`);
    }
    if (token) {
        try {
            const decoded = jwt.verify(token, env.JWT_SECRET);
            req.user = await User.findById(decoded.userId).select('-passwordHash');
            next();
        }
        catch (error) {
            logger.error(`[Auth] Token verification failed: ${error}`);
            res.status(401);
            next(new Error('Not authorized, token failed'));
        }
    }
    else {
        logger.warn(`[Auth] No token found in cookies or headers`);
        res.status(401);
        next(new Error('Not authorized, no token'));
    }
};
export const authorize = (...roles) => {
    return (req, res, next) => {
        if (req.user && roles.includes(req.user.role)) {
            next();
        }
        else {
            res.status(403);
            throw new Error('Not authorized, invalid role');
        }
    };
};
//# sourceMappingURL=auth.middleware.js.map