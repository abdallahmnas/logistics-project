import React, { useEffect, useMemo, useState } from 'react';
import { Card, Table, Input, Select, Button, Drawer, Descriptions, Tag, Avatar, Modal, Form, message } from 'antd';
import { SearchOutlined, EyeOutlined, UserOutlined, CheckCircleFilled, CloseCircleFilled, UserAddOutlined, EditOutlined } from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { fetchAllUsers } from '../../../store/slices/adminSlice';
import { formatDate, formatPhone } from '../../../utils/formatters';
import type { User } from '../../../types/auth.types';
import apiClient from '../../../api/axios';

const { Option } = Select;

const roleColors: Record<string, string> = {
  customer: 'blue',
  super_admin: 'gold',
  admin: 'orange',
  warehouse_cn: 'cyan',
  warehouse_ng: 'geekblue',
  procurement: 'purple',
  finance: 'emerald',
  clearance_agent: 'magenta',
  driver: 'green',
};

const roleLabels: Record<string, string> = {
  customer: 'Customer',
  super_admin: 'Super Admin',
  admin: 'Admin',
  warehouse_cn: 'Warehouse (CN)',
  warehouse_ng: 'Warehouse (NG)',
  procurement: 'Procurement',
  finance: 'Finance Manager',
  clearance_agent: 'Clearance Agent',
  driver: 'Logistics Driver',
};

export const UserManagement: React.FC = () => {
  const dispatch = useAppDispatch();
  const { users, loading } = useAppSelector((state) => state.admin);
  const [searchText, setSearchText] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [activeUser, setActiveUser] = useState<User | null>(null);
  
  // Permission Groups state
  const [permissionGroups, setPermissionGroups] = useState<any[]>([]);
  const [addStaffOpen, setAddStaffOpen] = useState(false);
  const [creatingStaff, setCreatingStaff] = useState(false);
  const [updatingGroup, setUpdatingGroup] = useState(false);
  const [form] = Form.useForm();

  const fetchPermissionGroups = async () => {
    try {
      const res = await apiClient.get('/permissions/permission-groups');
      setPermissionGroups(res.data.data || []);
    } catch {
      // Ignore fallback
    }
  };

  useEffect(() => {
    dispatch(fetchAllUsers());
    fetchPermissionGroups();
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

  const handleCreateStaff = async (values: any) => {
    try {
      setCreatingStaff(true);
      await apiClient.post('/admin/staff', values);
      message.success(`Staff member ${values.firstName} ${values.lastName} onboarded successfully!`);
      setAddStaffOpen(false);
      form.resetFields();
      dispatch(fetchAllUsers());
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Failed to onboard staff member');
    } finally {
      setCreatingStaff(false);
    }
  };

  const handleUpdatePermissionGroup = async (userId: string, permissionGroupId: string) => {
    try {
      setUpdatingGroup(true);
      await apiClient.patch(`/admin/users/${userId}`, { permissionGroupId });
      message.success('Staff Permission Group updated!');
      dispatch(fetchAllUsers());
      if (activeUser && activeUser.id === userId) {
        setActiveUser({ ...activeUser, permissionGroupId } as any);
      }
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Failed to update permission group');
    } finally {
      setUpdatingGroup(false);
    }
  };

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
    {
      title: 'Permission Group',
      key: 'permissionGroup',
      render: (record: any) => {
        const group = permissionGroups.find((g) => g.id === record.permissionGroupId);
        return group ? (
          <Tag color="purple" className="font-bold text-xs">
            {group.title || group.name}
          </Tag>
        ) : record.role === 'super_admin' ? (
          <Tag color="gold" className="font-bold text-xs">Full Super Admin</Tag>
        ) : (
          <span className="text-slate-400 text-xs italic">Unassigned</span>
        );
      },
    },
    { title: 'Customer ID', dataIndex: 'customerId', key: 'customerId' },
    {
      title: 'Action',
      key: 'action',
      render: (record: User) => (
        <Button type="text" icon={<EyeOutlined />} className="text-brand-navy hover:bg-slate-100" onClick={() => setActiveUser(record)}>
          Details
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 m-0">User Management</h1>
          <p className="text-slate-500 mt-1 mb-0 text-sm">View and manage all platform users, staff accounts, and RBAC permission groups</p>
        </div>
        <Button
          type="primary"
          icon={<UserAddOutlined />}
          size="large"
          className="bg-[#0A1128] hover:bg-[#1a2542] border-none font-bold shadow-md px-6 flex items-center gap-2"
          onClick={() => setAddStaffOpen(true)}
        >
          Add Staff Member
        </Button>
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
            <Option value="admin">Admin</Option>
            <Option value="warehouse_cn">Warehouse (CN)</Option>
            <Option value="warehouse_ng">Warehouse (NG)</Option>
            <Option value="procurement">Procurement</Option>
            <Option value="finance">Finance Manager</Option>
            <Option value="clearance_agent">Clearance Agent</Option>
            <Option value="driver">Logistics Driver</Option>
          </Select>
        </div>
        <Table columns={columns} dataSource={filtered} rowKey="id" loading={loading} scroll={{ x: 1000 }} pagination={{ pageSize: 10 }} className="custom-admin-table" />
      </Card>

      {/* User Details Drawer */}
      <Drawer title="User Profile & Access" open={!!activeUser} onClose={() => setActiveUser(null)} size="large" destroyOnHidden>
        {activeUser && (
          <div className="space-y-6">
            <div className="flex flex-col items-center mb-4">
              <Avatar size={72} icon={<UserOutlined />} src={(activeUser as any).avatar} className="mb-3" />
              <div className="text-lg font-bold text-brand-navy">{activeUser.firstName} {activeUser.lastName}</div>
              <Tag color={roleColors[activeUser.role] || 'default'} className="mt-1 font-bold">
                {roleLabels[activeUser.role] || activeUser.role}
              </Tag>
            </div>

            {/* Permission Group Assignment for Staff */}
            {activeUser.role !== 'customer' && (
              <Card title="RBAC Permission Group Assignment" size="small" className="bg-slate-50 border-slate-200">
                <p className="text-xs text-slate-500 mb-3">Assign or update the permission group that controls this staff member's capabilities.</p>
                <div className="flex gap-2">
                  <Select
                    className="flex-1"
                    size="large"
                    placeholder="Select Permission Group"
                    value={(activeUser as any).permissionGroupId}
                    onChange={(val) => handleUpdatePermissionGroup(activeUser.id, val)}
                    loading={updatingGroup}
                  >
                    {permissionGroups.map((g) => (
                      <Option key={g.id} value={g.id}>
                        {g.title || g.name}
                      </Option>
                    ))}
                  </Select>
                </div>
              </Card>
            )}

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
            </Descriptions>
          </div>
        )}
      </Drawer>

      {/* Add Staff Modal */}
      <Modal
        title="Onboard New Staff Member"
        open={addStaffOpen}
        onCancel={() => setAddStaffOpen(false)}
        footer={null}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleCreateStaff} className="mt-4">
          <div className="grid grid-cols-2 gap-4">
            <Form.Item name="firstName" label="First Name" rules={[{ required: true, message: 'Required' }]}>
              <Input size="large" placeholder="Adebayo" />
            </Form.Item>
            <Form.Item name="lastName" label="Last Name" rules={[{ required: true, message: 'Required' }]}>
              <Input size="large" placeholder="Okonkwo" />
            </Form.Item>
          </div>

          <Form.Item name="email" label="Email Address" rules={[{ required: true, type: 'email', message: 'Valid email required' }]}>
            <Input size="large" placeholder="staff@hamzarmb.com" />
          </Form.Item>

          <Form.Item name="phone" label="Phone Number" rules={[{ required: true, message: 'Required' }]}>
            <Input size="large" placeholder="+234 801 234 5678" />
          </Form.Item>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item name="role" label="Staff Role" rules={[{ required: true, message: 'Required' }]}>
              <Select size="large" placeholder="Select Role">
                <Option value="admin">Admin</Option>
                <Option value="warehouse_cn">Warehouse (CN Hub)</Option>
                <Option value="warehouse_ng">Warehouse (NG Hub)</Option>
                <Option value="procurement">Procurement Specialist</Option>
                <Option value="finance">Finance Manager</Option>
                <Option value="clearance_agent">Clearance Agent</Option>
                <Option value="driver">Logistics Driver</Option>
              </Select>
            </Form.Item>

            <Form.Item name="permissionGroupId" label="Permission Group">
              <Select size="large" placeholder="Assign Group">
                {permissionGroups.map((g) => (
                  <Option key={g.id} value={g.id}>
                    {g.title || g.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </div>

          <Form.Item name="password" label="Temporary Password" rules={[{ min: 6, message: 'At least 6 characters' }]}>
            <Input.Password size="large" placeholder="Logistics123!" />
          </Form.Item>

          <div className="flex justify-end gap-3 mt-6">
            <Button onClick={() => setAddStaffOpen(false)}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={creatingStaff} className="bg-[#0A1128] font-bold px-6">
              Create Staff Account
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};
