import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ShoppingBag, ShieldCheck, ArrowRight, Truck, Store, Sparkles } from 'lucide-react';
import { heroBannerImg } from '../data/mockData';

interface HeroSliderProps {
  onShopNow: () => void;
  onExploreWholesale: () => void;
  onExploreImports: () => void;
}

export const HeroSlider: React.FC<HeroSliderProps> = ({
  onShopNow,
  onExploreWholesale,
  onExploreImports,
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      id: 1,
      badge: 'Multi-Vendor Global Commerce',
      welcome: 'Welcome to AR Market BD',
      title: 'Connecting Retail Shoppers, Wholesale Buyers & Global Importers',
      subtitle:
        'Explore thousands of verified manufacturers, boutique merchants, and bonded importers. Unmatched wholesale MOQ tiering and guaranteed retail buyer protection.',
      ctaText: 'Shop Now',
      ctaAction: onShopNow,
      secondaryText: 'Explore Wholesale',
      secondaryAction: onExploreWholesale,
      accent: 'Teal',
    },
    {
      id: 2,
      badge: 'Factory Direct Sourcing',
      welcome: 'Wholesale B2B Marketplace',
      title: 'Bulk Industrial & Commercial Goods Direct from Verified Factories',
      subtitle:
        'Save up to 45% with transparent tiered Minimum Order Quantities (MOQ), custom OEM specs, and direct freight container booking.',
      ctaText: 'Shop Now',
      ctaAction: onExploreWholesale,
      secondaryText: 'Browse Importers',
      secondaryAction: onExploreImports,
      accent: 'Amber',
    },
    {
      id: 3,
      badge: 'Worldwide Imports',
      welcome: 'Global Trade Hub',
      title: 'Curated Direct Imports from Europe, Japan & South Korea',
      subtitle:
        'All import tariffs and customs pre-cleared. Receive certified luxury goods, precision machinery, and artisanal skincare in 3–7 business days.',
      ctaText: 'Shop Now',
      ctaAction: onExploreImports,
      secondaryText: 'View All Products',
      secondaryAction: onShopNow,
      accent: 'Teal',
    },
  ];

  // Auto-advance slides every 6s
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const slide = slides[currentSlide];

  return (
    <section id="hero" className="relative w-full bg-[#f4f7f7] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-14">
        <div className="relative rounded-2xl bg-gradient-to-r from-slate-900/90 via-slate-900/70 to-slate-900/40 text-white overflow-hidden shadow-xl min-h-[460px] md:min-h-[500px] flex items-center">
          {/* Background Image with Fallback and Scrim */}
          <div className="absolute inset-0 -z-10 overflow-hidden">
            <img
              src={heroBannerImg}
              alt="Multi-Vendor Marketplace Banner"
              className="w-full h-full object-cover object-center transition-transform duration-1000 scale-105"
            />
            {/* Scrim Overlay ensuring at least 4.5:1 text contrast */}
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/75 to-slate-950/30" />
            <div className="absolute inset-0 bg-[#008080]/20 mix-blend-multiply" />
          </div>

          {/* Slider Content */}
          <div className="relative z-10 p-6 sm:p-10 md:p-14 max-w-2xl">
            {/* Slide Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-teal-200 bg-teal-900/60 backdrop-blur-md rounded-full border border-teal-500/30 mb-4 animate-in fade-in duration-300">
              <Sparkles className="w-3.5 h-3.5 text-teal-400" />
              <span>{slide.badge}</span>
            </div>

            {/* Welcome Message */}
            <div className="text-sm md:text-base font-semibold text-teal-300 tracking-wide uppercase font-display">
              {slide.welcome}
            </div>

            {/* Main Headline */}
            <h1 className="mt-2 text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight font-display text-balance">
              {slide.title}
            </h1>

            {/* Subtitle */}
            <p className="mt-4 text-sm md:text-base text-slate-200 leading-relaxed text-balance line-clamp-3">
              {slide.subtitle}
            </p>

            {/* CTA Buttons */}
            <div className="mt-8 flex flex-wrap items-center gap-3 sm:gap-4">
              {/* Primary 'Shop Now' button with Teal styling */}
              <button
                type="button"
                onClick={slide.ctaAction}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-bold text-white bg-[#008080] hover:bg-[#006666] active:scale-95 rounded-xl shadow-lg shadow-teal-950/30 hover:shadow-teal-600/30 transition-all cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>{slide.ctaText}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Secondary explore button */}
              <button
                type="button"
                onClick={slide.secondaryAction}
                className="inline-flex items-center justify-center gap-2 px-5 py-3.5 text-sm font-semibold text-white bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-xl border border-white/20 transition-all cursor-pointer"
              >
                <span>{slide.secondaryText}</span>
              </button>
            </div>

            {/* Trust highlights under hero */}
            <div className="mt-8 pt-6 border-t border-white/15 grid grid-cols-3 gap-4 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <Store className="w-4 h-4 text-teal-400 shrink-0" />
                <div>
                  <div className="font-bold text-white tabular-nums">4,200+</div>
                  <div className="text-[11px] text-slate-400">Verified Sellers</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-teal-400 shrink-0" />
                <div>
                  <div className="font-bold text-white tabular-nums">100%</div>
                  <div className="text-[11px] text-slate-400">Buyer Protection</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-teal-400 shrink-0" />
                <div>
                  <div className="font-bold text-white tabular-nums">48 Hours</div>
                  <div className="text-[11px] text-slate-400">Fast Dispatch</div>
                </div>
              </div>
            </div>
          </div>

          {/* Slider Prev / Next Controls */}
          <div className="absolute right-4 bottom-4 md:right-8 md:bottom-8 z-20 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)}
              className="w-10 h-10 rounded-full bg-black/40 hover:bg-[#008080] text-white flex items-center justify-center backdrop-blur-md transition-colors border border-white/20 cursor-pointer"
              title="Previous Slide"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-black/40 backdrop-blur-md rounded-full border border-white/20">
              {slides.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setCurrentSlide(i)}
                  className={`h-2 rounded-full transition-all cursor-pointer ${
                    i === currentSlide ? 'w-6 bg-[#008080]' : 'w-2 bg-white/50 hover:bg-white'
                  }`}
                  title={`Go to slide ${i + 1}`}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}
              className="w-10 h-10 rounded-full bg-black/40 hover:bg-[#008080] text-white flex items-center justify-center backdrop-blur-md transition-colors border border-white/20 cursor-pointer"
              title="Next Slide"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
