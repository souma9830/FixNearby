

const CenteredLoadingSpinner = ({ size = "12" }) => {
  return (
    <div className="flex justify-center items-center py-16 dark:bg-slate-900" role="status" aria-live="polite">
      <div className={`animate-spin rounded-full h-${size} w-${size} border-b-2 border-blue-600 dark:border-blue-500`}></div>
      <span className="sr-only">Loading...</span>
    </div>
  );
};

export default CenteredLoadingSpinner;
