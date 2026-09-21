import React, { useEffect, useState } from 'react';
import {
  Card,
  Table,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  Switch,
  Select,
  Upload,
  message,
  Tag,
  Space,
  Spin,
  Alert,
} from 'antd';
import type { UploadFile } from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CloudUploadOutlined,
  PictureOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import {
  fetchAdminBanners,
  createBanner,
  updateBanner,
  deleteBanner,
} from '../../../store/slices/bannerSlice';
import type { Banner } from '../../../types/banner.types';

const { Option } = Select;
const { TextArea } = Input;

export const BannerManagement: React.FC = () => {
  const dispatch = useAppDispatch();
  const [form] = Form.useForm();
  const { adminBanners, loading } = useAppSelector((state) => state.banners);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  useEffect(() => {
    dispatch(fetchAdminBanners());
  }, [dispatch]);

  const openCreateModal = () => {
    setEditingBanner(null);
    form.resetFields();
    setFileList([]);
    setModalOpen(true);
  };

  const openEditModal = (b: Banner) => {
    setEditingBanner(b);
    form.setFieldsValue({
      title: b.title,
      subtitle: b.subtitle,
      linkUrl: b.linkUrl,
      targetScreen: b.targetScreen || 'home',
      displayOrder: b.displayOrder,
      isActive: b.isActive,
    });
    setFileList([]);
    setModalOpen(true);
  };

  const handleSubmit = async (values: any) => {
    if (!editingBanner && fileList.length === 0 && !values.imageUrl) {
      message.error('Please upload a banner image');
      return;
    }

    try {
      setSubmitting(true);
      const formData = new FormData();
      formData.append('title', values.title);
      if (values.subtitle) formData.append('subtitle', values.subtitle);
      if (values.linkUrl) formData.append('linkUrl', values.linkUrl);
      if (values.targetScreen) formData.append('targetScreen', values.targetScreen);
      formData.append('displayOrder', String(values.displayOrder || 0));
      formData.append('isActive', String(values.isActive !== false));

      if (fileList.length > 0 && fileList[0].originFileObj) {
        formData.append('image', fileList[0].originFileObj as File);
      }

      if (editingBanner) {
        await dispatch(updateBanner({ id: editingBanner.id, formData })).unwrap();
        message.success(`Banner "${values.title}" updated successfully!`);
      } else {
        await dispatch(createBanner(formData)).unwrap();
        message.success(`Banner "${values.title}" created successfully!`);
      }

      setModalOpen(false);
      dispatch(fetchAdminBanners());
    } catch (err: any) {
      message.error(err?.message || err || 'Failed to save banner');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    Modal.confirm({
      title: `Delete Banner "${title}"?`,
      content: 'Are you sure you want to remove this home screen sliding banner?',
      okText: 'Delete',
      okType: 'danger',
      onOk: async () => {
        try {
          await dispatch(deleteBanner(id)).unwrap();
          message.success('Banner removed successfully');
          dispatch(fetchAdminBanners());
        } catch (err: any) {
          message.error(err || 'Failed to delete banner');
        }
      },
    });
  };

  const columns = [
    {
      title: 'Order',
      dataIndex: 'displayOrder',
      key: 'displayOrder',
      width: 70,
      render: (order: number) => (
        <span className="font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded text-xs">
          #{order}
        </span>
      ),
    },
    {
      title: 'Preview',
      dataIndex: 'imageUrl',
      key: 'imageUrl',
      width: 130,
      render: (url: string, record: Banner) => (
        <div className="w-24 h-14 rounded-lg overflow-hidden border border-slate-200 bg-slate-50 relative group">
          <img src={url} alt={record.title} className="w-full h-full object-cover" />
        </div>
      ),
    },
    {
      title: 'Banner Info',
      key: 'info',
      render: (record: Banner) => (
        <div>
          <div className="font-extrabold text-[#0A1128] text-sm">{record.title}</div>
          {record.subtitle && <div className="text-xs text-slate-500 line-clamp-1">{record.subtitle}</div>}
          <div className="flex gap-2 mt-1">
            {record.targetScreen && (
              <Tag color="blue" className="text-[10px] font-bold border-none uppercase">
                Route: {record.targetScreen}
              </Tag>
            )}
            {record.linkUrl && (
              <span className="text-[11px] text-brand-orange truncate max-w-[200px]">
                🔗 {record.linkUrl}
              </span>
            )}
          </div>
        </div>
      ),
    },
    {
      title: 'Status',
      key: 'isActive',
      width: 110,
      render: (record: Banner) =>
        record.isActive ? (
          <Tag color="green" icon={<CheckCircleOutlined />} className="font-bold border-none text-[10px] uppercase">
            ACTIVE
          </Tag>
        ) : (
          <Tag color="default" icon={<CloseCircleOutlined />} className="font-bold border-none text-[10px] uppercase">
            INACTIVE
          </Tag>
        ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 140,
      render: (record: Banner) => (
        <Space>
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => openEditModal(record)}
            className="font-bold text-xs"
          >
            Edit
          </Button>
          <Button
            danger
            size="small"
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id, record.title)}
            className="font-bold text-xs"
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-gradient-to-r from-[#0A1128] to-[#1C2A4E] p-6 rounded-2xl text-white shadow-md gap-4">
        <div>
          <span className="text-xs font-bold text-brand-orange uppercase tracking-wider block mb-1">
            Mobile App Content Management
          </span>
          <h1 className="text-2xl font-black text-white m-0 flex items-center gap-2">
            <PictureOutlined className="text-brand-orange" /> Home Screen Sliding Banners
          </h1>
          <p className="text-slate-300 text-sm mt-1 mb-0 max-w-xl">
            Upload promotional banners, configure display ordering, and set target screen navigation for mobile apps.
          </p>
        </div>

        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={openCreateModal}
          className="bg-brand-orange hover:bg-[#E86E21] border-none font-bold text-xs h-10 px-5 rounded-xl shadow"
        >
          Add New Banner
        </Button>
      </div>

      <Alert
        type="info"
        showIcon
        message="Public Mobile API Integration"
        description="Mobile applications fetch active sliding banners automatically from GET /api/v1/banners. Banners are presented on the home screen carousel ordered by Display Order."
        className="rounded-xl border-slate-200"
      />

      {/* Banners Table */}
      <Card bordered={false} className="shadow-sm border border-slate-100 rounded-2xl" bodyStyle={{ padding: '0' }}>
        <Table
          dataSource={adminBanners}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 8 }}
        />
      </Card>

      {/* Add / Edit Banner Modal */}
      <Modal
        title={editingBanner ? `Edit Banner — ${editingBanner.title}` : 'Create Mobile Sliding Banner'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        width={560}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit} className="pt-2">
          <Form.Item
            name="title"
            label={<span className="text-xs font-bold text-slate-700 uppercase">Banner Headline Title <span className="text-red-500">*</span></span>}
            rules={[{ required: true, message: 'Please enter banner title' }]}
          >
            <Input placeholder="e.g. Fast Air Freight Special" size="large" className="bg-slate-50 border-slate-200 font-bold" />
          </Form.Item>

          <Form.Item
            name="subtitle"
            label={<span className="text-xs font-bold text-slate-500 uppercase">Subtitle / Promotional Description</span>}
          >
            <TextArea rows={2} placeholder="e.g. Guangzhou to Lagos in 3-5 business days at ₦12,500/kg." className="bg-slate-50 border-slate-200" />
          </Form.Item>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item
              name="targetScreen"
              label={<span className="text-xs font-bold text-slate-500 uppercase">Mobile App Target Screen</span>}
              initialValue="home"
            >
              <Select size="large">
                <Option value="home">🏠 Home Screen</Option>
                <Option value="air_freight">✈️ Air Cargo Shipping</Option>
                <Option value="sea_freight">🚢 Sea Freight</Option>
                <Option value="procurement">🛍️ Buy-For-Me Procurement</Option>
                <Option value="exchange">💱 RMB Currency Exchange</Option>
                <Option value="wallet">💳 Wallet Top Up</Option>
                <Option value="delivery">🚚 Doorstep Local Delivery</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="displayOrder"
              label={<span className="text-xs font-bold text-slate-500 uppercase">Carousel Display Order Index</span>}
              initialValue={1}
            >
              <InputNumber size="large" className="w-full font-bold" min={0} placeholder="1" />
            </Form.Item>
          </div>

          <Form.Item
            name="linkUrl"
            label={<span className="text-xs font-bold text-slate-500 uppercase">Optional External URL Link</span>}
          >
            <Input placeholder="e.g. https://hamzarmb.com/air-freight-promo" size="large" className="bg-slate-50 border-slate-200" />
          </Form.Item>

          <Form.Item name="isActive" valuePropName="checked" initialValue={true} label={<span className="text-xs font-bold text-slate-500 uppercase">Active Banner Status</span>}>
            <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
          </Form.Item>

          <Form.Item label={<span className="text-xs font-bold text-slate-500 uppercase">Banner Image Upload (16:9 Aspect Ratio)</span>}>
            <Upload.Dragger
              beforeUpload={() => false}
              accept="image/*"
              maxCount={1}
              fileList={fileList}
              onChange={({ fileList }) => {
                fileList.forEach((f) => { f.status = 'done'; });
                setFileList(fileList);
              }}
            >
              <p className="ant-upload-drag-icon"><CloudUploadOutlined className="text-brand-orange text-2xl" /></p>
              <p className="ant-upload-text text-xs font-bold">Click or drag banner image photo here</p>
            </Upload.Dragger>
          </Form.Item>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <Button onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={submitting} className="bg-brand-orange border-none font-bold">
              Save Banner →
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default BannerManagement;
