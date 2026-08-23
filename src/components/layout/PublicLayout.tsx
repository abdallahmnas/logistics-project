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
  PhoneOutlined,
  WhatsAppOutlined,
  EnvironmentOutlined,
} from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchSettings } from '../../store/slices/settingsSlice';

const NAV_LINKS = [
  { label: 'Home', path: '/' },
  { label: 'About Us', path: '/about' },
  { label: 'Services', path: '/services' },
  { label: 'Tracking', path: '/track' },
  { label: 'RMB Exchange', path: '/customer/exchange' },
  { label: 'Contact', path: '/contact' },
];

export const PublicLayout: React.FC = () => {
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { settings } = useAppSelector((state) => state.settings);
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const dashboardPath = user?.role === 'admin' || user?.role === 'warehouse_staff' ? '/admin' : '/customer';

  useEffect(() => {
    dispatch(fetchSettings());
  }, [dispatch]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const companyName = settings?.companyName || 'HAMZA RMB GLOBAL COMPANY LTD';
  const chinaAirCargoAddressEn = settings?.chinaAirCargoAddressEn || 'Room 602, International Trade Mansion, Chouzhou North Road, Yiwu City, Zhejiang Province, China';
  const chinaAirCargoPhone = settings?.chinaAirCargoPhone || '+86 158 6890 7118';
  const nigeriaOfficeAddress = settings?.nigeriaOfficeAddress || 'No. 08 Gwarzo Road Beside Shopwell, Gwale Kano State, Nigeria';

  let contactsList: Array<{ name: string; phone: string }> = [
    { name: 'HAMZA RMB CHINA', phone: '+86 198 4662 5061' },
    { name: 'AMMARU', phone: '+234 8168416814' },
    { name: 'HUZAIFA', phone: '+234 8028324798' },
  ];
  if (settings?.companyContacts) {
    try {
      const parsed = JSON.parse(settings.companyContacts);
      if (Array.isArray(parsed) && parsed.length > 0) {
        contactsList = parsed;
      }
    } catch {}
  }

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Header */}
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-slate-200/80 py-3'
            : 'bg-white border-b border-slate-100 py-4'
        }`}
      >
        <div className="container mx-auto px-4 flex items-center justify-between">
          <Logo />

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  isActive(link.path)
                    ? 'text-brand-orange bg-orange-50/80'
                    : 'text-slate-600 hover:text-brand-navy hover:bg-slate-50'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="hidden md:flex items-center space-x-3">
            {isAuthenticated && user ? (
              <Link to={dashboardPath}>
                <Button
                  type="primary"
                  icon={<UserOutlined />}
                  className="!bg-[#0A1128] hover:!bg-[#15244f] !border-none font-bold text-sm h-10 px-5 rounded-lg shadow-sm"
                >
                  My Dashboard
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/login">
                  <Button
                    type="text"
                    icon={<UserOutlined />}
                    className="text-slate-700 hover:text-brand-navy font-semibold text-sm"
                  >
                    Sign In
                  </Button>
                </Link>
                <Link to="/register">
                  <Button
                    type="primary"
                    className="!bg-[#C0262D] hover:!bg-[#A01F25] !border-none font-bold text-sm h-10 px-5 rounded-lg shadow-sm"
                  >
                    Create Account
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 focus:outline-none"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <CloseOutlined className="text-xl" />
            ) : (
              <MenuOutlined className="text-xl" />
            )}
          </button>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-6 space-y-3 animate-fade-in">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`block px-3 py-2.5 rounded-lg text-base font-semibold transition-colors ${
                  isActive(link.path)
                    ? 'text-brand-orange bg-orange-50'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-4 border-t border-slate-100 space-y-2">
              {isAuthenticated && user ? (
                <Link to={dashboardPath} className="block w-full">
                  <Button
                    type="primary"
                    block
                    icon={<UserOutlined />}
                    className="!bg-[#0A1128] hover:!bg-[#15244f] !border-none font-bold h-10 rounded-lg"
                  >
                    Go to My Dashboard
                  </Button>
                </Link>
              ) : (
                <>
                  <Link to="/register" className="block w-full">
                    <Button
                      type="primary"
                      block
                      className="!bg-[#C0262D] hover:!bg-[#A01F25] !border-none font-bold h-10 rounded-lg"
                    >
                      Create Account
                    </Button>
                  </Link>
                  <Link to="/login" className="block w-full">
                    <Button
                      block
                      className="!text-brand-navy !border-slate-200 hover:!border-brand-navy h-10 rounded-lg font-semibold"
                    >
                      Sign In
                    </Button>
                  </Link>
                </>
              )}
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
              <Logo variant="light" className="mb-4" />
              <div className="text-amber-400 font-extrabold text-xs tracking-wider uppercase mb-3">
                {companyName}
              </div>
              <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
                Reliable, efficient, and industrial precision in global shipping and China ➔ Nigeria logistics.
              </p>
            </div>

            {/* China Air Hub */}
            <div>
              <h4 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                <GlobalOutlined className="text-brand-orange" /> China Air Cargo Hub
              </h4>
              <p className="text-slate-300 text-sm leading-relaxed mb-2 font-medium">
                {chinaAirCargoAddressEn}
              </p>
              <div className="text-brand-orange text-xs font-bold flex items-center gap-1.5">
                <PhoneOutlined /> Tel: {chinaAirCargoPhone}
              </div>
            </div>

            {/* Nigeria Hub */}
            <div>
              <h4 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                <EnvironmentOutlined className="text-emerald-400" /> Nigeria Office & Distribution
              </h4>
              <p className="text-slate-300 text-sm leading-relaxed mb-2 font-medium">
                {nigeriaOfficeAddress}
              </p>
            </div>

            {/* Direct Contacts Directory */}
            <div>
              <h4 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                <WhatsAppOutlined className="text-emerald-400" /> Key Representatives
              </h4>
              <ul className="space-y-2 text-xs">
                {contactsList.slice(0, 4).map((c, i) => (
                  <li key={i} className="flex justify-between items-center text-slate-300 bg-white/5 px-2.5 py-1.5 rounded border border-white/10">
                    <span className="font-semibold">{c.name}:</span>
                    <a href={`https://wa.me/${c.phone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="font-mono font-bold text-emerald-400 hover:underline">
                      {c.phone}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Copyright bar */}
        <div className="border-t border-white/10">
          <div className="container mx-auto px-4 py-5 flex flex-col md:flex-row items-center justify-between text-xs text-slate-400">
            <p>&copy; {new Date().getFullYear()} {companyName}. All rights reserved.</p>
            <p className="text-slate-500 mt-2 md:mt-0">Industrial Freight & Logistics Platform</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
