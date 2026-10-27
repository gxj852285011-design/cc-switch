import type { ToolId, ToolCategory, AgentIconType, DeviceKeyStatus } from '../../types';

export interface AgentConfig {
  id: number;
  toolId: ToolId;
  category: ToolCategory;
  title: string;
  sub: string;
  badge: '未安装' | '已就绪' | '未配置' | '已失效' | '已安装';
  guide: string;
  iconType: AgentIconType;
  col: 1 | 2;
  btnLabel: string;
  btnDark: boolean;
  quickCmd: string;
  detected?: boolean;
  boundKeyId?: string;
  maskedKey?: string;
}

export const ALL_AGENTS: AgentConfig[] = [
  {
    id: 1,
    toolId: 'claude',
    category: 'official',
    title: 'Claude Code',
    sub: 'Anthropic 官方代码助手',
    badge: '未安装',
    col: 1,
    btnLabel: '一键安装',
    btnDark: false,
    quickCmd: 'claude',
    guide: 'Anthropic 官方智能编程智能体，擅长复杂工程理解与端到端代码实现。',
    detected: false,
    iconType: 'claude'
  },
  {
    id: 2,
    toolId: 'codex',
    category: 'official',
    title: 'OpenAI Codex',
    sub: 'OpenAI 官方编程终端',
    badge: '已安装',
    col: 1,
    btnLabel: '配置专线',
    btnDark: true,
    quickCmd: 'codex',
    guide: 'OpenAI 官方终端编程助手，深度集成 GPT-4o 代码推理与自动调试。',
    detected: true,
    iconType: 'openai'
  },
  {
    id: 3,
    toolId: 'gemini',
    category: 'official',
    title: 'Gemini CLI',
    sub: 'Google 官方开发助手',
    badge: '已安装',
    col: 1,
    btnLabel: '配置专线',
    btnDark: true,
    quickCmd: 'gemini',
    guide: 'Google 官方多模态智能体，具备超长上下文理解能力与全库代码分析。',
    detected: true,
    iconType: 'gemini'
  },
  {
    id: 4,
    toolId: 'agy',
    category: 'official',
    title: 'Google AGY',
    sub: 'Google 智能体开发套件',
    badge: '未安装',
    col: 2,
    btnLabel: '一键安装',
    btnDark: false,
    quickCmd: 'agy',
    guide: 'Google Antigravity 自主智能体平台，支持端到端任务规划与多智能体协同。',
    detected: false,
    iconType: 'agy'
  },
  {
    id: 5,
    toolId: 'grokbuild',
    category: 'official',
    title: 'Grok Build',
    sub: 'xAI 高性能工程智能体',
    badge: '未安装',
    col: 2,
    btnLabel: '一键安装',
    btnDark: false,
    quickCmd: 'grok',
    guide: 'xAI 打造的高吞吐、强推理开发辅助终端，适配大规模分布式代码构建。',
    detected: false,
    iconType: 'grok'
  },
  {
    id: 6,
    toolId: 'opencode',
    category: 'opensource',
    title: 'OpenCode',
    sub: '轻量终端编程智能体',
    badge: '未安装',
    col: 2,
    btnLabel: '一键安装',
    btnDark: false,
    quickCmd: 'opencode',
    guide: '极简终端原生 AI 辅助工具，内存占用极低，支持快速管道流交互。',
    detected: false,
    iconType: 'opencode'
  },
  {
    id: 7,
    toolId: 'openclaw',
    category: 'opensource',
    title: 'OpenClaw',
    sub: '全自主工程智能体',
    badge: '未安装',
    col: 2,
    btnLabel: '一键安装',
    btnDark: false,
    quickCmd: 'claw',
    guide: '开源代码审查与多步自主架构重构引擎，具备严苛红队代码审查能力。',
    detected: false,
    iconType: 'claw'
  },
  {
    id: 8,
    toolId: 'claude-desktop',
    category: 'desktop',
    title: 'Claude Desktop',
    sub: '官方桌面图形客户端',
    badge: '未安装',
    col: 2,
    btnLabel: '官网下载',
    btnDark: false,
    quickCmd: 'open /Applications/Claude.app',
    guide: 'Anthropic 官方桌面视窗软件，支持原生 MCP 插件与系统级上下文桥接。',
    detected: false,
    iconType: 'claude'
  },
  {
    id: 9,
    toolId: 'hermes',
    category: 'opensource',
    title: 'Hermes Agent',
    sub: 'Nous 开源函数调用框架',
    badge: '未安装',
    col: 2,
    btnLabel: '一键安装',
    btnDark: false,
    quickCmd: 'hermes',
    guide: '基于开源权重优化的智能体工具链，提供高稳定性 Tool Calling 与本地推理。',
    detected: false,
    iconType: 'hermes'
  },
  {
    id: 10,
    toolId: 'pi',
    category: 'opensource',
    title: 'Pi Coding Bot',
    sub: '对话引导式结对终端',
    badge: '未安装',
    col: 2,
    btnLabel: '一键安装',
    btnDark: false,
    quickCmd: 'pi-agent',
    guide: '富有同理心的引导式结对编程终端，帮助梳理逻辑、优化设计架构。',
    detected: false,
    iconType: 'pi'
  },
  {
    id: 11,
    toolId: 'omp',
    category: 'opensource',
    title: 'OMP Platform',
    sub: '开放多模型并行调度',
    badge: '未安装',
    col: 2,
    btnLabel: '一键安装',
    btnDark: false,
    quickCmd: 'omp',
    guide: '跨模型竞态比对与负载均衡运行时，支持同一 Prompt 多厂商并发评测。',
    detected: false,
    iconType: 'omp'
  },
  {
    id: 12,
    toolId: 'kimi',
    category: 'domestic',
    title: 'Kimi Code CLI',
    sub: '月之暗面长文本代码终端',
    badge: '未安装',
    col: 2,
    btnLabel: '一键安装',
    btnDark: false,
    quickCmd: 'kimi',
    guide: '国内领先 200 万字上下文代码智能体，支持全仓代码检索与跨文件修改。',
    detected: false,
    iconType: 'kimi'
  },
  {
    id: 13,
    toolId: 'mcode',
    category: 'domestic',
    title: 'MiniMax Code',
    sub: 'MoE 超大规模代码助手',
    badge: '未安装',
    col: 2,
    btnLabel: '一键安装',
    btnDark: false,
    quickCmd: 'mcode',
    guide: 'MiniMax 生产级 MoE 代码助手，超高吞吐、毫秒级响应生成。',
    detected: false,
    iconType: 'minimax'
  }
];

export interface DeviceKeyModel {
  id: number;
  keyId: string;
  toolId: ToolId;
  title: string;
  key: string;
  status: DeviceKeyStatus;
  iconType: AgentIconType;
}

export const INITIAL_DEVICE_KEYS: DeviceKeyModel[] = [
  { id: 1, keyId: 'key_cld_01', toolId: 'claude-desktop', title: 'Claude Desktop', key: 'sk-relay-cld...8f1a', status: 'active', iconType: 'claude' },
  { id: 2, keyId: 'key_cdx_01', toolId: 'codex', title: 'OpenAI Codex', key: 'sk-relay-cdx...990e', status: 'disabled', iconType: 'openai' },
  { id: 3, keyId: 'key_gem_01', toolId: 'gemini', title: 'Gemini CLI', key: 'sk-relay-gem...4e2f', status: 'disabled', iconType: 'gemini' },
  { id: 4, keyId: 'key_opn_01', toolId: 'opencode', title: 'OpenCode', key: 'sk-relay-opn...3a1c', status: 'disabled', iconType: 'opencode' },
  { id: 5, keyId: 'key_grk_01', toolId: 'grokbuild', title: 'Grok Build', key: 'sk-relay-grk...7b90', status: 'disabled', iconType: 'grok' },
  { id: 6, keyId: 'key_cld_02', toolId: 'claude', title: 'Claude Code', key: 'sk-relay-cld...11d2', status: 'disabled', iconType: 'claude' },
  { id: 7, keyId: 'key_kimi_01', toolId: 'kimi', title: 'Kimi Code', key: 'sk-relay-kimi...5c31', status: 'disabled', iconType: 'kimi' },
  { id: 8, keyId: 'key_mmx_01', toolId: 'mcode', title: 'MiniMax Code', key: 'sk-relay-mmx...0a8b', status: 'disabled', iconType: 'minimax' },
];

export const DEVICES = [
  { id: 1, name: 'MacBook Pro (高相健)', tag: '本机', keysCount: 4, status: 'online' },
  { id: 2, name: 'Mac Studio (办公室)', tag: '远端', keysCount: 3, status: 'online' },
  { id: 3, name: 'Mac Mini (构建机)', tag: '远端', keysCount: 2, status: 'offline' },
  { id: 4, name: 'Linux Server (GPU节点)', tag: '远端', keysCount: 4, status: 'online' },
];

export const CATEGORY_TABS: { id: ToolCategory; label: string; count: number }[] = [
  { id: 'all', label: '全部', count: 13 },
  { id: 'official', label: '官方主流', count: 5 },
  { id: 'desktop', label: '桌面端', count: 1 },
  { id: 'opensource', label: '开源智能体', count: 5 },
  { id: 'domestic', label: '国产大模型', count: 2 },
];
