import React, { useEffect, useState } from 'react';
import { Card, Button, Input, InputNumber, Upload, Tag, Form, message, Image, Spin } from 'antd';
import type { UploadFile } from 'antd';
import { LinkOutlined, CloudUploadOutlined, SafetyCertificateOutlined, InboxOutlined, WalletOutlined, CheckCircleOutlined, WarningOutlined, LoadingOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { fetchProcurements, submitProcurement } from '../../../store/slices/procurementSlice';
import { fetchWallet } from '../../../store/slices/walletSlice';
import { fetchSettings } from '../../../store/slices/settingsSlice';
import { FileThumbnail } from '../../../components/common/FileThumbnail';

const { Dragger } = Upload;
const { TextArea } = Input;

const resolveImgUrl = (url?: string) => {
  if (!url) return '';
  if (url.startsWith('/uploads/')) return `http://localhost:5000${url}`;
  return url;
};

export const BuyForMeList: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const { requests } = useAppSelector((state) => state.procurement);
  const walletState = useAppSelector((state) => state.wallet);
  const { settings } = useAppSelector((state) => state.settings);

  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  useEffect(() => {
    dispatch(fetchProcurements());
    dispatch(fetchWallet());
    dispatch(fetchSettings());
  }, [dispatch]);

  const walletBalance = walletState.wallet?.balance || 0;
  const submissionFee = settings?.buyForMeFixedFee || 1000;

  const handleSubmit = async (values: any) => {
    if (fileList.length === 0) {
      message.error('Please upload at least 1 reference photo or PDF file.');
      return;
    }
    try {
      setSubmitting(true);
      const fullSpecs = [
        values.itemName ? `Item: ${values.itemName}` : '',
        values.estPrice ? `Est. Price: ₦${values.estPrice}` : '',
        values.specifications ? `Specs: ${values.specifications}` : '',
      ].filter(Boolean).join('. ');

      const formData = new FormData();
      formData.append('productUrl', values.productUrl || '');
      formData.append('quantity', String(Number(values.quantity) || 1));
      formData.append('specifications', fullSpecs || 'Buy For Me Item');
      if (values.notes) formData.append('notes', values.notes);

      const existingUrls: string[] = [];
      fileList.forEach((f) => {
        if (f.originFileObj) {
          formData.append('files', f.originFileObj as File);
        } else if (f.url) {
          existingUrls.push(f.url);
        }
      });

      if (existingUrls.length > 0) {
        formData.append('productPhotos', JSON.stringify(existingUrls));
      }

      await dispatch(submitProcurement(formData as any)).unwrap();
      message.success('Buy-For-Me request submitted successfully! Quote will be issued in Naira (₦).');
      form.resetFields();
      setFileList([]);
      dispatch(fetchProcurements());
    } catch (err: any) {
      const msg = err?.message || 'Failed to submit procurement request.';
      message.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const activeRequests = requests.filter(r => ['submitted', 'under_review', 'quoted', 'purchasing'].includes(r.status)).length;
  const pendingPayment = requests.filter(r => r.status === 'quoted').length;

  return (
    <div className="animate-fade-in-up max-w-[1200px] mx-auto pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-6">
        <div>
          <div className="text-xs font-bold text-slate-400 tracking-wider uppercase mb-2 flex items-center gap-2">
            <span className="w-6 h-px bg-slate-300"></span>
            Procurement Services
          </div>
          <h1 className="text-4xl font-extrabold text-[#0A1128] m-0 mb-3 tracking-tight">Buy For Me</h1>
          <p className="text-slate-500 text-base max-w-xl m-0">
            Provide the link and supporting specs/photos. All quotes provided in Nigerian Naira (₦).
          </p>
        </div>
        <div className="flex gap-8">
          <div className="flex flex-col items-center">
            <span className="text-xs font-bold text-slate-400 tracking-wider uppercase mb-1">Active<br/>Requests</span>
            <span className="text-3xl font-extrabold text-[#0A1128]">{activeRequests}</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-xs font-bold text-slate-400 tracking-wider uppercase mb-1">Pending<br/>Payment</span>
            <span className="text-3xl font-extrabold text-brand-orange">{pendingPayment}</span>
          </div>
        </div>
      </div>

      {/* Main Form */}
      <Card bordered={false} className="shadow-lg border border-orange-100 rounded-xl overflow-hidden mb-8" bodyStyle={{ padding: '32px' }}>
        <div className="absolute top-0 left-0 w-full h-1 bg-brand-orange"></div>
        <h2 className="text-2xl font-bold text-[#0A1128] mb-6 flex items-center gap-3">
          <ShoppingCartIcon /> New Request
        </h2>

        <Form form={form} layout="vertical" onFinish={handleSubmit} requiredMark={false} className="space-y-6">
          <Form.Item name="productUrl" label={<span className="font-bold text-slate-700">Item URL <span className="text-red-500">*</span></span>} rules={[{ required: true, message: 'Please enter product URL' }]}>
            <Input size="large" prefix={<LinkOutlined className="text-slate-400 mr-2" />} placeholder="https://www.example.com/product/123" className="bg-slate-50 border-slate-200" />
          </Form.Item>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <Form.Item name="itemName" label={<span className="font-bold text-slate-700">Item Name / Brief Description <span className="text-red-500">*</span></span>} rules={[{ required: true, message: 'Please enter item name' }]}>
                <Input size="large" placeholder="e.g. Industrial Steel Widget v2" className="bg-slate-50 border-slate-200" />
              </Form.Item>
            </div>
            <div>
              <Form.Item name="estPrice" label={<span className="font-bold text-slate-700">Est. Price (Naira ₦)</span>}>
                <InputNumber
                  size="large"
                  className="w-full bg-slate-50 border-slate-200"
                  prefix="₦"
                  placeholder="0.00"
                />
              </Form.Item>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <Form.Item name="quantity" initialValue={1} label={<span className="font-bold text-slate-700">Quantity <span className="text-red-500">*</span></span>} rules={[{ required: true, message: 'Please specify quantity' }]}>
                <InputNumber size="large" min={1} className="w-full bg-slate-50 border-slate-200" />
              </Form.Item>
            </div>
            <div className="md:col-span-2">
              <Form.Item name="specifications" label={<span className="font-bold text-slate-700">Specifications (Size, Color, Model, etc.)</span>}>
                <Input size="large" placeholder="e.g. Size Large, Matte Black finish" className="bg-slate-50 border-slate-200" />
              </Form.Item>
            </div>
          </div>

          <Form.Item name="notes" label={<span className="font-bold text-slate-700">Additional Instructions</span>}>
            <TextArea rows={4} placeholder="Any specific requirements for purchasing or handling..." className="bg-slate-50 border-slate-200 resize-none" />
          </Form.Item>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Supporting Photos / PDF Documents <span className="text-red-500">* (At least 1 required)</span></label>
            <div className="relative">
              <Dragger
                className="bg-slate-50 border-dashed border-slate-300 rounded-xl"
                beforeUpload={() => false}
                accept="image/*,.pdf,application/pdf"
                disabled={uploading}
                onChange={({ fileList: newFileList }) => {
                  setUploading(true);
                  newFileList.forEach((f) => { f.status = 'done'; });
                  setFileList(newFileList);
                  setTimeout(() => setUploading(false), 300);
                }}
              >
                <p className="ant-upload-drag-icon">
                  {uploading ? <Spin indicator={<LoadingOutlined className="text-3xl text-brand-orange" spin />} /> : <CloudUploadOutlined className="text-brand-orange text-3xl" />}
                </p>
                <p className="ant-upload-text font-bold text-slate-700">Click or drag photos / PDF files to upload</p>
                <p className="ant-upload-hint text-xs text-slate-500">PNG, JPG, WEBP, PDF (Max 10MB) · At least 1 file required</p>
              </Dragger>

              {uploading && (
                <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-xl flex items-center justify-center z-10 gap-2">
                  <Spin indicator={<LoadingOutlined className="text-xl text-brand-orange" spin />} />
                  <span className="text-xs font-bold text-slate-800">Uploading File... Please Wait</span>
                </div>
              )}
            </div>

            {/* Uploaded Thumbnail Cards */}
            {fileList.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-3">
                {fileList.map((f, idx) => (
                  <FileThumbnail key={f.uid || idx} url={f.url || (f.originFileObj ? URL.createObjectURL(f.originFileObj as File) : '')} fileName={f.name} size="sm" showName={true} />
                ))}
              </div>
            )}
          </div>

          {/* Fee & Charge Preview Box */}
          <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-lg border border-slate-800 my-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-4 mb-4">
              <div>
                <div className="text-[10px] font-bold text-amber-400 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                  <WalletOutlined /> ORDER SUBMISSION CHARGE PREVIEW (NAIRA ₦)
                </div>
                <div className="text-2xl font-extrabold text-white">
                  ₦{(settings?.buyForMeFixedFee || 1000).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>
                <p className="text-xs text-slate-400 m-0 mt-0.5">
                  Submission & sourcing fee automatically deducted in Naira (₦) from your platform wallet balance.
                </p>
              </div>

              <div className="bg-slate-800/90 border border-slate-700 px-4 py-2.5 rounded-xl text-right shrink-0">
                <span className="text-[10px] font-bold text-slate-400 uppercase block mb-0.5">Your Wallet Balance</span>
                <span className={`text-lg font-extrabold ${walletBalance >= submissionFee ? "text-emerald-400" : "text-red-400"}`}>
                  ₦{walletBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {walletBalance >= submissionFee ? (
              <div className="bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 rounded-xl p-3 text-xs flex items-center gap-2">
                <CheckCircleOutlined className="text-emerald-400 text-base shrink-0" />
                <span>
                  <strong>Balance Sufficient:</strong> ₦{submissionFee.toLocaleString()} will be charged to place this order. Remaining balance after order: <strong>₦{(walletBalance - submissionFee).toLocaleString()}</strong>
                </span>
              </div>
            ) : (
              <div className="bg-red-950/60 border border-red-500/30 text-red-300 rounded-xl p-3 text-xs flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <WarningOutlined className="text-red-400 text-base shrink-0" />
                  <span>
                    <strong>Insufficient Wallet Balance:</strong> You need ₦{submissionFee.toLocaleString()} to place this order (Short by ₦{(submissionFee - walletBalance).toLocaleString()}).
                  </span>
                </div>
                <Button
                  type="primary"
                  size="small"
                  className="bg-brand-orange hover:bg-[#E86E21] border-none font-bold text-xs shrink-0"
                  onClick={() => navigate('/customer/wallet')}
                >
                  Top Up Wallet →
                </Button>
              </div>
            )}
          </div>

          <div className="flex justify-end pt-2">
            <Button
              type="primary"
              htmlType="submit"
              loading={submitting || uploading}
              disabled={walletBalance < submissionFee || uploading || fileList.length === 0}
              size="large"
              className="bg-brand-orange hover:bg-[#E86E21] border-none font-bold px-8 shadow-md h-12 text-base"
            >
              {uploading ? 'Uploading Attachment...' : `Submit Request (Charge ₦${submissionFee.toLocaleString()})`} ➔
            </Button>
          </div>
        </Form>
      </Card>

      {/* Info Boxes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <div className="bg-[#0A1128] rounded-xl p-6 flex gap-4 text-white shadow-md relative overflow-hidden">
          <div className="absolute -right-4 -bottom-4 opacity-10">
            <SafetyCertificateOutlined className="text-9xl" />
          </div>
          <SafetyCertificateOutlined className="text-blue-400 text-3xl shrink-0" />
          <div className="relative z-10">
            <h3 className="text-lg font-bold text-white mb-2">Secure Purchasing</h3>
            <p className="text-blue-100 text-sm m-0 leading-relaxed">
              We handle the transaction securely. All quotes issued in Naira (₦).
            </p>
          </div>
        </div>
        <div className="bg-slate-100 rounded-xl p-6 flex gap-4 text-slate-800 shadow-sm border border-slate-200">
          <InboxOutlined className="text-slate-600 text-3xl shrink-0" />
          <div>
            <h3 className="text-lg font-bold text-[#0A1128] mb-2">Consolidation</h3>
            <p className="text-slate-600 text-sm m-0 leading-relaxed">
              Items purchased are stored free for 30 days. Consolidate multiple 'Buy For Me' orders to save on final shipping.
            </p>
          </div>
        </div>
      </div>

      {/* Grid of Procurement Cards */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-[#0A1128] m-0">My Procurement Requests</h2>
        <span className="text-xs text-slate-500 font-medium">Total ({requests.length})</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {requests.map((req) => {
          const photos = req.productPhotos || [];
          const firstPhoto = resolveImgUrl(photos[0]);
          return (
            <Card key={req.id} variant="borderless" className="shadow-sm border border-slate-100 rounded-xl hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <span className="text-xs font-mono font-bold text-brand-navy">{req.id}</span>
                <Tag color={req.status === 'quoted' ? 'orange' : req.status === 'submitted' ? 'blue' : 'green'} className="m-0 font-bold uppercase tracking-wide border-none shadow-sm text-[10px]">
                  {req.status === 'quoted' ? 'ACTION: PAY' : req.status === 'submitted' ? 'PENDING QUOTE' : req.status.replace(/_/g, ' ')}
                </Tag>
              </div>

              <div className="flex gap-3 mb-3">
                <FileThumbnail url={firstPhoto} fileName={req.specifications} size="md" showName={false} />
                <div className="space-y-1 flex-1 overflow-hidden">
                  <h3 className="text-sm font-bold text-[#0A1128] m-0 truncate" title={req.specifications}>
                    {req.specifications || 'Buy-For-Me Item'}
                  </h3>
                  <div className="text-xs text-slate-500 font-medium">Qty: {req.quantity} pcs</div>
                  {photos.length > 1 && (
                    <div className="text-[10px] text-brand-blue font-bold">
                      📎 {photos.length} files attached
                    </div>
                  )}
                  <a href={req.productUrl} target="_blank" rel="noreferrer" className="text-xs text-brand-blue font-medium flex items-center gap-1 hover:underline">
                    <LinkOutlined /> View Item Link
                  </a>
                </div>
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-slate-100 text-xs">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                    {req.status === 'quoted' || req.totalCostNaira ? 'Quoted Total (Naira ₦)' : 'Submitted'}
                  </span>
                  <span className="font-bold text-[#0A1128] text-sm">
                    {req.totalCostNaira ? (
                      <span className="text-brand-orange font-extrabold text-base">₦{req.totalCostNaira.toLocaleString()}</span>
                    ) : req.totalCostRmb ? (
                      `¥${req.totalCostRmb.toFixed(2)}`
                    ) : (
                      new Date(req.submittedAt).toLocaleDateString()
                    )}
                  </span>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

const ShoppingCartIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6.33148 7.15177L7.3323 15.6599C7.44754 16.6394 8.2758 17.375 9.26257 17.375H17.8184C18.773 17.375 19.5847 16.6806 19.7423 15.7348L20.8256 9.23479C21.0315 8.00015 20.0833 6.875 18.8349 6.875H7.74797" stroke="#D95D10" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M4 4.5H5.19777C5.77259 4.5 6.25732 4.93123 6.33148 5.50176L6.46296 6.5126" stroke="#D95D10" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="9.5" cy="20.5" r="1.5" fill="#D95D10"/>
    <circle cx="17.5" cy="20.5" r="1.5" fill="#D95D10"/>
  </svg>
);
