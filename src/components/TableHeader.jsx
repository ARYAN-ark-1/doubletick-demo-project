import React from 'react';
import '../styles/Table.css';

const TableHeader = ({ sortConfig, onSort, onSelectAll, allSelected }) => {
  const renderSortIcon = (columnKey) => {
    if (sortConfig.key !== columnKey) return ' ⇅';
    return sortConfig.direction === 'asc' ? ' ↑' : ' ↓';
  };

  return (
    <thead>
      <tr>
        {/* Checkbox column */}
        <th className="checkbox-col">
          <input
            type="checkbox"
            checked={allSelected}
            onChange={onSelectAll}
          />
        </th>
        <th onClick={() => onSort('name')}>
          Contact{renderSortIcon('name')}
        </th>
        <th onClick={() => onSort('phone')}>
          Phone{renderSortIcon('phone')}
        </th>
        <th onClick={() => onSort('score')}>
          Score{renderSortIcon('score')}
        </th>
        <th onClick={() => onSort('lastMessageAt')}>
          Last Message{renderSortIcon('lastMessageAt')}
        </th>
        <th onClick={() => onSort('addedBy')}>
          Added By{renderSortIcon('addedBy')}
        </th>
      </tr>
    </thead>
  );
};

export default TableHeader;
