import React, { useState, useMemo } from 'react';
import { ProductCard } from '../components/ProductCard';
import { Product } from '../types/marketplace';
import {
  Globe,
  Plane,
  ShieldCheck,
  ChevronDown,
  CheckCircle2,
  MapPin,
  Clock
} from 'lucide-react';

interface ImportPageProps {
  products: Product[];
  onAddToCart: (product: Product, quantity?: number) => void;
  onBuyNow: (product: Product, quantity?: number) => void;
  onToggleWishlist: (product: Product) => void;
  wishlistIds: string[];
  onQuickView: (product: Product) => void;
  searchQuery: string;
}

export const ImportPage: React.FC<ImportPageProps> = ({
  products,
  onAddToCart,
  onBuyNow,
  onToggleWishlist,
  wishlistIds,
  onQuickView,
  searchQuery,
}) => {
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'featured' | 'price-low' | 'price-high' | 'rating'>('featured');

  // Filter strictly to import products
  const importProducts = useMemo(() => {
    let list = products.filter((p) => p.segment === 'import');

    if (selectedCountry) {
      list = list.filter((p) => p.originCountry === selectedCountry);
    }

    if (searchQuery) {
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (p.originCountry && p.originCountry.toLowerCase().includes(searchQuery.toLowerCase())) ||
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
  }, [products, selectedCountry, searchQuery, sortBy]);

  const originCountries = useMemo(() => {
    const allImports = products.filter((p) => p.segment === 'import');
    const countries = allImports.map((p) => p.originCountry).filter(Boolean) as string[];
    return Array.from(new Set(countries));
  }, [products]);

  return (
    <div className="py-8 bg-[#F8FAFA] min-h-[calc(100vh-200px)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
          <span>Home</span>
          <span>/</span>
          <span className="text-[#008080] font-semibold">Direct Imports (import.html)</span>
        </div>

        {/* Hero Banner for Import Page */}
        <div className="bg-gradient-to-r from-teal-950 via-slate-900 to-[#008080] rounded-3xl p-6 sm:p-10 text-white shadow-lg mb-8 relative overflow-hidden">
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-bold uppercase tracking-wider mb-3 border border-teal-400/30">
              <Globe className="w-3.5 h-3.5" />
              <span>গ্লোবাল ইম্পোর্ট বিভাগ · Bonded Customs Cleared</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold font-display tracking-tight text-white leading-tight">
              Cross-Border Direct Foreign Imports
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-slate-200 leading-relaxed">
              Procure certified authentic goods directly imported from Switzerland, Germany, Japan, South Korea, and Italy. Pre-cleared import tariffs, authentic certificates, and rapid air express shipping to your door.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5 text-teal-300">
                <Plane className="w-4 h-4" />
                <span>Express Air Transit (3–7 Days)</span>
              </div>
              <div className="flex items-center gap-1.5 text-teal-300">
                <ShieldCheck className="w-4 h-4" />
                <span>Customs & Tariff Pre-Paid</span>
              </div>
              <div className="flex items-center gap-1.5 text-teal-300">
                <CheckCircle2 className="w-4 h-4" />
                <span>100% Genuine Origin Authenticated</span>
              </div>
            </div>
          </div>

          <div className="absolute right-0 bottom-0 top-0 w-1/3 bg-teal-500/10 blur-3xl rounded-full pointer-events-none" />
        </div>

        {/* Country of Origin Filter Row */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-3.5 mb-6 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-slate-400 font-medium mr-1 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-[#008080]" />
              Origin:
            </span>
            <button
              type="button"
              onClick={() => setSelectedCountry(null)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                selectedCountry === null
                  ? 'bg-[#008080] text-white shadow-xs'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700'
              }`}
            >
              All Countries ({products.filter((p) => p.segment === 'import').length})
            </button>
            {originCountries.map((country) => (
              <button
                key={country}
                type="button"
                onClick={() => setSelectedCountry(country)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
                  selectedCountry === country
                    ? 'bg-[#008080] text-white shadow-xs'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700'
                }`}
              >
                <span>{country}</span>
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

        {/* Import Products Grid */}
        {importProducts.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center flex flex-col items-center justify-center">
            <Globe className="w-12 h-12 text-slate-300 mb-3" />
            <h3 className="text-base font-bold text-slate-800">No imported goods match filters</h3>
            <p className="text-xs text-slate-400 mt-1">Try resetting your country of origin selection.</p>
            <button
              type="button"
              onClick={() => setSelectedCountry(null)}
              className="mt-4 px-4 py-2 text-xs font-bold text-white bg-[#008080] rounded-xl"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {importProducts.map((product) => (
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
