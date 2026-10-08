import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser =
      localStorage.getItem('betterform_user') ||
      localStorage.getItem('jobform_user');
    try {
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(
    () =>
      localStorage.getItem('betterform_token') ||
      localStorage.getItem('jobform_token')
  );
  const [loading, setLoading] = useState(true);

  // Validate token and fetch current user profile on app load
  useEffect(() => {
    const fetchCurrentUser = async () => {
      const storedToken =
        localStorage.getItem('betterform_token') ||
        localStorage.getItem('jobform_token');
      if (!storedToken) {
        setLoading(false);
        return;
      }

      try {
        const res = await api.get('/auth/me');
        if (res.data.success && res.data.user) {
          setUser(res.data.user);
          localStorage.setItem('betterform_user', JSON.stringify(res.data.user));
        }
      } catch (err) {
        console.warn('Session verification failed:', err.response?.data?.message || err.message);
        logout();
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentUser();
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data.success) {
      const { token: receivedToken, user: receivedUser } = res.data;
      setToken(receivedToken);
      setUser(receivedUser);
      localStorage.setItem('betterform_token', receivedToken);
      localStorage.setItem('betterform_user', JSON.stringify(receivedUser));
    }
    return res.data;
  };

  const register = async ({ name, email, password, companyName }) => {
    const res = await api.post('/auth/register', { name, email, password, companyName });
    if (res.data.success) {
      const { token: receivedToken, user: receivedUser } = res.data;
      setToken(receivedToken);
      setUser(receivedUser);
      localStorage.setItem('betterform_token', receivedToken);
      localStorage.setItem('betterform_user', JSON.stringify(receivedUser));
    }
    return res.data;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('betterform_token');
    localStorage.removeItem('betterform_user');
    localStorage.removeItem('jobform_token');
    localStorage.removeItem('jobform_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!token && !!user,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
