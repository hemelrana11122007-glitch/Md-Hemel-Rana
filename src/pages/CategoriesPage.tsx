import React, { useState } from 'react';
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
  Boxes,
  Watch,
  Grid,
  Search,
  ArrowRight,
  Layers,
  CheckCircle2,
  ArrowLeft,
  ChevronRight,
  PackageCheck,
  Tag,
} from 'lucide-react';
import { CATEGORIES } from '../data/mockData';

interface CategoriesPageProps {
  onSelectCategory: (categoryName: string) => void;
  onNavigatePage: (pageId: string, urlPath?: string) => void;
}

const CATEGORY_DETAILS: Record<string, {
  fullName: string;
  description: string;
  icon: React.ElementType;
  subcategories: string[];
  productCount: string;
  color: string;
  badge: string;
}> = {
  'Fashion & Apparel': {
    fullName: 'Fashion & Apparel',
    description: "Men's & Women's clothing, footwear, ethnic wear, and luxury fashion accessories.",
    icon: Shirt,
    subcategories: ["Men's Fashion", "Women's Fashion", 'Footwear & Sneakers', 'Watches & Accessories'],
    productCount: '12,450+ Products',
    color: 'from-rose-500/10 to-pink-500/5 text-rose-600 border-rose-200',
    badge: 'Trending',
  },
  'Electronics & Tech': {
    fullName: 'Electronics & Tech',
    description: 'Smartphones, audio, laptops, smart home devices, and computer peripherals.',
    icon: Smartphone,
    subcategories: ['Smartphones & Tablets', 'Headphones & Audio', 'Laptops & PCs', 'Smart Gadgets'],
    productCount: '8,920+ Products',
    color: 'from-blue-500/10 to-indigo-500/5 text-blue-600 border-blue-200',
    badge: 'High Demand',
  },
  'Home & Living': {
    fullName: 'Home & Living',
    description: 'Furniture, kitchenware, bedding, home decor, and smart appliances.',
    icon: Home,
    subcategories: ['Home Decor', 'Kitchen & Dining', 'Bedding & Bath', 'Lighting & Lamps'],
    productCount: '5,630+ Products',
    color: 'from-emerald-500/10 to-teal-500/5 text-emerald-600 border-emerald-200',
    badge: 'Popular',
  },
  'Beauty & Health': {
    fullName: 'Beauty & Health',
    description: 'Skincare, makeup, fragrance, personal care, and wellness supplements.',
    icon: Sparkles,
    subcategories: ['Skincare & Serums', 'Makeup Essentials', 'Fragrances & Perfumes', 'Hair Care'],
    productCount: '6,180+ Products',
    color: 'from-purple-500/10 to-fuchsia-500/5 text-purple-600 border-purple-200',
    badge: 'Top Rated',
  },
  'Sports & Outdoors': {
    fullName: 'Sports & Outdoors',
    description: 'Fitness equipment, sportswear, outdoor camping gear, and athletic wear.',
    icon: Activity,
    subcategories: ['Gym Equipment', 'Sportswear', 'Outdoor & Camping', 'Cycles & Accessories'],
    productCount: '4,210+ Products',
    color: 'from-amber-500/10 to-orange-500/5 text-amber-600 border-amber-200',
    badge: 'Active',
  },
  'Toys & Games': {
    fullName: 'Toys & Games',
    description: 'Action figures, educational toys, board games, and gaming consoles.',
    icon: Gamepad2,
    subcategories: ['Educational Toys', 'Action Figures', 'Board Games', 'Video Gaming'],
    productCount: '3,840+ Products',
    color: 'from-cyan-500/10 to-sky-500/5 text-cyan-600 border-cyan-200',
    badge: 'Kids & Gaming',
  },
  'Books & Stationery': {
    fullName: 'Books & Stationery',
    description: 'Academic books, fiction, art supplies, and office stationery items.',
    icon: BookOpen,
    subcategories: ['Academic & Textbooks', 'Fiction & Novels', 'Office Supplies', 'Art Materials'],
    productCount: '2,950+ Products',
    color: 'from-teal-500/10 to-emerald-500/5 text-teal-600 border-teal-200',
    badge: 'Bestseller',
  },
  'Automotive & Tools': {
    fullName: 'Automotive & Tools',
    description: 'Car care accessories, motorcycle gear, power tools, and hardware replacement parts.',
    icon: Car,
    subcategories: ['Car Accessories', 'Bike & Helmet', 'Power Tools', 'Auto Maintenance'],
    productCount: '3,120+ Products',
    color: 'from-slate-500/10 to-zinc-500/5 text-slate-700 border-slate-200',
    badge: 'Tools & Care',
  },
  'Groceries & Essentials': {
    fullName: 'Groceries & Essentials',
    description: 'Organic food items, daily cooking oils, snacks, beverages, and household cleaners.',
    icon: ShoppingBag,
    subcategories: ['Packaged Foods', 'Beverages & Tea', 'Cooking Essentials', 'Cleaning Supplies'],
    productCount: '1,890+ Products',
    color: 'from-lime-500/10 to-green-500/5 text-lime-700 border-lime-200',
    badge: 'Daily Needs',
  },
  'Tools & Hardware': {
    fullName: 'Tools & Hardware',
    description: 'Hand tools, electrical fittings, plumbing equipment, and industrial hardware.',
    icon: Wrench,
    subcategories: ['Hand Tools', 'Electrical Equipment', 'Plumbing Hardware', 'Safety Gear'],
    productCount: '2,460+ Products',
    color: 'from-orange-500/10 to-amber-500/5 text-orange-600 border-orange-200',
    badge: 'Hardware',
  },
  'Wholesale & B2B': {
    fullName: 'Wholesale & B2B',
    description: 'Bulk factory supplies, wholesale garments, and B2B manufacturing stock.',
    icon: Boxes,
    subcategories: ['Bulk Apparel Lot', 'Factory Supplies', 'Packaging Materials', 'B2B Raw Stock'],
    productCount: '8,950+ Products',
    color: 'from-amber-600/10 to-[#008080]/10 text-teal-700 border-teal-300',
    badge: 'Bulk Discount',
  },
  'Watches & Imports': {
    fullName: 'Watches & Imports',
    description: 'Direct foreign imported luxury timepieces, smartwatches, and global gadgets.',
    icon: Watch,
    subcategories: ['Smartwatches', 'Luxury Analogs', 'Direct Imports', 'Customs Cleared'],
    productCount: '1,670+ Products',
    color: 'from-teal-600/10 to-emerald-600/10 text-teal-800 border-teal-300',
    badge: 'Direct Import',
  },
};

export const CategoriesPage: React.FC<CategoriesPageProps> = ({
  onSelectCategory,
  onNavigatePage,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Fallback category icon list
  const categoryKeys = Object.keys(CATEGORY_DETAILS);

  const filteredCategories = categoryKeys.filter((key) => {
    const details = CATEGORY_DETAILS[key];
    const matchName = key.toLowerCase().includes(searchQuery.toLowerCase());
    const matchDesc = details.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchSub = details.subcategories.some((sub) =>
      sub.toLowerCase().includes(searchQuery.toLowerCase())
    );
    return matchName || matchDesc || matchSub;
  });

  const handleCategoryClick = (categoryName: string) => {
    onSelectCategory(categoryName);
    onNavigatePage('shop', '/shop');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFA] pb-16">
      {/* Top Breadcrumb & Page Header Banner */}
      <section className="bg-gradient-to-r from-[#042f24] via-[#064e3b] to-[#0f766e] text-white py-8 sm:py-12 px-3 sm:px-4 lg:px-4 border-b border-teal-600/30">
        <div className="max-w-[1720px] mx-auto">
          {/* Breadcrumb Navigation */}
          <div className="flex items-center gap-2 text-xs text-emerald-200/80 mb-4 font-medium">
            <button
              type="button"
              onClick={() => onNavigatePage('home', '/')}
              className="hover:text-white transition-colors cursor-pointer flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Home</span>
            </button>
            <ChevronRight className="w-3 h-3 text-emerald-400/60" />
            <span className="text-white font-bold">All Categories</span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="max-w-2xl space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 border border-teal-400/30 text-emerald-200 text-xs font-bold uppercase tracking-wider">
                <Grid className="w-3.5 h-3.5 text-emerald-300" />
                <span>Marketplace Taxonomy</span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white font-display">
                All Marketplace Categories
              </h1>
              <p className="text-sm sm:text-base text-emerald-100/90 leading-relaxed font-normal">
                Explore our full spectrum of departments across retail stores, B2B wholesale MOQs, and foreign direct import listings.
              </p>
            </div>

            {/* Quick Category Search Input */}
            <div className="w-full lg:max-w-md">
              <div className="relative bg-white/10 backdrop-blur-md rounded-2xl p-1.5 border border-white/20 shadow-xl">
                <div className="relative flex items-center">
                  <Search className="w-5 h-5 text-emerald-200 absolute left-3.5 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search categories (e.g. Fashion, Electronics, Tools)..."
                    className="w-full pl-11 pr-4 py-3 text-xs sm:text-sm text-white placeholder-emerald-200/60 bg-transparent rounded-xl focus:outline-none"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="pr-3 text-xs text-emerald-300 hover:text-white font-bold cursor-pointer"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Categories Grid Container */}
      <main className="max-w-[1720px] mx-auto px-3 sm:px-4 lg:px-4 py-8 sm:py-10">
        {/* Statistics Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 mb-8 border-b border-slate-200/80">
          <div className="flex items-center gap-2 text-slate-800 font-extrabold text-sm sm:text-base">
            <Layers className="w-5 h-5 text-[#008080]" />
            <span>Showing {filteredCategories.length} Categories</span>
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold text-slate-500">
            <span className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Verified Vendors
            </span>
            <span className="flex items-center gap-1.5 text-teal-700 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
              <PackageCheck className="w-3.5 h-3.5 text-teal-600" />
              Direct Product Filter
            </span>
          </div>
        </div>

        {/* Categories Grid */}
        {filteredCategories.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
            {filteredCategories.map((catKey) => {
              const details = CATEGORY_DETAILS[catKey];
              const IconComp = details.icon;

              return (
                <div
                  key={catKey}
                  onClick={() => handleCategoryClick(details.fullName)}
                  className="bg-white rounded-2xl border border-slate-200/90 hover:border-[#008080] shadow-sm hover:shadow-xl transition-all duration-300 p-5 sm:p-6 flex flex-col justify-between cursor-pointer group hover:-translate-y-1 relative overflow-hidden"
                >
                  {/* Subtle top color gradient strip */}
                  <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${details.color}`} />

                  <div>
                    {/* Header: Icon badge & Tag */}
                    <div className="flex items-center justify-between gap-3 mb-4 pt-1">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center bg-teal-50 text-[#008080] group-hover:bg-[#008080] group-hover:text-white transition-all duration-300 shadow-xs border border-teal-100`}>
                        <IconComp className="w-6 h-6" />
                      </div>

                      <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200 group-hover:bg-teal-50 group-hover:text-[#008080] group-hover:border-teal-200 transition-colors uppercase tracking-wider">
                        {details.badge}
                      </span>
                    </div>

                    {/* Category Title & Product Count */}
                    <h2 className="text-base sm:text-lg font-black text-slate-900 group-hover:text-[#008080] transition-colors tracking-tight font-display mb-1.5">
                      {details.fullName}
                    </h2>

                    <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 mb-4">
                      {details.description}
                    </p>

                    {/* Subcategories tags list */}
                    <div className="space-y-1.5 mb-5">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                        <Tag className="w-2.5 h-2.5 text-[#008080]" /> Popular Sub-Items
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {details.subcategories.map((sub, idx) => (
                          <span
                            key={idx}
                            className="text-[11px] font-medium text-slate-600 bg-slate-50 group-hover:bg-teal-50/60 px-2 py-0.5 rounded-md border border-slate-200/60 group-hover:border-teal-200/60 transition-colors"
                          >
                            {sub}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Bottom Action Footer */}
                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-extrabold text-[#008080] tabular-nums">
                      {details.productCount}
                    </span>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCategoryClick(details.fullName);
                      }}
                      className="inline-flex items-center gap-1.5 text-xs font-black text-[#008080] group-hover:text-[#006666] bg-teal-50 group-hover:bg-[#008080] group-hover:text-white px-3 py-1.5 rounded-xl transition-all shadow-2xs group-hover:shadow-md cursor-pointer"
                    >
                      <span>Explore</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-16 text-center bg-white rounded-2xl border border-slate-200 shadow-xs max-w-lg mx-auto p-8">
            <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">No Categories Found</h3>
            <p className="text-xs text-slate-500 mb-6">
              No matching departments found for "{searchQuery}". Try searching for another category term.
            </p>
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="px-4 py-2 bg-[#008080] text-white text-xs font-bold rounded-xl hover:bg-[#006666] transition-colors cursor-pointer"
            >
              Reset Category Search
            </button>
          </div>
        )}
      </main>
    </div>
  );
};
