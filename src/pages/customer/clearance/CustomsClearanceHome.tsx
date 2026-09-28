import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Card, Tag, Skeleton, Badge } from 'antd';
import {
  SafetyCertificateOutlined,
  FileTextOutlined,
  SyncOutlined,
  CheckCircleOutlined,
  PlusOutlined,
  UnorderedListOutlined,
  ArrowRightOutlined,
  InfoCircleOutlined,
  RocketOutlined,
} from '@ant-design/icons';
import { clearanceService } from '../../../services/clearanceService';
import { STATUS_DESCRIPTIONS, type ClearanceRequest } from '../../../types/clearance';
import { formatDate } from '../../../utils/formatters';

export const CustomsClearanceHome: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeRequests, setActiveRequests] = useState<ClearanceRequest[]>([]);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setLoading(true);
        const data = await clearanceService.getRequests('ACTIVE');
        setActiveRequests(data || []);
      } catch (err) {
        console.error('Failed to load clearance requests', err);
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, []);

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0A1128] via-[#1C2541] to-[#0A1128] p-6 sm:p-10 text-white shadow-xl">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-brand-orange/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl">
          <Tag className="bg-brand-orange text-white border-none font-bold text-xs uppercase tracking-widest px-3 py-1 rounded-full mb-4">
            NIGERIAN CUSTOMS CLEARANCE
          </Tag>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white mb-3 leading-tight">
            Customs Clearance
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-6">
            Get help clearing your imported goods through Nigerian customs safely, quickly, and transparently.
          </p>
          
          <div className="flex flex-wrap items-center gap-3">
            <Button
              type="primary"
              size="large"
              onClick={() => navigate('/customer/customs-clearance/new')}
              icon={<PlusOutlined />}
              className="!bg-brand-orange hover:!bg-brand-orange/90 !border-none font-bold !h-12 !px-6 rounded-xl shadow-lg flex items-center gap-2"
            >
              Request Customs Clearance
            </Button>
            <Button
              size="large"
              onClick={() => navigate('/customer/customs-clearance/my-requests')}
              icon={<UnorderedListOutlined />}
              className="!bg-white/10 hover:!bg-white/20 !text-white !border-white/20 font-bold !h-12 !px-6 rounded-xl flex items-center gap-2"
            >
              My Clearance Requests
            </Button>
          </div>
        </div>
      </div>

      {/* Active Clearance Requests Banner if any exist */}
      {!loading && activeRequests.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
              <SyncOutlined spin className="text-brand-orange" />
              Active Clearance Requests ({activeRequests.length})
            </h2>
            <Link
              to="/customer/customs-clearance/my-requests"
              className="text-xs font-bold text-brand-orange hover:underline flex items-center gap-1"
            >
              View All <ArrowRightOutlined />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeRequests.slice(0, 2).map((req) => {
              const statusInfo = STATUS_DESCRIPTIONS[req.status] || {
                label: req.status,
                badgeColor: 'bg-slate-100 text-slate-700',
              };
              return (
                <Card
                  key={req.id}
                  className="rounded-2xl border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer"
                  onClick={() => navigate(`/customer/customs-clearance/requests/${req.id}`)}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">
                        Request ID
                      </span>
                      <span className="text-base font-extrabold text-brand-navy">
                        {req.requestNumber}
                      </span>
                    </div>
                    <span
                      className={`text-xs font-bold px-3 py-1 rounded-full border ${statusInfo.badgeColor}`}
                    >
                      {statusInfo.label}
                    </span>
                  </div>

                  <div className="space-y-1 text-xs text-slate-600 mb-4">
                    <p className="m-0 font-bold text-slate-800">
                      {req.items && req.items.length > 0
                        ? req.items.map((i) => i.productName).join(', ')
                        : 'Imported Cargo'}
                    </p>
                    <p className="m-0 text-slate-500">
                      Port: <span className="font-semibold text-slate-700">{req.portOfEntry}</span> • Type: <span className="font-semibold text-slate-700 capitalize">{req.shipmentType}</span>
                    </p>
                    <p className="m-0 text-slate-400 text-[11px]">
                      Submitted on {formatDate(req.createdAt)}
                    </p>
                  </div>

                  <Button
                    type="primary"
                    block
                    className="!bg-brand-navy hover:!bg-brand-navy/90 font-bold h-9 rounded-lg text-xs flex items-center justify-center gap-2"
                  >
                    Track Clearance Progress <ArrowRightOutlined />
                  </Button>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* How it works section */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm">
        <div className="text-center max-w-xl mx-auto mb-10">
          <Tag className="bg-blue-50 text-blue-700 border-blue-200 font-bold text-[10px] uppercase tracking-widest px-2.5 py-0.5 rounded-full mb-2">
            SIMPLE WORKFLOW
          </Tag>
          <h2 className="text-2xl font-extrabold text-slate-800">
            How Customs Clearance Works
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            4 simple steps to have your cargo cleared through Nigerian ports &amp; airports.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {[
            {
              step: '1',
              title: 'Submit your shipment details',
              desc: 'Tell us about the goods you imported, shipment type, and port of entry.',
              icon: <FileTextOutlined className="text-2xl text-blue-600" />,
              bg: 'bg-blue-50',
            },
            {
              step: '2',
              title: 'Upload your documents',
              desc: 'Provide your invoice, packing list, Bill of Lading or Air Waybill.',
              icon: <SafetyCertificateOutlined className="text-2xl text-indigo-600" />,
              bg: 'bg-indigo-50',
            },
            {
              step: '3',
              title: 'We process your clearance',
              desc: 'Your request is reviewed and handled through official clearance procedures.',
              icon: <SyncOutlined className="text-2xl text-amber-600" />,
              bg: 'bg-amber-50',
            },
            {
              step: '4',
              title: 'Track & receive your goods',
              desc: 'Receive live updates, pay verified charges, and get your cargo delivered.',
              icon: <CheckCircleOutlined className="text-2xl text-emerald-600" />,
              bg: 'bg-emerald-50',
            },
          ].map((st) => (
            <div
              key={st.step}
              className="bg-slate-50/60 rounded-xl p-5 border border-slate-200/80 flex flex-col justify-between relative"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl ${st.bg} flex items-center justify-center`}>
                    {st.icon}
                  </div>
                  <span className="text-2xl font-black text-slate-300">0{st.step}</span>
                </div>
                <h3 className="font-extrabold text-slate-800 text-sm mb-1.5">
                  {st.title}
                </h3>
                <p className="text-slate-500 text-xs leading-relaxed m-0">
                  {st.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Info Callout */}
      <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-5 flex items-start gap-4">
        <InfoCircleOutlined className="text-amber-600 text-xl shrink-0 mt-0.5" />
        <div className="text-xs text-amber-900 leading-relaxed">
          <p className="font-bold mb-1 text-sm">Need help clearing goods without full documentation?</p>
          <p className="m-0 text-amber-800">
            Even if you do not have all shipping documents (like Form M or PAAR) available immediately, you can still submit a clearance request. Select <span className="font-semibold">&quot;I don&apos;t have this document&quot;</span> and our documentation team will assist you.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CustomsClearanceHome;
