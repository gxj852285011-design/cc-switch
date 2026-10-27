import React from 'react';
import type { AgentConfig } from '../../core/constants/agents';
import { AgentIcon } from '../../core/constants/icons';

interface AgentDrawerProps {
  agent: AgentConfig;
  onClose: () => void;
  onInstall: (toolId: AgentConfig['toolId']) => void;
  onShowToast: (msg: string) => void;
}

export const AgentDrawer: React.FC<AgentDrawerProps> = ({
  agent,
  onClose,
  onInstall,
  onShowToast
}) => {
  return (
    <div className="flex-1 bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm flex flex-col justify-between box-border overflow-y-auto no-scrollbar">
      <div className="flex flex-col gap-5">
        {/* 顶部标题与关闭 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center p-2.5">
              <AgentIcon name={agent.iconType} size={30} />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900">{agent.title}</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600">
                  {agent.badge}
                </span>
              </div>
              <p className="text-xs text-slate-400 m-0">{agent.sub}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* 介绍卡片 */}
        <div className="p-4 bg-slate-50/70 rounded-2xl border border-slate-100 text-xs text-slate-600 leading-relaxed">
          {agent.guide}
        </div>

        {/* 快速终端接入指令 */}
        <div className="flex flex-col gap-2">
          <span className="text-xs font-semibold text-slate-700">快速命令行调用</span>
          <div className="flex items-center justify-between px-3.5 py-2.5 bg-slate-900 text-slate-200 rounded-xl font-mono text-xs">
            <span>$ {agent.quickCmd}</span>
            <button
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(agent.quickCmd);
                  onShowToast('📋 指令已复制到剪贴板！');
                } catch {
                  onShowToast('⚠️ 剪贴板访问受限，请手动选取复制');
                }
              }}
              className="text-slate-400 hover:text-white transition-colors cursor-pointer text-[11px]"
            >
              复制
            </button>
          </div>
        </div>

        {/* 零信任专线链路特性 */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex flex-col gap-1">
            <span className="font-semibold text-slate-800">WireGuard L3 专线</span>
            <span className="text-[11px] text-slate-500">点对点 Direct P2P，官方域名免代理</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex flex-col gap-1">
            <span className="font-semibold text-slate-800">防 403 焚决分流</span>
            <span className="text-[11px] text-slate-500">IPv6 旁路拦截，动态出口秒级漂移</span>
          </div>
        </div>
      </div>

      {/* 底部动作条 */}
      <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3 mt-4">
        <button
          onClick={onClose}
          className="h-9 px-4 rounded-xl text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
        >
          返回
        </button>
        <button
          onClick={() => onInstall(agent.toolId)}
          className="h-9 px-5 rounded-xl text-xs font-medium bg-[#1E293B] hover:bg-[#0F172A] text-white shadow-xs transition-all active:scale-95"
        >
          {agent.badge === '未安装' ? '一键安装并配置' : '更新专线配置'}
        </button>
      </div>
    </div>
  );
};
