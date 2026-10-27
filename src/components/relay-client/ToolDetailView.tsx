import React, { useState } from 'react';
import { ToolItem, UserRelayAccount } from './types';
import { CheckCircle2, Copy, Download, ExternalLink, Terminal, Check } from 'lucide-react';

interface ToolDetailViewProps {
  tool: ToolItem;
  account: UserRelayAccount;
  onApplyConfig: (tool: ToolItem) => void;
  onInstallComplete: (tool: ToolItem) => void;
  onLaunch: (tool: ToolItem) => void;
}

export const ToolDetailView: React.FC<ToolDetailViewProps> = ({
  tool,
  account,
  onApplyConfig,
  onInstallComplete,
  onLaunch,
}) => {
  const [copied, setCopied] = useState(false);
  const [installing, setInstalling] = useState(false);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSimulateInstall = () => {
    setInstalling(true);
    setTimeout(() => {
      setInstalling(false);
      onInstallComplete(tool);
    }, 1800);
  };

  return (
    <div className="rounded-2xl p-5 flex flex-col justify-between bg-white border border-slate-200/90 shadow-md h-full">
      {/* 头部标题与类型 */}
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center font-bold text-slate-800 text-sm">
              {tool.name.slice(0, 1)}
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900">{tool.name}</h3>
              <p className="text-[10px] text-slate-400 font-mono">
                {tool.configPath || (tool.type === 'cli' ? '命令行 CLI' : '桌面应用程序')}
              </p>
            </div>
          </div>
          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
            tool.status === 'ready' 
              ? 'bg-emerald-50 text-emerald-700'
              : tool.status === 'unconfigured'
              ? 'bg-amber-50 text-amber-700'
              : 'bg-slate-100 text-slate-600'
          }`}>
            {tool.status === 'ready' ? 'API 正常' : tool.status === 'unconfigured' ? '待配置' : '未就绪'}
          </span>
        </div>

        {/* 状态 1: 未安装 - 本地安装 (CLI) */}
        {tool.status === 'uninstalled-cli' && (
          <div className="space-y-3 mt-4">
            <div className="p-2.5 rounded-lg bg-emerald-50/70 border border-emerald-100 flex items-center justify-between text-xs">
              <span className="text-emerald-800 flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                前置环境: Node.js (已就绪 v20.11)
              </span>
              <span className="text-[10px] text-emerald-600 font-mono">OK</span>
            </div>

            <div className="space-y-1.5">
              <div className="text-[11px] font-medium text-slate-700">自动或手动执行安装命令：</div>
              <div className="p-2.5 rounded-lg bg-slate-900 text-slate-100 font-mono text-[11px] flex items-center justify-between">
                <span>{tool.installCommand || 'npm install -g @anthropic-ai/claude-code'}</span>
                <button
                  onClick={() => handleCopy(tool.installCommand || 'npm install -g @anthropic-ai/claude-code')}
                  className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? '已复制' : '复制'}
                </button>
              </div>
            </div>

            <p className="text-[10px] text-slate-400 leading-normal">
              提示：若安装遇到 EACCES 权限错误，macOS 请前缀 <code>sudo</code> 执行。
            </p>
          </div>
        )}

        {/* 状态 2: 未安装 - 官网引导 (GUI) */}
        {tool.status === 'uninstalled-gui' && (
          <div className="space-y-3 mt-6 text-center py-4">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 mx-auto flex items-center justify-center text-slate-700">
              <Download className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-800">需下载官方桌面客户端</h4>
              <p className="text-[11px] text-slate-500 mt-1 max-w-sm mx-auto">
                该工具为独立 GUI 桌面程序，无法通过命令行静默安装。请前往官网下载对应安装包安装后刷新。
              </p>
            </div>
          </div>
        )}

        {/* 状态 3: 未配置 (Unconfigured Form) */}
        {tool.status === 'unconfigured' && (
          <div className="space-y-3 mt-3.5">
            <div>
              <label className="text-[10px] font-medium text-slate-600">中转 API 节点 (Base URL)</label>
              <input
                type="text"
                readOnly
                value="https://api.overseas-relay.io/v1"
                className="w-full mt-1 px-3 py-1.5 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[10px] font-medium text-slate-600">授权 API Key (自动提取自中转账号)</label>
              <input
                type="password"
                readOnly
                value={account.token}
                className="w-full mt-1 px-3 py-1.5 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[10px] font-medium text-slate-600">默认推荐模型</label>
              <select className="w-full mt-1 px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700">
                <option>claude-3-7-sonnet-latest (推荐全新编程模型)</option>
                <option>claude-3-5-sonnet-20241022</option>
                <option>deepseek-reasoner</option>
              </select>
            </div>
          </div>
        )}

        {/* 状态 4: API 正常 (Figma 5 项绿勾健康清单) */}
        {tool.status === 'ready' && (
          <div className="space-y-2 mt-3.5">
            <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
              <span className="flex items-center gap-2 text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                本地 CLI 版本: @anthropic-ai/claude-code v0.2.29
              </span>
              <span className="text-[10px] text-slate-400">已就绪</span>
            </div>

            <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
              <span className="flex items-center gap-2 text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                中转线路端点: {account.currentGateway} ({account.gatewayLatencyMs}ms)
              </span>
              <span className="text-[10px] text-emerald-600 font-medium">极佳</span>
            </div>

            <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
              <span className="flex items-center gap-2 text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                环境变量注入: ANTHROPIC_BASE_URL 已绑定
              </span>
              <span className="text-[10px] text-slate-400">已持久化</span>
            </div>

            <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
              <span className="flex items-center gap-2 text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                模型权限检测: claude-3-7-sonnet 可用
              </span>
              <span className="text-[10px] text-slate-400">全功能</span>
            </div>

            <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
              <span className="flex items-center gap-2 text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                账号可用余额: ${account.balanceUsd.toFixed(2)} (无并发限制)
              </span>
              <span className="text-[10px] text-indigo-600 font-semibold">充沛</span>
            </div>
          </div>
        )}
      </div>

      {/* 底部主按钮操作区 */}
      <div className="pt-3">
        {tool.status === 'ready' && (
          <button
            onClick={() => onLaunch(tool)}
            className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs shadow-md flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
          >
            <Terminal className="w-4 h-4 text-emerald-400" />
            <span>立即拉起终端启动 {tool.name}</span>
          </button>
        )}

        {tool.status === 'unconfigured' && (
          <button
            onClick={() => onApplyConfig(tool)}
            className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs shadow-md transition-all active:scale-[0.98]"
          >
            写入配置文件并验证
          </button>
        )}

        {tool.status === 'uninstalled-cli' && (
          <div className="flex gap-2">
            <button
              disabled={installing}
              onClick={handleSimulateInstall}
              className="flex-1 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs shadow-sm flex items-center justify-center gap-1.5 transition-all"
            >
              {installing ? '正在执行安装...' : '一键为我自动安装'}
            </button>
            <button
              onClick={() => onInstallComplete(tool)}
              className="px-3 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium"
            >
              重新检测
            </button>
          </div>
        )}

        {tool.status === 'uninstalled-gui' && (
          <div className="flex gap-2">
            <button
              onClick={() => window.open(tool.officialUrl || 'https://claude.ai/download', '_blank')}
              className="flex-1 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs shadow-sm flex items-center justify-center gap-1.5 transition-all"
            >
              <span>前往官网下载</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onInstallComplete(tool)}
              className="px-3 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium"
            >
              我已安装
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
