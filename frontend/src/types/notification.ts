
export interface Notification {
    _id: string;
    recipient: string;
    sender: {
        _id: string;
        username: string;
        avatar?: string;
    };
    type: 'PROJECT_INVITE' | 'INVITE_ACCEPTED' | 'GENERAL';
    relatedId?: string; // Project ID usually
    message: string;
    status: 'pending' | 'read' | 'accepted' | 'rejected';
    createdAt: string;
    updatedAt: string;
}
