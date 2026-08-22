import React from 'react';
import { Tabs } from 'antd';
import { GlobalOutlined, SwapOutlined, BellOutlined, IdcardOutlined } from '@ant-design/icons';
import { ShippingRatesConfig } from './ShippingRatesConfig';
import { FinancialRatesConfig } from './FinancialRatesConfig';
import { NotificationPreferences } from './NotificationPreferences';
import { BusinessMetadataConfig } from './BusinessMetadataConfig';

export const PlatformSettings: React.FC = () => {
  return (
    <div className="max-w-[1200px] mx-auto py-4">
      <Tabs
        defaultActiveKey="business"
        className="[&_.ant-tabs-nav]:mb-8 [&_.ant-tabs-tab]:text-base [&_.ant-tabs-tab-active]:font-bold [&_.ant-tabs-ink-bar]:bg-brand-orange"
        items={[
          {
            key: 'business',
            label: (
              <span className="flex items-center gap-2">
                <IdcardOutlined /> Business Card & Metadata
              </span>
            ),
            children: <BusinessMetadataConfig />,
          },
          {
            key: 'financial',
            label: (
              <span className="flex items-center gap-2">
                <SwapOutlined /> Exchange, Rates & Accounts
              </span>
            ),
            children: <FinancialRatesConfig />,
          },
          {
            key: 'shipping',
            label: (
              <span className="flex items-center gap-2">
                <GlobalOutlined /> China ➔ Nigeria Freight Routes
              </span>
            ),
            children: <ShippingRatesConfig />,
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
