import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Timer,
  ShoppingBag,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Zap,
  Star,
  Plus,
} from 'lucide-react';
import { Product } from '../types/marketplace';
import sneakerImg from '../assets/images/fashion_sneakers_product_1790256916173.jpg';
import headphoneImg from '../assets/images/gadgets_headphones_product_1790256932369.jpg';
import watchImg from '../assets/images/import_smartwatch_global_1790256962650.jpg';
import wholesaleImg from '../assets/images/wholesale_bulk_supplies_1790256947667.jpg';
import {
  specialOfferService,
  OFFERS_UPDATED_EVENT,
  SpecialOfferItem,
  getTimeRemaining,
  TimeRemaining,
} from '../services/specialOfferService';

export interface OfferBannerItem {
  id: string;
  tag: string;
  title: string;
  subtitle: string;
  ratingText?: string;
  image: string;
  ctaText: string;
  ctaAction?: () => void;
  targetSegment?: string;
  badgeColor?: string;
  startDate?: string;
  expiryDate?: string;
  status?: 'active' | 'scheduled' | 'expired' | 'paused';
}

interface SpecialOfferSectionProps {
  onShopNow: (targetSegment?: string) => void;
  onAddToCart: (product: Product, quantity?: number) => void;
  onQuickView: (product: Product) => void;
  customBanners?: OfferBannerItem[];
  onNavigateToOffer?: (offerId: string) => void;
  allProducts?: Product[];
}

export const SpecialOfferSection: React.FC<SpecialOfferSectionProps> = ({
  onShopNow,
  onAddToCart,
  onQuickView,
  customBanners,
  onNavigateToOffer,
  allProducts,
}) => {
  // Helper to map service item to Banner item format
  const mapOfferToBannerItem = (item: SpecialOfferItem): OfferBannerItem => ({
    id: item.id,
    tag: item.badgeText || 'SPECIAL OFFER',
    title: item.campaignName,
    subtitle: item.description,
    ratingText: '★ 4.9',
    image: item.bannerImage,
    ctaText: item.ctaText || 'Shop Now',
    targetSegment: item.targetSegment || 'retail',
    badgeColor: item.badgeColor || '#0f766e',
    startDate: item.startDate,
    expiryDate: item.expiryDate,
    status: item.status,
  });

  const isOfferActive = (o: SpecialOfferItem | OfferBannerItem) => {
    const rem = getTimeRemaining(o.expiryDate);
    const st = 'status' in o ? o.status : 'active';
    return !rem.isExpired && (!st || st === 'active');
  };

  // Dynamic Live Synced Offers State (Requirement #2: Auto-hide expired offers)
  const [liveOffers, setLiveOffers] = useState<OfferBannerItem[]>(() => {
    if (customBanners && customBanners.length > 0) {
      return customBanners.filter((b) => !getTimeRemaining(b.expiryDate).isExpired);
    }
    const loaded = specialOfferService.getOffers();
    const active = loaded.filter(isOfferActive);
    return active.map(mapOfferToBannerItem);
  });

  // Listen to Admin Panel live updates (Requirement #3)
  useEffect(() => {
    if (customBanners && customBanners.length > 0) {
      setLiveOffers(customBanners.filter((b) => !getTimeRemaining(b.expiryDate).isExpired));
      return;
    }

    const syncOffers = () => {
      const loaded = specialOfferService.getOffers();
      const active = loaded.filter(isOfferActive);
      setLiveOffers(active.map(mapOfferToBannerItem));
    };

    syncOffers();

    window.addEventListener(OFFERS_UPDATED_EVENT, syncOffers);
    window.addEventListener('storage', syncOffers);

    return () => {
      window.removeEventListener(OFFERS_UPDATED_EVENT, syncOffers);
      window.removeEventListener('storage', syncOffers);
    };
  }, [customBanners]);

  const banners = liveOffers;
  const isMultiple = banners.length > 1;

  // Carousel & Drag State
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const dragStartXRef = useRef<number | null>(null);
  const touchStartXRef = useRef<number | null>(null);

  // Keep index within bounds if items change
  useEffect(() => {
    if (currentIndex >= banners.length && banners.length > 0) {
      setCurrentIndex(0);
    }
  }, [banners.length, currentIndex]);

  const activeBanner = banners[currentIndex] || banners[0] || {
    id: 'default',
    tag: 'SPECIAL OFFER',
    title: 'Up to 50% OFF',
    subtitle: 'Top Rated Products',
    ratingText: '★ 4.9',
    image: '',
    ctaText: 'Shop Now',
    targetSegment: 'retail',
    badgeColor: '#0f766e',
    expiryDate: '2026-12-31',
  };

  // Dynamic Live Countdown Timer calculated from activeBanner.expiryDate (Requirement #1)
  const [timeLeft, setTimeLeft] = useState<TimeRemaining>(() =>
    getTimeRemaining(activeBanner?.expiryDate)
  );

  useEffect(() => {
    const updateCountdown = () => {
      if (!activeBanner) return;
      const rem = getTimeRemaining(activeBanner.expiryDate);
      setTimeLeft(rem);

      // Requirement #2: When countdown reaches 00:00:00 (isExpired), auto-hide offer from homepage
      if (rem.isExpired) {
        setLiveOffers((prev) => prev.filter((b) => b.id !== activeBanner.id));
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [activeBanner?.id, activeBanner?.expiryDate]);

  // Auto-play interval (every 4.5 seconds if multiple banners exist)
  useEffect(() => {
    if (!isMultiple || isPaused) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 4500);

    return () => clearInterval(interval);
  }, [isMultiple, isPaused, banners.length]);

  const handleNextSlide = () => {
    if (!isMultiple) return;
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  };

  const handlePrevSlide = () => {
    if (!isMultiple) return;
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
  };

  // Mouse Drag Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isMultiple) return;
    dragStartXRef.current = e.clientX;
    setIsPaused(true);
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!isMultiple || dragStartXRef.current === null) return;
    const deltaX = e.clientX - dragStartXRef.current;
    if (deltaX < -45) {
      handleNextSlide();
    } else if (deltaX > 45) {
      handlePrevSlide();
    }
    dragStartXRef.current = null;
    setIsPaused(false);
  };

  const handleMouseLeave = () => {
    dragStartXRef.current = null;
    setIsPaused(false);
  };

  // Touch Swipe Handlers (Mobile)
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!isMultiple) return;
    touchStartXRef.current = e.touches[0].clientX;
    setIsPaused(true);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!isMultiple || touchStartXRef.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const deltaX = touchEndX - touchStartXRef.current;
    if (deltaX < -45) {
      handleNextSlide();
    } else if (deltaX > 45) {
      handlePrevSlide();
    }
    touchStartXRef.current = null;
    setIsPaused(false);
  };

  const handleBannerClick = () => {
    if (onNavigateToOffer && activeBanner.id) {
      onNavigateToOffer(activeBanner.id);
    } else if (activeBanner.ctaAction) {
      activeBanner.ctaAction();
    } else {
      onShopNow(activeBanner.targetSegment);
    }
  };

  // Requirement #2: Top 4 Best Selling Products or Random 4 Products if no sales data
  const dealProducts = useMemo(() => {
    const source = allProducts && allProducts.length > 0 ? allProducts : [];
    const sorted = [...source].sort((a, b) => {
      const scoreA = (a.reviewsCount || 0) + (a.rating || 0) * 10 + (a.isBestProduct ? 500 : 0);
      const scoreB = (b.reviewsCount || 0) + (b.rating || 0) * 10 + (b.isBestProduct ? 500 : 0);
      return scoreB - scoreA;
    });

    const items = sorted.length >= 4 ? sorted.slice(0, 4) : source;

    if (items.length === 0) {
      return [
        {
          id: 'deal-phone',
          title: 'Phone 16 Pro Max',
          segment: 'wholesale' as const,
          category: 'Electronics',
          price: 390.90,
          rawPrice: 42999,
          rawOriginalPrice: 48999,
          discountPercent: 40,
          rating: 4.9,
          reviewsCount: 520,
          image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&q=80&w=300',
          seller: { id: 's1', name: 'Apex Wholesale BD', badge: 'Verified', verified: true },
          inStock: true,
          description: 'Titanium aerospace finish smartphone.',
        },
        {
          id: 'deal-headphones',
          title: 'Sony Headphones',
          segment: 'wholesale' as const,
          category: 'Electronics',
          price: 136.35,
          rawPrice: 14999,
          rawOriginalPrice: 24999,
          discountPercent: 40,
          rating: 4.8,
          reviewsCount: 318,
          image: headphoneImg,
          seller: { id: 's2', name: 'Apex Sound Labs', badge: 'Top Seller', verified: true },
          inStock: true,
          description: 'Over-ear noise cancelling studio audio system.',
        },
        {
          id: 'deal-watch',
          title: 'Smartwatch Ultra Series',
          segment: 'import' as const,
          category: 'Wearables',
          price: 72.50,
          rawPrice: 7999,
          rawOriginalPrice: 12999,
          discountPercent: 38,
          rating: 4.9,
          reviewsCount: 245,
          image: watchImg,
          seller: { id: 's3', name: 'Global Imports', badge: 'Imported', verified: true },
          inStock: true,
          description: 'Amoled sports smartwatch with GPS.',
        },
        {
          id: 'deal-sneakers',
          title: 'AeroStride Sneakers',
          segment: 'retail' as const,
          category: 'Fashion',
          price: 45.40,
          rawPrice: 4999,
          rawOriginalPrice: 7999,
          discountPercent: 35,
          rating: 4.7,
          reviewsCount: 190,
          image: sneakerImg,
          seller: { id: 's4', name: 'Urban Sole', badge: 'Official', verified: true },
          inStock: true,
          description: 'Lightweight breathable running shoes.',
        },
      ];
    }

    return items.map((p) => {
      const rawPrice = Math.round(p.price * 110);
      const rawOriginalPrice = p.originalPrice ? Math.round(p.originalPrice * 110) : Math.round(rawPrice * 1.3);
      const discountPercent = p.originalPrice && p.originalPrice > p.price
        ? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100)
        : 25;
      return {
        ...p,
        rawPrice,
        rawOriginalPrice,
        discountPercent: Math.max(10, Math.min(65, discountPercent)),
      };
    });
  }, [allProducts]);

  const formatDigits = (n: number) => n.toString().padStart(2, '0');

  // Requirement #1: If no active special offers exist, auto-hide section completely
  if (!banners || banners.length === 0) {
    return null;
  }

  return (
    <section id="special-offers" className="py-3 sm:py-4 bg-[#f8fafc] border-b border-slate-200/60">
      <div className="max-w-[1720px] mx-auto px-3 sm:px-4 lg:px-4 space-y-3">
        {/* ========================================================================= */}
        {/* MOBILE VIEW: Interactive Carousel Banner Only (Ultra-Slim Format & Aspect Scaling) */}
        <div className="block md:hidden space-y-1.5">
          {/* Mobile Interactive Ultra-Slim Special Offer Banner Card */}
          <div
            onClick={handleBannerClick}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            className="w-full bg-transparent rounded-2xl relative overflow-hidden shadow-md border border-slate-200/80 cursor-pointer active:scale-[0.99] transition-transform aspect-[3.5/1] sm:aspect-[4/1] min-h-[85px] max-h-[140px] flex flex-col justify-between p-2 sm:p-2.5 select-none"
          >
            {/* Pure Original Banner Creative Image (Full Aspect Scaling, No Crop / No Clipping) */}
            <img
              key={activeBanner.id}
              src={activeBanner.image}
              alt={activeBanner.title}
              className="absolute inset-0 w-full h-full object-contain object-center transition-all duration-500"
            />

            {/* Top Row: Pill Badge (Left) + Countdown Timer (Right) */}
            <div className="flex items-center justify-between gap-1.5 pb-0.5 relative z-10">
              <span
                className="px-2 py-0.5 rounded-full text-[8.5px] sm:text-[9px] font-black uppercase tracking-wider text-white shadow-md shrink-0"
                style={{ backgroundColor: activeBanner.badgeColor || '#0f766e' }}
              >
                {activeBanner.tag}
              </span>
              <div className="flex items-center gap-1 bg-black/75 backdrop-blur-xs px-1.5 sm:px-2 py-0.5 rounded-md border border-white/20 text-[8px] sm:text-[9px] font-mono text-white shadow-xs shrink-0">
                <span className="text-[7.5px] sm:text-[8px] text-teal-200 font-sans mr-0.5">Ends in</span>
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

            {/* Bottom Row: CTA Button on Right (No Crop, Compact & Fluid) */}
            <div className="flex items-center justify-end relative z-10 pt-0.5 mt-auto">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleBannerClick();
                }}
                className="inline-flex items-center justify-center gap-1 px-2.5 sm:px-3 py-0.5 sm:py-1 text-[9.5px] sm:text-[10.5px] font-extrabold text-white bg-[#0f766e] hover:bg-[#064e3b] active:scale-95 rounded-full shadow-md transition-all cursor-pointer"
              >
                <span>{activeBanner.ctaText || 'Shop Now'}</span>
                <ArrowRight className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" />
              </button>
            </div>
          </div>

          {/* Mobile Pagination Dots Indicator */}
          {isMultiple && (
            <div className="flex items-center justify-center gap-1.5 pt-0.5">
              {banners.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-1.5 rounded-full transition-all cursor-pointer ${
                    idx === currentIndex ? 'w-5 bg-[#0f766e]' : 'w-1.5 bg-slate-300 hover:bg-slate-400'
                  }`}
                  title={`Slide ${idx + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* DESKTOP VIEW: Interactive Carousel Banner + 4 Deal Cards (Ultra-Slim)     */}
        {/* ========================================================================= */}
        <div className="hidden md:grid md:grid-cols-12 gap-2.5 sm:gap-3 items-stretch">
          {/* LEFT: Dynamic Ultra-Slim Rectangular Carousel Banner (5 Cols on LG) */}
          <div
            onClick={handleBannerClick}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={handleMouseLeave}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            className={`md:col-span-5 bg-transparent p-3 sm:p-3.5 relative overflow-hidden shadow-md flex flex-col justify-between min-h-[110px] sm:min-h-[118px] lg:min-h-[120px] rounded-2xl border border-slate-200/80 select-none cursor-pointer ${
              isMultiple ? 'group' : ''
            }`}
          >
            {/* Pure Original Banner Creative Image (No dark gradient overlay, 100% natural colors) */}
            <img
              key={activeBanner.id}
              src={activeBanner.image}
              alt={activeBanner.title}
              className="absolute inset-0 w-full h-full object-cover object-center transition-all duration-500"
            />

            {/* Top Row: Badge + Slide counter + Countdown Timer */}
            <div className="relative z-10 flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <span
                  className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider text-white shadow-md"
                  style={{ backgroundColor: activeBanner.badgeColor || '#0f766e' }}
                >
                  {activeBanner.tag}
                </span>
                {isMultiple && (
                  <span className="hidden sm:inline-block text-[9px] px-1.5 py-0.2 bg-black/60 backdrop-blur-xs text-white rounded font-mono shadow-xs">
                    {currentIndex + 1}/{banners.length}
                  </span>
                )}
              </div>

              {/* Countdown Badge */}
              <div className="flex items-center gap-1 bg-black/70 backdrop-blur-xs px-2 py-0.5 rounded-lg border border-white/20 text-[9px] font-mono text-white shadow-xs">
                <span className="text-[8px] text-teal-200 font-sans mr-0.5">Ends in</span>
                {timeLeft.days > 0 && (
                  <span className="font-bold tabular-nums mr-0.5">{timeLeft.days}d</span>
                )}
                <span className="font-bold tabular-nums">
                  {formatDigits(timeLeft.days > 0 ? timeLeft.hours % 24 : timeLeft.hours)}
                </span>
                <span>:</span>
                <span className="font-bold tabular-nums">{formatDigits(timeLeft.minutes)}</span>
                <span>:</span>
                <span className="font-bold tabular-nums text-amber-300 animate-pulse">
                  {formatDigits(timeLeft.seconds)}
                </span>
              </div>
            </div>

            {/* Bottom Row: Carousel Dots + CTA Button */}
            <div className="relative z-10 pt-0.5 flex items-end justify-between gap-2 mt-auto">
              {/* Carousel Pagination Dots */}
              {isMultiple ? (
                <div className="flex items-center gap-1 bg-black/60 backdrop-blur-xs px-2 py-0.5 rounded-full border border-white/20 shadow-xs">
                  {banners.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentIndex(idx);
                      }}
                      className={`h-1.5 rounded-full transition-all cursor-pointer ${
                        idx === currentIndex
                          ? 'w-4 bg-emerald-400'
                          : 'w-1.5 bg-white/60 hover:bg-white'
                      }`}
                      title={`Slide ${idx + 1}`}
                    />
                  ))}
                </div>
              ) : (
                <div />
              )}

              {/* CTA Button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleBannerClick();
                }}
                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1 text-[11px] font-extrabold text-white bg-[#0f766e] hover:bg-[#064e3b] active:scale-95 rounded-full shadow-md transition-all cursor-pointer group/btn"
              >
                <span>{activeBanner.ctaText || 'Shop Now'}</span>
                <ArrowRight className="w-3 h-3 text-white group-hover/btn:translate-x-0.5 transition-transform" />
              </button>
            </div>

            {/* Hover Arrow Controls */}
            {isMultiple && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePrevSlide();
                  }}
                  className="absolute left-1.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-black/60 hover:bg-[#0f766e] text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-xs border border-white/20 cursor-pointer z-20 shadow-sm"
                  title="Previous Offer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNextSlide();
                  }}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-black/60 hover:bg-[#0f766e] text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-xs border border-white/20 cursor-pointer z-20 shadow-sm"
                  title="Next Offer"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </div>

          {/* RIGHT: 4 Deal Products (7 Cols on LG, Compact Ultra-Slim Height Matched with Banner) */}
          <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-4 gap-2 items-stretch">
            {dealProducts.map((prod) => {
              const segmentBadge =
                prod.segment === 'wholesale'
                  ? { label: 'Wholesale', bg: 'bg-[#0f766e]/10 text-[#0f766e] border-teal-300/80' }
                  : prod.segment === 'import'
                  ? { label: 'Import', bg: 'bg-[#0f766e]/10 text-[#0f766e] border-teal-300/80' }
                  : { label: 'Retail', bg: 'bg-[#0f766e]/10 text-[#0f766e] border-teal-300/80' };

              return (
                <div
                  key={prod.id}
                  className="bg-white rounded-xl sm:rounded-2xl border border-slate-100 hover:border-teal-300 hover:shadow-xs transition-all p-2 flex flex-col justify-between group relative overflow-hidden h-full min-h-[110px] sm:min-h-[118px] lg:min-h-[120px]"
                >
                  {/* Top Segment Badge */}
                  <div className="flex items-center justify-between gap-1 z-10">
                    <span
                      className={`px-1.5 py-0.2 text-[8px] sm:text-[9px] font-bold rounded-md border ${segmentBadge.bg}`}
                    >
                      {segmentBadge.label}
                    </span>
                  </div>

                  {/* Product Image */}
                  <div
                    onClick={() => onQuickView(prod)}
                    className="h-16 sm:h-18 w-full my-0.5 flex items-center justify-center cursor-pointer overflow-hidden rounded-lg bg-slate-50/20"
                  >
                    <img
                      src={prod.image}
                      alt={prod.title}
                      className="w-full h-full object-contain object-center group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  {/* Title & Price Info */}
                  <div className="space-y-0.5">
                    <h3
                      onClick={() => onQuickView(prod)}
                      className="font-bold text-[10px] sm:text-[11px] text-slate-800 group-hover:text-[#0f766e] transition-colors line-clamp-1 leading-tight cursor-pointer"
                      title={prod.title}
                    >
                      {prod.title}
                    </h3>

                    {/* Price Row */}
                    <div className="flex items-baseline gap-1">
                      <span className="text-[10px] sm:text-[11px] font-black text-slate-900 font-mono tabular-nums">
                        ৳ {prod.rawPrice.toLocaleString()}
                      </span>
                      <span className="text-[8px] sm:text-[9px] font-semibold text-slate-400 line-through font-mono tabular-nums">
                        ৳ {prod.rawOriginalPrice.toLocaleString()}
                      </span>
                    </div>

                    {/* Red Discount Pill Badge */}
                    <div className="pt-0.5">
                      <span className="inline-block px-1.5 py-0.2 text-[7px] sm:text-[8px] font-bold bg-rose-500 text-white rounded shadow-2xs">
                        {prod.discountPercent}% OFF
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
