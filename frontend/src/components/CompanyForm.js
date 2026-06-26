import React, { useState } from 'react';

export default function CompanyForm({ onSubmit, industries, onAddIndustry, onCancel, initialData }) {
  const [form, setForm] = useState(initialData || {
    name: '',
    industry: '',
    repName: '',
    phone: '',
    messenger: '',
    email: '',
    website: '',
    status: 'warm'
  });
  const [newIndustry, setNewIndustry] = useState('');
  const [showNewIndustryInput, setShowNewIndustryInput] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleIndustryChange = (e) => {
    const value = e.target.value;
    if (value === '__new__') {
      setShowNewIndustryInput(true);
      setForm({ ...form, industry: '' });
    } else {
      setShowNewIndustryInput(false);
      setForm({ ...form, industry: value });
    }
  };

  const addNewIndustry = () => {
    if (newIndustry.trim()) {
      if (!industries.includes(newIndustry)) {
        onAddIndustry(newIndustry);
        setForm({ ...form, industry: newIndustry });
      } else {
        alert('Такая сфера уже существует');
        setForm({ ...form, industry: newIndustry });
      }
      setNewIndustry('');
      setShowNewIndustryInput(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.industry) {
      alert('Название и сфера деятельности обязательны');
      return;
    }
    onSubmit(form);
    // Сброс формы, если это добавление новой компании (не редактирование)
    if (!initialData) {
      setForm({
        name: '', industry: '', repName: '', phone: '', messenger: '', email: '', website: '', status: 'warm'
      });
    }
    setShowNewIndustryInput(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="name" placeholder="Название *" value={form.name} onChange={handleChange} required />
      
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap', marginTop: '8px' }}>
        <select name="industry" value={form.industry || (showNewIndustryInput ? '' : form.industry)} onChange={handleIndustryChange} style={{ flex: 1, minWidth: '150px' }}>
          <option value="">Выберите сферу *</option>
          {industries.map(ind => <option key={ind} value={ind}>{ind}</option>)}
          <option value="__new__">➕ Новая сфера</option>
        </select>
        
        {showNewIndustryInput && (
          <>
            <input 
              placeholder="Название новой сферы" 
              value={newIndustry} 
              onChange={e => setNewIndustry(e.target.value)} 
              style={{ flex: 1 }}
            />
            <button type="button" onClick={addNewIndustry}>✅ Добавить</button>
            <button type="button" onClick={() => setShowNewIndustryInput(false)}>❌ Отмена</button>
          </>
        )}
      </div>
      
      <input name="repName" placeholder="Имя представителя" value={form.repName} onChange={handleChange} />
      <input name="phone" placeholder="Телефон" value={form.phone} onChange={handleChange} />
      <input name="messenger" placeholder="Мессенджер" value={form.messenger} onChange={handleChange} />
      <input name="email" placeholder="Email" value={form.email} onChange={handleChange} />
      <input name="website" placeholder="Сайт / VK / TG" value={form.website} onChange={handleChange} />
      
      <select name="status" value={form.status} onChange={handleChange}>
        <option value="hot">Горячий</option>
        <option value="warm">Тёплый</option>
      </select>
      
      <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '20px' }}>
        <button type="button" onClick={onCancel}>Отмена</button>
        <button type="submit">Сохранить</button>
      </div>
    </form>
  );
}