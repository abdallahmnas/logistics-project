import React, { useState } from 'react';
import { Button, Input, Switch, Checkbox, Card } from 'antd';
import { InfoCircleOutlined, SafetyCertificateOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { TextArea } = Input;

export const CreatePermissionGroup: React.FC = () => {
  const navigate = useNavigate();
  const [isActive, setIsActive] = useState(true);
  const [permissions, setPermissions] = useState<Record<string, Record<string, boolean>>>({
    users: { create: false, read: false, update: false, delete: false, approve: false, reject: false },
    exchange: { create: false, read: false, update: false, delete: false, approve: false, reject: false },
  });

  const modules = [
    { key: 'users', label: 'Users', icon: <span className="text-slate-400 font-bold mr-2">👥</span> },
    { key: 'exchange', label: 'Exchange', icon: <span className="text-slate-400 font-bold mr-2">🔄</span> },
  ];

  const columns = ['Create', 'Read', 'Update', 'Delete', 'Approve', 'Reject'];

  const togglePermission = (mod: string, col: string) => {
    setPermissions(prev => ({
      ...prev,
      [mod]: { ...prev[mod], [col.toLowerCase()]: !prev[mod][col.toLowerCase()] }
    }));
  };

  const selectRow = (mod: string) => {
    const isAllSelected = columns.every(c => permissions[mod][c.toLowerCase()]);
    setPermissions(prev => ({
      ...prev,
      [mod]: columns.reduce((acc, c) => ({ ...acc, [c.toLowerCase()]: !isAllSelected }), {})
    }));
  };

  const selectCol = (col: string) => {
    const isAllSelected = modules.every(m => permissions[m.key][col.toLowerCase()]);
    const newState = { ...permissions };
    modules.forEach(m => {
      newState[m.key] = { ...newState[m.key], [col.toLowerCase()]: !isAllSelected };
    });
    setPermissions(newState);
  };

  return (
    <div className="animate-fade-in-up max-w-[900px] mx-auto py-8 pb-24">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#0A1128] m-0 mb-1">Create Permission Group</h1>
        <p className="text-slate-500 text-sm m-0">
          Define custom roles and access levels by creating a new permission group. Carefully assign capabilities across modules to ensure secure operations.
        </p>
      </div>

      {/* Group Information */}
      <Card 
        bordered={false} 
        className="shadow-sm border border-slate-100 rounded-xl mb-6 overflow-hidden"
        bodyStyle={{ padding: 0 }}
      >
        <div className="border-l-4 border-brand-orange">
          <div className="p-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-base font-bold text-[#0A1128] m-0 mb-1 flex items-center gap-2">
                  <InfoCircleOutlined className="text-slate-400" /> Group Information
                </h2>
                <p className="text-slate-500 text-xs m-0">Basic details identifying this group.</p>
              </div>
              <div className="text-6xl text-slate-100 opacity-50 absolute right-8 top-4">
                <SafetyCertificateOutlined />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Name <span className="text-brand-orange">*</span></label>
                  <Input 
                    size="large" 
                    placeholder="e.g., Regional Managers" 
                    className="bg-slate-50 border-transparent hover:border-slate-300 focus:border-brand-orange focus:bg-white"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Status</label>
                    <p className="text-xs text-slate-500 m-0">Active groups can be assigned immediately.</p>
                  </div>
                  <Switch 
                    checked={isActive} 
                    onChange={setIsActive} 
                    className={isActive ? 'bg-brand-orange' : 'bg-slate-300'}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Description</label>
                <TextArea 
                  rows={4} 
                  placeholder="Briefly describe the responsibilities..." 
                  className="bg-slate-50 border-transparent hover:border-slate-300 focus:border-brand-orange focus:bg-white resize-none"
                />
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Permissions Matrix */}
      <Card 
        bordered={false} 
        className="shadow-sm border border-slate-100 rounded-xl"
        bodyStyle={{ padding: 0 }}
      >
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-base font-bold text-[#0A1128] m-0 mb-1 flex items-center gap-2">
            <SafetyCertificateOutlined className="text-slate-900" /> Permissions Matrix
          </h2>
          <p className="text-slate-500 text-xs m-0">Select the specific actions this group can perform across system modules.</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr>
                <th className="py-4 px-6 font-bold text-slate-700 text-sm border-b border-slate-100 bg-white sticky left-0 z-10 w-1/3">Module</th>
                {columns.map(col => (
                  <th key={col} className="py-4 px-2 text-center border-b border-slate-100">
                    <div className="font-bold text-slate-700 text-sm mb-1">{col}</div>
                    <button 
                      className="text-[10px] font-bold text-brand-orange hover:text-[#e05a10] uppercase tracking-wider bg-transparent border-none cursor-pointer"
                      onClick={() => selectCol(col)}
                    >
                      All
                    </button>
                  </th>
                ))}
                <th className="py-4 px-6 text-center border-b border-slate-100">
                  <div className="font-bold text-slate-700 text-sm mb-1">Row</div>
                </th>
              </tr>
            </thead>
            <tbody>
              {modules.map(mod => (
                <tr key={mod.key} className="hover:bg-slate-50 transition-colors">
                  <td className="py-5 px-6 border-b border-slate-100 font-bold text-[#0A1128] text-sm bg-white sticky left-0 z-10">
                    {mod.icon} {mod.label}
                  </td>
                  {columns.map(col => (
                    <td key={`${mod.key}-${col}`} className="py-5 px-2 text-center border-b border-slate-100">
                      <Checkbox 
                        checked={permissions[mod.key][col.toLowerCase()]} 
                        onChange={() => togglePermission(mod.key, col)}
                        className="scale-125 [&_.ant-checkbox-checked_.ant-checkbox-inner]:bg-brand-orange [&_.ant-checkbox-checked_.ant-checkbox-inner]:border-brand-orange"
                      />
                    </td>
                  ))}
                  <td className="py-5 px-6 text-center border-b border-slate-100">
                    <button 
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

      {/* Footer Bar */}
      <div className="fixed bottom-0 left-0 lg:left-[264px] right-0 bg-white border-t border-slate-200 p-4 px-8 flex justify-between items-center z-20 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] transition-all">
        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-orange animate-pulse"></span>
          UNSAVED CHANGES
        </div>
        <div className="flex gap-3">
          <Button 
            size="large" 
            className="border-slate-200 text-slate-600 font-bold px-6"
            onClick={() => navigate('/admin/permissions')}
          >
            Cancel
          </Button>
          <Button 
            type="primary" 
            size="large" 
            className="bg-[#0A1128] hover:bg-[#1a2542] border-none font-bold shadow-md px-6 flex items-center gap-2"
            onClick={() => navigate('/admin/permissions')}
          >
            Create Permission Group <ArrowRightOutlined />
          </Button>
        </div>
      </div>
    </div>
  );
};
