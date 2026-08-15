import  { useState, useEffect } from 'react';
import { Layers, Plus, Trash2, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import categoryService from '../../services/categoryService';

const CategoryManager = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newCatName, setNewCatName] = useState('');
  const [newCatSlug, setNewCatSlug] = useState('');
  const [icon, setIcon] = useState('tool');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const data = await categoryService.getAllCategories();
      setCategories(data.categories || []);
    } catch (err) {
      setError('Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!newCatName || !newCatSlug) return;
    setError(null);
    setSuccess('');

    try {
      await categoryService.createCategory({ name: newCatName, slug: newCatSlug, icon });
      setSuccess(`Category "${newCatName}" created successfully!`);
      setNewCatName('');
      setNewCatSlug('');
      fetchCategories();
    } catch (err) {
      setError(err.response?.data?.message || 'Error creating category.');
    }
  };

  const handleDeleteCategory = async (id) => {
    try {
      await categoryService.deleteCategory(id);
      setSuccess('Category deleted.');
      fetchCategories();
    } catch (err) {
      setError('Failed to delete category.');
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto p-6 flex justify-center py-16">
        <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <div className="flex items-center space-x-3">
        <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 rounded-xl">
          <Layers className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Service Category Taxonomy Manager</h1>
          <p className="text-sm text-slate-500">Configure global categories, subcategories, icons, and tags.</p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 text-rose-600 rounded-xl text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4" /> {error}
        </div>
      )}

      {success && (
        <div className="p-4 bg-emerald-50 text-emerald-600 rounded-xl text-sm flex items-center gap-2">
          <CheckCircle className="w-4 h-4" /> {success}
        </div>
      )}

      <form onSubmit={handleCreateCategory} className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase mb-1">Name</label>
          <input
            type="text"
            placeholder="e.g. Plumbing"
            value={newCatName}
            onChange={(e) => {
              setNewCatName(e.target.value);
              setNewCatSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'));
            }}
            className="w-full px-3 py-2 border rounded-lg text-sm dark:bg-slate-900 dark:text-white"
            required
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase mb-1">Slug</label>
          <input
            type="text"
            placeholder="plumbing"
            value={newCatSlug}
            onChange={(e) => setNewCatSlug(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg text-sm dark:bg-slate-900 dark:text-white"
            required
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase mb-1">Icon Identifier</label>
          <input
            type="text"
            placeholder="wrench"
            value={icon}
            onChange={(e) => setIcon(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg text-sm dark:bg-slate-900 dark:text-white"
          />
        </div>
        <div className="flex items-end">
          <button
            type="submit"
            className="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-lg flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add Category
          </button>
        </div>
      </form>

      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-300 uppercase text-xs">
            <tr>
              <th className="p-4">Icon</th>
              <th className="p-4">Name</th>
              <th className="p-4">Slug</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
            {categories.map((cat) => (
              <tr key={cat._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30">
                <td className="p-4 font-mono text-indigo-500">{cat.icon || 'tool'}</td>
                <td className="p-4 font-bold text-slate-900 dark:text-white">{cat.name}</td>
                <td className="p-4 text-slate-500">{cat.slug}</td>
                <td className="p-4 text-right">
                  <button onClick={() => handleDeleteCategory(cat._id)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CategoryManager;
