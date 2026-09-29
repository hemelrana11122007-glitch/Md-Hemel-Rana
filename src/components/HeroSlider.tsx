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
import {
  sliderService,
  MainSliderItem,
  SideBannerItem,
  SLIDERS_UPDATED_EVENT,
} from '../services/sliderService';

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
  const [currentSideIndex, setCurrentSideIndex] = useState(0);

  const [mainSliders, setMainSliders] = useState<MainSliderItem[]>(() => {
    const active = sliderService.getMainSliders().filter((s) => s.isActive);
    return active.length > 0 ? active : [];
  });

  const [sideBanners, setSideBanners] = useState<SideBannerItem[]>(() => {
    const active = sliderService.getSideBanners().filter((s) => s.isActive);
    return active.length > 0 ? active : [];
  });

  // Listen to Admin Panel live updates
  useEffect(() => {
    const syncSliders = () => {
      const activeMain = sliderService.getMainSliders().filter((s) => s.isActive);
      const activeSide = sliderService.getSideBanners().filter((s) => s.isActive);
      setMainSliders(activeMain);
      setSideBanners(activeSide);
    };

    syncSliders();
    window.addEventListener(SLIDERS_UPDATED_EVENT, syncSliders);
    window.addEventListener('storage', syncSliders);

    return () => {
      window.removeEventListener(SLIDERS_UPDATED_EVENT, syncSliders);
      window.removeEventListener('storage', syncSliders);
    };
  }, []);

  // Default fallback slides if none active
  const fallbackSlides: MainSliderItem[] = [
    {
      id: 'fallback-1',
      badge: 'AR Market BD',
      title: 'Biggest Deals On Your Favourite Products',
      desktopTitle: 'Your Trusted Multi-Vendor Marketplace',
      subheading: 'Retail • Wholesale • Import',
      description:
        'Connecting retail shoppers, wholesale buyers, and verified importers with guaranteed quality, tiered factory MOQ, and fast dispatch across Bangladesh.',
      imageUrl: heroMarketplaceImg,
      ctaText: 'Shop Now',
      ctaLink: '/shop',
      themeBg: 'from-[#042f24] via-[#064e3b] to-[#0f766e]',
      desktopBg: 'from-[#e6f4f1] via-[#f0fdf4] to-[#ccfbf1]/80',
      isActive: true,
      createdAt: '',
    },
    {
      id: 'fallback-2',
      badge: 'B2B Wholesale Hub',
      title: 'Factory Direct Sourcing & Bulk Tiers',
      desktopTitle: 'Wholesale Bulk Sourcing & Tiered MOQ',
      subheading: 'Direct Factory Prices',
      description:
        'Save up to 45% on bulk lots with verified factory sellers, custom OEM specifications, and transparent freight container booking across Bangladesh.',
      imageUrl: heroMobileModelImg,
      ctaText: 'Shop Wholesale',
      ctaLink: '/wholesale',
      themeBg: 'from-[#042f24] via-[#064e3b] to-[#0f766e]',
      desktopBg: 'from-[#fef3c7] via-[#fffbeb] to-[#f0fdf4]',
      isActive: true,
      createdAt: '',
    },
  ];

  const activeMainSlides = mainSliders.length > 0 ? mainSliders : fallbackSlides;

  // Auto-advance main slides
  useEffect(() => {
    if (activeMainSlides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % activeMainSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [activeMainSlides.length]);

  // Reset index if out of bounds
  useEffect(() => {
    if (currentSlide >= activeMainSlides.length) {
      setCurrentSlide(0);
    }
  }, [activeMainSlides.length, currentSlide]);

  const slide = activeMainSlides[currentSlide] || activeMainSlides[0];

  // Auto-advance side banners if multiple exist (Auto-play every 4.5 seconds)
  useEffect(() => {
    if (sideBanners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSideIndex((prev) => (prev + 1) % sideBanners.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [sideBanners.length]);

  useEffect(() => {
    if (currentSideIndex >= sideBanners.length && sideBanners.length > 0) {
      setCurrentSideIndex(0);
    }
  }, [sideBanners.length, currentSideIndex]);

  const activeSideCard = sideBanners[currentSideIndex] || sideBanners[0];

  const handleCtaClick = (link?: string) => {
    if (!link) {
      onShopNow();
      return;
    }
    if (link === '/wholesale') onExploreWholesale();
    else if (link === '/import') onExploreImports();
    else if (link === 'chat-ai') onOpenAIAssistant?.();
    else onShopNow();
  };

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
      <div className="max-w-[1720px] mx-auto px-3 sm:px-4 lg:px-4 space-y-3">
        {/* ========================================================================= */}
        {/* 1. MOBILE HERO SLIDER (Slim, Compact Full-Width Banner with Clean Card Border) */}
        {/* ========================================================================= */}
        <div className="block lg:hidden">
          {/* Full-Width Rounded Slim Banner Card (Aspect 1200:380 ~ 3.15:1) */}
          <div
            onClick={() => handleCtaClick(slide.ctaLink)}
            className="w-full text-white rounded-xl sm:rounded-2xl relative overflow-hidden shadow-xs border border-slate-200/80 hover:border-teal-400/80 transition-all aspect-[1200/380] flex flex-col justify-between cursor-pointer group"
          >
            {/* Full Banner Image (Full Frame - Clean Aspect Display) */}
            <img
              src={slide.imageUrl || heroMobileModelImg}
              alt={slide.title || 'Hero Banner'}
              className="absolute inset-0 w-full h-full object-cover sm:object-fill object-center rounded-xl sm:rounded-2xl group-hover:scale-[1.01] transition-transform duration-500 z-0"
            />

            {/* Optional Overlay if slide title exists */}
            {slide.title && slide.title !== 'Main Slider Banner' && (
              <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-slate-950/30 to-transparent p-3.5 sm:p-4 flex flex-col justify-between z-10 rounded-xl sm:rounded-2xl">
                <div className="max-w-[65%] space-y-1">
                  <h2 className="text-sm sm:text-lg font-black text-white tracking-tight font-display leading-snug line-clamp-2">
                    {slide.title}
                  </h2>
                  {slide.subheading && (
                    <p className="text-[10px] sm:text-xs font-extrabold text-emerald-200 tracking-wide line-clamp-1">
                      {slide.subheading}
                    </p>
                  )}
                </div>
                <div>
                  <span className="inline-flex items-center justify-center gap-1.5 px-3 py-1 text-[11px] font-extrabold text-slate-900 bg-white rounded-full shadow-md">
                    <span>{slide.ctaText || 'Shop Now'}</span>
                    <ArrowRight className="w-3 h-3 text-[#0f766e]" />
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Slider Indicator Dots */}
          {activeMainSlides.length > 1 && (
            <div className="flex items-center justify-center gap-1.5 mt-2">
              {activeMainSlides.map((_, idx) => (
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
          )}
        </div>

        {/* ========================================================================= */}
        {/* 2. DESKTOP HERO SECTION (Standalone Cards with 12px Gap)               */}
        {/* ========================================================================= */}
        <div className="hidden lg:grid lg:grid-cols-12 gap-3 items-stretch">
          {/* LEFT: Main Hero Slider (9 Cols on Desktop, Slim Aspect 1200:320) */}
          <div
            onClick={() => handleCtaClick(slide.ctaLink)}
            className="lg:col-span-9 rounded-2xl relative overflow-hidden shadow-xs border border-slate-200/90 hover:border-teal-400/80 transition-all flex flex-col justify-between aspect-[1200/320] min-h-[220px] max-h-[250px] cursor-pointer group bg-slate-900"
          >
            {/* Full Banner Image (Full Frame - Clean Aspect Display) */}
            <img
              src={slide.imageUrl || heroMarketplaceImg}
              alt={slide.desktopTitle || slide.title || 'Main Slider'}
              className="absolute inset-0 w-full h-full object-cover sm:object-fill object-center rounded-2xl group-hover:scale-[1.01] transition-transform duration-700 z-0"
            />

            {/* Optional Overlay if slide title exists */}
            {slide.title && slide.title !== 'Main Slider Banner' ? (
              <div className="relative z-10 max-w-lg space-y-2 p-5 sm:p-6 bg-gradient-to-r from-slate-950/85 via-slate-950/40 to-transparent h-full flex flex-col justify-between rounded-2xl">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#0f766e] text-white shadow-2xs">
                    <Sparkles className="w-3 h-3 text-emerald-200" />
                    <span>{slide.badge || 'AR MARKET BD'}</span>
                  </div>

                  <h1 className="text-xl sm:text-2xl lg:text-[28px] font-black text-white tracking-tight font-display leading-[1.15] text-balance line-clamp-2">
                    {slide.desktopTitle || slide.title}
                  </h1>

                  {slide.subheading && (
                    <div className="text-xs sm:text-sm font-extrabold text-emerald-300 tracking-wide">
                      {slide.subheading}
                    </div>
                  )}

                  {slide.description && (
                    <p className="text-xs font-medium text-slate-200 leading-relaxed max-w-md line-clamp-2">
                      {slide.description}
                    </p>
                  )}
                </div>

                <div className="pt-2">
                  <span className="inline-flex items-center justify-center gap-2 px-5 py-2 text-xs sm:text-sm font-extrabold text-white bg-[#0f766e] hover:bg-[#115e59] rounded-full shadow-md transition-all">
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>{slide.ctaText || 'Shop Now'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ) : null}

            {/* Left & Right Floating Circular Navigation Arrows (Reference Image Match) */}
            {activeMainSlides.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentSlide((prev) => (prev - 1 + activeMainSlides.length) % activeMainSlides.length);
                  }}
                  className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/85 hover:bg-white text-slate-800 flex items-center justify-center shadow-md backdrop-blur-xs transition-all cursor-pointer hover:scale-110 active:scale-95"
                  title="Previous Slide"
                >
                  <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-[#0f766e]" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentSlide((prev) => (prev + 1) % activeMainSlides.length);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/85 hover:bg-white text-slate-800 flex items-center justify-center shadow-md backdrop-blur-xs transition-all cursor-pointer hover:scale-110 active:scale-95"
                  title="Next Slide"
                >
                  <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-[#0f766e]" />
                </button>

                {/* Bottom Center Dots */}
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 bg-slate-900/60 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/20 shadow-xs"
                >
                  {activeMainSlides.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentSlide(idx);
                      }}
                      className={`h-1.5 rounded-full transition-all cursor-pointer ${
                        idx === currentSlide
                          ? 'w-5 bg-emerald-400'
                          : 'w-1.5 bg-white/60 hover:bg-white'
                      }`}
                      title={`Slide ${idx + 1}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          {/* RIGHT: Side Banner Card (3 Cols on Desktop, Equal Height Stretched) */}
          <div
            onClick={() => handleCtaClick(activeSideCard?.ctaLink || 'chat-ai')}
            className="lg:col-span-3 rounded-2xl text-white relative overflow-hidden shadow-xs border border-slate-200/90 hover:border-teal-400/80 transition-all flex flex-col justify-between aspect-[400/320] min-h-[220px] max-h-[250px] group cursor-pointer bg-slate-900"
          >
            {/* Dynamic Background Carousel Images (Auto-play Carousel behind static overlay) */}
            {sideBanners.length > 0 ? (
              sideBanners.map((card, idx) => (
                <img
                  key={card.id || idx}
                  src={card.imageUrl || sobaiAvatarImg}
                  alt="Side Banner Background"
                  className={`absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-all duration-700 ${
                    idx === currentSideIndex ? 'opacity-100 z-0' : 'opacity-0 -z-10'
                  }`}
                />
              ))
            ) : (
              <img
                src={sobaiAvatarImg}
                alt="Side Banner Background"
                className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
              />
            )}

            {/* Permanent Static Overlay - Fixed Permanently On Top */}
            <div className="relative z-10 p-5 sm:p-6 bg-gradient-to-t from-slate-950/90 via-slate-950/50 to-slate-950/30 h-full flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span
                    className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider text-white shadow-2xs"
                    style={{ backgroundColor: activeSideCard?.badgeColor || '#0f766e' }}
                  >
                    {activeSideCard?.badge || 'AI ASSISTANT'}
                  </span>
                  <span className="text-xs font-bold text-teal-200">
                    Meet Sobai AI
                  </span>
                </div>

                <h2 className="text-lg sm:text-xl font-black text-white tracking-tight font-display leading-snug">
                  Your Smart Shopping Assistant
                </h2>

                <p className="text-xs font-medium text-teal-100 leading-relaxed line-clamp-2">
                  Need help finding deals, wholesale bulk pricing, or tracking import parcels? Ask Sobai AI now!
                </p>
              </div>

              <div className="pt-2">
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenAIAssistant?.();
                  }}
                  className="inline-flex items-center justify-center gap-1.5 px-4.5 py-2 text-xs font-extrabold text-[#064e3b] bg-white hover:bg-teal-50 rounded-full shadow-md transition-all cursor-pointer hover:scale-105"
                >
                  <Bot className="w-4 h-4 text-[#0f766e]" />
                  <span>Chat Now</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#0f766e]" />
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 3. VALUE PROPOSITION TRUST BADGES                                          */}
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

