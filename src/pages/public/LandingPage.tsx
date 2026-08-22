import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { Button, Input, Form } from "antd";
import {
  SearchOutlined,
  SafetyCertificateOutlined,
  ThunderboltOutlined,
  CustomerServiceOutlined,
  ArrowRightOutlined,
  EnvironmentOutlined,
  GlobalOutlined,
} from "@ant-design/icons";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { fetchSettings } from "../../store/slices/settingsSlice";

export const LandingPage: React.FC = () => {
  const [form] = Form.useForm();
  const dispatch = useAppDispatch();
  const { settings } = useAppSelector((state) => state.settings);

  useEffect(() => {
    dispatch(fetchSettings());
  }, [dispatch]);

  const handleTrack = (values: { trackingNumber: string }) => {
    window.location.href = `/track?id=${values.trackingNumber}`;
  };

  return (
    <div className="flex flex-col">
      {/* Hero Section matching official Brand Mockup */}
      <section className="relative min-h-[600px] lg:min-h-[680px] flex items-center overflow-hidden bg-[#0A1B3A]">
        {/* Background Overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40 mix-blend-luminosity"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=1920&q=80')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0A1B3A] via-[#0A1B3A]/90 to-[#0A1B3A]/60" />

        <div className="container mx-auto px-4 relative z-10 py-16 lg:py-24">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#C0262D]/20 border border-[#C0262D]/40 rounded-full text-[#FF4D4D] text-xs font-extrabold uppercase tracking-wider mb-6">
              <span className="w-2 h-2 rounded-full bg-[#FF4D4D] animate-pulse" />
              HAMZA RMB GLOBAL • OFFICIAL PLATFORM
            </div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white leading-[1.05] mb-6 tracking-tight">
              Bridging China & Nigeria,
              <br />
              <span className="text-[#FF4D4D]">Connecting the World</span>
            </h1>

            <p className="text-slate-200 text-base md:text-lg leading-relaxed max-w-2xl mb-8 font-medium">
              Fast, Reliable & Secure Logistics Solutions:
              <br />
              <span className="text-white font-bold">Air Freight • Sea Freight • RMB Exchange • Buy For Me • Local Delivery</span>
            </p>

            {/* Tracking Search Bar */}
            <Form form={form} onFinish={handleTrack} className="mb-8">
              <div className="flex flex-col sm:flex-row items-stretch gap-0 max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden p-1.5">
                <Form.Item
                  name="trackingNumber"
                  noStyle
                  rules={[{ required: true, message: "" }]}
                >
                  <Input
                    size="large"
                    placeholder="Enter HZ Tracking ID or Chinese Domestic Waybill #..."
                    prefix={<SearchOutlined className="text-[#C0262D] mr-2 text-lg" />}
                    className="flex-1 !h-12 !border-0 !rounded-none !bg-transparent text-sm font-semibold"
                  />
                </Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  className="!bg-[#C0262D] hover:!bg-[#A01F25] !border-none !h-12 !px-8 font-bold text-sm !rounded-xl shrink-0"
                >
                  Track Shipment 📍
                </Button>
              </div>
            </Form>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-4">
              <Link to="/track">
                <Button
                  type="primary"
                  size="large"
                  className="!bg-[#C0262D] hover:!bg-[#A01F25] !border-none !h-12 !px-8 font-bold text-sm !rounded-xl shadow-lg"
                >
                  Track Shipment
                </Button>
              </Link>
              <Link to="/register">
                <Button
                  size="large"
                  className="!bg-white/10 hover:!bg-white/20 !text-white !border-white/30 !h-12 !px-8 font-bold text-sm !rounded-xl backdrop-blur-md"
                >
                  Create Account
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Trust Pillars Bar matching mockup */}
        <div className="absolute bottom-0 left-0 right-0 bg-white/10 backdrop-blur-md border-t border-white/10 hidden md:block">
          <div className="container mx-auto px-4 py-4">
            <div className="grid grid-cols-4 gap-6 text-white text-xs">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#C0262D]/30 border border-[#FF4D4D]/40 flex items-center justify-center text-base">🛡️</div>
                <div>
                  <div className="font-extrabold text-white">Safe & Secure</div>
                  <div className="text-[10px] text-slate-300">Your cargo is in safe hands</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#C0262D]/30 border border-[#FF4D4D]/40 flex items-center justify-center text-base">📍</div>
                <div>
                  <div className="font-extrabold text-white">Real-time Tracking</div>
                  <div className="text-[10px] text-slate-300">Track your shipment anytime</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#C0262D]/30 border border-[#FF4D4D]/40 flex items-center justify-center text-base">💰</div>
                <div>
                  <div className="font-extrabold text-white">Best Rates</div>
                  <div className="text-[10px] text-slate-300">Competitive pricing always</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#C0262D]/30 border border-[#FF4D4D]/40 flex items-center justify-center text-base">🎧</div>
                <div>
                  <div className="font-extrabold text-white">24/7 Support</div>
                  <div className="text-[10px] text-slate-300">We are here to help</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8-Stage Real-Time Cargo Pipeline Section */}
      <section className="py-12 bg-slate-900 text-white border-b border-slate-800">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <span className="text-brand-orange font-bold text-xs uppercase tracking-widest bg-brand-orange/10 px-3.5 py-1 rounded-full border border-brand-orange/20">
              Live Visibility Pipeline
            </span>
            <h2 className="text-2xl md:text-3xl font-extrabold text-white mt-2 mb-2">
              8-Step Real-Time Shipment Journey
            </h2>
            <p className="text-slate-400 text-sm">
              Track your goods at every single step from supplier dispatch in China to doorstep delivery in Nigeria without needing to call the office.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {[
              { step: '1', title: 'Order Received', desc: 'Pre-alert registered' },
              { step: '2', title: 'China Warehouse', desc: 'Weighed & measured' },
              { step: '3', title: 'Processing', desc: 'Consolidated & packed' },
              { step: '4', title: 'Shipped China', desc: 'Air flight / Sea vessel' },
              { step: '5', title: 'Arrived Nigeria', desc: 'Lagos / Kano hub' },
              { step: '6', title: 'Customs Clear', desc: 'Inspected & released' },
              { step: '7', title: 'Ready Delivery', desc: 'Sorted for pickup' },
              { step: '8', title: 'Delivered', desc: 'Received by client' },
            ].map((st, i) => (
              <div key={i} className="bg-white/5 border border-white/10 p-3.5 rounded-xl text-center hover:border-brand-orange/50 transition-all">
                <div className="w-7 h-7 rounded-full bg-brand-orange/20 text-brand-orange font-extrabold text-xs flex items-center justify-center mx-auto mb-2 border border-brand-orange/40">
                  {st.step}
                </div>
                <div className="font-extrabold text-xs text-white mb-1">{st.title}</div>
                <div className="text-[10px] text-slate-400 leading-tight">{st.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Grid (7 Core Services) */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-14">
            <div>
              <div className="text-brand-orange font-bold text-xs uppercase tracking-widest mb-1">
                Integrated Trade & Freight Solutions
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold text-brand-navy mb-3">
                Core Services — HAMZA RMB GLOBAL
              </h2>
              <p className="text-slate-500 text-base max-w-2xl">
                Specialized logistics, currency exchange, and procurement tailored specifically for China to Nigeria commerce.
              </p>
            </div>
            <Link
              to="/services"
              className="text-brand-orange font-bold text-sm flex items-center gap-1 hover:gap-2 transition-all"
            >
              Explore All Services <ArrowRightOutlined />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Air Freight */}
            <div className="group bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-xl hover:border-brand-orange transition-all duration-300">
              <div className="text-3xl mb-4">✈️</div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Air Freight</h3>
              <p className="text-slate-500 text-xs leading-relaxed mb-4">
                Express air cargo from Yiwu/Guangzhou to Nigeria (3–5 days delivery). Billed per KG.
              </p>
              <Link to="/services" className="text-brand-orange text-xs font-bold flex items-center gap-1">
                View Air Rates &rarr;
              </Link>
            </div>

            {/* Sea Freight */}
            <div className="group bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-xl hover:border-brand-orange transition-all duration-300">
              <div className="text-3xl mb-4">🚢</div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Sea Freight</h3>
              <p className="text-slate-500 text-xs leading-relaxed mb-4">
                Cost-effective LCL/FCL ocean shipping billed by CBM volume. Container tracking included.
              </p>
              <Link to="/services" className="text-brand-orange text-xs font-bold flex items-center gap-1">
                Calculate CBM &rarr;
              </Link>
            </div>

            {/* Cargo Consolidation */}
            <div className="group bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-xl hover:border-brand-orange transition-all duration-300">
              <div className="text-3xl mb-4">📦</div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Cargo Consolidation</h3>
              <p className="text-slate-500 text-xs leading-relaxed mb-4">
                Combine multiple supplier parcels into a single consolidated master batch to minimize shipping costs.
              </p>
              <Link to="/customer/consolidation" className="text-brand-orange text-xs font-bold flex items-center gap-1">
                Consolidate Packages &rarr;
              </Link>
            </div>

            {/* Buy For Me / Sourcing */}
            <div className="group bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-xl hover:border-brand-orange transition-all duration-300">
              <div className="text-3xl mb-4">🛒</div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Buy For Me / Sourcing</h3>
              <p className="text-slate-500 text-xs leading-relaxed mb-4">
                Send us product links from 1688, Taobao, or Alibaba. We handle supplier communication and procurement.
              </p>
              <Link to="/customer/buy-for-me" className="text-brand-orange text-xs font-bold flex items-center gap-1">
                Submit Request &rarr;
              </Link>
            </div>

            {/* RMB Exchange */}
            <div className="group bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-xl hover:border-brand-orange transition-all duration-300">
              <div className="text-3xl mb-4">💱</div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">RMB Exchange</h3>
              <p className="text-slate-500 text-xs leading-relaxed mb-4">
                Buy and sell Chinese Yuan (RMB) directly with instant Naira settlements and verified WeChat/Alipay transfers.
              </p>
              <Link to="/customer/exchange" className="text-brand-orange text-xs font-bold flex items-center gap-1">
                Check RMB Rate &rarr;
              </Link>
            </div>

            {/* Local Delivery */}
            <div className="group bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-xl hover:border-brand-orange transition-all duration-300">
              <div className="text-3xl mb-4">🚚</div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Local Delivery</h3>
              <p className="text-slate-500 text-xs leading-relaxed mb-4">
                Doorstep dispatch across Kano, Lagos, Abuja, and all 36 states upon customs clearance.
              </p>
              <Link to="/customer/delivery" className="text-brand-orange text-xs font-bold flex items-center gap-1">
                Arrange Dispatch &rarr;
              </Link>
            </div>

            {/* Shipment Tracking */}
            <div className="group bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-xl hover:border-brand-orange transition-all duration-300 md:col-span-2">
              <div className="text-3xl mb-4">📍</div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Shipment Tracking</h3>
              <p className="text-slate-500 text-xs leading-relaxed mb-4">
                Real-time tracking system supporting both HZ IDs and domestic Chinese courier numbers (SF Express, ZTO, Yunda, STO).
              </p>
              <Link to="/track" className="text-brand-orange text-xs font-bold flex items-center gap-1">
                Track Package Now &rarr;
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Unmatched Global Reach */}
      <section className="py-20 lg:py-28 bg-brand-navy text-white overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold mb-6">
                Unmatched Global Reach
              </h2>
              <p className="text-slate-400 text-lg leading-relaxed mb-10 max-w-lg">
                Operating in over 150 countries with a synchronized network of
                warehouses, ports, and transport hubs to ensure seamless
                delivery.
              </p>

              <div className="grid grid-cols-2 gap-x-8 gap-y-6 mb-10">
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider font-medium mb-1">
                    Operations In
                  </p>
                  <p className="text-3xl font-bold text-white">
                    150+{" "}
                    <span className="text-base font-normal text-slate-400">
                      Countries
                    </span>
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider font-medium mb-1">
                    Annual Volume
                  </p>
                  <p className="text-3xl font-bold text-white">
                    2.4M{" "}
                    <span className="text-base font-normal text-slate-400">
                      TEUs
                    </span>
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider font-medium mb-1">
                    On-Time Delivery
                  </p>
                  <p className="text-3xl font-bold text-white">
                    99.2%{" "}
                    <span className="text-base font-normal text-slate-400">
                      Rate
                    </span>
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider font-medium mb-1">
                    Dedicated Fleet
                  </p>
                  <p className="text-3xl font-bold text-white">
                    4,500{" "}
                    <span className="text-base font-normal text-slate-400">
                      Vehicles
                    </span>
                  </p>
                </div>
              </div>

              <Link to="/services">
                <Button
                  ghost
                  size="large"
                  className="!text-white !border-slate-600 hover:!border-white !h-11 !px-6 !rounded-lg font-medium"
                >
                  View Network Map
                </Button>
              </Link>
            </div>

            {/* Map / Visual Placeholder */}
            <div className="relative">
              <div className="bg-slate-800/50 border border-slate-700 rounded-2xl aspect-[4/3] flex items-center justify-center overflow-hidden">
                <div className="text-center">
                  <GlobalOutlined className="text-5xl text-slate-600 mb-3" />
                  <p className="text-slate-500 text-sm">
                    Global Network Visualization
                  </p>
                </div>
                {/* Live indicator */}
                <div className="absolute bottom-4 right-4 flex items-center gap-2 bg-slate-900/80 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-slate-700">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse-slow" />
                  <span className="text-xs text-slate-300 font-medium">
                    Live Tracking Active
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Engineered for Reliability */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-3xl lg:text-4xl font-bold text-brand-navy mb-4">
              Engineered for Reliability
            </h2>
            <p className="text-slate-500 text-lg">
              We combine cutting-edge technology with decades of operational
              expertise to de-risk your supply chain.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Secure Handling */}
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center hover:shadow-lg transition-shadow duration-300">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-brand-orange/10 flex items-center justify-center mb-6">
                <SafetyCertificateOutlined className="text-3xl text-brand-orange" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-3">
                Secure Handling
              </h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                Military-grade protocols and 24/7 surveillance ensure your cargo
                is protected at every touchpoint.
              </p>
            </div>

            {/* Expedited Routing */}
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center hover:shadow-lg transition-shadow duration-300">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-brand-orange/10 flex items-center justify-center mb-6">
                <ThunderboltOutlined className="text-3xl text-brand-orange" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-3">
                Expedited Routing
              </h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                Proprietary AI algorithms dynamically optimize routes to bypass
                bottlenecks and reduce transit times.
              </p>
            </div>

            {/* Dedicated Support */}
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center hover:shadow-lg transition-shadow duration-300">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-brand-orange/10 flex items-center justify-center mb-6">
                <CustomerServiceOutlined className="text-3xl text-brand-orange" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-3">
                Dedicated Support
              </h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                Assigned logistics specialists monitor your high-value shipments
                and provide proactive communication.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Global Offices & Operational Contacts Section */}
      <section className="py-20 bg-slate-900 text-white relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-brand-orange font-bold text-xs tracking-wider uppercase bg-brand-orange/10 px-4 py-1.5 rounded-full border border-brand-orange/20">
              Worldwide Footprint
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold mt-4 mb-4 text-white">
              Global Air Cargo & Local Distribution Hubs
            </h2>
            <p className="text-slate-400 text-base leading-relaxed">
              Serving trade corridors between China and Nigeria with registered air cargo receiving facilities and dedicated local support teams.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* China Air Hub Card */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-sm">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-blue-500/20 text-blue-400 font-bold text-xs uppercase mb-4">
                ✈️ China Air Cargo Hub
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                Yiwu Freight Receiving Center
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed mb-4">
                {settings?.chinaAirCargoAddressEn || 'Room 602, International Trade Mansion, Chouzhou North Road, Yiwu City, Jinhua City, Zhejiang Province, China'}
              </p>
              <div className="text-slate-400 text-xs font-mono mb-2">
                Chinese: {settings?.chinaAirCargoAddressCn || '义乌市稠州北路国贸大厦6楼602'}
              </div>
              <div className="text-brand-orange font-bold text-sm">
                Tel: {settings?.chinaAirCargoPhone || '+86 158 6890 7118'}
              </div>
            </div>

            {/* Nigeria Kano Office Card */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-sm">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-emerald-500/20 text-emerald-400 font-bold text-xs uppercase mb-4">
                🇳🇬 Nigeria Office & Distribution
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                Kano Headquarters
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed mb-6">
                {settings?.nigeriaOfficeAddress || 'No. 08 Gwarzo Road Beside Shopwell, Gwale Kano State, Nigeria'}
              </p>
              <div className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-2">
                Direct Representatives
              </div>
              <div className="flex flex-wrap gap-2">
                {(() => {
                  try {
                    const list = settings?.companyContacts ? JSON.parse(settings.companyContacts) : [];
                    return list.slice(0, 4).map((c: any, i: number) => (
                      <a
                        key={i}
                        href={`https://wa.me/${c.phone.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 px-3 py-1 rounded-lg text-xs font-semibold hover:bg-emerald-500/20 transition-colors"
                      >
                        {c.name}: {c.phone}
                      </a>
                    ));
                  } catch {
                    return null;
                  }
                })()}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
