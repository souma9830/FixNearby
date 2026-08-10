import React, { useState } from 'react';

const DisputeEscalationCard = ({ dispute, onStatusUpdate }) => {
  const [notes, setNotes] = useState(dispute.resolutionNotes || '');
  const [updating, setUpdating] = useState(false);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'under_review':
        return 'bg-blue-100 text-blue-800';
      case 'resolved_refunded':
        return 'bg-green-100 text-green-800';
      case 'resolved_dismissed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-red-100 text-red-800';
    }
  };

  return (
    <div className="p-4 border rounded-lg shadow-sm bg-white dark:bg-gray-800 mb-4">
      <div className="flex justify-between items-center mb-2">
        <h4 className="font-semibold text-lg text-gray-900 dark:text-gray-100">
          Dispute #{dispute._id.substring(0, 8)}
        </h4>
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(dispute.status)}`}>
          {dispute.status.replace('_', ' ').toUpperCase()}
        </span>
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
        <strong>Reason:</strong> {dispute.reasonCategory} | <strong>Claim Amount:</strong> ${dispute.claimAmount}
      </p>
      {dispute.evidenceUrls && dispute.evidenceUrls.length > 0 && (
        <div className="flex gap-2 my-2">
          {dispute.evidenceUrls.map((url, idx) => (
            <a key={idx} href={url} target="_blank" rel="noreferrer" className="text-xs text-indigo-600 hover:underline">
              Evidence {idx + 1}
            </a>
          ))}
        </div>
      )}
      <div className="mt-3 pt-3 border-t text-sm">
        <p className="text-gray-500 mb-1">Resolution Notes:</p>
        <p className="italic text-gray-700 dark:text-gray-300">{dispute.resolutionNotes || 'No notes provided yet.'}</p>
      </div>
    </div>
  );
};

export default DisputeEscalationCard;
