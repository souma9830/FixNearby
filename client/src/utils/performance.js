import { lazy } from 'react';

/**
 * Utility helper for lazy loading components with automatic retry on chunk load failure.
 */
export const lazyWithRetry = (componentImport) =>
  lazy(async () => {
    try {
      return await componentImport();
    } catch (error) {
      console.warn("Chunk load failed, retrying once...", error);
      return await componentImport();
    }
  });
