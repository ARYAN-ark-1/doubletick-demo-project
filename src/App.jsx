import React, { useState, useMemo, useCallback } from 'react';
import Header from './components/Header';
import ContactTable from './components/ContactTable';
import { generateContacts } from './utils/dataGenerator';
import { useDebounce } from './hooks/useDebounce';
import { useContactFilter } from './hooks/useContactFilter';
import { useContactSort } from './hooks/useContactSort';
import './styles/App.css';

const App = () => {
  // Generate 1M contacts once on mount
  const [allContacts] = useState(() => generateContacts(1000000));
  
  // State management
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [displayedRows, setDisplayedRows] = useState(30);
  const [showFilters, setShowFilters] = useState(false);
  
  // Debounce search term
  const debouncedSearch = useDebounce(searchTerm, 250);
  
  // Filter and sort contacts using custom hooks
  const filteredContacts = useContactFilter(allContacts, debouncedSearch);
  const sortedContacts = useContactSort(filteredContacts, sortConfig);
  
  // Get visible contacts for current page
  const visibleContacts = useMemo(() => {
    return sortedContacts.slice(0, displayedRows);
  }, [sortedContacts, displayedRows]);
  
  // Handle search change and reset pagination
  const handleSearchChange = useCallback((value) => {
    setSearchTerm(value);
    setDisplayedRows(30);
  }, []);
  
  // Handle column sort
  const handleSort = useCallback((key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  }, []);
  
  // Handle loading more rows
  const handleLoadMore = useCallback(() => {
    setDisplayedRows(prev => Math.min(prev + 30, sortedContacts.length));
  }, [sortedContacts.length]);
  
  // Toggle filters dropdown
  const handleToggleFilters = useCallback(() => {
    setShowFilters(prev => !prev);
  }, []);

  return (
    <div className="app-container">
      <Header
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        showFilters={showFilters}
        onToggleFilters={handleToggleFilters}
        visibleCount={visibleContacts.length}
        filteredCount={sortedContacts.length}
        totalCount={allContacts.length}
      />
      <ContactTable
        contacts={visibleContacts}
        sortConfig={sortConfig}
        onSort={handleSort}
        displayedRows={displayedRows}
        totalRows={sortedContacts.length}
        onLoadMore={handleLoadMore}
      />
    </div>
  );
};

export default App;
