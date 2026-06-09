import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem('mesa_user');
    return raw ? JSON.parse(raw) : null;
  });

  useEffect(() => {
    if (!localStorage.getItem('mesa_token')) return;
    api.get('/auth/me').then((res) => setUser(res.data.user)).catch(() => logout());
  }, []);

  async function login(credentials) {
    const res = await api.post('/auth/login', credentials);
    localStorage.setItem('mesa_token', res.data.token);
    localStorage.setItem('mesa_user', JSON.stringify(res.data.user));
    setUser(res.data.user);
  }

  function logout() {
    localStorage.removeItem('mesa_token');
    localStorage.removeItem('mesa_user');
    setUser(null);
  }

  const value = useMemo(() => ({ user, login, logout, isAdmin: user?.rol === 'administrador' }), [user]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
