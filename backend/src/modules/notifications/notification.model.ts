import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
    recipient: mongoose.Types.ObjectId;
    sender: mongoose.Types.ObjectId;
    type: 'PROJECT_INVITE' | 'INVITE_ACCEPTED' | 'GENERAL';
    relatedId?: mongoose.Types.ObjectId; // E.g., Project ID
    message: string;
    isRead: boolean;
    status: 'pending' | 'accepted' | 'rejected' | 'none'; // 'none' for general notifications
    createdAt: Date;
}

const notificationSchema = new Schema<INotification>({
    recipient: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['PROJECT_INVITE', 'INVITE_ACCEPTED', 'GENERAL'], required: true },
    relatedId: { type: Schema.Types.ObjectId, ref: 'Project' }, // Can be generic, but mainly for Project now
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    status: { type: String, enum: ['pending', 'accepted', 'rejected', 'none'], default: 'none' },
}, { timestamps: true });

export const Notification = mongoose.model<INotification>('Notification', notificationSchema);
