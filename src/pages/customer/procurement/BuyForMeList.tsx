import React, { useEffect, useState } from 'react';
import { Card, Button, Input, InputNumber, Upload, Tag, Form, message, Image, Spin, Modal, Descriptions, Alert } from 'antd';
import type { UploadFile } from 'antd';
import { LinkOutlined, CloudUploadOutlined, SafetyCertificateOutlined, InboxOutlined, WalletOutlined, CheckCircleOutlined, WarningOutlined, LoadingOutlined, CheckOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { fetchProcurements, submitProcurement, approveProcurement } from '../../../store/slices/procurementSlice';
import { fetchWallet } from '../../../store/slices/walletSlice';
import { fetchSettings } from '../../../store/slices/settingsSlice';
import { FileThumbnail } from '../../../components/common/FileThumbnail';
import type { ProcurementRequest } from '../../../types/procurement.types';

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
  const [approveModalItem, setApproveModalItem] = useState<ProcurementRequest | null>(null);
  const [approving, setApproving] = useState(false);

  useEffect(() => {
    dispatch(fetchProcurements());
    dispatch(fetchWallet());
    dispatch(fetchSettings());
  }, [dispatch]);

  const walletBalance = walletState.data?.balance || 0;
  const submissionFee = settings?.buyForMeFixedFee || 1000;

  const handleConfirmApprove = async () => {
    if (!approveModalItem) return;
    try {
      setApproving(true);
      await dispatch(approveProcurement(approveModalItem.id)).unwrap();
      message.success('Quote approved & payment confirmed! Package added to your consolidation queue.');
      setApproveModalItem(null);
      dispatch(fetchProcurements());
      dispatch(fetchWallet());
    } catch (err: any) {
      message.error(err?.message || 'Failed to approve quote');
    } finally {
      setApproving(false);
    }
  };

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
      message.error(err?.message || 'Failed to submit request');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-gradient-to-r from-[#0A1128] to-[#1C2A4E] p-6 rounded-2xl text-white shadow-md gap-4">
        <div>
          <span className="text-xs font-bold text-brand-orange uppercase tracking-wider block mb-1">
            Procurement Services
          </span>
          <h1 className="text-2xl font-black text-white m-0">Buy For Me</h1>
          <p className="text-slate-300 text-sm mt-1 mb-0 max-w-xl">
            Provide the link and supporting specs/photos. All quotes provided in Nigerian Naira (₦).
          </p>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right">
            <span className="text-xs text-slate-400 font-bold block uppercase tracking-wider">Active Requests</span>
            <span className="text-2xl font-black text-white">{requests.filter((r) => r.status !== 'cancelled').length}</span>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-400 font-bold block uppercase tracking-wider">Pending Payment</span>
            <span className="text-2xl font-black text-brand-orange">{requests.filter((r) => r.status === 'quoted').length}</span>
          </div>
        </div>
      </div>

      {/* New Request Card */}
      <Card variant="borderless" className="shadow-sm border border-slate-100 rounded-2xl overflow-hidden">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-brand-orange text-xl font-bold border border-orange-200">
            🛒
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#0A1128] m-0">New Request</h2>
            <p className="text-xs text-slate-500 m-0">Fill out details & attach photos/PDF specs for sourcing</p>
          </div>
        </div>

        <Form form={form} layout="vertical" onFinish={handleSubmit} initialValues={{ quantity: 1 }}>
          <Form.Item
            name="productUrl"
            label={<span className="font-bold text-slate-700">Item URL <span className="text-red-500">*</span></span>}
            rules={[{ required: true, message: 'Please enter product URL' }]}
          >
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
              <Form.Item name="quantity" label={<span className="font-bold text-slate-700">Quantity <span className="text-red-500">*</span></span>} rules={[{ required: true, message: 'Please enter quantity' }]}>
                <InputNumber min={1} size="large" className="w-full bg-slate-50 border-slate-200" />
              </Form.Item>
            </div>
            <div className="md:col-span-2">
              <Form.Item name="specifications" label={<span className="font-bold text-slate-700">Specifications (Size, Color, Model, etc.)</span>}>
                <Input size="large" placeholder="e.g. Size Large, Matte Black finish" className="bg-slate-50 border-slate-200" />
              </Form.Item>
            </div>
          </div>

          <Form.Item name="notes" label={<span className="font-bold text-slate-700">Additional Instructions</span>}>
            <TextArea rows={3} placeholder="Any specific requirements for purchasing or handling..." className="bg-slate-50 border-slate-200" />
          </Form.Item>

          <div className="mb-6">
            <label className="block text-xs font-bold text-slate-700 mb-2">
              Supporting Photos / PDF Documents <span className="text-red-500">* (At least 1 required)</span>
            </label>
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
            </Dragger>
            {fileList.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-3">
                {fileList.map((f, idx) => (
                  <FileThumbnail key={f.uid || idx} url={f.url || (f.originFileObj ? URL.createObjectURL(f.originFileObj as File) : '')} fileName={f.name} size="sm" showName={true} />
                ))}
              </div>
            )}
          </div>

          {/* Submission Charge Preview Card */}
          <div className="bg-[#0A1128] text-white p-5 rounded-2xl border border-slate-800 space-y-3 mb-6 shadow-sm">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest block mb-0.5">
                  ORDER SUBMISSION CHARGE PREVIEW (NAIRA ₦)
                </span>
                <div className="text-2xl font-black text-white">
                  ₦{submissionFee.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>
                <span className="text-xs text-slate-400">
                  Submission & sourcing fee automatically deducted in Naira (₦) from your platform wallet balance.
                </span>
              </div>
              <div className="bg-slate-900/80 px-4 py-3 rounded-xl border border-slate-800 text-right">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Your Wallet Balance</span>
                <span className={`text-lg font-black ${walletBalance >= submissionFee ? 'text-emerald-400' : 'text-red-400'}`}>
                  ₦{walletBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {walletBalance < submissionFee ? (
              <div className="bg-red-500/10 border border-red-500/30 p-3 rounded-xl flex items-center justify-between text-xs text-red-300">
                <span className="flex items-center gap-2 font-medium">
                  <WarningOutlined className="text-red-400 text-base" />
                  Insufficient wallet balance (₦{walletBalance.toLocaleString()}). Please top up to proceed.
                </span>
                <Button type="primary" size="small" onClick={() => navigate('/customer/wallet')} className="bg-red-500 border-none font-bold text-xs">
                  Top Up Wallet
                </Button>
              </div>
            ) : (
              <div className="bg-emerald-500/10 border border-emerald-500/30 p-3 rounded-xl flex items-center gap-2 text-xs text-emerald-300">
                <CheckCircleOutlined className="text-emerald-400 text-base shrink-0" />
                <span>
                  <strong>Balance Sufficient:</strong> ₦{submissionFee.toLocaleString()} will be charged to place this order. Remaining balance after order: <strong>₦{(walletBalance - submissionFee).toLocaleString()}</strong>
                </span>
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              loading={submitting}
              disabled={walletBalance < submissionFee || uploading || fileList.length === 0}
              className="bg-brand-orange hover:bg-[#E86E21] border-none font-bold px-8 h-12 rounded-xl text-base shadow-md disabled:bg-slate-200 disabled:text-slate-400"
            >
              {uploading ? (
                <span className="flex items-center gap-2">
                  <Spin indicator={<LoadingOutlined className="text-white spin" />} /> Uploading File...
                </span>
              ) : (
                `Submit Request (Charge ₦${submissionFee.toLocaleString()}) →`
              )}
            </Button>
          </div>
        </Form>
      </Card>

      {/* Info Banner */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#0A1128] rounded-xl p-6 flex gap-4 text-white shadow-sm relative overflow-hidden">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 text-xl font-bold shrink-0">
            <SafetyCertificateOutlined />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white mb-2">Secure Purchasing</h3>
            <p className="text-slate-300 text-sm m-0 leading-relaxed">
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

                {/* Interactive Action Buttons */}
                {req.status === 'quoted' && req.totalCostNaira && (
                  <Button
                    type="primary"
                    size="small"
                    className="bg-brand-orange hover:bg-[#E86E21] border-none font-bold text-xs shadow-sm"
                    onClick={() => setApproveModalItem(req)}
                  >
                    Approve & Pay (₦{req.totalCostNaira.toLocaleString()})
                  </Button>
                )}

                {(req.status === 'approved' || req.status === 'purchasing' || req.status === 'received_at_wh' || req.status === 'shipped_to_wh') && (
                  <Button
                    type="default"
                    size="small"
                    icon={<InboxOutlined className="text-brand-orange" />}
                    className="border-brand-orange text-brand-orange font-bold text-xs hover:bg-orange-50 shadow-sm"
                    onClick={() => navigate('/customer/consolidation/new')}
                  >
                    📦 Add to Consolidation
                  </Button>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Quote Approval & Payment Modal */}
      <Modal
        open={!!approveModalItem}
        onCancel={() => setApproveModalItem(null)}
        footer={null}
        title={
          <div className="flex items-center gap-2 text-lg font-bold text-brand-navy">
            <SafetyCertificateOutlined className="text-brand-orange" />
            Approve & Pay Procurement Quote
          </div>
        }
        className="rounded-2xl"
      >
        {approveModalItem && (
          <div className="space-y-5 pt-2">
            <Alert
              type="info"
              showIcon
              message="Supplier Quote Sourced"
              description={`Our team has sourced your product with supplier "${approveModalItem.supplierName || 'Verified Supplier'}". Please review and confirm payment to proceed.`}
            />

            <Descriptions column={1} bordered size="small" className="bg-slate-50 rounded-xl">
              <Descriptions.Item label="Item Details">{approveModalItem.specifications}</Descriptions.Item>
              <Descriptions.Item label="Quantity">{approveModalItem.quantity} pcs</Descriptions.Item>
              <Descriptions.Item label="Supplier">{approveModalItem.supplierName || 'China Supplier'}</Descriptions.Item>
              <Descriptions.Item label="RMB Quote Total">¥{approveModalItem.totalCostRmb?.toFixed(2)}</Descriptions.Item>
              <Descriptions.Item label="Naira (₦) Charge">
                <span className="text-brand-orange font-black text-lg">₦{approveModalItem.totalCostNaira?.toLocaleString()}</span>
              </Descriptions.Item>
            </Descriptions>

            {/* Wallet Balance Verification */}
            <div className="bg-[#0A1128] text-white p-4 rounded-xl space-y-2 border border-slate-800">
              <div className="flex justify-between items-center text-xs text-slate-300">
                <span>Available Wallet Balance</span>
                <span className={`font-bold text-sm ${walletBalance >= (approveModalItem.totalCostNaira || 0) ? 'text-emerald-400' : 'text-red-400'}`}>
                  ₦{walletBalance.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs text-slate-300 pt-2 border-t border-slate-800">
                <span>Deduction Amount</span>
                <span className="font-bold text-brand-orange">₦{approveModalItem.totalCostNaira?.toLocaleString()}</span>
              </div>
              {walletBalance >= (approveModalItem.totalCostNaira || 0) && (
                <div className="flex justify-between items-center text-xs text-emerald-300 pt-1">
                  <span>Balance After Payment</span>
                  <span className="font-bold">₦{(walletBalance - (approveModalItem.totalCostNaira || 0)).toLocaleString()}</span>
                </div>
              )}
            </div>

            {walletBalance < (approveModalItem.totalCostNaira || 0) ? (
              <div className="space-y-3">
                <Alert
                  type="error"
                  showIcon
                  message="Insufficient Wallet Balance"
                  description={`Your current balance (₦${walletBalance.toLocaleString()}) is less than the required ₦${approveModalItem.totalCostNaira?.toLocaleString()}. Please top up your wallet.`}
                />
                <Button type="primary" block size="large" onClick={() => navigate('/customer/wallet')} className="bg-red-500 border-none font-bold">
                  Top Up Wallet Now
                </Button>
              </div>
            ) : (
              <div className="flex justify-end gap-3 pt-2">
                <Button onClick={() => setApproveModalItem(null)} size="large">
                  Cancel
                </Button>
                <Button
                  type="primary"
                  size="large"
                  loading={approving}
                  icon={<CheckOutlined />}
                  onClick={handleConfirmApprove}
                  className="bg-brand-orange hover:bg-[#E86E21] border-none font-bold px-6"
                >
                  Confirm & Pay ₦{approveModalItem.totalCostNaira?.toLocaleString()}
                </Button>
              </div>
            )}
          </div>
        )}
      </Modal>
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
