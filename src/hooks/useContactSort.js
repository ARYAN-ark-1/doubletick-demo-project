import { useMemo } from 'react';

export const useContactSort = (contacts, sortConfig) => {
  return useMemo(() => {
    if (!sortConfig.key) return contacts;
    
    const sorted = [...contacts].sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];
      
      // Numeric sorting for score
      if (sortConfig.key === 'score') {
        return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
      }
      
      // Date sorting for lastMessageAt
      if (sortConfig.key === 'lastMessageAt') {
        return sortConfig.direction === 'asc' 
          ? new Date(aVal) - new Date(bVal)
          : new Date(bVal) - new Date(aVal);
      }
      
      // String sorting for other fields
      const aStr = String(aVal).toLowerCase();
      const bStr = String(bVal).toLowerCase();
      if (aStr < bStr) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aStr > bStr) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
    
    return sorted;
  }, [contacts, sortConfig]);
};
