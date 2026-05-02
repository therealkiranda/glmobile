// src/context/AuthContext.js
// Fixed: correct API URL /api/auth/admin/login, correct response fields (admin not user)
import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const API_BASE = 'https://hotel.primelogic.com.np/api';

export const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { checkAuth(); }, []);

  const checkAuth = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('gl_token');
      const storedUser  = await AsyncStorage.getItem('gl_user');
      if (storedToken && storedUser) {
        api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
        setUser(JSON.parse(storedUser));
      }
    } catch (e) {
      console.error('checkAuth:', e);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/admin/login', { email, password });
      const { token, admin } = response.data;
      await AsyncStorage.setItem('gl_token', token);
      await AsyncStorage.setItem('gl_user', JSON.stringify(admin));
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(admin);
      return { success: true };
    } catch (error) {
      const msg = error.response?.data?.error
        || error.response?.data?.message
        || (error.code === 'ECONNABORTED' ? 'Connection timeout' : null)
        || error.message
        || 'Login failed';
      return { success: false, error: msg };
    }
  };

  const logout = async () => {
    await AsyncStorage.multiRemove(['gl_token', 'gl_user']);
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, api }}>
      {children}
    </AuthContext.Provider>
  );
};
