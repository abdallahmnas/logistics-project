import React, { useState } from 'react';
import { Button, Table, Input, Select, Tag, Dropdown } from 'antd';
import { PlusOutlined, SearchOutlined, MoreOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

export const PermissionGroups: React.FC = () => {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState('');

  const groups = [
    {
      id: 'super-admin',
      name: 'Super Admin',
      description: 'Full system access',
      members: 12,
      permissions: 24,
      status: 'active',
      lastUpdated: 'Aug 1, 2026',
    },
    {
      id: 'operations-manager',
      name: 'Operations Manager',
      description: 'Manage operation...',
      members: 8,
      permissions: 18,
      status: 'active',
      lastUpdated: 'Aug 8, 2026',
    },
    {
      id: 'finance',
      name: 'Finance',
      description: 'Access financial a...',
      members: 5,
      permissions: 10,
      status: 'active',
      lastUpdated: 'Jul 20, 2026',
    },
    {
      id: 'customer-support',
      name: 'Customer Support',
      description: 'Manage customer...',
      members: 14,
      permissions: 8,
      status: 'active',
      lastUpdated: 'Aug 5, 2026',
    },
  ];

  const columns = [
    {
      title: 'GROUP NAME',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: any) => (
        <a 
          className="text-slate-700 font-medium hover:text-[#0A1128] cursor-pointer"
          onClick={() => navigate(`/admin/permissions/${record.id}`)}
        >
          {text}
        </a>
      ),
    },
    {
      title: 'DESCRIPTION',
      dataIndex: 'description',
      key: 'description',
      render: (text: string) => <span className="text-slate-600">{text}</span>,
    },
    {
      title: 'MEMBERS',
      dataIndex: 'members',
      key: 'members',
      render: (count: number) => (
        <div className="w-8 h-8 rounded-full bg-orange-50 text-brand-orange font-bold flex items-center justify-center text-xs">
          {count < 10 ? `0${count}` : count}
        </div>
      ),
    },
    {
      title: 'PERMISSIONS',
      dataIndex: 'permissions',
      key: 'permissions',
      render: (count: number) => (
        <span className="text-slate-600 font-medium">
          {count < 10 ? `0${count}` : count}
        </span>
      ),
    },
    {
      title: 'STATUS',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-wider">
          <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
          Active
        </span>
      ),
    },
    {
      title: 'LAST UPDATED',
      dataIndex: 'lastUpdated',
      key: 'lastUpdated',
      render: (date: string) => <span className="text-slate-600 text-sm whitespace-pre-wrap leading-tight block w-20">{date.replace(', ', ',\n')}</span>,
    },
    {
      title: 'ACTIONS',
      key: 'actions',
      render: (record: any) => (
        <Dropdown
          menu={{
            items: [
              { key: 'edit', label: 'Edit Group', onClick: () => navigate(`/admin/permissions/${record.id}`) },
              { key: 'deactivate', label: 'Deactivate', danger: true },
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
    <div className="animate-fade-in-up max-w-[1000px] mx-auto py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0A1128] m-0 mb-1">Permission Groups</h1>
          <p className="text-slate-500 text-sm m-0">
            Create and manage permission groups to control what users can access and perform within the platform.
          </p>
        </div>
        <Button
          type="primary"
          size="large"
          icon={<PlusOutlined />}
          className="bg-[#0A1128] hover:bg-[#1a2542] border-none font-bold shadow-md px-6 py-5 h-auto flex flex-col items-center justify-center leading-tight min-w-[200px]"
          onClick={() => navigate('/admin/permissions/new')}
        >
          <span>Create Permission</span>
          <span>Group</span>
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-slate-50 p-4 rounded-t-xl border border-slate-100 flex gap-4">
        <Input
          placeholder="Search permission groups..."
          prefix={<SearchOutlined className="text-slate-400" />}
          className="max-w-md h-10 border-white hover:border-slate-300 focus:border-brand-orange"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
        <Select
          defaultValue="all"
          className="w-40 h-10 [&_.ant-select-selector]:border-white [&_.ant-select-selector]:hover:border-slate-300"
          options={[
            { value: 'all', label: 'All Status' },
            { value: 'active', label: 'Active' },
            { value: 'inactive', label: 'Inactive' },
          ]}
        />
        <div className="flex-1"></div>
        <div className="flex items-center gap-2 bg-white px-4 rounded-lg border border-white">
          <span className="text-slate-500 text-sm">Sort by:</span>
          <Select
            defaultValue="newest"
            variant="borderless"
            className="w-24 [&_.ant-select-selector]:!px-0 font-medium"
            options={[
              { value: 'newest', label: 'Newest' },
              { value: 'oldest', label: 'Oldest' },
            ]}
          />
          <Button type="text" icon={<span className="text-slate-400 text-lg">≡</span>} className="p-0 min-w-0 w-6 hover:bg-transparent" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-b-xl border-x border-b border-slate-100 shadow-sm overflow-hidden">
        <Table
          columns={columns}
          dataSource={groups}
          rowKey="id"
          pagination={{
            total: 4,
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total, range) => `Showing ${range[0]} to ${range[1]} of ${total} entries`,
            className: '!px-6 !py-4 m-0 border-t border-slate-100',
          }}
          className="[&_.ant-table-thead_th]:!bg-slate-50 [&_.ant-table-thead_th]:!text-slate-500 [&_.ant-table-thead_th]:!text-xs [&_.ant-table-thead_th]:!font-bold [&_.ant-table-thead_th]:!uppercase [&_.ant-table-thead_th]:!tracking-wider [&_.ant-table-thead_th]:!border-b-2 [&_.ant-table-thead_th]:!border-slate-100 [&_.ant-table-tbody_td]:!py-5"
        />
      </div>
    </div>
  );
};
