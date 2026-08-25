import React, { useEffect, useMemo, useState } from "react";
import { Card, Form, Input, InputNumber, Select, Button, message, Alert } from "antd";
import type { UploadFile } from "antd";
import {
  ArrowLeftOutlined,
  SendOutlined,
  BarcodeOutlined,
  FileTextOutlined,
  PictureOutlined,
  EnvironmentOutlined,
  CreditCardOutlined,
  CalculatorOutlined,
} from "@ant-design/icons";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { createPreAlert } from "../../../store/slices/shipmentSlice";
import { fetchFacilities } from "../../../store/slices/facilitySlice";
import { preAlertSchema, validateForm } from "../../../utils/validators";
import type { PreAlertPayload } from "../../../types/shipment.types";
import { ImageDropzone } from "../../../components/common/ImageDropzone";

const { TextArea } = Input;

const SectionHeading: React.FC<{
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}> = ({ icon, title, subtitle }) => (
  <div className="flex items-center gap-3 mb-5">
    <div className="w-9 h-9 rounded-lg bg-brand-blue-light text-brand-blue flex items-center justify-center shrink-0">
      {icon}
    </div>
    <div>
      <p className="font-semibold text-slate-800 m-0 leading-tight">{title}</p>
      <p className="text-xs text-slate-400 m-0">{subtitle}</p>
    </div>
  </div>
);

export const PreAlertForm: React.FC = () => {
  const [form] = Form.useForm();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { facilities, loading: facilitiesLoading } = useAppSelector((state) => state.facilities || { facilities: [], loading: false });
  const [submitting, setSubmitting] = useState(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  // Read params passed from the Get-Quote calculator
  const qMode = searchParams.get('mode');        // 'air' | 'sea'
  const qOrigin = searchParams.get('origin');    // 'guangzhou' | 'yiwu'
  const qDesc = searchParams.get('description');
  const qEstNgn = searchParams.get('estimatedNgn');
  const fromCalculator = !!(qMode || qOrigin || qDesc || qEstNgn);

  useEffect(() => {
    dispatch(fetchFacilities());
  }, [dispatch]);

  // Pre-fill non-warehouse fields immediately from URL params
  useEffect(() => {
    const prefill: Record<string, any> = {};
    if (qMode) {
      prefill.shippingMethod = qMode === 'air' ? 'air' : 'sea';
    }
    if (qDesc) {
      prefill.description = qDesc;
    }
    if (qEstNgn) {
      prefill.notes = `Estimated freight cost from calculator: ₦${Number(qEstNgn).toLocaleString()} NGN`;
    }
    if (Object.keys(prefill).length > 0) {
      form.setFieldsValue(prefill);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Purely fetch and map China receiving facilities directly from the database table via API
  const warehouseOptions = useMemo(() => {
    const cnFacilities = (facilities || []).filter(
      (f) => f.country === "CN" && f.status !== "inactive"
    );

    return cnFacilities.map((f) => ({
      label: `🇨🇳 ${f.name} (${f.location})`,
      value: `${f.name}, ${f.location}`,
    }));
  }, [facilities]);

  // Set default initial value to the first China facility returned from the database
  // If a specific origin was passed from the calculator, match it
  useEffect(() => {
    if (warehouseOptions.length > 0) {
      if (qOrigin && !form.getFieldValue("originCountry")) {
        // Try to match guangzhou or yiwu in the facility name
        const keyword = qOrigin.toLowerCase();
        const matched = warehouseOptions.find((opt) =>
          opt.label.toLowerCase().includes(keyword) ||
          opt.value.toLowerCase().includes(keyword)
        );
        form.setFieldsValue({ originCountry: matched?.value ?? warehouseOptions[0].value });
      } else if (!form.getFieldValue("originCountry")) {
        form.setFieldsValue({ originCountry: warehouseOptions[0].value });
      }
    }
  }, [warehouseOptions, form, qOrigin]);

  const onFinish = async (values: PreAlertPayload) => {
    const errors = await validateForm(
      preAlertSchema,
      values as unknown as Record<string, unknown>,
    );
    if (Object.keys(errors).length > 0) {
      form.setFields(
        Object.keys(errors).map((key) => ({
          name: key,
          errors: [errors[key]],
        })),
      );
      return;
    }

    setSubmitting(true);
    try {
      await dispatch(
        createPreAlert({
          chineseTrackingNo: values.chineseTrackingNo,
          supplierName: values.supplierName,
          description: values.description,
          originCountry: values.originCountry,
          shippingMethod: values.shippingMethod,
          paymentOption: values.paymentOption,
          estimatedItems: values.estimatedItems,
          notes: values.notes,
          photos: fileList.map((f) => f.name),
        }),
      ).unwrap();
      message.success(
        "Package pre-alerted successfully. We will notify you when it arrives.",
      );
      navigate("/customer/shipments");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="max-w-2xl mx-auto">
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate("/customer/shipments")}
          className="mb-2 -ml-2 text-slate-500"
        >
          Back to My Shipments
        </Button>
        <h1 className="text-2xl font-bold text-slate-800 m-0 text-center">
          Pre-Alert a Package
        </h1>
        <p className="text-slate-500 mt-1 mb-0 text-sm text-center">
          Let us know a package is coming so we can watch for it at our warehouse facility.
        </p>
      </div>

      {fromCalculator && (
        <div className="max-w-2xl mx-auto">
          <Alert
            type="success"
            icon={<CalculatorOutlined />}
            showIcon
            closable
            message="Form pre-filled from your quote"
            description={
              <span className="text-xs">
                We've pre-filled the <strong>shipping method</strong>, <strong>cargo description</strong>, and <strong>estimated cost</strong> from the freight calculator.
                Please review and fill in the remaining required fields before submitting.
              </span>
            }
            className="mb-4 rounded-xl"
          />
        </div>
      )}

      <div className="flex justify-center">
        <Card
          bordered={false}
          className="shadow-sm rounded-2xl w-full max-w-2xl"
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            requiredMark={false}
          >
            <SectionHeading
              icon={<EnvironmentOutlined />}
              title="Receiving Warehouse Facility"
              subtitle="Select where your supplier is dropping off your package in China"
            />
            <Form.Item
              name="originCountry"
              label="Receiving Warehouse"
              rules={[{ required: true, message: "Please select a warehouse facility" }]}
            >
              <Select
                size="large"
                loading={facilitiesLoading}
                placeholder="Select receiving warehouse..."
                options={warehouseOptions}
              />
            </Form.Item>

            <div className="border-t border-slate-100 my-6" />

            <SectionHeading
              icon={<BarcodeOutlined />}
              title="Tracking details"
              subtitle="The Chinese domestic tracking number and supplier"
            />
            <Form.Item
              name="chineseTrackingNo"
              label="Domestic / Foreign Tracking Number"
              rules={[
                { required: true, message: "Please enter the tracking number" },
              ]}
            >
              <Input placeholder="e.g. SF1234567890123" size="large" />
            </Form.Item>

            <Form.Item
              name="supplierName"
              label="Supplier / Seller Name"
              rules={[
                { required: true, message: "Please enter the supplier name" },
              ]}
            >
              <Input placeholder="e.g. Guangzhou Trading Co." size="large" />
            </Form.Item>

            <div className="border-t border-slate-100 my-6" />

            <SectionHeading
              icon={<FileTextOutlined />}
              title="Item description"
              subtitle="What's inside, and anything the warehouse team should know"
            />
            <Form.Item
              name="description"
              label="Item Description"
              rules={[{ required: true, message: "Please describe the items" }]}
            >
              <TextArea
                rows={3}
                placeholder="e.g. 2 boxes of men's sneakers, assorted sizes"
              />
            </Form.Item>

            <div className="grid grid-cols-2 gap-4">
              <Form.Item
                name="estimatedItems"
                label="Estimated Number of Items (Optional)"
              >
                <InputNumber className="w-full" min={1} size="large" />
              </Form.Item>
              <Form.Item
                name="notes"
                label="Additional Notes (Optional)"
                className="mb-0"
              >
                <Input placeholder="Anything else to flag" size="large" />
              </Form.Item>
            </div>

            <div className="border-t border-slate-100 my-6" />

            <SectionHeading
              icon={<CreditCardOutlined />}
              title="Payment Preference"
              subtitle="Indicate when you prefer to pay for your freight shipping"
            />

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4 flex items-start gap-3 text-xs text-blue-900">
              <span className="text-base leading-none">ℹ️</span>
              <div>
                <p className="font-bold m-0 mb-0.5">No payment is required right now!</p>
                <p className="m-0 text-blue-800 leading-relaxed">
                  Your final freight charges will be calculated after our China warehouse team physically receives, weighs, and measures your package.
                </p>
              </div>
            </div>

            <Form.Item
              name="paymentOption"
              label="Preferred Payment Option"
              initialValue="pay_before_dispatch"
            >
              <Select
                size="large"
                options={[
                  {
                    label: "💳 Pay Before Overseas Dispatch (Pay when weighed in China)",
                    value: "pay_before_dispatch",
                  },
                  {
                    label: "🚚 Pay On Delivery / Pickup (Pay at Nigeria hub arrival)",
                    value: "pay_on_delivery",
                  },
                ]}
              />
            </Form.Item>

            <div className="border-t border-slate-100 my-6" />

            <SectionHeading
              icon={<PictureOutlined />}
              title="Purchase photos"
              subtitle="Drag and drop a screenshot of the order or packing slip (optional)"
            />
            <Form.Item className="mb-0">
              <ImageDropzone
                fileList={fileList}
                onChange={setFileList}
                maxCount={6}
                title="Click or drag photos here to upload"
                hint="PNG, JPG up to 6 photos · helps us match it on arrival"
              />
            </Form.Item>

            <Form.Item className="mb-0 mt-8 text-right">
              <Button
                onClick={() => navigate("/customer/shipments")}
                className="mr-2"
                size="large"
              >
                Cancel
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                icon={<SendOutlined />}
                loading={submitting}
                size="large"
              >
                Submit Pre-Alert
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </div>
  );
};
