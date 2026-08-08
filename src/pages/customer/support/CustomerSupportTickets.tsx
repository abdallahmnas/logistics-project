import React, { useState } from 'react';
import { Button, Table, Input, Select, Tag } from 'antd';
import { SearchOutlined, DownloadOutlined, PlusOutlined, FileTextOutlined, ExclamationCircleOutlined, CheckCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

export const CustomerSupportTickets: React.FC = () => {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState('');

  const tickets = [
    {
      id: 'TKT-9823',
      subject: 'Delayed Shipment GL-982 in Cus...',
      category: 'Shipping',
      status: 'Open',
      lastUpdated: '10 mins ago',
    },
    {
      id: 'TKT-9755',
      subject: 'Wallet Funding Issue - EUR Acco...',
      category: 'Billing',
      status: 'In Progress',
      lastUpdated: '2 hours ago',
    },
    {
      id: 'TKT-9701',
      subject: 'Address correction for manifest #...',
      category: 'Shipping',
      status: 'Resolved',
      lastUpdated: 'Yesterday, 14:30',
    },
    {
      id: 'TKT-9650',
      subject: 'API Authentication Token Expired',
      category: 'Technical',
      status: 'Closed',
      lastUpdated: 'Oct 12, 2023',
    },
  ];

  const columns = [
    {
      title: 'TICKET ID',
      dataIndex: 'id',
      key: 'id',
      render: (text: string) => (
        <span className="text-slate-500 text-xs font-mono">{text}</span>
      ),
    },
    {
      title: 'SUBJECT',
      dataIndex: 'subject',
      key: 'subject',
      render: (text: string) => (
        <span className="text-[#0A1128] font-bold text-sm cursor-pointer hover:text-brand-orange">{text}</span>
      ),
    },
    {
      title: 'CATEGORY',
      dataIndex: 'category',
      key: 'category',
      render: (text: string) => (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-slate-100 border border-slate-200 text-slate-500 text-xs font-bold">
          <FileTextOutlined /> {text}
        </span>
      ),
    },
    {
      title: 'STATUS',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        if (status === 'Open') {
          return (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-500 text-xs font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span> {status}
            </span>
          );
        }
        if (status === 'In Progress') {
          return (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#0A1128] text-white text-xs font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-white"></span> {status}
            </span>
          );
        }
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-500 text-xs font-bold">
            <CheckCircleOutlined /> {status}
          </span>
        );
      },
    },
    {
      title: 'LAST UPDATED',
      dataIndex: 'lastUpdated',
      key: 'lastUpdated',
      render: (text: string) => <span className="text-slate-500 text-sm whitespace-pre-wrap">{text.replace(', ', ',\n')}</span>,
    },
    {
      title: 'ACTION',
      key: 'action',
      render: () => null,
    },
  ];

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
            <div className="text-4xl font-extrabold text-[#0A1128] mb-2">14</div>
            <div className="text-xs font-bold text-brand-orange">↗ +2 this month</div>
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
            <div className="text-4xl font-extrabold text-white mb-2">3</div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-blue-200">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-300"></span> Requires attention
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
            <div className="text-4xl font-extrabold text-[#0A1128] mb-2">11</div>
            <div className="text-xs font-medium text-slate-500 flex items-center gap-1">
              <ClockCircleOutlined /> Avg response: 4h
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
          defaultValue="all_statuses"
          className="w-40 h-12 [&_.ant-select-selector]:border-transparent [&_.ant-select-selector]:hover:border-slate-300 [&_.ant-select-selector]:h-12 [&_.ant-select-selection-item]:leading-[46px] bg-white rounded-lg font-bold text-[#0A1128]"
          options={[
            { value: 'all_statuses', label: 'All Statuses' },
            { value: 'open', label: 'Open' },
            { value: 'resolved', label: 'Resolved' },
          ]}
        />
        <Select
          defaultValue="all_categories"
          className="w-44 h-12 [&_.ant-select-selector]:border-transparent [&_.ant-select-selector]:hover:border-slate-300 [&_.ant-select-selector]:h-12 [&_.ant-select-selection-item]:leading-[46px] bg-white rounded-lg font-bold text-[#0A1128]"
          options={[
            { value: 'all_categories', label: 'All Categories' },
            { value: 'shipping', label: 'Shipping' },
            { value: 'billing', label: 'Billing' },
          ]}
        />
        <Button className="h-12 w-12 p-0 border-transparent text-[#0A1128] bg-white rounded-lg flex items-center justify-center font-bold">
          <DownloadOutlined />
        </Button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-b-xl border border-slate-100 shadow-sm overflow-hidden mb-6">
        <Table
          columns={columns}
          dataSource={tickets}
          rowKey="id"
          pagination={false}
          className="[&_.ant-table-thead_th]:!bg-slate-100 [&_.ant-table-thead_th]:!text-slate-500 [&_.ant-table-thead_th]:!text-[10px] [&_.ant-table-thead_th]:!font-bold [&_.ant-table-thead_th]:!uppercase [&_.ant-table-thead_th]:!tracking-wider [&_.ant-table-thead_th]:!border-b-2 [&_.ant-table-thead_th]:!border-slate-100 [&_.ant-table-thead_th]:!py-4 [&_.ant-table-tbody_td]:!py-6 border-b border-slate-100"
        />
      </div>

      {/* Footer Pagination */}
      <div className="flex justify-between items-center text-sm text-slate-500 font-medium bg-slate-50 p-4 rounded-xl border border-slate-100">
        <div>Showing 1-4 of 14 tickets</div>
        <div className="flex gap-2">
          <Button className="border-transparent text-slate-400 bg-slate-200 font-medium px-4">Previous</Button>
          <Button className="border-slate-200 text-[#0A1128] bg-white font-bold px-6 shadow-sm">Next</Button>
        </div>
      </div>
    </div>
  );
};
