import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
    username: string;
    email: string;
    passwordHash: string;
    role: 'user' | 'manager' | 'admin';
    avatar?: string;
    createdAt: Date;
    updatedAt: Date;
}

const userSchema = new Schema<IUser>({
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    role: {
        type: String,
        enum: ['user', 'manager', 'admin'],
        default: 'user',
    },
    avatar: { type: String, default: '' },
}, { timestamps: true });

export const User = mongoose.model<IUser>('User', userSchema);
