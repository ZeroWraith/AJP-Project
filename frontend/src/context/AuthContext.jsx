import { createContext, useContext, useState, useMemo } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('jwt_user');
    return stored ? JSON.parse(stored) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('jwt_token'));

  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    const data = response.data;
    const userData = {
      id: data.userId,
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      role: data.role,
    };
    localStorage.setItem('jwt_token', data.accessToken);
    localStorage.setItem('jwt_user', JSON.stringify(userData));
    setToken(data.accessToken);
    setUser(userData);
    return userData;
  };

  const register = async (formData) => {
    const response = await api.post('/auth/register', formData);
    return response.data;
  };

  const logout = () => {
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('jwt_user');
    setToken(null);
    setUser(null);
  };

  const isAuthenticated = !!token && !!user;

  const hasRole = (role) => {
    if (Array.isArray(role)) {
      return user && role.includes(user.role);
    }
    return user?.role === role;
  };

  const value = useMemo(
    () => ({ user, token, login, register, logout, isAuthenticated, hasRole }),
    [user, token, isAuthenticated]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
