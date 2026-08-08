import React, { useState } from 'react';
import { Button, Table, Input, Select, Tag, Avatar } from 'antd';
import { SearchOutlined, FilterOutlined, ExclamationCircleOutlined, CheckCircleOutlined, ClockCircleOutlined, FormOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

export const SupportTicketsList: React.FC = () => {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState('');

  const tickets = [
    {
      id: 'TK-8821',
      customerName: 'Adeola Ojo',
      avatar: 'https://images.unsplash.com/photo-1531123897727-8f129e1bf98c?q=80&w=150&auto=format&fit=crop',
      subject: 'Delayed Shipment TRK-9902X',
      priority: 'Urgent',
      status: 'Open',
      category: 'Shipping',
    },
    {
      id: 'TK-8815',
      customerName: 'TechCorp Ng',
      avatar: '',
      initials: 'TN',
      subject: 'API Integration Issue - Webhook ...',
      priority: 'High',
      status: 'In Progress',
      category: 'Technical',
    },
    {
      id: 'TK-8790',
      customerName: 'Marcus Vance',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop',
      subject: 'Invoice #INV-2023-11 Dispute',
      priority: 'Medium',
      status: 'Pending',
      category: 'Billing',
    },
  ];

  const columns = [
    {
      title: 'Ticket ID',
      dataIndex: 'id',
      key: 'id',
      render: (id: string) => (
        <a 
          className="font-mono text-sm font-bold text-[#0A1128] cursor-pointer hover:text-brand-orange"
          onClick={() => navigate(`/admin/support/${id}`)}
        >
          #{id}
        </a>
      ),
    },
    {
      title: 'Customer',
      key: 'customer',
      render: (record: any) => (
        <div className="flex items-center gap-3">
          {record.avatar ? (
             <Avatar src={record.avatar} size={32} />
          ) : (
             <Avatar size={32} className="bg-orange-100 text-brand-orange font-bold">
               {record.initials}
             </Avatar>
          )}
          <span className="text-sm font-medium text-[#0A1128]">{record.customerName}</span>
        </div>
      ),
    },
    {
      title: 'Subject',
      dataIndex: 'subject',
      key: 'subject',
      render: (text: string) => (
        <span className="text-slate-600 font-medium truncate max-w-xs block">{text}</span>
      ),
    },
    {
      title: 'Priority',
      dataIndex: 'priority',
      key: 'priority',
      render: (priority: string) => {
        let colorClass = "bg-slate-100 text-slate-700";
        let dotColor = "bg-slate-400";
        if (priority === 'Urgent') {
          colorClass = "bg-red-50 text-red-600";
          dotColor = "bg-red-500";
        } else if (priority === 'High') {
          colorClass = "bg-orange-50 text-orange-600";
          dotColor = "bg-orange-500";
        }
        return (
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${colorClass}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`}></span>
            {priority}
          </span>
        );
      },
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        let borderClass = "border-slate-300 text-slate-600";
        if (status === 'In Progress') borderClass = "border-brand-orange text-brand-orange bg-orange-50/30";
        if (status === 'Pending') borderClass = "border-[#0A1128] text-[#0A1128] bg-slate-50";
        return (
          <span className={`inline-block px-3 py-1 rounded-full border text-xs font-bold ${borderClass}`}>
            {status}
          </span>
        );
      },
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      render: (cat: string) => <span className="text-slate-500 text-sm">{cat}</span>,
    },
  ];

  return (
    <div className="animate-fade-in-up max-w-[1200px] mx-auto py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-[#0A1128] m-0 mb-2 tracking-tight">Support Tickets</h1>
        <p className="text-slate-600 text-base m-0 max-w-2xl">
          Manage and resolve customer inquiries and technical issues.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-slate-50 rounded-xl p-5 border border-slate-100 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">OPEN TICKETS</span>
            <ExclamationCircleOutlined className="text-red-500 text-lg" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-extrabold text-[#0A1128]">142</span>
            <span className="text-xs font-bold text-red-500">↑12%</span>
          </div>
        </div>
        <div className="bg-slate-50 rounded-xl p-5 border border-slate-100 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">PENDING RESPONSE</span>
            <FormOutlined className="text-brand-orange text-lg bg-orange-100 p-1 rounded" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-extrabold text-[#0A1128]">56</span>
            <span className="text-xs font-bold text-brand-orange">- 0%</span>
          </div>
        </div>
        <div className="bg-slate-50 rounded-xl p-5 border border-slate-100 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">RESOLVED TODAY</span>
            <CheckCircleOutlined className="text-slate-600 text-lg bg-slate-200 p-1 rounded-full" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-extrabold text-[#0A1128]">318</span>
            <span className="text-xs font-bold text-slate-600">↑5%</span>
          </div>
        </div>
        <div className="bg-slate-50 rounded-xl p-5 border border-slate-100 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">AVG RESPONSE TIME</span>
            <ClockCircleOutlined className="text-slate-500 text-lg" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-extrabold text-[#0A1128]">1h 45m</span>
            <span className="text-xs font-bold text-slate-500">↓8%</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <Input
          placeholder="Search tickets, customers, subjects..."
          prefix={<SearchOutlined className="text-slate-400" />}
          className="flex-1 h-10 border-slate-200 hover:border-slate-300 focus:border-brand-orange bg-slate-50"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
        <Select
          defaultValue="status"
          className="w-32 h-10 [&_.ant-select-selector]:border-slate-200"
          options={[
            { value: 'status', label: 'Status' },
            { value: 'open', label: 'Open' },
            { value: 'closed', label: 'Closed' },
          ]}
        />
        <Select
          defaultValue="priority"
          className="w-32 h-10 [&_.ant-select-selector]:border-slate-200"
          options={[
            { value: 'priority', label: 'Priority' },
            { value: 'high', label: 'High' },
            { value: 'low', label: 'Low' },
          ]}
        />
        <Select
          defaultValue="category"
          className="w-32 h-10 [&_.ant-select-selector]:border-slate-200"
          options={[
            { value: 'category', label: 'Category' },
            { value: 'shipping', label: 'Shipping' },
            { value: 'billing', label: 'Billing' },
          ]}
        />
        <Button className="h-10 w-10 p-0 border-slate-200 text-slate-500 bg-slate-100 flex items-center justify-center">
          <FilterOutlined />
        </Button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden mb-6">
        <Table
          columns={columns}
          dataSource={tickets}
          rowKey="id"
          pagination={false}
          className="[&_.ant-table-thead_th]:!bg-white [&_.ant-table-thead_th]:!text-slate-500 [&_.ant-table-thead_th]:!text-xs [&_.ant-table-thead_th]:!font-bold [&_.ant-table-thead_th]:!border-b-2 [&_.ant-table-thead_th]:!border-slate-100 [&_.ant-table-thead_th]:!py-5 [&_.ant-table-tbody_td]:!py-5 border-b border-slate-100"
        />
      </div>

      {/* Footer Pagination */}
      <div className="flex justify-between items-center text-sm text-slate-600">
        <div>Showing <span className="font-bold text-[#0A1128]">1</span> to <span className="font-bold text-[#0A1128]">10</span> of <span className="font-bold text-[#0A1128]">1,248</span> tickets</div>
        <div className="flex items-center gap-1">
          <Button size="small" className="w-8 h-8 flex items-center justify-center text-slate-400">&lt;</Button>
          <Button size="small" className="w-8 h-8 flex items-center justify-center bg-[#0A1128] text-white border-none font-bold">1</Button>
          <Button size="small" className="w-8 h-8 flex items-center justify-center border-none hover:bg-slate-100 font-bold">2</Button>
          <Button size="small" className="w-8 h-8 flex items-center justify-center border-none hover:bg-slate-100 font-bold">3</Button>
          <span className="w-8 text-center text-slate-400">...</span>
          <Button size="small" className="w-8 h-8 flex items-center justify-center border-none hover:bg-slate-100 font-bold">125</Button>
          <Button size="small" className="w-8 h-8 flex items-center justify-center text-slate-600">&gt;</Button>
        </div>
      </div>
    </div>
  );
};
