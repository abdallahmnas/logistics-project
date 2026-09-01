import React, { useEffect, useMemo, useState } from "react";
import { Button, Tag, Table, Drawer, Descriptions, Select, message, Tooltip } from "antd";
import {
  PlusOutlined,
  InboxOutlined,
  CarOutlined,
  CheckCircleOutlined,
  EnvironmentOutlined,
  DollarOutlined,
  CalendarOutlined,
  UserOutlined,
  DeleteOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { fetchPackages, fetchConsolidations, updateConsolidation } from "../../../store/slices/shipmentSlice";
import { fetchWallet } from "../../../store/slices/walletSlice";
import { formatNaira, formatWeight, formatCbm, formatDate } from "../../../utils/formatters";
import { StatusBadge } from "../../../components/common/StatusBadge";
import type { Consolidation, Package } from "../../../types/shipment.types";

const { Option } = Select;

type FilterType = "all" | "pending" | "processing" | "completed";

export const ConsolidationPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { packages, consolidations: storeConsolidations } = useAppSelector((state) => state.shipments);
  const [filter, setFilter] = useState<FilterType>("all");

  const [selectedConsolidation, setSelectedConsolidation] = useState<Consolidation | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedAddPkgId, setSelectedAddPkgId] = useState<string>("");
  const [updatingBox, setUpdatingBox] = useState(false);

  useEffect(() => {
    dispatch(fetchPackages());
    dispatch(fetchConsolidations());
    dispatch(fetchWallet());
  }, [dispatch]);

  // Keep drawer selectedConsolidation updated with live store data
  useEffect(() => {
    if (selectedConsolidation) {
      const fresh = storeConsolidations.find((c) => c.id === selectedConsolidation.id);
      if (fresh) setSelectedConsolidation(fresh);
    }
  }, [storeConsolidations]);

  const consolidations = useMemo(() => {
    return (storeConsolidations || []).map((c) => ({
      id: c.consolidationId || c.id,
      dateCreated: c.createdAt || new Date().toISOString(),
      items: c.packageIds?.length || 1,
      estWeight: `${c.totalWeightKg || 1} kg`,
      shippingFee: c.shippingFee || 0,
      destination: c.destinationWarehouse ? `${c.destinationWarehouse.toUpperCase()}, NG` : 'Lagos, NG',
      status: c.status,
      raw: c,
    }));
  }, [storeConsolidations]);

  const pendingItems = packages.filter((p) =>
    ["received_cn", "ready_to_pack", "received_at_warehouse", "at_china_warehouse"].includes(p.status)
  ).length;

  const inConsolidation = consolidations.filter((c) =>
    ["requested", "pending_packing", "packaging", "packaged"].includes(c.status)
  ).length;

  const readyForShipping = consolidations.filter((c) =>
    ["ready_to_batch", "batched"].includes(c.status)
  ).length;

  const filtered = filter === "all"
    ? consolidations
    : consolidations.filter((c) => {
        if (filter === "pending") return ["requested", "pending_packing"].includes(c.status);
        if (filter === "processing") return ["packaging", "packaged"].includes(c.status);
        if (filter === "completed") return ["ready_to_batch", "batched"].includes(c.status);
        return true;
      });

  // Attached packages inside selected consolidation box
  const attachedPackages = useMemo(() => {
    if (!selectedConsolidation) return [];
    const ids = selectedConsolidation.packageIds || [];
    return packages.filter((p) => ids.includes(p.id) || ids.includes(p.trackingId));
  }, [selectedConsolidation, packages]);

  // Unassigned packages available to be added
  const availablePackages = useMemo(() => {
    if (!selectedConsolidation) return [];
    const attachedIds = selectedConsolidation.packageIds || [];
    const consOrigin = (selectedConsolidation.originCountry || "Guangzhou Hub").toLowerCase().trim();

    return packages.filter((p) => {
      if (attachedIds.includes(p.id) || attachedIds.includes(p.trackingId)) return false;
      const isConsolidableStatus = ["received_cn", "ready_to_pack", "received_at_warehouse", "at_china_warehouse"].includes(p.status);
      const pOrigin = (p.originCountry || "Guangzhou Hub").toLowerCase().trim();
      return isConsolidableStatus && pOrigin === consOrigin;
    });
  }, [selectedConsolidation, packages]);

  const isEditable = selectedConsolidation
    ? ["requested", "pending_packing"].includes(selectedConsolidation.status)
    : false;

  const handleAddPackageToBox = async () => {
    if (!selectedConsolidation || !selectedAddPkgId) {
      message.warning("Please select a package to add.");
      return;
    }

    try {
      setUpdatingBox(true);
      const currentIds = selectedConsolidation.packageIds || [];
      const updatedPackageIds = Array.from(new Set([...currentIds, selectedAddPkgId]));

      await dispatch(
        updateConsolidation({
          id: selectedConsolidation.id,
          packageIds: updatedPackageIds,
        })
      ).unwrap();

      dispatch(fetchConsolidations());
      dispatch(fetchPackages());
      dispatch(fetchWallet());
      setSelectedAddPkgId("");
      message.success("Package added to consolidation box successfully!");
    } catch (err: any) {
      const msg = typeof err === "string" ? err : err?.message || "Failed to add package to box";
      message.error(msg);
    } finally {
      setUpdatingBox(false);
    }
  };

  const handleRemovePackageFromBox = async (pkgId: string) => {
    if (!selectedConsolidation) return;
    const currentIds = selectedConsolidation.packageIds || [];
    const updatedPackageIds = currentIds.filter((id) => id !== pkgId && id !== packages.find(p => p.trackingId === id)?.id);

    if (updatedPackageIds.length === 0) {
      message.error("Consolidation box must contain at least 1 package.");
      return;
    }

    try {
      setUpdatingBox(true);
      await dispatch(
        updateConsolidation({
          id: selectedConsolidation.id,
          packageIds: updatedPackageIds,
        })
      ).unwrap();

      dispatch(fetchConsolidations());
      dispatch(fetchPackages());
      dispatch(fetchWallet());
      message.success("Package removed from consolidation box.");
    } catch (err: any) {
      const msg = typeof err === "string" ? err : err?.message || "Failed to remove package from box";
      message.error(msg);
    } finally {
      setUpdatingBox(false);
    }
  };

  const columns = [
    {
      title: "Consolidation ID",
      dataIndex: "id",
      key: "id",
      render: (text: string) => (
        <span className="font-bold text-[#0A1128] text-sm font-mono">{text}</span>
      ),
    },
    {
      title: "Date Created",
      dataIndex: "dateCreated",
      key: "dateCreated",
      render: (d: string) => (
        <span className="text-slate-600 text-sm">{formatDate(d)}</span>
      ),
    },
    {
      title: "Items",
      dataIndex: "items",
      key: "items",
      render: (count: number) => (
        <span className="text-slate-700 font-bold bg-slate-100 px-2.5 py-1 rounded-full text-xs">
          {count} Parcels
        </span>
      ),
    },
    {
      title: "Est. Weight",
      dataIndex: "estWeight",
      key: "estWeight",
      render: (w: string) => <span className="text-slate-600 font-mono font-medium">{w}</span>,
    },
    {
      title: "Shipping Fee",
      dataIndex: "shippingFee",
      key: "shippingFee",
      render: (fee: number) => (
        <span className="font-bold text-emerald-600 font-mono text-sm">
          {formatNaira(fee)}
        </span>
      ),
    },
    {
      title: "Destination",
      dataIndex: "destination",
      key: "destination",
      render: (dest: string) => (
        <span className="text-slate-600 flex items-center gap-1.5 text-xs font-bold uppercase">
          <EnvironmentOutlined className="text-brand-orange" /> {dest}
        </span>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => <StatusBadge module="shipment" status={status} />,
    },
    {
      title: "Action",
      key: "action",
      render: (_: any, record: any) => (
        <Button
          type="text"
          size="small"
          className="text-brand-orange font-bold hover:bg-orange-50"
          onClick={() => {
            setSelectedConsolidation(record.raw);
            setDrawerOpen(true);
          }}
        >
          View / Edit Box →
        </Button>
      ),
    },
  ];

  const filters: { key: FilterType; label: string }[] = [
    { key: "all", label: "All Consolidations" },
    { key: "pending", label: "Requested / Pending" },
    { key: "processing", label: "In Warehouse Packaging" },
    { key: "completed", label: "Ready / Batched" },
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
            Combine multiple packages into a single master box to save on shipping costs.
          </p>
        </div>
        <Button
          type="primary"
          size="large"
          icon={<PlusOutlined />}
          className="bg-brand-orange hover:bg-[#E86E21] border-none font-bold shadow-md px-6"
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
              PARCELS IN CHINA HUB
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
              ACTIVE CONSOLIDATIONS
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
              READY FOR BATCHING
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

      {/* Consolidation Box Details & Add Parcels Drawer */}
      <Drawer
        title={
          selectedConsolidation ? (
            <div className="flex justify-between items-center w-full pr-4">
              <div>
                <span className="font-bold text-slate-800 text-base font-mono">
                  {selectedConsolidation.consolidationId || selectedConsolidation.id}
                </span>
                <span className="block text-xs font-normal text-slate-500">
                  Consolidation Shipment Box
                </span>
              </div>
              <StatusBadge module="shipment" status={selectedConsolidation.status} />
            </div>
          ) : (
            "Consolidation Box Details"
          )
        }
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        width={560}
        destroyOnClose
      >
        {selectedConsolidation && (
          <div className="space-y-6">
            {/* Status Banner */}
            <div
              className={`p-4 rounded-xl border flex items-center justify-between ${
                isEditable
                  ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                  : "bg-amber-50 border-amber-200 text-amber-900"
              }`}
            >
              <div>
                <div className="font-bold text-xs uppercase tracking-wider mb-0.5">
                  {isEditable ? "EDITABLE BOX" : "LOCKED IN PACKAGING"}
                </div>
                <p className="text-xs m-0 leading-relaxed opacity-90">
                  {isEditable
                    ? "You can add more items to this box or remove items before physical packaging begins."
                    : "Physical packaging has commenced at the China warehouse. Content edits are now locked."}
                </p>
              </div>
              <InfoCircleOutlined className="text-xl ml-3 shrink-0" />
            </div>

            {/* Specifications */}
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
                BOX SPECIFICATIONS
              </h4>
              <Descriptions column={1} bordered size="small" className="bg-white rounded-lg overflow-hidden">
                <Descriptions.Item label="Freight Modality">
                  <Tag color={selectedConsolidation.shippingMethod === "air" ? "blue" : "cyan"} className="uppercase font-bold m-0">
                    {selectedConsolidation.shippingMethod} FREIGHT
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Destination Warehouse">
                  <span className="uppercase font-bold text-slate-700">
                    <EnvironmentOutlined className="mr-1 text-brand-orange" />
                    {selectedConsolidation.destinationWarehouse || "Lagos Central Hub"}
                  </span>
                </Descriptions.Item>
                <Descriptions.Item label="Total Weight">
                  <span className="font-mono font-bold text-brand-navy">
                    {formatWeight(selectedConsolidation.totalWeightKg)}
                  </span>
                </Descriptions.Item>
                <Descriptions.Item label="Total CBM">
                  <span className="font-mono font-bold text-slate-700">
                    {formatCbm(selectedConsolidation.totalCbm)}
                  </span>
                </Descriptions.Item>
                <Descriptions.Item label="Calculated Shipping Fee">
                  <span className="font-mono font-bold text-emerald-600">
                    {formatNaira(selectedConsolidation.shippingFee)}
                  </span>
                </Descriptions.Item>
                <Descriptions.Item label="Payment Method">
                  <span className="uppercase font-bold text-slate-600">
                    <DollarOutlined className="mr-1 text-emerald-500" />
                    {selectedConsolidation.paymentMethod || "Wallet"}
                  </span>
                </Descriptions.Item>
                <Descriptions.Item label="Created Date">
                  <span className="text-slate-600">
                    <CalendarOutlined className="mr-1 text-slate-400" />
                    {formatDate(selectedConsolidation.createdAt)}
                  </span>
                </Descriptions.Item>
              </Descriptions>
            </div>

            {/* Attached Parcels Breakdown */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest m-0">
                  ATTACHED PARCELS ({selectedConsolidation.packageIds.length})
                </h4>
                {isEditable && (
                  <Tag color="emerald" className="font-bold text-[10px] uppercase border-none m-0">
                    EDITABLE
                  </Tag>
                )}
              </div>

              <div className="space-y-3">
                {attachedPackages.length > 0 ? (
                  attachedPackages.map((pkg) => (
                    <div
                      key={pkg.id}
                      className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-start"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-brand-navy text-xs">
                            {pkg.trackingId}
                          </span>
                          <StatusBadge module="shipment" status={pkg.status} />
                        </div>
                        <p className="text-xs text-slate-600 font-medium m-0">{pkg.description}</p>
                        <div className="text-[11px] text-slate-400 font-mono">
                          Weight: {pkg.weightKg}kg | CBM: {pkg.cbm?.toFixed(3) || "0.000"}m³
                        </div>
                      </div>

                      {isEditable && (
                        <Button
                          danger
                          size="small"
                          type="text"
                          loading={updatingBox}
                          icon={<DeleteOutlined />}
                          className="font-bold text-xs hover:bg-red-50"
                          onClick={() => handleRemovePackageFromBox(pkg.id)}
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-center">
                    <p className="text-xs font-bold text-slate-400 m-0">Package IDs in this box:</p>
                    <div className="flex flex-wrap gap-1.5 justify-center mt-2">
                      {selectedConsolidation.packageIds.map((pid) => (
                        <div
                          key={pid}
                          className="flex items-center gap-1 bg-white border border-slate-200 px-2 py-1 rounded text-xs font-mono"
                        >
                          <span>{pid}</span>
                          {isEditable && (
                            <button
                              onClick={() => handleRemovePackageFromBox(pid)}
                              className="text-red-500 hover:text-red-700 ml-1 text-xs font-bold"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Add Available Package Section (Only when status is requested or pending_packing) */}
            {isEditable && (
              <div className="pt-4 border-t border-slate-200 space-y-3">
                <h4 className="text-xs font-bold text-[#0A1128] uppercase tracking-wider m-0">
                  ➕ Add More Parcels to this Box
                </h4>
                <p className="text-xs text-slate-500 m-0 leading-relaxed">
                  Select an unassigned package stored at your China warehouse to add it into this consolidation box.
                </p>

                {availablePackages.length > 0 ? (
                  <div className="flex gap-2">
                    <Select
                      placeholder="Select available parcel to add..."
                      value={selectedAddPkgId || undefined}
                      onChange={(val) => setSelectedAddPkgId(val)}
                      className="flex-1"
                      size="middle"
                    >
                      {availablePackages.map((p) => (
                        <Option key={p.id} value={p.id}>
                          <span className="font-bold font-mono text-xs">{p.trackingId}</span> — {p.description} ({p.weightKg}kg)
                        </Option>
                      ))}
                    </Select>
                    <Button
                      type="primary"
                      loading={updatingBox}
                      disabled={!selectedAddPkgId}
                      className="bg-brand-orange hover:bg-[#E86E21] border-none font-bold"
                      onClick={handleAddPackageToBox}
                    >
                      Add to Box
                    </Button>
                  </div>
                ) : (
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center text-xs text-slate-500">
                    No unassigned parcels available at this warehouse facility right now.
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </Drawer>
    </div>
  );
};
