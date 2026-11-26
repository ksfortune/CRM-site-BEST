import { useState, useEffect, type FormEvent } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { Link } from 'react-router-dom';
import SocialChips from '../components/SocialChips';
import Modal from '../components/Modal';
import { channelsFromSocials, socialsFromChannels } from '../constants/socials';
import { getInitials } from '../utils/names';
import { reportActionError } from '../utils/errors';
import type { UserSocial } from '../types';

export default function Profile() {
  const { currentUser, updateProfile, changePassword } = useAuth();
  const { companies } = useData();
  const [socials, setSocials] = useState<UserSocial[]>(currentUser?.socials || []);
  const [oldPass, setOldPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [message, setMessage] = useState<{ text: string; type: '' | 'success' | 'error' }>({ text: '', type: '' });
  const [socialsOpen, setSocialsOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);

  useEffect(() => {
    setSocials(currentUser?.socials || []);
  }, [currentUser]);

  if (!currentUser) return null;

  const myCompanies = companies.filter((c) => c.occupiedBy === currentUser.id);

  const closeSocials = () => {
    // Закрыли без сохранения — возвращаем сохранённый список
    setSocials(currentUser.socials || []);
    setSocialsOpen(false);
  };

  const saveSocials = async () => {
    try {
      await updateProfile({ socials });
      setMessage({ text: 'Профиль успешно обновлён!', type: 'success' });
      setSocialsOpen(false);
      setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    } catch (err) {
      reportActionError(err, 'Failed to update profile');
    }
  };

  const handlePasswordChange = async (e: FormEvent<HTMLFormElement>) => {
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
      reportActionError(err, 'Failed to change password');
    }
  };

  return (
    <div className="profile-container">
      <div className="identity-bar">
        <span className="chip-avatar lg">{getInitials(currentUser.fullName) || 'К'}</span>
        <div>
          <h1>{currentUser.fullName}</h1>
          <p className="profile-role">
            Статус: {currentUser.role === 'admin' ? 'Администратор' : 'Пользователь'}
          </p>
        </div>
      </div>

      <div className="profile-grid">
        <section className="profile-card">
          <h3>Основная информация</h3>
          <p className="info-line"><span>Email:</span> {currentUser.email}</p>
          <p className="info-line"><span>Номер телефона:</span> {currentUser.phone || '—'}</p>
          <button type="button" className="text-action" onClick={() => setPasswordOpen((v) => !v)}>
            Смена пароля
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
            Социальные сети
          </button>
        </section>

        <section className="profile-card">
          <h3>Компании, над которыми я работаю</h3>
          {myCompanies.length === 0 ? (
            <p className="empty-message">Вы ещё не заняли ни одной компании</p>
          ) : (
            <div className="my-companies-list">
              {myCompanies.map((company) => (
                <Link key={company.id} to={`/companies?company=${company.id}`} className="company-badge">
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

      <Modal isOpen={socialsOpen} onClose={closeSocials} title="Социальные сети" className="modal-social">
        <SocialChips
          channels={channelsFromSocials(socials)}
          onChange={(channels) => setSocials(socialsFromChannels(channels))}
        />
        <div className="social-modal-actions">
          <button type="button" className="text-action" onClick={saveSocials}>Сохранить</button>
        </div>
      </Modal>
    </div>
  );
}
