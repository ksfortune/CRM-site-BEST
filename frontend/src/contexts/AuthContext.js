import React, { createContext, useContext, useState, useEffect } from 'react';
import { useData } from './DataContext';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const { users, updateUser } = useData();
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Восстанавливаем пользователя из localStorage при загрузке
    const stored = localStorage.getItem('warmcontacts_currentUser');
    if (stored) {
      const user = JSON.parse(stored);
      // Проверяем, что пользователь всё ещё существует в актуальном списке users и не заблокирован/подтверждён
      const freshUser = users.find(u => u.id === user.id);
      if (freshUser && !freshUser.isBlocked && freshUser.isApproved) {
        setCurrentUser(freshUser);
      } else {
        localStorage.removeItem('warmcontacts_currentUser');
      }
    }
    setLoading(false);
  }, [users]); // Зависимость от users, чтобы обновить если данные пользователей изменились

  const login = (email, password) => {
    const user = users.find(u => u.email === email && u.password === password);
    if (!user) throw new Error('Неверный email или пароль');
    if (user.isBlocked) throw new Error('Пользователь заблокирован');
    if (!user.isApproved) throw new Error('Регистрация не подтверждена администратором');
    setCurrentUser(user);
    localStorage.setItem('warmcontacts_currentUser', JSON.stringify(user));
    return user;
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('warmcontacts_currentUser');
  };

  const changePassword = (oldPass, newPass) => {
    if (currentUser.password !== oldPass) throw new Error('Старый пароль неверен');
    updateUser(currentUser.id, { password: newPass });
    const updated = { ...currentUser, password: newPass };
    setCurrentUser(updated);
    localStorage.setItem('warmcontacts_currentUser', JSON.stringify(updated));
  };

  const updateProfile = (updates) => {
    updateUser(currentUser.id, updates);
    const updated = { ...currentUser, ...updates };
    setCurrentUser(updated);
    localStorage.setItem('warmcontacts_currentUser', JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider value={{ currentUser, login, logout, changePassword, updateProfile, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() { return useContext(AuthContext); }