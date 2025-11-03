import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { apiConfig } from '../config/api';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const rawUser = localStorage.getItem('user');

    let parsedUser = null;
    try {
      parsedUser = rawUser ? JSON.parse(rawUser) : null;
    } catch (_) {
      // Corrupt value in localStorage; clear it to avoid crashes
      localStorage.removeItem('user');
    }

    if (token && parsedUser) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(parsedUser);
      setLoading(false);
    } else if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUser = async () => {
    try {
      const response = await axios.get(apiConfig.endpoints.me);
      const userData = response.data;
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
    } catch (error) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      delete axios.defaults.headers.common['Authorization'];
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await axios.post(apiConfig.endpoints.login, {
        email,
        password,
      });
      
      const { user: userData, token } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(userData);
      
      return { success: true, user: userData };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed' 
      };
    }
  };

  const register = async (name, email, password, password_confirmation, special_code) => {
    try {
      const response = await axios.post(apiConfig.endpoints.register, {
        name,
        email,
        password,
        password_confirmation,
        special_code,
      });
      
      const { user: userData, token } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(userData);
      
      return { success: true, user: userData };
    } catch (error) {
      // Check for email already exists error
      if (error.response?.data?.message) {
        return { 
          success: false, 
          message: error.response.data.message 
        };
      }
      // Check if email validation error exists
      if (error.response?.data?.errors?.email) {
        return { 
          success: false, 
          message: 'Request failed: Email already used' 
        };
      }
      return { 
        success: false, 
        message: error.response?.data?.message || 'Registration failed' 
      };
    }
  };

  const logout = async () => {
    try {
      await axios.post(apiConfig.endpoints.logout);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      delete axios.defaults.headers.common['Authorization'];
      setUser(null);
    }
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
