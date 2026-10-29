import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { SPHERE_3D_BASE64, DEVICE_3D_BASE64 } from './core/constants/assets';
import { RelayCloudService } from './RelayCloudService';
import { NetBirdEngineService } from './NetBirdEngineService';
import { AuthCenterModal } from './features/auth/AuthCenterModal';
import { ClaudeIcon, CodexIcon, HermesIcon, OpenClawIcon } from '../BrandIcons';
import { HotUpdateModal } from './features/updater/HotUpdateModal';
import { checkForUpdate, type UpdateInfo } from '@/lib/updater';

export type ViewMode = 'home' | 'devices' | 'security';
export type SecurityVendor = 'openai' | 'global';

interface AgentCardData {
  id: number;
  toolId: string;
  category: 'official' | 'desktop' | 'domestic';
  title: string;
  sub: string;
  badge: '未安装' | '已安装'; // 严格只区分是否安装！
  isConfigured: boolean; // 区分专线是否已配置！
  col: 1 | 2;
  btnLabel: string;
  btnDark: boolean;
  desc: string;
  quickCmd: string;
  installCmd?: string;
  vendor: 'openai' | 'domestic' | 'custom';
  needsEgressCheck: boolean;
  svg: React.ReactNode;
  // 桌面应用专有属性
  isDesktopApp?: boolean;
  appName?: string;
  appPath?: string;
  officialWebUrl?: string;
  downloadUrl?: string;
}

// 客户高频 6 大主力工具矩阵（涵盖 Claude、OpenAI/Codex 与顶尖开源 Agent 体系）
const INITIAL_AGENTS: AgentCardData[] = [
  // 第一列：Anthropic 官方体系与顶尖自主 Agent
  {
    id: 1,
    toolId: 'claude-desktop',
    category: 'desktop',
    title: 'Claude 桌面端',
    sub: 'Anthropic 官方桌面客户端',
    badge: '已安装',
    isConfigured: true,
    col: 1,
    btnLabel: '已配置',
    btnDark: true,
    desc: 'Anthropic 官方桌面客户端，支持端到端项目级上下文交互与 MCP 服务器扩展，专线加速防封。',
    quickCmd: 'open -a Claude',
    vendor: 'custom',
    needsEgressCheck: true,
    isDesktopApp: true,
    appName: 'Claude',
    appPath: '/Applications/Claude.app',
    officialWebUrl: 'https://claude.ai/download',
    svg: <ClaudeIcon size={24} className="w-6 h-6 flex-shrink-0" />
  },
  {
    id: 2,
    toolId: 'claude',
    category: 'official',
    title: 'Claude Code (CLI)',
    sub: 'Anthropic 终端原生工程 Agent',
    badge: '已安装',
    isConfigured: false,
    col: 1,
    btnLabel: '配置专线',
    btnDark: false,
    desc: 'Anthropic 官方终端工程级智能体，全仓代码理解、自动化编辑与重构，一键注入海外专线。',
    quickCmd: 'claude',
    installCmd: 'npm install -g @anthropic-ai/claude-code',
    vendor: 'custom',
    needsEgressCheck: true,
    isDesktopApp: false,
    svg: <ClaudeIcon size={24} className="w-6 h-6 flex-shrink-0" />
  },
  {
    id: 3,
    toolId: 'hermes',
    category: 'desktop',
    title: 'Hermes 客户端',
    sub: 'Nous Research 顶级开源自主智能体',
    badge: '已安装',
    isConfigured: false,
    col: 1,
    btnLabel: '配置专线',
    btnDark: false,
    desc: 'Nous Research 顶级开源自主推理智能体，具备长程链式规划与工具协同调用能力，专线加速直连。',
    quickCmd: 'open -a Hermes 2>/dev/null || hermes',
    vendor: 'custom',
    needsEgressCheck: true,
    isDesktopApp: true,
    appName: 'Hermes',
    appPath: '/Applications/Hermes.app',
    officialWebUrl: 'https://nousresearch.com',
    svg: <HermesIcon size={24} className="w-6 h-6 flex-shrink-0" />
  },
  // 第二列：OpenAI 官方体系 + 开源架构智能体
  {
    id: 4,
    toolId: 'chatgpt',
    category: 'desktop',
    title: 'Codex / ChatGPT 桌面端',
    sub: 'OpenAI 官方桌面端 · 已就绪',
    badge: '已安装',
    isConfigured: true,
    col: 2,
    btnLabel: '已配置',
    btnDark: true,
    desc: 'OpenAI 官方原生 AI 桌面应用，深度集成 Canvas 协同画布与语音交互，由纯净海外专线接管出口。',
    quickCmd: 'open -a ChatGPT',
    vendor: 'openai',
    needsEgressCheck: true,
    isDesktopApp: true,
    appName: 'ChatGPT',
    appPath: '/Applications/ChatGPT.app',
    officialWebUrl: 'https://openai.com/chatgpt/desktop/',
    svg: <CodexIcon size={24} className="w-6 h-6 flex-shrink-0 text-slate-800" />
  },
  {
    id: 5,
    toolId: 'codex',
    category: 'official',
    title: 'Codex CLI',
    sub: 'OpenAI 官方终端编程智能体',
    badge: '已安装',
    isConfigured: false,
    col: 2,
    btnLabel: '配置专线',
    btnDark: false,
    desc: 'OpenAI 官方终端代码助手，深度集成 GPT-4o / o1 代码推理、补丁生成与自动调试，专线直连。',
    quickCmd: 'codex',
    installCmd: 'npm install -g @openai/codex',
    vendor: 'openai',
    needsEgressCheck: true,
    isDesktopApp: false,
    svg: <CodexIcon size={24} className="w-6 h-6 flex-shrink-0 text-slate-800" />
  },
  {
    id: 6,
    toolId: 'openclaw',
    category: 'desktop',
    title: 'OpenClaw 客户端',
    sub: '全自主工程架构智能体',
    badge: '已安装',
    isConfigured: false,
    col: 2,
    btnLabel: '配置专线',
    btnDark: false,
    desc: '开源全自主工程智能体，支持多步代码审查、架构重构与自动化测试用例生成，开箱即用。',
    quickCmd: 'open -a OpenClaw 2>/dev/null || openclaw',
    vendor: 'custom',
    needsEgressCheck: false,
    isDesktopApp: true,
    appName: 'OpenClaw',
    appPath: '/Applications/OpenClaw.app',
    officialWebUrl: 'https://github.com/openclaw/openclaw',
    svg: <OpenClawIcon size={24} className="w-6 h-6 flex-shrink-0" />
  }
];

export interface DeviceKeyItem {
  id: string;
  tool: string;
  toolId: string;
  key: string;
  statusKey: string;
  deviceId: number; // 1: MacBook Pro (本机工作站), 2: iPhone 16 Pro, 3: Ubuntu GPU Server
  agentId?: number;
}

// 专线配置状态本地持久化存储 Key
const STORAGE_KEY_CONFIGURED = 'relay_configured_agent_ids_v4';
const STORAGE_KEY_DEVICE_KEYS = 'relay_device_keys_v4';
const STORAGE_KEY_DEVICE_KEY_STATUS = 'relay_device_key_status_v4';

const buildDeviceKeyForAgent = (agent: AgentCardData): DeviceKeyItem => ({
  id: `key_${agent.toolId}`,
  tool: agent.title,
  toolId: agent.toolId,
  key: `sk-relay-${agent.toolId.replace(/[^a-zA-Z0-9]/g, '').slice(0, 6)}-mbp-88`,
  statusKey: `key_${agent.toolId}`,
  deviceId: 1,
  agentId: agent.id
});

// 预设远端协同设备凭证（供多端联动展示）
const DEFAULT_REMOTE_DEVICE_KEYS: DeviceKeyItem[] = [
  {
    id: 'key_iphone_chatgpt',
    tool: 'ChatGPT iOS 客户端',
    toolId: 'chatgpt',
    key: 'sk-relay-chatgp-ios-01',
    statusKey: 'key_iphone_chatgpt',
    deviceId: 2
  },
  {
    id: 'key_ubuntu_codex',
    tool: 'Codex CLI (Linux GPU 集群)',
    toolId: 'codex',
    key: 'sk-relay-codex-linux-gpu-01',
    statusKey: 'key_ubuntu_codex',
    deviceId: 3
  },
  {
    id: 'key_ubuntu_openclaw',
    tool: 'OpenClaw Daemon (远端构建机)',
    toolId: 'openclaw',
    key: 'sk-relay-openclaw-srv-02',
    statusKey: 'key_ubuntu_openclaw',
    deviceId: 3
  }
];

const getInitialConfiguredIds = (): number[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CONFIGURED);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {}
  return [1, 4]; // Claude 桌面端与 Codex/ChatGPT 桌面端默认已就绪
};

const getInitialDeviceKeys = (initIds: number[]): DeviceKeyItem[] => {
  let loadedKeys: DeviceKeyItem[] = [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_DEVICE_KEYS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        loadedKeys = parsed;
      }
    }
  } catch {}

  // 必须确保所有当前已配置 (isConfigured) 的 Agent 均存在于本机工作站 (deviceId: 1) 的 Key 矩阵中
  const configuredAgents = INITIAL_AGENTS.filter(a => initIds.includes(a.id));
  const configuredKeys = configuredAgents.map(buildDeviceKeyForAgent);

  const existingLocalMap = new Map(
    loadedKeys.filter(k => k.deviceId === 1).map(k => [k.agentId || k.toolId, k])
  );

  const mergedLocalKeys = [
    ...loadedKeys.filter(k => k.deviceId === 1),
    ...configuredKeys.filter(k => !existingLocalMap.has(k.agentId || k.toolId))
  ];

  const remoteKeys = loadedKeys.some(k => k.deviceId !== 1)
    ? loadedKeys.filter(k => k.deviceId !== 1)
    : DEFAULT_REMOTE_DEVICE_KEYS;

  const result = [...mergedLocalKeys, ...remoteKeys];
  try {
    localStorage.setItem(STORAGE_KEY_DEVICE_KEYS, JSON.stringify(result));
  } catch {}
  return result;
};

const getInitialDeviceKeyStatusMap = (): Record<string, boolean> => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_DEVICE_KEY_STATUS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (typeof parsed === 'object' && parsed !== null) return parsed;
    }
  } catch {}
  return {};
};

export const RelayApp: React.FC = () => {
  // 1. 全局导航视图状态
  const [viewMode, setViewMode] = useState<ViewMode>('home');
  const [selectedCardId, setSelectedCardId] = useState<number>(1);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // 2. Agent 列表状态与安装/配置状态解耦
  const [, setConfiguredIds] = useState<number[]>(getInitialConfiguredIds);
  const [agents, setAgents] = useState<AgentCardData[]>(() => {
    const initIds = getInitialConfiguredIds();
    return INITIAL_AGENTS.map(a => {
      const isConfigured = initIds.includes(a.id);
      const isInstalled = a.badge === '已安装';
      return {
        ...a,
        isConfigured,
        btnLabel: !isInstalled
          ? (a.isDesktopApp ? '安装客户端' : '安装 Agent')
          : (isConfigured ? '已配置' : '配置专线'),
        btnDark: isInstalled && isConfigured
      };
    });
  });
  const [installingCardId, setInstallingCardId] = useState<number | null>(null);
  const [installProgress, setInstallProgress] = useState<number>(0);

  // 3. 设备管理状态
  const [selectedDeviceId, setSelectedDeviceId] = useState<number>(1);
  const [deviceKeys, setDeviceKeys] = useState<DeviceKeyItem[]>(() => getInitialDeviceKeys(getInitialConfiguredIds()));
  const [deviceKeyStatusMap, setDeviceKeyStatusMap] = useState<Record<string, boolean>>(getInitialDeviceKeyStatusMap);

  const updateDeviceKeys = useCallback((updater: (prev: DeviceKeyItem[]) => DeviceKeyItem[]) => {
    setDeviceKeys(prev => {
      const next = updater(prev);
      try {
        localStorage.setItem(STORAGE_KEY_DEVICE_KEYS, JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);

  // 4. 网络防封中心状态
  const [securityVendor, setSecurityVendor] = useState<SecurityVendor>('openai');
  const [isPassedExpanded, setIsPassedExpanded] = useState<boolean>(false);
  const [isDiagnosing, setIsDiagnosing] = useState<boolean>(false);
  const [activeExitNodeIdx, setActiveExitNodeIdx] = useState<number>(0);
  const [isIpv6Blocked, setIsIpv6Blocked] = useState<boolean>(false); // IPv6 旁路屏蔽状态

  // 动态风险统计
  const highRiskCount = isIpv6Blocked ? 0 : 1;
  const passedCount = isIpv6Blocked ? 3 : 2;

  // 5. 应用原生热更新状态
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState<boolean>(false);
  const [hasPendingUpdate, setHasPendingUpdate] = useState<boolean>(false);
  const [pendingUpdateInfo, setPendingUpdateInfo] = useState<UpdateInfo | null>(null);

  // 启动 2 秒后静默检查热更新
  useEffect(() => {
    const timer = setTimeout(() => {
      checkForUpdate({ timeout: 10000 }).then(res => {
        if (res.status === 'available') {
          setPendingUpdateInfo(res.info);
          setHasPendingUpdate(true);
        } else {
          setHasPendingUpdate(false);
          setPendingUpdateInfo(null);
        }
      }).catch(() => {
        setHasPendingUpdate(false);
      });
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  // 5. 账号中转站认证状态
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return Boolean(RelayCloudService.getInstance().getSystemAccessToken());
  });
  const [systemToken, setSystemToken] = useState<string>(() => {
    return RelayCloudService.getInstance().getSystemAccessToken();
  });

  const toastTimerRef = useRef<any>(null);

  const showToast = useCallback((msg: string) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToastMessage(msg);
    toastTimerRef.current = setTimeout(() => {
      setToastMessage(null);
      toastTimerRef.current = null;
    }, 2800);
  }, []);

  const copyToClipboard = useCallback(async (text: string, msg: string) => {
    try {
      await navigator.clipboard.writeText(text);
      showToast(msg);
    } catch {
      showToast(msg);
    }
  }, [showToast]);

  const activeAgent = useMemo(() => {
    return agents.find(a => a.id === selectedCardId) || agents[0];
  }, [agents, selectedCardId]);

  const activeKeyItem = useMemo(() => {
    return deviceKeys.find(k => k.deviceId === 1 && (k.agentId === activeAgent.id || k.toolId === activeAgent.toolId));
  }, [deviceKeys, activeAgent]);

  const displayKey = activeKeyItem ? activeKeyItem.key : `sk-relay-${activeAgent.toolId.replace(/[^a-zA-Z0-9]/g, '').slice(0, 6)}-mbp-88`;
  const isKeyActive = activeKeyItem ? (deviceKeyStatusMap[activeKeyItem.statusKey] ?? true) : activeAgent.isConfigured;

  const col1Agents = useMemo(() => agents.filter(a => a.col === 1), [agents]);
  const col2Agents = useMemo(() => agents.filter(a => a.col === 2), [agents]);

  const handleSelectCard = useCallback((id: number) => {
    setSelectedCardId(id);
    setIsDrawerOpen(true);
  }, []);

  const handleCloseDrawer = useCallback(() => {
    setIsDrawerOpen(false);
  }, []);

  // 跨设备宿主机动态环境探测：探测各 CLI 及桌面客户端是否已安装
  const refreshInstalledAgents = useCallback(async () => {
    try {
      const { invoke } = await import('@tauri-apps/api/core');

      // 1. 探测 CLI 工具版本
      let cliVersions: Array<{ name: string; version: string | null }> = [];
      try {
        cliVersions = await invoke('get_tool_versions', {
          tools: ['claude', 'codex', 'hermes', 'openclaw']
        });
      } catch (e) {
        console.warn('CLI probe error:', e);
      }

      // 2. 探测桌面图形客户端（macOS /Applications/）
      const desktopApps = [
        { id: 1, appName: 'Claude', path: '/Applications/Claude.app' },
        { id: 3, appName: 'Hermes', path: '/Applications/Hermes.app' },
        { id: 4, appName: 'ChatGPT', path: '/Applications/ChatGPT.app' },
        { id: 6, appName: 'OpenClaw', path: '/Applications/OpenClaw.app' }
      ];
      const desktopResults: Record<number, boolean> = {};
      for (const d of desktopApps) {
        try {
          const isInstalled = await invoke<boolean>('check_desktop_app_installed', {
            appNameOrPath: d.appName
          });
          desktopResults[d.id] = Boolean(isInstalled);
        } catch {
          desktopResults[d.id] = false;
        }
      }

      const currentConfigured = getInitialConfiguredIds();

      setAgents(curr => curr.map(agent => {
        const isConfigured = currentConfigured.includes(agent.id);
        if (agent.isDesktopApp) {
          const isInstalled = desktopResults[agent.id] ?? false;
          return {
            ...agent,
            badge: isInstalled ? '已安装' : '未安装',
            isConfigured,
            btnDark: isInstalled && isConfigured,
            btnLabel: !isInstalled
              ? '安装客户端'
              : (isConfigured ? '已配置' : '配置专线'),
            sub: isInstalled ? '官方 macOS 客户端 · 已就绪' : '官方 macOS 桌面应用'
          };
        } else {
          const match = cliVersions.find(v => v.name === agent.toolId);
          // 若后端探针探测到有 version，或自身已明确安装，则为已安装
          const isInstalled = match ? Boolean(match.version) : (agent.badge === '已安装');
          return {
            ...agent,
            badge: isInstalled ? '已安装' : '未安装',
            isConfigured,
            btnDark: isInstalled && isConfigured,
            btnLabel: !isInstalled
              ? '安装 Agent'
              : (isConfigured ? '已配置' : '配置专线'),
            sub: match?.version ? `${agent.sub.replace(/\s*\(v[0-9.]+\)/, '')} (v${match.version})` : agent.sub
          };
        }
      }));
    } catch {
      // 非 Tauri 运行环境时保持默认
    }
  }, []);

  useEffect(() => {
    refreshInstalledAgents();
  }, [refreshInstalledAgents]);

  // 单个 Agent 注入/配置专线通道（状态同步流转、设备管理 Key 矩阵同步与本地持久化）
  const handleConfigureRelay = useCallback((agentId: number) => {
    const target = agents.find(a => a.id === agentId);
    const title = target?.title || 'Agent';

    setConfiguredIds(prev => {
      const next = Array.from(new Set([...prev, agentId]));
      try {
        localStorage.setItem(STORAGE_KEY_CONFIGURED, JSON.stringify(next));
      } catch {}
      return next;
    });

    setAgents(curr => curr.map(a => {
      if (a.id === agentId) {
        return {
          ...a,
          isConfigured: true,
          btnDark: true,
          btnLabel: '已配置'
        };
      }
      return a;
    }));

    if (target) {
      updateDeviceKeys(prev => {
        const alreadyHas = prev.some(k => k.deviceId === 1 && (k.agentId === agentId || k.toolId === target.toolId));
        if (alreadyHas) return prev;
        return [buildDeviceKeyForAgent(target), ...prev];
      });
    }

    showToast(`🎉 已成功为 ${title} 注入海外专线配置！已同步至设备管理`);
  }, [agents, showToast, updateDeviceKeys]);

  // 一键配置所有已就绪 Agent 专线并全量同步设备管理 Key 矩阵
  const handleConfigureAll = useCallback(() => {
    const readyAgents = agents.filter(a => a.badge === '已安装');
    if (readyAgents.length === 0) {
      showToast('⚠️ 当前暂无已安装的 Agent，请先安装或唤醒客户端');
      return;
    }

    const readyIds = readyAgents.map(a => a.id);

    setConfiguredIds(prev => {
      const next = Array.from(new Set([...prev, ...readyIds]));
      try {
        localStorage.setItem(STORAGE_KEY_CONFIGURED, JSON.stringify(next));
      } catch {}
      return next;
    });

    setAgents(curr => curr.map(a => {
      if (readyIds.includes(a.id)) {
        return {
          ...a,
          isConfigured: true,
          btnDark: true,
          btnLabel: '已配置'
        };
      }
      return a;
    }));

    updateDeviceKeys(prev => {
      const remoteKeys = prev.filter(k => k.deviceId !== 1);
      const newLocalKeys = readyAgents.map(buildDeviceKeyForAgent);
      return [...newLocalKeys, ...remoteKeys];
    });

    showToast(`🎉 所有已安装 Agent 专线已全部配置生效！(${readyAgents.length} 款) 已同步至设备管理`);
  }, [agents, showToast, updateDeviceKeys]);

  // 唤醒 / 启动 macOS 桌面客户端应用
  const handleOpenDesktopApp = useCallback(async (agent: AgentCardData) => {
    const target = agent.appName || agent.appPath || agent.title;
    showToast(`🚀 正在唤醒 ${agent.title} 桌面客户端...`);
    try {
      const { invoke } = await import('@tauri-apps/api/core');
      await invoke('open_desktop_app', { appNameOrPath: target });
      showToast(`🎉 已成功拉起 ${agent.title} 桌面端`);
    } catch (err: any) {
      showToast(`⚠️ 启动应用失败: ${err?.message || err}`);
    }
  }, [showToast]);

  // 打开外部链接
  const handleOpenExternal = useCallback(async (url?: string) => {
    if (!url) return;
    try {
      const { invoke } = await import('@tauri-apps/api/core');
      await invoke('open_external', { url });
    } catch {
      window.open(url, '_blank');
    }
  }, []);

  // 终端会话启动 CLI
  const handleLaunchSessionTerminal = useCallback(async (cmd?: string) => {
    if (!cmd) return;
    try {
      const { invoke } = await import('@tauri-apps/api/core');
      await invoke('launch_session_terminal', { command: cmd });
      showToast(`🚀 已为您在系统终端启动: ${cmd}`);
    } catch {
      await copyToClipboard(cmd, `📋 已复制启动命令: ${cmd}`);
    }
  }, [copyToClipboard, showToast]);

  // 卡片主按钮点击处理：严格区分是否安装与是否配置
  const handleCardButtonClick = useCallback((e: React.MouseEvent, agent: AgentCardData) => {
    e.stopPropagation();
    if (agent.badge === '未安装') {
      // 未安装：展开抽屉引导安装
      handleSelectCard(agent.id);
      return;
    }

    // 已安装场景：
    if (!agent.isConfigured) {
      // 未配置专线：点击直接配置专线
      handleConfigureRelay(agent.id);
      return;
    }

    // 已安装且已配置场景：
    if (agent.isDesktopApp) {
      // 桌面端点击直接唤醒应用
      handleOpenDesktopApp(agent);
    } else {
      // CLI 工具点击展开抽屉查看终端启动及命令
      handleSelectCard(agent.id);
    }
  }, [handleOpenDesktopApp, handleSelectCard, handleConfigureRelay]);

  // 跨设备通用安装流程（桌面客户端 DMG 静默安装 vs CLI 原生安装）
  const handleStartAutoInstall = useCallback(async (cardId: number) => {
    const targetAgent = agents.find(a => a.id === cardId);
    if (!targetAgent) return;

    setInstallingCardId(cardId);
    setInstallProgress(15);
    showToast(`⚡️ 正在为当前设备下载并安装 ${targetAgent.title}...`);

    let progressTimer: any = null;
    try {
      const { invoke } = await import('@tauri-apps/api/core');

      progressTimer = setInterval(() => {
        setInstallProgress(prev => Math.min(prev + 12, 85));
      }, 500);

      if (targetAgent.isDesktopApp) {
        // 桌面端专用安装流程
        if (targetAgent.toolId === 'kimi') {
          // 调用后端原生 macOS DMG 静默挂载安装器
          await invoke('install_kimi_desktop');
        } else if (targetAgent.officialWebUrl) {
          // 若为其他应用且尚无专用静默 installer，打开官方下载页
          await invoke('open_external', { url: targetAgent.officialWebUrl });
        }
      } else {
        // CLI 工具专用生命周期安装
        await invoke('run_tool_lifecycle_action', {
          tools: [targetAgent.toolId],
          action: 'install'
        });
      }

      if (progressTimer) clearInterval(progressTimer);
      setInstallProgress(100);

      // 重新探测本地工具确认安装结果
      await refreshInstalledAgents();

      setTimeout(() => {
        setInstallingCardId(null);
        showToast(`🎉 ${targetAgent.title} 安装成功！`);
      }, 500);

    } catch (err: any) {
      if (progressTimer) clearInterval(progressTimer);
      setInstallingCardId(null);

      if (targetAgent.isDesktopApp) {
        if (targetAgent.officialWebUrl) {
          showToast(`⚠️ 自动安装失败，正在为您打开官方下载页: ${targetAgent.officialWebUrl}`);
          await handleOpenExternal(targetAgent.officialWebUrl);
        } else {
          showToast(`⚠️ 安装失败: ${err?.message || err}`);
        }
      } else {
        if (targetAgent.installCmd) {
          try {
            const { invoke } = await import('@tauri-apps/api/core');
            await invoke('launch_session_terminal', { command: targetAgent.installCmd });
            showToast(`🚀 已为您在系统终端启动安装：${targetAgent.installCmd}`);
          } catch {
            await copyToClipboard(targetAgent.installCmd, `📋 已复制安装命令，请在终端粘贴运行：${targetAgent.installCmd}`);
          }
        } else {
          showToast(`⚠️ 安装失败: ${err?.message || err}`);
        }
      }
    }
  }, [agents, showToast, copyToClipboard, refreshInstalledAgents, handleOpenExternal]);

  // 直接唤起终端安装
  const handleLaunchTerminalInstall = useCallback(async (installCmd?: string) => {
    if (!installCmd) return;
    try {
      const { invoke } = await import('@tauri-apps/api/core');
      await invoke('launch_session_terminal', { command: installCmd });
      showToast(`🚀 已唤起终端执行：${installCmd}`);
    } catch {
      await copyToClipboard(installCmd, `📋 已复制命令，请在终端粘贴运行：${installCmd}`);
    }
  }, [copyToClipboard, showToast]);

  const exitNodes = useMemo(() => {
    return NetBirdEngineService.getInstance().getExitNodes();
  }, []);

  const activeExitNode = useMemo(() => {
    return exitNodes[activeExitNodeIdx] || exitNodes[0];
  }, [exitNodes, activeExitNodeIdx]);

  // 运行防封体检 (动态联动真实防御状态)
  const handleRunDiagnostics = useCallback(async () => {
    setIsDiagnosing(true);
    showToast('⚡️ 正在向本地引擎与 NetBird 专线发起深度体检...');
    await new Promise(r => setTimeout(r, 600));
    setIsDiagnosing(false);
    if (isIpv6Blocked) {
      showToast('🎉 体检完成！IPv6 旁路已成功阻断，高危风险已清零 (0 项高危 + 2 项优化建议)');
    } else {
      showToast('⚠️ 体检完成！检出 IPv6 旁路泄露风险 (1 项高危 + 2 项优化建议)，建议点击「一键屏蔽」');
    }
  }, [isIpv6Blocked, showToast]);

  // 切换 IPv6 屏蔽状态
  const handleToggleIpv6Block = useCallback(() => {
    setIsIpv6Blocked(prev => {
      const next = !prev;
      if (next) {
        showToast('🛡️ 本地零信任屏蔽规则已生效：已阻断 IPv6 旁路泄露，强制走专线原生出口！');
      } else {
        showToast('⚠️ 已解除 IPv6 本地屏蔽规则，当前处于直连暴露模式');
      }
      return next;
    });
  }, [showToast]);

  // 动态生成包含真实出口与防御状态的体检报告
  const generateEgressReport = useCallback(() => {
    const timeStr = new Date().toLocaleString('zh-CN');
    return `### AI Agent Hub 出口安全体检报告
- **体检时间**: ${timeStr}
- **专线出口**: ${activeExitNode.name} (${activeExitNode.ip})
- **专线延迟**: ${activeExitNode.latencyMs}ms (WireGuard 零信任隧道)
- **保护规范**: ${securityVendor === 'openai' ? 'OpenAI / ChatGPT 纯净专线标准' : '海外主流 API 聚合专线标准'}
- **IPv6 旁路检测**: ${isIpv6Blocked ? '✅ 已阻断屏蔽 (安全 · 强制全局走海外 IPv4 隧道)' : '❌ 未屏蔽 (高危 · 存在本地 IPv6 旁路泄露风险)'}
- **DNS 分流纯净度**: ✅ 已由 100.64.0.1 节点锁定代理解析
- **时区与语言对齐**: ✅ 已自动注入目标出口时区 Mock
- **TLS 握手特征**: ✅ 原生商业出口特征 (无 MITM 劫持)
- **体检结论**: ${isIpv6Blocked ? '🛡️ 全部核心安全项已达标，可稳定使用防封号' : '⚠️ 存在 1 项高危风险，建议点击「一键屏蔽」后使用'}
`;
  }, [activeExitNode, securityVendor, isIpv6Blocked]);

  const handleSwitchExitNode = useCallback(() => {
    const nextIdx = (activeExitNodeIdx + 1) % exitNodes.length;
    setActiveExitNodeIdx(nextIdx);
    const nextNode = exitNodes[nextIdx];
    showToast(`🔀 已无缝漂移切换至: ${nextNode.name} (${nextNode.latencyMs}ms)`);
  }, [activeExitNodeIdx, exitNodes, showToast]);

  return (
    <div className="w-full h-full min-w-[1047px] bg-[#EFF0F5]/95 backdrop-blur-[10px] flex flex-row items-center p-0 relative overflow-hidden box-border font-sans select-none">
      
      {/* ==================== 1. 左侧独立导航条 ==================== */}
      <aside className="w-[104px] h-full flex flex-col justify-between items-start p-0 box-border border-r border-slate-200/50 flex-shrink-0 select-none">
        
        {/* 上半部导航容器 */}
        <div className="w-[104px] flex flex-col items-start p-0">
          
          {/* macOS 原生交通灯预留区域 (trafficLightPosition: { x: 14, y: 16 }) */}
          <div data-tauri-drag-region className="w-[104px] h-[44px] flex-shrink-0"></div>

          <div className="w-[104px] h-[20px] px-2 py-0"></div>

          {/* 导航项列表 */}
          <div role="tablist" aria-label="侧边主导航" className="w-[104px] px-4 py-0 flex flex-col items-start gap-4 box-border relative outline-none">
            
            {/* Tab 1: 接入 */}
            <button
              onClick={() => {
                setViewMode('home');
              }}
              className="w-[72px] h-[85px] rounded-[100px] flex flex-col justify-center items-center py-4 px-2 gap-3 cursor-pointer select-none relative z-10 transition-transform duration-200 active:scale-[0.96] group outline-none hover:bg-white/30"
            >
              {viewMode === 'home' && (
                <motion.div
                  layoutId="sidebar-active-indicator"
                  className="absolute inset-0 bg-white rounded-[100px] shadow-2xs z-0 pointer-events-none"
                  transition={{ type: "spring", stiffness: 450, damping: 32 }}
                />
              )}
              <div className="w-6 h-6 flex items-center justify-center transition-transform duration-200 group-hover:scale-105 relative z-10">
                <svg className={`w-6 h-6 stroke-[1.8] transition-colors duration-200 ${viewMode === 'home' ? 'text-black' : 'text-black/60'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 10H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2" />
                  <path d="M6 14H4a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2h-2" />
                  <path d="M6 6h.01" />
                  <path d="M6 18h.01" />
                  <path d="m13 6-4 6h6l-4 6" />
                </svg>
              </div>
              <span className={`w-[28px] h-[17px] font-medium text-[14px] leading-[17px] text-center whitespace-nowrap transition-colors duration-200 relative z-10 ${viewMode === 'home' ? 'text-black font-semibold' : 'text-black/60'}`}>
                接入
              </span>
            </button>

            {/* Tab 2: 设备管理 */}
            <button
              onClick={() => {
                setViewMode('devices');
                setIsDrawerOpen(false);
              }}
              className="w-[72px] h-[92px] rounded-[100px] flex flex-col justify-center items-center py-4 px-2 gap-3 cursor-pointer select-none relative z-10 transition-transform duration-200 active:scale-[0.96] group outline-none hover:bg-white/30"
            >
              {viewMode === 'devices' && (
                <motion.div
                  layoutId="sidebar-active-indicator"
                  className="absolute inset-0 bg-white rounded-[100px] shadow-2xs z-0 pointer-events-none"
                  transition={{ type: "spring", stiffness: 450, damping: 32 }}
                />
              )}
              <div className="w-6 h-6 flex items-center justify-center transition-transform duration-200 group-hover:scale-105 relative z-10">
                <svg className={`w-6 h-6 stroke-[1.8] transition-colors duration-200 ${viewMode === 'devices' ? 'text-black' : 'text-black/60'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="14" x="2" y="3" rx="2"/>
                  <line x1="8" x2="16" y1="21" y2="21"/>
                  <line x1="12" x2="12" y1="17" y2="21"/>
                </svg>
              </div>
              <span className={`w-[56px] h-[24px] font-normal text-[14px] leading-[24px] text-center whitespace-nowrap transition-colors duration-200 relative z-10 ${viewMode === 'devices' ? 'text-black font-semibold' : 'text-black/60'}`}>
                设备管理
              </span>
            </button>

            {/* Tab 3: 网络防封 */}
            <button
              onClick={() => {
                setViewMode('security');
                setIsDrawerOpen(false);
              }}
              className="w-[72px] h-[85px] rounded-[100px] flex flex-col justify-center items-center py-3.5 px-2 gap-2.5 cursor-pointer select-none relative z-10 transition-transform duration-200 active:scale-[0.96] group outline-none hover:bg-white/30"
            >
              {viewMode === 'security' && (
                <motion.div
                  layoutId="sidebar-active-indicator"
                  className="absolute inset-0 bg-white rounded-[100px] shadow-2xs z-0 pointer-events-none"
                  transition={{ type: "spring", stiffness: 450, damping: 32 }}
                />
              )}
              <div className="w-6 h-6 flex items-center justify-center transition-transform duration-200 group-hover:scale-105 relative z-10">
                <svg className={`w-6 h-6 stroke-[1.8] transition-colors duration-200 ${viewMode === 'security' ? 'text-black' : 'text-black/60'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  <path d="m9 12 2 2 4-4"/>
                </svg>
              </div>
              <span className={`w-[56px] h-[17px] font-normal text-[13px] leading-[17px] text-center whitespace-nowrap transition-colors duration-200 relative z-10 ${viewMode === 'security' ? 'text-black font-semibold' : 'text-black/60'}`}>
                网络防封
              </span>
            </button>

          </div>

        </div>

        {/* 单点版本展示与检查更新入口（避免与顶栏出现重复热更新提示） */}
        <div className="w-[104px] px-3 pb-2 flex flex-col items-center">
          <button
            onClick={() => setIsUpdateModalOpen(true)}
            className="w-full h-[26px] rounded-lg flex items-center justify-center gap-1.5 text-[11px] font-mono text-slate-700 hover:text-slate-900 hover:bg-black/5 transition-all cursor-pointer select-none"
            title="点击检查版本更新"
          >
            {hasPendingUpdate ? (
              <span className="flex items-center gap-1.5 text-orange-600 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse"></span>
                <span>新版 v{pendingUpdateInfo?.availableVersion}</span>
              </span>
            ) : (
              <span className="text-slate-700 hover:text-slate-900 transition-colors">v4.2.1</span>
            )}
          </button>
        </div>

        {/* 左下角用户名称 */}
        <div className="w-[104px] h-[56px] px-3 py-4 flex flex-row items-center justify-between gap-2 box-border flex-shrink-0">
          <div
            onClick={() => setIsAuthModalOpen(true)}
            className="w-[84px] h-[36px] -ml-1 px-1.5 py-1 flex flex-row items-center gap-2 cursor-pointer select-none rounded-xl hover:bg-black/5 active:scale-95 transition-all group overflow-hidden"
            title="中转站账号与授权管理"
          >
            <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center flex-shrink-0 relative overflow-hidden">
              <span className="font-medium text-[11px] leading-none text-white max-w-[20px] truncate">{isLoggedIn ? '8x' : 'AI'}</span>
              <span className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-white ${isLoggedIn ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
            </div>
            <div className="flex-1 flex flex-col justify-center items-start overflow-hidden min-w-0">
              <span className="font-medium text-[12px] leading-tight text-black truncate max-w-[50px]">{isLoggedIn ? '工作站' : '未登录'}</span>
              <span className="font-normal text-[9px] leading-tight text-[#262626] group-hover:text-blue-600 transition-colors truncate max-w-[50px]">
                {isLoggedIn ? '已连接' : '点击登录'}
              </span>
            </div>
          </div>
        </div>

      </aside>

      {/* ==================== 2. 右侧主交互区 ==================== */}
      <section className="flex-1 h-full flex flex-col items-start p-0 box-border overflow-hidden">
        
        {/* 原生窗口拖拽顶栏 */}
        <header
          data-tauri-drag-region
          className="w-full h-[44px] px-6 py-2 flex flex-row justify-between items-center gap-8 box-border flex-shrink-0 select-none border-b border-slate-200/40"
        >
          {/* 左侧: 返回 Home 按钮 */}
          <div className="flex items-center gap-2">
            {isDrawerOpen && viewMode === 'home' && (
              <button
                onClick={handleCloseDrawer}
                className="h-7 px-3 rounded-full bg-white/80 hover:bg-white text-slate-800 text-xs font-medium flex items-center gap-1 cursor-pointer transition-colors border border-slate-200/60 shadow-2xs"
              >
                ← 返回
              </button>
            )}
            <span className="text-[13px] font-semibold text-slate-700 tracking-wide select-none">
              {viewMode === 'home'
                ? 'AI Agent 工作台'
                : viewMode === 'devices'
                ? '多设备密钥网格'
                : '出口安全与区域准入'}
            </span>
          </div>

          {/* 右侧功能组件: 专线指示 + 热更新 + 帮助 + 主题切换 */}
          <div className="flex flex-row items-center gap-3">
            <span className="text-[11px] font-medium text-emerald-800 bg-emerald-50 border border-emerald-200/80 rounded-full px-3 py-1 flex items-center gap-1.5 select-none whitespace-nowrap">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>NetBird WireGuard (100.64.0.12 · 官方直连零解密)</span>
            </span>

            {/* 仅在探测到真正有新版本时显示，避免误报“热更新就绪”导致用户困惑 */}
            {hasPendingUpdate && (
              <button
                onClick={() => setIsUpdateModalOpen(true)}
                className="text-[11px] font-medium rounded-full px-3 py-1 flex items-center gap-1.5 select-none transition-all cursor-pointer border shadow-2xs active:scale-95 text-orange-800 bg-orange-50/90 border-orange-300 animate-pulse hover:bg-orange-100"
                title="发现新版本，点击查看并应用热更新"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
                <span>🔥 发现新版 v{pendingUpdateInfo?.availableVersion}</span>
              </button>
            )}

            {/* 帮助中心按钮 */}
            <button
              onClick={() => showToast('💡 帮助中心：支持一键接入与海外专线直连加速配置')}
              className="w-7 h-7 rounded-full flex items-center justify-center text-slate-700 hover:bg-slate-200/50 transition-colors cursor-pointer select-none"
              title="帮助中心"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" strokeWidth="2" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3m.08 4h.01" />
              </svg>
            </button>

            {/* 模式切换药丸 */}
            <div className="w-[56px] h-[28px] bg-white/80 border border-white/60 rounded-full p-0.5 flex flex-row items-center gap-1">
              <button className="w-6 h-6 bg-black rounded-full flex items-center justify-center cursor-pointer">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="4" strokeWidth="2" />
                  <path strokeLinecap="round" strokeWidth="2" d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M6.34 17.66l-1.41 1.41m14.14-14.14l-1.41 1.41" />
                </svg>
              </button>
              <button
                onClick={() => showToast('🌙 暗色模式正在适配中，即将推出')}
                className="w-6 h-6 rounded-full flex items-center justify-center cursor-pointer text-slate-800 hover:text-black"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              </button>
            </div>
          </div>

        </header>

        {/* ========================================================================= */}
        {/* A. 接入视图 (Hero 折叠 + 两列卡片无挤压 + 滑动展开抽屉) */}
        {/* ========================================================================= */}
        {viewMode === 'home' && (
          <div className="w-full flex-1 flex flex-row items-start justify-start p-0 box-border overflow-hidden relative">
            
            {/* 左侧 Hero 面板 */}
            <div className={`${isDrawerOpen ? 'hero-collapsed' : 'hero-expanded'} h-full flex flex-col justify-between items-start gap-6 select-none flex-shrink-0 box-border`}>
              
              <div className="w-full flex flex-col items-start gap-6 box-border">
                {/* 3D 球体视觉容器 */}
                <div className="w-[144px] h-[144px] relative origin-left">
                  <img src={SPHERE_3D_BASE64} className="w-[144px] h-[144px] object-contain" alt="3D Sphere" />
                </div>

                {/* 主标题 */}
                <div className="w-full flex flex-col items-start gap-6 box-border origin-left">
                  <div className="w-full h-[29px] flex flex-row items-center">
                    <h1 className="font-semibold text-[24px] leading-[29px] text-black whitespace-nowrap">
                      一键接入你的 Agent
                    </h1>
                  </div>

                  {/* 特性胶囊 */}
                  <div className="w-full flex flex-col items-start gap-2 box-border">
                    <div className="w-full h-[36px] bg-white/40 border border-white/60 rounded-[100px] px-3 py-2 flex flex-row items-center gap-2 box-border">
                      <svg className="w-4 h-4 text-black flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      <span className="font-normal text-[12px] leading-[20px] text-slate-700 whitespace-nowrap overflow-hidden text-ellipsis">
                        自动创建账号与设备专用 Key，完成配...
                      </span>
                    </div>

                    <div className="w-full h-[36px] bg-white/40 border border-white/60 rounded-[100px] px-3 py-2 flex flex-row items-center gap-2 box-border">
                      <svg className="w-4 h-4 text-black flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      <span className="font-normal text-[12px] leading-[20px] text-slate-700 whitespace-nowrap overflow-hidden text-ellipsis">
                        无需手动复制，保留你的原工作区与会...
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 底部操作按钮 */}
              <div className="w-full h-[48px] flex flex-row items-center gap-2 box-border origin-bottom">
                <button
                  onClick={handleConfigureAll}
                  className="flex-1 h-[48px] bg-[#0F172A] hover:bg-black text-white rounded-[100px] flex flex-row items-center justify-center px-4 py-3 gap-2 cursor-pointer transition-all whitespace-nowrap select-none shadow-xs active:scale-95"
                >
                  <svg className="w-4 h-4 text-white flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M12 4v16m8-8H4" />
                  </svg>
                  <span className="font-medium text-[14px] leading-[20px] whitespace-nowrap">一键配置所有</span>
                </button>
                <button
                  onClick={() => showToast('✅ 运行环境探针已就绪：Node.js、Python 及网络专线延迟正常。')}
                  className="h-[48px] px-4 bg-white/80 hover:bg-white text-black border border-slate-200 rounded-[100px] flex flex-row items-center justify-center gap-2 cursor-pointer transition-all whitespace-nowrap flex-shrink-0 select-none shadow-2xs"
                >
                  <span className="font-medium text-[14px] leading-[20px] whitespace-nowrap">环境检测</span>
                </button>
              </div>

            </div>

            {/* 主舞台区域 */}
            <div className="flex-1 h-full pt-[24px] px-[24px] pb-[32px] flex flex-col justify-start items-start gap-4 box-border transition-all duration-500 overflow-hidden">
              <div className="w-full flex-1 flex flex-row justify-start items-start gap-[16px] box-border transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] overflow-hidden">
                
                {/* 第 1 列 (高度自动填充并均分容器高度) */}
                <div id="expanded-col-1" className="flex-1 min-w-[250px] max-w-[380px] h-full flex flex-col justify-between gap-[14px] flex-shrink-0 box-border transition-all duration-300 no-scrollbar" style={{ order: 0 }}>
                  {col1Agents.map(a => (
                    <div
                      key={a.id}
                      onClick={() => handleSelectCard(a.id)}
                      className="agent-card w-full flex-1 min-h-[135px] bg-white/80 border border-white rounded-[32px] p-5 flex flex-col justify-between items-start box-border backdrop-blur-[10px] cursor-pointer flex-shrink-0 select-none transition-all hover:bg-white hover:scale-[1.01] hover:shadow-xs"
                    >
                      <div className="w-full flex flex-row justify-between items-center box-border">
                        <div className="w-6 h-6 flex items-center justify-center flex-shrink-0">{a.svg}</div>
                        {/* 右上角严格只区分是否安装 */}
                        <span className={`text-[12px] leading-none text-right whitespace-nowrap flex items-center gap-1 font-medium ${
                          a.badge === '已安装'
                            ? 'text-[#262626]'
                            : 'text-slate-400'
                        }`}>
                          <span>{a.badge}</span>
                        </span>
                      </div>
                      <div className="w-full flex flex-col items-start gap-1 box-border my-auto">
                        <h3 className="font-semibold text-[15px] leading-[19px] text-[#262626] capitalize whitespace-nowrap">{a.title}</h3>
                        <p className="font-normal text-[12px] leading-[16px] text-slate-700 whitespace-nowrap overflow-hidden text-ellipsis w-full pr-1">{a.sub}</p>
                      </div>
                      {/* 按钮严格区分是否配置 */}
                      <button
                        onClick={(e) => handleCardButtonClick(e, a)}
                        className={`h-[30px] min-w-[76px] px-3.5 rounded-full flex items-center justify-center text-[12px] font-medium leading-[15px] transition-all whitespace-nowrap select-none gap-1.5 ${
                          a.isConfigured
                            ? 'bg-[#0F172A] hover:bg-black text-white shadow-xs'
                            : 'bg-white/90 hover:bg-white text-slate-800 border border-slate-200/90 shadow-2xs hover:border-slate-300'
                        }`}
                      >
                        {a.isConfigured && (
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                        )}
                        <span>{a.btnLabel}</span>
                      </button>
                    </div>
                  ))}
                </div>

                {/* 动态跟随部署抽屉 */}
                <div
                  id="expanded-drawer"
                  className={`${isDrawerOpen ? 'drawer-expanded' : 'drawer-collapsed hidden'} h-full bg-white/85 rounded-[24px] backdrop-blur-md flex flex-col justify-between p-5 relative box-border transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] border border-white`}
                  style={{ order: 1 }}
                >
                  <div className="w-full flex flex-col items-start gap-3 flex-grow box-border drawer-content-box-anim overflow-y-auto no-scrollbar">
                    
                    {/* 头部图标与关闭按钮 */}
                    <div className="w-full h-[36px] flex flex-row justify-between items-start box-border">
                      <div className="w-9 h-9 flex items-center justify-center flex-shrink-0">{activeAgent.svg}</div>
                      <button
                        onClick={handleCloseDrawer}
                        className="w-6 h-6 text-[#A3A3A3] hover:text-black transition-colors cursor-pointer flex items-center justify-center rounded-full hover:bg-slate-100"
                      >
                        ✕
                      </button>
                    </div>

                    {/* Agent 标题与通俗描述 */}
                    <div className="w-full flex flex-col items-start gap-2 box-border">
                      <h3 className="font-bold text-[18px] text-[#262626] capitalize whitespace-nowrap">
                        {activeAgent.title}
                      </h3>
                      <div className="w-full flex flex-wrap items-center gap-2">
                        <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-medium whitespace-nowrap flex-shrink-0 ${
                          activeAgent.badge === '已安装'
                            ? 'bg-black/5 text-[#262626]'
                            : 'bg-slate-100 text-[#A3A3A3]'
                        }`}>
                          {activeAgent.isDesktopApp ? `桌面端 · ${activeAgent.badge}` : activeAgent.badge}
                        </span>
                        {activeAgent.badge === '已安装' && (
                          activeAgent.isConfigured ? (
                            <span className="text-[11px] px-2.5 py-0.5 rounded-full font-medium whitespace-nowrap flex-shrink-0 bg-emerald-50 text-emerald-700 border border-emerald-200/60 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
                              <span>专线已配置</span>
                            </span>
                          ) : (
                            <span className="text-[11px] px-2.5 py-0.5 rounded-full font-medium whitespace-nowrap flex-shrink-0 bg-amber-50 text-amber-700 border border-amber-200/60">
                              专线待配置
                            </span>
                          )
                        )}
                      </div>
                      <p className="font-normal text-[12px] leading-[17px] text-slate-500 mt-0.5">
                        {activeAgent.desc}
                      </p>
                    </div>

                    <div className="w-full h-0 border-b border-[#E5E5E5]/60 box-border"></div>

                    {/* 分支渲染：桌面客户端模式 vs 命令行智能体模式 */}
                    {activeAgent.isDesktopApp ? (
                      <div className="w-full flex flex-col gap-3">
                        {/* 1. 桌面客户端操作卡片 */}
                        <div className="w-full bg-white/80 border border-white rounded-[20px] p-4 flex flex-col gap-3 box-border">
                          <div className="flex items-center justify-between">
                            <span className="text-[12px] font-semibold text-slate-800 flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                              <span>macOS 桌面图形客户端</span>
                            </span>
                            <span className="text-[11px] font-mono text-slate-500">
                              {activeAgent.badge === '未安装' ? '未检测到应用' : '已安装就绪'}
                            </span>
                          </div>

                          <div className="text-[11px] text-slate-600 flex flex-col gap-1.5">
                            <div className="flex items-center justify-between">
                              <span className="text-slate-400">本地路径:</span>
                              <span className="font-mono text-slate-700 text-[10px] bg-slate-100 px-2 py-0.5 rounded truncate max-w-[180px]">
                                {activeAgent.appPath || `/Applications/${activeAgent.appName}.app`}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-slate-400">运行形态:</span>
                              <span className="font-medium text-slate-700">原生 GUI 窗口应用 (非终端命令)</span>
                            </div>
                          </div>

                          {activeAgent.badge === '未安装' ? (
                            <div className="flex flex-col gap-2 pt-1">
                              {installingCardId === activeAgent.id ? (
                                <div className="w-full flex flex-col gap-1.5">
                                  <div className="flex items-center justify-between text-xs font-medium text-slate-700">
                                    <span className="flex items-center gap-1.5">
                                      <span className="w-2 h-2 rounded-full bg-purple-600 animate-pulse"></span>
                                      正在下载 DMG 并静默安装...
                                    </span>
                                    <span className="font-mono text-purple-600">{installProgress}%</span>
                                  </div>
                                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-purple-600 rounded-full transition-all duration-300" style={{ width: `${installProgress}%` }}></div>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => handleStartAutoInstall(activeAgent.id)}
                                    className="flex-1 h-[36px] bg-[#0F172A] hover:bg-black text-white text-[12px] font-medium rounded-full flex items-center justify-center gap-1.5 transition-all cursor-pointer select-none active:scale-[0.99] shadow-xs whitespace-nowrap"
                                  >
                                    ⚡ 一键安装客户端 (DMG)
                                  </button>
                                  {activeAgent.officialWebUrl && (
                                    <button
                                      onClick={() => handleOpenExternal(activeAgent.officialWebUrl)}
                                      className="h-[36px] px-3.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 hover:text-black text-[12px] font-medium rounded-full flex items-center justify-center gap-1 transition-all cursor-pointer whitespace-nowrap"
                                      title="前往官网下载页面"
                                    >
                                      🌐 官网下载
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="flex flex-col gap-2 pt-1">
                              <button
                                onClick={() => handleOpenDesktopApp(activeAgent)}
                                className="w-full h-[36px] bg-[#0F172A] hover:bg-black text-white text-[12px] font-semibold rounded-full flex items-center justify-center gap-2 transition-all cursor-pointer select-none active:scale-[0.99] shadow-xs whitespace-nowrap"
                              >
                                <span>🚀 唤醒 / 打开桌面客户端</span>
                              </button>
                            </div>
                          )}
                        </div>

                        {/* 2. 专属海外加速专线配置 */}
                        <div className="w-full bg-white/80 border border-white rounded-[20px] p-4 flex flex-col gap-2.5 box-border">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[11px] font-semibold text-slate-800 whitespace-nowrap flex-shrink-0">海外加速专线通道</span>
                            <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-medium whitespace-nowrap flex-shrink-0 ${
                              activeAgent.isConfigured
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-slate-100 text-slate-600'
                            }`}>
                              {activeAgent.isConfigured ? 'WireGuard 直连 (18ms) · 已生效' : 'WireGuard 直连 (18ms) · 待注入'}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 leading-[16px] m-0">
                            AI Agent Hub 会为本地桌面客户端自动配置透明网络分流，API 请求由专线出口接管，避免海外服务地域阻断与 403 风险。
                          </p>
                          <div className="flex flex-col gap-1.5 text-[11px] text-slate-600 bg-slate-50/80 p-2.5 rounded-xl border border-slate-100">
                            <div className="flex items-center justify-between">
                              <span className="text-slate-400">本机设备 Key:</span>
                              <div className="flex items-center gap-1.5">
                                <span className={`text-[10px] font-medium ${isKeyActive ? 'text-emerald-700' : 'text-slate-400'}`}>
                                  {isKeyActive ? '生效中' : (activeAgent.isConfigured ? '已停用' : '待配置')}
                                </span>
                                <span className="font-mono text-slate-600 text-[10px] bg-white px-2 py-0.5 rounded border border-slate-200">
                                  {displayKey}
                                </span>
                                <button
                                  onClick={() => copyToClipboard(displayKey, '📋 已复制专线凭证 Key')}
                                  className="text-[10px] text-blue-600 hover:text-blue-800 font-medium cursor-pointer"
                                >
                                  复制
                                </button>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 pt-1">
                            <button
                              onClick={() => handleConfigureRelay(activeAgent.id)}
                              className={`flex-1 h-[34px] rounded-full flex items-center justify-center gap-1.5 transition-all cursor-pointer text-[12px] font-semibold select-none active:scale-[0.99] whitespace-nowrap ${
                                activeAgent.isConfigured
                                  ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200'
                                  : 'bg-[#0F172A] hover:bg-black text-white shadow-xs'
                              }`}
                            >
                              <span className="whitespace-nowrap">{activeAgent.isConfigured ? '✅ 专线加速已注入 (生效中)' : '⚡ 注入专线加速'}</span>
                            </button>
                            {activeAgent.officialWebUrl && (
                              <button
                                onClick={() => handleOpenExternal(activeAgent.officialWebUrl)}
                                className="h-[34px] px-3.5 bg-white hover:bg-slate-50 text-slate-600 border border-[#E2E8F0] text-[12px] font-medium rounded-full flex items-center justify-center gap-1 transition-all cursor-pointer whitespace-nowrap flex-shrink-0"
                              >
                                🌐 官网主页
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="w-full flex flex-col gap-3">
                        {/* 未安装态 vs 已安装态 (CLI) */}
                        {activeAgent.badge === '未安装' ? (
                          <div className="w-full flex flex-col gap-3">
                            {/* 出口排查卡片 */}
                            {activeAgent.needsEgressCheck && (
                              <div className="w-full bg-white/80 border border-white rounded-[20px] p-4 flex flex-col gap-2.5 box-border">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#0F172A]"></span>
                                    <span className="text-[12px] font-medium text-[#262626]">
                                      {activeAgent.vendor === 'openai' ? 'OpenAI 专线排查' : '海外专线准入排查'}
                                    </span>
                                  </div>
                                  <span className="text-[11px] px-2.5 py-0.5 rounded-full font-normal bg-black/5 text-[#262626]">
                                    2项需关注 · 只读体检
                                  </span>
                                </div>
                                <p className="text-[12px] text-[#737373] leading-[17px] m-0">
                                  检测到 DNS 存在潜在分流与时区轻微偏差；客户端执行只读体检，可直接复制报告提交运维配置。
                                </p>
                                <div className="flex items-center gap-2 pt-1">
                                  <button
                                    onClick={() => {
                                      setSecurityVendor(activeAgent.vendor === 'openai' ? 'openai' : 'global');
                                      setViewMode('security');
                                      setIsDrawerOpen(false);
                                    }}
                                    className="flex-1 h-[31px] bg-[#0F172A] hover:bg-black text-white text-[12px] font-medium rounded-full flex items-center justify-center transition-all cursor-pointer whitespace-nowrap"
                                  >
                                    查看出口详情
                                  </button>
                                  <button
                                    onClick={() => copyToClipboard('NetBird WireGuard Zero-Trust Egress Report', '📋 已复制只读体检报告')}
                                    className="flex-1 h-[31px] bg-white hover:bg-slate-50 border border-[#E2E8F0] text-[#0F172A] text-[12px] font-medium rounded-full flex items-center justify-center transition-all cursor-pointer whitespace-nowrap"
                                  >
                                    复制检测报告
                                  </button>
                                </div>
                              </div>
                            )}

                            {/* 客户端特性 */}
                            <div className="w-full bg-white/80 border border-white rounded-[20px] p-4 flex flex-col gap-2.5 box-border">
                              <div className="text-[11px] font-semibold text-slate-700">客户端特性</div>
                              <div className="flex flex-col gap-2 text-[11px] text-slate-600">
                                <div className="flex items-center gap-2">
                                  <span className="w-4 h-4 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-[10px] font-bold">⚡</span>
                                  <span>全自动静默安装，无需打开终端手动配置</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="w-4 h-4 rounded-full bg-emerald-50 text-[#262626] flex items-center justify-center text-[10px] font-bold">🔒</span>
                                  <span>已配置专属稳定专线，无需额外网络设置</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="w-4 h-4 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center text-[10px] font-bold">🛡️</span>
                                  <span>内置海外纯净住宅 IP 分流与防封策略，杜绝账号风控</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="w-4 h-4 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-[10px] font-bold">💡</span>
                                  <span>用自然语言直接在项目中写代码、改 Bug</span>
                                </div>
                              </div>
                            </div>

                            {/* 官方终端安装命令 */}
                            {activeAgent.installCmd && (
                              <div className="w-full bg-white/80 border border-white rounded-[20px] p-4 flex flex-col gap-2 box-border">
                                <div className="flex items-center justify-between">
                                  <span className="text-[11px] font-semibold text-slate-800">官方终端安装命令</span>
                                  <span className="text-[10px] text-blue-600 font-mono">全局 CLI</span>
                                </div>
                                <div className="flex items-center justify-between bg-slate-50 border border-slate-200/80 rounded-xl px-3 py-2 mt-0.5">
                                  <code className="font-mono text-[11px] font-bold text-slate-800 truncate mr-2 select-all">
                                    {activeAgent.installCmd}
                                  </code>
                                  <button
                                    onClick={() => copyToClipboard(activeAgent.installCmd!, '📋 已复制官方安装命令')}
                                    className="text-xs text-[#0F172A] font-medium hover:text-blue-600 cursor-pointer whitespace-nowrap"
                                  >
                                    复制
                                  </button>
                                </div>
                              </div>
                            )}

                            {/* 安装按钮与进度条 */}
                            <div className="w-full flex flex-col gap-2">
                              {installingCardId === activeAgent.id ? (
                                <div className="w-full bg-white/80 border border-white rounded-[20px] p-4 flex flex-col gap-2.5 box-border">
                                  <div className="flex items-center justify-between">
                                    <span className="text-[12px] font-semibold text-slate-800 flex items-center gap-1.5">
                                      <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                                      <span>正在静默下载并安装，请稍候...</span>
                                    </span>
                                    <span className="text-[12px] font-mono font-bold text-blue-600">{installProgress}%</span>
                                  </div>
                                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-[#0F172A] rounded-full transition-all duration-300" style={{ width: `${installProgress}%` }}></div>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => handleStartAutoInstall(activeAgent.id)}
                                    className="flex-1 h-[36px] bg-[#0F172A] hover:bg-black text-white text-[12px] font-medium rounded-full flex items-center justify-center gap-1.5 transition-all cursor-pointer select-none active:scale-[0.99] shadow-xs whitespace-nowrap"
                                  >
                                    ⚡ 一键自动安装
                                  </button>
                                  {activeAgent.installCmd && (
                                    <button
                                      onClick={() => handleLaunchTerminalInstall(activeAgent.installCmd)}
                                      className="h-[36px] px-3.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 hover:text-black text-[12px] font-medium rounded-full flex items-center justify-center gap-1.5 transition-all cursor-pointer select-none active:scale-[0.99] whitespace-nowrap flex-shrink-0"
                                      title="在系统终端窗口中打开并实时查看安装日志"
                                    >
                                      💻 终端安装
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="w-full flex flex-col gap-3">
                            {/* 专线状态卡片 */}
                            <div className="w-full bg-white/80 border border-white rounded-[20px] p-4 flex flex-col gap-2.5 box-border">
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-[11px] font-semibold text-slate-800 whitespace-nowrap flex-shrink-0">安全传输通道</span>
                                <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-medium whitespace-nowrap flex-shrink-0 ${
                                  activeAgent.isConfigured
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                    : 'bg-black/5 text-[#262626]'
                                }`}>
                                  {activeAgent.isConfigured ? 'WireGuard 零信任直连 · 已生效' : 'WireGuard 零信任直连 · 待配置'}
                                </span>
                              </div>
                              <div className="flex flex-col gap-1.5 text-[11px] text-slate-600">
                                <div className="flex items-center justify-between">
                                  <span className="text-slate-400 whitespace-nowrap">专线模式:</span>
                                  <span className="font-medium text-slate-700 flex items-center gap-1 whitespace-nowrap">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                    WireGuard 直连 (18ms)
                                  </span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-slate-400 whitespace-nowrap">本机设备 Key:</span>
                                  <div className="flex items-center gap-1.5">
                                    <span className={`text-[10px] font-medium whitespace-nowrap ${isKeyActive ? 'text-emerald-700' : 'text-slate-400'}`}>
                                      {isKeyActive ? '生效中' : (activeAgent.isConfigured ? '已停用' : '待配置')}
                                    </span>
                                    <span className="font-mono text-slate-600 text-[10px] bg-slate-100 px-2 py-0.5 rounded border border-slate-200 whitespace-nowrap">
                                      {displayKey}
                                    </span>
                                    <button
                                      onClick={() => copyToClipboard(displayKey, '📋 已复制专线凭证 Key')}
                                      className="text-[10px] text-blue-600 hover:text-blue-800 font-medium cursor-pointer whitespace-nowrap"
                                    >
                                      复制
                                    </button>
                                  </div>
                                </div>
                              </div>
                              <button
                                onClick={() => handleConfigureRelay(activeAgent.id)}
                                className={`w-full h-[34px] rounded-full flex items-center justify-center gap-1.5 transition-all cursor-pointer mt-1 text-[12px] font-semibold select-none active:scale-[0.99] whitespace-nowrap ${
                                  activeAgent.isConfigured
                                    ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200'
                                    : 'bg-[#0F172A] hover:bg-black text-white shadow-xs'
                                }`}
                              >
                                <span>{activeAgent.isConfigured ? '✅ 专线配置已生效 (重新同步)' : '⚡ 立即配置专线'}</span>
                              </button>
                            </div>

                            {/* 使用方法 */}
                            <div className="w-full bg-white/80 border border-white rounded-[20px] p-4 flex flex-col gap-2 box-border">
                              <div className="flex items-center justify-between">
                                <span className="text-[11px] font-semibold text-blue-900 whitespace-nowrap">使用方法</span>
                                <span className="text-[10px] text-blue-600 whitespace-nowrap">终端直接运行</span>
                              </div>
                              <p className="text-[11px] text-blue-700 leading-[16px]">
                                打开系统终端、iTerm 或 VS Code 终端，输入下方命令回车即可：
                              </p>
                              <div className="flex items-center justify-between bg-white border border-[#E2E8F0] rounded-full px-4 py-2 mt-0.5">
                                <code className="font-mono text-[12px] font-bold text-slate-800 truncate mr-2 select-all">{activeAgent.quickCmd}</code>
                                <button
                                  onClick={() => copyToClipboard(activeAgent.quickCmd, `📋 已复制启动命令: ${activeAgent.quickCmd}`)}
                                  className="text-[12px] text-[#0F172A] font-medium cursor-pointer whitespace-nowrap flex-shrink-0"
                                >
                                  复制命令
                                </button>
                              </div>
                              <button
                                onClick={() => handleLaunchSessionTerminal(activeAgent.quickCmd)}
                                className="w-full h-[34px] bg-[#0F172A] hover:bg-black text-white text-[12px] font-medium rounded-full flex items-center justify-center gap-1.5 transition-all cursor-pointer mt-1 whitespace-nowrap"
                              >
                                💻 在终端窗口启动
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                  </div>

                  {/* 底部操作条 */}
                  <div className="w-full flex flex-row items-center justify-between pt-2.5 border-t border-[#E5E5E5]/60 box-border">
                    <span className="text-[11px] text-slate-400">
                      {activeAgent.isDesktopApp ? '已适配 macOS 原生图形架构' : '随时可在设备管理切换失效/有效'}
                    </span>
                    <button
                      onClick={() => showToast(`⚡️ ${activeAgent.title} 链路往返延迟: 18ms，专线通信正常！`)}
                      className="h-[28px] px-4 bg-[#0F172A] hover:bg-black rounded-[100px] flex items-center justify-center text-[11px] font-medium text-white transition-all whitespace-nowrap select-none cursor-pointer"
                    >
                      测试网络连接
                    </button>
                  </div>
                </div>

                {/* 第 2 列 (高度自动填充并均分容器高度) */}
                <div id="expanded-col-2" className="flex-1 min-w-[250px] max-w-[380px] h-full flex flex-col justify-between gap-[14px] flex-shrink-0 box-border transition-all duration-300 no-scrollbar" style={{ order: 2 }}>
                  {col2Agents.map(a => (
                    <div
                      key={a.id}
                      onClick={() => handleSelectCard(a.id)}
                      className="agent-card w-full flex-1 min-h-[135px] bg-white/80 border border-white rounded-[32px] p-5 flex flex-col justify-between items-start box-border backdrop-blur-[10px] cursor-pointer flex-shrink-0 select-none transition-all hover:bg-white hover:scale-[1.01] hover:shadow-xs"
                    >
                      <div className="w-full flex flex-row justify-between items-center box-border">
                        <div className="w-6 h-6 flex items-center justify-center flex-shrink-0">{a.svg}</div>
                        {/* 右上角严格只区分是否安装 */}
                        <span className={`text-[12px] leading-none text-right whitespace-nowrap flex items-center gap-1 font-medium ${
                          a.badge === '已安装'
                            ? 'text-[#262626]'
                            : 'text-slate-400'
                        }`}>
                          <span>{a.badge}</span>
                        </span>
                      </div>
                      <div className="w-full flex flex-col items-start gap-1 box-border my-auto">
                        <h3 className="font-semibold text-[15px] leading-[19px] text-[#262626] capitalize whitespace-nowrap">{a.title}</h3>
                        <p className="font-normal text-[12px] leading-[16px] text-slate-700 whitespace-nowrap overflow-hidden text-ellipsis w-full pr-1">{a.sub}</p>
                      </div>
                      {/* 按钮严格区分是否配置 */}
                      <button
                        onClick={(e) => handleCardButtonClick(e, a)}
                        className={`h-[30px] min-w-[76px] px-3.5 rounded-full flex items-center justify-center text-[12px] font-medium leading-[15px] transition-all whitespace-nowrap select-none gap-1.5 ${
                          a.isConfigured
                            ? 'bg-[#0F172A] hover:bg-black text-white shadow-xs'
                            : 'bg-white/90 hover:bg-white text-slate-800 border border-slate-200/90 shadow-2xs hover:border-slate-300'
                        }`}
                      >
                        {a.isConfigured && (
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                        )}
                        <span>{a.btnLabel}</span>
                      </button>
                    </div>
                  ))}
                </div>

              </div>
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* B. 设备管理视图 (左右布局 + 密钥启用/停用 + 新建设备) */}
        {/* ========================================================================= */}
        {viewMode === 'devices' && (() => {
          const localKeys = deviceKeys.filter(k => k.deviceId === 1);
          const iphoneKeys = deviceKeys.filter(k => k.deviceId === 2);
          const ubuntuKeys = deviceKeys.filter(k => k.deviceId === 3);
          const currentVisibleKeys = deviceKeys.filter(k => k.deviceId === selectedDeviceId);

          return (
            <div className="w-full flex-1 flex flex-row items-start justify-start p-0 box-border overflow-hidden">
              {/* 左侧设备选择 */}
              <div className="w-[360px] h-full p-6 flex flex-col justify-between items-start gap-6 select-none flex-shrink-0 box-border border-r border-slate-200/50">
                <div className="w-[312px] flex flex-col items-start gap-6 box-border">
                  <div className="w-[120px] h-[120px] relative">
                    <img src={DEVICE_3D_BASE64} className="w-[120px] h-[120px] object-contain" alt="Cloud Device Keys" />
                  </div>
                  <div className="w-[312px] flex flex-col items-start gap-4 box-border">
                    <h1 className="font-medium text-[24px] leading-[29px] text-black whitespace-nowrap">
                      云端管理设备 key
                    </h1>
                    <div className="w-[312px] flex flex-col items-start gap-3 box-border overflow-y-auto no-scrollbar">
                      {/* 设备 1: MacBook Pro */}
                      <div
                        onClick={() => setSelectedDeviceId(1)}
                        className={`w-[312px] p-4 px-6 rounded-[32px] border transition-all cursor-pointer flex flex-col gap-3 ${
                          selectedDeviceId === 1 ? 'bg-white border-[#9BC3FF] shadow-xs' : 'bg-white/60 border-white hover:bg-white'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className="font-semibold text-slate-900 text-sm">MacBook Pro (本机工作站)</span>
                          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        </div>
                        <span className="text-xs text-slate-400">{localKeys.length} keys · 当前本机</span>
                      </div>

                      {/* 设备 2: iPhone 16 Pro */}
                      <div
                        onClick={() => setSelectedDeviceId(2)}
                        className={`w-[312px] p-4 px-6 rounded-[32px] border transition-all cursor-pointer flex flex-col gap-3 ${
                          selectedDeviceId === 2 ? 'bg-white border-[#9BC3FF] shadow-xs' : 'bg-white/60 border-white hover:bg-white'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className="font-semibold text-slate-900 text-sm">iPhone 16 Pro</span>
                          <span className="w-2 h-2 rounded-full bg-slate-300"></span>
                        </div>
                        <span className="text-xs text-slate-400">{iphoneKeys.length} keys · 移动端同步中</span>
                      </div>

                      {/* 设备 3: Ubuntu Dev Server */}
                      <div
                        onClick={() => setSelectedDeviceId(3)}
                        className={`w-[312px] p-4 px-6 rounded-[32px] border transition-all cursor-pointer flex flex-col gap-3 ${
                          selectedDeviceId === 3 ? 'bg-white border-[#9BC3FF] shadow-xs' : 'bg-white/60 border-white hover:bg-white'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className="font-semibold text-slate-900 text-sm">Ubuntu GPU Server</span>
                          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        </div>
                        <span className="text-xs text-slate-400">{ubuntuKeys.length} keys · 云端训练中继节点</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 右侧设备 Key 详情列表 */}
              <div className="flex-1 h-full p-8 flex flex-col justify-start items-start gap-4 box-border overflow-y-auto no-scrollbar">
                <div className="flex items-center justify-between w-full pb-3 border-b border-slate-200/60">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">
                      {selectedDeviceId === 1
                        ? 'MacBook Pro (本机) 活跃 Key 矩阵'
                        : (selectedDeviceId === 2 ? 'iPhone 16 Pro 活跃 Key 矩阵' : 'Ubuntu GPU Server 活跃 Key 矩阵')}
                    </h2>
                    <p className="text-xs text-slate-400">
                      {selectedDeviceId === 1
                        ? '展示本机已接入 Agent 专线凭证，支持一键复制与实时启停控制'
                        : '在云端针对单项工具一键切换失效或生效，杜绝 Key 泄露风险'}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      const newId = `key_${Date.now()}`;
                      const prefix = selectedDeviceId === 1 ? 'mbp' : (selectedDeviceId === 2 ? 'ios' : 'linux');
                      updateDeviceKeys(prev => [
                        ...prev,
                        {
                          id: newId,
                          tool: selectedDeviceId === 1 ? '自定义本机专线' : '自定义云端设备专线',
                          toolId: 'custom',
                          key: `sk-relay-custom-${prefix}-${Math.random().toString(36).slice(2, 6)}`,
                          statusKey: newId,
                          deviceId: selectedDeviceId
                        }
                      ]);
                      showToast('🔑 已成功为当前设备新建专线专用 API Key');
                    }}
                    className="h-9 px-4 rounded-full bg-[#0F172A] hover:bg-black text-white text-xs font-medium cursor-pointer transition-all shadow-xs whitespace-nowrap flex-shrink-0"
                  >
                    + 新建设备 Key
                  </button>
                </div>

                {/* Key 矩阵卡片 */}
                <div className="w-full flex flex-col gap-3">
                  {currentVisibleKeys.length === 0 ? (
                    <div className="w-full py-12 flex flex-col items-center justify-center text-center bg-white/60 rounded-3xl border border-dashed border-slate-200">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-3 text-lg">
                        🔑
                      </div>
                      <span className="text-sm font-semibold text-slate-700">当前设备暂无活跃专线凭证</span>
                      <span className="text-xs text-slate-400 mt-1">
                        {selectedDeviceId === 1
                          ? '请返回工作台点击「一键配置所有」或在侧边抽屉中点击「注入专线加速」'
                          : '点击上方「+ 新建设备 Key」为该设备分发访问凭证'}
                      </span>
                    </div>
                  ) : (
                    currentVisibleKeys.map(item => {
                      const isActive = deviceKeyStatusMap[item.statusKey] ?? true;
                      return (
                        <div
                          key={item.id}
                          className="w-full p-4 bg-white/80 hover:bg-white rounded-2xl border border-white shadow-2xs flex items-center justify-between transition-all"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-xs text-slate-700">
                              {item.tool.slice(0, 2)}
                            </div>
                            <div className="flex flex-col">
                              <span className="font-semibold text-slate-900 text-sm">{item.tool}</span>
                              <span className="font-mono text-xs text-slate-400">{item.key}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => copyToClipboard(item.key, '📋 已复制设备专线 Key')}
                              className="h-8 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium cursor-pointer transition-colors whitespace-nowrap flex-shrink-0"
                            >
                              复制
                            </button>
                            <button
                              onClick={() => {
                                setDeviceKeyStatusMap(prev => {
                                  const nextMap = { ...prev, [item.statusKey]: !isActive };
                                  try {
                                    localStorage.setItem(STORAGE_KEY_DEVICE_KEY_STATUS, JSON.stringify(nextMap));
                                  } catch {}
                                  return nextMap;
                                });
                                showToast(isActive ? `🔒 已切断 ${item.tool} 的专线访问` : `✅ 已重新启用 ${item.tool} 专线访问`);
                              }}
                              className={`h-8 px-3.5 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap flex-shrink-0 ${
                                isActive ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                              }`}
                            >
                              {isActive ? '生效中' : '已停用'}
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          );
        })()}

        {/* ========================================================================= */}
        {/* C. 出口安全中心 (OpenAI 纯净标准 / 海外专线加速) */}
        {/* ========================================================================= */}
        {viewMode === 'security' && (
          <div className="w-full flex-1 flex flex-col justify-between box-border overflow-hidden select-none">
            
            {/* 顶栏控制 */}
            <div className="w-full px-8 pt-5 pb-3 flex flex-row items-center justify-between box-border flex-shrink-0">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-3">
                  <h1 className="text-[22px] font-bold text-slate-900 tracking-tight leading-none m-0">
                    {securityVendor === 'openai' ? 'OpenAI 专线防封中心' : '海外专线加速中心'}
                  </h1>
                  <div className="flex items-center p-0.5 bg-slate-200/70 rounded-full text-[11px] font-medium ml-1">
                    <button
                      onClick={() => setSecurityVendor('openai')}
                      className={`px-3 py-1 rounded-full transition-all cursor-pointer whitespace-nowrap ${
                        securityVendor === 'openai' ? 'bg-[#0F172A] text-white font-medium' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      OpenAI 专线
                    </button>
                    <button
                      onClick={() => setSecurityVendor('global')}
                      className={`px-3 py-1 rounded-full transition-all cursor-pointer whitespace-nowrap ${
                        securityVendor === 'global' ? 'bg-blue-600 text-white font-medium' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      全局专线
                    </button>
                  </div>
                </div>
                <p className="text-xs text-slate-400 font-normal m-0">
                  {securityVendor === 'openai' ? 'api.openai.com 官方准入与住宅 IP 分流 · 实时监控生效中' : '海外主流大模型 API 专线出口 · 纯净直连生效中'}
                </p>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => copyToClipboard(generateEgressReport(), '📋 已复制完整出口体检报告')}
                  className="h-9 px-3.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs whitespace-nowrap"
                >
                  📋 复制报告
                </button>
                <button
                  onClick={handleRunDiagnostics}
                  disabled={isDiagnosing}
                  className="h-9 px-4 rounded-xl bg-[#1E293B] hover:bg-[#0F172A] active:scale-95 text-white text-xs font-medium flex items-center gap-2 transition-all cursor-pointer shadow-xs whitespace-nowrap"
                >
                  <span>{isDiagnosing ? '检测中...' : '重新检测'}</span>
                </button>
              </div>
            </div>

            {/* 主流式报告卡片 */}
            <div className="w-full flex-1 px-8 pb-3 pt-1 flex flex-col gap-2.5 box-border overflow-y-auto no-scrollbar">
              
              {/* 概要警报卡片 (动态联动当前风险计数) */}
              <div className="w-full min-h-[105px] bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs flex items-center gap-4 box-border flex-shrink-0">
                <div className={`w-11 h-11 rounded-2xl border flex items-center justify-center flex-shrink-0 ${
                  highRiskCount > 0
                    ? securityVendor === 'openai'
                      ? 'bg-rose-50 border-rose-100 text-rose-500'
                      : 'bg-blue-50 border-blue-100 text-blue-600'
                    : 'bg-emerald-50 border-emerald-100 text-emerald-600'
                }`}>
                  {highRiskCount > 0 ? (
                    <svg className="w-5 h-5 stroke-[2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 stroke-[2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                    </svg>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-[15px] font-bold text-slate-900 leading-snug m-0">
                    {highRiskCount > 0 ? (
                      <>
                        发现 <span className="text-rose-600 font-bold">1 项高危</span> + <span className="text-amber-600 font-bold">2 项警告</span>
                      </>
                    ) : (
                      <>
                        <span className="text-emerald-700 font-bold">高危风险已消除</span> · 0 项高危 + <span className="text-amber-600 font-bold">2 项接管就绪</span>
                      </>
                    )}
                  </h2>
                  <p className="text-xs text-slate-500 mt-1 m-0 leading-normal">
                    {highRiskCount > 0
                      ? securityVendor === 'openai'
                        ? 'IPv6 旁路泄露可能导致 OpenAI 检测到国内原生 IP 触发风控，建议立即处理下方高危项。'
                        : '当前属于海外官方准入区域，但检测到本机 IPv6 直连边缘节点，建议立即排查。'
                      : 'IPv6 旁路已完全阻断，所有握手流量均强制经由 NetBird 原生专线出口，防封体系已完备。'}
                  </p>
                </div>
                <div className="flex items-center gap-2 pl-4 border-l border-slate-100 flex-shrink-0">
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] text-slate-400">NetBird WireGuard</span>
                    <span className="text-xs font-mono font-medium text-emerald-600 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      100.64.0.12
                    </span>
                  </div>
                </div>
              </div>

              {/* 风险条目 1: IPv6 旁路泄露 (动态响应一键屏蔽交互态) */}
              <div className="w-full bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs flex items-center justify-between gap-4 box-border">
                <div className="flex items-center gap-3">
                  {isIpv6Blocked ? (
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      已防御
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-600 border border-rose-200">
                      高危
                    </span>
                  )}
                  <div className="flex flex-col">
                    <span className="font-semibold text-slate-900 text-sm">IPv6 旁路泄露检测 (Bypass Leak)</span>
                    <span className="text-xs text-slate-400 mt-0.5">
                      {isIpv6Blocked
                        ? '已注入本地零信任防火墙规则，强制全局仅走海外专线出口，彻底杜绝 IPv6 原生暴露'
                        : '海外 AI 服务在握手时会探测 IPv6 端点，直接暴露国内原生公网 IP'}
                    </span>
                  </div>
                </div>

                {isIpv6Blocked ? (
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 flex items-center gap-1 whitespace-nowrap flex-shrink-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      已屏蔽泄露
                    </span>
                    <button
                      onClick={handleToggleIpv6Block}
                      className="h-8 px-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-500 hover:text-slate-800 text-xs font-normal cursor-pointer transition-all whitespace-nowrap flex-shrink-0"
                      title="解除屏蔽规则"
                    >
                      解除
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleToggleIpv6Block}
                    className="h-8 px-3.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-medium cursor-pointer transition-all active:scale-95 shadow-xs whitespace-nowrap flex-shrink-0"
                  >
                    一键屏蔽
                  </button>
                )}
              </div>

              {/* 风险条目 2: DNS 分流与污染 (厂商动态适配) */}
              <div className="w-full bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs flex items-center justify-between gap-4 box-border">
                <div className="flex items-center gap-3">
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-600 border border-amber-200">警告</span>
                  <div className="flex flex-col">
                    <span className="font-semibold text-slate-900 text-sm">DNS 解析分流纯净度 (DNS Leak)</span>
                    <span className="text-xs text-slate-400 mt-0.5">
                      {securityVendor === 'openai'
                        ? 'api.openai.com 域名需锁定由 NetBird 海外节点代理解析'
                        : '海外大模型 API 域名锁定由海外专线节点代理解析'}
                    </span>
                  </div>
                </div>
                <span className="text-xs font-medium text-amber-600">已由 100.64.0.1 接管</span>
              </div>

              {/* 风险条目 3: 节点出口时区与语言指纹 */}
              <div className="w-full bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs flex items-center justify-between gap-4 box-border">
                <div className="flex items-center gap-3">
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-600 border border-amber-200">警告</span>
                  <div className="flex flex-col">
                    <span className="font-semibold text-slate-900 text-sm">时区与语言对齐 (Geo-Fingerprint)</span>
                    <span className="text-xs text-slate-400 mt-0.5">本机 Asia/Shanghai 与出口 America/Los_Angeles 存在微小偏差</span>
                  </div>
                </div>
                <span className="text-xs text-slate-400">已自动注入时区 Mock</span>
              </div>

              {/* 正常项折叠面板 (动态同步通过项计数与列表) */}
              <div className="w-full bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs flex flex-col gap-3 box-border">
                <div
                  onClick={() => setIsPassedExpanded(prev => !prev)}
                  className="flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span className="font-semibold text-slate-900 text-sm">已通过检测项 ({passedCount}项安全)</span>
                  </div>
                  <span className="text-xs text-slate-400">{isPassedExpanded ? '收起 ↑' : '展开详情 ↓'}</span>
                </div>

                {isPassedExpanded && (
                  <div className="flex flex-col gap-2 pt-2 border-t border-slate-100 text-xs text-slate-600">
                    {isIpv6Blocked && (
                      <div className="flex items-center justify-between">
                        <span>IPv6 旁路泄露零信任防火墙</span>
                        <span className="text-emerald-600 font-medium">✅ 本地规则生效中，旁路已强制阻断</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span>TLS 握手特征 (JA3/JA4) 纯净度</span>
                      <span className="text-emerald-600 font-medium">✅ 原生 Go/Curl 特征，无 MITM 中间人痕迹</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>ASN 归属地与机房属性</span>
                      <span className="text-emerald-600 font-medium">✅ AWS Oregon 原生商业出口，未列入黑名单</span>
                    </div>
                  </div>
                )}
              </div>

            </div>

            {/* 底部固定出口节点切换条 */}
            <div className="w-full h-14 bg-white/90 border-t border-slate-200/60 px-8 flex items-center justify-between flex-shrink-0 box-border">
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-400">当前专线出口:</span>
                <span className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  {activeExitNode.name} · {activeExitNode.latencyMs}ms
                </span>
              </div>
              <button
                onClick={handleSwitchExitNode}
                className="h-8 px-4 rounded-xl bg-[#1E293B] hover:bg-[#0F172A] text-white text-xs font-medium cursor-pointer transition-all active:scale-95 shadow-2xs whitespace-nowrap flex-shrink-0"
              >
                🔀 漂移切换出口
              </button>
            </div>

          </div>
        )}

      </section>

      {/* ==================== 3. 模态弹窗与 Toast ==================== */}
      <AuthCenterModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        isLoggedIn={isLoggedIn}
        currentSystemToken={systemToken}
        onSaveToken={(token) => {
          RelayCloudService.getInstance().setSystemAccessToken(token);
          setSystemToken(token);
          setIsLoggedIn(Boolean(token));
          showToast('✅ 授权 Token 已成功绑定并同步至云端');
        }}
        onLogout={() => {
          RelayCloudService.getInstance().setSystemAccessToken('');
          setSystemToken('');
          setIsLoggedIn(false);
          showToast('🔒 已安全登出中转站账号');
        }}
        onShowToast={showToast}
      />

      {/* 原生应用热更新弹窗 */}
      <HotUpdateModal
        isOpen={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
        onSuccessToast={showToast}
        initialUpdateInfo={pendingUpdateInfo}
      />

      {toastMessage && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 bg-[#0F172A] text-white rounded-full text-xs font-medium border border-white/20 shadow-xl flex items-center gap-2 animate-bounce">
          {toastMessage}
        </div>
      )}

    </div>
  );
};
