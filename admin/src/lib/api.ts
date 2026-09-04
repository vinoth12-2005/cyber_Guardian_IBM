/**
 * Admin API Client connecting to Unified Backend on /api
 */

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

// Token storage key for administrative sessions
const ADMIN_TOKEN_KEY = 'cg_admin_auth_token';

export function generateAdminDevToken(
  role: string = 'SUPER_ADMIN',
  email: string = 'admin@cyberguardian.local',
  name: string = 'Security Operations Lead'
): string {
  try {
    const header = btoa(JSON.stringify({ alg: 'none', typ: 'JWT' }))
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');

    const payload = btoa(
      unescape(
        encodeURIComponent(
          JSON.stringify({
            iss: 'https://securetoken.google.com/ibmhack-c98c2',
            aud: 'ibmhack-c98c2',
            auth_time: Math.floor(Date.now() / 1000),
            user_id: 'usr_admin_' + role.toLowerCase().replace(/[^a-z0-9]/g, '_'),
            sub: 'usr_admin_' + role.toLowerCase().replace(/[^a-z0-9]/g, '_'),
            uid: 'usr_admin_' + role.toLowerCase().replace(/[^a-z0-9]/g, '_'),
            email: email,
            name: name,
            role: role,
            email_verified: true,
          })
        )
      )
    )
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');

    return `${header}.${payload}.signature`;
  } catch (e) {
    return 'mock.admin.token';
  }
}

export function getAdminToken(): string {
  const stored = localStorage.getItem(ADMIN_TOKEN_KEY);
  if (stored) return stored;
  const devToken = generateAdminDevToken('SUPER_ADMIN');
  localStorage.setItem(ADMIN_TOKEN_KEY, devToken);
  return devToken;
}

export function setAdminToken(token: string | null): void {
  if (token) {
    localStorage.setItem(ADMIN_TOKEN_KEY, token);
  } else {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
  }
}

const ADMIN_BACKEND_ORIGIN = import.meta.env.VITE_API_URL || (
  typeof window !== 'undefined' && (window.location.protocol === 'file:' || (window as any).electronAPI)
    ? 'http://localhost:5000'
    : ''
);

export async function adminFetch<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = endpoint.startsWith('http') ? endpoint : `${ADMIN_BACKEND_ORIGIN}${endpoint}`;
  const headers = new Headers(options.headers || {});
  
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const token = getAdminToken();
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  try {
    const res = await fetch(url, {
      ...options,
      headers,
    });

    const data = await res.json();
    return data;
  } catch (err: any) {
    return {
      success: false,
      error: {
        code: 'NETWORK_ERROR',
        message: err.message || 'Unable to connect to backend server',
      },
    };
  }
}

// ── Admin API Endpoints ───────────────────────────────────────────────────────

export const adminApi = {
  // Auth & Session
  auth: {
    sync: (token?: string) => {
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      return adminFetch('/api/auth/sync', { method: 'POST', headers });
    },
    me: () => adminFetch('/api/auth/me'),
  },

  // Overview Statistics
  stats: {
    getOverview: () => adminFetch('/api/admin/stats'),
    getPlatformAnalytics: () => adminFetch('/api/analytics/overview'),
    getCourseAnalytics: () => adminFetch('/api/analytics/courses'),
    getSimulationAnalytics: () => adminFetch('/api/analytics/simulations'),
    getSecurityAnalytics: () => adminFetch('/api/analytics/security'),
  },

  // Users Management
  users: {
    list: (params?: { page?: number; limit?: number; search?: string; role?: string; status?: string }) => {
      const qs = new URLSearchParams(params as any || {}).toString();
      return adminFetch(`/api/admin/users${qs ? `?${qs}` : ''}`);
    },
    getById: (userId: string) => adminFetch(`/api/admin/users/${userId}`),
    create: (userData: {
      name: string;
      email: string;
      password?: string;
      role?: string;
      organization?: string;
      bio?: string;
      status?: string;
      firebaseUid?: string;
    }) => adminFetch('/api/admin/users', { method: 'POST', body: JSON.stringify(userData) }),
    updateRole: (userId: string, role: string) =>
      adminFetch(`/api/admin/users/${userId}/role`, { method: 'PUT', body: JSON.stringify({ role }) }),
    updateStatus: (userId: string, status: string) =>
      adminFetch(`/api/admin/users/${userId}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),
    delete: (userId: string, force: boolean = false, permanent: boolean = false) =>
      adminFetch(`/api/admin/users/${userId}?force=${force}&permanent=${permanent}`, { method: 'DELETE' }),
    purge: (userId: string) =>
      adminFetch(`/api/admin/users/${userId}?force=true&permanent=true`, { method: 'DELETE' }),
    syncFirebase: () =>
      adminFetch('/api/admin/users/sync-firebase', { method: 'POST' }),
  },

  // Course Management
  courses: {
    list: (params?: { cat?: string; level?: string; search?: string; status?: string; includeDrafts?: boolean }) => {
      const qs = new URLSearchParams(params as any || {}).toString();
      return adminFetch(`/api/courses${qs ? `?${qs}` : ''}`);
    },
    getById: (courseId: string) => adminFetch(`/api/courses/${courseId}`),
    create: (courseData: any) =>
      adminFetch('/api/admin/courses', { method: 'POST', body: JSON.stringify(courseData) }),
    update: (courseId: string, courseData: any) =>
      adminFetch(`/api/admin/courses/${courseId}`, { method: 'PUT', body: JSON.stringify(courseData) }),
    publish: (courseId: string) =>
      adminFetch(`/api/admin/courses/${courseId}/publish`, { method: 'PUT' }),
    delete: (courseId: string) =>
      adminFetch(`/api/admin/courses/${courseId}`, { method: 'DELETE' }),
    generateFromPdf: (formData: FormData) =>
      adminFetch('/api/admin/courses/generate-from-pdf', { method: 'POST', body: formData }),
    uploadMedia: (formData: FormData) =>
      adminFetch('/api/admin/courses/upload-media', { method: 'POST', body: formData }),
  },

  // Simulation Management
  simulations: {
    list: (params?: { category?: string; difficulty?: string }) => {
      const qs = new URLSearchParams(params as any || {}).toString();
      return adminFetch(`/api/simulations${qs ? `?${qs}` : ''}`);
    },
    getById: (id: string) => adminFetch(`/api/simulations/${id}`),
    create: (data: any) =>
      adminFetch('/api/admin/simulations', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) =>
      adminFetch(`/api/admin/simulations/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) =>
      adminFetch(`/api/admin/simulations/${id}`, { method: 'DELETE' }),
  },

  // Certification Management
  certifications: {
    list: (params?: { page?: number; limit?: number; search?: string }) => {
      const qs = new URLSearchParams(params as any || {}).toString();
      return adminFetch(`/api/certifications${qs ? `?${qs}` : ''}`);
    },
    verify: (credId: string) => adminFetch(`/api/certifications/verify/${credId}`),
    revoke: (credId: string, reason: string) =>
      adminFetch(`/api/admin/certifications/${credId}/revoke`, { method: 'POST', body: JSON.stringify({ reason }) }),
  },

  // FlotBot Security Operations
  flotbot: {
    getAlerts: (params?: { page?: number; limit?: number; severity?: string; status?: string; category?: string; search?: string }) => {
      const qs = new URLSearchParams(params as any || {}).toString();
      return adminFetch(`/api/flotbot/alerts${qs ? `?${qs}` : ''}`);
    },
    getAlertById: (id: string) => adminFetch(`/api/flotbot/alerts/${id}`),
    getAlertHistory: (id: string) => adminFetch(`/api/flotbot/alerts/${id}/history`),
    acknowledgeAlert: (id: string) =>
      adminFetch(`/api/flotbot/alerts/${id}/acknowledge`, { method: 'POST' }),
    resolveAlert: (id: string, resolutionNotes: string) =>
      adminFetch(`/api/flotbot/alerts/${id}/resolve`, { method: 'POST', body: JSON.stringify({ resolutionNotes }) }),
    explainAlert: (alertId: string) =>
      adminFetch('/api/flotbot/ai/explain', { method: 'POST', body: JSON.stringify({ alertId }) }),
    chatAI: (message: string, context?: any) =>
      adminFetch('/api/flotbot/ai/chat', { method: 'POST', body: JSON.stringify({ message, context }) }),
    getAllUsersSecurityBehaviour: () => adminFetch('/api/admin/flotbot/user-behaviour'),
    getUserSecurityBehaviour: (userId: string) => adminFetch(`/api/flotbot/user-behaviour/${userId}`),
    
    // IOCs
    getIocs: (params?: { type?: string; search?: string }) => {
      const qs = new URLSearchParams(params as any || {}).toString();
      return adminFetch(`/api/flotbot/iocs${qs ? `?${qs}` : ''}`);
    },
    addIoc: (data: { type: string; value: string; threatName?: string; severity?: string; note?: string }) =>
      adminFetch('/api/flotbot/iocs', { method: 'POST', body: JSON.stringify(data) }),
    updateIoc: (id: string, data: any) =>
      adminFetch(`/api/flotbot/iocs/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    deleteIoc: (id: string) =>
      adminFetch(`/api/flotbot/iocs/${id}`, { method: 'DELETE' }),
      
    // Rules
    getRules: () => adminFetch('/api/flotbot/rules'),
    toggleRule: (ruleId: string, enabled: boolean) =>
      adminFetch(`/api/flotbot/rules/${ruleId}/toggle`, { method: 'PATCH', body: JSON.stringify({ enabled }) }),
    updateRuleConfig: (ruleId: string, config: any) =>
      adminFetch(`/api/flotbot/rules/${ruleId}`, { method: 'PUT', body: JSON.stringify({ config }) }),
  },

  // Audit Logs
  audit: {
    getLogs: (params?: { page?: number; limit?: number; action?: string; search?: string }) => {
      const qs = new URLSearchParams(params as any || {}).toString();
      return adminFetch(`/api/admin/audit-logs${qs ? `?${qs}` : ''}`);
    },
  },
};
