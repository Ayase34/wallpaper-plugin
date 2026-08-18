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
var React8 = __toESM(require("react"), 1);

// src/core/demo-data.ts
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
  preset("default", "\u9ED8\u8BA4", {
    "--dsw-alias-bg-base": { light: "rgb(240, 248, 255)", dark: "rgb(6, 14, 30)" },
    "--dsw-alias-bg-layer-1": { light: "rgb(255, 255, 255)", dark: "rgb(12, 22, 42)" },
    "--dsw-alias-bg-layer-2": { light: "rgb(226, 241, 255)", dark: "rgb(18, 32, 58)" },
    "--dsw-specific-sidebar-fill": { light: "rgb(230, 243, 255)", dark: "rgb(4, 10, 24)" },
    "--dsw-specific-bubble": { light: "rgb(214, 235, 255)", dark: "rgb(14, 30, 56)" },
    "--dsw-specific-bubble-highlight": { light: "rgb(178, 216, 255)", dark: "rgb(24, 48, 88)" },
    "--dsw-specific-input-major": { light: "rgb(255, 255, 255)", dark: "rgb(10, 20, 40)" },
    "--dsw-alias-brand-primary": { light: "rgb(0, 105, 255)", dark: "rgb(96, 160, 255)" },
    "--dsw-alias-button-info-fill": { light: "rgb(0, 105, 255)", dark: "rgb(84, 150, 255)" },
    "--dsw-alias-state-business-primary": { light: "rgb(0, 105, 255)", dark: "rgb(84, 150, 255)" },
    "--dsw-specific-sidebar-nav-item-active": { light: "rgb(214, 232, 255)", dark: "rgb(18, 36, 70)" },
    "--dsw-specific-sidebar-nav-item-active-accent": { light: "rgb(0, 105, 255)", dark: "rgb(96, 160, 255)" },
    "--dsw-alias-label-primary": { light: "rgb(10, 32, 62)", dark: "rgb(232, 242, 255)" },
    "--dsw-alias-label-secondary": { light: "rgb(66, 98, 140)", dark: "rgb(164, 186, 216)" },
    "--dsw-alias-label-tertiary": { light: "rgb(86, 112, 150)", dark: "rgb(128, 152, 186)" }
  }, "\u6D77\u6D0B\u6E05\u723D")
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
function assetCssUrl(asset) {
  if (asset === void 0) return "";
  if (asset.dataUrl !== void 0 && asset.dataUrl !== "") {
    if (!/^data:image\/(png|jpe?g|webp|gif|bmp|avif);base64,[A-Za-z0-9+/=\s]+$/.test(asset.dataUrl)) return "";
    return `url("${asset.dataUrl}")`;
  }
  return `url("/ui-presets/assets/${asset.id}")`;
}
var WIDGETS = [
  {
    id: "chat-background",
    name: "\u804A\u5929\u80CC\u666F\u56FE",
    description: "\u4F1A\u8BDD\u533A\u80CC\u666F\u58C1\u7EB8",
    params: [
      { key: "assetId", label: "\u7D20\u6750", type: "asset" },
      { key: "opacity", label: "\u4E0D\u900F\u660E\u5EA6", type: "range", default: "1", min: 0, max: 1, step: 0.01 }
    ]
  },
  {
    id: "settings-background",
    name: "\u8BBE\u7F6E\u5361\u80CC\u666F\u56FE",
    description: "\u8BBE\u7F6E\u7A97\u53E3\u80CC\u666F\u58C1\u7EB8",
    params: [
      { key: "assetId", label: "\u7D20\u6750", type: "asset" },
      { key: "opacity", label: "\u4E0D\u900F\u660E\u5EA6", type: "range", default: "1", min: 0, max: 1, step: 0.01 }
    ]
  },
  {
    id: "sidebar-poster",
    name: "\u4FA7\u680F\u6D77\u62A5",
    description: "\u5DE6\u4FA7\u5BFC\u822A\u680F\u6D77\u62A5\u80CC\u666F",
    params: [
      { key: "assetId", label: "\u7D20\u6750", type: "asset" },
      { key: "opacity", label: "\u4E0D\u900F\u660E\u5EA6", type: "range", default: "1", min: 0, max: 1, step: 0.01 }
    ]
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
    const t = v.trim();
    return /^[+-]?(\d+(\.\d+)?|\.\d+)$/.test(t) ? t : "";
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
      const url = assetUrl("assetId");
      const urlDark = assetUrl("assetIdDark");
      const cropX = cropNumStr("cropX");
      const cropY = cropNumStr("cropY");
      const cropW = cropNumStr("cropW");
      const cropH = cropNumStr("cropH");
      const cropXD = cropNumStr("cropXDark");
      const cropYD = cropNumStr("cropYDark");
      const cropWD = cropNumStr("cropWDark");
      const cropHD = cropNumStr("cropHDark");
      const hasCrop = cropX !== "" && cropW !== "";
      const hasCropDark = cropXD !== "" && cropWD !== "";
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
  if (raw.tags !== void 0 && (!Array.isArray(raw.tags) || raw.tags.some((t) => typeof t !== "string"))) {
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
    const cssText = [cssRules !== void 0 ? cssRulesToText(cssRules) : "", widgetText].filter((t) => t !== "").join("\n");
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
      this.engine.reportError("\u6D3B\u52A8\u9884\u8BBE\u5DF2\u5E94\u7528\uFF0C\u4F46\u6301\u4E45\u5316\u5931\u8D25\uFF08\u91CD\u542F\u540E\u53EF\u80FD\u6062\u590D\u4E3A\u4E4B\u524D\u7684\u9884\u8BBE\uFF09");
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
        this.engine.reportError(`\u9884\u8BBE\u300C${id}\u300D\u5DF2\u635F\u574F\uFF1A${result.errors[0] ?? "\u6821\u9A8C\u5931\u8D25"}`);
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
   * @param options - activate：保存后提升为活动预设（默认 true）。
   * @returns 成功与否（失败信息在 lastError）。
   */
  async savePreset(preset2, options = {}) {
    const result = validatePreset(preset2);
    if (!result.ok) {
      this.engine.reportError(result.errors.join("\uFF1B"));
      return false;
    }
    const activate = options.activate !== false;
    try {
      const old = await this.loadPresetRaw(preset2.id);
      const backupBody = old !== null ? { ...old } : null;
      const body = { preset: result.preset, ...backupBody !== null ? { backup: backupBody } : {} };
      const res = await fetch(`/ui-presets/presets/${encodeURIComponent(preset2.id)}`, {
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
    if (state.hasDraft && state.draftPresetId !== result.preset.id) {
      const synced = this.engine.patchDraft(result.preset);
      if (!synced) {
        this.engine.reportError("\u4FDD\u5B58\u5DF2\u843D\u76D8\uFF0C\u4F46\u6D3B\u52A8\u9884\u8BBE\u672A\u540C\u6B65\uFF08\u53EF\u91CD\u542F\u540E\u6062\u590D\uFF09");
        return false;
      }
    }
    let promotionError = null;
    if (activate) {
      const ok = this.engine.saveDraftAsActive();
      if (!ok) {
        const applied = this.engine.applyPreset(result.preset);
        if (!applied) promotionError = this.engine.getState().lastError;
      }
      if (promotionError === null) {
        this.persistActiveId(preset2.id);
      }
    } else if (this.engine.getState().draftPresetId === preset2.id) {
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
        this.engine.reportError(`\u5BFC\u51FA ZIP \u5931\u8D25\uFF08HTTP ${res.status}\uFF09`);
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
      this.engine.reportError("\u5BFC\u51FA ZIP \u5931\u8D25\uFF08\u7F51\u7EDC\u9519\u8BEF\uFF09");
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
        this.engine.reportError(`\u9884\u8BBE\u300C${id}\u300D\u4E0D\u5B58\u5728\u6216\u65E0\u6CD5\u52A0\u8F7D`);
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
          mime: typeof body.mime === "string" ? body.mime : file.type
        };
      }
      const message = typeof body.error === "string" ? body.error : "\u4E0A\u4F20\u5931\u8D25";
      this.engine.reportError(message);
      return { ok: false, error: message };
    } catch {
      this.engine.reportError("\u7D20\u6750\u4E0A\u4F20\u5931\u8D25\uFF08\u7F51\u7EDC\u9519\u8BEF\uFF09");
      return { ok: false, error: "\u4E0A\u4F20\u5931\u8D25\uFF08\u7F51\u7EDC\u9519\u8BEF\uFF09" };
    }
  }
  /** M2-8 壁纸库：删除素材文件。
   * review P1-3（全量评审）：返回服务端清理信息——refCount 其他预设引用数（删除时
   * 库中预设的引用已被顺带清空，UI 可提示），cleanedPresets 被清理的预设数。 */
  async deleteAsset(id) {
    try {
      const res = await fetch(`/ui-presets/assets/${encodeURIComponent(id)}`, { method: "DELETE" });
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
      this.engine.reportError(`\u5207\u6362\u4E3B\u9898\u5931\u8D25\uFF1A${message}`);
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
    const fit = info.widgetId === "sidebar-poster" ? "contain" : "cover";
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
var React7 = __toESM(require("react"), 1);

// src/client/token-editor.tsx
var React6 = __toESM(require("react"), 1);

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

// src/core/catalog.ts
var catalog = {
  dshVersion: CATALOG_DSH_VERSION,
  entries: CATALOG
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
  "specific",
  "static",
  "font",
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
var React5 = __toESM(require("react"), 1);

// src/client/crop-dialog.tsx
var React = __toESM(require("react"), 1);
var FRAME_MAX_LONG = 1920;
function CropDialog(props) {
  const { request } = props;
  const frame = React.useMemo(() => cropFrameSize(request.ratio, FRAME_MAX_LONG), [request.ratio]);
  const ratioLabel = cropRatioLabel(request.ratio);
  const canvasRef = React.useRef(null);
  const rootRef = React.useRef(null);
  const [image, setImage] = React.useState(null);
  const [loadError, setLoadError] = React.useState(null);
  const [zoom, setZoom] = React.useState(1);
  const [pan, setPan] = React.useState({ x: 0, y: 0 });
  const dragRef = React.useRef(null);
  React.useEffect(() => {
    const img = new Image();
    img.onload = () => {
      setImage(img);
    };
    img.onerror = () => {
      setLoadError("\u56FE\u7247\u52A0\u8F7D\u5931\u8D25\uFF08\u7D20\u6750\u53EF\u80FD\u5DF2\u88AB\u5220\u9664\uFF09");
    };
    img.src = request.sourceUrl;
    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [request.sourceUrl]);
  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas === null || image === null) return;
    const ctx = canvas.getContext("2d");
    if (ctx === null) return;
    ctx.clearRect(0, 0, frame.w, frame.h);
    const rect = cropDrawRect(image.naturalWidth, image.naturalHeight, frame.w, frame.h, zoom, pan.x, pan.y);
    ctx.drawImage(image, rect.x, rect.y, rect.w, rect.h);
  }, [canvasRef, image, zoom, pan, frame]);
  React.useEffect(() => {
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
  return /* @__PURE__ */ React.createElement(
    "div",
    {
      ref: rootRef,
      "data-up-crop": true,
      role: "dialog",
      "aria-label": `\u56FE\u7247\u88C1\u526A\uFF1A${request.widgetName}\uFF08${ratioLabel}\uFF09`,
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
    /* @__PURE__ */ React.createElement(
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
      /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 14, fontWeight: 600 } }, "\u56FE\u7247\u88C1\u526A\uFF1A", request.widgetName), /* @__PURE__ */ React.createElement("span", { "data-up-crop-ratio": true, style: { fontSize: 12, color: "var(--dsw-alias-label-tertiary, #999)" } }, "\u56FA\u5B9A\u6BD4\u4F8B ", ratioLabel, "\uFF08", frame.w, "\xD7", frame.h, "\uFF09\xB7 \u9ED1\u6846\u5185\u5373\u5B9E\u9645\u5E94\u7528\u8303\u56F4\uFF1B\u672A\u8986\u76D6\u533A\u57DF\u900F\u660E")),
      loadError !== null ? /* @__PURE__ */ React.createElement("div", { "data-up-status": true, style: { fontSize: 12, color: "var(--dsw-alias-state-error-primary, #d94c4c)" } }, loadError) : /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "center", background: "#000", borderRadius: 8, padding: 14 } }, /* @__PURE__ */ React.createElement(
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
      image === null && loadError === null && /* @__PURE__ */ React.createElement("div", { "data-up-status": true, style: { fontSize: 12 } }, "\u52A0\u8F7D\u56FE\u7247\u4E2D\u2026"),
      image !== null && /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 10 } }, /* @__PURE__ */ React.createElement("button", { type: "button", "data-up-btn": true, "aria-label": "\u7F29\u5C0F", onClick: () => {
        setZoomPercent(zoomPercent - 10);
      }, style: { padding: "2px 10px" } }, "\u2212"), /* @__PURE__ */ React.createElement(
        "input",
        {
          type: "range",
          "aria-label": "\u7F29\u653E",
          min: CROP_ZOOM_MIN * 100,
          max: CROP_ZOOM_MAX * 100,
          step: 5,
          value: zoomPercent,
          onChange: (e) => {
            setZoomPercent(Number(e.target.value));
          },
          style: { flex: 1 }
        }
      ), /* @__PURE__ */ React.createElement("button", { type: "button", "data-up-btn": true, "aria-label": "\u653E\u5927", onClick: () => {
        setZoomPercent(zoomPercent + 10);
      }, style: { padding: "2px 10px" } }, "\uFF0B"), /* @__PURE__ */ React.createElement("span", { "data-up-crop-zoom": true, style: { fontSize: 12, minWidth: 52, textAlign: "right", fontVariantNumeric: "tabular-nums" } }, zoomPercent, "%")),
      /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "flex-end", gap: 8 } }, /* @__PURE__ */ React.createElement("button", { type: "button", "data-up-btn": true, onClick: props.onCancel }, "\u53D6\u6D88"), /* @__PURE__ */ React.createElement("button", { type: "button", "data-up-btn": true, "data-up-btn-primary": true, onClick: confirm, disabled: image === null }, "\u786E\u8BA4\u88C1\u526A"))
    )
  );
}

// src/client/confirm-dialog.tsx
var React2 = __toESM(require("react"), 1);
function ConfirmDialog(props) {
  const rootRef = React2.useRef(null);
  React2.useEffect(() => {
    rootRef.current?.focus();
  }, []);
  return /* @__PURE__ */ React2.createElement(
    "div",
    {
      ref: rootRef,
      "data-up-confirm": true,
      role: "dialog",
      "aria-label": "\u786E\u8BA4",
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
    /* @__PURE__ */ React2.createElement(
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
      /* @__PURE__ */ React2.createElement("span", { style: { fontSize: 13, lineHeight: 1.6, whiteSpace: "pre-wrap" } }, props.message),
      /* @__PURE__ */ React2.createElement("div", { style: { display: "flex", justifyContent: "flex-end", gap: 8 } }, /* @__PURE__ */ React2.createElement("button", { type: "button", "data-up-btn": true, onClick: props.onCancel }, "\u53D6\u6D88"), /* @__PURE__ */ React2.createElement("button", { type: "button", "data-up-btn": true, "data-up-btn-primary": true, onClick: props.onConfirm }, props.confirmLabel ?? "\u786E\u5B9A"))
    )
  );
}

// src/client/layer-composer.tsx
var React4 = __toESM(require("react"), 1);

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
var React3 = __toESM(require("react"), 1);
function AssetThumb(props) {
  const canvasRef = React3.useRef(null);
  React3.useEffect(() => {
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
  return /* @__PURE__ */ React3.createElement(
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
  { key: "chat-background", label: "16:9\uFF08\u804A\u5929\u80CC\u666F\uFF09" },
  { key: "settings-background", label: "1:1\uFF08\u8BBE\u7F6E\u5361\uFF09" },
  { key: "sidebar-poster", label: "1:5\uFF08\u4FA7\u680F\u6D77\u62A5\uFF09" }
];
function LayerComposerDialog(props) {
  const controller2 = getController();
  const [ratioKey, setRatioKey] = React4.useState("chat-background");
  const [layers, setLayers] = React4.useState([]);
  const [selected, setSelected] = React4.useState(-1);
  const [status, setStatus] = React4.useState("");
  const [composing, setComposing] = React4.useState(false);
  const [undoStack, setUndoStack] = React4.useState([]);
  const canvasRef = React4.useRef(null);
  const imgCache = React4.useRef(/* @__PURE__ */ new Map());
  const dragRef = React4.useRef(null);
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
    const cached = imgCache.current.get(id);
    if (cached !== void 0) return Promise.resolve(cached);
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
  React4.useEffect(() => {
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
    if (blob === null) throw new Error("\u5E95\u56FE\u7F16\u7801\u5931\u8D25");
    const file = new File([blob], `\u5408\u6210\u58C1\u7EB8-${Date.now()}.${mime === "image/png" ? "png" : "jpg"}`, { type: mime });
    const result = await controller2?.uploadAsset(file, void 0, {
      animAssetId: anim.assetId,
      x: anim.x,
      y: anim.y,
      w: anim.w,
      h: anim.h
    });
    if (result?.ok === true && result.id !== void 0) {
      setStatus(`\u5DF2\u751F\u6210\u5206\u5C42\u5408\u6210\u58C1\u7EB8\u300C${result.name ?? "\u5408\u6210\u58C1\u7EB8"}\u300D\uFF08\u9759\u6001\u5E95 + \u539F\u751F\u52A8\u56FE\uFF09`);
      props.onComposed({ id: result.id, name: result.name ?? "\u5408\u6210\u58C1\u7EB8.png", mime });
    } else {
      setStatus(result?.error ?? "\u5408\u6210\u4E0A\u4F20\u5931\u8D25");
    }
  };
  const compose = (forceBake) => {
    if (layers.length === 0) {
      setStatus("\u8BF7\u5148\u6DFB\u52A0\u81F3\u5C11\u4E00\u4E2A\u56FE\u5C42");
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
            setStatus(`\u5DF2\u751F\u6210\u5408\u6210\u58C1\u7EB8\u300C${result2.name ?? "\u5408\u6210\u58C1\u7EB8"}\u300D`);
            props.onComposed({ id: result2.id, name: result2.name ?? "\u5408\u6210\u58C1\u7EB8.png", mime: "image/png" });
          } else {
            setStatus(result2?.error ?? "\u5408\u6210\u4E0A\u4F20\u5931\u8D25");
          }
          return;
        }
        const gifCache = /* @__PURE__ */ new Map();
        for (const id of gifLayerIds) {
          const res = await fetch(`/ui-presets/assets/${encodeURIComponent(id)}`);
          if (!res.ok) throw new Error("GIF \u7D20\u6750\u8BFB\u53D6\u5931\u8D25");
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
            let t = timeCs % layerTotal;
            let fi = 0;
            for (let i = 0; i < dec.frames.length; i++) {
              if (t < dec.frames[i].delayCs) {
                fi = i;
                break;
              }
              t -= dec.frames[i].delayCs;
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
        const rawTimes = [...boundaries].filter((t) => t <= totalCs).sort((a, b) => a - b);
        const times = [];
        let last = 0;
        for (const t of rawTimes) {
          if (t - last >= MIN_SEGMENT_CS) {
            times.push(t);
            last = t;
          }
        }
        if (times.length > 150) throw new Error("\u52A8\u56FE\u5E27\u6570\u8FC7\u591A\uFF08>150\uFF09\u2014\u2014\u8BF7\u4F7F\u7528\u5E27\u7387\u8F83\u4F4E\u6216\u65F6\u957F\u8F83\u77ED\u7684\u52A8\u56FE");
        const baseScale = Math.min(1, 1280 / Math.max(frame.w, frame.h));
        const minScale = Math.min(baseScale, 640 / Math.max(frame.w, frame.h));
        const MAX_OUTPUT_GIF_BYTES = 8 * 1024 * 1024;
        if (times.length === 0) throw new Error("\u65F6\u95F4\u8F74\u4E3A\u7A7A");
        setStatus(`\u5408\u6210\u4E2D\uFF08\u52A8\u753B ${times.length} \u5E27\uFF09\u2026`);
        const renderFrames = (scale3) => {
          const oc = document.createElement("canvas");
          oc.width = Math.max(1, Math.round(frame.w * scale3));
          oc.height = Math.max(1, Math.round(frame.h * scale3));
          const octx = oc.getContext("2d");
          if (octx === null) throw new Error("canvas \u4E0D\u53EF\u7528");
          let prev = 0;
          const frames = [];
          for (const t of times) {
            ctx.clearRect(0, 0, frame.w, frame.h);
            layers.forEach((layer, index) => drawLayer(layer, index, prev));
            octx.clearRect(0, 0, oc.width, oc.height);
            octx.drawImage(canvas, 0, 0, oc.width, oc.height);
            frames.push({ pixels: new Uint8ClampedArray(octx.getImageData(0, 0, oc.width, oc.height).data), delayCs: t - prev });
            prev = t;
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
        if (gifBytes === null) throw new Error("\u7F16\u7801\u5931\u8D25");
        const sizeMb = (gifBytes.length / 1048576).toFixed(1);
        const downscaled = scale2 < baseScale - 1e-6 ? ` \xB7 \u5DF2\u81EA\u52A8\u964D\u91C7\u6837\u81F3 ${finalW}\xD7${finalH} \u63A7\u5236\u4F53\u79EF` : "";
        const file = new File([gifBytes], `\u5408\u6210\u58C1\u7EB8-${Date.now()}.gif`, { type: "image/gif" });
        const result = await controller2?.uploadAsset(file);
        if (result?.ok === true && result.id !== void 0) {
          setStatus(`\u5DF2\u751F\u6210\u5408\u6210\u58C1\u7EB8\u300C${result.name ?? "\u5408\u6210\u58C1\u7EB8"}\u300D\uFF08\u52A8\u753B ${times.length} \u5E27 \xB7 ${sizeMb}MB${downscaled}\uFF09`);
          props.onComposed({ id: result.id, name: result.name ?? "\u5408\u6210\u58C1\u7EB8.gif", mime: "image/gif" });
        } else {
          setStatus(result?.error ?? "\u5408\u6210\u4E0A\u4F20\u5931\u8D25");
        }
      } catch (error) {
        setStatus(`\u5408\u6210\u5931\u8D25\uFF1A${error instanceof Error ? error.message : String(error)}`);
      } finally {
        setComposing(false);
      }
    })();
  };
  return /* @__PURE__ */ React4.createElement(
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
    /* @__PURE__ */ React4.createElement(
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
      /* @__PURE__ */ React4.createElement("div", { style: { display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" } }, /* @__PURE__ */ React4.createElement("span", { style: { fontSize: 14, fontWeight: 600 } }, "\u56FE\u5C42\u5408\u6210\u58C1\u7EB8"), /* @__PURE__ */ React4.createElement(
        "select",
        {
          "aria-label": "\u5408\u6210\u6BD4\u4F8B",
          value: ratioKey,
          onChange: (e) => {
            setRatioKey(e.target.value);
            setLayers([]);
            setSelected(-1);
            setUndoStack([]);
          },
          style: { fontSize: 12, padding: "2px 6px" }
        },
        RATIO_OPTIONS.map((opt) => /* @__PURE__ */ React4.createElement("option", { key: opt.key, value: opt.key }, opt.label))
      ), /* @__PURE__ */ React4.createElement("span", { "data-up-status": true, style: { fontSize: 11 } }, status !== "" ? status : `\u753B\u5E03 ${frame.w}\xD7${frame.h} \xB7 \u56FE\u5C42 ${layers.length}`), /* @__PURE__ */ React4.createElement("button", { type: "button", "data-up-btn": true, onClick: undo, disabled: undoStack.length === 0, style: { marginLeft: "auto" } }, "\u64A4\u9500"), /* @__PURE__ */ React4.createElement("button", { type: "button", "data-up-btn": true, onClick: props.onClose }, "\u5173\u95ED")),
      /* @__PURE__ */ React4.createElement("div", { style: { display: "flex", gap: 12 } }, /* @__PURE__ */ React4.createElement(
        "canvas",
        {
          ref: canvasRef,
          "data-up-layer-canvas": true,
          width: viewW,
          height: viewH,
          "aria-label": "\u56FE\u5C42\u5408\u6210\u753B\u5E03",
          onPointerDown,
          onPointerMove,
          onPointerUp,
          onWheel,
          style: { width: viewW, height: viewH, border: "1px solid var(--dsw-alias-border-l2)", borderRadius: 8, touchAction: "none", cursor: "grab", flex: "none" }
        }
      ), /* @__PURE__ */ React4.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 8, minWidth: 200 } }, /* @__PURE__ */ React4.createElement("span", { style: { fontSize: 11, fontWeight: 600 } }, "\u7D20\u6750\uFF08\u70B9\u51FB\u52A0\u5165\u753B\u5E03\uFF09"), /* @__PURE__ */ React4.createElement("div", { "data-up-layer-palette": true, style: { display: "flex", flexWrap: "wrap", gap: 6, maxHeight: 150, overflow: "auto" } }, props.assets.map((asset) => /* @__PURE__ */ React4.createElement(
        AssetThumb,
        {
          key: asset.id,
          assetId: asset.id,
          size: 44,
          title: asset.name,
          dataAttrs: { "data-up-layer-piece": asset.id },
          onClick: () => addLayer(asset.id)
        }
      ))), props.assets.length === 0 && /* @__PURE__ */ React4.createElement("span", { "data-up-status": true, style: { fontSize: 10 } }, "\u5E93\u4E2D\u6682\u65E0\u7D20\u6750\u2014\u2014\u5148\u5728\u7D20\u6750\u4E0E\u90E8\u4EF6\u533A\u4E0A\u4F20\u5C0F\u5757\u56FE\u7247"), selected >= 0 && /* @__PURE__ */ React4.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 6, borderTop: "1px solid var(--dsw-alias-border-l2)", paddingTop: 6 } }, /* @__PURE__ */ React4.createElement("label", { style: { fontSize: 11 } }, "\u65CB\u8F6C ", Math.round(layers[selected].rotation * 180 / Math.PI), "\xB0", /* @__PURE__ */ React4.createElement(
        "input",
        {
          type: "range",
          min: -180,
          max: 180,
          step: 1,
          "aria-label": "\u56FE\u5C42\u65CB\u8F6C",
          value: Math.round(layers[selected].rotation * 180 / Math.PI),
          onChange: (e) => updateLayers(layers.map((l, i) => i === selected ? { ...l, rotation: Number(e.target.value) * Math.PI / 180 } : l)),
          style: { width: "100%", display: "block" }
        }
      )), /* @__PURE__ */ React4.createElement("label", { style: { fontSize: 11 } }, "\u4E0D\u900F\u660E\u5EA6 ", Math.round(layers[selected].opacity * 100), "%", /* @__PURE__ */ React4.createElement(
        "input",
        {
          type: "range",
          min: 0,
          max: 100,
          step: 1,
          "aria-label": "\u56FE\u5C42\u4E0D\u900F\u660E\u5EA6",
          value: Math.round(layers[selected].opacity * 100),
          onChange: (e) => updateLayers(layers.map((l, i) => i === selected ? { ...l, opacity: Number(e.target.value) / 100 } : l)),
          style: { width: "100%", display: "block" }
        }
      )), /* @__PURE__ */ React4.createElement("div", { style: { display: "flex", gap: 6, flexWrap: "wrap" } }, /* @__PURE__ */ React4.createElement("button", { type: "button", "data-up-btn": true, "aria-label": "\u56FE\u5C42\u4E0A\u79FB", onClick: () => {
        if (selected < 0 || selected >= layers.length - 1) return;
        const next = [...layers];
        const [item] = next.splice(selected, 1);
        next.splice(selected + 1, 0, item);
        updateLayers(next);
        setSelected(selected + 1);
      }, style: { padding: "2px 8px", fontSize: 11 } }, "\u4E0A\u79FB"), /* @__PURE__ */ React4.createElement("button", { type: "button", "data-up-btn": true, "aria-label": "\u56FE\u5C42\u4E0B\u79FB", onClick: () => {
        if (selected <= 0) return;
        const next = [...layers];
        const [item] = next.splice(selected, 1);
        next.splice(selected - 1, 0, item);
        updateLayers(next);
        setSelected(selected - 1);
      }, style: { padding: "2px 8px", fontSize: 11 } }, "\u4E0B\u79FB"), /* @__PURE__ */ React4.createElement("button", { type: "button", "data-up-btn": true, "aria-label": "\u56FE\u5C42\u7F6E\u9876", onClick: () => {
        if (selected < 0) return;
        const next = [...layers];
        const [item] = next.splice(selected, 1);
        next.push(item);
        updateLayers(next);
        setSelected(next.length - 1);
      }, style: { padding: "2px 8px", fontSize: 11 } }, "\u7F6E\u9876"), /* @__PURE__ */ React4.createElement("button", { type: "button", "data-up-btn": true, "aria-label": "\u56FE\u5C42\u7F6E\u5E95", onClick: () => {
        if (selected < 0) return;
        const next = [...layers];
        const [item] = next.splice(selected, 1);
        next.unshift(item);
        updateLayers(next);
        setSelected(0);
      }, style: { padding: "2px 8px", fontSize: 11 } }, "\u7F6E\u5E95"), /* @__PURE__ */ React4.createElement(
        "button",
        {
          type: "button",
          "data-up-btn": true,
          "aria-label": "\u6C34\u5E73\u955C\u50CF",
          onClick: () => updateLayers(layers.map((l, i) => i === selected ? { ...l, flipH: !l.flipH } : l)),
          style: { padding: "2px 8px", fontSize: 11, ...selected >= 0 && layers[selected]?.flipH ? { background: "var(--dsw-alias-button-info-fill)", color: "#fff", borderColor: "transparent" } : {} }
        },
        "\u6C34\u5E73\u955C\u50CF"
      ), /* @__PURE__ */ React4.createElement(
        "button",
        {
          type: "button",
          "data-up-btn": true,
          "aria-label": "\u5782\u76F4\u955C\u50CF",
          onClick: () => updateLayers(layers.map((l, i) => i === selected ? { ...l, flipV: !l.flipV } : l)),
          style: { padding: "2px 8px", fontSize: 11, ...selected >= 0 && layers[selected]?.flipV ? { background: "var(--dsw-alias-button-info-fill)", color: "#fff", borderColor: "transparent" } : {} }
        },
        "\u5782\u76F4\u955C\u50CF"
      ), /* @__PURE__ */ React4.createElement("button", { type: "button", "data-up-btn": true, "aria-label": "\u5220\u9664\u56FE\u5C42", onClick: () => {
        if (selected < 0) return;
        updateLayers(layers.filter((_, i) => i !== selected));
        setSelected(-1);
      }, style: { padding: "2px 8px", fontSize: 11 } }, "\u5220\u9664"))))),
      /* @__PURE__ */ React4.createElement("div", { style: { display: "flex", justifyContent: "flex-end", gap: 8, alignItems: "center" } }, /* @__PURE__ */ React4.createElement("span", { "data-up-status": true, style: { fontSize: 10 } }, "\u900F\u660E\u5E95\u2014\u2014\u6E32\u67D3\u65F6\u6309\u90E8\u4EF6\u4E0D\u900F\u660E\u5EA6\u5411\u5E95\u8272\u6DE1\u51FA"), composeMode(layers, (id) => (props.assets.find((a) => a.id === id)?.mime ?? "") === "image/gif").kind === "layered" && !composing && /* @__PURE__ */ React4.createElement(
        "button",
        {
          type: "button",
          "data-up-btn": true,
          "data-up-layer-bake": true,
          onClick: () => {
            void compose(true);
          },
          style: { padding: "4px 10px", fontSize: 11 },
          title: "\u628A\u5168\u90E8\u56FE\u5C42\uFF08\u542B\u7167\u7247\uFF09\u70E4\u8FDB GIF \u6BCF\u5E27\u2014\u2014\u4F53\u79EF\u5927\uFF0C\u4EC5\u591A\u52A8\u56FE\u540C\u6B65/\u65CB\u8F6C/\u5355\u6587\u4EF6\u5BFC\u51FA\u9700\u8981"
        },
        "\u70D8\u7119\u4E3A\u5355\u6587\u4EF6\u52A8\u753B"
      ), /* @__PURE__ */ React4.createElement(
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
        composing ? "\u5408\u6210\u4E2D\u2026" : "\u5408\u6210\u5E76\u4E0A\u4F20"
      ))
    )
  );
}

// src/client/widget-editor.tsx
function WidgetEditor(props) {
  const fileInputRef = React5.useRef(null);
  const controller2 = getController();
  const [cropRequest, setCropRequest] = React5.useState(null);
  const [schemeModeOn, setSchemeModeOn] = React5.useState(false);
  const [composerOpen, setComposerOpen] = React5.useState(false);
  const assetsRef = React5.useRef(props.assets);
  assetsRef.current = props.assets;
  const addAsset = async (file) => {
    if (file === void 0) return;
    if (!file.type.startsWith("image/")) {
      window.alert("\u53EA\u652F\u6301\u56FE\u7247\u7D20\u6750\uFF08image/*\uFF09");
      return;
    }
    if (file.size > MAX_ASSET_FILE_SIZE) {
      window.alert("\u7D20\u6750\u8D85\u8FC7\u4E0A\u9650\uFF08\u226420MB\uFF09");
      return;
    }
    if (assetsRef.current.length >= MAX_ASSETS) {
      window.alert(`\u7D20\u6750\u6570\u91CF\u5DF2\u8FBE\u4E0A\u9650 ${MAX_ASSETS} \u4E2A`);
      return;
    }
    const result = await controller2?.uploadAsset(file);
    if (result?.ok === true && result.id !== void 0) {
      props.onAssetsChange([...assetsRef.current, { id: result.id, name: result.name ?? file.name, mime: result.mime ?? file.type }]);
    } else {
      window.alert(result?.error ?? "\u4E0A\u4F20\u5931\u8D25");
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
    void controller2?.deleteAsset(id).then((result) => {
      if (result?.ok === false) {
        window.alert(result.error ?? "\u5220\u9664\u7D20\u6750\u5931\u8D25");
        return;
      }
      if ((result?.refCount ?? 0) > 0) {
        window.alert(`\u7D20\u6750\u5DF2\u5220\u9664\uFF1B\u5E93\u4E2D ${result.refCount} \u4E2A\u9884\u8BBE\u5F15\u7528\u8BE5\u7D20\u6750\uFF0C\u76F8\u5173\u90E8\u4EF6\u5DF2\u81EA\u52A8\u6E05\u7A7A\u3002`);
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
  const renderParam = (def, param) => {
    const entry = widgetEntry(def.id);
    const value = entry?.params[param.key] ?? param.default ?? "";
    if (param.type === "asset") {
      return /* @__PURE__ */ React5.createElement("label", { key: param.key, style: { display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "var(--dsw-alias-label-tertiary, #999)" } }, param.label, /* @__PURE__ */ React5.createElement(
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
        /* @__PURE__ */ React5.createElement("option", { value: "" }, "\u672A\u9009\u62E9"),
        props.assets.map((asset) => /* @__PURE__ */ React5.createElement("option", { key: asset.id, value: asset.id }, asset.name))
      ));
    }
    if (param.type === "select") {
      return /* @__PURE__ */ React5.createElement("label", { key: param.key, style: { display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "var(--dsw-alias-label-tertiary, #999)" } }, param.label, /* @__PURE__ */ React5.createElement(
        "select",
        {
          "aria-label": `${def.id} ${param.key}`,
          value,
          onChange: (e) => {
            setWidgetParam(def.id, param.key, e.target.value);
          },
          style: { fontSize: 11, padding: "2px 4px", borderRadius: 5, border: "1px solid var(--dsw-alias-border-l2)", background: "var(--dsw-alias-bg-layer-2)", color: "var(--dsw-alias-label-primary)" }
        },
        param.options?.map((option) => /* @__PURE__ */ React5.createElement("option", { key: option.value, value: option.value }, option.label))
      ));
    }
    if (param.type === "range") {
      return /* @__PURE__ */ React5.createElement("label", { key: param.key, style: { display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "var(--dsw-alias-label-tertiary, #999)" } }, param.label, /* @__PURE__ */ React5.createElement(
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
      ), /* @__PURE__ */ React5.createElement("span", { style: { minWidth: 34, textAlign: "right", fontVariantNumeric: "tabular-nums", color: "var(--dsw-alias-label-primary)" } }, Math.round((Number(value) || 0) * 100), "%"));
    }
    return /* @__PURE__ */ React5.createElement("label", { key: param.key, style: { display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "var(--dsw-alias-label-tertiary, #999)" } }, param.label, /* @__PURE__ */ React5.createElement(
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
    const darkAssetId = entry?.params.assetIdDark ?? "";
    const darkOpacity = entry?.params.opacityDark ?? "1";
    return /* @__PURE__ */ React5.createElement("div", { "data-up-widget-dark": true, style: { paddingLeft: 10, marginTop: 4, borderLeft: "2px dashed var(--dsw-alias-border-l2)", display: "flex", flexDirection: "column", gap: 4 } }, /* @__PURE__ */ React5.createElement("span", { style: { fontSize: 11, fontWeight: 600, color: "var(--dsw-alias-label-secondary)" } }, "\u6DF1\u8272\u98CE\u683C"), /* @__PURE__ */ React5.createElement("div", { style: { display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" } }, /* @__PURE__ */ React5.createElement("label", { style: { display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "var(--dsw-alias-label-tertiary, #999)" } }, "\u7D20\u6750", /* @__PURE__ */ React5.createElement(
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
      /* @__PURE__ */ React5.createElement("option", { value: "" }, "\u672A\u9009\u62E9"),
      props.assets.map((asset) => /* @__PURE__ */ React5.createElement("option", { key: asset.id, value: asset.id }, asset.name))
    )), /* @__PURE__ */ React5.createElement("label", { style: { display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "var(--dsw-alias-label-tertiary, #999)" } }, "\u4E0D\u900F\u660E\u5EA6", /* @__PURE__ */ React5.createElement(
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
    ), /* @__PURE__ */ React5.createElement("span", { style: { minWidth: 34, textAlign: "right", fontVariantNumeric: "tabular-nums", color: "var(--dsw-alias-label-primary)" } }, Math.round((Number(darkOpacity) || 0) * 100), "%"))));
  };
  const schemeMode = props.widgets.some((w) => Object.keys(w.params).some((k) => k.endsWith("Dark")));
  const schemeChecked = schemeModeOn || schemeMode;
  const [confirmBox, setConfirmBox] = React5.useState(null);
  const toggleSchemeMode = (checked) => {
    if (!checked && schemeMode) {
      setConfirmBox({
        message: "\u5173\u95ED\u540E\u5C06\u6E05\u9664\u5DF2\u8BBE\u7F6E\u7684\u6DF1\u8272\u58C1\u7EB8\u914D\u7F6E\uFF0C\u786E\u5B9A\uFF1F",
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
  return /* @__PURE__ */ React5.createElement("div", { "data-up-widget-editor": true, style: { display: "flex", flexDirection: "column", gap: 8 } }, /* @__PURE__ */ React5.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" } }, /* @__PURE__ */ React5.createElement("span", { style: { fontSize: 12, fontWeight: 600, color: "var(--dsw-alias-label-secondary)" } }, "\u7D20\u6750\u4E0E\u90E8\u4EF6"), /* @__PURE__ */ React5.createElement(
    "button",
    {
      type: "button",
      "data-up-btn": true,
      onClick: () => {
        fileInputRef.current?.click();
      },
      style: { padding: "3px 10px", fontSize: 11 }
    },
    "\u6DFB\u52A0\u7D20\u6750"
  ), /* @__PURE__ */ React5.createElement(
    "button",
    {
      type: "button",
      "data-up-btn": true,
      "data-up-layer-open": true,
      onClick: () => {
        setComposerOpen(true);
      },
      style: { padding: "3px 10px", fontSize: 11 },
      title: "\u591A\u5F20\u5C0F\u5757\u56FE\u7247\u53E0\u52A0\u5408\u6210\u4E00\u5F20\u58C1\u7EB8"
    },
    "\u56FE\u5C42\u5408\u6210\u58C1\u7EB8"
  ), /* @__PURE__ */ React5.createElement(
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
  ), /* @__PURE__ */ React5.createElement("span", { "data-up-status": true, style: { fontSize: 10 } }, props.assets.length, "/", MAX_ASSETS, " \u4E2A\u7D20\u6750"), /* @__PURE__ */ React5.createElement("label", { style: { display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "var(--dsw-alias-label-secondary)", cursor: "pointer", userSelect: "none", marginLeft: "auto" } }, /* @__PURE__ */ React5.createElement(
    "input",
    {
      type: "checkbox",
      "aria-label": "\u6309\u660E\u6697\u5206\u522B\u914D\u7F6E\u58C1\u7EB8",
      "data-up-scheme-toggle": true,
      checked: schemeChecked,
      onChange: (e) => {
        toggleSchemeMode(e.target.checked);
      }
    }
  ), /* @__PURE__ */ React5.createElement("span", null, "\u6309\u660E\u6697\u5206\u522B\u914D\u7F6E\u58C1\u7EB8\uFF08\u6D45\u8272/\u6DF1\u8272\uFF09"))), props.assets.length > 0 && /* @__PURE__ */ React5.createElement("div", { style: { display: "flex", flexWrap: "wrap", gap: 6 } }, props.assets.map((asset) => {
    const chatEntry = widgetEntry("chat-background");
    const chatUses = chatEntry?.params.assetId === asset.id;
    return /* @__PURE__ */ React5.createElement(
      "span",
      {
        key: asset.id,
        "data-up-asset": true,
        style: { display: "flex", alignItems: "center", gap: 4, padding: "2px 8px", border: "1px solid var(--dsw-alias-border-l2)", borderRadius: 12, fontSize: 11, color: "var(--dsw-alias-label-secondary)" }
      },
      /* @__PURE__ */ React5.createElement(AssetThumb, { assetId: asset.id, size: 22, dataAttrs: { "data-up-asset-thumb": "" } }),
      asset.name,
      /* @__PURE__ */ React5.createElement(
        "button",
        {
          type: "button",
          "data-up-btn": true,
          "data-up-asset-quick": true,
          "aria-label": `\u7528 ${asset.name} \u4F5C\u804A\u5929\u80CC\u666F`,
          onClick: () => {
            quickApplyAsChatBackground(asset.id);
          },
          style: { padding: "0 6px", fontSize: 10, ...chatUses ? { background: "var(--dsw-alias-button-info-fill)", color: "#fff", borderColor: "transparent" } : {} },
          title: chatUses ? "\u5F53\u524D\u804A\u5929\u80CC\u666F" : "\u4E00\u952E\u8BBE\u4E3A\u804A\u5929\u80CC\u666F"
        },
        chatUses ? "\u2713 \u804A\u5929\u80CC\u666F" : "\u8BBE\u4E3A\u804A\u5929\u80CC\u666F"
      ),
      /* @__PURE__ */ React5.createElement("button", { type: "button", "data-up-btn": true, "aria-label": `\u5220\u9664\u7D20\u6750 ${asset.name}`, onClick: () => {
        removeAsset(asset.id);
      }, style: { padding: "0 4px", fontSize: 10 } }, "\u2715")
    );
  })), props.assets.length > 0 && !props.widgets.some((w) => Object.values(w.params).some((v) => v !== "")) && /* @__PURE__ */ React5.createElement("div", { "data-up-status": true, style: { fontSize: 10, color: "var(--dsw-alias-state-warn-primary, #b7791f)" } }, "\u7D20\u6750\u5DF2\u4E0A\u4F20\u4F46\u5C1A\u672A\u751F\u6548\u2014\u2014\u70B9\u51FB\u7D20\u6750\u4E0A\u7684\u300C\u8BBE\u4E3A\u804A\u5929\u80CC\u666F\u300D\u4E00\u952E\u542F\u7528\uFF0C\u6216\u5728\u4E0B\u65B9\u9762\u677F\u52FE\u9009\u90E8\u4EF6\u5E76\u9009\u62E9\u7D20\u6750\u3002"), /* @__PURE__ */ React5.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 6 } }, WIDGETS.map((def) => {
    const enabled = widgetEntry(def.id) !== void 0;
    return /* @__PURE__ */ React5.createElement("div", { key: def.id, "data-up-widget": true, style: { display: "flex", flexDirection: "column", gap: 4, padding: 6, border: "1px solid var(--dsw-alias-border-l2)", borderRadius: 8, background: "var(--dsw-alias-bg-layer-1)" } }, /* @__PURE__ */ React5.createElement("label", { style: { display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "var(--dsw-alias-label-primary)", cursor: "pointer", userSelect: "none" } }, /* @__PURE__ */ React5.createElement(
      "input",
      {
        type: "checkbox",
        "aria-label": `\u542F\u7528\u90E8\u4EF6 ${def.name}`,
        checked: enabled,
        onChange: (e) => {
          setWidgetEnabled(def.id, e.target.checked);
        }
      }
    ), /* @__PURE__ */ React5.createElement("span", { style: { fontWeight: 600 } }, def.name), /* @__PURE__ */ React5.createElement("span", { style: { fontWeight: 400, color: "var(--dsw-alias-label-tertiary, #999)" } }, "\xB7 ", def.description)), enabled && /* @__PURE__ */ React5.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 4 } }, schemeChecked && /* @__PURE__ */ React5.createElement("span", { style: { fontSize: 11, fontWeight: 600, color: "var(--dsw-alias-label-secondary)", paddingLeft: 22 } }, "\u6D45\u8272\u98CE\u683C"), /* @__PURE__ */ React5.createElement("div", { style: { display: "flex", gap: 10, flexWrap: "wrap", paddingLeft: 22 } }, def.params.map((param) => renderParam(def, param))), schemeChecked && renderDarkSection(def)));
  })), /* @__PURE__ */ React5.createElement("div", { "data-up-status": true, style: { fontSize: 10 } }, "\u90E8\u4EF6 CSS \u7531\u5F15\u64CE\u751F\u6210\uFF08\u5B89\u5168\u8FB9\u754C\uFF09\uFF1B\u7D20\u6750\u5B58\u4E8E\u58C1\u7EB8\u5E93\uFF08.ui-presets/assets\uFF0C\u226420MB/\u4E2A\uFF09\uFF0C\u9884\u8BBE\u4EC5\u5B58\u5F15\u7528\u2014\u2014zip \u5BFC\u51FA\u81EA\u52A8\u5185\u5D4C\u7D20\u6750\u3002\u9009\u7D20\u6750\u7ED9\u90E8\u4EF6\u65F6\u6309\u56FA\u5B9A\u6BD4\u4F8B\u88C1\u526A\uFF08\u672A\u8986\u76D6\u533A\u57DF\u900F\u660E\u586B\u5145\uFF09\u3002"), cropRequest !== null && /* @__PURE__ */ React5.createElement(
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
  ), composerOpen && /* @__PURE__ */ React5.createElement(
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
  ), confirmBox !== null && /* @__PURE__ */ React5.createElement(
    ConfirmDialog,
    {
      message: confirmBox.message,
      confirmLabel: "\u6E05\u9664",
      onConfirm: () => {
        const action = confirmBox.action;
        setConfirmBox(null);
        action();
      },
      onCancel: () => {
        setConfirmBox(null);
      }
    }
  ));
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
  const entry = findToken(props.name);
  const lightIsColor = isResolvableColor(props.value.light);
  const darkIsColor = isResolvableColor(props.value.dark);
  const lightColor = lightIsColor ? resolveTokenValue(props.value.light) : "";
  const darkColor = darkIsColor ? resolveTokenValue(props.value.dark) : "";
  const [notes, setNotes] = React6.useState(() => loadTokenNotes());
  const userNote = notes[props.name];
  const description = userNote ?? TOKEN_DESCRIPTIONS[props.name];
  const [editing, setEditing] = React6.useState(false);
  const [draft, setDraft] = React6.useState("");
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
  return /* @__PURE__ */ React6.createElement("div", { "data-up-token-row": true, style: { display: "flex", alignItems: "center", gap: 8, padding: "5px 0" } }, props.groupChecked !== void 0 && /* @__PURE__ */ React6.createElement(
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
  ), /* @__PURE__ */ React6.createElement("div", { style: { flex: 1, minWidth: 0 } }, /* @__PURE__ */ React6.createElement("div", { style: { display: "flex", alignItems: "center", gap: 6 } }, /* @__PURE__ */ React6.createElement("code", { style: { fontSize: 11, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "var(--dsw-alias-label-secondary)" } }, props.name, props.safety === "caution" ? " \u26A0" : props.safety === "expert" ? " \u{1F512}" : ""), /* @__PURE__ */ React6.createElement(
    "button",
    {
      type: "button",
      "data-up-note-btn": true,
      onClick: startEdit,
      title: description ?? "\u6DFB\u52A0\u4E2D\u6587\u63CF\u8FF0",
      style: { fontSize: 10, padding: "0 4px", border: "none", background: "transparent", color: "var(--dsw-alias-label-tertiary, #999)", cursor: "pointer" }
    },
    description !== void 0 ? "\u{1F4DD}" : "\uFF0B\u63CF\u8FF0"
  )), editing ? /* @__PURE__ */ React6.createElement("div", { style: { display: "flex", gap: 4, alignItems: "center", paddingTop: 2 } }, /* @__PURE__ */ React6.createElement(
    "input",
    {
      type: "text",
      "data-up-note-input": true,
      "aria-label": `\u63CF\u8FF0\uFF1A${props.name}`,
      value: draft,
      placeholder: "\u8F93\u5165\u4E2D\u6587\u63CF\u8FF0\uFF08\u5E2E\u52A9\u81EA\u5DF1\u8BC6\u522B\uFF09\u2026",
      maxLength: 80,
      onChange: (e) => {
        setDraft(e.target.value);
      },
      onKeyDown: (e) => {
        if (e.key === "Enter") commitNote();
      },
      style: { flex: 1, fontSize: 10, padding: "2px 6px", border: "1px solid var(--dsw-alias-border-l2)", borderRadius: 5, background: "var(--dsw-alias-bg-layer-1)", color: "var(--dsw-alias-label-primary)" }
    }
  ), /* @__PURE__ */ React6.createElement("button", { type: "button", "data-up-btn": true, onClick: commitNote, style: { padding: "1px 8px", fontSize: 10 } }, "\u5B58")) : description !== void 0 && /* @__PURE__ */ React6.createElement("div", { "data-up-token-desc": true, style: { fontSize: 10, color: "var(--dsw-alias-label-tertiary, #999)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" } }, description, userNote !== void 0 ? "\uFF08\u81EA\u586B\uFF09" : "")), ["light", "dark"].map((mode) => {
    const isColor = mode === "light" ? lightIsColor : darkIsColor;
    const color = mode === "light" ? lightColor : darkColor;
    return /* @__PURE__ */ React6.createElement("div", { key: mode, style: { display: "flex", alignItems: "center", gap: 4, minWidth: 0 } }, isColor && /* @__PURE__ */ React6.createElement(
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
    ), /* @__PURE__ */ React6.createElement(
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
  const historyRef = React6.useRef([]);
  const lastHistoryPushRef = React6.useRef(0);
  const [canUndo, setCanUndo] = React6.useState(false);
  const [expandedExpert, setExpandedExpert] = React6.useState(false);
  const [advancedOpen, setAdvancedOpen] = React6.useState(getCapabilities() === "developer");
  const [search, setSearch] = React6.useState("");
  const [collapsed, setCollapsed] = React6.useState(() => /* @__PURE__ */ new Set());
  const [coverCrop, setCoverCrop] = React6.useState(null);
  const [groupMode, setGroupMode] = React6.useState(false);
  const [checked, setChecked] = React6.useState(() => /* @__PURE__ */ new Set());
  const [expandedGroups, setExpandedGroups] = React6.useState(() => /* @__PURE__ */ new Set());
  const [groupName, setGroupName] = React6.useState("");
  const [groupSchemeMode, setGroupSchemeMode] = React6.useState(false);
  const toggleCheck = React6.useCallback((name2) => {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(name2)) next.delete(name2);
      else next.add(name2);
      return next;
    });
  }, []);
  const applySession = React6.useCallback((next, changedNames) => {
    onSessionChange(next, changedNames);
  }, [onSessionChange]);
  const coverPreviewSrc = React6.useMemo(() => {
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
  const pushHistory = React6.useCallback((snapshot, changedNames) => {
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
  const setToken = React6.useCallback((name2, mode, value) => {
    const prev = session.tokens[name2];
    if (prev !== void 0 && prev[mode] === value) return;
    pushHistory({ tokens: { ...session.tokens }, css: session.css }, [name2]);
    const next = {
      ...session,
      tokens: { ...session.tokens, [name2]: { ...prev ?? { light: "", dark: "" }, [mode]: value } }
    };
    applySession(next, [name2]);
  }, [session, applySession, pushHistory]);
  const undo = React6.useCallback(() => {
    const entry = historyRef.current.pop();
    if (entry === void 0) return;
    setCanUndo(historyRef.current.length > 0);
    applySession({ ...session, tokens: entry.tokens, css: entry.css }, entry.changedNames);
  }, [session, applySession]);
  const setBundle = React6.useCallback((names, value) => {
    const prev = session.tokens;
    pushHistory({ tokens: { ...prev }, css: session.css }, names);
    const tokens = { ...prev };
    for (const name2 of names) {
      tokens[name2] = { light: value, dark: value };
    }
    applySession({ ...session, tokens }, names);
  }, [session, applySession, pushHistory]);
  const setBundleScheme = React6.useCallback((names, scheme, value) => {
    const prev = session.tokens;
    pushHistory({ tokens: { ...prev }, css: session.css }, names);
    const tokens = { ...prev };
    for (const name2 of names) {
      tokens[name2] = { ...tokens[name2] ?? { light: "", dark: "" }, [scheme]: value };
    }
    applySession({ ...session, tokens }, names);
  }, [session, applySession, pushHistory]);
  const createGroup = React6.useCallback(() => {
    const name2 = groupName.trim();
    if (name2 === "" || checked.size === 0) return;
    const group = { id: `group-${Date.now().toString(36)}`, name: name2, tokenNames: [...checked] };
    applySession({ ...session, groups: [...session.groups, group] }, []);
    setChecked(/* @__PURE__ */ new Set());
    setGroupName("");
    setGroupMode(false);
    setExpandedGroups((prev) => new Set(prev).add(group.id));
  }, [session, applySession, checked, groupName]);
  const deleteGroup = React6.useCallback((id) => {
    applySession({ ...session, groups: session.groups.filter((g) => g.id !== id) }, []);
  }, [session, applySession]);
  const setGroupColor = React6.useCallback((group, scheme, value) => {
    if (scheme === "both") setBundle(group.tokenNames, value);
    else setBundleScheme(group.tokenNames, scheme, value);
  }, [setBundle, setBundleScheme]);
  const setAssets = React6.useCallback((assets) => {
    applySession({ ...session, assets }, []);
  }, [session, applySession]);
  const setWidgets = React6.useCallback((widgets) => {
    applySession({ ...session, widgets }, []);
  }, [session, applySession]);
  const setAssetsAndWidgets = React6.useCallback((assets, widgets) => {
    applySession({ ...session, assets, widgets }, []);
  }, [session, applySession]);
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
  return /* @__PURE__ */ React6.createElement("div", { "data-up-editor": true, style: { display: "flex", flexDirection: "column", gap: 10, minWidth: 0, flex: 1 } }, /* @__PURE__ */ React6.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8 } }, /* @__PURE__ */ React6.createElement(
    "input",
    {
      type: "text",
      "aria-label": "\u9884\u8BBE\u540D\u79F0",
      value: session.presetName,
      maxLength: 64,
      onChange: (e) => {
        applySession({ ...session, presetName: e.target.value }, []);
      },
      style: { flex: 1, fontSize: 14, fontWeight: 600, padding: "5px 8px", border: "1px solid var(--dsw-alias-border-l2)", borderRadius: 8, background: "var(--dsw-alias-bg-layer-1)", color: "var(--dsw-alias-label-primary)" }
    }
  ), /* @__PURE__ */ React6.createElement("button", { type: "button", "data-up-btn": true, onClick: undo, disabled: !canUndo, style: { opacity: canUndo ? 1 : 0.4 } }, "\u64A4\u9500")), /* @__PURE__ */ React6.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", borderBottom: "1px solid var(--dsw-alias-border-l2)", paddingBottom: 8 } }, /* @__PURE__ */ React6.createElement("span", { style: { fontSize: 12, fontWeight: 600, color: "var(--dsw-alias-label-secondary)" } }, "\u5C01\u9762"), /* @__PURE__ */ React6.createElement(
    "img",
    {
      "data-up-cover-preview": true,
      src: coverPreviewSrc,
      alt: "\u5C01\u9762\u9884\u89C8",
      style: { width: 96, height: 32, objectFit: "cover", borderRadius: 4, border: "1px solid var(--dsw-alias-border-l2)", background: "var(--dsw-alias-bg-layer-1)" }
    }
  ), /* @__PURE__ */ React6.createElement(
    "select",
    {
      "aria-label": "\u9884\u8BBE\u5C01\u9762\u7D20\u6750",
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
    /* @__PURE__ */ React6.createElement("option", { value: "" }, "\u81EA\u52A8\u751F\u6210\uFF08\u63A8\u8350\uFF09"),
    session.assets.map((asset) => /* @__PURE__ */ React6.createElement("option", { key: asset.id, value: asset.id }, asset.name))
  ), /* @__PURE__ */ React6.createElement("span", { "data-up-status": true, style: { fontSize: 10 } }, "\u9009\u7D20\u6750\u6309 3:1 \u88C1\u526A \xB7 \u5339\u914D\u8BBE\u7F6E\u9875\u5361\u7247")), /* @__PURE__ */ React6.createElement("div", { style: { borderTop: "1px solid var(--dsw-alias-border-l2)", paddingTop: 8 } }, /* @__PURE__ */ React6.createElement(
    WidgetEditor,
    {
      assets: session.assets,
      widgets: session.widgets,
      onAssetsChange: setAssets,
      onWidgetsChange: setWidgets,
      onAssetsAndWidgetsChange: setAssetsAndWidgets
    }
  )), session.groups.length > 0 && /* @__PURE__ */ React6.createElement("div", { "data-up-groups": true, style: { borderTop: "1px solid var(--dsw-alias-border-l2)", paddingTop: 8, display: "flex", flexDirection: "column", gap: 6 } }, /* @__PURE__ */ React6.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8, fontSize: 12, fontWeight: 600, color: "var(--dsw-alias-label-secondary)" } }, /* @__PURE__ */ React6.createElement("span", null, "\u5206\u7EC4\u67D3\u8272"), /* @__PURE__ */ React6.createElement("span", { style: { fontWeight: 400, fontSize: 10, color: "var(--dsw-alias-label-tertiary, #999)" } }, /* @__PURE__ */ React6.createElement("label", { style: { display: "inline-flex", alignItems: "center", gap: 4, cursor: "pointer" } }, /* @__PURE__ */ React6.createElement("input", { type: "checkbox", checked: groupSchemeMode, onChange: (e) => {
    setGroupSchemeMode(e.target.checked);
  } }), "\u660E\u6697\u5206\u522B\u7F16\u8F91\uFF08\u4E0D\u52FE = \u540C\u8272\u540C\u65F6\u5199\u4EAE/\u6697\uFF09"))), session.groups.map((group) => {
    const expanded = expandedGroups.has(group.id);
    const lightValue = session.tokens[group.tokenNames[0]]?.light ?? "";
    const darkValue = session.tokens[group.tokenNames[0]]?.dark ?? "";
    return /* @__PURE__ */ React6.createElement("div", { key: group.id, "data-up-group": true, style: { border: "1px solid var(--dsw-alias-border-l2)", borderRadius: 8, padding: 6 } }, /* @__PURE__ */ React6.createElement("div", { style: { display: "flex", alignItems: "center", gap: 6 } }, /* @__PURE__ */ React6.createElement(
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
      /* @__PURE__ */ React6.createElement("span", { style: { fontWeight: 400, fontSize: 10, color: "var(--dsw-alias-label-tertiary, #999)" } }, " \xB7 ", group.tokenNames.length, " \u4E2A\u4EE4\u724C")
    ), /* @__PURE__ */ React6.createElement(
      "button",
      {
        type: "button",
        "data-up-group-del": true,
        onClick: () => {
          deleteGroup(group.id);
        },
        style: { marginLeft: "auto", fontSize: 10, border: "none", background: "transparent", color: "var(--dsw-alias-state-error-primary, #d94c4c)", cursor: "pointer" }
      },
      "\u89E3\u6563"
    )), expanded && /* @__PURE__ */ React6.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 4, paddingTop: 4 } }, /* @__PURE__ */ React6.createElement("div", { style: { fontSize: 10, color: "var(--dsw-alias-label-tertiary, #999)" } }, "\u6210\u5458\uFF1A", group.tokenNames.map((n) => n.replace("--dsw-alias-", "").replace("--dsw-specific-", "")).join("\u3001")), /* @__PURE__ */ React6.createElement("div", { style: { display: "flex", alignItems: "center", gap: 6 } }, /* @__PURE__ */ React6.createElement("span", { style: { fontSize: 10, color: "var(--dsw-alias-label-tertiary, #999)" } }, "\u7EC4\u8272\uFF1A"), groupSchemeMode ? /* @__PURE__ */ React6.createElement(React6.Fragment, null, /* @__PURE__ */ React6.createElement(
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
    ), /* @__PURE__ */ React6.createElement("span", { style: { fontSize: 10, color: "var(--dsw-alias-label-tertiary, #999)" } }, "\u4EAE"), /* @__PURE__ */ React6.createElement(
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
    ), /* @__PURE__ */ React6.createElement("span", { style: { fontSize: 10, color: "var(--dsw-alias-label-tertiary, #999)" } }, "\u6697")) : /* @__PURE__ */ React6.createElement(React6.Fragment, null, /* @__PURE__ */ React6.createElement(
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
    ), /* @__PURE__ */ React6.createElement("span", { style: { fontSize: 10, color: "var(--dsw-alias-label-tertiary, #999)" } }, "\uFF08\u4EAE+\u6697\u540C\u65F6\uFF09")))));
  })), /* @__PURE__ */ React6.createElement("div", { "data-up-advanced": true }, /* @__PURE__ */ React6.createElement(
    "div",
    {
      "data-up-advanced-head": true,
      onClick: () => {
        setAdvancedOpen((prev) => !prev);
      },
      style: { fontSize: 12, fontWeight: 600, color: "var(--dsw-alias-label-secondary)", padding: "6px 0", borderTop: "1px solid var(--dsw-alias-border-l2)", cursor: "pointer", userSelect: "none" }
    },
    /* @__PURE__ */ React6.createElement("span", null, advancedOpen ? "\u25BE" : "\u25B8"),
    " \u539F\u59CB\u4EE4\u724C",
    /* @__PURE__ */ React6.createElement("span", { style: { fontWeight: 400, color: "var(--dsw-alias-label-tertiary, #999)" } }, " \xB7 ", catalog.entries.length, " \u4E2A\uFF08\u652F\u6301\u5206\u7EC4\u67D3\u8272\u4E0E\u4E2D\u6587\u63CF\u8FF0\uFF09")
  ), /* @__PURE__ */ React6.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 12, paddingTop: 6 } }, /* @__PURE__ */ React6.createElement("div", { style: { display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" } }, /* @__PURE__ */ React6.createElement(
    "input",
    {
      type: "search",
      "aria-label": "\u641C\u7D22\u4EE4\u724C",
      placeholder: "\u641C\u7D22\u4EE4\u724C\u2026",
      value: search,
      onChange: (e) => {
        setSearch(e.target.value);
      },
      onFocus: () => {
        setAdvancedOpen(true);
      },
      style: { flex: 1, minWidth: 140, fontSize: 12, padding: "5px 8px", border: "1px solid var(--dsw-alias-border-l2)", borderRadius: 8, background: "var(--dsw-alias-bg-layer-1)", color: "var(--dsw-alias-label-primary)" }
    }
  ), /* @__PURE__ */ React6.createElement("button", { type: "button", "data-up-group-mode": true, onClick: () => {
    setGroupMode((prev) => !prev);
  }, style: { fontSize: 11, padding: "3px 8px", borderRadius: 6, border: groupMode ? "1px solid var(--dsw-alias-brand-primary)" : "1px solid var(--dsw-alias-border-l2)", background: groupMode ? "var(--dsw-alias-bg-layer-2)" : "transparent", color: "var(--dsw-alias-label-primary)", cursor: "pointer" } }, groupMode ? "\u2713 \u5206\u7EC4\u6A21\u5F0F\uFF08\u70B9\u9009\u4EE4\u724C\uFF09" : "\u5206\u7EC4\u6A21\u5F0F"), groupMode && /* @__PURE__ */ React6.createElement(React6.Fragment, null, /* @__PURE__ */ React6.createElement(
    "input",
    {
      type: "text",
      "aria-label": "\u65B0\u7EC4\u540D\u79F0",
      placeholder: "\u7EC4\u540D\uFF08\u5982\uFF1A\u64CD\u4F5C\u533A\uFF09",
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
  ), /* @__PURE__ */ React6.createElement("button", { type: "button", "data-up-group-create": true, onClick: createGroup, disabled: checked.size === 0 || groupName.trim() === "", style: { fontSize: 11, padding: "3px 8px", borderRadius: 6, border: "1px solid var(--dsw-alias-border-l2)", background: "var(--dsw-alias-bg-layer-2)", color: "var(--dsw-alias-label-primary)", cursor: "pointer", opacity: checked.size === 0 || groupName.trim() === "" ? 0.4 : 1 } }, "\u65B0\u5EFA\u7EC4\uFF08", checked.size, "\uFF09"))), advancedOpen && // 修复轮 #30：内容随中栏整体滚动（原 overflow auto 与中栏滚动嵌套冲突）
  /* @__PURE__ */ React6.createElement(React6.Fragment, null, groups.map((group) => {
    const key = String(group.group);
    const isCollapsed = collapsed.has(key) && query === "";
    return /* @__PURE__ */ React6.createElement("section", { key, "data-up-group": true }, /* @__PURE__ */ React6.createElement(
      "div",
      {
        "data-up-group-head": true,
        onClick: () => {
          toggleGroup(key);
        },
        style: { fontSize: 12, fontWeight: 600, color: "var(--dsw-alias-label-secondary)", padding: "4px 0", borderBottom: "1px solid var(--dsw-alias-border-l2)", cursor: "pointer", userSelect: "none" }
      },
      /* @__PURE__ */ React6.createElement("span", null, isCollapsed ? "\u25B8" : "\u25BE"),
      " ",
      group.label,
      /* @__PURE__ */ React6.createElement("span", { style: { fontWeight: 400, color: "var(--dsw-alias-label-tertiary, #999)" } }, " \xB7 ", group.entries.length, GROUP_DESCRIPTIONS[String(group.group)] !== void 0 ? ` \xB7 ${GROUP_DESCRIPTIONS[String(group.group)]}` : "")
    ), !isCollapsed && /* @__PURE__ */ React6.createElement(React6.Fragment, null, /* @__PURE__ */ React6.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8, padding: "3px 0", fontSize: 10, color: "var(--dsw-alias-label-tertiary, #999)" } }, groupMode && /* @__PURE__ */ React6.createElement("span", { style: { width: 18 } }), /* @__PURE__ */ React6.createElement("span", { style: { flex: 1 } }, "\u4EE4\u724C"), /* @__PURE__ */ React6.createElement("span", { style: { width: 128 } }, "\u4EAE\u8272"), /* @__PURE__ */ React6.createElement("span", { style: { width: 128 } }, "\u6697\u8272")), /* @__PURE__ */ React6.createElement("div", { style: { display: "flex", flexDirection: "column" } }, group.entries.map(({ name: name2 }) => {
      const entry = findToken(name2);
      const isExpert = entry?.safety === "expert";
      if (isExpert && !expandedExpert) return null;
      const existing = session.tokens[name2];
      const value = existing ?? { light: entry?.light ?? "", dark: entry?.dark ?? "" };
      return /* @__PURE__ */ React6.createElement(
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
  }), hasExpertEntries && !expandedExpert && /* @__PURE__ */ React6.createElement("button", { type: "button", "data-up-btn": true, onClick: () => {
    setExpandedExpert(true);
  }, style: { alignSelf: "flex-start" } }, "\u5C55\u5F00\u5168\u90E8\u9AD8\u7EA7\u4EE4\u724C\uFF08\u98CE\u9669\u4EE4\u724C\u9ED8\u8BA4\u9690\u85CF\uFF09")))), coverCrop !== null && /* @__PURE__ */ React6.createElement(
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
  const [open, setOpen] = React7.useState(isStudioHashActive());
  const isPrimary = React7.useRef(false);
  const controller2 = getController();
  const [, force] = React7.useState(0);
  React7.useEffect(() => {
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
  React7.useEffect(() => {
    if (!isPrimary.current) return;
    return controller2?.subscribeState(() => force((n) => n + 1)) ?? (() => {
    });
  }, [controller2]);
  const [session, setSession] = React7.useState(() => {
    if (stashedSession !== null && controller2?.engine.getState().hasDraft !== true) {
      stashedSession = null;
      return null;
    }
    return stashedSession;
  });
  const [presets, setPresets] = React7.useState([]);
  const [presetsLoaded, setPresetsLoaded] = React7.useState(false);
  const [busy, setBusy] = React7.useState(false);
  const [notice, setNotice] = React7.useState(null);
  const fileInputRef = React7.useRef(null);
  const sessionRef = React7.useRef(null);
  sessionRef.current = session;
  const [confirmBox, setConfirmBox] = React7.useState(null);
  const activeTokensKey = JSON.stringify(controller2?.engine.getActiveCompiled()?.tokens ?? null);
  const chromePins = React7.useMemo(() => {
    try {
      return computeChromePins(controller2?.engine.getActiveCompiled()?.tokens ?? null, detectAppScheme());
    } catch {
      return {};
    }
  }, [controller2, activeTokensKey]);
  const [activeThemeId, setActiveThemeId] = React7.useState(null);
  React7.useEffect(() => {
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
  const refreshPresets = React7.useCallback(async () => {
    const list = await controller2?.listPresets() ?? [];
    setPresets(list);
    setPresetsLoaded(true);
  }, [controller2]);
  React7.useEffect(() => {
    void refreshPresets();
    const unsubscribe = controller2?.subscribeLibrary(() => {
      void refreshPresets();
    });
    return () => {
      unsubscribe?.();
    };
  }, [controller2, refreshPresets]);
  React7.useEffect(() => {
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
    setConfirmBox({ message: "\u5F53\u524D\u6709\u672A\u4FDD\u5B58\u7684\u6539\u52A8\uFF0C\u653E\u5F03\u5E76\u7EE7\u7EED\uFF1F", label: "\u653E\u5F03\u5E76\u7EE7\u7EED", action });
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
        setNotice(`\u9884\u8BBE ${id} \u4E0D\u5B58\u5728`);
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
      const next = { presetId: id, presetName: "\u65B0\u9884\u8BBE", tokens: {}, css: [], theme: { enabled: false, colorScheme: "dark" }, assets: [], widgets: [], cover: void 0, groups: [] };
      setSession(next);
      stashedSession = null;
      const empty = { schemaVersion: 1, id, name: "\u65B0\u9884\u8BBE", edition: "standard", tokens: {} };
      controller2?.engine.startDraft(empty);
      setNotice(null);
    });
  };
  const captureActive = () => {
    requestDiscard(() => {
      const id = `preset-${Date.now().toString(36)}`;
      const tokens = controller2?.engine.getActiveCompiled()?.tokens ?? {};
      if (Object.keys(tokens).length === 0) {
        const next2 = { presetId: id, presetName: "\u4ECE\u9ED8\u8BA4\u5916\u89C2\u65B0\u5EFA", tokens: {}, css: [], theme: { enabled: false, colorScheme: "dark" }, assets: [], widgets: [], cover: void 0, groups: [] };
        setSession(next2);
        stashedSession = null;
        const empty = { schemaVersion: 1, id, name: "\u4ECE\u9ED8\u8BA4\u5916\u89C2\u65B0\u5EFA", edition: "standard", tokens: {} };
        controller2?.engine.startDraft(empty);
        setNotice("\u5DF2\u4ECE\u9ED8\u8BA4\u5916\u89C2\u521B\u5EFA\uFF08\u5F53\u524D\u65E0\u6D3B\u52A8\u9884\u8BBE\uFF0C\u5C06\u4F7F\u7528\u7CFB\u7EDF\u9ED8\u8BA4\u6837\u5F0F\uFF09");
        return;
      }
      const next = { presetId: id, presetName: "\u4ECE\u5F53\u524D\u5916\u89C2\u65B0\u5EFA", tokens: { ...tokens }, css: [], theme: { enabled: false, colorScheme: "dark" }, assets: [], widgets: [], cover: void 0, groups: [] };
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
      setNotice("\u6CA1\u6709\u6B63\u5728\u7F16\u8F91\u7684\u9884\u8BBE");
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
        setNotice(isBuiltin ? `\u5185\u7F6E\u9884\u8BBE\u5DF2\u53E6\u5B58\u4E3A\u300C${name2}\u300D` : `\u5DF2\u4FDD\u5B58\u300C${name2}\u300D`);
        await refreshPresets();
      } else {
        setNotice(controller2?.engine.getState().lastError ?? "\u4FDD\u5B58\u5931\u8D25");
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
      setNotice("\u5DF2\u653E\u5F03\u672A\u4FDD\u5B58\u7684\u6539\u52A8");
    });
  };
  const duplicate = async (id) => {
    setBusy(true);
    try {
      const preset2 = await controller2?.loadPreset(id);
      if (preset2 === null) {
        setNotice(`\u9884\u8BBE ${id} \u4E0D\u5B58\u5728`);
        return;
      }
      let copyId = `${id}-copy`;
      const existing = await controller2?.listPresets() ?? [];
      if (existing.some((p) => p.id === copyId)) copyId = `${id}-copy-${Date.now().toString(36)}`;
      const copy = { ...preset2, id: copyId, name: `${preset2.name}\uFF08\u526F\u672C\uFF09` };
      const ok = await controller2?.savePreset(copy, { activate: false }) ?? false;
      if (ok) {
        setNotice(`\u5DF2\u590D\u5236\u4E3A\u300C${copy.name}\u300D`);
        await refreshPresets();
      } else {
        setNotice("\u590D\u5236\u5931\u8D25");
      }
    } finally {
      setBusy(false);
    }
  };
  const remove = async (id) => {
    const doRemove = async () => {
      const ok = await controller2?.deletePreset(id) ?? false;
      if (ok) {
        setNotice(`\u5DF2\u5220\u9664 ${id}`);
        if (session?.presetId === id) {
          setSession(null);
          stashedSession = null;
          controller2?.engine.discardDraft();
          setNotice(`\u5DF2\u5220\u9664 ${id}\uFF08\u5916\u89C2\u5DF2\u8FD8\u539F\u9ED8\u8BA4\uFF09`);
        }
        await refreshPresets();
      } else {
        setNotice("\u5220\u9664\u5931\u8D25");
      }
    };
    if (session?.presetId === id && hasUnsavedDraft()) {
      setConfirmBox({
        message: "\u5F53\u524D\u6709\u672A\u4FDD\u5B58\u7684\u6539\u52A8\uFF0C\u653E\u5F03\u5E76\u7EE7\u7EED\uFF1F",
        label: "\u653E\u5F03\u5E76\u7EE7\u7EED",
        action: () => {
          requestConfirm(`\u5220\u9664\u9884\u8BBE\u300C${id}\u300D\uFF1F\u6B64\u64CD\u4F5C\u4E0D\u53EF\u6062\u590D\u3002`, "\u5220\u9664", () => {
            void doRemove();
          });
        }
      });
    } else {
      requestConfirm(`\u5220\u9664\u9884\u8BBE\u300C${id}\u300D\uFF1F\u6B64\u64CD\u4F5C\u4E0D\u53EF\u6062\u590D\u3002`, "\u5220\u9664", () => {
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
          setNotice(`\u5DF2\u8FD8\u539F\u5907\u4EFD\u300C${name2}\u300D\uFF08\u8FD8\u539F\u524D\u7248\u672C\u5DF2\u5B58\u5165\u5907\u4EFD\uFF0C\u672A\u81EA\u52A8\u5E94\u7528\uFF09`);
          await refreshPresets();
        } else {
          setNotice(result?.error ?? "\u8FD8\u539F\u5907\u4EFD\u5931\u8D25");
        }
      } finally {
        setBusy(false);
      }
    };
    const confirmRestore = () => {
      requestConfirm(
        `\u7528\u5907\u4EFD\u8FD8\u539F\u9884\u8BBE\u300C${name2}\u300D\uFF1F\u5F53\u524D\u7248\u672C\u5C06\u5B58\u5165\u5907\u4EFD\uFF08\u5907\u4EFD\u4EC5\u4FDD\u7559\u4E00\u5C42\uFF0C\u53EF\u518D\u8FD8\u539F\u56DE\u53BB\uFF09\uFF0C\u8FD8\u539F\u4E0D\u81EA\u52A8\u5E94\u7528\u3002`,
        "\u8FD8\u539F\u5907\u4EFD",
        () => {
          void doRestore();
        }
      );
    };
    if (session?.presetId === id && hasUnsavedDraft()) {
      setConfirmBox({
        message: "\u5F53\u524D\u6709\u672A\u4FDD\u5B58\u7684\u6539\u52A8\uFF0C\u653E\u5F03\u5E76\u7EE7\u7EED\uFF1F",
        label: "\u653E\u5F03\u5E76\u7EE7\u7EED",
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
      setNotice(`\u5DF2\u5BFC\u5165 ${result.id}`);
      await refreshPresets();
    } else {
      setNotice(result?.error ?? "\u5BFC\u5165\u5931\u8D25");
    }
  };
  const exportZipCurrent = async () => {
    if (session !== null) {
      const ok = await controller2?.exportZipFile(buildPreset(session)) ?? false;
      if (ok) setNotice("\u5DF2\u5BFC\u51FA ZIP \u4E09\u4EF6\u5957\uFF08\u542B\u5C01\u9762\uFF09");
    } else if (state?.activePresetId !== null && state?.activePresetId !== void 0) {
      const preset2 = await controller2?.loadPreset(state.activePresetId);
      if (preset2 !== null) {
        const ok = await controller2?.exportZipFile(preset2) ?? false;
        if (ok) setNotice("\u5DF2\u5BFC\u51FA ZIP \u4E09\u4EF6\u5957\uFF08\u542B\u5C01\u9762\uFF09");
      } else {
        setNotice("\u6D3B\u52A8\u9884\u8BBE\u4E0D\u5B58\u5728\uFF0C\u65E0\u6CD5\u5BFC\u51FA");
      }
    } else {
      setNotice("\u6CA1\u6709\u53EF\u5BFC\u51FA\u7684\u9884\u8BBE");
    }
  };
  const applyPreset = (id) => {
    const doApply = async () => {
      const ok = await controller2?.applyPresetById(id) ?? false;
      setNotice(ok ? null : `\u5E94\u7528\u300C${id}\u300D\u5931\u8D25\uFF1A${controller2?.engine.getState().lastError ?? "\u9884\u8BBE\u4E0D\u5B58\u5728\u6216\u5DF2\u635F\u574F"}`);
    };
    if (session !== null && controller2?.engine.getState().hasDraft === true) {
      setConfirmBox({
        message: "\u5F53\u524D\u6709\u672A\u4FDD\u5B58\u7684\u7F16\u8F91\u8349\u7A3F\uFF08\u4F1A\u906E\u853D\u5916\u89C2\u9884\u89C8\uFF09\u3002\u653E\u5F03\u8349\u7A3F\u5E76\u5E94\u7528\u6240\u9009\u9884\u8BBE\uFF1F",
        label: "\u653E\u5F03\u5E76\u5E94\u7528",
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
  return /* @__PURE__ */ React7.createElement(
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
    /* @__PURE__ */ React7.createElement("div", { "data-up-studio-bar": true }, /* @__PURE__ */ React7.createElement("button", { type: "button", "data-up-btn": true, onClick: () => {
      closeStudio();
    } }, "\u2039 \u8FD4\u56DE"), /* @__PURE__ */ React7.createElement("div", { "data-up-studio-title": true }, "\u5916\u89C2\u9884\u8BBE\u5DE5\u4F5C\u5BA4"), /* @__PURE__ */ React7.createElement("span", { "data-up-status": true, style: { marginRight: "auto" } }, activeName !== null ? `\u6D3B\u52A8\uFF1A${activeName}` : "\u65E0\u6D3B\u52A8\u9884\u8BBE"), /* @__PURE__ */ React7.createElement("button", { type: "button", "data-up-btn": true, onClick: () => {
      void exportZipCurrent();
    } }, "\u5BFC\u51FA ZIP"), /* @__PURE__ */ React7.createElement("button", { type: "button", "data-up-btn": true, onClick: discard, disabled: session === null || busy }, "\u653E\u5F03"), /* @__PURE__ */ React7.createElement("button", { type: "button", "data-up-btn": true, "data-up-btn-primary": true, onClick: () => {
      void save();
    }, disabled: session === null || busy }, "\u4FDD\u5B58")),
    /* @__PURE__ */ React7.createElement("div", { "data-up-studio-body": true, style: { display: "flex", gap: 16, padding: 16, flex: 1, overflow: "hidden" } }, /* @__PURE__ */ React7.createElement("aside", { style: { width: 220, flexShrink: 0, display: "flex", flexDirection: "column", gap: 8, overflow: "auto" } }, /* @__PURE__ */ React7.createElement("div", { style: { display: "flex", gap: 6, flexWrap: "wrap" } }, /* @__PURE__ */ React7.createElement("button", { type: "button", "data-up-btn": true, onClick: startNew, disabled: busy }, "\u65B0\u5EFA"), /* @__PURE__ */ React7.createElement("button", { type: "button", "data-up-btn": true, onClick: captureActive, disabled: busy }, "\u4ECE\u5F53\u524D\u5916\u89C2\u65B0\u5EFA"), /* @__PURE__ */ React7.createElement("button", { type: "button", "data-up-btn": true, onClick: () => {
      fileInputRef.current?.click();
    }, disabled: busy }, "\u5BFC\u5165"), /* @__PURE__ */ React7.createElement(
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
    )), /* @__PURE__ */ React7.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 6 } }, presets.map((item) => /* @__PURE__ */ React7.createElement("div", { key: item.id, "data-up-card": true, style: { padding: 10, gap: 4 } }, /* @__PURE__ */ React7.createElement("div", { "data-up-card-title": true, style: { fontSize: 13 } }, item.name), /* @__PURE__ */ React7.createElement("div", { "data-up-card-desc": true }, item.id, item.builtin ? " \xB7 \u5185\u7F6E" : ""), /* @__PURE__ */ React7.createElement("div", { style: { display: "flex", gap: 4, flexWrap: "wrap" } }, /* @__PURE__ */ React7.createElement("button", { type: "button", "data-up-btn": true, style: { padding: "3px 10px", fontSize: 12 }, onClick: () => {
      void applyPreset(item.id);
    }, disabled: busy }, "\u5E94\u7528"), /* @__PURE__ */ React7.createElement("button", { type: "button", "data-up-btn": true, style: { padding: "3px 10px", fontSize: 12 }, onClick: () => {
      void openEditor(item.id);
    }, disabled: busy }, "\u7F16\u8F91"), /* @__PURE__ */ React7.createElement("button", { type: "button", "data-up-btn": true, style: { padding: "3px 10px", fontSize: 12 }, onClick: () => {
      void duplicate(item.id);
    }, disabled: busy || item.builtin }, "\u590D\u5236"), /* @__PURE__ */ React7.createElement("button", { type: "button", "data-up-btn": true, style: { padding: "3px 10px", fontSize: 12 }, onClick: () => {
      void remove(item.id);
    }, disabled: busy || item.builtin }, "\u5220\u9664"), item.hasBackup && /* @__PURE__ */ React7.createElement("button", { type: "button", "data-up-btn": true, "data-up-restore-btn": true, style: { padding: "3px 10px", fontSize: 12 }, onClick: () => {
      restoreBackup(item.id);
    }, disabled: busy }, "\u8FD8\u539F\u5907\u4EFD")))), presetsLoaded && presets.length === 0 && /* @__PURE__ */ React7.createElement("div", { "data-up-status": true }, "\u9884\u8BBE\u5E93\u4E3A\u7A7A\u2014\u2014\u65B0\u5EFA\u6216\u5BFC\u5165\u4E00\u4E2A\u9884\u8BBE\u5F00\u59CB\u3002"))), /* @__PURE__ */ React7.createElement(
      "main",
      {
        "data-up-editor-col": true,
        style: { flex: 1, minWidth: 0, minHeight: 0, display: "flex", flexDirection: "column", overflow: "auto" }
      },
      hasCapability("knobs") && session !== null && /* @__PURE__ */ React7.createElement(TokenEditor, { key: session.presetId ?? "new", session, onSessionChange }),
      hasCapability("knobs") && session === null && /* @__PURE__ */ React7.createElement("div", { "data-up-wall": true, style: { justifyContent: "center", height: "100%" } }, /* @__PURE__ */ React7.createElement("div", { "data-up-status": true }, "\u4ECE\u5DE6\u4FA7\u9009\u62E9\u4E00\u4E2A\u9884\u8BBE\u300C\u7F16\u8F91\u300D\uFF0C\u6216\u300C\u65B0\u5EFA\u300D\u5F00\u59CB\u521B\u4F5C\u3002"))
    )),
    /* @__PURE__ */ React7.createElement("div", { "data-up-studio-status": true, style: { padding: "8px 16px", borderTop: "1px solid var(--dsw-alias-border-l2)", fontSize: 12, color: "var(--dsw-alias-label-tertiary, #999)", display: "flex", gap: 12, alignItems: "center" } }, state?.hasDraft === true ? /* @__PURE__ */ React7.createElement("span", { style: { color: "var(--dsw-alias-state-warn-primary, #b7791f)" } }, "\u25CF \u9884\u89C8\u4E2D\uFF08\u672A\u4FDD\u5B58\uFF09") : /* @__PURE__ */ React7.createElement("span", null, "\u5DF2\u4FDD\u5B58"), activeThemeId !== null && /* @__PURE__ */ React7.createElement("span", { "data-up-theme-row": true, style: { display: "flex", alignItems: "center", gap: 6 } }, "\u4E3B\u9898\u300C", activeThemeId, "\u300D\u5DF2\u6CE8\u518C", /* @__PURE__ */ React7.createElement(
      "button",
      {
        type: "button",
        "data-up-btn": true,
        style: { padding: "2px 10px", fontSize: 11 },
        onClick: () => {
          const result = controller2?.selectTheme(activeThemeId);
          if (result?.ok === true) setNotice(`\u5DF2\u5207\u6362\u5230\u4E3B\u9898\u300C${activeThemeId}\u300D`);
        }
      },
      "\u5207\u6362\u5230\u6B64\u4E3B\u9898"
    )), /* @__PURE__ */ React7.createElement("span", null, notice ?? ""), state?.lastError !== null && state?.lastError !== void 0 && /* @__PURE__ */ React7.createElement("span", { "data-up-error": true }, state.lastError)),
    confirmBox !== null && /* @__PURE__ */ React7.createElement(
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

// src/client/index.tsx
function coverImageFor(preset2) {
  const cover = preset2.cover;
  if (cover === void 0 || cover.assetId === "") return Promise.resolve(coverDataUrlFor(preset2));
  const asset = (preset2.assets ?? []).find((item) => item.id === cover.assetId);
  if (asset === void 0) return Promise.resolve(coverDataUrlFor(preset2));
  const src = asset.dataUrl ?? `/ui-presets/assets/${encodeURIComponent(asset.id)}`;
  const hasCrop = typeof cover.cropX === "string" && cover.cropX !== "" && typeof cover.cropW === "string" && cover.cropW !== "";
  if (!hasCrop) return Promise.resolve(src);
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      try {
        const W = 900;
        const H = 300;
        const s = W / 1920;
        const canvas = document.createElement("canvas");
        canvas.width = W;
        canvas.height = H;
        const ctx = canvas.getContext("2d");
        if (ctx === null) {
          resolve(src);
          return;
        }
        ctx.clearRect(0, 0, W, H);
        ctx.drawImage(
          img,
          Number(cover.cropX) * s,
          Number(cover.cropY) * s,
          Number(cover.cropW) * s,
          Number(cover.cropH) * s
        );
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
[data-up-studio] { position: fixed; inset: 0; z-index: 1200; background: var(--dsw-alias-bg-base, #fff); color: var(--dsw-alias-label-primary, #111); display: flex; flex-direction: column; }
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
          label: () => "\u5916\u89C2\u9884\u8BBE",
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
  return React8.useSyncExternalStore(
    React8.useCallback(
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
  const [auditWarnings, setAuditWarnings] = React8.useState([]);
  const [wallItems, setWallItems] = React8.useState(null);
  const [covers, setCovers] = React8.useState({});
  const [importing, setImporting] = React8.useState(false);
  const fileInputRef = React8.useRef(null);
  const loadWall = React8.useCallback(async () => {
    const items = await controller2?.listPresets() ?? [];
    setWallItems(items);
    const demoCovers = {};
    for (const demo of DEMO_PRESETS) demoCovers[demo.id] = coverDataUrlFor(demo);
    setCovers(demoCovers);
    for (const item of items) {
      if (item.builtin && demoCovers[item.id] !== void 0) continue;
      void controller2?.loadPreset(item.id).then((preset2) => {
        if (preset2 === null) return;
        void coverImageFor(preset2).then((src) => {
          setCovers((prev) => ({ ...prev, [item.id]: src }));
        });
      });
    }
  }, [controller2]);
  React8.useEffect(() => {
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
  React8.useEffect(() => {
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
        controller2?.engine.reportError(result?.error ?? "\u5BFC\u5165\u5931\u8D25");
      }
    } finally {
      setImporting(false);
    }
  };
  const libraryEmpty = wallItems !== null && !wallItems.some((item) => !item.builtin);
  return /* @__PURE__ */ React8.createElement("div", { "data-up-section": true }, /* @__PURE__ */ React8.createElement("div", { style: { display: "flex", gap: 8, marginBottom: 12 } }, /* @__PURE__ */ React8.createElement("button", { type: "button", "data-up-btn": true, "data-up-btn-primary": true, onClick: () => {
    openStudio();
  } }, "\u6253\u5F00\u7F8E\u5316\u5DE5\u4F5C\u5BA4 \u2192"), /* @__PURE__ */ React8.createElement("button", { type: "button", "data-up-btn": true, onClick: () => {
    controller2?.clearActive();
  } }, "\u8FD8\u539F\u9ED8\u8BA4")), auditWarnings.length > 0 && /* @__PURE__ */ React8.createElement(
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
    "\u26A0 ",
    auditWarnings.join("\uFF1B")
  ), wallItems === null && /* @__PURE__ */ React8.createElement("div", { "data-up-status": true }, "\u52A0\u8F7D\u9884\u8BBE\u4E2D\u2026"), /* @__PURE__ */ React8.createElement("div", { "data-up-wall": true }, (wallItems ?? []).map((item) => {
    const active = state?.activePresetId === item.id;
    return /* @__PURE__ */ React8.createElement(
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
      /* @__PURE__ */ React8.createElement(
        "img",
        {
          "data-up-cover": true,
          src: covers[item.id] ?? "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
          alt: item.name,
          style: { width: "100%", aspectRatio: "3 / 1", objectFit: "cover", borderRadius: 8, border: "1px solid var(--dsw-alias-border-l2)", background: "var(--dsw-alias-bg-layer-1)" }
        }
      ),
      /* @__PURE__ */ React8.createElement("div", { "data-up-card-title": true }, item.name),
      /* @__PURE__ */ React8.createElement("div", { "data-up-card-desc": true }, item.builtin ? "\u51FA\u5382\u9884\u8BBE" : "\u6211\u7684\u9884\u8BBE", item.id === "default" ? "" : ` \xB7 ${item.id}`),
      /* @__PURE__ */ React8.createElement("div", { style: { display: "flex", gap: 8, alignItems: "center" } }, /* @__PURE__ */ React8.createElement(
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
        active ? "\u5DF2\u5E94\u7528" : "\u5E94\u7528"
      ), active && /* @__PURE__ */ React8.createElement("span", { "data-up-status": true }, "\u2713 \u5F53\u524D\u5E94\u7528"))
    );
  })), libraryEmpty && /* @__PURE__ */ React8.createElement(
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
    /* @__PURE__ */ React8.createElement("div", { style: { fontWeight: 600, color: "var(--dsw-alias-label-primary, #111)" } }, "\u8FD8\u6CA1\u6709\u81EA\u5DF1\u7684\u9884\u8BBE"),
    /* @__PURE__ */ React8.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" } }, /* @__PURE__ */ React8.createElement("span", null, "\u6253\u5F00\u5DE5\u4F5C\u5BA4\u521B\u5EFA\uFF0C\u6216\u5BFC\u5165\u9884\u8BBE\u6587\u4EF6\uFF08ZIP\uFF09\uFF1A"), /* @__PURE__ */ React8.createElement("button", { type: "button", "data-up-btn": true, onClick: () => fileInputRef.current?.click(), disabled: importing }, importing ? "\u5BFC\u5165\u4E2D\u2026" : "\u5BFC\u5165\u9884\u8BBE\u6587\u4EF6"), /* @__PURE__ */ React8.createElement(
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
  ), state?.lastError !== null && state?.lastError !== void 0 && /* @__PURE__ */ React8.createElement("div", { "data-up-status": true, style: { marginTop: 8 } }, /* @__PURE__ */ React8.createElement("span", { "data-up-error": true }, state.lastError)), /* @__PURE__ */ React8.createElement(StudioShell, null));
}
		return module.exports;
	}
});
