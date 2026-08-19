import React, { useEffect } from 'react';
import { Button, Checkbox, Table, Tag } from 'antd';
import { EnvironmentOutlined, PlusOutlined, PhoneOutlined, InboxOutlined, CarOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { fetchDeliveries } from '../../../store/slices/deliverySlice';

export const LocalDeliveryList: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { deliveries, loading } = useAppSelector((state) => state.delivery);

  useEffect(() => {
    dispatch(fetchDeliveries());
  }, [dispatch]);

  const activeDeliveries = deliveries.filter(d => ['pending', 'confirmed', 'driver_assigned', 'in_transit'].includes(d.status));
  const activeDeliveriesCount = activeDeliveries.length;
  const completedCount = deliveries.filter(d => d.status === 'delivered').length;

  const columns = [
    {
      title: 'DELIVERY ID',
      dataIndex: 'id',
      key: 'id',
      render: (text: string) => <span className="font-mono text-xs font-bold text-[#0A1128]">{text}</span>,
    },
    {
      title: 'PACKAGE CONTENTS',
      dataIndex: 'packageDescription',
      key: 'packageDescription',
      render: (text: string) => <span className="text-slate-800 font-medium">{text}</span>,
    },
    {
      title: 'DESTINATION ADDRESS',
      dataIndex: 'dropoffAddress',
      key: 'dropoffAddress',
      render: (text: string) => <span className="text-slate-600 text-xs">{text}</span>,
    },
    {
      title: 'STATUS',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'in_transit' ? 'orange' : status === 'delivered' ? 'green' : 'blue'} className="font-bold uppercase text-[10px]">
          {status.replace(/_/g, ' ')}
        </Tag>
      ),
    },
    {
      title: 'TOTAL FARE',
      dataIndex: 'totalFee',
      key: 'totalFee',
      render: (fee: number) => <span className="font-bold text-slate-800">₦{fee ? fee.toLocaleString() : '3,750'}</span>,
    },
  ];

  return (
    <div className="animate-fade-in-up max-w-[1200px] mx-auto pb-20">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
        <div>
          <h1 className="text-4xl font-extrabold text-[#0A1128] m-0 mb-3 tracking-tight">Local Delivery Dispatch</h1>
          <p className="text-slate-600 text-base max-w-xl m-0 leading-relaxed">
            Manage last-mile logistics for packages arrived at our Lagos distribution center. Schedule dispatch or track active riders.
          </p>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <Button 
            size="large" 
            icon={<PlusOutlined />} 
            className="bg-brand-orange hover:bg-[#E86E21] text-white border-none font-bold w-full md:w-auto px-6 shadow-md"
            onClick={() => navigate('/customer/delivery/new')}
          >
            NEW DISPATCH
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <div className="bg-white rounded-xl p-6 border border-slate-100 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-slate-50 rounded-bl-full"></div>
          <div className="flex items-center gap-2 text-slate-500 font-bold text-xs tracking-wider uppercase mb-4">
            <InboxOutlined className="text-lg" />
            Total Dispatches
          </div>
          <div className="flex items-baseline gap-2 relative z-10">
            <span className="text-5xl font-extrabold text-[#0A1128] tracking-tighter">{deliveries.length}</span>
            <span className="text-slate-400 text-sm font-medium">requests</span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-slate-100 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-orange-50 rounded-bl-full"></div>
          <div className="flex items-center gap-2 text-brand-orange font-bold text-xs tracking-wider uppercase mb-4">
            <CarOutlined className="text-lg" />
            Active Deliveries
          </div>
          <div className="flex items-baseline gap-2 relative z-10">
            <span className="text-5xl font-extrabold text-[#0A1128] tracking-tighter">{activeDeliveriesCount.toString().padStart(2, '0')}</span>
            <span className="text-brand-orange text-sm font-bold">In transit</span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-slate-100 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-slate-50 rounded-bl-full"></div>
          <div className="flex items-center gap-2 text-slate-500 font-bold text-xs tracking-wider uppercase mb-4">
            <CheckCircleOutlined className="text-lg" />
            Completed Deliveries
          </div>
          <div className="flex items-baseline gap-2 relative z-10">
            <span className="text-5xl font-extrabold text-[#0A1128] tracking-tighter">{completedCount.toString().padStart(2, '0')}</span>
            <span className="text-slate-400 text-sm font-medium">delivered</span>
          </div>
        </div>

        <div className="bg-[#0A1128] rounded-xl p-6 text-white shadow-lg relative overflow-hidden flex flex-col justify-center">
          <div className="absolute bottom-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl translate-x-1/3 translate-y-1/3"></div>
          <div className="text-[10px] font-bold text-blue-200 tracking-wider uppercase mb-2">Logistics Alert</div>
          <h3 className="text-2xl font-bold m-0 mb-3 tracking-tight">Lagos Metro Hub</h3>
          <p className="text-blue-100 text-xs m-0 leading-relaxed relative z-10">
            Active dispatch riders operating 08:00 - 18:00 WAT daily.
          </p>
        </div>
      </div>

      {/* Active Tracking */}
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-6">
          <h2 className="text-2xl font-bold text-[#0A1128] m-0 tracking-tight">Active Dispatches</h2>
          <span className="bg-orange-100 text-orange-600 text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-wider">LIVE</span>
        </div>

        {activeDeliveries.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-100 p-12 text-center shadow-sm">
            <CarOutlined className="text-5xl text-slate-300 mb-4" />
            <h3 className="text-lg font-bold text-slate-700 m-0 mb-2">No Active Deliveries</h3>
            <p className="text-slate-500 text-sm max-w-md mx-auto mb-6">
              You currently have no last-mile deliveries in progress. Schedule a dispatch to send packages from our Lagos Hub directly to your doorstep.
            </p>
            <Button 
              type="primary" 
              className="bg-brand-orange hover:bg-[#E86E21] border-none font-bold px-6"
              onClick={() => navigate('/customer/delivery/new')}
            >
              Request New Dispatch
            </Button>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 relative space-y-6">
            {activeDeliveries.map((item) => (
              <div key={item.id} className="flex items-start gap-5 p-4 rounded-xl bg-slate-50 border border-slate-100">
                <div className="w-12 h-12 rounded-full bg-brand-orange/10 text-brand-orange flex items-center justify-center shrink-0 border-2 border-white shadow-sm z-10">
                  <CarOutlined className="text-xl" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <div>
                      <div className="text-xs text-brand-orange font-bold tracking-wider mb-1">{item.id}</div>
                      <h3 className="text-lg font-bold text-[#0A1128] m-0">{item.packageDescription}</h3>
                    </div>
                    <Tag color="orange" className="font-bold uppercase text-[10px] m-0">{item.status.replace(/_/g, ' ')}</Tag>
                  </div>
                  <p className="text-slate-500 text-sm mb-3">Destination: <strong className="text-slate-700">{item.dropoffAddress}</strong> ({item.dropoffContactName})</p>
                  <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-200">
                    <span>Recipient Phone: <strong className="text-slate-700">{item.dropoffPhone}</strong></span>
                    <span>Vehicle: <strong className="text-slate-700 uppercase">{item.vehicleType}</strong></span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* All Delivery Requests History */}
      <div>
        <div className="flex justify-between items-end mb-6">
          <h2 className="text-2xl font-bold text-[#0A1128] m-0 tracking-tight">Delivery History</h2>
        </div>
        
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
          <Table 
            columns={columns} 
            dataSource={deliveries} 
            rowKey="id" 
            pagination={{ pageSize: 5 }}
            className="[&_.ant-table-thead_th]:!bg-white [&_.ant-table-thead_th]:!text-slate-700 [&_.ant-table-thead_th]:!text-xs [&_.ant-table-thead_th]:!font-bold [&_.ant-table-thead_th]:uppercase [&_.ant-table-thead_th]:tracking-wider [&_.ant-table-thead_th]:!py-5 [&_.ant-table-tbody_td]:!py-5 border-b border-slate-100"
          />
        </div>
      </div>

    </div>
  );
};
