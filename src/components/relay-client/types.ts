export type ToolId = 
  | 'claude' 
  | 'codex' 
  | 'gemini' 
  | 'agy' 
  | 'grokbuild' 
  | 'opencode' 
  | 'openclaw' 
  | 'claude-desktop' 
  | 'codex-desktop'
  | 'chatgpt'
  | 'hermes' 
  | 'pi' 
  | 'omp' 
  | 'kimi' 
  | 'mcode'
  // 保持向后兼容别名
  | 'claude-code' 
  | 'grok';

export type ToolCategory = 'all' | 'official' | 'desktop' | 'opensource' | 'domestic';

export type ToolStatus = 
  | 'ready'            // 正常运行，API 有效
  | 'uninstalled-cli'  // 未安装 (CLI 本地安装)
  | 'uninstalled-gui'  // 未安装 (GUI 官网下载)
  | 'unconfigured'     // 未配置 (需要分配中转 Key)
  | 'revoked';         // 云端已停用/失效 (中转站设备管理关闭了权限)

export type AgentIconType = 
  | 'claude' 
  | 'openai' 
  | 'gemini' 
  | 'agy' 
  | 'grok' 
  | 'opencode' 
  | 'claw' 
  | 'hermes' 
  | 'pi' 
  | 'omp' 
  | 'kimi' 
  | 'minimax';

export interface ToolItem {
  id: ToolId;
  name: string;
  subtitle: string;
  type: 'cli' | 'gui';
  category: ToolCategory;
  iconType: AgentIconType;
  status: ToolStatus;
  configPath?: string;
  version?: string;
  latency?: number;
  installCommand?: string;
  officialUrl?: string;
  detected?: boolean;
  detectedPath?: string;
  boundKeyId?: string;       // 绑定的云端设备 Key ID
  maskedKey?: string;        // 脱敏显示的主 Key
}

export interface UserRelayAccount {
  userId: string;
  username: string;
  vipTier: string;
  balanceUsd: number;
  monthUsedUsd: number;
  currentGateway: string;
  gatewayLatencyMs: number;
  token: string;
}

export type DeviceKeyStatus = 'active' | 'disabled' | 'revoked';

export interface DeviceKeyItem {
  id: string;               // Key 唯一 ID，如 "key_cdx_990e"
  deviceId: string;         // 所属设备 ID
  toolId: ToolId;           // 绑定的工具
  title: string;            // 展示名称，如 "OpenAI Codex"
  iconType: AgentIconType;  // 图标标识
  key: string;              // 脱敏显示的 key，如 "sk-relay-...4e2f"
  status: DeviceKeyStatus;  // 'active' 正常生效 | 'disabled' 已手动失效
  quotaUsedUsd?: number;    // 该 key 累计用量
  createdAt: number;
  lastUsedAt?: number;
}

export interface CloudDeviceItem {
  id: string;
  name: string;
  tag: string;              // 如 "macOS", "Windows"
  isCurrentDevice: boolean;
  keysCount: number;
  status: 'online' | 'offline';
  enabled: boolean;         // 整个设备是否开启连接
}
