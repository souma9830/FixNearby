import { useLocation } from '../context/LocationContext';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import useToast from '../hooks/useToast';

/**
 * LocationBanner
 * A slim status strip rendered below the Navbar.
 * Shows:
 *  – pulsing spinner while detecting
 *  – green pill with city-like coords when located
 *  – yellow warning with retry when denied / error
 */
const LocationBanner = () => {
  const { t } = useTranslation();
  const { coords, loading, error, permissionDenied, retry } = useLocation();
  const [retryLoading, setRetryLoading] = useState(false);
  const { showToast } = useToast();

  const handleRetry = async () => {
    setRetryLoading(true);
    try {
      await retry();
      showToast(t('locationBanner.toastSuccess'), 'success');
    } catch (error) {
      console.error('Retry failed:', error);
      showToast(t('locationBanner.toastError'), 'error');
    } finally {
      setRetryLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-blue-50 border-b border-blue-100 py-2 px-4 flex items-center justify-center gap-2 text-sm text-blue-700 font-medium">
        <span className="inline-block w-3 h-3 rounded-full border-2 border-blue-400 border-t-transparent animate-spin" />
        {t('locationBanner.detecting')}
      </div>
    );
  }

  if (permissionDenied) {
    return (
      <div className="bg-amber-50 border-b border-amber-100 py-2 px-4 flex items-center justify-center gap-3 text-sm text-amber-800 font-medium flex-wrap">
        <span>{t('locationBanner.permissionDenied')}</span>
        <button
          onClick={handleRetry}
          disabled={retryLoading}
          className="underline underline-offset-2 hover:text-amber-600 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className={`btn-text ${retryLoading ? 'hidden' : ''}`}>{t('locationBanner.retry')}</span>
          <span className={`btn-loader ${retryLoading ? '' : 'hidden'}`}>{t('locationBanner.loading')}</span>
        </button>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-b border-red-100 py-2 px-4 flex items-center justify-center gap-3 text-sm text-red-700 font-medium flex-wrap">
        <span>📍 {error}</span>
        <button
          onClick={handleRetry}
          disabled={retryLoading}
          className="underline underline-offset-2 hover:text-red-500 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className={`btn-text ${retryLoading ? 'hidden' : ''}`}>{t('locationBanner.retry')}</span>
          <span className={`btn-loader ${retryLoading ? '' : 'hidden'}`}>{t('locationBanner.loading')}</span>
        </button>
      </div>
    );
  }

  if (coords) {
    return (
      <div className="bg-green-50 border-b border-green-100 py-2 px-4 flex items-center justify-center gap-2 text-sm text-green-700 font-medium">
        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
        {t('locationBanner.locationDetected')}
        <span className="text-green-500 font-normal">
          ({coords.latitude.toFixed(4)}°, {coords.longitude.toFixed(4)}°)
        </span>
      </div>
    );
  }

  return null;
};

export default LocationBanner;
