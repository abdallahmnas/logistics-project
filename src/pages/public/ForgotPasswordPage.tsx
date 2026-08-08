import React, { useState } from 'react';
import { Form, Input, Button, Result } from 'antd';
import { MailOutlined, ArrowLeftOutlined, KeyOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { forgotPasswordSchema, validateForm } from '../../utils/validators';

export const ForgotPasswordPage: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [email, setEmail] = useState('');

  const onFinish = async (values: { email: string }) => {
    const errors = await validateForm(forgotPasswordSchema, values);
    if (Object.keys(errors).length > 0) {
      form.setFields(
        Object.keys(errors).map((key) => ({
          name: key,
          errors: [errors[key]],
        }))
      );
      return;
    }

    setLoading(true);
    setEmail(values.email);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 1500);
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex">
      {/* Left Panel - Visual */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1586528116311-ad8ed7c83a7f?w=1200&q=80')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-navy via-brand-navy/60 to-brand-navy/40" />

        <div className="relative z-10 flex flex-col justify-between p-12 w-full mt-auto">
          <div>
            <h2 className="text-4xl xl:text-5xl font-extrabold text-white leading-tight mb-4">
              Recover Your<br />Access
            </h2>
            <p className="text-slate-300 text-lg leading-relaxed max-w-md mt-4">
              Securely reset your password and regain control of your global logistics dashboard.
            </p>
          </div>

          <div className="mt-12">
            <div className="bg-brand-navy/80 backdrop-blur-md rounded-xl p-5 border border-white/10 w-full max-w-sm">
              <div className="flex items-center gap-3 text-white font-medium mb-3">
                <SafetyCertificateOutlined className="text-brand-orange text-lg" />
                SECURITY PROTOCOL
              </div>
              <div className="text-sm text-slate-300">
                Password recovery links are encrypted and expire after 1 hour for your protection.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex flex-col items-center justify-center bg-white py-12 px-4 sm:px-8 lg:px-16">
        <div className="w-full max-w-md">
          {submitted ? (
            <Result
              status="success"
              title={<span className="font-bold text-slate-800">Check your email</span>}
              subTitle={<span className="text-slate-500">We've sent password reset instructions to {email}</span>}
              className="px-0"
              extra={[
                <Link key="login" to="/login">
                  <Button type="primary" size="large" className="w-full !h-12 !rounded-lg !bg-brand-navy hover:!bg-slate-800 font-semibold">
                    Return to Login
                  </Button>
                </Link>,
              ]}
            />
          ) : (
            <>
              <div className="text-center mb-10">
                <div className="w-16 h-16 bg-brand-orange/10 text-brand-orange rounded-2xl flex items-center justify-center text-2xl mx-auto mb-6">
                  <KeyOutlined />
                </div>
                <h2 className="text-3xl font-bold text-slate-800">Reset Password</h2>
                <p className="text-slate-500 mt-2">Enter your email and we'll send you a link to reset your password</p>
              </div>

              <Form
                form={form}
                name="forgotPassword"
                layout="vertical"
                onFinish={onFinish}
                size="large"
              >
                <Form.Item
                  name="email"
                  rules={[{ required: true, message: 'Please input your email!' }]}
                >
                  <Input 
                    prefix={<MailOutlined className="text-slate-400" />} 
                    placeholder="Email address" 
                    type="email"
                    className="!h-12 !rounded-lg"
                  />
                </Form.Item>

                <Form.Item className="mt-8 mb-6">
                  <Button 
                    type="primary" 
                    htmlType="submit" 
                    className="w-full !h-12 text-base font-semibold !bg-brand-navy hover:!bg-slate-800 !rounded-lg shadow-lg shadow-brand-navy/20"
                    loading={loading}
                  >
                    Send Reset Link
                  </Button>
                </Form.Item>

                <div className="text-center">
                  <Link to="/login" className="inline-flex items-center gap-2 text-slate-500 font-medium hover:text-brand-navy transition-colors text-sm">
                    <ArrowLeftOutlined /> Back to Login
                  </Link>
                </div>
              </Form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
