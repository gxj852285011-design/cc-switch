import React from 'react';
import type { DeviceKeyModel, DEVICES } from '../../core/constants/agents';
import { AgentIcon } from '../../core/constants/icons';

interface DeviceTableViewProps {
  devices: typeof DEVICES;
  selectedDeviceId: number;
  onSelectDevice: (id: number) => void;
  deviceKeys: DeviceKeyModel[];
  onToggleKey: (keyId: string, currentStatus: DeviceKeyModel['status']) => void;
  onShowToast: (msg: string) => void;
}

export const DeviceTableView: React.FC<DeviceTableViewProps> = ({
  devices,
  selectedDeviceId,
  onSelectDevice,
  deviceKeys,
  onToggleKey,
  onShowToast
}) => {
  return (
    <div className="w-full flex-1 flex flex-col p-6 box-border overflow-hidden">
      {/* 顶部标题与说明 */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200/80 mb-5">
        <div className="flex flex-col">
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">已绑定设备与凭证管理</h2>
          <p className="text-xs text-slate-400 mt-1">
            Octopus X 零信任安全网格：支持在云端针对单台设备或单个工具实时停用密钥
          </p>
        </div>
      </div>

      <div className="flex-1 flex gap-6 overflow-hidden">
        {/* 左侧设备选择器 */}
        <div className="w-[240px] flex-shrink-0 flex flex-col gap-2">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
            设备列表
          </span>
          {devices.map(dev => {
            const isSelected = dev.id === selectedDeviceId;
            return (
              <div
                key={dev.id}
                onClick={() => onSelectDevice(dev.id)}
                className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                  isSelected
                    ? 'bg-white border-slate-300 shadow-xs'
                    : 'bg-white/40 hover:bg-white/70 border-transparent hover:border-slate-200'
                }`}
              >
                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5">
                    <span className={`text-xs ${isSelected ? 'font-semibold text-slate-900' : 'font-medium text-slate-600'}`}>
                      {dev.name}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 mt-0.5">
                    {dev.keysCount} 个活跃专线 Key
                  </span>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                  dev.status === 'online' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'
                }`}>
                  {dev.status === 'online' ? '在线' : '离线'}
                </span>
              </div>
            );
          })}
        </div>

        {/* 右侧专属密钥与安全开关 */}
        <div className="flex-1 bg-white rounded-3xl border border-slate-200/80 p-5 shadow-2xs flex flex-col overflow-hidden">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
            <span className="text-xs font-semibold text-slate-700">当前设备授权密钥</span>
            <span className="text-[11px] text-slate-400">点击右侧开关即可远程冻结/解冻</span>
          </div>

          <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col gap-2.5">
            {deviceKeys.map(item => {
              const isActive = item.status === 'active';
              return (
                <div
                  key={item.id}
                  className="p-3.5 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 flex items-center justify-between transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-white border border-slate-200/60 flex items-center justify-center p-2">
                      <AgentIcon name={item.iconType} size={20} />
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900 text-xs">{item.title}</span>
                        <span className={`px-1.5 py-0.2 rounded text-[10px] font-mono ${
                          isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-500'
                        }`}>
                          {isActive ? '生效中' : '已停用'}
                        </span>
                      </div>
                      <span 
                        onClick={() => {
                          navigator.clipboard.writeText(item.key).catch(() => {});
                          onShowToast('📋 密钥已复制到剪贴板');
                        }}
                        className="font-mono text-[11px] text-slate-400 hover:text-slate-600 cursor-pointer"
                        title="点击复制"
                      >
                        {item.key}
                      </span>
                    </div>
                  </div>

                  {/* 远程 Switch 开关 */}
                  <div className="flex items-center gap-3">
                    <button
                      role="switch"
                      aria-checked={isActive}
                      aria-label={`切换 ${item.title} 密钥状态`}
                      onClick={() => onToggleKey(item.keyId, item.status)}
                      className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                        isActive ? 'bg-[#1E293B]' : 'bg-slate-200'
                      }`}
                    >
                      <div
                        className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                          isActive ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
