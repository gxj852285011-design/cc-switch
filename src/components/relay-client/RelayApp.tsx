import React from 'react';
import { useRelayStore } from './core/store/useRelayStore';
import { CATEGORY_TABS } from './core/constants/agents';
import { Sidebar } from './features/workspace/Sidebar';
import { AgentGrid } from './features/workspace/AgentGrid';
import { MiniAgentRail } from './features/workspace/MiniAgentRail';
import { AgentDrawer } from './features/workspace/AgentDrawer';
import { SecuritySummaryCard } from './features/security/SecuritySummaryCard';
import { SecurityRiskStream } from './features/security/SecurityRiskStream';
import { PinnedFooterBar } from './features/security/PinnedFooterBar';
import { DeviceTableView } from './features/devices/DeviceTableView';
import { AuthCenterModal } from './features/auth/AuthCenterModal';
export const RelayApp: React.FC = () => {
  const store = useRelayStore();
  const activeExitNode = store.activeExitNode;

  return (
    <div className="w-[1150px] h-[750px] bg-[#EFF0F5] rounded-[32px] border border-white/60 shadow-2xl flex overflow-hidden select-none relative font-sans text-slate-800">
      {/* 1. 全局导航侧边栏 */}
      <Sidebar
        viewMode={store.viewMode}
        onSetViewMode={store.setViewMode}
        isLoggedIn={store.isLoggedIn}
        onOpenAuthModal={() => store.setIsAuthModalOpen(true)}
      />

      {/* 2. 主视区容器 */}
      <main className="flex-1 flex flex-col bg-[#F8F9FC]/70 relative overflow-hidden">
        {/* 顶栏控制组 */}
        <header className="w-full h-14 px-8 flex items-center justify-between border-b border-slate-200/60 flex-shrink-0">
          <div className="flex items-center gap-3">
            {store.viewMode === 'uninstalled_config' && (
              <button
                onClick={store.closeDrawer}
                className="h-8 px-3 rounded-xl bg-white border border-slate-200/80 text-xs font-medium text-slate-600 hover:text-slate-900 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                ← 返回首页
              </button>
            )}
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              {store.viewMode === 'home' || store.viewMode === 'uninstalled_config'
                ? 'AI Agent 工作台'
                : store.viewMode === 'devices'
                ? '多设备密钥网格'
                : '出口安全与区域准入'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono bg-white border border-slate-200/80 text-slate-600">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              NetBird P2P: 100.64.0.12
            </span>
          </div>
        </header>

        {/* 视图分发区 */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {/* A. 首页与抽屉展开视图 */}
          {(store.viewMode === 'home' || store.viewMode === 'uninstalled_config') && (
            <div className="flex-1 flex flex-col p-8 box-border overflow-hidden">
              {store.viewMode === 'home' && (
                <div className="flex items-center gap-2 mb-6 flex-wrap">
                  {CATEGORY_TABS.map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => store.setSelectedCategory(tab.id)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                        store.selectedCategory === tab.id
                          ? 'bg-[#1E293B] text-white shadow-xs'
                          : 'bg-white/60 hover:bg-white text-slate-600 border border-slate-200/60'
                      }`}
                    >
                      {tab.label} <span className="opacity-60 text-[10px] ml-0.5">({tab.count})</span>
                    </button>
                  ))}
                </div>
              )}

              <div className="flex-1 flex gap-5 overflow-hidden">
                {store.viewMode === 'home' ? (
                  <div className="flex-1 overflow-y-auto no-scrollbar pr-1">
                    <AgentGrid
                      agents={store.agents}
                      selectedCategory={store.selectedCategory}
                      onSelectAgent={store.selectCard}
                    />
                  </div>
                ) : (
                  <>
                    <MiniAgentRail
                      agents={store.agents}
                      selectedCardId={store.selectedCardId}
                      onSelectAgent={store.setSelectedCardId}
                    />
                    <AgentDrawer
                      agent={store.selectedAgent}
                      onClose={store.closeDrawer}
                      onInstall={store.installAgent}
                      onShowToast={store.showToast}
                    />
                  </>
                )}
              </div>
            </div>
          )}

          {/* B. 设备管理视图 */}
          {store.viewMode === 'devices' && (
            <DeviceTableView
              devices={store.devices}
              selectedDeviceId={store.selectedDeviceId}
              onSelectDevice={store.setSelectedDeviceId}
              deviceKeys={store.deviceKeys}
              onToggleKey={store.toggleDeviceKey}
              onShowToast={store.showToast}
            />
          )}

          {/* C. 出口防封中心 */}
          {store.viewMode === 'security' && (
            <div id="view-security" className="flex-1 flex flex-col justify-between box-border overflow-hidden">
              <div className="w-full px-8 pt-5 pb-3 flex flex-row items-center justify-between box-border flex-shrink-0">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-3">
                    <h1 className="text-[22px] font-bold text-slate-900 tracking-tight leading-none m-0">
                      {store.securityVendor === 'claude' ? 'Claude 出口防封中心' : 'Google AI 区域准入中心'}
                    </h1>
                    <div className="flex items-center p-0.5 bg-slate-200/70 rounded-full text-[11px] font-medium ml-1">
                      <button
                        id="sec-tab-btn-claude"
                        onClick={() => store.switchSecurityVendor('claude')}
                        className={`px-3 py-1 rounded-full transition-all cursor-pointer whitespace-nowrap ${
                          store.securityVendor === 'claude' ? 'bg-amber-500 text-white font-medium' : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Claude 403
                      </button>
                      <button
                        id="sec-tab-btn-google"
                        onClick={() => store.switchSecurityVendor('google')}
                        className={`px-3 py-1 rounded-full transition-all cursor-pointer whitespace-nowrap ${
                          store.securityVendor === 'google' ? 'bg-blue-600 text-white font-medium' : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Google AI
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 font-normal m-0">
                    {store.securityVendor === 'claude' ? 'claude403 焚决标准 · 实时监控生效中' : 'Gemini / DeepMind 官方准入规范 · 实时监控生效中'}
                  </p>
                </div>

                <div className="flex items-center gap-2.5">
                  <button
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText('NetBird WireGuard Zero-Trust Egress Report');
                        store.showToast('📋 已复制只读检测报告，可直接发送给运维排查');
                      } catch {
                        store.showToast('⚠️ 剪贴板访问受限，请手动复制报告');
                      }
                    }}
                    className="h-9 px-3.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs whitespace-nowrap"
                  >
                    <span>📋 复制报告</span>
                  </button>
                  <button
                    id="btn-run-diagnostics"
                    onClick={store.runDiagnostics}
                    disabled={store.isDiagnosing}
                    className="h-9 px-4 rounded-xl bg-[#1E293B] hover:bg-[#0F172A] active:scale-95 text-white text-xs font-medium flex items-center gap-2 transition-all cursor-pointer shadow-xs whitespace-nowrap"
                  >
                    <span>{store.isDiagnosing ? '检测中...' : '重新检测'}</span>
                  </button>
                </div>
              </div>

              <div className="w-full flex-1 px-8 pb-3 pt-1 flex flex-col gap-2.5 box-border overflow-y-auto no-scrollbar">
                <SecuritySummaryCard vendor={store.securityVendor} />
                <SecurityRiskStream
                  vendor={store.securityVendor}
                  isPassedExpanded={store.securityVendor === 'claude' ? store.isPassedExpanded : store.isGooglePassedExpanded}
                  onTogglePassed={store.togglePassed}
                />
              </div>

              <PinnedFooterBar
                activeExitNodeName={activeExitNode.name}
                onSwitchExitNode={store.switchExitNode}
              />
            </div>
          )}
        </div>
      </main>

      {/* 3. 模态弹窗与 Toast */}
      <AuthCenterModal
        isOpen={store.isAuthModalOpen}
        onClose={() => store.setIsAuthModalOpen(false)}
        isLoggedIn={store.isLoggedIn}
        currentSystemToken={store.systemToken}
        onSaveToken={store.saveAuthToken}
        onLogout={store.logout}
        onShowToast={store.showToast}
      />

      {store.toastMessage && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 bg-[#0F172A] text-white rounded-full text-xs font-medium border border-white/20 shadow-xl flex items-center gap-2 animate-bounce">
          {store.toastMessage}
        </div>
      )}
    </div>
  );
};
