import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, Check, Tag, Plus, Globe } from 'lucide-react';
import { brandService, BrandItem } from '../../services/brandService';

interface BrandSelectDropdownProps {
  value: string;
  onChange: (brandName: string) => void;
  className?: string;
  placeholder?: string;
  error?: string;
}

export const BrandSelectDropdown: React.FC<BrandSelectDropdownProps> = ({
  value,
  onChange,
  className = '',
  placeholder = 'Select or search brand...',
  error,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [brands, setBrands] = useState<BrandItem[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Load brands from brandService
  useEffect(() => {
    const list = brandService.getBrands();
    setBrands(list);
  }, [isOpen]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Filter brands based on search query
  const filteredBrands = brands.filter((b) =>
    b.name.toLowerCase().includes(searchQuery.toLowerCase().trim())
  );

  // Find currently selected brand
  const selectedBrand = brands.find(
    (b) => b.name.toLowerCase() === (value || '').toLowerCase()
  );

  const handleSelect = (brandName: string) => {
    onChange(brandName);
    setIsOpen(false);
    setSearchQuery('');
  };

  const handleAddCustomBrand = () => {
    if (!searchQuery.trim()) return;
    const newBrand = brandService.addBrand(searchQuery.trim());
    setBrands(brandService.getBrands());
    onChange(newBrand.name);
    setIsOpen(false);
    setSearchQuery('');
  };

  const hasExactMatch = brands.some(
    (b) => b.name.toLowerCase() === searchQuery.trim().toLowerCase()
  );

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Hidden input for form sync */}
      <input
        type="text"
        value={value}
        onChange={() => {}}
        className="sr-only"
        tabIndex={-1}
      />

      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-3.5 py-2.5 rounded-xl border bg-white text-left transition-all cursor-pointer flex items-center justify-between gap-2 shadow-2xs ${
          isOpen
            ? 'border-[#008080] ring-2 ring-[#008080]/15'
            : error
            ? 'border-rose-300'
            : 'border-slate-300 hover:border-slate-400'
        }`}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          {selectedBrand ? (
            <>
              {/* Brand Logo / Badge */}
              <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center p-1">
                {selectedBrand.logo_url ? (
                  <img
                    src={selectedBrand.logo_url}
                    alt={selectedBrand.name}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-[#008080]/10 text-[#008080] font-black text-[10px] rounded flex items-center justify-center tracking-tighter">
                    {selectedBrand.name.slice(0, 3).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <span className="font-bold text-xs text-slate-900 block truncate">
                  {selectedBrand.name}
                </span>
                <span className="text-[10px] text-slate-400 block truncate">
                  {selectedBrand.origin ? `${selectedBrand.origin} Brand` : 'Verified Brand'}
                </span>
              </div>
            </>
          ) : value ? (
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-200 text-[#008080] font-bold text-[10px] flex items-center justify-center shrink-0">
                {value.slice(0, 3).toUpperCase()}
              </div>
              <div className="min-w-0">
                <span className="font-bold text-xs text-slate-900 truncate block">{value}</span>
                <span className="text-[10px] text-teal-600 block">Custom Brand</span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-slate-400">
              <div className="w-8 h-8 rounded-lg bg-slate-50 border border-dashed border-slate-200 flex items-center justify-center shrink-0">
                <Tag className="w-4 h-4 text-slate-300" />
              </div>
              <span className="text-xs font-semibold">{placeholder}</span>
            </div>
          )}
        </div>

        <ChevronDown
          className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-[#008080]' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu Modal */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-100 flex flex-col max-h-72">
          {/* Search Header */}
          <div className="p-2.5 border-b border-slate-100 bg-slate-50/80 shrink-0">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
                <Search className="w-3.5 h-3.5" />
              </div>
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search or enter brand name..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-white rounded-lg border border-slate-200 focus:outline-none focus:border-[#008080] font-medium text-slate-800"
              />
            </div>
          </div>

          {/* Brands List */}
          <div className="overflow-y-auto p-1.5 space-y-1 flex-1 scrollbar-thin scrollbar-thumb-slate-200">
            {/* Custom Brand Option if user types something not in list */}
            {searchQuery.trim() && !hasExactMatch && (
              <button
                type="button"
                onClick={handleAddCustomBrand}
                className="w-full flex items-center gap-2 p-2 rounded-xl text-left bg-teal-50/60 hover:bg-teal-50 border border-teal-200 text-[#008080] font-bold text-xs transition-colors cursor-pointer"
              >
                <div className="w-8 h-8 rounded-lg bg-[#008080] text-white flex items-center justify-center shrink-0">
                  <Plus className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="block truncate">Use &quot;{searchQuery.trim()}&quot; as Brand</span>
                  <span className="text-[10px] text-teal-600 block">Add to platform brand catalog</span>
                </div>
              </button>
            )}

            {filteredBrands.length === 0 && !searchQuery.trim() ? (
              <div className="p-4 text-center text-xs text-slate-400">
                No brands available
              </div>
            ) : (
              filteredBrands.map((b) => {
                const isSelected = b.name.toLowerCase() === (value || '').toLowerCase();
                return (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => handleSelect(b.name)}
                    className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-teal-50/80 border border-teal-200 text-[#008080]'
                        : 'hover:bg-slate-50 border border-transparent text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {/* Logo Box */}
                      <div className="w-9 h-9 rounded-lg border border-slate-200 bg-white overflow-hidden shrink-0 flex items-center justify-center p-1 shadow-2xs">
                        {b.logo_url ? (
                          <img
                            src={b.logo_url}
                            alt={b.name}
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="w-full h-full bg-[#008080]/10 text-[#008080] font-extrabold text-[10px] rounded flex items-center justify-center">
                            {b.name.slice(0, 3).toUpperCase()}
                          </div>
                        )}
                      </div>

                      {/* Name & Origin */}
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 truncate leading-snug">
                          {b.name}
                        </p>
                        <p className="text-[10px] text-slate-400 truncate flex items-center gap-1">
                          {b.origin && <span>{b.origin}</span>}
                          {b.productsCount && (
                            <>
                              <span>•</span>
                              <span>{b.productsCount}+ items</span>
                            </>
                          )}
                        </p>
                      </div>
                    </div>

                    {isSelected && (
                      <div className="p-1 rounded-full bg-[#008080] text-white shrink-0 ml-2">
                        <Check className="w-3 h-3" />
                      </div>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
