# CC-Switch 中转站定制版 (Figma 3.0 像素级还原组件库)

本项目基于你在 Figma 中的设计稿《3.0 海外站》，按照 React 18 + Tailwind CSS + Lucide Icons 规范完成像素级组件抽离与重构。

---

## 📁 目录结构

```
ccswitch_relay_components/
├── types.ts              # 工具与中转账户的核心数据结构
├── ToolCard.tsx          # 6 大工具卡片组件 (就绪/未安装/未配置等状态 Badge)
├── ToolDetailView.tsx    # 中间展开面板 (涵盖 5 大详情状态: 健康清单/命令安装/官网引导/配置表单)
├── SettingsView.tsx      # 常规设置视图 (账户余额看板、开机自启、专线测速切换、WSL 穿透、托盘行为)
└── RelayApp.tsx          # 完整客户端总容器 (三栏联动、macOS 窗体、3D 立体光球、状态机)
```

---

## 🎨 Figma 核心设计规范映射

| 视觉元素 | Figma 设计规范 | Tailwind / CSS 实现 |
| :--- | :--- | :--- |
| **窗体毛玻璃质感** | 磨砂亚克力微透明背景 | `bg-white/90 backdrop-blur-2xl border border-white/60 shadow-2xl` |
| **3D 立体渐变光球** | 多层球形径向渐变与高光 | `radial-gradient(circle at 32% 28%, #FFFFFF, #FFB6E5, #A855F7, #6366F1, #06B6D4)` |
| **就绪状态绿标** | 翡翠绿带背景微边框 | `bg-emerald-50 text-emerald-600 border border-emerald-100` |
| **待配置状态黄标** | 琥珀黄带圆点呼吸灯 | `bg-amber-50 text-amber-600 border border-amber-100` |
| **未安装状态灰标** | 浅灰中性底 | `bg-slate-100 text-slate-500` |
| **主操作 CTA 按钮** | 沉浸式纯黑圆角胶囊 | `bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-md` |

---

## 🚀 如何接入原版 `cc-switch`

1. 将 `ccswitch_relay_components` 拷贝到 `farion1231/cc-switch` 的 `src/components/relay-client/`。
2. 在原版 `src/App.tsx` 中引入 `<RelayApp />` 替代原本繁琐的多 Tab 页面。
3. 将 `RelayApp.tsx` 中的 Mock 接口连接到 Tauri 后端命令：
   - 检查 CLI 是否安装：调用 Tauri 的 `invoke('check_cli_installed', { cli: 'claude' })`
   - 写入配置：调用各 `*_config.rs` 中的已有保存函数
   - 测速：后台发送轻量 HEAD 请求并返回 `ping` 延迟
