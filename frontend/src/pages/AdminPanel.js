import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import Modal from '../components/Modal';
import ConfirmModal from '../components/ConfirmModal';
import { usePrideFx, PrideBurstLayer } from '../hooks/usePrideFx';

const MEME_QUOTES = [
  'admin energy: unstoppable 💅',
  'trans women are women — periodt',
  'Black Lives Matter ✊',
  'women supporting women ♀️',
  'gatekeep? gaslight? girlboss? → girladmin',
  'no boring panels in this house',
  'LGBTQ+ HQ online 🏳️‍🌈',
  'slay the backlog ✨',
];

export default function AdminPanel() {
  const { currentUser, logout } = useAuth();
  const {
    users,
    companies,
    requests,
    approveRequest,
    rejectRequest,
    blockUser,
    transferAdmin,
    createUserByAdmin,
  } = useData();
  const pride = usePrideFx();

  const [activeTab, setActiveTab] = useState('requests');
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [transferTargetId, setTransferTargetId] = useState(null);
  const [memeIdx, setMemeIdx] = useState(0);
  const [newUserForm, setNewUserForm] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
    bestEmail: '',
    role: 'user',
  });
  const [userSearch, setUserSearch] = useState('');

  const pendingRequests = requests.filter((r) => r.status === 'pending');
  const activeUsers = users.filter((u) => u.isApproved && !u.isBlocked);
  const blockedUsers = users.filter((u) => u.isBlocked);
  const filteredUsers = users.filter((u) => {
    if (!userSearch.trim()) return true;
    const q = userSearch.toLowerCase();
    return (
      `${u.firstName} ${u.lastName}`.toLowerCase().includes(q) ||
      (u.email || '').toLowerCase().includes(q) ||
      (u.phone || '').toLowerCase().includes(q)
    );
  });

  const spark = (e, fn) => {
    pride.boom(e);
    setMemeIdx((i) => (i + 1) % MEME_QUOTES.length);
    if (fn) fn();
  };

  const handleTransferAdmin = () => {
    if (!transferTargetId) return;
    transferAdmin(currentUser.id, transferTargetId);
    logout();
  };

  const getUserCompanies = (userId) => companies.filter((c) => c.occupiedBy === userId);

  const updateForm = (field) => (e) => {
    pride.onType();
    setNewUserForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleCreateUser = (e) => {
    e.preventDefault();
    e.stopPropagation();
    pride.boom(e);

    const firstName = (newUserForm.firstName || '').trim();
    const lastName = (newUserForm.lastName || '').trim();
    const email = (newUserForm.email || '').trim().toLowerCase();
    const password = newUserForm.password || '';
    const phone = (newUserForm.phone || '').trim();
    const bestEmail = (newUserForm.bestEmail || '').trim() || email;

    if (!email || !password || !firstName || !lastName) {
      alert('Заполните имя, фамилию, email и пароль 💅');
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
      alert('Пользователь создан 🏳️‍🌈✨');
    } catch (err) {
      console.error(err);
      alert(err.message || 'Не удалось создать пользователя');
    }
  };

  return (
    <>
      <PrideBurstLayer bursts={pride.bursts} />
      <div
        className={`admin-container admin-pride ${pride.filterClass} ${pride.typingPride ? 'admin-typing-pride' : ''}`}
        style={pride.filterStyle}
        onClick={(e) => {
          if (e.target === e.currentTarget) pride.boom(e);
        }}
      >
      <div className="admin-pride-banner">
        <span>🏳️‍🌈</span>
        <span>Admin Pride Panel</span>
        <span>🏳️‍⚧️</span>
        <span>BLM ✊</span>
        <span>♀️</span>
      </div>

      <div className="admin-header">
        <h1 className="admin-pride-title">
          <span className="chaos-title-glitch" data-text="Панель администратора">
            Панель администратора
          </span>
        </h1>
        <p className="admin-pride-sub">
          LGBTQ+ HQ · trans women are women · Black Lives Matter · women run this
        </p>
        <div className="admin-meme-marquee" key={memeIdx}>
          {MEME_QUOTES[memeIdx]}
        </div>
        <div className="solidarity-strip">
          <span className="solidarity-pill pride">🏳️‍🌈 Pride mode ON</span>
          <span className="solidarity-pill trans">🏳️‍⚧️ Trans ally</span>
          <span className="solidarity-pill women">♀️ Women power</span>
          <span className="solidarity-pill blm">✊ Black Lives Matter</span>
        </div>
      </div>

      <div className="admin-tabs admin-tabs-pride">
        <button
          type="button"
          className={activeTab === 'requests' ? 'active' : ''}
          onClick={(e) => spark(e, () => setActiveTab('requests'))}
        >
          <span className="tab-icon">💅</span> Запросы
          {pendingRequests.length > 0 && <span className="badge">{pendingRequests.length}</span>}
        </button>
        <button
          type="button"
          className={activeTab === 'users' ? 'active' : ''}
          onClick={(e) => spark(e, () => setActiveTab('users'))}
        >
          <span className="tab-icon">🌈</span> Пользователи
        </button>
      </div>

      <div className="admin-content">
        {activeTab === 'requests' && (
          <div className="admin-card admin-card-pride">
            <h3>💅 Запросы (slay or nay)</h3>
            {pendingRequests.length === 0 ? (
              <p className="empty-state admin-empty-meme">
                📭 Нет запросов — можно пить матчу и защищать транс-права 🏳️‍⚧️☕
              </p>
            ) : (
              <div className="requests-list">
                {pendingRequests.map((req) => (
                  <div key={req.id} className="request-card request-card-pride">
                    <div className="request-type">
                      {req.type === 'create' && <span className="type-badge create">➕ Создание</span>}
                      {req.type === 'update' && <span className="type-badge update">✏️ Обновление</span>}
                      {req.type === 'delete' && <span className="type-badge delete">🗑️ Удаление</span>}
                    </div>
                    <div className="request-details">
                      {req.type === 'create' && <strong>{req.targetCompany?.name}</strong>}
                      {req.type === 'update' && (
                        <>
                          Компания ID: <code>{req.companyId}</code>
                        </>
                      )}
                      {req.type === 'delete' && (
                        <>
                          Компания ID: <code>{req.companyId}</code>
                        </>
                      )}
                    </div>
                    <div className="request-meta">
                      Запросил: {req.requestedByName} • {new Date(req.createdAt).toLocaleString()}
                    </div>
                    <div className="request-actions">
                      <button
                        type="button"
                        className="btn-approve pride-btn"
                        onClick={(e) => spark(e, () => approveRequest(req.id, currentUser))}
                      >
                        ✅ Slay / Принять
                      </button>
                      <button
                        type="button"
                        className="btn-reject pride-btn"
                        onClick={(e) => spark(e, () => rejectRequest(req.id))}
                      >
                        ❌ Nay / Отклонить
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'users' && (
          <div className="admin-card admin-card-pride">
            <div className="admin-users-head">
              <h3 style={{ margin: 0 }}>🌈 Управление пользователями</h3>
              <button
                type="button"
                className="btn-create-user pride-btn"
                onClick={(e) => spark(e, () => setIsCreateModalOpen(true))}
              >
                + Создать (with love)
              </button>
            </div>
            <div className="users-stats">
              <div className="stat pride-stat">✅ Активных: {activeUsers.length}</div>
              <div className="stat pride-stat">🚫 Заблокированных: {blockedUsers.length}</div>
              <div className="stat pride-stat">🏳️‍⚧️ Safe space: ON</div>
            </div>
            <input
              className={`admin-search ${pride.typingPride ? 'pride-typing' : ''}`}
              placeholder="🔍 поиск... type for rainbow filter 🏳️‍🌈"
              value={userSearch}
              onChange={(e) => {
                pride.onType();
                setUserSearch(e.target.value);
              }}
              onFocus={(e) => pride.boom(e)}
            />
            <div className="users-grid">
              {filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className={`user-card user-card-pride ${user.isBlocked ? 'blocked' : ''} ${user.role === 'admin' ? 'admin' : ''}`}
                  onClick={(e) => pride.boom(e)}
                >
                  <div className="user-avatar pride-avatar">
                    {user.firstName?.[0]}
                    {user.lastName?.[0]}
                  </div>
                  <div className="user-info">
                    <div className="user-name">
                      {user.firstName} {user.lastName}
                      {user.role === 'admin' && <span className="admin-badge">👑 Админ</span>}
                    </div>
                    <div className="user-email">{user.email}</div>
                    {user.phone && <div className="user-email">📞 {user.phone}</div>}
                    <div className="user-status">
                      {user.isBlocked ? '🚫 Заблокирован' : '✅ Активен · valid ✨'}
                    </div>
                    {user.socials && user.socials.length > 0 && (
                      <div className="user-socials">
                        <strong>Соцсети:</strong>
                        <div className="social-links">
                          {user.socials.map((s, idx) => (
                            <a
                              key={idx}
                              href={s.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="social-link"
                            >
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
                            {getUserCompanies(user.id).map((c) => (
                              <li key={c.id}>{c.name}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="user-actions">
                    <button
                      type="button"
                      className="btn-view pride-btn"
                      onClick={(e) =>
                        spark(e, () => setSelectedUserId(selectedUserId === user.id ? null : user.id))
                      }
                    >
                      {selectedUserId === user.id ? 'Скрыть компании' : 'Показать компании'}
                    </button>
                    {user.id !== currentUser?.id && user.role !== 'admin' && (
                      <button
                        type="button"
                        className="btn-block pride-btn"
                        onClick={(e) => spark(e, () => blockUser(user.id, !user.isBlocked))}
                      >
                        {user.isBlocked ? '🔓 Разблокировать' : '🔒 Заблокировать'}
                      </button>
                    )}
                    {user.role !== 'admin' && user.id !== currentUser?.id && !user.isBlocked && (
                      <button
                        type="button"
                        className="btn-transfer pride-btn"
                        onClick={(e) => spark(e, () => setTransferTargetId(user.id))}
                      >
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

      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="🏳️‍🌈 Создать пользователя"
      >
        <p className="admin-form-hint">
          Печатай — включается rainbow filter. Кликай — pride burst ✨
        </p>
        <form
          onSubmit={handleCreateUser}
          className={`create-user-form ${pride.typingPride ? 'pride-typing-form' : ''}`}
          onClick={(e) => pride.boom(e)}
        >
          <input
            type="text"
            placeholder="Имя * 🩷"
            value={newUserForm.firstName}
            onChange={updateForm('firstName')}
            required
          />
          <input
            type="text"
            placeholder="Фамилия * 💙"
            value={newUserForm.lastName}
            onChange={updateForm('lastName')}
            required
          />
          <input
            type="email"
            placeholder="Email (логин) * 🏳️‍🌈"
            value={newUserForm.email}
            onChange={updateForm('email')}
            required
          />
          <input
            type="text"
            placeholder="Лучшая почта"
            value={newUserForm.bestEmail}
            onChange={updateForm('bestEmail')}
          />
          <input
            type="text"
            placeholder="Телефон"
            value={newUserForm.phone}
            onChange={updateForm('phone')}
          />
          <input
            type="password"
            placeholder="Пароль * ✨"
            value={newUserForm.password}
            onChange={updateForm('password')}
            required
          />
          <select value={newUserForm.role} onChange={updateForm('role')} onClick={(e) => pride.boom(e)}>
            <option value="user">Пользователь</option>
            <option value="admin">Администратор (полные права) 👑</option>
          </select>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '20px' }}>
            <button
              type="button"
              className="btn-ghost pride-btn"
              onClick={(e) => spark(e, () => setIsCreateModalOpen(false))}
            >
              Отмена
            </button>
            <button type="submit" className="btn-primary pride-btn">
              Создать 🏳️‍⚧️
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        isOpen={!!transferTargetId}
        onClose={() => setTransferTargetId(null)}
        onConfirm={handleTransferAdmin}
        title="👑 Передача прав"
        message="Передать права главного администратора? Вы выйдете из системы. Make it fashion."
        confirmLabel="Передать ✨"
        danger
      />
    </div>
    </>
  );
}
