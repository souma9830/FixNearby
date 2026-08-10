import { useState, useEffect, useRef } from 'react';
import { Search, X, Clock, Star, Trash2, Heart, Share2 } from 'lucide-react';

/**
 * Advanced SearchBar component with autocomplete, history, and favorites
 */
const SearchBar = ({
  value,
  onChange,
  onSearch,
  searchHistory = [],
  favoriteSearches = [],
  onRemoveHistory,
  onClearHistory,
  onLoadFavorite,
  onRemoveFavorite,
  onSaveFavorite,
  onShare,
  suggestions = [],
  placeholder = 'Search for services, workers, or categories...',
  className = '',
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeTab, setActiveTab] = useState('suggestions'); // suggestions, history, favorites
  const [saveFavoriteName, setSaveFavoriteName] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  
  const searchRef = useRef(null);
  const dropdownRef = useRef(null);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setShowDropdown(false);
        setIsFocused(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  // Show dropdown when focused and there's content to show
  useEffect(() => {
    if (isFocused) {
      const hasContent =
        (activeTab === 'suggestions' && (suggestions.length > 0 || value.length > 0)) ||
        (activeTab === 'history' && searchHistory.length > 0) ||
        (activeTab === 'favorites' && favoriteSearches.length > 0);
      
      setShowDropdown(hasContent);
    }
  }, [isFocused, activeTab, suggestions, searchHistory, favoriteSearches, value]);
  
  const handleInputChange = (e) => {
    onChange(e.target.value);
    setActiveTab('suggestions');
  };
  
  const handleClear = () => {
    onChange('');
    searchRef.current?.focus();
  };
  
  const handleSelectSuggestion = (suggestion) => {
    onChange(suggestion);
    setShowDropdown(false);
    if (onSearch) onSearch(suggestion);
  };
  
  const handleSelectHistory = (historyItem) => {
    onChange(historyItem.query);
    setShowDropdown(false);
    if (onSearch) onSearch(historyItem.query);
  };
  
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      setShowDropdown(false);
      if (onSearch) onSearch(value);
    } else if (e.key === 'Escape') {
      setShowDropdown(false);
      setIsFocused(false);
    }
  };
  
  const handleSaveFavorite = () => {
    if (saveFavoriteName.trim() && onSaveFavorite) {
      onSaveFavorite(saveFavoriteName.trim());
      setSaveFavoriteName('');
      setShowSaveDialog(false);
    }
  };
  
  // Filter suggestions based on input
  const filteredSuggestions = suggestions.filter(suggestion =>
    suggestion.toLowerCase().includes(value.toLowerCase())
  ).slice(0, 5);
  
  return (
    <div className={`relative ${className}`} ref={searchRef}>
      {/* Search Input */}
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        
        <input
          type="text"
          value={value}
          onChange={handleInputChange}
          onFocus={() => {
            setIsFocused(true);
            setShowDropdown(true);
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full rounded-xl border border-gray-300 py-3 pl-12 pr-24 shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        
        <div className="absolute inset-y-0 right-0 flex items-center gap-1 pr-2">
          {value && (
            <button
              onClick={handleClear}
              className="rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          
          {value && onSaveFavorite && (
            <button
              onClick={() => setShowSaveDialog(true)}
              className="rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-red-500"
              aria-label="Save search"
              title="Save this search"
            >
              <Heart className="h-4 w-4" />
            </button>
          )}
          
          {value && onShare && (
            <button
              onClick={onShare}
              className="rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-blue-500"
              aria-label="Share search"
              title="Share search URL"
            >
              <Share2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
      
      {/* Dropdown */}
      {showDropdown && (
        <div
          ref={dropdownRef}
          className="absolute z-50 mt-2 w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg"
        >
          {/* Tabs */}
          <div className="flex border-b border-gray-200 bg-gray-50">
            <button
              onClick={() => setActiveTab('suggestions')}
              className={`flex-1 px-4 py-2 text-sm font-medium transition ${
                activeTab === 'suggestions'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Suggestions
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex-1 px-4 py-2 text-sm font-medium transition ${
                activeTab === 'history'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              History ({searchHistory.length})
            </button>
            <button
              onClick={() => setActiveTab('favorites')}
              className={`flex-1 px-4 py-2 text-sm font-medium transition ${
                activeTab === 'favorites'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Favorites ({favoriteSearches.length})
            </button>
          </div>
          
          {/* Content */}
          <div className="max-h-80 overflow-y-auto">
            {/* Suggestions Tab */}
            {activeTab === 'suggestions' && (
              <div className="py-2">
                {filteredSuggestions.length > 0 ? (
                  filteredSuggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSelectSuggestion(suggestion)}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition hover:bg-gray-50"
                    >
                      <Search className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-700">{suggestion}</span>
                    </button>
                  ))
                ) : (
                  <div className="px-4 py-8 text-center text-sm text-gray-500">
                    {value ? 'No suggestions found' : 'Start typing to see suggestions'}
                  </div>
                )}
              </div>
            )}
            
            {/* History Tab */}
            {activeTab === 'history' && (
              <div className="py-2">
                {searchHistory.length > 0 ? (
                  <>
                    <div className="flex items-center justify-between px-4 py-2">
                      <span className="text-xs font-medium text-gray-500">Recent Searches</span>
                      {onClearHistory && (
                        <button
                          onClick={onClearHistory}
                          className="text-xs text-red-600 hover:text-red-700"
                        >
                          Clear All
                        </button>
                      )}
                    </div>
                    {searchHistory.map((item, index) => (
                      <div
                        key={index}
                        className="group flex items-center justify-between px-4 py-2.5 transition hover:bg-gray-50"
                      >
                        <button
                          onClick={() => handleSelectHistory(item)}
                          className="flex flex-1 items-center gap-3 text-left"
                        >
                          <Clock className="h-4 w-4 text-gray-400" />
                          <div className="flex-1">
                            <div className="text-sm text-gray-700">{item.query}</div>
                            {item.filters && Object.keys(item.filters).length > 0 && (
                              <div className="text-xs text-gray-500">
                                {item.filters.category !== 'All' && `Category: ${item.filters.category}`}
                              </div>
                            )}
                          </div>
                        </button>
                        {onRemoveHistory && (
                          <button
                            onClick={() => onRemoveHistory(item.timestamp)}
                            className="opacity-0 transition group-hover:opacity-100"
                          >
                            <Trash2 className="h-4 w-4 text-gray-400 hover:text-red-500" />
                          </button>
                        )}
                      </div>
                    ))}
                  </>
                ) : (
                  <div className="px-4 py-8 text-center text-sm text-gray-500">
                    No search history yet
                  </div>
                )}
              </div>
            )}
            
            {/* Favorites Tab */}
            {activeTab === 'favorites' && (
              <div className="py-2">
                {favoriteSearches.length > 0 ? (
                  favoriteSearches.map((favorite) => (
                    <div
                      key={favorite.id}
                      className="group flex items-center justify-between px-4 py-2.5 transition hover:bg-gray-50"
                    >
                      <button
                        onClick={() => onLoadFavorite && onLoadFavorite(favorite)}
                        className="flex flex-1 items-center gap-3 text-left"
                      >
                        <Star className="h-4 w-4 text-yellow-500" />
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-700">{favorite.name}</div>
                          <div className="text-xs text-gray-500">{favorite.query}</div>
                        </div>
                      </button>
                      <button
                        onClick={() => onRemoveFavorite && onRemoveFavorite(favorite.id)}
                        className="opacity-0 transition group-hover:opacity-100"
                      >
                        <Trash2 className="h-4 w-4 text-gray-400 hover:text-red-500" />
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-8 text-center text-sm text-gray-500">
                    No favorite searches yet
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Save Favorite Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h3 className="mb-4 text-lg font-bold text-gray-900">Save Search</h3>
            <input
              type="text"
              value={saveFavoriteName}
              onChange={(e) => setSaveFavoriteName(e.target.value)}
              placeholder="Enter a name for this search..."
              className="mb-4 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowSaveDialog(false);
                  setSaveFavoriteName('');
                }}
                className="flex-1 rounded-lg border border-gray-300 px-4 py-2 font-medium text-gray-700 transition hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveFavorite}
                disabled={!saveFavoriteName.trim()}
                className="flex-1 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchBar;
