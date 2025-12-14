import { User } from './user.model.js';
import { updateProfileSchema, createUserSchema, updateUserSchema } from './user.dto.js';
import bcrypt from 'bcryptjs';
export const updateProfile = async (req, res, next) => {
    try {
        if (!req.user)
            return res.status(401).json({ message: 'Unauthorized' });
        const data = updateProfileSchema.parse(req.body);
        const user = await User.findByIdAndUpdate(req.user._id, { $set: data }, { new: true, runValidators: true }).select('-passwordHash');
        if (!user)
            return res.status(404).json({ message: 'User not found' });
        res.status(200).json(user);
    }
    catch (error) {
        next(error);
    }
};
// Admin: Get all users
export const getUsers = async (req, res, next) => {
    try {
        const users = await User.find().select('-passwordHash').sort({ createdAt: -1 });
        res.status(200).json(users);
    }
    catch (error) {
        next(error);
    }
};
// Admin: Create User
export const createUser = async (req, res, next) => {
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
    }
    catch (error) {
        next(error);
    }
};
// Admin: Update User
export const updateUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        const data = updateUserSchema.parse(req.body);
        const user = await User.findByIdAndUpdate(id, { $set: data }, { new: true, runValidators: true }).select('-passwordHash');
        if (!user)
            return res.status(404).json({ message: 'User not found' });
        res.status(200).json(user);
    }
    catch (error) {
        next(error);
    }
};
// Admin: Delete User
export const deleteUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        const user = await User.findByIdAndDelete(id);
        if (!user)
            return res.status(404).json({ message: 'User not found' });
        res.status(200).json({ message: 'User deleted successfully' });
    }
    catch (error) {
        next(error);
    }
};
//# sourceMappingURL=user.controller.js.map