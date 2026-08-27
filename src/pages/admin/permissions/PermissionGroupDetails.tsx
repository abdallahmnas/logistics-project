import React, { useEffect, useState } from 'react';
import { Button, Input, Select, Checkbox, Card, message, Tag, Spin } from 'antd';
import { TeamOutlined, AppstoreOutlined, SafetyCertificateOutlined, HistoryOutlined, SearchOutlined, ArrowLeftOutlined, SaveOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import apiClient from '../../../api/axios';
import { formatDate } from '../../../utils/formatters';

export const PermissionGroupDetails: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [group, setGroup] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchText, setSearchText] = useState('');

  const modules = [
    { key: 'shipments', label: 'Shipments & Freight', desc: 'Manage global cargo', icon: '🚚' },
    { key: 'warehouse', label: 'Warehouse & Inventory', desc: 'Inbound scanning & batching', icon: '🏢' },
    { key: 'procurement', label: 'Procurement / Buy For Me', desc: 'Review 1688 quotes & sourcing', icon: '🛒' },
    { key: 'exchange', label: 'RMB Exchange & Payments', desc: 'Verify Naira & release RMB', icon: '🔄' },
    { key: 'delivery', label: 'Local Dispatch & Delivery', desc: 'Driver task assignment & PINs', icon: '🚛' },
    { key: 'staff', label: 'Staff Members', desc: 'Onboard & manage staff users', icon: '👥' },
    { key: 'support', label: 'Support Tickets', desc: 'Customer support helpdesk', icon: '🎧' },
    { key: 'facility', label: 'Warehouse Facilities', desc: 'Manage hub addresses & capacity', icon: '🏭' },
    { key: 'settings', label: 'System Settings', desc: 'Configure exchange rates & pricing', icon: '⚙️' },
  ];

  const columns = ['CREATE', 'READ', 'UPDATE', 'DELETE', 'APPROVE', 'REJECT'];

  const initialPermissions: Record<string, Record<string, boolean>> = {};
  modules.forEach((m) => {
    initialPermissions[m.key] = { create: false, read: false, update: false, delete: false, approve: false, reject: false };
  });

  const [permissions, setPermissions] = useState<Record<string, Record<string, boolean>>>(initialPermissions);

  const fetchGroupDetails = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const res = await apiClient.get(`/permissions/permission-groups/${id}`);
      const data = res.data.data;
      setGroup(data);

      const matrix = { ...initialPermissions };
      if (data.permissionRules && data.permissionRules.length > 0) {
        data.permissionRules.forEach((rule: any) => {
          const modKey = rule.entity.toLowerCase();
          const actKey = rule.action.toLowerCase();
          if (!matrix[modKey]) {
            matrix[modKey] = { create: false, read: false, update: false, delete: false, approve: false, reject: false };
          }
          matrix[modKey][actKey] = rule.status === 'active';
        });
      } else if (data.permissions) {
        Object.entries(data.permissions).forEach(([modKey, actions]: [string, any]) => {
          if (!matrix[modKey]) {
            matrix[modKey] = { create: false, read: false, update: false, delete: false, approve: false, reject: false };
          }
          Object.entries(actions).forEach(([actKey, val]) => {
            matrix[modKey][actKey] = Boolean(val);
          });
        });
      }

      setPermissions(matrix);
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Failed to load permission group details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroupDetails();
  }, [id]);

  const togglePermission = (mod: string, col: string) => {
    const key = col.toLowerCase();
    setPermissions((prev) => ({
      ...prev,
      [mod]: { ...prev[mod], [key]: !prev[mod]?.[key] },
    }));
  };

  const handleSaveMatrix = async () => {
    if (!id) return;
    try {
      setSaving(true);
      await apiClient.patch(`/permissions/permission-groups/${id}`, {
        permissions,
      });
      message.success('Permission Matrix rules saved successfully!');
      fetchGroupDetails();
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Failed to save permission matrix');
    } finally {
      setSaving(false);
    }
  };

  const filteredModules = modules.filter((m) =>
    m.label.toLowerCase().includes(searchText.toLowerCase()) || m.desc.toLowerCase().includes(searchText.toLowerCase())
  );

  const activeRulesCount = Object.values(permissions).reduce((acc, mod) => {
    return acc + Object.values(mod).filter(Boolean).length;
  }, 0);

  if (loading) {
    return (
      <div className="py-20 text-center">
        <Spin size="large" />
      </div>
    );
  }

  const memberCount = group?.members ? group.members.length : 0;
  const isActive = group?.status === 'active' || group?.isActive !== false;

  return (
    <div className="animate-fade-in-up max-w-[1000px] mx-auto py-8 space-y-6 pb-24">
      {/* Back Link */}
      <Button
        type="link"
        icon={<ArrowLeftOutlined />}
        className="p-0 text-slate-500 hover:text-brand-navy font-bold text-xs"
        onClick={() => navigate('/admin/permissions')}
      >
        Back to Permission Groups
      </Button>

      {/* Header Info */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-3xl font-extrabold text-[#0A1128] m-0 tracking-tight">{group?.title || group?.name}</h1>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-slate-400'}`}></span> {isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
          <p className="text-slate-500 text-sm m-0 max-w-2xl">{group?.description || 'Operational permission group'}</p>
        </div>
        <Button
          type="primary"
          icon={<SaveOutlined />}
          loading={saving}
          onClick={handleSaveMatrix}
          className="bg-[#0A1128] hover:bg-[#1a2542] border-none font-bold px-6"
        >
          Save Matrix Rules
        </Button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">MEMBERS</span>
            <TeamOutlined className="text-brand-orange text-lg" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#0A1128]">{memberCount}</span>
            <span className="text-xs text-slate-500">Assigned staff</span>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">MODULES</span>
            <AppstoreOutlined className="text-[#0A1128] text-lg" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#0A1128]">{modules.length}</span>
            <span className="text-xs text-slate-500">System modules</span>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">ACTIVE RULES</span>
            <SafetyCertificateOutlined className="text-blue-500 text-lg" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#0A1128]">{activeRulesCount}</span>
            <span className="text-xs text-slate-500">Enabled</span>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">LAST UPDATED</span>
            <HistoryOutlined className="text-slate-400 text-lg" />
          </div>
          <div>
            <div className="text-base font-bold text-[#0A1128]">{formatDate(group?.updatedAt)}</div>
            <div className="text-xs text-slate-400">System Record</div>
          </div>
        </div>
      </div>

      {/* Permission Matrix Table */}
      <Card bordered={false} className="shadow-sm border border-slate-100 rounded-xl overflow-hidden" bodyStyle={{ padding: 0 }}>
        <div className="p-4 px-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50">
          <Input
            placeholder="Search permissions..."
            prefix={<SearchOutlined className="text-slate-400" />}
            className="max-w-xs h-10 border-slate-200"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
          <div className="flex gap-2">
            <Button
              size="small"
              className="text-xs font-bold text-slate-600 bg-white border-slate-200"
              onClick={() => {
                const allOn: any = {};
                modules.forEach((m) => {
                  allOn[m.key] = { create: true, read: true, update: true, delete: true, approve: true, reject: true };
                });
                setPermissions(allOn);
              }}
            >
              Select All
            </Button>
            <Button
              size="small"
              className="text-xs font-bold text-slate-600 bg-white border-slate-200"
              onClick={() => {
                const allOff: any = {};
                modules.forEach((m) => {
                  allOff[m.key] = { create: false, read: false, update: false, delete: false, approve: false, reject: false };
                });
                setPermissions(allOff);
              }}
            >
              Clear All
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr>
                <th className="py-4 px-6 font-bold text-slate-500 text-xs tracking-wider uppercase border-b border-slate-100 bg-slate-50 sticky left-0 z-10 w-1/3">
                  MODULE
                </th>
                {columns.map((col) => (
                  <th key={col} className="py-4 px-2 text-center border-b border-slate-100 bg-slate-50 font-bold text-slate-700 text-xs tracking-wider">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredModules.map((mod) => (
                <tr key={mod.key} className="hover:bg-slate-50 transition-colors">
                  <td className="py-4 px-6 border-b border-slate-100 bg-white sticky left-0 z-10">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{mod.icon}</span>
                      <div>
                        <div className="font-bold text-[#0A1128] text-sm">{mod.label}</div>
                        <div className="text-xs text-slate-400">{mod.desc}</div>
                      </div>
                    </div>
                  </td>
                  {columns.map((col) => (
                    <td key={`${mod.key}-${col}`} className="py-4 px-2 text-center border-b border-slate-100">
                      <Checkbox
                        checked={Boolean(permissions[mod.key]?.[col.toLowerCase()])}
                        onChange={() => togglePermission(mod.key, col)}
                        className={`scale-125 ${permissions[mod.key]?.[col.toLowerCase()] ? '[&_.ant-checkbox-inner]:bg-[#0A1128] [&_.ant-checkbox-inner]:border-[#0A1128]' : ''}`}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-4 bg-slate-50 text-center text-xs text-slate-400 rounded-b-xl border-t border-slate-100">
          Click "Save Matrix Rules" above to persist changes to the database.
        </div>
      </Card>
    </div>
  );
};

export default PermissionGroupDetails;
