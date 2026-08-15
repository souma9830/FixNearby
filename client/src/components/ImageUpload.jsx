import  { useState, useRef } from 'react';
import { Upload, X, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { compressImage, formatFileSize } from '../utils/imageCompressor';

/**
 * ImageUpload Component
 * Selects, validates, compresses, and previews images for upload.
 */
const ImageUpload = ({
  onImageSelect,
  previewUrl: initialPreview,
  label = "Upload Job Photo",
  error = null,
  disabled = false,
  maxSizeMB = 10,
}) => {
  const [compressing, setCompressing] = useState(false);
  const [metrics, setMetrics] = useState(null);
  const [preview, setPreview] = useState(initialPreview || null);
  const [localError, setLocalError] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLocalError(null);

    // Basic file validation
    if (!file.type.startsWith('image/')) {
      setLocalError('Please upload a valid image file (JPEG, PNG, WebP).');
      return;
    }

    if (file.size > maxSizeMB * 1024 * 1024) {
      setLocalError(`File size exceeds maximum allowed size of ${maxSizeMB}MB.`);
      return;
    }

    setCompressing(true);
    try {
      // Compress image client-side before dispatching
      const result = await compressImage(file, { maxWidth: 1920, maxHeight: 1920, quality: 0.8 });

      setMetrics(result);
      setPreview(URL.createObjectURL(result.file));

      if (onImageSelect) {
        onImageSelect(result.file, result);
      }
    } catch (err) {
      console.error('Compression error:', err);
      // Fallback to original file
      setPreview(URL.createObjectURL(file));
      if (onImageSelect) {
        onImageSelect(file, { file, originalSize: file.size, compressedSize: file.size, compressed: false });
      }
    } finally {
      setCompressing(false);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    setMetrics(null);
    setLocalError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (onImageSelect) {
      onImageSelect(null, null);
    }
  };

  const activeError = error || localError;

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
        {label}
      </label>

      {preview ? (
        <div className="relative rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-slate-50 dark:bg-slate-800 p-2">
          <div className="relative aspect-video w-full rounded-lg overflow-hidden bg-slate-900 flex items-center justify-center">
            <img
              src={preview}
              alt="Uploaded preview"
              className="max-h-full max-w-full object-contain"
            />
            {!disabled && (
              <button
                type="button"
                onClick={handleRemove}
                className="absolute top-2 right-2 p-1.5 bg-slate-900/80 hover:bg-slate-900 text-white rounded-full transition-colors shadow-md"
                aria-label="Remove image"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {metrics && (
            <div className="mt-2 px-2 py-1.5 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900/50 rounded-md border border-slate-100 dark:border-slate-800">
              <span className="flex items-center gap-1 font-medium text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {metrics.compressed ? 'Optimized for 3G Mobile' : 'Ready'}
              </span>
              <span>
                {metrics.compressed ? (
                  <>
                    <span className="line-through opacity-60 mr-1">{formatFileSize(metrics.originalSize)}</span>
                    <span className="font-semibold text-slate-900 dark:text-slate-100">{formatFileSize(metrics.compressedSize)}</span>
                    <span className="ml-1 text-emerald-600 font-bold">(-{metrics.compressionRatio})</span>
                  </>
                ) : (
                  formatFileSize(metrics.originalSize)
                )}
              </span>
            </div>
          )}
        </div>
      ) : (
        <div
          onClick={() => !disabled && !compressing && fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
            disabled ? 'opacity-50 cursor-not-allowed border-slate-200' :
            activeError ? 'border-red-300 bg-red-50/50 dark:bg-red-950/20' :
            'border-slate-300 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-400 bg-slate-50/50 dark:bg-slate-800/50'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileChange}
            disabled={disabled || compressing}
            className="hidden"
            id="image-upload-input"
          />

          <div className="flex flex-col items-center justify-center gap-2">
            {compressing ? (
              <>
                <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                  Compressing photo for fast 3G upload...
                </span>
              </>
            ) : (
              <>
                <div className="p-3 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 rounded-full">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                    Click or tap to upload photo
                  </span>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Auto-compressed to web JPEG (~300KB) for fast 3G upload
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {activeError && (
        <div className="mt-2 flex items-center gap-1.5 text-xs text-red-600 dark:text-red-400">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          <span>{activeError}</span>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
