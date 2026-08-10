import React from 'react';
import { Layers, ChevronRight, FolderTree } from 'lucide-react';

const CategoryTaxonomyTree = ({ categories = [] }) => {
  return (
    <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
      <h3 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-4">
        <FolderTree className="w-5 h-5 text-indigo-500" /> Service Category Taxonomy
      </h3>
      <div className="space-y-2">
        {categories.map((cat, idx) => (
          <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Layers className="w-4 h-4 text-indigo-400" />
              <div>
                <p className="font-semibold text-sm text-slate-700 dark:text-slate-200">{cat.name}</p>
                {cat.parentCategory && <span className="text-xs text-slate-400">Sub-category of {cat.parentCategory.name}</span>}
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryTaxonomyTree;
