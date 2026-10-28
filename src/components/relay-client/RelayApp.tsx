import React, { useState, useCallback, useMemo, useRef } from 'react';
import { SPHERE_3D_BASE64, DEVICE_3D_BASE64 } from './core/constants/assets';
import { RelayCloudService } from './RelayCloudService';
import { NetBirdEngineService } from './NetBirdEngineService';
import { AuthCenterModal } from './features/auth/AuthCenterModal';

export type ViewMode = 'home' | 'devices' | 'security';
export type SecurityVendor = 'claude' | 'google';

interface AgentCardData {
  id: number;
  toolId: string;
  category: 'official' | 'desktop' | 'domestic';
  title: string;
  sub: string;
  badge: '未安装' | '已安装' | '已就绪' | '待配置';
  col: 1 | 2;
  btnLabel: string;
  btnDark: boolean;
  desc: string;
  quickCmd: string;
  vendor: 'claude' | 'openai' | 'google' | 'domestic';
  needsEgressCheck: boolean;
  svg: React.ReactNode;
}

// 精选主流 6 款核心常用 Agent 数据集
const INITIAL_AGENTS: AgentCardData[] = [
  {
    id: 1,
    toolId: 'claude',
    category: 'official',
    title: 'Claude Code',
    sub: 'anthropic 命令行开发',
    badge: '未安装',
    col: 1,
    btnLabel: '安装 Agent',
    btnDark: false,
    desc: 'Anthropic 官方智能编程智能体，擅长复杂工程理解与端到端代码实现。',
    quickCmd: 'claude',
    vendor: 'claude',
    needsEgressCheck: true,
    svg: (
      <svg className="w-6 h-6 flex-shrink-0" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
        <path d="M4.709 15.955l4.72-2.647.08-.23-.08-.128H9.2l-.79-.048-2.698-.073-2.339-.097-2.266-.122-.571-.121L0 11.784l.055-.352.48-.321.686.06 1.52.103 2.278.158 1.652.097 2.449.255h.389l.055-.157-.134-.098-.103-.097-2.358-1.596-2.552-1.688-1.336-.972-.724-.491-.364-.462-.158-1.008.656-.722.881.06.225.061.893.686 1.908 1.476 2.491 1.833.365.304.145-.103.019-.073-.164-.274-1.355-2.446-1.446-2.49-.644-1.032-.17-.619a2.97 2.97 0 01-.104-.729L6.283.134 6.696 0l.996.134.42.364.62 1.414 1.002 2.229 1.555 3.03.456.898.243.832.091.255h.158V9.01l.128-1.706.237-2.095.23-2.695.08-.76.376-.91.747-.492.584.28.48.685-.067.444-.286 1.851-.559 2.903-.364 1.942h.212l.243-.242.985-1.306 1.652-2.064.73-.82.85-.904.547-.431h1.033l.76 1.129-.34 1.166-1.064 1.347-.881 1.142-1.264 1.7-.79 1.36.073.11.188-.02 2.856-.606 1.543-.28 1.841-.315.833.388.091.395-.328.807-1.969.486-2.309.462-3.439.813-.042.03.049.061 1.549.146.662.036h1.622l3.02.225.79.522.474.638-.079.485-1.215.62-1.64-.389-3.829-.91-1.312-.329h-.182v.11l1.093 1.068 2.006 1.81 2.509 2.33.127.578-.322.455-.34-.049-2.205-1.657-.851-.747-1.926-1.62h-.128v.17l.444.649 2.345 3.521.122 1.08-.17.353-.608.213-.668-.122-1.374-1.925-1.415-2.167-1.143-1.943-.14.08-.674 7.254-.316.37-.729.28-.607-.461-.322-.747.322-1.476.389-1.924.315-1.53.286-1.9.17-.632-.012-.042-.14.018-1.434 1.967-2.18 2.945-1.726 1.845-.414.164-.717-.37.067-.662.401-.589 2.388-3.036 1.44-1.882.93-1.086-.006-.158h-.055L4.132 18.56l-1.13.146-.487-.456.061-.746.231-.243 1.908-1.312-.006.006z" fill="#D97757" />
      </svg>
    )
  },
  {
    id: 2,
    toolId: 'codex',
    category: 'official',
    title: 'OpenAI Codex',
    sub: 'OpenAI 命令行开发',
    badge: '已安装',
    col: 2,
    btnLabel: '配置专线',
    btnDark: true,
    desc: 'OpenAI 官方终端编程助手，深度集成 GPT-4o 代码推理与自动调试。',
    quickCmd: 'codex',
    vendor: 'openai',
    needsEgressCheck: false,
    svg: (
      <svg className="w-6 h-6 flex-shrink-0 text-slate-800" fill="currentColor" fillRule="evenodd" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
        <path d="M21.55 10.004a5.416 5.416 0 00-.478-4.501c-1.217-2.09-3.662-3.166-6.05-2.66A5.59 5.59 0 0010.831 1C8.39.995 6.224 2.546 5.473 4.838A5.553 5.553 0 001.76 7.496a5.487 5.487 0 00.691 6.5 5.416 5.416 0 00.477 4.502c1.217 2.09 3.662 3.165 6.05 2.66A5.586 5.586 0 0013.168 23c2.443.006 4.61-1.546 5.361-3.84a5.553 5.553 0 003.715-2.66 5.488 5.488 0 00-.693-6.497v.001zm-8.381 11.558a4.199 4.199 0 01-2.675-.954c.034-.018.093-.05.132-.074l4.44-2.53a.71.71 0 00.364-.623v-6.176l1.877 1.069c.02.01.033.029.036.05v5.115c-.003 2.274-1.87 4.118-4.174 4.123zM4.192 17.78a4.059 4.059 0 01-.498-2.763c.032.02.09.055.131.078l4.44 2.53c.225.13.504.13.73 0l5.42-3.088v2.138a.068.068 0 01-.027.057L9.9 19.288c-1.999 1.136-4.552.46-5.707-1.51h-.001zM3.023 8.216A4.15 4.15 0 015.198 6.41l-.002.151v5.06a.711.711 0 00.364.624l5.42 3.087-1.876 1.07a.067.067 0 01-.063.005l-4.489-2.559c-1.995-1.14-2.679-3.658-1.53-5.63h.001zm15.417 3.54l-5.42-3.088L14.896 7.6a.067.067 0 01.063-.006l4.489 2.557c1.998 1.14 2.683 3.662 1.529 5.633a4.163 4.163 0 01-2.174 1.807V12.38a.71.71 0 00-.363-.623zm1.867-2.773a6.04 6.04 0 00-.132-.078l-4.44-2.53a.731.731 0 00-.729 0l-5.42 3.088V7.325a.068.068 0 01.027-.057L14.1 4.713c2-1.137 4.555-.46 5.707 1.513.487.833.664 1.809.499 2.757h.001zm-11.741 3.81l-1.877-1.068a.065.065 0 01-.036-.051V6.559c.001-2.277 1.873-4.122 4.181-4.12.976 0 1.92.338 2.671.954-.034.018-.092.05-.131.073l-4.44 2.53a.71.71 0 00-.365.623l-.003 6.173v.002zm1.02-2.168L12 9.25l2.414 1.375v2.75L12 14.75l-2.415-1.375v-2.75z" />
      </svg>
    )
  },
  {
    id: 3,
    toolId: 'gemini',
    category: 'official',
    title: 'Gemini CLI',
    sub: 'google 官方开发 agent',
    badge: '已安装',
    col: 1,
    btnLabel: '配置专线',
    btnDark: true,
    desc: 'Google 官方多模态智能体，具备超长上下文理解能力与全库代码分析。',
    quickCmd: 'gemini',
    vendor: 'google',
    needsEgressCheck: true,
    svg: (
      <svg className="w-6 h-6 flex-shrink-0" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
        <path d="M20.616 10.835a14.147 14.147 0 01-4.45-3.001 14.111 14.111 0 01-3.678-6.452.503.503 0 00-.975 0 14.134 14.134 0 01-3.679 6.452 14.155 14.155 0 01-4.45 3.001c-.65.28-1.318.505-2.002.678a.502.502 0 000 .975c.684.172 1.35.397 2.002.677a14.147 14.147 0 014.45 3.001 14.112 14.112 0 013.679 6.453.502.502 0 00.975 0c.172-.685.397-1.351.677-2.003a14.145 14.145 0 013.001-4.45 14.113 14.113 0 016.453-3.678.503.503 0 000-.975 13.245 13.245 0 01-2.003-.678z" fill="#3186FF" />
      </svg>
    )
  },
  {
    id: 4,
    toolId: 'agy',
    category: 'official',
    title: 'Antigravity CLI',
    sub: 'DeepMind 智能开发 CLI',
    badge: '未安装',
    col: 2,
    btnLabel: '安装 Agent',
    btnDark: false,
    desc: 'DeepMind 原生全自主编码智能终端，支持多代理协作与自动规划。',
    quickCmd: 'agy',
    vendor: 'google',
    needsEgressCheck: true,
    svg: (
      <svg className="w-6 h-6 flex-shrink-0" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2L2 22h20L12 2zm0 4.5l6.5 13H5.5L12 6.5z" fill="#00B95C" />
      </svg>
    )
  },
  {
    id: 5,
    toolId: 'claude-desktop',
    category: 'desktop',
    title: 'Claude Desktop',
    sub: 'anthropic 桌面客户端',
    badge: '已安装',
    col: 1,
    btnLabel: '管理连接',
    btnDark: true,
    desc: 'Anthropic 桌面端图形应用，支持本地 MCP 协议与多窗口控制。',
    quickCmd: 'open /Applications/Claude.app',
    vendor: 'claude',
    needsEgressCheck: true,
    svg: (
      <svg className="w-6 h-6 flex-shrink-0" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
        <path d="M4.709 15.955l4.72-2.647.08-.23-.08-.128H9.2l-.79-.048-2.698-.073-2.339-.097-2.266-.122-.571-.121L0 11.784l.055-.352.48-.321.686.06 1.52.103 2.278.158 1.652.097 2.449.255h.389l.055-.157-.134-.098-.103-.097-2.358-1.596-2.552-1.688-1.336-.972-.724-.491-.364-.462-.158-1.008.656-.722.881.06.225.061.893.686 1.908 1.476 2.491 1.833.365.304.145-.103.019-.073-.164-.274-1.355-2.446-1.446-2.49-.644-1.032-.17-.619a2.97 2.97 0 01-.104-.729L6.283.134 6.696 0l.996.134.42.364.62 1.414 1.002 2.229 1.555 3.03.456.898.243.832.091.255h.158V9.01l.128-1.706.237-2.095.23-2.695.08-.76.376-.91.747-.492.584.28.48.685-.067.444-.286 1.851-.559 2.903-.364 1.942h.212l.243-.242.985-1.306 1.652-2.064.73-.82.85-.904.547-.431h1.033l.76 1.129-.34 1.166-1.064 1.347-.881 1.142-1.264 1.7-.79 1.36.073.11.188-.02 2.856-.606 1.543-.28 1.841-.315.833.388.091.395-.328.807-1.969.486-2.309.462-3.439.813-.042.03.049.061 1.549.146.662.036h1.622l3.02.225.79.522.474.638-.079.485-1.215.62-1.64-.389-3.829-.91-1.312-.329h-.182v.11l1.093 1.068 2.006 1.81 2.509 2.33.127.578-.322.455-.34-.049-2.205-1.657-.851-.747-1.926-1.62h-.128v.17l.444.649 2.345 3.521.122 1.08-.17.353-.608.213-.668-.122-1.374-1.925-1.415-2.167-1.143-1.943-.14.08-.674 7.254-.316.37-.729.28-.607-.461-.322-.747.322-1.476.389-1.924.315-1.53.286-1.9.17-.632-.012-.042-.14.018-1.434 1.967-2.18 2.945-1.726 1.845-.414.164-.717-.37.067-.662.401-.589 2.388-3.036 1.44-1.882.93-1.086-.006-.158h-.055L4.132 18.56l-1.13.146-.487-.456.061-.746.231-.243 1.908-1.312-.006.006z" fill="#D97757" />
      </svg>
    )
  },
  {
    id: 6,
    toolId: 'kimi',
    category: 'domestic',
    title: 'Kimi Code',
    sub: '月之暗面 智能代码助手',
    badge: '未安装',
    col: 2,
    btnLabel: '安装 Agent',
    btnDark: false,
    desc: '月之暗面超长上下文代码助手，擅长 200 万字大工程全库理解。',
    quickCmd: 'kimi',
    vendor: 'domestic',
    needsEgressCheck: false,
    svg: (
      <svg className="w-6 h-6 flex-shrink-0 text-blue-600" fill="currentColor" fillRule="evenodd" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
        <path d="M19.738 5.776c.163-.209.306-.4.457-.585.07-.087.064-.153-.004-.244-.655-.861-.717-1.817-.34-2.787.283-.73.909-1.072 1.674-1.145.477-.045.945.004 1.379.236.57.305.902.77 1.01 1.412.086.512.07 1.012-.075 1.508-.257.878-.888 1.333-1.753 1.448-.718.096-1.446.108-2.17.157-.056.004-.113 0-.178 0z" />
        <path d="M17.962 1.844h-4.326l-3.425 7.81H5.369V1.878H1.5V22h3.87v-8.477h6.824a3.025 3.025 0 002.743-1.75V22h3.87v-8.477a3.87 3.87 0 00-3.588-3.86v-.01h-2.125a3.94 3.94 0 002.323-2.12l2.545-5.689z" />
      </svg>
    )
  }
];

export const RelayApp: React.FC = () => {
  // 1. 全局导航视图状态
  const [viewMode, setViewMode] = useState<ViewMode>('home');
  const [selectedCardId, setSelectedCardId] = useState<number>(1);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // 2. Agent 列表状态与安装状态
  const [agents, setAgents] = useState<AgentCardData[]>(INITIAL_AGENTS);
  const [installingCardId, setInstallingCardId] = useState<number | null>(null);
  const [installProgress, setInstallProgress] = useState<number>(0);

  // 3. 设备管理状态
  const [selectedDeviceId, setSelectedDeviceId] = useState<number>(1);
  const [deviceKeyStatusMap, setDeviceKeyStatusMap] = useState<Record<string, boolean>>({
    'key_claude': true,
    'key_codex': true,
    'key_gemini': false
  });

  // 4. 网络防封中心状态
  const [securityVendor, setSecurityVendor] = useState<SecurityVendor>('claude');
  const [isPassedExpanded, setIsPassedExpanded] = useState<boolean>(false);
  const [isDiagnosing, setIsDiagnosing] = useState<boolean>(false);
  const [activeExitNodeIdx, setActiveExitNodeIdx] = useState<number>(0);

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

  const col1Agents = useMemo(() => agents.filter(a => a.col === 1), [agents]);
  const col2Agents = useMemo(() => agents.filter(a => a.col === 2), [agents]);

  const handleSelectCard = useCallback((id: number) => {
    setSelectedCardId(id);
    setIsDrawerOpen(true);
  }, []);

  const handleCloseDrawer = useCallback(() => {
    setIsDrawerOpen(false);
  }, []);

  // 模拟自动安装流程
  const handleStartAutoInstall = useCallback((cardId: number) => {
    setInstallingCardId(cardId);
    setInstallProgress(10);
    const timer = setInterval(() => {
      setInstallProgress(prev => {
        if (prev >= 90) {
          clearInterval(timer);
          setTimeout(() => {
            setInstallingCardId(null);
            setAgents(curr => curr.map(a => a.id === cardId ? { ...a, badge: '已安装', btnDark: true, btnLabel: '配置专线' } : a));
            showToast('🎉 一键自动安装完成！专线链路已就绪');
          }, 400);
          return 100;
        }
        return prev + 25;
      });
    }, 300);
  }, [showToast]);

  // 运行防封体检
  const handleRunDiagnostics = useCallback(async () => {
    setIsDiagnosing(true);
    showToast('⚡️ 正在向本地引擎与 NetBird 专线发起深度体检...');
    await new Promise(r => setTimeout(r, 600));
    setIsDiagnosing(false);
    showToast('🎉 体检完成！已捕获最新出口指纹 (1 项高危 + 2 项警告)');
  }, [showToast]);

  const exitNodes = useMemo(() => {
    return NetBirdEngineService.getInstance().getExitNodes();
  }, []);

  const activeExitNode = useMemo(() => {
    return exitNodes[activeExitNodeIdx] || exitNodes[0];
  }, [exitNodes, activeExitNodeIdx]);

  const handleSwitchExitNode = useCallback(() => {
    const nextIdx = (activeExitNodeIdx + 1) % exitNodes.length;
    setActiveExitNodeIdx(nextIdx);
    const nextNode = exitNodes[nextIdx];
    showToast(`🔀 已无缝漂移切换至: ${nextNode.name} (${nextNode.latencyMs}ms)`);
  }, [activeExitNodeIdx, exitNodes, showToast]);

  return (
    <div className="w-full h-full bg-[#EFF0F5]/95 backdrop-blur-[10px] flex flex-row items-center p-0 relative overflow-hidden box-border font-sans select-none">
      
      {/* ==================== 1. 左侧独立导航条 ==================== */}
      <aside className="w-[104px] h-full flex flex-col justify-between items-start p-0 box-border border-r border-slate-200/50 flex-shrink-0 select-none">
        
        {/* 上半部导航容器 */}
        <div className="w-[104px] flex flex-col items-start p-0">
          
          {/* macOS 交通灯占位空间 (保留 36px 给 overlay 红绿灯) */}
          <div className="w-[104px] h-[36px] px-4 py-3 flex flex-row items-center gap-2.5 box-border">
            <div className="w-[52px] h-[12px] flex flex-row items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#ED6A5E] cursor-pointer hover:opacity-80 transition-opacity"></div>
              <div className="w-3 h-3 rounded-full bg-[#F4BF4E] cursor-pointer hover:opacity-80 transition-opacity"></div>
              <div className="w-3 h-3 rounded-full bg-[#62C554] cursor-pointer hover:opacity-80 transition-opacity"></div>
            </div>
          </div>

          <div className="w-[104px] h-[28px] px-2 py-0"></div>

          {/* 导航项列表 */}
          <div role="tablist" aria-label="侧边主导航" className="w-[104px] px-4 py-0 flex flex-col items-start gap-4 box-border relative outline-none">
            
            {/* Tab 1: 接入 */}
            <button
              onClick={() => {
                setViewMode('home');
              }}
              className={`w-[72px] h-[85px] rounded-[100px] flex flex-col justify-center items-center py-4 px-2 gap-3 cursor-pointer select-none relative z-10 transition-all duration-200 active:scale-[0.96] group outline-none ${
                viewMode === 'home' ? 'bg-white shadow-2xs' : 'hover:bg-white/40'
              }`}
            >
              <div className="w-6 h-6 flex items-center justify-center transition-transform duration-200 group-hover:scale-105">
                <svg className={`w-6 h-6 stroke-[1.8] transition-colors ${viewMode === 'home' ? 'text-black' : 'text-black/60'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 10H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2" />
                  <path d="M6 14H4a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2h-2" />
                  <path d="M6 6h.01" />
                  <path d="M6 18h.01" />
                  <path d="m13 6-4 6h6l-4 6" />
                </svg>
              </div>
              <span className={`w-[28px] h-[17px] font-medium text-[14px] leading-[17px] text-center whitespace-nowrap transition-colors ${viewMode === 'home' ? 'text-black font-semibold' : 'text-black/60'}`}>
                接入
              </span>
            </button>

            {/* Tab 2: 设备管理 */}
            <button
              onClick={() => {
                setViewMode('devices');
                setIsDrawerOpen(false);
              }}
              className={`w-[72px] h-[92px] rounded-[100px] flex flex-col justify-center items-center py-4 px-2 gap-3 cursor-pointer select-none relative z-10 transition-all duration-200 active:scale-[0.96] group outline-none ${
                viewMode === 'devices' ? 'bg-white shadow-2xs' : 'hover:bg-white/40'
              }`}
            >
              <div className="w-6 h-6 flex items-center justify-center transition-transform duration-200 group-hover:scale-105">
                <svg className={`w-6 h-6 stroke-[1.8] transition-colors ${viewMode === 'devices' ? 'text-black' : 'text-black/60'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="14" x="2" y="3" rx="2"/>
                  <line x1="8" x2="16" y1="21" y2="21"/>
                  <line x1="12" x2="12" y1="17" y2="21"/>
                </svg>
              </div>
              <span className={`w-[56px] h-[24px] font-normal text-[14px] leading-[24px] text-center whitespace-nowrap transition-colors ${viewMode === 'devices' ? 'text-black font-semibold' : 'text-black/60'}`}>
                设备管理
              </span>
            </button>

            {/* Tab 3: 网络防封 */}
            <button
              onClick={() => {
                setViewMode('security');
                setIsDrawerOpen(false);
              }}
              className={`w-[72px] h-[85px] rounded-[100px] flex flex-col justify-center items-center py-3.5 px-2 gap-2.5 cursor-pointer select-none relative z-10 transition-all duration-200 active:scale-[0.96] group outline-none ${
                viewMode === 'security' ? 'bg-white shadow-2xs' : 'hover:bg-white/40'
              }`}
            >
              <div className="w-6 h-6 flex items-center justify-center transition-transform duration-200 group-hover:scale-105">
                <svg className={`w-6 h-6 stroke-[1.8] transition-colors ${viewMode === 'security' ? 'text-black' : 'text-black/60'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  <path d="m9 12 2 2 4-4"/>
                </svg>
              </div>
              <span className={`w-[56px] h-[17px] font-normal text-[13px] leading-[17px] text-center whitespace-nowrap transition-colors ${viewMode === 'security' ? 'text-black font-semibold' : 'text-black/60'}`}>
                网络防封
              </span>
            </button>

          </div>

        </div>

        {/* 左下角用户名称 */}
        <div className="w-[104px] h-[56px] px-3 py-4 flex flex-row items-center justify-between gap-2 box-border flex-shrink-0">
          <div
            onClick={() => setIsAuthModalOpen(true)}
            className="w-[84px] h-[36px] -ml-1 px-1.5 py-1 flex flex-row items-center gap-2 cursor-pointer select-none rounded-xl hover:bg-black/5 active:scale-95 transition-all group overflow-hidden"
            title="点击查看中转站账号与 Token"
          >
            <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center flex-shrink-0 relative overflow-hidden">
              <span className="font-medium text-[11px] leading-none text-white max-w-[20px] truncate">GX</span>
              <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 border border-white"></span>
            </div>
            <div className="flex-1 flex flex-col justify-center items-start overflow-hidden min-w-0">
              <span className="font-medium text-[12px] leading-tight text-black truncate max-w-[50px]">高相健</span>
              <span className="font-normal text-[9px] leading-tight text-[#262626] group-hover:text-blue-600 transition-colors truncate max-w-[50px]">
                {isLoggedIn ? '已连接' : '未登录'}
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
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {viewMode === 'home'
                ? 'AI Agent 工作台'
                : viewMode === 'devices'
                ? '多设备密钥网格'
                : '出口安全与区域准入'}
            </span>
          </div>

          {/* 右侧功能组件: 专线指示 + 帮助 + 主题切换 */}
          <div className="flex flex-row items-center gap-3">
            <span className="text-[11px] font-medium text-emerald-800 bg-emerald-50 border border-emerald-200/80 rounded-full px-3 py-1 flex items-center gap-1.5 select-none whitespace-nowrap">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>NetBird WireGuard (100.64.0.12 · 官方直连零解密)</span>
            </span>

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
              
              <div className="w-[312px] flex flex-col items-start gap-6 box-border">
                {/* 3D 球体视觉容器 */}
                <div className="w-[144px] h-[144px] relative origin-left">
                  <img src={SPHERE_3D_BASE64} className="w-[144px] h-[144px] object-contain" alt="3D Sphere" />
                </div>

                {/* 主标题 */}
                <div className="flex flex-col items-start gap-6 box-border origin-left">
                  <div className="w-[251px] h-[29px] flex flex-row items-center">
                    <h1 className="font-semibold text-[24px] leading-[29px] text-black whitespace-nowrap">
                      一键接入你的 Agent
                    </h1>
                  </div>

                  {/* 特性胶囊 */}
                  <div className="w-[312px] flex flex-col items-start gap-2 box-border">
                    <div className="w-[312px] h-[36px] bg-white/40 border border-white/60 rounded-[100px] px-3 py-2 flex flex-row items-center gap-2 box-border">
                      <svg className="w-4 h-4 text-black flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      <span className="font-normal text-[12px] leading-[20px] text-slate-700 whitespace-nowrap overflow-hidden text-ellipsis">
                        自动创建账号与设备专用 Key，完成配...
                      </span>
                    </div>

                    <div className="w-[312px] h-[36px] bg-white/40 border border-white/60 rounded-[100px] px-3 py-2 flex flex-row items-center gap-2 box-border">
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
              <div className="w-[271px] h-[48px] flex flex-row items-center gap-2 box-border origin-bottom">
                <button
                  onClick={() => showToast('⚡ 已启动批量环境检测与一键配置流程！')}
                  className="w-[153px] h-[48px] bg-[#0F172A] hover:bg-black text-white rounded-[100px] flex flex-row items-center justify-center px-4 py-3 gap-2 cursor-pointer transition-all whitespace-nowrap flex-shrink-0 select-none shadow-xs"
                >
                  <svg className="w-4 h-4 text-white flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M12 4v16m8-8H4" />
                  </svg>
                  <span className="font-medium text-[14px] leading-[20px] whitespace-nowrap">一键配置所有</span>
                </button>
                <button
                  onClick={() => showToast('✅ 运行环境探针已就绪：Node.js、Python 及网络专线延迟正常。')}
                  className="w-[110px] h-[48px] bg-white/80 hover:bg-white text-black border border-slate-200 rounded-[100px] flex flex-row items-center justify-center px-4 py-3 gap-2 cursor-pointer transition-all whitespace-nowrap flex-shrink-0 select-none"
                >
                  <span className="font-medium text-[14px] leading-[20px] whitespace-nowrap">环境检测</span>
                </button>
              </div>

            </div>

            {/* 主舞台区域 */}
            <div className="flex-1 h-full pt-[24px] px-[32px] pb-[32px] flex flex-col justify-start items-start gap-4 box-border transition-all duration-500 overflow-hidden">
              <div className="w-full flex-1 flex flex-row justify-start items-start gap-[16px] box-border transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] overflow-hidden">
                
                {/* 第 1 列 (常用左列: Claude Code, Gemini CLI, Claude Desktop) */}
                <div id="expanded-col-1" className="w-[243px] min-w-[243px] max-w-[243px] max-h-[503px] overflow-y-auto pr-1 flex flex-col items-start gap-[16px] flex-shrink-0 box-border transition-all duration-300 no-scrollbar" style={{ order: 0 }}>
                  {col1Agents.map(a => (
                    <div
                      key={a.id}
                      onClick={() => handleSelectCard(a.id)}
                      className="agent-card w-[243px] h-[157px] bg-white/80 border border-white rounded-[32px] pt-4 px-6 pb-4 flex flex-col items-start gap-4 box-border backdrop-blur-[10px] cursor-pointer flex-shrink-0 select-none transition-all hover:bg-white hover:scale-[1.01]"
                    >
                      <div className="w-[195px] h-[24px] flex flex-row justify-between items-start gap-2.5 box-border">
                        <div className="w-6 h-6 flex items-center justify-center flex-shrink-0">{a.svg}</div>
                        <span className={`h-[15px] text-[12px] leading-[15px] text-right whitespace-nowrap ${a.badge === '已安装' ? 'text-[#262626] font-medium' : 'text-[#A3A3A3]'}`}>
                          {a.badge}
                        </span>
                      </div>
                      <div className="flex flex-col items-start gap-1 box-border">
                        <h3 className="font-medium text-[16px] leading-[19px] text-[#262626] capitalize whitespace-nowrap">{a.title}</h3>
                        <p className="font-normal text-[12px] leading-[15px] text-[#A3A3A3] whitespace-nowrap overflow-hidden text-ellipsis max-w-[195px]">{a.sub}</p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectCard(a.id);
                        }}
                        className={`h-[31px] min-w-[72px] px-3 rounded-[100px] flex items-center justify-center text-[12px] font-medium leading-[15px] transition-all whitespace-nowrap select-none ${
                          a.btnDark ? 'bg-[#0F172A] hover:bg-black text-white' : 'bg-white/80 hover:bg-white text-[#0F172A] border border-[#E2E8F0]'
                        }`}
                      >
                        <span>{a.btnLabel}</span>
                      </button>
                    </div>
                  ))}
                </div>

                {/* 动态跟随部署抽屉 */}
                <div
                  id="expanded-drawer"
                  className={`${isDrawerOpen ? 'drawer-expanded' : 'drawer-collapsed hidden'} h-[503px] bg-white/85 rounded-[24px] backdrop-blur-md flex flex-col justify-between p-5 relative box-border transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] border border-white`}
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
                    <div className="w-full flex flex-col items-start gap-1 box-border">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-[17px] text-[#262626] capitalize">
                          {activeAgent.title}
                        </h3>
                        <span className="text-[11px] px-2.5 py-0.5 rounded-full font-normal bg-black/5 text-[#262626]">
                          {activeAgent.badge}
                        </span>
                      </div>
                      <p className="font-normal text-[12px] leading-[17px] text-slate-500">
                        {activeAgent.desc}
                      </p>
                    </div>

                    <div className="w-full h-0 border-b border-[#E5E5E5]/60 box-border"></div>

                    {/* 未安装态 vs 已安装态 */}
                    {activeAgent.badge === '未安装' ? (
                      <div className="w-full flex flex-col gap-3">
                        {/* 出口排查卡片 */}
                        {activeAgent.needsEgressCheck && (
                          <div className="w-full bg-white/80 border border-white rounded-[20px] p-4 flex flex-col gap-2.5 box-border">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#0F172A]"></span>
                                <span className="text-[12px] font-medium text-[#262626]">
                                  {activeAgent.vendor === 'claude' ? 'Claude 出口排查' : 'Google AI 准入排查'}
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
                                  setSecurityVendor(activeAgent.vendor === 'google' ? 'google' : 'claude');
                                  setViewMode('security');
                                  setIsDrawerOpen(false);
                                }}
                                className="flex-1 h-[31px] bg-[#0F172A] hover:bg-black text-white text-[12px] font-medium rounded-full flex items-center justify-center transition-all cursor-pointer"
                              >
                                查看出口详情
                              </button>
                              <button
                                onClick={() => copyToClipboard('NetBird WireGuard Zero-Trust Egress Report', '📋 已复制只读体检报告')}
                                className="flex-1 h-[31px] bg-white hover:bg-slate-50 border border-[#E2E8F0] text-[#0F172A] text-[12px] font-medium rounded-full flex items-center justify-center transition-all cursor-pointer"
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
                              <span>内置 Claude 403 焚决分流防封策略，杜绝账号风控</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="w-4 h-4 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-[10px] font-bold">💡</span>
                              <span>用自然语言直接在项目中写代码、改 Bug</span>
                            </div>
                          </div>
                        </div>

                        {/* 安装按钮与进度条 */}
                        <div className="w-full flex flex-col gap-2">
                          {installingCardId === activeAgent.id ? (
                            <div className="w-full bg-white/80 border border-white rounded-[20px] p-4 flex flex-col gap-2.5 box-border">
                              <div className="flex items-center justify-between">
                                <span className="text-[12px] font-semibold text-slate-800 flex items-center gap-1.5">
                                  <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                                  <span>正在自动安装中...</span>
                                </span>
                                <span className="text-[12px] font-mono font-bold text-blue-600">{installProgress}%</span>
                              </div>
                              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-[#0F172A] rounded-full transition-all duration-300" style={{ width: `${installProgress}%` }}></div>
                              </div>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleStartAutoInstall(activeAgent.id)}
                              className="w-full h-[36px] bg-[#0F172A] hover:bg-black text-white text-[12px] font-medium rounded-full flex items-center justify-center gap-2 transition-all cursor-pointer select-none"
                            >
                              ⚡ 一键自动安装
                            </button>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="w-full flex flex-col gap-3">
                        {/* 专线状态卡片 */}
                        <div className="w-full bg-white/80 border border-white rounded-[20px] p-4 flex flex-col gap-2.5 box-border">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-semibold text-slate-800">安全传输通道</span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-black/5 text-[#262626]">
                              WireGuard 零信任直连
                            </span>
                          </div>
                          <div className="flex flex-col gap-1.5 text-[11px] text-slate-600">
                            <div className="flex items-center justify-between">
                              <span className="text-slate-400">专线模式:</span>
                              <span className="font-medium text-slate-700 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                WireGuard 直连 (18ms)
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-slate-400">使用授权:</span>
                              <div className="flex items-center gap-1.5">
                                <span className="text-[#262626] font-medium">生效中</span>
                                <span className="font-mono text-slate-500 text-[10px] bg-slate-100 px-1.5 py-0.5 rounded">sk-relay-1006</span>
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => showToast('🔄 专线密钥已重新同步注入本地配置')}
                            className="w-full h-[32px] bg-white hover:bg-slate-50 text-[#0F172A] border border-[#E2E8F0] text-[12px] font-medium rounded-full flex items-center justify-center gap-1.5 transition-all cursor-pointer mt-1"
                          >
                            🔄 重新生成专线连接
                          </button>
                        </div>

                        {/* 使用方法 */}
                        <div className="w-full bg-white/80 border border-white rounded-[20px] p-4 flex flex-col gap-2 box-border">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-semibold text-blue-900">使用方法</span>
                            <span className="text-[10px] text-blue-600">终端直接运行</span>
                          </div>
                          <p className="text-[11px] text-blue-700 leading-[16px]">
                            打开任意终端工具 (如系统终端、iTerm 或 VS Code 终端)，输入下方命令回车即可：
                          </p>
                          <div className="flex items-center justify-between bg-white border border-[#E2E8F0] rounded-full px-4 py-2 mt-0.5">
                            <code className="font-mono text-[12px] font-bold text-slate-800">{activeAgent.quickCmd}</code>
                            <button
                              onClick={() => copyToClipboard(activeAgent.quickCmd, `📋 已复制启动命令: ${activeAgent.quickCmd}`)}
                              className="text-[12px] text-[#0F172A] font-medium cursor-pointer"
                            >
                              复制命令
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                  </div>

                  {/* 底部操作条 */}
                  <div className="w-full flex flex-row items-center justify-between pt-2.5 border-t border-[#E5E5E5]/60 box-border">
                    <span className="text-[11px] text-slate-400">随时可在设备管理切换失效/有效</span>
                    <button
                      onClick={() => showToast(`⚡️ ${activeAgent.title} 网络专线往返延迟: 18ms，通信正常！`)}
                      className="h-[28px] px-4 bg-[#0F172A] hover:bg-black rounded-[100px] flex items-center justify-center text-[11px] font-medium text-white transition-all whitespace-nowrap select-none cursor-pointer"
                    >
                      测试网络连接
                    </button>
                  </div>
                </div>

                {/* 第 2 列 (常用右列: OpenAI Codex, Antigravity CLI, Kimi Code) */}
                <div id="expanded-col-2" className="w-[243px] min-w-[243px] max-w-[243px] max-h-[503px] overflow-y-auto pr-1 flex flex-col items-start gap-[16px] flex-shrink-0 box-border transition-all duration-300 no-scrollbar" style={{ order: 2 }}>
                  {col2Agents.map(a => (
                    <div
                      key={a.id}
                      onClick={() => handleSelectCard(a.id)}
                      className="agent-card w-[243px] h-[157px] bg-white/80 border border-white rounded-[32px] pt-4 px-6 pb-4 flex flex-col items-start gap-4 box-border backdrop-blur-[10px] cursor-pointer flex-shrink-0 select-none transition-all hover:bg-white hover:scale-[1.01]"
                    >
                      <div className="w-[195px] h-[24px] flex flex-row justify-between items-start gap-2.5 box-border">
                        <div className="w-6 h-6 flex items-center justify-center flex-shrink-0">{a.svg}</div>
                        <span className={`h-[15px] text-[12px] leading-[15px] text-right whitespace-nowrap ${a.badge === '已安装' ? 'text-[#262626] font-medium' : 'text-[#A3A3A3]'}`}>
                          {a.badge}
                        </span>
                      </div>
                      <div className="flex flex-col items-start gap-1 box-border">
                        <h3 className="font-medium text-[16px] leading-[19px] text-[#262626] capitalize whitespace-nowrap">{a.title}</h3>
                        <p className="font-normal text-[12px] leading-[15px] text-[#A3A3A3] whitespace-nowrap overflow-hidden text-ellipsis max-w-[195px]">{a.sub}</p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectCard(a.id);
                        }}
                        className={`h-[31px] min-w-[72px] px-3 rounded-[100px] flex items-center justify-center text-[12px] font-medium leading-[15px] transition-all whitespace-nowrap select-none ${
                          a.btnDark ? 'bg-[#0F172A] hover:bg-black text-white' : 'bg-white/80 hover:bg-white text-[#0F172A] border border-[#E2E8F0]'
                        }`}
                      >
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
        {viewMode === 'devices' && (
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
                        <span className="font-semibold text-slate-900 text-sm">MacBook Pro (高相健)</span>
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      </div>
                      <span className="text-xs text-slate-400">3 keys · 当前本机 (MacOS 15.2)</span>
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
                      <span className="text-xs text-slate-400">1 keys · 移动端同步中</span>
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
                      <span className="text-xs text-slate-400">2 keys · 云端训练中继节点</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 右侧设备 Key 详情列表 */}
            <div className="flex-1 h-full p-8 flex flex-col justify-start items-start gap-4 box-border overflow-y-auto no-scrollbar">
              <div className="flex items-center justify-between w-full pb-3 border-b border-slate-200/60">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">当前设备活跃 Key 矩阵</h2>
                  <p className="text-xs text-slate-400">在云端针对单项工具一键切换失效或生效，杜绝 Key 泄露风险</p>
                </div>
                <button
                  onClick={() => showToast('🔑 已成功为当前设备新建专线专用 API Key')}
                  className="h-9 px-4 rounded-full bg-[#0F172A] hover:bg-black text-white text-xs font-medium cursor-pointer transition-all shadow-xs"
                >
                  + 新建设备 Key
                </button>
              </div>

              {/* Key 矩阵卡片 */}
              <div className="w-full flex flex-col gap-3">
                {[
                  { id: 'key_claude', tool: 'Claude Code', key: 'sk-relay-1006-clau...8831', statusKey: 'key_claude' },
                  { id: 'key_codex', tool: 'OpenAI Codex', key: 'sk-relay-1007-code...4419', statusKey: 'key_codex' },
                  { id: 'key_gemini', tool: 'Gemini CLI', key: 'sk-relay-1008-gemi...1102', statusKey: 'key_gemini' }
                ].map(item => {
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
                          className="h-8 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium cursor-pointer transition-colors"
                        >
                          复制
                        </button>
                        <button
                          onClick={() => {
                            setDeviceKeyStatusMap(prev => ({ ...prev, [item.statusKey]: !isActive }));
                            showToast(isActive ? `🔒 已切断 ${item.tool} 的专线访问` : `✅ 已重新启用 ${item.tool} 专线访问`);
                          }}
                          className={`h-8 px-3.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                            isActive ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {isActive ? '生效中' : '已停用'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* C. 出口安全中心 (Claude 403 焚决标准 / Google 准入标准) */}
        {/* ========================================================================= */}
        {viewMode === 'security' && (
          <div className="w-full flex-1 flex flex-col justify-between box-border overflow-hidden select-none">
            
            {/* 顶栏控制 */}
            <div className="w-full px-8 pt-5 pb-3 flex flex-row items-center justify-between box-border flex-shrink-0">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-3">
                  <h1 className="text-[22px] font-bold text-slate-900 tracking-tight leading-none m-0">
                    {securityVendor === 'claude' ? 'Claude 出口防封中心' : 'Google AI 区域准入中心'}
                  </h1>
                  <div className="flex items-center p-0.5 bg-slate-200/70 rounded-full text-[11px] font-medium ml-1">
                    <button
                      onClick={() => setSecurityVendor('claude')}
                      className={`px-3 py-1 rounded-full transition-all cursor-pointer whitespace-nowrap ${
                        securityVendor === 'claude' ? 'bg-amber-500 text-white font-medium' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Claude 403
                    </button>
                    <button
                      onClick={() => setSecurityVendor('google')}
                      className={`px-3 py-1 rounded-full transition-all cursor-pointer whitespace-nowrap ${
                        securityVendor === 'google' ? 'bg-blue-600 text-white font-medium' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Google AI
                    </button>
                  </div>
                </div>
                <p className="text-xs text-slate-400 font-normal m-0">
                  {securityVendor === 'claude' ? 'claude403 焚决标准 · 实时监控生效中' : 'Gemini / DeepMind 官方准入规范 · 实时监控生效中'}
                </p>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => copyToClipboard('NetBird WireGuard Zero-Trust Egress Report', '📋 已复制只读体检报告')}
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
              
              {/* 概要警报卡片 */}
              <div className="w-full min-h-[105px] bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs flex items-center gap-4 box-border flex-shrink-0">
                <div className={`w-11 h-11 rounded-2xl border flex items-center justify-center flex-shrink-0 ${
                  securityVendor === 'claude' ? 'bg-rose-50 border-rose-100 text-rose-500' : 'bg-blue-50 border-blue-100 text-blue-600'
                }`}>
                  <svg className="w-5 h-5 stroke-[2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-[15px] font-bold text-slate-900 leading-snug m-0">
                    发现 <span className="text-rose-600 font-bold">1 项高危</span> + <span className="text-amber-600 font-bold">2 项警告</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-1 m-0 leading-normal">
                    {securityVendor === 'claude'
                      ? 'IPv6 旁路泄露可能导致 403 封号，建议立即处理下方高危项。'
                      : '当前属于 US 官方准入区域，但检测到本机 IPv6 直连边缘节点，建议立即排查。'}
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

              {/* 风险条目 1: IPv6 旁路泄露 */}
              <div className="w-full bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs flex items-center justify-between gap-4 box-border">
                <div className="flex items-center gap-3">
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-600 border border-rose-200">高危</span>
                  <div className="flex flex-col">
                    <span className="font-semibold text-slate-900 text-sm">IPv6 旁路泄露检测 (Bypass Leak)</span>
                    <span className="text-xs text-slate-400 mt-0.5">Anthropic 会在握手时探测 IPv6 端点，直接暴露国内原生公网 IP</span>
                  </div>
                </div>
                <button
                  onClick={() => showToast('🛡️ 已开启本地零信任屏蔽规则，IPv6 旁路已完全阻断')}
                  className="h-8 px-3.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-medium cursor-pointer transition-all"
                >
                  一键屏蔽
                </button>
              </div>

              {/* 风险条目 2: DNS 分流与污染 */}
              <div className="w-full bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs flex items-center justify-between gap-4 box-border">
                <div className="flex items-center gap-3">
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-600 border border-amber-200">警告</span>
                  <div className="flex flex-col">
                    <span className="font-semibold text-slate-900 text-sm">DNS 解析分流纯净度 (DNS Leak)</span>
                    <span className="text-xs text-slate-400 mt-0.5">api.anthropic.com 域名需锁定由 NetBird 海外节点代理解析</span>
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

              {/* 正常项折叠面板 */}
              <div className="w-full bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs flex flex-col gap-3 box-border">
                <div
                  onClick={() => setIsPassedExpanded(prev => !prev)}
                  className="flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span className="font-semibold text-slate-900 text-sm">已通过检测项 (2项安全)</span>
                  </div>
                  <span className="text-xs text-slate-400">{isPassedExpanded ? '收起 ↑' : '展开详情 ↓'}</span>
                </div>

                {isPassedExpanded && (
                  <div className="flex flex-col gap-2 pt-2 border-t border-slate-100 text-xs text-slate-600">
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
                className="h-8 px-4 rounded-xl bg-[#1E293B] hover:bg-[#0F172A] text-white text-xs font-medium cursor-pointer transition-all active:scale-95 shadow-2xs"
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

      {toastMessage && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 bg-[#0F172A] text-white rounded-full text-xs font-medium border border-white/20 shadow-xl flex items-center gap-2 animate-bounce">
          {toastMessage}
        </div>
      )}

    </div>
  );
};
