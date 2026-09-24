import React from 'react';
import { X, ArrowLeft, ShieldCheck, ShoppingBag, Package, Globe, CheckCircle } from 'lucide-react';
import { Product } from '../types/marketplace';
import { ProductCard } from './ProductCard';

interface SegmentViewModalProps {
  segmentFile: 'retail.php' | 'wholesale.php' | 'importer.php' | null;
  onClose: () => void;
  products: Product[];
  onAddToCart: (product: Product) => void;
  onBuyNow: (product: Product) => void;
  onToggleWishlist: (product: Product) => void;
  wishlistIds: string[];
  onQuickView: (product: Product) => void;
}

export const SegmentViewModal: React.FC<SegmentViewModalProps> = ({
  segmentFile,
  onClose,
  products,
  onAddToCart,
  onBuyNow,
  onToggleWishlist,
  wishlistIds,
  onQuickView,
}) => {
  if (!segmentFile) return null;

  const segmentType =
    segmentFile === 'retail.php'
      ? 'retail'
      : segmentFile === 'wholesale.php'
      ? 'wholesale'
      : 'import';

  const title =
    segmentFile === 'retail.php'
      ? 'Retail Department Catalog (retail.php)'
      : segmentFile === 'wholesale.php'
      ? 'Wholesale B2B Bulk Inventory (wholesale.php)'
      : 'Global Direct Imports Gateway (importer.php)';

  const subtitle =
    segmentFile === 'retail.php'
      ? 'Instant checkout items with zero minimum order quantities and 30-day returns.'
      : segmentFile === 'wholesale.php'
      ? 'Factory direct lots with Minimum Order Quantities (MOQ), tiered tier pricing, and freight support.'
      : 'Bonded international imports with customs clearance and door-to-door express delivery.';

  const filteredProducts = products.filter((p) => p.segment === segmentType);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 md:p-8">
      <div className="relative w-full max-w-6xl bg-white rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 bg-[#008080] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors text-white"
              title="Back to Home"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="text-xs uppercase tracking-wider text-teal-200 font-bold">
                Route: /{segmentFile}
              </div>
              <h2 className="text-xl sm:text-2xl font-bold font-display">{title}</h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Info banner */}
        <div className="px-6 py-3 bg-teal-50 border-b border-teal-100 flex items-center justify-between text-xs text-teal-900">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-[#008080]" />
            <span>{subtitle}</span>
          </div>
          <span className="font-bold tabular-nums">
            Showing {filteredProducts.length} items
          </span>
        </div>

        {/* Products Grid */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
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

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>Viewing verified segment products on AR Market BD</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 font-bold text-white bg-[#008080] hover:bg-[#006666] rounded-xl transition-colors"
          >
            Return to Home Page
          </button>
        </div>
      </div>
    </div>
  );
};
