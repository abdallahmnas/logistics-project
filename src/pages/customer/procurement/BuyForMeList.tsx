import React, { useEffect, useState } from 'react';
import { Card, Button, Input, InputNumber, Upload, Tag } from 'antd';
import { LinkOutlined, CloudUploadOutlined, SafetyCertificateOutlined, InboxOutlined } from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { fetchProcurements } from '../../../store/slices/procurementSlice';

const { Dragger } = Upload;
const { TextArea } = Input;

export const BuyForMeList: React.FC = () => {
  const dispatch = useAppDispatch();
  const { requests, loading } = useAppSelector((state) => state.procurement);

  useEffect(() => {
    dispatch(fetchProcurements());
  }, [dispatch]);

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
            Provide the link, and our global procurement team will source, purchase, and consolidate your items at our secure facility.
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

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Item URL <span className="text-red-500">*</span></label>
            <Input size="large" prefix={<LinkOutlined className="text-slate-400 mr-2" />} placeholder="https://www.example.com/product/123" className="bg-slate-50 border-slate-200" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-slate-700 mb-2">Item Name / Brief Description <span className="text-red-500">*</span></label>
              <Input size="large" placeholder="e.g. Industrial Steel Widget v2" className="bg-slate-50 border-slate-200" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Est. Price (USD)</label>
              <InputNumber size="large" className="w-full bg-slate-50 border-slate-200" prefix="$" placeholder="0.00" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Quantity <span className="text-red-500">*</span></label>
              <InputNumber size="large" min={1} defaultValue={1} className="w-full bg-slate-50 border-slate-200" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-slate-700 mb-2">Specifications (Size, Color, Model, etc.)</label>
              <Input size="large" placeholder="e.g. Size Large, Matte Black finish" className="bg-slate-50 border-slate-200" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Additional Instructions</label>
            <TextArea rows={4} placeholder="Any specific requirements for purchasing or handling..." className="bg-slate-50 border-slate-200 resize-none" />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Supporting Documents (Optional)</label>
            <Dragger
              className="bg-white border-dashed border-slate-300"
              beforeUpload={() => false}
              onChange={({ fileList: newFileList }) => {
                newFileList.forEach((f) => { f.status = 'done'; });
              }}
              customRequest={({ onSuccess }) => setTimeout(() => onSuccess?.("ok"), 0)}
            >
              <p className="ant-upload-drag-icon">
                <CloudUploadOutlined className="text-slate-400" />
              </p>
              <p className="ant-upload-text font-bold text-slate-700">Click to upload or drag and drop</p>
              <p className="ant-upload-hint text-xs text-slate-500">PDF, JPG, PNG (Max 5MB)</p>
            </Dragger>
          </div>

          <div className="flex justify-end pt-4">
            <Button type="primary" size="large" className="bg-brand-orange hover:bg-[#E86E21] border-none font-bold px-8 shadow-md">
              Submit Request ➔
            </Button>
          </div>
        </div>
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
              We handle the transaction securely. No need to share your personal credit card with unknown international vendors.
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

      {/* Recent Requests */}
      <div className="flex justify-between items-end mb-6">
        <h2 className="text-2xl font-bold text-[#0A1128] m-0">Recent Requests</h2>
        <Button type="link" className="text-[#0A1128] font-bold p-0 hover:text-brand-orange text-sm flex items-center gap-1">
          View All ↗
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {requests.slice(0, 3).map(req => (
          <Card key={req.id} variant="borderless" className="shadow-sm border border-slate-100 rounded-xl hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-3">
              <span className="text-xs font-medium text-slate-400">{req.id}</span>
              <Tag color={req.status === 'quoted' ? 'orange' : 'default'} className="m-0 font-bold uppercase tracking-wide border-none shadow-sm">
                {req.status === 'quoted' ? 'ACTION: PAY' : req.status === 'submitted' ? 'PENDING QUOTE' : 'PURCHASED'}
              </Tag>
            </div>
            <h3 className="text-base font-bold text-[#0A1128] mb-4 truncate">{req.specifications || 'Industrial Item'}</h3>
            <div className="flex justify-between items-center pt-4 border-t border-slate-100">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  {req.status === 'quoted' ? 'Quoted Price' : 'Requested'}
                </span>
                <span className="text-sm font-bold text-slate-700">
                  {req.status === 'quoted' ? `¥${req.totalCostRmb}` : new Date(req.submittedAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </Card>
        ))}
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
