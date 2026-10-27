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
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);

  return (
    <div className="pill-menu" ref={rootRef}>
      <button type="button" className="filter-pill" onClick={() => setOpen((v) => !v)}>
        {label}
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
                  placeholder="Название"
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
  onAddCompany: () => void;
  onAddIndustry: (value: string) => void;
  onAddUser: () => void;
}

export default function CompanyFilters({
  filters,
  setFilters,
  industries,
  onAddCompany,
  onAddIndustry,
  onAddUser,
}: CompanyFiltersProps) {
  return (
    <div className="filters">
      <input
        className="search-pill"
        placeholder="Поиск компаний"
        value={filters.search}
        onChange={(e) => setFilters({ ...filters, search: e.target.value })}
      />
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
        footer={{ kind: 'action', label: 'Добавить юзера', onClick: onAddUser }}
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
      <button type="button" className="add-company-btn" onClick={onAddCompany}>
        <span className="plus-icon" aria-hidden="true">+</span>
        Создать компанию
      </button>
    </div>
  );
}
