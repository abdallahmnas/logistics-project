import React, { useEffect, useMemo, useState } from 'react';
import { Card, Input, Select, Button, Tag, Spin } from 'antd';
import { SearchOutlined, ScanOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { fetchAllPackages, fetchAllUsers } from '../../../store/slices/adminSlice';
import type { Package } from '../../../types/shipment.types';

const { Option } = Select;

export const InboundPackages: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { allPackages, users, loading } = useAppSelector((state) => state.admin);
  const [searchText, setSearchText] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterMethod, setFilterMethod] = useState('all');

  useEffect(() => {
    dispatch(fetchAllPackages());
    dispatch(fetchAllUsers());
  }, [dispatch]);

  const filtered = useMemo(() => {
    return allPackages.filter((pkg) => {
      const matchesSearch =
        pkg.trackingId.toLowerCase().includes(searchText.toLowerCase()) ||
        pkg.customerName.toLowerCase().includes(searchText.toLowerCase()) ||
        pkg.chineseTrackingNo?.toLowerCase().includes(searchText.toLowerCase());
      const matchesStatus = filterStatus === 'all' || pkg.status === filterStatus;
      const matchesMethod = filterMethod === 'all' || pkg.shippingMethod === filterMethod;
      return matchesSearch && matchesStatus && matchesMethod;
    });
  }, [allPackages, searchText, filterStatus, filterMethod]);

  const renderPackageCard = (pkg: Package) => {
    // Generate mock card data based on package
    const user = users.find(u => u.id === pkg.userId);
    const customerId = user?.id?.substring(0, 6).toUpperCase() || 'C-4412';
    const customerName = pkg.customerName || user?.firstName + ' ' + user?.lastName || 'Unknown Customer';
    const title = pkg.description || 'Package Contents';
    const weight = pkg.weightKg > 0 ? pkg.weightKg + 'kg' : 'TBD';
    const isAir = pkg.shippingMethod !== 'sea';

    // Status logic for mockup simulation
    let statusText = 'EXPECTED TMRW';
    let statusBg = 'bg-[#F2F1EF] text-slate-500';
    let cardBg = 'bg-white border-slate-100';
    let routeIcon = <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 21c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1 .6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1 1.3 0 1.9-.5 2.5-1M23 13V9a2 2 0 0 0-2-2H3a2 2 0 0 0-2 2v4M12 7V3a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v4M17 7V5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2M7 7V5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2"/></svg>;
    let routeText = 'Ground';

    if (isAir) {
      routeIcon = <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.2-1.1.7l-1.2 3.3c-.2.5.1 1.1.6 1.3l6.5 2.5-3.2 3.2-3.8-.9c-.5-.1-.9.2-1.1.7l-1.2 3.3c-.2.5.1 1.1.6 1.3l6.5 2.5z"/></svg>;
      routeText = 'CAN Airport';
    }

    if (pkg.status === 'pre_alerted') {
      if (Math.random() > 0.6) {
        statusText = 'EXPECTED TODAY';
        statusBg = 'bg-[#FFF2EA] text-[#D95F18]';
      }
    } else if (pkg.status === 'received_cn') {
      statusText = 'RECEIVED';
      statusBg = 'bg-green-50 text-green-700';
    } else if (pkg.status === 'held_customs') {
      statusText = 'OVERDUE (2 DAYS)';
      statusBg = 'bg-[#FFF0F0] text-[#D93025]';
      cardBg = 'bg-white border-[#F2D7D7]';
      routeIcon = <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>;
      routeText = 'Check Carrier';
    }

    return (
      <div key={pkg.id} className={`w-full ${cardBg} border rounded-lg p-4 hover:shadow-md transition-shadow mb-3 cursor-pointer`} onClick={() => navigate(`/admin/warehouse/scan?id=${pkg.id}`)}>
        <div className="flex justify-between items-center mb-2">
          <span className="font-bold text-slate-800 text-xs font-mono tracking-wide">{pkg.trackingId}</span>
          <span className={`${statusBg} text-[10px] font-bold px-2 py-1 rounded uppercase tracking-widest`}>
            {statusText}
          </span>
        </div>
        
        <h3 className="text-base font-bold text-[#0A1128] mb-1 leading-tight">{title}</h3>
        <p className="text-xs text-slate-500 mb-3">
          Customer: {customerName} (ID: {customerId})
        </p>

        <div className="flex items-center gap-4 text-xs font-bold text-slate-600">
          <div className="flex items-center gap-1.5">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path><path d="M22 12A10 10 0 0 0 12 2v10z"></path></svg>
            Est: {weight}
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">{routeIcon}</span>
            {routeText}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4 animate-fade-in-up max-w-[800px] mx-auto pb-20 mt-4">
      
      {/* Header Area */}
      <div className="flex justify-between items-end mb-4">
        <div>
          <h1 className="text-4xl font-extrabold text-[#0A1128] m-0 leading-tight">
            Inbound<br/>Packages
          </h1>
        </div>
        <Button
          type="primary"
          size="large"
          className="!bg-[#0A1128] hover:!bg-slate-800 !h-12 !px-6 font-bold !border-none !rounded flex items-center gap-2"
          onClick={() => navigate('/admin/warehouse/scan')}
        >
          <ScanOutlined /> SCAN PACKAGE
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-[#F2F1EF] p-3 rounded-lg flex flex-col md:flex-row gap-3 mb-4">
        <Input
          placeholder="Search tracking ID or customer..."
          prefix={<SearchOutlined className="text-slate-400" />}
          className="flex-1 !h-10 !bg-white !border-slate-200"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
        <Select defaultValue="all" className="md:w-48 !h-10" onChange={setFilterStatus}>
          <Option value="all">All Statuses</Option>
          <Option value="pre_alerted">Expected</Option>
          <Option value="received_cn">Received</Option>
          <Option value="held_customs">Overdue / Hold</Option>
        </Select>
        <Select defaultValue="all" className="md:w-32 !h-10" onChange={setFilterMethod}>
          <Option value="all">All Methods</Option>
          <Option value="air">Air</Option>
          <Option value="sea">Sea</Option>
        </Select>
      </div>

      {/* Package List */}
      <div>
        {loading && filtered.length === 0 ? (
          <div className="py-20 text-center"><Spin size="large" /></div>
        ) : filtered.length > 0 ? (
          <div className="flex flex-col">
            {filtered.map(pkg => renderPackageCard(pkg))}
          </div>
        ) : (
           <div className="text-center py-20 bg-slate-50 rounded-lg border border-slate-100">
             <p className="text-slate-400 font-bold">No packages found.</p>
           </div>
        )}
      </div>

    </div>
  );
};
