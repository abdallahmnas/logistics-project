import React, { useState } from 'react';
import { Upload, Modal, Image, Button, Spin } from 'antd';
import type { UploadFile, UploadProps } from 'antd';
import { InboxOutlined, DeleteOutlined, LoadingOutlined, CloudUploadOutlined, FilePdfOutlined } from '@ant-design/icons';

import { uploadImageFile } from '../../utils/fileUpload';
import { FileThumbnail, isPdfFile } from './FileThumbnail';

const { Dragger } = Upload;

interface ImageDropzoneProps {
  fileList: UploadFile[];
  onChange: (files: UploadFile[]) => void;
  onUploadingChange?: (isUploading: boolean) => void;
  multiple?: boolean;
  maxCount?: number;
  title?: React.ReactNode;
  hint?: React.ReactNode;
  accept?: string;
  className?: string;
}

export const ImageDropzone: React.FC<ImageDropzoneProps> = ({
  fileList,
  onChange,
  onUploadingChange,
  multiple = true,
  maxCount = 8,
  title = 'Click or drag reference photos or PDF files here to upload',
  hint = 'PNG, JPG, WEBP, PDF up to 10MB per file',
  accept = 'image/*,.pdf,application/pdf',
  className = '',
}) => {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [previewTitle, setPreviewTitle] = useState('');
  const [uploading, setUploading] = useState(false);

  const handlePreview = async (file: UploadFile) => {
    const src = file.url || file.preview || (file.originFileObj ? URL.createObjectURL(file.originFileObj as File) : '');
    setPreviewImage(src);
    setPreviewTitle(file.name || 'File preview');
    setPreviewOpen(true);
  };

  const handleChange: UploadProps['onChange'] = async ({ fileList: newFileList }) => {
    setUploading(true);
    if (onUploadingChange) onUploadingChange(true);

    try {
      const processedList = await Promise.all(
        newFileList.map(async (file) => {
          if (!file.url && file.originFileObj) {
            const objectUrl = URL.createObjectURL(file.originFileObj as File);
            file.thumbUrl = objectUrl;
            file.preview = objectUrl;

            try {
              const uploadedUrl = await uploadImageFile(file.originFileObj as File, 'procurement');
              file.url = uploadedUrl;
              file.status = 'done';
            } catch (e) {
              file.url = objectUrl;
              file.status = 'done';
            }
          }
          return file;
        })
      );
      onChange(processedList);
    } finally {
      setUploading(false);
      if (onUploadingChange) onUploadingChange(false);
    }
  };

  const handleRemove = (file: UploadFile) => {
    const updated = fileList.filter((f) => f.uid !== file.uid && f.name !== file.name);
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Dragger
          listType="picture-card"
          multiple={multiple}
          maxCount={maxCount}
          fileList={fileList}
          beforeUpload={() => false}
          onPreview={handlePreview}
          onChange={handleChange}
          accept={accept}
          disabled={uploading}
          className={`!bg-slate-50 !border-slate-200 hover:!border-brand-blue rounded-xl p-2 ${className}`}
        >
          {fileList.length >= maxCount ? null : (
            <div className="py-4">
              <p className="text-3xl text-brand-orange mb-2 flex justify-center gap-2">
                {uploading ? <Spin indicator={<LoadingOutlined className="text-3xl text-brand-orange" spin />} /> : <CloudUploadOutlined />}
              </p>
              <p className="text-sm font-semibold text-slate-700 m-0">{title}</p>
              <p className="text-xs text-slate-400 mt-1 mb-0">{hint}</p>
            </div>
          )}
        </Dragger>

        {/* Upload Loading Overlay */}
        {uploading && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-xl flex flex-col items-center justify-center z-10 space-y-2 border border-brand-orange/30 shadow-inner">
            <Spin indicator={<LoadingOutlined className="text-3xl text-brand-orange" spin />} />
            <span className="text-xs font-bold text-slate-800">Uploading File... Please Wait</span>
            <span className="text-[10px] text-slate-400 font-medium">Processing & attaching document</span>
          </div>
        )}
      </div>

      {/* File Thumbnail Preview Cards */}
      {fileList.length > 0 && (
        <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-2 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
            ATTACHED FILES ({fileList.length})
          </span>
          <div className="flex flex-wrap gap-3">
            {fileList.map((file, idx) => {
              const src = file.url || file.thumbUrl || file.preview || '';
              return (
                <div key={file.uid || idx} className="relative group bg-slate-50 border border-slate-200 rounded-xl p-2 flex items-center justify-between gap-3 min-w-[200px] max-w-xs shadow-sm hover:border-brand-orange transition-colors">
                  <FileThumbnail url={src} fileName={file.name} size="sm" showName={true} />
                  <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    size="small"
                    onClick={() => handleRemove(file)}
                    title="Remove file"
                    className="shrink-0"
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}

      <Modal open={previewOpen} title={previewTitle} footer={null} onCancel={() => setPreviewOpen(false)}>
        {isPdfFile(previewImage, previewTitle) ? (
          <div className="py-8 text-center space-y-4">
            <FilePdfOutlined className="text-6xl text-red-500" />
            <p className="text-sm font-bold text-slate-800 m-0">{previewTitle}</p>
            <Button type="primary" href={previewImage} target="_blank" className="bg-red-600 font-bold border-none">
              Open & Download PDF Document
            </Button>
          </div>
        ) : (
          <Image alt={previewTitle} style={{ width: '100%' }} src={previewImage} preview={false} />
        )}
      </Modal>
    </div>
  );
};
