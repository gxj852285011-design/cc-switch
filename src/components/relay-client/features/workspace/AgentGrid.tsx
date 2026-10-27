import React from 'react';
import type { AgentConfig } from '../../core/constants/agents';
import { AgentIcon } from '../../core/constants/icons';

interface AgentGridProps {
  agents: AgentConfig[];
  selectedCategory: string;
  onSelectAgent: (id: number) => void;
}

export const AgentGrid: React.FC<AgentGridProps> = ({
  agents,
  selectedCategory,
  onSelectAgent
}) => {
  const filteredAgents = agents.filter(agent => {
    if (selectedCategory === 'all') return true;
    return agent.category === selectedCategory;
  });

  const col1Agents = filteredAgents.filter(a => a.col === 1);
  const col2Agents = filteredAgents.filter(a => a.col === 2);

  const renderBadge = (badge: AgentConfig['badge']) => {
    switch (badge) {
      case '已就绪':
      case '已安装':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-600 border border-emerald-100">就绪</span>;
      case '未配置':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-600 border border-amber-100">待配置</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-500">未安装</span>;
    }
  };

  return (
    <div className="w-full grid grid-cols-2 gap-4 box-border">
      {/* 第 1 列 */}
      <div className="flex flex-col gap-3">
        {col1Agents.map(agent => (
          <div
            key={agent.id}
            role="button"
            tabIndex={0}
            onClick={() => onSelectAgent(agent.id)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSelectAgent(agent.id);
              }
            }}
            className="group p-4 bg-white/70 hover:bg-white rounded-2xl border border-slate-200/80 hover:border-slate-300 shadow-2xs hover:shadow-xs transition-all duration-200 cursor-pointer flex items-center justify-between"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-slate-100/80 flex items-center justify-center p-2 group-hover:scale-105 transition-transform">
                <AgentIcon name={agent.iconType} size={24} />
              </div>
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-900 text-sm">{agent.title}</span>
                  {renderBadge(agent.badge)}
                </div>
                <span className="text-xs text-slate-400 font-normal">{agent.sub}</span>
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSelectAgent(agent.id);
              }}
              className={`h-8 px-3.5 rounded-xl text-xs font-medium transition-all ${
                agent.btnDark
                  ? 'bg-slate-900 hover:bg-slate-800 text-white'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {agent.btnLabel}
            </button>
          </div>
        ))}
      </div>

      {/* 第 2 列 */}
      <div className="flex flex-col gap-3">
        {col2Agents.map(agent => (
          <div
            key={agent.id}
            role="button"
            tabIndex={0}
            onClick={() => onSelectAgent(agent.id)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSelectAgent(agent.id);
              }
            }}
            className="group p-4 bg-white/70 hover:bg-white rounded-2xl border border-slate-200/80 hover:border-slate-300 shadow-2xs hover:shadow-xs transition-all duration-200 cursor-pointer flex items-center justify-between"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-slate-100/80 flex items-center justify-center p-2 group-hover:scale-105 transition-transform">
                <AgentIcon name={agent.iconType} size={24} />
              </div>
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-900 text-sm">{agent.title}</span>
                  {renderBadge(agent.badge)}
                </div>
                <span className="text-xs text-slate-400 font-normal">{agent.sub}</span>
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSelectAgent(agent.id);
              }}
              className={`h-8 px-3.5 rounded-xl text-xs font-medium transition-all ${
                agent.btnDark
                  ? 'bg-slate-900 hover:bg-slate-800 text-white'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {agent.btnLabel}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
