import React from 'react';
import '../styles/SearchBox.css';

const SearchBox = ({ value, onChange }) => {
  return (
    <div className="search-box">
      <span className="search-icon">🔍</span>
      <input
        type="text"
        placeholder="Search by name, email, or phone..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
};

export default SearchBox;

