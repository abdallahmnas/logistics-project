import React from 'react';
import { Spin } from 'antd';

interface LoadingScreenProps {
  message?: string;
  fullScreen?: boolean;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
  message = 'Loading...', 
  fullScreen = true 
}) => {
  return (
    <div className={`flex flex-col items-center justify-center ${fullScreen ? 'h-screen w-screen' : 'h-full w-full p-12'}`}>
      <Spin size="large" />
      <p className="mt-4 text-slate-500 font-medium">{message}</p>
    </div>
  );
};
