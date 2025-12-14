import type { Request, Response, NextFunction } from 'express';
import { User } from './user.model.js';
import { updateProfileSchema } from './user.dto.js';

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
