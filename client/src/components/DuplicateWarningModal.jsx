import { AlertTriangle, MapPin, ThumbsUp, X } from 'lucide-react';
import { formatDistance } from '../utils/distance';

/**
 * Modal component for duplicate issue warning
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether modal is visible
 * @param {Function} props.onClose - Callback to close modal
 * @param {Object} props.duplicateIssue - The existing duplicate issue
 * @param {Function} props.onUpvote - Callback when user chooses to upvote
 * @param {Function} props.onSubmitAnyway - Callback when user chooses to submit anyway
 * @param {boolean} props.isLoading - Loading state during API calls
 */
const DuplicateWarningModal = ({
  isOpen,
  onClose,
  duplicateIssue,
  onUpvote,
  candidateList,
  onSubmitAnyway,
  isLoading = false
}) => {
  if (!isOpen || (!duplicateIssue && (!candidateList || candidateList.length === 0))) return null;

  const formatIssueDistance = (issue) => {
    const d = issue.distance != null ? issue.distance : (issue.distanceKm ? issue.distanceKm * 1000 : null);
    return d != null ? formatDistance(d / 1000) : 'unknown';
  };

  const formattedDistance = duplicateIssue ? formatIssueDistance(duplicateIssue) : '';

  const getStatusColor = (status) => {
    switch (status) {
      case 'open':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'resolved':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'closed':
        return 'bg-gray-100 text-gray-700 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden">
        {/* Top accent bar */}
        <div className="h-1.5 bg-gradient-to-r from-amber-400 via-orange-500 to-red-500" />

        <div className="p-6">
          {/* Warning Icon */}
          <div className="text-center mb-4">
            <div className="mx-auto w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-amber-600" />
            </div>
          </div>

          <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">
            Similar Issue Found Nearby
          </h2>

          <p className="text-center text-gray-600 text-sm mb-4">
            We found an existing report that might be the same issue. Consider upvoting it instead of creating a duplicate.
          </p>

          {/* Distance Badge */}
          {formattedDistance && (
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="flex items-center gap-1.5 bg-blue-50 border border-blue-200 rounded-full px-4 py-1.5 shadow-sm">
                <MapPin size={14} className="text-blue-600" />
                <span className="text-sm font-semibold text-blue-700">
                  {formattedDistance} away
                </span>
              </div>
            </div>
          )}

          {/* Duplicate Issue Details (single or list) */}
          {candidateList && candidateList.length > 0 ? (
            <div className="space-y-3 mb-4">
              {candidateList.map((issue) => (
                <div key={issue.id} className="border rounded-xl p-4 bg-gray-50 flex gap-4">
                  {issue.thumbnailUrl && (
                    <img src={issue.thumbnailUrl} alt={issue.title} className="w-28 h-20 object-cover rounded-lg" />
                  )}
                  <div className="flex-1">
                    <div className="mb-1 flex items-start justify-between">
                      <div>
                        <h3 className="font-bold text-gray-800 text-sm mb-0.5">{issue.title}</h3>
                        <span className="inline-block text-xs font-medium bg-blue-100 text-blue-700 px-2 py-1 rounded">
                          {issue.category}
                        </span>
                      </div>
                      <div className="text-right text-xs text-gray-500">{formatIssueDistance(issue)}</div>
                    </div>
                    <p className="text-gray-600 text-sm line-clamp-2 mb-2">{issue.description}</p>
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${getStatusColor(issue.status)}`}>
                        {issue.status ? issue.status.charAt(0).toUpperCase() + issue.status.slice(1).replace('-', ' ') : 'Unknown'}
                      </span>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 text-gray-600">
                          <ThumbsUp size={14} />
                          <span className="text-sm font-semibold">{issue.upvotes || 0}</span>
                        </div>
                        <button
                          onClick={() => onUpvote && onUpvote(issue.id)}
                          className="inline-flex items-center gap-1 rounded-md bg-blue-600 px-3 py-1 text-white text-xs font-semibold"
                        >
                          Upvote
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="border rounded-xl p-4 mb-4 bg-gray-50">
              {/* Thumbnail Image */}
              {duplicateIssue.thumbnailUrl && (
                <div className="mb-3">
                  <img
                    src={duplicateIssue.thumbnailUrl}
                    alt={duplicateIssue.title}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                </div>
              )}

              {/* Title and Category */}
              <div className="mb-2">
                <h3 className="font-bold text-gray-800 text-lg mb-1">
                  {duplicateIssue.title}
                </h3>
                <span className="inline-block text-xs font-medium bg-blue-100 text-blue-700 px-2 py-1 rounded">
                  {duplicateIssue.category}
                </span>
              </div>

              {/* Description */}
              <p className="text-gray-600 text-sm mb-3 line-clamp-3">
                {duplicateIssue.description}
              </p>

              {/* Status and Upvotes */}
              <div className="flex items-center justify-between">
                <span
                  className={`text-xs font-semibold px-3 py-1 rounded-full border ${getStatusColor(
                    duplicateIssue.status
                  )}`}
                >
                  {duplicateIssue.status ? duplicateIssue.status.charAt(0).toUpperCase() +
                    duplicateIssue.status.slice(1).replace('-', ' ') : 'Unknown'}
                </span>
                <div className="flex items-center gap-1.5 text-gray-600">
                  <ThumbsUp size={16} />
                  <span className="text-sm font-semibold">
                    {duplicateIssue.upvotes || 0} {duplicateIssue.upvotes === 1 ? 'upvote' : 'upvotes'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={() => onUpvote && onUpvote()}
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 transition font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Upvote existing issue"
            >
              <ThumbsUp size={18} />
              {isLoading ? 'Processing...' : 'Upvote This Issue'}
            </button>

            <button
              onClick={onSubmitAnyway}
              disabled={isLoading}
              className="w-full bg-gray-600 text-white py-3 rounded-xl hover:bg-gray-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Submit new issue anyway"
            >
              {isLoading ? 'Processing...' : 'Submit Anyway (Different Issue)'}
            </button>

            <button
              onClick={onClose}
              disabled={isLoading}
              className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl hover:bg-gray-200 transition font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Cancel and return to form"
            >
              <X size={18} />
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DuplicateWarningModal;
