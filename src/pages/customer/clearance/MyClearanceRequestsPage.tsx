import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Tag, Input, Segmented, Skeleton, Empty } from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  ArrowRightOutlined,
  GlobalOutlined,
  EnvironmentOutlined,
  CalendarOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import { clearanceService } from '../../../services/clearanceService';
import { STATUS_DESCRIPTIONS, type ClearanceRequest } from '../../../types/clearance';
import { formatDate } from '../../../utils/formatters';

export const MyClearanceRequestsPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<ClearanceRequest[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const data = await clearanceService.getRequests(filterStatus, searchQuery);
      setRequests(data || []);
    } catch (err) {
      console.error('Failed to load clearance requests', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [filterStatus]);

  const handleSearch = () => {
    fetchRequests();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800 m-0">
            My Clearance Requests
          </h1>
          <p className="text-xs text-slate-500 m-0 mt-0.5">
            View and track all your active, completed, or draft customs clearance submissions.
          </p>
        </div>

        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate('/customer/customs-clearance/new')}
          className="!bg-brand-orange hover:!bg-brand-orange/90 font-bold h-11 px-6 rounded-xl shadow-md shrink-0"
        >
          New Clearance Request
        </Button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <Segmented
          options={[
            { label: 'All Requests', value: 'ALL' },
            { label: 'Active', value: 'ACTIVE' },
            { label: 'Completed', value: 'COMPLETED' },
            { label: 'Cancelled', value: 'CANCELLED' },
          ]}
          value={filterStatus}
          onChange={(val) => setFilterStatus(val as string)}
          className="font-bold text-xs p-1"
        />

        <Input
          placeholder="Search by Request # or Port..."
          prefix={<SearchOutlined className="text-slate-400" />}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onPressEnter={handleSearch}
          className="w-full sm:w-64 rounded-xl text-xs bg-slate-50 border-slate-200"
        />
      </div>

      {/* Requests Card List */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="rounded-2xl"><Skeleton active paragraph={{ rows: 4 }} /></Card>
          <Card className="rounded-2xl"><Skeleton active paragraph={{ rows: 4 }} /></Card>
        </div>
      ) : requests.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {requests.map((req) => {
            const statusInfo = STATUS_DESCRIPTIONS[req.status] || {
              label: req.status,
              badgeColor: 'bg-slate-100 text-slate-700',
            };
            const goodsNames =
              req.items && req.items.length > 0
                ? req.items.map((i) => i.productName).join(', ')
                : 'Imported Cargo';

            return (
              <Card
                key={req.id}
                className="rounded-2xl border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                bodyStyle={{ padding: '20px' }}
              >
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                        Clearance No.
                      </span>
                      <span className="text-base font-extrabold text-brand-navy">
                        {req.requestNumber}
                      </span>
                    </div>
                    <span
                      className={`text-xs font-extrabold px-3 py-1 rounded-full border ${statusInfo.badgeColor}`}
                    >
                      {statusInfo.label}
                    </span>
                  </div>

                  <div className="space-y-2 mb-4 text-xs">
                    <div>
                      <span className="text-slate-400 text-[11px] block">Goods Description</span>
                      <p className="font-bold text-slate-800 m-0 line-clamp-1">{goodsNames}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-slate-600 pt-1 border-t border-slate-100">
                      <div>
                        <span className="text-slate-400 text-[11px] block">Port of Entry</span>
                        <span className="font-semibold text-slate-700 flex items-center gap-1">
                          <EnvironmentOutlined className="text-emerald-500" /> {req.portOfEntry}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[11px] block">Shipment Mode</span>
                        <span className="font-semibold text-slate-700 capitalize flex items-center gap-1">
                          <GlobalOutlined className="text-blue-500" /> {req.shipmentType} Freight
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <CalendarOutlined /> {formatDate(req.createdAt)}
                  </span>
                  <Button
                    type="primary"
                    size="small"
                    onClick={() => navigate(`/customer/customs-clearance/requests/${req.id}`)}
                    className="!bg-brand-navy hover:!bg-brand-navy/90 font-bold rounded-lg text-xs flex items-center gap-1 px-4 h-8"
                  >
                    View Details <ArrowRightOutlined />
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="rounded-2xl border-slate-200 text-center py-12">
          <Empty
            description={
              <div className="space-y-2">
                <p className="font-bold text-slate-700 text-base m-0">No clearance requests found</p>
                <p className="text-xs text-slate-400 m-0">
                  {filterStatus === 'ALL'
                    ? 'You have not submitted any customs clearance requests yet.'
                    : `No requests found under ${filterStatus} filter.`}
                </p>
              </div>
            }
          />
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate('/customer/customs-clearance/new')}
            className="!bg-brand-orange hover:!bg-brand-orange/90 font-bold rounded-xl mt-4 h-10 px-6"
          >
            Start New Clearance Request
          </Button>
        </Card>
      )}
    </div>
  );
};

export default MyClearanceRequestsPage;
