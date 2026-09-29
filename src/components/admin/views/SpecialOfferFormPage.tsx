import React, { useState, useRef, useEffect } from 'react';
import {
  ArrowLeft,
  Upload,
  Image as ImageIcon,
  Calendar,
  Tag,
  Hash,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Trash2,
  Save,
  ShoppingBag,
  Search,
  Check,
} from 'lucide-react';
import {
  SpecialOfferItem,
  specialOfferService,
  DEFAULT_BRAND_BADGE_COLOR,
} from '../../../services/specialOfferService';
import { PRODUCTS } from '../../../data/mockData';

interface SpecialOfferFormPageProps {
  initialOfferId?: string | null;
  onBack: () => void;
  onShowToast: (msg: string) => void;
}

export const SpecialOfferFormPage: React.FC<SpecialOfferFormPageProps> = ({
  initialOfferId,
  onBack,
  onShowToast,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [campaignName, setCampaignName] = useState('');
  const [badgeText, setBadgeText] = useState('SPECIAL OFFER');
  const [badgeColor, setBadgeColor] = useState(DEFAULT_BRAND_BADGE_COLOR);
  const [bannerImage, setBannerImage] = useState('');
  const [sortOrder, setSortOrder] = useState<number>(0);
  const [startDate, setStartDate] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [description, setDescription] = useState('');
  const [ctaText, setCtaText] = useState('Shop Now');
  const [assignedProductIds, setAssignedProductIds] = useState<string[]>([]);
  const [productSearch, setProductSearch] = useState('');

  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialOfferId) {
      const offers = specialOfferService.getOffers();
      const existing = offers.find((o) => o.id === initialOfferId);
      if (existing) {
        setCampaignName(existing.campaignName || '');
        setBadgeText(existing.badgeText || 'SPECIAL OFFER');
        setBadgeColor(existing.badgeColor || DEFAULT_BRAND_BADGE_COLOR);
        setBannerImage(existing.bannerImage || '');
        setSortOrder(existing.sortOrder ?? 0);
        setStartDate(existing.startDate || '');
        setExpiryDate(existing.expiryDate || '');
        setDescription(existing.description || '');
        setCtaText(existing.ctaText || 'Shop Now');
        setAssignedProductIds(
          existing.assignedProductIds && existing.assignedProductIds.length > 0
            ? existing.assignedProductIds
            : ['prod-1', 'prod-2', 'prod-6', 'prod-10', 'prod-11']
        );
        return;
      }
    }

    // Default dates
    const today = new Date().toISOString().split('T')[0];
    const nextMonth = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0];
    setCampaignName('');
    setBadgeText('SPECIAL OFFER');
    setBadgeColor(DEFAULT_BRAND_BADGE_COLOR);
    setBannerImage('');
    setSortOrder(0);
    setStartDate(today);
    setExpiryDate(nextMonth);
    setDescription('');
    setCtaText('Shop Now');
    setAssignedProductIds(['prod-1', 'prod-2', 'prod-6', 'prod-7', 'prod-10', 'prod-11', 'prod-14']);
  }, [initialOfferId]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await processFileUpload(file);
    }
  };

  const processFileUpload = async (file: File) => {
    setIsUploading(true);
    setUploadError(null);
    try {
      const res = await specialOfferService.uploadOfferAsset(file);
      setBannerImage(res.url);
      onShowToast('Ultra-slim creative banner uploaded successfully.');
    } catch (err: any) {
      setUploadError(err.message || 'Image upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      await processFileUpload(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!campaignName.trim()) {
      setFormError('Campaign Name is required.');
      return;
    }

    if (!bannerImage.trim()) {
      setFormError('Please upload a creative banner image or provide a valid image URL.');
      return;
    }

    if (!startDate) {
      setFormError('Start Date is required.');
      return;
    }

    if (!expiryDate) {
      setFormError('Expiry Date is required.');
      return;
    }

    if (expiryDate < startDate) {
      setFormError('Expiry Date cannot be earlier than Start Date.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (initialOfferId) {
        const updated = specialOfferService.updateOffer(initialOfferId, {
          campaignName: campaignName.trim(),
          badgeText: badgeText.trim() || 'SPECIAL OFFER',
          badgeColor,
          bannerImage: bannerImage.trim(),
          sortOrder: Number(sortOrder) || 0,
          startDate,
          expiryDate,
          description: description.trim(),
          ctaText: ctaText.trim() || 'Shop Now',
        });
        onShowToast(`Special offer "${updated.campaignName}" updated successfully.`);
      } else {
        const created = specialOfferService.addOffer({
          campaignName: campaignName.trim(),
          badgeText: badgeText.trim() || 'SPECIAL OFFER',
          badgeColor,
          bannerImage: bannerImage.trim(),
          sortOrder: Number(sortOrder) || 0,
          startDate,
          expiryDate,
          description: description.trim(),
          ctaText: ctaText.trim() || 'Shop Now',
        });
        onShowToast(`New special offer "${created.campaignName}" created and synced to homepage!`);
      }
      onBack();
    } catch (err: any) {
      setFormError(err.message || 'Failed to save special offer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* 1. Header with Breadcrumb & Back Navigation */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 hover:text-slate-900 transition-colors cursor-pointer"
            title="Back to Special Offers List"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 mb-1">
              <span onClick={onBack} className="hover:text-[#0f766e] cursor-pointer">
                Special Offers & Flash Sales
              </span>
              <span>/</span>
              <span className="text-[#0f766e]">
                {initialOfferId ? 'Edit Special Offer' : 'Create Special Offer'}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight font-display">
              {initialOfferId ? 'Edit Special Offer Campaign' : 'Add Special Offer'}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onBack}
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || isUploading}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-extrabold text-white bg-[#0f766e] hover:bg-[#064e3b] active:scale-95 shadow-md shadow-teal-900/20 transition-all cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSubmitting ? 'Saving & Syncing...' : initialOfferId ? 'Update & Live Sync' : 'Save Special Offer'}</span>
          </button>
        </div>
      </div>

      {/* 2. Main Form Card */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-7 border border-slate-200 shadow-xs space-y-6">
        {formError && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-2.5 text-xs text-rose-700 font-bold animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{formError}</span>
          </div>
        )}

        {/* Section: Campaign Details */}
        <div className="space-y-4">
          <div className="border-b border-slate-100 pb-2">
            <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#0f766e]" />
              <span>General Campaign Information</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black text-slate-800 mb-1">
                Campaign Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={campaignName}
                onChange={(e) => setCampaignName(e.target.value)}
                placeholder="e.g., Up to 50% OFF or Summer Clearance"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0f766e]/30 focus:border-[#0f766e]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-black text-slate-800 mb-1">
                Badge Text <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={badgeText}
                  onChange={(e) => setBadgeText(e.target.value)}
                  placeholder="e.g., SPECIAL OFFER or MEGA DEAL"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0f766e]/30 focus:border-[#0f766e]"
                  required
                />
                <Tag className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>
          </div>
        </div>

        {/* Section: Ultra-Slim Banner Image Upload Box with Strict Resolution Guide (Requirement #3) */}
        <div className="space-y-3">
          <div className="border-b border-slate-100 pb-2">
            <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-[#0f766e]" />
              <span>Banner Creative Asset (Ultra-Slim Format)</span>
            </h2>
          </div>

          <label className="block text-xs font-black text-slate-800">
            Banner Image (Upload Creative) <span className="text-rose-500">*</span>
          </label>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/png, image/jpeg, image/jpg, image/webp, image/svg+xml"
            className="hidden"
          />

          {/* Drop Zone / Preview Box */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`rounded-2xl border-2 border-dashed p-4 transition-all text-center relative ${
              isDragging
                ? 'border-[#0f766e] bg-teal-50/50'
                : bannerImage
                ? 'border-teal-300 bg-teal-50/20'
                : 'border-slate-200 bg-slate-50/80 hover:bg-slate-100/50 hover:border-slate-300'
            }`}
          >
            {bannerImage ? (
              <div className="space-y-3">
                {/* 4:1 Extra Slim Preview Box */}
                <div className="relative w-full h-32 sm:h-36 md:h-40 rounded-xl overflow-hidden shadow-xs bg-transparent border border-slate-200 flex items-center justify-center">
                  <img
                    src={bannerImage}
                    alt="Ultra-Slim Banner Preview"
                    className="w-full h-full object-cover object-center"
                  />
                  <div className="absolute top-2 right-2 flex items-center gap-1.5 bg-black/60 backdrop-blur-xs p-1 rounded-lg">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-2.5 py-1 text-[10px] font-bold text-white hover:text-emerald-300 transition-colors cursor-pointer"
                    >
                      Change
                    </button>
                    <button
                      type="button"
                      onClick={() => setBannerImage('')}
                      className="p-1 text-rose-300 hover:text-rose-100 transition-colors cursor-pointer"
                      title="Remove Image"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Preview overlay badge */}
                  <div
                    className="absolute bottom-2 left-2 flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider text-white shadow-md"
                    style={{ backgroundColor: badgeColor }}
                  >
                    <span>{badgeText || 'SPECIAL OFFER'}</span>
                  </div>
                </div>

                <p className="text-[11px] font-semibold text-emerald-800 flex items-center justify-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Ultra-Slim Creative Image Loaded & Ready for Homepage Slider
                </p>
              </div>
            ) : (
              <div className="py-6 space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200 text-[#0f766e] flex items-center justify-center mx-auto shadow-2xs">
                  {isUploading ? (
                    <div className="w-5 h-5 border-2 border-[#0f766e] border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Upload className="w-6 h-6" />
                  )}
                </div>

                <div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="text-xs font-black text-[#0f766e] hover:text-[#064e3b] hover:underline cursor-pointer"
                  >
                    {isUploading ? 'Uploading creative asset...' : 'Click to Upload Creative Banner'}
                  </button>
                  <span className="text-xs text-slate-500"> or drag and drop image here</span>
                </div>

                <p className="text-[10px] text-slate-400">
                  Supports PNG, JPG, JPEG, WEBP (Max 5MB)
                </p>
              </div>
            )}

            {uploadError && (
              <p className="text-xs text-rose-600 font-bold mt-2">{uploadError}</p>
            )}
          </div>

          {/* Strict Image Resolution Guide (Requirement #3 Exact Label) */}
          <div className="px-3.5 py-2.5 rounded-xl bg-teal-50/90 border border-teal-200/90 flex items-start gap-2 shadow-2xs">
            <ImageIcon className="w-4 h-4 text-[#0f766e] shrink-0 mt-0.5" />
            <p className="text-xs font-bold text-teal-900 leading-tight">
              Recommended Resolution: Ultra-Slim Special Offer Banner: 1200 × 300 px or 1000 × 250 px (Aspect Ratio 4:1 - Extra Slim)
            </p>
          </div>
        </div>

        {/* Section: Display Priority & Action Button */}
        <div className="space-y-4">
          <div className="border-b border-slate-100 pb-2">
            <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <Tag className="w-4 h-4 text-[#0f766e]" />
              <span>Display Priority & Action Button</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black text-slate-800 mb-1">
                Sort Order (Slider Position)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(Number(e.target.value))}
                  placeholder="0"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0f766e]/30 focus:border-[#0f766e]"
                />
                <Hash className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Lower numbers appear first in the homepage slider (0 is primary)</p>
            </div>

            <div>
              <label className="block text-xs font-black text-slate-800 mb-1">
                Button Text (CTA)
              </label>
              <input
                type="text"
                value={ctaText}
                onChange={(e) => setCtaText(e.target.value)}
                placeholder="Shop Now"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0f766e]/30 focus:border-[#0f766e]"
              />
              <p className="text-[10px] text-slate-400 mt-1">Call to action pill label on the banner</p>
            </div>
          </div>
        </div>

        {/* Section: Campaign Dates */}
        <div className="space-y-4">
          <div className="border-b border-slate-100 pb-2">
            <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#0f766e]" />
              <span>Promotional Schedule</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black text-slate-800 mb-1">
                Start Date <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0f766e]/30 focus:border-[#0f766e]"
                  required
                />
                <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-slate-800 mb-1">
                Expiry Date <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0f766e]/30 focus:border-[#0f766e]"
                  required
                />
                <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>
          </div>
        </div>

        {/* Section: Description */}
        <div className="space-y-2">
          <label className="block text-xs font-black text-slate-800">
            Description / Promo Subtitle
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g., Top Rated Products • Smartphone, Studio Sound & Smartwatch Deals"
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0f766e]/30 focus:border-[#0f766e]"
          />
        </div>

        {/* Action Buttons */}
        <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onBack}
            className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || isUploading}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-extrabold text-white bg-[#0f766e] hover:bg-[#064e3b] active:scale-95 shadow-md shadow-teal-900/20 transition-all cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSubmitting ? 'Saving & Syncing...' : initialOfferId ? 'Update & Live Sync' : 'Save Special Offer'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
