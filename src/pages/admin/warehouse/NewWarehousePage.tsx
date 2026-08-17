import React, { useState } from 'react';
import { Form, Input, Select, Button, Checkbox, Row, Col, message } from 'antd';
import { EnvironmentOutlined, SafetyCertificateOutlined, UserOutlined, PhoneOutlined, MailOutlined, BuildOutlined, SettingOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../../store/hooks';
import { createFacility } from '../../../store/slices/facilitySlice';

const { Option } = Select;

export const NewWarehousePage: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [submitting, setSubmitting] = useState(false);

  const onFinish = async (values: any) => {
    try {
      setSubmitting(true);
      await dispatch(
        createFacility({
          code: values.internalCode || `WH-${Date.now().toString().slice(-4)}`,
          name: values.facilityDesignation,
          location: `${values.municipality || 'City'}, ${values.sector || values.region || 'Region'}`,
          country: values.region === 'china' ? 'CN' : 'NG',
          type: values.classificationType || 'regional_hub',
          status: 'active',
          address: values.address,
          contactName: values.managerName,
          contactPhone: values.managerPhone,
          contactEmail: values.managerEmail,
        })
      ).unwrap();
      message.success('Facility provisioned successfully!');
      navigate('/admin/warehouse/facilities');
    } catch (error: any) {
      message.error(error?.message || 'Failed to create facility');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="animate-fade-in-up max-w-[1200px] mx-auto pb-20 mt-4 px-4">
      
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800 m-0">Add New Facility</h1>
        <p className="text-slate-500 mt-1 mb-0 text-sm">Provision a new regional hub or distribution center to the network</p>
      </div>

      <Form form={form} layout="vertical" onFinish={onFinish} requiredMark={false}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* 01. Core Identity */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="bg-[#F8FAFC] px-6 py-4 border-b border-slate-100 flex items-center gap-3">
                <div className="bg-[#0A1128] text-white p-1.5 rounded-md">
                  <BuildOutlined />
                </div>
                <h2 className="text-lg font-bold text-[#0A1128] m-0">01. Core Identity</h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                  <Form.Item name="facilityDesignation" label={<span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Facility Designation</span>} rules={[{ required: true }]}>
                    <Input size="large" placeholder="e.g., Euro Hub Alpha" className="bg-[#F8FAFC] border-slate-200" />
                  </Form.Item>
                  <Form.Item name="internalCode" label={<span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Internal Code</span>} rules={[{ required: true }]}>
                    <Input size="large" placeholder="WH- EUR-01A" className="bg-[#F8FAFC] border-slate-200" />
                  </Form.Item>
                </div>
                
                <div className="mt-2">
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Classification Type</div>
                  <Form.Item name="classificationType" initialValue="regional_hub" className="mb-0">
                    <Select size="large" className="w-full [&>.ant-select-selector]:!bg-[#F8FAFC]">
                      <Option value="regional_hub">Regional Hub (Tier-1)</Option>
                      <Option value="dist_center">Dist. Center (Tier-2)</Option>
                      <Option value="fulfillment">Fulfillment Node (Tier-3)</Option>
                      <Option value="cross_dock">Cross-Dock (Special)</Option>
                    </Select>
                  </Form.Item>
                </div>
              </div>
            </div>

            {/* 02. Spatial Coordinates */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="bg-[#F8FAFC] px-6 py-4 border-b border-slate-100 flex items-center gap-3">
                <div className="bg-[#0A1128] text-white p-1.5 rounded-md">
                  <EnvironmentOutlined />
                </div>
                <h2 className="text-lg font-bold text-[#0A1128] m-0">02. Spatial Coordinates</h2>
              </div>
              <div className="p-6">
                <div className="h-48 bg-slate-200 rounded-lg mb-6 overflow-hidden relative">
                  <img src="https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=2074&auto=format&fit=crop" alt="Map Placeholder" className="w-full h-full object-cover opacity-60" />
                  <div className="absolute bottom-4 left-4 bg-white/90 px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 shadow-sm text-brand-orange">
                    <div className="w-2 h-2 rounded-full bg-brand-orange animate-pulse"></div>
                    AWAITING GEOCODE
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                  <Form.Item name="region" label={<span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Geographic Region (Country)</span>} rules={[{ required: true }]}>
                    <Select size="large" placeholder="Select Region..." className="[&>.ant-select-selector]:!bg-[#F8FAFC]">
                      <Option value="germany">Germany</Option>
                      <Option value="china">China</Option>
                      <Option value="nigeria">Nigeria</Option>
                    </Select>
                  </Form.Item>
                  <Form.Item name="sector" label={<span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Sector (State/Province)</span>}>
                    <Input size="large" placeholder="e.g., Hesse" className="bg-[#F8FAFC] border-slate-200" />
                  </Form.Item>
                  <Form.Item name="municipality" label={<span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Municipality (City)</span>} rules={[{ required: true }]}>
                    <Input size="large" placeholder="e.g., Frankfurt am Main" className="bg-[#F8FAFC] border-slate-200" />
                  </Form.Item>
                  <Form.Item name="postalCode" label={<span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Postal / Zip Code</span>}>
                    <Input size="large" placeholder="60549" className="bg-[#F8FAFC] border-slate-200" />
                  </Form.Item>
                </div>
                <Form.Item name="address" label={<span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Primary Access Route (Street Address)</span>} rules={[{ required: true }]} className="mb-0">
                  <Input size="large" placeholder="Cargo City Süd, Geb. 532" className="bg-[#F8FAFC] border-slate-200" />
                </Form.Item>
              </div>
            </div>

            {/* 03. Operational Metrics */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="bg-[#F8FAFC] px-6 py-4 border-b border-slate-100 flex items-center gap-3">
                <div className="bg-[#0A1128] text-white p-1.5 rounded-md">
                  <SettingOutlined />
                </div>
                <h2 className="text-lg font-bold text-[#0A1128] m-0">03. Operational Metrics</h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 mb-4">
                  <Form.Item name="totalVolume" label={<span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Volume Area (SQFT)</span>}>
                    <Input size="large" placeholder="250000" type="number" className="bg-[#F8FAFC] border-slate-200" />
                  </Form.Item>
                  <Form.Item name="ingressBays" label={<span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Ingress/Egress Bays</span>}>
                    <Input size="large" placeholder="48" type="number" className="bg-[#F8FAFC] border-slate-200" />
                  </Form.Item>
                </div>
                
                <div>
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Climate & Handling Capabilities</div>
                  <Row gutter={[16, 16]}>
                    <Col span={12}>
                      <Form.Item name="ambientStorage" valuePropName="checked" className="mb-0">
                        <Checkbox className="text-slate-600 font-medium">Ambient Storage</Checkbox>
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item name="coldChain" valuePropName="checked" className="mb-0">
                        <Checkbox className="text-slate-600 font-medium">Cold Chain (Temp Controlled)</Checkbox>
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item name="hazmat" valuePropName="checked" className="mb-0">
                        <Checkbox className="text-slate-600 font-medium">Hazmat Certified</Checkbox>
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item name="secureVault" valuePropName="checked" className="mb-0">
                        <Checkbox className="text-slate-600 font-medium">High-Value Secure Vault</Checkbox>
                      </Form.Item>
                    </Col>
                  </Row>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Command Personnel */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden p-6">
              <div className="flex items-center gap-2 mb-6">
                <SafetyCertificateOutlined className="text-slate-400 text-lg" />
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider m-0">Command Personnel</h3>
              </div>

              <Form.Item name="managerName" label={<span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Site Commander (Manager)</span>}>
                <Input prefix={<UserOutlined className="text-slate-300 mr-2" />} placeholder="Commander Name" variant="borderless" className="border-b border-slate-200 rounded-none px-0 pb-2 shadow-none focus:bg-transparent" />
              </Form.Item>

              <Form.Item name="managerPhone" label={<span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Comms Link (Phone)</span>}>
                <Input prefix={<PhoneOutlined className="text-slate-300 mr-2" />} placeholder="+1 (555) 000-0000" variant="borderless" className="border-b border-slate-200 rounded-none px-0 pb-2 shadow-none focus:bg-transparent" />
              </Form.Item>

              <Form.Item name="managerEmail" label={<span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Secure Channel (Email)</span>} className="mb-0">
                <Input prefix={<MailOutlined className="text-slate-300 mr-2" />} placeholder="commander@logistics.os" variant="borderless" className="border-b border-slate-200 rounded-none px-0 pb-2 shadow-none focus:bg-transparent" />
              </Form.Item>
            </div>

            {/* Provisioning Status */}
            <div className="bg-[#0A1128] rounded-xl shadow-lg border border-slate-700 p-6 text-white">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Provisioning Status</div>
              <div className="flex justify-between items-center mb-6">
                <span className="text-lg font-bold">Data Integrity</span>
                <span className="text-sm font-mono text-slate-400 border border-slate-700 px-2 py-1 rounded">WAITING INPUT</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-brand-orange font-mono">
                <SettingOutlined spin />
                Awaiting final authorization sequence...
              </div>
            </div>

            {/* Commit Button */}
            <div className="bg-[#F8FAFC] rounded-xl border border-slate-200 p-6">
              <p className="text-xs text-slate-500 mb-6 leading-relaxed">
                By initializing this facility, you confirm compliance with Global Logistics OS standard operating procedures for regional node activation.
              </p>
              <Button 
                type="primary" 
                block 
                size="large" 
                htmlType="submit"
                loading={submitting}
                className="!bg-[#D95D10] hover:!bg-[#E86E21] !text-white border-none font-bold tracking-wider shadow-md !h-14 !py-4 text-base"
              >
                COMMIT TO NETWORK
              </Button>
            </div>

          </div>
        </div>
      </Form>

    </div>
  );
};
