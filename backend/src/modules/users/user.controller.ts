import type { Request, Response, NextFunction } from 'express';
import { User } from './user.model.js';
import { updateProfileSchema, createUserSchema, updateUserSchema } from './user.dto.js';
import bcrypt from 'bcryptjs';

export const updateProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

        const data = updateProfileSchema.parse(req.body);

        const user = await User.findByIdAndUpdate(
            req.user._id,
            { $set: data },
            { new: true, runValidators: true }
        ).select('-passwordHash');

        if (!user) return res.status(404).json({ message: 'User not found' });

        res.status(200).json(user);
    } catch (error) {
        next(error);
    }
};

export const searchUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const query = req.query.q as string;
        const type = req.query.type as 'all' | 'email' | 'username' || 'all';

        if (!query) return res.json([]);

        // Dynamic import to avoid circular dependency issues if any, or just direct import if fine.
        // Importing here assuming repository is safe.
        const users = await import('./user.repository.js').then(r => r.findUsers(query, type));
        res.json(users);
    } catch (error) {
        next(error);
    }
};

// Admin: Get all users
export const getUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const users = await User.find().select('-passwordHash').sort({ createdAt: -1 });
        res.status(200).json(users);
    } catch (error) {
        next(error);
    }
};

// Admin: Create User
export const createUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = createUserSchema.parse(req.body);

        const existingUser = await User.findOne({ email: data.email });
        if (existingUser) {
            return res.status(400).json({ message: 'User with this email already exists' });
        }

        const { password, ...userData } = data;
        const passwordHash = await bcrypt.hash(password, 10);

        const user = new User({
            ...userData,
            passwordHash,
        });

        await user.save();

        // Remove passwordHash from response
        const userObj = user.toObject();
        // @ts-ignore
        delete userObj.passwordHash;

        res.status(201).json(userObj);
    } catch (error) {
        next(error);
    }
};

// Admin: Update User
export const updateUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const data = updateUserSchema.parse(req.body);

        const user = await User.findByIdAndUpdate(
            id,
            { $set: data },
            { new: true, runValidators: true }
        ).select('-passwordHash');

        if (!user) return res.status(404).json({ message: 'User not found' });

        res.status(200).json(user);
    } catch (error) {
        next(error);
    }
};

// Admin: Delete User
export const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const user = await User.findByIdAndDelete(id);

        if (!user) return res.status(404).json({ message: 'User not found' });

        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        next(error);
    }
};
