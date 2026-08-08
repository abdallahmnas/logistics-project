import React, { useState } from 'react';
import { Form, Input, Button } from 'antd';
import { LockOutlined, ArrowRightOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

export const SetPasswordPage: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');

  const onFinish = (values: any) => {
    // In a real app, dispatch an action to set the password and complete registration
    console.log('Password set:', values);
    navigate('/dashboard');
  };

  const requirements = [
    { label: 'At least 8 characters', met: password.length >= 8 },
    { label: 'One uppercase letter', met: /[A-Z]/.test(password) },
    { label: 'One number', met: /[0-9]/.test(password) },
    { label: 'One special character', met: /[^A-Za-z0-9]/.test(password) },
  ];

  const allRequirementsMet = requirements.every(r => r.met);

  return (
    <div className="min-h-[calc(100vh-64px)] flex">
      {/* Left Panel - Visual */}
      <div className="hidden lg:flex lg:w-[45%] relative overflow-hidden bg-brand-navy flex-col justify-between p-12">
        <div
          className="absolute inset-0 opacity-20 mix-blend-overlay"
          style={{
            backgroundImage: "url('https://www.transparenttextures.com/patterns/cubes.png')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-navy via-brand-navy/60 to-transparent z-0" />

        <div className="relative z-10 w-full mb-20 mt-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 border border-white/20 rounded-full text-white text-xs font-bold tracking-wider mb-10 bg-white/5 backdrop-blur-sm">
            <SafetyCertificateOutlined className="text-brand-orange" />
            Enterprise Security
          </div>

          <h2 className="text-5xl xl:text-6xl font-extrabold text-white leading-tight mb-6">
            Secure your<br/>Global Account
          </h2>

          <p className="text-slate-300 text-lg leading-relaxed max-w-sm mt-6 font-medium">
            Industry-grade encryption protects your logistics data. Setting a strong password is your first line of defense.
          </p>
        </div>

        <div className="relative z-10 h-64 rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&q=80')" }} />
          <div className="absolute inset-0 bg-brand-navy/30 mix-blend-multiply" />
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 py-12 px-4 sm:px-8 lg:px-16">
        <div className="w-full max-w-[460px] bg-white p-10 rounded-2xl shadow-xl shadow-slate-200/50">
          
          {/* Step Indicator */}
          <div className="flex items-center gap-0 mb-12 w-full max-w-[300px] mx-auto">
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-brand-orange text-white flex items-center justify-center text-sm font-bold shadow-md shadow-brand-orange/20">
                ✓
              </div>
              <span className="text-[10px] text-brand-orange font-bold mt-2 tracking-wider uppercase">Profile</span>
            </div>
            <div className="flex-1 h-[2px] bg-brand-orange mx-2 mt-[-18px]" />
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-brand-orange text-white flex items-center justify-center text-sm font-bold shadow-md shadow-brand-orange/20">
                ✓
              </div>
              <span className="text-[10px] text-brand-orange font-bold mt-2 tracking-wider uppercase">Company</span>
            </div>
            <div className="flex-1 h-[2px] bg-slate-200 mx-2 mt-[-18px]">
              <div className="h-full bg-brand-orange w-1/2" />
            </div>
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-brand-navy text-white flex items-center justify-center text-xs font-bold shadow-md">
                3
              </div>
              <span className="text-[10px] text-brand-navy font-bold mt-2 tracking-wider uppercase">Security</span>
            </div>
          </div>

          <div className="mb-10">
            <h2 className="text-3xl font-bold text-slate-800 mb-2">Set Password</h2>
            <p className="text-slate-500 font-medium text-sm">Create a strong password to complete your registration.</p>
          </div>

          <Form
            form={form}
            name="setPassword"
            layout="vertical"
            onFinish={onFinish}
            size="large"
          >
            <Form.Item
              name="password"
              label={<span className="text-xs font-bold text-slate-700">New Password</span>}
              rules={[{ required: true, message: 'Please input your new password!' }]}
              className="mb-4"
            >
              <Input.Password 
                prefix={<LockOutlined className="text-slate-400 mr-1" />} 
                placeholder="••••••••" 
                className="!h-12 !rounded-lg !bg-white !border-slate-200 focus:!bg-white"
                onChange={(e) => setPassword(e.target.value)}
              />
            </Form.Item>

            {/* Password Requirements Box */}
            <div className="bg-slate-100 rounded-lg p-4 mb-6">
              <ul className="space-y-2 text-sm m-0 p-0 list-none text-slate-600">
                {requirements.map((req, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full border flex items-center justify-center ${req.met ? 'border-brand-orange bg-brand-orange text-white' : 'border-slate-300 bg-white'}`}>
                      {req.met && <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                    </div>
                    <span className={req.met ? 'text-slate-800' : ''}>{req.label}</span>
                  </li>
                ))}
              </ul>
            </div>

            <Form.Item
              name="confirmPassword"
              label={<span className="text-xs font-bold text-slate-700">Confirm Password</span>}
              dependencies={['password']}
              rules={[
                { required: true, message: 'Please confirm your password!' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('The two passwords do not match!'));
                  },
                }),
              ]}
              className="mb-8"
            >
              <Input.Password
                prefix={<LockOutlined className="text-slate-400 mr-1" />}
                placeholder="••••••••"
                className="!h-12 !rounded-lg !bg-white !border-slate-200 focus:!bg-white"
                iconRender={visible => (visible ? <svg viewBox="64 64 896 896" focusable="false" data-icon="eye" width="1em" height="1em" fill="currentColor" aria-hidden="true"><path d="M942.2 486.2C847.4 286.5 704.1 186 512 186c-192.2 0-335.4 100.5-430.2 300.3a60.3 60.3 0 000 51.5C176.6 737.5 319.9 838 512 838c192.2 0 335.4-100.5 430.2-300.3 7.7-16.2 7.7-35 0-51.5zM512 766c-161.3 0-279.4-81.8-362.7-254C232.6 339.8 350.7 258 512 258c161.3 0 279.4 81.8 362.7 254C791.5 684.2 673.4 766 512 766zm-4-430c-97.2 0-176 78.8-176 176s78.8 176 176 176 176-78.8 176-176-78.8-176-176-176zm0 288c-61.9 0-112-50.1-112-112s50.1-112 112-112 112 50.1 112 112-50.1 112-112 112z"></path></svg> : <svg viewBox="64 64 896 896" focusable="false" data-icon="eye-invisible" width="1em" height="1em" fill="currentColor" aria-hidden="true"><path d="M942.2 486.2Q889.4 375 814 298.1l-66.9 66.9c53.8 56.4 96.5 125.8 124.9 203a715.36 715.36 0 01-124.9 203c-85 89.2-192.5 137.9-307 137.9-63.5 0-125-14.7-181.7-41.9l-62.8 62.8c75.6 36 158.4 54.4 244.5 54.4 192.2 0 335.4-100.5 430.2-300.3 7.7-16.2 7.7-35 0-51.5zM511.5 766c-161.3 0-279.4-81.8-362.7-254 39-81.9 92.5-151.7 158.2-206l-67-67C162.7 308.2 97.4 397 51.8 486.2a60.3 60.3 0 000 51.5C146.6 737.5 289.9 838 482 838c64.6 0 127.4-15 186-43.1l-65.7-65.7A365.17 365.17 0 01511.5 766zM320 512c0-105.9 86.1-192 192-192 23.3 0 45.6 4.1 66.1 11.7l-55.8 55.8a111.98 111.98 0 00-114.1 114.1l-55.8 55.8A191.07 191.07 0 01320 512zm354.2 133.7l-55.8-55.8a111.98 111.98 0 00-114.1-114.1l-55.8-55.8A191.07 191.07 0 01512 320c105.9 0 192 86.1 192 192 0 23.3-4.1 45.6-11.7 66.1l55.8 55.8zM890.5 130.6l-50-50L135.6 785.5l50 50z"></path></svg>)}
              />
            </Form.Item>

            <Form.Item className="mb-4">
              <Button 
                type="primary" 
                htmlType="submit" 
                className="w-full !h-12 text-sm font-bold !bg-brand-orange hover:!bg-orange-600 !border-brand-orange hover:!border-orange-600 !rounded-lg"
                icon={<ArrowRightOutlined />}
                iconPlacement="end"
                disabled={!allRequirementsMet}
              >
                Complete Registration
              </Button>
            </Form.Item>
            
            <Form.Item className="mb-0">
              <Button 
                type="default" 
                className="w-full !h-12 text-sm font-bold !bg-slate-50 hover:!bg-slate-100 !border-slate-200 !text-slate-600 hover:!text-slate-800 !rounded-lg"
                onClick={() => navigate('/register/verify')}
              >
                Back to Previous Step
              </Button>
            </Form.Item>

          </Form>
        </div>
      </div>
    </div>
  );
};
