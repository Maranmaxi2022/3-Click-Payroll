// API client utility for backend communication

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

class APIError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = 'APIError';
    this.status = status;
    this.data = data;
  }
}

async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);

    // Handle non-2xx responses
    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        errorData = { detail: response.statusText };
      }
      throw new APIError(
        errorData.detail || errorData.message || 'Request failed',
        response.status,
        errorData
      );
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return null;
    }

    return await response.json();
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }
    // Network or other errors
    throw new APIError(
      error.message || 'Network error',
      0,
      { originalError: error }
    );
  }
}

// Employee API endpoints
export const employeeAPI = {
  /**
   * Create a new employee
   * @param {Object} employeeData - Employee data matching EmployeeCreate schema
   * @returns {Promise<Object>} Created employee response
   */
  create: (employeeData) =>
    request('/api/v1/employees/', {
      method: 'POST',
      body: JSON.stringify(employeeData),
    }),

  /**
   * Get all employees with optional filtering and pagination
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} List of employees with pagination info
   */
  getAll: (params = {}) => {
    const queryString = new URLSearchParams(
      Object.entries(params).filter(([_, v]) => v != null)
    ).toString();
    const endpoint = queryString
      ? `/api/v1/employees/?${queryString}`
      : '/api/v1/employees/';
    return request(endpoint);
  },

  /**
   * Get a single employee by ID
   * @param {string} employeeId - MongoDB ObjectId as string
   * @returns {Promise<Object>} Employee details
   */
  getById: (employeeId) => request(`/api/v1/employees/${employeeId}`),

  /**
   * Update an employee
   * @param {string} employeeId - Employee ID
   * @param {Object} updateData - Partial employee data to update
   * @returns {Promise<Object>} Updated employee
   */
  update: (employeeId, updateData) =>
    request(`/api/v1/employees/${employeeId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    }),

  /**
   * Delete an employee
   * @param {string} employeeId - Employee ID
   * @returns {Promise<null>} No content on success
   */
  delete: (employeeId) =>
    request(`/api/v1/employees/${employeeId}`, {
      method: 'DELETE',
    }),

  /**
   * Get employee eligibility information
   * @param {string} employeeId - Employee ID
   * @returns {Promise<Object>} Eligibility details
   */
  getEligibility: (employeeId) =>
    request(`/api/v1/employees/${employeeId}/eligibility`),

  /**
   * Update employee status
   * @param {string} employeeId - Employee ID
   * @param {string} status - New status (active, inactive, terminated)
   * @returns {Promise<Object>} Updated employee
   */
  updateStatus: (employeeId, status) =>
    request(`/api/v1/employees/${employeeId}/status?status=${status}`, {
      method: 'PATCH',
    }),
};

// Dashboard API endpoints
export const dashboardAPI = {
  /**
   * Get dashboard statistics
   * @returns {Promise<Object>} Dashboard stats including employee counts
   */
  getStats: () => request('/api/v1/dashboard/stats'),

  /**
   * Get recent pay runs
   * @returns {Promise<Object>} Recent pay runs
   */
  getRecentPayruns: () => request('/api/v1/dashboard/recent-payruns'),

  /**
   * Get liabilities summary
   * @returns {Promise<Object>} Tax and statutory liabilities
   */
  getLiabilities: () => request('/api/v1/dashboard/liabilities'),
};

// Work Location API endpoints
export const workLocationAPI = {
  /**
   * Get all work locations
   * @param {Object} params - Query parameters (e.g., { is_active: true })
   * @returns {Promise<Array>} List of work locations
   */
  getAll: (params = {}) => {
    const queryString = new URLSearchParams(
      Object.entries(params).filter(([_, v]) => v != null)
    ).toString();
    const endpoint = queryString
      ? `/api/v1/settings/work-locations?${queryString}`
      : '/api/v1/settings/work-locations';
    return request(endpoint);
  },

  /**
   * Get a single work location by ID
   * @param {string} locationId - MongoDB ObjectId as string
   * @returns {Promise<Object>} Work location details
   */
  getById: (locationId) => request(`/api/v1/settings/work-locations/${locationId}`),

  /**
   * Create a new work location
   * @param {Object} locationData - Work location data
   * @returns {Promise<Object>} Created work location
   */
  create: (locationData) =>
    request('/api/v1/settings/work-locations', {
      method: 'POST',
      body: JSON.stringify(locationData),
    }),

  /**
   * Update a work location
   * @param {string} locationId - Work location ID
   * @param {Object} updateData - Partial work location data to update
   * @returns {Promise<Object>} Updated work location
   */
  update: (locationId, updateData) =>
    request(`/api/v1/settings/work-locations/${locationId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    }),

  /**
   * Delete a work location
   * @param {string} locationId - Work location ID
   * @returns {Promise<null>} No content on success
   */
  delete: (locationId) =>
    request(`/api/v1/settings/work-locations/${locationId}`, {
      method: 'DELETE',
    }),
};

// Department API endpoints
export const departmentAPI = {
  /**
   * Get all departments
   * @param {Object} params - Query parameters (e.g., { is_active: true })
   * @returns {Promise<Array>} List of departments
   */
  getAll: (params = {}) => {
    const queryString = new URLSearchParams(
      Object.entries(params).filter(([_, v]) => v != null)
    ).toString();
    const endpoint = queryString
      ? `/api/v1/departments/?${queryString}`
      : '/api/v1/departments/';
    return request(endpoint);
  },

  /**
   * Get a single department by ID
   * @param {string} departmentId - MongoDB ObjectId as string
   * @returns {Promise<Object>} Department details
   */
  getById: (departmentId) => request(`/api/v1/departments/${departmentId}`),

  /**
   * Create a new department
   * @param {Object} departmentData - Department data
   * @returns {Promise<Object>} Created department
   */
  create: (departmentData) =>
    request('/api/v1/departments/', {
      method: 'POST',
      body: JSON.stringify(departmentData),
    }),

  /**
   * Update a department
   * @param {string} departmentId - Department ID
   * @param {Object} updateData - Partial department data to update
   * @returns {Promise<Object>} Updated department
   */
  update: (departmentId, updateData) =>
    request(`/api/v1/departments/${departmentId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    }),

  /**
   * Delete a department
   * @param {string} departmentId - Department ID
   * @returns {Promise<null>} No content on success
   */
  delete: (departmentId) =>
    request(`/api/v1/departments/${departmentId}`, {
      method: 'DELETE',
    }),
};

// Designation API endpoints
export const designationAPI = {
  /**
   * Get all designations
   * @param {Object} params - Query parameters (e.g., { is_active: true })
   * @returns {Promise<Array>} List of designations
   */
  getAll: (params = {}) => {
    const queryString = new URLSearchParams(
      Object.entries(params).filter(([_, v]) => v != null)
    ).toString();
    const endpoint = queryString
      ? `/api/v1/designations/?${queryString}`
      : '/api/v1/designations/';
    return request(endpoint);
  },

  /**
   * Get a single designation by ID
   * @param {string} designationId - MongoDB ObjectId as string
   * @returns {Promise<Object>} Designation details
   */
  getById: (designationId) => request(`/api/v1/designations/${designationId}`),

  /**
   * Create a new designation
   * @param {Object} designationData - Designation data
   * @returns {Promise<Object>} Created designation
   */
  create: (designationData) =>
    request('/api/v1/designations/', {
      method: 'POST',
      body: JSON.stringify(designationData),
    }),

  /**
   * Update a designation
   * @param {string} designationId - Designation ID
   * @param {Object} updateData - Partial designation data to update
   * @returns {Promise<Object>} Updated designation
   */
  update: (designationId, updateData) =>
    request(`/api/v1/designations/${designationId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    }),

  /**
   * Delete a designation
   * @param {string} designationId - Designation ID
   * @returns {Promise<null>} No content on success
   */
  delete: (designationId) =>
    request(`/api/v1/designations/${designationId}`, {
      method: 'DELETE',
    }),
};

// Organization API endpoints
export const organizationAPI = {
  /**
   * Get organization settings
   * @returns {Promise<Object>} Organization settings
   */
  get: () => request('/api/v1/settings/organization'),

  /**
   * Update organization settings
   * @param {Object} orgData - Organization data to update
   * @returns {Promise<Object>} Updated organization
   */
  update: (orgData) =>
    request('/api/v1/settings/organization', {
      method: 'PUT',
      body: JSON.stringify(orgData),
    }),

  /**
   * Upload organization logo
   * @param {File} file - Logo file to upload
   * @returns {Promise<Object>} Upload response with logo URL
   */
  uploadLogo: async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/api/v1/settings/organization/logo`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        errorData = { detail: response.statusText };
      }
      throw new APIError(
        errorData.detail || errorData.message || 'Upload failed',
        response.status,
        errorData
      );
    }

    return await response.json();
  },

  /**
   * Delete organization logo
   * @returns {Promise<Object>} Delete confirmation
   */
  deleteLogo: () =>
    request('/api/v1/settings/organization/logo', {
      method: 'DELETE',
    }),

  /**
   * Get logo URL
   * @param {string} filename - Logo filename
   * @returns {string} Full logo URL
   */
  getLogoUrl: (filename) => `${API_BASE_URL}/api/v1/settings/organization/logo/${filename}`,
};

export { APIError };
