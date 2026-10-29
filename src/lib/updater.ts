import { getVersion } from "@tauri-apps/api/app";

export type UpdateChannel = "stable" | "beta";

export interface UpdateInfo {
  currentVersion: string;
  availableVersion: string;
  notes?: string;
  pubDate?: string;
  downloadUrl?: string;
}

export interface CheckOptions {
  timeout?: number;
  channel?: UpdateChannel;
}

export const APP_CURRENT_VERSION = "4.2.1";

/**
 * 语义化版本比对:
 * 返回 1 表示 v1 > v2 (v1 较新)
 * 返回 -1 表示 v1 < v2
 * 返回 0 表示版本一致
 */
export function compareSemver(v1: string, v2: string): number {
  const clean = (v: string) => v.replace(/^v/i, "").trim();
  const p1 = clean(v1).split(".").map(n => parseInt(n, 10) || 0);
  const p2 = clean(v2).split(".").map(n => parseInt(n, 10) || 0);
  const maxLen = Math.max(p1.length, p2.length);
  for (let i = 0; i < maxLen; i++) {
    const num1 = p1[i] ?? 0;
    const num2 = p2[i] ?? 0;
    if (num1 > num2) return 1;
    if (num1 < num2) return -1;
  }
  return 0;
}

export async function getCurrentVersion(): Promise<string> {
  try {
    const v = await getVersion();
    if (v) return v;
  } catch {
    // 非 Tauri 环境容灾回退
  }
  return APP_CURRENT_VERSION;
}

export async function checkForUpdate(
  opts: CheckOptions = {},
): Promise<
  { status: "up-to-date"; currentVersion: string } | { status: "available"; info: UpdateInfo }
> {
  const currentVersion = await getCurrentVersion();

  // 1. 优先通过可靠 CDN 静态清单 (GitHub Pages) 校验，避免 GitHub API 403 频控与 Tauri 插件签名阶段性缺失
  const manifestUrls = [
    "https://gxj852285011-design.github.io/cc-switch/version.json",
    "https://raw.githubusercontent.com/gxj852285011-design/cc-switch/main/docs/version.json"
  ];

  for (const url of manifestUrls) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), opts.timeout ?? 6000);
      const resp = await fetch(url, {
        headers: { "Cache-Control": "no-cache" },
        signal: controller.signal
      });
      clearTimeout(timer);

      if (resp.ok) {
        const data = await resp.json();
        const remoteVersion = data.version;
        if (remoteVersion && compareSemver(remoteVersion, currentVersion) > 0) {
          return {
            status: "available",
            info: {
              currentVersion,
              availableVersion: remoteVersion,
              notes: data.notes,
              pubDate: data.pub_date,
              downloadUrl: data.download_url
            }
          };
        } else if (remoteVersion) {
          // 确认版本号已对齐或无需升级
          return { status: "up-to-date", currentVersion };
        }
      }
    } catch {
      // 容灾继续尝试下一个清单或原生插件
    }
  }

  // 2. 尝试 Tauri 原生 updater 插件
  try {
    const { check } = await import("@tauri-apps/plugin-updater");
    const update = await check({ timeout: opts.timeout ?? 8000 } as any);

    if (update && (update as any).version) {
      const remoteVersion = (update as any).version;
      if (compareSemver(remoteVersion, currentVersion) > 0) {
        return {
          status: "available",
          info: {
            currentVersion,
            availableVersion: remoteVersion,
            notes: (update as any).notes,
            pubDate: (update as any).date,
          }
        };
      }
    }
  } catch {
    // 忽略异常
  }

  return { status: "up-to-date", currentVersion };
}
