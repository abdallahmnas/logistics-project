import React, { useEffect } from 'react';
import { Card, Button, Table, Tag } from 'antd';
import { PlusOutlined, InboxOutlined } from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { fetchAllBatches, fetchAllPackages } from '../../../store/slices/adminSlice';
import { StatusBadge } from '../../../components/common/StatusBadge';
import { EmptyState } from '../../../components/common/EmptyState';
import { formatWeight, formatCbm, formatDate } from '../../../utils/formatters';
import { useNavigate } from 'react-router-dom';

export const BatchManagement: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { allBatches, loading } = useAppSelector((state) => state.admin);

  useEffect(() => {
    dispatch(fetchAllBatches());
    dispatch(fetchAllPackages()); // for counts/details if needed
  }, [dispatch]);

  const columns = [
    { title: 'Master Tracking', dataIndex: 'masterTrackingId', key: 'masterTrackingId', render: (v: string) => <span className="font-bold text-brand-navy">{v}</span> },
    { title: 'Carrier', dataIndex: 'carrierName', key: 'carrierName' },
    { title: 'Flight / Voyage', dataIndex: 'flightVoyageNo', key: 'flightVoyageNo' },
    {
      title: 'Type',
      dataIndex: 'shippingType',
      key: 'shippingType',
      render: (t: string) => <Tag color={t === 'air' ? 'blue' : 'cyan'} className="uppercase font-bold tracking-widest text-[10px] m-0">{t} FREIGHT</Tag>,
    },
    { title: 'Consolidations', dataIndex: 'consolidationCount', key: 'consolidationCount' },
    {
      title: 'Weight / CBM',
      key: 'totals',
      render: (record: any) => (
        <div className="text-sm font-medium">
          {record.shippingType === 'air' ? (
             <div className="text-brand-navy">{formatWeight(record.totalWeightKg)}</div>
          ) : (
             <div className="text-slate-500">{formatCbm(record.totalCbm)}</div>
          )}
        </div>
      ),
    },
    { title: 'Status', dataIndex: 'status', key: 'status', render: (s: string) => <StatusBadge module="shipment" status={s} /> },
    {
      title: 'Departure / ETA',
      key: 'dates',
      render: (record: any) => (
        <div className="text-xs text-slate-500 font-medium">
          <div>Dep: {record.departureDate ? formatDate(record.departureDate) : '—'}</div>
          <div>ETA: {record.expectedArrivalDate ? formatDate(record.expectedArrivalDate) : '—'}</div>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 m-0">Master Batches</h1>
          <p className="text-slate-500 mt-1 mb-0 text-sm">Consolidate packages into air / sea shipment batches</p>
        </div>
        <Button
          type="primary"
          size="large"
          icon={<PlusOutlined />}
          className="bg-brand-gold text-brand-navy font-bold border-none hover:bg-yellow-500"
          onClick={() => navigate('/admin/warehouse/batches/new')}
        >
          Create Batch
        </Button>
      </div>

      <Card bordered={false} className="shadow-sm rounded-2xl">
        {allBatches.length === 0 && !loading ? (
          <EmptyState
            title="No Batches Yet"
            description="Create a master batch to consolidate packages for shipment."
            actionText="Create Batch"
            onAction={() => navigate('/admin/warehouse/batches/new')}
            icon={<InboxOutlined />}
          />
        ) : (
          <Table 
            columns={columns} 
            dataSource={allBatches} 
            rowKey="id" 
            loading={loading} 
            scroll={{ x: 900 }} 
            pagination={{ pageSize: 10 }} 
            className="custom-admin-table cursor-pointer"
            onRow={(record) => {
              return {
                onClick: () => {
                  navigate(`/admin/warehouse/batches/${record.id}`);
                },
              };
            }}
          />
        )}
      </Card>
    </div>
  );
};
