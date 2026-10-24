window.__ModuleLoader__.load({
	id: "wallpaper-plugin",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __export = (target, all) => {
  for (var name2 in all)
    __defProp(target, name2, { get: all[name2], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);

// src/client/index.tsx
var index_exports = {};
__export(index_exports, {
  apply: () => apply,
  inject: () => inject,
  name: () => name
});
module.exports = __toCommonJS(index_exports);
var React13 = __toESM(require("react"), 1);

// src/core/demo-data.ts
var DEMO_DEFAULT_TOKENS = {
  // 背景与结构面
  "--dsw-alias-bg-base": { light: "rgb(240, 248, 255)", dark: "rgb(6, 14, 30)" },
  "--dsw-alias-bg-layer-1": { light: "rgb(255, 255, 255)", dark: "rgb(12, 22, 42)" },
  "--dsw-alias-bg-layer-2": { light: "rgb(226, 241, 255)", dark: "rgb(18, 32, 58)" },
  "--dsw-specific-sidebar-fill": { light: "rgb(230, 243, 255)", dark: "rgb(4, 10, 24)" },
  "--dsw-specific-sidebar-nav-item-active": { light: "rgb(214, 232, 255)", dark: "rgb(18, 36, 70)" },
  "--dsw-specific-sidebar-nav-item-active-accent": { light: "rgb(250, 252, 255)", dark: "rgb(18, 34, 64)" },
  "--dsw-specific-bubble": { light: "rgb(214, 235, 255)", dark: "rgb(14, 30, 56)" },
  "--dsw-specific-bubble-highlight": { light: "rgb(178, 216, 255)", dark: "rgb(24, 48, 88)" },
  "--dsw-specific-input-major": { light: "rgb(255, 255, 255)", dark: "rgb(10, 20, 40)" },
  // 菜单 / 悬浮层（旋钮「菜单与悬浮层」整束派生）
  "--dsw-specific-menu": { light: "rgb(236, 245, 255)", dark: "rgb(22, 38, 66)" },
  "--dsw-specific-tip": { light: "#e3ebf5", dark: "#1f2f4a" },
  "--dsw-specific-selector": { light: "#d9e1eb", dark: "#293751" },
  "--dsw-alias-bg-overlay": { light: "rgba(236, 245, 255, 0.6)", dark: "rgba(22, 38, 66, 0.6)" },
  // 边框（冷调半透明，保留宿主「半透明描边」用法）
  "--dsw-alias-border-l2": { light: "rgba(0, 72, 160, 0.12)", dark: "rgba(150, 196, 255, 0.16)" },
  // 设置卡（宿主默认从 layer-2/border 派生；显式写一份让旋钮回读与实际一致）
  "--dsw-alias-settings-card-fill": { light: "rgb(226, 241, 255)", dark: "rgb(18, 32, 58)" },
  "--dsw-alias-settings-card-stroke": { light: "rgba(0, 72, 160, 0.14)", dark: "rgba(150, 196, 255, 0.18)" },
  // 品牌与按钮（悬停由旋钮派生，回读一致）
  "--dsw-alias-brand-primary": { light: "rgb(0, 96, 236)", dark: "rgb(96, 160, 255)" },
  "--dsw-alias-button-primary-fill": { light: "rgb(0, 96, 236)", dark: "rgb(96, 160, 255)" },
  "--dsw-alias-button-info-fill": { light: "rgb(0, 96, 236)", dark: "rgb(96, 160, 255)" },
  "--dsw-alias-state-business-primary": { light: "rgb(0, 96, 236)", dark: "rgb(96, 160, 255)" },
  "--dsw-alias-button-primary-hover": { light: "#004fc2", dark: "#7db1ff" },
  "--dsw-alias-button-info-hover": { light: "#004fc2", dark: "#7db1ff" },
  // 状态与交互
  "--dsw-alias-state-error-primary": { light: "rgb(191, 45, 52)", dark: "rgb(255, 138, 128)" },
  "--dsw-alias-state-warn-primary": { light: "rgb(144, 94, 0)", dark: "rgb(255, 191, 92)" },
  "--dsw-alias-state-success-primary": { light: "rgb(20, 118, 84)", dark: "rgb(96, 214, 164)" },
  "--dsw-alias-interactive-bg-hover": { light: "rgba(0, 72, 160, 0.06)", dark: "rgba(150, 196, 255, 0.08)" },
  // 文字三级
  "--dsw-alias-label-primary": { light: "rgb(10, 32, 62)", dark: "rgb(232, 242, 255)" },
  "--dsw-alias-label-secondary": { light: "rgb(66, 98, 140)", dark: "rgb(164, 186, 216)" },
  "--dsw-alias-label-tertiary": { light: "rgb(80, 106, 144)", dark: "rgb(128, 152, 186)" },
  // 代码 / 引用面（旋钮整束派生）
  "--dsw-alias-markdown-code-block": { light: "rgb(230, 241, 254)", dark: "rgb(14, 26, 46)" },
  "--dsw-alias-markdown-code-block-banner": { light: "#dde7f4", dark: "#182336" },
  "--dsw-alias-markdown-inline-code": { light: "#d4deea", dark: "#212c3f" },
  "--dsw-alias-markdown-citation": { light: "#dfeaf6", dark: "#152134" },
  "--dsw-alias-markdown-tag": { light: "#d8e3ef", dark: "#1c283b" },
  // 浮层（toast / tooltip，旋钮整束派生）
  "--dsw-alias-toast-bg": { light: "rgb(26, 41, 64)", dark: "rgb(34, 51, 78)" },
  "--dsw-alias-tooltip-bg": { light: "#19273d", dark: "#2b3b55" }
};
function preset(id, name2, tokens, style) {
  return {
    schemaVersion: 1,
    id,
    name: name2,
    author: { name: "wallpaper-plugin" },
    edition: "standard",
    targetDshVersion: "0.1.0-rc.5",
    // #73 风格参考机制：style:xxx 标签供 preset_list/preset_get 输出，AI 可用作风范例引导
    tags: style !== void 0 ? ["builtin", `style:${style}`] : ["builtin"],
    tokens
  };
}
var DEMO_PRESETS = [
  // 默认出厂预设：海蓝色印象（亮 = 海面浅蓝/海雾白，暗 = 深海夜蓝），唯一出厂预设（#82/#95）
  preset("default", "\u9ED8\u8BA4", DEMO_DEFAULT_TOKENS, "\u6D77\u6D0B\u6E05\u723D")
];

// src/client/env.ts
var STUDIO_HASH = "#studio=presets";
function isStudioHashActive() {
  return window.location.hash === STUDIO_HASH;
}
function openStudio() {
  if (window.location.hash !== STUDIO_HASH) {
    window.location.hash = STUDIO_HASH;
  }
}
function closeStudio() {
  if (window.location.hash === STUDIO_HASH) {
    history.replaceState(null, "", window.location.pathname + window.location.search);
    window.dispatchEvent(new HashChangeEvent("hashchange"));
  }
}

// src/core/crop.ts
var WIDGET_CROP_RATIOS = {
  "chat-background": { w: 16, h: 9 },
  "settings-background": { w: 1, h: 1 },
  "sidebar-poster": { w: 1, h: 5 }
};
function cropRatioLabel(ratio) {
  return `${ratio.w}:${ratio.h}`;
}
function cropFrameSize(ratio, maxLong = 1920) {
  const rw = ratio.w > 0 ? ratio.w : 1;
  const rh = ratio.h > 0 ? ratio.h : 1;
  const limit = maxLong > 0 ? maxLong : 1920;
  const scale = limit / Math.max(rw, rh);
  return { w: Math.max(1, Math.round(rw * scale)), h: Math.max(1, Math.round(rh * scale)) };
}
var CROP_ZOOM_MIN = 0.5;
var CROP_ZOOM_MAX = 8;
function cropDrawRect(imgW, imgH, frameW, frameH, zoom, panX, panY) {
  if (imgW <= 0 || imgH <= 0 || frameW <= 0 || frameH <= 0) return { x: 0, y: 0, w: 0, h: 0 };
  const fit = Math.min(frameW / imgW, frameH / imgH);
  const scale = fit * Math.max(0, zoom);
  const w = imgW * scale;
  const h = imgH * scale;
  return { x: (frameW - w) / 2 + panX, y: (frameH - h) / 2 + panY, w, h };
}
function clampPanForCrop(panX, panY, frameW, frameH, imgW, imgH) {
  const axis = (pan, frame, img) => {
    const limit = img >= frame ? (img - frame) / 2 : frame / 2;
    return Math.min(limit, Math.max(-limit, pan));
  };
  return { x: axis(panX, frameW, imgW), y: axis(panY, frameH, imgH) };
}
var WIDGET_TARGET_SELECTOR = {
  "chat-background": "[data-conversation-scroll]",
  "settings-background": '[role="dialog"]:not([data-up-crop]):not([data-up-confirm])',
  "sidebar-poster": '[data-slot="sidebar"] > div:first-child'
};
function parseCropMarkers(cssText) {
  const out = [];
  const re = /\/\* up-crop(-dark)?:([a-z0-9-]+):([\d.]+):(-?[\d.]+):(-?[\d.]+):(-?[\d.]+):(-?[\d.]+):([^*]+?) \*\//g;
  let match;
  while ((match = re.exec(cssText)) !== null) {
    const info = {
      widgetId: match[2],
      opacity: Number(match[3]),
      x: Number(match[4]),
      y: Number(match[5]),
      w: Number(match[6]),
      h: Number(match[7]),
      url: match[8].trim(),
      dark: match[1] === "-dark"
    };
    if (Number.isFinite(info.opacity) && Number.isFinite(info.x) && Number.isFinite(info.y) && Number.isFinite(info.w) && Number.isFinite(info.h) && info.w > 0 && info.h > 0 && WIDGET_CROP_RATIOS[info.widgetId] !== void 0) {
      out.push(info);
    }
  }
  return out;
}
function sidebarPosterFitFor(elementW, elementH, frame) {
  if (elementW <= 0 || elementH <= 0 || frame.w <= 0 || frame.h <= 0) return "contain";
  return elementW / elementH >= frame.w / frame.h ? "contain" : "cover";
}
function cropElementStyle(elementW, elementH, frame, crop, opacity, url, washToken, fit = "cover") {
  if (elementW <= 0 || elementH <= 0 || frame.w <= 0 || frame.h <= 0) return {};
  const s = fit === "contain" ? Math.min(elementW / frame.w, elementH / frame.h) : Math.max(elementW / frame.w, elementH / frame.h);
  const offX = fit === "contain" ? (elementW - frame.w * s) / 2 : 0;
  const offY = fit === "contain" ? (elementH - frame.h * s) / 2 : 0;
  const wash = Math.round((1 - Math.min(1, Math.max(0, opacity))) * 100);
  const backgroundImage = wash > 0 ? `linear-gradient(color-mix(in srgb, ${washToken} ${wash}%, transparent), color-mix(in srgb, ${washToken} ${wash}%, transparent)), ${url}` : url;
  return {
    backgroundImage,
    backgroundSize: wash > 0 ? `cover, ${crop.w * s}px ${crop.h * s}px` : `${crop.w * s}px ${crop.h * s}px`,
    backgroundPosition: wash > 0 ? `center, ${offX + crop.x * s}px ${offY + crop.y * s}px` : `${offX + crop.x * s}px ${offY + crop.y * s}px`,
    backgroundRepeat: wash > 0 ? "no-repeat, no-repeat" : "no-repeat"
  };
}
function layeredElementStyle(elementW, elementH, frame, crop, opacity, baseUrl, animUrl, spec, washToken, fit = "cover") {
  if (elementW <= 0 || elementH <= 0 || frame.w <= 0 || frame.h <= 0) return {};
  const s = fit === "contain" ? Math.min(elementW / frame.w, elementH / frame.h) : Math.max(elementW / frame.w, elementH / frame.h);
  const offX = fit === "contain" ? (elementW - frame.w * s) / 2 : 0;
  const offY = fit === "contain" ? (elementH - frame.h * s) / 2 : 0;
  const m = crop.w > 0 ? crop.w * s / frame.w : s;
  const wash = Math.round((1 - Math.min(1, Math.max(0, opacity))) * 100);
  const washLayer = wash > 0 ? `linear-gradient(color-mix(in srgb, ${washToken} ${wash}%, transparent), color-mix(in srgb, ${washToken} ${wash}%, transparent))` : null;
  const baseSize = `${crop.w * s}px ${crop.h * s}px`;
  const basePos = `${offX + crop.x * s}px ${offY + crop.y * s}px`;
  const animSize = `${spec.w * m}px ${spec.h * m}px`;
  const animPos = `${offX + crop.x * s + spec.x * m}px ${offY + crop.y * s + spec.y * m}px`;
  return {
    backgroundImage: washLayer === null ? `${baseUrl}, ${animUrl}` : `${washLayer}, ${baseUrl}, ${animUrl}`,
    backgroundSize: washLayer === null ? `${baseSize}, ${animSize}` : `cover, ${baseSize}, ${animSize}`,
    backgroundPosition: washLayer === null ? `${basePos}, ${animPos}` : `center, ${basePos}, ${animPos}`,
    backgroundRepeat: washLayer === null ? "no-repeat, no-repeat" : "no-repeat, no-repeat, no-repeat"
  };
}

// src/core/widgets.ts
var MAX_ASSETS = 100;
var MAX_ASSET_FILE_SIZE = 20 * 1024 * 1024;
var MAX_ASSET_DATAURL_LENGTH = 28e6;
var MAX_IMAGE_URL_LENGTH = 2048;
var GRADIENT_PRESETS = [
  { id: "aurora", name: "\u6781\u5149", css: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" },
  { id: "ocean", name: "\u6DF1\u6D77", css: "linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)" },
  { id: "dusk", name: "\u66AE\u8272", css: "linear-gradient(135deg, #232526 0%, #414345 100%)" },
  { id: "sunset", name: "\u843D\u65E5", css: "linear-gradient(135deg, #ff9a9e 0%, #fad0c4 100%)" },
  { id: "forest", name: "\u68EE\u6797", css: "linear-gradient(135deg, #134e5e 0%, #71b280 100%)" },
  { id: "rose", name: "\u73AB\u7470", css: "linear-gradient(135deg, #fbc2eb 0%, #a6c1ee 100%)" },
  { id: "ember", name: "\u4F59\u70EC", css: "linear-gradient(135deg, #f83600 0%, #f9d423 100%)" },
  { id: "paper", name: "\u7EB8\u767D", css: "linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%)" }
];
function gradientCss(id) {
  const preset2 = GRADIENT_PRESETS.find((item) => item.id === id);
  return preset2 !== void 0 ? preset2.css : "";
}
function gradientOptions() {
  return [{ label: "\uFF08\u4E0D\u4F7F\u7528\uFF09", value: "" }, ...GRADIENT_PRESETS.map((item) => ({ label: item.name, value: item.id }))];
}
function isSafeImageUrl(value) {
  if (value === "" || value.length > MAX_IMAGE_URL_LENGTH) return false;
  if (!/^https?:\/\//i.test(value)) return false;
  return /^[\x21-\x7e]+$/.test(value) && !/["'()<>\\`\s]/.test(value);
}
function imageUrlCss(value) {
  if (value === void 0 || !isSafeImageUrl(value)) return "";
  return `url("${value}")`;
}
function assetCssUrl(asset) {
  if (asset === void 0) return "";
  if (asset.dataUrl !== void 0 && asset.dataUrl !== "") {
    if (!/^data:image\/(png|jpe?g|webp|gif|bmp|avif);base64,[A-Za-z0-9+/=\s]+$/.test(asset.dataUrl)) return "";
    return `url("${asset.dataUrl}")`;
  }
  return `url("/ui-presets/assets/${asset.id}")`;
}
function imageParams() {
  return [
    {
      key: "source",
      label: "\u56FE\u7247",
      type: "select",
      default: "asset",
      options: [
        { label: "\u672C\u5730\u7D20\u6750", value: "asset" },
        { label: "\u56FE\u7247\u94FE\u63A5", value: "url" },
        { label: "\u5185\u7F6E\u6E10\u53D8", value: "gradient" }
      ]
    },
    { key: "assetId", label: "\u7D20\u6750", type: "asset", default: "", visibleWhen: { key: "source", equals: "asset" } },
    { key: "imageUrl", label: "\u94FE\u63A5", type: "url", default: "", visibleWhen: { key: "source", equals: "url" } },
    { key: "gradient", label: "\u6E10\u53D8", type: "select", default: "", options: gradientOptions(), visibleWhen: { key: "source", equals: "gradient" } },
    { key: "opacity", label: "\u4E0D\u900F\u660E\u5EA6", type: "range", default: "1", min: 0, max: 1, step: 0.01 }
  ];
}
var WIDGETS = [
  {
    id: "chat-background",
    name: "\u804A\u5929\u80CC\u666F\u56FE",
    description: "\u4F1A\u8BDD\u533A\u80CC\u666F\u58C1\u7EB8",
    params: imageParams()
  },
  {
    id: "settings-background",
    name: "\u8BBE\u7F6E\u5361\u80CC\u666F\u56FE",
    description: "\u8BBE\u7F6E\u7A97\u53E3\u80CC\u666F\u58C1\u7EB8",
    params: imageParams()
  },
  {
    id: "sidebar-poster",
    name: "\u4FA7\u680F\u6D77\u62A5",
    description: "\u5DE6\u4FA7\u5BFC\u822A\u680F\u6D77\u62A5\u80CC\u666F",
    params: imageParams()
  }
];
function findWidget(id) {
  return WIDGETS.find((widget) => widget.id === id);
}
var WIDGET_WASH_TOKEN = {
  "chat-background": "var(--dsw-alias-bg-base, #fff)",
  "settings-background": "var(--dsw-alias-bg-base, #fff)",
  "sidebar-poster": "var(--dsw-specific-sidebar-fill, var(--dsw-alias-bg-base, #fff))"
};
function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}
function widgetCss(widgetId, params, assets) {
  const p = params ?? {};
  const assetUrl = (key) => {
    const id = p[key];
    if (typeof id !== "string" || id === "") return "";
    const asset = assets.find((item) => item.id === id);
    return asset !== void 0 ? assetCssUrl(asset) : "";
  };
  const num = (key, fallback, min, max) => {
    const rawStr = p[key];
    if (typeof rawStr !== "string" || rawStr.trim() === "") return fallback;
    const raw = Number(rawStr);
    return Number.isFinite(raw) ? clamp(raw, min, max) : fallback;
  };
  const cropNumStr = (key) => {
    const v = p[key];
    if (typeof v !== "string") return "";
    const t2 = v.trim();
    return /^[+-]?(\d+(\.\d+)?|\.\d+)$/.test(t2) ? t2 : "";
  };
  const elementBg = (selector, url, opacity, washToken) => {
    if (url === "") return "";
    const wash = Math.round((1 - clamp(opacity, 0, 1)) * 100);
    if (wash <= 0) {
      return `${selector} { background-image: ${url}; background-size: cover; background-position: center; background-repeat: no-repeat; }`;
    }
    const fade = `linear-gradient(color-mix(in srgb, ${washToken} ${wash}%, transparent), color-mix(in srgb, ${washToken} ${wash}%, transparent))`;
    return `${selector} { background-image: ${fade}, ${url}; background-size: cover, cover; background-position: center, center; background-repeat: no-repeat, no-repeat; }`;
  };
  switch (widgetId) {
    case "chat-background":
    case "settings-background":
    case "sidebar-poster": {
      const selector = WIDGET_TARGET_SELECTOR[widgetId];
      const washToken = WIDGET_WASH_TOKEN[widgetId];
      const source = p.source === "url" || p.source === "gradient" ? p.source : "asset";
      const imageFor = (urlKey, gradientKey, assetKey) => {
        if (source === "url") return imageUrlCss(p[urlKey]);
        if (source === "gradient") return gradientCss(p[gradientKey] ?? "");
        return assetUrl(assetKey);
      };
      const url = imageFor("imageUrl", "gradient", "assetId");
      const urlDark = imageFor("imageUrlDark", "gradientDark", "assetIdDark");
      const canCrop = source === "asset";
      const cropX = cropNumStr("cropX");
      const cropY = cropNumStr("cropY");
      const cropW = cropNumStr("cropW");
      const cropH = cropNumStr("cropH");
      const cropXD = cropNumStr("cropXDark");
      const cropYD = cropNumStr("cropYDark");
      const cropWD = cropNumStr("cropWDark");
      const cropHD = cropNumStr("cropHDark");
      const hasCrop = canCrop && cropX !== "" && cropW !== "";
      const hasCropDark = canCrop && cropXD !== "" && cropWD !== "";
      const parts = [];
      if (hasCrop) {
        if (url !== "") parts.push(`/* up-crop:${widgetId}:${num("opacity", 1, 0, 1)}:${cropX}:${cropY}:${cropW}:${cropH}:${url} */`);
      } else {
        parts.push(elementBg(selector, url, num("opacity", 1, 0, 1), washToken));
      }
      if (urlDark !== "") {
        if (hasCropDark) {
          parts.push(`/* up-crop-dark:${widgetId}:${num("opacityDark", 1, 0, 1)}:${cropXD}:${cropYD}:${cropWD}:${cropHD}:${urlDark} */`);
        } else {
          parts.push(elementBg(`body[data-ds-dark-theme] ${selector}`, urlDark, num("opacityDark", 1, 0, 1), washToken));
        }
      }
      return parts.join("\n");
    }
    default:
      return "";
  }
}
function widgetsToCss(widgets, assets) {
  if (widgets === void 0 || widgets.length === 0) return "";
  return widgets.map((widget) => widgetCss(widget.id, widget.params, assets)).filter((text) => text !== "").join("\n");
}

// src/core/schema.ts
var SCHEMA_VERSION = 1;
var MAX_TOKENS = 500;
var MAX_ID_LENGTH = 64;
var MAX_NAME_LENGTH = 64;
var MAX_CSS_RULES_LENGTH = 4096;
var ID_PATTERN = /^[a-z0-9][a-z0-9-]*$/;
var VERSION_PATTERN = /^\d+\.\d+\.\d+(-[0-9A-Za-z.]+)?$/;
function isAllowedCssSelector(selector) {
  if (!/^\[data-/.test(selector)) return false;
  if (selector.includes("}") || selector.includes(";") || selector.includes("{")) return false;
  return selector.length <= 256;
}
function cssRulesToText(rules) {
  return rules.filter((rule) => isAllowedCssSelector(rule.selector) && !/[{}]/.test(rule.rules)).map((rule) => `${rule.selector} { ${rule.rules} }`).join("\n");
}
function isRecord(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
function isTokenOverride(value) {
  return isRecord(value) && typeof value.light === "string" && typeof value.dark === "string";
}
function tokenNameValid(name2) {
  return name2.startsWith("--");
}
function isValidVersion(value) {
  return typeof value === "string" && value.trim() !== "" && VERSION_PATTERN.test(value.trim());
}
function validatePreset(raw) {
  const errors = [];
  if (!isRecord(raw)) return { ok: false, errors: ["\u9884\u8BBE\u5FC5\u987B\u662F\u5BF9\u8C61"] };
  const id = raw.id;
  if (typeof id !== "string" || id.trim() === "") {
    errors.push("id \u5FC5\u586B\u4E14\u4E3A\u975E\u7A7A\u5B57\u7B26\u4E32");
  } else if (!ID_PATTERN.test(id) || id.length > MAX_ID_LENGTH) {
    errors.push(`id \u987B\u5339\u914D ${ID_PATTERN.source} \u4E14\u957F\u5EA6 \u2264 ${MAX_ID_LENGTH}`);
  }
  const name2 = raw.name;
  if (typeof name2 !== "string" || name2.trim() === "") {
    errors.push("name \u5FC5\u586B\u4E14\u4E3A\u975E\u7A7A\u5B57\u7B26\u4E32");
  } else if (name2.length > MAX_NAME_LENGTH) {
    errors.push(`name \u957F\u5EA6 \u2264 ${MAX_NAME_LENGTH}`);
  }
  if (raw.schemaVersion !== SCHEMA_VERSION) {
    errors.push(`schemaVersion \u5FC5\u987B\u4E3A ${SCHEMA_VERSION}`);
  }
  const edition = raw.edition;
  if (edition !== "simple" && edition !== "standard" && edition !== "developer") {
    errors.push("edition \u5FC5\u987B\u662F simple | standard | developer");
  }
  if (raw.minDshVersion !== void 0 && !isValidVersion(raw.minDshVersion)) {
    errors.push("minDshVersion \u987B\u4E3A semver \u683C\u5F0F\uFF08\u5982 0.1.0-rc.5\uFF09");
  }
  if (raw.targetDshVersion !== void 0 && !isValidVersion(raw.targetDshVersion)) {
    errors.push("targetDshVersion \u987B\u4E3A semver \u683C\u5F0F\uFF08\u5982 0.1.0-rc.5\uFF09");
  }
  if (raw.tags !== void 0 && (!Array.isArray(raw.tags) || raw.tags.some((t2) => typeof t2 !== "string"))) {
    errors.push("tags \u5FC5\u987B\u662F\u5B57\u7B26\u4E32\u6570\u7EC4");
  }
  if (raw.author !== void 0) {
    if (!isRecord(raw.author) || typeof raw.author.name !== "string" || raw.author.name.trim() === "") {
      errors.push("author \u5FC5\u987B\u662F { name: string, homepage?: string }");
    } else if (raw.author.homepage !== void 0 && typeof raw.author.homepage !== "string") {
      errors.push("author.homepage \u5FC5\u987B\u662F\u5B57\u7B26\u4E32");
    }
  }
  if (!isRecord(raw.tokens)) {
    errors.push("tokens \u5FC5\u987B\u662F\u5BF9\u8C61");
  } else {
    const names = Object.keys(raw.tokens);
    if (names.length > MAX_TOKENS) {
      errors.push(`tokens \u6570\u91CF\u8D85\u8FC7\u4E0A\u9650 ${MAX_TOKENS}`);
    }
    for (const tokenName of names) {
      if (!tokenName.startsWith("--")) {
        errors.push(`\u4EE4\u724C\u540D "${tokenName}" \u5FC5\u987B\u4EE5 -- \u5F00\u5934`);
        continue;
      }
      const value = raw.tokens[tokenName];
      if (typeof value === "string") {
        errors.push(
          `\u4EE4\u724C "${tokenName}" \u662F\u88F8\u5B57\u7B26\u4E32 \u2014 \u5FC5\u987B\u7ED9 { light, dark } \u53CC\u503C (\u660E\u6697\u4E00\u81F4\u65F6\u91CD\u590D\u540C\u4E00\u503C)\uFF1B\u5355\u503C\u5728\u5207\u6362\u914D\u8272\u65F6\u4F1A\u4E0D\u53EF\u8BFB`
        );
      } else if (!isTokenOverride(value)) {
        errors.push(`\u4EE4\u724C "${tokenName}" \u5FC5\u987B\u662F { light, dark } \u5B57\u7B26\u4E32\u5BF9`);
      } else {
        for (const scheme of ["light", "dark"]) {
          if (/[;{}`\r\n]/.test(value[scheme])) {
            errors.push(`\u4EE4\u724C "${tokenName}" ${scheme} \u503C\u5305\u542B\u975E\u6CD5\u5B57\u7B26\uFF08; { } \u6362\u884C \u53CD\u5F15\u53F7\uFF09`);
          }
        }
      }
    }
  }
  if (raw.css !== void 0) {
    if (!Array.isArray(raw.css)) {
      errors.push("css \u5FC5\u987B\u662F\u6570\u7EC4");
    } else {
      for (let i = 0; i < raw.css.length; i += 1) {
        const entry = raw.css[i];
        if (!isRecord(entry) || typeof entry.selector !== "string") {
          errors.push(`css[${i}] \u5FC5\u987B\u542B selector \u5B57\u7B26\u4E32`);
        } else if (!isAllowedCssSelector(entry.selector)) {
          errors.push(`css[${i}] \u9009\u62E9\u5668 "${entry.selector}" \u4E0D\u5728\u767D\u540D\u5355\uFF08\u987B data-* \u5C5E\u6027\u951A\u70B9\uFF0C\u7981\u6B62\u7C7B\u540D\uFF09`);
        }
        if (typeof entry.rules !== "string") {
          errors.push(`css[${i}] \u5FC5\u987B\u542B rules \u5B57\u7B26\u4E32`);
        } else if (/[{}]/.test(entry.rules)) {
          errors.push(`css[${i}] rules \u7981\u6B62\u5305\u542B\u82B1\u62EC\u53F7\uFF08\u9632\u6837\u5F0F\u5757\u9003\u9038\u6CE8\u5165\uFF09`);
        } else if (entry.rules.length > MAX_CSS_RULES_LENGTH) {
          errors.push(`css[${i}] rules \u957F\u5EA6\u8D85\u8FC7\u4E0A\u9650 ${MAX_CSS_RULES_LENGTH}`);
        }
      }
    }
  }
  if (raw.theme !== void 0) {
    const theme = raw.theme;
    const themeId = typeof theme.id === "string" ? theme.id.trim() : "";
    if (themeId === "" || themeId.length > MAX_ID_LENGTH || !ID_PATTERN.test(themeId)) {
      errors.push("theme.id \u5FC5\u987B\u662F\u5408\u6CD5\u6807\u8BC6\u7B26\uFF08\u5C0F\u5199\u5B57\u6BCD\u6570\u5B57\u5F00\u5934\uFF0C\u5141\u8BB8\u4E2D\u5212\u7EBF\uFF09");
    }
    if (theme.colorScheme !== "light" && theme.colorScheme !== "dark") {
      errors.push("theme.colorScheme \u5FC5\u987B\u662F light | dark");
    }
    if (!isRecord(theme.tokens)) {
      errors.push("theme.tokens \u5FC5\u987B\u662F\u4EE4\u724C\u5BF9\u8C61");
    } else {
      for (const [name3, value] of Object.entries(theme.tokens)) {
        if (!tokenNameValid(name3)) {
          errors.push(`theme \u4EE4\u724C\u540D "${name3}" \u5FC5\u987B\u4EE5 -- \u5F00\u5934`);
        } else if (!isTokenOverride(value)) {
          errors.push(`theme \u4EE4\u724C "${name3}" \u5FC5\u987B\u662F { light, dark } \u5B57\u7B26\u4E32\u5BF9`);
        }
      }
    }
  }
  const assetIds = /* @__PURE__ */ new Set();
  if (raw.assets !== void 0) {
    if (!Array.isArray(raw.assets)) {
      errors.push("assets \u5FC5\u987B\u662F\u6570\u7EC4");
    } else if (raw.assets.length > MAX_ASSETS) {
      errors.push(`assets \u6570\u91CF\u8D85\u8FC7\u4E0A\u9650 ${MAX_ASSETS}`);
    } else {
      for (let i = 0; i < raw.assets.length; i += 1) {
        const asset = raw.assets[i];
        if (!isRecord(asset) || typeof asset.id !== "string" || !ID_PATTERN.test(asset.id)) {
          errors.push(`assets[${i}] id \u5FC5\u987B\u662F\u5408\u6CD5\u6807\u8BC6\u7B26`);
          continue;
        }
        if (assetIds.has(asset.id)) errors.push(`assets[${i}] id \u91CD\u590D\uFF1A${asset.id}`);
        assetIds.add(asset.id);
        if (typeof asset.name !== "string" || asset.name.length > 64) {
          errors.push(`assets[${i}] name \u5FC5\u987B\u662F \u226464 \u5B57\u7B26\u4E32`);
        }
        if (typeof asset.mime !== "string" || !asset.mime.startsWith("image/")) {
          errors.push(`assets[${i}] mime \u5FC5\u987B\u662F image/*`);
        }
        if (asset.dataUrl !== void 0) {
          if (typeof asset.dataUrl !== "string") {
            errors.push(`assets[${i}] dataUrl \u5FC5\u987B\u662F\u5B57\u7B26\u4E32`);
          } else if (!/^data:image\/(png|jpe?g|webp|gif|bmp|avif);base64,[A-Za-z0-9+/=\s]+$/.test(asset.dataUrl)) {
            errors.push(`assets[${i}] dataUrl \u5FC5\u987B\u662F data:image/<png|jpeg|webp|gif|bmp|avif>;base64,<\u6570\u636E>`);
          } else if (asset.dataUrl.length > MAX_ASSET_DATAURL_LENGTH) {
            errors.push(`assets[${i}] \u5185\u5D4C\u4F53\u79EF\u8D85\u8FC7\u4E0A\u9650\uFF08dataUrl \u2264 ${MAX_ASSET_DATAURL_LENGTH} \u5B57\u7B26\uFF09`);
          }
        }
        if (asset.layers !== void 0) {
          const L = asset.layers;
          if (!isRecord(L) || typeof L.animAssetId !== "string" || !ID_PATTERN.test(L.animAssetId) || typeof L.x !== "number" || typeof L.y !== "number" || typeof L.w !== "number" || typeof L.h !== "number" || !Number.isFinite(L.x) || !Number.isFinite(L.y) || !Number.isFinite(L.w) || !Number.isFinite(L.h) || L.w <= 0 || L.h <= 0) {
            errors.push(`assets[${i}] layers \u5FC5\u987B\u662F {animAssetId,x,y,w,h}\uFF08\u6570\u5B57\u77E9\u5F62\uFF09`);
          }
        }
      }
    }
  }
  if (raw.widgets !== void 0) {
    if (!Array.isArray(raw.widgets)) {
      errors.push("widgets \u5FC5\u987B\u662F\u6570\u7EC4");
    } else {
      for (let i = 0; i < raw.widgets.length; i += 1) {
        const widget = raw.widgets[i];
        if (!isRecord(widget) || typeof widget.id !== "string") {
          errors.push(`widgets[${i}] \u5FC5\u987B\u542B id \u5B57\u7B26\u4E32`);
          continue;
        }
        const def = findWidget(widget.id);
        if (def === void 0) {
          errors.push(`widgets[${i}] id "${widget.id}" \u4E0D\u5728\u90E8\u4EF6\u76EE\u5F55\uFF08${WIDGETS.map((w) => w.id).join("/")}\uFF09`);
          continue;
        }
        if (!isRecord(widget.params)) {
          errors.push(`widgets[${i}] params \u5FC5\u987B\u662F\u5BF9\u8C61`);
          continue;
        }
        for (const param of def.params) {
          const value = widget.params[param.key];
          if (value === void 0) {
            if (param.default !== void 0) continue;
            errors.push(`widgets[${i}] \u53C2\u6570 ${param.key} \u5FC5\u987B\u662F\u5B57\u7B26\u4E32`);
            continue;
          }
          if (typeof value !== "string") {
            errors.push(`widgets[${i}] \u53C2\u6570 ${param.key} \u5FC5\u987B\u662F\u5B57\u7B26\u4E32`);
            continue;
          }
          if (param.type === "asset") {
            if (value !== "" && !assetIds.has(value)) {
              errors.push(`widgets[${i}] \u53C2\u6570 ${param.key} \u5F15\u7528\u4E86\u4E0D\u5B58\u5728\u7684\u7D20\u6750 ${value}`);
            }
          } else if (param.type === "number" || param.type === "range") {
            if (value.trim() === "") {
              errors.push(`widgets[${i}] \u53C2\u6570 ${param.key} \u4E0D\u80FD\u4E3A\u7A7A\u4E32`);
            } else {
              const num = Number(value);
              if (!Number.isFinite(num)) {
                errors.push(`widgets[${i}] \u53C2\u6570 ${param.key} \u5FC5\u987B\u662F\u6570\u5B57`);
              } else if (param.min !== void 0 && num < param.min) {
                errors.push(`widgets[${i}] \u53C2\u6570 ${param.key} \u4E0D\u80FD\u5C0F\u4E8E ${param.min}`);
              } else if (param.max !== void 0 && num > param.max) {
                errors.push(`widgets[${i}] \u53C2\u6570 ${param.key} \u4E0D\u80FD\u5927\u4E8E ${param.max}`);
              }
            }
          } else if (param.type === "url") {
            if (value !== "" && !isSafeImageUrl(value)) {
              errors.push(`widgets[${i}] \u53C2\u6570 ${param.key} \u5FC5\u987B\u662F http/https \u56FE\u7247\u94FE\u63A5\uFF08\u2264${MAX_IMAGE_URL_LENGTH} \u5B57\u7B26\uFF0C\u7981\u5F15\u53F7/\u62EC\u53F7/\u7A7A\u767D\uFF09`);
            }
          } else if (param.type === "select" && param.options !== void 0 && !param.options.some((o) => o.value === value)) {
            errors.push(`widgets[${i}] \u53C2\u6570 ${param.key} \u4E0D\u5728\u9009\u9879\u5185`);
          }
        }
        for (const key of ["cropX", "cropY", "cropW", "cropH", "cropXDark", "cropYDark", "cropWDark", "cropHDark"]) {
          const value = widget.params[key];
          if (value === void 0) continue;
          if (typeof value !== "string" || !/^[+-]?(\d+(\.\d+)?|\.\d+)$/.test(value.trim())) {
            errors.push(`widgets[${i}] \u53C2\u6570 ${key} \u5FC5\u987B\u662F\u5341\u8FDB\u5236\u6570\u5B57\u5B57\u7B26\u4E32`);
          }
        }
        const darkAssetId = widget.params.assetIdDark;
        if (darkAssetId !== void 0) {
          if (typeof darkAssetId !== "string") {
            errors.push(`widgets[${i}] \u53C2\u6570 assetIdDark \u5FC5\u987B\u662F\u5B57\u7B26\u4E32`);
          } else if (darkAssetId !== "" && !assetIds.has(darkAssetId)) {
            errors.push(`widgets[${i}] \u53C2\u6570 assetIdDark \u5F15\u7528\u4E86\u4E0D\u5B58\u5728\u7684\u7D20\u6750 ${darkAssetId}`);
          }
        }
        const darkUrl = widget.params.imageUrlDark;
        if (darkUrl !== void 0 && (typeof darkUrl !== "string" || darkUrl !== "" && !isSafeImageUrl(darkUrl))) {
          errors.push(`widgets[${i}] \u53C2\u6570 imageUrlDark \u5FC5\u987B\u662F http/https \u56FE\u7247\u94FE\u63A5`);
        }
        const darkGradient = widget.params.gradientDark;
        if (darkGradient !== void 0 && (typeof darkGradient !== "string" || !gradientOptions().some((o) => o.value === darkGradient))) {
          errors.push(`widgets[${i}] \u53C2\u6570 gradientDark \u4E0D\u5728\u6E10\u53D8\u6863\u4F4D\u5185`);
        }
      }
    }
  }
  if (raw.cover !== void 0) {
    const cover = raw.cover;
    if (!isRecord(raw.cover) || typeof cover.assetId !== "string" || cover.assetId === "") {
      errors.push("cover \u5FC5\u987B\u662F { assetId } \u5BF9\u8C61\uFF08\u5F15\u7528\u9884\u8BBE\u5185\u7D20\u6750\uFF09");
    } else if (!assetIds.has(cover.assetId)) {
      errors.push(`cover.assetId \u5F15\u7528\u4E86\u4E0D\u5B58\u5728\u7684\u7D20\u6750 ${cover.assetId}`);
    } else {
      for (const key of ["cropX", "cropY", "cropW", "cropH"]) {
        const value = cover[key];
        if (value === void 0) continue;
        if (typeof value !== "string" || !/^[+-]?(\d+(\.\d+)?|\.\d+)$/.test(value.trim())) {
          errors.push(`cover.${key} \u5FC5\u987B\u662F\u5341\u8FDB\u5236\u6570\u5B57\u5B57\u7B26\u4E32`);
        } else if ((key === "cropW" || key === "cropH") && Number(value) <= 0) {
          errors.push(`cover.${key} \u5FC5\u987B > 0`);
        }
      }
    }
  }
  if (errors.length > 0) return { ok: false, errors };
  const preset2 = {
    schemaVersion: SCHEMA_VERSION,
    id: id.trim(),
    name: name2.trim(),
    edition,
    tokens: Object.fromEntries(
      Object.entries(raw.tokens).map(([k, v]) => [k, { light: v.light, dark: v.dark }])
    )
  };
  if (typeof raw.minDshVersion === "string") preset2.minDshVersion = raw.minDshVersion.trim();
  if (typeof raw.targetDshVersion === "string") preset2.targetDshVersion = raw.targetDshVersion.trim();
  if (Array.isArray(raw.tags)) preset2.tags = [...raw.tags];
  if (isRecord(raw.author)) preset2.author = { ...raw.author };
  if (Array.isArray(raw.css)) {
    preset2.css = raw.css.map((entry) => ({
      selector: String(entry.selector ?? ""),
      rules: String(entry.rules ?? "")
    }));
  }
  if (raw.theme !== void 0) {
    const theme = raw.theme;
    preset2.theme = {
      id: theme.id.trim(),
      colorScheme: theme.colorScheme,
      tokens: Object.fromEntries(
        Object.entries(theme.tokens).map(([k, v]) => [k, { light: v.light, dark: v.dark }])
      )
    };
  }
  if (Array.isArray(raw.assets)) {
    preset2.assets = raw.assets.map((asset) => {
      const entry = {
        id: asset.id,
        name: asset.name,
        mime: asset.mime
      };
      const dataUrl = asset.dataUrl;
      if (typeof dataUrl === "string") entry.dataUrl = dataUrl;
      const layers = asset.layers;
      if (layers !== void 0) entry.layers = layers;
      return entry;
    });
  }
  if (Array.isArray(raw.widgets)) {
    preset2.widgets = raw.widgets.map((widget) => ({
      id: widget.id,
      params: { ...widget.params }
    }));
  }
  if (raw.cover !== void 0) {
    const cover = raw.cover;
    const cleaned = { assetId: cover.assetId.trim() };
    for (const key of ["cropX", "cropY", "cropW", "cropH"]) {
      if (typeof cover[key] === "string") cleaned[key] = cover[key];
    }
    preset2.cover = cleaned;
  }
  const extra = {};
  if (isRecord(raw.extra)) {
    for (const [k, v] of Object.entries(raw.extra)) {
      if (Object.hasOwn(preset2, k)) continue;
      Object.defineProperty(extra, k, { value: v, enumerable: true, writable: true, configurable: true });
    }
  }
  for (const [k, v] of Object.entries(raw)) {
    if (Object.hasOwn(preset2, k) || k === "schemaVersion" || k === "extra") continue;
    Object.defineProperty(extra, k, { value: v, enumerable: true, writable: true, configurable: true });
  }
  if (Object.keys(extra).length > 0) preset2.extra = extra;
  return { ok: true, preset: preset2 };
}
function normalizeDanglingCover(preset2) {
  const cover = preset2.cover;
  if (cover === void 0) return { preset: preset2, dropped: false };
  const assets = preset2.assets ?? [];
  if (assets.some((asset) => asset.id === cover.assetId)) return { preset: preset2, dropped: false };
  const { cover: _dropped, ...rest } = preset2;
  return { preset: rest, dropped: true };
}
function checkDshCompatibility(preset2, currentDshVersion) {
  if (preset2.minDshVersion === void 0) return null;
  const required = parseVersion(preset2.minDshVersion);
  const current = parseVersion(currentDshVersion);
  if (required === null || current === null) return null;
  if (compareVersion(current, required) < 0) {
    return `\u6B64\u9884\u8BBE\u8981\u6C42 DSH \u2265 ${preset2.minDshVersion}\uFF0C\u5F53\u524D\u4E3A ${currentDshVersion}`;
  }
  return null;
}
function parseVersion(v) {
  const m = /^(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z.]+))?/.exec(v);
  if (m === null) return null;
  const prerelease = m[4] === void 0 ? [] : m[4].split(".").map((part) => {
    const numeric = Number(part);
    return Number.isNaN(numeric) ? part : numeric;
  });
  return [Number(m[1]), Number(m[2]), Number(m[3]), ...prerelease];
}
function compareVersion(a, b) {
  for (let i = 0; i < Math.max(a.length, b.length); i += 1) {
    const av = a[i];
    const bv = b[i];
    if (av === void 0) return 1;
    if (bv === void 0) return -1;
    if (typeof av === "number" && typeof bv === "number") {
      if (av !== bv) return av - bv;
    } else {
      const as = String(av);
      const bs = String(bv);
      if (as !== bs) return as < bs ? -1 : 1;
    }
  }
  return 0;
}

// src/core/engine.ts
function flattenTokens(tokens, scheme) {
  const out = {};
  for (const [k, v] of Object.entries(tokens)) out[k] = v[scheme];
  return out;
}
function canonicalJson(value) {
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  if (value !== null && typeof value === "object") {
    const record = value;
    const keys = Object.keys(record).sort();
    return `{${keys.map((k) => `${JSON.stringify(k)}:${canonicalJson(record[k])}`).join(",")}}`;
  }
  return JSON.stringify(value);
}
function tokensEqual(a, b) {
  const keysA = Object.keys(a);
  if (keysA.length !== Object.keys(b).length) return false;
  for (const key of keysA) {
    const va = a[key];
    const vb = b[key];
    if (vb === void 0 || va.light !== vb.light || va.dark !== vb.dark) return false;
  }
  return true;
}
function compilePreset(preset2, colorScheme = "light") {
  const compiled = { preset: preset2, tokens: { ...preset2.tokens } };
  const extra = preset2.extra;
  const cssRules = preset2.css ?? (Array.isArray(extra?.css) ? extra.css : void 0);
  const widgetText = widgetsToCss(preset2.widgets, preset2.assets ?? []);
  if (cssRules !== void 0 || widgetText !== "") {
    const cssText = [cssRules !== void 0 ? cssRulesToText(cssRules) : "", widgetText].filter((t2) => t2 !== "").join("\n");
    if (cssText !== "") compiled.css = { source: `ui-presets:${preset2.id}`, text: cssText };
  }
  const themeDef = preset2.theme ?? extra?.theme;
  if (themeDef !== void 0 && typeof themeDef.id === "string" && (themeDef.colorScheme === "light" || themeDef.colorScheme === "dark") && typeof themeDef.tokens === "object" && themeDef.tokens !== null) {
    compiled.theme = {
      id: themeDef.id,
      colorScheme: themeDef.colorScheme,
      tokens: flattenTokens(themeDef.tokens, themeDef.colorScheme)
    };
  }
  return compiled;
}
var PresetEngine = class {
  constructor(options) {
    __publicField(this, "theme");
    __publicField(this, "style");
    __publicField(this, "currentDshVersion");
    __publicField(this, "onStateChange");
    __publicField(this, "state", {
      activePresetId: null,
      hasDraft: false,
      draftPresetId: null,
      lastError: null,
      revision: 0
    });
    /** 活动层 disposer 链（应用新预设前先收旧链）。 */
    __publicField(this, "activeDisposers", []);
    /** 草稿层 disposer 链。 */
    __publicField(this, "draftDisposers", []);
    /** 上一个成功活动预设 id（损坏回退目标）。 */
    __publicField(this, "lastGoodPresetId", null);
    /** 活动层编译快照（M1 预览取数：改前基线）。 */
    __publicField(this, "activeCompiled", { tokens: {}, hasCss: false });
    /** 草稿层编译快照（M1 预览取数：改后）。 */
    __publicField(this, "draftCompiled", null);
    /** 草稿层当前完整令牌基线（patchDraft 差分合并用）。 */
    __publicField(this, "draftTokenBaseline", {});
    /** 草稿层 css 注入文本基线（M2-2：css 变更也触发重挂）。 */
    __publicField(this, "draftCssBaseline", "");
    /** 活动层 css 注入文本基线（#52b：controller 动态裁剪渲染取数——解析裁剪标记）。 */
    __publicField(this, "activeCssBaseline", "");
    /** 草稿层主题注册基线（M2-4：主题开关/色板变更也触发重挂——短路径只比 tokens+css 会吞掉主题变更）。 */
    __publicField(this, "draftThemeBaseline", "");
    /** 主题注册引用计数（M2-4：草稿重挂 teardown 旧链会注销——引用计数保证
     * 只要还有挂载链引用该主题就不注销；计数归零才真正注销）。 */
    __publicField(this, "themeRefCounts", /* @__PURE__ */ new Map());
    /** 最近一次 state 快照的稳定引用（review P3：getState 返回缓存引用——useSyncExternalStore
     * 用 Object.is 比较，每次渲染新对象会触发无限重渲染（React #185）；同时防外部直接改内部对象）。 */
    __publicField(this, "stateSnapshot", {
      activePresetId: null,
      hasDraft: false,
      draftPresetId: null,
      lastError: null,
      revision: 0
    });
    this.theme = options.theme;
    this.style = options.style;
    this.currentDshVersion = options.currentDshVersion;
    this.onStateChange = options.onStateChange;
  }
  getState() {
    return this.stateSnapshot;
  }
  /** 活动层编译快照（M1 预览"改前"基线；无活动预设 = 空快照）。 */
  getActiveCompiled() {
    return this.activeCompiled;
  }
  /** 外部报告错误（controller 落盘失败等非挂载类错误 → 状态条可见）。 */
  reportError(message) {
    this.setState({ lastError: message });
  }
  /** 当前生效的 css 注入文本（草稿优先——编辑中即取草稿层；#52b 裁剪标记解析用）。 */
  getCurrentCssText() {
    return this.state.hasDraft ? this.draftCssBaseline : this.activeCssBaseline;
  }
  /** 草稿层编译快照（M1 预览"改后"；无草稿 = null）。 */
  getDraftCompiled() {
    return this.draftCompiled;
  }
  /**
   * 草稿更新（连接性评审 P1-2 修复后的语义）：
   * 调用方传入完整编辑态（preset.tokens 为权威目标）；引擎与基线**逐键比较**——
   * 无差异（含改名/无实质变更）→ 不重挂（短路，性能保障）；
   * 有差异（含**令牌被移除**——撤销到空令牌）→ 以目标全量重挂并更新快照，
   * 修复"空 patch 提前返回导致残留令牌泄漏到主题层/快照"的缺陷。
   * 无草稿时等价于 startDraft。
   * @param preset - 完整预设（编辑态权威）。
   * @returns 是否成功。
   */
  patchDraft(preset2) {
    if (!this.state.hasDraft) return this.startDraft(preset2);
    try {
      const error = this.checkCompatibility(preset2);
      if (error !== null) throw new Error(error);
      const compiled = compilePreset(preset2);
      const target = { ...preset2.tokens };
      const cssText = compiled.css?.text ?? "";
      const themeText = compiled.theme !== void 0 ? canonicalJson(compiled.theme) : "";
      if (tokensEqual(this.draftTokenBaseline, target) && cssText === this.draftCssBaseline && themeText === this.draftThemeBaseline) {
        if (this.state.draftPresetId !== preset2.id) {
          this.setState({ draftPresetId: preset2.id });
        }
        return true;
      }
      const disposers = this.mount(compiled);
      this.teardown(this.draftDisposers);
      this.draftDisposers = disposers;
      this.draftTokenBaseline = target;
      this.draftCssBaseline = cssText;
      this.draftThemeBaseline = themeText;
      this.draftCompiled = { tokens: target, hasCss: compiled.css !== void 0 };
      this.setState({ hasDraft: true, draftPresetId: preset2.id, lastError: null });
      return true;
    } catch (error) {
      this.setState({ lastError: messageOf(error) });
      return false;
    }
  }
  /**
   * 应用预设为活动预设（停用旧活动层）。任一步失败 → 自动还原旧层（损坏回退）。
   * @param preset - 已校验预设。
   * @returns true 成功；false 失败（lastError 已设置，已回退）。
   */
  applyPreset(preset2) {
    const oldDisposers = this.activeDisposers;
    const oldId = this.state.activePresetId;
    try {
      const error = this.checkCompatibility(preset2);
      if (error !== null) throw new Error(error);
      const compiled = compilePreset(preset2);
      const disposers = this.mount(compiled);
      this.teardown(oldDisposers);
      this.activeDisposers = disposers;
      this.activeCompiled = this.snapshotOf(compiled);
      this.activeCssBaseline = compiled.css?.text ?? "";
      this.lastGoodPresetId = preset2.id;
      this.setState({ activePresetId: preset2.id, lastError: null });
      return true;
    } catch (error) {
      this.setState({ activePresetId: oldId, lastError: messageOf(error) });
      return false;
    }
  }
  /**
   * 还原到上一个成功活动预设（失败恢复语义）。
   * @returns true 当且仅当状态被实际改变；false（无目标/已是最新好状态）并清除 lastError。
   */
  revertToLastActive() {
    if (this.lastGoodPresetId === null || this.activeDisposers.length === 0 || this.state.activePresetId === this.lastGoodPresetId) {
      this.setState({ lastError: null });
      return false;
    }
    this.setState({ activePresetId: this.lastGoodPresetId, lastError: null });
    return true;
  }
  /** 挂草稿层（与活动层并存，草稿优先可见）。替换旧草稿；新草稿失败时旧草稿保留（P1 修复）。 */
  startDraft(preset2) {
    const oldDraftDisposers = this.draftDisposers;
    try {
      const error = this.checkCompatibility(preset2);
      if (error !== null) throw new Error(error);
      const compiled = compilePreset(preset2);
      const disposers = this.mount(compiled);
      this.teardown(oldDraftDisposers);
      this.draftDisposers = disposers;
      this.draftTokenBaseline = { ...preset2.tokens };
      this.draftCssBaseline = compiled.css?.text ?? "";
      this.draftThemeBaseline = compiled.theme !== void 0 ? canonicalJson(compiled.theme) : "";
      this.draftCompiled = this.snapshotOf(compiled);
      this.setState({ hasDraft: true, draftPresetId: preset2.id, lastError: null });
      return true;
    } catch (error) {
      this.setState({ hasDraft: oldDraftDisposers.length > 0, draftPresetId: this.state.draftPresetId, lastError: messageOf(error) });
      return false;
    }
  }
  /** 替换草稿层内容（编辑中防抖调用）。 */
  updateDraft(preset2) {
    return this.startDraft(preset2);
  }
  /** 放弃草稿：移除草稿层，恢复活动层可见（无草稿时不发状态）。 */
  discardDraft() {
    if (!this.state.hasDraft) return;
    this.teardown(this.draftDisposers);
    this.draftDisposers = [];
    this.draftTokenBaseline = {};
    this.draftCssBaseline = "";
    this.draftThemeBaseline = "";
    this.draftCompiled = null;
    this.setState({ hasDraft: false, draftPresetId: null });
  }
  /** 保存草稿为活动预设（草稿层直接提升为活动层；无草稿时 no-op）。 */
  saveDraftAsActive() {
    if (!this.state.hasDraft || this.state.draftPresetId === null) return false;
    this.teardown(this.activeDisposers);
    this.activeDisposers = this.draftDisposers;
    this.draftDisposers = [];
    const id = this.state.draftPresetId;
    this.lastGoodPresetId = id;
    this.activeCompiled = this.draftCompiled ?? { tokens: {}, hasCss: false };
    this.activeCssBaseline = this.draftCssBaseline;
    this.draftTokenBaseline = {};
    this.draftCssBaseline = "";
    this.draftThemeBaseline = "";
    this.draftCompiled = null;
    this.setState({ hasDraft: false, draftPresetId: null, activePresetId: id, lastError: null });
    return true;
  }
  /** 释放全部层（插件卸载/还原默认时调用）。 */
  dispose() {
    this.teardown(this.activeDisposers);
    this.teardown(this.draftDisposers);
    this.activeDisposers = [];
    this.draftDisposers = [];
    this.themeRefCounts.clear();
    this.lastGoodPresetId = null;
    this.activeCompiled = { tokens: {}, hasCss: false };
    this.activeCssBaseline = "";
    this.draftTokenBaseline = {};
    this.draftCompiled = null;
    this.setState({ activePresetId: null, hasDraft: false, draftPresetId: null, lastError: null });
  }
  // ---- 内部 ----
  checkCompatibility(preset2) {
    if (this.currentDshVersion === void 0) return null;
    return checkDshCompatibility(preset2, this.currentDshVersion);
  }
  /** 快照构建：编译产物 → 双值令牌快照。 */
  snapshotOf(compiled) {
    return {
      tokens: { ...compiled.tokens },
      hasCss: compiled.css !== void 0
    };
  }
  /** 挂载编译产物，返回 disposer 链；任一步失败 → 自清理已挂载部分后重抛（调用方回退）。 */
  mount(compiled) {
    const disposers = [];
    try {
      disposers.push(this.theme.overrideTokens(`ui-presets:${compiled.preset.id}`, compiled.tokens));
      if (compiled.css !== void 0 && this.style !== void 0) {
        disposers.push(this.style.injectCss(compiled.css.source, compiled.css.text));
      }
      if (compiled.theme !== void 0) {
        disposers.push(this.registerThemeOnce(compiled.theme));
      }
      return disposers;
    } catch (error) {
      for (let i = disposers.length - 1; i >= 0; i -= 1) {
        try {
          disposers[i]();
        } catch {
        }
      }
      throw error;
    }
  }
  /** 主题注册（引用计数幂等）：同一 id 多次挂载只注册一次，逐链递减，
   * 计数归零才真正注销（草稿重挂/活动+草稿并存均安全）。
   * #96（审计）：同 id **内容变化**时必须重注册——此前只计数不重注册，编辑主题令牌/明暗后
   * 切换该主题拿到的是首次注册的旧定义（功能静默失效）；计数语义保持不变。 */
  registerThemeOnce(definition) {
    if (this.theme.register === void 0) return () => {
    };
    const existing = this.themeRefCounts.get(definition.id);
    if (existing !== void 0) {
      if (existing.definition.colorScheme === definition.colorScheme && canonicalJson(existing.definition.tokens) === canonicalJson(definition.tokens)) {
        existing.count += 1;
      } else {
        try {
          existing.disposer();
        } catch {
        }
        const disposer = this.theme.register(definition);
        this.themeRefCounts.set(definition.id, { count: 1, disposer, definition });
      }
    } else {
      const disposer = this.theme.register(definition);
      this.themeRefCounts.set(definition.id, { count: 1, disposer, definition });
    }
    let released = false;
    return () => {
      if (released) return;
      released = true;
      const current = this.themeRefCounts.get(definition.id);
      if (current === void 0) return;
      current.count -= 1;
      if (current.count <= 0) {
        this.themeRefCounts.delete(definition.id);
        try {
          current.disposer();
        } catch {
        }
      }
    };
  }
  teardown(disposers) {
    for (let i = disposers.length - 1; i >= 0; i -= 1) {
      try {
        disposers[i]();
      } catch {
      }
    }
  }
  setState(patch) {
    this.state = { ...this.state, ...patch, revision: this.state.revision + 1 };
    this.stateSnapshot = this.state;
    try {
      this.onStateChange?.(this.state);
    } catch (error) {
      console.error("[ui-presets] engine state listener threw:", error);
    }
  }
};
function messageOf(error) {
  return error instanceof Error ? error.message : String(error);
}

// src/core/version.ts
var CURRENT_DSH_VERSION = "0.1.0-rc.5";

// src/core/preset-source.ts
var sources = /* @__PURE__ */ new Map();
function listPresetSources() {
  return [...sources.values()];
}

// src/client/i18n.ts
var LOCALE_KEY = "ui-presets-locale";
var ZH = {
  "section.title": "\u5916\u89C2\u9884\u8BBE",
  "common.cancel": "\u53D6\u6D88",
  "common.confirm": "\u786E\u5B9A",
  "confirm.aria": "\u786E\u8BA4",
  "lang.switch": "EN",
  "lang.switchLabel": "Switch to English",
  "wall.openStudio": "\u6253\u5F00\u7F8E\u5316\u5DE5\u4F5C\u5BA4 \u2192",
  "wall.reset": "\u8FD8\u539F\u9ED8\u8BA4",
  "wall.surprise": "\u6362\u4E00\u4E2A\u8BD5\u8BD5",
  "wall.favOnly": "\u53EA\u770B\u6536\u85CF",
  "wall.favOnlyCount": "\u53EA\u770B\u6536\u85CF\uFF08{count}\uFF09",
  "wall.importShare": "\u5BFC\u5165\u5206\u4EAB\u7801",
  "wall.loading": "\u52A0\u8F7D\u9884\u8BBE\u4E2D\u2026",
  "wall.builtin": "\u51FA\u5382\u9884\u8BBE",
  "wall.mine": "\u6211\u7684\u9884\u8BBE",
  "wall.apply": "\u5E94\u7528",
  "wall.applied": "\u5DF2\u5E94\u7528",
  "wall.current": "\u2713 \u5F53\u524D\u5E94\u7528",
  "wall.share": "\u5206\u4EAB",
  "wall.favorite": "\u6536\u85CF",
  "wall.unfavorite": "\u53D6\u6D88\u6536\u85CF",
  "wall.favEmpty": "\u8FD8\u6CA1\u6709\u6536\u85CF\u2014\u2014\u70B9\u5361\u7247\u4E0A\u7684 \u2606 \u6536\u85CF\u4EFB\u4F55\u9884\u8BBE\u3002",
  "wall.emptyTitle": "\u8FD8\u6CA1\u6709\u81EA\u5DF1\u7684\u9884\u8BBE",
  "wall.emptyBody": "\u6253\u5F00\u5DE5\u4F5C\u5BA4\u521B\u5EFA\uFF0C\u6216\u5BFC\u5165\u9884\u8BBE\u6587\u4EF6\uFF08ZIP\uFF09\uFF1A",
  "wall.importFile": "\u5BFC\u5165\u9884\u8BBE\u6587\u4EF6",
  "wall.importing": "\u5BFC\u5165\u4E2D\u2026",
  "wall.imported": "\u5DF2\u5BFC\u5165\u300C{name}\u300D",
  "wall.importedAssets": "\u2014\u2014{count} \u4E2A\u7D20\u6750\u9700\u81EA\u884C\u8865\u56FE\uFF08\u5F15\u7528\u4E0E\u88C1\u526A\u5DF2\u4FDD\u7559\uFF09",
  "wall.noOther": "\u6CA1\u6709\u5176\u4ED6\u9884\u8BBE\u53EF\u6362\u2014\u2014\u5148\u65B0\u5EFA\u6216\u5BFC\u5165\u4E00\u4E2A",
  "wall.cannotRead": "\u65E0\u6CD5\u8BFB\u53D6\u9884\u8BBE\u300C{id}\u300D\uFF0C\u672A\u751F\u6210\u5206\u4EAB\u7801",
  "wall.auditPrefix": "\u26A0 {warnings}",
  "wall.importFailed": "\u5BFC\u5165\u5931\u8D25",
  "share.received": "\u6536\u5230\u5206\u4EAB\u9884\u8BBE\u300C{name}\u300D",
  "share.assetsOmitted": "\uFF08{count} \u4E2A\u7D20\u6750\u672A\u968F\u94FE\u63A5\u643A\u5E26\uFF09",
  "share.importToLibrary": "\u5BFC\u5165\u5230\u9884\u8BBE\u5E93",
  "share.ignore": "\u5FFD\u7565",
  "share.invalid": "\u5206\u4EAB\u94FE\u63A5\u65E0\u6548\uFF1A{error}",
  "share.gotIt": "\u77E5\u9053\u4E86",
  "share.exportTitle": "\u5206\u4EAB\u300C{name}\u300D",
  "share.exportBody": "\u5206\u4EAB\u7801\u5E26\uFF1A\u4EE4\u724C\uFF08\u660E\u6697\u53CC\u503C\uFF09\u3001CSS \u8865\u4E01\u3001\u90E8\u4EF6\u4E0E\u88C1\u526A\u53C2\u6570\u3001\u5C01\u9762\u3001\u539F\u751F\u4E3B\u9898\u6CE8\u518C\u3002",
  "share.exportOmitted": " \u5176\u4E2D {count} \u4E2A\u7D20\u6750\u7684\u56FE\u7247\u672C\u4F53\u4E0D\u968F\u5206\u4EAB\u8D70\uFF08\u5F15\u7528\u540D\u4E0E\u88C1\u526A\u4FDD\u7559\uFF0C\u5BF9\u65B9\u8865\u56FE\u5373\u53EF\u56DE\u586B\uFF1B\u5B8C\u6574\u4EA4\u4ED8\u8BF7\u7528 ZIP\uFF09\u3002",
  "share.linkLabel": "\u94FE\u63A5\uFF08\u540C\u4E00\u53F0\u673A\u5668\u6253\u5F00\u5373\u5BFC\u5165\uFF09",
  "share.codeLabel": "\u5206\u4EAB\u7801\uFF08\u8DE8\u673A\u5668\uFF1A\u5BF9\u65B9\u5728\u300C\u5916\u89C2\u9884\u8BBE \u2192 \u5BFC\u5165\u5206\u4EAB\u7801\u300D\u7C98\u8D34\uFF09",
  "share.copyLink": "\u590D\u5236\u94FE\u63A5",
  "share.copyCode": "\u590D\u5236\u5206\u4EAB\u7801",
  "share.copiedLink": "\u5DF2\u590D\u5236\u94FE\u63A5 \u2713",
  "share.copiedCode": "\u5DF2\u590D\u5236\u5206\u4EAB\u7801 \u2713",
  "share.codeChars": "\u5206\u4EAB\u7801 {count} \u5B57\u7B26",
  "share.copyFail": "\u590D\u5236\u5931\u8D25\uFF1A\u8BF7\u624B\u52A8\u5168\u9009\u590D\u5236\uFF08\u8F93\u5165\u6846\u5DF2\u81EA\u52A8\u9009\u4E2D\uFF09",
  "share.close": "\u5173\u95ED",
  "share.importTitle": "\u5BFC\u5165\u5206\u4EAB\u7801",
  "share.importBody": "\u7C98\u8D34\u5BF9\u65B9\u7ED9\u7684\u94FE\u63A5\u6216\u5206\u4EAB\u7801\u3002\u5BFC\u5165\u53EA\u5199\u5165\u9884\u8BBE\u5E93\uFF08\u4E0D\u81EA\u52A8\u5E94\u7528\uFF09\uFF0C\u6821\u9A8C\u4E0D\u901A\u8FC7\u4F1A\u660E\u786E\u62A5\u9519\u3002",
  "share.importPlaceholder": "#ui-presets-share=\u2026 \u6216\u76F4\u63A5\u7C98\u8D34\u5206\u4EAB\u7801",
  "share.cancel": "\u53D6\u6D88",
  "share.importAction": "\u5BFC\u5165",
  "knob.title": "\u5FEB\u6377\u8C03\u8272",
  "knob.summary": " \xB7 {knobs} \u4E2A\u65CB\u94AE / {categories} \u7C7B",
  "knob.dual": "\u660E\u6697\u5206\u522B\u8BBE\u7F6E",
  "knob.divergedCount": "{count} \u4E2A\u65CB\u94AE\u7684\u675F\u5185\u6709\u5355\u72EC\u8C03\u6574",
  "knob.intro": "\u65CB\u94AE = \u4E00\u6B21\u6539\u4E00\u7EC4\u4EE4\u724C\u7684\u5FEB\u6377\u65B9\u5F0F\uFF1B\u5199\u5165\u7684\u4ECD\u662F\u666E\u901A\u4EE4\u724C\uFF0C\u53EF\u5728\u4E0B\u65B9\u300C\u539F\u59CB\u4EE4\u724C\u300D\u7EE7\u7EED\u7CBE\u8C03\u3002",
  "knob.caution": "\u26A0 \u5F71\u54CD\u9762\u5927",
  "knob.diverged": "\u675F\u5185\u5DF2\u5355\u72EC\u8C03\u6574",
  "knob.colorAria": "\u53D6\u8272",
  "knob.valueAria": "\u503C",
  "knob.sliderAria": "\u6ED1\u5757",
  "knob.numberAria": "\u6570\u503C",
  "knob.selectAria": "\u6863\u4F4D",
  "knob.varPlaceholder": "var() \u5F15\u7528 \u2192 \u9AD8\u7EA7\u533A",
  "css.title": "CSS \u8865\u4E01",
  "css.count": " \xB7 {count} \u6761",
  "css.invalid": "\uFF08{count} \u6761\u5F85\u4FEE\uFF09",
  "css.hint": "\u9009\u62E9\u5668\u5FC5\u987B\u4EE5 [data-*] \u951A\u70B9\u5F00\u5934\uFF08\u5982 [data-up-card]\uFF09\uFF0C\u58F0\u660E\u5757\u5199\u666E\u901A CSS \u4F46\u4E0D\u8981\u82B1\u62EC\u53F7\u3002\u4FDD\u5B58\u4E0E\u5BFC\u5165\u90FD\u4F1A\u6309\u540C\u4E00\u767D\u540D\u5355\u6821\u9A8C\u3002",
  "css.delete": "\u5220\u9664",
  "css.add": "+ \u6DFB\u52A0\u89C4\u5219",
  "css.errEmpty": "\u9009\u62E9\u5668\u4E0D\u80FD\u4E3A\u7A7A",
  "css.errSelector": "\u9009\u62E9\u5668\u987B\u4EE5 [data-* \u5F00\u5934\uFF0C\u4E14\u4E0D\u5F97\u542B { } ;",
  "css.errBraces": "\u58F0\u660E\u5757\u7981\u6B62\u82B1\u62EC\u53F7\uFF08\u9632\u6837\u5F0F\u5757\u9003\u9038\uFF09",
  "css.errLength": "\u58F0\u660E\u5757\u8D85\u8FC7 {max} \u5B57\u7B26",
  "theme.title": "\u6CE8\u518C\u4E3A\u539F\u751F\u4E3B\u9898",
  "theme.on": " \xB7 \u5DF2\u5F00\u542F\uFF08{scheme}\uFF09",
  "theme.off": " \xB7 \u672A\u5F00\u542F",
  "theme.enable": "\u4FDD\u5B58\u65F6\u6CE8\u518C\u4E3A DSH \u4E3B\u9898",
  "theme.needTokens": "\u5148\u6539\u81F3\u5C11\u4E00\u4E2A\u4EE4\u724C\u2014\u2014\u7A7A\u4E3B\u9898\u4E0E\u9ED8\u8BA4\u5916\u89C2\u65E0\u5F02\uFF0C\u6CE8\u518C\u6CA1\u6709\u610F\u4E49\u3002",
  "theme.scheme": "\u57FA\u8272\u677F",
  "theme.schemeDark": "dark\uFF08\u6697\u8272\uFF09",
  "theme.schemeLight": "light\uFF08\u4EAE\u8272\uFF09",
  "theme.hint": "\u4E3B\u9898 id\uFF1A{id}\uFF1B\u4EE4\u724C = \u672C\u9884\u8BBE\u4EE4\u724C\u6309\u6240\u9009\u57FA\u8272\u677F\u5C55\u5E73\u3002\u6CE8\u518C\u540E\u300C\u8BBE\u7F6E \u2192 \u5916\u89C2\u300D\u53EF\u76F4\u63A5\u9009\u5230\uFF0C\u5DE5\u4F5C\u5BA4\u5E95\u90E8\u4E5F\u4F1A\u51FA\u73B0\u300C\u5207\u6362\u5230\u6B64\u4E3B\u9898\u300D\u3002",
  "rot.title": "\u8F6E\u6362\uFF08\u4EC5\u672C\u673A\uFF09",
  "rot.on": "\u5DF2\u542F\u7528 \xB7 {count} \u6761 \xB7 \u6BCF {minutes} \u5206\u949F",
  "rot.off": "\u672A\u542F\u7528",
  "rot.hint": "\u6BCF\u884C\u4E00\u6761 http/https \u56FE\u7247\u94FE\u63A5\uFF082\u2013{max} \u6761\uFF09\u3002\u914D\u7F6E\u53EA\u5B58\u5728\u672C\u673A\uFF0C\u4E0D\u968F\u9884\u8BBE/\u5206\u4EAB\u8D70\uFF1B\u7A97\u53E3\u9690\u85CF\u65F6\u4E0D\u5207\u6362\uFF0C\u56DE\u5230\u524D\u53F0\u8865\u4E0A\u3002",
  "rot.linksAria": "\u8F6E\u6362\u94FE\u63A5",
  "rot.interval": "\u95F4\u9694",
  "rot.intervalAria": "\u8F6E\u6362\u95F4\u9694",
  "rot.saveNew": "\u4FDD\u5B58\u5E76\u542F\u7528",
  "rot.saveEdit": "\u4FDD\u5B58\u4FEE\u6539",
  "rot.now": "\u7ACB\u5373\u6362\u4E0B\u4E00\u5F20",
  "rot.disable": "\u505C\u7528",
  "rot.rejected": "\u5DF2\u5FFD\u7565 {count} \u884C\u65E0\u6548\u94FE\u63A5",
  "rot.needTwo": "\u81F3\u5C11\u9700\u8981 2 \u6761\u6709\u6548 http/https \u94FE\u63A5\uFF08\u5F53\u524D {count} \u6761{extra}\uFF09",
  "rot.rejectedExtra": "\uFF0C\u4E22\u5F03 {count} \u884C",
  "rot.invalid": "\u914D\u7F6E\u65E0\u6548\uFF0C\u672A\u4FDD\u5B58",
  "rot.enabled": "\u5DF2\u542F\u7528\uFF1A{count} \u6761\u94FE\u63A5 / \u6BCF {minutes} \u5206\u949F\uFF1B\u4E0B\u4E00\u6B21 tick\uFF08\u2264{seconds} \u79D2\uFF09\u751F\u6548",
  "rot.disabled": "\u5DF2\u505C\u7528\uFF08\u9884\u8BBE\u91CC\u7684\u5F53\u524D\u56FE\u7247\u4FDD\u6301\u4E0D\u53D8\uFF09",
  "rot.notActive": "\u6B64\u9884\u8BBE\u5F53\u524D\u672A\u5E94\u7528\u2014\u2014\u5148\u5E94\u7528\u5B83\uFF0C\u8F6E\u6362\u624D\u4F1A\u4F5C\u7528\u5230\u754C\u9762",
  "rot.rotated": "\u5DF2\u6362\u5230\u4E0B\u4E00\u5F20",
  "rot.fail": "\u6362\u56FE\u5931\u8D25\uFF1A\u6CA1\u6709\u53EF\u7528\u7684\u6D3B\u52A8\u9884\u8BBE\u6216\u914D\u7F6E",
  "rot.minutes": "{count} \u5206\u949F",
  "rot.hours": "{count} \u5C0F\u65F6",
  "rot.days": "{count} \u5929",
  "token.undo": "\u64A4\u9500",
  "token.cover": "\u5C01\u9762",
  "token.coverAuto": "\u81EA\u52A8\u751F\u6210\uFF08\u63A8\u8350\uFF09",
  "token.coverHint": "\u9009\u7D20\u6750\u6309 3:1 \u88C1\u526A \xB7 \u5339\u914D\u8BBE\u7F6E\u9875\u5361\u7247",
  "token.coverAria": "\u9884\u8BBE\u5C01\u9762\u7D20\u6750",
  "token.coverPreviewAlt": "\u5C01\u9762\u9884\u89C8",
  "token.groups": "\u5206\u7EC4\u67D3\u8272",
  "token.groupScheme": "\u660E\u6697\u5206\u522B\u7F16\u8F91\uFF08\u4E0D\u52FE = \u540C\u8272\u540C\u65F6\u5199\u4EAE/\u6697\uFF09",
  "token.groupColor": "\u7EC4\u8272",
  "token.light": "\u4EAE",
  "token.dark": "\u6697",
  "token.both": "\uFF08\u4EAE+\u6697\u540C\u65F6\uFF09",
  "token.dissolve": "\u89E3\u6563",
  "token.members": "\u6210\u5458\uFF1A",
  "token.groupTokens": " \xB7 {count} \u4E2A\u4EE4\u724C",
  "token.advanced": "\u539F\u59CB\u4EE4\u724C",
  "token.advancedCount": " \xB7 {count} \u4E2A\uFF08\u652F\u6301\u5206\u7EC4\u67D3\u8272\u4E0E\u4E2D\u6587\u63CF\u8FF0\uFF09",
  "token.search": "\u641C\u7D22\u4EE4\u724C\u2026",
  "token.groupMode": "\u5206\u7EC4\u6A21\u5F0F",
  "token.groupModeOn": "\u2713 \u5206\u7EC4\u6A21\u5F0F\uFF08\u70B9\u9009\u4EE4\u724C\uFF09",
  "token.groupNamePlaceholder": "\u7EC4\u540D\uFF08\u5982\uFF1A\u64CD\u4F5C\u533A\uFF09",
  "token.createGroup": "\u65B0\u5EFA\u7EC4\uFF08{count}\uFF09",
  "token.expandExpert": "\u5C55\u5F00\u5168\u90E8\u9AD8\u7EA7\u4EE4\u724C\uFF08\u98CE\u9669\u4EE4\u724C\u9ED8\u8BA4\u9690\u85CF\uFF09",
  "token.colToken": "\u4EE4\u724C",
  "token.colLight": "\u4EAE\u8272",
  "token.colDark": "\u6697\u8272",
  "token.saveNote": "\u5B58",
  "token.notePlaceholder": "\u8F93\u5165\u4E2D\u6587\u63CF\u8FF0\uFF08\u5E2E\u52A9\u81EA\u5DF1\u8BC6\u522B\uFF09\u2026",
  "token.selfNote": "\uFF08\u81EA\u586B\uFF09",
  "token.nameAria": "\u9884\u8BBE\u540D\u79F0",
  "token.groupNameAria": "\u65B0\u7EC4\u540D\u79F0",
  "ctrl.activePersistFailed": "\u6D3B\u52A8\u9884\u8BBE\u5DF2\u5E94\u7528\uFF0C\u4F46\u6301\u4E45\u5316\u5931\u8D25\uFF08\u91CD\u542F\u540E\u53EF\u80FD\u6062\u590D\u4E3A\u4E4B\u524D\u7684\u9884\u8BBE\uFF09",
  "ctrl.broken": "\u9884\u8BBE\u300C{id}\u300D\u5DF2\u635F\u574F\uFF1A{error}",
  "ctrl.validationFailed": "\u6821\u9A8C\u5931\u8D25",
  "ctrl.notSynced": "\u4FDD\u5B58\u5DF2\u843D\u76D8\uFF0C\u4F46\u6D3B\u52A8\u9884\u8BBE\u672A\u540C\u6B65\uFF08\u53EF\u91CD\u542F\u540E\u6062\u590D\uFF09",
  "ctrl.exportHttp": "\u5BFC\u51FA ZIP \u5931\u8D25\uFF08HTTP {status}\uFF09",
  "ctrl.exportNet": "\u5BFC\u51FA ZIP \u5931\u8D25\uFF08\u7F51\u7EDC\u9519\u8BEF\uFF09",
  "ctrl.missing": "\u9884\u8BBE\u300C{id}\u300D\u4E0D\u5B58\u5728\u6216\u65E0\u6CD5\u52A0\u8F7D",
  "ctrl.uploadNet": "\u7D20\u6750\u4E0A\u4F20\u5931\u8D25\uFF08\u7F51\u7EDC\u9519\u8BEF\uFF09",
  "ctrl.themeSwitch": "\u5207\u6362\u4E3B\u9898\u5931\u8D25\uFF1A{error}",
  "share.badPreset": "\u9884\u8BBE\u6821\u9A8C\u5931\u8D25\uFF1A{errors}",
  "share.tooLarge": "\u9884\u8BBE\u8FC7\u5927\uFF08\u5206\u4EAB\u7801 {chars} \u5B57\u7B26\uFF0C\u4E0A\u9650 {max}\uFF09\u2014\u2014\u7D20\u6750\u8BF7\u6539\u7528 ZIP \u5BFC\u51FA",
  "share.longCode": "\u5206\u4EAB\u7801\u8F83\u957F\uFF08{chars} \u5B57\u7B26\uFF09\uFF1A\u804A\u5929\u8F6F\u4EF6\u53EF\u80FD\u6298\u884C\uFF0C\u4F18\u5148\u7528 ZIP \u6216\u53EA\u5206\u4EAB\u4EE4\u724C",
  "share.notCode": "\u4E0D\u662F\u5206\u4EAB\u7801\uFF1A\u5E94\u4E3A ui-presets-share=\u2026 \u94FE\u63A5\u3001\u5E26\u8BE5\u7247\u6BB5\u7684 URL\uFF0C\u6216\u7EAF\u5206\u4EAB\u7801",
  "share.badBase64": "\u5206\u4EAB\u7801\u683C\u5F0F\u9519\u8BEF\uFF08base64url \u89E3\u6790\u5931\u8D25\uFF0C\u53EF\u80FD\u88AB\u622A\u65AD\uFF09",
  "share.badJson": "\u5206\u4EAB\u7801\u5185\u5BB9\u4E0D\u662F\u5408\u6CD5 JSON\uFF08\u53EF\u80FD\u88AB\u622A\u65AD\u6216\u6539\u52A8\u8FC7\uFF09",
  "share.badVersion": "\u5206\u4EAB\u7801\u7248\u672C\u4E0D\u652F\u6301\uFF08\u4EC5\u652F\u6301 v{version}\uFF09",
  "share.badPayload": "\u5206\u4EAB\u9884\u8BBE\u6821\u9A8C\u5931\u8D25\uFF1A{errors}",
  "studio.savedAs": "\u5DF2\u4FDD\u5B58\u300C{name}\u300D",
  "studio.savedBuiltinAs": "\u5185\u7F6E\u9884\u8BBE\u5DF2\u53E6\u5B58\u4E3A\u300C{name}\u300D",
  "studio.discarded": "\u5DF2\u653E\u5F03\u672A\u4FDD\u5B58\u7684\u6539\u52A8",
  "studio.noSession": "\u6CA1\u6709\u6B63\u5728\u7F16\u8F91\u7684\u9884\u8BBE",
  "studio.presetMissing": "\u9884\u8BBE\u300C{id}\u300D\u4E0D\u5B58\u5728",
  "studio.createdFromDefault": "\u5DF2\u4ECE\u9ED8\u8BA4\u5916\u89C2\u521B\u5EFA\uFF08\u5F53\u524D\u65E0\u6D3B\u52A8\u9884\u8BBE\uFF0C\u5C06\u4F7F\u7528\u7CFB\u7EDF\u9ED8\u8BA4\u6837\u5F0F\uFF09",
  "studio.unsavedConfirm": "\u5F53\u524D\u6709\u672A\u4FDD\u5B58\u7684\u6539\u52A8\uFF0C\u653E\u5F03\u5E76\u7EE7\u7EED\uFF1F",
  "studio.continueDiscard": "\u653E\u5F03\u5E76\u7EE7\u7EED",
  "studio.draftBlocksApply": "\u5F53\u524D\u6709\u672A\u4FDD\u5B58\u7684\u7F16\u8F91\u8349\u7A3F\uFF08\u4F1A\u906E\u853D\u5916\u89C2\u9884\u89C8\uFF09\u3002\u653E\u5F03\u8349\u7A3F\u5E76\u5E94\u7528\u6240\u9009\u9884\u8BBE\uFF1F",
  "studio.discardAndApply": "\u653E\u5F03\u5E76\u5E94\u7528",
  "studio.themeSwitched": "\u5DF2\u5207\u6362\u5230\u4E3B\u9898\u300C{id}\u300D",
  "studio.themeRegistered": "\u4E3B\u9898\u300C{id}\u300D\u5DF2\u6CE8\u518C",
  "studio.switchTheme": "\u5207\u6362\u5230\u6B64\u4E3B\u9898",
  "studio.copyOk": "\u5DF2\u590D\u5236\u4E3A\u300C{name}\u300D",
  "studio.copyFail": "\u590D\u5236\u5931\u8D25",
  "studio.deleted": "\u5DF2\u5220\u9664 {id}",
  "studio.deletedReverted": "\u5DF2\u5220\u9664 {id}\uFF08\u5916\u89C2\u5DF2\u8FD8\u539F\u9ED8\u8BA4\uFF09",
  "studio.deleteFail": "\u5220\u9664\u5931\u8D25",
  "studio.deleteConfirm": "\u5220\u9664\u9884\u8BBE\u300C{id}\u300D\uFF1F\u6B64\u64CD\u4F5C\u4E0D\u53EF\u6062\u590D\u3002",
  "studio.deleteAction": "\u5220\u9664",
  "studio.backupOk": "\u5DF2\u8FD8\u539F\u5907\u4EFD\u300C{name}\u300D\uFF08\u8FD8\u539F\u524D\u7248\u672C\u5DF2\u5B58\u5165\u5907\u4EFD\uFF0C\u672A\u81EA\u52A8\u5E94\u7528\uFF09",
  "studio.backupFail": "\u8FD8\u539F\u5907\u4EFD\u5931\u8D25",
  "studio.backupConfirm": "\u7528\u5907\u4EFD\u8FD8\u539F\u9884\u8BBE\u300C{name}\u300D\uFF1F\u5F53\u524D\u7248\u672C\u5C06\u5B58\u5165\u5907\u4EFD\uFF08\u5907\u4EFD\u4EC5\u4FDD\u7559\u4E00\u5C42\uFF0C\u53EF\u518D\u8FD8\u539F\u56DE\u53BB\uFF09\uFF0C\u8FD8\u539F\u4E0D\u81EA\u52A8\u5E94\u7528\u3002",
  "studio.backupAction": "\u8FD8\u539F",
  "studio.imported": "\u5DF2\u5BFC\u5165 {id}",
  "studio.importFail": "\u5BFC\u5165\u5931\u8D25",
  "studio.exported": "\u5DF2\u5BFC\u51FA ZIP \u4E09\u4EF6\u5957\uFF08\u542B\u5C01\u9762\uFF09",
  "studio.exportMissing": "\u6D3B\u52A8\u9884\u8BBE\u4E0D\u5B58\u5728\uFF0C\u65E0\u6CD5\u5BFC\u51FA",
  "studio.exportEmpty": "\u6CA1\u6709\u53EF\u5BFC\u51FA\u7684\u9884\u8BBE",
  "studio.applyFail": "\u5E94\u7528\u300C{id}\u300D\u5931\u8D25\uFF1A{error}",
  "studio.saveFail": "\u4FDD\u5B58\u5931\u8D25",
  "studio.broken": "\u9884\u8BBE\u4E0D\u5B58\u5728\u6216\u5DF2\u635F\u574F",
  "studio.builtinTag": " \xB7 \u5185\u7F6E",
  "studio.newPresetName": "\u65B0\u9884\u8BBE",
  "studio.fromDefaultName": "\u4ECE\u9ED8\u8BA4\u5916\u89C2\u65B0\u5EFA",
  "studio.fromCurrentName": "\u4ECE\u5F53\u524D\u5916\u89C2\u65B0\u5EFA",
  "wg.uploadFailMime": "\u53EA\u652F\u6301\u56FE\u7247\u7D20\u6750\uFF08image/*\uFF09",
  "wg.uploadFailSize": "\u7D20\u6750\u8D85\u8FC7\u4E0A\u9650\uFF08\u226420MB\uFF09",
  "wg.uploadFailCount": "\u7D20\u6750\u6570\u91CF\u5DF2\u8FBE\u4E0A\u9650 {max} \u4E2A",
  "wg.uploadDedup": "\u8BE5\u56FE\u7247\u7D20\u6750\u5DF2\u5B58\u5728\uFF0C\u5DF2\u81EA\u52A8\u590D\u7528\u73B0\u6709\u7D20\u6750\uFF08\u672A\u65B0\u589E\u91CD\u590D\u6587\u4EF6\uFF09",
  "wg.uploadFailed": "\u4E0A\u4F20\u5931\u8D25",
  "wg.none": "\u672A\u9009\u62E9",
  "wg.urlInvalid": "\u4EC5\u652F\u6301 http/https\uFF0C\u4E14\u4E0D\u80FD\u542B\u5F15\u53F7/\u62EC\u53F7/\u7A7A\u683C",
  "wg.darkLook": "\u6DF1\u8272\u98CE\u683C",
  "wg.asset": "\u7D20\u6750",
  "wg.darkLink": "\u6DF1\u8272\u94FE\u63A5",
  "wg.darkLinkPlaceholder": "\u7559\u7A7A = \u6CBF\u7528\u6D45\u8272\u94FE\u63A5",
  "wg.darkGradient": "\u6DF1\u8272\u6E10\u53D8",
  "wg.opacity": "\u4E0D\u900F\u660E\u5EA6",
  "wg.darkClearConfirm": "\u5173\u95ED\u540E\u5C06\u6E05\u9664\u5DF2\u8BBE\u7F6E\u7684\u6DF1\u8272\u58C1\u7EB8\u914D\u7F6E\uFF0C\u786E\u5B9A\uFF1F",
  "wg.assetsTitle": "\u7D20\u6750\u4E0E\u90E8\u4EF6",
  "wg.addAsset": "\u6DFB\u52A0\u7D20\u6750",
  "wg.collageTitle": "\u591A\u5F20\u5C0F\u5757\u56FE\u7247\u53E0\u52A0\u5408\u6210\u4E00\u5F20\u58C1\u7EB8",
  "wg.collage": "\u56FE\u5C42\u5408\u6210\u58C1\u7EB8",
  "wg.assetCount": "{count}/{max} \u4E2A\u7D20\u6750",
  "wg.splitSchemesAria": "\u6309\u660E\u6697\u5206\u522B\u914D\u7F6E\u58C1\u7EB8",
  "wg.splitSchemes": "\u6309\u660E\u6697\u5206\u522B\u914D\u7F6E\u58C1\u7EB8\uFF08\u6D45\u8272/\u6DF1\u8272\uFF09",
  "wg.lightLook": "\u6D45\u8272\u98CE\u683C",
  "wg.quickAria": "\u7528 {name} \u4F5C\u804A\u5929\u80CC\u666F",
  "wg.quickTitleCurrent": "\u5F53\u524D\u804A\u5929\u80CC\u666F",
  "wg.quickTitle": "\u4E00\u952E\u8BBE\u4E3A\u804A\u5929\u80CC\u666F",
  "wg.quickDone": "\u2713 \u804A\u5929\u80CC\u666F",
  "wg.quickDo": "\u8BBE\u4E3A\u804A\u5929\u80CC\u666F",
  "wg.deleteAria": "\u5220\u9664\u7D20\u6750 {name}",
  "wg.notActiveHint": "\u7D20\u6750\u5DF2\u4E0A\u4F20\u4F46\u5C1A\u672A\u751F\u6548\u2014\u2014\u70B9\u51FB\u7D20\u6750\u4E0A\u7684\u300C\u8BBE\u4E3A\u804A\u5929\u80CC\u666F\u300D\u4E00\u952E\u542F\u7528\uFF0C\u6216\u5728\u4E0B\u65B9\u9762\u677F\u52FE\u9009\u90E8\u4EF6\u5E76\u9009\u62E9\u7D20\u6750\u3002",
  "wg.enableAria": "\u542F\u7528\u90E8\u4EF6 {name}",
  "wg.footer": "\u90E8\u4EF6 CSS \u7531\u5F15\u64CE\u751F\u6210\uFF08\u5B89\u5168\u8FB9\u754C\uFF09\uFF1B\u7D20\u6750\u5B58\u4E8E\u58C1\u7EB8\u5E93\uFF08.ui-presets/assets\uFF0C\u226420MB/\u4E2A\uFF09\uFF0C\u9884\u8BBE\u4EC5\u5B58\u5F15\u7528\u2014\u2014zip \u5BFC\u51FA\u81EA\u52A8\u5185\u5D4C\u7D20\u6750\u3002\u9009\u7D20\u6750\u7ED9\u90E8\u4EF6\u65F6\u6309\u56FA\u5B9A\u6BD4\u4F8B\u88C1\u526A\uFF08\u672A\u8986\u76D6\u533A\u57DF\u900F\u660E\u586B\u5145\uFF09\u3002",
  "wg.clear": "\u6E05\u9664",
  "wg.deleteAriaShort": "\u5220\u9664\u7D20\u6750",
  "wg.deleteUsedIn": "\u7D20\u6750\u6B63\u88AB {count} \u4E2A\u5176\u4ED6\u9884\u8BBE\u4F7F\u7528\uFF08{names}\uFF09\u3002\u5220\u9664\u65B9\u5F0F\uFF1F",
  "wg.cancel": "\u53D6\u6D88",
  "wg.removeFromPreset": "\u4EC5\u4ECE\u672C\u9884\u8BBE\u79FB\u9664",
  "wg.deletePermanently": "\u5F7B\u5E95\u5220\u9664",
  "crop.loadFailed": "\u56FE\u7247\u52A0\u8F7D\u5931\u8D25\uFF08\u7D20\u6750\u53EF\u80FD\u5DF2\u88AB\u5220\u9664\uFF09",
  "crop.title": "\u56FE\u7247\u88C1\u526A\uFF1A{name}",
  "crop.aria": "\u56FE\u7247\u88C1\u526A\uFF1A{name}\uFF08{ratio}\uFF09",
  "crop.ratioHint": "\u56FA\u5B9A\u6BD4\u4F8B {ratio}\uFF08{w}\xD7{h}\uFF09\xB7 \u9ED1\u6846\u5185\u5373\u5B9E\u9645\u5E94\u7528\u8303\u56F4\uFF1B\u672A\u8986\u76D6\u533A\u57DF\u900F\u660E",
  "crop.loading": "\u52A0\u8F7D\u56FE\u7247\u4E2D\u2026",
  "crop.zoomOut": "\u7F29\u5C0F",
  "crop.zoom": "\u7F29\u653E",
  "crop.zoomIn": "\u653E\u5927",
  "crop.cancel": "\u53D6\u6D88",
  "crop.confirm": "\u786E\u8BA4\u88C1\u526A",
  "lc.chat": "16:9\uFF08\u804A\u5929\u80CC\u666F\uFF09",
  "lc.settings": "1:1\uFF08\u8BBE\u7F6E\u5361\uFF09",
  "lc.sidebar": "1:5\uFF08\u4FA7\u680F\u6D77\u62A5\uFF09",
  "lc.title": "\u56FE\u5C42\u5408\u6210\u58C1\u7EB8",
  "lc.ratioAria": "\u5408\u6210\u6BD4\u4F8B",
  "lc.canvas": "\u753B\u5E03 {w}\xD7{h} \xB7 \u56FE\u5C42 {count}",
  "lc.canvasAria": "\u56FE\u5C42\u5408\u6210\u753B\u5E03",
  "lc.undo": "\u64A4\u9500",
  "lc.close": "\u5173\u95ED",
  "lc.assetsHint": "\u7D20\u6750\uFF08\u70B9\u51FB\u52A0\u5165\u753B\u5E03\uFF09",
  "lc.noAssets": "\u5E93\u4E2D\u6682\u65E0\u7D20\u6750\u2014\u2014\u5148\u5728\u7D20\u6750\u4E0E\u90E8\u4EF6\u533A\u4E0A\u4F20\u5C0F\u5757\u56FE\u7247",
  "lc.rotate": "\u65CB\u8F6C {deg}\xB0",
  "lc.rotateAria": "\u56FE\u5C42\u65CB\u8F6C",
  "lc.opacity": "\u4E0D\u900F\u660E\u5EA6 {pct}%",
  "lc.opacityAria": "\u56FE\u5C42\u4E0D\u900F\u660E\u5EA6",
  "lc.up": "\u4E0A\u79FB",
  "lc.down": "\u4E0B\u79FB",
  "lc.top": "\u7F6E\u9876",
  "lc.bottom": "\u7F6E\u5E95",
  "lc.mirrorH": "\u6C34\u5E73\u955C\u50CF",
  "lc.mirrorV": "\u5782\u76F4\u955C\u50CF",
  "lc.delete": "\u5220\u9664",
  "lc.upAria": "\u56FE\u5C42\u4E0A\u79FB",
  "lc.downAria": "\u56FE\u5C42\u4E0B\u79FB",
  "lc.topAria": "\u56FE\u5C42\u7F6E\u9876",
  "lc.bottomAria": "\u56FE\u5C42\u7F6E\u5E95",
  "lc.mirrorHAria": "\u6C34\u5E73\u955C\u50CF",
  "lc.mirrorVAria": "\u5782\u76F4\u955C\u50CF",
  "lc.deleteAria": "\u5220\u9664\u56FE\u5C42",
  "lc.needLayer": "\u8BF7\u5148\u6DFB\u52A0\u81F3\u5C11\u4E00\u4E2A\u56FE\u5C42",
  "lc.uploadFailed": "\u5408\u6210\u4E0A\u4F20\u5931\u8D25",
  "lc.composing": "\u5408\u6210\u4E2D\uFF08\u52A8\u753B {frames} \u5E27\uFF09\u2026",
  "lc.generated": "\u5DF2\u751F\u6210\u5408\u6210\u58C1\u7EB8\u300C{name}\u300D",
  "lc.generatedLayered": "\u5DF2\u751F\u6210\u5206\u5C42\u5408\u6210\u58C1\u7EB8\u300C{name}\u300D\uFF08\u9759\u6001\u5E95 + \u539F\u751F\u52A8\u56FE\uFF09",
  "lc.downscaled": " \xB7 \u5DF2\u81EA\u52A8\u964D\u91C7\u6837\u81F3 {w}\xD7{h} \u63A7\u5236\u4F53\u79EF",
  "lc.failed": "\u5408\u6210\u5931\u8D25\uFF1A{error}",
  "lc.defaultName": "\u5408\u6210\u58C1\u7EB8",
  "lc.transparentHint": "\u900F\u660E\u5E95\u2014\u2014\u6E32\u67D3\u65F6\u6309\u90E8\u4EF6\u4E0D\u900F\u660E\u5EA6\u5411\u5E95\u8272\u6DE1\u51FA",
  "lc.bake": "\u70D8\u7119\u4E3A\u5355\u6587\u4EF6\u52A8\u753B",
  "lc.bakeTitle": "\u628A\u5168\u90E8\u56FE\u5C42\uFF08\u542B\u7167\u7247\uFF09\u70E4\u8FDB GIF \u6BCF\u5E27\u2014\u2014\u4F53\u79EF\u5927\uFF0C\u4EC5\u591A\u52A8\u56FE\u540C\u6B65/\u65CB\u8F6C/\u5355\u6587\u4EF6\u5BFC\u51FA\u9700\u8981",
  "lc.compose": "\u5408\u6210\u5E76\u4E0A\u4F20",
  "lc.composingShort": "\u5408\u6210\u4E2D\u2026",
  "lc.generatedAnim": "\u5DF2\u751F\u6210\u5408\u6210\u58C1\u7EB8\u300C{name}\u300D\uFF08\u52A8\u753B {frames} \u5E27 \xB7 {size}MB{extra}\uFF09",
  "lc.gifReadFailed": "GIF \u7D20\u6750\u8BFB\u53D6\u5931\u8D25",
  "lc.tooManyFrames": "\u52A8\u56FE\u5E27\u6570\u8FC7\u591A\uFF08>150\uFF09\u2014\u2014\u8BF7\u4F7F\u7528\u5E27\u7387\u8F83\u4F4E\u6216\u65F6\u957F\u8F83\u77ED\u7684\u52A8\u56FE",
  "lc.emptyTimeline": "\u65F6\u95F4\u8F74\u4E3A\u7A7A",
  "lc.encodeFailed": "\u7F16\u7801\u5931\u8D25",
  "lc.baseEncodeFailed": "\u5E95\u56FE\u7F16\u7801\u5931\u8D25",
  "studio.back": "\u2039 \u8FD4\u56DE",
  "studio.title": "\u5916\u89C2\u9884\u8BBE\u5DE5\u4F5C\u5BA4",
  "studio.active": "\u6D3B\u52A8\uFF1A{name}",
  "studio.noActive": "\u65E0\u6D3B\u52A8\u9884\u8BBE",
  "studio.exportZip": "\u5BFC\u51FA ZIP",
  "studio.discard": "\u653E\u5F03",
  "studio.save": "\u4FDD\u5B58",
  "studio.new": "\u65B0\u5EFA",
  "studio.capture": "\u4ECE\u5F53\u524D\u5916\u89C2\u65B0\u5EFA",
  "studio.import": "\u5BFC\u5165",
  "studio.apply": "\u5E94\u7528",
  "studio.edit": "\u7F16\u8F91",
  "studio.duplicate": "\u590D\u5236",
  "studio.delete": "\u5220\u9664",
  "studio.restoreBackup": "\u8FD8\u539F\u5907\u4EFD",
  "studio.empty": "\u9884\u8BBE\u5E93\u4E3A\u7A7A\u2014\u2014\u65B0\u5EFA\u6216\u5BFC\u5165\u4E00\u4E2A\u9884\u8BBE\u5F00\u59CB\u3002",
  "studio.pickOne": "\u4ECE\u5DE6\u4FA7\u9009\u62E9\u4E00\u4E2A\u9884\u8BBE\u300C\u7F16\u8F91\u300D\uFF0C\u6216\u300C\u65B0\u5EFA\u300D\u5F00\u59CB\u521B\u4F5C\u3002",
  "studio.draft": "\u25CF \u9884\u89C8\u4E2D\uFF08\u672A\u4FDD\u5B58\uFF09",
  "studio.saved": "\u5DF2\u4FDD\u5B58"
};
var EN = {
  "section.title": "Appearance presets",
  "common.cancel": "Cancel",
  "common.confirm": "OK",
  "confirm.aria": "Confirm",
  "lang.switch": "\u4E2D\u6587",
  "lang.switchLabel": "\u5207\u6362\u5230\u4E2D\u6587",
  "wall.openStudio": "Open skin studio \u2192",
  "wall.reset": "Reset to default",
  "wall.surprise": "Surprise me",
  "wall.favOnly": "Favorites only",
  "wall.favOnlyCount": "Favorites only ({count})",
  "wall.importShare": "Import share code",
  "wall.loading": "Loading presets\u2026",
  "wall.builtin": "Built-in",
  "wall.mine": "My preset",
  "wall.apply": "Apply",
  "wall.applied": "Applied",
  "wall.current": "\u2713 Active",
  "wall.share": "Share",
  "wall.favorite": "Favorite",
  "wall.unfavorite": "Unfavorite",
  "wall.favEmpty": "No favorites yet \u2014 tap \u2606 on any card.",
  "wall.emptyTitle": "No presets of your own yet",
  "wall.emptyBody": "Create one in the studio, or import a preset file (ZIP):",
  "wall.importFile": "Import preset file",
  "wall.importing": "Importing\u2026",
  "wall.imported": "Imported \u201C{name}\u201D",
  "wall.importedAssets": " \u2014 {count} asset(s) need re-uploading (references and crops kept)",
  "wall.noOther": "No other preset to switch to \u2014 create or import one first",
  "wall.cannotRead": "Cannot read preset \u201C{id}\u201D, no share code generated",
  "wall.auditPrefix": "\u26A0 {warnings}",
  "wall.importFailed": "Import failed",
  "share.received": "Received shared preset \u201C{name}\u201D",
  "share.assetsOmitted": " ({count} asset(s) not included in the link)",
  "share.importToLibrary": "Import to library",
  "share.ignore": "Ignore",
  "share.invalid": "Invalid share link: {error}",
  "share.gotIt": "Got it",
  "share.exportTitle": "Share \u201C{name}\u201D",
  "share.exportBody": "A share code carries: tokens (light & dark), CSS patches, widget & crop params, cover, and native theme registration.",
  "share.exportOmitted": " Image data for {count} asset(s) is not included (references and crops are kept; use ZIP for full delivery).",
  "share.linkLabel": "Link (opens and imports on this machine)",
  "share.codeLabel": "Share code (cross-machine: paste it under \u201CAppearance presets \u2192 Import share code\u201D)",
  "share.copyLink": "Copy link",
  "share.copyCode": "Copy code",
  "share.copiedLink": "Link copied \u2713",
  "share.copiedCode": "Code copied \u2713",
  "share.codeChars": "Share code: {count} chars",
  "share.copyFail": "Copy failed: select and copy manually (the field is already selected)",
  "share.close": "Close",
  "share.importTitle": "Import share code",
  "share.importBody": "Paste the link or code you received. Importing only adds it to your library (it is not applied automatically); invalid payloads are rejected with a reason.",
  "share.importPlaceholder": "#ui-presets-share=\u2026 or the raw code",
  "share.cancel": "Cancel",
  "share.importAction": "Import",
  "knob.title": "Quick colors",
  "knob.summary": " \xB7 {knobs} knobs / {categories} groups",
  "knob.dual": "Edit light/dark separately",
  "knob.divergedCount": "{count} knob(s) have per-token overrides",
  "knob.intro": "A knob writes a group of tokens at once \u2014 they stay plain tokens you can fine-tune under \u201CAdvanced tokens\u201D.",
  "knob.caution": "\u26A0 wide impact",
  "knob.diverged": "per-token override",
  "knob.colorAria": "color",
  "knob.valueAria": "value",
  "knob.sliderAria": "slider",
  "knob.numberAria": "number",
  "knob.selectAria": "option",
  "knob.varPlaceholder": "var() reference \u2192 advanced",
  "css.title": "CSS patches",
  "css.count": " \xB7 {count} rule(s)",
  "css.invalid": " ({count} to fix)",
  "css.hint": "Selectors must start with a [data-*] anchor (e.g. [data-up-card]); write plain declarations without braces. Save and import enforce the same whitelist.",
  "css.delete": "Delete",
  "css.add": "+ Add rule",
  "css.errEmpty": "Selector cannot be empty",
  "css.errSelector": "Selector must start with [data-* and contain no { } ;",
  "css.errBraces": "No braces allowed in declarations",
  "css.errLength": "Declarations exceed {max} chars",
  "theme.title": "Register as native theme",
  "theme.on": " \xB7 on ({scheme})",
  "theme.off": " \xB7 off",
  "theme.enable": "Register as a DSH theme on save",
  "theme.needTokens": "Change at least one token first \u2014 an empty theme is the default look.",
  "theme.scheme": "Base scheme",
  "theme.schemeDark": "dark",
  "theme.schemeLight": "light",
  "theme.hint": "Theme id: {id}; tokens are this preset flattened to the chosen scheme. Once registered it shows up under Settings \u2192 Appearance and the studio footer offers \u201CSwitch to this theme\u201D.",
  "rot.title": "Rotation (this device)",
  "rot.on": "On \xB7 {count} links \xB7 every {minutes} min",
  "rot.off": "Off",
  "rot.hint": "One http/https image URL per line (2\u2013{max}). Stored on this device only \u2014 never in the preset or share code. Pauses while the window is hidden and catches up when you return.",
  "rot.linksAria": "rotation links",
  "rot.interval": "Interval",
  "rot.intervalAria": "rotation interval",
  "rot.saveNew": "Save & enable",
  "rot.saveEdit": "Save changes",
  "rot.now": "Next now",
  "rot.disable": "Disable",
  "rot.rejected": "Ignored {count} invalid line(s)",
  "rot.needTwo": "Need at least 2 valid http/https links (currently {count}{extra})",
  "rot.rejectedExtra": ", {count} dropped",
  "rot.invalid": "Invalid config, not saved",
  "rot.enabled": "Enabled: {count} links, every {minutes} min; applies on the next tick (\u2264{seconds}s)",
  "rot.disabled": "Disabled (the preset keeps its current image)",
  "rot.notActive": "This preset is not active \u2014 apply it first so rotation can affect the UI",
  "rot.rotated": "Switched to the next image",
  "rot.fail": "Failed: no active preset or config",
  "rot.minutes": "{count} min",
  "rot.hours": "{count} h",
  "rot.days": "{count} d",
  "token.undo": "Undo",
  "token.cover": "Cover",
  "token.coverAuto": "Auto (recommended)",
  "token.coverHint": "Crop an asset to 3:1 \xB7 matches the settings card",
  "token.coverAria": "cover asset",
  "token.coverPreviewAlt": "cover preview",
  "token.groups": "Group tinting",
  "token.groupScheme": "Edit light/dark separately (off = write both)",
  "token.groupColor": "Group color",
  "token.light": "Light",
  "token.dark": "Dark",
  "token.both": "(both schemes)",
  "token.dissolve": "Dissolve",
  "token.members": "Members: ",
  "token.groupTokens": " \xB7 {count} tokens",
  "token.advanced": "Advanced tokens",
  "token.advancedCount": " \xB7 {count} (group tinting & notes)",
  "token.search": "Search tokens\u2026",
  "token.groupMode": "Group mode",
  "token.groupModeOn": "\u2713 Group mode (pick tokens)",
  "token.groupNamePlaceholder": "Group name (e.g. actions)",
  "token.createGroup": "Create group ({count})",
  "token.expandExpert": "Show all advanced tokens (risky ones hidden)",
  "token.colToken": "Token",
  "token.colLight": "Light",
  "token.colDark": "Dark",
  "token.saveNote": "Save",
  "token.notePlaceholder": "Add a note for your own reference\u2026",
  "token.selfNote": "(yours)",
  "token.nameAria": "preset name",
  "token.groupNameAria": "group name",
  "ctrl.activePersistFailed": "Preset applied, but persisting the active id failed (an older preset may return after restart)",
  "ctrl.broken": "Preset \u201C{id}\u201D is broken: {error}",
  "ctrl.validationFailed": "validation failed",
  "ctrl.notSynced": "Saved to disk, but the active preset was not synced (restart may recover)",
  "ctrl.exportHttp": "ZIP export failed (HTTP {status})",
  "ctrl.exportNet": "ZIP export failed (network error)",
  "ctrl.missing": "Preset \u201C{id}\u201D does not exist or cannot be loaded",
  "ctrl.uploadNet": "Asset upload failed (network error)",
  "ctrl.themeSwitch": "Theme switch failed: {error}",
  "share.badPreset": "Preset validation failed: {errors}",
  "share.tooLarge": "Preset too large (share code {chars} chars, limit {max}) \u2014 use ZIP export for assets",
  "share.longCode": "Long share code ({chars} chars): chat apps may wrap it \u2014 prefer ZIP or share tokens only",
  "share.notCode": "Not a share code: expected a ui-presets-share=\u2026 link, a URL containing it, or the raw code",
  "share.badBase64": "Malformed share code (base64url decode failed \u2014 it may have been truncated)",
  "share.badJson": "Share code payload is not valid JSON (truncated or edited)",
  "share.badVersion": "Unsupported share code version (only v{version})",
  "share.badPayload": "Shared preset validation failed: {errors}",
  "studio.savedAs": "Saved \u201C{name}\u201D",
  "studio.savedBuiltinAs": "Built-in saved as \u201C{name}\u201D",
  "studio.discarded": "Unsaved changes discarded",
  "studio.noSession": "No preset is being edited",
  "studio.presetMissing": "Preset \u201C{id}\u201D does not exist",
  "studio.createdFromDefault": "Created from the default look (no active preset, system styling will apply)",
  "studio.unsavedConfirm": "You have unsaved changes. Discard and continue?",
  "studio.continueDiscard": "Discard and continue",
  "studio.draftBlocksApply": "You have an unsaved draft (it overrides the applied look). Discard it and apply the selected preset?",
  "studio.discardAndApply": "Discard and apply",
  "studio.themeSwitched": "Switched to theme \u201C{id}\u201D",
  "studio.themeRegistered": "Theme \u201C{id}\u201D registered",
  "studio.switchTheme": "Switch to this theme",
  "studio.copyOk": "Duplicated as \u201C{name}\u201D",
  "studio.copyFail": "Duplicate failed",
  "studio.deleted": "Deleted {id}",
  "studio.deletedReverted": "Deleted {id} (appearance reset to default)",
  "studio.deleteFail": "Delete failed",
  "studio.deleteConfirm": "Delete preset \u201C{id}\u201D? This cannot be undone.",
  "studio.deleteAction": "Delete",
  "studio.backupOk": "Restored backup \u201C{name}\u201D (the previous version was saved to backups; not applied automatically)",
  "studio.backupFail": "Restore failed",
  "studio.backupConfirm": "Restore preset \u201C{name}\u201D from backup? The current version is saved to backups (one slot, swappable) and the restore is not applied automatically.",
  "studio.backupAction": "Restore",
  "studio.imported": "Imported {id}",
  "studio.importFail": "Import failed",
  "studio.exported": "Exported ZIP (preset + cover + manifest)",
  "studio.exportMissing": "No active preset to export",
  "studio.exportEmpty": "Nothing to export",
  "studio.applyFail": "Failed to apply \u201C{id}\u201D: {error}",
  "studio.saveFail": "Save failed",
  "studio.broken": "preset missing or broken",
  "studio.builtinTag": " \xB7 Built-in",
  "studio.newPresetName": "New preset",
  "studio.fromDefaultName": "New from default look",
  "studio.fromCurrentName": "New from current look",
  "wg.uploadFailMime": "Only image assets are supported (image/*)",
  "wg.uploadFailSize": "Asset exceeds the limit (\u226420MB)",
  "wg.uploadFailCount": "Asset limit reached ({max})",
  "wg.uploadDedup": "This image already exists \u2014 reusing the existing asset (no duplicate file).",
  "wg.uploadFailed": "Upload failed",
  "wg.none": "None",
  "wg.urlInvalid": "Only http/https, no quotes/brackets/spaces",
  "wg.darkLook": "Dark look",
  "wg.asset": "Asset",
  "wg.darkLink": "Dark link",
  "wg.darkLinkPlaceholder": "Empty = reuse the light link",
  "wg.darkGradient": "Dark gradient",
  "wg.opacity": "Opacity",
  "wg.darkClearConfirm": "Turning this off clears the dark wallpaper settings. Continue?",
  "wg.assetsTitle": "Assets & widgets",
  "wg.addAsset": "Add asset",
  "wg.collageTitle": "Collage several images into one wallpaper",
  "wg.collage": "Layer collage",
  "wg.assetCount": "{count}/{max} assets",
  "wg.splitSchemesAria": "Configure light and dark wallpapers separately",
  "wg.splitSchemes": "Separate light/dark wallpapers",
  "wg.lightLook": "Light look",
  "wg.quickAria": "Use {name} as chat background",
  "wg.quickTitleCurrent": "Current chat background",
  "wg.quickTitle": "Set as chat background",
  "wg.quickDone": "\u2713 Chat background",
  "wg.quickDo": "Set as chat background",
  "wg.deleteAria": "Delete asset {name}",
  "wg.notActiveHint": "Assets uploaded but not applied yet \u2014 use \u201CSet as chat background\u201D on a thumbnail, or enable a widget below and pick an asset.",
  "wg.enableAria": "Enable widget {name}",
  "wg.footer": "Widget CSS is generated by the engine (safety boundary); assets live in the wallpaper library (.ui-presets/assets, \u226420MB each) and presets only store references \u2014 ZIP export embeds them. Picking an asset crops it to the widget's fixed ratio (uncovered area stays transparent).",
  "wg.clear": "Clear",
  "wg.deleteAriaShort": "Delete asset",
  "wg.deleteUsedIn": "This asset is used by {count} other preset(s) ({names}). How should it be deleted?",
  "wg.cancel": "Cancel",
  "wg.removeFromPreset": "Remove from this preset",
  "wg.deletePermanently": "Delete permanently",
  "crop.loadFailed": "Image failed to load (the asset may have been deleted)",
  "crop.title": "Crop image: {name}",
  "crop.aria": "Crop image: {name} ({ratio})",
  "crop.ratioHint": "Fixed ratio {ratio} ({w}\xD7{h}) \u2014 the dark frame is what gets applied; uncovered area stays transparent",
  "crop.loading": "Loading image\u2026",
  "crop.zoomOut": "Zoom out",
  "crop.zoom": "Zoom",
  "crop.zoomIn": "Zoom in",
  "crop.cancel": "Cancel",
  "crop.confirm": "Crop",
  "lc.chat": "16:9 (chat)",
  "lc.settings": "1:1 (settings)",
  "lc.sidebar": "1:5 (sidebar)",
  "lc.title": "Layer collage",
  "lc.ratioAria": "canvas ratio",
  "lc.canvas": "Canvas {w}\xD7{h} \xB7 {count} layer(s)",
  "lc.canvasAria": "layer canvas",
  "lc.undo": "Undo",
  "lc.close": "Close",
  "lc.assetsHint": "Assets (click to add)",
  "lc.noAssets": "No assets yet \u2014 upload images in the Assets & widgets section first",
  "lc.rotate": "Rotate {deg}\xB0",
  "lc.rotateAria": "layer rotation",
  "lc.opacity": "Opacity {pct}%",
  "lc.opacityAria": "layer opacity",
  "lc.up": "Up",
  "lc.down": "Down",
  "lc.top": "Top",
  "lc.bottom": "Bottom",
  "lc.mirrorH": "Mirror H",
  "lc.mirrorV": "Mirror V",
  "lc.delete": "Delete",
  "lc.upAria": "move layer up",
  "lc.downAria": "move layer down",
  "lc.topAria": "move layer to top",
  "lc.bottomAria": "move layer to bottom",
  "lc.mirrorHAria": "mirror horizontally",
  "lc.mirrorVAria": "mirror vertically",
  "lc.deleteAria": "delete layer",
  "lc.needLayer": "Add at least one layer first",
  "lc.uploadFailed": "Collage upload failed",
  "lc.composing": "Composing ({frames} frames)\u2026",
  "lc.generated": "Collage created: \u201C{name}\u201D",
  "lc.generatedLayered": "Layered collage created: \u201C{name}\u201D (static base + native GIF)",
  "lc.downscaled": " \xB7 downscaled to {w}\xD7{h} to control size",
  "lc.failed": "Collage failed: {error}",
  "lc.defaultName": "Collage",
  "lc.transparentHint": "Transparent background \u2014 fades toward the widget base color at render time",
  "lc.bake": "Bake into one animation",
  "lc.bakeTitle": "Bake every layer (including photos) into each GIF frame \u2014 large files; only for multi-GIF sync, rotation, or single-file export",
  "lc.compose": "Compose & upload",
  "lc.composingShort": "Composing\u2026",
  "lc.generatedAnim": "Collage created: \u201C{name}\u201D ({frames} frames \xB7 {size}MB{extra})",
  "lc.gifReadFailed": "Failed to read the GIF asset",
  "lc.tooManyFrames": "Too many frames (>150) \u2014 use a GIF with lower frame rate or shorter duration",
  "lc.emptyTimeline": "Timeline is empty",
  "lc.encodeFailed": "Encoding failed",
  "lc.baseEncodeFailed": "Failed to encode the base image",
  "studio.back": "\u2039 Back",
  "studio.title": "Preset studio",
  "studio.active": "Active: {name}",
  "studio.noActive": "No active preset",
  "studio.exportZip": "Export ZIP",
  "studio.discard": "Discard",
  "studio.save": "Save",
  "studio.new": "New",
  "studio.capture": "New from current look",
  "studio.import": "Import",
  "studio.apply": "Apply",
  "studio.edit": "Edit",
  "studio.duplicate": "Duplicate",
  "studio.delete": "Delete",
  "studio.restoreBackup": "Restore backup",
  "studio.empty": "Library is empty \u2014 create or import a preset to start.",
  "studio.pickOne": "Pick a preset on the left to edit, or start with \u201CNew\u201D.",
  "studio.draft": "\u25CF Previewing (unsaved)",
  "studio.saved": "Saved"
};
var DICTS = { zh: ZH, en: EN };
function resolveLocale(stored, navigatorLanguage) {
  if (stored === "zh" || stored === "en") return stored;
  const lang = (navigatorLanguage ?? "").toLowerCase();
  if (lang.startsWith("zh")) return "zh";
  if (lang === "") return "zh";
  return "en";
}
var cached = null;
var listeners = /* @__PURE__ */ new Set();
function detectLocale() {
  let stored = null;
  try {
    stored = localStorage.getItem(LOCALE_KEY);
  } catch {
  }
  const nav = typeof navigator !== "undefined" ? navigator.language : null;
  return resolveLocale(stored, nav);
}
function getLocale() {
  if (cached === null) cached = detectLocale();
  return cached;
}
function setLocale(locale) {
  cached = locale;
  try {
    localStorage.setItem(LOCALE_KEY, locale);
  } catch {
  }
  for (const listener of listeners) listener();
}
function subscribeLocale(listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
function formatMessage(template, params) {
  if (params === void 0) return template;
  return template.replace(/\{(\w+)\}/g, (whole, key) => {
    const value = params[key];
    return value === void 0 ? whole : String(value);
  });
}
function t(key, params) {
  const locale = getLocale();
  const dict = DICTS[locale];
  const text = dict[key] ?? ZH[key] ?? key;
  return formatMessage(text, params);
}
var KNOB_EN = {
  "spatial-bg": { name: "Background", description: "The overall canvas \u2014 the single most visible surface" },
  "spatial-layer": { name: "Raised surfaces", description: "Cards, inputs and popovers (two-step ramp derived automatically)" },
  "spatial-sidebar": { name: "Sidebar", description: "Left navigation background" },
  "spatial-bubble": { name: "Chat bubbles", description: "Message bubble fill in the transcript" },
  "spatial-input": { name: "Composer", description: "Bottom input card fill" },
  "spatial-menu": { name: "Menus & overlays", description: "Menus, tooltips, selectors and masks (auto-layered)" },
  "border-level": { name: "Border strength", description: "Primary card/section border (fine variants stay in advanced tokens)" },
  "accent-brand": { name: "Brand color", description: "Brand, primary button and business state in one go" },
  "accent-hover": { name: "Hover color", description: "Primary button hover feedback" },
  "button-family": { name: "Button family", description: "Primary / info / business buttons plus hover (auto shaded)" },
  "text-primary": { name: "Primary text", description: "Body and headings" },
  "text-secondary": { name: "Secondary text", description: "Descriptions and hints" },
  "text-tertiary": { name: "Tertiary text", description: "Muted and placeholder text" },
  "font-family": { name: "Font family", description: "Global typeface" },
  "state-error": { name: "Error", description: "Errors and failure hints" },
  "state-warn": { name: "Warning", description: "Warnings and unsaved hints" },
  "state-success": { name: "Success", description: "Success messages" },
  "interactive-hover": { name: "Hover feedback", description: "Hover fill for interactive elements" },
  "radius-scale": { name: "Corner radius", description: "Global radius \u2014 buttons, menus and popovers move together" },
  "corner-shape": { name: "Corner shape", description: "Clean round versus squircle (superellipse)" },
  "mask-blur": { name: "Mask blur", description: "Backdrop blur on modal masks" },
  "motion-speed": { name: "Motion speed", description: "Global transition speed (hover / expand / popover)" },
  "shadow-level": { name: "Shadow level", description: "Card elevation shadows (all three levels scale)" },
  "settings-card": { name: "Settings card", description: "Settings panel card fill and stroke" },
  "markdown-surfaces": { name: "Code & quote surfaces", description: "Code block, inline code, quote and tag fills (auto-layered)" },
  "overlay-surfaces": { name: "Toast & tooltip", description: "Toast and tooltip fills" },
  "layout-width": { name: "Content width", description: "Max width of the transcript" }
};
var CATEGORY_EN = {
  spatial: { name: "Layout surfaces", description: "Region fills and overlays" },
  layers: { name: "Background layers", description: "Borders and dividers" },
  accent: { name: "Accent", description: "Brand and primary actions" },
  text: { name: "Typography", description: "Text colors and typeface" },
  feedback: { name: "Feedback", description: "States and hover" },
  layout: { name: "Layout", description: "Width, radius, motion and shadows" }
};
function knobLabel(id, field) {
  if (getLocale() !== "en") return null;
  const entry = KNOB_EN[id];
  return entry !== void 0 ? entry[field] : null;
}
function categoryLabel(id, field) {
  if (getLocale() !== "en") return null;
  const entry = CATEGORY_EN[id];
  return entry !== void 0 ? entry[field] : null;
}
var WIDGET_EN = {
  "chat-background": { name: "Chat background", description: "Wallpaper behind the transcript" },
  "settings-background": { name: "Settings background", description: "Wallpaper inside the settings dialog" },
  "sidebar-poster": { name: "Sidebar poster", description: "Poster background of the left sidebar" }
};
var WIDGET_PARAM_EN = {
  source: "Image",
  assetId: "Asset",
  imageUrl: "Link",
  gradient: "Gradient",
  opacity: "Opacity"
};
function widgetLabel(id, field) {
  if (getLocale() !== "en") return null;
  const entry = WIDGET_EN[id];
  return entry !== void 0 ? entry[field] : null;
}
function widgetParamLabel(key) {
  if (getLocale() !== "en") return null;
  return WIDGET_PARAM_EN[key] ?? null;
}

// src/client/rotation.ts
var ROTATION_KEY = "ui-presets-rotation";
var ROTATION_TICK_MS = 3e4;
var ROTATION_MIN_INTERVAL_MS = 5 * 6e4;
var ROTATION_MAX_INTERVAL_MS = 7 * 24 * 60 * 6e4;
var ROTATION_MAX_URLS = 20;
var ROTATION_INTERVALS = [
  { label: "5 \u5206\u949F", value: 5 * 6e4 },
  { label: "15 \u5206\u949F", value: 15 * 6e4 },
  { label: "30 \u5206\u949F", value: 30 * 6e4 },
  { label: "1 \u5C0F\u65F6", value: 60 * 6e4 },
  { label: "6 \u5C0F\u65F6", value: 6 * 60 * 6e4 },
  { label: "1 \u5929", value: 24 * 60 * 6e4 }
];
function rotationKey(presetId, widgetId) {
  return `${presetId}::${widgetId}`;
}
function parseRotationKey(key) {
  const at = key.indexOf("::");
  if (at <= 0) return null;
  return { presetId: key.slice(0, at), widgetId: key.slice(at + 2) };
}
function clampInterval(value) {
  if (!Number.isFinite(value)) return ROTATION_MIN_INTERVAL_MS;
  return Math.min(ROTATION_MAX_INTERVAL_MS, Math.max(ROTATION_MIN_INTERVAL_MS, Math.round(value)));
}
function normalizeRotation(raw) {
  if (typeof raw !== "object" || raw === null) return null;
  const source = raw;
  if (!Array.isArray(source.urls)) return null;
  const urls = [];
  for (const item of source.urls) {
    if (typeof item !== "string") continue;
    if (!isSafeImageUrl(item) || urls.includes(item)) continue;
    urls.push(item);
    if (urls.length >= ROTATION_MAX_URLS) break;
  }
  if (urls.length < 2) return null;
  const index = Number.isInteger(source.index) ? source.index : -1;
  const nextAt = typeof source.nextAt === "number" && Number.isFinite(source.nextAt) ? source.nextAt : 0;
  return {
    urls,
    intervalMs: clampInterval(typeof source.intervalMs === "number" ? source.intervalMs : ROTATION_MIN_INTERVAL_MS),
    // -1 = 尚未展示过任何一条（刚启用）→ 第一次 advance 落到 0
    index: Math.min(urls.length - 1, Math.max(-1, index)),
    nextAt
  };
}
function parseRotationStore(raw) {
  if (raw === null || raw === "") return {};
  let data;
  try {
    data = JSON.parse(raw);
  } catch {
    return {};
  }
  if (typeof data !== "object" || data === null || Array.isArray(data)) return {};
  const out = {};
  for (const [key, value] of Object.entries(data)) {
    const cfg = normalizeRotation(value);
    if (cfg !== null && parseRotationKey(key) !== null) out[key] = cfg;
  }
  return out;
}
function loadRotationStore() {
  try {
    return parseRotationStore(localStorage.getItem(ROTATION_KEY));
  } catch {
    return {};
  }
}
function saveRotationStore(store) {
  try {
    localStorage.setItem(ROTATION_KEY, JSON.stringify(store));
  } catch {
  }
}
function splitUrlLines(text) {
  const urls = [];
  let rejected = 0;
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (trimmed === "") continue;
    if (!isSafeImageUrl(trimmed) || trimmed.length > MAX_IMAGE_URL_LENGTH || urls.includes(trimmed)) {
      rejected += 1;
      continue;
    }
    if (urls.length >= ROTATION_MAX_URLS) {
      rejected += 1;
      continue;
    }
    urls.push(trimmed);
  }
  return { urls, rejected };
}
function isDue(cfg, now) {
  return cfg.nextAt <= now;
}
function advance(cfg, now) {
  const index = cfg.urls.length === 0 ? 0 : (cfg.index + 1) % cfg.urls.length;
  return { ...cfg, index, nextAt: now + cfg.intervalMs };
}
function currentUrl(cfg) {
  if (cfg.urls.length === 0) return null;
  return cfg.urls[Math.min(cfg.urls.length - 1, Math.max(0, cfg.index))] ?? null;
}
function createRotation(urls, intervalMs, now) {
  const cfg = normalizeRotation({ urls, intervalMs, index: -1, nextAt: now });
  return cfg;
}

// src/client/controller.ts
function createStyleAdapter() {
  return {
    injectCss(_source, cssText) {
      const styleEl = document.createElement("style");
      styleEl.setAttribute("data-plugin", "ui-presets");
      styleEl.setAttribute("data-up-patch", "");
      styleEl.textContent = cssText;
      document.head.append(styleEl);
      return () => {
        styleEl.remove();
      };
    }
  };
}
var PresetsController = class {
  constructor(ctx) {
    __publicField(this, "engine");
    __publicField(this, "stateListeners", /* @__PURE__ */ new Set());
    __publicField(this, "memoryActiveId", null);
    __publicField(this, "currentDshVersion");
    /** 用户主动操作标记：启动期 adoptPersisted 完成时若用户已操作则不覆盖（竞态修复）。 */
    __publicField(this, "userInteracted", false);
    /** AI bridge（M2-3）：active.json revision 轮询定时器（setTimeout 链式）；lastSeen 防自写回环。 */
    __publicField(this, "aiBridgeTimer", null);
    __publicField(this, "lastSeenRevision", -1);
    /** 原始主题服务引用（selectTheme/getThemeInfo 用）。 */
    __publicField(this, "rawTheme");
    /** M5-2 跨窗口同步：BroadcastChannel 即时广播（环境不支持 → null，降级为仅轮询桥）。 */
    __publicField(this, "syncChannel");
    /** 库变更监听器（预设墙跨窗口刷新）。 */
    __publicField(this, "libraryListeners", /* @__PURE__ */ new Set());
    /** #52b 动态裁剪渲染：已应用内联样式的目标元素 → 其浅/深标记信息（ResizeObserver 重算用）。 */
    __publicField(this, "cropStyleElements", /* @__PURE__ */ new Map());
    __publicField(this, "cropResizeObservers", /* @__PURE__ */ new Map());
    /** #55：body 明暗属性监听（应用切换浅色/深色主题 → 壁纸即时切换）。 */
    __publicField(this, "schemeObserver", null);
    /** #77（用户 bug）：目标元素出现/替换监听——会话切换重挂载滚动容器后裁剪壁纸
     * 内联样式丢失且无重同步（原只监听引擎状态变化与明暗切换）→ body childList 观察 +
     * rAF 去抖重同步，元素换新后自动恢复。 */
    __publicField(this, "cropDomObserver", null);
    __publicField(this, "cropResyncScheduled", false);
    /** #90 分层合成壁纸：素材 id → layers 规格（null = 已查非分层；undefined = 未查）。
     * controller 渲染裁剪标记时据此把单图样式升级为"静态底 + 原生动图"多背景。 */
    __publicField(this, "layersMeta", /* @__PURE__ */ new Map());
    __publicField(this, "layersMetaFetching", false);
    /** 壁纸轮换（本地偏好）：调度定时器 + 防重入 + 回前台补切。 */
    __publicField(this, "rotationTimer", null);
    __publicField(this, "rotationBusy", false);
    __publicField(this, "onVisibilityChange", () => {
      if (typeof document !== "undefined" && document.visibilityState === "visible") void this.tickRotation();
    });
    /** 轮询失败计数（指数退避用）。 */
    __publicField(this, "pollFailCount", 0);
    /** 轮询定时器句柄（setTimeout 链式——review P2-7 替代 setInterval 防重入）。 */
    __publicField(this, "scheduleAiBridge", () => {
    });
    const theme = ctx.get("theme");
    this.rawTheme = theme;
    this.currentDshVersion = CURRENT_DSH_VERSION;
    this.engine = new PresetEngine({
      theme: {
        overrideTokens: (source, tokens) => {
          if (theme === void 0) throw new Error("theme \u670D\u52A1\u4E0D\u53EF\u7528");
          return theme.overrideTokens(source, tokens);
        },
        ...theme?.register !== void 0 ? { register: (d) => theme.register(d) } : {}
      },
      style: createStyleAdapter(),
      currentDshVersion: this.currentDshVersion,
      onStateChange: () => {
        this.syncCropWidgets();
        for (const listener of this.stateListeners) listener();
      }
    });
    let channel = null;
    try {
      if (typeof BroadcastChannel !== "undefined") channel = new BroadcastChannel("ui-presets-sync");
    } catch {
      channel = null;
    }
    this.syncChannel = channel;
    channel?.addEventListener("message", (event) => {
      const data = event.data;
      if (data?.type !== "active" || typeof data.activePresetId !== "string" || !Number.isInteger(data.revision)) return;
      if (data.revision <= this.lastSeenRevision) return;
      this.lastSeenRevision = data.revision;
      void this.applyPresetById(data.activePresetId);
    });
    channel?.addEventListener("message", (event) => {
      const data = event.data;
      if (data?.type === "library") {
        for (const listener of this.libraryListeners) listener();
      }
    });
  }
  /** 广播活动预设变更（浏览器侧 apply/clear 后即时通知其他窗口）。 */
  broadcastActive(id) {
    this.syncChannel?.postMessage({ type: "active", activePresetId: id, revision: this.lastSeenRevision + 1 });
  }
  /** 广播库变更（新建/保存/删除/导入后通知刷新预设墙）。
   * #56：BroadcastChannel 不向**本窗口**回传（规范：仅送达其他同源上下文）——
   * 同窗口工作室保存后设置页墙不刷新（改名不反映）——补本地监听器直通。 */
  broadcastLibrary() {
    this.syncChannel?.postMessage({ type: "library" });
    for (const listener of this.libraryListeners) listener();
  }
  /** 引擎状态快照（UI 渲染数据源）。 */
  getState() {
    return this.engine.getState();
  }
  /** 订阅引擎状态变化（UI 重渲染驱动）。 */
  subscribeState(listener) {
    this.stateListeners.add(listener);
    return () => {
      this.stateListeners.delete(listener);
    };
  }
  /** 订阅库变更（M5-2：预设墙跨窗口刷新）。 */
  subscribeLibrary(listener) {
    this.libraryListeners.add(listener);
    return () => {
      this.libraryListeners.delete(listener);
    };
  }
  /** 关闭跨窗口广播通道（node 环境下 BroadcastChannel 实例会保持事件循环活跃——
   * 测试/卸载时调用；浏览器端随插件生命周期 dispose 即可）。 */
  closeSyncChannel() {
    try {
      this.syncChannel?.close();
    } catch {
    }
  }
  /** #96：卸载清理（观察器/通道断开——防旧实例残留驱动已 dispose 的引擎与新实例互踩）。 */
  dispose() {
    this.stopRotation();
    try {
      this.schemeObserver?.disconnect();
    } catch {
    }
    this.schemeObserver = null;
    try {
      this.cropDomObserver?.disconnect();
    } catch {
    }
    this.cropDomObserver = null;
    for (const observer of this.cropResizeObservers.values()) {
      try {
        observer.disconnect();
      } catch {
      }
    }
    this.cropResizeObservers.clear();
    this.cropStyleElements.clear();
    this.closeSyncChannel();
  }
  // ---- 壁纸轮换（本地偏好；不进预设、不随分享走） ----
  /** 启动轮换调度：30s tick；页面隐藏时不切，回前台立刻补一次。 */
  startRotation() {
    if (this.rotationTimer !== null) return;
    if (typeof window === "undefined") return;
    this.rotationTimer = window.setInterval(() => {
      void this.tickRotation();
    }, ROTATION_TICK_MS);
    if (typeof document !== "undefined") document.addEventListener("visibilitychange", this.onVisibilityChange);
    void this.tickRotation();
  }
  stopRotation() {
    if (this.rotationTimer !== null) {
      clearInterval(this.rotationTimer);
      this.rotationTimer = null;
    }
    if (typeof document !== "undefined") document.removeEventListener("visibilitychange", this.onVisibilityChange);
  }
  /** 手动换下一张（面板按钮）：配置存在且该预设处于活动态才生效。 */
  async rotateWidgetNow(widgetId) {
    if (this.rotationBusy) return false;
    const activeId = this.engine.getState().activePresetId;
    if (activeId === null) return false;
    const key = rotationKey(activeId, widgetId);
    if (loadRotationStore()[key] === void 0) return false;
    this.rotationBusy = true;
    try {
      return await this.applyRotation(activeId, [key], Date.now());
    } finally {
      this.rotationBusy = false;
    }
  }
  /** 到期轮换：多个部件同时到期合并成一次预设应用（一次重挂，不抖）。 */
  async tickRotation() {
    if (this.rotationBusy) return;
    if (this.engine.getState().hasDraft) return;
    if (typeof document !== "undefined" && document.visibilityState === "hidden") return;
    const activeId = this.engine.getState().activePresetId;
    if (activeId === null) return;
    const store = loadRotationStore();
    const now = Date.now();
    const dueKeys = Object.keys(store).filter((key) => {
      const parsed = parseRotationKey(key);
      if (parsed === null || parsed.presetId !== activeId) return false;
      const cfg = store[key];
      return cfg !== void 0 && isDue(cfg, now);
    });
    if (dueKeys.length === 0) return;
    this.rotationBusy = true;
    try {
      await this.applyRotation(activeId, dueKeys, now);
    } finally {
      this.rotationBusy = false;
    }
  }
  /** 推进指定部件的轮换并重挂活动预设；返回是否有改动。
   * 注意：只改内存中的预设（source=url + 当前链接），**不落盘**——预设文件始终是用户保存的样子。 */
  async applyRotation(presetId, dueKeys, now) {
    const preset2 = await this.loadPreset(presetId);
    if (preset2 === null) return false;
    const store = loadRotationStore();
    let changed = false;
    const widgets = (preset2.widgets ?? []).map((widget) => {
      const key = rotationKey(presetId, widget.id);
      if (!dueKeys.includes(key)) return widget;
      const cfg = store[key];
      if (cfg === void 0) return widget;
      const next = advance(cfg, now);
      const url = currentUrl(next);
      store[key] = next;
      if (url === null) return widget;
      changed = true;
      return { ...widget, params: { ...widget.params, source: "url", imageUrl: url } };
    });
    if (!changed) return false;
    if (!this.engine.applyPreset({ ...preset2, widgets })) return false;
    saveRotationStore(store);
    return true;
  }
  /** 读取持久化的活动预设（Node half 文件；含 revision——AI bridge 变更检测）。 */
  async fetchPersistedState() {
    try {
      const res = await fetch("/ui-presets/active", { headers: { accept: "application/json" } });
      if (!res.ok) return { activePresetId: this.memoryActiveId, revision: this.lastSeenRevision };
      const body = await res.json();
      return {
        activePresetId: typeof body.activePresetId === "string" ? body.activePresetId : null,
        revision: Number.isInteger(body.revision) && body.revision >= 0 ? body.revision : 0
      };
    } catch {
      return { activePresetId: this.memoryActiveId, revision: this.lastSeenRevision };
    }
  }
  async fetchPersistedId() {
    const state = await this.fetchPersistedState();
    if (state.revision > this.lastSeenRevision) this.lastSeenRevision = state.revision;
    return state.activePresetId;
  }
  /** AI bridge（M2-3/8）：轮询 active.json revision——Node half 的 preset_apply/revert 经此在浏览器即时生效。
   * 自写回环防护：轮询触发的应用会再 PUT（revision+1），但 id 与引擎一致 → 跳过；
   * M2-8 修复：id 为 null（preset_revert 还原默认）→ 清除活动外观。
   * review P2-7（全量评审）：页面隐藏时暂停轮询（document.visibilitychange），
   * 连续失败指数退避（1s→2s→4s→8s 上限，成功恢复 1s）——空闲不浪费、异常不刷屏。 */
  startAiBridge() {
    if (this.aiBridgeTimer !== null) return;
    const poll = () => {
      void this.fetchPersistedState().then(
        (state) => {
          this.pollFailCount = 0;
          this.scheduleAiBridge(1e3);
          if (state.revision < this.lastSeenRevision && this.lastSeenRevision > 0) {
            this.lastSeenRevision = state.revision;
          }
          if (state.revision <= this.lastSeenRevision) return;
          this.lastSeenRevision = state.revision;
          const current = this.engine.getState().activePresetId;
          if (state.activePresetId === null) {
            if (current !== null) this.clearActive();
            return;
          }
          void this.applyPresetById(state.activePresetId);
        },
        () => {
          this.pollFailCount = Math.min(this.pollFailCount + 1, 3);
          this.scheduleAiBridge(1e3 * 2 ** this.pollFailCount);
        }
      );
    };
    this.scheduleAiBridge = (delay) => {
      if (this.aiBridgeTimer !== null) clearTimeout(this.aiBridgeTimer);
      this.aiBridgeTimer = window.setTimeout(() => {
        this.aiBridgeTimer = null;
        if (document.hidden) {
          this.scheduleAiBridge(1e3);
          return;
        }
        poll();
      }, delay);
    };
    this.scheduleAiBridge(1e3);
  }
  stopAiBridge() {
    if (this.aiBridgeTimer !== null) {
      clearTimeout(this.aiBridgeTimer);
      this.aiBridgeTimer = null;
    }
  }
  persistActiveId(id) {
    this.memoryActiveId = id;
    this.broadcastActive(id);
    void fetch("/ui-presets/active", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ activePresetId: id })
    }).catch(() => {
      this.engine.reportError(t("ctrl.activePersistFailed"));
    });
  }
  /** review P3（全量评审）：fetchTier/saveTier 已删除——决策 #43 移除对外档位切换后无调用方
   * （死代码；/ui-presets/config 路由保留兼容，不再作为 UI 档位事实源）。 */
  /** 按 id 取预设：本地库 → 内置 demo → 已注册源（评审 P2-2 查序修复：
   * 用户自建同名预设优先，demo 仅兜底；M2-7 源回退最后——异常逐源隔离）。
   * review P2-1（全量评审）：区分「损坏」（GET 200 但校验失败）——reportError 提示，
   * 不再静默落到 demo 让用户以为"不存在"。 */
  async loadPreset(id) {
    try {
      const res = await fetch(`/ui-presets/presets/${encodeURIComponent(id)}`, { headers: { accept: "application/json" } });
      if (res.ok) {
        const body = await res.json();
        const result = validatePreset(body.preset);
        if (result.ok) return result.preset;
        this.engine.reportError(t("ctrl.broken", { id, error: result.errors[0] ?? t("ctrl.validationFailed") }));
        return null;
      }
    } catch {
    }
    const demo = DEMO_PRESETS.find((p) => p.id === id);
    if (demo !== void 0) return demo;
    for (const source of listPresetSources()) {
      try {
        const raw = await source.get(id);
        if (raw === null) continue;
        const result = validatePreset(raw);
        if (result.ok) return result.preset;
      } catch {
      }
    }
    return null;
  }
  /** 预设库 + 内置示例 + 已注册源合并列表（预设墙数据源；#62 携带 hasBackup 供还原入口显隐）。 */
  async listPresets() {
    const out = [];
    for (const demo of DEMO_PRESETS) {
      out.push({ id: demo.id, name: demo.name, edition: demo.edition, builtin: true, hasBackup: false });
    }
    try {
      const res = await fetch("/ui-presets/presets", { headers: { accept: "application/json" } });
      if (res.ok) {
        const body = await res.json();
        for (const meta of body.presets ?? []) {
          const entry = { ...meta, builtin: false, hasBackup: meta.hasBackup === true };
          const idx = out.findIndex((p) => p.id === meta.id);
          if (idx === -1) out.push(entry);
          else out[idx] = entry;
        }
      }
    } catch {
    }
    for (const source of listPresetSources()) {
      try {
        for (const meta of await source.list()) {
          if (!out.some((p) => p.id === meta.id)) out.push({ ...meta, builtin: false, hasBackup: false });
        }
      } catch {
      }
    }
    return out;
  }
  /** #62 读取预设备份（backup.json；无备份 → { backup: null, error: null }；损坏/失败带错误文案）。 */
  async getBackup(id) {
    try {
      const res = await fetch(`/ui-presets/presets/${encodeURIComponent(id)}?backup=1`, { headers: { accept: "application/json" } });
      if (!res.ok) {
        const body2 = await res.json().catch(() => null);
        return { backup: null, error: body2?.error ?? `\u8BFB\u53D6\u5907\u4EFD\u5931\u8D25\uFF08HTTP ${res.status}\uFF09` };
      }
      const body = await res.json();
      if (body.backup === null || body.backup === void 0) return { backup: null, error: null };
      const result = validatePreset(body.backup);
      if (!result.ok) return { backup: null, error: `\u5907\u4EFD\u635F\u574F\uFF1A${result.errors[0] ?? "\u6821\u9A8C\u5931\u8D25"}` };
      return { backup: result.preset, error: null };
    } catch (error) {
      return { backup: null, error: error instanceof Error ? error.message : String(error) };
    }
  }
  /**
   * #62 备份还原入口：用 backup.json 交换式还原预设库条目。
   * - 还原 = 校验通过的备份写回 preset.json，**当前版本写入 backup.json**（可再还原回去，单层备份）；
   * - 纯库操作：不写 active.json、不碰引擎/草稿（还原不自动应用——用户拍板）；
   * - 完成后广播库变更（跨窗口预设墙/列表刷新）。
   */
  async restoreBackup(id) {
    const { backup, error } = await this.getBackup(id);
    if (backup === null) return { ok: false, error: error ?? "\u6CA1\u6709\u53EF\u7528\u5907\u4EFD" };
    let current = null;
    try {
      const res = await fetch(`/ui-presets/presets/${encodeURIComponent(id)}`, { headers: { accept: "application/json" } });
      if (res.ok) current = (await res.json()).preset ?? null;
    } catch {
      current = null;
    }
    try {
      const body = { preset: backup };
      if (current !== null) body.backup = current;
      const res = await fetch(`/ui-presets/presets/${encodeURIComponent(id)}`, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body)
      });
      if (!res.ok) {
        const msg = await res.json().catch(() => null);
        return { ok: false, error: msg?.error ?? msg?.errors?.join("\uFF1B") ?? `\u8FD8\u539F\u5931\u8D25\uFF08HTTP ${res.status}\uFF09` };
      }
    } catch (error2) {
      return { ok: false, error: error2 instanceof Error ? error2.message : String(error2) };
    }
    this.engine.reportError(null);
    this.broadcastLibrary();
    return { ok: true };
  }
  /**
   * 保存预设（M1 评审决策：先落盘后提升；连接性评审 P1-1 修复：id 一致性）。
   * 流程：校验 → PUT 预设文件（**库中已有旧文件即写 backup.json**——新建会话也有固定 id，
   * 备份判定不依赖额外标记）→ 成功 → 引擎层同步最终 id（草稿 id 与落盘 id 不一致时
   * 先重挂草稿）→ 提升 → 写 active.json。
   * @param preset - 完整预设（已含编辑值）。
   * @param options - activate：保存后提升为活动预设（默认 true）；preserveDraft：不碰当前
   *   草稿（分享导入等「与编辑会话无关的写入」必须置 true——否则草稿会被改挂到新预设上）。
   * @returns 成功与否（失败信息在 lastError）。
   */
  async savePreset(preset2, options = {}) {
    const normalized = normalizeDanglingCover(preset2);
    const target = normalized.preset;
    const result = validatePreset(target);
    if (!result.ok) {
      this.engine.reportError(result.errors.join("\uFF1B"));
      return false;
    }
    const activate = options.activate !== false;
    try {
      const old = await this.loadPresetRaw(target.id);
      const backupBody = old !== null ? { ...old } : null;
      const body = { preset: result.preset, ...backupBody !== null ? { backup: backupBody } : {} };
      const res = await fetch(`/ui-presets/presets/${encodeURIComponent(target.id)}`, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body)
      });
      if (!res.ok) throw new Error(`\u4FDD\u5B58\u5931\u8D25\uFF08HTTP ${res.status}\uFF09`);
    } catch (error) {
      this.engine.reportError(error instanceof Error ? error.message : String(error));
      return false;
    }
    const state = this.engine.getState();
    const preserveDraft = options.preserveDraft === true;
    if (!preserveDraft && state.hasDraft && state.draftPresetId !== target.id) {
      const synced = this.engine.patchDraft(result.preset);
      if (!synced) {
        this.engine.reportError(t("ctrl.notSynced"));
        return false;
      }
    }
    let promotionError = null;
    if (activate) {
      const ok = preserveDraft ? false : this.engine.saveDraftAsActive();
      if (!ok) {
        const applied = this.engine.applyPreset(result.preset);
        if (!applied) promotionError = this.engine.getState().lastError;
      }
      if (promotionError === null) {
        this.persistActiveId(target.id);
      }
    } else if (!preserveDraft && this.engine.getState().draftPresetId === target.id) {
      this.engine.saveDraftAsActive();
    }
    if (promotionError === null) {
      this.engine.reportError(null);
      this.broadcastLibrary();
      return true;
    }
    this.engine.reportError(promotionError);
    return false;
  }
  /** 读取库中原始预设（不解析 demo），供备份。 */
  async loadPresetRaw(id) {
    try {
      const res = await fetch(`/ui-presets/presets/${encodeURIComponent(id)}`, { headers: { accept: "application/json" } });
      if (!res.ok) return null;
      const body = await res.json();
      return body.preset ?? null;
    } catch {
      return null;
    }
  }
  /** 删除预设（同时清除活动引用）。 */
  async deletePreset(id) {
    try {
      const res = await fetch(`/ui-presets/presets/${encodeURIComponent(id)}`, { method: "DELETE" });
      if (!res.ok) return false;
      if (this.engine.getState().activePresetId === id) this.clearActive();
      if (this.engine.getState().draftPresetId === id) this.engine.discardDraft();
      this.broadcastLibrary();
      return true;
    } catch {
      return false;
    }
  }
  /** 导出预设为 JSON 文件（浏览器下载）。 */
  /** #93：下载文件名安全化（预设名 → 文件名；非法字符替换，空名回退 id）。 */
  safeFileName(name2, fallback) {
    const cleaned = name2.replace(/[\\/:*?"<>|]/g, "_").trim().slice(0, 64);
    return cleaned !== "" ? cleaned : fallback;
  }
  /** M2-5：导出 zip 三件套（preset.json + cover.svg + manifest.json，Node half 生成）。
   * #93（用户建议）：默认下载名 = 预设名（此前固定为 id.zip）。 */
  async exportZipFile(preset2) {
    try {
      const res = await fetch("/ui-presets/export-zip", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ preset: preset2 })
      });
      if (!res.ok) {
        this.engine.reportError(t("ctrl.exportHttp", { status: res.status }));
        return false;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${this.safeFileName(preset2.name, preset2.id)}.zip`;
      a.click();
      URL.revokeObjectURL(url);
      this.engine.reportError(null);
      return true;
    } catch {
      this.engine.reportError(t("ctrl.exportNet"));
      return false;
    }
  }
  /** 导入预设文件（#93：仅支持 zip 三件套——JSON 格式已移除，用户拍板只留 zip）；
   * id 冲突循环加后缀（评审 P2-6：不覆盖已有预设）。 */
  async importPresetFile(file) {
    if (file.size < 4) return { ok: false, error: "\u4E0D\u662F\u5408\u6CD5\u7684 ZIP \u9884\u8BBE\u5305" };
    const head = new Uint8Array(await file.slice(0, 4).arrayBuffer());
    if (!(head[0] === 80 && head[1] === 75 && head[2] === 3 && head[3] === 4)) {
      return { ok: false, error: "\u4EC5\u652F\u6301 ZIP \u9884\u8BBE\u5305\uFF08JSON \u683C\u5F0F\u5DF2\u79FB\u9664\uFF09" };
    }
    try {
      const res = await fetch("/ui-presets/import-zip", {
        method: "POST",
        headers: { "content-type": "application/zip" },
        body: file
      });
      const body = await res.json();
      if (res.ok && body.ok === true && typeof body.id === "string") {
        this.broadcastLibrary();
        return { ok: true, id: body.id };
      }
      const detail = Array.isArray(body.errors) && body.errors.length > 0 ? body.errors.join("\uFF1B") : typeof body.error === "string" ? body.error : "ZIP \u5BFC\u5165\u5931\u8D25";
      this.engine.reportError(detail);
      return { ok: false, error: detail };
    } catch {
      return { ok: false, error: "ZIP \u5BFC\u5165\u5931\u8D25\uFF08\u7F51\u7EDC\u9519\u8BEF\uFF09" };
    }
  }
  /** 应用预设为活动预设并持久化。
   * #63 P0-1：重应用防自激——id 与当前活动一致（外部 preset_update 更新活动预设内容后
   * 桥/广播触发的重应用，或用户重复点击）→ 引擎重挂新内容但**跳过重复持久化/广播**：
   * 否则每次重应用都会 revision+1 → 桥再次触发 → 无限循环（轮询桥与跨窗口广播双通道均会）。 */
  async applyPresetById(id) {
    this.userInteracted = true;
    const preset2 = await this.loadPreset(id);
    if (preset2 === null) {
      if (this.engine.getState().lastError === null) {
        this.engine.reportError(t("ctrl.missing", { id }));
      }
      return false;
    }
    const wasActive = this.engine.getState().activePresetId === id;
    const ok = this.engine.applyPreset(preset2);
    if (ok && !wasActive) {
      this.persistActiveId(id);
    }
    return ok;
  }
  /** M2-8 壁纸库：上传素材（≤20MB，image/*；#52 支持 Blob——裁剪副本上传，name 兜底）。
   * #90：可选 layers 规格（分层合成壁纸：动图引用 + 帧坐标矩形）→ 随 meta 落盘。 */
  async uploadAsset(file, name2, layers) {
    if (!file.type.startsWith("image/")) return { ok: false, error: "\u53EA\u652F\u6301\u56FE\u7247\u7D20\u6750\uFF08image/*\uFF09" };
    if (file.size > MAX_ASSET_FILE_SIZE) return { ok: false, error: "\u7D20\u6750\u8D85\u8FC7\u4E0A\u9650\uFF08\u226420MB\uFF09" };
    const fileName = typeof file.name === "string" && file.name !== "" ? file.name.slice(0, 64) : (name2 ?? "image.png").slice(0, 64);
    try {
      const params = new URLSearchParams({ name: fileName, mime: file.type });
      if (layers !== void 0) params.set("layers", JSON.stringify(layers));
      const res = await fetch(`/ui-presets/assets?${params}`, {
        method: "PUT",
        headers: { "content-type": file.type },
        body: file
      });
      const body = await res.json();
      if (res.ok && body.ok === true && typeof body.id === "string") {
        if (layers !== void 0) this.layersMeta.set(body.id, layers);
        return {
          ok: true,
          id: body.id,
          name: typeof body.name === "string" ? body.name : fileName,
          mime: typeof body.mime === "string" ? body.mime : file.type,
          // #106：内容级去重——服务端命中同 sha256 素材 → 复用已有 id（UI 提示"已复用"）
          deduped: body.deduped === true
        };
      }
      const message = typeof body.error === "string" ? body.error : "\u4E0A\u4F20\u5931\u8D25";
      this.engine.reportError(message);
      return { ok: false, error: message };
    } catch {
      this.engine.reportError(t("ctrl.uploadNet"));
      return { ok: false, error: "\u4E0A\u4F20\u5931\u8D25\uFF08\u7F51\u7EDC\u9519\u8BEF\uFF09" };
    }
  }
  /** M2-8 壁纸库：删除素材文件。
   * review P1-3（全量评审）：返回服务端清理信息——refCount 其他预设引用数（删除时
   * 库中预设的引用已被顺带清空，UI 可提示），cleanedPresets 被清理的预设数。 */
  /** #103：删除素材前引用预查（GET ?refs=1）——返回引用该素材的全部预设（含当前预设，
   * 由调用方按上下文排除）。 */
  async getAssetRefs(id) {
    try {
      const res = await fetch(`/ui-presets/assets/${encodeURIComponent(id)}?refs=1`, { headers: { accept: "application/json" } });
      if (!res.ok) return [];
      const body = await res.json().catch(() => ({}));
      return body.refs ?? [];
    } catch {
      return [];
    }
  }
  async deleteAsset(id, options = {}) {
    try {
      const query = options.presetId !== void 0 && options.presetId !== "" ? `?mode=detach&preset=${encodeURIComponent(options.presetId)}` : "";
      const res = await fetch(`/ui-presets/assets/${encodeURIComponent(id)}${query}`, { method: "DELETE" });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        return { ok: false, error: typeof body.error === "string" ? body.error : "\u5220\u9664\u5931\u8D25" };
      }
      this.layersMeta.clear();
      return {
        ok: true,
        refCount: typeof body.refCount === "number" ? body.refCount : 0,
        cleanedPresets: typeof body.cleanedPresets === "number" ? body.cleanedPresets : 0
      };
    } catch {
      return { ok: false, error: "\u5220\u9664\u5931\u8D25\uFF08\u7F51\u7EDC\u9519\u8BEF\uFF09" };
    }
  }
  /** 清除活动预设（还原默认外观）。 */
  clearActive() {
    this.userInteracted = true;
    this.engine.dispose();
    this.persistActiveId(null);
  }
  /** M2-4 选择入口：切换活动主题（未注册 id 抛错 → 捕获返回失败并提示）。 */
  selectTheme(id) {
    if (this.rawTheme?.setTheme === void 0) {
      const error = "\u4E3B\u9898\u670D\u52A1\u4E0D\u652F\u6301\u5207\u6362";
      this.engine.reportError(error);
      return { ok: false, error };
    }
    try {
      this.rawTheme.setTheme(id);
      this.engine.reportError(null);
      return { ok: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.engine.reportError(t("ctrl.themeSwitch", { error: message }));
      return { ok: false, error: message };
    }
  }
  /** 启动时应用已存活动预设（apply 早于 boot settle → 加载页即带美化）。
   * 竞态防护：fetch/应用为异步——期间用户已操作（apply/clear）则放弃覆盖。 */
  async adoptPersisted() {
    const id = await this.fetchPersistedId();
    if (id === null) return;
    if (this.userInteracted) return;
    await this.applyPresetById(id);
  }
  // ---- #52b 动态裁剪渲染：按目标元素实际尺寸计算背景样式（裁剪结果不落库） ----
  /** #77：DOM 增删触发裁剪重同步的去抖调度（rAF 合并同帧多次变更；无 rAF 回落 setTimeout）。 */
  scheduleCropResync() {
    if (this.cropResyncScheduled) return;
    this.cropResyncScheduled = true;
    const run = () => {
      this.cropResyncScheduled = false;
      try {
        this.syncCropWidgets();
      } catch {
      }
    };
    if (typeof requestAnimationFrame === "function") requestAnimationFrame(() => run());
    else setTimeout(run, 0);
  }
  /** 当前是否深色风格（body[data-ds-dark-theme] 属性——DSH ThemePresenter 实证方案标记）。 */
  isDarkScheme() {
    return typeof document !== "undefined" && document.body !== null && document.body.hasAttribute("data-ds-dark-theme");
  }
  /** 应用裁剪内联样式到单个元素（无匹配标记/尺寸未知 → 清除）。
   * #55：浅色取 light 标记，深色取 dark 标记（缺省回退另一侧）。 */
  applyCropStyle(el, entry, isDark) {
    const info = isDark ? entry.dark ?? entry.light : entry.light ?? entry.dark;
    const s = el;
    const setIfChanged = (prop, value) => {
      if (s.style[prop] !== value) s.style[prop] = value;
    };
    const clear = () => {
      setIfChanged("backgroundImage", "");
      setIfChanged("backgroundSize", "");
      setIfChanged("backgroundPosition", "");
      setIfChanged("backgroundRepeat", "");
    };
    if (info === void 0) {
      clear();
      return;
    }
    const ratio = WIDGET_CROP_RATIOS[info.widgetId];
    const frame = cropFrameSize(ratio);
    const rect = el.getBoundingClientRect();
    const crop = { x: info.x, y: info.y, w: info.w, h: info.h };
    const washToken = WIDGET_WASH_TOKEN[info.widgetId] ?? "var(--dsw-alias-bg-base, #fff)";
    const fit = info.widgetId === "sidebar-poster" ? sidebarPosterFitFor(rect.width, rect.height, frame) : "cover";
    const assetMatch = /\/ui-presets\/assets\/([a-z0-9-]+)/.exec(info.url);
    let layeredSpec;
    if (assetMatch !== null) layeredSpec = this.layersMeta.get(assetMatch[1]);
    const style = layeredSpec !== null && layeredSpec !== void 0 ? layeredElementStyle(
      rect.width,
      rect.height,
      frame,
      crop,
      info.opacity,
      info.url,
      `url("/ui-presets/assets/${encodeURIComponent(layeredSpec.animAssetId)}")`,
      layeredSpec,
      washToken,
      fit
    ) : cropElementStyle(rect.width, rect.height, frame, crop, info.opacity, info.url, washToken, fit);
    if (Object.keys(style).length === 0) {
      clear();
      return;
    }
    setIfChanged("backgroundImage", style.backgroundImage);
    setIfChanged("backgroundSize", style.backgroundSize);
    setIfChanged("backgroundPosition", style.backgroundPosition);
    setIfChanged("backgroundRepeat", style.backgroundRepeat);
  }
  /** #90：确保分层 meta 已加载（缺失 id 触发一次列表拉取；成功后重同步以升级渲染）。 */
  ensureLayersMeta(ids) {
    const missing = ids.filter((id) => !this.layersMeta.has(id));
    if (missing.length === 0 || this.layersMetaFetching || typeof fetch === "undefined") return;
    this.layersMetaFetching = true;
    void (async () => {
      try {
        const res = await fetch("/ui-presets/assets", { headers: { accept: "application/json" } });
        if (!res.ok) return;
        const body = await res.json();
        const assets = Array.isArray(body.assets) ? body.assets : [];
        for (const a of assets) {
          if (typeof a.id !== "string") continue;
          const layers = a.layers;
          if (layers !== null && typeof layers === "object") {
            const L = layers;
            if (typeof L.animAssetId === "string" && typeof L.x === "number" && typeof L.y === "number" && typeof L.w === "number" && typeof L.h === "number") {
              this.layersMeta.set(a.id, { animAssetId: L.animAssetId, x: L.x, y: L.y, w: L.w, h: L.h });
              continue;
            }
          }
          this.layersMeta.set(a.id, null);
        }
        for (const id of missing) if (!this.layersMeta.has(id)) this.layersMeta.set(id, null);
        this.syncCropWidgets();
      } catch {
      } finally {
        this.layersMetaFetching = false;
      }
    })();
  }
  /** 解析引擎当前 cssText 的裁剪标记 → 同步目标元素内联样式（含 ResizeObserver 重算）。
   * 每次引擎状态变化调用（幂等、无标记即清除旧样式）；node 环境无 DOM → 跳过。
   * #55：同部件的浅/深标记都保留，按当前明暗选一组应用；body 明暗属性变化（MutationObserver）
   * 也触发本同步——应用内切换浅色/深色主题时壁纸即时切换。 */
  syncCropWidgets() {
    if (typeof document === "undefined" || typeof ResizeObserver === "undefined") return;
    if (this.schemeObserver === null && typeof MutationObserver !== "undefined" && document.body !== null) {
      try {
        this.schemeObserver = new MutationObserver(() => {
          this.syncCropWidgets();
        });
        this.schemeObserver.observe(document.body, { attributes: true, attributeFilter: ["data-ds-dark-theme"] });
      } catch {
        this.schemeObserver = null;
      }
    }
    if (this.cropDomObserver === null && typeof MutationObserver !== "undefined" && document.body !== null) {
      try {
        this.cropDomObserver = new MutationObserver(() => {
          this.scheduleCropResync();
        });
        this.cropDomObserver.observe(document.body, { childList: true, subtree: true });
      } catch {
        this.cropDomObserver = null;
      }
    }
    const markers = parseCropMarkers(this.engine.getCurrentCssText());
    const markerAssetIds = [];
    for (const info of markers) {
      const match = /\/ui-presets\/assets\/([a-z0-9-]+)/.exec(info.url);
      if (match !== null) markerAssetIds.push(match[1]);
    }
    this.ensureLayersMeta(markerAssetIds);
    const byWidget = /* @__PURE__ */ new Map();
    for (const info of markers) {
      const entry = byWidget.get(info.widgetId) ?? { light: void 0, dark: void 0 };
      if (info.dark) entry.dark = info;
      else entry.light = info;
      byWidget.set(info.widgetId, entry);
    }
    const isDark = this.isDarkScheme();
    const next = /* @__PURE__ */ new Map();
    for (const [widgetId, entry] of byWidget) {
      const selector = WIDGET_TARGET_SELECTOR[widgetId];
      if (selector === void 0) continue;
      for (const el of document.querySelectorAll(selector)) next.set(el, entry);
    }
    for (const [el, entry] of next) {
      this.applyCropStyle(el, entry, isDark);
      if (!this.cropResizeObservers.has(el)) {
        let observer = null;
        try {
          observer = new ResizeObserver(() => {
            const current = this.cropStyleElements.get(el);
            if (current !== void 0) this.applyCropStyle(el, current, this.isDarkScheme());
          });
          observer.observe(el);
        } catch {
          observer = null;
        }
        if (observer !== null) this.cropResizeObservers.set(el, observer);
      }
    }
    for (const [el] of this.cropStyleElements) {
      if (!next.has(el)) {
        const s = el;
        s.style.backgroundImage = "";
        s.style.backgroundSize = "";
        s.style.backgroundPosition = "";
        s.style.backgroundRepeat = "";
        this.cropResizeObservers.get(el)?.disconnect();
        this.cropResizeObservers.delete(el);
      }
    }
    this.cropStyleElements.clear();
    for (const [el, entry] of next) this.cropStyleElements.set(el, entry);
  }
};
var controller = null;
function getController() {
  return controller;
}
function setController(value) {
  controller = value;
}

// src/client/studio-shell.tsx
var React11 = __toESM(require("react"), 1);

// src/client/token-editor.tsx
var React10 = __toESM(require("react"), 1);

// src/core/catalog-data.ts
var CATALOG_DSH_VERSION = "0.1.0-rc.5";
var CATALOG = [
  { name: "--ds-ease-in-out", group: "other", light: "cubic-bezier(0.4, 0, 0.2, 1)", dark: "cubic-bezier(0.4, 0, 0.2, 1)", valueType: "easing", safety: "safe", scope: "local", description: "" },
  { name: "--ds-font-family-code", group: "font", light: "'SF Mono', 'JetBrains Mono', 'Fira Code', Consolas,\n    'Liberation Mono', Menlo, Courier, 'PingFang SC', 'Microsoft YaHei'", dark: "'SF Mono', 'JetBrains Mono', 'Fira Code', Consolas,\n    'Liberation Mono', Menlo, Courier, 'PingFang SC', 'Microsoft YaHei'", valueType: "font-family", safety: "safe", scope: "local", description: "" },
  { name: "--ds-transition-duration", group: "other", light: "0.2s", dark: "0.2s", valueType: "length", safety: "safe", scope: "local", description: "" },
  { name: "--ds-transition-duration-fast", group: "other", light: "0.1s", dark: "0.1s", valueType: "length", safety: "safe", scope: "local", description: "" },
  { name: "--ds-transition-duration-slow", group: "other", light: "0.3s", dark: "0.3s", valueType: "length", safety: "safe", scope: "local", description: "" },
  { name: "--dsh-scrollbar-thumb", group: "scrollbar", light: "var(--dsw-alias-scrollbar-bg-l1)", dark: "var(--dsw-alias-scrollbar-bg-l1)", valueType: "string", safety: "safe", scope: "local", description: "" },
  { name: "--dsh-scrollbar-thumb-hover", group: "scrollbar", light: "var(--dsw-alias-scrollbar-hover-l1)", dark: "var(--dsw-alias-scrollbar-hover-l1)", valueType: "string", safety: "safe", scope: "local", description: "" },
  { name: "--dsh-scrollbar-width", group: "scrollbar", light: "8px", dark: "8px", valueType: "length", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-alias-bg-base", group: "alias-bg", light: "var(--dsw-static-neutral-bluish-00)", dark: "var(--dsw-static-neutral-bluish-950)", valueType: "string", safety: "safe", scope: "global", description: "" },
  { name: "--dsw-alias-bg-layer-1", group: "alias-bg", light: "var(--dsw-static-neutral-bluish-00)", dark: "var(--dsw-static-neutral-bluish-875)", valueType: "string", safety: "safe", scope: "global", description: "" },
  { name: "--dsw-alias-bg-layer-2", group: "alias-bg", light: "var(--dsw-static-neutral-bluish-00)", dark: "var(--dsw-static-neutral-bluish-850)", valueType: "string", safety: "safe", scope: "global", description: "" },
  { name: "--dsw-alias-bg-layer-3", group: "alias-bg", light: "var(--dsw-static-neutral-bluish-00)", dark: "var(--dsw-static-neutral-bluish-800)", valueType: "string", safety: "safe", scope: "global", description: "" },
  { name: "--dsw-alias-bg-mask-1", group: "alias-bg", light: "rgba(0, 0, 0, 0.24)", dark: "rgba(0, 0, 0, 0.5)", valueType: "color", safety: "safe", scope: "global", description: "" },
  { name: "--dsw-alias-bg-mask-2", group: "alias-bg", light: "rgba(0, 0, 0, 0.12)", dark: "rgba(0, 0, 0, 0.2)", valueType: "color", safety: "safe", scope: "global", description: "" },
  { name: "--dsw-alias-bg-mask-3", group: "alias-bg", light: "rgba(0, 0, 0, 0.48)", dark: "rgba(0, 0, 0, 0.48)", valueType: "color", safety: "safe", scope: "global", description: "" },
  { name: "--dsw-alias-bg-mask-drop", group: "alias-bg", light: "rgba(255, 255, 255, 0.7)", dark: "rgba(39, 39, 48, 0.7)", valueType: "color", safety: "safe", scope: "global", description: "" },
  { name: "--dsw-alias-bg-mask-photo", group: "alias-bg", light: "rgba(0, 0, 0, 0.88)", dark: "rgba(0, 0, 0, 0.88)", valueType: "color", safety: "safe", scope: "global", description: "" },
  { name: "--dsw-alias-bg-module-platform", group: "alias-bg", light: "var(--dsw-static-neutral-bluish-60)", dark: "var(--dsw-static-neutral-bluish-800)", valueType: "string", safety: "safe", scope: "global", description: "" },
  { name: "--dsw-alias-bg-multi-select", group: "alias-bg", light: "var(--dsw-static-neutral-bluish-60)", dark: "var(--dsw-static-neutral-850)", valueType: "string", safety: "safe", scope: "global", description: "" },
  { name: "--dsw-alias-bg-overlay", group: "alias-bg", light: "var(--dsw-static-neutral-bluish-150)", dark: "var(--dsw-static-neutral-bluish-700)", valueType: "string", safety: "safe", scope: "global", description: "" },
  { name: "--dsw-alias-bg-skeleton", group: "alias-bg", light: "rgba(0, 0, 0, 0.04)", dark: "rgba(255, 255, 255, 0.08)", valueType: "color", safety: "safe", scope: "global", description: "" },
  { name: "--dsw-alias-border-inverted", group: "alias-border", light: "rgba(0, 0, 0, 0)", dark: "rgba(255, 255, 255, 0.06)", valueType: "color", safety: "safe", scope: "global", description: "" },
  { name: "--dsw-alias-border-inverted2", group: "alias-border", light: "rgba(0, 0, 0, 0)", dark: "rgba(255, 255, 255, 0.08)", valueType: "color", safety: "safe", scope: "global", description: "" },
  { name: "--dsw-alias-border-l1", group: "alias-border", light: "rgba(0, 0, 0, 0.04)", dark: "rgba(255, 255, 255, 0.06)", valueType: "color", safety: "safe", scope: "global", description: "" },
  { name: "--dsw-alias-border-l2", group: "alias-border", light: "rgba(0, 0, 0, 0.1)", dark: "rgba(255, 255, 255, 0.12)", valueType: "color", safety: "safe", scope: "global", description: "" },
  { name: "--dsw-alias-border-l2-darkmode-thin", group: "alias-border", light: "rgba(0, 0, 0, 0.1)", dark: "rgba(255, 255, 255, 0.06)", valueType: "color", safety: "safe", scope: "global", description: "" },
  { name: "--dsw-alias-border-l3", group: "alias-border", light: "rgba(0, 0, 0, 0.12)", dark: "rgba(255, 255, 255, 0.16)", valueType: "color", safety: "safe", scope: "global", description: "" },
  { name: "--dsw-alias-border-l4", group: "alias-border", light: "rgba(0, 0, 0, 0.16)", dark: "rgba(255, 255, 255, 0.2)", valueType: "color", safety: "safe", scope: "global", description: "" },
  { name: "--dsw-alias-brand-primary", group: "alias-brand", light: "var(--dsw-static-neutral-bluish-1000)", dark: "var(--dsw-static-neutral-bluish-50)", valueType: "string", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-alias-brand-primary-invert", group: "alias-brand", light: "var(--dsw-static-neutral-bluish-1000)", dark: "var(--dsw-static-neutral-bluish-50)", valueType: "string", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-alias-brand-primary-new-colorprimary-new-color", group: "alias-brand", light: "rgb(65, 118, 230)", dark: "var(--dsw-static-deepseek-450)", valueType: "color", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-alias-brand-text", group: "alias-brand", light: "var(--dsw-static-neutral-bluish-1000)", dark: "var(--dsw-static-neutral-bluish-50)", valueType: "string", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-alias-button-contrast-fill", group: "alias-button", light: "var(--dsw-static-neutral-bluish-700)", dark: "var(--dsw-static-neutral-bluish-50)", valueType: "string", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-alias-button-elevated-fill", group: "alias-button", light: "var(--dsw-static-neutral-bluish-00)", dark: "var(--dsw-static-neutral-bluish-750)", valueType: "string", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-alias-button-floating-fill", group: "alias-button", light: "var(--dsw-static-neutral-bluish-00)", dark: "var(--dsw-static-neutral-bluish-850)", valueType: "string", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-alias-button-floating-hover", group: "alias-button", light: "var(--dsw-static-neutral-bluish-75)", dark: "var(--dsw-static-neutral-bluish-800)", valueType: "string", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-alias-button-ghost-active-border", group: "alias-border", light: "var(--dsw-static-neutral-bluish-500)", dark: "var(--dsw-static-neutral-bluish-600)", valueType: "string", safety: "safe", scope: "global", description: "" },
  { name: "--dsw-alias-button-ghost-active-fill", group: "alias-button", light: "var(--dsw-static-neutral-bluish-100)", dark: "var(--dsw-static-neutral-bluish-750)", valueType: "string", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-alias-button-ghost-active-hover", group: "alias-button", light: "var(--dsw-static-neutral-bluish-150)", dark: "var(--dsw-static-neutral-bluish-700)", valueType: "string", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-alias-button-info-fill", group: "alias-button", light: "var(--dsw-static-deepseek-500)", dark: "var(--dsw-static-deepseek-400)", valueType: "string", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-alias-button-info-hover", group: "alias-button", light: "var(--dsw-static-deepseek-400)", dark: "var(--dsw-static-deepseek-500)", valueType: "string", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-alias-button-primary-dimmed", group: "alias-button", light: "var(--dsw-static-neutral-bluish-100)", dark: "var(--dsw-static-neutral-bluish-750)", valueType: "string", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-alias-button-primary-fill", group: "alias-button", light: "var(--dsw-alias-brand-primary)", dark: "var(--dsw-alias-brand-primary)", valueType: "string", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-alias-button-primary-hover", group: "alias-button", light: "var(--dsw-static-neutral-bluish-750)", dark: "var(--dsw-static-neutral-bluish-100)", valueType: "string", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-alias-button-tool-bar-fill", group: "alias-button", light: "rgba(84, 85, 87, 0.5)", dark: "rgba(84, 85, 87, 0.5)", valueType: "color", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-alias-button-tool-bar-fill-invisible", group: "alias-button", light: "rgba(31, 31, 31, 0.36)", dark: "rgba(31, 31, 31, 0.36)", valueType: "color", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-alias-button-tool-bar-hover", group: "alias-button", light: "rgba(84, 85, 87, 0.6)", dark: "rgba(84, 85, 87, 0.6)", valueType: "color", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-alias-interactive-bg-active", group: "alias-interactive", light: "rgba(38, 49, 72, 0.1)", dark: "rgba(255, 255, 255, 0.14)", valueType: "color", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-alias-interactive-bg-hover", group: "alias-interactive", light: "rgba(38, 49, 72, 0.06)", dark: "rgba(255, 255, 255, 0.08)", valueType: "color", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-alias-interactive-bg-hover-accent", group: "alias-interactive", light: "rgba(38, 49, 72, 0.14)", dark: "rgba(255, 255, 255, 0.24)", valueType: "color", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-alias-interactive-bg-hover-danger", group: "alias-interactive", light: "rgba(236, 19, 19, 0.05)", dark: "rgba(242, 90, 90, 0.15)", valueType: "color", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-alias-interactive-bg-hover-solid", group: "alias-interactive", light: "var(--dsw-static-neutral-bluish-75)", dark: "var(--dsw-static-neutral-bluish-800)", valueType: "string", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-alias-label-caption", group: "alias-label", light: "var(--dsw-static-neutral-bluish-400)", dark: "var(--dsw-static-neutral-bluish-600)", valueType: "string", safety: "safe", scope: "global", description: "" },
  { name: "--dsw-alias-label-dimmed", group: "alias-label", light: "var(--dsw-static-neutral-bluish-200)", dark: "var(--dsw-static-neutral-bluish-750)", valueType: "string", safety: "safe", scope: "global", description: "" },
  { name: "--dsw-alias-label-primary", group: "alias-label", light: "var(--dsw-static-neutral-bluish-1000)", dark: "var(--dsw-static-neutral-bluish-50)", valueType: "string", safety: "safe", scope: "global", description: "" },
  { name: "--dsw-alias-label-primary-bluish", group: "alias-label", light: "var(--dsw-static-blue-900)", dark: "var(--dsw-static-neutral-bluish-50)", valueType: "string", safety: "safe", scope: "global", description: "" },
  { name: "--dsw-alias-label-primary-dimmed", group: "alias-label", light: "var(--dsw-static-neutral-bluish-950)", dark: "var(--dsw-static-neutral-bluish-100)", valueType: "string", safety: "safe", scope: "global", description: "" },
  { name: "--dsw-alias-label-primary-foreground", group: "alias-label", light: "var(--dsw-static-neutral-bluish-00)", dark: "var(--dsw-static-neutral-bluish-1000)", valueType: "string", safety: "safe", scope: "global", description: "" },
  { name: "--dsw-alias-label-primary-inverted", group: "alias-label", light: "var(--dsw-static-neutral-bluish-00)", dark: "var(--dsw-static-neutral-bluish-800)", valueType: "string", safety: "safe", scope: "global", description: "" },
  { name: "--dsw-alias-label-secondary", group: "alias-label", light: "var(--dsw-static-neutral-bluish-700)", dark: "var(--dsw-static-neutral-bluish-300)", valueType: "string", safety: "safe", scope: "global", description: "" },
  { name: "--dsw-alias-label-tertiary", group: "alias-label", light: "var(--dsw-static-neutral-bluish-600)", dark: "var(--dsw-static-neutral-bluish-400)", valueType: "string", safety: "safe", scope: "global", description: "" },
  { name: "--dsw-alias-markdown-citation", group: "alias-markdown", light: "var(--dsw-static-neutral-bluish-100)", dark: "var(--dsw-static-neutral-bluish-800)", valueType: "string", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-alias-markdown-code-block", group: "alias-markdown", light: "var(--dsw-static-neutral-bluish-50)", dark: "var(--dsw-static-neutral-bluish-900)", valueType: "string", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-alias-markdown-code-block-banner", group: "alias-markdown", light: "var(--dsw-static-neutral-bluish-50)", dark: "var(--dsw-static-neutral-bluish-850)", valueType: "string", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-alias-markdown-code-segment-selected", group: "alias-markdown", light: "var(--dsw-static-neutral-bluish-00)", dark: "var(--dsw-static-neutral-bluish-800)", valueType: "string", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-alias-markdown-code-segment-unselected", group: "alias-markdown", light: "var(--dsw-static-neutral-bluish-75)", dark: "var(--dsw-static-neutral-bluish-900)", valueType: "string", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-alias-markdown-inline-code", group: "alias-markdown", light: "var(--dsw-static-neutral-bluish-100)", dark: "var(--dsw-static-neutral-bluish-850)", valueType: "string", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-alias-markdown-placeholder", group: "alias-markdown", light: "var(--dsw-static-neutral-bluish-60)", dark: "var(--dsw-static-neutral-bluish-850)", valueType: "string", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-alias-markdown-tag", group: "alias-markdown", light: "var(--dsw-static-neutral-bluish-75)", dark: "var(--dsw-static-neutral-bluish-850)", valueType: "string", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-alias-scrollbar-bg-l1", group: "alias-scrollbar", light: "var(--dsw-static-neutral-200)", dark: "var(--dsw-static-neutral-700)", valueType: "string", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-alias-scrollbar-bg-l2", group: "alias-scrollbar", light: "var(--dsw-static-neutral-200)", dark: "var(--dsw-static-neutral-600)", valueType: "string", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-alias-scrollbar-hover-l1", group: "alias-scrollbar", light: "var(--dsw-static-neutral-300)", dark: "var(--dsw-static-neutral-600)", valueType: "string", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-alias-scrollbar-hover-l2", group: "alias-scrollbar", light: "var(--dsw-static-neutral-300)", dark: "var(--dsw-static-neutral-550)", valueType: "string", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-alias-state-business-primary", group: "alias-state", light: "var(--dsw-static-deepseek-500)", dark: "var(--dsw-static-deepseek-400)", valueType: "string", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-alias-state-business-tertiary", group: "alias-state", light: "var(--dsw-static-deepseek-100)", dark: "var(--dsw-static-deepseek-800)", valueType: "string", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-alias-state-error-primary", group: "alias-state", light: "var(--dsw-static-red-600)", dark: "var(--dsw-static-red-400)", valueType: "string", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-alias-state-error-secondary", group: "alias-state", light: "var(--dsw-static-red-400)", dark: "var(--dsw-static-red-400)", valueType: "string", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-alias-state-success-primary", group: "alias-state", light: "var(--dsw-static-green-500)", dark: "var(--dsw-static-green-500)", valueType: "string", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-alias-state-success-secondary", group: "alias-state", light: "var(--dsw-static-green-400)", dark: "var(--dsw-static-green-400)", valueType: "string", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-alias-state-success-tertiary", group: "alias-state", light: "var(--dsw-static-green-100)", dark: "var(--dsw-static-green-900)", valueType: "string", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-alias-state-warn-label", group: "alias-label", light: "var(--dsw-static-amber-600)", dark: "var(--dsw-static-amber-600)", valueType: "string", safety: "safe", scope: "global", description: "" },
  { name: "--dsw-alias-state-warn-primary", group: "alias-state", light: "var(--dsw-static-amber-500)", dark: "var(--dsw-static-amber-500)", valueType: "string", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-alias-state-warn-secondary", group: "alias-state", light: "var(--dsw-static-amber-400)", dark: "var(--dsw-static-amber-400)", valueType: "string", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-alias-state-warn-tertiary", group: "alias-state", light: "var(--dsw-static-amber-100)", dark: "var(--dsw-static-amber-900)", valueType: "string", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-alias-toast-bg", group: "alias-overlay", light: "var(--dsw-static-neutral-bluish-800)", dark: "var(--dsw-static-neutral-bluish-750)", valueType: "string", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-alias-tooltip-bg", group: "alias-overlay", light: "var(--dsw-static-neutral-bluish-850)", dark: "var(--dsw-static-neutral-bluish-750)", valueType: "string", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-font-base-16", group: "font", light: "16px/24px var(--dsw-font-family)", dark: "16px/24px var(--dsw-font-family)", valueType: "string", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-font-base-16-font-family", group: "font", light: "var(--dsw-font-family)", dark: "var(--dsw-font-family)", valueType: "string", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-font-base-16-font-size", group: "font", light: "16px", dark: "16px", valueType: "length", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-font-base-16-font-style", group: "font", light: "normal", dark: "normal", valueType: "string", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-font-base-16-font-weight", group: "font", light: "400", dark: "400", valueType: "number", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-font-base-16-line-height", group: "font", light: "24px", dark: "24px", valueType: "length", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-font-base-strong-16", group: "font", light: "500 16px/24px var(--dsw-font-family)", dark: "500 16px/24px var(--dsw-font-family)", valueType: "string", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-font-base-strong-16-font-family", group: "font", light: "var(--dsw-font-family)", dark: "var(--dsw-font-family)", valueType: "string", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-font-base-strong-16-font-size", group: "font", light: "16px", dark: "16px", valueType: "length", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-font-base-strong-16-font-style", group: "font", light: "normal", dark: "normal", valueType: "string", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-font-base-strong-16-font-weight", group: "font", light: "500", dark: "500", valueType: "number", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-font-base-strong-16-line-height", group: "font", light: "24px", dark: "24px", valueType: "length", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-font-family", group: "font", light: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC',\n    'Hiragino Sans GB', 'Microsoft YaHei', 'Helvetica Neue', Helvetica, Arial, sans-serif", dark: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC',\n    'Hiragino Sans GB', 'Microsoft YaHei', 'Helvetica Neue', Helvetica, Arial, sans-serif", valueType: "font-family", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-font-l-20", group: "font", light: "500 20px/28px var(--dsw-font-family)", dark: "500 20px/28px var(--dsw-font-family)", valueType: "string", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-font-l-20-font-family", group: "font", light: "var(--dsw-font-family)", dark: "var(--dsw-font-family)", valueType: "string", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-font-l-20-font-size", group: "font", light: "20px", dark: "20px", valueType: "length", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-font-l-20-font-style", group: "font", light: "normal", dark: "normal", valueType: "string", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-font-l-20-font-weight", group: "font", light: "500", dark: "500", valueType: "number", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-font-l-20-line-height", group: "font", light: "28px", dark: "28px", valueType: "length", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-font-m-18", group: "font", light: "500 16px/28px var(--dsw-font-family)", dark: "500 16px/28px var(--dsw-font-family)", valueType: "string", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-font-m-18-font-family", group: "font", light: "var(--dsw-font-family)", dark: "var(--dsw-font-family)", valueType: "string", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-font-m-18-font-size", group: "font", light: "16px", dark: "16px", valueType: "length", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-font-m-18-font-style", group: "font", light: "normal", dark: "normal", valueType: "string", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-font-m-18-font-weight", group: "font", light: "500", dark: "500", valueType: "number", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-font-m-18-line-height", group: "font", light: "28px", dark: "28px", valueType: "length", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-font-markdown-base", group: "font", light: "16px/28px var(--dsw-font-family)", dark: "16px/28px var(--dsw-font-family)", valueType: "string", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-font-markdown-base-font-family", group: "font", light: "var(--dsw-font-family)", dark: "var(--dsw-font-family)", valueType: "string", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-font-markdown-base-font-size", group: "font", light: "16px", dark: "16px", valueType: "length", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-font-markdown-base-font-style", group: "font", light: "normal", dark: "normal", valueType: "string", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-font-markdown-base-font-weight", group: "font", light: "400", dark: "400", valueType: "number", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-font-markdown-base-italic", group: "font", light: "italic 16px/28px var(--dsw-font-family)", dark: "italic 16px/28px var(--dsw-font-family)", valueType: "string", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-font-markdown-base-italic-font-family", group: "font", light: "var(--dsw-font-family)", dark: "var(--dsw-font-family)", valueType: "string", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-font-markdown-base-italic-font-size", group: "font", light: "16px", dark: "16px", valueType: "length", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-font-markdown-base-italic-font-style", group: "font", light: "italic", dark: "italic", valueType: "string", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-font-markdown-base-italic-font-weight", group: "font", light: "400", dark: "400", valueType: "number", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-font-markdown-base-italic-line-height", group: "font", light: "28px", dark: "28px", valueType: "length", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-font-markdown-base-line-height", group: "font", light: "28px", dark: "28px", valueType: "length", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-font-markdown-base-strong", group: "font", light: "600 16px/28px var(--dsw-font-family)", dark: "600 16px/28px var(--dsw-font-family)", valueType: "string", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-font-markdown-base-strong-font-family", group: "font", light: "var(--dsw-font-family)", dark: "var(--dsw-font-family)", valueType: "string", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-font-markdown-base-strong-font-size", group: "font", light: "16px", dark: "16px", valueType: "length", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-font-markdown-base-strong-font-style", group: "font", light: "normal", dark: "normal", valueType: "string", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-font-markdown-base-strong-font-weight", group: "font", light: "600", dark: "600", valueType: "number", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-font-markdown-base-strong-italic", group: "font", light: "italic 600 16px/28px var(--dsw-font-family)", dark: "italic 600 16px/28px var(--dsw-font-family)", valueType: "string", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-font-markdown-base-strong-italic-font-family", group: "font", light: "var(--dsw-font-family)", dark: "var(--dsw-font-family)", valueType: "string", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-font-markdown-base-strong-italic-font-size", group: "font", light: "16px", dark: "16px", valueType: "length", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-font-markdown-base-strong-italic-font-style", group: "font", light: "italic", dark: "italic", valueType: "string", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-font-markdown-base-strong-italic-font-weight", group: "font", light: "600", dark: "600", valueType: "number", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-font-markdown-base-strong-italic-line-height", group: "font", light: "28px", dark: "28px", valueType: "length", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-font-markdown-base-strong-line-height", group: "font", light: "28px", dark: "28px", valueType: "length", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-font-markdown-code", group: "font", light: "14px/22px var(--ds-font-family-code)", dark: "14px/22px var(--ds-font-family-code)", valueType: "string", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-font-markdown-code-block", group: "font", light: "13px/22px var(--ds-font-family-code)", dark: "13px/22px var(--ds-font-family-code)", valueType: "string", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-font-markdown-code-block-font-family", group: "font", light: "var(--ds-font-family-code)", dark: "var(--ds-font-family-code)", valueType: "string", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-font-markdown-code-block-font-size", group: "font", light: "13px", dark: "13px", valueType: "length", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-font-markdown-code-block-font-style", group: "font", light: "normal", dark: "normal", valueType: "string", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-font-markdown-code-block-font-weight", group: "font", light: "400", dark: "400", valueType: "number", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-font-markdown-code-block-line-height", group: "font", light: "22px", dark: "22px", valueType: "length", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-font-markdown-code-block-small", group: "font", light: "12px/18px var(--ds-font-family-code)", dark: "12px/18px var(--ds-font-family-code)", valueType: "string", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-font-markdown-code-block-small-font-family", group: "font", light: "var(--ds-font-family-code)", dark: "var(--ds-font-family-code)", valueType: "string", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-font-markdown-code-block-small-font-size", group: "font", light: "12px", dark: "12px", valueType: "length", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-font-markdown-code-block-small-font-style", group: "font", light: "normal", dark: "normal", valueType: "string", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-font-markdown-code-block-small-font-weight", group: "font", light: "400", dark: "400", valueType: "number", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-font-markdown-code-block-small-line-height", group: "font", light: "18px", dark: "18px", valueType: "length", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-font-markdown-code-font-family", group: "font", light: "var(--ds-font-family-code)", dark: "var(--ds-font-family-code)", valueType: "string", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-font-markdown-code-font-size", group: "font", light: "14px", dark: "14px", valueType: "length", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-font-markdown-code-font-style", group: "font", light: "normal", dark: "normal", valueType: "string", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-font-markdown-code-font-weight", group: "font", light: "400", dark: "400", valueType: "number", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-font-markdown-code-line-height", group: "font", light: "22px", dark: "22px", valueType: "length", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-font-markdown-h1", group: "font", light: "700 24px/34px var(--dsw-font-family)", dark: "700 24px/34px var(--dsw-font-family)", valueType: "string", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-font-markdown-h1-font-family", group: "font", light: "var(--dsw-font-family)", dark: "var(--dsw-font-family)", valueType: "string", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-font-markdown-h1-font-size", group: "font", light: "24px", dark: "24px", valueType: "length", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-font-markdown-h1-font-style", group: "font", light: "normal", dark: "normal", valueType: "string", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-font-markdown-h1-font-weight", group: "font", light: "700", dark: "700", valueType: "number", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-font-markdown-h1-line-height", group: "font", light: "34px", dark: "34px", valueType: "length", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-font-markdown-h2", group: "font", light: "700 22px/32px var(--dsw-font-family)", dark: "700 22px/32px var(--dsw-font-family)", valueType: "string", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-font-markdown-h2-font-family", group: "font", light: "var(--dsw-font-family)", dark: "var(--dsw-font-family)", valueType: "string", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-font-markdown-h2-font-size", group: "font", light: "22px", dark: "22px", valueType: "length", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-font-markdown-h2-font-style", group: "font", light: "normal", dark: "normal", valueType: "string", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-font-markdown-h2-font-weight", group: "font", light: "700", dark: "700", valueType: "number", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-font-markdown-h2-line-height", group: "font", light: "32px", dark: "32px", valueType: "length", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-font-markdown-h3", group: "font", light: "700 20px/30px var(--dsw-font-family)", dark: "700 20px/30px var(--dsw-font-family)", valueType: "string", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-font-markdown-h3-font-family", group: "font", light: "var(--dsw-font-family)", dark: "var(--dsw-font-family)", valueType: "string", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-font-markdown-h3-font-size", group: "font", light: "20px", dark: "20px", valueType: "length", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-font-markdown-h3-font-style", group: "font", light: "normal", dark: "normal", valueType: "string", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-font-markdown-h3-font-weight", group: "font", light: "700", dark: "700", valueType: "number", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-font-markdown-h3-line-height", group: "font", light: "30px", dark: "30px", valueType: "length", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-font-markdown-h4", group: "font", light: "600 16px/28px var(--dsw-font-family)", dark: "600 16px/28px var(--dsw-font-family)", valueType: "string", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-font-markdown-h4-font-family", group: "font", light: "var(--dsw-font-family)", dark: "var(--dsw-font-family)", valueType: "string", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-font-markdown-h4-font-size", group: "font", light: "16px", dark: "16px", valueType: "length", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-font-markdown-h4-font-style", group: "font", light: "normal", dark: "normal", valueType: "string", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-font-markdown-h4-font-weight", group: "font", light: "600", dark: "600", valueType: "number", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-font-markdown-h4-line-height", group: "font", light: "28px", dark: "28px", valueType: "length", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-font-markdown-small", group: "font", light: "14px/24px var(--dsw-font-family)", dark: "14px/24px var(--dsw-font-family)", valueType: "string", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-font-markdown-small-font-family", group: "font", light: "var(--dsw-font-family)", dark: "var(--dsw-font-family)", valueType: "string", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-font-markdown-small-font-size", group: "font", light: "14px", dark: "14px", valueType: "length", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-font-markdown-small-font-style", group: "font", light: "normal", dark: "normal", valueType: "string", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-font-markdown-small-font-weight", group: "font", light: "400", dark: "400", valueType: "number", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-font-markdown-small-italic", group: "font", light: "italic 14px/24px var(--dsw-font-family)", dark: "italic 14px/24px var(--dsw-font-family)", valueType: "string", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-font-markdown-small-italic-font-family", group: "font", light: "var(--dsw-font-family)", dark: "var(--dsw-font-family)", valueType: "string", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-font-markdown-small-italic-font-size", group: "font", light: "14px", dark: "14px", valueType: "length", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-font-markdown-small-italic-font-style", group: "font", light: "italic", dark: "italic", valueType: "string", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-font-markdown-small-italic-font-weight", group: "font", light: "400", dark: "400", valueType: "number", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-font-markdown-small-italic-line-height", group: "font", light: "24px", dark: "24px", valueType: "length", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-font-markdown-small-line-height", group: "font", light: "24px", dark: "24px", valueType: "length", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-font-markdown-small-strong", group: "font", light: "600 14px/24px var(--dsw-font-family)", dark: "600 14px/24px var(--dsw-font-family)", valueType: "string", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-font-markdown-small-strong-font-family", group: "font", light: "var(--dsw-font-family)", dark: "var(--dsw-font-family)", valueType: "string", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-font-markdown-small-strong-font-size", group: "font", light: "14px", dark: "14px", valueType: "length", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-font-markdown-small-strong-font-style", group: "font", light: "normal", dark: "normal", valueType: "string", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-font-markdown-small-strong-font-weight", group: "font", light: "600", dark: "600", valueType: "number", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-font-markdown-small-strong-italic", group: "font", light: "italic 600 14px/24px var(--dsw-font-family)", dark: "italic 600 14px/24px var(--dsw-font-family)", valueType: "string", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-font-markdown-small-strong-italic-font-family", group: "font", light: "var(--dsw-font-family)", dark: "var(--dsw-font-family)", valueType: "string", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-font-markdown-small-strong-italic-font-size", group: "font", light: "14px", dark: "14px", valueType: "length", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-font-markdown-small-strong-italic-font-style", group: "font", light: "italic", dark: "italic", valueType: "string", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-font-markdown-small-strong-italic-font-weight", group: "font", light: "600", dark: "600", valueType: "number", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-font-markdown-small-strong-italic-line-height", group: "font", light: "24px", dark: "24px", valueType: "length", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-font-markdown-small-strong-line-height", group: "font", light: "24px", dark: "24px", valueType: "length", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-font-markdown-table", group: "font", light: "15px/25px var(--dsw-font-family)", dark: "15px/25px var(--dsw-font-family)", valueType: "string", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-font-markdown-table-font-family", group: "font", light: "var(--dsw-font-family)", dark: "var(--dsw-font-family)", valueType: "string", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-font-markdown-table-font-size", group: "font", light: "15px", dark: "15px", valueType: "length", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-font-markdown-table-font-style", group: "font", light: "normal", dark: "normal", valueType: "string", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-font-markdown-table-font-weight", group: "font", light: "400", dark: "400", valueType: "number", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-font-markdown-table-head", group: "font", light: "500 15px/25px var(--dsw-font-family)", dark: "500 15px/25px var(--dsw-font-family)", valueType: "string", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-font-markdown-table-head-font-family", group: "font", light: "var(--dsw-font-family)", dark: "var(--dsw-font-family)", valueType: "string", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-font-markdown-table-head-font-size", group: "font", light: "15px", dark: "15px", valueType: "length", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-font-markdown-table-head-font-style", group: "font", light: "normal", dark: "normal", valueType: "string", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-font-markdown-table-head-font-weight", group: "font", light: "500", dark: "500", valueType: "number", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-font-markdown-table-head-line-height", group: "font", light: "25px", dark: "25px", valueType: "length", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-font-markdown-table-line-height", group: "font", light: "25px", dark: "25px", valueType: "length", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-font-s-14", group: "font", light: "14px/22px var(--dsw-font-family)", dark: "14px/22px var(--dsw-font-family)", valueType: "string", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-font-s-14-font-family", group: "font", light: "var(--dsw-font-family)", dark: "var(--dsw-font-family)", valueType: "string", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-font-s-14-font-size", group: "font", light: "14px", dark: "14px", valueType: "length", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-font-s-14-font-style", group: "font", light: "normal", dark: "normal", valueType: "string", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-font-s-14-font-weight", group: "font", light: "400", dark: "400", valueType: "number", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-font-s-14-line-height", group: "font", light: "22px", dark: "22px", valueType: "length", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-font-s-strong-14", group: "font", light: "500 14px/22px var(--dsw-font-family)", dark: "500 14px/22px var(--dsw-font-family)", valueType: "string", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-font-s-strong-14-font-family", group: "font", light: "var(--dsw-font-family)", dark: "var(--dsw-font-family)", valueType: "string", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-font-s-strong-14-font-size", group: "font", light: "14px", dark: "14px", valueType: "length", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-font-s-strong-14-font-style", group: "font", light: "normal", dark: "normal", valueType: "string", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-font-s-strong-14-font-weight", group: "font", light: "500", dark: "500", valueType: "number", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-font-s-strong-14-line-height", group: "font", light: "22px", dark: "22px", valueType: "length", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-font-xl-24", group: "font", light: "600 24px/32px var(--dsw-font-family)", dark: "600 24px/32px var(--dsw-font-family)", valueType: "string", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-font-xl-24-font-family", group: "font", light: "var(--dsw-font-family)", dark: "var(--dsw-font-family)", valueType: "string", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-font-xl-24-font-size", group: "font", light: "24px", dark: "24px", valueType: "length", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-font-xl-24-font-style", group: "font", light: "normal", dark: "normal", valueType: "string", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-font-xl-24-font-weight", group: "font", light: "600", dark: "600", valueType: "number", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-font-xl-24-line-height", group: "font", light: "32px", dark: "32px", valueType: "length", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-font-xs-13", group: "font", light: "13px/20px var(--dsw-font-family)", dark: "13px/20px var(--dsw-font-family)", valueType: "string", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-font-xs-13-font-family", group: "font", light: "var(--dsw-font-family)", dark: "var(--dsw-font-family)", valueType: "string", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-font-xs-13-font-size", group: "font", light: "13px", dark: "13px", valueType: "length", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-font-xs-13-font-style", group: "font", light: "normal", dark: "normal", valueType: "string", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-font-xs-13-font-weight", group: "font", light: "400", dark: "400", valueType: "number", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-font-xs-13-line-height", group: "font", light: "20px", dark: "20px", valueType: "length", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-font-xs-strong-13", group: "font", light: "500 13px/20px var(--dsw-font-family)", dark: "500 13px/20px var(--dsw-font-family)", valueType: "string", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-font-xs-strong-13-font-family", group: "font", light: "var(--dsw-font-family)", dark: "var(--dsw-font-family)", valueType: "string", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-font-xs-strong-13-font-size", group: "font", light: "13px", dark: "13px", valueType: "length", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-font-xs-strong-13-font-style", group: "font", light: "normal", dark: "normal", valueType: "string", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-font-xs-strong-13-font-weight", group: "font", light: "500", dark: "500", valueType: "number", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-font-xs-strong-13-line-height", group: "font", light: "20px", dark: "20px", valueType: "length", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-font-xxs-12", group: "font", light: "12px/18px var(--dsw-font-family)", dark: "12px/18px var(--dsw-font-family)", valueType: "string", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-font-xxs-12-font-family", group: "font", light: "var(--dsw-font-family)", dark: "var(--dsw-font-family)", valueType: "string", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-font-xxs-12-font-size", group: "font", light: "12px", dark: "12px", valueType: "length", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-font-xxs-12-font-style", group: "font", light: "normal", dark: "normal", valueType: "string", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-font-xxs-12-font-weight", group: "font", light: "400", dark: "400", valueType: "number", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-font-xxs-12-line-height", group: "font", light: "18px", dark: "18px", valueType: "length", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-font-xxs-strong-12", group: "font", light: "500 12px/18px var(--dsw-font-family)", dark: "500 12px/18px var(--dsw-font-family)", valueType: "string", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-font-xxs-strong-12-font-family", group: "font", light: "var(--dsw-font-family)", dark: "var(--dsw-font-family)", valueType: "string", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-font-xxs-strong-12-font-size", group: "font", light: "12px", dark: "12px", valueType: "length", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-font-xxs-strong-12-font-style", group: "font", light: "normal", dark: "normal", valueType: "string", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-font-xxs-strong-12-font-weight", group: "font", light: "500", dark: "500", valueType: "number", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-font-xxs-strong-12-line-height", group: "font", light: "18px", dark: "18px", valueType: "length", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-font-xxxs-11", group: "font", light: "11px/14px var(--dsw-font-family)", dark: "11px/14px var(--dsw-font-family)", valueType: "string", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-font-xxxs-11-font-family", group: "font", light: "var(--dsw-font-family)", dark: "var(--dsw-font-family)", valueType: "string", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-font-xxxs-11-font-size", group: "font", light: "11px", dark: "11px", valueType: "length", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-font-xxxs-11-font-style", group: "font", light: "normal", dark: "normal", valueType: "string", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-font-xxxs-11-font-weight", group: "font", light: "400", dark: "400", valueType: "number", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-font-xxxs-11-line-height", group: "font", light: "14px", dark: "14px", valueType: "length", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-font-xxxs-strong-11", group: "font", light: "500 11px/14px var(--dsw-font-family)", dark: "500 11px/14px var(--dsw-font-family)", valueType: "string", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-font-xxxs-strong-11-font-family", group: "font", light: "var(--dsw-font-family)", dark: "var(--dsw-font-family)", valueType: "string", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-font-xxxs-strong-11-font-size", group: "font", light: "11px", dark: "11px", valueType: "length", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-font-xxxs-strong-11-font-style", group: "font", light: "normal", dark: "normal", valueType: "string", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-font-xxxs-strong-11-font-weight", group: "font", light: "500", dark: "500", valueType: "number", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-font-xxxs-strong-11-line-height", group: "font", light: "14px", dark: "14px", valueType: "length", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-linear-gradient-think", group: "gradient", light: "linear-gradient(180deg, #fff 20.19%, rgba(255, 255, 255, 0) 100%)", dark: "linear-gradient(180deg, #151517 20.19%, rgba(21, 21, 23, 0) 100%)", valueType: "string", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-linear-think-select", group: "other", light: "linear-gradient(180deg, #f5f6f7 20.19%, rgba(245, 246, 247, 0) 100%)", dark: "linear-gradient(180deg, #232325 20.19%, rgba(35, 35, 37, 0) 100%)", valueType: "string", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-mask-blur", group: "gradient", light: "blur(2px)", dark: "blur(2px)", valueType: "string", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-shadow-lv1", group: "shadow", light: "0 2px 4px 0 rgba(0, 0, 0, 0.05)", dark: "0 2px 4px 0 rgba(0, 0, 0, 0.05)", valueType: "string", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-shadow-lv1-blur", group: "shadow", light: "0 4px 12px 0 rgba(0, 0, 0, 0.02)", dark: "0 4px 12px 0 rgba(0, 0, 0, 0.02)", valueType: "string", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-shadow-lv2", group: "shadow", light: "0 4px 12px 0 rgba(0, 0, 0, 0.02), 0 2px 8px 0 rgba(0, 0, 0, 0.04)", dark: "0 4px 12px 0 rgba(0, 0, 0, 0.02), 0 2px 8px 0 rgba(0, 0, 0, 0.04)", valueType: "string", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-shadow-lv3", group: "shadow", light: "0 0 1px 0 rgba(0, 0, 0, 0.2), 0 0 4px 0 rgba(0, 0, 0, 0.02), 0 12px 32px 0 rgba(0, 0, 0, 0.08)", dark: "0 0 1px 0 rgba(0, 0, 0, 0.2), 0 0 4px 0 rgba(0, 0, 0, 0.02), 0 12px 32px 0 rgba(0, 0, 0, 0.08)", valueType: "string", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-specific-bubble", group: "specific", light: "var(--dsw-static-deepseek-50)", dark: "var(--dsw-static-neutral-bluish-850)", valueType: "string", safety: "caution", scope: "regional", description: "" },
  { name: "--dsw-specific-bubble-highlight", group: "specific", light: "var(--dsw-static-deepseek-200)", dark: "var(--dsw-static-neutral-bluish-750)", valueType: "string", safety: "caution", scope: "regional", description: "" },
  { name: "--dsw-specific-input-major", group: "specific", light: "var(--dsw-static-neutral-bluish-00)", dark: "var(--dsw-static-neutral-bluish-850)", valueType: "string", safety: "caution", scope: "regional", description: "" },
  { name: "--dsw-specific-login-input", group: "specific", light: "var(--dsw-static-neutral-bluish-50)", dark: "var(--dsw-static-neutral-bluish-900)", valueType: "string", safety: "caution", scope: "regional", description: "" },
  { name: "--dsw-specific-menu", group: "specific", light: "var(--dsw-alias-bg-layer-3)", dark: "var(--dsw-alias-bg-layer-3)", valueType: "string", safety: "caution", scope: "regional", description: "" },
  { name: "--dsw-specific-selector", group: "specific", light: "var(--dsw-static-neutral-bluish-60)", dark: "var(--dsw-static-neutral-bluish-800)", valueType: "string", safety: "caution", scope: "regional", description: "" },
  { name: "--dsw-specific-sidebar-fill", group: "specific", light: "var(--dsw-static-neutral-bluish-50)", dark: "var(--dsw-static-neutral-bluish-900)", valueType: "string", safety: "caution", scope: "regional", description: "" },
  { name: "--dsw-specific-sidebar-nav-item-active", group: "specific", light: "var(--dsw-static-neutral-bluish-100)", dark: "var(--dsw-static-neutral-bluish-750)", valueType: "string", safety: "caution", scope: "regional", description: "" },
  { name: "--dsw-specific-sidebar-nav-item-active-accent", group: "specific", light: "var(--dsw-static-deepseek-100)", dark: "var(--dsw-static-neutral-bluish-800)", valueType: "string", safety: "caution", scope: "regional", description: "" },
  { name: "--dsw-specific-sidebar-nav-item-hover", group: "specific", light: "var(--dsw-static-neutral-bluish-75)", dark: "var(--dsw-static-neutral-bluish-850)", valueType: "string", safety: "caution", scope: "regional", description: "" },
  { name: "--dsw-specific-tip", group: "specific", light: "var(--dsw-static-neutral-bluish-60)", dark: "var(--dsw-static-neutral-bluish-800)", valueType: "string", safety: "caution", scope: "regional", description: "" },
  { name: "--dsw-static-amber-100", group: "static", light: "rgb(254, 245, 231)", dark: "rgb(254, 245, 231)", valueType: "color", safety: "caution", scope: "local", description: "" },
  { name: "--dsw-static-amber-400", group: "static", light: "rgb(247, 173, 49)", dark: "rgb(247, 173, 49)", valueType: "color", safety: "caution", scope: "local", description: "" },
  { name: "--dsw-static-amber-500", group: "static", light: "rgb(245, 158, 11)", dark: "rgb(245, 158, 11)", valueType: "color", safety: "caution", scope: "local", description: "" },
  { name: "--dsw-static-amber-600", group: "static", light: "rgb(221, 134, 41)", dark: "rgb(221, 134, 41)", valueType: "color", safety: "caution", scope: "local", description: "" },
  { name: "--dsw-static-amber-900", group: "static", light: "rgb(39, 36, 31)", dark: "rgb(39, 36, 31)", valueType: "color", safety: "caution", scope: "local", description: "" },
  { name: "--dsw-static-blue-100", group: "static", light: "rgb(219, 234, 254)", dark: "rgb(219, 234, 254)", valueType: "color", safety: "caution", scope: "local", description: "" },
  { name: "--dsw-static-blue-300", group: "static", light: "rgb(147, 197, 253)", dark: "rgb(147, 197, 253)", valueType: "color", safety: "caution", scope: "local", description: "" },
  { name: "--dsw-static-blue-400", group: "static", light: "rgb(96, 165, 250)", dark: "rgb(96, 165, 250)", valueType: "color", safety: "caution", scope: "local", description: "" },
  { name: "--dsw-static-blue-450", group: "static", light: "rgb(77, 147, 248)", dark: "rgb(77, 147, 248)", valueType: "color", safety: "caution", scope: "local", description: "" },
  { name: "--dsw-static-blue-50", group: "static", light: "rgb(239, 246, 255)", dark: "rgb(239, 246, 255)", valueType: "color", safety: "caution", scope: "local", description: "" },
  { name: "--dsw-static-blue-500", group: "static", light: "rgb(59, 130, 246)", dark: "rgb(59, 130, 246)", valueType: "color", safety: "caution", scope: "local", description: "" },
  { name: "--dsw-static-blue-50p", group: "static", light: "rgb(234, 243, 255)", dark: "rgb(234, 243, 255)", valueType: "color", safety: "caution", scope: "local", description: "" },
  { name: "--dsw-static-blue-600", group: "static", light: "rgb(37, 99, 235)", dark: "rgb(37, 99, 235)", valueType: "color", safety: "caution", scope: "local", description: "" },
  { name: "--dsw-static-blue-75", group: "static", light: "rgb(229, 240, 255)", dark: "rgb(229, 240, 255)", valueType: "color", safety: "caution", scope: "local", description: "" },
  { name: "--dsw-static-blue-800", group: "static", light: "rgb(30, 64, 175)", dark: "rgb(30, 64, 175)", valueType: "color", safety: "caution", scope: "local", description: "" },
  { name: "--dsw-static-blue-900", group: "static", light: "rgb(14, 48, 116)", dark: "rgb(14, 48, 116)", valueType: "color", safety: "caution", scope: "local", description: "" },
  { name: "--dsw-static-blue-950", group: "static", light: "rgb(23, 37, 84)", dark: "rgb(23, 37, 84)", valueType: "color", safety: "caution", scope: "local", description: "" },
  { name: "--dsw-static-deepseek-100", group: "static", light: "rgb(228, 237, 253)", dark: "rgb(228, 237, 253)", valueType: "color", safety: "caution", scope: "local", description: "" },
  { name: "--dsw-static-deepseek-200", group: "static", light: "rgb(211, 226, 255)", dark: "rgb(211, 226, 255)", valueType: "color", safety: "caution", scope: "local", description: "" },
  { name: "--dsw-static-deepseek-300", group: "static", light: "rgb(183, 200, 254)", dark: "rgb(183, 200, 254)", valueType: "color", safety: "caution", scope: "local", description: "" },
  { name: "--dsw-static-deepseek-400", group: "static", light: "rgb(103, 158, 254)", dark: "rgb(103, 158, 254)", valueType: "color", safety: "caution", scope: "local", description: "" },
  { name: "--dsw-static-deepseek-450", group: "static", light: "rgb(86, 134, 254)", dark: "rgb(86, 134, 254)", valueType: "color", safety: "caution", scope: "local", description: "" },
  { name: "--dsw-static-deepseek-50", group: "static", light: "rgb(237, 243, 254)", dark: "rgb(237, 243, 254)", valueType: "color", safety: "caution", scope: "local", description: "" },
  { name: "--dsw-static-deepseek-500", group: "static", light: "rgb(65, 118, 230)", dark: "rgb(65, 118, 230)", valueType: "color", safety: "caution", scope: "local", description: "" },
  { name: "--dsw-static-deepseek-600", group: "static", light: "rgb(72, 104, 178)", dark: "rgb(72, 104, 178)", valueType: "color", safety: "caution", scope: "local", description: "" },
  { name: "--dsw-static-deepseek-700-delete", group: "static", light: "rgb(47, 76, 143)", dark: "rgb(47, 76, 143)", valueType: "color", safety: "caution", scope: "local", description: "" },
  { name: "--dsw-static-deepseek-800", group: "static", light: "rgb(52, 65, 91)", dark: "rgb(52, 65, 91)", valueType: "color", safety: "caution", scope: "local", description: "" },
  { name: "--dsw-static-deepseek-900", group: "static", light: "rgb(40, 49, 66)", dark: "rgb(40, 49, 66)", valueType: "color", safety: "caution", scope: "local", description: "" },
  { name: "--dsw-static-green-100", group: "static", light: "rgb(230, 250, 237)", dark: "rgb(230, 250, 237)", valueType: "color", safety: "caution", scope: "local", description: "" },
  { name: "--dsw-static-green-400", group: "static", light: "rgb(78, 209, 126)", dark: "rgb(78, 209, 126)", valueType: "color", safety: "caution", scope: "local", description: "" },
  { name: "--dsw-static-green-500", group: "static", light: "rgb(34, 197, 94)", dark: "rgb(34, 197, 94)", valueType: "color", safety: "caution", scope: "local", description: "" },
  { name: "--dsw-static-green-900", group: "static", light: "rgb(35, 60, 44)", dark: "rgb(35, 60, 44)", valueType: "color", safety: "caution", scope: "local", description: "" },
  { name: "--dsw-static-neutral-00", group: "static", light: "rgb(255, 255, 255)", dark: "rgb(255, 255, 255)", valueType: "color", safety: "caution", scope: "local", description: "" },
  { name: "--dsw-static-neutral-100", group: "static", light: "rgb(245, 245, 245)", dark: "rgb(245, 245, 245)", valueType: "color", safety: "caution", scope: "local", description: "" },
  { name: "--dsw-static-neutral-1000", group: "static", light: "rgb(0, 0, 0)", dark: "rgb(0, 0, 0)", valueType: "color", safety: "caution", scope: "local", description: "" },
  { name: "--dsw-static-neutral-150", group: "static", light: "rgb(237, 237, 237)", dark: "rgb(237, 237, 237)", valueType: "color", safety: "caution", scope: "local", description: "" },
  { name: "--dsw-static-neutral-200", group: "static", light: "rgb(229, 229, 229)", dark: "rgb(229, 229, 229)", valueType: "color", safety: "caution", scope: "local", description: "" },
  { name: "--dsw-static-neutral-250", group: "static", light: "rgb(220, 220, 220)", dark: "rgb(220, 220, 220)", valueType: "color", safety: "caution", scope: "local", description: "" },
  { name: "--dsw-static-neutral-300", group: "static", light: "rgb(212, 212, 212)", dark: "rgb(212, 212, 212)", valueType: "color", safety: "caution", scope: "local", description: "" },
  { name: "--dsw-static-neutral-400", group: "static", light: "rgb(162, 164, 166)", dark: "rgb(162, 164, 166)", valueType: "color", safety: "caution", scope: "local", description: "" },
  { name: "--dsw-static-neutral-50", group: "static", light: "rgb(250, 250, 250)", dark: "rgb(250, 250, 250)", valueType: "color", safety: "caution", scope: "local", description: "" },
  { name: "--dsw-static-neutral-500", group: "static", light: "rgb(127, 130, 135)", dark: "rgb(127, 130, 135)", valueType: "color", safety: "caution", scope: "local", description: "" },
  { name: "--dsw-static-neutral-550", group: "static", light: "rgb(101, 103, 107)", dark: "rgb(101, 103, 107)", valueType: "color", safety: "caution", scope: "local", description: "" },
  { name: "--dsw-static-neutral-600", group: "static", light: "rgb(84, 85, 87)", dark: "rgb(84, 85, 87)", valueType: "color", safety: "caution", scope: "local", description: "" },
  { name: "--dsw-static-neutral-700", group: "static", light: "rgb(60, 60, 61)", dark: "rgb(60, 60, 61)", valueType: "color", safety: "caution", scope: "local", description: "" },
  { name: "--dsw-static-neutral-800", group: "static", light: "rgb(41, 41, 41)", dark: "rgb(41, 41, 41)", valueType: "color", safety: "caution", scope: "local", description: "" },
  { name: "--dsw-static-neutral-850", group: "static", light: "rgb(33, 33, 35)", dark: "rgb(33, 33, 35)", valueType: "color", safety: "caution", scope: "local", description: "" },
  { name: "--dsw-static-neutral-900", group: "static", light: "rgb(15, 15, 15)", dark: "rgb(15, 15, 15)", valueType: "color", safety: "caution", scope: "local", description: "" },
  { name: "--dsw-static-neutral-bluish-00", group: "static", light: "rgb(255, 255, 255)", dark: "rgb(255, 255, 255)", valueType: "color", safety: "caution", scope: "local", description: "" },
  { name: "--dsw-static-neutral-bluish-100", group: "static", light: "rgb(235, 238, 242)", dark: "rgb(235, 238, 242)", valueType: "color", safety: "caution", scope: "local", description: "" },
  { name: "--dsw-static-neutral-bluish-1000", group: "static", light: "rgb(15, 17, 21)", dark: "rgb(15, 17, 21)", valueType: "color", safety: "caution", scope: "local", description: "" },
  { name: "--dsw-static-neutral-bluish-150", group: "static", light: "rgb(233, 236, 242)", dark: "rgb(233, 236, 242)", valueType: "color", safety: "caution", scope: "local", description: "" },
  { name: "--dsw-static-neutral-bluish-200", group: "static", light: "rgb(225, 229, 238)", dark: "rgb(225, 229, 238)", valueType: "color", safety: "caution", scope: "local", description: "" },
  { name: "--dsw-static-neutral-bluish-300", group: "static", light: "rgb(207, 211, 214)", dark: "rgb(207, 211, 214)", valueType: "color", safety: "caution", scope: "local", description: "" },
  { name: "--dsw-static-neutral-bluish-400", group: "static", light: "rgb(173, 178, 184)", dark: "rgb(173, 178, 184)", valueType: "color", safety: "caution", scope: "local", description: "" },
  { name: "--dsw-static-neutral-bluish-50", group: "static", light: "rgb(249, 250, 251)", dark: "rgb(249, 250, 251)", valueType: "color", safety: "caution", scope: "local", description: "" },
  { name: "--dsw-static-neutral-bluish-500", group: "static", light: "rgb(151, 157, 166)", dark: "rgb(151, 157, 166)", valueType: "color", safety: "caution", scope: "local", description: "" },
  { name: "--dsw-static-neutral-bluish-60", group: "static", light: "rgb(245, 246, 247)", dark: "rgb(245, 246, 247)", valueType: "color", safety: "caution", scope: "local", description: "" },
  { name: "--dsw-static-neutral-bluish-600", group: "static", light: "rgb(129, 133, 140)", dark: "rgb(129, 133, 140)", valueType: "color", safety: "caution", scope: "local", description: "" },
  { name: "--dsw-static-neutral-bluish-700", group: "static", light: "rgb(97, 102, 107)", dark: "rgb(97, 102, 107)", valueType: "color", safety: "caution", scope: "local", description: "" },
  { name: "--dsw-static-neutral-bluish-75", group: "static", light: "rgb(241, 243, 245)", dark: "rgb(241, 243, 245)", valueType: "color", safety: "caution", scope: "local", description: "" },
  { name: "--dsw-static-neutral-bluish-750", group: "static", light: "rgb(67, 69, 74)", dark: "rgb(67, 69, 74)", valueType: "color", safety: "caution", scope: "local", description: "" },
  { name: "--dsw-static-neutral-bluish-800", group: "static", light: "rgb(53, 54, 56)", dark: "rgb(53, 54, 56)", valueType: "color", safety: "caution", scope: "local", description: "" },
  { name: "--dsw-static-neutral-bluish-850", group: "static", light: "rgb(44, 44, 46)", dark: "rgb(44, 44, 46)", valueType: "color", safety: "caution", scope: "local", description: "" },
  { name: "--dsw-static-neutral-bluish-875", group: "static", light: "rgb(35, 35, 36)", dark: "rgb(35, 35, 36)", valueType: "color", safety: "caution", scope: "local", description: "" },
  { name: "--dsw-static-neutral-bluish-900", group: "static", light: "rgb(27, 27, 28)", dark: "rgb(27, 27, 28)", valueType: "color", safety: "caution", scope: "local", description: "" },
  { name: "--dsw-static-neutral-bluish-950", group: "static", light: "rgb(21, 21, 23)", dark: "rgb(21, 21, 23)", valueType: "color", safety: "caution", scope: "local", description: "" },
  { name: "--dsw-static-red-100", group: "static", light: "rgb(254, 226, 226)", dark: "rgb(254, 226, 226)", valueType: "color", safety: "caution", scope: "local", description: "" },
  { name: "--dsw-static-red-400", group: "static", light: "rgb(242, 90, 90)", dark: "rgb(242, 90, 90)", valueType: "color", safety: "caution", scope: "local", description: "" },
  { name: "--dsw-static-red-50", group: "static", light: "rgb(254, 242, 242)", dark: "rgb(254, 242, 242)", valueType: "color", safety: "caution", scope: "local", description: "" },
  { name: "--dsw-static-red-500", group: "static", light: "rgb(239, 68, 68)", dark: "rgb(239, 68, 68)", valueType: "color", safety: "caution", scope: "local", description: "" },
  { name: "--dsw-static-red-600", group: "static", light: "rgb(236, 19, 19)", dark: "rgb(236, 19, 19)", valueType: "color", safety: "caution", scope: "local", description: "" },
  { name: "--dsw-static-red-900", group: "static", light: "rgb(87, 12, 12)", dark: "rgb(87, 12, 12)", valueType: "color", safety: "caution", scope: "local", description: "" },
  { name: "--shiki-background", group: "shiki", light: "var(--dsw-alias-markdown-code-block)", dark: "var(--dsw-alias-markdown-code-block)", valueType: "string", safety: "caution", scope: "local", description: "" },
  { name: "--shiki-foreground", group: "shiki", light: "var(--dsw-alias-label-primary)", dark: "var(--dsw-alias-label-primary)", valueType: "string", safety: "caution", scope: "local", description: "" },
  { name: "--shiki-token-comment", group: "shiki", light: "#868e96", dark: "#adb5bd", valueType: "color", safety: "caution", scope: "local", description: "" },
  { name: "--shiki-token-constant", group: "shiki", light: "#1c7ed6", dark: "#4dabf7", valueType: "color", safety: "caution", scope: "local", description: "" },
  { name: "--shiki-token-function", group: "shiki", light: "#6741d9", dark: "#b197fc", valueType: "color", safety: "caution", scope: "local", description: "" },
  { name: "--shiki-token-keyword", group: "shiki", light: "#d6336c", dark: "#faa2c1", valueType: "color", safety: "caution", scope: "local", description: "" },
  { name: "--shiki-token-link", group: "shiki", light: "#1971c2", dark: "#74c0fc", valueType: "color", safety: "caution", scope: "local", description: "" },
  { name: "--shiki-token-parameter", group: "shiki", light: "#e8590c", dark: "#ffa94d", valueType: "color", safety: "caution", scope: "local", description: "" },
  { name: "--shiki-token-punctuation", group: "shiki", light: "#495057", dark: "#ced4da", valueType: "color", safety: "caution", scope: "local", description: "" },
  { name: "--shiki-token-string", group: "shiki", light: "#2f9e44", dark: "#69db7c", valueType: "color", safety: "caution", scope: "local", description: "" },
  { name: "--shiki-token-string-expression", group: "shiki", light: "#2b8a3e", dark: "#8ce99a", valueType: "color", safety: "caution", scope: "local", description: "" }
];

// src/core/catalog-extra.ts
var CATALOG_EXTRA = [
  { name: "--dsw-alias-bg-document-preview", group: "alias-bg", light: "var(--dsw-static-neutral-bluish-100)", dark: "var(--dsw-static-neutral-bluish-950)", valueType: "string", safety: "safe", scope: "global", description: "" },
  { name: "--dsw-alias-bg-document-selection", group: "alias-bg", light: "color-mix(in srgb, var(--dsw-static-blue-500) 40%, transparent)", dark: "color-mix(in srgb, var(--dsw-static-blue-500) 40%, transparent)", valueType: "string", safety: "safe", scope: "global", description: "" },
  { name: "--dsw-alias-code-diff-added", group: "other", light: "var(--dsw-static-green-500-a08)", dark: "var(--dsw-static-green-500-a12)", valueType: "string", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-alias-code-diff-deleted", group: "other", light: "var(--dsw-static-red-600-a08)", dark: "var(--dsw-static-red-400-a12)", valueType: "string", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-alias-file-diff-added-bg", group: "other", light: "#e6f4e7", dark: "#1f3124", valueType: "color", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-alias-file-diff-added-gutter", group: "other", light: "#edf7ed", dark: "#132016", valueType: "color", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-alias-file-diff-added-marker", group: "other", light: "#01a241", dark: "#41c977", valueType: "color", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-alias-file-diff-deleted-bg", group: "other", light: "#fce6e2", dark: "#3c1f1b", valueType: "color", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-alias-file-diff-deleted-gutter", group: "other", light: "#fdece9", dark: "#28130e", valueType: "color", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-alias-file-diff-deleted-marker", group: "other", light: "#ba2723", dark: "#fa423e", valueType: "color", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-alias-label-deep-diving", group: "alias-label", light: "color-mix(in srgb, var(--dsw-static-deepseek-500) 70%, var(--dsw-static-blue-950))", dark: "color-mix(in srgb, var(--dsw-static-deepseek-450) 55%, var(--dsw-static-neutral-bluish-400))", valueType: "string", safety: "safe", scope: "global", description: "" },
  { name: "--dsw-alias-label-deep-diving-shimmer", group: "alias-label", light: "color-mix(in srgb, var(--dsw-static-deepseek-500) 30%, var(--dsw-static-blue-950))", dark: "color-mix(in srgb, var(--dsw-static-blue-300) 65%, var(--dsw-static-deepseek-400))", valueType: "string", safety: "safe", scope: "global", description: "" },
  { name: "--dsw-alias-label-document-preview", group: "alias-label", light: "var(--dsw-static-neutral-bluish-700)", dark: "var(--dsw-static-neutral-bluish-300)", valueType: "string", safety: "safe", scope: "global", description: "" },
  { name: "--dsw-alias-label-shimmer", group: "alias-label", light: "color-mix(in srgb, var(--dsw-static-neutral-1000) 30%, transparent)", dark: "color-mix(in srgb, var(--dsw-static-neutral-00) 45%, transparent)", valueType: "string", safety: "safe", scope: "global", description: "" },
  { name: "--dsw-alias-link", group: "other", light: "var(--dsw-static-deepseek-500)", dark: "var(--dsw-static-deepseek-400)", valueType: "string", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-alias-menu-group-header-fill", group: "other", light: "#f8f9faf0", dark: "#303136f0", valueType: "color", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-alias-menu-icon", group: "other", light: "var(--dsw-static-neutral-bluish-800)", dark: "var(--dsw-alias-label-primary-dimmed)", valueType: "string", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-alias-onboarding-accent", group: "other", light: "#3964fe", dark: "#3964fe", valueType: "color", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-alias-onboarding-card-fill", group: "other", light: "color-mix(in srgb, var(--dsw-static-neutral-bluish-00) 80%, transparent)", dark: "color-mix(in srgb, var(--dsw-static-neutral-bluish-850) 80%, transparent)", valueType: "string", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-alias-onboarding-checkbox-border", group: "alias-border", light: "color-mix(in srgb, var(--dsw-static-neutral-bluish-1000) 20%, transparent)", dark: "var(--dsw-alias-border-l2)", valueType: "string", safety: "safe", scope: "global", description: "" },
  { name: "--dsw-alias-onboarding-secondary-fill", group: "other", light: "var(--dsw-static-neutral-bluish-00)", dark: "#48494c", valueType: "string", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-alias-settings-card-fill", group: "alias-settings", light: "var(--dsw-alias-bg-layer-2)", dark: "var(--dsw-alias-bg-layer-2)", valueType: "string", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-alias-settings-card-stroke", group: "alias-settings", light: "var(--dsw-alias-border-l4)", dark: "var(--dsw-alias-border-l4)", valueType: "string", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-alias-state-idle-primary", group: "alias-state", light: "var(--dsw-static-neutral-300)", dark: "var(--dsw-static-neutral-600)", valueType: "string", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-alias-switch-thumb", group: "other", light: "var(--dsw-static-neutral-bluish-00)", dark: "var(--dsw-static-neutral-bluish-400)", valueType: "string", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-alias-toast-label", group: "alias-label", light: "var(--dsw-static-neutral-bluish-00)", dark: "var(--dsw-static-neutral-bluish-00)", valueType: "string", safety: "safe", scope: "global", description: "" },
  { name: "--dsw-alias-tooltip-key-bg", group: "alias-overlay", light: "color-mix(in srgb, var(--dsw-alias-tooltip-bg), white 18%)", dark: "color-mix(in srgb, var(--dsw-alias-tooltip-bg), white 18%)", valueType: "string", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-alias-turn-trigger-bg", group: "other", light: "var(--dsw-alias-markdown-code-block)", dark: "var(--dsw-alias-interactive-bg-hover)", valueType: "string", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-alias-turn-trigger-bg-hover", group: "alias-bg", light: "var(--dsw-alias-interactive-bg-hover)", dark: "var(--dsw-alias-interactive-bg-active)", valueType: "string", safety: "safe", scope: "global", description: "" },
  { name: "--dsw-corner-shape", group: "radius", light: "superellipse(1.5)", dark: "superellipse(1.5)", valueType: "string", safety: "caution", scope: "global", description: "" },
  { name: "--dsw-elevation-panel", group: "other", light: "var(--dsw-elevation-stroke), 0 3px 8px 0 #00000008, 0 0 16px 0 #00000005", dark: "var(--dsw-elevation-stroke), 0 3px 8px 0 #00000008, 0 0 16px 0 #00000005", valueType: "string", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-elevation-prominent", group: "other", light: "var(--dsw-elevation-stroke), 0 3px 8px 0 #0000000a, 0 0 20px 0 #0000000d", dark: "var(--dsw-elevation-stroke), 0 3px 8px 0 #0000000a, 0 0 20px 0 #0000000d", valueType: "string", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-elevation-soft", group: "other", light: "var(--dsw-elevation-stroke), 0 4px 16px 0 #00000008, 0 0 24px 0 #00000008", dark: "var(--dsw-elevation-stroke), 0 4px 16px 0 #00000008, 0 0 24px 0 #00000008", valueType: "string", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-elevation-stroke", group: "other", light: "0 0 0 .5px var(--dsw-elevation-stroke-color)", dark: "0 0 0 .5px var(--dsw-elevation-stroke-color)", valueType: "string", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-elevation-stroke-color", group: "other", light: "var(--dsw-alias-border-l4)", dark: "var(--dsw-alias-border-l3)", valueType: "string", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-focus-ring-color", group: "other", light: "transparent", dark: "transparent", valueType: "string", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-focus-ring-width", group: "other", light: "2px", dark: "2px", valueType: "length", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-font-family-brand", group: "font", light: '"Montserrat", var(--dsh-font-family-text-default)', dark: '"Montserrat", var(--dsh-font-family-text-default)', valueType: "string", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-gradient-onboarding-blue-stops", group: "other", light: "#3964fe 18.75%, #398efe 51.78%, #6dccff 86.252%, #3964fe", dark: "#3964fe 18.75%, #398efe 51.78%, #6dccff 86.252%, #3964fe", valueType: "string", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-gradient-onboarding-cyan-stops", group: "other", light: "#0293b4 21.154%, #2dc8eb 50.954%, #aff0ff 85.326%, #0293b4", dark: "#0293b4 21.154%, #2dc8eb 50.954%, #aff0ff 85.326%, #0293b4", valueType: "string", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-gradient-onboarding-violet-stops", group: "other", light: "#2a2fb6 33.102%, #8b76f6 50.954%, #c5c0ff 85.326%, #2a2fb6", dark: "#2a2fb6 33.102%, #8b76f6 50.954%, #c5c0ff 85.326%, #2a2fb6", valueType: "string", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-menu-backdrop-filter", group: "other", light: "blur(40px) saturate(150%)", dark: "blur(40px) saturate(150%)", valueType: "string", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-menu-surface-fill", group: "other", light: "#f8f9fa94", dark: "#43454a73", valueType: "color", safety: "safe", scope: "local", description: "" },
  { name: "--dsw-radius-lg", group: "radius", light: "16px", dark: "16px", valueType: "length", safety: "caution", scope: "global", description: "" },
  { name: "--dsw-radius-md", group: "radius", light: "12px", dark: "12px", valueType: "length", safety: "caution", scope: "global", description: "" },
  { name: "--dsw-radius-panel", group: "radius", light: "28px", dark: "28px", valueType: "length", safety: "caution", scope: "global", description: "" },
  { name: "--dsw-radius-sm", group: "radius", light: "8px", dark: "8px", valueType: "length", safety: "caution", scope: "global", description: "" },
  { name: "--dsw-radius-xl", group: "radius", light: "20px", dark: "20px", valueType: "length", safety: "caution", scope: "global", description: "" },
  { name: "--dsw-radius-xs", group: "radius", light: "4px", dark: "4px", valueType: "length", safety: "caution", scope: "global", description: "" },
  { name: "--dsw-static-green-500-a08", group: "static", light: "#22c55e14", dark: "#22c55e14", valueType: "color", safety: "caution", scope: "local", description: "" },
  { name: "--dsw-static-green-500-a12", group: "static", light: "#22c55e1f", dark: "#22c55e1f", valueType: "color", safety: "caution", scope: "local", description: "" },
  { name: "--dsw-static-red-400-a12", group: "static", light: "#f25a5a1f", dark: "#f25a5a1f", valueType: "color", safety: "caution", scope: "local", description: "" },
  { name: "--dsw-static-red-600-a08", group: "static", light: "#ec131314", dark: "#ec131314", valueType: "color", safety: "caution", scope: "local", description: "" }
];

// src/core/catalog.ts
var mergedEntries = (() => {
  const seen = new Set(CATALOG.map((entry) => entry.name));
  const extra = CATALOG_EXTRA.filter((entry) => !seen.has(entry.name));
  const normalize = (entry) => {
    if (entry.group === "other" && (entry.name.includes("transition") || entry.name.includes("ease"))) {
      return { ...entry, group: "motion" };
    }
    return entry;
  };
  return [...CATALOG, ...extra].map(normalize);
})();
var catalog = {
  dshVersion: CATALOG_DSH_VERSION,
  entries: mergedEntries
};
function findToken(name2) {
  return catalog.entries.find((entry) => entry.name === name2);
}
var GROUP_ORDER = [
  "alias-bg",
  "alias-border",
  "alias-brand",
  "alias-label",
  "alias-button",
  "alias-interactive",
  "alias-state",
  "alias-markdown",
  "alias-scrollbar",
  "alias-overlay",
  "alias-settings",
  "specific",
  "static",
  "font",
  "radius",
  "motion",
  "shadow",
  "gradient",
  "shiki",
  "scrollbar",
  "other"
];

// src/core/token-utils.ts
var MAX_RESOLVE_DEPTH = 8;
var COLOR_PATTERNS = [
  /^#[0-9a-fA-F]{3,8}$/,
  /^rgba?\(/,
  /^hsla?\(/,
  /^(transparent|currentColor|inherit)$/
];
function isColorValue(value) {
  return COLOR_PATTERNS.some((pattern) => pattern.test(value.trim()));
}
function resolveTokenValue(value, scheme = "light") {
  let current = value.trim();
  for (let depth = 0; depth < MAX_RESOLVE_DEPTH; depth += 1) {
    const m = /^var\(\s*(--[\w-]+)/.exec(current);
    if (m === null) return current;
    const entry = findCatalogEntry(m[1]);
    if (entry === void 0) return current;
    const next = (scheme === "dark" ? entry.dark : entry.light).trim();
    if (next === current) return current;
    current = next;
  }
  return current;
}
function isResolvableColor(value, scheme = "light") {
  return isColorValue(resolveTokenValue(value, scheme));
}
function findCatalogEntry(name2) {
  return catalog.entries.find((entry) => entry.name === name2);
}

// src/core/catalog-zh.ts
var GROUP_DESCRIPTIONS = {
  "alias-bg": "\u754C\u9762\u5E95\u8272\u4E0E\u5C42\u6B21\uFF08\u6700\u5E38\u6539\u7684\u7EC4\uFF09",
  "alias-border": "\u8FB9\u6846\u4E0E\u5206\u9694\u7EBF\u989C\u8272",
  "alias-brand": "\u54C1\u724C\u4E3B\u8272\uFF08\u5F3A\u8C03\u8272\u4F53\u7CFB\uFF09",
  "alias-label": "\u6587\u5B57\u989C\u8272\uFF08\u4E3B/\u6B21/\u8F85\u52A9\u4E09\u7EA7\uFF09",
  "alias-button": "\u6309\u94AE\u989C\u8272\uFF08\u586B\u5145/\u60AC\u505C\uFF09",
  "alias-interactive": "\u4EA4\u4E92\u6001\uFF08\u60AC\u505C/\u6FC0\u6D3B\u80CC\u666F\uFF09",
  "alias-state": "\u72B6\u6001\u8272\uFF08\u6210\u529F/\u9519\u8BEF/\u8B66\u544A\uFF09",
  "alias-markdown": "\u5BCC\u6587\u672C/\u4EE3\u7801\u5757\u989C\u8272",
  "alias-overlay": "\u5F39\u5C42/\u63D0\u793A\u6D6E\u5C42",
  "alias-scrollbar": "\u6EDA\u52A8\u6761\u989C\u8272",
  specific: "\u754C\u9762\u7EC4\u4EF6\u4E13\u5C5E\u8272\uFF08\u6C14\u6CE1/\u4FA7\u680F/\u8F93\u5165\u6846\uFF09",
  font: "\u5B57\u4F53\u6392\u5370\uFF08\u4E00\u822C\u4E0D\u7528\u6539\uFF09",
  shadow: "\u9634\u5F71\uFF08\u4E00\u822C\u4E0D\u7528\u6539\uFF09",
  gradient: "\u6E10\u53D8\uFF08\u4E00\u822C\u4E0D\u7528\u6539\uFF09",
  shiki: "\u4EE3\u7801\u9AD8\u4EAE\u914D\u8272",
  scrollbar: "\u6EDA\u52A8\u6761\uFF08\u5BBF\u4E3B\u7EA7\uFF09",
  static: "\u9759\u6001\u8272\u677F\uFF08\u5E95\u5C42\u5F15\u7528\uFF0C\u8C28\u614E\uFF09",
  other: "\u5176\u4ED6"
};
var TOKEN_DESCRIPTIONS = {
  // —— 背景层次 ——
  "--dsw-alias-bg-base": "\u6574\u4E2A\u754C\u9762\u7684\u5E95\u8272\uFF08\u6539\u8FD9\u4E2A = \u6574\u4F53\u6362\u80A4\uFF09",
  "--dsw-alias-bg-layer-1": "\u5361\u7247/\u8F93\u5165\u6846/\u5F39\u5C42\u7684\u6D6E\u51FA\u8272",
  "--dsw-alias-bg-layer-2": "\u66F4\u9AD8\u4E00\u5C42\u7684\u6D6E\u51FA\u8272\uFF08\u8BBE\u7F6E\u9762\u677F\u7B49\uFF09",
  "--dsw-alias-bg-layer-3": "\u518D\u9AD8\u4E00\u5C42\u7684\u6D6E\u51FA\u8272",
  "--dsw-alias-bg-mask-1": "\u906E\u7F69\u5C42\u989C\u8272\uFF08\u5F39\u7A97\u80CC\u540E\u7684\u538B\u6697\uFF09",
  "--dsw-alias-bg-mask-2": "\u6D45\u906E\u7F69",
  "--dsw-alias-bg-mask-3": "\u6DF1\u906E\u7F69",
  "--dsw-alias-bg-overlay": "\u6D6E\u5C42\u5E95\u8272\uFF08\u4E0B\u62C9/\u9009\u62E9\u5668\uFF09",
  "--dsw-alias-bg-skeleton": "\u9AA8\u67B6\u5C4F\u5360\u4F4D\u8272",
  "--dsw-alias-bg-module-platform": "\u5E73\u53F0\u6A21\u5757\u80CC\u666F",
  "--dsw-alias-bg-multi-select": "\u591A\u9009\u63A7\u4EF6\u80CC\u666F",
  "--dsw-alias-bg-mask-photo": "\u56FE\u7247\u4E0A\u6587\u5B57\u7684\u80CC\u666F\u538B\u6697",
  "--dsw-alias-bg-mask-drop": "\u62D6\u62FD\u843D\u533A\u906E\u7F69",
  // —— 品牌 ——
  "--dsw-alias-brand-primary": "\u54C1\u724C\u4E3B\u8272\uFF08\u6309\u94AE/\u94FE\u63A5/\u5F3A\u8C03\uFF0C\u6362\u80A4\u6838\u5FC3\uFF09",
  "--dsw-alias-brand-text": "\u54C1\u724C\u8272\u4E0A\u7684\u6587\u5B57",
  "--dsw-alias-brand-primary-invert": "\u54C1\u724C\u8272\u7684\u53CD\u8272\u53D8\u4F53",
  // —— 文字 ——
  "--dsw-alias-label-primary": "\u4E3B\u6587\u5B57\u989C\u8272\uFF08\u6B63\u6587\uFF09",
  "--dsw-alias-label-secondary": "\u6B21\u8981\u6587\u5B57\uFF08\u8BF4\u660E/\u6807\u9898\uFF09",
  "--dsw-alias-label-tertiary": "\u8F85\u52A9\u6587\u5B57\uFF08\u65F6\u95F4\u6233/\u5360\u4F4D\uFF09",
  "--dsw-alias-label-dimmed": "\u5F31\u5316\u6587\u5B57",
  "--dsw-alias-label-caption": "\u5C0F\u6807\u9898\u6587\u5B57",
  "--dsw-alias-label-primary-foreground": "\u4E3B\u8272\u6309\u94AE\u4E0A\u7684\u6587\u5B57\u989C\u8272",
  "--dsw-alias-label-primary-inverted": "\u53CD\u8272\u573A\u666F\u7684\u4E3B\u6587\u5B57",
  "--dsw-alias-state-warn-label": "\u8B66\u544A\u6587\u5B57\u989C\u8272",
  // —— 按钮 ——
  "--dsw-alias-button-primary-fill": "\u4E3B\u6309\u94AE\u586B\u5145\uFF08\u901A\u5E38=\u54C1\u724C\u8272\uFF09",
  "--dsw-alias-button-primary-hover": "\u4E3B\u6309\u94AE\u60AC\u505C\u8272",
  "--dsw-alias-button-primary-dimmed": "\u4E3B\u6309\u94AE\u5F31\u5316\u6001",
  "--dsw-alias-button-info-fill": "\u4FE1\u606F\u6309\u94AE\u586B\u5145\uFF08\u901A\u5E38=\u54C1\u724C\u8272\uFF09",
  "--dsw-alias-button-info-hover": "\u4FE1\u606F\u6309\u94AE\u60AC\u505C\u8272",
  "--dsw-alias-button-floating-fill": "\u60AC\u6D6E\u6309\u94AE\u586B\u5145",
  "--dsw-alias-button-floating-hover": "\u60AC\u6D6E\u6309\u94AE\u60AC\u505C\u8272",
  "--dsw-alias-button-contrast-fill": "\u5BF9\u6BD4\u6309\u94AE\u586B\u5145",
  "--dsw-alias-button-elevated-fill": "\u51F8\u8D77\u6309\u94AE\u586B\u5145",
  "--dsw-alias-button-ghost-active-fill": "\u5E7D\u7075\u6309\u94AE\u6FC0\u6D3B\u80CC\u666F",
  "--dsw-alias-button-ghost-active-hover": "\u5E7D\u7075\u6309\u94AE\u6FC0\u6D3B\u60AC\u505C",
  "--dsw-alias-button-ghost-active-border": "\u5E7D\u7075\u6309\u94AE\u6FC0\u6D3B\u8FB9\u6846",
  "--dsw-alias-button-tool-bar-fill": "\u5DE5\u5177\u680F\u6309\u94AE\u586B\u5145",
  "--dsw-alias-button-tool-bar-hover": "\u5DE5\u5177\u680F\u6309\u94AE\u60AC\u505C",
  // —— 交互态 ——
  "--dsw-alias-interactive-bg-hover": "\u5217\u8868/\u83DC\u5355\u9879\u60AC\u505C\u80CC\u666F",
  "--dsw-alias-interactive-bg-active": "\u5217\u8868/\u83DC\u5355\u9879\u6FC0\u6D3B\u80CC\u666F",
  "--dsw-alias-interactive-bg-hover-accent": "\u5F3A\u8C03\u60AC\u505C\u80CC\u666F",
  "--dsw-alias-interactive-bg-hover-danger": "\u5371\u9669\u60AC\u505C\u80CC\u666F",
  "--dsw-alias-interactive-bg-hover-solid": "\u5B9E\u5FC3\u60AC\u505C\u80CC\u666F",
  // —— 状态 ——
  "--dsw-alias-state-success-primary": "\u6210\u529F\u72B6\u6001\u8272",
  "--dsw-alias-state-error-primary": "\u9519\u8BEF\u72B6\u6001\u8272",
  "--dsw-alias-state-warn-primary": "\u8B66\u544A\u72B6\u6001\u8272",
  "--dsw-alias-state-warn-secondary": "\u8B66\u544A\u6B21\u8981\u8272",
  "--dsw-alias-state-business-primary": "\u4E1A\u52A1\u5F3A\u8C03\u8272\uFF08\u901A\u5E38=\u54C1\u724C\u8272\uFF09",
  // —— 边框 ——
  "--dsw-alias-border-l1": "\u6700\u6DE1\u5206\u9694\u7EBF",
  "--dsw-alias-border-l2": "\u5E38\u89C4\u8FB9\u6846/\u5206\u9694\u7EBF",
  "--dsw-alias-border-l3": "\u8F83\u6DF1\u8FB9\u6846",
  "--dsw-alias-border-l4": "\u6700\u6DF1\u8FB9\u6846\uFF08\u8F93\u5165\u6846\u805A\u7126\u7B49\uFF09",
  "--dsw-alias-border-inverted": "\u53CD\u8272\u573A\u666F\u8FB9\u6846",
  // —— 组件专属（specific）——
  "--dsw-specific-sidebar-fill": "\u4FA7\u8FB9\u680F\u80CC\u666F\uFF08\u6362\u80A4\u5E38\u6539\uFF09",
  "--dsw-specific-sidebar-nav-item-active": "\u4FA7\u680F\u9009\u4E2D\u9879\u80CC\u666F",
  "--dsw-specific-sidebar-nav-item-active-accent": "\u4FA7\u680F\u9009\u4E2D\u9879\u5F3A\u8C03\u6761",
  "--dsw-specific-bubble": "\u5BF9\u8BDD\u6C14\u6CE1\u80CC\u666F",
  "--dsw-specific-bubble-highlight": "\u9AD8\u4EAE\u6C14\u6CE1\u80CC\u666F",
  "--dsw-specific-input-major": "\u5E95\u90E8\u8F93\u5165\u6846\u80CC\u666F",
  "--dsw-specific-menu": "\u83DC\u5355/\u4E0B\u62C9\u80CC\u666F",
  "--dsw-specific-tip": "\u63D0\u793A\u6C14\u6CE1\u80CC\u666F",
  "--dsw-specific-selector": "\u9009\u62E9\u5668\u80CC\u666F",
  "--dsw-alias-toast-bg": "toast \u63D0\u793A\u80CC\u666F",
  "--dsw-alias-tooltip-bg": "\u5DE5\u5177\u63D0\u793A\u80CC\u666F",
  // —— 滚动条 / 常用 static ——
  "--dsw-alias-scrollbar-bg-l1": "\u6EDA\u52A8\u6761\u8F68\u9053",
  "--dsw-alias-scrollbar-hover-l1": "\u6EDA\u52A8\u6761\u60AC\u505C",
  "--dsw-alias-scrollbar-bg-l2": "\u6EDA\u52A8\u6761\u8F68\u9053\uFF08\u6DF1\uFF09",
  "--dsw-alias-scrollbar-hover-l2": "\u6EDA\u52A8\u6761\u60AC\u505C\uFF08\u6DF1\uFF09",
  "--dsh-scrollbar-width": "\u6EDA\u52A8\u6761\u5BBD\u5EA6",
  "--dsh-scrollbar-thumb": "\u6EDA\u52A8\u6761\u6ED1\u5757",
  "--dsh-scrollbar-thumb-hover": "\u6EDA\u52A8\u6761\u6ED1\u5757\u60AC\u505C",
  // —— 富文本 / 代码 ——
  "--dsw-alias-markdown-code-block": "\u4EE3\u7801\u5757\u80CC\u666F",
  "--dsw-alias-markdown-inline-code": "\u884C\u5185\u4EE3\u7801\u80CC\u666F",
  "--dsw-alias-markdown-citation": "\u5F15\u7528\u80CC\u666F",
  "--dsw-alias-markdown-tag": "\u6807\u7B7E\u80CC\u666F"
};

// src/core/cover.ts
var COVER_RATIO = { w: 3, h: 1 };
var COVER_FRAME = { w: 1920, h: 640 };
function coverDestRect(crop, canvas = { w: 900, h: 300 }, frame = COVER_FRAME) {
  if (!(crop.w > 0) || !(crop.h > 0) || !(canvas.w > 0) || !(canvas.h > 0) || !(frame.w > 0) || !(frame.h > 0)) return null;
  if (!Number.isFinite(crop.x) || !Number.isFinite(crop.y) || !Number.isFinite(crop.w) || !Number.isFinite(crop.h)) return null;
  const s = canvas.w / frame.w;
  return { x: crop.x * s, y: crop.y * s, w: crop.w * s, h: crop.h * s };
}
function tokenOf(preset2, name2, scheme) {
  const value = preset2.tokens[name2];
  if (value !== void 0) return value[scheme];
  return "";
}
function colorOf(raw, fallback) {
  const resolved = resolveTokenValue(raw);
  return resolved.trim() !== "" && !resolved.startsWith("var(") ? resolved : fallback;
}
function xmlEscape(text) {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function coverSvgFor(preset2) {
  const bgLight = xmlEscape(colorOf(tokenOf(preset2, "--dsw-alias-bg-base", "light"), "#f5f7fa"));
  const bgDark = xmlEscape(colorOf(tokenOf(preset2, "--dsw-alias-bg-base", "dark"), "#14161a"));
  const brand = xmlEscape(colorOf(tokenOf(preset2, "--dsw-alias-brand-primary", "light"), "#416fe6"));
  const labelLight = xmlEscape(colorOf(tokenOf(preset2, "--dsw-alias-label-primary", "light"), "#1a1d21"));
  const labelDark = xmlEscape(colorOf(tokenOf(preset2, "--dsw-alias-label-primary", "dark"), "#e8eaed"));
  const tertiary = xmlEscape(colorOf(tokenOf(preset2, "--dsw-alias-label-tertiary", "light"), "#8a919c"));
  const name2 = xmlEscape(preset2.name);
  const tokenNames = Object.keys(preset2.tokens).slice(0, 5).map(xmlEscape).join(" \xB7 ");
  return [
    '<svg xmlns="http://www.w3.org/2000/svg" width="900" height="300" viewBox="0 0 900 300">',
    `<rect width="900" height="150" fill="${bgLight}"/>`,
    `<rect y="150" width="900" height="150" fill="${bgDark}"/>`,
    `<rect x="30" y="30" width="90" height="90" rx="14" fill="${brand}"/>`,
    `<text x="150" y="86" font-family="system-ui, sans-serif" font-size="30" font-weight="700" fill="${labelLight}">${name2}</text>`,
    `<text x="150" y="116" font-family="system-ui, sans-serif" font-size="14" fill="${tertiary}">${tokenNames}</text>`,
    `<text x="30" y="140" font-family="system-ui, sans-serif" font-size="14" fill="${labelLight}">\u6D45\u8272\u6A21\u5F0F</text>`,
    `<text x="30" y="280" font-family="system-ui, sans-serif" font-size="14" fill="${labelDark}">\u6DF1\u8272\u6A21\u5F0F</text>`,
    "</svg>",
    ""
  ].join("\n");
}
function coverDataUrlFor(preset2) {
  return `data:image/svg+xml;utf8,${encodeURIComponent(coverSvgFor(preset2))}`;
}

// src/client/color-utils.ts
function normalizeHex(value) {
  const m = /^#([0-9a-fA-F]{6})$/.exec(value.trim());
  if (m !== null) return value.trim();
  const rgb = /^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/.exec(value.trim());
  if (rgb !== null) {
    const toHex = (n) => Number(n).toString(16).padStart(2, "0");
    return `#${toHex(rgb[1])}${toHex(rgb[2])}${toHex(rgb[3])}`;
  }
  return "#000000";
}
function extractAlpha(value) {
  const m = /rgba?\([^)]*,\s*([\d.]+)\s*\)/.exec(value.trim());
  return m !== null ? m[1] : null;
}
function rgbaFromHex(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// src/core/editions.ts
var ALL = Object.freeze({
  "preset-wall": true,
  "quick-row": true,
  knobs: true,
  "common-tokens": true,
  "full-token-editor": true,
  "draft-undo": true,
  "preset-manage": true,
  "import-export": true,
  assets: true,
  "css-patches": true,
  "theme-register": true,
  "zip-pack": true,
  "catalog-inspect": true,
  "ai-tools": true
});
var SIMPLE = Object.freeze({
  ...ALL,
  knobs: false,
  "common-tokens": false,
  "full-token-editor": false,
  "draft-undo": false,
  "preset-manage": false,
  "import-export": false,
  assets: false,
  "css-patches": false,
  "theme-register": false,
  "zip-pack": false
});
var STANDARD = Object.freeze({
  ...ALL,
  // 高级区（developer 掩码门控）对外并入标准版，UI 渐进披露。
  assets: true,
  "css-patches": true,
  "theme-register": true,
  "zip-pack": true
});
var DEVELOPER = ALL;
var CAPABILITY_MASKS = Object.freeze({
  simple: SIMPLE,
  standard: STANDARD,
  developer: DEVELOPER
});
var DEFAULT_CAPABILITIES = "standard";
function maskOf(capabilities) {
  return CAPABILITY_MASKS[capabilities];
}

// src/client/capabilities.ts
var currentCapabilities = DEFAULT_CAPABILITIES;
function getCapabilities() {
  return currentCapabilities;
}
function hasCapability(key) {
  return maskOf(currentCapabilities)[key];
}

// src/client/widget-editor.tsx
var React7 = __toESM(require("react"), 1);

// src/client/crop-dialog.tsx
var React2 = __toESM(require("react"), 1);

// src/client/use-i18n.ts
var React = __toESM(require("react"), 1);
function useI18n() {
  const [locale, setLocaleState] = React.useState(() => getLocale());
  React.useEffect(() => {
    setLocaleState(getLocale());
    return subscribeLocale(() => {
      setLocaleState(getLocale());
    });
  }, []);
  const toggle = React.useCallback(() => {
    setLocale(getLocale() === "zh" ? "en" : "zh");
  }, []);
  return { locale, t, setLocale, toggle };
}

// src/client/crop-dialog.tsx
var FRAME_MAX_LONG = 1920;
function CropDialog(props) {
  const { request } = props;
  const { t: t2 } = useI18n();
  const frame = React2.useMemo(() => cropFrameSize(request.ratio, FRAME_MAX_LONG), [request.ratio]);
  const ratioLabel = cropRatioLabel(request.ratio);
  const canvasRef = React2.useRef(null);
  const rootRef = React2.useRef(null);
  const [image, setImage] = React2.useState(null);
  const [loadError, setLoadError] = React2.useState(null);
  const [zoom, setZoom] = React2.useState(1);
  const [pan, setPan] = React2.useState({ x: 0, y: 0 });
  const dragRef = React2.useRef(null);
  React2.useEffect(() => {
    const img = new Image();
    img.onload = () => {
      setImage(img);
    };
    img.onerror = () => {
      setLoadError(t2("crop.loadFailed"));
    };
    img.src = request.sourceUrl;
    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [request.sourceUrl]);
  React2.useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas === null || image === null) return;
    const ctx = canvas.getContext("2d");
    if (ctx === null) return;
    ctx.clearRect(0, 0, frame.w, frame.h);
    const rect = cropDrawRect(image.naturalWidth, image.naturalHeight, frame.w, frame.h, zoom, pan.x, pan.y);
    ctx.drawImage(image, rect.x, rect.y, rect.w, rect.h);
  }, [canvasRef, image, zoom, pan, frame]);
  React2.useEffect(() => {
    rootRef.current?.focus();
  }, []);
  const handlePointerDown = (e) => {
    if (image === null) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = { startX: e.clientX, startY: e.clientY, panX: pan.x, panY: pan.y };
  };
  const handlePointerMove = (e) => {
    const drag = dragRef.current;
    if (drag === null || image === null) return;
    const displayScale = e.currentTarget.clientWidth > 0 ? e.currentTarget.clientWidth / frame.w : 1;
    const fit = Math.min(frame.w / image.naturalWidth, frame.h / image.naturalHeight);
    const imgW = image.naturalWidth * fit * zoom;
    const imgH = image.naturalHeight * fit * zoom;
    const next = clampPanForCrop(
      drag.panX + (e.clientX - drag.startX) / displayScale,
      drag.panY + (e.clientY - drag.startY) / displayScale,
      frame.w,
      frame.h,
      imgW,
      imgH
    );
    setPan(next);
  };
  const handlePointerUp = (e) => {
    dragRef.current = null;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
    }
  };
  const zoomPercent = Math.round(zoom * 100);
  const setZoomPercent = (value) => {
    setZoom(Math.min(CROP_ZOOM_MAX, Math.max(CROP_ZOOM_MIN, value / 100)));
  };
  const confirm = () => {
    if (image === null) return;
    const rect = cropDrawRect(image.naturalWidth, image.naturalHeight, frame.w, frame.h, zoom, pan.x, pan.y);
    props.onConfirm({
      x: Math.round(rect.x * 10) / 10,
      y: Math.round(rect.y * 10) / 10,
      w: Math.round(rect.w * 10) / 10,
      h: Math.round(rect.h * 10) / 10
    });
  };
  return /* @__PURE__ */ React2.createElement(
    "div",
    {
      ref: rootRef,
      "data-up-crop": true,
      role: "dialog",
      "aria-label": t2("crop.aria", { name: request.widgetName, ratio: ratioLabel }),
      tabIndex: -1,
      onKeyDownCapture: (e) => {
        if (e.key === "Escape") {
          e.stopPropagation();
          props.onCancel();
        }
      },
      style: {
        position: "fixed",
        inset: 0,
        zIndex: 1300,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0, 0, 0, 0.88)",
        outline: "none"
      }
    },
    /* @__PURE__ */ React2.createElement(
      "div",
      {
        "data-up-crop-card": true,
        style: {
          width: "min(760px, calc(100vw - 48px))",
          maxHeight: "calc(100vh - 48px)",
          overflow: "auto",
          background: "var(--dsw-alias-bg-layer-1, #fff)",
          color: "var(--dsw-alias-label-primary, #111)",
          borderRadius: 12,
          padding: 16,
          display: "flex",
          flexDirection: "column",
          gap: 12,
          border: "1px solid var(--dsw-alias-border-l2, #ddd)",
          boxShadow: "0 12px 40px rgba(0,0,0,0.5)"
        }
      },
      /* @__PURE__ */ React2.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" } }, /* @__PURE__ */ React2.createElement("span", { style: { fontSize: 14, fontWeight: 600 } }, t2("crop.title", { name: request.widgetName })), /* @__PURE__ */ React2.createElement("span", { "data-up-crop-ratio": true, style: { fontSize: 12, color: "var(--dsw-alias-label-tertiary, #999)" } }, t2("crop.ratioHint", { ratio: ratioLabel, w: frame.w, h: frame.h }))),
      loadError !== null ? /* @__PURE__ */ React2.createElement("div", { "data-up-status": true, style: { fontSize: 12, color: "var(--dsw-alias-state-error-primary, #d94c4c)" } }, loadError) : /* @__PURE__ */ React2.createElement("div", { style: { display: "flex", justifyContent: "center", background: "#000", borderRadius: 8, padding: 14 } }, /* @__PURE__ */ React2.createElement(
        "canvas",
        {
          ref: canvasRef,
          width: frame.w,
          height: frame.h,
          "data-up-crop-canvas": true,
          onPointerDown: handlePointerDown,
          onPointerMove: handlePointerMove,
          onPointerUp: handlePointerUp,
          onPointerCancel: handlePointerUp,
          style: {
            // 画布盒子精确等于帧比例（aspect-ratio + 双 max 约束，无 letterbox）——
            // 框外 = 纯黑（应用范围一目了然）；框内透明像素显示棋盘格（输出透明区）
            background: "repeating-conic-gradient(#d9d9d9 0% 25%, #f5f5f5 0% 50%) 0 0 / 16px 16px",
            aspectRatio: `${frame.w} / ${frame.h}`,
            width: "auto",
            height: "auto",
            maxWidth: "100%",
            maxHeight: "46vh",
            cursor: "grab",
            touchAction: "none",
            border: "1px solid rgba(255, 255, 255, 0.65)"
          }
        }
      )),
      image === null && loadError === null && /* @__PURE__ */ React2.createElement("div", { "data-up-status": true, style: { fontSize: 12 } }, t2("crop.loading")),
      image !== null && /* @__PURE__ */ React2.createElement("div", { style: { display: "flex", alignItems: "center", gap: 10 } }, /* @__PURE__ */ React2.createElement("button", { type: "button", "data-up-btn": true, "aria-label": t2("crop.zoomOut"), onClick: () => {
        setZoomPercent(zoomPercent - 10);
      }, style: { padding: "2px 10px" } }, "\u2212"), /* @__PURE__ */ React2.createElement(
        "input",
        {
          type: "range",
          "aria-label": t2("crop.zoom"),
          min: CROP_ZOOM_MIN * 100,
          max: CROP_ZOOM_MAX * 100,
          step: 5,
          value: zoomPercent,
          onChange: (e) => {
            setZoomPercent(Number(e.target.value));
          },
          style: { flex: 1 }
        }
      ), /* @__PURE__ */ React2.createElement("button", { type: "button", "data-up-btn": true, "aria-label": t2("crop.zoomIn"), onClick: () => {
        setZoomPercent(zoomPercent + 10);
      }, style: { padding: "2px 10px" } }, "\uFF0B"), /* @__PURE__ */ React2.createElement("span", { "data-up-crop-zoom": true, style: { fontSize: 12, minWidth: 52, textAlign: "right", fontVariantNumeric: "tabular-nums" } }, zoomPercent, "%")),
      /* @__PURE__ */ React2.createElement("div", { style: { display: "flex", justifyContent: "flex-end", gap: 8 } }, /* @__PURE__ */ React2.createElement("button", { type: "button", "data-up-btn": true, onClick: props.onCancel }, t2("crop.cancel")), /* @__PURE__ */ React2.createElement("button", { type: "button", "data-up-btn": true, "data-up-btn-primary": true, onClick: confirm, disabled: image === null }, t2("crop.confirm")))
    )
  );
}

// src/client/confirm-dialog.tsx
var React3 = __toESM(require("react"), 1);
function ConfirmDialog(props) {
  const { t: t2 } = useI18n();
  const rootRef = React3.useRef(null);
  React3.useEffect(() => {
    rootRef.current?.focus();
  }, []);
  return /* @__PURE__ */ React3.createElement(
    "div",
    {
      ref: rootRef,
      "data-up-confirm": true,
      role: "dialog",
      "aria-label": t2("confirm.aria"),
      tabIndex: -1,
      onKeyDownCapture: (e) => {
        if (e.key === "Escape") {
          e.stopPropagation();
          props.onCancel();
        }
      },
      style: {
        position: "fixed",
        inset: 0,
        zIndex: 1300,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0, 0, 0, 0.45)",
        outline: "none"
      }
    },
    /* @__PURE__ */ React3.createElement(
      "div",
      {
        style: {
          width: "min(420px, calc(100vw - 48px))",
          background: "var(--dsw-alias-bg-layer-1, #fff)",
          color: "var(--dsw-alias-label-primary, #111)",
          borderRadius: 12,
          padding: 16,
          border: "1px solid var(--dsw-alias-border-l2, #ddd)",
          boxShadow: "0 12px 40px rgba(0,0,0,0.3)",
          display: "flex",
          flexDirection: "column",
          gap: 12
        }
      },
      /* @__PURE__ */ React3.createElement("span", { style: { fontSize: 13, lineHeight: 1.6, whiteSpace: "pre-wrap" } }, props.message),
      /* @__PURE__ */ React3.createElement("div", { style: { display: "flex", justifyContent: "flex-end", gap: 8 } }, /* @__PURE__ */ React3.createElement("button", { type: "button", "data-up-btn": true, onClick: props.onCancel }, t2("common.cancel")), /* @__PURE__ */ React3.createElement("button", { type: "button", "data-up-btn": true, "data-up-btn-primary": true, onClick: props.onConfirm }, props.confirmLabel ?? t2("common.confirm")))
    )
  );
}

// src/client/layer-composer.tsx
var React5 = __toESM(require("react"), 1);

// src/core/layer-compose.ts
function createLayer(assetId, frameW, frameH) {
  return {
    assetId,
    x: frameW / 2 - frameW / 8,
    y: frameH / 2 - frameW / 8,
    w: frameW / 4,
    h: frameW / 4,
    rotation: 0,
    opacity: 1,
    flipH: false,
    flipV: false
  };
}
function composeMode(layers, isGif) {
  const gifs = layers.filter((layer) => isGif(layer.assetId));
  const statics = layers.length - gifs.length;
  if (gifs.length === 0) return { kind: "static" };
  if (gifs.length === 1 && statics >= 1) {
    const gif = gifs[0];
    const clean = Math.abs(gif.rotation) < 1e-6 && gif.opacity >= 0.999 && !gif.flipH && !gif.flipV;
    if (clean) {
      return { kind: "layered", anim: { assetId: gif.assetId, x: gif.x, y: gif.y, w: gif.w, h: gif.h } };
    }
  }
  return { kind: "baked" };
}

// src/core/gif-codec.ts
function readBlocks(data, pos) {
  const out = [];
  while (true) {
    if (pos.p >= data.length) break;
    const len = data[pos.p];
    pos.p += 1;
    if (len === 0) break;
    if (pos.p + len > data.length) {
      for (let i = pos.p; i < data.length; i++) out.push(data[i]);
      pos.p = data.length;
      break;
    }
    for (let i = 0; i < len; i++) out.push(data[pos.p + i]);
    pos.p += len;
  }
  return new Uint8Array(out);
}
function lzwDecode(minCodeSize, data) {
  const clear = 1 << minCodeSize;
  const eoi = clear + 1;
  let codeSize = minCodeSize + 1;
  const dict = [];
  for (let i = 0; i < clear; i++) dict[i] = [i];
  let next = clear + 2;
  let prev = -1;
  const out = [];
  let bitBuf = 0;
  let bitPos = 0;
  let pos = 0;
  const readCode = () => {
    while (bitPos < codeSize) {
      if (pos >= data.length) return eoi;
      bitBuf |= data[pos] << bitPos;
      pos += 1;
      bitPos += 8;
    }
    const code = bitBuf & (1 << codeSize) - 1;
    bitBuf >>>= codeSize;
    bitPos -= codeSize;
    return code;
  };
  while (true) {
    const code = readCode();
    if (code === eoi) break;
    if (code === clear) {
      codeSize = minCodeSize + 1;
      for (let i = 0; i < clear; i++) dict[i] = [i];
      next = clear + 2;
      prev = -1;
      continue;
    }
    let entry;
    if (code < next) entry = dict[code];
    else if (code === next && prev >= 0 && dict[prev] !== void 0) entry = [...dict[prev], dict[prev][0]];
    else break;
    if (entry === void 0) break;
    out.push(...entry);
    if (prev >= 0 && next < 4096) {
      dict[next] = [...dict[prev], entry[0]];
      next += 1;
      if (next === 1 << codeSize && codeSize < 12) codeSize += 1;
    }
    prev = code;
  }
  return out;
}
function deinterlace(w, h, rows) {
  const out = new Array(w * h).fill(0);
  let pos = 0;
  const passes = [[0, 8], [4, 8], [2, 4], [1, 2]];
  for (const [start, step] of passes) {
    for (let y = start; y < h; y += step) {
      for (let x = 0; x < w; x++) out[y * w + x] = rows[pos++];
    }
  }
  return out;
}
function decodeGif(bytes) {
  const sig = String.fromCharCode(bytes[0], bytes[1], bytes[2]);
  if (sig !== "GIF") throw new Error("\u4E0D\u662F GIF \u6587\u4EF6");
  let p = 6;
  const width = bytes[p] | bytes[p + 1] << 8;
  const height = bytes[p + 2] | bytes[p + 3] << 8;
  const packed = bytes[p + 4];
  const gctFlag = (packed & 128) !== 0;
  const gctSize = 2 << (packed & 7);
  const bgIndex = bytes[p + 5];
  p += 7;
  let gct = null;
  if (gctFlag) {
    gct = bytes.slice(p, p + gctSize * 3);
    p += gctSize * 3;
  }
  const total = width * height;
  if (total <= 0 || total > 32 * 1024 * 1024) throw new Error("GIF \u5C3A\u5BF8\u8FC7\u5927\uFF08>8192\xD74096 \u50CF\u7D20\uFF09");
  let canvas = new Uint8ClampedArray(total * 4);
  let prevCanvas = new Uint8ClampedArray(total * 4);
  const frames = [];
  let loopCount = 0;
  let sawNetscape = false;
  while (p < bytes.length) {
    const block = bytes[p];
    p += 1;
    if (block === 59) break;
    if (block === 33) {
      const label = bytes[p];
      p += 1;
      if (label === 249) {
        const size = bytes[p];
        const gce = bytes.slice(p + 1, p + 1 + size);
        p += 1 + size + 1;
        const transFlag = (gce[0] & 1) !== 0;
        const delayCs = (gce[2] << 8 | gce[1]) === 0 ? 10 : gce[2] << 8 | gce[1];
        const transIndex = gce[3];
        const imgBlock = bytes[p];
        if (imgBlock !== 44) {
          p = skipToNextBlock(bytes, p);
          continue;
        }
        p += 1;
        const left = bytes[p] | bytes[p + 1] << 8;
        const top = bytes[p + 2] | bytes[p + 3] << 8;
        const fw = bytes[p + 4] | bytes[p + 5] << 8;
        const fh = bytes[p + 6] | bytes[p + 7] << 8;
        const ipacked = bytes[p + 8];
        p += 9;
        if (fw === 0 || fh === 0 || left + fw > width || top + fh > height) {
          p = skipImageRest(bytes, p, ipacked);
          frames.push({ pixels: new Uint8ClampedArray(canvas), delayCs });
          continue;
        }
        const lctFlag = (ipacked & 128) !== 0;
        const interlaced = (ipacked & 64) !== 0;
        const lctSize = 2 << (ipacked & 7);
        let lct = null;
        if (lctFlag) {
          lct = bytes.slice(p, p + lctSize * 3);
          p += lctSize * 3;
        }
        const palette = lct ?? gct;
        if (palette === null) throw new Error("\u7F3A\u5C11\u8C03\u8272\u677F");
        const minCodeSize = bytes[p];
        p += 1;
        const pos = { p };
        const blockData = readBlocks(bytes, pos);
        p = pos.p;
        let indices = lzwDecode(minCodeSize, blockData);
        if (interlaced) indices = deinterlace(fw, fh, indices);
        for (let y = 0; y < fh; y++) {
          for (let x = 0; x < fw; x++) {
            const idx = indices[y * fw + x];
            if (idx === void 0) continue;
            const dx = left + x;
            const dy = top + y;
            if (dx < 0 || dy < 0 || dx >= width || dy >= height) continue;
            if (transFlag && idx === transIndex) continue;
            const ci = idx * 3;
            const o = (dy * width + dx) * 4;
            canvas[o] = palette[ci];
            canvas[o + 1] = palette[ci + 1];
            canvas[o + 2] = palette[ci + 2];
            canvas[o + 3] = 255;
          }
        }
        frames.push({ pixels: new Uint8ClampedArray(canvas), delayCs });
        const disposal = (gce[0] & 28) >> 2;
        if (disposal === 2) {
          for (let y = 0; y < fh; y++) {
            for (let x = 0; x < fw; x++) {
              const dx = left + x;
              const dy = top + y;
              if (dx < 0 || dy < 0 || dx >= width || dy >= height) continue;
              const o = (dy * width + dx) * 4;
              canvas[o] = 0;
              canvas[o + 1] = 0;
              canvas[o + 2] = 0;
              canvas[o + 3] = 0;
            }
          }
        } else if (disposal === 3) {
          canvas = new Uint8ClampedArray(prevCanvas);
        }
        prevCanvas = new Uint8ClampedArray(canvas);
        continue;
      }
      if (label === 255 && !sawNetscape) {
        const pos = { p };
        const ext = readBlocks(bytes, pos);
        if (ext.length >= 3 && String.fromCharCode(ext[0], ext[1], ext[2]) === "NET") {
          sawNetscape = true;
          if (ext.length >= 14) loopCount = ext[12] | ext[13] << 8;
        }
        p = skipToNextBlock(bytes, p);
        continue;
      }
      p = skipToNextBlock(bytes, p);
      continue;
    }
    if (block === 44) {
      const left = bytes[p] | bytes[p + 1] << 8;
      const top = bytes[p + 2] | bytes[p + 3] << 8;
      const fw = bytes[p + 4] | bytes[p + 5] << 8;
      const fh = bytes[p + 6] | bytes[p + 7] << 8;
      const ipacked = bytes[p + 8];
      p += 9;
      if (fw === 0 || fh === 0 || left + fw > width || top + fh > height) {
        p = skipImageRest(bytes, p, ipacked);
        frames.push({ pixels: new Uint8ClampedArray(canvas), delayCs: 10 });
        continue;
      }
      const lctFlag = (ipacked & 128) !== 0;
      const interlaced = (ipacked & 64) !== 0;
      const lctSize = 2 << (ipacked & 7);
      let lct = null;
      if (lctFlag) {
        lct = bytes.slice(p, p + lctSize * 3);
        p += lctSize * 3;
      }
      const palette = lct ?? gct;
      if (palette === null) throw new Error("\u7F3A\u5C11\u8C03\u8272\u677F");
      const minCodeSize = bytes[p];
      p += 1;
      const pos = { p };
      const blockData = readBlocks(bytes, pos);
      p = pos.p;
      let indices = lzwDecode(minCodeSize, blockData);
      if (interlaced) indices = deinterlace(fw, fh, indices);
      for (let y = 0; y < fh; y++) {
        for (let x = 0; x < fw; x++) {
          const idx = indices[y * fw + x];
          if (idx === void 0) continue;
          const dx = left + x;
          const dy = top + y;
          if (dx < 0 || dy < 0 || dx >= width || dy >= height) continue;
          const ci = idx * 3;
          const o = (dy * width + dx) * 4;
          canvas[o] = palette[ci];
          canvas[o + 1] = palette[ci + 1];
          canvas[o + 2] = palette[ci + 2];
          canvas[o + 3] = 255;
        }
      }
      frames.push({ pixels: new Uint8ClampedArray(canvas), delayCs: 10 });
      prevCanvas = new Uint8ClampedArray(canvas);
      continue;
    }
    p = skipToNextBlock(bytes, p);
  }
  return { width, height, frames };
}
function skipToNextBlock(data, start) {
  let p = start;
  while (p < data.length) {
    const len = data[p];
    p += 1;
    if (len === 0) return p;
    p += len;
  }
  return p;
}
function skipImageRest(data, start, ipacked) {
  let p = start;
  if ((ipacked & 128) !== 0) p += (2 << (ipacked & 7)) * 3;
  p += 1;
  return skipToNextBlock(data, p);
}
function lzwEncode(indices, minCodeSize) {
  const clear = 1 << minCodeSize;
  const eoi = clear + 1;
  let codeSize = minCodeSize + 1;
  const dict = /* @__PURE__ */ new Map();
  let next = clear + 2;
  let prev = -1;
  let pendingKey = -1;
  let skipAdd = false;
  let bitBuf = 0;
  let bitPos = 0;
  const out = [];
  const emit = (code) => {
    bitBuf |= code << bitPos;
    bitPos += codeSize;
    while (bitPos >= 8) {
      out.push(bitBuf & 255);
      bitBuf >>>= 8;
      bitPos -= 8;
    }
  };
  emit(clear);
  for (const ch of indices) {
    if (prev < 0) {
      prev = ch;
      continue;
    }
    const key = prev * 256 + ch;
    const code = dict.get(key);
    if (code !== void 0) {
      prev = code;
      continue;
    }
    emit(prev);
    const skip = skipAdd;
    skipAdd = false;
    if (pendingKey >= 0 && !skip) {
      if (next < 4096) {
        dict.set(pendingKey, next);
        next += 1;
        if (next === 1 << codeSize && codeSize < 12) codeSize += 1;
      }
      if (next >= 4096) {
        emit(clear);
        codeSize = minCodeSize + 1;
        dict.clear();
        next = clear + 2;
        skipAdd = true;
      }
    }
    pendingKey = key;
    prev = ch;
  }
  if (prev >= 0) emit(prev);
  emit(eoi);
  if (bitPos > 0) out.push(bitBuf & 255);
  return new Uint8Array(out);
}
function buildPalette(pixels, w, h) {
  const bucketKey = (r, g, b) => r >> 4 << 8 | g >> 4 << 4 | b >> 4;
  const sums = /* @__PURE__ */ new Map();
  const order = [];
  let hasAlpha = false;
  for (let i = 0; i < pixels.length; i += 4) {
    const a = pixels[i + 3];
    if (a < 128) {
      hasAlpha = true;
      continue;
    }
    const key = bucketKey(pixels[i], pixels[i + 1], pixels[i + 2]);
    const entry = sums.get(key);
    if (entry === void 0) {
      sums.set(key, [pixels[i], pixels[i + 1], pixels[i + 2], 1]);
      order.push(key);
    } else {
      entry[0] += pixels[i];
      entry[1] += pixels[i + 1];
      entry[2] += pixels[i + 2];
      entry[3] += 1;
    }
  }
  order.sort((a, b) => (sums.get(b)?.[3] ?? 0) - (sums.get(a)?.[3] ?? 0));
  const transIndex = hasAlpha ? 0 : null;
  const maxColors = transIndex !== null ? 255 : 256;
  const chosen = order.slice(0, maxColors);
  const paletteArr = [];
  const keyToIndex = /* @__PURE__ */ new Map();
  chosen.forEach((key, i) => {
    const [sr, sg, sb, count] = sums.get(key);
    const idx = transIndex !== null ? i + 1 : i;
    paletteArr.push(Math.round(sr / count), Math.round(sg / count), Math.round(sb / count));
    keyToIndex.set(key, idx);
  });
  const palette = new Uint8Array(paletteArr);
  const indices = new Uint8Array(pixels.length / 4);
  for (let i = 0, p = 0; i < pixels.length; i += 4, p++) {
    const a = pixels[i + 3];
    if (a < 128) {
      indices[p] = transIndex ?? 0;
      continue;
    }
    const key = bucketKey(pixels[i], pixels[i + 1], pixels[i + 2]);
    let idx = keyToIndex.get(key);
    if (idx === void 0) {
      const kr = key >> 8;
      const kg = key >> 4 & 15;
      const kb = key & 15;
      let best = 0;
      let bestD = Infinity;
      keyToIndex.forEach((v, k) => {
        const d = Math.abs((k >> 8) - kr) + Math.abs((k >> 4 & 15) - kg) + Math.abs((k & 15) - kb);
        if (d < bestD) {
          bestD = d;
          best = v;
        }
      });
      idx = best;
    }
    indices[p] = idx;
  }
  return { palette, indices, transIndex };
}
function encodeGif(width, height, frames) {
  const out = [];
  const push = (bytes) => {
    for (const b of bytes) out.push(b);
  };
  push([71, 73, 70, 56, 57, 97]);
  push([width & 255, width >> 8 & 255, height & 255, height >> 8 & 255, 0, 0, 0]);
  push([33, 255, 11]);
  push([78, 69, 84, 83, 67, 65, 80, 69, 50, 46, 48]);
  push([3, 1, 0, 0, 0]);
  for (const frame of frames) {
    const { palette, indices, transIndex } = buildPalette(frame.pixels, width, height);
    const delay = Math.max(1, Math.min(65535, Math.round(frame.delayCs)));
    const gcePacked = 8 | (transIndex !== null ? 1 : 0);
    push([33, 249, 4, gcePacked, delay & 255, delay >> 8 & 255, transIndex ?? 0, 0]);
    const lctSizeField = 7;
    push([44, 0, 0, 0, 0, width & 255, width >> 8 & 255, height & 255, height >> 8 & 255, 128 | lctSizeField]);
    const palArr = [];
    if (transIndex === 0) palArr.push(0, 0, 0);
    for (let i = 0; i < palette.length; i += 3) {
      palArr.push(palette[i], palette[i + 1], palette[i + 2]);
    }
    while (palArr.length < 256 * 3) palArr.push(0, 0, 0);
    push(palArr);
    push([8]);
    const encoded = lzwEncode(indices, 8);
    for (let i = 0; i < encoded.length; i += 255) {
      const block = encoded.slice(i, i + 255);
      push([block.length]);
      push(block);
    }
    push([0]);
  }
  push([59]);
  return new Uint8Array(out);
}

// src/client/asset-thumb.tsx
var React4 = __toESM(require("react"), 1);
function AssetThumb(props) {
  const canvasRef = React4.useRef(null);
  React4.useEffect(() => {
    let alive = true;
    const img = new Image();
    img.onload = () => {
      if (!alive) return;
      const canvas = canvasRef.current;
      if (canvas === null) return;
      const nw = img.naturalWidth;
      const nh = img.naturalHeight;
      if (nw === 0 || nh === 0) return;
      const ctx = canvas.getContext("2d");
      if (ctx === null) return;
      const S = props.size;
      const s = Math.max(S / nw, S / nh);
      const dw = nw * s;
      const dh = nh * s;
      canvas.width = S;
      canvas.height = S;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, (S - dw) / 2, (S - dh) / 2, dw, dh);
    };
    img.src = `/ui-presets/assets/${encodeURIComponent(props.assetId)}`;
    return () => {
      alive = false;
    };
  }, [props.assetId, props.size]);
  return /* @__PURE__ */ React4.createElement(
    "canvas",
    {
      ref: canvasRef,
      title: props.title,
      onClick: props.onClick,
      ...props.dataAttrs ?? {},
      style: {
        width: props.size,
        height: props.size,
        borderRadius: 4,
        border: "1px solid var(--dsw-alias-border-l2)",
        background: "#f2f2f2",
        cursor: props.onClick !== void 0 ? "pointer" : "default",
        flex: "none"
      }
    }
  );
}

// src/client/layer-composer.tsx
var RATIO_OPTIONS = [
  { key: "chat-background", labelKey: "lc.chat" },
  { key: "settings-background", labelKey: "lc.settings" },
  { key: "sidebar-poster", labelKey: "lc.sidebar" }
];
function LayerComposerDialog(props) {
  const { t: t2 } = useI18n();
  const controller2 = getController();
  const [ratioKey, setRatioKey] = React5.useState("chat-background");
  const [layers, setLayers] = React5.useState([]);
  const [selected, setSelected] = React5.useState(-1);
  const [status, setStatus] = React5.useState("");
  const [composing, setComposing] = React5.useState(false);
  const [undoStack, setUndoStack] = React5.useState([]);
  const canvasRef = React5.useRef(null);
  const imgCache = React5.useRef(/* @__PURE__ */ new Map());
  const dragRef = React5.useRef(null);
  const frame = cropFrameSize(WIDGET_CROP_RATIOS[ratioKey]);
  const viewW = 640;
  const viewH = Math.round(640 * frame.h / frame.w);
  const scale = viewW / frame.w;
  const updateLayers = (next) => {
    setUndoStack((stack) => [...stack.slice(-49), layers]);
    setLayers((prev) => typeof next === "function" ? next(prev) : next);
  };
  const undo = () => {
    const stack = undoStack;
    if (stack.length === 0) return;
    const prev = stack[stack.length - 1];
    setUndoStack((s) => s.slice(0, -1));
    setLayers(prev);
    setSelected(-1);
  };
  const loadImage = (id) => {
    const cached2 = imgCache.current.get(id);
    if (cached2 !== void 0) return Promise.resolve(cached2);
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        imgCache.current.set(id, img);
        resolve(img);
      };
      img.onerror = () => {
        imgCache.current.set(id, img);
        resolve(img);
      };
      img.src = `/ui-presets/assets/${encodeURIComponent(id)}`;
    });
  };
  const addLayer = (assetId) => {
    void loadImage(assetId).then((img) => {
      const layer = createLayer(assetId, frame.w, frame.h);
      if (img.naturalWidth > 0 && img.naturalHeight > 0) {
        const targetW = frame.w / 4;
        layer.h = targetW * img.naturalHeight / img.naturalWidth;
      }
      updateLayers((prev) => [...prev, layer]);
      setSelected((prev) => prev + 1);
    });
  };
  const draw = () => {
    const canvas = canvasRef.current;
    if (canvas === null) return;
    const ctx = canvas.getContext("2d");
    if (ctx === null) return;
    ctx.clearRect(0, 0, viewW, viewH);
    const cell = 12;
    ctx.fillStyle = "#f0f0f0";
    ctx.fillRect(0, 0, viewW, viewH);
    ctx.fillStyle = "#e2e2e2";
    for (let y = 0; y < viewH; y += cell) {
      for (let x = y / cell % 2 === 0 ? 0 : cell; x < viewW; x += cell * 2) {
        ctx.fillRect(x, y, cell, cell);
      }
    }
    void Promise.all(layers.map((layer) => loadImage(layer.assetId))).then((images) => {
      if (canvasRef.current !== canvas) return;
      const ctx2 = canvas.getContext("2d");
      if (ctx2 === null) return;
      layers.forEach((layer, index) => {
        const img = images[index];
        if (img === void 0 || img.naturalWidth === 0) return;
        ctx2.save();
        ctx2.globalAlpha = layer.opacity;
        const cx = (layer.x + layer.w / 2) * scale;
        const cy = (layer.y + layer.h / 2) * scale;
        ctx2.translate(cx, cy);
        ctx2.rotate(layer.rotation);
        if (layer.flipH) ctx2.scale(-1, 1);
        if (layer.flipV) ctx2.scale(1, -1);
        ctx2.drawImage(img, -layer.w / 2 * scale, -layer.h / 2 * scale, layer.w * scale, layer.h * scale);
        ctx2.restore();
        if (index === selected) {
          ctx2.strokeStyle = "var(--dsw-alias-button-info-fill, #416fe6)";
          ctx2.lineWidth = 2;
          ctx2.strokeRect(layer.x * scale, layer.y * scale, layer.w * scale, layer.h * scale);
        }
      });
    });
  };
  React5.useEffect(() => {
    draw();
  });
  const hitTest = (px, py) => {
    for (let i = layers.length - 1; i >= 0; i -= 1) {
      const layer = layers[i];
      if (px >= layer.x && px <= layer.x + layer.w && py >= layer.y && py <= layer.y + layer.h) return i;
    }
    return -1;
  };
  const onPointerDown = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const fx = (e.clientX - rect.left) / scale;
    const fy = (e.clientY - rect.top) / scale;
    const index = hitTest(fx, fy);
    if (index >= 0) {
      setSelected(index);
      dragRef.current = { index, startX: e.clientX, startY: e.clientY, originX: layers[index].x, originY: layers[index].y };
      e.currentTarget.setPointerCapture(e.pointerId);
    } else {
      setSelected(-1);
    }
  };
  const onPointerMove = (e) => {
    const drag = dragRef.current;
    if (drag === null) return;
    const next = layers.map((layer, i) => i === drag.index ? { ...layer, x: drag.originX + (e.clientX - drag.startX) / scale, y: drag.originY + (e.clientY - drag.startY) / scale } : layer);
    setLayers(next);
  };
  const onPointerUp = () => {
    if (dragRef.current !== null) {
      setUndoStack((stack) => [...stack.slice(-49), layers]);
      dragRef.current = null;
    }
  };
  const onWheel = (e) => {
    if (selected < 0) return;
    const factor = e.deltaY < 0 ? 1.1 : 1 / 1.1;
    updateLayers(layers.map((item, i) => i === selected ? { ...item, w: item.w * factor, h: item.h * factor } : item));
  };
  const composeLayered = async (anim) => {
    const images = await Promise.all(layers.map((layer) => loadImage(layer.assetId)));
    const canvas = document.createElement("canvas");
    canvas.width = frame.w;
    canvas.height = frame.h;
    const ctx = canvas.getContext("2d");
    if (ctx === null) throw new Error("canvas \u4E0D\u53EF\u7528");
    layers.forEach((layer, index) => {
      if (layer.assetId === anim.assetId) return;
      const img = images[index];
      if (img === void 0 || img.naturalWidth === 0) return;
      ctx.save();
      ctx.globalAlpha = layer.opacity;
      ctx.translate(layer.x + layer.w / 2, layer.y + layer.h / 2);
      ctx.rotate(layer.rotation);
      if (layer.flipH) ctx.scale(-1, 1);
      if (layer.flipV) ctx.scale(1, -1);
      ctx.drawImage(img, -layer.w / 2, -layer.h / 2, layer.w, layer.h);
      ctx.restore();
    });
    const probe = document.createElement("canvas");
    probe.width = Math.max(1, Math.round(frame.w / 8));
    probe.height = Math.max(1, Math.round(frame.h / 8));
    const pctx = probe.getContext("2d", { willReadFrequently: true });
    if (pctx === null) throw new Error("canvas \u4E0D\u53EF\u7528");
    pctx.drawImage(canvas, 0, 0, probe.width, probe.height);
    const pixelData = pctx.getImageData(0, 0, probe.width, probe.height).data;
    let hasAlpha = false;
    for (let i = 3; i < pixelData.length; i += 4) {
      if (pixelData[i] < 255) {
        hasAlpha = true;
        break;
      }
    }
    const mime = hasAlpha ? "image/png" : "image/jpeg";
    const blob = await new Promise((resolve) => canvas.toBlob((b) => resolve(b), mime, 0.85));
    if (blob === null) throw new Error(t("lc.baseEncodeFailed"));
    const file = new File([blob], `\u5408\u6210\u58C1\u7EB8-${Date.now()}.${mime === "image/png" ? "png" : "jpg"}`, { type: mime });
    const result = await controller2?.uploadAsset(file, void 0, {
      animAssetId: anim.assetId,
      x: anim.x,
      y: anim.y,
      w: anim.w,
      h: anim.h
    });
    if (result?.ok === true && result.id !== void 0) {
      setStatus(t("lc.generatedLayered", { name: result.name ?? t("lc.defaultName") }));
      props.onComposed({ id: result.id, name: result.name ?? "\u5408\u6210\u58C1\u7EB8.png", mime });
    } else {
      setStatus(result?.error ?? t("lc.uploadFailed"));
    }
  };
  const compose = (forceBake) => {
    if (layers.length === 0) {
      setStatus(t("lc.needLayer"));
      return;
    }
    setComposing(true);
    const mode = composeMode(layers, (id) => (props.assets.find((a) => a.id === id)?.mime ?? "") === "image/gif");
    void (async () => {
      try {
        if (mode.kind === "layered" && !forceBake) {
          await composeLayered(mode.anim);
          return;
        }
        const gifLayerIds = new Set(layers.filter((layer) => (props.assets.find((a) => a.id === layer.assetId)?.mime ?? "") === "image/gif").map((layer) => layer.assetId));
        if (gifLayerIds.size === 0) {
          const images = await Promise.all(layers.map((layer) => loadImage(layer.assetId)));
          const canvas2 = document.createElement("canvas");
          canvas2.width = frame.w;
          canvas2.height = frame.h;
          const ctx2 = canvas2.getContext("2d");
          if (ctx2 === null) throw new Error("canvas \u4E0D\u53EF\u7528");
          layers.forEach((layer, index) => {
            const img = images[index];
            if (img === void 0 || img.naturalWidth === 0) return;
            ctx2.save();
            ctx2.globalAlpha = layer.opacity;
            ctx2.translate(layer.x + layer.w / 2, layer.y + layer.h / 2);
            ctx2.rotate(layer.rotation);
            if (layer.flipH) ctx2.scale(-1, 1);
            if (layer.flipV) ctx2.scale(1, -1);
            ctx2.drawImage(img, -layer.w / 2, -layer.h / 2, layer.w, layer.h);
            ctx2.restore();
          });
          const dataUrl = canvas2.toDataURL("image/png");
          const bytes = Uint8Array.from(atob(dataUrl.slice("data:image/png;base64,".length)), (c) => c.charCodeAt(0));
          const file2 = new File([bytes], `\u5408\u6210\u58C1\u7EB8-${Date.now()}.png`, { type: "image/png" });
          const result2 = await controller2?.uploadAsset(file2);
          if (result2?.ok === true && result2.id !== void 0) {
            setStatus(t("lc.generated", { name: result2.name ?? t("lc.defaultName") }));
            props.onComposed({ id: result2.id, name: result2.name ?? "\u5408\u6210\u58C1\u7EB8.png", mime: "image/png" });
          } else {
            setStatus(result2?.error ?? t("lc.uploadFailed"));
          }
          return;
        }
        const gifCache = /* @__PURE__ */ new Map();
        for (const id of gifLayerIds) {
          const res = await fetch(`/ui-presets/assets/${encodeURIComponent(id)}`);
          if (!res.ok) throw new Error(t("lc.gifReadFailed"));
          gifCache.set(id, decodeGif(new Uint8Array(await res.arrayBuffer())));
        }
        const staticImages = await Promise.all(layers.map((layer) => loadImage(layer.assetId)));
        let totalCs = 0;
        const boundaries = /* @__PURE__ */ new Set();
        for (const layer of layers) {
          const dec = gifCache.get(layer.assetId);
          if (dec === void 0) continue;
          let cum = 0;
          for (const f of dec.frames) {
            cum += f.delayCs;
            if (cum > 0 && cum < 864e4) boundaries.add(cum);
          }
          totalCs = Math.max(totalCs, cum);
        }
        if (totalCs <= 0) throw new Error("GIF \u65E0\u6709\u6548\u5E27\u65F6\u957F");
        const canvas = document.createElement("canvas");
        canvas.width = frame.w;
        canvas.height = frame.h;
        const ctx = canvas.getContext("2d");
        if (ctx === null) throw new Error("canvas \u4E0D\u53EF\u7528");
        const frameImageDatas = /* @__PURE__ */ new Map();
        const applyTransform = (layer, draw2) => {
          ctx.save();
          ctx.globalAlpha = layer.opacity;
          ctx.translate(layer.x + layer.w / 2, layer.y + layer.h / 2);
          ctx.rotate(layer.rotation);
          if (layer.flipH) ctx.scale(-1, 1);
          if (layer.flipV) ctx.scale(1, -1);
          draw2();
          ctx.restore();
        };
        const drawLayer = (layer, index, timeCs) => {
          const dec = gifCache.get(layer.assetId);
          if (dec !== void 0) {
            let layerTotal = 0;
            for (const f of dec.frames) layerTotal += f.delayCs;
            let t3 = timeCs % layerTotal;
            let fi = 0;
            for (let i = 0; i < dec.frames.length; i++) {
              if (t3 < dec.frames[i].delayCs) {
                fi = i;
                break;
              }
              t3 -= dec.frames[i].delayCs;
            }
            let datas = frameImageDatas.get(layer.assetId);
            if (datas === void 0) {
              datas = dec.frames.map((f) => new ImageData(f.pixels, dec.width, dec.height));
              frameImageDatas.set(layer.assetId, datas);
            }
            const data = datas[fi];
            if (data === void 0) return;
            const temp = document.createElement("canvas");
            temp.width = dec.width;
            temp.height = dec.height;
            temp.getContext("2d")?.putImageData(data, 0, 0);
            applyTransform(layer, () => {
              ctx.drawImage(temp, -layer.w / 2, -layer.h / 2, layer.w, layer.h);
            });
          } else {
            const img = staticImages[index];
            if (img === void 0 || img.naturalWidth === 0) return;
            applyTransform(layer, () => {
              ctx.drawImage(img, -layer.w / 2, -layer.h / 2, layer.w, layer.h);
            });
          }
        };
        const MIN_SEGMENT_CS = 5;
        const rawTimes = [...boundaries].filter((t3) => t3 <= totalCs).sort((a, b) => a - b);
        const times = [];
        let last = 0;
        for (const t3 of rawTimes) {
          if (t3 - last >= MIN_SEGMENT_CS) {
            times.push(t3);
            last = t3;
          }
        }
        if (times.length > 150) throw new Error(t("lc.tooManyFrames"));
        const baseScale = Math.min(1, 1280 / Math.max(frame.w, frame.h));
        const minScale = Math.min(baseScale, 640 / Math.max(frame.w, frame.h));
        const MAX_OUTPUT_GIF_BYTES = 8 * 1024 * 1024;
        if (times.length === 0) throw new Error(t("lc.emptyTimeline"));
        setStatus(t("lc.composing", { frames: times.length }));
        const renderFrames = (scale3) => {
          const oc = document.createElement("canvas");
          oc.width = Math.max(1, Math.round(frame.w * scale3));
          oc.height = Math.max(1, Math.round(frame.h * scale3));
          const octx = oc.getContext("2d");
          if (octx === null) throw new Error("canvas \u4E0D\u53EF\u7528");
          let prev = 0;
          const frames = [];
          for (const t3 of times) {
            ctx.clearRect(0, 0, frame.w, frame.h);
            layers.forEach((layer, index) => drawLayer(layer, index, prev));
            octx.clearRect(0, 0, oc.width, oc.height);
            octx.drawImage(canvas, 0, 0, oc.width, oc.height);
            frames.push({ pixels: new Uint8ClampedArray(octx.getImageData(0, 0, oc.width, oc.height).data), delayCs: t3 - prev });
            prev = t3;
          }
          return frames;
        };
        let scale2 = baseScale;
        let gifBytes = null;
        let finalW = 0;
        let finalH = 0;
        for (let attempt = 0; attempt < 5; attempt++) {
          const frames = renderFrames(scale2);
          finalW = Math.max(1, Math.round(frame.w * scale2));
          finalH = Math.max(1, Math.round(frame.h * scale2));
          gifBytes = encodeGif(finalW, finalH, frames);
          if (gifBytes.length <= MAX_OUTPUT_GIF_BYTES || scale2 <= minScale + 1e-6) break;
          scale2 = Math.max(minScale, scale2 * 0.75);
        }
        if (gifBytes === null) throw new Error(t("lc.encodeFailed"));
        const sizeMb = (gifBytes.length / 1048576).toFixed(1);
        const downscaled = scale2 < baseScale - 1e-6 ? t("lc.downscaled", { w: finalW, h: finalH }) : "";
        const file = new File([gifBytes], `\u5408\u6210\u58C1\u7EB8-${Date.now()}.gif`, { type: "image/gif" });
        const result = await controller2?.uploadAsset(file);
        if (result?.ok === true && result.id !== void 0) {
          setStatus(t("lc.generatedAnim", { name: result.name ?? t("lc.defaultName"), frames: times.length, size: sizeMb, extra: downscaled }));
          props.onComposed({ id: result.id, name: result.name ?? "\u5408\u6210\u58C1\u7EB8.gif", mime: "image/gif" });
        } else {
          setStatus(result?.error ?? t("lc.uploadFailed"));
        }
      } catch (error) {
        setStatus(t("lc.failed", { error: error instanceof Error ? error.message : String(error) }));
      } finally {
        setComposing(false);
      }
    })();
  };
  return /* @__PURE__ */ React5.createElement(
    "div",
    {
      "data-up-layer-composer": true,
      style: {
        position: "fixed",
        inset: 0,
        zIndex: 1300,
        background: "rgba(0,0,0,0.55)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      },
      onClick: (e) => {
        if (e.target === e.currentTarget) props.onClose();
      }
    },
    /* @__PURE__ */ React5.createElement(
      "div",
      {
        style: {
          width: 880,
          maxWidth: "94vw",
          maxHeight: "92vh",
          overflow: "auto",
          background: "var(--dsw-alias-bg-layer-1, #fff)",
          color: "var(--dsw-alias-label-primary, #111)",
          borderRadius: 12,
          border: "1px solid var(--dsw-alias-border-l2)",
          padding: 16,
          display: "flex",
          flexDirection: "column",
          gap: 10
        }
      },
      /* @__PURE__ */ React5.createElement("div", { style: { display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" } }, /* @__PURE__ */ React5.createElement("span", { style: { fontSize: 14, fontWeight: 600 } }, t2("lc.title")), /* @__PURE__ */ React5.createElement(
        "select",
        {
          "aria-label": t2("lc.ratioAria"),
          value: ratioKey,
          onChange: (e) => {
            setRatioKey(e.target.value);
            setLayers([]);
            setSelected(-1);
            setUndoStack([]);
          },
          style: { fontSize: 12, padding: "2px 6px" }
        },
        RATIO_OPTIONS.map((opt) => /* @__PURE__ */ React5.createElement("option", { key: opt.key, value: opt.key }, t2(opt.labelKey)))
      ), /* @__PURE__ */ React5.createElement("span", { "data-up-status": true, style: { fontSize: 11 } }, status !== "" ? status : t2("lc.canvas", { w: frame.w, h: frame.h, count: layers.length })), /* @__PURE__ */ React5.createElement("button", { type: "button", "data-up-btn": true, onClick: undo, disabled: undoStack.length === 0, style: { marginLeft: "auto" } }, t2("lc.undo")), /* @__PURE__ */ React5.createElement("button", { type: "button", "data-up-btn": true, onClick: props.onClose }, t2("lc.close"))),
      /* @__PURE__ */ React5.createElement("div", { style: { display: "flex", gap: 12 } }, /* @__PURE__ */ React5.createElement(
        "canvas",
        {
          ref: canvasRef,
          "data-up-layer-canvas": true,
          width: viewW,
          height: viewH,
          "aria-label": t("lc.canvasAria"),
          onPointerDown,
          onPointerMove,
          onPointerUp,
          onWheel,
          style: { width: viewW, height: viewH, border: "1px solid var(--dsw-alias-border-l2)", borderRadius: 8, touchAction: "none", cursor: "grab", flex: "none" }
        }
      ), /* @__PURE__ */ React5.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 8, minWidth: 200 } }, /* @__PURE__ */ React5.createElement("span", { style: { fontSize: 11, fontWeight: 600 } }, t("lc.assetsHint")), /* @__PURE__ */ React5.createElement("div", { "data-up-layer-palette": true, style: { display: "flex", flexWrap: "wrap", gap: 6, maxHeight: 150, overflow: "auto" } }, props.assets.map((asset) => /* @__PURE__ */ React5.createElement(
        AssetThumb,
        {
          key: asset.id,
          assetId: asset.id,
          size: 44,
          title: asset.name,
          dataAttrs: { "data-up-layer-piece": asset.id },
          onClick: () => addLayer(asset.id)
        }
      ))), props.assets.length === 0 && /* @__PURE__ */ React5.createElement("span", { "data-up-status": true, style: { fontSize: 10 } }, t("lc.noAssets")), selected >= 0 && /* @__PURE__ */ React5.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 6, borderTop: "1px solid var(--dsw-alias-border-l2)", paddingTop: 6 } }, /* @__PURE__ */ React5.createElement("label", { style: { fontSize: 11 } }, t2("lc.rotate", { deg: Math.round(layers[selected].rotation * 180 / Math.PI) }), /* @__PURE__ */ React5.createElement(
        "input",
        {
          type: "range",
          min: -180,
          max: 180,
          step: 1,
          "aria-label": t2("lc.rotateAria"),
          value: Math.round(layers[selected].rotation * 180 / Math.PI),
          onChange: (e) => updateLayers(layers.map((l, i) => i === selected ? { ...l, rotation: Number(e.target.value) * Math.PI / 180 } : l)),
          style: { width: "100%", display: "block" }
        }
      )), /* @__PURE__ */ React5.createElement("label", { style: { fontSize: 11 } }, t2("lc.opacity", { pct: Math.round(layers[selected].opacity * 100) }), /* @__PURE__ */ React5.createElement(
        "input",
        {
          type: "range",
          min: 0,
          max: 100,
          step: 1,
          "aria-label": t2("lc.opacityAria"),
          value: Math.round(layers[selected].opacity * 100),
          onChange: (e) => updateLayers(layers.map((l, i) => i === selected ? { ...l, opacity: Number(e.target.value) / 100 } : l)),
          style: { width: "100%", display: "block" }
        }
      )), /* @__PURE__ */ React5.createElement("div", { style: { display: "flex", gap: 6, flexWrap: "wrap" } }, /* @__PURE__ */ React5.createElement("button", { type: "button", "data-up-btn": true, "aria-label": t2("lc.upAria"), onClick: () => {
        if (selected < 0 || selected >= layers.length - 1) return;
        const next = [...layers];
        const [item] = next.splice(selected, 1);
        next.splice(selected + 1, 0, item);
        updateLayers(next);
        setSelected(selected + 1);
      }, style: { padding: "2px 8px", fontSize: 11 } }, t2("lc.up")), /* @__PURE__ */ React5.createElement("button", { type: "button", "data-up-btn": true, "aria-label": t2("lc.downAria"), onClick: () => {
        if (selected <= 0) return;
        const next = [...layers];
        const [item] = next.splice(selected, 1);
        next.splice(selected - 1, 0, item);
        updateLayers(next);
        setSelected(selected - 1);
      }, style: { padding: "2px 8px", fontSize: 11 } }, t2("lc.down")), /* @__PURE__ */ React5.createElement("button", { type: "button", "data-up-btn": true, "aria-label": t2("lc.topAria"), onClick: () => {
        if (selected < 0) return;
        const next = [...layers];
        const [item] = next.splice(selected, 1);
        next.push(item);
        updateLayers(next);
        setSelected(next.length - 1);
      }, style: { padding: "2px 8px", fontSize: 11 } }, t2("lc.top")), /* @__PURE__ */ React5.createElement("button", { type: "button", "data-up-btn": true, "aria-label": t2("lc.bottomAria"), onClick: () => {
        if (selected < 0) return;
        const next = [...layers];
        const [item] = next.splice(selected, 1);
        next.unshift(item);
        updateLayers(next);
        setSelected(0);
      }, style: { padding: "2px 8px", fontSize: 11 } }, t2("lc.bottom")), /* @__PURE__ */ React5.createElement(
        "button",
        {
          type: "button",
          "data-up-btn": true,
          "aria-label": t2("lc.mirrorHAria"),
          onClick: () => updateLayers(layers.map((l, i) => i === selected ? { ...l, flipH: !l.flipH } : l)),
          style: { padding: "2px 8px", fontSize: 11, ...selected >= 0 && layers[selected]?.flipH ? { background: "var(--dsw-alias-button-info-fill)", color: "#fff", borderColor: "transparent" } : {} }
        },
        t2("lc.mirrorH")
      ), /* @__PURE__ */ React5.createElement(
        "button",
        {
          type: "button",
          "data-up-btn": true,
          "aria-label": t2("lc.mirrorVAria"),
          onClick: () => updateLayers(layers.map((l, i) => i === selected ? { ...l, flipV: !l.flipV } : l)),
          style: { padding: "2px 8px", fontSize: 11, ...selected >= 0 && layers[selected]?.flipV ? { background: "var(--dsw-alias-button-info-fill)", color: "#fff", borderColor: "transparent" } : {} }
        },
        t2("lc.mirrorV")
      ), /* @__PURE__ */ React5.createElement("button", { type: "button", "data-up-btn": true, "aria-label": t2("lc.deleteAria"), onClick: () => {
        if (selected < 0) return;
        updateLayers(layers.filter((_, i) => i !== selected));
        setSelected(-1);
      }, style: { padding: "2px 8px", fontSize: 11 } }, t2("lc.delete")))))),
      /* @__PURE__ */ React5.createElement("div", { style: { display: "flex", justifyContent: "flex-end", gap: 8, alignItems: "center" } }, /* @__PURE__ */ React5.createElement("span", { "data-up-status": true, style: { fontSize: 10 } }, t("lc.transparentHint")), composeMode(layers, (id) => (props.assets.find((a) => a.id === id)?.mime ?? "") === "image/gif").kind === "layered" && !composing && /* @__PURE__ */ React5.createElement(
        "button",
        {
          type: "button",
          "data-up-btn": true,
          "data-up-layer-bake": true,
          onClick: () => {
            void compose(true);
          },
          style: { padding: "4px 10px", fontSize: 11 },
          title: t("lc.bakeTitle")
        },
        t("lc.bake")
      ), /* @__PURE__ */ React5.createElement(
        "button",
        {
          type: "button",
          "data-up-btn": true,
          "data-up-btn-primary": true,
          "data-up-layer-compose": true,
          onClick: () => {
            void compose(false);
          },
          disabled: composing || layers.length === 0
        },
        composing ? t("lc.composingShort") : t("lc.compose")
      ))
    )
  );
}

// src/client/rotation-panel.tsx
var React6 = __toESM(require("react"), 1);
var labelStyle = { fontSize: 11, color: "var(--dsw-alias-label-tertiary, #999)" };
var inputStyle = {
  fontSize: 11,
  padding: "3px 6px",
  borderRadius: 6,
  border: "1px solid var(--dsw-alias-border-l2)",
  background: "var(--dsw-alias-bg-layer-2)",
  color: "var(--dsw-alias-label-primary)"
};
function formatInterval(ms) {
  if (ms < 36e5) return t("rot.minutes", { count: Math.round(ms / 6e4) });
  if (ms < 864e5) return t("rot.hours", { count: Math.round(ms / 36e5) });
  return t("rot.days", { count: Math.round(ms / 864e5) });
}
function RotationPanel(props) {
  const key = rotationKey(props.presetId, props.widgetId);
  const { t: t2 } = useI18n();
  const [open, setOpen] = React6.useState(false);
  const [config, setConfig] = React6.useState(() => loadRotationStore()[key] ?? null);
  const [text, setText] = React6.useState(() => (loadRotationStore()[key]?.urls ?? []).join("\n"));
  const [intervalMs, setIntervalMs] = React6.useState(() => loadRotationStore()[key]?.intervalMs ?? ROTATION_INTERVALS[2].value);
  const [message, setMessage] = React6.useState(null);
  const [rejected, setRejected] = React6.useState(0);
  const save = () => {
    const parsed = splitUrlLines(text);
    setRejected(parsed.rejected);
    if (parsed.urls.length < 2) {
      const extra = parsed.rejected > 0 ? t2("rot.rejectedExtra", { count: parsed.rejected }) : "";
      setMessage(t2("rot.needTwo", { count: parsed.urls.length, extra }));
      return;
    }
    const next = createRotation(parsed.urls, intervalMs, Date.now());
    if (next === null) {
      setMessage(t2("rot.invalid"));
      return;
    }
    const store = loadRotationStore();
    store[key] = next;
    saveRotationStore(store);
    setConfig(next);
    setMessage(t2("rot.enabled", {
      count: next.urls.length,
      minutes: Math.round(next.intervalMs / 6e4),
      seconds: Math.round(ROTATION_TICK_MS / 1e3)
    }));
  };
  const disable = () => {
    const store = loadRotationStore();
    delete store[key];
    saveRotationStore(store);
    setConfig(null);
    setMessage(t2("rot.disabled"));
  };
  const rotateNow = async () => {
    if (!props.isActive) {
      setMessage(t2("rot.notActive"));
      return;
    }
    const controller2 = getController();
    if (controller2 === null) return;
    const ok = await controller2.rotateWidgetNow(props.widgetId);
    if (ok) {
      const latest = loadRotationStore()[key];
      setConfig(latest ?? null);
      setMessage(t2("rot.rotated"));
    } else {
      setMessage(t2("rot.fail"));
    }
  };
  return /* @__PURE__ */ React6.createElement("div", { "data-up-rotation": true, style: { marginTop: 2 } }, /* @__PURE__ */ React6.createElement(
    "button",
    {
      type: "button",
      "data-up-rotation-head": true,
      onClick: () => {
        setOpen((prev) => !prev);
      },
      style: { border: "none", background: "transparent", cursor: "pointer", padding: 0, fontSize: 11, color: "var(--dsw-alias-label-secondary)" }
    },
    open ? "\u25BE" : "\u25B8",
    " ",
    t2("rot.title"),
    /* @__PURE__ */ React6.createElement("span", { style: { color: config !== null ? "var(--dsw-alias-brand-primary, #4a7dff)" : "var(--dsw-alias-label-tertiary, #999)", marginLeft: 6 } }, config !== null ? t2("rot.on", { count: config.urls.length, minutes: Math.round(config.intervalMs / 6e4) }) : t2("rot.off"))
  ), open && /* @__PURE__ */ React6.createElement("div", { "data-up-rotation-body": true, style: { display: "flex", flexDirection: "column", gap: 6, marginTop: 4, paddingLeft: 8, borderLeft: "2px dashed var(--dsw-alias-border-l2)" } }, /* @__PURE__ */ React6.createElement("div", { style: { ...labelStyle, lineHeight: 1.5 } }, t2("rot.hint", { max: ROTATION_MAX_URLS })), /* @__PURE__ */ React6.createElement(
    "textarea",
    {
      "aria-label": `${props.widgetId} ${t2("rot.linksAria")}`,
      rows: 3,
      value: text,
      spellCheck: false,
      placeholder: "https://example.com/a.jpg\nhttps://example.com/b.jpg",
      onChange: (e) => {
        setText(e.target.value);
        setMessage(null);
      },
      style: { ...inputStyle, width: "min(520px, 100%)", resize: "vertical", fontFamily: "var(--ds-font-family-code)" }
    }
  ), /* @__PURE__ */ React6.createElement("div", { style: { display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" } }, /* @__PURE__ */ React6.createElement("label", { style: { display: "flex", alignItems: "center", gap: 4, ...labelStyle } }, t2("rot.interval"), /* @__PURE__ */ React6.createElement(
    "select",
    {
      "aria-label": `${props.widgetId} ${t2("rot.intervalAria")}`,
      value: intervalMs,
      onChange: (e) => {
        setIntervalMs(Number(e.target.value));
      },
      style: inputStyle
    },
    ROTATION_INTERVALS.map((option) => /* @__PURE__ */ React6.createElement("option", { key: option.value, value: option.value }, formatInterval(option.value)))
  )), /* @__PURE__ */ React6.createElement("button", { type: "button", "data-up-rotation-save": true, onClick: save, style: { ...inputStyle, cursor: "pointer" } }, config === null ? t2("rot.saveNew") : t2("rot.saveEdit")), config !== null && /* @__PURE__ */ React6.createElement(React6.Fragment, null, /* @__PURE__ */ React6.createElement("button", { type: "button", "data-up-rotation-now": true, onClick: () => {
    void rotateNow();
  }, style: { ...inputStyle, cursor: "pointer" } }, t2("rot.now")), /* @__PURE__ */ React6.createElement("button", { type: "button", "data-up-rotation-off": true, onClick: disable, style: { ...inputStyle, cursor: "pointer", color: "var(--dsw-alias-state-error-primary, #d94c4c)" } }, t2("rot.disable"))), rejected > 0 && /* @__PURE__ */ React6.createElement("span", { style: { ...labelStyle, color: "var(--dsw-alias-state-warn-primary, #b7791f)" } }, t2("rot.rejected", { count: rejected }))), message !== null && /* @__PURE__ */ React6.createElement("div", { "data-up-rotation-msg": true, style: { ...labelStyle, lineHeight: 1.5 } }, message)));
}

// src/client/widget-editor.tsx
function WidgetEditor(props) {
  const { t: t2, locale } = useI18n();
  const fileInputRef = React7.useRef(null);
  const controller2 = getController();
  const [cropRequest, setCropRequest] = React7.useState(null);
  const [schemeModeOn, setSchemeModeOn] = React7.useState(false);
  const [composerOpen, setComposerOpen] = React7.useState(false);
  const assetsRef = React7.useRef(props.assets);
  assetsRef.current = props.assets;
  const activePresetId = controller2?.getState().activePresetId ?? null;
  const addAsset = async (file) => {
    if (file === void 0) return;
    if (!file.type.startsWith("image/")) {
      window.alert(t2("wg.uploadFailMime"));
      return;
    }
    if (file.size > MAX_ASSET_FILE_SIZE) {
      window.alert(t2("wg.uploadFailSize"));
      return;
    }
    if (assetsRef.current.length >= MAX_ASSETS) {
      window.alert(t2("wg.uploadFailCount", { max: MAX_ASSETS }));
      return;
    }
    const result = await controller2?.uploadAsset(file);
    if (result?.ok === true && result.id !== void 0) {
      const entryName = result.deduped === true ? file.name : result.name ?? file.name;
      props.onAssetsChange([...assetsRef.current, { id: result.id, name: entryName, mime: result.mime ?? file.type }]);
      if (result.deduped === true) {
        window.alert(t2("wg.uploadDedup"));
      }
    } else {
      window.alert(result?.error ?? t2("wg.uploadFailed"));
    }
  };
  const openCrop = (defId, assetId, dark = false) => {
    const def = WIDGETS.find((w) => w.id === defId);
    const ratio = WIDGET_CROP_RATIOS[defId];
    const asset = props.assets.find((item) => item.id === assetId);
    if (def === void 0 || ratio === void 0 || asset === void 0) return;
    setCropRequest({
      widgetId: defId,
      widgetName: def.name,
      ratio,
      sourceAssetId: assetId,
      sourceUrl: `/ui-presets/assets/${encodeURIComponent(assetId)}`,
      sourceName: asset.name,
      dark
    });
  };
  const handleCropConfirm = (crop) => {
    const request = cropRequest;
    setCropRequest(null);
    if (request === null) return;
    const round1 = (value) => String(Math.round(value * 10) / 10);
    const dark = request.dark;
    const nextWidgets = props.widgets.map((widget) => {
      if (widget.id !== request.widgetId) return widget;
      if (dark) {
        return {
          ...widget,
          params: {
            ...widget.params,
            assetIdDark: request.sourceAssetId,
            cropXDark: round1(crop.x),
            cropYDark: round1(crop.y),
            cropWDark: round1(crop.w),
            cropHDark: round1(crop.h)
          }
        };
      }
      return {
        ...widget,
        params: {
          ...widget.params,
          assetId: request.sourceAssetId,
          cropX: round1(crop.x),
          cropY: round1(crop.y),
          cropW: round1(crop.w),
          cropH: round1(crop.h)
        }
      };
    });
    props.onWidgetsChange(nextWidgets);
  };
  const removeAsset = (id) => {
    const nextAssets = props.assets.filter((asset) => asset.id !== id);
    const nextWidgets = props.widgets.map((widget) => {
      const params = { ...widget.params };
      for (const [key, value] of Object.entries(params)) {
        if (value === id) params[key] = "";
      }
      return { ...widget, params };
    });
    props.onAssetsAndWidgetsChange(nextAssets, nextWidgets);
    void controller2?.getAssetRefs(id).then((refs) => {
      const others = (refs ?? []).filter((ref) => ref.id !== props.presetId);
      if (others.length === 0) {
        void controller2?.deleteAsset(id);
      } else {
        setDeleteChoice({ assetId: id, refs: others });
      }
    });
  };
  const setWidgetEnabled = (defId, enabled) => {
    if (enabled) {
      if (props.widgets.some((w) => w.id === defId)) return;
      const def = WIDGETS.find((w) => w.id === defId);
      const params = {};
      for (const param of def?.params ?? []) params[param.key] = param.default ?? "";
      props.onWidgetsChange([...props.widgets, { id: defId, params }]);
    } else {
      props.onWidgetsChange(props.widgets.filter((w) => w.id !== defId));
    }
  };
  const setWidgetParam = (defId, key, value) => {
    props.onWidgetsChange(props.widgets.map((widget) => widget.id === defId ? { ...widget, params: { ...widget.params, [key]: value } } : widget));
  };
  const widgetEntry = (id) => props.widgets.find((w) => w.id === id);
  const quickApplyAsChatBackground = (assetId) => {
    const defId = "chat-background";
    if (widgetEntry(defId) === void 0) {
      const params = {};
      for (const param of WIDGETS.find((w) => w.id === defId)?.params ?? []) params[param.key] = param.default ?? "";
      props.onWidgetsChange([...props.widgets, { id: defId, params }]);
    }
    openCrop(defId, assetId);
  };
  const paramValue = (defId, key) => {
    const entry = widgetEntry(defId);
    const def = WIDGETS.find((widget) => widget.id === defId);
    const pdef = def?.params.find((item) => item.key === key);
    return entry?.params[key] ?? pdef?.default ?? "";
  };
  const renderParam = (def, param) => {
    if (param.visibleWhen !== void 0 && paramValue(def.id, param.visibleWhen.key) !== param.visibleWhen.equals) {
      return null;
    }
    const value = paramValue(def.id, param.key);
    if (param.type === "asset") {
      return /* @__PURE__ */ React7.createElement("label", { key: param.key, style: { display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "var(--dsw-alias-label-tertiary, #999)" } }, widgetParamLabel(param.key) ?? param.label, /* @__PURE__ */ React7.createElement(
        "select",
        {
          "aria-label": `${def.id} ${param.key}`,
          value,
          onChange: (e) => {
            const id = e.target.value;
            if (id === "") {
              props.onWidgetsChange(props.widgets.map((widget) => {
                if (widget.id !== def.id) return widget;
                const params = { ...widget.params, assetId: "" };
                delete params.cropX;
                delete params.cropY;
                delete params.cropW;
                delete params.cropH;
                return { ...widget, params };
              }));
            } else {
              openCrop(def.id, id);
            }
          },
          style: { fontSize: 11, padding: "2px 4px", borderRadius: 5, border: "1px solid var(--dsw-alias-border-l2)", background: "var(--dsw-alias-bg-layer-2)", color: "var(--dsw-alias-label-primary)" }
        },
        /* @__PURE__ */ React7.createElement("option", { value: "" }, t2("wg.none")),
        props.assets.map((asset) => /* @__PURE__ */ React7.createElement("option", { key: asset.id, value: asset.id }, asset.name))
      ));
    }
    if (param.type === "url") {
      const valid = value === "" || isSafeImageUrl(value);
      return /* @__PURE__ */ React7.createElement("label", { key: param.key, style: { display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "var(--dsw-alias-label-tertiary, #999)", flexWrap: "wrap" } }, widgetParamLabel(param.key) ?? param.label, /* @__PURE__ */ React7.createElement(
        "input",
        {
          type: "url",
          "aria-label": `${def.id} ${param.key}`,
          value,
          placeholder: "https://\u2026",
          spellCheck: false,
          maxLength: MAX_IMAGE_URL_LENGTH,
          onChange: (e) => {
            setWidgetParam(def.id, param.key, e.target.value);
          },
          style: {
            width: 220,
            fontSize: 11,
            padding: "2px 6px",
            borderRadius: 5,
            border: `1px solid ${valid ? "var(--dsw-alias-border-l2)" : "var(--dsw-alias-state-error-primary, #d94c4c)"}`,
            background: "var(--dsw-alias-bg-layer-2)",
            color: "var(--dsw-alias-label-primary)"
          }
        }
      ), !valid && /* @__PURE__ */ React7.createElement("span", { style: { fontSize: 10, color: "var(--dsw-alias-state-error-primary, #d94c4c)" } }, t2("wg.urlInvalid")));
    }
    if (param.type === "select") {
      return /* @__PURE__ */ React7.createElement("label", { key: param.key, style: { display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "var(--dsw-alias-label-tertiary, #999)" } }, widgetParamLabel(param.key) ?? param.label, /* @__PURE__ */ React7.createElement(
        "select",
        {
          "aria-label": `${def.id} ${param.key}`,
          value,
          onChange: (e) => {
            setWidgetParam(def.id, param.key, e.target.value);
          },
          style: { fontSize: 11, padding: "2px 4px", borderRadius: 5, border: "1px solid var(--dsw-alias-border-l2)", background: "var(--dsw-alias-bg-layer-2)", color: "var(--dsw-alias-label-primary)" }
        },
        param.options?.map((option) => /* @__PURE__ */ React7.createElement("option", { key: option.value, value: option.value }, option.label))
      ));
    }
    if (param.type === "range") {
      return /* @__PURE__ */ React7.createElement("label", { key: param.key, style: { display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "var(--dsw-alias-label-tertiary, #999)" } }, widgetParamLabel(param.key) ?? param.label, /* @__PURE__ */ React7.createElement(
        "input",
        {
          type: "range",
          "aria-label": `${def.id} ${param.key}`,
          min: param.min,
          max: param.max,
          step: param.step,
          value,
          onChange: (e) => {
            setWidgetParam(def.id, param.key, e.target.value);
          },
          style: { width: 110 }
        }
      ), /* @__PURE__ */ React7.createElement("span", { style: { minWidth: 34, textAlign: "right", fontVariantNumeric: "tabular-nums", color: "var(--dsw-alias-label-primary)" } }, Math.round((Number(value) || 0) * 100), "%"));
    }
    return /* @__PURE__ */ React7.createElement("label", { key: param.key, style: { display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "var(--dsw-alias-label-tertiary, #999)" } }, widgetParamLabel(param.key) ?? param.label, /* @__PURE__ */ React7.createElement(
      "input",
      {
        type: "number",
        "aria-label": `${def.id} ${param.key}`,
        min: param.min,
        max: param.max,
        step: param.step,
        value,
        onChange: (e) => {
          setWidgetParam(def.id, param.key, e.target.value);
        },
        style: { width: 56, fontSize: 11, padding: "2px 4px", borderRadius: 5, border: "1px solid var(--dsw-alias-border-l2)", background: "var(--dsw-alias-bg-layer-2)", color: "var(--dsw-alias-label-primary)" }
      }
    ));
  };
  const renderDarkSection = (def) => {
    const entry = widgetEntry(def.id);
    const source = entry?.params.source ?? "asset";
    const darkAssetId = entry?.params.assetIdDark ?? "";
    const darkOpacity = entry?.params.opacityDark ?? "1";
    const darkImageUrl = entry?.params.imageUrlDark ?? "";
    const darkGradient = entry?.params.gradientDark ?? "";
    return /* @__PURE__ */ React7.createElement("div", { "data-up-widget-dark": true, style: { paddingLeft: 10, marginTop: 4, borderLeft: "2px dashed var(--dsw-alias-border-l2)", display: "flex", flexDirection: "column", gap: 4 } }, /* @__PURE__ */ React7.createElement("span", { style: { fontSize: 11, fontWeight: 600, color: "var(--dsw-alias-label-secondary)" } }, t2("wg.darkLook")), /* @__PURE__ */ React7.createElement("div", { style: { display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" } }, source === "asset" && /* @__PURE__ */ React7.createElement("label", { style: { display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "var(--dsw-alias-label-tertiary, #999)" } }, t2("wg.asset"), /* @__PURE__ */ React7.createElement(
      "select",
      {
        "aria-label": `${def.id} assetIdDark`,
        value: darkAssetId,
        onChange: (e) => {
          const id = e.target.value;
          if (id === "") {
            props.onWidgetsChange(props.widgets.map((widget) => {
              if (widget.id !== def.id) return widget;
              const params = { ...widget.params };
              delete params.assetIdDark;
              delete params.cropXDark;
              delete params.cropYDark;
              delete params.cropWDark;
              delete params.cropHDark;
              return { ...widget, params };
            }));
          } else {
            openCrop(def.id, id, true);
          }
        },
        style: { fontSize: 11, padding: "2px 4px", borderRadius: 5, border: "1px solid var(--dsw-alias-border-l2)", background: "var(--dsw-alias-bg-layer-2)", color: "var(--dsw-alias-label-primary)" }
      },
      /* @__PURE__ */ React7.createElement("option", { value: "" }, t2("wg.none")),
      props.assets.map((asset) => /* @__PURE__ */ React7.createElement("option", { key: asset.id, value: asset.id }, asset.name))
    )), source === "url" && /* @__PURE__ */ React7.createElement("label", { style: { display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "var(--dsw-alias-label-tertiary, #999)", flexWrap: "wrap" } }, t2("wg.darkLink"), /* @__PURE__ */ React7.createElement(
      "input",
      {
        type: "url",
        "aria-label": `${def.id} imageUrlDark`,
        value: darkImageUrl,
        placeholder: t2("wg.darkLinkPlaceholder"),
        spellCheck: false,
        maxLength: MAX_IMAGE_URL_LENGTH,
        onChange: (e) => {
          setWidgetParam(def.id, "imageUrlDark", e.target.value);
        },
        style: {
          width: 200,
          fontSize: 11,
          padding: "2px 6px",
          borderRadius: 5,
          border: `1px solid ${darkImageUrl === "" || isSafeImageUrl(darkImageUrl) ? "var(--dsw-alias-border-l2)" : "var(--dsw-alias-state-error-primary, #d94c4c)"}`,
          background: "var(--dsw-alias-bg-layer-2)",
          color: "var(--dsw-alias-label-primary)"
        }
      }
    )), source === "gradient" && /* @__PURE__ */ React7.createElement("label", { style: { display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "var(--dsw-alias-label-tertiary, #999)" } }, t2("wg.darkGradient"), /* @__PURE__ */ React7.createElement(
      "select",
      {
        "aria-label": `${def.id} gradientDark`,
        value: darkGradient,
        onChange: (e) => {
          setWidgetParam(def.id, "gradientDark", e.target.value);
        },
        style: { fontSize: 11, padding: "2px 4px", borderRadius: 5, border: "1px solid var(--dsw-alias-border-l2)", background: "var(--dsw-alias-bg-layer-2)", color: "var(--dsw-alias-label-primary)" }
      },
      gradientOptions().map((option) => /* @__PURE__ */ React7.createElement("option", { key: option.value, value: option.value }, option.label))
    )), /* @__PURE__ */ React7.createElement("label", { style: { display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "var(--dsw-alias-label-tertiary, #999)" } }, t2("wg.opacity"), /* @__PURE__ */ React7.createElement(
      "input",
      {
        type: "range",
        "aria-label": `${def.id} opacityDark`,
        min: 0,
        max: 1,
        step: 0.01,
        value: darkOpacity,
        onChange: (e) => {
          setWidgetParam(def.id, "opacityDark", e.target.value);
        },
        style: { width: 110 }
      }
    ), /* @__PURE__ */ React7.createElement("span", { style: { minWidth: 34, textAlign: "right", fontVariantNumeric: "tabular-nums", color: "var(--dsw-alias-label-primary)" } }, Math.round((Number(darkOpacity) || 0) * 100), "%"))));
  };
  const schemeMode = props.widgets.some((w) => Object.keys(w.params).some((k) => k.endsWith("Dark")));
  const schemeChecked = schemeModeOn || schemeMode;
  const [confirmBox, setConfirmBox] = React7.useState(null);
  const [deleteChoice, setDeleteChoice] = React7.useState(null);
  const toggleSchemeMode = (checked) => {
    if (!checked && schemeMode) {
      setConfirmBox({
        message: t2("wg.darkClearConfirm"),
        action: () => {
          props.onWidgetsChange(props.widgets.map((widget) => {
            const params = { ...widget.params };
            for (const key of Object.keys(params)) {
              if (key.endsWith("Dark")) delete params[key];
            }
            return { ...widget, params };
          }));
          setSchemeModeOn(false);
        }
      });
      return;
    }
    setSchemeModeOn(checked);
  };
  return /* @__PURE__ */ React7.createElement("div", { "data-up-widget-editor": true, style: { display: "flex", flexDirection: "column", gap: 8 } }, /* @__PURE__ */ React7.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" } }, /* @__PURE__ */ React7.createElement("span", { style: { fontSize: 12, fontWeight: 600, color: "var(--dsw-alias-label-secondary)" } }, t2("wg.assetsTitle")), /* @__PURE__ */ React7.createElement(
    "button",
    {
      type: "button",
      "data-up-btn": true,
      onClick: () => {
        fileInputRef.current?.click();
      },
      style: { padding: "3px 10px", fontSize: 11 }
    },
    t2("wg.addAsset")
  ), /* @__PURE__ */ React7.createElement(
    "button",
    {
      type: "button",
      "data-up-btn": true,
      "data-up-layer-open": true,
      onClick: () => {
        setComposerOpen(true);
      },
      style: { padding: "3px 10px", fontSize: 11 },
      title: t2("wg.collageTitle")
    },
    t2("wg.collage")
  ), /* @__PURE__ */ React7.createElement(
    "input",
    {
      ref: fileInputRef,
      type: "file",
      accept: "image/*",
      style: { display: "none" },
      onChange: (e) => {
        addAsset(e.target.files?.[0]);
        e.target.value = "";
      }
    }
  ), /* @__PURE__ */ React7.createElement("span", { "data-up-status": true, style: { fontSize: 10 } }, t2("wg.assetCount", { count: props.assets.length, max: MAX_ASSETS })), /* @__PURE__ */ React7.createElement("label", { style: { display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "var(--dsw-alias-label-secondary)", cursor: "pointer", userSelect: "none", marginLeft: "auto" } }, /* @__PURE__ */ React7.createElement(
    "input",
    {
      type: "checkbox",
      "aria-label": t2("wg.splitSchemesAria"),
      "data-up-scheme-toggle": true,
      checked: schemeChecked,
      onChange: (e) => {
        toggleSchemeMode(e.target.checked);
      }
    }
  ), /* @__PURE__ */ React7.createElement("span", null, t2("wg.splitSchemes")))), props.assets.length > 0 && /* @__PURE__ */ React7.createElement("div", { style: { display: "flex", flexWrap: "wrap", gap: 6 } }, props.assets.map((asset) => {
    const chatEntry = widgetEntry("chat-background");
    const chatUses = chatEntry?.params.assetId === asset.id;
    return /* @__PURE__ */ React7.createElement(
      "span",
      {
        key: asset.id,
        "data-up-asset": true,
        style: { display: "flex", alignItems: "center", gap: 4, padding: "2px 8px", border: "1px solid var(--dsw-alias-border-l2)", borderRadius: 12, fontSize: 11, color: "var(--dsw-alias-label-secondary)" }
      },
      /* @__PURE__ */ React7.createElement(AssetThumb, { assetId: asset.id, size: 22, dataAttrs: { "data-up-asset-thumb": "" } }),
      asset.name,
      /* @__PURE__ */ React7.createElement(
        "button",
        {
          type: "button",
          "data-up-btn": true,
          "data-up-asset-quick": true,
          "aria-label": t2("wg.quickAria", { name: asset.name }),
          onClick: () => {
            quickApplyAsChatBackground(asset.id);
          },
          style: { padding: "0 6px", fontSize: 10, ...chatUses ? { background: "var(--dsw-alias-button-info-fill)", color: "#fff", borderColor: "transparent" } : {} },
          title: chatUses ? t2("wg.quickTitleCurrent") : t2("wg.quickTitle")
        },
        chatUses ? t2("wg.quickDone") : t2("wg.quickDo")
      ),
      /* @__PURE__ */ React7.createElement("button", { type: "button", "data-up-btn": true, "aria-label": t2("wg.deleteAria", { name: asset.name }), onClick: () => {
        removeAsset(asset.id);
      }, style: { padding: "0 4px", fontSize: 10 } }, "\u2715")
    );
  })), props.assets.length > 0 && !props.widgets.some((w) => Object.values(w.params).some((v) => v !== "")) && /* @__PURE__ */ React7.createElement("div", { "data-up-status": true, style: { fontSize: 10, color: "var(--dsw-alias-state-warn-primary, #b7791f)" } }, t2("wg.notActiveHint")), /* @__PURE__ */ React7.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 6 } }, WIDGETS.map((def) => {
    const enabled = widgetEntry(def.id) !== void 0;
    return /* @__PURE__ */ React7.createElement("div", { key: def.id, "data-up-widget": true, style: { display: "flex", flexDirection: "column", gap: 4, padding: 6, border: "1px solid var(--dsw-alias-border-l2)", borderRadius: 8, background: "var(--dsw-alias-bg-layer-1)" } }, /* @__PURE__ */ React7.createElement("label", { style: { display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "var(--dsw-alias-label-primary)", cursor: "pointer", userSelect: "none" } }, /* @__PURE__ */ React7.createElement(
      "input",
      {
        type: "checkbox",
        "aria-label": t2("wg.enableAria", { name: widgetLabel(def.id, "name") ?? def.name }),
        checked: enabled,
        onChange: (e) => {
          setWidgetEnabled(def.id, e.target.checked);
        }
      }
    ), /* @__PURE__ */ React7.createElement("span", { style: { fontWeight: 600 } }, widgetLabel(def.id, "name") ?? def.name), /* @__PURE__ */ React7.createElement("span", { style: { fontWeight: 400, color: "var(--dsw-alias-label-tertiary, #999)" } }, "\xB7 ", widgetLabel(def.id, "description") ?? def.description)), enabled && /* @__PURE__ */ React7.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 4 } }, schemeChecked && /* @__PURE__ */ React7.createElement("span", { style: { fontSize: 11, fontWeight: 600, color: "var(--dsw-alias-label-secondary)", paddingLeft: 22 } }, t2("wg.lightLook")), /* @__PURE__ */ React7.createElement("div", { style: { display: "flex", gap: 10, flexWrap: "wrap", paddingLeft: 22 } }, def.params.map((param) => renderParam(def, param))), schemeChecked && renderDarkSection(def), /* @__PURE__ */ React7.createElement(RotationPanel, { presetId: props.presetId, widgetId: def.id, isActive: activePresetId === props.presetId })));
  })), /* @__PURE__ */ React7.createElement("div", { "data-up-status": true, style: { fontSize: 10 } }, t2("wg.footer")), cropRequest !== null && /* @__PURE__ */ React7.createElement(
    CropDialog,
    {
      request: cropRequest,
      onConfirm: (crop) => {
        handleCropConfirm(crop);
      },
      onCancel: () => {
        setCropRequest(null);
      }
    }
  ), composerOpen && /* @__PURE__ */ React7.createElement(
    LayerComposerDialog,
    {
      assets: props.assets,
      onClose: () => {
        setComposerOpen(false);
      },
      onComposed: (asset) => {
        props.onAssetsChange([...props.assets, asset]);
      }
    }
  ), confirmBox !== null && /* @__PURE__ */ React7.createElement(
    ConfirmDialog,
    {
      message: confirmBox.message,
      confirmLabel: t2("wg.clear"),
      onConfirm: () => {
        const action = confirmBox.action;
        setConfirmBox(null);
        action();
      },
      onCancel: () => {
        setConfirmBox(null);
      }
    }
  ), deleteChoice !== null && /* @__PURE__ */ React7.createElement(
    "div",
    {
      "data-up-delete-choice": true,
      role: "dialog",
      "aria-label": t2("wg.deleteAriaShort"),
      tabIndex: -1,
      onKeyDownCapture: (e) => {
        if (e.key === "Escape") {
          e.stopPropagation();
          setDeleteChoice(null);
        }
      },
      style: {
        position: "fixed",
        inset: 0,
        zIndex: 1300,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0, 0, 0, 0.45)",
        outline: "none"
      }
    },
    /* @__PURE__ */ React7.createElement(
      "div",
      {
        style: {
          width: "min(440px, calc(100vw - 48px))",
          background: "var(--dsw-alias-bg-layer-1, #fff)",
          color: "var(--dsw-alias-label-primary, #111)",
          borderRadius: 12,
          padding: 16,
          border: "1px solid var(--dsw-alias-border-l2, #ddd)",
          boxShadow: "0 12px 40px rgba(0,0,0,0.3)",
          display: "flex",
          flexDirection: "column",
          gap: 12
        }
      },
      /* @__PURE__ */ React7.createElement("span", { style: { fontSize: 13, lineHeight: 1.6, whiteSpace: "pre-wrap" } }, t2("wg.deleteUsedIn", { count: deleteChoice.refs.length, names: deleteChoice.refs.map((r) => r.name).join(locale === "en" ? ", " : "\u3001") })),
      /* @__PURE__ */ React7.createElement("div", { style: { display: "flex", justifyContent: "flex-end", gap: 8 } }, /* @__PURE__ */ React7.createElement("button", { type: "button", "data-up-btn": true, onClick: () => {
        setDeleteChoice(null);
      } }, t2("wg.cancel")), /* @__PURE__ */ React7.createElement(
        "button",
        {
          type: "button",
          "data-up-btn": true,
          onClick: () => {
            const choice = deleteChoice;
            setDeleteChoice(null);
            void controller2?.deleteAsset(choice.assetId, { presetId: props.presetId });
          }
        },
        t2("wg.removeFromPreset")
      ), /* @__PURE__ */ React7.createElement(
        "button",
        {
          type: "button",
          "data-up-btn": true,
          "data-up-btn-primary": true,
          onClick: () => {
            const choice = deleteChoice;
            setDeleteChoice(null);
            void controller2?.deleteAsset(choice.assetId);
          }
        },
        t2("wg.deletePermanently")
      ))
    )
  ));
}

// src/client/cover-render.ts
function coverSource(preset2) {
  const cover = preset2.cover;
  if (cover === void 0 || cover.assetId === "") return coverDataUrlFor(preset2);
  const asset = (preset2.assets ?? []).find((item) => item.id === cover.assetId);
  if (asset === void 0) return coverDataUrlFor(preset2);
  return asset.dataUrl ?? `/ui-presets/assets/${encodeURIComponent(cover.assetId)}`;
}
function renderCoverFor(preset2) {
  const cover = preset2.cover;
  if (cover === void 0 || cover.assetId === "") return Promise.resolve(coverDataUrlFor(preset2));
  const hasCrop = typeof cover.cropX === "string" && cover.cropX !== "" && typeof cover.cropW === "string" && cover.cropW !== "";
  if (!hasCrop) return Promise.resolve(coverSource(preset2));
  const src = coverSource(preset2);
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      try {
        const W = 900;
        const H = 300;
        const rect = coverDestRect(
          { x: Number(cover.cropX), y: Number(cover.cropY), w: Number(cover.cropW), h: Number(cover.cropH) },
          { w: W, h: H }
        );
        if (rect === null || img.naturalWidth <= 0 || img.naturalHeight <= 0) {
          resolve(src);
          return;
        }
        const canvas = document.createElement("canvas");
        canvas.width = W;
        canvas.height = H;
        const ctx = canvas.getContext("2d");
        if (ctx === null) {
          resolve(src);
          return;
        }
        ctx.clearRect(0, 0, W, H);
        ctx.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight, rect.x, rect.y, rect.w, rect.h);
        resolve(canvas.toDataURL("image/png"));
      } catch {
        resolve(src);
      }
    };
    img.onerror = () => {
      resolve(coverDataUrlFor(preset2));
    };
    img.src = src;
  });
}

// src/client/advanced-panels.tsx
var React8 = __toESM(require("react"), 1);
var sectionStyle = {
  borderTop: "1px solid var(--dsw-alias-border-l2)",
  paddingTop: 8,
  display: "flex",
  flexDirection: "column",
  gap: 6
};
var headStyle = {
  fontSize: 12,
  fontWeight: 600,
  color: "var(--dsw-alias-label-secondary)",
  cursor: "pointer",
  userSelect: "none"
};
var inputStyle2 = {
  fontFamily: "var(--ds-font-family-code)",
  fontSize: 11,
  padding: "4px 6px",
  borderRadius: 6,
  border: "1px solid var(--dsw-alias-border-l2)",
  background: "var(--dsw-alias-bg-layer-1)",
  color: "var(--dsw-alias-label-primary)"
};
var hintStyle = {
  fontSize: 10,
  color: "var(--dsw-alias-label-tertiary, #999)",
  lineHeight: 1.5
};
var errorStyle = {
  fontSize: 10,
  color: "var(--dsw-alias-state-error-primary, #d94c4c)"
};
function ruleError(rule) {
  if (rule.selector === "" && rule.rules === "") return null;
  if (rule.selector === "") return t("css.errEmpty");
  if (!isAllowedCssSelector(rule.selector)) return t("css.errSelector");
  if (/[{}]/.test(rule.rules)) return t("css.errBraces");
  if (rule.rules.length > MAX_CSS_RULES_LENGTH) return t("css.errLength", { max: MAX_CSS_RULES_LENGTH });
  return null;
}
function CssPatchPanel(props) {
  const { t: t2 } = useI18n();
  const [open, setOpen] = React8.useState(false);
  const invalid = props.css.filter((rule) => ruleError(rule) !== null).length;
  const replace = (index, patch) => {
    props.onChange(props.css.map((rule, i) => i === index ? { ...rule, ...patch } : rule));
  };
  return /* @__PURE__ */ React8.createElement("div", { "data-up-css-panel": true, style: sectionStyle }, /* @__PURE__ */ React8.createElement(
    "div",
    {
      "data-up-css-head": true,
      style: headStyle,
      onClick: () => {
        setOpen((prev) => !prev);
      },
      role: "button",
      tabIndex: 0,
      onKeyDown: (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          setOpen((prev) => !prev);
        }
      }
    },
    /* @__PURE__ */ React8.createElement("span", null, open ? "\u25BE" : "\u25B8"),
    " ",
    t2("css.title"),
    /* @__PURE__ */ React8.createElement("span", { style: { fontWeight: 400, color: "var(--dsw-alias-label-tertiary, #999)" } }, t2("css.count", { count: props.css.length }), invalid > 0 ? t2("css.invalid", { count: invalid }) : "")
  ), open && /* @__PURE__ */ React8.createElement(React8.Fragment, null, /* @__PURE__ */ React8.createElement("div", { style: hintStyle }, t2("css.hint")), props.css.map((rule, index) => {
    const error = ruleError(rule);
    return /* @__PURE__ */ React8.createElement("div", { key: index, "data-up-css-row": true, style: { display: "flex", flexDirection: "column", gap: 4, padding: 6, borderRadius: 8, border: "1px solid var(--dsw-alias-border-l2)" } }, /* @__PURE__ */ React8.createElement("div", { style: { display: "flex", gap: 6 } }, /* @__PURE__ */ React8.createElement(
      "input",
      {
        "aria-label": `CSS \u9009\u62E9\u5668 ${index + 1}`,
        placeholder: "[data-up-card]",
        value: rule.selector,
        spellCheck: false,
        onChange: (e) => {
          replace(index, { selector: e.target.value });
        },
        style: { ...inputStyle2, flex: 1 }
      }
    ), /* @__PURE__ */ React8.createElement(
      "button",
      {
        type: "button",
        "data-up-css-del": true,
        onClick: () => {
          props.onChange(props.css.filter((_, i) => i !== index));
        },
        style: { border: "none", background: "transparent", color: "var(--dsw-alias-state-error-primary, #d94c4c)", fontSize: 11, cursor: "pointer" }
      },
      t2("css.delete")
    )), /* @__PURE__ */ React8.createElement(
      "textarea",
      {
        "aria-label": `CSS \u58F0\u660E ${index + 1}`,
        placeholder: "border-color: var(--dsw-alias-brand-primary)",
        value: rule.rules,
        spellCheck: false,
        rows: 2,
        onChange: (e) => {
          replace(index, { rules: e.target.value });
        },
        style: { ...inputStyle2, resize: "vertical" }
      }
    ), error !== null && /* @__PURE__ */ React8.createElement("div", { style: errorStyle }, error));
  }), /* @__PURE__ */ React8.createElement(
    "button",
    {
      type: "button",
      "data-up-css-add": true,
      onClick: () => {
        props.onChange([...props.css, { selector: "", rules: "" }]);
      },
      style: { alignSelf: "flex-start", fontSize: 11, padding: "3px 10px", borderRadius: 6, border: "1px solid var(--dsw-alias-border-l2)", background: "var(--dsw-alias-bg-layer-2)", color: "var(--dsw-alias-label-primary)", cursor: "pointer" }
    },
    t2("css.add")
  )));
}
function ThemeRegisterPanel(props) {
  const { t: t2 } = useI18n();
  const [open, setOpen] = React8.useState(false);
  const themeId = `${props.presetId ?? "preset"}-theme`;
  const canEnable = props.tokenCount > 0;
  return /* @__PURE__ */ React8.createElement("div", { "data-up-theme-panel": true, style: sectionStyle }, /* @__PURE__ */ React8.createElement(
    "div",
    {
      "data-up-theme-head": true,
      style: headStyle,
      onClick: () => {
        setOpen((prev) => !prev);
      },
      role: "button",
      tabIndex: 0,
      onKeyDown: (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          setOpen((prev) => !prev);
        }
      }
    },
    /* @__PURE__ */ React8.createElement("span", null, open ? "\u25BE" : "\u25B8"),
    " ",
    t2("theme.title"),
    /* @__PURE__ */ React8.createElement("span", { style: { fontWeight: 400, color: "var(--dsw-alias-label-tertiary, #999)" } }, props.theme.enabled ? t2("theme.on", { scheme: props.theme.colorScheme }) : t2("theme.off"))
  ), open && /* @__PURE__ */ React8.createElement(React8.Fragment, null, /* @__PURE__ */ React8.createElement("label", { style: { display: "flex", alignItems: "center", gap: 6, fontSize: 12 } }, /* @__PURE__ */ React8.createElement(
    "input",
    {
      type: "checkbox",
      "data-up-theme-enable": true,
      checked: props.theme.enabled,
      disabled: !canEnable,
      onChange: (e) => {
        props.onChange({ ...props.theme, enabled: e.target.checked });
      }
    }
  ), t2("theme.enable")), !canEnable && /* @__PURE__ */ React8.createElement("div", { style: hintStyle }, t2("theme.needTokens")), /* @__PURE__ */ React8.createElement("label", { style: { display: "flex", alignItems: "center", gap: 6, fontSize: 12 } }, t2("theme.scheme"), /* @__PURE__ */ React8.createElement(
    "select",
    {
      "data-up-theme-scheme": true,
      value: props.theme.colorScheme,
      onChange: (e) => {
        props.onChange({ ...props.theme, colorScheme: e.target.value === "light" ? "light" : "dark" });
      },
      style: { ...inputStyle2, fontFamily: "inherit" }
    },
    /* @__PURE__ */ React8.createElement("option", { value: "dark" }, t2("theme.schemeDark")),
    /* @__PURE__ */ React8.createElement("option", { value: "light" }, t2("theme.schemeLight"))
  )), /* @__PURE__ */ React8.createElement("div", { style: hintStyle }, t2("theme.hint", { id: themeId }))));
}

// src/client/knob-editor.tsx
var React9 = __toESM(require("react"), 1);

// src/core/contrast.ts
function parseRgbColor(value) {
  const str = value.trim();
  const hex = /^#([0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/i.exec(str);
  if (hex !== null) {
    const h = hex[1];
    if (h.length === 3 || h.length === 4) {
      const r = parseInt(h[0] + h[0], 16);
      const g = parseInt(h[1] + h[1], 16);
      const b = parseInt(h[2] + h[2], 16);
      return { r, g, b };
    }
    return {
      r: parseInt(h.slice(0, 2), 16),
      g: parseInt(h.slice(2, 4), 16),
      b: parseInt(h.slice(4, 6), 16)
    };
  }
  const rgb = /^rgba?\(\s*(\d{1,3})\s*[, ]\s*(\d{1,3})\s*[, ]\s*(\d{1,3})(?:\s*[,/]\s*[\d.]+)?\s*\)$/i.exec(str);
  if (rgb !== null) {
    const r = Number(rgb[1]);
    const g = Number(rgb[2]);
    const b = Number(rgb[3]);
    if (r > 255 || g > 255 || b > 255) return null;
    return { r, g, b };
  }
  const hsl = /^hsla?\(\s*([\d.]+)(?:deg)?\s*[, ]\s*([\d.]+)%\s*[, ]\s*([\d.]+)%(?:\s*[,/]\s*[\d.]+)?\s*\)$/i.exec(str);
  if (hsl !== null) {
    return hslToRgb(Number(hsl[1]) % 360, Number(hsl[2]), Number(hsl[3]));
  }
  return null;
}
function hslToRgb(h, s, l) {
  const sn = Math.min(100, Math.max(0, s)) / 100;
  const ln = Math.min(100, Math.max(0, l)) / 100;
  const c = (1 - Math.abs(2 * ln - 1)) * sn;
  const hp = h / 60;
  const x = c * (1 - Math.abs(hp % 2 - 1));
  let rgb;
  if (hp < 1) rgb = [c, x, 0];
  else if (hp < 2) rgb = [x, c, 0];
  else if (hp < 3) rgb = [0, c, x];
  else if (hp < 4) rgb = [0, x, c];
  else if (hp < 5) rgb = [x, 0, c];
  else rgb = [c, 0, x];
  const m = ln - c / 2;
  return {
    r: Math.round((rgb[0] + m) * 255),
    g: Math.round((rgb[1] + m) * 255),
    b: Math.round((rgb[2] + m) * 255)
  };
}

// src/core/color-derive.ts
function alphaOf(value) {
  const m = /^\s*(?:rgba?|hsla?)\([^)]*[,/]\s*([\d.]+)\s*\)\s*$/i.exec(value.trim());
  if (m === null) return 1;
  const a = Number(m[1]);
  return Number.isFinite(a) ? Math.min(1, Math.max(0, a)) : 1;
}
function fmt(n) {
  return String(Math.round(n * 1e3) / 1e3);
}
function toCss(rgb, alpha) {
  const hex = "#" + [rgb.r, rgb.g, rgb.b].map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0")).join("");
  return alpha >= 0.999 ? hex : `rgba(${Math.round(rgb.r)}, ${Math.round(rgb.g)}, ${Math.round(rgb.b)}, ${fmt(alpha)})`;
}
function mixTo(rgb, target, amount) {
  const t2 = Math.min(1, Math.max(0, amount));
  return {
    r: rgb.r + (target.r - rgb.r) * t2,
    g: rgb.g + (target.g - rgb.g) * t2,
    b: rgb.b + (target.b - rgb.b) * t2
  };
}
function deriveColor(base, mode, amount, scheme) {
  const parsed = parseRgbColor(base);
  if (parsed === null) return base;
  const alpha = alphaOf(base);
  if (mode === "alpha") return toCss(parsed, Math.min(1, Math.max(0, amount)));
  const target = mode === "lighter" ? { r: 255, g: 255, b: 255 } : mode === "darker" ? { r: 0, g: 0, b: 0 } : scheme === "light" ? { r: 0, g: 0, b: 0 } : { r: 255, g: 255, b: 255 };
  return toCss(mixTo(parsed, target, amount), alpha);
}
function deriveFromBase(base, rule, scheme) {
  if (rule === void 0 || base === "") return base;
  const amount = scheme === "dark" && rule.amountDark !== void 0 ? rule.amountDark : rule.amount;
  return deriveColor(base, rule.mode, amount, scheme);
}

// src/core/knobs.ts
var KNOB_CATEGORIES = [
  { id: "spatial", name: "\u7A7A\u95F4\u5B9A\u4F4D", description: "\u754C\u9762\u5404\u533A\u57DF\u7684\u5E95\u8272\u4E0E\u6D6E\u5C42" },
  { id: "layers", name: "\u80CC\u666F\u5C42\u6B21", description: "\u8FB9\u6846\u4E0E\u5206\u9694" },
  { id: "accent", name: "\u5F3A\u8C03\u8272", description: "\u54C1\u724C\u4E0E\u4E3B\u64CD\u4F5C" },
  { id: "text", name: "\u6587\u5B57\u53EF\u8BFB\u6027", description: "\u6587\u5B57\u989C\u8272\u4E0E\u5B57\u4F53" },
  { id: "feedback", name: "\u4EA4\u4E92\u53CD\u9988", description: "\u72B6\u6001\u4E0E\u60AC\u505C" },
  { id: "layout", name: "\u5E03\u5C40\u4E0E\u6392\u7248", description: "\u5BBD\u5EA6\u3001\u5706\u89D2\u3001\u52A8\u6548\u4E0E\u9634\u5F71" }
];
var RADIUS_TOKENS = ["--dsw-radius-xs", "--dsw-radius-sm", "--dsw-radius-md", "--dsw-radius-lg", "--dsw-radius-xl", "--dsw-radius-panel"];
function radiusOption(label, xs, sm, md, lg, xl, panel) {
  return {
    label,
    value: label,
    values: {
      "--dsw-radius-xs": xs,
      "--dsw-radius-sm": sm,
      "--dsw-radius-md": md,
      "--dsw-radius-lg": lg,
      "--dsw-radius-xl": xl,
      "--dsw-radius-panel": panel
    }
  };
}
var KNOBS = [
  // —— 空间定位（界面分区底色） ——
  { id: "spatial-bg", category: "spatial", name: "\u80CC\u666F", description: "\u6574\u4E2A\u754C\u9762\u7684\u5E95\u8272\uFF0C\u6700\u5F71\u54CD\u89C2\u611F", control: "color", bundle: ["--dsw-alias-bg-base"] },
  {
    id: "spatial-layer",
    category: "spatial",
    name: "\u62AC\u5347\u9762",
    description: "\u5361\u7247\u3001\u8F93\u5165\u6846\u3001\u5F39\u5C42\u6D6E\u51FA\u7684\u5C42\u6B21\u8272\uFF08\u81EA\u52A8\u751F\u6210\u4E24\u7EA7\u9636\u68AF\uFF09",
    control: "color",
    bundle: ["--dsw-alias-bg-layer-1", "--dsw-alias-bg-layer-2", "--dsw-alias-bg-layer-3"],
    derives: {
      "--dsw-alias-bg-layer-2": { mode: "shade", amount: 0.1 },
      "--dsw-alias-bg-layer-3": { mode: "shade", amount: 0.18 }
    }
  },
  { id: "spatial-sidebar", category: "spatial", name: "\u4FA7\u8FB9\u680F", description: "\u5DE6\u4FA7\u5BFC\u822A\u680F\u80CC\u666F", control: "color", bundle: ["--dsw-specific-sidebar-fill"] },
  { id: "spatial-bubble", category: "spatial", name: "\u5BF9\u8BDD\u6C14\u6CE1", description: "\u4F1A\u8BDD\u533A\u6D88\u606F\u6C14\u6CE1\u5E95\u8272", control: "color", bundle: ["--dsw-specific-bubble"] },
  { id: "spatial-input", category: "spatial", name: "\u8F93\u5165\u6846", description: "\u5E95\u90E8\u8F93\u5165\u5361\u5E95\u8272", control: "color", bundle: ["--dsw-specific-input-major"] },
  {
    id: "spatial-menu",
    category: "spatial",
    name: "\u83DC\u5355\u4E0E\u60AC\u6D6E\u5C42",
    description: "\u83DC\u5355\u3001\u63D0\u793A\u3001\u9009\u62E9\u5668\u3001\u906E\u7F69\uFF08\u81EA\u52A8\u5206\u5C42\uFF09",
    control: "color",
    bundle: ["--dsw-specific-menu", "--dsw-specific-tip", "--dsw-specific-selector", "--dsw-alias-bg-overlay"],
    derives: {
      "--dsw-specific-tip": { mode: "shade", amount: 0.04 },
      "--dsw-specific-selector": { mode: "shade", amount: 0.08 },
      "--dsw-alias-bg-overlay": { mode: "alpha", amount: 0.6 }
    }
  },
  // —— 背景层次（边框与分隔） ——
  { id: "border-level", category: "layers", name: "\u8FB9\u6846\u6DF1\u6D45", description: "\u5361\u7247\u4E0E\u5206\u533A\u7684\u4E00\u7EA7\u8FB9\u6846\uFF08\u7EC6\u5206\u7559\u9AD8\u7EA7\u4EE4\u724C\uFF09", control: "color", bundle: ["--dsw-alias-border-l2"] },
  // —— 强调色（品牌与主操作） ——
  { id: "accent-brand", category: "accent", name: "\u4E3B\u8272", description: "\u54C1\u724C\u4E3B\u8272\u3001\u4E3B\u6309\u94AE\u3001\u4E1A\u52A1\u72B6\u6001\u4E00\u6B21\u5168\u6539", control: "color", bundle: ["--dsw-alias-brand-primary", "--dsw-alias-button-info-fill", "--dsw-alias-state-business-primary"] },
  { id: "accent-hover", category: "accent", name: "\u60AC\u505C\u8272", description: "\u4E3B\u6309\u94AE\u60AC\u505C\u53CD\u9988", control: "color", bundle: ["--dsw-alias-button-info-hover"] },
  {
    id: "button-family",
    category: "accent",
    name: "\u6309\u94AE\u5BB6\u65CF",
    description: "\u4E3B\u6309\u94AE/\u4FE1\u606F\u6309\u94AE/\u4E1A\u52A1\u72B6\u6001 + \u60AC\u505C\u6001\uFF08\u60AC\u505C\u81EA\u52A8\u52A0\u6DF1\u6216\u63D0\u4EAE\uFF09",
    control: "color",
    bundle: [
      "--dsw-alias-button-primary-fill",
      "--dsw-alias-button-info-fill",
      "--dsw-alias-state-business-primary",
      "--dsw-alias-button-primary-hover",
      "--dsw-alias-button-info-hover"
    ],
    derives: {
      "--dsw-alias-button-primary-hover": { mode: "shade", amount: 0.18 },
      "--dsw-alias-button-info-hover": { mode: "shade", amount: 0.18 }
    }
  },
  // —— 文字可读性 ——
  { id: "text-primary", category: "text", name: "\u4E3B\u6587\u5B57", description: "\u6B63\u6587\u4E0E\u6807\u9898\u8272", control: "color", bundle: ["--dsw-alias-label-primary"] },
  { id: "text-secondary", category: "text", name: "\u6B21\u8981\u6587\u5B57", description: "\u63CF\u8FF0\u4E0E\u8BF4\u660E\u6587\u5B57\u8272", control: "color", bundle: ["--dsw-alias-label-secondary"] },
  { id: "text-tertiary", category: "text", name: "\u8F85\u52A9\u6587\u5B57", description: "\u5F31\u5316\u4E0E\u5360\u4F4D\u6587\u5B57\u8272", control: "color", bundle: ["--dsw-alias-label-tertiary"] },
  {
    id: "font-family",
    category: "text",
    name: "\u5B57\u4F53\u6863",
    description: "\u5168\u5C40\u5B57\u4F53\u98CE\u683C",
    control: "font",
    bundle: ["--dsw-font-family"],
    options: [
      { label: "\u7CFB\u7EDF\u9ED8\u8BA4", value: "" },
      { label: "\u886C\u7EBF", value: 'Georgia, "Songti SC", "SimSun", serif' },
      { label: "\u5706\u4F53", value: '"Arial Rounded MT Bold", "PingFang SC", "Microsoft YaHei", system-ui, sans-serif' },
      { label: "\u7B49\u5BBD", value: '"JetBrains Mono", "SF Mono", Consolas, monospace' }
    ]
  },
  // —— 交互反馈 ——
  { id: "state-error", category: "feedback", name: "\u9519\u8BEF\u8272", description: "\u62A5\u9519\u4E0E\u5931\u8D25\u63D0\u793A", control: "color", bundle: ["--dsw-alias-state-error-primary"] },
  { id: "state-warn", category: "feedback", name: "\u8B66\u544A\u8272", description: "\u8B66\u793A\u4E0E\u672A\u4FDD\u5B58\u63D0\u793A", control: "color", bundle: ["--dsw-alias-state-warn-primary"] },
  { id: "state-success", category: "feedback", name: "\u6210\u529F\u8272", description: "\u6210\u529F\u63D0\u793A", control: "color", bundle: ["--dsw-alias-state-success-primary"] },
  { id: "interactive-hover", category: "feedback", name: "\u60AC\u505C\u53CD\u9988", description: "\u53EF\u4EA4\u4E92\u5143\u7D20\u60AC\u505C\u5E95\u8272", control: "color", bundle: ["--dsw-alias-interactive-bg-hover"] },
  // —— 布局与排版（#111 新增：圆角/形状/毛玻璃/动效/阴影/代码面） ——
  {
    id: "radius-scale",
    category: "layout",
    name: "\u5706\u89D2\u6863",
    description: "\u5168\u5C40\u5706\u89D2\u5927\u5C0F\uFF08\u6309\u94AE/\u83DC\u5355/\u5F39\u5C42\u4E00\u8D77\u53D8\uFF09",
    control: "select",
    bundle: RADIUS_TOKENS,
    options: [
      radiusOption("\u76F4\u89D2", "0px", "0px", "1px", "2px", "2px", "4px"),
      radiusOption("\u5FAE\u5706", "2px", "4px", "6px", "8px", "10px", "12px"),
      radiusOption("\u6807\u51C6", "4px", "8px", "12px", "16px", "20px", "28px"),
      radiusOption("\u5927\u5706", "8px", "14px", "20px", "26px", "32px", "40px"),
      radiusOption("\u80F6\u56CA", "12px", "18px", "24px", "30px", "36px", "44px")
    ]
  },
  {
    id: "corner-shape",
    category: "layout",
    name: "\u5706\u89D2\u5F62\u72B6",
    description: "\u5E72\u51C0\u5706\u89D2 vs \u679C\u51BB\u65B9\u611F\uFF08superellipse\uFF09",
    control: "select",
    bundle: ["--dsw-corner-shape"],
    options: [
      { label: "\u6807\u51C6\u5706\u89D2", value: "round" },
      { label: "\u679C\u51BB\u65B9\u611F", value: "superellipse(1.5)" }
    ]
  },
  {
    id: "mask-blur",
    category: "layout",
    name: "\u6BDB\u73BB\u7483\u5F3A\u5EA6",
    description: "\u5F39\u5C42\u906E\u7F69\u7684\u6A21\u7CCA\u7A0B\u5EA6",
    control: "select",
    bundle: ["--dsw-mask-blur"],
    options: [
      { label: "\u5173\u95ED", value: "none" },
      { label: "\u8F7B", value: "blur(2px)" },
      { label: "\u5F3A", value: "blur(8px)" },
      { label: "\u6781\u5F3A", value: "blur(16px)" }
    ]
  },
  {
    id: "motion-speed",
    category: "layout",
    name: "\u52A8\u6548\u6863",
    description: "\u5168\u5C40\u8FC7\u6E21\u901F\u5EA6\uFF08\u60AC\u505C/\u5C55\u5F00/\u5F39\u5C42\uFF09",
    control: "select",
    bundle: ["--ds-transition-duration", "--ds-transition-duration-fast", "--ds-transition-duration-slow"],
    options: [
      { label: "\u5E72\u8106", value: "snappy", values: { "--ds-transition-duration": "0.12s", "--ds-transition-duration-fast": "0.06s", "--ds-transition-duration-slow": "0.2s" } },
      { label: "\u6807\u51C6", value: "normal", values: { "--ds-transition-duration": "0.2s", "--ds-transition-duration-fast": "0.1s", "--ds-transition-duration-slow": "0.3s" } },
      { label: "\u8212\u7F13", value: "slow", values: { "--ds-transition-duration": "0.32s", "--ds-transition-duration-fast": "0.16s", "--ds-transition-duration-slow": "0.48s" } }
    ]
  },
  {
    id: "shadow-level",
    category: "layout",
    name: "\u9634\u5F71\u6863",
    description: "\u5361\u7247\u6D6E\u8D77\u9634\u5F71\u5F3A\u5EA6\uFF08\u4E09\u6863\u9634\u5F71\u4E00\u8D77\u7F29\u653E\uFF09",
    control: "select",
    bundle: ["--dsw-shadow-lv2", "--dsw-shadow-lv1", "--dsw-shadow-lv3"],
    options: [
      { label: "\u65E0", value: "none", values: { "--dsw-shadow-lv1": "none", "--dsw-shadow-lv2": "none", "--dsw-shadow-lv3": "none" } },
      {
        label: "\u67D4\u548C",
        value: "soft",
        // 与目录默认值逐字一致——回读（tokensToKnobValue）才能认出「当前就是柔和档」
        values: {
          "--dsw-shadow-lv1": "0 2px 4px 0 rgba(0, 0, 0, 0.05)",
          "--dsw-shadow-lv2": "0 4px 12px 0 rgba(0, 0, 0, 0.02), 0 2px 8px 0 rgba(0, 0, 0, 0.04)",
          "--dsw-shadow-lv3": "0 0 1px 0 rgba(0, 0, 0, 0.2), 0 0 4px 0 rgba(0, 0, 0, 0.02), 0 12px 32px 0 rgba(0, 0, 0, 0.08)"
        }
      },
      {
        label: "\u660E\u663E",
        value: "strong",
        values: {
          "--dsw-shadow-lv1": "0 2px 6px 0 rgba(0, 0, 0, 0.08)",
          "--dsw-shadow-lv2": "0 8px 24px 0 rgba(0, 0, 0, 0.12), 0 4px 12px 0 rgba(0, 0, 0, 0.1)",
          "--dsw-shadow-lv3": "0 16px 40px 0 rgba(0, 0, 0, 0.18)"
        }
      }
    ]
  },
  {
    id: "settings-card",
    category: "spatial",
    name: "\u8BBE\u7F6E\u5361\u9762",
    description: "\u8BBE\u7F6E\u9762\u677F\u5361\u7247\u5E95\u8272\uFF08\u63CF\u8FB9\u7559\u9AD8\u7EA7\u4EE4\u724C\uFF09",
    control: "color",
    // #113：描边不再进束——「边框」用 alpha(fill) 派生出来是半透明填充色而不是边框线，
    // 必然与手调描边冲突（旋钮行永远挂「束内已单独调整」）。描边交给高级令牌区。
    bundle: ["--dsw-alias-settings-card-fill"]
  },
  {
    id: "markdown-surfaces",
    category: "spatial",
    name: "\u4EE3\u7801\u4E0E\u5F15\u7528\u9762",
    description: "\u4EE3\u7801\u5757/\u884C\u5185\u4EE3\u7801/\u5F15\u7528/\u6807\u7B7E\u5E95\u8272\uFF08\u81EA\u52A8\u5206\u5C42\uFF09",
    control: "color",
    bundle: [
      "--dsw-alias-markdown-code-block",
      "--dsw-alias-markdown-code-block-banner",
      "--dsw-alias-markdown-inline-code",
      "--dsw-alias-markdown-citation",
      "--dsw-alias-markdown-tag"
    ],
    derives: {
      "--dsw-alias-markdown-code-block-banner": { mode: "shade", amount: 0.04 },
      "--dsw-alias-markdown-inline-code": { mode: "shade", amount: 0.08 },
      "--dsw-alias-markdown-citation": { mode: "shade", amount: 0.03 },
      "--dsw-alias-markdown-tag": { mode: "shade", amount: 0.06 }
    }
  },
  {
    id: "overlay-surfaces",
    category: "spatial",
    name: "\u63D0\u793A\u4E0E\u6D6E\u5C42",
    description: "\u8F7B\u63D0\u793A\uFF08toast\uFF09\u4E0E\u60AC\u505C\u63D0\u793A\uFF08tooltip\uFF09\u5E95\u8272",
    control: "color",
    bundle: ["--dsw-alias-toast-bg", "--dsw-alias-tooltip-bg"],
    derives: { "--dsw-alias-tooltip-bg": { mode: "shade", amount: 0.04 } }
  },
  {
    id: "layout-width",
    category: "layout",
    name: "\u5185\u5BB9\u5BBD\u5EA6",
    description: "\u4F1A\u8BDD\u6B63\u6587\u6700\u5927\u5BBD\u5EA6",
    control: "number",
    bundle: ["--dsh-chat-content-width"],
    fallback: { "--dsh-chat-content-width": { light: "748px", dark: "748px" } },
    min: 640,
    max: 1280,
    step: 20,
    unit: "px"
  }
];
function findKnob(id) {
  return KNOBS.find((knob) => knob.id === id);
}
function knobDefaultFor(knobId, tokenName, scheme) {
  const knob = findKnob(knobId);
  if (knob === void 0) return "";
  const entry = findToken(tokenName);
  if (entry !== void 0) return scheme === "dark" ? entry.dark : entry.light;
  const fb = knob.fallback?.[tokenName];
  if (fb !== void 0) return scheme === "dark" ? fb.dark : fb.light;
  return "";
}
function valueForToken(knob, token, base, scheme) {
  if (token === knob.bundle[0]) return base;
  return deriveFromBase(base, knob.derives?.[token], scheme);
}
function knobValueForScheme(knobId, value, scheme) {
  const knob = findKnob(knobId);
  const out = {};
  if (knob === void 0) return out;
  const option = knob.options?.find((o) => o.values !== void 0 && (o.value === value || o.label === value));
  if (option?.values !== void 0) {
    for (const [token, v] of Object.entries(option.values)) {
      out[token] = scheme === null ? { light: v, dark: v } : { [scheme]: v };
    }
    return out;
  }
  for (const token of knob.bundle) {
    if (scheme === null) {
      out[token] = {
        light: valueForToken(knob, token, value, "light"),
        dark: valueForToken(knob, token, value, "dark")
      };
    } else {
      out[token] = { [scheme]: valueForToken(knob, token, value, scheme) };
    }
  }
  return out;
}
function knobValuesForSchemes(knobId, value) {
  if (typeof value === "string") {
    const single = knobValueForScheme(knobId, value, null);
    const out2 = {};
    for (const [token, partial] of Object.entries(single)) {
      out2[token] = {
        light: partial.light ?? "",
        dark: partial.dark ?? ""
      };
    }
    return out2;
  }
  const lightPart = knobValueForScheme(knobId, value.light, "light");
  const darkPart = knobValueForScheme(knobId, value.dark, "dark");
  const out = {};
  for (const token of /* @__PURE__ */ new Set([...Object.keys(lightPart), ...Object.keys(darkPart)])) {
    out[token] = {
      light: lightPart[token]?.light ?? "",
      dark: darkPart[token]?.dark ?? ""
    };
  }
  return out;
}
function tokensToKnobValue(knobId, tokens, scheme = "light") {
  const knob = findKnob(knobId);
  if (knob === void 0) return "";
  const primary = knob.bundle[0];
  const existing = tokens[primary];
  const raw = existing !== void 0 ? existing[scheme] : resolveTokenValue(knobDefaultFor(knobId, primary, scheme), scheme);
  if ((knob.control === "select" || knob.control === "font") && knob.options !== void 0) {
    const byValues = knob.options.find((option) => option.values !== void 0 && option.values[primary] === raw);
    if (byValues !== void 0) return byValues.value;
    const byValue = knob.options.find((option) => option.value === raw || option.label === raw);
    if (byValue !== void 0) return byValue.value;
    if (!knob.options.some((option) => option.value === raw)) return knob.options[0]?.value ?? "";
  }
  return raw;
}
function knobCaution(knobId) {
  const knob = findKnob(knobId);
  if (knob === void 0) return false;
  return knob.bundle.some((name2) => {
    const entry = findToken(name2);
    return entry !== void 0 && (entry.safety === "caution" || entry.safety === "expert");
  });
}

// src/client/knob-state.ts
function mergeKnobPatch(tokens, patch) {
  const next = { ...tokens };
  for (const [name2, partial] of Object.entries(patch)) {
    const prev = next[name2];
    next[name2] = {
      light: partial.light ?? prev?.light ?? "",
      dark: partial.dark ?? prev?.dark ?? ""
    };
  }
  return next;
}
function knobColorValue(knobId, tokens, scheme) {
  const value = tokensToKnobValue(knobId, tokens, scheme).trim();
  if (value === "") return null;
  if (/^#[0-9a-fA-F]{3,8}$/.test(value)) return value;
  if (/^(rgba?|hsla?)\(/i.test(value)) return value;
  return null;
}
function knobBundleDiverged(knobId, tokens) {
  const knob = findKnob(knobId);
  if (knob === void 0 || knob.control !== "color" || knob.bundle.length < 2) return false;
  const light = knobColorValue(knobId, tokens, "light");
  const dark = knobColorValue(knobId, tokens, "dark");
  if (light === null || dark === null) return false;
  const expected = knobValuesForSchemes(knobId, { light, dark });
  for (const name2 of knob.bundle) {
    const actual = tokens[name2];
    const want = expected[name2];
    if (actual === void 0 || want === void 0) continue;
    if (actual.light !== want.light || actual.dark !== want.dark) return true;
  }
  return false;
}

// src/client/knob-editor.tsx
var rowStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 2,
  padding: "6px 8px",
  borderRadius: 8,
  border: "1px solid var(--dsw-alias-border-l2)",
  background: "var(--dsw-alias-bg-layer-1)",
  minWidth: 0
};
var nameStyle = { fontSize: 12, fontWeight: 600, color: "var(--dsw-alias-label-primary)" };
var descStyle = { fontSize: 10, lineHeight: 1.4, color: "var(--dsw-alias-label-tertiary, #999)" };
var inputStyle3 = {
  fontFamily: "var(--ds-font-family-code)",
  fontSize: 11,
  padding: "3px 6px",
  borderRadius: 6,
  border: "1px solid var(--dsw-alias-border-l2)",
  background: "var(--dsw-alias-bg-base)",
  color: "var(--dsw-alias-label-primary)",
  minWidth: 0
};
function KnobControl(props) {
  const { knob, tokens, dual, onChange } = props;
  const { t: t2 } = useI18n();
  const knobName = knobLabel(knob.id, "name") ?? knob.name;
  if (knob.control === "color") {
    const write = (scheme, value) => {
      onChange(knobValueForScheme(knob.id, value, scheme));
    };
    const writePicked = (scheme, hex) => {
      const current2 = knobColorValue(knob.id, tokens, scheme);
      const alpha = current2 !== null ? extractAlpha(current2) : null;
      write(dual ? scheme : null, alpha !== null ? rgbaFromHex(hex, alpha) : hex);
    };
    const cell = (scheme, label) => {
      const value = knobColorValue(knob.id, tokens, scheme);
      return /* @__PURE__ */ React9.createElement("div", { style: { display: "flex", alignItems: "center", gap: 4, flex: 1, minWidth: 0 } }, label !== void 0 && /* @__PURE__ */ React9.createElement("span", { style: { fontSize: 10, color: "var(--dsw-alias-label-tertiary, #999)" } }, label), /* @__PURE__ */ React9.createElement(
        "input",
        {
          type: "color",
          "aria-label": `${knobName}${label !== void 0 ? ` ${label}` : ""} ${t2("knob.colorAria")}`,
          value: normalizeHex(value ?? "#000000"),
          onChange: (e) => {
            writePicked(scheme, e.target.value);
          },
          style: { width: 26, height: 22, padding: 0, border: "1px solid var(--dsw-alias-border-l2)", borderRadius: 5, background: "transparent", cursor: "pointer" }
        }
      ), /* @__PURE__ */ React9.createElement(
        "input",
        {
          type: "text",
          "aria-label": `${knobName}${label !== void 0 ? ` ${label}` : ""} ${t2("knob.valueAria")}`,
          value: value ?? "",
          placeholder: t2("knob.varPlaceholder"),
          spellCheck: false,
          onChange: (e) => {
            write(dual ? scheme : null, e.target.value);
          },
          style: { ...inputStyle3, flex: 1 }
        }
      ));
    };
    return dual ? /* @__PURE__ */ React9.createElement("div", { style: { display: "flex", gap: 6, flexWrap: "wrap" } }, cell("light", t2("token.light")), cell("dark", t2("token.dark"))) : cell("light");
  }
  if (knob.control === "number") {
    const raw = tokensToKnobValue(knob.id, tokens, "light");
    const m = /-?\d+(?:\.\d+)?/.exec(String(raw));
    const parsed = m !== null ? Number(m[0]) : Number.NaN;
    const read = Number.isFinite(parsed) ? parsed : knob.min ?? 0;
    const commit = (n) => {
      const clamped = Math.min(knob.max ?? n, Math.max(knob.min ?? n, n));
      onChange(knobValueForScheme(knob.id, `${clamped}${knob.unit ?? ""}`, null));
    };
    return /* @__PURE__ */ React9.createElement("div", { style: { display: "flex", alignItems: "center", gap: 6 } }, /* @__PURE__ */ React9.createElement(
      "input",
      {
        type: "range",
        "aria-label": `${knobName} ${t2("knob.sliderAria")}`,
        min: knob.min ?? 0,
        max: knob.max ?? 100,
        step: knob.step ?? 1,
        value: read,
        onChange: (e) => {
          commit(Number(e.target.value));
        },
        style: { flex: 1, minWidth: 80 }
      }
    ), /* @__PURE__ */ React9.createElement(
      "input",
      {
        type: "number",
        "aria-label": `${knobName} ${t2("knob.numberAria")}`,
        min: knob.min,
        max: knob.max,
        step: knob.step ?? 1,
        value: read,
        onChange: (e) => {
          const n = Number(e.target.value);
          if (Number.isFinite(n)) commit(n);
        },
        style: { ...inputStyle3, width: 68 }
      }
    ), knob.unit !== void 0 && /* @__PURE__ */ React9.createElement("span", { style: { fontSize: 10, color: "var(--dsw-alias-label-tertiary, #999)" } }, knob.unit));
  }
  const current = tokensToKnobValue(knob.id, tokens, "light");
  return /* @__PURE__ */ React9.createElement(
    "select",
    {
      "aria-label": `${knobName} ${t2("knob.selectAria")}`,
      value: current,
      onChange: (e) => {
        onChange(knobValueForScheme(knob.id, e.target.value, null));
      },
      style: { ...inputStyle3, fontFamily: "inherit", fontSize: 12 }
    },
    (knob.options ?? []).map((option) => /* @__PURE__ */ React9.createElement("option", { key: option.value, value: option.value }, option.label))
  );
}
function KnobEditor(props) {
  const { tokens, onKnobChange } = props;
  const { t: t2 } = useI18n();
  const [dual, setDual] = React9.useState(false);
  const [collapsed, setCollapsed] = React9.useState(() => /* @__PURE__ */ new Set());
  const toggleCategory = (id) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };
  const divergedCount = KNOBS.filter((knob) => knobBundleDiverged(knob.id, tokens)).length;
  return /* @__PURE__ */ React9.createElement("div", { "data-up-knobs": true, style: { display: "flex", flexDirection: "column", gap: 8 } }, /* @__PURE__ */ React9.createElement("div", { style: { display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" } }, /* @__PURE__ */ React9.createElement("span", { style: { fontSize: 12, fontWeight: 600, color: "var(--dsw-alias-label-secondary)" } }, t2("knob.title"), /* @__PURE__ */ React9.createElement("span", { style: { fontWeight: 400, color: "var(--dsw-alias-label-tertiary, #999)" } }, t2("knob.summary", { knobs: KNOBS.length, categories: KNOB_CATEGORIES.length }))), /* @__PURE__ */ React9.createElement("label", { style: { display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, cursor: "pointer" } }, /* @__PURE__ */ React9.createElement(
    "input",
    {
      type: "checkbox",
      "data-up-knob-dual": true,
      checked: dual,
      onChange: (e) => {
        setDual(e.target.checked);
      }
    }
  ), t2("knob.dual")), divergedCount > 0 && /* @__PURE__ */ React9.createElement("span", { "data-up-knob-diverged-count": true, style: { fontSize: 10, color: "var(--dsw-alias-state-warn-primary, #b7791f)" } }, t2("knob.divergedCount", { count: divergedCount }))), /* @__PURE__ */ React9.createElement("div", { style: descStyle }, t2("knob.intro")), KNOB_CATEGORIES.map((category) => {
    const knobs = KNOBS.filter((knob) => knob.category === category.id);
    if (knobs.length === 0) return null;
    const isCollapsed = collapsed.has(category.id);
    return /* @__PURE__ */ React9.createElement("section", { key: category.id, "data-up-knob-category": category.id }, /* @__PURE__ */ React9.createElement(
      "button",
      {
        type: "button",
        "data-up-knob-cat-head": true,
        onClick: () => {
          toggleCategory(category.id);
        },
        style: {
          display: "flex",
          alignItems: "center",
          gap: 6,
          width: "100%",
          padding: "4px 0",
          border: "none",
          borderBottom: "1px solid var(--dsw-alias-border-l2)",
          background: "transparent",
          cursor: "pointer",
          color: "var(--dsw-alias-label-secondary)",
          fontSize: 12,
          fontWeight: 600
        }
      },
      /* @__PURE__ */ React9.createElement("span", null, isCollapsed ? "\u25B8" : "\u25BE"),
      categoryLabel(category.id, "name") ?? category.name,
      /* @__PURE__ */ React9.createElement("span", { style: { fontWeight: 400, color: "var(--dsw-alias-label-tertiary, #999)", fontSize: 10 } }, categoryLabel(category.id, "description") ?? category.description, " \xB7 ", knobs.length)
    ), !isCollapsed && /* @__PURE__ */ React9.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 6, paddingTop: 6 } }, knobs.map((knob) => {
      const diverged = knobBundleDiverged(knob.id, tokens);
      return /* @__PURE__ */ React9.createElement("div", { key: knob.id, "data-up-knob": knob.id, style: { ...rowStyle, borderColor: diverged ? "var(--dsw-alias-state-warn-primary, #b7791f)" : "var(--dsw-alias-border-l2)" } }, /* @__PURE__ */ React9.createElement("div", { style: { display: "flex", alignItems: "center", gap: 6 } }, /* @__PURE__ */ React9.createElement("span", { style: nameStyle }, knobLabel(knob.id, "name") ?? knob.name), knobCaution(knob.id) && /* @__PURE__ */ React9.createElement("span", { "data-up-knob-caution": true, title: t2("knob.caution"), style: { fontSize: 10, color: "var(--dsw-alias-state-warn-primary, #b7791f)" } }, t2("knob.caution")), diverged && /* @__PURE__ */ React9.createElement("span", { "data-up-knob-diverged": true, title: t2("knob.diverged"), style: { fontSize: 10, color: "var(--dsw-alias-state-warn-primary, #b7791f)" } }, t2("knob.diverged"))), /* @__PURE__ */ React9.createElement("div", { style: descStyle }, knobLabel(knob.id, "description") ?? knob.description), /* @__PURE__ */ React9.createElement(KnobControl, { knob, tokens, dual, onChange: onKnobChange }));
    })));
  }));
}

// src/client/token-editor.tsx
var NOTES_KEY = "ui-presets-token-notes";
function loadTokenNotes() {
  try {
    return JSON.parse(localStorage.getItem(NOTES_KEY) ?? "{}");
  } catch {
    return {};
  }
}
function saveTokenNotes(notes) {
  try {
    localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
  } catch {
  }
}
var HISTORY_LIMIT = 100;
var HISTORY_MERGE_MS = 300;
function TokenRow(props) {
  const { t: t2 } = useI18n();
  const entry = findToken(props.name);
  const lightIsColor = isResolvableColor(props.value.light);
  const darkIsColor = isResolvableColor(props.value.dark);
  const lightColor = lightIsColor ? resolveTokenValue(props.value.light) : "";
  const darkColor = darkIsColor ? resolveTokenValue(props.value.dark) : "";
  const [notes, setNotes] = React10.useState(() => loadTokenNotes());
  const userNote = notes[props.name];
  const description = userNote ?? TOKEN_DESCRIPTIONS[props.name];
  const [editing, setEditing] = React10.useState(false);
  const [draft, setDraft] = React10.useState("");
  const startEdit = () => {
    setDraft(userNote ?? "");
    setEditing(true);
  };
  const commitNote = () => {
    const next = { ...notes };
    const text = draft.trim();
    if (text === "") delete next[props.name];
    else next[props.name] = text;
    setNotes(next);
    saveTokenNotes(next);
    setEditing(false);
  };
  return /* @__PURE__ */ React10.createElement("div", { "data-up-token-row": true, style: { display: "flex", alignItems: "center", gap: 8, padding: "5px 0" } }, props.groupChecked !== void 0 && /* @__PURE__ */ React10.createElement(
    "input",
    {
      type: "checkbox",
      "data-up-group-check": true,
      "aria-label": `\u52A0\u5165\u5206\u7EC4\uFF1A${props.name}`,
      checked: props.groupChecked,
      onChange: () => {
        props.onGroupToggle?.(props.name);
      },
      style: { flexShrink: 0 }
    }
  ), /* @__PURE__ */ React10.createElement("div", { style: { flex: 1, minWidth: 0 } }, /* @__PURE__ */ React10.createElement("div", { style: { display: "flex", alignItems: "center", gap: 6 } }, /* @__PURE__ */ React10.createElement("code", { style: { fontSize: 11, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "var(--dsw-alias-label-secondary)" } }, props.name, props.safety === "caution" ? " \u26A0" : props.safety === "expert" ? " \u{1F512}" : ""), /* @__PURE__ */ React10.createElement(
    "button",
    {
      type: "button",
      "data-up-note-btn": true,
      onClick: startEdit,
      title: description ?? "\u6DFB\u52A0\u4E2D\u6587\u63CF\u8FF0",
      style: { fontSize: 10, padding: "0 4px", border: "none", background: "transparent", color: "var(--dsw-alias-label-tertiary, #999)", cursor: "pointer" }
    },
    description !== void 0 ? "\u{1F4DD}" : "\uFF0B\u63CF\u8FF0"
  )), editing ? /* @__PURE__ */ React10.createElement("div", { style: { display: "flex", gap: 4, alignItems: "center", paddingTop: 2 } }, /* @__PURE__ */ React10.createElement(
    "input",
    {
      type: "text",
      "data-up-note-input": true,
      "aria-label": `\u63CF\u8FF0\uFF1A${props.name}`,
      value: draft,
      placeholder: t2("token.notePlaceholder"),
      maxLength: 80,
      onChange: (e) => {
        setDraft(e.target.value);
      },
      onKeyDown: (e) => {
        if (e.key === "Enter") commitNote();
      },
      style: { flex: 1, fontSize: 10, padding: "2px 6px", border: "1px solid var(--dsw-alias-border-l2)", borderRadius: 5, background: "var(--dsw-alias-bg-layer-1)", color: "var(--dsw-alias-label-primary)" }
    }
  ), /* @__PURE__ */ React10.createElement("button", { type: "button", "data-up-btn": true, onClick: commitNote, style: { padding: "1px 8px", fontSize: 10 } }, t2("token.saveNote"))) : description !== void 0 && /* @__PURE__ */ React10.createElement("div", { "data-up-token-desc": true, style: { fontSize: 10, color: "var(--dsw-alias-label-tertiary, #999)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" } }, description, userNote !== void 0 ? t2("token.selfNote") : "")), ["light", "dark"].map((mode) => {
    const isColor = mode === "light" ? lightIsColor : darkIsColor;
    const color = mode === "light" ? lightColor : darkColor;
    return /* @__PURE__ */ React10.createElement("div", { key: mode, style: { display: "flex", alignItems: "center", gap: 4, minWidth: 0 } }, isColor && /* @__PURE__ */ React10.createElement(
      "input",
      {
        type: "color",
        "aria-label": `${props.name} ${mode}`,
        value: normalizeHex(color),
        onChange: (e) => {
          const alpha = extractAlpha(props.value[mode]);
          props.onChange(mode, alpha !== null ? rgbaFromHex(e.target.value, alpha) : e.target.value);
        },
        style: { width: 26, height: 22, padding: 0, border: "1px solid var(--dsw-alias-border-l2)", borderRadius: 6, background: "transparent" }
      }
    ), /* @__PURE__ */ React10.createElement(
      "input",
      {
        type: "text",
        "aria-label": `${props.name} ${mode} \u503C`,
        value: props.value[mode],
        onChange: (e) => {
          props.onChange(mode, e.target.value);
        },
        spellCheck: false,
        style: {
          width: 92,
          fontSize: 11,
          fontFamily: "var(--ds-font-family-code)",
          padding: "3px 6px",
          border: "1px solid var(--dsw-alias-border-l2)",
          borderRadius: 6,
          background: "var(--dsw-alias-bg-layer-1)",
          color: "var(--dsw-alias-label-primary)"
        }
      }
    ));
  }));
}
function TokenEditor(props) {
  const { session, onSessionChange } = props;
  const { t: t2 } = useI18n();
  const historyRef = React10.useRef([]);
  const lastHistoryPushRef = React10.useRef(0);
  const [canUndo, setCanUndo] = React10.useState(false);
  const [expandedExpert, setExpandedExpert] = React10.useState(false);
  const [advancedOpen, setAdvancedOpen] = React10.useState(getCapabilities() === "developer");
  const [search, setSearch] = React10.useState("");
  const [collapsed, setCollapsed] = React10.useState(() => /* @__PURE__ */ new Set());
  const [coverCrop, setCoverCrop] = React10.useState(null);
  const [groupMode, setGroupMode] = React10.useState(false);
  const [checked, setChecked] = React10.useState(() => /* @__PURE__ */ new Set());
  const [expandedGroups, setExpandedGroups] = React10.useState(() => /* @__PURE__ */ new Set());
  const [groupName, setGroupName] = React10.useState("");
  const [groupSchemeMode, setGroupSchemeMode] = React10.useState(false);
  const toggleCheck = React10.useCallback((name2) => {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(name2)) next.delete(name2);
      else next.add(name2);
      return next;
    });
  }, []);
  const applySession = React10.useCallback((next, changedNames) => {
    onSessionChange(next, changedNames);
  }, [onSessionChange]);
  const coverFallbackSrc = React10.useMemo(() => {
    const cover = session.cover;
    if (cover !== void 0 && cover.assetId !== "") {
      const asset = session.assets.find((item) => item.id === cover.assetId);
      if (asset !== void 0) return asset.dataUrl ?? `/ui-presets/assets/${encodeURIComponent(asset.id)}`;
    }
    return coverDataUrlFor({
      id: session.presetId ?? "preview",
      name: session.presetName,
      edition: "standard",
      tokens: session.tokens
    });
  }, [session.cover, session.assets, session.presetId, session.presetName, session.tokens]);
  const [coverPreview, setCoverPreview] = React10.useState(null);
  React10.useEffect(() => {
    let alive = true;
    const draft = {
      schemaVersion: 1,
      id: session.presetId ?? "preview",
      name: session.presetName,
      edition: "standard",
      tokens: session.tokens,
      assets: session.assets.map((asset) => ({
        id: asset.id,
        name: asset.name,
        mime: asset.mime,
        ...asset.dataUrl !== void 0 ? { dataUrl: asset.dataUrl } : {}
      })),
      ...session.cover !== void 0 ? { cover: session.cover } : {}
    };
    void renderCoverFor(draft).then((src) => {
      if (alive) setCoverPreview(src);
    });
    return () => {
      alive = false;
    };
  }, [session.cover, session.assets, session.presetId, session.presetName, session.tokens]);
  const coverPreviewSrc = coverPreview ?? coverFallbackSrc;
  const openCoverCrop = (assetId) => {
    const asset = session.assets.find((item) => item.id === assetId);
    if (asset === void 0) return;
    setCoverCrop({
      widgetId: "cover",
      widgetName: "\u9884\u8BBE\u5C01\u9762",
      ratio: COVER_RATIO,
      sourceAssetId: assetId,
      sourceUrl: asset.dataUrl ?? `/ui-presets/assets/${encodeURIComponent(assetId)}`,
      sourceName: asset.name,
      dark: false
    });
  };
  const handleCoverCropConfirm = (crop) => {
    const request = coverCrop;
    setCoverCrop(null);
    if (request === null) return;
    const round1 = (value) => String(Math.round(value * 10) / 10);
    applySession({
      ...session,
      cover: {
        assetId: request.sourceAssetId,
        cropX: round1(crop.x),
        cropY: round1(crop.y),
        cropW: round1(crop.w),
        cropH: round1(crop.h)
      }
    }, []);
  };
  const pushHistory = React10.useCallback((snapshot, changedNames) => {
    const now = Date.now();
    const last = historyRef.current[historyRef.current.length - 1];
    if (now - lastHistoryPushRef.current < HISTORY_MERGE_MS && last !== void 0) {
      last.changedNames = Array.from(/* @__PURE__ */ new Set([...last.changedNames, ...changedNames]));
    } else {
      historyRef.current.push({ tokens: snapshot.tokens, css: snapshot.css, changedNames });
      if (historyRef.current.length > HISTORY_LIMIT) historyRef.current.shift();
    }
    lastHistoryPushRef.current = now;
    setCanUndo(true);
  }, []);
  const setToken = React10.useCallback((name2, mode, value) => {
    const prev = session.tokens[name2];
    if (prev !== void 0 && prev[mode] === value) return;
    pushHistory({ tokens: { ...session.tokens }, css: session.css }, [name2]);
    const next = {
      ...session,
      tokens: { ...session.tokens, [name2]: { ...prev ?? { light: "", dark: "" }, [mode]: value } }
    };
    applySession(next, [name2]);
  }, [session, applySession, pushHistory]);
  const undo = React10.useCallback(() => {
    const entry = historyRef.current.pop();
    if (entry === void 0) return;
    setCanUndo(historyRef.current.length > 0);
    applySession({ ...session, tokens: entry.tokens, css: entry.css }, entry.changedNames);
  }, [session, applySession]);
  const setBundle = React10.useCallback((names, value) => {
    const prev = session.tokens;
    pushHistory({ tokens: { ...prev }, css: session.css }, names);
    const tokens = { ...prev };
    for (const name2 of names) {
      tokens[name2] = { light: value, dark: value };
    }
    applySession({ ...session, tokens }, names);
  }, [session, applySession, pushHistory]);
  const setBundleScheme = React10.useCallback((names, scheme, value) => {
    const prev = session.tokens;
    pushHistory({ tokens: { ...prev }, css: session.css }, names);
    const tokens = { ...prev };
    for (const name2 of names) {
      tokens[name2] = { ...tokens[name2] ?? { light: "", dark: "" }, [scheme]: value };
    }
    applySession({ ...session, tokens }, names);
  }, [session, applySession, pushHistory]);
  const createGroup = React10.useCallback(() => {
    const name2 = groupName.trim();
    if (name2 === "" || checked.size === 0) return;
    const group = { id: `group-${Date.now().toString(36)}`, name: name2, tokenNames: [...checked] };
    applySession({ ...session, groups: [...session.groups, group] }, []);
    setChecked(/* @__PURE__ */ new Set());
    setGroupName("");
    setGroupMode(false);
    setExpandedGroups((prev) => new Set(prev).add(group.id));
  }, [session, applySession, checked, groupName]);
  const deleteGroup = React10.useCallback((id) => {
    applySession({ ...session, groups: session.groups.filter((g) => g.id !== id) }, []);
  }, [session, applySession]);
  const setGroupColor = React10.useCallback((group, scheme, value) => {
    if (scheme === "both") setBundle(group.tokenNames, value);
    else setBundleScheme(group.tokenNames, scheme, value);
  }, [setBundle, setBundleScheme]);
  const setAssets = React10.useCallback((assets) => {
    applySession({ ...session, assets }, []);
  }, [session, applySession]);
  const setWidgets = React10.useCallback((widgets) => {
    applySession({ ...session, widgets }, []);
  }, [session, applySession]);
  const setAssetsAndWidgets = React10.useCallback((assets, widgets) => {
    applySession({ ...session, assets, widgets }, []);
  }, [session, applySession]);
  const setCss = React10.useCallback((css) => {
    pushHistory({ tokens: { ...session.tokens }, css: session.css }, []);
    applySession({ ...session, css }, []);
  }, [session, applySession, pushHistory]);
  const setTheme = React10.useCallback((theme) => {
    applySession({ ...session, theme }, []);
  }, [session, applySession]);
  const applyKnobPatch = React10.useCallback((patch) => {
    const names = Object.keys(patch);
    if (names.length === 0) return;
    pushHistory({ tokens: { ...session.tokens }, css: session.css }, names);
    applySession({ ...session, tokens: mergeKnobPatch(session.tokens, patch) }, names);
  }, [session, applySession, pushHistory]);
  const query = search.trim().toLowerCase();
  const groups = [];
  for (const group of GROUP_ORDER) {
    let entries = catalog.entries.filter((entry) => entry.group === group).map((entry) => ({ name: entry.name }));
    if (query !== "") entries = entries.filter((e) => e.name.toLowerCase().includes(query));
    if (entries.length === 0) continue;
    groups.push({ group, label: groupLabel(group), entries });
  }
  const hasExpertEntries = catalog.entries.some((entry) => entry.safety === "expert");
  const toggleGroup = (key) => {
    setCollapsed((prev) => {
      const nextSet = new Set(prev);
      if (nextSet.has(key)) nextSet.delete(key);
      else nextSet.add(key);
      return nextSet;
    });
  };
  return /* @__PURE__ */ React10.createElement("div", { "data-up-editor": true, style: { display: "flex", flexDirection: "column", gap: 10, minWidth: 0, flex: 1 } }, /* @__PURE__ */ React10.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8 } }, /* @__PURE__ */ React10.createElement(
    "input",
    {
      type: "text",
      "aria-label": t2("token.nameAria"),
      value: session.presetName,
      maxLength: 64,
      onChange: (e) => {
        applySession({ ...session, presetName: e.target.value }, []);
      },
      style: { flex: 1, fontSize: 14, fontWeight: 600, padding: "5px 8px", border: "1px solid var(--dsw-alias-border-l2)", borderRadius: 8, background: "var(--dsw-alias-bg-layer-1)", color: "var(--dsw-alias-label-primary)" }
    }
  ), /* @__PURE__ */ React10.createElement("button", { type: "button", "data-up-btn": true, onClick: undo, disabled: !canUndo, style: { opacity: canUndo ? 1 : 0.4 } }, t2("token.undo"))), /* @__PURE__ */ React10.createElement(KnobEditor, { tokens: session.tokens, onKnobChange: applyKnobPatch }), /* @__PURE__ */ React10.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", borderBottom: "1px solid var(--dsw-alias-border-l2)", paddingBottom: 8 } }, /* @__PURE__ */ React10.createElement("span", { style: { fontSize: 12, fontWeight: 600, color: "var(--dsw-alias-label-secondary)" } }, t2("token.cover")), /* @__PURE__ */ React10.createElement(
    "img",
    {
      "data-up-cover-preview": true,
      src: coverPreviewSrc,
      alt: t2("token.coverPreviewAlt"),
      style: { width: 96, height: 32, objectFit: "cover", borderRadius: 4, border: "1px solid var(--dsw-alias-border-l2)", background: "var(--dsw-alias-bg-layer-1)" }
    }
  ), /* @__PURE__ */ React10.createElement(
    "select",
    {
      "aria-label": t2("token.coverAria"),
      value: session.cover?.assetId ?? "",
      onChange: (e) => {
        const id = e.target.value;
        if (id === "") {
          applySession({ ...session, cover: void 0 }, []);
        } else {
          openCoverCrop(id);
        }
      },
      style: { fontSize: 11, padding: "2px 4px", borderRadius: 5, border: "1px solid var(--dsw-alias-border-l2)", background: "var(--dsw-alias-bg-layer-2)", color: "var(--dsw-alias-label-primary)" }
    },
    /* @__PURE__ */ React10.createElement("option", { value: "" }, t2("token.coverAuto")),
    session.assets.map((asset) => /* @__PURE__ */ React10.createElement("option", { key: asset.id, value: asset.id }, asset.name))
  ), /* @__PURE__ */ React10.createElement("span", { "data-up-status": true, style: { fontSize: 10 } }, t2("token.coverHint"))), /* @__PURE__ */ React10.createElement("div", { style: { borderTop: "1px solid var(--dsw-alias-border-l2)", paddingTop: 8 } }, /* @__PURE__ */ React10.createElement(
    WidgetEditor,
    {
      assets: session.assets,
      widgets: session.widgets,
      onAssetsChange: setAssets,
      onWidgetsChange: setWidgets,
      onAssetsAndWidgetsChange: setAssetsAndWidgets,
      presetId: session.presetId ?? ""
    }
  )), session.groups.length > 0 && /* @__PURE__ */ React10.createElement("div", { "data-up-groups": true, style: { borderTop: "1px solid var(--dsw-alias-border-l2)", paddingTop: 8, display: "flex", flexDirection: "column", gap: 6 } }, /* @__PURE__ */ React10.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8, fontSize: 12, fontWeight: 600, color: "var(--dsw-alias-label-secondary)" } }, /* @__PURE__ */ React10.createElement("span", null, t2("token.groups")), /* @__PURE__ */ React10.createElement("span", { style: { fontWeight: 400, fontSize: 10, color: "var(--dsw-alias-label-tertiary, #999)" } }, /* @__PURE__ */ React10.createElement("label", { style: { display: "inline-flex", alignItems: "center", gap: 4, cursor: "pointer" } }, /* @__PURE__ */ React10.createElement("input", { type: "checkbox", checked: groupSchemeMode, onChange: (e) => {
    setGroupSchemeMode(e.target.checked);
  } }), t2("token.groupScheme")))), session.groups.map((group) => {
    const expanded = expandedGroups.has(group.id);
    const lightValue = session.tokens[group.tokenNames[0]]?.light ?? "";
    const darkValue = session.tokens[group.tokenNames[0]]?.dark ?? "";
    return /* @__PURE__ */ React10.createElement("div", { key: group.id, "data-up-group": true, style: { border: "1px solid var(--dsw-alias-border-l2)", borderRadius: 8, padding: 6 } }, /* @__PURE__ */ React10.createElement("div", { style: { display: "flex", alignItems: "center", gap: 6 } }, /* @__PURE__ */ React10.createElement(
      "button",
      {
        type: "button",
        "data-up-group-head": true,
        onClick: () => {
          setExpandedGroups((prev) => {
            const next = new Set(prev);
            if (next.has(group.id)) next.delete(group.id);
            else next.add(group.id);
            return next;
          });
        },
        style: { border: "none", background: "transparent", cursor: "pointer", fontSize: 12, fontWeight: 600, color: "var(--dsw-alias-label-primary)", padding: 0 }
      },
      expanded ? "\u25BE" : "\u25B8",
      " ",
      group.name,
      /* @__PURE__ */ React10.createElement("span", { style: { fontWeight: 400, fontSize: 10, color: "var(--dsw-alias-label-tertiary, #999)" } }, t2("token.groupTokens", { count: group.tokenNames.length }))
    ), /* @__PURE__ */ React10.createElement(
      "button",
      {
        type: "button",
        "data-up-group-del": true,
        onClick: () => {
          deleteGroup(group.id);
        },
        style: { marginLeft: "auto", fontSize: 10, border: "none", background: "transparent", color: "var(--dsw-alias-state-error-primary, #d94c4c)", cursor: "pointer" }
      },
      t2("token.dissolve")
    )), expanded && /* @__PURE__ */ React10.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 4, paddingTop: 4 } }, /* @__PURE__ */ React10.createElement("div", { style: { fontSize: 10, color: "var(--dsw-alias-label-tertiary, #999)" } }, t2("token.members"), group.tokenNames.map((n) => n.replace("--dsw-alias-", "").replace("--dsw-specific-", "")).join("\u3001")), /* @__PURE__ */ React10.createElement("div", { style: { display: "flex", alignItems: "center", gap: 6 } }, /* @__PURE__ */ React10.createElement("span", { style: { fontSize: 10, color: "var(--dsw-alias-label-tertiary, #999)" } }, t2("token.groupColor"), ":"), groupSchemeMode ? /* @__PURE__ */ React10.createElement(React10.Fragment, null, /* @__PURE__ */ React10.createElement(
      "input",
      {
        type: "text",
        "aria-label": `\u7EC4\u4EAE\u8272\uFF1A${group.name}`,
        value: lightValue,
        spellCheck: false,
        onChange: (e) => {
          setGroupColor(group, "light", e.target.value);
        },
        style: { width: 92, fontSize: 11, fontFamily: "var(--ds-font-family-code)", padding: "3px 6px", border: "1px solid var(--dsw-alias-border-l2)", borderRadius: 6, background: "var(--dsw-alias-bg-layer-1)", color: "var(--dsw-alias-label-primary)" }
      }
    ), /* @__PURE__ */ React10.createElement("span", { style: { fontSize: 10, color: "var(--dsw-alias-label-tertiary, #999)" } }, t2("token.light")), /* @__PURE__ */ React10.createElement(
      "input",
      {
        type: "text",
        "aria-label": `\u7EC4\u6697\u8272\uFF1A${group.name}`,
        value: darkValue,
        spellCheck: false,
        onChange: (e) => {
          setGroupColor(group, "dark", e.target.value);
        },
        style: { width: 92, fontSize: 11, fontFamily: "var(--ds-font-family-code)", padding: "3px 6px", border: "1px solid var(--dsw-alias-border-l2)", borderRadius: 6, background: "var(--dsw-alias-bg-layer-1)", color: "var(--dsw-alias-label-primary)" }
      }
    ), /* @__PURE__ */ React10.createElement("span", { style: { fontSize: 10, color: "var(--dsw-alias-label-tertiary, #999)" } }, t2("token.dark"))) : /* @__PURE__ */ React10.createElement(React10.Fragment, null, /* @__PURE__ */ React10.createElement(
      "input",
      {
        type: "text",
        "aria-label": `\u7EC4\u8272\uFF1A${group.name}`,
        value: lightValue,
        spellCheck: false,
        onChange: (e) => {
          setGroupColor(group, "both", e.target.value);
        },
        style: { width: 92, fontSize: 11, fontFamily: "var(--ds-font-family-code)", padding: "3px 6px", border: "1px solid var(--dsw-alias-border-l2)", borderRadius: 6, background: "var(--dsw-alias-bg-layer-1)", color: "var(--dsw-alias-label-primary)" }
      }
    ), /* @__PURE__ */ React10.createElement("span", { style: { fontSize: 10, color: "var(--dsw-alias-label-tertiary, #999)" } }, t2("token.both"))))));
  })), /* @__PURE__ */ React10.createElement("div", { "data-up-advanced": true }, /* @__PURE__ */ React10.createElement(
    "div",
    {
      "data-up-advanced-head": true,
      onClick: () => {
        setAdvancedOpen((prev) => !prev);
      },
      style: { fontSize: 12, fontWeight: 600, color: "var(--dsw-alias-label-secondary)", padding: "6px 0", borderTop: "1px solid var(--dsw-alias-border-l2)", cursor: "pointer", userSelect: "none" }
    },
    /* @__PURE__ */ React10.createElement("span", null, advancedOpen ? "\u25BE" : "\u25B8"),
    " ",
    t2("token.advanced"),
    /* @__PURE__ */ React10.createElement("span", { style: { fontWeight: 400, color: "var(--dsw-alias-label-tertiary, #999)" } }, t2("token.advancedCount", { count: catalog.entries.length }))
  ), /* @__PURE__ */ React10.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 12, paddingTop: 6 } }, /* @__PURE__ */ React10.createElement("div", { style: { display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" } }, /* @__PURE__ */ React10.createElement(
    "input",
    {
      type: "search",
      "aria-label": t2("token.search"),
      placeholder: t2("token.search"),
      value: search,
      onChange: (e) => {
        setSearch(e.target.value);
      },
      onFocus: () => {
        setAdvancedOpen(true);
      },
      style: { flex: 1, minWidth: 140, fontSize: 12, padding: "5px 8px", border: "1px solid var(--dsw-alias-border-l2)", borderRadius: 8, background: "var(--dsw-alias-bg-layer-1)", color: "var(--dsw-alias-label-primary)" }
    }
  ), /* @__PURE__ */ React10.createElement("button", { type: "button", "data-up-group-mode": true, onClick: () => {
    setGroupMode((prev) => !prev);
  }, style: { fontSize: 11, padding: "3px 8px", borderRadius: 6, border: groupMode ? "1px solid var(--dsw-alias-brand-primary)" : "1px solid var(--dsw-alias-border-l2)", background: groupMode ? "var(--dsw-alias-bg-layer-2)" : "transparent", color: "var(--dsw-alias-label-primary)", cursor: "pointer" } }, groupMode ? t2("token.groupModeOn") : t2("token.groupMode")), groupMode && /* @__PURE__ */ React10.createElement(React10.Fragment, null, /* @__PURE__ */ React10.createElement(
    "input",
    {
      type: "text",
      "aria-label": t2("token.groupNameAria"),
      placeholder: t2("token.groupNamePlaceholder"),
      value: groupName,
      maxLength: 24,
      onChange: (e) => {
        setGroupName(e.target.value);
      },
      onKeyDown: (e) => {
        if (e.key === "Enter") createGroup();
      },
      style: { width: 120, fontSize: 11, padding: "3px 6px", border: "1px solid var(--dsw-alias-border-l2)", borderRadius: 6, background: "var(--dsw-alias-bg-layer-1)", color: "var(--dsw-alias-label-primary)" }
    }
  ), /* @__PURE__ */ React10.createElement("button", { type: "button", "data-up-group-create": true, onClick: createGroup, disabled: checked.size === 0 || groupName.trim() === "", style: { fontSize: 11, padding: "3px 8px", borderRadius: 6, border: "1px solid var(--dsw-alias-border-l2)", background: "var(--dsw-alias-bg-layer-2)", color: "var(--dsw-alias-label-primary)", cursor: "pointer", opacity: checked.size === 0 || groupName.trim() === "" ? 0.4 : 1 } }, t2("token.createGroup", { count: checked.size })))), advancedOpen && // 修复轮 #30：内容随中栏整体滚动（原 overflow auto 与中栏滚动嵌套冲突）
  /* @__PURE__ */ React10.createElement(React10.Fragment, null, groups.map((group) => {
    const key = String(group.group);
    const isCollapsed = collapsed.has(key) && query === "";
    return /* @__PURE__ */ React10.createElement("section", { key, "data-up-group": true }, /* @__PURE__ */ React10.createElement(
      "div",
      {
        "data-up-group-head": true,
        onClick: () => {
          toggleGroup(key);
        },
        style: { fontSize: 12, fontWeight: 600, color: "var(--dsw-alias-label-secondary)", padding: "4px 0", borderBottom: "1px solid var(--dsw-alias-border-l2)", cursor: "pointer", userSelect: "none" }
      },
      /* @__PURE__ */ React10.createElement("span", null, isCollapsed ? "\u25B8" : "\u25BE"),
      " ",
      group.label,
      /* @__PURE__ */ React10.createElement("span", { style: { fontWeight: 400, color: "var(--dsw-alias-label-tertiary, #999)" } }, " \xB7 ", group.entries.length, GROUP_DESCRIPTIONS[String(group.group)] !== void 0 ? ` \xB7 ${GROUP_DESCRIPTIONS[String(group.group)]}` : "")
    ), !isCollapsed && /* @__PURE__ */ React10.createElement(React10.Fragment, null, /* @__PURE__ */ React10.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8, padding: "3px 0", fontSize: 10, color: "var(--dsw-alias-label-tertiary, #999)" } }, groupMode && /* @__PURE__ */ React10.createElement("span", { style: { width: 18 } }), /* @__PURE__ */ React10.createElement("span", { style: { flex: 1 } }, t2("token.colToken")), /* @__PURE__ */ React10.createElement("span", { style: { width: 128 } }, t2("token.colLight")), /* @__PURE__ */ React10.createElement("span", { style: { width: 128 } }, t2("token.colDark"))), /* @__PURE__ */ React10.createElement("div", { style: { display: "flex", flexDirection: "column" } }, group.entries.map(({ name: name2 }) => {
      const entry = findToken(name2);
      const isExpert = entry?.safety === "expert";
      if (isExpert && !expandedExpert) return null;
      const existing = session.tokens[name2];
      const value = existing ?? { light: entry?.light ?? "", dark: entry?.dark ?? "" };
      return /* @__PURE__ */ React10.createElement(
        TokenRow,
        {
          key: name2,
          name: name2,
          value,
          safety: entry?.safety ?? "safe",
          groupChecked: groupMode ? checked.has(name2) : void 0,
          onGroupToggle: toggleCheck,
          onChange: (mode, v) => {
            setToken(name2, mode, v);
          }
        }
      );
    }))));
  }), hasExpertEntries && !expandedExpert && /* @__PURE__ */ React10.createElement("button", { type: "button", "data-up-btn": true, onClick: () => {
    setExpandedExpert(true);
  }, style: { alignSelf: "flex-start" } }, t2("token.expandExpert"))))), /* @__PURE__ */ React10.createElement(CssPatchPanel, { css: session.css, onChange: setCss }), /* @__PURE__ */ React10.createElement(
    ThemeRegisterPanel,
    {
      theme: session.theme,
      presetId: session.presetId,
      tokenCount: Object.keys(session.tokens).length,
      onChange: setTheme
    }
  ), coverCrop !== null && /* @__PURE__ */ React10.createElement(
    CropDialog,
    {
      request: coverCrop,
      onConfirm: (crop) => {
        handleCoverCropConfirm(crop);
      },
      onCancel: () => {
        setCoverCrop(null);
      }
    }
  ));
}
function groupLabel(group) {
  const labels = {
    "alias-bg": "\u80CC\u666F",
    "alias-border": "\u8FB9\u6846",
    "alias-brand": "\u54C1\u724C",
    "alias-label": "\u6587\u5B57",
    "alias-button": "\u6309\u94AE",
    "alias-interactive": "\u4EA4\u4E92\u6001",
    "alias-state": "\u72B6\u6001",
    "alias-markdown": "Markdown",
    "alias-scrollbar": "\u6EDA\u52A8\u6761\uFF08alias\uFF09",
    "alias-overlay": "\u6D6E\u5C42",
    specific: "\u7EC4\u4EF6\u4E13\u5C5E",
    static: "\u9759\u6001\u8272\u677F\uFF08\u8C28\u614E\uFF09",
    font: "\u5B57\u4F53",
    shadow: "\u9634\u5F71",
    gradient: "\u6E10\u53D8",
    shiki: "\u4EE3\u7801\u9AD8\u4EAE",
    scrollbar: "\u6EDA\u52A8\u6761",
    other: "\u5176\u4ED6"
  };
  return labels[group] ?? String(group);
}

// src/client/theme-pins.ts
var CHROME_TOKENS = [
  "--dsw-alias-bg-base",
  "--dsw-alias-bg-layer-1",
  "--dsw-alias-bg-layer-2",
  "--dsw-alias-border-l2",
  "--dsw-alias-label-primary",
  "--dsw-alias-label-secondary",
  "--dsw-alias-label-tertiary",
  "--dsw-alias-button-info-fill",
  "--dsw-alias-state-error-primary",
  "--dsw-alias-state-warn-primary"
];
var MAX_RESOLVE_DEPTH2 = 8;
function resolveChain(value, table, scheme) {
  let current = value.trim();
  for (let depth = 0; depth < MAX_RESOLVE_DEPTH2; depth += 1) {
    const m = /^var\(\s*(--[\w-]+)/.exec(current);
    if (m === null) return current;
    const entry = table.get(m[1]);
    if (entry === void 0) return current;
    const next = (scheme === "dark" ? entry.dark : entry.light).trim();
    if (next === current) return current;
    current = next;
  }
  return current;
}
function computeChromePins(activeTokens, scheme) {
  const table = /* @__PURE__ */ new Map();
  for (const entry of catalog.entries) table.set(entry.name, { light: entry.light, dark: entry.dark });
  if (activeTokens !== null && activeTokens !== void 0) {
    for (const [name2, value] of Object.entries(activeTokens)) {
      table.set(name2, { light: value.light, dark: value.dark });
    }
  }
  const pins = {};
  for (const name2 of CHROME_TOKENS) {
    const entry = table.get(name2);
    if (entry === void 0) continue;
    pins[name2] = resolveChain(scheme === "dark" ? entry.dark : entry.light, table, scheme);
  }
  return pins;
}
function detectAppScheme() {
  try {
    if (typeof document !== "undefined") {
      if (document.body !== null && document.body.hasAttribute("data-ds-dark-theme")) return "dark";
      const cs = document.documentElement?.style.colorScheme;
      if (cs === "dark" || String(cs).includes("dark")) return "dark";
    }
  } catch {
  }
  return "light";
}

// src/client/studio-shell.tsx
function buildPreset(session) {
  const id = session.presetId ?? `preset-${Date.now().toString(36)}`;
  const preset2 = {
    schemaVersion: 1,
    id,
    name: session.presetName.trim() !== "" ? session.presetName.trim() : id,
    edition: "standard",
    tokens: session.tokens
  };
  if (session.css.length > 0) preset2.css = session.css;
  if (session.theme.enabled && Object.keys(session.tokens).length > 0) {
    preset2.theme = { id: `${id}-theme`, colorScheme: session.theme.colorScheme, tokens: session.tokens };
  }
  if (session.assets.length > 0) preset2.assets = session.assets;
  if (session.widgets.length > 0) preset2.widgets = session.widgets;
  if (session.cover !== void 0 && session.cover !== null) preset2.cover = session.cover;
  if (session.groups.length > 0) preset2.extra = { ...preset2.extra ?? {}, groups: session.groups };
  return preset2;
}
var mountCount = 0;
var stashedSession = null;
function StudioShell() {
  const { t: t2 } = useI18n();
  const [open, setOpen] = React11.useState(isStudioHashActive());
  const isPrimary = React11.useRef(false);
  const controller2 = getController();
  const [, force] = React11.useState(0);
  React11.useEffect(() => {
    mountCount += 1;
    isPrimary.current = mountCount === 1;
    if (!isPrimary.current) return () => {
      mountCount -= 1;
    };
    const onHash = () => {
      setOpen(isStudioHashActive());
    };
    window.addEventListener("hashchange", onHash);
    const onKeyDown = (e) => {
      if (e.key !== "Escape") return;
      if (!isStudioHashActive()) return;
      const target = e.target;
      if (target !== null && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) {
        target.blur();
        return;
      }
      closeStudio();
      const trigger = document.querySelector("[data-up-section] button, [data-up-row] button");
      trigger?.focus();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("hashchange", onHash);
      window.removeEventListener("keydown", onKeyDown);
      mountCount -= 1;
      if (isStudioHashActive()) closeStudio();
    };
  }, []);
  React11.useEffect(() => {
    if (!isPrimary.current) return;
    return controller2?.subscribeState(() => force((n) => n + 1)) ?? (() => {
    });
  }, [controller2]);
  const [session, setSession] = React11.useState(() => {
    if (stashedSession !== null && controller2?.engine.getState().hasDraft !== true) {
      stashedSession = null;
      return null;
    }
    return stashedSession;
  });
  const [presets, setPresets] = React11.useState([]);
  const [presetsLoaded, setPresetsLoaded] = React11.useState(false);
  const [busy, setBusy] = React11.useState(false);
  const [notice, setNotice] = React11.useState(null);
  const fileInputRef = React11.useRef(null);
  const sessionRef = React11.useRef(null);
  sessionRef.current = session;
  const [confirmBox, setConfirmBox] = React11.useState(null);
  const activeTokensKey = JSON.stringify(controller2?.engine.getActiveCompiled()?.tokens ?? null);
  const chromePins = React11.useMemo(() => {
    try {
      return computeChromePins(controller2?.engine.getActiveCompiled()?.tokens ?? null, detectAppScheme());
    } catch {
      return {};
    }
  }, [controller2, activeTokensKey]);
  const [activeThemeId, setActiveThemeId] = React11.useState(null);
  React11.useEffect(() => {
    let cancelled = false;
    const id = controller2?.getState().activePresetId ?? null;
    if (id === null) {
      setActiveThemeId(null);
      return void 0;
    }
    void controller2?.loadPreset(id).then((preset2) => {
      if (!cancelled) setActiveThemeId(preset2?.theme?.id ?? null);
    });
    return () => {
      cancelled = true;
    };
  }, [controller2, controller2?.getState().activePresetId]);
  const refreshPresets = React11.useCallback(async () => {
    const list = await controller2?.listPresets() ?? [];
    setPresets(list);
    setPresetsLoaded(true);
  }, [controller2]);
  React11.useEffect(() => {
    void refreshPresets();
    const unsubscribe = controller2?.subscribeLibrary(() => {
      void refreshPresets();
    });
    return () => {
      unsubscribe?.();
    };
  }, [controller2, refreshPresets]);
  React11.useEffect(() => {
    if (!isPrimary.current) return;
    return () => {
      const s = sessionRef.current;
      if (s !== null && controller2?.engine.getState().hasDraft === true) {
        stashedSession = s;
      }
    };
  }, [controller2]);
  if (!isPrimary.current || !open) return null;
  const state = controller2?.getState();
  const hasUnsavedDraft = () => {
    return session !== null && controller2?.engine.getState().hasDraft === true;
  };
  const requestDiscard = (action) => {
    if (!hasUnsavedDraft()) {
      action();
      return;
    }
    setConfirmBox({ message: t2("studio.unsavedConfirm"), label: t2("studio.continueDiscard"), action });
  };
  const requestConfirm = (message, label, action) => {
    setConfirmBox({ message, label, action });
  };
  const openEditor = async (id) => {
    requestDiscard(() => {
      void doOpenEditor(id);
    });
  };
  const doOpenEditor = async (id) => {
    setBusy(true);
    try {
      const preset2 = await controller2?.loadPreset(id);
      if (preset2 === null) {
        setNotice(t2("studio.presetMissing", { id }));
        return;
      }
      const next = {
        presetId: preset2.id,
        presetName: preset2.name,
        tokens: { ...preset2.tokens },
        css: preset2.css ?? [],
        theme: { enabled: preset2.theme !== void 0, colorScheme: preset2.theme?.colorScheme ?? "dark" },
        assets: preset2.assets ?? [],
        widgets: preset2.widgets ?? [],
        cover: preset2.cover,
        // #74：加载预设自带分组（extra.groups——用户自建组随预设走）
        groups: Array.isArray(preset2.extra?.groups) ? preset2.extra.groups : []
      };
      setSession(next);
      stashedSession = null;
      controller2?.engine.startDraft(preset2);
      setNotice(null);
    } finally {
      setBusy(false);
    }
  };
  const startNew = () => {
    requestDiscard(() => {
      const id = `preset-${Date.now().toString(36)}`;
      const next = { presetId: id, presetName: t2("studio.newPresetName"), tokens: {}, css: [], theme: { enabled: false, colorScheme: "dark" }, assets: [], widgets: [], cover: void 0, groups: [] };
      setSession(next);
      stashedSession = null;
      const empty = { schemaVersion: 1, id, name: t2("studio.newPresetName"), edition: "standard", tokens: {} };
      controller2?.engine.startDraft(empty);
      setNotice(null);
    });
  };
  const captureActive = () => {
    requestDiscard(() => {
      const id = `preset-${Date.now().toString(36)}`;
      const tokens = controller2?.engine.getActiveCompiled()?.tokens ?? {};
      if (Object.keys(tokens).length === 0) {
        const next2 = { presetId: id, presetName: t2("studio.fromDefaultName"), tokens: {}, css: [], theme: { enabled: false, colorScheme: "dark" }, assets: [], widgets: [], cover: void 0, groups: [] };
        setSession(next2);
        stashedSession = null;
        const empty = { schemaVersion: 1, id, name: t2("studio.fromDefaultName"), edition: "standard", tokens: {} };
        controller2?.engine.startDraft(empty);
        setNotice(t2("studio.createdFromDefault"));
        return;
      }
      const next = { presetId: id, presetName: t2("studio.fromCurrentName"), tokens: { ...tokens }, css: [], theme: { enabled: false, colorScheme: "dark" }, assets: [], widgets: [], cover: void 0, groups: [] };
      setSession(next);
      stashedSession = null;
      controller2?.engine.startDraft(buildPreset(next));
      setNotice(null);
    });
  };
  const onSessionChange = (next, changedNames) => {
    setSession(next);
    const preset2 = buildPreset(next);
    if (changedNames.length === 0) {
      if (controller2?.engine.getState().hasDraft === true) {
        controller2.engine.patchDraft(preset2);
      }
      return;
    }
    controller2?.engine.patchDraft(preset2);
  };
  const save = async () => {
    if (session === null) {
      setNotice(t2("studio.noSession"));
      return;
    }
    setBusy(true);
    try {
      const isBuiltin = DEMO_PRESETS.some((p) => p.id === session.presetId);
      let workingSession = session;
      if (isBuiltin && session.presetId !== null) {
        const newId = `${session.presetId}-custom`;
        workingSession = { ...session, presetId: newId, presetName: `${session.presetName}\uFF08\u81EA\u5B9A\u4E49\uFF09` };
        setSession(workingSession);
      }
      const preset2 = buildPreset(workingSession);
      const ok = await controller2?.savePreset(preset2) ?? false;
      if (ok) {
        setSession((prev) => {
          if (prev === null) return { ...workingSession, presetId: preset2.id };
          const merged = { ...prev };
          if (prev.presetId !== preset2.id) merged.presetId = preset2.id;
          return merged;
        });
        stashedSession = null;
        const name2 = preset2.name;
        setNotice(isBuiltin ? t2("studio.savedBuiltinAs", { name: name2 }) : t2("studio.savedAs", { name: name2 }));
        await refreshPresets();
      } else {
        setNotice(controller2?.engine.getState().lastError ?? t2("studio.saveFail"));
      }
    } finally {
      setBusy(false);
    }
  };
  const discard = () => {
    requestDiscard(() => {
      controller2?.engine.discardDraft();
      setSession(null);
      stashedSession = null;
      setNotice(t2("studio.discarded"));
    });
  };
  const duplicate = async (id) => {
    setBusy(true);
    try {
      const preset2 = await controller2?.loadPreset(id);
      if (preset2 === null) {
        setNotice(t2("studio.presetMissing", { id }));
        return;
      }
      let copyId = `${id}-copy`;
      const existing = await controller2?.listPresets() ?? [];
      if (existing.some((p) => p.id === copyId)) copyId = `${id}-copy-${Date.now().toString(36)}`;
      const copy = { ...preset2, id: copyId, name: `${preset2.name}\uFF08\u526F\u672C\uFF09` };
      const ok = await controller2?.savePreset(copy, { activate: false }) ?? false;
      if (ok) {
        setNotice(t2("studio.copyOk", { name: copy.name }));
        await refreshPresets();
      } else {
        setNotice(t2("studio.copyFail"));
      }
    } finally {
      setBusy(false);
    }
  };
  const remove = async (id) => {
    const doRemove = async () => {
      const ok = await controller2?.deletePreset(id) ?? false;
      if (ok) {
        setNotice(t2("studio.deleted", { id }));
        if (session?.presetId === id) {
          setSession(null);
          stashedSession = null;
          controller2?.engine.discardDraft();
          setNotice(t2("studio.deletedReverted", { id }));
        }
        await refreshPresets();
      } else {
        setNotice(t2("studio.deleteFail"));
      }
    };
    if (session?.presetId === id && hasUnsavedDraft()) {
      setConfirmBox({
        message: t2("studio.unsavedConfirm"),
        label: t2("studio.continueDiscard"),
        action: () => {
          requestConfirm(t2("studio.deleteConfirm", { id }), t2("studio.deleteAction"), () => {
            void doRemove();
          });
        }
      });
    } else {
      requestConfirm(t2("studio.deleteConfirm", { id }), t2("studio.deleteAction"), () => {
        void doRemove();
      });
    }
  };
  const restoreBackup = (id) => {
    const name2 = presets.find((p) => p.id === id)?.name ?? id;
    const doRestore = async () => {
      setBusy(true);
      try {
        const result = await controller2?.restoreBackup(id);
        if (result?.ok === true) {
          setNotice(t2("studio.backupOk", { name: name2 }));
          await refreshPresets();
        } else {
          setNotice(result?.error ?? t2("studio.backupFail"));
        }
      } finally {
        setBusy(false);
      }
    };
    const confirmRestore = () => {
      requestConfirm(
        t2("studio.backupConfirm", { name: name2 }),
        t2("studio.backupAction"),
        () => {
          void doRestore();
        }
      );
    };
    if (session?.presetId === id && hasUnsavedDraft()) {
      setConfirmBox({
        message: t2("studio.unsavedConfirm"),
        label: t2("studio.continueDiscard"),
        action: confirmRestore
      });
    } else {
      confirmRestore();
    }
  };
  const importFile = async (file) => {
    if (file === void 0) return;
    const result = await controller2?.importPresetFile(file);
    if (result?.ok === true) {
      setNotice(t2("studio.imported", { id: result.id }));
      await refreshPresets();
    } else {
      setNotice(result?.error ?? t2("studio.importFail"));
    }
  };
  const exportZipCurrent = async () => {
    if (session !== null) {
      const ok = await controller2?.exportZipFile(buildPreset(session)) ?? false;
      if (ok) setNotice(t2("studio.exported"));
    } else if (state?.activePresetId !== null && state?.activePresetId !== void 0) {
      const preset2 = await controller2?.loadPreset(state.activePresetId);
      if (preset2 !== null) {
        const ok = await controller2?.exportZipFile(preset2) ?? false;
        if (ok) setNotice(t2("studio.exported"));
      } else {
        setNotice(t2("studio.exportMissing"));
      }
    } else {
      setNotice(t2("studio.exportEmpty"));
    }
  };
  const applyPreset = (id) => {
    const doApply = async () => {
      const ok = await controller2?.applyPresetById(id) ?? false;
      setNotice(ok ? null : t2("studio.applyFail", { id, error: controller2?.engine.getState().lastError ?? t2("studio.broken") }));
    };
    if (session !== null && controller2?.engine.getState().hasDraft === true) {
      setConfirmBox({
        message: t2("studio.draftBlocksApply"),
        label: t2("studio.discardAndApply"),
        action: () => {
          controller2?.engine.discardDraft();
          setSession(null);
          stashedSession = null;
          void doApply();
        }
      });
    } else {
      void doApply();
    }
  };
  const activeId = state?.activePresetId;
  const activeName = activeId !== null && activeId !== void 0 ? presets.find((p) => p.id === activeId)?.name ?? activeId : null;
  return /* @__PURE__ */ React11.createElement(
    "div",
    {
      "data-up-studio": true,
      onKeyDownCapture: (e) => {
        if (e.key !== "Escape") return;
        const target = e.target;
        if (target !== null && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) {
          target.blur();
          return;
        }
        closeStudio();
        const trigger = document.querySelector("[data-up-section] button, [data-up-row] button");
        trigger?.focus();
      },
      ref: (el) => {
        if (el !== null && document.activeElement === document.body) {
          el.querySelector("[data-up-studio-bar] button")?.focus();
        }
      },
      style: Object.keys(chromePins).length > 0 ? chromePins : void 0
    },
    /* @__PURE__ */ React11.createElement("div", { "data-up-studio-bar": true }, /* @__PURE__ */ React11.createElement("button", { type: "button", "data-up-btn": true, onClick: () => {
      closeStudio();
    } }, t2("studio.back")), /* @__PURE__ */ React11.createElement("div", { "data-up-studio-title": true }, t2("studio.title")), /* @__PURE__ */ React11.createElement("span", { "data-up-status": true, style: { marginRight: "auto" } }, activeName !== null ? t2("studio.active", { name: activeName }) : t2("studio.noActive")), /* @__PURE__ */ React11.createElement("button", { type: "button", "data-up-btn": true, onClick: () => {
      void exportZipCurrent();
    } }, t2("studio.exportZip")), /* @__PURE__ */ React11.createElement("button", { type: "button", "data-up-btn": true, onClick: discard, disabled: session === null || busy }, t2("studio.discard")), /* @__PURE__ */ React11.createElement("button", { type: "button", "data-up-btn": true, "data-up-btn-primary": true, onClick: () => {
      void save();
    }, disabled: session === null || busy }, t2("studio.save"))),
    /* @__PURE__ */ React11.createElement("div", { "data-up-studio-body": true, style: { display: "flex", gap: 16, padding: 16, flex: 1, overflow: "hidden" } }, /* @__PURE__ */ React11.createElement("aside", { style: { width: 220, flexShrink: 0, display: "flex", flexDirection: "column", gap: 8, overflow: "auto" } }, /* @__PURE__ */ React11.createElement("div", { style: { display: "flex", gap: 6, flexWrap: "wrap" } }, /* @__PURE__ */ React11.createElement("button", { type: "button", "data-up-btn": true, onClick: startNew, disabled: busy }, t2("studio.new")), /* @__PURE__ */ React11.createElement("button", { type: "button", "data-up-btn": true, onClick: captureActive, disabled: busy }, t2("studio.capture")), /* @__PURE__ */ React11.createElement("button", { type: "button", "data-up-btn": true, onClick: () => {
      fileInputRef.current?.click();
    }, disabled: busy }, t2("studio.import")), /* @__PURE__ */ React11.createElement(
      "input",
      {
        ref: fileInputRef,
        type: "file",
        accept: ".zip,application/zip",
        style: { display: "none" },
        onChange: (e) => {
          void importFile(e.target.files?.[0]);
          e.target.value = "";
        }
      }
    )), /* @__PURE__ */ React11.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 6 } }, presets.map((item) => /* @__PURE__ */ React11.createElement("div", { key: item.id, "data-up-card": true, style: { padding: 10, gap: 4 } }, /* @__PURE__ */ React11.createElement("div", { "data-up-card-title": true, style: { fontSize: 13 } }, item.name), /* @__PURE__ */ React11.createElement("div", { "data-up-card-desc": true }, item.id, item.builtin ? t2("studio.builtinTag") : ""), /* @__PURE__ */ React11.createElement("div", { style: { display: "flex", gap: 4, flexWrap: "wrap" } }, /* @__PURE__ */ React11.createElement("button", { type: "button", "data-up-btn": true, style: { padding: "3px 10px", fontSize: 12 }, onClick: () => {
      void applyPreset(item.id);
    }, disabled: busy }, t2("studio.apply")), /* @__PURE__ */ React11.createElement("button", { type: "button", "data-up-btn": true, style: { padding: "3px 10px", fontSize: 12 }, onClick: () => {
      void openEditor(item.id);
    }, disabled: busy }, t2("studio.edit")), /* @__PURE__ */ React11.createElement("button", { type: "button", "data-up-btn": true, style: { padding: "3px 10px", fontSize: 12 }, onClick: () => {
      void duplicate(item.id);
    }, disabled: busy || item.builtin }, t2("studio.duplicate")), /* @__PURE__ */ React11.createElement("button", { type: "button", "data-up-btn": true, style: { padding: "3px 10px", fontSize: 12 }, onClick: () => {
      void remove(item.id);
    }, disabled: busy || item.builtin }, t2("studio.delete")), item.hasBackup && /* @__PURE__ */ React11.createElement("button", { type: "button", "data-up-btn": true, "data-up-restore-btn": true, style: { padding: "3px 10px", fontSize: 12 }, onClick: () => {
      restoreBackup(item.id);
    }, disabled: busy }, t2("studio.restoreBackup"))))), presetsLoaded && presets.length === 0 && /* @__PURE__ */ React11.createElement("div", { "data-up-status": true }, t2("studio.empty")))), /* @__PURE__ */ React11.createElement(
      "main",
      {
        "data-up-editor-col": true,
        style: { flex: 1, minWidth: 0, minHeight: 0, display: "flex", flexDirection: "column", overflow: "auto" }
      },
      hasCapability("knobs") && session !== null && /* @__PURE__ */ React11.createElement(TokenEditor, { key: session.presetId ?? "new", session, onSessionChange }),
      hasCapability("knobs") && session === null && /* @__PURE__ */ React11.createElement("div", { "data-up-wall": true, style: { justifyContent: "center", height: "100%" } }, /* @__PURE__ */ React11.createElement("div", { "data-up-status": true }, t2("studio.pickOne")))
    )),
    /* @__PURE__ */ React11.createElement("div", { "data-up-studio-status": true, style: { padding: "8px 16px", borderTop: "1px solid var(--dsw-alias-border-l2)", fontSize: 12, color: "var(--dsw-alias-label-tertiary, #999)", display: "flex", gap: 12, alignItems: "center" } }, state?.hasDraft === true ? /* @__PURE__ */ React11.createElement("span", { style: { color: "var(--dsw-alias-state-warn-primary, #b7791f)" } }, t2("studio.draft")) : /* @__PURE__ */ React11.createElement("span", null, t2("studio.saved")), activeThemeId !== null && /* @__PURE__ */ React11.createElement("span", { "data-up-theme-row": true, style: { display: "flex", alignItems: "center", gap: 6 } }, t2("studio.themeRegistered", { id: activeThemeId }), /* @__PURE__ */ React11.createElement(
      "button",
      {
        type: "button",
        "data-up-btn": true,
        style: { padding: "2px 10px", fontSize: 11 },
        onClick: () => {
          const result = controller2?.selectTheme(activeThemeId);
          if (result?.ok === true) setNotice(t2("studio.themeSwitched", { id: activeThemeId }));
        }
      },
      t2("studio.switchTheme")
    )), /* @__PURE__ */ React11.createElement("span", null, notice ?? ""), state?.lastError !== null && state?.lastError !== void 0 && /* @__PURE__ */ React11.createElement("span", { "data-up-error": true }, state.lastError)),
    confirmBox !== null && /* @__PURE__ */ React11.createElement(
      ConfirmDialog,
      {
        message: confirmBox.message,
        confirmLabel: confirmBox.label,
        onConfirm: () => {
          const action = confirmBox.action;
          setConfirmBox(null);
          action();
        },
        onCancel: () => {
          setConfirmBox(null);
        }
      }
    )
  );
}

// src/core/audit.ts
function isKnownOutsideCatalog(name2) {
  return name2.startsWith("--dsh-");
}
function auditPreset(preset2) {
  const warnings = [];
  if (preset2.targetDshVersion !== void 0 && preset2.targetDshVersion !== catalog.dshVersion) {
    warnings.push(
      `\u300C${preset2.name}\u300D\u57FA\u4E8E DSH ${preset2.targetDshVersion}\uFF08\u5F53\u524D\u4EE4\u724C\u76EE\u5F55 ${catalog.dshVersion}\uFF09\u2014\u2014\u4EE4\u724C\u96C6\u53EF\u80FD\u5DF2\u53D8\u5316`
    );
  }
  const unknown = Object.keys(preset2.tokens).filter((name2) => {
    if (isKnownOutsideCatalog(name2)) return false;
    return !catalog.entries.some((entry) => entry.name === name2);
  });
  if (unknown.length > 0) {
    const sample = unknown.slice(0, 3).join("\u3001");
    warnings.push(`\u300C${preset2.name}\u300D\u542B\u76EE\u5F55\u5916\u4EE4\u724C ${unknown.length} \u9879\uFF08${sample}${unknown.length > 3 ? "\u2026" : ""}\uFF09`);
  }
  return warnings;
}
function auditPresets(presets) {
  const out = [];
  const seen = /* @__PURE__ */ new Set();
  for (const preset2 of presets) {
    for (const warning of auditPreset(preset2)) {
      if (!seen.has(warning)) {
        seen.add(warning);
        out.push(warning);
      }
    }
  }
  return out;
}

// src/client/favorites.ts
var FAVORITES_KEY = "ui-presets-favorites";
function parseFavorites(raw) {
  if (raw === null || raw === "") return [];
  let data;
  try {
    data = JSON.parse(raw);
  } catch {
    return [];
  }
  if (!Array.isArray(data)) return [];
  const out = [];
  for (const item of data) {
    if (typeof item !== "string" || item === "") continue;
    if (out.includes(item)) continue;
    out.push(item);
  }
  return out;
}
function loadFavorites() {
  try {
    return parseFavorites(localStorage.getItem(FAVORITES_KEY));
  } catch {
    return [];
  }
}
function saveFavorites(ids) {
  try {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(ids));
  } catch {
  }
}
function toggleInList(ids, id) {
  return ids.includes(id) ? ids.filter((item) => item !== id) : [...ids, id];
}
function isFavorite(ids, id) {
  return ids.includes(id);
}
function pickRandomId(ids, exclude, random = Math.random) {
  const pool = exclude === null ? ids : ids.filter((id) => id !== exclude);
  if (pool.length === 0) return null;
  const index = Math.min(pool.length - 1, Math.max(0, Math.floor(random() * pool.length)));
  return pool[index] ?? null;
}

// src/client/share.ts
var SHARE_HASH_PREFIX = "#ui-presets-share=";
var SHARE_PAYLOAD_VERSION = 1;
var MAX_SHARE_CHARS = 2e5;
var SHARE_WARN_CHARS = 2e4;
function isRecord2(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
function toBase64Url(bytes) {
  let binary = "";
  const CHUNK = 32768;
  for (let i = 0; i < bytes.length; i += CHUNK) {
    binary += String.fromCharCode(...bytes.subarray(i, i + CHUNK));
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function fromBase64Url(text) {
  if (text === "" || !/^[A-Za-z0-9_-]+$/.test(text)) return null;
  const padded = text.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat((4 - text.length % 4) % 4);
  try {
    const binary = atob(padded);
    const out = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) out[i] = binary.charCodeAt(i);
    return out;
  } catch {
    return null;
  }
}
function stripAssetPayload(preset2) {
  const clone = JSON.parse(JSON.stringify(preset2));
  let omitted = 0;
  if (Array.isArray(clone.assets)) {
    for (const asset of clone.assets) {
      if (asset.dataUrl !== void 0) {
        delete asset.dataUrl;
        omitted += 1;
      }
    }
  }
  return { preset: clone, omitted };
}
function encodeShare(preset2) {
  const { preset: lean, omitted } = stripAssetPayload(preset2);
  const validated = validatePreset(lean);
  if (!validated.ok) {
    return { ok: false, error: t("share.badPreset", { errors: validated.errors.join("; ") }) };
  }
  const json = JSON.stringify({ v: SHARE_PAYLOAD_VERSION, p: validated.preset });
  const code = toBase64Url(new TextEncoder().encode(json));
  if (code.length > MAX_SHARE_CHARS) {
    return {
      ok: false,
      error: t("share.tooLarge", { chars: code.length, max: MAX_SHARE_CHARS })
    };
  }
  const result = { ok: true, code, chars: code.length, omitted };
  if (code.length > SHARE_WARN_CHARS) {
    result.warn = t("share.longCode", { chars: code.length });
  }
  return result;
}
function extractShareCode(text) {
  const trimmed = text.trim();
  if (trimmed === "") return null;
  const marker = "ui-presets-share=";
  const at = trimmed.indexOf(marker);
  if (at >= 0) {
    const rest = trimmed.slice(at + marker.length);
    const cut = rest.search(/[&#\s]/);
    return cut >= 0 ? rest.slice(0, cut) : rest;
  }
  if (/^[A-Za-z0-9_-]+$/.test(trimmed)) return trimmed;
  return null;
}
function decodeShare(text) {
  const code = extractShareCode(text);
  if (code === null) {
    return { ok: false, error: t("share.notCode") };
  }
  const bytes = fromBase64Url(code);
  if (bytes === null) return { ok: false, error: t("share.badBase64") };
  let payload;
  try {
    payload = JSON.parse(new TextDecoder().decode(bytes));
  } catch {
    return { ok: false, error: t("share.badJson") };
  }
  if (!isRecord2(payload) || payload.v !== SHARE_PAYLOAD_VERSION || !isRecord2(payload.p)) {
    return { ok: false, error: t("share.badVersion", { version: SHARE_PAYLOAD_VERSION }) };
  }
  const validated = validatePreset(payload.p);
  if (!validated.ok) {
    return { ok: false, error: t("share.badPayload", { errors: validated.errors.join("; ") }) };
  }
  const preset2 = validated.preset;
  const omitted = Array.isArray(preset2.assets) ? preset2.assets.filter((asset) => asset.dataUrl === void 0).length : 0;
  return { ok: true, preset: preset2, omitted };
}
function buildShareLink(baseUrl, code) {
  const base = baseUrl.split("#")[0];
  return `${base}${SHARE_HASH_PREFIX}${code}`;
}
var pendingShare = null;
function capturePendingShare(hash) {
  if (!hash.startsWith(SHARE_HASH_PREFIX)) return null;
  const decoded = decodeShare(hash);
  pendingShare = decoded.ok ? { ok: true, preset: decoded.preset, omitted: decoded.omitted, source: "link" } : { ok: false, error: decoded.error };
  return pendingShare;
}
function getPendingShare() {
  return pendingShare;
}
function clearPendingShare() {
  pendingShare = null;
}

// src/client/share-dialog.tsx
var React12 = __toESM(require("react"), 1);
async function copyText(text) {
  try {
    if (navigator.clipboard !== void 0 && typeof navigator.clipboard.writeText === "function") {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
  }
  try {
    const el = document.createElement("textarea");
    el.value = text;
    el.style.position = "fixed";
    el.style.opacity = "0";
    document.body.append(el);
    el.select();
    const ok = document.execCommand("copy");
    el.remove();
    return ok;
  } catch {
    return false;
  }
}
function DialogShell(props) {
  return /* @__PURE__ */ React12.createElement(
    "div",
    {
      "data-up-share-dialog": true,
      role: "dialog",
      "aria-label": props.label,
      tabIndex: -1,
      onKeyDownCapture: (e) => {
        if (e.key === "Escape") {
          e.stopPropagation();
          props.onClose();
        }
      },
      style: {
        position: "fixed",
        inset: 0,
        zIndex: 1300,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0, 0, 0, 0.7)",
        outline: "none"
      }
    },
    /* @__PURE__ */ React12.createElement(
      "div",
      {
        "data-up-share-card": true,
        style: {
          width: "min(620px, calc(100vw - 48px))",
          maxHeight: "calc(100vh - 48px)",
          overflow: "auto",
          background: "var(--dsw-alias-bg-layer-1, #fff)",
          color: "var(--dsw-alias-label-primary, #111)",
          borderRadius: 12,
          padding: 16,
          display: "flex",
          flexDirection: "column",
          gap: 12,
          border: "1px solid var(--dsw-alias-border-l2, #ddd)",
          boxShadow: "0 12px 40px rgba(0,0,0,0.5)"
        }
      },
      /* @__PURE__ */ React12.createElement("div", { style: { fontSize: 14, fontWeight: 600 } }, props.title),
      props.children
    )
  );
}
var fieldStyle = {
  width: "100%",
  boxSizing: "border-box",
  fontSize: 11,
  fontFamily: "var(--ds-font-family-code)",
  padding: "6px 8px",
  borderRadius: 6,
  border: "1px solid var(--dsw-alias-border-l2, #ddd)",
  background: "var(--dsw-alias-bg-layer-2, #fff)",
  color: "var(--dsw-alias-label-primary, #111)",
  wordBreak: "break-all"
};
function ShareExportDialog(props) {
  const { t: t2 } = useI18n();
  const [copied, setCopied] = React12.useState(null);
  const [error, setError] = React12.useState(null);
  const doCopy = async (kind) => {
    const ok = await copyText(kind === "link" ? props.link : props.code);
    if (ok) {
      setCopied(kind);
      setError(null);
    } else {
      setError(t2("share.copyFail"));
    }
  };
  return /* @__PURE__ */ React12.createElement(DialogShell, { label: t2("wall.share"), title: t2("share.exportTitle", { name: props.presetName }), onClose: props.onClose }, /* @__PURE__ */ React12.createElement("div", { style: { fontSize: 12, lineHeight: 1.6, color: "var(--dsw-alias-label-secondary, #666)" } }, t2("share.exportBody"), props.omitted > 0 && /* @__PURE__ */ React12.createElement("span", { "data-up-share-omitted": true, style: { color: "var(--dsw-alias-state-warn-primary, #b7791f)" } }, t2("share.exportOmitted", { count: props.omitted })), props.warn !== void 0 && /* @__PURE__ */ React12.createElement("div", { style: { marginTop: 4, color: "var(--dsw-alias-state-warn-primary, #b7791f)" } }, props.warn)), /* @__PURE__ */ React12.createElement("label", { style: { fontSize: 12, fontWeight: 600 } }, t2("share.linkLabel"), /* @__PURE__ */ React12.createElement(
    "input",
    {
      readOnly: true,
      "data-up-share-link": true,
      value: props.link,
      onFocus: (e) => {
        e.currentTarget.select();
      },
      style: fieldStyle
    }
  )), /* @__PURE__ */ React12.createElement("div", { style: { display: "flex", gap: 8 } }, /* @__PURE__ */ React12.createElement("button", { type: "button", "data-up-btn": true, onClick: () => {
    void doCopy("link");
  } }, t2("share.copyLink")), /* @__PURE__ */ React12.createElement("button", { type: "button", "data-up-btn": true, onClick: () => {
    void doCopy("code");
  } }, t2("share.copyCode")), /* @__PURE__ */ React12.createElement("span", { "data-up-status": true, style: { fontSize: 11 } }, copied === "link" ? t2("share.copiedLink") : copied === "code" ? t2("share.copiedCode") : t2("share.codeChars", { count: props.chars }))), /* @__PURE__ */ React12.createElement("label", { style: { fontSize: 12, fontWeight: 600 } }, t2("share.codeLabel"), /* @__PURE__ */ React12.createElement(
    "textarea",
    {
      readOnly: true,
      "data-up-share-code": true,
      rows: 4,
      value: props.code,
      onFocus: (e) => {
        e.currentTarget.select();
      },
      style: { ...fieldStyle, resize: "vertical" }
    }
  )), error !== null && /* @__PURE__ */ React12.createElement("div", { "data-up-status": true, style: { fontSize: 12, color: "var(--dsw-alias-state-error-primary, #d94c4c)" } }, error), /* @__PURE__ */ React12.createElement("div", { style: { display: "flex", justifyContent: "flex-end" } }, /* @__PURE__ */ React12.createElement("button", { type: "button", "data-up-btn": true, "data-up-btn-primary": true, onClick: props.onClose }, t2("share.close"))));
}
function ShareImportDialog(props) {
  const { t: t2 } = useI18n();
  const [text, setText] = React12.useState("");
  const [error, setError] = React12.useState(null);
  const submit = () => {
    const decoded = decodeShare(text);
    if (!decoded.ok) {
      setError(decoded.error);
      return;
    }
    setError(null);
    props.onImport(text);
  };
  return /* @__PURE__ */ React12.createElement(DialogShell, { label: t2("share.importTitle"), title: t2("share.importTitle"), onClose: props.onClose }, /* @__PURE__ */ React12.createElement("div", { style: { fontSize: 12, lineHeight: 1.6, color: "var(--dsw-alias-label-secondary, #666)" } }, t2("share.importBody")), /* @__PURE__ */ React12.createElement(
    "textarea",
    {
      "data-up-share-input": true,
      rows: 5,
      autoFocus: true,
      placeholder: t2("share.importPlaceholder"),
      value: text,
      onChange: (e) => {
        setText(e.target.value);
        setError(null);
      },
      onKeyDown: (e) => {
        if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
          e.preventDefault();
          submit();
        }
      },
      style: { ...fieldStyle, fontWeight: 400, resize: "vertical" }
    }
  ), error !== null && /* @__PURE__ */ React12.createElement("div", { "data-up-status": true, style: { fontSize: 12, color: "var(--dsw-alias-state-error-primary, #d94c4c)" } }, error), /* @__PURE__ */ React12.createElement("div", { style: { display: "flex", gap: 8, justifyContent: "flex-end" } }, /* @__PURE__ */ React12.createElement("button", { type: "button", "data-up-btn": true, onClick: props.onClose }, t2("share.cancel")), /* @__PURE__ */ React12.createElement("button", { type: "button", "data-up-btn": true, "data-up-btn-primary": true, disabled: text.trim() === "", onClick: submit }, t2("share.importAction"))));
}

// src/client/index.tsx
var name = "wallpaper-plugin";
var inject = ["slots", "theme"];
var STYLE_MARKER = "style[data-ui-presets-style]";
var CSS = `
[data-up-section] { padding: 4px 0; }
[data-up-wall] { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 12px; }
[data-up-card] { border: 1px solid var(--dsw-alias-border-l2, #ddd); border-radius: 12px; padding: 10px; display: flex; flex-direction: column; gap: 8px; cursor: pointer; transition: border-color 0.15s, box-shadow 0.15s; }
[data-up-card]:hover { border-color: var(--dsw-alias-button-info-fill, #416fe6); box-shadow: 0 2px 10px rgba(0,0,0,0.08); }
[data-up-card-active] { border-color: var(--dsw-alias-button-info-fill, #416fe6); box-shadow: 0 0 0 1px var(--dsw-alias-button-info-fill, #416fe6); }
/* M4-2\uFF1Aprefers-reduced-motion\u2014\u2014\u5173\u95ED\u8FC7\u6E21\u4E0E\u52A8\u6548 */
@media (prefers-reduced-motion: reduce) {
  [data-up-card], [data-up-btn], [data-up-studio] * { transition: none !important; animation: none !important; }
}
/* M4-3\uFF1A\u7A84\u5C4F\u54CD\u5E94\u5F0F\u2014\u2014\u5DE5\u4F5C\u5BA4\u4E09\u680F <900px \u7EB5\u5411\u5806\u53E0\uFF08\u4E2D\u680F\u4F18\u5148\uFF0C\u5DE6\u53F3\u680F\u9650\u9AD8\u5185\u6EDA\uFF09 */
@media (max-width: 899px) {
  [data-up-studio-body] { flex-direction: column !important; overflow: auto !important; }
  [data-up-studio-body] > aside { width: auto !important; flex-shrink: 1 !important; max-height: 220px; overflow: auto !important; }
  [data-up-studio-body] > main { min-height: 0 !important; overflow: visible !important; }
  /* review P3\uFF1A\u7A84\u5C4F\u6807\u9898\u680F 7 \u63A7\u4EF6\u6362\u884C\uFF08\u539F\u65E0\u6362\u884C\u7B56\u7565\uFF0C~400px \u6EA2\u51FA\uFF09 */
  [data-up-studio-bar] { flex-wrap: wrap !important; }
  [data-up-studio-title] { min-width: 0 !important; }
}
[data-up-card-title] { font-size: 14px; font-weight: 600; }
[data-up-card-desc] { font-size: 12px; color: var(--dsw-alias-label-secondary, #666); }
[data-up-btn] { border-radius: 18px; border: 1px solid var(--dsw-alias-border-l2, #ddd); background: var(--dsw-alias-bg-layer-2, #fff); color: var(--dsw-alias-label-primary, #111); padding: 6px 16px; font-size: 13px; cursor: pointer; }
[data-up-btn-primary] { background: var(--dsw-alias-button-info-fill, #416fe6); border-color: transparent; color: #fff; }
[data-up-status] { font-size: 12px; color: var(--dsw-alias-label-tertiary, #999); min-height: 16px; }
[data-up-error] { color: var(--dsw-alias-state-error-primary, #d94c4c); font-size: 12px; }
/* #107\uFF08\u684C\u9762\u7AEF\u6309\u94AE\u6B8B\u7559\u4FEE\u590D\uFF09\uFF1A\u5DE5\u4F5C\u5BA4\u5168\u5C4F\u5C42\u5FC5\u987B\u8BA9\u5F00\u684C\u9762\u58F3\u7684\u539F\u751F\u6807\u9898\u680F\u6761\u5E26\u3002
   DSH Desktop\uFF08Windows\uFF09\u7528\u300C\u8986\u76D6\u5F0F\u6807\u9898\u680F\u300D\u2014\u2014preload \u5728 <html> \u5199 --dsh-windows-titlebar-height: 40px\uFF0C
   \u5E94\u7528\u81EA\u8EAB\u5E03\u5C40\u628A --dsh-frame-top-clearance \u8BBE\u4E3A\u8BE5\u9AD8\u5EA6\u5E76\u7528\u5B83\u7ED9 frame \u52A0 padding-top\uFF1B
   \u5E26 --dsh-frame-chrome-top / --dsh-frame-overlay-top \u7684\u6D6E\u5C42\u540C\u6837\u636E\u6B64\u4E0B\u79FB\u3002
   \u5DE5\u4F5C\u5BA4\u5C42\u539F\u5148 inset:0 \u76F4\u8D34\u9876\u7AEF\uFF1A\u5176\u9876\u680F\uFF08\u2039\u8FD4\u56DE / \u6807\u9898 / \u6D3B\u52A8 / \u5BFC\u51FA ZIP / \u653E\u5F03 / \u4FDD\u5B58\uFF09
   \u6B63\u597D\u843D\u5728\u6807\u9898\u680F\u6761\u5E26\u91CC\uFF0C\u4E0E\u58F3\u5185\u5DE6\u4E0A\u89D2\u7684 Windows \u6807\u9898\u680F\u83DC\u5355\uFF08\u5E94\u7528 / \u7F16\u8F91\uFF0Cz-index:1100\uFF0C
   height: var(--dsh-windows-titlebar-height)\uFF09\u91CD\u53E0\u2014\u2014\u7528\u6237\u770B\u5230\u300C\u4E4B\u524D\u9875\u9762\u7684\u6309\u94AE\u6B8B\u7559\u300D\u3002
   \u4FEE\u6CD5\uFF1A\u6839\u5143\u7D20\u52A0 padding-top = \u6846\u67B6\u9876\u90E8\u8BA9\u4F4D\uFF08\u7F51\u9875\u7AEF\u4E3A 0\uFF0C\u96F6\u5F71\u54CD\uFF09\uFF0C
   box-sizing: border-box \u4FDD\u8BC1\u4ECD\u94FA\u6EE1\u89C6\u53E3\u3001\u80CC\u666F\u4ECD\u76D6\u4F4F\u6574\u5C4F\u3002 */
[data-up-studio] { box-sizing: border-box; position: fixed; inset: 0; z-index: 1200; padding-top: var(--dsh-frame-top-clearance, 0px); background: var(--dsw-alias-bg-base, #fff); color: var(--dsw-alias-label-primary, #111); display: flex; flex-direction: column; }
[data-up-studio-bar] { display: flex; align-items: center; gap: 12px; padding: 10px 16px; border-bottom: 1px solid var(--dsw-alias-border-l2, #ddd); }
[data-up-studio-title] { font-size: 15px; font-weight: 600; flex: 1; }
[data-up-studio-body] { flex: 1; overflow: auto; padding: 24px; }
[data-up-row] { display: flex; align-items: center; justify-content: space-between; padding: 14px 0; border-bottom: 1px solid var(--dsw-alias-border-l2, #eee); font-size: 13px; }
`;
function apply(ctx) {
  let controller2 = null;
  try {
    controller2 = new PresetsController(ctx);
    setController(controller2);
  } catch (error) {
    console.error("[ui-presets] controller init failed:", error);
  }
  if (controller2 !== null) {
    ctx.effect(() => () => {
      controller2?.dispose();
      controller2?.engine.dispose();
      controller2?.stopAiBridge();
      setController(null);
    }, "wallpaper-plugin: engine");
    void controller2.adoptPersisted();
    controller2.startAiBridge();
    controller2.startRotation();
  }
  try {
    if (capturePendingShare(window.location.hash) !== null) {
      history.replaceState(null, "", window.location.pathname + window.location.search);
    }
  } catch (error) {
    console.warn("[ui-presets] \u5206\u4EAB\u94FE\u63A5\u89E3\u6790\u5931\u8D25\uFF1A", error);
  }
  if (document.querySelector(STYLE_MARKER) === null) {
    const styleEl = document.createElement("style");
    styleEl.setAttribute("data-ui-presets-style", "");
    styleEl.setAttribute("data-plugin", "ui-presets");
    styleEl.textContent = CSS;
    document.head.append(styleEl);
    ctx.effect(() => () => {
      styleEl.remove();
    }, "ui-presets: styles");
  }
  try {
    ctx.slots.inject("settings.section", () => {
      try {
        return ctx.slots.register({
          name: "settings.section",
          id: "appearance-presets",
          order: 5,
          label: () => t("section.title"),
          inject: () => ({})
        }, SectionPage);
      } catch (error) {
        console.warn("[ui-presets] settings.section \u6CE8\u518C\u5931\u8D25\uFF1A", error);
        return void 0;
      }
    });
  } catch (error) {
    console.warn("[ui-presets] settings.section inject \u5931\u8D25\uFF1A", error);
  }
}
function useControllerState() {
  const instance = getController();
  return React13.useSyncExternalStore(
    React13.useCallback(
      (listener) => instance === null ? () => {
      } : instance.subscribeState(listener),
      [instance]
    ),
    () => getController()?.getState() ?? null
  );
}
function SectionPage() {
  const controller2 = getController();
  const state = useControllerState();
  const { t: t2, locale, toggle: toggleLocale } = useI18n();
  const [auditWarnings, setAuditWarnings] = React13.useState([]);
  const [wallItems, setWallItems] = React13.useState(null);
  const [covers, setCovers] = React13.useState({});
  const [importing, setImporting] = React13.useState(false);
  const fileInputRef = React13.useRef(null);
  const [pending, setPending] = React13.useState(() => getPendingShare());
  const [favorites, setFavorites] = React13.useState(() => loadFavorites());
  const [onlyFavorite, setOnlyFavorite] = React13.useState(false);
  const [shareExport, setShareExport] = React13.useState(null);
  const [shareImportOpen, setShareImportOpen] = React13.useState(false);
  const [notice, setNotice] = React13.useState(null);
  const loadWall = React13.useCallback(async () => {
    const items = await controller2?.listPresets() ?? [];
    setWallItems(items);
    const demoCovers = {};
    for (const demo of DEMO_PRESETS) demoCovers[demo.id] = coverDataUrlFor(demo);
    setCovers(demoCovers);
    for (const item of items) {
      if (item.builtin && demoCovers[item.id] !== void 0) continue;
      void controller2?.loadPreset(item.id).then((preset2) => {
        if (preset2 === null) return;
        void renderCoverFor(preset2).then((src) => {
          setCovers((prev) => ({ ...prev, [item.id]: src }));
        });
      });
    }
  }, [controller2]);
  React13.useEffect(() => {
    let alive = true;
    void loadWall();
    const unsubscribe = controller2?.subscribeLibrary(() => {
      if (!alive) return;
      void loadWall();
    });
    return () => {
      alive = false;
      unsubscribe?.();
    };
  }, [controller2, loadWall]);
  React13.useEffect(() => {
    const base = auditPresets(DEMO_PRESETS);
    setAuditWarnings(base);
    const activeId = state?.activePresetId;
    if (activeId !== null && activeId !== void 0) {
      void controller2?.loadPreset(activeId).then((preset2) => {
        if (preset2 !== null) {
          const extra = auditPresets([preset2]).filter((w) => !base.includes(w));
          if (extra.length > 0) setAuditWarnings([...base, ...extra]);
        }
      });
    }
  }, [controller2, state?.activePresetId]);
  const importPreset = async (file) => {
    if (file === null) return;
    setImporting(true);
    try {
      const result = await controller2?.importPresetFile(file);
      if (result?.ok === true) {
        await loadWall();
      } else {
        controller2?.engine.reportError(result?.error ?? t2("wall.importFailed"));
      }
    } finally {
      setImporting(false);
    }
  };
  const toggleFavorite = (id) => {
    const next = toggleInList(favorites, id);
    setFavorites(next);
    saveFavorites(next);
  };
  const surprise = () => {
    const ids = (wallItems ?? []).map((item) => item.id);
    const pick = pickRandomId(ids, state?.activePresetId ?? null);
    if (pick === null) {
      setNotice(t2("wall.noOther"));
      return;
    }
    setNotice(null);
    void controller2?.applyPresetById(pick);
  };
  const shareItem = async (id) => {
    if (controller2 === null) return;
    const preset2 = await controller2.loadPreset(id);
    if (preset2 === null) {
      controller2.engine.reportError(t2("wall.cannotRead", { id }));
      return;
    }
    const result = encodeShare(preset2);
    if (!result.ok) {
      controller2.engine.reportError(result.error);
      return;
    }
    setShareExport({
      name: preset2.name,
      link: buildShareLink(window.location.href, result.code),
      code: result.code,
      chars: result.chars,
      omitted: result.omitted,
      warn: result.warn
    });
  };
  const importShared = async (preset2, omitted) => {
    if (controller2 === null) return;
    setImporting(true);
    try {
      const existing = new Set((await controller2.listPresets()).map((item) => item.id));
      let target = preset2;
      if (existing.has(target.id)) {
        let n = 2;
        let id = `${preset2.id}-${n}`;
        while (existing.has(id)) {
          n += 1;
          id = `${preset2.id}-${n}`;
        }
        target = { ...preset2, id, name: `${preset2.name}\uFF08\u5BFC\u5165\uFF09` };
      }
      const ok = await controller2.savePreset(target, { activate: false, preserveDraft: true });
      if (!ok) return;
      await loadWall();
      setNotice(t2("wall.imported", { name: target.name }) + (omitted > 0 ? t2("wall.importedAssets", { count: omitted }) : ""));
    } finally {
      setImporting(false);
      clearPendingShare();
      setPending(null);
    }
  };
  const libraryEmpty = wallItems !== null && !wallItems.some((item) => !item.builtin);
  const visibleItems = (wallItems ?? []).filter((item) => !onlyFavorite || isFavorite(favorites, item.id));
  return /* @__PURE__ */ React13.createElement("div", { "data-up-section": true }, /* @__PURE__ */ React13.createElement("div", { style: { display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap", alignItems: "center" } }, /* @__PURE__ */ React13.createElement("button", { type: "button", "data-up-btn": true, "data-up-btn-primary": true, onClick: () => {
    openStudio();
  } }, t2("wall.openStudio")), /* @__PURE__ */ React13.createElement("button", { type: "button", "data-up-btn": true, onClick: () => {
    controller2?.clearActive();
  } }, t2("wall.reset")), /* @__PURE__ */ React13.createElement("button", { type: "button", "data-up-btn": true, "data-up-surprise": true, onClick: surprise }, t2("wall.surprise")), /* @__PURE__ */ React13.createElement(
    "button",
    {
      type: "button",
      "data-up-btn": true,
      "data-up-fav-filter": true,
      "data-up-fav-active": onlyFavorite ? "true" : void 0,
      onClick: () => {
        setOnlyFavorite((prev) => !prev);
      },
      style: onlyFavorite ? { borderColor: "var(--dsw-alias-brand-primary)" } : void 0
    },
    onlyFavorite ? "\u2605" : "\u2606",
    " ",
    favorites.length > 0 ? t2("wall.favOnlyCount", { count: favorites.length }) : t2("wall.favOnly")
  ), /* @__PURE__ */ React13.createElement("button", { type: "button", "data-up-btn": true, onClick: () => {
    setShareImportOpen(true);
  } }, t2("wall.importShare")), /* @__PURE__ */ React13.createElement("button", { type: "button", "data-up-btn": true, "data-up-locale": true, "aria-label": t2("lang.switchLabel"), onClick: toggleLocale }, locale === "zh" ? "EN" : "\u4E2D\u6587")), pending !== null && /* @__PURE__ */ React13.createElement(
    "div",
    {
      "data-up-share-banner": true,
      style: {
        display: "flex",
        gap: 8,
        alignItems: "center",
        flexWrap: "wrap",
        padding: "8px 12px",
        borderRadius: 8,
        fontSize: 12,
        lineHeight: 1.5,
        marginBottom: 8,
        border: `1px solid ${pending.ok ? "var(--dsw-alias-brand-primary, #4a7dff)" : "var(--dsw-alias-state-error-primary, #d94c4c)"}`,
        background: "var(--dsw-alias-bg-layer-1)"
      }
    },
    pending.ok ? /* @__PURE__ */ React13.createElement(React13.Fragment, null, /* @__PURE__ */ React13.createElement("span", null, t2("share.received", { name: pending.preset.name }), pending.omitted > 0 ? t2("share.assetsOmitted", { count: pending.omitted }) : ""), /* @__PURE__ */ React13.createElement("button", { type: "button", "data-up-btn": true, "data-up-btn-primary": true, onClick: () => {
      void importShared(pending.preset, pending.omitted);
    }, disabled: importing }, importing ? t2("wall.importing") : t2("share.importToLibrary")), /* @__PURE__ */ React13.createElement("button", { type: "button", "data-up-btn": true, onClick: () => {
      clearPendingShare();
      setPending(null);
    } }, t2("share.ignore"))) : /* @__PURE__ */ React13.createElement(React13.Fragment, null, /* @__PURE__ */ React13.createElement("span", { style: { color: "var(--dsw-alias-state-error-primary, #d94c4c)" } }, t2("share.invalid", { error: pending.error })), /* @__PURE__ */ React13.createElement("button", { type: "button", "data-up-btn": true, onClick: () => {
      clearPendingShare();
      setPending(null);
    } }, t2("share.gotIt")))
  ), auditWarnings.length > 0 && /* @__PURE__ */ React13.createElement(
    "div",
    {
      "data-up-banner": true,
      style: {
        padding: "8px 12px",
        borderRadius: 8,
        fontSize: 12,
        lineHeight: 1.5,
        marginBottom: 8,
        border: "1px solid var(--dsw-alias-state-warn-primary, #b7791f)",
        color: "var(--dsw-alias-state-warn-primary, #b7791f)",
        background: "var(--dsw-alias-bg-layer-1)"
      }
    },
    t2("wall.auditPrefix", { warnings: auditWarnings.join(locale === "en" ? "; " : "\uFF1B") })
  ), wallItems === null && /* @__PURE__ */ React13.createElement("div", { "data-up-status": true }, t2("wall.loading")), /* @__PURE__ */ React13.createElement("div", { "data-up-wall": true }, visibleItems.map((item) => {
    const active = state?.activePresetId === item.id;
    return /* @__PURE__ */ React13.createElement(
      "div",
      {
        key: item.id,
        "data-up-card": true,
        "data-up-card-active": active ? "true" : void 0,
        role: "button",
        tabIndex: 0,
        onClick: () => {
          if (!active) void controller2?.applyPresetById(item.id);
        },
        onKeyDown: (e) => {
          if ((e.key === "Enter" || e.key === " ") && !active) {
            e.preventDefault();
            void controller2?.applyPresetById(item.id);
          }
        }
      },
      /* @__PURE__ */ React13.createElement(
        "img",
        {
          "data-up-cover": true,
          src: covers[item.id] ?? "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
          alt: item.name,
          style: { width: "100%", aspectRatio: "3 / 1", objectFit: "cover", borderRadius: 8, border: "1px solid var(--dsw-alias-border-l2)", background: "var(--dsw-alias-bg-layer-1)" }
        }
      ),
      /* @__PURE__ */ React13.createElement("div", { "data-up-card-title": true }, item.name),
      /* @__PURE__ */ React13.createElement("div", { "data-up-card-desc": true }, item.builtin ? t2("wall.builtin") : t2("wall.mine"), item.id === "default" ? "" : ` \xB7 ${item.id}`),
      /* @__PURE__ */ React13.createElement("div", { style: { display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" } }, /* @__PURE__ */ React13.createElement(
        "button",
        {
          type: "button",
          "data-up-btn": true,
          "data-up-btn-primary": true,
          onClick: (e) => {
            e.stopPropagation();
            void controller2?.applyPresetById(item.id);
          }
        },
        active ? t2("wall.applied") : t2("wall.apply")
      ), /* @__PURE__ */ React13.createElement(
        "button",
        {
          type: "button",
          "data-up-fav": true,
          "aria-label": `${isFavorite(favorites, item.id) ? t2("wall.unfavorite") : t2("wall.favorite")} ${item.name}`,
          "aria-pressed": isFavorite(favorites, item.id),
          onClick: (e) => {
            e.stopPropagation();
            toggleFavorite(item.id);
          },
          style: { padding: "2px 8px", fontSize: 12, borderRadius: 6, border: "1px solid var(--dsw-alias-border-l2, #ddd)", background: "transparent", color: isFavorite(favorites, item.id) ? "var(--dsw-alias-brand-primary, #4a7dff)" : "var(--dsw-alias-label-secondary, #666)", cursor: "pointer" }
        },
        isFavorite(favorites, item.id) ? "\u2605" : "\u2606"
      ), /* @__PURE__ */ React13.createElement(
        "button",
        {
          type: "button",
          "data-up-share": true,
          onClick: (e) => {
            e.stopPropagation();
            void shareItem(item.id);
          },
          style: { padding: "2px 8px", fontSize: 12, borderRadius: 6, border: "1px solid var(--dsw-alias-border-l2, #ddd)", background: "transparent", color: "var(--dsw-alias-label-secondary, #666)", cursor: "pointer" }
        },
        t2("wall.share")
      ), active && /* @__PURE__ */ React13.createElement("span", { "data-up-status": true }, t2("wall.current")))
    );
  })), onlyFavorite && visibleItems.length === 0 && /* @__PURE__ */ React13.createElement("div", { "data-up-status": true, style: { marginTop: 8 } }, t2("wall.favEmpty")), libraryEmpty && /* @__PURE__ */ React13.createElement(
    "div",
    {
      "data-up-empty": true,
      style: {
        marginTop: 12,
        padding: "14px 16px",
        borderRadius: 10,
        fontSize: 13,
        lineHeight: 1.7,
        border: "1px dashed var(--dsw-alias-border-l2, #bbb)",
        background: "var(--dsw-alias-bg-layer-1)",
        color: "var(--dsw-alias-label-secondary, #666)"
      }
    },
    /* @__PURE__ */ React13.createElement("div", { style: { fontWeight: 600, color: "var(--dsw-alias-label-primary, #111)" } }, t2("wall.emptyTitle")),
    /* @__PURE__ */ React13.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" } }, /* @__PURE__ */ React13.createElement("span", null, t2("wall.emptyBody")), /* @__PURE__ */ React13.createElement("button", { type: "button", "data-up-btn": true, onClick: () => fileInputRef.current?.click(), disabled: importing }, importing ? t2("wall.importing") : t2("wall.importFile")), /* @__PURE__ */ React13.createElement(
      "input",
      {
        ref: fileInputRef,
        type: "file",
        accept: ".zip,application/zip",
        style: { display: "none" },
        onChange: (e) => {
          void importPreset(e.target.files?.[0] ?? null);
          e.target.value = "";
        }
      }
    ))
  ), notice !== null && /* @__PURE__ */ React13.createElement("div", { "data-up-status": true, "data-up-notice": true, style: { marginTop: 8 } }, notice), state?.lastError !== null && state?.lastError !== void 0 && /* @__PURE__ */ React13.createElement("div", { "data-up-status": true, style: { marginTop: 8 } }, /* @__PURE__ */ React13.createElement("span", { "data-up-error": true }, state.lastError)), /* @__PURE__ */ React13.createElement(StudioShell, null), shareExport !== null && /* @__PURE__ */ React13.createElement(
    ShareExportDialog,
    {
      presetName: shareExport.name,
      link: shareExport.link,
      code: shareExport.code,
      chars: shareExport.chars,
      omitted: shareExport.omitted,
      warn: shareExport.warn,
      onClose: () => {
        setShareExport(null);
      }
    }
  ), shareImportOpen && /* @__PURE__ */ React13.createElement(
    ShareImportDialog,
    {
      onClose: () => {
        setShareImportOpen(false);
      },
      onImport: (text) => {
        const decoded = decodeShare(text);
        setShareImportOpen(false);
        if (!decoded.ok) {
          controller2?.engine.reportError(decoded.error);
          return;
        }
        void importShared(decoded.preset, decoded.omitted);
      }
    }
  ));
}
		return module.exports;
	}
});
