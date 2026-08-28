import React from 'react';
import { Image } from 'antd';
import { FilePdfOutlined, PictureOutlined } from '@ant-design/icons';

interface FileThumbnailProps {
  url?: string;
  fileName?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showName?: boolean;
}

const CLEAN_IMAGE_FALLBACK = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="%2394a3b8" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="3" fill="%23f8fafc"/><circle cx="8.5" cy="8.5" r="1.5" fill="%23cbd5e1"/><polyline points="21 15 16 10 5 21" stroke="%23cbd5e1"/></svg>`;

export const getFullFileUrl = (url?: string): string => {
  if (!url) return '';
  const cleanUrl = url.trim();
  if (
    cleanUrl.startsWith('http://') ||
    cleanUrl.startsWith('https://') ||
    cleanUrl.startsWith('data:') ||
    cleanUrl.startsWith('blob:')
  ) {
    return cleanUrl;
  }
  const serverHost = 'http://localhost:5000';
  if (cleanUrl.startsWith('/uploads/')) {
    return `${serverHost}${cleanUrl}`;
  }
  if (cleanUrl.startsWith('uploads/')) {
    return `${serverHost}/${cleanUrl}`;
  }
  if (cleanUrl.startsWith('/')) {
    return `${serverHost}${cleanUrl}`;
  }
  // Raw filename (e.g., "mdKida.pdf" or "airFreightThumbnal.jpg")
  return `${serverHost}/uploads/${cleanUrl}`;
};

export const isPdfFile = (url?: string, fileName?: string): boolean => {
  const checkStr = `${url || ''} ${fileName || ''}`.toLowerCase();
  return checkStr.endsWith('.pdf') || checkStr.includes('.pdf') || checkStr.includes('application/pdf');
};

export const FileThumbnail: React.FC<FileThumbnailProps> = ({
  url = '',
  fileName,
  size = 'md',
  className = '',
  showName = true,
}) => {
  const fullUrl = getFullFileUrl(url);
  const isPdf = isPdfFile(fullUrl, fileName);
  const displayName = fileName || (url ? url.split('/').pop() : '') || 'File Attachment';

  const sizePixels = {
    sm: { px: 48, icon: 'text-xl' },
    md: { px: 80, icon: 'text-2xl' },
    lg: { px: 112, icon: 'text-3xl' },
  }[size];

  const dimensionStyle: React.CSSProperties = {
    width: `${sizePixels.px}px`,
    height: `${sizePixels.px}px`,
    maxWidth: `${sizePixels.px}px`,
    maxHeight: `${sizePixels.px}px`,
    minWidth: `${sizePixels.px}px`,
    minHeight: `${sizePixels.px}px`,
  };

  if (isPdf) {
    return (
      <div className={`flex items-center gap-2.5 ${className}`}>
        <a
          href={fullUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={dimensionStyle}
          className="rounded-xl bg-red-50 border border-red-200 hover:border-red-400 flex flex-col items-center justify-center text-red-600 transition-all shrink-0 group relative overflow-hidden shadow-sm"
          title={`View PDF: ${displayName}`}
        >
          <FilePdfOutlined className={`${sizePixels.icon} group-hover:scale-110 transition-transform`} />
          <span className="text-[9px] font-extrabold tracking-wider uppercase mt-1 text-red-700">PDF</span>
        </a>
        {showName && (
          <div className="overflow-hidden space-y-0.5">
            <a
              href={fullUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-bold text-slate-800 hover:text-red-600 truncate block transition-colors max-w-[180px]"
              title={displayName}
            >
              {displayName}
            </a>
            <a
              href={fullUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[10px] font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-200 hover:bg-red-100 transition-colors"
            >
              <FilePdfOutlined /> Open PDF Document ↗
            </a>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {fullUrl ? (
        <div style={dimensionStyle} className="shrink-0 overflow-hidden rounded-xl border border-slate-200 shadow-sm relative bg-slate-50">
          <Image
            src={fullUrl}
            alt="Product Attachment"
            fallback={CLEAN_IMAGE_FALLBACK}
            width={sizePixels.px}
            height={sizePixels.px}
            style={{ width: `${sizePixels.px}px`, height: `${sizePixels.px}px`, objectFit: 'cover' }}
            wrapperStyle={{ width: `${sizePixels.px}px`, height: `${sizePixels.px}px`, overflow: 'hidden' }}
          />
        </div>
      ) : (
        <div
          style={dimensionStyle}
          className="rounded-xl bg-slate-100 border border-slate-200 flex flex-col items-center justify-center text-slate-400 shrink-0 shadow-sm"
        >
          <PictureOutlined className={sizePixels.icon} />
          <span className="text-[9px] font-semibold mt-0.5">Image</span>
        </div>
      )}
      {showName && fileName && (
        <div className="overflow-hidden max-w-[180px]">
          <span className="text-xs font-bold text-slate-700 block truncate" title={displayName}>
            {displayName}
          </span>
          <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 inline-block mt-0.5">
            ✓ Image Photo
          </span>
        </div>
      )}
    </div>
  );
};
