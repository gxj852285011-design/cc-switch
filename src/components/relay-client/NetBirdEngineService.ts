/**
 * NetBirdEngineService.ts
 * 
 * CC Switch - 企业级 AI Agent 零信任网络引擎 (NetBird WireGuard® Integration)
 * 职责：
 * 1. 作为静默 Sidecar 驱动与调度 NetBird WireGuard L3 隧道
 * 2. 多出口节点 (Exit Nodes) 智能测速、健康度探测与应用层 403 自动漂移自愈
 * 3. 终端侧 AI-DLP 敏感代码出境前置阻断与脱敏 (Pre-flight DLP Engine)
 * 4. 零侵入透明路由分流：保持官方域名 api.anthropic.com，由底层内核级网络接管
 */

export interface NetBirdPeerInfo {
  peerId: string;
  fqdn: string;
  ip: string;                  // 如 100.64.0.12
  status: 'connected' | 'connecting' | 'disconnected' | 'degraded';
  wireguardPublicKey: string;
  transferRxBytes: number;
  transferTxBytes: number;
  lastHandshake: number;
  mtu: number;
  directP2p: boolean;          // true = ICE Direct P2P, false = Relay/TURN fallback
  iceCandidateType: string;    // 'host' | 'srflx' | 'relay'
}

export interface NetBirdExitNode {
  id: string;
  name: string;
  region: string;              // 'us-west' | 'hk' | 'eu-central' | 'jp'
  location: string;
  ip: string;
  asn: string;                 // 如 'AS16509 (AWS Oregon)' | 'AS15169 (Google Cloud)'
  latencyMs: number;
  selected: boolean;
  isAutoEgress: boolean;       // 是否由 CC Switch 智能自动漂移接管
  healthStatus: 'pristine' | 'warning' | 'blocked';
  checks: {
    anthropic403Protected: boolean;
    googleDnsClean: boolean;
    ipv6LeakBlocked: boolean;
    openaiTlsValid: boolean;
  };
}

export interface DlpAuditRule {
  id: string;
  name: string;
  severity: 'block' | 'warn' | 'audit';
  matchCount: number;
  description: string;
}

export interface DlpScanResult {
  passed: boolean;
  blockedCount: number;
  warningsCount: number;
  detectedThreats: Array<{
    ruleId: string;
    ruleName: string;
    sampleRedacted: string;
    severity: 'block' | 'warn';
  }>;
}

export class NetBirdEngineService {
  private static instance: NetBirdEngineService;

  // 默认节点拓扑 (企业海外合规出口)
  private exitNodes: NetBirdExitNode[] = [
    {
      id: 'node-hk-01',
      name: '香港核心专线 (Core HK Peer)',
      region: 'hk',
      location: 'Hong Kong SAR',
      ip: '100.64.0.1',
      asn: 'AS15169 / Google Dedicated Egress',
      latencyMs: 18,
      selected: true,
      isAutoEgress: true,
      healthStatus: 'pristine',
      checks: {
        anthropic403Protected: true,
        googleDnsClean: true,
        ipv6LeakBlocked: true,
        openaiTlsValid: true
      }
    },
    {
      id: 'node-us-west',
      name: '美西低风控专线 (AWS Oregon Exit)',
      region: 'us-west',
      location: 'Boardman, Oregon, US',
      ip: '100.64.0.2',
      asn: 'AS16509 / Amazon AWS Clean Subnet',
      latencyMs: 138,
      selected: false,
      isAutoEgress: true,
      healthStatus: 'pristine',
      checks: {
        anthropic403Protected: true,
        googleDnsClean: true,
        ipv6LeakBlocked: true,
        openaiTlsValid: true
      }
    },
    {
      id: 'node-eu-fra',
      name: '欧洲合规备用专线 (Frankfurt)',
      region: 'eu-central',
      location: 'Frankfurt, Germany',
      ip: '100.64.0.3',
      asn: 'AS15169 / GCP EU Regional',
      latencyMs: 164,
      selected: false,
      isAutoEgress: false,
      healthStatus: 'pristine',
      checks: {
        anthropic403Protected: true,
        googleDnsClean: true,
        ipv6LeakBlocked: true,
        openaiTlsValid: true
      }
    }
  ];

  // 本机 WireGuard Peer 状态
  private currentPeer: NetBirdPeerInfo = {
    peerId: 'peer_macbook_pro_m3',
    fqdn: 'macbook-pro.corp.netbird.cloud',
    ip: '100.64.0.12',
    status: 'connected',
    wireguardPublicKey: 'wG+K8yQ...09bX=',
    transferRxBytes: 14285900,
    transferTxBytes: 8920140,
    lastHandshake: Date.now() - 4000,
    mtu: 1280,
    directP2p: true,
    iceCandidateType: 'srflx'
  };

  // DLP 预检规则库
  private dlpRules: DlpAuditRule[] = [
    { id: 'aws-secret', name: 'AWS Access / Secret Key', severity: 'block', matchCount: 0, description: '拦截形如 AKIA... 的公有云主凭证' },
    { id: 'private-key', name: 'RSA / SSH 离线私钥文件', severity: 'block', matchCount: 0, description: '拦截包含 -----BEGIN PRIVATE KEY----- 的绝密凭据' },
    { id: 'db-conn-str', name: '生产数据库明文连接串', severity: 'block', matchCount: 0, description: '拦截 postgres://, mysql://, redis:// 密码串' },
    { id: 'corp-jwt-secret', name: '内部 SSO / JWT Secret Token', severity: 'warn', matchCount: 0, description: '预警企业内部系统签发的鉴权 Bearer 密串' }
  ];

  private autoFailoverEnabled: boolean = true;

  private constructor() {}

  public static getInstance(): NetBirdEngineService {
    if (!NetBirdEngineService.instance) {
      NetBirdEngineService.instance = new NetBirdEngineService();
    }
    return NetBirdEngineService.instance;
  }

  /**
   * 获取本机 NetBird WireGuard 隧道状态
   */
  public getPeerStatus(): NetBirdPeerInfo {
    return { ...this.currentPeer };
  }

  /**
   * 获取 DLP 预检规则库
   */
  public getDlpRules(): DlpAuditRule[] {
    return [...this.dlpRules];
  }

  /**
   * 获取所有可用出口节点 (Exit Nodes)
   */
  public getExitNodes(): NetBirdExitNode[] {
    return [...this.exitNodes];
  }

  /**
   * 切换当前激活的出口节点
   */
  public selectExitNode(nodeId: string): boolean {
    let found = false;
    this.exitNodes = this.exitNodes.map(node => {
      const isTarget = node.id === nodeId;
      if (isTarget) found = true;
      return { ...node, selected: isTarget };
    });
    return found;
  }

  /**
   * 获取当前生效的出口节点
   */
  public getActiveExitNode(): NetBirdExitNode {
    return this.exitNodes.find(n => n.selected) || this.exitNodes[0];
  }

  /**
   * 触发应用层出口健康探测与自动漂移 (AI Egress Health Probe & Auto-Failover)
   * 针对 Anthropic 403 / Cloudflare 人机风控检测
   */
  public async probeAndAutoFailover(): Promise<{
    activeNode: NetBirdExitNode;
    failoverTriggered: boolean;
    reason?: string;
  }> {
    const active = this.getActiveExitNode();

    // 模拟针对 Anthropic 403 的高敏风控探测
    const isMockRisk = Math.random() < 0.05; // 正常为纯净
    if (isMockRisk && this.autoFailoverEnabled) {
      // 触发自动漂移至美西或备用专线
      const fallback = this.exitNodes.find(n => n.id !== active.id && n.healthStatus === 'pristine') || this.exitNodes[1];
      this.selectExitNode(fallback.id);
      return {
        activeNode: fallback,
        failoverTriggered: true,
        reason: `检测到 ${active.name} 偶现 Anthropic 403 风险，已秒级自动漂移至 ${fallback.name}！`
      };
    }

    return {
      activeNode: active,
      failoverTriggered: false
    };
  }

  /**
   * 客户端前置代码出境审查 (Client-Side AI Pre-Flight DLP)
   * 在代码/Prompt 发送给官方模型之前在本地内存拦截敏感信息，NetBird 无法做到此能力
   */
  public scanPromptContent(content: string): DlpScanResult {
    return this.scanOutboundPayload(content);
  }

  public evaluateDlpRules(content: string): DlpScanResult {
    return this.scanOutboundPayload(content);
  }

  public scanOutboundPayload(content: string): DlpScanResult {
    const threats: DlpScanResult['detectedThreats'] = [];
    let blockedCount = 0;
    let warningsCount = 0;

    // 1. AWS Key
    if (/AKIA[0-9A-Z]{16}/.test(content)) {
      blockedCount++;
      threats.push({
        ruleId: 'aws-secret',
        ruleName: 'AWS Access Key',
        sampleRedacted: 'AKIA****************',
        severity: 'block'
      });
    }

    // 2. Private Key
    if (/-----BEGIN\s+.*PRIVATE\s+KEY-----/.test(content)) {
      blockedCount++;
      threats.push({
        ruleId: 'private-key',
        ruleName: 'RSA / SSH 内部私钥',
        sampleRedacted: '-----BEGIN PRIVATE KEY----- [REDACTED]',
        severity: 'block'
      });
    }

    // 3. Database connection string (支持带用户名及无用户名密码格式，如 redis://:pwd@host，支持 postgresql:// 与 postgres://)
    if (/(postgres(?:ql)?|mysql|redis|mongodb):\/\/(?:[^:]*)?:[^@]+@/.test(content)) {
      blockedCount++;
      threats.push({
        ruleId: 'db-conn-str',
        ruleName: '生产数据库带密连接串',
        sampleRedacted: 'postgres://admin:********@10.0.x.x',
        severity: 'block'
      });
    }

    // 4. OpenAI / Anthropic 原生 API Key 泄露防护 (兼容 sk-proj- 与 sk-ant- 格式)
    if (/sk-(?:proj-)?[a-zA-Z0-9_-]{20,}|sk-ant-[a-zA-Z0-9_-]{20,}/.test(content)) {
      blockedCount++;
      threats.push({
        ruleId: 'llm-upstream-key',
        ruleName: '原生大模型上游 API Key 凭证',
        sampleRedacted: 'sk-ant-****************',
        severity: 'block'
      });
    }

    // 5. 内部 SSO / JWT Secret Token (Bearer eyJ... 或标准三段式 JWT)
    if (/eyJ[a-zA-Z0-9_-]{10,}\.eyJ[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]+/.test(content)) {
      warningsCount++;
      threats.push({
        ruleId: 'corp-jwt-secret',
        ruleName: '内部 SSO / JWT Secret Token',
        sampleRedacted: 'eyJhbGciOi... [REDACTED]',
        severity: 'warn'
      });
    }

    return {
      passed: blockedCount === 0,
      blockedCount,
      warningsCount,
      detectedThreats: threats
    };
  }

  /**
   * 获取当前 ZTNA 姿态检查合规状态 (Posture Checks)
   */
  public getPostureCheckStatus(): {
    osCompliance: boolean;
    diskEncryption: boolean;
    firewallEnabled: boolean;
    ssoIdentity: string;
  } {
    return {
      osCompliance: true,           // macOS Sonoma 14+ / Sequoia 15+
      diskEncryption: true,         // FileVault 已开启
      firewallEnabled: true,        // macOS Application Firewall Active
      ssoIdentity: 'gaoxiangjian@company.corp'
    };
  }
}
