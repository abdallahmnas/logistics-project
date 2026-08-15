import React, { useEffect, useState } from 'react';
import { Card, Table, Tag, Input, Button } from 'antd';
import { SearchOutlined, DownloadOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { fetchExchanges } from '../../../store/slices/exchangeSlice';
import { useNavigate } from 'react-router-dom';
import type { ExchangeRequest } from '../../../types/exchange.types';

export const ExchangeHistory: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { exchanges, loading } = useAppSelector((state) => state.exchange);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    dispatch(fetchExchanges());
  }, [dispatch]);

  const filtered = exchanges.filter(e => e.id.toLowerCase().includes(searchText.toLowerCase()));

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
      <div className="mb-6">
        <Button 
          type="text" 
          icon={<ArrowLeftOutlined />} 
          onClick={() => navigate('/customer/exchange')}
          className="text-slate-500 hover:text-[#0A1128] px-0 mb-4"
        >
          Back to Exchange
        </Button>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-[#0A1128] m-0 mb-1 tracking-tight">Exchange History</h1>
            <p className="text-slate-500 text-sm m-0">View all your past currency exchange requests and statuses.</p>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <Input 
              prefix={<SearchOutlined className="text-slate-400" />} 
              placeholder="Search ID..." 
              className="w-full md:w-64 bg-slate-50 border-slate-200"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
            <Button icon={<DownloadOutlined />} className="bg-[#0A1128] hover:bg-[#1a2542] text-white border-none font-medium">
              Export
            </Button>
          </div>
        </div>
      </div>

      <Card bordered={false} className="shadow-sm border border-slate-100 rounded-xl" bodyStyle={{ padding: '0' }}>
        <Table 
          columns={columns} 
          dataSource={filtered} 
          rowKey="id" 
          loading={loading}
          pagination={{ pageSize: 15, position: ['bottomRight'] }} 
          className="[&_.ant-table-thead_th]:!bg-slate-50 [&_.ant-table-thead_th]:!text-slate-500 [&_.ant-table-thead_th]:!text-[10px] [&_.ant-table-thead_th]:!font-bold [&_.ant-table-thead_th]:uppercase [&_.ant-table-thead_th]:tracking-wider"
        />
      </Card>
    </div>
  );
};
