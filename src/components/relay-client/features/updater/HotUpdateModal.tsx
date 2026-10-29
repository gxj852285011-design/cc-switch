import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { checkForUpdate, getCurrentVersion, APP_CURRENT_VERSION, type UpdateInfo } from '@/lib/updater';

interface HotUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessToast?: (msg: string) => void;
  initialUpdateInfo?: UpdateInfo | null;
}

export const HotUpdateModal: React.FC<HotUpdateModalProps> = ({
  isOpen,
  onClose,
  onSuccessToast,
  initialUpdateInfo
}) => {
  const [currentVersion, setCurrentVersion] = useState<string>(APP_CURRENT_VERSION);
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(initialUpdateInfo || null);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [downloadProgress, setDownloadProgress] = useState<number>(0);
  const [downloadedBytes, setDownloadedBytes] = useState<number>(0);
  const [totalBytes, setTotalBytes] = useState<number>(0);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const unlistenRef = useRef<(() => void) | null>(null);

  // 初始化获取当前应用版本
  useEffect(() => {
    getCurrentVersion().then(v => {
      if (v) setCurrentVersion(v);
    }).catch(() => {});
  }, []);

  // 同步外部传入的 UpdateInfo
  useEffect(() => {
    if (initialUpdateInfo) {
      setUpdateInfo(initialUpdateInfo);
    }
  }, [initialUpdateInfo]);

  // 执行检查更新
  const handleCheckUpdate = useCallback(async () => {
    setIsChecking(true);
    setErrorMessage(null);
    setStatusMessage('正在连接官方更新服务器...');

    try {
      const res = await checkForUpdate({ timeout: 15000 });
      if (res.status === 'available') {
        setUpdateInfo(res.info);
        setStatusMessage(`发现新版本 v${res.info.availableVersion}`);
      } else {
        setUpdateInfo(null);
        setStatusMessage('当前已是最新版本，无需更新');
        if (onSuccessToast) {
          onSuccessToast('🎉 当前已是最新版本');
        }
      }
    } catch (err: any) {
      console.warn('Check update error:', err);
      setErrorMessage(err?.message || '检查更新失败，请检查网络或稍后重试');
    } finally {
      setIsChecking(false);
    }
  }, [onSuccessToast]);

  // 打开弹窗且无初始更新信息时自动检查一次
  useEffect(() => {
    if (isOpen && !updateInfo && !isDownloading) {
      handleCheckUpdate();
    }
  }, [isOpen, updateInfo, isDownloading, handleCheckUpdate]);

  // 清理进度监听器
  useEffect(() => {
    return () => {
      if (unlistenRef.current) {
        unlistenRef.current();
        unlistenRef.current = null;
      }
    };
  }, []);

  // 执行原地热更新与自动重启
  const handleStartUpdateAndRestart = useCallback(async () => {
    setIsDownloading(true);
    setErrorMessage(null);
    setDownloadProgress(5);
    setStatusMessage('准备下载更新包...');

    try {
      const { invoke } = await import('@tauri-apps/api/core');
      const { listen } = await import('@tauri-apps/api/event');

      // 监听后端下载进度事件
      const unlisten = await listen<{ downloaded: number; total: number }>(
        'update-download-progress',
        (event) => {
          const { downloaded, total } = event.payload;
          setDownloadedBytes(downloaded);
          if (total > 0) {
            setTotalBytes(total);
            const pct = Math.min(Math.round((downloaded / total) * 100), 98);
            setDownloadProgress(pct);
            const mb = (downloaded / (1024 * 1024)).toFixed(1);
            const totalMb = (total / (1024 * 1024)).toFixed(1);
            setStatusMessage(`正在下载应用热更新... ${mb}MB / ${totalMb}MB (${pct}%)`);
          } else {
            setDownloadProgress(prev => Math.min(prev + 5, 90));
          }
        }
      );
      unlistenRef.current = unlisten;

      setStatusMessage('正在下载并校验数字签名...');
      const success = await invoke<boolean>('install_update_and_restart');

      if (success) {
        setDownloadProgress(100);
        setStatusMessage('热更新安装成功，正在无缝重启应用...');
        if (onSuccessToast) {
          onSuccessToast('🚀 热更新成功，正在重启...');
        }
      } else {
        setStatusMessage('未发现需要应用的更新包');
        setIsDownloading(false);
      }
    } catch (err: any) {
      console.error('Install update failed:', err);
      setErrorMessage(err?.message || String(err));
      setIsDownloading(false);
      setStatusMessage('');
    }
  }, [onSuccessToast]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md select-none">
        
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 12 }}
          transition={{ type: 'spring', stiffness: 450, damping: 32 }}
          className="w-full max-w-[480px] bg-white/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/60 overflow-hidden flex flex-col box-border"
        >
          {/* 顶栏标题区 */}
          <div className="px-6 pt-6 pb-4 flex items-center justify-between border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center shadow-sm">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-semibold text-slate-900 leading-tight">AI Agent Hub 原生热更新</h3>
                <p className="text-[12px] text-slate-700">当前版本: v{currentVersion}</p>
              </div>
            </div>

            {!isDownloading && (
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-700 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>

          {/* 内容区 */}
          <div className="p-6 flex flex-col gap-5">
            {isChecking ? (
              <div className="py-8 flex flex-col items-center justify-center gap-3">
                <div className="w-8 h-8 border-3 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-xs font-medium text-slate-700">正在检查官方更新服务器...</span>
              </div>
            ) : updateInfo ? (
              <div className="flex flex-col gap-4">
                {/* 新版本卡片 */}
                <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex items-start gap-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 mt-1.5 animate-pulse flex-shrink-0"></span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-amber-950">
                        发现新版本 v{updateInfo.availableVersion}
                      </span>
                      {updateInfo.pubDate && (
                        <span className="text-[11px] text-amber-800">
                          {new Date(updateInfo.pubDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-amber-900/80 mt-1">
                      可直接在应用内无缝原地热替换，无需重新下载 DMG。
                    </p>
                  </div>
                </div>

                {/* 更新说明 / Changelog */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-medium text-slate-700">更新亮点：</span>
                  <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/60 text-xs text-slate-600 flex flex-col gap-1.5 leading-relaxed max-h-[140px] overflow-y-auto">
                    {updateInfo.notes ? (
                      <div className="whitespace-pre-wrap">{updateInfo.notes}</div>
                    ) : (
                      <>
                        <div className="flex items-start gap-1.5">
                          <span className="text-amber-500 font-bold">•</span>
                          <span><strong>重磅主力矩阵上线</strong>：原生支持客户高频 6 大工具（Claude 桌面端、claude-cli、Codex 桌面端、codexcli、Hermes 客户端、openclaw 客户端）。</span>
                        </div>
                        <div className="flex items-start gap-1.5">
                          <span className="text-amber-500 font-bold">•</span>
                          <span><strong>纯净专线防封接管</strong>：WireGuard 零信任住宅级隧道，阻断 IPv6 旁路泄露。</span>
                        </div>
                        <div className="flex items-start gap-1.5">
                          <span className="text-amber-500 font-bold">•</span>
                          <span><strong>一键原生热更新</strong>：原地热替换，告别 Gatekeeper 隔离报错与重复安装。</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* 下载与安装进度条 */}
                {isDownloading && (
                  <div className="flex flex-col gap-2 mt-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-700">{statusMessage}</span>
                      <div className="flex items-center gap-1.5 font-mono">
                        {totalBytes > 0 && (
                          <span className="text-[11px] text-slate-400">
                            {(downloadedBytes / (1024 * 1024)).toFixed(1)}MB / {(totalBytes / (1024 * 1024)).toFixed(1)}MB
                          </span>
                        )}
                        <span className="font-semibold text-amber-600">{downloadProgress}%</span>
                      </div>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
                      <motion.div
                        className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"
                        style={{ width: `${downloadProgress}%` }}
                        transition={{ duration: 0.2 }}
                      />
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-6 flex flex-col items-center justify-center gap-3 text-center">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200/60 flex items-center justify-center text-emerald-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-800">当前已是最新版本</h4>
                  <p className="text-xs text-slate-700 mt-0.5">您的 AI Agent Hub 客户端 (v{currentVersion}) 运行在最新稳定通道。</p>
                </div>
              </div>
            )}

            {/* 错误信息展示 */}
            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200/80 text-xs text-rose-700 leading-relaxed">
                ⚠️ {errorMessage}
              </div>
            )}
          </div>

          {/* 底栏按钮区 */}
          <div className="px-6 py-4 bg-slate-50/60 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={handleCheckUpdate}
              disabled={isChecking || isDownloading}
              className="text-xs font-medium text-slate-700 hover:text-slate-800 flex items-center gap-1.5 cursor-pointer disabled:opacity-40 whitespace-nowrap flex-shrink-0"
            >
              <svg className={`w-3.5 h-3.5 ${isChecking ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span className="whitespace-nowrap">{isChecking ? '检查中...' : '重新检查'}</span>
            </button>

            <div className="flex items-center gap-2">
              {!isDownloading && (
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-200/60 transition-colors cursor-pointer whitespace-nowrap flex-shrink-0"
                >
                  关闭
                </button>
              )}

              {updateInfo && (
                <button
                  onClick={handleStartUpdateAndRestart}
                  disabled={isDownloading}
                  className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 active:scale-95 transition-all shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50 whitespace-nowrap flex-shrink-0"
                >
                  {isDownloading ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span className="whitespace-nowrap">更新中...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      <span className="whitespace-nowrap">立即热更新并重启</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </motion.div>

      </div>
    </AnimatePresence>
  );
};
