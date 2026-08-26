import React, { useEffect, useMemo, useState } from 'react';
import { Card, Button, Table, Tag, message, Select, Form, Modal, Input } from 'antd';
import { ArrowLeftOutlined, PlusOutlined, DatabaseOutlined, SaveOutlined, EnvironmentOutlined, SyncOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { fetchAllBatches } from '../../../store/slices/adminSlice';
import { addPackagesToBatch, fetchConsolidations, updateBatchStatus } from '../../../store/slices/shipmentSlice';
import { fetchNotifications } from '../../../store/slices/notificationSlice';
import { fetchFacilities } from '../../../store/slices/facilitySlice';
import { StatusBadge } from '../../../components/common/StatusBadge';
import { formatWeight, formatCbm, formatDate } from '../../../utils/formatters';

const { Option } = Select;

export const ViewBatchPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { allBatches, loading: adminLoading } = useAppSelector((state) => state.admin);
  const { consolidations, loading: shipLoading } = useAppSelector((state) => state.shipments);
  const { facilities } = useAppSelector((state) => state.facilities);

  const [adding, setAdding] = useState(false);
  const [form] = Form.useForm();
  
  // Status Update & Arrival Modal State
  const [arrivedModalOpen, setArrivedModalOpen] = useState(false);
  const [selectedNgWarehouse, setSelectedNgWarehouse] = useState<string>('');
  const [currentLocationNote, setCurrentLocationNote] = useState<string>('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const selectedConsolidationIds = Form.useWatch('newConsolidationIds', form) || [];

  useEffect(() => {
    if (allBatches.length === 0) dispatch(fetchAllBatches());
    dispatch(fetchConsolidations());
    dispatch(fetchFacilities());
  }, [dispatch, allBatches.length]);

  const batch = allBatches.find((b) => b.id === id);
  const [pendingStatus, setPendingStatus] = useState<string>(batch?.status || 'shipping_exported');

  useEffect(() => {
    if (batch?.status) {
      setPendingStatus(batch.status);
    }
  }, [batch?.status]);

  // Dynamic Nigerian Warehouse Facilities from Database
  const ngWarehouseOptions = useMemo(() => {
    const ngFacilities = facilities.filter(f =>
      f.country?.toLowerCase() === 'nigeria' ||
      f.country?.toLowerCase() === 'ng' ||
      f.location?.toLowerCase().includes('nigeria') ||
      f.location?.toLowerCase().includes('lagos') ||
      f.location?.toLowerCase().includes('abuja') ||
      f.location?.toLowerCase().includes('kano') ||
      f.location?.toLowerCase().includes('port harcourt')
    );

    if (ngFacilities.length > 0) {
      return ngFacilities.map(f => ({
        label: `🏢 ${f.name} (${f.location || f.code})`,
        value: f.name,
      }));
    }

    // Default Fallback Nigerian Warehouses if not created in settings yet
    return [
      { label: '🏢 Lagos Main Hub (Ikeja Central Warehouse)', value: 'Lagos Main Hub (Ikeja Central Warehouse)' },
      { label: '🏢 Abuja Branch Distribution Center', value: 'Abuja Branch Distribution Center' },
      { label: '🏢 Kano Regional Hub', value: 'Kano Regional Hub' },
      { label: '🏢 Port Harcourt Cargo Hub', value: 'Port Harcourt Cargo Hub' },
    ];
  }, [facilities]);

  useEffect(() => {
    if (batch?.destinationWarehouse) {
      setSelectedNgWarehouse(batch.destinationWarehouse);
    } else if (ngWarehouseOptions.length > 0) {
      setSelectedNgWarehouse(ngWarehouseOptions[0].value);
    }
  }, [batch?.destinationWarehouse, ngWarehouseOptions]);

  const batchConsolidations = useMemo(() => {
    if (!batch) return [];
    return consolidations.filter((c) => batch.consolidationIds?.includes(c.id));
  }, [batch, consolidations]);

  const eligibleConsolidations = useMemo(() => {
    return consolidations.filter((c) => 
      c.status === 'ready_to_batch' && 
      c.shippingMethod === batch?.shippingType &&
      (!batch || !batch.consolidationIds?.includes(c.id))
    );
  }, [consolidations, batch]);

  // Dynamically calculate totals for Air vs Sea
  const { totalWeightKg, totalCbm } = useMemo(() => {
    let weight = 0;
    let cbm = 0;
    batchConsolidations.forEach(c => {
      weight += c.totalWeightKg || 0;
      cbm += c.totalCbm || 0;
    });
    // Add dynamically selected but not yet saved consolidations
    const pendingConsolidations = eligibleConsolidations.filter(c => selectedConsolidationIds.includes(c.id));
    pendingConsolidations.forEach(c => {
      weight += c.totalWeightKg || 0;
      cbm += c.totalCbm || 0;
    });
    return { totalWeightKg: weight, totalCbm: cbm };
  }, [batchConsolidations, eligibleConsolidations, selectedConsolidationIds]);

  if (!batch) {
    return (
      <div className="p-8 text-center">
        <p>Batch not found.</p>
        <Button onClick={() => navigate('/admin/warehouse/batches')}>Return</Button>
      </div>
    );
  }

  const handleAddConsolidations = async () => {
    if (selectedConsolidationIds.length === 0) return;
    setAdding(true);
    try {
      await dispatch(addPackagesToBatch({ batchId: batch.id, packageIds: selectedConsolidationIds })).unwrap();
      message.success('Consolidations added to batch.');
      form.resetFields();
    } catch {
      message.error('Failed to add consolidations.');
    } finally {
      setAdding(false);
    }
  };

  const handleApplyStatusUpdate = async () => {
    if (!pendingStatus || pendingStatus === batch.status) return;

    if (pendingStatus === 'arrived_ng') {
      setArrivedModalOpen(true);
      return;
    }

    setUpdatingStatus(true);
    try {
      await dispatch(updateBatchStatus({ id: batch.id, status: pendingStatus })).unwrap();
      dispatch(fetchAllBatches());
      dispatch(fetchConsolidations());
      dispatch(fetchNotifications());
      message.success(`Batch status updated to ${pendingStatus}`);
    } catch (err: any) {
      message.error(err?.message || 'Failed to update batch status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleConfirmArrivedNigeria = async () => {
    if (!selectedNgWarehouse) {
      message.error('Please select a Nigerian destination warehouse facility.');
      return;
    }
    setUpdatingStatus(true);
    try {
      await dispatch(updateBatchStatus({
        id: batch.id,
        status: 'arrived_ng',
        destinationWarehouse: selectedNgWarehouse,
        currentLocation: currentLocationNote || selectedNgWarehouse,
      })).unwrap();
      dispatch(fetchAllBatches());
      dispatch(fetchConsolidations());
      dispatch(fetchNotifications());
      message.success(`Master Batch updated: Arrived at ${selectedNgWarehouse}`);
      setArrivedModalOpen(false);
    } catch (err: any) {
      message.error(err?.message || 'Failed to update arrival status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const columns = [
    { title: 'Consolidation ID', dataIndex: 'consolidationId', key: 'consolidationId', render: (v: string) => <span className="font-bold text-brand-navy">{v}</span> },
    { title: 'Customer', dataIndex: 'customerName', key: 'customerName' },
    { title: 'Packages', dataIndex: 'packageIds', key: 'packageIds', render: (ids: string[]) => ids.length },
    { title: 'Weight', dataIndex: 'totalWeightKg', key: 'totalWeightKg', render: (v: number) => formatWeight(v) },
    { title: 'CBM', dataIndex: 'totalCbm', key: 'totalCbm', render: (v: number) => formatCbm(v) },
    { title: 'Status', dataIndex: 'status', key: 'status', render: (s: string) => <StatusBadge module="shipment" status={s} /> }
  ];

  return (
    <div className="space-y-6 animate-fade-in-up max-w-[1200px] mx-auto pb-20 mt-4">
      
      {/* Header Area */}
      <div className="flex items-center gap-4 mb-4">
        <Button 
          icon={<ArrowLeftOutlined />} 
          type="text" 
          onClick={() => navigate('/admin/warehouse/batches')}
          className="text-slate-400 hover:text-brand-navy"
        />
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-extrabold text-[#0A1128] m-0 leading-tight">
              {batch.masterTrackingId}
            </h1>
            <Tag color={batch.shippingType === 'air' ? 'blue' : 'cyan'} className="uppercase font-bold tracking-widest text-[10px] m-0">
              {batch.shippingType} FREIGHT
            </Tag>
          </div>
          <p className="text-slate-500 mt-1 mb-0 text-sm font-medium">
            {batch.carrierName} • {batch.flightVoyageNo} {batch.containerNo ? `• Container: ${batch.containerNo}` : ''}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Column: Batch Details & Totals */}
        <div className="md:col-span-1 space-y-6">
          <Card bordered={false} className="shadow-sm rounded-xl bg-gradient-to-br from-slate-800 to-brand-navy text-white">
            <div className="flex items-center justify-between mb-4">
              <span className="text-white/70 text-xs font-bold uppercase tracking-wider">Total Payload</span>
              <DatabaseOutlined className="text-white/30 text-xl" />
            </div>
            {batch.shippingType === 'air' ? (
              <div>
                <div className="text-4xl font-extrabold">{totalWeightKg.toFixed(2)}</div>
                <div className="text-white/70 text-sm mt-1">Kilograms (KG)</div>
              </div>
            ) : (
              <div>
                <div className="text-4xl font-extrabold">{totalCbm.toFixed(3)}</div>
                <div className="text-white/70 text-sm mt-1">Cubic Meters (CBM)</div>
              </div>
            )}
            <div className="mt-6 pt-4 border-t border-white/10 flex justify-between text-xs">
              <span className="text-white/70">Total Consolidations</span>
              <span className="font-bold text-white">{batchConsolidations.length + selectedConsolidationIds.length}</span>
            </div>
          </Card>

          {/* Destination Warehouse Facility Info */}
          <Card bordered={false} className="shadow-sm rounded-xl bg-orange-50/70 border border-orange-200">
            <div className="text-[10px] font-bold text-orange-600 uppercase tracking-widest mb-1 flex items-center gap-1.5">
              <EnvironmentOutlined /> NIGERIA DESTINATION WAREHOUSE
            </div>
            <div className="text-base font-extrabold text-[#0A1128]">
              {batch.destinationWarehouse || 'Lagos Main Hub (Default)'}
            </div>
            {batch.currentLocation && (
              <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                <span>📍 Location / Notes:</span>
                <span className="font-semibold text-slate-700">{batch.currentLocation}</span>
              </div>
            )}
          </Card>

          <Card bordered={false} className="shadow-sm rounded-xl">
            <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
              <PlusOutlined className="text-brand-orange" />
              Add Consolidations
            </h3>
            <Form form={form} layout="vertical">
              <Form.Item name="newConsolidationIds" className="mb-4">
                <Select
                  mode="multiple"
                  placeholder="Search consolidation ID..."
                  className="w-full [&>.ant-select-selector]:!bg-slate-50"
                  optionFilterProp="children"
                >
                  {eligibleConsolidations.map(c => (
                    <Option key={c.id} value={c.id}>
                      {c.consolidationId} - {batch.shippingType === 'air' ? formatWeight(c.totalWeightKg) : formatCbm(c.totalCbm)}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              <Button 
                type="primary" 
                block 
                icon={<SaveOutlined />} 
                className="bg-brand-orange font-bold hover:bg-orange-600 border-none"
                onClick={handleAddConsolidations}
                loading={adding}
                disabled={selectedConsolidationIds.length === 0}
              >
                Add {selectedConsolidationIds.length > 0 ? selectedConsolidationIds.length : ''} to Batch
              </Button>
            </Form>
          </Card>
        </div>

        {/* Right Column: Package List & Batch Controls */}
        <div className="md:col-span-2 space-y-6">
          {/* Status Update Toolbar */}
          <Card bordered={false} className="shadow-sm rounded-xl">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">
                  Master Batch Lifecycle Status
                </span>
                <div className="flex items-center gap-2">
                  <StatusBadge module="shipment" status={batch.status} />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                <Select
                  size="large"
                  value={pendingStatus}
                  className="w-full sm:w-64"
                  onChange={(newVal) => setPendingStatus(newVal)}
                >
                  <Option value="shipping_exported">✈️ Shipped / Exported (In Transit)</Option>
                  <Option value="arrived_ng">
                    🇳🇬 Arrived in Nigeria ({batch.destinationWarehouse || 'Select Warehouse...'})
                  </Option>
                  <Option value="delivered">✅ Delivered / Completed</Option>
                </Select>

                <Button
                  type="primary"
                  size="large"
                  icon={<SyncOutlined />}
                  disabled={pendingStatus === batch.status}
                  loading={updatingStatus}
                  onClick={handleApplyStatusUpdate}
                  className="bg-brand-orange hover:bg-[#E86E21] border-none font-bold shadow-sm"
                >
                  Update Status
                </Button>
              </div>
            </div>
          </Card>

          <Card bordered={false} className="shadow-sm rounded-xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-slate-800 m-0">Consolidated Shipments</h2>
              <Tag color="blue" className="font-bold uppercase m-0">{batchConsolidations.length} Consolidations Attached</Tag>
            </div>
            
            <Table 
              columns={columns} 
              dataSource={batchConsolidations} 
              rowKey="id" 
              loading={adminLoading || shipLoading} 
              pagination={{ pageSize: 10 }} 
              className="custom-admin-table" 
              scroll={{ x: 800 }}
            />
          </Card>
        </div>

      </div>

      {/* Arrival in Nigeria Destination Warehouse Selection Modal */}
      <Modal
        open={arrivedModalOpen}
        title={
          <div className="flex items-center gap-2 text-[#0A1128]">
            <span className="text-2xl">🇳🇬</span>
            <span className="font-bold text-lg">Select Destination Warehouse (Nigeria)</span>
          </div>
        }
        onCancel={() => {
          setArrivedModalOpen(false);
          setPendingStatus(batch.status);
        }}
        onOk={handleConfirmArrivedNigeria}
        confirmLoading={updatingStatus}
        okText="Confirm Arrival & Update Status"
        okButtonProps={{ className: "bg-brand-orange hover:bg-[#E86E21] border-none font-bold shadow-md" }}
        width={520}
        destroyOnHidden
      >
        <div className="space-y-4 py-3 border-t border-slate-100 mt-3">
          <p className="text-xs text-slate-500 m-0 leading-relaxed">
            Select the legitimate Nigerian warehouse facility where Master Batch <strong className="text-slate-800">{batch.masterTrackingId}</strong> has physically arrived and will be received for sorting & local dispatch.
          </p>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Destination Warehouse Facility <span className="text-red-500">*</span>
            </label>
            <Select
              size="large"
              className="w-full"
              value={selectedNgWarehouse}
              onChange={setSelectedNgWarehouse}
              options={ngWarehouseOptions}
              placeholder="Select Nigerian warehouse facility..."
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Clearance Remarks / Current Location Note (Optional)
            </label>
            <Input
              size="large"
              placeholder="e.g. Cleared at MMIA Ikeja Terminal, received at Lagos Main Hub"
              value={currentLocationNote}
              onChange={(e) => setCurrentLocationNote(e.target.value)}
            />
          </div>
        </div>
      </Modal>

    </div>
  );
};
