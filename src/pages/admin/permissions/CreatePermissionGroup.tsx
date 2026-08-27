import React, { useState } from 'react';
import { Button, Input, Switch, Checkbox, Card, message } from 'antd';
import { InfoCircleOutlined, SafetyCertificateOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../../api/axios';

const { TextArea } = Input;

export const CreatePermissionGroup: React.FC = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const modules = [
    { key: 'shipments', label: 'Shipments & Freight', icon: <span className="mr-2">🚚</span> },
    { key: 'warehouse', label: 'Warehouse & Inventory', icon: <span className="mr-2">🏢</span> },
    { key: 'procurement', label: 'Procurement / Buy For Me', icon: <span className="mr-2">🛒</span> },
    { key: 'exchange', label: 'RMB Exchange & Payments', icon: <span className="mr-2">🔄</span> },
    { key: 'delivery', label: 'Local Dispatch & Delivery', icon: <span className="mr-2">🚛</span> },
    { key: 'staff', label: 'Staff & User Access', icon: <span className="mr-2">👥</span> },
    { key: 'support', label: 'Support Tickets & Helpdesk', icon: <span className="mr-2">🎧</span> },
    { key: 'facility', label: 'Warehouse Facilities', icon: <span className="mr-2">🏭</span> },
    { key: 'settings', label: 'System Settings & Rates', icon: <span className="mr-2">⚙️</span> },
  ];

  const columns = ['Create', 'Read', 'Update', 'Delete', 'Approve', 'Reject'];

  const initialPermissions: Record<string, Record<string, boolean>> = {};
  modules.forEach((m) => {
    initialPermissions[m.key] = {
      create: false,
      read: false,
      update: false,
      delete: false,
      approve: false,
      reject: false,
    };
  });

  const [permissions, setPermissions] = useState<Record<string, Record<string, boolean>>>(initialPermissions);

  const togglePermission = (mod: string, col: string) => {
    const key = col.toLowerCase();
    setPermissions((prev) => ({
      ...prev,
      [mod]: { ...prev[mod], [key]: !prev[mod]?.[key] },
    }));
  };

  const selectRow = (mod: string) => {
    const isAllSelected = columns.every((c) => permissions[mod]?.[c.toLowerCase()]);
    setPermissions((prev) => ({
      ...prev,
      [mod]: columns.reduce((acc, c) => ({ ...acc, [c.toLowerCase()]: !isAllSelected }), {}),
    }));
  };

  const selectCol = (col: string) => {
    const key = col.toLowerCase();
    const isAllSelected = modules.every((m) => permissions[m.key]?.[key]);
    const newState = { ...permissions };
    modules.forEach((m) => {
      newState[m.key] = { ...newState[m.key], [key]: !isAllSelected };
    });
    setPermissions(newState);
  };

  const handleCreate = async () => {
    if (!name.trim()) {
      message.error('Please enter a permission group name');
      return;
    }

    try {
      setSubmitting(true);
      await apiClient.post('/permissions/permission-groups', {
        title: name.trim(),
        name: name.trim(),
        description: description.trim(),
        status: isActive ? 'active' : 'inactive',
        permissions,
      });

      message.success('Permission Group created successfully!');
      navigate('/admin/permissions');
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Failed to create permission group');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="animate-fade-in-up max-w-[950px] mx-auto py-8 pb-24 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#0A1128] m-0 mb-1">Create Permission Group</h1>
        <p className="text-slate-500 text-sm m-0">
          Define custom staff role capabilities and access permissions across platform modules.
        </p>
      </div>

      {/* Group Information */}
      <Card bordered={false} className="shadow-sm border border-slate-100 rounded-xl overflow-hidden" bodyStyle={{ padding: 0 }}>
        <div className="border-l-4 border-brand-orange p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-base font-bold text-[#0A1128] m-0 mb-1 flex items-center gap-2">
                <InfoCircleOutlined className="text-slate-400" /> Group Details
              </h2>
              <p className="text-slate-500 text-xs m-0">Basic details identifying this staff permission group.</p>
            </div>
            <div className="text-5xl text-slate-100 opacity-50">
              <SafetyCertificateOutlined />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Group Title / Name <span className="text-brand-orange">*</span>
                </label>
                <Input
                  size="large"
                  placeholder="e.g., Regional Logistics Manager"
                  className="bg-slate-50 border-slate-200 focus:bg-white"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="flex items-center justify-between pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Status</label>
                  <p className="text-xs text-slate-500 m-0">Active groups can be assigned to staff members immediately.</p>
                </div>
                <Switch checked={isActive} onChange={setIsActive} className={isActive ? 'bg-brand-orange' : 'bg-slate-300'} />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Description</label>
              <TextArea
                rows={4}
                placeholder="Describe operational responsibilities and scope..."
                className="bg-slate-50 border-slate-200 focus:bg-white resize-none"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Permissions Matrix */}
      <Card bordered={false} className="shadow-sm border border-slate-100 rounded-xl" bodyStyle={{ padding: 0 }}>
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-base font-bold text-[#0A1128] m-0 mb-1 flex items-center gap-2">
            <SafetyCertificateOutlined className="text-slate-900" /> Operational Permission Matrix
          </h2>
          <p className="text-slate-500 text-xs m-0">Select specific actions authorized for this permission group.</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr>
                <th className="py-4 px-6 font-bold text-slate-700 text-xs tracking-wider uppercase border-b border-slate-100 bg-slate-50 sticky left-0 z-10 w-1/3">
                  Module
                </th>
                {columns.map((col) => (
                  <th key={col} className="py-4 px-2 text-center border-b border-slate-100 bg-slate-50">
                    <div className="font-bold text-slate-700 text-xs uppercase mb-1">{col}</div>
                    <button
                      type="button"
                      className="text-[10px] font-bold text-brand-orange hover:underline uppercase tracking-wider bg-transparent border-none cursor-pointer"
                      onClick={() => selectCol(col)}
                    >
                      Toggle All
                    </button>
                  </th>
                ))}
                <th className="py-4 px-6 text-center border-b border-slate-100 bg-slate-50">
                  <div className="font-bold text-slate-700 text-xs uppercase mb-1">Row</div>
                </th>
              </tr>
            </thead>
            <tbody>
              {modules.map((mod) => (
                <tr key={mod.key} className="hover:bg-slate-50 transition-colors">
                  <td className="py-4 px-6 border-b border-slate-100 font-bold text-[#0A1128] text-sm bg-white sticky left-0 z-10">
                    {mod.icon} {mod.label}
                  </td>
                  {columns.map((col) => (
                    <td key={`${mod.key}-${col}`} className="py-4 px-2 text-center border-b border-slate-100">
                      <Checkbox
                        checked={permissions[mod.key]?.[col.toLowerCase()]}
                        onChange={() => togglePermission(mod.key, col)}
                        className="scale-125 [&_.ant-checkbox-checked_.ant-checkbox-inner]:bg-brand-orange [&_.ant-checkbox-checked_.ant-checkbox-inner]:border-brand-orange"
                      />
                    </td>
                  ))}
                  <td className="py-4 px-6 text-center border-b border-slate-100">
                    <button
                      type="button"
                      className="text-[10px] font-bold text-slate-500 hover:text-[#0A1128] uppercase tracking-wider bg-transparent border-none cursor-pointer whitespace-nowrap"
                      onClick={() => selectRow(mod.key)}
                    >
                      SELECT ALL
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Footer Actions */}
      <div className="fixed bottom-0 left-0 lg:left-64 right-0 bg-white border-t border-slate-200 p-4 px-8 flex justify-between items-center z-20 shadow-lg">
        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-orange animate-pulse"></span>
          NEW PERMISSION GROUP CREATION
        </div>
        <div className="flex gap-3">
          <Button size="large" className="border-slate-200 text-slate-600 font-bold px-6" onClick={() => navigate('/admin/permissions')}>
            Cancel
          </Button>
          <Button
            type="primary"
            size="large"
            loading={submitting}
            className="bg-[#0A1128] hover:bg-[#1a2542] border-none font-bold shadow-md px-6 flex items-center gap-2"
            onClick={handleCreate}
          >
            Save Permission Group <ArrowRightOutlined />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CreatePermissionGroup;
