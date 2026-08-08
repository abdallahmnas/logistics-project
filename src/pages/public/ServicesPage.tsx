import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from 'antd';
import {
  GlobalOutlined,
  RocketOutlined,
  CarOutlined,
  ArrowRightOutlined,
  SafetyCertificateOutlined,
  HeartOutlined,
  BulbOutlined,
  TeamOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';

export const ServicesPage: React.FC = () => {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative py-16 lg:py-24 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=1920&q=80')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-brand-navy/90 via-brand-navy/80 to-brand-navy/95" />

        <div className="container mx-auto px-4 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 border border-white/20 rounded-full text-white text-xs font-semibold uppercase tracking-wider mb-6 backdrop-blur-sm">
            Our Services
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-[1.1] mb-6 max-w-3xl mx-auto">
            Connecting the World,
            <br />
            <span className="text-brand-orange">One Shipment at a Time</span>
          </h1>

          <p className="text-slate-300 text-lg max-w-2xl mx-auto mb-10">
            We engineer reliability into global supply chains. From industrial
            freight to sensitive parcel delivery, our network guarantees
            precision at global scale.
          </p>

          <Link to="/get-quote">
            <Button
              type="primary"
              size="large"
              className="!bg-brand-orange hover:!bg-orange-600 !border-brand-orange hover:!border-orange-600 !h-12 !px-8 !rounded-lg font-semibold shadow-lg shadow-orange-900/30"
              icon={<ArrowRightOutlined />}
              iconPlacement="end"
            >
              View Network Map
            </Button>
          </Link>

          {/* Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto mt-14">
            <div className="bg-white rounded-2xl p-6 text-center shadow-xl">
              <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-brand-navy/5 flex items-center justify-center">
                <GlobalOutlined className="text-lg text-brand-navy" />
              </div>
              <p className="text-3xl font-bold text-brand-navy">150+</p>
              <p className="text-xs text-slate-500 uppercase tracking-wider font-medium mt-1">
                Countries Served
              </p>
            </div>
            <div className="bg-white rounded-2xl p-6 text-center shadow-xl">
              <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-brand-orange/10 flex items-center justify-center">
                <RocketOutlined className="text-lg text-brand-orange" />
              </div>
              <p className="text-3xl font-bold text-brand-navy">500+</p>
              <p className="text-xs text-slate-500 uppercase tracking-wider font-medium mt-1">
                Logistics Hubs
              </p>
            </div>
            <div className="bg-white rounded-2xl p-6 text-center shadow-xl">
              <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-brand-navy/5 flex items-center justify-center">
                <ThunderboltOutlined className="text-lg text-brand-navy" />
              </div>
              <p className="text-3xl font-bold text-brand-navy">24/7</p>
              <p className="text-xs text-slate-500 uppercase tracking-wider font-medium mt-1">
                Active Operations
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Multi-Modal Fleet Capability */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="container mx-auto px-4">
          <p className="text-xs text-brand-orange uppercase tracking-widest font-semibold mb-2">
            Industrial Precision
          </p>
          <h2 className="text-3xl lg:text-4xl font-bold text-brand-navy mb-4">
            Multi-Modal Fleet Capability
          </h2>
          <p className="text-slate-500 text-lg max-w-2xl mb-14">
            Our diverse fleet ensures we can handle any cargo, anywhere, at any
            time. Seamless integration between air, sea, and land transport
            provides unmatched end-to-end visibility.
          </p>

          {/* Image Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Air Freight - large */}
            <div className="md:col-span-2 md:row-span-2 relative rounded-2xl overflow-hidden group min-h-[300px] md:min-h-[420px]">
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                style={{
                  backgroundImage:
                    "url('https://images.unsplash.com/photo-1583202429192-a93ac1d8de24?w=800&q=80')",
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <div className="flex items-center gap-2 text-white mb-2">
                  <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <RocketOutlined className="text-sm" />
                  </div>
                  <span className="text-lg font-bold">
                    Air Freight Network
                  </span>
                </div>
                <p className="text-white/70 text-sm">
                  Next-day global delivery utilizing our dedicated fleet of 50+
                  wide-body freighters.
                </p>
              </div>
            </div>

            {/* Ocean Logistics */}
            <div className="relative rounded-2xl overflow-hidden group min-h-[200px]">
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                style={{
                  backgroundImage:
                    "url('https://images.unsplash.com/photo-1494412574643-ff11b0a5eb19?w=600&q=80')",
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <div className="flex items-center gap-2 text-white mb-1">
                  <div className="w-7 h-7 rounded-md bg-brand-orange/80 flex items-center justify-center">
                    <GlobalOutlined className="text-xs" />
                  </div>
                  <span className="text-base font-bold">Ocean Logistics</span>
                </div>
                <p className="text-white/70 text-xs">
                  High-volume maritime operations connecting major global
                  routes.
                </p>
              </div>
            </div>

            {/* Ground Network */}
            <div className="relative rounded-2xl overflow-hidden group min-h-[200px]">
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                style={{
                  backgroundImage:
                    "url('https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=600&q=80')",
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <div className="flex items-center gap-2 text-white mb-1">
                  <div className="w-7 h-7 rounded-md bg-brand-orange/80 flex items-center justify-center">
                    <CarOutlined className="text-xs" />
                  </div>
                  <span className="text-base font-bold">Ground Network</span>
                </div>
                <p className="text-white/70 text-xs">
                  Last-mile and long-haul road transport with real-time GPS
                  tracking.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sustainable Supply Chain */}
      <section className="py-20 lg:py-28 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Image */}
            <div className="relative rounded-2xl overflow-hidden min-h-[360px]">
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage:
                    "url('https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=800&q=80')",
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <div className="absolute top-6 left-6 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg shadow-lg">
                <p className="text-brand-navy font-bold text-sm">
                  Net Zero by 2040
                </p>
              </div>
            </div>

            {/* Content */}
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-full text-green-700 text-xs font-semibold uppercase tracking-wider mb-4">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                Going Greener
              </div>

              <h2 className="text-3xl lg:text-4xl font-bold text-brand-navy mb-6">
                Committing to a Sustainable Supply Chain
              </h2>

              <p className="text-slate-500 text-lg leading-relaxed mb-10">
                Efficiency isn&apos;t just about speed, it&apos;s about
                optimizing resources. We&apos;re actively transitioning our fleet
                to alternative fuels and utilizing AI-driven route optimization
                to drastically reduce our carbon footprint.
              </p>

              <div className="grid grid-cols-2 gap-6">
                <div className="bg-white p-5 rounded-xl border border-slate-200">
                  <div className="w-10 h-10 rounded-lg bg-brand-orange/10 flex items-center justify-center mb-3">
                    <ThunderboltOutlined className="text-brand-orange" />
                  </div>
                  <h4 className="font-bold text-slate-800 text-sm mb-1">
                    Optimized Routing
                  </h4>
                  <p className="text-xs text-slate-500">
                    AI algorithms reduce empty miles by 24% annually.
                  </p>
                </div>
                <div className="bg-white p-5 rounded-xl border border-slate-200">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center mb-3">
                    <CarOutlined className="text-blue-600" />
                  </div>
                  <h4 className="font-bold text-slate-800 text-sm mb-1">
                    Electric Ground Fleet
                  </h4>
                  <p className="text-xs text-slate-500">
                    Transitioning 30% of urban delivery vehicles to EV.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Principles Section */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-3xl lg:text-4xl font-bold text-brand-navy mb-4">
              The Principles That Drive Us
            </h2>
            <p className="text-slate-500 text-lg">
              Built on a foundation of industrial precision and unwavering
              reliability.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: <SafetyCertificateOutlined />,
                title: 'Precision',
                color: 'bg-brand-navy/5 text-brand-navy',
                desc: 'Exactness in every step. We measure twice and deliver perfectly, ensuring timelines are strictly adhered to.',
              },
              {
                icon: <HeartOutlined />,
                title: 'Integrity',
                color: 'bg-red-50 text-red-500',
                desc: 'Transparent tracking, honest pricing, and accountability for your high-value cargo from origin to destination.',
              },
              {
                icon: <BulbOutlined />,
                title: 'Innovation',
                color: 'bg-brand-orange/10 text-brand-orange',
                desc: 'Leveraging IoT, AI, and advanced robotics to create a smarter, more resilient supply chain ecosystem.',
              },
              {
                icon: <TeamOutlined />,
                title: 'People',
                color: 'bg-blue-50 text-blue-500',
                desc: 'Our global network is powered by dedicated experts, committed to solving complex logistics challenges.',
              },
            ].map((item, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl border border-slate-200 p-7 hover:shadow-lg transition-shadow duration-300 group"
              >
                <div
                  className={`w-12 h-12 rounded-xl ${item.color} flex items-center justify-center text-xl mb-5 group-hover:scale-110 transition-transform`}
                >
                  {item.icon}
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">
                  {item.title}
                </h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
