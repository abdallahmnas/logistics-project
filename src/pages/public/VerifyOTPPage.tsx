import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from 'antd';
import { LockOutlined, ArrowRightOutlined, ArrowLeftOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import { Logo } from '../../components/common/Logo';

export const VerifyOTPPage: React.FC = () => {
  const navigate = useNavigate();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timeLeft, setTimeLeft] = useState(52); // seconds
  const [userEmail, setUserEmail] = useState<string>('your registered email');

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
    }
  }, []);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) return; // Only allow 1 char per input
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value !== '' && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Handle backspace
    if (e.key === 'Backspace' && otp[index] === '' && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleSubmit = () => {
    const code = otp.join('');
    if (code.length === 6) {
      // In a real app, verify the OTP here, then go to step 3
      navigate('/register/password'); 
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
              Hamza RMB requires multi-factor authentication to ensure the safety of your supply chain data.
            </p>
          </div>

          <div className="mt-12">
            <div className="bg-brand-navy/80 backdrop-blur-md rounded-xl p-5 border border-white/10 w-full max-w-sm">
              <div className="flex items-center gap-3 text-white font-medium mb-3">
                <SafetyCertificateOutlined className="text-brand-orange text-lg" />
                SECURITY PROTOCOL
              </div>
              <div className="w-full bg-slate-700/50 rounded-full h-1.5 overflow-hidden">
                <div className="bg-brand-orange h-full rounded-full" style={{ width: '66%' }} />
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
              <span className="text-[10px] text-slate-500 mt-2 tracking-wider uppercase">Step 1</span>
            </div>
            <div className="flex-1 h-[1px] bg-brand-orange mx-2 mt-[-18px]" />
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-brand-navy text-white flex items-center justify-center text-xs font-bold shadow-md">
                2
              </div>
              <span className="text-[10px] text-brand-navy font-bold mt-2 tracking-wider uppercase">Step 2</span>
            </div>
            <div className="flex-1 h-[1px] bg-slate-100 mx-2 mt-[-18px]" />
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center text-xs font-bold">
                3
              </div>
              <span className="text-[10px] text-slate-400 mt-2 tracking-wider uppercase">Step 3</span>
            </div>
          </div>

          <h2 className="text-3xl font-bold text-slate-800 mb-4">
            Verify OTP
          </h2>
          <p className="text-slate-500 text-base mb-10 max-w-xs mx-auto">
            A 6-digit verification code has been sent to<br/>
            <span className="font-semibold text-slate-700">{userEmail}</span>
          </p>

          {/* OTP Inputs */}
          <div className="flex justify-center gap-3 sm:gap-4 mb-6">
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
                className={`w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-bold rounded-lg border-2 outline-none transition-colors ${
                  digit 
                    ? 'border-brand-navy text-brand-navy' 
                    : 'border-slate-200 text-slate-800 focus:border-brand-orange'
                } bg-slate-50 focus:bg-white`}
              />
            ))}
          </div>

          <div className="flex items-center justify-between px-2 mb-10 text-sm">
            <button 
              className={`font-semibold ${timeLeft > 0 ? 'text-slate-400 cursor-not-allowed' : 'text-brand-orange hover:text-orange-600'}`}
              disabled={timeLeft > 0}
              onClick={() => setTimeLeft(60)}
            >
              Resend Code
            </button>
            <span className="text-slate-500 flex items-center gap-1.5">
              ⏱ {formatTime(timeLeft)}
            </span>
          </div>

          <Button
            type="primary"
            onClick={handleSubmit}
            className="w-full !h-14 text-base font-semibold !bg-brand-orange hover:!bg-orange-600 !border-brand-orange hover:!border-orange-600 !rounded-lg shadow-lg shadow-brand-orange/20 mb-8"
            icon={<ArrowRightOutlined />}
            iconPlacement="end"
            disabled={otp.join('').length !== 6}
          >
            Verify & Proceed
          </Button>

          <Link to="/register" className="inline-flex items-center gap-2 text-brand-navy font-bold text-sm hover:text-brand-orange transition-colors">
            <ArrowLeftOutlined /> Back to account info
          </Link>

          <div className="mt-16 flex items-center justify-center gap-2 text-xs text-slate-400">
            <LockOutlined />
            256-bit encrypted connection
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyOTPPage;
