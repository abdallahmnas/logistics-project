import React, { useEffect, useState } from 'react';
import { Card, Table, Tag, Button, Modal, Input, message, Alert, Tabs, Space, Tooltip, Descriptions } from 'antd';
import {
  WalletOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  EyeOutlined,
  CheckOutlined,
  CloseOutlined,
  SearchOutlined,
  FilterOutlined,
} from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import {
  fetchAdminDeposits,
  approveDepositAdmin,
  rejectDepositAdmin,
} from '../../../store/slices/walletSlice';
import { FileThumbnail } from '../../../components/common/FileThumbnail';
import type { WalletDeposit } from '../../../types/wallet.types';

const { TextArea } = Input;

export const WalletFundingManagement: React.FC = () => {
  const dispatch = useAppDispatch();
  const { adminDeposits, loading } = useAppSelector((state) => state.wallet);

  const [activeTab, setActiveTab] = useState<string>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReceiptUrl, setSelectedReceiptUrl] = useState<string | null>(null);

  // Action Modals
  const [approveModalItem, setApproveModalItem] = useState<WalletDeposit | null>(null);
  const [approving, setApproving] = useState(false);

  const [rejectModalItem, setRejectModalItem] = useState<WalletDeposit | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejecting, setRejecting] = useState(false);

  useEffect(() => {
    dispatch(fetchAdminDeposits(activeTab));
  }, [dispatch, activeTab]);

  const handleConfirmApprove = async () => {
    if (!approveModalItem) return;
    try {
      setApproving(true);
      await dispatch(approveDepositAdmin(approveModalItem.id)).unwrap();
      message.success(`Deposit approved & ₦${approveModalItem.amount.toLocaleString()} credited to ${approveModalItem.customerName}'s wallet!`);
      setApproveModalItem(null);
      dispatch(fetchAdminDeposits(activeTab));
    } catch (err: any) {
      message.error(err?.message || 'Failed to approve deposit');
    } finally {
      setApproving(false);
    }
  };

  const handleConfirmReject = async () => {
    if (!rejectModalItem) return;
    if (!rejectionReason.trim()) {
      message.error('Please enter a rejection reason.');
      return;
    }
    try {
      setRejecting(true);
      await dispatch(
        rejectDepositAdmin({
          depositId: rejectModalItem.id,
          rejectionReason: rejectionReason.trim(),
        })
      ).unwrap();
      message.success(`Deposit request rejected and customer notified.`);
      setRejectModalItem(null);
      setRejectionReason('');
      dispatch(fetchAdminDeposits(activeTab));
    } catch (err: any) {
      message.error(err?.message || 'Failed to reject deposit');
    } finally {
      setRejecting(false);
    }
  };

  const filteredDeposits = adminDeposits.filter((d) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      d.customerName.toLowerCase().includes(q) ||
      d.customerId.toLowerCase().includes(q) ||
      d.senderName.toLowerCase().includes(q) ||
      (d.sessionId && d.sessionId.toLowerCase().includes(q))
    );
  });

  const pendingCount = adminDeposits.filter((d) => d.status === 'pending').length;
  const approvedCount = adminDeposits.filter((d) => d.status === 'approved').length;
  const rejectedCount = adminDeposits.filter((d) => d.status === 'rejected').length;

  const columns = [
    {
      title: 'Customer Details',
      key: 'customer',
      render: (record: WalletDeposit) => (
        <div>
          <div className="text-xs font-extrabold text-[#0A1128]">{record.customerName}</div>
          <div className="text-[10px] font-mono text-slate-400">ID: {record.customerId}</div>
        </div>
      ),
    },
    {
      title: 'Amount (₦)',
      dataIndex: 'amount',
      key: 'amount',
      render: (amt: number) => (
        <span className="font-extrabold text-sm text-brand-orange">
          ₦{Number(amt).toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      title: 'Sender & Reference',
      key: 'senderInfo',
      render: (record: WalletDeposit) => (
        <div>
          <div className="text-xs font-bold text-slate-800">{record.senderName}</div>
          {record.sessionId ? (
            <div className="text-[10px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded inline-block mt-0.5">
              Ref: {record.sessionId}
            </div>
          ) : (
            <div className="text-[10px] text-slate-400 italic">No Reference ID</div>
          )}
        </div>
      ),
    },
    {
      title: 'Payment Receipt',
      key: 'receipt',
      render: (record: WalletDeposit) => (
        <div className="flex items-center gap-2">
          <FileThumbnail url={record.paymentReceiptUrl} size="sm" showName={false} />
          <Button
            size="small"
            type="text"
            icon={<EyeOutlined />}
            onClick={() => setSelectedReceiptUrl(record.paymentReceiptUrl)}
            className="text-xs text-brand-blue font-semibold"
          >
            Preview
          </Button>
        </div>
      ),
    },
    {
      title: 'Date Submitted',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (d: string) => (
        <span className="text-xs text-slate-600 font-medium">
          {new Date(d).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
        </span>
      ),
    },
    {
      title: 'Status',
      key: 'status',
      render: (record: WalletDeposit) => {
        if (record.status === 'approved') {
          return (
            <div>
              <Tag color="green" icon={<CheckCircleOutlined />} className="font-bold border-none text-[10px] uppercase">
                APPROVED & CREDITED
              </Tag>
              {record.reviewedBy && (
                <div className="text-[10px] text-slate-400 mt-0.5">By {record.reviewedBy}</div>
              )}
            </div>
          );
        }
        if (record.status === 'rejected') {
          return (
            <div>
              <Tooltip title={`Reason: ${record.rejectionReason || 'Receipt invalid'}`}>
                <Tag color="red" icon={<CloseCircleOutlined />} className="font-bold border-none text-[10px] uppercase cursor-pointer">
                  REJECTED
                </Tag>
              </Tooltip>
              {record.reviewedBy && (
                <div className="text-[10px] text-slate-400 mt-0.5">By {record.reviewedBy}</div>
              )}
            </div>
          );
        }
        return (
          <Tag color="orange" icon={<ClockCircleOutlined />} className="font-bold border-none text-[10px] uppercase">
            PENDING APPROVAL
          </Tag>
        );
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record: WalletDeposit) => {
        if (record.status !== 'pending') {
          return <span className="text-xs text-slate-400 italic">No Action Needed</span>;
        }
        return (
          <Space>
            <Button
              type="primary"
              size="small"
              icon={<CheckOutlined />}
              onClick={() => setApproveModalItem(record)}
              className="bg-emerald-600 hover:bg-emerald-700 border-none font-bold text-xs shadow-sm"
            >
              Approve & Credit
            </Button>
            <Button
              danger
              size="small"
              icon={<CloseOutlined />}
              onClick={() => {
                setRejectModalItem(record);
                setRejectionReason('');
              }}
              className="font-bold text-xs"
            >
              Reject
            </Button>
          </Space>
        );
      },
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-gradient-to-r from-[#0A1128] to-[#1C2A4E] p-6 rounded-2xl text-white shadow-md gap-4">
        <div>
          <span className="text-xs font-bold text-brand-orange uppercase tracking-wider block mb-1">
            Financial Management
          </span>
          <h1 className="text-2xl font-black text-white m-0 flex items-center gap-2">
            <WalletOutlined className="text-brand-orange" /> Manual Wallet Funding & Top-Ups
          </h1>
          <p className="text-slate-300 text-sm mt-1 mb-0 max-w-xl">
            Verify bank payment receipts submitted by customers and credit their Naira platform wallets.
          </p>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right">
            <span className="text-xs text-slate-400 font-bold block uppercase tracking-wider">Pending Verification</span>
            <span className="text-2xl font-black text-brand-orange">{pendingCount}</span>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-400 font-bold block uppercase tracking-wider">Total Approved</span>
            <span className="text-2xl font-black text-emerald-400">{approvedCount}</span>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <Card variant="borderless" className="shadow-sm border border-slate-100 rounded-2xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 pb-4 border-b border-slate-100">
          <Tabs
            activeKey={activeTab}
            onChange={(key) => setActiveTab(key)}
            className="[&_.ant-tabs-nav]:!mb-0"
            items={[
              { key: 'pending', label: `Pending Approval (${pendingCount})` },
              { key: 'approved', label: `Approved (${approvedCount})` },
              { key: 'rejected', label: `Rejected (${rejectedCount})` },
              { key: 'all', label: 'All Requests' },
            ]}
          />

          <Input
            placeholder="Search by customer name, ID, or reference..."
            prefix={<SearchOutlined className="text-slate-400 mr-2" />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-xs bg-slate-50 border-slate-200"
          />
        </div>

        <Table
          columns={columns}
          dataSource={filteredDeposits}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
          className="[&_.ant-table-thead_th]:!bg-slate-50 [&_.ant-table-thead_th]:!text-slate-600 [&_.ant-table-thead_th]:!text-xs [&_.ant-table-thead_th]:!font-bold [&_.ant-table-thead_th]:uppercase"
        />
      </Card>

      {/* Receipt Full Preview Modal */}
      <Modal
        open={!!selectedReceiptUrl}
        onCancel={() => setSelectedReceiptUrl(null)}
        footer={null}
        title="Payment Receipt Proof"
        width={700}
        destroyOnHidden
      >
        {selectedReceiptUrl && (
          <div className="flex justify-center p-4">
            <FileThumbnail url={selectedReceiptUrl} size="lg" showName={true} />
          </div>
        )}
      </Modal>

      {/* Approve Confirmation Modal */}
      <Modal
        open={!!approveModalItem}
        onCancel={() => setApproveModalItem(null)}
        footer={null}
        title={
          <div className="flex items-center gap-2 text-lg font-bold text-emerald-600">
            <CheckCircleOutlined /> Approve Wallet Deposit & Credit Funds
          </div>
        }
      >
        {approveModalItem && (
          <div className="space-y-4 pt-2">
            <Alert
              type="success"
              showIcon
              message="Confirm Payment Credit"
              description="Approving this request will instantly credit the requested deposit amount to the customer's active wallet balance."
            />

            <Descriptions column={1} bordered size="small" className="bg-slate-50 rounded-xl">
              <Descriptions.Item label="Customer">{approveModalItem.customerName} ({approveModalItem.customerId})</Descriptions.Item>
              <Descriptions.Item label="Sender Name">{approveModalItem.senderName}</Descriptions.Item>
              <Descriptions.Item label="Session / Ref ID">{approveModalItem.sessionId || 'N/A'}</Descriptions.Item>
              <Descriptions.Item label="Deposit Amount">
                <span className="text-brand-orange font-black text-lg">₦{approveModalItem.amount.toLocaleString()}</span>
              </Descriptions.Item>
            </Descriptions>

            <div className="flex justify-end gap-3 pt-2">
              <Button onClick={() => setApproveModalItem(null)}>Cancel</Button>
              <Button
                type="primary"
                loading={approving}
                onClick={handleConfirmApprove}
                className="bg-emerald-600 hover:bg-emerald-700 border-none font-bold"
              >
                Confirm & Credit ₦{approveModalItem.amount.toLocaleString()} →
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Reject Modal */}
      <Modal
        open={!!rejectModalItem}
        onCancel={() => setRejectModalItem(null)}
        footer={null}
        title={
          <div className="flex items-center gap-2 text-lg font-bold text-red-600">
            <CloseCircleOutlined /> Reject Wallet Deposit Request
          </div>
        }
      >
        {rejectModalItem && (
          <div className="space-y-4 pt-2">
            <Alert
              type="warning"
              showIcon
              message="Rejection Reason Required"
              description="Please specify why this payment proof was rejected. The customer will receive a notification with this reason."
            />

            <Descriptions column={1} bordered size="small" className="bg-slate-50 rounded-xl">
              <Descriptions.Item label="Customer">{rejectModalItem.customerName} ({rejectModalItem.customerId})</Descriptions.Item>
              <Descriptions.Item label="Deposit Amount">₦{rejectModalItem.amount.toLocaleString()}</Descriptions.Item>
            </Descriptions>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">Rejection Reason *</label>
              <TextArea
                rows={3}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="e.g. Payment receipt image is unreadable, or transfer reference not found in bank statement."
                className="bg-slate-50 border-slate-200"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button onClick={() => setRejectModalItem(null)}>Cancel</Button>
              <Button
                danger
                type="primary"
                loading={rejecting}
                onClick={handleConfirmReject}
                className="font-bold"
              >
                Confirm Rejection
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
