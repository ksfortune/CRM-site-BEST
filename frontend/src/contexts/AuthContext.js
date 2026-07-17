import React, { createContext, useContext, useState, useEffect } from 'react';
import { useData } from './DataContext';

const AuthContext = createContext();
const SESSION_KEY = 'warmcontacts_currentUser';

function readStoredSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function resolveUser(users, session) {
  if (!session || !users?.length) return null;
  const found = users.find(
    (u) => u.id === session.id || (u.email && session.email && u.email.toLowerCase() === session.email.toLowerCase())
  );
  if (!found || found.isBlocked || !found.isApproved) return null;
  return found;
}

export function AuthProvider({ children }) {
  const { users, updateUser } = useData();

  const [currentUser, setCurrentUser] = useState(() => resolveUser(users, readStoredSession()));
  const loading = false;

  useEffect(() => {
    const session = readStoredSession();
    if (!session) {
      if (currentUser) {
        // keep in-memory user if still in list
        const fresh = resolveUser(users, currentUser);
        if (fresh) setCurrentUser(fresh);
        else setCurrentUser(null);
      }
      return;
    }

    const fresh = resolveUser(users, session);
    if (fresh) {
      setCurrentUser(fresh);
      localStorage.setItem(SESSION_KEY, JSON.stringify(fresh));
    } else if (users.length > 0) {
      // users loaded and session user действительно отсутствует
      setCurrentUser(null);
      localStorage.removeItem(SESSION_KEY);
    }
  }, [users]); // eslint-disable-line react-hooks/exhaustive-deps

  const login = (email, password) => {
    const normalized = (email || '').trim().toLowerCase();
    const user = users.find(
      (u) => (u.email || '').toLowerCase() === normalized && u.password === password
    );
    if (!user) throw new Error('Неверный email или пароль');
    if (user.isBlocked) throw new Error('Пользователь заблокирован');
    if (!user.isApproved) throw new Error('Регистрация не подтверждена администратором');
    setCurrentUser(user);
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    return user;
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem(SESSION_KEY);
  };

  const changePassword = (oldPass, newPass) => {
    if (currentUser.password !== oldPass) throw new Error('Старый пароль неверен');
    updateUser(currentUser.id, { password: newPass });
    const updated = { ...currentUser, password: newPass };
    setCurrentUser(updated);
    localStorage.setItem(SESSION_KEY, JSON.stringify(updated));
  };

  const updateProfile = (updates) => {
    updateUser(currentUser.id, updates);
    const updated = { ...currentUser, ...updates };
    setCurrentUser(updated);
    localStorage.setItem(SESSION_KEY, JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider value={{ currentUser, login, logout, changePassword, updateProfile, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
