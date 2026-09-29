import React, { useState, useEffect } from 'react';
import {
  Flame,
  Plus,
  Sparkles,
  Calendar,
  Clock,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Eye,
  ArrowRight,
  Hash,
  Tag,
  Sliders,
  Layers,
  Search,
} from 'lucide-react';
import {
  SpecialOfferItem,
  specialOfferService,
  OFFERS_UPDATED_EVENT,
} from '../../../services/specialOfferService';
import { SpecialOfferFormPage } from './SpecialOfferFormPage';

interface SpecialOffersViewProps {
  onShowToast: (msg: string) => void;
}

export const SpecialOffersView: React.FC<SpecialOffersViewProps> = ({
  onShowToast,
}) => {
  const [offers, setOffers] = useState<SpecialOfferItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // View mode navigation for dedicated page (Requirement #2)
  const [viewMode, setViewMode] = useState<'list' | 'create' | 'edit'>(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      if (path.includes('/special-offers/create')) return 'create';
      if (path.includes('/special-offers/edit/')) return 'edit';
    }
    return 'list';
  });

  const [editingOfferId, setEditingOfferId] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      const match = window.location.pathname.match(/\/special-offers\/edit\/(.+)/);
      if (match) return match[1];
    }
    return null;
  });

  // Load offers from service and subscribe to live sync events
  const loadOffers = () => {
    setOffers(specialOfferService.getOffers());
  };

  useEffect(() => {
    loadOffers();

    const handleUpdate = () => {
      loadOffers();
    };

    window.addEventListener(OFFERS_UPDATED_EVENT, handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener(OFFERS_UPDATED_EVENT, handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const handleNavigateToCreate = () => {
    setViewMode('create');
    setEditingOfferId(null);
    try {
      window.history.pushState({}, '', '/admin/special-offers/create');
    } catch (_) {}
  };

  const handleNavigateToEdit = (offerId: string) => {
    setViewMode('edit');
    setEditingOfferId(offerId);
    try {
      window.history.pushState({}, '', `/admin/special-offers/edit/${offerId}`);
    } catch (_) {}
  };

  const handleBackToList = () => {
    setViewMode('list');
    setEditingOfferId(null);
    try {
      window.history.pushState({}, '', '/admin/special-offers');
    } catch (_) {}
    loadOffers();
  };

  const handleDeleteOffer = (offer: SpecialOfferItem) => {
    if (
      window.confirm(
        `Are you sure you want to delete the offer campaign "${offer.campaignName}"? It will be immediately removed from the homepage.`
      )
    ) {
      specialOfferService.deleteOffer(offer.id);
      onShowToast(`Special offer "${offer.campaignName}" removed from homepage.`);
      loadOffers();
    }
  };

  const handleToggleStatus = (offer: SpecialOfferItem) => {
    try {
      const updated = specialOfferService.toggleOfferStatus(offer.id);
      onShowToast(
        `Offer status changed to ${updated.status?.toUpperCase() || 'UPDATED'}`
      );
      loadOffers();
    } catch (e: any) {
      onShowToast(e.message || 'Error updating status');
    }
  };

  // Dedicated Page for Creating Special Offer (Requirement #2)
  if (viewMode === 'create') {
    return (
      <SpecialOfferFormPage
        initialOfferId={null}
        onBack={handleBackToList}
        onShowToast={onShowToast}
      />
    );
  }

  // Dedicated Page for Editing Special Offer (Requirement #2)
  if (viewMode === 'edit') {
    return (
      <SpecialOfferFormPage
        initialOfferId={editingOfferId}
        onBack={handleBackToList}
        onShowToast={onShowToast}
      />
    );
  }

  // Filter offers by search query
  const filteredOffers = offers.filter((o) => {
    const q = searchQuery.toLowerCase();
    return (
      o.campaignName.toLowerCase().includes(q) ||
      o.badgeText.toLowerCase().includes(q) ||
      (o.description && o.description.toLowerCase().includes(q))
    );
  });

  // Calculate metrics
  const activeCount = offers.filter((o) => o.status === 'active').length;
  const scheduledCount = offers.filter((o) => o.status === 'scheduled').length;
  const expiredCount = offers.filter((o) => o.status === 'expired').length;

  return (
    <div className="space-y-6">
      {/* 1. Header Banner & Dedicated Action Button */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-7 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-50 text-[#0f766e] border border-emerald-200">
            <Flame className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            <span>Homepage Flash Promotions & Deals</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight font-display">
            Special Offers & Flash Sales
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
            Manage promotional banner creatives, campaign badge colors, sort orders, and discount schedules.
            All changes sync instantly to the homepage carousel without page reloads.
          </p>
        </div>

        {/* Primary "+ Add Special Offer" Button - Opens Dedicated Page (Requirement #2) */}
        <div className="shrink-0 flex items-center gap-3">
          <button
            type="button"
            onClick={handleNavigateToCreate}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-xs sm:text-sm font-extrabold text-white bg-[#0f766e] hover:bg-[#064e3b] active:scale-95 shadow-md shadow-teal-900/20 transition-all cursor-pointer group"
          >
            <Plus className="w-4 h-4 text-emerald-200 group-hover:rotate-90 transition-transform duration-200" />
            <span>Add Special Offer</span>
          </button>
        </div>
      </div>

      {/* 2. Ultra-Slim Resolution Guide Banner (Requirement #3) */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-teal-50 via-emerald-50 to-teal-50 border border-teal-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-start gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#0f766e] text-white flex items-center justify-center shrink-0 shadow-2xs">
            <Sparkles className="w-4 h-4 text-emerald-200" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-black text-slate-900">
              Creative Banner Asset Specifications
            </h3>
            <p className="text-xs font-bold text-teal-800">
              Recommended Resolution: Ultra-Slim Special Offer Banner: 1200 × 300 px or 1000 × 250 px (Aspect Ratio 4:1 - Extra Slim)
            </p>
          </div>
        </div>

        <div className="shrink-0 flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-white/80 px-3 py-1.5 rounded-xl border border-emerald-200">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Live Homepage Sync Active</span>
        </div>
      </div>

      {/* 3. Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-500 block">Total Campaigns</span>
          <span className="text-2xl font-black text-slate-900 font-mono">{offers.length}</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-emerald-200 bg-emerald-50/20 shadow-2xs">
          <span className="text-[11px] font-bold text-emerald-700 block">Live Active on Home</span>
          <span className="text-2xl font-black text-[#0f766e] font-mono">{activeCount}</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-blue-200 bg-blue-50/20 shadow-2xs">
          <span className="text-[11px] font-bold text-blue-700 block">Scheduled Upcoming</span>
          <span className="text-2xl font-black text-blue-600 font-mono">{scheduledCount}</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-400 block">Expired / Inactive</span>
          <span className="text-2xl font-black text-slate-400 font-mono">{expiredCount}</span>
        </div>
      </div>

      {/* 4. Search and Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search campaigns, badges..."
            className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 bg-white focus:outline-none focus:ring-2 focus:ring-[#0f766e]/30 focus:border-[#0f766e]"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>

        <span className="text-xs text-slate-500 font-medium">
          Showing {filteredOffers.length} of {offers.length} special offers
        </span>
      </div>

      {/* 5. Offers List Cards Grid */}
      {filteredOffers.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-slate-300 space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-teal-50 text-[#0f766e] flex items-center justify-center mx-auto shadow-2xs">
            <Flame className="w-7 h-7 text-[#0f766e]" />
          </div>
          <h3 className="text-base font-black text-slate-900">No Special Offer Campaigns Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {searchQuery
              ? 'No offers match your search filter. Try clearing the search query.'
              : 'There are currently no promotional banners. Click "Add Special Offer" to create your first homepage banner campaign.'}
          </p>
          <button
            type="button"
            onClick={handleNavigateToCreate}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#0f766e] hover:bg-[#064e3b] transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Special Offer</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredOffers.map((offer) => {
            const isActive = offer.status === 'active';
            const isPaused = offer.status === 'paused';
            const isScheduled = offer.status === 'scheduled';
            const isExpired = offer.status === 'expired';

            return (
              <div
                key={offer.id}
                className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 hover:border-teal-300 shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group"
              >
                {/* Banner Thumbnail (4:1 Ultra-Slim Aspect Ratio) & Badge Overlay */}
                <div className="relative h-32 sm:h-36 w-full bg-transparent border-b border-slate-100 overflow-hidden">
                  <img
                    src={offer.bannerImage}
                    alt={offer.campaignName}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                  />

                  {/* Badge Text with Custom Badge Color */}
                  <div
                    className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider text-white shadow-md flex items-center gap-1"
                    style={{ backgroundColor: offer.badgeColor || '#0f766e' }}
                  >
                    <Tag className="w-2.5 h-2.5" />
                    <span>{offer.badgeText || 'SPECIAL OFFER'}</span>
                  </div>

                  {/* Status Pill */}
                  <div className="absolute top-2.5 right-2.5">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        isActive
                          ? 'bg-emerald-500 text-white shadow-xs'
                          : isPaused
                          ? 'bg-amber-500 text-white shadow-xs'
                          : isScheduled
                          ? 'bg-blue-500 text-white shadow-xs'
                          : 'bg-rose-500 text-white shadow-xs'
                      }`}
                    >
                      {offer.status || 'Active'}
                    </span>
                  </div>

                  {/* Clean Position Floating Chip */}
                  <div className="absolute bottom-2.5 left-2.5">
                    <span className="px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-xs text-[10px] text-white font-bold uppercase tracking-wider">
                      Position #{offer.sortOrder ?? 0}
                    </span>
                  </div>
                </div>

                {/* Card Content Body */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-2.5">
                  <div>
                    <h3 className="text-sm font-black text-slate-900 tracking-tight line-clamp-1">
                      {offer.campaignName}
                    </h3>
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed font-medium mt-1">
                      {offer.description || 'Exclusive promotional flash deal with verified seller discounts.'}
                    </p>
                  </div>

                  <div className="space-y-1.5 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>Schedule:</span>
                      </span>
                      <span className="font-semibold text-slate-800">
                        {offer.startDate} ~ {offer.expiryDate}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                        <span>CTA Button:</span>
                      </span>
                      <span className="font-bold text-[#0f766e] bg-teal-50 px-2 py-0.5 rounded-md">
                        {offer.ctaText || 'Shop Now'} →
                      </span>
                    </div>
                  </div>

                  {/* Card Actions Footer */}
                  <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(offer)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                        isActive
                          ? 'text-amber-700 bg-amber-50 hover:bg-amber-100'
                          : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                      }`}
                    >
                      {isActive ? 'Pause Campaign' : 'Activate Live'}
                    </button>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleNavigateToEdit(offer.id)}
                        className="p-2 rounded-xl text-slate-600 hover:text-[#0f766e] hover:bg-teal-50 transition-colors cursor-pointer"
                        title="Edit Special Offer (Opens Dedicated Page)"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteOffer(offer)}
                        className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Delete Offer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
