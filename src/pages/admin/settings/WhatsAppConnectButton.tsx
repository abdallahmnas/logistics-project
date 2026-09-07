import React, { useEffect, useState } from 'react';
import { Button, message, Spin, Typography } from 'antd';
import { WhatsAppOutlined } from '@ant-design/icons';

const { Text } = Typography;

// Add type for FB SDK
declare global {
  interface Window {
    fbAsyncInit: () => void;
    FB: any;
  }
}

interface WhatsAppConnectButtonProps {
  onSuccess?: (response: any) => void;
  onError?: (error: any) => void;
}

export const WhatsAppConnectButton: React.FC<WhatsAppConnectButtonProps> = ({ onSuccess, onError }) => {
  const [isSdkLoaded, setIsSdkLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  const metaAppId = import.meta.env.VITE_META_APP_ID;
  const metaConfigId = import.meta.env.VITE_META_CONFIG_ID;

  useEffect(() => {
    const initFb = () => {
      if (!window.FB) return;
      window.FB.init({
        appId: metaAppId,
        autoLogAppEvents: true,
        xfbml: true,
        version: 'v20.0', // use a recent stable version
      });
      setIsSdkLoaded(true);
      setIsLoading(false);
    };

    // If the SDK is already loaded, init and set state
    if (window.FB) {
      initFb();
      return;
    }

    // Load the SDK asynchronously
    window.fbAsyncInit = initFb;

    const loadFbSdk = () => {
      if (document.getElementById('facebook-jssdk')) return;
      const js = document.createElement('script');
      js.id = 'facebook-jssdk';
      js.src = 'https://connect.facebook.net/en_US/sdk.js';
      js.async = true;
      js.defer = true;
      document.body.appendChild(js);
    };

    loadFbSdk();
  }, [metaAppId]);

  const handleConnect = () => {
    if (!window.FB) {
      console.error("Facebook SDK not loaded yet.");
      message.error("Facebook SDK not loaded. Please try again in a moment.");
      return;
    }

    setIsConnecting(true);

    // Launch WhatsApp Embedded Signup
    window.FB.login(
      (response: any) => {
        setIsConnecting(false);
        if (response.authResponse) {
          console.log("WhatsApp Embedded Signup response:", response);
          
          const accessToken = response.authResponse.accessToken;
          if (accessToken) {
            console.log("WhatsApp Access Token:", accessToken);
          }

          if (response.authResponse.code) {
             console.log("WhatsApp Authorization Code:", response.authResponse.code);
          }

          console.log("Response Status:", response.status);

          setIsConnected(true);
          message.success("Successfully connected to WhatsApp!");
          
          if (onSuccess) {
            onSuccess(response);
          }
        } else {
          console.log("WhatsApp signup cancelled");
          if (onError) onError(new Error("Signup cancelled"));
        }
      },
      {
        config_id: metaConfigId, // Configuration ID obtained from App Dashboard
        response_type: 'code',    // Important for embedded signup
        override_default_response_type: true,
        extras: {
          setup: {
            // additional config if needed
          }
        }
      }
    );
  };

  const handleDisconnect = () => {
      setIsConnected(false);
  };

  if (isLoading) {
    return <Spin size="small" />;
  }

  return (
    <div className="flex flex-col items-start gap-2">
      {isConnected ? (
        <Button 
          type="default" 
          onClick={handleDisconnect}
          size="large"
          className="text-red-600 border-red-600 hover:bg-red-50"
        >
          Disconnect WhatsApp
        </Button>
      ) : (
        <Button 
          type="primary" 
          icon={<WhatsAppOutlined />} 
          onClick={handleConnect}
          loading={isConnecting}
          disabled={!isSdkLoaded}
          size="large"
          className="bg-green-600 hover:bg-green-700"
        >
          Connect WhatsApp
        </Button>
      )}
      <Text type="secondary" className="text-xs">
        Connect your WhatsApp Business account to enable WhatsApp messaging.
      </Text>
    </div>
  );
};
