import React from 'react';
import { Card, InputNumber, Switch, Button } from 'antd';
import { GlobalOutlined, RocketOutlined } from '@ant-design/icons';

export const ShippingRatesConfig: React.FC = () => {
  return (
    <div className="animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-[#0A1128] m-0 mb-2 tracking-tight">Shipping Rates Config</h1>
          <p className="text-slate-600 text-base m-0 max-w-2xl leading-relaxed">
            Manage regional logistics pricing structures.
          </p>
        </div>
        <div className="flex gap-3">
          <Button size="large" className="font-bold border-slate-200 text-slate-600">
            Discard
          </Button>
          <Button type="primary" size="large" className="bg-[#b34000] hover:bg-[#993600] border-none font-bold">
            Save Changes
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Global Thresholds */}
          <Card bordered={false} className="shadow-sm border border-slate-100 rounded-xl bg-slate-50" bodyStyle={{ padding: '24px' }}>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-[#0A1128] text-blue-300 flex items-center justify-center text-xl">
                <GlobalOutlined />
              </div>
              <div>
                <h2 className="text-lg font-bold text-[#0A1128] m-0 mb-1">Global Thresholds</h2>
                <p className="text-slate-500 text-sm m-0">Base requirements before regional logic applies.</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-[#0A1128] mb-2">Minimum Volume (CBM)</label>
                <div className="relative">
                  <InputNumber min={0} defaultValue={0.1} step={0.1} className="w-full h-12 rounded-lg [&_.ant-input-number-input]:h-12 border-transparent hover:border-slate-300 text-lg font-medium" />
                  <span className="absolute right-4 top-[14px] text-slate-400 text-xs">m³</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-[#0A1128] mb-2">Minimum Weight (KG)</label>
                <div className="relative">
                  <InputNumber min={0} defaultValue={1.0} step={0.5} className="w-full h-12 rounded-lg [&_.ant-input-number-input]:h-12 border-transparent hover:border-slate-300 text-lg font-medium" />
                  <span className="absolute right-4 top-[14px] text-slate-400 text-xs">kg</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Regional Zone Rates */}
          <Card bordered={false} className="shadow-sm border border-slate-100 rounded-xl bg-slate-50" bodyStyle={{ padding: '24px' }}>
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#0A1128] text-blue-300 flex items-center justify-center text-xl">
                  <span className="leading-none text-2xl">🗺️</span>
                </div>
                <h2 className="text-lg font-bold text-[#0A1128] m-0">Regional Zone Rates</h2>
              </div>
              <Button type="text" className="font-bold text-slate-700 hover:bg-slate-200">
                + Add Zone
              </Button>
            </div>

            <div className="space-y-6">
              {/* Header Row */}
              <div className="grid grid-cols-12 gap-4 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 pl-4">
                <div className="col-span-3">Zone / Hub</div>
                <div className="col-span-2">Rate / KG ($)</div>
                <div className="col-span-2">Rate / CBM ($)</div>
                <div className="col-span-3">Base Surcharge</div>
                <div className="col-span-2 text-right">Status</div>
              </div>

              {/* Rows */}
              {[
                { name: 'North America', hubs: 'JFK, LAX, YVR', kg: 4.50, cbm: 385.00, surcharge: 50.00, active: true, icon: '✈️' },
                { name: 'EU Gateway', hubs: 'AMS, FRA, LHR', kg: 3.80, cbm: 310.00, surcharge: 35.00, active: true, icon: '🚢' },
                { name: 'APAC Direct', hubs: 'HKG, SIN, TYO', kg: 6.20, cbm: 450.00, surcharge: 75.00, active: false, icon: '🚆' },
              ].map((zone, idx) => (
                <div key={idx} className={`grid grid-cols-12 gap-4 items-center ${!zone.active ? 'opacity-50' : ''}`}>
                  <div className="col-span-3 flex items-start gap-2">
                    <span className="text-lg grayscale opacity-70 mt-1">{zone.icon}</span>
                    <div>
                      <div className="font-bold text-[#0A1128] text-base">{zone.name}</div>
                      <div className="text-xs text-brand-orange uppercase tracking-wider font-bold mt-1">{zone.hubs}</div>
                    </div>
                  </div>
                  <div className="col-span-2 relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold z-10">$</span>
                    <InputNumber value={zone.kg} precision={2} className="w-full bg-white border-transparent pl-4 h-10 [&_.ant-input-number-input]:h-10 text-sm font-bold text-[#0A1128] rounded-md" />
                  </div>
                  <div className="col-span-2 relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold z-10">$</span>
                    <InputNumber value={zone.cbm} precision={2} className="w-full bg-white border-transparent pl-4 h-10 [&_.ant-input-number-input]:h-10 text-sm font-bold text-[#0A1128] rounded-md" />
                  </div>
                  <div className="col-span-3 relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold z-10">$</span>
                    <InputNumber value={zone.surcharge} precision={2} className="w-full bg-white border-transparent pl-4 h-10 [&_.ant-input-number-input]:h-10 text-sm font-bold text-[#0A1128] rounded-md" />
                  </div>
                  <div className="col-span-2 text-right">
                    <Switch checked={zone.active} className={zone.active ? 'bg-[#0A1128]' : 'bg-slate-300'} />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-1 space-y-6">
          {/* Fuel Index Card */}
          <Card bordered={false} className="shadow-md border-none rounded-xl bg-[#0A1128] text-white overflow-hidden relative" bodyStyle={{ padding: '24px' }}>
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-blue-500 rounded-full blur-3xl opacity-20"></div>
            <div className="relative z-10">
              <div className="text-[10px] font-bold tracking-widest text-blue-300 uppercase mb-4">Fuel Index Impact</div>
              <div className="flex items-end gap-2 mb-4">
                <span className="text-5xl font-extrabold">+12.4%</span>
                <RocketOutlined className="text-xl text-brand-orange mb-2" />
              </div>
              <p className="text-sm text-blue-200 mb-8 leading-relaxed">
                Global fuel surcharges are trending upwards. Consider adjusting base rates for Q3.
              </p>
              
              {/* Fake Graph */}
              <div className="h-16 w-full flex items-end justify-between border-b border-white/10 pb-2 relative">
                 <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                    <path d="M0,80 Q10,60 30,70 T60,40 T90,10 L100,10" fill="none" stroke="#f97316" strokeWidth="3" strokeLinecap="round" />
                 </svg>
              </div>
            </div>
          </Card>

          {/* Ancillary Surcharges */}
          <Card bordered={false} className="shadow-sm border border-slate-100 rounded-xl bg-slate-50" bodyStyle={{ padding: '24px' }}>
            <h2 className="text-xl font-bold text-[#0A1128] m-0 mb-6">Ancillary<br/>Surcharges</h2>
            
            <div className="space-y-4">
              {[
                { title: 'Customs Clearance', desc: 'Flat fee per shipment', value: 25, prefix: '$' },
                { title: 'Residential Delivery', desc: 'Last-mile premium', value: 15, prefix: '$' },
                { title: 'Oversize Cargo', desc: '% multiplier', value: 1.5, suffix: 'X' },
              ].map((item, idx) => (
                <div key={idx} className="bg-white p-4 rounded-lg border border-slate-100 flex justify-between items-center">
                  <div>
                    <div className="font-bold text-sm text-[#0A1128]">{item.title}</div>
                    <div className="text-xs text-slate-500">{item.desc}</div>
                  </div>
                  <div className="relative w-20">
                    {item.prefix && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold z-10">{item.prefix}</span>}
                    <InputNumber 
                      value={item.value} 
                      className={`w-full bg-slate-50 border-transparent h-8 [&_.ant-input-number-input]:h-8 text-sm font-bold text-[#0A1128] rounded ${item.prefix ? 'pl-2' : ''}`} 
                    />
                    {item.suffix && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold z-10">{item.suffix}</span>}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
