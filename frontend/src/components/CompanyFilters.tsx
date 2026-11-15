import { useEffect, useRef, useState, type Dispatch, type FormEvent, type SetStateAction } from 'react';

export interface CompanyFilterValues {
  search: string;
  status: string;
  occupied: string;
  industry: string;
}

interface PillOption {
  value: string;
  label: string;
}

type PillFooter =
  | { kind: 'create'; label: string; onCreate: (value: string) => void }
  | { kind: 'action'; label: string; onClick: () => void };

interface PillMenuProps {
  label: string;
  value: string;
  options: PillOption[];
  onChange: (value: string) => void;
  footer?: PillFooter;
}

function PillMenu({ label, value, options, onChange, footer }: PillMenuProps) {
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState('');
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return undefined;
    const close = (event: MouseEvent) => {
      if (!(event.target instanceof Node)) return;
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [open]);

  const isActive = value !== '';
  const current = options.find((opt) => opt.value === value);
  const buttonText = isActive ? `${label}: ${current?.label ?? value}` : label;

  return (
    <div className="pill-menu" ref={rootRef}>
      <button
        type="button"
        className={`filter-pill${isActive ? ' active' : ''}`}
        aria-haspopup="true"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        {buttonText}
        <svg className="chevron" viewBox="0 0 10 10" aria-hidden="true">
          <path d="M1.5 3.5 5 7l3.5-3.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && (
        <div className="pill-dropdown">
          {options.map((opt) => (
            <button
              key={opt.value || 'all'}
              type="button"
              className={value === opt.value ? 'active' : ''}
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
            >
              {opt.label}
            </button>
          ))}
          {footer?.kind === 'create' && (
            creating ? (
              <form
                className="pill-dropdown-create"
                onSubmit={(event: FormEvent<HTMLFormElement>) => {
                  event.preventDefault();
                  const next = draft.trim();
                  if (next) footer.onCreate(next);
                  setDraft('');
                  setCreating(false);
                  setOpen(false);
                }}
              >
                <input
                  autoFocus
                  value={draft}
                  placeholder="Название, затем Enter"
                  onChange={(event) => setDraft(event.target.value)}
                />
              </form>
            ) : (
              <button type="button" className="pill-dropdown-extra" onClick={() => setCreating(true)}>
                + {footer.label}
              </button>
            )
          )}
          {footer?.kind === 'action' && (
            <button
              type="button"
              className="pill-dropdown-extra"
              onClick={() => {
                setOpen(false);
                footer.onClick();
              }}
            >
              + {footer.label}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

interface CompanyFiltersProps {
  filters: CompanyFilterValues;
  setFilters: Dispatch<SetStateAction<CompanyFilterValues>>;
  industries: string[];
  onAddIndustry: (value: string) => void;
}

export const EMPTY_FILTERS: CompanyFilterValues = { search: '', status: '', occupied: '', industry: '' };

export function hasActiveFilters(filters: CompanyFilterValues): boolean {
  return Boolean(filters.search || filters.status || filters.occupied || filters.industry);
}

export default function CompanyFilters({
  filters,
  setFilters,
  industries,
  onAddIndustry,
}: CompanyFiltersProps) {
  return (
    <div className="filters" role="search">
      <label className="search-field">
        <svg className="search-icon" viewBox="0 0 20 20" aria-hidden="true">
          <circle cx="9" cy="9" r="5.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
          <path d="m13.2 13.2 3.8 3.8" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
        <input
          className="search-pill"
          type="search"
          placeholder="Поиск по названию компании"
          aria-label="Поиск компании по названию"
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
        />
      </label>
      <PillMenu
        label="Статус"
        value={filters.status}
        onChange={(status) => setFilters({ ...filters, status })}
        options={[
          { value: '', label: 'Все' },
          { value: 'hot', label: 'Горячий' },
          { value: 'warm', label: 'Тёплый' },
        ]}
      />
      <PillMenu
        label="Доступность"
        value={filters.occupied}
        onChange={(occupied) => setFilters({ ...filters, occupied })}
        options={[
          { value: '', label: 'Все' },
          { value: 'busy', label: 'Занято' },
          { value: 'free', label: 'Свободно' },
        ]}
      />
      <PillMenu
        label="Сферы"
        value={filters.industry}
        onChange={(industry) => setFilters({ ...filters, industry })}
        options={[
          { value: '', label: 'Все' },
          ...industries.map((ind) => ({ value: ind, label: ind })),
        ]}
        footer={{ kind: 'create', label: 'Добавить сферу', onCreate: onAddIndustry }}
      />
      {hasActiveFilters(filters) && (
        <button type="button" className="filters-reset" onClick={() => setFilters(EMPTY_FILTERS)}>
          Сбросить фильтры
        </button>
      )}
    </div>
  );
}
