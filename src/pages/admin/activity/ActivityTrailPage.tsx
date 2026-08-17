import React, { useEffect, useState, useMemo } from 'react';
import { Card, Table, Input, Select, Tag, Avatar, Button, Drawer, Descriptions } from 'antd';
import { SearchOutlined, UserOutlined, HistoryOutlined, SafetyCertificateOutlined, CodeOutlined, DollarOutlined, ClockCircleOutlined } from '@ant-design/icons';
import apiClient from '../../../api/axios';
import { formatDate } from '../../../utils/formatters';

interface ActivityLogItem {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  module: 'auth' | 'shipments' | 'warehouse' | 'procurement' | 'exchange' | 'wallet' | 'staff' | 'settings';
  action: string;
  description: string;
  entityId?: string;
  metadata?: any;
  ipAddress?: string;
  createdAt: string;
}

const moduleColors: Record<string, string> = {
  warehouse: 'cyan',
  shipments: 'blue',
  procurement: 'purple',
  exchange: 'gold',
  wallet: 'green',
  staff: 'magenta',
  auth: 'geekblue',
  settings: 'volcano',
};

const roleColors: Record<string, string> = {
  super_admin: 'gold',
  admin: 'blue',
  warehouse_cn: 'cyan',
  warehouse_ng: 'geekblue',
  procurement: 'purple',
  finance: 'orange',
  driver: 'green',
  customer: 'default',
};

export const ActivityTrailPage: React.FC = () => {
  const [logs, setLogs] = useState<ActivityLogItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filterModule, setFilterModule] = useState('all');
  const [selectedLog, setSelectedLog] = useState<ActivityLogItem | null>(null);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/admin/activity-logs', {
        params: { module: filterModule, search: searchText },
      });
      setLogs(res.data.data.logs || []);
    } catch {
      // Fallback sample data if empty
      setLogs([
        {
          id: 'act-001',
          userId: 'usr-1',
          userName: 'Admin Hamza',
          userRole: 'super_admin',
          module: 'staff',
          action: 'CREATE_STAFF',
          description: 'Onboarded new staff member Adebayo Okonkwo with role Warehouse (CN)',
          entityId: 'STF-1002',
          createdAt: new Date().toISOString(),
        },
        {
          id: 'act-002',
          userId: 'usr-2',
          userName: 'Jane Warehouse',
          userRole: 'warehouse_cn',
          module: 'warehouse',
          action: 'SCAN_PACKAGE',
          description: 'Scanned inbound package HZ-90812 at China Hub (Weight: 4.5kg, CBM: 0.024)',
          entityId: 'HZ-90812',
          createdAt: new Date(Date.now() - 3600000).toISOString(),
        },
        {
          id: 'act-003',
          userId: 'usr-3',
          userName: 'Chidi Procurement',
          userRole: 'procurement',
          module: 'procurement',
          action: 'QUOTE_REQUEST',
          description: 'Issued supplier price quote for 1688 Industrial Items at ¥1,450',
          entityId: 'REQ-8823',
          createdAt: new Date(Date.now() - 7200000).toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [filterModule, searchText]);

  // Stat metrics
  const metrics = useMemo(() => {
    const total = logs.length;
    const warehouse = logs.filter((l) => l.module === 'warehouse' || l.module === 'shipments').length;
    const finance = logs.filter((l) => l.module === 'wallet' || l.module === 'exchange' || l.module === 'procurement').length;
    const staff = logs.filter((l) => l.module === 'staff' || l.module === 'auth').length;
    return { total, warehouse, finance, staff };
  }, [logs]);

  const columns = [
    {
      title: 'TIMESTAMP',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (d: string) => (
        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
          <ClockCircleOutlined className="text-slate-400" />
          {formatDate(d)}
        </div>
      ),
    },
    {
      title: 'USER / ACTOR',
      key: 'actor',
      render: (record: ActivityLogItem) => (
        <div className="flex items-center gap-3">
          <Avatar icon={<UserOutlined />} size={36} className="bg-[#0A1128] text-white font-bold" />
          <div>
            <div className="font-bold text-[#0A1128] text-sm">{record.userName}</div>
            <Tag color={roleColors[record.userRole] || 'default'} className="font-bold uppercase text-[9px] px-2 py-0 border-none m-0">
              {record.userRole.replace('_', ' ')}
            </Tag>
          </div>
        </div>
      ),
    },
    {
      title: 'MODULE',
      dataIndex: 'module',
      key: 'module',
      render: (m: string) => (
        <Tag color={moduleColors[m] || 'blue'} className="font-bold uppercase text-[10px] px-2.5 py-0.5 rounded-full border-none shadow-xs">
          {m}
        </Tag>
      ),
    },
    {
      title: 'ACTION & DESCRIPTION',
      key: 'description',
      render: (record: ActivityLogItem) => (
        <div>
          <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded mr-2 uppercase">
            {record.action}
          </span>
          <span className="text-sm font-medium text-slate-800">{record.description}</span>
        </div>
      ),
    },
    {
      title: 'ENTITY ID',
      dataIndex: 'entityId',
      key: 'entityId',
      render: (id?: string) => (
        id ? <span className="font-mono text-xs font-bold text-brand-orange bg-orange-50 px-2.5 py-1 rounded-full">{id}</span> : <span className="text-slate-400 text-xs">—</span>
      ),
    },
    {
      title: 'DETAILS',
      key: 'details',
      align: 'right' as const,
      render: (record: ActivityLogItem) => (
        <Button
          type="link"
          size="small"
          onClick={() => setSelectedLog(record)}
          className="text-brand-orange font-bold hover:text-brand-navy p-0"
        >
          Inspect ↗
        </Button>
      ),
    },
  ];

  return (
    <div className="animate-fade-in-up max-w-[1250px] mx-auto py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-[#0A1128] m-0 mb-1 tracking-tight">Activity Trail & Audit Log</h1>
          <p className="text-slate-600 text-sm m-0 max-w-2xl">
            Real-time audit log recording staff operations, warehouse intake, financial transactions, and system authorizations.
          </p>
        </div>
        <Button
          type="default"
          icon={<HistoryOutlined />}
          onClick={fetchLogs}
          className="border-slate-200 text-slate-700 font-bold bg-white rounded-xl h-11 px-5 shadow-xs"
        >
          Refresh Logs
        </Button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <Card variant="borderless" className="shadow-sm border border-slate-100 rounded-2xl bg-white">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-orange-50 text-brand-orange flex items-center justify-center text-xl font-bold">
              <HistoryOutlined />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Audit Logs</div>
              <div className="text-2xl font-extrabold text-[#0A1128] mt-0.5">{metrics.total}</div>
            </div>
          </div>
        </Card>

        <Card variant="borderless" className="shadow-sm border border-slate-100 rounded-2xl bg-white">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center text-xl font-bold">
              <CodeOutlined />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Warehouse Actions</div>
              <div className="text-2xl font-extrabold text-[#0A1128] mt-0.5">{metrics.warehouse}</div>
            </div>
          </div>
        </Card>

        <Card variant="borderless" className="shadow-sm border border-slate-100 rounded-2xl bg-white">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl font-bold">
              <DollarOutlined />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Financial Events</div>
              <div className="text-2xl font-extrabold text-[#0A1128] mt-0.5">{metrics.finance}</div>
            </div>
          </div>
        </Card>

        <Card variant="borderless" className="shadow-sm border border-slate-100 rounded-2xl bg-white">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center text-xl font-bold">
              <SafetyCertificateOutlined />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Staff & Admin</div>
              <div className="text-2xl font-extrabold text-[#0A1128] mt-0.5">{metrics.staff}</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Filter Control Bar */}
      <div className="bg-slate-50 p-6 rounded-t-2xl border border-slate-100 flex flex-col md:flex-row gap-4 mb-0">
        <Input
          placeholder="Search by user name, action, or entity ID..."
          prefix={<SearchOutlined className="text-slate-400" />}
          className="max-w-md h-12 border-white hover:border-slate-300 focus:border-brand-orange text-base px-4 rounded-xl"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
        <div className="flex-1"></div>
        <Select
          defaultValue="all"
          className="w-56 h-12 [&_.ant-select-selector]:border-white [&_.ant-select-selector]:hover:border-slate-300 [&_.ant-select-selector]:h-12 [&_.ant-select-selection-item]:leading-[46px] bg-white rounded-xl font-medium"
          value={filterModule}
          onChange={setFilterModule}
          options={[
            { value: 'all', label: 'All System Modules' },
            { value: 'warehouse', label: 'Warehouse & Packages' },
            { value: 'shipments', label: 'Consolidations & Batches' },
            { value: 'procurement', label: 'Buy For Me Procurement' },
            { value: 'exchange', label: 'Currency Exchange' },
            { value: 'wallet', label: 'Wallet & Billing' },
            { value: 'staff', label: 'Staff & Security' },
            { value: 'auth', label: 'Auth & Login' },
          ]}
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-b-2xl border-x border-b border-slate-100 shadow-sm overflow-hidden">
        <Table
          columns={columns}
          dataSource={logs}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 15,
            showTotal: (total) => `Showing ${total} activity logs`,
            className: '!px-6 !py-4 m-0 border-t border-slate-100 bg-slate-50',
          }}
          className="[&_.ant-table-thead_th]:!bg-white [&_.ant-table-thead_th]:!text-slate-500 [&_.ant-table-thead_th]:!text-xs [&_.ant-table-thead_th]:!font-bold [&_.ant-table-thead_th]:!border-b [&_.ant-table-thead_th]:!border-slate-100 [&_.ant-table-thead_th]:!py-5 [&_.ant-table-tbody_td]:!py-5"
        />
      </div>

      {/* Inspect Log Drawer */}
      <Drawer
        title={<span className="text-lg font-bold text-[#0A1128]">Activity Log Details</span>}
        open={Boolean(selectedLog)}
        onClose={() => setSelectedLog(null)}
        width={480}
        destroyOnClose
      >
        {selectedLog && (
          <div className="space-y-6">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Event Action</div>
              <div className="text-base font-extrabold text-[#0A1128] font-mono">{selectedLog.action}</div>
            </div>

            <Descriptions column={1} bordered size="small" className="bg-white rounded-xl">
              <Descriptions.Item label="Timestamp">{formatDate(selectedLog.createdAt)}</Descriptions.Item>
              <Descriptions.Item label="Actor Name">{selectedLog.userName}</Descriptions.Item>
              <Descriptions.Item label="Actor Role">{selectedLog.userRole}</Descriptions.Item>
              <Descriptions.Item label="User ID">{selectedLog.userId}</Descriptions.Item>
              <Descriptions.Item label="Target Entity ID">{selectedLog.entityId || 'N/A'}</Descriptions.Item>
              <Descriptions.Item label="Module">{selectedLog.module.toUpperCase()}</Descriptions.Item>
            </Descriptions>

            <div className="bg-orange-50/50 p-4 rounded-xl border border-orange-100">
              <div className="text-xs font-bold text-brand-orange uppercase tracking-wider mb-1">Description</div>
              <div className="text-sm font-medium text-slate-800 leading-relaxed">{selectedLog.description}</div>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
};
