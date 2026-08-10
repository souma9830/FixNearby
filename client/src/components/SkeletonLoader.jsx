const SkeletonCard = () => (
  <div className="p-4 bg-white rounded-xl border border-slate-100 shadow-sm animate-pulse space-y-4 dark:bg-slate-800 dark:border-slate-700">
    <div className="flex items-center gap-3">
      <div className="h-12 w-12 bg-slate-200 rounded-xl dark:bg-slate-700" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-slate-200 rounded w-2/3 dark:bg-slate-700" />
        <div className="h-3 bg-slate-200 rounded w-1/3 dark:bg-slate-700" />
      </div>
    </div>
    <div className="h-4 bg-slate-200 rounded w-full dark:bg-slate-700" />
    <div className="h-3 bg-slate-200 rounded w-5/6 dark:bg-slate-700" />
  </div>
);

const SkeletonList = () => (
  <div className="space-y-3 animate-pulse">
    {[...Array(3)].map((_, i) => (
      <div key={i} className="flex items-center gap-3 p-3 bg-slate-100 rounded-lg dark:bg-slate-800">
        <div className="h-10 w-10 bg-slate-200 rounded-full dark:bg-slate-700" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-slate-200 rounded w-1/3 dark:bg-slate-700" />
          <div className="h-3 bg-slate-200 rounded w-2/3 dark:bg-slate-700" />
        </div>
      </div>
    ))}
  </div>
);

const SkeletonDashboard = () => (
  <div className="space-y-5 animate-pulse">
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:bg-slate-800 dark:border-slate-700">
          <div className="h-4 bg-slate-200 rounded w-1/2 dark:bg-slate-700" />
          <div className="mt-3 h-8 bg-slate-200 rounded w-1/3 dark:bg-slate-700" />
        </div>
      ))}
    </div>
    <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm dark:bg-slate-800 dark:border-slate-700">
      <div className="h-6 bg-slate-200 rounded w-1/4 dark:bg-slate-700" />
      <div className="mt-6 space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-5 dark:bg-slate-700/50 dark:border-slate-600">
            <div className="h-12 w-12 rounded-xl bg-slate-200 dark:bg-slate-600" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-slate-200 rounded w-1/4 dark:bg-slate-600" />
              <div className="h-3 bg-slate-200 rounded w-1/3 dark:bg-slate-600" />
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const SkeletonProfile = () => (
  <div className="animate-pulse space-y-6">
    <div className="flex items-center gap-4">
      <div className="h-28 w-28 rounded-full bg-slate-200 dark:bg-slate-700" />
      <div className="flex-1 space-y-3">
        <div className="h-6 bg-slate-200 rounded w-1/3 dark:bg-slate-700" />
        <div className="h-4 bg-slate-200 rounded w-1/4 dark:bg-slate-700" />
      </div>
    </div>
    <div className="h-24 bg-slate-200 rounded-xl dark:bg-slate-700" />
    <div className="grid grid-cols-2 gap-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="h-16 bg-slate-200 rounded-xl dark:bg-slate-700" />
      ))}
    </div>
  </div>
);

const SkeletonBookingCard = () => (
  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm animate-pulse space-y-4 dark:bg-slate-800 dark:border-slate-700">
    <div className="flex items-start justify-between">
      <div className="space-y-2 flex-1">
        <div className="h-5 bg-slate-200 rounded w-1/3 dark:bg-slate-700" />
        <div className="h-4 bg-slate-200 rounded w-1/4 dark:bg-slate-700" />
      </div>
      <div className="h-6 w-20 bg-slate-200 rounded-full dark:bg-slate-700" />
    </div>
    <div className="h-4 bg-slate-200 rounded w-1/2 dark:bg-slate-700" />
    <div className="flex gap-4">
      <div className="h-4 w-16 bg-slate-200 rounded dark:bg-slate-700" />
      <div className="h-4 w-20 bg-slate-200 rounded dark:bg-slate-700" />
    </div>
  </div>
);

const SkeletonLoader = ({ type = 'card', count = 1 }) => {
  const items = Array(count).fill(0);
  let content;

  if (type === 'list') content = <SkeletonList />;
  else if (type === 'dashboard') content = <SkeletonDashboard />;
  else if (type === 'profile') content = <SkeletonProfile />;
  else if (type === 'booking') {
    content = (
      <div className="space-y-4">
        {items.map((_, i) => <SkeletonBookingCard key={i} />)}
      </div>
    );
  } else {
    content = (
      <div className="space-y-4">
        {items.map((_, i) => <SkeletonCard key={i} />)}
      </div>
    );
  }

  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label={`Loading ${type}`}
    >
      {content}
      <span className="sr-only">Loading content</span>
    </div>
  );
};

export { SkeletonCard, SkeletonList, SkeletonDashboard, SkeletonProfile, SkeletonBookingCard };
export default SkeletonLoader;
