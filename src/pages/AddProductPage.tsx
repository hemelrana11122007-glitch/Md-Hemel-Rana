import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  Sparkles,
  Upload,
  Video,
  MapPin,
  Tag,
  Boxes,
  CheckCircle2,
  Image as ImageIcon,
  TrendingUp,
  Info,
  ChevronDown,
} from 'lucide-react';
import { categoryService } from '../services/categoryService';
import { brandService } from '../services/brandService';
import { specialOfferService } from '../services/specialOfferService';
import { useAuth } from '../context/AuthContext';

export interface AddProductPageProps {
  onBackToDashboard: () => void;
  onShowToast: (msg: string) => void;
}

export const AddProductPage: React.FC<AddProductPageProps> = ({
  onBackToDashboard,
  onShowToast,
}) => {
  const { user } = useAuth();
  const isWholesaler = String(user?.business_type || '').toLowerCase().includes('wholesal');
  const isImporter = String(user?.business_type || '').toLowerCase().includes('import');

  // Importer Specific States
  const [countrySource, setCountrySource] = useState('China');
  const [importCostBdt, setImportCostBdt] = useState('150');

  // 1. Core Data Lists
  const categories = categoryService.getCategories().filter(c => c.is_active);
  const brands = brandService.getBrands().filter(b => b.is_active !== false);
  const specialOffers = specialOfferService.getOffers().filter(o => o.status === 'active');

  // 2. Custom Dropdown State Controls
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isBrandOpen, setIsBrandOpen] = useState(false);
  const [isCampaignOpen, setIsCampaignOpen] = useState(false);

  // 3. Form States
  const [productName, setProductName] = useState('');
  const [sku, setSku] = useState('');
  
  // Custom objects or values for custom dropdown selectors
  const [selectedCategory, setSelectedCategory] = useState(categories[0]?.name || 'General');
  const [selectedBrand, setSelectedBrand] = useState(brands[0]?.name || '');
  const [selectedOfferId, setSelectedOfferId] = useState('');

  const [price, setPrice] = useState('');
  const [oldPrice, setOldPrice] = useState('');
  const [stock, setStock] = useState('50');
  
  // Hybrid Product Badge State
  const [badge, setBadge] = useState(isWholesaler ? 'BULK' : '');
  
  const [weight, setWeight] = useState('0.5');
  const [moq, setMoq] = useState(isWholesaler ? '10' : '1');
  const [supplierLocation, setSupplierLocation] = useState('Dhaka, Bangladesh');
  const [videoUrl, setVideoUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  // Marketing triggers
  const [isFeatured, setIsFeatured] = useState(false);

  // 4. AI Meta Generator States
  const [aiDescription, setAiDescription] = useState('');
  const [metaTitle, setMetaTitle] = useState('');
  const [metaKeywords, setMetaKeywords] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  
  // Track previously generated names to avoid repetitive triggering
  const lastGeneratedNameRef = useRef('');

  // Fetch Category details for the currently selected category
  const activeCategoryObj = categories.find(c => c.name === selectedCategory);
  // Fetch Brand details for the currently selected brand
  const activeBrandObj = brands.find(b => b.name === selectedBrand);
  // Fetch Campaign details for the currently selected campaign
  const activeCampaignObj = specialOffers.find(o => o.id === selectedOfferId);

  // 5. Native Image Upload Helper (simulated / file-to-URL)
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        onShowToast('Product image must be less than 5MB.');
        return;
      }
      setIsUploadingImage(true);
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const dataUrl = event.target.result as string;
          setImageUrl(dataUrl);
          onShowToast('Product image uploaded successfully!');
          // Trigger AI automatically on image selection as well
          triggerAiGenerator(productName, selectedCategory, dataUrl);
        }
        setIsUploadingImage(false);
      };
      reader.onerror = () => {
        setIsUploadingImage(false);
        onShowToast('Failed to load image file.');
      };
      reader.readAsDataURL(file);
    }
  };

  // 6. AI Generator Trigger Function (Integrates with /api/seller/generate-metadata)
  // Implements 100% manual edit retention and custom blending on regeneration
  const triggerAiGenerator = async (pName: string, catName: string, forceTrigger?: string) => {
    if (!pName || pName.trim().length < 4) return;
    
    // Avoid double automatic triggers unless forced
    if (lastGeneratedNameRef.current === pName.trim() && !forceTrigger) return;
    lastGeneratedNameRef.current = pName.trim();

    setIsAiGenerating(true);
    try {
      const saltToken = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const res = await fetch('/api/seller/generate-metadata', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productName: pName.trim(),
          category: catName,
          currentDescription: aiDescription, // Sends edited text to preserve and blend in memory
          currentKeywords: metaKeywords,     // Sends edited keywords to deduplicate and blend
          saltToken,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setAiDescription(data.description || '');
          setMetaTitle(data.meta_title || '');
          setMetaKeywords(data.meta_keywords || '');
          setMetaDescription(data.meta_description || '');
          onShowToast('In-House AI Engine optimized your customized copy!');
        }
      }
    } catch (err) {
      console.error('Error generating metadata in-house:', err);
    } finally {
      setIsAiGenerating(false);
    }
  };

  // Trigger AI automatically when name loses focus
  const handleNameBlur = () => {
    triggerAiGenerator(productName, selectedCategory);
  };

  // Manual regenerate button
  const handleRegenerateAi = () => {
    if (!productName || productName.trim().length < 3) {
      onShowToast('Please enter a product name first.');
      return;
    }
    triggerAiGenerator(productName, selectedCategory, 'force');
  };

  // 7. Form Submission Handler
  const [isSubmitting, setIsUploading] = useState(false);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!productName.trim()) {
      onShowToast('Product Name is required.');
      return;
    }
    if (!sku.trim()) {
      onShowToast('SKU is required.');
      return;
    }
    if (!price || parseFloat(price) <= 0) {
      onShowToast('A valid positive price is required.');
      return;
    }
    if (!weight || parseFloat(weight) <= 0) {
      onShowToast('Product Weight is required for courier base charge calculation.');
      return;
    }

    if (isImporter) {
      if (!countrySource) {
        onShowToast('Country of Source is required for import products.');
        return;
      }
      if (!importCostBdt || parseFloat(importCostBdt) <= 0) {
        onShowToast('Bangladesh Import Cost is required for import shipping calculations.');
        return;
      }
    }

    setIsUploading(true);
    try {
      const payload = {
        title: productName.trim(),
        description: aiDescription.trim(),
        price: parseFloat(price),
        old_price: oldPrice ? parseFloat(oldPrice) : undefined,
        category: selectedCategory,
        stock: parseInt(stock, 10) || 0,
        status: 'active',
        image_url: imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80',
        sku: sku.trim(),
        brand: selectedBrand,
        badge: badge.trim() || undefined,
        weight_kg: parseFloat(weight),
        moq: parseInt(moq, 10) || 1,
        video_url: videoUrl.trim() || undefined,
        supplier_location: supplierLocation.trim(),
        is_featured: isFeatured,
        special_offer_id: selectedOfferId || undefined,
        meta_title: metaTitle.trim(),
        meta_keywords: metaKeywords.trim(),
        meta_description: metaDescription.trim(),
        country_source: isImporter ? countrySource : undefined,
        import_cost_bdt: isImporter ? parseFloat(importCostBdt) : undefined,
      };

      const res = await fetch('/api/seller/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        const successMsg = isWholesaler
          ? 'Product published and active in wholesale collection!'
          : isImporter
          ? 'Product published and active in global imports collection!'
          : 'Product published and active in retail collection!';
        onShowToast(successMsg);
        onBackToDashboard();
      } else {
        onShowToast(data.error || 'Failed to submit product.');
      }
    } catch (err) {
      onShowToast('Network error occurred while submitting product.');
    } finally {
      setIsUploading(false);
    }
  };

  // Generate automated SKU based on name
  useEffect(() => {
    if (productName && !sku) {
      const prefix = productName.slice(0, 3).toUpperCase().replace(/[^A-Z]/g, 'PRD');
      const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase();
      setSku(`${prefix}-${randomStr}`);
    }
  }, [productName]);

  // Calculate delivery charge info context based on weight
  const computedWeight = parseFloat(weight) || 0.5;
  const computedDeliveryBase = 60; // Standard Dhaka base
  const computedDeliveryExtra = Math.max(0, Math.ceil(computedWeight - 1.0)) * 20; // 20 BDT per kg over 1kg
  const totalEstimatedDelivery = computedDeliveryBase + computedDeliveryExtra;

  return (
    <div className="min-h-screen bg-[#F8FAFA] py-6 px-3 sm:px-6 lg:px-8">
      <div className="max-w-[1720px] mx-auto space-y-6">
        {/* Top Header Card with Back Button */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToDashboard}
              className="w-10 h-10 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl flex items-center justify-center border border-slate-200/60 transition-all cursor-pointer"
              title="Back to Dashboard"
            >
              <ArrowLeft className="w-4 h-4 text-slate-700" />
            </button>
            <div>
              <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 font-display">
                {isWholesaler ? 'Create New Wholesale Product' : 'Create New Retail Product'}
              </h1>
              <p className="text-xs text-slate-500">
                Publish a standalone {isWholesaler ? 'wholesale bulk' : 'retail'} product. Complete the form or let our 100% In-House AI build your optimized catalog.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-teal-50 border border-teal-100 rounded-full text-[11px] font-bold text-[#008080]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#008080] animate-pulse"></span>
              {isWholesaler ? 'Wholesale Merchant Account WHS' : 'Retail Merchant Account RTL'}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT COLUMN: Input Fields (8 Cols) */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Card 1: Basic Product Information */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-5">
              <div className="border-b border-slate-100 pb-3 flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-teal-50 text-[#008080] flex items-center justify-center shrink-0">
                  <Tag className="w-4 h-4" />
                </div>
                <h3 className="font-extrabold text-slate-900 text-sm font-display">Basic Information</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Product Name */}
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-[11px] uppercase tracking-wider font-bold text-slate-500">
                    Product Title / Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Enter attractive product name (e.g. Walton Smart Electric Kettle)"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    onBlur={handleNameBlur}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-1 focus:ring-[#008080] focus:border-[#008080] outline-none"
                  />
                  <p className="text-[10px] text-slate-400 font-medium">
                    Our 100% in-house SEO generator triggers automatically once you finish typing or upload an image.
                  </p>
                </div>

                {/* SKU */}
                <div className="space-y-1.5">
                  <label className="text-[11px] uppercase tracking-wider font-bold text-slate-500">
                    SKU (Stock Keeping Unit) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Auto-generated or custom SKU"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-mono focus:ring-1 focus:ring-[#008080] focus:border-[#008080] outline-none"
                  />
                </div>

                {/* 1. CUSTOM CATEGORY DROPDOWN SELECTOR WITH IMAGES */}
                <div className="space-y-1.5 relative">
                  <label className="text-[11px] uppercase tracking-wider font-bold text-slate-500">
                    Category Selection <span className="text-rose-500">*</span>
                  </label>
                  
                  {isCategoryOpen && (
                    <div className="fixed inset-0 z-30" onClick={() => setIsCategoryOpen(false)} />
                  )}

                  <button
                    type="button"
                    onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                    className="w-full px-4 py-2 bg-white rounded-xl border border-slate-200 text-xs flex items-center justify-between text-slate-700 hover:border-teal-400 transition-all cursor-pointer relative z-30 min-h-[42px]"
                  >
                    <div className="flex items-center gap-2">
                      <img
                        src={activeCategoryObj?.logo_url || activeCategoryObj?.banner_url || 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&q=80&w=200'}
                        alt={selectedCategory}
                        className="w-6 h-6 object-cover rounded-md border border-slate-100 shrink-0"
                      />
                      <span className="font-bold text-slate-900">{selectedCategory}</span>
                    </div>
                    <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                  </button>

                  {isCategoryOpen && (
                    <div className="absolute z-40 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-60 overflow-y-auto py-1 animate-in fade-in slide-in-from-top-2 duration-100">
                      {categories.map((cat) => (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => {
                            setSelectedCategory(cat.name);
                            setIsCategoryOpen(false);
                            // Auto trigger AI on category shift
                            triggerAiGenerator(productName, cat.name);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2 hover:bg-slate-50 transition-all text-left"
                        >
                          <img
                            src={cat.logo_url || cat.banner_url}
                            alt={cat.name}
                            className="w-7 h-7 object-cover rounded-lg bg-slate-100 border border-slate-200 shrink-0"
                          />
                          <div className="min-w-0">
                            <p className="font-bold text-slate-800 text-xs truncate">{cat.name}</p>
                            <p className="text-[10px] text-slate-400 truncate">{cat.itemCount} active products</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* 2. CUSTOM BRAND PARTNER DROPDOWN SELECTOR WITH LOGOS */}
                <div className="space-y-1.5 relative">
                  <label className="text-[11px] uppercase tracking-wider font-bold text-slate-500">
                    Brand Partner <span className="text-rose-500">*</span>
                  </label>

                  {isBrandOpen && (
                    <div className="fixed inset-0 z-30" onClick={() => setIsBrandOpen(false)} />
                  )}

                  <button
                    type="button"
                    onClick={() => setIsBrandOpen(!isBrandOpen)}
                    className="w-full px-4 py-2 bg-white rounded-xl border border-slate-200 text-xs flex items-center justify-between text-slate-700 hover:border-teal-400 transition-all cursor-pointer relative z-30 min-h-[42px]"
                  >
                    <div className="flex items-center gap-2">
                      <img
                        src={activeBrandObj?.logo_url || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=200'}
                        alt={selectedBrand || 'Generic'}
                        className="w-6 h-6 object-cover rounded-md border border-slate-100 shrink-0"
                      />
                      <span className="font-bold text-slate-900">{selectedBrand || 'No Brand (Generic)'}</span>
                    </div>
                    <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                  </button>

                  {isBrandOpen && (
                    <div className="absolute z-40 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-60 overflow-y-auto py-1 animate-in fade-in slide-in-from-top-2 duration-100">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedBrand('');
                          setIsBrandOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2 hover:bg-slate-50 transition-all text-left border-b border-slate-100"
                      >
                        <div className="w-7 h-7 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 text-slate-400 text-[10px] font-bold">
                          GEN
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 text-xs">No Brand (Generic)</p>
                          <p className="text-[10px] text-slate-400">Regular non-branded store listing</p>
                        </div>
                      </button>
                      
                      {brands.map((brand) => (
                        <button
                          key={brand.id}
                          type="button"
                          onClick={() => {
                            setSelectedBrand(brand.name);
                            setIsBrandOpen(false);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2 hover:bg-slate-50 transition-all text-left"
                        >
                          <img
                            src={brand.logo_url}
                            alt={brand.name}
                            className="w-7 h-7 object-cover rounded-lg bg-slate-100 border border-slate-200 shrink-0"
                          />
                          <div className="min-w-0">
                            <p className="font-bold text-slate-800 text-xs truncate">{brand.name}</p>
                            <p className="text-[10px] text-slate-400 truncate">{brand.origin} · {brand.category}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* 3. PRODUCT BADGE (HYBRID CONTROL - PRESETS & MANUAL TYPE IN) */}
                <div className="space-y-1.5">
                  <label className="text-[11px] uppercase tracking-wider font-bold text-slate-500">
                    Product Badge (Optional Hybrid Field)
                  </label>
                  <div className="space-y-2">
                    <input
                      type="text"
                      placeholder="Type custom badge text or click presets below"
                      value={badge}
                      onChange={(e) => setBadge(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-1 focus:ring-[#008080] focus:border-[#008080] outline-none font-bold text-[#008080]"
                    />
                    {/* Preset badges clickable buttons */}
                    <div className="flex flex-wrap gap-1.5">
                      {(isWholesaler 
                        ? ['BULK', 'WHOLESALE', 'FACTORY DIRECT', 'SALE', 'HOT'] 
                        : ['NEW', 'HOT', 'SALE', 'LIMITED RUN', 'BESTSELLER']
                      ).map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => setBadge(preset)}
                          className={`px-2.5 py-1 text-[9px] font-black rounded-lg border transition-all cursor-pointer ${
                            badge === preset
                              ? 'bg-[#008080] border-[#008080] text-white shadow-2xs'
                              : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-[#008080] hover:text-[#008080]'
                          }`}
                        >
                          {preset}
                        </button>
                      ))}
                      {badge && (
                        <button
                          type="button"
                          onClick={() => setBadge('')}
                          className="px-2 py-1 text-[9px] font-black rounded-lg border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100 cursor-pointer"
                        >
                          Clear &times;
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2: Inventory, Weight & Shipping */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-5">
              <div className="border-b border-slate-100 pb-3 flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-teal-50 text-[#008080] flex items-center justify-center shrink-0">
                  <Boxes className="w-4 h-4" />
                </div>
                <h3 className="font-extrabold text-slate-900 text-sm font-display">Inventory & Pricing</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Price */}
                <div className="space-y-1.5">
                  <label className="text-[11px] uppercase tracking-wider font-bold text-slate-500">
                    Regular Price (BDT) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">৳</span>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 1200"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="w-full pl-7 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs font-mono tabular-nums focus:ring-1 focus:ring-[#008080] focus:border-[#008080] outline-none"
                    />
                  </div>
                </div>

                {/* Old Price */}
                <div className="space-y-1.5">
                  <label className="text-[11px] uppercase tracking-wider font-bold text-slate-500">
                    Old / Strike Price (BDT)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">৳</span>
                    <input
                      type="number"
                      placeholder="e.g. 1500"
                      value={oldPrice}
                      onChange={(e) => setOldPrice(e.target.value)}
                      className="w-full pl-7 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs font-mono tabular-nums focus:ring-1 focus:ring-[#008080] focus:border-[#008080] outline-none"
                    />
                  </div>
                </div>

                {/* Stock */}
                <div className="space-y-1.5">
                  <label className="text-[11px] uppercase tracking-wider font-bold text-slate-500">
                    Initial Stock Count <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 50"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-mono tabular-nums focus:ring-1 focus:ring-[#008080] focus:border-[#008080] outline-none"
                  />
                </div>

                {/* Weight */}
                <div className="space-y-1.5">
                  <label className="text-[11px] uppercase tracking-wider font-bold text-slate-500">
                    Product Weight (KG) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="e.g. 0.5"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-mono tabular-nums focus:ring-1 focus:ring-[#008080] focus:border-[#008080] outline-none"
                  />
                </div>

                {/* MOQ */}
                <div className="space-y-1.5">
                  <label className="text-[11px] uppercase tracking-wider font-bold text-slate-500">
                    Min Order Qty (MOQ) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 1"
                    value={moq}
                    onChange={(e) => setMoq(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-mono tabular-nums focus:ring-1 focus:ring-[#008080] focus:border-[#008080] outline-none"
                  />
                </div>

                {/* Supplier Location */}
                <div className="space-y-1.5">
                  <label className="text-[11px] uppercase tracking-wider font-bold text-slate-500">
                    Supplier Location <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                      <MapPin className="w-3.5 h-3.5" />
                    </span>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Dhaka, Bangladesh"
                      value={supplierLocation}
                      onChange={(e) => setSupplierLocation(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-1 focus:ring-[#008080] focus:border-[#008080] outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Delivery charge calculator output based on weight */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-teal-50 text-[#008080] flex items-center justify-center shrink-0 mt-0.5">
                  <Info className="w-3 h-3" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-slate-900">Courier Shipping API Connection</h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Weight-based calculations automatically link with District Delivery Rates. Based on current weight of <strong className="text-slate-800 font-mono">{computedWeight} KG</strong>, the calculated delivery parameters are:
                  </p>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 pt-2 text-[11px] font-bold text-[#008080]">
                    <span>• Base Dhaka Rate: ৳{computedDeliveryBase}</span>
                    <span>• Extra Weight Charge: ৳{computedDeliveryExtra}</span>
                    <span>• Total Courier Bill: ৳{totalEstimatedDelivery}</span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-semibold pt-1">
                    When order status changes to "Ready For Shipment", a real-time booking payload is sent automatically.
                  </p>
                </div>
              </div>
            </div>

            {/* Card 3: Memory-Retention Native AI Meta Generator */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-5">
              <div className="border-b border-slate-100 pb-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-teal-50 text-[#008080] flex items-center justify-center shrink-0">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <h3 className="font-extrabold text-slate-900 text-sm font-display">100% In-House Custom SEO AI Engine</h3>
                </div>
                <button
                  type="button"
                  onClick={handleRegenerateAi}
                  disabled={isAiGenerating}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#008080]/10 hover:bg-[#008080]/20 text-[#008080] text-[10px] font-extrabold rounded-lg transition-all cursor-pointer"
                >
                  {isAiGenerating ? (
                    <>
                      <span className="w-3 h-3 border-2 border-[#008080] border-t-transparent rounded-full animate-spin"></span>
                      <span>Optimizing...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3 h-3" />
                      <span>Regenerate SEO Copy</span>
                    </>
                  )}
                </button>
              </div>

              <div className="space-y-4">
                {/* Description */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <label className="text-[11px] uppercase tracking-wider font-bold text-slate-500">
                      Product Description (AI Blended & Fully Editable)
                    </label>
                    <span className="text-[9px] font-bold text-[#008080] uppercase bg-teal-50 px-2 py-0.5 rounded animate-pulse">
                      Live Memory Active
                    </span>
                  </div>
                  <textarea
                    rows={8}
                    placeholder="AI optimized retail copy will populate here automatically... Your manual modifications are stored in memory and blended when clicking Regenerate!"
                    value={aiDescription}
                    onChange={(e) => setAiDescription(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs leading-relaxed focus:ring-1 focus:ring-[#008080] focus:border-[#008080] outline-none"
                  />
                  <p className="text-[10px] text-slate-400 font-semibold leading-normal">
                    💡 <strong>Merchant Tip:</strong> Feel free to customize this description! When you click "Regenerate SEO Copy", our custom engine preserves your edited text and combines it with advanced Google Rank-focused keywords.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Meta Title */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] uppercase tracking-wider font-bold text-slate-500">
                      SEO Meta Title (Click-optimized)
                    </label>
                    <input
                      type="text"
                      placeholder="Click-worthy meta title"
                      value={metaTitle}
                      onChange={(e) => setMetaTitle(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:ring-1 focus:ring-[#008080] focus:border-[#008080] outline-none"
                    />
                  </div>

                  {/* Meta Description */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] uppercase tracking-wider font-bold text-slate-500">
                      SEO Meta Description (Under 160 Chars)
                    </label>
                    <input
                      type="text"
                      placeholder="Search engine click summary"
                      value={metaDescription}
                      onChange={(e) => setMetaDescription(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-1 focus:ring-[#008080] focus:border-[#008080] outline-none"
                    />
                  </div>

                  {/* Meta Keywords */}
                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="text-[11px] uppercase tracking-wider font-bold text-slate-500">
                      SEO Keywords (Minimum 10 high-intent terms, comma-separated)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. buy gadgets online, authentic kettle bd, walton electric kettle"
                      value={metaKeywords}
                      onChange={(e) => setMetaKeywords(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-1 focus:ring-[#008080] focus:border-[#008080] outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Media & Visual Marketing Toggles (4 Cols) */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Card 4: Product Image & Video */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs space-y-4">
              <div className="border-b border-slate-100 pb-3 flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-teal-50 text-[#008080] flex items-center justify-center shrink-0">
                  <ImageIcon className="w-4 h-4" />
                </div>
                <h3 className="font-extrabold text-slate-900 text-sm font-display">Product Media</h3>
              </div>

              {/* Product Image Input & Display */}
              <div className="space-y-3">
                <label className="text-[11px] uppercase tracking-wider font-bold text-slate-500 block">
                  Product Image <span className="text-rose-500">*</span>
                </label>
                
                {imageUrl ? (
                  <div className="relative group rounded-xl overflow-hidden border border-slate-200 aspect-[4/3] bg-slate-50">
                    <img src={imageUrl} alt="Product Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setImageUrl('')}
                      className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black text-white rounded-full transition-all cursor-pointer opacity-0 group-hover:opacity-100 font-bold"
                    >
                      &times;
                    </button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-slate-200 hover:border-[#008080] transition-colors rounded-xl p-6 text-center cursor-pointer relative bg-slate-50 group">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="space-y-2">
                      <div className="w-10 h-10 rounded-xl bg-teal-50 text-[#008080] flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                        <Upload className="w-5 h-5" />
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-xs font-bold text-slate-900">Upload Product Image</p>
                        <p className="text-[10px] text-slate-400">JPEG, PNG, WEBP up to 5MB</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Direct Image URL input as fallback */}
                <div className="space-y-1">
                  <p className="text-[10px] text-slate-400 font-bold text-center uppercase">Or Enter Direct Image URL</p>
                  <input
                    type="text"
                    placeholder="https://example.com/image.jpg"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-1 focus:ring-[#008080] focus:border-[#008080] outline-none"
                  />
                </div>
              </div>

              {/* Product Video Optional Url */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="text-[11px] uppercase tracking-wider font-bold text-slate-500 flex items-center gap-1">
                  <Video className="w-3.5 h-3.5 text-slate-400" />
                  <span>Product Video URL (Optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="https://youtube.com/watch?v=..."
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-1 focus:ring-[#008080] focus:border-[#008080] outline-none"
                />
              </div>
            </div>

            {/* Card 5: Visual Marketing Triggers & Campaigns */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs space-y-4">
              <div className="border-b border-slate-100 pb-3 flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-teal-50 text-[#008080] flex items-center justify-center shrink-0">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <h3 className="font-extrabold text-slate-900 text-sm font-display">Marketing Triggers</h3>
              </div>

              {/* Featured checkbox */}
              <div className="p-3 bg-slate-50/50 hover:bg-slate-50 transition-colors border border-slate-200/60 rounded-xl flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  id="isFeatured"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="mt-1 cursor-pointer accent-[#008080]"
                />
                <label htmlFor="isFeatured" className="space-y-0.5 cursor-pointer">
                  <p className="text-xs font-bold text-slate-900">Featured Product Listing</p>
                  <p className="text-[10px] text-slate-500 leading-normal">
                    Check this to display the the product inside the featured and retail showcase sections on the homepage.
                  </p>
                </label>
              </div>

              {/* 3. CUSTOM CAMPAIGN DROPDOWN SELECTOR WITH BANNERS */}
              <div className="space-y-1.5 pt-2 relative">
                <label className="text-[11px] uppercase tracking-wider font-bold text-slate-500 block">
                  Assign to Special Offer Campaign
                </label>

                {isCampaignOpen && (
                  <div className="fixed inset-0 z-30" onClick={() => setIsCampaignOpen(false)} />
                )}

                <button
                  type="button"
                  onClick={() => setIsCampaignOpen(!isCampaignOpen)}
                  className="w-full px-4 py-2 bg-white rounded-xl border border-slate-200 text-xs flex items-center justify-between text-slate-700 hover:border-teal-400 transition-all cursor-pointer relative z-30 min-h-[46px]"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={activeCampaignObj?.bannerImage || 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=200'}
                      alt={activeCampaignObj?.campaignName || 'No Campaign'}
                      className="w-10 h-6 object-cover rounded-md border border-slate-100 shrink-0"
                    />
                    <div className="text-left min-w-0">
                      <p className="font-bold text-slate-950 truncate">{activeCampaignObj?.campaignName || 'None (Independent)'}</p>
                      {activeCampaignObj && (
                        <p className="text-[9px] text-slate-400 truncate">{activeCampaignObj.badgeText}</p>
                      )}
                    </div>
                  </div>
                  <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                </button>

                {isCampaignOpen && (
                  <div className="absolute z-40 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-60 overflow-y-auto py-1 animate-in fade-in slide-in-from-top-2 duration-100">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedOfferId('');
                        setIsCampaignOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2 hover:bg-slate-50 transition-all text-left border-b border-slate-100"
                    >
                      <div className="w-10 h-6 rounded-md bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 text-slate-400 text-[9px] font-bold">
                        IND
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 text-xs">None (Independent Product)</p>
                        <p className="text-[10px] text-slate-400">Regular self-contained catalog product</p>
                      </div>
                    </button>
                    
                    {specialOffers.map((o) => (
                      <button
                        key={o.id}
                        type="button"
                        onClick={() => {
                          setSelectedOfferId(o.id);
                          setIsCampaignOpen(false);
                        }}
                        className="w-full flex items-center gap-3.5 px-4 py-2.5 hover:bg-slate-50 transition-all text-left"
                      >
                        <img
                          src={o.bannerImage}
                          alt={o.campaignName}
                          className="w-12 h-7 object-cover rounded-md bg-slate-100 border border-slate-200 shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="font-bold text-slate-800 text-xs truncate">{o.campaignName}</p>
                          <p className="text-[10px] text-slate-400 truncate">{o.badgeText} · {o.description}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Save Card Buttons */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs space-y-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-[#008080] hover:bg-[#006666] disabled:bg-[#008080]/50 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer select-none"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>Publishing Product...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Publish & Go Live</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={onBackToDashboard}
                className="w-full py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 font-bold text-xs rounded-xl transition-all cursor-pointer"
              >
                Cancel & Return
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
