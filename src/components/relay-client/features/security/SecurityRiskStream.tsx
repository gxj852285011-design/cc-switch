import React from 'react';
import type { SecurityVendor } from '../../core/store/useRelayStore';

interface SecurityRiskStreamProps {
  vendor: SecurityVendor;
  isPassedExpanded: boolean;
  onTogglePassed: () => void;
}

export const SecurityRiskStream: React.FC<SecurityRiskStreamProps> = ({
  vendor,
  isPassedExpanded,
  onTogglePassed
}) => {
  if (vendor === 'google') {
    return (
      <div id="sec-right-google" className="w-full min-h-[320px] flex flex-col gap-2.5 box-border">
        {/* 分组 1: 需要立即处理 */}
        <div className="w-full">
          <div className="text-[11px] font-semibold text-slate-400 mb-1.5 tracking-wide">
            <span>需要立即处理</span>
          </div>
          <div className="w-full bg-white rounded-2xl border border-slate-200/80 p-3.5 shadow-2xs relative overflow-hidden flex flex-col gap-1.5">
            <div className="absolute left-0 top-0 bottom-0 w-[3.5px] bg-rose-500"></div>
            <div className="flex items-center justify-between pl-1">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-rose-500 stroke-[2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10"/>
                  <path strokeLinecap="round" strokeLinejoin="round" d="m15 9-6 6m0-6 6 6"/>
                </svg>
                <span className="font-bold text-[13px] text-slate-900">IPv6 漏路由排查</span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-50 text-rose-600 border border-rose-200/60">高危</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed pl-1 m-0">
              检测到本机 IPv6 直连 Google 边缘节点，将直接暴露物理 IP，导致 Gemini API 报 403 Forbidden 封禁！
            </p>
          </div>
        </div>

        {/* 分组 2: 建议排查 */}
        <div className="w-full">
          <div className="text-[11px] font-semibold text-slate-400 mb-1.5 tracking-wide">
            <span>建议排查</span>
          </div>
          <div className="grid grid-cols-2 gap-3 w-full">
            <div className="bg-white rounded-2xl border border-slate-200/80 p-3.5 shadow-2xs relative overflow-hidden flex flex-col gap-1.5">
              <div className="absolute left-0 top-0 bottom-0 w-[3.5px] bg-amber-500"></div>
              <div className="flex items-center justify-between pl-1">
                <div className="flex items-center gap-2">
                  <span className="text-amber-500 font-bold">⚠️</span>
                  <span className="font-bold text-[13px] text-slate-900">Google 专用 DNS 与 SNI 防污染</span>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200/60">警告</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed pl-1 m-0">
                <code className="font-mono text-slate-800 bg-slate-100 px-1 py-0.5 rounded text-[11px]">generativelanguage.googleapis.com</code> 偶现命中本地解析器，建议锁定 Google 安全 DNS (8.8.8.8)。
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/80 p-3.5 shadow-2xs relative overflow-hidden flex flex-col gap-1.5">
              <div className="absolute left-0 top-0 bottom-0 w-[3.5px] bg-amber-500"></div>
              <div className="flex items-center justify-between pl-1">
                <div className="flex items-center gap-2">
                  <span className="text-amber-500 font-bold">🌐</span>
                  <span className="font-bold text-[13px] text-slate-900">OAuth 令牌认证出口</span>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200/60">警告</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed pl-1 m-0">
                <code className="font-mono text-slate-800 bg-slate-100 px-1 py-0.5 rounded text-[11px]">accounts.google.com</code> 授权会话保持在相同美国 IP 网段内，建议开启长连接心跳保活。
              </p>
            </div>
          </div>
        </div>

        {/* 分组 3: 通过项折叠 */}
        <div className="w-full">
          <div 
            role="button"
            tabIndex={0}
            aria-expanded={isPassedExpanded}
            onClick={onTogglePassed}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onTogglePassed();
              }
            }}
            className="w-full bg-white hover:bg-slate-50/80 rounded-2xl border border-slate-200/80 px-4 py-2.5 shadow-2xs flex items-center justify-between cursor-pointer transition-all select-none"
          >
            <div className="flex items-center gap-2 text-emerald-600 font-semibold text-xs">
              <span className="text-emerald-500 font-bold">✔</span>
              <span>4 项检测通过</span>
            </div>
            <div className="flex items-center gap-1 text-slate-400 text-xs">
              <span>{isPassedExpanded ? '收起详情' : '展开详情'}</span>
              <span className="text-[10px]">{isPassedExpanded ? '▲' : '▼'}</span>
            </div>
          </div>
          {isPassedExpanded && (
            <div className="flex flex-col gap-1.5 mt-2 transition-all">
              <div className="flex items-center justify-between px-3 py-2 bg-white rounded-xl border border-slate-200/60 text-xs">
                <span className="font-medium text-slate-800">✔ Google AI 官方区域准入 (Region Availability)</span>
                <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-medium text-[10px]">US 许可区</span>
              </div>
              <div className="flex items-center justify-between px-3 py-2 bg-white rounded-xl border border-slate-200/60 text-xs">
                <span className="font-medium text-slate-800">✔ 出口 ASN 干净度 (AS15169 Google LLC)</span>
                <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-medium text-[10px]">洁净原生</span>
              </div>
              <div className="flex items-center justify-between px-3 py-2 bg-white rounded-xl border border-slate-200/60 text-xs">
                <span className="font-medium text-slate-800">✔ gRPC & HTTP/2 长连接稳定性</span>
                <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-medium text-[10px]">24ms 极速</span>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div id="sec-right-claude" className="w-full min-h-[320px] flex flex-col gap-2.5 box-border">
      {/* 分组 1: 需要立即处理 */}
      <div className="w-full">
        <div className="text-[11px] font-semibold text-slate-400 mb-1.5 tracking-wide">
          <span>需要立即处理</span>
        </div>
        <div className="w-full bg-white rounded-2xl border border-slate-200/80 p-3.5 shadow-2xs relative overflow-hidden flex flex-col gap-1.5">
          <div className="absolute left-0 top-0 bottom-0 w-[3.5px] bg-rose-500"></div>
          <div className="flex items-center justify-between pl-1">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-rose-500 stroke-[2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10"/>
                <path strokeLinecap="round" strokeLinejoin="round" d="m15 9-6 6m0-6 6 6"/>
              </svg>
              <span className="font-bold text-[13px] text-slate-900">IPv6 旁路裸连穿透</span>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-50 text-rose-600 border border-rose-200/60">高危</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed pl-1 m-0">
            客户端 TUN 拦截未覆盖全部 IPv6 流量，本地联通 IPv6 正在直连 Cloudflare / Anthropic——这是国内用户被 403 封号的最常见原因。请关闭 IPv6 或添加路由规则。
          </p>
        </div>
      </div>

      {/* 分组 2: 建议排查 */}
      <div className="w-full">
        <div className="text-[11px] font-semibold text-slate-400 mb-1.5 tracking-wide">
          <span>建议排查</span>
        </div>
        <div className="grid grid-cols-2 gap-3 w-full">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-3.5 shadow-2xs relative overflow-hidden flex flex-col gap-1.5">
            <div className="absolute left-0 top-0 bottom-0 w-[3.5px] bg-amber-500"></div>
            <div className="flex items-center justify-between pl-1">
              <div className="flex items-center gap-2">
                <span className="text-amber-500 font-bold">⚠️</span>
                <span className="font-bold text-[13px] text-slate-900">出口一致性</span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200/60">警告</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed pl-1 m-0">
              业务出口 <code className="font-mono text-slate-800 bg-slate-100 px-1 py-0.5 rounded text-[11px]">2a09:bac1:... (WARP US)</code> 与检测页出口（IPv4 常规节点）分流不统一，易被标记为异地会话。
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 p-3.5 shadow-2xs relative overflow-hidden flex flex-col gap-1.5">
            <div className="absolute left-0 top-0 bottom-0 w-[3.5px] bg-amber-500"></div>
            <div className="flex items-center justify-between pl-1">
              <div className="flex items-center gap-2">
                <span className="text-amber-500 font-bold">🕒</span>
                <span className="font-bold text-[13px] text-slate-900">时区语言环境</span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200/60">警告</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed pl-1 m-0">
              系统时区 UTC+8，出口节点 UTC-7，时差 15 小时。浏览器语言若仍为 <code className="font-mono text-slate-800 bg-slate-100 px-1 py-0.5 rounded text-[11px]">zh-CN</code>，易触发异地登录风控。
            </p>
          </div>
        </div>
      </div>

      {/* 分组 3: 通过项折叠 */}
      <div className="w-full">
        <div 
          role="button"
          tabIndex={0}
          aria-expanded={isPassedExpanded}
          onClick={onTogglePassed}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onTogglePassed();
            }
          }}
          className="w-full bg-white hover:bg-slate-50/80 rounded-2xl border border-slate-200/80 px-4 py-2.5 shadow-2xs flex items-center justify-between cursor-pointer transition-all select-none"
        >
          <div className="flex items-center gap-2 text-emerald-600 font-semibold text-xs">
            <span className="text-emerald-500 font-bold">✔</span>
            <span>3 项检测通过</span>
          </div>
          <div className="flex items-center gap-1 text-slate-400 text-xs">
            <span>{isPassedExpanded ? '收起详情' : '展开详情'}</span>
            <span className="text-[10px]">{isPassedExpanded ? '▲' : '▼'}</span>
          </div>
        </div>
        {isPassedExpanded && (
          <div className="flex flex-col gap-1.5 mt-2 transition-all">
            <div className="flex items-center justify-between px-3 py-2 bg-white rounded-xl border border-slate-200/60 text-xs">
              <span className="font-medium text-slate-800">✔ 国内直连 IP 保护 (规则分流) 163.125.167.92 深圳联通</span>
              <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-medium text-[10px]">正常直连</span>
            </div>
            <div className="flex items-center justify-between px-3 py-2 bg-white rounded-xl border border-slate-200/60 text-xs">
              <span className="font-medium text-slate-800">✔ WebRTC STUN 穿透检测 (公网 IP 已被代理接管)</span>
              <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-medium text-[10px]">映射安全</span>
            </div>
            <div className="flex items-center justify-between px-3 py-2 bg-white rounded-xl border border-slate-200/60 text-xs">
              <span className="font-medium text-slate-800">✔ NetBird WireGuard 隧道 (100.64.0.12 · 零解密 Direct P2P)</span>
              <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-medium text-[10px]">活跃加密</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
