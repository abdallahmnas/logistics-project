import React, { useEffect, useMemo, useState } from "react";
import { Button, Tag, Table } from "antd";
import {
  PlusOutlined,
  InboxOutlined,
  CarOutlined,
  CheckCircleOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { fetchPackages, fetchConsolidations } from "../../../store/slices/shipmentSlice";

type FilterType = "all" | "pending" | "processing" | "completed";

export const ConsolidationPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { packages, consolidations: storeConsolidations } = useAppSelector((state) => state.shipments);
  const [filter, setFilter] = useState<FilterType>("all");

  useEffect(() => {
    dispatch(fetchPackages());
    dispatch(fetchConsolidations());
  }, [dispatch]);

  // Render only persisted consolidations. Empty states must not resemble live orders.
  const consolidations = useMemo(() => {
    return (storeConsolidations || []).map((c) => ({
        id: c.consolidationId || c.id,
        dateCreated: c.createdAt || new Date().toISOString(),
        items: c.packageIds?.length || 1,
        estWeight: `${c.totalWeightKg || 1} kg`,
        destination: c.destinationWarehouse ? `${c.destinationWarehouse.toUpperCase()}, NG` : 'Lagos, NG',
        status: ({
          pending_packing: 'pending',
          ready_to_batch: 'ready',
          batched: 'completed',
        } as const)[c.status],
        raw: c,
    }));
  }, [storeConsolidations]);

  const pendingItems =
    packages.filter((p) =>
      [
        "received_cn",
        "ready_to_pack",
        "received_at_warehouse",
        "at_china_warehouse",
      ].includes(p.status),
    ).length;
  const inConsolidation = consolidations.filter((c) => c.status === "pending").length;
  const readyForShipping = consolidations.filter(
    (c) => c.status === "ready",
  ).length;

  const filtered =
    filter === "all"
      ? consolidations
      : consolidations.filter((c) => {
          if (filter === "pending") return c.status === "pending";
          if (filter === "processing") return c.status === "pending";
          if (filter === "completed")
            return c.status === "ready" || c.status === "completed";
          return true;
        });

  const statusBadge = (status: string) => {
    const map: Record<string, { color: string; text: string }> = {
      packing: { color: "bg-orange-100 text-orange-600", text: "Packing" },
      pending: { color: "bg-blue-100 text-blue-600", text: "Pending" },
      processing: {
        color: "bg-orange-100 text-orange-600",
        text: "Processing",
      },
      ready: { color: "bg-green-100 text-green-600", text: "Ready" },
      completed: { color: "bg-slate-100 text-slate-600", text: "Completed" },
    };
    const s = map[status] || {
      color: "bg-slate-100 text-slate-600",
      text: status,
    };
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${s.color}`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
        {s.text}
      </span>
    );
  };

  const columns = [
    {
      title: "Consolidation ID",
      dataIndex: "id",
      key: "id",
      render: (text: string) => (
        <span className="font-bold text-[#0A1128] text-sm">{text}</span>
      ),
    },
    {
      title: "Date Created",
      dataIndex: "dateCreated",
      key: "dateCreated",
      render: (d: string) => (
        <span className="text-slate-600 text-sm">
          {new Date(d).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </span>
      ),
    },
    {
      title: "Items",
      dataIndex: "items",
      key: "items",
      render: (count: number) => (
        <span className="text-slate-700 font-medium">{count} Items</span>
      ),
    },
    {
      title: "Est. Weight",
      dataIndex: "estWeight",
      key: "estWeight",
      render: (w: string) => <span className="text-slate-600">{w}</span>,
    },
    {
      title: "Destination",
      dataIndex: "destination",
      key: "destination",
      render: (dest: string) => (
        <span className="text-slate-600 flex items-center gap-1.5">
          <EnvironmentOutlined className="text-slate-400 text-xs" /> {dest}
        </span>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => statusBadge(status),
    },
    {
      title: "Action",
      key: "action",
      render: () => (
        <span className="text-[#0A1128] font-bold text-sm cursor-pointer hover:text-brand-orange flex items-center gap-1">
          View Details <span className="text-slate-400">→</span>
        </span>
      ),
    },
  ];

  const filters: { key: FilterType; label: string }[] = [
    { key: "all", label: "All Consolidations" },
    { key: "pending", label: "Pending" },
    { key: "processing", label: "Processing" },
    { key: "completed", label: "Completed" },
  ];

  return (
    <div className="animate-fade-in-up max-w-[1200px] mx-auto pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0A1128] m-0 mb-1 tracking-tight">
            Consolidation Management
          </h1>
          <p className="text-slate-500 text-sm m-0">
            Combine multiple packages into a single shipment to save on shipping
            costs.
          </p>
        </div>
        <Button
          type="primary"
          size="large"
          icon={<PlusOutlined />}
          className="bg-[#0A1128] hover:bg-[#1a2542] border-none font-bold shadow-md px-6"
          onClick={() => navigate("/customer/consolidation/new")}
        >
          New Consolidation
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 border border-slate-100 shadow-sm flex justify-between items-center">
          <div>
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-3">
              PENDING ITEMS
            </div>
            <div className="text-3xl font-extrabold text-[#0A1128]">
              {pendingItems}
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
            <InboxOutlined className="text-xl" />
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 border border-slate-100 shadow-sm flex justify-between items-center">
          <div>
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-3">
              IN CONSOLIDATION
            </div>
            <div className="text-3xl font-extrabold text-[#0A1128]">
              {inConsolidation}
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <CarOutlined className="text-xl" />
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 border border-slate-100 shadow-sm flex justify-between items-center">
          <div>
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-3">
              READY FOR SHIPPING
            </div>
            <div className="text-3xl font-extrabold text-[#0A1128]">
              {readyForShipping}
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-orange-50 text-brand-orange flex items-center justify-center">
            <CheckCircleOutlined className="text-xl" />
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-5 py-2 rounded-full text-sm font-bold border transition-colors cursor-pointer ${
              filter === f.key
                ? "bg-[#0A1128] text-white border-[#0A1128] shadow-sm"
                : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <Table
          columns={columns}
          dataSource={filtered}
          rowKey="id"
          pagination={false}
          className="[&_.ant-table-thead_th]:!bg-white [&_.ant-table-thead_th]:!text-slate-700 [&_.ant-table-thead_th]:!text-xs [&_.ant-table-thead_th]:!font-bold [&_.ant-table-thead_th]:!py-4 [&_.ant-table-tbody_td]:!py-5"
        />
      </div>
    </div>
  );
};
