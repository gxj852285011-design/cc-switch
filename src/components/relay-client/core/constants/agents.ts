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
    toolId: 'doubao' as unknown as ToolId,
    category: 'domestic',
    title: '豆包 桌面端',
    sub: '字节跳动 官方 AI 桌面端',
    badge: '已安装',
    col: 1,
    btnLabel: '配置专线',
    btnDark: false,
    quickCmd: 'open -a Doubao',
    guide: '字节跳动旗舰 AI 桌面客户端，全能 AI 搜索、智能写作与多模态交互，专线加速直连。',
    detected: true,
    iconType: 'domestic' as unknown as AgentIconType
  },
  {
    id: 2,
    toolId: 'kimi',
    category: 'domestic',
    title: 'Kimi 桌面端',
    sub: '月之暗面 官方长文本桌面端',
    badge: '已安装',
    col: 1,
    btnLabel: '配置专线',
    btnDark: false,
    quickCmd: 'open -a "Kimi Code"',
    guide: '月之暗面官方长文本与深度文档问答客户端，数十万字长资料秒级解析与全能研报提炼。',
    detected: true,
    iconType: 'kimi'
  },
  {
    id: 3,
    toolId: 'yuanbao' as unknown as ToolId,
    category: 'domestic',
    title: '腾讯元宝 桌面端',
    sub: '腾讯官方 AI 桌面助手',
    badge: '未安装',
    col: 1,
    btnLabel: '安装客户端',
    btnDark: false,
    quickCmd: 'open -a "腾讯元宝"',
    guide: '腾讯混元大模型官方桌面客户端，深度连接微信公众号生态与腾讯文档，专业级搜索创作。',
    detected: false,
    iconType: 'domestic' as unknown as AgentIconType
  },
  {
    id: 4,
    toolId: 'codex-desktop' as unknown as ToolId,
    category: 'desktop',
    title: 'ChatGPT 桌面端',
    sub: 'OpenAI 官方桌面端 · 已就绪',
    badge: '已安装',
    col: 2,
    btnLabel: '已配置',
    btnDark: true,
    quickCmd: 'open -a ChatGPT',
    guide: 'OpenAI 全球顶尖 AI 桌面应用，深度集成 Canvas 协同画布与语音交互，由纯净海外专线接管。',
    detected: true,
    iconType: 'openai'
  },
  {
    id: 5,
    toolId: 'tongyi' as unknown as ToolId,
    category: 'domestic',
    title: '通义 桌面端',
    sub: '阿里巴巴 官方 AI 办公桌面端',
    badge: '未安装',
    col: 2,
    btnLabel: '安装客户端',
    btnDark: false,
    quickCmd: 'open -a "通义"',
    guide: '阿里巴巴通义千问官方桌面助手，深度赋能实时会议音视频转写速读与专业级办公创作。',
    detected: false,
    iconType: 'domestic' as unknown as AgentIconType
  },
  {
    id: 6,
    toolId: 'zhipu' as unknown as ToolId,
    category: 'domestic',
    title: '智谱清言 桌面端',
    sub: '智谱 AI / GLM 官方桌面端',
    badge: '未安装',
    col: 2,
    btnLabel: '安装客户端',
    btnDark: false,
    quickCmd: 'open -a "智谱清言"',
    guide: '清华系顶尖大模型官方桌面客户端，拥有超强中文代码与逻辑分析能力，内置丰富智能体生态。',
    detected: false,
    iconType: 'domestic' as unknown as AgentIconType
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
  { id: 1, keyId: 'key_gpt_01', toolId: 'codex-desktop' as unknown as ToolId, title: 'ChatGPT 桌面端', key: 'sk-relay-gpt...8f1a', status: 'active', iconType: 'openai' },
  { id: 2, keyId: 'key_dou_01', toolId: 'doubao' as unknown as ToolId, title: '豆包 桌面端', key: 'sk-relay-dou...990e', status: 'active', iconType: 'domestic' as unknown as AgentIconType },
  { id: 3, keyId: 'key_kim_01', toolId: 'kimi', title: 'Kimi 桌面端', key: 'sk-relay-kim...4e2f', status: 'active', iconType: 'kimi' },
  { id: 4, keyId: 'key_yba_01', toolId: 'yuanbao' as unknown as ToolId, title: '腾讯元宝 桌面端', key: 'sk-relay-yba...3a1c', status: 'disabled', iconType: 'domestic' as unknown as AgentIconType },
  { id: 5, keyId: 'key_tyi_01', toolId: 'tongyi' as unknown as ToolId, title: '通义 桌面端', key: 'sk-relay-tyi...7b90', status: 'disabled', iconType: 'domestic' as unknown as AgentIconType },
  { id: 6, keyId: 'key_zpu_01', toolId: 'zhipu' as unknown as ToolId, title: '智谱清言 桌面端', key: 'sk-relay-zpu...11d2', status: 'disabled', iconType: 'domestic' as unknown as AgentIconType },
];

export const DEVICES = [
  { id: 1, name: 'MacBook Pro (高相健)', tag: '本机', keysCount: 3, status: 'online' },
  { id: 2, name: 'Mac Studio (办公室)', tag: '远端', keysCount: 2, status: 'online' },
  { id: 3, name: 'Mac Mini (构建机)', tag: '远端', keysCount: 2, status: 'offline' },
  { id: 4, name: 'Ubuntu Server (AI 专线节点)', tag: '远端', keysCount: 3, status: 'online' },
];

export const CATEGORY_TABS: { id: ToolCategory; label: string; count: number }[] = [
  { id: 'all', label: '全部', count: 6 },
  { id: 'desktop', label: '知名大厂桌面端', count: 6 },
  { id: 'official', label: '国际大厂', count: 1 },
  { id: 'domestic', label: '国内大厂', count: 5 }
];
