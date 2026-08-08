import React from 'react';
import { Card, InputNumber, Switch, Button, Timeline } from 'antd';
import { SyncOutlined, SaveOutlined, HistoryOutlined, SwapOutlined, WalletOutlined, ShoppingCartOutlined } from '@ant-design/icons';

export const FinancialRatesConfig: React.FC = () => {
  return (
    <div className="animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-[#0A1128] m-0 mb-2 tracking-tight">Exchange & Financial Rates</h1>
          <p className="text-slate-600 text-base m-0 max-w-2xl leading-relaxed">
            Configure global currency conversions, procurement service fees, and transaction charges across the platform.
          </p>
        </div>
        <div className="flex gap-3">
          <Button size="large" icon={<HistoryOutlined />} className="font-bold border-slate-200 text-slate-600 bg-slate-50">
            View History
          </Button>
          <Button type="primary" size="large" icon={<SaveOutlined />} className="bg-[#0A1128] hover:bg-[#1a2542] border-none font-bold shadow-md">
            Save Configuration
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Global Exchange Rates */}
          <Card bordered={false} className="shadow-sm border border-slate-100 rounded-xl bg-white" bodyStyle={{ padding: '24px' }}>
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center text-lg">
                  <SwapOutlined />
                </div>
                <h2 className="text-xl font-bold text-[#0A1128] m-0">Global Exchange Rates</h2>
              </div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 text-brand-orange text-[10px] font-bold uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-orange animate-pulse"></span>
                Live Sync: Active
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 mb-6">
              {[
                { pair: 'USD TO NGN', base: 'BASE RATE', val: 1250.00, info: 'Last updated: 2 mins ago via API', icon: '⚡' },
                { pair: 'CNY TO NGN', base: '', val: 175.50, info: 'Manual Override Active', icon: '✏️' },
                { pair: 'GBP TO NGN', base: '', val: 1580.20, info: '', icon: '' },
                { pair: 'EUR TO NGN', base: '', val: 1350.75, info: '', icon: '' },
              ].map((rate, idx) => (
                <div key={idx}>
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                    {rate.pair} {rate.base && <span className="text-slate-400">({rate.base})</span>}
                  </div>
                  <div className="flex items-center bg-slate-50 rounded-lg border border-slate-100 p-3 mb-1">
                    <span className="text-lg font-bold text-slate-400 mr-2">$1 = ₦</span>
                    <InputNumber 
                      value={rate.val} 
                      precision={2} 
                      className="w-full bg-transparent border-none text-2xl font-extrabold text-[#0A1128] [&_.ant-input-number-input]:p-0 h-auto focus:shadow-none" 
                      controls={true}
                    />
                  </div>
                  {rate.info && (
                    <div className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                      <span>{rate.icon}</span> {rate.info}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="bg-slate-50 p-4 rounded-lg flex items-start gap-3 border border-slate-100">
              <div className="text-slate-400 mt-0.5">ⓘ</div>
              <p className="text-xs text-slate-500 m-0 leading-relaxed">
                Base rates are synced automatically from OpenExchangeRates API every 15 minutes. Manual overrides will persist for 24 hours unless explicitly locked.
              </p>
            </div>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Wallet Operations */}
            <Card bordered={false} className="shadow-sm border border-slate-100 rounded-xl bg-white" bodyStyle={{ padding: '24px' }}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-md bg-orange-50 text-brand-orange flex items-center justify-center">
                  <WalletOutlined />
                </div>
                <h2 className="text-base font-bold text-[#0A1128] m-0">Wallet Operations</h2>
              </div>
              
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-bold text-slate-700">Funding Fee (%)</span>
                    <span className="text-sm font-bold text-brand-orange">1.5%</span>
                  </div>
                  <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-brand-orange w-[15%] rounded-full"></div>
                  </div>
                  <div className="mt-1 flex justify-center">
                     <div className="w-3 h-3 bg-brand-orange rounded-full -mt-2 shadow"></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-bold text-slate-700">Withdrawal Fee (Flat)</span>
                    <span className="text-sm font-bold text-red-500">₦500.00</span>
                  </div>
                  <InputNumber 
                    value={500} 
                    prefix="₦" 
                    className="w-full h-10 bg-slate-50 border-transparent text-sm font-bold rounded-lg" 
                  />
                </div>
              </div>
            </Card>

            {/* Procurement Services */}
            <Card bordered={false} className="shadow-sm border border-slate-100 rounded-xl bg-white" bodyStyle={{ padding: '24px' }}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-md bg-blue-50 text-blue-500 flex items-center justify-center">
                  <ShoppingCartOutlined />
                </div>
                <h2 className="text-base font-bold text-[#0A1128] m-0">Procurement Services</h2>
              </div>
              
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-bold text-slate-700">Buy For Me Fee (%)</span>
                    <span className="text-sm font-bold text-[#0A1128]">5.0%</span>
                  </div>
                  <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-[#0A1128] w-[50%] rounded-full"></div>
                  </div>
                  <div className="mt-1 flex justify-center">
                     <div className="w-3 h-3 bg-[#0A1128] rounded-full -mt-2 shadow"></div>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4">
                  <span className="text-sm font-bold text-slate-700">Apply Minimum Fee<br/>Floor (₦1000)</span>
                  <Switch defaultChecked className="bg-[#0A1128]" />
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-1 space-y-6">
          {/* Status Card */}
          <Card bordered={false} className="shadow-md border-none rounded-xl bg-[#0A1128] text-white overflow-hidden relative" bodyStyle={{ padding: '24px' }}>
            <div className="absolute right-0 bottom-0 w-32 h-32 bg-white/5 skew-x-12 translate-x-10 translate-y-10"></div>
            <div className="relative z-10">
              <h3 className="text-base font-bold mb-4">Financial Engine Status</h3>
              <div className="flex items-center gap-2 mb-6 text-green-400 font-bold text-xs uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span> System Optimal
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between border-b border-white/10 pb-2">
                  <span className="text-slate-400">Last Sync:</span>
                  <span className="font-mono text-blue-200">14:32:05 UTC</span>
                </div>
                <div className="flex justify-between border-b border-white/10 pb-2">
                  <span className="text-slate-400">Active Markets:</span>
                  <span className="font-bold">4/4</span>
                </div>
                <div className="flex justify-between pb-1">
                  <span className="text-slate-400">Pending Overrides:</span>
                  <span className="font-bold">1</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Rate Change Log */}
          <Card bordered={false} className="shadow-sm border border-slate-100 rounded-xl bg-white" bodyStyle={{ padding: '24px' }}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-base font-bold text-[#0A1128] m-0">Rate Change Log</h2>
              <HistoryOutlined className="text-slate-400" />
            </div>
            
            <Timeline
              items={[
                {
                  color: 'blue',
                  children: (
                    <div className="pb-4">
                      <div className="font-bold text-sm text-[#0A1128]">CNY Rate Overridden</div>
                      <div className="text-xs text-slate-400 mb-1">Admin User • 10 mins ago</div>
                      <div className="inline-block bg-slate-50 px-2 py-0.5 rounded text-xs text-slate-600 font-mono border border-slate-100">
                        <span className="line-through opacity-50 mr-1">175.00</span> → <span className="text-blue-600 font-bold">175.50</span>
                      </div>
                    </div>
                  )
                },
                {
                  color: 'gray',
                  children: (
                    <div className="pb-4">
                      <div className="font-bold text-sm text-[#0A1128]">Auto Sync Completed</div>
                      <div className="text-xs text-slate-400">System • 2 hrs ago</div>
                    </div>
                  )
                },
                {
                  color: 'orange',
                  children: (
                    <div>
                      <div className="font-bold text-sm text-[#0A1128]">Procurement Fee Adjusted</div>
                      <div className="text-xs text-slate-400 mb-1">Super Admin • Yesterday</div>
                      <div className="inline-block bg-orange-50 px-2 py-0.5 rounded text-xs text-brand-orange font-bold border border-orange-100">
                        <span className="line-through opacity-50 mr-1">4.5%</span> → 5.0%
                      </div>
                    </div>
                  )
                }
              ]}
            />
            <Button type="link" className="w-full text-center mt-2 text-slate-500 font-medium hover:text-[#0A1128]">
              View All Logs
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
};
