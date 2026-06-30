import axios from 'axios';

const axiosAuth = axios.create();  // new separate axios instance

axiosAuth.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');    // login token
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;   // if token exists it attaches it to request's authorization header in that format
  }
  return config;  // returns the modified request configuration
});

export default axiosAuth;

// axiosAuth for cars, schedules, reviews, history (user-specific data needing auth) 
// plain axios for session-check/login/logout.