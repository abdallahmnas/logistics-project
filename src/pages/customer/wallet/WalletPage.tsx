import React, { useEffect, useState } from 'react';
import { Button, Table, Tag, Modal, InputNumber, Input, Form, message, Upload, Spin, Alert, Tooltip } from 'antd';
import type { UploadFile } from 'antd';
import {
  WalletOutlined,
  PlusOutlined,
  BankOutlined,
  CopyOutlined,
  CloudUploadOutlined,
  LoadingOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  ArrowRightOutlined,
  CheckOutlined,
} from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import {
  fetchTransactions,
  fetchWallet,
  fetchDeposits,
  submitDeposit,
} from '../../../store/slices/walletSlice';
import { fetchSettings } from '../../../store/slices/settingsSlice';
import { FileThumbnail } from '../../../components/common/FileThumbnail';
import type { WalletTransaction, WalletDeposit } from '../../../types/wallet.types';

export const WalletPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const [form] = Form.useForm();
  const { wallet, data: walletData, transactions, deposits, loading } = useAppSelector(
    (state) => state.wallet
  );
  const { settings } = useAppSelector((state) => state.settings);

  const [topUpOpen, setTopUpOpen] = useState(false);
  const [topUpSubmitting, setTopUpSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  useEffect(() => {
    dispatch(fetchWallet());
    dispatch(fetchTransactions());
    dispatch(fetchDeposits());
    dispatch(fetchSettings());
  }, [dispatch]);

  const activeWallet = wallet || walletData;
  const balance = Number(activeWallet?.balance || 0);
  const escrowHeld = Number(activeWallet?.escrowHeld || 0);
  const availableBalance = Number(activeWallet?.availableBalance || balance - escrowHeld);

  const bankName = settings?.ngnEscrowBankName || 'GTBank';
  const accountNo = settings?.ngnEscrowAccountNo || '0123456789';
  const accountName = settings?.ngnEscrowAccountName || 'HAMZA RMB GLOBAL COMPANY LTD';

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    message.success(`${label} copied to clipboard!`);
  };

  const handleDepositSubmit = async (values: any) => {
    if (fileList.length === 0) {
      message.error('Please upload your payment receipt photo or PDF document.');
      return;
    }
    try {
      setTopUpSubmitting(true);
      const formData = new FormData();
      formData.append('amount', String(values.amount));
      formData.append('senderName', values.senderName);
      if (values.sessionId) formData.append('sessionId', values.sessionId);

      const file = fileList[0];
      if (file.originFileObj) {
        formData.append('receipt', file.originFileObj as File);
      } else if (file.url) {
        formData.append('paymentReceiptUrl', file.url);
      }

      await dispatch(submitDeposit(formData)).unwrap();
      message.success('Deposit request submitted! Our staff will verify payment and credit your wallet shortly.');
      setTopUpOpen(false);
      form.resetFields();
      setFileList([]);
      dispatch(fetchDeposits());
      dispatch(fetchWallet());
    } catch (err: any) {
      message.error(err?.message || 'Failed to submit deposit request');
    } finally {
      setTopUpSubmitting(false);
    }
  };

  const recentTransactions = [...transactions].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const recentDeposits = [...deposits].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const depositColumns = [
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
      title: 'Sender & Session ID',
      key: 'senderInfo',
      render: (record: WalletDeposit) => (
        <div>
          <div className="text-xs font-bold text-slate-800">{record.senderName}</div>
          {record.sessionId ? (
            <div className="text-[10px] text-slate-500 font-mono bg-slate-100 px-1.5 py-0.5 rounded inline-block mt-0.5">
              Session ID: {record.sessionId}
            </div>
          ) : (
            <div className="text-[10px] text-slate-400 italic">No Session ID</div>
          )}
        </div>
      ),
    },
    {
      title: 'Proof of Payment',
      key: 'receipt',
      render: (record: WalletDeposit) => (
        <FileThumbnail url={record.paymentReceiptUrl} size="sm" showName={false} />
      ),
    },
    {
      title: 'Verification Status',
      key: 'status',
      render: (record: WalletDeposit) => {
        if (record.status === 'approved') {
          return (
            <Tag color="green" icon={<CheckCircleOutlined />} className="font-bold border-none text-[10px] uppercase py-0.5 px-2">
              APPROVED & CREDITED
            </Tag>
          );
        }
        if (record.status === 'rejected') {
          return (
            <Tooltip title={`Rejection Reason: ${record.rejectionReason || 'Receipt invalid'}`}>
              <Tag color="red" icon={<CloseCircleOutlined />} className="font-bold border-none text-[10px] uppercase cursor-pointer py-0.5 px-2">
                REJECTED
              </Tag>
            </Tooltip>
          );
        }
        return (
          <Tag color="orange" icon={<ClockCircleOutlined />} className="font-bold border-none text-[10px] uppercase py-0.5 px-2">
            PENDING VERIFICATION
          </Tag>
        );
      },
    },
  ];

  const txColumns = [
    {
      title: 'Date',
      dataIndex: 'createdAt',
      key: 'date',
      render: (d: string) => (
        <span className="text-xs text-slate-600">
          {new Date(d).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}
        </span>
      ),
    },
    {
      title: 'Description',
      key: 'description',
      render: (record: WalletTransaction) => (
        <div>
          <div className="text-sm font-medium text-slate-800">
            {record.description || 'Transaction'}
          </div>
          <div className="text-[10px] text-slate-400">
            {record.referenceId || record.category.replace(/_/g, ' ')}
          </div>
        </div>
      ),
    },
    {
      title: 'Amount (₦)',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number, record: WalletTransaction) => (
        <span
          className={`font-bold text-sm ${record.type === 'credit' || record.type === 'refund' ? 'text-green-600' : 'text-slate-800'}`}
        >
          {record.type === 'credit' || record.type === 'refund' ? '+' : '-'}₦
          {Number(amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'type',
      key: 'status',
      render: () => (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
          ✓ COMPLETED
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Wallet Balance Banner */}
      <div className="bg-[#0A1128] rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl">
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -left-10 -bottom-20 w-60 h-60 bg-brand-orange/10 rounded-full blur-3xl"></div>

        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <WalletOutlined className="text-amber-400 text-lg" />
              <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">
                Naira Platform Wallet
              </span>
            </div>
            <p className="text-slate-300 text-xs m-0 mb-4">
              Balance used for Buy-For-Me procurement, Air/Sea Shipping & Local Delivery
            </p>
            <div className="text-4xl sm:text-5xl font-black tracking-tight mb-2 text-white">
              ₦{balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
            {escrowHeld > 0 && (
              <div className="text-xs text-amber-300 font-semibold bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-lg inline-block">
                Available: ₦{availableBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })} (₦{escrowHeld.toLocaleString()} Escrow Held)
              </div>
            )}
          </div>

          <div className="flex gap-4 relative z-10">
            <Button
              size="large"
              className="bg-brand-orange hover:bg-[#E86E21] text-white border-none font-extrabold shadow-lg px-8 h-12 rounded-xl text-base flex items-center gap-2"
              icon={<PlusOutlined />}
              onClick={() => setTopUpOpen(true)}
            >
              Submit Funding Request
            </Button>
          </div>
        </div>
      </div>

      {/* Official Platform Funding Bank Account Card */}
      <div className="bg-gradient-to-r from-slate-900 via-[#0A1128] to-[#1C2A4E] text-white rounded-3xl p-6 sm:p-8 shadow-md border border-slate-800 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-4">
          <div>
            <span className="text-[10px] font-extrabold text-brand-orange uppercase tracking-widest block mb-1">
              OFFICIAL PLATFORM FUNDING ACCOUNT
            </span>
            <h2 className="text-xl font-black text-white m-0 flex items-center gap-2">
              <BankOutlined className="text-amber-400" /> Transfer Money to Platform Bank Account
            </h2>
          </div>
          <Button
            type="primary"
            size="large"
            onClick={() => setTopUpOpen(true)}
            className="bg-brand-orange hover:bg-[#E86E21] border-none font-extrabold text-sm rounded-xl px-6"
            icon={<CloudUploadOutlined />}
          >
            Submit Proof of Payment →
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-950/80 p-5 rounded-2xl border border-slate-800/80 space-y-1">
            <span className="text-xs text-slate-400 font-bold block uppercase tracking-wider">Bank Name</span>
            <span className="text-lg font-black text-white block">{bankName}</span>
          </div>

          <div className="bg-slate-950/80 p-5 rounded-2xl border border-slate-800/80 space-y-1 relative">
            <span className="text-xs text-slate-400 font-bold block uppercase tracking-wider">Account Number</span>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-mono font-black text-amber-400">{accountNo}</span>
              <Button
                size="small"
                icon={<CopyOutlined />}
                className="bg-amber-500/20 text-amber-300 border-amber-500/30 hover:bg-amber-500/40 text-xs font-bold"
                onClick={() => copyToClipboard(accountNo, 'Account Number')}
              >
                Copy
              </Button>
            </div>
          </div>

          <div className="bg-slate-950/80 p-5 rounded-2xl border border-slate-800/80 space-y-1">
            <span className="text-xs text-slate-400 font-bold block uppercase tracking-wider">Account Name</span>
            <span className="text-sm font-extrabold text-white block truncate">{accountName}</span>
          </div>
        </div>

        {/* 3 Step Manual Process Guide */}
        <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-300">
          <div className="flex items-center gap-3">
            <span className="w-7 h-7 rounded-full bg-brand-orange text-white font-black flex items-center justify-center text-xs shrink-0">1</span>
            <span>Make bank transfer of desired amount to account details above.</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="w-7 h-7 rounded-full bg-brand-orange text-white font-black flex items-center justify-center text-xs shrink-0">2</span>
            <span>Click <strong>"Submit Proof of Payment"</strong> button.</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="w-7 h-7 rounded-full bg-brand-orange text-white font-black flex items-center justify-center text-xs shrink-0">3</span>
            <span>Fill amount, sender name, upload receipt & optional session ID for staff approval.</span>
          </div>
        </div>
      </div>

      {/* Manual Deposit Requests Section */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-4">
        <div className="flex justify-between items-center pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-[#0A1128] m-0">Manual Top-Up Requests & Status</h2>
            <p className="text-xs text-slate-500 m-0">Track staff verification of your submitted bank transfer receipts</p>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setTopUpOpen(true)}
            className="bg-brand-orange border-none font-bold text-xs"
          >
            Submit New Deposit
          </Button>
        </div>

        {recentDeposits.length === 0 ? (
          <Alert
            type="info"
            showIcon
            message="No Funding Requests Submitted Yet"
            description="Transfer money to the platform bank account above, then click 'Submit Proof of Payment' to submit your transfer details and upload receipt."
          />
        ) : (
          <Table
            columns={depositColumns}
            dataSource={recentDeposits}
            rowKey="id"
            pagination={{ pageSize: 5 }}
            className="[&_.ant-table-thead_th]:!bg-slate-50 [&_.ant-table-thead_th]:!text-slate-600 [&_.ant-table-thead_th]:!text-xs [&_.ant-table-thead_th]:!font-bold [&_.ant-table-thead_th]:uppercase"
          />
        )}
      </div>

      {/* Recent Transactions Table */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-4">
        <div className="flex justify-between items-center pb-3 border-b border-slate-100">
          <h2 className="text-lg font-bold text-[#0A1128] m-0">Wallet Transaction History</h2>
          <span className="text-xs text-slate-400 font-semibold">Total ({recentTransactions.length})</span>
        </div>
        <Table
          columns={txColumns}
          dataSource={recentTransactions}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          loading={loading}
          className="[&_.ant-table-thead_th]:!bg-slate-50 [&_.ant-table-thead_th]:!text-slate-600 [&_.ant-table-thead_th]:!text-xs [&_.ant-table-thead_th]:!font-bold [&_.ant-table-thead_th]:uppercase"
        />
      </div>

      {/* Manual Wallet Funding Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-lg font-bold text-brand-navy">
            <BankOutlined className="text-brand-orange" />
            Submit Manual Bank Transfer Funding Request
          </div>
        }
        open={topUpOpen}
        onCancel={() => setTopUpOpen(false)}
        footer={null}
        width={600}
        className="rounded-2xl"
        destroyOnHidden
      >
        <div className="space-y-6 pt-3">
          {/* Step 1: Admin Funding Bank Account Card */}
          <div className="bg-gradient-to-r from-[#0A1128] to-[#1C2A4E] text-white p-5 rounded-2xl border border-slate-800 space-y-3 relative shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-extrabold text-amber-400 uppercase tracking-widest block mb-0.5">
                  STEP 1: TRANSFER FUNDS TO COMPANY ACCOUNT
                </span>
                <h3 className="text-lg font-black text-white m-0">{bankName}</h3>
              </div>
              <BankOutlined className="text-2xl text-amber-400" />
            </div>

            <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-400 font-semibold">Account Number:</span>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-mono font-black text-amber-400">{accountNo}</span>
                  <Button
                    size="small"
                    icon={<CopyOutlined />}
                    className="bg-amber-500/20 text-amber-300 border-amber-500/30 hover:bg-amber-500/30 text-xs font-bold"
                    onClick={() => copyToClipboard(accountNo, 'Account Number')}
                  >
                    Copy
                  </Button>
                </div>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-slate-800">
                <span className="text-xs text-slate-400 font-semibold">Account Name:</span>
                <span className="text-xs font-bold text-white">{accountName}</span>
              </div>
            </div>

            <p className="text-xs text-slate-300 m-0 leading-relaxed">
              <strong>Instructions:</strong> Transfer your deposit amount to the bank account above. Then enter the amount, sender name, upload receipt image/PDF, and optional session ID below.
            </p>
          </div>

          {/* Step 2: Form to confirm transaction */}
          <Form form={form} layout="vertical" onFinish={handleDepositSubmit}>
            <span className="text-[10px] font-extrabold text-brand-orange uppercase tracking-widest block mb-3">
              STEP 2: FILL TRANSACTION DETAILS & ATTACH RECEIPT
            </span>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Form.Item
                name="amount"
                label={<span className="font-bold text-slate-700">Amount Transferred (Naira ₦) <span className="text-red-500">*</span></span>}
                rules={[{ required: true, message: 'Please enter deposit amount' }]}
              >
                <InputNumber
                  size="large"
                  className="w-full bg-slate-50 border-slate-200"
                  prefix="₦"
                  min={100}
                  step={5000}
                  placeholder="e.g. 50,000"
                />
              </Form.Item>

              <Form.Item
                name="senderName"
                label={<span className="font-bold text-slate-700">Sender Name (Name on Account) <span className="text-red-500">*</span></span>}
                rules={[{ required: true, message: 'Please enter sender name' }]}
              >
                <Input size="large" placeholder="e.g. Adebayo Okonkwo" className="bg-slate-50 border-slate-200" />
              </Form.Item>
            </div>

            <Form.Item
              name="sessionId"
              label={<span className="font-bold text-slate-700">Session ID / Bank Reference NO. <span className="text-slate-400">(Optional)</span></span>}
            >
              <Input size="large" placeholder="e.g. 0000132408221643190" className="bg-slate-50 border-slate-200 font-mono" />
            </Form.Item>

            <Form.Item
              label={<span className="font-bold text-slate-700">Upload Payment Receipt / Proof of Transfer <span className="text-red-500">*</span></span>}
              required
            >
              <Upload.Dragger
                className="bg-slate-50 border-dashed border-slate-300 rounded-xl"
                beforeUpload={() => false}
                accept="image/*,.pdf,application/pdf"
                maxCount={1}
                fileList={fileList}
                onChange={({ fileList: newFileList }) => {
                  setUploading(true);
                  newFileList.forEach((f) => { f.status = 'done'; });
                  setFileList(newFileList);
                  setTimeout(() => setUploading(false), 200);
                }}
              >
                <p className="ant-upload-drag-icon">
                  {uploading ? (
                    <Spin indicator={<LoadingOutlined className="text-3xl text-brand-orange" spin />} />
                  ) : (
                    <CloudUploadOutlined className="text-brand-orange text-3xl" />
                  )}
                </p>
                <p className="ant-upload-text font-bold text-slate-700">Click or drag receipt photo / PDF here</p>
                <p className="ant-upload-hint text-xs text-slate-500">PNG, JPG, WEBP, PDF (Max 10MB)</p>
              </Upload.Dragger>
            </Form.Item>

            <div className="flex justify-end gap-3 pt-2">
              <Button onClick={() => setTopUpOpen(false)} size="large">
                Cancel
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                loading={topUpSubmitting}
                disabled={fileList.length === 0 || uploading}
                className="bg-brand-orange hover:bg-[#E86E21] border-none font-bold px-8"
              >
                Confirm Transaction & Submit →
              </Button>
            </div>
          </Form>
        </div>
      </Modal>
    </div>
  );
};
