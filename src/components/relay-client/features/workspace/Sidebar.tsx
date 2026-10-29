import React from 'react';
import type { ViewMode } from '../../core/store/useRelayStore';

interface SidebarProps {
  viewMode: ViewMode;
  onSetViewMode: (mode: ViewMode) => void;
  isLoggedIn: boolean;
  onOpenAuthModal: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  viewMode,
  onSetViewMode,
  isLoggedIn,
  onOpenAuthModal
}) => {
  return (
    <aside className="w-[84px] bg-[#EFF0F5] border-r border-slate-200/60 flex flex-col items-center justify-between py-6 flex-shrink-0 z-10 box-border">
      {/* 顶部专线指示 */}
      <div className="flex items-center justify-center mb-6">
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" title="中继专线引擎在线"></span>
      </div>

      {/* 导航项 */}
      <nav className="flex flex-col gap-4 w-full px-2">
        <button
          onClick={() => onSetViewMode('home')}
          className={`w-full py-3 rounded-2xl flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
            viewMode === 'home' || viewMode === 'uninstalled_config'
              ? 'bg-white shadow-2xs text-slate-900 font-semibold'
              : 'text-slate-400 hover:text-slate-600 hover:bg-white/40 font-medium'
          }`}
        >
          <svg className="w-5 h-5 stroke-[2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <span className="text-[11px]">接入</span>
        </button>

        <button
          onClick={() => onSetViewMode('devices')}
          className={`w-full py-3 rounded-2xl flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
            viewMode === 'devices'
              ? 'bg-white shadow-2xs text-slate-900 font-semibold'
              : 'text-slate-400 hover:text-slate-600 hover:bg-white/40 font-medium'
          }`}
        >
          <svg className="w-5 h-5 stroke-[2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
            <line x1="8" y1="21" x2="16" y2="21"/>
            <line x1="12" y1="17" x2="12" y2="21"/>
          </svg>
          <span className="text-[11px]">设备管理</span>
        </button>

        <button
          onClick={() => onSetViewMode('security')}
          className={`w-full py-3 rounded-2xl flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
            viewMode === 'security'
              ? 'bg-white shadow-2xs text-slate-900 font-semibold'
              : 'text-slate-400 hover:text-slate-600 hover:bg-white/40 font-medium'
          }`}
        >
          <svg className="w-5 h-5 stroke-[2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <span className="text-[11px]">网络防封</span>
        </button>
      </nav>

      {/* 底部用户状态 */}
      <div 
        onClick={onOpenAuthModal}
        className="flex flex-col items-center gap-1.5 cursor-pointer group"
        title="中转站认证中心"
      >
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-slate-800 to-slate-900 text-white flex items-center justify-center font-bold text-xs shadow-xs group-hover:scale-105 transition-transform">
          {isLoggedIn ? '8x' : 'AI'}
        </div>
        <span className="text-[10px] text-slate-400 group-hover:text-slate-600 font-medium truncate max-w-[60px]">
          {isLoggedIn ? '已授权' : '未登录'}
        </span>
      </div>
    </aside>
  );
};
