import React from 'react';
import { ArrowRight, Tag } from 'lucide-react';
import { BRANDS } from '../data/mockData';
import { Brand } from '../types/marketplace';

interface PopularBrandsProps {
  onSelectBrand: (brandName: string) => void;
  onBrowseAllBrands: () => void;
}

export const PopularBrands: React.FC<PopularBrandsProps> = ({
  onSelectBrand,
  onBrowseAllBrands,
}) => {
  return (
    <section id="brands" className="py-12 bg-[#F8FAFA] border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-[#008080]">
              Official Partners & Manufacturers
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mt-1 font-display">
              Popular Brands
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Direct factory partnerships with world-renowned technology, sports, and consumer labels
            </p>
          </div>

          {/* 'Browse All Brands' Button */}
          <button
            type="button"
            onClick={onBrowseAllBrands}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-[#008080] hover:text-white bg-teal-50 hover:bg-[#008080] rounded-lg transition-colors border border-teal-200/80 cursor-pointer shrink-0 self-start sm:self-auto"
          >
            <span>Browse All Brands</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Brands Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
          {BRANDS.map((brand: Brand) => (
            <button
              key={brand.id}
              type="button"
              onClick={() => onSelectBrand(brand.name)}
              className="group flex flex-col items-center justify-center p-4 bg-white rounded-xl border border-slate-200/80 hover:border-[#008080] hover:shadow-md transition-all duration-200 cursor-pointer"
            >
              {/* Brand Logo Box */}
              <div className="w-12 h-12 rounded-lg bg-slate-50 group-hover:bg-teal-50 flex items-center justify-center transition-colors mb-2 border border-slate-100">
                <Tag className="w-5 h-5 text-slate-600 group-hover:text-[#008080]" />
              </div>

              {/* Brand Wordmark / Name */}
              <span className="text-xs font-extrabold text-slate-900 tracking-wider group-hover:text-[#008080] transition-colors">
                {brand.logo}
              </span>

              {/* Product Count & Origin */}
              <span className="text-[11px] text-slate-400 tabular-nums mt-0.5">
                {brand.productsCount}+ items
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};
