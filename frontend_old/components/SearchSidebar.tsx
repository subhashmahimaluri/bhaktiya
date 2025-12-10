import Link from 'next/link';
import React from 'react';

interface SearchSidebarProps {
  query?: string;
  category?: string;
  totalResults?: number;
}

const SearchSidebar: React.FC<SearchSidebarProps> = ({ query, category, totalResults }) => {
  // Search tips
  const searchTips = [
    'Use specific deity names for better results',
    'Try searching by occasion or festival',
    'Use Sanskrit terms for traditional content',
    'Browse by categories for exploration',
  ];

  // Popular searches (could be dynamic in the future)
  const popularSearches = [
    'Ayyappa',
    'Varahi',
    'Ganesha',
    'Vishnu',
    'Shiva',
    'Devi',
    'Hanuman',
    'Krishna',
  ];

  return (
    <div className="search-sidebar">
      {/* Search Summary */}
      {query && (
        <div className="mb-4 rounded bg-white p-3 shadow-sm">
          <h5 className="text-primary mb-2">Search Summary</h5>
          <div className="small text-muted">
            <div>
              <strong>Query:</strong> {query}
            </div>
            <div>
              <strong>Category:</strong> {category === 'All' ? 'All Categories' : category}
            </div>
            {totalResults !== undefined && (
              <div>
                <strong>Results:</strong> {totalResults} found
              </div>
            )}
          </div>
        </div>
      )}

      {/* Popular Searches */}
      <div className="mb-4 rounded bg-white p-3 shadow-sm">
        <h5 className="text-primary mb-3">Popular Searches</h5>
        <div className="popular-searches">
          {popularSearches.map((searchTerm, index) => (
            <Link
              key={index}
              href={`/search?keyword=${encodeURIComponent(searchTerm)}&category=All`}
              className="d-block text-decoration-none text-dark hover-bg-light small mb-1 rounded p-2"
            >
              <i className="fas fa-search text-muted me-2"></i>
              {searchTerm}
            </Link>
          ))}
        </div>
      </div>

      {/* Search Tips */}
      <div className="mb-4 rounded bg-white p-3 shadow-sm">
        <h5 className="text-primary mb-3">Search Tips</h5>
        <ul className="list-unstyled small">
          {searchTips.map((tip, index) => (
            <li key={index} className="d-flex align-items-start mb-2">
              <i className="fas fa-lightbulb text-warning me-2 mt-1"></i>
              <span>{tip}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default SearchSidebar;
