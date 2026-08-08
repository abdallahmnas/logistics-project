import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Logo } from '../common/Logo';
import { Button } from 'antd';
import {
  MenuOutlined,
  CloseOutlined,
  UserOutlined,
  ShareAltOutlined,
  GlobalOutlined,
  MailOutlined,
} from '@ant-design/icons';

const NAV_LINKS = [
  { label: 'Home', path: '/' },
  { label: 'Services', path: '/services' },
  { label: 'Tracking', path: '/track' },
  { label: 'About', path: '/about' },
  { label: 'Contact', path: '/contact' },
];

export const PublicLayout: React.FC = () => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Header */}
      <header
        className={`sticky top-0 z-50 w-full transition-all duration-300 ${
          scrolled
            ? 'bg-white/95 backdrop-blur-md shadow-md'
            : 'bg-white border-b border-slate-100'
        }`}
      >
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          <Logo variant="dark" />

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
                  isActive(link.path)
                    ? 'text-brand-orange'
                    : 'text-slate-600 hover:text-brand-navy hover:bg-slate-50'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center gap-3">
            <Link to="/get-quote">
              <Button
                type="primary"
                className="!bg-brand-orange hover:!bg-orange-600 !border-brand-orange hover:!border-orange-600 font-semibold h-8 px-4 text-sm rounded shadow-sm shadow-orange-900/10"
              >
                Get a Quote
              </Button>
            </Link>
            <Link to="/login">
              <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center text-white hover:bg-slate-800 transition-colors cursor-pointer">
                <UserOutlined className="text-sm" />
              </div>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700 hover:bg-slate-200 transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <CloseOutlined /> : <MenuOutlined />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-t border-slate-100 animate-fade-in shadow-lg">
            <div className="container mx-auto px-4 py-4 flex flex-col gap-1">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-4 py-3 text-sm font-semibold rounded-lg transition-colors ${
                    isActive(link.path)
                      ? 'text-brand-orange bg-orange-50'
                      : 'text-slate-600 hover:text-brand-navy hover:bg-slate-50'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <div className="flex flex-col gap-2 pt-4 mt-2 border-t border-slate-100">
                <Link to="/get-quote">
                  <Button
                    type="primary"
                    block
                    className="!bg-brand-orange hover:!bg-orange-600 !border-brand-orange font-semibold h-10 rounded-lg"
                  >
                    Get a Quote
                  </Button>
                </Link>
                <Link to="/login">
                  <Button
                    block
                    className="!text-brand-navy !border-slate-200 hover:!border-brand-navy h-10 rounded-lg font-semibold"
                  >
                    Sign In
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-brand-navy text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            {/* Brand Column */}
            <div>
              <Logo variant="light" className="mb-5" />
              <p className="text-slate-400 text-sm leading-relaxed mt-4 max-w-xs">
                Reliable, efficient, and industrial precision in global shipping and logistics solutions.
              </p>
              <div className="flex items-center gap-3 mt-6">
                <a
                  href="#"
                  className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                >
                  <ShareAltOutlined className="text-sm" />
                </a>
                <a
                  href="#"
                  className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                >
                  <GlobalOutlined className="text-sm" />
                </a>
                <a
                  href="#"
                  className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                >
                  <MailOutlined className="text-sm" />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-base font-bold text-white mb-5">Quick Links</h4>
              <ul className="space-y-3">
                <li>
                  <Link to="/services" className="text-slate-400 text-sm hover:text-white transition-colors">
                    Our Services
                  </Link>
                </li>
                <li>
                  <Link to="/track" className="text-slate-400 text-sm hover:text-white transition-colors">
                    Track Shipment
                  </Link>
                </li>
                <li>
                  <Link to="/about" className="text-slate-400 text-sm hover:text-white transition-colors">
                    Carrier Network
                  </Link>
                </li>
              </ul>
            </div>

            {/* Global Offices */}
            <div>
              <h4 className="text-base font-bold text-white mb-5">Global Offices</h4>
              <ul className="space-y-3 text-sm text-slate-400">
                <li>China: Guangzhou, GD</li>
                <li>Nigeria: Lagos, LG</li>
                <li>Nigeria: Abuja, FCT</li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-base font-bold text-white mb-5">Contact</h4>
              <ul className="space-y-3 text-sm text-slate-400">
                <li>support@hamzarmb.com</li>
                <li>+234 800 HAMZA RMB</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Copyright bar */}
        <div className="border-t border-white/10">
          <div className="container mx-auto px-4 py-5 flex flex-col md:flex-row items-center justify-center text-xs text-slate-500">
            <p>&copy; {new Date().getFullYear()} Hamza RMB. Industrial Excellence Guaranteed.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
