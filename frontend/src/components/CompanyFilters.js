import React from 'react';

export default function CompanyFilters({ filters, setFilters, industries, onAddCompany }) {
  return (
    <div className="filters">
      <input 
        placeholder="Поиск по названию" 
        value={filters.search} 
        onChange={e => setFilters({...filters, search: e.target.value})} 
      />
      <select 
        value={filters.status} 
        onChange={e => setFilters({...filters, status: e.target.value})}
      >
        <option value="">Все статусы</option>
        <option value="hot">Горячий</option>
        <option value="warm">Тёплый</option>
      </select>
      <select 
        value={filters.occupied} 
        onChange={e => setFilters({...filters, occupied: e.target.value})}
      >
        <option value="">Все</option>
        <option value="free">Свободны</option>
        <option value="busy">Заняты</option>
      </select>
      <select 
        value={filters.industry} 
        onChange={e => setFilters({...filters, industry: e.target.value})}
      >
        <option value="">Все сферы</option>
        {industries.map(ind => <option key={ind} value={ind}>{ind}</option>)}
      </select>
      <button className="add-company-btn" onClick={onAddCompany}>
        + Добавить компанию
      </button>
    </div>
  );
}