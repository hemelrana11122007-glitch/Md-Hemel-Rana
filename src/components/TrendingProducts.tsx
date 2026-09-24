import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight, Flame } from 'lucide-react';
import { Product } from '../types/marketplace';
import { ProductCard } from './ProductCard';

interface TrendingProductsProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
  onBuyNow: (product: Product) => void;
  onToggleWishlist: (product: Product) => void;
  wishlistIds: string[];
  onQuickView: (product: Product) => void;
}

export const TrendingProducts: React.FC<TrendingProductsProps> = ({
  products,
  onAddToCart,
  onBuyNow,
  onToggleWishlist,
  wishlistIds,
  onQuickView,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const offset = direction === 'left' ? -340 : 340;
      scrollContainerRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  const trendingItems = products.filter((p) => p.isTrending);

  return (
    <section id="trending" className="py-12 bg-[#F8FAFA] border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-teal-50 text-[#008080] flex items-center justify-center">
              <Flame className="w-5 h-5 text-[#008080]" />
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-[#008080]">
                Hot Picks This Week
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight font-display">
                Trending Products
              </h2>
            </div>
          </div>

          {/* Scroll Navigation Arrows */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => scroll('left')}
              className="w-9 h-9 rounded-lg bg-white hover:bg-teal-50 hover:text-[#008080] border border-slate-200 text-slate-600 flex items-center justify-center shadow-xs transition-colors cursor-pointer"
              title="Scroll left"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => scroll('right')}
              className="w-9 h-9 rounded-lg bg-white hover:bg-teal-50 hover:text-[#008080] border border-slate-200 text-slate-600 flex items-center justify-center shadow-xs transition-colors cursor-pointer"
              title="Scroll right"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Horizontal Scroll Track */}
        <div
          ref={scrollContainerRef}
          className="flex gap-6 overflow-x-auto pb-4 pt-1 no-scrollbar scroll-smooth snap-x snap-mandatory"
        >
          {trendingItems.map((product) => (
            <div
              key={product.id}
              className="w-[280px] sm:w-[320px] shrink-0 snap-start"
            >
              <ProductCard
                product={product}
                onAddToCart={onAddToCart}
                onBuyNow={onBuyNow}
                onToggleWishlist={onToggleWishlist}
                isWishlisted={wishlistIds.includes(product.id)}
                onQuickView={onQuickView}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
