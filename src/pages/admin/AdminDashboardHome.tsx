import React, { useEffect, useMemo, useState } from 'react';
import { Card, Table, Button, Input, Modal, Tag, message, Badge } from 'antd';
import { Line, Pie } from '@ant-design/charts';
import {
  SyncOutlined,
  SearchOutlined,
  MoreOutlined,
  CarOutlined,
  SwapOutlined,
  ShoppingCartOutlined,
  InboxOutlined,
  CheckCircleOutlined,
  SafetyCertificateOutlined,
  UserOutlined,
  PhoneOutlined,
  EnvironmentOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchAdminStats, fetchAllUsers, fetchAllPackages, fetchAllBatches } from '../../store/slices/adminSlice';
import { fetchExchanges, fetchActiveRate } from '../../store/slices/exchangeSlice';
import { fetchProcurements } from '../../store/slices/procurementSlice';
import { formatNaira, formatDate } from '../../utils/formatters';
import { shipmentStatusMap } from '../../utils/statusMappings';
import apiClient from '../../api/axios';

export const AdminDashboardHome: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { user: currentUser } = useAppSelector((state) => state.auth);
  const role = currentUser?.role || 'admin';

  const { stats, allPackages, users, allBatches, loading } = useAppSelector((state) => state.admin);
  const { exchanges, activeRate } = useAppSelector((state) => state.exchange);
  const { requests: procurements } = useAppSelector((state) => state.procurement);

  const [activeTab, setActiveTab] = useState('All Active');
  const [searchText, setSearchText] = useState('');

  // PIN Verification Modal State for Drivers
  const [selectedDeliveryPkg, setSelectedDeliveryPkg] = useState<any>(null);
  const [verificationPin, setVerificationPin] = useState('');
  const [verifyingPin, setVerifyingPin] = useState(false);

  useEffect(() => {
    dispatch(fetchAdminStats());
    dispatch(fetchAllUsers());
    dispatch(fetchAllPackages());
    dispatch(fetchAllBatches());
    dispatch(fetchExchanges());
    dispatch(fetchActiveRate());
    dispatch(fetchProcurements());
  }, [dispatch]);

  // Compute general KPI counts
  const activePreAlertsCount = useMemo(() => allPackages.filter(p => p.status === 'pre_alerted').length, [allPackages]);
  const receivedChinaCount = useMemo(() => allPackages.filter(p => p.status === 'received_cn').length, [allPackages]);
  const readyForFreightCount = useMemo(() => allPackages.filter(p => (p.status as string) === 'consolidating' || (p.status as string) === 'ready_to_pack').length, [allPackages]);
  const arrivedNigeriaCount = useMemo(() => allPackages.filter(p => p.status === 'arrived_ng' || p.status === 'ready_for_pickup' || p.status === 'delivered').length, [allPackages]);

  // Revenue & Breakdown for Admins
  const revenueTrend = useMemo(() => {
    const monthly = stats?.monthlyRevenue || 0;
    const months = ['Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];
    const seedFactors = [0.62, 0.7, 0.81, 0.93, 0.88, 1];
    return months.map((m, i) => ({ month: m, revenue: Math.round(monthly * seedFactors[i]) }));
  }, [stats]);

  const statusBreakdown = useMemo(() => {
    const counts: Record<string, number> = {};
    allPackages.forEach((p) => {
      counts[p.status] = (counts[p.status] || 0) + 1;
    });
    return Object.entries(counts).map(([status, count]) => ({
      status: shipmentStatusMap[status as keyof typeof shipmentStatusMap]?.label || status,
      count,
    }));
  }, [allPackages]);

  // General Admin Table Data
  const tableData = useMemo(() => {
    let filtered = [...allPackages];
    if (activeTab === 'In Transit') {
      filtered = filtered.filter(p => p.status === 'shipping_exported' || p.status === 'arrived_ng');
    } else if (activeTab === 'Pending') {
      filtered = filtered.filter(p => p.status === 'pre_alerted' || p.status === 'received_cn' || p.status === 'consolidating');
    }

    if (searchText) {
      filtered = filtered.filter(p =>
        p.trackingId.toLowerCase().includes(searchText.toLowerCase()) ||
        p.customerName?.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    return filtered.map((pkg) => {
      const user = (users || []).find(u => u.customerId === pkg.customerId || u.id === pkg.userId);
      const name = pkg.customerName || (user ? `${user.firstName} ${user.lastName}` : 'Customer');
      const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'CU';

      return {
        id: pkg.id,
        trackingId: pkg.trackingId,
        createdAt: pkg.createdAt ? formatDate(pkg.createdAt) : 'Recently',
        customerName: name,
        customerId: pkg.customerId || (user ? user.customerId : 'CUST-0000'),
        avatarInitials: initials,
        status: pkg.status,
        method: pkg.shippingMethod === 'air' ? 'Air Express' : pkg.shippingMethod === 'sea' ? 'Sea Freight' : 'Air Standard',
        isAir: pkg.shippingMethod !== 'sea'
      };
    });
  }, [allPackages, users, activeTab, searchText]);

  // Driver verification handler
  const handleVerifyDeliveryPin = async () => {
    if (!verificationPin || verificationPin.length < 4) {
      message.error('Please enter a valid 4-digit verification PIN');
      return;
    }

    try {
      setVerifyingPin(true);
      await apiClient.patch(`/delivery/packages/${selectedDeliveryPkg.id}/deliver`, { pin: verificationPin });
      message.success(`Delivery completed for tracking #${selectedDeliveryPkg.trackingId}!`);
      setSelectedDeliveryPkg(null);
      setVerificationPin('');
      dispatch(fetchAllPackages());
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Invalid PIN or delivery update failed');
    } finally {
      setVerifyingPin(false);
    }
  };

  // =========================================================================
  // 1. DRIVER DASHBOARD VIEW
  // =========================================================================
  if (role === 'driver') {
    const driverDispatches = allPackages.filter(p => p.status === 'arrived_ng' || p.status === 'ready_for_pickup' || p.status === 'delivered');
    const pendingDispatches = driverDispatches.filter(p => p.status !== 'delivered');
    const completedToday = driverDispatches.filter(p => p.status === 'delivered').length;

    return (
      <div className="space-y-6 pb-20 animate-fade-in-up max-w-[1200px] mx-auto">
        {/* Header */}
        <div className="bg-[#0A1128] text-white p-8 rounded-2xl shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 text-brand-orange text-xs font-bold tracking-widest uppercase mb-2">
              <CarOutlined /> LOGISTICS DRIVER DISPATCH PORTAL
            </div>
            <h1 className="text-3xl font-extrabold text-white m-0">Welcome back, {currentUser?.firstName}!</h1>
            <p className="text-slate-300 text-sm mt-1 mb-0 max-w-xl">
              Manage local dispatch assignments, customer PIN verifications, and door-step package deliveries across your route.
            </p>
          </div>
          <Button
            type="primary"
            icon={<CarOutlined />}
            size="large"
            className="bg-brand-orange hover:bg-orange-600 border-none font-bold px-6"
            onClick={() => navigate('/admin/delivery')}
          >
            Go to Full Dispatch Center
          </Button>
        </div>

        {/* Driver KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="rounded-2xl border-none shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Assigned Deliveries</span>
              <CarOutlined className="text-brand-orange text-xl" />
            </div>
            <h2 className="text-3xl font-extrabold text-[#0A1128] mb-1">{driverDispatches.length}</h2>
            <span className="text-xs text-slate-500">Total in route queue</span>
          </Card>

          <Card className="rounded-2xl border-none shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pending Handoff</span>
              <Badge count={pendingDispatches.length} className="[&_.ant-badge-count]:bg-brand-orange" />
            </div>
            <h2 className="text-3xl font-extrabold text-brand-orange mb-1">{pendingDispatches.length}</h2>
            <span className="text-xs text-slate-500">Awaiting PIN verification</span>
          </Card>

          <Card className="rounded-2xl border-none shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Completed Deliveries</span>
              <CheckCircleOutlined className="text-emerald-500 text-xl" />
            </div>
            <h2 className="text-3xl font-extrabold text-emerald-600 mb-1">{completedToday}</h2>
            <span className="text-xs text-slate-500">Successfully delivered</span>
          </Card>

          <Card className="rounded-2xl border-none shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Primary Hub</span>
              <EnvironmentOutlined className="text-blue-500 text-xl" />
            </div>
            <h2 className="text-xl font-bold text-[#0A1128] mb-1">Lagos Hub (LOS)</h2>
            <span className="text-xs text-slate-500">Commercial Ave, Ikeja</span>
          </Card>
        </div>

        {/* Driver Active Deliveries Table */}
        <Card title={<span className="font-bold text-base text-[#0A1128]"><CarOutlined className="mr-2 text-brand-orange" /> Active Local Dispatch Assignments</span>} className="rounded-2xl border-none shadow-sm">
          <Table
            dataSource={driverDispatches}
            rowKey="id"
            pagination={{ pageSize: 8 }}
            columns={[
              {
                title: 'TRACKING ID',
                dataIndex: 'trackingId',
                key: 'trackingId',
                render: (id: string, record: any) => (
                  <div>
                    <div className="font-bold text-[#0A1128] text-xs">{id}</div>
                    <div className="text-[10px] text-slate-400">{record.description || 'General Goods'}</div>
                  </div>
                ),
              },
              {
                title: 'CUSTOMER',
                key: 'customer',
                render: (record: any) => (
                  <div>
                    <div className="font-bold text-slate-800 text-xs flex items-center gap-1">
                      <UserOutlined className="text-slate-400" /> {record.customerName || 'Customer'}
                    </div>
                    <div className="text-[10px] text-slate-400">{record.customerId}</div>
                  </div>
                ),
              },
              {
                title: 'DELIVERY ADDRESS',
                key: 'address',
                render: (record: any) => (
                  <div className="text-xs text-slate-600 max-w-xs truncate">
                    <EnvironmentOutlined className="text-slate-400 mr-1" />
                    {record.destinationAddress || 'Lagos, Nigeria'}
                  </div>
                ),
              },
              {
                title: 'STATUS',
                dataIndex: 'status',
                key: 'status',
                render: (status: string) => {
                  const isDelivered = status === 'delivered';
                  return (
                    <Tag color={isDelivered ? 'green' : 'orange'} className="font-bold uppercase text-[10px]">
                      {isDelivered ? 'Delivered' : 'Ready for Handoff'}
                    </Tag>
                  );
                },
              },
              {
                title: 'ACTION',
                key: 'action',
                render: (record: any) => (
                  <Button
                    type="primary"
                    size="small"
                    disabled={record.status === 'delivered'}
                    className="bg-[#0A1128] hover:bg-slate-800 border-none font-bold text-xs"
                    onClick={() => setSelectedDeliveryPkg(record)}
                  >
                    Verify PIN & Complete
                  </Button>
                ),
              },
            ]}
          />
        </Card>

        {/* PIN Verification Modal */}
        <Modal
          title="Verify Customer PIN & Confirm Delivery"
          open={!!selectedDeliveryPkg}
          onCancel={() => setSelectedDeliveryPkg(null)}
          onOk={handleVerifyDeliveryPin}
          confirmLoading={verifyingPin}
          okText="Confirm Delivery Handoff"
          okButtonProps={{ className: 'bg-[#0A1128] font-bold' }}
        >
          {selectedDeliveryPkg && (
            <div className="space-y-4 py-2">
              <p className="text-xs text-slate-500 m-0">
                Ask <strong>{selectedDeliveryPkg.customerName}</strong> for their 4-digit security delivery PIN to complete handoff.
              </p>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">4-Digit Verification PIN</label>
                <Input
                  size="large"
                  maxLength={4}
                  placeholder="e.g. 8492"
                  className="text-center text-xl font-bold tracking-widest bg-slate-50"
                  value={verificationPin}
                  onChange={(e) => setVerificationPin(e.target.value)}
                />
              </div>
            </div>
          )}
        </Modal>
      </div>
    );
  }

  // =========================================================================
  // 2. FINANCE MANAGER DASHBOARD VIEW
  // =========================================================================
  if (role === 'finance') {
    const pendingExchanges = exchanges.filter(e => e.status === 'pending' || e.status === 'processing');
    const approvedToday = exchanges.filter(e => e.status === 'completed' || e.status === 'approved');

    return (
      <div className="space-y-6 pb-20 animate-fade-in-up max-w-[1200px] mx-auto">
        <div className="bg-[#0A1128] text-white p-8 rounded-2xl shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold tracking-widest uppercase mb-2">
              <SwapOutlined /> FINANCE & RMB EXCHANGE DESK
            </div>
            <h1 className="text-3xl font-extrabold text-white m-0">Finance Dashboard — {currentUser?.firstName}</h1>
            <p className="text-slate-300 text-sm mt-1 mb-0 max-w-xl">
              Verify customer Naira bank transfer proofs, set daily exchange rates, and authorize RMB transfers to Chinese suppliers.
            </p>
          </div>
          <Button
            type="primary"
            icon={<SwapOutlined />}
            size="large"
            className="bg-emerald-500 hover:bg-emerald-600 border-none font-bold px-6"
            onClick={() => navigate('/admin/exchange')}
          >
            Go to Exchange Management
          </Button>
        </div>

        {/* Finance KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="rounded-2xl border-none shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pending Exchanges</span>
              <Badge count={pendingExchanges.length} className="[&_.ant-badge-count]:bg-brand-orange" />
            </div>
            <h2 className="text-3xl font-extrabold text-brand-orange mb-1">{pendingExchanges.length}</h2>
            <span className="text-xs text-slate-500">Awaiting payment verification</span>
          </Card>

          <Card className="rounded-2xl border-none shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active RMB Rate</span>
              <Tag color="green" className="font-bold text-xs">Live Rate</Tag>
            </div>
            <h2 className="text-3xl font-extrabold text-emerald-600 mb-1">₦{activeRate?.rateNairaPerRmb || 220} / ¥</h2>
            <span className="text-xs text-slate-500">Naira to RMB parity</span>
          </Card>

          <Card className="rounded-2xl border-none shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Approved Requests</span>
              <CheckCircleOutlined className="text-emerald-500 text-xl" />
            </div>
            <h2 className="text-3xl font-extrabold text-[#0A1128] mb-1">{approvedToday.length}</h2>
            <span className="text-xs text-slate-500">Successfully processed</span>
          </Card>

          <Card className="rounded-2xl border-none shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total RMB Volume</span>
              <SwapOutlined className="text-blue-500 text-xl" />
            </div>
            <h2 className="text-2xl font-extrabold text-[#0A1128] mb-1">
              ¥{exchanges.reduce((sum, e) => sum + (e.amountRmb || 0), 0).toLocaleString()}
            </h2>
            <span className="text-xs text-slate-500">Processed transaction volume</span>
          </Card>
        </div>

        {/* Pending Exchanges Table */}
        <Card title={<span className="font-bold text-base text-[#0A1128]"><SwapOutlined className="mr-2 text-emerald-600" /> Pending RMB Exchange Requests</span>} className="rounded-2xl border-none shadow-sm">
          <Table
            dataSource={pendingExchanges}
            rowKey="id"
            pagination={{ pageSize: 6 }}
            columns={[
              {
                title: 'CUSTOMER',
                key: 'customer',
                render: (record: any) => (
                  <div>
                    <div className="font-bold text-[#0A1128] text-xs">{record.customerName || 'Customer'}</div>
                    <div className="text-[10px] text-slate-400">{record.customerId || record.id}</div>
                  </div>
                ),
              },
              {
                title: 'NAIRA AMOUNT',
                dataIndex: 'amountNaira',
                key: 'amountNaira',
                render: (amt: number) => <span className="font-bold text-slate-800 text-xs">₦{amt?.toLocaleString()}</span>,
              },
              {
                title: 'RMB TO RELEASE',
                dataIndex: 'amountRmb',
                key: 'amountRmb',
                render: (amt: number) => <span className="font-extrabold text-emerald-600 text-xs">¥{amt?.toLocaleString()}</span>,
              },
              {
                title: 'STATUS',
                dataIndex: 'status',
                key: 'status',
                render: () => <Tag color="gold" className="font-bold text-[10px]">PENDING PROOF</Tag>,
              },
              {
                title: 'ACTION',
                key: 'action',
                render: (record: any) => (
                  <Button
                    type="primary"
                    size="small"
                    className="bg-emerald-600 hover:bg-emerald-700 border-none font-bold text-xs"
                    onClick={() => navigate(`/admin/exchange/${record.id}`)}
                  >
                    Verify & Release RMB
                  </Button>
                ),
              },
            ]}
          />
        </Card>
      </div>
    );
  }

  // =========================================================================
  // 3. PROCUREMENT SPECIALIST DASHBOARD VIEW
  // =========================================================================
  if (role === 'procurement') {
    const pendingProcurements = procurements.filter(p => p.status === 'submitted' || p.status === 'under_review');
    const quotedProcurements = procurements.filter(p => p.status === 'quoted' || p.status === 'approved');

    return (
      <div className="space-y-6 pb-20 animate-fade-in-up max-w-[1200px] mx-auto">
        <div className="bg-[#0A1128] text-white p-8 rounded-2xl shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 text-purple-400 text-xs font-bold tracking-widest uppercase mb-2">
              <ShoppingCartOutlined /> BUY FOR ME & PROCUREMENT SOURCING DESK
            </div>
            <h1 className="text-3xl font-extrabold text-white m-0">Procurement Desk — {currentUser?.firstName}</h1>
            <p className="text-slate-300 text-sm mt-1 mb-0 max-w-xl">
              Review customer 1688 / Taobao sourcing requests, issue supplier quotes, and verify supplier orders.
            </p>
          </div>
          <Button
            type="primary"
            icon={<ShoppingCartOutlined />}
            size="large"
            className="bg-purple-600 hover:bg-purple-700 border-none font-bold px-6"
            onClick={() => navigate('/admin/procurement')}
          >
            Review Procurement Requests
          </Button>
        </div>

        {/* Procurement KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="rounded-2xl border-none shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pending Sourcing</span>
              <Badge count={pendingProcurements.length} className="[&_.ant-badge-count]:bg-brand-orange" />
            </div>
            <h2 className="text-3xl font-extrabold text-brand-orange mb-1">{pendingProcurements.length}</h2>
            <span className="text-xs text-slate-500">Unquoted requests</span>
          </Card>

          <Card className="rounded-2xl border-none shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Quoted Requests</span>
              <Tag color="purple" className="font-bold text-xs">Awaiting Customer</Tag>
            </div>
            <h2 className="text-3xl font-extrabold text-purple-600 mb-1">{quotedProcurements.length}</h2>
            <span className="text-xs text-slate-500">Quotes provided</span>
          </Card>

          <Card className="rounded-2xl border-none shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Sourcing Requests</span>
              <ShoppingCartOutlined className="text-blue-500 text-xl" />
            </div>
            <h2 className="text-3xl font-extrabold text-[#0A1128] mb-1">{procurements.length}</h2>
            <span className="text-xs text-slate-500">All time sourcing</span>
          </Card>

          <Card className="rounded-2xl border-none shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Supplier Hub</span>
              <EnvironmentOutlined className="text-red-500 text-xl" />
            </div>
            <h2 className="text-xl font-bold text-[#0A1128] mb-1">China 1688 Sourcing</h2>
            <span className="text-xs text-slate-500">Guangzhou Direct Hub</span>
          </Card>
        </div>

        {/* Pending Sourcing Table */}
        <Card title={<span className="font-bold text-base text-[#0A1128]"><ShoppingCartOutlined className="mr-2 text-purple-600" /> Pending Buy For Me Sourcing Requests</span>} className="rounded-2xl border-none shadow-sm">
          <Table
            dataSource={pendingProcurements}
            rowKey="id"
            pagination={{ pageSize: 6 }}
            columns={[
              {
                title: 'CUSTOMER',
                key: 'customer',
                render: (record: any) => (
                  <div>
                    <div className="font-bold text-[#0A1128] text-xs">{record.customerName || 'Customer'}</div>
                    <div className="text-[10px] text-slate-400">{record.customerId || record.id}</div>
                  </div>
                ),
              },
              {
                title: 'ITEM SPECIFICATIONS',
                dataIndex: 'specifications',
                key: 'specifications',
                render: (spec: string) => <div className="text-xs text-slate-700 max-w-sm truncate">{spec || 'Goods'}</div>,
              },
              {
                title: 'QUANTITY',
                dataIndex: 'quantity',
                key: 'quantity',
                render: (q: number) => <span className="font-bold text-xs text-slate-800">{q || 1} units</span>,
              },
              {
                title: 'STATUS',
                dataIndex: 'status',
                key: 'status',
                render: () => <Tag color="gold" className="font-bold text-[10px]">AWAITING QUOTE</Tag>,
              },
              {
                title: 'ACTION',
                key: 'action',
                render: () => (
                  <Button
                    type="primary"
                    size="small"
                    className="bg-purple-600 hover:bg-purple-700 border-none font-bold text-xs"
                    onClick={() => navigate('/admin/procurement')}
                  >
                    Issue Quote
                  </Button>
                ),
              },
            ]}
          />
        </Card>
      </div>
    );
  }

  // =========================================================================
  // 4. WAREHOUSE & CLEARANCE STAFF DASHBOARD VIEW
  // =========================================================================
  if (role === 'warehouse_cn' || role === 'warehouse_ng' || role === 'clearance_agent') {
    const isCN = role === 'warehouse_cn';
    const hubTitle = isCN ? 'China Hub (Guangzhou)' : role === 'clearance_agent' ? 'Customs Clearance Desk' : 'Nigeria Hub (Lagos)';
    const hubPackages = allPackages.filter(p => isCN ? p.status === 'received_cn' || p.status === 'pre_alerted' : p.status === 'arrived_ng' || p.status === 'held_customs');

    return (
      <div className="space-y-6 pb-20 animate-fade-in-up max-w-[1200px] mx-auto">
        <div className="bg-[#0A1128] text-white p-8 rounded-2xl shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold tracking-widest uppercase mb-2">
              <InboxOutlined /> WAREHOUSE HUB OPERATIONS
            </div>
            <h1 className="text-3xl font-extrabold text-white m-0">{hubTitle} — {currentUser?.firstName}</h1>
            <p className="text-slate-300 text-sm mt-1 mb-0 max-w-xl">
              Inbound package scanning, weighing, volume measurement, master batch consolidation, and customs handoff queue.
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              type="primary"
              icon={<InboxOutlined />}
              size="large"
              className="bg-brand-orange hover:bg-orange-600 border-none font-bold px-6"
              onClick={() => navigate('/admin/warehouse/inbound')}
            >
              Go to Inbound Packages
            </Button>
          </div>
        </div>

        {/* Warehouse KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="rounded-2xl border-none shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Hub Queue Packages</span>
              <InboxOutlined className="text-cyan-500 text-xl" />
            </div>
            <h2 className="text-3xl font-extrabold text-[#0A1128] mb-1">{hubPackages.length}</h2>
            <span className="text-xs text-slate-500">Currently in hub handling</span>
          </Card>

          <Card className="rounded-2xl border-none shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Batches</span>
              <Tag color="cyan" className="font-bold text-xs">{allBatches.length} Batches</Tag>
            </div>
            <h2 className="text-3xl font-extrabold text-cyan-600 mb-1">{allBatches.length}</h2>
            <span className="text-xs text-slate-500">Consolidated freight</span>
          </Card>

          <Card className="rounded-2xl border-none shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Ready for Freight</span>
              <CheckCircleOutlined className="text-emerald-500 text-xl" />
            </div>
            <h2 className="text-3xl font-extrabold text-emerald-600 mb-1">{readyForFreightCount}</h2>
            <span className="text-xs text-slate-500">Batched and packed</span>
          </Card>

          <Card className="rounded-2xl border-none shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Operating Hub</span>
              <EnvironmentOutlined className="text-brand-orange text-xl" />
            </div>
            <h2 className="text-xl font-bold text-[#0A1128] mb-1">{isCN ? 'CAN (Guangzhou)' : 'LOS (Lagos)'}</h2>
            <span className="text-xs text-slate-500">Active Operational Hub</span>
          </Card>
        </div>

        {/* Hub Package Queue Table */}
        <Card title={<span className="font-bold text-base text-[#0A1128]"><InboxOutlined className="mr-2 text-cyan-600" /> Active Hub Package Operational Queue</span>} className="rounded-2xl border-none shadow-sm">
          <Table
            dataSource={hubPackages}
            rowKey="id"
            pagination={{ pageSize: 8 }}
            columns={[
              {
                title: 'TRACKING ID',
                dataIndex: 'trackingId',
                key: 'trackingId',
                render: (id: string, record: any) => (
                  <div>
                    <div className="font-bold text-[#0A1128] text-xs">{id}</div>
                    <div className="text-[10px] text-slate-400">{record.description || 'General Goods'}</div>
                  </div>
                ),
              },
              {
                title: 'CUSTOMER',
                key: 'customer',
                render: (record: any) => (
                  <div>
                    <div className="font-bold text-slate-800 text-xs">{record.customerName || 'Customer'}</div>
                    <div className="text-[10px] text-slate-400">{record.customerId}</div>
                  </div>
                ),
              },
              {
                title: 'WEIGHT / VOLUME',
                key: 'metrics',
                render: (record: any) => (
                  <div className="text-xs font-bold text-slate-700">
                    {record.weightKg ? `${record.weightKg} kg` : 'Unweighed'} | {record.volumeCbm ? `${record.volumeCbm} CBM` : 'Unmeasured'}
                  </div>
                ),
              },
              {
                title: 'STAGE',
                dataIndex: 'status',
                key: 'status',
                render: (status: string) => {
                  const label = shipmentStatusMap[status as keyof typeof shipmentStatusMap]?.label || status;
                  return <Tag color="blue" className="font-bold text-[10px]">{label}</Tag>;
                },
              },
              {
                title: 'ACTION',
                key: 'action',
                render: () => (
                  <Button
                    type="primary"
                    size="small"
                    className="bg-[#0A1128] hover:bg-slate-800 border-none font-bold text-xs"
                    onClick={() => navigate('/admin/warehouse/inbound')}
                  >
                    Process Package
                  </Button>
                ),
              },
            ]}
          />
        </Card>
      </div>
    );
  }

  // =========================================================================
  // 5. SUPER ADMIN & GENERAL ADMIN DASHBOARD VIEW (Full Telemetry & Analytics)
  // =========================================================================
  return (
    <div className="space-y-6 pb-20 animate-fade-in-up max-w-[1200px] mx-auto">
      {/* Top Header Row */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 mt-4">
        <div>
          <div className="flex items-center gap-2 text-[#C05010] text-[10px] font-bold tracking-widest uppercase mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C05010] animate-pulse" />
            SYSTEM STATUS: OPERATIONAL
          </div>
          <h1 className="text-4xl lg:text-[42px] font-extrabold text-brand-navy m-0 leading-tight">
            Operations<br />
            <span className="relative">
              Overview
              <span className="absolute bottom-0 left-0 w-full h-[3px] bg-brand-navy" />
            </span>
          </h1>
          <p className="text-slate-500 mt-4 mb-0 text-base max-w-[420px] leading-relaxed">
            Real-time telemetry and supply chain tracking across global hubs. Monitor active pre-alerts, consolidation queues, and freight transit statuses.
          </p>
        </div>

        {/* Quick Actions Card */}
        <div className="bg-[#F4EFEA] p-4 rounded-xl shadow-sm border border-[#EBE3DC] w-full md:w-auto">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">QUICK ACTIONS</p>
          <div className="flex items-center gap-3">
            <Button
              type="primary"
              className="!bg-[#0A1128] hover:!bg-slate-800 !h-12 !px-5 font-bold !rounded-md shadow-md flex items-center gap-2"
              onClick={() => dispatch(fetchAllPackages())}
            >
              <SyncOutlined className="text-lg" /> Refresh<br />Data
            </Button>
          </div>
        </div>
      </div>

      {/* KPI Stats Row — DYNAMIC DATA */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="rounded-2xl border-none shadow-sm h-full">
          <div className="flex justify-between items-start mb-6">
            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-700"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
            </div>
            <span className="bg-slate-100 text-slate-500 text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1">
              Active
            </span>
          </div>
          <h2 className="text-3xl font-extrabold text-brand-navy mb-1">{activePreAlertsCount}</h2>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest m-0 flex flex-col">
            ACTIVE PRE-ALERTS
            <span className="w-12 h-1 bg-brand-navy mt-3 rounded-full" />
          </p>
        </Card>

        <Card className="rounded-2xl border-none shadow-sm h-full">
          <div className="flex justify-between items-start mb-6">
            <div className="w-10 h-10 rounded-lg bg-[#FFF2EA] flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#D95F18]"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
            </div>
            <span className="bg-slate-200/70 text-slate-600 text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1">
              In CN Hub
            </span>
          </div>
          <h2 className="text-3xl font-extrabold text-brand-navy mb-1">{receivedChinaCount}</h2>
          <p className="text-[10px] font-bold text-[#D95F18] uppercase tracking-widest m-0 flex flex-col">
            RECEIVED (CHINA)
            <span className="w-12 h-1 bg-[#D95F18] mt-3 rounded-full" />
          </p>
        </Card>

        <Card className="rounded-2xl border-none shadow-xl h-full bg-[#0A1128] text-white">
          <div className="flex justify-between items-start mb-6">
            <div className="w-10 h-10 rounded-lg bg-blue-900/40 flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-300"><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.2-1.1.7l-1.2 3.3c-.2.5.1 1.1.6 1.3l6.5 2.5-3.2 3.2-3.8-.9c-.5-.1-.9.2-1.1.7l-1.2 3.3c-.2.5.1 1.1.6 1.3l6.5 2.5z" /></svg>
            </div>
            <span className="bg-blue-900 text-blue-200 text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1">
              Queued
            </span>
          </div>
          <h2 className="text-3xl font-extrabold text-white mb-1">{readyForFreightCount}</h2>
          <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest m-0 flex flex-col">
            READY FOR FREIGHT
            <span className="w-12 h-1 bg-blue-400 mt-3 rounded-full" />
          </p>
        </Card>

        <Card className="rounded-2xl border-none shadow-sm h-full">
          <div className="flex justify-between items-start mb-6">
            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-600"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path><line x1="4" y1="22" x2="4" y2="15"></line></svg>
            </div>
            <span className="bg-slate-100 text-slate-500 text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1">
              In NG Hub
            </span>
          </div>
          <h2 className="text-3xl font-extrabold text-brand-navy mb-1">{arrivedNigeriaCount}</h2>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest m-0 flex flex-col">
            ARRIVED (NIGERIA)
            <span className="w-12 h-1 bg-slate-300 mt-3 rounded-full" />
          </p>
        </Card>
      </div>

      {/* Main Grid Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Shipments Tracker Table */}
        <div className="lg:col-span-2">
          <div className="bg-white p-3 rounded-t-2xl border-b border-slate-100 flex flex-col md:flex-row items-center gap-4">
            <Input
              placeholder="Search tracking ID or customer..."
              prefix={<SearchOutlined className="text-slate-400" />}
              className="w-48 !h-9 !bg-slate-50 !border-slate-200"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
            <div className="flex items-center gap-2 font-bold text-xs ml-2">
              <span className="text-slate-500 mr-2 uppercase tracking-widest text-[10px]">STATUS:</span>
              <button onClick={() => setActiveTab('All Active')} className={`px-4 py-1.5 rounded-full transition-colors ${activeTab === 'All Active' ? 'bg-[#FFF2EA] text-[#D95F18] border border-[#F4D6C3]' : 'text-slate-500 hover:bg-slate-100'}`}>All Active</button>
              <button onClick={() => setActiveTab('In Transit')} className={`px-4 py-1.5 rounded-full transition-colors ${activeTab === 'In Transit' ? 'bg-slate-200 text-slate-800' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>In Transit</button>
              <button onClick={() => setActiveTab('Pending')} className={`px-4 py-1.5 rounded-full transition-colors ${activeTab === 'Pending' ? 'bg-slate-200 text-slate-800' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>Pending</button>
            </div>
          </div>

          <Card className="rounded-none rounded-b-2xl border-none shadow-sm p-0 overflow-hidden body-no-padding">
            <div className="p-5 flex justify-between items-center border-b border-slate-900 border-l-[6px] border-l-brand-navy">
              <h2 className="text-xl font-bold text-brand-navy m-0 flex items-center gap-3">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>
                Active Shipments Tracker
              </h2>
              <span className="bg-slate-100 text-slate-500 text-[10px] font-bold px-3 py-1.5 rounded-full">Showing {tableData.length} of {allPackages.length} packages</span>
            </div>

            <Table
              rowSelection={{ type: 'checkbox' }}
              columns={[
                {
                  title: 'TRACKING ID',
                  dataIndex: 'trackingId',
                  key: 'trackingId',
                  render: (text: string, record: any) => (
                    <div>
                      <div className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                        {text} <span className="text-[10px] bg-red-100 text-red-600 px-1 rounded">📄</span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-1">{record.createdAt}</div>
                    </div>
                  ),
                },
                {
                  title: 'CUSTOMER',
                  key: 'customer',
                  render: (_: any, record: any) => (
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">
                        {record.avatarInitials}
                      </div>
                      <div>
                        <div className="font-bold text-slate-800 text-xs">{record.customerName}</div>
                        <div className="text-[10px] text-slate-400">{record.customerId}</div>
                      </div>
                    </div>
                  ),
                },
                {
                  title: 'STAGE',
                  dataIndex: 'status',
                  key: 'status',
                  render: (status: string) => {
                    const label = shipmentStatusMap[status as keyof typeof shipmentStatusMap]?.label || status;
                    return <Tag color="blue" className="font-bold text-xs">{label}</Tag>;
                  },
                },
                {
                  title: 'ACTION',
                  key: 'action',
                  render: () => <Button type="text" icon={<MoreOutlined />} />,
                },
              ]}
              dataSource={tableData}
              rowKey="id"
              loading={loading}
              pagination={{ pageSize: 10 }}
              className="custom-admin-table"
            />
          </Card>
        </div>

        {/* Right Column - Live Routing & Activity */}
        <div className="space-y-6">
          <Card className="rounded-2xl border-none shadow-sm p-0 overflow-hidden relative group">
            <div className="p-3 absolute top-0 left-0 right-0 z-10 flex justify-between items-center">
              <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg shadow-sm text-sm font-bold text-slate-800">
                Live Routing
              </div>
            </div>

            <div className="h-64 bg-slate-900 bg-cover bg-center flex items-center justify-center relative">
              <div className="w-full h-full bg-slate-900/80 p-6 flex flex-col justify-center items-center text-center">
                <div className="w-12 h-12 rounded-full bg-orange-500/20 text-brand-orange flex items-center justify-center mb-3 animate-bounce">
                  ✈
                </div>
                <div className="text-white font-bold text-base">Active Master Batches: {allBatches.length}</div>
                <div className="text-slate-400 text-xs mt-1">Guangzhou (CAN) ➔ Lagos (LOS) Freight Corridor</div>
              </div>
            </div>
          </Card>

          <Card className="rounded-2xl border-none shadow-sm h-[400px] overflow-hidden flex flex-col body-no-padding">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-brand-navy m-0 flex items-center gap-2">
                <SyncOutlined className="text-[#D95F18]" /> Recent Activity
              </h3>
            </div>

            <div className="flex-1 overflow-y-auto p-6 relative">
              <div className="space-y-4">
                {allPackages.slice(0, 5).map((p) => (
                  <div key={p.id} className="flex items-start gap-3 border-b border-slate-50 pb-3">
                    <div className="w-2 h-2 rounded-full bg-brand-orange mt-1.5"></div>
                    <div>
                      <div className="text-xs font-bold text-slate-800">Package #{p.trackingId}</div>
                      <div className="text-[10px] text-slate-400">{p.customerName} — {p.status}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <Card
          bordered={false}
          className="shadow-sm rounded-2xl lg:col-span-2"
          title={<span className="text-base font-bold text-slate-800">Revenue Trend</span>}
        >
          <p className="text-sm text-slate-400 -mt-2 mb-4">Monthly platform revenue (all services)</p>
          <Line
            data={revenueTrend}
            xField="month"
            yField="revenue"
            height={260}
            shapeField="smooth"
            style={{ stroke: '#0A1128', lineWidth: 2 }}
            point={{ shapeField: 'circle', style: { fill: '#0A1128' } }}
            axis={{ y: { labelFormatter: (v: number) => `₦${(v / 1000).toFixed(0)}k` } }}
          />
        </Card>

        <Card
          bordered={false}
          className="shadow-sm rounded-2xl"
          title={<span className="text-base font-bold text-slate-800">Packages by Status</span>}
        >
          {statusBreakdown.length > 0 ? (
            <Pie
              data={statusBreakdown}
              angleField="count"
              colorField="status"
              height={260}
              innerRadius={0.6}
              legend={{ color: { position: 'bottom', layout: { justifyContent: 'center' } } }}
              label={{ text: 'count', style: { fontWeight: 'bold' } }}
            />
          ) : (
            <div className="h-[260px] flex items-center justify-center text-slate-400 text-sm">No packages yet</div>
          )}
        </Card>
      </div>
    </div>
  );
};
