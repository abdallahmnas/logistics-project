import React from "react";
import { Button, Upload, Progress, Tag, Image } from "antd";
import {
  UserOutlined,
  WalletOutlined,
  QrcodeOutlined,
  CloudUploadOutlined,
  CheckCircleOutlined,
  StopOutlined,
  HistoryOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { useParams, useNavigate } from "react-router-dom";
import { useAppSelector } from "../../../store/hooks";
import type { ExchangeRequest } from "../../../types/exchange.types";
import { StatusBadge } from "../../../components/common/StatusBadge";

const { Dragger } = Upload;

export const ExchangeReviewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { exchanges } = useAppSelector((state) => state.exchange);

  // Find the specific request or use a mock fallback if not found
  const request =
    exchanges.find((e) => e.id === id) ||
    ({
      id: id || "EXQ-8992-KML",
      customerName: "Eleanor Vance",
      amountNaira: 1500000,
      amountRmb: 10714.28,
      exchangeRate: 140.0,
      status: "pending",
      rmbDestAccount: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
      createdAt: new Date().toISOString(),
    } as ExchangeRequest);

  const isNgnToRmb = (request as any).direction !== 'rmb_to_ngn';

  return (
    <div className="animate-fade-in-up max-w-[1200px] mx-auto pb-20 mt-4 px-4">
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
            <span className="font-mono">{request.id}</span>
          </div>
        </div>
        <div className="flex gap-3">
          <div className="flex items-center bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-sm">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-2">
              Payment:
            </span>
            <StatusBadge module="exchange" status={request.status} />
          </div>
          <div className="bg-orange-50 text-orange-600 px-4 py-2 rounded-full font-bold text-sm flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-orange-500"></div>
            Pending Final Approval
          </div>
        </div>
      </div>

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
                <div className="text-lg font-medium text-slate-800">
                  {request.customerName}
                </div>
              </div>
              <div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                  ACCOUNT TIER
                </div>
                <Tag
                  color="processing"
                  className="font-bold border-blue-200 text-blue-700 bg-blue-50"
                >
                  ★ VIP Corporate
                </Tag>
              </div>
            </div>

            <div className="relative z-10">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                DESTINATION ACCOUNT / WALLET ID
              </div>
              <div className="bg-[#F8FAFC] border border-slate-200 rounded-lg p-3 flex justify-between items-center text-sm font-mono text-slate-600">
                {request.rmbDestAccount || request.rmbDestName}
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
                  RMB AMOUNT (CNY)
                </div>
                <div className="text-2xl font-bold text-emerald-600">
                  ¥
                  {request.amountRmb.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </div>
              </div>
              <div className="bg-[#F8FAFC] rounded-lg p-4 border border-slate-100">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                  NAIRA AMOUNT (NGN)
                </div>
                <div className="text-xl font-bold text-slate-800">
                  ₦{request.amountNaira.toLocaleString()}
                </div>
              </div>
              <div className="bg-[#F8FAFC] rounded-lg p-4 border border-slate-100">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                  EXCHANGE RATE
                </div>
                <div className="text-xl font-bold text-brand-orange">
                  {request.exchangeRate.toFixed(1)} NGN/CNY
                </div>
              </div>
            </div>
          </div>

          {/* User Provided QR / Barcode & Payment Proof */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 space-y-6">
            <div className="flex items-center gap-2 mb-2">
              <QrcodeOutlined className="text-slate-400 text-lg" />
              <h2 className="text-lg font-bold text-[#0A1128] m-0">
                Receiving Barcode / Payment Documentation
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Receiving Barcode / QR Code Image */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  Receiving Payment Barcode / QR
                </span>
                <Image
                  src={
                    (request as any).receivingBarcodeUrl ||
                    request.rmbDestQrCode ||
                    "https://images.unsplash.com/photo-1620825937374-87fc7d6aaf8e?q=80&w=600"
                  }
                  alt="Receiving Barcode QR"
                  className="w-full h-48 object-cover rounded-lg border border-slate-200"
                  fallback="https://images.unsplash.com/photo-1620825937374-87fc7d6aaf8e?q=80&w=600"
                />
              </div>

              {/* Bank Transfer Receipt */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  Proof of Payment Receipt
                </span>
                <Image
                  src={
                    request.nairaReceiptUrl ||
                    request.rmbReceiptUrl ||
                    "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=600"
                  }
                  alt="Proof of Payment Receipt"
                  className="w-full h-48 object-cover rounded-lg border border-slate-200"
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

            <h2 className="text-2xl font-bold text-[#0A1128] m-0 mb-4">
              Resolution
            </h2>
            <p className="text-slate-500 text-sm mb-8 leading-relaxed">
              Review all documentation before executing this transfer. This
              action is irreversible.
            </p>

            <div className="bg-[#F8FAFC] border border-slate-200 rounded-xl p-5 mb-8">
              <div className="flex items-center gap-2 mb-2">
                <CloudUploadOutlined className="text-slate-400" />
                <span className="font-bold text-sm text-slate-700">
                  Admin Proof of Payment
                </span>
              </div>
              <p className="text-xs text-slate-500 mb-4">
                Upload the final swift MT103 or internal ledger receipt for
                compliance logging.
              </p>

              <Dragger
                className="bg-white"
                beforeUpload={() => false}
                onChange={({ fileList: newFileList }) => {
                  newFileList.forEach((f) => { f.status = 'done'; });
                }}
                customRequest={({ onSuccess }) => setTimeout(() => onSuccess?.("ok"), 0)}
              >
                <p className="ant-upload-drag-icon">
                  <CloudUploadOutlined className="text-brand-orange" />
                </p>
                <p className="ant-upload-text text-sm font-bold text-slate-700">
                  Browse files
                </p>
                <p className="ant-upload-hint text-xs text-slate-400">
                  PDF, JPG, PNG up to 10MB
                </p>
              </Dragger>
            </div>

            <Button
              type="primary"
              size="large"
              block
              icon={<CheckCircleOutlined />}
              className="!bg-[#0A1128] hover:!bg-[#1a2542] !text-white border-none font-bold h-14 text-base mb-4 shadow-md"
              onClick={() => {
                navigate("/admin/exchange");
              }}
            >
              Approve & Release Funds
            </Button>

            <Button
              block
              size="large"
              icon={<StopOutlined />}
              className="text-red-500 border-red-200 hover:bg-red-50 hover:border-red-300 font-bold h-12 mb-6"
            >
              Reject Request
            </Button>

            <Button
              type="text"
              block
              icon={<HistoryOutlined />}
              className="text-slate-500 font-medium hover:text-brand-navy"
            >
              View Audit Log
            </Button>
          </div>

          {/* Compliance Risk Score */}
          <div className="bg-[#F8FAFC] rounded-xl border border-slate-200 p-6">
            <div className="flex justify-between items-end mb-2">
              <span className="font-bold text-sm text-slate-700">
                Compliance Risk Score
              </span>
              <span className="font-bold text-sm text-orange-600">LOW</span>
            </div>
            <Progress
              percent={25}
              showInfo={false}
              strokeColor="#D95D10"
              railColor="#e2e8f0"
              size="small"
              className="mb-2"
            />
            <p className="text-xs text-slate-500 m-0">
              KYC/AML checks passed automatically on 2023-10-24.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
