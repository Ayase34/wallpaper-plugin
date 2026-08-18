# wallpaper-plugin — DSH 壁纸插件

中文 | English: [README.en.md](README.en.md)

DSH（DeepSeek Harness）第三方插件：主题预设管理与壁纸系统。安装之后设置页会多一个「外观预设」的选项。

## 功能

- **预设墙**：卡片一键切换 + 封面 + diff 告警；工作室深度编辑（原始令牌 / CSS 补丁 / 主题注册 / 素材部件）
- **壁纸素材库**：上传图片（≤20MB/个，库上限 100 个）→ 分配给三部件（16:9 聊天背景 / 1:1 设置卡 / 1:5 侧栏海报），按固定比例裁剪、明暗分别配置、不透明度
- **图层合成壁纸**：多张小图拼贴合成；多 GIF 时间轴合成输出真动图；单个动图场景自动**分层输出**
- **AI 协同**：12 个 `preset_*` / `asset_*` 工具（对话式换肤：创建 / 应用 / 微调 / 自纠）
- **分享**：zip 三件套导出（预设 + 封面 + **全部素材内嵌**），导入完整还原（含分层规格）

## 安装

### 安装步骤

```sh
# 装入 profile
dsh plugin --profile <name> add github:Ayase34/wallpaper-plugin
```


### 插件配置（可选）

在 profile 的 `cordis.patch.yml` 写：

```yaml
- id: wallpaper-plugin
  config:
    presetsDir: C:/你的预设目录      # 可选；默认 <dshHome>/.ui-presets
    assetsDir: C:/你的壁纸库目录     # 可选；默认 <presetsDir>/assets
```


## 快速开始

1. 设置页 →「外观预设」→ 应用出厂预设
2. 工作室「素材与部件」区上传图片 → 点「设为聊天背景」一键启用（自动按 16:9 裁剪）
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
