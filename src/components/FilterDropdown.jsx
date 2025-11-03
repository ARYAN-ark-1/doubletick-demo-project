import React from 'react';
import '../styles/FilterDropdown.css';

const FilterDropdown = ({ show, onToggle }) => {
  return (
    <div style={{ position: 'relative' }}>
      <button 
        className="filter-btn"
        onClick={onToggle}
      >
        Filters ▾
      </button>
      {show && (
        <div className="filter-dropdown">
          <h3>Filter Options</h3>
          <div className="filter-option">Score Range (Coming soon)</div>
          <div className="filter-option">Date Range (Coming soon)</div>
          <div className="filter-option">Added By (Coming soon)</div>
        </div>
      )}
    </div>
  );
};

export default FilterDropdown;
