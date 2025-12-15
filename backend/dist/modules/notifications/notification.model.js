import mongoose, { Schema, Document } from 'mongoose';
const notificationSchema = new Schema({
    recipient: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['PROJECT_INVITE', 'INVITE_ACCEPTED', 'GENERAL'], required: true },
    relatedId: { type: Schema.Types.ObjectId, ref: 'Project' }, // Can be generic, but mainly for Project now
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    status: { type: String, enum: ['pending', 'accepted', 'rejected', 'none'], default: 'none' },
}, { timestamps: true });
export const Notification = mongoose.model('Notification', notificationSchema);
//# sourceMappingURL=notification.model.js.map