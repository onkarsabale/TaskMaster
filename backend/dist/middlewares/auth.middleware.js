import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { User } from '../modules/users/user.model.js';
export const protect = async (req, res, next) => {
    let token;
    token = req.cookies.jwt;
    if (token) {
        try {
            const decoded = jwt.verify(token, env.JWT_SECRET);
            req.user = await User.findById(decoded.userId).select('-passwordHash');
            next();
        }
        catch (error) {
            res.status(401);
            next(new Error('Not authorized, token failed'));
        }
    }
    else {
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