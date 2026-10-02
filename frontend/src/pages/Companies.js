import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import CompanyTable from '../components/CompanyTable';
import CompanyFilters from '../components/CompanyFilters';
import CompanyForm from '../components/CompanyForm';
import CompanyCard from '../components/CompanyCard';
import Modal from '../components/Modal';

export default function Companies() {
  const { currentUser } = useAuth();
  const { companies, requestCompanyChange, directCompanyUpdate } = useData();
  const [filters, setFilters] = useState({ search: '', status: '', occupied: '', industry: '' });
  const [industries, setIndustries] = useState([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedCompanyId, setSelectedCompanyId] = useState(null);

  useEffect(() => {
    const inds = [
      ...new Set(
        companies.flatMap((c) => c.industries || (c.industry ? [c.industry] : [])).filter(Boolean)
      ),
    ];
    setIndustries(inds);
  }, [companies]);

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
    if (newIndustry && !industries.includes(newIndustry)) {
      setIndustries((prev) => [...prev, newIndustry]);
    }
  };

  return (
    <div className="container">
      <h1 className="chaos-title">
        <span className="chaos-title-glitch" data-text="Тёплые контакты">
          Тёплые контакты
        </span>
        <span className="chaos-title-badge">🏳️‍⚧️ pride · BLM · women</span>
      </h1>
      <p className="page-subtitle chaos-subtitle">
        LGBTQ+ friendly · trans women are women · Black Lives Matter · women supporting women
      </p>
      <div className="solidarity-strip" role="note">
        <span className="solidarity-pill pride">🏳️‍🌈 LGBTQ+</span>
        <span className="solidarity-pill trans">🏳️‍⚧️ Trans rights</span>
        <span className="solidarity-pill women">♀️ Women first</span>
        <span className="solidarity-pill blm">✊ Black Lives Matter</span>
      </div>
      <CompanyFilters
        filters={filters}
        setFilters={setFilters}
        industries={industries}
        onAddCompany={() => setIsCreateOpen(true)}
      />
      <CompanyTable
        companies={filtered}
        onOpenCompany={(c) => setSelectedCompanyId(c.id)}
      />

      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Новая компания" size="lg">
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
        onClose={() => setSelectedCompanyId(null)}
        industriesCatalog={industries}
        onAddIndustry={handleAddIndustry}
        onSaved={() => {}}
      />
    </div>
  );
}
