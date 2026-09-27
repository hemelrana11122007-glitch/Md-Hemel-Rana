export interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  icon: string;
  logo_url?: string;
  banner_url?: string;
  itemCount: number;
  // Local Meta Engine
  seo_title: string;
  seo_description: string;
  seo_keywords: string;
  // Toggles
  is_featured: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const STORAGE_KEY = 'armarket_categories_v1';

export const INITIAL_CATEGORIES: CategoryItem[] = [
  {
    id: 'cat-fashion',
    name: 'Fashion & Apparel',
    slug: 'fashion-apparel',
    icon: 'Shirt',
    logo_url: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&q=80&w=200',
    banner_url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=800',
    itemCount: 4280,
    seo_title: 'Fashion & Apparel in BD | Designer Dresses & Outfits',
    seo_description: 'Explore trendy fashion & apparel online in Bangladesh. Designer outfits, authentic handloom sharees, and panjabis with fast cash on delivery across BD.',
    seo_keywords: 'fashion apparel bd, buy clothes online, clothing dhaka, eid collection bd, panjabi sharee online, authentic fashion store, apparel delivery bd',
    is_featured: true,
    is_active: true,
    created_at: '2026-01-10T10:00:00Z',
    updated_at: '2026-09-20T12:00:00Z',
  },
  {
    id: 'cat-electronics',
    name: 'Electronics & Tech',
    slug: 'electronics-tech',
    icon: 'Cpu',
    logo_url: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&q=80&w=200',
    banner_url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=800',
    itemCount: 6120,
    seo_title: 'Buy Electronics & Tech in BD | Genuine Brands Online',
    seo_description: 'Discover genuine electronics & tech gadgets at best market rates in Bangladesh. 100% authentic devices with cash on delivery and fast courier across BD.',
    seo_keywords: 'electronics tech bd, gadgets price in bd, buy tech online, smart devices dhaka, genuine gadgets bangladesh, electronics deals, fast tech courier',
    is_featured: true,
    is_active: true,
    created_at: '2026-01-12T11:00:00Z',
    updated_at: '2026-09-22T14:30:00Z',
  },
  {
    id: 'cat-home',
    name: 'Home & Living',
    slug: 'home-living',
    icon: 'Home',
    logo_url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=200',
    banner_url: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80&w=800',
    itemCount: 3410,
    seo_title: 'Home & Living in BD | Decor, Furniture & Kitchenware',
    seo_description: 'Upgrade your living space with modern home & living essentials in Bangladesh. Decor items, kitchenware, and furniture with cash on delivery in Dhaka & BD.',
    seo_keywords: 'home living bd, home decor dhaka, kitchenware bangladesh, modern furniture bd, bedding sets online, home essentials, safe cod delivery',
    is_featured: false,
    is_active: true,
    created_at: '2026-02-01T09:00:00Z',
    updated_at: '2026-08-15T16:00:00Z',
  },
  {
    id: 'cat-wholesale',
    name: 'Wholesale & B2B',
    slug: 'wholesale-b2b',
    icon: 'Boxes',
    logo_url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=200',
    banner_url: 'https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&q=80&w=800',
    itemCount: 8950,
    seo_title: 'Wholesale & B2B Sourcing in BD | Low Factory MOQs',
    seo_description: 'Source wholesale & b2b commercial lots directly from verified manufacturers in Bangladesh. Low MOQs, bulk trade pricing, and nationwide freight supply.',
    seo_keywords: 'wholesale b2b bangladesh, bulk supplier dhaka, b2b commercial sourcing, factory rate bd, low moq wholesale, bulk lots bd, verified trade suppliers',
    is_featured: true,
    is_active: true,
    created_at: '2026-02-15T08:00:00Z',
    updated_at: '2026-09-25T18:00:00Z',
  },
  {
    id: 'cat-beauty',
    name: 'Beauty & Health',
    slug: 'beauty-health',
    icon: 'Sparkles',
    logo_url: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=80&w=200',
    banner_url: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&q=80&w=800',
    itemCount: 2840,
    seo_title: 'Original Beauty & Health in BD | 100% Genuine Brands',
    seo_description: 'Shop 100% original beauty & health products in Bangladesh. Certified cosmetics, skincare, and wellness items with cash on delivery and fast courier BD.',
    seo_keywords: 'beauty health bd, original cosmetics dhaka, skincare products bangladesh, genuine makeup online, health supplements bd, authentic beauty shop, fast cod delivery',
    is_featured: false,
    is_active: true,
    created_at: '2026-03-01T12:00:00Z',
    updated_at: '2026-09-18T10:00:00Z',
  },
  {
    id: 'cat-watches',
    name: 'Watches & Imports',
    slug: 'watches-imports',
    icon: 'Watch',
    logo_url: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&q=80&w=200',
    banner_url: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=80&w=800',
    itemCount: 1670,
    seo_title: 'Luxury Watches & Imports in BD | Verified Bonded Shop',
    seo_description: 'Direct imported watches & imports with port customs clearance in Bangladesh. Genuine chronographs, luxury timepieces, and cash on delivery across 64 districts.',
    seo_keywords: 'watches imports bd, imported wristwatches dhaka, authentic timepieces bangladesh, bonded imports, luxury watch price, original brand watches, cod courier bd',
    is_featured: true,
    is_active: true,
    created_at: '2026-03-10T14:00:00Z',
    updated_at: '2026-09-24T11:00:00Z',
  },
  {
    id: 'cat-sports',
    name: 'Sports & Outdoors',
    slug: 'sports-outdoors',
    icon: 'Activity',
    logo_url: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&q=80&w=200',
    banner_url: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&q=80&w=800',
    itemCount: 3120,
    seo_title: 'Sports & Outdoors Gear in BD | High Performance Kits',
    seo_description: 'Order high-performance sports & outdoors gear in Bangladesh. Gym accessories, athletic kits, and training equipment with cash on delivery across 64 districts.',
    seo_keywords: 'sports outdoors bd, gym equipment dhaka, athletic kits bangladesh, fitness gear online, cricket accessories, sports store bd, cash on delivery',
    is_featured: false,
    is_active: true,
    created_at: '2026-03-20T15:00:00Z',
    updated_at: '2026-09-10T12:00:00Z',
  },
  {
    id: 'cat-ceramics',
    name: 'Ceramics & Handcrafts',
    slug: 'ceramics-handcrafts',
    icon: 'Sparkles',
    logo_url: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&q=80&w=200',
    banner_url: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&q=80&w=800',
    itemCount: 1980,
    seo_title: 'Ceramics & Handcrafts in BD | Artisanal Heritage Shop',
    seo_description: 'Support Bangladeshi artisans with authentic ceramics & handcrafts. Export-grade clay pottery, tableware, and handmade dinnerware with safe courier across BD.',
    seo_keywords: 'ceramics handcrafts bd, clay pottery dhaka, artisanal crafts bangladesh, heritage handloom, authentic dinnerware, handmade decor, safe delivery bd',
    is_featured: true,
    is_active: true,
    created_at: '2026-04-05T10:00:00Z',
    updated_at: '2026-09-26T09:00:00Z',
  },
];

export const categoryService = {
  getCategories(): CategoryItem[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Error reading categories from localStorage:', e);
    }
    this.saveCategories(INITIAL_CATEGORIES);
    return INITIAL_CATEGORIES;
  },

  saveCategories(categories: CategoryItem[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(categories));
    } catch (e) {
      console.error('Error saving categories to localStorage:', e);
    }
  },

  getCategoryById(id: string): CategoryItem | undefined {
    const list = this.getCategories();
    return list.find((c) => c.id === id || c.slug === id);
  },

  createCategory(data: Omit<CategoryItem, 'id' | 'created_at' | 'updated_at' | 'itemCount'>): CategoryItem {
    const list = this.getCategories();
    const id = `cat-${data.slug || Math.random().toString(36).substring(2, 8)}`;
    const now = new Date().toISOString();

    const newCategory: CategoryItem = {
      ...data,
      id,
      itemCount: 0,
      created_at: now,
      updated_at: now,
    };

    const updatedList = [newCategory, ...list];
    this.saveCategories(updatedList);
    return newCategory;
  },

  updateCategory(id: string, data: Partial<CategoryItem>): CategoryItem | undefined {
    const list = this.getCategories();
    const idx = list.findIndex((c) => c.id === id);
    if (idx === -1) return undefined;

    const updatedCategory: CategoryItem = {
      ...list[idx],
      ...data,
      updated_at: new Date().toISOString(),
    };

    list[idx] = updatedCategory;
    this.saveCategories(list);
    return updatedCategory;
  },

  deleteCategory(id: string): boolean {
    const list = this.getCategories();
    const filtered = list.filter((c) => c.id !== id);
    if (filtered.length === list.length) return false;
    this.saveCategories(filtered);
    return true;
  },

  /**
   * Upload category icon or promo banner directly to secure server storage
   * Performs client validation before sending multipart/form-data
   */
  async uploadAsset(file: File, assetType: 'icon' | 'banner'): Promise<{
    success: boolean;
    url: string;
    filename: string;
    originalName: string;
    size: number;
    mimeType: string;
  }> {
    // 1. Client-side MIME validation
    const allowedMimes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/svg+xml'];
    const fileMime = file.type.toLowerCase();
    const fileName = file.name.toLowerCase();
    const hasValidExt = /\.(png|jpe?g|webp|svg)$/i.test(fileName);

    if (!allowedMimes.includes(fileMime) && !hasValidExt) {
      throw new Error('Invalid file format. Only PNG, JPG, JPEG, WEBP, and SVG formats are permitted.');
    }

    // 2. Client-side Size validation
    const maxIconBytes = 2 * 1024 * 1024; // 2MB
    const maxBannerBytes = 5 * 1024 * 1024; // 5MB

    if (assetType === 'icon' && file.size > maxIconBytes) {
      const mb = (file.size / (1024 * 1024)).toFixed(2);
      throw new Error(`Category Icon exceeds 2MB limit (Selected: ${mb} MB). Please choose a smaller image.`);
    }

    if (assetType === 'banner' && file.size > maxBannerBytes) {
      const mb = (file.size / (1024 * 1024)).toFixed(2);
      throw new Error(`Promo Banner exceeds 5MB limit (Selected: ${mb} MB). Please choose a smaller image.`);
    }

    // 3. Multi-part Form Data transmission
    const formData = new FormData();
    formData.append('file', file);
    formData.append('assetType', assetType);

    const res = await fetch('/api/upload/category-asset', {
      method: 'POST',
      body: formData,
      credentials: 'include',
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Failed to upload asset to secure server storage.');
    }

    return data;
  },

  /**
   * Dynamic Market-Researched SEO Meta Engine (Zero 3rd party API, deterministic native AI)
   * Enforces 4 Commercial & Market-Researched Intent Angles (Rotational Intent Engine):
   *   - Angle A (Wholesale & Direct Importer Intent): Bulk pricing, wholesale supplier network, verified merchants, B2B MOQs
   *   - Angle B (Best Offers & Discount Intent): Deals, flash sales, authentic products, trusted online store BD
   *   - Angle C (Quality & Range Intent): Premium quality, wide selection, top-rated brands, fast delivery BD
   *   - Angle D (Price & Comparison Intent): Online market rate comparison, original price, cash on delivery BD
   *
   * Strict Google SERP Character Limit Validation:
   *   - SEO Meta Title: <= 60 characters strictly (no truncation in SERP snippets)
   *   - SEO Meta Description: 150-160 characters strictly (calibrated with category name & BD e-commerce search hooks)
   *   - SEO Keywords: 6 to 8 dynamic long-tail and short-tail comma-separated keywords
   */
  generateLocalAiSeo(
    rawName: string,
    variationSeed: number = 0
  ): {
    slug: string;
    seo_title: string;
    seo_description: string;
    seo_keywords: string;
    strategy_label: string;
  } {
    const name = rawName.trim();
    if (!name) {
      return {
        slug: '',
        seo_title: '',
        seo_description: '',
        seo_keywords: '',
        strategy_label: '',
      };
    }

    // 1. Generate clean SEO-friendly slug
    const slug = name
      .toLowerCase()
      .replace(/&/g, 'and')
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const lowerName = name.toLowerCase();

    // 2. Multi-Angle Rotational Intent Engine (4 distinct market-researched commercial angles)
    const angleIndex = Math.abs(variationSeed) % 4;

    // Sub-variation seed based on category characters and rotation cycle
    const charCodeSum = name
      .split('')
      .reduce((sum, ch, idx) => sum + ch.charCodeAt(0) * (idx + 1), 0);
    const subVar = Math.abs(Math.floor(variationSeed / 4) + charCodeSum) % 4;

    /**
     * Builds grammatically complete descriptions strictly calibrated between 150 and 160 characters
     */
    const buildSerpDescription = (leads: string[], closings: string[], minLen = 150, maxLen = 160): string => {
      // Rotate leads based on subVar so different regeneration cycles get different leads
      const rotatedLeads = [...leads.slice(subVar), ...leads.slice(0, subVar)];

      // 1. Direct lead + closing match
      for (const lead of rotatedLeads) {
        for (const closing of closings) {
          const full = `${lead} ${closing}`.replace(/\s+/g, ' ').trim();
          if (full.length >= minLen && full.length <= maxLen) {
            return full;
          }
        }
      }

      // 2. Lead + closing + natural BD suffix if under minLen
      const suffixes = [
        ' in BD.',
        ' across BD.',
        ' in Dhaka.',
        ' nationwide.',
        ' in Bangladesh.',
        ' with cash on delivery.',
        ' with fast courier.',
      ];

      for (const lead of rotatedLeads) {
        for (const closing of closings) {
          const base = `${lead} ${closing}`.replace(/\s+/g, ' ').replace(/\.+$/, '').trim();
          for (const suf of suffixes) {
            const candidate = `${base}${suf}`;
            if (candidate.length >= minLen && candidate.length <= maxLen) {
              return candidate;
            }
          }
        }
      }

      // 3. Fallback: closest match cleanly bounded
      let best = `${rotatedLeads[0]} ${closings[0]}`;
      if (best.length > maxLen) {
        const cut = best.slice(0, maxLen);
        const lastSp = cut.lastIndexOf(' ');
        return cut.slice(0, lastSp).trim() + '.';
      }
      return best;
    };

    let rawTitle = '';
    let rawDescription = '';
    let rawKeywords: string[] = [];
    let strategy_label = '';

    switch (angleIndex) {
      case 0: {
        // Angle A: Wholesale & Direct Importer Intent
        strategy_label = 'Angle A: Wholesale & Direct Importer Intent';

        const titleOptions = [
          `Wholesale ${name} in BD | Bulk Sourcing & B2B Rates`,
          `Bulk ${name} Suppliers in BD | Factory MOQs & Rates`,
          `Source Wholesale ${name} in BD | Verified Importers`,
          `B2B ${name} Wholesale in BD | Low MOQs & Bulk Price`,
        ];
        rawTitle = titleOptions[subVar];

        const leadsA = [
          `Source wholesale ${name} in Bangladesh.`,
          `Buy bulk ${name} at wholesale rates in BD.`,
          `Source bulk ${name} at factory rates in BD.`,
          `Procure wholesale ${name} online in Bangladesh.`,
          `Order wholesale ${name} in Bangladesh.`,
        ];
        const closingsA = [
          'Connect with verified commercial suppliers for low B2B MOQs, bulk pricing, and freight delivery.',
          'Enjoy low B2B MOQs, tiered commercial discounts, verified trade invoices, and fast pallet delivery.',
          'Access verified supplier networks, certified factory lots, low MOQs, and insured freight courier.',
          'Guaranteed commercial pricing, reliable B2B supply, low MOQs, and express delivery nationwide.',
          'Connect with verified trade importers for low B2B MOQs and fast nationwide parcel dispatch.',
          'Get factory direct trade rates, low B2B MOQs, verified supplier badges, and fast freight supply.',
          'Access verified trade suppliers, low MOQs, bulk discounts, and prompt doorstep delivery.',
        ];
        rawDescription = buildSerpDescription(leadsA, closingsA);

        rawKeywords = [
          `wholesale ${lowerName} bd`,
          `bulk ${lowerName} supplier`,
          `b2b ${lowerName} dhaka`,
          `${lowerName} factory rate bd`,
          `low moq ${lowerName}`,
          `importer ${lowerName} bangladesh`,
          `commercial ${lowerName} sourcing`,
        ];
        break;
      }

      case 1: {
        // Angle B: Best Offers & Discount Intent
        strategy_label = 'Angle B: Best Offers & Discount Intent';

        const titleOptions = [
          `Best ${name} Deals & Offers in BD | Flash Sale Online`,
          `Buy ${name} Online in BD | Special Deals & Discounts`,
          `Exclusive ${name} Offers in BD | Authentic Online Shop`,
          `Shop ${name} Deals in BD | Verified Store Flash Sale`,
        ];
        rawTitle = titleOptions[subVar];

        const leadsB = [
          `Discover exclusive deals on ${name} in Bangladesh.`,
          `Shop best discounted ${name} online in Bangladesh.`,
          `Find unbeatable offers on ${name} in Bangladesh.`,
          `Grab the best deals on ${name} online in BD.`,
          `Order discounted ${name} online in Bangladesh.`,
        ];
        const closingsB = [
          'Shop 100% authentic products from top-rated sellers with cash on delivery and fast courier BD.',
          'Enjoy genuine items, seasonal flash sale discounts, cash on delivery, and quick parcel delivery.',
          'Verified merchant discounts, genuine product guarantees, and express 24-48h parcel delivery in BD.',
          'Enjoy verified seller discounts, flexible digital payments, and fast doorstep delivery across BD.',
          'Save with seasonal flash sales, verified store discounts, and reliable cash on delivery in BD.',
          'Enjoy authentic stock, markdown offers, cash on delivery, and fast courier dispatch nationwide.',
        ];
        rawDescription = buildSerpDescription(leadsB, closingsB);

        rawKeywords = [
          `buy ${lowerName} online bd`,
          `best ${lowerName} deals`,
          `${lowerName} discount offer`,
          `flash sale ${lowerName} bangladesh`,
          `authentic ${lowerName} shop`,
          `${lowerName} online store dhaka`,
          `cheap ${lowerName} price bd`,
        ];
        break;
      }

      case 2: {
        // Angle C: Quality & Range Intent
        strategy_label = 'Angle C: Quality & Range Intent';

        const titleOptions = [
          `Premium ${name} in BD | Top Brands & Fast Delivery`,
          `Original ${name} in Bangladesh | Top-Rated Selection`,
          `Buy Quality ${name} in BD | Verified Brand Collection`,
          `Top ${name} Brands in BD | Fast Nationwide Delivery`,
        ];
        rawTitle = titleOptions[subVar];

        const leadsC = [
          `Explore premium quality ${name} in Bangladesh.`,
          `Shop top-rated ${name} collection in Bangladesh.`,
          `Discover a wide range of authentic ${name} in BD.`,
          `Buy genuine high-grade ${name} in Bangladesh.`,
          `Find authentic branded ${name} online in BD.`,
        ];
        const closingsC = [
          'Wide collection of authentic products, hassle-free returns, and fast doorstep delivery across BD.',
          '100% genuine brand quality, verified merchant inspection, flexible payments, and fast delivery in BD.',
          'Premium materials, certified seller credentials, cash on delivery, and rapid courier nationwide.',
          'Guaranteed brand authenticity, official warranty support, and express 24-48h shipping across BD.',
          'Curated from top-rated brands with official warranty, verified credentials, and fast courier BD.',
          'Enjoy verified brand authenticity, safe parcel packaging, and quick doorstep delivery across BD.',
        ];
        rawDescription = buildSerpDescription(leadsC, closingsC);

        rawKeywords = [
          `original ${lowerName} bangladesh`,
          `top ${lowerName} brands bd`,
          `premium ${lowerName} online`,
          `${lowerName} home delivery dhaka`,
          `genuine ${lowerName} collection`,
          `best quality ${lowerName} bd`,
          `authentic ${lowerName} store`,
        ];
        break;
      }

      case 3:
      default: {
        // Angle D: Price & Comparison Intent
        strategy_label = 'Angle D: Price & Comparison Intent';

        const titleOptions = [
          `Compare ${name} Rates in BD | Best Prices & COD`,
          `${name} Online Price in BD | Compare Verified Stores`,
          `Best ${name} Market Rate in BD | Cash On Delivery`,
          `Compare & Buy ${name} in BD | Original Rate Online`,
        ];
        rawTitle = titleOptions[subVar];

        const leadsD = [
          `Compare current ${name} market rates in BD.`,
          `Check authentic ${name} price rates in Bangladesh.`,
          `Find the best market rates for ${name} in BD.`,
          `Compare and order ${name} at verified rates in BD.`,
          `Compare ${name} online prices in Bangladesh.`,
        ];
        const closingsD = [
          'Transparent pricing, zero hidden charges, cash on delivery, and fast courier dispatch nationwide.',
          'Compare multi-vendor store ratings, find the best market value, and enjoy reliable delivery in BD.',
          'Transparent merchant comparison, cash on delivery, easy returns, and fast home delivery across BD.',
          'Multi-store comparison, genuine customer reviews, safe payment, and rapid nationwide delivery.',
          'Find the lowest prices from verified stores with cash on delivery and fast parcel delivery in BD.',
          'Compare verified merchant offers, transparent rates, cash on delivery, and rapid doorstep transit.',
        ];
        rawDescription = buildSerpDescription(leadsD, closingsD);

        rawKeywords = [
          `${lowerName} price in bd`,
          `compare ${lowerName} prices`,
          `${lowerName} market rate bangladesh`,
          `cash on delivery ${lowerName}`,
          `best ${lowerName} price dhaka`,
          `verified ${lowerName} sellers bd`,
          `buy ${lowerName} cod bangladesh`,
        ];
        break;
      }
    }

    // 3. Strict Character Limits & SERP Normalization
    // A. Title: strictly <= 60 characters
    let seo_title = rawTitle.replace(/\s+/g, ' ').trim();
    if (seo_title.length > 60) {
      const parts = seo_title.split(' | ');
      if (parts.length > 1 && parts[0].length <= 60) {
        seo_title = parts[0].trim();
      } else {
        const sliced = seo_title.slice(0, 60);
        const lastSpace = sliced.lastIndexOf(' ');
        seo_title = (lastSpace > 25 ? sliced.slice(0, lastSpace) : sliced).trim();
      }
    }

    // B. Description: strictly calibrated to 150-160 characters
    let seo_description = rawDescription.replace(/\s+/g, ' ').trim();
    if (seo_description.length > 160) {
      const sliced = seo_description.slice(0, 160);
      const lastPeriod = sliced.lastIndexOf('.');
      if (lastPeriod >= 150) {
        seo_description = sliced.slice(0, lastPeriod + 1).trim();
      } else {
        const lastSpace = sliced.lastIndexOf(' ');
        if (lastSpace >= 148) {
          const cut = sliced.slice(0, lastSpace).trim();
          seo_description = cut.endsWith('.') ? cut : cut + '.';
        } else {
          seo_description = sliced.trim();
        }
      }
    } else if (seo_description.length < 150) {
      const baseWithoutDot = seo_description.replace(/\.+$/, '');
      const fillerHooks = [
        ' Fast delivery in Dhaka.', // 24
        ' Enjoy cash on delivery.', // 24
        ' Reliable delivery in BD.', // 25
        ' Fast delivery across BD.', // 25
        ' Shop online in Bangladesh.', // 27
        ' Order with fast COD in BD.', // 27
        ' Safe escrow checkout in BD.', // 28
        ' Verified seller guarantee BD.', // 30
      ];

      for (const hook of fillerHooks) {
        const candidate = `${baseWithoutDot}.${hook}`;
        if (candidate.length >= 150 && candidate.length <= 160) {
          seo_description = candidate;
          break;
        }
      }

      // If still under 150, choose closest and slice to 160 max
      if (seo_description.length < 150) {
        for (const hook of fillerHooks) {
          const candidate = `${baseWithoutDot}.${hook}`;
          if (candidate.length >= 150) {
            seo_description = candidate.slice(0, 160).trim();
            break;
          }
        }
      }
    }

    // C. Keywords: exactly 6 to 8 dynamic long-tail and short-tail keywords
    const seo_keywords = rawKeywords.slice(0, 7).join(', ');

    return {
      slug,
      seo_title,
      seo_description,
      seo_keywords,
      strategy_label,
    };
  },
};
