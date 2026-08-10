import React from "react";

/**
 * SearchResults Component
 * Standard fallback grid/list search results renderer.
 */
const SearchResults = ({
  items = [],
  renderItem,
  layout = "grid", // "grid" | "list"
  loading = false,
  emptyState = null,
  header = null,
  footer = null,
  className = "",
}) => {
  if (loading) {
    return null;
  }

  if (!items || items.length === 0) {
    return emptyState ? (
      <>{emptyState}</>
    ) : (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 py-16 text-center text-slate-500 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-400">
        <p className="font-semibold">No search results found</p>
      </div>
    );
  }

  return (
    <div className={className}>
      {header && <div>{header}</div>}
      <div
        className={
          layout === "grid"
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            : "space-y-4"
        }
      >
        {items.map((item, index) => (
          <div key={item.id || item._id || index}>
            {renderItem ? renderItem(item, index) : null}
          </div>
        ))}
      </div>
      {footer && <div>{footer}</div>}
    </div>
  );
};

export default SearchResults;
