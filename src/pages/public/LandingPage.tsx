import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { Button, Input, Form } from "antd";
import {
  SearchOutlined,
  UserAddOutlined,
  ArrowRightOutlined,
  CheckCircleFilled,
} from "@ant-design/icons";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { fetchSettings } from "../../store/slices/settingsSlice";
import { ServicesCarousel } from "../../components/common/ServicesCarousel";

export const LandingPage: React.FC = () => {
  const [form] = Form.useForm();
  const dispatch = useAppDispatch();
  const { settings } = useAppSelector((state) => state.settings);

  useEffect(() => {
    dispatch(fetchSettings());
  }, [dispatch]);

  const handleTrack = (values: { trackingNumber: string }) => {
    if (!values.trackingNumber) return;
    window.location.href = `/track?id=${encodeURIComponent(values.trackingNumber.trim())}`;
  };

  const servicesData = [
    {
      id: "air-freight",
      title: "Express Air Freight",
      subtitle: "Yiwu & Guangzhou ➔ Kano & Lagos",
      badge: "3–5 DAYS EXPRESS",
      badgeBg: "bg-[#C0262D] text-white shadow-lg shadow-red-950/50",
      image: "/services/air-freight-new.jpg",
      desc: "Fast express air cargo dispatch from our Guangzhou and Yiwu receiving hubs directly to Kano & Lagos airports with full customs clearance included.",
      features: [
        "Departs 3x weekly from China",
        "Includes full customs duty clearance",
        "Direct warehouse dispatch upon arrival",
      ],
      ctaText: "Calculate Air Freight Quote",
      ctaLink: "/get-quote",
    },
    {
      id: "sea-freight",
      title: "Sea Freight (CBM & FCL)",
      subtitle: "Bulk Maritime Transport",
      badge: "COST-EFFECTIVE CBM",
      badgeBg: "bg-blue-600 text-white shadow-lg shadow-blue-950/50",
      image: "/services/sea-freight-new.jpg",
      desc: "High-volume ocean shipping billed per CBM (volume). LCL groupage consolidation and 20ft/40ft full container loading to Lagos ports.",
      features: [
        "Flexible CBM volume billing",
        "Full container & LCL groupage",
        "Port clearance & inland transfer",
      ],
      ctaText: "Calculate Sea Freight Quote",
      ctaLink: "/get-quote",
    },
    {
      id: "buy-for-me",
      title: "Buy For Me / Sourcing",
      subtitle: "1688, Taobao & Factory Sourcing",
      badge: "SUPPLIER PROCUREMENT",
      badgeBg: "bg-amber-500 text-slate-950 font-black shadow-lg shadow-amber-950/50",
      image: "/services/buy-for-me-new.jpg",
      desc: "Can't pay Chinese suppliers? Send product links from 1688 or Taobao. We verify suppliers, negotiate prices, pay in RMB, and procure your items.",
      features: [
        "Supplier verification & inspection",
        "Pay Naira, we pay seller in Yuan 🇨🇳",
        "Physical item photo proof",
      ],
      ctaText: "Submit Sourcing Link",
      ctaLink: "/customer/buy-for-me",
    },
    {
      id: "rmb-exchange",
      title: "RMB Currency Exchange",
      subtitle: "Fast Supplier Payments in Yuan",
      badge: "SAME-DAY SETTLEMENT",
      badgeBg: "bg-purple-600 text-white shadow-lg shadow-purple-950/50",
      image: "/services/express-delivery.jpg",
      desc: "Fast, secure Chinese Yuan (RMB) currency exchange. Transfer Naira to pay your Chinese suppliers via Alipay, WeChat Pay, or UnionPay banks.",
      features: [
        "Direct Alipay & WeChat transfers",
        "Transparent daily Yuan rates",
        "Instant payment proof receipt",
      ],
      ctaText: "Exchange RMB Now",
      ctaLink: "/customer/exchange",
    },
    {
      id: "cargo-consolidation",
      title: "Cargo Consolidation",
      subtitle: "Save Up to 40% Shipping Fees",
      badge: "FREE 30-DAY STORAGE",
      badgeBg: "bg-indigo-600 text-white shadow-lg shadow-indigo-950/50",
      image: "/services/cargo-consolidation-new.jpg",
      desc: "Combine parcels from different suppliers into one master shipment. We strip excess packaging, reducing volumetric shipping costs significantly.",
      features: [
        "Yiwu & Guangzhou intake logging",
        "Repackaging & volume minimization",
        "Unified single tracking ID",
      ],
      ctaText: "Start Consolidating",
      ctaLink: "/customer/consolidation",
    },
    {
      id: "local-delivery",
      title: "Local Nigeria Delivery",
      subtitle: "Kano, Lagos & 36 States",
      badge: "NIGERIA DISPATCH",
      badgeBg: "bg-emerald-600 text-white shadow-lg shadow-emerald-950/50",
      image: "/services/local-delivery.jpg",
      desc: "Self-pickup at our Kano (Gwarzo Road) or Lagos hubs, or request door-to-door delivery and waybill dispatch across all 36 states in Nigeria.",
      features: [
        "Kano & Lagos central warehouses",
        "Nationwide interstate dispatch",
        "Real-time delivery SMS/WhatsApp alerts",
      ],
      ctaText: "Request Doorstep Delivery",
      ctaLink: "/customer/delivery",
    },
  ];

  return (
    <div className="flex flex-col font-sans">
      {/* Services Carousel Showcase */}
      <ServicesCarousel />

      {/* Hero Section */}
      <section className="relative py-16 md:py-24 lg:py-28 overflow-hidden bg-[#0A1B3A]">
        {/* Background Overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-50 transition-opacity duration-700"
          style={{
            backgroundImage: "url('/hero-bg.jpg')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A1B3A]/80 via-[#0A1B3A]/90 to-[#0A1B3A]" />

        <div className="container mx-auto px-4 relative z-10 text-center">
          <div className="max-w-4xl mx-auto flex flex-col items-center">
            {/* Tagline Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#C0262D]/20 border border-[#C0262D]/40 rounded-full text-[#FF4D4D] text-xs font-black uppercase tracking-widest mb-6">
              <span className="w-2 h-2 rounded-full bg-[#FF4D4D] animate-pulse" />
              CHINA ➔ NIGERIA DEDICATED FREIGHT &amp; RMB TRADE
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white leading-[1.08] mb-6 tracking-tight">
              Bridging China &amp; Nigeria,
              <br />
              <span className="text-[#FF4D4D]">Connecting the World</span>
            </h1>

            {/* Quick Description */}
            <p className="text-slate-300 text-base md:text-lg leading-relaxed max-w-2xl mx-auto mb-10 font-medium">
              Your direct logistics bridge between China (Yiwu &amp; Guangzhou) and Nigeria (Kano &amp; Lagos). Express air cargo, ocean CBM freight, supplier procurement on 1688, and instant Yuan currency exchange.
            </p>

            {/* Hero Interactive Image Cards Showcase */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 w-full max-w-5xl mb-10 text-left">
              {servicesData.map((s) => (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  className="group relative rounded-2xl overflow-hidden border border-white/30 h-32 sm:h-36 block shadow-2xl transition-all duration-300 hover:scale-105 hover:border-[#FF4D4D] hover:shadow-red-600/30"
                >
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110 opacity-70"
                    style={{ backgroundImage: `url('${s.image}')` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3 z-10">
                    <span className="text-[9px] font-black text-[#FF4D4D] uppercase tracking-wider block mb-0.5 drop-shadow">
                      {s.badge}
                    </span>
                    <h4 className="text-white font-black text-xs sm:text-sm leading-tight m-0 drop-shadow">
                      {s.title}
                    </h4>
                  </div>
                </a>
              ))}
            </div>

            {/* Tracking Search Input Bar */}
            <Form form={form} onFinish={handleTrack} className="w-full max-w-xl mx-auto mb-12 md:mb-14">
              <div className="flex flex-col sm:flex-row items-stretch gap-2 bg-white p-2 rounded-2xl shadow-2xl border border-slate-200 m-4">
                <Form.Item
                  name="trackingNumber"
                  noStyle
                  rules={[{ required: true, message: "Please enter your tracking number" }]}
                >
                  <Input
                    size="large"
                    placeholder="Enter HZ Tracking ID or Chinese Courier Waybill #..."
                    prefix={<SearchOutlined className="text-[#C0262D] mr-2 text-xl" />}
                    className="flex-1 !h-12 !border-0 !bg-transparent text-sm font-semibold text-slate-800"
                  />
                </Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  className="!bg-[#C0262D] hover:!bg-[#A01F25] !border-none !h-12 !px-8 font-black text-sm uppercase tracking-wider !rounded-xl shrink-0 shadow-lg"
                >
                  Track Shipment 📍
                </Button>
              </div>
            </Form>

            {/* Hero Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link to="/services">
                <Button
                  type="primary"
                  size="large"
                  className="!bg-[#C0262D] hover:!bg-[#A01F25] !border-none !h-13 !px-8 font-extrabold text-sm !rounded-xl shadow-xl shadow-red-950/40 flex items-center gap-2"
                  icon={<ArrowRightOutlined />}
                  iconPlacement="end"
                >
                  Explore All Services
                </Button>
              </Link>
              <Link to="/register">
                <Button
                  size="large"
                  className="!bg-white hover:!bg-slate-100 !text-[#0A1B3A] !border-none !h-13 !px-8 font-extrabold text-sm !rounded-xl shadow-xl flex items-center gap-2"
                  icon={<UserAddOutlined />}
                >
                  Create Free Account
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Trust Pillars Bar */}
        <div className="mt-16 bg-white/5 backdrop-blur-md border-t border-white/10 hidden md:block">
          <div className="container mx-auto px-4 py-5">
            <div className="grid grid-cols-4 gap-6 text-white text-xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#C0262D]/30 border border-[#FF4D4D]/40 flex items-center justify-center text-lg">🛡️</div>
                <div>
                  <div className="font-extrabold text-white">Safe &amp; Guaranteed</div>
                  <div className="text-[11px] text-slate-300">Zero-loss cargo handling</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#C0262D]/30 border border-[#FF4D4D]/40 flex items-center justify-center text-lg">📍</div>
                <div>
                  <div className="font-extrabold text-white">8-Stage Live Tracking</div>
                  <div className="text-[11px] text-slate-300">From China Hub to Doorstep</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#C0262D]/30 border border-[#FF4D4D]/40 flex items-center justify-center text-lg">💰</div>
                <div>
                  <div className="font-extrabold text-white">Same-Day RMB Rate</div>
                  <div className="text-[11px] text-slate-300">Direct Yuan 🇨🇳 settlements</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#C0262D]/30 border border-[#FF4D4D]/40 flex items-center justify-center text-lg">🚚</div>
                <div>
                  <div className="font-extrabold text-white">36 States Delivery</div>
                  <div className="text-[11px] text-slate-300">Kano &amp; Lagos Distribution</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8-Stage Real-Time Cargo Pipeline Section */}
      <section className="py-16 bg-[#0A1B3A] text-white border-b border-slate-800">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-[#FF4D4D] font-bold text-xs uppercase tracking-widest bg-[#C0262D]/20 px-3.5 py-1 rounded-full border border-[#C0262D]/40">
              Live Visibility Pipeline
            </span>
            <h2 className="text-2xl md:text-4xl font-black text-white mt-3 mb-2">
              8-Step Real-Time Shipment Journey
            </h2>
            <p className="text-slate-300 text-sm">
              Track your cargo at every stage from supplier dispatch in China to doorstep delivery in Nigeria.
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
              <div key={i} className="bg-white/5 border border-white/10 p-4 rounded-xl text-center hover:border-[#FF4D4D] transition-all">
                <div className="w-8 h-8 rounded-full bg-[#C0262D]/30 text-[#FF4D4D] font-black text-sm flex items-center justify-center mx-auto mb-2 border border-[#FF4D4D]/40">
                  {st.step}
                </div>
                <div className="font-extrabold text-xs text-white mb-1">{st.title}</div>
                <div className="text-[10px] text-slate-400 leading-tight">{st.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Warehouses & Representatives Section (Strictly China & Nigeria ONLY) */}
      <section className="py-20 bg-slate-950 text-white relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-[#FF4D4D] font-bold text-xs tracking-widest uppercase bg-[#C0262D]/20 px-4 py-1.5 rounded-full border border-[#C0262D]/40">
              OUR OFFICES &amp; WAREHOUSES
            </span>
            <h2 className="text-3xl md:text-4xl font-black mt-4 mb-4 text-white">
              China &amp; Nigeria Operational Hubs
            </h2>
            <p className="text-slate-300 text-base leading-relaxed">
              We operate exclusively on the China ➔ Nigeria trade corridor with receiving warehouses in China and distribution facilities in Nigeria.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* China Hub Card */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-sm">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-blue-500/20 text-blue-400 font-bold text-xs uppercase mb-4">
                🇨🇳 China Receiving Hubs
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                Guangzhou &amp; Yiwu Warehouses
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed mb-4">
                {settings?.chinaAirCargoAddressEn || 'Room 602, International Trade Mansion, Chouzhou North Road, Yiwu City, Zhejiang Province, China'}
              </p>
              <div className="text-slate-400 text-xs font-mono mb-3">
                Address (Chinese): {settings?.chinaAirCargoAddressCn || '义乌市稠州北路国贸大厦6楼602'}
              </div>
              <div className="text-[#FF4D4D] font-bold text-sm">
                Tel: {settings?.chinaAirCargoPhone || '+86 158 6890 7118'}
              </div>
            </div>

            {/* Nigeria Kano Office Card */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-sm">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-emerald-500/20 text-emerald-400 font-bold text-xs uppercase mb-4">
                🇳🇬 Nigeria Distribution Hubs
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                Kano &amp; Lagos Distribution Centers
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed mb-6">
                {settings?.nigeriaOfficeAddress || 'No. 08 Gwarzo Road Beside Shopwell, Gwale Kano State, Nigeria'}
              </p>
              <div className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-2">
                Direct WhatsApp Representatives
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

export default LandingPage;
