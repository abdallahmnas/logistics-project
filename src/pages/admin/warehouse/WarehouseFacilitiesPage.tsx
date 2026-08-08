import React, { useState } from 'react';
import { Card, Input, Select, Button, Avatar, Progress, Tooltip } from 'antd';
import { SearchOutlined, AppstoreOutlined, UnorderedListOutlined, PlusOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Option } = Select;

interface Facility {
  id: string;
  code: string;
  name: string;
  location: string;
  country: string;
  status: 'active' | 'at_capacity' | 'inactive';
  capacityUtilization: number;
  currentVolume: string;
  maxVolume: string;
  imageUrl: string;
  staff: Array<{ initials: string; color: string; name: string }>;
}

const mockFacilities: Facility[] = [
  {
    id: 'f1',
    code: 'CN-SHA-01',
    name: 'Shanghai Terminal 1',
    location: 'Shanghai, China',
    country: 'CN',
    status: 'active',
    capacityUtilization: 88,
    currentVolume: '2.4M',
    maxVolume: '2.7M sq ft',
    imageUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=2070&auto=format&fit=crop',
    staff: [
      { initials: 'JW', color: '#0A1128', name: 'John Wu' },
      { initials: 'AL', color: '#1B2A4A', name: 'Alice Lee' },
    ],
  },
  {
    id: 'f2',
    code: 'NG-LOS-03',
    name: 'Lagos Central Hub',
    location: 'Lagos, Nigeria',
    country: 'NG',
    status: 'at_capacity',
    capacityUtilization: 98,
    currentVolume: '1.1M',
    maxVolume: '1.15M sq ft',
    imageUrl: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=2074&auto=format&fit=crop', // Maps placeholder
    staff: [
      { initials: 'MK', color: '#0A1128', name: 'Musa Kano' },
    ],
  },
  {
    id: 'f3',
    code: 'DE-FRA-02',
    name: 'Frankfurt Auto-Sort',
    location: 'Frankfurt, Germany',
    country: 'DE',
    status: 'active',
    capacityUtilization: 62,
    currentVolume: '3.1M',
    maxVolume: '5.0M sq ft',
    imageUrl: 'https://images.unsplash.com/photo-1580674684081-776d3f27f292?q=80&w=2070&auto=format&fit=crop',
    staff: [
      { initials: 'HZ', color: '#0A1128', name: 'Hans Zimmer' },
      { initials: 'BR', color: '#1B2A4A', name: 'Bernd Ruf' },
      { initials: 'KL', color: '#D95D10', name: 'Klaus L' },
    ],
  }
];

export const WarehouseFacilitiesPage: React.FC = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  return (
    <div className="animate-fade-in-up max-w-[1400px] mx-auto pb-20 mt-4 px-4">
      
      {/* Top Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card bordered={false} className="shadow-sm rounded-xl bg-slate-50 border border-slate-100">
          <div className="text-slate-500 font-bold text-xs tracking-wider uppercase mb-2">Total Facilities</div>
          <div className="text-4xl font-extrabold text-[#0A1128]">142</div>
          <div className="text-brand-orange text-sm font-medium mt-2 flex items-center gap-1">
            <span className="text-lg leading-none">↗</span> +3 this quarter
          </div>
        </Card>

        <Card bordered={false} className="shadow-sm rounded-xl bg-slate-50 border border-slate-100">
          <div className="text-slate-500 font-bold text-xs tracking-wider uppercase mb-2">Global Capacity</div>
          <div className="text-4xl font-extrabold text-[#0A1128]">84%</div>
          <div className="text-slate-500 text-sm font-medium mt-2">
            → 12.4M sq ft used
          </div>
        </Card>

        <Card bordered={false} className="shadow-sm rounded-xl bg-slate-50 border border-slate-100">
          <div className="text-slate-500 font-bold text-xs tracking-wider uppercase mb-2">Active Shipments</div>
          <div className="text-4xl font-extrabold text-[#0A1128]">48.2K</div>
          <div className="text-brand-orange text-sm font-medium mt-2 flex items-center gap-2">
            <EnvironmentOutlined /> In storage
          </div>
        </Card>

        <Card bordered={false} className="shadow-sm rounded-xl bg-slate-50 border border-slate-100">
          <div className="text-slate-500 font-bold text-xs tracking-wider uppercase mb-2">Avg Processing</div>
          <div className="text-4xl font-extrabold text-[#0A1128]">4.2<span className="text-xl font-semibold text-slate-500 ml-1">hrs</span></div>
          <div className="text-green-600 text-sm font-medium mt-2 flex items-center gap-1">
            <span className="text-lg leading-none">↘</span> -0.3 hrs vs last mo
          </div>
        </Card>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-100 mb-8">
        <div className="flex w-full md:w-auto gap-4">
          <Input 
            prefix={<SearchOutlined className="text-slate-400" />} 
            placeholder="Search facilities..." 
            className="w-full md:w-64 bg-slate-50 border-slate-200"
            size="large"
          />
          <Select defaultValue="all" size="large" className="w-32 [&>.ant-select-selector]:!bg-slate-50">
            <Option value="all">All Regions</Option>
            <Option value="asia">Asia</Option>
            <Option value="africa">Africa</Option>
            <Option value="europe">Europe</Option>
          </Select>
          <Select defaultValue="all" size="large" className="w-32 [&>.ant-select-selector]:!bg-slate-50">
            <Option value="all">All Statuses</Option>
            <Option value="active">Active</Option>
            <Option value="at_capacity">At Capacity</Option>
          </Select>
        </div>
        
        <div className="flex items-center gap-4 w-full md:w-auto justify-end">
          <div className="flex bg-slate-100 p-1 rounded-lg">
            <Button 
              type={viewMode === 'grid' ? 'primary' : 'text'} 
              icon={<AppstoreOutlined />} 
              onClick={() => setViewMode('grid')}
              className={viewMode === 'grid' ? 'bg-white text-brand-navy shadow-sm border-none' : 'text-slate-500 hover:text-brand-navy border-none'}
            />
            <Button 
              type={viewMode === 'list' ? 'primary' : 'text'} 
              icon={<UnorderedListOutlined />} 
              onClick={() => setViewMode('list')}
              className={viewMode === 'list' ? 'bg-white text-brand-navy shadow-sm border-none' : 'text-slate-500 hover:text-brand-navy border-none'}
            />
          </div>
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            size="large"
            className="bg-[#D95D10] hover:bg-[#E86E21] border-none font-bold shadow-md"
            onClick={() => navigate('/admin/warehouse/facilities/new')}
          >
            NEW WAREHOUSE
          </Button>
        </div>
      </div>

      {/* Grid View */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {mockFacilities.map(facility => (
          <Card 
            key={facility.id} 
            bordered={false} 
            className="shadow-md rounded-xl overflow-hidden hover:shadow-lg transition-shadow duration-300 border border-slate-100 flex flex-col h-full body-no-padding"
            styles={{ body: { padding: 0, display: 'flex', flexDirection: 'column', height: '100%' } }}
          >
            <div className="relative h-48 bg-slate-200">
              <img src={facility.imageUrl} alt={facility.name} className="w-full h-full object-cover" />
              <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2 shadow-sm">
                <div className={`w-2 h-2 rounded-full ${facility.status === 'active' ? 'bg-brand-navy' : 'bg-red-500'}`}></div>
                <span className="text-slate-700 tracking-wider uppercase">
                  {facility.status === 'at_capacity' ? 'AT CAPACITY' : facility.status}
                </span>
              </div>
            </div>
            
            <div className="p-6 flex flex-col flex-grow">
              <div className="text-brand-orange font-bold text-xs tracking-widest mb-1">{facility.code}</div>
              <h2 className="text-xl font-bold text-[#0A1128] m-0 mb-1">{facility.name}</h2>
              <div className="text-slate-500 text-sm flex items-center gap-1 mb-6">
                <EnvironmentOutlined /> {facility.location}
              </div>

              <div className="mt-auto">
                <div className="flex justify-between items-end mb-2">
                  <span className="text-xs font-bold text-slate-500 tracking-wider uppercase">Capacity Utilization</span>
                  <span className="text-xs font-bold text-slate-700">{facility.capacityUtilization}%</span>
                </div>
                <Progress 
                  percent={facility.capacityUtilization} 
                  showInfo={false} 
                  strokeColor={facility.capacityUtilization > 90 ? '#ef4444' : facility.capacityUtilization > 75 ? '#D95D10' : '#0A1128'}
                  railColor="#f1f5f9"
                  className="mb-1"
                />
                <div className="text-right text-xs text-slate-400 font-medium mb-6">
                  {facility.currentVolume} / {facility.maxVolume}
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                  <Avatar.Group size="small" max={{ count: 2, style: { color: '#f56a00', backgroundColor: '#fde3cf' } }}>
                    {facility.staff.map((s, i) => (
                      <Tooltip title={s.name} placement="top" key={i}>
                        <Avatar style={{ backgroundColor: s.color }} className="text-xs">{s.initials}</Avatar>
                      </Tooltip>
                    ))}
                  </Avatar.Group>
                  <Button type="link" className="text-[#0A1128] font-bold p-0 hover:text-brand-orange flex items-center gap-1">
                    Manage <span>→</span>
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

    </div>
  );
};
