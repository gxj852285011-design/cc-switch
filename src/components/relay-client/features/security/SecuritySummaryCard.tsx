import React from 'react';
import type { SecurityVendor } from '../../core/store/useRelayStore';

interface SecuritySummaryCardProps {
  vendor: SecurityVendor;
}

export const SecuritySummaryCard: React.FC<SecuritySummaryCardProps> = ({ vendor }) => {
  if (vendor === 'google') {
    return (
      <div 
        id="sec-left-card-google" 
        className="w-full min-h-[105px] bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs flex items-center justify-between box-border flex-shrink-0"
      >
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 flex-shrink-0">
            <svg className="w-5 h-5 stroke-[2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
            </svg>
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 text-[15px]">发现 <span className="text-rose-500 font-extrabold">1 项高危</span> + <span className="text-amber-500 font-extrabold">1 项警告</span></span>
            </div>
            <p className="text-xs text-slate-500 leading-normal m-0">当前属于 US 官方准入区域，但检测到本机 IPv6 直连边缘节点，建议立即排查。</p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1 flex-shrink-0 pl-4 border-l border-slate-100">
          <span className="text-[11px] text-slate-400">官方准入区</span>
          <span className="text-xs font-mono font-medium text-blue-600">US (United States)</span>
        </div>
      </div>
    );
  }

  return (
    <div 
      id="sec-left-card-claude" 
      className="w-full min-h-[105px] bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs flex items-center justify-between box-border flex-shrink-0"
    >
      <div className="flex items-center gap-4">
        <div className="w-11 h-11 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500 flex-shrink-0">
          <svg className="w-5 h-5 stroke-[2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
          </svg>
        </div>
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900 text-[15px]">发现 <span className="text-rose-500 font-extrabold">1 项高危</span> + <span className="text-amber-500 font-extrabold">2 项警告</span></span>
          </div>
          <p className="text-xs text-slate-500 leading-normal m-0">IPv6 旁路泄露可能导致 403 封号，建议立即处理下方高危项。</p>
        </div>
      </div>
      <div className="flex flex-col items-end gap-1 flex-shrink-0 pl-4 border-l border-slate-100">
        <span className="text-[11px] text-slate-400">NetBird WireGuard</span>
        <span className="text-xs font-mono font-medium text-emerald-600 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          100.64.0.12
        </span>
      </div>
    </div>
  );
};
