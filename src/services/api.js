const API_BASE = '/api';

export async function request(endpoint, options = {}) {
  const token = localStorage.getItem('scf_token');
  const headers = {
    ...(options.headers || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // If not FormData, default to application/json
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

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
