import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, Check, X } from 'lucide-react';

interface Option {
  value: string;
  label: string;
  sublabel?: string;
}

interface SearchableSelectProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  emptyLabel?: string;
  noneOptionLabel?: string;
  className?: string;
  error?: string;
}

export const SearchableSelect: React.FC<SearchableSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Tìm kiếm...',
  emptyLabel = 'Không tìm thấy kết quả',
  noneOptionLabel = '-- Không có / Chưa rõ --',
  className = '',
  error,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Sync / Reset search when open changes
  useEffect(() => {
    if (isOpen) {
      setSearch('');
      // Autofocus search input
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const selectedOption = options.find((opt) => opt.value === value);

  // Normalized search function (removes Vietnamese accents for robust searching)
  const removeAccents = (str: string): string => {
    return str
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'D');
  };

  const filteredOptions = options.filter((opt) => {
    if (!search.trim()) return true;
    const searchNorm = removeAccents(search.toLowerCase());
    const labelNorm = removeAccents(opt.label.toLowerCase());
    const sublabelNorm = opt.sublabel ? removeAccents(opt.sublabel.toLowerCase()) : '';
    
    return labelNorm.includes(searchNorm) || sublabelNorm.includes(searchNorm);
  });

  const handleSelect = (val: string) => {
    onChange(val);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`} ref={containerRef} id={`searchable-select-container-${value || 'none'}`}>
      {/* Selector Trigger */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full p-2.5 border rounded bg-white flex items-center justify-between cursor-pointer select-none transition-all duration-200 hover:border-[#b8956b] shadow-2xs ${
          isOpen ? 'border-[#b8956b] ring-1 ring-[#b8956b]/20' : 'border-[#d6b583]'
        } ${error ? 'border-red-500 hover:border-red-600' : ''}`}
      >
        <span className={`truncate text-sm ${selectedOption ? 'text-gray-900 font-medium' : 'text-gray-400'}`}>
          {selectedOption ? selectedOption.label : noneOptionLabel}
          {selectedOption?.sublabel && (
            <span className="text-xs text-gray-400 font-normal ml-2">({selectedOption.sublabel})</span>
          )}
        </span>
        <div className="flex items-center gap-1 text-gray-400 shrink-0">
          {value && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onChange('');
              }}
              className="p-0.5 rounded-full hover:bg-gray-100 hover:text-gray-600 cursor-pointer"
              title="Xóa lựa chọn"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180 text-amber-700' : ''}`} />
        </div>
      </div>

      {/* Dropdown Options Panel */}
      {isOpen && (
        <div className="absolute z-[100] mt-1.5 w-full bg-white border border-[#d6b583] rounded-lg shadow-xl overflow-hidden flex flex-col max-h-[300px] animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Search Header */}
          <div className="p-2 border-b border-amber-100 bg-amber-50/30 flex items-center gap-2">
            <Search className="w-4 h-4 text-amber-700/60 shrink-0" />
            <input
              ref={searchInputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={placeholder}
              className="w-full text-sm bg-transparent border-none outline-none focus:ring-0 placeholder-gray-400 py-0.5"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="p-0.5 text-gray-400 hover:text-gray-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Options List */}
          <div className="overflow-y-auto flex-1 py-1 max-h-[220px]">
            {/* None Option */}
            {!search.trim() && (
              <div
                onClick={() => handleSelect('')}
                className={`flex items-center justify-between px-3.5 py-2 text-xs font-semibold cursor-pointer transition-colors ${
                  value === ''
                    ? 'bg-amber-50 text-amber-900 border-l-2 border-amber-600'
                    : 'text-gray-500 hover:bg-amber-50/40 hover:text-amber-900'
                }`}
              >
                <span>{noneOptionLabel}</span>
                {value === '' && <Check className="w-3.5 h-3.5 text-amber-600" />}
              </div>
            )}

            {/* Filtered Options */}
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => {
                const isSelected = value === opt.value;
                return (
                  <div
                    key={opt.value}
                    onClick={() => handleSelect(opt.value)}
                    className={`flex items-center justify-between px-3.5 py-2.5 text-sm cursor-pointer border-b border-amber-50/40 last:border-0 transition-colors ${
                      isSelected
                        ? 'bg-amber-50 text-amber-900 font-semibold border-l-2 border-amber-600'
                        : 'text-gray-700 hover:bg-amber-50/40 hover:text-amber-900'
                    }`}
                  >
                    <div className="flex flex-col min-w-0 pr-2">
                      <span className="truncate font-medium">{opt.label}</span>
                      {opt.sublabel && (
                        <span className="text-[10px] text-gray-400 font-normal truncate mt-0.5">{opt.sublabel}</span>
                      )}
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-amber-600 shrink-0" />}
                  </div>
                );
              })
            ) : (
              <div className="text-center py-4 text-xs text-gray-400 italic">
                {emptyLabel}
              </div>
            )}
          </div>
        </div>
      )}

      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
};
