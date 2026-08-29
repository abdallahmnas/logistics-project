import React, { useEffect } from 'react';
import { Button, Table, Tag, Steps, Tooltip } from 'antd';
import { PlusOutlined, InboxOutlined, CarOutlined, CheckCircleOutlined, UserOutlined, PhoneOutlined, KeyOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { fetchDeliveries } from '../../../store/slices/deliverySlice';
import type { LocalDelivery } from '../../../types/delivery.types';

export const LocalDeliveryList: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { deliveries, loading } = useAppSelector((state) => state.delivery);

  useEffect(() => {
    dispatch(fetchDeliveries());
  }, [dispatch]);

  const activeDeliveries = deliveries.filter(d => ['pending', 'confirmed', 'driver_assigned', 'in_transit', 'out_for_delivery'].includes(d.status));
  const activeDeliveriesCount = activeDeliveries.length;
  const completedCount = deliveries.filter(d => d.status === 'delivered').length;

  const getStepCurrent = (status: string) => {
    switch (status) {
      case 'pending':
        return 0;
      case 'confirmed':
        return 1;
      case 'driver_assigned':
        return 2;
      case 'in_transit':
        return 3;
      case 'out_for_delivery':
        return 4;
      case 'delivered':
        return 5;
      default:
        return 0;
    }
  };

  const columns = [
    {
      title: 'DELIVERY ID',
      dataIndex: 'id',
      key: 'id',
      render: (text: string) => <span className="font-mono text-xs font-bold text-[#0A1128]">{text.slice(0, 10)}</span>,
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
      render: (text: string, record: LocalDelivery) => (
        <span className="text-slate-600 text-xs">
          <strong>{record.dropoffCity}:</strong> {text}
        </span>
      ),
    },
    {
      title: 'VEHICLE',
      dataIndex: 'vehicleType',
      key: 'vehicleType',
      render: (v: string) => <Tag color="orange" className="font-bold uppercase text-[10px]">{v || 'Sedan'}</Tag>,
    },
    {
      title: 'STATUS',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        if (status === 'delivered') return <Tag color="green" icon={<CheckCircleOutlined />} className="font-bold uppercase text-[10px]">DELIVERED</Tag>;
        if (status === 'cancelled') return <Tag color="red" className="font-bold uppercase text-[10px]">CANCELLED</Tag>;
        return <Tag color="orange" icon={<ClockCircleOutlined />} className="font-bold uppercase text-[10px]">{status.replace(/_/g, ' ')}</Tag>;
      },
    },
    {
      title: 'TOTAL FARE',
      dataIndex: 'totalFee',
      key: 'totalFee',
      render: (fee: number) => <span className="font-extrabold text-brand-orange">₦{fee ? fee.toLocaleString() : '2,500'}</span>,
    },
  ];

  return (
    <div className="animate-fade-in-up max-w-[1200px] mx-auto pb-20">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
        <div>
          <h1 className="text-4xl font-extrabold text-[#0A1128] m-0 mb-3 tracking-tight">Doorstep Delivery & Dispatch</h1>
          <p className="text-slate-600 text-base max-w-xl m-0 leading-relaxed">
            Track active last-mile riders, view real-time delivery status updates, and request new doorstep dispatches across Nigeria.
          </p>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <Button 
            size="large" 
            icon={<PlusOutlined />} 
            className="bg-brand-orange hover:bg-[#E86E21] text-white border-none font-bold w-full md:w-auto px-6 shadow-md h-12 rounded-xl text-base"
            onClick={() => navigate('/customer/delivery/new')}
          >
            NEW DISPATCH REQUEST
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <div className="bg-white rounded-xl p-6 border border-slate-100 shadow-sm relative overflow-hidden">
          <div className="flex items-center gap-2 text-slate-500 font-bold text-xs tracking-wider uppercase mb-4">
            <InboxOutlined className="text-lg" /> Total Dispatches
          </div>
          <div className="flex items-baseline gap-2 relative z-10">
            <span className="text-5xl font-extrabold text-[#0A1128] tracking-tighter">{deliveries.length}</span>
            <span className="text-slate-400 text-sm font-medium">requests</span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-slate-100 shadow-sm relative overflow-hidden">
          <div className="flex items-center gap-2 text-brand-orange font-bold text-xs tracking-wider uppercase mb-4">
            <CarOutlined className="text-lg" /> Active Deliveries
          </div>
          <div className="flex items-baseline gap-2 relative z-10">
            <span className="text-5xl font-extrabold text-[#0A1128] tracking-tighter">{activeDeliveriesCount.toString().padStart(2, '0')}</span>
            <span className="text-brand-orange text-sm font-bold">In transit</span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-slate-100 shadow-sm relative overflow-hidden">
          <div className="flex items-center gap-2 text-slate-500 font-bold text-xs tracking-wider uppercase mb-4">
            <CheckCircleOutlined className="text-lg" /> Completed Deliveries
          </div>
          <div className="flex items-baseline gap-2 relative z-10">
            <span className="text-5xl font-extrabold text-[#0A1128] tracking-tighter">{completedCount.toString().padStart(2, '0')}</span>
            <span className="text-slate-400 text-sm font-medium">delivered</span>
          </div>
        </div>

        <div className="bg-[#0A1128] rounded-xl p-6 text-white shadow-lg relative overflow-hidden flex flex-col justify-center">
          <div className="text-[10px] font-bold text-blue-200 tracking-wider uppercase mb-2">Nationwide Fleet</div>
          <h3 className="text-2xl font-bold m-0 mb-2 tracking-tight">Lagos, Kano & Inter-State</h3>
          <p className="text-blue-100 text-xs m-0 leading-relaxed relative z-10">
            Real-time status updates & driver verification PINs.
          </p>
        </div>
      </div>

      {/* Active Dispatches Section */}
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-6">
          <h2 className="text-2xl font-bold text-[#0A1128] m-0 tracking-tight">Active Dispatches & Real-Time Tracking</h2>
          <span className="bg-orange-100 text-brand-orange text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">LIVE UPDATES</span>
        </div>

        {activeDeliveries.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center shadow-sm">
            <CarOutlined className="text-5xl text-slate-300 mb-4" />
            <h3 className="text-lg font-bold text-slate-700 m-0 mb-2">No Active Deliveries in Progress</h3>
            <p className="text-slate-500 text-sm max-w-md mx-auto mb-6">
              You currently have no last-mile doorstep deliveries in progress. Click below to request a new dispatch.
            </p>
            <Button 
              type="primary" 
              className="bg-brand-orange hover:bg-[#E86E21] border-none font-bold px-6 h-11 rounded-xl"
              onClick={() => navigate('/customer/delivery/new')}
            >
              Request New Dispatch
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {activeDeliveries.map((item) => (
              <div key={item.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-slate-100">
                  <div>
                    <span className="text-[10px] font-extrabold text-brand-orange uppercase tracking-widest block mb-1">
                      DELIVERY ID: {item.id}
                    </span>
                    <h3 className="text-xl font-extrabold text-[#0A1128] m-0">{item.packageDescription}</h3>
                    <p className="text-xs text-slate-500 m-0 mt-1">
                      Destination: <strong className="text-slate-800">{item.dropoffCity}</strong> — {item.dropoffAddress} ({item.dropoffContactName}, {item.dropoffPhone})
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <Tag color="orange" className="font-extrabold uppercase text-xs py-1 px-3 rounded-lg border-none">
                      {item.vehicleType || 'Sedan'}
                    </Tag>
                    <span className="text-2xl font-black text-brand-orange">₦{item.totalFee.toLocaleString()}</span>
                  </div>
                </div>

                {/* Driver Info & Verification PIN */}
                {item.driverName ? (
                  <div className="bg-gradient-to-r from-slate-900 to-[#0A1128] text-white p-4 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-brand-orange text-white flex items-center justify-center font-bold text-lg">
                        <UserOutlined />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">ASSIGNED DISPATCH DRIVER</span>
                        <span className="text-sm font-extrabold text-white">{item.driverName}</span>
                        <span className="text-xs text-slate-300 ml-2 font-mono"><PhoneOutlined className="mr-1" />{item.driverPhone}</span>
                      </div>
                    </div>

                    {item.verificationPin && (
                      <div className="bg-amber-500/20 border border-amber-500/30 px-4 py-2 rounded-lg flex items-center gap-2">
                        <KeyOutlined className="text-amber-400 text-lg" />
                        <div>
                          <span className="text-[10px] font-bold text-amber-300 uppercase block">PICKUP VERIFICATION PIN</span>
                          <span className="text-lg font-mono font-black text-amber-400 tracking-widest">{item.verificationPin}</span>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl text-xs text-slate-600 flex items-center gap-2">
                    <ClockCircleOutlined className="text-amber-500 text-lg" />
                    <span>Awaiting driver assignment from our dispatch control center...</span>
                  </div>
                )}

                {/* Tracking Progress Steps */}
                <div className="pt-2">
                  <Steps
                    current={getStepCurrent(item.status)}
                    size="small"
                    items={[
                      { title: 'Request Placed' },
                      { title: 'Confirmed' },
                      { title: 'Driver Assigned' },
                      { title: 'In Transit' },
                      { title: 'Out for Delivery' },
                      { title: 'Delivered' },
                    ]}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delivery History Table */}
      <div>
        <div className="flex justify-between items-end mb-4">
          <h2 className="text-2xl font-bold text-[#0A1128] m-0 tracking-tight">Delivery History</h2>
        </div>
        
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <Table 
            columns={columns} 
            dataSource={deliveries} 
            rowKey="id" 
            loading={loading}
            pagination={{ pageSize: 5 }}
            className="[&_.ant-table-thead_th]:!bg-slate-50 [&_.ant-table-thead_th]:!text-slate-600 [&_.ant-table-thead_th]:!text-xs [&_.ant-table-thead_th]:!font-bold [&_.ant-table-thead_th]:uppercase"
          />
        </div>
      </div>

    </div>
  );
};
