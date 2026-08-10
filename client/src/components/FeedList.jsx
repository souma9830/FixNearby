import React from "react";

/**
 * FeedList Component
 * Optimized DOM virtualized feed renderer fallback.
 * Used for provider job feeds, activity lists, and event streams.
 */
const FeedList = ({
  items = [],
  renderItem,
  loading = false,
  emptyState = null,
  header = null,
  footer = null,
  className = "",
  itemClassName = "pb-4",
}) => {
  if (loading) {
    return null;
  }

  if (!items || items.length === 0) {
    return emptyState ? (
      <>{emptyState}</>
    ) : (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 py-16 text-center text-slate-500 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-400">
        <p className="font-semibold">Feed is empty</p>
      </div>
    );
  }

  return (
    <div className={className}>
      {header && <div>{header}</div>}
      {items.map((item, index) => (
        <div key={item.id || item._id || index} className={itemClassName}>
          {renderItem ? renderItem(item, index) : null}
        </div>
      ))}
      {footer && <div>{footer}</div>}
    </div>
  );
};

export default FeedList;
