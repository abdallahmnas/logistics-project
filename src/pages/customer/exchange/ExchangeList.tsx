import React, { useEffect, useState } from 'react';
import { Card, Button, Input, InputNumber, Upload, Table, Tag, Form, message, Image, Select, Modal, Alert } from 'antd';
import { SwapOutlined, CloudUploadOutlined, BankOutlined, DownloadOutlined, DeleteOutlined, QrcodeOutlined, BarcodeOutlined, PlusOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { fetchExchanges, fetchActiveRate, submitExchangeRequest, fetchSavedAccounts, createSavedAccount } from '../../../store/slices/exchangeSlice';
import { useNavigate } from 'react-router-dom';
import type { ExchangeRequest, RmbDestinationType, SavedAccount } from '../../../types/exchange.types';

import apiClient from '../../../api/axios';

const { Dragger } = Upload;
const { Option } = Select;

export const ExchangeList: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [modalForm] = Form.useForm();
  const { exchanges, activeRate, savedAccounts, loading } = useAppSelector((state) => state.exchange);

  const [rmbDestType, setRmbDestType] = useState<RmbDestinationType>('wechat_pay');
  const [sendAmount, setSendAmount] = useState<number>(500000);
  
  // Selected Receiving Wallet details
  const [selectedSavedAccountId, setSelectedSavedAccountId] = useState<string>('');
  const [barcodeUrl, setBarcodeUrl] = useState<string>('');
  const [barcodePreviewUrl, setBarcodePreviewUrl] = useState<string>('');

  // Add Wallet Modal state
  const [isAddWalletModalOpen, setIsAddWalletModalOpen] = useState(false);
  const [modalPlatform, setModalPlatform] = useState<RmbDestinationType>('wechat_pay');
  const [modalBarcodeUrl, setModalBarcodeUrl] = useState<string>('');
  const [modalBarcodePreviewUrl, setModalBarcodePreviewUrl] = useState<string>('');
  const [modalBarcodeFileName, setModalBarcodeFileName] = useState<string>('');
  const [modalSubmitting, setModalSubmitting] = useState(false);

  // Payment Proof: Bank Transfer Screenshot Image
  const [proofUrl, setProofUrl] = useState<string>('');
  const [proofPreviewUrl, setProofPreviewUrl] = useState<string>('');
  const [proofFileName, setProofFileName] = useState<string>('');

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    dispatch(fetchExchanges());
    dispatch(fetchActiveRate());
    dispatch(fetchSavedAccounts()).unwrap().then((accs) => {
      if (accs && accs.length > 0) {
        handleSelectSavedAccount(accs[0].id, accs);
      }
    });
  }, [dispatch]);

  useEffect(() => {
    if (savedAccounts && savedAccounts.length > 0 && !selectedSavedAccountId) {
      handleSelectSavedAccount(savedAccounts[0].id, savedAccounts);
    }
  }, [savedAccounts, selectedSavedAccountId]);

  const handleSelectSavedAccount = (accountId: string, listOverride?: SavedAccount[]) => {
    const list = listOverride || savedAccounts;
    setSelectedSavedAccountId(accountId);
    const acc = list.find((a) => a.id === accountId);
    if (!acc) return;

    setRmbDestType(acc.platform);
    form.setFieldsValue({
      rmbDestAccount: acc.accountNumber,
      rmbDestName: acc.accountName,
    });

    if (acc.barcodeUrl) {
      setBarcodeUrl(acc.barcodeUrl);
      setBarcodePreviewUrl(acc.barcodeUrl);
    } else {
      setBarcodeUrl('');
      setBarcodePreviewUrl('');
    }
  };

  // Modal Barcode Upload Handler (Direct Multipart Upload)
  const handleModalBarcodeFileChange = async (fileList: any[]) => {
    if (!fileList || fileList.length === 0) {
      setModalBarcodePreviewUrl('');
      setModalBarcodeFileName('');
      setModalBarcodeUrl('');
      return;
    }
    const fileItem = fileList[0];
    const file = fileItem.originFileObj || fileItem;

    if (file && file instanceof File) {
      // 1. Instant local preview
      const previewUrl = URL.createObjectURL(file);
      setModalBarcodePreviewUrl(previewUrl);
      setModalBarcodeFileName(file.name);

      // 2. Direct upload to server
      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', 'logicore/barcodes');

        const hideLoading = message.loading('Uploading QR barcode...', 0);
        const res = await apiClient.post('/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        hideLoading();

        if (res.data && res.data.url) {
          setModalBarcodeUrl(res.data.url);
          message.success('QR barcode image uploaded!');
        }
      } catch (err) {
        console.warn('Direct upload error, falling back to FileReader:', err);
        const reader = new FileReader();
        reader.onload = (e) => setModalBarcodeUrl(e.target?.result as string);
        reader.readAsDataURL(file);
      }
    } else if (fileItem.url || fileItem.thumbUrl) {
      setModalBarcodePreviewUrl(fileItem.url || fileItem.thumbUrl);
      setModalBarcodeUrl(fileItem.url || fileItem.thumbUrl);
      setModalBarcodeFileName(fileItem.name || 'barcode.png');
    }
  };

  // Submit Modal to Save New Wallet Account
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
          isDefault: savedAccounts.length === 0,
        })
      ).unwrap();

      message.success('Receiving wallet account saved successfully!');
      setIsAddWalletModalOpen(false);
      modalForm.resetFields();
      setModalBarcodePreviewUrl('');
      setModalBarcodeUrl('');
      setModalBarcodeFileName('');

      // Refresh saved accounts and auto-select newly added wallet
      const updatedList = await dispatch(fetchSavedAccounts()).unwrap();
      if (newAcc && newAcc.id) {
        handleSelectSavedAccount(newAcc.id, updatedList);
      } else if (updatedList && updatedList.length > 0) {
        handleSelectSavedAccount(updatedList[updatedList.length - 1].id, updatedList);
      }
    } catch (err: any) {
      const errorMsg = typeof err === 'string' ? err : err?.message || 'Failed to save receiving account';
      message.error(errorMsg);
    } finally {
      setModalSubmitting(false);
    }
  };

  const handleBarcodeFileChange = (fileList: any[]) => {
    if (!fileList || fileList.length === 0) {
      setBarcodePreviewUrl('');
      setBarcodeFileName('');
      setBarcodeUrl('');
      return;
    }
    const fileItem = fileList[0];
    const file = fileItem.originFileObj || fileItem;

    if (file && file instanceof File) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setBarcodePreviewUrl(result);
        setBarcodeUrl(result);
        setBarcodeFileName(file.name);
      };
      reader.readAsDataURL(file);
    } else if (fileItem.url || fileItem.thumbUrl) {
      setBarcodePreviewUrl(fileItem.url || fileItem.thumbUrl);
      setBarcodeUrl(fileItem.url || fileItem.thumbUrl);
      setBarcodeFileName(fileItem.name || 'barcode.png');
    }
  };

  // Payment Proof Upload Handler (Direct Multipart Upload)
  const handleProofFileChange = async (fileList: any[]) => {
    if (!fileList || fileList.length === 0) {
      setProofPreviewUrl('');
      setProofFileName('');
      setProofUrl('');
      return;
    }
    const fileItem = fileList[0];
    const file = fileItem.originFileObj || fileItem;

    if (file && file instanceof File) {
      // 1. Instant local preview
      const previewUrl = URL.createObjectURL(file);
      setProofPreviewUrl(previewUrl);
      setProofFileName(file.name);

      // 2. Direct upload to server
      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', 'logicore/exchange-receipts');

        const hideLoading = message.loading('Uploading payment proof screenshot...', 0);
        const res = await apiClient.post('/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        hideLoading();

        if (res.data && res.data.url) {
          setProofUrl(res.data.url);
          message.success('Payment proof uploaded successfully!');
        }
      } catch (err) {
        console.warn('Direct upload error, falling back to FileReader:', err);
        const reader = new FileReader();
        reader.onload = (e) => setProofUrl(e.target?.result as string);
        reader.readAsDataURL(file);
      }
    } else if (fileItem.url || fileItem.thumbUrl) {
      setProofPreviewUrl(fileItem.url || fileItem.thumbUrl);
      setProofUrl(fileItem.url || fileItem.thumbUrl);
      setProofFileName(fileItem.name || 'payment_proof.png');
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      if (!savedAccounts || savedAccounts.length === 0) {
        message.error('Please save a receiving wallet account (WeChat / Alipay ID & Barcode) first before submitting.');
        setIsAddWalletModalOpen(true);
        return;
      }

      const selectedAcc = savedAccounts.find((a) => a.id === selectedSavedAccountId) || savedAccounts[0];
      const destType = selectedAcc ? selectedAcc.platform : (rmbDestType || 'wechat_pay');
      const destAccount = selectedAcc ? selectedAcc.accountNumber : (values?.rmbDestAccount || form.getFieldValue('rmbDestAccount'));
      const destName = selectedAcc ? selectedAcc.accountName : (values?.rmbDestName || form.getFieldValue('rmbDestName') || 'Customer Account');
      const barcode = (selectedAcc && selectedAcc.barcodeUrl) ? selectedAcc.barcodeUrl : (barcodeUrl || undefined);

      if (!destAccount) {
        message.error('Please select or save a receiving wallet account first');
        setIsAddWalletModalOpen(true);
        return;
      }

      if (!sendAmount || sendAmount <= 0) {
        message.error('Please enter a valid amount to exchange');
        return;
      }

      if (!proofUrl) {
        message.error('Please upload your bank transfer screenshot proof of payment before submitting');
        return;
      }

      setSubmitting(true);
      await dispatch(
        submitExchangeRequest({
          amountNaira: Number(sendAmount),
          rmbDestType: destType,
          rmbDestAccount: destAccount,
          rmbDestName: destName,
          rmbDestQrCode: barcode,
          receivingBarcodeUrl: barcode,
          nairaReceiptUrl: proofUrl || undefined,
          saveAccount: false,
        } as any)
      ).unwrap();

      message.success('Currency exchange request created successfully!');
      form.resetFields();
      setBarcodePreviewUrl('');
      setBarcodeUrl('');
      setProofPreviewUrl('');
      setProofFileName('');
      setProofUrl('');
      dispatch(fetchExchanges());
      dispatch(fetchSavedAccounts());
    } catch (err: any) {
      const errorMsg = typeof err === 'string' ? err : err?.message || 'Failed to submit exchange request';
      message.error(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const platformRate = activeRate?.platformRate || 215.00;
  const receiveAmount = sendAmount ? Number((sendAmount / platformRate).toFixed(2)) : 0;
  const processingFee = sendAmount ? sendAmount * 0.015 : 0;
  const totalToPay = sendAmount + processingFee;
  const recentExchanges = exchanges.slice(0, 3);

  const columns = [
    {
      title: 'ID / DATE',
      key: 'id_date',
      render: (record: ExchangeRequest) => (
        <div>
          <div className="text-xs font-bold text-slate-700">{record.id}</div>
          <div className="text-[10px] text-slate-500">
            {new Date(record.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })},{' '}
            {new Date(record.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      ),
    },
    {
      title: 'AMOUNT (NGN)',
      key: 'amountNaira',
      render: (record: ExchangeRequest) => (
        <span className="font-bold text-slate-800">₦ {record.amountNaira.toLocaleString()}</span>
      ),
    },
    {
      title: 'AMOUNT (CNY)',
      key: 'amountRmb',
      render: (record: ExchangeRequest) => (
        <span className="font-medium text-slate-600">¥ {record.amountRmb.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
      ),
    },
    {
      title: 'RATE',
      dataIndex: 'exchangeRate',
      key: 'rate',
      render: (rate: number) => <span className="text-slate-500 text-xs">{rate.toFixed(2)}</span>,
    },
    {
      title: 'STATUS',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag className="m-0 bg-slate-100 border-none font-bold text-slate-600 flex items-center gap-1 w-fit rounded-md px-2 py-0.5 text-[10px] uppercase">
          <div className={`w-1.5 h-1.5 rounded-full ${status === 'pending' || status === 'awaiting_payment' ? 'bg-orange-500' : 'bg-slate-800'}`}></div>
          {status === 'pending' || status === 'awaiting_payment' ? 'Processing' : 'Completed'}
        </Tag>
      ),
    }
  ];

  return (
    <div className="animate-fade-in-up max-w-[1200px] mx-auto pb-20">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-6">
        <div>
          <Tag className="mb-3 bg-slate-100 border-slate-200 text-slate-600 font-bold tracking-wider uppercase text-[10px] px-2 py-1 flex items-center w-fit gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-orange-500"></div> Live Market Rates
          </Tag>
          <h1 className="text-4xl font-extrabold text-[#0A1128] m-0 mb-2 tracking-tight">Currency Exchange</h1>
          <p className="text-slate-500 text-sm max-w-lg m-0 leading-relaxed">
            Securely exchange funds with institutional-grade rates. Requests are processed within 2-4 business hours during standard operating times.
          </p>
        </div>
        <Button icon={<DownloadOutlined />} className="bg-slate-50 border-none text-slate-600 font-bold hover:bg-slate-100">
          Export History
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Current Rate Card */}
          <div className="bg-[#0A1128] rounded-xl p-6 text-white relative overflow-hidden shadow-lg">
            {/* Background decorations */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-orange/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3"></div>

            <div className="flex justify-between items-start mb-6 relative z-10">
              <h3 className="text-lg font-bold m-0">Current Rate</h3>
              <Tag className="bg-white/10 border-none text-blue-200 text-xs font-bold py-1 px-3">
                Auto-updates in 49s
              </Tag>
            </div>

            <div className="flex items-center justify-between relative z-10">
              <div>
                <div className="text-4xl sm:text-5xl font-extrabold tracking-tight">¥1.00</div>
                <div className="text-blue-300 text-xs font-bold uppercase tracking-wider mt-1">CNY (RMB)</div>
              </div>
              <SwapOutlined className="text-brand-orange text-2xl" />
              <div className="text-right">
                <div className="text-4xl sm:text-5xl font-extrabold tracking-tight">₦{platformRate.toFixed(2)}</div>
                <div className="text-blue-300 text-xs font-bold uppercase tracking-wider mt-1">NGN (NAIRA)</div>
              </div>
            </div>
          </div>

          {/* Request Form */}
          <Card bordered={false} className="shadow-sm border border-slate-100 rounded-xl">
            <h2 className="text-xl font-bold text-[#0A1128] m-0 mb-1">Request Exchange</h2>
            <p className="text-sm text-slate-500 mb-6">Submit a request to fund your RMB wallet from NGN.</p>

            <Form form={form} layout="vertical" onFinish={handleSubmit} requiredMark={false}>
              {/* Receiving Wallet Section */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 mb-6 space-y-4 shadow-sm">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-200 pb-3 gap-3">
                  <span className="text-xs font-extrabold text-[#0A1128] uppercase tracking-wider flex items-center gap-1.5">
                    <BarcodeOutlined className="text-brand-orange text-base" /> RECEIVING WALLET ACCOUNT INFORMATION
                  </span>

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
                    className="bg-brand-orange hover:bg-[#E86E21] border-none font-bold text-xs shadow-sm"
                  >
                    Add New Saved Wallet
                  </Button>
                </div>

                {/* If Customer Has Saved Accounts */}
                {savedAccounts && savedAccounts.length > 0 ? (
                  <div className="space-y-4 animate-fade-in-up">
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">
                      SELECT SAVED RECEIVING WALLET ACCOUNT
                    </label>
                    <Select
                      size="large"
                      placeholder="Select a saved WeChat, Alipay, or Chinese Bank account..."
                      className="w-full bg-white rounded-lg shadow-sm"
                      onChange={(val) => handleSelectSavedAccount(val)}
                      value={selectedSavedAccountId || undefined}
                    >
                      {savedAccounts.map((acc: SavedAccount) => (
                        <Option key={acc.id} value={acc.id}>
                          <div className="flex justify-between items-center py-0.5">
                            <span className="font-bold text-slate-800 text-sm">
                              {acc.platform === 'wechat_pay' ? '💚 WeChat' : acc.platform === 'alipay' ? '💙 Alipay' : '🏛️ Chinese Bank'} — {acc.accountName} ({acc.accountNumber})
                            </span>
                            {acc.barcodeUrl && (
                              <span className="text-[10px] bg-emerald-100 text-emerald-700 font-bold px-2 py-0.5 rounded ml-2">
                                ✓ Barcode Saved
                              </span>
                            )}
                          </div>
                        </Option>
                      ))}
                    </Select>

                    {/* Selected Account Summary Card - Clean & Uncluttered */}
                    {selectedSavedAccountId && (
                      <div className="bg-white border border-blue-200 rounded-xl p-4 shadow-sm space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                              {rmbDestType === 'wechat_pay' ? '💚 WeChat Pay' : rmbDestType === 'alipay' ? '💙 Alipay' : '🏛️ Chinese Bank'}
                            </span>
                            <div className="text-base font-extrabold text-[#0A1128] mt-1">
                              {form.getFieldValue('rmbDestName') || 'Account Holder'}
                            </div>
                            <div className="text-xs font-mono text-slate-500 mt-0.5">
                              ID / Number: {form.getFieldValue('rmbDestAccount')}
                            </div>
                          </div>
                          <Tag color="green" className="font-bold border-none text-[10px] uppercase py-0.5">
                            ✓ Ready for Funding
                          </Tag>
                        </div>

                        {barcodePreviewUrl && (
                          <div className="pt-2 border-t border-slate-100 flex items-center gap-3">
                            <Image
                              src={barcodePreviewUrl}
                              alt="Stored Barcode"
                              className="w-14 h-14 rounded-lg object-contain border border-slate-200 bg-slate-50"
                              fallback="https://images.unsplash.com/photo-1620825937374-87fc7d6aaf8e?q=80&w=600"
                            />
                            <div>
                              <div className="text-xs font-bold text-slate-800">
                                Stored Receiving Barcode/QR Attached
                              </div>
                              <div className="text-[10px] text-slate-400">
                                Click photo thumbnail to view full resolution
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Hidden inputs for Ant Design form validation */}
                    <div className="hidden">
                      <Form.Item name="rmbDestAccount" rules={[{ required: true, message: 'Please select a saved receiving wallet' }]}>
                        <Input />
                      </Form.Item>
                      <Form.Item name="rmbDestName" rules={[{ required: true, message: 'Please select a saved receiving wallet' }]}>
                        <Input />
                      </Form.Item>
                    </div>
                  </div>
                ) : (
                  /* If Customer HAS NO Saved Accounts Yet */
                  <div className="space-y-4 animate-fade-in-up py-2">
                    <Alert
                      type="warning"
                      showIcon
                      message={<span className="font-bold text-sm text-slate-800">No Saved Receiving Wallet Accounts Found</span>}
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
                          className="bg-[#0A1128] hover:bg-[#1a2542] border-none font-bold text-xs shadow-sm mt-2 sm:mt-0"
                        >
                          + Add Receiving Wallet Account
                        </Button>
                      }
                      className="rounded-xl border-amber-200 bg-amber-50/60 p-4"
                    />

                    {/* Hidden dummy inputs so form doesn't submit without selecting an account */}
                    <div className="hidden">
                      <Form.Item name="rmbDestAccount" rules={[{ required: true, message: 'Please save and select a receiving wallet account first' }]}>
                        <Input />
                      </Form.Item>
                      <Form.Item name="rmbDestName" rules={[{ required: true, message: 'Please save and select a receiving wallet account first' }]}>
                        <Input />
                      </Form.Item>
                    </div>
                  </div>
                )}
              </div>

              {/* Amount Exchange Inputs */}
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">YOU SEND (NGN)</label>
                  <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 w-full shadow-inner focus-within:border-brand-orange focus-within:ring-1 focus-within:ring-brand-orange transition-all">
                    <span className="text-slate-400 font-extrabold text-2xl mr-3">₦</span>
                    <InputNumber 
                      controls={false}
                      size="large" 
                      className="!w-full bg-transparent border-none text-2xl font-black font-mono p-0 focus:shadow-none shadow-none [&_input]:!bg-transparent" 
                      value={sendAmount}
                      onChange={(val) => setSendAmount(Number(val) || 0)}
                      min={1000}
                      placeholder="500000"
                    />
                    <span className="text-xs font-black text-slate-600 bg-slate-200/80 px-3 py-1.5 rounded-lg ml-3 uppercase tracking-wider shrink-0">NGN</span>
                  </div>
                </div>
                
                <div className="flex justify-center -my-2 relative z-10">
                  <div className="bg-slate-100 p-2.5 rounded-full border-2 border-white shadow-sm">
                    <SwapOutlined className="text-brand-orange rotate-90 text-base" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">YOU RECEIVE (CNY)</label>
                  <div className="flex items-center bg-slate-100/70 border border-slate-200 rounded-xl px-4 py-2 w-full">
                    <span className="text-slate-400 font-extrabold text-2xl mr-3">¥</span>
                    <InputNumber 
                      controls={false}
                      size="large" 
                      className="!w-full bg-transparent border-none text-2xl font-black font-mono p-0 focus:shadow-none shadow-none [&_input]:!bg-transparent" 
                      value={receiveAmount}
                      readOnly
                    />
                    <span className="text-xs font-black text-brand-orange bg-brand-orange/15 px-3 py-1.5 rounded-lg ml-3 uppercase tracking-wider shrink-0">CNY</span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-3 mb-6 text-sm">
                <div className="flex justify-between items-center text-slate-600">
                  <span>Exchange Rate</span>
                  <span className="font-mono font-bold text-slate-800">1 CNY = {platformRate.toFixed(2)} NGN</span>
                </div>
                <div className="flex justify-between items-center text-slate-600">
                  <span>Processing Fee (1.5%)</span>
                  <span className="font-mono font-bold text-slate-800">₦ {processingFee.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="pt-3 border-t border-slate-200 flex justify-between items-center font-bold text-[#0A1128]">
                  <span>Total to Pay</span>
                  <span className="font-mono text-lg font-black text-brand-orange">₦ {totalToPay.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
              </div>

              {/* Upload Proof of Payment Section */}
              <div className="mb-6 space-y-3">
                <div className="flex justify-between items-center">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <CloudUploadOutlined className="text-brand-orange" /> UPLOAD PROOF OF PAYMENT (BANK TRANSFER SCREENSHOT) <span className="text-red-500 font-extrabold">* (REQUIRED)</span>
                  </label>
                  <span className="text-[10px] text-red-500 font-bold uppercase tracking-wider bg-red-50 px-2 py-0.5 rounded border border-red-200">
                    REQUIRED
                  </span>
                </div>

                <Dragger
                  className="bg-white border-dashed border-slate-300 rounded-xl"
                  beforeUpload={() => false}
                  onChange={({ fileList: newFileList }) => handleProofFileChange(newFileList)}
                  showUploadList={false}
                  accept="image/*"
                  customRequest={({ onSuccess }) => setTimeout(() => onSuccess?.("ok"), 0)}
                >
                  <p className="ant-upload-drag-icon flex justify-center mb-1">
                    <CloudUploadOutlined className="text-slate-400 text-3xl" />
                  </p>
                  <p className="ant-upload-text font-bold text-slate-700 text-sm">Click or drag screenshot proof of payment here</p>
                  <p className="ant-upload-hint text-xs text-slate-400">PNG, JPG, WEBP up to 5MB (Receipt screenshot)</p>
                </Dragger>

                {proofPreviewUrl && (
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center justify-between shadow-sm animate-fade-in-up">
                    <div className="flex items-center gap-3">
                      <Image
                        src={proofPreviewUrl}
                        alt="Payment Proof Screenshot Preview"
                        className="w-20 h-20 rounded-lg object-cover border border-slate-200 bg-white"
                        fallback="https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=600"
                      />
                      <div>
                        <span className="text-xs font-bold text-slate-800 block truncate max-w-[200px] sm:max-w-[300px]">
                          {proofFileName || 'payment_proof_screenshot.png'}
                        </span>
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-block mt-1">
                          ✓ Payment Screenshot Preview Ready (Click photo to enlarge)
                        </span>
                      </div>
                    </div>
                    <Button
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => { setProofPreviewUrl(''); setProofUrl(''); setProofFileName(''); }}
                      className="font-bold text-xs hover:bg-red-50"
                    >
                      Remove
                    </Button>
                  </div>
                )}
              </div>

              <Button 
                type="primary" 
                htmlType="submit"
                loading={submitting} 
                size="large" 
                block 
                className="bg-brand-orange hover:bg-[#E86E21] border-none font-extrabold shadow-md h-13 text-base rounded-xl"
              >
                Submit Exchange Request ➔
              </Button>
            </Form>
          </Card>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 flex items-start gap-4 hover:shadow-md transition-shadow cursor-pointer">
            <div className="w-10 h-10 rounded-lg bg-[#0A1128] text-white flex items-center justify-center shrink-0 shadow-sm">
              <BankOutlined className="text-lg" />
            </div>
            <div>
              <h3 className="font-bold text-[#0A1128] m-0 mb-1">Bank Transfer Details</h3>
              <p className="text-xs text-slate-500 m-0 leading-relaxed">View official NGN receiving accounts.</p>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 flex items-start gap-4 hover:shadow-md transition-shadow cursor-pointer">
            <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
              <QuestionCircleOutlined className="text-lg" />
            </div>
            <div>
              <h3 className="font-bold text-[#0A1128] m-0 mb-1">Exchange FAQ</h3>
              <p className="text-xs text-slate-500 m-0 leading-relaxed">Learn about limits, timing, and compliance.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Requests */}
      <Card bordered={false} className="shadow-sm border border-slate-100 rounded-xl" bodyStyle={{ padding: '24px' }}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-[#0A1128] m-0">Recent Requests</h2>
          <div className="flex gap-2">
            <Tag className="m-0 bg-slate-100 border-none text-slate-600 font-bold px-3 py-1 cursor-pointer">All</Tag>
            <Tag className="m-0 bg-white border border-slate-200 text-slate-500 font-medium px-3 py-1 cursor-pointer">Processing</Tag>
          </div>
        </div>
        
        <Table 
          columns={columns} 
          dataSource={recentExchanges} 
          rowKey="id" 
          pagination={false}
          className="[&_.ant-table-thead_th]:!bg-slate-50 [&_.ant-table-thead_th]:!text-slate-500 [&_.ant-table-thead_th]:!text-[10px] [&_.ant-table-thead_th]:!font-bold [&_.ant-table-thead_th]:uppercase [&_.ant-table-thead_th]:tracking-wider"
        />
        
        <div className="mt-4 text-center">
          <Button type="link" className="text-brand-orange font-bold text-xs tracking-wider" onClick={() => navigate('/customer/exchange/history')}>
            VIEW ALL REQUESTS ➔
          </Button>
        </div>
      </Card>

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

export default ExchangeList;
