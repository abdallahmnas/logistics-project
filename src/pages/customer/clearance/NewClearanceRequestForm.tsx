import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Steps,
  Button,
  Card,
  Input,
  Select,
  Radio,
  Checkbox,
  Upload,
  message,
  Tag,
  Divider,
  Tooltip,
} from 'antd';
import {
  RocketOutlined,
  GlobalOutlined,
  CarOutlined,
  PlusOutlined,
  DeleteOutlined,
  UploadOutlined,
  FilePdfOutlined,
  FileImageOutlined,
  CheckCircleOutlined,
  EditOutlined,
  SaveOutlined,
  ArrowLeftOutlined,
  ArrowRightOutlined,
  InfoCircleOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import { useAppSelector } from '../../../store/hooks';
import { clearanceService } from '../../../services/clearanceService';
import { uploadService } from '../../../services/uploadService';

const { Option } = Select;
const { TextArea } = Input;

interface ItemFormState {
  id?: string;
  productName: string;
  description: string;
  category: string;
  quantity: number;
  unit: string;
  value: number;
  currency: string;
  countryOfManufacture: string;
  hsCode: string;
  weight?: number;
  volume?: number;
}

interface DocFormState {
  documentType: string;
  fileName: string;
  fileUrl: string;
  isMissingNoted?: boolean;
}

export const NewClearanceRequestForm: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);

  const [currentStep, setCurrentStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const [draftId, setDraftId] = useState<string | null>(null);

  // Step 1: Shipment Details
  const [shipmentType, setShipmentType] = useState<'sea' | 'air' | 'land'>('sea');
  const [originCountry, setOriginCountry] = useState('China');
  const [portOfEntry, setPortOfEntry] = useState('Apapa Port');
  const [customPort, setCustomPort] = useState('');
  const [shipmentStatus, setShipmentStatus] = useState<
    'not_shipped' | 'in_transit' | 'arrived_ng' | 'at_terminal' | 'arrived_uncleared'
  >('in_transit');
  const [shippingLine, setShippingLine] = useState('');
  const [airline, setAirline] = useState('');
  const [billOfLadingNumber, setBillOfLadingNumber] = useState('');
  const [airWaybillNumber, setAirWaybillNumber] = useState('');
  const [containerNumber, setContainerNumber] = useState('');
  const [estimatedArrivalDate, setEstimatedArrivalDate] = useState('');
  const [noShippingInfoProvided, setNoShippingInfoProvided] = useState(false);

  // Step 2: Goods Details
  const [items, setItems] = useState<ItemFormState[]>([
    {
      productName: '',
      description: '',
      category: 'General Goods',
      quantity: 100,
      unit: 'pcs',
      value: 1000,
      currency: 'USD',
      countryOfManufacture: 'China',
      hsCode: '',
      weight: undefined,
      volume: undefined,
    },
  ]);

  // Step 3: Documents
  const [documents, setDocuments] = useState<DocFormState[]>([]);
  const [missingDocs, setMissingDocs] = useState<Record<string, boolean>>({});
  const [uploadingDocType, setUploadingDocType] = useState<string | null>(null);

  // Step 4: Delivery
  const [deliveryPreference, setDeliveryPreference] = useState<'deliver_to_me' | 'self_pickup'>('deliver_to_me');
  const [recipientName, setRecipientName] = useState(
    `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || ''
  );
  const [recipientPhone, setRecipientPhone] = useState(user?.phone || '');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [city, setCity] = useState('Lagos');
  const [state, setState] = useState('Lagos');
  const [deliveryInstructions, setDeliveryInstructions] = useState('');

  // Step 5: Review Confirmation
  const [isConfirmedAccurate, setIsConfirmedAccurate] = useState(true);

  // Calculate Running Goods Summary
  const totalProductsCount = items.length;
  const estimatedGoodsValueUsd = items.reduce(
    (sum, item) => sum + (Number(item.value) || 0),
    0
  );

  const handleAddItem = () => {
    setItems((prev) => [
      ...prev,
      {
        productName: '',
        description: '',
        category: 'General Goods',
        quantity: 1,
        unit: 'pcs',
        value: 0,
        currency: 'USD',
        countryOfManufacture: originCountry || 'China',
        hsCode: '',
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length === 1) {
      message.warning('At least one product item is required.');
      return;
    }
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: keyof ItemFormState, value: any) => {
    setItems((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  // Handle Document File Upload
  const handleFileUpload = async (file: File, docType: string) => {
    try {
      setUploadingDocType(docType);
      const url = await uploadService.uploadFile(file);
      const newDoc: DocFormState = {
        documentType: docType,
        fileName: file.name,
        fileUrl: url,
        isMissingNoted: false,
      };
      setDocuments((prev) => [...prev.filter((d) => d.documentType !== docType), newDoc]);
      setMissingDocs((prev) => ({ ...prev, [docType]: false }));
      message.success(`Uploaded ${file.name} successfully.`);
    } catch (err: any) {
      message.error(err.message || 'File upload failed');
    } finally {
      setUploadingDocType(null);
    }
  };

  const handleToggleMissingDoc = (docType: string, isMissing: boolean) => {
    setMissingDocs((prev) => ({ ...prev, [docType]: isMissing }));
    if (isMissing) {
      setDocuments((prev) => prev.filter((d) => d.documentType !== docType));
    }
  };

  // Save Draft
  const handleSaveDraft = async () => {
    try {
      setSavingDraft(true);
      const payload = getPayload(true);

      let res;
      if (draftId) {
        res = await clearanceService.updateRequest(draftId, payload);
      } else {
        res = await clearanceService.createRequest(payload);
        setDraftId(res.id);
      }
      message.success(`Draft saved! Request ID: ${res.requestNumber}`);
    } catch (err: any) {
      message.error(err.message || 'Failed to save draft');
    } finally {
      setSavingDraft(false);
    }
  };

  // Submit Final Request
  const handleSubmitRequest = async () => {
    if (!isConfirmedAccurate) {
      message.warning('Please confirm that the information provided is accurate before submitting.');
      return;
    }

    try {
      setSubmitting(true);
      const payload = getPayload(false);

      let res;
      if (draftId) {
        payload.submit = true;
        res = await clearanceService.updateRequest(draftId, payload);
      } else {
        res = await clearanceService.createRequest(payload);
      }

      message.success('Customs Clearance Request submitted successfully!');
      navigate(`/customer/customs-clearance/requests/${res.id}/confirmation`);
    } catch (err: any) {
      message.error(err.message || 'Failed to submit clearance request');
    } finally {
      setSubmitting(false);
    }
  };

  const getPayload = (isDraft: boolean) => {
    const finalPort = portOfEntry === 'Other' ? customPort : portOfEntry;
    return {
      isDraft,
      shipmentType,
      originCountry,
      portOfEntry: finalPort,
      shipmentStatus,
      shippingLine,
      airline,
      billOfLadingNumber,
      airWaybillNumber,
      containerNumber,
      estimatedArrivalDate,
      noShippingInfoProvided,
      items: items.map((i) => ({
        productName: i.productName || 'Imported Goods',
        description: i.description,
        category: i.category,
        quantity: Number(i.quantity) || 1,
        unit: i.unit,
        value: Number(i.value) || 0,
        currency: i.currency,
        countryOfManufacture: i.countryOfManufacture,
        hsCode: i.hsCode,
        weight: i.weight,
        volume: i.volume,
      })),
      documents: documents.map((d) => ({
        documentType: d.documentType,
        fileName: d.fileName,
        fileUrl: d.fileUrl,
        isMissingNoted: false,
      })),
      deliveryPreference,
      recipientName,
      recipientPhone,
      deliveryAddress,
      city,
      state,
      deliveryInstructions,
      isConfirmedAccurate,
    };
  };

  const stepsList = [
    { title: 'Shipment', key: 'shipment' },
    { title: 'Goods', key: 'goods' },
    { title: 'Documents', key: 'documents' },
    { title: 'Delivery', key: 'delivery' },
    { title: 'Review', key: 'review' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/customer/customs-clearance')}
            className="text-slate-500 p-0 hover:text-brand-orange mb-1 text-xs font-bold flex items-center gap-1"
          >
            Back to Customs Clearance
          </Button>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800 m-0">
            Request Customs Clearance
          </h1>
          <p className="text-xs text-slate-500 m-0 mt-0.5">
            Provide details about your imported shipment for official clearance in Nigeria.
          </p>
        </div>

        <Button
          onClick={handleSaveDraft}
          loading={savingDraft}
          icon={<SaveOutlined />}
          className="!border-slate-300 font-bold text-xs h-10 rounded-xl hover:!text-brand-orange hover:!border-brand-orange"
        >
          Save Draft &amp; Continue Later
        </Button>
      </div>

      {/* Steps Navigation Bar */}
      <Card className="rounded-2xl border-slate-200 shadow-sm">
        <Steps
          current={currentStep}
          onChange={(step) => setCurrentStep(step)}
          items={stepsList.map((s) => ({ title: s.title }))}
          size="small"
        />
      </Card>

      {/* STEP 1: SHIPMENT DETAILS */}
      {currentStep === 0 && (
        <Card title="Step 1 — Shipment Details" className="rounded-2xl border-slate-200 shadow-sm">
          <div className="space-y-6">
            {/* Shipment Type Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Shipment Type <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { type: 'sea', label: 'Sea Freight', icon: <GlobalOutlined className="text-xl text-blue-600" /> },
                  { type: 'air', label: 'Air Freight', icon: <RocketOutlined className="text-xl text-red-600" /> },
                  { type: 'land', label: 'Land Transport', icon: <CarOutlined className="text-xl text-emerald-600" /> },
                ].map((st) => (
                  <div
                    key={st.type}
                    onClick={() => setShipmentType(st.type as any)}
                    className={`p-4 rounded-xl border text-center cursor-pointer transition-all ${
                      shipmentType === st.type
                        ? 'border-brand-orange bg-orange-50/50 shadow-sm font-bold text-slate-800'
                        : 'border-slate-200 bg-white hover:border-slate-300 text-slate-600'
                    }`}
                  >
                    <div className="mb-2">{st.icon}</div>
                    <span className="text-xs">{st.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Country of Origin & Port of Entry */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Country of Origin <span className="text-rose-500">*</span>
                </label>
                <Select
                  value={originCountry}
                  onChange={(val) => setOriginCountry(val)}
                  className="w-full"
                  size="large"
                >
                  <Option value="China">🇨🇳 China (Default)</Option>
                  <Option value="Turkey">🇹🇷 Turkey</Option>
                  <Option value="United States">🇺🇸 United States</Option>
                  <Option value="United Kingdom">🇬🇧 United Kingdom</Option>
                  <Option value="Germany">🇩🇪 Germany</Option>
                  <Option value="India">🇮🇳 India</Option>
                  <Option value="United Arab Emirates">🇦🇪 UAE / Dubai</Option>
                  <Option value="Other">Other Country</Option>
                </Select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Port / Airport of Entry <span className="text-rose-500">*</span>
                </label>
                <Select
                  value={portOfEntry}
                  onChange={(val) => setPortOfEntry(val)}
                  className="w-full"
                  size="large"
                >
                  <Option value="Apapa Port">Lagos — Apapa Port</Option>
                  <Option value="Tin Can Island Port">Lagos — Tin Can Island Port</Option>
                  <Option value="Lekki Port">Lagos — Lekki Deep Sea Port</Option>
                  <Option value="Murtala Muhammed International Airport">Lagos — Murtala Muhammed Airport (MMIA)</Option>
                  <Option value="Nnamdi Azikiwe International Airport">Abuja — Nnamdi Azikiwe Airport (NAIA)</Option>
                  <Option value="Onne Port">Port Harcourt — Onne Port</Option>
                  <Option value="Other">Other Port / Location</Option>
                </Select>
                {portOfEntry === 'Other' && (
                  <Input
                    placeholder="Enter custom port name..."
                    value={customPort}
                    onChange={(e) => setCustomPort(e.target.value)}
                    className="mt-2"
                  />
                )}
              </div>
            </div>

            {/* Shipment Status */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Current Shipment Status <span className="text-rose-500">*</span>
              </label>
              <Select
                value={shipmentStatus}
                onChange={(val) => setShipmentStatus(val)}
                className="w-full"
                size="large"
              >
                <Option value="not_shipped">Not shipped yet (Preparing in origin country)</Option>
                <Option value="in_transit">In transit (On sea/air vessel to Nigeria)</Option>
                <Option value="arrived_ng">Arrived in Nigeria (Vessel docked/landed)</Option>
                <Option value="at_terminal">At port terminal / holding bay</Option>
                <Option value="arrived_uncleared">Arrived but uncleared (Overdue at port)</Option>
              </Select>
            </div>

            <Divider className="my-2" />

            {/* Dynamic Shipping Information */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider m-0">
                  Shipping Transport Documentation
                </h3>
                <Checkbox
                  checked={noShippingInfoProvided}
                  onChange={(e) => setNoShippingInfoProvided(e.target.checked)}
                  className="text-xs font-semibold text-slate-600"
                >
                  I don&apos;t have this information yet
                </Checkbox>
              </div>

              {!noShippingInfoProvided && (
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
                  {shipmentType === 'sea' && (
                    <>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Shipping Line
                          </label>
                          <Input
                            placeholder="e.g. Maersk, COSCO, MSC, CMA CGM"
                            value={shippingLine}
                            onChange={(e) => setShippingLine(e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Bill of Lading (BL) Number
                          </label>
                          <Input
                            placeholder="e.g. MSK90812374"
                            value={billOfLadingNumber}
                            onChange={(e) => setBillOfLadingNumber(e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Container Number
                          </label>
                          <Input
                            placeholder="e.g. MSKU8819234"
                            value={containerNumber}
                            onChange={(e) => setContainerNumber(e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Estimated Arrival Date (ETA)
                          </label>
                          <Input
                            type="date"
                            value={estimatedArrivalDate}
                            onChange={(e) => setEstimatedArrivalDate(e.target.value)}
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {shipmentType === 'air' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Airline Carrier
                        </label>
                        <Input
                          placeholder="e.g. Ethiopian Airlines, Turkish Cargo"
                          value={airline}
                          onChange={(e) => setAirline(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Air Waybill (AWB) Number
                        </label>
                        <Input
                          placeholder="e.g. 071-89123812"
                          value={airWaybillNumber}
                          onChange={(e) => setAirWaybillNumber(e.target.value)}
                        />
                      </div>
                    </div>
                  )}

                  {shipmentType === 'land' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Transport Company / Trucker
                        </label>
                        <Input
                          placeholder="e.g. Cross-Border Freight Ltd"
                          value={shippingLine}
                          onChange={(e) => setShippingLine(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Waybill / Tracking Reference
                        </label>
                        <Input
                          placeholder="e.g. WBL-881203"
                          value={billOfLadingNumber}
                          onChange={(e) => setBillOfLadingNumber(e.target.value)}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex justify-end pt-4">
              <Button
                type="primary"
                size="large"
                onClick={() => setCurrentStep(1)}
                className="!bg-brand-navy font-bold rounded-xl px-8"
              >
                Next: Goods Details <ArrowRightOutlined />
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* STEP 2: GOODS DETAILS */}
      {currentStep === 1 && (
        <Card title="Step 2 — Goods Details" className="rounded-2xl border-slate-200 shadow-sm">
          <div className="space-y-6">
            <p className="text-xs text-slate-500 m-0">
              Describe the products included in this import shipment. You can add multiple products.
            </p>

            {items.map((item, idx) => (
              <div
                key={idx}
                className="bg-slate-50/80 p-5 rounded-2xl border border-slate-200 relative space-y-4"
              >
                <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                  <span className="font-extrabold text-slate-800 text-xs uppercase tracking-wider">
                    Product #{idx + 1}
                  </span>
                  {items.length > 1 && (
                    <Button
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => handleRemoveItem(idx)}
                      className="text-xs font-bold"
                    >
                      Remove Item
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Product Name <span className="text-rose-500">*</span>
                    </label>
                    <Input
                      placeholder="e.g. Men's Leather Shoes"
                      value={item.productName}
                      onChange={(e) => handleItemChange(idx, 'productName', e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Category
                    </label>
                    <Select
                      value={item.category}
                      onChange={(val) => handleItemChange(idx, 'category', val)}
                      className="w-full"
                    >
                      <Option value="General Goods">General Goods</Option>
                      <Option value="Fashion & Apparel">Fashion &amp; Apparel</Option>
                      <Option value="Electronics & Gadgets">Electronics &amp; Gadgets</Option>
                      <Option value="Machinery & Industrial">Machinery &amp; Industrial</Option>
                      <Option value="Chemicals & Raw Materials">Chemicals &amp; Raw Materials</Option>
                      <Option value="Automobile Parts">Automobile Parts</Option>
                      <Option value="Other">Other</Option>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Quantity <span className="text-rose-500">*</span>
                    </label>
                    <Input
                      type="number"
                      min={1}
                      value={item.quantity}
                      onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Unit
                    </label>
                    <Select
                      value={item.unit}
                      onChange={(val) => handleItemChange(idx, 'unit', val)}
                      className="w-full"
                    >
                      <Option value="pcs">pieces (pcs)</Option>
                      <Option value="pairs">pairs</Option>
                      <Option value="cartons">cartons</Option>
                      <Option value="kg">kilograms (kg)</Option>
                      <Option value="sets">sets</Option>
                      <Option value="units">units</Option>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Purchase Value <span className="text-rose-500">*</span>
                    </label>
                    <Input
                      type="number"
                      min={0}
                      value={item.value}
                      onChange={(e) => handleItemChange(idx, 'value', e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Currency
                    </label>
                    <Select
                      value={item.currency}
                      onChange={(val) => handleItemChange(idx, 'currency', val)}
                      className="w-full"
                    >
                      <Option value="USD">USD ($)</Option>
                      <Option value="CNY">RMB / Yuan (¥)</Option>
                      <Option value="NGN">Naira (₦)</Option>
                      <Option value="EUR">EUR (€)</Option>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Estimated Weight (Kg)
                    </label>
                    <Input
                      type="number"
                      placeholder="e.g. 150"
                      value={item.weight}
                      onChange={(e) => handleItemChange(idx, 'weight', e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Estimated Volume (CBM)
                    </label>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="e.g. 0.8"
                      value={item.volume}
                      onChange={(e) => handleItemChange(idx, 'volume', e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      HS Code (Optional)
                    </label>
                    <Input
                      placeholder="e.g. 6403.99.00"
                      value={item.hsCode}
                      onChange={(e) => handleItemChange(idx, 'hsCode', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            ))}

            <Button
              type="dashed"
              block
              onClick={handleAddItem}
              icon={<PlusOutlined />}
              className="!border-slate-300 font-bold text-xs h-10 rounded-xl"
            >
              + Add Another Product Item
            </Button>

            {/* Running Summary Card */}
            <div className="bg-brand-navy text-white p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-widest text-slate-300 block mb-1">
                  GOODS SUMMARY
                </span>
                <div className="flex items-center gap-4 text-sm font-bold">
                  <span>Total Products: {totalProductsCount}</span>
                  <span>•</span>
                  <span>
                    Total Declared Value: ${estimatedGoodsValueUsd.toLocaleString()} USD
                  </span>
                </div>
              </div>
              <Tag className="bg-amber-400 text-slate-900 border-none font-extrabold text-[11px] uppercase tracking-wider px-3 py-1 rounded-full text-center">
                Estimated only — final charges may differ.
              </Tag>
            </div>

            <div className="flex justify-between pt-4">
              <Button
                size="large"
                onClick={() => setCurrentStep(0)}
                icon={<ArrowLeftOutlined />}
                className="font-bold rounded-xl"
              >
                Back: Shipment
              </Button>
              <Button
                type="primary"
                size="large"
                onClick={() => setCurrentStep(2)}
                className="!bg-brand-navy font-bold rounded-xl px-8"
              >
                Next: Documents <ArrowRightOutlined />
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* STEP 3: DOCUMENTS */}
      {currentStep === 2 && (
        <Card title="Step 3 — Shipping Documents" className="rounded-2xl border-slate-200 shadow-sm">
          <div className="space-y-6">
            <p className="text-xs text-slate-500 m-0">
              Upload available trade &amp; shipping documents for this shipment. If a document is unavailable, check <span className="font-semibold">&quot;I don&apos;t have this document&quot;</span>.
            </p>

            {/* Document Checklist Grid */}
            <div className="space-y-4">
              {[
                { type: 'commercial_invoice', title: 'Commercial Invoice', required: true, desc: 'Supplier invoice detailing product description & price' },
                { type: 'packing_list', title: 'Packing List', required: true, desc: 'Detailed breakdown of package weights, dimensions & quantity' },
                { type: 'bill_of_lading', title: shipmentType === 'air' ? 'Air Waybill (AWB)' : 'Bill of Lading (B/L)', required: true, desc: 'Official carrier shipping receipt & title document' },
                { type: 'form_m', title: 'Form M', required: false, desc: 'CBN import documentation (Optional)' },
                { type: 'paar', title: 'PAAR (Pre-Arrival Assessment Report)', required: false, desc: 'Customs PAAR document (Optional)' },
                { type: 'other', title: 'Other Supporting Documents', required: false, desc: 'Permits, certificates of origin, SONCAP, NAFDAC, etc.' },
              ].map((docDef) => {
                const uploaded = documents.find((d) => d.documentType === docDef.type);
                const isMissing = !!missingDocs[docDef.type];

                return (
                  <div
                    key={docDef.type}
                    className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-slate-800 text-sm">
                          {docDef.title}
                        </span>
                        {docDef.required && (
                          <Tag className="bg-blue-50 text-blue-700 border-blue-200 text-[10px] font-bold">
                            Common
                          </Tag>
                        )}
                        {uploaded && (
                          <Tag color="success" className="font-bold text-[10px] flex items-center gap-1">
                            <CheckCircleOutlined /> Uploaded
                          </Tag>
                        )}
                        {isMissing && (
                          <Tag color="warning" className="font-bold text-[10px]">
                            Not Available
                          </Tag>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 m-0">{docDef.desc}</p>
                      {uploaded && (
                        <p className="text-xs font-bold text-brand-navy m-0 flex items-center gap-1">
                          <FilePdfOutlined /> {uploaded.fileName}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      {!uploaded && (
                        <Checkbox
                          checked={isMissing}
                          onChange={(e) => handleToggleMissingDoc(docDef.type, e.target.checked)}
                          className="text-xs font-semibold text-slate-600"
                        >
                          I don&apos;t have this document
                        </Checkbox>
                      )}

                      {!isMissing && (
                        <Upload
                          beforeUpload={(file) => {
                            handleFileUpload(file, docDef.type);
                            return false;
                          }}
                          showUploadList={false}
                        >
                          <Button
                            icon={<UploadOutlined />}
                            loading={uploadingDocType === docDef.type}
                            className="font-bold text-xs h-9 rounded-lg"
                          >
                            {uploaded ? 'Replace' : 'Upload File'}
                          </Button>
                        </Upload>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-between pt-4">
              <Button
                size="large"
                onClick={() => setCurrentStep(1)}
                icon={<ArrowLeftOutlined />}
                className="font-bold rounded-xl"
              >
                Back: Goods Details
              </Button>
              <Button
                type="primary"
                size="large"
                onClick={() => setCurrentStep(3)}
                className="!bg-brand-navy font-bold rounded-xl px-8"
              >
                Next: Delivery Info <ArrowRightOutlined />
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* STEP 4: DELIVERY INFORMATION */}
      {currentStep === 3 && (
        <Card title="Step 4 — Delivery Preference" className="rounded-2xl border-slate-200 shadow-sm">
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                What should happen after customs clearance is completed? <span className="text-rose-500">*</span>
              </label>
              <Radio.Group
                value={deliveryPreference}
                onChange={(e) => setDeliveryPreference(e.target.value)}
                className="w-full space-y-3"
              >
                <div
                  onClick={() => setDeliveryPreference('deliver_to_me')}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    deliveryPreference === 'deliver_to_me'
                      ? 'border-brand-orange bg-orange-50/50 shadow-sm font-bold text-slate-800'
                      : 'border-slate-200 bg-white text-slate-600'
                  }`}
                >
                  <Radio value="deliver_to_me" className="font-bold text-sm">
                    🚚 Deliver to me (Doorstep dispatch across Nigeria)
                  </Radio>
                  <p className="text-xs text-slate-500 m-0 ml-6 mt-1">
                    We will dispatch your cleared cargo directly to your home or office address upon customs release.
                  </p>
                </div>

                <div
                  onClick={() => setDeliveryPreference('self_pickup')}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    deliveryPreference === 'self_pickup'
                      ? 'border-brand-orange bg-orange-50/50 shadow-sm font-bold text-slate-800'
                      : 'border-slate-200 bg-white text-slate-600'
                  }`}
                >
                  <Radio value="self_pickup" className="font-bold text-sm">
                    🏬 I&apos;ll arrange pickup/delivery myself
                  </Radio>
                  <p className="text-xs text-slate-500 m-0 ml-6 mt-1">
                    Pick up your cargo from our Kano / Lagos central distribution warehouse or send your own logistics truck.
                  </p>
                </div>
              </Radio.Group>
            </div>

            {deliveryPreference === 'deliver_to_me' && (
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider m-0">
                  Recipient &amp; Delivery Destination
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Recipient Full Name <span className="text-rose-500">*</span>
                    </label>
                    <Input
                      value={recipientName}
                      onChange={(e) => setRecipientName(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Recipient Phone Number <span className="text-rose-500">*</span>
                    </label>
                    <Input
                      value={recipientPhone}
                      onChange={(e) => setRecipientPhone(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Full Delivery Address <span className="text-rose-500">*</span>
                  </label>
                  <TextArea
                    rows={2}
                    placeholder="Street address, building, suite..."
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      City
                    </label>
                    <Input
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      State
                    </label>
                    <Input
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Special Delivery Instructions (Optional)
                  </label>
                  <Input
                    placeholder="Gate code, landmark, dispatch notes..."
                    value={deliveryInstructions}
                    onChange={(e) => setDeliveryInstructions(e.target.value)}
                  />
                </div>
              </div>
            )}

            <div className="flex justify-between pt-4">
              <Button
                size="large"
                onClick={() => setCurrentStep(2)}
                icon={<ArrowLeftOutlined />}
                className="font-bold rounded-xl"
              >
                Back: Documents
              </Button>
              <Button
                type="primary"
                size="large"
                onClick={() => setCurrentStep(4)}
                className="!bg-brand-navy font-bold rounded-xl px-8"
              >
                Next: Final Review <ArrowRightOutlined />
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* STEP 5: REVIEW & SUBMIT */}
      {currentStep === 4 && (
        <Card title="Step 5 — Review &amp; Confirm" className="rounded-2xl border-slate-200 shadow-sm">
          <div className="space-y-6">
            <p className="text-xs text-slate-500 m-0">
              Please review all information before submitting your customs clearance request.
            </p>

            {/* Shipment Summary */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-2 relative">
              <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                <span className="font-extrabold text-slate-800 text-xs uppercase tracking-wider">
                  1. Shipment Details
                </span>
                <Button
                  type="link"
                  icon={<EditOutlined />}
                  onClick={() => setCurrentStep(0)}
                  className="p-0 text-xs font-bold text-brand-orange"
                >
                  Edit
                </Button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
                <div>
                  <span className="text-slate-400 block">Type</span>
                  <span className="font-bold text-slate-800 capitalize">{shipmentType}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Origin</span>
                  <span className="font-bold text-slate-800">{originCountry}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Port of Entry</span>
                  <span className="font-bold text-slate-800">{portOfEntry === 'Other' ? customPort : portOfEntry}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Status</span>
                  <span className="font-bold text-slate-800 capitalize">{shipmentStatus.replace('_', ' ')}</span>
                </div>
              </div>

              {noShippingInfoProvided ? (
                <p className="text-[11px] text-amber-700 font-semibold m-0 pt-1">
                  Shipping info: Not available yet
                </p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs pt-2 border-t border-slate-200/60">
                  {billOfLadingNumber && (
                    <div>
                      <span className="text-slate-400 block">B/L Number</span>
                      <span className="font-bold text-slate-800">{billOfLadingNumber}</span>
                    </div>
                  )}
                  {airWaybillNumber && (
                    <div>
                      <span className="text-slate-400 block">AWB Number</span>
                      <span className="font-bold text-slate-800">{airWaybillNumber}</span>
                    </div>
                  )}
                  {containerNumber && (
                    <div>
                      <span className="text-slate-400 block">Container No.</span>
                      <span className="font-bold text-slate-800">{containerNumber}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Goods Summary */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-2 relative">
              <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                <span className="font-extrabold text-slate-800 text-xs uppercase tracking-wider">
                  2. Goods Details ({totalProductsCount} Item{totalProductsCount > 1 ? 's' : ''})
                </span>
                <Button
                  type="link"
                  icon={<EditOutlined />}
                  onClick={() => setCurrentStep(1)}
                  className="p-0 text-xs font-bold text-brand-orange"
                >
                  Edit
                </Button>
              </div>

              <div className="space-y-2 pt-1">
                {items.map((it, i) => (
                  <div key={i} className="flex justify-between text-xs py-1 border-b border-slate-200/40 last:border-none">
                    <div>
                      <span className="font-bold text-slate-800">{it.productName || 'Product'}</span>
                      <span className="text-slate-400 ml-2">({it.quantity} {it.unit})</span>
                    </div>
                    <span className="font-bold text-brand-navy">${Number(it.value || 0).toLocaleString()} {it.currency}</span>
                  </div>
                ))}
              </div>

              <div className="pt-2 text-xs font-extrabold text-slate-800 flex justify-between border-t border-slate-200">
                <span>Total Declared Goods Value</span>
                <span>${estimatedGoodsValueUsd.toLocaleString()} USD</span>
              </div>
            </div>

            {/* Documents Summary */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-2 relative">
              <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                <span className="font-extrabold text-slate-800 text-xs uppercase tracking-wider">
                  3. Uploaded Documents
                </span>
                <Button
                  type="link"
                  icon={<EditOutlined />}
                  onClick={() => setCurrentStep(2)}
                  className="p-0 text-xs font-bold text-brand-orange"
                >
                  Edit
                </Button>
              </div>

              {documents.length > 0 ? (
                <div className="space-y-1 pt-1">
                  {documents.map((d, idx) => (
                    <div key={idx} className="text-xs flex items-center justify-between">
                      <span className="font-semibold text-slate-700 capitalize">{d.documentType.replace('_', ' ')}</span>
                      <span className="text-slate-500 font-bold">{d.fileName}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-amber-700 font-semibold m-0">No documents attached yet.</p>
              )}
            </div>

            {/* Delivery Summary */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-2 relative">
              <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                <span className="font-extrabold text-slate-800 text-xs uppercase tracking-wider">
                  4. Delivery Preference
                </span>
                <Button
                  type="link"
                  icon={<EditOutlined />}
                  onClick={() => setCurrentStep(3)}
                  className="p-0 text-xs font-bold text-brand-orange"
                >
                  Edit
                </Button>
              </div>

              <p className="text-xs font-bold text-slate-800 m-0">
                {deliveryPreference === 'deliver_to_me'
                  ? '🚚 Doorstep Delivery'
                  : '🏬 Self-Pickup from Warehouse'}
              </p>
              {deliveryPreference === 'deliver_to_me' && (
                <p className="text-xs text-slate-600 m-0">
                  Address: {deliveryAddress}, {city}, {state} ({recipientName} • {recipientPhone})
                </p>
              )}
            </div>

            {/* Accuracy Confirmation Checkbox */}
            <div className="bg-blue-50/70 p-4 rounded-xl border border-blue-200">
              <Checkbox
                checked={isConfirmedAccurate}
                onChange={(e) => setIsConfirmedAccurate(e.target.checked)}
                className="text-xs font-bold text-slate-800"
              >
                I confirm that the information I have provided is accurate to the best of my knowledge.
              </Checkbox>
            </div>

            {/* Final Submission Buttons */}
            <div className="flex justify-between pt-4">
              <Button
                size="large"
                onClick={() => setCurrentStep(3)}
                icon={<ArrowLeftOutlined />}
                className="font-bold rounded-xl"
              >
                Back: Delivery
              </Button>
              <Button
                type="primary"
                size="large"
                onClick={handleSubmitRequest}
                loading={submitting}
                icon={<CheckCircleOutlined />}
                className="!bg-brand-orange hover:!bg-brand-orange/90 font-extrabold rounded-xl px-10 h-12 shadow-lg"
              >
                Submit Clearance Request
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default NewClearanceRequestForm;
