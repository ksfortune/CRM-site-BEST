import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { Link } from 'react-router-dom';
import SocialChips from '../components/SocialChips';
import Modal from '../components/Modal';

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
  const [socialsOpen, setSocialsOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);

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
      <div className="identity-bar">
        <span className="chip-avatar lg">{getInitials() || 'К'}</span>
        <div>
          <h1>{currentUser.firstName} {currentUser.lastName}</h1>
          <p className="profile-role">
            Статус: {currentUser.role === 'admin' ? 'Администратор' : 'Пользователь'}
          </p>
        </div>
      </div>

      <div className="profile-grid">
        <section className="profile-card">
          <h3>Основная информация</h3>
          <p className="info-line"><span>Email:</span> {currentUser.email}</p>
          <p className="info-line">
            <span>Номер телефона:</span>
            <input
              className="inline-input"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                setDirty(true);
              }}
              placeholder="+7..."
            />
          </p>
          <button type="button" className="text-action" onClick={() => setPasswordOpen((v) => !v)}>
            Смена пароля:
          </button>
          {passwordOpen && (
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
          )}
          <button type="button" className="text-action center" onClick={() => setSocialsOpen(true)}>
            Добавить соц-сеть
          </button>
          {dirty && (
            <button className="save-profile-btn" onClick={saveProfile}>
              Сохранить изменения
            </button>
          )}
        </section>

        <section className="profile-card">
          <h3>Компании, над которыми я работаю</h3>
          {myCompanies.length === 0 ? (
            <p className="empty-message">Вы ещё не заняли ни одной компании</p>
          ) : (
            <div className="my-companies-list">
              {myCompanies.map((company) => (
                <Link key={company.id} to="/companies" className="company-badge">
                  {company.name}
                </Link>
              ))}
            </div>
          )}
          {currentUser.role === 'admin' && (
            <Link to="/admin" className="admin-link-inline">Члены отдела</Link>
          )}
        </section>
      </div>

      {message.text && <div className={`profile-message ${message.type}`}>{message.text}</div>}

      <Modal isOpen={socialsOpen} onClose={() => setSocialsOpen(false)} title="Соц-сети" className="modal-social">
        <SocialChips
          channels={channelsFromSocials(socials)}
          onChange={(channels) => {
            setSocials(socialsFromChannels(channels));
            setDirty(true);
          }}
        />
        <div className="social-modal-actions">
          <button type="button" className="text-action" onClick={saveProfile}>Сохранить соц-сеть</button>
          <button type="button" className="text-action" onClick={() => setSocialsOpen(false)}>Добавить еще соц-сеть</button>
        </div>
      </Modal>
    </div>
  );
}
