import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Button, Input, Dropdown, Tag } from 'antd';
import {
  DashboardOutlined,
  InboxOutlined,
  AppstoreAddOutlined,
  ShoppingCartOutlined,
  SwapOutlined,
  CarOutlined,
  TeamOutlined,
  SettingOutlined,
  UserOutlined,
  SearchOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  LogoutOutlined,
  BlockOutlined,
  SafetyCertificateOutlined,
  UsergroupAddOutlined,
} from '@ant-design/icons';
import { Logo } from '../common/Logo';
import { SidebarNav, type SidebarNavSection } from './SidebarNav';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { logoutUser } from '../../store/slices/authSlice';

export const AdminLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const role = user?.role;

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate('/login');
  };

  const sections: SidebarNavSection[] = [
    {
      title: 'Overview',
      items: [{ key: '/admin', icon: <DashboardOutlined />, label: 'Dashboard' }],
    },
  ];

  if (role === 'super_admin' || role === 'warehouse_cn' || role === 'warehouse_ng') {
    sections.push({
      title: 'Warehouse Ops',
      items: [
        { key: '/admin/warehouse/facilities', icon: <DashboardOutlined />, label: 'Facilities' },
        { key: '/admin/warehouse/inbound', icon: <InboxOutlined />, label: 'Packages' },
        { key: '/admin/warehouse/consolidations', icon: <AppstoreAddOutlined />, label: 'Consolidations' },
        { key: '/admin/warehouse/batches', icon: <BlockOutlined />, label: 'Master Batches' },
      ],
    });
  }

  const opsItems = [];
  if (role === 'super_admin' || role === 'procurement') {
    opsItems.push({ key: '/admin/procurement', icon: <ShoppingCartOutlined />, label: 'Procurements' });
  }
  if (role === 'super_admin') {
    opsItems.push({ key: '/admin/exchange', icon: <SwapOutlined />, label: 'Exchange' });
  }
  if (role === 'super_admin' || role === 'warehouse_ng') {
    opsItems.push({ key: '/admin/delivery', icon: <CarOutlined />, label: 'Local Dispatch' });
  }
  if (opsItems.length) sections.push({ title: 'Operations', items: opsItems });

  if (role === 'super_admin') {
    sections.push({
      title: 'Manage',
      items: [
        { key: '/admin/customers', icon: <UsergroupAddOutlined />, label: 'Customers' },
        { key: '/admin/staff', icon: <TeamOutlined />, label: 'Staff Members' },
        { key: '/admin/permissions', icon: <SafetyCertificateOutlined />, label: 'Permissions' },
        { key: '/admin/settings', icon: <SettingOutlined />, label: 'Settings' },
      ],
    });
  }

  const userMenuItems = [
    { key: 'logout', icon: <LogoutOutlined />, label: 'Logout', danger: true, onClick: handleLogout },
  ];

  return (
    <div className="min-h-screen flex bg-slate-100">
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/40 z-30 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      <aside
        className={`fixed lg:sticky top-0 h-screen z-40 transition-all duration-200 ${
          collapsed ? 'w-20' : 'w-[264px]'
        } ${mobileOpen ? 'left-0' : '-left-72 lg:left-0'} bg-[#0A1128]`}
      >
        <div className="h-[72px] flex items-center px-6 border-b border-white/5 gap-3">
          <Logo withText={!collapsed} className="[&_span]:text-white filter brightness-125" />
        </div>
        <div className="h-[calc(100%-72px)]">
          <SidebarNav
            sections={sections}
            collapsed={collapsed}
            variant="dark"
            userName={`${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Admin'}
            userSubtitle={role?.replace('_', ' ').toUpperCase() || ''}
            userInitial={user?.firstName?.charAt(0) || 'A'}
            onSignOut={handleLogout}
          />
        </div>
      </aside>

      <div className="flex-1 min-w-0 flex flex-col bg-[#F9F7F5]">
        <header className="h-[72px] bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-20 shadow-sm">
          <div className="flex items-center gap-4 flex-1">
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              className="hidden lg:flex text-slate-500"
            />
            <Button
              type="text"
              icon={<MenuUnfoldOutlined />}
              onClick={() => setMobileOpen(true)}
              className="lg:hidden text-slate-500"
            />
            <div className="hidden md:flex max-w-lg w-full">
              <Input
                placeholder="Track Shipment ID or Customer..."
                prefix={<SearchOutlined className="text-slate-400 mr-1" />}
                className="w-full bg-slate-50 border-slate-200 hover:border-slate-300 focus:border-brand-orange !rounded-sm !h-10"
              />
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4 text-slate-600 text-lg">
              <div className="relative cursor-pointer hover:text-brand-navy">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-brand-orange" />
              </div>
              <div className="cursor-pointer hover:text-brand-navy">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
              </div>
            </div>
            <div className="w-px h-6 bg-slate-200" />
            <Button type="primary" className="!bg-[#D95F18] hover:!bg-[#C05010] !border-none !rounded-sm font-bold uppercase tracking-wider text-xs px-5 h-10 shadow-sm flex items-center gap-2">
              <span className="text-lg leading-none">+</span> NEW SHIPMENT
            </Button>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 overflow-x-hidden">
          <div className="max-w-[1400px] mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
