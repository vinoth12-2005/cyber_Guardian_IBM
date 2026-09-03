import { auth } from './firebase';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

const BACKEND_ORIGIN = import.meta.env.VITE_API_URL || (
  typeof window !== 'undefined' && (window.location.protocol === 'file:' || !window.location.port || (window as any).electronAPI)
    ? 'http://localhost:5000'
    : ''
);

/**
 * Base API client with automatic Firebase Auth Bearer token insertion
 */
export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = endpoint.startsWith('http') ? endpoint : `${BACKEND_ORIGIN}${endpoint}`;
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
    sync: (data?: any) => apiRequest('/api/auth/sync', { method: 'POST', body: data ? JSON.stringify(data) : undefined }),
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
    list: (params?: { cat?: string; level?: string; search?: string; status?: string; includeDrafts?: boolean }) => {
      const qs = new URLSearchParams(params as any).toString();
      return apiRequest(`/api/courses${qs ? `?${qs}` : ''}`);
    },
    getById: (id: string) => apiRequest(`/api/courses/${id}`),
    enroll: (id: string) => apiRequest(`/api/courses/${id}/enroll`, { method: 'POST' }),
    updateProgress: (id: string, data: { lessonKey?: string; timeSpentMinutes?: number }) =>
      apiRequest(`/api/courses/${id}/progress`, { method: 'POST', body: JSON.stringify(data) }),
    submitQuiz: (id: string, answers: number[], integrityMetrics?: any) =>
      apiRequest(`/api/courses/${id}/quiz`, { method: 'POST', body: JSON.stringify({ answers, integrityMetrics }) }),
    generateFromPdf: (formData: FormData) =>
      apiRequest('/api/admin/courses/generate-from-pdf', { method: 'POST', body: formData }),
    uploadMedia: (formData: FormData) =>
      apiRequest('/api/admin/courses/upload-media', { method: 'POST', body: formData }),
    publish: (id: string) =>
      apiRequest(`/api/admin/courses/${id}/publish`, { method: 'PUT' }),
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
    chatAI: (message: string, sessionId?: string, context?: any) =>
      apiRequest('/api/flotbot/ai/chat', { method: 'POST', body: JSON.stringify({ message, sessionId, context }) }),
    listChats: () => apiRequest('/api/flotbot/chats'),
    getChat: (sessionId: string) => apiRequest(`/api/flotbot/chats/${sessionId}`),
    deleteChat: (sessionId: string) => apiRequest(`/api/flotbot/chats/${sessionId}`, { method: 'DELETE' }),
    analyzeUrl: (url: string, metadata?: any) =>
      apiRequest('/api/flotbot/analyze-url', { method: 'POST', body: JSON.stringify({ url, metadata }) }),
    analyzeFile: (params: { sha256?: string; fileName?: string; filePath?: string; entropy?: number }) =>
      apiRequest('/api/flotbot/analyze-file', { method: 'POST', body: JSON.stringify(params) }),
    recordDecision: (alertId: string, action: 'safe_exit' | 'override_proceed', reason?: string) =>
      apiRequest(`/api/flotbot/alerts/${alertId}/decision`, { method: 'POST', body: JSON.stringify({ action, reason }) }),
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
