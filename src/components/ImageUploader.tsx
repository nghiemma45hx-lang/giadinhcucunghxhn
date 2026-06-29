import React, { useState, useRef } from 'react';
import { Upload, Trash2, Image as ImageIcon, Link2, Check, Loader2, RefreshCw } from 'lucide-react';

interface ImageUploaderProps {
  id?: string;
  value: string;
  onChange: (url: string) => void;
  label?: string;
  placeholder?: string;
  className?: string;
}

export const getGoogleDriveDirectLink = (url: string): string => {
  if (!url) return '';
  const trimmed = url.trim();
  
  // 1. Check format: https://drive.google.com/file/d/FILE_ID/view...
  const fileDMatch = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (fileDMatch && fileDMatch[1]) {
    return `https://drive.google.com/uc?export=download&id=${fileDMatch[1]}`;
  }
  
  // 2. Check format: https://drive.google.com/open?id=FILE_ID
  const idParamMatch = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (idParamMatch && idParamMatch[1]) {
    return `https://drive.google.com/uc?export=download&id=${idParamMatch[1]}`;
  }
  
  // 3. Check format: https://docs.google.com/uc?id=FILE_ID
  const docMatch = trimmed.match(/\/uc\?id=([a-zA-Z0-9_-]+)/);
  if (docMatch && docMatch[1]) {
    return `https://drive.google.com/uc?export=download&id=${docMatch[1]}`;
  }

  return trimmed;
};

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  id,
  value,
  onChange,
  label,
  placeholder = 'Dán liên kết ảnh Unsplash, Google Drive hoặc chọn ảnh tải lên...',
  className = '',
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inputVal, setInputVal] = useState(value);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync state with value from prop
  React.useEffect(() => {
    setInputVal(value);
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputVal(val);
    onChange(val);
  };

  const handleInputBlur = () => {
    const converted = getGoogleDriveDirectLink(inputVal);
    if (converted !== inputVal) {
      setInputVal(converted);
      onChange(converted);
    }
  };

  const handleConvertClick = () => {
    const converted = getGoogleDriveDirectLink(inputVal);
    if (converted !== inputVal) {
      setInputVal(converted);
      onChange(converted);
      setError(null);
    } else {
      setError('Liên kết này không có dạng Google Drive chia sẻ hoặc đã là link trực tiếp.');
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    
    // Check file size limit (5MB max for fast uploads)
    if (file.size > 10 * 1024 * 1024) {
      setError('Kích thước tệp quá lớn (Tối đa 10MB)');
      return;
    }

    if (!file.type.startsWith('image/')) {
      setError('Chỉ chấp nhận tệp hình ảnh (.jpg, .jpeg, .png, .webp, .gif)');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      // Read file to Base64
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64Data = event.target?.result as string;
        if (!base64Data) {
          setError('Không thể đọc dữ liệu ảnh.');
          setIsUploading(false);
          return;
        }

        try {
          const response = await fetch('/api/upload-image', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              fileName: file.name,
              base64Data,
            }),
          });

          if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.error || 'Lỗi từ máy chủ khi tải ảnh lên.');
          }

          const data = await response.json();
          if (data.url) {
            onChange(data.url);
            setInputVal(data.url);
          } else {
            throw new Error('Không nhận được đường dẫn ảnh từ máy chủ.');
          }
        } catch (uploadErr: any) {
          console.error(uploadErr);
          setError(uploadErr.message || 'Lỗi kết nối máy chủ.');
        } finally {
          setIsUploading(false);
        }
      };

      reader.onerror = () => {
        setError('Lỗi khi đọc tệp tin.');
        setIsUploading(false);
      };

      reader.readAsDataURL(file);
    } catch (err: any) {
      setError('Không thể tải tệp tin.');
      setIsUploading(false);
    }
  };

  const handleDeleteImage = async () => {
    if (!value) return;

    if (window.confirm('Bạn có chắc chắn muốn xóa ảnh này?')) {
      const oldVal = value;
      // Set to empty first
      onChange('');
      setInputVal('');
      setError(null);

      try {
        // Try deleting the actual file on server
        await fetch('/api/delete-image', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ url: oldVal }),
        });
      } catch (err) {
        console.warn('Could not delete old image file from server:', err);
      }
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const isGoogleDriveLink = inputVal.toLowerCase().includes('drive.google.com') || inputVal.toLowerCase().includes('docs.google.com');

  return (
    <div id={id} className={`space-y-2 ${className}`}>
      {label && (
        <label className="block text-xs font-bold text-[#6b4724] mb-1">
          {label}
        </label>
      )}

      <div className="flex flex-col sm:flex-row gap-3 items-stretch">
        {/* URL Input Area */}
        <div className="relative flex-1">
          <input
            type="text"
            value={inputVal}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            placeholder={placeholder}
            className="w-full pl-9 pr-24 py-2 text-xs border border-[#d6b583] rounded-lg bg-white font-medium focus:ring-1 focus:ring-[#b8956b] focus:outline-none h-10"
          />
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            {isUploading ? (
              <Loader2 className="w-4 h-4 animate-spin text-[#b8956b]" />
            ) : (
              <Link2 className="w-4 h-4 text-[#b8956b]" />
            )}
          </div>

          {/* Quick Action buttons inside input */}
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {isGoogleDriveLink && (
              <button
                type="button"
                onClick={handleConvertClick}
                title="Chuyển đổi link Google Drive sang link trực tiếp"
                className="px-2 py-1 text-[10px] bg-amber-500 hover:bg-amber-600 text-white font-bold rounded transition flex items-center gap-0.5"
              >
                <RefreshCw className="w-3 h-3" />
                Chuyển link
              </button>
            )}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-2">
          {/* File Input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />
          <button
            type="button"
            onClick={handleBrowseClick}
            disabled={isUploading}
            className="px-3 py-2 text-xs bg-white border border-[#d6b583] text-[#6b4724] hover:bg-[#fdfbf7] font-bold rounded-lg transition flex items-center gap-1.5 h-10 disabled:opacity-50"
          >
            {isUploading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Upload className="w-3.5 h-3.5 text-[#b8956b]" />
            )}
            Tải ảnh từ máy
          </button>

          {value && (
            <button
              type="button"
              onClick={handleDeleteImage}
              className="px-3 py-2 text-xs bg-rose-50 border border-rose-200 text-rose-600 hover:bg-rose-100 font-bold rounded-lg transition flex items-center gap-1.5 h-10"
              title="Xóa hình ảnh này"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Xóa ảnh
            </button>
          )}
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <p className="text-[10px] font-semibold text-rose-600 flex items-center gap-1">
          <span>⚠️</span> {error}
        </p>
      )}

      {/* Live Image Preview Thumbnail */}
      {value && (
        <div className="flex items-start gap-3 p-2 bg-[#fdfbf7] border border-[#eadecb] rounded-lg shadow-2xs">
          <div className="relative w-16 h-16 rounded border border-gray-200 overflow-hidden bg-gray-50 flex items-center justify-center shrink-0 shadow-2xs">
            <img
              src={value}
              alt="Preview"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
              onError={(e) => {
                // If direct link fails (e.g. invalid url), show placeholder
                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=300';
              }}
            />
          </div>
          <div className="space-y-1 overflow-hidden">
            <p className="text-[10px] font-bold text-[#6b4724] flex items-center gap-1">
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              Đã tải liên kết ảnh thành công
            </p>
            <p className="text-[9px] font-mono text-gray-400 truncate max-w-xs sm:max-w-md">
              {value}
            </p>
            {value.startsWith('data:') && (
              <span className="inline-block text-[8px] bg-[#eadecb] text-[#6b4724] font-bold px-1.5 rounded-sm">
                Ảnh Base64 nội bộ
              </span>
            )}
            {value.startsWith('/uploads/') && (
              <span className="inline-block text-[8px] bg-emerald-100 text-emerald-800 font-bold px-1.5 rounded-sm">
                Đã tải lên Máy chủ
              </span>
            )}
            {value.includes('drive.google.com') && (
              <span className="inline-block text-[8px] bg-blue-100 text-blue-800 font-bold px-1.5 rounded-sm">
                Google Drive Direct Link
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
