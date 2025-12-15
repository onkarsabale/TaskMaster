import { User } from './user.model.js';
export const findUserById = async (id) => {
    return await User.findById(id).select('-passwordHash');
};
export const findUsers = async (query, field = 'all') => {
    let searchCriteria = {};
    if (field === 'email') {
        searchCriteria = { email: { $regex: query, $options: 'i' } };
    }
    else if (field === 'username') {
        searchCriteria = { username: { $regex: query, $options: 'i' } };
    }
    else {
        searchCriteria = {
            $or: [
                { username: { $regex: query, $options: 'i' } },
                { email: { $regex: query, $options: 'i' } }
            ]
        };
    }
    return await User.find(searchCriteria).select('username email avatar _id').limit(10);
};
//# sourceMappingURL=user.repository.js.map