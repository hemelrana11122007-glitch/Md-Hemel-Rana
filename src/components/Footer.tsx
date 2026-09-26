import React, { useState } from 'react';
import {
  Store,
  Mail,
  ArrowRight,
  ShieldCheck,
  CheckCircle,
  Truck,
  CreditCard,
  Phone,
  MapPin,
  Clock
} from 'lucide-react';

interface FooterProps {
  onNavigatePage: (pageId: string, urlPath: string) => void;
}

export const Footer: React.FC<FooterProps> = ({
  onNavigatePage,
}) => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <footer id="footer" className="bg-[#111827] text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Feature Highlights Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pb-12 border-b border-slate-800">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-[#008080]/20 text-[#008080] flex items-center justify-center shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <div className="text-sm font-bold text-white">Worldwide Delivery</div>
              <div className="text-xs text-slate-400 mt-0.5">Air express & bonded sea freight</div>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-[#008080]/20 text-[#008080] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="text-sm font-bold text-white">Buyer Protection Escrow</div>
              <div className="text-xs text-slate-400 mt-0.5">Funds released only after inspection</div>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-[#008080]/20 text-[#008080] flex items-center justify-center shrink-0">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <div className="text-sm font-bold text-white">Secure Multi-Currency</div>
              <div className="text-xs text-slate-400 mt-0.5">Cards, bKash, wire & LC terms</div>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-[#008080]/20 text-[#008080] flex items-center justify-center shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <div className="text-sm font-bold text-white">24/7 Trade Support</div>
              <div className="text-xs text-slate-400 mt-0.5">Dedicated dispute & logistics team</div>
            </div>
          </div>
        </div>

        {/* Main Footer Links & Newsletter */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 py-12">
          {/* Company Brand Column */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#008080] text-white flex items-center justify-center font-bold shadow-md">
                <Store className="w-5 h-5" />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold tracking-tight text-white font-display">
                  AR <span className="text-[#008080]">Market BD</span>
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              The premier unified multi-vendor platform connecting direct retail shoppers, wholesale B2B bulk buyers, and international bonded importers under verified quality standards.
            </p>

            <div className="space-y-2 text-xs text-slate-400 pt-2">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#008080] shrink-0" />
                <span>Dhaka / Global Commerce Hub: 500 Trade Avenue, Suite 800</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#008080] shrink-0" />
                <span>Merchant Support: +880 1800-AR-BD / +1 (800) 555-ARBD</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#008080] shrink-0" />
                <span>support@armarketbd.com · trade@armarketbd.com</span>
              </div>
            </div>
          </div>

          {/* Product Segments Links (Crucial Routing) */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              Product Segments
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  type="button"
                  onClick={() => onNavigatePage('retail', '/retail')}
                  className="hover:text-white hover:underline transition-colors flex items-center gap-1.5 cursor-pointer text-left"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Retail Store
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigatePage('wholesale', '/wholesale')}
                  className="hover:text-white hover:underline transition-colors flex items-center gap-1.5 cursor-pointer text-left"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  Wholesale B2B
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigatePage('import', '/import')}
                  className="hover:text-white hover:underline transition-colors flex items-center gap-1.5 cursor-pointer text-left"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#008080]" />
                  Direct Imports
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigatePage('shop', '/shop')}
                  className="hover:text-white hover:underline transition-colors flex items-center gap-1.5 cursor-pointer text-left"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                  All Products Shop
                </button>
              </li>
            </ul>
          </div>

          {/* Quick Links & Community */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              Marketplace Hub
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  type="button"
                  onClick={() => onNavigatePage('home', '/')}
                  className="hover:text-white transition-colors text-left cursor-pointer"
                >
                  Home Page (index.html)
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigatePage('sellers', '/sellers')}
                  className="hover:text-white transition-colors text-left cursor-pointer"
                >
                  Featured Seller Profiles
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigatePage('market-feed', '/market-feed')}
                  className="hover:text-white transition-colors text-left cursor-pointer"
                >
                  Market Feed Discussions
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigatePage('about', '/about')}
                  className="hover:text-white transition-colors text-left cursor-pointer"
                >
                  About AR Market BD
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigatePage('contact', '/contact')}
                  className="hover:text-white transition-colors text-left cursor-pointer"
                >
                  Contact Us & Support
                </button>
              </li>
            </ul>
          </div>

          {/* Newsletter Signup Column */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              Newsletter Signup
            </h3>
            <p className="text-xs text-slate-400">
              Subscribe to weekly drops, factory clearance alerts, and customs tariff updates.
            </p>

            {subscribed ? (
              <div className="p-3 bg-[#008080]/20 border border-[#008080] rounded-xl flex items-center gap-2 text-xs text-teal-200">
                <CheckCircle className="w-4 h-4 text-teal-400 shrink-0" />
                <span>Thank you! You are subscribed to trade alerts.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-2">
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter corporate or personal email"
                    className="w-full px-3.5 py-2.5 text-xs text-white placeholder-slate-500 bg-slate-800 rounded-xl border border-slate-700 focus:outline-none focus:border-[#008080] focus:ring-1 focus:ring-[#008080]"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-[#008080] hover:bg-[#006666] rounded-xl transition-colors cursor-pointer shadow-xs"
                >
                  <span>Subscribe to Alerts</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Bottom Bar: Copyright & Terms */}
        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            © {new Date().getFullYear()} AR Market BD. All rights reserved. Teal (#008080) & White Multi-Vendor Architecture.
          </div>
          <div className="flex items-center gap-6">
            <button type="button" onClick={() => onNavigatePage('about', '/about')} className="hover:text-slate-400 transition-colors">About Us</button>
            <button type="button" onClick={() => onNavigatePage('contact', '/contact')} className="hover:text-slate-400 transition-colors">Contact</button>
            <a href="#privacy" className="hover:text-slate-400 transition-colors">Privacy Policy</a>
            <a href="#terms" className="hover:text-slate-400 transition-colors">Terms of Trade</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
