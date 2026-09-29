import React, { useState, useEffect, useMemo } from 'react';
import {
  ArrowLeft,
  ShoppingBag,
  Sparkles,
  Tag,
  Star,
  SlidersHorizontal,
  Flame,
  Search,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Heart,
  Eye,
  Truck,
  ArrowRight,
} from 'lucide-react';
import { Product } from '../types/marketplace';
import {
  SpecialOfferItem,
  specialOfferService,
  getTimeRemaining,
  TimeRemaining,
} from '../services/specialOfferService';

interface SpecialOfferPageProps {
  offerId: string;
  allProducts: Product[];
  onAddToCart: (product: Product, quantity?: number) => void;
  onBuyNow: (product: Product, quantity?: number) => void;
  onToggleWishlist: (product: Product) => void;
  wishlistIds: string[];
  onQuickView: (product: Product) => void;
  onNavigatePage: (pageId: string, urlPath?: string) => void;
}

export const SpecialOfferPage: React.FC<SpecialOfferPageProps> = ({
  offerId,
  allProducts,
  onAddToCart,
  onBuyNow,
  onToggleWishlist,
  wishlistIds,
  onQuickView,
  onNavigatePage,
}) => {
  // Load offer details
  const [offer, setOffer] = useState<SpecialOfferItem | null>(() => {
    return specialOfferService.getOfferById(offerId) || specialOfferService.getOffers()[0] || null;
  });

  useEffect(() => {
    const found = specialOfferService.getOfferById(offerId);
    if (found) {
      setOffer(found);
    } else {
      const all = specialOfferService.getOffers();
      if (all.length > 0) setOffer(all[0]);
    }
  }, [offerId]);

  // Live Dynamic Countdown Timer calculated from offer.expiryDate (Requirement #1)
  const [timeLeft, setTimeLeft] = useState<TimeRemaining>(() =>
    getTimeRemaining(offer?.expiryDate)
  );

  useEffect(() => {
    const updateCountdown = () => {
      if (!offer) return;
      setTimeLeft(getTimeRemaining(offer.expiryDate));
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, [offer?.expiryDate]);

  const formatDigits = (n: number) => n.toString().padStart(2, '0');

  // Filtering & Sorting State
  const [searchFilter, setSearchFilter] = useState('');
  const [sortBy, setSortBy] = useState<'featured' | 'price-low' | 'price-high' | 'rating' | 'discount'>('featured');

  // Filter products assigned to this special offer (Requirement #3)
  const assignedProducts = useMemo(() => {
    if (!offer) return [];

    let filtered: Product[] = [];

    // 1. If offer has explicit assigned product IDs, prioritize them
    if (offer.assignedProductIds && offer.assignedProductIds.length > 0) {
      filtered = allProducts.filter((p) => offer.assignedProductIds?.includes(p.id));
    }

    // 2. If no products explicitly matched or list is small, supplement based on target segment or general deals
    if (filtered.length === 0) {
      if (offer.targetSegment && offer.targetSegment !== 'all') {
        filtered = allProducts.filter((p) => p.segment === offer.targetSegment);
      } else {
        // Retail & trending products
        filtered = allProducts.filter((p) => p.originalPrice && p.originalPrice > p.price);
      }
    }

    // Fallback: If still empty, show first 8 products
    if (filtered.length === 0) {
      filtered = allProducts.slice(0, 8);
    }

    // Apply in-page search query
    if (searchFilter.trim()) {
      const q = searchFilter.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
      );
    }

    // Apply sorting
    return [...filtered].sort((a, b) => {
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'discount') {
        const discA = a.originalPrice ? (a.originalPrice - a.price) / a.originalPrice : 0;
        const discB = b.originalPrice ? (b.originalPrice - b.price) / b.originalPrice : 0;
        return discB - discA;
      }
      return 0;
    });
  }, [offer, allProducts, searchFilter, sortBy]);

  if (!offer) {
    return (
      <div className="max-w-[1720px] mx-auto px-3 sm:px-4 lg:px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-slate-800">Special Offer Campaign Not Found</h2>
        <p className="text-xs text-slate-500 mt-2">The selected promotional campaign may have ended or been moved.</p>
        <button
          type="button"
          onClick={() => onNavigatePage('home', '/')}
          className="mt-4 px-5 py-2.5 rounded-xl bg-[#0f766e] text-white text-xs font-bold"
        >
          Return to Home
        </button>
      </div>
    );
  }

  return (
    <div className="w-full bg-[#f8fafc] min-h-screen pb-16">
      {/* Top Breadcrumbs & Back Navigation */}
      <div className="border-b border-slate-200/80 bg-white">
        <div className="max-w-[1720px] mx-auto px-3 sm:px-4 lg:px-4 py-2.5 flex items-center justify-between">
          <button
            type="button"
            onClick={() => onNavigatePage('home', '/')}
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-[#0f766e] transition-colors cursor-pointer group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            <span>Back to Marketplace</span>
          </button>

          <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-500">
            <span
              onClick={() => onNavigatePage('home', '/')}
              className="hover:text-[#0f766e] cursor-pointer"
            >
              Home
            </span>
            <span>/</span>
            <span className="text-slate-400">Special Offers</span>
            <span>/</span>
            <span className="text-[#0f766e] font-bold line-clamp-1 max-w-[200px]">
              {offer.campaignName}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-[1720px] mx-auto px-3 sm:px-4 lg:px-4 py-4 sm:py-6 space-y-5">
        {/* ========================================================================= */}
        {/* 1. FULL-WIDTH SPECIAL OFFER BANNER HERO (Requirement #3)                  */}
        {/* ========================================================================= */}
        <div
          className="w-full bg-[#042f24] text-white rounded-2xl sm:rounded-3xl relative shadow-lg border border-teal-600/30 aspect-[3.8/1] sm:aspect-[4/1] md:aspect-[4.5/1] min-h-[120px] sm:min-h-[160px] md:min-h-[190px] max-h-[280px] flex flex-col justify-between p-4 sm:p-6 md:p-7 select-none overflow-hidden"
        >
          {/* Pure Original Banner Creative Image (Full Width, object-cover, No Blank Space) */}
          <img
            src={offer.bannerImage}
            alt={offer.campaignName}
            className="absolute inset-0 w-full h-full object-cover object-center transition-all duration-500"
          />

          {/* Top Row: Custom Badge + Dynamic Live Countdown */}
          <div className="relative z-10 flex items-center justify-between gap-2 pb-1">
            <div className="flex items-center gap-2">
              <span
                className="px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-wider text-white shadow-md flex items-center gap-1"
                style={{ backgroundColor: offer.badgeColor || '#0f766e' }}
              >
                <Tag className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span>{offer.badgeText || 'SPECIAL OFFER'}</span>
              </span>

              <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-black/60 text-emerald-200 backdrop-blur-xs border border-white/15 shadow-xs">
                <Flame className="w-3 h-3 text-amber-300" />
                Exclusive Event
              </span>
            </div>

            {/* Dynamic Countdown Badge (Requirement #1) */}
            <div className="flex items-center gap-1 bg-black/75 backdrop-blur-xs px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-lg sm:rounded-xl border border-white/20 text-[10px] sm:text-xs font-mono text-white shadow-md">
              <span className="text-[9px] sm:text-[10px] text-teal-200 font-sans mr-0.5">Ends in</span>
              {timeLeft.days > 0 && (
                <span className="font-bold tabular-nums mr-0.5">{timeLeft.days}d</span>
              )}
              <span className="font-bold tabular-nums">
                {formatDigits(timeLeft.days > 0 ? timeLeft.hours % 24 : timeLeft.hours)}
              </span>
              <span>:</span>
              <span className="font-bold tabular-nums">{formatDigits(timeLeft.minutes)}</span>
              <span>:</span>
              <span className="font-bold tabular-nums text-amber-300 animate-pulse">{formatDigits(timeLeft.seconds)}</span>
            </div>
          </div>

          {/* Middle/Bottom: Titles & Genuine Sellers Badge */}
          <div className="relative z-10 max-w-xl space-y-1 mt-auto pt-1">
            <h1 className="text-base sm:text-xl md:text-2xl font-black text-white tracking-tight font-display leading-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.85)] line-clamp-1">
              {offer.campaignName}
            </h1>

            {offer.description && (
              <p className="text-[11px] sm:text-xs font-semibold text-white/95 max-w-lg leading-relaxed drop-shadow-[0_1px_3px_rgba(0,0,0,0.85)] line-clamp-1">
                {offer.description}
              </p>
            )}

            <div className="pt-1 flex flex-wrap items-center gap-2 text-[10px] sm:text-xs text-white font-medium">
              <span className="flex items-center gap-1 bg-black/70 backdrop-blur-xs px-2 py-0.5 rounded-md border border-white/20 shadow-xs">
                <ShieldCheck className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-300" />
                <span>100% Genuine Verified Sellers</span>
              </span>
            </div>
          </div>
        </div>

        {/* Expired Campaign Alert if countdown reached 00:00:00 (Requirement #2) */}
        {timeLeft.isExpired && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-2 text-xs font-bold text-amber-800 shadow-2xs">
            <Clock className="w-4 h-4 text-amber-600 shrink-0" />
            <span>This promotional campaign has ended. Products below may now sell at standard regular pricing.</span>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 2. FILTER & SORT TOOLBAR                                                  */}
        {/* ========================================================================= */}
        <div className="bg-white rounded-2xl p-3.5 sm:p-4 border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#0f766e]" />
              <span>Assigned Campaign Deals</span>
            </h2>
            <span className="px-2 py-0.5 rounded-md bg-teal-50 text-[#0f766e] text-xs font-black">
              {assignedProducts.length} Items
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 w-full sm:w-auto">
            {/* Search within Offer */}
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Search deals in this offer..."
                className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0f766e]/30 focus:border-[#0f766e]"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            </div>

            {/* Sort Selector */}
            <div className="flex items-center gap-1.5 w-full sm:w-auto justify-end">
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400 shrink-0 hidden sm:block" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 focus:outline-none focus:border-[#0f766e] cursor-pointer"
              >
                <option value="featured">Featured First</option>
                <option value="discount">Highest Discount</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Top Customer Rated</option>
              </select>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 3. ASSIGNED PRODUCTS GRID (Requirement #3)                                */}
        {/* ========================================================================= */}
        {assignedProducts.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-slate-200 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 text-[#0f766e] flex items-center justify-center mx-auto shadow-2xs">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black text-slate-900">No Products Found in this Offer</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No products match your search keyword. Try clearing your filter query to see all assigned campaign deals.
            </p>
            {searchFilter && (
              <button
                type="button"
                onClick={() => setSearchFilter('')}
                className="px-4 py-2 rounded-xl text-xs font-bold text-[#0f766e] bg-teal-50 hover:bg-teal-100 transition-colors"
              >
                Clear Search Filter
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
            {assignedProducts.map((product) => {
              const isWishlisted = wishlistIds.includes(product.id);
              const discountPercent = product.originalPrice
                ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
                : 25;

              return (
                <div
                  key={product.id}
                  className="bg-white rounded-2xl border border-slate-200 hover:border-teal-400 hover:shadow-md transition-all duration-300 p-3 sm:p-3.5 flex flex-col justify-between group relative overflow-hidden"
                >
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-1 z-10">
                    <span className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-[#0f766e]/10 text-[#0f766e]">
                      {product.segment}
                    </span>

                    <button
                      type="button"
                      onClick={() => onToggleWishlist(product)}
                      className={`p-1.5 rounded-full transition-colors cursor-pointer ${
                        isWishlisted
                          ? 'bg-rose-50 text-rose-500'
                          : 'bg-slate-100 text-slate-400 hover:text-rose-500 hover:bg-rose-50'
                      }`}
                      title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
                    >
                      <Heart className={`w-3.5 h-3.5 ${isWishlisted ? 'fill-rose-500' : ''}`} />
                    </button>
                  </div>

                  {/* Product Image & Quick View trigger */}
                  <div
                    onClick={() => onQuickView(product)}
                    className="relative w-full h-36 sm:h-40 my-2 flex items-center justify-center cursor-pointer overflow-hidden rounded-xl bg-slate-50 p-2"
                  >
                    <img
                      src={product.image}
                      alt={product.title}
                      className="max-h-full max-w-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Discount Pill */}
                    <span className="absolute bottom-1.5 left-1.5 px-2 py-0.5 rounded-md text-[10px] font-black bg-rose-500 text-white shadow-xs">
                      {discountPercent}% OFF
                    </span>

                    {/* Quick View Hover Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onQuickView(product);
                      }}
                      className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white backdrop-blur-[1px]"
                    >
                      <span className="px-3 py-1.5 rounded-full bg-white text-slate-900 text-[10px] font-extrabold shadow-md flex items-center gap-1">
                        <Eye className="w-3 h-3 text-[#0f766e]" />
                        Quick View
                      </span>
                    </button>
                  </div>

                  {/* Product Info */}
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block truncate">
                      {product.category}
                    </span>

                    <h3
                      onClick={() => onQuickView(product)}
                      className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-[#0f766e] transition-colors line-clamp-2 leading-snug cursor-pointer"
                      title={product.title}
                    >
                      {product.title}
                    </h3>

                    {/* Rating & Review */}
                    <div className="flex items-center gap-1 text-[11px] text-amber-500 font-bold">
                      <Star className="w-3 h-3 fill-amber-400" />
                      <span>{product.rating}</span>
                      <span className="text-slate-400 font-normal">({product.reviewsCount})</span>
                    </div>

                    {/* Price Block */}
                    <div className="flex items-baseline gap-2 pt-0.5">
                      <span className="text-sm sm:text-base font-black text-slate-900 font-mono">
                        ৳{Math.round(product.price * 110).toLocaleString()}
                      </span>
                      {product.originalPrice && (
                        <span className="text-xs font-semibold text-slate-400 line-through font-mono">
                          ৳{Math.round(product.originalPrice * 110).toLocaleString()}
                        </span>
                      )}
                    </div>

                    {/* Seller Badge */}
                    <div className="pt-1 flex items-center gap-1 text-[10px] text-slate-500 truncate">
                      <span>Sold by:</span>
                      <span className="font-bold text-slate-700 truncate">{product.seller.name}</span>
                      {product.seller.verified && (
                        <ShieldCheck className="w-3 h-3 text-emerald-600 shrink-0" />
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-3 grid grid-cols-2 gap-1.5 border-t border-slate-100 mt-2">
                    <button
                      type="button"
                      onClick={() => onAddToCart(product, 1)}
                      className="w-full py-1.5 rounded-xl border border-teal-600/40 hover:border-[#0f766e] text-[#0f766e] hover:bg-teal-50 active:scale-95 text-[11px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1"
                    >
                      <ShoppingBag className="w-3 h-3" />
                      <span>Add</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onBuyNow(product, 1)}
                      className="w-full py-1.5 rounded-xl bg-[#0f766e] hover:bg-[#064e3b] text-white active:scale-95 text-[11px] font-extrabold transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1"
                    >
                      <span>Buy</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
