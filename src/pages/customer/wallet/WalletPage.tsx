import React, { useEffect, useState } from "react";
import { Button, Table, Tag, Modal, InputNumber, message } from "antd";
import {
  WalletOutlined,
  PlusOutlined,
  ArrowDownOutlined,
  CreditCardOutlined,
  BankOutlined,
  CarOutlined,
} from "@ant-design/icons";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import {
  fetchTransactions,
  fetchWallet,
} from "../../../store/slices/walletSlice";
import type {
  WalletTransaction,
  TransactionType,
} from "../../../types/wallet.types";

export const WalletPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { wallet, transactions, loading } = useAppSelector(
    (state) => state.wallet,
  );
  const [topUpOpen, setTopUpOpen] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState<number>(10000);
  const [topUpLoading, setTopUpLoading] = useState(false);

  useEffect(() => {
    dispatch(fetchWallet());
    dispatch(fetchTransactions());
  }, [dispatch]);

  const handleTopUp = () => {
    setTopUpLoading(true);
    setTimeout(() => {
      setTopUpLoading(false);
      setTopUpOpen(false);
      message.success(`Top-up of ₦${topUpAmount.toLocaleString()} initiated.`);
    }, 1200);
  };

  const balance = wallet?.balance || 0;
  const recentTransactions = [...transactions].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  // Mock due-for-payment items
  const duePayments = [
    {
      id: "SHP-2024-8891",
      route: "Guangzhou → Lagos",
      amount: 45200,
      type: "URGENT PACKING",
    },
    {
      id: "SHP-2024-8842",
      route: "Dubai → Accra",
      amount: 120000,
      type: "AIRWAY BILL",
    },
  ];

  const txColumns = [
    {
      title: "Date",
      dataIndex: "createdAt",
      key: "date",
      render: (d: string) => (
        <span className="text-sm text-slate-600">
          {new Date(d).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </span>
      ),
    },
    {
      title: "Description",
      key: "description",
      render: (record: WalletTransaction) => (
        <div>
          <div className="text-sm font-medium text-slate-800">
            {record.description || "Transaction"}
          </div>
          <div className="text-[10px] text-slate-400">
            {record.referenceId || record.category.replace(/_/g, " ")}
          </div>
        </div>
      ),
    },
    {
      title: "Amount (₦)",
      dataIndex: "amount",
      key: "amount",
      render: (amount: number, record: WalletTransaction) => (
        <span
          className={`font-bold text-sm ${record.type === "credit" || record.type === "refund" ? "text-green-600" : "text-slate-800"}`}
        >
          {record.type === "credit" || record.type === "refund" ? "+" : "-"}₦
          {amount.toLocaleString()}
        </span>
      ),
    },
    {
      title: "Status",
      dataIndex: "type",
      key: "status",
      render: (type: TransactionType) => {
        const map: Record<string, { color: string; text: string }> = {
          credit: { color: "bg-green-100 text-green-700", text: "Successful" },
          debit: { color: "bg-green-100 text-green-700", text: "Successful" },
          escrow_hold: {
            color: "bg-orange-100 text-orange-600",
            text: "Pending",
          },
          escrow_release: {
            color: "bg-green-100 text-green-700",
            text: "Successful",
          },
          refund: { color: "bg-red-100 text-red-600", text: "Failed" },
        };
        const s = map[type] || {
          color: "bg-slate-100 text-slate-600",
          text: type,
        };
        return (
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${s.color}`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
            {s.text}
          </span>
        );
      },
    },
  ];

  return (
    <div className="animate-fade-in-up max-w-[1200px] mx-auto pb-20">
      {/* Balance Card */}
      <div className="bg-[#0A1128] rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl mb-8">
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -left-10 -bottom-20 w-60 h-60 bg-brand-orange/10 rounded-full blur-3xl"></div>

        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <WalletOutlined className="text-blue-300" />
              <span className="text-xs font-bold text-blue-300 uppercase tracking-wider">
                Naira Platform Balance
              </span>
            </div>
            <p className="text-blue-200 text-xs m-0 mb-4">
              Available for shipping and clearance
            </p>
            <div className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-2">
              ₦{balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
            <p className="text-green-400 text-xs m-0 flex items-center gap-1">
              ↑ ₦50,000.00 since last week
            </p>
          </div>

          <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
            <WalletOutlined className="text-3xl text-blue-300" />
          </div>
        </div>

        <div className="flex gap-3 mt-6 relative z-10">
          <Button
            size="large"
            className="bg-brand-orange hover:bg-[#E86E21] text-white border-none font-bold shadow-md px-8"
            icon={<PlusOutlined />}
            onClick={() => setTopUpOpen(true)}
          >
            Fund Wallet
          </Button>
          <Button
            size="large"
            className="bg-white/10 hover:bg-white/20 text-white border-none font-bold backdrop-blur-sm px-8"
            icon={<ArrowDownOutlined />}
          >
            Withdraw
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-8">
          {/* Due for Payment */}
          <div>
            <h2 className="text-lg font-bold text-[#0A1128] m-0 mb-4 flex items-center gap-2">
              <CarOutlined className="text-slate-400" /> Due for Payment
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {duePayments.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-xl border border-slate-100 shadow-sm p-5"
                >
                  <div className="flex justify-between items-start mb-3">
                    <Tag className="m-0 bg-orange-100 text-orange-600 border-none text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm">
                      {item.type}
                    </Tag>
                    <span className="text-lg font-extrabold text-[#0A1128]">
                      ₦ {item.amount.toLocaleString()}
                    </span>
                  </div>
                  <div className="text-sm font-bold text-[#0A1128] mb-1">
                    {item.id}
                  </div>
                  <div className="text-xs text-slate-500 mb-4">
                    {item.route}
                  </div>
                  <Button
                    type="primary"
                    block
                    className="bg-[#0A1128] hover:bg-[#1a2542] border-none font-bold shadow-sm"
                  >
                    Pay Now
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Transactions Table */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-[#0A1128] m-0">
                Recent Transactions
              </h2>
              <Button
                type="link"
                className="text-[#0A1128] font-bold text-sm p-0"
              >
                View All →
              </Button>
            </div>
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
              <Table
                columns={txColumns}
                dataSource={recentTransactions}
                rowKey="id"
                pagination={false}
                loading={loading}
                className="[&_.ant-table-thead_th]:!bg-white [&_.ant-table-thead_th]:!text-slate-500 [&_.ant-table-thead_th]:!text-xs [&_.ant-table-thead_th]:!font-bold [&_.ant-table-thead_th]:uppercase [&_.ant-table-thead_th]:tracking-wider [&_.ant-table-thead_th]:!py-4 [&_.ant-table-tbody_td]:!py-4"
              />
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-1 space-y-6">
          {/* Linked Methods */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-[#0A1128] text-base m-0">
                Linked Methods
              </h3>
              <Button
                type="text"
                icon={<PlusOutlined />}
                className="text-brand-orange font-bold text-xs"
              />
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3 bg-slate-50 rounded-lg p-3 border border-slate-100">
                <div className="w-9 h-9 rounded-lg bg-[#0A1128] text-white flex items-center justify-center">
                  <BankOutlined />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-bold text-slate-800">
                    GT Bank Transfer
                  </div>
                  <div className="text-[10px] text-slate-400">****4421</div>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-slate-50 rounded-lg p-3 border border-slate-100">
                <div className="w-9 h-9 rounded-lg bg-brand-orange text-white flex items-center justify-center">
                  <CreditCardOutlined />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-bold text-slate-800">
                    Mastercard
                  </div>
                  <div className="text-[10px] text-slate-400">****7792</div>
                </div>
              </div>
            </div>
          </div>

          {/* Pay On Delivery */}
          <div className="bg-gradient-to-br from-[#0A1128] to-[#1a2542] rounded-xl p-6 text-white shadow-lg relative overflow-hidden">
            <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl"></div>
            <h3 className="font-bold text-white text-base m-0 mb-2 relative z-10">
              Pay On Delivery (POD)
            </h3>
            <p className="text-blue-200 text-xs m-0 mb-4 relative z-10 leading-relaxed">
              You have 2 upcoming shipments opted for POD.
            </p>
            <div className="flex justify-between items-center mb-4 relative z-10">
              <div>
                <div className="text-[10px] font-bold text-blue-300 uppercase tracking-wider">
                  TOTAL COMMITMENT
                </div>
                <div className="text-2xl font-extrabold mt-1">₦ 185,500</div>
              </div>
            </div>
            <Button
              type="link"
              className="text-brand-orange font-bold text-xs p-0 relative z-10"
            >
              View Shipments →
            </Button>
          </div>
        </div>
      </div>

      {/* Top Up Modal */}
      <Modal
        title="Fund Wallet"
        open={topUpOpen}
        onCancel={() => setTopUpOpen(false)}
        onOk={handleTopUp}
        confirmLoading={topUpLoading}
        okText="Proceed to Payment"
        okButtonProps={{
          className: "bg-brand-orange hover:bg-[#E86E21] border-none",
        }}
        destroyOnHidden
      >
        <div className="py-4">
          <label className="block text-sm font-bold text-slate-700 mb-2">
            Amount (₦)
          </label>
          <InputNumber
            size="large"
            className="w-full"
            min={1000}
            step={5000}
            value={topUpAmount}
            onChange={(v) => setTopUpAmount(v || 10000)}
            formatter={(value) =>
              `₦ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
            }
          />
          <div className="flex gap-2 mt-3">
            {[10000, 50000, 100000, 500000].map((amt) => (
              <button
                key={amt}
                onClick={() => setTopUpAmount(amt)}
                className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                  topUpAmount === amt
                    ? "bg-[#0A1128] text-white border-[#0A1128]"
                    : "bg-white text-slate-600 border-slate-200"
                }`}
              >
                ₦{amt / 1000}k
              </button>
            ))}
          </div>
        </div>
      </Modal>
    </div>
  );
};
