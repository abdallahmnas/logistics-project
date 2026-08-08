import React from 'react';
import { Form, Input, Button, Card } from 'antd';
import { EnvironmentOutlined, PhoneOutlined, MailOutlined, SendOutlined } from '@ant-design/icons';
import { WAREHOUSES, CONTACT } from '../../utils/constants';

const { TextArea } = Input;

export const ContactPage: React.FC = () => {
  const [form] = Form.useForm();

  const onFinish = (values: any) => {
    console.log('Received values of form: ', values);
    // Submit contact form logic here
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      {/* Header */}
      <div className="bg-brand-navy pt-16 pb-32 text-center px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5" />
        <h1 className="text-4xl md:text-5xl font-bold text-white relative z-10 mb-4">Get in Touch</h1>
        <p className="text-slate-300 text-lg relative z-10 max-w-2xl mx-auto">
          Our global logistics experts are ready to assist you. Reach out with any questions or support requests.
        </p>
      </div>

      <div className="container mx-auto px-4 -mt-20 relative z-20">
        <div className="flex flex-col lg:flex-row gap-8 max-w-6xl mx-auto">
          {/* Contact Info */}
          <div className="lg:w-1/3 flex flex-col gap-6">
            <Card className="shadow-lg border-none rounded-2xl h-full bg-brand-orange text-white overflow-hidden relative">
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
              <h3 className="text-2xl font-bold mb-8 relative z-10">Contact Information</h3>
              
              <div className="space-y-6 relative z-10">
                <div className="flex items-start gap-4">
                  <EnvironmentOutlined className="text-2xl mt-1 opacity-80" />
                  <div>
                    <h4 className="font-semibold text-lg mb-1">Headquarters</h4>
                    <p className="text-white/80 text-sm leading-relaxed">{CONTACT.address}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <PhoneOutlined className="text-2xl mt-1 opacity-80" />
                  <div>
                    <h4 className="font-semibold text-lg mb-1">Phone</h4>
                    <p className="text-white/80 text-sm">{CONTACT.phone}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <MailOutlined className="text-2xl mt-1 opacity-80" />
                  <div>
                    <h4 className="font-semibold text-lg mb-1">Email</h4>
                    <p className="text-white/80 text-sm">{CONTACT.email}</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Contact Form */}
          <Card className="lg:w-2/3 shadow-xl border-none rounded-2xl p-2 sm:p-6">
            <h3 className="text-2xl font-bold text-slate-800 mb-6">Send us a Message</h3>
            <Form form={form} layout="vertical" onFinish={onFinish} size="large">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                <Form.Item name="name" label="Full Name" rules={[{ required: true }]}>
                  <Input placeholder="John Doe" className="!rounded-lg" />
                </Form.Item>
                <Form.Item name="email" label="Email Address" rules={[{ required: true, type: 'email' }]}>
                  <Input placeholder="john@example.com" className="!rounded-lg" />
                </Form.Item>
                <Form.Item name="phone" label="Phone Number">
                  <Input placeholder="+234..." className="!rounded-lg" />
                </Form.Item>
                <Form.Item name="subject" label="Subject" rules={[{ required: true }]}>
                  <Input placeholder="How can we help?" className="!rounded-lg" />
                </Form.Item>
              </div>
              <Form.Item name="message" label="Message" rules={[{ required: true }]}>
                <TextArea rows={6} placeholder="Type your message here..." className="!rounded-lg" />
              </Form.Item>
              <Form.Item className="mb-0">
                <Button type="primary" htmlType="submit" className="!bg-brand-navy hover:!bg-slate-800 !h-12 !px-8 font-semibold !rounded-lg" icon={<SendOutlined />}>
                  Send Message
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </div>

        {/* Global Offices Section */}
        <div className="mt-24 max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-slate-800 mb-12">Our Global Hubs</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Object.values(WAREHOUSES).map((wh) => (
              <div key={wh.id} className="bg-white p-6 rounded-xl border border-slate-200 hover:border-brand-orange transition-colors">
                <h4 className="font-bold text-slate-800 mb-2">{wh.name}</h4>
                <p className="text-slate-500 text-xs leading-relaxed mb-4">{wh.address}</p>
                <a href={`mailto:${wh.email}`} className="text-brand-orange text-sm font-semibold hover:underline">
                  {wh.email}
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
