import api from './client';
import type { LoginDto, RegisterDto } from '../types/auth'; // Will define types inline or separately
import type { User } from '../types/user';

export const login = async (data: LoginDto) => {
    const response = await api.post('/auth/login', data);
    return response.data;
};

export const register = async (data: RegisterDto) => {
    const response = await api.post('/auth/register', data);
    return response.data;
};

export const logout = async (): Promise<void> => {
    await api.post('/auth/logout');
};

export const updateProfile = async (data: { username?: string; avatar?: string }): Promise<User> => {
    const response = await api.patch<User>('/users/profile', data);
    return response.data;
};

export const getMe = async () => {
    const response = await api.get('/auth/me');
    return response.data;
};
