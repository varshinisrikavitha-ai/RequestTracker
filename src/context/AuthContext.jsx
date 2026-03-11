import React, { createContext, useState, useContext, useEffect } from 'react';
import * as authApi from '../api/auth.api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount: if a token exists, verify it with /auth/me
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }
    authApi
      .getMe()
      .then((res) => {
        setUser(res.data.data);
      })
      .catch(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('currentUser');
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    try {
      const res = await authApi.login(email, password);
      const { user: loggedInUser, token } = res.data.data;
      localStorage.setItem('token', token);
      localStorage.setItem('currentUser', JSON.stringify(loggedInUser));
      setUser(loggedInUser);
      return { success: true, user: loggedInUser };
    } catch (err) {
      const message = err?.response?.data?.message || 'Login failed. Check your credentials.';
      return { success: false, error: message };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
  };

  // Accepts a single role string or array of roles (backend UPPERCASE enum values)
  const hasRole = (requiredRoles) => {
    if (!user) return false;
    if (typeof requiredRoles === 'string') {
      return user.role === requiredRoles;
    }
    return requiredRoles.includes(user.role);
  };

  const value = {
    user,
    loading,
    login,
    logout,
    hasRole,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

