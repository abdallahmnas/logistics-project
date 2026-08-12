import React, { useEffect, useState, useMemo } from 'react';
import { Card, Input, Select, Button, Avatar, Progress, Tooltip } from 'antd';
import { SearchOutlined, AppstoreOutlined, UnorderedListOutlined, PlusOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { fetchAllPackages } from '../../../store/slices/adminSlice';

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

export const WarehouseFacilitiesPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { allPackages } = useAppSelector((state) => state.admin);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    dispatch(fetchAllPackages());
  }, [dispatch]);

  const cnPackagesCount = useMemo(() => allPackages.filter(p => p.status === 'received_cn').length, [allPackages]);
  const ngPackagesCount = useMemo(() => allPackages.filter(p => p.status === 'arrived_ng' || p.status === 'ready_for_pickup').length, [allPackages]);

  const facilities: Facility[] = [
    {
      id: 'f1',
      code: 'CN-CAN-01',
      name: 'Guangzhou Primary Hub',
      location: 'Guangzhou, China',
      country: 'CN',
      status: 'active',
      capacityUtilization: Math.min(100, Math.max(10, cnPackagesCount * 15)),
      currentVolume: `${cnPackagesCount} packages`,
      maxVolume: '1,000 pkgs/day',
      imageUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=2070&auto=format&fit=crop',
      staff: [
        { initials: 'CN', color: '#0A1128', name: 'CN Warehouse Team' },
      ],
    },
    {
      id: 'f2',
      code: 'NG-LOS-01',
      name: 'Lagos Central Distribution Hub',
      location: 'Lagos, Nigeria',
      country: 'NG',
      status: 'active',
      capacityUtilization: Math.min(100, Math.max(10, ngPackagesCount * 20)),
      currentVolume: `${ngPackagesCount} packages`,
      maxVolume: '500 pkgs/day',
      imageUrl: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=2074&auto=format&fit=crop',
      staff: [
        { initials: 'NG', color: '#D95D10', name: 'Lagos Logistics Team' },
      ],
    },
    {
      id: 'f3',
      code: 'NG-ABJ-02',
      name: 'Abuja Express Station',
      location: 'Abuja, Nigeria',
      country: 'NG',
      status: 'active',
      capacityUtilization: 35,
      currentVolume: 'Ready for dispatch',
      maxVolume: '300 pkgs/day',
      imageUrl: 'https://images.unsplash.com/photo-1580674684081-776d3f27f292?q=80&w=2070&auto=format&fit=crop',
      staff: [
        { initials: 'AB', color: '#0A1128', name: 'Abuja Station Agent' },
      ],
    }
  ];

  return (
    <div className="animate-fade-in-up max-w-[1400px] mx-auto pb-20 mt-4 px-4">
      
      {/* Top Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card bordered={false} className="shadow-sm rounded-xl bg-slate-50 border border-slate-100">
          <div className="text-slate-500 font-bold text-xs tracking-wider uppercase mb-2">Active Facilities</div>
          <div className="text-4xl font-extrabold text-[#0A1128]">3</div>
          <div className="text-brand-orange text-sm font-medium mt-2 flex items-center gap-1">
            China & Nigeria Hubs
          </div>
        </Card>

        <Card bordered={false} className="shadow-sm rounded-xl bg-slate-50 border border-slate-100">
          <div className="text-slate-500 font-bold text-xs tracking-wider uppercase mb-2">China Inbound Volume</div>
          <div className="text-4xl font-extrabold text-[#0A1128]">{cnPackagesCount}</div>
          <div className="text-slate-500 text-sm font-medium mt-2">
            Received in Guangzhou
          </div>
        </Card>

        <Card bordered={false} className="shadow-sm rounded-xl bg-slate-50 border border-slate-100">
          <div className="text-slate-500 font-bold text-xs tracking-wider uppercase mb-2">Nigeria Hub Storage</div>
          <div className="text-4xl font-extrabold text-[#0A1128]">{ngPackagesCount}</div>
          <div className="text-brand-orange text-sm font-medium mt-2 flex items-center gap-2">
            <EnvironmentOutlined /> Ready for pickup/dispatch
          </div>
        </Card>

        <Card bordered={false} className="shadow-sm rounded-xl bg-slate-50 border border-slate-100">
          <div className="text-slate-500 font-bold text-xs tracking-wider uppercase mb-2">Total System Packages</div>
          <div className="text-4xl font-extrabold text-[#0A1128]">{allPackages.length}</div>
          <div className="text-green-600 text-sm font-medium mt-2 flex items-center gap-1">
            Tracked in Database
          </div>
        </Card>
      </div>

      {/* Grid View */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {facilities.map(facility => (
          <Card 
            key={facility.id} 
            bordered={false} 
            className="shadow-md rounded-xl overflow-hidden hover:shadow-lg transition-shadow duration-300 border border-slate-100 flex flex-col h-full body-no-padding"
            styles={{ body: { padding: 0, display: 'flex', flexDirection: 'column', height: '100%' } }}
          >
            <div className="relative h-48 bg-slate-200">
              <img src={facility.imageUrl} alt={facility.name} className="w-full h-full object-cover" />
              <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2 shadow-sm">
                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                <span className="text-slate-700 tracking-wider uppercase">
                  OPERATIONAL
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
                  <span className="text-xs font-bold text-slate-500 tracking-wider uppercase">Hub Volume</span>
                  <span className="text-xs font-bold text-slate-700">{facility.currentVolume}</span>
                </div>
                <Progress 
                  percent={facility.capacityUtilization} 
                  showInfo={false} 
                  strokeColor="#0A1128"
                  railColor="#f1f5f9"
                  className="mb-1"
                />
                <div className="text-right text-xs text-slate-400 font-medium mb-4">
                  Max capacity: {facility.maxVolume}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

    </div>
  );
};
