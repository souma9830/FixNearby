const displayValue = (value, fallback = 'N/A') => {
  if (value === null || value === undefined || value === '') return fallback;
  return value;
};

export const buildWorkerComparisonRows = (workers = []) => workers.map((worker) => ({
  Name: displayValue(worker.name),
  Category: displayValue(worker.category || worker.profession),
  'Hourly rate': displayValue(worker.price ?? worker.hourlyRate),
  Rating: displayValue(worker.averageRating ?? worker.rating),
  Experience: displayValue(worker.experience),
  Location: displayValue(worker.location?.city || worker.location?.address),
  Availability: displayValue(worker.availabilityStatus || worker.availability),
  Verified: worker.verified || worker.isVerified ? 'Yes' : 'No',
  'Completed jobs': Number(worker.completedJobs) || 0,
  'Response time': displayValue(worker.slaResponseMins ? `${worker.slaResponseMins} min` : worker.responseTime),
}));

export default buildWorkerComparisonRows;
