import React, { useState, useMemo } from 'react';
import { ProductCard } from '../components/ProductCard';
import { Product, ProductSegment } from '../types/marketplace';
import {
  SlidersHorizontal,
  ChevronDown,
  ShoppingBag,
  Package,
  Globe,
  Grid,
  Sparkles,
  RotateCcw
} from 'lucide-react';

interface ShopPageProps {
  products: Product[];
  onAddToCart: (product: Product, quantity?: number) => void;
  onBuyNow: (product: Product, quantity?: number) => void;
  onToggleWishlist: (product: Product) => void;
  wishlistIds: string[];
  onQuickView: (product: Product) => void;
  searchQuery: string;
  selectedCategory: string | null;
  onSelectCategory: (cat: string | null) => void;
  initialSegment?: 'all' | ProductSegment;
}

export const ShopPage: React.FC<ShopPageProps> = ({
  products,
  onAddToCart,
  onBuyNow,
  onToggleWishlist,
  wishlistIds,
  onQuickView,
  searchQuery,
  selectedCategory,
  onSelectCategory,
  initialSegment = 'all',
}) => {
  const [activeSegment, setActiveSegment] = useState<'all' | ProductSegment>(initialSegment);
  const [sortBy, setSortBy] = useState<'featured' | 'price-low' | 'price-high' | 'rating'>('featured');
  const [inStockOnly, setInStockOnly] = useState(false);

  // Extract unique categories for filter
  const categories = useMemo(() => {
    return Array.from(new Set(products.map((p) => p.category)));
  }, [products]);

  // Filter products
  const filteredProducts = useMemo(() => {
    let result = products.filter((p) => {
      const matchSegment = activeSegment === 'all' || p.segment === activeSegment;
      const matchCategory = !selectedCategory || p.category === selectedCategory;
      const matchSearch =
        !searchQuery ||
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.seller.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStock = !inStockOnly || p.inStock;

      return matchSegment && matchCategory && matchSearch && matchStock;
    });

    // Sorting
    if (sortBy === 'price-low') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
      result.sort((a, b) => b.rating - a.rating);
    }

    return result;
  }, [products, activeSegment, selectedCategory, searchQuery, inStockOnly, sortBy]);

  const segmentCounts = useMemo(() => {
    return {
      all: products.length,
      retail: products.filter((p) => p.segment === 'retail').length,
      wholesale: products.filter((p) => p.segment === 'wholesale').length,
      import: products.filter((p) => p.segment === 'import').length,
    };
  }, [products]);

  return (
    <div className="py-8 bg-[#F8FAFA] min-h-[calc(100vh-200px)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb & Header Banner */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
            <span>Home</span>
            <span>/</span>
            <span className="text-[#008080] font-semibold">Shop Catalog</span>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#008080] bg-teal-50 px-2.5 py-1 rounded-md mb-2">
                  <Sparkles className="w-3.5 h-3.5 text-[#008080]" />
                  <span>Multi-Vendor Unified Catalog</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display tracking-tight">
                  Explore All Products
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
                  Filter effortlessly between retail single items, B2B wholesale bulk crates with volume pricing, and pre-cleared direct imports.
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span className="font-bold text-slate-900 tabular-nums text-lg">
                  {filteredProducts.length}
                </span>
                <span>products found</span>
              </div>
            </div>

            {/* Segment Filter (CRUCIAL Requirement) */}
            <div className="mt-6 pt-6 border-t border-slate-100">
              <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                <SlidersHorizontal className="w-3.5 h-3.5 text-[#008080]" />
                <span>Filter by Product Segment</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {/* All */}
                <button
                  type="button"
                  onClick={() => setActiveSegment('all')}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl border font-semibold text-xs transition-all cursor-pointer ${
                    activeSegment === 'all'
                      ? 'bg-[#008080] text-white border-[#008080] shadow-sm'
                      : 'bg-slate-50 hover:bg-teal-50/50 text-slate-700 border-slate-200/80'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Grid className="w-4 h-4" />
                    <span>All Products</span>
                  </div>
                  <span
                    className={`text-[11px] px-2 py-0.5 rounded-full font-bold tabular-nums ${
                      activeSegment === 'all'
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {segmentCounts.all}
                  </span>
                </button>

                {/* Retail Only */}
                <button
                  type="button"
                  onClick={() => setActiveSegment('retail')}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl border font-semibold text-xs transition-all cursor-pointer ${
                    activeSegment === 'retail'
                      ? 'bg-[#008080] text-white border-[#008080] shadow-sm'
                      : 'bg-slate-50 hover:bg-emerald-50/50 text-slate-700 border-slate-200/80'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4 text-emerald-500" />
                    <span>Retail Only</span>
                  </div>
                  <span
                    className={`text-[11px] px-2 py-0.5 rounded-full font-bold tabular-nums ${
                      activeSegment === 'retail'
                        ? 'bg-white/20 text-white'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {segmentCounts.retail}
                  </span>
                </button>

                {/* Wholesale Only */}
                <button
                  type="button"
                  onClick={() => setActiveSegment('wholesale')}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl border font-semibold text-xs transition-all cursor-pointer ${
                    activeSegment === 'wholesale'
                      ? 'bg-[#008080] text-white border-[#008080] shadow-sm'
                      : 'bg-slate-50 hover:bg-amber-50/50 text-slate-700 border-slate-200/80'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-amber-500" />
                    <span>Wholesale Only</span>
                  </div>
                  <span
                    className={`text-[11px] px-2 py-0.5 rounded-full font-bold tabular-nums ${
                      activeSegment === 'wholesale'
                        ? 'bg-white/20 text-white'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {segmentCounts.wholesale}
                  </span>
                </button>

                {/* Import Only */}
                <button
                  type="button"
                  onClick={() => setActiveSegment('import')}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl border font-semibold text-xs transition-all cursor-pointer ${
                    activeSegment === 'import'
                      ? 'bg-[#008080] text-white border-[#008080] shadow-sm'
                      : 'bg-slate-50 hover:bg-teal-50/50 text-slate-700 border-slate-200/80'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-[#008080]" />
                    <span>Import Only</span>
                  </div>
                  <span
                    className={`text-[11px] px-2 py-0.5 rounded-full font-bold tabular-nums ${
                      activeSegment === 'import'
                        ? 'bg-white/20 text-white'
                        : 'bg-teal-100 text-teal-800'
                    }`}
                  >
                    {segmentCounts.import}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Filters Toolbar: Category, Sort, Stock */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-3.5 mb-6 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            {/* Category dropdown */}
            <div className="relative">
              <select
                value={selectedCategory || ''}
                onChange={(e) => onSelectCategory(e.target.value || null)}
                className="appearance-none pl-3 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-700 focus:outline-none focus:border-[#008080] cursor-pointer"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* In stock toggle */}
            <label className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-100 text-slate-700 select-none">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="rounded text-[#008080] focus:ring-[#008080] h-3.5 w-3.5"
              />
              <span>In Stock Only</span>
            </label>

            {/* Reset button if active filters */}
            {(activeSegment !== 'all' || selectedCategory || inStockOnly || searchQuery) && (
              <button
                type="button"
                onClick={() => {
                  setActiveSegment('all');
                  onSelectCategory(null);
                  setInStockOnly(false);
                }}
                className="flex items-center gap-1 px-3 py-2 text-[#008080] hover:text-[#006666] font-semibold hover:bg-teal-50 rounded-lg transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Filters</span>
              </button>
            )}
          </div>

          {/* Sort By Dropdown */}
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-slate-400 font-medium">Sort by:</span>
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="appearance-none pl-3 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-700 focus:outline-none focus:border-[#008080] cursor-pointer"
              >
                <option value="featured">Featured Picks</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Product Grid */}
        {filteredProducts.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center flex flex-col items-center justify-center">
            <ShoppingBag className="w-12 h-12 text-slate-300 mb-3" />
            <h3 className="text-base font-bold text-slate-800">No products match your filters</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm">
              Try switching your segment tab or clearing your category / search terms to view available items.
            </p>
            <button
              type="button"
              onClick={() => {
                setActiveSegment('all');
                onSelectCategory(null);
                setInStockOnly(false);
              }}
              className="mt-4 px-4 py-2 text-xs font-bold text-white bg-[#008080] hover:bg-[#006666] rounded-xl transition-colors cursor-pointer"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={onAddToCart}
                onBuyNow={onBuyNow}
                onToggleWishlist={onToggleWishlist}
                isWishlisted={wishlistIds.includes(product.id)}
                onQuickView={onQuickView}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
