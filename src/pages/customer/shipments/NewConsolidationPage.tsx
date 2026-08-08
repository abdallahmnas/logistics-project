import React, { useEffect, useMemo, useState } from "react";
import { Button, Checkbox, Select, Card, Modal, Radio, message } from "antd";
import {
  ArrowLeftOutlined,
  EnvironmentOutlined,
  InboxOutlined,
  CarOutlined,
  WalletOutlined,
  CopyOutlined,
  BankOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { fetchPackages } from "../../../store/slices/shipmentSlice";

export const NewConsolidationPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { packages } = useAppSelector((state) => state.shipments);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [freight, setFreight] = useState<"air" | "sea">("air");
  const [paymentMethod, setPaymentMethod] = useState<
    "pay_now" | "pay_on_delivery"
  >("pay_now");
  const [payModalOpen, setPayModalOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchPackages());
  }, [dispatch]);

  // Mock warehouse items
  const warehouseItems = [
    {
      id: "WH-001",
      name: "Electronic Components",
      trackingId: "YT0001316925CN",
      weight: 12.5,
      volume: 0.08,
      status: "stored",
      image:
        "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=300&auto=format&fit=crop",
    },
    {
      id: "WH-002",
      name: "Industrial Pump Parts",
      trackingId: "SF7724818471CN",
      weight: 45.0,
      volume: 0.25,
      status: "stored",
      image:
        "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=300&auto=format&fit=crop",
    },
  ];

  const toggleItem = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const selectAll = () => {
    if (selectedIds.length === warehouseItems.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(warehouseItems.map((i) => i.id));
    }
  };

  const selectedItems = warehouseItems.filter((i) =>
    selectedIds.includes(i.id),
  );
  const totalWeight = selectedItems.reduce((sum, i) => sum + i.weight, 0);
  const totalVolume = selectedItems.reduce((sum, i) => sum + i.volume, 0);

  return (
    <div className="animate-fade-in-up max-w-[1200px] mx-auto pb-20">
      {/* Header */}
      <div className="flex items-center gap-4 mb-2">
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          className="bg-slate-100 hover:bg-slate-200 w-10 h-10 rounded-full flex items-center justify-center shrink-0"
          onClick={() => navigate("/customer/shipments/consolidation")}
        />
        <div>
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            WAREHOUSE INVENTORY
          </div>
          <h1 className="text-3xl font-extrabold text-[#0A1128] m-0 tracking-tight">
            Consolidation Hub
          </h1>
        </div>
      </div>

      <div className="flex justify-end mb-6">
        <div className="flex items-center gap-2 bg-white rounded-full px-4 py-2 border border-slate-200 shadow-sm">
          <EnvironmentOutlined className="text-brand-orange" />
          <span className="text-xs text-slate-600">
            Current Location:{" "}
            <strong className="text-[#0A1128]">Guangzhou,</strong>{" "}
            <span className="text-brand-orange font-bold">China</span>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column — Inventory List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Checkbox
              checked={
                selectedIds.length === warehouseItems.length &&
                warehouseItems.length > 0
              }
              indeterminate={
                selectedIds.length > 0 &&
                selectedIds.length < warehouseItems.length
              }
              onChange={selectAll}
            />
            <span className="text-sm font-bold text-slate-600">
              Select All ({warehouseItems.length} items)
            </span>
          </div>

          {warehouseItems.map((item) => (
            <div
              key={item.id}
              className={`bg-white rounded-xl border-2 shadow-sm p-4 flex items-center gap-4 transition-all cursor-pointer ${
                selectedIds.includes(item.id)
                  ? "border-brand-orange shadow-md"
                  : "border-slate-100 hover:border-slate-200"
              }`}
              onClick={() => toggleItem(item.id)}
            >
              <Checkbox
                checked={selectedIds.includes(item.id)}
                onClick={(e) => e.stopPropagation()}
                onChange={() => toggleItem(item.id)}
              />
              <img
                src={item.image}
                alt={item.name}
                className="w-20 h-20 rounded-lg object-cover shrink-0"
              />
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-[#0A1128] text-base m-0 mb-1">
                  {item.name}
                </h3>
                <div className="text-xs text-slate-400 font-mono mb-2">
                  3K {item.trackingId}
                </div>
                <div className="flex gap-4 text-xs text-slate-600">
                  <span>
                    • Weight: <strong>{item.weight} kg</strong>
                  </span>
                  <span>
                    • Vol: <strong>{item.volume} CBM</strong>
                  </span>
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Status
                </div>
                <span className="inline-flex items-center gap-1.5 bg-green-100 text-green-700 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>{" "}
                  Stored
                </span>
              </div>
            </div>
          ))}

          {/* Recent Requests */}
          <div className="mt-8">
            <h2 className="text-lg font-bold text-[#0A1128] m-0 mb-4">
              Recent Requests
            </h2>
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-xs font-mono text-brand-orange font-bold mb-1">
                    RFQ-202-A10-44
                  </div>
                  <h3 className="font-bold text-[#0A1128] text-sm m-0 mb-2">
                    Air Freight to Lagos
                  </h3>
                  <div className="flex gap-4 text-xs text-slate-500 mb-2">
                    <span>3 Items</span>
                    <span className="text-slate-300">|</span>
                    <span>Est. 28.5 kg</span>
                  </div>
                  <div className="text-[10px] text-slate-400">
                    <EnvironmentOutlined className="mr-1" /> Submitted: Oct 24,
                    08:30 AM
                  </div>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center gap-1 bg-orange-100 text-orange-600 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider mb-2">
                    Under Packing
                  </span>
                  <div className="mt-2">
                    <span className="text-brand-orange text-xs font-bold cursor-pointer hover:underline">
                      Details ›
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column — Configuration */}
        <div className="lg:col-span-1">
          <Card
            bordered={false}
            className="shadow-lg border-t-4 border-brand-orange rounded-xl sticky top-24"
            bodyStyle={{ padding: "0" }}
          >
            <div className="p-6 border-b border-slate-100">
              <h2 className="text-lg font-bold text-[#0A1128] m-0 flex items-center gap-2">
                <InboxOutlined className="text-slate-400" /> Shipment
                Configuration
              </h2>
            </div>

            <div className="p-6 space-y-6">
              {/* Selected items summary */}
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Selected Items
                  </div>
                  <div className="text-2xl font-extrabold text-[#0A1128]">
                    {selectedIds.length}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Est. Weight
                  </div>
                  <div className="text-sm font-bold text-slate-700">
                    {totalWeight.toFixed(1)} kg
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Est. Volume
                  </div>
                  <div className="text-sm font-bold text-slate-700">
                    {totalVolume.toFixed(2)} cbm
                  </div>
                </div>
              </div>

              {/* Freight Modality */}
              <div>
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-3">
                  Freight Modality
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div
                    className={`rounded-xl p-4 border-2 cursor-pointer transition-all text-center ${
                      freight === "air"
                        ? "border-brand-orange bg-brand-orange/5 shadow-sm"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                    onClick={() => setFreight("air")}
                  >
                    <CarOutlined
                      className={`text-xl mb-1 ${freight === "air" ? "text-brand-orange" : "text-slate-400"}`}
                    />
                    <div
                      className={`text-xs font-bold ${freight === "air" ? "text-brand-orange" : "text-slate-600"}`}
                    >
                      Air Freight
                    </div>
                  </div>
                  <div
                    className={`rounded-xl p-4 border-2 cursor-pointer transition-all text-center ${
                      freight === "sea"
                        ? "border-brand-orange bg-brand-orange/5 shadow-sm"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                    onClick={() => setFreight("sea")}
                  >
                    <InboxOutlined
                      className={`text-xl mb-1 ${freight === "sea" ? "text-brand-orange" : "text-slate-400"}`}
                    />
                    <div
                      className={`text-xs font-bold ${freight === "sea" ? "text-brand-orange" : "text-slate-600"}`}
                    >
                      Sea Freight
                    </div>
                  </div>
                </div>
              </div>

              {/* Destination */}
              <div>
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Destination Hub (Nigeria)
                </div>
                <Select
                  defaultValue="lagos"
                  className="w-full"
                  size="large"
                  options={[
                    { value: "lagos", label: "Lagos (LOS) - Main Hub" },
                    { value: "abuja", label: "Abuja (ABV) - Branch" },
                    { value: "port_harcourt", label: "Port Harcourt (PHC)" },
                  ]}
                />
              </div>

              {/* Payment Method */}
              <div>
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-3">
                  Payment Method
                </div>
                <Radio.Group
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full space-y-3"
                >
                  <div
                    className={`rounded-xl p-4 border-2 cursor-pointer transition-all flex items-center gap-3 ${
                      paymentMethod === "pay_now"
                        ? "border-brand-orange bg-brand-orange/5 shadow-sm"
                        : "border-slate-200"
                    }`}
                    onClick={() => setPaymentMethod("pay_now")}
                  >
                    <Radio value="pay_now" />
                    <WalletOutlined
                      className={`text-lg ${paymentMethod === "pay_now" ? "text-brand-orange" : "text-slate-400"}`}
                    />
                    <div className="flex-1">
                      <div
                        className={`text-sm font-bold ${paymentMethod === "pay_now" ? "text-brand-orange" : "text-slate-700"}`}
                      >
                        Pay Now
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Bank transfer before packing
                      </div>
                    </div>
                  </div>
                  <div
                    className={`rounded-xl p-4 border-2 cursor-pointer transition-all flex items-center gap-3 ${
                      paymentMethod === "pay_on_delivery"
                        ? "border-brand-orange bg-brand-orange/5 shadow-sm"
                        : "border-slate-200"
                    }`}
                    onClick={() => setPaymentMethod("pay_on_delivery")}
                  >
                    <Radio value="pay_on_delivery" />
                    <CarOutlined
                      className={`text-lg ${paymentMethod === "pay_on_delivery" ? "text-brand-orange" : "text-slate-400"}`}
                    />
                    <div className="flex-1">
                      <div
                        className={`text-sm font-bold ${paymentMethod === "pay_on_delivery" ? "text-brand-orange" : "text-slate-700"}`}
                      >
                        Pay on Delivery
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Pay when package arrives
                      </div>
                    </div>
                  </div>
                </Radio.Group>
              </div>
            </div>

            <div className="p-6 border-t border-slate-100">
              <Button
                type="primary"
                size="large"
                block
                className="bg-brand-orange hover:bg-[#E86E21] border-none font-bold shadow-md h-12 text-base"
                disabled={selectedIds.length === 0}
                onClick={() => {
                  if (paymentMethod === "pay_now") {
                    setPayModalOpen(true);
                  } else {
                    message.success(
                      "Consolidation submitted! You will pay on delivery.",
                    );
                    navigate("/customer/consolidation");
                  }
                }}
              >
                Apply to Pack →
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* Pay Now Modal */}
      <Modal
        open={payModalOpen}
        onCancel={() => setPayModalOpen(false)}
        footer={null}
        width={520}
        destroyOnHidden
      >
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-full bg-brand-orange/10 text-brand-orange flex items-center justify-center mx-auto mb-4">
            <BankOutlined className="text-3xl" />
          </div>
          <h2 className="text-xl font-bold text-[#0A1128] m-0 mb-1">
            Payment Instructions
          </h2>
          <p className="text-slate-500 text-sm m-0">
            Transfer the amount below to complete your consolidation request.
          </p>
        </div>

        <div className="bg-[#0A1128] rounded-xl p-5 text-white mb-6">
          <div className="text-[10px] font-bold text-blue-300 uppercase tracking-wider mb-1">
            Amount to Pay
          </div>
          <div className="text-3xl font-extrabold">
            ₦
            {(freight === "air"
              ? totalWeight * 3500
              : totalVolume * 180000
            ).toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
          <div className="text-xs text-blue-200 mt-1">
            {freight === "air"
              ? `${totalWeight.toFixed(1)} kg × ₦3,500/kg`
              : `${totalVolume.toFixed(2)} cbm × ₦180,000/cbm`}
          </div>
        </div>

        <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 space-y-4 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                Bank Name
              </div>
              <div className="text-sm font-bold text-[#0A1128]">
                Guaranty Trust Bank (GTB)
              </div>
            </div>
            <Button
              type="text"
              size="small"
              icon={<CopyOutlined />}
              className="text-brand-orange"
              onClick={() => {
                navigator.clipboard.writeText("Guaranty Trust Bank (GTB)");
                message.success("Copied!");
              }}
            />
          </div>
          <div className="flex justify-between items-center">
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                Account Number
              </div>
              <div className="text-sm font-bold text-[#0A1128] font-mono tracking-wider">
                0123456789
              </div>
            </div>
            <Button
              type="text"
              size="small"
              icon={<CopyOutlined />}
              className="text-brand-orange"
              onClick={() => {
                navigator.clipboard.writeText("0123456789");
                message.success("Copied!");
              }}
            />
          </div>
          <div className="flex justify-between items-center">
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                Account Name
              </div>
              <div className="text-sm font-bold text-[#0A1128]">
                Global Logistics Ltd
              </div>
            </div>
            <Button
              type="text"
              size="small"
              icon={<CopyOutlined />}
              className="text-brand-orange"
              onClick={() => {
                navigator.clipboard.writeText("Global Logistics Ltd");
                message.success("Copied!");
              }}
            />
          </div>
        </div>

        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
          <p className="text-orange-700 text-xs m-0 leading-relaxed">
            <strong>Important:</strong> Use your Member Code as the payment
            reference/narration. Your consolidation will be processed within 2
            hours of payment confirmation.
          </p>
        </div>

        <div className="flex gap-3">
          <Button
            size="large"
            block
            className="border-slate-200 text-slate-600 font-bold"
            onClick={() => setPayModalOpen(false)}
          >
            Cancel
          </Button>
          <Button
            type="primary"
            size="large"
            block
            icon={<CheckCircleOutlined />}
            className="bg-brand-orange hover:bg-[#E86E21] border-none font-bold shadow-md"
            onClick={() => {
              setPayModalOpen(false);
              message.success(
                "Consolidation submitted! We will confirm your payment shortly.",
              );
              navigate("/customer/consolidation");
            }}
          >
            I've Made Payment
          </Button>
        </div>
      </Modal>
    </div>
  );
};
