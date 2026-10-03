/**
 * SmartNeb Frontend API Service
 * High-reliability REST client connecting to Django REST Framework backend
 * with automatic JWT refresh and graceful offline error handling.
 */

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

function getAuthHeader() {
  const token = localStorage.getItem('smartneb_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

async function apiRequest(endpoint, options = {}, isRetry = false) {
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
    ...options.headers,
  };

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    // Handle token expiration
    if (response.status === 401 && !isRetry && !endpoint.includes('/auth/login/') && !endpoint.includes('/auth/refresh/')) {
      const refreshToken = localStorage.getItem('smartneb_refresh');
      if (refreshToken) {
        if (!isRefreshing) {
          isRefreshing = true;
          try {
            const refreshRes = await fetch(`${API_BASE}/auth/refresh/`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ refresh: refreshToken }),
            });
            const refreshData = await refreshRes.json();
            if (refreshRes.ok && refreshData.access) {
              localStorage.setItem('smartneb_token', refreshData.access);
              processQueue(null, refreshData.access);
              isRefreshing = false;
              // Retry original request
              return apiRequest(endpoint, options, true);
            } else {
              processQueue(new Error('Token refresh failed'), null);
              isRefreshing = false;
              localStorage.removeItem('smartneb_token');
              localStorage.removeItem('smartneb_refresh');
            }
          } catch (refreshErr) {
            processQueue(refreshErr, null);
            isRefreshing = false;
          }
        } else {
          // Wait for refresh to finish
          return new Promise((resolve, reject) => {
            failedQueue.push({
              resolve: (token) => {
                resolve(apiRequest(endpoint, options, true));
              },
              reject: (err) => {
                reject(err);
              },
            });
          });
        }
      }
    }

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      return {
        success: false,
        status: response.status,
        error: {
          status: response.status,
          data: data || { detail: response.statusText },
        },
        isNetworkError: false,
      };
    }

    return {
      success: true,
      status: response.status,
      data,
      isNetworkError: false,
    };
  } catch (err) {
    // Network failure / server offline
    return {
      success: false,
      status: 0,
      error: err,
      isNetworkError: true,
    };
  }
}

export const api = {
  // Authentication
  async login(email, password) {
    const res = await apiRequest('/auth/login/', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (res.success && res.data?.access) {
      localStorage.setItem('smartneb_token', res.data.access);
      localStorage.setItem('smartneb_refresh', res.data.refresh);
      localStorage.setItem('smartneb_role', res.data.user?.role || 'patient');
      localStorage.setItem('smartneb_auth', 'true');
    }
    return res;
  },

  async register(userData) {
    const res = await apiRequest('/auth/register/', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    if (res.success && res.data?.access) {
      localStorage.setItem('smartneb_token', res.data.access);
      localStorage.setItem('smartneb_refresh', res.data.refresh);
      localStorage.setItem('smartneb_role', res.data.user?.role || 'patient');
      localStorage.setItem('smartneb_auth', 'true');
    }
    return res;
  },

  async refreshToken() {
    const refresh = localStorage.getItem('smartneb_refresh');
    if (!refresh) return { success: false };
    const res = await apiRequest('/auth/refresh/', {
      method: 'POST',
      body: JSON.stringify({ refresh }),
    });
    if (res.success && res.data?.access) {
      localStorage.setItem('smartneb_token', res.data.access);
    }
    return res;
  },

  async logout() {
    const refresh = localStorage.getItem('smartneb_refresh');
    if (refresh) {
      await apiRequest('/auth/logout/', {
        method: 'POST',
        body: JSON.stringify({ refresh }),
      }).catch(() => {});
    }
    localStorage.removeItem('smartneb_token');
    localStorage.removeItem('smartneb_refresh');
    localStorage.removeItem('smartneb_auth');
    return { success: true };
  },

  async getMe() {
    return apiRequest('/auth/me/');
  },

  // Patients
  async getPatientDashboard() {
    return apiRequest('/patients/me/');
  },

  async getPatients(params = {}) {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/patients/${query ? `?${query}` : ''}`);
  },

  async getPatientDetail(identifier) {
    return apiRequest(`/patients/${identifier}/`);
  },

  async updatePatient(identifier, data) {
    return apiRequest(`/patients/${identifier}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  async getCaregiverSummary() {
    return apiRequest('/patients/caregiver-summary/');
  },

  // Telemetry
  async getLatestTelemetry(patientId) {
    const query = patientId ? `?patient_id=${patientId}` : '';
    return apiRequest(`/telemetry/latest/${query}`);
  },

  async getTelemetryHistory(patientId, limit = 20) {
    const query = patientId ? `?patient_id=${patientId}&limit=${limit}` : `?limit=${limit}`;
    return apiRequest(`/telemetry/history/${query}`);
  },

  async ingestTelemetry(data) {
    return apiRequest('/telemetry/ingest/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Therapy Sessions & Plans
  async getTherapyPlans(patientId) {
    const query = patientId ? `?patient_id=${patientId}` : '';
    return apiRequest(`/therapy/plans/${query}`);
  },

  async getTherapySessions(patientId) {
    const query = patientId ? `?patient_id=${patientId}` : '';
    return apiRequest(`/therapy/sessions/${query}`);
  },

  async startTherapy(durationSeconds = 600) {
    return apiRequest('/therapy/sessions/start/', {
      method: 'POST',
      body: JSON.stringify({ total_duration_seconds: durationSeconds }),
    });
  },

  async pauseTherapy(sessionId, elapsedSeconds) {
    return apiRequest(`/therapy/sessions/${sessionId}/pause/`, {
      method: 'POST',
      body: JSON.stringify({ elapsed_seconds: elapsedSeconds }),
    });
  },

  async resumeTherapy(sessionId) {
    return apiRequest(`/therapy/sessions/${sessionId}/resume/`, {
      method: 'POST',
    });
  },

  async completeTherapy(sessionId, payload = {}) {
    return apiRequest(`/therapy/sessions/${sessionId}/complete/`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async cancelTherapy(sessionId) {
    return apiRequest(`/therapy/sessions/${sessionId}/cancel/`, {
      method: 'POST',
    });
  },

  // Alerts & SOS
  async getAlerts(params = {}) {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/alerts/${query ? `?${query}` : ''}`);
  },

  async resolveAlert(alertId) {
    return apiRequest(`/alerts/${alertId}/resolve/`, {
      method: 'POST',
    });
  },

  async triggerSOS(data = {}) {
    return apiRequest('/alerts/sos/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Devices Fleet
  async getDevices(params = {}) {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/devices/${query ? `?${query}` : ''}`);
  },

  async getDeviceDetail(identifier) {
    return apiRequest(`/devices/${identifier}/`);
  },

  async updateDevice(identifier, data) {
    return apiRequest(`/devices/${identifier}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  // Admin Fleet Operations
  async getFleetStats() {
    return apiRequest('/admin-ops/fleet-stats/');
  },

  async getAdminUsers(params = {}) {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/admin-ops/users/${query ? `?${query}` : ''}`);
  },

  async createAdminUser(userData) {
    return apiRequest('/admin-ops/users/', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  async updateAdminUser(userId, userData) {
    return apiRequest(`/admin-ops/users/${userId}/`, {
      method: 'PATCH',
      body: JSON.stringify(userData),
    });
  },

  async getAuditLogs() {
    return apiRequest('/admin-ops/audit-logs/');
  },
};
