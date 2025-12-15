import bcrypt from 'bcryptjs';
import * as authRepo from './auth.repository.js';
import { generateToken } from '../../utils/jwt.js';
import { AppError } from '../../utils/AppError.js';
export const register = async (res, data) => {
    const existingUser = await authRepo.findUserByEmail(data.email);
    if (existingUser) {
        throw new AppError('User already exists', 409);
    }
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(data.password, salt);
    const user = await authRepo.createUser(data.username, data.email, passwordHash);
    generateToken(res, user._id, user.role);
    return {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
    };
};
export const login = async (res, data) => {
    const user = await authRepo.findUserByEmail(data.email);
    if (!user || !(await bcrypt.compare(data.password, user.passwordHash))) {
        throw new AppError('Invalid email or password', 401);
    }
    generateToken(res, user._id, user.role);
    return {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
    };
};
export const logout = (res) => {
    res.cookie('jwt', '', {
        httpOnly: true,
        expires: new Date(0),
    });
    return { message: 'Logged out successfully' };
};
//# sourceMappingURL=auth.service.js.map