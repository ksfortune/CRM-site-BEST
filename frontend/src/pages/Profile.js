import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { Link } from 'react-router-dom';
import SocialChips from '../components/SocialChips';

export default function Profile() {
  const { currentUser, updateProfile, changePassword } = useAuth();
  const { companies } = useData();
  const [phone, setPhone] = useState(currentUser.phone || '');
  const [socials, setSocials] = useState(currentUser.socials || []);
  const [oldPass, setOldPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' });
  const [dirty, setDirty] = useState(false);

  const myCompanies = companies.filter((c) => c.occupiedBy === currentUser.id);

  useEffect(() => {
    setPhone(currentUser.phone || '');
    setSocials(currentUser.socials || []);
    setDirty(false);
  }, [currentUser]);

  const channelsFromSocials = (list) =>
    (list || []).map((s) => ({ type: s.type, value: s.url || s.value || '' }));

  const socialsFromChannels = (channels) =>
    channels.map((c) => ({ type: c.type, url: c.value || '' }));

  const saveProfile = async () => {
    try {
      await updateProfile({ socials, phone });
      setMessage({ text: 'Профиль успешно обновлён!', type: 'success' });
      setDirty(false);
      setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    } catch (err) {
      setMessage({ text: err.message, type: 'error' });
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (newPass !== confirmPass) {
      setMessage({ text: 'Новые пароли не совпадают', type: 'error' });
      return;
    }
    if (newPass.length < 4) {
      setMessage({ text: 'Пароль должен быть не менее 4 символов', type: 'error' });
      return;
    }
    try {
      await changePassword(oldPass, newPass);
      setMessage({ text: 'Пароль успешно изменён!', type: 'success' });
      setOldPass('');
      setNewPass('');
      setConfirmPass('');
      setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    } catch (err) {
      setMessage({ text: err.message, type: 'error' });
    }
  };

  const getInitials = () => {
    return `${currentUser.firstName?.[0] || ''}${currentUser.lastName?.[0] || ''}`.toUpperCase();
  };

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-avatar">
          <span>{getInitials() || '👤'}</span>
        </div>
        <div className="profile-title">
          <h1>
            {currentUser.firstName} {currentUser.lastName}
          </h1>
          <p className="profile-role">
            {currentUser.role === 'admin' ? 'Администратор' : 'Пользователь'}
          </p>
          {currentUser.role === 'admin' && (
            <Link to="/admin" className="admin-link-inline">
              Панель
            </Link>
          )}
        </div>
      </div>

      <div className="profile-grid">
        <div className="profile-card">
          <h3>Основная информация</h3>
          <div className="info-row">
            <span className="info-label">Email (логин):</span>
            <span className="info-value">{currentUser.email}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Лучшая почта:</span>
            <span className="info-value">{currentUser.bestEmail || '—'}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Телефон:</span>
            <span className="info-value">
              <input
                className="inline-input"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  setDirty(true);
                }}
                placeholder="+7..."
              />
            </span>
          </div>
          <div className="info-row">
            <span className="info-label">Дата регистрации:</span>
            <span className="info-value">
              {new Date(currentUser.createdAt).toLocaleDateString('ru-RU')}
            </span>
          </div>
        </div>

        <div className="profile-card">
          <h3>Социальные сети</h3>
          <SocialChips
            channels={channelsFromSocials(socials)}
            onChange={(channels) => {
              setSocials(socialsFromChannels(channels));
              setDirty(true);
            }}
          />
          {dirty && (
            <button className="save-profile-btn" onClick={saveProfile}>
              Сохранить изменения
            </button>
          )}
        </div>

        <div className="profile-card">
          <h3>Смена пароля</h3>
          <form onSubmit={handlePasswordChange} className="password-form">
            <input
              type="password"
              placeholder="Старый пароль"
              value={oldPass}
              onChange={(e) => setOldPass(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Новый пароль"
              value={newPass}
              onChange={(e) => setNewPass(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Подтвердите новый пароль"
              value={confirmPass}
              onChange={(e) => setConfirmPass(e.target.value)}
              required
            />
            <button type="submit">Изменить пароль</button>
          </form>
        </div>

        <div className="profile-card full-width">
          <h3>Компании, над которыми я работаю</h3>
          {myCompanies.length === 0 ? (
            <p className="empty-message">Вы ещё не заняли ни одной компании</p>
          ) : (
            <div className="my-companies-list">
              {myCompanies.map((company) => (
                <div key={company.id} className="company-badge">
                  <span className="company-name">{company.name}</span>
                  <span className={`status-badge ${company.status}`}>
                    {company.status === 'hot' ? 'Горячий' : 'Тёплый'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {message.text && <div className={`profile-message ${message.type}`}>{message.text}</div>}
    </div>
  );
}
