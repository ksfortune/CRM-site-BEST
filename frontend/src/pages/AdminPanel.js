import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import Modal from '../components/Modal';
import ConfirmModal from '../components/ConfirmModal';

export default function AdminPanel() {
  const { currentUser, logout } = useAuth();
  const { users, companies, requests, approveRequest, rejectRequest, blockUser, transferAdmin, createUserByAdmin } = useData();
  const [activeTab, setActiveTab] = useState('requests'); // теперь по умолчанию запросы
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [transferTargetId, setTransferTargetId] = useState(null);
  const [newUserForm, setNewUserForm] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
    bestEmail: '',
    role: 'user'
  });
  const [userSearch, setUserSearch] = useState('');

  const pendingRequests = requests.filter(r => r.status === 'pending');
  const activeUsers = users.filter(u => u.isApproved && !u.isBlocked);
  const blockedUsers = users.filter(u => u.isBlocked);
  const filteredUsers = users.filter((u) => {
    if (!userSearch.trim()) return true;
    const q = userSearch.toLowerCase();
    return (
      `${u.firstName} ${u.lastName}`.toLowerCase().includes(q) ||
      (u.email || '').toLowerCase().includes(q) ||
      (u.phone || '').toLowerCase().includes(q)
    );
  });

  const handleTransferAdmin = () => {
    if (!transferTargetId) return;
    transferAdmin(currentUser.id, transferTargetId);
    logout();
  };

  const getUserCompanies = (userId) => {
    return companies.filter(c => c.occupiedBy === userId);
  };

  const handleCreateUser = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const firstName = (newUserForm.firstName || '').trim();
    const lastName = (newUserForm.lastName || '').trim();
    const email = (newUserForm.email || '').trim().toLowerCase();
    const password = newUserForm.password || '';
    const phone = (newUserForm.phone || '').trim();
    const bestEmail = (newUserForm.bestEmail || '').trim() || email;

    if (!email || !password || !firstName || !lastName) {
      alert('Заполните имя, фамилию, email и пароль');
      return;
    }
    if (password.length < 4) {
      alert('Пароль должен быть не менее 4 символов');
      return;
    }
    if (users.some((u) => (u.email || '').toLowerCase() === email)) {
      alert('Пользователь с таким email уже существует');
      return;
    }

    try {
      createUserByAdmin({
        firstName,
        lastName,
        email,
        password,
        phone,
        bestEmail,
        role: newUserForm.role || 'user',
        socials: [],
      });
      setIsCreateModalOpen(false);
      setActiveTab('users');
      setNewUserForm({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        phone: '',
        bestEmail: '',
        role: 'user',
      });
      alert('Пользователь создан');
    } catch (err) {
      console.error(err);
      alert(err.message || 'Не удалось создать пользователя');
    }
  };

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>Панель администратора</h1>
        <p>Управление пользователями, компаниями и правами доступа</p>
      </div>

      <div className="admin-tabs">
        <button className={activeTab === 'requests' ? 'active' : ''} onClick={() => setActiveTab('requests')}>
          <span className="tab-icon">🔄</span> Запросы
          {pendingRequests.length > 0 && <span className="badge">{pendingRequests.length}</span>}
        </button>
        <button className={activeTab === 'users' ? 'active' : ''} onClick={() => setActiveTab('users')}>
          <span className="tab-icon">👥</span> Пользователи
        </button>
      </div>

      <div className="admin-content">
        {/* Вкладка запросов */}
        {activeTab === 'requests' && (
          <div className="admin-card">
            <h3>Запросы на изменение компаний</h3>
            {pendingRequests.length === 0 ? (
              <p className="empty-state">📭 Нет активных запросов</p>
            ) : (
              <div className="requests-list">
                {pendingRequests.map(req => (
                  <div key={req.id} className="request-card">
                    <div className="request-type">
                      {req.type === 'create' && <span className="type-badge create">➕ Создание</span>}
                      {req.type === 'update' && <span className="type-badge update">✏️ Обновление</span>}
                      {req.type === 'delete' && <span className="type-badge delete">🗑️ Удаление</span>}
                    </div>
                    <div className="request-details">
                      {req.type === 'create' && <strong>{req.targetCompany?.name}</strong>}
                      {req.type === 'update' && <>Компания ID: <code>{req.companyId}</code></>}
                      {req.type === 'delete' && <>Компания ID: <code>{req.companyId}</code></>}
                    </div>
                    <div className="request-meta">
                      Запросил: {req.requestedByName} • {new Date(req.createdAt).toLocaleString()}
                    </div>
                    <div className="request-actions">
                      <button className="btn-approve" onClick={() => approveRequest(req.id, currentUser)}>✅ Принять</button>
                      <button className="btn-reject" onClick={() => rejectRequest(req.id)}>❌ Отклонить</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Вкладка пользователей */}
        {activeTab === 'users' && (
          <div className="admin-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0 }}>Управление пользователями</h3>
              <button className="btn-create-user" onClick={() => setIsCreateModalOpen(true)}>
                + Создать пользователя
              </button>
            </div>
            <div className="users-stats">
              <div className="stat">✅ Активных: {activeUsers.length}</div>
              <div className="stat">🚫 Заблокированных: {blockedUsers.length}</div>
            </div>
            <input
              className="admin-search"
              placeholder="Поиск по имени, email, телефону..."
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
            />
            <div className="users-grid">
              {filteredUsers.map(user => (
                <div key={user.id} className={`user-card ${user.isBlocked ? 'blocked' : ''} ${user.role === 'admin' ? 'admin' : ''}`}>
                  <div className="user-avatar">{user.firstName?.[0]}{user.lastName?.[0]}</div>
                  <div className="user-info">
                    <div className="user-name">
                      {user.firstName} {user.lastName}
                      {user.role === 'admin' && <span className="admin-badge">Админ</span>}
                    </div>
                    <div className="user-email">{user.email}</div>
                    {user.phone && <div className="user-email">📞 {user.phone}</div>}
                    <div className="user-status">
                      {user.isBlocked ? '🚫 Заблокирован' : '✅ Активен'}
                    </div>
                    {/* Соцсети */}
                    {user.socials && user.socials.length > 0 && (
                      <div className="user-socials">
                        <strong>Соцсети:</strong>
                        <div className="social-links">
                          {user.socials.map((s, idx) => (
                            <a key={idx} href={s.url} target="_blank" rel="noopener noreferrer" className="social-link">
                              {s.type === 'tg' ? '📱 Telegram' : '📘 VK'}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                    {selectedUserId === user.id && (
                      <div className="user-companies">
                        <strong>Занятые компании:</strong>
                        {getUserCompanies(user.id).length === 0 ? (
                          <span>Нет</span>
                        ) : (
                          <ul>
                            {getUserCompanies(user.id).map(c => <li key={c.id}>{c.name}</li>)}
                          </ul>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="user-actions">
                    <button className="btn-view" onClick={() => setSelectedUserId(selectedUserId === user.id ? null : user.id)}>
                      {selectedUserId === user.id ? 'Скрыть компании' : 'Показать компании'}
                    </button>
                    {user.id !== currentUser?.id && user.role !== 'admin' && (
                      <button className="btn-block" onClick={() => blockUser(user.id, !user.isBlocked)}>
                        {user.isBlocked ? '🔓 Разблокировать' : '🔒 Заблокировать'}
                      </button>
                    )}
                    {user.role !== 'admin' && user.id !== currentUser?.id && !user.isBlocked && (
                      <button className="btn-transfer" onClick={() => setTransferTargetId(user.id)}>
                        👑 Сделать главным админом
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Модальное окно создания пользователя */}
      <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Создать пользователя">
        <form onSubmit={handleCreateUser} className="create-user-form">
          <input
            type="text"
            placeholder="Имя *"
            value={newUserForm.firstName}
            onChange={e => setNewUserForm({...newUserForm, firstName: e.target.value})}
            required
          />
          <input
            type="text"
            placeholder="Фамилия *"
            value={newUserForm.lastName}
            onChange={e => setNewUserForm({...newUserForm, lastName: e.target.value})}
            required
          />
          <input
            type="email"
            placeholder="Email (логин) *"
            value={newUserForm.email}
            onChange={e => setNewUserForm({...newUserForm, email: e.target.value})}
            required
          />
          <input
            type="text"
            placeholder="Лучшая почта"
            value={newUserForm.bestEmail}
            onChange={e => setNewUserForm({...newUserForm, bestEmail: e.target.value})}
          />
          <input
            type="text"
            placeholder="Телефон"
            value={newUserForm.phone}
            onChange={e => setNewUserForm({...newUserForm, phone: e.target.value})}
          />
          <input
            type="password"
            placeholder="Пароль *"
            value={newUserForm.password}
            onChange={e => setNewUserForm({...newUserForm, password: e.target.value})}
            required
          />
          <select
            value={newUserForm.role}
            onChange={e => setNewUserForm({...newUserForm, role: e.target.value})}
          >
            <option value="user">Пользователь</option>
            <option value="admin">Администратор (полные права)</option>
          </select>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '20px' }}>
            <button type="button" className="btn-ghost" onClick={() => setIsCreateModalOpen(false)}>Отмена</button>
            <button type="submit" className="btn-primary">Создать</button>
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
    </div>
  );
}