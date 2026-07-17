import React, { useState } from 'react';
import { v4 as uuid } from 'uuid';
import SocialChips from './SocialChips';

const emptyContact = () => ({
  id: uuid(),
  name: '',
  nickname: '',
  phone: '',
  channels: [],
});

export default function CompanyForm({ onSubmit, industriesCatalog, onAddIndustry, onCancel, initialData }) {
  const [form, setForm] = useState(() => normalizeInitial(initialData));
  const [newIndustry, setNewIndustry] = useState('');
  const [showNewIndustry, setShowNewIndustry] = useState(false);

  const toggleIndustry = (ind) => {
    setForm((prev) => {
      const has = prev.industries.includes(ind);
      return {
        ...prev,
        industries: has ? prev.industries.filter((i) => i !== ind) : [...prev.industries, ind],
      };
    });
  };

  const addIndustry = () => {
    const value = newIndustry.trim();
    if (!value) return;
    if (!industriesCatalog.includes(value)) onAddIndustry(value);
    setForm((prev) => ({
      ...prev,
      industries: prev.industries.includes(value) ? prev.industries : [...prev.industries, value],
    }));
    setNewIndustry('');
    setShowNewIndustry(false);
  };

  const updateContact = (idx, patch) => {
    setForm((prev) => ({
      ...prev,
      contacts: prev.contacts.map((c, i) => (i === idx ? { ...c, ...patch } : c)),
    }));
  };

  const removeContact = (idx) => {
    setForm((prev) => ({
      ...prev,
      contacts: prev.contacts.filter((_, i) => i !== idx),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      alert('Название обязательно');
      return;
    }
    if (!form.industries.length) {
      alert('Укажите хотя бы одну сферу деятельности');
      return;
    }
    onSubmit({
      ...form,
      name: form.name.trim(),
      contacts: form.contacts.filter((c) => c.name.trim()),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="company-edit-form">
      <div className="form-section">
        <label className="field-label">Название *</label>
        <input
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="Название компании"
          required
        />
      </div>

      <div className="form-section">
        <label className="field-label">Сферы деятельности *</label>
        <div className="industry-chips">
          {industriesCatalog.map((ind) => (
            <button
              key={ind}
              type="button"
              className={`industry-chip ${form.industries.includes(ind) ? 'active' : ''}`}
              onClick={() => toggleIndustry(ind)}
            >
              {ind}
            </button>
          ))}
          <button type="button" className="industry-chip add" onClick={() => setShowNewIndustry(true)}>
            + Новая
          </button>
        </div>
        {showNewIndustry && (
          <div className="inline-add-row">
            <input
              value={newIndustry}
              onChange={(e) => setNewIndustry(e.target.value)}
              placeholder="Новая сфера"
            />
            <button type="button" className="btn-primary" onClick={addIndustry}>
              Добавить
            </button>
            <button type="button" className="btn-ghost" onClick={() => setShowNewIndustry(false)}>
              Отмена
            </button>
          </div>
        )}
        {form.industries.length > 0 && (
          <div className="selected-tags">
            Выбрано: {form.industries.join(', ')}
          </div>
        )}
      </div>

      <div className="form-section">
        <label className="field-label">Статус</label>
        <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
          <option value="warm">Тёплый</option>
          <option value="hot">Горячий</option>
        </select>
      </div>

      <div className="form-section">
        <div className="section-head">
          <label className="field-label">Представители</label>
          <button
            type="button"
            className="btn-ghost"
            onClick={() => setForm((prev) => ({ ...prev, contacts: [...prev.contacts, emptyContact()] }))}
          >
            + Контакт
          </button>
        </div>
        {form.contacts.length === 0 && (
          <p className="empty-message">Пока нет представителей — добавьте контакт</p>
        )}
        {form.contacts.map((contact, idx) => (
          <div key={contact.id} className="contact-edit-card">
            <div className="contact-edit-grid">
              <input
                placeholder="Имя *"
                value={contact.name}
                onChange={(e) => updateContact(idx, { name: e.target.value })}
              />
              <input
                placeholder="Никнейм"
                value={contact.nickname}
                onChange={(e) => updateContact(idx, { nickname: e.target.value })}
              />
              <input
                placeholder="Телефон"
                value={contact.phone}
                onChange={(e) => updateContact(idx, { phone: e.target.value })}
              />
            </div>
            <label className="field-label subtle">Способы связи</label>
            <SocialChips
              channels={contact.channels || []}
              onChange={(channels) => updateContact(idx, { channels })}
            />
            <button type="button" className="remove-contact-btn" onClick={() => removeContact(idx)}>
              Удалить контакт
            </button>
          </div>
        ))}
      </div>

      <div className="form-actions">
        <button type="button" className="btn-ghost" onClick={onCancel}>
          Отмена
        </button>
        <button type="submit" className="btn-primary">
          Сохранить
        </button>
      </div>
    </form>
  );
}

function normalizeInitial(data) {
  if (!data) {
    return {
      name: '',
      industries: [],
      status: 'warm',
      contacts: [],
    };
  }
  return {
    ...data,
    name: data.name || '',
    industries: data.industries || (data.industry ? [data.industry] : []),
    status: data.status || 'warm',
    contacts: (data.contacts || []).map((c) => ({
      id: c.id || uuid(),
      name: c.name || '',
      nickname: c.nickname || '',
      phone: c.phone || '',
      channels: c.channels || [],
    })),
  };
}
