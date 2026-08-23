import React from 'react';
import { Link } from 'react-router-dom';
import { Button, Card, Tag } from 'antd';
import {
  GlobalOutlined,
  RocketOutlined,
  SafetyCertificateOutlined,
  ArrowRightOutlined,
  SwapOutlined,
  ShoppingCartOutlined,
  EnvironmentOutlined,
  TeamOutlined,
  CheckCircleFilled,
  BankOutlined,
} from '@ant-design/icons';

export const AboutPage: React.FC = () => {
  return (
    <div className="flex flex-col bg-slate-50">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-28 overflow-hidden bg-[#0A1128] text-white">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#C0262D_1px,transparent_1px)] [background-size:16px_16px]" />
        <div className="absolute -right-20 -top-20 w-96 h-96 bg-[#C0262D]/20 rounded-full blur-3xl" />
        <div className="absolute -left-20 -bottom-20 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl" />

        <div className="container mx-auto px-4 relative z-10 text-center">
          <Tag className="bg-[#C0262D] border-none text-white font-bold text-xs uppercase tracking-widest px-3 py-1 rounded-full mb-6">
            ABOUT HAMZA RMB GLOBAL
          </Tag>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-6 max-w-4xl mx-auto">
            Bridging China &amp; Nigeria,
            <br />
            <span className="text-brand-orange">Connecting the World</span>
          </h1>

          <p className="text-slate-300 text-base md:text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
            HAMZA RMB GLOBAL is a premier cross-border logistics and financial trade facilitator. 
            We specialize in seamless freight forwarding from China to Nigeria, supplier sourcing, cargo consolidation, and fast RMB currency exchange.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link to="/services">
              <Button
                type="primary"
                size="large"
                className="!bg-[#C0262D] hover:!bg-[#A01F25] !border-none !h-12 !px-8 !rounded-lg font-bold shadow-lg"
                icon={<ArrowRightOutlined />}
                iconPlacement="end"
              >
                Explore Our Services
              </Button>
            </Link>
            <Link to="/contact">
              <Button
                size="large"
                className="!bg-white/10 hover:!bg-white/20 !text-white !border-white/20 !h-12 !px-8 !rounded-lg font-bold"
              >
                Contact Our Team
              </Button>
            </Link>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mt-16 text-left">
            <div className="bg-white/10 backdrop-blur-md p-5 rounded-xl border border-white/10">
              <div className="text-3xl font-extrabold text-brand-orange">2+</div>
              <div className="text-xs font-bold text-slate-300 uppercase tracking-wider mt-1">China Hubs (Yiwu &amp; Guangzhou)</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md p-5 rounded-xl border border-white/10">
              <div className="text-3xl font-extrabold text-white">36</div>
              <div className="text-xs font-bold text-slate-300 uppercase tracking-wider mt-1">States Delivered in Nigeria</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md p-5 rounded-xl border border-white/10">
              <div className="text-3xl font-extrabold text-brand-orange">10,000+</div>
              <div className="text-xs font-bold text-slate-300 uppercase tracking-wider mt-1">Successful Shipments</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md p-5 rounded-xl border border-white/10">
              <div className="text-3xl font-extrabold text-white">100%</div>
              <div className="text-xs font-bold text-slate-300 uppercase tracking-wider mt-1">Secure RMB Exchange</div>
            </div>
          </div>
        </div>
      </section>

      {/* Corporate Story & Mission */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-xs font-bold text-[#C0262D] uppercase tracking-widest block mb-2">
                WHO WE ARE
              </span>
              <h2 className="text-3xl lg:text-4xl font-extrabold text-[#0A1128] mb-6">
                Your Trusted Gateway to China-Nigeria Commerce
              </h2>
              <p className="text-slate-600 text-base leading-relaxed mb-4">
                Founded with a vision to eliminate supply chain friction for African merchants and businesses, 
                <strong> HAMZA RMB GLOBAL</strong> operates dedicated receiving warehouses in Guangzhou and Yiwu, China, 
                coupled with distribution hubs in Kano and Lagos, Nigeria.
              </p>
              <p className="text-slate-600 text-base leading-relaxed mb-6">
                Whether you are importing small parcel goods from 1688 and Taobao or shipping full container loads (FCL) of heavy industrial machinery, 
                we streamline every single step—from supplier payment in RMB to warehousing, customs clearance, and local doorstep delivery.
              </p>

              <div className="space-y-3 mb-8">
                {[
                  'Direct RMB Supplier Payments via Alipay, WeChat Pay, & Bank Transfer',
                  'Dedicated Yiwu & Guangzhou Receiving Warehouses with 30-Day Storage',
                  'Hassle-free Air Cargo (3–5 Days) and Sea Freight (CBM/FCL)',
                  'End-to-End Real-Time Shipment Tracking from China to Kano & Lagos',
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <CheckCircleFilled className="text-[#C0262D] text-lg" />
                    <span className="text-slate-700 font-semibold text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Feature Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Card className="shadow-sm border-slate-200 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-xl bg-red-50 text-[#C0262D] flex items-center justify-center text-xl mb-4">
                  <RocketOutlined />
                </div>
                <h3 className="font-extrabold text-[#0A1128] text-base mb-2">Air Cargo Express</h3>
                <p className="text-slate-500 text-xs leading-relaxed">
                  Fast 3–5 day express air shipping for urgent merchandise and high-value cargo with full customs clearance.
                </p>
              </Card>

              <Card className="shadow-sm border-slate-200 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl mb-4">
                  <GlobalOutlined />
                </div>
                <h3 className="font-extrabold text-[#0A1128] text-base mb-2">Sea Freight Cargo</h3>
                <p className="text-slate-500 text-xs leading-relaxed">
                  Economical LCL consolidation and FCL container shipping per CBM for commercial shipments.
                </p>
              </Card>

              <Card className="shadow-sm border-slate-200 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center text-xl mb-4">
                  <SwapOutlined />
                </div>
                <h3 className="font-extrabold text-[#0A1128] text-base mb-2">RMB Exchange</h3>
                <p className="text-slate-500 text-xs leading-relaxed">
                  Same-day currency exchange to pay Chinese suppliers directly in Yuan (RMB) at competitive market rates.
                </p>
              </Card>

              <Card className="shadow-sm border-slate-200 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-xl mb-4">
                  <ShoppingCartOutlined />
                </div>
                <h3 className="font-extrabold text-[#0A1128] text-base mb-2">Buy For Me</h3>
                <p className="text-slate-500 text-xs leading-relaxed">
                  We verify Chinese suppliers, negotiate prices on 1688, procure your items, and inspect before shipping.
                </p>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Strategic Hubs & Facilities */}
      <section className="py-20 bg-slate-100/70 border-y border-slate-200/80">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold text-[#C0262D] uppercase tracking-widest block mb-2">
              GLOBAL FOOTPRINT
            </span>
            <h2 className="text-3xl font-extrabold text-[#0A1128]">
              Our International Operational Warehouses
            </h2>
            <p className="text-slate-500 text-sm mt-2">
              Equipped with modern inventory tracking, barcode intake scanners, and security monitoring.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* China Hub */}
            <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm relative overflow-hidden">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-red-100 text-[#C0262D] flex items-center justify-center font-bold">
                  🇨🇳
                </div>
                <div>
                  <h3 className="font-extrabold text-[#0A1128] text-lg m-0">China Consolidation Hubs</h3>
                  <p className="text-xs text-slate-400 m-0">Guangzhou &amp; Yiwu Warehouses</p>
                </div>
              </div>
              <p className="text-slate-600 text-sm leading-relaxed mb-4">
                Located in Yiwu City (Chouzhou North Road) and Guangzhou, our warehouses accept packages from all Chinese domestic couriers 
                (SF Express, ZTO, Yunda, J&amp;T). We inspect, consolidate, and weigh goods before export.
              </p>
              <div className="text-xs font-bold text-[#0A1128] bg-slate-50 p-3 rounded-lg border border-slate-200">
                📍 Room 602, International Trade Mansion, Chouzhou North Rd, Yiwu, Zhejiang, China
              </div>
            </div>

            {/* Nigeria Hub */}
            <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm relative overflow-hidden">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  🇳🇬
                </div>
                <div>
                  <h3 className="font-extrabold text-[#0A1128] text-lg m-0">Nigeria Distribution Hubs</h3>
                  <p className="text-xs text-slate-400 m-0">Kano &amp; Lagos Distribution Centers</p>
                </div>
              </div>
              <p className="text-slate-600 text-sm leading-relaxed mb-4">
                Our main Nigeria pickup and dispatch facilities in Kano (Gwarzo Road) and Lagos ensure prompt customs clearance, 
                immediate customer notification, and nationwide doorstep delivery to all 36 states.
              </p>
              <div className="text-xs font-bold text-[#0A1128] bg-slate-50 p-3 rounded-lg border border-slate-200">
                📍 No. 08 Gwarzo Road Beside Shopwell, Gwale, Kano State, Nigeria
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Principles */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-3xl font-extrabold text-[#0A1128] mb-3">
              Why Merchants Trust HAMZA RMB GLOBAL
            </h2>
            <p className="text-slate-500 text-base">
              Built on transparency, speed, and absolute reliability for importers across Nigeria.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: <SafetyCertificateOutlined />,
                title: 'Cargo Safety',
                color: 'bg-red-50 text-[#C0262D]',
                desc: 'Zero-loss commitment with barcode tracking and photo verification at every warehouse handling stage.',
              },
              {
                icon: <BankOutlined />,
                title: 'Instant RMB Settlement',
                color: 'bg-purple-50 text-purple-600',
                desc: 'Direct payment to Chinese factories or sellers without banking delays or exchange blockages.',
              },
              {
                icon: <EnvironmentOutlined />,
                title: 'Live Tracking',
                color: 'bg-blue-50 text-blue-600',
                desc: '8-stage real-time visibility from China warehouse receipt to arrival in Nigeria.',
              },
              {
                icon: <TeamOutlined />,
                title: 'Dedicated Support',
                color: 'bg-emerald-50 text-emerald-600',
                desc: 'Bilingual support staff in Kano, Lagos, and China ready to assist with supplier communications.',
              },
            ].map((item, idx) => (
              <div key={idx} className="bg-slate-50 rounded-2xl p-6 border border-slate-200/80">
                <div className={`w-12 h-12 rounded-xl ${item.color} flex items-center justify-center text-xl mb-4 font-bold`}>
                  {item.icon}
                </div>
                <h3 className="font-extrabold text-[#0A1128] text-base mb-2">{item.title}</h3>
                <p className="text-slate-500 text-xs leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
