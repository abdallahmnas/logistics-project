import React, { useEffect, useState, useMemo } from 'react';
import { Card, Button, Table, Tag, Input, Select, Drawer, Descriptions, Divider, Image } from 'antd';
import { SearchOutlined, EyeOutlined, BoxPlotOutlined, RocketOutlined, DollarOutlined, EnvironmentOutlined, UserOutlined, CalendarOutlined } from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { fetchConsolidations, fetchPackages } from '../../../store/slices/shipmentSlice';
import { StatusBadge } from '../../../components/common/StatusBadge';
import { formatWeight, formatCbm, formatRmb, formatDate } from '../../../utils/formatters';
import { useNavigate } from 'react-router-dom';
import type { Consolidation } from '../../../types/shipment.types';

const { Option } = Select;

export const ConsolidationManagement: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { consolidations, packages, loading } = useAppSelector((state) => state.shipments);

  const [search, setSearch] = useState('');
  const [methodFilter, setMethodFilter] = useState<string>('all');
  const [selectedConsolidation, setSelectedConsolidation] = useState<Consolidation | null>(null);

  useEffect(() => {
    dispatch(fetchConsolidations());
    dispatch(fetchPackages());
  }, [dispatch]);

  const filteredConsolidations = useMemo(() => {
    return consolidations.filter((c) => {
      const matchSearch =
        c.consolidationId.toLowerCase().includes(search.toLowerCase()) ||
        c.customerName.toLowerCase().includes(search.toLowerCase());
      const matchMethod = methodFilter === 'all' || c.shippingMethod === methodFilter;
      return matchSearch && matchMethod;
    });
  }, [consolidations, search, methodFilter]);

  // Packages belonging to the currently inspected consolidation
  const attachedPackages = useMemo(() => {
    if (!selectedConsolidation) return [];
    return packages.filter((p) => selectedConsolidation.packageIds.includes(p.id) || selectedConsolidation.packageIds.includes(p.trackingId));
  }, [selectedConsolidation, packages]);

  const columns = [
    {
      title: 'Consolidation ID',
      dataIndex: 'consolidationId',
      key: 'consolidationId',
      render: (v: string, record: Consolidation) => (
        <Button
          type="link"
          className="p-0 font-bold font-mono text-brand-navy hover:text-brand-orange text-sm"
          onClick={() => setSelectedConsolidation(record)}
        >
          {v}
        </Button>
      ),
    },
    { title: 'Customer', dataIndex: 'customerName', key: 'customerName', render: (name: string) => <span className="font-semibold text-slate-700">{name}</span> },
    {
      title: 'Shipping Type',
      dataIndex: 'shippingMethod',
      key: 'shippingMethod',
      render: (t: string) => (
        <Tag color={t === 'air' ? 'blue' : 'cyan'} className="uppercase font-bold tracking-widest text-[10px] m-0 px-2 py-0.5">
          {t} FREIGHT
        </Tag>
      ),
    },
    {
      title: 'Destination',
      dataIndex: 'destinationWarehouse',
      key: 'destinationWarehouse',
      render: (dest: string) => (
        <span className="uppercase text-xs font-bold text-slate-600 flex items-center gap-1">
          <EnvironmentOutlined className="text-brand-orange text-xs" /> {dest || 'Lagos Hub'}
        </span>
      ),
    },
    { title: 'Packages', dataIndex: 'packageIds', key: 'packageIds', render: (ids: string[]) => <Tag color="default" className="font-bold text-slate-700">{ids?.length || 0} Parcels</Tag> },
    {
      title: 'Total Metrics',
      key: 'totals',
      render: (record: Consolidation) => (
        <div className="text-sm font-medium">
          {record.shippingMethod === 'air' ? (
            <div className="text-brand-navy font-bold">{formatWeight(record.totalWeightKg)}</div>
          ) : (
            <div className="text-slate-600 font-bold">{formatCbm(record.totalCbm)}</div>
          )}
        </div>
      ),
    },
    { title: 'Shipping Fee', dataIndex: 'shippingFee', key: 'shippingFee', render: (v: number) => <span className="font-bold text-emerald-600">{formatRmb(v)}</span> },
    { title: 'Status', dataIndex: 'status', key: 'status', render: (s: string) => <StatusBadge module="shipment" status={s} /> },
    {
      title: 'Action',
      key: 'action',
      render: (record: Consolidation) => (
        <Button
          type="text"
          icon={<EyeOutlined />}
          className="text-slate-500 hover:text-brand-navy"
          onClick={() => setSelectedConsolidation(record)}
        >
          View Details
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in-up max-w-[1200px] mx-auto pb-20 mt-4">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 m-0">Consolidations Hub</h1>
          <p className="text-slate-500 mt-1 mb-0 text-sm">Customer multi-package shipment requests ready for Master Batch assignment</p>
        </div>
        <Button
          type="primary"
          size="large"
          icon={<RocketOutlined />}
          className="bg-brand-navy hover:!bg-brand-navy/90 font-bold"
          onClick={() => navigate('/admin/warehouse/batches/new')}
        >
          Build Master Batch
        </Button>
      </div>

      {/* Filter Toolbar */}
      <Card bordered={false} className="shadow-sm rounded-xl">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
          <Input
            prefix={<SearchOutlined className="text-slate-400" />}
            placeholder="Search by Consolidation ID or Customer name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-md"
            size="large"
            allowClear
          />
          <Select value={methodFilter} onChange={setMethodFilter} size="large" className="w-48">
            <Option value="all">All Freight Types</Option>
            <Option value="air">✈️ Air Freight</Option>
            <Option value="sea">🚢 Sea Freight</Option>
          </Select>
        </div>
      </Card>

      {/* Main Consolidations Table */}
      <Card bordered={false} className="shadow-sm rounded-2xl">
        <Table
          columns={columns}
          dataSource={filteredConsolidations}
          rowKey="id"
          loading={loading}
          scroll={{ x: 950 }}
          pagination={{ pageSize: 10 }}
          className="custom-admin-table"
          expandable={{
            expandedRowRender: (record) => (
              <div className="p-4 bg-slate-50 rounded-lg m-2 border border-slate-200 space-y-2">
                <p className="font-bold text-xs uppercase tracking-widest text-slate-500 m-0">Attached Package IDs:</p>
                <div className="flex flex-wrap gap-2">
                  {record.packageIds.map((pid: string) => (
                    <Tag key={pid} color="blue" className="m-0 font-mono font-bold text-xs py-0.5 px-2">
                      {pid}
                    </Tag>
                  ))}
                </div>
              </div>
            ),
          }}
        />
      </Card>

      {/* Consolidation Info Side-Sliding Drawer */}
      <Drawer
        open={Boolean(selectedConsolidation)}
        onClose={() => setSelectedConsolidation(null)}
        title={
          <span className="font-mono font-bold text-slate-800 text-lg">
            Consolidation Info: {selectedConsolidation?.consolidationId}
          </span>
        }
        size="large"
      >
        {selectedConsolidation && (
          <div className="space-y-6">
            {/* Header Status Bar */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex justify-between items-center">
              <div>
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block mb-1">Status</span>
                <StatusBadge module="shipment" status={selectedConsolidation.status} />
              </div>
              <Button
                type="primary"
                icon={<RocketOutlined />}
                className="bg-brand-navy font-bold"
                onClick={() => {
                  const cid = selectedConsolidation.id;
                  setSelectedConsolidation(null);
                  navigate(`/admin/warehouse/batches/new?consolidationId=${cid}`);
                }}
              >
                Assign to Batch
              </Button>
            </div>

            {/* Consolidation Specifications */}
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">CONSOLIDATION SPECIFICATIONS</h4>
              <Descriptions column={1} bordered size="small" className="bg-white rounded-lg overflow-hidden">
                <Descriptions.Item label="Customer">
                  <span className="font-bold text-slate-800"><UserOutlined className="mr-1 text-slate-400" /> {selectedConsolidation.customerName}</span>
                </Descriptions.Item>
                <Descriptions.Item label="Freight Method">
                  <Tag color={selectedConsolidation.shippingMethod === 'air' ? 'blue' : 'cyan'} className="uppercase font-bold m-0">
                    {selectedConsolidation.shippingMethod} FREIGHT
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Destination Warehouse">
                  <span className="uppercase font-bold text-slate-700"><EnvironmentOutlined className="mr-1 text-brand-orange" /> {selectedConsolidation.destinationWarehouse || 'Lagos Central Hub'}</span>
                </Descriptions.Item>
                <Descriptions.Item label="Total Weight">
                  <span className="font-mono font-bold text-brand-navy">{formatWeight(selectedConsolidation.totalWeightKg)}</span>
                </Descriptions.Item>
                <Descriptions.Item label="Total CBM">
                  <span className="font-mono font-bold text-slate-700">{formatCbm(selectedConsolidation.totalCbm)}</span>
                </Descriptions.Item>
                <Descriptions.Item label="Calculated Shipping Fee">
                  <span className="font-mono font-bold text-emerald-600">{formatRmb(selectedConsolidation.shippingFee)}</span>
                </Descriptions.Item>
                <Descriptions.Item label="Payment Method">
                  <span className="uppercase font-bold text-slate-600"><DollarOutlined className="mr-1 text-emerald-500" /> {selectedConsolidation.paymentMethod || 'Wallet'}</span>
                </Descriptions.Item>
                <Descriptions.Item label="Created At">
                  <span className="text-slate-600"><CalendarOutlined className="mr-1 text-slate-400" /> {formatDate(selectedConsolidation.createdAt)}</span>
                </Descriptions.Item>
              </Descriptions>
            </div>

            {/* Attached Parcels Breakdown */}
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
                ATTACHED PARCELS ({selectedConsolidation.packageIds.length})
              </h4>
              <div className="space-y-3">
                {attachedPackages.length > 0 ? (
                  attachedPackages.map((pkg) => (
                    <div key={pkg.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex justify-between items-start">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-brand-navy text-xs">{pkg.trackingId}</span>
                          <StatusBadge module="shipment" status={pkg.status} />
                        </div>
                        <p className="text-xs text-slate-600 font-medium m-0">{pkg.description}</p>
                        <div className="text-[11px] text-slate-400 font-mono">
                          Weight: {pkg.weightKg}kg | CBM: {pkg.cbm?.toFixed(3) || '0.000'}m³
                        </div>
                      </div>
                      {pkg.photos && pkg.photos.length > 0 && (
                        <Image src={pkg.photos[0]} alt="Condition" className="w-12 h-12 rounded object-cover border border-slate-200" />
                      )}
                    </div>
                  ))
                ) : (
                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-center">
                    <p className="text-xs font-bold text-slate-400 m-0">Package IDs in this request:</p>
                    <div className="flex flex-wrap gap-1.5 justify-center mt-2">
                      {selectedConsolidation.packageIds.map((pid) => (
                        <Tag key={pid} color="blue" className="m-0 font-mono text-xs">
                          {pid}
                        </Tag>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
};
