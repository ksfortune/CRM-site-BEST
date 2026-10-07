import React, { useState } from 'react';
import Modal from './Modal';
import CompanyForm from './CompanyForm';
import CommentSection from './CommentSection';
import ConfirmModal from './ConfirmModal';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { socialLabel } from '../constants/socials';

function formatDate(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('ru-RU');
}

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
        title={editing ? 'Изменения данных компании' : company.name}
        size="lg"
        className={editing ? 'modal-edit' : 'modal-company'}
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
            <div className="sheet-grid">
              <div className="sheet-left">
                <h4>Компания</h4>
                <p>Дата создания: {formatDate(company.createdAt)}</p>
                <p>Дата изменения: {formatDate(company.updatedAt)}</p>
                <p>Сфера: {(company.industries || []).join(', ') || '—'}</p>
                <p>
                  Статус:{' '}
                  <span className={`status-word ${company.status}`}>
                    {company.status === 'hot' ? 'Горячий' : 'Тёплый'}
                  </span>
                </p>
                {occupant && (
                  <p className="occupant-details">
                    Занята: {occupant.firstName} {occupant.lastName}
                  </p>
                )}
                <div className="sheet-divider" />
                <div className="reps-head">
                  <h4>Представители</h4>
                  <button type="button" className="reps-add" onClick={() => setEditing(true)} aria-label="Добавить представителя">
                    +
                  </button>
                </div>
                {(company.contacts || []).length === 0 ? (
                  <p className="empty-message">Нет представителей</p>
                ) : (
                  <ul className="contact-list">
                    {(company.contacts || []).map((c) => (
                      <li key={c.id} className="contact-row">
                        <button
                          type="button"
                          className={`contact-list-item ${selectedContactId === c.id ? 'active' : ''}`}
                          onClick={() =>
                            setSelectedContactId(selectedContactId === c.id ? null : c.id)
                          }
                        >
                          {c.name}
                        </button>
                        {selectedContactId === c.id && selectedContact && (
                          <div className="contact-detail">
                            {(selectedContact.channels || []).map((ch) => (
                              <div key={`${ch.type}-${ch.value}`}>
                                <strong>{socialLabel(ch.type)}</strong>
                                <span>{ch.value || '—'}</span>
                              </div>
                            ))}
                            {selectedContact.phone && (
                              <div>
                                <strong>Номер телефона</strong>
                                <span>{selectedContact.phone}</span>
                              </div>
                            )}
                            {!selectedContact.phone && !(selectedContact.channels || []).length && (
                              <div className="empty-message">Нет данных</div>
                            )}
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="sheet-right">
                <CommentSection
                  companyId={company.id}
                  comments={comments}
                  occupiedBy={company.occupiedBy}
                />
              </div>
            </div>
            <div className="company-card-actions">
              {isFree && (
                <button type="button" className="text-action" onClick={handleOccupy}>
                  Занять
                </button>
              )}
              {isMine && (
                <button type="button" className="text-action" onClick={handleRelease}>
                  Освободить
                </button>
              )}
              {isBusyByOther && isAdmin && (
                <button type="button" className="text-action" onClick={handleTakeOver}>
                  Перезанять
                </button>
              )}
              <button type="button" className="sheet-edit" onClick={() => setEditing(true)}>
                Изменить данные
              </button>
              <button type="button" className="text-action danger" onClick={() => setConfirmDelete(true)}>
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
