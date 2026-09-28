import React, { useEffect, useState } from 'react';
import { Button, Input, Card, Form, Select, message, Spin, Tag, InputNumber } from 'antd';
import {
  ArrowLeftOutlined,
  EnvironmentOutlined,
  FlagOutlined,
  InboxOutlined,
  CarOutlined,
  CheckCircleOutlined,
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  CompassOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { submitDelivery, fetchVehicles } from '../../../store/slices/deliverySlice';
import { fetchPackages, fetchConsolidations } from '../../../store/slices/shipmentSlice';
import type { DeliveryVehicle } from '../../../types/delivery.types';
import { LeafletCoordinatePicker } from '../../../components/delivery/LeafletCoordinatePicker';

// Preset Coordinates for Popular Locations/Hubs in Nigeria
const PRESET_HUB_COORDINATES = [
  { label: 'HamzaRMB Ikeja Hub, Lagos', address: 'HamzaRMB Distribution Hub, Ikeja, Lagos', city: 'Lagos', lat: 6.5965, lng: 3.3421 },
  { label: 'Lekki Phase 1, Lagos', address: 'Admiralty Way, Lekki Phase 1, Lagos', city: 'Lagos', lat: 6.4474, lng: 3.4723 },
  { label: 'Victoria Island, Lagos', address: 'Ahmadu Bello Way, VI, Lagos', city: 'Lagos', lat: 6.4281, lng: 3.4219 },
  { label: 'Ikeja City Mall, Alausa', address: 'Obafemi Awolowo Way, Ikeja, Lagos', city: 'Lagos', lat: 6.6190, lng: 3.3582 },
  { label: 'Kano Central Warehouse', address: 'Baban Gwari Road, Kano', city: 'Kano', lat: 12.0022, lng: 8.5920 },
  { label: 'Abuja Central Business District', address: 'Herbert Macaulay Way, CBD, Abuja', city: 'Abuja', lat: 9.0579, lng: 7.4951 },
  { label: 'Port Harcourt Hub', address: 'Aba Road, Port Harcourt', city: 'Port Harcourt', lat: 4.8156, lng: 7.0498 },
];

function calculateHaversineDistance(lat1?: number, lon1?: number, lat2?: number, lon2?: number): number | null {
  if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) return null;
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const dist = R * c;
  return Math.max(1, Math.round(dist * 10) / 10);
}

export const LocalDeliveryForm: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [form] = Form.useForm();
  const { user } = useAppSelector((state) => state.auth);
  const { packages, consolidations } = useAppSelector((state) => state.shipments);
  const { vehicles } = useAppSelector((state) => state.delivery);

  const [selectedVehicle, setSelectedVehicle] = useState<DeliveryVehicle | null>(null);
  const [distanceKm, setDistanceKm] = useState<number>(15);
  const [submitting, setSubmitting] = useState(false);

  // Coordinate states
  const [pickupLat, setPickupLat] = useState<number | undefined>(6.5965);
  const [pickupLng, setPickupLng] = useState<number | undefined>(3.3421);
  const [dropoffLat, setDropoffLat] = useState<number | undefined>(6.4474);
  const [dropoffLng, setDropoffLng] = useState<number | undefined>(3.4723);

  useEffect(() => {
    dispatch(fetchPackages());
    dispatch(fetchConsolidations());
    dispatch(fetchVehicles());
  }, [dispatch]);

  useEffect(() => {
    if (user) {
      form.setFieldsValue({
        customerEmail: user.email,
        customerPhone: user.phone || '+2348000000000',
        pickupAddress: 'HamzaRMB Distribution Hub, Ikeja, Lagos',
        pickupCity: 'Lagos',
        pickupContactName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Warehouse Admin',
        pickupPhone: user.phone || '+2348090219021',
        pickupEmail: user.email || 'hub@logistics.com',
        pickupLat: 6.5965,
        pickupLng: 3.3421,
        dropoffLat: 6.4474,
        dropoffLng: 3.4723,
      });
    }
  }, [user, form]);

  useEffect(() => {
    if (vehicles.length > 0 && !selectedVehicle) {
      setSelectedVehicle(vehicles[0]);
    }
  }, [vehicles, selectedVehicle]);

  // Recalculate distance when coordinates change
  const handleCoordinatesChange = (pLat?: number, pLng?: number, dLat?: number, dLng?: number) => {
    const calc = calculateHaversineDistance(pLat, pLng, dLat, dLng);
    if (calc !== null) {
      setDistanceKm(calc);
      form.setFieldsValue({ distanceKm: calc });
    }
  };

  // Map Picker callbacks
  const handleMapChangePickup = (lat: number, lng: number, address?: string, city?: string) => {
    setPickupLat(lat);
    setPickupLng(lng);
    const updates: any = { pickupLat: lat, pickupLng: lng };
    if (address) updates.pickupAddress = address;
    if (city) updates.pickupCity = city;
    form.setFieldsValue(updates);
    handleCoordinatesChange(lat, lng, dropoffLat, dropoffLng);
  };

  const handleMapChangeDropoff = (lat: number, lng: number, address?: string, city?: string) => {
    setDropoffLat(lat);
    setDropoffLng(lng);
    const updates: any = { dropoffLat: lat, dropoffLng: lng };
    if (address) updates.dropoffAddress = address;
    if (city) updates.dropoffCity = city;
    form.setFieldsValue(updates);
    handleCoordinatesChange(pickupLat, pickupLng, lat, lng);
  };

  const arrivedItems = [
    ...packages.filter(p => ['arrived_destination', 'received_at_wh', 'cleared_customs', 'arrived_lagos', 'ready_for_dispatch'].includes(p.status)).map(p => ({
      label: `Package: ${p.trackingId} - ${p.description || 'Imported Goods'} (${p.weightKg || 1}kg)`,
      value: `pkg_${p.id}`,
      description: `Package ${p.trackingId}: ${p.description || 'Imported Goods'}`,
    })),
    ...consolidations.filter(c => ['arrived_destination', 'received_at_wh', 'cleared_customs', 'arrived_lagos', 'ready_for_dispatch'].includes(c.status)).map(c => ({
      label: `Consolidation: ${c.consolidationId} - ${c.packageIds.length} Packages (${c.totalWeightKg || 1}kg)`,
      value: `con_${c.id}`,
      description: `Consolidation ${c.consolidationId}: ${c.packageIds.length} Packages (${c.totalWeightKg || 1}kg)`,
    })),
  ];

  const baseFare = selectedVehicle?.baseFare || 1000;
  const perKmRate = selectedVehicle?.perKmRate || 150;
  const distanceFee = distanceKm * perKmRate;
  const currentPrice = baseFare + distanceFee;

  const handleSubmit = async (values: any) => {
    if (!selectedVehicle) {
      message.error('Please select a dispatch vehicle.');
      return;
    }
    try {
      setSubmitting(true);
      await dispatch(
        submitDelivery({
          customerEmail: values.customerEmail || user?.email,
          customerPhone: values.customerPhone || user?.phone,
          pickupAddress: values.pickupAddress || 'HamzaRMB Distribution Hub, Ikeja, Lagos',
          pickupCity: values.pickupCity || 'Lagos',
          pickupPhone: values.pickupPhone || user?.phone || '+2348090219021',
          pickupContactName: values.pickupContactName || (user ? `${user.firstName} ${user.lastName}` : 'Warehouse Admin'),
          pickupEmail: values.pickupEmail || user?.email,
          pickupLat: values.pickupLat != null ? Number(values.pickupLat) : pickupLat,
          pickupLng: values.pickupLng != null ? Number(values.pickupLng) : pickupLng,
          dropoffAddress: values.dropoffAddress,
          dropoffCity: values.dropoffCity || 'Lagos',
          dropoffPhone: values.dropoffPhone,
          dropoffContactName: values.dropoffContactName,
          dropoffEmail: values.dropoffEmail,
          dropoffLat: values.dropoffLat != null ? Number(values.dropoffLat) : dropoffLat,
          dropoffLng: values.dropoffLng != null ? Number(values.dropoffLng) : dropoffLng,
          packageDescription: values.packageDescription,
          vehicleId: selectedVehicle.id,
          vehicleType: selectedVehicle.name,
          distanceKm,
          paymentMethod: values.paymentMethod === 'cash_on_delivery' ? 'cash_on_delivery' : 'wallet',
        })
      ).unwrap();

      message.success('Local Delivery request dispatched successfully!');
      navigate('/customer/delivery');
    } catch (err: any) {
      const msg = typeof err === 'string' ? err : err?.message || 'Failed to submit delivery request. Please check fields.';
      message.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="animate-fade-in-up max-w-[1200px] mx-auto pb-20">
      
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button 
          type="text" 
          icon={<ArrowLeftOutlined />} 
          className="bg-slate-100 hover:bg-slate-200 w-10 h-10 rounded-full flex items-center justify-center shrink-0"
          onClick={() => navigate('/customer/delivery')}
        />
        <div>
          <h1 className="text-3xl font-extrabold text-[#0A1128] m-0 mb-1 tracking-tight">New Doorstep Delivery Request</h1>
          <p className="text-slate-500 text-sm m-0">Dynamic doorstep dispatch calculated transparently per kilometer (KM) with interactive Leaflet GPS Map.</p>
        </div>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        requiredMark={false}
        initialValues={{
          dropoffCity: 'Lagos',
          pickupCity: 'Lagos',
          paymentMethod: 'wallet',
          distanceKm: 15,
          pickupLat: 6.5965,
          pickupLng: 3.3421,
          dropoffLat: 6.4474,
          dropoffLng: 3.4723,
        }}
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column - Forms */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Customer Information Card */}
            <Card bordered={false} className="shadow-sm border border-slate-100 rounded-xl" bodyStyle={{ padding: '24px' }}>
              <h2 className="text-xl font-bold text-[#0A1128] mb-6 flex items-center gap-2">
                <UserOutlined className="text-brand-orange" /> Customer Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Form.Item
                  name="customerEmail"
                  label={<span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">CUSTOMER EMAIL</span>}
                  rules={[{ type: 'email', message: 'Please enter a valid email address' }]}
                >
                  <Input
                    size="large"
                    prefix={<MailOutlined className="text-slate-400 mr-2" />}
                    placeholder="customer@example.com"
                    className="bg-slate-50 border-slate-200 rounded-xl"
                  />
                </Form.Item>
                <Form.Item
                  name="customerPhone"
                  label={<span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">CUSTOMER PHONE NUMBER</span>}
                >
                  <Input
                    size="large"
                    prefix={<PhoneOutlined className="text-slate-400 mr-2" />}
                    placeholder="+234 800 000 0000"
                    className="bg-slate-50 border-slate-200 rounded-xl"
                  />
                </Form.Item>
              </div>
            </Card>

            {/* Interactive Leaflet Map Picker Component */}
            <div>
              <LeafletCoordinatePicker
                pickupLat={pickupLat}
                pickupLng={pickupLng}
                dropoffLat={dropoffLat}
                dropoffLng={dropoffLng}
                onChangePickup={handleMapChangePickup}
                onChangeDropoff={handleMapChangeDropoff}
                distanceKm={distanceKm}
              />
            </div>

            {/* Pickup Location & Coordinates Card */}
            <Card bordered={false} className="shadow-sm border border-slate-100 rounded-xl" bodyStyle={{ padding: '24px' }}>
              <h2 className="text-xl font-bold text-[#0A1128] mb-4 flex items-center gap-2">
                <EnvironmentOutlined className="text-brand-orange" /> Pickup Location Details & GPS
              </h2>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <Form.Item
                      name="pickupAddress"
                      label={<span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">PICKUP STREET ADDRESS <span className="text-red-500">*</span></span>}
                      rules={[{ required: true, message: 'Please enter pickup address' }]}
                    >
                      <Input 
                        size="large" 
                        prefix={<EnvironmentOutlined className="text-slate-500 mr-2" />} 
                        placeholder="e.g. HamzaRMB Distribution Hub, Ikeja, Lagos"
                        className="bg-white border-slate-200 py-3 rounded-xl font-medium" 
                      />
                    </Form.Item>
                  </div>
                  <div className="md:col-span-1">
                    <Form.Item
                      name="pickupCity"
                      label={<span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">PICKUP CITY</span>}
                    >
                      <Input
                        size="large"
                        placeholder="e.g. Lagos"
                        className="bg-white border-slate-200 py-3 rounded-xl font-medium"
                      />
                    </Form.Item>
                  </div>
                </div>

                {/* Pickup Contacts */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Form.Item
                    name="pickupContactName"
                    label={<span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">PICKUP CONTACT NAME</span>}
                  >
                    <Input size="large" placeholder="Warehouse Admin" className="bg-slate-50 border-slate-200 rounded-xl" />
                  </Form.Item>
                  <Form.Item
                    name="pickupPhone"
                    label={<span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">PICKUP PHONE</span>}
                  >
                    <Input size="large" placeholder="+234 809 000 0000" className="bg-slate-50 border-slate-200 rounded-xl" />
                  </Form.Item>
                  <Form.Item
                    name="pickupEmail"
                    label={<span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">PICKUP EMAIL</span>}
                  >
                    <Input size="large" placeholder="pickup@logistics.com" className="bg-slate-50 border-slate-200 rounded-xl" />
                  </Form.Item>
                </div>

                {/* Pickup Coordinates Numeric Inputs */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs font-bold text-[#0A1128] uppercase tracking-wider flex items-center gap-2">
                      <CompassOutlined className="text-brand-orange" /> Pickup GPS Coordinates (Latitude & Longitude)
                    </span>
                    <Select
                      size="small"
                      placeholder="Quick Hub Selector"
                      className="w-56"
                      onChange={(idx) => {
                        const hub = PRESET_HUB_COORDINATES[idx];
                        if (hub) {
                          form.setFieldsValue({
                            pickupAddress: hub.address,
                            pickupCity: hub.city,
                            pickupLat: hub.lat,
                            pickupLng: hub.lng,
                          });
                          setPickupLat(hub.lat);
                          setPickupLng(hub.lng);
                          handleCoordinatesChange(hub.lat, hub.lng, dropoffLat, dropoffLng);
                        }
                      }}
                      options={PRESET_HUB_COORDINATES.map((hub, i) => ({ label: hub.label, value: i }))}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Form.Item
                      name="pickupLat"
                      className="mb-0"
                      label={<span className="text-[10px] font-bold text-slate-500 uppercase">LATITUDE (°N)</span>}
                    >
                      <InputNumber
                        step={0.0001}
                        className="w-full rounded-xl"
                        placeholder="6.5965"
                        onChange={(val) => {
                          const n = val != null ? Number(val) : undefined;
                          setPickupLat(n);
                          handleCoordinatesChange(n, pickupLng, dropoffLat, dropoffLng);
                        }}
                      />
                    </Form.Item>
                    <Form.Item
                      name="pickupLng"
                      className="mb-0"
                      label={<span className="text-[10px] font-bold text-slate-500 uppercase">LONGITUDE (°E)</span>}
                    >
                      <InputNumber
                        step={0.0001}
                        className="w-full rounded-xl"
                        placeholder="3.3421"
                        onChange={(val) => {
                          const n = val != null ? Number(val) : undefined;
                          setPickupLng(n);
                          handleCoordinatesChange(pickupLat, n, dropoffLat, dropoffLng);
                        }}
                      />
                    </Form.Item>
                  </div>
                </div>
              </div>
            </Card>

            {/* Destination (Dropoff) Location & Coordinates Card */}
            <Card bordered={false} className="shadow-sm border border-slate-100 rounded-xl" bodyStyle={{ padding: '24px' }}>
              <h2 className="text-xl font-bold text-[#0A1128] mb-4 flex items-center gap-2">
                <FlagOutlined className="text-brand-orange" /> Destination Location Details & GPS
              </h2>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <Form.Item 
                      name="dropoffAddress" 
                      label={<span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">DESTINATION STREET ADDRESS <span className="text-red-500">*</span></span>}
                      rules={[{ required: true, message: 'Please enter delivery destination address' }]}
                    >
                      <Input 
                        size="large" 
                        prefix={<FlagOutlined className="text-brand-orange mr-2" />} 
                        placeholder="e.g. 42 Admiralty Way, Lekki Phase 1, Lagos" 
                        className="bg-white border-slate-200 py-3 rounded-xl font-medium" 
                      />
                    </Form.Item>
                  </div>

                  <div className="md:col-span-1">
                    <Form.Item 
                      name="dropoffCity" 
                      label={<span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">DESTINATION CITY/STATE</span>}
                    >
                      <Input
                        size="large"
                        placeholder="e.g. Lagos, Kano, Abuja"
                        className="bg-white border-slate-200 py-3 rounded-xl font-medium"
                      />
                    </Form.Item>
                  </div>
                </div>

                {/* Recipient Contacts */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Form.Item 
                    name="dropoffContactName" 
                    label={<span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">RECIPIENT NAME <span className="text-red-500">*</span></span>}
                    rules={[{ required: true, message: 'Please enter recipient name' }]}
                  >
                    <Input size="large" placeholder="Recipient Contact Name" className="bg-slate-50 border-slate-200 py-3 rounded-xl" />
                  </Form.Item>
                  <Form.Item 
                    name="dropoffPhone" 
                    label={<span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">RECIPIENT PHONE <span className="text-red-500">*</span></span>}
                    rules={[{ required: true, message: 'Please enter recipient phone number' }]}
                  >
                    <Input size="large" placeholder="+234 800 000 0000" className="bg-slate-50 border-slate-200 py-3 rounded-xl" />
                  </Form.Item>
                  <Form.Item 
                    name="dropoffEmail" 
                    label={<span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">RECIPIENT EMAIL (OPTIONAL)</span>}
                  >
                    <Input size="large" placeholder="recipient@example.com" className="bg-slate-50 border-slate-200 py-3 rounded-xl" />
                  </Form.Item>
                </div>

                {/* Destination Coordinates Numeric Inputs */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs font-bold text-[#0A1128] uppercase tracking-wider flex items-center gap-2">
                      <CompassOutlined className="text-brand-orange" /> Dropoff GPS Coordinates (Latitude & Longitude)
                    </span>
                    <Select
                      size="small"
                      placeholder="Quick Preset Selector"
                      className="w-56"
                      onChange={(idx) => {
                        const hub = PRESET_HUB_COORDINATES[idx];
                        if (hub) {
                          form.setFieldsValue({
                            dropoffAddress: hub.address,
                            dropoffCity: hub.city,
                            dropoffLat: hub.lat,
                            dropoffLng: hub.lng,
                          });
                          setDropoffLat(hub.lat);
                          setDropoffLng(hub.lng);
                          handleCoordinatesChange(pickupLat, pickupLng, hub.lat, hub.lng);
                        }
                      }}
                      options={PRESET_HUB_COORDINATES.map((hub, i) => ({ label: hub.label, value: i }))}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Form.Item
                      name="dropoffLat"
                      className="mb-0"
                      label={<span className="text-[10px] font-bold text-slate-500 uppercase">LATITUDE (°N)</span>}
                    >
                      <InputNumber
                        step={0.0001}
                        className="w-full rounded-xl"
                        placeholder="6.4474"
                        onChange={(val) => {
                          const n = val != null ? Number(val) : undefined;
                          setDropoffLat(n);
                          handleCoordinatesChange(pickupLat, pickupLng, n, dropoffLng);
                        }}
                      />
                    </Form.Item>
                    <Form.Item
                      name="dropoffLng"
                      className="mb-0"
                      label={<span className="text-[10px] font-bold text-slate-500 uppercase">LONGITUDE (°E)</span>}
                    >
                      <InputNumber
                        step={0.0001}
                        className="w-full rounded-xl"
                        placeholder="3.4723"
                        onChange={(val) => {
                          const n = val != null ? Number(val) : undefined;
                          setDropoffLng(n);
                          handleCoordinatesChange(pickupLat, pickupLng, dropoffLat, n);
                        }}
                      />
                    </Form.Item>
                  </div>
                </div>

                {/* Distance Selector */}
                <div className="p-4 bg-amber-500/5 rounded-xl border border-brand-orange/20">
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-bold text-[#0A1128] uppercase tracking-wider">
                      ESTIMATED DISTANCE IN KILOMETERS (KM)
                    </label>
                    <Tag color="orange" className="font-bold text-xs border-none">
                      {distanceKm} KM
                    </Tag>
                  </div>

                  <div className="flex gap-2 flex-wrap mb-3">
                    {[5, 10, 15, 25, 50, 100, 200].map((km) => (
                      <Button
                        key={km}
                        size="small"
                        type={distanceKm === km ? 'primary' : 'default'}
                        className={distanceKm === km ? 'bg-brand-orange border-none font-bold' : 'font-medium'}
                        onClick={() => {
                          setDistanceKm(km);
                          form.setFieldsValue({ distanceKm: km });
                        }}
                      >
                        {km} KM
                      </Button>
                    ))}
                  </div>

                  <Form.Item name="distanceKm" className="mb-0">
                    <Input
                      type="number"
                      size="large"
                      suffix="KM"
                      min={1}
                      value={distanceKm}
                      onChange={(e) => {
                        const val = Math.max(1, Number(e.target.value) || 1);
                        setDistanceKm(val);
                        form.setFieldsValue({ distanceKm: val });
                      }}
                      className="bg-white border-slate-200 font-bold rounded-xl"
                    />
                  </Form.Item>
                </div>

              </div>
            </Card>

            {/* Select Vehicle */}
            <Card bordered={false} className="shadow-sm border border-slate-100 rounded-xl" bodyStyle={{ padding: '24px' }}>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-[#0A1128] m-0 flex items-center gap-2">
                  <CarOutlined className="text-brand-orange" /> Select Dispatch Vehicle
                </h2>
                <span className="text-xs text-slate-500">Calculated for <strong>{distanceKm} KM</strong></span>
              </div>

              {vehicles.length === 0 ? (
                <div className="text-center py-8">
                  <Spin tip="Loading vehicles..." />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {vehicles.map((v) => {
                    const vehicleBase = v.baseFare || 1000;
                    const vehicleKmRate = v.perKmRate || 150;
                    const price = vehicleBase + (distanceKm * vehicleKmRate);
                    const isSelected = selectedVehicle?.id === v.id;
                    return (
                      <div
                        key={v.id}
                        onClick={() => setSelectedVehicle(v)}
                        className={`border-2 rounded-2xl p-4 cursor-pointer transition-all flex flex-col justify-between relative overflow-hidden ${
                          isSelected
                            ? 'border-brand-orange bg-amber-500/5 shadow-md ring-2 ring-brand-orange/20'
                            : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                      >
                        {v.imageUrl && (
                          <div className="h-28 w-full rounded-xl overflow-hidden mb-3 bg-slate-100 relative">
                            <img src={v.imageUrl} alt={v.name} className="w-full h-full object-cover" />
                            {isSelected && (
                              <div className="absolute top-2 right-2 bg-brand-orange text-white p-1 rounded-full text-xs shadow">
                                <CheckCircleOutlined />
                              </div>
                            )}
                          </div>
                        )}

                        <div>
                          <div className="flex justify-between items-start mb-1">
                            <h3 className="font-extrabold text-[#0A1128] m-0 text-base">{v.name}</h3>
                            <Tag color="orange" className="font-bold border-none text-[10px]">
                              MAX {v.maxWeightKg || 50}KG
                            </Tag>
                          </div>
                          <p className="text-xs text-slate-500 m-0 mb-2 line-clamp-2">{v.description}</p>
                          <p className="text-[11px] font-medium text-slate-400 mb-3">
                            Base: ₦{vehicleBase.toLocaleString()} + ₦{vehicleKmRate}/km
                          </p>
                        </div>

                        <div className="flex justify-between items-center pt-3 border-t border-slate-100 mt-auto">
                          <span className="text-[10px] text-slate-400 font-bold uppercase">Fare ({distanceKm} km)</span>
                          <span className="text-lg font-black text-brand-orange">₦{price.toLocaleString()}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>

            {/* Package Details */}
            <Card bordered={false} className="shadow-sm border border-slate-100 rounded-xl" bodyStyle={{ padding: '24px' }}>
              <h2 className="text-xl font-bold text-[#0A1128] mb-6 flex items-center gap-2">
                <InboxOutlined className="text-brand-orange" /> Delivery Items Description
              </h2>
              
              {arrivedItems.length > 0 && (
                <Form.Item 
                  name="arrivedItem" 
                  label={<span className="text-[10px] font-bold text-brand-orange uppercase tracking-wider">SELECT ARRIVED SHIPMENT (PRE-FILL DETAILS)</span>}
                >
                  <Select 
                    size="large"
                    placeholder="Select package or consolidation arrived at warehouse..."
                    options={arrivedItems}
                    onChange={(val) => {
                      const item = arrivedItems.find(i => i.value === val);
                      if (item) {
                        form.setFieldsValue({ packageDescription: item.description });
                      }
                    }}
                  />
                </Form.Item>
              )}

              <Form.Item 
                name="packageDescription" 
                label={<span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">CONTENTS DESCRIPTION <span className="text-red-500">*</span></span>}
                rules={[{ required: true, message: 'Please describe package contents' }]}
              >
                <Input size="large" placeholder="e.g. Electronics, Clothing batch, Industrial spare parts" className="bg-slate-50 border-slate-200 py-3 rounded-xl" />
              </Form.Item>
            </Card>

          </div>

          {/* Right Column - Summary */}
          <div className="lg:col-span-1">
            <Card bordered={false} className="shadow-lg border-t-4 border-[#0A1128] rounded-2xl sticky top-24" bodyStyle={{ padding: '0' }}>
              <div className="p-6 border-b border-slate-100">
                <h2 className="text-xl font-bold text-[#0A1128] m-0">Per-KM Fare Breakdown</h2>
              </div>
              
              <div className="p-6 space-y-4 text-sm">
                <div className="flex justify-between items-center text-slate-600">
                  <span>Selected Vehicle</span>
                  <span className="font-bold text-[#0A1128]">{selectedVehicle?.name || 'Standard Vehicle'}</span>
                </div>
                <div className="flex justify-between items-center text-slate-600">
                  <span>Distance</span>
                  <span className="font-bold text-brand-orange">{distanceKm} KM</span>
                </div>
                <div className="flex justify-between items-center text-slate-600">
                  <span>Base Pickup Fare</span>
                  <span className="font-mono font-bold">₦{baseFare.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-slate-600">
                  <span>Distance Fee ({distanceKm} km × ₦{perKmRate}/km)</span>
                  <span className="font-mono font-bold text-brand-orange">₦{distanceFee.toLocaleString()}</span>
                </div>

                {/* Coordinate Badges in Summary */}
                {pickupLat != null && pickupLng != null && (
                  <div className="text-[11px] text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-200 flex justify-between">
                    <span>Pickup GPS:</span>
                    <span className="font-mono font-bold">{pickupLat.toFixed(4)}, {pickupLng.toFixed(4)}</span>
                  </div>
                )}
                {dropoffLat != null && dropoffLng != null && (
                  <div className="text-[11px] text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-200 flex justify-between">
                    <span>Dropoff GPS:</span>
                    <span className="font-mono font-bold">{dropoffLat.toFixed(4)}, {dropoffLng.toFixed(4)}</span>
                  </div>
                )}
                
                <div className="pt-3 border-t border-slate-100">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Payment Method</span>
                  <Form.Item name="paymentMethod" initialValue="wallet" className="mb-0">
                    <Select size="middle" className="w-full">
                      <Select.Option value="wallet">💳 Wallet Balance Deduction</Select.Option>
                      <Select.Option value="cash_on_delivery">💵 Pay on Delivery (Cash / POS)</Select.Option>
                    </Select>
                  </Form.Item>
                </div>
              </div>

              <div className="p-6 bg-slate-50 border-t border-slate-100 rounded-b-2xl">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">TOTAL FARE</span>
                  <span className="text-3xl font-black text-[#0A1128]">
                    ₦{currentPrice.toLocaleString()}
                  </span>
                </div>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  loading={submitting} 
                  size="large" 
                  block 
                  className="bg-brand-orange hover:bg-[#E86E21] border-none font-bold shadow-md h-12 text-base rounded-xl"
                >
                  CONFIRM DISPATCH REQUEST →
                </Button>
              </div>
            </Card>
          </div>
          
        </div>
      </Form>
    </div>
  );
};
