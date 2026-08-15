import React, { useState } from 'react';
import { Button, Input, Select, Upload, Card, Form, message } from 'antd';
import type { UploadFile } from 'antd';
import { CloudUploadOutlined, CustomerServiceOutlined, FileTextOutlined, PhoneOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../../store/hooks';
import { createTicket } from '../../../store/slices/supportSlice';
import { uploadSingleFile } from '../../../services/uploadService';

const { TextArea } = Input;
const { Dragger } = Upload;

export const OpenSupportTicket: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [form] = Form.useForm();
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const submitTicket = async (values: {
    subject: string;
    category: 'shipment' | 'payment' | 'exchange' | 'procurement' | 'delivery' | 'account' | 'other';
    referenceId?: string;
    message: string;
  }) => {
    setSubmitting(true);
    try {
      const attachments = await Promise.all(
        files.map(async ({ originFileObj }) => {
          if (!originFileObj) throw new Error('An attachment could not be read. Please remove it and try again.');
          return uploadSingleFile(originFileObj, 'support-tickets');
        })
      );
      await dispatch(createTicket({ ...values, attachments } as any)).unwrap();
      message.success('Your support ticket has been submitted.');
      navigate('/customer/support');
    } catch (error: any) {
      message.error(error?.message || 'Unable to submit the support ticket. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="animate-fade-in-up max-w-[1000px] mx-auto py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold text-[#0A1128] m-0 mb-2 tracking-tight">Open a Support Ticket</h1>
        <p className="text-slate-600 text-base m-0 max-w-xl">
          Need assistance? Fill out the form below, and our global support team will respond within 2-4 hours.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Container */}
        <div className="lg:col-span-2 relative">
          {/* Orange accent line */}
          <div className="absolute left-3 top-0 bottom-0 w-1 bg-[#b34000] rounded-full pointer-events-none"></div>
          
          <Form
            form={form}
            layout="vertical"
            onFinish={submitTicket}
            className="bg-white rounded-lg shadow-sm border border-slate-100"
            style={{ padding: '2rem 2rem 2rem 2.5rem' }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-[10px] font-bold text-[#0A1128] uppercase tracking-wider mb-2">Subject</label>
                <Form.Item name="subject" className="mb-0" rules={[{ required: true, message: 'Please describe the issue' }]}>
                  <Input placeholder="Briefly describe your issue" className="h-12 bg-slate-50 border-transparent hover:border-slate-300 text-sm rounded-md px-4" />
                </Form.Item>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-[#0A1128] uppercase tracking-wider mb-2">Category</label>
                <Form.Item name="category" className="mb-0" rules={[{ required: true, message: 'Please select a category' }]}>
                <Select
                  placeholder="Select a category"
                  className="w-full h-12 [&_.ant-select-selector]:border-transparent [&_.ant-select-selector]:hover:border-slate-300 [&_.ant-select-selector]:bg-slate-50 [&_.ant-select-selector]:h-12 [&_.ant-select-selection-item]:leading-[46px] rounded-md text-sm"
                  options={[
                    { value: 'shipment', label: 'Shipment' },
                    { value: 'payment', label: 'Billing & Payments' },
                    { value: 'exchange', label: 'Currency Exchange' },
                    { value: 'procurement', label: 'Buy For Me' },
                    { value: 'delivery', label: 'Local Delivery' },
                    { value: 'account', label: 'Account' },
                    { value: 'other', label: 'Other' },
                  ]}
                />
                </Form.Item>
              </div>
            </div>

            <div className="mb-6 relative">
              <div className="flex justify-between items-center mb-2">
                <label className="block text-[10px] font-bold text-[#0A1128] uppercase tracking-wider">Related Shipment ID</label>
                <span className="text-[10px] font-bold text-slate-400">Optional</span>
              </div>
              <Form.Item name="referenceId" className="mb-0">
              <Input 
                placeholder="e.g. GL-9482-USA" 
                prefix={<span className="text-slate-400 mr-2 text-lg">📦</span>}
                className="h-12 bg-slate-50 border-transparent hover:border-slate-300 text-sm rounded-md px-4" 
              />
              </Form.Item>
            </div>

            <div className="mb-6">
              <label className="block text-[10px] font-bold text-[#0A1128] uppercase tracking-wider mb-2">Description</label>
              <Form.Item name="message" rules={[{ required: true, message: 'Please provide details of your issue' }, { min: 10, message: 'Please provide at least 10 characters' }]} className="mb-0">
              <TextArea 
                placeholder="Please provide detailed information about your inquiry..." 
                rows={6}
                className="bg-slate-50 border-transparent hover:border-slate-300 text-sm rounded-md p-4 resize-none" 
              />
              </Form.Item>
            </div>

            <div className="mb-8">
              <label className="block text-[10px] font-bold text-[#0A1128] uppercase tracking-wider mb-2">Attachments</label>
              <Dragger
                className="bg-slate-50 border-2 border-dashed border-slate-200 hover:border-brand-orange hover:bg-orange-50/10 transition-colors p-6 rounded-lg text-center"
                beforeUpload={() => false}
                fileList={files}
                onChange={({ fileList: newFileList }) => setFiles(newFileList.slice(-5))}
                accept="image/jpeg,image/png,application/pdf"
                maxCount={5}
              >
                <p className="ant-upload-drag-icon text-brand-orange text-4xl mb-3 flex justify-center">
                  <div className="w-16 h-16 rounded-xl bg-orange-50 flex items-center justify-center">
                    <CloudUploadOutlined />
                  </div>
                </p>
                <p className="font-bold text-[#0A1128] text-base mb-1">Drag and drop files here</p>
                <p className="text-slate-500 text-sm mb-4">or click to browse from your computer</p>
                <div className="flex justify-center gap-4 text-xs font-bold text-slate-400">
                  <span>🖼️ JPG, PNG</span>
                  <span>📄 PDF</span>
                  <span>📦 Max 10MB</span>
                </div>
              </Dragger>
            </div>

            <div className="flex justify-end gap-4 items-center">
              <Button type="text" className="font-bold text-[#0A1128] hover:bg-slate-100 px-6 h-12" onClick={() => navigate('/customer/support')}>
                Cancel
              </Button>
              <Button htmlType="submit" loading={submitting} type="primary" className="bg-[#0A1128] hover:bg-[#1a2542] border-none font-bold px-8 h-12 shadow-md flex items-center gap-2">
                Submit Ticket <span className="text-brand-orange ml-1">▶</span>
              </Button>
            </div>
          </Form>
        </div>

        {/* Right Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Priority Line Card */}
          <Card bordered={false} className="shadow-lg border-none rounded-xl bg-[#0A1128] text-white relative overflow-hidden" bodyStyle={{ padding: '32px 24px' }}>
            <div className="absolute right-0 top-0 w-32 h-full bg-white/5 skew-x-12 translate-x-10"></div>
            <div className="relative z-10">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-10 h-10 rounded-full bg-blue-500/20 text-blue-300 flex items-center justify-center shrink-0">
                  <CustomerServiceOutlined className="text-xl" />
                </div>
                <h2 className="text-2xl font-bold text-white leading-tight m-0">Need immediate<br/>help?</h2>
              </div>
              <p className="text-blue-100 text-sm mb-6 leading-relaxed opacity-80">
                For urgent matters concerning high-value cargo currently in transit, please contact our 24/7 priority line.
              </p>
              <div className="bg-white/10 rounded-lg p-3 flex items-center gap-3 mb-4 backdrop-blur-sm border border-white/10 text-white font-mono text-sm">
                <PhoneOutlined className="opacity-50" />
                +1 (800) 555-0199
              </div>
              <div className="text-[10px] font-bold text-blue-300 uppercase tracking-widest text-center">
                AVERAGE HOLD TIME: &lt; 2 MINS
              </div>
            </div>
          </Card>

          {/* Suggested Articles */}
          <Card bordered={false} className="shadow-sm border border-slate-100 rounded-xl" bodyStyle={{ padding: '24px' }}>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">SUGGESTED ARTICLES</div>
            
            <div className="space-y-6">
              <div className="flex gap-4 cursor-pointer group">
                <div className="text-brand-orange mt-1">
                  <FileTextOutlined className="text-lg" />
                </div>
                <div>
                  <h4 className="font-bold text-[#0A1128] group-hover:text-brand-orange transition-colors mb-1 m-0">How to Track Your Shipment</h4>
                  <p className="text-xs text-slate-500 leading-relaxed m-0">Learn how to use the Global Tracking ID to monitor your carg...</p>
                </div>
              </div>

              <div className="flex gap-4 cursor-pointer group">
                <div className="text-brand-orange mt-1">
                  <FileTextOutlined className="text-lg" />
                </div>
                <div>
                  <h4 className="font-bold text-[#0A1128] group-hover:text-brand-orange transition-colors mb-1 m-0">Understanding Customs<br/>Clearance</h4>
                  <p className="text-xs text-slate-500 leading-relaxed m-0">Required documentation and expected timelines for...</p>
                </div>
              </div>

              <div className="flex gap-4 cursor-pointer group">
                <div className="text-brand-orange mt-1">
                  <FileTextOutlined className="text-lg" />
                </div>
                <div>
                  <h4 className="font-bold text-[#0A1128] group-hover:text-brand-orange transition-colors mb-1 m-0">Disputing a Billing Charge</h4>
                  <p className="text-xs text-slate-500 leading-relaxed m-0">Steps to take if you notice an unexpected surcharge on your...</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
