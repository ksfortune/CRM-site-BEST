import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useData } from './DataContext';
import type { User } from '../types';

interface AuthContextValue {
  currentUser: User | null;
  login: (email: string, password: string) => User;
  logout: () => void;
  changePassword: (oldPass: string, newPass: string) => void;
  updateProfile: (updates: Partial<User>) => void;
  loading: boolean;
}

interface StoredSession {
  id?: string;
  email?: string;
}

const AuthContext = createContext<AuthContextValue | null>(null);
const SESSION_KEY = 'warmcontacts_currentUser';

function readStoredSession(): StoredSession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;
    return parsed as StoredSession;
  } catch {
    return null;
  }
}

function resolveUser(users: User[], session: StoredSession | null): User | null {
  if (!session || !users?.length) return null;
  const found = users.find(
    (u) => u.id === session.id || (u.email && session.email && u.email.toLowerCase() === session.email.toLowerCase())
  );
  if (!found || found.isBlocked || !found.isApproved) return null;
  return found;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const { users, updateUser } = useData();

  const [currentUser, setCurrentUser] = useState<User | null>(() => resolveUser(users, readStoredSession()));
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

  const login = (email: string, password: string): User => {
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

  const changePassword = (oldPass: string, newPass: string) => {
    if (!currentUser) throw new Error('Нет активной сессии');
    if (currentUser.password !== oldPass) throw new Error('Старый пароль неверен');
    updateUser(currentUser.id, { password: newPass });
    const updated = { ...currentUser, password: newPass };
    setCurrentUser(updated);
    localStorage.setItem(SESSION_KEY, JSON.stringify(updated));
  };

  const updateProfile = (updates: Partial<User>) => {
    if (!currentUser) throw new Error('Нет активной сессии');
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

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth должен вызываться внутри AuthProvider');
  }
  return context;
}
