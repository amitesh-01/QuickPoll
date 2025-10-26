import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../api';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      setUser(JSON.parse(userData));
    }
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    try {
      setLoading(true);
      console.log('Attempting login with:', credentials);
      
      const response = await authAPI.login(credentials);
      console.log('Login response:', response.data);
      const { access_token } = response.data;
      
      // Store token first
      localStorage.setItem('token', access_token);
      console.log('Token stored, fetching profile...');
      
      // Now fetch user profile
      const profileResponse = await authAPI.getProfile();
      console.log('Profile response:', profileResponse.data);
      const userData = profileResponse.data;
      
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      
      toast.success('Login successful!');
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      const message = error.response?.data?.detail || 'Login failed';
      toast.error(message);
      // Clear token if login fails
      localStorage.removeItem('token');
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      // Register user first
      await authAPI.register(userData);
      
      // Now login with the same credentials
      const loginResult = await login({
        username: userData.username,
        password: userData.password
      });
      
      if (loginResult.success) {
        toast.success('Registration successful!');
        return { success: true };
      } else {
        return { success: false, error: 'Registration completed but login failed' };
      }
    } catch (error) {
      const message = error.response?.data?.detail || 'Registration failed';
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    toast.success('Logged out successfully!');
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};