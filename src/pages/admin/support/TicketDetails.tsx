import React from 'react';
import { Button, Input, Avatar, Switch, Card, Tag } from 'antd';
import { UserOutlined, EyeInvisibleOutlined, BoldOutlined, ItalicOutlined, LinkOutlined, PaperClipOutlined, SendOutlined, FilePdfOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';

const { TextArea } = Input;

export const TicketDetails: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <div className="animate-fade-in-up max-w-[1200px] mx-auto py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-[#0A1128] m-0 mb-3 tracking-tight">Delayed Shipment</h1>
          <div className="flex gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border border-brand-orange text-brand-orange bg-orange-50/30">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-orange"></span> In Progress
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-50 text-red-500">
              <span className="text-red-500">!</span> High Priority
            </span>
          </div>
        </div>
        <div className="flex gap-3">
          <Button size="large" className="font-bold border-slate-200 text-slate-600 bg-slate-50 flex items-center gap-2">
            <UserOutlined /> Assign
          </Button>
          <Button type="primary" size="large" className="bg-[#0A1128] hover:bg-[#1a2542] border-none font-bold shadow-md flex items-center gap-2">
            <CheckCircleOutlined /> Resolve
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content (Chat Log) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Message 1 (Customer) */}
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 border border-slate-200 shrink-0">
              <UserOutlined />
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-end mb-2">
                <div>
                  <span className="font-bold text-[#0A1128] text-base mr-2">Sarah Jenkins</span>
                  <span className="text-xs text-slate-500 font-medium">Customer</span>
                </div>
                <span className="text-xs text-slate-400">Oct 24, 09:15 AM</span>
              </div>
              <div className="bg-slate-50 p-5 rounded-xl rounded-tl-none border border-slate-100 text-sm text-slate-600 leading-relaxed">
                Hi there, my tracking number (GL-9932-XYZ) has been stuck on "Processing at Hub" for the last three days. This is a time-sensitive delivery for a trade show. Can you please provide an update? I've attached the original invoice for reference.
                
                <div className="mt-4 flex gap-3">
                  <div className="bg-slate-200/50 p-2 pr-4 rounded-lg flex items-center gap-3 border border-slate-200 w-max">
                    <FilePdfOutlined className="text-red-500 text-2xl" />
                    <div>
                      <div className="text-sm font-bold text-[#0A1128]">invoice_5521.pdf</div>
                      <div className="text-xs text-slate-500">1.2 MB</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Message 2 (System Log) */}
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-lg bg-[#0A1128] flex items-center justify-center text-blue-300 shrink-0">
              <EyeInvisibleOutlined />
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-end mb-2">
                <div>
                  <span className="font-bold text-[#0A1128] text-base mr-2">System Auto-Log</span>
                  <span className="text-xs text-slate-500 font-medium">Internal</span>
                </div>
                <span className="text-xs text-slate-400">Oct 24, 09:20 AM</span>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl rounded-tl-none border-l-4 border-l-[#0A1128] border-y border-r border-slate-100 text-xs text-slate-500 italic">
                Checking GL-9932-XYZ... Route anomaly detected at Frankfurt Hub due to weather delays. Estimated resolution +24h.
              </div>
            </div>
          </div>

          {/* Message 3 (Agent) */}
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-lg bg-[#0A1128] flex items-center justify-center text-blue-300 shrink-0">
              <Avatar size={32} src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=150&auto=format&fit=crop" />
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-end mb-2">
                <div>
                  <span className="font-bold text-blue-600 text-base mr-2">Marcus Chen</span>
                  <span className="text-xs text-slate-500 font-medium">Support Agent</span>
                </div>
                <span className="text-xs text-slate-400">Oct 24, 10:45 AM</span>
              </div>
              <div className="bg-blue-50/50 p-5 rounded-xl rounded-tl-none border border-blue-100 text-sm text-[#0A1128] leading-relaxed">
                Hello Sarah,
                <br/><br/>
                I apologize for the delay. I've checked the routing for GL-9932-XYZ. There were unforeseen weather complications at our European hub which temporarily grounded flights.
                <br/><br/>
                However, I've escalated this package to priority loading. It is currently being loaded onto the next available flight departing in 3 hours. You should see movement on the tracking page shortly.
              </div>
            </div>
          </div>

          {/* Reply Editor */}
          <Card bordered={false} className="shadow-lg border border-slate-100 rounded-xl overflow-hidden mt-8" bodyStyle={{ padding: 0 }}>
            <div className="bg-slate-50 p-3 border-b border-slate-100 flex justify-between items-center">
              <div className="flex gap-2">
                <Button type="text" icon={<BoldOutlined />} className="text-slate-500" />
                <Button type="text" icon={<ItalicOutlined />} className="text-slate-500" />
                <Button type="text" icon={<LinkOutlined />} className="text-slate-500" />
                <Button type="text" icon={<PaperClipOutlined />} className="text-slate-500" />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-600">Internal Note</span>
                <Switch size="small" />
              </div>
            </div>
            <TextArea 
              rows={4} 
              placeholder="Type your reply..." 
              className="border-none resize-none p-4 text-sm focus:shadow-none"
            />
            <div className="bg-white p-3 px-4 border-t border-slate-100 flex justify-between items-center">
              <span className="text-xs text-slate-400">Draft saved at 11:02 AM</span>
              <Button type="primary" className="bg-[#b34000] hover:bg-[#993600] border-none font-bold px-6 flex items-center gap-2 h-10">
                <SendOutlined /> Send Reply
              </Button>
            </div>
          </Card>

        </div>

        {/* Right Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Customer Profile */}
          <Card bordered={false} className="shadow-sm border border-slate-100 rounded-xl" bodyStyle={{ padding: '24px' }}>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-4">Customer Profile</div>
            <div className="flex items-center gap-3 mb-6">
              <Avatar size={48} className="bg-[#0A1128] font-bold text-lg text-white">SJ</Avatar>
              <div>
                <div className="font-bold text-[#0A1128] text-base">Sarah Jenkins</div>
                <div className="text-xs text-brand-orange font-bold uppercase">Enterprise Tier</div>
              </div>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3 text-slate-600">
                <span className="text-slate-400 w-4">✉</span>
                <span className="font-medium">s.jenkins@corp-logistics.com</span>
              </div>
              <div className="flex items-center gap-3 text-slate-600">
                <span className="text-slate-400 w-4">📞</span>
                <span className="font-medium">+1 (555) 019-2834</span>
              </div>
              <div className="flex items-center gap-3 text-slate-600">
                <span className="text-slate-400 w-4 font-bold">#</span>
                <span className="font-bold text-[#0A1128]">CID-992-811A</span>
              </div>
            </div>
          </Card>

          {/* Ticket Details */}
          <Card bordered={false} className="shadow-sm border border-slate-100 rounded-xl" bodyStyle={{ padding: '24px' }}>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-4">Ticket Details</div>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <div className="text-xs text-slate-500 mb-1">Created</div>
                <div className="font-bold text-[#0A1128] text-sm">Oct 24, 2023</div>
              </div>
              <div>
                <div className="text-xs text-slate-500 mb-1">Category</div>
                <div className="font-bold text-[#0A1128] text-sm">Tracking</div>
              </div>
            </div>

            <div className="mb-6">
              <div className="text-xs text-slate-500 mb-2">Assigned Agent</div>
              <div className="flex items-center gap-2">
                <Avatar size={24} className="bg-blue-600 text-xs font-bold">MC</Avatar>
                <span className="font-bold text-blue-600 text-sm">Marcus Chen</span>
              </div>
            </div>

            <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
              <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-2">Related Shipment</div>
              <div className="font-mono text-sm font-bold text-brand-orange flex items-center gap-2">
                <span className="text-brand-orange">📦</span> GL-9932-XYZ
              </div>
            </div>
          </Card>

          {/* Files */}
          <Card bordered={false} className="shadow-sm border border-slate-100 rounded-xl" bodyStyle={{ padding: '24px' }}>
            <div className="flex justify-between items-center mb-4">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Files</div>
              <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded font-bold">1</span>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 border border-slate-100 rounded-lg p-3 flex flex-col items-center justify-center aspect-square text-center">
                <FilePdfOutlined className="text-red-500 text-3xl mb-2" />
                <div className="text-xs font-bold text-[#0A1128] truncate w-full px-2">invoice_5521.pdf</div>
              </div>
              <div className="border border-dashed border-slate-300 rounded-lg flex items-center justify-center aspect-square cursor-pointer hover:bg-slate-50 transition-colors text-slate-400">
                <span className="text-2xl">+</span>
              </div>
            </div>
          </Card>

        </div>
      </div>
    </div>
  );
};
