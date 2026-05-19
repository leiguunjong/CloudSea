import { createHttpClient } from '../utils/http';
import * as SecureStore from 'expo-secure-store';

const BASE_URL = 'http://172.31.2.185:3000';

export const api = createHttpClient(BASE_URL);

api.addRequestInterceptor(async (config) => {
  try {
    const token = await SecureStore.getItemAsync('auth_token');
    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
    }
  } catch {
    // token not available
  }
  return config;
});

export interface RegisterResponse {
  access_token: string;
  cloudseaId: string;
  welcome: string;
}

export interface AuthResponse {
  access_token: string;
  isNewUser: boolean;
  cloudseaId?: string;
  username?: string | null;
  welcome?: string;
  phone?: string | null;
  email?: string | null;
  gender?: string | null;
  birthday?: string | null;
  avatar?: string | null;
  coverImage?: string | null;
}

export function isPhone(target: string): boolean {
  return /^1[3-9]\d{9}$/.test(target);
}

export const authApi = {
  sendCode(account: string) {
    const type = isPhone(account) ? 'phone' : 'email';
    return api.post('/auth/send-code', { type, target: account });
  },

  register(account: string, code: string) {
    const type = isPhone(account) ? 'phone' : 'email';
    return api.post<RegisterResponse>('/auth/register', {
      type,
      target: account,
      code,
    });
  },

  login(account: string, code: string) {
    const type = isPhone(account) ? 'phone' : 'email';
    return api.post<AuthResponse>('/auth/login', {
      type,
      account,
      code,
    });
  },

  getProfile() {
    return api.get<{
      id: string;
      cloudseaId: string;
      username: string | null;
      phone: string | null;
      email: string | null;
      gender: string | null;
      birthday: string | null;
      avatar: string | null;
      coverImage: string | null;
    }>('/auth/profile');
  },

  updateProfile(data: {
    username?: string;
    gender?: string;
    birthday?: string;
    avatar?: string;
    coverImage?: string;
  }) {
    return api.patch('/auth/profile', data);
  },

  getCosCredential(fileType: 'avatar' | 'cover', ext: string, contentType: string) {
    return api.post<{ url: string; publicUrl: string; key: string; contentType: string }>(
      '/auth/cos-credential',
      { fileType, ext, contentType },
    );
  },
};
