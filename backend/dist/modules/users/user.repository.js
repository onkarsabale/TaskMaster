import { User } from './user.model.js';
export const findUserById = async (id) => {
    return await User.findById(id).select('-passwordHash');
};
export const findUsers = async (query, field = 'all') => {
    let searchCriteria = {};
    const regex = new RegExp(`^${query}`, 'i'); // Starts with query
    if (field === 'email') {
        searchCriteria = { email: regex, role: { $ne: 'admin' } };
    }
    else if (field === 'username') {
        searchCriteria = { username: regex, role: { $ne: 'admin' } };
    }
    else {
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
//# sourceMappingURL=user.repository.js.map