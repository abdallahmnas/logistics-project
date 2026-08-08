import React, { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, Timeline, Button } from "antd";
import { ArrowLeftOutlined, RocketOutlined } from "@ant-design/icons";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import {
  fetchBatches,
  fetchPackages,
} from "../../../store/slices/shipmentSlice";
import { StatusBadge } from "../../../components/common/StatusBadge";
import { PriceTag } from "../../../components/common/PriceTag";
import { EmptyState } from "../../../components/common/EmptyState";
import { formatDate, formatWeight, formatCbm } from "../../../utils/formatters";
import type { Package } from "../../../types/shipment.types";

const generateTimelineItems = (pkg: Package) => {
  const items: {
    color: string;
    dot?: React.ReactNode;
    children: React.ReactNode;
  }[] = [];

  if (pkg.preAlertDate) {
    items.push({
      color: "gray",
      children: (
        <div>
          <p className="font-semibold text-slate-700 m-0">Pre-Alert Created</p>
          <p className="text-xs text-slate-500 m-0">
            {formatDate(pkg.preAlertDate)}
          </p>
        </div>
      ),
    });
  }

  if (pkg.receivedDate) {
    items.push({
      color: "blue",
      children: (
        <div>
          <p className="font-semibold text-slate-700 m-0">
            Received at China Hub
          </p>
          <p className="text-xs text-slate-500 m-0">
            {formatDate(pkg.receivedDate)}
          </p>
        </div>
      ),
    });
  }

  if (pkg.shippedDate) {
    items.push({
      color: "orange",
      children: (
        <div>
          <p className="font-semibold text-slate-700 m-0">Departed China</p>
          <p className="text-xs text-slate-500 m-0">
            {formatDate(pkg.shippedDate)}
          </p>
        </div>
      ),
    });
  }

  if (pkg.arrivedDate) {
    items.push({
      color: "green",
      children: (
        <div>
          <p className="font-semibold text-slate-700 m-0">
            Arrived at Destination
          </p>
          <p className="text-xs text-slate-500 m-0">
            {formatDate(pkg.arrivedDate)}
          </p>
        </div>
      ),
    });
  }

  if (pkg.deliveredDate) {
    items.push({
      color: "green",
      dot: <RocketOutlined className="text-xl" />,
      children: (
        <div>
          <p className="font-semibold text-green-600 m-0">Delivered</p>
          <p className="text-xs text-slate-500 m-0">
            {formatDate(pkg.deliveredDate)}
          </p>
        </div>
      ),
    });
  } else if (pkg.status === "ready_for_pickup") {
    items.push({
      color: "green",
      children: (
        <div>
          <p className="font-semibold text-green-600 m-0">Ready for Pickup</p>
          <p className="text-xs text-slate-500 m-0">
            Awaiting customer collection
          </p>
        </div>
      ),
    });
  } else {
    items.push({
      color: "blue",
      children: (
        <div>
          <p className="font-semibold text-brand-navy m-0">Current Status</p>
          <div className="mt-1">
            <StatusBadge module="shipment" status={pkg.status} />
          </div>
        </div>
      ),
    });
  }

  return items;
};

export const ShipmentDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { packages, batches, loading } = useAppSelector(
    (state) => state.shipments,
  );

  useEffect(() => {
    if (packages.length === 0) {
      dispatch(fetchPackages());
    }
    if (batches.length === 0) {
      dispatch(fetchBatches());
    }
  }, [dispatch, packages.length, batches.length]);

  const pkg = packages.find((p) => p.id === id);
  const batch = pkg?.linkedBatchId
    ? batches.find((b) => b.id === pkg.linkedBatchId)
    : undefined;

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate("/customer/shipments")}
          className="mb-2 -ml-2 text-slate-500"
        >
          Back to My Shipments
        </Button>
        <h1 className="text-2xl font-bold text-slate-800 m-0">
          Shipment Detail
        </h1>
        <p className="text-slate-500 mt-1 mb-0 text-sm">
          Full tracking and invoice information
        </p>
      </div>

      {!pkg && !loading ? (
        <EmptyState
          title="Shipment Not Found"
          description="We couldn't find a package matching that ID. It may have been removed or the link is incorrect."
          actionText="Back to My Shipments"
          onAction={() => navigate("/customer/shipments")}
        />
      ) : pkg ? (
        <Card
          bordered={false}
          className="shadow-md rounded-2xl overflow-hidden"
          loading={loading}
        >
          <div className="bg-brand-navy text-white p-6 -mx-6 -mt-6 mb-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <p className="text-slate-400 text-sm mb-1 uppercase tracking-wider">
                  Tracking Number
                </p>
                <h2 className="text-2xl font-bold m-0">{pkg.trackingId}</h2>
                {pkg.chineseTrackingNo && (
                  <p className="text-slate-300 text-sm mt-1">
                    Ref: {pkg.chineseTrackingNo}
                  </p>
                )}
              </div>
              <div className="bg-white/10 px-4 py-2 rounded-lg backdrop-blur-sm">
                <StatusBadge
                  module="shipment"
                  status={pkg.status}
                  type="badge"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-slate-800 mb-6 border-b pb-2">
                Tracking Timeline
              </h3>
              <Timeline items={generateTimelineItems(pkg)} className="mt-4" />
            </div>

            <div className="space-y-6">
              <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">
                  Package Details
                </h3>
                <ul className="space-y-4">
                  <li>
                    <span className="text-slate-500 block text-xs uppercase tracking-wider">
                      Description
                    </span>
                    <span className="font-medium text-slate-800">
                      {pkg.description}
                    </span>
                  </li>
                  <li className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-slate-500 block text-xs uppercase tracking-wider">
                        Method
                      </span>
                      <span className="font-medium text-slate-800 uppercase">
                        {pkg.shippingMethod || "TBD"}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-xs uppercase tracking-wider">
                        Destination
                      </span>
                      <span className="font-medium text-slate-800 capitalize">
                        {pkg.destinationWarehouse || "TBD"}
                      </span>
                    </div>
                  </li>
                  <li className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-slate-500 block text-xs uppercase tracking-wider">
                        Weight
                      </span>
                      <span className="font-medium text-slate-800">
                        {formatWeight(pkg.weightKg || 0)}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-xs uppercase tracking-wider">
                        CBM
                      </span>
                      <span className="font-medium text-slate-800">
                        {formatCbm(pkg.cbm || 0)}
                      </span>
                    </div>
                  </li>
                  {pkg.dimensions && (
                    <li>
                      <span className="text-slate-500 block text-xs uppercase tracking-wider">
                        Dimensions
                      </span>
                      <span className="font-medium text-slate-800">
                        {pkg.dimensions.length} x {pkg.dimensions.width} x{" "}
                        {pkg.dimensions.height} cm
                      </span>
                    </li>
                  )}
                </ul>
              </div>

              <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">
                  Invoice & Payment
                </h3>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-slate-500 text-sm">Invoice Amount</span>
                  {pkg.invoiceAmount ? (
                    <PriceTag amount={pkg.invoiceAmount} size="lg" />
                  ) : (
                    <span className="text-slate-400 italic text-sm">
                      Unbilled
                    </span>
                  )}
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 text-sm">Payment Status</span>
                  <span className="font-medium text-slate-800 capitalize">
                    {pkg.paymentStatus.replace("_", " ")}
                  </span>
                </div>
              </div>

              {batch && (
                <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
                  <h3 className="text-lg font-semibold text-slate-800 mb-4">
                    Batch / Carrier Info
                  </h3>
                  <ul className="space-y-3">
                    <li className="flex justify-between text-sm">
                      <span className="text-slate-500">Master Tracking ID</span>
                      <span className="font-medium text-slate-800">
                        {batch.masterTrackingId}
                      </span>
                    </li>
                    <li className="flex justify-between text-sm">
                      <span className="text-slate-500">Carrier</span>
                      <span className="font-medium text-slate-800">
                        {batch.carrierName}
                      </span>
                    </li>
                    <li className="flex justify-between text-sm">
                      <span className="text-slate-500">
                        Flight / Voyage No.
                      </span>
                      <span className="font-medium text-slate-800">
                        {batch.flightVoyageNo}
                      </span>
                    </li>
                    {batch.expectedArrivalDate && (
                      <li className="flex justify-between text-sm">
                        <span className="text-slate-500">Expected Arrival</span>
                        <span className="font-medium text-slate-800">
                          {formatDate(batch.expectedArrivalDate)}
                        </span>
                      </li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </Card>
      ) : null}
    </div>
  );
};
