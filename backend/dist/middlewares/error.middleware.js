import { logger } from '../utils/logger.js';
export const errorHandler = (err, req, res, next) => {
    const statusCode = err.statusCode || (res.statusCode === 200 ? 500 : res.statusCode);
    const message = err.message;
    logger.error(`${statusCode} - ${message}`);
    res.status(statusCode).json({
        message: message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
};
//# sourceMappingURL=error.middleware.js.map