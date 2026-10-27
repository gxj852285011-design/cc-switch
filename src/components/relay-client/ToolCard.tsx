import React from 'react';
import { ToolItem } from './types';

interface ToolCardProps {
  tool: ToolItem;
  isSelected?: boolean;
  onSelect: (tool: ToolItem) => void;
  onQuickAction?: (tool: ToolItem) => void;
}

export const ToolCard: React.FC<ToolCardProps> = ({
  tool,
  isSelected,
  onSelect,
  onQuickAction,
}) => {
  const getStatusBadge = () => {
    switch (tool.status) {
      case 'ready':
        return (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            就绪
          </span>
        );
      case 'unconfigured':
        return (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-600 border border-amber-100 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            未配置
          </span>
        );
      case 'uninstalled-cli':
        return (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-500">
            未安装
          </span>
        );
      case 'uninstalled-gui':
        return (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-orange-50 text-orange-600">
            需官网下载
          </span>
        );
    }
  };

  const getActionButton = () => {
    switch (tool.status) {
      case 'ready':
        return (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onQuickAction?.(tool);
            }}
            className="px-2.5 py-1 rounded-md bg-zinc-900 hover:bg-zinc-800 text-white text-[11px] font-medium transition-colors shadow-xs"
          >
            启动
          </button>
        );
      case 'unconfigured':
        return (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelect(tool);
            }}
            className="px-2.5 py-1 rounded-md bg-amber-500 hover:bg-amber-600 text-white text-[11px] font-medium transition-colors shadow-xs"
          >
            配置
          </button>
        );
      case 'uninstalled-cli':
        return (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelect(tool);
            }}
            className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-medium transition-colors"
          >
            安装
          </button>
        );
      case 'uninstalled-gui':
        return (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelect(tool);
            }}
            className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-medium transition-colors"
          >
            前往
          </button>
        );
    }
  };

  return (
    <div
      onClick={() => onSelect(tool)}
      className={`rounded-xl p-3.5 flex flex-col justify-between cursor-pointer transition-all border backdrop-blur-md ${
        isSelected
          ? 'bg-white border-indigo-500 shadow-md ring-2 ring-indigo-500/10'
          : 'bg-white/80 hover:bg-white border-slate-200/80 hover:border-slate-300 shadow-xs hover:shadow-sm'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-700 font-bold text-xs">
            {tool.name.slice(0, 1)}
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-800 tracking-tight">{tool.name}</h3>
            <p className="text-[10px] text-slate-400">{tool.subtitle}</p>
          </div>
        </div>
        {getStatusBadge()}
      </div>

      <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
        <span className="text-[10px] text-slate-400 font-mono">
          {tool.status === 'ready' && tool.latency ? `${tool.latency}ms` : tool.configPath || tool.type.toUpperCase()}
        </span>
        {getActionButton()}
      </div>
    </div>
  );
};
