import React from 'react';
import type { AgentConfig } from '../../core/constants/agents';
import { AgentIcon } from '../../core/constants/icons';

interface MiniAgentRailProps {
  agents: AgentConfig[];
  selectedCardId: number;
  onSelectAgent: (id: number) => void;
}

export const MiniAgentRail: React.FC<MiniAgentRailProps> = ({
  agents,
  selectedCardId,
  onSelectAgent
}) => {
  return (
    <div className="w-[260px] flex-shrink-0 flex flex-col gap-2 overflow-y-auto no-scrollbar pr-1 box-border">
      {agents.map(agent => {
        const isSelected = agent.id === selectedCardId;
        return (
          <div
            key={agent.id}
            onClick={() => onSelectAgent(agent.id)}
            className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center gap-3 ${
              isSelected
                ? 'bg-white border-slate-300 shadow-xs'
                : 'bg-white/40 hover:bg-white/70 border-transparent hover:border-slate-200'
            }`}
          >
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center p-1.5 ${isSelected ? 'bg-slate-100' : 'bg-slate-100/60'}`}>
              <AgentIcon name={agent.iconType} size={18} />
            </div>
            <div className="flex flex-col min-w-0">
              <span className={`text-xs truncate ${isSelected ? 'font-semibold text-slate-900' : 'font-medium text-slate-600'}`}>
                {agent.title}
              </span>
              <span className="text-[10px] text-slate-400 truncate">
                {agent.sub}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
