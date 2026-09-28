import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, Check, Layers, Image as ImageIcon } from 'lucide-react';
import { categoryService, CategoryItem } from '../../services/categoryService';

interface CategorySelectDropdownProps {
  value: string;
  onChange: (categoryName: string) => void;
  required?: boolean;
  className?: string;
  error?: string;
}

export const CategorySelectDropdown: React.FC<CategorySelectDropdownProps> = ({
  value,
  onChange,
  required = false,
  className = '',
  error,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Load categories from categoryService
  useEffect(() => {
    const list = categoryService.getCategories();
    setCategories(list);
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
      // Auto-focus search input
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Filter categories based on search query
  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase().trim())
  );

  // Find currently selected category object
  const selectedCategory = categories.find(
    (c) => c.name.toLowerCase() === (value || '').toLowerCase()
  );

  const handleSelect = (catName: string) => {
    onChange(catName);
    setIsOpen(false);
    setSearchQuery('');
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Hidden input for HTML form requirement */}
      <input
        type="text"
        required={required}
        value={value}
        onChange={() => {}}
        className="sr-only"
        tabIndex={-1}
      />

      {/* Dropdown Trigger Button */}
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
          {selectedCategory ? (
            <>
              {/* Category Logo/Thumbnail */}
              <div className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-100 overflow-hidden shrink-0 flex items-center justify-center">
                {selectedCategory.logo_url ? (
                  <img
                    src={selectedCategory.logo_url}
                    alt={selectedCategory.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Fallback if image load fails
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                ) : (
                  <Layers className="w-4 h-4 text-[#008080]" />
                )}
              </div>
              <div className="min-w-0">
                <span className="font-bold text-xs text-slate-900 block truncate">
                  {selectedCategory.name}
                </span>
                <span className="text-[10px] text-slate-400 block truncate">
                  {selectedCategory.itemCount ? `${selectedCategory.itemCount.toLocaleString()} items in catalog` : 'Active Category'}
                </span>
              </div>
            </>
          ) : value ? (
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                <Layers className="w-4 h-4 text-slate-500" />
              </div>
              <span className="font-bold text-xs text-slate-900 truncate">{value}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-slate-400">
              <div className="w-8 h-8 rounded-lg bg-slate-50 border border-dashed border-slate-200 flex items-center justify-center shrink-0">
                <ImageIcon className="w-4 h-4 text-slate-300" />
              </div>
              <span className="text-xs font-semibold">Select Category with Logo...</span>
            </div>
          )}
        </div>

        <ChevronDown
          className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-[#008080]' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu Modal/Popover */}
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
                placeholder="Search category by name..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-white rounded-lg border border-slate-200 focus:outline-none focus:border-[#008080] font-medium text-slate-800"
              />
            </div>
          </div>

          {/* Category Items List */}
          <div className="overflow-y-auto p-1.5 space-y-1 flex-1 scrollbar-thin scrollbar-thumb-slate-200">
            {filteredCategories.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-400">
                No categories found matching &quot;{searchQuery}&quot;
              </div>
            ) : (
              filteredCategories.map((cat) => {
                const isSelected = cat.name.toLowerCase() === (value || '').toLowerCase();
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleSelect(cat.name)}
                    className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-teal-50/80 border border-teal-200 text-[#008080]'
                        : 'hover:bg-slate-50 border border-transparent text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {/* Logo / Thumbnail Box */}
                      <div className="w-9 h-9 rounded-lg border border-slate-200 bg-slate-100 overflow-hidden shrink-0 flex items-center justify-center shadow-2xs">
                        {cat.logo_url ? (
                          <img
                            src={cat.logo_url}
                            alt={cat.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        ) : (
                          <Layers className="w-4 h-4 text-slate-400" />
                        )}
                      </div>

                      {/* Name & Count */}
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 truncate leading-snug">
                          {cat.name}
                        </p>
                        <p className="text-[10px] text-slate-400 truncate">
                          {cat.itemCount ? `${cat.itemCount.toLocaleString()} products` : 'Verified Category'}
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
