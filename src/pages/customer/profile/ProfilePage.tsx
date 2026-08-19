import React, { useState } from 'react';
import { Card, Form, Input, Button, Switch, Tag, message } from 'antd';
import { SaveOutlined, UserOutlined, MailOutlined, PhoneOutlined, LockOutlined, KeyOutlined, CopyOutlined } from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import apiClient from '../../../api/axios';
import { fetchMe } from '../../../store/slices/authSlice';

interface ProfileFormValues {
  firstName: string;
  lastName: string;
  phone: string;
}

interface PasswordFormValues {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export const ProfilePage: React.FC = () => {
  const dispatch = useAppDispatch();
  const [profileForm] = Form.useForm<ProfileFormValues>();
  const [passwordForm] = Form.useForm<PasswordFormValues>();
  const user = useAppSelector((state) => state.auth.user);

  const [savingProfile, setSavingProfile] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [emailNotif, setEmailNotif] = useState(true);
  const [smsNotif, setSmsNotif] = useState(true);
  const [pushNotif, setPushNotif] = useState(true);

  const handleUpdateProfile = async (values: ProfileFormValues) => {
    try {
      setSavingProfile(true);
      await apiClient.patch('/auth/profile', {
        firstName: values.firstName,
        lastName: values.lastName,
        phone: values.phone,
      });
      message.success('Personal information updated successfully!');
      dispatch(fetchMe());
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to update profile';
      message.error(msg);
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (values: PasswordFormValues) => {
    if (values.newPassword !== values.confirmPassword) {
      message.error('New password and confirm password do not match!');
      return;
    }

    try {
      setUpdatingPassword(true);
      await apiClient.post('/auth/change-password', {
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      message.success('Password updated successfully!');
      passwordForm.resetFields();
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to update password. Please check your current password.';
      message.error(msg);
    } finally {
      setUpdatingPassword(false);
    }
  };

  const copyCustomerId = () => {
    if (user?.customerId) {
      navigator.clipboard.writeText(user.customerId).then(() => {
        message.success('Customer ID copied!');
      });
    }
  };

  return (
    <div className="space-y-6 animate-fade-in-up max-w-[1200px] mx-auto pb-20">
      <div>
        <h1 className="text-3xl font-extrabold text-[#0A1128] m-0 mb-1 tracking-tight">Profile & Security</h1>
        <p className="text-slate-500 text-sm m-0">Manage your personal details, login credentials, and notification settings.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column — Profile & Password Forms */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Personal Information Card */}
          <Card bordered={false} className="shadow-sm border border-slate-100 rounded-2xl">
            <h3 className="text-lg font-bold text-[#0A1128] mb-4 flex items-center gap-2">
              <UserOutlined className="text-brand-orange" /> Personal Information
            </h3>
            
            <Form
              form={profileForm}
              layout="vertical"
              onFinish={handleUpdateProfile}
              requiredMark={false}
              initialValues={{
                firstName: user?.firstName,
                lastName: user?.lastName,
                phone: user?.phone,
              }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Form.Item name="firstName" label={<span className="font-bold text-slate-700">First Name</span>} rules={[{ required: true, message: 'First name is required' }]}>
                  <Input prefix={<UserOutlined className="text-slate-400" />} size="large" className="bg-slate-50 border-slate-200" />
                </Form.Item>
                <Form.Item name="lastName" label={<span className="font-bold text-slate-700">Last Name</span>} rules={[{ required: true, message: 'Last name is required' }]}>
                  <Input prefix={<UserOutlined className="text-slate-400" />} size="large" className="bg-slate-50 border-slate-200" />
                </Form.Item>
              </div>

              {/* Email Address — Read-Only Account Credential */}
              <div className="mb-4">
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                  <span>Email Address</span>
                  <Tag color="blue" className="m-0 text-[10px] font-bold uppercase tracking-wider border-none">
                    LOGIN CREDENTIAL
                  </Tag>
                </label>
                <Input 
                  disabled 
                  value={user?.email || ''} 
                  prefix={<LockOutlined className="text-slate-400" />} 
                  suffix={<MailOutlined className="text-slate-400" />}
                  size="large" 
                  className="!bg-slate-100 !text-slate-600 font-medium cursor-not-allowed border-slate-200" 
                />
                <p className="text-[11px] text-slate-400 mt-1 m-0">
                  Your email address is your primary login credential and cannot be modified here.
                </p>
              </div>

              <Form.Item name="phone" label={<span className="font-bold text-slate-700">Phone Number</span>} rules={[{ required: true, message: 'Phone number is required' }]}>
                <Input prefix={<PhoneOutlined className="text-slate-400" />} size="large" className="bg-slate-50 border-slate-200" />
              </Form.Item>

              <Form.Item className="mb-0 mt-6">
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  icon={<SaveOutlined />} 
                  loading={savingProfile}
                  className="bg-brand-orange hover:bg-[#E86E21] border-none font-bold px-6 shadow-sm"
                >
                  Save Profile Changes
                </Button>
              </Form.Item>
            </Form>
          </Card>

          {/* Change Password Card */}
          <Card bordered={false} className="shadow-sm border border-slate-100 rounded-2xl">
            <h3 className="text-lg font-bold text-[#0A1128] mb-1 flex items-center gap-2">
              <KeyOutlined className="text-brand-orange" /> Security & Change Password
            </h3>
            <p className="text-xs text-slate-400 mb-6">Ensure your account uses a strong, unique password.</p>

            <Form
              form={passwordForm}
              layout="vertical"
              onFinish={handleChangePassword}
              requiredMark={false}
            >
              <Form.Item 
                name="currentPassword" 
                label={<span className="font-bold text-slate-700">Current Password</span>} 
                rules={[{ required: true, message: 'Please enter your current password' }]}
              >
                <Input.Password prefix={<LockOutlined className="text-slate-400" />} size="large" placeholder="••••••••" className="bg-slate-50 border-slate-200" />
              </Form.Item>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Form.Item 
                  name="newPassword" 
                  label={<span className="font-bold text-slate-700">New Password</span>} 
                  rules={[
                    { required: true, message: 'Please enter a new password' },
                    { min: 6, message: 'Password must be at least 6 characters' }
                  ]}
                >
                  <Input.Password prefix={<LockOutlined className="text-slate-400" />} size="large" placeholder="••••••••" className="bg-slate-50 border-slate-200" />
                </Form.Item>

                <Form.Item 
                  name="confirmPassword" 
                  label={<span className="font-bold text-slate-700">Confirm New Password</span>} 
                  rules={[{ required: true, message: 'Please confirm your new password' }]}
                >
                  <Input.Password prefix={<LockOutlined className="text-slate-400" />} size="large" placeholder="••••••••" className="bg-slate-50 border-slate-200" />
                </Form.Item>
              </div>

              <Form.Item className="mb-0 mt-6">
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  icon={<KeyOutlined />} 
                  loading={updatingPassword}
                  className="bg-[#0A1128] hover:bg-[#1a2542] border-none font-bold px-6 shadow-sm"
                >
                  Update Password
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </div>

        {/* Right Column — Sidebar */}
        <div className="space-y-6">
          
          {/* Customer ID Card */}
          <Card bordered={false} className="shadow-sm border border-slate-100 rounded-2xl">
            <h3 className="text-lg font-bold text-[#0A1128] mb-4">Customer ID</h3>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center flex items-center justify-between">
              <span className="font-mono font-extrabold text-[#0A1128] text-lg">{user?.customerId || 'N/A'}</span>
              <Button type="text" icon={<CopyOutlined />} onClick={copyCustomerId} className="text-slate-400 hover:text-brand-orange" />
            </div>
            <p className="text-xs text-slate-400 mt-3 mb-0 leading-relaxed">
              Use this unique Member Code when addressing packages to our China receiving warehouses.
            </p>
          </Card>

          {/* Notification Preferences Card */}
          <Card bordered={false} className="shadow-sm border border-slate-100 rounded-2xl">
            <h3 className="text-lg font-bold text-[#0A1128] mb-4">Notification Preferences</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-slate-700 font-bold text-sm">Email Alerts</div>
                  <div className="text-slate-400 text-xs">Order status & receipts</div>
                </div>
                <Switch checked={emailNotif} onChange={setEmailNotif} />
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-slate-100">
                <div>
                  <div className="text-slate-700 font-bold text-sm">SMS Notifications</div>
                  <div className="text-slate-400 text-xs">Arrival & dispatch alerts</div>
                </div>
                <Switch checked={smsNotif} onChange={setSmsNotif} />
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-slate-100">
                <div>
                  <div className="text-slate-700 font-bold text-sm">Push Notifications</div>
                  <div className="text-slate-400 text-xs">Mobile app updates</div>
                </div>
                <Switch checked={pushNotif} onChange={setPushNotif} />
              </div>
            </div>
          </Card>
        </div>

      </div>
    </div>
  );
};
