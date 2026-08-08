import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LogoutOutlined } from '@ant-design/icons';

export interface SidebarNavItem {
  key: string;
  label: string;
  icon: React.ReactNode;
  badge?: number;
}

export interface SidebarNavSection {
  title: string;
  items: SidebarNavItem[];
}

interface SidebarNavProps {
  sections: SidebarNavSection[];
  collapsed: boolean;
  variant?: 'light' | 'dark';
  userName: string;
  userSubtitle: string;
  userInitial: string;
  onSignOut: () => void;
}

export const SidebarNav: React.FC<SidebarNavProps> = ({
  sections,
  collapsed,
  variant = 'light',
  userName,
  userSubtitle,
  userInitial,
  onSignOut,
}) => {
  const location = useLocation();
  const isDark = variant === 'dark';

  const isActive = (key: string) =>
    key === '/dashboard' || key === '/admin' || key === '/customer'
      ? location.pathname === key
      : location.pathname.startsWith(key);

  return (
    <div className={`flex flex-col h-full ${isDark ? 'bg-brand-navy' : 'bg-white'}`}>
      <nav className="flex-1 overflow-y-auto px-3 py-4 scrollbar-hide">
        {sections.map((section) => (
          <div key={section.title || 'main'} className="mb-5">
            {!collapsed && section.title && (
              <div
                className={`px-3 mb-2 text-[11px] font-semibold tracking-wider uppercase ${
                  isDark ? 'text-slate-500' : 'text-slate-400'
                }`}
              >
                {section.title}
              </div>
            )}
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const active = isActive(item.key);
                return (
                  <Link
                    key={item.key}
                    to={item.key}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      active
                        ? isDark
                          ? 'bg-white/10 text-white'
                          : 'bg-[#0A1128] text-white shadow-sm'
                        : isDark
                        ? 'text-slate-300 hover:bg-white/5 hover:text-white'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <span
                      className={`text-base flex items-center justify-center ${
                        active ? (isDark ? 'text-brand-gold' : 'text-white') : 'text-slate-400'
                      }`}
                    >
                      {item.icon}
                    </span>
                    {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
                    {!collapsed && item.badge ? (
                      <span className="bg-red-500 text-white text-[10px] font-bold rounded-full px-1.5 py-0.5 min-w-[18px] text-center">
                        {item.badge}
                      </span>
                    ) : null}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className={`px-3 py-4 border-t ${isDark ? 'border-white/10' : 'border-slate-100'}`}>
        <div className="flex items-center gap-2.5 px-2 mb-2">
          <div
            className={`w-9 h-9 rounded-full flex items-center justify-center font-semibold text-sm shrink-0 ${
              isDark ? 'bg-brand-gold text-brand-navy' : 'bg-brand-navy text-white'
            }`}
          >
            {userInitial}
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <div className={`text-sm font-medium truncate ${isDark ? 'text-white' : 'text-slate-800'}`}>
                {userName}
              </div>
              <div className={`text-xs truncate ${isDark ? 'text-slate-400' : 'text-slate-400'}`}>
                {userSubtitle}
              </div>
            </div>
          )}
        </div>
        <button
          onClick={onSignOut}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            isDark ? 'text-slate-300 hover:bg-white/5 hover:text-white' : 'text-slate-500 hover:bg-slate-50 hover:text-red-600'
          }`}
        >
          <LogoutOutlined />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </div>
  );
};
