export interface User {
    _id: string;
    username: string;
    email: string;
    role: 'admin' | 'manager' | 'user';
    avatar?: string;
}
