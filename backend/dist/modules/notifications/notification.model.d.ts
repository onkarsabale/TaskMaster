import mongoose, { Document } from 'mongoose';
export interface INotification extends Document {
    recipient: mongoose.Types.ObjectId;
    sender: mongoose.Types.ObjectId;
    type: 'PROJECT_INVITE' | 'INVITE_ACCEPTED' | 'TASK_ASSIGNED' | 'GENERAL';
    relatedId?: mongoose.Types.ObjectId;
    message: string;
    isRead: boolean;
    status: 'pending' | 'accepted' | 'rejected' | 'none';
    createdAt: Date;
}
export declare const Notification: mongoose.Model<INotification, {}, {}, {}, mongoose.Document<unknown, {}, INotification, {}, mongoose.DefaultSchemaOptions> & INotification & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any, INotification>;
//# sourceMappingURL=notification.model.d.ts.map