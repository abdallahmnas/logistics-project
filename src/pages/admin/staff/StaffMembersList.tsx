import React, { useState } from 'react';
import { Button, Table, Input, Select, Tag, Avatar } from 'antd';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

export const StaffMembersList: React.FC = () => {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState('');

  const staff = [
    {
      id: 'staff-1',
      name: 'Alex Rivera',
      email: 'alex@globallogistics.com',
      role: 'Super Admin',
      department: 'Executive',
      status: 'active',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=150&auto=format&fit=crop',
    },
    {
      id: 'staff-2',
      name: 'Sarah Chen',
      email: 'sarah.c@globallogistics.com',
      role: 'Operations Manager',
      department: 'Operations',
      status: 'active',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=150&auto=format&fit=crop',
    },
    {
      id: 'staff-3',
      name: 'Michael Adebayo',
      email: 'm.adebayo@globallogistics.com',
      role: 'Finance',
      department: 'Financials',
      status: 'active',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=150&auto=format&fit=crop',
    },
    {
      id: 'staff-4',
      name: 'Elena Sokolov',
      email: 'e.sokolov@globallogistics.com',
      role: 'Customer Support',
      department: 'Support',
      status: 'pending',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=150&auto=format&fit=crop',
    },
  ];

  const columns = [
    {
      title: 'Staff Member',
      key: 'member',
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
      title: 'Role / Permission',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => {
        let colorClass = "bg-slate-100 text-slate-700";
        if (role === 'Finance') colorClass = "bg-orange-50 text-orange-700";
        return (
          <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${colorClass}`}>
            {role}
          </span>
        );
      },
    },
    {
      title: 'Department',
      dataIndex: 'department',
      key: 'department',
      render: (text: string) => <span className="text-[#0A1128] font-medium">{text}</span>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <span className={`inline-flex items-center gap-1.5 px-0 py-1 text-sm font-medium ${status === 'active' ? 'text-green-600' : 'text-brand-orange'}`}>
          <span className={`w-2 h-2 rounded-full ${status === 'active' ? 'bg-green-500' : 'bg-brand-orange'}`}></span>
          {status === 'active' ? 'Active' : 'Pending'}
        </span>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      align: 'right' as const,
      render: () => <span className="text-slate-400">...</span>, // Placeholder for actions
    },
  ];

  return (
    <div className="animate-fade-in-up max-w-[1100px] mx-auto py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-[#0A1128] m-0 mb-2 tracking-tight">Staff Members</h1>
          <p className="text-slate-600 text-base m-0 max-w-2xl">
            Manage your team, assign roles, and monitor account activity across the organization.
          </p>
        </div>
        <Button
          type="primary"
          size="large"
          icon={<PlusOutlined />}
          className="bg-[#0A1128] hover:bg-[#1a2542] border-none font-bold shadow-md px-6 py-5 h-auto flex items-center justify-center min-w-[200px]"
          onClick={() => navigate('/admin/staff/new')}
        >
          Add Staff Member
        </Button>
      </div>

      <div className="bg-slate-50 p-6 rounded-t-xl border border-slate-100 flex flex-col md:flex-row gap-4 mb-0">
        <Input
          placeholder="Search by name or email..."
          prefix={<SearchOutlined className="text-slate-400" />}
          className="max-w-md h-12 border-white hover:border-slate-300 focus:border-brand-orange text-base px-4"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
        <div className="flex-1"></div>
        <Select
          defaultValue="all_depts"
          className="w-48 h-12 [&_.ant-select-selector]:border-white [&_.ant-select-selector]:hover:border-slate-300 [&_.ant-select-selector]:h-12 [&_.ant-select-selection-item]:leading-[46px] bg-white rounded-lg font-medium"
          options={[
            { value: 'all_depts', label: 'All Departments' },
            { value: 'exec', label: 'Executive' },
            { value: 'ops', label: 'Operations' },
          ]}
        />
        <Select
          defaultValue="all_roles"
          className="w-48 h-12 [&_.ant-select-selector]:border-white [&_.ant-select-selector]:hover:border-slate-300 [&_.ant-select-selector]:h-12 [&_.ant-select-selection-item]:leading-[46px] bg-white rounded-lg font-medium"
          options={[
            { value: 'all_roles', label: 'All Roles/Permissions' },
            { value: 'admin', label: 'Super Admin' },
          ]}
        />
      </div>

      <div className="bg-white rounded-b-xl border-x border-b border-slate-100 shadow-sm overflow-hidden">
        <Table
          columns={columns}
          dataSource={staff}
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
