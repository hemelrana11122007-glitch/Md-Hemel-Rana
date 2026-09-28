import React from 'react';
import { ShoppingBag, Package, Globe, ArrowRight } from 'lucide-react';
import { Product } from '../types/marketplace';
import { ProductCard } from './ProductCard';

interface ProductSegmentsProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
  onBuyNow: (product: Product) => void;
  onToggleWishlist: (product: Product) => void;
  wishlistIds: string[];
  onQuickView: (product: Product) => void;
  onNavigateFile: (filename: string) => void;
}

export const ProductSegments: React.FC<ProductSegmentsProps> = ({
  products,
  onAddToCart,
  onBuyNow,
  onToggleWishlist,
  wishlistIds,
  onQuickView,
  onNavigateFile,
}) => {
  const retailProducts = products.filter((p) => p.segment === 'retail');
  const wholesaleProducts = products.filter((p) => p.segment === 'wholesale');
  const importProducts = products.filter((p) => p.segment === 'import');

  return (
    <div className="space-y-10 py-8 sm:py-10">
      {/* 1. RETAIL PRODUCTS SECTION */}
      <section id="retail-section" className="scroll-mt-24">
        <div className="max-w-[1536px] mx-auto px-3 sm:px-5 lg:px-6">
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 mb-6 border-b-2 border-[#008080]/20">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-200">
                <ShoppingBag className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded">
                    Segment 01 · Ready to Ship
                  </span>
                  <span className="text-[11px] text-slate-400">No Minimum Order</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mt-0.5 font-display">
                  Retail Products Section
                </h2>
                <p className="text-xs text-slate-500 mt-0.5 max-w-xl">
                  Individual consumer items ready for immediate dispatch with guaranteed 30-day hassle-free returns.
                </p>
              </div>
            </div>

            {/* 'View All' Link to retail.php */}
            <a
              href="retail.php"
              onClick={(e) => {
                e.preventDefault();
                onNavigateFile('retail.php');
              }}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-[#008080] hover:bg-[#006666] rounded-xl shadow-xs transition-all cursor-pointer shrink-0 self-start sm:self-auto group"
            >
              <span>View All Retail</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>

          {/* Retail Products Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {retailProducts.slice(0, 4).map((product) => (
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

      {/* 2. WHOLESALE PRODUCTS SECTION */}
      <section id="wholesale-section" className="scroll-mt-24 py-8 bg-[#F8FAFA] border-y border-slate-100">
        <div className="max-w-[1536px] mx-auto px-3 sm:px-5 lg:px-6">
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 mb-6 border-b-2 border-amber-500/20">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0 border border-amber-200">
                <Package className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 bg-amber-100/90 px-2 py-0.5 rounded">
                    Segment 02 · B2B Factory Direct
                  </span>
                  <span className="text-[11px] text-slate-500">Volume Discounts & MOQ</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mt-0.5 font-display">
                  Wholesale Products Section
                </h2>
                <p className="text-xs text-slate-500 mt-0.5 max-w-xl">
                  Bulk lots, crate packaging, and commercial supplies directly from manufacturers with clear MOQ tiering.
                </p>
              </div>
            </div>

            {/* 'View All' Link to wholesale.php */}
            <a
              href="wholesale.php"
              onClick={(e) => {
                e.preventDefault();
                onNavigateFile('wholesale.php');
              }}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-[#008080] hover:bg-[#006666] rounded-xl shadow-xs transition-all cursor-pointer shrink-0 self-start sm:self-auto group"
            >
              <span>View All Wholesale</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>

          {/* Wholesale Products Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {wholesaleProducts.slice(0, 4).map((product) => (
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

      {/* 3. IMPORT PRODUCTS SECTION */}
      <section id="import-section" className="scroll-mt-24">
        <div className="max-w-[1536px] mx-auto px-3 sm:px-5 lg:px-6">
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 mb-6 border-b-2 border-[#008080]/30">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-[#008080] flex items-center justify-center shrink-0 border border-teal-200">
                <Globe className="w-5 h-5 text-[#008080]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-teal-900 bg-teal-100/90 px-2 py-0.5 rounded">
                    Segment 03 · Cross-Border Direct
                  </span>
                  <span className="text-[11px] text-slate-500">Customs Cleared & Duty Paid</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mt-0.5 font-display">
                  Import Products Section
                </h2>
                <p className="text-xs text-slate-500 mt-0.5 max-w-xl">
                  Curated international direct imports with all duties pre-cleared for smooth delivery across Bangladesh.
                </p>
              </div>
            </div>

            {/* 'View All' Link to import.php */}
            <a
              href="import.php"
              onClick={(e) => {
                e.preventDefault();
                onNavigateFile('import.php');
              }}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-[#008080] hover:bg-[#006666] rounded-xl shadow-xs transition-all cursor-pointer shrink-0 self-start sm:self-auto group"
            >
              <span>View All Imports</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>

          {/* Import Products Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {importProducts.slice(0, 4).map((product) => (
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
    </div>
  );
};
