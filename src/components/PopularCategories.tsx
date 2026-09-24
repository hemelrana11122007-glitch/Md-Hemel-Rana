import React from 'react';
import {
  Shirt,
  Cpu,
  Home,
  Boxes,
  Sparkles,
  Watch,
  Activity,
  Wrench,
  ArrowRight,
  Grid
} from 'lucide-react';
import { CATEGORIES } from '../data/mockData';
import { Category } from '../types/marketplace';

interface PopularCategoriesProps {
  onSelectCategory: (categoryName: string) => void;
  onBrowseAllCategories: () => void;
  activeCategory?: string;
}

export const PopularCategories: React.FC<PopularCategoriesProps> = ({
  onSelectCategory,
  onBrowseAllCategories,
  activeCategory,
}) => {
  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Shirt':
        return <Shirt className="w-6 h-6 text-[#008080]" />;
      case 'Cpu':
        return <Cpu className="w-6 h-6 text-[#008080]" />;
      case 'Home':
        return <Home className="w-6 h-6 text-[#008080]" />;
      case 'Boxes':
        return <Boxes className="w-6 h-6 text-[#008080]" />;
      case 'Sparkles':
        return <Sparkles className="w-6 h-6 text-[#008080]" />;
      case 'Watch':
        return <Watch className="w-6 h-6 text-[#008080]" />;
      case 'Activity':
        return <Activity className="w-6 h-6 text-[#008080]" />;
      case 'Wrench':
        return <Wrench className="w-6 h-6 text-[#008080]" />;
      default:
        return <Grid className="w-6 h-6 text-[#008080]" />;
    }
  };

  return (
    <section id="categories" className="py-12 bg-white border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-[#008080]">
              Explore Marketplace
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mt-1 font-display">
              Popular Categories
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Select a department to filter retail essentials, bulk wholesale lots, and import goods
            </p>
          </div>

          {/* Browse All Categories button */}
          <button
            type="button"
            onClick={onBrowseAllCategories}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-[#008080] hover:text-white bg-teal-50 hover:bg-[#008080] rounded-lg transition-colors border border-teal-200/80 cursor-pointer shrink-0 self-start sm:self-auto"
          >
            <span>Browse All Categories</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Categories Grid (Circles / Boxes) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4 sm:gap-6">
          {CATEGORIES.map((cat: Category) => {
            const isSelected = activeCategory === cat.name;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => onSelectCategory(cat.name)}
                className={`group flex flex-col items-center p-4 rounded-2xl transition-all duration-200 cursor-pointer text-center ${
                  isSelected
                    ? 'bg-teal-50/80 ring-2 ring-[#008080] shadow-sm'
                    : 'bg-slate-50/70 hover:bg-teal-50/40 hover:shadow-md hover:-translate-y-1'
                }`}
              >
                {/* Category Circle with Icon */}
                <div
                  className={`w-16 h-16 sm:w-18 sm:h-18 rounded-full flex items-center justify-center transition-all duration-200 mb-3 shadow-xs ${
                    isSelected
                      ? 'bg-[#008080] text-white ring-4 ring-teal-100'
                      : 'bg-white text-slate-700 group-hover:bg-[#008080]/10 group-hover:scale-110 border border-slate-100'
                  }`}
                >
                  {getCategoryIcon(cat.icon)}
                </div>

                {/* Name */}
                <span className="text-xs font-bold text-slate-800 group-hover:text-[#008080] transition-colors line-clamp-1">
                  {cat.name}
                </span>

                {/* Count */}
                <span className="text-[11px] text-slate-400 tabular-nums mt-0.5">
                  {cat.itemCount.toLocaleString()} items
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};
