import React, { useState } from 'react';
import { Upload, Modal, Image } from 'antd';
import type { UploadFile, UploadProps } from 'antd';
import { InboxOutlined } from '@ant-design/icons';

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
  title = 'Click or drag photos here to upload',
  hint = 'PNG or JPG',
  className = '',
}) => {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [previewTitle, setPreviewTitle] = useState('');

  const handlePreview = async (file: UploadFile) => {
    if (!file.url && !file.preview && file.originFileObj) {
      file.preview = await getBase64(file.originFileObj as File);
    }
    setPreviewImage(file.url || (file.preview as string));
    setPreviewTitle(file.name || 'Photo preview');
    setPreviewOpen(true);
  };

  const handleChange: UploadProps['onChange'] = ({ fileList: newFileList }) => {
    onChange(newFileList);
  };

  return (
    <>
      <Dragger
        listType="picture-card"
        multiple={multiple}
        maxCount={maxCount}
        fileList={fileList}
        beforeUpload={() => false}
        onPreview={handlePreview}
        onChange={handleChange}
        accept="image/*"
        className={`!bg-slate-50 !border-slate-200 hover:!border-brand-blue rounded-xl ${className}`}
      >
        {fileList.length >= maxCount ? null : (
          <div className="py-4">
            <p className="text-3xl text-brand-blue mb-2">
              <InboxOutlined />
            </p>
            <p className="text-sm font-medium text-slate-700 m-0">{title}</p>
            <p className="text-xs text-slate-400 mt-1 mb-0">{hint}</p>
          </div>
        )}
      </Dragger>
      <Modal open={previewOpen} title={previewTitle} footer={null} onCancel={() => setPreviewOpen(false)}>
        <Image alt={previewTitle} style={{ width: '100%' }} src={previewImage} preview={false} />
      </Modal>
    </>
  );
};
