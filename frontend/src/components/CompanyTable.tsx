import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import type { Company } from '../types';

type CompanyRowData = Company & { industry?: string };

interface CompanyRowProps {
  company: CompanyRowData;
  onOpenCompany: (company: Company) => void;
  onOccupy: (company: Company) => void;
}

function CompanyRow({ company, onOpenCompany, onOccupy }: CompanyRowProps) {
  const [industriesOpen, setIndustriesOpen] = useState(false);
  const industryRef = useRef<HTMLSpanElement>(null);
  const industries = company.industries || (company.industry ? [company.industry] : []);
  const extraIndustries = industries.slice(1);
  const occupantName = company.occupiedByName || '';

  useEffect(() => {
    if (!industriesOpen) return undefined;
    const close = (event: MouseEvent) => {
      if (!(event.target instanceof Node)) return;
      if (!industryRef.current?.contains(event.target)) setIndustriesOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [industriesOpen]);

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    // Enter/пробел открывают карточку, только если фокус на самой строке, а не на кнопке внутри
    if (event.target !== event.currentTarget) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onOpenCompany(company);
    }
  };

  return (
    <div
      className={`company-pill ${company.occupiedBy ? 'occupied-row' : ''}`}
      role="button"
      tabIndex={0}
      aria-label={`Открыть карточку компании ${company.name}`}
      onClick={() => onOpenCompany(company)}
      onKeyDown={handleKeyDown}
    >
      <span className="company-pill-name" title={company.name}>{company.name}</span>
      <span className={`status-word ${company.status}`}>
        {company.status === 'hot' ? 'Горячий' : 'Тёплый'}
      </span>
      <span className="occupy-slot">
        {company.occupiedBy ? (
          <span className="occupy-word busy" title={occupantName ? `Работает: ${occupantName}` : 'Занято'}>
            <span className="occupy-label">Занято</span>
            {occupantName && <span className="occupy-name">{occupantName}</span>}
          </span>
        ) : (
          <>
            <span className="occupy-state free">Свободна</span>
            <button
              type="button"
              className="occupy-word free"
              aria-label={`Занять компанию ${company.name}`}
              onClick={(event) => {
                event.stopPropagation();
                onOccupy(company);
              }}
            >
              Занять
            </button>
          </>
        )}
      </span>
      <span className="industry-slot">
        {industries[0] ? <span className="industry-chip-static">{industries[0]}</span> : <span>—</span>}
        {extraIndustries.length > 0 && (
          <span className="industry-more-wrap" ref={industryRef}>
            <button
              type="button"
              className="industry-more"
              aria-expanded={industriesOpen}
              aria-label={`Ещё сферы: ${extraIndustries.length}`}
              onClick={(event) => {
                event.stopPropagation();
                setIndustriesOpen((open) => !open);
              }}
            >
              +{extraIndustries.length}
            </button>
            {industriesOpen && (
              <span className="industry-popover" onClick={(event) => event.stopPropagation()}>
                {extraIndustries.map((name) => (
                  <span key={name} className="industry-popover-chip">
                    {name}
                  </span>
                ))}
              </span>
            )}
          </span>
        )}
      </span>
    </div>
  );
}

interface CompanyTableProps {
  companies: CompanyRowData[];
  totalCount: number;
  onOpenCompany: (company: Company) => void;
  onOccupy: (company: Company) => void;
  onResetFilters: () => void;
}

export default function CompanyTable({ companies, totalCount, onOpenCompany, onOccupy, onResetFilters }: CompanyTableProps) {
  return (
    <div className="company-list">
      {companies.length > 0 && (
        <div className="company-list-head" aria-hidden="true">
          <span>Компания</span>
          <span>Статус</span>
          <span>Доступ</span>
          <span>Сферы</span>
        </div>
      )}
      {companies.map((company) => (
        <CompanyRow
          key={company.id}
          company={company}
          onOpenCompany={onOpenCompany}
          onOccupy={onOccupy}
        />
      ))}
      {companies.length === 0 && (
        totalCount === 0 ? (
          <div className="empty-state">
            <strong>Компаний пока нет</strong>
            <span>Нажмите «Создать компанию», чтобы добавить первую.</span>
          </div>
        ) : (
          <div className="empty-state">
            <strong>Ничего не найдено</strong>
            <span>Попробуйте изменить поиск или фильтры.</span>
            <button type="button" className="btn-ghost" onClick={onResetFilters}>
              Сбросить фильтры
            </button>
          </div>
        )
      )}
    </div>
  );
}
