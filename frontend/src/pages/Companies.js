import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import CompanyTable from '../components/CompanyTable';
import CompanyFilters from '../components/CompanyFilters';
import CompanyForm from '../components/CompanyForm';
import CompanyCard from '../components/CompanyCard';
import Modal from '../components/Modal';

const EMPTY_USER = { firstName: '', lastName: '', email: '', password: '' };

export default function Companies() {
  const { currentUser } = useAuth();
  const { companies, requestCompanyChange, directCompanyUpdate, occupyCompany, createUserByAdmin } = useData();
  const [filters, setFilters] = useState({ search: '', status: '', occupied: '', industry: '' });
  const [customIndustries, setCustomIndustries] = useState([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isUserOpen, setIsUserOpen] = useState(false);
  const [userForm, setUserForm] = useState(EMPTY_USER);
  const [userError, setUserError] = useState('');
  const [selectedCompanyId, setSelectedCompanyId] = useState(null);

  const industries = [
    ...new Set([
      ...companies.flatMap((c) => c.industries || (c.industry ? [c.industry] : [])).filter(Boolean),
      ...customIndustries,
    ]),
  ];

  const filtered = companies.filter((c) => {
    const industriesList = c.industries || (c.industry ? [c.industry] : []);
    if (filters.search && !c.name.toLowerCase().includes(filters.search.toLowerCase())) return false;
    if (filters.status && c.status !== filters.status) return false;
    if (filters.occupied === 'free' && c.occupiedBy) return false;
    if (filters.occupied === 'busy' && !c.occupiedBy) return false;
    if (filters.industry && !industriesList.includes(filters.industry)) return false;
    return true;
  });

  const selectedCompany = companies.find((c) => c.id === selectedCompanyId) || null;

  const handleCreate = (companyData) => {
    if (currentUser.role === 'admin') {
      directCompanyUpdate(companyData, currentUser);
    } else {
      requestCompanyChange('create', companyData, currentUser);
    }
    setIsCreateOpen(false);
  };

  const handleAddIndustry = (newIndustry) => {
    const value = (newIndustry || '').trim();
    if (value && !industries.includes(value)) {
      setCustomIndustries((prev) => [...prev, value]);
    }
  };

  const handleOccupy = (company) => {
    const name = `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim() || currentUser.email;
    occupyCompany(company.id, currentUser.id, name);
  };

  const handleCreateUser = (event) => {
    event.preventDefault();
    try {
      createUserByAdmin({
        firstName: userForm.firstName.trim(),
        lastName: userForm.lastName.trim(),
        email: userForm.email.trim(),
        password: userForm.password,
        bestEmail: userForm.email.trim(),
        role: 'user',
      });
      setUserForm(EMPTY_USER);
      setUserError('');
      setIsUserOpen(false);
    } catch (error) {
      setUserError(error.message || 'Не удалось создать пользователя');
    }
  };

  return (
    <div className="container">
      <CompanyFilters
        filters={filters}
        setFilters={setFilters}
        industries={industries}
        onAddCompany={() => setIsCreateOpen(true)}
        onAddIndustry={handleAddIndustry}
        onAddUser={() => {
          setUserError('');
          setIsUserOpen(true);
        }}
      />
      <CompanyTable
        companies={filtered}
        onOpenCompany={(c) => setSelectedCompanyId(c.id)}
        onOccupy={handleOccupy}
      />

      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Создать компанию" size="lg" className="modal-edit">
        <div className="company-edit-block">
          <CompanyForm
            onSubmit={handleCreate}
            industriesCatalog={industries}
            onAddIndustry={handleAddIndustry}
            onCancel={() => setIsCreateOpen(false)}
          />
        </div>
      </Modal>

      <Modal isOpen={isUserOpen} onClose={() => setIsUserOpen(false)} title="Добавить юзера" className="modal-edit">
        <form className="create-user-form" onSubmit={handleCreateUser}>
          {userError && <p className="auth-error">{userError}</p>}
          <input
            type="text"
            placeholder="Имя"
            value={userForm.firstName}
            onChange={(event) => setUserForm({ ...userForm, firstName: event.target.value })}
            required
          />
          <input
            type="text"
            placeholder="Фамилия"
            value={userForm.lastName}
            onChange={(event) => setUserForm({ ...userForm, lastName: event.target.value })}
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={userForm.email}
            onChange={(event) => setUserForm({ ...userForm, email: event.target.value })}
            required
          />
          <input
            type="password"
            placeholder="Пароль"
            value={userForm.password}
            onChange={(event) => setUserForm({ ...userForm, password: event.target.value })}
            required
          />
          <div className="form-actions">
            <button type="button" className="btn-ghost" onClick={() => setIsUserOpen(false)}>Отмена</button>
            <button type="submit" className="btn-primary">Создать</button>
          </div>
        </form>
      </Modal>

      <CompanyCard
        company={selectedCompany}
        isOpen={!!selectedCompany}
        onClose={() => setSelectedCompanyId(null)}
        industriesCatalog={industries}
        onAddIndustry={handleAddIndustry}
        onSaved={() => {}}
      />
    </div>
  );
}
