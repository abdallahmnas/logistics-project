import React, { useEffect, useMemo, useState } from 'react';
import { Card, Table, Input, Select, Button, Avatar, Tag } from 'antd';
import { SearchOutlined, DownloadOutlined, FilterOutlined, FieldTimeOutlined, CheckCircleOutlined, WalletOutlined, FileSyncOutlined } from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { fetchExchanges, fetchActiveRate } from '../../../store/slices/exchangeSlice';
import type { ExchangeRequest } from '../../../types/exchange.types';
import { StatusBadge } from '../../../components/common/StatusBadge';
import { useNavigate } from 'react-router-dom';
import { formatDate } from '../../../utils/formatters';

const { Option } = Select;

export const ExchangeManagement: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { exchanges, loading } = useAppSelector((state) => state.exchange);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    dispatch(fetchExchanges());
    dispatch(fetchActiveRate());
  }, [dispatch]);

  const filtered = useMemo(() => {
    return exchanges.filter((e) => {
      return e.customerName.toLowerCase().includes(searchText.toLowerCase()) ||
             e.id.toLowerCase().includes(searchText.toLowerCase());
    });
  }, [exchanges, searchText]);

  // Compute live KPIs
  const totalPending = useMemo(() => {
    return exchanges.filter(e => e.status === 'pending' || e.status === 'receipt_uploaded' || e.status === 'awaiting_payment').length;
  }, [exchanges]);

  const totalProcessed = useMemo(() => {
    return exchanges.filter(e => e.status === 'completed' || e.status === 'rmb_released' || e.status === 'naira_confirmed').length;
  }, [exchanges]);

  const totalVolumeNaira = useMemo(() => {
    return exchanges.reduce((acc, e) => acc + (e.amountNaira || 0), 0);
  }, [exchanges]);

  const columns = [
    {
      title: 'REQUEST ID',
      dataIndex: 'id',
      key: 'id',
      render: (id: string) => <span className="text-slate-600 font-mono font-medium text-xs">{id}</span>,
    },
    {
      title: 'DATE',
      dataIndex: 'createdAt',
      key: 'date',
      render: (date: string) => <span className="text-xs text-slate-500">{date ? formatDate(date) : '—'}</span>,
    },
    {
      title: 'REQUESTER',
      key: 'requester',
      render: (record: ExchangeRequest) => {
        const initials = record.customerName ? record.customerName.split(' ').map(n => n[0]).join('').substring(0,2) : 'CU';
        return (
          <div className="flex items-center gap-2">
            <Avatar className="bg-slate-200 text-slate-600 text-xs font-bold" size="small">{initials}</Avatar>
            <span className="text-slate-700 font-medium text-sm w-24 truncate">{record.customerName}</span>
          </div>
        );
      },
    },
    {
      title: 'AMOUNT (NGN)',
      key: 'amountNaira',
      render: (record: ExchangeRequest) => (
        <span className="font-bold text-slate-800">₦{record.amountNaira?.toLocaleString()}</span>
      ),
    },
    {
      title: 'EST. RECEIVE (CNY)',
      key: 'amountRmb',
      render: (record: ExchangeRequest) => (
        <span className="font-medium text-slate-700">¥{record.amountRmb?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
      ),
    },
    {
      title: 'RATE',
      dataIndex: 'exchangeRate',
      key: 'rate',
      render: (rate: number) => <span className="text-slate-500 font-medium">{rate ? Number(rate).toFixed(1) : '215.0'}</span>,
    },
    {
      title: 'STATUS',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => <StatusBadge module="exchange" status={status} />,
    },
  ];

  return (
    <div className="animate-fade-in-up max-w-[1200px] mx-auto pb-20 mt-4">
      
      {/* Top Metrics Row — DYNAMIC */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card bordered={false} className="shadow-sm rounded-xl bg-slate-50 border border-slate-100">
          <div className="flex justify-between items-start mb-2">
            <div className="text-slate-500 font-bold text-xs tracking-wider uppercase">Total Pending</div>
            <FileSyncOutlined className="text-brand-orange text-lg" />
          </div>
          <div className="text-4xl font-extrabold text-[#0A1128]">{totalPending}</div>
          <div className="text-brand-orange text-sm font-medium mt-2 flex items-center gap-1">
            Active queue
          </div>
        </Card>

        <Card bordered={false} className="shadow-sm rounded-xl bg-slate-50 border border-slate-100">
          <div className="flex justify-between items-start mb-2">
            <div className="text-slate-500 font-bold text-xs tracking-wider uppercase">Processed Requests</div>
            <CheckCircleOutlined className="text-emerald-600 text-lg" />
          </div>
          <div className="text-4xl font-extrabold text-[#0A1128]">{totalProcessed}</div>
          <div className="text-slate-500 text-sm font-medium mt-2 flex items-center gap-2">
            Completed / Verified
          </div>
        </Card>

        <Card bordered={false} className="shadow-sm rounded-xl bg-slate-50 border border-slate-100">
          <div className="flex justify-between items-start mb-2">
            <div className="text-slate-500 font-bold text-xs tracking-wider uppercase">Total Volume (NGN)</div>
            <WalletOutlined className="text-slate-400 text-lg" />
          </div>
          <div className="text-3xl font-extrabold text-[#0A1128]">₦{totalVolumeNaira.toLocaleString()}</div>
          <div className="mt-4 bg-slate-200 h-1 rounded-full overflow-hidden w-24">
            <div className="bg-[#0A1128] w-full h-full"></div>
          </div>
        </Card>

        <Card bordered={false} className="shadow-lg rounded-xl bg-[#0A1128] border-none text-white relative overflow-hidden">
          <div className="flex justify-between items-start mb-2 relative z-10">
            <div className="text-blue-200 font-bold text-xs tracking-wider uppercase">Active Platform Rate</div>
            <FieldTimeOutlined className="text-blue-200 text-lg" />
          </div>
          <div className="text-4xl font-extrabold text-white relative z-10">215 NGN/CNY</div>
        </Card>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        
        {/* Toolbar */}
        <div className="flex flex-col md:flex-row justify-between items-center p-6 gap-4 border-b border-slate-100">
          <h2 className="text-xl font-bold text-[#0A1128] m-0">Exchange Requests</h2>
          
          <div className="flex w-full md:w-auto gap-4">
            <Input 
              prefix={<SearchOutlined className="text-slate-400" />} 
              placeholder="Search ID or Requester..." 
              className="w-full md:w-64 bg-slate-50 border-slate-200"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </div>
        </div>

        {/* Table */}
        <Table 
          columns={columns} 
          dataSource={filtered} 
          rowKey="id" 
          loading={loading} 
          pagination={{ pageSize: 10, position: ['bottomRight'] }} 
          className="[&_.ant-table-thead_th]:!bg-white [&_.ant-table-thead_th]:!text-slate-500 [&_.ant-table-thead_th]:!text-xs [&_.ant-table-thead_th]:!font-bold [&_.ant-table-thead_th]:uppercase [&_.ant-table-tbody_tr:hover>td]:!bg-slate-50 cursor-pointer"
          onRow={(record) => ({
            onClick: () => navigate(`/admin/exchange/${record.id}`),
          })}
        />
        
      </div>
    </div>
  );
};
