import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import Modal from '../components/Modal';
import ConfirmModal from '../components/ConfirmModal';
import SocialChips from '../components/SocialChips';
import {
  channelsFromSocials,
  socialHref,
  socialLabel,
  socialsFromChannels,
} from '../constants/socials';
import { reportActionError } from '../utils/errors';
import type { ActivityAction, User, UserSocial } from '../types';

interface NewUserForm {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

const EMPTY_NEW_USER: NewUserForm = {
  fullName: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
};

interface EditUserForm {
  fullName: string;
  email: string;
  phone: string;
  socials: UserSocial[];
}

const ACTION_LABEL: Record<ActivityAction, string> = {
  create: 'Создание',
  update: 'Изменение',
  delete: 'Удаление',
};

/** Социальные сети пользователя: ссылкой, если значение — ссылка, иначе обычным текстом. */
function UserSocials({ socials }: { socials: UserSocial[] }) {
  const items = socials
    .map((s) => ({ type: s.type, value: (s.url || s.value || '').trim() }))
    .filter((s) => s.value);
  if (items.length === 0) return null;
  return (
    <div className="user-socials">
      <strong>Социальные сети:</strong>
      <ul className="social-list">
        {items.map((s, idx) => {
          const href = socialHref(s.type, s.value);
          return (
            <li key={`${s.type}-${idx}`}>
              <span className="social-list-label">{socialLabel(s.type)}:</span>{' '}
              {href ? (
                <a href={href} target="_blank" rel="noopener noreferrer" className="social-link">
                  {s.value}
                </a>
              ) : (
                <span>{s.value}</span>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default function AdminPanel() {
  const { currentUser, logout } = useAuth();
  const { users, companies, logs, blockUser, deleteUser, updateUser, transferAdmin, createUserByAdmin } = useData();
  const [activeTab, setActiveTab] = useState<'log' | 'users'>('log');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newUserForm, setNewUserForm] = useState<NewUserForm>(EMPTY_NEW_USER);
  const [createError, setCreateError] = useState('');
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<EditUserForm>({ fullName: '', email: '', phone: '', socials: [] });
  const [editError, setEditError] = useState('');
  const [transferTargetId, setTransferTargetId] = useState<string | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [userSearch, setUserSearch] = useState('');

  const activeUsers = users.filter(u => u.isApproved && !u.isBlocked);
  const blockedUsers = users.filter(u => u.isBlocked);
  const filteredUsers = users.filter((u) => {
    if (!userSearch.trim()) return true;
    const q = userSearch.toLowerCase();
    return (
      (u.fullName || '').toLowerCase().includes(q) ||
      (u.email || '').toLowerCase().includes(q) ||
      (u.phone || '').toLowerCase().includes(q)
    );
  });
  const deleteTarget = users.find((u) => u.id === deleteTargetId) || null;

  const handleTransferAdmin = () => {
    if (!transferTargetId || !currentUser) return;
    transferAdmin(currentUser.id, transferTargetId);
    logout();
  };

  const getUserCompanies = (userId: string) => {
    return companies.filter(c => c.occupiedBy === userId);
  };

  const openCreateModal = () => {
    setActiveTab('users');
    setNewUserForm(EMPTY_NEW_USER);
    setCreateError('');
    setIsCreateModalOpen(true);
  };

  const handleCreateUser = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const fullName = newUserForm.fullName.trim();
    const email = newUserForm.email.trim().toLowerCase();
    const phone = newUserForm.phone.trim();
    const { password, confirmPassword } = newUserForm;

    if (!fullName || !email || !phone || !password || !confirmPassword) {
      setCreateError('Заполните все поля');
      return;
    }
    if (password.length < 4) {
      setCreateError('Пароль должен быть не менее 4 символов');
      return;
    }
    if (password !== confirmPassword) {
      setCreateError('Пароли не совпадают');
      return;
    }
    if (users.some((u) => (u.email || '').toLowerCase() === email)) {
      setCreateError('Пользователь с таким email уже существует');
      return;
    }

    try {
      createUserByAdmin({
        fullName,
        email,
        phone,
        password,
        bestEmail: email,
        role: 'user',
        socials: [],
      });
      setIsCreateModalOpen(false);
      setActiveTab('users');
      setNewUserForm(EMPTY_NEW_USER);
      setCreateError('');
    } catch (err) {
      reportActionError(err, 'Failed to create user');
    }
  };

  const openEditModal = (user: User) => {
    setEditForm({
      fullName: user.fullName || '',
      email: user.email || '',
      phone: user.phone || '',
      socials: user.socials || [],
    });
    setEditError('');
    setEditingUserId(user.id);
  };

  const handleEditUser = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingUserId) return;

    const fullName = editForm.fullName.trim();
    const email = editForm.email.trim().toLowerCase();
    if (!fullName || !email) {
      setEditError('ФИО и email обязательны');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setEditError('Некорректный email');
      return;
    }
    if (users.some((u) => u.id !== editingUserId && (u.email || '').toLowerCase() === email)) {
      setEditError('Пользователь с таким email уже существует');
      return;
    }

    try {
      updateUser(editingUserId, {
        fullName,
        email,
        bestEmail: email,
        phone: editForm.phone.trim(),
        socials: editForm.socials,
      });
      setEditingUserId(null);
      setEditError('');
    } catch (err) {
      reportActionError(err, 'Failed to update user');
    }
  };

  if (!currentUser) return null;

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>Члены отдела</h1>
        <button type="button" className="btn-create-user" onClick={openCreateModal}>
          Добавить человека
        </button>
      </div>

      <div className="admin-tabs">
        <button className={activeTab === 'log' ? 'active' : ''} onClick={() => setActiveTab('log')}>
          Журнал изменений
        </button>
        <button className={activeTab === 'users' ? 'active' : ''} onClick={() => setActiveTab('users')}>
          Пользователи
        </button>
      </div>

      <div className="admin-content">
        {activeTab === 'log' && (
          <div className="admin-card">
            <h3>Журнал изменений компаний</h3>
            {logs.length === 0 ? (
              <p className="empty-state">Пока нет записей</p>
            ) : (
              <div className="requests-list">
                {logs.map((entry) => {
                  const companyExists = companies.some((c) => c.id === entry.companyId);
                  return (
                    <div key={entry.id} className="request-card log-entry">
                      <div className="request-type">
                        <span className={`type-badge ${entry.action}`}>{ACTION_LABEL[entry.action]}</span>
                      </div>
                      <div className="request-details">
                        {companyExists && entry.action !== 'delete' ? (
                          <Link to={`/companies?company=${entry.companyId}`} className="log-company-link">
                            {entry.companyName}
                          </Link>
                        ) : (
                          <strong>{entry.companyName}</strong>
                        )}
                      </div>
                      <div className="request-meta">
                        {entry.userName} • {new Date(entry.createdAt).toLocaleString('ru-RU')}
                      </div>
                      {entry.changes.length > 0 && (
                        <ul className="log-changes">
                          {entry.changes.map((change, idx) => (
                            <li key={idx} className="log-change">
                              <span className="log-field">{change.field}</span>
                              <span className="log-old">{change.oldValue}</span>
                              <span className="log-arrow" aria-hidden="true">→</span>
                              <span className="log-new">{change.newValue}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === 'users' && (
          <div className="admin-card">
            <div className="admin-users-head">
              <h3>Члены отдела</h3>
            </div>
            <div className="users-stats">
              <div className="stat">Активных: {activeUsers.length}</div>
              <div className="stat">Заблокированных: {blockedUsers.length}</div>
            </div>
            <input
              className="admin-search"
              placeholder="Поиск по имени, email, телефону..."
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
            />
            <div className="users-grid">
              {filteredUsers.map(user => {
                const userCompanies = getUserCompanies(user.id);
                return (
                  <div key={user.id} className={`user-card ${user.isBlocked ? 'blocked' : ''} ${user.role === 'admin' ? 'admin' : ''}`}>
                    <div className="member-line">
                      <span>{user.fullName}</span>
                      <span>{user.email}</span>
                      {user.role === 'admin' && <span className="admin-badge">Админ</span>}
                    </div>
                    <div className="member-line muted">
                      <span>{user.phone || '—'}</span>
                      <span className="user-status">{user.isBlocked ? 'Заблокирован' : 'Активен'}</span>
                    </div>
                    <div className="user-info">
                      <UserSocials socials={user.socials || []} />
                      {selectedUserId === user.id && (
                        <div className="user-companies">
                          <strong>Занятые компании:</strong>
                          {userCompanies.length === 0 ? (
                            <span> Нет</span>
                          ) : (
                            <div className="my-companies-list user-companies-list">
                              {userCompanies.map(c => (
                                <Link key={c.id} to={`/companies?company=${c.id}`} className="company-badge">
                                  {c.name}
                                </Link>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="user-actions">
                      <button className="btn-view" onClick={() => setSelectedUserId(selectedUserId === user.id ? null : user.id)}>
                        {selectedUserId === user.id ? 'Скрыть компании' : 'Показать компании'}
                      </button>
                      <button className="btn-edit" onClick={() => openEditModal(user)}>
                        Редактировать
                      </button>
                      {user.id !== currentUser.id && user.role !== 'admin' && (
                        <button className="btn-block" onClick={() => blockUser(user.id, !user.isBlocked)}>
                          {user.isBlocked ? 'Разблокировать' : 'Заблокировать'}
                        </button>
                      )}
                      {user.id !== currentUser.id && user.role !== 'admin' && (
                        <button className="btn-delete" onClick={() => setDeleteTargetId(user.id)}>
                          Удалить
                        </button>
                      )}
                      {user.role !== 'admin' && user.id !== currentUser.id && !user.isBlocked && (
                        <button className="btn-transfer" onClick={() => setTransferTargetId(user.id)}>
                          Сделать главным админом
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Добавить человека" className="modal-edit">
        <form onSubmit={handleCreateUser} className="create-user-form">
          {createError && <p className="auth-error" role="alert">{createError}</p>}
          <input
            type="text"
            placeholder="ФИО *"
            aria-label="ФИО"
            value={newUserForm.fullName}
            onChange={e => setNewUserForm({...newUserForm, fullName: e.target.value})}
            required
          />
          <input
            type="email"
            placeholder="Email (логин) *"
            aria-label="Email"
            value={newUserForm.email}
            onChange={e => setNewUserForm({...newUserForm, email: e.target.value})}
            required
          />
          <input
            type="tel"
            placeholder="Телефон *"
            aria-label="Телефон"
            value={newUserForm.phone}
            onChange={e => setNewUserForm({...newUserForm, phone: e.target.value})}
            required
          />
          <input
            type="password"
            placeholder="Пароль *"
            aria-label="Пароль"
            autoComplete="new-password"
            value={newUserForm.password}
            onChange={e => setNewUserForm({...newUserForm, password: e.target.value})}
            required
          />
          <input
            type="password"
            placeholder="Подтвердите пароль *"
            aria-label="Подтверждение пароля"
            autoComplete="new-password"
            value={newUserForm.confirmPassword}
            onChange={e => setNewUserForm({...newUserForm, confirmPassword: e.target.value})}
            required
          />
          <div className="form-actions">
            <button type="button" className="btn-ghost" onClick={() => setIsCreateModalOpen(false)}>Отмена</button>
            <button type="submit" className="btn-primary">Создать</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={!!editingUserId} onClose={() => setEditingUserId(null)} title="Редактировать пользователя" size="lg" className="modal-edit">
        <form onSubmit={handleEditUser} className="create-user-form">
          {editError && <p className="auth-error" role="alert">{editError}</p>}
          <input
            type="text"
            placeholder="ФИО *"
            aria-label="ФИО"
            value={editForm.fullName}
            onChange={e => setEditForm({...editForm, fullName: e.target.value})}
            required
          />
          <input
            type="email"
            placeholder="Email (логин) *"
            aria-label="Email"
            value={editForm.email}
            onChange={e => setEditForm({...editForm, email: e.target.value})}
            required
          />
          <input
            type="tel"
            placeholder="Телефон"
            aria-label="Телефон"
            value={editForm.phone}
            onChange={e => setEditForm({...editForm, phone: e.target.value})}
          />
          <label className="field-label subtle">Социальные сети</label>
          <SocialChips
            channels={channelsFromSocials(editForm.socials)}
            onChange={(channels) => setEditForm({...editForm, socials: socialsFromChannels(channels)})}
          />
          <div className="form-actions">
            <button type="button" className="btn-ghost" onClick={() => setEditingUserId(null)}>Отмена</button>
            <button type="submit" className="btn-primary">Сохранить</button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        isOpen={!!transferTargetId}
        onClose={() => setTransferTargetId(null)}
        onConfirm={handleTransferAdmin}
        title="Передача прав"
        message="Передать права главного администратора? Вы выйдете из системы."
        confirmLabel="Передать"
        danger
      />

      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={() => {
          if (deleteTarget) deleteUser(deleteTarget.id);
          setSelectedUserId((id) => (id === deleteTarget?.id ? null : id));
        }}
        title="Удаление аккаунта"
        message={`Удалить аккаунт «${deleteTarget?.fullName || deleteTarget?.email || ''}»? Занятые им компании станут свободными. Это действие нельзя отменить.`}
        confirmLabel="Удалить"
        danger
      />
    </div>
  );
}
