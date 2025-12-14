import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
export const generateToken = (res, userId, role) => {
    const token = jwt.sign({ userId, role }, env.JWT_SECRET, {
        expiresIn: '30d',
    });
    res.cookie('jwt', token, {
        httpOnly: true,
        secure: env.NODE_ENV !== 'development',
        sameSite: 'strict',
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });
};
//# sourceMappingURL=jwt.js.map