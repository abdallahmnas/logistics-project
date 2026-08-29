import React, { useState, useRef, useEffect } from 'react';
import { Button, Input, Spin, Badge } from 'antd';
import {
  RobotOutlined,
  CloseOutlined,
  SendOutlined,
  SearchOutlined,
  SwapOutlined,
  EnvironmentOutlined,
  WalletOutlined,
  ShoppingCartOutlined,
  RocketOutlined,
} from '@ant-design/icons';
import apiClient from '../../api/axios';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  suggestedReplies?: string[];
  time: string;
}

export const AIChatbotWidget: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      role: 'assistant',
      content:
        'Hello! Welcome to **HAMZA RMB GLOBAL** 🇳🇬🇨🇳\nI am **Aisha**, your personal AI assistant. How can I help you today with Air/Sea shipping, Buy-For-Me procurement, RMB currency exchange, or wallet funding?',
      suggestedReplies: [
        'How to Fund Wallet?',
        'Air vs Sea Freight rates',
        'China Warehouse Address',
        'Buy-For-Me Procurement',
        'RMB Currency Exchange',
        'Track My Shipment',
      ],
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (open) {
      scrollToBottom();
    }
  }, [messages, open]);

  // Event listener for programmatic opening from any button in the app
  useEffect(() => {
    const handleOpen = () => setOpen(true);
    window.addEventListener('open-chatbot', handleOpen);
    return () => window.removeEventListener('open-chatbot', handleOpen);
  }, []);

  const renderBoldText = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index} className="font-extrabold text-[#0A1128]">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputValue).trim();
    if (!text) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    if (!textToSend) setInputValue('');
    setLoading(true);

    try {
      // Build history payload (role + content) for backend context
      const historyPayload = newMessages
        .filter((m) => m.id !== 'welcome-1')
        .slice(-10)
        .map((m) => ({
          role: m.role,
          content: m.content,
        }));

      const res = await apiClient.post('/chat', {
        message: text,
        history: historyPayload,
      });

      const replyText = res.data.reply || res.data.data?.reply || 'I am here to assist you with your logistics & trade needs!';
      
      let replies: string[] = [];
      if (text.toLowerCase().includes('freight') || text.toLowerCase().includes('shipping')) {
        replies = ['China Warehouse Address', 'How to Fund Wallet?', 'Buy-For-Me Procurement'];
      } else if (text.toLowerCase().includes('wallet') || text.toLowerCase().includes('bank')) {
        replies = ['RMB Currency Exchange', 'Track My Shipment', 'Contact Support'];
      }

      const botMsg: ChatMessage = {
        id: `msg-bot-${Date.now()}`,
        role: 'assistant',
        content: replyText,
        suggestedReplies: replies,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch {
      const fallbackMsg: ChatMessage = {
        id: `msg-err-${Date.now()}`,
        role: 'assistant',
        content:
          'Sorry, I am having trouble connecting right now. Please check your network connection or contact our support team at +234 809 021 9021.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999]">
      {/* Floating Action Button (FAB) */}
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="group relative flex items-center justify-center w-14 h-14 rounded-full bg-[#0A1128] hover:bg-[#1a2542] text-white shadow-2xl transition-all duration-300 hover:scale-105 border-2 border-brand-orange/40 cursor-pointer"
        >
          <RobotOutlined className="text-2xl text-brand-orange group-hover:rotate-12 transition-transform duration-300" />
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-orange opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-brand-orange"></span>
          </span>
        </button>
      )}

      {/* AI Chat Panel */}
      {open && (
        <div className="w-[380px] sm:w-[420px] h-[580px] bg-white rounded-2xl shadow-2xl border border-slate-100 flex flex-col overflow-hidden animate-fade-in-up transition-all">
          {/* Top Header */}
          <div className="bg-[#0A1128] text-white p-4 px-5 flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-brand-orange/20 border border-brand-orange flex items-center justify-center text-brand-orange">
                <RobotOutlined className="text-xl" />
              </div>
              <div>
                <div className="font-extrabold text-sm flex items-center gap-1.5 text-white">
                  Aisha — Hamza RMB Assistant
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </div>
                <div className="text-[10px] text-slate-300 font-medium">China-Nigeria Cargo & Trade AI</div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-slate-400 hover:text-white p-1 bg-transparent border-none cursor-pointer"
            >
              <CloseOutlined className="text-base" />
            </button>
          </div>

          {/* Quick Suggestions Chips Bar */}
          <div className="bg-slate-50 p-2.5 px-4 border-b border-slate-100 flex items-center gap-2 overflow-x-auto whitespace-nowrap scrollbar-none">
            <button
              type="button"
              onClick={() => handleSendMessage('How to Fund Wallet?')}
              className="text-[11px] font-bold bg-white text-slate-700 hover:text-brand-orange border border-slate-200 px-3 py-1 rounded-full cursor-pointer transition-colors shadow-2xs flex items-center gap-1"
            >
              <WalletOutlined className="text-brand-orange" /> Fund Wallet
            </button>
            <button
              type="button"
              onClick={() => handleSendMessage('Air vs Sea Freight rates')}
              className="text-[11px] font-bold bg-white text-slate-700 hover:text-brand-orange border border-slate-200 px-3 py-1 rounded-full cursor-pointer transition-colors shadow-2xs flex items-center gap-1"
            >
              <RocketOutlined className="text-blue-500" /> Air & Sea Rates
            </button>
            <button
              type="button"
              onClick={() => handleSendMessage('China Warehouse Address')}
              className="text-[11px] font-bold bg-white text-slate-700 hover:text-brand-orange border border-slate-200 px-3 py-1 rounded-full cursor-pointer transition-colors shadow-2xs flex items-center gap-1"
            >
              <EnvironmentOutlined className="text-emerald-500" /> China Hub
            </button>
          </div>

          {/* Messages Container */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] p-3.5 rounded-2xl text-xs leading-relaxed whitespace-pre-wrap ${
                    msg.role === 'user'
                      ? 'bg-[#0A1128] text-white rounded-br-none shadow-sm font-medium'
                      : 'bg-white text-slate-800 rounded-bl-none border border-slate-100 shadow-sm font-normal'
                  }`}
                >
                  {renderBoldText(msg.content)}
                </div>

                {/* Suggested Reply Buttons */}
                {msg.suggestedReplies && msg.suggestedReplies.length > 0 && (
                  <div className="mt-2.5 flex flex-wrap gap-1.5 max-w-[90%]">
                    {msg.suggestedReplies.map((replyText, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSendMessage(replyText)}
                        className="text-[10px] font-bold bg-white text-brand-orange hover:bg-orange-50 border border-brand-orange/30 px-2.5 py-1 rounded-full cursor-pointer transition-colors shadow-2xs"
                      >
                        {replyText}
                      </button>
                    ))}
                  </div>
                )}

                <span className="text-[9px] text-slate-400 mt-1 px-1">{msg.time}</span>
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 text-slate-400 text-xs p-2">
                <Spin size="small" />
                <span>Aisha is thinking & typing...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Footer Input Area */}
          <div className="p-3 bg-white border-t border-slate-100 flex items-center gap-2">
            <Input
              size="large"
              placeholder="Ask Aisha a question or type tracking ID..."
              className="bg-slate-50 border-slate-200 text-xs focus:bg-white"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onPressEnter={() => handleSendMessage()}
            />
            <Button
              type="primary"
              size="large"
              icon={<SendOutlined />}
              loading={loading}
              className="bg-brand-orange hover:bg-[#E86E21] border-none font-bold shrink-0"
              onClick={() => handleSendMessage()}
            />
          </div>
        </div>
      )}
    </div>
  );
};
