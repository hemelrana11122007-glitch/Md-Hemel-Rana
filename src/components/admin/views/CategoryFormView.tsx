import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  Sparkles,
  Upload,
  Globe,
  Tag,
  CheckCircle2,
  Layers,
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
} from 'lucide-react';
import { CategoryItem, categoryService } from '../../../services/categoryService';

interface CategoryFormViewProps {
  initialCategoryId?: string | null;
  onBack: () => void;
  onShowToast: (message: string) => void;
}

export const CategoryFormView: React.FC<CategoryFormViewProps> = ({
  initialCategoryId,
  onBack,
  onShowToast,
}) => {
  const isEditing = Boolean(initialCategoryId);

  // Native File Input References
  const logoFileInputRef = useRef<HTMLInputElement>(null);
  const bannerFileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [icon, setIcon] = useState('Layers');
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

  // Local Meta Engine Section
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');
  const [seoKeywords, setSeoKeywords] = useState('');

  // Toggles
  const [isFeatured, setIsFeatured] = useState(false);
  const [isActive, setIsActive] = useState(true);

  // Track if user has manually modified SEO fields
  const [isSeoDirty, setIsSeoDirty] = useState(false);
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Regeneration counter to guarantee completely unique SEO strategies & content every click
  const [regenCounter, setRegenCounter] = useState(1);
  const [activeStrategyLabel, setActiveStrategyLabel] = useState<string>('');

  const sampleLogos = [
    'https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&q=80&w=200',
    'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&q=80&w=200',
    'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=200',
    'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=200',
    'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=80&w=200',
    'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&q=80&w=200',
  ];

  const sampleBanners = [
    'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&q=80&w=800',
  ];

  // If editing, load existing category data
  useEffect(() => {
    if (initialCategoryId) {
      const existing = categoryService.getCategoryById(initialCategoryId);
      if (existing) {
        setName(existing.name);
        setSlug(existing.slug);
        setIcon(existing.icon || 'Layers');
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
  }, [initialCategoryId]);

  /**
   * Real-time Local AI Engine triggered on Category Name change
   * Zero 3rd party API, 100% deterministic web-native SEO generator
   */
  const handleNameChange = (val: string) => {
    setName(val);

    // Auto-generate slug, title, description, and keywords in real-time
    if (!isSeoDirty || !isEditing) {
      // Derive dynamic seed from category name characters + regenCounter so each category starts with its own distinct angle
      const nameHash = Math.abs(val.split('').reduce((sum, ch, i) => sum + ch.charCodeAt(0) * (i + 1), 0));
      const aiResult = categoryService.generateLocalAiSeo(val, regenCounter + nameHash);
      setSlug(aiResult.slug);
      setSeoTitle(aiResult.seo_title);
      setSeoDescription(aiResult.seo_description);
      setSeoKeywords(aiResult.seo_keywords);
      setActiveStrategyLabel(aiResult.strategy_label);
    } else {
      // Even if SEO fields are customized, keep slug synced unless manually modified
      const aiResult = categoryService.generateLocalAiSeo(val, regenCounter);
      if (!slug || slug === categoryService.generateLocalAiSeo(name, regenCounter).slug) {
        setSlug(aiResult.slug);
      }
    }
  };

  const handleForceRegenerateAi = () => {
    if (!name.trim()) {
      onShowToast('Please type a Category Name first.');
      return;
    }
    setIsAiGenerating(true);
    // Advance seed count every click to rotate across the 4 distinct commercial intent angles (Angle A, B, C, D)
    const nextSeed = regenCounter + 1;
    setRegenCounter(nextSeed);

    setTimeout(() => {
      const aiResult = categoryService.generateLocalAiSeo(name, nextSeed);
      setSlug(aiResult.slug);
      setSeoTitle(aiResult.seo_title);
      setSeoDescription(aiResult.seo_description);
      setSeoKeywords(aiResult.seo_keywords);
      setActiveStrategyLabel(aiResult.strategy_label);
      setIsAiGenerating(false);
      onShowToast(`Unique SEO angle generated: "${aiResult.strategy_label}"`);
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

  const validateAndUploadFile = async (file: File, assetType: 'icon' | 'banner') => {
    const isIcon = assetType === 'icon';
    if (isIcon) {
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
      // Category Icon: max 2MB (2 * 1024 * 1024)
      // Promo Banner: max 5MB (5 * 1024 * 1024)
      const maxIconBytes = 2 * 1024 * 1024;
      const maxBannerBytes = 5 * 1024 * 1024;

      if (isIcon && file.size > maxIconBytes) {
        const mb = (file.size / (1024 * 1024)).toFixed(2);
        throw new Error(`Category Icon-এর সাইজ সর্বোচ্চ 2MB অনুমোদিত (নির্বাচিত: ${mb} MB)। দয়া করে ছোট ছবি নির্বাচন করুন।`);
      }

      if (!isIcon && file.size > maxBannerBytes) {
        const mb = (file.size / (1024 * 1024)).toFixed(2);
        throw new Error(`Promo Banner-এর সাইজ সর্বোচ্চ 5MB অনুমোদিত (নির্বাচিত: ${mb} MB)। দয়া করে ছোট ছবি নির্বাচন করুন।`);
      }

      // 3. Multi-part Form Data upload to Secure Backend Server Storage
      const result = await categoryService.uploadAsset(file, assetType);

      const formattedSize = file.size > 1024 * 1024
        ? `${(file.size / (1024 * 1024)).toFixed(2)} MB`
        : `${Math.round(file.size / 1024)} KB`;

      if (isIcon) {
        setLogoUrl(result.url);
        setLogoMeta({
          name: file.name,
          size: formattedSize,
          isServerStored: true,
        });
        onShowToast(`Category Icon (${file.name}) uploaded to secure storage successfully!`);
      } else {
        setBannerUrl(result.url);
        setBannerMeta({
          name: file.name,
          size: formattedSize,
          isServerStored: true,
        });
        onShowToast(`Promo Banner (${file.name}) uploaded to secure storage successfully!`);
      }
    } catch (err: any) {
      const errMsg = err.message || 'File upload failed. Please try again.';
      if (isIcon) {
        setLogoError(errMsg);
      } else {
        setBannerError(errMsg);
      }
      onShowToast(errMsg);
    } finally {
      if (isIcon) {
        setIsUploadingLogo(false);
        if (logoFileInputRef.current) logoFileInputRef.current.value = '';
      } else {
        setIsUploadingBanner(false);
        if (bannerFileInputRef.current) bannerFileInputRef.current.value = '';
      }
    }
  };

  const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      validateAndUploadFile(file, 'icon');
    }
  };

  const handleBannerFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      validateAndUploadFile(file, 'banner');
    }
  };

  const handleRemoveLogo = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLogoUrl('');
    setLogoMeta(null);
    setLogoError(null);
    if (logoFileInputRef.current) logoFileInputRef.current.value = '';
    onShowToast('Category Logo / Icon removed.');
  };

  const handleRemoveBanner = (e: React.MouseEvent) => {
    e.stopPropagation();
    setBannerUrl('');
    setBannerMeta(null);
    setBannerError(null);
    if (bannerFileInputRef.current) bannerFileInputRef.current.value = '';
    onShowToast('Promo Banner asset removed.');
  };

  // Drag and drop handlers
  const handleLogoDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingLogo(false);
    const file = e.dataTransfer.files?.[0];
    if (file) validateAndUploadFile(file, 'icon');
  };

  const handleBannerDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingBanner(false);
    const file = e.dataTransfer.files?.[0];
    if (file) validateAndUploadFile(file, 'banner');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      onShowToast('Category Name is required.');
      return;
    }

    if (!slug.trim()) {
      onShowToast('SEO Slug is required.');
      return;
    }

    setIsSubmitting(true);

    const payload = {
      name: name.trim(),
      slug: slug.trim(),
      icon,
      logo_url: logoUrl || sampleLogos[0],
      banner_url: bannerUrl || sampleBanners[0],
      seo_title: seoTitle || `${name} | AR Market BD`,
      seo_description: seoDescription || `Shop ${name} online at AR Market BD.`,
      seo_keywords: seoKeywords || `${slug}, buy ${slug} online`,
      is_featured: isFeatured,
      is_active: isActive,
    };

    setTimeout(() => {
      if (isEditing && initialCategoryId) {
        categoryService.updateCategory(initialCategoryId, payload);
        onShowToast(`Category "${name}" updated successfully!`);
      } else {
        categoryService.createCategory(payload);
        onShowToast(`Category "${name}" created and established globally!`);
      }
      setIsSubmitting(false);
      onBack();
    }, 350);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200 pb-16">
      {/* 1. Standalone Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
            title="Return to Category List"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#008080]/10 text-[#008080] border border-[#008080]/20 mb-1">
              <Layers className="w-3 h-3" />
              <span>{isEditing ? 'Modify Category' : 'Standalone Category Creation'}</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight font-display">
              {isEditing ? `Edit Category: ${name || 'Category'}` : 'Add New Category'}
            </h1>
            <p className="text-xs text-slate-500">
              Establish global taxonomy with real-time web native SEO AI engine and storefront hub placement.
            </p>
          </div>
        </div>
      </div>

      <form id="categoryForm" onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info Column (2 spans) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Core Identification Card */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
              <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                <Tag className="w-4 h-4 text-[#008080]" />
                <span>Category Core Identification</span>
              </h3>

              <div className="space-y-4">
                {/* Category Name */}
                <div>
                  <label className="block text-xs font-extrabold text-slate-800 mb-1.5">
                    Category Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="e.g. Smart Electronics / Organic Spices / Traditional Handloom"
                    className="w-full px-3.5 py-3 rounded-xl border border-slate-300 font-black text-slate-900 text-sm focus:outline-none focus:border-[#008080] focus:ring-2 focus:ring-[#008080]/20 bg-white"
                  />
                  <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#008080]" />
                    <span>Typing triggers real-time zero-API local SEO auto-fill below.</span>
                  </p>
                </div>

                {/* SEO Slug */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    SEO Slug <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-400">
                      armarketbd.com/category/
                    </span>
                    <input
                      type="text"
                      required
                      value={slug}
                      onChange={(e) => {
                        setSlug(e.target.value);
                        setIsSeoDirty(true);
                      }}
                      placeholder="smart-electronics"
                      className="w-full pl-52 pr-4 py-2.5 rounded-xl border border-slate-300 font-mono text-xs font-bold text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:border-[#008080]"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Local Meta Engine Section (Zero 3rd Party API, 100% Native) */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4 relative overflow-hidden">
              {/* Background Ambient Glow */}
              <div className="absolute -right-8 -top-8 w-32 h-32 bg-[#008080]/10 rounded-full blur-2xl pointer-events-none" />

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-teal-50 border border-teal-200 text-[#008080]">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900 flex flex-wrap items-center gap-1.5">
                      <span>Local Meta Engine (Zero 3rd Party API)</span>
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-teal-100 text-[#008080] border border-teal-200">
                        Live Auto-Fill
                      </span>
                      {activeStrategyLabel && (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-amber-50 text-amber-800 border border-amber-200">
                          {activeStrategyLabel}
                        </span>
                      )}
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Deterministic smart algorithm generates Google ranking-friendly SEO on the fly.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleForceRegenerateAi}
                  disabled={isAiGenerating}
                  className="px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-[#008080] border border-teal-200 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
                >
                  <RotateCcw className={`w-3.5 h-3.5 ${isAiGenerating ? 'animate-spin' : ''}`} />
                  <span>Regenerate SEO</span>
                </button>
              </div>

              <div className="space-y-4 text-xs">
                {/* SEO Title */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-slate-700">SEO Meta Title</label>
                    <span className={`text-[10px] font-mono ${seoTitle.length > 60 ? 'text-rose-600 font-bold' : 'text-emerald-700 font-bold'}`}>
                      {seoTitle.length}/60 chars (Max 60 Chars)
                    </span>
                  </div>
                  <input
                    type="text"
                    value={seoTitle}
                    onChange={(e) => {
                      setSeoTitle(e.target.value);
                      setIsSeoDirty(true);
                    }}
                    placeholder="Auto-generated Google SEO title..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-semibold text-slate-900 bg-white focus:outline-none focus:border-[#008080]"
                  />
                </div>

                {/* SEO Description */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-slate-700">SEO Meta Description</label>
                    <span className={`text-[10px] font-mono ${seoDescription.length >= 150 && seoDescription.length <= 160 ? 'text-emerald-700 font-bold' : 'text-slate-500'}`}>
                      {seoDescription.length}/160 chars (150-160 Chars recommended)
                    </span>
                  </div>
                  <textarea
                    rows={3}
                    value={seoDescription}
                    onChange={(e) => {
                      setSeoDescription(e.target.value);
                      setIsSeoDirty(true);
                    }}
                    placeholder="Auto-generated distinctive description for search engine snippets..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-medium text-slate-800 bg-white focus:outline-none focus:border-[#008080] leading-relaxed"
                  />
                </div>

                {/* SEO Keywords */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-slate-700">SEO Keywords (Comma Separated)</label>
                    <span className="text-[10px] text-[#008080] font-bold">
                      {seoKeywords ? `${seoKeywords.split(',').filter(Boolean).length} Keywords (6-8 BD Long-Tail)` : '6-8 BD Long-Tail'}
                    </span>
                  </div>
                  <input
                    type="text"
                    value={seoKeywords}
                    onChange={(e) => {
                      setSeoKeywords(e.target.value);
                      setIsSeoDirty(true);
                    }}
                    placeholder="e.g. smart electronics, gadgets bd, best price dhaka, ar market bd"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono text-xs text-slate-800 bg-white focus:outline-none focus:border-[#008080]"
                  />
                </div>

                {/* Live Google Search Snippet Preview */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1">
                    <Eye className="w-3 h-3 text-[#008080]" />
                    <span>Google Search Result Snippet Preview</span>
                  </span>
                  <div className="text-xs text-blue-700 font-semibold hover:underline cursor-pointer truncate">
                    {seoTitle || 'Category Name | AR Market BD'}
                  </div>
                  <div className="text-[11px] text-emerald-800 font-mono">
                    https://armarketbd.com/category/{slug || 'category-slug'}
                  </div>
                  <p className="text-[11px] text-slate-600 line-clamp-2 leading-tight">
                    {seoDescription || 'Browse wholesale, retail and import products at AR Market BD.'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Media & Toggles Column (1 span) */}
          <div className="space-y-6">
            {/* Hidden Native File Inputs */}
            <input
              type="file"
              ref={logoFileInputRef}
              onChange={handleLogoFileChange}
              accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml"
              className="hidden"
            />
            <input
              type="file"
              ref={bannerFileInputRef}
              onChange={handleBannerFileChange}
              accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml"
              className="hidden"
            />

            {/* Logo / Icon Upload Card */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-[#008080]" />
                  <span>Logo / Category Icon</span>
                </h3>
                <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                  Max 2MB
                </span>
              </div>

              {/* Native Upload & Preview Container */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDraggingLogo(true);
                }}
                onDragLeave={() => setIsDraggingLogo(false)}
                onDrop={handleLogoDrop}
                className={`relative flex flex-col items-center justify-center p-4 border-2 border-dashed rounded-2xl transition-all text-center ${
                  isDraggingLogo
                    ? 'border-[#008080] bg-teal-50/50'
                    : 'border-slate-200 bg-slate-50/60 hover:bg-slate-50'
                }`}
              >
                {isUploadingLogo ? (
                  <div className="py-6 flex flex-col items-center justify-center space-y-2">
                    <Loader2 className="w-8 h-8 text-[#008080] animate-spin" />
                    <p className="text-xs font-bold text-slate-700">Uploading to server storage...</p>
                    <span className="text-[10px] text-slate-400">Validating MIME & security headers</span>
                  </div>
                ) : logoUrl ? (
                  <div className="w-full flex flex-col items-center space-y-3">
                    <div className="relative group">
                      <img
                        src={logoUrl}
                        alt="Category Icon Preview"
                        className="w-20 h-20 object-cover rounded-2xl shadow-xs border border-slate-200 bg-white"
                      />
                      <button
                        type="button"
                        onClick={handleRemoveLogo}
                        className="absolute -top-2 -right-2 p-1 bg-rose-500 hover:bg-rose-600 text-white rounded-full shadow-md transition-colors cursor-pointer"
                        title="Remove Logo"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Metadata badge */}
                    <div className="flex flex-col items-center gap-1">
                      <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <ShieldCheck className="w-3 h-3 text-emerald-600" />
                        <span>Secure Server Hosted</span>
                      </div>
                      {logoMeta && (
                        <p className="text-[10px] text-slate-500 font-mono truncate max-w-[200px]">
                          {logoMeta.name} ({logoMeta.size})
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={handleLogoUploadClick}
                        className="px-3.5 py-1.5 bg-[#008080] hover:bg-[#006666] text-white text-xs font-bold rounded-xl shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload File Button</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleRemoveLogo}
                        className="px-2.5 py-1.5 bg-white hover:bg-slate-100 text-rose-600 text-xs font-bold rounded-xl border border-slate-200 transition-colors cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="w-full flex flex-col items-center space-y-2 py-2">
                    <div className="w-14 h-14 rounded-2xl bg-teal-50/80 border border-teal-100 text-[#008080] flex items-center justify-center mb-1">
                      <ImageIcon className="w-7 h-7" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-700">
                        Select device image from native file manager
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        Supports PNG, JPG, JPEG, WEBP, SVG (Max 2MB)
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleLogoUploadClick}
                      className="mt-2 px-4 py-2 bg-[#008080] hover:bg-[#006666] text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload File Button</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Error Alert Display */}
              {logoError && (
                <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
                  <span className="leading-tight">{logoError}</span>
                </div>
              )}
            </div>

            {/* Promo Banner Card */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-[#008080]" />
                  <span>Promo Banner Asset</span>
                </h3>
                <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                  Max 5MB • 1200x400
                </span>
              </div>

              {/* Native Upload & Banner Preview Container */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDraggingBanner(true);
                }}
                onDragLeave={() => setIsDraggingBanner(false)}
                onDrop={handleBannerDrop}
                className={`relative flex flex-col items-center justify-center p-4 border-2 border-dashed rounded-2xl transition-all text-center ${
                  isDraggingBanner
                    ? 'border-[#008080] bg-teal-50/50'
                    : 'border-slate-200 bg-slate-50/60 hover:bg-slate-50'
                }`}
              >
                {isUploadingBanner ? (
                  <div className="py-6 flex flex-col items-center justify-center space-y-2">
                    <Loader2 className="w-8 h-8 text-[#008080] animate-spin" />
                    <p className="text-xs font-bold text-slate-700">Uploading banner to server storage...</p>
                    <span className="text-[10px] text-slate-400">Validating format & high-res boundaries</span>
                  </div>
                ) : bannerUrl ? (
                  <div className="w-full flex flex-col items-center space-y-3">
                    <div className="w-full relative group overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                      <img
                        src={bannerUrl}
                        alt="Promo Banner Preview"
                        className="w-full h-24 sm:h-28 object-cover"
                      />
                      <button
                        type="button"
                        onClick={handleRemoveBanner}
                        className="absolute top-2 right-2 p-1 bg-rose-500 hover:bg-rose-600 text-white rounded-full shadow-md transition-colors cursor-pointer"
                        title="Remove Banner"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Metadata badge */}
                    <div className="flex flex-col items-center gap-1">
                      <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <ShieldCheck className="w-3 h-3 text-emerald-600" />
                        <span>Secure Server Hosted (1200x400 Header)</span>
                      </div>
                      {bannerMeta && (
                        <p className="text-[10px] text-slate-500 font-mono truncate max-w-[220px]">
                          {bannerMeta.name} ({bannerMeta.size})
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={handleBannerUploadClick}
                        className="px-3.5 py-1.5 bg-[#008080] hover:bg-[#006666] text-white text-xs font-bold rounded-xl shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload Banner Button</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleRemoveBanner}
                        className="px-2.5 py-1.5 bg-white hover:bg-slate-100 text-rose-600 text-xs font-bold rounded-xl border border-slate-200 transition-colors cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="w-full flex flex-col items-center space-y-2 py-2">
                    <div className="w-full h-16 rounded-xl bg-teal-50/60 border border-teal-100 text-[#008080] flex items-center justify-center mb-1">
                      <Globe className="w-8 h-8" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-700">
                        Select device banner from native file manager
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        Recommended: 1200x400 • PNG, JPG, JPEG, WEBP, SVG (Max 5MB)
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleBannerUploadClick}
                      className="mt-2 px-4 py-2 bg-[#008080] hover:bg-[#006666] text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload Banner Button</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Error Alert Display */}
              {bannerError && (
                <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
                  <span className="leading-tight">{bannerError}</span>
                </div>
              )}
            </div>

            {/* Toggles & Visibility Card */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
              <h3 className="font-extrabold text-sm text-slate-900">
                Placement & Visibility Controls
              </h3>

              {/* Featured Hub Toggle Switch */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div>
                  <span className="font-extrabold text-xs text-slate-800 block">Featured Hub</span>
                  <span className="text-[10px] text-slate-500">Show on homepage popular hub grid</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsFeatured(!isFeatured)}
                  className={`w-12 h-6 flex items-center rounded-full p-0.5 cursor-pointer transition-colors ${
                    isFeatured ? 'bg-[#008080]' : 'bg-slate-300'
                  }`}
                >
                  <div
                    className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform ${
                      isFeatured ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Active Status Toggle Switch */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div>
                  <span className="font-extrabold text-xs text-slate-800 block">Active Status</span>
                  <span className="text-[10px] text-slate-500">Visible for product assignments</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsActive(!isActive)}
                  className={`w-12 h-6 flex items-center rounded-full p-0.5 cursor-pointer transition-colors ${
                    isActive ? 'bg-[#008080]' : 'bg-slate-300'
                  }`}
                >
                  <div
                    className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform ${
                      isActive ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Final Action Submission Card */}
            <div className="p-4 rounded-2xl bg-teal-50/70 border border-teal-200 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-[#008080]">
                <ShieldCheck className="w-4 h-4 text-[#008080]" />
                <span>Ready to establish global category</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-tight">
                All metadata and URL slugs will be instantly indexed into the AR Market BD taxonomy.
              </p>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-[#008080] hover:bg-[#006666] text-white text-xs font-black rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <RotateCcw className="w-4 h-4 animate-spin" />
                ) : (
                  <Check className="w-4 h-4" />
                )}
                <span>{isEditing ? 'Save Category Changes' : 'Establish Global Category'}</span>
              </button>
              <button
                type="button"
                onClick={onBack}
                className="w-full py-2 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
