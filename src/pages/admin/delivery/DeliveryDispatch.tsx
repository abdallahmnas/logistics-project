import React, { useEffect, useMemo, useState } from 'react';
import { Card, Table, Input, Select, Button, Modal, Form, message, Tag, Alert, Tabs, Space, InputNumber, Switch, Upload, Spin } from 'antd';
import type { UploadFile } from 'antd';
import {
  SearchOutlined,
  CarOutlined,
  UserOutlined,
  PhoneOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CloudUploadOutlined,
  SyncOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import {
  fetchDeliveries,
  assignDriver,
  updateDeliveryStatus,
  fetchAdminVehicles,
  createVehicle,
  updateVehicle,
  deleteVehicle,
} from '../../../store/slices/deliverySlice';
import { fetchAllUsers } from '../../../store/slices/adminSlice';
import { StatusBadge } from '../../../components/common/StatusBadge';
import { FileThumbnail } from '../../../components/common/FileThumbnail';
import { formatDateTime, formatDistance } from '../../../utils/formatters';
import type { LocalDelivery, DeliveryVehicle } from '../../../types/delivery.types';

const { Option } = Select;
const { TextArea } = Input;

export const DeliveryDispatch: React.FC = () => {
  const dispatch = useAppDispatch();
  const [form] = Form.useForm();
  const [statusForm] = Form.useForm();
  const [vehicleForm] = Form.useForm();

  const { deliveries, adminVehicles, loading } = useAppSelector((state) => state.delivery);
  const { users } = useAppSelector((state) => state.admin);

  const [activeTab, setActiveTab] = useState<string>('deliveries');
  const [searchText, setSearchText] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Driver assign modal
  const [activeDelivery, setActiveDelivery] = useState<LocalDelivery | null>(null);
  const [assignSubmitting, setAssignSubmitting] = useState(false);

  // Status update modal
  const [statusModalDelivery, setStatusModalDelivery] = useState<LocalDelivery | null>(null);
  const [statusSubmitting, setStatusSubmitting] = useState(false);

  // Vehicle CRUD modal
  const [vehicleModalOpen, setBankVehicleModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<DeliveryVehicle | null>(null);
  const [vehicleSubmitting, setVehicleSubmitting] = useState(false);
  const [vehicleFileList, setVehicleFileList] = useState<UploadFile[]>([]);

  useEffect(() => {
    dispatch(fetchDeliveries());
    dispatch(fetchAdminVehicles());
    dispatch(fetchAllUsers());
  }, [dispatch]);

  const registeredDriversList = useMemo(() => {
    const drivers = users.filter((u) => u.role === 'driver' || u.role === 'warehouse_ng' || u.role === 'admin');
    if (drivers.length > 0) {
      return drivers.map((u) => ({
        id: u.id,
        name: `${u.firstName} ${u.lastName}`,
        phone: u.phone || '+2348055667788',
        vehicle: u.role === 'driver' ? 'Registered Express Dispatcher' : 'Logistics Fleet Driver',
      }));
    }
    return [
      { id: 'drv-001', name: 'Chukwudi Emmanuel', phone: '+2348055667788', vehicle: 'Registered Express Motorbike' },
      { id: 'drv-002', name: 'Babatunde Raji', phone: '+2348033221100', vehicle: 'Registered Freight Sedan/Truck' },
      { id: 'drv-003', name: 'Ibrahim Musa', phone: '+2348123456789', vehicle: 'Registered Express Motorbike' },
    ];
  }, [users]);

  const filteredDeliveries = useMemo(() => {
    return deliveries.filter((d) => {
      const matchesSearch =
        d.customerName.toLowerCase().includes(searchText.toLowerCase()) ||
        d.id.toLowerCase().includes(searchText.toLowerCase()) ||
        d.dropoffAddress.toLowerCase().includes(searchText.toLowerCase());
      const matchesStatus = filterStatus === 'all' || d.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [deliveries, searchText, filterStatus]);

  // Driver Assignment
  const openAssign = (record: LocalDelivery) => {
    setActiveDelivery(record);
    form.resetFields();
    if (registeredDriversList.length > 0) {
      const first = registeredDriversList[0];
      form.setFieldsValue({
        selectedDriverId: first.id,
        driverName: first.name,
        driverPhone: first.phone,
      });
    }
  };

  const handleAssignDriver = async (values: any) => {
    if (!activeDelivery) return;
    setAssignSubmitting(true);
    try {
      const result = await dispatch(
        assignDriver({
          deliveryId: activeDelivery.id,
          driverName: values.driverName,
          driverPhone: values.driverPhone,
        })
      ).unwrap();
      message.success(`Driver assigned successfully! Verification PIN: ${result.verificationPin}`);
      setActiveDelivery(null);
      dispatch(fetchDeliveries());
    } catch (err: any) {
      message.error(err?.message || 'Failed to assign driver.');
    } finally {
      setAssignSubmitting(false);
    }
  };

  // Status Change
  const openStatusModal = (record: LocalDelivery) => {
    setStatusModalDelivery(record);
    statusForm.setFieldsValue({
      status: record.status,
      driverName: record.driverName || '',
      driverPhone: record.driverPhone || '',
      notes: '',
    });
  };

  const handleUpdateStatus = async (values: any) => {
    if (!statusModalDelivery) return;
    try {
      setStatusSubmitting(true);
      await dispatch(
        updateDeliveryStatus({
          deliveryId: statusModalDelivery.id,
          status: values.status,
          notes: values.notes,
          driverName: values.driverName,
          driverPhone: values.driverPhone,
        })
      ).unwrap();
      message.success(`Delivery status updated to ${values.status.replace(/_/g, ' ').toUpperCase()} and customer notified!`);
      setStatusModalDelivery(null);
      dispatch(fetchDeliveries());
    } catch (err: any) {
      message.error(err?.message || 'Failed to update delivery status');
    } finally {
      setStatusSubmitting(false);
    }
  };

  // Vehicle CRUD
  const openCreateVehicle = () => {
    setEditingVehicle(null);
    vehicleForm.resetFields();
    setVehicleFileList([]);
    setBankVehicleModalOpen(true);
  };

  const openEditVehicle = (v: DeliveryVehicle) => {
    setEditingVehicle(v);
    vehicleForm.setFieldsValue({
      name: v.name,
      type: v.type,
      description: v.description,
      priceLagos: v.priceLagos,
      priceKano: v.priceKano,
      priceInterstate: v.priceInterstate,
      perKmRate: v.perKmRate,
      maxWeightKg: v.maxWeightKg,
      isActive: v.isActive,
    });
    setVehicleFileList([]);
    setBankVehicleModalOpen(true);
  };

  const handleSaveVehicle = async (values: any) => {
    try {
      setVehicleSubmitting(true);
      const formData = new FormData();
      formData.append('name', values.name);
      formData.append('type', values.type || 'sedan');
      if (values.description) formData.append('description', values.description);
      formData.append('priceLagos', String(values.priceLagos));
      formData.append('priceKano', String(values.priceKano));
      formData.append('priceInterstate', String(values.priceInterstate));
      if (values.perKmRate) formData.append('perKmRate', String(values.perKmRate));
      if (values.maxWeightKg) formData.append('maxWeightKg', String(values.maxWeightKg));
      formData.append('isActive', String(values.isActive !== false));

      if (vehicleFileList.length > 0 && vehicleFileList[0].originFileObj) {
        formData.append('image', vehicleFileList[0].originFileObj as File);
      }

      if (editingVehicle) {
        await dispatch(updateVehicle({ id: editingVehicle.id, formData })).unwrap();
        message.success(`Vehicle ${values.name} updated successfully!`);
      } else {
        await dispatch(createVehicle(formData)).unwrap();
        message.success(`Vehicle ${values.name} created successfully!`);
      }

      setBankVehicleModalOpen(false);
      dispatch(fetchAdminVehicles());
    } catch (err: any) {
      message.error(err?.message || 'Failed to save vehicle');
    } finally {
      setVehicleSubmitting(false);
    }
  };

  const handleDeleteVehicle = async (id: string, name: string) => {
    Modal.confirm({
      title: `Delete Vehicle "${name}"?`,
      content: 'Are you sure you want to delete this delivery vehicle?',
      okText: 'Delete',
      okType: 'danger',
      onOk: async () => {
        try {
          await dispatch(deleteVehicle(id)).unwrap();
          message.success(`Vehicle ${name} deleted successfully!`);
          dispatch(fetchAdminVehicles());
        } catch (err: any) {
          message.error(err?.message || 'Failed to delete vehicle');
        }
      },
    });
  };

  const deliveryColumns = [
    {
      title: 'Delivery ID & Customer',
      key: 'delivery',
      render: (record: LocalDelivery) => (
        <div>
          <div className="font-extrabold text-[#0A1128]">{record.id.slice(0, 10)}</div>
          <div className="text-xs text-slate-500 font-medium">{record.customerName} ({record.customerId})</div>
        </div>
      ),
    },
    {
      title: 'Pickup ➔ Dropoff',
      key: 'route',
      render: (record: LocalDelivery) => (
        <div className="text-xs max-w-xs">
          <div className="text-slate-700 font-bold">{record.pickupCity}: {record.pickupAddress}</div>
          <div className="text-brand-orange text-[10px] font-bold">↓ To: {record.dropoffCity}</div>
          <div className="text-slate-700 font-medium">{record.dropoffAddress}</div>
        </div>
      ),
    },
    {
      title: 'Vehicle',
      dataIndex: 'vehicleType',
      key: 'vehicleType',
      render: (v: string) => <Tag color="orange" className="uppercase font-bold text-[10px]">{v || 'Sedan'}</Tag>,
    },
    {
      title: 'Fare (₦)',
      dataIndex: 'totalFee',
      key: 'totalFee',
      render: (fee: number) => <span className="font-extrabold text-sm text-brand-orange">₦{Number(fee).toLocaleString()}</span>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (s: string) => <StatusBadge module="delivery" status={s} />,
    },
    {
      title: 'Assigned Driver',
      key: 'driver',
      render: (record: LocalDelivery) =>
        record.driverName ? (
          <div className="text-xs">
            <div className="font-bold text-slate-800">{record.driverName}</div>
            <div className="text-slate-500 font-mono text-[10px]">{record.driverPhone}</div>
          </div>
        ) : (
          <span className="text-slate-400 italic text-xs">Unassigned</span>
        ),
    },
    {
      title: 'Actions',
      key: 'action',
      render: (record: LocalDelivery) => (
        <Space>
          <Button
            type="primary"
            size="small"
            icon={<SyncOutlined />}
            onClick={() => openStatusModal(record)}
            className="bg-brand-navy hover:bg-slate-800 text-white font-bold text-xs border-none"
          >
            Update Status
          </Button>
          {(record.status === 'pending' || record.status === 'confirmed') && (
            <Button
              size="small"
              icon={<CarOutlined />}
              onClick={() => openAssign(record)}
              className="bg-brand-orange text-white border-none font-bold text-xs"
            >
              Assign Driver
            </Button>
          )}
        </Space>
      ),
    },
  ];

  const vehicleColumns = [
    {
      title: 'Vehicle Info',
      key: 'info',
      render: (record: DeliveryVehicle) => (
        <div className="flex items-center gap-3">
          <FileThumbnail url={record.imageUrl} size="sm" showName={false} />
          <div>
            <div className="font-extrabold text-[#0A1128] text-sm">{record.name}</div>
            <div className="text-xs text-slate-400 font-mono uppercase">{record.type} • Max {record.maxWeightKg || 50}kg</div>
          </div>
        </div>
      ),
    },
    {
      title: 'Lagos Rate (₦)',
      dataIndex: 'priceLagos',
      key: 'priceLagos',
      render: (p: number) => <span className="font-bold text-slate-800">₦{Number(p).toLocaleString()}</span>,
    },
    {
      title: 'Kano Rate (₦)',
      dataIndex: 'priceKano',
      key: 'priceKano',
      render: (p: number) => <span className="font-bold text-slate-800">₦{Number(p).toLocaleString()}</span>,
    },
    {
      title: 'Inter-State Rate (₦)',
      dataIndex: 'priceInterstate',
      key: 'priceInterstate',
      render: (p: number) => <span className="font-extrabold text-brand-orange">₦{Number(p).toLocaleString()}</span>,
    },
    {
      title: 'Status',
      key: 'isActive',
      render: (record: DeliveryVehicle) =>
        record.isActive ? (
          <Tag color="green" icon={<CheckCircleOutlined />} className="font-bold border-none text-[10px] uppercase">
            ACTIVE
          </Tag>
        ) : (
          <Tag color="default" className="font-bold border-none text-[10px] uppercase">
            INACTIVE
          </Tag>
        ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record: DeliveryVehicle) => (
        <Space>
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => openEditVehicle(record)}
            className="font-bold text-xs"
          >
            Edit
          </Button>
          <Button
            danger
            size="small"
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteVehicle(record.id, record.name)}
            className="font-bold text-xs"
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-gradient-to-r from-[#0A1128] to-[#1C2A4E] p-6 rounded-2xl text-white shadow-md gap-4">
        <div>
          <span className="text-xs font-bold text-brand-orange uppercase tracking-wider block mb-1">
            Local Logistics & Dispatch Management
          </span>
          <h1 className="text-2xl font-black text-white m-0 flex items-center gap-2">
            <CarOutlined className="text-brand-orange" /> Doorstep Delivery & Fleet Operations
          </h1>
          <p className="text-slate-300 text-sm mt-1 mb-0 max-w-xl">
            Update delivery status in real-time, assign dispatch drivers, and manage vehicle pricing for Lagos, Kano & Inter-state.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={openCreateVehicle}
            className="bg-brand-orange hover:bg-[#E86E21] border-none font-bold text-xs h-10 px-4 rounded-xl"
          >
            Add New Dispatch Vehicle
          </Button>
        </div>
      </div>

      {/* Main Content Tabs */}
      <Card variant="borderless" className="shadow-sm border border-slate-100 rounded-2xl">
        <Tabs
          activeKey={activeTab}
          onChange={(key) => setActiveTab(key)}
          className="[&_.ant-tabs-nav]:mb-6"
          items={[
            {
              key: 'deliveries',
              label: `Doorstep Deliveries (${deliveries.length})`,
              children: (
                <div className="space-y-4">
                  <div className="flex flex-col md:flex-row gap-4 mb-4">
                    <Input
                      placeholder="Search customer, delivery ID or address..."
                      prefix={<SearchOutlined className="text-slate-400" />}
                      className="md:w-1/3 bg-slate-50 border-slate-200"
                      size="large"
                      value={searchText}
                      onChange={(e) => setSearchText(e.target.value)}
                    />
                    <Select defaultValue="all" size="large" className="md:w-56" onChange={setFilterStatus}>
                      <Option value="all">All Statuses</Option>
                      <Option value="pending">Pending</Option>
                      <Option value="confirmed">Confirmed</Option>
                      <Option value="driver_assigned">Driver Assigned</Option>
                      <Option value="in_transit">In Transit / Picked Up</Option>
                      <Option value="out_for_delivery">Out for Delivery</Option>
                      <Option value="delivered">Delivered</Option>
                      <Option value="cancelled">Cancelled</Option>
                    </Select>
                  </div>
                  <Table
                    columns={deliveryColumns}
                    dataSource={filteredDeliveries}
                    rowKey="id"
                    loading={loading}
                    pagination={{ pageSize: 10 }}
                    className="[&_.ant-table-thead_th]:!bg-slate-50 [&_.ant-table-thead_th]:!text-slate-600 [&_.ant-table-thead_th]:!text-xs [&_.ant-table-thead_th]:!font-bold [&_.ant-table-thead_th]:uppercase"
                  />
                </div>
              ),
            },
            {
              key: 'vehicles',
              label: `Fleet & Vehicle Rates (${adminVehicles.length})`,
              children: (
                <div className="space-y-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-base font-bold text-[#0A1128] m-0">Dispatch Vehicles & Regional Pricing (Lagos, Kano, Inter-state)</h3>
                    <Button type="primary" icon={<PlusOutlined />} onClick={openCreateVehicle} className="bg-brand-orange border-none font-bold text-xs">
                      Add Vehicle
                    </Button>
                  </div>
                  <Table
                    columns={vehicleColumns}
                    dataSource={adminVehicles}
                    rowKey="id"
                    pagination={{ pageSize: 10 }}
                    className="[&_.ant-table-thead_th]:!bg-slate-50 [&_.ant-table-thead_th]:!text-slate-600 [&_.ant-table-thead_th]:!text-xs [&_.ant-table-thead_th]:!font-bold [&_.ant-table-thead_th]:uppercase"
                  />
                </div>
              ),
            },
          ]}
        />
      </Card>

      {/* Driver Assignment Modal */}
      <Modal
        title={activeDelivery ? `Assign Driver — Delivery ${activeDelivery.id.slice(0, 8)}` : 'Assign Driver'}
        open={!!activeDelivery}
        onCancel={() => setActiveDelivery(null)}
        footer={null}
        destroyOnClose
      >
        <Alert
          type="info"
          showIcon
          message="Select a driver from the active fleet. A 4-digit verification PIN will be generated and sent to the customer."
          className="mb-4 mt-2"
        />
        <Form form={form} layout="vertical" onFinish={handleAssignDriver}>
          <Form.Item
            name="selectedDriverId"
            label={<span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Registered Driver Fleet <span className="text-red-500">*</span></span>}
            rules={[{ required: true, message: 'Please select a driver' }]}
          >
            <Select
              size="large"
              placeholder="Select driver..."
              onChange={(val) => {
                const driver = registeredDriversList.find((d) => d.id === val);
                if (driver) {
                  form.setFieldsValue({
                    driverName: driver.name,
                    driverPhone: driver.phone,
                  });
                }
              }}
            >
              {registeredDriversList.map((d) => (
                <Option key={d.id} value={d.id}>
                  {d.name} ({d.phone})
                </Option>
              ))}
            </Select>
          </Form.Item>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item
              name="driverName"
              label={<span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Driver Name</span>}
              rules={[{ required: true, message: 'Please enter driver name' }]}
            >
              <Input size="large" prefix={<UserOutlined className="text-slate-400" />} placeholder="Driver name" className="bg-slate-50 border-slate-200" />
            </Form.Item>

            <Form.Item
              name="driverPhone"
              label={<span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Driver Phone</span>}
              rules={[{ required: true, message: 'Please enter driver phone' }]}
            >
              <Input size="large" prefix={<PhoneOutlined className="text-slate-400" />} placeholder="Driver phone" className="bg-slate-50 border-slate-200" />
            </Form.Item>
          </div>

          <div className="flex justify-end gap-3 mt-4">
            <Button onClick={() => setActiveDelivery(null)}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={assignSubmitting} className="bg-brand-orange border-none font-bold">
              Assign Selected Driver
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Delivery Status Change Modal */}
      <Modal
        title={statusModalDelivery ? `Change Status — Delivery ${statusModalDelivery.id.slice(0, 8)}` : 'Change Status'}
        open={!!statusModalDelivery}
        onCancel={() => setStatusModalDelivery(null)}
        footer={null}
        destroyOnClose
      >
        <Form form={statusForm} layout="vertical" onFinish={handleUpdateStatus} className="pt-2">
          <Alert
            type="warning"
            showIcon
            message="Customer Real-Time Notification"
            description="Updating the delivery status will instantly trigger a real-time notification to the customer with your notes."
            className="mb-4"
          />

          <Form.Item
            name="status"
            label={<span className="text-xs font-bold text-slate-700 uppercase">New Delivery Status <span className="text-red-500">*</span></span>}
            rules={[{ required: true, message: 'Please select a status' }]}
          >
            <Select size="large" className="font-bold">
              <Option value="pending">⏳ Pending Driver Assignment</Option>
              <Option value="confirmed">✓ Order Confirmed</Option>
              <Option value="driver_assigned">🚗 Driver Assigned</Option>
              <Option value="in_transit">📦 Picked Up & In Transit</Option>
              <Option value="out_for_delivery">🛵 Out for Doorstep Delivery</Option>
              <Option value="delivered">🎉 Delivered to Recipient</Option>
              <Option value="cancelled">❌ Cancelled</Option>
            </Select>
          </Form.Item>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item name="driverName" label={<span className="text-xs font-bold text-slate-500 uppercase">Driver Name</span>}>
              <Input size="large" placeholder="e.g. Chukwudi Emmanuel" className="bg-slate-50 border-slate-200" />
            </Form.Item>
            <Form.Item name="driverPhone" label={<span className="text-xs font-bold text-slate-500 uppercase">Driver Phone</span>}>
              <Input size="large" placeholder="e.g. +2348055667788" className="bg-slate-50 border-slate-200" />
            </Form.Item>
          </div>

          <Form.Item name="notes" label={<span className="text-xs font-bold text-slate-500 uppercase">Status Note / Driver Location Update</span>}>
            <TextArea rows={2} placeholder="e.g. Driver is 10 mins away from Lekki Phase 1 dropoff location." className="bg-slate-50 border-slate-200" />
          </Form.Item>

          <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
            <Button onClick={() => setStatusModalDelivery(null)}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={statusSubmitting} className="bg-brand-orange border-none font-bold">
              Update Status & Notify Customer →
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Vehicle Add / Edit Modal */}
      <Modal
        title={editingVehicle ? `Edit Vehicle — ${editingVehicle.name}` : 'Add New Dispatch Vehicle'}
        open={vehicleModalOpen}
        onCancel={() => setBankVehicleModalOpen(false)}
        footer={null}
        width={600}
        destroyOnClose
      >
        <Form form={vehicleForm} layout="vertical" onFinish={handleSaveVehicle} className="pt-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item
              name="name"
              label={<span className="text-xs font-bold text-slate-700 uppercase">Vehicle Name <span className="text-red-500">*</span></span>}
              rules={[{ required: true, message: 'Please enter vehicle name' }]}
            >
              <Input placeholder="e.g. Express Motorbike" size="large" className="bg-slate-50 border-slate-200 font-bold" />
            </Form.Item>

            <Form.Item
              name="type"
              label={<span className="text-xs font-bold text-slate-700 uppercase">Vehicle Type</span>}
            >
              <Select size="large">
                <Option value="motorbike">🛵 Express Motorbike</Option>
                <Option value="sedan">🚗 Standard Sedan / Car</Option>
                <Option value="van">🚐 Cargo Van / Minibus</Option>
                <Option value="truck">🚚 Heavy Duty Truck / Trailer</Option>
              </Select>
            </Form.Item>
          </div>

          <Form.Item name="description" label={<span className="text-xs font-bold text-slate-500 uppercase">Vehicle Description</span>}>
            <TextArea rows={2} placeholder="e.g. Ideal for fast doorstep delivery of small cartons and documents up to 15kg." className="bg-slate-50 border-slate-200" />
          </Form.Item>

          <span className="text-[10px] font-extrabold text-brand-orange uppercase tracking-widest block mb-2">
            REGIONAL PRICING PARAMETERS (NAIRA ₦)
          </span>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Form.Item
              name="priceLagos"
              label={<span className="text-xs font-bold text-slate-700 uppercase">Lagos Rate (₦) <span className="text-red-500">*</span></span>}
              rules={[{ required: true, message: 'Enter Lagos rate' }]}
            >
              <InputNumber size="large" prefix="₦" className="w-full font-bold" placeholder="2,500" />
            </Form.Item>

            <Form.Item
              name="priceKano"
              label={<span className="text-xs font-bold text-slate-700 uppercase">Kano Rate (₦) <span className="text-red-500">*</span></span>}
              rules={[{ required: true, message: 'Enter Kano rate' }]}
            >
              <InputNumber size="large" prefix="₦" className="w-full font-bold" placeholder="2,000" />
            </Form.Item>

            <Form.Item
              name="priceInterstate"
              label={<span className="text-xs font-bold text-slate-700 uppercase">Inter-State Rate (₦) <span className="text-red-500">*</span></span>}
              rules={[{ required: true, message: 'Enter Inter-state rate' }]}
            >
              <InputNumber size="large" prefix="₦" className="w-full font-bold" placeholder="7,500" />
            </Form.Item>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item name="maxWeightKg" label={<span className="text-xs font-bold text-slate-500 uppercase">Max Weight Capacity (KG)</span>}>
              <InputNumber size="large" className="w-full" placeholder="e.g. 50" />
            </Form.Item>

            <Form.Item name="isActive" valuePropName="checked" initialValue={true} label={<span className="text-xs font-bold text-slate-500 uppercase">Active Status</span>}>
              <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
            </Form.Item>
          </div>

          <Form.Item label={<span className="text-xs font-bold text-slate-500 uppercase">Vehicle Photo / Thumbnail</span>}>
            <Upload.Dragger
              beforeUpload={() => false}
              accept="image/*"
              maxCount={1}
              fileList={vehicleFileList}
              onChange={({ fileList }) => {
                fileList.forEach((f) => { f.status = 'done'; });
                setVehicleFileList(fileList);
              }}
            >
              <p className="ant-upload-drag-icon"><CloudUploadOutlined className="text-brand-orange text-2xl" /></p>
              <p className="ant-upload-text text-xs font-bold">Click or drag vehicle photo here</p>
            </Upload.Dragger>
          </Form.Item>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <Button onClick={() => setBankVehicleModalOpen(false)}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={vehicleSubmitting} className="bg-brand-orange border-none font-bold">
              Save Vehicle →
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default DeliveryDispatch;
