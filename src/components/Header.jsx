import React from "react";
import "../styles/Header.css";
import doubletickLogo from "../assets/doubletick.png";
import filterIcon from "../assets/filter.svg";
import searchIcon from "../assets/search.svg";

const Header = ({
  searchTerm,
  onSearchChange,
  showFilters,
  onToggleFilters,
  visibleCount,
  filteredCount,
  totalCount
}) => {
  return (
    <header className="dt-header">
      {/* Logo */}
      <div className="dt-logo-line">
        <img src={doubletickLogo} alt="DoubleTick" className="dt-logo-large" />
      </div>

      {/* Divider */}
      <div className="dt-divider" />

      {/* Title */}
      <div className="dt-title-line">
        <h2>All Customers</h2>
        <span className="dt-count">
          {filteredCount?.toLocaleString() || 0}
        </span>
      </div>

      {/* Divider */}
      <div className="dt-divider" />

      {/* Search + Filter */}
      <div className="dt-controls-line">
        {/* Search */}
        <div className="dt-search-box">
          <img src={searchIcon} alt="Search" className="dt-search-icon" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search Customers"
            className="dt-search-input"
          />
        </div>

        {/* Filter */}
        <div className="dt-filter">
          <button className="dt-filter-btn" onClick={onToggleFilters}>
            <img src={filterIcon} alt="Filter" className="dt-filter-icon" />
            Add Filters
          </button>

          {showFilters && (
            <div className="dt-filter-dropdown">
              <ul>
                <li>Filter 1</li>
                <li>Filter 2</li>
                <li>Filter 3</li>
                <li>Filter 4</li>
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="dt-stats-line">
        Showing {visibleCount?.toLocaleString() || 0} of{" "}
        {filteredCount?.toLocaleString() || 0} customers
        {filteredCount !== totalCount &&
          ` (filtered from ${totalCount?.toLocaleString() || 0} total)`}
      </div>
    </header>
  );
};

export default Header;
