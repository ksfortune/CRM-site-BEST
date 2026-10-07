import React, { useEffect, useRef, useState } from 'react';

function PillMenu({ label, value, options, onChange, footer }) {
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState('');
  const rootRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const close = (event) => {
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
                onSubmit={(event) => {
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

export default function CompanyFilters({
  filters,
  setFilters,
  industries,
  onAddCompany,
  onAddIndustry,
  onAddUser,
}) {
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
