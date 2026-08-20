import React, { useEffect, useState } from 'react';
import { Card, Button, Input, InputNumber, Upload, Table, Tag, Form, message, Image } from 'antd';
import { SwapOutlined, CloudUploadOutlined, BankOutlined, QuestionCircleOutlined, DownloadOutlined, SyncOutlined, DeleteOutlined, QrcodeOutlined, BarcodeOutlined } from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { fetchExchanges, fetchActiveRate, submitExchangeRequest } from '../../../store/slices/exchangeSlice';
import { useNavigate } from 'react-router-dom';
import type { ExchangeRequest, RmbDestinationType } from '../../../types/exchange.types';

const { Dragger } = Upload;

export const ExchangeList: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const { exchanges, activeRate, loading } = useAppSelector((state) => state.exchange);

  const [rmbDestType, setRmbDestType] = useState<RmbDestinationType>('wechat_pay');
  const [sendAmount, setSendAmount] = useState<number>(500000);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    dispatch(fetchExchanges());
    dispatch(fetchActiveRate());
  }, [dispatch]);

  const platformRate = activeRate?.platformRate || 215.00;
  const receiveAmount = sendAmount ? Number((sendAmount / platformRate).toFixed(2)) : 0;
  const processingFee = sendAmount ? sendAmount * 0.015 : 0;
  const totalToPay = sendAmount + processingFee;
  const recentExchanges = exchanges.slice(0, 3);

  const handleFileChange = (fileList: any[]) => {
    if (!fileList || fileList.length === 0) {
      setPreviewUrl('');
      setFileName('');
      setQrCodeUrl('');
      return;
    }
    const fileItem = fileList[0];
    const file = fileItem.originFileObj || fileItem;

    if (file && file instanceof File) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setPreviewUrl(result);
        setQrCodeUrl(result);
        setFileName(file.name);
      };
      reader.readAsDataURL(file);
    } else if (fileItem.url || fileItem.thumbUrl) {
      setPreviewUrl(fileItem.url || fileItem.thumbUrl);
      setQrCodeUrl(fileItem.url || fileItem.thumbUrl);
      setFileName(fileItem.name || 'uploaded_image.png');
    }
  };

  const handleRemoveImage = () => {
    setPreviewUrl('');
    setFileName('');
    setQrCodeUrl('');
  };

  const handleSubmit = async (values: any) => {
    try {
      setSubmitting(true);
      await dispatch(
        submitExchangeRequest({
          amountNaira: Number(sendAmount) || 500000,
          rmbDestType: rmbDestType,
          rmbDestAccount: values.rmbDestAccount,
          rmbDestName: values.rmbDestName || 'Customer Account',
          rmbDestQrCode: qrCodeUrl || undefined,
        })
      ).unwrap();

      message.success('Currency exchange request created successfully!');
      form.resetFields();
      setPreviewUrl('');
      setFileName('');
      setQrCodeUrl('');
      dispatch(fetchExchanges());
    } catch (err: any) {
      message.error(err?.message || 'Failed to submit exchange request');
    } finally {
      setSubmitting(false);
    }
  };

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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">RECEIVING WALLET</label>
                  <div className="flex bg-slate-100 p-1 rounded-lg">
                    <Button 
                      type={rmbDestType === 'wechat_pay' ? 'primary' : 'text'} 
                      onClick={() => setRmbDestType('wechat_pay')}
                      className={`flex-1 font-bold ${rmbDestType === 'wechat_pay' ? 'bg-[#0A1128] border-none shadow-sm text-white' : 'text-slate-600'}`}
                    >
                      WeChat
                    </Button>
                    <Button 
                      type={rmbDestType === 'alipay' ? 'primary' : 'text'} 
                      onClick={() => setRmbDestType('alipay')}
                      className={`flex-1 font-bold ${rmbDestType === 'alipay' ? 'bg-[#0A1128] border-none shadow-sm text-white' : 'text-slate-600'}`}
                    >
                      Alipay
                    </Button>
                  </div>
                </div>
                <div>
                  <Form.Item name="rmbDestAccount" label={<span className="text-xs font-bold text-slate-500 uppercase tracking-wider">WALLET ID / PHONE</span>} rules={[{ required: true, message: 'Please enter WeChat/Alipay ID' }]}>
                    <Input size="large" placeholder="Enter WeChat/Alipay ID" className="bg-slate-50 border-slate-200" />
                  </Form.Item>
                </div>
              </div>

              {/* Full Width Expanded Inputs */}
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

              <div className="mb-6 space-y-3">
                <div className="flex justify-between items-center">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                    UPLOAD RECEIVING QR CODE OR BARCODE (OPTIONAL)
                  </label>
                  <span className="text-[10px] text-brand-orange font-bold uppercase tracking-wider bg-orange-50 px-2 py-0.5 rounded border border-orange-200">
                    QR & Barcode Supported
                  </span>
                </div>

                <Dragger
                  className="bg-white border-dashed border-slate-300 rounded-xl"
                  beforeUpload={() => false}
                  onChange={({ fileList: newFileList }) => handleFileChange(newFileList)}
                  showUploadList={false}
                  accept="image/*"
                  customRequest={({ onSuccess }) => setTimeout(() => onSuccess?.("ok"), 0)}
                >
                  <p className="ant-upload-drag-icon flex justify-center gap-3">
                    <QrcodeOutlined className="text-slate-400 text-3xl" />
                    <BarcodeOutlined className="text-brand-orange text-3xl" />
                  </p>
                  <p className="ant-upload-text font-bold text-slate-700 text-sm">Click or drag QR Code or Barcode image</p>
                  <p className="ant-upload-hint text-xs text-slate-400">PNG, JPG, WEBP up to 5MB</p>
                </Dragger>

                {previewUrl && (
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center justify-between shadow-sm animate-fade-in-up">
                    <div className="flex items-center gap-3">
                      <Image
                        src={previewUrl}
                        alt="QR or Barcode Preview"
                        className="w-20 h-20 rounded-lg object-contain border border-slate-200 bg-white"
                        fallback="https://images.unsplash.com/photo-1620825937374-87fc7d6aaf8e?q=80&w=600"
                      />
                      <div>
                        <span className="text-xs font-bold text-slate-800 block truncate max-w-[200px] sm:max-w-[300px]">
                          {fileName || 'receiving_code.png'}
                        </span>
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-block mt-1">
                          ✓ Image Preview Ready (Click photo to enlarge)
                        </span>
                      </div>
                    </div>
                    <Button
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={handleRemoveImage}
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

    </div>
  );
};
