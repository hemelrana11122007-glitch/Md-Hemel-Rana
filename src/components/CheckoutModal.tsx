import React, { useState } from 'react';
import {
  X,
  Truck,
  ShieldCheck,
  MapPin,
  Scale,
  DollarSign,
  PackageCheck,
  Building2,
  Globe,
  Boxes,
  ArrowRight,
  CheckCircle2,
  Layers,
} from 'lucide-react';
import { CartItem } from '../types/marketplace';
import { deliverySettingsService, INITIAL_DISTRICTS } from '../services/deliverySettings';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onClearCart: () => void;
  onShowToast: (message: string) => void;
  onOrderPlaced?: (order: any) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  cart,
  onClearCart,
  onShowToast,
  onOrderPlaced,
}) => {
  const [selectedDistrict, setSelectedDistrict] = useState<string>('Dhaka');
  const [deliveryAddress, setDeliveryAddress] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string>('Cash on Delivery (COD)');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!isOpen) return null;

  // Perform server-side calculation & smart order grouping
  const calcResult = deliverySettingsService.calculateCheckoutDelivery(cart, selectedDistrict);
  const itemsSubtotal = cart.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
  const grandTotal = itemsSubtotal + calcResult.finalTotalDeliveryCharge;

  const handlePlaceOrder = () => {
    if (cart.length === 0) {
      onShowToast('Your cart is empty.');
      return;
    }

    setIsSubmitting(true);

    const orderData = {
      id: `ORD-2026-${Math.floor(10000 + Math.random() * 90000)}`,
      created_at: new Date().toISOString(),
      district: selectedDistrict,
      delivery_address: deliveryAddress || `${selectedDistrict}, Bangladesh`,
      payment_method: paymentMethod,
      total_items: cart.length,
      subtotal: itemsSubtotal,
      total_weight_kg: calcResult.totalWeightKg,
      base_charge: calcResult.totalBaseCharge,
      weight_charge: calcResult.totalWeightCharge,
      import_cost: calcResult.totalImportCost,
      final_delivery_charge: calcResult.finalTotalDeliveryCharge,
      grand_total: grandTotal,
      shipment_groups: calcResult.shipmentGroups,
      items: cart.map((i) => ({
        product_id: i.product.id,
        title: i.product.title,
        quantity: i.quantity,
        price: i.product.price,
        segment: i.product.segment,
        seller_id: i.product.seller?.id || 'admin_store',
        seller_name: i.product.seller?.name || 'AR Market Official Store',
        weight_kg: i.product.weight_kg || (i.product.segment === 'import' ? 1.5 : 0.5),
        import_cost: i.product.bd_import_cost || 0,
      })),
      status: 'pending',
    };

    setTimeout(() => {
      setIsSubmitting(false);
      onShowToast(
        `Order ${orderData.id} placed successfully! Delivery calculated for ${selectedDistrict}.`
      );
      if (onOrderPlaced) {
        onOrderPlaced(orderData);
      }
      onClearCart();
      onClose();
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-[#008080]/10 text-[#008080] border border-[#008080]/20">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 tracking-tight font-display">
                Multi-Vendor Escrow Checkout
              </h2>
              <p className="text-xs text-slate-500">
                District base rates, cumulative weight rules & import cost calculation
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs flex-1">
          {/* Step 1: Destination District Selection */}
          <div className="bg-teal-50/60 border border-teal-200 p-4 rounded-2xl space-y-3">
            <div className="flex items-center gap-2 text-xs font-black text-[#008080] uppercase tracking-wider">
              <MapPin className="w-4 h-4 text-[#008080]" />
              <span>Select Delivery Destination District (৬৪টি জেলা)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Delivery District <span className="text-rose-500">*</span>
                </label>
                <select
                  value={selectedDistrict}
                  onChange={(e) => setSelectedDistrict(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-teal-300 font-extrabold text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#008080]/20 text-xs"
                >
                  {INITIAL_DISTRICTS.map((d) => (
                    <option key={d.id} value={d.name}>
                      {d.name} ({d.bn_name}) - Base ৳{d.base_charge} ({d.division} Div)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Street / Area Address Detail
                </label>
                <input
                  type="text"
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  placeholder="e.g. House 12, Road 4, Sector 7, Uttara"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-800 bg-white focus:outline-none focus:border-[#008080]"
                />
              </div>
            </div>

            <p className="text-[11px] text-teal-800 font-medium">
              Selected District Base Charge: <strong>৳{calcResult.totalBaseCharge > 0 ? (calcResult.shipmentGroups[0]?.baseCharge || 60) : 60}</strong> (First 1.0 KG included). Extra weight charged at <strong>৳{calcResult.extraPerKgRate}/KG</strong>.
            </p>
          </div>

          {/* Step 2: Smart Order Grouping - Per Seller Shipment Breakdown */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-sm text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Boxes className="w-4 h-4 text-[#008080]" />
                <span>Smart Order Grouping & Seller Shipments ({calcResult.shipmentGroups.length} Separate Shipments)</span>
              </h3>
              <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
                Total Weight: {calcResult.totalWeightKg} KG
              </span>
            </div>

            <div className="space-y-4">
              {calcResult.shipmentGroups.map((group, groupIdx) => (
                <div
                  key={group.sellerId + groupIdx}
                  className="p-4 rounded-2xl border border-slate-200 bg-white shadow-2xs space-y-3"
                >
                  {/* Seller Header */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-[#008080]" />
                      <span className="font-extrabold text-xs text-slate-900">{group.sellerName}</span>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-teal-50 text-[#008080] border border-teal-200">
                        Shipment #{groupIdx + 1}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] font-bold text-slate-600">
                      <span>Combined Weight: <strong>{group.combinedWeightKg} KG</strong></span>
                    </div>
                  </div>

                  {/* Items List in this Shipment */}
                  <div className="space-y-2 divide-y divide-slate-100">
                    {group.items.map((item, idx) => (
                      <div key={idx} className="pt-2 first:pt-0 flex items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-2 flex-1">
                          <PackageCheck className="w-4 h-4 text-slate-400 shrink-0" />
                          <div>
                            <p className="font-bold text-slate-800 line-clamp-1">{item.productTitle}</p>
                            <p className="text-[10px] text-slate-500 flex items-center gap-2">
                              <span>Segment: <strong className="capitalize">{item.segment}</strong></span>
                              <span>•</span>
                              <span>Weight: {item.unitWeightKg} KG/unit</span>
                              {item.segment === 'import' && (
                                <>
                                  <span>•</span>
                                  <span className="text-indigo-600 font-bold flex items-center gap-1">
                                    <Globe className="w-3 h-3" /> {item.originCountry} (Import Cost: ৳{item.importCostUnit})
                                  </span>
                                </>
                              )}
                            </p>
                          </div>
                        </div>

                        <div className="text-right">
                          <p className="font-bold text-slate-900">
                            {item.quantity} × ৳{item.price.toLocaleString()}
                          </p>
                          <p className="text-[10px] text-slate-500 font-mono">
                            Subtotal: ৳{(item.quantity * item.price).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Shipment Group Cost Breakdown Box */}
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5 text-[11px]">
                    <div className="flex justify-between text-slate-600">
                      <span>District Base Delivery Charge ({selectedDistrict})</span>
                      <span className="font-bold text-slate-900">৳{group.baseCharge}</span>
                    </div>

                    <div className="flex justify-between text-slate-600">
                      <span>
                        Extra Weight Charge ({group.extraWeightKg > 0 ? `${group.extraWeightKg} KG extra × ৳${calcResult.extraPerKgRate}` : 'First 1.0 KG Included'})
                      </span>
                      <span className="font-bold text-slate-900">৳{group.weightCharge}</span>
                    </div>

                    {group.importCost > 0 && (
                      <div className="flex justify-between text-indigo-700 font-medium">
                        <span className="flex items-center gap-1">
                          <Globe className="w-3.5 h-3.5" /> Bangladesh Import Duty & Port Handling Cost
                        </span>
                        <span className="font-black text-indigo-900">৳{group.importCost}</span>
                      </div>
                    )}

                    <div className="flex justify-between font-extrabold text-slate-900 pt-1.5 border-t border-slate-200 text-xs">
                      <span>Shipment Total Delivery Fee</span>
                      <span className="text-[#008080]">৳{group.totalDeliveryCharge.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Method Selection */}
          <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-2">
            <label className="block text-xs font-black text-slate-800 uppercase tracking-wider">
              Select Escrow Payment Gateway
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {['Cash on Delivery (COD)', 'bKash Direct Escrow', 'Nagad Payment Gateway'].map((pm) => (
                <button
                  key={pm}
                  type="button"
                  onClick={() => setPaymentMethod(pm)}
                  className={`p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    paymentMethod === pm
                      ? 'bg-white text-[#008080] border-[#008080] ring-2 ring-[#008080]/20 shadow-xs'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {pm}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Sticky Footer - Grand Totals & Place Order Button */}
        <div className="p-5 border-t border-slate-200 bg-white space-y-3">
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Products Subtotal ({cart.reduce((sum, i) => sum + i.quantity, 0)} Items)</span>
              <span className="font-bold text-slate-900">৳{itemsSubtotal.toLocaleString()}</span>
            </div>

            <div className="flex justify-between text-slate-600">
              <span>Total District Base Shipping ({calcResult.shipmentGroups.length} Shipments)</span>
              <span className="font-bold text-slate-900">৳{calcResult.totalBaseCharge.toLocaleString()}</span>
            </div>

            {calcResult.totalWeightCharge > 0 && (
              <div className="flex justify-between text-slate-600">
                <span>Total Cumulative Extra Weight Charge</span>
                <span className="font-bold text-slate-900">৳{calcResult.totalWeightCharge.toLocaleString()}</span>
              </div>
            )}

            {calcResult.totalImportCost > 0 && (
              <div className="flex justify-between text-indigo-700">
                <span>Total Import Cost (Customs & Logistics)</span>
                <span className="font-bold text-indigo-900">৳{calcResult.totalImportCost.toLocaleString()}</span>
              </div>
            )}

            <div className="flex justify-between text-sm font-black text-slate-900 pt-2 border-t border-slate-200">
              <span>Grand Total Amount</span>
              <span className="text-xl text-[#008080] font-mono">
                ৳{grandTotal.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between gap-4 pt-1">
            <div className="flex items-center gap-2 text-[11px] text-slate-500">
              <ShieldCheck className="w-4 h-4 text-[#008080] shrink-0" />
              <span>Multi-Vendor Escrow Protection Active</span>
            </div>

            <button
              type="button"
              onClick={handlePlaceOrder}
              disabled={isSubmitting || cart.length === 0}
              className="px-6 py-3 bg-[#008080] hover:bg-[#006666] text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Generating Order...</span>
              ) : (
                <>
                  <span>Confirm & Place Order</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
