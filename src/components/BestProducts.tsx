import React, { useState } from 'react';
import { Award, ChevronDown } from 'lucide-react';
import { Product } from '../types/marketplace';
import { ProductCard } from './ProductCard';

interface BestProductsProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
  onBuyNow: (product: Product) => void;
  onToggleWishlist: (product: Product) => void;
  wishlistIds: string[];
  onQuickView: (product: Product) => void;
}

export const BestProducts: React.FC<BestProductsProps> = ({
  products,
  onAddToCart,
  onBuyNow,
  onToggleWishlist,
  wishlistIds,
  onQuickView,
}) => {
  const [displayCount, setDisplayCount] = useState(8);

  const bestItems = products.filter((p) => p.isBestProduct);
  const visibleProducts = bestItems.slice(0, displayCount);
  const hasMore = displayCount < bestItems.length;

  const handleSeeMore = () => {
    setDisplayCount((prev) => Math.min(prev + 4, bestItems.length));
  };

  return (
    <section id="best-products" className="py-14 bg-white border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 text-[#008080] text-xs font-bold uppercase tracking-wider mb-2">
            <Award className="w-3.5 h-3.5 text-[#008080]" />
            Customer Favorites
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight font-display">
            Best Products Section
          </h2>
          <p className="text-sm text-slate-500 mt-2">
            Top-rated products curated from top vendors with proven reliability and 4.7+ star reviews.
          </p>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {visibleProducts.map((product) => (
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

        {/* 'See More Products' Button at bottom */}
        {hasMore && (
          <div className="mt-10 text-center">
            <button
              type="button"
              onClick={handleSeeMore}
              className="inline-flex items-center gap-2 px-8 py-3.5 text-sm font-bold text-white bg-[#008080] hover:bg-[#006666] active:scale-95 rounded-xl shadow-md shadow-[#008080]/20 hover:shadow-lg transition-all cursor-pointer"
            >
              <span>See More Products</span>
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
