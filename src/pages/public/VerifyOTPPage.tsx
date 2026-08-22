import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Alert, message } from 'antd';
import { LockOutlined, ArrowRightOutlined, ArrowLeftOutlined, SafetyCertificateOutlined, ReloadOutlined } from '@ant-design/icons';
import apiClient from '../../api/axios';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchCurrentUser } from '../../store/slices/authSlice';

export const VerifyOTPPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timeLeft, setTimeLeft] = useState(60); // seconds
  const [userEmail, setUserEmail] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [devOtp, setDevOtp] = useState<string | null>(null);

  useEffect(() => {
    const savedDraft = sessionStorage.getItem('registrationDraft');
    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft);
        if (parsed.email) {
          setUserEmail(parsed.email);
        }
      } catch (e) {
        console.error('Failed to parse registration draft:', e);
      }
    } else if (user?.email) {
      setUserEmail(user.email);
    }
  }, [user]);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleChange = (index: number, value: string) => {
    const cleaned = value.replace(/[^0-9]/g, '');
    if (cleaned.length > 1) return;

    const newOtp = [...otp];
    newOtp[index] = cleaned;
    setOtp(newOtp);

    // Auto-focus next input
    if (cleaned !== '' && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && otp[index] === '' && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim().replace(/[^0-9]/g, '').slice(0, 6);
    if (pastedData.length === 6) {
      const newOtp = pastedData.split('');
      setOtp(newOtp);
      const lastInput = document.getElementById('otp-5');
      lastInput?.focus();
    }
  };

  const handleSubmit = async () => {
    const code = otp.join('');
    if (code.length !== 6) return;

    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await apiClient.post('/auth/verify-otp', {
        otp: code,
        email: userEmail,
      });

      if (res.data.status === 'success') {
        message.success('Account email verified successfully!');
        sessionStorage.removeItem('registrationDraft');
        await dispatch(fetchCurrentUser());
        navigate('/customer', { replace: true });
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Invalid or expired OTP code';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!userEmail) {
      message.error('Email address not found. Please register again.');
      return;
    }

    setResending(true);
    setErrorMsg(null);

    try {
      const res = await apiClient.post('/auth/resend-otp', {
        email: userEmail,
      });

      message.success('New OTP verification code sent to your email!');
      setTimeLeft(60);
      if (res.data.otpCode) {
        setDevOtp(res.data.otpCode);
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to resend OTP';
      message.error(msg);
    } finally {
      setResending(false);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
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
              Secure Your<br />Access
            </h2>
            <p className="text-slate-300 text-lg leading-relaxed max-w-md mt-4">
              HAMZA RMB GLOBAL requires multi-factor authentication to ensure the security of your account and shipments.
            </p>
          </div>

          <div className="mt-12">
            <div className="bg-brand-navy/80 backdrop-blur-md rounded-xl p-5 border border-white/10 w-full max-w-sm">
              <div className="flex items-center gap-3 text-white font-medium mb-3">
                <SafetyCertificateOutlined className="text-brand-orange text-lg" />
                SECURITY PROTOCOL ACTIVE
              </div>
              <div className="w-full bg-slate-700/50 rounded-full h-1.5 overflow-hidden">
                <div className="bg-brand-orange h-full rounded-full" style={{ width: '100%' }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex flex-col items-center justify-center bg-white py-12 px-4 sm:px-8 lg:px-16">
        <div className="w-full max-w-md text-center">
          
          {/* Step Indicator */}
          <div className="flex items-center gap-0 mb-10 w-full max-w-[280px] mx-auto">
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-brand-orange text-white flex items-center justify-center text-sm font-bold shadow-md shadow-brand-orange/20">
                ✓
              </div>
              <span className="text-[10px] text-slate-500 mt-2 tracking-wider uppercase">Info</span>
            </div>
            <div className="flex-1 h-[1px] bg-brand-orange mx-2 mt-[-18px]" />
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-brand-orange text-white flex items-center justify-center text-sm font-bold shadow-md shadow-brand-orange/20">
                ✓
              </div>
              <span className="text-[10px] text-slate-500 mt-2 tracking-wider uppercase">Password</span>
            </div>
            <div className="flex-1 h-[1px] bg-brand-navy mx-2 mt-[-18px]" />
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-brand-navy text-white flex items-center justify-center text-xs font-bold shadow-md">
                3
              </div>
              <span className="text-[10px] text-brand-navy font-bold mt-2 tracking-wider uppercase">Verification</span>
            </div>
          </div>

          <h2 className="text-3xl font-bold text-slate-800 mb-4">
            Verify Email OTP
          </h2>
          <p className="text-slate-500 text-base mb-8 max-w-xs mx-auto">
            A 6-digit verification code has been sent to<br/>
            <span className="font-bold text-brand-navy">{userEmail || 'your email address'}</span>
          </p>

          {errorMsg && (
            <Alert
              message="Verification Error"
              description={errorMsg}
              type="error"
              showIcon
              closable
              onClose={() => setErrorMsg(null)}
              className="mb-6 text-left"
            />
          )}

          {devOtp && (
            <Alert
              message="Development Test OTP"
              description={`Verification Code: ${devOtp}`}
              type="info"
              showIcon
              className="mb-6 text-left border-blue-200 bg-blue-50"
            />
          )}

          {/* OTP Inputs */}
          <div className="flex justify-center gap-2 sm:gap-3 mb-6">
            {otp.map((digit, index) => (
              <input
                key={index}
                id={`otp-${index}`}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={index === 0 ? handlePaste : undefined}
                className={`w-11 h-14 sm:w-13 sm:h-16 text-center text-2xl font-black rounded-lg border-2 outline-none transition-colors ${
                  digit 
                    ? 'border-brand-navy text-brand-navy bg-blue-50/30' 
                    : 'border-slate-200 text-slate-800 focus:border-brand-orange'
                } bg-slate-50 focus:bg-white`}
              />
            ))}
          </div>

          <div className="flex items-center justify-between px-2 mb-8 text-sm">
            <button 
              className={`font-semibold flex items-center gap-1.5 ${timeLeft > 0 || resending ? 'text-slate-400 cursor-not-allowed' : 'text-brand-orange hover:text-orange-600 cursor-pointer'}`}
              disabled={timeLeft > 0 || resending}
              onClick={handleResendOtp}
            >
              <ReloadOutlined spin={resending} /> Resend Code
            </button>
            <span className="text-slate-500 font-mono text-xs font-bold">
              ⏱ {formatTime(timeLeft)}
            </span>
          </div>

          <Button
            type="primary"
            onClick={handleSubmit}
            loading={loading}
            className="w-full !h-14 text-base font-bold !bg-brand-orange hover:!bg-orange-600 !border-brand-orange !rounded-lg shadow-lg shadow-brand-orange/20 mb-8"
            icon={<ArrowRightOutlined />}
            iconPlacement="end"
            disabled={otp.join('').length !== 6}
          >
            Verify &amp; Activate Account
          </Button>

          <Link to="/register" className="inline-flex items-center gap-2 text-brand-navy font-bold text-sm hover:text-brand-orange transition-colors">
            <ArrowLeftOutlined /> Back to Registration
          </Link>

          <div className="mt-12 flex items-center justify-center gap-2 text-xs text-slate-400">
            <LockOutlined />
            256-bit encrypted authentication
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyOTPPage;
