import  { Suspense } from 'react';
import CenteredLoadingSpinner from './CenteredLoadingSpinner';

const SuspenseBoundary = ({ children }) => {
  return (
    <Suspense fallback={<CenteredLoadingSpinner size="10" />}>
      {children}
    </Suspense>
  );
};

export default SuspenseBoundary;
