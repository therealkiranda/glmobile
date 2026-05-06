// src/context/AuthContext.js
// Author: Kiran Khadka, Contact: +977-9869756622, Mail: therealkiranda@gmail.com
// © 2026 Kiran Khadka. All rights reserved.
import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const API_BASE = 'https://hotel.primelogic.com.np/api';

export const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser]           = useState(null);
  const [loading, setLoading]     = useState(true);
  const [hotelInfo, setHotelInfo] = useState({ name: 'Hotel', tagline: '' });
  const [theme, setTheme]         = useState({
    primary_color: '#1a3c2e',
    secondary_color: '#c9a96e',
    background_color: '#f4f1eb',
    accent_color: '#065f46',
  });

  useEffect(() => {
    const timeout = setTimeout(() => setLoading(false), 3000);
    checkAuth().finally(() => {
      clearTimeout(timeout);
      setLoading(false);
    });
  }, []);

  const fetchHotelMeta = async () => {
    try {
      const [infoRes, themeRes] = await Promise.all([
        api.get('/admin/hotel-info'),
        api.get('/admin/theme'),
      ]);
      if (infoRes.data?.name) setHotelInfo(infoRes.data);
      if (themeRes.data?.primary_color) setTheme(themeRes.data);
    } catch {}
  };

  const registerPush = async () => {
    try {
      const { registerPushToken } = require('../services/NotificationService');
      await registerPushToken(api);
    } catch {}
  };

  const checkAuth = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('gl_token');
      const storedUser  = await AsyncStorage.getItem('gl_user');
      if (storedToken && storedUser) {
        api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
        setUser(JSON.parse(storedUser));
        fetchHotelMeta();
        setTimeout(() => registerPush(), 2000);
      }
    } catch (e) {
      console.error('checkAuth:', e);
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
      fetchHotelMeta();
      setTimeout(() => registerPush(), 2000);
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
    <AuthContext.Provider value={{ user, loading, login, logout, api, hotelInfo, theme }}>
      {children}
    </AuthContext.Provider>
  );
};
