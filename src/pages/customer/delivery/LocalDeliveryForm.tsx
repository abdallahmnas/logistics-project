import React, { useEffect, useState } from 'react';
import { Button, Input, Card, Form, Select, message } from 'antd';
import { ArrowLeftOutlined, EnvironmentOutlined, FlagOutlined, InboxOutlined, CarOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { submitDelivery } from '../../../store/slices/deliverySlice';
import { fetchPackages, fetchConsolidations } from '../../../store/slices/shipmentSlice';

export const LocalDeliveryForm: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [form] = Form.useForm();
  const { user } = useAppSelector((state) => state.auth);
  const { packages, consolidations } = useAppSelector((state) => state.shipments);
  const [priority, setPriority] = useState<'standard' | 'express'>('standard');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    dispatch(fetchPackages());
    dispatch(fetchConsolidations());
  }, [dispatch]);

  const arrivedItems = [
    ...packages.filter(p => ['arrived_destination', 'received_at_wh', 'cleared_customs', 'arrived_lagos', 'ready_for_dispatch'].includes(p.status)).map(p => ({
      label: `Package: ${p.trackingId} - ${p.description || 'Imported Goods'} (${p.weightKg || 1}kg)`,
      value: `pkg_${p.id}`,
      description: `Package ${p.trackingId}: ${p.description || 'Imported Goods'}`,
    })),
    ...consolidations.filter(c => ['arrived_destination', 'received_at_wh', 'cleared_customs', 'arrived_lagos', 'ready_for_dispatch'].includes(c.status)).map(c => ({
      label: `Consolidation: ${c.consolidationId} - ${c.packageIds.length} Packages (${c.totalWeightKg || 1}kg)`,
      value: `con_${c.id}`,
      description: `Consolidation ${c.consolidationId}: ${c.packageIds.length} Packages (${c.totalWeightKg || 1}kg)`,
    })),
  ];

  const baseRate = priority === 'express' ? 1500 : 3000;
  const distanceFee = 2250;
  const totalFareNaira = baseRate + distanceFee;

  const handleSubmit = async (values: any) => {
    try {
      setSubmitting(true);
      await dispatch(
        submitDelivery({
          pickupAddress: 'HamzaRMB Distribution Hub, Ikeja, Lagos',
          pickupCity: 'Lagos',
          pickupPhone: user?.phone || '+2348090219021',
          pickupContactName: user ? `${user.firstName} ${user.lastName}` : 'Warehouse Admin',
          dropoffAddress: values.dropoffAddress,
          dropoffCity: 'Lagos',
          dropoffPhone: values.dropoffPhone,
          dropoffContactName: values.dropoffContactName,
          packageDescription: values.packageDescription,
          vehicleType: priority === 'express' ? 'motorbike' : 'sedan',
          paymentMethod: 'wallet',
        })
      ).unwrap();

      message.success('Local Delivery request dispatched successfully!');
      navigate('/customer/delivery');
    } catch (err: any) {
      const msg = err?.message || 'Failed to submit delivery request. Please check fields.';
      message.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="animate-fade-in-up max-w-[1200px] mx-auto pb-20">
      
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button 
          type="text" 
          icon={<ArrowLeftOutlined />} 
          className="bg-slate-100 hover:bg-slate-200 w-10 h-10 rounded-full flex items-center justify-center shrink-0"
          onClick={() => navigate('/customer/delivery')}
        />
        <div>
          <h1 className="text-3xl font-extrabold text-[#0A1128] m-0 mb-1 tracking-tight">New Delivery Request</h1>
          <p className="text-slate-500 text-sm m-0">Configure logistics and dispatch parameters.</p>
        </div>
      </div>

      <Form form={form} layout="vertical" onFinish={handleSubmit} requiredMark={false}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column - Forms */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Route Planning */}
            <Card bordered={false} className="shadow-sm border border-slate-100 rounded-xl" bodyStyle={{ padding: '24px' }}>
              <h2 className="text-xl font-bold text-[#0A1128] mb-6 flex items-center gap-2">
                <EnvironmentOutlined /> Route Planning
              </h2>
              
              <div className="space-y-0 relative">
                <div className="absolute left-6 top-10 bottom-10 w-px border-l-2 border-dashed border-slate-200"></div>
                
                <div className="mb-6 relative z-10">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">PICKUP LOCATION</label>
                  <Input 
                    size="large" 
                    prefix={<EnvironmentOutlined className="text-slate-500 mr-2" />} 
                    value="HamzaRMB Central Hub, Ikeja, Lagos" 
                    className="bg-slate-50 border-slate-200 text-slate-700 font-medium py-3" 
                    readOnly 
                  />
                </div>
                
                <div className="mb-6 relative z-10">
                  <Form.Item 
                    name="dropoffAddress" 
                    label={<span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">DELIVERY DESTINATION <span className="text-red-500">*</span></span>}
                    rules={[{ required: true, message: 'Please enter delivery destination address' }]}
                  >
                    <Input 
                      size="large" 
                      prefix={<FlagOutlined className="text-orange-500 mr-2" />} 
                      placeholder="Enter destination address in Lagos (e.g. 42 Admiralty Way, Lekki Phase 1)" 
                      className="bg-white border-slate-200 py-3" 
                    />
                  </Form.Item>
                </div>
              </div>

              <div className="mt-2 rounded-xl overflow-hidden border border-slate-200 h-64 relative bg-slate-100">
                {/* Map placeholder */}
                <img 
                  src="https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=1000&auto=format&fit=crop" 
                  alt="Map Preview" 
                  className="w-full h-full object-cover opacity-60"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-bold shadow-sm text-slate-600">
                    Lagos Metro Dispatch Zone
                  </div>
                </div>
              </div>
            </Card>

            {/* Package Details */}
            <Card bordered={false} className="shadow-sm border border-slate-100 rounded-xl" bodyStyle={{ padding: '24px' }}>
              <h2 className="text-xl font-bold text-[#0A1128] mb-6 flex items-center gap-2">
                <InboxOutlined /> Goods Arrived in Nigeria (Lagos Hub)
              </h2>
              
              {arrivedItems.length > 0 && (
                <Form.Item 
                  name="arrivedItem" 
                  label={<span className="text-[10px] font-bold text-brand-orange uppercase tracking-wider">SELECT ARRIVED SHIPMENT (PRE-FILL DETAILS)</span>}
                >
                  <Select 
                    size="large"
                    placeholder="Select package or consolidation arrived at Lagos Hub..."
                    options={arrivedItems}
                    onChange={(val) => {
                      const item = arrivedItems.find(i => i.value === val);
                      if (item) {
                        form.setFieldsValue({ packageDescription: item.description });
                      }
                    }}
                  />
                </Form.Item>
              )}

              <Form.Item 
                name="packageDescription" 
                label={<span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">CONTENTS DESCRIPTION <span className="text-red-500">*</span></span>}
                rules={[{ required: true, message: 'Please describe package contents' }]}
              >
                <Input size="large" placeholder="e.g. Electronics, Clothing batch, Industrial spare parts" className="bg-slate-50 border-slate-200 py-3" />
              </Form.Item>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Form.Item 
                  name="dropoffContactName" 
                  label={<span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">RECIPIENT NAME <span className="text-red-500">*</span></span>}
                  rules={[{ required: true, message: 'Please enter recipient name' }]}
                >
                  <Input size="large" placeholder="Contact person name" className="bg-slate-50 border-slate-200 py-3" />
                </Form.Item>
                <Form.Item 
                  name="dropoffPhone" 
                  label={<span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">PHONE NUMBER <span className="text-red-500">*</span></span>}
                  rules={[{ required: true, message: 'Please enter recipient phone number' }]}
                >
                  <Input size="large" placeholder="+234 800 000 0000" className="bg-slate-50 border-slate-200 py-3" />
                </Form.Item>
              </div>
            </Card>

            {/* Dispatch Priority */}
            <Card bordered={false} className="shadow-sm border border-slate-100 rounded-xl" bodyStyle={{ padding: '24px' }}>
              <h2 className="text-xl font-bold text-[#0A1128] mb-6 flex items-center gap-2">
                <CarOutlined /> Dispatch Priority
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div 
                  className={`border-2 rounded-xl p-5 cursor-pointer transition-all ${priority === 'standard' ? 'border-[#0A1128] bg-[#0A1128] text-white shadow-md' : 'border-slate-200 bg-white hover:border-slate-300'}`}
                  onClick={() => setPriority('standard')}
                >
                  <div className="flex justify-between items-start mb-2">
                    <CarOutlined className={`text-2xl ${priority === 'standard' ? 'text-blue-300' : 'text-slate-400'}`} />
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${priority === 'standard' ? 'border-white' : 'border-slate-300'}`}>
                      {priority === 'standard' && <div className="w-2.5 h-2.5 bg-white rounded-full"></div>}
                    </div>
                  </div>
                  <h3 className={`font-bold m-0 mb-1 ${priority === 'standard' ? 'text-white' : 'text-[#0A1128]'}`}>Standard Logistics</h3>
                  <p className={`text-sm m-0 ${priority === 'standard' ? 'text-blue-200' : 'text-slate-500'}`}>Sedan Vehicle • Next business day delivery.</p>
                </div>

                <div 
                  className={`border-2 rounded-xl p-5 cursor-pointer transition-all ${priority === 'express' ? 'border-brand-orange bg-white shadow-md' : 'border-slate-200 bg-white hover:border-slate-300'}`}
                  onClick={() => setPriority('express')}
                >
                  <div className="flex justify-between items-start mb-2">
                    <ThunderboltOutlined className={`text-2xl ${priority === 'express' ? 'text-brand-orange' : 'text-slate-400'}`} />
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${priority === 'express' ? 'border-brand-orange' : 'border-slate-300'}`}>
                      {priority === 'express' && <div className="w-2.5 h-2.5 bg-brand-orange rounded-full"></div>}
                    </div>
                  </div>
                  <h3 className="font-bold text-[#0A1128] m-0 mb-1">Express Dispatch</h3>
                  <p className="text-sm text-slate-500 m-0">Express Motorbike • Immediate 2-4 hour delivery.</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Right Column - Summary */}
          <div className="lg:col-span-1">
            <Card bordered={false} className="shadow-lg border-t-4 border-[#0A1128] rounded-xl sticky top-24" bodyStyle={{ padding: '0' }}>
              <div className="p-6 border-b border-slate-100">
                <h2 className="text-xl font-bold text-[#0A1128] m-0">Dispatch Summary</h2>
              </div>
              
              <div className="p-6 space-y-4 text-sm">
                <div className="flex justify-between items-center text-slate-600">
                  <span>Base Rate ({priority === 'express' ? 'Express Bike' : 'Sedan Truck'})</span>
                  <span className="font-mono font-bold">₦{baseRate.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-slate-600">
                  <span>Distance Fare (15 km)</span>
                  <span className="font-mono font-bold">₦{distanceFee.toLocaleString()}</span>
                </div>
                
                <div className="pt-3 border-t border-slate-100">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Payment Method</span>
                  <Form.Item name="paymentMethod" initialValue="wallet" className="mb-0">
                    <Select size="middle" className="w-full">
                      <Select.Option value="wallet">💳 Wallet Balance Deduction</Select.Option>
                      <Select.Option value="cash_on_delivery">💵 Pay on Delivery (Cash / POS)</Select.Option>
                    </Select>
                  </Form.Item>
                </div>
              </div>

              <div className="p-6 bg-slate-50 border-t border-slate-100">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">ESTIMATED TOTAL</span>
                  <span className="text-3xl font-extrabold text-[#0A1128]">
                    ₦{totalFareNaira.toLocaleString()}
                  </span>
                </div>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  loading={submitting} 
                  size="large" 
                  block 
                  className="bg-[#0A1128] hover:bg-[#1a2542] border-none font-bold shadow-md h-12 text-base"
                >
                  CONFIRM DISPATCH
                </Button>
              </div>
            </Card>
          </div>
          
        </div>
      </Form>
    </div>
  );
};
