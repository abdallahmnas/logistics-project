import React, { useEffect, useState, useMemo } from 'react';
import { Button, Table, Input, Select, Avatar, Dropdown, Tag, message } from 'antd';
import { PlusOutlined, SearchOutlined, MoreOutlined, UserOutlined } from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { fetchAllUsers, deleteUser } from '../../../store/slices/adminSlice';
import type { User } from '../../../types/auth.types';
import { formatDate } from '../../../utils/formatters';

export const CustomersList: React.FC = () => {
  const dispatch = useAppDispatch();
  const { users, loading } = useAppSelector((state) => state.admin);
  const [searchText, setSearchText] = useState('');
  const [filterTier, setFilterTier] = useState('all_tiers');
  const [filterStatus, setFilterStatus] = useState('all_status');

  useEffect(() => {
    dispatch(fetchAllUsers());
  }, [dispatch]);

  // Filter customers only (role === 'customer')
  const customerList = useMemo(() => {
    return users.filter((u) => u.role === 'customer');
  }, [users]);

  const filtered = useMemo(() => {
    return customerList.filter((cust) => {
      const name = `${cust.firstName} ${cust.lastName}`.toLowerCase();
      const matchesSearch =
        name.includes(searchText.toLowerCase()) ||
        cust.email.toLowerCase().includes(searchText.toLowerCase()) ||
        cust.customerId.toLowerCase().includes(searchText.toLowerCase());
      
      const matchesStatus =
        filterStatus === 'all_status' ||
        (filterStatus === 'active' && cust.isVerified) ||
        (filterStatus === 'pending' && !cust.isVerified);

      return matchesSearch && matchesStatus;
    });
  }, [customerList, searchText, filterStatus]);

  const handleDelete = async (id: string) => {
    try {
      await dispatch(deleteUser(id)).unwrap();
      message.success('User removed');
    } catch {
      message.error('Failed to remove user');
    }
  };

  const columns = [
    {
      title: 'Customer',
      key: 'customer',
      render: (record: User) => (
        <div className="flex items-center gap-3">
          <Avatar icon={<UserOutlined />} src={record.profilePhoto} size={40} className="bg-[#0A1128] text-white" />
          <div>
            <div className="font-bold text-[#0A1128] text-sm">{record.firstName} {record.lastName}</div>
            <div className="text-xs text-slate-500">{record.email}</div>
          </div>
        </div>
      ),
    },
    {
      title: 'Customer ID',
      dataIndex: 'customerId',
      key: 'customerId',
      render: (id: string) => (
        <span className="font-mono text-xs font-bold text-[#0A1128] bg-slate-100 px-2 py-1 rounded">
          {id}
        </span>
      ),
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
      render: (phone: string) => <span className="text-slate-600 font-medium text-xs">{phone}</span>,
    },
    {
      title: 'Status',
      dataIndex: 'isVerified',
      key: 'status',
      render: (isVerified: boolean) => (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${isVerified ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-600'}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${isVerified ? 'bg-emerald-500' : 'bg-orange-500'}`}></span>
          {isVerified ? 'Verified' : 'Pending Verification'}
        </span>
      ),
    },
    {
      title: 'Joined',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (d: string) => <span className="text-slate-500 text-xs">{d ? formatDate(d) : '—'}</span>,
    },
    {
      title: 'Actions',
      key: 'actions',
      align: 'right' as const,
      render: (record: User) => (
        <Dropdown
          menu={{
            items: [
              { key: 'delete', label: 'Remove User', danger: true, onClick: () => handleDelete(record.id) },
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
          <h1 className="text-3xl font-extrabold text-[#0A1128] m-0 mb-2 tracking-tight">Registered Customers</h1>
          <p className="text-slate-600 text-base m-0 max-w-2xl">
            Manage customer accounts, view verification statuses, and search customer records.
          </p>
        </div>
      </div>

      <div className="bg-slate-50 p-6 rounded-t-xl border border-slate-100 flex flex-col md:flex-row gap-4 mb-0">
        <Input
          placeholder="Search by name, email, or customer ID..."
          prefix={<SearchOutlined className="text-slate-400" />}
          className="max-w-md h-12 border-white hover:border-slate-300 focus:border-brand-orange text-base px-4"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
        <div className="flex-1"></div>
        <Select
          defaultValue="all_status"
          className="w-48 h-12 [&_.ant-select-selector]:border-white [&_.ant-select-selector]:hover:border-slate-300 [&_.ant-select-selector]:h-12 [&_.ant-select-selection-item]:leading-[46px] bg-white rounded-lg font-medium"
          value={filterStatus}
          onChange={setFilterStatus}
          options={[
            { value: 'all_status', label: 'All Statuses' },
            { value: 'active', label: 'Verified' },
            { value: 'pending', label: 'Pending Verification' },
          ]}
        />
      </div>

      <div className="bg-white rounded-b-xl border-x border-b border-slate-100 shadow-sm overflow-hidden">
        <Table
          columns={columns}
          dataSource={filtered}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showTotal: (total) => `Showing ${total} customers`,
            className: '!px-6 !py-4 m-0 border-t border-slate-100 bg-slate-50',
          }}
          className="[&_.ant-table-thead_th]:!bg-white [&_.ant-table-thead_th]:!text-slate-500 [&_.ant-table-thead_th]:!text-xs [&_.ant-table-thead_th]:!font-bold [&_.ant-table-thead_th]:!border-b [&_.ant-table-thead_th]:!border-slate-100 [&_.ant-table-thead_th]:!py-5 [&_.ant-table-tbody_td]:!py-5"
        />
      </div>
    </div>
  );
};
