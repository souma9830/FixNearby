const escapeVCardText = (value = '') => String(value)
  .replace(/\\/g, '\\\\')
  .replace(/\r?\n/g, '\\n')
  .replace(/,/g, '\\,')
  .replace(/;/g, '\\;');

const formatLocation = (location) => {
  if (typeof location === 'string') return location;
  if (!location || typeof location !== 'object') return '';
  return [location.address, location.city, location.state, location.country]
    .filter(Boolean)
    .join(', ');
};

export const createWorkerVCard = (worker, profileUrl) => {
  if (!worker?.name) throw new TypeError('Worker name is required');
  const profession = worker.profession || worker.category || 'Service Professional';
  const location = formatLocation(worker.location);
  const rating = Number(worker.rating ?? worker.averageRating);
  const note = [
    `FixNearby ${profession}`,
    Number.isFinite(rating) ? `Rating: ${rating}/5` : null,
    worker.verificationStatus === 'verified' || worker.verified ? 'Verified professional' : null,
  ].filter(Boolean).join('. ');

  return [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `FN:${escapeVCardText(worker.name)}`,
    'ORG:FixNearby',
    `TITLE:${escapeVCardText(profession)}`,
    location ? `ADR:;;${escapeVCardText(location)};;;;` : null,
    profileUrl ? `URL:${profileUrl}` : null,
    `NOTE:${escapeVCardText(note)}`,
    'END:VCARD',
    '',
  ].filter((line) => line !== null).join('\r\n');
};

export const downloadWorkerVCard = (worker, profileUrl) => {
  const content = createWorkerVCard(worker, profileUrl);
  const blob = new Blob([content], { type: 'text/vcard;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const slug = worker.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  link.href = url;
  link.download = `fixnearby-${slug || 'professional'}.vcf`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};
