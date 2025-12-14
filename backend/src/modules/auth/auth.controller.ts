import type { Request, Response, NextFunction } from 'express';
import * as authService from './auth.service.js';
import { registerSchema, loginSchema } from './auth.dto.js';

export const register = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = registerSchema.parse(req.body);
        const user = await authService.register(res, data);
        res.status(201).json(user);
    } catch (error) {
        next(error);
    }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = loginSchema.parse(req.body);
        const user = await authService.login(res, data);
        res.status(200).json(user);
    } catch (error) {
        next(error);
    }
};

export const logout = (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = authService.logout(res);
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};

export const getMe = (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.user) return res.status(401).json({ message: 'Not authorized' });
        res.status(200).json({
            _id: req.user._id,
            username: req.user.username,
            email: req.user.email,
            role: req.user.role,
        });
    } catch (error) {
        next(error);
    }
};
