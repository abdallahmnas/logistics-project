import React, { useEffect, useState, useMemo } from 'react';
import { Card, Form, Input, InputNumber, Button, Switch, Upload, Select, message, Tag, Progress, Modal, Image } from 'antd';
import {
  CameraOutlined,
  ScanOutlined,
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  SearchOutlined,
  CheckCircleOutlined,
  DeleteOutlined,
  EyeOutlined
} from '@ant-design/icons';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { fetchAllPackages, fetchAllUsers } from '../../../store/slices/adminSlice';
import { scanPackage, createInboundPackage } from '../../../store/slices/shipmentSlice';
import { fetchNotifications } from '../../../store/slices/notificationSlice';
import { uploadSingleFile } from '../../../services/uploadService';
import type { UploadFile } from 'antd';

const { Option } = Select;

const getBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
  });

export const PackageScanPage: React.FC = () => {
  const [form] = Form.useForm();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { allPackages, users } = useAppSelector((state) => state.admin);

  const initialTrackingId = searchParams.get('trackingId') || 'HZ-AIR-892110';
  const [scannedTracking, setScannedTracking] = useState<string>(initialTrackingId);
  const [submitting, setSubmitting] = useState(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [previewTitle, setPreviewTitle] = useState('');

  useEffect(() => {
    dispatch(fetchAllPackages());
    dispatch(fetchAllUsers());
  }, [dispatch]);

  useEffect(() => {
    const paramId = searchParams.get('trackingId');
    if (paramId) {
      setScannedTracking(paramId);
    }
  }, [searchParams]);

  const activePackage = useMemo(() => {
    const term = scannedTracking.trim().toLowerCase();
    if (!term) return null;
    return allPackages.find(
      (p) =>
        p.trackingId.toLowerCase() === term ||
        p.id.toLowerCase() === term ||
        (p.chineseTrackingNo && p.chineseTrackingNo.toLowerCase() === term)
    ) || null;
  }, [allPackages, scannedTracking]);

  const selectedUserId = Form.useWatch('userId', form);

  const matchedCustomer = useMemo(() => {
    if (selectedUserId) {
      return users.find((u) => u.id === selectedUserId || u.customerId === selectedUserId) || null;
    }
    if (activePackage) {
      return users.find((u) => u.id === activePackage.userId || u.customerId === activePackage.customerId) || null;
    }
    return null;
  }, [selectedUserId, activePackage, users]);

  useEffect(() => {
    const trimmedTracking = scannedTracking.trim();

    if (!trimmedTracking) {
      // Input deleted/cleared: wipe all form values & uploaded photos completely
      form.resetFields();
      setFileList([]);
      return;
    }

    if (activePackage) {
      // Package found: populate its exact attributes
      const targetUserId = activePackage.userId || activePackage.customerId || '';
      form.setFieldsValue({
        userId: targetUserId,
        chineseTrackingNo: activePackage.chineseTrackingNo || '',
        description: activePackage.description || '',
        weightKg: activePackage.weightKg || undefined,
        length: activePackage.dimensions?.length || undefined,
        width: activePackage.dimensions?.width || undefined,
        height: activePackage.dimensions?.height || undefined,
        packagingIntact: true,
      });

      if (activePackage.photos && activePackage.photos.length > 0) {
        const initialPhotos: UploadFile[] = activePackage.photos.map((url, i) => ({
          uid: `existing-${i}`,
          name: `Condition_Photo_${i + 1}.jpg`,
          status: 'done',
          percent: 100,
          url,
          preview: url,
        }));
        setFileList(initialPhotos);
      } else {
        setFileList([]);
      }
    } else {
      // Unknown/Fake ID entered: clear old fields so previous package data is NOT retained!
      const paramUserId = searchParams.get('userId') || '';
      const paramWeight = searchParams.get('weightKg');
      const paramLength = searchParams.get('length');
      const paramWidth = searchParams.get('width');
      const paramHeight = searchParams.get('height');
      const paramDesc = searchParams.get('desc');

      form.setFieldsValue({
        userId: paramUserId,
        chineseTrackingNo: '',
        description: paramDesc ? decodeURIComponent(paramDesc) : '',
        weightKg: paramWeight ? Number(paramWeight) : undefined,
        length: paramLength ? Number(paramLength) : undefined,
        width: paramWidth ? Number(paramWidth) : undefined,
        height: paramHeight ? Number(paramHeight) : undefined,
        packagingIntact: true,
      });
      setFileList([]);
    }
  }, [scannedTracking, activePackage, searchParams, form]);

  const length = Form.useWatch('length', form);
  const width = Form.useWatch('width', form);
  const height = Form.useWatch('height', form);

  const calculatedCbm =
    length && width && height ? (Number(length) * Number(width) * Number(height)) / 1000000 : 0;

  const handleFileSelect = async (file: File) => {
    try {
      message.loading({ content: `Uploading ${file.name}...`, key: 'upload' });
      // Generate instant preview URL first
      const base64Url = await getBase64(file);
      const cdnUrl = await uploadSingleFile(file, 'packages');
      const finalUrl = cdnUrl || base64Url;

      const newFile: UploadFile = {
        uid: 'file-' + Date.now() + '-' + Math.random(),
        name: file.name,
        status: 'done',
        percent: 100,
        url: finalUrl,
        preview: finalUrl,
      };
      setFileList((prev) => [...prev, newFile]);
      message.success({ content: `${file.name} uploaded successfully.`, key: 'upload' });
    } catch {
      message.error({ content: 'Failed to upload image.', key: 'upload' });
    }
    return false;
  };

  const handlePreview = (file: UploadFile) => {
    setPreviewImage(file.url || (file.preview as string));
    setPreviewTitle(file.name || 'Package Photo');
    setPreviewOpen(true);
  };

  const handleRemovePhoto = (index: number) => {
    setFileList((prev) => prev.filter((_, i) => i !== index));
  };

  const handleConfirm = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);

      const uploadedPhotos = fileList.map((f) => f.preview || f.url).filter(Boolean) as string[];

      const targetId = activePackage?.id || `pkg-${Date.now()}`;
      await dispatch(
        scanPackage({
          packageId: targetId,
          weightKg: values.weightKg,
          length: values.length,
          width: values.width,
          height: values.height,
          description: values.description,
          customerId: matchedCustomer?.customerId,
          customerName: matchedCustomer ? `${matchedCustomer.firstName} ${matchedCustomer.lastName}` : 'Customer',
          photos: uploadedPhotos,
        })
      ).unwrap();

      message.success(`Package ${scannedTracking} intake confirmed & updated in database!`);
      dispatch(fetchAllPackages());
      dispatch(fetchNotifications());
      setSubmitting(false);
      form.resetFields();
      setScannedTracking('');
      setFileList([]);
      navigate('/admin/warehouse/inbound');
    } catch (e: any) {
      setSubmitting(false);
      const errMsg = e?.message || e?.data?.message || 'Failed to confirm package intake. Please check fields and try again.';
      message.error(errMsg);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in-up max-w-[800px] mx-auto pb-20 mt-4">
      
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-4xl md:text-[42px] font-extrabold text-brand-navy m-0 leading-tight">
            Intake<br/>Terminal
          </h1>
          <p className="text-slate-500 mt-2 mb-0 text-sm font-medium">
            Guangzhou Central Hub (CAN-01)
          </p>
        </div>
        <div className="bg-[#E4E9EC] text-[#345167] text-[10px] font-bold tracking-widest uppercase px-4 py-2 rounded-md shadow-inner flex flex-col items-center justify-center gap-1">
          <div className="flex items-center gap-1.5">
             <span className="w-1.5 h-1.5 rounded-full bg-[#C05010] animate-pulse" />
             SCANNER
          </div>
          ACTIVE
        </div>
      </div>

      {/* Scan Box */}
      <div className="bg-[#F2F1EF] p-6 rounded-lg border-l-4 border-l-[#C05010] shadow-sm mb-6">
         <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">
           SCAN BARCODE OR ENTER TRACKING #
         </p>
         <div className="flex gap-4">
           <Input 
             prefix={<ScanOutlined className="text-slate-500 text-lg mr-2" />} 
             placeholder="Scan barcode or type tracking number..." 
             className="!h-12 !bg-white !border-slate-200 !text-slate-800 !text-base font-bold"
             value={scannedTracking}
             onChange={(e) => setScannedTracking(e.target.value)}
             allowClear
             onPressEnter={() => dispatch(fetchAllPackages())}
           />
           <Button 
             className="!bg-[#0A1128] hover:!bg-slate-800 !text-white !h-12 !px-6 font-bold !border-none !rounded flex items-center gap-2"
             onClick={() => dispatch(fetchAllPackages())}
           >
             <ScanOutlined /> FETCH DETAILS
           </Button>
         </div>
      </div>

      {/* Package Intake Card */}
      <div className="bg-white rounded-lg shadow-xl border border-slate-100">
        <div className="bg-brand-navy p-5 flex justify-between items-center text-white rounded-t-lg">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded bg-white/10 flex items-center justify-center border border-white/20">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
            </div>
            <div>
              <h2 className="text-xl font-extrabold m-0 tracking-wide text-white">
                {scannedTracking.trim() || 'New Package Intake'}
              </h2>
              <p className="text-xs text-slate-300 m-0 font-medium mt-0.5">
                {!scannedTracking.trim()
                  ? 'Scan barcode or type tracking ID above to load package details'
                  : activePackage
                  ? (matchedCustomer ? `Assigned to: ${matchedCustomer.firstName} ${matchedCustomer.lastName} (${matchedCustomer.customerId})` : 'Existing Pre-Alert Package')
                  : '⚠️ Unregistered Tracking ID — Fill parcel details below for new intake'}
              </p>
            </div>
          </div>
          <div className="bg-brand-orange px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 text-white">
             <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
             Recording Scan
          </div>
        </div>

        {/* Card Body */}
        <Form form={form} layout="vertical">
          <div className="p-6">
            
            {/* Customer & Details Section */}
            <div className="mb-8">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">PACKAGE DETAILS & ASSIGNMENT</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Form.Item 
                    name="userId" 
                    label={<span className="text-xs font-bold text-slate-500">Assign Registered Customer</span>}
                    rules={[{ required: true, message: 'Select a customer' }]}
                    className="mb-2"
                  >
                    <Select 
                      placeholder="Search customer by name, ID or phone..." 
                      showSearch
                      optionFilterProp="children"
                      className="w-full !h-10 text-xs"
                      size="large"
                    >
                      {users.map((u) => (
                        <Option key={u.id} value={u.id}>
                          {u.firstName} {u.lastName} ({u.customerId} - {u.phone})
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                  {matchedCustomer && (
                    <div className="mb-4">
                      <Tag color="blue" icon={<UserOutlined />} className="px-2 py-1 rounded text-xs font-bold">
                        {matchedCustomer.firstName} {matchedCustomer.lastName} ({matchedCustomer.email})
                      </Tag>
                    </div>
                  )}
                </div>

                <Form.Item 
                  name="chineseTrackingNo" 
                  label={<span className="text-xs font-bold text-slate-500">Chinese Tracking No. (Optional)</span>}
                  className="mb-4"
                >
                  <Input placeholder="e.g. SF12345678" className="!h-10 !bg-slate-50" />
                </Form.Item>
              </div>

              <Form.Item 
                name="description" 
                label={<span className="text-xs font-bold text-slate-500">Package Description</span>}
                rules={[{ required: true, message: 'Please describe the contents' }]}
                className="mb-0"
              >
                <Input.TextArea placeholder="e.g. 2 boxes of wireless earbuds" rows={2} className="!bg-slate-50" />
              </Form.Item>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-slate-100 pt-8">
              
              {/* Physical Metrics */}
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">PHYSICAL METRICS</p>
                
                <Form.Item 
                  name="weightKg"
                  label={<span className="text-xs font-bold text-slate-500">Actual Weight (kg)</span>} 
                  className="mb-4"
                  rules={[{ required: true, message: 'Required' }]}
                >
                  <InputNumber 
                     className="w-full !bg-slate-50 !border-slate-200 font-medium !h-10 flex items-center" 
                     controls={false}
                     addonAfter={<span className="text-xs font-bold text-slate-400">kg</span>}
                  />
                </Form.Item>

                <Form.Item label={<span className="text-xs font-bold text-slate-500">Dimensions (L × W × H cm)</span>} className="mb-4">
                  <div className="flex items-center gap-2">
                    <Form.Item name="length" noStyle rules={[{ required: true }]}><InputNumber className="w-full !bg-slate-50 !border-slate-200 text-center !h-10 flex items-center" controls={false} /></Form.Item>
                    <span className="text-slate-300 text-xs font-bold">×</span>
                    <Form.Item name="width" noStyle rules={[{ required: true }]}><InputNumber className="w-full !bg-slate-50 !border-slate-200 text-center !h-10 flex items-center" controls={false} /></Form.Item>
                    <span className="text-slate-300 text-xs font-bold">×</span>
                    <Form.Item name="height" noStyle rules={[{ required: true }]}><InputNumber className="w-full !bg-slate-50 !border-slate-200 text-center !h-10 flex items-center" controls={false} /></Form.Item>
                  </div>
                </Form.Item>

                <div className="bg-[#F8F9FA] rounded-md p-3 text-center border border-slate-100">
                  <span className="text-xs font-bold text-slate-400">Calculated CBM: <span className="text-slate-700 font-mono font-bold">{calculatedCbm.toFixed(3)} m³</span></span>
                </div>
              </div>

              {/* Condition Capture */}
              <div className="flex flex-col h-full">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">CONDITION CAPTURE</p>
                
                <Upload.Dragger
                  fileList={fileList}
                  beforeUpload={(file) => {
                    handleFileSelect(file as File);
                    return false;
                  }}
                  customRequest={({ onSuccess }) => setTimeout(() => onSuccess?.("ok"), 0)}
                  accept="image/*"
                  showUploadList={false}
                  className="!bg-slate-50 hover:!bg-white !border-2 !border-dashed !border-slate-200 !rounded-lg !mb-3 flex-1"
                >
                  <div className="py-6">
                    <p className="ant-upload-drag-icon mb-2">
                      <CameraOutlined className="text-3xl text-slate-300" />
                    </p>
                    <p className="text-xs font-bold text-slate-400 px-4">
                      Click or drag to capture package photo
                    </p>
                  </div>
                </Upload.Dragger>

                {/* Upload Status & Thumbnail Preview Grid */}
                {fileList.length > 0 && (
                  <div className="mb-4 space-y-2">
                    <div className="flex justify-between items-center bg-emerald-50 border border-emerald-100 p-2 px-3 rounded text-xs font-bold text-emerald-700">
                      <span className="flex items-center gap-1.5">
                        <CheckCircleOutlined className="text-emerald-500" /> {fileList.length} Photo(s) Attached
                      </span>
                      <Tag color="success" className="m-0 font-mono text-[10px]">100% UPLOADED</Tag>
                    </div>

                    <Progress percent={100} size="small" status="success" showInfo={false} />

                    <div className="grid grid-cols-3 gap-2 pt-1">
                      {fileList.map((file, idx) => (
                        <div key={idx} className="relative group rounded-md overflow-hidden border border-slate-200 h-20 bg-slate-100">
                          <img
                            src={file.preview || file.url}
                            alt="Package condition"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 text-white">
                            <EyeOutlined className="text-base cursor-pointer hover:text-blue-300" onClick={() => handlePreview(file)} />
                            <DeleteOutlined className="text-base cursor-pointer hover:text-red-400" onClick={() => handleRemovePhoto(idx)} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-md p-3 mt-auto">
                  <Form.Item name="packagingIntact" valuePropName="checked" noStyle>
                    <Switch className="bg-[#D3A889] hover:bg-[#C0906D] [&.ant-switch-checked]:bg-[#D3A889]" />
                  </Form.Item>
                  <span className="text-xs font-bold text-slate-500 leading-tight">
                    Packaging Intact (No Damage)
                  </span>
                </div>
              </div>

            </div>
          </div>

          {/* Actions */}
          <div className="p-6 pt-4 flex justify-end gap-4 border-t border-slate-100 bg-slate-50 rounded-b-lg">
            <Button 
              onClick={() => navigate('/admin/warehouse/inbound')}
              className="!h-12 !px-8 font-bold !text-slate-500 !border-slate-300 hover:!border-slate-400 hover:!text-slate-700 uppercase tracking-wider text-xs bg-white"
            >
              Cancel
            </Button>
            <Button 
              loading={submitting} 
              onClick={handleConfirm} 
              type="primary" 
              className="!h-12 !px-8 font-bold !bg-brand-orange hover:!bg-[#D95D10] !text-white !border-none uppercase tracking-wider text-xs flex items-center gap-2 shadow-lg shadow-brand-orange/30 cursor-pointer"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
              Confirm Intake
            </Button>
          </div>
        </Form>
      </div>

      {/* Image Preview Modal */}
      <Modal open={previewOpen} title={previewTitle} footer={null} onCancel={() => setPreviewOpen(false)}>
        <Image alt={previewTitle} style={{ width: '100%' }} src={previewImage} preview={false} />
      </Modal>

    </div>
  );
};

export default PackageScanPage;
