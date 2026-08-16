import React, { useState } from 'react';
import { Button, Input, Select, Switch, Card, Radio, Form, message } from 'antd';
import { IdcardOutlined, SafetyCertificateOutlined, EyeOutlined, SyncOutlined, ArrowLeftOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../../store/hooks';
import { createStaffMember } from '../../../store/slices/adminSlice';

export const AddStaffMember: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [form] = Form.useForm();
  const [sendInvite, setSendInvite] = useState(true);
  const [role, setRole] = useState('admin');
  const [tempPassword, setTempPassword] = useState('Logistics2026!');
  const [submitting, setSubmitting] = useState(false);

  const roles = [
    { key: 'super_admin', title: 'Super Admin', desc: 'Unrestricted full access to all system modules, finances, and role delegations.' },
    { key: 'admin', title: 'Admin / Operations', desc: 'General operational access to shipments, procurement, and warehouse dispatch.' },
    { key: 'warehouse_cn', title: 'Warehouse Manager (China)', desc: 'Scan inbound packages, record weight/CBM, and build master shipping batches.' },
    { key: 'warehouse_ng', title: 'Warehouse Manager (Nigeria)', desc: 'Receive overseas batches, customs clearance, and local pickup dispatch.' },
    { key: 'procurement', title: 'Procurement Specialist', desc: 'Review "Buy For Me" requests, communicate with suppliers, and issue quotes.' },
    { key: 'finance', title: 'Finance Manager', desc: 'Verify exchange rate requests, wallet top-ups, and process financial transfers.' },
    { key: 'driver', title: 'Logistics Driver', desc: 'Receive local delivery dispatch tasks and verify customer pickup PINs.' },
  ];

  const handleGeneratePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%';
    let newPass = 'HZ-';
    for (let i = 0; i < 8; i++) {
      newPass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setTempPassword(newPass);
    message.info('New temporary password generated');
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);
      await dispatch(
        createStaffMember({
          firstName: values.firstName,
          lastName: values.lastName,
          email: values.email,
          phone: values.phone,
          role,
          password: sendInvite ? tempPassword : values.customPassword || tempPassword,
        })
      ).unwrap();

      message.success(`Staff member ${values.firstName} ${values.lastName} onboarded successfully!`);
      navigate('/admin/staff');
    } catch (err: any) {
      if (err?.errorFields) return;
      message.error(err?.message || 'Failed to onboard staff member');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="animate-fade-in-up max-w-[1100px] mx-auto py-8">
      {/* Back & Header */}
      <div className="mb-6">
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/admin/staff')}
          className="text-slate-500 hover:text-brand-navy font-bold p-0 mb-3"
        >
          Back to Staff Members
        </Button>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-[#0A1128] m-0 mb-1 tracking-tight">Onboard Staff Member</h1>
            <p className="text-slate-600 text-sm m-0 max-w-2xl">
              Create a new team account and assign their operational access level.
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              size="large"
              onClick={() => navigate('/admin/staff')}
              className="border-slate-200 text-slate-600 font-bold bg-white rounded-xl"
            >
              Cancel
            </Button>
            <Button
              type="primary"
              size="large"
              loading={submitting}
              icon={<CheckCircleOutlined />}
              onClick={handleSubmit}
              className="bg-brand-orange hover:bg-[#E86E21] border-none font-bold shadow-md rounded-xl h-12 text-base px-6"
            >
              Onboard Staff →
            </Button>
          </div>
        </div>
      </div>

      <Form form={form} layout="vertical" requiredMark={false}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Forms */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Personal Information */}
            <Card 
              variant="borderless" 
              className="shadow-sm border border-slate-100 rounded-2xl bg-white"
              bodyStyle={{ padding: '28px' }}
            >
              <div className="flex items-start gap-4 mb-6">
                <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-brand-orange">
                  <IdcardOutlined className="text-xl" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[#0A1128] m-0 mb-0.5">Personal Information</h2>
                  <p className="text-slate-500 text-xs m-0 font-medium">Employee identity and contact profile.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                <Form.Item name="firstName" label={<span className="text-slate-700 font-bold text-xs uppercase tracking-wider">First Name</span>} rules={[{ required: true, message: 'First name is required' }]}>
                  <Input 
                    size="large" 
                    placeholder="e.g. Jane" 
                    className="bg-slate-50 border-slate-200 hover:border-slate-300 focus:border-brand-orange h-12 rounded-xl"
                  />
                </Form.Item>

                <Form.Item name="lastName" label={<span className="text-slate-700 font-bold text-xs uppercase tracking-wider">Last Name</span>} rules={[{ required: true, message: 'Last name is required' }]}>
                  <Input 
                    size="large" 
                    placeholder="e.g. Doe" 
                    className="bg-slate-50 border-slate-200 hover:border-slate-300 focus:border-brand-orange h-12 rounded-xl"
                  />
                </Form.Item>

                <Form.Item name="email" label={<span className="text-slate-700 font-bold text-xs uppercase tracking-wider">Professional Email</span>} rules={[{ required: true, type: 'email', message: 'Valid email required' }]}>
                  <Input 
                    size="large" 
                    placeholder="jane.doe@logicore.com" 
                    className="bg-slate-50 border-slate-200 hover:border-slate-300 focus:border-brand-orange h-12 rounded-xl"
                  />
                </Form.Item>

                <Form.Item name="phone" label={<span className="text-slate-700 font-bold text-xs uppercase tracking-wider">Phone Number</span>} rules={[{ required: true, message: 'Phone number is required' }]}>
                  <Input 
                    size="large" 
                    placeholder="+234 801 234 5678" 
                    className="bg-slate-50 border-slate-200 hover:border-slate-300 focus:border-brand-orange h-12 rounded-xl"
                  />
                </Form.Item>
              </div>
            </Card>

            {/* Account Security */}
            <Card 
              variant="borderless" 
              className="shadow-sm border border-slate-100 rounded-2xl bg-white"
              bodyStyle={{ padding: '28px' }}
            >
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                    <SafetyCertificateOutlined className="text-xl" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-[#0A1128] m-0 mb-0.5">Account Credentials & Security</h2>
                    <p className="text-slate-500 text-xs m-0 font-medium">Initial authentication credentials for employee login.</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-[#0A1128]">Auto-Generate Credentials</span>
                  <Switch checked={sendInvite} onChange={setSendInvite} />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Temporary Password</label>
                <div className="flex gap-2">
                  <Input.Password 
                    size="large" 
                    value={tempPassword} 
                    onChange={(e) => setTempPassword(e.target.value)}
                    className="bg-slate-50 border-slate-200 h-12 rounded-xl flex-1 font-mono"
                  />
                  <Button 
                    size="large" 
                    icon={<SyncOutlined />} 
                    onClick={handleGeneratePassword}
                    className="h-12 rounded-xl border-slate-200 bg-slate-100 text-slate-700 font-bold"
                  >
                    Generate
                  </Button>
                </div>
                <p className="text-xs text-slate-400 mt-2 m-0">
                  Staff member can log in using their email and this password immediately upon onboarding.
                </p>
              </div>
            </Card>

          </div>

          {/* Right Column - Role Assignment */}
          <div className="lg:col-span-1">
            <Card 
              variant="borderless" 
              className="shadow-xl border-none rounded-2xl bg-[#0A1128] text-white overflow-hidden sticky top-24"
              bodyStyle={{ padding: 0 }}
            >
              <div className="p-6">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-blue-300 border border-white/10">
                    <SafetyCertificateOutlined className="text-xl" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white m-0 mb-0.5">Role Assignment</h2>
                    <p className="text-blue-200 text-xs m-0 font-medium">Access level and system authorization.</p>
                  </div>
                </div>

                <Radio.Group 
                  value={role} 
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full space-y-3"
                >
                  {roles.map(r => (
                    <div 
                      key={r.key}
                      onClick={() => setRole(r.key)}
                      className={`p-4 rounded-xl cursor-pointer transition-all border-l-4 ${
                        role === r.key 
                          ? 'bg-white/10 border-brand-orange shadow-md' 
                          : 'bg-transparent border-transparent hover:bg-white/5'
                      }`}
                    >
                      <div className={`text-sm font-bold mb-1 flex items-center justify-between ${role === r.key ? 'text-white' : 'text-blue-200'}`}>
                        <span>{r.title}</span>
                        <Radio value={r.key} className="m-0" />
                      </div>
                      <div className="text-[11px] text-blue-300/80 leading-relaxed">
                        {r.desc}
                      </div>
                    </div>
                  ))}
                </Radio.Group>
              </div>

              <div className="p-4 px-6 border-t border-white/10 flex justify-between items-center text-[10px] font-mono text-blue-400/50 bg-white/5">
                <span>RBAC_AUTHORIZATION</span>
                <div className="flex gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                  <div className="w-2 h-2 rounded-full bg-brand-orange"></div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </Form>
    </div>
  );
};
