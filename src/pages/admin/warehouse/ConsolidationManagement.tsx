import React, { useEffect } from 'react';
import { Card, Button, Table, Tag, message } from 'antd';
import { AppstoreOutlined, EyeOutlined } from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { fetchConsolidations } from '../../../store/slices/shipmentSlice';
import { StatusBadge } from '../../../components/common/StatusBadge';
import { formatWeight, formatCbm, formatRmb, formatDate } from '../../../utils/formatters';
import { useNavigate } from 'react-router-dom';

export const ConsolidationManagement: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { consolidations, loading } = useAppSelector((state) => state.shipments);

  useEffect(() => {
    dispatch(fetchConsolidations());
  }, [dispatch]);

  const columns = [
    { title: 'Consolidation ID', dataIndex: 'consolidationId', key: 'consolidationId', render: (v: string) => <span className="font-bold text-brand-navy">{v}</span> },
    { title: 'Customer', dataIndex: 'customerName', key: 'customerName' },
    {
      title: 'Shipping Type',
      dataIndex: 'shippingMethod',
      key: 'shippingMethod',
      render: (t: string) => <Tag color={t === 'air' ? 'blue' : 'cyan'} className="uppercase font-bold tracking-widest text-[10px] m-0">{t} FREIGHT</Tag>,
    },
    { title: 'Packages', dataIndex: 'packageIds', key: 'packageIds', render: (ids: string[]) => ids.length },
    {
      title: 'Weight / CBM',
      key: 'totals',
      render: (record: any) => (
        <div className="text-sm font-medium">
          {record.shippingMethod === 'air' ? (
             <div className="text-brand-navy">{formatWeight(record.totalWeightKg)}</div>
          ) : (
             <div className="text-slate-500">{formatCbm(record.totalCbm)}</div>
          )}
        </div>
      ),
    },
    { title: 'Shipping Fee', dataIndex: 'shippingFee', key: 'shippingFee', render: (v: number) => <span className="font-bold">{formatRmb(v)}</span> },
    { title: 'Status', dataIndex: 'status', key: 'status', render: (s: string) => <StatusBadge module="shipment" status={s} /> },
    {
      title: 'Action',
      key: 'action',
      render: (record: any) => (
        <Button type="text" icon={<EyeOutlined />} onClick={() => message.info('View consolidation details coming soon')} />
      ),
    }
  ];

  return (
    <div className="space-y-6 animate-fade-in-up max-w-[1200px] mx-auto pb-20 mt-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 m-0">Consolidations</h1>
          <p className="text-slate-500 mt-1 mb-0 text-sm">Customer shipment requests ready for batching</p>
        </div>
        <Button
          type="primary"
          size="large"
          className="bg-brand-navy font-bold"
          onClick={() => navigate('/admin/warehouse/batches/new')}
        >
          Add to Master Batch
        </Button>
      </div>

      <Card bordered={false} className="shadow-sm rounded-2xl">
        <Table 
          columns={columns} 
          dataSource={consolidations} 
          rowKey="id" 
          loading={loading} 
          scroll={{ x: 900 }} 
          pagination={{ pageSize: 10 }} 
          className="custom-admin-table"
          expandable={{
            expandedRowRender: (record) => (
              <div className="p-4 bg-slate-50 rounded-lg m-2 border border-slate-100">
                <p className="font-bold text-slate-700 mb-2">Packages in this Consolidation:</p>
                <div className="flex flex-wrap gap-2">
                  {record.packageIds.map((pid: string) => (
                    <Tag key={pid} className="m-0 bg-white border-slate-200 text-slate-600 font-mono">
                      {pid}
                    </Tag>
                  ))}
                </div>
              </div>
            ),
          }}
        />
      </Card>
    </div>
  );
};
