import type { INotification } from './notification.model.js';
import mongoose from 'mongoose';
export declare const createNotification: (data: Partial<INotification>) => Promise<mongoose.Document<unknown, {}, INotification, {}, mongoose.DefaultSchemaOptions> & INotification & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}>;
export declare const getUserNotifications: (userId: string) => Promise<(mongoose.Document<unknown, {}, INotification, {}, mongoose.DefaultSchemaOptions> & INotification & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
})[]>;
export declare const markAsRead: (id: string) => Promise<(mongoose.Document<unknown, {}, INotification, {}, mongoose.DefaultSchemaOptions> & INotification & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}) | null>;
export declare const updateStatus: (id: string, status: "accepted" | "rejected") => Promise<(mongoose.Document<unknown, {}, INotification, {}, mongoose.DefaultSchemaOptions> & INotification & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}) | null>;
export declare const findById: (id: string) => Promise<(mongoose.Document<unknown, {}, INotification, {}, mongoose.DefaultSchemaOptions> & INotification & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}) | null>;
export declare const deleteAll: (userId: string) => Promise<mongoose.mongo.DeleteResult>;
//# sourceMappingURL=notification.repository.d.ts.map