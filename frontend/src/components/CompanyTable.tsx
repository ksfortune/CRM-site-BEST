import { useEffect, useRef, useState } from 'react';
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
  const occupantName = company.occupiedByName || 'Занято';

  useEffect(() => {
    if (!industriesOpen) return undefined;
    const close = (event: MouseEvent) => {
      if (!(event.target instanceof Node)) return;
      if (!industryRef.current?.contains(event.target)) setIndustriesOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [industriesOpen]);

  return (
    <div
      className={`company-pill ${company.occupiedBy ? 'occupied-row' : ''}`}
      onClick={() => onOpenCompany(company)}
    >
      <span className="company-pill-name">{company.name}</span>
      <span className={`status-word ${company.status}`}>
        {company.status === 'hot' ? 'Горячий' : 'Тёплый'}
      </span>
      <span className="occupy-slot">
        {company.occupiedBy ? (
          <span className="occupy-word busy">
            Занято
            <span className="occupy-tooltip" role="tooltip">
              {occupantName}
            </span>
          </span>
        ) : (
          <button
            type="button"
            className="occupy-word free"
            onClick={(event) => {
              event.stopPropagation();
              onOccupy(company);
            }}
          >
            Занять
          </button>
        )}
      </span>
      <span className="industry-slot">
        <span>{industries[0] || '—'}</span>
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
  onOpenCompany: (company: Company) => void;
  onOccupy: (company: Company) => void;
}

export default function CompanyTable({ companies, onOpenCompany, onOccupy }: CompanyTableProps) {
  return (
    <div className="company-list">
      {companies.map((company) => (
        <CompanyRow
          key={company.id}
          company={company}
          onOpenCompany={onOpenCompany}
          onOccupy={onOccupy}
        />
      ))}
      {companies.length === 0 && (
        <div className="empty-state">Компаний пока нет</div>
      )}
    </div>
  );
}
