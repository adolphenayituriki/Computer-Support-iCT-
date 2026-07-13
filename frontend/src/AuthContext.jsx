import { createContext, useContext, useState, useEffect } from 'react';
import API_BASE from './api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('cshub_token');
    if (saved) {
      setToken(saved);
      fetch(`${API_BASE}/api/auth/me`, {
        headers: { Authorization: `Bearer ${saved}` },
      })
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          if (data && data.user) setUser(data.user);
          else localStorage.removeItem('cshub_token');
        })
        .catch(() => localStorage.removeItem('cshub_token'))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    let res;
    try {
      res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
    } catch {
      throw new Error('Cannot reach server. Make sure the backend is running on port 3001.');
    }
    let data;
    try {
      data = await res.json();
    } catch {
      throw new Error('Server returned an empty response. Is the backend running?');
    }
    if (!res.ok) throw new Error(data.error);
    localStorage.setItem('cshub_token', data.token);
    setToken(data.token);
    setUser(data.user);
    return data;
  };

  const register = async (name, email, password, phone) => {
    let res;
    try {
      res = await fetch(`${API_BASE}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, phone }),
      });
    } catch {
      throw new Error('Cannot reach server. Make sure the backend is running on port 3001.');
    }
    let data;
    try {
      data = await res.json();
    } catch {
      throw new Error('Server returned an empty response. Is the backend running?');
    }
    if (!res.ok) throw new Error(data.error);
    localStorage.setItem('cshub_token', data.token);
    setToken(data.token);
    setUser(data.user);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('cshub_token');
    setToken(null);
    setUser(null);
  };

  const updateProfile = async (name, email) => {
    const res = await fetch(`${API_BASE}/api/auth/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('cshub_token')}` },
      body: JSON.stringify({ name, email }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    localStorage.setItem('cshub_token', data.token);
    setToken(data.token);
    setUser(data.user);
    return data;
  };

  const changePassword = async (currentPassword, newPassword) => {
    const res = await fetch(`${API_BASE}/api/auth/password`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('cshub_token')}` },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    return data;
  };

  const loginByPhone = async (phone) => {
    let res;
    try {
      res = await fetch(`${API_BASE}/api/auth/login-phone`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });
    } catch {
      throw new Error('Cannot reach server. Make sure the backend is running on port 3001.');
    }
    let data;
    try {
      data = await res.json();
    } catch {
      throw new Error('Server returned an empty response. Is the backend running?');
    }
    if (!res.ok) throw new Error(data.error);
    localStorage.setItem('cshub_token', data.token);
    setToken(data.token);
    setUser(data.user);
    return data;
  };

  const googleLogin = async (idToken) => {
    let res;
    try {
      res = await fetch(`${API_BASE}/api/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      });
    } catch {
      throw new Error('Cannot reach server. Make sure the backend is running on port 3001.');
    }
    let data;
    try {
      data = await res.json();
    } catch {
      throw new Error('Server returned an empty response. Is the backend running?');
    }
    if (!res.ok) throw new Error(data.error);
    localStorage.setItem('cshub_token', data.token);
    setToken(data.token);
    setUser(data.user);
    return data;
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, loginByPhone, googleLogin, register, logout, updateProfile, changePassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
