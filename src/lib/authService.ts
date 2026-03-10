import api from '@/lib/api';
import { ILoginInput, ISignUpInput, IUser, IAuthResponse } from '@/types';

// ─── Sign Up ──────────────────────────────────────────────────────────────────
export const signUp = async (data: ISignUpInput): Promise<void> => {
    await api.post('/auth/signup', data);
};

// ─── Login ──────────────────────────────────────────────────────────────────
export const login = async (data: ILoginInput): Promise<IAuthResponse['data']> => {
    const response = await api.post<IAuthResponse>('/auth/login', data);
    return response.data.data;
};

// ─── Get My Profile ──────────────────────────────────────────────────────────────────
export const getMe = async (): Promise<IUser> => {
    const response = await api.get<{ success: boolean; data: IUser }>('/auth/me');
    return response.data.data;
};