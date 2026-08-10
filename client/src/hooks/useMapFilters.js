import { useState, useCallback, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

const defaultFilters = {
  category: '',
  availabilityStatus: '',
  minRating: 0,
  maxPrice: 100,
};

const useMapFilters = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState(() => {
    return {
      category: searchParams.get('category') || defaultFilters.category,
      availabilityStatus: searchParams.get('availability') || defaultFilters.availabilityStatus,
      minRating: parseFloat(searchParams.get('minRating')) || defaultFilters.minRating,
      maxPrice: parseFloat(searchParams.get('maxPrice')) || defaultFilters.maxPrice,
    };
  });

  useEffect(() => {
    const params = {};
    if (filters.category) params.category = filters.category;
    if (filters.availabilityStatus) params.availability = filters.availabilityStatus;
    if (filters.minRating > 0) params.minRating = filters.minRating;
    if (filters.maxPrice < 100) params.maxPrice = filters.maxPrice;
    setSearchParams(params, { replace: true });
  }, [filters, setSearchParams]);

  const setFilter = useCallback((key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({ ...defaultFilters });
  }, []);

  const activeCount = Object.entries(filters).reduce((count, [key, val]) => {
    if (val && val !== defaultFilters[key]) return count + 1;
    return count;
  }, 0);

  return { filters, setFilter, clearFilters, activeCount };
};

export default useMapFilters;
