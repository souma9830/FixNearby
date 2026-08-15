import  { useState } from 'react';

const REASONS = [
  { value: 'inappropriate_content', label: 'Inappropriate Content' },
  { value: 'fraud', label: 'Fraud' },
  { value: 'spam', label: 'Spam' },
  { value: 'harassment', label: 'Harassment' },
  { value: 'other', label: 'Other' }
];

export default function ReportModal({ targetType, targetId, isOpen, onClose, onSubmitted }) {
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!reason) {
      setError('Please select a reason.');
      return;
    }
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetType, targetId, reason, details }),
        credentials: 'include'
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Failed to submit report.');
        return;
      }

      if (onSubmitted) onSubmitted(data.report);
      onClose();
    } catch (err) {
      setError('Network error while submitting report.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="report-modal-overlay" role="dialog" aria-modal="true">
      <div className="report-modal">
        <h2>Report {targetType === 'worker' ? 'Profile' : 'Review'}</h2>

        <fieldset className="report-reason-group">
          <legend>Reason</legend>
          {REASONS.map(r => (
            <label key={r.value} className="report-reason-option">
              <input
                type="radio"
                name="report-reason"
                value={r.value}
                checked={reason === r.value}
                onChange={() => setReason(r.value)}
              />
              {r.label}
            </label>
          ))}
        </fieldset>

        <label className="report-details-label">
          Additional details (optional)
          <textarea
            className="report-details-input"
            maxLength={1000}
            value={details}
            onChange={e => setDetails(e.target.value)}
            rows={4}
          />
        </label>

        {error && <p className="report-error">{error}</p>}

        <div className="report-modal-actions">
          <button type="button" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </button>
          <button type="button" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Submit Report'}
          </button>
        </div>
      </div>
    </div>
  );
}