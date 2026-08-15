import  { useState } from 'react';
import ReportModal from './ReportModal';

export default function ReportFlagButton({ targetType, targetId }) {
  const [isOpen, setIsOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  return (
    <>
      <button
        type="button"
        className="report-flag-btn"
        aria-label={`Report this ${targetType}`}
        title={submitted ? 'Reported' : `Report this ${targetType}`}
        onClick={() => setIsOpen(true)}
        disabled={submitted}
      >
        {submitted ? '✓ Reported' : '⚑'}
      </button>

      <ReportModal
        targetType={targetType}
        targetId={targetId}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSubmitted={() => setSubmitted(true)}
      />
    </>
  );
}