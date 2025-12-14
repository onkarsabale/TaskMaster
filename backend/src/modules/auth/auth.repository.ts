import { User } from '../users/user.model.js';
import type { IUser } from '../users/user.model.js';

export const findUserByEmail = async (email: string): Promise<IUser | null> => {
    return await User.findOne({ email });
};

export const createUser = async (username: string, email: string, passwordHash: string): Promise<IUser> => {
    return await User.create({ username, email, passwordHash });
};

export const findUserById = async (id: string): Promise<IUser | null> => {
    return await User.findById(id).select('-passwordHash');
};
