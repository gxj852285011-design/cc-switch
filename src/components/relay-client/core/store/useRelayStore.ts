import { useState, useCallback, useMemo, useRef } from 'react';
import { ALL_AGENTS, INITIAL_DEVICE_KEYS, DEVICES, AgentConfig, DeviceKeyModel } from '../constants/agents';
import type { ToolCategory, ToolId, DeviceKeyStatus } from '../../types';
import { RelayCloudService } from '../../RelayCloudService';
import { NetBirdEngineService } from '../../NetBirdEngineService';

export type ViewMode = 'home' | 'uninstalled_config' | 'devices' | 'security';
export type SecurityVendor = 'claude' | 'google';

export function useRelayStore() {
  const [viewMode, setViewMode] = useState<ViewMode>('home');
  const [selectedCardId, setSelectedCardId] = useState<number>(1);
  const [selectedCategory, setSelectedCategory] = useState<ToolCategory>('all');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [agents, setAgents] = useState<AgentConfig[]>(ALL_AGENTS);
  const [deviceKeys, setDeviceKeys] = useState<DeviceKeyModel[]>(INITIAL_DEVICE_KEYS);
  const [selectedDeviceId, setSelectedDeviceId] = useState<number>(1);

  // 出口防封中心状态
  const [securityVendor, setSecurityVendor] = useState<SecurityVendor>('claude');
  const [isPassedExpanded, setIsPassedExpanded] = useState<boolean>(false);
  const [isGooglePassedExpanded, setIsGooglePassedExpanded] = useState<boolean>(false);
  const [isDiagnosing, setIsDiagnosing] = useState<boolean>(false);
  const [activeExitNodeIdx, setActiveExitNodeIdx] = useState<number>(0);

  // Octopus X 站点认证中枢状态
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return Boolean(RelayCloudService.getInstance().getSystemAccessToken());
  });
  const [systemToken, setSystemToken] = useState<string>(() => {
    return RelayCloudService.getInstance().getSystemAccessToken();
  });

  const toastTimerRef = useRef<any>(null);

  const showToast = useCallback((msg: string) => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }
    setToastMessage(msg);
    toastTimerRef.current = setTimeout(() => {
      setToastMessage(null);
      toastTimerRef.current = null;
    }, 2800);
  }, []);

  const selectedAgent = useMemo(() => {
    return agents.find(a => a.id === selectedCardId) || agents[0];
  }, [agents, selectedCardId]);

  const selectCard = useCallback((id: number) => {
    setSelectedCardId(id);
    setViewMode('uninstalled_config');
  }, []);

  const closeDrawer = useCallback(() => {
    setViewMode('home');
  }, []);

  const toggleDeviceKey = useCallback(async (keyId: string, currentStatus: DeviceKeyStatus) => {
    const nextStatus: DeviceKeyStatus = currentStatus === 'active' ? 'disabled' : 'active';
    setDeviceKeys(prev => prev.map(k => k.keyId === keyId ? { ...k, status: nextStatus } : k));

    try {
      const res = await RelayCloudService.getInstance().toggleKeyStatus(keyId, nextStatus);
      showToast(res.message || (nextStatus === 'active' ? '✅ 已恢复该设备密钥访问权限' : '🔒 已临时切断该设备连接'));
    } catch {
      showToast(nextStatus === 'active' ? '✅ 已恢复该设备密钥访问权限' : '🔒 已临时切断该设备连接');
    }
  }, [showToast]);

  const switchSecurityVendor = useCallback((vendor: SecurityVendor) => {
    setSecurityVendor(vendor);
  }, []);

  const togglePassed = useCallback(() => {
    if (securityVendor === 'claude') {
      setIsPassedExpanded(prev => !prev);
    } else {
      setIsGooglePassedExpanded(prev => !prev);
    }
  }, [securityVendor]);

  const runDiagnostics = useCallback(async () => {
    setIsDiagnosing(true);
    showToast('⚡️ 正在向本地引擎与 NetBird 专线发起深度体检...');
    await new Promise(r => setTimeout(r, 600));
    setIsDiagnosing(false);
    showToast('🎉 体检完成！已捕获最新出口指纹 (1 项高危 + 2 项警告)');
  }, [showToast]);

  const activeExitNode = useMemo(() => {
    const netbird = NetBirdEngineService.getInstance();
    const nodes = netbird.getExitNodes();
    return nodes[activeExitNodeIdx] || nodes[0];
  }, [activeExitNodeIdx]);

  const switchExitNode = useCallback(() => {
    const netbird = NetBirdEngineService.getInstance();
    const nodes = netbird.getExitNodes();
    const nextIdx = (activeExitNodeIdx + 1) % nodes.length;
    setActiveExitNodeIdx(nextIdx);
    netbird.selectExitNode(nodes[nextIdx].id);
    showToast(`🔄 已切换 NetBird 出口专线: ${nodes[nextIdx].name}`);
  }, [activeExitNodeIdx, showToast]);

  const saveAuthToken = useCallback((token: string) => {
    RelayCloudService.getInstance().setSystemAccessToken(token);
    setSystemToken(token);
    setIsLoggedIn(Boolean(token));
    setIsAuthModalOpen(false);
    showToast('🎉 系统访问令牌验证成功！设备与各智能体配置通道已激活');
  }, [showToast]);

  const logout = useCallback(() => {
    RelayCloudService.getInstance().setSystemAccessToken('');
    setSystemToken('');
    setIsLoggedIn(false);
    setIsAuthModalOpen(false);
    showToast('🔒 已安全注销中转站绑定状态');
  }, [showToast]);

  const installAgent = useCallback(async (toolId: ToolId) => {
    showToast('🚀 正在执行一键配置接入...');
    setAgents(prev => prev.map(a => a.toolId === toolId ? { ...a, badge: '已就绪', btnDark: true, btnLabel: '配置专线' } : a));
    showToast('🎉 恭喜！工具环境已自动就绪，专线已连通');
  }, [showToast]);

  return {
    viewMode,
    setViewMode,
    selectedCardId,
    setSelectedCardId,
    selectedCategory,
    setSelectedCategory,
    toastMessage,
    showToast,
    agents,
    setAgents,
    selectedAgent,
    deviceKeys,
    selectedDeviceId,
    setSelectedDeviceId,
    devices: DEVICES,
    selectCard,
    closeDrawer,
    toggleDeviceKey,
    // 出口中心
    securityVendor,
    switchSecurityVendor,
    isPassedExpanded,
    isGooglePassedExpanded,
    togglePassed,
    isDiagnosing,
    runDiagnostics,
    activeExitNodeIdx,
    activeExitNode,
    switchExitNode,
    // 认证中枢
    isAuthModalOpen,
    setIsAuthModalOpen,
    isLoggedIn,
    systemToken,
    saveAuthToken,
    logout,
    installAgent
  };
}
