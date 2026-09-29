import React from 'react';
import { Sparkles } from 'lucide-react';
import { Product } from '../types/marketplace';
import { ProductCard } from './ProductCard';

interface FeaturedProductsProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
  onBuyNow: (product: Product) => void;
  onToggleWishlist: (product: Product) => void;
  wishlistIds: string[];
  onQuickView: (product: Product) => void;
}

export const FeaturedProducts: React.FC<FeaturedProductsProps> = ({
  products,
  onAddToCart,
  onBuyNow,
  onToggleWishlist,
  wishlistIds,
  onQuickView,
}) => {
  const featuredItems = products.filter((p) => p.isFeatured === true);

  if (featuredItems.length === 0) {
    return null; // Keep completely hidden if no featured products exist
  }

  return (
    <section id="featured-products" className="py-8 sm:py-10 bg-gradient-to-b from-[#008080]/5 to-transparent border-b border-slate-100 scroll-mt-24">
      <div className="max-w-[1720px] mx-auto px-3 sm:px-4 lg:px-4">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 text-[#008080] text-xs font-bold uppercase tracking-wider mb-2 animate-bounce">
            <Sparkles className="w-3.5 h-3.5 text-[#008080]" />
            Promoted Highlights
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight font-display">
            Featured Products Section
          </h2>
          <p className="text-sm text-slate-500 mt-2">
            Specially highlighted items verified by our quality assurance team for fast-tracked elite delivery.
          </p>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredItems.map((product) => (
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
      </div>
    </section>
  );
};
