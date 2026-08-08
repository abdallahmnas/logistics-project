import React, { useState } from 'react';
import { Button, Table, Input, Select, Tag, Avatar, Dropdown } from 'antd';
import { PlusOutlined, SearchOutlined, MoreOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

export const CustomersList: React.FC = () => {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState('');

  const customers = [
    {
      id: 'cust-1',
      memberId: 'HZ-20241001',
      name: 'Adebayo Okonkwo',
      email: 'adebayo@example.com',
      tier: 'Gold',
      walletBalance: 1245000,
      totalShipments: 24,
      status: 'active',
      avatar: 'https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?q=80&w=150&auto=format&fit=crop',
    },
    {
      id: 'cust-2',
      memberId: 'HZ-20241002',
      name: 'Chiamaka Nnamdi',
      email: 'c.nnamdi@example.com',
      tier: 'Silver',
      walletBalance: 450000,
      totalShipments: 8,
      status: 'active',
      avatar: 'https://images.unsplash.com/photo-1531123897727-8f129e1bf98c?q=80&w=150&auto=format&fit=crop',
    },
    {
      id: 'cust-3',
      memberId: 'HZ-20241003',
      name: 'David Okafor',
      email: 'david.o@example.com',
      tier: 'Bronze',
      walletBalance: 12500,
      totalShipments: 2,
      status: 'active',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop',
    },
    {
      id: 'cust-4',
      memberId: 'HZ-20241004',
      name: 'Ngozi Eze',
      email: 'ngozi.eze@example.com',
      tier: 'Bronze',
      walletBalance: 0,
      totalShipments: 0,
      status: 'pending',
      avatar: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?q=80&w=150&auto=format&fit=crop',
    },
  ];

  const columns = [
    {
      title: 'Customer',
      key: 'customer',
      render: (record: any) => (
        <div className="flex items-center gap-3">
          <Avatar src={record.avatar} size={40} />
          <div>
            <div className="font-bold text-[#0A1128] text-sm">{record.name}</div>
            <div className="text-xs text-slate-500">{record.email}</div>
          </div>
        </div>
      ),
    },
    {
      title: 'Member ID',
      dataIndex: 'memberId',
      key: 'memberId',
      render: (id: string) => (
        <span className="font-mono text-xs text-slate-600 bg-slate-100 px-2 py-1 rounded">
          {id}
        </span>
      ),
    },
    {
      title: 'Tier',
      dataIndex: 'tier',
      key: 'tier',
      render: (tier: string) => {
        let colorClass = "bg-slate-100 text-slate-700";
        if (tier === 'Gold') colorClass = "bg-yellow-50 text-yellow-700 border border-yellow-200";
        if (tier === 'Silver') colorClass = "bg-gray-100 text-gray-700 border border-gray-300";
        if (tier === 'Bronze') colorClass = "bg-orange-50 text-orange-800 border border-orange-200";
        return (
          <span className={`inline-flex px-2.5 py-0.5 rounded text-xs font-bold uppercase tracking-wider ${colorClass}`}>
            {tier}
          </span>
        );
      },
    },
    {
      title: 'Wallet Balance',
      dataIndex: 'walletBalance',
      key: 'walletBalance',
      render: (balance: number) => (
        <span className="font-bold text-[#0A1128]">
          ₦{balance.toLocaleString()}
        </span>
      ),
    },
    {
      title: 'Shipments',
      dataIndex: 'totalShipments',
      key: 'totalShipments',
      render: (count: number) => (
        <span className="text-slate-600 font-medium">
          {count}
        </span>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <span className={`inline-flex items-center gap-1.5 px-0 py-1 text-sm font-medium ${status === 'active' ? 'text-green-600' : 'text-brand-orange'}`}>
          <span className={`w-2 h-2 rounded-full ${status === 'active' ? 'bg-green-500' : 'bg-brand-orange'}`}></span>
          {status === 'active' ? 'Active' : 'Pending Verification'}
        </span>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      align: 'right' as const,
      render: () => (
        <Dropdown
          menu={{
            items: [
              { key: 'view', label: 'View Profile' },
              { key: 'edit', label: 'Edit Customer' },
              { key: 'suspend', label: 'Suspend Account', danger: true },
            ],
          }}
          trigger={['click']}
          placement="bottomRight"
        >
          <Button type="text" icon={<MoreOutlined className="text-slate-400 text-lg" />} />
        </Dropdown>
      ),
    },
  ];

  return (
    <div className="animate-fade-in-up max-w-[1200px] mx-auto py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-[#0A1128] m-0 mb-2 tracking-tight">Customers</h1>
          <p className="text-slate-600 text-base m-0 max-w-2xl">
            Manage your client base, view wallet balances, and monitor shipment histories.
          </p>
        </div>
        <Button
          type="primary"
          size="large"
          icon={<PlusOutlined />}
          className="bg-[#0A1128] hover:bg-[#1a2542] border-none font-bold shadow-md px-6 py-5 h-auto flex items-center justify-center min-w-[200px]"
          // onClick={() => navigate('/admin/customers/new')}
        >
          Add Customer
        </Button>
      </div>

      <div className="bg-slate-50 p-6 rounded-t-xl border border-slate-100 flex flex-col md:flex-row gap-4 mb-0">
        <Input
          placeholder="Search by name, email, or member ID..."
          prefix={<SearchOutlined className="text-slate-400" />}
          className="max-w-md h-12 border-white hover:border-slate-300 focus:border-brand-orange text-base px-4"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
        <div className="flex-1"></div>
        <Select
          defaultValue="all_tiers"
          className="w-48 h-12 [&_.ant-select-selector]:border-white [&_.ant-select-selector]:hover:border-slate-300 [&_.ant-select-selector]:h-12 [&_.ant-select-selection-item]:leading-[46px] bg-white rounded-lg font-medium"
          options={[
            { value: 'all_tiers', label: 'All Tiers' },
            { value: 'gold', label: 'Gold' },
            { value: 'silver', label: 'Silver' },
            { value: 'bronze', label: 'Bronze' },
          ]}
        />
        <Select
          defaultValue="all_status"
          className="w-48 h-12 [&_.ant-select-selector]:border-white [&_.ant-select-selector]:hover:border-slate-300 [&_.ant-select-selector]:h-12 [&_.ant-select-selection-item]:leading-[46px] bg-white rounded-lg font-medium"
          options={[
            { value: 'all_status', label: 'All Statuses' },
            { value: 'active', label: 'Active' },
            { value: 'pending', label: 'Pending Verification' },
          ]}
        />
      </div>

      <div className="bg-white rounded-b-xl border-x border-b border-slate-100 shadow-sm overflow-hidden">
        <Table
          columns={columns}
          dataSource={customers}
          rowKey="id"
          pagination={{
            total: 4,
            pageSize: 10,
            showSizeChanger: false,
            showTotal: (total, range) => `Showing ${total} of ${total} results`,
            className: '!px-6 !py-4 m-0 border-t border-slate-100 bg-slate-50',
          }}
          className="[&_.ant-table-thead_th]:!bg-white [&_.ant-table-thead_th]:!text-slate-500 [&_.ant-table-thead_th]:!text-xs [&_.ant-table-thead_th]:!font-bold [&_.ant-table-thead_th]:!border-b [&_.ant-table-thead_th]:!border-slate-100 [&_.ant-table-thead_th]:!py-5 [&_.ant-table-tbody_td]:!py-5"
        />
      </div>
    </div>
  );
};
