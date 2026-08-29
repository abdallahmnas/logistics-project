import React, { useEffect, useState } from 'react';
import { Button, Input, Card, Form, Select, message, Spin, Tag } from 'antd';
import { ArrowLeftOutlined, EnvironmentOutlined, FlagOutlined, InboxOutlined, CarOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { submitDelivery, fetchVehicles } from '../../../store/slices/deliverySlice';
import { fetchPackages, fetchConsolidations } from '../../../store/slices/shipmentSlice';
import type { DeliveryVehicle } from '../../../types/delivery.types';

export const LocalDeliveryForm: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [form] = Form.useForm();
  const { user } = useAppSelector((state) => state.auth);
  const { packages, consolidations } = useAppSelector((state) => state.shipments);
  const { vehicles } = useAppSelector((state) => state.delivery);

  const [selectedVehicle, setSelectedVehicle] = useState<DeliveryVehicle | null>(null);
  const [dropoffCity, setDropoffCity] = useState<string>('Lagos');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    dispatch(fetchPackages());
    dispatch(fetchConsolidations());
    dispatch(fetchVehicles());
  }, [dispatch]);

  useEffect(() => {
    if (vehicles.length > 0 && !selectedVehicle) {
      setSelectedVehicle(vehicles[0]);
    }
  }, [vehicles, selectedVehicle]);

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

  const calculateVehiclePrice = (v: DeliveryVehicle, city: string) => {
    const c = (city || '').toLowerCase().trim();
    if (c.includes('lagos')) return v.priceLagos;
    if (c.includes('kano')) return v.priceKano;
    return v.priceInterstate;
  };

  const currentPrice = selectedVehicle ? calculateVehiclePrice(selectedVehicle, dropoffCity) : 0;

  const handleSubmit = async (values: any) => {
    if (!selectedVehicle) {
      message.error('Please select a dispatch vehicle.');
      return;
    }
    try {
      setSubmitting(true);
      await dispatch(
        submitDelivery({
          pickupAddress: values.pickupAddress || 'HamzaRMB Distribution Hub, Ikeja, Lagos',
          pickupCity: 'Lagos',
          pickupPhone: user?.phone || '+2348090219021',
          pickupContactName: user ? `${user.firstName} ${user.lastName}` : 'Warehouse Admin',
          dropoffAddress: values.dropoffAddress,
          dropoffCity: values.dropoffCity || dropoffCity,
          dropoffPhone: values.dropoffPhone,
          dropoffContactName: values.dropoffContactName,
          packageDescription: values.packageDescription,
          vehicleId: selectedVehicle.id,
          vehicleType: selectedVehicle.name,
          paymentMethod: values.paymentMethod === 'cash_on_delivery' ? 'cash_on_delivery' : 'wallet',
        })
      ).unwrap();

      message.success('Local Delivery request dispatched successfully!');
      navigate('/customer/delivery');
    } catch (err: any) {
      const msg = typeof err === 'string' ? err : err?.message || 'Failed to submit delivery request. Please check fields.';
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
          <h1 className="text-3xl font-extrabold text-[#0A1128] m-0 mb-1 tracking-tight">New Doorstep Delivery Request</h1>
          <p className="text-slate-500 text-sm m-0">Book local dispatch or inter-state haulage across Nigeria.</p>
        </div>
      </div>

      <Form form={form} layout="vertical" onFinish={handleSubmit} requiredMark={false} initialValues={{ dropoffCity: 'Lagos', paymentMethod: 'wallet' }}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column - Forms */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Route Planning */}
            <Card bordered={false} className="shadow-sm border border-slate-100 rounded-xl" bodyStyle={{ padding: '24px' }}>
              <h2 className="text-xl font-bold text-[#0A1128] mb-6 flex items-center gap-2">
                <EnvironmentOutlined className="text-brand-orange" /> Route & Destination State
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">PICKUP LOCATION</label>
                  <Input 
                    size="large" 
                    prefix={<EnvironmentOutlined className="text-slate-500 mr-2" />} 
                    value="HamzaRMB Distribution Hub, Ikeja, Lagos" 
                    className="bg-slate-50 border-slate-200 text-slate-700 font-medium py-3 rounded-xl" 
                    readOnly 
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-1">
                    <Form.Item 
                      name="dropoffCity" 
                      label={<span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">DESTINATION REGION <span className="text-red-500">*</span></span>}
                    >
                      <Select
                        size="large"
                        className="w-full font-bold"
                        onChange={(val) => setDropoffCity(val)}
                        options={[
                          { label: '🇳🇬 Lagos State (Metro)', value: 'Lagos' },
                          { label: '🇳🇬 Kano State (Metro)', value: 'Kano' },
                          { label: '🚚 Inter-State (Other States)', value: 'Abuja / Inter-State' },
                        ]}
                      />
                    </Form.Item>
                  </div>

                  <div className="md:col-span-2">
                    <Form.Item 
                      name="dropoffAddress" 
                      label={<span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">FULL DESTINATION STREET ADDRESS <span className="text-red-500">*</span></span>}
                      rules={[{ required: true, message: 'Please enter delivery destination address' }]}
                    >
                      <Input 
                        size="large" 
                        prefix={<FlagOutlined className="text-brand-orange mr-2" />} 
                        placeholder="e.g. 42 Admiralty Way, Lekki Phase 1, Lagos" 
                        className="bg-white border-slate-200 py-3 rounded-xl" 
                      />
                    </Form.Item>
                  </div>
                </div>
              </div>
            </Card>

            {/* Select Vehicle */}
            <Card bordered={false} className="shadow-sm border border-slate-100 rounded-xl" bodyStyle={{ padding: '24px' }}>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-[#0A1128] m-0 flex items-center gap-2">
                  <CarOutlined className="text-brand-orange" /> Select Dispatch Vehicle
                </h2>
                <span className="text-xs text-slate-500">Prices calculated for <strong>{dropoffCity}</strong></span>
              </div>

              {vehicles.length === 0 ? (
                <div className="text-center py-8">
                  <Spin tip="Loading vehicles..." />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {vehicles.map((v) => {
                    const price = calculateVehiclePrice(v, dropoffCity);
                    const isSelected = selectedVehicle?.id === v.id;
                    return (
                      <div
                        key={v.id}
                        onClick={() => setSelectedVehicle(v)}
                        className={`border-2 rounded-2xl p-4 cursor-pointer transition-all flex flex-col justify-between relative overflow-hidden ${
                          isSelected
                            ? 'border-brand-orange bg-amber-500/5 shadow-md ring-2 ring-brand-orange/20'
                            : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                      >
                        {v.imageUrl && (
                          <div className="h-28 w-full rounded-xl overflow-hidden mb-3 bg-slate-100 relative">
                            <img src={v.imageUrl} alt={v.name} className="w-full h-full object-cover" />
                            {isSelected && (
                              <div className="absolute top-2 right-2 bg-brand-orange text-white p-1 rounded-full text-xs shadow">
                                <CheckCircleOutlined />
                              </div>
                            )}
                          </div>
                        )}

                        <div>
                          <div className="flex justify-between items-start mb-1">
                            <h3 className="font-extrabold text-[#0A1128] m-0 text-base">{v.name}</h3>
                            <Tag color="orange" className="font-bold border-none text-[10px]">
                              MAX {v.maxWeightKg || 50}KG
                            </Tag>
                          </div>
                          <p className="text-xs text-slate-500 m-0 mb-3 line-clamp-2">{v.description}</p>
                        </div>

                        <div className="flex justify-between items-center pt-3 border-t border-slate-100 mt-auto">
                          <span className="text-[10px] text-slate-400 font-bold uppercase">Estimated Fare</span>
                          <span className="text-lg font-black text-brand-orange">₦{price.toLocaleString()}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>

            {/* Package Details */}
            <Card bordered={false} className="shadow-sm border border-slate-100 rounded-xl" bodyStyle={{ padding: '24px' }}>
              <h2 className="text-xl font-bold text-[#0A1128] mb-6 flex items-center gap-2">
                <InboxOutlined className="text-brand-orange" /> Delivery Items & Recipient Info
              </h2>
              
              {arrivedItems.length > 0 && (
                <Form.Item 
                  name="arrivedItem" 
                  label={<span className="text-[10px] font-bold text-brand-orange uppercase tracking-wider">SELECT ARRIVED SHIPMENT (PRE-FILL DETAILS)</span>}
                >
                  <Select 
                    size="large"
                    placeholder="Select package or consolidation arrived at warehouse..."
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
                <Input size="large" placeholder="e.g. Electronics, Clothing batch, Industrial spare parts" className="bg-slate-50 border-slate-200 py-3 rounded-xl" />
              </Form.Item>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Form.Item 
                  name="dropoffContactName" 
                  label={<span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">RECIPIENT NAME <span className="text-red-500">*</span></span>}
                  rules={[{ required: true, message: 'Please enter recipient name' }]}
                >
                  <Input size="large" placeholder="Contact person name" className="bg-slate-50 border-slate-200 py-3 rounded-xl" />
                </Form.Item>
                <Form.Item 
                  name="dropoffPhone" 
                  label={<span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">RECIPIENT PHONE NUMBER <span className="text-red-500">*</span></span>}
                  rules={[{ required: true, message: 'Please enter recipient phone number' }]}
                >
                  <Input size="large" placeholder="+234 800 000 0000" className="bg-slate-50 border-slate-200 py-3 rounded-xl" />
                </Form.Item>
              </div>
            </Card>

          </div>

          {/* Right Column - Summary */}
          <div className="lg:col-span-1">
            <Card bordered={false} className="shadow-lg border-t-4 border-[#0A1128] rounded-2xl sticky top-24" bodyStyle={{ padding: '0' }}>
              <div className="p-6 border-b border-slate-100">
                <h2 className="text-xl font-bold text-[#0A1128] m-0">Dispatch Fare Breakdown</h2>
              </div>
              
              <div className="p-6 space-y-4 text-sm">
                <div className="flex justify-between items-center text-slate-600">
                  <span>Selected Vehicle</span>
                  <span className="font-bold text-[#0A1128]">{selectedVehicle?.name || 'Standard Vehicle'}</span>
                </div>
                <div className="flex justify-between items-center text-slate-600">
                  <span>Destination Region</span>
                  <span className="font-bold text-brand-orange">{dropoffCity}</span>
                </div>
                <div className="flex justify-between items-center text-slate-600">
                  <span>Regional Fare</span>
                  <span className="font-mono font-bold">₦{currentPrice.toLocaleString()}</span>
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

              <div className="p-6 bg-slate-50 border-t border-slate-100 rounded-b-2xl">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">TOTAL FARE</span>
                  <span className="text-3xl font-black text-[#0A1128]">
                    ₦{currentPrice.toLocaleString()}
                  </span>
                </div>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  loading={submitting} 
                  size="large" 
                  block 
                  className="bg-brand-orange hover:bg-[#E86E21] border-none font-bold shadow-md h-12 text-base rounded-xl"
                >
                  CONFIRM DISPATCH REQUEST →
                </Button>
              </div>
            </Card>
          </div>
          
        </div>
      </Form>
    </div>
  );
};
