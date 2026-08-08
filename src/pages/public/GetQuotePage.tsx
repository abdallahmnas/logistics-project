import React from 'react';
import { Form, Input, Button, Card, Select, InputNumber } from 'antd';
import { 
  LockOutlined, 
  CalculatorOutlined,
  EnvironmentOutlined,
  GlobalOutlined,
  MailOutlined
} from '@ant-design/icons';

const { Option } = Select;

export const GetQuotePage: React.FC = () => {
  const [form] = Form.useForm();

  const onFinish = (values: any) => {
    console.log('Quote Request:', values);
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex flex-col md:flex-row relative">
      {/* Left Dark Background Strip (Desktop) */}
      <div className="hidden md:block absolute left-0 top-0 bottom-0 w-1/3 lg:w-[40%] bg-brand-navy z-0" />
      {/* Right Light Background Strip (Desktop) */}
      <div className="hidden md:block absolute right-0 top-0 bottom-0 w-2/3 lg:w-[60%] bg-slate-50 z-0" />

      {/* Content Container */}
      <div className="container mx-auto px-4 md:px-8 py-12 md:py-20 relative z-10 w-full">
        
        {/* Header Text (Mobile: bg-brand-navy padding, Desktop: just text on dark bg) */}
        <div className="md:w-[40%] lg:w-[35%] md:pr-12 text-white mb-10 md:mb-0 md:fixed md:top-40 max-w-sm bg-brand-navy p-6 md:p-0 rounded-2xl md:rounded-none">
          <div className="flex items-center gap-4 text-brand-orange text-xs font-bold tracking-widest uppercase mb-4">
            <span className="w-8 h-[1px] bg-brand-orange" />
            Connect With Us
          </div>
          <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
            Precision logistics, tailored to your scale.
          </h1>
          <p className="text-slate-300 text-base leading-relaxed">
            Request a comprehensive freight quote or reach out to our global support teams. We engineer supply chain solutions for the world's most demanding industries.
          </p>

          <div className="mt-12 bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 flex items-center gap-4">
             <div className="w-12 h-12 rounded-lg bg-brand-orange flex items-center justify-center shrink-0">
               <span className="text-white font-bold">24/7</span>
             </div>
             <div>
               <p className="text-xs text-slate-400 font-semibold mb-1">24/7 Global AOG Desk</p>
               <p className="text-xl text-white font-bold">+1 800 555-CRIT</p>
             </div>
          </div>
        </div>

        {/* Right Content Area */}
        <div className="md:ml-[40%] lg:ml-[35%] flex flex-col lg:flex-row gap-8">
          
          {/* Main Form Card */}
          <Card className="flex-1 shadow-2xl border-none rounded-2xl overflow-hidden bg-white p-2 sm:p-6">
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100">
              <h2 className="text-3xl font-bold text-slate-800 m-0">Request a Quote</h2>
              <div className="flex items-center gap-2 text-slate-500 font-medium text-sm">
                <LockOutlined /> Secure Form
              </div>
            </div>

            <Form form={form} layout="vertical" onFinish={onFinish} size="large">
              
              {/* Step 1 */}
              <div className="mb-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">1</div>
                  <h3 className="text-lg font-semibold text-slate-700 m-0">Freight Modality</h3>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Selectable Cards (Simulated with Radio style or just standard buttons/divs) */}
                  <label className="cursor-pointer">
                    <input type="radio" name="modality" value="ocean" className="peer sr-only" defaultChecked />
                    <div className="border-2 border-slate-200 rounded-xl p-4 peer-checked:border-brand-orange peer-checked:bg-orange-50 transition-all relative">
                      <div className="w-4 h-4 rounded-full border-2 border-slate-300 absolute top-4 right-4 peer-checked:border-brand-orange flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-brand-orange opacity-0 peer-checked:opacity-100" />
                      </div>
                      <GlobalOutlined className="text-2xl text-slate-700 mb-2 block" />
                      <p className="font-bold text-slate-800 m-0">Ocean Freight</p>
                      <p className="text-xs text-slate-500 m-0">FCL / LCL Shipping</p>
                    </div>
                  </label>

                  <label className="cursor-pointer">
                    <input type="radio" name="modality" value="air" className="peer sr-only" />
                    <div className="border-2 border-slate-200 rounded-xl p-4 peer-checked:border-brand-orange peer-checked:bg-orange-50 transition-all relative">
                      <div className="w-4 h-4 rounded-full border-2 border-slate-300 absolute top-4 right-4 peer-checked:border-brand-orange flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-brand-orange opacity-0 peer-checked:opacity-100" />
                      </div>
                      <span className="text-2xl text-slate-700 mb-2 block">✈️</span>
                      <p className="font-bold text-slate-800 m-0">Air Freight</p>
                      <p className="text-xs text-slate-500 m-0">Express / Priority</p>
                    </div>
                  </label>

                  <label className="cursor-pointer">
                    <input type="radio" name="modality" value="land" className="peer sr-only" />
                    <div className="border-2 border-slate-200 rounded-xl p-4 peer-checked:border-brand-orange peer-checked:bg-orange-50 transition-all relative">
                      <div className="w-4 h-4 rounded-full border-2 border-slate-300 absolute top-4 right-4 peer-checked:border-brand-orange flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-brand-orange opacity-0 peer-checked:opacity-100" />
                      </div>
                      <span className="text-2xl text-slate-700 mb-2 block">🚚</span>
                      <p className="font-bold text-slate-800 m-0">Land Transit</p>
                      <p className="text-xs text-slate-500 m-0">FTL / LTL Haulage</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Step 2 */}
              <div className="mb-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">2</div>
                  <h3 className="text-lg font-semibold text-slate-700 m-0">Routing Details</h3>
                </div>
                
                <div className="flex flex-col sm:flex-row items-center gap-4 relative">
                  <Form.Item name="origin" label={<span className="text-xs font-bold text-slate-500">Origin (City, Port, or Zip)</span>} className="w-full mb-0">
                    <Input prefix={<EnvironmentOutlined className="text-slate-400" />} placeholder="e.g. Shanghai, CN" className="!h-12 !rounded-lg" />
                  </Form.Item>
                  
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0 z-10 sm:mt-6 border-2 border-white text-slate-400">
                    &rarr;
                  </div>

                  <Form.Item name="destination" label={<span className="text-xs font-bold text-slate-500">Destination (City, Port, or Zip)</span>} className="w-full mb-0">
                    <Input prefix={<EnvironmentOutlined className="text-slate-400" />} placeholder="e.g. Rotterdam, NL" className="!h-12 !rounded-lg" />
                  </Form.Item>
                </div>
              </div>

              {/* Step 3 */}
              <div className="mb-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">3</div>
                  <h3 className="text-lg font-semibold text-slate-700 m-0">Cargo Specifications</h3>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <Form.Item name="weight" label={<span className="text-xs font-bold text-slate-500">Total Weight</span>} className="mb-0">
                     <div className="flex">
                       <InputNumber min={0} className="w-full !rounded-l-lg !rounded-r-none !h-12" placeholder="0.00" />
                       <Select defaultValue="KG" className="w-24 border-l-0 !h-12" popupMatchSelectWidth={false}>
                         <Option value="KG">KG</Option>
                         <Option value="LBS">LBS</Option>
                       </Select>
                     </div>
                  </Form.Item>
                  <Form.Item name="volume" label={<span className="text-xs font-bold text-slate-500">Total Volume (Optional)</span>} className="mb-0">
                     <div className="flex">
                       <InputNumber min={0} className="w-full !rounded-l-lg !rounded-r-none !h-12" placeholder="0.00" />
                       <Select defaultValue="CBM" className="w-24 border-l-0 !h-12" popupMatchSelectWidth={false}>
                         <Option value="CBM">CBM</Option>
                         <Option value="CFT">CFT</Option>
                       </Select>
                     </div>
                  </Form.Item>
                </div>
              </div>

              <Button type="primary" htmlType="submit" className="!bg-brand-orange hover:!bg-orange-600 !border-brand-orange !h-12 !px-8 font-bold !rounded-lg shadow-lg shadow-brand-orange/20 mt-4" icon={<CalculatorOutlined />}>
                Calculate Rate Estimate
              </Button>
            </Form>
          </Card>

          {/* Sidebar */}
          <div className="lg:w-80 flex flex-col gap-6">
            
            {/* Headquarters Card */}
            <Card className="shadow-lg border-none rounded-2xl overflow-hidden bg-white p-0">
              <h3 className="text-xl font-bold text-slate-800 p-5 pb-4 border-b border-slate-100 m-0">Global Headquarters</h3>
              
              <div className="h-40 bg-cover bg-center" style={{backgroundImage: "url('https://maps.googleapis.com/maps/api/staticmap?center=New+York,NY&zoom=12&size=400x200&maptype=roadmap&markers=color:orange%7Clabel:HQ%7CNew+York,NY&key=YOUR_API_KEY') "}}>
                {/* Fallback pattern if no map key */}
                <div className="w-full h-full bg-slate-200/50 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
              </div>

              <div className="p-5 flex gap-3">
                <EnvironmentOutlined className="text-slate-400 mt-1" />
                <div>
                  <p className="font-bold text-slate-800 text-sm mb-1">Americas Hub</p>
                  <p className="text-xs text-slate-500 leading-relaxed mb-4">
                    One World Trade Center<br/>
                    Suite 4500<br/>
                    New York, NY 10007
                  </p>
                  <a href="mailto:na@globallogistics.com" className="text-brand-orange text-xs font-semibold flex items-center gap-2">
                    <MailOutlined /> na@globallogistics.com
                  </a>
                </div>
              </div>
            </Card>

            {/* Regional Offices */}
            <Card className="shadow-lg border-none rounded-2xl bg-white p-0">
              <h3 className="text-lg font-bold text-slate-800 p-5 pb-4 flex items-center gap-2 m-0 border-b border-slate-100">
                <GlobalOutlined /> Regional Offices
              </h3>
              <div className="flex flex-col">
                <button className="px-5 py-4 text-left font-semibold text-slate-700 text-sm border-b border-slate-100 flex justify-between items-center hover:bg-slate-50 transition-colors">
                  Europe & Africa <span>⌄</span>
                </button>
                <button className="px-5 py-4 text-left font-semibold text-slate-700 text-sm flex justify-between items-center hover:bg-slate-50 transition-colors">
                  Asia Pacific <span>⌄</span>
                </button>
              </div>
            </Card>

          </div>
        </div>
      </div>
    </div>
  );
};
