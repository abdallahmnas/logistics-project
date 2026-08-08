import React, { useState } from 'react';
import { Card, Switch, Button, Radio } from 'antd';
import { MailOutlined, MessageOutlined, WhatsAppOutlined, EditOutlined, SoundOutlined, ClockCircleOutlined, PushpinOutlined, MoneyCollectOutlined, UserAddOutlined, AlertOutlined } from '@ant-design/icons';

export const NotificationPreferences: React.FC = () => {
  const [deliveryFrequency, setDeliveryFrequency] = useState('instant');

  return (
    <div className="animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <div className="text-[10px] font-bold tracking-widest text-slate-500 uppercase mb-2 flex items-center gap-2">
            <span className="text-sm">⚙️</span> System Settings
          </div>
          <h1 className="text-4xl font-extrabold text-[#0A1128] m-0 mb-2 tracking-tight">Notification Preferences</h1>
          <p className="text-slate-600 text-base m-0 max-w-2xl leading-relaxed">
            Manage how and when your system administrators receive alerts for mission-critical logistics events.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-20">
        <div className="lg:col-span-2 space-y-6">
          
          {/* Event Triggers */}
          <Card bordered={false} className="shadow-sm border border-slate-100 rounded-xl bg-slate-50" bodyStyle={{ padding: '24px' }}>
            <h2 className="text-lg font-bold text-[#0A1128] m-0 mb-6 flex items-center gap-3">
              <SoundOutlined /> Event Triggers
            </h2>

            <div className="space-y-4">
              {/* Trigger 1 */}
              <div className="bg-white p-5 rounded-xl border border-slate-100">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center mt-1">
                      <PushpinOutlined />
                    </div>
                    <div>
                      <h3 className="font-bold text-[#0A1128] m-0 mb-1">Shipment Status Changes</h3>
                      <p className="text-sm text-slate-500 m-0 leading-relaxed">
                        Triggers when a shipment moves between key phases (Dispatched, In Transit, Delivered).
                      </p>
                    </div>
                  </div>
                  <Switch defaultChecked className="bg-[#0A1128]" />
                </div>
                <div className="flex gap-2 ml-11">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-[#0A1128] text-white text-[10px] font-bold uppercase tracking-wider">
                    <MailOutlined /> Email
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-[#0A1128] text-white text-[10px] font-bold uppercase tracking-wider">
                    <MessageOutlined /> SMS
                  </span>
                </div>
              </div>

              {/* Trigger 2 */}
              <div className="bg-white p-5 rounded-xl border border-slate-100">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-orange-50 text-brand-orange flex items-center justify-center mt-1">
                      <MoneyCollectOutlined />
                    </div>
                    <div>
                      <h3 className="font-bold text-[#0A1128] m-0 mb-1">Financial Transactions</h3>
                      <p className="text-sm text-slate-500 m-0 leading-relaxed">
                        Alerts for completed payments, invoice generation, and failed transactions.
                      </p>
                    </div>
                  </div>
                  <Switch defaultChecked className="bg-[#0A1128]" />
                </div>
                <div className="flex gap-2 ml-11">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-[#0A1128] text-white text-[10px] font-bold uppercase tracking-wider">
                    <MailOutlined /> Email
                  </span>
                </div>
              </div>

              {/* Trigger 3 */}
              <div className="bg-white p-5 rounded-xl border border-slate-100 opacity-60 grayscale">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mt-1">
                      <UserAddOutlined />
                    </div>
                    <div>
                      <h3 className="font-bold text-[#0A1128] m-0 mb-1">New User Registration</h3>
                      <p className="text-sm text-slate-500 m-0 leading-relaxed">
                        Requires manual admin approval when new sub-contractors sign up.
                      </p>
                    </div>
                  </div>
                  <Switch checked={false} />
                </div>
                <div className="flex gap-2 ml-11">
                  <span className="inline-flex items-center px-3 py-1 rounded bg-slate-100 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                    None Configured
                  </span>
                </div>
              </div>

              {/* Trigger 4 */}
              <div className="bg-white p-5 rounded-xl border border-slate-100">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-red-50 text-red-500 flex items-center justify-center mt-1">
                      <AlertOutlined />
                    </div>
                    <div>
                      <h3 className="font-bold text-[#0A1128] m-0 mb-1">Critical Support Tickets</h3>
                      <p className="text-sm text-slate-500 m-0 leading-relaxed">
                        High-priority escalations regarding delayed or damaged cargo.
                      </p>
                    </div>
                  </div>
                  <Switch defaultChecked className="bg-[#0A1128]" />
                </div>
                <div className="flex gap-2 ml-11">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-[#0A1128] text-white text-[10px] font-bold uppercase tracking-wider">
                    <MailOutlined /> Email
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-[#0A1128] text-white text-[10px] font-bold uppercase tracking-wider">
                    <WhatsAppOutlined /> WhatsApp
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-[#0A1128] text-white text-[10px] font-bold uppercase tracking-wider">
                    🔔 Push
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* Delivery Frequency */}
          <Card bordered={false} className="shadow-sm border border-slate-100 rounded-xl bg-slate-50" bodyStyle={{ padding: '24px' }}>
            <h2 className="text-lg font-bold text-[#0A1128] m-0 mb-6 flex items-center gap-3">
              <ClockCircleOutlined /> Delivery Frequency
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div 
                className={`p-5 rounded-xl border-2 cursor-pointer transition-all ${deliveryFrequency === 'instant' ? 'bg-blue-50/50 border-blue-500' : 'bg-white border-transparent hover:border-slate-300'}`}
                onClick={() => setDeliveryFrequency('instant')}
              >
                <div className="flex items-center gap-3 mb-2">
                  <Radio checked={deliveryFrequency === 'instant'} />
                  <span className="font-bold text-[#0A1128]">Instant Delivery</span>
                </div>
                <p className="text-sm text-slate-500 m-0 leading-relaxed pl-7">
                  Send notifications immediately as events occur in the system. Best for urgent updates.
                </p>
              </div>

              <div 
                className={`p-5 rounded-xl border-2 cursor-pointer transition-all ${deliveryFrequency === 'digest' ? 'bg-blue-50/50 border-blue-500' : 'bg-white border-transparent hover:border-slate-300'}`}
                onClick={() => setDeliveryFrequency('digest')}
              >
                <div className="flex items-center gap-3 mb-2">
                  <Radio checked={deliveryFrequency === 'digest'} />
                  <span className="font-bold text-[#0A1128]">Daily Digest</span>
                </div>
                <p className="text-sm text-slate-500 m-0 leading-relaxed pl-7">
                  Roll up non-critical events into a single email delivered at 08:00 UTC daily.
                </p>
              </div>
            </div>
          </Card>

        </div>

        {/* Right Column */}
        <div className="lg:col-span-1 space-y-6">
          {/* Templates Card */}
          <Card bordered={false} className="shadow-md border-none rounded-xl bg-[#0A1128] text-white" bodyStyle={{ padding: '24px' }}>
            <h3 className="text-lg font-bold mb-2 text-white">Notification Templates</h3>
            <p className="text-xs text-blue-200 mb-6 leading-relaxed">
              Customize the copy and branding of outbound alerts.
            </p>
            
            <div className="space-y-3 mb-6">
              {[
                'Shipment_Dispatched.html',
                'Invoice_Generated.html',
                'Support_Escalation.txt'
              ].map((tmpl, idx) => (
                <div key={idx} className="bg-white/10 p-3 rounded flex justify-between items-center hover:bg-white/20 transition-colors cursor-pointer">
                  <span className="text-sm font-bold">{tmpl}</span>
                  <EditOutlined className="text-blue-300" />
                </div>
              ))}
            </div>

            <Button className="w-full h-10 bg-white text-[#0A1128] border-none font-bold">
              Open Template Editor
            </Button>
          </Card>

          {/* Channel Status */}
          <Card bordered={false} className="shadow-sm border border-slate-100 rounded-xl bg-slate-50" bodyStyle={{ padding: '24px' }}>
            <h3 className="text-base font-bold text-[#0A1128] m-0 mb-4">Channel Status</h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-500 flex items-center gap-2"><MailOutlined /> Email (SendGrid)</span>
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-500 flex items-center gap-2"><MessageOutlined /> SMS (Twilio)</span>
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-500 flex items-center gap-2"><WhatsAppOutlined /> WhatsApp API</span>
                <span className="w-2 h-2 rounded-full bg-yellow-400"></span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Footer Bar */}
      <div className="fixed bottom-0 left-0 lg:left-[264px] right-0 bg-white border-t border-slate-200 p-4 px-8 flex justify-end items-center z-20 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <div className="flex gap-3">
          <Button size="large" className="font-bold border-slate-200 text-slate-600 bg-white">
            Discard Changes
          </Button>
          <Button type="primary" size="large" className="bg-[#0A1128] hover:bg-[#1a2542] border-none font-bold px-8">
            Save Preferences
          </Button>
        </div>
      </div>
    </div>
  );
};
