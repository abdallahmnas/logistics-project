import React, { useEffect, useState } from "react";
import { Button, Upload, Progress, Tag, Image, Modal, Input, message, Alert } from "antd";
import {
  UserOutlined,
  WalletOutlined,
  QrcodeOutlined,
  CloudUploadOutlined,
  CheckCircleOutlined,
  StopOutlined,
  HistoryOutlined,
  ArrowLeftOutlined,
  DollarOutlined,
  SendOutlined,
} from "@ant-design/icons";
import { useParams, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { fetchExchanges, verifyExchangePayment, releaseRmb, rejectExchange } from "../../../store/slices/exchangeSlice";
import type { ExchangeRequest } from "../../../types/exchange.types";
import { StatusBadge } from "../../../components/common/StatusBadge";

const { Dragger } = Upload;
const { TextArea } = Input;

export const ExchangeReviewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { exchanges, loading } = useAppSelector((state) => state.exchange);

  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    dispatch(fetchExchanges());
  }, [dispatch]);

  // Find the specific request or use fallback if loading/not found
  const request = exchanges.find((e) => e.id === id);

  if (!request) {
    return (
      <div className="max-w-[1200px] mx-auto p-12 text-center">
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/admin/exchange')} className="mb-4">
          Back to Exchange Requests
        </Button>
        <Alert
          message="Exchange Request Loading or Not Found"
          description={`Exchange ID ${id} could not be retrieved from active requests.`}
          type="warning"
          showIcon
        />
      </div>
    );
  }

  const isNgnToRmb = (request as any).direction !== 'rmb_to_ngn';

  const handleVerifyNaira = async () => {
    try {
      setActionLoading(true);
      await dispatch(verifyExchangePayment(request.id)).unwrap();
      message.success('Naira escrow deposit verified successfully!');
      dispatch(fetchExchanges());
    } catch (err: any) {
      const errorMsg = typeof err === 'string' ? err : err?.message || 'Failed to verify Naira deposit';
      message.error(errorMsg);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReleaseRmb = async () => {
    try {
      setActionLoading(true);
      await dispatch(releaseRmb(request.id)).unwrap();
      message.success('RMB released to recipient account successfully!');
      dispatch(fetchExchanges());
    } catch (err: any) {
      const errorMsg = typeof err === 'string' ? err : err?.message || 'Failed to release RMB';
      message.error(errorMsg);
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmReject = async () => {
    try {
      setActionLoading(true);
      await dispatch(
        rejectExchange({ exchangeId: request.id, reason: rejectReason })
      ).unwrap();
      message.success('Exchange request rejected successfully.');
      setIsRejectModalOpen(false);
      setRejectReason('');
      dispatch(fetchExchanges());
    } catch (err: any) {
      const errorMsg = typeof err === 'string' ? err : err?.message || 'Failed to reject request';
      message.error(errorMsg);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="animate-fade-in-up max-w-[1200px] mx-auto pb-20 mt-4 px-4">
      {/* Back Button */}
      <Button
        type="text"
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate("/admin/exchange")}
        className="mb-4 text-slate-500 font-bold hover:text-brand-navy"
      >
        Back to Exchange Management
      </Button>

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-extrabold text-slate-800 m-0 tracking-tight">
              Exchange Review
            </h1>
            <Tag color="blue" className="font-bold uppercase m-0 text-xs">
              {isNgnToRmb ? '🇳🇬 NGN ➔ 🇨🇳 RMB' : '🇨🇳 RMB ➔ 🇳🇬 NGN'}
            </Tag>
          </div>
          <div className="flex items-center gap-2 mt-2 text-slate-500 text-sm">
            <span className="font-bold">Request ID:</span>{" "}
            <span className="font-mono text-slate-700 font-bold">{request.id}</span>
          </div>
        </div>
        <div className="flex gap-3">
          <div className="flex items-center bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-sm">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-2">
              Status:
            </span>
            <StatusBadge module="exchange" status={request.status} />
          </div>
        </div>
      </div>

      {request.status === 'cancelled' && (
        <Alert
          message="Exchange Request Rejected / Cancelled"
          description={`Reason: ${request.rejectionReason || 'Payment proof verification failed or invalid account details.'}`}
          type="error"
          showIcon
          className="mb-6 rounded-xl border-red-200 bg-red-50"
        />
      )}

      {request.status === 'completed' && (
        <Alert
          message="Exchange Request Completed & Funds Released"
          description="RMB transfer has been successfully processed and verified for this customer."
          type="success"
          showIcon
          className="mb-6 rounded-xl border-emerald-200 bg-emerald-50"
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-8">
          {/* Requester Profile */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 relative overflow-hidden">
            <WalletOutlined className="absolute -right-4 -top-4 text-9xl text-slate-50 opacity-50" />

            <div className="flex items-center gap-2 mb-6 relative z-10">
              <UserOutlined className="text-slate-400 text-lg" />
              <h2 className="text-lg font-bold text-[#0A1128] m-0">
                Requester Profile
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-6 relative z-10">
              <div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                  USER NAME
                </div>
                <div className="text-lg font-bold text-slate-800">
                  {request.customerName}
                </div>
              </div>
              <div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                  CUSTOMER ID
                </div>
                <div className="text-sm font-mono font-bold text-slate-700">
                  {request.customerId}
                </div>
              </div>
            </div>

            <div className="relative z-10">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                DESTINATION RECEIVING WALLET ACCOUNT ({request.rmbDestType?.toUpperCase()})
              </div>
              <div className="bg-[#F8FAFC] border border-slate-200 rounded-lg p-3 flex justify-between items-center text-sm font-bold font-mono text-slate-800">
                <div>
                  <span className="block text-slate-900">{request.rmbDestName}</span>
                  <span className="text-xs text-slate-500 font-mono">{request.rmbDestAccount}</span>
                </div>
                <Tag color="blue" className="font-bold text-xs uppercase m-0">
                  {request.rmbDestType === 'wechat_pay' ? '💚 WeChat' : request.rmbDestType === 'alipay' ? '💙 Alipay' : '🏛️ Bank'}
                </Tag>
              </div>
            </div>
          </div>

          {/* Exchange Details */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 relative">
            <div className="flex items-center gap-2 mb-6">
              <WalletOutlined className="text-slate-400 text-lg" />
              <h2 className="text-lg font-bold text-[#0A1128] m-0">
                Exchange Details ({isNgnToRmb ? 'Naira to Yen' : 'Yen to Naira'})
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-[#F8FAFC] rounded-lg p-4 border border-slate-100">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                  NAIRA AMOUNT (NGN)
                </div>
                <div className="text-2xl font-extrabold text-slate-800">
                  ₦{request.amountNaira?.toLocaleString()}
                </div>
              </div>
              <div className="bg-[#F8FAFC] rounded-lg p-4 border border-slate-100">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                  RMB RECEIVE (CNY)
                </div>
                <div className="text-2xl font-extrabold text-emerald-600">
                  ¥
                  {request.amountRmb?.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </div>
              </div>
              <div className="bg-[#F8FAFC] rounded-lg p-4 border border-slate-100">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                  EXCHANGE RATE
                </div>
                <div className="text-xl font-bold text-brand-orange">
                  {request.exchangeRate ? Number(request.exchangeRate).toFixed(1) : '215.0'} NGN/CNY
                </div>
              </div>
            </div>
          </div>

          {/* User Provided QR / Barcode & Payment Proof */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 space-y-6">
            <div className="flex items-center gap-2 mb-2">
              <QrcodeOutlined className="text-slate-400 text-lg" />
              <h2 className="text-lg font-bold text-[#0A1128] m-0">
                Receiving Barcode & Proof of Payment Screenshot
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Receiving Barcode / QR Code Image */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
                  Receiving Payment Barcode / QR Code
                </span>
                <Image
                  src={
                    request.rmbDestQrCode ||
                    request.receivingBarcodeUrl ||
                    "https://images.unsplash.com/photo-1620825937374-87fc7d6aaf8e?q=80&w=600"
                  }
                  alt="Receiving Barcode QR"
                  className="w-full h-48 object-cover rounded-lg border border-slate-200 bg-white"
                  fallback="https://images.unsplash.com/photo-1620825937374-87fc7d6aaf8e?q=80&w=600"
                />
              </div>

              {/* Bank Transfer Receipt */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2 flex items-center justify-between">
                  <span>Proof of Payment Screenshot</span>
                  {request.nairaReceiptUrl && (
                    <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                      ✓ Uploaded
                    </span>
                  )}
                </span>
                <Image
                  src={
                    request.nairaReceiptUrl ||
                    request.rmbReceiptUrl ||
                    "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=600"
                  }
                  alt="Proof of Payment Receipt"
                  className="w-full h-48 object-cover rounded-lg border border-slate-200 bg-white"
                  fallback="https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=600"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-xl shadow-xl border border-slate-100 p-6 flex flex-col h-full relative overflow-hidden">
            {/* Top accent line */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-[#0A1128]"></div>

            <h2 className="text-2xl font-bold text-[#0A1128] m-0 mb-2">
              Staff Resolution
            </h2>
            <p className="text-slate-500 text-xs mb-6 leading-relaxed">
              Verify customer deposit & destination details before executing actions.
            </p>

            {/* ACTION BUTTONS BASED ON STATUS */}
            {request.status === 'pending' || request.status === 'receipt_uploaded' || request.status === 'awaiting_payment' ? (
              <div className="space-y-3 mb-6">
                <Button
                  type="primary"
                  size="large"
                  block
                  loading={actionLoading}
                  icon={<CheckCircleOutlined />}
                  className="!bg-blue-600 hover:!bg-blue-700 !text-white border-none font-bold h-13 text-sm shadow-md"
                  onClick={handleVerifyNaira}
                >
                  Verify Naira Escrow Deposit
                </Button>

                <Button
                  block
                  danger
                  size="large"
                  loading={actionLoading}
                  icon={<StopOutlined />}
                  className="font-bold h-12 text-sm border-red-300 hover:bg-red-50"
                  onClick={() => setIsRejectModalOpen(true)}
                >
                  Reject Request
                </Button>
              </div>
            ) : request.status === 'naira_confirmed' ? (
              <div className="space-y-3 mb-6">
                <Button
                  type="primary"
                  size="large"
                  block
                  loading={actionLoading}
                  icon={<SendOutlined />}
                  className="!bg-emerald-600 hover:!bg-emerald-700 !text-white border-none font-bold h-13 text-sm shadow-md"
                  onClick={handleReleaseRmb}
                >
                  Release RMB Funds ➔
                </Button>

                <Button
                  block
                  danger
                  size="large"
                  loading={actionLoading}
                  icon={<StopOutlined />}
                  className="font-bold h-12 text-sm border-red-300 hover:bg-red-50"
                  onClick={() => setIsRejectModalOpen(true)}
                >
                  Reject Request
                </Button>
              </div>
            ) : request.status === 'completed' ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-center mb-6">
                <CheckCircleOutlined className="text-emerald-600 text-3xl mb-2" />
                <div className="font-bold text-emerald-800 text-sm">Exchange Completed</div>
                <div className="text-xs text-emerald-600 mt-1">RMB funds released to customer destination account.</div>
              </div>
            ) : (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-center mb-6">
                <StopOutlined className="text-red-600 text-3xl mb-2" />
                <div className="font-bold text-red-800 text-sm">Request Rejected</div>
                <div className="text-xs text-red-600 mt-1">{request.rejectionReason || 'Declined by finance staff.'}</div>
              </div>
            )}

            {/* Compliance Risk Score */}
            <div className="bg-[#F8FAFC] rounded-xl border border-slate-200 p-5 mt-auto">
              <div className="flex justify-between items-end mb-2">
                <span className="font-bold text-xs text-slate-700 uppercase tracking-wider">
                  KYC Risk Score
                </span>
                <span className="font-bold text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">LOW (PASS)</span>
              </div>
              <Progress
                percent={15}
                showInfo={false}
                strokeColor="#10B981"
                railColor="#e2e8f0"
                size="small"
                className="mb-2"
              />
              <p className="text-[10px] text-slate-400 m-0">
                Customer identity and escrow transfer verified against compliance checks.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* REJECT REQUEST MODAL */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-red-600 font-extrabold text-lg">
            <StopOutlined /> Reject Currency Exchange Request
          </div>
        }
        open={isRejectModalOpen}
        onCancel={() => setIsRejectModalOpen(false)}
        footer={null}
        destroyOnClose
        centered
      >
        <div className="space-y-4 py-2">
          <p className="text-slate-600 text-sm m-0">
            Please provide a specific reason for rejecting this exchange request. This reason will be displayed to the customer.
          </p>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Rejection Reason <span className="text-red-500">*</span>
            </label>
            <TextArea
              rows={4}
              placeholder="e.g. Invalid bank transfer receipt screenshot — deposit reference does not match. Or invalid barcode."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="rounded-lg"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button onClick={() => setIsRejectModalOpen(false)} size="large">
              Cancel
            </Button>
            <Button
              danger
              type="primary"
              size="large"
              loading={actionLoading}
              onClick={handleConfirmReject}
              className="font-bold px-6"
            >
              Confirm Rejection
            </Button>
          </div>
        </div>
      </Modal>

    </div>
  );
};
