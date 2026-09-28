import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  Button,
  Tag,
  Tabs,
  Steps,
  Skeleton,
  Input,
  Upload,
  message,
  Modal,
  Badge,
  Alert,
  Divider,
} from 'antd';
import {
  ArrowLeftOutlined,
  CheckCircleFilled,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  UploadOutlined,
  FilePdfOutlined,
  SendOutlined,
  WalletOutlined,
  InfoCircleOutlined,
  SyncOutlined,
  SafetyCertificateOutlined,
  PaperClipOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import { clearanceService } from '../../../services/clearanceService';
import { uploadService } from '../../../services/uploadService';
import {
  ClearanceRequest,
  ClearanceStatus,
  STATUS_DESCRIPTIONS,
} from '../../../types/clearance';
import { formatDate } from '../../../utils/formatters';
import { useAppSelector } from '../../../store/hooks';

const { TextArea } = Input;

export const ClearanceDetailTrackerPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);

  const [loading, setLoading] = useState(true);
  const [request, setRequest] = useState<ClearanceRequest | null>(null);

  // Tab State
  const [activeTab, setActiveTab] = useState('overview');

  // Document Upload State
  const [newDocType, setNewDocType] = useState('commercial_invoice');
  const [uploadingDoc, setUploadingDoc] = useState(false);

  // Message Thread State
  const [messageText, setMessageText] = useState('');
  const [sendingMsg, setSendingMsg] = useState(false);

  // Payment State
  const [paying, setPaying] = useState(false);
  const [payModalVisible, setPayModalVisible] = useState(false);

  const fetchDetail = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const data = await clearanceService.getRequestById(id);
      setRequest(data);
    } catch (err: any) {
      message.error(err.message || 'Failed to load clearance request');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-8">
        <Card className="rounded-2xl border-slate-200">
          <Skeleton active avatar paragraph={{ rows: 8 }} />
        </Card>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center">
        <Card className="rounded-2xl border-slate-200 p-8">
          <ExclamationCircleOutlined className="text-4xl text-amber-500 mb-3" />
          <h2 className="text-xl font-bold text-slate-800">Clearance Request Not Found</h2>
          <p className="text-xs text-slate-500 mb-6">The requested clearance request ID does not exist or you do not have permission to view it.</p>
          <Button type="primary" onClick={() => navigate('/customer/customs-clearance')}>
            Return to Customs Clearance
          </Button>
        </Card>
      </div>
    );
  }

  const statusInfo = STATUS_DESCRIPTIONS[request.status] || {
    label: request.status,
    description: '',
    badgeColor: 'bg-blue-50 text-blue-700',
  };

  // Timeline Step calculation
  const timelineSteps: { key: ClearanceStatus; title: string; desc: string }[] = [
    { key: 'SUBMITTED', title: 'Request Submitted', desc: 'Your request was received' },
    { key: 'DOCUMENT_REVIEW', title: 'Documents Review', desc: 'Documents received & under review' },
    { key: 'CLEARANCE_PROCESSING', title: 'Clearance Processing', desc: 'Processing through customs' },
    { key: 'CUSTOMS_ASSESSMENT', title: 'Customs Assessment', desc: 'Valuation & duty assessment' },
    { key: 'CUSTOMS_RELEASED', title: 'Customs Release', desc: 'Goods released from customs' },
    { key: 'DELIVERY', title: 'Delivery', desc: 'Dispatch & doorstep delivery' },
    { key: 'COMPLETED', title: 'Completed', desc: 'Clearance completed successfully' },
  ];

  const getStepStatusIndex = (current: ClearanceStatus): number => {
    const order: ClearanceStatus[] = [
      'DRAFT',
      'SUBMITTED',
      'DOCUMENT_REVIEW',
      'ADDITIONAL_INFORMATION_REQUIRED',
      'CLEARANCE_PROCESSING',
      'CUSTOMS_ASSESSMENT',
      'INSPECTION',
      'AWAITING_PAYMENT',
      'CUSTOMS_RELEASED',
      'DELIVERY',
      'COMPLETED',
    ];
    const idx = order.indexOf(current);
    if (idx <= 1) return 0;
    if (idx <= 3) return 1;
    if (idx === 4) return 2;
    if (idx <= 7) return 3;
    if (idx === 8) return 4;
    if (idx === 9) return 5;
    return 6;
  };

  const activeStepIndex = getStepStatusIndex(request.status);

  // Send Message Handler
  const handleSendMessage = async () => {
    if (!messageText.trim()) return;
    try {
      setSendingMsg(true);
      await clearanceService.sendMessage(request.id, messageText);
      setMessageText('');
      await fetchDetail();
      message.success('Message sent to support team.');
    } catch (err: any) {
      message.error(err.message || 'Failed to send message');
    } finally {
      setSendingMsg(false);
    }
  };

  // Upload Additional Document Handler
  const handleDocUpload = async (file: File) => {
    try {
      setUploadingDoc(true);
      const url = await uploadService.uploadFile(file);
      await clearanceService.uploadDocument(request.id, {
        documentType: newDocType,
        fileName: file.name,
        fileUrl: url,
      });
      message.success(`Uploaded ${file.name} successfully.`);
      await fetchDetail();
    } catch (err: any) {
      message.error(err.message || 'Failed to upload document');
    } finally {
      setUploadingDoc(false);
    }
  };

  // Pay Charges Handler
  const handlePayCharges = async () => {
    try {
      setPaying(true);
      await clearanceService.payCharges(request.id);
      message.success('Charges paid successfully via Wallet!');
      setPayModalVisible(false);
      await fetchDetail();
    } catch (err: any) {
      message.error(err.message || 'Failed to process payment');
    } finally {
      setPaying(false);
    }
  };

  // Pending charges calculation
  const pendingCharges = (request.charges || []).filter((c) => c.status === 'pending');
  const totalPendingChargesAmount = pendingCharges.reduce((sum, c) => sum + Number(c.amount || 0), 0);

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Top Header Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <Button
              type="text"
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate('/customer/customs-clearance/my-requests')}
              className="text-slate-500 p-0 hover:text-brand-orange mb-1 text-xs font-bold flex items-center gap-1"
            >
              My Clearance Requests
            </Button>
            <div className="flex items-center gap-3">
              <h1 className="text-xl sm:text-2xl font-black text-brand-navy m-0">
                {request.requestNumber}
              </h1>
              <span className={`text-xs font-extrabold px-3 py-1 rounded-full border ${statusInfo.badgeColor}`}>
                {statusInfo.label}
              </span>
            </div>
          </div>

          <div className="text-right text-xs text-slate-500">
            <span>Submitted on {formatDate(request.createdAt)}</span>
          </div>
        </div>

        <p className="text-xs text-slate-600 m-0 bg-slate-50 p-3 rounded-xl border border-slate-200/80">
          <span className="font-bold text-slate-800">Current Status Update: </span>
          {statusInfo.description}
        </p>
      </div>

      {/* Action Required Alert Banner if ADDITIONAL_INFORMATION_REQUIRED */}
      {request.status === 'ADDITIONAL_INFORMATION_REQUIRED' && (
        <Alert
          type="warning"
          showIcon
          className="rounded-2xl border-amber-300 bg-amber-50/90 shadow-sm p-4"
          message={
            <span className="font-extrabold text-amber-900 text-sm">
              Action Required: Additional Information or Document Needed
            </span>
          }
          description={
            <div className="space-y-3 pt-1 text-xs text-amber-900">
              <p className="m-0">
                Our customs clearance team requires clearer copies or additional documentation to proceed with your customs assessment.
              </p>
              <div className="flex items-center gap-3">
                <Button
                  type="primary"
                  onClick={() => setActiveTab('documents')}
                  icon={<UploadOutlined />}
                  className="!bg-amber-600 hover:!bg-amber-700 font-bold rounded-xl text-xs h-9"
                >
                  Upload Required Document
                </Button>
                <Button
                  onClick={() => setActiveTab('messages')}
                  className="font-bold rounded-xl text-xs h-9 border-amber-300 text-amber-900"
                >
                  Ask a Question
                </Button>
              </div>
            </div>
          }
        />
      )}

      {/* Interactive Progress Timeline */}
      <Card title="Clearance Progress Timeline" className="rounded-2xl border-slate-200 shadow-sm">
        <Steps
          current={activeStepIndex}
          items={timelineSteps.map((s, i) => ({
            title: s.title,
            description: s.desc,
          }))}
          size="small"
          className="py-2"
        />
      </Card>

      {/* Main Tabs Hub */}
      <Card className="rounded-2xl border-slate-200 shadow-sm">
        <Tabs
          activeKey={activeTab}
          onChange={(k) => setActiveTab(k)}
          items={[
            {
              key: 'overview',
              label: 'Overview & Details',
              children: (
                <div className="space-y-6 pt-2">
                  {/* Shipment Information */}
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
                    <h3 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider m-0">
                      Shipment Details
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                      <div>
                        <span className="text-slate-400 block">Shipment Type</span>
                        <span className="font-bold text-slate-800 capitalize">{request.shipmentType} Freight</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Country of Origin</span>
                        <span className="font-bold text-slate-800">{request.originCountry}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Port of Entry</span>
                        <span className="font-bold text-slate-800">{request.portOfEntry}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Shipment Status</span>
                        <span className="font-bold text-slate-800 capitalize">{request.shipmentStatus.replace('_', ' ')}</span>
                      </div>
                    </div>

                    {!request.noShippingInfoProvided && (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs pt-3 border-t border-slate-200">
                        {request.billOfLadingNumber && (
                          <div>
                            <span className="text-slate-400 block">Bill of Lading Number</span>
                            <span className="font-bold text-slate-800">{request.billOfLadingNumber}</span>
                          </div>
                        )}
                        {request.airWaybillNumber && (
                          <div>
                            <span className="text-slate-400 block">Air Waybill Number</span>
                            <span className="font-bold text-slate-800">{request.airWaybillNumber}</span>
                          </div>
                        )}
                        {request.containerNumber && (
                          <div>
                            <span className="text-slate-400 block">Container Number</span>
                            <span className="font-bold text-slate-800">{request.containerNumber}</span>
                          </div>
                        )}
                        {request.shippingLine && (
                          <div>
                            <span className="text-slate-400 block">Carrier / Shipping Line</span>
                            <span className="font-bold text-slate-800">{request.shippingLine}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Imported Products List */}
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
                    <h3 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider m-0">
                      Imported Cargo Items ({request.items?.length || 0})
                    </h3>
                    <div className="space-y-2">
                      {request.items?.map((it, idx) => (
                        <div key={idx} className="bg-white p-3 rounded-xl border border-slate-200 flex justify-between items-center text-xs">
                          <div>
                            <span className="font-bold text-slate-800 block">{it.productName}</span>
                            <span className="text-slate-400 text-[11px]">
                              Quantity: {it.quantity} {it.unit} • Category: {it.category || 'General Cargo'}
                            </span>
                          </div>
                          <span className="font-extrabold text-brand-navy">
                            ${Number(it.value || 0).toLocaleString()} {it.currency}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-2 text-xs font-extrabold text-slate-800 flex justify-between border-t border-slate-200">
                      <span>Total Declared Goods Value:</span>
                      <span>${Number(request.totalValueUsd || 0).toLocaleString()} USD</span>
                    </div>
                  </div>

                  {/* Delivery Info */}
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-2">
                    <h3 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider m-0">
                      Post-Clearance Delivery Option
                    </h3>
                    <p className="text-xs font-bold text-slate-800 m-0">
                      {request.deliveryPreference === 'deliver_to_me' ? '🚚 Doorstep Delivery' : '🏬 Self-Pickup from Depot'}
                    </p>
                    {request.deliveryPreference === 'deliver_to_me' && (
                      <p className="text-xs text-slate-600 m-0">
                        Destination: {request.deliveryAddress}, {request.city}, {request.state} ({request.recipientName} • {request.recipientPhone})
                      </p>
                    )}
                  </div>

                  {/* Status History Logs */}
                  <div className="space-y-3">
                    <h3 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider m-0">
                      Status Activity History
                    </h3>
                    <div className="space-y-2">
                      {request.history?.map((h, i) => (
                        <div key={i} className="flex items-start gap-3 text-xs bg-white p-3 rounded-xl border border-slate-100">
                          <ClockCircleOutlined className="text-slate-400 mt-0.5" />
                          <div className="flex-1">
                            <span className="font-bold text-slate-800">{h.status}</span>
                            <p className="text-slate-500 m-0">{h.message}</p>
                          </div>
                          <span className="text-[10px] text-slate-400 shrink-0">{formatDate(h.createdAt)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ),
            },
            {
              key: 'documents',
              label: 'Documents',
              children: (
                <div className="space-y-6 pt-2">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-extrabold text-slate-800 text-sm m-0">Uploaded Clearance Documents</h3>
                      <p className="text-xs text-slate-500 m-0">View or upload additional shipping documents.</p>
                    </div>

                    <Upload
                      beforeUpload={(file) => {
                        handleDocUpload(file);
                        return false;
                      }}
                      showUploadList={false}
                    >
                      <Button
                        type="primary"
                        icon={<UploadOutlined />}
                        loading={uploadingDoc}
                        className="!bg-brand-navy font-bold rounded-xl text-xs h-9"
                      >
                        Upload Additional Document
                      </Button>
                    </Upload>
                  </div>

                  <div className="space-y-3">
                    {request.documents && request.documents.length > 0 ? (
                      request.documents.map((doc) => (
                        <div
                          key={doc.id}
                          className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center justify-between text-xs"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-lg">
                              <FilePdfOutlined />
                            </div>
                            <div>
                              <span className="font-extrabold text-slate-800 block capitalize">
                                {doc.documentType.replace('_', ' ')}
                              </span>
                              <span className="text-slate-500 text-[11px]">{doc.fileName}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <Tag color={doc.status === 'accepted' ? 'success' : 'processing'} className="font-bold text-[10px] uppercase">
                              {doc.status.replace('_', ' ')}
                            </Tag>
                            <a
                              href={doc.fileUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs font-bold text-brand-orange hover:underline"
                            >
                              Preview / Download
                            </a>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 bg-slate-50 rounded-xl text-xs text-slate-400">
                        No documents attached yet.
                      </div>
                    )}
                  </div>
                </div>
              ),
            },
            {
              key: 'charges',
              label: (
                <span>
                  Charges &amp; Quotes{' '}
                  {totalPendingChargesAmount > 0 && (
                    <Badge count={1} size="small" className="ml-1" />
                  )}
                </span>
              ),
              children: (
                <div className="space-y-6 pt-2">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-extrabold text-slate-800 text-sm m-0">Clearance Charges &amp; Duty Quotes</h3>
                      <p className="text-xs text-slate-500 m-0">Itemized breakdown of government duties, service fees &amp; delivery charges.</p>
                    </div>

                    {totalPendingChargesAmount > 0 && (
                      <Button
                        type="primary"
                        onClick={() => setPayModalVisible(true)}
                        icon={<WalletOutlined />}
                        className="!bg-brand-orange hover:!bg-brand-orange/90 font-extrabold rounded-xl text-xs h-10 px-6"
                      >
                        Pay Pending Charges (₦{totalPendingChargesAmount.toLocaleString()})
                      </Button>
                    )}
                  </div>

                  <div className="space-y-3">
                    {request.charges && request.charges.length > 0 ? (
                      request.charges.map((charge) => (
                        <div
                          key={charge.id}
                          className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center justify-between text-xs"
                        >
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-extrabold text-slate-800">{charge.description}</span>
                              <Tag color={charge.isConfirmed ? 'blue' : 'orange'} className="font-bold text-[10px]">
                                {charge.isConfirmed ? 'Confirmed' : 'Estimated'}
                              </Tag>
                            </div>
                            <span className="text-slate-400 text-[11px] capitalize">Category: {charge.category.replace('_', ' ')}</span>
                          </div>

                          <div className="text-right">
                            <span className="text-sm font-black text-brand-navy block">
                              ₦{Number(charge.amount || 0).toLocaleString()} {charge.currency}
                            </span>
                            <Tag
                              color={charge.status === 'paid' ? 'success' : 'warning'}
                              className="font-bold text-[10px] uppercase mt-0.5"
                            >
                              {charge.status}
                            </Tag>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 bg-slate-50 rounded-xl text-xs text-slate-400">
                        No clearance charges issued yet. Charges will appear here after document assessment.
                      </div>
                    )}
                  </div>
                </div>
              ),
            },
            {
              key: 'messages',
              label: 'Messages & Support',
              children: (
                <div className="space-y-4 pt-2">
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 max-h-96 overflow-y-auto space-y-3">
                    {request.messages && request.messages.length > 0 ? (
                      request.messages.map((msg) => {
                        const isMe = msg.senderRole === 'customer';
                        const isSystem = msg.isSystemMessage || msg.senderRole === 'system';

                        if (isSystem) {
                          return (
                            <div key={msg.id} className="text-center my-3">
                              <span className="text-[11px] font-bold text-slate-500 bg-slate-200/60 px-3 py-1 rounded-full inline-block">
                                🤖 System: {msg.message}
                              </span>
                            </div>
                          );
                        }

                        return (
                          <div
                            key={msg.id}
                            className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                          >
                            <span className="text-[10px] font-bold text-slate-400 mb-1">
                              {msg.senderName} ({msg.senderRole})
                            </span>
                            <div
                              className={`p-3 rounded-2xl text-xs max-w-md ${
                                isMe
                                  ? 'bg-brand-navy text-white rounded-br-none'
                                  : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none shadow-sm'
                              }`}
                            >
                              {msg.message}
                              {msg.attachmentUrl && (
                                <div className="mt-2 pt-2 border-t border-white/20">
                                  <a
                                    href={msg.attachmentUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-xs text-amber-300 font-bold underline"
                                  >
                                    View Attachment
                                  </a>
                                </div>
                              )}
                            </div>
                            <span className="text-[9px] text-slate-400 mt-0.5">
                              {formatDate(msg.createdAt)}
                            </span>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-center py-8 text-xs text-slate-400">
                        No messages yet. Send a message below to communicate with the clearance team.
                      </div>
                    )}
                  </div>

                  {/* Send Box */}
                  <div className="flex gap-2">
                    <TextArea
                      rows={2}
                      placeholder="Type a message or question regarding your clearance request..."
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      className="rounded-xl text-xs"
                    />
                    <Button
                      type="primary"
                      onClick={handleSendMessage}
                      loading={sendingMsg}
                      icon={<SendOutlined />}
                      className="!bg-brand-orange hover:!bg-brand-orange/90 font-bold rounded-xl h-auto px-5 shrink-0"
                    >
                      Send
                    </Button>
                  </div>
                </div>
              ),
            },
          ]}
        />
      </Card>

      {/* Pay Charges Modal */}
      <Modal
        title="Pay Clearance Charges via Wallet"
        open={payModalVisible}
        onCancel={() => setPayModalVisible(false)}
        onOk={handlePayCharges}
        confirmLoading={paying}
        okText="Pay Now via Wallet"
        okButtonProps={{ className: '!bg-brand-orange font-bold' }}
      >
        <div className="space-y-4 text-xs py-2">
          <p className="m-0 text-slate-600">
            You are about to pay the pending clearance charges for request <span className="font-bold text-brand-navy">{request.requestNumber}</span>.
          </p>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
            <div className="flex justify-between font-bold text-slate-800">
              <span>Total Charges Due:</span>
              <span className="text-brand-orange">₦{totalPendingChargesAmount.toLocaleString()} NGN</span>
            </div>
            <p className="text-[11px] text-slate-500 m-0">
              This amount will be debited directly from your customer wallet balance.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ClearanceDetailTrackerPage;
