

const ServiceTaxonomyNavigator = ({ categories = [], selectedCategory, onSelectCategory }) => {
  return (
    <div className="flex gap-2 overflow-x-auto py-3 px-1 no-scrollbar border-b dark:border-gray-800">
      <button
        onClick={() => onSelectCategory(null)}
        className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
          !selectedCategory
            ? 'bg-indigo-600 text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300'
        }`}
      >
        All Categories
      </button>
      {categories.map((cat) => (
        <button
          key={cat._id || cat.slug}
          onClick={() => onSelectCategory(cat.slug)}
          className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
            selectedCategory === cat.slug
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300'
          }`}
        >
          {cat.name}
        </button>
      ))}
    </div>
  );
};

export default ServiceTaxonomyNavigator;
