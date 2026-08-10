import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getWorkersByIds } from '../services/workerService';

const MAX_WORKERS = 3;

const useWorkerComparison = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getIdsFromParams = useCallback(() => {
    const idsParam = searchParams.get('ids');
    if (!idsParam) return [];
    return idsParam.split(',').filter(Boolean);
  }, [searchParams]);

  const updateUrlParams = useCallback((newIds) => {
    if (newIds.length === 0) {
      searchParams.delete('ids');
    } else {
      searchParams.set('ids', newIds.join(','));
    }
    setSearchParams(searchParams, { replace: true });
  }, [searchParams, setSearchParams]);

  const fetchWorkers = useCallback(async (ids) => {
    if (ids.length === 0) {
      setWorkers([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await getWorkersByIds(ids);
      setWorkers(response.workers || []);
    } catch (err) {
      console.error('Failed to fetch workers for comparison:', err);
      setError(err.message || 'Failed to load workers');
      setWorkers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const ids = getIdsFromParams();
    fetchWorkers(ids);
  }, [searchParams, fetchWorkers, getIdsFromParams]);

  const addWorker = useCallback((id) => {
    const currentIds = getIdsFromParams();
    if (currentIds.length >= MAX_WORKERS) return false;
    if (currentIds.includes(id)) return false;
    const newIds = [...currentIds, id];
    updateUrlParams(newIds);
    return true;
  }, [getIdsFromParams, updateUrlParams]);

  const removeWorker = useCallback((id) => {
    const currentIds = getIdsFromParams();
    const newIds = currentIds.filter(workerId => workerId !== id);
    updateUrlParams(newIds);
  }, [getIdsFromParams, updateUrlParams]);

  const clearAll = useCallback(() => {
    updateUrlParams([]);
  }, [updateUrlParams]);

  return {
    workers,
    loading,
    error,
    addWorker,
    removeWorker,
    clearAll,
  };
};

export default useWorkerComparison;
