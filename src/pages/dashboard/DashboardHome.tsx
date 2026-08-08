import React, { useEffect, useMemo } from 'react';
import { Button, Tag } from 'antd';
import {
  InboxOutlined,
  ShoppingCartOutlined,
  SwapOutlined,
  WalletOutlined,
  CarOutlined,
  FileAddOutlined,
  EnvironmentOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  StarOutlined,
  CustomerServiceOutlined,
  EllipsisOutlined,
} from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchPackages } from '../../store/slices/shipmentSlice';
import { fetchWallet, fetchTransactions } from '../../store/slices/walletSlice';
import { fetchProcurements } from '../../store/slices/procurementSlice';
import { fetchExchanges } from '../../store/slices/exchangeSlice';
import { fetchDeliveries } from '../../store/slices/deliverySlice';
import { StatusBadge } from '../../components/common/StatusBadge';
import { formatNaira } from '../../utils/formatters';

export const DashboardHome: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);
  const { packages } = useAppSelector((state) => state.shipments);
  const { wallet, transactions } = useAppSelector((state) => state.wallet);
  const { requests: procurements } = useAppSelector((state) => state.procurement);

  useEffect(() => {
    dispatch(fetchPackages());
    dispatch(fetchWallet());
    dispatch(fetchTransactions());
    dispatch(fetchProcurements());
    dispatch(fetchExchanges());
    dispatch(fetchDeliveries());
  }, [dispatch]);

  const activePackages = packages.filter((p) => !['delivered', 'cancelled'].includes(p.status));
  const balance = wallet?.balance || 0;

  const recentPackages = useMemo(
    () => [...packages].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).slice(0, 3),
    [packages]
  );

  const recentTransactions = useMemo(
    () => [...transactions].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 3),
    [transactions]
  );

  const consolidationItems = packages.filter(p => p.status === 'received_at_warehouse' || p.status === 'at_china_warehouse').length || 2;

  const firstName = user?.firstName || 'Alex';

  return (
    <div className="space-y-6 animate-fade-in-up pb-10">

      {/* Welcome Banner */}
      <div className="bg-[#0A1128] rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl">
        {/* Background decoration */}
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -left-10 -bottom-20 w-60 h-60 bg-brand-orange/10 rounded-full blur-3xl"></div>

        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <Tag className="bg-brand-orange border-none text-white font-bold text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-sm m-0">
                Gold Tier
              </Tag>
              <span className="text-blue-300 text-xs font-mono">ID: {user?.customerId || 'GL-99420-X'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold m-0 mb-2">
              Welcome back, {firstName}.
            </h1>
            <p className="text-blue-200 text-sm m-0 leading-relaxed">
              You have <span className="text-brand-orange font-bold">{activePackages.length} active shipments</span> in transit and{' '}
              <span className="text-brand-orange font-bold">{consolidationItems} items</span> awaiting consolidation.
            </p>
          </div>

          <div className="flex gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl px-6 py-4 text-center border border-white/10 min-w-[120px]">
              <CarOutlined className="text-2xl text-blue-300 mb-2" />
              <div className="text-3xl font-extrabold">{activePackages.length}</div>
              <div className="text-[10px] font-bold text-blue-300 uppercase tracking-wider mt-1">Active<br/>Shipments</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl px-6 py-4 text-center border border-white/10 min-w-[120px]">
              <WalletOutlined className="text-2xl text-blue-300 mb-2" />
              <div className="text-3xl font-extrabold">₦{balance >= 1000 ? `${Math.round(balance / 1000)}k` : balance}</div>
              <div className="text-[10px] font-bold text-blue-300 uppercase tracking-wider mt-1">Wallet<br/>Balance</div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-bold text-[#0A1128] mb-4 flex items-center gap-2">
          <span className="text-brand-orange">⚡</span> Quick Actions
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link to="/dashboard/shipments/pre-alert" className="no-underline">
            <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm hover:shadow-md hover:border-brand-orange/30 transition-all cursor-pointer group">
              <div className="w-12 h-12 rounded-lg bg-brand-orange/10 text-brand-orange flex items-center justify-center mb-4 group-hover:bg-brand-orange group-hover:text-white transition-colors">
                <FileAddOutlined className="text-xl" />
              </div>
              <h3 className="font-bold text-[#0A1128] text-sm m-0 mb-1">New Shipping Request</h3>
              <p className="text-slate-500 text-xs m-0">Start a new import/export</p>
            </div>
          </Link>

          <Link to="/dashboard/wallet" className="no-underline">
            <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm hover:shadow-md hover:border-brand-orange/30 transition-all cursor-pointer group">
              <div className="w-12 h-12 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center mb-4 group-hover:bg-brand-orange group-hover:text-white transition-colors">
                <WalletOutlined className="text-xl" />
              </div>
              <h3 className="font-bold text-[#0A1128] text-sm m-0 mb-1">Fund Wallet</h3>
              <p className="text-slate-500 text-xs m-0">Top up NGN balance</p>
            </div>
          </Link>

          <Link to="/dashboard/buy-for-me" className="no-underline">
            <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm hover:shadow-md hover:border-brand-orange/30 transition-all cursor-pointer group">
              <div className="w-12 h-12 rounded-lg bg-brand-orange/10 text-brand-orange flex items-center justify-center mb-4 group-hover:bg-brand-orange group-hover:text-white transition-colors">
                <ShoppingCartOutlined className="text-xl" />
              </div>
              <h3 className="font-bold text-[#0A1128] text-sm m-0 mb-1">New Buy For Me</h3>
              <p className="text-slate-500 text-xs m-0">Procurement service</p>
            </div>
          </Link>

          <Link to="/dashboard/shipments" className="no-underline">
            <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm hover:shadow-md hover:border-brand-orange/30 transition-all cursor-pointer group">
              <div className="w-12 h-12 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center mb-4 group-hover:bg-brand-orange group-hover:text-white transition-colors">
                <InboxOutlined className="text-xl" />
              </div>
              <h3 className="font-bold text-[#0A1128] text-sm m-0 mb-1">Track Shipment</h3>
              <p className="text-slate-500 text-xs m-0">Locate your packages</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left Column (2/3) */}
        <div className="lg:col-span-2 space-y-6">

          {/* Active Shipments */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm">
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100">
              <h2 className="text-lg font-bold text-[#0A1128] m-0 flex items-center gap-2">
                <InboxOutlined className="text-slate-400" /> Active Shipments
              </h2>
              <Link to="/dashboard/shipments" className="text-sm font-bold text-[#0A1128] hover:text-brand-orange no-underline flex items-center gap-1">
                View All ➔
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left">
                    <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Tracking ID</th>
                    <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Origin / Dest</th>
                    <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Est. Deliver</th>
                  </tr>
                </thead>
                <tbody>
                  {recentPackages.map((pkg) => (
                    <tr key={pkg.id} className="border-t border-slate-50 hover:bg-slate-50/50 transition-colors cursor-pointer" onClick={() => navigate(`/dashboard/shipments/${pkg.id}`)}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${pkg.shippingMethod === 'sea' ? 'bg-blue-100 text-blue-600' : 'bg-orange-100 text-orange-600'}`}>
                            {pkg.shippingMethod === 'sea' ? <InboxOutlined /> : <CarOutlined />}
                          </div>
                          <div>
                            <div className="font-bold text-[#0A1128] text-xs">{pkg.trackingId}</div>
                            <div className="text-[10px] text-slate-400 mt-0.5 truncate max-w-[120px]">{pkg.description || 'Cargo'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-xs text-slate-600">
                          {pkg.originCountry || 'China'} <span className="text-slate-400 mx-1">→</span> {pkg.destinationCity || 'Lagos'}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <StatusBadge module="shipment" status={pkg.status} />
                      </td>
                      <td className="px-4 py-4 text-xs text-slate-600">
                        {pkg.estimatedDelivery ? new Date(pkg.estimatedDelivery).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                      </td>
                    </tr>
                  ))}
                  {recentPackages.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-slate-400 text-sm">No active shipments</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Global Network Status / Map */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden relative">
            <div className="absolute top-4 left-4 z-10 bg-white/95 backdrop-blur-sm rounded-lg p-3 shadow-sm border border-slate-100">
              <div className="flex items-center gap-2 text-sm font-bold text-[#0A1128] mb-2">
                <EnvironmentOutlined /> Global Network Status
              </div>
              <div className="flex gap-4 text-[10px] text-slate-600">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#0A1128]"></span> China Hub: Nominal
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#0A1128]"></span> US Hub: Nominal
                </span>
              </div>
            </div>
            <img
              src="https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=1400&auto=format&fit=crop"
              alt="Global Network Map"
              className="w-full h-56 object-cover opacity-70"
            />
          </div>

        </div>

        {/* Right Column (1/3) */}
        <div className="lg:col-span-1 space-y-6">

          {/* Consolidation Card */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-3">
              <InboxOutlined className="text-slate-400" />
              <h3 className="font-bold text-[#0A1128] text-base m-0">Consolidation</h3>
              <Tag className="bg-brand-orange text-white border-none text-[10px] font-bold ml-auto m-0 rounded-sm px-2">
                {consolidationItems} Items
              </Tag>
            </div>
            <p className="text-slate-500 text-xs leading-relaxed m-0 mb-4">
              You have {consolidationItems} packages waiting in the US warehouse. Consolidate them now to save up to 40% on shipping.
            </p>
            <Button
              block
              size="large"
              className="bg-[#0A1128] hover:bg-[#1a2542] text-white border-none font-bold shadow-sm"
              onClick={() => navigate('/dashboard/shipments/consolidation')}
            >
              Start Consolidation ➔
            </Button>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-[#0A1128] text-base m-0 flex items-center gap-2">
                <SwapOutlined className="text-slate-400" /> Recent Activity
              </h3>
              <Button type="text" icon={<EllipsisOutlined />} className="text-slate-400" />
            </div>
            <div className="space-y-4">
              {recentTransactions.map((tx) => (
                <div key={tx.id} className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${tx.type === 'credit' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                    {tx.type === 'credit' ? <ArrowDownOutlined className="text-xs" /> : <ArrowUpOutlined className="text-xs" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-slate-800 truncate">{tx.description || (tx.type === 'credit' ? 'Wallet Top-up' : 'Payment')}</div>
                    <div className="text-[10px] text-slate-400">{tx.reference || 'Transaction'}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className={`text-sm font-bold ${tx.type === 'credit' ? 'text-green-600' : 'text-slate-800'}`}>
                      {tx.type === 'credit' ? '+' : '-'}
                    </div>
                    <div className="text-sm font-bold text-slate-800">{formatNaira(tx.amount)}</div>
                    <div className="text-[10px] text-slate-400">
                      {new Date(tx.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                  </div>
                </div>
              ))}
              {recentTransactions.length === 0 && (
                <div className="text-center py-4 text-slate-400 text-sm">No recent activity</div>
              )}
            </div>
          </div>

          {/* Loyalty / Points Card */}
          <div className="bg-gradient-to-br from-brand-orange to-[#E86E21] rounded-xl p-6 text-white shadow-lg relative overflow-hidden">
            <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
            <div className="flex justify-center mb-3 relative z-10">
              <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <StarOutlined className="text-xl text-white" />
              </div>
            </div>
            <div className="text-center relative z-10 mb-4">
              <h3 className="text-2xl font-extrabold m-0 mb-1">1,250 Points</h3>
              <p className="text-orange-100 text-xs m-0 leading-relaxed">
                You're 250 points away from Platinum Tier. Earn points on every shipment.
              </p>
            </div>
            <Button block size="large" className="bg-white hover:bg-slate-50 text-[#0A1128] border-none font-bold shadow-sm mb-3">
              Redeem Rewards
            </Button>
            <div className="text-center">
              <Button type="link" className="text-white/80 hover:text-white text-xs font-medium p-0">
                <CustomerServiceOutlined className="mr-1" /> Contact Support
              </Button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
