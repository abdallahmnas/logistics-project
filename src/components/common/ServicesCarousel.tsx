import React, { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { Button } from "antd";
import {
  ArrowRightOutlined,
  LeftOutlined,
  RightOutlined,
  CheckCircleFilled,
} from "@ant-design/icons";

interface ServiceSlide {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  badgeColor: string;
  image: string;
  desc: string;
  features: string[];
  ctaText: string;
  ctaLink: string;
  icon: string;
}

const SLIDES: ServiceSlide[] = [
  {
    id: "air-freight",
    title: "Express Air Freight",
    subtitle: "Yiwu & Guangzhou ➔ Kano & Lagos",
    badge: "3–5 DAYS EXPRESS",
    badgeColor: "#C0262D",
    image: "/services/air-freight-new.jpg",
    desc: "Fast express air cargo dispatch from our Guangzhou and Yiwu receiving hubs directly to Kano & Lagos airports with full customs clearance included.",
    features: [
      "Departs 3x weekly from China",
      "Includes full customs duty clearance",
      "Direct warehouse dispatch upon arrival",
    ],
    ctaText: "Calculate Air Freight Quote",
    ctaLink: "/get-quote",
    icon: "✈️",
  },
  {
    id: "sea-freight",
    title: "Sea Freight (CBM & FCL)",
    subtitle: "Bulk Maritime Transport",
    badge: "COST-EFFECTIVE CBM",
    badgeColor: "#2563EB",
    image: "/services/sea-freight-new.jpg",
    desc: "High-volume ocean shipping billed per CBM. LCL groupage consolidation and 20ft/40ft full container loading to Lagos ports.",
    features: [
      "Flexible CBM volume billing",
      "Full container & LCL groupage",
      "Port clearance & inland transfer",
    ],
    ctaText: "Calculate Sea Freight Quote",
    ctaLink: "/get-quote",
    icon: "🚢",
  },
  {
    id: "buy-for-me",
    title: "Buy For Me / Sourcing",
    subtitle: "1688, Taobao & Factory Sourcing",
    badge: "SUPPLIER PROCUREMENT",
    badgeColor: "#D97706",
    image: "/services/buy-for-me-new.jpg",
    desc: "Can't pay Chinese suppliers? Send product links from 1688 or Taobao. We verify suppliers, negotiate prices, pay in RMB, and procure your items.",
    features: [
      "Supplier verification & inspection",
      "Pay Naira, we pay seller in Yuan 🇨🇳",
      "Physical item photo proof",
    ],
    ctaText: "Submit Sourcing Link",
    ctaLink: "/customer/buy-for-me",
    icon: "🛒",
  },
  {
    id: "cargo-consolidation",
    title: "Cargo Consolidation",
    subtitle: "Save Up to 40% Shipping Fees",
    badge: "FREE 30-DAY STORAGE",
    badgeColor: "#4F46E5",
    image: "/services/cargo-consolidation-new.jpg",
    desc: "Combine parcels from different suppliers into one master shipment. We strip excess packaging, reducing volumetric shipping costs significantly.",
    features: [
      "Yiwu & Guangzhou intake logging",
      "Repackaging & volume minimization",
      "Unified single tracking ID",
    ],
    ctaText: "Start Consolidating",
    ctaLink: "/customer/consolidation",
    icon: "📦",
  },
  {
    id: "local-delivery",
    title: "Local Nigeria Delivery",
    subtitle: "Kano, Lagos & 36 States",
    badge: "NIGERIA DISPATCH",
    badgeColor: "#059669",
    image: "/services/local-delivery.jpg",
    desc: "Self-pickup at our Kano (Gwarzo Road) or Lagos hubs, or request door-to-door delivery and waybill dispatch across all 36 states in Nigeria.",
    features: [
      "Kano & Lagos central warehouses",
      "Nationwide interstate dispatch",
      "Real-time delivery SMS/WhatsApp alerts",
    ],
    ctaText: "Request Doorstep Delivery",
    ctaLink: "/customer/delivery",
    icon: "🚚",
  },
  {
    id: "express-dispatch",
    title: "Express Motorcycle Dispatch",
    subtitle: "Same-Day & Next-Day",
    badge: "RAPID LAST-MILE",
    badgeColor: "#C0262D",
    image: "/services/express-delivery.jpg",
    desc: "Urgent last-mile delivery via our motorcycle dispatch riders across major Nigerian cities. Perfect for time-sensitive documents and parcels.",
    features: [
      "Same-day delivery in Kano & Lagos",
      "Live GPS tracking of rider",
      "Proof-of-delivery confirmation",
    ],
    ctaText: "Request Express Dispatch",
    ctaLink: "/customer/delivery",
    icon: "🏍️",
  },
];

const AUTOPLAY_INTERVAL = 6000;

export const ServicesCarousel: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const goTo = useCallback(
    (index: number) => {
      if (isTransitioning) return;
      setIsTransitioning(true);
      setActiveIndex(index);
      setTimeout(() => setIsTransitioning(false), 700);
    },
    [isTransitioning]
  );

  const next = useCallback(() => {
    goTo((activeIndex + 1) % SLIDES.length);
  }, [activeIndex, goTo]);

  const prev = useCallback(() => {
    goTo((activeIndex - 1 + SLIDES.length) % SLIDES.length);
  }, [activeIndex, goTo]);

  // Autoplay
  useEffect(() => {
    if (isPaused) return;
    timerRef.current = setTimeout(next, AUTOPLAY_INTERVAL);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [activeIndex, isPaused, next]);

  // Keyboard nav
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [prev, next]);

  const currentSlide = SLIDES[activeIndex];

  return (
    <section
      id="services-carousel"
      className="relative w-full overflow-hidden bg-slate-950"
      style={{ minHeight: "680px" }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      ref={containerRef}
    >
      {/* Full-bleed background images – all layered, only active one visible */}
      {SLIDES.map((slide, i) => (
        <div
          key={slide.id}
          className="absolute inset-0 transition-all duration-[800ms] ease-in-out"
          style={{
            opacity: i === activeIndex ? 1 : 0,
            zIndex: i === activeIndex ? 1 : 0,
          }}
        >
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url('${slide.image}')`,
              transform: i === activeIndex ? "scale(1.02)" : "scale(1.08)",
              transition: "transform 6s ease-out, opacity 800ms ease-in-out",
            }}
          />
          {/* Cinematic dark overlay with gradient */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(135deg, rgba(10,27,58,0.92) 0%, rgba(10,27,58,0.75) 40%, rgba(10,27,58,0.55) 100%)",
            }}
          />
          {/* Bottom fade for text readability */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to top, rgba(2,6,23,0.95) 0%, rgba(2,6,23,0.4) 40%, transparent 70%)",
            }}
          />
        </div>
      ))}

      {/* Content Layer */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-end" style={{ minHeight: "680px" }}>
        {/* Top section badge */}
        <div className="absolute top-8 left-4 sm:left-6 lg:left-8 z-20">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-white/80 text-[10px] font-black uppercase tracking-[0.2em]">
            <span
              className="w-2 h-2 rounded-full animate-pulse"
              style={{ backgroundColor: currentSlide.badgeColor }}
            />
            OUR SERVICES
          </span>
        </div>

        {/* Slide counter */}
        <div className="absolute top-8 right-4 sm:right-6 lg:right-8 z-20">
          <span className="text-white/40 text-sm font-mono font-bold tracking-widest">
            <span className="text-white text-lg font-black">
              {String(activeIndex + 1).padStart(2, "0")}
            </span>
            <span className="mx-1 text-white/20">/</span>
            {String(SLIDES.length).padStart(2, "0")}
          </span>
        </div>

        {/* Main slide content */}
        <div className="pb-28 sm:pb-32 lg:pb-36 pt-24">
          {SLIDES.map((slide, i) => (
            <div
              key={slide.id}
              className="transition-all duration-700 ease-out"
              style={{
                opacity: i === activeIndex ? 1 : 0,
                transform:
                  i === activeIndex
                    ? "translateY(0)"
                    : "translateY(30px)",
                position: i === activeIndex ? "relative" : "absolute",
                pointerEvents: i === activeIndex ? "auto" : "none",
              }}
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-end">
                {/* Left: Text Content */}
                <div className="max-w-2xl">
                  {/* Service icon + badge row */}
                  <div className="flex items-center gap-3 mb-5">
                    <span className="text-4xl drop-shadow-lg">{slide.icon}</span>
                    <span
                      className="text-[10px] font-black px-3.5 py-1.5 rounded-full uppercase tracking-wider text-white shadow-lg"
                      style={{
                        backgroundColor: slide.badgeColor,
                        boxShadow: `0 4px 14px ${slide.badgeColor}60`,
                      }}
                    >
                      {slide.badge}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-[1.1] mb-3 tracking-tight">
                    {slide.title}
                  </h3>

                  {/* Subtitle */}
                  <p className="text-sm sm:text-base font-bold mb-4" style={{ color: slide.badgeColor }}>
                    {slide.subtitle}
                  </p>

                  {/* Description */}
                  <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-6 max-w-xl">
                    {slide.desc}
                  </p>

                  {/* CTA Button */}
                  <Link to={slide.ctaLink}>
                    <Button
                      type="primary"
                      size="large"
                      className="!border-none !h-13 !px-8 font-black text-sm !rounded-xl shadow-xl flex items-center gap-2"
                      style={{
                        backgroundColor: slide.badgeColor,
                        boxShadow: `0 8px 24px ${slide.badgeColor}50`,
                      }}
                      icon={<ArrowRightOutlined />}
                      iconPlacement="end"
                    >
                      {slide.ctaText}
                    </Button>
                  </Link>
                </div>

                {/* Right: Feature bullets */}
                <div className="hidden lg:block">
                  <div className="bg-white/[0.06] backdrop-blur-md border border-white/10 rounded-2xl p-8 max-w-md ml-auto">
                    <h4 className="text-xs font-black text-white/50 uppercase tracking-[0.2em] mb-5">
                      Key Features
                    </h4>
                    <div className="space-y-4">
                      {slide.features.map((feat, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-3 text-sm text-white font-semibold"
                        >
                          <CheckCircleFilled
                            className="text-emerald-400 text-base shrink-0 mt-0.5"
                          />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>

                    {/* Mini image preview strip */}
                    <div className="mt-6 pt-5 border-t border-white/10">
                      <div className="flex gap-2">
                        {SLIDES.filter((_, si) => si !== activeIndex)
                          .slice(0, 3)
                          .map((s) => (
                            <button
                              key={s.id}
                              onClick={() =>
                                goTo(SLIDES.findIndex((sl) => sl.id === s.id))
                              }
                              className="relative w-16 h-12 rounded-lg overflow-hidden border border-white/20 opacity-60 hover:opacity-100 hover:border-white/60 transition-all duration-300 cursor-pointer group"
                            >
                              <img
                                src={s.image}
                                alt={s.title}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                              />
                            </button>
                          ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mobile features – shown below text on small screens */}
              <div className="lg:hidden mt-6">
                <div className="flex flex-wrap gap-2">
                  {slide.features.map((feat, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 bg-white/[0.08] border border-white/10 text-white/80 px-3 py-1.5 rounded-lg text-xs font-semibold"
                    >
                      <CheckCircleFilled className="text-emerald-400 text-xs" />
                      {feat}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Navigation Bar */}
        <div className="absolute bottom-0 left-0 right-0 z-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between py-6 border-t border-white/10">
              {/* Dot indicators with labels */}
              <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto hide-scrollbar">
                {SLIDES.map((slide, i) => (
                  <button
                    key={slide.id}
                    onClick={() => goTo(i)}
                    className={`group relative flex items-center gap-2 px-2 sm:px-3 py-2 rounded-lg transition-all duration-300 cursor-pointer whitespace-nowrap ${
                      i === activeIndex
                        ? "bg-white/10"
                        : "hover:bg-white/5"
                    }`}
                  >
                    {/* Progress bar for active dot */}
                    <div
                      className="w-6 sm:w-8 h-1 rounded-full overflow-hidden"
                      style={{
                        backgroundColor:
                          i === activeIndex
                            ? `${currentSlide.badgeColor}30`
                            : "rgba(255,255,255,0.1)",
                      }}
                    >
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          backgroundColor:
                            i === activeIndex
                              ? currentSlide.badgeColor
                              : "transparent",
                          width: i === activeIndex ? "100%" : "0%",
                          transition:
                            i === activeIndex
                              ? `width ${AUTOPLAY_INTERVAL}ms linear`
                              : "none",
                        }}
                      />
                    </div>
                    <span
                      className={`text-[10px] sm:text-xs font-bold transition-colors hidden sm:inline ${
                        i === activeIndex
                          ? "text-white"
                          : "text-white/30 group-hover:text-white/60"
                      }`}
                    >
                      {slide.icon} {slide.title.split(" ").slice(0, 2).join(" ")}
                    </span>
                  </button>
                ))}
              </div>

              {/* Prev / Next arrows */}
              <div className="flex items-center gap-2 shrink-0 ml-4">
                <button
                  onClick={prev}
                  disabled={isTransitioning}
                  className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center text-white hover:bg-white/20 hover:border-white/30 transition-all duration-200 disabled:opacity-30 cursor-pointer"
                  aria-label="Previous service"
                >
                  <LeftOutlined className="text-sm" />
                </button>
                <button
                  onClick={next}
                  disabled={isTransitioning}
                  className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl border flex items-center justify-center text-white hover:opacity-90 transition-all duration-200 disabled:opacity-30 cursor-pointer"
                  style={{
                    backgroundColor: currentSlide.badgeColor,
                    borderColor: `${currentSlide.badgeColor}80`,
                    boxShadow: `0 4px 12px ${currentSlide.badgeColor}40`,
                  }}
                  aria-label="Next service"
                >
                  <RightOutlined className="text-sm" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom style for hiding scrollbar on dot nav */}
      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </section>
  );
};

export default ServicesCarousel;
