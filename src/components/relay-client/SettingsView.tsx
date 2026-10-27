import React, { useState } from 'react';
import { UserRelayAccount } from './types';
import { ExternalLink, RefreshCw } from 'lucide-react';

interface SettingsViewProps {
  account: UserRelayAccount;
  onRefreshBalance?: () => void;
  onGatewayChange?: (gw: string) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  account,
  onRefreshBalance,
  onGatewayChange,
}) => {
  const [autoLaunch, setAutoLaunch] = useState(true);
  const [wslSync, setWslSync] = useState(true);
  const [minimizeToTray, setMinimizeToTray] = useState(true);
  const [selectedGateway, setSelectedGateway] = useState('hk');

  return (
    <div className="grid grid-cols-12 gap-6 w-full h-full">
      {/* 左侧：账户配额看板 */}
      <div className="col-span-12 md:col-span-5 rounded-2xl p-5 flex flex-col justify-between bg-white border border-slate-200/90 shadow-md">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm shadow-md">
              VIP
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">{account.vipTier} · 专属账户</h3>
              <p className="text-[11px] text-slate-400 font-mono">user_id: {account.userId}</p>
            </div>
          </div>

          {/* 额度余额看板 */}
          <div className="p-3.5 rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 space-y-2">
            <div className="flex items-center justify-between text-xs text-indigo-900">
              <span className="font-medium">中转账户可用余额</span>
              <button
                onClick={onRefreshBalance}
                className="text-[10px] text-indigo-600 hover:text-indigo-800 flex items-center gap-1 font-medium"
              >
                <RefreshCw className="w-3 h-3" />
                刷新
              </button>
            </div>
            <div className="text-2xl font-black text-slate-900 tracking-tight">
              ${account.balanceUsd.toFixed(2)} <span className="text-xs font-normal text-slate-500">USD</span>
            </div>
            <div className="w-full bg-indigo-200/60 h-1.5 rounded-full overflow-hidden">
              <div className="bg-indigo-600 h-full rounded-full" style={{ width: '68%' }}></div>
            </div>
            <div className="text-[10px] text-slate-500 flex justify-between">
              <span>本月已用: ${account.monthUsedUsd.toFixed(2)}</span>
              <span>有效期: 永久不过期</span>
            </div>
          </div>

          {/* 专线通知公告 */}
          <div className="p-2.5 rounded-lg bg-amber-50/80 border border-amber-200 text-[11px] text-amber-800 space-y-1">
            <div className="font-semibold flex items-center gap-1">
              <span>📢 海外站专线通知</span>
            </div>
            <p className="text-[10px] text-amber-700 leading-normal">
              全新 Claude 3.7 Sonnet 已就绪，默认接入 Coding 专属通道，支持 128k 超大输出。
            </p>
          </div>
        </div>

        <button
          onClick={() => window.open('https://your-relay-domain.com/dashboard', '_blank')}
          className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-colors flex items-center justify-center gap-1.5"
        >
          <span>前往网页控制台充值 / 查看明细</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 右侧：2x2 设置选项卡片 */}
      <div className="col-span-12 md:col-span-7 grid grid-cols-2 gap-3.5">
        
        {/* 设置项 1: 开机自启 */}
        <div className="rounded-xl p-3.5 flex flex-col justify-between bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="text-xs font-bold text-slate-800">开机自动启动</h4>
              <p className="text-[10px] text-slate-400 mt-0.5">登录系统时自动驻留托盘</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={autoLaunch}
                onChange={(e) => setAutoLaunch(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-slate-900"></div>
            </label>
          </div>
          <span className="text-[10px] text-slate-400 mt-3 pt-2 border-t border-slate-100">
            开机守护各 Agent 环境变量
          </span>
        </div>

        {/* 设置项 2: 专线测速与切换 */}
        <div className="rounded-xl p-3.5 flex flex-col justify-between bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="text-xs font-bold text-slate-800">中转线路节点</h4>
              <p className="text-[10px] text-slate-400 mt-0.5">优选低延迟专线</p>
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          </div>
          <div className="mt-2">
            <select
              value={selectedGateway}
              onChange={(e) => {
                setSelectedGateway(e.target.value);
                onGatewayChange?.(e.target.value);
              }}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-1 font-medium text-slate-700"
            >
              <option value="hk">🇭🇰 香港高防专线 (68ms)</option>
              <option value="jp">🇯🇵 东京直连线路 (82ms)</option>
              <option value="us">🇺🇸 美西硅谷专线 (140ms)</option>
              <option value="sg">🇸🇬 新加坡核心节点 (75ms)</option>
            </select>
          </div>
        </div>

        {/* 设置项 3: WSL 环境同步 */}
        <div className="rounded-xl p-3.5 flex flex-col justify-between bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="text-xs font-bold text-slate-800">WSL 环境穿透</h4>
              <p className="text-[10px] text-slate-400 mt-0.5">跨系统同步 Linux 子环境配置</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={wslSync}
                onChange={(e) => setWslSync(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-slate-900"></div>
            </label>
          </div>
          <span className="text-[10px] text-slate-400 mt-3 pt-2 border-t border-slate-100">
            自动探测 \\wsl$\Ubuntu 路径
          </span>
        </div>

        {/* 设置项 4: 托盘与窗口行为 */}
        <div className="rounded-xl p-3.5 flex flex-col justify-between bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="text-xs font-bold text-slate-800">关闭窗口至托盘</h4>
              <p className="text-[10px] text-slate-400 mt-0.5">保持后台静默运行</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={minimizeToTray}
                onChange={(e) => setMinimizeToTray(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-slate-900"></div>
            </label>
          </div>
          <span className="text-[10px] text-slate-400 mt-3 pt-2 border-t border-slate-100">
            随时一键呼出管理面板
          </span>
        </div>

      </div>
    </div>
  );
};
