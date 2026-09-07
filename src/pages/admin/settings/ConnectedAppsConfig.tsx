import React from 'react';
import { Card, Avatar, Typography, Space } from 'antd';
import { WhatsAppOutlined, ApiOutlined } from '@ant-design/icons';
import { WhatsAppConnectButton } from './WhatsAppConnectButton';

const { Title, Text } = Typography;

export const ConnectedAppsConfig: React.FC = () => {
  return (
    <Card 
      title={
        <div className="flex items-center gap-2">
          <ApiOutlined /> Connected Apps
        </div>
      }
      variant="outlined"
      className="shadow-sm"
    >
      <div className="flex flex-col gap-6">
        <div className="flex items-start justify-between p-4 border border-slate-200 rounded-lg bg-slate-50">
          <div className="flex gap-4">
            <Avatar 
              size={48} 
              icon={<WhatsAppOutlined />} 
              className="bg-green-600"
            />
            <div className="flex flex-col">
              <Title level={5} className="!mb-0">WhatsApp Business API</Title>
              <Text type="secondary">
                Connect your WhatsApp Business account to send automated messages, 
                notifications, and support messages directly to your customers.
              </Text>
            </div>
          </div>
          <div>
            <WhatsAppConnectButton />
          </div>
        </div>

        {/* Add more apps here in the future, e.g. Telegram */}
      </div>
    </Card>
  );
};
