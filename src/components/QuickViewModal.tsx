import React, { useState } from 'react';
import { X, Star, ShieldCheck, ShoppingBag, Globe, Package, Truck, ArrowRight, Heart } from 'lucide-react';
import { Product } from '../types/marketplace';

interface QuickViewModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
  onBuyNow: (product: Product, quantity: number) => void;
  onToggleWishlist: (product: Product) => void;
  isWishlisted: boolean;
}

export const QuickViewModal: React.FC<QuickViewModalProps> = ({
  product,
  onClose,
  onAddToCart,
  onBuyNow,
  onToggleWishlist,
  isWishlisted,
}) => {
  const [quantity, setQuantity] = useState(1);

  if (!product) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden z-10 animate-in zoom-in-95 duration-200">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-white/90 text-slate-500 hover:text-slate-900 flex items-center justify-center shadow-md transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Image Column */}
          <div className="relative bg-slate-100 aspect-square md:aspect-auto">
            <img
              src={product.image}
              alt={product.title}
              className="w-full h-full object-cover"
            />
            {/* Top Badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-1.5">
              <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#008080] bg-white/90 backdrop-blur-sm rounded-md shadow-xs">
                {product.segment.toUpperCase()}
              </span>
              {product.originCountry && (
                <span className="px-3 py-1 text-xs font-bold text-slate-800 bg-white/90 backdrop-blur-sm rounded-md shadow-xs">
                  {product.originCountry}
                </span>
              )}
            </div>
          </div>

          {/* Details Column */}
          <div className="p-6 sm:p-8 flex flex-col justify-between">
            <div>
              {/* Category & Seller */}
              <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                <span>{product.category}</span>
                <span className="flex items-center gap-1 font-medium text-slate-700">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#008080]" />
                  {product.seller.name} ({product.seller.badge})
                </span>
              </div>

              {/* Title */}
              <h2 className="text-xl font-bold text-slate-900 font-display leading-snug">
                {product.title}
              </h2>

              {/* Star Rating */}
              <div className="flex items-center gap-2 mt-2 text-xs">
                <div className="flex items-center text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.floor(product.rating)
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-slate-200'
                      }`}
                    />
                  ))}
                </div>
                <span className="font-bold text-slate-800 tabular-nums">{product.rating}</span>
                <span className="text-slate-400">({product.reviewsCount} customer reviews)</span>
              </div>

              {/* Price */}
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-2xl font-black text-[#008080] tabular-nums font-display">
                  ${product.price.toFixed(2)}
                </span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <span className="text-sm text-slate-400 line-through tabular-nums">
                    ${product.originalPrice.toFixed(2)}
                  </span>
                )}
                {product.segment === 'wholesale' && (
                  <span className="text-xs text-amber-700 bg-amber-50 px-2 py-0.5 rounded font-semibold">
                    Wholesale MOQ: {product.moq || 50} units
                  </span>
                )}
              </div>

              {/* Description */}
              <p className="mt-4 text-xs text-slate-600 leading-relaxed">
                {product.description}
              </p>

              {/* Segment specific highlights */}
              <div className="mt-4 p-3 bg-slate-50 rounded-xl space-y-2 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <Truck className="w-3.5 h-3.5 text-[#008080]" />
                  <span>
                    {product.shippingTime || 'Standard 48-Hour Merchant Dispatch'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>100% Guaranteed Authentic & Escrow Protected</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 pt-4 border-t border-slate-100 space-y-3">
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-slate-200 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="px-3 py-1.5 text-sm font-semibold hover:bg-slate-100"
                  >
                    -
                  </button>
                  <span className="px-3 py-1.5 text-xs font-bold tabular-nums">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => q + 1)}
                    className="px-3 py-1.5 text-sm font-semibold hover:bg-slate-100"
                  >
                    +
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => onToggleWishlist(product)}
                  className={`p-2.5 rounded-lg border transition-colors ${
                    isWishlisted
                      ? 'border-rose-300 bg-rose-50 text-rose-600'
                      : 'border-slate-200 text-slate-600 hover:text-rose-600'
                  }`}
                  title="Wishlist"
                >
                  <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-rose-500' : ''}`} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    onAddToCart(product, quantity);
                    onClose();
                  }}
                  className="flex items-center justify-center gap-2 py-3 px-4 text-xs font-bold text-[#008080] bg-[#008080]/10 hover:bg-[#008080] hover:text-white rounded-xl border border-[#008080]/20 transition-colors"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Add to Cart</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onBuyNow(product, quantity);
                    onClose();
                  }}
                  className="flex items-center justify-center gap-2 py-3 px-4 text-xs font-bold text-white bg-[#008080] hover:bg-[#006666] rounded-xl shadow-md transition-colors"
                >
                  <span>Buy Now</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
