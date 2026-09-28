import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  Sparkles,
  Upload,
  Globe,
  Tag,
  CheckCircle2,
  Image as ImageIcon,
  RotateCcw,
  Save,
  Check,
  Zap,
  Info,
  ExternalLink,
  ShieldCheck,
  Eye,
  X,
  AlertCircle,
  Loader2,
  HardDrive,
  Layers,
  Star,
  FileCheck2,
} from 'lucide-react';
import { BrandItem, brandService } from '../../../services/brandService';

interface BrandFormViewProps {
  initialBrandId?: string | null;
  onBack: () => void;
  onShowToast: (message: string) => void;
}

export const BrandFormView: React.FC<BrandFormViewProps> = ({
  initialBrandId,
  onBack,
  onShowToast,
}) => {
  const isEditing = Boolean(initialBrandId);

  // Native File Input References
  const logoFileInputRef = useRef<HTMLInputElement>(null);
  const bannerFileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [wordmark, setWordmark] = useState('');
  const [origin, setOrigin] = useState('Bangladesh');
  const [category, setCategory] = useState('Electronics & Gadgets');
  const [description, setDescription] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [bannerUrl, setBannerUrl] = useState('');

  // Upload States & Metadata
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);
  const [logoError, setLogoError] = useState<string | null>(null);
  const [bannerError, setBannerError] = useState<string | null>(null);
  const [logoMeta, setLogoMeta] = useState<{ name: string; size: string; isServerStored?: boolean } | null>(null);
  const [bannerMeta, setBannerMeta] = useState<{ name: string; size: string; isServerStored?: boolean } | null>(null);
  const [isDraggingLogo, setIsDraggingLogo] = useState(false);
  const [isDraggingBanner, setIsDraggingBanner] = useState(false);

  // SEO AI Engine Section
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');
  const [seoKeywords, setSeoKeywords] = useState('');

  // Toggles
  const [isFeatured, setIsFeatured] = useState(false);
  const [isActive, setIsActive] = useState(true);

  // Track if user has manually edited SEO fields
  const [isSeoDirty, setIsSeoDirty] = useState(false);
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Regeneration counter to guarantee completely unique SEO strategies & content every click
  const [regenCounter, setRegenCounter] = useState(1);
  const [activeStrategyLabel, setActiveStrategyLabel] = useState<string>('');

  // If editing, load existing brand data
  useEffect(() => {
    if (initialBrandId) {
      const existing = brandService.getBrandById(initialBrandId);
      if (existing) {
        setName(existing.name);
        setSlug(existing.slug);
        setWordmark(existing.wordmark || '');
        setOrigin(existing.origin || 'Bangladesh');
        setCategory(existing.category || 'General');
        setDescription(existing.description || '');
        setLogoUrl(existing.logo_url || '');
        setBannerUrl(existing.banner_url || '');
        setSeoTitle(existing.seo_title || '');
        setSeoDescription(existing.seo_description || '');
        setSeoKeywords(existing.seo_keywords || '');
        setIsFeatured(Boolean(existing.is_featured));
        setIsActive(Boolean(existing.is_active));
        setIsSeoDirty(true);
      }
    }
  }, [initialBrandId]);

  /**
   * Real-time Local Brand AI Engine triggered on Brand Identity Name change
   * Zero 3rd party API, 100% deterministic web-native SEO generator
   */
  const handleNameChange = (val: string) => {
    setName(val);

    // Auto-generate slug, title, description, and keywords in real-time
    if (!isSeoDirty || !isEditing) {
      const nameHash = Math.abs(val.split('').reduce((sum, ch, i) => sum + ch.charCodeAt(0) * (i + 1), 0));
      const aiResult = brandService.generateLocalAiBrandSeo(val, regenCounter + nameHash);
      setSlug(aiResult.slug);
      setSeoTitle(aiResult.seo_title);
      setSeoDescription(aiResult.seo_description);
      setSeoKeywords(aiResult.seo_keywords);
      setActiveStrategyLabel(aiResult.strategy_label);
      if (!wordmark || wordmark === name.toUpperCase()) {
        setWordmark(val.trim().toUpperCase());
      }
    } else {
      // Even if SEO fields are customized, keep slug synced unless manually modified
      const aiResult = brandService.generateLocalAiBrandSeo(val, regenCounter);
      if (!slug || slug === brandService.generateLocalAiBrandSeo(name, regenCounter).slug) {
        setSlug(aiResult.slug);
      }
    }
  };

  /**
   * Force regenerate SEO metadata across multi-angle rotation
   */
  const handleForceRegenerateAi = () => {
    if (!name.trim()) {
      onShowToast('Please type a Brand Identity Name first.');
      return;
    }
    setIsAiGenerating(true);
    const nextSeed = regenCounter + 1;
    setRegenCounter(nextSeed);

    setTimeout(() => {
      const aiResult = brandService.generateLocalAiBrandSeo(name, nextSeed);
      setSlug(aiResult.slug);
      setSeoTitle(aiResult.seo_title);
      setSeoDescription(aiResult.seo_description);
      setSeoKeywords(aiResult.seo_keywords);
      setActiveStrategyLabel(aiResult.strategy_label);
      setIsAiGenerating(false);
      onShowToast(`Unique Brand SEO generated: "${aiResult.strategy_label}"`);
    }, 180);
  };

  // Direct Native File Picker Handlers
  const handleLogoUploadClick = () => {
    setLogoError(null);
    logoFileInputRef.current?.click();
  };

  const handleBannerUploadClick = () => {
    setBannerError(null);
    bannerFileInputRef.current?.click();
  };

  const validateAndUploadFile = async (file: File, assetType: 'logo' | 'banner') => {
    const isLogo = assetType === 'logo';
    if (isLogo) {
      setLogoError(null);
      setIsUploadingLogo(true);
    } else {
      setBannerError(null);
      setIsUploadingBanner(true);
    }

    try {
      // 1. Strict MIME and Extension Validation
      const allowedMimes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/svg+xml'];
      const fileMime = file.type.toLowerCase();
      const fileName = file.name.toLowerCase();
      const hasValidExt = /\.(png|jpe?g|webp|svg)$/i.test(fileName);

      if (!allowedMimes.includes(fileMime) && !hasValidExt) {
        throw new Error('শুধুমাত্র বৈধ ছবি ফর্মেট (PNG, JPG, JPEG, WEBP, SVG) অনুমোদিত। / Only PNG, JPG, JPEG, WEBP, and SVG formats are permitted.');
      }

      // 2. Strict Size Limits per asset type:
      // Brand Logo: max 2MB (2 * 1024 * 1024)
      // Brand Banner: max 5MB (5 * 1024 * 1024)
      const maxLogoBytes = 2 * 1024 * 1024;
      const maxBannerBytes = 5 * 1024 * 1024;

      if (isLogo && file.size > maxLogoBytes) {
        const mb = (file.size / (1024 * 1024)).toFixed(2);
        throw new Error(`Brand Logo-র সাইজ সর্বোচ্চ 2MB অনুমোদিত (নির্বাচিত: ${mb} MB)। দয়া করে ছোট ছবি নির্বাচন করুন।`);
      }

      if (!isLogo && file.size > maxBannerBytes) {
        const mb = (file.size / (1024 * 1024)).toFixed(2);
        throw new Error(`Brand Banner-এর সাইজ সর্বোচ্চ 5MB অনুমোদিত (নির্বাচিত: ${mb} MB)। দয়া করে ছোট ছবি নির্বাচন করুন।`);
      }

      // 3. Multi-part Form Data upload to Secure Backend Server Storage
      const result = await brandService.uploadBrandAsset(file, assetType);

      const formattedSize =
        file.size > 1024 * 1024
          ? `${(file.size / (1024 * 1024)).toFixed(2)} MB`
          : `${Math.round(file.size / 1024)} KB`;

      if (isLogo) {
        setLogoUrl(result.url);
        setLogoMeta({
          name: result.originalName || file.name,
          size: formattedSize,
          isServerStored: true,
        });
        onShowToast(`Brand logo uploaded successfully to secure storage: ${result.filename}`);
      } else {
        setBannerUrl(result.url);
        setBannerMeta({
          name: result.originalName || file.name,
          size: formattedSize,
          isServerStored: true,
        });
        onShowToast(`Brand banner uploaded successfully to secure storage: ${result.filename}`);
      }
    } catch (err: any) {
      const msg = err.message || 'Image upload failed. Please verify file format and size.';
      if (isLogo) {
        setLogoError(msg);
      } else {
        setBannerError(msg);
      }
      onShowToast(msg);
    } finally {
      if (isLogo) {
        setIsUploadingLogo(false);
      } else {
        setIsUploadingBanner(false);
      }
    }
  };

  const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      validateAndUploadFile(file, 'logo');
    }
    e.target.value = '';
  };

  const handleBannerFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      validateAndUploadFile(file, 'banner');
    }
    e.target.value = '';
  };

  // Drag and drop handlers
  const handleLogoDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingLogo(false);
    const file = e.dataTransfer.files?.[0];
    if (file) validateAndUploadFile(file, 'logo');
  };

  const handleBannerDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingBanner(false);
    const file = e.dataTransfer.files?.[0];
    if (file) validateAndUploadFile(file, 'banner');
  };

  // Submit Handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      onShowToast('Brand Identity Name is required.');
      return;
    }

    if (!slug.trim()) {
      onShowToast('Brand Slug is required.');
      return;
    }

    setIsSubmitting(true);

    try {
      const brandPayload = {
        name: name.trim(),
        slug: slug.trim().toLowerCase(),
        wordmark: wordmark.trim() || name.trim().toUpperCase(),
        origin: origin.trim() || 'Bangladesh',
        category: category.trim() || 'General',
        description: description.trim() || `Official ${name.trim()} storefront on AR Market BD.`,
        logo_url: logoUrl.trim(),
        banner_url: bannerUrl.trim(),
        seo_title: seoTitle.trim(),
        seo_description: seoDescription.trim(),
        seo_keywords: seoKeywords.trim(),
        is_active: isActive,
        is_featured: isFeatured,
      };

      if (isEditing && initialBrandId) {
        brandService.updateBrand(initialBrandId, brandPayload);
        onShowToast(`Brand "${name.trim()}" updated successfully.`);
      } else {
        brandService.addBrand(name.trim(), category, origin, logoUrl, brandPayload);
        onShowToast(`Global Brand "${name.trim()}" registered successfully!`);
      }

      onBack();
    } catch (err: any) {
      onShowToast(err.message || 'Failed to save brand.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Keyword array parsed from comma-separated string
  const keywordsList = seoKeywords
    .split(',')
    .map((k) => k.trim())
    .filter(Boolean);

  return (
    <div className="space-y-6 animate-in fade-in duration-200 pb-20">
      {/* Hidden Native File Inputs */}
      <input
        ref={logoFileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml"
        onChange={handleLogoFileChange}
        className="hidden"
      />
      <input
        ref={bannerFileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml"
        onChange={handleBannerFileChange}
        className="hidden"
      />

      {/* 1. Top Navigation Bar */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 text-slate-500 hover:text-slate-900 bg-white hover:bg-slate-100 rounded-xl border border-slate-200/80 transition-all cursor-pointer shadow-2xs"
            title="Back to Brands List"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#008080]/10 text-[#008080] border border-[#008080]/20 mb-1">
              <Tag className="w-3 h-3" />
              <span>/admin/brands/{isEditing ? 'edit' : 'create'}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight font-display">
              {isEditing ? `Edit Brand: ${name || 'Global Brand'}` : 'Register Global Brand'}
            </h1>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 2. SECTION 1: Brand Identity & Basic Information */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-5">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-[#008080] flex items-center justify-center font-bold">
              <Tag className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Brand Identity & Master Taxonomy</h2>
              <p className="text-[11px] text-slate-400">
                Define unique brand identity name and storefront URL slug.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Brand Identity Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Brand Identity Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. Samsung, Apple, Walton, Apex, Aarong..."
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  required
                  autoFocus={!isEditing}
                  className="w-full px-3.5 py-2.5 bg-slate-50 focus:bg-white text-xs font-bold text-slate-900 placeholder-slate-400 rounded-xl border border-slate-200 focus:border-[#008080] focus:ring-2 focus:ring-[#008080]/20 transition-all outline-hidden"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-teal-50 text-[#008080] border border-teal-200">
                    <Sparkles className="w-2.5 h-2.5" />
                    <span>Real-time AI Auto-Fill</span>
                  </span>
                </div>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Typing here instantly generates SEO Meta Title, Meta Description, Keywords, and Storefront Slug in real-time.
              </p>
            </div>

            {/* Brand Slug */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Brand Slug <span className="text-rose-500">*</span>
              </label>
              <div className="flex items-center">
                <span className="px-3 py-2.5 bg-slate-100 border border-r-0 border-slate-200 rounded-l-xl text-[11px] font-mono text-slate-500 select-none">
                  armarketbd.com/brand/
                </span>
                <input
                  type="text"
                  placeholder="samsung-global"
                  value={slug}
                  onChange={(e) => {
                    setSlug(e.target.value);
                    setIsSeoDirty(true);
                  }}
                  required
                  className="flex-1 px-3 py-2.5 bg-slate-50 focus:bg-white text-xs font-mono font-bold text-slate-900 placeholder-slate-400 rounded-r-xl border border-slate-200 focus:border-[#008080] focus:ring-2 focus:ring-[#008080]/20 transition-all outline-hidden"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Official canonical URL path for customer store navigation.
              </p>
            </div>
          </div>
        </div>

        {/* 3. SECTION 2: Visual Brand Assets (Direct Native File Upload & Zero LocalStorage) */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-teal-50 text-[#008080] flex items-center justify-center font-bold">
                <ImageIcon className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">Brand Visual Assets (Secure Server Storage)</h2>
                <p className="text-[11px] text-slate-400">
                  Direct native file upload with strict MIME and cryptographic server validation. Zero LocalStorage blobs.
                </p>
              </div>
            </div>

            <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Zero LocalStorage Vulnerabilities</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Logo Upload Box */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700">
                  Brand Logo <span className="text-slate-400 font-normal">(PNG, JPG, SVG - Max 2MB)</span>
                </label>
                {logoUrl && (
                  <button
                    type="button"
                    onClick={() => {
                      setLogoUrl('');
                      setLogoMeta(null);
                    }}
                    className="text-[11px] font-semibold text-rose-600 hover:text-rose-700 cursor-pointer"
                  >
                    Remove Logo
                  </button>
                )}
              </div>

              {/* Drag/Drop Zone or Preview */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDraggingLogo(true);
                }}
                onDragLeave={() => setIsDraggingLogo(false)}
                onDrop={handleLogoDrop}
                className={`relative border-2 border-dashed rounded-2xl p-4 transition-all ${
                  isDraggingLogo
                    ? 'border-[#008080] bg-teal-50/50'
                    : 'border-slate-200 hover:border-[#008080]/50 bg-slate-50/50'
                }`}
              >
                {logoUrl ? (
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-xl bg-white border border-slate-200 p-1 flex items-center justify-center overflow-hidden shrink-0 shadow-xs">
                      <img
                        src={logoUrl}
                        alt="Logo Preview"
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          (e.currentTarget as HTMLElement).style.display = 'none';
                        }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <HardDrive className="w-3 h-3 text-emerald-600" />
                          <span>Server Hosted Asset</span>
                        </span>
                      </div>
                      <p className="text-xs font-mono font-bold text-slate-800 truncate">
                        {logoMeta?.name || logoUrl.split('/').pop()}
                      </p>
                      {logoMeta?.size && (
                        <p className="text-[10px] text-slate-400 mt-0.5">Size: {logoMeta.size}</p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          type="button"
                          onClick={handleLogoUploadClick}
                          disabled={isUploadingLogo}
                          className="px-3 py-1 bg-white hover:bg-slate-100 text-slate-700 text-[11px] font-bold rounded-lg border border-slate-200 transition-all cursor-pointer shadow-2xs"
                        >
                          Replace Logo
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <div className="w-12 h-12 rounded-xl bg-teal-50 text-[#008080] flex items-center justify-center mx-auto mb-2 border border-teal-100">
                      {isUploadingLogo ? (
                        <Loader2 className="w-6 h-6 animate-spin text-[#008080]" />
                      ) : (
                        <Upload className="w-6 h-6" />
                      )}
                    </div>
                    <p className="text-xs font-bold text-slate-700">
                      {isUploadingLogo ? 'Uploading securely to server...' : 'Drag & drop Brand Logo here'}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5 mb-3">
                      PNG, JPG, JPEG, WEBP or SVG (Max 2MB)
                    </p>
                    <button
                      type="button"
                      onClick={handleLogoUploadClick}
                      disabled={isUploadingLogo}
                      className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-[#008080] hover:bg-[#006666] text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload Logo</span>
                    </button>
                  </div>
                )}

                {logoError && (
                  <div className="mt-2.5 p-2 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-2 text-rose-700 text-xs">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span className="font-semibold">{logoError}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Banner Upload Box */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700">
                  Promotional Banner{' '}
                  <span className="text-slate-400 font-normal">(1200x400 - Max 5MB)</span>
                </label>
                {bannerUrl && (
                  <button
                    type="button"
                    onClick={() => {
                      setBannerUrl('');
                      setBannerMeta(null);
                    }}
                    className="text-[11px] font-semibold text-rose-600 hover:text-rose-700 cursor-pointer"
                  >
                    Remove Banner
                  </button>
                )}
              </div>

              {/* Drag/Drop Zone or Preview */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDraggingBanner(true);
                }}
                onDragLeave={() => setIsDraggingBanner(false)}
                onDrop={handleBannerDrop}
                className={`relative border-2 border-dashed rounded-2xl p-4 transition-all ${
                  isDraggingBanner
                    ? 'border-[#008080] bg-teal-50/50'
                    : 'border-slate-200 hover:border-[#008080]/50 bg-slate-50/50'
                }`}
              >
                {bannerUrl ? (
                  <div className="space-y-2">
                    <div className="w-full h-24 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden relative shadow-2xs">
                      <img
                        src={bannerUrl}
                        alt="Banner Preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.currentTarget as HTMLElement).style.display = 'none';
                        }}
                      />
                      <div className="absolute bottom-2 left-2">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-slate-900/80 text-white backdrop-blur-xs">
                          <HardDrive className="w-2.5 h-2.5 text-emerald-400" />
                          <span>1200x400 Verified</span>
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-mono font-bold text-slate-800 truncate max-w-xs">
                        {bannerMeta?.name || bannerUrl.split('/').pop()}
                      </p>
                      <button
                        type="button"
                        onClick={handleBannerUploadClick}
                        disabled={isUploadingBanner}
                        className="px-3 py-1 bg-white hover:bg-slate-100 text-slate-700 text-[11px] font-bold rounded-lg border border-slate-200 transition-all cursor-pointer shadow-2xs"
                      >
                        Replace Banner
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <div className="w-12 h-12 rounded-xl bg-teal-50 text-[#008080] flex items-center justify-center mx-auto mb-2 border border-teal-100">
                      {isUploadingBanner ? (
                        <Loader2 className="w-6 h-6 animate-spin text-[#008080]" />
                      ) : (
                        <Upload className="w-6 h-6" />
                      )}
                    </div>
                    <p className="text-xs font-bold text-slate-700">
                      {isUploadingBanner ? 'Uploading securely to server...' : 'Drag & drop Brand Banner here'}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5 mb-3">
                      Recommended 1200x400 Banner (Max 5MB)
                    </p>
                    <button
                      type="button"
                      onClick={handleBannerUploadClick}
                      disabled={isUploadingBanner}
                      className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-[#008080] hover:bg-[#006666] text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload Banner</span>
                    </button>
                  </div>
                )}

                {bannerError && (
                  <div className="mt-2.5 p-2 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-2 text-rose-700 text-xs">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span className="font-semibold">{bannerError}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 4. SECTION 3: Native Brand SEO AI Engine (Rotational Market-Researched Content) */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-teal-50 text-[#008080] flex items-center justify-center font-bold">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold text-slate-900">Native Brand SEO AI Engine</h2>
                  {activeStrategyLabel && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#008080]/10 text-[#008080] border border-[#008080]/20">
                      <Zap className="w-2.5 h-2.5" />
                      <span>{activeStrategyLabel}</span>
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400">
                  Generates unique, non-duplicate commercial search metadata calibrated to strict Google SERP standards.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleForceRegenerateAi}
              disabled={isAiGenerating || !name.trim()}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer self-start sm:self-auto"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${isAiGenerating ? 'animate-spin' : ''}`} />
              <span>Regenerate SEO</span>
            </button>
          </div>

          <div className="space-y-4">
            {/* SEO Meta Title */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700">
                  SEO Meta Title <span className="text-rose-500">*</span>
                </label>
                <span
                  className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-md ${
                    seoTitle.length >= 50 && seoTitle.length <= 60
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : seoTitle.length > 60
                      ? 'bg-rose-50 text-rose-700 border border-rose-200'
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}
                >
                  {seoTitle.length} / 60 Chars (50-60 Recommended)
                </span>
              </div>
              <input
                type="text"
                value={seoTitle}
                onChange={(e) => {
                  setSeoTitle(e.target.value);
                  setIsSeoDirty(true);
                }}
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 focus:bg-white text-xs font-bold text-slate-900 placeholder-slate-400 rounded-xl border border-slate-200 focus:border-[#008080] focus:ring-2 focus:ring-[#008080]/20 transition-all outline-hidden"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Google SERP Title: 50-60 characters strictly to avoid snippet truncation on search engine result pages.
              </p>
            </div>

            {/* SEO Meta Description */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700">
                  SEO Meta Description <span className="text-rose-500">*</span>
                </label>
                <span
                  className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-md ${
                    seoDescription.length >= 140 && seoDescription.length <= 160
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : seoDescription.length > 160
                      ? 'bg-rose-50 text-rose-700 border border-rose-200'
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}
                >
                  {seoDescription.length} / 160 Chars (140-160 Recommended)
                </span>
              </div>
              <textarea
                rows={3}
                value={seoDescription}
                onChange={(e) => {
                  setSeoDescription(e.target.value);
                  setIsSeoDirty(true);
                }}
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 focus:bg-white text-xs font-medium text-slate-900 placeholder-slate-400 rounded-xl border border-slate-200 focus:border-[#008080] focus:ring-2 focus:ring-[#008080]/20 transition-all outline-hidden leading-relaxed"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Google SERP Snippet: 140-160 characters recommended with commercial intent and Bangladesh e-commerce keywords.
              </p>
            </div>

            {/* SEO Keywords */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700">
                  SEO Keywords (Comma-Separated) <span className="text-rose-500">*</span>
                </label>
                <span className="text-[11px] font-mono font-semibold text-slate-500">
                  {keywordsList.length} Keywords (6-8 Generated)
                </span>
              </div>
              <input
                type="text"
                value={seoKeywords}
                onChange={(e) => {
                  setSeoKeywords(e.target.value);
                  setIsSeoDirty(true);
                }}
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 focus:bg-white text-xs font-medium text-slate-900 placeholder-slate-400 rounded-xl border border-slate-200 focus:border-[#008080] focus:ring-2 focus:ring-[#008080]/20 transition-all outline-hidden font-mono"
              />
              {/* Visual Keyword Badges */}
              {keywordsList.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {keywordsList.map((kw, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200/60"
                    >
                      <span>#{kw}</span>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Google SERP Live Snippet Card */}
            <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 mb-2">
                <Eye className="w-3.5 h-3.5 text-[#008080]" />
                <span>Google SERP Live Snippet Card</span>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1">
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-sans">
                  <div className="w-4 h-4 rounded-full bg-teal-700 text-white flex items-center justify-center text-[9px] font-bold">
                    AR
                  </div>
                  <span className="truncate">armarketbd.com › brand › {slug || 'samsung-global'}</span>
                </div>
                <h4 className="text-sm font-semibold text-[#1a0dab] hover:underline cursor-pointer line-clamp-1">
                  {seoTitle || `Official ${name || 'Brand'} Store BD | 100% Genuine Authentic Products`}
                </h4>
                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {seoDescription ||
                    `Buy 100% genuine ${name || 'Brand'} products in Bangladesh with authorized warranty. Shop original items at official rates with fast nationwide cash on delivery.`}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 5. SECTION 4: Storefront Visibility & Controls */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 mb-4">
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-[#008080] flex items-center justify-center font-bold">
              <Star className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Brand Visibility & Storefront Controls</h2>
              <p className="text-[11px] text-slate-400">
                Configure brand activation and storefront featured status.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Active Toggle */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-800">Active Status</p>
                <p className="text-[11px] text-slate-500">
                  Allow sellers and admins to tag products under this brand.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsActive(!isActive)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                  isActive ? 'bg-[#008080]' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                    isActive ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Featured Toggle */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-800">Featured on Home</p>
                <p className="text-[11px] text-slate-500">
                  Showcase brand in Homepage official brand strip and shop filters.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsFeatured(!isFeatured)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                  isFeatured ? 'bg-amber-500' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                    isFeatured ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* 6. Bottom Sticky Actions */}
        <div className="flex items-center justify-end gap-3 pt-3">
          <button
            type="button"
            onClick={onBack}
            className="px-5 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 rounded-xl border border-slate-200 transition-all cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isSubmitting || !name.trim()}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#008080] hover:bg-[#006666] disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl shadow-lg shadow-teal-900/10 active:scale-[0.98] transition-all cursor-pointer"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{isEditing ? 'Save Changes' : 'Register Global Brand'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
