/**
 * Client-Side Image Compression Utility
 * Resizes and compresses heavy camera photos (e.g., 5MB+ JPEG/PNG) down to web-optimized JPEGs
 * (max 1920px width/height, ~200-300KB) before uploading over mobile 3G networks.
 */

export const compressImage = async (file, options = {}) => {
  const {
    maxWidth = 1920,
    maxHeight = 1920,
    quality = 0.8,
  } = options;

  if (!file || !(file instanceof File) || !file.type.startsWith('image/')) {
    return { file, originalSize: file?.size || 0, compressedSize: file?.size || 0, compressed: false };
  }

  const originalSize = file.size;

  // Skip compression if file is already smaller than 300KB
  if (originalSize <= 300 * 1024 && file.type === 'image/jpeg') {
    return {
      file,
      originalSize,
      compressedSize: originalSize,
      compressed: false,
      compressionRatio: '0%'
    };
  }

  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      const img = new Image();

      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calculate aspect ratio dimensions
        if (width > maxWidth || height > maxHeight) {
          if (width / height > maxWidth / maxHeight) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        // Create HTML5 Offscreen Canvas
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        // Export as JPEG with specified quality
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              return resolve({ file, originalSize, compressedSize: originalSize, compressed: false });
            }

            const fileName = file.name.replace(/\.[^/.]+$/, '') + '.jpg';
            const compressedFile = new File([blob], fileName, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });

            const compressedSize = compressedFile.size;
            const ratioPercent = Math.max(0, Math.round(((originalSize - compressedSize) / originalSize) * 100));

            resolve({
              file: compressedFile,
              originalSize,
              compressedSize,
              compressed: true,
              compressionRatio: `${ratioPercent}%`,
              width,
              height,
            });
          },
          'image/jpeg',
          quality
        );
      };

      img.onerror = () => {
        resolve({ file, originalSize, compressedSize: originalSize, compressed: false });
      };

      img.src = event.target.result;
    };

    reader.onerror = () => {
      resolve({ file, originalSize, compressedSize: originalSize, compressed: false });
    };

    reader.readAsDataURL(file);
  });
};

/**
 * Format bytes into human readable string (KB / MB)
 */
export const formatFileSize = (bytes) => {
  if (!bytes || isNaN(bytes)) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};
