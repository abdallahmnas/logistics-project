import React, { useEffect, useState } from 'react';
import { Card, Input, InputNumber, Button, message, Spin, Divider } from 'antd';
import { SaveOutlined, SwapOutlined, WalletOutlined, ShoppingCartOutlined, BankOutlined, CarOutlined, RocketOutlined } from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { fetchSettings, updateSettings, type SystemSettings } from '../../../store/slices/settingsSlice';

export const FinancialRatesConfig: React.FC = () => {
  const dispatch = useAppDispatch();
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
      message.success('Platform rates, receiving accounts, and fee configuration saved successfully!');
    } catch (err: any) {
      const errorMsg = typeof err === 'string' ? err : err?.message || 'Failed to save configuration';
      message.error(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  if (loading && !settings) {
    return (
      <div className="flex justify-center items-center py-24">
        <Spin size="large" tip="Loading financial settings..." />
      </div>
    );
  }

  return (
    <div className="animate-fade-in-up pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-[#0A1128] m-0 mb-2 tracking-tight">Exchange & Financial Rates</h1>
          <p className="text-slate-600 text-base m-0 max-w-2xl leading-relaxed">
            Configure global currency exchange rates, company receiving accounts for Naira/Yen transfers, freight charges, Buy-For-Me procurement fees, and local dispatch parameters.
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            type="primary"
            size="large"
            icon={<SaveOutlined />}
            loading={saving}
            onClick={handleSave}
            className="bg-[#0A1128] hover:bg-[#1a2542] border-none font-bold shadow-md h-12 px-6 text-base"
          >
            Save Configuration
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* SECTION 1: RECEIVING ACCOUNTS (NAIRA & YEN) */}
        <Card bordered={false} className="shadow-sm border border-slate-200 rounded-2xl bg-white" bodyStyle={{ padding: '24px' }}>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl">
              <BankOutlined />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-[#0A1128] m-0">1. Company Receiving Account Details</h2>
              <p className="text-xs text-slate-500 m-0">Visible to customers at the point of making bank/wallet transfers</p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Naira Escrow Account */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <div className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <span>🇳🇬</span> Naira Escrow Deposit Account Details (Customer Transfer Target)
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Bank Name</label>
                  <Input
                    value={formData.ngnEscrowBankName || ''}
                    onChange={(e) => handleChange('ngnEscrowBankName', e.target.value)}
                    placeholder="e.g. GTBank"
                    className="bg-white border-slate-300 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Account Number</label>
                  <Input
                    value={formData.ngnEscrowAccountNo || ''}
                    onChange={(e) => handleChange('ngnEscrowAccountNo', e.target.value)}
                    placeholder="e.g. 0123456789"
                    className="bg-white border-slate-300 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Account Name</label>
                  <Input
                    value={formData.ngnEscrowAccountName || ''}
                    onChange={(e) => handleChange('ngnEscrowAccountName', e.target.value)}
                    placeholder="Account name"
                    className="bg-white border-slate-300 font-bold"
                  />
                </div>
              </div>
            </div>

            {/* Yen / RMB Receiving Account Details */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <div className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <span>🇨🇳</span> Yen / RMB Receiving Accounts (For RMB ➔ NGN Exchange Transfers)
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Alipay ID / Account</label>
                  <Input
                    value={formData.rmbReceivingAlipay || ''}
                    onChange={(e) => handleChange('rmbReceivingAlipay', e.target.value)}
                    placeholder="hamza_rmb@alipay.com"
                    className="bg-white border-slate-300 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">WeChat Pay ID</label>
                  <Input
                    value={formData.rmbReceivingWechat || ''}
                    onChange={(e) => handleChange('rmbReceivingWechat', e.target.value)}
                    placeholder="HamzaRMB_Pay"
                    className="bg-white border-slate-300 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Chinese Bank Name</label>
                  <Input
                    value={formData.rmbReceivingBankName || ''}
                    onChange={(e) => handleChange('rmbReceivingBankName', e.target.value)}
                    placeholder="ICBC Bank"
                    className="bg-white border-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">RMB Bank Account No.</label>
                  <Input
                    value={formData.rmbReceivingAccountNo || ''}
                    onChange={(e) => handleChange('rmbReceivingAccountNo', e.target.value)}
                    placeholder="6222021001008888888"
                    className="bg-white border-slate-300 font-mono"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Chinese Bank Account Name</label>
                <Input
                  value={formData.rmbReceivingAccountName || ''}
                  onChange={(e) => handleChange('rmbReceivingAccountName', e.target.value)}
                  placeholder="Guangzhou Hamza Logistics Co., Ltd"
                  className="bg-white border-slate-300 font-bold"
                />
              </div>
            </div>
          </div>
        </Card>

        {/* SECTION 2: GLOBAL CURRENCY EXCHANGE RATES */}
        <Card bordered={false} className="shadow-sm border border-slate-200 rounded-2xl bg-white" bodyStyle={{ padding: '24px' }}>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl">
              <SwapOutlined />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-[#0A1128] m-0">2. Currency Exchange Rates</h2>
              <p className="text-xs text-slate-500 m-0">Set platform exchange conversion rates</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <label className="block text-xs font-bold text-slate-700 uppercase mb-2">CNY / NGN Rate (NGN per 1 RMB)</label>
              <div className="flex items-center">
                <span className="text-sm font-bold text-slate-500 mr-2">¥1 = ₦</span>
                <InputNumber
                  value={formData.cnyExchangeRate}
                  onChange={(v) => handleChange('cnyExchangeRate', v)}
                  precision={2}
                  size="large"
                  className="w-full font-extrabold text-xl text-[#0A1128]"
                />
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <label className="block text-xs font-bold text-slate-700 uppercase mb-2">USD / NGN Rate (NGN per 1 USD)</label>
              <div className="flex items-center">
                <span className="text-sm font-bold text-slate-500 mr-2">$1 = ₦</span>
                <InputNumber
                  value={formData.usdExchangeRate}
                  onChange={(v) => handleChange('usdExchangeRate', v)}
                  precision={2}
                  size="large"
                  className="w-full font-extrabold text-xl text-[#0A1128]"
                />
              </div>
            </div>
          </div>

          {/* SECTION 3: SHIPMENT FREIGHT RATES (SEA VS AIR) */}
          <Divider className="my-6" />

          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center text-lg">
              <RocketOutlined />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-[#0A1128] m-0">3. Shipment Freight Rates (Air vs Sea)</h2>
              <p className="text-xs text-slate-500 m-0">Set charges per kg / per cbm for cargo consolidation</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Air Freight Rate (₦ / kg)</label>
              <InputNumber
                value={formData.airFreightRatePerKg}
                onChange={(v) => handleChange('airFreightRatePerKg', v)}
                prefix="₦"
                size="large"
                className="w-full font-bold"
              />
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Sea Freight Rate (₦ / cbm)</label>
              <InputNumber
                value={formData.seaFreightRatePerCbm}
                onChange={(v) => handleChange('seaFreightRatePerCbm', v)}
                prefix="₦"
                size="large"
                className="w-full font-bold"
              />
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Sea Freight Rate (₦ / kg)</label>
              <InputNumber
                value={formData.seaFreightRatePerKg}
                onChange={(v) => handleChange('seaFreightRatePerKg', v)}
                prefix="₦"
                size="large"
                className="w-full font-bold"
              />
            </div>
          </div>
        </Card>

        {/* SECTION 4: BUY FOR ME PROCUREMENT FEES */}
        <Card bordered={false} className="shadow-sm border border-slate-200 rounded-2xl bg-white" bodyStyle={{ padding: '24px' }}>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-xl">
              <ShoppingCartOutlined />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-[#0A1128] m-0">4. Buy-For-Me Procurement Charges</h2>
              <p className="text-xs text-slate-500 m-0">Configure service percentage and floor fees for purchasing goods from China</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Buy For Me Fee (%)</label>
              <InputNumber
                value={formData.buyForMeFeePercent}
                onChange={(v) => handleChange('buyForMeFeePercent', v)}
                suffix="%"
                precision={1}
                size="large"
                className="w-full font-extrabold text-xl"
              />
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Fixed / Minimum Floor Fee (₦)</label>
              <InputNumber
                value={formData.buyForMeFixedFee}
                onChange={(v) => handleChange('buyForMeFixedFee', v)}
                prefix="₦"
                size="large"
                className="w-full font-extrabold text-xl"
              />
            </div>
          </div>
        </Card>

        {/* SECTION 5: LOCAL DISPATCH DELIVERY FEES */}
        <Card bordered={false} className="shadow-sm border border-slate-200 rounded-2xl bg-white" bodyStyle={{ padding: '24px' }}>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-orange-50 text-brand-orange flex items-center justify-center text-xl">
              <CarOutlined />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-[#0A1128] m-0">5. Local Dispatch Delivery Fees</h2>
              <p className="text-xs text-slate-500 m-0">Base rates and per-kilometer distance charges for local doorstep delivery</p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Express Motorbike */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Express Motorbike Base Rate (₦)</label>
                <InputNumber
                  value={formData.deliveryMotorbikeBaseRate}
                  onChange={(v) => handleChange('deliveryMotorbikeBaseRate', v)}
                  prefix="₦"
                  size="large"
                  className="w-full font-bold"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Motorbike Per-KM Fare (₦)</label>
                <InputNumber
                  value={formData.deliveryMotorbikePerKm}
                  onChange={(v) => handleChange('deliveryMotorbikePerKm', v)}
                  prefix="₦"
                  size="large"
                  className="w-full font-bold"
                />
              </div>
            </div>

            {/* Standard Sedan */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Standard Sedan Base Rate (₦)</label>
                <InputNumber
                  value={formData.deliverySedanBaseRate}
                  onChange={(v) => handleChange('deliverySedanBaseRate', v)}
                  prefix="₦"
                  size="large"
                  className="w-full font-bold"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Sedan Per-KM Fare (₦)</label>
                <InputNumber
                  value={formData.deliverySedanPerKm}
                  onChange={(v) => handleChange('deliverySedanPerKm', v)}
                  prefix="₦"
                  size="large"
                  className="w-full font-bold"
                />
              </div>
            </div>
          </div>
        </Card>

      </div>

      {/* Save Floating Bar */}
      <div className="mt-8 flex justify-end">
        <Button
          type="primary"
          size="large"
          icon={<SaveOutlined />}
          loading={saving}
          onClick={handleSave}
          className="bg-[#0A1128] hover:bg-[#1a2542] border-none font-bold shadow-lg h-14 px-8 text-lg rounded-xl"
        >
          Save Financial & Receiving Settings
        </Button>
      </div>
    </div>
  );
};
