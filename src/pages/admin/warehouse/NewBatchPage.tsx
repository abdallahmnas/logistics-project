import React, { useEffect, useMemo, useState } from 'react';
import { Button, Form, Input, Select, message, Table, DatePicker } from 'antd';
import { InfoCircleOutlined, SearchOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { fetchAllPackages } from '../../../store/slices/adminSlice';
import { createBatch, fetchConsolidations } from '../../../store/slices/shipmentSlice';
import { formatWeight, formatCbm } from '../../../utils/formatters';

const { Option } = Select;

interface BatchFormValues {
  masterTrackingId: string;
  carrierName: string;
  flightVoyageNo: string;
  containerNo?: string;
  shippingType: 'air' | 'sea';
  departureDate?: string;
}

export const NewBatchPage: React.FC = () => {
  const [form] = Form.useForm<BatchFormValues>();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { consolidations, loading: shipLoading } = useAppSelector((state) => state.shipments);
  const [submitting, setSubmitting] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [searchText, setSearchText] = useState('');

  // Generate a random mock ID for display
  const mockBatchId = useMemo(() => `BATCH-2024-${Math.floor(Math.random() * 999).toString().padStart(3, '0')}`, []);

  const shippingType = Form.useWatch('shippingType', form) || 'air';

  const generateMasterId = (mode: 'air' | 'sea' = shippingType) => {
    const typeTag = mode.toUpperCase();
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randNum = Math.floor(100 + Math.random() * 900);
    const newId = `HZ-BATCH-${typeTag}-${dateStr}-${randNum}`;
    form.setFieldsValue({ masterTrackingId: newId });
  };

  // Set default shipping type and pre-fill masterTrackingId
  useEffect(() => {
    form.setFieldsValue({ shippingType: 'air' });
    generateMasterId('air');
  }, [form]);

  useEffect(() => {
    dispatch(fetchConsolidations());
  }, [dispatch]);

  // Auto-select consolidation passed via searchParams
  useEffect(() => {
    const paramCid = searchParams.get('consolidationId');
    if (paramCid && consolidations.length > 0) {
      const found = consolidations.find((c) => c.id === paramCid || c.consolidationId === paramCid);
      if (found) {
        if (found.shippingMethod) {
          form.setFieldsValue({ shippingType: found.shippingMethod });
        }
        setSelectedRowKeys([found.id]);
      }
    }
  }, [searchParams, consolidations, form]);

  const eligibleConsolidations = useMemo(() => {
    const paramCid = searchParams.get('consolidationId');
    return consolidations
      .filter((c) => {
        const matchStatus = ['ready_to_batch', 'pending_packing', 'pending', 'ready'].includes(c.status) || c.id === paramCid || c.consolidationId === paramCid;
        const matchMethod = c.shippingMethod === shippingType;
        return matchStatus && matchMethod;
      })
      .filter((c) => {
        if (!searchText) return true;
        const lowerSearch = searchText.toLowerCase();
        return (
          c.consolidationId.toLowerCase().includes(lowerSearch) ||
          c.customerName.toLowerCase().includes(lowerSearch)
        );
      });
  }, [consolidations, shippingType, searchText, searchParams]);

  const { totalWeight, totalCbm } = useMemo(() => {
    let weight = 0;
    let cbm = 0;
    const selected = eligibleConsolidations.filter(c => selectedRowKeys.includes(c.id));
    selected.forEach(c => {
      weight += c.totalWeightKg || 0;
      cbm += c.totalCbm || 0;
    });
    return { totalWeight: weight, totalCbm: cbm };
  }, [eligibleConsolidations, selectedRowKeys]);

  const onFinish = async () => {
    try {
      const values = await form.validateFields();
      if (selectedRowKeys.length === 0) {
        message.warning('Please select at least one shipment to batch.');
        return;
      }
      
      setSubmitting(true);
      await dispatch(
        createBatch({
          masterTrackingId: values.masterTrackingId,
          carrierName: values.carrierName,
          flightVoyageNo: values.flightVoyageNo,
          containerNo: values.containerNo,
          shippingType: values.shippingType,
          packageIds: selectedRowKeys as string[], // consolidationIds
        })
      ).unwrap();
      
      message.success('Shipping batch created successfully.');
      navigate('/admin/warehouse/batches');
    } catch (error: any) {
      if (error?.errorFields) return; // Validation error
      message.error('Failed to create batch.');
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    { 
      title: 'SHIPMENT ID', 
      dataIndex: 'consolidationId', 
      key: 'consolidationId',
      render: (v: string) => <span className="font-medium text-slate-700">{v}</span>
    },
    { 
      title: 'CLIENT', 
      dataIndex: 'customerName', 
      key: 'customerName',
      render: (v: string) => <span className="text-slate-600">{v}</span>
    },
    { 
      title: shippingType === 'air' ? 'WEIGHT' : 'CBM', 
      key: 'metrics',
      render: (record: any) => (
        <span className="text-slate-600">
          {shippingType === 'air' ? formatWeight(record.totalWeightKg) : formatCbm(record.totalCbm)}
        </span>
      )
    },
    { 
      title: 'MODE', 
      dataIndex: 'shippingMethod', 
      key: 'shippingMethod',
      render: (t: string) => (
        <span className={`px-2 py-1 rounded text-xs font-bold ${t === 'air' ? 'bg-blue-100 text-blue-700' : 'bg-cyan-100 text-cyan-700'}`}>
          {t === 'air' ? '✈ Air' : '🚢 Sea'}
        </span>
      )
    },
  ];

  return (
    <div className="animate-fade-in-up max-w-[1400px] mx-auto pb-20 mt-4 px-4">
      
      {/* Header Area */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <div className="text-brand-navy font-bold text-xs tracking-widest uppercase mb-1">
            Freight Operations
          </div>
          <h1 className="text-2xl font-semibold text-slate-800 m-0">
            Create Shipping Batch
          </h1>
        </div>
        <div className="bg-[#0A1128] text-white px-4 py-2 rounded font-mono font-medium text-sm border border-slate-700 shadow-sm">
          {mockBatchId}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Form & Table */}
        <div className="lg:col-span-2 space-y-6">
          
          <Form form={form} layout="vertical" requiredMark={false}>
            {/* Route Configuration */}
            <div className="bg-[#F8FAFC] rounded-xl p-6 border border-slate-200">
              <h2 className="text-slate-700 font-medium text-base mb-4">Batch Configuration</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                <Form.Item name="shippingType" label={<span className="text-slate-500 text-sm">Shipping Mode</span>} rules={[{ required: true, message: 'Required' }]} className="mb-0">
                  <Select size="large" className="bg-white rounded [&>.ant-select-selector]:!bg-white [&>.ant-select-selector]:!border-slate-200 shadow-sm">
                    <Option value="air">✈ Consolidated Air</Option>
                    <Option value="sea">🚢 Ocean Freight</Option>
                  </Select>
                </Form.Item>

                <Form.Item
                  name="masterTrackingId"
                  label={
                    <div className="flex justify-between items-center w-full">
                      <span className="text-slate-500 text-sm">Master Tracking ID</span>
                      <Button
                        type="link"
                        size="small"
                        className="p-0 font-bold text-xs !text-brand-orange hover:!text-brand-navy"
                        onClick={() => generateMasterId(shippingType)}
                      >
                        ⚡ Auto-Generate
                      </Button>
                    </div>
                  }
                  rules={[{ required: true, message: 'Required' }]}
                  className="mb-0"
                >
                  <Input size="large" placeholder="e.g. HZ-BATCH-AIR-20260815-102" className="bg-white border-slate-200 shadow-sm" />
                </Form.Item>

                <Form.Item name="carrierName" label={<span className="text-slate-500 text-sm">Carrier Name</span>} rules={[{ required: true, message: 'Required' }]} className="mb-0">
                  <Input size="large" placeholder="e.g. Ethiopian Airlines" className="bg-white border-slate-200 shadow-sm" />
                </Form.Item>

                <Form.Item name="flightVoyageNo" label={<span className="text-slate-500 text-sm">Flight / Voyage Number</span>} rules={[{ required: true, message: 'Required' }]} className="mb-0">
                  <Input size="large" placeholder="e.g. ET-9928" className="bg-white border-slate-200 shadow-sm" />
                </Form.Item>

                {shippingType === 'sea' && (
                  <Form.Item name="containerNo" label={<span className="text-slate-500 text-sm">Container No.</span>} rules={[{ required: true, message: 'Required' }]} className="mb-0">
                    <Input size="large" placeholder="e.g. CSLU2345678" className="bg-white border-slate-200 shadow-sm" />
                  </Form.Item>
                )}
              </div>
            </div>

            {/* Available Shipments Table */}
            <div className="bg-[#F8FAFC] rounded-xl p-6 border border-slate-200 mt-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
                <h2 className="text-slate-700 font-medium text-base m-0">Available Shipments</h2>
                <Input 
                  prefix={<SearchOutlined className="text-slate-400" />} 
                  placeholder="Search unbatched..." 
                  className="w-full sm:w-64 bg-white border-slate-200 rounded shadow-sm" 
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                />
              </div>

              <Table 
                rowSelection={{
                  selectedRowKeys,
                  onChange: setSelectedRowKeys,
                }}
                columns={columns} 
                dataSource={eligibleConsolidations}
                rowKey="id"
                pagination={false}
                scroll={{ y: 300 }}
                loading={shipLoading}
                className="[&_.ant-table-thead_th]:!bg-[#F1F5F9] [&_.ant-table-thead_th]:!text-slate-500 [&_.ant-table-thead_th]:!text-xs [&_.ant-table-thead_th]:!font-bold [&_.ant-table-thead_th]:uppercase"
              />
            </div>
          </Form>
        </div>

        {/* Right Column: Summary */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-[#0B1527] rounded-xl p-6 shadow-lg border border-slate-700 text-white flex flex-col h-[400px]">
            <h2 className="text-lg font-semibold mb-6 m-0">Batch Summary</h2>
            
            <div className="flex justify-between items-center py-3 border-b border-slate-700/50">
              <span className="text-slate-400 text-sm font-medium">Selected Items</span>
              <span className="text-xl font-bold">{selectedRowKeys.length}</span>
            </div>

            <div className="flex justify-between items-center py-3 border-b border-slate-700/50">
              <span className="text-slate-400 text-sm font-medium">Total {shippingType === 'air' ? 'Weight' : 'Volume'}</span>
              <span className="text-xl font-bold">
                {shippingType === 'air' ? `${totalWeight.toFixed(2)} kg` : `${totalCbm.toFixed(3)} m³`}
              </span>
            </div>

            <div className="flex justify-between items-center py-3 border-b border-slate-700/50">
              <span className="text-slate-400 text-sm font-medium">Mode</span>
              <span className="text-sm font-medium">
                Consolidated {shippingType === 'air' ? 'Air' : 'Sea'}
              </span>
            </div>

            <div className="mt-6 mb-4 flex-grow">
              <Form form={form} layout="vertical">
                <Form.Item name="departureDate" label={<span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Est. Departure</span>} className="mb-0">
                  <DatePicker 
                    className="w-full bg-[#1A2639] border-slate-700 hover:border-slate-500 text-white [&_.ant-picker-input_input]:text-white [&_.ant-picker-suffix]:text-slate-400" 
                    format="MM/DD/YYYY"
                  />
                </Form.Item>
              </Form>
            </div>

            <Button 
              type="primary" 
              size="large" 
              block 
              icon={<CheckCircleOutlined />}
              onClick={onFinish}
              loading={submitting}
              className="!bg-[#D95D10] hover:!bg-[#E86E21] !text-white border-none font-semibold shadow-md mt-auto !h-14 !py-4 text-base"
            >
              Confirm & Create Batch
            </Button>
          </div>

          <div className="bg-[#F8FAFC] rounded-lg p-4 border border-slate-200 flex gap-3 text-slate-600 shadow-sm">
            <InfoCircleOutlined className="text-slate-400 mt-0.5 text-lg" />
            <p className="text-sm m-0 leading-relaxed">
              Ensure all hazardous materials (HAZMAT) documentation is verified before finalizing {shippingType} freight consolidation.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
};
