import React, { useEffect, useMemo, useState } from 'react';
import { Card, Table, Input, Select, Button, Drawer, Form, InputNumber, message, Descriptions, Divider } from 'antd';
import { SearchOutlined, DollarOutlined } from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { fetchProcurements, quoteProcurement } from '../../../store/slices/procurementSlice';
import { StatusBadge } from '../../../components/common/StatusBadge';
import { PriceTag } from '../../../components/common/PriceTag';
import { procurementQuoteSchema, validateForm } from '../../../utils/validators';
import { DEFAULT_EXCHANGE_RATE } from '../../../utils/constants';
import { truncateText, formatDate } from '../../../utils/formatters';
import type { ProcurementRequest } from '../../../types/procurement.types';

const { Option } = Select;

interface QuoteFormValues {
  productCostRmb: number;
  serviceFeeRmb: number;
  supplierName: string;
}

export const ProcurementReview: React.FC = () => {
  const [form] = Form.useForm<QuoteFormValues>();
  const dispatch = useAppDispatch();
  const { requests, loading } = useAppSelector((state) => state.procurement);
  const [searchText, setSearchText] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [activeRequest, setActiveRequest] = useState<ProcurementRequest | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const productCostRmb = Form.useWatch('productCostRmb', form);
  const serviceFeeRmb = Form.useWatch('serviceFeeRmb', form);

  useEffect(() => {
    dispatch(fetchProcurements());
  }, [dispatch]);

  const filtered = useMemo(() => {
    return requests.filter((r) => {
      const matchesSearch =
        r.customerName.toLowerCase().includes(searchText.toLowerCase()) ||
        r.id.toLowerCase().includes(searchText.toLowerCase()) ||
        r.productUrl.toLowerCase().includes(searchText.toLowerCase());
      const matchesStatus = filterStatus === 'all' || r.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [requests, searchText, filterStatus]);

  const totalRmb = (Number(productCostRmb) || 0) + (Number(serviceFeeRmb) || 0);
  const totalNaira = totalRmb * DEFAULT_EXCHANGE_RATE.platformRate;

  const openQuote = (record: ProcurementRequest) => {
    setActiveRequest(record);
    form.resetFields();
  };

  const onFinish = async (values: QuoteFormValues) => {
    if (!activeRequest) return;
    const errors = await validateForm(procurementQuoteSchema, values as unknown as Record<string, unknown>);
    if (Object.keys(errors).length > 0) {
      form.setFields(Object.keys(errors).map((key) => ({ name: key, errors: [errors[key]] })) as any);
      return;
    }
    setSubmitting(true);
    try {
      await dispatch(
        quoteProcurement({
          requestId: activeRequest.id,
          productCostRmb: values.productCostRmb,
          serviceFeeRmb: values.serviceFeeRmb,
          supplierName: values.supplierName,
        })
      ).unwrap();
      message.success('Quote sent to customer.');
      setActiveRequest(null);
    } catch {
      message.error('Failed to submit quote.');
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    {
      title: 'Request',
      key: 'request',
      render: (record: ProcurementRequest) => (
        <div>
          <div className="font-bold text-brand-navy">{record.id}</div>
          <div className="text-xs text-slate-500">{record.customerName}</div>
        </div>
      ),
    },
    {
      title: 'Product',
      key: 'product',
      render: (record: ProcurementRequest) => (
        <div className="max-w-xs">
          <div className="text-sm">{truncateText(record.specifications, 60)}</div>
          <a href={record.productUrl} target="_blank" rel="noreferrer" className="text-xs text-brand-blue">
            View Link
          </a>
        </div>
      ),
    },
    { title: 'Qty', dataIndex: 'quantity', key: 'quantity' },
    {
      title: 'Quote (RMB)',
      key: 'quote',
      render: (record: ProcurementRequest) =>
        record.totalCostRmb ? <PriceTag amount={record.totalCostRmb} currency="CNY" size="sm" /> : <span className="text-slate-400 italic">Pending</span>,
    },
    {
      title: 'Quote (NGN)',
      key: 'quoteNaira',
      render: (record: ProcurementRequest) =>
        record.totalCostNaira ? <PriceTag amount={record.totalCostNaira} size="sm" /> : <span className="text-slate-400 italic">—</span>,
    },
    { title: 'Status', dataIndex: 'status', key: 'status', render: (s: string) => <StatusBadge module="procurement" status={s} /> },
    { title: 'Submitted', dataIndex: 'submittedAt', key: 'submittedAt', render: (d: string) => formatDate(d) },
    {
      title: 'Action',
      key: 'action',
      render: (record: ProcurementRequest) =>
        record.status === 'submitted' || record.status === 'under_review' ? (
          <Button
            type="primary"
            size="small"
            icon={<DollarOutlined />}
            className="bg-brand-gold text-brand-navy font-bold border-none hover:bg-yellow-500"
            onClick={() => openQuote(record)}
          >
            Quote
          </Button>
        ) : (
          <span className="text-slate-400 text-xs">—</span>
        ),
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 m-0">Procurement Review</h1>
        <p className="text-slate-500 mt-1 mb-0 text-sm">Review "Buy For Me" requests and issue price quotes</p>
      </div>

      <Card bordered={false} className="shadow-sm rounded-2xl">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <Input
            placeholder="Search customer, request ID or link..."
            prefix={<SearchOutlined className="text-slate-400" />}
            className="md:w-1/3"
            size="large"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
          <Select defaultValue="all" size="large" className="md:w-56" onChange={setFilterStatus}>
            <Option value="all">All Statuses</Option>
            <Option value="submitted">Submitted</Option>
            <Option value="under_review">Under Review</Option>
            <Option value="quoted">Quoted</Option>
            <Option value="approved">Approved</Option>
            <Option value="purchasing">Purchasing</Option>
            <Option value="shipped_to_wh">Shipped to Warehouse</Option>
            <Option value="received_at_wh">Received at Warehouse</Option>
            <Option value="cancelled">Cancelled</Option>
            <Option value="rejected">Rejected</Option>
          </Select>
        </div>

        <Table columns={columns} dataSource={filtered} rowKey="id" loading={loading} scroll={{ x: 1000 }} pagination={{ pageSize: 10 }} className="custom-admin-table" />
      </Card>

      <Drawer
        title={activeRequest ? `Quote Request — ${activeRequest.id}` : 'Quote Request'}
        open={!!activeRequest}
        onClose={() => setActiveRequest(null)}
        size="large"
        destroyOnHidden
      >
        {activeRequest && (
          <>
            <Descriptions column={1} size="small" bordered className="mb-6">
              <Descriptions.Item label="Customer">{activeRequest.customerName}</Descriptions.Item>
              <Descriptions.Item label="Quantity">{activeRequest.quantity}</Descriptions.Item>
              <Descriptions.Item label="Specifications">{activeRequest.specifications}</Descriptions.Item>
              {activeRequest.sizes && <Descriptions.Item label="Sizes">{activeRequest.sizes}</Descriptions.Item>}
              {activeRequest.colors && <Descriptions.Item label="Colors">{activeRequest.colors}</Descriptions.Item>}
              <Descriptions.Item label="Product Link">
                <a href={activeRequest.productUrl} target="_blank" rel="noreferrer" className="text-brand-blue">
                  {truncateText(activeRequest.productUrl, 40)}
                </a>
              </Descriptions.Item>
            </Descriptions>

            <Divider />

            <Form form={form} layout="vertical" onFinish={onFinish} requiredMark={false}>
              <Form.Item name="supplierName" label="Supplier Name" rules={[{ required: true, message: 'Required' }]}>
                <Input size="large" placeholder="e.g. Shenzhen MobileTech Co." />
              </Form.Item>
              <Form.Item name="productCostRmb" label="Product Cost (RMB)" rules={[{ required: true, message: 'Required' }]}>
                <InputNumber className="w-full" min={0.01} size="large" prefix="¥" />
              </Form.Item>
              <Form.Item name="serviceFeeRmb" label="Service Fee (RMB)" rules={[{ required: true, message: 'Required' }]}>
                <InputNumber className="w-full" min={0} size="large" prefix="¥" />
              </Form.Item>

              <div className="bg-brand-blue-light rounded-lg p-4 mb-6 space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Total (RMB)</span>
                  <span className="font-bold text-brand-navy">¥{totalRmb.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Rate Used</span>
                  <span className="font-bold text-brand-navy">{DEFAULT_EXCHANGE_RATE.platformRate}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Total (NGN)</span>
                  <span className="font-bold text-brand-navy">₦{totalNaira.toLocaleString()}</span>
                </div>
              </div>

              <Form.Item className="mb-0 text-right">
                <Button onClick={() => setActiveRequest(null)} className="mr-2">
                  Cancel
                </Button>
                <Button type="primary" htmlType="submit" loading={submitting}>
                  Send Quote
                </Button>
              </Form.Item>
            </Form>
          </>
        )}
      </Drawer>
    </div>
  );
};
