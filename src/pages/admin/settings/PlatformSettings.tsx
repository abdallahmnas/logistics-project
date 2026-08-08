import React, { useEffect } from 'react';
import { Card, Form, InputNumber, Button, Modal, message, Row, Col } from 'antd';
import { EditOutlined, BankOutlined, ShopOutlined, DollarCircleOutlined } from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { updateExchangeRate } from '../../../store/slices/adminSlice';
import { fetchActiveRate } from '../../../store/slices/exchangeSlice';
import { CopyableAddress } from '../../../components/common/CopyableAddress';
import { exchangeRateSchema, validateForm } from '../../../utils/validators';
import { SHIPPING_RATES, WAREHOUSES } from '../../../utils/constants';
import { formatNaira } from '../../../utils/formatters';

interface RateFormValues {
  platformRate: number;
  buyRate: number;
  sellRate: number;
}

export const PlatformSettings: React.FC = () => {
  const [form] = Form.useForm<RateFormValues>();
  const dispatch = useAppDispatch();
  const { activeRate } = useAppSelector((state) => state.exchange);

  useEffect(() => {
    dispatch(fetchActiveRate());
  }, [dispatch]);

  useEffect(() => {
    if (activeRate) {
      form.setFieldsValue({
        platformRate: activeRate.platformRate,
        buyRate: activeRate.buyRate,
        sellRate: activeRate.sellRate,
      });
    }
  }, [activeRate, form]);

  const onFinish = async (values: RateFormValues) => {
    const errors = await validateForm(exchangeRateSchema, values as unknown as Record<string, unknown>);
    if (Object.keys(errors).length > 0) {
      form.setFields(Object.keys(errors).map((key) => ({ name: key, errors: [errors[key]] })) as any);
      return;
    }
    Modal.confirm({
      title: 'Confirm Rate Change',
      content: `This will update the live platform exchange rate to ${values.platformRate} NGN per CNY, affecting all new exchange and procurement quotes. Continue?`,
      okText: 'Confirm Update',
      okButtonProps: { danger: true },
      onOk: async () => {
        await dispatch(updateExchangeRate(values)).unwrap();
        message.success('Exchange rate updated.');
      },
    });
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 m-0">Platform Settings</h1>
        <p className="text-slate-500 mt-1 mb-0 text-sm">Manage exchange rates, shipping tariffs, warehouses and escrow details</p>
      </div>

      {/* Exchange Rate */}
      <Card
        bordered={false}
        className="shadow-sm rounded-2xl"
        title={
          <span className="flex items-center gap-2 text-slate-800">
            <DollarCircleOutlined className="text-brand-gold" /> Exchange Rate
          </span>
        }
      >
        <Form form={form} layout="vertical" onFinish={onFinish} requiredMark={false}>
          <Row gutter={16}>
            <Col xs={24} md={8}>
              <Form.Item name="platformRate" label="Platform Rate (NGN per CNY)" rules={[{ required: true, message: 'Required' }]}>
                <InputNumber className="w-full" min={1} size="large" />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="buyRate" label="Buy Rate" rules={[{ required: true, message: 'Required' }]}>
                <InputNumber className="w-full" min={1} size="large" />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="sellRate" label="Sell Rate" rules={[{ required: true, message: 'Required' }]}>
                <InputNumber className="w-full" min={1} size="large" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item className="mb-0 text-right">
            <Button type="primary" htmlType="submit" icon={<EditOutlined />} className="bg-brand-gold text-brand-navy font-bold border-none hover:bg-yellow-500">
              Update Rate
            </Button>
          </Form.Item>
        </Form>
      </Card>

      {/* Shipping Tariffs */}
      <Card
        bordered={false}
        className="shadow-sm rounded-2xl"
        title={
          <span className="flex items-center gap-2 text-slate-800">
            <ShopOutlined className="text-brand-gold" /> Shipping Tariffs
          </span>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
            <div className="text-xs uppercase tracking-wide text-slate-500 mb-1">{SHIPPING_RATES.air.label}</div>
            <div className="text-2xl font-bold text-brand-navy">{formatNaira(SHIPPING_RATES.air.perKg)} <span className="text-sm font-normal text-slate-500">/ {SHIPPING_RATES.air.unit}</span></div>
            <div className="text-xs text-slate-400 mt-1">Estimated transit: {SHIPPING_RATES.air.estimatedDays} days</div>
          </div>
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
            <div className="text-xs uppercase tracking-wide text-slate-500 mb-1">{SHIPPING_RATES.sea.label}</div>
            <div className="text-2xl font-bold text-brand-navy">{formatNaira(SHIPPING_RATES.sea.perCbm)} <span className="text-sm font-normal text-slate-500">/ {SHIPPING_RATES.sea.unit}</span></div>
            <div className="text-xs text-slate-400 mt-1">Estimated transit: {SHIPPING_RATES.sea.estimatedDays} days</div>
          </div>
        </div>
        <p className="text-xs text-slate-400 mt-4 mb-0">Tariffs are read-only in this build and configured at the infrastructure level.</p>
      </Card>

      {/* Warehouse Addresses */}
      <Card
        bordered={false}
        className="shadow-sm rounded-2xl"
        title={
          <span className="flex items-center gap-2 text-slate-800">
            <ShopOutlined className="text-brand-gold" /> Warehouse Addresses
          </span>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.values(WAREHOUSES).map((wh) => (
            <CopyableAddress key={wh.id} label={wh.name} address={wh.address} phone={wh.phone} />
          ))}
        </div>
      </Card>

      {/* Escrow / Bank Details */}
      <Card
        bordered={false}
        className="shadow-sm rounded-2xl"
        title={
          <span className="flex items-center gap-2 text-slate-800">
            <BankOutlined className="text-brand-gold" /> Escrow Bank Details
          </span>
        }
      >
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 max-w-md">
          <div className="flex justify-between py-1.5 border-b border-slate-100">
            <span className="text-slate-500 text-sm">Bank Name</span>
            <span className="font-medium text-slate-800">GTBank</span>
          </div>
          <div className="flex justify-between py-1.5 border-b border-slate-100">
            <span className="text-slate-500 text-sm">Account Number</span>
            <span className="font-medium text-slate-800">0123456789</span>
          </div>
          <div className="flex justify-between py-1.5">
            <span className="text-slate-500 text-sm">Account Name</span>
            <span className="font-medium text-slate-800">Hamza RMB Trading Ltd</span>
          </div>
        </div>
        <p className="text-xs text-slate-400 mt-4 mb-0">
          This escrow account receives Naira payments for P2P exchange requests. Editing requires backend integration and is not available in this build.
        </p>
      </Card>
    </div>
  );
};
