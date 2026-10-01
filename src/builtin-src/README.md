# 出厂预设源图（#108 / #109）

这里放**出厂预设「默认」携带的壁纸源图**，由 `node scripts/gen-builtin-assets.mjs`
（或 `pnpm gen:builtin-assets`）转成 `src/node/builtin-assets.ts` 的内嵌 base64。
生成物禁止手改；换图请替换本目录源文件后重新生成。

| 文件 | 用途 | 原始形态 | 生成物 |
| --- | --- | --- | --- |
| `chat-background.png` | 聊天背景图（16:9 帧） | 1672×941，**透明底**（34.6% 全透明 / 4.6% 半透明） | 两版 JPEG：浅色底 `asset-dsnm-chat`、深色底 `asset-dsnm-chat-dark` |
| `sidebar-poster.png` | 侧栏海报（1:5 帧） | 793×1983，不透明白底 | `asset-dsnm-sidebar` |
| `settings-background.png` | 设置卡背景图（1:1 帧） | 1254×1254，不透明白底 | `asset-dsnm-settings` |

## 为什么聊天背景要出两版

JPEG 没有 alpha 通道。透明底 PNG 直接转 JPEG 时，透明区（RGB 为纯黑）会被压成**黑色块**
（用户实测反馈）。生成脚本按主题把透明部分压到底色上：

- 浅色版：压到 `#ffffff` —— 贴在浅色界面上 ≈ 原透明观感（配合部件的 wash 渐变淡出）
- 深色版：压到 `#060e1e` —— 出厂预设 `default` 的暗色 `bg-base`，贴深色界面不露白边

预设里通过部件的 `assetId` / `assetIdDark` 分别引用（见 `src/core/seed.ts`）。

## 关于「白边」

另两张源图本身是**不透明白底**（四角 RGB ≈ 254），不是透明图——所以它们在浅色界面上
不会有黑块，但四周会有一圈近白边。若要去掉，把源图裁掉白边后重新生成即可
（裁剪矩形按帧缩放，与图片实际像素无关，裁边不影响既有裁剪参数）。
