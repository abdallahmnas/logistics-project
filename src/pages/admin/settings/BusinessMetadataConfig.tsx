import React, { useEffect, useState } from 'react';
import { Card, Input, Button, Form, message, Space, Tag } from 'antd';
import { SaveOutlined, PlusOutlined, DeleteOutlined, IdcardOutlined, EnvironmentOutlined, PhoneOutlined, WhatsAppOutlined, GlobalOutlined, BankOutlined } from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { fetchSettings, updateSettings, type SystemSettings } from '../../../store/slices/settingsSlice';

const { TextArea } = Input;

interface ContactPerson {
  id: string;
  name: string;
  phone: string;
}

export const BusinessMetadataConfig: React.FC = () => {
  const dispatch = useAppDispatch();
  const { settings, loading } = useAppSelector((state) => state.settings);
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);

  const [contactsList, setContactsList] = useState<ContactPerson[]>([]);
  const [newContactName, setNewContactName] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');

  useEffect(() => {
    dispatch(fetchSettings());
  }, [dispatch]);

  useEffect(() => {
    if (settings) {
      form.setFieldsValue({
        companyName: settings.companyName || 'HAMZA RMB GLOBAL COMPANY LTD',
        chinaAirCargoAddressCn: settings.chinaAirCargoAddressCn || '义乌市稠州北路国贸大厦6楼602',
        chinaAirCargoAddressEn: settings.chinaAirCargoAddressEn || 'Room 602, International Trade Mansion, Chouzhou North Road, Yiwu City, Jinhua City, Zhejiang Province, China',
        chinaAirCargoPhone: settings.chinaAirCargoPhone || '+86 158 6890 7118',
        nigeriaOfficeAddress: settings.nigeriaOfficeAddress || 'No. 08 Gwarzo Road Beside Shopwell, Gwale Kano State, Nigeria',
      });

      if (settings.companyContacts) {
        try {
          const parsed = JSON.parse(settings.companyContacts);
          if (Array.isArray(parsed)) {
            setContactsList(parsed.map((item, idx) => ({
              id: item.id || `contact_${idx}_${Date.now()}`,
              name: item.name,
              phone: item.phone,
            })));
          }
        } catch {
          setContactsList([
            { id: '1', name: 'HAMZA RMB CHINA', phone: '+86 198 4662 5061' },
            { id: '2', name: 'AMMARU', phone: '+234 8168416814' },
            { id: '3', name: 'HUZAIFA', phone: '+234 8028324798' },
            { id: '4', name: 'ABDUL GANIYU', phone: '+234 9033577012' },
            { id: '5', name: 'SAYYADI', phone: '+86 17766369841' },
            { id: '6', name: 'ANAS NARIMI', phone: '+86 13185109544' },
          ]);
        }
      } else {
        setContactsList([
          { id: '1', name: 'HAMZA RMB CHINA', phone: '+86 198 4662 5061' },
          { id: '2', name: 'AMMARU', phone: '+234 8168416814' },
          { id: '3', name: 'HUZAIFA', phone: '+234 8028324798' },
          { id: '4', name: 'ABDUL GANIYU', phone: '+234 9033577012' },
          { id: '5', name: 'SAYYADI', phone: '+86 17766369841' },
          { id: '6', name: 'ANAS NARIMI', phone: '+86 13185109544' },
        ]);
      }
    }
  }, [settings, form]);

  const handleAddContact = () => {
    if (!newContactName.trim() || !newContactPhone.trim()) {
      message.warning('Please enter both contact name and phone number.');
      return;
    }
    const newPerson: ContactPerson = {
      id: `contact_${Date.now()}`,
      name: newContactName.trim().toUpperCase(),
      phone: newContactPhone.trim(),
    };
    setContactsList([...contactsList, newPerson]);
    setNewContactName('');
    setNewContactPhone('');
  };

  const handleRemoveContact = (id: string) => {
    setContactsList(contactsList.filter(c => c.id !== id));
  };

  const handleSave = async (values: any) => {
    setSaving(true);
    try {
      const payload: Partial<SystemSettings> = {
        companyName: values.companyName,
        chinaAirCargoAddressCn: values.chinaAirCargoAddressCn,
        chinaAirCargoAddressEn: values.chinaAirCargoAddressEn,
        chinaAirCargoPhone: values.chinaAirCargoPhone,
        nigeriaOfficeAddress: values.nigeriaOfficeAddress,
        companyContacts: JSON.stringify(contactsList.map(({ name, phone }) => ({ name, phone }))),
      };

      await dispatch(updateSettings(payload)).unwrap();
      message.success('Business metadata updated! Email templates, public pages, and warehouse routes updated automatically.');
      dispatch(fetchSettings());
    } catch (err: any) {
      message.error(err || 'Failed to update business metadata.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in-up max-w-[1100px] mx-auto">
      
      {/* Top Standard Settings Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-brand-orange text-xs font-bold uppercase tracking-wider mb-1">
            <IdcardOutlined /> Platform Configuration
          </div>
          <h2 className="text-2xl font-bold text-[#0A1128] m-0">
            Business Metadata & Company Settings
          </h2>
          <p className="text-slate-500 text-sm mt-1 mb-0">
            Manage your official company name, China Air Cargo hub addresses, Nigeria office locations, and operational contacts. These settings populate automatically across email templates, public footers, and customer warehouse tools.
          </p>
        </div>

        <Button
          type="primary"
          size="large"
          icon={<SaveOutlined />}
          loading={saving}
          className="bg-brand-orange hover:bg-[#E86E21] border-none font-bold shadow-md px-6 shrink-0"
          onClick={() => form.submit()}
        >
          Save Changes
        </Button>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSave}
        className="space-y-6"
      >
        {/* Company Identity */}
        <Card bordered={false} className="shadow-sm rounded-2xl border border-slate-100">
          <h3 className="text-base font-bold text-[#0A1128] mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
            <BankOutlined className="text-brand-orange" /> Company Identity
          </h3>

          <div>
            <Form.Item
              label={<span className="font-bold text-slate-700 uppercase text-xs">Registered Business Name</span>}
              name="companyName"
              rules={[{ required: true, message: 'Please enter company name' }]}
            >
              <Input size="large" className="font-bold text-[#0A1128]" placeholder="e.g. HAMZA RMB GLOBAL COMPANY LTD" />
            </Form.Item>
          </div>
        </Card>

        {/* China Air Cargo Office Details */}
        <Card bordered={false} className="shadow-sm rounded-2xl border border-slate-100">
          <h3 className="text-base font-bold text-[#0A1128] mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
            <GlobalOutlined className="text-blue-600" /> China Air Cargo Hub Details
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Form.Item
                label={<span className="font-bold text-slate-700 uppercase text-xs">Air Cargo Address (Chinese)</span>}
                name="chinaAirCargoAddressCn"
                rules={[{ required: true, message: 'Please enter Chinese address' }]}
              >
                <Input size="large" placeholder="e.g. 义乌市稠州北路国贸大厦6楼602" />
              </Form.Item>
            </div>

            <div>
              <Form.Item
                label={<span className="font-bold text-slate-700 uppercase text-xs">Air Cargo Telephone Contact</span>}
                name="chinaAirCargoPhone"
                rules={[{ required: true, message: 'Please enter telephone number' }]}
              >
                <Input size="large" placeholder="e.g. +86 158 6890 7118" />
              </Form.Item>
            </div>

            <div className="md:col-span-2">
              <Form.Item
                label={<span className="font-bold text-slate-700 uppercase text-xs">Air Cargo Address (English Translation)</span>}
                name="chinaAirCargoAddressEn"
                rules={[{ required: true, message: 'Please enter English address' }]}
              >
                <TextArea rows={2} placeholder="e.g. Room 602, International Trade Mansion, Chouzhou North Road, Yiwu City, Jinhua City, Zhejiang Province, China" />
              </Form.Item>
            </div>
          </div>
        </Card>

        {/* Nigeria Office Details */}
        <Card bordered={false} className="shadow-sm rounded-2xl border border-slate-100">
          <h3 className="text-base font-bold text-[#0A1128] mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
            <EnvironmentOutlined className="text-emerald-600" /> Nigeria Office & Distribution Hub
          </h3>

          <div>
            <Form.Item
              label={<span className="font-bold text-slate-700 uppercase text-xs">Nigeria Main Office Address</span>}
              name="nigeriaOfficeAddress"
              rules={[{ required: true, message: 'Please enter Nigeria office address' }]}
            >
              <TextArea rows={2} placeholder="e.g. No. 08 Gwarzo Road Beside Shopwell, Gwale Kano State, Nigeria" />
            </Form.Item>
          </div>
        </Card>

        {/* Official Contact Persons Directory */}
        <Card bordered={false} className="shadow-sm rounded-2xl border border-slate-100">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-[#0A1128] m-0 flex items-center gap-2">
                <PhoneOutlined className="text-emerald-600" /> Key Company Contacts & Representatives
              </h3>
              <p className="text-slate-500 text-xs mt-1 mb-0">
                Contact names and phone/WhatsApp numbers rendered in customer portals and public footers.
              </p>
            </div>
          </div>

          {/* Add New Contact Row */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6 grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
            <div className="sm:col-span-5">
              <Input
                size="large"
                placeholder="Representative Name (e.g. AMMARU)"
                value={newContactName}
                onChange={(e) => setNewContactName(e.target.value)}
              />
            </div>
            <div className="sm:col-span-5">
              <Input
                size="large"
                placeholder="Phone / WhatsApp Number (e.g. +234 8168416814)"
                value={newContactPhone}
                onChange={(e) => setNewContactPhone(e.target.value)}
              />
            </div>
            <div className="sm:col-span-2">
              <Button
                type="primary"
                size="large"
                block
                icon={<PlusOutlined />}
                className="bg-emerald-600 hover:bg-emerald-700 border-none font-bold"
                onClick={handleAddContact}
              >
                Add
              </Button>
            </div>
          </div>

          {/* Contacts List Table */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {contactsList.map((contact) => (
              <div key={contact.id} className="flex justify-between items-center bg-white p-3.5 px-4 rounded-xl border border-slate-200 shadow-2xs hover:border-brand-orange transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 font-bold flex items-center justify-center text-xs shrink-0">
                    <WhatsAppOutlined />
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-[#0A1128] text-sm truncate">{contact.name}</div>
                    <a href={`https://wa.me/${contact.phone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="font-mono text-xs font-bold text-emerald-700 hover:underline">
                      {contact.phone}
                    </a>
                  </div>
                </div>
                <Button
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => handleRemoveContact(contact.id)}
                />
              </div>
            ))}
          </div>
        </Card>

        {/* Action Button */}
        <div className="flex justify-end pt-2">
          <Button
            type="primary"
            size="large"
            htmlType="submit"
            icon={<SaveOutlined />}
            loading={saving}
            className="bg-brand-orange hover:bg-[#E86E21] border-none font-bold shadow-md px-8 h-11"
          >
            Save All Business Metadata
          </Button>
        </div>
      </Form>

    </div>
  );
};
