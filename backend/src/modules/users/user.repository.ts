import { User } from './user.model.js';
import type { IUser } from './user.model.js';

export const findUserById = async (id: string): Promise<IUser | null> => {
    return await User.findById(id).select('-passwordHash');
};

export const findUsers = async (query: string, field: 'all' | 'email' | 'username' = 'all'): Promise<IUser[]> => {
    let searchCriteria: any = {};

    const regex = new RegExp(`^${query}`, 'i'); // Starts with query

    if (field === 'email') {
        searchCriteria = { email: regex, role: { $ne: 'admin' } };
    } else if (field === 'username') {
        searchCriteria = { username: regex, role: { $ne: 'admin' } };
    } else {
        searchCriteria = {
            $or: [
                { username: regex },
                { email: regex }
            ],
            role: { $ne: 'admin' }
        };
    }

    return await User.find(searchCriteria).select('username email avatar _id').limit(10);
};
