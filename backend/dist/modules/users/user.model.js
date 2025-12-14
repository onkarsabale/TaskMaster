import mongoose, { Schema, Document } from 'mongoose';
const userSchema = new Schema({
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
export const User = mongoose.model('User', userSchema);
//# sourceMappingURL=user.model.js.map