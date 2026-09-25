import React, { useRef, useState } from 'react';
import { UploadCloud, X, Image as ImageIcon, CheckCircle2, AlertCircle } from 'lucide-react';

interface KycFileUploadProps {
  label: string;
  required?: boolean;
  value: string;
  onChange: (value: string) => void;
  helperText?: string;
  aspectHint?: string;
}

export const KycFileUpload: React.FC<KycFileUploadProps> = ({
  label,
  required = false,
  value,
  onChange,
  helperText = 'Supports JPG, PNG, JPEG up to 5MB',
  aspectHint,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fileDetails, setFileDetails] = useState<{ name: string; size: string } | null>(null);

  const processFile = (file: File) => {
    setErrorMessage(null);

    // Validate image mime type
    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please select a valid image file (JPG, PNG, or JPEG).');
      return;
    }

    // Validate size (max 5MB)
    const maxBytes = 5 * 1024 * 1024;
    if (file.size > maxBytes) {
      setErrorMessage('File size exceeds 5MB limit. Please choose a smaller image.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result;
      if (typeof result === 'string') {
        onChange(result);
        setFileDetails({
          name: file.name,
          size: (file.size / 1024).toFixed(1) + ' KB',
        });
      }
    };
    reader.onerror = () => {
      setErrorMessage('Failed to read selected image. Please try again.');
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    setFileDetails(null);
    setErrorMessage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold text-slate-700">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
        {aspectHint && (
          <span className="text-[10px] text-slate-400 font-medium">{aspectHint}</span>
        )}
      </div>

      {/* Hidden native input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/jpg,image/webp"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* When no image is selected -> Drag & Drop Dropzone */}
      {!value ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center gap-2.5 ${
            isDragging
              ? 'border-[#008080] bg-[#008080]/10 scale-[1.01]'
              : 'border-slate-300 hover:border-[#008080] bg-slate-50/70 hover:bg-[#008080]/5'
          }`}
        >
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-[#008080] flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
            <UploadCloud className="w-5 h-5 text-[#008080]" />
          </div>

          <div>
            <div className="text-xs font-bold text-slate-800">
              <span className="text-[#008080] underline underline-offset-2">Click to browse</span> or drag & drop image
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">{helperText}</p>
          </div>
        </div>
      ) : (
        /* When image is selected -> Live Preview with Close/Delete button */
        <div className="relative rounded-2xl border border-slate-200 bg-white p-3 shadow-2xs group">
          {/* Top-Right Prominent Close / Delete Button */}
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-2.5 right-2.5 p-1.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white shadow-md hover:scale-110 active:scale-95 transition-all cursor-pointer z-10 flex items-center justify-center"
            title="Remove image and re-upload"
            aria-label="Remove image"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Live Image Thumbnail Preview */}
          <div className="relative w-full h-44 rounded-xl overflow-hidden bg-slate-100 border border-slate-200/80 flex items-center justify-center">
            <img
              src={value}
              alt={label}
              className="w-full h-full object-contain"
              onError={() => setErrorMessage('Unable to preview image file.')}
            />
          </div>

          {/* Preview Details & Status */}
          <div className="mt-2.5 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-emerald-700 font-bold text-[11px]">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="truncate max-w-[180px]">
                {fileDetails ? fileDetails.name : 'Image uploaded ready'}
              </span>
              {fileDetails && (
                <span className="text-[10px] text-slate-400 font-medium">
                  ({fileDetails.size})
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-[11px] font-bold text-[#008080] hover:underline cursor-pointer"
            >
              Change Photo
            </button>
          </div>
        </div>
      )}

      {/* Error message */}
      {errorMessage && (
        <div className="flex items-center gap-1.5 text-xs text-rose-600 pt-0.5 animate-in fade-in">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
};
