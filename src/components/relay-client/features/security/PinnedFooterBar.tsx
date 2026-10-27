import React from 'react';

interface PinnedFooterBarProps {
  activeExitNodeName: string;
  onSwitchExitNode: () => void;
}

export const PinnedFooterBar: React.FC<PinnedFooterBarProps> = ({
  activeExitNodeName,
  onSwitchExitNode
}) => {
  return (
    <div className="w-full px-8 py-2.5 border-t border-slate-200/60 flex items-center justify-between text-xs text-slate-500 font-normal flex-shrink-0 bg-white/40">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-1.5">
          <span className="text-slate-400">出口</span>
          <span className="font-mono text-slate-800 font-medium">2a09:bac1:...</span>
          <span className="text-slate-400 text-[11px]">WARP · US</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-slate-400">本机</span>
          <span className="font-mono text-slate-800 font-medium">163.125.167.92</span>
          <span className="text-slate-400 text-[11px]">深圳 · 联通</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-slate-400">DNS</span>
          <span className="text-slate-700 font-medium">广东联通</span>
        </div>
      </div>

      {/* NetBird 出口节点与自动漂移快速切换 */}
      <div className="flex items-center gap-2 text-[11px]">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/60 font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span id="active-exit-node-name">{activeExitNodeName}</span>
        </span>
        <button
          onClick={onSwitchExitNode}
          className="text-slate-400 hover:text-slate-700 cursor-pointer transition-colors p-1"
          title="切换 Exit Node"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
          </svg>
        </button>
      </div>
    </div>
  );
};
