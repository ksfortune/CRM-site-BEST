import { useState } from 'react';
import Modal from './Modal';
import CompanyForm from './CompanyForm';
import CommentSection from './CommentSection';
import ConfirmModal from './ConfirmModal';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { socialLabel } from '../constants/socials';
import type { Company, CompanyDraft } from '../types';

function formatDate(value?: string) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('ru-RU');
}

interface CompanyCardProps {
  company: (Company & { industry?: string }) | null;
  isOpen: boolean;
  onClose: () => void;
  industriesCatalog: string[];
  onAddIndustry: (value: string) => void;
  onSaved?: () => void;
}

export default function CompanyCard({
  company,
  isOpen,
  onClose,
  industriesCatalog,
  onAddIndustry,
  onSaved,
}: CompanyCardProps) {
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
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (!company || !currentUser) return null;

  const comments = getCommentsForCompany(company.id);
  const occupant = company.occupiedBy ? findUserById(company.occupiedBy) : null;
  const occupantName = occupant
    ? `${occupant.firstName} ${occupant.lastName}`.trim()
    : company.occupiedByName || '';
  const selectedContact = (company.contacts || []).find((c) => c.id === selectedContactId);

  const isAdmin = currentUser.role === 'admin';
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

  const handleSave = (data: CompanyDraft) => {
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
            <div className={`occupancy-banner ${isFree ? 'free' : isMine ? 'mine' : 'busy'}`}>
              <div>
                <strong className="occupancy-title">
                  {isFree
                    ? 'Компания свободна'
                    : isMine
                      ? 'Вы работаете с этой компанией'
                      : `Занята: ${occupantName || 'другой пользователь'}`}
                </strong>
                <span className="occupancy-hint">
                  {isFree
                    ? 'Займите её, чтобы работать и оставлять комментарии.'
                    : isMine
                      ? 'Другие видят, что компания занята вами.'
                      : 'Пока она занята, комментировать может только занявший.'}
                </span>
              </div>
              <div className="occupancy-actions">
                {isFree && (
                  <button type="button" className="btn-primary" onClick={handleOccupy}>
                    Занять
                  </button>
                )}
                {isMine && (
                  <button type="button" className="btn-secondary" onClick={handleRelease}>
                    Освободить
                  </button>
                )}
                {isBusyByOther && isAdmin && (
                  <button type="button" className="btn-secondary" onClick={handleTakeOver}>
                    Перезанять
                  </button>
                )}
              </div>
            </div>
            <div className="sheet-grid">
              <div className="sheet-left">
                <h4>О компании</h4>
                <dl className="info-list">
                  <div>
                    <dt>Статус</dt>
                    <dd>
                      <span className={`status-word ${company.status}`}>
                        {company.status === 'hot' ? 'Горячий' : 'Тёплый'}
                      </span>
                    </dd>
                  </div>
                  <div>
                    <dt>Сфера</dt>
                    <dd>{(company.industries || []).join(', ') || '—'}</dd>
                  </div>
                  <div>
                    <dt>Дата создания</dt>
                    <dd>{formatDate(company.createdAt)}</dd>
                  </div>
                  <div>
                    <dt>Дата изменения</dt>
                    <dd>{formatDate(company.updatedAt)}</dd>
                  </div>
                </dl>
                <div className="sheet-divider" />
                <div className="reps-head">
                  <h4>Представители</h4>
                  <button type="button" className="reps-add" onClick={() => setEditing(true)} aria-label="Добавить представителя">
                    + Добавить
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
                          aria-expanded={selectedContactId === c.id}
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
                <h4>Комментарии</h4>
                <CommentSection
                  companyId={company.id}
                  comments={comments}
                  occupiedBy={company.occupiedBy}
                />
              </div>
            </div>
            <div className="company-card-actions">
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
