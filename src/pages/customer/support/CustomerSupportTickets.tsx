import React, { useEffect, useState } from 'react';
import { Button, Table, Input, Select, Tag } from 'antd';
import { SearchOutlined, DownloadOutlined, PlusOutlined, FileTextOutlined, ExclamationCircleOutlined, CheckCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { fetchTickets } from '../../../store/slices/supportSlice';
import { formatDate } from '../../../utils/formatters';

export const CustomerSupportTickets: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { tickets, loading } = useAppSelector((state) => state.support);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('all_statuses');
  const [categoryFilter, setCategoryFilter] = useState('all_categories');

  useEffect(() => {
    dispatch(fetchTickets());
  }, [dispatch]);

  const filteredTickets = tickets.filter((t) => {
    const matchesSearch = !searchText || t.subject.toLowerCase().includes(searchText.toLowerCase()) || t.id.toLowerCase().includes(searchText.toLowerCase());
    const matchesStatus = statusFilter === 'all_statuses' || t.status === statusFilter;
    const matchesCategory = categoryFilter === 'all_categories' || t.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const columns = [
    {
      title: 'TICKET ID',
      dataIndex: 'id',
      key: 'id',
      render: (text: string) => (
        <span className="text-slate-500 text-xs font-mono">#{text.substring(0, 8)}</span>
      ),
    },
    {
      title: 'SUBJECT',
      dataIndex: 'subject',
      key: 'subject',
      render: (text: string, record: any) => (
        <span 
          className="text-[#0A1128] font-bold text-sm cursor-pointer hover:text-brand-orange"
          onClick={() => navigate(`/customer/support/${record.id}`)}
        >
          {text}
        </span>
      ),
    },
    {
      title: 'CATEGORY',
      dataIndex: 'category',
      key: 'category',
      render: (text: string) => (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-slate-100 border border-slate-200 text-slate-500 text-xs font-bold uppercase">
          <FileTextOutlined /> {text}
        </span>
      ),
    },
    {
      title: 'STATUS',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        if (status === 'open') {
          return (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-500 text-xs font-bold uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span> Open
            </span>
          );
        }
        if (status === 'in_progress') {
          return (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#0A1128] text-white text-xs font-bold uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-white"></span> In Progress
            </span>
          );
        }
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold uppercase">
            <CheckCircleOutlined /> {status}
          </span>
        );
      },
    },
    {
      title: 'LAST UPDATED',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      render: (text: string) => <span className="text-slate-500 text-xs">{text ? formatDate(text) : 'Recently'}</span>,
    },
  ];

  const openCount = tickets.filter(t => t.status === 'open' || t.status === 'in_progress').length;
  const resolvedCount = tickets.filter(t => t.status === 'resolved' || t.status === 'closed').length;

  return (
    <div className="animate-fade-in-up max-w-[1000px] mx-auto py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-[#0A1128] m-0 mb-2 tracking-tight">Support Tickets</h1>
          <p className="text-slate-600 text-base m-0 max-w-xl">
            Manage your inquiries, report issues, and track resolutions across global operations.
          </p>
        </div>
        <Button
          type="primary"
          size="large"
          icon={<PlusOutlined />}
          className="bg-[#0A1128] hover:bg-[#1a2542] border-none font-bold uppercase tracking-wider text-xs px-6 py-5 h-auto flex items-center shadow-md rounded"
          onClick={() => navigate('/customer/support/new')}
        >
          CREATE NEW TICKET
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-slate-50 rounded-lg p-6 border border-slate-100 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">TOTAL TICKETS</span>
            <div className="w-8 h-8 rounded bg-[#0A1128] text-blue-300 flex items-center justify-center">
              <FileTextOutlined />
            </div>
          </div>
          <div>
            <div className="text-4xl font-extrabold text-[#0A1128] mb-2">{tickets.length}</div>
            <div className="text-xs font-bold text-brand-orange">Active Customer Inquiries</div>
          </div>
        </div>

        <div className="bg-[#0A1128] rounded-lg p-6 shadow-md flex flex-col justify-between relative overflow-hidden">
          <div className="absolute right-0 top-0 w-32 h-full bg-white/5 skew-x-12 translate-x-10"></div>
          <div className="relative z-10 flex justify-between items-start mb-2">
            <span className="text-[10px] font-bold text-blue-200 uppercase tracking-wider">OPEN ACTION</span>
            <div className="w-8 h-8 rounded bg-white/10 text-white flex items-center justify-center">
              <ExclamationCircleOutlined />
            </div>
          </div>
          <div className="relative z-10">
            <div className="text-4xl font-extrabold text-white mb-2">{openCount}</div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-blue-200">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-300"></span> In progress with support staff
            </div>
          </div>
        </div>

        <div className="bg-slate-50 rounded-lg p-6 border border-slate-100 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">RESOLVED</span>
            <div className="w-8 h-8 rounded bg-[#0A1128] text-white flex items-center justify-center">
              <CheckCircleOutlined />
            </div>
          </div>
          <div>
            <div className="text-4xl font-extrabold text-[#0A1128] mb-2">{resolvedCount}</div>
            <div className="text-xs font-medium text-slate-500 flex items-center gap-1">
              <ClockCircleOutlined /> Closed & Resolved
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-slate-50 p-4 rounded-t-xl flex flex-col md:flex-row gap-4">
        <Input
          placeholder="Search ticket ID, subject..."
          prefix={<SearchOutlined className="text-slate-400" />}
          className="flex-1 h-12 border-transparent hover:border-slate-300 focus:border-brand-orange bg-white rounded-lg px-4"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
        <Select
          value={statusFilter}
          onChange={setStatusFilter}
          className="w-40 h-12 [&_.ant-select-selector]:border-transparent [&_.ant-select-selector]:hover:border-slate-300 [&_.ant-select-selector]:h-12 [&_.ant-select-selection-item]:leading-[46px] bg-white rounded-lg font-bold text-[#0A1128]"
          options={[
            { value: 'all_statuses', label: 'All Statuses' },
            { value: 'open', label: 'Open' },
            { value: 'in_progress', label: 'In Progress' },
            { value: 'resolved', label: 'Resolved' },
          ]}
        />
        <Select
          value={categoryFilter}
          onChange={setCategoryFilter}
          className="w-44 h-12 [&_.ant-select-selector]:border-transparent [&_.ant-select-selector]:hover:border-slate-300 [&_.ant-select-selector]:h-12 [&_.ant-select-selection-item]:leading-[46px] bg-white rounded-lg font-bold text-[#0A1128]"
          options={[
            { value: 'all_categories', label: 'All Categories' },
            { value: 'shipment', label: 'Shipment' },
            { value: 'payment', label: 'Billing' },
            { value: 'exchange', label: 'Exchange' },
            { value: 'procurement', label: 'Buy For Me' },
            { value: 'delivery', label: 'Delivery' },
            { value: 'account', label: 'Account' },
          ]}
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-b-xl border border-slate-100 shadow-sm overflow-hidden mb-6">
        <Table
          columns={columns}
          dataSource={filteredTickets}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
          className="[&_.ant-table-thead_th]:!bg-slate-100 [&_.ant-table-thead_th]:!text-slate-500 [&_.ant-table-thead_th]:!text-[10px] [&_.ant-table-thead_th]:!font-bold [&_.ant-table-thead_th]:!uppercase [&_.ant-table-thead_th]:!tracking-wider [&_.ant-table-thead_th]:!border-b-2 [&_.ant-table-thead_th]:!border-slate-100 [&_.ant-table-thead_th]:!py-4 [&_.ant-table-tbody_td]:!py-6 border-b border-slate-100 cursor-pointer"
          onRow={(record) => ({
            onClick: () => navigate(`/customer/support/${record.id}`),
          })}
        />
      </div>
    </div>
  );
};
