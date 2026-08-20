import React, { useState } from 'react';
import { Upload, Modal, Image, Button } from 'antd';
import type { UploadFile, UploadProps } from 'antd';
import { InboxOutlined, DeleteOutlined, EyeOutlined, QrcodeOutlined, BarcodeOutlined } from '@ant-design/icons';

const { Dragger } = Upload;

const getBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
  });

interface ImageDropzoneProps {
  fileList: UploadFile[];
  onChange: (files: UploadFile[]) => void;
  multiple?: boolean;
  maxCount?: number;
  title?: React.ReactNode;
  hint?: React.ReactNode;
  className?: string;
}

export const ImageDropzone: React.FC<ImageDropzoneProps> = ({
  fileList,
  onChange,
  multiple = true,
  maxCount = 8,
  title = 'Click or drag QR Code or Barcode image here to upload',
  hint = 'PNG, JPG, WEBP up to 5MB',
  className = '',
}) => {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [previewTitle, setPreviewTitle] = useState('');

  const handlePreview = async (file: UploadFile) => {
    if (!file.url && !file.preview && file.originFileObj) {
      file.preview = await getBase64(file.originFileObj as File);
    }
    setPreviewImage(file.url || (file.preview as string) || '');
    setPreviewTitle(file.name || 'Image preview');
    setPreviewOpen(true);
  };

  const handleChange: UploadProps['onChange'] = async ({ fileList: newFileList }) => {
    const processedList = await Promise.all(
      newFileList.map(async (file) => {
        if (!file.url && !file.thumbUrl && file.originFileObj) {
          try {
            const b64 = await getBase64(file.originFileObj as File);
            file.thumbUrl = b64;
            file.preview = b64;
            file.url = b64;
          } catch (e) {
            console.error('Failed to generate image preview base64:', e);
          }
        }
        return file;
      })
    );
    onChange(processedList);
  };

  const handleRemove = (file: UploadFile) => {
    const updated = fileList.filter((f) => f.uid !== file.uid && f.name !== file.name);
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      <Dragger
        listType="picture-card"
        multiple={multiple}
        maxCount={maxCount}
        fileList={fileList}
        beforeUpload={() => false}
        onPreview={handlePreview}
        onChange={handleChange}
        accept="image/*"
        className={`!bg-slate-50 !border-slate-200 hover:!border-brand-blue rounded-xl p-2 ${className}`}
      >
        {fileList.length >= maxCount ? null : (
          <div className="py-4">
            <p className="text-3xl text-brand-blue mb-2 flex justify-center gap-2">
              <QrcodeOutlined />
              <BarcodeOutlined />
            </p>
            <p className="text-sm font-medium text-slate-700 m-0">{title}</p>
            <p className="text-xs text-slate-400 mt-1 mb-0">{hint}</p>
          </div>
        )}
      </Dragger>

      {/* Image Thumbnail Preview Cards */}
      {fileList.length > 0 && (
        <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
            UPLOADED PREVIEW ({fileList.length})
          </span>
          <div className="flex flex-wrap gap-3">
            {fileList.map((file, idx) => {
              const src = file.thumbUrl || file.preview || file.url || 'https://images.unsplash.com/photo-1620825937374-87fc7d6aaf8e?q=80&w=600';
              return (
                <div key={file.uid || idx} className="relative group bg-slate-50 border border-slate-200 rounded-lg p-2 flex items-center gap-3">
                  <Image
                    src={src}
                    alt={file.name || 'Preview'}
                    className="w-16 h-16 rounded-md object-cover border border-slate-200"
                    fallback="https://images.unsplash.com/photo-1620825937374-87fc7d6aaf8e?q=80&w=600"
                  />
                  <div className="flex-1 overflow-hidden pr-2">
                    <span className="text-xs font-bold text-slate-700 block truncate">{file.name}</span>
                    <span className="text-[10px] text-green-600 font-semibold bg-green-50 px-1.5 py-0.5 rounded border border-green-200 inline-block mt-0.5">
                      ✓ Image Ready
                    </span>
                  </div>
                  <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    size="small"
                    onClick={() => handleRemove(file)}
                    title="Remove photo"
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}

      <Modal open={previewOpen} title={previewTitle} footer={null} onCancel={() => setPreviewOpen(false)}>
        <Image alt={previewTitle} style={{ width: '100%' }} src={previewImage} preview={false} />
      </Modal>
    </div>
  );
};
