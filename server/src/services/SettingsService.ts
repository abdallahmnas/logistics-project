import { SystemSettings, SystemSettingsAttributes } from '../models';
import { ActivityLogService } from './ActivityLogService';

export class SettingsService {
  public static async getSettings(): Promise<SystemSettings> {
    let settings = await SystemSettings.findByPk('global_settings');
    if (!settings) {
      settings = await SystemSettings.create({
        id: 'global_settings',
        ngnEscrowBankName: 'GTBank',
        ngnEscrowAccountNo: '0123456789',
        ngnEscrowAccountName: 'Hamza RMB Trading Escrow Ltd',
        rmbReceivingBankName: 'Industrial and Commercial Bank of China (ICBC)',
        rmbReceivingAccountNo: '6222021001008888888',
        rmbReceivingAccountName: 'Guangzhou Hamza Logistics Co., Ltd',
        rmbReceivingAlipay: 'hamza_rmb@alipay.com',
        rmbReceivingWechat: 'HamzaRMB_Pay',
        cnyExchangeRate: 215.0,
        usdExchangeRate: 1550.0,
        airFreightRatePerKg: 12500,
        seaFreightRatePerCbm: 450000,
        seaFreightRatePerKg: 3500,
        buyForMeFeePercent: 5.0,
        buyForMeFixedFee: 1000,
        deliveryMotorbikeBaseRate: 1500,
        deliveryMotorbikePerKm: 150,
        deliverySedanBaseRate: 3000,
        deliverySedanPerKm: 250,
        deliveryTruckBaseRate: 8000,
        deliveryTruckPerKm: 500,
        walletFundingFeePercent: 1.5,
        walletWithdrawalFlatFee: 500,
        companyName: 'HAMZA RMB GLOBAL COMPANY LTD',
        chinaAirCargoAddressCn: '义乌市稠州北路国贸大厦6楼602',
        chinaAirCargoAddressEn: 'Room 602, International Trade Mansion, Chouzhou North Road, Yiwu City, Jinhua City, Zhejiang Province, China',
        chinaAirCargoPhone: '+86 158 6890 7118',
        nigeriaOfficeAddress: 'No. 08 Gwarzo Road Beside Shopwell, Gwale Kano State, Nigeria',
        companyContacts: JSON.stringify([
          { name: 'HAMZA RMB CHINA', phone: '+86 198 4662 5061' },
          { name: 'AMMARU', phone: '+234 8168416814' },
          { name: 'HUZAIFA', phone: '+234 8028324798' },
          { name: 'ABDUL GANIYU', phone: '+234 9033577012' },
          { name: 'SAYYADI', phone: '+86 17766369841' },
          { name: 'ANAS NARIMI', phone: '+86 13185109544' },
        ]),
      });
    }
    return settings;
  }

  public static async updateSettings(
    payload: Partial<SystemSettingsAttributes>,
    adminUser?: { id: string; name: string; role: string }
  ): Promise<SystemSettings> {
    const settings = await this.getSettings();

    // Prevent overwriting id
    delete (payload as any).id;

    await settings.update(payload);

    if (adminUser) {
      ActivityLogService.logActivity({
        userId: adminUser.id,
        userName: adminUser.name,
        userRole: adminUser.role,
        module: 'settings',
        action: 'UPDATE_SETTINGS',
        description: 'Updated platform rates, receiving accounts, and financial configuration',
      });
    }

    return settings;
  }
}
