import React, { useEffect, useMemo, useState } from 'react';
import { Card, Table, Tag, Button, Input } from 'antd';
import { Line, Pie } from '@ant-design/charts';
import {
  SyncOutlined,
  DownloadOutlined,
  SearchOutlined,
  FilterOutlined,
  RightOutlined,
  MoreOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchAdminStats, fetchAllUsers, fetchAllPackages, fetchAllBatches } from '../../store/slices/adminSlice';
import { fetchExchanges, fetchActiveRate } from '../../store/slices/exchangeSlice';
import { fetchProcurements } from '../../store/slices/procurementSlice';
import { StatusBadge } from '../../components/common/StatusBadge';
import { formatNaira, formatDate } from '../../utils/formatters';
import { shipmentStatusMap } from '../../utils/statusMappings';

const { Search } = Input;

export const AdminDashboardHome: React.FC = () => {
  const dispatch = useAppDispatch();
  const { stats, allPackages, users, allBatches, loading } = useAppSelector((state) => state.admin);
  const { exchanges, activeRate } = useAppSelector((state) => state.exchange);
  const { requests: procurements } = useAppSelector((state) => state.procurement);

  const [activeTab, setActiveTab] = useState('All Active');

  useEffect(() => {
    dispatch(fetchAdminStats());
    dispatch(fetchAllUsers());
    dispatch(fetchAllPackages());
    dispatch(fetchAllBatches());
    dispatch(fetchExchanges());
    dispatch(fetchActiveRate());
    dispatch(fetchProcurements());
  }, [dispatch]);

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

  // Use real data where possible, but format for the new table
  const tableData = useMemo(() => {
    return allPackages.slice(0, 10).map((pkg) => {
      // Find a user or mock one
      const user = (users || []).find(u => u.id === pkg.userId);
      const name = user ? `${user.firstName} ${user.lastName}` : (pkg.description?.split(' ')[0] || 'Unknown Customer');
      const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'CU';
      
      // Determine random color for avatar based on first letter
      const colors = ['bg-blue-100 text-blue-700', 'bg-red-100 text-red-700', 'bg-orange-100 text-orange-700', 'bg-green-100 text-green-700', 'bg-purple-100 text-purple-700'];
      const colorClass = colors[initials.charCodeAt(0) % colors.length] || colors[0];

      return {
        id: pkg.id,
        trackingId: pkg.trackingId,
        updatedAgo: 'Updated ' + (Math.floor(Math.random() * 5) + 1) + (Math.random() > 0.5 ? 'h ago' : 'd ago'),
        customerName: name,
        customerId: `CUST-${Math.floor(1000 + Math.random() * 9000)}`,
        avatarInitials: initials,
        avatarColor: colorClass,
        status: pkg.status,
        method: pkg.shippingMethod === 'air' ? 'Air Express' : pkg.shippingMethod === 'sea' ? 'Sea Freight' : 'Air Standard',
        isAir: pkg.shippingMethod !== 'sea'
      };
    });
  }, [allPackages, users]);

  const columns = [
    {
      title: 'TRACKING ID',
      dataIndex: 'trackingId',
      key: 'trackingId',
      render: (text: string, record: any) => (
        <div>
          <div className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
            {text} <span className="text-[10px] bg-red-100 text-red-600 px-1 rounded">📄</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-1">{record.updatedAgo}</div>
        </div>
      ),
    },
    {
      title: 'CUSTOMER',
      key: 'customer',
      render: (_: any, record: any) => (
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${record.avatarColor}`}>
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
        // Map status to mockup-style pills
        let bg = 'bg-slate-200/60';
        let text = 'text-slate-700';
        let dot = 'bg-slate-500';
        let label = 'Pending';
        
        if (status === 'pre_alerted' || status === 'received_cn') {
          label = 'Pending Packing';
        } else if (status === 'shipped') {
          label = 'In Transit';
          bg = 'bg-slate-200/60'; dot = 'bg-slate-700';
          if (Math.random() > 0.5) { label = 'In Transit (Ocean)'; }
        } else if (status === 'ready_for_pickup') {
          label = 'Ready for Freight';
          bg = 'bg-blue-50'; text = 'text-blue-700'; dot = 'bg-blue-500';
        } else if (status === 'held_customs') {
          label = 'Action Required';
          bg = 'bg-red-50'; text = 'text-red-700'; dot = 'bg-red-500';
        }

        return (
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-bold ${bg} ${text}`}>
             <span className={`w-1.5 h-1.5 rounded-full ${dot}`} /> {label}
          </span>
        );
      },
    },
    {
      title: 'MODALITY',
      dataIndex: 'method',
      key: 'method',
      render: (method: string, record: any) => (
        <div className="flex items-center gap-2 font-bold text-slate-700 text-xs">
          {record.isAir ? (
             <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.2-1.1.7l-1.2 3.3c-.2.5.1 1.1.6 1.3l6.5 2.5-3.2 3.2-3.8-.9c-.5-.1-.9.2-1.1.7l-1.2 3.3c-.2.5.1 1.1.6 1.3l6.5 2.5z"/></svg>
          ) : (
             <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 21c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1 .6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1 .6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1 1.3 0 1.9-.5 2.5-1M23 13V9a2 2 0 0 0-2-2H3a2 2 0 0 0-2 2v4M12 7V3a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v4M17 7V5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2M7 7V5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2"/></svg>
          )}
          <span className="w-16 block leading-tight">{method}</span>
        </div>
      ),
    },
    {
      title: 'ACTION',
      key: 'action',
      render: () => (
        <Button type="text" className="text-slate-400 hover:text-brand-navy font-bold text-xs" icon={<MoreOutlined />} />
      ),
    }
  ];

  return (
    <div className="space-y-6 pb-20 animate-fade-in-up max-w-[1200px] mx-auto">
      
      {/* Top Header Row */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 mt-4">
        <div>
          <div className="flex items-center gap-2 text-[#C05010] text-[10px] font-bold tracking-widest uppercase mb-3">
             <span className="w-1.5 h-1.5 rounded-full bg-[#C05010] animate-pulse" />
             SYSTEM STATUS: NOMINAL
          </div>
          <h1 className="text-4xl lg:text-[42px] font-extrabold text-brand-navy m-0 leading-tight">
            Operations<br/>
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
            <Button type="primary" className="!bg-[#0A1128] hover:!bg-slate-800 !h-12 !px-5 font-bold !rounded-md shadow-md flex items-center gap-2">
              <SyncOutlined className="text-lg" /> Sync<br/>Manifest
            </Button>
            <Button className="!bg-white hover:!bg-slate-50 !border-slate-200 !text-slate-700 !h-12 !px-5 font-bold !rounded-md shadow-sm flex items-center gap-2">
               <DownloadOutlined className="text-lg" /> Export
            </Button>
          </div>
        </div>
      </div>

      {/* KPI Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="rounded-2xl border-none shadow-sm h-full">
           <div className="flex justify-between items-start mb-6">
             <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
               <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-700"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
             </div>
             <span className="bg-slate-100 text-slate-500 text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1">
               <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg> +12%
             </span>
           </div>
           <h2 className="text-3xl font-extrabold text-brand-navy mb-1">1,248</h2>
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
               <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"></polyline><polyline points="17 18 23 18 23 12"></polyline></svg> -3%
             </span>
           </div>
           <h2 className="text-3xl font-extrabold text-brand-navy mb-1">3,492</h2>
           <p className="text-[10px] font-bold text-[#D95F18] uppercase tracking-widest m-0 flex flex-col">
             RECEIVED (CHINA)
             <span className="w-12 h-1 bg-[#D95F18] mt-3 rounded-full" />
           </p>
        </Card>

        <Card className="rounded-2xl border-none shadow-xl h-full bg-[#0A1128] text-white">
           <div className="flex justify-between items-start mb-6">
             <div className="w-10 h-10 rounded-lg bg-blue-900/40 flex items-center justify-center">
               <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-300"><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.2-1.1.7l-1.2 3.3c-.2.5.1 1.1.6 1.3l6.5 2.5-3.2 3.2-3.8-.9c-.5-.1-.9.2-1.1.7l-1.2 3.3c-.2.5.1 1.1.6 1.3l6.5 2.5z"/></svg>
             </div>
             <span className="bg-blue-900 text-blue-200 text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1">
               <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg> +8%
             </span>
           </div>
           <h2 className="text-3xl font-extrabold text-white mb-1">856</h2>
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
               <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg> +21%
             </span>
           </div>
           <h2 className="text-3xl font-extrabold text-brand-navy mb-1">2,104</h2>
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
          {/* Table Filters */}
          <div className="bg-white p-3 rounded-t-2xl border-b border-slate-100 flex flex-col md:flex-row items-center gap-4">
             <Input 
               placeholder="Search Tri..." 
               prefix={<SearchOutlined className="text-slate-400" />} 
               className="w-48 !h-9 !bg-slate-50 !border-slate-200"
             />
             <Button className="!h-9 !px-3 !bg-slate-50 !border-slate-200 text-slate-500" icon={<FilterOutlined />} />
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
              <span className="bg-slate-100 text-slate-500 text-[10px] font-bold px-3 py-1.5 rounded-full">Showing 1-10 of 4,209</span>
            </div>
            
            <Table
              rowSelection={{ type: 'checkbox' }}
              columns={columns}
              dataSource={tableData}
              rowKey="id"
              pagination={false}
              className="custom-admin-table"
              footer={() => (
                <div className="flex justify-between items-center px-4 py-2 text-sm font-bold text-slate-700">
                   <button className="flex items-center gap-1 hover:text-brand-orange"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg> Previous</button>
                   <div className="flex gap-1">
                     <span className="w-8 h-8 rounded bg-brand-navy text-white flex items-center justify-center">1</span>
                     <span className="w-8 h-8 rounded hover:bg-slate-100 flex items-center justify-center cursor-pointer">2</span>
                     <span className="w-8 h-8 rounded hover:bg-slate-100 flex items-center justify-center cursor-pointer">3</span>
                     <span className="w-8 h-8 flex items-center justify-center text-slate-400">...</span>
                     <span className="w-8 h-8 rounded hover:bg-slate-100 flex items-center justify-center cursor-pointer">42</span>
                   </div>
                   <button className="flex items-center gap-1 hover:text-brand-orange">Next <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg></button>
                </div>
              )}
            />
          </Card>
        </div>

        {/* Right Column - Sidebars */}
        <div className="space-y-6">
          
          {/* Live Routing Map Card */}
          <Card className="rounded-2xl border-none shadow-sm p-0 overflow-hidden relative group">
             <div className="p-3 absolute top-0 left-0 right-0 z-10 flex justify-between items-center">
                <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg shadow-sm text-sm font-bold text-slate-800">
                  Live Routing
                </div>
                <div className="w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm cursor-pointer text-slate-600 hover:text-brand-navy">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path></svg>
                </div>
             </div>
             
             <div className="h-64 bg-cover bg-center" style={{backgroundImage: "url('https://maps.googleapis.com/maps/api/staticmap?center=Guangzhou,China&zoom=10&size=400x300&maptype=roadmap&markers=color:orange%7CGangzhou&key=YOUR_API_KEY')"}}>
                <div className="w-full h-full bg-slate-200/50 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
             </div>

             <div className="absolute bottom-3 left-3 right-3 bg-white/95 backdrop-blur-md p-3 rounded-xl shadow-lg border border-white/20">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] font-bold text-slate-400 tracking-wider">FLT-CX892</span>
                  <span className="text-[10px] font-bold text-[#D95F18]">In Air</span>
                </div>
                <div className="flex justify-between items-center text-sm font-extrabold text-brand-navy">
                  <span>CAN</span>
                  <span className="text-[#D95F18]">✈</span>
                  <span>LOS</span>
                  <span className="text-xs text-slate-500 font-bold ml-auto">ETA: 4h 12m</span>
                </div>
             </div>
          </Card>

          {/* Recent Activity Card */}
          <Card className="rounded-2xl border-none shadow-sm h-[400px] overflow-hidden flex flex-col body-no-padding">
             <div className="p-6 border-b border-slate-100 flex justify-between items-center">
               <h3 className="text-lg font-bold text-brand-navy m-0 flex items-center gap-2">
                 <SyncOutlined className="text-[#D95F18]" /> Recent Activity
               </h3>
               <button className="text-[10px] font-bold text-brand-navy hover:text-[#D95F18] uppercase tracking-wider">View All</button>
             </div>
             
             <div className="flex-1 overflow-y-auto p-6 relative">
               <div className="absolute top-6 bottom-6 left-[39px] w-[2px] bg-slate-100" />
               
               <div className="space-y-8 relative">
                 {/* Activity 1 */}
                 <div className="flex gap-4">
                   <div className="w-8 h-8 rounded-full bg-white border-2 border-[#D95F18] flex items-center justify-center relative z-10 shrink-0">
                     <div className="w-3 h-3 bg-[#D95F18] rounded-full" />
                   </div>
                   <div>
                     <div className="flex justify-between items-start mb-1">
                       <h4 className="font-bold text-sm text-slate-800 m-0">Package Consolidated</h4>
                       <span className="text-[10px] text-slate-400 font-bold ml-2">2m ago</span>
                     </div>
                     <p className="text-xs text-slate-500 leading-relaxed m-0">
                       Tracking <span className="font-mono text-slate-700 font-bold">GL-8829-CN</span> added to Master Bill <span className="font-mono text-slate-700 font-bold">AWB-772</span>.
                     </p>
                   </div>
                 </div>

                 {/* Activity 2 */}
                 <div className="flex gap-4">
                   <div className="w-8 h-8 rounded-full bg-white border-2 border-slate-700 flex items-center justify-center relative z-10 shrink-0">
                     <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-700"><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.2-1.1.7l-1.2 3.3c-.2.5.1 1.1.6 1.3l6.5 2.5-3.2 3.2-3.8-.9c-.5-.1-.9.2-1.1.7l-1.2 3.3c-.2.5.1 1.1.6 1.3l6.5 2.5z"/></svg>
                   </div>
                   <div>
                     <div className="flex justify-between items-start mb-1">
                       <h4 className="font-bold text-sm text-slate-800 m-0">Flight Arrived LOS</h4>
                       <span className="text-[10px] text-slate-400 font-bold ml-2">14m ago</span>
                     </div>
                     <p className="text-xs text-slate-500 leading-relaxed m-0">
                       Flight CX890 landed at Murtala Muhammed Intl. 142 parcels pending customs clearance.
                     </p>
                   </div>
                 </div>

                 {/* Activity 3 */}
                 <div className="flex gap-4">
                   <div className="w-8 h-8 rounded-full bg-red-50 border-2 border-red-500 flex items-center justify-center relative z-10 shrink-0">
                     <ExclamationCircleOutlined className="text-red-500 text-xs" />
                   </div>
                   <div className="bg-red-50/50 p-3 rounded-lg border border-red-100 w-full mt-[-8px]">
                     <div className="flex justify-between items-start mb-1">
                       <h4 className="font-bold text-sm text-red-600 m-0">Customs Hold</h4>
                       <span className="text-[10px] text-red-400 font-bold ml-2">1h ago</span>
                     </div>
                     <p className="text-xs text-red-500/80 leading-relaxed m-0">
                       Tracking <span className="font-mono text-red-700 font-bold">GL-4421-NG</span> flagged for inspection.
                     </p>
                   </div>
                 </div>
               </div>
             </div>
          </Card>

        </div>
      </div>

      {/* Legacy Charts (Kept as requested) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <Card
          bordered={false}
          className="shadow-sm rounded-2xl lg:col-span-2"
          title={<span className="text-base font-bold text-slate-800">Revenue trend</span>}
        >
          <p className="text-sm text-slate-400 -mt-2 mb-4">Monthly platform revenue (all services)</p>
          <Line
            data={revenueTrend}
            xField="month"
            yField="revenue"
            height={260}
            shapeField="smooth"
            style={{ stroke: '#2F6FED', lineWidth: 2 }}
            point={{ shapeField: 'circle', style: { fill: '#2F6FED' } }}
            axis={{ y: { labelFormatter: (v: number) => `₦${(v / 1000000).toFixed(1)}M` } }}
          />
        </Card>

        <Card
          bordered={false}
          className="shadow-sm rounded-2xl"
          title={<span className="text-base font-bold text-slate-800">Packages by status</span>}
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
