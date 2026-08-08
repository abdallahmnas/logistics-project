import React, { useState } from 'react';
import { Button, Input, Select, Switch, Card, Radio } from 'antd';
import { IdcardOutlined, SafetyCertificateOutlined, EyeOutlined, SyncOutlined, ExportOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

export const AddStaffMember: React.FC = () => {
  const navigate = useNavigate();
  const [sendInvite, setSendInvite] = useState(false);
  const [role, setRole] = useState('ops');

  const roles = [
    { key: 'ops', title: 'Operations Manager', desc: 'Full access to shipments, warehouse management, and staf...' },
    { key: 'logistics', title: 'Logistics Coordinator', desc: 'Manage routing, view shipments, and update tracking statuses.' },
    { key: 'finance', title: 'Finance Admin', desc: 'Access to billing, invoices, and financial reporting. Read-only...' },
    { key: 'admin', title: 'Super Admin', desc: 'Unrestricted access to all system...' },
  ];

  return (
    <div className="animate-fade-in-up max-w-[1100px] mx-auto py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-[#0A1128] m-0 mb-2 tracking-tight">Add Staff Member</h1>
          <p className="text-slate-600 text-base m-0 max-w-2xl leading-relaxed">
            Onboard a new team member and assign their system permissions. Invite will be sent via email.
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            size="large"
            icon={<span className="text-lg leading-none">▷</span>}
            className="border-slate-200 text-slate-600 font-bold bg-white"
          />
          <Button
            size="large"
            icon={<ExportOutlined />}
            className="border-slate-200 text-slate-600 font-bold bg-white"
          >
            Export
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Forms */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Personal Information */}
          <Card 
            bordered={false} 
            className="shadow-sm border border-slate-100 rounded-xl bg-slate-50"
            bodyStyle={{ padding: '24px' }}
          >
            <div className="flex items-start gap-4 mb-6">
              <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-600">
                <IdcardOutlined className="text-xl" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-[#0A1128] m-0 mb-1">Personal Information</h2>
                <p className="text-slate-500 text-xs m-0 font-medium">Core details for the employee profile.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-[#0A1128] mb-2">Full Name</label>
                <Input 
                  size="large" 
                  placeholder="e.g. Jane Doe" 
                  className="bg-white border-transparent hover:border-slate-300 focus:border-brand-orange h-12 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-[#0A1128] mb-2">Professional Email</label>
                <Input 
                  size="large" 
                  placeholder="jane.doe@logicore.com" 
                  className="bg-white border-transparent hover:border-slate-300 focus:border-brand-orange h-12 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-[#0A1128] mb-2">Phone Number (Optional)</label>
                <Input 
                  size="large" 
                  placeholder="+1 (555) 000-0000" 
                  className="bg-white border-transparent hover:border-slate-300 focus:border-brand-orange h-12 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-[#0A1128] mb-2">Department</label>
                <Select 
                  size="large" 
                  placeholder="Select Department"
                  className="w-full [&_.ant-select-selector]:!bg-white [&_.ant-select-selector]:!border-transparent [&_.ant-select-selector]:hover:!border-slate-300 [&_.ant-select-selector]:!h-12 [&_.ant-select-selection-item]:!leading-[46px] [&_.ant-select-selector]:!rounded-lg"
                  options={[]}
                />
              </div>
            </div>
          </Card>

          {/* Account Security */}
          <Card 
            bordered={false} 
            className="shadow-sm border border-slate-100 rounded-xl bg-slate-50"
            bodyStyle={{ padding: '24px' }}
          >
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-[#0A1128]">
                  <SafetyCertificateOutlined className="text-xl" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[#0A1128] m-0 mb-1">Account Security</h2>
                  <p className="text-slate-500 text-xs m-0 font-medium">Authentication method setup.</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-[#0A1128]">Send Invite Email</span>
                <Switch checked={sendInvite} onChange={setSendInvite} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-400 mb-2">Temporary Password</label>
              <div className="flex">
                <Input.Password 
                  size="large" 
                  value="••••••••" 
                  disabled
                  iconRender={(visible) => (visible ? <EyeOutlined /> : <EyeOutlined />)}
                  className="bg-white border-transparent h-12 rounded-l-lg rounded-r-none w-full max-w-sm disabled:bg-white disabled:text-slate-400"
                />
                <Button 
                  size="large" 
                  icon={<SyncOutlined />} 
                  className="h-12 rounded-l-none rounded-r-lg border-transparent border-l-slate-100 bg-white text-slate-500"
                >
                  Generate
                </Button>
              </div>
              <p className="text-xs text-slate-400 mt-3 m-0">
                Manual password setup is disabled while 'Send Invite Email' is active.
              </p>
            </div>
          </Card>

        </div>

        {/* Right Column - Role Assignment */}
        <div className="lg:col-span-1">
          <Card 
            bordered={false} 
            className="shadow-xl border-none rounded-xl bg-[#0A1128] text-white overflow-hidden"
            bodyStyle={{ padding: 0 }}
          >
            <div className="p-6">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-blue-300 border border-white/10">
                  <SafetyCertificateOutlined className="text-xl" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white m-0 mb-1">Role Assignment</h2>
                  <p className="text-blue-200 text-xs m-0 font-medium">Access level and permissions.</p>
                </div>
              </div>

              <Input
                placeholder="Search roles..."
                className="bg-white/5 border-transparent text-white placeholder-blue-300/50 hover:bg-white/10 focus:bg-white/10 focus:border-blue-400 h-12 rounded-lg mb-6"
              />

              <Radio.Group 
                value={role} 
                onChange={(e) => setRole(e.target.value)}
                className="w-full space-y-3"
              >
                {roles.map(r => (
                  <div 
                    key={r.key}
                    onClick={() => setRole(r.key)}
                    className={`p-4 rounded-lg cursor-pointer transition-all border-l-4 ${
                      role === r.key 
                        ? 'bg-white/10 border-brand-orange' 
                        : 'bg-transparent border-transparent hover:bg-white/5'
                    }`}
                  >
                    <div className={`text-sm font-bold mb-1 ${role === r.key ? 'text-white' : 'text-blue-200'}`}>
                      {r.title}
                    </div>
                    <div className="text-[10px] text-blue-300/70 leading-relaxed">
                      {r.desc}
                    </div>
                  </div>
                ))}
              </Radio.Group>
            </div>

            <div className="p-4 px-6 border-t border-white/10 flex justify-between items-center text-[10px] font-mono text-blue-400/50">
              <span>SYS_ACCESS_LVL</span>
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400/50"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400/50"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400/50"></div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
