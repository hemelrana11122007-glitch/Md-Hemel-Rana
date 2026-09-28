import React from 'react';
import {
  Shirt,
  Smartphone,
  Home,
  Sparkles,
  Activity,
  Gamepad2,
  BookOpen,
  Car,
  ShoppingBag,
  Wrench,
  Plus,
  LayoutGrid,
  ArrowRight,
} from 'lucide-react';
import categoryBannerImg from '../assets/images/category_banner_emerald_leaves_1790626963067.jpg';

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
  // Mobile 8 Circular Categories (4 cols x 2 rows)
  const mobileCategories = [
    { id: 'fashion', name: 'Fashion', fullName: 'Fashion & Apparel', icon: Shirt },
    { id: 'electronics', name: 'Electronics', fullName: 'Electronics & Tech', icon: Smartphone },
    { id: 'home', name: 'Home & Living', fullName: 'Home & Living', icon: Home },
    { id: 'beauty', name: 'Beauty', fullName: 'Beauty & Health', icon: Sparkles },
    { id: 'sports', name: 'Sports', fullName: 'Sports & Outdoors', icon: Activity },
    { id: 'toys', name: 'Toys & Games', fullName: 'Toys & Games', icon: Gamepad2 },
    { id: 'books', name: 'Books', fullName: 'Books & Stationery', icon: BookOpen },
    { id: 'more', name: 'More', fullName: 'All Categories', icon: LayoutGrid, isMore: true },
  ];

  // Desktop 11 Categories matching screenshot (6 in row 1, 5 in row 2 + More)
  const desktopCategoriesList = [
    // Row 1
    {
      id: 'fashion',
      name: 'Fashion',
      fullName: 'Fashion & Apparel',
      icon: Shirt,
      itemCount: '(12k+ products)',
    },
    {
      id: 'electronics',
      name: 'Electronics',
      fullName: 'Electronics & Tech',
      icon: Smartphone,
      itemCount: '(8k+ products)',
    },
    {
      id: 'home',
      name: 'Home & Living',
      fullName: 'Home & Living',
      icon: Home,
      itemCount: '(5k+ products)',
    },
    {
      id: 'beauty',
      name: 'Beauty & Health',
      fullName: 'Beauty & Health',
      icon: Sparkles,
      itemCount: '(6k+ products)',
    },
    {
      id: 'sports',
      name: 'Sports',
      fullName: 'Sports & Outdoors',
      icon: Activity,
      itemCount: '(4k+ products)',
    },
    {
      id: 'toys',
      name: 'Toys & Games',
      fullName: 'Toys & Games',
      icon: Gamepad2,
      itemCount: '(3k+ products)',
    },

    // Row 2
    {
      id: 'books',
      name: 'Books & Stationery',
      fullName: 'Books & Stationery',
      icon: BookOpen,
      itemCount: '(2k+ products)',
    },
    {
      id: 'automotive',
      name: 'Automotive',
      fullName: 'Automotive & Tools',
      icon: Car,
      itemCount: '(3k+ products)',
    },
    {
      id: 'groceries',
      name: 'Groceries',
      fullName: 'Groceries & Essentials',
      icon: ShoppingBag,
      itemCount: '(1k+ products)',
    },
    {
      id: 'tools',
      name: 'Tools & Hardware',
      fullName: 'Tools & Hardware',
      icon: Wrench,
      itemCount: '(2k+ products)',
    },
    {
      id: 'more',
      name: 'More',
      fullName: 'All Categories',
      icon: Plus,
      itemCount: '(10+ categories)',
      isMore: true,
    },
  ];

  return (
    <section id="categories" className="py-4 sm:py-5 bg-white border-b border-slate-100">
      <div className="max-w-[1536px] mx-auto px-3 sm:px-5 lg:px-6">
        {/* ========================================================================= */}
        {/* MOBILE VIEW: 4-Column Circular Category Badges Grid                       */}
        {/* ========================================================================= */}
        <div className="block md:hidden">
          {/* Header Row */}
          <div className="flex items-center justify-between pb-2">
            <h2 className="text-base font-black text-slate-900 tracking-tight font-display">
              Categories
            </h2>
            <button
              type="button"
              onClick={onBrowseAllCategories}
              className="inline-flex items-center gap-1 text-xs font-extrabold text-[#0f766e] hover:text-[#064e3b] cursor-pointer"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* 4-Column Circular Grid */}
          <div className="grid grid-cols-4 gap-2.5 sm:gap-3 text-center pt-1.5">
            {mobileCategories.map((cat) => {
              const IconComponent = cat.icon;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    if (cat.isMore) {
                      onBrowseAllCategories();
                    } else {
                      onSelectCategory(cat.fullName);
                    }
                  }}
                  className="flex flex-col items-center justify-start group cursor-pointer focus:outline-hidden"
                >
                  {/* Circular Soft Mint Badge */}
                  <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-teal-50/90 border border-teal-200/70 flex items-center justify-center text-[#0f766e] group-hover:bg-[#0f766e] group-hover:text-white transition-all shadow-2xs group-active:scale-95">
                    <IconComponent className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  {/* Label */}
                  <span className="text-[11px] font-bold text-slate-800 group-hover:text-[#0f766e] transition-colors line-clamp-1 mt-1.5 leading-tight">
                    {cat.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* DESKTOP VIEW: Left Featured Category Banner (Pure Rectangular) + 11-Grid  */}
        {/* ========================================================================= */}
        <div className="hidden md:grid md:grid-cols-12 gap-3 sm:gap-3.5 items-stretch">
          {/* LEFT: Featured Category Banner with Pure Rectangular Shape (4 Cols on LG) */}
          <div
            className="md:col-span-4 bg-gradient-to-r from-[#042f24] via-[#064e3b] to-[#0f766e] text-white p-4 sm:p-5 relative overflow-hidden shadow-md flex flex-col justify-between min-h-[170px] sm:min-h-[185px] lg:min-h-[190px] rounded-2xl border border-teal-600/30"
          >
            {/* Background Graphic Blend with Products & Tropical Leaves */}
            <div className="absolute right-0 top-0 bottom-0 w-3/5 sm:w-1/2 pointer-events-none overflow-hidden opacity-95">
              <img
                src={categoryBannerImg}
                alt="Shop by Category Products"
                className="w-full h-full object-cover object-right"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#042f24] via-[#042f24]/70 to-transparent" />
            </div>

            {/* Top Text Content */}
            <div className="space-y-1 relative z-10 max-w-[55%]">
              <h2 className="text-lg sm:text-xl font-black text-white tracking-tight font-display leading-tight">
                Shop by<br />Category
              </h2>

              <p className="text-[10px] sm:text-[11px] font-medium text-emerald-100 leading-snug">
                Find what you need, all in one place.
              </p>
            </div>

            {/* White Pill Button 'Browse All →' */}
            <div className="pt-2 relative z-10">
              <button
                type="button"
                onClick={onBrowseAllCategories}
                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 text-[11px] font-bold text-slate-900 bg-white hover:bg-emerald-50 active:scale-95 rounded-full shadow-md transition-all cursor-pointer group"
              >
                <span>Browse All</span>
                <ArrowRight className="w-3 h-3 text-[#0f766e] group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>

          {/* RIGHT: Category Cards Grid (6 cols on top row, 5 cols on bottom row, 8 Cols on LG) */}
          <div className="md:col-span-8 grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-2.5">
            {desktopCategoriesList.map((cat) => {
              const IconComponent = cat.icon;
              const isSelected = activeCategory === cat.name || activeCategory === cat.fullName;

              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    if (cat.isMore) {
                      onBrowseAllCategories();
                    } else {
                      onSelectCategory(cat.fullName);
                    }
                  }}
                  className={`flex flex-col items-center justify-center p-2 rounded-xl sm:rounded-2xl border transition-all duration-200 cursor-pointer text-center group ${
                    isSelected
                      ? 'bg-teal-50/90 border-[#0f766e] ring-1 ring-[#0f766e]/30 shadow-2xs'
                      : 'bg-white hover:bg-teal-50/40 border-slate-100 hover:border-teal-300 hover:shadow-xs hover:-translate-y-0.5'
                  }`}
                >
                  {/* Category Icon Badge */}
                  <div
                    className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center transition-all duration-200 mb-1.5 ${
                      cat.isMore
                        ? 'bg-[#0f766e] text-white shadow-2xs'
                        : isSelected
                        ? 'bg-[#0f766e] text-white'
                        : 'bg-teal-50 text-[#0f766e] group-hover:bg-[#0f766e] group-hover:text-white group-hover:scale-105'
                    }`}
                  >
                    <IconComponent className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                  </div>

                  {/* Category Title */}
                  <h3 className="font-bold text-[11px] sm:text-xs text-slate-800 group-hover:text-[#0f766e] transition-colors leading-tight line-clamp-1">
                    {cat.name}
                  </h3>

                  {/* Item Count */}
                  <span className="text-[9px] sm:text-[10px] font-semibold text-teal-700/70 group-hover:text-teal-800 transition-colors mt-0.5">
                    {cat.itemCount}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
