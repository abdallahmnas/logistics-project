import React, { useEffect, useState, useMemo } from 'react';
import { Button, Table, Input, Select, Tag, Avatar } from 'antd';
import { SearchOutlined, FilterOutlined, ExclamationCircleOutlined, CheckCircleOutlined, ClockCircleOutlined, FormOutlined, UserOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { fetchTickets } from '../../../store/slices/supportSlice';
import type { SupportTicket } from '../../../store/slices/supportSlice';
import { formatDate } from '../../../utils/formatters';

export const SupportTicketsList: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { tickets, loading } = useAppSelector((state) => state.support);
  const [searchText, setSearchText] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');

  useEffect(() => {
    dispatch(fetchTickets());
  }, [dispatch]);

  const openCount = useMemo(() => tickets.filter(t => t.status === 'open').length, [tickets]);
  const pendingCount = useMemo(() => tickets.filter(t => t.status === 'in_progress').length, [tickets]);
  const resolvedCount = useMemo(() => tickets.filter(t => t.status === 'resolved' || t.status === 'closed').length, [tickets]);

  const filtered = useMemo(() => {
    return tickets.filter((t) => {
      const matchesSearch =
        t.customerName.toLowerCase().includes(searchText.toLowerCase()) ||
        t.subject.toLowerCase().includes(searchText.toLowerCase()) ||
        t.id.toLowerCase().includes(searchText.toLowerCase());
      const matchesStatus = filterStatus === 'all' || t.status === filterStatus;
      const matchesPriority = filterPriority === 'all' || t.priority === filterPriority;
      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [tickets, searchText, filterStatus, filterPriority]);

  const columns = [
    {
      title: 'Ticket ID',
      dataIndex: 'id',
      key: 'id',
      render: (id: string) => (
        <a 
          className="font-mono text-xs font-bold text-[#0A1128] cursor-pointer hover:text-brand-orange"
          onClick={() => navigate(`/admin/support/${id}`)}
        >
          #{id.substring(0, 8)}
        </a>
      ),
    },
    {
      title: 'Customer',
      key: 'customer',
      render: (record: SupportTicket) => (
        <div className="flex items-center gap-3">
          <Avatar icon={<UserOutlined />} size={32} className="bg-slate-200 text-slate-700" />
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
        if (priority === 'urgent' || priority === 'high') {
          colorClass = "bg-red-50 text-red-600";
          dotColor = "bg-red-500";
        } else if (priority === 'medium') {
          colorClass = "bg-orange-50 text-orange-600";
          dotColor = "bg-orange-500";
        }
        return (
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${colorClass}`}>
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
        if (status === 'in_progress') borderClass = "border-brand-orange text-brand-orange bg-orange-50/30";
        if (status === 'resolved' || status === 'closed') borderClass = "border-emerald-500 text-emerald-700 bg-emerald-50";
        return (
          <span className={`inline-block px-3 py-1 rounded-full border text-xs font-bold uppercase tracking-wider ${borderClass}`}>
            {status.replace('_', ' ')}
          </span>
        );
      },
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      render: (cat: string) => <span className="text-slate-500 text-xs font-medium uppercase">{cat}</span>,
    },
    {
      title: 'Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (d: string) => <span className="text-slate-400 text-xs">{d ? formatDate(d) : '—'}</span>,
    },
  ];

  return (
    <div className="animate-fade-in-up max-w-[1200px] mx-auto py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-[#0A1128] m-0 mb-2 tracking-tight">Support Tickets</h1>
        <p className="text-slate-600 text-base m-0 max-w-2xl">
          Manage and resolve customer inquiries and support issues live from database.
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
            <span className="text-4xl font-extrabold text-[#0A1128]">{openCount}</span>
          </div>
        </div>
        <div className="bg-slate-50 rounded-xl p-5 border border-slate-100 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">IN PROGRESS</span>
            <FormOutlined className="text-brand-orange text-lg bg-orange-100 p-1 rounded" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-extrabold text-[#0A1128]">{pendingCount}</span>
          </div>
        </div>
        <div className="bg-slate-50 rounded-xl p-5 border border-slate-100 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">RESOLVED</span>
            <CheckCircleOutlined className="text-emerald-600 text-lg bg-emerald-100 p-1 rounded-full" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-extrabold text-[#0A1128]">{resolvedCount}</span>
          </div>
        </div>
        <div className="bg-slate-50 rounded-xl p-5 border border-slate-100 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">TOTAL TICKETS</span>
            <ClockCircleOutlined className="text-slate-500 text-lg" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-extrabold text-[#0A1128]">{tickets.length}</span>
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
          defaultValue="all"
          className="w-36 h-10 [&_.ant-select-selector]:border-slate-200"
          value={filterStatus}
          onChange={setFilterStatus}
          options={[
            { value: 'all', label: 'All Statuses' },
            { value: 'open', label: 'Open' },
            { value: 'in_progress', label: 'In Progress' },
            { value: 'resolved', label: 'Resolved' },
            { value: 'closed', label: 'Closed' },
          ]}
        />
        <Select
          defaultValue="all"
          className="w-36 h-10 [&_.ant-select-selector]:border-slate-200"
          value={filterPriority}
          onChange={setFilterPriority}
          options={[
            { value: 'all', label: 'All Priority' },
            { value: 'urgent', label: 'Urgent' },
            { value: 'high', label: 'High' },
            { value: 'medium', label: 'Medium' },
            { value: 'low', label: 'Low' },
          ]}
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden mb-6">
        <Table
          columns={columns}
          dataSource={filtered}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
          onRow={(record) => ({
            onClick: () => navigate(`/admin/support/${record.id}`),
          })}
          className="[&_.ant-table-thead_th]:!bg-white [&_.ant-table-thead_th]:!text-slate-500 [&_.ant-table-thead_th]:!text-xs [&_.ant-table-thead_th]:!font-bold [&_.ant-table-thead_th]:!border-b-2 [&_.ant-table-thead_th]:!border-slate-100 [&_.ant-table-thead_th]:!py-5 [&_.ant-table-tbody_td]:!py-5 border-b border-slate-100 cursor-pointer"
        />
      </div>
    </div>
  );
};
