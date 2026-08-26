import React, { useEffect, useMemo, useState } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
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
import { fetchNotifications } from "../../store/slices/notificationSlice";

export const DashboardLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { notifications, unreadCount } = useAppSelector((state) => state.notifications);

  useEffect(() => {
    dispatch(fetchNotifications());
    const interval = setInterval(() => {
      dispatch(fetchNotifications());
    }, 10000);
    return () => clearInterval(interval);
  }, [dispatch]);

  const unreadByCategory = useMemo(() => {
    const counts: Record<string, number> = {};
    (notifications || []).forEach((n) => {
      if (!n.isRead) {
        counts[n.type] = (counts[n.type] || 0) + 1;
      }
    });
    return counts;
  }, [notifications]);

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
          badge: unreadByCategory["shipment"],
        },
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
          badge: unreadByCategory["procurement"],
        },
        {
          key: "/customer/exchange",
          icon: <SwapOutlined />,
          label: "Currency Exchange",
          badge: unreadByCategory["exchange"],
        },
        {
          key: "/customer/delivery",
          icon: <CarOutlined />,
          label: "Local Delivery",
          badge: unreadByCategory["delivery"],
        },
      ],
    },
    {
      title: "Account",
      items: [
        { key: "/customer/profile", icon: <UserOutlined />, label: "Profile" },
        {
          key: "/customer/wallet",
          icon: <WalletOutlined />,
          label: "Wallet",
          badge: unreadByCategory["wallet"],
        },
        {
          key: "/customer/support",
          icon: <CustomerServiceOutlined />,
          label: "Support Tickets",
          badge: unreadByCategory["support"],
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
              user ? `${user.firstName} ${user.lastName}` : "Customer"
            }
            userSubtitle={user?.customerId || "HZ-Customer"}
            userInitial={user?.firstName?.[0] || "C"}
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
            <Badge count={unreadCount} overflowCount={99} size="small" offset={[-2, 4]} color="#C0262D">
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
                    {`${user?.firstName || ""} ${user?.lastName || ""}`.trim() || "Customer"}
                  </span>
                  <span className="text-[10px] font-bold text-slate-500">
                    {user?.customerId || "Customer account"}
                  </span>
                </div>
                <div className="w-8 h-8 rounded-full bg-[#0A1128] text-white flex items-center justify-center text-sm font-bold shadow-sm">
                  <UserOutlined />
                </div>
              </div>
            </Dropdown>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 overflow-x-hidden pb-20 lg:pb-6">
          <div className="max-w-[1400px] mx-auto">
            <Outlet />
          </div>
        </main>

        {/* Mobile Bottom App Navigation Bar */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-30 flex items-center justify-around py-2 px-1 shadow-lg">
          <Link to="/customer" className="flex flex-col items-center text-slate-600 hover:text-brand-orange text-[10px] font-bold no-underline">
            <AppstoreOutlined className="text-lg mb-0.5" />
            Home
          </Link>
          <Link to="/customer/shipments" className="flex flex-col items-center text-slate-600 hover:text-brand-orange text-[10px] font-bold no-underline">
            <InboxOutlined className="text-lg mb-0.5" />
            Shipments
          </Link>
          <Link to="/customer/exchange" className="flex flex-col items-center text-slate-600 hover:text-brand-orange text-[10px] font-bold no-underline">
            <SwapOutlined className="text-lg mb-0.5" />
            RMB
          </Link>
          <Link to="/customer/wallet" className="flex flex-col items-center text-slate-600 hover:text-brand-orange text-[10px] font-bold no-underline">
            <WalletOutlined className="text-lg mb-0.5" />
            Wallet
          </Link>
          <Link to="/customer/profile" className="flex flex-col items-center text-slate-600 hover:text-brand-orange text-[10px] font-bold no-underline">
            <UserOutlined className="text-lg mb-0.5" />
            Profile
          </Link>
        </nav>
      </div>
    </div>
  );
};
