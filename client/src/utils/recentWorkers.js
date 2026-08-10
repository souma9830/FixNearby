export const RECENT_WORKERS_KEY = 'fixnearby_recent_workers';
export const MAX_RECENT_WORKERS = 6;

const getId = (worker) => worker?._id || worker?.id;

const toSnapshot = (worker) => ({
  id: getId(worker),
  name: worker.name || 'Service Professional',
  profession: worker.profession || worker.category || 'General',
  rating: Number(worker.rating ?? worker.averageRating) || 0,
  price: worker.price ?? worker.hourlyRate ?? null,
  viewedAt: new Date().toISOString(),
});

export const getRecentWorkers = (storage = globalThis.localStorage) => {
  if (!storage) return [];
  try {
    const value = JSON.parse(storage.getItem(RECENT_WORKERS_KEY) || '[]');
    return Array.isArray(value) ? value.filter(getId).slice(0, MAX_RECENT_WORKERS) : [];
  } catch {
    storage.removeItem(RECENT_WORKERS_KEY);
    return [];
  }
};

export const addRecentWorker = (worker, storage = globalThis.localStorage) => {
  const id = getId(worker);
  if (!id || !storage) return getRecentWorkers(storage);
  const next = [
    toSnapshot(worker),
    ...getRecentWorkers(storage).filter((item) => getId(item) !== id),
  ].slice(0, MAX_RECENT_WORKERS);
  storage.setItem(RECENT_WORKERS_KEY, JSON.stringify(next));
  return next;
};

export const removeRecentWorker = (workerId, storage = globalThis.localStorage) => {
  if (!storage) return [];
  const next = getRecentWorkers(storage).filter((worker) => getId(worker) !== workerId);
  storage.setItem(RECENT_WORKERS_KEY, JSON.stringify(next));
  return next;
};

export const clearRecentWorkers = (storage = globalThis.localStorage) => {
  storage?.removeItem(RECENT_WORKERS_KEY);
  return [];
};
