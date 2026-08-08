import React from 'react';
import { Form, Input, Button, Alert, Select } from 'antd';
import { UserOutlined, MailOutlined, PhoneOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { registerUser, clearError } from '../../store/slices/authSlice';
import type { RegisterPayload } from '../../types/auth.types';
import { registerSchema, validateForm, validateField } from '../../utils/validators';
import { GlobalOutlined, BarChartOutlined, ArrowRightOutlined, SafetyCertificateOutlined } from '@ant-design/icons';

export const RegisterPage: React.FC = () => {
  const [form] = Form.useForm();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { loading, error } = useAppSelector(state => state.auth);

  const onFinish = async (values: RegisterPayload) => {
    // Validate with Yup before dispatch
    const errors = await validateForm(registerSchema, values);
    if (Object.keys(errors).length > 0) {
      form.setFields(
        Object.keys(errors).map((key) => ({
          name: key,
          errors: [errors[key]],
        }))
      );
      return;
    }

    const resultAction = await dispatch(registerUser(values));
    if (registerUser.fulfilled.match(resultAction)) {
      navigate('/register/verify');
    }
  };

  const handleBlur = async (field: string) => {
    const value = form.getFieldValue(field);
    if (!value) return; // let required rule handle empty
    
    const err = await validateField(registerSchema, field, value);
    if (err) {
      form.setFields([{ name: field, errors: [err] }]);
    } else {
      form.setFields([{ name: field, errors: [] }]);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex">
      {/* Left Panel - Visual */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1494412574643-ff11b0a5eb19?w=1200&q=80')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-brand-navy/80 via-brand-navy/70 to-brand-navy/90" />

        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-orange/20 border border-brand-orange/30 rounded-full text-brand-orange text-xs font-semibold uppercase tracking-wider mb-8">
              <RocketIcon />
              Enterprise Logistics Platform
            </div>

            <h2 className="text-4xl xl:text-5xl font-extrabold text-white leading-tight mb-4">
              Global Reach.
              <br />
              <span className="text-brand-orange">Industrial Precision.</span>
            </h2>

            <p className="text-slate-300 text-lg leading-relaxed max-w-md mt-6">
              Join the world&apos;s most reliable shipping network. Manage
              complex supply chains, track shipments in real-time, and optimize
              your global logistics operations from a single, unified platform.
            </p>
          </div>

          {/* Feature Cards */}
          <div className="flex gap-4 mt-auto">
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-5 flex-1">
              <div className="w-10 h-10 rounded-lg bg-brand-orange/20 flex items-center justify-center mb-3">
                <GlobalOutlined className="text-brand-orange" />
              </div>
              <h4 className="text-white font-bold text-sm mb-1">
                Global Network
              </h4>
              <p className="text-slate-400 text-xs leading-relaxed">
                Access shipping routes across 190+ countries with guaranteed
                reliability.
              </p>
            </div>
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-5 flex-1">
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center mb-3">
                <BarChartOutlined className="text-blue-400" />
              </div>
              <h4 className="text-white font-bold text-sm mb-1">
                Real-time Insights
              </h4>
              <p className="text-slate-400 text-xs leading-relaxed">
                Advanced tracking and predictive analytics for your entire
                supply chain.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 py-12 px-4 sm:px-8 lg:px-16">
        <div className="w-full max-w-[460px] bg-white p-10 rounded-2xl shadow-xl shadow-slate-200/50">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-slate-800 m-0">
              Create Account
            </h2>
            <span className="text-xs font-bold text-brand-navy bg-blue-50 px-3 py-1.5 rounded-full">
              Step 1 of 3
            </span>
          </div>
          <p className="text-slate-500 text-sm mb-10">
            Enter your details to begin setting up your logistics dashboard.
          </p>

          {/* Step Indicator */}
          <div className="flex items-center gap-0 mb-10">
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-brand-navy text-white flex items-center justify-center text-xs font-bold shadow-md">
                1
              </div>
              <span className="text-[10px] text-brand-navy font-bold mt-2 tracking-wider uppercase">
                Account Info
              </span>
            </div>
            <div className="flex-1 h-[1px] bg-brand-navy mx-2 mt-[-18px]" />
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center text-xs font-bold">
                2
              </div>
              <span className="text-[10px] text-slate-400 mt-2 tracking-wider uppercase">Verification</span>
            </div>
            <div className="flex-1 h-[1px] bg-slate-100 mx-2 mt-[-18px]" />
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center text-xs font-bold">
                3
              </div>
              <span className="text-[10px] text-slate-400 mt-2 tracking-wider uppercase">Security</span>
            </div>
          </div>

          {error && (
            <Alert
              message="Registration Failed"
              description={error}
              type="error"
              showIcon
              className="mb-6"
              onClose={() => dispatch(clearError())}
              closable
            />
          )}

          <Form
            form={form}
            name="register"
            layout="vertical"
            onFinish={onFinish}
            size="large"
            scrollToFirstError
          >
            <Form.Item
              label={
                <span className="font-semibold text-slate-700 text-sm">
                  Full Legal Name
                </span>
              }
              required={false}
            >
              <div className="flex gap-3">
                <Form.Item
                  name="firstName"
                  rules={[
                    { required: true, message: 'First name is required' },
                  ]}
                  className="flex-1 mb-0"
                >
                  <Input
                    prefix={<UserOutlined className="text-slate-400" />}
                    placeholder="First Name"
                    onBlur={() => handleBlur('firstName')}
                    className="!rounded-lg"
                  />
                </Form.Item>
                <Form.Item
                  name="lastName"
                  rules={[
                    { required: true, message: 'Last name is required' },
                  ]}
                  className="flex-1 mb-0"
                >
                  <Input
                    placeholder="Last Name"
                    onBlur={() => handleBlur('lastName')}
                    className="!rounded-lg"
                  />
                </Form.Item>
              </div>
            </Form.Item>

            <Form.Item
              label={
                <span className="font-semibold text-slate-700 text-sm">
                  Corporate Email Address
                </span>
              }
              name="email"
              rules={[{ required: true, message: 'Email is required' }]}
            >
              <Input
                prefix={<MailOutlined className="text-slate-400" />}
                placeholder="jane.doe@company.com"
                type="email"
                onBlur={() => handleBlur('email')}
                className="!rounded-lg"
              />
            </Form.Item>

            <Form.Item
              label={
                <span className="font-semibold text-slate-700 text-sm">
                  Contact Number
                </span>
              }
              required={false}
            >
              <div className="flex gap-3">
                <Form.Item className="mb-0 w-28">
                  <Select
                    defaultValue="+234"
                    className="!rounded-lg"
                    options={[
                      { value: '+234', label: '🇳🇬 +234' },
                      { value: '+86', label: '🇨🇳 +86' },
                      { value: '+1', label: '🇺🇸 +1' },
                      { value: '+44', label: '🇬🇧 +44' },
                    ]}
                  />
                </Form.Item>
                <Form.Item
                  name="phone"
                  rules={[
                    { required: true, message: 'Phone number is required' },
                  ]}
                  className="flex-1 mb-0"
                >
                  <Input
                    prefix={<PhoneOutlined className="text-slate-400" />}
                    placeholder="801-234-5678"
                    onBlur={() => handleBlur('phone')}
                    className="!rounded-lg"
                  />
                </Form.Item>
              </div>
            </Form.Item>

            {/* Hidden password fields - filled in step 3, use defaults for now */}
            <Form.Item name="password" initialValue="Temp1234!" hidden>
              <Input.Password />
            </Form.Item>
            <Form.Item name="confirmPassword" initialValue="Temp1234!" hidden>
              <Input.Password />
            </Form.Item>

            <Form.Item className="mt-8 mb-4">
              <Button
                type="primary"
                htmlType="submit"
                className="w-full !h-12 text-base font-semibold !bg-brand-navy hover:!bg-slate-800 !rounded-lg"
                loading={loading}
                icon={<ArrowRightOutlined />}
                iconPlacement="end"
              >
                Continue to Verification
              </Button>
            </Form.Item>

            <div className="text-center mt-4">
              <span className="text-slate-500 text-sm">
                Already have an account?{' '}
              </span>
              <Link
                to="/login"
                className="text-brand-navy font-bold hover:text-brand-orange text-sm"
              >
                Sign in here
              </Link>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
};

// Small rocket icon component
const RocketIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
    <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
    <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
    <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
  </svg>
);
