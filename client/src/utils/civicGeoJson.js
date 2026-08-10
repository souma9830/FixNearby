const getCoordinates = (issue) => {
  const coordinates = issue.location?.coordinates;
  const longitude = Number(coordinates?.[0] ?? issue.longitude);
  const latitude = Number(coordinates?.[1] ?? issue.latitude);

  if (!Number.isFinite(longitude) || !Number.isFinite(latitude)) return null;
  if (longitude < -180 || longitude > 180 || latitude < -90 || latitude > 90) return null;
  return [longitude, latitude];
};

export const createCivicIssuesGeoJson = (issues = []) => ({
  type: 'FeatureCollection',
  features: issues.flatMap((issue) => {
    const coordinates = getCoordinates(issue);
    if (!coordinates) return [];

    return [{
      type: 'Feature',
      id: issue._id || issue.id,
      geometry: { type: 'Point', coordinates },
      properties: {
        title: issue.title || 'Untitled issue',
        description: issue.description || '',
        category: issue.category || 'Other',
        status: issue.status || 'open',
        upvotes: Number(issue.upvotes) || 0,
        reportedAt: issue.reportedAt || issue.createdAt || null,
      },
    }];
  }),
});

export const downloadCivicIssuesGeoJson = (issues) => {
  const collection = createCivicIssuesGeoJson(issues);
  const blob = new Blob([JSON.stringify(collection, null, 2)], { type: 'application/geo+json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `fixnearby-civic-issues-${new Date().toISOString().slice(0, 10)}.geojson`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  return collection.features.length;
};
