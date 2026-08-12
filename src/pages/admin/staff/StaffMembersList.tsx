import React, { useEffect, useState, useMemo } from 'react';
import { Button, Table, Input, Select, Tag, Avatar, Dropdown, message } from 'antd';
import { PlusOutlined, SearchOutlined, UserOutlined, MoreOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { fetchAllUsers, deleteUser } from '../../../store/slices/adminSlice';
import type { User } from '../../../types/auth.types';
import { formatDate } from '../../../utils/formatters';

const roleLabels: Record<string, string> = {
  super_admin: 'Super Admin',
  admin: 'Admin',
  warehouse_cn: 'Warehouse (CN)',
  warehouse_ng: 'Warehouse (NG)',
  procurement: 'Procurement Specialist',
  finance: 'Finance Manager',
  driver: 'Logistics Driver',
};

const roleColors: Record<string, string> = {
  super_admin: 'gold',
  admin: 'blue',
  warehouse_cn: 'cyan',
  warehouse_ng: 'geekblue',
  procurement: 'purple',
  finance: 'orange',
  driver: 'green',
};

export const StaffMembersList: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { users, loading } = useAppSelector((state) => state.admin);
  const [searchText, setSearchText] = useState('');
  const [filterRole, setFilterRole] = useState('all_roles');

  useEffect(() => {
    dispatch(fetchAllUsers());
  }, [dispatch]);

  // Filter staff members only (role !== 'customer')
  const staffList = useMemo(() => {
    return users.filter((u) => u.role !== 'customer');
  }, [users]);

  const filtered = useMemo(() => {
    return staffList.filter((s) => {
      const name = `${s.firstName} ${s.lastName}`.toLowerCase();
      const matchesSearch =
        name.includes(searchText.toLowerCase()) ||
        s.email.toLowerCase().includes(searchText.toLowerCase());
      const matchesRole = filterRole === 'all_roles' || s.role === filterRole;
      return matchesSearch && matchesRole;
    });
  }, [staffList, searchText, filterRole]);

  const handleDelete = async (id: string) => {
    try {
      await dispatch(deleteUser(id)).unwrap();
      message.success('Staff member removed');
    } catch {
      message.error('Failed to remove staff member');
    }
  };

  const columns = [
    {
      title: 'Staff Member',
      key: 'member',
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
      title: 'Role / Permission',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => (
        <Tag color={roleColors[role] || 'default'} className="font-bold uppercase text-[11px] px-3 py-0.5 rounded-full">
          {roleLabels[role] || role}
        </Tag>
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
        <span className={`inline-flex items-center gap-1.5 px-0 py-1 text-sm font-medium ${isVerified ? 'text-green-600' : 'text-brand-orange'}`}>
          <span className={`w-2 h-2 rounded-full ${isVerified ? 'bg-green-500' : 'bg-brand-orange'}`}></span>
          {isVerified ? 'Active' : 'Pending Verification'}
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
              { key: 'delete', label: 'Remove Staff', danger: true, onClick: () => handleDelete(record.id) },
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
    <div className="animate-fade-in-up max-w-[1100px] mx-auto py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-[#0A1128] m-0 mb-2 tracking-tight">Staff Members</h1>
          <p className="text-slate-600 text-base m-0 max-w-2xl">
            Manage your team, assign roles, and monitor staff accounts across the organization.
          </p>
        </div>
      </div>

      <div className="bg-slate-50 p-6 rounded-t-xl border border-slate-100 flex flex-col md:flex-row gap-4 mb-0">
        <Input
          placeholder="Search staff by name or email..."
          prefix={<SearchOutlined className="text-slate-400" />}
          className="max-w-md h-12 border-white hover:border-slate-300 focus:border-brand-orange text-base px-4"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
        <div className="flex-1"></div>
        <Select
          defaultValue="all_roles"
          className="w-56 h-12 [&_.ant-select-selector]:border-white [&_.ant-select-selector]:hover:border-slate-300 [&_.ant-select-selector]:h-12 [&_.ant-select-selection-item]:leading-[46px] bg-white rounded-lg font-medium"
          value={filterRole}
          onChange={setFilterRole}
          options={[
            { value: 'all_roles', label: 'All Staff Roles' },
            { value: 'super_admin', label: 'Super Admin' },
            { value: 'warehouse_cn', label: 'Warehouse (CN)' },
            { value: 'warehouse_ng', label: 'Warehouse (NG)' },
            { value: 'procurement', label: 'Procurement' },
            { value: 'finance', label: 'Finance' },
            { value: 'driver', label: 'Driver' },
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
            showTotal: (total) => `Showing ${total} staff members`,
            className: '!px-6 !py-4 m-0 border-t border-slate-100 bg-slate-50',
          }}
          className="[&_.ant-table-thead_th]:!bg-white [&_.ant-table-thead_th]:!text-slate-500 [&_.ant-table-thead_th]:!text-xs [&_.ant-table-thead_th]:!font-bold [&_.ant-table-thead_th]:!border-b [&_.ant-table-thead_th]:!border-slate-100 [&_.ant-table-thead_th]:!py-5 [&_.ant-table-tbody_td]:!py-5"
        />
      </div>
    </div>
  );
};
