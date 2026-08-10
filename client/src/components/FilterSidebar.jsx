import { useState, useEffect } from 'react';
import { X, SlidersHorizontal, DollarSign, Star, MapPin, Clock } from 'lucide-react';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';

/**
 * Advanced FilterSidebar component with price range, rating, distance, and availability filters
 */
const FilterSidebar = ({
  filters,
  onFilterChange,
  onReset,
  categories = [],
  isOpen,
  onClose,
  className = '',
}) => {
  const [localFilters, setLocalFilters] = useState(filters);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);
  
  const handleLocalFilterChange = (key, value) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    onFilterChange(key, value);
  };
  
  const handlePriceRangeChange = (values) => {
    setLocalFilters(prev => ({
      ...prev,
      minPrice: values[0],
      maxPrice: values[1],
    }));
  };
  
  const handlePriceRangeAfterChange = (values) => {
    onFilterChange('minPrice', values[0]);
    onFilterChange('maxPrice', values[1]);
  };
  
  const handleDistanceChange = (value) => {
    setLocalFilters(prev => ({ ...prev, maxDistance: value }));
    onFilterChange('maxDistance', value);
  };
  
  const handleReset = () => {
    const resetFilters = {
      category: 'All',
      minPrice: 0,
      maxPrice: 100,
      minRating: 0,
      maxDistance: 50,
      availability: 'all',
      sortBy: 'distance',
    };
    setLocalFilters(resetFilters);
    onReset();
  };
  
  const priceRange = [
    localFilters.minPrice || 0,
    localFilters.maxPrice || 100
  ];
  
  const hasActiveFilters = 
    localFilters.category !== 'All' ||
    localFilters.minPrice > 0 ||
    localFilters.maxPrice < 100 ||
    localFilters.minRating > 0 ||
    (localFilters.maxDistance && localFilters.maxDistance < 50) ||
    localFilters.availability !== 'all';
  
  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div
        role="dialog"
        aria-label="Filter options"
        aria-modal={isOpen ? "true" : "false"}
        className={`fixed inset-y-0 left-0 z-50 w-80 transform overflow-y-auto bg-white shadow-xl transition-transform duration-300 lg:relative lg:z-0 lg:translate-x-0 lg:shadow-none dark:bg-slate-900 dark:border-r dark:border-slate-700 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } ${className}`}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-5 w-5 text-gray-600 dark:text-slate-400" />
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Filters</h2>
          </div>
          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <button
                onClick={handleReset}
                className="text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                Reset
              </button>
            )}
            <button
              onClick={onClose}
              className="rounded-lg p-1 transition hover:bg-gray-100 lg:hidden focus:ring-2 focus:ring-blue-500 focus:outline-none"
              aria-label="Close filters"
            >
              <X className="h-5 w-5 text-gray-600" />
            </button>
          </div>
        </div>
        
        <div className="space-y-6 p-4">
          {/* Category Filter */}
          <div>
            <label className="mb-3 flex items-center gap-2 text-sm font-bold text-gray-700">
              <span className="text-lg">🏷️</span>
              Category
            </label>
            <div className="space-y-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => handleLocalFilterChange('category', category)}
                  aria-pressed={localFilters.category === category}
                  className={`w-full rounded-lg border px-4 py-2.5 text-left text-sm font-medium transition focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                    localFilters.category === category
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
          
          {/* Price Range Filter */}
          <div>
            <div className="mb-3 flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-slate-200">
                <DollarSign className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                Hourly Rate Range
              </label>
              <span className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-0.5 rounded-full border border-blue-200 dark:border-blue-800">
                ${priceRange[0]} - ${priceRange[1]}/hr
              </span>
            </div>
            <div className="px-2 pt-2">
              <Slider
                range
                min={0}
                max={150}
                step={5}
                value={priceRange}
                onChange={handlePriceRangeChange}
                onAfterChange={handlePriceRangeAfterChange}
                trackStyle={[{ backgroundColor: '#3B82F6', height: 6 }]}
                handleStyle={[
                  { borderColor: '#3B82F6', backgroundColor: '#fff', opacity: 1, width: 18, height: 18, marginTop: -6, boxShadow: '0 2px 4px rgba(0,0,0,0.15)' },
                  { borderColor: '#3B82F6', backgroundColor: '#fff', opacity: 1, width: 18, height: 18, marginTop: -6, boxShadow: '0 2px 4px rgba(0,0,0,0.15)' },
                ]}
                railStyle={{ backgroundColor: '#E5E7EB', height: 6 }}
              />
              <div className="mt-4 flex items-center gap-2">
                <div className="flex-1">
                  <label className="text-[11px] font-semibold text-gray-500 dark:text-slate-400">Min ($/hr)</label>
                  <div className="relative mt-1">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-400">$</span>
                    <input
                      type="number"
                      min={0}
                      max={priceRange[1]}
                      value={localFilters.minPrice ?? 0}
                      onChange={(e) => {
                        const val = Math.max(0, Math.min(Number(e.target.value) || 0, priceRange[1]));
                        handlePriceRangeChange([val, priceRange[1]]);
                        handlePriceRangeAfterChange([val, priceRange[1]]);
                      }}
                      className="w-full rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 pl-6 pr-2 py-1.5 text-xs font-bold text-gray-800 dark:text-slate-200 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <span className="mt-5 text-xs text-gray-400 font-bold">-</span>
                <div className="flex-1">
                  <label className="text-[11px] font-semibold text-gray-500 dark:text-slate-400">Max ($/hr)</label>
                  <div className="relative mt-1">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-400">$</span>
                    <input
                      type="number"
                      min={priceRange[0]}
                      max={200}
                      value={localFilters.maxPrice ?? 100}
                      onChange={(e) => {
                        const val = Math.max(priceRange[0], Math.min(Number(e.target.value) || 100, 200));
                        handlePriceRangeChange([priceRange[0], val]);
                        handlePriceRangeAfterChange([priceRange[0], val]);
                      }}
                      className="w-full rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 pl-6 pr-2 py-1.5 text-xs font-bold text-gray-800 dark:text-slate-200 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Rating Filter */}
          <div>
            <label className="mb-3 flex items-center gap-2 text-sm font-bold text-gray-700">
              <Star className="h-4 w-4" />
              Minimum Rating
            </label>
            <div className="grid grid-cols-5 gap-2">
              {[0, 3, 3.5, 4, 4.5].map((rating) => (
                <button
                  key={rating}
                  onClick={() => handleLocalFilterChange('minRating', rating)}
                  aria-pressed={localFilters.minRating === rating}
                  className={`rounded-lg border px-3 py-2 text-sm font-medium transition focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                    localFilters.minRating === rating
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {rating === 0 ? 'Any' : `${rating}+`}
                </button>
              ))}
            </div>
          </div>
          
          {/* Distance Filter */}
          <div>
            <label className="mb-3 flex items-center gap-2 text-sm font-bold text-gray-700">
              <MapPin className="h-4 w-4" />
              Maximum Distance
            </label>
            <div className="px-2">
              <Slider
                min={1}
                max={50}
                value={localFilters.maxDistance || 50}
                onChange={handleDistanceChange}
                trackStyle={{ backgroundColor: '#3B82F6' }}
                handleStyle={{ borderColor: '#3B82F6', backgroundColor: '#fff' }}
                railStyle={{ backgroundColor: '#E5E7EB' }}
                marks={{
                  1: '1km',
                  10: '10km',
                  25: '25km',
                  50: '50km',
                }}
              />
              <div className="mt-6 text-center text-sm font-medium text-gray-700">
                Within {localFilters.maxDistance || 50} km
              </div>
            </div>
          </div>
          
          {/* Availability Filter */}
          <div>
            <label className="mb-3 flex items-center gap-2 text-sm font-bold text-gray-700">
              <Clock className="h-4 w-4" />
              Availability
            </label>
            <div className="space-y-2">
              {[
                { value: 'all', label: 'All Workers' },
                { value: 'available', label: 'Available Now' },
                { value: 'today', label: 'Available Today' },
                { value: 'week', label: 'This Week' },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleLocalFilterChange('availability', option.value)}
                  aria-pressed={localFilters.availability === option.value}
                  className={`w-full rounded-lg border px-4 py-2.5 text-left text-sm font-medium transition focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                    localFilters.availability === option.value
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
          
          {/* Sort By */}
          <div>
            <label className="mb-3 flex items-center gap-2 text-sm font-bold text-gray-700">
              <SlidersHorizontal className="h-4 w-4" />
              Sort By
            </label>
            <select
              value={localFilters.sortBy}
              onChange={(e) => handleLocalFilterChange('sortBy', e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="distance">📍 Nearest First</option>
              <option value="rating">⭐ Highest Rated</option>
              <option value="price">💰 Lowest Price</option>
              <option value="availability">🕐 Most Available</option>
            </select>
          </div>
          
          {/* Active Filters Summary */}
          {hasActiveFilters && (
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
              <div className="mb-2 text-sm font-bold text-blue-900">Active Filters:</div>
              <div className="space-y-1 text-xs text-blue-700">
                {localFilters.category !== 'All' && (
                  <div>• Category: {localFilters.category}</div>
                )}
                {(localFilters.minPrice > 0 || localFilters.maxPrice < 100) && (
                  <div>• Price: ${localFilters.minPrice} - ${localFilters.maxPrice}/hr</div>
                )}
                {localFilters.minRating > 0 && (
                  <div>• Rating: {localFilters.minRating}+ stars</div>
                )}
                {localFilters.maxDistance && localFilters.maxDistance < 50 && (
                  <div>• Distance: Within {localFilters.maxDistance} km</div>
                )}
                {localFilters.availability !== 'all' && (
                  <div>• Availability: {localFilters.availability}</div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default FilterSidebar;
