import React, { useEffect, useState } from 'react';
import { Card, Form, Input, InputNumber, Select, Button, Alert, message, Tag } from 'antd';
import type { UploadFile } from 'antd';
import { ArrowLeftOutlined, SendOutlined, SwapOutlined, SafetyCertificateOutlined, QrcodeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { fetchActiveRate, submitExchangeRequest } from '../../../store/slices/exchangeSlice';
import { exchangeRequestSchema, validateForm } from '../../../utils/validators';
import { formatRmb } from '../../../utils/formatters';
import type { ExchangeRequestPayload, RmbDestinationType } from '../../../types/exchange.types';
import { ImageDropzone } from '../../../components/common/ImageDropzone';

const PLATFORM_LABELS: Record<RmbDestinationType, string> = {
  alipay: 'Alipay',
  wechat_pay: 'WeChat Pay',
  chinese_bank: 'Chinese Bank Transfer',
};

export const ExchangeRequestForm: React.FC = () => {
  const [form] = Form.useForm();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { activeRate } = useAppSelector((state) => state.exchange);
  const [direction, setDirection] = useState<'ngn_to_rmb' | 'rmb_to_ngn'>('ngn_to_rmb');
  const [amountNaira, setAmountNaira] = useState<number>(0);
  const [amountRmb, setAmountRmb] = useState<number>(0);
  const [submitting, setSubmitting] = useState(false);
  const [qrFileList, setQrFileList] = useState<UploadFile[]>([]);
  const platform: RmbDestinationType | undefined = Form.useWatch('rmbDestType', form);

  useEffect(() => {
    if (!activeRate) {
      dispatch(fetchActiveRate());
    }
  }, [dispatch, activeRate]);

  const calculateRmb = (naira: number) => {
    if (!activeRate || !naira) return 0;
    return Number((naira / activeRate.platformRate).toFixed(2));
  };

  const calculateNaira = (rmb: number) => {
    if (!activeRate || !rmb) return 0;
    return Number((rmb * activeRate.platformRate).toFixed(2));
  };

  const supportsQr = platform === 'alipay' || platform === 'wechat_pay' || direction === 'rmb_to_ngn';

  const onFinish = async (values: any) => {
    setSubmitting(true);
    try {
      const barcodeUrl = qrFileList[0]?.url || qrFileList[0]?.name;
      await dispatch(
        submitExchangeRequest({
          direction,
          amountNaira: direction === 'ngn_to_rmb' ? amountNaira : calculateNaira(amountRmb),
          amountRmb: direction === 'rmb_to_ngn' ? amountRmb : calculateRmb(amountNaira),
          rmbDestType: values.rmbDestType || 'alipay',
          rmbDestAccount: values.rmbDestAccount,
          rmbDestName: values.rmbDestName,
          rmbDestQrCode: barcodeUrl,
          receivingBarcodeUrl: barcodeUrl,
        } as any)
      ).unwrap();
      message.success('Currency exchange request created successfully.');
      navigate('/customer/exchange');
    } catch (err: any) {
      message.error(err?.message || 'Failed to submit exchange request.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="max-w-xl mx-auto">
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/customer/exchange')}
          className="mb-2 -ml-2 text-slate-500"
        >
          Back to Exchange History
        </Button>
        <h1 className="text-2xl font-bold text-slate-800 m-0 text-center">P2P Currency Exchange</h1>
        <p className="text-slate-500 mt-1 mb-4 text-sm text-center">
          Exchange Naira (NGN) $\leftrightarrow$ Chinese Yuan/Yen (RMB) with escrow protection
        </p>

        {/* Direction Switcher Tabs */}
        <div className="flex bg-slate-100 p-1 rounded-xl mb-6">
          <button
            type="button"
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              direction === 'ngn_to_rmb' ? 'bg-white text-brand-navy shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
            onClick={() => setDirection('ngn_to_rmb')}
          >
            🇳🇬 NGN ➔ 🇨🇳 RMB (Naira to Yen)
          </button>
          <button
            type="button"
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              direction === 'rmb_to_ngn' ? 'bg-white text-brand-navy shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
            onClick={() => setDirection('rmb_to_ngn')}
          >
            🇨🇳 RMB ➔ 🇳🇬 NGN (Yen to Naira)
          </button>
        </div>
      </div>

      <div className="flex justify-center">
        <Card bordered={false} className="shadow-sm rounded-2xl w-full max-w-xl">
          <Form form={form} layout="vertical" onFinish={onFinish} requiredMark={false}>
            {/* Currency swap widget */}
            <div className="relative">
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">You send</span>
                  <Tag className="rounded-full border-none bg-slate-100 text-slate-600 font-semibold px-2.5">
                    {direction === 'ngn_to_rmb' ? '🇳🇬 NGN (Naira)' : '🇨🇳 RMB (Yen/Yuan)'}
                  </Tag>
                </div>
                {direction === 'ngn_to_rmb' ? (
                  <Form.Item
                    name="amountNaira"
                    className="mb-0"
                    rules={[{ required: true, message: 'Please enter a Naira amount' }]}
                  >
                    <InputNumber<number>
                      variant="borderless"
                      className="w-full !text-3xl !font-bold !p-0"
                      controls={false}
                      min={1000}
                      formatter={(value) => `₦ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      parser={(value) => Number(value?.replace(/[₦,\s]/g, '') || 0)}
                      onChange={(val) => setAmountNaira(Number(val))}
                    />
                  </Form.Item>
                ) : (
                  <Form.Item
                    name="amountRmb"
                    className="mb-0"
                    rules={[{ required: true, message: 'Please enter an RMB amount' }]}
                  >
                    <InputNumber<number>
                      variant="borderless"
                      className="w-full !text-3xl !font-bold !p-0 text-emerald-600"
                      controls={false}
                      min={10}
                      formatter={(value) => `¥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      parser={(value) => Number(value?.replace(/[¥,\s]/g, '') || 0)}
                      onChange={(val) => setAmountRmb(Number(val))}
                    />
                  </Form.Item>
                )}
              </div>

              <div className="flex justify-center -my-4 relative z-10">
                <div className="w-10 h-10 rounded-full bg-brand-navy text-white flex items-center justify-center shadow-md border-4 border-slate-50">
                  <SwapOutlined rotate={90} />
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                    You receive (estimated)
                  </span>
                  <Tag className="rounded-full border-none bg-white text-slate-600 font-semibold px-2.5 border border-slate-200">
                    {direction === 'ngn_to_rmb' ? '🇨🇳 RMB (Yen/Yuan)' : '🇳🇬 NGN (Naira)'}
                  </Tag>
                </div>
                <div className="text-3xl font-bold text-emerald-600">
                  {direction === 'ngn_to_rmb'
                    ? formatRmb(calculateRmb(amountNaira))
                    : `₦${calculateNaira(amountRmb).toLocaleString()}`}
                </div>
              </div>
            </div>

            <p className="text-center text-xs text-slate-400 mt-3 mb-6">
              1 ¥ = ₦{activeRate?.platformRate ?? '—'} &middot; rate is locked for 24 hours once submitted
            </p>

            <Alert
              message="Escrow Protection"
              description="Your Naira will be held in a secure escrow account until the RMB is successfully transferred to your destination."
              type="info"
              showIcon
              icon={<SafetyCertificateOutlined />}
              className="mb-6"
            />

            <h4 className="font-bold text-slate-700 mb-4 border-b pb-2">RMB Destination Details</h4>

            <Form.Item name="rmbDestType" label="Platform" rules={[{ required: true, message: 'Please select a platform' }]}>
              <Select placeholder="Select Platform" size="large">
                <Select.Option value="alipay">{PLATFORM_LABELS.alipay}</Select.Option>
                <Select.Option value="wechat_pay">{PLATFORM_LABELS.wechat_pay}</Select.Option>
                <Select.Option value="chinese_bank">{PLATFORM_LABELS.chinese_bank}</Select.Option>
              </Select>
            </Form.Item>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Form.Item
                name="rmbDestAccount"
                label="Account Number / ID"
                rules={[{ required: true, message: 'Please enter the destination account' }]}
              >
                <Input size="large" />
              </Form.Item>

              <Form.Item
                name="rmbDestName"
                label="Account Name"
                rules={[{ required: true, message: 'Please enter the account holder name' }]}
              >
                <Input size="large" />
              </Form.Item>
            </div>

            {supportsQr && (
              <Form.Item label={`Or attach your ${PLATFORM_LABELS[platform]} QR code (optional)`} className="mb-0">
                <ImageDropzone
                  fileList={qrFileList}
                  onChange={setQrFileList}
                  multiple={false}
                  maxCount={1}
                  title={
                    <span className="flex items-center gap-1.5 justify-center">
                      <QrcodeOutlined /> Click or drag your QR code image here
                    </span>
                  }
                  hint="Helps our agent pay to the exact account, no typing needed"
                />
              </Form.Item>
            )}

            <Form.Item className="mb-0 mt-8 text-right">
              <Button onClick={() => navigate('/customer/exchange')} className="mr-2" size="large">
                Cancel
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                icon={<SendOutlined />}
                loading={submitting}
                size="large"
                className="bg-green-600 hover:bg-green-700"
              >
                Continue
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </div>
  );
};
