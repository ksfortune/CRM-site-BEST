import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import CompanyTable from '../components/CompanyTable';
import CompanyFilters from '../components/CompanyFilters';
import CompanyForm from '../components/CompanyForm';
import Modal from '../components/Modal';

export default function Companies() {
  const { currentUser } = useAuth();
  const { companies, requestCompanyChange, directCompanyUpdate } = useData();
  const [filters, setFilters] = useState({ search:'', status:'', occupied:'', industry:'' });
  const [industries, setIndustries] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const inds = [...new Set(companies.map(c => c.industry).filter(Boolean))];
    setIndustries(inds);
  }, [companies]);

  const filtered = companies.filter(c => {
    if (filters.search && !c.name.toLowerCase().includes(filters.search.toLowerCase())) return false;
    if (filters.status && c.status !== filters.status) return false;
    if (filters.occupied === 'free' && c.occupiedBy) return false;
    if (filters.occupied === 'busy' && !c.occupiedBy) return false;
    if (filters.industry && c.industry !== filters.industry) return false;
    return true;
  });

  const handleCreate = (companyData) => {
    if (currentUser.role === 'admin') {
      directCompanyUpdate(companyData, currentUser);
    } else {
      requestCompanyChange('create', companyData, currentUser);
    }
    setIsModalOpen(false);
  };

  const handleAddIndustry = (newIndustry) => {
    if (newIndustry && !industries.includes(newIndustry)) {
      setIndustries(prev => [...prev, newIndustry]);
    }
  };

  return (
    <div className="container">
      <h1>Тёплые контакты</h1>
      <CompanyFilters 
        filters={filters} 
        setFilters={setFilters} 
        industries={industries}
        onAddCompany={() => setIsModalOpen(true)}
      />
      <CompanyTable companies={filtered} onRefresh={() => {}} />
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Новая компания">
        <CompanyForm 
          onSubmit={handleCreate} 
          industries={industries} 
          onAddIndustry={handleAddIndustry}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </div>
  );
}