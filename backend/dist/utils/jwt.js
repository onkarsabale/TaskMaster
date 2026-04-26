import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
export const generateToken = (res, userId, role) => {
    const token = jwt.sign({ userId, role }, env.JWT_SECRET, {
        expiresIn: '30d',
    });
    // In production with cross-origin (frontend and backend on different domains),
    // we need sameSite: 'none' and secure: true for cookies to work
    const isProduction = env.NODE_ENV === 'production';
    // Still set cookie for same-domain or properly configured cross-domain
    res.cookie('jwt', token, {
        httpOnly: true,
        secure: isProduction, // true in production (HTTPS required)
        sameSite: isProduction ? 'none' : 'lax', // 'none' for cross-origin in production
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });
    // Return the token so it can be sent in response body as fallback
    return token;
};
//# sourceMappingURL=jwt.js.map