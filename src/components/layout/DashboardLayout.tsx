import React, { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { Button, Input, Dropdown, Badge } from "antd";
import {
  AppstoreOutlined,
  InboxOutlined,
  FileAddOutlined,
  ShoppingCartOutlined,
  SwapOutlined,
  CarOutlined,
  WalletOutlined,
  UserOutlined,
  BellOutlined,
  SearchOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  LogoutOutlined,
  EnvironmentOutlined,
  CustomerServiceOutlined,
} from "@ant-design/icons";
import { Logo } from "../common/Logo";
import { SidebarNav, type SidebarNavSection } from "./SidebarNav";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { logoutUser } from "../../store/slices/authSlice";

export const DashboardLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { unreadCount } = useAppSelector((state) => state.notifications);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate("/login");
  };

  const sections: SidebarNavSection[] = [
    {
      title: "Navigation",
      items: [
        { key: "/customer", icon: <AppstoreOutlined />, label: "Overview" },
        {
          key: "/customer/shipments",
          icon: <InboxOutlined />,
          label: "My Shipments",
        },
        // { key: '/customer/shipments/pre-alert', icon: <FileAddOutlined />, label: 'Pre-Alerts' },
        {
          key: "/customer/consolidation",
          icon: <AppstoreOutlined />,
          label: "Consolidation",
        },
        {
          key: "/customer/addresses",
          icon: <EnvironmentOutlined />,
          label: "Addresses",
        },
        {
          key: "/customer/buy-for-me",
          icon: <ShoppingCartOutlined />,
          label: "Buy For Me",
        },
        {
          key: "/customer/exchange",
          icon: <SwapOutlined />,
          label: "Currency Exchange",
        },
        {
          key: "/customer/delivery",
          icon: <CarOutlined />,
          label: "Local Delivery",
        },
      ],
    },
    {
      title: "Account",
      items: [
        { key: "/customer/profile", icon: <UserOutlined />, label: "Profile" },
        { key: "/customer/wallet", icon: <WalletOutlined />, label: "Wallet" },
        {
          key: "/customer/support",
          icon: <CustomerServiceOutlined />,
          label: "Support Tickets",
        },
        {
          key: "/customer/settings",
          icon: <UserOutlined />,
          label: "Settings",
        },
      ],
    },
  ];

  const userMenuItems = [
    {
      key: "profile",
      icon: <UserOutlined />,
      label: "Profile Settings",
      onClick: () => navigate("/customer/profile"),
    },
    { type: "divider" as const },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Logout",
      danger: true,
      onClick: handleLogout,
    },
  ];

  return (
    <div className="min-h-screen flex bg-slate-50">
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed lg:sticky top-0 h-screen z-40 border-r border-slate-200 transition-all duration-200 ${
          collapsed ? "w-20" : "w-[264px]"
        } ${mobileOpen ? "left-0" : "-left-72 lg:left-0"}`}
      >
        <div className="h-16 flex items-center px-4 border-b border-slate-100">
          <Logo withText={!collapsed} />
        </div>
        <div className="h-[calc(100%-4rem)]">
          <SidebarNav
            sections={sections}
            collapsed={collapsed}
            variant="light"
            userName={
              `${user?.firstName || ""} ${user?.lastName || ""}`.trim() ||
              "Customer"
            }
            userSubtitle={user?.customerId || ""}
            userInitial={user?.firstName?.charAt(0) || "U"}
            onSignOut={handleLogout}
          />
        </div>
      </aside>

      <div className="flex-1 min-w-0 flex flex-col">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-20">
          <div className="flex items-center gap-3 w-full max-w-2xl">
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              className="hidden lg:flex text-slate-500"
            />
            <Input
              placeholder="Search shipments..."
              prefix={<SearchOutlined className="text-slate-400" />}
              className="w-full hidden md:flex bg-slate-50 border-none rounded-lg text-sm py-2"
              variant="filled"
            />
          </div>

          <div className="flex items-center gap-6">
            <Badge dot={unreadCount > 0} offset={[-2, 4]} color="#f97316">
              <Button
                type="text"
                shape="circle"
                icon={<BellOutlined className="text-lg text-slate-600" />}
                onClick={() => navigate("/customer/notifications")}
                className="hover:bg-slate-50"
              />
            </Badge>

            <Dropdown
              menu={{ items: userMenuItems }}
              trigger={["click"]}
              placement="bottomRight"
            >
              <div className="flex items-center gap-3 cursor-pointer hover:bg-slate-50 p-1.5 rounded-lg transition-colors border-l border-slate-200 pl-6">
                <div className="hidden sm:flex flex-col items-end leading-tight">
                  <span className="text-sm font-bold text-slate-800">
                    Alex Global
                  </span>
                  <span className="text-[10px] font-bold text-slate-500">
                    Pro Member
                  </span>
                </div>
                <div className="w-8 h-8 rounded-full bg-[#0A1128] text-white flex items-center justify-center text-sm font-bold shadow-sm">
                  <UserOutlined />
                </div>
              </div>
            </Dropdown>
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
