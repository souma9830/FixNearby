import { useState, useEffect } from 'react';
import { MapPin, Upload, AlertCircle, Loader2 } from 'lucide-react';
import useGeolocation from '../hooks/useGeolocation';
import useToast from '../hooks/useToast';
import { checkForDuplicates, getNearbyCandidates } from '../services/duplicateDetectionService';
import { createIssue, upvoteIssue } from '../services/issueService';
import { setIssuesCache } from '../services/issuesCache';
import DuplicateWarningModal from './DuplicateWarningModal';
import ImageUpload from './ImageUpload';
import { compressImage } from '../utils/imageCompressor';

const ISSUE_CATEGORIES = [
  'Traffic Light',
  'Pothole',
  'Street Light',
  'Sidewalk',
  'Drainage',
  'Graffiti',
  'Litter',
  'Other'
];

/**
 * Form component for submitting community issues with duplicate detection
 * @param {Object} props
 * @param {Function} props.onSubmitSuccess - Callback after successful submission
 */
const IssueSubmissionForm = ({ onSubmitSuccess }) => {
  const { coords, loading: geoLoading, error: geoError, retry: retryGeo } = useGeolocation();
  const { showToast } = useToast();

  // Form state
  const [formData, setFormData] = useState({
    category: '',
    title: '',
    description: '',
    latitude: null,
    longitude: null,
    imageFile: null
  });

  // UI state
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [candidateList, setCandidateList] = useState(null);
  const [radiusMeters, setRadiusMeters] = useState(50);
  const [advancedMode, setAdvancedMode] = useState(false);
  const [duplicateIssue, setDuplicateIssue] = useState(null);
  const [errors, setErrors] = useState({});

  // Update coordinates when geolocation is available
  useEffect(() => {
    if (coords) {
      setFormData((prev) => ({
        ...prev,
        latitude: coords.latitude,
        longitude: coords.longitude
      }));
    }
  }, [coords]);

  // Populate client-side cache conservatively when location becomes available
  useEffect(() => {
    let mounted = true;
    const populate = async () => {
      if (!formData.latitude || !formData.longitude) return;
      try {
        const allResults = [];
        // conservative radius 2km to limit requests
        const radius = 2000;
        for (const cat of ISSUE_CATEGORIES) {
          try {
            const list = await getNearbyCandidates(
              { latitude: formData.latitude, longitude: formData.longitude, category: cat },
              radius
            );
            if (Array.isArray(list) && list.length > 0) allResults.push(...list);
          } catch (e) {
            // ignore per-category failures
          }
        }

        if (!mounted) return;

        // Deduplicate by id
        const byId = new Map();
        for (const it of allResults) {
          if (it && it.id && !byId.has(it.id)) byId.set(it.id, it);
        }
        if (byId.size > 0) setIssuesCache(Array.from(byId.values()));
      } catch (err) {
        // silent
      }
    };

    populate();
    return () => { mounted = false; };
  }, [formData.latitude, formData.longitude]);

  // Debounced live duplicate check when location or category changes
  useEffect(() => {
    let mounted = true;
    if (!formData.latitude || !formData.longitude || !formData.category) return;

    const handler = setTimeout(async () => {
      try {
        const res = await checkForDuplicates(
          {
            latitude: formData.latitude,
            longitude: formData.longitude,
            category: formData.category
          },
          radiusMeters
        );

        if (!mounted) return;

        if (res.isDuplicate) {
          setDuplicateIssue({ ...res.duplicateIssue, distance: res.distance });
          setCandidateList(null);
          setShowDuplicateModal(true);
        }
      } catch (err) {
        // silent fail
      }
    }, 700);

    return () => {
      mounted = false;
      clearTimeout(handler);
    };
  }, [formData.latitude, formData.longitude, formData.category, radiusMeters]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle image change
  // Handle image change with client-side compression
  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        showToast('Please upload a valid image file', 'error');
        return;
      }

      try {
        const compressedResult = await compressImage(file, { maxWidth: 1920, maxHeight: 1920, quality: 0.8 });
        setFormData((prev) => ({ ...prev, imageFile: compressedResult.file }));
        setImagePreview(URL.createObjectURL(compressedResult.file));
        if (compressedResult.compressed) {
          showToast(`Image compressed from ${(compressedResult.originalSize / 1024 / 1024).toFixed(1)}MB to ${(compressedResult.compressedSize / 1024).toFixed(0)}KB for 3G upload`, 'success');
        }
      } catch (err) {
        setFormData((prev) => ({ ...prev, imageFile: file }));
        setImagePreview(URL.createObjectURL(file));
      }
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.category) {
      newErrors.category = 'Please select a category';
    }

    if (!formData.title || formData.title.length < 5) {
      newErrors.title = 'Title must be at least 5 characters';
    } else if (formData.title.length > 200) {
      newErrors.title = 'Title must be less than 200 characters';
    }

    if (!formData.description || formData.description.length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    } else if (formData.description.length > 2000) {
      newErrors.description = 'Description must be less than 2000 characters';
    }

    if (!formData.latitude || !formData.longitude) {
      newErrors.location = 'Location is required. Please enable location services.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Upvote a specific issue id (used by candidate list)
  const handleUpvoteById = async (issueId) => {
    if (!issueId) return;
    try {
      setIsSubmitting(true);
      const response = await upvoteIssue(issueId);
      showToast('Upvoted!', 'success');
      setShowDuplicateModal(false);
      setDuplicateIssue(null);
      setCandidateList(null);
      resetForm();
    } catch (error) {
      showToast(error.message || 'Failed to upvote issue.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Advanced: fetch candidate list on demand
  const showNearbyCandidates = async () => {
    if (!formData.latitude || !formData.longitude || !formData.category) return;
    try {
      setIsSubmitting(true);
      const candidates = await getNearbyCandidates(
        {
          latitude: formData.latitude,
          longitude: formData.longitude,
          category: formData.category
        },
        radiusMeters
      );
      setCandidateList(candidates.map((c) => ({ ...c, distance: c.distance || null })));
      setDuplicateIssue(null);
      setShowDuplicateModal(true);
    } catch (err) {
      showToast('Failed to load nearby reports.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit new issue (bypassing duplicate check)
  const submitNewIssue = async () => {
    try {
      setIsSubmitting(true);
      const newIssue = await createIssue(formData);

      showToast('Issue reported successfully!', 'success');

      // Reset form
      resetForm();

      // Call success callback
      if (onSubmitSuccess) {
        onSubmitSuccess(newIssue);
      }
    } catch (error) {
      showToast(error.message || 'Failed to submit issue. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    if (!validateForm()) {
      showToast('Please fix the errors in the form', 'error');
      return;
    }

    try {
      setIsSubmitting(true);

      // Check for duplicates
      const duplicateCheck = await checkForDuplicates(
        {
          latitude: formData.latitude,
          longitude: formData.longitude,
          category: formData.category
        },
        50 // 50 meters radius
      );

      if (duplicateCheck.isDuplicate) {
        // Show duplicate warning modal
        setDuplicateIssue({
          ...duplicateCheck.duplicateIssue,
          distance: duplicateCheck.distance
        });
        setShowDuplicateModal(true);
        setIsSubmitting(false);
      } else {
        // No duplicate found, proceed with submission
        await submitNewIssue();
      }
    } catch (error) {
      showToast('Failed to check for duplicates. Please try again.', 'error');
      setIsSubmitting(false);
    }
  };

  // Handle upvote action from modal
  const handleUpvote = async () => {
    if (!duplicateIssue) return;

    try {
      setIsSubmitting(true);
      const response = await upvoteIssue(duplicateIssue.id);

      showToast(`Upvoted! Total upvotes: ${response.newUpvoteCount || response.upvotes || duplicateIssue.upvotes + 1}`, 'success');

      // Close modal and reset form
      setShowDuplicateModal(false);
      setDuplicateIssue(null);
      resetForm();
    } catch (error) {
      showToast(error.message || 'Failed to upvote issue. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle submit anyway action from modal
  const handleSubmitAnyway = async () => {
    setShowDuplicateModal(false);
    await submitNewIssue();
    setDuplicateIssue(null);
  };

  // Handle cancel action from modal
  const handleCancelModal = () => {
    setShowDuplicateModal(false);
    setDuplicateIssue(null);
    setIsSubmitting(false);
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      category: '',
      title: '',
      description: '',
      latitude: coords?.latitude || null,
      longitude: coords?.longitude || null,
      imageFile: null
    });
    setImagePreview(null);
    setErrors({});
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-6 space-y-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Report a Community Issue</h2>

        {/* Location Status */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <MapPin className="text-blue-600 mt-0.5" size={20} />
            <div className="flex-1">
              <h3 className="font-semibold text-blue-900 mb-1">Location</h3>
              {geoLoading && (
                <p className="text-sm text-blue-700 flex items-center gap-2">
                  <Loader2 className="animate-spin" size={16} />
                  Detecting your location...
                </p>
              )}
              {geoError && (
                <div>
                  <p className="text-sm text-red-600 mb-2">{geoError}</p>
                  <button
                     type="button"
                     onClick={retryGeo}
                     className="text-sm text-blue-600 hover:text-blue-700 font-semibold"
                  >
                    Retry
                  </button>
                </div>
              )}
              {coords && !geoLoading && (
                <p className="text-sm text-blue-700">
                  Location detected: {coords.latitude.toFixed(6)}, {coords.longitude.toFixed(6)}
                </p>
              )}
            </div>
          </div>
          {errors.location && (
            <p className="text-sm text-red-600 mt-2 flex items-center gap-1">
              <AlertCircle size={14} />
              {errors.location}
            </p>
          )}
        </div>

        {/* Category */}
        <div>
          <label htmlFor="category" className="block text-sm font-semibold text-gray-700 mb-2">
            Category *
          </label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.category ? 'border-red-500' : 'border-gray-300'
            }`}
            required
          >
            <option value="">Select a category</option>
            {ISSUE_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          {errors.category && (
            <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
              <AlertCircle size={14} />
              {errors.category}
            </p>
          )}
        </div>

        {/* Advanced duplicate detection controls */}
        <div className="flex flex-col gap-2">
          <label className="inline-flex items-center gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={advancedMode}
              onChange={(e) => setAdvancedMode(e.target.checked)}
              className="h-4 w-4"
            />
            <span className="text-sm font-semibold text-gray-700">Advanced duplicate detection</span>
          </label>

          {advancedMode && (
            <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
              <div className="flex items-center justify-between gap-3">
                <label className="text-sm text-gray-600">Radius: <span className="font-semibold text-gray-800">{radiusMeters} m</span></label>
                <input
                  type="range"
                  min={10}
                  max={200}
                  step={5}
                  value={radiusMeters}
                  onChange={(e) => setRadiusMeters(Number(e.target.value))}
                />
              </div>
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={showNearbyCandidates}
                  disabled={!formData.latitude || !formData.longitude}
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-white font-semibold hover:bg-blue-700 disabled:opacity-50"
                >
                  Show nearby reports
                </button>
                <button
                  type="button"
                  onClick={() => setRadiusMeters(50)}
                  className="inline-flex items-center gap-2 rounded-xl bg-gray-100 px-4 py-2 text-gray-700 font-semibold hover:bg-gray-200"
                >
                  Reset radius
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-2">
            Title * <span className="text-gray-500 font-normal">(5-200 characters)</span>
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g., Broken Traffic Light at Main St & 5th Ave"
            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.title ? 'border-red-500' : 'border-gray-300'
            }`}
            required
          />
          <div className="flex justify-between items-center mt-1">
            {errors.title ? (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle size={14} />
                {errors.title}
              </p>
            ) : (
              <span className="text-sm text-gray-500">{formData.title.length}/200</span>
            )}
          </div>
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-2">
            Description * <span className="text-gray-500 font-normal">(10-2000 characters)</span>
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Provide detailed information about the issue..."
            rows={5}
            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${
              errors.description ? 'border-red-500' : 'border-gray-300'
            }`}
            required
          />
          <div className="flex justify-between items-center mt-1">
            {errors.description ? (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle size={14} />
                {errors.description}
              </p>
            ) : (
              <span className="text-sm text-gray-500">{formData.description.length}/2000</span>
            )}
          </div>
        </div>

        {/* Image Upload Component */}
        <ImageUpload
          label="Photo (Optional)"
          selectedFile={formData.imageFile}
          previewUrl={imagePreview}
          disabled={isSubmitting}
          onImageSelect={(compressedFile) => {
            setFormData((prev) => ({ ...prev, imageFile: compressedFile }));
            setImagePreview(compressedFile ? URL.createObjectURL(compressedFile) : null);
          }}
        />

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting || geoLoading || !coords}
          className="w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 transition font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              Processing...
            </>
          ) : (
            'Report Issue'
          )}
        </button>
      </form>

      {/* Duplicate Warning Modal */}
      <DuplicateWarningModal
        isOpen={showDuplicateModal}
        onClose={handleCancelModal}
        duplicateIssue={duplicateIssue}
        candidateList={candidateList}
        onUpvote={(id) => {
          if (id) handleUpvoteById(id);
          else handleUpvote();
        }}
        onSubmitAnyway={handleSubmitAnyway}
        isLoading={isSubmitting}
      />
    </>
  );
};

export default IssueSubmissionForm;
