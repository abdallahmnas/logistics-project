import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Input, Button, Timeline, Card, Progress } from 'antd';
import { 
  RocketOutlined, 
  SearchOutlined, 
  EnvironmentOutlined,
  CalculatorOutlined,
  ClockCircleOutlined,
  ArrowRightOutlined,
  ExportOutlined
} from '@ant-design/icons';
import apiClient from '../../api/axios';
import { StatusBadge } from '../../components/common/StatusBadge';
import { formatDate } from '../../utils/formatters';

const { Search } = Input;

export const TrackingPublicPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialId = searchParams.get('id') || '';
  
  const [trackingId, setTrackingId] = useState(initialId);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [searched, setSearched] = useState(!!initialId);

  useEffect(() => {
    if (initialId) {
      handleSearch(initialId);
    }
  }, []);

  const handleSearch = async (value: string) => {
    if (!value.trim()) return;
    
    setLoading(true);
    setSearched(true);
    setSearchParams({ id: value });
    
    try {
      const res = await apiClient.get(`/shipments/tracking/${encodeURIComponent(value.trim())}`);
      setResult(res.data.data);
    } catch (e) {
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const generateTimelineItems = (pkg: any) => {
    const items = [];
    
    if (pkg.preAlertDate) items.push({ color: 'gray', children: (<div><p className="font-bold text-slate-800 m-0 text-sm">Pre-Alert Created</p><p className="text-xs text-slate-500 m-0 mt-1">{formatDate(pkg.preAlertDate)}</p></div>) });
    if (pkg.receivedDate) items.push({ color: 'blue', children: (<div><p className="font-bold text-slate-800 m-0 text-sm">Received at China Hub</p><p className="text-xs text-slate-500 m-0 mt-1">{formatDate(pkg.receivedDate)}</p></div>) });
    if (pkg.shippedDate) items.push({ color: '#E8590C', children: (<div><p className="font-bold text-slate-800 m-0 text-sm">Departed China</p><p className="text-xs text-slate-500 m-0 mt-1">{formatDate(pkg.shippedDate)}</p></div>) });
    if (pkg.arrivedDate) items.push({ color: 'green', children: (<div><p className="font-bold text-slate-800 m-0 text-sm">Arrived at Destination</p><p className="text-xs text-slate-500 m-0 mt-1">{formatDate(pkg.arrivedDate)}</p></div>) });
    if (pkg.deliveredDate) {
      items.push({ color: 'green', dot: <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center -ml-1"><RocketOutlined className="text-green-600 text-xs" /></div>, children: (<div><p className="font-bold text-green-600 m-0 text-sm">Delivered</p><p className="text-xs text-slate-500 m-0 mt-1">{formatDate(pkg.deliveredDate)}</p></div>) });
    } else {
      items.push({ color: 'blue', dot: <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse-slow"></div>, children: (<div><p className="font-bold text-brand-navy m-0 text-sm mb-2">Current Status</p><StatusBadge module="shipment" status={pkg.status} type="badge" /></div>) });
    }

    return items;
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col relative overflow-hidden">
      
      {/* Tracking Search Area (Simplified without big navy background to fit the new design below) */}
      <div className="bg-brand-navy pb-8 pt-12 relative z-10">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h1 className="text-3xl font-bold text-white mb-6">Track Your Shipment</h1>
          <div className="bg-white/10 backdrop-blur-md p-2 rounded-xl max-w-2xl mx-auto border border-white/20">
            <Search
              placeholder="Enter Tracking ID"
              allowClear
              enterButton={
                <Button type="primary" className="!bg-brand-orange hover:!bg-orange-600 !border-brand-orange !h-12 !px-8 font-bold !rounded-r-lg">
                  Track Shipment
                </Button>
              }
              size="large"
              value={trackingId}
              onChange={(e) => setTrackingId(e.target.value)}
              onSearch={handleSearch}
              loading={loading}
              className="rounded-lg h-12"
              styles={{ input: { height: '48px', fontSize: '16px', background: 'white' } }}
            />
          </div>
        </div>
      </div>

      {/* Main Dashboard Area (from Mockup) */}
      <div className="container mx-auto px-4 lg:px-8 max-w-7xl relative z-10 py-10 flex-1">
        
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-2">
            <h1 className="text-3xl font-extrabold text-brand-navy m-0">Shipment Dashboard</h1>
            <span className="bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">Live Updates</span>
          </div>
          <p className="text-slate-500 text-lg">
            Monitor your active cargo, calculate new routes, and review past logistics<br/>performance in real-time.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Content Area - Left 2/3 */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Active Consignment Card */}
            <Card className="shadow-lg border-none rounded-2xl bg-slate-100 overflow-hidden">
              <div className="flex justify-between items-start mb-10">
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Active Consignment</p>
                  <h2 className="text-4xl font-extrabold text-brand-navy m-0 flex items-center gap-3">
                    AWB-7749201-X
                    <span className="text-brand-orange animate-pulse">
                       <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20V4"/><path d="m15 15-3 5-3-5"/><path d="m15 9-3-5-3 5"/></svg>
                    </span>
                  </h2>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Estimated Arrival</p>
                  <h2 className="text-2xl font-bold text-brand-navy m-0">OCT 24, 14:00 LST</h2>
                </div>
              </div>

              {/* Progress Bar Area */}
              <div className="mb-10 relative px-4">
                 <div className="flex justify-between items-end mb-2 text-sm font-bold">
                   <div className="text-brand-navy">
                     <p className="text-xs text-slate-500 mb-0.5">Origin</p>
                     Shanghai (PVG)
                   </div>
                   <div className="text-brand-navy text-right">
                     <p className="text-xs text-slate-500 mb-0.5">Destination</p>
                     Frankfurt (FRA)
                   </div>
                 </div>

                 {/* Stepper text */}
                 <div className="flex justify-between text-xs font-bold uppercase tracking-wider mb-2 mt-8">
                   <span className="text-brand-navy">Booked</span>
                   <span className="text-brand-navy absolute left-[30%]">In Transit</span>
                   <span className="text-brand-orange absolute left-[65%] -translate-x-1/2">Customs</span>
                   <span className="text-slate-400">Delivery</span>
                 </div>
                 
                 {/* Progress Bar */}
                 <div className="h-3 bg-slate-200 rounded-full w-full overflow-hidden flex">
                    <div className="bg-brand-navy h-full w-[65%]" />
                 </div>
                 <p className="text-right text-[10px] text-slate-500 mt-2 tracking-widest uppercase">
                   Status: HELD AT CUSTOMS - CLEARANCE PENDING
                 </p>
              </div>

              <div className="flex justify-between items-center border-t border-slate-200 pt-5">
                 <Button className="!bg-slate-200/50 hover:!bg-slate-200 !border-slate-300 font-bold text-slate-700 !h-9">
                   View Full Manifest
                 </Button>
                 <span className="text-xs text-slate-500 flex items-center gap-1.5 font-medium">
                   <ClockCircleOutlined /> Last updated: 12 mins ago
                 </span>
              </div>
            </Card>

            {/* Recent Consignments */}
            <Card className="shadow-lg border-none rounded-2xl bg-slate-100 p-0 overflow-hidden">
               <div className="p-6 pb-2 flex justify-between items-center">
                 <h2 className="text-2xl font-bold text-slate-800 m-0">Recent Consignments</h2>
                 <button className="text-sm font-bold text-slate-600 hover:text-brand-navy flex items-center gap-1">
                   View All <ArrowRightOutlined />
                 </button>
               </div>
               
               <div className="w-full overflow-x-auto">
                 <table className="w-full text-left border-collapse">
                   <thead>
                     <tr className="border-b border-slate-200 text-xs uppercase tracking-widest text-slate-500">
                       <th className="px-6 py-4 font-bold">Tracking ID</th>
                       <th className="px-6 py-4 font-bold">Route</th>
                       <th className="px-6 py-4 font-bold">Date</th>
                       <th className="px-6 py-4 font-bold text-right">Status</th>
                     </tr>
                   </thead>
                   <tbody className="text-sm">
                     <tr className="border-b border-slate-200/50 hover:bg-white/50 transition-colors">
                       <td className="px-6 py-5 font-mono text-xs text-slate-600 font-bold">OCN-8821-A</td>
                       <td className="px-6 py-5 text-slate-800">Rotterdam &rarr; New York</td>
                       <td className="px-6 py-5 text-slate-600">Oct 12, 2024</td>
                       <td className="px-6 py-5 text-right">
                         <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-200 text-slate-600 text-xs font-bold">
                           <span className="w-1.5 h-1.5 rounded-full bg-slate-500" /> Delivered
                         </span>
                       </td>
                     </tr>
                     <tr className="border-b border-slate-200/50 hover:bg-white/50 transition-colors">
                       <td className="px-6 py-5 font-mono text-xs text-slate-600 font-bold">AIR-3390-B</td>
                       <td className="px-6 py-5 text-slate-800">Dubai &rarr; London</td>
                       <td className="px-6 py-5 text-slate-600">Oct 15, 2024</td>
                       <td className="px-6 py-5 text-right">
                         <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-100 text-red-600 text-xs font-bold">
                           <span className="w-1.5 h-1.5 rounded-full bg-red-500" /> Exception
                         </span>
                       </td>
                     </tr>
                     <tr className="hover:bg-white/50 transition-colors">
                       <td className="px-6 py-5 font-mono text-xs text-slate-600 font-bold">LND-5512-C</td>
                       <td className="px-6 py-5 text-slate-800">Berlin &rarr; Paris</td>
                       <td className="px-6 py-5 text-slate-600">Oct 18, 2024</td>
                       <td className="px-6 py-5 text-right">
                         <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-200 text-slate-600 text-xs font-bold">
                           <span className="w-1.5 h-1.5 rounded-full bg-slate-500" /> Delivered
                         </span>
                       </td>
                     </tr>
                   </tbody>
                 </table>
               </div>
            </Card>

          </div>

          {/* Right Sidebar - 1/3 */}
          <div className="space-y-6">
            
            {/* Cost Calculator */}
            <Card className="shadow-lg border-none rounded-2xl bg-brand-navy text-white overflow-hidden p-6 relative group cursor-pointer hover:bg-slate-800 transition-colors">
               <ArrowRightOutlined className="absolute top-6 right-6 text-slate-400 group-hover:text-white transition-colors" />
               <CalculatorOutlined className="text-3xl mb-4 text-white" />
               <h3 className="text-2xl font-bold mb-2">Cost Calculator</h3>
               <p className="text-slate-300 text-sm leading-relaxed mb-0">
                 Estimate freight rates across ocean, air, and ground networks instantly.
               </p>
            </Card>

            {/* Transit Time Checker */}
            <Card className="shadow-lg border-none rounded-2xl bg-slate-100 overflow-hidden p-6 relative group cursor-pointer hover:bg-slate-200 transition-colors">
               <ExportOutlined className="absolute top-6 right-6 text-slate-400 group-hover:text-slate-800 transition-colors" />
               <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                 <ClockCircleOutlined className="text-blue-600 text-lg" />
               </div>
               <h3 className="text-xl font-bold text-slate-800 mb-2">Transit Time Checker</h3>
               <p className="text-slate-500 text-sm leading-relaxed mb-0">
                 Verify operational schedules and port-to-port ETAs for upcoming shipments.
               </p>
            </Card>

            {/* Map Card */}
            <Card className="shadow-lg border-none rounded-2xl p-0 overflow-hidden relative h-56 group cursor-pointer">
               <div className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105" style={{backgroundImage: "url('https://maps.googleapis.com/maps/api/staticmap?center=Frankfurt,Germany&zoom=11&size=600x300&maptype=roadmap&style=element:geometry%7Ccolor:0x242f3e&style=element:labels.text.stroke%7Ccolor:0x242f3e&style=element:labels.text.fill%7Ccolor:0x746855&key=YOUR_API_KEY')"}}>
                 {/* Fallback pattern */}
                 <div className="w-full h-full bg-slate-200/50 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
               </div>
               
               <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
               
               <div className="absolute bottom-4 left-4 right-4">
                 <p className="text-[10px] font-bold text-white/70 uppercase tracking-widest mb-1">Destination Hub</p>
                 <h3 className="text-lg font-bold text-white mb-2">FRA Logistics Center</h3>
                 <span className="inline-flex items-center gap-1.5 text-xs text-white/90">
                   <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                   Operational
                 </span>
               </div>
            </Card>
          </div>

        </div>
        
        {/* Render Search Results Below Dashboard (if any) */}
        {searched && !loading && (
          <div className="mt-12 transition-all animate-fade-in-up">
            {result ? (
               <Card className="shadow-xl border-slate-200 rounded-2xl overflow-hidden p-0 bg-white">
               <div className="bg-slate-50 border-b border-slate-200 p-8">
                 <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                   <div className="flex items-start gap-5">
                     <div className="w-14 h-14 bg-brand-navy rounded-xl flex items-center justify-center shrink-0">
                       <EnvironmentOutlined className="text-2xl text-brand-orange" />
                     </div>
                     <div>
                       <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Tracking Number</p>
                       <h2 className="text-2xl font-bold text-slate-800 m-0">{result.trackingId}</h2>
                       {result.chineseTrackingNo && (
                         <p className="text-slate-500 text-sm mt-1">Ref: <span className="font-mono text-slate-700">{result.chineseTrackingNo}</span></p>
                       )}
                     </div>
                   </div>
                   <div className="bg-white px-5 py-3 rounded-xl border border-slate-200 shadow-sm">
                     <StatusBadge module="shipment" status={result.status} type="badge" />
                   </div>
                 </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-5 divide-y md:divide-y-0 md:divide-x divide-slate-100">
                 <div className="md:col-span-3 p-8">
                   <h3 className="text-lg font-bold text-slate-800 mb-8 flex items-center gap-2">
                     <RocketOutlined className="text-brand-orange" /> Tracking Timeline
                   </h3>
                   <Timeline items={generateTimelineItems(result)} className="ml-2" />
                 </div>
                 
                 <div className="md:col-span-2 bg-slate-50/50 p-8">
                   <h3 className="text-lg font-bold text-slate-800 mb-6">Shipment Details</h3>
                   <div className="space-y-6">
                     <div>
                       <span className="text-slate-400 block text-xs font-bold uppercase tracking-wider mb-1">Description</span>
                       <span className="font-medium text-slate-800 bg-white px-3 py-1.5 rounded-md border border-slate-200 inline-block w-full">{result.description}</span>
                     </div>
                     <div className="grid grid-cols-2 gap-4">
                       <div>
                         <span className="text-slate-400 block text-xs font-bold uppercase tracking-wider mb-1">Method</span>
                         <span className="font-medium text-slate-800 uppercase bg-white px-3 py-1.5 rounded-md border border-slate-200 inline-block w-full">{result.shippingMethod || 'TBD'}</span>
                       </div>
                       <div>
                         <span className="text-slate-400 block text-xs font-bold uppercase tracking-wider mb-1">Destination</span>
                         <span className="font-medium text-slate-800 capitalize bg-white px-3 py-1.5 rounded-md border border-slate-200 inline-block w-full">{result.destinationWarehouse || 'TBD'}</span>
                       </div>
                     </div>
                     {result.weightKg > 0 && (
                       <div>
                         <span className="text-slate-400 block text-xs font-bold uppercase tracking-wider mb-1">Recorded Weight</span>
                         <span className="font-medium text-slate-800 bg-white px-3 py-1.5 rounded-md border border-slate-200 inline-block w-full">{result.weightKg} KG</span>
                       </div>
                     )}
                   </div>
                   
                   <div className="mt-10 pt-6 border-t border-slate-200">
                     <p className="text-sm text-slate-500 text-center">
                       Need more details? <Link to="/login" className="text-brand-orange font-semibold hover:underline">Log in to dashboard</Link>
                     </p>
                   </div>
                 </div>
               </div>
             </Card>
            ) : (
              <Card className="shadow-xl border-none rounded-2xl p-12 text-center bg-white max-w-3xl mx-auto">
                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <SearchOutlined className="text-3xl text-slate-400" />
                </div>
                <h3 className="text-2xl font-bold text-slate-800 mb-2">Shipment Not Found</h3>
                <p className="text-slate-500 mb-8 max-w-md mx-auto">
                  We couldn't find a package matching that tracking number. Please verify the number and try again.
                </p>
              </Card>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
