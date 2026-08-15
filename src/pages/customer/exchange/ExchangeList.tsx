import React, { useEffect } from 'react';
import { Card, Button, Input, InputNumber, Upload, Table, Tag } from 'antd';
import { SwapOutlined, CloudUploadOutlined, BankOutlined, QuestionCircleOutlined, DownloadOutlined, SyncOutlined } from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { fetchExchanges, fetchActiveRate } from '../../../store/slices/exchangeSlice';
import { useNavigate } from 'react-router-dom';
import type { ExchangeRequest } from '../../../types/exchange.types';

const { Dragger } = Upload;

export const ExchangeList: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { exchanges, activeRate, loading } = useAppSelector((state) => state.exchange);

  useEffect(() => {
    dispatch(fetchExchanges());
    dispatch(fetchActiveRate());
  }, [dispatch]);

  const platformRate = activeRate?.platformRate || 164.50;
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">RECEIVING WALLET</label>
                <div className="flex bg-slate-100 p-1 rounded-lg">
                  <Button type="primary" className="flex-1 bg-[#0A1128] border-none font-bold shadow-sm">WeChat</Button>
                  <Button type="text" className="flex-1 text-slate-600 font-bold">Alipay</Button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">WALLET ID / PHONE</label>
                <Input size="large" placeholder="Enter WeChat/Alipay ID" className="bg-slate-50 border-slate-200" />
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">YOU SEND (NGN)</label>
                <InputNumber 
                  size="large" 
                  className="w-full bg-slate-50 border-slate-200 text-xl font-bold font-mono py-1" 
                  prefix={<span className="text-slate-400 mr-2">₦</span>} 
                  defaultValue={500000}
                  addonAfter={<span className="text-xs font-bold text-slate-500">NGN</span>}
                />
              </div>
              
              <div className="flex justify-center -my-3 relative z-10">
                <div className="bg-slate-100 p-2 rounded-full border border-white">
                  <SwapOutlined className="text-slate-400 rotate-90" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">YOU RECEIVE (CNY)</label>
                <InputNumber 
                  size="large" 
                  className="w-full bg-slate-50 border-slate-200 text-xl font-bold font-mono py-1" 
                  prefix={<span className="text-slate-400 mr-2">¥</span>} 
                  value={500000 / platformRate}
                  addonAfter={<span className="text-xs font-bold text-slate-500">CNY</span>}
                  readOnly
                />
              </div>
            </div>

            <div className="bg-slate-50 rounded-lg p-4 border border-slate-100 space-y-3 mb-6 text-sm">
              <div className="flex justify-between items-center text-slate-600">
                <span>Exchange Rate</span>
                <span className="font-mono">1 CNY = {platformRate.toFixed(2)} NGN</span>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span>Processing Fee (1.5%)</span>
                <span className="font-mono">₦ 7,500.00</span>
              </div>
              <div className="pt-3 border-t border-slate-200 flex justify-between items-center font-bold text-[#0A1128]">
                <span>Total to Pay</span>
                <span className="font-mono text-base">₦ 507,500.00</span>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">UPLOAD RECEIVING QR CODE</label>
              <Dragger
                className="bg-white border-dashed border-slate-300"
                beforeUpload={() => false}
                onChange={({ fileList: newFileList }) => {
                  newFileList.forEach((f) => { f.status = 'done'; });
                }}
                customRequest={({ onSuccess }) => setTimeout(() => onSuccess?.("ok"), 0)}
              >
                <p className="ant-upload-drag-icon">
                  <CloudUploadOutlined className="text-slate-400" />
                </p>
                <p className="ant-upload-text font-bold text-slate-700 text-sm">Click or drag QR code image</p>
                <p className="ant-upload-hint text-xs text-slate-400">PNG, JPG up to 5MB</p>
              </Dragger>
            </div>

            <Button type="primary" size="large" block className="bg-brand-orange hover:bg-[#E86E21] border-none font-bold shadow-md h-12 text-base">
              Submit Exchange Request ➔
            </Button>
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
          <Button type="link" className="text-brand-orange font-bold text-xs tracking-wider" onClick={() => navigate('/dashboard/exchange/history')}>
            VIEW ALL REQUESTS ➔
          </Button>
        </div>
      </Card>

    </div>
  );
};
