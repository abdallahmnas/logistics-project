import React, { useEffect, useMemo } from 'react';
import { Button, Table, Tag, Dropdown } from 'antd';
import { PlusOutlined, MoreOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { fetchAllUsers } from '../../../store/slices/adminSlice';

export const PermissionGroups: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { users } = useAppSelector((state) => state.admin);

  useEffect(() => {
    dispatch(fetchAllUsers());
  }, [dispatch]);

  const groups = useMemo(() => {
    const rolesMap: Record<string, { name: string; desc: string; count: number }> = {
      super_admin: { name: 'Super Admin', desc: 'Full system management and administrative control', count: 0 },
      admin: { name: 'Admin', desc: 'General administrative operations and user management', count: 0 },
      warehouse_cn: { name: 'Warehouse (China Hub)', desc: 'Scan inbound packages, weigh, and build master batches', count: 0 },
      warehouse_ng: { name: 'Warehouse (Nigeria Hub)', desc: 'Customs clearance, local dispatch, and package pickup', count: 0 },
      procurement: { name: 'Procurement Specialist', desc: 'Review "Buy For Me" requests and issue supplier quotes', count: 0 },
      finance: { name: 'Finance Manager', desc: 'Verify exchange payments and process RMB transfers', count: 0 },
      driver: { name: 'Logistics Driver', desc: 'Receive local delivery dispatch tasks and verification PINs', count: 0 },
    };

    users.forEach((u) => {
      if (rolesMap[u.role]) {
        rolesMap[u.role].count += 1;
      }
    });

    return Object.entries(rolesMap).map(([id, data]) => ({
      id,
      name: data.name,
      description: data.desc,
      members: data.count,
      status: 'active',
    }));
  }, [users]);

  const columns = [
    {
      title: 'PERMISSION GROUP',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => <span className="text-[#0A1128] font-bold text-sm">{text}</span>,
    },
    {
      title: 'DESCRIPTION',
      dataIndex: 'description',
      key: 'description',
      render: (text: string) => <span className="text-slate-600 text-xs">{text}</span>,
    },
    {
      title: 'ASSIGNED STAFF',
      dataIndex: 'members',
      key: 'members',
      render: (count: number) => (
        <div className="w-8 h-8 rounded-full bg-orange-50 text-brand-orange font-bold flex items-center justify-center text-xs">
          {count}
        </div>
      ),
    },
    {
      title: 'STATUS',
      dataIndex: 'status',
      key: 'status',
      render: () => (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase tracking-wider">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          Active
        </span>
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
            System permission groups mapping to platform user roles and database authorization.
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <Table
          columns={columns}
          dataSource={groups}
          rowKey="id"
          pagination={false}
          className="[&_.ant-table-thead_th]:!bg-slate-50 [&_.ant-table-thead_th]:!text-slate-500 [&_.ant-table-thead_th]:!text-xs [&_.ant-table-thead_th]:!font-bold [&_.ant-table-thead_th]:!uppercase [&_.ant-table-thead_th]:!tracking-wider [&_.ant-table-thead_th]:!border-b-2 [&_.ant-table-thead_th]:!border-slate-100 [&_.ant-table-tbody_td]:!py-5"
        />
      </div>
    </div>
  );
};
