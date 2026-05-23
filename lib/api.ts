import axios from 'axios';

const API_BASE = 'https://elmi-courier-backend-production.up.railway.app';

const api = axios.create({ baseURL: API_BASE });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('elmi_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
