import React, { useEffect, useState } from 'react';
import { Card, InputNumber, Button, message, Spin, Tag } from 'antd';
import { GlobalOutlined, RocketOutlined, SaveOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { fetchSettings, updateSettings, type SystemSettings } from '../../../store/slices/settingsSlice';

export const ShippingRatesConfig: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { settings, loading } = useAppSelector((state) => state.settings);
  const [formData, setFormData] = useState<Partial<SystemSettings>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    dispatch(fetchSettings());
  }, [dispatch]);

  useEffect(() => {
    if (settings) {
      setFormData(settings);
    }
  }, [settings]);

  const handleChange = (key: keyof SystemSettings, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await dispatch(updateSettings(formData)).unwrap();
      message.success('China ➔ Nigeria freight shipping rates updated successfully!');
    } catch (err: any) {
      const errorMsg = typeof err === 'string' ? err : err?.message || 'Failed to save shipping rates';
      message.error(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  if (loading && !settings) {
    return (
      <div className="flex justify-center items-center py-24">
        <Spin size="large" tip="Loading China ➔ Nigeria route config..." />
      </div>
    );
  }

  return (
    <div className="animate-fade-in-up pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-[#0A1128] m-0 mb-2 tracking-tight">China ➔ Nigeria Freight Rates</h1>
          <p className="text-slate-600 text-base m-0 max-w-2xl leading-relaxed">
            Manage Air & Sea freight charges, package consolidation thresholds, and transit surcharges for the China to Nigeria logistics pipeline.
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            size="large"
            icon={<EnvironmentOutlined />}
            onClick={() => navigate('/admin/warehouse/facilities')}
            className="font-bold border-slate-300 text-slate-700 bg-slate-50 hover:bg-slate-100 h-12 px-5 text-sm"
          >
            Manage Warehouse Facilities ➔
          </Button>
          <Button
            type="primary"
            size="large"
            icon={<SaveOutlined />}
            loading={saving}
            onClick={handleSave}
            className="bg-[#0A1128] hover:bg-[#1a2542] border-none font-bold shadow-md h-12 px-6 text-base"
          >
            Save Freight Rates
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">

          {/* China to Nigeria Generic Freight Rates */}
          <Card bordered={false} className="shadow-sm border border-slate-200 rounded-2xl bg-white" bodyStyle={{ padding: '24px' }}>
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-orange-50 text-brand-orange flex items-center justify-center text-xl">
                  <RocketOutlined />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[#0A1128] m-0">Freight Logistics Pricing</h2>
                  <p className="text-xs text-slate-500 m-0">Standard Air & Sea freight rates for all China ➔ Nigeria shipments</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {[
                {
                  name: 'Air Freight (Express)',
                  desc: 'Fast air cargo dispatch for urgent packages',
                  time: '3 - 5 Business Days',
                  rateKey: 'airFreightRatePerKg',
                  defaultRate: 12500,
                  unit: '₦ / kg',
                  icon: '✈️',
                  tagColor: 'blue',
                },
                {
                  name: 'Air Freight (Standard)',
                  desc: 'Economy air cargo for regular shipments',
                  time: '5 - 7 Business Days',
                  rateKey: 'airFreightRatePerKg',
                  defaultRate: 10500,
                  unit: '₦ / kg',
                  icon: '✈️',
                  tagColor: 'blue',
                },
                {
                  name: 'Sea Freight (Volume - CBM)',
                  desc: 'LCL sea cargo billed by cubic meter volume',
                  time: '35 - 45 Business Days',
                  rateKey: 'seaFreightRatePerCbm',
                  defaultRate: 450000,
                  unit: '₦ / cbm',
                  icon: '🚢',
                  tagColor: 'cyan',
                },
                {
                  name: 'Sea Freight (Weight - KG)',
                  desc: 'Heavy cargo billed by weight',
                  time: '35 - 45 Business Days',
                  rateKey: 'seaFreightRatePerKg',
                  defaultRate: 3500,
                  unit: '₦ / kg',
                  icon: '🚢',
                  tagColor: 'cyan',
                },
              ].map((route, idx) => (
                <div
                  key={idx}
                  className="p-5 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-brand-orange/30 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-2xl shadow-sm">
                      {route.icon}
                    </div>
                    <div>
                      <div className="font-extrabold text-[#0A1128] text-base mb-0.5">{route.name}</div>
                      <p className="text-xs text-slate-500 m-0 mb-1.5">{route.desc}</p>
                      <div className="flex items-center gap-2">
                        <Tag color={route.tagColor} className="m-0 text-[10px] font-bold uppercase rounded-md px-2 py-0.5">
                          {route.time}
                        </Tag>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
                    <div className="text-right">
                      <div className="text-[10px] font-bold text-slate-400 uppercase">Rate Input</div>
                      <div className="text-xs font-bold text-brand-orange">{route.unit}</div>
                    </div>
                    <InputNumber
                      value={formData[route.rateKey as keyof SystemSettings] as number || route.defaultRate}
                      onChange={(val) => handleChange(route.rateKey as keyof SystemSettings, val)}
                      prefix="₦"
                      size="large"
                      className="w-40 font-extrabold text-base rounded-xl"
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Package Consolidation Thresholds */}
          <Card bordered={false} className="shadow-sm border border-slate-200 rounded-2xl bg-white" bodyStyle={{ padding: '24px' }}>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-[#0A1128] text-blue-300 flex items-center justify-center text-xl">
                <GlobalOutlined />
              </div>
              <div>
                <h2 className="text-lg font-bold text-[#0A1128] m-0 mb-1">Package Consolidation Thresholds</h2>
                <p className="text-slate-500 text-xs m-0">Minimum weight and volume criteria for packing items in China warehouses.</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <label className="block text-xs font-bold text-[#0A1128] uppercase mb-2">Minimum Volume (CBM)</label>
                <div className="relative">
                  <InputNumber min={0.01} defaultValue={0.1} step={0.1} precision={2} className="w-full h-12 rounded-lg border-slate-300 text-lg font-bold" />
                  <span className="absolute right-4 top-[14px] text-slate-400 text-xs font-bold">m³</span>
                </div>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <label className="block text-xs font-bold text-[#0A1128] uppercase mb-2">Minimum Weight (KG)</label>
                <div className="relative">
                  <InputNumber min={0.1} defaultValue={1.0} step={0.5} precision={1} className="w-full h-12 rounded-lg border-slate-300 text-lg font-bold" />
                  <span className="absolute right-4 top-[14px] text-slate-400 text-xs font-bold">kg</span>
                </div>
              </div>
            </div>
          </Card>

        </div>

        {/* Right Sidebar: Active Rate Summary */}
        <div className="lg:col-span-1 space-y-6">
          <Card bordered={false} className="shadow-md border-none rounded-2xl bg-[#0A1128] text-white p-2">
            <h3 className="text-base font-bold mb-2 text-white">🇨🇳 ➔ 🇳🇬 China-Nigeria Live Rates</h3>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              All package consolidations submitted by customers are calculated using these central Air & Sea freight rates.
            </p>
            <div className="space-y-3 text-xs bg-white/10 p-3.5 rounded-xl border border-white/10">
              <div className="flex justify-between items-center">
                <span className="text-slate-300">Air Freight Rate:</span>
                <span className="font-extrabold text-amber-300 text-sm">₦{(formData.airFreightRatePerKg || 12500).toLocaleString()}/kg</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-300">Sea Freight Rate:</span>
                <span className="font-extrabold text-cyan-300 text-sm">₦{(formData.seaFreightRatePerCbm || 450000).toLocaleString()}/cbm</span>
              </div>
            </div>

            <Button
              type="primary"
              block
              icon={<EnvironmentOutlined />}
              onClick={() => navigate('/admin/warehouse/facilities')}
              className="mt-4 bg-brand-orange hover:bg-[#E86E21] border-none font-bold h-11"
            >
              Manage Physical Facilities
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
};
