import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api.js';

const AuthContext = createContext(null);

export const DEMO_CREDENTIALS = [
  {
    role: 'student',
    title: 'Alex Rivera',
    label: 'Student / Reporter',
    email: 'alex.student@campus.edu',
    password: 'Student123!',
    badge: 'Campus Student',
    color: 'bg-blue-600'
  },
  {
    role: 'admin',
    title: 'Dr. Evelyn Patel',
    label: 'Campus Administrator',
    email: 'dr.patel@campus.edu',
    password: 'Admin123!',
    badge: 'Facilities Director',
    color: 'bg-purple-600'
  },
  {
    role: 'staff',
    title: 'Marcus Vance',
    label: 'Staff (Electrical)',
    email: 'marcus.elec@campus.edu',
    password: 'Staff123!',
    badge: 'Electrical Lead',
    color: 'bg-amber-600'
  },
  {
    role: 'staff',
    title: 'Sarah Jenkins',
    label: 'Staff (Plumbing)',
    email: 'sarah.plumb@campus.edu',
    password: 'Staff123!',
    badge: 'Plumbing Specialist',
    color: 'bg-cyan-600'
  }
];

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('scf_token'));
  const [loading, setLoading] = useState(true);

  const fetchCurrentUser = useCallback(async () => {
    // Check if URL has a quick demo role switcher parameter: ?role=student | admin | staff
    const searchParams = new URLSearchParams(window.location.search);
    const queryRole = searchParams.get('role') || searchParams.get('demo');
    if (queryRole) {
      const demo = DEMO_CREDENTIALS.find(d => d.role.toLowerCase() === queryRole.toLowerCase() || d.email.toLowerCase() === queryRole.toLowerCase());
      if (demo) {
        try {
          const data = await api.login({ email: demo.email, password: demo.password });
          localStorage.setItem('scf_token', data.token);
          setToken(data.token);
          setUser(data.user);
          setLoading(false);
          return;
        } catch (e) {
          console.warn('Auto demo login parameter failed:', e);
        }
      }
    }

    const storedToken = localStorage.getItem('scf_token');
    if (!storedToken) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const data = await api.getMe();
      setUser(data.user);
    } catch (err) {
      console.warn('Session expired or invalid token:', err);
      localStorage.removeItem('scf_token');
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  const login = async (email, password) => {
    const data = await api.login({ email, password });
    localStorage.setItem('scf_token', data.token);
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const register = async (userData) => {
    const data = await api.register(userData);
    localStorage.setItem('scf_token', data.token);
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem('scf_token');
    setToken(null);
    setUser(null);
  };

  const loginAsDemo = async (roleOrEmail) => {
    const demo = DEMO_CREDENTIALS.find(d => d.role === roleOrEmail || d.email === roleOrEmail);
    if (!demo) throw new Error('Demo account not found');
    return await login(demo.email, demo.password);
  };

  const getDefaultRedirect = (role) => {
    if (role === 'admin') return '/admin';
    if (role === 'staff') return '/staff';
    return '/dashboard';
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        loginAsDemo,
        refreshUser: fetchCurrentUser,
        getDefaultRedirect
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
