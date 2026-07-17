import React, { useState } from 'react';
import Modal from './Modal';
import CompanyForm from './CompanyForm';
import CommentSection from './CommentSection';
import ConfirmModal from './ConfirmModal';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { socialLabel } from '../constants/socials';

export default function CompanyCard({
  company,
  isOpen,
  onClose,
  industriesCatalog,
  onAddIndustry,
  onSaved,
}) {
  const { currentUser } = useAuth();
  const {
    getCommentsForCompany,
    directCompanyUpdate,
    requestCompanyChange,
    occupyCompany,
    releaseCompany,
    findUserById,
  } = useData();
  const [editing, setEditing] = useState(false);
  const [selectedContactId, setSelectedContactId] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (!company) return null;

  const comments = getCommentsForCompany(company.id);
  const occupant = company.occupiedBy ? findUserById(company.occupiedBy) : null;
  const selectedContact = (company.contacts || []).find((c) => c.id === selectedContactId);

  const isAdmin = currentUser?.role === 'admin';
  const isFree = !company.occupiedBy;
  const isMine = company.occupiedBy === currentUser.id;
  const isBusyByOther = company.occupiedBy && !isMine;

  const handleOccupy = () => {
    occupyCompany(
      company.id,
      currentUser.id,
      `${currentUser.firstName} ${currentUser.lastName}`
    );
  };

  const handleRelease = () => {
    releaseCompany(company.id);
  };

  const handleTakeOver = () => {
    occupyCompany(
      company.id,
      currentUser.id,
      `${currentUser.firstName} ${currentUser.lastName}`
    );
  };

  const handleSave = (data) => {
    const payload = { ...company, ...data };
    if (currentUser.role === 'admin') {
      directCompanyUpdate(payload, currentUser);
      setEditing(false);
      onSaved?.();
    } else {
      requestCompanyChange('update', payload, currentUser);
      alert('Запрос на изменение отправлен администратору');
      setEditing(false);
    }
  };

  const handleDelete = () => {
    if (currentUser.role === 'admin') {
      directCompanyUpdate(company, currentUser, true);
      onClose();
      onSaved?.();
    } else {
      requestCompanyChange('delete', company, currentUser);
      alert('Запрос на удаление отправлен администратору');
      onClose();
    }
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={editing ? 'Изменение компании' : company.name}
        size="lg"
      >
        {editing ? (
          <div className="company-edit-block">
            <CompanyForm
              initialData={company}
              industriesCatalog={industriesCatalog}
              onAddIndustry={onAddIndustry}
              onCancel={() => setEditing(false)}
              onSubmit={handleSave}
            />
          </div>
        ) : (
          <div className="company-card-view">
            <div className="company-card-meta">
              <span className={`status-badge ${company.status}`}>
                {company.status === 'hot' ? 'Горячий' : 'Тёплый'}
              </span>
              <span className={`occupy-badge ${company.occupiedBy ? 'busy' : 'free'}`}>
                {company.occupiedBy
                  ? `Занята: ${company.occupiedByName || 'пользователь'}`
                  : 'Свободна'}
              </span>
            </div>

            {occupant && (
              <div className="occupant-details">
                <strong>{occupant.firstName} {occupant.lastName}</strong>
                <span>{occupant.email}</span>
                {occupant.phone && <span>{occupant.phone}</span>}
              </div>
            )}

            <section className="company-card-section">
              <h4>Сферы</h4>
              <div className="industry-chips readonly">
                {(company.industries || []).map((ind) => (
                  <span key={ind} className="industry-chip active">
                    {ind}
                  </span>
                ))}
                {!(company.industries || []).length && (
                  <span className="empty-message">Не указаны</span>
                )}
              </div>
            </section>

            <section className="company-card-section">
              <h4>Представители</h4>
              {(company.contacts || []).length === 0 ? (
                <p className="empty-message">Нет представителей</p>
              ) : (
                <ul className="contact-list">
                  {(company.contacts || []).map((c) => (
                    <li key={c.id}>
                      <button
                        type="button"
                        className={`contact-list-item ${selectedContactId === c.id ? 'active' : ''}`}
                        onClick={() =>
                          setSelectedContactId(selectedContactId === c.id ? null : c.id)
                        }
                      >
                        <span className="contact-list-name">{c.name}</span>
                        {c.nickname && <span className="contact-list-nick">@{c.nickname}</span>}
                      </button>
                      {selectedContactId === c.id && selectedContact && (
                        <div className="contact-detail">
                          {selectedContact.phone && (
                            <div>
                              <span className="info-label">Телефон:</span> {selectedContact.phone}
                            </div>
                          )}
                          {(selectedContact.channels || []).map((ch) => (
                            <div key={ch.type}>
                              <span className="info-label">{socialLabel(ch.type)}:</span>{' '}
                              {ch.value || '—'}
                            </div>
                          ))}
                          {!selectedContact.phone && !(selectedContact.channels || []).length && (
                            <div className="empty-message">Нет дополнительных данных</div>
                          )}
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="company-card-section">
              <h4>Комментарии</h4>
              <CommentSection
                companyId={company.id}
                comments={comments}
                occupiedBy={company.occupiedBy}
              />
            </section>

            <div className="company-card-actions">
              {isFree && (
                <button type="button" className="btn-primary" onClick={handleOccupy}>
                  Занять
                </button>
              )}
              {isMine && (
                <button type="button" className="btn-primary" onClick={handleRelease}>
                  Освободить
                </button>
              )}
              {isBusyByOther && isAdmin && (
                <>
                  <button type="button" className="btn-primary" onClick={handleTakeOver}>
                    Перезанять
                  </button>
                  <button type="button" className="btn-ghost" onClick={handleRelease}>
                    Освободить
                  </button>
                </>
              )}
              <button type="button" className="btn-ghost" onClick={() => setEditing(true)}>
                Изменить
              </button>
              <button type="button" className="btn-ghost btn-danger-text" onClick={() => setConfirmDelete(true)}>
                Удалить
              </button>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmModal
        isOpen={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={handleDelete}
        title="Удаление компании"
        message={`Удалить компанию «${company.name}»?`}
        confirmLabel="Удалить"
        danger
      />
    </>
  );
}
