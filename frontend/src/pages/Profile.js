import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { Link } from 'react-router-dom';

export default function Profile() {
  const { currentUser, updateProfile, changePassword } = useAuth();
  const { companies } = useData();
  const [socials, setSocials] = useState(currentUser.socials || []);
  const [oldPass, setOldPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' });
  const [isEditingSocial, setIsEditingSocial] = useState(false);

  const myCompanies = companies.filter(c => c.occupiedBy === currentUser.id);

  useEffect(() => {
    setSocials(currentUser.socials || []);
  }, [currentUser]);

  const addSocial = () => {
    setSocials([...socials, { type: 'tg', url: '' }]);
    setIsEditingSocial(true);
  };

  const updateSocial = (idx, field, val) => {
    const newList = [...socials];
    newList[idx][field] = val;
    setSocials(newList);
    setIsEditingSocial(true);
  };

  const removeSocial = (idx) => {
    const newList = socials.filter((_, i) => i !== idx);
    setSocials(newList);
    setIsEditingSocial(true);
  };

  const saveProfile = async () => {
    try {
      await updateProfile({ socials });
      setMessage({ text: 'Профиль успешно обновлён!', type: 'success' });
      setIsEditingSocial(false);
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
        <h1>{currentUser.firstName} {currentUser.lastName}</h1>
        <p className="profile-role">
          {currentUser.role === 'admin' ? 'Администратор' : 'Пользователь'}
        </p>
        {currentUser.role === 'admin' && (
    <Link to="/admin" className="admin-link-inline"> ⚙️ Панель</Link>
  )}
      </div>
    </div>
      

      {/* Убран отдельный блок admin-link-row, ссылка теперь внутри profile-role */}

      <div className="profile-grid">
        {/* Остальные карточки без изменений */}
        <div className="profile-card">
          <h3>Основная информация</h3>
          <div className="info-row">
            <span className="info-label">Email (логин):</span>
            <span className="info-value">{currentUser.email}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Лучшая почта:</span>
            <span className="info-value">{currentUser.bestEmail}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Дата регистрации:</span>
            <span className="info-value">{new Date(currentUser.createdAt).toLocaleDateString('ru-RU')}</span>
          </div>
        </div>

        {/* Соцсети */}
        <div className="profile-card">
          <h3>Социальные сети</h3>
          {socials.length === 0 && !isEditingSocial ? (
            <p className="empty-message">Не добавлено ни одной соцсети</p>
          ) : (
            <div className="socials-list">
              {socials.map((s, idx) => (
                <div key={idx} className="social-item">
                  <select value={s.type} onChange={e => updateSocial(idx, 'type', e.target.value)}>
                    <option value="tg">Telegram</option>
                    <option value="vk">ВКонтакте</option>
                  </select>
                  <input
                    type="url"
                    placeholder="Ссылка"
                    value={s.url}
                    onChange={e => updateSocial(idx, 'url', e.target.value)}
                  />
                  <button className="remove-social" onClick={() => removeSocial(idx)} title="Удалить">✖</button>
                </div>
              ))}
            </div>
          )}
          <button className="add-social-btn" onClick={addSocial}>+ Добавить соцсеть</button>
          {isEditingSocial && (
            <button className="save-profile-btn" onClick={saveProfile}>Сохранить изменения</button>
          )}
        </div>

        {/* Смена пароля */}
        <div className="profile-card">
          <h3>Смена пароля</h3>
          <form onSubmit={handlePasswordChange} className="password-form">
            <input
              type="password"
              placeholder="Старый пароль"
              value={oldPass}
              onChange={e => setOldPass(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Новый пароль"
              value={newPass}
              onChange={e => setNewPass(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Подтвердите новый пароль"
              value={confirmPass}
              onChange={e => setConfirmPass(e.target.value)}
              required
            />
            <button type="submit">Изменить пароль</button>
          </form>
        </div>

        {/* Мои компании */}
        <div className="profile-card full-width">
          <h3>Компании, над которыми я работаю</h3>
          {myCompanies.length === 0 ? (
            <p className="empty-message">Вы ещё не заняли ни одной компании</p>
          ) : (
            <div className="my-companies-list">
              {myCompanies.map(company => (
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

      {message.text && (
        <div className={`profile-message ${message.type}`}>
          {message.text}
        </div>
      )}
    </div>
  );
}