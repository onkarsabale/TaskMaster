import { User } from '../users/user.model.js';
export const findUserByEmail = async (email) => {
    return await User.findOne({ email });
};
export const createUser = async (username, email, passwordHash) => {
    return await User.create({ username, email, passwordHash });
};
export const findUserById = async (id) => {
    return await User.findById(id).select('-passwordHash');
};
//# sourceMappingURL=auth.repository.js.map