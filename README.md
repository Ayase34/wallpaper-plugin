# wallpaper-plugin — DSH 壁纸插件（前身 ui-presets，#95 正式版）

DSH（DeepSeek Harness）第三方插件：在设置界面提供「外观预设」入口与全屏美化工作室——主题预设管理/编辑、壁纸素材库（聊天背景/设置卡/侧栏海报）、图层合成壁纸（多图拼接 / 多 GIF 时间轴合成 / 分层输出）。

- 版本：**1.0.0（#95 正式版）**——图层合成正式内化；出厂预设「默认」（海蓝色海洋风）
- 形态：入口统一标准版（决策 #43 移除对外档位切换；工作室/编辑入口常驻）

## 安装与恢复

```sh
dsh plugin --profile <name> add <本目录>
```

**支持范围**：仅支持包含 `@deepseek-ai/dsh-web-app` 的 profile（桌面端 / Web 端）。headless profile 安装后插件静默无操作面（不会崩溃，但也没有 UI）。

**启动失败恢复三步**（若安装后应用无法启动——本插件有零抛错防线，预案保留）：
1. 编辑 `$DSH_HOME/profiles/<name>/cordis.patch.yml`，加入：
   ```yaml
   - id: wallpaper-plugin
     disabled: true
   ```
2. 重启应用 → 正常启动。
3. 把问题（错误日志）反馈给插件作者修复后，删除上面两行恢复启用。

**插件配置（可选，宿主 schemastery Config）**：在 profile 的 `cordis.patch.yml` 写：
```yaml
- id: wallpaper-plugin
  config:
    presetsDir: C:/你的预设目录   # 可选；默认 <dshHome>/.ui-presets
    assetsDir: C:/你的壁纸库目录  # 可选；默认 <presetsDir>/assets
```
⚠️ 配置类型错误（如数字）→ 插件 FAILED → 应用无法启动（与官方插件同语义，fail-loud 红线）。

## 路由端点（Node half，10 个）

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| GET | `/ui-presets/presets` | 预设库列表（meta 含 hasBackup） |
| GET/PUT/DELETE | `/ui-presets/presets/:id` | 读/写（校验+原子写+备份）/删 预设 |
| GET | `/ui-presets/presets/:id?backup=1` | 读 backup.json（#62 还原入口；无备份 → null，损坏 → 422） |
| GET/PUT | `/ui-presets/active` | 读/写活动预设 id（revision 单调；写时校验预设存在） |
| GET/PUT | `/ui-presets/config` | 插件配置（档位兼容保留；UI 不再使用） |
| GET | `/ui-presets/status` | 诊断（toolsRegistered；tier 固定 standard） |
| POST | `/ui-presets/export-zip` | zip 三件套导出（preset.json + cover.svg + manifest.json，素材内嵌） |
| POST | `/ui-presets/import-zip` | zip 导入（冲突后缀、素材落盘防覆盖/上限） |
| PUT/GET | `/ui-presets/assets` | 壁纸库上传/列表（≤20MB/个，≤100 个） |
| GET/DELETE | `/ui-presets/assets/:id` | 壁纸文件读/删（删除自动清空库中引用） |

所有写端点带 CSRF 校验（Origin 必须与 Host 一致）；预设 id 白名单校验防路径穿越；请求体上限 30MB（zip 28MB；素材 20MB/个）。

## 数据目录

- `$DSH_HOME/.ui-presets/<id>/preset.json` — 预设库（schemaVersion 1；含 tokens/css/theme/assets/widgets）
- `$DSH_HOME/.ui-presets/<id>/backup.json` — 覆盖保存的旧版本备份（工作室左栏「还原备份」入口，**交换式还原**：还原时当前版本自动存入备份，可来回切换）
- `$DSH_HOME/.ui-presets/assets/` — 壁纸库（素材文件 + meta sidecar）
- `$DSH_HOME/data/ui-presets/active.json` — 活动预设 id（浏览器与 AI 工具共用事实源，revision 单调）
- `$DSH_HOME/data/ui-presets/config.json` — 插件配置（档位兼容保留）

## 功能清单

- 预设墙：卡片化网格 + 封面缩略图（3:1；手设封面优先，未设自动生成 SVG）+ 整卡一键切换（Enter/Space）+ 空态引导 + diff 告警横幅 + 工作室改动同窗口即时刷新
- 出厂预设（#82/#95）：唯一内置预设 **默认**（海蓝色海洋风，15 令牌 preset_check 全净；风格标签「海洋清爽」供 AI 参考；与库预设同名同 id 去重）
- 工作室：两栏布局（预设管理：新建/从当前外观新建/导入/应用/编辑/复制/删除/还原备份 + 原始令牌编辑器：分组染色/中文描述/用户自填描述 + 素材部件：壁纸库/裁剪/不透明度）+ 撤销历史 + 幽灵草稿暂存 + 保存备份 + **备份还原入口**（仅存在备份时显示，应用内确认框，纯库操作不自动应用）
- 原始令牌（#74 精简面）：令牌中文描述（catalog-zh 组说明 + ~80 条高频；用户可自填覆盖存 localStorage）+ **分组染色**（勾选多令牌建组 → 一次改色批量写入，明暗分别开关；extra.groups 落盘随预设导出导入）——旋钮层/CSS/主题编辑入口已注释（AI 接管，决策 #71 方向）
- CSS 补丁：白名单校验 + 模板库 + 实时生效（可撤销）
- 主题注册：保存/应用时注册 + 切换入口（引用计数）
- 素材与部件：壁纸库（20MB/100 个）+ **图层合成壁纸**（#85–#94 正式内化：小块图片拼贴 → canvas 合成入库——含 GIF 图层时自研编解码器输出**真动图**（时间轴合成/多 GIF 同步/镜像/上下移）；**分层输出**（1 个干净 GIF 层 + 静态层 → 静态底图 + 原生动图直引，CSS 双背景渲染，"超大 gif"根治；规格随 zip 导出导入）+ 3 部件（聊天背景图 16:9 / 设置卡背景图 1:1 / 侧栏海报 1:5——选素材时按固定比例裁剪：黑框内即实际应用范围、缩放 50–800% + 拖动定位、未覆盖区域透明；**裁剪不落库**（部件存参数引用原图，按元素实际尺寸动态渲染，侧栏海报 contain 所见即所得）；各带不透明度滑杆；**「按明暗分别配置壁纸」开关**——浅色/深色各一套素材/裁剪/不透明度，应用内切换主题即时换壁纸）+ 一键设聊天背景（#49：全局背景图/顶部强调色条/品牌标已移除）
- AI 协同：**12 个 preset_* / asset_* 工具**（list/apply/inspect/create/catalog/get/update/delete/revert + asset_list + preset_restore_backup + preset_check 质量预检，对话式换肤）+ 1s 轮询桥（退避+可见性暂停）+ BroadcastChannel 跨窗口即时同步。preset_update 支持 **merge_tokens 增量合并**（微调只改指定令牌）+ **更新活动预设自动重应用**（界面即时生效，#63）；preset_get 读指定预设详情（素材只返回元数据不泄漏 dataUrl，#64）；**asset_list + assets 引用声明 + widgets 写入**（assetId/opacity 引用壁纸库素材，"给聊天背景换张图"可达；裁剪交互留给 UI，#65）；**preset_restore_backup 交换式还原**（AI 自纠误改，活动预设自动重应用，#66）；**preset_catalog 输出 css_anchors**（CSS 补丁可用锚点字典，与 UI 模板库单一事实源 core/css-templates.ts，#67）；**preset_check 全载荷质量预检**（结构校验 + 组件面对比矩阵 + 未知令牌 + var 链 + 明暗护栏，#72/#73）
- 导出导入：zip 三件套（封面 SVG + 素材内嵌自包含；#93 起仅 zip——JSON 格式已移除；默认文件名 = 预设名）
- 无障碍：键盘可操作（Esc 关闭/输入优先、卡片 Enter/Space）、prefers-reduced-motion、窄屏响应式（<900px 堆叠）

## 开发

```sh
npm run build          # 构建 lib/core.mjs + .dsh-plugin/index.mjs + client.js
npm run check:client   # 产物一致性守卫（--check）
npm run gen:catalog    # DSH 升级后重跑令牌目录生成（--dsh <checkout>）
npm test               # 构建 + 单测（node --test）
node tests/e2e-m0.mjs http://127.0.0.1:3180   # 端到端（需独立 spike profile + 端口）
```

- esbuild 需安装（`pnpm install` 装 devDependencies）或经 `DSH_CHECKOUT` / 兄弟插件 / npm 全局解析
- **构建依赖 DSH checkout 的 vendor/schemastery + vendor/cosmokit 源码**（`--alias` 打包自包含，
  见决策 #46——静态外部 import 会导致桌面端无法启动）；构建/目录生成需显式提供
  `DSH_CHECKOUT`（指向 deepseek-harness checkout 的环境变量，或 `--dsh <path>` 参数），不内置默认路径
- e2e 用 playwright：**必填环境变量** `UIP_PLAYWRIGHT_DIR`（playwright 包目录）与 `UIP_CHROMIUM`
  （chromium 可执行文件路径），缺失时报错并给出示例
- 测试不触碰正式 profile：一律用独立 spike profile + 独立端口验证
- 基线（#96 更新）：183 单测（node --test 全量）+ 31 个 e2e 脚本（回归运行器）+ perf P95 ≤ 200ms（selfcheck 一键验证）

## 工程红线（防启动崩溃）

1. 双 half `apply()` 零抛错：外部交互（settings/fs/theme/槽位）全部 try/catch + 降级，绝不 throw
2. Node half 不声明 `inject`（webServer 经 `ctx.get` 条件降级——避免 headless profile 永久 pending 炸启动）
3. 浏览器 half `inject: ['slots', 'theme']`（fiber 等待官方服务就绪，白名单内）
4. 构建门禁：`--check` 逐字节比对 + 产物分层断言（node 产物无浏览器全局、client 产物无 Node 全局）
5. 预设校验：tokens 双值强制、css 选择器白名单 + rules 防花括号逃逸、dataUrl 严格 base64（防 CSS 注入）、版本契约、路径穿越白名单
6. 独立验证环境：所有实验用独立 profile + 端口
