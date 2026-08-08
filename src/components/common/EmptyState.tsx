import React from 'react';
import { Empty, Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No Data Found',
  description = 'There is no data to display at the moment.',
  actionText,
  onAction,
  icon,
}) => {
  return (
    <div className="py-12 bg-white rounded-xl border border-slate-100 shadow-sm flex flex-col items-center justify-center">
      <Empty
        image={icon ?? Empty.PRESENTED_IMAGE_SIMPLE}
        description={
          <div className="mt-2">
            <h3 className="text-lg font-semibold text-slate-800 mb-1">{title}</h3>
            <p className="text-slate-500">{description}</p>
          </div>
        }
      >
        {actionText && onAction && (
          <Button type="primary" onClick={onAction} icon={<PlusOutlined />} className="mt-4">
            {actionText}
          </Button>
        )}
      </Empty>
    </div>
  );
};
