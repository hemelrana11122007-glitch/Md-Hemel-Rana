import React, { useState, useEffect, useRef } from 'react';
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
import specialOfferBannerImg1 from '../assets/images/special_offer_emerald_headphones_1790626974829.jpg';
import specialOfferBannerImg2 from '../assets/images/special_offer_b2b_wholesale_1790627764898.jpg';
import specialOfferBannerImg3 from '../assets/images/special_offer_global_imports_1790627775866.jpg';
import sneakerImg from '../assets/images/fashion_sneakers_product_1790256916173.jpg';
import headphoneImg from '../assets/images/gadgets_headphones_product_1790256932369.jpg';
import watchImg from '../assets/images/import_smartwatch_global_1790256962650.jpg';
import wholesaleImg from '../assets/images/wholesale_bulk_supplies_1790256947667.jpg';

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
}

interface SpecialOfferSectionProps {
  onShopNow: (targetSegment?: string) => void;
  onAddToCart: (product: Product, quantity?: number) => void;
  onQuickView: (product: Product) => void;
  customBanners?: OfferBannerItem[];
}

export const SpecialOfferSection: React.FC<SpecialOfferSectionProps> = ({
  onShopNow,
  onAddToCart,
  onQuickView,
  customBanners,
}) => {
  // Live Countdown Timer (Ends in 02:14:36)
  const [timeLeft, setTimeLeft] = useState({
    hours: 2,
    minutes: 14,
    seconds: 36,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return { hours: 2, minutes: 30, seconds: 0 };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Default Multiple Offer Banners
  const defaultBanners: OfferBannerItem[] = [
    {
      id: 'banner-1',
      tag: 'Special Offer',
      title: 'Up to 50% OFF',
      subtitle: 'Top Rated Products',
      ratingText: '★ 4.9',
      image: specialOfferBannerImg1,
      ctaText: 'Shop Now',
      targetSegment: 'retail',
    },
    {
      id: 'banner-2',
      tag: 'Factory Direct',
      title: 'Save up to 45%',
      subtitle: 'Bulk Wholesale Tiering',
      ratingText: '★ 4.8',
      image: specialOfferBannerImg2,
      ctaText: 'View Wholesale',
      targetSegment: 'wholesale',
    },
    {
      id: 'banner-3',
      tag: 'Global Imports',
      title: 'Flat 40% OFF',
      subtitle: 'Pre-Cleared Customs',
      ratingText: '★ 5.0',
      image: specialOfferBannerImg3,
      ctaText: 'Browse Imports',
      targetSegment: 'import',
    },
  ];

  // Active Banners
  const banners = customBanners && customBanners.length > 0 ? customBanners : defaultBanners;
  const isMultiple = banners.length > 1;

  // Carousel & Drag State
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const dragStartXRef = useRef<number | null>(null);
  const touchStartXRef = useRef<number | null>(null);

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

  const activeBanner = banners[currentIndex] || banners[0];

  // 4 Featured Deal Products matching screenshot (Desktop only)
  const dealProducts: (Product & { discountPercent: number; rawPrice: number; rawOriginalPrice: number })[] = [
    {
      id: 'deal-phone',
      title: 'Phone 16 Pro Max',
      segment: 'wholesale',
      category: 'Electronics & Tech',
      price: 390.90,
      rawPrice: 42999,
      rawOriginalPrice: 48999,
      discountPercent: 40,
      rating: 4.9,
      reviewsCount: 520,
      image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&q=80&w=300',
      seller: {
        id: 'sel-deal-1',
        name: 'Apex Wholesale BD',
        badge: 'Verified Wholesaler',
        verified: true,
      },
      inStock: true,
      description: 'Titanium aerospace finish smartphone with advanced camera and fast charging.',
    },
    {
      id: 'deal-headphones',
      title: 'Sony Headphones',
      segment: 'wholesale',
      category: 'Electronics & Tech',
      price: 136.35,
      rawPrice: 14999,
      rawOriginalPrice: 24999,
      discountPercent: 40,
      rating: 4.8,
      reviewsCount: 318,
      image: headphoneImg,
      seller: {
        id: 'sel-deal-2',
        name: 'Apex Sound Labs',
        badge: 'Top Tech Seller',
        verified: true,
      },
      inStock: true,
      description: 'Over-ear noise cancelling studio audio system with deep bass drivers.',
    },
    {
      id: 'deal-skincare',
      title: 'Skin Care Set',
      segment: 'import',
      category: 'Beauty & Health',
      price: 11.80,
      rawPrice: 1299,
      rawOriginalPrice: 1899,
      discountPercent: 30,
      rating: 4.9,
      reviewsCount: 188,
      image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&q=80&w=300',
      seller: {
        id: 'sel-deal-3',
        name: 'Global Beauty Direct',
        badge: 'Certified Importer',
        verified: true,
      },
      inStock: true,
      description: 'Organic hydration set with natural plant extracts and facial serum.',
    },
    {
      id: 'deal-sneakers',
      title: 'Nike Sneakers',
      segment: 'retail',
      category: 'Fashion & Apparel',
      price: 24.50,
      rawPrice: 2699,
      rawOriginalPrice: 4499,
      discountPercent: 40,
      rating: 4.7,
      reviewsCount: 420,
      image: sneakerImg,
      seller: {
        id: 'sel-deal-4',
        name: 'Sprint Footwear BD',
        badge: 'Verified Retailer',
        verified: true,
      },
      inStock: true,
      description: 'Active mesh runner sneakers with air cushion midsole and grip outsole.',
    },
  ];

  const formatDigits = (n: number) => n.toString().padStart(2, '0');

  return (
    <section id="special-offers" className="py-3 sm:py-4 bg-[#f8fafc] border-b border-slate-200/60">
      <div className="max-w-[1536px] mx-auto px-3 sm:px-5 lg:px-6 space-y-3">
        {/* ========================================================================= */}
        {/* MOBILE VIEW: Interactive Carousel Banner Only (Bottom Grid Removed)       */}
        {/* ========================================================================= */}
        <div className="block md:hidden space-y-2">
          {/* Mobile Interactive Special Offer Banner Card */}
          <div
            onClick={() => {
              if (activeBanner.ctaAction) activeBanner.ctaAction();
              else onShopNow(activeBanner.targetSegment);
            }}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            className="bg-gradient-to-r from-[#042f24] via-[#064e3b] to-[#0f766e] text-white p-4 rounded-2xl relative overflow-hidden shadow-md border border-teal-600/30 cursor-pointer active:scale-[0.99] transition-transform"
          >
            {/* Top Row: Pill Badge (Left) + Countdown Timer (Right) */}
            <div className="flex items-center justify-between pb-2 relative z-10">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
                {activeBanner.tag}
              </span>
              <div className="flex items-center gap-1 bg-black/40 backdrop-blur-xs px-2 py-0.5 rounded-md border border-white/15 text-[10px] font-mono text-white">
                <span className="text-[9px] text-teal-200 font-sans mr-0.5">Ends in</span>
                <span className="font-bold tabular-nums">{formatDigits(timeLeft.hours)}</span>
                <span>:</span>
                <span className="font-bold tabular-nums">{formatDigits(timeLeft.minutes)}</span>
                <span>:</span>
                <span className="font-bold tabular-nums text-amber-300 animate-pulse">{formatDigits(timeLeft.seconds)}</span>
              </div>
            </div>

            {/* Main Content Row: Text & CTA on Left, Products Image on Right */}
            <div className="flex items-center justify-between gap-2 relative z-10 pt-1">
              <div className="space-y-1 max-w-[60%]">
                <h3 className="text-lg font-black text-white font-display leading-tight tracking-tight">
                  {activeBanner.title}
                </h3>
                <p className="text-[11px] font-medium text-emerald-100">
                  {activeBanner.subtitle}
                </p>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (activeBanner.ctaAction) activeBanner.ctaAction();
                      else onShopNow(activeBanner.targetSegment);
                    }}
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-1.5 text-xs font-bold text-slate-900 bg-white active:scale-95 rounded-full shadow-md transition-all cursor-pointer"
                  >
                    <span>{activeBanner.ctaText || 'Shop Now'}</span>
                    <ArrowRight className="w-3 h-3 text-[#0f766e]" />
                  </button>
                </div>
              </div>

              {/* Product Image Right */}
              <div className="w-28 h-20 relative shrink-0">
                <img
                  key={activeBanner.id}
                  src={activeBanner.image}
                  alt={activeBanner.title}
                  className="w-full h-full object-contain drop-shadow-md animate-in fade-in duration-500"
                />
              </div>
            </div>

            {/* Background gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#042f24] via-transparent to-transparent pointer-events-none" />
          </div>

          {/* Mobile Pagination Dots Indicator */}
          {isMultiple && (
            <div className="flex items-center justify-center gap-1.5 pt-1">
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
        {/* DESKTOP VIEW: Interactive Carousel Banner + 4 Deal Cards                  */}
        {/* ========================================================================= */}
        <div className="hidden md:grid md:grid-cols-12 gap-3 sm:gap-3.5 items-stretch">
          {/* LEFT: Dynamic Rectangular Carousel Banner (5 Cols on LG) */}
          <div
            onClick={() => {
              if (activeBanner.ctaAction) activeBanner.ctaAction();
              else onShopNow(activeBanner.targetSegment);
            }}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={handleMouseLeave}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            className={`md:col-span-5 bg-gradient-to-r from-[#042f24] via-[#064e3b] to-[#0f766e] text-white p-4 sm:p-5 relative overflow-hidden shadow-md flex flex-col justify-between min-h-[145px] sm:min-h-[155px] lg:min-h-[160px] rounded-2xl border border-teal-600/30 select-none cursor-pointer ${
              isMultiple ? 'group' : ''
            }`}
          >
            {/* Background Image Slide with Smooth Transition */}
            <div className="absolute right-0 top-0 bottom-0 w-3/5 sm:w-1/2 pointer-events-none overflow-hidden opacity-95">
              <img
                key={activeBanner.id}
                src={activeBanner.image}
                alt={activeBanner.title}
                className="w-full h-full object-cover object-right transition-opacity duration-700 animate-in fade-in"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#042f24] via-[#042f24]/75 to-transparent" />
            </div>

            {/* Left Text Content */}
            <div className="space-y-0.5 relative z-10 max-w-[58%]">
              <div className="text-xs sm:text-sm font-extrabold text-emerald-200 tracking-wide flex items-center gap-1.5">
                <span>{activeBanner.tag}</span>
                {isMultiple && (
                  <span className="hidden sm:inline-block text-[9px] px-1.5 py-0.2 bg-emerald-500/20 text-emerald-300 rounded font-mono">
                    {currentIndex + 1}/{banners.length}
                  </span>
                )}
              </div>
              <h2 className="text-base sm:text-lg lg:text-xl font-black text-white tracking-tight font-display leading-tight">
                {activeBanner.title}
              </h2>
              <p className="text-[10px] sm:text-[11px] font-medium text-emerald-100/90 pt-0.5">
                {activeBanner.subtitle}
              </p>

              {/* Colorful Rating Dots Indicator & Slide Indicators */}
              <div className="flex items-center gap-2 pt-1">
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-300" />
                  <span className="text-[9px] text-emerald-200 font-bold ml-0.5">
                    {activeBanner.ratingText || '★ 4.9'}
                  </span>
                </div>

                {/* Carousel Pagination Dots (Only visible if multiple banners exist) */}
                {isMultiple && (
                  <div className="flex items-center gap-1 ml-2 bg-black/30 backdrop-blur-xs px-2 py-0.5 rounded-full border border-white/10">
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
                            : 'w-1.5 bg-white/40 hover:bg-white'
                        }`}
                        title={`Slide ${idx + 1}`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Controls (Countdown Timer + Shop Now Button) */}
            <div className="relative z-10 pt-1 flex items-end justify-between gap-2">
              <div className="hidden sm:block" />

              <div className="flex items-center gap-2 ml-auto flex-wrap">
                {/* Countdown Badge */}
                <div className="flex items-center gap-1 bg-black/40 backdrop-blur-xs px-2.5 py-1 rounded-lg border border-white/15 text-[10px] font-mono text-white">
                  <span className="text-[9px] text-teal-200 font-sans mr-0.5">Ends in</span>
                  <span className="font-bold tabular-nums">{formatDigits(timeLeft.hours)}</span>
                  <span>:</span>
                  <span className="font-bold tabular-nums">{formatDigits(timeLeft.minutes)}</span>
                  <span>:</span>
                  <span className="font-bold tabular-nums text-amber-300 animate-pulse">
                    {formatDigits(timeLeft.seconds)}
                  </span>
                </div>

                {/* White Pill Button 'Shop Now →' */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (activeBanner.ctaAction) {
                      activeBanner.ctaAction();
                    } else {
                      onShopNow(activeBanner.targetSegment);
                    }
                  }}
                  className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 text-[11px] font-bold text-slate-900 bg-white hover:bg-emerald-50 active:scale-95 rounded-full shadow-md transition-all cursor-pointer group/btn"
                >
                  <span>{activeBanner.ctaText || 'Shop Now'}</span>
                  <ArrowRight className="w-3 h-3 text-[#0f766e] group-hover/btn:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>

            {/* Hover Arrow Controls (Only if Multiple Banners) */}
            {isMultiple && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePrevSlide();
                  }}
                  className="absolute left-1.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-black/40 hover:bg-[#0f766e] text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-xs border border-white/20 cursor-pointer z-20"
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
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-black/40 hover:bg-[#0f766e] text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-xs border border-white/20 cursor-pointer z-20"
                  title="Next Offer"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </div>

          {/* RIGHT: 4 Deal Products (7 Cols on LG, Compact Height Matched with Banner) */}
          <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5 items-stretch">
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
                  className="bg-white rounded-xl sm:rounded-2xl border border-slate-100 hover:border-teal-300 hover:shadow-xs transition-all p-2.5 flex flex-col justify-between group relative overflow-hidden min-h-[145px] sm:min-h-[155px] lg:min-h-[160px]"
                >
                  {/* Top Segment Badge */}
                  <div className="flex items-center justify-between gap-1 z-10">
                    <span
                      className={`px-1.5 py-0.2 text-[9px] font-bold rounded-md border ${segmentBadge.bg}`}
                    >
                      {segmentBadge.label}
                    </span>
                  </div>

                  {/* Product Image */}
                  <div
                    onClick={() => onQuickView(prod)}
                    className="h-16 sm:h-18 w-full my-0.5 flex items-center justify-center cursor-pointer overflow-hidden rounded-lg p-1"
                  >
                    <img
                      src={prod.image}
                      alt={prod.title}
                      className="max-h-full max-w-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  {/* Title & Price Info */}
                  <div className="space-y-0.5">
                    <h3
                      onClick={() => onQuickView(prod)}
                      className="font-bold text-[11px] sm:text-xs text-slate-800 group-hover:text-[#0f766e] transition-colors line-clamp-1 leading-tight cursor-pointer"
                      title={prod.title}
                    >
                      {prod.title}
                    </h3>

                    {/* Price Row matching screenshot */}
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-[11px] sm:text-xs font-black text-slate-900 font-mono tabular-nums">
                        ৳ {prod.rawPrice.toLocaleString()}
                      </span>
                      <span className="text-[9px] font-semibold text-slate-400 line-through font-mono tabular-nums">
                        ৳ {prod.rawOriginalPrice.toLocaleString()}
                      </span>
                    </div>

                    {/* Red Discount Pill Badge */}
                    <div className="pt-0.5">
                      <span className="inline-block px-1.5 py-0.2 text-[8px] sm:text-[9px] font-bold bg-rose-500 text-white rounded shadow-2xs">
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
