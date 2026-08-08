import React from 'react';
import { Typography } from 'antd';

const { Paragraph } = Typography;

interface CopyableAddressProps {
  label: string;
  address: string;
  phone?: string;
}

export const CopyableAddress: React.FC<CopyableAddressProps> = ({ label, address, phone }) => {
  return (
    <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-4">
      <div className="text-sm font-semibold text-slate-500 mb-2 uppercase tracking-wider">{label}</div>
      
      <div className="mb-3">
        <div className="text-xs text-slate-400 mb-1">Full Address</div>
        <Paragraph 
          copyable={{ tooltips: ['Copy', 'Copied!'] }}
          className="m-0 text-slate-800 font-medium"
        >
          {address}
        </Paragraph>
      </div>

      {phone && (
        <div>
          <div className="text-xs text-slate-400 mb-1">Phone Number</div>
          <Paragraph 
            copyable={{ tooltips: ['Copy Phone', 'Copied!'] }}
            className="m-0 text-slate-800 font-medium"
          >
            {phone}
          </Paragraph>
        </div>
      )}
    </div>
  );
};
