import heroMarketplaceImg from '../assets/images/hero_marketplace_lifestyle_1790625704312.jpg';
import heroMobileModelImg from '../assets/images/hero_mobile_shopping_model_1790628376818.jpg';
import sobaiAvatarImg from '../assets/images/sobai_ai_robot_avatar_1790625723414.jpg';

export interface MainSliderItem {
  id: string;
  badge: string;
  title: string;
  desktopTitle: string;
  subheading: string;
  description: string;
  imageUrl: string;
  ctaText: string;
  ctaLink?: string;
  themeBg?: string;
  desktopBg?: string;
  isActive: boolean;
  createdAt: string;
}

export interface SideBannerItem {
  id: string;
  badge: string;
  title: string;
  subtitle: string;
  description: string;
  imageUrl: string;
  ctaText: string;
  ctaLink?: string;
  badgeColor?: string;
  isActive: boolean;
  createdAt: string;
}

export interface CategoryBannerItem {
  id: string;
  imageUrl: string;
  isActive: boolean;
  createdAt: string;
}

const MAIN_SLIDERS_KEY = 'armarket_main_sliders_v1';
const SIDE_BANNERS_KEY = 'armarket_side_banners_v1';
const CATEGORY_BANNER_KEY = 'armarket_category_banner_v1';
const CATEGORY_BANNERS_ARRAY_KEY = 'armarket_category_banners_array_v1';
export const SLIDERS_UPDATED_EVENT = 'armarket_sliders_updated';

const DEFAULT_MAIN_SLIDERS: MainSliderItem[] = [
  {
    id: 'main-1',
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
    createdAt: new Date().toISOString(),
  },
  {
    id: 'main-2',
    badge: 'B2B Wholesale Hub',
    title: 'Factory Direct Sourcing & Bulk Tiers',
    desktopTitle: 'Wholesale Bulk Sourcing & Tiered MOQ',
    subheading: 'Direct Factory Prices',
    description:
      'Save up to 45% on bulk lots with verified factory sellers, custom OEM specifications, and transparent freight container booking across Bangladesh.',
    imageUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=1200',
    ctaText: 'Shop Wholesale',
    ctaLink: '/wholesale',
    themeBg: 'from-[#042f24] via-[#064e3b] to-[#0f766e]',
    desktopBg: 'from-[#fef3c7] via-[#fffbeb] to-[#f0fdf4]',
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'main-3',
    badge: 'Worldwide Imports',
    title: 'Curated Direct Imports Pre-Cleared',
    desktopTitle: 'Curated Direct Imports Pre-Cleared',
    subheading: 'Europe • Japan • South Korea',
    description:
      'Certified luxury electronics, precision smartwatches, and beauty skincare with pre-cleared customs and rapid 3–7 business day express delivery.',
    imageUrl: heroMobileModelImg,
    ctaText: 'Browse Imports',
    ctaLink: '/import',
    themeBg: 'from-[#042f24] via-[#064e3b] to-[#0f766e]',
    desktopBg: 'from-[#e0e7ff] via-[#f0fdfa] to-[#ccfbf1]',
    isActive: true,
    createdAt: new Date().toISOString(),
  },
];

const DEFAULT_SIDE_BANNERS: SideBannerItem[] = [
  {
    id: 'side-1',
    badge: 'AI ASSISTANT',
    title: 'Your Smart Shopping Assistant',
    subtitle: 'Meet Sobai AI',
    description: 'Need help finding deals, wholesale bulk pricing, or tracking import parcels?',
    imageUrl: sobaiAvatarImg,
    ctaText: 'Chat Now',
    ctaLink: 'chat-ai',
    badgeColor: '#0f766e',
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'side-2',
    badge: 'FLASH MEGA DEAL',
    title: 'Up to 50% Off Electronics',
    subtitle: 'Verified Sellers',
    description: 'Top rated studio headphones, road run sneakers & smartwatches on sale now.',
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=500',
    ctaText: 'Explore Deals',
    ctaLink: '/special-offers',
    badgeColor: '#d97706',
    isActive: true,
    createdAt: new Date().toISOString(),
  },
];

class SliderService {
  private notifyListeners() {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event(SLIDERS_UPDATED_EVENT));
    }
  }

  // --- Main Sliders ---
  getMainSliders(): MainSliderItem[] {
    if (typeof window === 'undefined') return DEFAULT_MAIN_SLIDERS;
    try {
      const stored = localStorage.getItem(MAIN_SLIDERS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
      this.saveMainSliders(DEFAULT_MAIN_SLIDERS);
      return DEFAULT_MAIN_SLIDERS;
    } catch {
      return DEFAULT_MAIN_SLIDERS;
    }
  }

  saveMainSliders(sliders: MainSliderItem[]): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(MAIN_SLIDERS_KEY, JSON.stringify(sliders));
      this.notifyListeners();
    } catch (e) {
      console.warn('[SliderService] Error saving main sliders:', e);
    }
  }

  addMainSlider(item: Omit<MainSliderItem, 'id' | 'createdAt'>): MainSliderItem {
    const existing = this.getMainSliders();
    const newItem: MainSliderItem = {
      ...item,
      id: `main-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    const updated = [newItem, ...existing];
    this.saveMainSliders(updated);
    return newItem;
  }

  updateMainSlider(id: string, updates: Partial<MainSliderItem>): MainSliderItem {
    const existing = this.getMainSliders();
    let updatedItem: MainSliderItem | null = null;
    const updated = existing.map((item) => {
      if (item.id === id) {
        updatedItem = { ...item, ...updates };
        return updatedItem;
      }
      return item;
    });
    if (!updatedItem) throw new Error(`Main slider "${id}" not found`);
    this.saveMainSliders(updated);
    return updatedItem;
  }

  deleteMainSlider(id: string): void {
    const existing = this.getMainSliders();
    const filtered = existing.filter((item) => item.id !== id);
    this.saveMainSliders(filtered);
  }

  // --- Side Banners ---
  getSideBanners(): SideBannerItem[] {
    if (typeof window === 'undefined') return DEFAULT_SIDE_BANNERS;
    try {
      const stored = localStorage.getItem(SIDE_BANNERS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
      this.saveSideBanners(DEFAULT_SIDE_BANNERS);
      return DEFAULT_SIDE_BANNERS;
    } catch {
      return DEFAULT_SIDE_BANNERS;
    }
  }

  saveSideBanners(banners: SideBannerItem[]): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(SIDE_BANNERS_KEY, JSON.stringify(banners));
      this.notifyListeners();
    } catch (e) {
      console.warn('[SliderService] Error saving side banners:', e);
    }
  }

  addSideBanner(item: Omit<SideBannerItem, 'id' | 'createdAt'>): SideBannerItem {
    const existing = this.getSideBanners();
    const newItem: SideBannerItem = {
      ...item,
      id: `side-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    const updated = [newItem, ...existing];
    this.saveSideBanners(updated);
    return newItem;
  }

  updateSideBanner(id: string, updates: Partial<SideBannerItem>): SideBannerItem {
    const existing = this.getSideBanners();
    let updatedItem: SideBannerItem | null = null;
    const updated = existing.map((item) => {
      if (item.id === id) {
        updatedItem = { ...item, ...updates };
        return updatedItem;
      }
      return item;
    });
    if (!updatedItem) throw new Error(`Side banner "${id}" not found`);
    this.saveSideBanners(updated);
    return updatedItem;
  }

  deleteSideBanner(id: string): void {
    const existing = this.getSideBanners();
    const filtered = existing.filter((item) => item.id !== id);
    this.saveSideBanners(filtered);
  }

  // --- Shop by Category Banner ---
  getCategoryBanner(): string {
    if (typeof window === 'undefined') return '';
    try {
      const array = this.getCategoryBanners();
      const active = array.filter((b) => b.isActive);
      if (active.length > 0) return active[0].imageUrl;
      return localStorage.getItem(CATEGORY_BANNER_KEY) || '';
    } catch {
      return '';
    }
  }

  saveCategoryBanner(url: string): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(CATEGORY_BANNER_KEY, url);
      if (url) {
        const existing = this.getCategoryBanners();
        if (existing.length === 0) {
          this.addCategoryBanner({ imageUrl: url, isActive: true });
        }
      }
      this.notifyListeners();
    } catch (e) {
      console.warn('[SliderService] Error saving category banner:', e);
    }
  }

  getCategoryBanners(): CategoryBannerItem[] {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem(CATEGORY_BANNERS_ARRAY_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      }
      const single = localStorage.getItem(CATEGORY_BANNER_KEY);
      if (single) {
        const initialItem: CategoryBannerItem = {
          id: 'cat-1',
          imageUrl: single,
          isActive: true,
          createdAt: new Date().toISOString(),
        };
        this.saveCategoryBanners([initialItem]);
        return [initialItem];
      }
      return [];
    } catch {
      return [];
    }
  }

  saveCategoryBanners(banners: CategoryBannerItem[]): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(CATEGORY_BANNERS_ARRAY_KEY, JSON.stringify(banners));
      this.notifyListeners();
    } catch (e) {
      console.warn('[SliderService] Error saving category banners array:', e);
    }
  }

  addCategoryBanner(item: Omit<CategoryBannerItem, 'id' | 'createdAt'>): CategoryBannerItem {
    const existing = this.getCategoryBanners();
    const newItem: CategoryBannerItem = {
      ...item,
      id: `cat-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    const updated = [newItem, ...existing];
    this.saveCategoryBanners(updated);
    return newItem;
  }

  updateCategoryBanner(id: string, updates: Partial<CategoryBannerItem>): CategoryBannerItem {
    const existing = this.getCategoryBanners();
    let updatedItem: CategoryBannerItem | null = null;
    const updated = existing.map((item) => {
      if (item.id === id) {
        updatedItem = { ...item, ...updates };
        return updatedItem;
      }
      return item;
    });
    if (!updatedItem) throw new Error(`Category banner "${id}" not found`);
    this.saveCategoryBanners(updated);
    return updatedItem;
  }

  deleteCategoryBanner(id: string): void {
    const existing = this.getCategoryBanners();
    const filtered = existing.filter((item) => item.id !== id);
    this.saveCategoryBanners(filtered);
  }
}

export const sliderService = new SliderService();
