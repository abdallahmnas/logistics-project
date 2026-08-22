import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Input, Button, Card, Steps, Tag, Alert, Spin } from 'antd';
import { 
  SearchOutlined, 
  EnvironmentOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  RocketOutlined,
  SafetyCertificateOutlined,
  GlobalOutlined,
  InboxOutlined,
  PhoneOutlined,
  CustomerServiceOutlined
} from '@ant-design/icons';
import apiClient from '../../api/axios';
import { StatusBadge } from '../../components/common/StatusBadge';
import { formatDate } from '../../utils/formatters';

const { Search } = Input;

export const TrackingPublicPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialId = searchParams.get('id') || searchParams.get('trackingId') || '';
  
  const [trackingId, setTrackingId] = useState(initialId);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    if (initialId) {
      handleSearch(initialId);
    }
  }, [initialId]);

  const handleSearch = async (value: string) => {
    if (!value.trim()) return;
    
    setLoading(true);
    setErrorMsg(null);
    setSearched(true);
    setSearchParams({ id: value.trim() });
    
    try {
      const res = await apiClient.get(`/shipments/tracking/${encodeURIComponent(value.trim())}`);
      setResult(res.data.data);
    } catch (e: any) {
      setResult(null);
      setErrorMsg(e.response?.data?.message || 'Package not found. Please verify your tracking ID or Chinese courier number.');
    } finally {
      setLoading(false);
    }
  };

  const getStepCurrent = (status: string) => {
    switch (status) {
      case 'pre_alerted':
      case 'pre_alert_submitted': 
        return 0;
      case 'received_cn':
      case 'received_at_china':
      case 'received_at_warehouse':
      case 'at_china_warehouse': 
        return 1;
      case 'ready_to_pack':
      case 'under_packing':
      case 'consolidating':
      case 'consolidated':
      case 'ready_to_batch': 
        return 2;
      case 'shipping_exported':
      case 'in_transit_air':
      case 'in_transit_sea': 
        return 3;
      case 'arrived_ng':
      case 'arrived_nigeria':
      case 'ready_for_pickup':
      case 'out_for_delivery': 
        return 4;
      case 'delivered': 
        return 5;
      default: 
        return 0;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      
      {/* Search Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-[#0A1128] to-slate-900 py-12 md:py-16 relative overflow-hidden">
        <div className="container mx-auto px-4 max-w-4xl text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-brand-orange/20 border border-brand-orange/30 text-brand-orange text-xs font-bold uppercase tracking-wider mb-4">
            <GlobalOutlined /> Real-time Cargo Track & Trace
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-4 tracking-tight">
            Track Your Shipment
          </h1>
          <p className="text-slate-300 text-sm md:text-base max-w-xl mx-auto mb-8 leading-relaxed">
            Enter your <strong>HZ Tracking ID</strong> or <strong>Chinese Domestic Courier Number</strong> (SF Express, ZTO, Yunda) to view live status updates.
          </p>

          {/* Search Box */}
          <div className="bg-white/10 backdrop-blur-md p-2 rounded-2xl max-w-2xl mx-auto border border-white/20 shadow-2xl">
            <Search
              placeholder="e.g. HZ-AIR-202608-001 or SF10928374..."
              allowClear
              enterButton={
                <Button type="primary" className="!bg-brand-orange hover:!bg-orange-600 !border-brand-orange !h-12 !px-8 font-bold !rounded-xl">
                  Track Package
                </Button>
              }
              size="large"
              value={trackingId}
              onChange={(e) => setTrackingId(e.target.value)}
              onSearch={handleSearch}
              loading={loading}
              className="rounded-xl h-12"
              styles={{ input: { height: '48px', fontSize: '15px', background: 'white', borderRadius: '12px' } }}
            />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="container mx-auto px-4 py-10 max-w-5xl flex-1">
        
        {loading && (
          <div className="text-center py-16">
            <Spin size="large" />
            <p className="text-slate-500 font-medium mt-4">Searching logistics tracking network...</p>
          </div>
        )}

        {/* Error Alert */}
        {!loading && errorMsg && (
          <div className="max-w-2xl mx-auto">
            <Alert
              type="error"
              showIcon
              message="Tracking Search Result"
              description={errorMsg}
              className="rounded-2xl shadow-sm p-6"
            />
          </div>
        )}

        {/* Found Result Card */}
        {!loading && result && (
          <div className="space-y-8 animate-fade-in-up">
            
            {/* Top Shipment Summary Header */}
            <Card bordered={false} className="shadow-md rounded-2xl overflow-hidden border border-slate-200/80">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-slate-100">
                <div>
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Tracking Reference</div>
                  <h2 className="text-2xl md:text-3xl font-extrabold text-[#0A1128] m-0 font-mono flex items-center gap-3">
                    {result.trackingId || result.id}
                    <StatusBadge module="shipment" status={result.status} type="badge" />
                  </h2>
                </div>

                <div className="flex items-center gap-3">
                  <Tag color={result.shippingType === 'sea' ? 'cyan' : 'orange'} className="font-bold text-xs uppercase px-3 py-1 rounded-md">
                    {result.shippingType === 'sea' ? '🚢 Sea Freight' : '✈️ Air Cargo Express'}
                  </Tag>
                </div>
              </div>

              {/* Grid Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-6 border-b border-slate-100 text-sm">
                <div>
                  <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block mb-1">Chinese Courier No</span>
                  <span className="font-mono font-bold text-slate-800">{result.chineseTrackingNo || 'N/A'}</span>
                </div>

                <div>
                  <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block mb-1">Weight / Volume</span>
                  <span className="font-bold text-slate-800">
                    {result.weightKg ? `${result.weightKg} kg` : 'Pending Weight'}
                    {result.cbm ? ` (${result.cbm} CBM)` : ''}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block mb-1">Origin Warehouse</span>
                  <span className="font-semibold text-slate-800">{result.originWarehouse}</span>
                </div>

                <div>
                  <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block mb-1">Destination Hub</span>
                  <span className="font-semibold text-slate-800">{result.destinationWarehouse}</span>
                </div>
              </div>

              {/* Progress Steps Bar */}
              <div className="pt-6">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6">Logistics Progress Pipeline</div>
                <Steps
                  current={getStepCurrent(result.status)}
                  items={[
                    {
                      title: 'Pre-Alert',
                      description: result.preAlertDate ? formatDate(result.preAlertDate) : 'Submitted',
                    },
                    {
                      title: 'Received China',
                      description: result.receivedDate ? formatDate(result.receivedDate) : 'Scanned',
                    },
                    {
                      title: 'Consolidated',
                      description: 'Batched for Freight',
                    },
                    {
                      title: result.shippingType === 'sea' ? 'In Sea Transit' : 'In Flight',
                      description: result.shippedDate ? formatDate(result.shippedDate) : 'En route',
                    },
                    {
                      title: 'Arrived Nigeria',
                      description: result.arrivedDate ? formatDate(result.arrivedDate) : 'Customs Cleared',
                    },
                    {
                      title: 'Delivered',
                      description: result.deliveredDate ? formatDate(result.deliveredDate) : 'Completed',
                    },
                  ]}
                />
              </div>
            </Card>

            {/* Detailed Event Log */}
            <Card bordered={false} className="shadow-sm rounded-2xl border border-slate-200/80">
              <h3 className="text-lg font-bold text-[#0A1128] mb-4 flex items-center gap-2">
                <ClockCircleOutlined className="text-brand-orange" /> Package Milestones & Event Log
              </h3>

              <div className="space-y-4 text-sm">
                {(result.deliveredDate || getStepCurrent(result.status) >= 5) && (
                  <div className="flex items-start gap-4 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900">
                    <CheckCircleOutlined className="text-emerald-600 text-xl mt-0.5" />
                    <div>
                      <div className="font-bold text-emerald-950">Package Delivered Successfully</div>
                      <div className="text-xs text-emerald-700 mt-0.5">{formatDate(result.deliveredDate || result.updatedAt)}</div>
                    </div>
                  </div>
                )}

                {(result.arrivedDate || getStepCurrent(result.status) >= 4) && (
                  <div className="flex items-start gap-4 p-4 rounded-xl bg-blue-50 border border-blue-200 text-blue-900">
                    <EnvironmentOutlined className="text-blue-600 text-xl mt-0.5" />
                    <div>
                      <div className="font-bold text-blue-950">Arrived at Nigeria Destination Hub ({result.destinationWarehouse})</div>
                      <div className="text-xs text-blue-700 mt-0.5">{formatDate(result.arrivedDate || result.updatedAt)}</div>
                    </div>
                  </div>
                )}

                {(result.shippedDate || getStepCurrent(result.status) >= 3) && (
                  <div className="flex items-start gap-4 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900">
                    <RocketOutlined className="text-amber-600 text-xl mt-0.5" />
                    <div>
                      <div className="font-bold text-amber-950">Departed Overseas Freight from China</div>
                      <div className="text-xs text-amber-700 mt-0.5">{formatDate(result.shippedDate || result.updatedAt)}</div>
                    </div>
                  </div>
                )}

                {getStepCurrent(result.status) >= 2 && (
                  <div className="flex items-start gap-4 p-4 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-900">
                    <InboxOutlined className="text-indigo-600 text-xl mt-0.5" />
                    <div>
                      <div className="font-bold text-indigo-950">Consolidated & Batched for Freight</div>
                      <div className="text-xs text-indigo-700 mt-0.5">{formatDate(result.updatedAt)}</div>
                    </div>
                  </div>
                )}

                {(result.receivedDate || getStepCurrent(result.status) >= 1) && (
                  <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-800">
                    <InboxOutlined className="text-slate-600 text-xl mt-0.5" />
                    <div>
                      <div className="font-bold text-slate-900">Received & Weighed at China Warehouse</div>
                      <div className="text-xs text-slate-500 mt-0.5">{formatDate(result.receivedDate || result.createdAt)} - Weight: {result.weightKg ? `${result.weightKg} kg` : 'Recorded'}</div>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-800">
                  <SafetyCertificateOutlined className="text-slate-600 text-xl mt-0.5" />
                  <div>
                    <div className="font-bold text-slate-900">Pre-Alert Shipment Registered</div>
                    <div className="text-xs text-slate-500 mt-0.5">{formatDate(result.preAlertDate || result.createdAt)}</div>
                  </div>
                </div>
              </div>
            </Card>

          </div>
        )}

        {/* Default Informational Banner when no search executed yet */}
        {!searched && !loading && (
          <div className="space-y-8">
            
            <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm text-center max-w-3xl mx-auto">
              <div className="w-16 h-16 rounded-2xl bg-orange-50 text-brand-orange flex items-center justify-center mx-auto mb-4 text-2xl">
                <SearchOutlined />
              </div>
              <h3 className="text-xl font-bold text-[#0A1128] mb-2">How to Track Your Shipment</h3>
              <p className="text-slate-500 text-sm leading-relaxed mb-6">
                Enter your HZ Tracking ID or Chinese courier waybill number in the search box above to get live status, weight details, and arrival ETAs.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left pt-4 border-t border-slate-100">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="font-bold text-slate-800 text-sm mb-1">1. Pre-Alert</div>
                  <p className="text-xs text-slate-500 m-0">Register your Chinese domestic tracking number prior to warehouse arrival.</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="font-bold text-slate-800 text-sm mb-1">2. Overseas Freight</div>
                  <p className="text-xs text-slate-500 m-0">Express Air Cargo (3–5 days) or Ocean Sea Freight (30–45 days).</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="font-bold text-slate-800 text-sm mb-1">3. Local Dispatch</div>
                  <p className="text-xs text-slate-500 m-0">Warehouse pickup at Kano/Lagos or doorstep delivery across Nigeria.</p>
                </div>
              </div>
            </div>

          </div>
        )}

      </div>

    </div>
  );
};
