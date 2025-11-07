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

export { APIError };
