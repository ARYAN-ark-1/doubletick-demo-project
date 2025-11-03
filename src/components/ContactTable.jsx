import React, { useRef, useCallback, useState } from 'react';
import TableHeader from './TableHeader';
import ContactRow from './ContactRow';
import '../styles/Table.css';

const ContactTable = ({ 
  contacts, 
  sortConfig, 
  onSort, 
  displayedRows,
  totalRows,
  onLoadMore 
}) => {
  const tableWrapperRef = useRef(null);
  const [selectedIds, setSelectedIds] = useState([]);

  const allSelected = contacts.length > 0 && selectedIds.length === contacts.length;

  // Select or deselect all
  const handleSelectAll = () => {
    if (allSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(contacts.map((c) => c.id));
    }
  };

  // Toggle individual selection
  const handleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]
    );
  };

  // Handle scroll for infinite loading
  const handleScroll = useCallback((e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    const scrollPercentage = (scrollTop + clientHeight) / scrollHeight;
    
    if (scrollPercentage > 0.8 && displayedRows < totalRows) {
      onLoadMore();
    }
  }, [displayedRows, totalRows, onLoadMore]);

  return (
    <div className="table-container">
      <div 
        className="table-wrapper" 
        ref={tableWrapperRef}
        onScroll={handleScroll}
      >
        <table>
          <TableHeader 
            sortConfig={sortConfig} 
            onSort={onSort}
            onSelectAll={handleSelectAll}
            allSelected={allSelected}
          />
          <tbody>
            {contacts.map((contact) => (
              <ContactRow
                key={contact.id}
                contact={contact}
                isSelected={selectedIds.includes(contact.id)}
                onSelect={handleSelect}
              />
            ))}
            {displayedRows < totalRows && (
              <tr>
                <td colSpan="6" className="loading-row">
                  Loading more...
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {selectedIds.length > 0 && (
        <div className="selection-info">
          {selectedIds.length} contact(s) selected
        </div>
      )}
    </div>
  );
};

export default ContactTable;
