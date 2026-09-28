import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button, Card, Tag, Skeleton } from 'antd';
import {
  CheckCircleFilled,
  ArrowRightOutlined,
  UnorderedListOutlined,
  FileTextOutlined,
  CalendarOutlined,
  GlobalOutlined,
  EnvironmentOutlined,
} from '@ant-design/icons';
import { clearanceService } from '../../../services/clearanceService';
import { STATUS_DESCRIPTIONS, type ClearanceRequest } from '../../../types/clearance';
import { formatDate } from '../../../utils/formatters';

export const ClearanceConfirmationPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [request, setRequest] = useState<ClearanceRequest | null>(null);

  useEffect(() => {
    const fetchDetail = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const data = await clearanceService.getRequestById(id);
        setRequest(data);
      } catch (err) {
        console.error('Failed to load request confirmation', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto py-12">
        <Card className="rounded-2xl border-slate-200">
          <Skeleton active avatar paragraph={{ rows: 6 }} />
        </Card>
      </div>
    );
  }

  const statusInfo = request
    ? STATUS_DESCRIPTIONS[request.status] || { label: request.status, badgeColor: 'bg-blue-50 text-blue-700' }
    : { label: 'Submitted', badgeColor: 'bg-blue-50 text-blue-700' };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 space-y-6">
      <Card className="rounded-2xl border-slate-200 shadow-lg text-center p-6 sm:p-10">
        <div className="w-20 h-20 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center text-4xl mx-auto mb-6 shadow-sm">
          <CheckCircleFilled />
        </div>

        <Tag className="bg-emerald-100 text-emerald-800 border-none font-extrabold text-xs uppercase tracking-widest px-3 py-1 rounded-full mb-3">
          REQUEST SUBMITTED
        </Tag>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 mb-2">
          Your customs clearance request has been received.
        </h1>
        <p className="text-slate-500 text-xs sm:text-sm max-w-md mx-auto mb-8 leading-relaxed">
          Our customs documentation team is reviewing your shipment information and uploaded documents.
        </p>

        {/* Confirmation Details Card */}
        {request && (
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 text-left space-y-4 mb-8">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Clearance Request Number
              </span>
              <span className="text-lg font-black text-brand-navy">
                {request.requestNumber}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block mb-0.5">Date Submitted</span>
                <span className="font-bold text-slate-800 flex items-center gap-1">
                  <CalendarOutlined className="text-brand-orange" />
                  {formatDate(request.createdAt)}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Shipment Type</span>
                <span className="font-bold text-slate-800 capitalize flex items-center gap-1">
                  <GlobalOutlined className="text-blue-600" />
                  {request.shipmentType} Freight ({request.originCountry})
                </span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Port of Entry</span>
                <span className="font-bold text-slate-800 flex items-center gap-1">
                  <EnvironmentOutlined className="text-emerald-600" />
                  {request.portOfEntry}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Current Status</span>
                <span
                  className={`inline-block font-extrabold text-[11px] px-2.5 py-0.5 rounded-full border ${statusInfo.badgeColor}`}
                >
                  {statusInfo.label}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button
            type="primary"
            size="large"
            onClick={() => navigate(`/customer/customs-clearance/requests/${request?.id || id}`)}
            icon={<ArrowRightOutlined />}
            iconPlacement="end"
            className="w-full sm:w-auto !bg-brand-orange hover:!bg-brand-orange/90 font-extrabold !h-12 !px-8 rounded-xl shadow-lg"
          >
            Track Request
          </Button>

          <Button
            size="large"
            onClick={() => navigate('/customer/customs-clearance')}
            icon={<UnorderedListOutlined />}
            className="w-full sm:w-auto font-bold !h-12 !px-6 rounded-xl border-slate-300"
          >
            Back to Customs Clearance
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default ClearanceConfirmationPage;
