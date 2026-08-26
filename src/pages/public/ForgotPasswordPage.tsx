import React, { useState } from 'react';
import { Form, Input, Button, Result, Alert, message } from 'antd';
import { MailOutlined, ArrowLeftOutlined, KeyOutlined, SafetyCertificateOutlined, LockOutlined, NumberOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import apiClient from '../../api/axios';

export const ForgotPasswordPage: React.FC = () => {
  const [formStep1] = Form.useForm();
  const [formStep2] = Form.useForm();
  const [formStep3] = Form.useForm();
  const navigate = useNavigate();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [verifiedOtp, setVerifiedOtp] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Step 1: Send OTP to Email
  const handleRequestOtp = async (values: { email: string }) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await apiClient.post('/auth/forgot-password', { email: values.email });
      setEmail(values.email);
      setStep(2);
      message.success(res.data.message || '6-digit OTP code sent to your email.');
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to send OTP code. Please check your email.';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP Code
  const handleVerifyOtp = async (values: { otp: string }) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await apiClient.post('/auth/verify-reset-otp', {
        email,
        otp: values.otp,
      });
      setVerifiedOtp(values.otp);
      message.success(res.data.message || 'OTP verified successfully!');
      setStep(3);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Invalid or expired OTP code.';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Set New Password
  const handleSetNewPassword = async (values: { password: string; confirmPassword: string }) => {
    if (values.password !== values.confirmPassword) {
      setErrorMsg('Passwords do not match');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await apiClient.post('/auth/reset-password', {
        email,
        otp: verifiedOtp,
        password: values.password,
      });
      message.success(res.data.message || 'Password updated successfully!');
      setStep(4);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to update password. Please try again.';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (!email) return;
    setLoading(true);
    setErrorMsg(null);
    try {
      await apiClient.post('/auth/forgot-password', { email });
      message.success('A new 6-digit OTP code has been sent to your email.');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to resend OTP.';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex">
      {/* Left Panel - Visual */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-brand-navy flex-col justify-between p-12">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-overlay"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1586528116311-ad8ed7c83a7f?w=1200&q=80')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-navy via-brand-navy/80 to-transparent z-0" />

        <div className="relative z-10 flex flex-col justify-between p-4 w-full h-full mt-auto">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 border border-white/20 rounded-full text-white text-xs font-bold tracking-wider mb-8 bg-white/5 backdrop-blur-sm">
              <SafetyCertificateOutlined className="text-brand-orange" />
              Account Security Protocol
            </div>
            <h2 className="text-4xl xl:text-5xl font-extrabold text-white leading-tight mb-4">
              Recover Your<br />Password Access
            </h2>
            <p className="text-slate-300 text-lg leading-relaxed max-w-md mt-4">
              Enter your registered email address to receive a secure 6-digit OTP code and regain access to your Hamza RMB Global dashboard.
            </p>
          </div>

          <div className="mt-12">
            <div className="bg-brand-navy/80 backdrop-blur-md rounded-xl p-5 border border-white/10 w-full max-w-sm">
              <div className="flex items-center gap-3 text-white font-medium mb-2">
                <SafetyCertificateOutlined className="text-brand-orange text-lg" />
                VERIFICATION ENCRYPTION
              </div>
              <div className="text-xs text-slate-300">
                OTP verification codes expire after 10 minutes for your account protection.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Form Flow */}
      <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 py-12 px-4 sm:px-8 lg:px-16">
        <div className="w-full max-w-md bg-white p-10 rounded-2xl shadow-xl shadow-slate-200/50">
          
          {errorMsg && (
            <Alert
              message="Security Check"
              description={errorMsg}
              type="error"
              showIcon
              closable
              onClose={() => setErrorMsg(null)}
              className="mb-6"
            />
          )}

          {/* STEP 1: REQUEST EMAIL FOR OTP */}
          {step === 1 && (
            <>
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-brand-orange/10 text-brand-orange rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4">
                  <KeyOutlined />
                </div>
                <h2 className="text-2xl font-bold text-slate-800">Forgot Password?</h2>
                <p className="text-slate-500 text-sm mt-2">Enter your email and we'll send a 6-digit OTP code to reset your password.</p>
              </div>

              <Form
                form={formStep1}
                name="requestOtpForm"
                layout="vertical"
                onFinish={handleRequestOtp}
                size="large"
              >
                <Form.Item
                  name="email"
                  label={<span className="text-xs font-bold text-slate-700">Email Address</span>}
                  rules={[
                    { required: true, message: 'Please input your registered email!' },
                    { type: 'email', message: 'Please enter a valid email address!' },
                  ]}
                >
                  <Input 
                    prefix={<MailOutlined className="text-slate-400 mr-1" />} 
                    placeholder="user@example.com" 
                    className="!h-12 !rounded-lg"
                  />
                </Form.Item>

                <Form.Item className="mt-8 mb-6">
                  <Button 
                    type="primary" 
                    htmlType="submit" 
                    className="w-full !h-12 text-sm font-bold !bg-brand-navy hover:!bg-slate-800 !rounded-lg shadow-lg shadow-brand-navy/20"
                    loading={loading}
                  >
                    Send 6-Digit OTP Code
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

          {/* STEP 2: VERIFY OTP CODE ONLY */}
          {step === 2 && (
            <>
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-brand-navy/10 text-brand-navy rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4">
                  <NumberOutlined />
                </div>
                <h2 className="text-2xl font-bold text-slate-800">Enter OTP Code</h2>
                <p className="text-slate-500 text-sm mt-1">
                  We've sent a 6-digit OTP verification code to <strong className="text-slate-700">{email}</strong>
                </p>
              </div>

              <Form
                form={formStep2}
                name="verifyOtpForm"
                layout="vertical"
                onFinish={handleVerifyOtp}
                size="large"
              >
                <Form.Item
                  name="otp"
                  label={<span className="text-xs font-bold text-slate-700">6-Digit OTP Code</span>}
                  rules={[
                    { required: true, message: 'Please enter the 6-digit code sent to your email!' },
                    { len: 6, message: 'OTP code must be exactly 6 digits!' },
                  ]}
                >
                  <Input 
                    prefix={<NumberOutlined className="text-slate-400 mr-1" />} 
                    placeholder="123456" 
                    maxLength={6}
                    className="!h-12 !rounded-lg font-mono text-center tracking-widest text-lg font-bold"
                  />
                </Form.Item>

                <Form.Item className="mt-8 mb-4">
                  <Button 
                    type="primary" 
                    htmlType="submit" 
                    className="w-full !h-12 text-sm font-bold !bg-brand-navy hover:!bg-slate-800 !rounded-lg shadow-lg shadow-brand-navy/20"
                    loading={loading}
                  >
                    Verify OTP Code →
                  </Button>
                </Form.Item>

                <div className="flex items-center justify-between text-xs pt-2">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-slate-500 hover:text-brand-navy font-semibold cursor-pointer"
                  >
                    ← Change Email
                  </button>
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={loading}
                    className="text-brand-navy hover:text-brand-orange font-bold cursor-pointer"
                  >
                    Resend Code
                  </button>
                </div>
              </Form>
            </>
          )}

          {/* STEP 3: CREATE NEW PASSWORD ONLY */}
          {step === 3 && (
            <>
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-brand-orange/10 text-brand-orange rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4">
                  <LockOutlined />
                </div>
                <h2 className="text-2xl font-bold text-slate-800">Set New Password</h2>
                <p className="text-slate-500 text-sm mt-1">
                  OTP verified! Create a new strong password for <strong className="text-slate-700">{email}</strong>
                </p>
              </div>

              <Form
                form={formStep3}
                name="setNewPasswordForm"
                layout="vertical"
                onFinish={handleSetNewPassword}
                size="large"
              >
                <Form.Item
                  name="password"
                  label={<span className="text-xs font-bold text-slate-700">New Password</span>}
                  rules={[
                    { required: true, message: 'Please enter your new password!' },
                    { min: 6, message: 'Password must be at least 6 characters!' },
                  ]}
                >
                  <Input.Password 
                    prefix={<LockOutlined className="text-slate-400 mr-1" />} 
                    placeholder="••••••••" 
                    className="!h-12 !rounded-lg"
                  />
                </Form.Item>

                <Form.Item
                  name="confirmPassword"
                  label={<span className="text-xs font-bold text-slate-700">Confirm New Password</span>}
                  dependencies={['password']}
                  rules={[
                    { required: true, message: 'Please confirm your new password!' },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue('password') === value) {
                          return Promise.resolve();
                        }
                        return Promise.reject(new Error('The two passwords do not match!'));
                      },
                    }),
                  ]}
                >
                  <Input.Password 
                    prefix={<LockOutlined className="text-slate-400 mr-1" />} 
                    placeholder="••••••••" 
                    className="!h-12 !rounded-lg"
                  />
                </Form.Item>

                <Form.Item className="mt-8 mb-4">
                  <Button 
                    type="primary" 
                    htmlType="submit" 
                    className="w-full !h-12 text-sm font-bold !bg-brand-orange hover:!bg-orange-600 !border-brand-orange !rounded-lg shadow-lg shadow-brand-orange/20"
                    loading={loading}
                  >
                    Save New Password
                  </Button>
                </Form.Item>
              </Form>
            </>
          )}

          {/* STEP 4: SUCCESS COMPLETE SCREEN */}
          {step === 4 && (
            <Result
              status="success"
              title={<span className="font-bold text-slate-800">Password Reset Complete</span>}
              subTitle={<span className="text-slate-500">Your account password has been updated successfully. You can now log in.</span>}
              className="px-0 py-4"
              extra={[
                <Button 
                  key="login" 
                  type="primary" 
                  size="large" 
                  onClick={() => navigate('/login')}
                  className="w-full !h-12 !rounded-lg !bg-brand-navy hover:!bg-slate-800 font-bold"
                >
                  Proceed to Login →
                </Button>,
              ]}
            />
          )}

        </div>
      </div>
    </div>
  );
};
