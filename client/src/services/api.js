import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true // allows cookie parsing
});

// Interceptor to inject JWT from localStorage
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Auth endpoints
export const registerUser = (userData) => API.post('/auth/register', userData);
export const loginUser = (userData) => API.post('/auth/login', userData);
export const logoutUser = () => API.post('/auth/logout');
export const getUserProfile = () => API.get('/auth/profile');

// Folder endpoints
export const getFolders = (parentFolderId = null) => {
  return API.get(`/folders?parentFolderId=${parentFolderId || 'null'}`);
};
export const createFolder = (name, parentFolderId = null) => {
  return API.post('/folders', { name, parentFolderId });
};

// Document endpoints
export const getDocuments = (folderId = null, search = '') => {
  return API.get(`/documents?folderId=${folderId || 'null'}&search=${search}`);
};
export const uploadDocument = (formData) => {
  return API.post('/documents/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};
export const downloadDocument = (docId) => API.get(`/documents/${docId}/download`);
export const deleteDocument = (docId) => API.delete(`/documents/${docId}`);
export const shareDocument = (docId) => API.post(`/documents/${docId}/share`);

// Shared endpoints (Public)
export const getSharedDocument = (token) => API.get(`/shared/${token}`);

