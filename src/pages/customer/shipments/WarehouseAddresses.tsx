import React from 'react';
import { Button, message } from 'antd';
import { CopyOutlined, EnvironmentOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { useAppSelector } from '../../../store/hooks';

export const WarehouseAddresses: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const memberCode = user?.customerId || 'GL-129254';
  const phone = '08011223344';

  const guangzhouAddress = {
    hub: 'Guangzhou Hub',
    type: 'AIR FREIGHT',
    lines: [
      `收货人名字：${memberCode}转abdallahmnas ${phone}`,
      `收货人号码：13246490077`,
      `收货人地址：广东省广州市白云区均禾街道清湖村苏元庄街888号`,
      `${memberCode}转abdallahmnas ${phone}赛捷集运(AIR)`,
    ],
  };

  const shanghaiAddress = {
    hub: 'Shanghai Hub',
    type: 'SEA FREIGHT',
    lines: [
      `收货人名字：${memberCode}转abdallahmnas ${phone}`,
      `收货人号码：13246490077`,
      `收货人地址：上海市浦东新区外高桥保税区富特北路211号302部位`,
      `${memberCode}转abdallahmnas ${phone}赛捷集运(SEA)`,
    ],
  };

  const copyToClipboard = (lines: string[]) => {
    const text = lines.join('\n');
    navigator.clipboard.writeText(text).then(() => {
      message.success('Address copied to clipboard!');
    });
  };

  const copyMemberCode = () => {
    navigator.clipboard.writeText(memberCode).then(() => {
      message.success('Member code copied!');
    });
  };

  return (
    <div className="animate-fade-in-up pb-20">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left Column — Main Content */}
        <div className="lg:col-span-2">
          <h1 className="text-2xl font-bold text-[#0A1128] m-0 mb-2 tracking-tight">Warehouse Addresses</h1>
          <p className="text-slate-500 text-sm mb-8 max-w-xl leading-relaxed">
            Use these addresses as your shipping destination when purchasing from suppliers. Always include your unique member code to ensure proper routing.
          </p>

          {/* Guangzhou Hub */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm mb-6 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-brand-orange/10 text-brand-orange flex items-center justify-center">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 21H21M4 18H20V10L12 3L4 10V18Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M9 18V13H15V18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-[#0A1128] text-lg m-0">{guangzhouAddress.hub}</h3>
                  <span className="text-brand-orange font-bold text-xs tracking-wider uppercase">{guangzhouAddress.type}</span>
                </div>
              </div>
              <Button
                type="primary"
                icon={<CopyOutlined />}
                className="bg-brand-orange hover:bg-[#E86E21] border-none font-bold shadow-sm px-5"
                onClick={() => copyToClipboard(guangzhouAddress.lines)}
              >
                Copy All Details
              </Button>
            </div>
            <div className="px-6 py-5">
              <div className="bg-slate-50 rounded-lg p-5 border border-slate-200">
                {guangzhouAddress.lines.map((line, i) => (
                  <p key={i} className="text-sm text-slate-700 m-0 mb-1.5 last:mb-0 font-medium leading-relaxed">{line}</p>
                ))}
              </div>
            </div>
          </div>

          {/* Shanghai Hub */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 17L6 3H18L21 17H3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M1 17H23V21H1V17Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 3V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-[#0A1128] text-lg m-0">{shanghaiAddress.hub}</h3>
                  <span className="text-slate-500 font-bold text-xs tracking-wider uppercase">{shanghaiAddress.type}</span>
                </div>
              </div>
              <Button
                icon={<CopyOutlined />}
                className="bg-white hover:bg-slate-50 border-slate-200 text-[#0A1128] font-bold shadow-sm px-5"
                onClick={() => copyToClipboard(shanghaiAddress.lines)}
              >
                Copy All Details
              </Button>
            </div>
            <div className="px-6 py-5">
              <div className="bg-slate-50 rounded-lg p-5 border border-slate-200">
                {shanghaiAddress.lines.map((line, i) => (
                  <p key={i} className="text-sm text-slate-700 m-0 mb-1.5 last:mb-0 font-medium leading-relaxed">{line}</p>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column — Sidebar */}
        <div className="lg:col-span-1 space-y-6">

          {/* Member Code Card */}
          <div className="bg-[#0A1128] rounded-xl p-6 text-white relative overflow-hidden shadow-lg">
            <div className="absolute -right-8 -top-8 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl"></div>
            <div className="flex justify-between items-start relative z-10">
              <div>
                <div className="text-[10px] font-bold text-blue-300 uppercase tracking-wider mb-2">Your Member Code</div>
                <div className="text-2xl font-extrabold tracking-tight">{memberCode}</div>
              </div>
              <Button
                type="text"
                icon={<CopyOutlined className="text-white/60 hover:text-white text-lg" />}
                className="p-0 border-none bg-transparent"
                onClick={copyMemberCode}
              />
            </div>
          </div>

          {/* How to Use */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
            <h3 className="font-bold text-[#0A1128] text-base m-0 mb-5 flex items-center gap-2">
              <InfoCircleOutlined className="text-brand-orange" /> How to Use
            </h3>

            <div className="space-y-6">
              <div className="flex gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-brand-orange mt-1.5 shrink-0"></div>
                <div>
                  <h4 className="font-bold text-[#0A1128] text-sm m-0 mb-1">Copy Details</h4>
                  <p className="text-slate-500 text-xs m-0 leading-relaxed">
                    Use the copy icons to exactly duplicate the Chinese characters to avoid translation errors.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-brand-orange mt-1.5 shrink-0"></div>
                <div>
                  <h4 className="font-bold text-[#0A1128] text-sm m-0 mb-1">Paste on Supplier Site</h4>
                  <p className="text-slate-500 text-xs m-0 leading-relaxed">
                    Paste the exact address into Taobao, 1688, or Alibaba shipping destination fields.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-brand-orange mt-1.5 shrink-0"></div>
                <div>
                  <h4 className="font-bold text-[#0A1128] text-sm m-0 mb-1">Verify Code</h4>
                  <p className="text-slate-500 text-xs m-0 leading-relaxed">
                    Ensure your Member Code ({memberCode}) is visible in the address so we can route it to your account.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Map Card */}
          <div className="rounded-xl overflow-hidden border border-slate-100 shadow-sm relative">
            <img
              src="https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=800&auto=format&fit=crop"
              alt="Guangzhou Hub Location"
              className="w-full h-48 object-cover"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
              <div className="flex items-center gap-2">
                <EnvironmentOutlined className="text-brand-orange" />
                <span className="text-white font-bold text-sm">Guangzhou Hub</span>
              </div>
              <span className="text-white/70 text-xs">23.1291° N, 113.2644° E</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
