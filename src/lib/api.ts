import { auth } from './firebase';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

/**
 * Base API client with automatic Firebase Auth Bearer token insertion
 */
export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = endpoint.startsWith('http') ? endpoint : endpoint;
  const headers = new Headers(options.headers || {});

  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  // Get active Firebase ID token if user is signed in
  try {
    const currentUser = auth.currentUser;
    if (currentUser) {
      const idToken = await currentUser.getIdToken();
      if (idToken) {
        headers.set('Authorization', `Bearer ${idToken}`);
      }
    }
  } catch (e) {
    // Fallback if auth unavailable
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data = await response.json();
    return data;
  } catch (err: any) {
    return {
      success: false,
      error: {
        code: 'NETWORK_ERROR',
        message: err.message || 'Failed to connect to backend server',
      },
    };
  }
}

// ── Service Endpoints ─────────────────────────────────────────────────────────

export const api = {
  // Auth
  auth: {
    sync: () => apiRequest('/api/auth/sync', { method: 'POST' }),
    me: () => apiRequest('/api/auth/me'),
  },

  // Users
  users: {
    getDashboard: () => apiRequest('/api/users/me/dashboard'),
    updateProfile: (data: { name?: string; bio?: string; organization?: string; profilePicture?: string }) =>
      apiRequest('/api/users/me', { method: 'PUT', body: JSON.stringify(data) }),
  },

  // Courses
  courses: {
    list: (params?: { cat?: string; level?: string; search?: string }) => {
      const qs = new URLSearchParams(params as any).toString();
      return apiRequest(`/api/courses${qs ? `?${qs}` : ''}`);
    },
    getById: (id: string) => apiRequest(`/api/courses/${id}`),
    enroll: (id: string) => apiRequest(`/api/courses/${id}/enroll`, { method: 'POST' }),
    updateProgress: (id: string, data: { lessonKey?: string; timeSpentMinutes?: number }) =>
      apiRequest(`/api/courses/${id}/progress`, { method: 'POST', body: JSON.stringify(data) }),
    submitQuiz: (id: string, answers: number[]) =>
      apiRequest(`/api/courses/${id}/quiz`, { method: 'POST', body: JSON.stringify({ answers }) }),
  },

  // Simulations
  simulations: {
    list: (params?: { category?: string; difficulty?: string }) => {
      const qs = new URLSearchParams(params as any).toString();
      return apiRequest(`/api/simulations${qs ? `?${qs}` : ''}`);
    },
    getById: (id: string) => apiRequest(`/api/simulations/${id}`),
    start: (id: string) => apiRequest(`/api/simulations/${id}/start`, { method: 'POST' }),
    recordEvent: (id: string, attemptId: string, eventData: any) =>
      apiRequest(`/api/simulations/${id}/event`, {
        method: 'POST',
        body: JSON.stringify({ attemptId, ...eventData }),
      }),
    complete: (id: string, data: any) =>
      apiRequest(`/api/simulations/${id}/complete`, { method: 'POST', body: JSON.stringify(data) }),
    getMyHistory: () => apiRequest('/api/simulations/my-history'),
  },

  // Certifications
  certifications: {
    getMy: () => apiRequest('/api/certifications/my'),
    verify: (credId: string) => apiRequest(`/api/certifications/verify/${credId}`),
  },

  // Activity Timeline
  activity: {
    list: (category?: string) =>
      apiRequest(`/api/activity${category ? `?category=${encodeURIComponent(category)}` : ''}`),
    record: (data: { activityType: string; label: string; detail?: string; category?: string; iconType?: string; metadata?: any }) =>
      apiRequest('/api/activity', { method: 'POST', body: JSON.stringify(data) }),
  },

  // FlotBot Security
  flotbot: {
    getAlerts: (params?: any) => {
      const qs = new URLSearchParams(params || {}).toString();
      return apiRequest(`/api/flotbot/alerts${qs ? `?${qs}` : ''}`);
    },
    getAlertById: (id: string) => apiRequest(`/api/flotbot/alerts/${id}`),
    acknowledgeAlert: (id: string) =>
      apiRequest(`/api/flotbot/alerts/${id}/acknowledge`, { method: 'POST' }),
    explainAlert: (alertId: string) =>
      apiRequest('/api/flotbot/ai/explain', { method: 'POST', body: JSON.stringify({ alertId }) }),
    chatAI: (message: string, context?: any) =>
      apiRequest('/api/flotbot/ai/chat', { method: 'POST', body: JSON.stringify({ message, context }) }),
    getMySecurityBehaviour: () => apiRequest('/api/flotbot/my-security-behaviour'),
  },

  // Admin
  admin: {
    getStats: () => apiRequest('/api/admin/stats'),
    listUsers: (params?: any) => {
      const qs = new URLSearchParams(params || {}).toString();
      return apiRequest(`/api/admin/users${qs ? `?${qs}` : ''}`);
    },
    updateUserRole: (userId: string, role: string) =>
      apiRequest(`/api/admin/users/${userId}/role`, { method: 'PUT', body: JSON.stringify({ role }) }),
    getAuditLogs: (params?: any) => {
      const qs = new URLSearchParams(params || {}).toString();
      return apiRequest(`/api/admin/audit-logs${qs ? `?${qs}` : ''}`);
    },
  },

  // Analytics
  analytics: {
    getOverview: () => apiRequest('/api/analytics/overview'),
    getCourses: () => apiRequest('/api/analytics/courses'),
    getSimulations: () => apiRequest('/api/analytics/simulations'),
    getSecurity: () => apiRequest('/api/analytics/security'),
  },
};
