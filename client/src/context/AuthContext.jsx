import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('learnhub_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('learnhub_token') || null);
  const [loading, setLoading] = useState(true);

  // Initialize and verify user on mount
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('learnhub_token');
      if (storedToken) {
        try {
          const res = await authService.getMe();
          if (res.data?.user) {
            setUser(res.data.user);
            localStorage.setItem('learnhub_user', JSON.stringify(res.data.user));
          }
        } catch (error) {
          console.warn('Session expired or invalid:', error.message);
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();

    // Listen to 401 unauthorized events
    const handleUnauthorized = () => {
      setUser(null);
      setToken(null);
    };
    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, []);

  const login = async (credentials) => {
    const res = await authService.login(credentials);
    const { token: receivedToken, data } = res;
    setToken(receivedToken);
    setUser(data.user);
    localStorage.setItem('learnhub_token', receivedToken);
    localStorage.setItem('learnhub_user', JSON.stringify(data.user));
    return data.user;
  };

  const register = async (userData) => {
    const res = await authService.register(userData);
    const { token: receivedToken, data } = res;
    setToken(receivedToken);
    setUser(data.user);
    localStorage.setItem('learnhub_token', receivedToken);
    localStorage.setItem('learnhub_user', JSON.stringify(data.user));
    return data.user;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('learnhub_token');
    localStorage.removeItem('learnhub_user');
  };

  const updateUserProfile = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('learnhub_user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!user && !!token,
        isAdmin: user?.role === 'admin',
        isTeacher: user?.role === 'teacher',
        isStudent: user?.role === 'student',
        login,
        register,
        logout,
        updateUserProfile,
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

export default AuthContext;
