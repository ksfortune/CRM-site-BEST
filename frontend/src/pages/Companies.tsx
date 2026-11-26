import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import CompanyTable from '../components/CompanyTable';
import CompanyFilters, { EMPTY_FILTERS, type CompanyFilterValues } from '../components/CompanyFilters';
import CompanyForm from '../components/CompanyForm';
import CompanyCard from '../components/CompanyCard';
import Modal from '../components/Modal';
import type { Company, CompanyDraft } from '../types';

type CompanyWithLegacy = Company & { industry?: string };

export default function Companies() {
  const { currentUser } = useAuth();
  const { companies, saveCompany, occupyCompany } = useData();
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState<CompanyFilterValues>(EMPTY_FILTERS);
  const [customIndustries, setCustomIndustries] = useState<string[]>([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Открытая карточка хранится в адресе (?company=<id>), чтобы на неё можно было сослаться
  // из профиля и из списка членов отдела.
  const selectedCompanyId = searchParams.get('company');

  const storedCompanies = companies as CompanyWithLegacy[];

  const industries = Array.from(new Set([
    ...storedCompanies.flatMap((c) => c.industries || (c.industry ? [c.industry] : [])).filter(Boolean),
    ...customIndustries,
  ]));

  const filtered = storedCompanies.filter((c) => {
    const industriesList = c.industries || (c.industry ? [c.industry] : []);
    if (filters.search && !c.name.toLowerCase().includes(filters.search.toLowerCase())) return false;
    if (filters.status && c.status !== filters.status) return false;
    if (filters.occupied === 'free' && c.occupiedBy) return false;
    if (filters.occupied === 'busy' && !c.occupiedBy) return false;
    if (filters.industry && !industriesList.includes(filters.industry)) return false;
    return true;
  });

  const selectedCompany = storedCompanies.find((c) => c.id === selectedCompanyId) || null;

  const openCompany = (companyId: string) => setSearchParams({ company: companyId });
  const closeCompany = () => setSearchParams({});

  const handleCreate = (companyData: CompanyDraft) => {
    if (!currentUser) return;
    saveCompany(companyData, currentUser);
    setIsCreateOpen(false);
  };

  const handleAddIndustry = (newIndustry: string) => {
    const value = (newIndustry || '').trim();
    if (value && !industries.includes(value)) {
      setCustomIndustries((prev) => [...prev, value]);
    }
  };

  const handleOccupy = (company: Company) => {
    if (!currentUser) return;
    const name = (currentUser.fullName || '').trim() || currentUser.email;
    occupyCompany(company.id, currentUser.id, name);
  };

  return (
    <div className="container">
      <div className="page-head">
        <div>
          <h1>Компании</h1>
          <p className="page-sub">
            Показано {filtered.length} из {storedCompanies.length}. Нажмите на компанию, чтобы открыть карточку.
          </p>
        </div>
        <div className="page-actions">
          <button type="button" className="add-company-btn" onClick={() => setIsCreateOpen(true)}>
            <span className="plus-icon" aria-hidden="true">+</span>
            Создать компанию
          </button>
        </div>
      </div>
      <CompanyFilters
        filters={filters}
        setFilters={setFilters}
        industries={industries}
        onAddIndustry={handleAddIndustry}
      />
      <CompanyTable
        companies={filtered}
        totalCount={storedCompanies.length}
        onOpenCompany={(c) => openCompany(c.id)}
        onOccupy={handleOccupy}
        onResetFilters={() => setFilters(EMPTY_FILTERS)}
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

      <CompanyCard
        company={selectedCompany}
        isOpen={!!selectedCompany}
        onClose={closeCompany}
        industriesCatalog={industries}
        onAddIndustry={handleAddIndustry}
        onSaved={() => {}}
      />
    </div>
  );
}
