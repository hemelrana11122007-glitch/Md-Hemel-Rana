import React, { useState, useMemo } from 'react';
import { ProductCard } from '../components/ProductCard';
import { Product } from '../types/marketplace';
import {
  Package,
  Boxes,
  Truck,
  ShieldCheck,
  ChevronDown,
  CheckCircle2,
  Send,
  FileText,
  BadgePercent
} from 'lucide-react';

interface WholesalePageProps {
  products: Product[];
  onAddToCart: (product: Product, quantity?: number) => void;
  onBuyNow: (product: Product, quantity?: number) => void;
  onToggleWishlist: (product: Product) => void;
  wishlistIds: string[];
  onQuickView: (product: Product) => void;
  searchQuery: string;
}

export const WholesalePage: React.FC<WholesalePageProps> = ({
  products,
  onAddToCart,
  onBuyNow,
  onToggleWishlist,
  wishlistIds,
  onQuickView,
  searchQuery,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [moqRange, setMoqRange] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'featured' | 'price-low' | 'price-high' | 'moq-low'>('featured');

  // Filter strictly to wholesale products
  const wholesaleProducts = useMemo(() => {
    let list = products.filter((p) => p.segment === 'wholesale');

    if (selectedCategory) {
      list = list.filter((p) => p.category === selectedCategory);
    }

    if (moqRange === 'low') {
      list = list.filter((p) => (p.moq || 50) <= 50);
    } else if (moqRange === 'medium') {
      list = list.filter((p) => (p.moq || 50) > 50 && (p.moq || 50) <= 150);
    } else if (moqRange === 'high') {
      list = list.filter((p) => (p.moq || 50) > 150);
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
    } else if (sortBy === 'moq-low') {
      list.sort((a, b) => (a.moq || 50) - (b.moq || 50));
    }

    return list;
  }, [products, selectedCategory, moqRange, searchQuery, sortBy]);

  const categories = useMemo(() => {
    const allWholesale = products.filter((p) => p.segment === 'wholesale');
    return Array.from(new Set(allWholesale.map((p) => p.category)));
  }, [products]);

  return (
    <div className="py-8 bg-[#F8FAFA] min-h-[calc(100vh-200px)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
          <span>Home</span>
          <span>/</span>
          <span className="text-[#008080] font-semibold">Wholesale B2B (wholesale.html)</span>
        </div>

        {/* Hero Banner for Wholesale Page */}
        <div className="bg-gradient-to-r from-amber-950 via-slate-900 to-[#008080] rounded-3xl p-6 sm:p-10 text-white shadow-lg mb-8 relative overflow-hidden">
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold uppercase tracking-wider mb-3 border border-amber-400/30">
              <Boxes className="w-3.5 h-3.5" />
              <span>পাইকারি ও B2B মার্কেট · Factory Bulk</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold font-display tracking-tight text-white leading-tight">
              Wholesale B2B Bulk Inventory & MOQs
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-slate-200 leading-relaxed">
              Connect directly with verified industrial manufacturers and bulk distributors. Transparent Minimum Order Quantities (MOQ), volume tier discounts, commercial invoicing, and container freight support.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5 text-amber-300">
                <BadgePercent className="w-4 h-4" />
                <span>Save 25%–50% Bulk Margin</span>
              </div>
              <div className="flex items-center gap-1.5 text-amber-300">
                <FileText className="w-4 h-4" />
                <span>Commercial Tax Invoice</span>
              </div>
              <div className="flex items-center gap-1.5 text-amber-300">
                <Truck className="w-4 h-4" />
                <span>Freight Logistics Consolidated</span>
              </div>
            </div>
          </div>

          <div className="absolute right-0 bottom-0 top-0 w-1/3 bg-amber-500/10 blur-3xl rounded-full pointer-events-none" />
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
              All Bulk ({products.filter((p) => p.segment === 'wholesale').length})
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

          <div className="flex items-center gap-3 ml-auto">
            {/* MOQ filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 font-medium">MOQ:</span>
              <select
                value={moqRange}
                onChange={(e) => setMoqRange(e.target.value)}
                className="appearance-none pl-2.5 pr-6 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-700 focus:outline-none focus:border-[#008080] cursor-pointer"
              >
                <option value="all">All MOQs</option>
                <option value="low">MOQ ≤ 50 pcs</option>
                <option value="medium">MOQ 51–150 pcs</option>
                <option value="high">MOQ &gt; 150 pcs</option>
              </select>
            </div>

            {/* Sort */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 font-medium">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="appearance-none pl-2.5 pr-6 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-700 focus:outline-none focus:border-[#008080] cursor-pointer"
              >
                <option value="featured">Featured</option>
                <option value="moq-low">Lowest MOQ First</option>
                <option value="price-low">Unit Price: Low to High</option>
                <option value="price-high">Unit Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* Wholesale Products Grid */}
        {wholesaleProducts.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center flex flex-col items-center justify-center">
            <Package className="w-12 h-12 text-slate-300 mb-3" />
            <h3 className="text-base font-bold text-slate-800">No wholesale lots match criteria</h3>
            <p className="text-xs text-slate-400 mt-1">Try broadening your MOQ range or category filter.</p>
            <button
              type="button"
              onClick={() => {
                setSelectedCategory(null);
                setMoqRange('all');
              }}
              className="mt-4 px-4 py-2 text-xs font-bold text-white bg-[#008080] rounded-xl"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {wholesaleProducts.map((product) => (
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

        {/* B2B RFQ Assistance Callout */}
        <div className="mt-12 bg-white rounded-2xl border border-amber-200/80 p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xs">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0 border border-amber-200">
              <FileText className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Need Custom OEM / Private Label or Container Loads?
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Our multi-vendor enterprise team facilitates custom factory orders, contracts, and letter of credit (LC) terms.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => alert('Wholesale RFQ Desk: Please email wholesale@armarketbd.com or contact Jane Wholesaler via store profile.')}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-[#008080] hover:bg-[#006666] rounded-xl shadow-xs transition-colors shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Request Custom B2B Quote</span>
          </button>
        </div>
      </div>
    </div>
  );
};
