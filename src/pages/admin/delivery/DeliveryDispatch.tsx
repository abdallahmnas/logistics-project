import React, { useEffect, useMemo, useState } from 'react';
import { Card, Table, Input, Select, Button, Modal, Form, message, Tag, Alert } from 'antd';
import { SearchOutlined, CarOutlined } from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { fetchDeliveries, assignDriver } from '../../../store/slices/deliverySlice';
import { StatusBadge } from '../../../components/common/StatusBadge';
import { formatDateTime, formatDistance } from '../../../utils/formatters';
import type { LocalDelivery } from '../../../types/delivery.types';

const { Option } = Select;

interface AssignFormValues {
  driverName: string;
  driverPhone: string;
}

export const DeliveryDispatch: React.FC = () => {
  const [form] = Form.useForm<AssignFormValues>();
  const dispatch = useAppDispatch();
  const { deliveries, loading } = useAppSelector((state) => state.delivery);
  const [searchText, setSearchText] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [activeDelivery, setActiveDelivery] = useState<LocalDelivery | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    dispatch(fetchDeliveries());
  }, [dispatch]);

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
      message.success(`Driver assigned. Verification PIN: ${result.verificationPin}`);
      setActiveDelivery(null);
    } catch {
      message.error('Failed to assign driver.');
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
          <div className="text-slate-700">{record.pickupCity}: {record.pickupAddress}</div>
          <div className="text-slate-400 my-0.5">↓ {formatDistance(record.distanceKm)}</div>
          <div className="text-slate-700">{record.dropoffCity}: {record.dropoffAddress}</div>
        </div>
      ),
    },
    {
      title: 'Vehicle',
      dataIndex: 'vehicleType',
      key: 'vehicleType',
      render: (v: string) => <Tag className="uppercase">{v.replace('_', ' ')}</Tag>,
    },
    { title: 'Status', dataIndex: 'status', key: 'status', render: (s: string) => <StatusBadge module="delivery" status={s} /> },
    {
      title: 'Driver',
      key: 'driver',
      render: (record: LocalDelivery) =>
        record.driverName ? (
          <div className="text-xs">
            <div className="font-medium text-slate-700">{record.driverName}</div>
            <div className="text-slate-400">{record.driverPhone}</div>
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
            className="bg-brand-gold text-brand-navy font-bold border-none hover:bg-yellow-500"
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
        <p className="text-slate-500 mt-1 mb-0 text-sm">Assign drivers to confirmed local delivery requests</p>
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
        title={activeDelivery ? `Assign Driver — ${activeDelivery.id}` : 'Assign Driver'}
        open={!!activeDelivery}
        onCancel={() => setActiveDelivery(null)}
        footer={null}
        destroyOnHidden
      >
        <Alert
          type="info"
          showIcon
          message="A 4-digit verification PIN will be generated automatically and shared with the customer."
          className="mb-4 mt-2"
        />
        <Form form={form} layout="vertical" onFinish={onFinish} requiredMark={false}>
          <Form.Item name="driverName" label="Driver Name" rules={[{ required: true, message: 'Please enter the driver name' }]}>
            <Input size="large" placeholder="e.g. Chukwudi Emmanuel" />
          </Form.Item>
          <Form.Item
            name="driverPhone"
            label="Driver Phone"
            rules={[
              { required: true, message: 'Please enter the driver phone' },
              { pattern: /^(\+234|0)[789]\d{9}$/, message: 'Enter a valid Nigerian phone number' },
            ]}
          >
            <Input size="large" placeholder="e.g. +2348055667788" />
          </Form.Item>
          <Form.Item className="mb-0 mt-4 text-right">
            <Button onClick={() => setActiveDelivery(null)} className="mr-2">
              Cancel
            </Button>
            <Button type="primary" htmlType="submit" loading={submitting}>
              Assign Driver
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
