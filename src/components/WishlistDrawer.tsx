import React from 'react';
import { X, Heart, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import { Product } from '../types/marketplace';

interface WishlistDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: Product[];
  onRemoveItem: (productId: string) => void;
  onAddToCart: (product: Product) => void;
}

export const WishlistDrawer: React.FC<WishlistDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onRemoveItem,
  onAddToCart,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <Heart className="w-4 h-4 fill-rose-500" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Saved Wishlist</h2>
              <p className="text-xs text-slate-500">
                {items.length} {items.length === 1 ? 'item saved' : 'items saved'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
              <Heart className="w-12 h-12 text-slate-300 mb-3 stroke-[1.5]" />
              <h3 className="text-base font-semibold text-slate-700">Wishlist is empty</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-xs">
                Click the heart icon on any product card to save items for future purchases.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="mt-4 px-4 py-2 text-xs font-bold text-white bg-[#008080] hover:bg-[#006666] rounded-lg transition-colors"
              >
                Browse Marketplace
              </button>
            </div>
          ) : (
            items.map((product) => (
              <div
                key={product.id}
                className="flex gap-3 p-3 bg-slate-50/60 rounded-xl border border-slate-100"
              >
                <div className="w-16 h-16 rounded-lg bg-slate-200 overflow-hidden shrink-0 border border-slate-200">
                  <img
                    src={product.image}
                    alt={product.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-xs font-bold text-slate-900 truncate">
                      {product.title}
                    </h4>
                    <button
                      type="button"
                      onClick={() => onRemoveItem(product.id)}
                      className="text-slate-400 hover:text-rose-600 transition-colors p-0.5"
                      title="Remove from wishlist"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span className="capitalize">{product.segment}</span>
                    <span>·</span>
                    <span className="text-[#008080] font-bold tabular-nums">
                      ${product.price.toFixed(2)}
                    </span>
                  </div>

                  <div className="mt-2 pt-1 flex items-center justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        onAddToCart(product);
                        onRemoveItem(product.id);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-[#008080] hover:bg-[#006666] rounded-lg transition-colors cursor-pointer"
                    >
                      <ShoppingBag className="w-3 h-3" />
                      <span>Move to Cart</span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
