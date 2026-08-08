import React, { useEffect, useMemo, useState } from 'react';
import { Card, Table, Input, Select, Button, Drawer, Descriptions, Tag, Avatar } from 'antd';
import { SearchOutlined, EyeOutlined, UserOutlined, CheckCircleFilled, CloseCircleFilled } from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { fetchAllUsers } from '../../../store/slices/adminSlice';
import { formatDate, formatPhone } from '../../../utils/formatters';
import type { User } from '../../../types/auth.types';

const { Option } = Select;

const roleColors: Record<string, string> = {
  customer: 'blue',
  super_admin: 'gold',
  warehouse_cn: 'cyan',
  warehouse_ng: 'geekblue',
  procurement: 'purple',
  driver: 'green',
};

const roleLabels: Record<string, string> = {
  customer: 'Customer',
  super_admin: 'Super Admin',
  warehouse_cn: 'Warehouse (CN)',
  warehouse_ng: 'Warehouse (NG)',
  procurement: 'Procurement',
  driver: 'Driver',
};

export const UserManagement: React.FC = () => {
  const dispatch = useAppDispatch();
  const { users, loading } = useAppSelector((state) => state.admin);
  const [searchText, setSearchText] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [activeUser, setActiveUser] = useState<User | null>(null);

  useEffect(() => {
    dispatch(fetchAllUsers());
  }, [dispatch]);

  const filtered = useMemo(() => {
    return users.filter((u) => {
      const fullName = `${u.firstName} ${u.lastName}`.toLowerCase();
      const matchesSearch =
        fullName.includes(searchText.toLowerCase()) ||
        u.email.toLowerCase().includes(searchText.toLowerCase()) ||
        u.customerId.toLowerCase().includes(searchText.toLowerCase());
      const matchesRole = filterRole === 'all' || u.role === filterRole;
      return matchesSearch && matchesRole;
    });
  }, [users, searchText, filterRole]);

  const columns = [
    {
      title: 'Name',
      key: 'name',
      render: (record: User) => (
        <div className="flex items-center gap-2">
          <Avatar icon={<UserOutlined />} src={record.avatar} />
          <span className="font-medium text-brand-navy">{record.firstName} {record.lastName}</span>
        </div>
      ),
    },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'Phone', dataIndex: 'phone', key: 'phone', render: (p: string) => formatPhone(p) },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => <Tag color={roleColors[role] || 'default'}>{roleLabels[role] || role}</Tag>,
    },
    { title: 'Customer ID', dataIndex: 'customerId', key: 'customerId' },
    {
      title: 'Verified',
      dataIndex: 'isVerified',
      key: 'isVerified',
      render: (v: boolean) =>
        v ? (
          <CheckCircleFilled className="text-emerald-500 text-lg" />
        ) : (
          <CloseCircleFilled className="text-red-400 text-lg" />
        ),
    },
    { title: 'Joined', dataIndex: 'createdAt', key: 'createdAt', render: (d: string) => formatDate(d) },
    {
      title: 'Action',
      key: 'action',
      render: (record: User) => (
        <Button type="text" icon={<EyeOutlined />} className="text-brand-navy hover:bg-slate-100" onClick={() => setActiveUser(record)}>
          View Details
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 m-0">User Management</h1>
        <p className="text-slate-500 mt-1 mb-0 text-sm">View and manage all platform users and staff accounts</p>
      </div>

      <Card bordered={false} className="shadow-sm rounded-2xl">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <Input
            placeholder="Search name, email or customer ID..."
            prefix={<SearchOutlined className="text-slate-400" />}
            className="md:w-1/3"
            size="large"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
          <Select defaultValue="all" size="large" className="md:w-56" onChange={setFilterRole}>
            <Option value="all">All Roles</Option>
            <Option value="customer">Customer</Option>
            <Option value="super_admin">Super Admin</Option>
            <Option value="warehouse_cn">Warehouse (CN)</Option>
            <Option value="warehouse_ng">Warehouse (NG)</Option>
            <Option value="procurement">Procurement</Option>
            <Option value="driver">Driver</Option>
          </Select>
        </div>
        <Table columns={columns} dataSource={filtered} rowKey="id" loading={loading} scroll={{ x: 1000 }} pagination={{ pageSize: 10 }} className="custom-admin-table" />
      </Card>

      <Drawer title="User Details" open={!!activeUser} onClose={() => setActiveUser(null)} size="large" destroyOnHidden>
        {activeUser && (
          <>
            <div className="flex flex-col items-center mb-6">
              <Avatar size={72} icon={<UserOutlined />} src={activeUser.avatar} className="mb-3" />
              <div className="text-lg font-bold text-brand-navy">{activeUser.firstName} {activeUser.lastName}</div>
              <Tag color={roleColors[activeUser.role] || 'default'} className="mt-1">
                {roleLabels[activeUser.role] || activeUser.role}
              </Tag>
            </div>
            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label="Customer ID">{activeUser.customerId}</Descriptions.Item>
              <Descriptions.Item label="Email">{activeUser.email}</Descriptions.Item>
              <Descriptions.Item label="Phone">{formatPhone(activeUser.phone)}</Descriptions.Item>
              <Descriptions.Item label="Verified">
                {activeUser.isVerified ? (
                  <span className="text-emerald-600 font-medium">Verified</span>
                ) : (
                  <span className="text-red-500 font-medium">Not Verified</span>
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Joined">{formatDate(activeUser.createdAt)}</Descriptions.Item>
              <Descriptions.Item label="Last Updated">{formatDate(activeUser.updatedAt)}</Descriptions.Item>
            </Descriptions>
          </>
        )}
      </Drawer>
    </div>
  );
};
