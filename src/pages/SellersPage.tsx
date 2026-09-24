import React from 'react';
import { ShieldCheck, Star, Store, MapPin, CheckCircle2, ArrowRight } from 'lucide-react';
import { SELLERS } from '../data/mockData';
import { Seller } from '../types/marketplace';

interface SellersPageProps {
  onVisitSeller: (seller: Seller) => void;
  onNavigatePage: (pageId: string) => void;
}

export const SellersPage: React.FC<SellersPageProps> = ({
  onVisitSeller,
  onNavigatePage,
}) => {
  return (
    <div className="py-8 bg-[#F8FAFA] min-h-[calc(100vh-200px)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
          <span>Home</span>
          <span>/</span>
          <span className="text-[#008080] font-semibold">Verified Sellers Directory</span>
        </div>

        {/* Hero banner */}
        <div className="bg-gradient-to-r from-teal-950 via-slate-900 to-[#008080] rounded-3xl p-6 sm:p-10 text-white shadow-lg mb-8">
          <div className="max-w-2xl">
            <span className="px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-bold uppercase tracking-wider mb-3 inline-block border border-teal-400/30">
              Verified Merchant Network
            </span>
            <h1 className="text-2xl sm:text-4xl font-extrabold font-display tracking-tight text-white leading-tight">
              Top Marketplace Vendors & Importers
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-slate-200 leading-relaxed">
              Every merchant on AR Market BD undergoes background vetting, verified business licensing, trade registration, and strict quality compliance before dispatching goods.
            </p>
          </div>
        </div>

        {/* Grid of Sellers */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {SELLERS.map((seller) => (
            <div
              key={seller.id}
              className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs hover:shadow-lg hover:border-[#008080] transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start gap-4 mb-4">
                  <div className="relative w-16 h-16 rounded-full bg-teal-100 flex items-center justify-center shrink-0 border-2 border-[#008080]/30 shadow-xs">
                    <span className="text-xl font-bold text-[#008080]">
                      {seller.name.slice(0, 2).toUpperCase()}
                    </span>
                    <div className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center">
                      <CheckCircle2 className="w-2.5 h-2.5 text-white" />
                    </div>
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="text-base font-bold text-slate-900 truncate">
                      {seller.name}
                    </h3>
                    <div className="mt-1">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-teal-50 text-teal-800 border border-teal-200">
                        <ShieldCheck className="w-3 h-3" />
                        {seller.badge}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">{seller.role}</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 py-3 border-y border-slate-100 text-center text-xs mb-4">
                  <div>
                    <div className="flex items-center justify-center gap-1 font-bold text-slate-800">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>{seller.rating}</span>
                    </div>
                    <div className="text-[10px] text-slate-400">Rating</div>
                  </div>
                  <div>
                    <div className="font-bold text-slate-800 tabular-nums">{seller.totalSales}</div>
                    <div className="text-[10px] text-slate-400">Total Sales</div>
                  </div>
                  <div>
                    <div className="font-bold text-emerald-600 tabular-nums">{seller.responseRate}</div>
                    <div className="text-[10px] text-slate-400">Response</div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 mb-6">
                  <span className="flex items-center gap-1 truncate">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    {seller.location}
                  </span>
                  <span className="font-medium text-slate-700">{seller.productsCount} active lots</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onVisitSeller(seller)}
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-bold text-white bg-[#008080] hover:bg-[#006666] rounded-xl transition-all cursor-pointer shadow-xs"
              >
                <Store className="w-4 h-4" />
                <span>Visit Storefront</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
