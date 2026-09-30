import React, { useEffect, useState, useMemo } from 'react';
import {
  Card,
  Table,
  Button,
  Input,
  Tag,
  Modal,
  Form,
  Select,
  message,
  Drawer,
  Badge,
  Descriptions,
  Divider,
  InputNumber,
} from 'antd';
import {
  SafetyCertificateOutlined,
  SearchOutlined,
  SyncOutlined,
  FileTextOutlined,
  EyeOutlined,
  EditOutlined,
  GlobalOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  DollarCircleOutlined,
  CarOutlined,
  PlusOutlined,
  DownloadOutlined,
  ArrowRightOutlined,
} from '@ant-design/icons';
import { clearanceService } from '../../../services/clearanceService';
import type {
  ClearanceRequest,
  ClearanceStatus,
  ClearanceItem,
  ClearanceDocument,
} from '../../../types/clearance';
import { STATUS_DESCRIPTIONS } from '../../../types/clearance';
import { formatDate } from '../../../utils/formatters';

const { Option } = Select;
const { TextArea } = Input;

export const ClearanceManagement: React.FC = () => {
  const [requests, setRequests] = useState<ClearanceRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [shipmentTypeFilter, setShipmentTypeFilter] = useState('ALL');

  // Status Change Modal State
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<ClearanceRequest | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [statusForm] = Form.useForm();
  const [selectedNewStatus, setSelectedNewStatus] = useState<ClearanceStatus | null>(null);

  // Detail Drawer State
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [detailRequest, setDetailRequest] = useState<ClearanceRequest | null>(null);

  // Add Charge Modal State
  const [chargeModalOpen, setChargeModalOpen] = useState(false);
  const [addingCharge, setAddingCharge] = useState(false);
  const [chargeForm] = Form.useForm();

  const fetchClearanceRequests = async () => {
    try {
      setLoading(true);
      const data = await clearanceService.getAllAdminRequests();
      setRequests(data);
    } catch (err: any) {
      message.error(err.message || 'Failed to load customs clearance requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClearanceRequests();
  }, []);

  // Compute Telemetry Stats
  const stats = useMemo(() => {
    const total = requests.length;
    const reviewNeeded = requests.filter(
      (r) =>
        r.status === 'SUBMITTED' ||
        r.status === 'DOCUMENT_REVIEW' ||
        r.status === 'ADDITIONAL_INFORMATION_REQUIRED'
    ).length;
    const processing = requests.filter(
      (r) =>
        r.status === 'CLEARANCE_PROCESSING' ||
        r.status === 'CUSTOMS_ASSESSMENT' ||
        r.status === 'INSPECTION'
    ).length;
    const awaitingPayment = requests.filter((r) => r.status === 'AWAITING_PAYMENT').length;
    const releasedOrCompleted = requests.filter(
      (r) =>
        r.status === 'CUSTOMS_RELEASED' ||
        r.status === 'DELIVERY' ||
        r.status === 'COMPLETED'
    ).length;

    return { total, reviewNeeded, processing, awaitingPayment, releasedOrCompleted };
  }, [requests]);

  // Filtered Table Data
  const filteredData = useMemo(() => {
    return requests.filter((item) => {
      // Status filter
      if (statusFilter !== 'ALL') {
        if (statusFilter === 'REVIEW') {
          if (
            item.status !== 'SUBMITTED' &&
            item.status !== 'DOCUMENT_REVIEW' &&
            item.status !== 'ADDITIONAL_INFORMATION_REQUIRED'
          )
            return false;
        } else if (statusFilter === 'PROCESSING') {
          if (
            item.status !== 'CLEARANCE_PROCESSING' &&
            item.status !== 'CUSTOMS_ASSESSMENT' &&
            item.status !== 'INSPECTION'
          )
            return false;
        } else if (statusFilter === 'PAYMENT') {
          if (item.status !== 'AWAITING_PAYMENT') return false;
        } else if (statusFilter === 'RELEASED') {
          if (
            item.status !== 'CUSTOMS_RELEASED' &&
            item.status !== 'DELIVERY' &&
            item.status !== 'COMPLETED'
          )
            return false;
        } else if (item.status !== statusFilter) {
          return false;
        }
      }

      // Shipment type filter
      if (shipmentTypeFilter !== 'ALL') {
        if (item.shipmentType.toLowerCase() !== shipmentTypeFilter.toLowerCase()) return false;
      }

      // Search text
      if (searchText.trim()) {
        const query = searchText.toLowerCase().trim();
        const matchNumber = item.requestNumber?.toLowerCase().includes(query);
        const matchCustomer =
          item.customerName?.toLowerCase().includes(query) ||
          item.customerId?.toLowerCase().includes(query) ||
          item.customerEmail?.toLowerCase().includes(query);
        const matchCarrier =
          item.billOfLadingNumber?.toLowerCase().includes(query) ||
          item.airWaybillNumber?.toLowerCase().includes(query) ||
          item.containerNumber?.toLowerCase().includes(query) ||
          item.shippingLine?.toLowerCase().includes(query) ||
          item.airline?.toLowerCase().includes(query);
        const matchPort = item.portOfEntry?.toLowerCase().includes(query);

        if (!matchNumber && !matchCustomer && !matchCarrier && !matchPort) {
          return false;
        }
      }

      return true;
    });
  }, [requests, statusFilter, shipmentTypeFilter, searchText]);

  // Open Status Modification Modal
  const handleOpenStatusModal = (record: ClearanceRequest) => {
    setSelectedRequest(record);
    setSelectedNewStatus(record.status);
    statusForm.setFieldsValue({
      status: record.status,
      note: '',
      requiredActionNote: record.requiredActionNote || '',
    });
    setStatusModalOpen(true);
  };

  // Submit Status Change
  const handleUpdateStatus = async (values: any) => {
    if (!selectedRequest) return;
    try {
      setUpdatingStatus(true);
      const updated = await clearanceService.updateStatus(
        selectedRequest.id,
        values.status,
        values.note,
        values.requiredActionNote
      );

      message.success(`Status for ${selectedRequest.requestNumber} updated to ${values.status}`);
      setStatusModalOpen(false);
      setSelectedRequest(null);
      statusForm.resetFields();

      // Update state immediately
      setRequests((prev) =>
        prev.map((r) => (r.id === updated.id || r.requestNumber === updated.requestNumber ? updated : r))
      );

      if (detailRequest && detailRequest.id === selectedRequest.id) {
        setDetailRequest(updated);
      }
    } catch (err: any) {
      message.error(err.message || 'Failed to update clearance status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Handle Add Charge
  const handleAddCharge = async (values: any) => {
    if (!detailRequest) return;
    try {
      setAddingCharge(true);
      await clearanceService.addCharge(detailRequest.id, values);
      message.success('Customs assessment charge added successfully.');
      setChargeModalOpen(false);
      chargeForm.resetFields();

      // Refresh single request
      const updated = await clearanceService.getRequestById(detailRequest.id);
      setDetailRequest(updated);
      setRequests((prev) =>
        prev.map((r) => (r.id === updated.id || r.requestNumber === updated.requestNumber ? updated : r))
      );
    } catch (err: any) {
      message.error(err.message || 'Failed to add charge');
    } finally {
      setAddingCharge(false);
    }
  };

  // Open Detail Drawer
  const handleViewDetails = (record: ClearanceRequest) => {
    setDetailRequest(record);
    setDrawerOpen(true);
  };

  const getStatusBadge = (status: ClearanceStatus) => {
    const desc = STATUS_DESCRIPTIONS[status] || {
      label: status,
      badgeColor: 'bg-slate-100 text-slate-800 border-slate-300',
    };
    return (
      <span
        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${desc.badgeColor}`}
      >
        {desc.label}
      </span>
    );
  };

  const getShipmentTypeTag = (type: string) => {
    const t = (type || 'Sea').toLowerCase();
    if (t === 'air') return <Tag color="blue" className="font-bold uppercase text-[10px]">✈ Air Cargo</Tag>;
    if (t === 'sea') return <Tag color="cyan" className="font-bold uppercase text-[10px]">🚢 Sea Freight</Tag>;
    return <Tag color="orange" className="font-bold uppercase text-[10px]">🚛 Land Cross-border</Tag>;
  };

  const tableColumns = [
    {
      title: 'REQUEST NUMBER',
      key: 'requestNumber',
      render: (record: ClearanceRequest) => (
        <div>
          <div className="font-bold text-[#0A1128] text-xs flex items-center gap-1.5">
            <SafetyCertificateOutlined className="text-brand-orange" />
            <button
              onClick={() => handleViewDetails(record)}
              className="text-[#0A1128] font-extrabold hover:text-brand-orange hover:underline text-left cursor-pointer"
            >
              {record.requestNumber}
            </button>
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            {formatDate(record.createdAt)}
          </div>
        </div>
      ),
    },
    {
      title: 'CUSTOMER',
      key: 'customer',
      render: (record: ClearanceRequest) => (
        <div>
          <div className="font-bold text-slate-800 text-xs">
            {record.customerName || 'Customer'}
          </div>
          <div className="text-[10px] text-slate-400">{record.customerId}</div>
          {record.customerPhone && (
            <div className="text-[10px] text-slate-500">{record.customerPhone}</div>
          )}
        </div>
      ),
    },
    {
      title: 'SHIPMENT & ROUTE',
      key: 'route',
      render: (record: ClearanceRequest) => (
        <div className="space-y-1">
          <div>{getShipmentTypeTag(record.shipmentType)}</div>
          <div className="text-xs font-medium text-slate-700">
            {record.originCountry} <ArrowRightOutlined className="text-[10px] text-slate-400 mx-0.5" />{' '}
            <span className="font-bold text-slate-900">{record.portOfEntry}</span>
          </div>
          <div className="text-[10px] text-slate-500">
            {record.billOfLadingNumber && `B/L: ${record.billOfLadingNumber}`}
            {record.airWaybillNumber && `AWB: ${record.airWaybillNumber}`}
            {record.containerNumber && ` | Cont: ${record.containerNumber}`}
            {record.hasMissingShipmentInfo && (
              <span className="text-amber-600 font-semibold ml-1">[No Tracking #s]</span>
            )}
          </div>
        </div>
      ),
    },
    {
      title: 'CARGO ITEMS & VALUE',
      key: 'cargo',
      render: (record: ClearanceRequest) => (
        <div>
          <div className="text-xs font-bold text-slate-800">
            {record.items?.length || record.totalProductsCount || 0} product line(s)
          </div>
          <div className="text-xs font-extrabold text-emerald-600 mt-0.5">
            Est. Total: ${Number(record.totalValueUsd || 0).toLocaleString()} USD
          </div>
          <div className="text-[10px] text-slate-400">
            {record.documents?.filter((d) => d.status === 'Uploaded' || !d.isNotAvailable).length || 0}{' '}
            doc(s) attached
          </div>
        </div>
      ),
    },
    {
      title: 'DELIVERY',
      key: 'delivery',
      render: (record: ClearanceRequest) => {
        const isSelf =
          record.deliveryPreference === "I'll arrange pickup/delivery myself" ||
          record.deliveryPreference === 'self_pickup';
        return (
          <div>
            <Tag color={isSelf ? 'purple' : 'geekblue'} className="text-[10px] font-bold">
              {isSelf ? 'Self Pickup' : 'Deliver to Me'}
            </Tag>
            {!isSelf && record.deliveryAddress && typeof record.deliveryAddress === 'object' && (
              <div className="text-[10px] text-slate-500 mt-0.5 truncate max-w-[140px]">
                {record.deliveryAddress.city || ''}, {record.deliveryAddress.state || ''}
              </div>
            )}
          </div>
        );
      },
    },
    {
      title: 'STATUS',
      key: 'status',
      render: (record: ClearanceRequest) => getStatusBadge(record.status),
    },
    {
      title: 'ACTIONS',
      key: 'actions',
      render: (record: ClearanceRequest) => (
        <div className="flex items-center gap-2">
          <Button
            type="primary"
            size="small"
            icon={<EditOutlined />}
            className="!bg-[#0A1128] hover:!bg-slate-800 font-bold text-xs"
            onClick={() => handleOpenStatusModal(record)}
          >
            Modify Status
          </Button>
          <Button
            size="small"
            icon={<EyeOutlined />}
            className="font-bold text-xs"
            onClick={() => handleViewDetails(record)}
          >
            Inspect
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 pb-20 animate-fade-in-up max-w-[1400px] mx-auto">
      {/* Top Banner Header */}
      <div className="bg-[#0A1128] text-white p-8 rounded-2xl shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-2 text-brand-orange text-xs font-bold tracking-widest uppercase mb-2">
            <SafetyCertificateOutlined /> CUSTOMS CLEARANCE & BORDER COMPLIANCE DESK
          </div>
          <h1 className="text-3xl font-extrabold text-white m-0">
            Customs Clearance Operations
          </h1>
          <p className="text-slate-300 text-sm mt-1 mb-0 max-w-2xl leading-relaxed">
            Manage Sea, Air, and Land customs declarations, inspect customer invoices, Form M, and PAAR documents, update declaration processing stages, and issue customs duty assessments.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            type="primary"
            icon={<SyncOutlined spin={loading} />}
            size="large"
            className="!bg-brand-orange hover:!bg-orange-600 border-none font-bold px-6 shadow-md"
            onClick={fetchClearanceRequests}
          >
            Refresh Telemetry
          </Button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="rounded-2xl border-none shadow-sm">
          <div className="flex justify-between items-start mb-3">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Total Declarations
            </span>
            <GlobalOutlined className="text-slate-400 text-lg" />
          </div>
          <h2 className="text-3xl font-extrabold text-[#0A1128] mb-0">{stats.total}</h2>
          <span className="text-[10px] text-slate-400">All clearance records</span>
        </Card>

        <Card className="rounded-2xl border-none shadow-sm">
          <div className="flex justify-between items-start mb-3">
            <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">
              Document Review
            </span>
            <FileTextOutlined className="text-indigo-500 text-lg" />
          </div>
          <h2 className="text-3xl font-extrabold text-indigo-700 mb-0">{stats.reviewNeeded}</h2>
          <span className="text-[10px] text-slate-400">Submitted & pending files</span>
        </Card>

        <Card className="rounded-2xl border-none shadow-sm">
          <div className="flex justify-between items-start mb-3">
            <span className="text-[10px] font-bold text-cyan-600 uppercase tracking-wider">
              Customs Assessment
            </span>
            <ClockCircleOutlined className="text-cyan-500 text-lg" />
          </div>
          <h2 className="text-3xl font-extrabold text-cyan-700 mb-0">{stats.processing}</h2>
          <span className="text-[10px] text-slate-400">Under valuation / inspection</span>
        </Card>

        <Card className="rounded-2xl border-none shadow-sm">
          <div className="flex justify-between items-start mb-3">
            <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">
              Duty Payment Pending
            </span>
            <DollarCircleOutlined className="text-amber-500 text-lg" />
          </div>
          <h2 className="text-3xl font-extrabold text-amber-600 mb-0">
            {stats.awaitingPayment}
          </h2>
          <span className="text-[10px] text-slate-400">Awaiting client payment</span>
        </Card>

        <Card className="rounded-2xl border-none shadow-sm">
          <div className="flex justify-between items-start mb-3">
            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">
              Customs Released
            </span>
            <CheckCircleOutlined className="text-emerald-500 text-lg" />
          </div>
          <h2 className="text-3xl font-extrabold text-emerald-600 mb-0">
            {stats.releasedOrCompleted}
          </h2>
          <span className="text-[10px] text-slate-400">Out of terminal gate</span>
        </Card>
      </div>

      {/* Main Table Card with Search & Filters */}
      <Card className="rounded-2xl border-none shadow-sm p-0 overflow-hidden">
        {/* Filter Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col lg:flex-row items-center justify-between gap-4 bg-white">
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <Input
              placeholder="Search Request #, Customer, B/L, AWB, Port..."
              prefix={<SearchOutlined className="text-slate-400 mr-1" />}
              className="w-full sm:w-80 !h-10 !bg-slate-50 !border-slate-200"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
            />

            <Select
              value={shipmentTypeFilter}
              onChange={setShipmentTypeFilter}
              className="w-36 !h-10"
            >
              <Option value="ALL">All Modes</Option>
              <Option value="Sea">Sea Freight</Option>
              <Option value="Air">Air Cargo</Option>
              <Option value="Land">Land Border</Option>
            </Select>
          </div>

          {/* Status Tab Pills */}
          <div className="flex flex-wrap items-center gap-1.5 w-full lg:w-auto overflow-x-auto pb-1">
            {[
              { key: 'ALL', label: 'All Requests' },
              { key: 'REVIEW', label: 'Need Review' },
              { key: 'PROCESSING', label: 'Processing' },
              { key: 'PAYMENT', label: 'Payment Due' },
              { key: 'RELEASED', label: 'Released / Completed' },
              { key: 'ON_HOLD', label: 'On Hold' },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setStatusFilter(tab.key)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  statusFilter === tab.key
                    ? 'bg-[#0A1128] text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Data Table */}
        <Table
          dataSource={filteredData}
          columns={tableColumns}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10, showSizeChanger: true }}
          className="custom-admin-table"
        />
      </Card>

      {/* ========================================================================= */}
      {/* 1. STATUS MODIFICATION MODAL */}
      {/* ========================================================================= */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-[#0A1128] font-bold text-lg">
            <EditOutlined className="text-brand-orange" />
            Update Customs Clearance Status
          </div>
        }
        open={statusModalOpen}
        onCancel={() => setStatusModalOpen(false)}
        footer={null}
        destroyOnHidden
        width={560}
      >
        {selectedRequest && (
          <Form
            form={statusForm}
            layout="vertical"
            onFinish={handleUpdateStatus}
            requiredMark={false}
            className="mt-4"
          >
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-4">
              <div className="flex justify-between items-center mb-1">
                <span className="font-extrabold text-[#0A1128] text-sm">
                  {selectedRequest.requestNumber}
                </span>
                {getStatusBadge(selectedRequest.status)}
              </div>
              <div className="text-xs text-slate-500">
                Customer: <strong>{selectedRequest.customerName}</strong> ({selectedRequest.customerId})
              </div>
              <div className="text-xs text-slate-500">
                Route: {selectedRequest.originCountry} ➔ {selectedRequest.portOfEntry} (
                {selectedRequest.shipmentType})
              </div>
            </div>

            <Form.Item
              name="status"
              label={<span className="font-bold text-slate-800">Select New Status</span>}
              rules={[{ required: true, message: 'Please select new clearance status' }]}
            >
              <Select
                size="large"
                onChange={(val) => setSelectedNewStatus(val)}
                className="w-full"
              >
                <Option value="SUBMITTED">SUBMITTED — Request Received</Option>
                <Option value="DOCUMENT_REVIEW">DOCUMENT_REVIEW — Reviewing Shipping Documents</Option>
                <Option value="ADDITIONAL_INFORMATION_REQUIRED">
                  ADDITIONAL_INFORMATION_REQUIRED — Action Required by Customer
                </Option>
                <Option value="CLEARANCE_PROCESSING">
                  CLEARANCE_PROCESSING — Active Customs Processing
                </Option>
                <Option value="CUSTOMS_ASSESSMENT">
                  CUSTOMS_ASSESSMENT — Valuation & Duty Assessment
                </Option>
                <Option value="INSPECTION">INSPECTION — Physical Terminal Examination</Option>
                <Option value="AWAITING_PAYMENT">
                  AWAITING_PAYMENT — Duty & Clearance Fee Payment Required
                </Option>
                <Option value="CUSTOMS_RELEASED">CUSTOMS_RELEASED — Released by Customs Authority</Option>
                <Option value="DELIVERY">DELIVERY — Local Dispatch / Doorstep Delivery</Option>
                <Option value="COMPLETED">COMPLETED — Clearance & Delivery Finalized</Option>
                <Option value="ON_HOLD">ON_HOLD — Temporarily Paused</Option>
                <Option value="CANCELLED">CANCELLED — Declaration Cancelled</Option>
              </Select>
            </Form.Item>

            {/* Note required for customer action */}
            {(selectedNewStatus === 'ADDITIONAL_INFORMATION_REQUIRED' ||
              selectedNewStatus === 'ON_HOLD') && (
              <Form.Item
                name="requiredActionNote"
                label={
                  <span className="font-bold text-amber-800 flex items-center gap-1">
                    <ExclamationCircleOutlined /> Action Note for Customer (Required)
                  </span>
                }
                rules={[{ required: true, message: 'Please explain what action is needed' }]}
              >
                <TextArea
                  rows={3}
                  placeholder="e.g. Please upload the original Bill of Lading and valid Form M to proceed with customs clearance."
                  className="border-amber-300 bg-amber-50/50"
                />
              </Form.Item>
            )}

            <Form.Item
              name="note"
              label={<span className="font-bold text-slate-800">Operational Log Note / Message</span>}
            >
              <TextArea
                rows={3}
                placeholder="Internal or customer status update note (will be recorded in audit history and chat thread)..."
              />
            </Form.Item>

            <div className="flex justify-end gap-3 mt-6">
              <Button onClick={() => setStatusModalOpen(false)}>Cancel</Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={updatingStatus}
                className="!bg-[#0A1128] hover:!bg-slate-800 font-bold px-6"
              >
                Confirm Status Modification
              </Button>
            </div>
          </Form>
        )}
      </Modal>

      {/* ========================================================================= */}
      {/* 2. DETAILED INSPECTION DRAWER */}
      {/* ========================================================================= */}
      <Drawer
        title={
          <div className="flex items-center justify-between w-full pr-6">
            <div className="flex items-center gap-2">
              <SafetyCertificateOutlined className="text-brand-orange" />
              <span className="font-extrabold text-base text-[#0A1128]">
                Clearance File: {detailRequest?.requestNumber}
              </span>
            </div>
            {detailRequest && getStatusBadge(detailRequest.status)}
          </div>
        }
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        width={780}
      >
        {detailRequest && (
          <div className="space-y-6 pb-12">
            {/* Quick Action Bar in Drawer */}
            <div className="flex items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="text-xs text-slate-600">
                Created: <strong>{formatDate(detailRequest.createdAt)}</strong>
              </div>
              <div className="flex gap-2">
                <Button
                  type="primary"
                  size="small"
                  icon={<EditOutlined />}
                  className="!bg-[#0A1128] font-bold text-xs"
                  onClick={() => handleOpenStatusModal(detailRequest)}
                >
                  Change Status
                </Button>
                <Button
                  size="small"
                  icon={<PlusOutlined />}
                  className="font-bold text-xs"
                  onClick={() => setChargeModalOpen(true)}
                >
                  + Add Duty Charge
                </Button>
              </div>
            </div>

            {/* Shipment Route Details */}
            <Card
              title={<span className="font-bold text-xs uppercase tracking-wider text-slate-700">Shipment & Carrier Info</span>}
              size="small"
              className="rounded-xl border-slate-200"
            >
              <Descriptions column={2} size="small">
                <Descriptions.Item label="Shipment Mode">{getShipmentTypeTag(detailRequest.shipmentType)}</Descriptions.Item>
                <Descriptions.Item label="Country of Origin">{detailRequest.originCountry}</Descriptions.Item>
                <Descriptions.Item label="Port of Entry">{detailRequest.portOfEntry}</Descriptions.Item>
                <Descriptions.Item label="Shipment Status">{detailRequest.shipmentStatus}</Descriptions.Item>
                <Descriptions.Item label="Shipping Line / Airline">
                  {detailRequest.shippingLine || detailRequest.airline || 'N/A'}
                </Descriptions.Item>
                <Descriptions.Item label="Bill of Lading / AWB #">
                  {detailRequest.billOfLadingNumber || detailRequest.airWaybillNumber || 'None provided'}
                </Descriptions.Item>
                <Descriptions.Item label="Container #">{detailRequest.containerNumber || 'None'}</Descriptions.Item>
                <Descriptions.Item label="Estimated Arrival (ETA)">
                  {detailRequest.estimatedArrivalDate ? formatDate(detailRequest.estimatedArrivalDate) : 'Not specified'}
                </Descriptions.Item>
              </Descriptions>
            </Card>

            {/* Goods Items List */}
            <Card
              title={
                <div className="flex justify-between items-center">
                  <span className="font-bold text-xs uppercase tracking-wider text-slate-700">
                    Imported Goods & Products ({detailRequest.items?.length || 0})
                  </span>
                  <span className="text-xs font-bold text-emerald-600">
                    Total Value: ${Number(detailRequest.totalValueUsd || 0).toLocaleString()} USD
                  </span>
                </div>
              }
              size="small"
              className="rounded-xl border-slate-200"
            >
              <Table
                dataSource={detailRequest.items || []}
                rowKey={(it) => it.id || it.productName}
                pagination={false}
                size="small"
                columns={[
                  {
                    title: 'PRODUCT / DESCRIPTION',
                    key: 'prod',
                    render: (it: ClearanceItem) => (
                      <div>
                        <div className="font-bold text-slate-900 text-xs">{it.productName}</div>
                        {it.description && <div className="text-[10px] text-slate-400">{it.description}</div>}
                        <div className="text-[10px] text-slate-500">
                          Cat: {it.category || 'General'} {it.hsCode && `| HS: ${it.hsCode}`}
                        </div>
                      </div>
                    ),
                  },
                  {
                    title: 'QTY / UNIT',
                    key: 'qty',
                    render: (it: ClearanceItem) => (
                      <span className="text-xs font-bold text-slate-800">
                        {it.quantity} {it.unit}
                      </span>
                    ),
                  },
                  {
                    title: 'PURCHASE VALUE',
                    key: 'val',
                    render: (it: ClearanceItem) => (
                      <div className="text-xs">
                        <span className="font-bold text-slate-800">
                          ${it.purchaseValue ?? it.value} {it.currency || 'USD'}
                        </span>
                        <div className="text-[10px] text-slate-400">
                          Total: ${(Number(it.purchaseValue ?? it.value ?? 0) * (it.quantity || 1)).toLocaleString()}
                        </div>
                      </div>
                    ),
                  },
                  {
                    title: 'WEIGHT / VOL',
                    key: 'metrics',
                    render: (it: ClearanceItem) => (
                      <span className="text-[10px] text-slate-500">
                        {it.weight ? `${it.weight} kg` : '-'} / {it.volume ? `${it.volume} CBM` : '-'}
                      </span>
                    ),
                  },
                ]}
              />
            </Card>

            {/* Documents List */}
            <Card
              title={<span className="font-bold text-xs uppercase tracking-wider text-slate-700">Required Documents & Uploads</span>}
              size="small"
              className="rounded-xl border-slate-200"
            >
              <div className="space-y-2">
                {detailRequest.documents && detailRequest.documents.length > 0 ? (
                  detailRequest.documents.map((doc: ClearanceDocument, idx) => (
                    <div
                      key={doc.id || idx}
                      className="flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-slate-50 text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <FileTextOutlined className="text-brand-orange text-base" />
                        <div>
                          <div className="font-bold text-slate-800">{doc.documentType}</div>
                          <div className="text-[10px] text-slate-400">
                            {doc.fileName || (doc.isNotAvailable ? 'Not available' : 'No filename')}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {doc.isNotAvailable ? (
                          <Tag color="default" className="text-[10px] font-bold">Not Available</Tag>
                        ) : (
                          <Tag color="green" className="text-[10px] font-bold">Uploaded</Tag>
                        )}
                        {doc.fileUrl && (
                          <a
                            href={doc.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-brand-orange hover:underline font-bold text-xs flex items-center gap-1"
                          >
                            <DownloadOutlined /> View
                          </a>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-xs text-slate-400">
                    No documents uploaded yet.
                  </div>
                )}
              </div>
            </Card>

            {/* Delivery Destination */}
            <Card
              title={<span className="font-bold text-xs uppercase tracking-wider text-slate-700">Delivery Instructions</span>}
              size="small"
              className="rounded-xl border-slate-200"
            >
              {detailRequest.deliveryPreference === "I'll arrange pickup/delivery myself" ||
              detailRequest.deliveryPreference === 'self_pickup' ? (
                <div className="text-xs text-slate-600">
                  <Tag color="purple" className="font-bold">SELF PICKUP</Tag>
                  Customer will arrange self-collection from port/airport gate upon customs release.
                </div>
              ) : (
                <div className="text-xs space-y-1 text-slate-700">
                  <div>
                    <strong>Recipient:</strong>{' '}
                    {typeof detailRequest.deliveryAddress === 'object' && detailRequest.deliveryAddress
                      ? detailRequest.deliveryAddress.fullName || detailRequest.recipientName
                      : detailRequest.recipientName || detailRequest.customerName}
                  </div>
                  <div>
                    <strong>Phone:</strong>{' '}
                    {typeof detailRequest.deliveryAddress === 'object' && detailRequest.deliveryAddress
                      ? detailRequest.deliveryAddress.phone || detailRequest.recipientPhone
                      : detailRequest.recipientPhone || detailRequest.customerPhone}
                  </div>
                  <div>
                    <strong>Address:</strong>{' '}
                    {typeof detailRequest.deliveryAddress === 'object' && detailRequest.deliveryAddress
                      ? `${detailRequest.deliveryAddress.address || ''}, ${detailRequest.deliveryAddress.city || ''}, ${detailRequest.deliveryAddress.state || ''}`
                      : detailRequest.deliveryAddress || 'Standard doorstep delivery'}
                  </div>
                  {typeof detailRequest.deliveryAddress === 'object' &&
                    detailRequest.deliveryAddress?.instructions && (
                      <div className="text-amber-800 bg-amber-50 p-2 rounded mt-2">
                        <strong>Special Instructions:</strong> {detailRequest.deliveryAddress.instructions}
                      </div>
                    )}
                </div>
              )}
            </Card>

            {/* Duty & Assessment Charges */}
            <Card
              title={
                <div className="flex justify-between items-center">
                  <span className="font-bold text-xs uppercase tracking-wider text-slate-700">
                    Customs Duty & Clearance Charges
                  </span>
                  <Button
                    size="small"
                    icon={<PlusOutlined />}
                    className="font-bold text-xs"
                    onClick={() => setChargeModalOpen(true)}
                  >
                    + Add Charge
                  </Button>
                </div>
              }
              size="small"
              className="rounded-xl border-slate-200"
            >
              <div className="space-y-2">
                {detailRequest.charges && detailRequest.charges.length > 0 ? (
                  detailRequest.charges.map((ch, idx) => (
                    <div
                      key={ch.id || idx}
                      className="flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-white text-xs"
                    >
                      <div>
                        <div className="font-bold text-slate-800">{ch.description}</div>
                        <div className="text-[10px] text-slate-400 capitalize">{ch.category?.replace('_', ' ')}</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-extrabold text-sm text-[#0A1128]">
                          ₦{Number(ch.amount).toLocaleString()} {ch.currency}
                        </span>
                        <Tag color={ch.status === 'paid' ? 'green' : 'gold'} className="font-bold text-[10px] uppercase">
                          {ch.status}
                        </Tag>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-xs text-slate-400">
                    No charges created yet. Click "+ Add Charge" to issue customs assessment fees.
                  </div>
                )}
              </div>
            </Card>

            {/* Status Audit History Timeline */}
            <Card
              title={<span className="font-bold text-xs uppercase tracking-wider text-slate-700">Audit Status History</span>}
              size="small"
              className="rounded-xl border-slate-200"
            >
              <div className="space-y-3">
                {(detailRequest.history || detailRequest.statusHistory || []).map((h, i) => (
                  <div key={h.id || i} className="flex items-start gap-3 text-xs border-b border-slate-50 pb-2">
                    <div className="w-2 h-2 rounded-full bg-brand-orange mt-1.5 shrink-0" />
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-slate-800">{h.status}</span>
                        <span className="text-[10px] text-slate-400">{h.createdAt ? formatDate(h.createdAt) : ''}</span>
                      </div>
                      <p className="m-0 text-slate-600 text-xs mt-0.5">{h.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}
      </Drawer>

      {/* ========================================================================= */}
      {/* 3. ADD ASSESSMENT CHARGE MODAL */}
      {/* ========================================================================= */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-[#0A1128] font-bold text-lg">
            <DollarCircleOutlined className="text-brand-orange" />
            Issue Customs Duty or Clearance Fee
          </div>
        }
        open={chargeModalOpen}
        onCancel={() => setChargeModalOpen(false)}
        footer={null}
        destroyOnHidden
      >
        <Form
          form={chargeForm}
          layout="vertical"
          onFinish={handleAddCharge}
          requiredMark={false}
          className="mt-4"
          initialValues={{ category: 'customs_duty', currency: 'NGN' }}
        >
          <Form.Item
            name="category"
            label={<span className="font-bold text-slate-800">Charge Category</span>}
            rules={[{ required: true }]}
          >
            <Select size="large">
              <Option value="customs_duty">Customs Duty & Tariffs</Option>
              <Option value="service_fee">Clearance Agency & Documentation Fee</Option>
              <Option value="terminal_handling">Terminal & Demurrage Charges</Option>
              <Option value="delivery_fee">Local Delivery / Haulage Fee</Option>
              <Option value="other">Other Surcharge</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="description"
            label={<span className="font-bold text-slate-800">Fee Description</span>}
            rules={[{ required: true, message: 'Please enter charge description' }]}
          >
            <Input placeholder="e.g. Official Nigerian Customs Assessment Duty (PAAR #89102)" size="large" />
          </Form.Item>

          <Form.Item
            name="amount"
            label={<span className="font-bold text-slate-800">Amount (NGN)</span>}
            rules={[{ required: true, message: 'Please enter fee amount' }]}
          >
            <InputNumber
              min={100}
              step={1000}
              className="w-full"
              size="large"
              placeholder="50000"
              formatter={(val) => `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            />
          </Form.Item>

          <div className="flex justify-end gap-3 mt-6">
            <Button onClick={() => setChargeModalOpen(false)}>Cancel</Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={addingCharge}
              className="!bg-[#0A1128] font-bold px-6"
            >
              Add Fee to Declaration
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default ClearanceManagement;
