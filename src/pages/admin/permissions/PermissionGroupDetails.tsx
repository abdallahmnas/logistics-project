import React, { useState } from 'react';
import { Button, Input, Select, Checkbox, Card } from 'antd';
import { TeamOutlined, AppstoreOutlined, SafetyCertificateOutlined, HistoryOutlined, SearchOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

export const PermissionGroupDetails: React.FC = () => {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState('');

  const modules = [
    { key: 'shipments', label: 'Shipments', desc: 'Manage global freight', icon: <span className="text-slate-400 font-bold mr-2 text-lg">🚚</span> },
    { key: 'warehouse', label: 'Warehouse', desc: 'Inventory control', icon: <span className="text-slate-400 font-bold mr-2 text-lg">🏢</span> },
    { key: 'financials', label: 'Financials', desc: 'Invoices & billing', icon: <span className="text-slate-400 font-bold mr-2 text-lg">💸</span> },
    { key: 'staff', label: 'Staff Members', desc: 'User management', icon: <span className="text-slate-400 font-bold mr-2 text-lg">👥</span> },
  ];

  // Based on the Operations Manager mockup
  const [permissions, setPermissions] = useState<Record<string, Record<string, boolean>>>({
    shipments: { create: true, read: true, update: true, delete: false, approve: true, reject: true },
    warehouse: { create: true, read: true, update: true, delete: false, approve: false, reject: false },
    financials: { create: false, read: true, update: false, delete: false, approve: false, reject: false },
    staff: { create: false, read: true, update: false, delete: false, approve: false, reject: false },
  });

  const columns = ['CREATE', 'READ', 'UPDATE', 'DELETE', 'APPROVE', 'REJECT'];

  return (
    <div className="animate-fade-in-up max-w-[1000px] mx-auto py-8">
      {/* Header Info */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-4xl font-extrabold text-[#0A1128] m-0 tracking-tight">Operations Manager</h1>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-bold uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span> Active
            </span>
          </div>
          <p className="text-slate-500 text-sm m-0 max-w-2xl leading-relaxed">
            Manage operational activities across the platform. This group grants comprehensive access to warehouse management, shipment routing, and staff coordination.
          </p>
        </div>
        <div className="flex gap-3">
          <Button 
            className="border-brand-orange text-brand-orange font-bold hover:bg-orange-50 px-6"
          >
            Edit Group
          </Button>
          <Button 
            className="bg-red-50 text-red-500 border-none hover:bg-red-100 font-bold px-6"
          >
            Deactivate
          </Button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">MEMBERS</span>
            <TeamOutlined className="text-brand-orange text-lg" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#0A1128]">8</span>
            <span className="text-xs text-slate-500">Active users</span>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">MODULES</span>
            <AppstoreOutlined className="text-[#0A1128] text-lg" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#0A1128]">8</span>
            <span className="text-xs text-slate-500">Accessible</span>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">PERMISSIONS</span>
            <SafetyCertificateOutlined className="text-blue-500 text-lg" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#0A1128]">18</span>
            <span className="text-xs text-slate-500">Enabled</span>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">LAST UPDATED</span>
            <HistoryOutlined className="text-slate-400 text-lg" />
          </div>
          <div>
            <div className="text-lg font-bold text-[#0A1128]">Aug 8, 2026</div>
            <div className="text-xs text-slate-500">by Admin System</div>
          </div>
        </div>
      </div>

      {/* Permission Matrix */}
      <Card 
        bordered={false} 
        className="shadow-sm border border-slate-100 rounded-xl"
        bodyStyle={{ padding: 0 }}
      >
        <div className="p-4 px-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50 rounded-t-xl">
          <Input
            placeholder="Search permissions..."
            prefix={<SearchOutlined className="text-slate-400" />}
            className="max-w-xs h-10 border-white hover:border-slate-300"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Show:</span>
            <Select
              defaultValue="all"
              className="w-40"
              options={[
                { value: 'all', label: 'All Modules' },
                { value: 'enabled', label: 'Enabled Only' },
              ]}
            />
          </div>
        </div>

        <div className="p-6 pb-0 flex justify-between items-end border-b border-slate-100">
          <h2 className="text-xl font-bold text-[#0A1128] m-0 mb-4">Permission Matrix</h2>
          <div className="flex gap-2 mb-4">
            <Button size="small" className="text-xs font-bold text-slate-600 bg-slate-100 border-none">Select All</Button>
            <Button size="small" className="text-xs font-bold text-slate-600 bg-slate-100 border-none">Clear All</Button>
            <Button size="small" className="text-xs font-bold text-brand-orange bg-orange-50 border-none">All Read</Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr>
                <th className="py-4 px-6 font-bold text-slate-500 text-xs tracking-wider uppercase border-b border-slate-100 bg-slate-50 sticky left-0 z-10 w-1/3">
                  MODULE
                </th>
                {columns.map(col => (
                  <th key={col} className="py-4 px-2 text-center border-b border-slate-100 bg-slate-50 font-bold text-slate-700 text-xs tracking-wider">
                    {col} {col === 'UPDATE' || col === 'DELETE' ? <InfoCircleOutlined className="text-slate-400 text-[10px] text-red-500" style={{color: col === 'DELETE' ? '#ef4444' : undefined}} /> : null}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {modules.map(mod => (
                <tr key={mod.key} className="hover:bg-slate-50 transition-colors">
                  <td className="py-4 px-6 border-b border-slate-100 bg-white sticky left-0 z-10">
                    <div className="flex items-center gap-1">
                      {mod.icon}
                      <div>
                        <div className="font-bold text-[#0A1128] text-sm">{mod.label}</div>
                        <div className="text-xs text-slate-500">{mod.desc}</div>
                      </div>
                    </div>
                  </td>
                  {columns.map(col => (
                    <td key={`${mod.key}-${col}`} className="py-4 px-2 text-center border-b border-slate-100">
                      <Checkbox 
                        checked={permissions[mod.key][col.toLowerCase()]}
                        className={`scale-110 ${permissions[mod.key][col.toLowerCase()] ? '[&_.ant-checkbox-inner]:bg-[#0A1128] [&_.ant-checkbox-inner]:border-[#0A1128]' : ''}`}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-4 bg-slate-50 text-center text-xs text-slate-400 rounded-b-xl border-t border-slate-100">
          Changes are auto-saved for review. Click Save below to apply.
        </div>
      </Card>
    </div>
  );
};
