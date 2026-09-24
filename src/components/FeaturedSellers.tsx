import React from 'react';
import { ShieldCheck, Star, ArrowRight, Store, MapPin, CheckCircle2 } from 'lucide-react';
import { SELLERS } from '../data/mockData';
import { Seller } from '../types/marketplace';

interface FeaturedSellersProps {
  onVisitSeller: (seller: Seller) => void;
  onBrowseAllSellers: () => void;
}

export const FeaturedSellers: React.FC<FeaturedSellersProps> = ({
  onVisitSeller,
  onBrowseAllSellers,
}) => {
  return (
    <section id="sellers" className="py-14 bg-white border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-[#008080]">
              Verified Merchant Network
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mt-1 font-display">
              Featured Sellers
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Top merchant profiles maintaining 98%+ on-time shipping and verified credentials
            </p>
          </div>

          <button
            type="button"
            onClick={onBrowseAllSellers}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-[#008080] hover:text-white bg-teal-50 hover:bg-[#008080] rounded-lg transition-colors border border-teal-200/80 cursor-pointer shrink-0 self-start sm:self-auto"
          >
            <span>View All Sellers</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Sellers Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {SELLERS.map((seller: Seller) => (
            <div
              key={seller.id}
              className="group relative flex flex-col bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-lg hover:border-[#008080] transition-all duration-300 hover:-translate-y-1"
            >
              {/* Header with Avatar & Badge */}
              <div className="flex items-start gap-3.5 mb-4">
                {/* Avatar with styled fallback container */}
                <div className="relative w-14 h-14 rounded-full overflow-hidden bg-teal-100 flex items-center justify-center shrink-0 border-2 border-[#008080]/30 shadow-xs">
                  <span className="text-lg font-bold text-[#008080]">
                    {seller.name.slice(0, 2).toUpperCase()}
                  </span>
                  <div className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center">
                    <CheckCircle2 className="w-2.5 h-2.5 text-white" />
                  </div>
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-sm font-bold text-slate-900 truncate hover:text-[#008080] transition-colors">
                      {seller.name}
                    </h3>
                  </div>

                  {/* Badge */}
                  <div className="mt-1">
                    <span
                      className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md ${
                        seller.badge.includes('Retailer')
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/80'
                          : seller.badge.includes('Wholesaler')
                          ? 'bg-amber-50 text-amber-800 border border-amber-200/80'
                          : seller.badge.includes('Importer')
                          ? 'bg-teal-50 text-teal-800 border border-teal-200/80'
                          : 'bg-indigo-50 text-indigo-800 border border-indigo-200/80'
                      }`}
                    >
                      <ShieldCheck className="w-3 h-3" />
                      {seller.badge}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-500 truncate mt-1">
                    {seller.role}
                  </p>
                </div>
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-3 gap-2 py-3 border-y border-slate-100 text-center text-xs">
                <div>
                  <div className="flex items-center justify-center gap-1 font-bold text-slate-800">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span>{seller.rating}</span>
                  </div>
                  <div className="text-[10px] text-slate-400">Rating</div>
                </div>
                <div>
                  <div className="font-bold text-slate-800 tabular-nums">
                    {seller.totalSales}
                  </div>
                  <div className="text-[10px] text-slate-400">Sales</div>
                </div>
                <div>
                  <div className="font-bold text-emerald-600 tabular-nums">
                    {seller.responseRate}
                  </div>
                  <div className="text-[10px] text-slate-400">Response</div>
                </div>
              </div>

              {/* Location & Products */}
              <div className="flex items-center justify-between text-[11px] text-slate-500 mt-3 mb-4">
                <span className="flex items-center gap-1 truncate">
                  <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                  {seller.location}
                </span>
                <span className="font-medium text-slate-700">
                  {seller.productsCount} products
                </span>
              </div>

              {/* Visit Store Action Button */}
              <button
                type="button"
                onClick={() => onVisitSeller(seller)}
                className="mt-auto w-full inline-flex items-center justify-center gap-2 py-2.5 px-3 text-xs font-bold text-[#008080] bg-teal-50 hover:bg-[#008080] hover:text-white rounded-xl transition-all border border-[#008080]/30 cursor-pointer shadow-2xs group-hover:bg-[#008080] group-hover:text-white"
              >
                <Store className="w-3.5 h-3.5" />
                <span>Visit Store</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
