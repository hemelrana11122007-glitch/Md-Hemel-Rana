import React, { useState, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  Truck,
  RotateCcw,
  Headphones,
  Sparkles,
  Bot,
  ShoppingBag,
} from 'lucide-react';
import heroMarketplaceImg from '../assets/images/hero_marketplace_lifestyle_1790625704312.jpg';
import heroMobileModelImg from '../assets/images/hero_mobile_shopping_model_1790628376818.jpg';
import sobaiAvatarImg from '../assets/images/sobai_ai_robot_avatar_1790625723414.jpg';

interface HeroSliderProps {
  onShopNow: () => void;
  onExploreWholesale: () => void;
  onExploreImports: () => void;
  onOpenAIAssistant?: () => void;
}

export const HeroSlider: React.FC<HeroSliderProps> = ({
  onShopNow,
  onExploreWholesale,
  onExploreImports,
  onOpenAIAssistant,
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      id: 1,
      badge: 'AR Market BD',
      title: 'Biggest Deals On Your Favourite Products',
      desktopTitle: 'Your Trusted Multi-Vendor Marketplace',
      subheading: 'Retail • Wholesale • Import',
      description:
        'Connecting retail shoppers, wholesale buyers, and verified importers with guaranteed quality, tiered factory MOQ, and fast dispatch across Bangladesh.',
      ctaText: 'Shop Now',
      ctaAction: onShopNow,
      themeBg: 'from-[#042f24] via-[#064e3b] to-[#0f766e]',
      desktopBg: 'from-[#e6f4f1] via-[#f0fdf4] to-[#ccfbf1]/80',
    },
    {
      id: 2,
      badge: 'B2B Wholesale Hub',
      title: 'Factory Direct Sourcing & Bulk Tiers',
      desktopTitle: 'Wholesale Bulk Sourcing & Tiered MOQ',
      subheading: 'Direct Factory Prices',
      description:
        'Save up to 45% on bulk lots with verified factory sellers, custom OEM specifications, and transparent freight container booking across Bangladesh.',
      ctaText: 'Shop Wholesale',
      ctaAction: onExploreWholesale,
      themeBg: 'from-[#042f24] via-[#064e3b] to-[#0f766e]',
      desktopBg: 'from-[#fef3c7] via-[#fffbeb] to-[#f0fdf4]',
    },
    {
      id: 3,
      badge: 'Worldwide Imports',
      title: 'Curated Direct Imports Pre-Cleared',
      desktopTitle: 'Curated Direct Imports Pre-Cleared',
      subheading: 'Europe • Japan • South Korea',
      description:
        'Certified luxury electronics, precision smartwatches, and beauty skincare with pre-cleared customs and rapid 3–7 business day express delivery.',
      ctaText: 'Browse Imports',
      ctaAction: onExploreImports,
      themeBg: 'from-[#042f24] via-[#064e3b] to-[#0f766e]',
      desktopBg: 'from-[#e0e7ff] via-[#f0fdfa] to-[#ccfbf1]',
    },
    {
      id: 4,
      badge: 'Flash Mega Sale',
      title: 'Top Rated Tech Gadgets & Lifestyle',
      desktopTitle: 'Trending Tech Gadgets & Lifestyle',
      subheading: 'Limited Time Discounts',
      description:
        'Exclusive daily deals on top rated studio headphones, road run sneakers, and authentic smartwatches with fast home delivery.',
      ctaText: 'Shop Deals',
      ctaAction: onShopNow,
      themeBg: 'from-[#042f24] via-[#064e3b] to-[#0f766e]',
      desktopBg: 'from-[#fdf2f8] via-[#f0fdf4] to-[#ccfbf1]',
    },
  ];

  // Auto-advance slides every 5s
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const slide = slides[currentSlide];

  // 5-Column Trust Badges Data
  const trustBadges = [
    {
      id: 1,
      icon: ShieldCheck,
      title: 'Verified Sellers',
      subtitle: 'Trusted & Secure',
    },
    {
      id: 2,
      icon: CreditCard,
      title: 'Secure Payment',
      subtitle: 'Multiple Options',
    },
    {
      id: 3,
      icon: Truck,
      title: 'Fast Delivery',
      subtitle: 'Across Bangladesh',
    },
    {
      id: 4,
      icon: RotateCcw,
      title: 'Easy Returns',
      subtitle: 'Hassle Free',
    },
    {
      id: 5,
      icon: Headphones,
      title: '24/7 Support',
      subtitle: "We're Here For You",
    },
  ];

  return (
    <section id="hero" className="w-full bg-[#f8fafc] pt-2 pb-3.5">
      <div className="max-w-[1536px] mx-auto px-3 sm:px-5 lg:px-6 space-y-3">
        {/* ========================================================================= */}
        {/* 1. MOBILE HERO SLIDER (Slim, Compact Full-Width Banner, No AI Card)       */}
        {/* ========================================================================= */}
        <div className="block lg:hidden">
          {/* Full-Width Rounded Slim Banner Card */}
          <div
            className="w-full bg-gradient-to-r from-[#042f24] via-[#064e3b] to-[#0f766e] text-white rounded-2xl p-3.5 sm:p-4 relative overflow-hidden shadow-sm min-h-[145px] sm:min-h-[165px] flex flex-col justify-between"
          >
            {/* Background Image / Model Graphic on Right */}
            <div className="absolute right-0 bottom-0 top-0 w-2/5 sm:w-1/2 pointer-events-none overflow-hidden">
              <img
                src={heroMobileModelImg}
                alt="Shopping Deals Model"
                className="w-full h-full object-cover object-center transform scale-105 drop-shadow-md"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#042f24] via-transparent to-transparent" />
            </div>

            {/* Slider Left Content */}
            <div className="relative z-10 max-w-[62%] sm:max-w-[60%] space-y-1">
              <h2 className="text-sm sm:text-lg font-black text-white tracking-tight font-display leading-snug">
                {slide.title}
              </h2>

              <p className="text-[10px] sm:text-xs font-extrabold text-emerald-200 tracking-wide">
                {slide.subheading}
              </p>

              <div className="pt-1.5">
                <button
                  type="button"
                  onClick={slide.ctaAction}
                  className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1 text-[11px] font-extrabold text-slate-900 bg-white hover:bg-emerald-50 active:scale-95 rounded-full shadow-md transition-all cursor-pointer"
                >
                  <span>{slide.ctaText}</span>
                  <ArrowRight className="w-3 h-3 text-[#0f766e]" />
                </button>
              </div>
            </div>

            {/* Subtle Tropical Leaves Decoration in Background */}
            <div className="absolute -bottom-8 -left-8 w-28 h-28 rounded-full bg-emerald-400/10 blur-xl pointer-events-none" />
          </div>

          {/* 4 Centered Slider Indicator Dots Outside/Below the Banner */}
          <div className="flex items-center justify-center gap-1.5 mt-2">
            {slides.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentSlide(idx)}
                className={`h-1.5 rounded-full transition-all cursor-pointer ${
                  idx === currentSlide
                    ? 'w-5 bg-[#0f766e]'
                    : 'w-1.5 bg-slate-300 hover:bg-slate-400'
                }`}
                title={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 2. DESKTOP HERO SECTION (Equal Height Stretched Grid: Left Slider + Right AI)*/}
        {/* ========================================================================= */}
        <div className="hidden lg:grid lg:grid-cols-12 gap-3.5 items-stretch">
          {/* LEFT: Main Hero Slider (8 Cols on Desktop, Slim Height) */}
          <div
            className={`lg:col-span-8 bg-gradient-to-br ${slide.desktopBg} rounded-3xl border border-teal-600/20 p-5 sm:p-6 relative overflow-hidden shadow-2xs flex flex-col justify-between min-h-[250px] lg:min-h-[270px] transition-all duration-700`}
          >
            {/* Background Graphic Blend */}
            <div className="absolute right-0 bottom-0 top-0 w-1/2 pointer-events-none opacity-70 mix-blend-multiply overflow-hidden">
              <img
                src={heroMarketplaceImg}
                alt="AR Market BD Lifestyle Banner"
                className="w-full h-full object-cover object-right transform scale-105 transition-transform duration-1000"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#e6f4f1] via-[#e6f4f1]/80 to-transparent" />
            </div>

            {/* Slider Content */}
            <div className="relative z-10 max-w-lg space-y-2">
              {/* Pill Badge */}
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#0f766e] text-white shadow-2xs">
                <Sparkles className="w-3 h-3 text-emerald-200" />
                <span>{slide.badge}</span>
              </div>

              {/* Big Heading */}
              <h1 className="text-xl sm:text-2xl lg:text-[28px] font-black text-slate-900 tracking-tight font-display leading-[1.15] text-balance">
                {slide.desktopTitle}
              </h1>

              {/* Subheading */}
              <div className="text-xs sm:text-sm font-extrabold text-[#0f766e] tracking-wide">
                {slide.subheading}
              </div>

              {/* Short Description */}
              <p className="text-xs font-semibold text-slate-700 leading-relaxed max-w-md text-balance line-clamp-2">
                {slide.description}
              </p>

              {/* Dark Teal 'Shop Now →' Button */}
              <div className="pt-1 flex items-center gap-3">
                <button
                  type="button"
                  onClick={slide.ctaAction}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2 text-xs sm:text-sm font-extrabold text-white bg-[#0f766e] hover:bg-[#115e59] active:scale-95 rounded-full shadow-md shadow-teal-900/20 transition-all cursor-pointer group"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>{slide.ctaText}</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>

            {/* Bottom Controls (Arrows + Dots) */}
            <div className="relative z-10 pt-3 flex items-center justify-between">
              {/* Dots */}
              <div className="flex items-center gap-1.5 bg-white/80 backdrop-blur-xs px-2.5 py-1 rounded-full border border-teal-200/80 shadow-2xs">
                {slides.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCurrentSlide(idx)}
                    className={`h-1.5 rounded-full transition-all cursor-pointer ${
                      idx === currentSlide
                        ? 'w-5 bg-[#0f766e]'
                        : 'w-1.5 bg-slate-300 hover:bg-slate-400'
                    }`}
                    title={`Slide ${idx + 1}`}
                  />
                ))}
              </div>

              {/* Left / Right Nav Buttons */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)}
                  className="w-7 h-7 rounded-full bg-white/90 hover:bg-[#0f766e] hover:text-white text-slate-800 flex items-center justify-center shadow-xs border border-slate-200 transition-all cursor-pointer"
                  title="Previous Slide"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}
                  className="w-7 h-7 rounded-full bg-white/90 hover:bg-[#0f766e] hover:text-white text-slate-800 flex items-center justify-center shadow-xs border border-slate-200 transition-all cursor-pointer"
                  title="Next Slide"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT: Sobai AI Assistant Card (4 Cols on Desktop, Equal Height Stretched) */}
          <div className="lg:col-span-4 bg-gradient-to-br from-[#0f766e] via-[#115e59] to-[#064e3b] rounded-3xl p-5 sm:p-6 text-white relative overflow-hidden shadow-md flex flex-col justify-between min-h-[250px] lg:min-h-[270px] border border-teal-500/30">
            {/* Header Content */}
            <div className="space-y-2 relative z-10">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
                  AI
                </span>
                <span className="text-xs font-bold text-teal-200">
                  Meet Sobai AI
                </span>
              </div>

              <h2 className="text-lg sm:text-xl font-black text-white tracking-tight font-display leading-snug">
                Your Smart Shopping Assistant
              </h2>

              <p className="text-xs font-medium text-teal-100 leading-relaxed line-clamp-2">
                Need help finding deals, wholesale bulk pricing, or tracking import parcels?
              </p>

              {/* White Pill Button 'Chat Now →' */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={onOpenAIAssistant}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-1.5 text-xs font-extrabold text-[#064e3b] bg-white hover:bg-emerald-50 active:scale-95 rounded-full shadow-md transition-all cursor-pointer group"
                >
                  <Bot className="w-3.5 h-3.5 text-[#0f766e]" />
                  <span>Chat Now</span>
                  <ArrowRight className="w-3 h-3 text-[#0f766e] group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>

            {/* Bottom 3D AI Robot Avatar + Chat Bubble */}
            <div className="relative z-10 pt-2 flex items-end justify-between">
              {/* Chat Bubble */}
              <div className="bg-white text-slate-900 font-extrabold text-[11px] px-3 py-1 rounded-xl rounded-bl-xs shadow-md inline-flex items-center gap-1.5 animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                <span>Hi! I'm Sobai AI</span>
              </div>

              {/* 3D AI Robot Image */}
              <div className="relative">
                <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-xl overflow-hidden ring-2 ring-white/20 shadow-xl bg-teal-900/40">
                  <img
                    src={sobaiAvatarImg}
                    alt="Sobai AI Avatar"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>

            {/* Decorative background glow */}
            <div className="absolute -top-10 -right-10 w-36 h-36 rounded-full bg-emerald-400/20 blur-2xl pointer-events-none" />
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 3. VALUE PROPOSITION TRUST BADGES (5-Column Grid, Aligned & Compact)      */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-2.5">
          {trustBadges.map((badge) => {
            const IconComponent = badge.icon;
            return (
              <div
                key={badge.id}
                className="bg-white hover:bg-[#f0fdf4] transition-all rounded-xl sm:rounded-2xl p-2.5 sm:p-3 border border-slate-200/90 hover:border-teal-300 shadow-2xs hover:shadow-xs flex items-center gap-2 sm:gap-2.5 group cursor-default"
              >
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-teal-50 text-[#0f766e] group-hover:bg-[#0f766e] group-hover:text-white transition-all flex items-center justify-center shrink-0 shadow-2xs">
                  <IconComponent className="w-3.5 h-3.5 sm:w-4.5 sm:h-4.5" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-black text-xs sm:text-[13px] text-slate-900 truncate">
                    {badge.title}
                  </h3>
                  <p className="text-[10px] sm:text-[11px] text-slate-500 font-bold truncate">
                    {badge.subtitle}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
