import React, { useEffect, useMemo, useState } from 'react';
import { Card, Table, Input, Select, Button, Modal, Form, message, Tag, Alert } from 'antd';
import { SearchOutlined, CarOutlined, UserOutlined, PhoneOutlined } from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { fetchDeliveries, assignDriver } from '../../../store/slices/deliverySlice';
import { fetchAllUsers } from '../../../store/slices/adminSlice';
import { StatusBadge } from '../../../components/common/StatusBadge';
import { formatDateTime, formatDistance } from '../../../utils/formatters';
import type { LocalDelivery } from '../../../types/delivery.types';

const { Option } = Select;

interface AssignFormValues {
  selectedDriverId?: string;
  driverName: string;
  driverPhone: string;
}

export const DeliveryDispatch: React.FC = () => {
  const [form] = Form.useForm<AssignFormValues>();
  const dispatch = useAppDispatch();
  const { deliveries, loading } = useAppSelector((state) => state.delivery);
  const { users } = useAppSelector((state) => state.admin);
  const [searchText, setSearchText] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [activeDelivery, setActiveDelivery] = useState<LocalDelivery | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    dispatch(fetchDeliveries());
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
      { id: 'drv-004', name: 'Sunday Okon', phone: '+2347098765432', vehicle: 'Registered Heavy Dispatch Van' },
    ];
  }, [users]);

  const filtered = useMemo(() => {
    return deliveries.filter((d) => {
      const matchesSearch =
        d.customerName.toLowerCase().includes(searchText.toLowerCase()) ||
        d.id.toLowerCase().includes(searchText.toLowerCase()) ||
        d.dropoffAddress.toLowerCase().includes(searchText.toLowerCase());
      const matchesStatus = filterStatus === 'all' || d.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [deliveries, searchText, filterStatus]);

  const openAssign = (record: LocalDelivery) => {
    setActiveDelivery(record);
    form.resetFields();
    // Default select first driver if available
    if (registeredDriversList.length > 0) {
      const first = registeredDriversList[0];
      form.setFieldsValue({
        selectedDriverId: first.id,
        driverName: first.name,
        driverPhone: first.phone,
      });
    }
  };

  const onFinish = async (values: AssignFormValues) => {
    if (!activeDelivery) return;
    setSubmitting(true);
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
      const errorMsg = typeof err === 'string' ? err : err?.message || 'Failed to assign driver.';
      message.error(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    {
      title: 'Delivery',
      key: 'delivery',
      render: (record: LocalDelivery) => (
        <div>
          <div className="font-bold text-brand-navy">{record.id}</div>
          <div className="text-xs text-slate-500">{record.customerName}</div>
        </div>
      ),
    },
    {
      title: 'Pickup → Dropoff',
      key: 'route',
      render: (record: LocalDelivery) => (
        <div className="text-xs max-w-xs">
          <div className="text-slate-700 font-medium">{record.pickupCity}: {record.pickupAddress}</div>
          <div className="text-slate-400 my-0.5 font-bold">↓ {formatDistance(record.distanceKm)}</div>
          <div className="text-slate-700 font-medium">{record.dropoffCity}: {record.dropoffAddress}</div>
        </div>
      ),
    },
    {
      title: 'Vehicle',
      dataIndex: 'vehicleType',
      key: 'vehicleType',
      render: (v: string) => <Tag className="uppercase font-bold">{v ? v.replace('_', ' ') : 'Sedan'}</Tag>,
    },
    { title: 'Status', dataIndex: 'status', key: 'status', render: (s: string) => <StatusBadge module="delivery" status={s} /> },
    {
      title: 'Driver',
      key: 'driver',
      render: (record: LocalDelivery) =>
        record.driverName ? (
          <div className="text-xs">
            <div className="font-bold text-slate-800">{record.driverName}</div>
            <div className="text-slate-500 font-mono">{record.driverPhone}</div>
          </div>
        ) : (
          <span className="text-slate-400 italic text-xs">Unassigned</span>
        ),
    },
    { title: 'Requested', dataIndex: 'requestedAt', key: 'requestedAt', render: (d: string) => formatDateTime(d) },
    {
      title: 'Action',
      key: 'action',
      render: (record: LocalDelivery) =>
        record.status === 'pending' || record.status === 'confirmed' ? (
          <Button
            type="primary"
            size="small"
            icon={<CarOutlined />}
            className="bg-brand-navy text-white font-bold border-none hover:bg-slate-800"
            onClick={() => openAssign(record)}
          >
            Assign Driver
          </Button>
        ) : (
          <span className="text-slate-400 text-xs">—</span>
        ),
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 m-0">Local Delivery Dispatch</h1>
        <p className="text-slate-500 mt-1 mb-0 text-sm">Assign drivers to confirmed local doorstep delivery requests</p>
      </div>

      <Card bordered={false} className="shadow-sm rounded-2xl">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <Input
            placeholder="Search customer, ID or address..."
            prefix={<SearchOutlined className="text-slate-400" />}
            className="md:w-1/3"
            size="large"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
          <Select defaultValue="all" size="large" className="md:w-56" onChange={setFilterStatus}>
            <Option value="all">All Statuses</Option>
            <Option value="pending">Pending</Option>
            <Option value="confirmed">Confirmed</Option>
            <Option value="driver_assigned">Driver Assigned</Option>
            <Option value="out_for_pickup">Out for Pickup</Option>
            <Option value="in_transit">In Transit</Option>
            <Option value="delivered">Delivered</Option>
            <Option value="cancelled">Cancelled</Option>
            <Option value="failed">Failed</Option>
          </Select>
        </div>
        <Table columns={columns} dataSource={filtered} rowKey="id" loading={loading} scroll={{ x: 1100 }} pagination={{ pageSize: 10 }} className="custom-admin-table" />
      </Card>

      <Modal
        title={activeDelivery ? `Assign Driver — Request ${activeDelivery.id}` : 'Assign Driver'}
        open={!!activeDelivery}
        onCancel={() => setActiveDelivery(null)}
        footer={null}
        destroyOnClose
      >
        <Alert
          type="info"
          showIcon
          message="Select a registered driver from the active fleet. A 4-digit verification PIN will be generated for delivery verification."
          className="mb-4 mt-2"
        />
        <Form form={form} layout="vertical" onFinish={onFinish} requiredMark={false}>
          <Form.Item
            name="selectedDriverId"
            label={<span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Registered Driver Fleet <span className="text-red-500">*</span></span>}
            rules={[{ required: true, message: 'Please select a registered driver' }]}
          >
            <Select
              size="large"
              placeholder="Select registered driver from fleet..."
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
                  <div className="flex justify-between items-center py-0.5">
                    <span className="font-bold text-slate-800">{d.name}</span>
                    <span className="text-xs text-slate-500 font-mono ms-2">{d.phone} • {d.vehicle}</span>
                  </div>
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
              <Input size="large" prefix={<UserOutlined className="text-slate-400" />} placeholder="Driver name" className="bg-slate-50 border-slate-200 font-medium" />
            </Form.Item>

            <Form.Item
              name="driverPhone"
              label={<span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Driver Phone</span>}
              rules={[
                { required: true, message: 'Please enter driver phone' },
                { pattern: /^(\+234|0)[789]\d{9}$/, message: 'Enter a valid Nigerian phone number' },
              ]}
            >
              <Input size="large" prefix={<PhoneOutlined className="text-slate-400" />} placeholder="Driver phone" className="bg-slate-50 border-slate-200 font-medium" />
            </Form.Item>
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
            <Button onClick={() => setActiveDelivery(null)} size="large">
              Cancel
            </Button>
            <Button type="primary" htmlType="submit" size="large" loading={submitting} className="bg-brand-navy font-bold px-6">
              Assign Selected Driver
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};
