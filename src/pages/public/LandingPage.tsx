import React from "react";
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

export const LandingPage: React.FC = () => {
  const [form] = Form.useForm();

  const handleTrack = (values: { trackingNumber: string }) => {
    window.location.href = `/track?id=${values.trackingNumber}`;
  };

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative min-h-[520px] lg:min-h-[600px] flex items-center overflow-hidden">
        {/* Background Image Overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1494412574643-ff11b0a5eb19?w=1920&q=80')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-brand-navy/95 via-brand-navy/80 to-brand-navy/60" />

        <div className="container mx-auto px-4 relative z-10 py-16 lg:py-24">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-brand-orange/20 border border-brand-orange/30 rounded-full text-brand-orange text-xs font-semibold uppercase tracking-wider mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-orange animate-pulse-slow" />
              Worldwide Delivery
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-[1.1] mb-6">
              Moving Your World,
              <br />
              <span className="text-white">Without Boundaries.</span>
            </h1>

            <p className="text-slate-300 text-lg md:text-xl leading-relaxed max-w-xl mb-10">
              Industrial-grade precision for global supply chains. Track,
              manage, and optimize your shipments in real time.
            </p>

            {/* Tracking Search Bar */}
            <Form form={form} onFinish={handleTrack}>
              <div className="flex flex-col sm:flex-row items-stretch gap-0 max-w-lg bg-white rounded shadow-sm border border-slate-200 overflow-hidden">
                <Form.Item
                  name="trackingNumber"
                  noStyle
                  rules={[{ required: true, message: "" }]}
                >
                  <Input
                    size="large"
                    placeholder="Enter Tracking Number (e.g., GLB-547291)"
                    prefix={<SearchOutlined className="text-slate-400 mr-2" />}
                    className="flex-1 !h-12 !border-0 !rounded-none !bg-white text-sm"
                  />
                </Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  className="!bg-brand-orange hover:!bg-orange-600 !border-brand-orange hover:!border-orange-600 !h-12 !px-6 !rounded-none font-semibold text-sm w-auto"
                >
                  Track Shipment &rarr;
                </Button>
              </div>
            </Form>

            {/* Quick links */}
            <div className="flex items-center gap-6 mt-8">
              <Link
                to="/get-quote"
                className="flex items-center gap-2 text-brand-orange text-sm font-medium hover:text-orange-400 transition-colors"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-brand-orange" />
                Get a Free Quote
              </Link>
              <Link
                to="/services"
                className="flex items-center gap-2 text-slate-400 text-sm font-medium hover:text-white transition-colors"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                Find Locations
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Industrial Logistics Solutions */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-14">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold text-brand-navy mb-3">
                Industrial Logistics Solutions
              </h2>
              <p className="text-slate-500 text-lg max-w-xl">
                Comprehensive multimodal transport designed for reliability and
                scale. From port to final mile.
              </p>
            </div>
            <Link
              to="/services"
              className="text-brand-orange font-semibold text-sm flex items-center gap-1 hover:gap-2 transition-all"
            >
              View All Services <ArrowRightOutlined />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Ocean Freight */}
            <div className="group bg-white rounded-2xl border border-slate-200 p-8 hover:shadow-xl hover:border-slate-300 transition-all duration-300">
              <div className="w-14 h-14 rounded-xl bg-brand-navy/5 flex items-center justify-center mb-6 group-hover:bg-brand-navy/10 transition-colors">
                <GlobalOutlined className="text-2xl text-brand-navy" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">
                Ocean Freight
              </h3>
              <p className="text-slate-500 text-sm leading-relaxed mb-6">
                FCL and LCL shipping solutions providing cost-effective global
                reach with guaranteed vessel space.
              </p>
              <Link
                to="/services"
                className="text-brand-navy text-sm font-semibold flex items-center gap-1 hover:gap-2 transition-all"
              >
                Explore Routes <ArrowRightOutlined className="text-xs" />
              </Link>
            </div>

            {/* Air Freight */}
            <div className="group bg-white rounded-2xl border border-brand-orange/30 p-8 hover:shadow-xl hover:border-brand-orange/50 transition-all duration-300 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-brand-orange" />
              <div className="w-14 h-14 rounded-xl bg-brand-orange/10 flex items-center justify-center mb-6 group-hover:bg-brand-orange/15 transition-colors">
                <ThunderboltOutlined className="text-2xl text-brand-orange" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">
                Air Freight
              </h3>
              <p className="text-slate-500 text-sm leading-relaxed mb-6">
                Time-critical shipping for urgent cargo. Next-flight-out and
                consolidated options available.
              </p>
              <Link
                to="/services"
                className="text-brand-orange text-sm font-semibold flex items-center gap-1 hover:gap-2 transition-all"
              >
                View Schedules <ArrowRightOutlined className="text-xs" />
              </Link>
            </div>

            {/* Land Transport */}
            <div className="group bg-white rounded-2xl border border-slate-200 p-8 hover:shadow-xl hover:border-slate-300 transition-all duration-300">
              <div className="w-14 h-14 rounded-xl bg-brand-navy/5 flex items-center justify-center mb-6 group-hover:bg-brand-navy/10 transition-colors">
                <EnvironmentOutlined className="text-2xl text-brand-navy" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">
                Land Transport
              </h3>
              <p className="text-slate-500 text-sm leading-relaxed mb-6">
                Extensive trucking networks offering FTL and LTL services with
                real-time GPS tracking.
              </p>
              <Link
                to="/services"
                className="text-brand-navy text-sm font-semibold flex items-center gap-1 hover:gap-2 transition-all"
              >
                Check Availability <ArrowRightOutlined className="text-xs" />
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
    </div>
  );
};
