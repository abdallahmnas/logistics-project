import React from 'react';
import { Link } from 'react-router-dom';
import { Button, Tag, Card } from 'antd';
import {
  RocketOutlined,
  GlobalOutlined,
  SwapOutlined,
  ShoppingCartOutlined,
  CarOutlined,
  ArrowRightOutlined,
  CheckCircleOutlined,
  SafetyCertificateOutlined,
  CompressOutlined,
} from '@ant-design/icons';

export const ServicesPage: React.FC = () => {
  const servicesList = [
    {
      id: 'air-freight',
      icon: <RocketOutlined />,
      iconBg: 'bg-red-50 text-[#C0262D]',
      title: '✈️ Express Air Freight',
      badge: '3–5 DAYS EXPRESS',
      badgeColor: 'bg-red-600',
      tagline: 'Rapid air cargo transport from Guangzhou & Yiwu directly to Kano & Lagos.',
      description:
        'Our express air cargo service is engineered for time-critical goods, high-value electronics, fashion items, and urgent merchant inventory. Packages delivered to our China warehouses are weighed, tagged, custom-cleared, and dispatched on scheduled flights to Nigeria.',
      features: [
        'Transit time: 3 to 5 business days',
        'Departure hubs: Guangzhou & Yiwu Warehouses',
        'Includes full customs clearance & documentation',
        'Automated weight-based billing with competitive rates',
        'SMS & WhatsApp status alerts upon arrival in Kano/Lagos',
      ],
      ctaText: 'Calculate',
      ctaLink: '/get-quote',
    },
    {
      id: 'sea-freight',
      icon: <GlobalOutlined />,
      iconBg: 'bg-blue-50 text-blue-600',
      title: '🚢 Sea Freight (CBM & Containers)',
      badge: 'COST-EFFECTIVE BULK',
      badgeColor: 'bg-blue-600',
      tagline: 'Economical maritime shipping per CBM for heavy goods and bulk commercial cargo.',
      description:
        'Ideal for large machinery, building materials, commercial stock, and heavy merchandise. We offer both LCL (Less than Container Load) groupage consolidation and dedicated FCL (Full Container Load) shipping with customs clearance at Lagos ports.',
      features: [
        'Transit time: 30 to 45 days',
        'Flexible CBM billing (Minimum 0.1 CBM)',
        'LCL consolidation & 20ft / 40ft FCL options',
        'Complete port clearance and transport to inland depots',
        'Secure container loading with photo logs',
      ],
      ctaText: 'Calculate',
      ctaLink: '/get-quote',
    },
    {
      id: 'consolidation',
      icon: <CompressOutlined />,
      iconBg: 'bg-indigo-50 text-indigo-600',
      title: '📦 Cargo Consolidation',
      badge: 'SAVE UP TO 40%',
      badgeColor: 'bg-indigo-600',
      tagline: 'Combine multiple packages from different suppliers into one single shipment.',
      description:
        'Buying from multiple 1688, Taobao, or WeChat suppliers? Send all your packages to our Yiwu or Guangzhou warehouse. We hold your items free for up to 30 days, strip redundant packaging, combine them into one parcel, and significantly reduce your shipping fees.',
      features: [
        'Free 30-day warehouse storage in China',
        'Barcode scanning & pre-alert intake logging',
        'Unboxing & volumetric weight minimization',
        'Item inspection & damage check before consolidation',
        'Unified single tracking ID for all combined items',
      ],
      ctaText: 'Start Consolidating',
      ctaLink: '/customer/consolidation',
    },
    {
      id: 'buy-for-me',
      icon: <ShoppingCartOutlined />,
      iconBg: 'bg-amber-50 text-amber-600',
      title: '🛒 Buy For Me / China Sourcing',
      badge: 'SUPPLIER PROCUREMENT',
      badgeColor: 'bg-amber-600',
      tagline: 'We source, negotiate, purchase, and inspect products from Chinese factories on your behalf.',
      description:
        'Have a product link from 1688.com, Taobao, or a factory contact? Send it to us! Our bilingual sourcing team in China contacts the supplier, verifies product authenticity, negotiates wholesale pricing, pays the seller in RMB, and receives the goods at our hub.',
      features: [
        'Direct purchasing from 1688, Taobao, & WeChat suppliers',
        'Supplier verification & scam protection',
        'Product quality check & physical photo verification',
        'Hassle-free Naira payment for RMB purchase',
        'Seamless integration into your shipping dashboard',
      ],
      ctaText: 'Submit Procurement Request',
      ctaLink: '/customer/buy-for-me',
    },
    {
      id: 'rmb-exchange',
      icon: <SwapOutlined />,
      iconBg: 'bg-purple-50 text-purple-600',
      title: '💱 RMB Currency Exchange & Supplier Transfer',
      badge: 'SAME-DAY SETTLEMENT',
      badgeColor: 'bg-purple-600',
      tagline: 'Fast, secure Yuan (RMB) currency exchange and direct supplier payments.',
      description:
        'Eliminate bank delays and dollar currency barriers. Transfer Naira to our Nigerian account and we instantly credit your Chinese supplier’s Alipay, WeChat Pay, or Chinese Bank account in Yuan (RMB) at competitive daily market rates.',
      features: [
        'Direct Alipay, WeChat Pay, & UnionPay bank transfers',
        'Competitive daily exchange rates with zero hidden fees',
        'Instant payment proof receipt provided for your supplier',
        'Secure wallet system on your customer dashboard',
        'Supports both small supplier payments and bulk trade settlements',
      ],
      ctaText: 'Check Live Exchange Rates',
      ctaLink: '/customer/exchange',
    },
    {
      id: 'local-delivery',
      icon: <CarOutlined />,
      iconBg: 'bg-emerald-50 text-emerald-600',
      title: '🚚 Local Doorstep Delivery & Hub Pickup',
      badge: 'NIGERIA-WIDE DISPATCH',
      badgeColor: 'bg-emerald-600',
      tagline: 'Pickup from Kano / Lagos hubs or request doorstep delivery across Nigeria.',
      description:
        'Once your goods arrive at our Kano (Gwarzo Road) or Lagos distribution centers, you can either pick them up directly or request doorstep dispatch via our local delivery network to any city across all 36 states.',
      features: [
        'Self-pickup from Kano & Lagos central hubs',
        'Doorstep dispatch to Abuja, Port Harcourt, Kaduna, Ibadan, etc.',
        'Waybill dispatch via interstate transport lines',
        'Real-time delivery status updates',
        'Flexible payment options upon pickup/delivery confirmation',
      ],
      ctaText: 'Request Local Dispatch',
      ctaLink: '/customer/local-delivery',
    },
  ];

  return (
    <div className="flex flex-col bg-slate-50">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-24 bg-[#0A1128] text-white overflow-hidden">
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#C0262D_1px,transparent_1px)] [background-size:16px_16px]" />
        <div className="container mx-auto px-4 relative z-10 text-center">
          <Tag className="bg-[#C0262D] border-none text-white font-bold text-xs uppercase tracking-widest px-3 py-1 rounded-full mb-6">
            OUR CORE SERVICES
          </Tag>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-6 max-w-4xl mx-auto">
            Comprehensive Trade &amp; Freight Solutions
            <br />
            <span className="text-brand-orange">China ➔ Nigeria</span>
          </h1>
          <p className="text-slate-300 text-base md:text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
            From package consolidation in Yiwu &amp; Guangzhou to air cargo, sea freight, RMB supplier payments, and doorstep delivery across Nigeria.
          </p>
          <Link to="/get-quote">
            <Button
              type="primary"
              size="large"
              className="!bg-[#C0262D] hover:!bg-[#A01F25] !border-none !h-12 !px-8 !rounded-lg font-bold shadow-lg"
              icon={<ArrowRightOutlined />}
              iconPlacement="end"
            >
              Get Instant Shipping Quote
            </Button>
          </Link>
        </div>
      </section>

      {/* Main Services Grid */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold text-[#C0262D] uppercase tracking-widest block mb-2">
              WHAT WE DO
            </span>
            <h2 className="text-3xl font-extrabold text-[#0A1128]">
              End-to-End Solutions for Importers &amp; Merchants
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {servicesList.map((service) => (
              <Card
                key={service.id}
                id={service.id}
                className="rounded-2xl border-slate-200 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between"
                bodyStyle={{ padding: '28px' }}
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className={`w-12 h-12 rounded-xl ${service.iconBg} flex items-center justify-center text-2xl font-bold`}>
                      {service.icon}
                    </div>
                    <span className={`text-[10px] font-bold text-white px-2.5 py-1 rounded-full uppercase tracking-wider ${service.badgeColor}`}>
                      {service.badge}
                    </span>
                  </div>

                  <h3 className="text-xl font-extrabold text-[#0A1128] mb-2">
                    {service.title}
                  </h3>
                  <p className="text-xs font-bold text-brand-orange mb-4">
                    {service.tagline}
                  </p>
                  <p className="text-slate-600 text-xs leading-relaxed mb-6">
                    {service.description}
                  </p>

                  <div className="space-y-2 mb-8 pt-4 border-t border-slate-100">
                    {service.features.map((feat, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs">
                        <CheckCircleOutlined className="text-emerald-500 mt-0.5 shrink-0" />
                        <span className="text-slate-700 font-medium">{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <Link to={service.ctaLink} className="block w-full mt-auto">
                  <Button
                    block
                    type="primary"
                    className="!bg-[#0A1128] hover:!bg-[#1a2542] !border-none font-bold h-10 rounded-lg text-xs"
                    icon={<ArrowRightOutlined />}
                    iconPlacement="end"
                  >
                    {service.ctaText}
                  </Button>
                </Link>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How the Process Works */}
      <section className="py-20 bg-slate-100/80 border-t border-slate-200/80">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold text-[#C0262D] uppercase tracking-widest block mb-2">
              SIMPLE 4-STEP WORKFLOW
            </span>
            <h2 className="text-3xl font-extrabold text-[#0A1128]">
              How Shipping Works with HAMZA RMB GLOBAL
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                step: '01',
                title: 'Send Goods to China Hub',
                desc: 'Use our Yiwu or Guangzhou warehouse address as your delivery address when buying on 1688 / Taobao.',
              },
              {
                step: '02',
                title: 'Intake & Consolidation',
                desc: 'We log your tracking number, inspect items, take photos, and combine packages to minimize shipping weight.',
              },
              {
                step: '03',
                title: 'Air / Sea Freight Export',
                desc: 'Your cargo is shipped via Express Air (3-5 days) or Sea Freight with full customs clearance included.',
              },
              {
                step: '04',
                title: 'Arrival & Nigeria Dispatch',
                desc: 'Pick up your package at our Kano (Gwarzo Road) or Lagos hub, or request doorstep delivery to any state.',
              },
            ].map((st, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm relative">
                <div className="text-4xl font-extrabold text-[#C0262D]/20 mb-3">{st.step}</div>
                <h3 className="font-extrabold text-[#0A1128] text-base mb-2">{st.title}</h3>
                <p className="text-slate-500 text-xs leading-relaxed">{st.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default ServicesPage;
