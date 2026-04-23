/**
 * API Integration Module
 * Handles all backend API communication
 */

const API_BASE_URL = 'http://localhost:5000/api';

/**
 * Generic fetch wrapper with error handling
 */
async function apiCall(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = localStorage.getItem('token');

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error);
    throw error;
  }
}

/* ===== AUTHENTICATION ENDPOINTS ===== */

export const auth = {
  /**
   * Register new teacher
   */
  register: async (data) => {
    return apiCall('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Login teacher
   */
  login: async (email, password) => {
    return apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  /**
   * Guest login
   */
  guestLogin: async () => {
    return apiCall('/auth/guest-login', {
      method: 'POST',
    });
  },

  /**
   * Get current user info
   */
  getMe: async () => {
    return apiCall('/auth/me');
  },
};

/* ===== RECORD ENDPOINTS ===== */

export const records = {
  /**
   * Create new record
   */
  create: async (data) => {
    return apiCall('/records', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Get all records with pagination
   */
  getAll: async (page = 1, limit = 10) => {
    return apiCall(`/records?page=${page}&limit=${limit}`);
  },

  /**
   * Get records by date
   */
  getByDate: async (date) => {
    return apiCall(`/records/date/${date}`);
  },

  /**
   * Get records by date range
   */
  getByDateRange: async (startDate, endDate) => {
    return apiCall(`/records/range?startDate=${startDate}&endDate=${endDate}`);
  },

  /**
   * Get single record by ID
   */
  getById: async (id) => {
    return apiCall(`/records/${id}`);
  },

  /**
   * Update record
   */
  update: async (id, data) => {
    return apiCall(`/records/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  /**
   * Delete record
   */
  delete: async (id) => {
    return apiCall(`/records/${id}`, {
      method: 'DELETE',
    });
  },

  /**
   * Get dashboard statistics
   */
  getDashboardStats: async () => {
    return apiCall('/records/stats/dashboard');
  },
};

/**
 * Token management
 */
export const tokenManager = {
  setToken: (token) => {
    localStorage.setItem('token', token);
  },

  getToken: () => {
    return localStorage.getItem('token');
  },

  clearToken: () => {
    localStorage.removeItem('token');
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },

  decodeToken: (token) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      return null;
    }
  },
};

/**
 * Local storage helpers
 */
export const storage = {
  saveFormData: (data) => {
    localStorage.setItem('formData', JSON.stringify(data));
  },

  getFormData: () => {
    const data = localStorage.getItem('formData');
    return data ? JSON.parse(data) : null;
  },

  clearFormData: () => {
    localStorage.removeItem('formData');
  },
};
