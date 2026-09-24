import React from 'react';
import { Store, ShieldCheck, Truck, Users2, Award, CheckCircle2 } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="py-8 bg-[#F8FAFA] min-h-[calc(100vh-200px)]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl border border-slate-200/90 p-8 sm:p-12 shadow-xs">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 text-[#008080] flex items-center justify-center font-bold text-2xl shadow-xs">
              <Store className="w-6 h-6 text-[#008080]" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 font-display">
                About AR Market BD
              </h1>
              <p className="text-xs text-slate-500">
                Pioneering Bangladesh & Global Multi-Vendor Commerce Architecture
              </p>
            </div>
          </div>

          <div className="prose text-xs sm:text-sm text-slate-600 space-y-4 leading-relaxed">
            <p>
              <strong>AR Market BD</strong> was founded with a singular mission: to bridge the gap between individual retail consumers, commercial B2B wholesalers, and foreign bonded importers within one transparent, protected, and technologically superior digital ecosystem.
            </p>
            <p>
              Traditional marketplaces force buyers to navigate disjointed platforms or deal with uncertain MOQ requirements and ambiguous customs duties. AR Market BD unifies all three procurement pillars:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
              <div className="p-4 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl">
                <div className="text-sm font-bold text-emerald-900 mb-1">1. Retail Store</div>
                <p className="text-xs text-emerald-800">
                  Zero minimum order quantities, single piece purchases, rapid local dispatch, and 30-day money-back escrow protection.
                </p>
              </div>

              <div className="p-4 bg-amber-50/70 border border-amber-200/80 rounded-2xl">
                <div className="text-sm font-bold text-amber-900 mb-1">2. Wholesale B2B</div>
                <p className="text-xs text-amber-800">
                  Direct factory crate pricing, tiered MOQs, commercial VAT/tax invoices, and consolidated sea/air cargo freight.
                </p>
              </div>

              <div className="p-4 bg-teal-50/70 border border-teal-200/80 rounded-2xl">
                <div className="text-sm font-bold text-[#008080] mb-1">3. Direct Imports</div>
                <p className="text-xs text-teal-900">
                  Pre-cleared customs tariffs, authentic foreign certificates, direct express air freight from Switzerland, Germany, Japan & Korea.
                </p>
              </div>
            </div>

            <h3 className="text-base font-bold text-slate-900 pt-4">Our Integrity & Escrow Promise</h3>
            <p>
              Every transaction on AR Market BD is backed by an automated escrow system. Funds are released to vendors and wholesalers only when you inspect and confirm fulfillment specifications.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
