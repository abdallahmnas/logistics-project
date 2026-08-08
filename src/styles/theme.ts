import type { ThemeConfig } from 'antd';

export const antdTheme: ThemeConfig = {
  token: {
    colorPrimary: '#0A1628',
    colorSuccess: '#10B981',
    colorWarning: '#F59E0B',
    colorError: '#EF4444',
    colorInfo: '#3B82F6',
    borderRadius: 8,
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
    wireframe: false,
  },
  components: {
    Button: {
      colorPrimary: '#0A1628',
      colorPrimaryHover: '#1E293B',
      colorPrimaryActive: '#0F172A',
      primaryShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
      fontWeight: 500,
    },
    Card: {
      boxShadowTertiary: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
      borderRadiusLG: 12,
    },
    Input: {
      activeBorderColor: '#0A1628',
      hoverBorderColor: '#64748B',
    },
    Select: {
      colorPrimary: '#0A1628',
      colorPrimaryHover: '#0A1628',
    },
    Table: {
      headerBg: '#F8FAFC',
      headerColor: '#475569',
      rowHoverBg: '#F1F5F9',
    },
    Menu: {
      itemSelectedBg: '#EEF3FE',
      itemSelectedColor: '#2F6FED',
      itemHoverBg: '#F8FAFC',
      itemHoverColor: '#0A1628',
      itemActiveBg: '#EEF3FE',
      itemBorderRadius: 10,
      iconSize: 16,
      itemHeight: 42,
    },
    Statistic: {
      titleFontSize: 13,
    },
  },
};
