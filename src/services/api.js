import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    const userString = localStorage.getItem('user');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    if (userString) {
      try {
        const user = JSON.parse(userString);
        if (user) {
          if (user.email) config.headers['x-user-email'] = user.email;
          if (user.name) config.headers['x-user-name'] = user.name;
        }
      } catch (e) {
        console.error('Error parsing user for headers', e);
      }
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle 401/403 and token refresh
api.interceptors.response.use(
  (response) => {
    // Return data directly as the rest of the app expects it
    return response.data;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 (Unauthorized) - attempt to refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) throw new Error('No refresh token');

        const { data } = await axios.post('/api/auth/refresh', { refreshToken });
        localStorage.setItem('accessToken', data.accessToken);
        
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh token failed, logout user
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    // Handle 403 (Forbidden)
    if (error.response?.status === 403) {
      console.error('Permission denied access');
    }

    return Promise.reject(error);
  }
);

export default api;
