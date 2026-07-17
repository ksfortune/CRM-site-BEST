import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';

export default function CompanyTable({ companies, onOpenCompany }) {
  const { findUserById } = useData();
  const [hoverId, setHoverId] = useState(null);

  return (
    <div className="table-container">
      <table>
        <thead>
          <tr>
            <th>Название</th>
            <th>Сферы</th>
            <th>Статус</th>
            <th>Занятость</th>
            <th>Представители</th>
          </tr>
        </thead>
        <tbody>
          {companies.map((c) => {
            const occupant = c.occupiedBy ? findUserById(c.occupiedBy) : null;
            return (
              <tr
                key={c.id}
                className={`company-row ${c.occupiedBy ? 'occupied-row' : ''}`}
                onClick={() => onOpenCompany(c)}
              >
                <td>
                  <strong className="company-row-name">{c.name}</strong>
                </td>
                <td>
                  <div className="table-tags">
                    {(c.industries || []).slice(0, 3).map((ind) => (
                      <span key={ind} className="table-tag">
                        {ind}
                      </span>
                    ))}
                    {(c.industries || []).length > 3 && (
                      <span className="table-tag">+{(c.industries || []).length - 3}</span>
                    )}
                  </div>
                </td>
                <td>
                  <span className={`status-badge ${c.status}`}>
                    {c.status === 'hot' ? 'Горячий' : 'Тёплый'}
                  </span>
                </td>
                <td
                  className="occupy-cell"
                  onMouseEnter={() => setHoverId(c.id)}
                  onMouseLeave={() => setHoverId(null)}
                  onClick={(e) => e.stopPropagation()}
                >
                  {c.occupiedBy ? (
                    <span className="occupy-name busy">{c.occupiedByName || 'Занята'}</span>
                  ) : (
                    <span className="occupy-name free">Свободна</span>
                  )}
                  {hoverId === c.id && occupant && (
                    <div className="occupy-tooltip">
                      <div>
                        <strong>
                          {occupant.firstName} {occupant.lastName}
                        </strong>
                      </div>
                      <div>{occupant.email}</div>
                      {occupant.phone && <div>{occupant.phone}</div>}
                    </div>
                  )}
                </td>
                <td>
                  {(c.contacts || []).map((ct) => ct.name).filter(Boolean).join(', ') || '—'}
                </td>
              </tr>
            );
          })}
          {companies.length === 0 && (
            <tr>
              <td colSpan={5} className="empty-state">
                Компаний пока нет
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
