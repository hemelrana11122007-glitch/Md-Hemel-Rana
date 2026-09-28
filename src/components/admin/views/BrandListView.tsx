import React, { useState, useEffect } from 'react';
import {
  Tag,
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
  Globe,
  Package,
  Layers,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { BrandItem, brandService } from '../../../services/brandService';

interface BrandListViewProps {
  onNavigateToAdd: () => void;
  onNavigateToEdit: (brandId: string) => void;
  onShowToast: (message: string) => void;
}

export const BrandListView: React.FC<BrandListViewProps> = ({
  onNavigateToAdd,
  onNavigateToEdit,
  onShowToast,
}) => {
  const [brands, setBrands] = useState<BrandItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'featured'>('all');
  const [deletingBrand, setDeletingBrand] = useState<BrandItem | null>(null);

  const loadBrands = () => {
    setBrands(brandService.getBrands());
  };

  useEffect(() => {
    loadBrands();
  }, []);

  const handleConfirmDelete = () => {
    if (!deletingBrand) return;
    const success = brandService.deleteBrand(deletingBrand.id);
    if (success) {
      onShowToast(`Brand "${deletingBrand.name}" deleted successfully.`);
      loadBrands();
    } else {
      onShowToast('Failed to delete brand.');
    }
    setDeletingBrand(null);
  };

  const handleToggleActive = (brand: BrandItem) => {
    const updated = brandService.updateBrand(brand.id, { is_active: !brand.is_active });
    if (updated) {
      onShowToast(`Brand "${brand.name}" is now ${updated.is_active ? 'Active' : 'Inactive'}.`);
      loadBrands();
    }
  };

  const handleToggleFeatured = (brand: BrandItem) => {
    const updated = brandService.updateBrand(brand.id, { is_featured: !brand.is_featured });
    if (updated) {
      onShowToast(
        `Brand "${brand.name}" ${updated.is_featured ? 'marked as Featured Brand' : 'removed from Featured'}.`
      );
      loadBrands();
    }
  };

  const filteredBrands = brands.filter((brand) => {
    const q = searchQuery.toLowerCase().trim();
    const matchQuery =
      !q ||
      brand.name.toLowerCase().includes(q) ||
      brand.slug.toLowerCase().includes(q) ||
      (brand.category && brand.category.toLowerCase().includes(q)) ||
      (brand.origin && brand.origin.toLowerCase().includes(q)) ||
      (brand.seo_keywords && brand.seo_keywords.toLowerCase().includes(q));

    if (statusFilter === 'active') return matchQuery && brand.is_active;
    if (statusFilter === 'inactive') return matchQuery && !brand.is_active;
    if (statusFilter === 'featured') return matchQuery && brand.is_featured;
    return matchQuery;
  });

  // Calculate live statistics
  const totalCount = brands.length;
  const activeCount = brands.filter((b) => b.is_active).length;
  const featuredCount = brands.filter((b) => b.is_featured).length;
  const totalProducts = brands.reduce((sum, b) => sum + (b.productsCount || 0), 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-200 pb-16">
      {/* 1. Top Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-[#008080]/10 text-[#008080] border border-[#008080]/20 mb-1.5">
            <Tag className="w-3.5 h-3.5" />
            <span>Brand Settings & Registry</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight font-display">
            Brand Management
          </h1>
          <p className="text-xs text-slate-500 max-w-2xl mt-1">
            Manage official marketplace global brands, manufacturer identities, verified storefront slugs, and market-researched SEO metadata.
          </p>
        </div>

        <button
          onClick={onNavigateToAdd}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#008080] hover:bg-[#006666] text-white rounded-xl text-sm font-bold shadow-lg shadow-teal-900/10 hover:shadow-teal-900/20 active:scale-[0.98] transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Add New Brand</span>
        </button>
      </div>

      {/* 2. Quick Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500">Total Brands</p>
            <p className="text-2xl font-black text-slate-900 mt-0.5">{totalCount}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
            <Tag className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-emerald-600">Active Brands</p>
            <p className="text-2xl font-black text-emerald-700 mt-0.5">{activeCount}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-amber-600">Featured Brands</p>
            <p className="text-2xl font-black text-amber-700 mt-0.5">{featuredCount}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
            <Star className="w-5 h-5 fill-amber-400 text-amber-500" />
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-[#008080]">Linked Catalog</p>
            <p className="text-2xl font-black text-[#008080] mt-0.5">{totalProducts}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center text-[#008080]">
            <Package className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 3. Search & Filter Bar */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search brands by name, slug, category, origin or keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-9 py-2 bg-slate-50 hover:bg-slate-100/70 focus:bg-white text-xs font-medium text-slate-800 placeholder-slate-400 rounded-xl border border-slate-200 focus:border-[#008080] focus:ring-2 focus:ring-[#008080]/20 transition-all outline-hidden"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              statusFilter === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All ({brands.length})
          </button>
          <button
            onClick={() => setStatusFilter('active')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              statusFilter === 'active'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Active ({activeCount})
          </button>
          <button
            onClick={() => setStatusFilter('featured')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              statusFilter === 'featured'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Featured ({featuredCount})
          </button>
          <button
            onClick={() => setStatusFilter('inactive')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              statusFilter === 'inactive'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Inactive ({brands.length - activeCount})
          </button>
        </div>
      </div>

      {/* 4. Brands Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {filteredBrands.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-teal-50 text-[#008080] flex items-center justify-center mx-auto mb-4 border border-teal-100">
              <Tag className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-slate-800">No brands found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-5">
              {searchQuery
                ? `No brands matched your search "${searchQuery}". Try a different keyword.`
                : 'No brands currently registered in the database. Add your first official brand.'}
            </p>
            {searchQuery ? (
              <button
                onClick={() => setSearchQuery('')}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                Clear Search
              </button>
            ) : (
              <button
                onClick={onNavigateToAdd}
                className="px-5 py-2.5 bg-[#008080] hover:bg-[#006666] text-white text-xs font-bold rounded-xl shadow-lg shadow-teal-900/10 transition-all cursor-pointer"
              >
                + Register First Brand
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-4">Brand Identity</th>
                  <th className="py-3.5 px-4">Slug & URL</th>
                  <th className="py-3.5 px-4">Category & Origin</th>
                  <th className="py-3.5 px-4 text-center">Products</th>
                  <th className="py-3.5 px-4 text-center">Featured</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredBrands.map((brand) => (
                  <tr key={brand.id} className="hover:bg-slate-50/60 transition-colors group">
                    {/* Brand Identity: Logo + Name */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-slate-100 border border-slate-200/80 overflow-hidden flex items-center justify-center shrink-0 p-0.5 shadow-2xs group-hover:border-[#008080]/30 transition-all">
                          {brand.logo_url ? (
                            <img
                              src={brand.logo_url}
                              alt={brand.name}
                              className="w-full h-full object-cover rounded-lg"
                              onError={(e) => {
                                (e.currentTarget as HTMLElement).style.display = 'none';
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-teal-50 text-[#008080] font-black text-sm rounded-lg">
                              {brand.name.substring(0, 2).toUpperCase()}
                            </div>
                          )}
                        </div>

                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-900 text-sm group-hover:text-[#008080] transition-colors">
                              {brand.name}
                            </span>
                            {brand.wordmark && (
                              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 font-semibold border border-slate-200">
                                {brand.wordmark}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1 max-w-xs">
                            {brand.description || `Official ${brand.name} brand catalog`}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Slug & URL */}
                    <td className="py-3.5 px-4">
                      <div className="inline-flex items-center gap-1 font-mono text-[11px] text-slate-600 bg-slate-50 px-2 py-1 rounded-md border border-slate-200">
                        <span>/brand/{brand.slug}</span>
                      </div>
                      {brand.seo_title && (
                        <p className="text-[10px] text-slate-400 mt-1 line-clamp-1 max-w-[200px]" title={brand.seo_title}>
                          SEO: {brand.seo_title}
                        </p>
                      )}
                    </td>

                    {/* Category & Origin */}
                    <td className="py-3.5 px-4">
                      <div className="space-y-1">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-teal-50 text-teal-800 border border-teal-200/50">
                          <Layers className="w-2.5 h-2.5 text-[#008080]" />
                          <span>{brand.category || 'General'}</span>
                        </span>
                        {brand.origin && (
                          <div className="text-[11px] text-slate-500 flex items-center gap-1">
                            <Globe className="w-3 h-3 text-slate-400" />
                            <span>{brand.origin}</span>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Catalog Products */}
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-block px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700">
                        {brand.productsCount || 0}
                      </span>
                    </td>

                    {/* Featured Star Toggle */}
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => handleToggleFeatured(brand)}
                        title={brand.is_featured ? 'Remove from Featured' : 'Mark as Featured'}
                        className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                          brand.is_featured
                            ? 'text-amber-500 bg-amber-50 hover:bg-amber-100'
                            : 'text-slate-300 hover:text-slate-500 hover:bg-slate-100'
                        }`}
                      >
                        <Star className={`w-4 h-4 ${brand.is_featured ? 'fill-amber-400' : ''}`} />
                      </button>
                    </td>

                    {/* Active/Inactive Status Toggle */}
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => handleToggleActive(brand)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                          brand.is_active
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/70 hover:bg-emerald-100'
                            : 'bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            brand.is_active ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                          }`}
                        />
                        <span>{brand.is_active ? 'Active' : 'Inactive'}</span>
                      </button>
                    </td>

                    {/* Actions: Edit & Delete */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onNavigateToEdit(brand.id)}
                          className="p-1.5 text-slate-500 hover:text-[#008080] hover:bg-teal-50 rounded-lg transition-colors cursor-pointer"
                          title="Edit Brand"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeletingBrand(brand)}
                          className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete Brand"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 5. Delete Confirmation Modal */}
      {deletingBrand && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 text-rose-600 mb-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center border border-rose-100">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Delete Brand</h3>
                <p className="text-xs text-slate-500">Irreversible Action</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
              Are you sure you want to permanently delete the brand{' '}
              <strong className="text-slate-900 font-bold">"{deletingBrand.name}"</strong> (slug:{' '}
              <code className="text-[#008080] font-mono">{deletingBrand.slug}</code>)? Any products linked to this brand will lose their brand attribution.
            </p>

            <div className="flex items-center justify-end gap-2.5">
              <button
                onClick={() => setDeletingBrand(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-md shadow-rose-900/10 transition-all cursor-pointer"
              >
                Yes, Delete Brand
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
