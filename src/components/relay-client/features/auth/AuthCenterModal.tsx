import React, { useState } from 'react';

interface AuthCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  isLoggedIn: boolean;
  currentSystemToken: string;
  onSaveToken: (token: string) => void;
  onLogout: () => void;
  onShowToast: (msg: string) => void;
}

export const AuthCenterModal: React.FC<AuthCenterModalProps> = ({
  isOpen,
  onClose,
  isLoggedIn,
  currentSystemToken,
  onSaveToken,
  onLogout,
  onShowToast
}) => {
  const [tokenInput, setTokenInput] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-[460px] bg-[#EFF0F5] border border-white rounded-[28px] p-6 flex flex-col gap-4 box-border relative select-none shadow-2xl">
        {/* 关闭按钮 */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
        >
          ✕
        </button>

        {/* 头部标题与 Logo */}
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg shadow-sm">
            8x
          </div>
          <div className="flex flex-col">
            <h3 className="text-base font-bold text-slate-900 m-0">中转站账户认证中心</h3>
            <p className="text-xs text-slate-500 m-0 mt-0.5">Octopus X · 全局系统访问令牌绑定</p>
          </div>
        </div>

        {/* 状态看板卡片 */}
        <div className="w-full bg-white rounded-2xl p-4 border border-slate-200/80 flex flex-col gap-3 shadow-2xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <span className="text-xs text-slate-400">认证绑定状态</span>
            {isLoggedIn ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                已连接授权网关
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-rose-50 text-rose-600 border border-rose-200/60">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                未绑定令牌
              </span>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-slate-700">系统访问令牌 (System Access Token)</span>
            {isLoggedIn ? (
              <div className="flex items-center justify-between px-3 py-2 bg-slate-50 rounded-xl border border-slate-200/60 text-xs font-mono text-slate-700">
                <span>{currentSystemToken ? `${currentSystemToken.slice(0, 8)}...${currentSystemToken.slice(-6)}` : 'vcp_...'}</span>
                <span className="text-emerald-600 font-sans text-[11px]">有效</span>
              </div>
            ) : (
              <input
                id="system-token-input"
                name="system-token"
                type="password"
                autoComplete="current-password"
                aria-label="系统访问令牌 (System Access Token)"
                placeholder="在此粘贴 vcp_ 开头的系统访问令牌"
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-mono text-slate-800 placeholder-slate-400 outline-none focus:border-slate-400"
              />
            )}
          </div>
        </div>

        {/* 动作区 */}
        <div className="flex items-center justify-between pt-2">
          {isLoggedIn ? (
            <button
              onClick={onLogout}
              className="text-xs text-rose-500 hover:text-rose-700 transition-colors cursor-pointer whitespace-nowrap flex-shrink-0"
            >
              解除当前绑定
            </button>
          ) : (
            <button
              onClick={async () => {
                try {
                  const text = await navigator.clipboard.readText();
                  if (text && text.startsWith('vcp_')) {
                    setTokenInput(text);
                    onShowToast('📋 已从剪贴板自动填入令牌！');
                  } else {
                    onShowToast('未检测到有效的 vcp_ 令牌');
                  }
                } catch {
                  onShowToast('请手动在输入框粘贴令牌');
                }
              }}
              className="text-xs text-slate-500 hover:text-slate-800 transition-colors cursor-pointer whitespace-nowrap flex-shrink-0"
            >
              一键粘贴令牌
            </button>
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-medium transition-colors cursor-pointer whitespace-nowrap flex-shrink-0"
            >
              关闭
            </button>
            {!isLoggedIn && (
              <button
                onClick={() => {
                  if (!tokenInput.trim()) {
                    onShowToast('⚠️ 请先输入有效的系统访问令牌！');
                  } else {
                    onSaveToken(tokenInput.trim());
                  }
                }}
                className="px-4 py-2 rounded-xl bg-[#1E293B] hover:bg-[#0F172A] text-white text-xs font-medium transition-colors cursor-pointer whitespace-nowrap flex-shrink-0"
              >
                验证并绑定
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
