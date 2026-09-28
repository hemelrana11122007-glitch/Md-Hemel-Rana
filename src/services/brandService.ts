export interface BrandItem {
  id: string;
  name: string;
  slug: string;
  logo_url?: string;
  banner_url?: string;
  wordmark?: string;
  origin?: string;
  category?: string;
  description?: string;
  productsCount?: number;
  is_active?: boolean;
  is_featured?: boolean;
  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string;
  created_at?: string;
  updated_at?: string;
}

const BRANDS_STORAGE_KEY = 'armarket_brands_v2';

export const INITIAL_BRANDS: BrandItem[] = [
  {
    id: 'brand-ar-craft',
    name: 'AR Craft',
    slug: 'ar-craft-bd',
    logo_url: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&q=80&w=200',
    banner_url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=1200',
    wordmark: 'AR CRAFT',
    origin: 'Bangladesh',
    category: 'Ceramics & Handcrafts',
    description: 'Premier heritage Bangladeshi handcrafted ceramics, terracotta, and artisan home decor.',
    productsCount: 420,
    is_active: true,
    is_featured: true,
    seo_title: 'Official AR Craft Store BD | 100% Genuine Handcrafted Goods',
    seo_description: 'Buy 100% authentic AR Craft artisan ceramics in Bangladesh with authorized guarantee. Explore genuine decor at best rates with fast nationwide cash on delivery.',
    seo_keywords: 'ar craft official store bd, original ar craft bangladesh, buy ar craft online, authentic ar craft price, verified ar craft seller bd',
  },
  {
    id: 'brand-apex',
    name: 'Apex',
    slug: 'apex-footwear-bd',
    logo_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=200',
    banner_url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=1200',
    wordmark: 'APEX',
    origin: 'Bangladesh',
    category: 'Footwear & Leather',
    description: 'Leading authentic leather footwear and modern lifestyle accessories manufacturer in Bangladesh.',
    productsCount: 380,
    is_active: true,
    is_featured: true,
    seo_title: 'Official Apex Footwear BD Store | Authentic Shoes Online',
    seo_description: 'Shop genuine Apex footwear and leather accessories in Bangladesh. Guaranteed original quality, official brand warranty, and fast islandwide doorstep COD shipping.',
    seo_keywords: 'apex official store bd, original apex bangladesh, buy apex shoes online, authentic apex price, verified apex dealer bd',
  },
  {
    id: 'brand-walton',
    name: 'Walton',
    slug: 'walton-bd',
    logo_url: 'https://images.unsplash.com/photo-1588508065123-287b28e013da?auto=format&fit=crop&q=80&w=200',
    banner_url: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&q=80&w=1200',
    wordmark: 'WALTON',
    origin: 'Bangladesh',
    category: 'Electronics & Gadgets',
    description: 'Pioneering electronics and smart home appliances enterprise with official Bangladesh warranty.',
    productsCount: 890,
    is_active: true,
    is_featured: true,
    seo_title: 'Official Walton BD Store | Buy Genuine Electronics Online',
    seo_description: 'Discover 100% original Walton home appliances and gadgets in Bangladesh. Authorized brand warranty, unbeatable price offers, and reliable nationwide fast delivery.',
    seo_keywords: 'walton official store bd, original walton bangladesh, buy walton online, authentic walton price, verified walton distributor bd',
  },
  {
    id: 'brand-bata',
    name: 'Bata',
    slug: 'bata-shoes-bd',
    logo_url: 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&q=80&w=200',
    banner_url: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&q=80&w=1200',
    wordmark: 'BATA',
    origin: 'Bangladesh / Global',
    category: 'Shoes & Accessories',
    description: 'Renowned worldwide shoe collection tailored for comfort, durability, and daily elegance.',
    productsCount: 510,
    is_active: true,
    is_featured: true,
    seo_title: 'Official Bata Store BD | Buy Authentic Shoes & Footwear',
    seo_description: 'Shop genuine Bata footwear online in Bangladesh. 100% original brand stock, authorized replacement warranty, and fast home delivery with easy cash on delivery.',
    seo_keywords: 'bata official store bd, original bata bangladesh, buy bata shoes online, authentic bata price bd, verified bata shoes seller',
  },
  {
    id: 'brand-aarong',
    name: 'Aarong',
    slug: 'aarong-craft-bd',
    logo_url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=200',
    banner_url: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80&w=1200',
    wordmark: 'AARONG',
    origin: 'Bangladesh',
    category: 'Fashion & Handloom',
    description: 'World-famous fair-trade social enterprise showcasing handcrafted traditional Bangladeshi textiles and attire.',
    productsCount: 640,
    is_active: true,
    is_featured: true,
    seo_title: 'Official Aarong BD Store | Authentic Traditional Fashion',
    seo_description: 'Buy 100% authentic Aarong handloom and designer fashion in Bangladesh. Original handcrafted quality, best customer rates, and quick nationwide cash on delivery.',
    seo_keywords: 'aarong official store bd, original aarong bangladesh, buy aarong online, authentic aarong price, verified aarong retailer bd',
  },
  {
    id: 'brand-samsung',
    name: 'Samsung',
    slug: 'samsung-global',
    logo_url: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&q=80&w=200',
    banner_url: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&q=80&w=1200',
    wordmark: 'SAMSUNG',
    origin: 'South Korea',
    category: 'Electronics & Mobiles',
    description: 'Global technological leader delivering premium smartphones, televisions, and smart eco-devices.',
    productsCount: 1120,
    is_active: true,
    is_featured: true,
    seo_title: 'Official Samsung BD Store | 100% Original Products 2026',
    seo_description: 'Buy genuine Samsung smartphones and tech in Bangladesh. Official manufacturer warranty, direct authorized import, and fastest islandwide cash on delivery.',
    seo_keywords: 'samsung official store bd, original samsung bangladesh, buy samsung online, authentic samsung price, verified samsung distributor',
  },
  {
    id: 'brand-apple',
    name: 'Apple',
    slug: 'apple-official-store',
    logo_url: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&q=80&w=200',
    banner_url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=1200',
    wordmark: 'APPLE',
    origin: 'USA',
    category: 'Tech & Laptops',
    description: 'Iconic consumer electronics powerhouse known for iPhones, MacBooks, iPads, and Watch gear.',
    productsCount: 750,
    is_active: true,
    is_featured: true,
    seo_title: 'Official Apple Store BD | Genuine iPhones & MacBooks Online',
    seo_description: 'Order original Apple devices in Bangladesh with authentic international warranty. Guaranteed official serial verification, express shipping, and secure COD.',
    seo_keywords: 'apple official store bd, original apple bangladesh, buy iphone online bd, authentic apple price, verified apple dealer bangladesh',
  },
  {
    id: 'brand-sony',
    name: 'Sony',
    slug: 'sony-global',
    logo_url: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&q=80&w=200',
    banner_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=1200',
    wordmark: 'SONY',
    origin: 'Japan',
    category: 'Audio & Cameras',
    description: 'Celebrated leader in audio fidelity, mirrorless Alpha cameras, and PlayStation gaming gear.',
    productsCount: 890,
    is_active: true,
    is_featured: true,
    seo_title: 'Official Sony Store BD | 100% Genuine Audio & Cameras Online',
    seo_description: 'Buy genuine Sony headphones, Alpha cameras, and PlayStation accessories in BD. Official warranty, verified authorized import, and fast doorstep delivery.',
    seo_keywords: 'sony official store bd, original sony bangladesh, buy sony audio online, authentic sony price, verified sony distributor bd',
  },
  {
    id: 'brand-nike',
    name: 'Nike',
    slug: 'nike-bd',
    logo_url: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&q=80&w=200',
    banner_url: 'https://images.unsplash.com/photo-1518002171953-a080ee817e1f?auto=format&fit=crop&q=80&w=1200',
    wordmark: 'NIKE',
    origin: 'USA',
    category: 'Sports & Sneakers',
    description: 'World benchmark in athletic performance footwear, sports apparel, and training accessories.',
    productsCount: 640,
    is_active: true,
    is_featured: true,
    seo_title: 'Official Nike Store BD | Buy Authentic Sports Shoes Online',
    seo_description: 'Shop genuine Nike sneakers and sportswear in Bangladesh. Guaranteed authentic imported gear, best pricing deals, and fast doorstep shipping with verified COD.',
    seo_keywords: 'nike official store bd, original nike bangladesh, buy nike sneakers online, authentic nike price, verified nike retailer bd',
  },
  {
    id: 'brand-adidas',
    name: 'Adidas',
    slug: 'adidas-bd',
    logo_url: 'https://images.unsplash.com/photo-1518002171953-a080ee817e1f?auto=format&fit=crop&q=80&w=200',
    banner_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=1200',
    wordmark: 'ADIDAS',
    origin: 'Germany',
    category: 'Athletic Gear',
    description: 'Iconic three-stripes performance athletics and street lifestyle footwear collection.',
    productsCount: 520,
    is_active: true,
    is_featured: false,
    seo_title: 'Official Adidas Store BD | 100% Original Sneakers & Gear',
    seo_description: 'Buy genuine Adidas shoes and streetwear in Bangladesh. 100% authentic import, attractive discount prices, and rapid nationwide express cash on delivery.',
    seo_keywords: 'adidas official store bd, original adidas bangladesh, buy adidas online, authentic adidas price, verified adidas distributor bd',
  },
  {
    id: 'brand-lg',
    name: 'LG Electronics',
    slug: 'lg-electronics-bd',
    logo_url: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&q=80&w=200',
    banner_url: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&q=80&w=1200',
    wordmark: 'LG',
    origin: 'South Korea',
    category: 'Home Appliances',
    description: 'Intelligent life technologies including OLED TVs, inverter refrigerators, and washer appliances.',
    productsCount: 430,
    is_active: true,
    is_featured: false,
    seo_title: 'Official LG Electronics Store BD | Genuine Appliances Online',
    seo_description: 'Shop genuine LG home appliances in Bangladesh. Enjoy official warranty support, energy-saving inverter tech, and swift islandwide home delivery with COD.',
    seo_keywords: 'lg official store bd, original lg bangladesh, buy lg appliances online, authentic lg price, verified lg distributor bd',
  },
  {
    id: 'brand-xiaomi',
    name: 'Xiaomi',
    slug: 'xiaomi-global',
    logo_url: 'https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&q=80&w=200',
    banner_url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=1200',
    wordmark: 'XIAOMI',
    origin: 'China',
    category: 'Smart Gadgets & Eco',
    description: 'High-value smart ecosystems spanning smartphones, smartwatches, and smart home IoT.',
    productsCount: 470,
    is_active: true,
    is_featured: true,
    seo_title: 'Official Xiaomi Store BD | Genuine Phones & Smart Eco Gadgets',
    seo_description: 'Buy authentic Xiaomi smartphones and smart devices in Bangladesh. Authorized warranty coverage, competitive official pricing, and swift COD home delivery.',
    seo_keywords: 'xiaomi official store bd, original xiaomi bangladesh, buy redmi online bd, authentic xiaomi price, verified xiaomi dealer',
  },
];

export const brandService = {
  getBrands(): BrandItem[] {
    if (typeof window === 'undefined') return INITIAL_BRANDS;
    try {
      const stored = localStorage.getItem(BRANDS_STORAGE_KEY);
      if (!stored) {
        // Check for v1 migration
        const oldStored = localStorage.getItem('armarket_brands_v1');
        let initialList = INITIAL_BRANDS;
        if (oldStored) {
          try {
            const oldParsed = JSON.parse(oldStored);
            if (Array.isArray(oldParsed) && oldParsed.length > 0) {
              // Merge old items with new schema
              initialList = oldParsed.map((item: any, idx: number) => {
                const existingInitial = INITIAL_BRANDS.find((b) => b.name.toLowerCase() === item.name.toLowerCase());
                if (existingInitial) return existingInitial;
                const cleanSlug = item.name
                  .toLowerCase()
                  .replace(/&/g, 'and')
                  .replace(/[^\w\s-]/g, '')
                  .replace(/[\s_-]+/g, '-')
                  .replace(/^-+|-+$/g, '');
                return {
                  ...item,
                  slug: item.slug || `${cleanSlug}-bd`,
                  is_active: item.is_active !== undefined ? item.is_active : true,
                  is_featured: item.is_featured !== undefined ? item.is_featured : idx < 6,
                  productsCount: item.productsCount || 1,
                };
              });
            }
          } catch (_) {}
        }
        localStorage.setItem(BRANDS_STORAGE_KEY, JSON.stringify(initialList));
        return initialList;
      }

      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Ensure all items have slug & is_active
        return parsed.map((item: any) => {
          if (!item.slug) {
            const cleanSlug = item.name
              .toLowerCase()
              .replace(/&/g, 'and')
              .replace(/[^\w\s-]/g, '')
              .replace(/[\s_-]+/g, '-')
              .replace(/^-+|-+$/g, '');
            return {
              ...item,
              slug: `${cleanSlug}-bd`,
              is_active: item.is_active !== undefined ? item.is_active : true,
            };
          }
          return item;
        });
      }
      return INITIAL_BRANDS;
    } catch {
      return INITIAL_BRANDS;
    }
  },

  saveBrands(brands: BrandItem[]): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(BRANDS_STORAGE_KEY, JSON.stringify(brands));
    } catch {
      // ignore
    }
  },

  getBrandById(id: string): BrandItem | undefined {
    return this.getBrands().find((b) => b.id === id);
  },

  getBrandBySlug(slug: string): BrandItem | undefined {
    return this.getBrands().find((b) => b.slug.toLowerCase() === slug.toLowerCase());
  },

  addBrand(
    name: string,
    category?: string,
    origin?: string,
    logo_url?: string,
    options?: Partial<BrandItem>
  ): BrandItem {
    const list = this.getBrands();
    const cleanName = name.trim();
    const existing = list.find((b) => b.name.toLowerCase() === cleanName.toLowerCase());
    if (existing) {
      if (options && Object.keys(options).length > 0) {
        return this.updateBrand(existing.id, options) || existing;
      }
      return existing;
    }

    const aiSeo = this.generateLocalAiBrandSeo(cleanName, 1);

    const newBrand: BrandItem = {
      id: `brand-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name: cleanName,
      slug: options?.slug || aiSeo.slug,
      wordmark: options?.wordmark || cleanName.toUpperCase(),
      origin: origin || options?.origin || 'Bangladesh',
      category: category || options?.category || 'General',
      logo_url: logo_url || options?.logo_url || '',
      banner_url: options?.banner_url || '',
      description: options?.description || `Authentic ${cleanName} collection on AR Market BD.`,
      productsCount: options?.productsCount || 1,
      is_active: options?.is_active !== undefined ? options.is_active : true,
      is_featured: options?.is_featured !== undefined ? options.is_featured : false,
      seo_title: options?.seo_title || aiSeo.seo_title,
      seo_description: options?.seo_description || aiSeo.seo_description,
      seo_keywords: options?.seo_keywords || aiSeo.seo_keywords,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const updated = [newBrand, ...list];
    this.saveBrands(updated);
    return newBrand;
  },

  updateBrand(id: string, updates: Partial<BrandItem>): BrandItem | undefined {
    const list = this.getBrands();
    const index = list.findIndex((b) => b.id === id);
    if (index === -1) return undefined;

    const current = list[index];
    const updatedBrand: BrandItem = {
      ...current,
      ...updates,
      updated_at: new Date().toISOString(),
    };

    list[index] = updatedBrand;
    this.saveBrands(list);
    return updatedBrand;
  },

  deleteBrand(id: string): boolean {
    const list = this.getBrands();
    const filtered = list.filter((b) => b.id !== id);
    if (filtered.length === list.length) return false;
    this.saveBrands(filtered);
    return true;
  },

  /**
   * Upload Brand Logo or Brand Banner directly to secure server storage
   * Performs client validation before sending multipart/form-data
   * Zero LocalStorage Blob URLs
   */
  async uploadBrandAsset(file: File, assetType: 'logo' | 'banner'): Promise<{
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
      throw new Error('শুধুমাত্র বৈধ ছবি ফর্মেট (PNG, JPG, JPEG, WEBP, SVG) অনুমোদিত। / Only PNG, JPG, JPEG, WEBP, and SVG formats are permitted.');
    }

    // 2. Client-side Size validation
    // Logo: max 2MB
    // Banner: max 5MB
    const maxLogoBytes = 2 * 1024 * 1024;
    const maxBannerBytes = 5 * 1024 * 1024;

    if (assetType === 'logo' && file.size > maxLogoBytes) {
      const mb = (file.size / (1024 * 1024)).toFixed(2);
      throw new Error(`Brand Logo-র সাইজ সর্বোচ্চ 2MB অনুমোদিত (নির্বাচিত: ${mb} MB)। দয়া করে ছোট ছবি নির্বাচন করুন।`);
    }

    if (assetType === 'banner' && file.size > maxBannerBytes) {
      const mb = (file.size / (1024 * 1024)).toFixed(2);
      throw new Error(`Brand Banner-এর সাইজ সর্বোচ্চ 5MB অনুমোদিত (নির্বাচিত: ${mb} MB)। দয়া করে ছোট ছবি নির্বাচন করুন।`);
    }

    // 3. Multi-part Form Data transmission to secure backend storage
    const formData = new FormData();
    formData.append('file', file);
    formData.append('assetType', assetType);

    const res = await fetch('/api/upload/brand-asset', {
      method: 'POST',
      body: formData,
      credentials: 'include',
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Failed to upload brand asset to secure server storage.');
    }

    return data;
  },

  /**
   * Dynamic Market-Researched Brand SEO Meta Engine (Zero 3rd party API, deterministic native AI)
   *
   * Multi-Angle Rotational Strategy:
   *   - Angle A (Official Brand Store & Direct Authenticity Intent)
   *   - Angle B (Direct Importer & Wholesale Tier Pricing Intent)
   *   - Angle C (Best Offers & Promotional Flash Deals Intent)
   *   - Angle D (Market Price Comparison & COD Review Intent)
   *
   * Strict Google SERP Character Limits:
   *   - SEO Title: 50-60 characters strictly
   *   - SEO Description: 140-160 characters strictly
   *   - SEO Keywords: 6 to 8 dynamic comma-separated keywords
   */
  generateLocalAiBrandSeo(
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
    const baseSlug = name
      .toLowerCase()
      .replace(/&/g, 'and')
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');

    // Angle selection (0 to 3)
    const angleIndex = Math.abs(variationSeed) % 4;

    // Sub-variation seed based on character codes
    const charSum = name
      .split('')
      .reduce((sum, ch, idx) => sum + ch.charCodeAt(0) * (idx + 1), 0);
    const subVar = Math.abs(Math.floor(variationSeed / 4) + charSum) % 4;

    // Slug variation based on angle
    const slugSuffixes = ['global', 'official-store', 'bd', 'brand'];
    const chosenSuffix = slugSuffixes[(angleIndex + subVar) % slugSuffixes.length];
    const generatedSlug = baseSlug.includes(chosenSuffix) ? baseSlug : `${baseSlug}-${chosenSuffix}`;

    const lowerName = name.toLowerCase();

    /**
     * Helper to select a Title strictly between 50 and 60 characters
     */
    const selectSerpTitle = (candidates: string[]): string => {
      // Rotate candidates based on subVar
      const rotated = [...candidates.slice(subVar), ...candidates.slice(0, subVar)];
      for (const cand of rotated) {
        if (cand.length >= 50 && cand.length <= 60) {
          return cand;
        }
      }

      // Try extending if too short
      for (const cand of rotated) {
        if (cand.length < 50) {
          const fillers = [' | AR BD', ' | BD Store', ' | BD 2026', ' - AR Market BD', ' | Official BD'];
          for (const f of fillers) {
            const ext = `${cand}${f}`;
            if (ext.length >= 50 && ext.length <= 60) {
              return ext;
            }
          }
        }
      }

      // Try clean word trimming if too long
      for (const cand of rotated) {
        if (cand.length > 60) {
          const words = cand.split(' ');
          let trimmed = '';
          for (const w of words) {
            if ((trimmed ? `${trimmed} ${w}` : w).length <= 60) {
              trimmed = trimmed ? `${trimmed} ${w}` : w;
            } else {
              break;
            }
          }
          if (trimmed.length >= 50 && trimmed.length <= 60) {
            return trimmed;
          }
        }
      }

      const fallback = `Official ${name} BD Store | Authentic Products 2026`;
      if (fallback.length > 60) return fallback.substring(0, 60);
      if (fallback.length < 50) return `${fallback} | AR BD`.substring(0, 60);
      return fallback;
    };

    /**
     * Helper to select a Description strictly between 140 and 160 characters
     */
    const selectSerpDescription = (leads: string[], closings: string[]): string => {
      const rotatedLeads = [...leads.slice(subVar), ...leads.slice(0, subVar)];

      // 1. Direct match
      for (const lead of rotatedLeads) {
        for (const closing of closings) {
          const full = `${lead} ${closing}`.replace(/\s+/g, ' ').trim();
          if (full.length >= 140 && full.length <= 160) {
            return full;
          }
        }
      }

      // 2. Lead + closing with natural BD suffix if under 140
      const suffixes = [
        ' Fast COD islandwide.',
        ' Islandwide express COD.',
        ' Easy return policy BD.',
        ' Reliable COD in BD.',
        ' Order today in BD.',
      ];
      for (const lead of rotatedLeads) {
        for (const closing of closings) {
          const base = `${lead} ${closing}`.replace(/\s+/g, ' ').trim();
          for (const suf of suffixes) {
            const candidate = `${base}${suf}`;
            if (candidate.length >= 140 && candidate.length <= 160) {
              return candidate;
            }
          }
        }
      }

      const safe = `Buy 100% genuine ${name} products in Bangladesh with authorized warranty. Shop original items at official rates with fast nationwide cash on delivery.`;
      if (safe.length >= 140 && safe.length <= 160) return safe;
      if (safe.length > 160) return safe.substring(0, 159).replace(/\s+\S*$/, '.');
      return `${safe} Fast COD in BD.`.substring(0, 160);
    };

    let title = '';
    let description = '';
    let keywords = '';
    let strategyLabel = '';

    if (angleIndex === 0) {
      // ANGLE A: Official Brand Store & Direct Authenticity Intent
      strategyLabel = 'Official Brand Store & Genuine Authenticity (Angle A)';

      const titleCandidates = [
        `Official ${name} BD Store | 100% Genuine Authentic Products`,
        `Official ${name} Bangladesh Store | 100% Original Products`,
        `Buy Authentic ${name} in BD | Official Store Direct Import`,
        `${name} Bangladesh Official Store | Genuine Products Online`,
        `Official ${name} Store BD | 100% Original Products`,
        `Buy Genuine ${name} in BD | Official Authorized Store`,
        `Official ${name} Bangladesh Store | Authentic Products`,
        `${name} Official Store BD | Genuine Authentic Products`,
        `${name} Store in Bangladesh | Buy 100% Genuine Online`,
        `Official ${name} BD Store | Authentic Products 2026`,
        `Official ${name} Store BD | 100% Authentic Products`,
        `Buy ${name} in Bangladesh | Official Store Online`,
      ];
      title = selectSerpTitle(titleCandidates);

      const leads = [
        `Shop authentic ${name} products in Bangladesh.`,
        `Buy 100% original ${name} collection in Bangladesh.`,
        `Explore genuine ${name} lineup at official rates in BD.`,
        `Order authentic ${name} products with official warranty in BD.`,
      ];
      const closings = [
        'Enjoy authorized manufacturer warranty, verified serial check, and swift islandwide home delivery.',
        'Get guaranteed genuine serials, authorized brand guarantee, and fast nationwide cash on delivery.',
        'Benefit from official distributor replacement warranty, best price offers, and rapid doorstep COD.',
        'Guaranteed authentic origin, verified distributor support, and lightning-fast nationwide express delivery.',
      ];
      description = selectSerpDescription(leads, closings);

      keywords = [
        `${lowerName} official store bd`,
        `original ${lowerName} bangladesh`,
        `buy ${lowerName} online`,
        `authentic ${lowerName} price`,
        `verified ${lowerName} seller`,
        `${lowerName} authorized dealer bd`,
        `${lowerName} warranty bd`,
      ].join(', ');
    } else if (angleIndex === 1) {
      // ANGLE B: Direct Importer & Wholesale Tier Pricing Intent
      strategyLabel = 'Direct Importer & Wholesale Tier Pricing (Angle B)';

      const titleCandidates = [
        `Direct Importer ${name} BD | Wholesale & Bulk Deal Rates`,
        `${name} Wholesale & Importer Rates BD | Verified Supply`,
        `Bulk ${name} Wholesale Prices BD | Direct Importer Store`,
        `Wholesale ${name} Supplier BD | Lowest Bulk Rates 2026`,
        `Direct ${name} Importers in BD | Wholesale Bulk Pricing`,
        `${name} Wholesale Deals BD | Direct Importer Best Prices`,
        `Buy Wholesale ${name} in BD | Verified Direct Importers`,
        `Direct Importer ${name} in BD | Bulk Wholesale Deals`,
        `${name} Wholesale Prices BD | Direct Importer Sourcing`,
        `Bulk ${name} Rates in BD | Direct Importer B2B Supply`,
      ];
      title = selectSerpTitle(titleCandidates);

      const leads = [
        `Source authentic ${name} products directly from verified importers in BD.`,
        `Order bulk ${name} inventory from verified Bangladesh importers.`,
        `Connect with authorized ${name} wholesale suppliers in Bangladesh.`,
        `Get direct factory importer rates on ${name} items in BD.`,
      ];
      const closings = [
        'Access low wholesale prices, bulk order volume discounts, and safe nationwide freight delivery.',
        'Benefit from tiered wholesale deals, guaranteed authentic batch stock, and reliable fast COD.',
        'Enjoy factory-direct bulk pricing, verified merchant supply, and swift freight transportation.',
        'Take advantage of low commercial MOQs, verified invoice authenticity, and rapid parcel dispatch.',
      ];
      description = selectSerpDescription(leads, closings);

      keywords = [
        `wholesale ${lowerName} bangladesh`,
        `${lowerName} direct importer bd`,
        `bulk ${lowerName} price`,
        `${lowerName} b2b supplier bd`,
        `buy ${lowerName} wholesale`,
        `${lowerName} distributor bangladesh`,
        `low price ${lowerName}`,
      ].join(', ');
    } else if (angleIndex === 2) {
      // ANGLE C: Best Offers & Promotional Flash Deals Intent
      strategyLabel = 'Best Offers & Promotional Flash Deals (Angle C)';

      const titleCandidates = [
        `Exclusive ${name} Deals BD | Best Flash Sale Discounts`,
        `${name} Offers & Flash Discounts BD | Best Prices 2026`,
        `Best ${name} Deals in Bangladesh | Top Discounts & Offers`,
        `Shop ${name} Offers BD | Genuine Products on Flash Sale`,
        `${name} Mega Sale Discounts BD | Exclusive Online Offers`,
        `Best ${name} Offers BD 2026 | Verified Online Discounts`,
        `Top ${name} Deals in BD | Exclusive Flash Sale Offers`,
        `Buy ${name} at Best Deals BD | Flash Sale Discounts 2026`,
        `${name} Promo Offers BD | Verified Deals & Discounts`,
      ];
      title = selectSerpTitle(titleCandidates);

      const leads = [
        `Grab exclusive flash discounts and limited-time deals on ${name} in Bangladesh.`,
        `Unbeatable promotional offers and discount vouchers on ${name} in BD.`,
        `Discover top flash sale savings on genuine ${name} products in Bangladesh.`,
        `Save big on authentic ${name} lineup with exclusive flash deals in BD.`,
      ];
      const closings = [
        'Shop 100% authentic items at best prices with secure cash on delivery BD.',
        'Enjoy verified product quality, attractive promo coupon vouchers, and fast doorstep shipping.',
        'Get guaranteed genuine items, maximum discount rates, and rapid doorstep delivery.',
        'Experience authentic merchandise, special bundle discounts, and instant islandwide COD.',
      ];
      description = selectSerpDescription(leads, closings);

      keywords = [
        `${lowerName} discount offers bd`,
        `buy ${lowerName} flash sale`,
        `best ${lowerName} deals bangladesh`,
        `cheap ${lowerName} price`,
        `${lowerName} promo code bd`,
        `buy ${lowerName} online shop`,
        `${lowerName} sale bd`,
      ].join(', ');
    } else {
      // ANGLE D: Market Price Comparison & COD Review Intent
      strategyLabel = 'Market Price Comparison & COD Guarantee (Angle D)';

      const titleCandidates = [
        `Best ${name} Price in BD 2026 | Compare Authentic Rates`,
        `${name} Price in Bangladesh | Compare Verified BD Rates`,
        `Latest ${name} Rates in BD 2026 | Verified COD Shopping`,
        `Compare ${name} Prices BD | Best Online Market Rates`,
        `${name} Price in BD Today | Compare Authentic Offers`,
        `Updated ${name} BD Price 2026 | Compare Verified Rates`,
        `Check ${name} Price in BD | Compare Verified Market Rates`,
        `Best ${name} Rates BD 2026 | Compare Authentic Prices`,
      ];
      title = selectSerpTitle(titleCandidates);

      const leads = [
        `Check updated ${name} prices in Bangladesh with verified dealer offers.`,
        `Compare original ${name} rates in Bangladesh across authorized merchants.`,
        `Find lowest authentic market price for ${name} products in Bangladesh.`,
        `Review genuine ${name} rates and specs online in BD before you order.`,
      ];
      const closings = [
        'Compare authorized merchant deals, inspect serials upon delivery, and order with instant COD.',
        'Find competitive prices across trusted retailers with rapid doorstep delivery and easy returns.',
        'Verify authentic serial numbers upon delivery, compare market rates, and enjoy prompt COD.',
        'Enjoy real customer ratings, competitive market rates, and reliable islandwide cash on delivery.',
      ];
      description = selectSerpDescription(leads, closings);

      keywords = [
        `${lowerName} price in bangladesh`,
        `${lowerName} bd price 2026`,
        `compare ${lowerName} rates`,
        `buy ${lowerName} cash on delivery`,
        `${lowerName} cost in bd`,
        `latest ${lowerName} models`,
        `${lowerName} reviews bangladesh`,
      ].join(', ');
    }

    return {
      slug: generatedSlug,
      seo_title: title,
      seo_description: description,
      seo_keywords: keywords,
      strategy_label: strategyLabel,
    };
  },
};
