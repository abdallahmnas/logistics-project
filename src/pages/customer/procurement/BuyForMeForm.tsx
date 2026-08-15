import React, { useState } from "react";
import { Card, Form, Input, InputNumber, Button, message } from "antd";
import type { UploadFile } from "antd";
import {
  ArrowLeftOutlined,
  SendOutlined,
  LinkOutlined,
  AppstoreOutlined,
  PictureOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useAppDispatch } from "../../../store/hooks";
import { submitProcurement } from "../../../store/slices/procurementSlice";
import { buyForMeSchema, validateForm } from "../../../utils/validators";
import type { ProcurementSubmitPayload } from "../../../types/procurement.types";
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

export const BuyForMeForm: React.FC = () => {
  const [form] = Form.useForm();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  const onFinish = async (values: ProcurementSubmitPayload) => {
    const errors = await validateForm(
      buyForMeSchema,
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
        submitProcurement({
          productUrl: values.productUrl,
          productPhotos: fileList.map((f) => f.name),
          quantity: values.quantity,
          specifications: values.specifications,
          sizes: values.sizes,
          colors: values.colors,
          variations: values.variations,
          notes: values.notes,
        }),
      ).unwrap();
      message.success(
        "Request submitted. Our procurement team will review and send you a quote.",
      );
      navigate("/customer/buy-for-me");
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
          onClick={() => navigate("/customer/buy-for-me")}
          className="mb-2 -ml-2 text-slate-500"
        >
          Back to Buy For Me
        </Button>
        <h1 className="text-2xl font-bold text-slate-800 m-0 text-center">
          New Buy For Me Request
        </h1>
        <p className="text-slate-500 mt-1 mb-0 text-sm text-center">
          Share a product link and details, and our agents will purchase it on
          your behalf.
        </p>
      </div>

      <div className="flex justify-center">
        <Card
          variant="borderless"
          className="shadow-sm rounded-2xl w-full max-w-2xl"
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            requiredMark={false}
          >
            <SectionHeading
              icon={<LinkOutlined />}
              title="Product details"
              subtitle="Where should we buy this item from?"
            />
            <Form.Item
              name="productUrl"
              label="Product Link (1688, Taobao, etc.)"
              rules={[
                { required: true, message: "Please enter the product link" },
              ]}
            >
              <Input placeholder="https://detail.1688.com/..." size="large" />
            </Form.Item>

            <div className="grid grid-cols-2 gap-4">
              <Form.Item
                name="quantity"
                label="Quantity"
                rules={[{ required: true, message: "Please enter quantity" }]}
              >
                <InputNumber className="w-full" min={1} size="large" />
              </Form.Item>
              <Form.Item name="colors" label="Colors (Optional)">
                <Input placeholder="e.g. Red, Black" size="large" />
              </Form.Item>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Form.Item name="sizes" label="Sizes (Optional)">
                <Input placeholder="e.g. XL, 42" size="large" />
              </Form.Item>
              <Form.Item name="variations" label="Variations (Optional)">
                <Input placeholder="e.g. Model A, Model B" size="large" />
              </Form.Item>
            </div>

            <div className="border-t border-slate-100 my-6" />

            <SectionHeading
              icon={<AppstoreOutlined />}
              title="Specifications"
              subtitle="Help the agent find exactly what you need"
            />
            <Form.Item
              name="specifications"
              label="Detailed Specifications / Notes"
              rules={[
                { required: true, message: "Please provide specifications" },
              ]}
            >
              <TextArea
                rows={4}
                placeholder="Please provide any specific instructions for the agent..."
              />
            </Form.Item>

            <Form.Item
              name="notes"
              label="Additional Notes (Optional)"
              className="mb-0"
            >
              <TextArea rows={2} />
            </Form.Item>

            <div className="border-t border-slate-100 my-6" />

            <SectionHeading
              icon={<PictureOutlined />}
              title="Reference photos"
              subtitle="Drag and drop screenshots or product photos (optional)"
            />
            <Form.Item className="mb-0">
              <ImageDropzone
                fileList={fileList}
                onChange={setFileList}
                maxCount={8}
                title="Click or drag photos here to upload"
                hint="PNG, JPG up to 8 photos · helps the agent match the exact product"
              />
            </Form.Item>

            <Form.Item className="mb-0 mt-8 text-right">
              <Button
                onClick={() => navigate("/customer/buy-for-me")}
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
                Submit Request
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </div>
  );
};
