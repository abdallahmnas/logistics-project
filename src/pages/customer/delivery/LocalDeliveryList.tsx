import React from 'react';
import { Button, Checkbox, Table } from 'antd';
import { EnvironmentOutlined, PlusOutlined, PhoneOutlined, InboxOutlined, CarOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

export const LocalDeliveryList: React.FC = () => {
  const navigate = useNavigate();

  const readyForDispatch = [
    { id: 'SHP-UK-9021', contents: 'Zara Clothing Haul', weight: '4.2 kg' },
    { id: 'SHP-US-4432', contents: 'Amazon Tech Gadgets', weight: '1.5 kg' },
    { id: 'SHP-CN-8890', contents: 'Auto Parts (Alternator)', weight: '8.9 kg' },
  ];

  const columns = [
    {
      title: '',
      key: 'checkbox',
      width: 48,
      render: () => <Checkbox />,
    },
    {
      title: 'SHIPMENT ID',
      dataIndex: 'id',
      key: 'id',
      render: (text: string) => <span className="font-mono text-xs">{text}</span>,
    },
    {
      title: 'CONTENTS',
      dataIndex: 'contents',
      key: 'contents',
      render: (text: string) => <span className="text-slate-800 font-medium">{text}</span>,
    },
    {
      title: 'WEIGHT',
      dataIndex: 'weight',
      key: 'weight',
      render: (text: string) => <span className="text-slate-600">{text}</span>,
    },
    {
      title: 'ACTION',
      key: 'action',
      render: () => (
        <span className="text-brand-orange font-bold text-xs uppercase cursor-pointer hover:text-[#E86E21] tracking-wider">
          Dispatch
        </span>
      ),
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
          <Button size="large" icon={<EnvironmentOutlined />} className="bg-slate-100 hover:bg-slate-200 border-none font-bold text-slate-700 w-full md:w-auto px-6">
            LIVE MAP VIEW
          </Button>
          <Button 
            size="large" 
            icon={<PlusOutlined />} 
            className="bg-[#0A1128] hover:bg-[#1a2542] text-white border-none font-bold w-full md:w-auto px-6"
            onClick={() => navigate('/dashboard/delivery/new')}
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
            Ready for Dispatch
          </div>
          <div className="flex items-baseline gap-2 relative z-10">
            <span className="text-5xl font-extrabold text-[#0A1128] tracking-tighter">14</span>
            <span className="text-slate-400 text-sm font-medium">+3 today</span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-slate-100 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-orange-50 rounded-bl-full"></div>
          <div className="flex items-center gap-2 text-brand-orange font-bold text-xs tracking-wider uppercase mb-4">
            <CarOutlined className="text-lg" />
            Active Deliveries
          </div>
          <div className="flex items-baseline gap-2 relative z-10">
            <span className="text-5xl font-extrabold text-[#0A1128] tracking-tighter">04</span>
            <span className="text-brand-orange text-sm font-bold">In transit</span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-slate-100 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-slate-50 rounded-bl-full"></div>
          <div className="flex items-center gap-2 text-slate-500 font-bold text-xs tracking-wider uppercase mb-4">
            <CheckCircleOutlined className="text-lg" />
            Completed Today
          </div>
          <div className="flex items-baseline gap-2 relative z-10">
            <span className="text-5xl font-extrabold text-[#0A1128] tracking-tighter">08</span>
            <span className="text-slate-400 text-sm font-medium">100% success</span>
          </div>
        </div>

        <div className="bg-[#0A1128] rounded-xl p-6 text-white shadow-lg relative overflow-hidden flex flex-col justify-center">
          <div className="absolute bottom-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl translate-x-1/3 translate-y-1/3"></div>
          <div className="text-[10px] font-bold text-blue-200 tracking-wider uppercase mb-2">Weather Alert</div>
          <h3 className="text-2xl font-bold m-0 mb-3 tracking-tight">Lagos Metro</h3>
          <p className="text-blue-100 text-xs m-0 leading-relaxed relative z-10">
            Clear conditions. Traffic expected on 3rd Mainland Bridge 16:00-19:00.
          </p>
        </div>
      </div>

      {/* Active Tracking */}
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-6">
          <h2 className="text-2xl font-bold text-[#0A1128] m-0 tracking-tight">Active Tracking</h2>
          <span className="bg-orange-100 text-orange-600 text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-wider">LIVE</span>
        </div>

        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 relative">
          {/* Tracking line */}
          <div className="absolute left-[52px] top-24 bottom-12 w-px bg-slate-200"></div>

          {/* Item 1 */}
          <div className="flex items-start gap-5 mb-8 relative z-10">
            <div className="w-14 h-14 rounded-full bg-orange-100 text-orange-500 flex items-center justify-center shrink-0 border-4 border-white shadow-sm z-10">
              <CarOutlined className="text-xl" />
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start mb-1">
                <div>
                  <div className="text-xs text-orange-500 font-bold tracking-wider mb-1">#LD-98342</div>
                  <h3 className="text-xl font-bold text-[#0A1128] m-0">MacBook Pro 16" & Acc.</h3>
                </div>
                <div className="text-sm font-bold text-slate-700">Est: 14:30</div>
              </div>
              <p className="text-slate-500 text-sm mb-4">En route to Lekki Phase 1</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img src="https://i.pravatar.cc/150?u=a042581f4e29026704d" alt="Rider" className="w-8 h-8 rounded-full object-cover" />
                  <span className="text-sm text-slate-600">Rider: <strong className="text-slate-800">Oluwaseun B.</strong></span>
                </div>
                <Button type="text" icon={<PhoneOutlined />} className="text-slate-500 hover:text-[#0A1128]" />
              </div>
            </div>
          </div>

          {/* Item 2 */}
          <div className="flex items-start gap-5 relative z-10">
            <div className="w-14 h-14 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center shrink-0 border-4 border-white shadow-sm z-10">
              <InboxOutlined className="text-xl" />
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start mb-1">
                <div>
                  <div className="text-xs text-slate-400 font-bold tracking-wider mb-1">#LD-98345</div>
                  <h3 className="text-xl font-bold text-slate-400 m-0">Nike Air Max Box (x3)</h3>
                </div>
                <div className="text-sm font-bold text-slate-400">Est: 16:00</div>
              </div>
              <p className="text-slate-400 text-sm m-0">Awaiting dispatch rider assignment</p>
            </div>
          </div>
        </div>
      </div>

      {/* Ready at Hub */}
      <div>
        <div className="flex justify-between items-end mb-6">
          <h2 className="text-2xl font-bold text-[#0A1128] m-0 tracking-tight">Ready at Lagos Hub</h2>
          <Button type="link" className="text-[#0A1128] font-bold p-0 text-sm">
            Select All
          </Button>
        </div>
        
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
          <Table 
            columns={columns} 
            dataSource={readyForDispatch} 
            rowKey="id" 
            pagination={false}
            className="[&_.ant-table-thead_th]:!bg-white [&_.ant-table-thead_th]:!text-slate-700 [&_.ant-table-thead_th]:!text-xs [&_.ant-table-thead_th]:!font-bold [&_.ant-table-thead_th]:uppercase [&_.ant-table-thead_th]:tracking-wider [&_.ant-table-thead_th]:!py-5 [&_.ant-table-tbody_td]:!py-5 border-b border-slate-100"
          />
        </div>
      </div>

    </div>
  );
};
