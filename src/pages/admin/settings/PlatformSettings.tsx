import React from 'react';
import { Tabs } from 'antd';
import { GlobalOutlined, SwapOutlined, BellOutlined } from '@ant-design/icons';
import { ShippingRatesConfig } from './ShippingRatesConfig';
import { FinancialRatesConfig } from './FinancialRatesConfig';
import { NotificationPreferences } from './NotificationPreferences';

export const PlatformSettings: React.FC = () => {
  return (
    <div className="max-w-[1200px] mx-auto py-4">
      <Tabs
        defaultActiveKey="shipping"
        className="[&_.ant-tabs-nav]:mb-8 [&_.ant-tabs-tab]:text-base [&_.ant-tabs-tab-active]:font-bold [&_.ant-tabs-ink-bar]:bg-brand-orange"
        items={[
          {
            key: 'shipping',
            label: (
              <span className="flex items-center gap-2">
                <GlobalOutlined /> Shipping Rates
              </span>
            ),
            children: <ShippingRatesConfig />,
          },
          {
            key: 'financial',
            label: (
              <span className="flex items-center gap-2">
                <SwapOutlined /> Exchange & Financial
              </span>
            ),
            children: <FinancialRatesConfig />,
          },
          {
            key: 'notifications',
            label: (
              <span className="flex items-center gap-2">
                <BellOutlined /> Notifications
              </span>
            ),
            children: <NotificationPreferences />,
          },
        ]}
      />
    </div>
  );
};
