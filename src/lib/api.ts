import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// ─── Retry config ─────────────────────────────────────────────────────────────
const RETRY_ATTEMPTS = 3;
const RETRY_DELAY_MS = 500;
const RETRYABLE_STATUS = new Set([408, 429, 500, 502, 503, 504]);

function sleep(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms));
}

// ─── Token refresh mutex ──────────────────────────────────────────────────────
// Prevents multiple simultaneous 401s from each triggering a refresh
let _refreshing: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  if (_refreshing) return _refreshing;

  _refreshing = (async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) return null;
      const res = await axios.post(`${API_URL}/api/v1/auth/refresh`, { refreshToken });
      const { accessToken } = (res.data as any).data;
      localStorage.setItem('accessToken', accessToken);
      // Sync to zustand store without importing it (avoids circular dep)
      try {
        const stored = JSON.parse(localStorage.getItem('auth-storage') || '{}');
        if (stored?.state) {
          stored.state.accessToken = accessToken;
          localStorage.setItem('auth-storage', JSON.stringify(stored));
        }
      } catch { /* ignore */ }
      return accessToken;
    } catch {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      if (typeof window !== 'undefined') window.location.href = '/login';
      return null;
    } finally {
      _refreshing = null;
    }
  })();

  return _refreshing;
}

// ─── Axios instance ───────────────────────────────────────────────────────────
const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 60000, // 60s — Render free tier cold start can take 50s
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT + retry metadata on every request
api.interceptors.request.use((config: InternalAxiosRequestConfig & { _retryCount?: number }) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('accessToken');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  if (config._retryCount === undefined) config._retryCount = 0;
  return config;
});

// Response interceptor — unwrap envelope, handle 401 + retry
api.interceptors.response.use(
  (res) => res.data, // unwrap { success, data } envelope
  async (error: AxiosError) => {
    const config = error.config as (InternalAxiosRequestConfig & { _retryCount?: number }) | undefined;

    // ── 401: refresh token then retry once ──────────────────────────────────
    if (error.response?.status === 401 && config && !config.url?.includes('/auth/refresh')) {
      const newToken = await refreshAccessToken();
      if (newToken && config) {
        config.headers.Authorization = `Bearer ${newToken}`;
        return api(config);
      }
      return Promise.reject(error.response?.data || error.message);
    }

    // ── Retryable errors: network failures + 5xx/429/408 ────────────────────
    const isNetworkError = !error.response && error.code !== 'ECONNABORTED';
    const isRetryableStatus = error.response ? RETRYABLE_STATUS.has(error.response.status) : false;

    if (config && (isNetworkError || isRetryableStatus)) {
      const retryCount = config._retryCount ?? 0;
      if (retryCount < RETRY_ATTEMPTS) {
        config._retryCount = retryCount + 1;
        const delay = RETRY_DELAY_MS * Math.pow(2, retryCount); // exponential backoff
        await sleep(delay);
        return api(config);
      }
    }

    // ── Normalise error shape ────────────────────────────────────────────────
    const data = error.response?.data as any;
    const message =
      data?.message ||
      (Array.isArray(data?.errors) ? data.errors.join(', ') : null) ||
      error.message ||
      'Something went wrong';

    return Promise.reject({ message, status: error.response?.status, raw: data });
  },
);

export default api;

// ─── Typed API helpers ────────────────────────────────────────────────────────

export const authApi = {
  sendOtp: (email: string, name?: string) => api.post('/api/v1/auth/send-otp', { email, name }),
  verifyOtp: (email: string, otp: string, name?: string, role?: string, referralCode?: string) =>
    api.post('/api/v1/auth/verify-otp', { email, otp, name, role, referralCode }),
  loginWithPassword: (email: string, password: string) =>
    api.post('/api/v1/auth/login', { email, password }),
  registerWithPassword: (email: string, password: string, name: string, role?: string, referralCode?: string) =>
    api.post('/api/v1/auth/register', { email, password, name, role, referralCode }),
  refresh: (refreshToken: string) => api.post('/api/v1/auth/refresh', { refreshToken }),
};

export const jobsApi = {
  create: (data: any) => api.post('/api/v1/jobs', data),
  getMyJobs: (page = 1) => api.get(`/api/v1/jobs/my?page=${page}`),
  getById: (id: string) => api.get(`/api/v1/jobs/${id}`),
  getWorkerFeed: (page = 1) => api.get(`/api/v1/jobs/worker/feed?page=${page}`),
  getWorkerJobs: (page = 1) => api.get(`/api/v1/jobs/worker/assignments?page=${page}`),
  respond: (id: string, accept: boolean, reason?: string) =>
    api.post(`/api/v1/jobs/${id}/respond`, { accept, reason }),
  start: (id: string, otp: string) => api.post(`/api/v1/jobs/${id}/start`, { otp }),
  complete: (id: string, proofUrls: string[]) =>
    api.post(`/api/v1/jobs/${id}/complete`, { proofUrls }),
  cancel: (id: string, reason: string) => api.post(`/api/v1/jobs/${id}/cancel`, { reason }),
  generateOtp: (id: string) => api.post(`/api/v1/jobs/${id}/generate-otp`),
  generateCompletionOtp: (id: string) => api.post(`/api/v1/jobs/${id}/generate-completion-otp`),
  estimatePrice: (params: { categoryId: string; latitude: number; longitude: number; scheduledAt?: string; serviceType?: string; urgency?: string }) =>
    api.post('/api/v1/jobs/estimate-price', params),
  // IT diagnostic flow
  submitDiagnostic: (id: string, data: {
    rootCause: string; recommendedAction: string;
    partsRequired: { name: string; estimatedCost: number }[];
    laborCost: number; diagnosticFee: number;
    canBeRemote: boolean; estimatedDurationHours: number; notes?: string;
  }) => api.post(`/api/v1/jobs/${id}/diagnostic`, data),
  approvePrice: (id: string, approved: boolean, rejectionReason?: string) =>
    api.post(`/api/v1/jobs/${id}/approve-price`, { approved, rejectionReason }),
};

export const paymentsApi = {
  createOrder: (jobId: string) => api.post('/api/v1/payments/create-order', { jobId }),
  verify: (data: any) => api.post('/api/v1/payments/verify', data),
  releaseEscrow: (jobId: string) => api.post(`/api/v1/payments/${jobId}/release-escrow`),
  getHistory: (page = 1) => api.get(`/api/v1/payments/history?page=${page}`),
};

export const usersApi = {
  getProfile: () => api.get('/api/v1/users/me'),
  updateProfile: (data: any) => api.patch('/api/v1/users/me', data),
  addAddress: (data: any) => api.post('/api/v1/users/me/addresses', data),
  updateAddress: (id: string, data: any) => api.patch(`/api/v1/users/me/addresses/${id}`, data),
  deleteAddress: (id: string) => api.delete(`/api/v1/users/me/addresses/${id}`),
};

export const workerApi = {
  getProfile: () => api.get('/api/v1/workers/profile'),
  submitKyc: (data: any) => api.post('/api/v1/workers/kyc', data),
  toggleOnline: (online: boolean) => api.patch('/api/v1/workers/online-status', { online }),
  updateLocation: (lat: number, lng: number) =>
    api.patch('/api/v1/workers/location', { latitude: lat, longitude: lng }),
  getEarnings: () => api.get('/api/v1/workers/earnings'),
};

export const adminApi = {
  getDashboard: () => api.get('/api/v1/admin/dashboard'),
  listUsers: (page = 1, status?: string) =>
    api.get(`/api/v1/admin/users?page=${page}${status ? `&status=${status}` : ''}`),
  blockUser: (id: string, reason: string) => api.patch(`/api/v1/admin/users/${id}/block`, { reason }),
  unblockUser: (id: string) => api.patch(`/api/v1/admin/users/${id}/unblock`),
  listPendingKyc: (page = 1) => api.get(`/api/v1/admin/workers/kyc-pending?page=${page}`),
  listWorkers: (page = 1, status?: string) =>
    api.get(`/api/v1/admin/workers?page=${page}${status ? `&status=${status}` : ''}`),
  approveKyc: (id: string) => api.patch(`/api/v1/admin/workers/${id}/kyc/approve`),
  rejectKyc: (id: string, reason: string) =>
    api.patch(`/api/v1/admin/workers/${id}/kyc/reject`, { reason }),
  listJobs: (page = 1, status?: string) =>
    api.get(`/api/v1/admin/jobs?page=${page}${status ? `&status=${status}` : ''}`),
  getRevenue: (days = 30) => api.get(`/api/v1/admin/analytics/revenue?days=${days}`),
  processRefund: (paymentId: string, reason: string) =>
    api.post(`/api/v1/admin/payments/${paymentId}/refund`, { reason }),
  // Disputes
  listDisputes: (page = 1) => api.get(`/api/v1/admin/disputes?page=${page}`),
  getDisputeDetail: (jobId: string) => api.get(`/api/v1/admin/disputes/${jobId}`),
  refundCustomer: (jobId: string, reason: string) =>
    api.post(`/api/v1/admin/disputes/${jobId}/refund`, { reason }),
  penalizeWorker: (jobId: string, reason: string, penaltyAmount?: number) =>
    api.post(`/api/v1/admin/disputes/${jobId}/penalize-worker`, { reason, penaltyAmount }),
  closeDispute: (jobId: string, resolution: string, outcome: 'refund' | 'release' | 'split') =>
    api.post(`/api/v1/admin/disputes/${jobId}/close`, { resolution, outcome }),
  // RBAC
  listAdminUsers: () => api.get('/api/v1/admin/rbac/admins'),
  getAdminUser: (id: string) => api.get(`/api/v1/admin/rbac/admins/${id}`),
  createAdminUser: (data: any) => api.post('/api/v1/admin/rbac/admins', data),
  updateAdminUser: (id: string, data: any) => api.patch(`/api/v1/admin/rbac/admins/${id}`, data),
  listRoles: () => api.get('/api/v1/admin/rbac/roles'),
  getAllPermissions: () => api.get('/api/v1/admin/rbac/permissions'),
};

export const notificationsApi = {
  getAll: (page = 1) => api.get(`/api/v1/notifications?page=${page}`),
  getUnreadCount: () => api.get('/api/v1/notifications/unread-count'),
  markRead: (id: string) => api.patch(`/api/v1/notifications/${id}/read`),
  markAllRead: () => api.patch('/api/v1/notifications/read-all'),
};

export const reviewsApi = {
  create: (data: {
    jobId: string;
    revieweeId: string;
    type: string;
    rating: number;
    comment?: string;
    tags?: string[];
  }) => api.post('/api/v1/reviews', data),
  getForUser: (userId: string, page = 1) => api.get(`/api/v1/reviews/user/${userId}?page=${page}`),
};

export const walletApi = {
  getBalance: () => api.get('/api/v1/wallet/balance'),
  getLogs: (page = 1) => api.get(`/api/v1/wallet/logs?page=${page}`),
  requestWithdrawal: (amount: number) => api.post('/api/v1/wallet/withdraw', { amount }),
};

export const categoriesApi = {
  getAll: () => api.get('/api/v1/categories'),
  getById: (id: string) => api.get(`/api/v1/categories/${id}`),
  create: (data: any) => api.post('/api/v1/categories', data),
  update: (id: string, data: any) => api.patch(`/api/v1/categories/${id}`, data),
  delete: (id: string) => api.delete(`/api/v1/categories/${id}`),
};

export const pricingApi = {
  estimate: (params: { categoryId: string; latitude: number; longitude: number; scheduledAt?: string; serviceType?: string; urgency?: string }) =>
    api.post('/api/v1/jobs/estimate-price', params),
  getConfig: () => api.get('/api/v1/pricing/config'),
  getRules: () => api.get('/api/v1/pricing/rules'),
  upsertRule: (data: any) => api.post('/api/v1/pricing/rules', data),
  updateRule: (id: string, data: any) => api.patch(`/api/v1/pricing/rules/${id}`, data),
  deleteRule: (id: string) => api.delete(`/api/v1/pricing/rules/${id}`),
  // IT diagnostic estimate (calls AI service via backend proxy)
  diagnosticEstimate: (params: {
    categoryId: string; deviceType: string;
    brand?: string; issueType: string; urgency?: string;
  }) => api.post('/api/v1/pricing/diagnostic-estimate', params),
};
