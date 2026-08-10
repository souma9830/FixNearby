import api from "./apiClient";

export const getWorkersInBounds = async (bounds) => {
  const res = await api.get('/workers/map-bounds', {
    params: {
      north: bounds.north,
      south: bounds.south,
      east: bounds.east,
      west: bounds.west,
      ...bounds.filters
    }
  });
  return res.data;
};

export const getClusterData = async (bounds, zoom) => {
  const res = await api.get('/workers/clusters', {
    params: {
      north: bounds.north,
      south: bounds.south,
      east: bounds.east,
      west: bounds.west,
      zoom
    }
  });
  return res.data;
};
