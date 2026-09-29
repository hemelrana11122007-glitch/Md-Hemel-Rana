import specialOfferBannerImg1 from '../assets/images/special_offer_emerald_headphones_1790626974829.jpg';
import specialOfferBannerImg2 from '../assets/images/special_offer_b2b_wholesale_1790627764898.jpg';
import specialOfferBannerImg3 from '../assets/images/special_offer_global_imports_1790627775866.jpg';

export interface SpecialOfferItem {
  id: string;
  campaignName: string;
  badgeText: string;
  badgeColor?: string;
  bannerImage: string;
  sortOrder: number;
  startDate: string;
  expiryDate: string;
  description: string;
  ctaText?: string;
  targetSegment?: string;
  assignedProductIds?: string[];
  status?: 'active' | 'scheduled' | 'expired' | 'paused';
  createdAt?: string;
  updatedAt?: string;
}

const OFFERS_STORAGE_KEY = 'armarket_special_offers_v3';
export const OFFERS_UPDATED_EVENT = 'armarket_special_offers_updated';
export const DEFAULT_BRAND_BADGE_COLOR = '#0f766e';

export interface TimeRemaining {
  total: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
}

export function getTimeRemaining(expiryDateStr?: string): TimeRemaining {
  if (!expiryDateStr) {
    return { total: 0, days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true };
  }

  // Parse expiry date. If format is "YYYY-MM-DD", treat end of day as 23:59:59 local time
  let targetTime: number;
  if (expiryDateStr.includes('T')) {
    targetTime = new Date(expiryDateStr).getTime();
  } else {
    const [y, m, d] = expiryDateStr.split('-').map(Number);
    if (y && m && d) {
      targetTime = new Date(y, m - 1, d, 23, 59, 59, 999).getTime();
    } else {
      targetTime = new Date(`${expiryDateStr}T23:59:59`).getTime();
    }
  }

  const total = targetTime - Date.now();
  if (isNaN(total) || total <= 0) {
    return { total: 0, days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true };
  }

  const seconds = Math.floor((total / 1000) % 60);
  const minutes = Math.floor((total / 1000 / 60) % 60);
  const totalHours = Math.floor(total / (1000 * 60 * 60));
  const days = Math.floor(totalHours / 24);
  const hours = totalHours;

  return {
    total,
    days,
    hours,
    minutes,
    seconds,
    isExpired: false,
  };
}

export const INITIAL_OFFERS: SpecialOfferItem[] = [
  {
    id: 'offer-summer-deal',
    campaignName: 'Up to 50% OFF',
    badgeText: 'SPECIAL OFFER',
    badgeColor: '#10b981',
    bannerImage: specialOfferBannerImg1,
    sortOrder: 0,
    startDate: '2026-06-01',
    expiryDate: '2026-12-31',
    description: 'Top Rated Products • Smartphone, Studio Sound & Smartwatch Deals',
    ctaText: 'Shop Now',
    targetSegment: 'retail',
    assignedProductIds: ['prod-1', 'prod-2', 'prod-6', 'prod-10', 'prod-11', 'prod-14', 'prod-7'],
    status: 'active',
    createdAt: '2026-06-01T00:00:00.000Z',
    updatedAt: '2026-06-01T00:00:00.000Z',
  },
  {
    id: 'offer-b2b-wholesale',
    campaignName: 'Save up to 45%',
    badgeText: 'FACTORY DIRECT',
    badgeColor: '#0f766e',
    bannerImage: specialOfferBannerImg2,
    sortOrder: 1,
    startDate: '2026-06-01',
    expiryDate: '2026-12-31',
    description: 'Bulk Wholesale Tiering • Direct Manufacturer Lot Pricing',
    ctaText: 'View Wholesale',
    targetSegment: 'wholesale',
    assignedProductIds: ['prod-3', 'prod-5', 'prod-9', 'prod-13', 'prod-17', 'prod-18'],
    status: 'active',
    createdAt: '2026-06-01T00:00:00.000Z',
    updatedAt: '2026-06-01T00:00:00.000Z',
  },
  {
    id: 'offer-global-imports',
    campaignName: 'Flat 40% OFF',
    badgeText: 'GLOBAL IMPORTS',
    badgeColor: '#3b82f6',
    bannerImage: specialOfferBannerImg3,
    sortOrder: 2,
    startDate: '2026-06-01',
    expiryDate: '2026-12-31',
    description: 'Pre-Cleared Customs • Curated Luxury Tech & Precision Imports',
    ctaText: 'Browse Imports',
    targetSegment: 'import',
    assignedProductIds: ['prod-4', 'prod-8', 'prod-12', 'prod-15', 'prod-16', 'prod-19'],
    status: 'active',
    createdAt: '2026-06-01T00:00:00.000Z',
    updatedAt: '2026-06-01T00:00:00.000Z',
  },
];

class SpecialOfferService {
  private notifyListeners(offers: SpecialOfferItem[]) {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent(OFFERS_UPDATED_EVENT, { detail: offers })
      );
    }
  }

  getOffers(): SpecialOfferItem[] {
    if (typeof window === 'undefined') return INITIAL_OFFERS;

    try {
      const stored = localStorage.getItem(OFFERS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const today = new Date().toISOString().split('T')[0];
          let updated = false;
          const checked = parsed.map((item: SpecialOfferItem) => {
            if (item.status === 'active' && item.expiryDate && item.expiryDate < today) {
              updated = true;
              return { ...item, status: 'expired' as const };
            }
            return item;
          });
          if (updated) {
            this.saveOffersToStorage(checked);
          }
          return checked.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
        }
      }
      // Initialize storage with defaults
      this.saveOffersToStorage(INITIAL_OFFERS);
      return INITIAL_OFFERS;
    } catch (e) {
      console.warn('[SpecialOfferService] Error reading offers from localStorage:', e);
      return INITIAL_OFFERS;
    }
  }

  isOfferActive(offer: SpecialOfferItem): boolean {
    if (offer.status && offer.status !== 'active') {
      return false;
    }
    const today = new Date().toISOString().split('T')[0];
    if (offer.startDate && offer.startDate > today) {
      return false;
    }
    if (offer.expiryDate && offer.expiryDate < today) {
      return false;
    }
    const rem = getTimeRemaining(offer.expiryDate);
    if (rem.isExpired) {
      return false;
    }
    return true;
  }

  getOfferById(id: string): SpecialOfferItem | undefined {
    const all = this.getOffers();
    return all.find((o) => o.id === id);
  }

  private saveOffersToStorage(offers: SpecialOfferItem[]): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(OFFERS_STORAGE_KEY, JSON.stringify(offers));
      this.notifyListeners(offers);
    } catch (e) {
      console.error('[SpecialOfferService] Error saving offers to localStorage:', e);
    }
  }

  addOffer(
    data: Omit<SpecialOfferItem, 'id' | 'createdAt' | 'updatedAt' | 'status'>
  ): SpecialOfferItem {
    const existing = this.getOffers();
    const now = new Date().toISOString();
    const id = `offer-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    // Determine status based on dates
    const today = new Date().toISOString().split('T')[0];
    let status: 'active' | 'scheduled' | 'expired' = 'active';
    if (data.startDate && data.startDate > today) {
      status = 'scheduled';
    } else if (data.expiryDate && data.expiryDate < today) {
      status = 'expired';
    }

    const newOffer: SpecialOfferItem = {
      ...data,
      id,
      sortOrder: Number(data.sortOrder) || 0,
      badgeColor: data.badgeColor || DEFAULT_BRAND_BADGE_COLOR,
      ctaText: data.ctaText || 'Shop Now',
      targetSegment: data.targetSegment || 'retail',
      status,
      createdAt: now,
      updatedAt: now,
    };

    const updated = [...existing, newOffer].sort(
      (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)
    );
    this.saveOffersToStorage(updated);
    return newOffer;
  }

  updateOffer(
    id: string,
    updates: Partial<Omit<SpecialOfferItem, 'id' | 'createdAt'>>
  ): SpecialOfferItem {
    const existing = this.getOffers();
    const now = new Date().toISOString();
    let updatedItem: SpecialOfferItem | null = null;

    const today = new Date().toISOString().split('T')[0];

    const updated = existing.map((item) => {
      if (item.id === id) {
        const merged = { ...item, ...updates, updatedAt: now };
        if (updates.sortOrder !== undefined) {
          merged.sortOrder = Number(updates.sortOrder) || 0;
        }

        // Recalculate status if dates changed
        if (merged.startDate && merged.startDate > today) {
          merged.status = 'scheduled';
        } else if (merged.expiryDate && merged.expiryDate < today) {
          merged.status = 'expired';
        } else {
          merged.status = updates.status || 'active';
        }

        updatedItem = merged;
        return merged;
      }
      return item;
    });

    if (!updatedItem) {
      throw new Error(`Special Offer with ID "${id}" was not found.`);
    }

    this.saveOffersToStorage(
      updated.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
    );
    return updatedItem;
  }

  deleteOffer(id: string): void {
    const existing = this.getOffers();
    const filtered = existing.filter((item) => item.id !== id);
    this.saveOffersToStorage(filtered);
  }

  toggleOfferStatus(id: string): SpecialOfferItem {
    const existing = this.getOffers();
    const target = existing.find((item) => item.id === id);
    if (!target) {
      throw new Error(`Special Offer with ID "${id}" was not found.`);
    }
    const newStatus = target.status === 'active' ? 'paused' : 'active';
    return this.updateOffer(id, { status: newStatus });
  }

  async uploadOfferAsset(file: File): Promise<{
    success: boolean;
    url: string;
    filename: string;
    size: number;
  }> {
    // 1. Client-side MIME validation
    const allowedMimes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/svg+xml'];
    const fileMime = file.type.toLowerCase();
    const fileName = file.name.toLowerCase();
    const hasValidExt = /\.(png|jpe?g|webp|svg)$/i.test(fileName);

    if (!allowedMimes.includes(fileMime) && !hasValidExt) {
      throw new Error('Only PNG, JPG, JPEG, WEBP, and SVG formats are permitted for creative banner.');
    }

    // 2. Client-side Size validation (Max 5MB)
    const maxBytes = 5 * 1024 * 1024;
    if (file.size > maxBytes) {
      const mb = (file.size / (1024 * 1024)).toFixed(2);
      throw new Error(`Banner file size must be less than 5MB (Selected: ${mb} MB).`);
    }

    try {
      // 3. Multi-part Form Data upload to server
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload/offer-asset', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        return data;
      }
    } catch {
      // Fallback to client-side data URL if server route unavailable
    }

    // Fallback: client-side Object URL
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve({
          success: true,
          url: reader.result as string,
          filename: file.name,
          size: file.size,
        });
      };
      reader.onerror = () => reject(new Error('Failed to read image file locally.'));
      reader.readAsDataURL(file);
    });
  }
}

export const specialOfferService = new SpecialOfferService();
