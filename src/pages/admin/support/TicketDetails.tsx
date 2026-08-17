import React, { useEffect, useState } from 'react';
import { Button, Input, Avatar, Card, Tag, Spin, message } from 'antd';
import { UserOutlined, SendOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { fetchTicket, replyToTicket, updateTicketStatus } from '../../../store/slices/supportSlice';
import { formatDate } from '../../../utils/formatters';

const { TextArea } = Input;

export const TicketDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { selectedTicket, loading } = useAppSelector((state) => state.support);
  const user = useAppSelector((state) => state.auth.user);

  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (id) {
      dispatch(fetchTicket(id));
    }
  }, [dispatch, id]);

  const handleSendReply = async () => {
    if (!id || !replyText.trim()) return;
    setSending(true);
    try {
      await dispatch(replyToTicket({ ticketId: id, message: replyText })).unwrap();
      message.success('Reply sent successfully');
      setReplyText('');
    } catch {
      message.error('Failed to send reply');
    } finally {
      setSending(false);
    }
  };

  const handleResolve = async () => {
    if (!id) return;
    try {
      await dispatch(updateTicketStatus({ ticketId: id, status: 'resolved' })).unwrap();
      message.success('Ticket marked as resolved');
    } catch {
      message.error('Failed to update ticket status');
    }
  };

  if (loading && !selectedTicket) {
    return <div className="py-20 text-center"><Spin size="large" /></div>;
  }

  if (!selectedTicket) {
    return (
      <div className="py-20 text-center">
        <p className="text-slate-500">Ticket not found</p>
        <Button onClick={() => navigate('/admin/support')}>Back to Support List</Button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in-up max-w-[1200px] mx-auto py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-[#0A1128] m-0 mb-3 tracking-tight">
            {selectedTicket.subject}
          </h1>
          <div className="flex gap-2 items-center">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase ${selectedTicket.status === 'resolved' ? 'bg-emerald-50 text-emerald-700' : 'bg-orange-50 text-orange-600'}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${selectedTicket.status === 'resolved' ? 'bg-emerald-500' : 'bg-orange-500'}`}></span>
              {selectedTicket.status.replace('_', ' ')}
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 uppercase">
              {selectedTicket.priority} Priority
            </span>
            <span className="text-xs text-slate-400 font-mono ml-2">ID: #{selectedTicket.id.substring(0, 8)}</span>
          </div>
        </div>
        <div className="flex gap-3">
          {selectedTicket.status !== 'resolved' && (
            <Button
              type="primary"
              size="large"
              className="bg-[#0A1128] hover:bg-[#1a2542] border-none font-bold shadow-md flex items-center gap-2"
              onClick={handleResolve}
            >
              <CheckCircleOutlined /> Resolve Ticket
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content (Chat Log) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Thread messages */}
          {(selectedTicket.messages || []).map((msg) => {
            const isCustomer = msg.senderRole === 'customer';
            return (
              <div key={msg.id} className="flex gap-4">
                <Avatar
                  size={40}
                  icon={<UserOutlined />}
                  className={isCustomer ? "bg-slate-200 text-slate-700 shrink-0" : "bg-[#0A1128] text-white shrink-0"}
                />
                <div className="flex-1">
                  <div className="flex justify-between items-end mb-2">
                    <div>
                      <span className="font-bold text-[#0A1128] text-base mr-2">{msg.senderName}</span>
                      <span className="text-xs text-slate-500 font-medium uppercase">{msg.senderRole}</span>
                    </div>
                    <span className="text-xs text-slate-400">{msg.createdAt ? formatDate(msg.createdAt) : 'Recently'}</span>
                  </div>
                  <div className={`p-5 rounded-xl text-sm leading-relaxed ${isCustomer ? 'bg-slate-50 border border-slate-100 text-slate-700' : 'bg-blue-50/60 border border-blue-100 text-[#0A1128]'}`}>
                    {msg.message}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Reply Editor */}
          <Card bordered={false} className="shadow-lg border border-slate-100 rounded-xl overflow-hidden mt-8" bodyStyle={{ padding: 0 }}>
            <div className="bg-slate-50 p-3 border-b border-slate-100 flex justify-between items-center">
              <span className="text-xs font-bold text-slate-600">Reply as Support Agent ({user?.firstName || 'Staff'})</span>
            </div>
            <TextArea 
              rows={4} 
              placeholder="Type your response to the customer..." 
              className="border-none resize-none p-4 text-sm focus:shadow-none"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
            />
            <div className="bg-white p-3 px-4 border-t border-slate-100 flex justify-between items-center">
              <span className="text-xs text-slate-400">Response will be saved to ticket history</span>
              <Button
                type="primary"
                className="bg-[#0A1128] hover:bg-[#1a2542] border-none font-bold px-6 flex items-center gap-2 h-10"
                loading={sending}
                onClick={handleSendReply}
              >
                <SendOutlined /> Send Reply
              </Button>
            </div>
          </Card>

        </div>

        {/* Right Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Customer Profile */}
          <Card bordered={false} className="shadow-sm border border-slate-100 rounded-xl" bodyStyle={{ padding: '24px' }}>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-4">Customer Profile</div>
            <div className="flex items-center gap-3 mb-6">
              <Avatar size={48} className="bg-[#0A1128] font-bold text-lg text-white">
                {selectedTicket.customerName.substring(0, 2).toUpperCase()}
              </Avatar>
              <div>
                <div className="font-bold text-[#0A1128] text-base">{selectedTicket.customerName}</div>
                <div className="text-xs text-brand-orange font-bold uppercase">Customer ID: {selectedTicket.customerId}</div>
              </div>
            </div>
          </Card>

          {/* Ticket Details */}
          <Card bordered={false} className="shadow-sm border border-slate-100 rounded-xl" bodyStyle={{ padding: '24px' }}>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-4">Ticket Info</div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <div className="text-xs text-slate-500 mb-1">Created</div>
                <div className="font-bold text-[#0A1128] text-sm">{selectedTicket.createdAt ? formatDate(selectedTicket.createdAt) : 'Recently'}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500 mb-1">Category</div>
                <div className="font-bold text-[#0A1128] text-sm uppercase">{selectedTicket.category}</div>
              </div>
            </div>

            {selectedTicket.referenceId && (
              <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">Reference ID</div>
                <div className="font-mono text-sm font-bold text-brand-orange">
                  📦 {selectedTicket.referenceId}
                </div>
              </div>
            )}
          </Card>

        </div>
      </div>
    </div>
  );
};
