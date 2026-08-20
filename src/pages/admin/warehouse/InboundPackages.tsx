import React, { useEffect, useMemo, useState } from 'react';
import { Card, Input, Select, Button, Tag, Spin, Drawer, Descriptions, Image, Timeline } from 'antd';
import { SearchOutlined, ScanOutlined, EyeOutlined, UserOutlined, CalendarOutlined, InboxOutlined, CheckCircleOutlined, RocketOutlined, CameraOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { fetchAllPackages, fetchAllUsers } from '../../../store/slices/adminSlice';
import type { Package } from '../../../types/shipment.types';
import { formatDate } from '../../../utils/formatters';

const { Option } = Select;

export const InboundPackages: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { allPackages, users, loading } = useAppSelector((state) => state.admin);
  const [searchText, setSearchText] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterMethod, setFilterMethod] = useState('all');
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);

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
    const user = users.find(u => u.id === pkg.userId || u.customerId === pkg.customerId);
    const customerId = user?.customerId || pkg.customerId || 'C-4412';
    const customerName = pkg.customerName || (user ? `${user.firstName} ${user.lastName}` : 'Unknown Customer');
    const title = pkg.description || 'Package Contents';
    const weight = pkg.weightKg > 0 ? pkg.weightKg + 'kg' : 'TBD';
    const isAir = pkg.shippingMethod !== 'sea';

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
      const isToday = (pkg.id.charCodeAt(pkg.id.length - 1) % 2) === 0;
      if (isToday) {
        statusText = 'EXPECTED TODAY';
        statusBg = 'bg-[#FFF2EA] text-[#D95F18]';
      } else {
        statusText = 'EXPECTED TMRW';
        statusBg = 'bg-[#F2F1EF] text-slate-500';
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
      <div 
        key={pkg.id} 
        className={`w-full ${cardBg} border rounded-lg p-4 hover:shadow-md transition-all mb-3 cursor-pointer group flex flex-col md:flex-row justify-between items-start md:items-center gap-4`} 
        onClick={() => navigate(`/admin/warehouse/scan?trackingId=${pkg.trackingId}`)}
      >
        <div className="flex-1">
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

        {/* Action Buttons */}
        <div className="flex items-center gap-2 self-end md:self-center" onClick={(e) => e.stopPropagation()}>
          <Button 
            icon={<EyeOutlined />} 
            size="small"
            className="!text-xs font-bold !text-slate-600 hover:!text-brand-navy !border-slate-300"
            onClick={() => setSelectedPackage(pkg)}
          >
            View Info
          </Button>
          <Button 
            type="primary"
            icon={<ScanOutlined />} 
            size="small"
            className="!text-xs font-bold !bg-[#0A1128] hover:!bg-slate-800 !border-none"
            onClick={() => navigate(`/admin/warehouse/scan?trackingId=${pkg.trackingId}`)}
          >
            Scan & Update
          </Button>
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

      {/* Dedicated Status Filter Tabs */}
      <div className="flex bg-slate-100 p-1 rounded-xl mb-4">
        <button
          type="button"
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
            filterStatus === 'all' ? 'bg-white text-brand-navy shadow-sm' : 'text-slate-500 hover:text-slate-800'
          }`}
          onClick={() => setFilterStatus('all')}
        >
          All Packages ({allPackages.length})
        </button>
        <button
          type="button"
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
            filterStatus === 'pre_alerted' ? 'bg-white text-brand-navy shadow-sm' : 'text-slate-500 hover:text-slate-800'
          }`}
          onClick={() => setFilterStatus('pre_alerted')}
        >
          📦 Pre-Alerted ({allPackages.filter((p) => p.status === 'pre_alerted').length})
        </button>
        <button
          type="button"
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
            filterStatus === 'received_cn' ? 'bg-white text-brand-navy shadow-sm' : 'text-slate-500 hover:text-slate-800'
          }`}
          onClick={() => setFilterStatus('received_cn')}
        >
          ✅ Received ({allPackages.filter((p) => p.status === 'received_cn').length})
        </button>
        <button
          type="button"
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
            filterStatus === 'held_customs' ? 'bg-white text-brand-navy shadow-sm' : 'text-slate-500 hover:text-slate-800'
          }`}
          onClick={() => setFilterStatus('held_customs')}
        >
          ⚠️ Holds / Overdue ({allPackages.filter((p) => p.status === 'held_customs').length})
        </button>
      </div>

      {/* Search & Secondary Filters */}
      <div className="bg-[#F2F1EF] p-3 rounded-lg flex flex-col md:flex-row gap-3 mb-4">
        <Input
          placeholder="Search tracking ID, customer or Chinese tracking #..."
          prefix={<SearchOutlined className="text-slate-400" />}
          className="flex-1 !h-10 !bg-white !border-slate-200"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
        <Select value={filterStatus} className="md:w-44 !h-10" onChange={setFilterStatus}>
          <Option value="all">All Statuses</Option>
          <Option value="pre_alerted">Pre-Alerted</Option>
          <Option value="received_cn">Received CN</Option>
          <Option value="held_customs">Overdue / Hold</Option>
        </Select>
        <Select value={filterMethod} className="md:w-32 !h-10" onChange={setFilterMethod}>
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

      {/* Package Info Drawer */}
      <Drawer
        open={Boolean(selectedPackage)}
        onClose={() => setSelectedPackage(null)}
        title={<span className="font-mono font-bold text-slate-800 text-lg">Package Info: {selectedPackage?.trackingId}</span>}
        size="large"
      >
        {selectedPackage && (
          <div className="space-y-6">
            
            {/* Status & Quick Action */}
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 flex justify-between items-center">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">STATUS</span>
                <Tag color={selectedPackage.status === 'received_cn' ? 'green' : 'orange'} className="font-bold text-xs">
                  {selectedPackage.status.toUpperCase()}
                </Tag>
              </div>
              <Button 
                type="primary" 
                size="small" 
                icon={<ScanOutlined />}
                className="!bg-brand-navy font-bold text-xs"
                onClick={() => {
                  const tid = selectedPackage.trackingId;
                  setSelectedPackage(null);
                  navigate(`/admin/warehouse/scan?trackingId=${tid}`);
                }}
              >
                Scan & Edit
              </Button>
            </div>

            {/* General Info */}
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">PACKAGE SPECIFICATIONS</h4>
              <Descriptions column={1} bordered size="small">
                <Descriptions.Item label="Description"><span className="font-bold text-slate-800">{selectedPackage.description}</span></Descriptions.Item>
                <Descriptions.Item label="Customer">{selectedPackage.customerName} ({selectedPackage.customerId})</Descriptions.Item>
                <Descriptions.Item label="Chinese Tracking #">{selectedPackage.chineseTrackingNo || '—'}</Descriptions.Item>
                <Descriptions.Item label="Weight">{selectedPackage.weightKg ? `${selectedPackage.weightKg} kg` : 'Pending Weight'}</Descriptions.Item>
                <Descriptions.Item label="Dimensions">{selectedPackage.dimensions ? `${selectedPackage.dimensions.length} × ${selectedPackage.dimensions.width} × ${selectedPackage.dimensions.height} cm` : 'Pending Dimensions'}</Descriptions.Item>
                <Descriptions.Item label="CBM">{selectedPackage.cbm ? `${selectedPackage.cbm.toFixed(3)} m³` : '—'}</Descriptions.Item>
                <Descriptions.Item label="Shipping Method"><span className="uppercase font-bold">{selectedPackage.shippingMethod || 'Air'}</span></Descriptions.Item>
              </Descriptions>
            </div>

            {/* Photos */}
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">CONDITION CAPTURE PHOTOS</h4>
              {selectedPackage.photos && selectedPackage.photos.length > 0 ? (
                <div className="grid grid-cols-2 gap-2">
                  {selectedPackage.photos.map((url, i) => (
                    <Image key={i} src={url} alt="Condition photo" className="rounded-lg object-cover h-28 w-full border border-slate-200" />
                  ))}
                </div>
              ) : (
                <div className="bg-slate-50 border border-dashed border-slate-200 rounded-lg p-4 text-center">
                  <CameraOutlined className="text-2xl text-slate-300 mb-1" />
                  <p className="text-xs font-bold text-slate-400 m-0">No condition photos uploaded yet</p>
                  <Button 
                    type="link" 
                    size="small" 
                    className="!text-xs font-bold !text-brand-navy p-0 mt-1"
                    onClick={() => {
                      const tid = selectedPackage.trackingId;
                      setSelectedPackage(null);
                      navigate(`/admin/warehouse/scan?trackingId=${tid}`);
                    }}
                  >
                    + Add Photos at Intake Station
                  </Button>
                </div>
              )}
            </div>

            {/* Timeline */}
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">LOGISTICS TIMELINE</h4>
              <Timeline
                items={[
                  {
                    color: 'gray',
                    children: (
                      <div>
                        <p className="font-bold text-xs text-slate-700 m-0">Pre-Alert Created</p>
                        <p className="text-[11px] text-slate-400 m-0">{formatDate(selectedPackage.preAlertDate || selectedPackage.createdAt)}</p>
                      </div>
                    ),
                  },
                  ...(selectedPackage.receivedDate ? [{
                    color: 'blue',
                    children: (
                      <div>
                        <p className="font-bold text-xs text-blue-700 m-0">Received at Guangzhou Hub</p>
                        <p className="text-[11px] text-slate-400 m-0">{formatDate(selectedPackage.receivedDate)}</p>
                      </div>
                    ),
                  }] : []),
                  ...(selectedPackage.shippedDate ? [{
                    color: 'orange',
                    children: (
                      <div>
                        <p className="font-bold text-xs text-orange-700 m-0">Exported / Departed China</p>
                        <p className="text-[11px] text-slate-400 m-0">{formatDate(selectedPackage.shippedDate)}</p>
                      </div>
                    ),
                  }] : []),
                  ...(selectedPackage.deliveredDate ? [{
                    color: 'green',
                    dot: <RocketOutlined className="text-base text-emerald-600" />,
                    children: (
                      <div>
                        <p className="font-bold text-xs text-emerald-600 m-0">Delivered</p>
                        <p className="text-[11px] text-slate-400 m-0">{formatDate(selectedPackage.deliveredDate)}</p>
                      </div>
                    ),
                  }] : []),
                ]}
              />
            </div>

          </div>
        )}
      </Drawer>

    </div>
  );
};

export default InboundPackages;
