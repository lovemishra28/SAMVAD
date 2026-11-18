import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from './config';

const TOKEN_KEY = 'samvad_jwt_token';
const USER_KEY = 'samvad_user_profile';

// ─── Token Management ──────────────────────────────────────────────

export const saveToken = async (token: string): Promise<void> => {
  await AsyncStorage.setItem(TOKEN_KEY, token);
};

export const getToken = async (): Promise<string | null> => {
  return AsyncStorage.getItem(TOKEN_KEY);
};

export const clearAuth = async (): Promise<void> => {
  await AsyncStorage.removeItem(TOKEN_KEY);
  await AsyncStorage.removeItem(USER_KEY);
};

// ─── User Profile Caching ──────────────────────────────────────────

export const saveUserProfile = async (user: any): Promise<void> => {
  await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const getCachedUser = async (): Promise<any | null> => {
  const raw = await AsyncStorage.getItem(USER_KEY);
  return raw ? JSON.parse(raw) : null;
};

// ─── API Client ────────────────────────────────────────────────────

type RequestOptions = {
  method?: string;
  body?: any;
  requireAuth?: boolean;
};

export const api = async (
  endpoint: string,
  options: RequestOptions = {}
): Promise<any> => {
  const { method = 'GET', body, requireAuth = false } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (requireAuth) {
    const token = await getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  const config: RequestInit = { method, headers };
  if (body) {
    config.body = JSON.stringify(body);
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, config);
  const data = await response.json();

  if (!response.ok) {
    const error: any = new Error(data.message || 'Request failed');
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
};

// ─── Pre-built API Methods ─────────────────────────────────────────

export const authApi = {
  sendOtp: (mobileNumber: string) =>
    api('/api/auth/send-otp', { method: 'POST', body: { mobileNumber } }),

  verifyOtp: (mobileNumber: string, otp: string) =>
    api('/api/auth/verify-otp', { method: 'POST', body: { mobileNumber, otp } }),

  getMe: () =>
    api('/api/auth/me', { requireAuth: true }),

  updateProfile: (data: {
    occupation?: string;
    interests?: string[];
    incomeRange?: string;
    pwdStatus?: boolean;
    bplStatus?: boolean;
    scstStatus?: boolean;
  }) =>
    api('/api/auth/update-profile', { method: 'PUT', requireAuth: true, body: data }),
};

export const mobileApi = {
  getNotifications: () =>
    api('/api/mobile/notifications', { requireAuth: true }),

  markAllNotificationsRead: () =>
    api('/api/mobile/notifications/mark-all-read', { method: 'PATCH', requireAuth: true }),

  getSchemes: () =>
    api('/api/mobile/schemes', { requireAuth: true }),

  getSchemeAppliedStatus: (schemeId: string) =>
    api(`/api/mobile/schemes/${schemeId}/applied-status`, { requireAuth: true }),

  applyForScheme: (payload: {
    schemeId: string;
    schemeName: string;
    comments?: string;
    applicantName?: string;
    applicantMobileNumber?: string;
    applicantAddress?: string;
    schemeWebsiteLink?: string;
    aadhaarNumber?: string;
  }) =>
    api('/api/mobile/apply', {
      method: 'POST',
      requireAuth: true,
      body: payload,
    }),

  getApplications: () =>
    api('/api/mobile/applications', { requireAuth: true }),

  getMyRecommendations: () =>
    api('/api/mobile/my-recommendations', { requireAuth: true }),

  submitFeedback: (payload: {
    type: 'scheme_feedback' | 'suggestion';
    schemeId?: string;
    schemeName?: string;
    rating?: number;
    note?: string;
    suggestionText?: string;
  }) =>
    api('/api/mobile/feedback', {
      method: 'POST',
      requireAuth: true,
      body: payload,
    }),

  getMyFeedback: () =>
    api('/api/mobile/feedback/my', { requireAuth: true }),
};
