import React, { useEffect, useState } from "react";
import { Table, Card, Button, Input, Select, Tag, Tabs } from "antd";
import { SearchOutlined, EyeOutlined, PlusOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { fetchPackages } from "../../../store/slices/shipmentSlice";
import { StatusBadge } from "../../../components/common/StatusBadge";
import { PriceTag } from "../../../components/common/PriceTag";
import type { Package } from "../../../types/shipment.types";

const { Option } = Select;

export const MyShipments: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { packages, loading } = useAppSelector((state) => state.shipments);
  const [searchText, setSearchText] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    dispatch(fetchPackages());
  }, [dispatch]);

  const filteredPackages = packages.filter((pkg) => {
    const matchesSearch =
      pkg.trackingId.toLowerCase().includes(searchText.toLowerCase()) ||
      (pkg.chineseTrackingNo &&
        pkg.chineseTrackingNo.toLowerCase().includes(searchText.toLowerCase()));
    const matchesStatus = filterStatus === "all" || pkg.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const columns = [
    {
      title: "Tracking Info",
      key: "tracking",
      render: (_: unknown, record: Package) => (
        <div>
          <div className="font-bold text-brand-navy">{record.trackingId}</div>
          {record.chineseTrackingNo && (
            <div className="text-xs text-slate-500">
              CN: {record.chineseTrackingNo}
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "Type",
      dataIndex: "shippingMethod",
      key: "shippingMethod",
      render: (method: string) => (
        <Tag
          color={
            method === "air" ? "blue" : method === "sea" ? "cyan" : "default"
          }
          className="uppercase"
        >
          {method || "Pending"}
        </Tag>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <StatusBadge module="shipment" status={status} />
      ),
    },
    {
      title: "Invoice",
      key: "invoice",
      render: (_: unknown, record: Package) =>
        record.invoiceAmount ? (
          <PriceTag amount={record.invoiceAmount} size="sm" />
        ) : (
          <span className="text-slate-400 italic">Unbilled</span>
        ),
    },
    {
      title: "Action",
      key: "action",
      render: (_: unknown, record: Package) => (
        <Button
          type="text"
          icon={<EyeOutlined />}
          className="text-brand-navy hover:bg-slate-100"
          onClick={() => navigate(`/customer/shipments/${record.id}`)}
        >
          View
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 m-0">
            My Shipments
          </h1>
          <p className="text-slate-500 mt-1 mb-0 text-sm">
            Track and manage your packages
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            size="large"
            className="font-bold"
            onClick={() => navigate("/customer/consolidation/new")}
          >
            Consolidate Items
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            size="large"
            className="bg-brand-gold text-brand-navy font-bold border-none hover:bg-yellow-500"
            onClick={() => navigate("/customer/shipments/pre-alert")}
          >
            Pre-Alert Package
          </Button>
        </div>
      </div>

      <Card bordered={false} className="shadow-sm rounded-2xl">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <Input
            placeholder="Search tracking ID..."
            prefix={<SearchOutlined className="text-slate-400" />}
            className="md:w-1/3"
            size="large"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
          <Select
            defaultValue="all"
            size="large"
            className="md:w-48"
            onChange={setFilterStatus}
          >
            <Option value="all">All Statuses</Option>
            <Option value="pre_alerted">Pre-Alerted</Option>
            <Option value="received_cn">In China Hub</Option>
            <Option value="ready_to_pack">Ready to Pack</Option>
            <Option value="under_packing">Under Packing</Option>
            <Option value="shipping_exported">In Transit</Option>
            <Option value="arrived_ng">Arrived in NG</Option>
            <Option value="ready_for_pickup">Ready for Pickup</Option>
            <Option value="delivered">Delivered</Option>
          </Select>
        </div>

        <Tabs
          defaultActiveKey="1"
          items={[
            {
              key: "1",
              label: "All Packages",
              children: (
                <Table
                  columns={columns}
                  dataSource={filteredPackages}
                  rowKey="id"
                  loading={loading}
                  scroll={{ x: 800 }}
                  pagination={{ pageSize: 10 }}
                />
              ),
            },
            {
              key: "2",
              label: "Needs Attention",
              children: (
                <Table
                  columns={columns}
                  dataSource={filteredPackages.filter(
                    (p) => p.paymentStatus === "unpaid" && p.invoiceAmount,
                  )}
                  rowKey="id"
                  loading={loading}
                  scroll={{ x: 800 }}
                  locale={{
                    emptyText: "No packages need attention at the moment.",
                  }}
                />
              ),
            },
          ]}
        />
      </Card>
    </div>
  );
};
