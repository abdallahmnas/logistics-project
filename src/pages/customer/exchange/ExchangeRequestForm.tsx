import React, { useEffect, useState } from 'react';
import { Card, Form, Input, InputNumber, Select, Button, Alert, message, Tag, Modal, Upload } from 'antd';
import type { UploadFile } from 'antd';
import { ArrowLeftOutlined, SendOutlined, SwapOutlined, SafetyCertificateOutlined, QrcodeOutlined, BankOutlined, PlusOutlined, BarcodeOutlined, DeleteOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { fetchActiveRate, submitExchangeRequest, fetchSavedAccounts, createSavedAccount } from '../../../store/slices/exchangeSlice';
import { formatRmb } from '../../../utils/formatters';
import type { ExchangeRequestPayload, RmbDestinationType, SavedAccount } from '../../../types/exchange.types';
import { ImageDropzone } from '../../../components/common/ImageDropzone';

const { Dragger } = Upload;

const PLATFORM_LABELS: Record<RmbDestinationType, string> = {
  alipay: 'Alipay',
  wechat_pay: 'WeChat Pay',
  chinese_bank: 'Chinese Bank Transfer',
};

export const ExchangeRequestForm: React.FC = () => {
  const [form] = Form.useForm();
  const [modalForm] = Form.useForm();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { activeRate, savedAccounts } = useAppSelector((state) => state.exchange);
  const [direction, setDirection] = useState<'ngn_to_rmb' | 'rmb_to_ngn'>('ngn_to_rmb');
  const [amountNaira, setAmountNaira] = useState<number>(0);
  const [amountRmb, setAmountRmb] = useState<number>(0);
  const [submitting, setSubmitting] = useState(false);

  // Selected Saved Account state
  const [selectedSavedAccountId, setSelectedSavedAccountId] = useState<string>('');

  // Modal State
  const [isAddWalletModalOpen, setIsAddWalletModalOpen] = useState(false);
  const [modalPlatform, setModalPlatform] = useState<RmbDestinationType>('wechat_pay');
  const [modalBarcodeUrl, setModalBarcodeUrl] = useState<string>('');
  const [modalBarcodePreviewUrl, setModalBarcodePreviewUrl] = useState<string>('');
  const [modalBarcodeFileName, setModalBarcodeFileName] = useState<string>('');
  const [modalSubmitting, setModalSubmitting] = useState(false);

  useEffect(() => {
    if (!activeRate) {
      dispatch(fetchActiveRate());
    }
    dispatch(fetchSavedAccounts()).unwrap().then((accs) => {
      if (accs && accs.length > 0) {
        handleSelectSavedAccount(accs[0].id, accs);
      }
    });
  }, [dispatch, activeRate]);

  const handleSelectSavedAccount = (accountId: string, listOverride?: SavedAccount[]) => {
    const list = listOverride || savedAccounts;
    setSelectedSavedAccountId(accountId);
    const acc = list.find((a) => a.id === accountId);
    if (!acc) return;

    form.setFieldsValue({
      rmbDestType: acc.platform,
      rmbDestAccount: acc.accountNumber,
      rmbDestName: acc.accountName,
    });
  };

  const handleModalBarcodeFileChange = (fileList: any[]) => {
    if (!fileList || fileList.length === 0) {
      setModalBarcodePreviewUrl('');
      setModalBarcodeFileName('');
      setModalBarcodeUrl('');
      return;
    }
    const fileItem = fileList[0];
    const file = fileItem.originFileObj || fileItem;

    if (file && file instanceof File) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setModalBarcodePreviewUrl(result);
        setModalBarcodeUrl(result);
        setModalBarcodeFileName(file.name);
      };
      reader.readAsDataURL(file);
    } else if (fileItem.url || fileItem.thumbUrl) {
      setModalBarcodePreviewUrl(fileItem.url || fileItem.thumbUrl);
      setModalBarcodeUrl(fileItem.url || fileItem.thumbUrl);
      setModalBarcodeFileName(fileItem.name || 'barcode.png');
    }
  };

  const handleSaveNewWalletAccount = async (values: any) => {
    try {
      setModalSubmitting(true);
      const newAcc = await dispatch(
        createSavedAccount({
          platform: modalPlatform,
          accountNumber: values.accountNumber,
          accountName: values.accountName,
          label: values.label || `${modalPlatform === 'wechat_pay' ? 'WeChat' : modalPlatform === 'alipay' ? 'Alipay' : 'Chinese Bank'} (${values.accountName})`,
          barcodeUrl: modalBarcodeUrl || undefined,
          isDefault: true,
        })
      ).unwrap();

      message.success('Receiving wallet account saved successfully!');
      setIsAddWalletModalOpen(false);
      modalForm.resetFields();
      setModalBarcodePreviewUrl('');
      setModalBarcodeUrl('');
      setModalBarcodeFileName('');

      const updatedList = await dispatch(fetchSavedAccounts()).unwrap();
      if (newAcc && newAcc.id) {
        handleSelectSavedAccount(newAcc.id, updatedList);
      }
    } catch (err: any) {
      message.error(err?.message || 'Failed to save wallet account');
    } finally {
      setModalSubmitting(false);
    }
  };

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
          saveAccount: false,
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

  const selectedAcc = savedAccounts.find((a) => a.id === selectedSavedAccountId);

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

            {/* Receiving Wallet Section */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-6 space-y-4">
              <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                <h4 className="font-bold text-slate-700 m-0">RMB Destination Details</h4>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  size="small"
                  onClick={() => {
                    modalForm.resetFields();
                    setModalBarcodePreviewUrl('');
                    setModalBarcodeUrl('');
                    setModalBarcodeFileName('');
                    setIsAddWalletModalOpen(true);
                  }}
                  className="bg-brand-navy hover:bg-[#1a2542] border-none font-bold text-xs shadow-sm"
                >
                  Add New Saved Wallet
                </Button>
              </div>

              {savedAccounts && savedAccounts.length > 0 ? (
                <div className="space-y-3">
                  <Select
                    size="large"
                    placeholder="Select saved wallet account..."
                    className="w-full bg-white"
                    onChange={(val) => handleSelectSavedAccount(val)}
                    value={selectedSavedAccountId || undefined}
                  >
                    {savedAccounts.map((acc) => (
                      <Select.Option key={acc.id} value={acc.id}>
                        {acc.platform === 'wechat_pay' ? '💚 WeChat' : acc.platform === 'alipay' ? '💙 Alipay' : '🏛️ Bank'} — {acc.accountName} ({acc.accountNumber})
                      </Select.Option>
                    ))}
                  </Select>

                  {selectedAcc && (
                    <div className="bg-white border border-slate-200 rounded-xl p-3 flex justify-between items-center">
                      <div>
                        <div className="text-xs font-bold text-slate-800">{selectedAcc.accountName}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{selectedAcc.platform.toUpperCase()} &middot; {selectedAcc.accountNumber}</div>
                      </div>
                      <Tag color="green" className="font-bold border-none text-[10px] uppercase">✓ Selected</Tag>
                    </div>
                  )}

                  {/* Hidden inputs to pass validation */}
                  <div className="hidden">
                    <Form.Item name="rmbDestType"><Input /></Form.Item>
                    <Form.Item name="rmbDestAccount" rules={[{ required: true, message: 'Please select account' }]}><Input /></Form.Item>
                    <Form.Item name="rmbDestName" rules={[{ required: true, message: 'Please select account' }]}><Input /></Form.Item>
                  </div>
                </div>
              ) : (
                <div className="py-2">
                  <Alert
                    type="warning"
                    showIcon
                    message={<span className="font-bold text-sm text-slate-800">No Saved Receiving Wallet Accounts</span>}
                    description={<span className="text-xs text-slate-600">You must save at least one receiving wallet account (WeChat / Alipay ID & Barcode) to receive your funded RMB. Click below to add your wallet account.</span>}
                    action={
                      <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        size="small"
                        onClick={() => {
                          modalForm.resetFields();
                          setModalBarcodePreviewUrl('');
                          setModalBarcodeUrl('');
                          setModalBarcodeFileName('');
                          setIsAddWalletModalOpen(true);
                        }}
                        className="bg-[#0A1128] hover:bg-[#1a2542] border-none font-bold text-xs shadow-sm mt-2"
                      >
                        + Add Receiving Wallet Account
                      </Button>
                    }
                    className="rounded-xl border-amber-200 bg-amber-50/60 p-4"
                  />

                  {/* Hidden dummy inputs so form doesn't submit without selecting an account */}
                  <div className="hidden">
                    <Form.Item name="rmbDestAccount" rules={[{ required: true, message: 'Please save and select a receiving wallet account first' }]}><Input /></Form.Item>
                    <Form.Item name="rmbDestName" rules={[{ required: true, message: 'Please save and select a receiving wallet account first' }]}><Input /></Form.Item>
                  </div>
                </div>
              )}
            </div>

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

      {/* Add New Saved Wallet Account Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-[#0A1128]">
            <BarcodeOutlined className="text-brand-orange text-lg" />
            <span className="font-extrabold text-base">Add & Save Receiving Wallet Account</span>
          </div>
        }
        open={isAddWalletModalOpen}
        onCancel={() => setIsAddWalletModalOpen(false)}
        footer={null}
        destroyOnHidden
        centered
        className="rounded-2xl overflow-hidden"
      >
        <Form form={modalForm} layout="vertical" onFinish={handleSaveNewWalletAccount} requiredMark={false} className="py-2 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">RECEIVING PLATFORM</label>
            <div className="flex bg-slate-100 p-1 rounded-xl">
              <Button 
                type={modalPlatform === 'wechat_pay' ? 'primary' : 'text'} 
                onClick={() => setModalPlatform('wechat_pay')}
                className={`flex-1 font-bold ${modalPlatform === 'wechat_pay' ? 'bg-[#0A1128] border-none shadow-sm text-white' : 'text-slate-600'}`}
              >
                💚 WeChat
              </Button>
              <Button 
                type={modalPlatform === 'alipay' ? 'primary' : 'text'} 
                onClick={() => setModalPlatform('alipay')}
                className={`flex-1 font-bold ${modalPlatform === 'alipay' ? 'bg-[#0A1128] border-none shadow-sm text-white' : 'text-slate-600'}`}
              >
                💙 Alipay
              </Button>
              <Button 
                type={modalPlatform === 'chinese_bank' ? 'primary' : 'text'} 
                onClick={() => setModalPlatform('chinese_bank')}
                className={`flex-1 font-bold ${modalPlatform === 'chinese_bank' ? 'bg-[#0A1128] border-none shadow-sm text-white' : 'text-slate-600'}`}
              >
                🏛️ Bank
              </Button>
            </div>
          </div>

          <Form.Item name="accountNumber" label={<span className="text-xs font-bold text-slate-500 uppercase tracking-wider">WALLET ID / PHONE / BANK ACC #</span>} rules={[{ required: true, message: 'Please enter account number or wallet ID' }]}>
            <Input size="large" placeholder="Enter WeChat ID, Alipay Phone, or Bank Card #" className="bg-slate-50 border-slate-200" />
          </Form.Item>

          <Form.Item name="accountName" label={<span className="text-xs font-bold text-slate-500 uppercase tracking-wider">ACCOUNT HOLDER NAME</span>} rules={[{ required: true, message: 'Please enter account holder name' }]}>
            <Input size="large" placeholder="e.g. Li Wei / Zhang San" className="bg-slate-50 border-slate-200" />
          </Form.Item>

          <Form.Item name="label" label={<span className="text-xs font-bold text-slate-500 uppercase tracking-wider">NICKNAME / LABEL (OPTIONAL)</span>}>
            <Input size="large" placeholder="e.g. Primary WeChat, Supplier Alipay" className="bg-slate-50 border-slate-200" />
          </Form.Item>

          {/* Barcode & QR Code Upload */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              RECEIVING BARCODE / QR CODE IMAGE (RECOMMENDED)
            </label>
            
            <Dragger
              className="bg-white border-dashed border-slate-300 rounded-xl py-3"
              beforeUpload={() => false}
              onChange={({ fileList: newFileList }) => handleModalBarcodeFileChange(newFileList)}
              showUploadList={false}
              accept="image/*"
              customRequest={({ onSuccess }) => setTimeout(() => onSuccess?.("ok"), 0)}
            >
              <p className="ant-upload-drag-icon flex justify-center gap-2 mb-1">
                <BarcodeOutlined className="text-brand-orange text-3xl" />
                <QrcodeOutlined className="text-slate-400 text-3xl" />
              </p>
              <p className="ant-upload-text font-bold text-slate-700 text-xs m-0">Click or drag receiving Barcode or QR Code image</p>
              <p className="ant-upload-hint text-[10px] text-slate-400">PNG, JPG, WEBP up to 5MB</p>
            </Dragger>

            {modalBarcodePreviewUrl && (
              <div className="mt-3 bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center justify-between shadow-sm animate-fade-in-up">
                <div className="flex items-center gap-3">
                  <Image
                    src={modalBarcodePreviewUrl}
                    alt="Receiving Barcode Preview"
                    className="w-16 h-16 rounded-lg object-contain border border-slate-200 bg-white"
                    fallback="https://images.unsplash.com/photo-1620825937374-87fc7d6aaf8e?q=80&w=600"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-800 block truncate max-w-[200px]">
                      {modalBarcodeFileName || 'receiving_barcode.png'}
                    </span>
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-block mt-0.5">
                      ✓ Receiving Barcode Attached
                    </span>
                  </div>
                </div>
                <Button
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => { setModalBarcodePreviewUrl(''); setModalBarcodeUrl(''); setModalBarcodeFileName(''); }}
                  className="font-bold text-xs"
                >
                  Remove
                </Button>
              </div>
            )}
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 mt-4">
            <Button onClick={() => setIsAddWalletModalOpen(false)} size="large">
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={modalSubmitting}
              size="large"
              className="bg-brand-orange hover:bg-[#E86E21] border-none font-bold px-6"
            >
              Save Wallet Account
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};
