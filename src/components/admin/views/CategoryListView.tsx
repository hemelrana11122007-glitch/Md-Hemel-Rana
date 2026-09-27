import React, { useState, useEffect } from 'react';
import {
  Layers,
  Plus,
  Search,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Sparkles,
  ExternalLink,
  RotateCcw,
  AlertTriangle,
  X,
  Eye,
  Filter,
  Star,
} from 'lucide-react';
import { CategoryItem, categoryService } from '../../../services/categoryService';

interface CategoryListViewProps {
  onNavigateToAdd: () => void;
  onNavigateToEdit: (categoryId: string) => void;
  onShowToast: (message: string) => void;
}

export const CategoryListView: React.FC<CategoryListViewProps> = ({
  onNavigateToAdd,
  onNavigateToEdit,
  onShowToast,
}) => {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'featured'>('all');
  const [deletingCategory, setDeletingCategory] = useState<CategoryItem | null>(null);

  const loadCategories = () => {
    setCategories(categoryService.getCategories());
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleConfirmDelete = () => {
    if (!deletingCategory) return;
    const success = categoryService.deleteCategory(deletingCategory.id);
    if (success) {
      onShowToast(`Category "${deletingCategory.name}" removed successfully.`);
      loadCategories();
    } else {
      onShowToast('Failed to delete category.');
    }
    setDeletingCategory(null);
  };

  const handleToggleActive = (cat: CategoryItem) => {
    const updated = categoryService.updateCategory(cat.id, { is_active: !cat.is_active });
    if (updated) {
      onShowToast(`Category "${cat.name}" is now ${updated.is_active ? 'Active' : 'Inactive'}.`);
      loadCategories();
    }
  };

  const handleToggleFeatured = (cat: CategoryItem) => {
    const updated = categoryService.updateCategory(cat.id, { is_featured: !cat.is_featured });
    if (updated) {
      onShowToast(`Category "${cat.name}" ${updated.is_featured ? 'marked as Featured Hub' : 'removed from Featured'}.`);
      loadCategories();
    }
  };

  const filteredCategories = categories.filter((cat) => {
    const matchQuery =
      cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cat.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (cat.seo_keywords && cat.seo_keywords.toLowerCase().includes(searchQuery.toLowerCase()));

    if (statusFilter === 'active') return matchQuery && cat.is_active;
    if (statusFilter === 'inactive') return matchQuery && !cat.is_active;
    if (statusFilter === 'featured') return matchQuery && cat.is_featured;
    return matchQuery;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200 pb-16">
      {/* 1. Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-[#008080]/10 text-[#008080] border border-[#008080]/20 mb-1.5">
            <Layers className="w-3.5 h-3.5" />
            <span>Marketplace Taxonomy</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight font-display">
            Category Management
          </h1>
          <p className="text-xs text-slate-500 max-w-2xl mt-1">
            Manage global marketplace category taxonomy, storefront featured hubs, and AI-optimized SEO meta rules.
          </p>
        </div>

        {/* Add New Category Button */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={loadCategories}
            className="p-2.5 bg-white hover:bg-slate-100 text-slate-600 rounded-xl border border-slate-200 shadow-2xs transition-colors cursor-pointer"
            title="Refresh list"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={onNavigateToAdd}
            className="px-4 py-2.5 bg-[#008080] hover:bg-[#006666] text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Category</span>
          </button>
        </div>
      </div>

      {/* 2. Search & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search category name, slug or keywords..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-300 text-xs font-medium text-slate-800 bg-white focus:outline-none focus:border-[#008080]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'all', label: `All (${categories.length})` },
            { id: 'active', label: `Active (${categories.filter((c) => c.is_active).length})` },
            { id: 'featured', label: `Featured Hubs (${categories.filter((c) => c.is_featured).length})` },
            { id: 'inactive', label: `Inactive (${categories.filter((c) => !c.is_active).length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setStatusFilter(tab.id as any)}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                statusFilter === tab.id
                  ? 'bg-[#008080] text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Dynamic Category Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/80 border-b border-slate-200 text-[11px] font-black uppercase text-slate-600 tracking-wider">
              <tr>
                <th className="py-3.5 px-4">#</th>
                <th className="py-3.5 px-4">Category & Slug</th>
                <th className="py-3.5 px-4">Promo Banner</th>
                <th className="py-3.5 px-4">Products</th>
                <th className="py-3.5 px-4">Featured Hub</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">SEO Health</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCategories.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-slate-400 font-semibold">
                    No categories found matching "{searchQuery}".
                  </td>
                </tr>
              ) : (
                filteredCategories.map((cat, idx) => (
                  <tr key={cat.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-slate-400 text-[11px]">
                      {idx + 1}
                    </td>

                    {/* Category Icon, Name & Slug */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                          {cat.logo_url ? (
                            <img
                              src={cat.logo_url}
                              alt={cat.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Layers className="w-5 h-5 text-slate-400" />
                          )}
                        </div>
                        <div>
                          <span className="font-extrabold text-slate-900 text-xs block hover:text-[#008080] cursor-pointer">
                            {cat.name}
                          </span>
                          <span className="text-[11px] font-mono text-slate-400">
                            /{cat.slug}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Promo Banner Preview */}
                    <td className="py-3.5 px-4">
                      {cat.banner_url ? (
                        <div className="w-20 h-8 rounded-lg overflow-hidden border border-slate-200">
                          <img
                            src={cat.banner_url}
                            alt="Banner"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-400 italic">No Banner</span>
                      )}
                    </td>

                    {/* Product count */}
                    <td className="py-3.5 px-4 font-bold text-slate-700">
                      {cat.itemCount.toLocaleString()} Items
                    </td>

                    {/* Featured Hub Badge / Toggle */}
                    <td className="py-3.5 px-4">
                      <button
                        type="button"
                        onClick={() => handleToggleFeatured(cat)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black transition-colors cursor-pointer ${
                          cat.is_featured
                            ? 'bg-amber-100 text-amber-900 border border-amber-300'
                            : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                        }`}
                        title="Click to toggle featured hub"
                      >
                        <Star className={`w-3 h-3 ${cat.is_featured ? 'fill-amber-500 text-amber-500' : ''}`} />
                        <span>{cat.is_featured ? 'Featured Hub' : 'Standard'}</span>
                      </button>
                    </td>

                    {/* Active Status Badge / Toggle */}
                    <td className="py-3.5 px-4">
                      <button
                        type="button"
                        onClick={() => handleToggleActive(cat)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black transition-colors cursor-pointer ${
                          cat.is_active
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                        title="Click to toggle active status"
                      >
                        {cat.is_active ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Active</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3 text-rose-600" />
                            <span>Inactive</span>
                          </>
                        )}
                      </button>
                    </td>

                    {/* SEO Health Badge */}
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-teal-50 text-[#008080] border border-teal-200 text-[10px] font-bold">
                        <Sparkles className="w-3 h-3" />
                        <span>AI Meta Ready</span>
                      </span>
                    </td>

                    {/* Actions: Edit & Delete */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Edit Button */}
                        <button
                          type="button"
                          onClick={() => onNavigateToEdit(cat.id)}
                          className="p-1.5 bg-slate-100 hover:bg-[#008080] hover:text-white text-slate-700 rounded-lg transition-colors cursor-pointer"
                          title="Edit Category Details & SEO"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete Button */}
                        <button
                          type="button"
                          onClick={() => setDeletingCategory(cat)}
                          className="p-1.5 bg-slate-100 hover:bg-rose-600 hover:text-white text-slate-700 rounded-lg transition-colors cursor-pointer"
                          title="Delete Category"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Summary Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div>
            Showing <strong>{filteredCategories.length}</strong> of <strong>{categories.length} Categories</strong>
          </div>
          <button
            type="button"
            onClick={onNavigateToAdd}
            className="text-xs font-bold text-[#008080] hover:underline cursor-pointer flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add New Category</span>
          </button>
        </div>
      </div>

      {/* 4. Delete Confirmation Modal */}
      {deletingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-slate-200 p-6 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900">
                Delete Category: "{deletingCategory.name}"?
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Are you sure you want to delete this category? This will completely remove the category node from the marketplace taxonomy and URL index.
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] font-mono text-slate-700 space-y-1">
              <div>Slug: /{deletingCategory.slug}</div>
              <div>Products: {deletingCategory.itemCount} Items currently indexed</div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingCategory(null)}
                className="px-4 py-2 border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Yes, Delete Category
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
