import React, { useEffect, useState } from 'react';
import { Button, Table, Tag, Dropdown, Modal, message } from 'antd';
import { PlusOutlined, MoreOutlined, EyeOutlined, DeleteOutlined, SafetyCertificateOutlined, TeamOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../../api/axios';

interface PermissionGroupItem {
  id: string;
  name: string;
  title?: string;
  description?: string;
  status?: string;
  isActive?: boolean;
  members?: any[];
  permissionRules?: any[];
  permissions?: Record<string, Record<string, boolean>>;
}

export const PermissionGroups: React.FC = () => {
  const navigate = useNavigate();
  const [groups, setGroups] = useState<PermissionGroupItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/permissions/permission-groups');
      setGroups(res.data.data || []);
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Failed to load permission groups');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const handleDeleteGroup = (group: PermissionGroupItem) => {
    Modal.confirm({
      title: `Delete Permission Group "${group.name || group.title}"?`,
      content: 'This will remove the group and all associated rule permissions. Make sure no staff are assigned to this group.',
      okText: 'Delete',
      okType: 'danger',
      onOk: async () => {
        try {
          await apiClient.delete(`/permissions/permission-groups/${group.id}`);
          message.success('Permission Group deleted successfully');
          fetchGroups();
        } catch (err: any) {
          message.error(err.response?.data?.message || 'Failed to delete permission group');
        }
      },
    });
  };

  const columns = [
    {
      title: 'PERMISSION GROUP',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: PermissionGroupItem) => (
        <div>
          <div className="text-[#0A1128] font-bold text-sm hover:text-brand-orange cursor-pointer" onClick={() => navigate(`/admin/permissions/${record.id}`)}>
            {record.title || record.name}
          </div>
          {record.description && <div className="text-slate-400 text-xs mt-0.5">{record.description}</div>}
        </div>
      ),
    },
    {
      title: 'ASSIGNED STAFF',
      dataIndex: 'members',
      key: 'members',
      render: (members: any[]) => {
        const count = members ? members.length : 0;
        return (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-orange-50 text-brand-orange font-bold flex items-center justify-center text-xs">
              {count}
            </div>
            <span className="text-xs text-slate-500 font-medium">staff member{count !== 1 ? 's' : ''}</span>
          </div>
        );
      },
    },
    {
      title: 'RULES ACTIVE',
      key: 'rules',
      render: (record: PermissionGroupItem) => {
        let activeCount = 0;
        if (record.permissionRules) {
          activeCount = record.permissionRules.filter((r) => r.status === 'active').length;
        } else if (record.permissions) {
          Object.values(record.permissions).forEach((mod) => {
            Object.values(mod).forEach((val) => { if (val) activeCount++; });
          });
        }
        return (
          <Tag color="blue" className="font-bold text-xs px-2.5 py-0.5 rounded-full border-none">
            {activeCount} active rules
          </Tag>
        );
      },
    },
    {
      title: 'STATUS',
      dataIndex: 'status',
      key: 'status',
      render: (_: any, record: PermissionGroupItem) => {
        const isActive = record.status === 'active' || record.isActive !== false;
        return (
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
            {isActive ? 'Active' : 'Inactive'}
          </span>
        );
      },
    },
    {
      title: 'ACTION',
      key: 'action',
      render: (record: PermissionGroupItem) => (
        <Dropdown
          menu={{
            items: [
              {
                key: 'edit',
                icon: <EyeOutlined />,
                label: 'View / Edit Matrix Rules',
                onClick: () => navigate(`/admin/permissions/${record.id}`),
              },
              {
                key: 'delete',
                icon: <DeleteOutlined />,
                danger: true,
                label: 'Delete Group',
                onClick: () => handleDeleteGroup(record),
              },
            ],
          }}
          trigger={['click']}
        >
          <Button type="text" icon={<MoreOutlined />} className="text-slate-500 hover:text-brand-navy" />
        </Dropdown>
      ),
    },
  ];

  return (
    <div className="animate-fade-in-up max-w-[1000px] mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0A1128] m-0 mb-1 flex items-center gap-2">
            <SafetyCertificateOutlined className="text-brand-navy" /> Permission Groups & RBAC
          </h1>
          <p className="text-slate-500 text-sm m-0">
            Configure system permission groups, staff authorization levels, and operational matrix capabilities.
          </p>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          size="large"
          className="bg-[#0A1128] hover:bg-[#1a2542] border-none font-bold shadow-md px-6 flex items-center gap-2"
          onClick={() => navigate('/admin/permissions/new')}
        >
          Create Permission Group
        </Button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <Table
          columns={columns}
          dataSource={groups}
          rowKey="id"
          loading={loading}
          pagination={false}
          className="[&_.ant-table-thead_th]:!bg-slate-50 [&_.ant-table-thead_th]:!text-slate-500 [&_.ant-table-thead_th]:!text-xs [&_.ant-table-thead_th]:!font-bold [&_.ant-table-thead_th]:!uppercase [&_.ant-table-thead_th]:!tracking-wider [&_.ant-table-thead_th]:!border-b-2 [&_.ant-table-thead_th]:!border-slate-100 [&_.ant-table-tbody_td]:!py-5"
        />
      </div>
    </div>
  );
};

export default PermissionGroups;
