import { useMemo } from 'react';

export const useContactFilter = (contacts, searchTerm) => {
  return useMemo(() => {
    if (!searchTerm) return contacts;
    
    const lowerSearch = searchTerm.toLowerCase();
    return contacts.filter(contact => 
      contact.name.toLowerCase().includes(lowerSearch) ||
      contact.email.toLowerCase().includes(lowerSearch) ||
      contact.phone.includes(lowerSearch)
    );
  }, [contacts, searchTerm]);
};

