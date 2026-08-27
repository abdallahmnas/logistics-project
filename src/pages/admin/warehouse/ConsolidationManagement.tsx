import React, { useEffect, useState, useMemo } from 'react';
import { Card, Button, Table, Tag, Input, Select, Drawer, Descriptions, Divider, Image, Tooltip, message, Steps, Modal } from 'antd';
import { SearchOutlined, EyeOutlined, BoxPlotOutlined, RocketOutlined, DollarOutlined, EnvironmentOutlined, UserOutlined, CalendarOutlined, CheckCircleOutlined, SyncOutlined, ArrowRightOutlined, PlusOutlined } from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { fetchConsolidations, fetchPackages, fetchBatches, updateConsolidation, addPackagesToBatch } from '../../../store/slices/shipmentSlice';
import { StatusBadge } from '../../../components/common/StatusBadge';
import { formatWeight, formatCbm, formatRmb, formatDate } from '../../../utils/formatters';
import { useNavigate } from 'react-router-dom';
import type { Consolidation } from '../../../types/shipment.types';

const { Option } = Select;

const STAGE_ORDER = ['requested', 'pending_packing', 'packaging', 'packaged', 'ready_to_batch', 'batched'];

const getNextStageConfig = (currentStatus: string) => {
  switch (currentStatus) {
    case 'requested':
      return { nextStatus: 'pending_packing', label: 'Queue for Packaging', icon: <BoxPlotOutlined /> };
    case 'pending_packing':
      return { nextStatus: 'packaging', label: 'Start Packaging', icon: <SyncOutlined /> };
    case 'packaging':
      return { nextStatus: 'packaged', label: 'Mark Packaged & Sealed', icon: <CheckCircleOutlined /> };
    case 'packaged':
      return { nextStatus: 'ready_to_batch', label: 'Mark Ready for Batching', icon: <RocketOutlined /> };
    default:
      return null;
  }
};

export const ConsolidationManagement: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { consolidations, packages, batches, loading } = useAppSelector((state) => state.shipments);

  const [search, setSearch] = useState('');
  const [methodFilter, setMethodFilter] = useState<string>('all');
  const [selectedConsolidation, setSelectedConsolidation] = useState<Consolidation | null>(null);
  const [selectedAddPkgId, setSelectedAddPkgId] = useState<string>('');
  const [updatingBox, setUpdatingBox] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Batch Assignment Modal States
  const [batchModalVisible, setBatchModalVisible] = useState(false);
  const [targetConsolidation, setTargetConsolidation] = useState<Consolidation | null>(null);
  const [selectedBatchId, setSelectedBatchId] = useState<string>('');
  const [attachingBatch, setAttachingBatch] = useState(false);

  useEffect(() => {
    dispatch(fetchConsolidations());
    dispatch(fetchPackages());
    dispatch(fetchBatches());
  }, [dispatch]);

  const handleOpenBatchModal = (consolidation: Consolidation) => {
    setTargetConsolidation(consolidation);
    const matchingBatches = batches.filter(
      (b) => b.shippingType === consolidation.shippingMethod && !['delivered', 'cancelled'].includes(b.status)
    );
    if (matchingBatches.length > 0) {
      setSelectedBatchId(matchingBatches[0].id);
    } else {
      setSelectedBatchId('');
    }
    setBatchModalVisible(true);
  };

  const handleAttachToExistingBatch = async () => {
    if (!targetConsolidation || !selectedBatchId) {
      message.warning('Please select an existing master batch.');
      return;
    }
    try {
      setAttachingBatch(true);
      await dispatch(
        addPackagesToBatch({
          batchId: selectedBatchId,
          packageIds: [targetConsolidation.id],
        })
      ).unwrap();

      dispatch(fetchConsolidations());
      dispatch(fetchBatches());
      message.success(`Consolidation ${targetConsolidation.consolidationId} added to Master Batch!`);
      setBatchModalVisible(false);
      setSelectedConsolidation(null);
    } catch (err: any) {
      const msg = typeof err === 'string' ? err : err?.message || 'Failed to attach to batch';
      message.error(msg);
    } finally {
      setAttachingBatch(false);
    }
  };

  const handleUpdateStatus = async (newStatus: string) => {
    if (!selectedConsolidation) return;
    try {
      setUpdatingStatus(true);
      const updated = await dispatch(
        updateConsolidation({ id: selectedConsolidation.id, status: newStatus as any })
      ).unwrap();
      setSelectedConsolidation(updated);
      dispatch(fetchConsolidations());
      message.success(`Consolidation stage updated to ${newStatus.toUpperCase()}`);
    } catch (err: any) {
      const msg = typeof err === 'string' ? err : err?.message || 'Failed to update consolidation stage';
      message.error(msg);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleRemovePackageFromBox = async (pkgId: string) => {
    if (!selectedConsolidation) return;
    const currentIds = selectedConsolidation.packageIds || [];
    const updatedPackageIds = currentIds.filter((id) => id !== pkgId && id !== packages.find(p => p.trackingId === id)?.id);

    if (updatedPackageIds.length === 0) {
      message.error('Consolidation box must contain at least 1 package.');
      return;
    }

    try {
      setUpdatingBox(true);
      const updated = await dispatch(
        updateConsolidation({ id: selectedConsolidation.id, packageIds: updatedPackageIds })
      ).unwrap();
      setSelectedConsolidation(updated);
      dispatch(fetchPackages());
      message.success('Package removed from consolidation box.');
    } catch (err: any) {
      const msg = typeof err === 'string' ? err : err?.message || 'Failed to remove package';
      message.error(msg);
    } finally {
      setUpdatingBox(false);
    }
  };

  const handleAddPackageToBox = async () => {
    if (!selectedConsolidation || !selectedAddPkgId) return;
    const currentIds = selectedConsolidation.packageIds || [];
    if (currentIds.includes(selectedAddPkgId)) return;

    try {
      setUpdatingBox(true);
      const updated = await dispatch(
        updateConsolidation({ id: selectedConsolidation.id, packageIds: [...currentIds, selectedAddPkgId] })
      ).unwrap();
      setSelectedConsolidation(updated);
      dispatch(fetchPackages());
      setSelectedAddPkgId('');
      message.success('Package added to consolidation box.');
    } catch (err: any) {
      const msg = typeof err === 'string' ? err : err?.message || 'Failed to add package';
      message.error(msg);
    } finally {
      setUpdatingBox(false);
    }
  };

  const availableCustomerPackages = useMemo(() => {
    if (!selectedConsolidation) return [];
    const boxWarehouse = (selectedConsolidation.originCountry || 'Guangzhou Hub').toLowerCase().trim();

    return packages.filter((p) => {
      const isCustomer =
        p.customerId === selectedConsolidation.customerId || p.customerName === selectedConsolidation.customerName;
      const isStatusValid = ['received_cn', 'ready_to_pack', 'received_at_warehouse'].includes(p.status);
      const isNotAlreadyAttached =
        !selectedConsolidation.packageIds.includes(p.id) && !selectedConsolidation.packageIds.includes(p.trackingId);

      // Strict Warehouse Match: Package MUST be stored at the SAME warehouse facility
      const pkgWarehouse = (p.originCountry || 'Guangzhou Hub').toLowerCase().trim();
      const isSameWarehouse = pkgWarehouse.includes(boxWarehouse) || boxWarehouse.includes(pkgWarehouse);

      return isCustomer && isStatusValid && isNotAlreadyAttached && isSameWarehouse;
    });
  }, [packages, selectedConsolidation]);

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
            {/* Interactive Stage Progress Bar & Quick Action Button */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-[11px] text-slate-400 font-extrabold uppercase tracking-wider">
                  Packaging Process Timeline (Click any step to jump stage)
                </span>
                <StatusBadge module="shipment" status={selectedConsolidation.status} />
              </div>

              <Steps
                current={STAGE_ORDER.indexOf(selectedConsolidation.status)}
                onChange={(currentStep) => {
                  const targetStatus = STAGE_ORDER[currentStep];
                  if (targetStatus && targetStatus !== selectedConsolidation.status) {
                    handleUpdateStatus(targetStatus);
                  }
                }}
                size="small"
                items={[
                  { title: 'Requested', description: 'Customer request' },
                  { title: 'Pending', description: 'In Queue' },
                  { title: 'Packaging', description: 'Re-packing' },
                  { title: 'Packaged', description: 'Sealed & Weighed' },
                  { title: 'Ready', description: 'Ready for Batch' },
                ]}
              />

              {/* Action Buttons & Dropdown Controls */}
              <div className="pt-2 border-t border-slate-200/60 flex flex-wrap justify-between items-center gap-3">
                <div className="flex items-center gap-2 flex-wrap">
                  {(() => {
                    const nextConfig = getNextStageConfig(selectedConsolidation.status);
                    if (nextConfig) {
                      return (
                        <Button
                          type="primary"
                          icon={nextConfig.icon}
                          loading={updatingStatus}
                          className="bg-emerald-600 hover:bg-emerald-700 font-bold border-none"
                          onClick={() => handleUpdateStatus(nextConfig.nextStatus)}
                        >
                          {nextConfig.label} <ArrowRightOutlined className="ml-1 text-xs" />
                        </Button>
                      );
                    }
                    return null;
                  })()}

                  <span className="text-xs text-slate-400 font-medium hidden sm:inline">Or override:</span>

                  <Select
                    value={selectedConsolidation.status}
                    onChange={handleUpdateStatus}
                    loading={updatingStatus}
                    size="middle"
                    className="w-48 font-bold"
                  >
                    <Option value="requested">📥 Requested</Option>
                    <Option value="pending_packing">📦 Pending Packaging</Option>
                    <Option value="packaging">⚙️ In Packaging</Option>
                    <Option value="packaged">✅ Packaged & Sealed</Option>
                    <Option value="ready_to_batch">🚀 Ready for Batching</Option>
                    <Option value="batched">🔒 Batched</Option>
                  </Select>
                </div>

                <Tooltip
                  title={
                    selectedConsolidation.status !== 'ready_to_batch'
                      ? "Must update stage to 'Ready for Batching' before assigning to container/flight batch"
                      : ""
                  }
                >
                  <Button
                    type="primary"
                    size="middle"
                    icon={<RocketOutlined />}
                    disabled={selectedConsolidation.status !== 'ready_to_batch'}
                    className="bg-brand-navy font-bold disabled:opacity-40 shrink-0"
                    onClick={() => handleOpenBatchModal(selectedConsolidation)}
                  >
                    Assign to Batch
                  </Button>
                </Tooltip>
              </div>
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
              <div className="flex justify-between items-center mb-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest m-0">
                  ATTACHED PARCELS ({selectedConsolidation.packageIds.length})
                </h4>
                {selectedConsolidation.status === 'ready_to_batch' && (
                  <Tag color="orange" className="font-bold text-[10px] uppercase border-none m-0">
                    EDITABLE BEFORE BATCHING
                  </Tag>
                )}
              </div>

              <div className="space-y-3">
                {attachedPackages.length > 0 ? (
                  attachedPackages.map((pkg) => (
                    <div key={pkg.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-start">
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

                      <div className="flex items-center gap-2">
                        {pkg.photos && pkg.photos.length > 0 && (
                          <Image src={pkg.photos[0]} alt="Condition" className="w-12 h-12 rounded object-cover border border-slate-200" />
                        )}
                        {selectedConsolidation.status === 'ready_to_batch' && (
                          <Button
                            danger
                            size="small"
                            type="text"
                            loading={updatingBox}
                            className="font-bold text-xs"
                            onClick={() => handleRemovePackageFromBox(pkg.id)}
                          >
                            Remove
                          </Button>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-center">
                    <p className="text-xs font-bold text-slate-400 m-0">Package IDs in this request:</p>
                    <div className="flex flex-wrap gap-1.5 justify-center mt-2">
                      {selectedConsolidation.packageIds.map((pid) => (
                        <div key={pid} className="flex items-center gap-1 bg-white border border-slate-200 px-2 py-1 rounded text-xs font-mono">
                          <span>{pid}</span>
                          {selectedConsolidation.status === 'ready_to_batch' && (
                            <button
                              onClick={() => handleRemovePackageFromBox(pid)}
                              className="text-red-500 hover:text-red-700 ml-1 text-xs font-bold"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Add Available Package Section */}
                {selectedConsolidation.status === 'ready_to_batch' && (
                  <div className="mt-4 p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
                    <h5 className="text-xs font-bold text-[#0A1128] m-0 mb-2">
                      Add Another Received Package for {selectedConsolidation.customerName}:
                    </h5>
                    {availableCustomerPackages.length > 0 ? (
                      <div className="flex gap-2">
                        <Select
                          size="large"
                          className="flex-1"
                          placeholder="Select package stored at warehouse..."
                          value={selectedAddPkgId || undefined}
                          onChange={setSelectedAddPkgId}
                          options={availableCustomerPackages.map((p) => ({
                            label: `${p.trackingId} - ${p.description || 'Goods'} (${p.weightKg || 0}kg)`,
                            value: p.id,
                          }))}
                        />
                        <Button
                          type="primary"
                          size="large"
                          disabled={!selectedAddPkgId}
                          loading={updatingBox}
                          onClick={handleAddPackageToBox}
                          className="bg-brand-orange hover:bg-[#E86E21] font-bold"
                        >
                          + Add to Box
                        </Button>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 m-0 italic">
                        No additional unassigned warehouse packages found for this customer.
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </Drawer>

      {/* Assign Consolidation to Master Batch Modal */}
      <Modal
        open={batchModalVisible}
        onCancel={() => setBatchModalVisible(false)}
        footer={null}
        width={620}
        title={
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <RocketOutlined className="text-brand-navy text-xl" />
            <span className="font-extrabold text-slate-800 text-lg">
              Assign Consolidation to Master Batch
            </span>
          </div>
        }
      >
        {targetConsolidation && (
          <div className="space-y-6 pt-3">
            {/* Target Consolidation Summary Card */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex justify-between items-center">
              <div>
                <span className="text-[11px] text-slate-400 font-extrabold uppercase tracking-wider block">
                  Consolidation Request
                </span>
                <span className="text-base font-extrabold text-slate-800 font-mono">
                  {targetConsolidation.consolidationId}
                </span>
                <span className="text-xs text-slate-500 block font-medium mt-0.5">
                  {targetConsolidation.customerName} • {targetConsolidation.totalWeightKg || 0} kg • {targetConsolidation.totalCbm || 0} CBM
                </span>
              </div>
              <Tag color={targetConsolidation.shippingMethod === 'air' ? 'blue' : 'cyan'} className="uppercase font-bold text-xs px-3 py-1 m-0">
                {targetConsolidation.shippingMethod} FREIGHT
              </Tag>
            </div>

            {/* OPTION 1: PRIMARY ACTION - Add to Existing Batch */}
            <div className="border-2 border-brand-navy/30 bg-brand-navy/[0.02] p-5 rounded-2xl space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="font-extrabold text-slate-800 text-sm flex items-center gap-2 m-0">
                  <span className="bg-brand-navy text-white text-xs w-5 h-5 rounded-full inline-flex items-center justify-center font-bold">1</span>
                  Include in an Existing Master Batch
                </h4>
                <Tag color="green" className="font-extrabold text-[10px] uppercase tracking-wider">RECOMMENDED / PRIMARY</Tag>
              </div>

              <p className="text-xs text-slate-500 leading-relaxed m-0">
                Select an active open {targetConsolidation.shippingMethod?.toUpperCase()} freight container or flight manifest to attach this consolidation box.
              </p>

              {(() => {
                const matchingBatches = batches.filter(
                  (b) => b.shippingType === targetConsolidation.shippingMethod && !['delivered', 'cancelled'].includes(b.status)
                );

                if (matchingBatches.length === 0) {
                  return (
                    <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 font-medium">
                      ⚠️ No active open {targetConsolidation.shippingMethod?.toUpperCase()} batches found. Please create a new batch using Option 2 below.
                    </div>
                  );
                }

                return (
                  <div className="space-y-3">
                    <Select
                      value={selectedBatchId}
                      onChange={setSelectedBatchId}
                      size="large"
                      className="w-full font-bold"
                      placeholder="Select an existing master batch..."
                    >
                      {matchingBatches.map((b) => (
                        <Option key={b.id} value={b.id}>
                          📦 {b.masterTrackingId} — {b.carrierName} ({b.flightVoyageNo}) [{b.packageCount || 0} parcels]
                        </Option>
                      ))}
                    </Select>

                    <Button
                      type="primary"
                      size="large"
                      icon={<RocketOutlined />}
                      loading={attachingBatch}
                      disabled={!selectedBatchId}
                      onClick={handleAttachToExistingBatch}
                      className="w-full bg-brand-navy hover:bg-slate-800 font-bold h-12 text-sm rounded-xl border-none shadow-md shadow-slate-300/40"
                    >
                      ⚡ Attach to Selected Master Batch
                    </Button>
                  </div>
                );
              })()}
            </div>

            <Divider className="my-2 text-xs text-slate-400 font-bold uppercase tracking-widest">OR</Divider>

            {/* OPTION 2: SECONDARY ACTION - Create New Batch */}
            <div className="border border-slate-200 p-4.5 rounded-xl flex items-center justify-between gap-4 bg-slate-50/50">
              <div>
                <h5 className="font-bold text-slate-800 text-xs mb-1">Option 2: Create a New Master Batch</h5>
                <p className="text-[11px] text-slate-500 m-0">
                  Initialize a brand new container or flight manifest if no existing batch fits.
                </p>
              </div>

              <Button
                type="default"
                size="middle"
                icon={<PlusOutlined />}
                className="font-bold text-slate-700 border-slate-300 hover:border-brand-navy hover:text-brand-navy shrink-0 bg-white"
                onClick={() => {
                  const cid = targetConsolidation.id;
                  setBatchModalVisible(false);
                  setSelectedConsolidation(null);
                  navigate(`/admin/warehouse/batches/new?consolidationId=${cid}`);
                }}
              >
                Create New Batch
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
