import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, Card, Select, InputNumber, Tag, message } from 'antd';
import { CalculatorOutlined, ArrowRightOutlined, PhoneOutlined } from '@ant-design/icons';
import { useAppSelector } from '../../store/hooks';

const { Option } = Select;

export const GetQuotePage: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { settings } = useAppSelector((state) => state.settings);

  const [modality, setModality] = useState<'air' | 'sea'>('air');
  const [weightKg, setWeightKg] = useState<number>(10);
  const [volumeCbm, setVolumeCbm] = useState<number>(0.5);
  const [origin, setOrigin] = useState<string>('guangzhou');
  const [destination, setDestination] = useState<string>('kano');

  // Pull live rates from Admin Settings panel
  const airRatePerKgUsd = settings?.airFreightRatePerKg ?? 7.50;
  const seaRatePerCbmUsd = settings?.seaFreightRatePerCbm ?? 240;
  const usdToNaira = settings?.usdExchangeRate ?? 1550;

  // Calculate NGN estimate
  let estimatedNaira = 0;
  let estimatedTransit = '';
  let estimatedUnit = '';

  if (modality === 'air') {
    const usd = Math.max(weightKg * airRatePerKgUsd, 25);
    estimatedNaira = Math.round(usd * usdToNaira);
    estimatedTransit = '3–5 Business Days';
    estimatedUnit = `Based on ${weightKg} KG × ₦${(airRatePerKgUsd * usdToNaira).toLocaleString()}/kg`;
  } else {
    const usd = Math.max(volumeCbm * seaRatePerCbmUsd, 50);
    estimatedNaira = Math.round(usd * usdToNaira);
    estimatedTransit = '30–45 Days';
    estimatedUnit = `Based on ${volumeCbm} CBM × ₦${(seaRatePerCbmUsd * usdToNaira).toLocaleString()}/CBM`;
  }

  const destinationLabel = destination === 'kano' ? 'Kano Hub — No. 08 Gwarzo Road' : 'Lagos Central Warehouse';
  const originLabel = origin === 'guangzhou' ? 'Guangzhou Warehouse Hub' : 'Yiwu International Mansion Hub';

  const onFinish = (values: any) => {
    const params = new URLSearchParams({
      mode: modality,
      origin,
      destination,
      weight: String(weightKg),
      volume: String(volumeCbm),
      estimatedNgn: String(estimatedNaira),
      description: values.description || '',
    });
    navigate(`/customer/shipments/pre-alert?${params.toString()}`);
  };

  return (
    <div className="min-h-screen font-sans" style={{ background: '#f4f6fb' }}>

      {/* ── Hero Banner ── */}
      <section className="relative py-14" style={{ background: 'linear-gradient(135deg, #0A1B3A 0%, #14274F 100%)' }}>
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#C0262D_1px,transparent_1px)] [background-size:22px_22px]" />
        <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-red-500/40 bg-red-600/20 text-red-400 text-xs font-black uppercase tracking-widest mb-5">
            <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
            China ➔ Nigeria Freight Calculator
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight mb-3">
            Get Your Shipping Quote
          </h1>
          <p className="text-slate-300 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            Instant estimates for Express Air & Ocean Sea Freight — from our Guangzhou & Yiwu warehouses to Kano and Lagos.
          </p>
        </div>
      </section>

      {/* ── Main Content ── */}
      <section className="py-12 lg:py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-6xl mx-auto">

            {/* ── Calculator Card (8 cols) ── */}
            <div className="lg:col-span-8">
              <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-8">

                {/* Card Header */}
                <div className="flex items-center justify-between mb-8 pb-5 border-b border-slate-100">
                  <div>
                    <h2 className="text-xl font-black text-slate-900 flex items-center gap-2 m-0">
                      <CalculatorOutlined className="text-red-600" /> Freight Rate Estimator
                    </h2>
                    <p className="text-slate-500 text-xs mt-1 m-0">
                      Guangzhou & Yiwu → Kano & Lagos
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-black border border-emerald-300 bg-emerald-50 text-emerald-700">
                    🇨🇳 China → 🇳🇬 Nigeria
                  </span>
                </div>

                <Form form={form} layout="vertical" onFinish={onFinish} size="large">

                  {/* Step 1 — Service */}
                  <div className="mb-8">
                    <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-3">
                      1. Select Shipping Service
                    </p>
                    <div className="grid grid-cols-2 gap-4">

                      {/* Air Freight */}
                      <button
                        type="button"
                        onClick={() => setModality('air')}
                        className={`p-5 rounded-2xl border-2 text-left transition-all flex flex-col gap-3 cursor-pointer ${
                          modality === 'air'
                            ? 'border-red-500 bg-red-50 shadow-md'
                            : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
                        }`}
                      >
                        <span className="text-3xl">✈️</span>
                        <div>
                          <div className={`font-black text-base ${modality === 'air' ? 'text-red-700' : 'text-slate-800'}`}>
                            Express Air Freight
                          </div>
                          <div className="text-xs text-slate-500 mt-0.5 font-medium">
                            Per KG · 3–5 Business Days
                          </div>
                        </div>
                        {modality === 'air' && (
                          <span className="text-[10px] font-black text-red-600 uppercase tracking-widest">✓ Selected</span>
                        )}
                      </button>

                      {/* Sea Freight */}
                      <button
                        type="button"
                        onClick={() => setModality('sea')}
                        className={`p-5 rounded-2xl border-2 text-left transition-all flex flex-col gap-3 cursor-pointer ${
                          modality === 'sea'
                            ? 'border-blue-500 bg-blue-50 shadow-md'
                            : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
                        }`}
                      >
                        <span className="text-3xl">🚢</span>
                        <div>
                          <div className={`font-black text-base ${modality === 'sea' ? 'text-blue-700' : 'text-slate-800'}`}>
                            Ocean Sea Freight
                          </div>
                          <div className="text-xs text-slate-500 mt-0.5 font-medium">
                            Per CBM · 30–45 Days
                          </div>
                        </div>
                        {modality === 'sea' && (
                          <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">✓ Selected</span>
                        )}
                      </button>

                    </div>
                  </div>

                  {/* Step 2 — Route */}
                  <div className="mb-8">
                    <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-3">
                      2. Select Route
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                      <Form.Item
                        label={<span className="text-sm font-bold text-slate-700">China Receiving Warehouse</span>}
                        className="mb-0"
                      >
                        <Select value={origin} onChange={setOrigin} size="large" className="w-full">
                          <Option value="guangzhou">🇨🇳 Guangzhou Warehouse</Option>
                          <Option value="yiwu">🇨🇳 Yiwu — Chouzhou North Rd</Option>
                        </Select>
                      </Form.Item>

                      <Form.Item
                        label={<span className="text-sm font-bold text-slate-700">Nigeria Destination Hub</span>}
                        className="mb-0"
                      >
                        <Select value={destination} onChange={setDestination} size="large" className="w-full">
                          <Option value="kano">🇳🇬 Kano Hub — Gwarzo Road</Option>
                          <Option value="lagos">🇳🇬 Lagos Central Warehouse</Option>
                        </Select>
                      </Form.Item>

                    </div>
                  </div>

                  {/* Step 3 — Cargo Specs */}
                  <div className="mb-8">
                    <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-3">
                      3. Cargo Specifications
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                      <Form.Item
                        label={<span className="text-sm font-bold text-slate-700">Gross Weight (KG)</span>}
                        className="mb-0"
                      >
                        <InputNumber
                          min={0.1} max={5000}
                          value={weightKg}
                          onChange={(v) => setWeightKg(v || 1)}
                          className="w-full"
                          addonAfter="KG"
                        />
                      </Form.Item>

                      {modality === 'sea' && (
                        <Form.Item
                          label={<span className="text-sm font-bold text-slate-700">Volume (CBM)</span>}
                          className="mb-0"
                        >
                          <InputNumber
                            min={0.01} max={500}
                            value={volumeCbm}
                            onChange={(v) => setVolumeCbm(v || 0.1)}
                            className="w-full"
                            addonAfter="CBM"
                          />
                        </Form.Item>
                      )}

                    </div>
                  </div>

                  {/* Cargo Description */}
                  <Form.Item
                    label={<span className="text-sm font-bold text-slate-700">Cargo Description (Optional)</span>}
                    name="description"
                    className="mb-6"
                  >
                    <Input.TextArea
                      rows={2}
                      placeholder="e.g. Shoes, clothing, electronics, solar panels..."
                      className="rounded-xl"
                    />
                  </Form.Item>

                  {/* ── Estimate Result Card ── */}
                  <div
                    className="rounded-2xl p-6 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6"
                    style={{
                      background: modality === 'air'
                        ? 'linear-gradient(135deg, #fff5f5 0%, #ffe8e8 100%)'
                        : 'linear-gradient(135deg, #eff8ff 0%, #dbeafe 100%)',
                      border: modality === 'air' ? '2px solid #fca5a5' : '2px solid #93c5fd',
                    }}
                  >
                    <div>
                      <p className="text-xs font-black uppercase tracking-widest mb-1"
                        style={{ color: modality === 'air' ? '#b91c1c' : '#1d4ed8' }}>
                        Estimated Freight Cost
                      </p>
                      <div className="text-4xl font-black text-slate-900">
                        ₦{estimatedNaira.toLocaleString()}
                        <span className="text-lg font-bold text-slate-500 ml-2">NGN</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1.5 font-medium">{estimatedUnit}</p>
                      <p className="text-xs font-bold mt-1" style={{ color: modality === 'air' ? '#dc2626' : '#2563eb' }}>
                        ⏱ Estimated Transit: {estimatedTransit}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-1">
                        * Estimate only. Final rate confirmed after cargo inspection.
                      </p>
                    </div>

                    <div className="w-full sm:w-auto shrink-0">
                      <Button
                        type="primary"
                        htmlType="submit"
                        size="large"
                        icon={<ArrowRightOutlined />}
                        className="w-full sm:w-auto !bg-[#C0262D] hover:!bg-[#a01f25] !border-none font-black !px-8 !rounded-xl shadow-lg"
                      >
                        Create Pre-Alert Shipment
                      </Button>
                    </div>
                  </div>

                </Form>
              </div>
            </div>

            {/* ── Right Sidebar (4 cols) ── */}
            <div className="lg:col-span-4 flex flex-col gap-5">

              {/* China Card */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <span className="inline-block px-3 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-black uppercase tracking-wider border border-blue-200 mb-4">
                  🇨🇳 China Receiving Hubs
                </span>
                <h3 className="text-base font-black text-slate-900 mb-2">Yiwu & Guangzhou Warehouses</h3>
                <p className="text-slate-600 text-sm leading-relaxed mb-3">
                  {settings?.chinaAirCargoAddressEn || 'Room 602, International Trade Mansion, Chouzhou North Road, Yiwu City, Zhejiang Province, China'}
                </p>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 mb-4 font-mono text-xs text-slate-600">
                  中文地址：<br />
                  <span className="text-slate-800 font-semibold">{settings?.chinaAirCargoAddressCn || '义乌市稠州北路国贸大厦6楼602'}</span>
                </div>
                <a
                  href={`tel:${settings?.chinaAirCargoPhone || '+8615868907118'}`}
                  className="inline-flex items-center gap-2 text-red-600 font-bold text-sm hover:underline"
                >
                  <PhoneOutlined /> {settings?.chinaAirCargoPhone || '+86 158 6890 7118'}
                </a>
              </div>

              {/* Nigeria Card */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <span className="inline-block px-3 py-1 rounded-md bg-emerald-50 text-emerald-700 text-xs font-black uppercase tracking-wider border border-emerald-200 mb-4">
                  🇳🇬 Nigeria Distribution Hubs
                </span>
                <h3 className="text-base font-black text-slate-900 mb-2">Kano & Lagos Warehouses</h3>
                <p className="text-slate-600 text-sm leading-relaxed mb-4">
                  {settings?.nigeriaOfficeAddress || 'No. 08 Gwarzo Road, Beside Shopwell, Gwale, Kano State, Nigeria'}
                </p>

                <div className="border-t border-slate-100 pt-4">
                  <p className="text-[11px] font-black text-slate-400 uppercase tracking-wider mb-3">
                    WhatsApp Representatives
                  </p>
                  <div className="flex flex-col gap-2">
                    {(() => {
                      try {
                        const list = settings?.companyContacts ? JSON.parse(settings.companyContacts) : [];
                        return list.slice(0, 4).map((c: any, i: number) => (
                          <a
                            key={i}
                            href={`https://wa.me/${c.phone.replace(/[^0-9]/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-slate-700 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors"
                          >
                            <span className="font-bold text-slate-800">{c.name}</span>
                            <span className="font-mono text-slate-500">{c.phone}</span>
                          </a>
                        ));
                      } catch {
                        return (
                          <a
                            href="https://wa.me/8615868907118"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between bg-slate-50 hover:bg-emerald-50 border border-slate-200 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-700"
                          >
                            <span className="font-bold">Logistics Desk</span>
                            <span className="font-mono text-slate-500">+86 158 6890 7118</span>
                          </a>
                        );
                      }
                    })()}
                  </div>
                </div>
              </div>

            </div>

          </div>
        </div>
      </section>
    </div>
  );
};

export default GetQuotePage;
