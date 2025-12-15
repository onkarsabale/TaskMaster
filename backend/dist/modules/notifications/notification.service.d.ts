import type { INotification } from './notification.model.js';
export declare const getUserNotifications: (userId: string) => Promise<(import("mongoose").Document<unknown, {}, INotification, {}, import("mongoose").DefaultSchemaOptions> & INotification & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
})[]>;
export declare const markAsRead: (id: string, userId: string) => Promise<(import("mongoose").Document<unknown, {}, INotification, {}, import("mongoose").DefaultSchemaOptions> & INotification & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}) | null>;
export declare const respondToInvite: (id: string, action: "accept" | "reject", userId: string) => Promise<(import("mongoose").Document<unknown, {}, INotification, {}, import("mongoose").DefaultSchemaOptions> & INotification & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}) | null>;
export declare const createNotification: (data: Partial<INotification>) => Promise<import("mongoose").Document<unknown, {}, INotification, {}, import("mongoose").DefaultSchemaOptions> & INotification & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}>;
//# sourceMappingURL=notification.service.d.ts.map