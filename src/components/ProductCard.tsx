import React, { useState } from 'react';
import { Star, ShoppingBag, Eye, Heart, ShieldCheck, Globe, Package } from 'lucide-react';
import { Product } from '../types/marketplace';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onBuyNow: (product: Product) => void;
  onToggleWishlist: (product: Product) => void;
  isWishlisted?: boolean;
  onQuickView: (product: Product) => void;
  compact?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToCart,
  onBuyNow,
  onToggleWishlist,
  isWishlisted = false,
  onQuickView,
  compact = false,
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  return (
    <div className="group relative flex flex-col bg-white rounded-xl border border-slate-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_24px_rgba(0,128,128,0.12)] transition-all duration-300 overflow-hidden hover:-translate-y-1">
      {/* Segment Badge & Wishlist Top Bar */}
      <div className="relative aspect-[4/3] w-full bg-[#f4f7f7] overflow-hidden">
        {/* Fallback pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-100 to-teal-50/40 flex items-center justify-center">
          <Package className="w-10 h-10 text-teal-800/20" />
        </div>

        {/* Product image */}
        {!imageError && (
          <img
            src={product.image}
            alt={product.title}
            referrerPolicy="no-referrer"
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
            className={`w-full h-full object-cover object-center transition-all duration-500 group-hover:scale-105 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          />
        )}

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10">
          {product.segment === 'wholesale' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-amber-900 bg-amber-100/95 backdrop-blur-sm rounded-md shadow-xs">
              <Package className="w-3 h-3 text-amber-700" />
              Wholesale · MOQ {product.moq || 50}
            </span>
          )}
          {product.segment === 'import' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-teal-900 bg-teal-100/95 backdrop-blur-sm rounded-md shadow-xs">
              <Globe className="w-3 h-3 text-[#008080]" />
              Import · {product.originCountry || 'Global'}
            </span>
          )}
          {product.segment === 'retail' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-emerald-900 bg-emerald-100/95 backdrop-blur-sm rounded-md shadow-xs">
              Retail · In Stock
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleWishlist(product);
          }}
          className={`absolute top-2.5 right-2.5 z-10 w-9 h-9 rounded-full flex items-center justify-center transition-all shadow-sm ${
            isWishlisted
              ? 'bg-rose-50 text-rose-600 scale-105'
              : 'bg-white/90 text-slate-600 hover:text-rose-600 hover:bg-white'
          }`}
          title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
        >
          <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-rose-500 text-rose-500' : ''}`} />
        </button>

        {/* Quick View Overlay Button */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-4">
          <button
            type="button"
            onClick={() => onQuickView(product)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-900 bg-white/95 rounded-lg shadow-md hover:bg-[#008080] hover:text-white transition-colors"
          >
            <Eye className="w-3.5 h-3.5" />
            Quick View
          </button>
        </div>
      </div>

      {/* Product Content Details */}
      <div className="flex flex-col flex-1 p-4">
        {/* Category & Seller info */}
        <div className="flex items-center justify-between gap-2 text-xs text-slate-500 mb-1.5">
          <span className="truncate hover:text-[#008080] transition-colors cursor-pointer">
            {product.category}
          </span>
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600 truncate max-w-[120px]">
            <ShieldCheck className="w-3 h-3 text-[#008080] shrink-0" />
            {product.seller.name}
          </span>
        </div>

        {/* Title */}
        <h3
          onClick={() => onQuickView(product)}
          className="text-sm font-semibold text-slate-900 line-clamp-2 hover:text-[#008080] transition-colors cursor-pointer mb-2 leading-snug min-h-[2.5rem]"
          title={product.title}
        >
          {product.title}
        </h3>

        {/* Star Rating & Reviews */}
        <div className="flex items-center gap-1.5 mb-3 text-xs">
          <div className="flex items-center text-amber-400">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-3.5 h-3.5 ${
                  i < Math.floor(product.rating)
                    ? 'fill-amber-400 text-amber-400'
                    : 'text-slate-200'
                }`}
              />
            ))}
          </div>
          <span className="font-semibold text-slate-800 tabular-nums">{product.rating}</span>
          <span className="text-slate-400">({product.reviewsCount})</span>
        </div>

        {/* Price Row */}
        <div className="mt-auto pt-2 border-t border-slate-100 flex items-baseline justify-between gap-2">
          <div className="flex items-baseline gap-1.5">
            <span className="text-lg font-bold text-[#008080] tabular-nums">
              ${product.price.toFixed(2)}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-xs text-slate-400 line-through tabular-nums">
                ${product.originalPrice.toFixed(2)}
              </span>
            )}
          </div>
          {product.segment === 'wholesale' && (
            <span className="text-[11px] font-medium text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">
              per unit
            </span>
          )}
          {product.segment === 'import' && (
            <span className="text-[11px] font-medium text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded">
              Duty Free
            </span>
          )}
        </div>

        {/* Action Buttons: Add to Cart / Buy Now */}
        <div className="mt-3.5 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => onAddToCart(product)}
            className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#008080] bg-[#008080]/10 hover:bg-[#008080] hover:text-white rounded-lg transition-colors border border-[#008080]/20"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span className="truncate">Add to Cart</span>
          </button>

          <button
            type="button"
            onClick={() => onBuyNow(product)}
            className="flex items-center justify-center px-3 py-2 text-xs font-semibold text-white bg-[#008080] hover:bg-[#006666] rounded-lg transition-colors shadow-xs"
          >
            <span className="truncate">Buy Now</span>
          </button>
        </div>
      </div>
    </div>
  );
};
