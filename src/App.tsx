import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ConfigProvider } from "antd";
import { antdTheme } from "./styles/theme";

// Layouts & Guards
import { PublicLayout } from "./components/layout/PublicLayout";
import { DashboardLayout } from "./components/layout/DashboardLayout";
import { AdminLayout } from "./components/layout/AdminLayout";
import { AuthGuard } from "./components/guards/AuthGuard";
import { RoleGuard } from "./components/guards/RoleGuard";

import { LandingPage } from "./pages/public/LandingPage";
import { LoginPage } from "./pages/public/LoginPage";
import { RegisterPage } from "./pages/public/RegisterPage";
import { VerifyOTPPage } from "./pages/public/VerifyOTPPage";
import { SetPasswordPage } from "./pages/public/SetPasswordPage";
import { ForgotPasswordPage } from "./pages/public/ForgotPasswordPage";
import { TrackingPublicPage } from "./pages/public/TrackingPublicPage";
import { ServicesPage } from "./pages/public/ServicesPage";
import { AboutPage } from "./pages/public/AboutPage";
import { ContactPage } from "./pages/public/ContactPage";
import { GetQuotePage } from "./pages/public/GetQuotePage";

import { DashboardHome } from "./pages/dashboard/DashboardHome";

import { MyShipments } from "./pages/customer/shipments/MyShipments";
import { PreAlertForm } from "./pages/customer/shipments/PreAlertForm";
import { ConsolidationPage } from "./pages/customer/shipments/ConsolidationPage";
import { ShipmentDetail } from "./pages/customer/shipments/ShipmentDetail";
import { WarehouseAddresses } from "./pages/customer/shipments/WarehouseAddresses";
import { NewConsolidationPage } from "./pages/customer/shipments/NewConsolidationPage";
import { CustomerSupportTickets } from "./pages/customer/support/CustomerSupportTickets";
import { OpenSupportTicket } from "./pages/customer/support/OpenSupportTicket";
import { BuyForMeList } from "./pages/customer/procurement/BuyForMeList";
import { BuyForMeForm } from "./pages/customer/procurement/BuyForMeForm";
import { ExchangeList } from "./pages/customer/exchange/ExchangeList";
import { ExchangeHistory } from "./pages/customer/exchange/ExchangeHistory";
import { ExchangeRequestForm } from "./pages/customer/exchange/ExchangeRequestForm";
import { LocalDeliveryList } from "./pages/customer/delivery/LocalDeliveryList";
import { LocalDeliveryForm } from "./pages/customer/delivery/LocalDeliveryForm";
import { WalletPage } from "./pages/customer/wallet/WalletPage";
import { ProfilePage } from "./pages/customer/profile/ProfilePage";
import { NotificationsPage } from "./pages/customer/notifications/NotificationsPage";

import { InboundPackages } from "./pages/admin/warehouse/InboundPackages";
import { PackageScanPage } from "./pages/admin/warehouse/PackageScanPage";
import { ExchangeReviewPage } from "./pages/admin/exchange/ExchangeReviewPage";
import { BatchManagement } from "./pages/admin/warehouse/BatchManagement";
import { ConsolidationManagement } from "./pages/admin/warehouse/ConsolidationManagement";
import { WarehouseFacilitiesPage } from "./pages/admin/warehouse/WarehouseFacilitiesPage";
import { NewWarehousePage } from "./pages/admin/warehouse/NewWarehousePage";
import { NewBatchPage } from "./pages/admin/warehouse/NewBatchPage";
import { ViewBatchPage } from "./pages/admin/warehouse/ViewBatchPage";
import { ProcurementReview } from "./pages/admin/procurement/ProcurementReview";
import { ExchangeManagement } from "./pages/admin/exchange/ExchangeManagement";
import { DeliveryDispatch } from "./pages/admin/delivery/DeliveryDispatch";
import { UserManagement } from "./pages/admin/users/UserManagement";
import { PermissionGroups } from "./pages/admin/permissions/PermissionGroups";
import { CreatePermissionGroup } from "./pages/admin/permissions/CreatePermissionGroup";
import { PermissionGroupDetails } from "./pages/admin/permissions/PermissionGroupDetails";
import { StaffMembersList } from "./pages/admin/staff/StaffMembersList";
import { AddStaffMember } from "./pages/admin/staff/AddStaffMember";
import { CustomersList } from "./pages/admin/customers/CustomersList";
import { SupportTicketsList } from "./pages/admin/support/SupportTicketsList";
import { TicketDetails } from "./pages/admin/support/TicketDetails";
import { PlatformSettings } from "./pages/admin/settings/PlatformSettings";
import { AdminDashboardHome } from "./pages/admin/AdminDashboardHome";

function App() {
  return (
    <ConfigProvider theme={antdTheme}>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/get-quote" element={<GetQuotePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/register/verify" element={<VerifyOTPPage />} />
            <Route path="/register/password" element={<SetPasswordPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/track" element={<TrackingPublicPage />} />
          </Route>

          {/* Customer Dashboard Routes */}
          <Route
            path="/customer"
            element={
              <AuthGuard>
                <RoleGuard allowedRoles={["customer"]}>
                  <DashboardLayout />
                </RoleGuard>
              </AuthGuard>
            }
          >
            <Route index element={<DashboardHome />} />
            <Route path="shipments" element={<MyShipments />} />
            <Route path="shipments/pre-alert" element={<PreAlertForm />} />
            <Route path="consolidation" element={<ConsolidationPage />} />
            <Route
              path="consolidation/new"
              element={<NewConsolidationPage />}
            />
            <Route path="shipments/:id" element={<ShipmentDetail />} />
            <Route path="addresses" element={<WarehouseAddresses />} />
            <Route path="buy-for-me" element={<BuyForMeList />} />
            <Route path="buy-for-me/new" element={<BuyForMeForm />} />
            <Route path="support" element={<CustomerSupportTickets />} />
            <Route path="support/new" element={<OpenSupportTicket />} />
            <Route path="exchange" element={<ExchangeList />} />
            <Route path="exchange/history" element={<ExchangeHistory />} />
            <Route path="exchange/new" element={<ExchangeRequestForm />} />
            <Route path="delivery" element={<LocalDeliveryList />} />
            <Route path="delivery/new" element={<LocalDeliveryForm />} />
            <Route path="wallet" element={<WalletPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="notifications" element={<NotificationsPage />} />
          </Route>

          {/* Admin Dashboard Routes */}
          <Route
            path="/admin"
            element={
              <AuthGuard>
                <RoleGuard
                  allowedRoles={[
                    "super_admin",
                    "warehouse_cn",
                    "warehouse_ng",
                    "procurement",
                  ]}
                >
                  <AdminLayout />
                </RoleGuard>
              </AuthGuard>
            }
          >
            <Route index element={<AdminDashboardHome />} />
            <Route path="warehouse/inbound" element={<InboundPackages />} />
            <Route
              path="warehouse/facilities"
              element={<WarehouseFacilitiesPage />}
            />
            <Route
              path="warehouse/facilities/new"
              element={<NewWarehousePage />}
            />
            <Route path="warehouse/scan" element={<PackageScanPage />} />
            <Route
              path="warehouse/consolidations"
              element={<ConsolidationManagement />}
            />
            <Route path="warehouse/batches" element={<BatchManagement />} />
            <Route path="warehouse/batches/new" element={<NewBatchPage />} />
            <Route path="warehouse/batches/:id" element={<ViewBatchPage />} />
            <Route path="procurement" element={<ProcurementReview />} />
            <Route path="exchange" element={<ExchangeManagement />} />
            <Route path="exchange/:id" element={<ExchangeReviewPage />} />
            <Route path="delivery" element={<DeliveryDispatch />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="customers" element={<CustomersList />} />
            <Route path="staff" element={<StaffMembersList />} />
            <Route path="staff/new" element={<AddStaffMember />} />
            <Route path="support" element={<SupportTicketsList />} />
            <Route path="support/:id" element={<TicketDetails />} />
            <Route path="permissions" element={<PermissionGroups />} />
            <Route path="permissions/new" element={<CreatePermissionGroup />} />
            <Route
              path="permissions/:id"
              element={<PermissionGroupDetails />}
            />
            <Route path="settings" element={<PlatformSettings />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  );
}

export default App;
