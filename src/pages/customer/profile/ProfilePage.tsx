import React, { useState } from 'react';
import { Card, Form, Input, Button, Switch, message } from 'antd';
import { SaveOutlined, UserOutlined, MailOutlined, PhoneOutlined } from '@ant-design/icons';
import { useAppSelector } from '../../../store/hooks';

interface ProfileFormValues {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export const ProfilePage: React.FC = () => {
  const [form] = Form.useForm<ProfileFormValues>();
  const user = useAppSelector((state) => state.auth.user);
  const [saving, setSaving] = useState(false);
  const [emailNotif, setEmailNotif] = useState(true);
  const [smsNotif, setSmsNotif] = useState(true);
  const [pushNotif, setPushNotif] = useState(false);

  const onFinish = (_values: ProfileFormValues) => {
    setSaving(true);
    // Simulate API call
    setTimeout(() => {
      setSaving(false);
      message.success('Profile updated successfully.');
    }, 1200);
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 m-0">Profile</h1>
        <p className="text-slate-500 mt-1 mb-0 text-sm">Manage your personal information and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card bordered={false} className="shadow-sm rounded-2xl">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Personal Information</h3>
            <Form
              form={form}
              layout="vertical"
              onFinish={onFinish}
              requiredMark={false}
              initialValues={{
                firstName: user?.firstName,
                lastName: user?.lastName,
                email: user?.email,
                phone: user?.phone,
              }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Form.Item name="firstName" label="First Name" rules={[{ required: true, message: 'First name is required' }]}>
                  <Input prefix={<UserOutlined className="text-slate-400" />} size="large" />
                </Form.Item>
                <Form.Item name="lastName" label="Last Name" rules={[{ required: true, message: 'Last name is required' }]}>
                  <Input prefix={<UserOutlined className="text-slate-400" />} size="large" />
                </Form.Item>
              </div>

              <Form.Item
                name="email"
                label="Email Address"
                rules={[{ required: true, type: 'email', message: 'Please enter a valid email' }]}
              >
                <Input prefix={<MailOutlined className="text-slate-400" />} size="large" />
              </Form.Item>

              <Form.Item name="phone" label="Phone Number" rules={[{ required: true, message: 'Phone number is required' }]}>
                <Input prefix={<PhoneOutlined className="text-slate-400" />} size="large" />
              </Form.Item>

              <Form.Item className="mb-0 mt-6">
                <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={saving}>
                  Save Changes
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </div>

        <div className="space-y-6">
          <Card bordered={false} className="shadow-sm rounded-2xl">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Customer ID</h3>
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-center">
              <span className="font-mono font-bold text-brand-navy text-lg">{user?.customerId || 'N/A'}</span>
            </div>
            <p className="text-xs text-slate-400 mt-3 mb-0">
              Use this ID when contacting support or corresponding with our warehouse teams.
            </p>
          </Card>

          <Card bordered={false} className="shadow-sm rounded-2xl">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Notification Preferences</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-slate-600 text-sm">Email Notifications</span>
                <Switch checked={emailNotif} onChange={setEmailNotif} />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600 text-sm">SMS Notifications</span>
                <Switch checked={smsNotif} onChange={setSmsNotif} />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600 text-sm">Push Notifications</span>
                <Switch checked={pushNotif} onChange={setPushNotif} />
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
