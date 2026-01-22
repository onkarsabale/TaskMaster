
export interface Notification {
    _id: string;
    recipient: string;
    sender: {
        _id: string;
        username: string;
        avatar?: string;
    };
    type: 'PROJECT_INVITE' | 'INVITE_ACCEPTED' | 'TASK_ASSIGNED' | 'GENERAL';
    relatedId?: string; // Project ID or Task ID
    message: string;
    isRead: boolean;
    status: 'pending' | 'accepted' | 'rejected' | 'none';
    createdAt: string;
    updatedAt: string;
}
