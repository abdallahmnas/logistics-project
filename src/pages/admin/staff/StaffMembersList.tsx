import React, { useEffect, useState, useMemo } from 'react';
import { Button, Table, Input, Select, Tag, Avatar, Dropdown, message, Modal, Form, Popconfirm, Card } from 'antd';
import { PlusOutlined, SearchOutlined, UserOutlined, MoreOutlined, EditOutlined, DeleteOutlined, TeamOutlined, SafetyCertificateOutlined, CodeOutlined, SolutionOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { fetchAllUsers, createStaffMember, updateUser, deleteUser } from '../../../store/slices/adminSlice';
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

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<User | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [addForm] = Form.useForm();
  const [editForm] = Form.useForm();

  useEffect(() => {
    dispatch(fetchAllUsers());
  }, [dispatch]);

  // Filter staff members only (role !== 'customer')
  const staffList = useMemo(() => {
    return users.filter((u) => u.role !== 'customer');
  }, [users]);

  // Metrics
  const stats = useMemo(() => {
    const total = staffList.length;
    const superAdmins = staffList.filter((s) => s.role === 'super_admin').length;
    const warehouse = staffList.filter((s) => s.role === 'warehouse_cn' || s.role === 'warehouse_ng').length;
    const opsFinance = staffList.filter((s) => s.role === 'finance' || s.role === 'procurement' || s.role === 'admin').length;
    return { total, superAdmins, warehouse, opsFinance };
  }, [staffList]);

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
      message.success('Staff member removed successfully');
    } catch {
      message.error('Failed to remove staff member');
    }
  };

  const handleCreateStaff = async () => {
    try {
      const values = await addForm.validateFields();
      setSubmitting(true);
      await dispatch(createStaffMember(values)).unwrap();
      message.success('New staff member onboarded successfully!');
      setIsAddModalOpen(false);
      addForm.resetFields();
    } catch (err: any) {
      if (err?.errorFields) return;
      message.error(err?.message || 'Failed to create staff member');
    } finally {
      setSubmitting(false);
    }
  };

  const openEditModal = (record: User) => {
    setSelectedStaff(record);
    editForm.setFieldsValue({
      firstName: record.firstName,
      lastName: record.lastName,
      email: record.email,
      phone: record.phone,
      role: record.role,
      isVerified: record.isVerified,
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateStaff = async () => {
    if (!selectedStaff) return;
    try {
      const values = await editForm.validateFields();
      setSubmitting(true);
      await dispatch(updateUser({ userId: selectedStaff.id, data: values })).unwrap();
      message.success('Staff details updated successfully');
      setIsEditModalOpen(false);
      setSelectedStaff(null);
    } catch (err: any) {
      if (err?.errorFields) return;
      message.error(err?.message || 'Failed to update staff member');
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    {
      title: 'Staff Member',
      key: 'member',
      render: (record: User) => (
        <div className="flex items-center gap-3">
          <Avatar icon={<UserOutlined />} src={record.profilePhoto} size={42} className="bg-[#0A1128] text-white font-bold shadow-xs" />
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
        <Tag color={roleColors[role] || 'default'} className="font-bold uppercase text-[11px] px-3 py-1 rounded-full border-none shadow-xs">
          {roleLabels[role] || role}
        </Tag>
      ),
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
      render: (phone: string) => <span className="text-slate-600 font-medium text-xs">{phone || '—'}</span>,
    },
    {
      title: 'Status',
      dataIndex: 'isVerified',
      key: 'status',
      render: (isVerified: boolean) => (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${isVerified ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
          <span className={`w-2 h-2 rounded-full ${isVerified ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
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
        <div className="flex justify-end gap-2">
          <Button
            type="text"
            icon={<EditOutlined className="text-slate-500 hover:text-brand-orange text-base" />}
            onClick={() => openEditModal(record)}
            title="Edit Staff Member"
          />
          <Popconfirm
            title="Remove Staff Member"
            description="Are you sure you want to remove this staff member?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes, Remove"
            cancelText="Cancel"
            okButtonProps={{ danger: true }}
          >
            <Button
              type="text"
              danger
              icon={<DeleteOutlined className="text-base" />}
              title="Remove Staff"
            />
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <div className="animate-fade-in-up max-w-[1200px] mx-auto py-8">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-[#0A1128] m-0 mb-1 tracking-tight">Staff Members</h1>
          <p className="text-slate-600 text-sm m-0 max-w-2xl">
            Manage your organization's team members, role assignments, and system authorization limits.
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            type="primary"
            size="large"
            icon={<PlusOutlined />}
            onClick={() => navigate('/admin/staff/new')}
            className="bg-brand-orange hover:bg-[#E86E21] border-none font-bold shadow-md h-12 text-base rounded-xl px-6"
          >
            Onboard New Staff
          </Button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <Card variant="borderless" className="shadow-sm border border-slate-100 rounded-2xl bg-white">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-orange-50 text-brand-orange flex items-center justify-center text-xl font-bold">
              <TeamOutlined />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Staff</div>
              <div className="text-2xl font-extrabold text-[#0A1128] mt-0.5">{stats.total}</div>
            </div>
          </div>
        </Card>

        <Card variant="borderless" className="shadow-sm border border-slate-100 rounded-2xl bg-white">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-xl font-bold">
              <SafetyCertificateOutlined />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Super Admins</div>
              <div className="text-2xl font-extrabold text-[#0A1128] mt-0.5">{stats.superAdmins}</div>
            </div>
          </div>
        </Card>

        <Card variant="borderless" className="shadow-sm border border-slate-100 rounded-2xl bg-white">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center text-xl font-bold">
              <CodeOutlined />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Warehouse Ops</div>
              <div className="text-2xl font-extrabold text-[#0A1128] mt-0.5">{stats.warehouse}</div>
            </div>
          </div>
        </Card>

        <Card variant="borderless" className="shadow-sm border border-slate-100 rounded-2xl bg-white">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center text-xl font-bold">
              <SolutionOutlined />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Ops & Finance</div>
              <div className="text-2xl font-extrabold text-[#0A1128] mt-0.5">{stats.opsFinance}</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Filter Bar */}
      <div className="bg-slate-50 p-6 rounded-t-2xl border border-slate-100 flex flex-col md:flex-row gap-4 mb-0">
        <Input
          placeholder="Search staff by name or email..."
          prefix={<SearchOutlined className="text-slate-400" />}
          className="max-w-md h-12 border-white hover:border-slate-300 focus:border-brand-orange text-base px-4 rounded-xl"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
        <div className="flex-1"></div>
        <Select
          defaultValue="all_roles"
          className="w-60 h-12 [&_.ant-select-selector]:border-white [&_.ant-select-selector]:hover:border-slate-300 [&_.ant-select-selector]:h-12 [&_.ant-select-selection-item]:leading-[46px] bg-white rounded-xl font-medium"
          value={filterRole}
          onChange={setFilterRole}
          options={[
            { value: 'all_roles', label: 'All Staff Roles' },
            { value: 'super_admin', label: 'Super Admin' },
            { value: 'admin', label: 'Admin' },
            { value: 'warehouse_cn', label: 'Warehouse (CN)' },
            { value: 'warehouse_ng', label: 'Warehouse (NG)' },
            { value: 'procurement', label: 'Procurement' },
            { value: 'finance', label: 'Finance' },
            { value: 'driver', label: 'Driver' },
          ]}
        />
      </div>

      {/* Staff Table */}
      <div className="bg-white rounded-b-2xl border-x border-b border-slate-100 shadow-sm overflow-hidden">
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

      {/* Edit Staff Modal */}
      <Modal
        title={<span className="text-xl font-bold text-[#0A1128]">Edit Staff Member Profile</span>}
        open={isEditModalOpen}
        onCancel={() => setIsEditModalOpen(false)}
        onOk={handleUpdateStaff}
        confirmLoading={submitting}
        okText="Save Changes"
        okButtonProps={{ className: 'bg-brand-orange hover:bg-[#E86E21] border-none font-bold' }}
        width={550}
        destroyOnClose
      >
        <Form form={editForm} layout="vertical" className="mt-4">
          <div className="grid grid-cols-2 gap-4">
            <Form.Item name="firstName" label="First Name" rules={[{ required: true }]}>
              <Input size="large" className="rounded-xl" />
            </Form.Item>
            <Form.Item name="lastName" label="Last Name" rules={[{ required: true }]}>
              <Input size="large" className="rounded-xl" />
            </Form.Item>
          </div>

          <Form.Item name="email" label="Email Address" rules={[{ required: true, type: 'email' }]}>
            <Input size="large" className="rounded-xl bg-slate-50" disabled />
          </Form.Item>

          <Form.Item name="phone" label="Phone Number">
            <Input size="large" className="rounded-xl" />
          </Form.Item>

          <Form.Item name="role" label="Assign System Role / Permission" rules={[{ required: true }]}>
            <Select size="large" className="rounded-xl">
              <Select.Option value="super_admin">Super Admin</Select.Option>
              <Select.Option value="admin">Admin</Select.Option>
              <Select.Option value="warehouse_cn">Warehouse (China Hub)</Select.Option>
              <Select.Option value="warehouse_ng">Warehouse (Nigeria Hub)</Select.Option>
              <Select.Option value="procurement">Procurement Specialist</Select.Option>
              <Select.Option value="finance">Finance Manager</Select.Option>
              <Select.Option value="driver">Logistics Driver</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item name="isVerified" label="Account Status">
            <Select size="large" className="rounded-xl">
              <Select.Option value={true}>Active</Select.Option>
              <Select.Option value={false}>Suspended / Pending</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
