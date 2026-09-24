import React from 'react';
import { X, Grid, Tag, ArrowRight } from 'lucide-react';
import { CATEGORIES, BRANDS } from '../data/mockData';

interface TaxonomyModalProps {
  type: 'categories' | 'brands' | null;
  onClose: () => void;
  onSelectCategory: (categoryName: string) => void;
  onSelectBrand: (brandName: string) => void;
}

export const TaxonomyModal: React.FC<TaxonomyModalProps> = ({
  type,
  onClose,
  onSelectCategory,
  onSelectBrand,
}) => {
  if (!type) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden z-10 p-6 sm:p-8 animate-in zoom-in-95 duration-200 max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-[#008080] flex items-center justify-center">
              {type === 'categories' ? <Grid className="w-5 h-5" /> : <Tag className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 font-display">
                {type === 'categories' ? 'All Marketplace Categories' : 'All Featured Brands'}
              </h2>
              <p className="text-xs text-slate-500">
                {type === 'categories'
                  ? 'Browse across all global multi-vendor departments'
                  : 'Official brand catalogs and manufacturer storefronts'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-4">
          {type === 'categories' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    onSelectCategory(cat.name);
                    onClose();
                  }}
                  className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200/80 hover:border-[#008080] hover:bg-teal-50/50 transition-all text-left cursor-pointer group"
                >
                  <div>
                    <div className="text-xs font-bold text-slate-900 group-hover:text-[#008080] transition-colors">
                      {cat.name}
                    </div>
                    <div className="text-[11px] text-slate-400 tabular-nums">
                      {cat.itemCount.toLocaleString()} products available
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#008080] group-hover:translate-x-1 transition-transform" />
                </button>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {BRANDS.map((brand) => (
                <button
                  key={brand.id}
                  type="button"
                  onClick={() => {
                    onSelectBrand(brand.name);
                    onClose();
                  }}
                  className="p-4 rounded-xl border border-slate-200/80 hover:border-[#008080] hover:bg-teal-50/50 transition-all text-center cursor-pointer group flex flex-col items-center"
                >
                  <span className="text-sm font-extrabold text-slate-900 group-hover:text-[#008080]">
                    {brand.name}
                  </span>
                  <span className="text-[11px] text-slate-400 tabular-nums mt-1">
                    {brand.productsCount}+ catalog items ({brand.origin})
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
