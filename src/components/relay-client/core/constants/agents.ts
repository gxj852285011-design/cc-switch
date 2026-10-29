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
    toolId: 'claude-desktop',
    category: 'desktop',
    title: 'Claude 桌面端',
    sub: 'Anthropic 官方桌面客户端',
    badge: '已安装',
    col: 1,
    btnLabel: '配置专线',
    btnDark: false,
    quickCmd: 'open -a Claude',
    guide: 'Anthropic 官方桌面应用，原生支持全仓项目交互、MCP 工具服务器扩展，纯净海外专线加速防封。',
    detected: true,
    iconType: 'claude'
  },
  {
    id: 2,
    toolId: 'claude',
    category: 'official',
    title: 'Claude Code (CLI)',
    sub: 'Anthropic 终端原生工程 Agent',
    badge: '已安装',
    col: 1,
    btnLabel: '配置专线',
    btnDark: false,
    quickCmd: 'claude',
    guide: 'Anthropic 官方终端智能体，擅长复杂工程全仓代码理解与端到端自动化实现，一键注入海外专线。',
    detected: true,
    iconType: 'claude'
  },
  {
    id: 3,
    toolId: 'chatgpt',
    category: 'desktop',
    title: 'Codex / ChatGPT 桌面端',
    sub: 'OpenAI 官方桌面端 · 已就绪',
    badge: '已安装',
    col: 1,
    btnLabel: '已配置',
    btnDark: true,
    quickCmd: 'open -a ChatGPT',
    guide: 'OpenAI 官方原生 AI 桌面应用，深度集成 Canvas 协同画布与语音交互，由纯净海外专线接管出口。',
    detected: true,
    iconType: 'openai'
  },
  {
    id: 4,
    toolId: 'codex',
    category: 'official',
    title: 'Codex CLI',
    sub: 'OpenAI 官方终端编程智能体',
    badge: '已安装',
    col: 2,
    btnLabel: '配置专线',
    btnDark: false,
    quickCmd: 'codex',
    guide: 'OpenAI 官方终端代码助手，深度集成 GPT-4o / o1 代码推理、补丁生成与自动调试，专线直连。',
    detected: true,
    iconType: 'openai'
  },
  {
    id: 5,
    toolId: 'hermes',
    category: 'desktop',
    title: 'Hermes 客户端',
    sub: 'Nous Research 顶级开源自主智能体',
    badge: '已安装',
    col: 2,
    btnLabel: '配置专线',
    btnDark: false,
    quickCmd: 'open -a Hermes 2>/dev/null || hermes',
    guide: 'Nous Research 顶级开源自主推理智能体，具备长程链式规划与工具协同调用能力，专线加速直连。',
    detected: true,
    iconType: 'hermes'
  },
  {
    id: 6,
    toolId: 'openclaw',
    category: 'desktop',
    title: 'OpenClaw 客户端',
    sub: '全自主工程架构智能体',
    badge: '已安装',
    col: 2,
    btnLabel: '配置专线',
    btnDark: false,
    quickCmd: 'open -a OpenClaw 2>/dev/null || openclaw',
    guide: '开源代码审查与多步自主架构重构引擎，具备严苛红队代码审查能力，开箱即用。',
    detected: true,
    iconType: 'claw'
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
  {
    id: 1,
    keyId: 'key_claude_desktop',
    toolId: 'claude-desktop',
    title: 'Claude 桌面端',
    key: 'sk-relay-claude-mbp-88',
    status: 'active',
    iconType: 'claude'
  },
  {
    id: 2,
    keyId: 'key_chatgpt',
    toolId: 'chatgpt',
    title: 'Codex / ChatGPT 桌面端',
    key: 'sk-relay-chatgp-mbp-88',
    status: 'active',
    iconType: 'codex'
  },
  {
    id: 3,
    keyId: 'key_codex',
    toolId: 'codex',
    title: 'Codex CLI',
    key: 'sk-relay-codex-cli-88',
    status: 'active',
    iconType: 'codex'
  }
];

export const DEVICES = [
  { id: 1, name: 'MacBook Pro (本机工作站)', tag: '本机', keysCount: 2, status: 'online' },
  { id: 2, name: 'Mac Studio (办公室)', tag: '远端', keysCount: 1, status: 'online' },
  { id: 3, name: 'Mac Mini (构建机)', tag: '远端', keysCount: 0, status: 'offline' },
  { id: 4, name: 'Ubuntu Server (AI 专线节点)', tag: '远端', keysCount: 2, status: 'online' },
];

export const CATEGORY_TABS: { id: ToolCategory; label: string; count: number }[] = [
  { id: 'all', label: '全部', count: 6 },
  { id: 'desktop', label: '桌面端 GUI', count: 4 },
  { id: 'official', label: '终端 CLI', count: 2 },
  { id: 'opensource', label: '开源智能体', count: 2 }
];
