import React, { useState, useRef, useEffect } from 'react';
import { Button, Input, Tag, Card, Avatar, Spin, Badge } from 'antd';
import {
  RobotOutlined,
  CloseOutlined,
  SendOutlined,
  SearchOutlined,
  SwapOutlined,
  EnvironmentOutlined,
  CustomerServiceOutlined,
  CarOutlined,
  GlobalOutlined,
  MessageOutlined
} from '@ant-design/icons';
import apiClient from '../../api/axios';

interface Message {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  language?: 'ha' | 'en' | 'pcm';
  actionCard?: {
    type: 'tracking' | 'exchange' | 'freight' | 'ticket' | 'faq';
    data?: any;
  };
  suggestedReplies?: string[];
  time: string;
}

export const AIChatbotWidget: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [language, setLanguage] = useState<'ha' | 'en' | 'pcm'>('ha');
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome-1',
      sender: 'bot',
      text: 'Sannu da zuwa Hamza RMB Global AI Assistant! 🇳🇬\nZan iya taimaka muku wajen duba kaya (tracking), lissafin chanjin RMB, da adreshin China warehouse.\n\nYaya zan taimake ku a yau?',
      language: 'ha',
      suggestedReplies: [
        'Duba kaya ta (Tracking)',
        'Nawa ne chanjin RMB yau?',
        'Ina adreshin China warehouse?',
        'Magana da Support'
      ],
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
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

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputValue).trim();
    if (!text) return;

    const userMsg: Message = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputValue('');
    setLoading(true);

    try {
      const res = await apiClient.post('/support/chat', {
        message: text,
        language
      });

      const botData = res.data.data;
      const botMsg: Message = {
        id: `msg-bot-${Date.now()}`,
        sender: 'bot',
        text: botData.reply,
        language: botData.language,
        actionCard: botData.actionCard,
        suggestedReplies: botData.suggestedReplies,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch {
      const fallbackMsg: Message = {
        id: `msg-err-${Date.now()}`,
        sender: 'bot',
        text: language === 'ha'
          ? 'Yi hakuri, an sami matsala wajen hawawa cibiyar mu. Da fatan ku sake gwada sakon ku.'
          : 'Sorry, I am having trouble connecting right now. Please try your message again.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999]">
      {/* Floating Toggle Button */}
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="group relative flex items-center justify-center w-14 h-14 rounded-full bg-[#0A1128] hover:bg-[#1a2542] text-white shadow-2xl transition-all duration-300 hover:scale-105 border-2 border-brand-orange/40"
        >
          <RobotOutlined className="text-2xl text-brand-orange group-hover:rotate-12 transition-transform duration-300" />
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-orange opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-brand-orange"></span>
          </span>
        </button>
      )}

      {/* AI Chat Window */}
      {open && (
        <div className="w-[380px] sm:w-[420px] h-[580px] bg-white rounded-2xl shadow-2xl border border-slate-100 flex flex-col overflow-hidden animate-fade-in-up transition-all">
          {/* Top Header */}
          <div className="bg-[#0A1128] text-white p-4 px-5 flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-brand-orange/20 border border-brand-orange flex items-center justify-center text-brand-orange">
                <RobotOutlined className="text-xl" />
              </div>
              <div>
                <div className="font-extrabold text-sm flex items-center gap-1.5">
                  Hamza RMB AI Assistant
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </div>
                <div className="text-[10px] text-slate-300 font-medium">Multilingual Support: Hausa & English</div>
              </div>
            </div>

            {/* Language Switcher */}
            <div className="flex items-center gap-2">
              <div className="flex bg-slate-800 p-0.5 rounded-lg border border-slate-700">
                <button
                  type="button"
                  onClick={() => setLanguage('ha')}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors ${language === 'ha' ? 'bg-brand-orange text-white' : 'text-slate-400 hover:text-white'}`}
                >
                  🇳🇬 HA
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage('en')}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors ${language === 'en' ? 'bg-brand-orange text-white' : 'text-slate-400 hover:text-white'}`}
                >
                  🇬🇧 EN
                </button>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-slate-400 hover:text-white p-1 bg-transparent border-none cursor-pointer"
              >
                <CloseOutlined className="text-base" />
              </button>
            </div>
          </div>

          {/* Quick Action Chips */}
          <div className="bg-slate-50 p-2.5 px-4 border-b border-slate-100 flex items-center gap-2 overflow-x-auto whitespace-nowrap scrollbar-none">
            <button
              type="button"
              onClick={() => handleSendMessage(language === 'ha' ? 'Duba kaya ta HZ-AIR-20241001-001' : 'Track HZ-AIR-20241001-001')}
              className="text-[11px] font-bold bg-white text-slate-700 hover:text-brand-orange border border-slate-200 px-3 py-1 rounded-full cursor-pointer transition-colors shadow-2xs flex items-center gap-1"
            >
              <SearchOutlined className="text-brand-orange" /> {language === 'ha' ? '📦 Duba Kaya' : '📦 Track Package'}
            </button>
            <button
              type="button"
              onClick={() => handleSendMessage(language === 'ha' ? 'Nawa ne chanjin RMB yau?' : 'Current RMB Exchange Rate')}
              className="text-[11px] font-bold bg-white text-slate-700 hover:text-brand-orange border border-slate-200 px-3 py-1 rounded-full cursor-pointer transition-colors shadow-2xs flex items-center gap-1"
            >
              <SwapOutlined className="text-emerald-500" /> {language === 'ha' ? '🔄 Chanjin RMB' : '🔄 RMB Rate'}
            </button>
            <button
              type="button"
              onClick={() => handleSendMessage(language === 'ha' ? 'Ina adreshin China warehouse?' : 'China Warehouse Address')}
              className="text-[11px] font-bold bg-white text-slate-700 hover:text-brand-orange border border-slate-200 px-3 py-1 rounded-full cursor-pointer transition-colors shadow-2xs flex items-center gap-1"
            >
              <EnvironmentOutlined className="text-blue-500" /> {language === 'ha' ? '📍 China Warehouse' : '📍 Guangzhou Hub'}
            </button>
          </div>

          {/* Messages Container */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] p-3.5 rounded-2xl text-xs leading-relaxed whitespace-pre-wrap ${
                    msg.sender === 'user'
                      ? 'bg-[#0A1128] text-white rounded-br-none shadow-sm font-medium'
                      : 'bg-white text-slate-800 rounded-bl-none border border-slate-100 shadow-sm font-normal'
                  }`}
                >
                  {msg.text}
                </div>

                {/* Render Interactive Action Cards */}
                {msg.actionCard && (
                  <div className="mt-2 w-[85%]">
                    {msg.actionCard.type === 'tracking' && (
                      <div className="bg-white p-3 rounded-xl border border-brand-orange/30 shadow-sm text-xs space-y-1">
                        <div className="font-bold text-[#0A1128] flex items-center justify-between">
                          <span>Tracking: {msg.actionCard.data.trackingId}</span>
                          <Tag color="orange" className="font-bold text-[10px]">{msg.actionCard.data.status}</Tag>
                        </div>
                        <div className="text-slate-500 text-[11px]">Goods: {msg.actionCard.data.description}</div>
                        <div className="text-slate-500 text-[11px]">Weight: {msg.actionCard.data.weightKg} kg</div>
                      </div>
                    )}

                    {msg.actionCard.type === 'exchange' && (
                      <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200 text-xs text-emerald-900 space-y-1">
                        <div className="font-extrabold text-emerald-800">Live RMB Parity: 1 RMB = ₦{msg.actionCard.data.rateNairaPerRmb} NGN</div>
                        <div className="text-[10px] text-emerald-700">Instant verification & direct supplier payout.</div>
                      </div>
                    )}
                  </div>
                )}

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
                <span>{language === 'ha' ? 'Taimaki yana amsawa...' : 'AI is typing response...'}</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Footer Input Area */}
          <div className="p-3 bg-white border-t border-slate-100 flex items-center gap-2">
            <Input
              size="large"
              placeholder={language === 'ha' ? 'Rubuta sakon ku a nan (Hausa ko English)...' : 'Ask a question or type tracking ID...'}
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
              className="bg-[#0A1128] hover:bg-[#1a2542] border-none font-bold shrink-0"
              onClick={() => handleSendMessage()}
            />
          </div>
        </div>
      )}
    </div>
  );
};
