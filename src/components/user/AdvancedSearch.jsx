import React, { useState, useEffect, useRef } from 'react';
import { Search } from 'lucide-react';
import debounce from 'lodash/debounce';
import axios from 'axios';
import './AdvancedSearch.css'

const AdvancedSearch = ({ onSearch }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const debouncedSearch = debounce(async (searchQuery) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      // Updated API endpoint
      const response = await axios.get('http://localhost:5000/api/auth/search', {
        params: { q: searchQuery },
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      console.log('Search response:', response.data);
      setResults(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, 300);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    setShowResults(true);
    debouncedSearch(value);
  };

  const handleResultClick = (item) => {
    setQuery(item.name);
    setShowResults(false);
    onSearch(item);
  };

  return (
    <div ref={searchRef} className="search-container">
      <div className="search-input-container">
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          placeholder="Search for products, brands and more"
          className="search-input"
        />
        <Search className="search-icon" />
      </div>

      {showResults && (query || isLoading) && (
        <div className="search-results">
          {isLoading ? (
            <div className="loading-message">Loading...</div>
          ) : results.length > 0 ? (
            <ul>
              {results.map((item) => (
                <li
                  key={item._id}
                  onClick={() => handleResultClick(item)}
                  className="search-result-item"
                >
                  {item.thumbnail && (
                    <img
                      src={item.thumbnail}
                      alt={item.name}
                      className="result-thumbnail"
                    />
                  )}
                  <div className="result-details">
                    <div className="result-name">{item.name}</div>
                    {item.category && (
                      <div className="result-category">{item.category}</div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="no-results-message">
              No results found
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdvancedSearch;