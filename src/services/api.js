import { localBackend } from './localBackend.js';

// ---------------------------------------------------------------------------
// Smart Campus Fix – API Service
//
// Architecture:
//   • VITE_API_URL set  → all calls go to the real Express/SQLite backend
//   • VITE_API_URL unset (default, Vercel demo deployment) → all calls are
//     handled entirely in the browser by localBackend (localStorage-backed).
//     No network fetch is ever attempted in this mode.
// ---------------------------------------------------------------------------

// Resolved at Vite build time. Empty string when not configured.
const REMOTE_API_URL = import.meta.env.VITE_API_URL || '';

export function isLocalDemoMode() {
  return !REMOTE_API_URL;
}

// Client-side dispatcher for local demo mode
async function handleLocalRequest(endpoint, options = {}) {
  const method = (options.method || 'GET').toUpperCase();
  const [path, queryString] = endpoint.split('?');
  const params = Object.fromEntries(new URLSearchParams(queryString || ''));

  let body = {};
  if (options.body) {
    if (options.body instanceof FormData) {
      body = options.body;
    } else if (typeof options.body === 'string') {
      try {
        body = JSON.parse(options.body);
      } catch (e) {
        body = options.body;
      }
    } else {
      body = options.body;
    }
  }

  // 1. Auth routes
  if (path === '/auth/login' && method === 'POST') return localBackend.login(body);
  if (path === '/auth/register' && method === 'POST') return localBackend.register(body);
  if (path === '/auth/me' && method === 'GET') return localBackend.getMe();
  if (path === '/auth/profile' && method === 'PUT') return localBackend.updateProfile(body);
  if (path === '/auth/demo-users' && method === 'GET') return localBackend.getDemoUsers();

  // 2. Complaint routes
  if (path === '/complaints' && method === 'GET') return localBackend.getComplaints(params);
  if (path === '/complaints' && method === 'POST') return localBackend.createComplaint(body);
  if (path === '/complaints/check-duplicate' && method === 'POST') return localBackend.checkDuplicate(body);

  // Parameterized complaint routes: /complaints/:id/...
  const complaintMatch = path.match(/^\/complaints\/([^/]+)(?:\/(assign|status|resolve|close|reopen|priority))?$/);
  if (complaintMatch) {
    const id = complaintMatch[1];
    const subAction = complaintMatch[2];

    if (!subAction && method === 'GET') return localBackend.getComplaint(id);
    if (subAction === 'assign' && method === 'POST') return localBackend.assignComplaint(id, body);
    if (subAction === 'status' && method === 'POST') return localBackend.updateStatus(id, body);
    if (subAction === 'resolve' && method === 'POST') return localBackend.resolveComplaint(id, body);
    if (subAction === 'close' && method === 'POST') return localBackend.closeComplaint(id, body);
    if (subAction === 'reopen' && method === 'POST') return localBackend.reopenComplaint(id, body);
    if (subAction === 'priority' && method === 'PATCH') return localBackend.updatePriority(id, body);
  }

  // 3. Staff routes
  if (path === '/staff' && method === 'GET') return localBackend.getStaff();
  if (path === '/staff/availability' && method === 'PATCH') return localBackend.updateAvailability(body.is_available);

  // 4. Notification routes
  if (path === '/notifications' && method === 'GET') return localBackend.getNotifications();
  if (path === '/notifications/read-all' && method === 'POST') return localBackend.markAllNotificationsRead();
  const notifMatch = path.match(/^\/notifications\/([^/]+)\/read$/);
  if (notifMatch && method === 'PATCH') return localBackend.markNotificationRead(notifMatch[1]);

  // 5. Stats routes
  if (path === '/stats/admin' && method === 'GET') return localBackend.getAdminStats();
  if (path === '/stats/staff' && method === 'GET') return localBackend.getStaffStats();
  if (path === '/stats/student' && method === 'GET') return localBackend.getStudentStats();

  // 6. AI routes
  if (path === '/ai/triage' && method === 'POST') return localBackend.aiTriage(body);

  throw new Error(`Local handler not implemented for ${method} ${path}`);
}

// ---------------------------------------------------------------------------
// remoteRequest – used ONLY when VITE_API_URL is explicitly configured.
// Makes a real network fetch to the Express backend.
// ---------------------------------------------------------------------------
async function remoteRequest(endpoint, options = {}) {
  const API_BASE = `${REMOTE_API_URL.replace(/\/$/, '')}/api`;
  const token = localStorage.getItem('scf_token');
  const headers = { ...(options.headers || {}) };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });

  const contentType = response.headers.get('content-type');
  let data = {};
  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  }

  if (!response.ok) {
    const errorMsg = data.error || data.message || `Request failed with status ${response.status}`;
    const err = new Error(errorMsg);
    err.status = response.status;
    err.data = data;
    throw err;
  }
  return data;
}

// ---------------------------------------------------------------------------
// request – public entry point.
//   • No VITE_API_URL → localBackend (pure in-browser, no network call).
//   • VITE_API_URL set → real backend via remoteRequest.
// ---------------------------------------------------------------------------
export function request(endpoint, options = {}) {
  if (!REMOTE_API_URL) {
    return handleLocalRequest(endpoint, options);
  }
  return remoteRequest(endpoint, options);
}

export const api = {
  // Auth
  login: (credentials) => request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  register: (userData) => request('/auth/register', { method: 'POST', body: JSON.stringify(userData) }),
  getMe: () => request('/auth/me'),
  updateProfile: (profile) => request('/auth/profile', { method: 'PUT', body: JSON.stringify(profile) }),
  getDemoUsers: () => request('/auth/demo-users'),

  // Complaints
  getComplaints: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/complaints${query ? `?${query}` : ''}`);
  },
  getComplaint: (id) => request(`/complaints/${id}`),
  createComplaint: (formData) => request('/complaints', { method: 'POST', body: formData }),
  checkDuplicate: (data) => request('/complaints/check-duplicate', { method: 'POST', body: JSON.stringify(data) }),
  assignComplaint: (id, data) => request(`/complaints/${id}/assign`, { method: 'POST', body: JSON.stringify(data) }),
  updateStatus: (id, data) => request(`/complaints/${id}/status`, { method: 'POST', body: JSON.stringify(data) }),
  resolveComplaint: (id, data) => request(`/complaints/${id}/resolve`, { method: 'POST', body: JSON.stringify(data) }),
  closeComplaint: (id, data) => request(`/complaints/${id}/close`, { method: 'POST', body: JSON.stringify(data) }),
  reopenComplaint: (id, data) => request(`/complaints/${id}/reopen`, { method: 'POST', body: JSON.stringify(data) }),
  updatePriority: (id, data) => request(`/complaints/${id}/priority`, { method: 'PATCH', body: JSON.stringify(data) }),

  // Staff
  getStaff: () => request('/staff'),
  updateAvailability: (isAvailable) => request('/staff/availability', { method: 'PATCH', body: JSON.stringify({ is_available: isAvailable }) }),

  // Notifications
  getNotifications: () => request('/notifications'),
  markNotificationRead: (id) => request(`/notifications/${id}/read`, { method: 'PATCH' }),
  markAllNotificationsRead: () => request('/notifications/read-all', { method: 'POST' }),

  // Stats
  getAdminStats: () => request('/stats/admin'),
  getStaffStats: () => request('/stats/staff'),
  getStudentStats: () => request('/stats/student'),

  // AI
  aiTriage: (data) => request('/ai/triage', { method: 'POST', body: JSON.stringify(data) })
};
