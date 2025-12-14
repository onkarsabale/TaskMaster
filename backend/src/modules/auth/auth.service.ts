import bcrypt from 'bcryptjs';
import type { Response } from 'express';
import * as authRepo from './auth.repository.js';
import type { RegisterDto, LoginDto } from './auth.dto.js';
import { generateToken } from '../../utils/jwt.js';

export const register = async (res: Response, data: RegisterDto) => {
    const existingUser = await authRepo.findUserByEmail(data.email);
    if (existingUser) {
        throw new Error('User already exists');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(data.password, salt);

    const user = await authRepo.createUser(data.username, data.email, passwordHash);
    generateToken(res, (user._id as unknown) as string, user.role);

    return {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
    };
};

export const login = async (res: Response, data: LoginDto) => {
    const user = await authRepo.findUserByEmail(data.email);

    if (!user || !(await bcrypt.compare(data.password, user.passwordHash))) {
        throw new Error('Invalid email or password');
    }

    generateToken(res, (user._id as unknown) as string, user.role);

    return {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
    };
};

export const logout = (res: Response) => {
    res.cookie('jwt', '', {
        httpOnly: true,
        expires: new Date(0),
    });
    return { message: 'Logged out successfully' };
};
