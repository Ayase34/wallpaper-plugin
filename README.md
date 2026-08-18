# wallpaper-plugin — DSH 壁纸插件

DSH（DeepSeek Harness）第三方插件：主题预设管理与壁纸系统。设置页「外观预设」入口 + 全屏美化工作室——壁纸素材库（聊天背景 / 设置卡 / 侧栏海报）与图层合成壁纸（多图拼接、多 GIF 动图合成、分层输出）。

- 版本：**1.0.0**（#95 正式版，前身 ui-presets）
- 出厂预设：「默认」（海蓝海洋风，15 令牌 preset_check 全净）
- 许可证：MIT ｜ English: [README.en.md](README.en.md)

## 功能

- **预设墙**：卡片一键切换 + 封面 + diff 告警；工作室深度编辑（原始令牌 / CSS 补丁 / 主题注册 / 素材部件）
- **壁纸素材库**：上传图片（≤20MB/个，库上限 100 个）→ 分配给三部件（16:9 聊天背景 / 1:1 设置卡 / 1:5 侧栏海报），按固定比例裁剪、明暗分别配置、不透明度
- **图层合成壁纸**：多张小图拼贴合成（拖放 / 缩放 / 旋转 / 透明度 / 层级 / 撤销栈）；多 GIF 时间轴合成输出真动图；单个动图场景自动**分层输出**（静态底 + 原生动图，照片不烤进 GIF，体积小）
- **AI 协同**：12 个 `preset_*` / `asset_*` 工具（对话式换肤：创建 / 应用 / 微调 / 自纠）
- **分享**：zip 三件套导出（预设 + 封面 + **全部素材内嵌**），导入完整还原（含分层规格）

## 安装

### 环境要求

- DSH 桌面端或 Web 端 profile（须含 `@deepseek-ai/dsh-web-app`；headless profile 无 UI 面）
- Node.js ≥ 20.11（构建需要）

### 安装步骤

```sh
# 1) 构建——需 DSH_CHECKOUT 指向 deepseek-harness checkout
#    （构建把其 vendor/schemastery + vendor/cosmokit 打包自包含，见「开发」节）
#    Windows PowerShell:
#    $env:DSH_CHECKOUT = "C:/path/to/deepseek-harness"
cd wallpaper-plugin
npm install          # 或 pnpm install（安装 esbuild devDependency）
npm run build

# 2) 装入 profile
dsh plugin --profile <name> add <本目录>
```

手动安装（等价）：编辑 `$DSH_HOME/profiles/<name>/package.json`，在 `dependencies` 加 `"wallpaper-plugin": "link:<本目录>"`，在 `dsh.profile.bundles` 列表追加 `wallpaper-plugin`，然后在该 profile 目录执行 `pnpm install`。

### 启动失败恢复

本插件有零抛错防线，但若安装后应用仍无法启动（fail-loud 红线与官方插件同语义）：

1. 编辑 `$DSH_HOME/profiles/<name>/cordis.patch.yml`，加入：
   ```yaml
   - id: wallpaper-plugin
     disabled: true
   ```
2. 重启应用 → 正常启动。
3. 把问题反馈给作者修复后，删除上面两行恢复启用。

### 插件配置（可选）

在 profile 的 `cordis.patch.yml` 写：

```yaml
- id: wallpaper-plugin
  config:
    presetsDir: C:/你的预设目录      # 可选；默认 <dshHome>/.ui-presets
    assetsDir: C:/你的壁纸库目录     # 可选；默认 <presetsDir>/assets
```

⚠️ 配置类型错误（如数字）→ 插件 FAILED → 应用无法启动。

## 快速开始

1. 设置页 →「外观预设」→ 应用出厂预设「默认」（海蓝主题）
2. 工作室「素材与部件」区上传图片 → 点「设为聊天背景」一键启用（自动按 16:9 裁剪）
3. 想要动图/拼贴：点「图层合成壁纸」→ 素材面板加入图层、摆放 →「合成并上传」→ 在部件下拉选用
4. 分享：「导出 ZIP」→ 发给别人 → 对方在工作室/预设墙「导入」

## 开发

```sh
npm run build                # 构建 lib/core.mjs + .dsh-plugin/*（需 DSH_CHECKOUT）
npm run check:client         # 产物一致性守卫（--check）
npm test                     # 构建 + 单测（183 项）
node scripts/selfcheck.mjs   # 一键自检：构建一致性/单测/安装声明/数据完整性
node scripts/run-regression.mjs  # 全量 e2e（31 脚本；需 spike profile + 环境变量）
```

- **构建依赖**：`DSH_CHECKOUT` 必须显式指向 deepseek-harness checkout（vendor/schemastery + vendor/cosmokit 打包自包含——静态外部 import 会导致桌面端无法启动）；目录生成同理：`node scripts/gen-catalog.mjs --dsh <checkout>`
- **e2e 环境变量（必填）**：`UIP_PLAYWRIGHT_DIR`（playwright 包目录）、`UIP_CHROMIUM`（chromium 可执行文件）；`DSH_HOME` 指向隔离测试目录（e2e-home），测试一律用独立 spike profile + 端口 3180，不触碰正式 profile

## 许可证

MIT
