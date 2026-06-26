import React, { createContext, useContext, useState, useEffect } from 'react';
import API from '../api/axios';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkUserAuth = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const res = await API.get('/users/profile');
      setUser(res.data.data || res.data);
    } catch (err) {
      // Token is invalid or expired — clean it up
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkUserAuth();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await API.post('/auth/login', { email, password });

      // Handle various response shapes from backend
      const payload = res.data?.data || res.data;
      const token = payload?.token || res.data?.token;
      const userData = payload?.user || payload;

      if (token) {
        localStorage.setItem('token', token);
        // Immediately attach to future requests
        API.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      }

      setUser(userData);
      toast.success('Logged in successfully!');
      return true;
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        'Failed to login';
      toast.error(message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password) => {
    setLoading(true);
    try {
      const res = await API.post('/auth/register', { name, email, password });

      const payload = res.data?.data || res.data;
      const token = payload?.token || res.data?.token;
      const userData = payload?.user || payload;

      if (token) {
        localStorage.setItem('token', token);
        API.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      }

      setUser(userData);
      toast.success('Registered successfully!');
      return true;
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        'Registration failed';
      toast.error(message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await API.post('/auth/logout');
    } catch (err) {
      // Ignore — we still clear state below
    } finally {
      localStorage.removeItem('token');
      delete API.defaults.headers.common['Authorization'];
      setUser(null);
      toast.success('Logged out successfully!');
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, register, logout, checkUserAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);