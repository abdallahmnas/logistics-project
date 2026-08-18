import React, { useEffect, useState, useMemo } from 'react';
import { Card, Input, Select, Button, Progress, Modal, Form, Popconfirm, Tag, message, Spin } from 'antd';
import {
  SearchOutlined,
  PlusOutlined,
  EnvironmentOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  PhoneOutlined,
  MailOutlined,
  UserOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { fetchAllPackages } from '../../../store/slices/adminSlice';
import { fetchFacilities, updateFacility, deleteFacility } from '../../../store/slices/facilitySlice';
import type { Facility } from '../../../store/slices/facilitySlice';

const { Option } = Select;

export const WarehouseFacilitiesPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { allPackages } = useAppSelector((state) => state.admin);
  const { facilities, loading } = useAppSelector((state) => state.facilities);

  const [searchText, setSearchText] = useState('');
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null);
  const [editingFacility, setEditingFacility] = useState<Facility | null>(null);
  const [form] = Form.useForm();
  const [savingEdit, setSavingEdit] = useState(false);

  useEffect(() => {
    dispatch(fetchAllPackages());
    dispatch(fetchFacilities());
  }, [dispatch]);

  const cnPackagesCount = useMemo(() => allPackages.filter((p) => p.status === 'received_cn').length, [allPackages]);
  const ngPackagesCount = useMemo(() => allPackages.filter((p) => p.status === 'arrived_ng' || p.status === 'ready_for_pickup').length, [allPackages]);

  const filteredFacilities = useMemo(() => {
    if (!searchText) return facilities;
    const q = searchText.toLowerCase();
    return facilities.filter(
      (f) =>
        f.name.toLowerCase().includes(q) ||
        f.code.toLowerCase().includes(q) ||
        f.location.toLowerCase().includes(q) ||
        f.country.toLowerCase().includes(q)
    );
  }, [facilities, searchText]);

  const handleOpenEditModal = (facility: Facility, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingFacility(facility);
    form.setFieldsValue({
      code: facility.code,
      name: facility.name,
      location: facility.location,
      country: facility.country,
      type: facility.type,
      status: facility.status,
      maxVolume: facility.maxVolume,
      currentVolume: facility.currentVolume,
      contactName: facility.contactName,
      contactPhone: facility.contactPhone,
      contactEmail: facility.contactEmail,
      address: facility.address,
    });
  };

  const handleSaveEdit = async () => {
    if (!editingFacility) return;
    try {
      const values = await form.validateFields();
      setSavingEdit(true);
      await dispatch(
        updateFacility({
          id: editingFacility.id,
          payload: values,
        })
      ).unwrap();
      message.success(`Facility ${values.code} updated successfully`);
      setEditingFacility(null);
    } catch (error: any) {
      if (error?.errorFields) return;
      message.error(error?.message || 'Failed to update facility');
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDeleteFacility = async (id: string, code: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      await dispatch(deleteFacility(id)).unwrap();
      message.success(`Facility ${code} deleted successfully`);
    } catch (error: any) {
      message.error(error?.message || 'Failed to delete facility');
    }
  };

  return (
    <div className="animate-fade-in-up max-w-[1400px] mx-auto pb-20 mt-4 px-4">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0A1128] m-0">Warehouse Facilities Network</h1>
          <p className="text-slate-500 mt-1 mb-0 text-sm">
            Monitor overseas intake hubs, customs clearing facilities, and regional distribution centers
          </p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Input
            prefix={<SearchOutlined className="text-slate-400" />}
            placeholder="Search facility name, code or city..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="w-full sm:w-64 bg-white border-slate-200 rounded-lg shadow-sm"
          />
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate('/admin/warehouse/facilities/new')}
            className="!bg-brand-navy hover:!bg-slate-800 !text-white font-semibold rounded-lg shadow-sm border-none flex items-center gap-2 whitespace-nowrap"
          >
            Add Facility
          </Button>
        </div>
      </div>

      {/* Top Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card bordered={false} className="shadow-sm rounded-xl bg-slate-50 border border-slate-100">
          <div className="text-slate-500 font-bold text-xs tracking-wider uppercase mb-2">Active Facilities</div>
          <div className="text-4xl font-extrabold text-[#0A1128]">{facilities.length}</div>
          <div className="text-brand-orange text-sm font-medium mt-2 flex items-center gap-1">China & Nigeria Hubs</div>
        </Card>

        <Card bordered={false} className="shadow-sm rounded-xl bg-slate-50 border border-slate-100">
          <div className="text-slate-500 font-bold text-xs tracking-wider uppercase mb-2">China Inbound Volume</div>
          <div className="text-4xl font-extrabold text-[#0A1128]">{cnPackagesCount}</div>
          <div className="text-slate-500 text-sm font-medium mt-2">Received in Guangzhou</div>
        </Card>

        <Card bordered={false} className="shadow-sm rounded-xl bg-slate-50 border border-slate-100">
          <div className="text-slate-500 font-bold text-xs tracking-wider uppercase mb-2">Nigeria Hub Storage</div>
          <div className="text-4xl font-extrabold text-[#0A1128]">{ngPackagesCount}</div>
          <div className="text-brand-orange text-sm font-medium mt-2 flex items-center gap-2">
            <EnvironmentOutlined /> Ready for pickup/dispatch
          </div>
        </Card>

        <Card bordered={false} className="shadow-sm rounded-xl bg-slate-50 border border-slate-100">
          <div className="text-slate-500 font-bold text-xs tracking-wider uppercase mb-2">Total Network Packages</div>
          <div className="text-4xl font-extrabold text-[#0A1128]">{allPackages.length}</div>
          <div className="text-green-600 text-sm font-medium mt-2 flex items-center gap-1">Tracked in Database</div>
        </Card>
      </div>

      {loading && facilities.length === 0 ? (
        <div className="flex justify-center py-16">
          <Spin size="large" />
        </div>
      ) : (
        /* Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredFacilities.map((facility) => (
            <Card
              key={facility.id}
              bordered={false}
              onClick={() => setSelectedFacility(facility)}
              className="shadow-md rounded-xl overflow-hidden hover:shadow-lg transition-shadow duration-300 border border-slate-100 flex flex-col h-full cursor-pointer group"
              styles={{ body: { padding: 0, display: 'flex', flexDirection: 'column', height: '100%' } }}
            >
              <div className="relative h-48 bg-slate-200">
                <img
                  src={facility.imageUrl || 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=2070&auto=format&fit=crop'}
                  alt={facility.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2 shadow-sm">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      facility.status === 'active' ? 'bg-emerald-500' : facility.status === 'at_capacity' ? 'bg-amber-500' : 'bg-rose-500'
                    }`}
                  ></div>
                  <span className="text-slate-700 tracking-wider uppercase">{facility.status.replace('_', ' ')}</span>
                </div>

                <div className="absolute top-4 left-4 flex gap-2">
                  <Button
                    size="small"
                    icon={<EditOutlined />}
                    onClick={(e) => handleOpenEditModal(facility, e)}
                    className="!bg-white/90 hover:!bg-white !text-slate-700 border-none shadow-sm rounded-lg font-medium"
                  >
                    Edit
                  </Button>
                  <Popconfirm
                    title="Decommission Facility"
                    description="Are you sure you want to delete this facility?"
                    onConfirm={(e: any) => handleDeleteFacility(facility.id, facility.code, e)}
                    okText="Yes, Delete"
                    cancelText="Cancel"
                    okButtonProps={{ danger: true }}
                  >
                    <Button
                      size="small"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={(e) => e.stopPropagation()}
                      className="!bg-white/90 hover:!bg-red-50 border-none shadow-sm rounded-lg"
                    >
                      Delete
                    </Button>
                  </Popconfirm>
                </div>
              </div>

              <div className="p-6 flex flex-col flex-grow">
                <div className="text-brand-orange font-bold text-xs tracking-widest mb-1">{facility.code}</div>
                <h2 className="text-xl font-bold text-[#0A1128] m-0 mb-1">{facility.name}</h2>
                <div className="text-slate-500 text-sm flex items-center gap-1 mb-6">
                  <EnvironmentOutlined /> {facility.location}
                </div>

                <div className="mt-auto">
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-xs font-bold text-slate-500 tracking-wider uppercase">Hub Volume</span>
                    <span className="text-xs font-bold text-slate-700">{facility.currentVolume}</span>
                  </div>
                  <Progress percent={facility.capacityUtilization} showInfo={false} strokeColor="#0A1128" railColor="#f1f5f9" className="mb-1" />
                  <div className="text-right text-xs text-slate-400 font-medium mb-4">Max capacity: {facility.maxVolume}</div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Facility Detail Modal */}
      <Modal
        open={!!selectedFacility}
        onCancel={() => setSelectedFacility(null)}
        footer={null}
        width={650}
        centered
        className="rounded-2xl overflow-hidden"
      >
        {selectedFacility && (
          <div className="pt-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-brand-orange font-bold text-lg">
                {selectedFacility.country}
              </div>
              <div>
                <div className="text-xs font-bold text-brand-orange uppercase tracking-wider">{selectedFacility.code}</div>
                <h2 className="text-xl font-bold text-[#0A1128] m-0">{selectedFacility.name}</h2>
              </div>
            </div>

            <div className="relative h-56 rounded-xl overflow-hidden mb-6">
              <img src={selectedFacility.imageUrl} alt={selectedFacility.name} className="w-full h-full object-cover" />
              <div className="absolute top-3 right-3 bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase shadow">
                {selectedFacility.status.replace('_', ' ')}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div className="text-xs font-bold text-slate-400 uppercase mb-1">Location</div>
                <div className="text-slate-800 font-semibold flex items-center gap-1">
                  <EnvironmentOutlined className="text-brand-orange" /> {selectedFacility.location}
                </div>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div className="text-xs font-bold text-slate-400 uppercase mb-1">Capacity Limit</div>
                <div className="text-slate-800 font-semibold">{selectedFacility.maxVolume}</div>
              </div>
            </div>

            {selectedFacility.contactName && (
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 mb-6 space-y-2">
                <div className="text-xs font-bold text-slate-400 uppercase mb-1">Site Contact</div>
                <div className="text-slate-800 font-semibold flex items-center gap-2">
                  <UserOutlined className="text-brand-navy" /> {selectedFacility.contactName}
                </div>
                {selectedFacility.contactPhone && (
                  <div className="text-slate-600 text-xs flex items-center gap-2">
                    <PhoneOutlined /> {selectedFacility.contactPhone}
                  </div>
                )}
                {selectedFacility.contactEmail && (
                  <div className="text-slate-600 text-xs flex items-center gap-2">
                    <MailOutlined /> {selectedFacility.contactEmail}
                  </div>
                )}
              </div>
            )}

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-slate-500 uppercase">Hub Storage Utilization</span>
                <span className="text-xs font-bold text-slate-800">
                  {selectedFacility.currentVolume} ({selectedFacility.capacityUtilization}%)
                </span>
              </div>
              <Progress percent={selectedFacility.capacityUtilization} strokeColor="#0A1128" />
            </div>

            <div className="flex justify-end gap-3">
              <Button onClick={() => setSelectedFacility(null)} size="large" className="rounded-lg">
                Close
              </Button>
              <Button
                type="primary"
                size="large"
                onClick={() => {
                  setSelectedFacility(null);
                  navigate('/admin/warehouse/scan');
                }}
                className="!bg-brand-orange hover:!bg-orange-600 !text-white font-semibold rounded-lg border-none"
              >
                Go to Warehouse Scanner
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Edit Facility Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-[#0A1128] font-bold">
            <EditOutlined className="text-brand-orange" /> Edit Facility Details
          </div>
        }
        open={!!editingFacility}
        onCancel={() => setEditingFacility(null)}
        onOk={handleSaveEdit}
        confirmLoading={savingEdit}
        okText="Save Changes"
        okButtonProps={{ className: '!bg-brand-navy hover:!bg-slate-800' }}
        width={600}
        centered
      >
        <Form form={form} layout="vertical" className="pt-4">
          <div className="grid grid-cols-2 gap-4">
            <Form.Item name="code" label="Facility Code" rules={[{ required: true }]}>
              <Input placeholder="CN-CAN-01" />
            </Form.Item>
            <Form.Item name="name" label="Facility Name" rules={[{ required: true }]}>
              <Input placeholder="Guangzhou Primary Hub" />
            </Form.Item>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item name="location" label="Location (City, Country)" rules={[{ required: true }]}>
              <Input placeholder="Guangzhou, China" />
            </Form.Item>
            <Form.Item name="country" label="Country Code" rules={[{ required: true }]}>
              <Select>
                <Option value="CN">CN - China</Option>
                <Option value="NG">NG - Nigeria</Option>
              </Select>
            </Form.Item>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item name="type" label="Facility Tier Type">
              <Select>
                <Option value="regional_hub">Regional Hub (Tier-1)</Option>
                <Option value="dist_center">Dist. Center (Tier-2)</Option>
                <Option value="fulfillment">Fulfillment Node (Tier-3)</Option>
                <Option value="cross_dock">Cross-Dock (Special)</Option>
              </Select>
            </Form.Item>
            <Form.Item name="status" label="Operating Status">
              <Select>
                <Option value="active">Active</Option>
                <Option value="at_capacity">At Capacity</Option>
                <Option value="inactive">Inactive</Option>
              </Select>
            </Form.Item>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item name="maxVolume" label="Max Volume Capacity">
              <Input placeholder="1,000 pkgs/day" />
            </Form.Item>
            <Form.Item name="currentVolume" label="Current Stored Volume">
              <Input placeholder="450 packages" />
            </Form.Item>
          </div>

          <Form.Item name="address" label="Street Address">
            <Input placeholder="No. 88 Cargo Road, Guangzhou" />
          </Form.Item>

          <div className="grid grid-cols-3 gap-3">
            <Form.Item name="contactName" label="Contact Person">
              <Input placeholder="Commander Name" />
            </Form.Item>
            <Form.Item name="contactPhone" label="Contact Phone">
              <Input placeholder="+86 20 8888 9999" />
            </Form.Item>
            <Form.Item name="contactEmail" label="Contact Email">
              <Input placeholder="hub@logicore.com" />
            </Form.Item>
          </div>
        </Form>
      </Modal>
    </div>
  );
};
