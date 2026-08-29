import React, { useState, useRef, useEffect } from 'react';
import { Button, Input, Card, Spin, Avatar, Tag } from 'antd';
import {
  RobotOutlined,
  SendOutlined,
  WalletOutlined,
  RocketOutlined,
  EnvironmentOutlined,
  ShoppingCartOutlined,
  SwapOutlined,
  CustomerServiceOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { useAppSelector } from '../../store/hooks';
import apiClient from '../../api/axios';
import type { ChatMessage } from '../../components/chat/AIChatbotWidget';

export const AishaChatPage: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const userName = user ? `${user.firstName} ${user.lastName}` : 'Valued Customer';

  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-page-1',
      role: 'assistant',
      content: `Hello **${userName}**! Welcome to your personal Aisha AI Assistant terminal 🇳🇬🇨🇳\n\nI can help you with:\n- **Air Freight** (3-5 days delivery)\n- **Sea Freight** (35-45 days shipping)\n- **China Warehouse Address & Marking Code**\n- **Buy-For-Me Procurement Quotes**\n- **RMB & NGN Currency Exchange**\n- **Manual Wallet Funding via Bank Transfer**\n\nHow can I assist you today?`,
      suggestedReplies: [
        'How to Fund Wallet?',
        'Air vs Sea Freight rates',
        'China Warehouse Address',
        'Buy-For-Me Procurement',
        'RMB Currency Exchange',
      ],
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
      const historyPayload = newMessages
        .filter((m) => m.id !== 'welcome-page-1')
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

      const botMsg: ChatMessage = {
        id: `msg-bot-${Date.now()}`,
        role: 'assistant',
        content: replyText,
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
    <div className="max-w-[1100px] mx-auto space-y-6 animate-fade-in-up pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#0A1128] via-[#1C2A4E] to-[#0A1128] rounded-3xl p-6 text-white shadow-xl flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-brand-orange/20 border-2 border-brand-orange flex items-center justify-center text-brand-orange text-2xl shadow-inner">
            <RobotOutlined />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-white m-0">Aisha AI Assistant</h1>
              <Tag color="green" className="font-bold border-none text-[10px] uppercase">
                ● ONLINE
              </Tag>
            </div>
            <p className="text-slate-300 text-xs m-0 mt-1">
              Ask anything about China-to-Nigeria Air/Sea shipping, Guangzhou Hub address, Buy-For-Me procurement & wallet top-up.
            </p>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-2">
          <Button
            onClick={() => handleSendMessage('China Warehouse Address')}
            className="bg-white/10 hover:bg-white/20 text-white border-white/20 font-bold text-xs"
            icon={<EnvironmentOutlined />}
          >
            China Address
          </Button>
          <Button
            onClick={() => handleSendMessage('How to Fund Wallet?')}
            className="bg-brand-orange hover:bg-[#E86E21] text-white border-none font-bold text-xs"
            icon={<WalletOutlined />}
          >
            Fund Wallet
          </Button>
        </div>
      </div>

      {/* Main Chat Box */}
      <Card variant="borderless" className="shadow-md border border-slate-100 rounded-3xl overflow-hidden" bodyStyle={{ padding: 0 }}>
        {/* Messages Body */}
        <div className="h-[520px] p-6 overflow-y-auto space-y-6 bg-slate-50/50">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="w-9 h-9 rounded-full bg-brand-navy text-brand-orange flex items-center justify-center font-bold text-lg shrink-0 mt-1 shadow-sm">
                  <RobotOutlined />
                </div>
              )}

              <div className={`max-w-[80%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div
                  className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-wrap ${
                    msg.role === 'user'
                      ? 'bg-[#0A1128] text-white rounded-br-none shadow-sm font-medium'
                      : 'bg-white text-slate-800 rounded-bl-none border border-slate-200/80 shadow-sm font-normal'
                  }`}
                >
                  {renderBoldText(msg.content)}
                </div>

                {msg.suggestedReplies && msg.suggestedReplies.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {msg.suggestedReplies.map((replyText, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSendMessage(replyText)}
                        className="text-xs font-bold bg-white text-brand-orange hover:bg-orange-50 border border-brand-orange/30 px-3 py-1 rounded-full cursor-pointer transition-colors shadow-2xs"
                      >
                        {replyText}
                      </button>
                    ))}
                  </div>
                )}

                <span className="text-[10px] text-slate-400 mt-1 block px-1">{msg.time}</span>
              </div>

              {msg.role === 'user' && (
                <div className="w-9 h-9 rounded-full bg-brand-orange text-white flex items-center justify-center font-bold text-base shrink-0 mt-1 shadow-sm">
                  <UserOutlined />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-3 text-slate-500 text-xs p-3 bg-white rounded-xl border border-slate-100 w-max shadow-2xs">
              <Spin size="small" />
              <span className="font-semibold">Aisha is analyzing and composing reply...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-white border-t border-slate-100 flex items-center gap-3">
          <Input
            size="large"
            placeholder="Type your question for Aisha (e.g., 'What is the air freight rate per kg?')..."
            className="bg-slate-50 border-slate-200 text-sm py-3 rounded-xl focus:bg-white"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onPressEnter={() => handleSendMessage()}
          />
          <Button
            type="primary"
            size="large"
            icon={<SendOutlined />}
            loading={loading}
            className="bg-brand-orange hover:bg-[#E86E21] border-none font-bold h-12 px-6 rounded-xl text-base"
            onClick={() => handleSendMessage()}
          >
            Send
          </Button>
        </div>
      </Card>
    </div>
  );
};
