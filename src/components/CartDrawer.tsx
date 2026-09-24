import React from 'react';
import { X, Trash2, ShoppingBag, ArrowRight, ShieldCheck, Plus, Minus } from 'lucide-react';
import { CartItem } from '../types/marketplace';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
}) => {
  if (!isOpen) return null;

  const subtotal = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

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
            <div className="w-8 h-8 rounded-lg bg-[#008080]/10 text-[#008080] flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Shopping Cart</h2>
              <p className="text-xs text-slate-500">
                {items.length} {items.length === 1 ? 'item' : 'items'}
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

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
              <ShoppingBag className="w-12 h-12 text-slate-300 mb-3 stroke-[1.5]" />
              <h3 className="text-base font-semibold text-slate-700">Your cart is empty</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-xs">
                Explore our Retail, Wholesale, or Import sections and add items to your cart.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="mt-4 px-4 py-2 text-xs font-bold text-white bg-[#008080] hover:bg-[#006666] rounded-lg transition-colors"
              >
                Start Shopping
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.product.id}
                className="flex gap-3 p-3 bg-slate-50/60 rounded-xl border border-slate-100"
              >
                {/* Thumbnail */}
                <div className="w-16 h-16 rounded-lg bg-slate-200 overflow-hidden shrink-0 border border-slate-200">
                  <img
                    src={item.product.image}
                    alt={item.product.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-xs font-bold text-slate-900 truncate">
                      {item.product.title}
                    </h4>
                    <button
                      type="button"
                      onClick={() => onRemoveItem(item.product.id)}
                      className="text-slate-400 hover:text-rose-600 transition-colors p-0.5"
                      title="Remove item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center gap-2 text-[11px] text-slate-500">
                    <span className="capitalize">{item.product.segment}</span>
                    <span>·</span>
                    <span className="text-[#008080] font-bold tabular-nums">
                      ${item.product.price.toFixed(2)}
                    </span>
                  </div>

                  {/* Quantity Stepper */}
                  <div className="flex items-center justify-between mt-2 pt-1">
                    <div className="flex items-center border border-slate-200 rounded-md bg-white">
                      <button
                        type="button"
                        onClick={() =>
                          onUpdateQuantity(
                            item.product.id,
                            Math.max(1, item.quantity - 1)
                          )
                        }
                        className="p-1 text-slate-500 hover:bg-slate-100 rounded-l-md"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-2.5 text-xs font-semibold tabular-nums text-slate-800">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          onUpdateQuantity(item.product.id, item.quantity + 1)
                        }
                        className="p-1 text-slate-500 hover:bg-slate-100 rounded-r-md"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <span className="text-xs font-bold text-slate-900 tabular-nums">
                      ${(item.product.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer with Subtotal & Checkout */}
        {items.length > 0 && (
          <div className="p-4 sm:p-5 border-t border-slate-100 bg-white space-y-3">
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-500">
                <span>Subtotal</span>
                <span className="font-semibold text-slate-800 tabular-nums">
                  ${subtotal.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Estimated Shipping</span>
                <span className="text-emerald-600 font-semibold">Calculated at Step 2</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-slate-900 pt-2 border-t border-slate-100">
                <span>Total</span>
                <span className="text-lg text-[#008080] tabular-nums">
                  ${subtotal.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-slate-500 bg-teal-50/60 p-2.5 rounded-lg border border-teal-100">
              <ShieldCheck className="w-4 h-4 text-[#008080] shrink-0" />
              <span>Multi-Vendor Escrow Protection Active on All Orders</span>
            </div>

            <button
              type="button"
              onClick={onCheckout}
              className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 text-sm font-bold text-white bg-[#008080] hover:bg-[#006666] rounded-xl shadow-md transition-all cursor-pointer"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
