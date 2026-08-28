import React, { useEffect, useMemo, useState } from 'react';
import { Card, Table, Input, Select, Button, Drawer, Form, InputNumber, message, Descriptions, Divider, Image, Tag } from 'antd';
import { SearchOutlined, DollarOutlined, EyeOutlined, LinkOutlined, TagOutlined, FilePdfOutlined } from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { fetchProcurements, quoteProcurement } from '../../../store/slices/procurementSlice';
import { StatusBadge } from '../../../components/common/StatusBadge';
import { PriceTag } from '../../../components/common/PriceTag';
import { FileThumbnail, isPdfFile } from '../../../components/common/FileThumbnail';
import { procurementQuoteSchema, validateForm } from '../../../utils/validators';
import { DEFAULT_EXCHANGE_RATE } from '../../../utils/constants';
import { truncateText, formatDate } from '../../../utils/formatters';
import type { ProcurementRequest } from '../../../types/procurement.types';

const { Option } = Select;

interface QuoteFormValues {
  productCostNaira: number;
  serviceFeeNaira: number;
  supplierName: string;
}

export const ProcurementReview: React.FC = () => {
  const [form] = Form.useForm<QuoteFormValues>();
  const dispatch = useAppDispatch();
  const { requests, loading } = useAppSelector((state) => state.procurement);
  const [searchText, setSearchText] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [activeRequest, setActiveRequest] = useState<ProcurementRequest | null>(null);
  const [viewDetailsModal, setViewDetailsModal] = useState<ProcurementRequest | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const productCostNaira = Form.useWatch('productCostNaira', form);
  const serviceFeeNaira = Form.useWatch('serviceFeeNaira', form);

  useEffect(() => {
    dispatch(fetchProcurements());
  }, [dispatch]);

  const filtered = useMemo(() => {
    return requests.filter((r) => {
      const matchesSearch =
        r.customerName.toLowerCase().includes(searchText.toLowerCase()) ||
        r.id.toLowerCase().includes(searchText.toLowerCase()) ||
        r.productUrl.toLowerCase().includes(searchText.toLowerCase()) ||
        r.specifications?.toLowerCase().includes(searchText.toLowerCase());
      const matchesStatus = filterStatus === 'all' || r.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [requests, searchText, filterStatus]);

  const totalNaira = (Number(productCostNaira) || 0) + (Number(serviceFeeNaira) || 0);
  const totalRmb = totalNaira / DEFAULT_EXCHANGE_RATE.platformRate;

  const openQuote = (record: ProcurementRequest) => {
    setActiveRequest(record);
    form.resetFields();
  };

  const onFinish = async (values: QuoteFormValues) => {
    if (!activeRequest) return;
    const pNaira = Number(values.productCostNaira) || 0;
    const sNaira = Number(values.serviceFeeNaira) || 0;
    const pRmb = Number((pNaira / DEFAULT_EXCHANGE_RATE.platformRate).toFixed(2));
    const sRmb = Number((sNaira / DEFAULT_EXCHANGE_RATE.platformRate).toFixed(2));

    setSubmitting(true);
    try {
      await dispatch(
        quoteProcurement({
          requestId: activeRequest.id,
          productCostRmb: pRmb,
          serviceFeeRmb: sRmb,
          supplierName: values.supplierName,
        })
      ).unwrap();
      message.success('Quote in Naira (₦) sent to customer.');
      setActiveRequest(null);
    } catch {
      message.error('Failed to submit quote.');
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    {
      title: 'Request ID',
      key: 'request',
      render: (record: ProcurementRequest) => (
        <div>
          <div className="font-bold text-brand-navy font-mono text-xs">{record.id}</div>
          <div className="text-xs font-medium text-slate-700">{record.customerName}</div>
        </div>
      ),
    },
    {
      title: 'Item Photo & Info',
      key: 'product',
      render: (record: ProcurementRequest) => {
        const photos = record.productPhotos || [];
        const firstPhoto = photos[0] || '';
        return (
          <div className="flex items-center gap-3 max-w-sm">
            <FileThumbnail url={firstPhoto} fileName={record.specifications} size="sm" showName={false} />
            <div className="space-y-1 overflow-hidden">
              <div className="text-xs font-bold text-slate-800 truncate" title={record.specifications}>
                {record.specifications || 'Buy-For-Me Item'}
              </div>
              <a
                href={record.productUrl}
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-brand-blue font-medium flex items-center gap-1 hover:underline"
              >
                <LinkOutlined /> View Supplier Link
              </a>
            </div>
          </div>
        );
      },
    },
    {
      title: 'Qty',
      dataIndex: 'quantity',
      key: 'quantity',
      render: (q: number) => <Tag color="blue" className="font-bold">{q} pcs</Tag>,
    },
    {
      title: 'Quote (NGN Naira ₦)',
      key: 'quoteNaira',
      render: (record: ProcurementRequest) =>
        record.totalCostNaira ? (
          <div className="flex flex-col">
            <span className="font-extrabold text-brand-orange text-sm">₦{record.totalCostNaira.toLocaleString()}</span>
            <span className="text-[10px] text-slate-400 font-medium">¥{record.totalCostRmb?.toFixed(2)} RMB</span>
          </div>
        ) : (
          <span className="text-slate-400 italic text-xs">Pending Quote</span>
        ),
    },
    { title: 'Status', dataIndex: 'status', key: 'status', render: (s: string) => <StatusBadge module="procurement" status={s} /> },
    { title: 'Submitted', dataIndex: 'submittedAt', key: 'submittedAt', render: (d: string) => formatDate(d) },
    {
      title: 'Actions',
      key: 'action',
      render: (record: ProcurementRequest) => (
        <div className="flex items-center gap-2">
          <Button
            size="small"
            icon={<EyeOutlined />}
            className="text-slate-600 font-medium"
            onClick={() => setViewDetailsModal(record)}
          >
            Details
          </Button>
          {(record.status === 'submitted' || record.status === 'under_review') && (
            <Button
              type="primary"
              size="small"
              icon={<DollarOutlined />}
              className="bg-brand-gold text-brand-navy font-bold border-none hover:bg-yellow-500"
              onClick={() => openQuote(record)}
            >
              Quote (NGN)
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 m-0">Procurement Review</h1>
        <p className="text-slate-500 mt-1 mb-0 text-sm">Review "Buy For Me" requests and issue price quotes in Nigerian Naira (₦)</p>
      </div>

      <Card variant="borderless" className="shadow-sm rounded-2xl">
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

      {/* Quote Modal Drawer */}
      <Drawer
        title={activeRequest ? `Issue Quote (Naira ₦) — ${activeRequest.id}` : 'Quote Request'}
        open={!!activeRequest}
        onClose={() => setActiveRequest(null)}
        size="large"
        destroyOnClose
      >
        {activeRequest && (
          <>
            {activeRequest.productPhotos && activeRequest.productPhotos.length > 0 && (
              <div className="mb-6 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block mb-2">Attached Photos / PDF Specs</span>
                <div className="flex flex-wrap gap-3">
                  {activeRequest.productPhotos.map((url, idx) => (
                    <FileThumbnail key={idx} url={url} size="md" showName={true} />
                  ))}
                </div>
              </div>
            )}

            <Descriptions column={1} size="small" bordered className="mb-6">
              <Descriptions.Item label="Customer">{activeRequest.customerName}</Descriptions.Item>
              <Descriptions.Item label="Quantity">{activeRequest.quantity} pcs</Descriptions.Item>
              <Descriptions.Item label="Specifications">{activeRequest.specifications}</Descriptions.Item>
              {activeRequest.sizes && <Descriptions.Item label="Sizes">{activeRequest.sizes}</Descriptions.Item>}
              {activeRequest.colors && <Descriptions.Item label="Colors">{activeRequest.colors}</Descriptions.Item>}
              {activeRequest.notes && <Descriptions.Item label="Customer Notes">{activeRequest.notes}</Descriptions.Item>}
              <Descriptions.Item label="Product Link">
                <a href={activeRequest.productUrl} target="_blank" rel="noreferrer" className="text-brand-blue flex items-center gap-1 font-medium">
                  <LinkOutlined /> {truncateText(activeRequest.productUrl, 45)}
                </a>
              </Descriptions.Item>
            </Descriptions>

            <Divider />

            <Form form={form} layout="vertical" onFinish={onFinish} requiredMark={false}>
              <Form.Item name="supplierName" label="Supplier Name" rules={[{ required: true, message: 'Required' }]}>
                <Input size="large" placeholder="e.g. Shenzhen MobileTech Co." />
              </Form.Item>
              <Form.Item name="productCostNaira" label="Product Cost (Naira ₦)" rules={[{ required: true, message: 'Required' }]}>
                <InputNumber className="w-full" min={1} size="large" prefix="₦" placeholder="0.00" />
              </Form.Item>
              <Form.Item name="serviceFeeNaira" label="Service & Sourcing Fee (Naira ₦)" rules={[{ required: true, message: 'Required' }]}>
                <InputNumber className="w-full" min={0} size="large" prefix="₦" placeholder="0.00" />
              </Form.Item>

              {/* Calculated Quote Box in NGN */}
              <div className="bg-[#0A1128] text-white p-5 rounded-xl border border-slate-800 space-y-2 mb-6">
                <div className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">
                  TOTAL CALCULATED QUOTE (NAIRA ₦)
                </div>
                <div className="text-3xl font-extrabold text-white">
                  ₦{totalNaira.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div className="text-xs text-slate-300 flex justify-between pt-2 border-t border-slate-800">
                  <span>RMB Total: ¥{totalRmb.toFixed(2)}</span>
                  <span>Rate: ₦{DEFAULT_EXCHANGE_RATE.platformRate}/¥</span>
                </div>
              </div>

              <Form.Item className="mb-0 text-right">
                <Button onClick={() => setActiveRequest(null)} className="mr-2" size="large">
                  Cancel
                </Button>
                <Button type="primary" htmlType="submit" loading={submitting} size="large" className="bg-brand-orange hover:bg-[#E86E21] border-none font-bold">
                  Send Quote (₦{totalNaira.toLocaleString()})
                </Button>
              </Form.Item>
            </Form>
          </>
        )}
      </Drawer>

      {/* View Full Details Drawer */}
      <Drawer
        title={viewDetailsModal ? `Procurement Info — ${viewDetailsModal.id}` : 'Procurement Info'}
        open={!!viewDetailsModal}
        onClose={() => setViewDetailsModal(null)}
        size="large"
        destroyOnClose
      >
        {viewDetailsModal && (
          <div className="space-y-6">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex justify-between items-center">
              <div>
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block mb-1">Status</span>
                <StatusBadge module="procurement" status={viewDetailsModal.status} />
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block mb-1">Submitted</span>
                <span className="text-xs font-bold text-slate-700">{formatDate(viewDetailsModal.submittedAt)}</span>
              </div>
            </div>

            {viewDetailsModal.productPhotos && viewDetailsModal.productPhotos.length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">ATTACHED FILES / PDF DOCUMENTS</h4>
                <div className="flex flex-wrap gap-3">
                  {viewDetailsModal.productPhotos.map((url, idx) => (
                    <FileThumbnail key={idx} url={url} size="md" showName={true} />
                  ))}
                </div>
              </div>
            )}

            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">ITEM SPECIFICATIONS</h4>
              <Descriptions column={1} bordered size="small" className="bg-white rounded-lg">
                <Descriptions.Item label="Customer">{viewDetailsModal.customerName}</Descriptions.Item>
                <Descriptions.Item label="Quantity">{viewDetailsModal.quantity} pcs</Descriptions.Item>
                <Descriptions.Item label="Specifications">{viewDetailsModal.specifications}</Descriptions.Item>
                {viewDetailsModal.sizes && <Descriptions.Item label="Sizes">{viewDetailsModal.sizes}</Descriptions.Item>}
                {viewDetailsModal.colors && <Descriptions.Item label="Colors">{viewDetailsModal.colors}</Descriptions.Item>}
                {viewDetailsModal.notes && <Descriptions.Item label="Customer Notes">{viewDetailsModal.notes}</Descriptions.Item>}
                <Descriptions.Item label="Supplier Link">
                  <a href={viewDetailsModal.productUrl} target="_blank" rel="noreferrer" className="text-brand-blue flex items-center gap-1 font-medium">
                    <LinkOutlined /> {viewDetailsModal.productUrl}
                  </a>
                </Descriptions.Item>
              </Descriptions>
            </div>

            {viewDetailsModal.supplierName && (
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">SUPPLIER & QUOTE DETAILS</h4>
                <Descriptions column={1} bordered size="small" className="bg-white rounded-lg">
                  <Descriptions.Item label="Supplier Name">{viewDetailsModal.supplierName}</Descriptions.Item>
                  {viewDetailsModal.totalCostNaira && (
                    <Descriptions.Item label="Total Cost (NGN Naira ₦)">
                      <span className="font-extrabold text-brand-orange text-base">₦{viewDetailsModal.totalCostNaira.toLocaleString()}</span>
                    </Descriptions.Item>
                  )}
                  {viewDetailsModal.productCostRmb && <Descriptions.Item label="Product Cost (RMB)">¥{viewDetailsModal.productCostRmb.toFixed(2)}</Descriptions.Item>}
                  {viewDetailsModal.serviceFeeRmb && <Descriptions.Item label="Service Fee (RMB)">¥{viewDetailsModal.serviceFeeRmb.toFixed(2)}</Descriptions.Item>}
                  {viewDetailsModal.totalCostRmb && <Descriptions.Item label="Total Cost (RMB)">¥{viewDetailsModal.totalCostRmb.toFixed(2)}</Descriptions.Item>}
                  {viewDetailsModal.chineseTrackingNo && <Descriptions.Item label="Chinese Tracking No">{viewDetailsModal.chineseTrackingNo}</Descriptions.Item>}
                </Descriptions>
              </div>
            )}
          </div>
        )}
      </Drawer>
    </div>
  );
};
