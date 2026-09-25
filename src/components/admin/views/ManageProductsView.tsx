import React, { useState, useEffect } from 'react';
import {
  Package,
  Plus,
  Search,
  Filter,
  Sparkles,
  RefreshCw,
  Truck,
  Globe,
  Tag,
  Flame,
  Shield,
  CheckCircle2,
  Lock,
  LockOpen,
  Edit,
  Trash2,
  Store,
  Upload,
  Video,
  X,
  AlertCircle,
  BarChart2,
  DollarSign,
  Scale,
} from 'lucide-react';
import { adminApi } from '../../../services/adminApi';

interface ManageProductsViewProps {
  onShowToast: (msg: string) => void;
}

export interface ProductItem {
  id: string;
  seller_id: string;
  seller_name?: string;
  title: string;
  description: string;
  price: number;
  old_price?: number;
  category: string;
  stock: number;
  status: 'active' | 'draft' | 'archived';
  image_url?: string;
  video_url?: string;
  vendor_type?: 'Retailer' | 'Wholesaler' | 'Importer';
  sku?: string;
  brand?: string;
  badge?: string;
  is_featured?: boolean;
  special_offer_id?: string;
  weight_kg?: number;
  moq?: number;
  country_source?: string;
  import_cost_bdt?: number;
  supplier_location?: string;
  meta_title?: string;
  meta_keywords?: string;
  meta_description?: string;
  courier_status?: 'locked' | 'ready_for_delivery' | 'shipped';
  created_at?: string;
}

export const ManageProductsView: React.FC<ManageProductsViewProps> = ({ onShowToast }) => {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [sellers, setSellers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [vendorFilter, setVendorFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);

  // Form Fields
  const [vendorType, setVendorType] = useState<'Retailer' | 'Wholesaler' | 'Importer'>('Retailer');
  const [sellerId, setSellerId] = useState<string>('');
  const [title, setTitle] = useState('');
  const [sku, setSku] = useState('');
  const [category, setCategory] = useState('Electronics');
  const [brand, setBrand] = useState('AR Craft');
  const [price, setPrice] = useState<string>('');
  const [oldPrice, setOldPrice] = useState<string>('');
  const [stock, setStock] = useState<string>('50');
  const [badge, setBadge] = useState<string>('');
  const [imageUrl, setImageUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [supplierLocation, setSupplierLocation] = useState('Dhaka Metro');

  // Vendor Specific Fields
  const [weightKg, setWeightKg] = useState<string>('0.5');
  const [moq, setMoq] = useState<string>('1');
  const [countrySource, setCountrySource] = useState('Bangladesh');
  const [importCostBdt, setImportCostBdt] = useState<string>('0');

  // Marketing & Logistics
  const [isFeatured, setIsFeatured] = useState<boolean>(false);
  const [specialOfferId, setSpecialOfferId] = useState<string>('');
  const [courierStatus, setCourierStatus] = useState<'locked' | 'ready_for_delivery' | 'shipped'>('ready_for_delivery');

  // AI Generator States
  const [description, setDescription] = useState('');
  const [metaTitle, setMetaTitle] = useState('');
  const [metaKeywords, setMetaKeywords] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [aiMemoryToken, setAiMemoryToken] = useState<string>('');

  const [isSaving, setIsSaving] = useState(false);

  // Load initial data
  const loadData = async () => {
    setIsLoading(true);
    try {
      const [prodRes, sellerRes] = await Promise.all([
        adminApi.getProducts(),
        adminApi.getSellers(),
      ]);

      if (prodRes.success && prodRes.products) {
        setProducts(prodRes.products);
      }
      if (sellerRes.success && sellerRes.sellers) {
        setSellers(sellerRes.sellers);
      }
    } catch {
      onShowToast('Error loading products list');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtered sellers based on selected vendorType
  const filteredSellers = sellers.filter((s) => {
    if (!s.business_type) return true;
    return s.business_type.toLowerCase().includes(vendorType.toLowerCase());
  });

  // Open modal for new product
  const handleOpenAddModal = () => {
    setEditingProductId(null);
    setVendorType('Retailer');
    setSellerId(filteredSellers[0]?.id || '');
    setTitle('');
    setSku(`ARM-RTL-${Math.floor(1000 + Math.random() * 9000)}`);
    setCategory('Electronics');
    setBrand('AR Craft');
    setPrice('1500');
    setOldPrice('1800');
    setStock('50');
    setBadge('NEW');
    setImageUrl('');
    setVideoUrl('');
    setWeightKg('0.5');
    setMoq('1');
    setCountrySource('Bangladesh');
    setImportCostBdt('0');
    setSupplierLocation('Dhaka Metro');
    setIsFeatured(false);
    setSpecialOfferId('');
    setCourierStatus('ready_for_delivery');
    setDescription('');
    setMetaTitle('');
    setMetaKeywords('');
    setMetaDescription('');
    setAiMemoryToken('');
    setIsModalOpen(true);
  };

  // Open modal for editing existing product
  const handleOpenEditModal = (p: ProductItem) => {
    setEditingProductId(p.id);
    setVendorType(p.vendor_type || 'Retailer');
    setSellerId(p.seller_id || '');
    setTitle(p.title || '');
    setSku(p.sku || '');
    setCategory(p.category || 'Electronics');
    setBrand(p.brand || 'AR Craft');
    setPrice(String(p.price || '0'));
    setOldPrice(p.old_price ? String(p.old_price) : '');
    setStock(String(p.stock || '0'));
    setBadge(p.badge || '');
    setImageUrl(p.image_url || '');
    setVideoUrl(p.video_url || '');
    setWeightKg(String(p.weight_kg || '0.5'));
    setMoq(String(p.moq || '1'));
    setCountrySource(p.country_source || 'Bangladesh');
    setImportCostBdt(String(p.import_cost_bdt || '0'));
    setSupplierLocation(p.supplier_location || 'Dhaka Metro');
    setIsFeatured(Boolean(p.is_featured));
    setSpecialOfferId(p.special_offer_id || '');
    setCourierStatus(p.courier_status || (p.vendor_type === 'Importer' ? 'locked' : 'ready_for_delivery'));
    setDescription(p.description || '');
    setMetaTitle(p.meta_title || '');
    setMetaKeywords(p.meta_keywords || '');
    setMetaDescription(p.meta_description || '');
    setAiMemoryToken('');
    setIsModalOpen(true);
  };

  // Vendor Type Change Cascading Logic
  const handleVendorTypeChange = (type: 'Retailer' | 'Wholesaler' | 'Importer') => {
    setVendorType(type);
    const matchingSellers = sellers.filter((s) => s.business_type?.toLowerCase().includes(type.toLowerCase()));
    if (matchingSellers.length > 0) {
      setSellerId(matchingSellers[0].id);
    }

    // Set default fields per vendor type
    if (type === 'Retailer') {
      setSku(`ARM-RTL-${Math.floor(1000 + Math.random() * 9000)}`);
      setMoq('1');
      setCountrySource('Bangladesh');
      setImportCostBdt('0');
      setCourierStatus('ready_for_delivery');
    } else if (type === 'Wholesaler') {
      setSku(`ARM-WHS-${Math.floor(1000 + Math.random() * 9000)}`);
      setMoq('10');
      setCountrySource('Bangladesh');
      setImportCostBdt('0');
      setCourierStatus('ready_for_delivery');
    } else if (type === 'Importer') {
      setSku(`ARM-IMP-${Math.floor(1000 + Math.random() * 9000)}`);
      setMoq('5');
      setCountrySource('China');
      setImportCostBdt('250');
      setCourierStatus('locked');
    }
  };

  // Native AI Meta Generator Handler
  const handleGenerateAiMeta = async () => {
    if (!title.trim()) {
      onShowToast('Please enter a Product Name first to generate AI Meta.');
      return;
    }

    setIsGeneratingAi(true);
    try {
      const res = await adminApi.generateProductMeta({
        title,
        category,
        vendor_type: vendorType,
        brand,
        image_url: imageUrl,
        extra_context: `Price: ৳${price}, Location: ${supplierLocation}`,
      });

      if (res.success && res.data) {
        setDescription(res.data.description);
        setMetaTitle(res.data.meta_title);
        setMetaKeywords(res.data.meta_keywords);
        setMetaDescription(res.data.meta_description);
        if (res.memoryToken) setAiMemoryToken(res.memoryToken);
        onShowToast('AI SEO Meta and 4-Step Description generated successfully!');
      } else {
        onShowToast(res.error || 'Failed to generate AI Meta content.');
      }
    } catch {
      onShowToast('Error connecting to AI Meta Generator service.');
    } finally {
      setIsGeneratingAi(false);
    }
  };

  // Image Upload Preview Handler
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        onShowToast('Image size must be under 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImageUrl(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Save Product Submit Handler
  const handleSubmitProduct = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !price || !category) {
      onShowToast('Product Name, Price, and Category are required.');
      return;
    }

    // Validation per Vendor Type
    if (vendorType === 'Wholesaler' && Number(moq) < 1) {
      onShowToast('Min Order (MOQ) must be at least 1 for Wholesalers.');
      return;
    }
    if (vendorType === 'Importer' && !countrySource.trim()) {
      onShowToast('Country Source is mandatory for Importer products.');
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        seller_id: sellerId,
        title: title.trim(),
        description: description || title,
        price: Number(price) || 0,
        old_price: oldPrice ? Number(oldPrice) : undefined,
        category,
        stock: Number(stock) || 0,
        image_url: imageUrl,
        video_url: videoUrl,
        vendor_type: vendorType,
        sku,
        brand,
        badge,
        is_featured: isFeatured,
        special_offer_id: specialOfferId,
        weight_kg: Number(weightKg) || 0.5,
        moq: Number(moq) || 1,
        country_source: countrySource,
        import_cost_bdt: Number(importCostBdt) || 0,
        supplier_location: supplierLocation,
        meta_title: metaTitle,
        meta_keywords: metaKeywords,
        meta_description: metaDescription,
        courier_status: courierStatus,
      };

      if (editingProductId) {
        const res = await adminApi.updateProduct(editingProductId, payload);
        if (res.success) {
          onShowToast('Product updated successfully!');
          setIsModalOpen(false);
          loadData();
        } else {
          onShowToast(res.error || 'Failed to update product.');
        }
      } else {
        const res = await adminApi.createProduct(payload);
        if (res.success) {
          onShowToast('New Product created and published successfully!');
          setIsModalOpen(false);
          loadData();
        } else {
          onShowToast(res.error || 'Failed to create product.');
        }
      }
    } catch {
      onShowToast('Network error saving product.');
    } finally {
      setIsSaving(false);
    }
  };

  // Toggle Courier Status for Import Products
  const handleToggleCourierStatus = async (p: ProductItem) => {
    const newStatus = p.courier_status === 'locked' ? 'ready_for_delivery' : 'locked';
    try {
      const res = await adminApi.updateCourierStatus(p.id, newStatus);
      if (res.success) {
        onShowToast(res.message || `Courier API Status changed to ${newStatus}`);
        loadData();
      } else {
        onShowToast(res.error || 'Failed to update courier status');
      }
    } catch {
      onShowToast('Error changing courier status');
    }
  };

  // Delete Product Handler
  const handleDeleteProduct = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;
    try {
      const res = await adminApi.deleteProduct(id);
      if (res.success) {
        onShowToast('Product deleted successfully');
        loadData();
      } else {
        onShowToast(res.error || 'Failed to delete product');
      }
    } catch {
      onShowToast('Error deleting product');
    }
  };

  // Filter products for table view
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.sku && p.sku.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.brand && p.brand.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesVendor =
      vendorFilter === 'all' ||
      (p.vendor_type && p.vendor_type.toLowerCase() === vendorFilter.toLowerCase());

    const matchesCategory =
      categoryFilter === 'all' || p.category.toLowerCase() === categoryFilter.toLowerCase();

    return matchesSearch && matchesVendor && matchesCategory;
  });

  // Calculate dynamic delivery fee estimate
  const numWeight = Number(weightKg) || 0.5;
  const numImportCost = Number(importCostBdt) || 0;
  const estimatedShippingFee = 60 + Math.ceil(numWeight * 20) + numImportCost;

  return (
    <div className="space-y-6">
      {/* Top Title & Header Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 font-display flex items-center gap-2">
            <Package className="w-6 h-6 text-[#008080]" />
            <span>Manage Products</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Create, edit, and configure vendor-based cascading products with Native AI SEO Generator & Courier API tracking.
          </p>
        </div>

        {/* Primary Action Button */}
        <button
          type="button"
          onClick={handleOpenAddModal}
          className="px-5 py-2.5 bg-[#008080] hover:bg-[#006666] text-white text-xs font-extrabold rounded-xl shadow-md shadow-[#008080]/20 transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Search & Category / Vendor Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Product Name, SKU, or Brand..."
            className="w-full pl-10 pr-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-[#008080] focus:ring-1 focus:ring-[#008080] bg-slate-50 text-slate-800"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium shrink-0">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-500">Vendor:</span>
            <select
              value={vendorFilter}
              onChange={(e) => setVendorFilter(e.target.value)}
              className="bg-transparent font-bold text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="all">All Vendors</option>
              <option value="retailer">Retailer</option>
              <option value="wholesaler">Wholesaler</option>
              <option value="importer">Importer</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium shrink-0">
            <span className="text-slate-500">Category:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-transparent font-bold text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="all">All Categories</option>
              <option value="electronics">Electronics</option>
              <option value="fashion">Fashion & Apparel</option>
              <option value="ceramics">Ceramics & Home</option>
              <option value="kitchenware">Kitchenware</option>
              <option value="industrial">Industrial Wholesale</option>
            </select>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[850px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Product Details</th>
                <th className="py-3 px-4">Vendor Type</th>
                <th className="py-3 px-4">Price & Old Price</th>
                <th className="py-3 px-4">Stock / MOQ</th>
                <th className="py-3 px-4">Marketing</th>
                <th className="py-3 px-4">Courier API</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700 font-medium">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-slate-400">
                    Loading products...
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-slate-400">
                    No products found matching your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl border border-slate-200 bg-slate-100 overflow-hidden shrink-0 flex items-center justify-center">
                          {p.image_url ? (
                            <img src={p.image_url} alt={p.title} className="w-full h-full object-cover" />
                          ) : (
                            <Package className="w-6 h-6 text-slate-400" />
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 leading-snug line-clamp-1">{p.title}</p>
                          <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-400 font-mono">
                            <span>SKU: {p.sku || 'N/A'}</span>
                            <span>•</span>
                            <span className="text-[#008080] font-semibold">{p.category}</span>
                            {p.brand && (
                              <>
                                <span>•</span>
                                <span>{p.brand}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                          p.vendor_type === 'Wholesaler'
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : p.vendor_type === 'Importer'
                            ? 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                            : 'bg-teal-100 text-teal-800 border border-teal-200'
                        }`}
                      >
                        {p.vendor_type || 'Retailer'}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">৳{p.price.toLocaleString()}</div>
                      {p.old_price && (
                        <div className="text-[10px] text-slate-400 line-through">
                          ৳{p.old_price.toLocaleString()}
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      <div>
                        <span className="font-bold text-slate-800">{p.stock} units</span>
                        {p.moq && p.moq > 1 && (
                          <span className="block text-[10px] text-amber-700 font-bold mt-0.5">
                            MOQ: {p.moq} pcs
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {p.is_featured && (
                          <span className="px-2 py-0.5 rounded-md text-[9px] font-extrabold bg-amber-500 text-white shadow-2xs">
                            ★ Featured
                          </span>
                        )}
                        {p.badge && (
                          <span className="px-2 py-0.5 rounded-md text-[9px] font-extrabold bg-rose-500 text-white">
                            {p.badge}
                          </span>
                        )}
                        {!p.is_featured && !p.badge && (
                          <span className="text-[10px] text-slate-400">Standard</span>
                        )}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      {p.vendor_type === 'Importer' ? (
                        <button
                          type="button"
                          onClick={() => handleToggleCourierStatus(p)}
                          className={`px-2.5 py-1 rounded-xl text-[10px] font-bold border transition-colors cursor-pointer flex items-center gap-1 ${
                            p.courier_status === 'locked'
                              ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                          }`}
                          title="Click to toggle courier tracking lock"
                        >
                          {p.courier_status === 'locked' ? (
                            <>
                              <Lock className="w-3 h-3 text-rose-600" />
                              <span>API Locked</span>
                            </>
                          ) : (
                            <>
                              <LockOpen className="w-3 h-3 text-emerald-600" />
                              <span>Ready for BD</span>
                            </>
                          )}
                        </button>
                      ) : (
                        <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                          Local Courier
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(p)}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                          title="Edit Product"
                        >
                          <Edit className="w-3.5 h-3.5 text-[#008080]" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteProduct(p.id, p.title)}
                          className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors cursor-pointer"
                          title="Delete Product"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= ADD / EDIT PRODUCT MODAL ================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 shrink-0">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-[#008080]/10 text-[#008080]">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 font-display">
                    {editingProductId ? 'Edit Product' : 'Add New Product'}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Cascading vendor logic, AI SEO generator & logistics parameters
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body Scrollable */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
              <form id="productForm" onSubmit={handleSubmitProduct} className="space-y-6">
                {/* 1. Vendor Type Segment Selector */}
                <div>
                  <label className="block font-extrabold text-slate-800 mb-2">
                    Vendor Type (Selects Cascading Product Logic) <span className="text-rose-500">*</span>
                  </label>
                  <div className="grid grid-cols-3 gap-2 p-1.5 bg-slate-100 rounded-2xl border border-slate-200">
                    <button
                      type="button"
                      onClick={() => handleVendorTypeChange('Retailer')}
                      className={`py-2.5 px-3 rounded-xl font-black transition-all text-xs flex items-center justify-center gap-2 cursor-pointer ${
                        vendorType === 'Retailer'
                          ? 'bg-white text-[#008080] shadow-xs border border-teal-200'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <Store className="w-4 h-4" />
                      <span>Retailer</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleVendorTypeChange('Wholesaler')}
                      className={`py-2.5 px-3 rounded-xl font-black transition-all text-xs flex items-center justify-center gap-2 cursor-pointer ${
                        vendorType === 'Wholesaler'
                          ? 'bg-white text-amber-700 shadow-xs border border-amber-200'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <BarChart2 className="w-4 h-4" />
                      <span>Wholesaler</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleVendorTypeChange('Importer')}
                      className={`py-2.5 px-3 rounded-xl font-black transition-all text-xs flex items-center justify-center gap-2 cursor-pointer ${
                        vendorType === 'Importer'
                          ? 'bg-white text-indigo-700 shadow-xs border border-indigo-200'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <Globe className="w-4 h-4" />
                      <span>Importer</span>
                    </button>
                  </div>
                </div>

                {/* 2. Cascading Seller Selection Dropdown */}
                <div>
                  <label className="block font-extrabold text-slate-800 mb-1.5">
                    Select Merchant / Seller Account <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={sellerId}
                    onChange={(e) => setSellerId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-[#008080] bg-white font-bold text-slate-800"
                  >
                    {filteredSellers.length === 0 ? (
                      <option value="">No {vendorType} merchants registered yet (Uses Admin Direct Account)</option>
                    ) : (
                      filteredSellers.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.store_name || s.name} ({s.shop_id || 'ID N/A'}) - {s.email}
                        </option>
                      ))
                    )}
                  </select>
                </div>

                {/* 3. Global Core Product Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Product Name */}
                  <div className="sm:col-span-2">
                    <label className="block font-bold text-slate-800 mb-1">
                      Product Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Genuine Handcrafted Leather Wallet"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-[#008080] bg-white text-slate-900 font-bold"
                    />
                  </div>

                  {/* SKU */}
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Product SKU</label>
                    <input
                      type="text"
                      value={sku}
                      onChange={(e) => setSku(e.target.value)}
                      placeholder="ARM-RTL-8821"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 font-mono text-slate-800"
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Category <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white font-semibold text-slate-800"
                    >
                      <option value="Electronics">Electronics & Gadgets</option>
                      <option value="Fashion">Fashion & Apparel</option>
                      <option value="Ceramics">Ceramics & Handcrafts</option>
                      <option value="Kitchenware">Kitchenware & Home</option>
                      <option value="Industrial">Industrial Wholesale</option>
                      <option value="Beauty">Beauty & Personal Care</option>
                    </select>
                  </div>

                  {/* Brand */}
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Brand Name</label>
                    <input
                      type="text"
                      value={brand}
                      onChange={(e) => setBrand(e.target.value)}
                      placeholder="e.g. AR Craft / Apex"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 font-semibold text-slate-800"
                    />
                  </div>

                  {/* Price */}
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Selling Price (৳) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="1500"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 font-bold text-slate-900"
                    />
                  </div>

                  {/* Old Price */}
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Old Original Price (৳)</label>
                    <input
                      type="number"
                      value={oldPrice}
                      onChange={(e) => setOldPrice(e.target.value)}
                      placeholder="1800"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 font-medium text-slate-700"
                    />
                  </div>

                  {/* Stock Quantity */}
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Stock Quantity <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      value={stock}
                      onChange={(e) => setStock(e.target.value)}
                      placeholder="50"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 font-bold text-slate-800"
                    />
                  </div>

                  {/* Badge */}
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Product Badge Tag</label>
                    <select
                      value={badge}
                      onChange={(e) => setBadge(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white font-semibold text-slate-800"
                    >
                      <option value="">No Badge</option>
                      <option value="10% OFF">10% OFF</option>
                      <option value="20% OFF">20% OFF</option>
                      <option value="50% OFF">50% OFF</option>
                      <option value="NEW">NEW</option>
                      <option value="HOT">HOT</option>
                      <option value="BESTSELLER">BESTSELLER</option>
                    </select>
                  </div>
                </div>

                {/* 4. Vendor Specific Mandatory Parameters Section */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                  <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-2">
                    <Scale className="w-4 h-4 text-[#008080]" />
                    <span>{vendorType} Mandatory Fields & Logistics Parameters</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Weight (Mandatory for all) */}
                    <div>
                      <label className="block font-bold text-slate-800 mb-1">
                        Product Weight (kg) <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        required
                        value={weightKg}
                        onChange={(e) => setWeightKg(e.target.value)}
                        placeholder="0.5"
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-300 font-bold text-slate-800 bg-white"
                      />
                    </div>

                    {/* Minimum Order Quantity (MOQ) - Mandatory for Wholesalers */}
                    {vendorType === 'Wholesaler' && (
                      <div>
                        <label className="block font-bold text-slate-800 mb-1">
                          Minimum Order Quantity (MOQ) <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="number"
                          required
                          value={moq}
                          onChange={(e) => setMoq(e.target.value)}
                          placeholder="10"
                          className="w-full px-3.5 py-2 rounded-xl border border-amber-300 font-bold text-amber-900 bg-amber-50"
                        />
                      </div>
                    )}

                    {/* Importer Specific Mandatory Fields */}
                    {vendorType === 'Importer' && (
                      <>
                        <div>
                          <label className="block font-bold text-slate-800 mb-1">
                            Country Source <span className="text-rose-500">*</span>
                          </label>
                          <select
                            value={countrySource}
                            onChange={(e) => setCountrySource(e.target.value)}
                            className="w-full px-3.5 py-2 rounded-xl border border-indigo-300 font-bold text-indigo-900 bg-indigo-50"
                          >
                            <option value="China">China (Guangzhou / Yiwu)</option>
                            <option value="India">India (Jaipur / Delhi)</option>
                            <option value="Pakistan">Pakistan (Lahore / Karachi)</option>
                            <option value="Thailand">Thailand (Bangkok)</option>
                            <option value="UAE">UAE (Dubai)</option>
                            <option value="Vietnam">Vietnam</option>
                            <option value="Bangladesh">Bangladesh Local Import</option>
                          </select>
                        </div>

                        <div>
                          <label className="block font-bold text-slate-800 mb-1">
                            Bangladesh Import Cost (৳) <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="number"
                            required
                            value={importCostBdt}
                            onChange={(e) => setImportCostBdt(e.target.value)}
                            placeholder="250"
                            className="w-full px-3.5 py-2 rounded-xl border border-indigo-300 font-bold text-indigo-900 bg-indigo-50"
                          />
                        </div>
                      </>
                    )}

                    {/* Supplier Location */}
                    <div>
                      <label className="block font-bold text-slate-800 mb-1">Supplier Warehouse / District</label>
                      <input
                        type="text"
                        value={supplierLocation}
                        onChange={(e) => setSupplierLocation(e.target.value)}
                        placeholder="e.g. Dhaka Metro / Chittagong / Guangzhou"
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-300 font-medium text-slate-800 bg-white"
                      />
                    </div>
                  </div>

                  {/* Dynamic Shipping Charge Formula Preview */}
                  <div className="p-3 rounded-xl bg-teal-50 border border-teal-200 text-slate-800 text-[11px] leading-relaxed flex items-center gap-2">
                    <Truck className="w-4 h-4 text-[#008080] shrink-0" />
                    <div>
                      <span className="font-extrabold text-[#008080]">Dynamic Logistics Charge Formula:</span>
                      <span className="block text-slate-700">
                        Base Shipping (৳60) + ({weightKg}kg Weight × ৳20/kg)
                        {vendorType === 'Importer' ? ` + Customs Import Cost (৳${importCostBdt})` : ''} ={' '}
                        <strong className="text-slate-900 font-mono font-bold">Estimated Delivery Charge ৳{estimatedShippingFee}</strong>
                      </span>
                    </div>
                  </div>
                </div>

                {/* 5. Marketing Triggers */}
                <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/80 space-y-3">
                  <h4 className="font-extrabold text-amber-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <Flame className="w-4 h-4 text-amber-600" />
                    <span>Marketing Triggers & Special Offer Linking</span>
                  </h4>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    {/* Featured Product Checkbox */}
                    <label className="flex items-center gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isFeatured}
                        onChange={(e) => setIsFeatured(e.target.checked)}
                        className="w-4 h-4 rounded text-[#008080] focus:ring-[#008080]"
                      />
                      <span className="font-bold text-slate-900 text-xs">
                        Mark as Featured Product (Pin to Frontpage 'Best Products' carousel)
                      </span>
                    </label>

                    {/* Special Offer Select */}
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-700 text-xs shrink-0">Special Offer:</span>
                      <select
                        value={specialOfferId}
                        onChange={(e) => setSpecialOfferId(e.target.value)}
                        className="px-3 py-1.5 rounded-xl border border-amber-300 bg-white font-bold text-amber-900 text-xs focus:outline-none"
                      >
                        <option value="">No Special Offer</option>
                        <option value="flash_sale_summer">Flash Sale - 20% Off Summer</option>
                        <option value="eid_special_deal">Eid Super Saver Clearance</option>
                        <option value="wholesale_bulk_tier">Wholesale Bulk Direct Deal</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* 6. Media & Image Upload */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-800 mb-1">Product Image (File or URL)</label>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <label className="px-3.5 py-2 bg-[#008080]/10 hover:bg-[#008080]/20 text-[#008080] border border-[#008080]/30 rounded-xl font-bold transition-colors cursor-pointer inline-flex items-center gap-1.5 shrink-0">
                          <Upload className="w-3.5 h-3.5 text-[#008080]" />
                          <span>Browse Image</span>
                          <input type="file" accept="image/*" onChange={handleImageFileChange} className="hidden" />
                        </label>
                        <input
                          type="text"
                          value={imageUrl}
                          onChange={(e) => setImageUrl(e.target.value)}
                          placeholder="or paste Image URL..."
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800"
                        />
                      </div>
                      {imageUrl && (
                        <div className="w-20 h-20 rounded-xl border border-slate-200 overflow-hidden bg-slate-50">
                          <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-800 mb-1">Product Video URL (Optional)</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Video className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        value={videoUrl}
                        onChange={(e) => setVideoUrl(e.target.value)}
                        placeholder="https://youtube.com/watch?v=..."
                        className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-300 text-slate-800"
                      />
                    </div>
                  </div>
                </div>

                {/* 7. NATIVE AI META GENERATOR ENGINE (SEO & Content) */}
                <div className="p-5 rounded-2xl bg-teal-50/80 border-2 border-teal-200 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-teal-200 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-xl bg-[#008080] text-white">
                        <Sparkles className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-black text-slate-900 text-sm font-display">
                          Native AI Meta & 4-Step Description Generator
                        </h4>
                        <p className="text-[10px] text-slate-500">
                          Auto-generates structured 4-step Bengali product description & 10+ SEO Meta keywords
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={isGeneratingAi}
                      onClick={handleGenerateAiMeta}
                      className="px-4 py-2 bg-[#008080] hover:bg-[#006666] text-white font-extrabold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      <Sparkles className={`w-4 h-4 ${isGeneratingAi ? 'animate-spin' : ''}`} />
                      <span>{isGeneratingAi ? 'Generating Meta...' : 'Generate Meta with AI'}</span>
                    </button>
                  </div>

                  {aiMemoryToken && (
                    <div className="text-[10px] font-mono text-teal-800 bg-teal-100/80 px-2.5 py-1 rounded-md inline-block">
                      Memory Seed Token: {aiMemoryToken}
                    </div>
                  )}

                  {/* Structured Description (4 Steps) */}
                  <div>
                    <label className="block font-bold text-slate-800 mb-1">
                      4-Step Structured Product Description
                    </label>
                    <textarea
                      rows={6}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="১. পরিচয় ও ওভারভিউ&#10;২. কাজ ও উপযোগিতা&#10;৩. ব্যবহারের কারণ&#10;৪. আমাদের থেকে কেনার কারণ"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-teal-300 focus:outline-none focus:border-[#008080] bg-white font-medium text-slate-800 leading-relaxed resize-y"
                    />
                  </div>

                  {/* Meta Title */}
                  <div>
                    <label className="block font-bold text-slate-800 mb-1">SEO Meta Title</label>
                    <input
                      type="text"
                      value={metaTitle}
                      onChange={(e) => setMetaTitle(e.target.value)}
                      placeholder="Catchy SEO title under 60 characters..."
                      className="w-full px-3.5 py-2 rounded-xl border border-teal-300 bg-white font-semibold text-slate-900"
                    />
                  </div>

                  {/* Meta Keywords */}
                  <div>
                    <label className="block font-bold text-slate-800 mb-1">
                      SEO Meta Keywords (At least 10 comma-separated tags)
                    </label>
                    <input
                      type="text"
                      value={metaKeywords}
                      onChange={(e) => setMetaKeywords(e.target.value)}
                      placeholder="leather wallet, mens wallet, BD price, AR Market, wholesale wallet..."
                      className="w-full px-3.5 py-2 rounded-xl border border-teal-300 bg-white font-mono text-slate-800"
                    />
                  </div>

                  {/* Meta Description */}
                  <div>
                    <label className="block font-bold text-slate-800 mb-1">SEO Meta Description</label>
                    <textarea
                      rows={2}
                      value={metaDescription}
                      onChange={(e) => setMetaDescription(e.target.value)}
                      placeholder="Engaging meta description snippet for Google Search..."
                      className="w-full px-3.5 py-2 rounded-xl border border-teal-300 bg-white font-medium text-slate-800"
                    />
                  </div>
                </div>
              </form>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="productForm"
                disabled={isSaving}
                className="px-6 py-2.5 bg-[#008080] hover:bg-[#006666] text-white font-extrabold rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSaving ? 'Saving Product...' : editingProductId ? 'Update Product' : 'Publish Product'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
