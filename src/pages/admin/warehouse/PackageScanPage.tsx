import React, { useEffect, useState, useMemo } from 'react';
import { Card, Form, Input, InputNumber, Button, Switch, Upload, message, Tag } from 'antd';
import {
  CameraOutlined,
  ScanOutlined,
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  SearchOutlined
} from '@ant-design/icons';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { fetchAllPackages, fetchAllUsers } from '../../../store/slices/adminSlice';
import { scanPackage, createInboundPackage } from '../../../store/slices/shipmentSlice';

export const PackageScanPage: React.FC = () => {
  const [form] = Form.useForm();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { allPackages, users } = useAppSelector((state) => state.admin);
  const [scannedTracking, setScannedTracking] = useState<string>('TKG-8892-110A');
  const [isManual, setIsManual] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (allPackages.length === 0) dispatch(fetchAllPackages());
    if (users.length === 0) dispatch(fetchAllUsers());
  }, [dispatch, allPackages.length, users.length]);

  const length = Form.useWatch('length', form);
  const width = Form.useWatch('width', form);
  const height = Form.useWatch('height', form);
  const customerSearch = Form.useWatch('customerSearch', form);

  const calculatedCbm =
    length && width && height ? (Number(length) * Number(width) * Number(height)) / 1000000 : 0;

  const matchedCustomer = useMemo(() => {
    if (!customerSearch || customerSearch.length < 3) return null;
    const term = customerSearch.toLowerCase();
    return users.find((u) => 
      (u.phone && u.phone.toLowerCase().includes(term)) || 
      (u.email && u.email.toLowerCase().includes(term))
    ) || null;
  }, [customerSearch, users]);

  const handleConfirm = async () => {
    try {
      const values = await form.validateFields();
      if (!matchedCustomer && !values.description) {
         message.error("Please assign a customer and add a description.");
         return;
      }
      setSubmitting(true);
      // Mock submit
      setTimeout(() => {
        setSubmitting(false);
        message.success("Package recorded successfully!");
        form.resetFields();
        navigate('/admin/warehouse/inbound');
      }, 1000);
    } catch (e) {
      // validation failed
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
           SCAN BARCODE OR ENTER TRACKING
         </p>
         <div className="flex gap-4">
           <Input 
             prefix={<ScanOutlined className="text-slate-500 text-lg mr-2" />} 
             placeholder="Awaiting scan" 
             className="!h-12 !bg-white !border-slate-200 !text-slate-400 !text-base font-bold"
             value={scannedTracking}
             onChange={(e) => setScannedTracking(e.target.value)}
           />
           <Button className="!bg-[#0A1128] hover:!bg-slate-800 !text-white !h-12 !px-6 font-bold !border-none !rounded flex items-center gap-2">
             <ScanOutlined /> MANUAL ENTRY
           </Button>
         </div>
      </div>

      {/* Package Intake Card */}
      <div className="bg-white rounded-lg shadow-xl border border-slate-100">
        {/* Card Header (Removed faded look) */}
        <div className="bg-brand-navy p-5 flex justify-between items-center text-white rounded-t-lg">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded bg-white/10 flex items-center justify-center border border-white/20">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
            </div>
            <div>
              <h2 className="text-xl font-extrabold m-0 tracking-wide text-white">{scannedTracking || 'New Package'}</h2>
              <p className="text-xs text-white m-0 font-medium mt-0.5">
                {matchedCustomer ? `Matched to Customer: ${matchedCustomer.firstName} ${matchedCustomer.lastName}` : 'Assign to a customer below'}
              </p>
            </div>
          </div>
          <div className="bg-brand-orange px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 text-white">
             <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
             Recording Scan
          </div>
        </div>

        {/* Card Body */}
        <Form form={form} layout="vertical" initialValues={{ length: 60, width: 40, height: 40, weightKg: 14.5, packagingIntact: true }}>
          <div className="p-6">
            
            {/* Customer & Details Section */}
            <div className="mb-8">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">PACKAGE DETAILS & ASSIGNMENT</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Form.Item 
                    name="customerSearch" 
                    label={<span className="text-xs font-bold text-slate-500">Assign Customer (Phone or Email)</span>}
                    rules={[{ required: true, message: 'Please search and assign a customer' }]}
                    className="mb-2"
                  >
                    <Input 
                      placeholder="e.g. +2348012345678 or email" 
                      prefix={<SearchOutlined className="text-slate-400" />}
                      className="!h-10 !bg-slate-50"
                    />
                  </Form.Item>
                  {customerSearch && (
                    <div className="mb-4">
                      {matchedCustomer ? (
                        <Tag color="blue" icon={<UserOutlined />} className="px-2 py-1 rounded">
                          {matchedCustomer.firstName} {matchedCustomer.lastName} ({matchedCustomer.phone})
                        </Tag>
                      ) : customerSearch.length >= 3 ? (
                        <Tag color="red" className="px-2 py-1 rounded">No customer found</Tag>
                      ) : null}
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
                  <span className="text-xs font-bold text-slate-400">Calculated CBM: <span className="text-slate-700">{calculatedCbm.toFixed(3)} m³</span></span>
                </div>
              </div>

              {/* Condition Capture */}
              <div className="flex flex-col h-full">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">CONDITION CAPTURE</p>
                
                <Upload.Dragger className="!bg-slate-50 hover:!bg-white !border-2 !border-dashed !border-slate-200 !rounded-lg !mb-4 flex-1">
                  <div className="py-6">
                    <p className="ant-upload-drag-icon mb-2">
                      <CameraOutlined className="text-3xl text-slate-300" />
                    </p>
                    <p className="text-xs font-bold text-slate-400 px-4">
                      Click to capture package photo
                    </p>
                  </div>
                </Upload.Dragger>

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
            <Button className="!h-12 !px-8 font-bold !text-slate-500 !border-slate-300 hover:!border-slate-400 hover:!text-slate-700 uppercase tracking-wider text-xs bg-white">
              Cancel
            </Button>
            <Button loading={submitting} onClick={handleConfirm} type="primary" className="!h-12 !px-8 font-bold !bg-[#D3A889] hover:!bg-[#C0906D] !border-none uppercase tracking-wider text-xs flex items-center gap-2 shadow-lg shadow-[#D3A889]/30">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
              Confirm Intake
            </Button>
          </div>
        </Form>
      </div>

    </div>
  );
};
