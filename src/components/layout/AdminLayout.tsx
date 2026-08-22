import React, { useEffect, useState } from "react";
import { Outlet, useNavigate, Link } from "react-router-dom";
import {
  Button,
  Input,
  Dropdown,
  Badge,
  Popover,
  Modal,
  Form,
  InputNumber,
  Select,
  message,
  Avatar,
  Tag,
  Divider,
} from "antd";
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
  CustomerServiceOutlined,
  BellOutlined,
  QuestionCircleOutlined,
  CheckOutlined,
  PlusOutlined,
  PhoneOutlined,
  GlobalOutlined,
  HistoryOutlined,
} from "@ant-design/icons";
import { Logo } from "../common/Logo";
import { SidebarNav, type SidebarNavSection } from "./SidebarNav";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { logoutUser } from "../../store/slices/authSlice";
import {
  fetchNotifications,
  markAsRead,
  markAllAsRead,
} from "../../store/slices/notificationSlice";
import { fetchAllPackages } from "../../store/slices/adminSlice";
import { createInboundPackage } from "../../store/slices/shipmentSlice";
import { formatDate } from "../../utils/formatters";

const { Option } = Select;

export const AdminLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [helpModalOpen, setHelpModalOpen] = useState(false);
  const [newShipmentModalOpen, setNewShipmentModalOpen] = useState(false);
  const [creatingShipment, setCreatingShipment] = useState(false);

  const [form] = Form.useForm();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { user } = useAppSelector((state) => state.auth);
  const { notifications, unreadCount } = useAppSelector((state) => state.notifications);
  const { users } = useAppSelector((state) => state.admin);

  const role = user?.role;

  useEffect(() => {
    dispatch(fetchNotifications());
  }, [dispatch]);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate("/login");
  };

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;
    navigate(`/admin/warehouse/inbound?search=${encodeURIComponent(searchQuery.trim())}`);
  };

  const handleCreateShipment = async (values: any) => {
    setCreatingShipment(true);
    try {
      const trackingId = `HZ-AIR-${Math.floor(100000 + Math.random() * 900000)}`;
      const selectedUser = users.find((u) => u.id === values.userId || u.customerId === values.userId);
      const customerName = selectedUser ? `${selectedUser.firstName} ${selectedUser.lastName}` : values.customerName || 'Walk-in Client';
      const customerId = selectedUser ? selectedUser.customerId : values.userId || `CUST-${Math.floor(1000 + Math.random() * 9000)}`;

      await dispatch(
        createInboundPackage({
          trackingId,
          chineseTrackingNo: values.chineseTrackingNo || '',
          customerId,
          customerName,
          description: values.description,
          weightKg: values.weightKg || 1,
          length: values.length || 20,
          width: values.width || 20,
          height: values.height || 20,
        })
      ).unwrap();

      message.success(`New shipment created! Tracking ID: ${trackingId}`);
      form.resetFields();
      setNewShipmentModalOpen(false);
      dispatch(fetchAllPackages());

      const w = values.weightKg || 1;
      const l = values.length || 20;
      const wid = values.width || 20;
      const h = values.height || 20;
      const desc = encodeURIComponent(values.description || '');

      navigate(`/admin/warehouse/scan?trackingId=${trackingId}&userId=${values.userId}&weightKg=${w}&length=${l}&width=${wid}&height=${h}&desc=${desc}`);
    } catch {
      message.error("Failed to create new shipment.");
    } finally {
      setCreatingShipment(false);
    }
  };

  const sections: SidebarNavSection[] = [
    {
      title: "Overview",
      items: [
        { key: "/admin", icon: <DashboardOutlined />, label: "Dashboard" },
      ],
    },
  ];

  if (
    role === "super_admin" ||
    role === "warehouse_cn" ||
    role === "warehouse_ng"
  ) {
    sections.push({
      title: "Warehouse Ops",
      items: [
        {
          key: "/admin/warehouse/facilities",
          icon: <DashboardOutlined />,
          label: "Facilities",
        },
        {
          key: "/admin/warehouse/inbound",
          icon: <InboxOutlined />,
          label: "Packages",
        },
        {
          key: "/admin/warehouse/consolidations",
          icon: <AppstoreAddOutlined />,
          label: "Consolidations",
        },
        {
          key: "/admin/warehouse/batches",
          icon: <BlockOutlined />,
          label: "Master Batches",
        },
      ],
    });
  }

  const opsItems = [];
  if (role === "super_admin" || role === "procurement") {
    opsItems.push({
      key: "/admin/procurement",
      icon: <ShoppingCartOutlined />,
      label: "Procurements / Buy For Me",
    });
  }
  if (role === "super_admin" || role === "finance") {
    opsItems.push({
      key: "/admin/exchange",
      icon: <SwapOutlined />,
      label: "RMB Exchange & Payments",
    });
  }
  if (role === "super_admin" || role === "warehouse_ng" || role === "warehouse_cn") {
    opsItems.push({
      key: "/admin/delivery",
      icon: <CarOutlined />,
      label: "Local Dispatch",
    });
  }
  if (opsItems.length) sections.push({ title: "Operations", items: opsItems });

  if (role === "super_admin" || role === "customer_service") {
    const manageItems = [
      {
        key: "/admin/support",
        icon: <CustomerServiceOutlined />,
        label: "Support Tickets",
      },
      {
        key: "/admin/customers",
        icon: <UsergroupAddOutlined />,
        label: "Customers",
      },
    ];

    if (role === "super_admin") {
      manageItems.push(
        { key: "/admin/staff", icon: <TeamOutlined />, label: "Staff Members" },
        {
          key: "/admin/permissions",
          icon: <SafetyCertificateOutlined />,
          label: "Permissions & RBAC",
        },
        {
          key: "/admin/activity-trail",
          icon: <HistoryOutlined />,
          label: "Activity Trail",
        },
        {
          key: "/admin/settings",
          icon: <SettingOutlined />,
          label: "System Settings & Rates",
        }
      );
    }

    sections.push({
      title: "Management",
      items: manageItems,
    });
  }

  const userMenuItems = [
    {
      key: "profile",
      icon: <UserOutlined />,
      label: "Profile Info",
      onClick: () => navigate("/admin/settings"),
    },
    {
      key: "settings",
      icon: <SettingOutlined />,
      label: "Platform Settings",
      onClick: () => navigate("/admin/settings"),
    },
    { type: "divider" as const },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Sign Out",
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
              onClick={() => dispatch(markAsRead(n.id))}
              className={`p-3 rounded-lg border text-xs cursor-pointer transition-colors ${
                n.isRead ? "bg-white border-slate-100 text-slate-500" : "bg-orange-50/50 border-orange-100 text-slate-800 font-medium"
              }`}
            >
              <div className="flex justify-between items-start mb-1">
                <span className="font-bold text-slate-800 text-xs">{n.title}</span>
                {!n.isRead && <span className="w-2 h-2 rounded-full bg-brand-orange"></span>}
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
    </div>
  );

  return (
    <div className="min-h-screen flex bg-slate-100">
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 h-screen z-40 transition-all duration-200 ${
          collapsed ? "w-20" : "w-[264px]"
        } ${mobileOpen ? "left-0" : "-left-72 lg:left-0"} bg-[#0A1128]`}
      >
        <div className="h-[72px] flex items-center px-6 border-b border-white/5 gap-3">
          <Logo
            withText={!collapsed}
            variant="light"
          />
        </div>
        <div className="h-[calc(100%-72px)]">
          <SidebarNav
            sections={sections}
            collapsed={collapsed}
            variant="dark"
            userName={
              `${user?.firstName || ""} ${user?.lastName || ""}`.trim() ||
              "Admin"
            }
            userSubtitle={role?.replace("_", " ").toUpperCase() || ""}
            userInitial={user?.firstName?.charAt(0) || "A"}
            onSignOut={handleLogout}
          />
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 flex flex-col bg-[#F9F7F5]">
        {/* Header */}
        <header className="h-[72px] bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-20 shadow-sm">
          <div className="flex items-center gap-4 flex-1">
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              className="hidden lg:flex text-slate-500"
            />

            {/* Global Search Input */}
            <form onSubmit={handleSearchSubmit} className="hidden md:flex max-w-lg w-full">
              <Input
                placeholder="Search Shipment ID, Tracking # or Customer..."
                prefix={<SearchOutlined className="text-slate-400 mr-1 cursor-pointer" onClick={() => handleSearchSubmit()} />}
                className="w-full bg-slate-50 border-slate-200 hover:border-slate-300 focus:border-brand-orange !rounded-sm !h-10 text-xs"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onPressEnter={() => handleSearchSubmit()}
              />
            </form>
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center gap-5">
            {/* Notification Bell */}
            <Popover content={notificationContent} trigger="click" placement="bottomRight">
              <div className="relative cursor-pointer text-slate-600 hover:text-brand-navy flex items-center">
                <Badge count={unreadCount} overflowCount={99} size="small" offset={[2, -2]}>
                  <BellOutlined className="text-xl text-slate-600 hover:text-brand-navy" />
                </Badge>
              </div>
            </Popover>

            {/* Help / System Guide Icon */}
            <div
              className="cursor-pointer text-slate-600 hover:text-brand-navy flex items-center"
              onClick={() => setHelpModalOpen(true)}
              title="System Help & Support"
            >
              <QuestionCircleOutlined className="text-xl" />
            </div>

            <div className="w-px h-6 bg-slate-200" />

            {/* "+ NEW SHIPMENT" Button */}
            <Button
              type="primary"
              className="!bg-[#D95F18] hover:!bg-[#C05010] !border-none !rounded-sm font-bold uppercase tracking-wider text-xs px-5 h-10 shadow-sm flex items-center gap-2"
              onClick={() => setNewShipmentModalOpen(true)}
            >
              <PlusOutlined /> NEW SHIPMENT
            </Button>

            {/* User Profile Avatar Dropdown */}
            <Dropdown menu={{ items: userMenuItems }} trigger={["click"]} placement="bottomRight">
              <div className="flex items-center gap-2 cursor-pointer pl-2">
                <Avatar
                  size={36}
                  src={user?.avatar || user?.profilePhoto}
                  icon={<UserOutlined />}
                  className="bg-[#0A1128] text-white font-bold"
                />
                <div className="hidden xl:flex flex-col text-left leading-none">
                  <span className="font-bold text-slate-800 text-xs">
                    {user?.firstName} {user?.lastName}
                  </span>
                  <span className="text-[10px] text-slate-400 font-bold uppercase mt-1">
                    {user?.role?.replace("_", " ")}
                  </span>
                </div>
              </div>
            </Dropdown>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 overflow-x-hidden">
          <div className="max-w-[1400px] mx-auto">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Help & Support Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-brand-navy font-bold text-lg">
            <QuestionCircleOutlined className="text-brand-orange" />
            Logicore Admin Help & Operational Guide
          </div>
        }
        open={helpModalOpen}
        onCancel={() => setHelpModalOpen(false)}
        footer={
          <Button type="primary" onClick={() => setHelpModalOpen(false)} className="bg-[#0A1128] font-bold">
            Close Guide
          </Button>
        }
        width={600}
      >
        <div className="space-y-4 py-3 text-sm text-slate-600">
          <div className="bg-orange-50 border border-orange-100 p-4 rounded-lg">
            <div className="font-bold text-[#0A1128] mb-1 flex items-center gap-2">
              <GlobalOutlined className="text-brand-orange" /> Global Hub Operations
            </div>
            <p className="m-0 text-xs leading-relaxed text-slate-600">
              China Warehouse (Guangzhou Hub): Receives supplier packages, scans dimensions & weights, and builds Air/Sea Master Batches.
            </p>
          </div>

          <div className="space-y-2">
            <div className="font-bold text-slate-800">Quick Shortcuts:</div>
            <ul className="list-disc pl-5 text-xs space-y-1">
              <li>Use the <strong>Global Search</strong> in header to find packages by Tracking ID or Customer.</li>
              <li>Click <strong>+ NEW SHIPMENT</strong> to register inbound parcels directly into the database.</li>
              <li>Scan packages under <strong>Warehouse Ops ➔ Packages</strong> to log weight and CBM.</li>
              <li>Approve Naira payments and release RMB under <strong>Operations ➔ Exchange</strong>.</li>
            </ul>
          </div>

          <Divider />

          <div className="flex justify-between items-center text-xs text-slate-500">
            <span>Support Email: <a href="mailto:support@logicore.com" className="font-bold text-brand-navy">support@logicore.com</a></span>
            <span>Hotline: <span className="font-bold text-slate-700">+234 800 LOGICORE</span></span>
          </div>
        </div>
      </Modal>

      {/* New Shipment Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-[#0A1128] font-bold text-lg">
            <PlusOutlined className="text-brand-orange" /> Register Inbound Shipment
          </div>
        }
        open={newShipmentModalOpen}
        onCancel={() => setNewShipmentModalOpen(false)}
        footer={null}
        destroyOnHidden
      >
        <Form form={form} layout="vertical" onFinish={handleCreateShipment} requiredMark={false} className="mt-4">
          <Form.Item
            name="userId"
            label="Customer"
            rules={[{ required: true, message: "Select or enter customer" }]}
          >
            <Select placeholder="Select customer..." showSearch size="large">
              {users.map((u) => (
                <Option key={u.id} value={u.id}>
                  {u.firstName} {u.lastName} ({u.customerId})
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="description"
            label="Package Contents / Description"
            rules={[{ required: true, message: "Please enter description" }]}
          >
            <Input placeholder="e.g. Designer Handbags (50 pcs)" size="large" />
          </Form.Item>

          <Form.Item name="chineseTrackingNo" label="Chinese Domestic Tracking # (Optional)">
            <Input placeholder="e.g. SF182930491823" size="large" />
          </Form.Item>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item name="weightKg" label="Weight (kg)">
              <InputNumber min={0.1} step={0.5} className="w-full" size="large" placeholder="1.0" />
            </Form.Item>
            <Form.Item name="length" label="Length (cm)">
              <InputNumber min={1} className="w-full" size="large" placeholder="20" />
            </Form.Item>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item name="width" label="Width (cm)">
              <InputNumber min={1} className="w-full" size="large" placeholder="20" />
            </Form.Item>
            <Form.Item name="height" label="Height (cm)">
              <InputNumber min={1} className="w-full" size="large" placeholder="20" />
            </Form.Item>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <Button onClick={() => setNewShipmentModalOpen(false)}>Cancel</Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={creatingShipment}
              className="bg-[#0A1128] font-bold px-6"
            >
              Create Shipment
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};
