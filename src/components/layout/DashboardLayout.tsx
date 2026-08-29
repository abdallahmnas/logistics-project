import React, { useEffect, useMemo, useState } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { Button, Input, Dropdown, Badge, Popover } from "antd";
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
  RobotOutlined,
} from "@ant-design/icons";
import { Logo } from "../common/Logo";
import { SidebarNav, type SidebarNavSection } from "./SidebarNav";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { logoutUser } from "../../store/slices/authSlice";
import { fetchNotifications, markAsRead, markAllAsRead } from "../../store/slices/notificationSlice";
import { formatDate } from "../../utils/formatters";
import { AIChatbotWidget } from "../chat/AIChatbotWidget";

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
    }, 3000);
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
        {
          key: "/customer/aisha",
          icon: <RobotOutlined className="text-brand-orange" />,
          label: "Aisha AI Assistant",
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

  // Notification Popover Content
  const notificationContent = (
    <div className="w-80 max-h-96 flex flex-col">
      <div className="flex justify-between items-center pb-3 mb-2 border-b border-slate-100 px-1">
        <span className="font-bold text-slate-800 text-sm">Notifications</span>
        {unreadCount > 0 && (
          <Button
            type="link"
            size="small"
            className="p-0 text-xs text-brand-orange font-bold hover:underline"
            onClick={() => dispatch(markAllAsRead())}
          >
            Mark all read
          </Button>
        )}
      </div>

      <div className="overflow-y-auto space-y-2 flex-1 pr-1">
        {notifications.length > 0 ? (
          notifications.slice(0, 8).map((n) => (
            <div
              key={n.id}
              onClick={() => {
                dispatch(markAsRead(n.id));
                if (n.type === 'support') {
                  navigate(n.referenceId ? `/customer/support/${n.referenceId}` : '/customer/support');
                } else if (n.type === 'shipment') {
                  navigate('/customer/shipments');
                } else if (n.type === 'procurement') {
                  navigate('/customer/buy-for-me');
                } else if (n.type === 'exchange') {
                  navigate('/customer/exchange');
                } else if (n.type === 'delivery') {
                  navigate('/customer/delivery');
                }
              }}
              className={`p-3 rounded-lg border text-xs cursor-pointer transition-colors ${
                n.isRead ? "bg-white border-slate-100 text-slate-500 hover:bg-slate-50" : "bg-blue-50/60 border-blue-200 text-slate-800 font-medium hover:bg-blue-100/50"
              }`}
            >
              <div className="flex justify-between items-start mb-1">
                <span className="font-bold text-slate-800 text-xs">{n.title}</span>
                {!n.isRead && <span className="w-2 h-2 rounded-full bg-brand-orange shrink-0 mt-0.5"></span>}
              </div>
              <p className="m-0 text-slate-600 leading-snug">{n.message}</p>
              {n.createdAt && (
                <div className="text-[10px] text-slate-400 mt-1 text-right">
                  {formatDate(n.createdAt)}
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="py-8 text-center text-slate-400 text-xs">
            No notifications yet
          </div>
        )}
      </div>
      
      <div className="pt-2 border-t border-slate-100 text-center">
        <Link to="/customer/notifications" className="text-xs font-bold text-brand-navy hover:text-brand-orange">
          View all notifications →
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-slate-50">
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 h-screen z-40 transition-all duration-200 ${
          collapsed ? "w-20" : "w-64"
        } ${mobileOpen ? "left-0" : "-left-64 lg:left-0"} bg-white border-r border-slate-200`}
      >
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-200">
          <Logo withText={!collapsed} size="sm" />
        </div>
        <div className="h-[calc(100%-64px)]">
          <SidebarNav
            sections={sections}
            collapsed={collapsed}
            variant="light"
            userName={
              `${user?.firstName || ""} ${user?.lastName || ""}`.trim() ||
              "Customer"
            }
            userSubtitle={user?.customerId || ""}
            userInitial={user?.firstName?.charAt(0) || "C"}
            onSignOut={handleLogout}
          />
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Header */}
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
            <Popover content={notificationContent} trigger="click" placement="bottomRight">
              <div className="relative cursor-pointer text-slate-600 hover:text-brand-navy flex items-center">
                <Badge count={unreadCount} overflowCount={99} size="small" offset={[2, -2]}>
                  <BellOutlined className="text-xl text-slate-600 hover:text-brand-navy" />
                </Badge>
              </div>
            </Popover>

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

        {/* Floating Multilingual AI Chatbot Assistant */}
        <AIChatbotWidget />
      </div>
    </div>
  );
};

export default DashboardLayout;
