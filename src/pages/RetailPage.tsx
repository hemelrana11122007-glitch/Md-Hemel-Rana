import React, { useState, useMemo } from 'react';
import { ProductCard } from '../components/ProductCard';
import { Product } from '../types/marketplace';
import {
  ShoppingBag,
  ShieldCheck,
  Truck,
  RotateCcw,
  Sparkles,
  ChevronDown,
  CheckCircle2
} from 'lucide-react';

interface RetailPageProps {
  products: Product[];
  onAddToCart: (product: Product, quantity?: number) => void;
  onBuyNow: (product: Product, quantity?: number) => void;
  onToggleWishlist: (product: Product) => void;
  wishlistIds: string[];
  onQuickView: (product: Product) => void;
  searchQuery: string;
}

export const RetailPage: React.FC<RetailPageProps> = ({
  products,
  onAddToCart,
  onBuyNow,
  onToggleWishlist,
  wishlistIds,
  onQuickView,
  searchQuery,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'featured' | 'price-low' | 'price-high' | 'rating'>('featured');

  // Filter strictly to retail products
  const retailProducts = useMemo(() => {
    let list = products.filter((p) => p.segment === 'retail');

    if (selectedCategory) {
      list = list.filter((p) => p.category === selectedCategory);
    }

    if (searchQuery) {
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.seller.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (sortBy === 'price-low') {
      list.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high') {
      list.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
      list.sort((a, b) => b.rating - a.rating);
    }

    return list;
  }, [products, selectedCategory, searchQuery, sortBy]);

  const categories = useMemo(() => {
    const allRetail = products.filter((p) => p.segment === 'retail');
    return Array.from(new Set(allRetail.map((p) => p.category)));
  }, [products]);

  return (
    <div className="py-8 bg-[#F8FAFA] min-h-[calc(100vh-200px)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
          <span>Home</span>
          <span>/</span>
          <span className="text-[#008080] font-semibold">Retail Store (retail.html)</span>
        </div>

        {/* Hero Banner for Retail Page */}
        <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-[#008080] rounded-3xl p-6 sm:p-10 text-white shadow-lg mb-8 relative overflow-hidden">
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-3 border border-emerald-400/30">
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>খুচরা ও রিটেইল বিভাগ · Zero MOQ</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold font-display tracking-tight text-white leading-tight">
              Retail Department: Single Piece Orders
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-slate-200 leading-relaxed">
              Buy directly for personal use or small scale business. Guaranteed in-stock availability, no minimum purchase restrictions, cash on delivery, and 30-day effortless returns.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5 text-emerald-300">
                <CheckCircle2 className="w-4 h-4" />
                <span>MOQ: 1 Unit Only</span>
              </div>
              <div className="flex items-center gap-1.5 text-emerald-300">
                <Truck className="w-4 h-4" />
                <span>24–48h Dispatch</span>
              </div>
              <div className="flex items-center gap-1.5 text-emerald-300">
                <ShieldCheck className="w-4 h-4" />
                <span>100% Genuine Guaranteed</span>
              </div>
            </div>
          </div>

          <div className="absolute right-0 bottom-0 top-0 w-1/3 bg-emerald-500/10 blur-3xl rounded-full pointer-events-none" />
        </div>

        {/* Filter and stats row */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-3.5 mb-6 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setSelectedCategory(null)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                selectedCategory === null
                  ? 'bg-[#008080] text-white shadow-xs'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700'
              }`}
            >
              All Retail ({products.filter((p) => p.segment === 'retail').length})
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  selectedCategory === cat
                    ? 'bg-[#008080] text-white shadow-xs'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <span className="text-slate-400 font-medium">Sort:</span>
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="appearance-none pl-3 pr-8 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-700 focus:outline-none focus:border-[#008080] cursor-pointer"
              >
                <option value="featured">Featured</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Top Rated</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Retail Products Grid */}
        {retailProducts.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center flex flex-col items-center justify-center">
            <ShoppingBag className="w-12 h-12 text-slate-300 mb-3" />
            <h3 className="text-base font-bold text-slate-800">No retail products found</h3>
            <p className="text-xs text-slate-400 mt-1">Try resetting your category or search filter.</p>
            <button
              type="button"
              onClick={() => setSelectedCategory(null)}
              className="mt-4 px-4 py-2 text-xs font-bold text-white bg-[#008080] rounded-xl"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {retailProducts.map((product) => (
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
