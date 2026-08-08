import React from 'react';
import { Badge, Tag } from 'antd';
import { getStatusConfig } from '../../utils/statusMappings';

interface StatusBadgeProps {
  module: 'shipment' | 'procurement' | 'exchange' | 'delivery';
  status: string;
  type?: 'badge' | 'tag';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ module, status, type = 'tag' }) => {
  const config = getStatusConfig(module, status);

  if (type === 'badge') {
    return <Badge status={config.badgeStatus as any} text={config.label} />;
  }

  return (
    <Tag color={config.color} className="m-0 rounded-md font-medium px-2 py-0.5">
      {config.label}
    </Tag>
  );
};
