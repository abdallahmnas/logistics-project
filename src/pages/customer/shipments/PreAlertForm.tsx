import React, { useState } from "react";
import { Card, Form, Input, InputNumber, Select, Button, message } from "antd";
import type { UploadFile } from "antd";
import {
  ArrowLeftOutlined,
  SendOutlined,
  BarcodeOutlined,
  FileTextOutlined,
  PictureOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useAppDispatch } from "../../../store/hooks";
import { createPreAlert } from "../../../store/slices/shipmentSlice";
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
  const [submitting, setSubmitting] = useState(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);

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
            initialValues={{
              originCountry: 'Guangzhou Hub, China',
            }}
          >
            <SectionHeading
              icon={<EnvironmentOutlined />}
              title="Receiving Warehouse Facility"
              subtitle="Select where your supplier is dropping off your package"
            />
            <Form.Item
              name="originCountry"
              label="Receiving Warehouse"
              rules={[{ required: true, message: "Please select a warehouse facility" }]}
            >
              <Select
                size="large"
                options={[
                  { label: "🇨🇳 Guangzhou Main Hub (China)", value: "Guangzhou Hub, China" },
                  { label: "🇨🇳 Yiwu Commodity Hub (China)", value: "Yiwu Hub, China" },
                  { label: "🇬🇧 London Cargo Hub (UK)", value: "London Hub, UK" },
                  { label: "🇺🇸 New York Cargo Hub (US)", value: "New York Hub, US" },
                ]}
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
