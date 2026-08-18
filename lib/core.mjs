// src/core/crop.ts
var WIDGET_TARGET_SELECTOR = {
  "chat-background": "[data-conversation-scroll]",
  "settings-background": '[role="dialog"]:not([data-up-crop]):not([data-up-confirm])',
  "sidebar-poster": '[data-slot="sidebar"] > div:first-child'
};

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
function tokenNameValid(name) {
  return name.startsWith("--");
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
  const name = raw.name;
  if (typeof name !== "string" || name.trim() === "") {
    errors.push("name \u5FC5\u586B\u4E14\u4E3A\u975E\u7A7A\u5B57\u7B26\u4E32");
  } else if (name.length > MAX_NAME_LENGTH) {
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
      for (const [name2, value] of Object.entries(theme.tokens)) {
        if (!tokenNameValid(name2)) {
          errors.push(`theme \u4EE4\u724C\u540D "${name2}" \u5FC5\u987B\u4EE5 -- \u5F00\u5934`);
        } else if (!isTokenOverride(value)) {
          errors.push(`theme \u4EE4\u724C "${name2}" \u5FC5\u987B\u662F { light, dark } \u5B57\u7B26\u4E32\u5BF9`);
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
  const preset = {
    schemaVersion: SCHEMA_VERSION,
    id: id.trim(),
    name: name.trim(),
    edition,
    tokens: Object.fromEntries(
      Object.entries(raw.tokens).map(([k, v]) => [k, { light: v.light, dark: v.dark }])
    )
  };
  if (typeof raw.minDshVersion === "string") preset.minDshVersion = raw.minDshVersion.trim();
  if (typeof raw.targetDshVersion === "string") preset.targetDshVersion = raw.targetDshVersion.trim();
  if (Array.isArray(raw.tags)) preset.tags = [...raw.tags];
  if (isRecord(raw.author)) preset.author = { ...raw.author };
  if (Array.isArray(raw.css)) {
    preset.css = raw.css.map((entry) => ({
      selector: String(entry.selector ?? ""),
      rules: String(entry.rules ?? "")
    }));
  }
  if (raw.theme !== void 0) {
    const theme = raw.theme;
    preset.theme = {
      id: theme.id.trim(),
      colorScheme: theme.colorScheme,
      tokens: Object.fromEntries(
        Object.entries(theme.tokens).map(([k, v]) => [k, { light: v.light, dark: v.dark }])
      )
    };
  }
  if (Array.isArray(raw.assets)) {
    preset.assets = raw.assets.map((asset) => {
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
    preset.widgets = raw.widgets.map((widget) => ({
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
    preset.cover = cleaned;
  }
  const extra = {};
  if (isRecord(raw.extra)) {
    for (const [k, v] of Object.entries(raw.extra)) {
      if (Object.hasOwn(preset, k)) continue;
      Object.defineProperty(extra, k, { value: v, enumerable: true, writable: true, configurable: true });
    }
  }
  for (const [k, v] of Object.entries(raw)) {
    if (Object.hasOwn(preset, k) || k === "schemaVersion" || k === "extra") continue;
    Object.defineProperty(extra, k, { value: v, enumerable: true, writable: true, configurable: true });
  }
  if (Object.keys(extra).length > 0) preset.extra = extra;
  return { ok: true, preset };
}
function checkDshCompatibility(preset, currentDshVersion) {
  if (preset.minDshVersion === void 0) return null;
  const required = parseVersion(preset.minDshVersion);
  const current = parseVersion(currentDshVersion);
  if (required === null || current === null) return null;
  if (compareVersion(current, required) < 0) {
    return `\u6B64\u9884\u8BBE\u8981\u6C42 DSH \u2265 ${preset.minDshVersion}\uFF0C\u5F53\u524D\u4E3A ${currentDshVersion}`;
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
function compilePreset(preset, colorScheme = "light") {
  const compiled = { preset, tokens: { ...preset.tokens } };
  const extra = preset.extra;
  const cssRules = preset.css ?? (Array.isArray(extra?.css) ? extra.css : void 0);
  const widgetText = widgetsToCss(preset.widgets, preset.assets ?? []);
  if (cssRules !== void 0 || widgetText !== "") {
    const cssText = [cssRules !== void 0 ? cssRulesToText(cssRules) : "", widgetText].filter((t) => t !== "").join("\n");
    if (cssText !== "") compiled.css = { source: `ui-presets:${preset.id}`, text: cssText };
  }
  const themeDef = preset.theme ?? extra?.theme;
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
  theme;
  style;
  currentDshVersion;
  onStateChange;
  state = {
    activePresetId: null,
    hasDraft: false,
    draftPresetId: null,
    lastError: null,
    revision: 0
  };
  /** 活动层 disposer 链（应用新预设前先收旧链）。 */
  activeDisposers = [];
  /** 草稿层 disposer 链。 */
  draftDisposers = [];
  /** 上一个成功活动预设 id（损坏回退目标）。 */
  lastGoodPresetId = null;
  /** 活动层编译快照（M1 预览取数：改前基线）。 */
  activeCompiled = { tokens: {}, hasCss: false };
  /** 草稿层编译快照（M1 预览取数：改后）。 */
  draftCompiled = null;
  /** 草稿层当前完整令牌基线（patchDraft 差分合并用）。 */
  draftTokenBaseline = {};
  /** 草稿层 css 注入文本基线（M2-2：css 变更也触发重挂）。 */
  draftCssBaseline = "";
  /** 活动层 css 注入文本基线（#52b：controller 动态裁剪渲染取数——解析裁剪标记）。 */
  activeCssBaseline = "";
  /** 草稿层主题注册基线（M2-4：主题开关/色板变更也触发重挂——短路径只比 tokens+css 会吞掉主题变更）。 */
  draftThemeBaseline = "";
  /** 主题注册引用计数（M2-4：草稿重挂 teardown 旧链会注销——引用计数保证
   * 只要还有挂载链引用该主题就不注销；计数归零才真正注销）。 */
  themeRefCounts = /* @__PURE__ */ new Map();
  /** 最近一次 state 快照的稳定引用（review P3：getState 返回缓存引用——useSyncExternalStore
   * 用 Object.is 比较，每次渲染新对象会触发无限重渲染（React #185）；同时防外部直接改内部对象）。 */
  stateSnapshot = {
    activePresetId: null,
    hasDraft: false,
    draftPresetId: null,
    lastError: null,
    revision: 0
  };
  constructor(options) {
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
  patchDraft(preset) {
    if (!this.state.hasDraft) return this.startDraft(preset);
    try {
      const error = this.checkCompatibility(preset);
      if (error !== null) throw new Error(error);
      const compiled = compilePreset(preset);
      const target = { ...preset.tokens };
      const cssText = compiled.css?.text ?? "";
      const themeText = compiled.theme !== void 0 ? canonicalJson(compiled.theme) : "";
      if (tokensEqual(this.draftTokenBaseline, target) && cssText === this.draftCssBaseline && themeText === this.draftThemeBaseline) {
        if (this.state.draftPresetId !== preset.id) {
          this.setState({ draftPresetId: preset.id });
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
      this.setState({ hasDraft: true, draftPresetId: preset.id, lastError: null });
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
  applyPreset(preset) {
    const oldDisposers = this.activeDisposers;
    const oldId = this.state.activePresetId;
    try {
      const error = this.checkCompatibility(preset);
      if (error !== null) throw new Error(error);
      const compiled = compilePreset(preset);
      const disposers = this.mount(compiled);
      this.teardown(oldDisposers);
      this.activeDisposers = disposers;
      this.activeCompiled = this.snapshotOf(compiled);
      this.activeCssBaseline = compiled.css?.text ?? "";
      this.lastGoodPresetId = preset.id;
      this.setState({ activePresetId: preset.id, lastError: null });
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
  startDraft(preset) {
    const oldDraftDisposers = this.draftDisposers;
    try {
      const error = this.checkCompatibility(preset);
      if (error !== null) throw new Error(error);
      const compiled = compilePreset(preset);
      const disposers = this.mount(compiled);
      this.teardown(oldDraftDisposers);
      this.draftDisposers = disposers;
      this.draftTokenBaseline = { ...preset.tokens };
      this.draftCssBaseline = compiled.css?.text ?? "";
      this.draftThemeBaseline = compiled.theme !== void 0 ? canonicalJson(compiled.theme) : "";
      this.draftCompiled = this.snapshotOf(compiled);
      this.setState({ hasDraft: true, draftPresetId: preset.id, lastError: null });
      return true;
    } catch (error) {
      this.setState({ hasDraft: oldDraftDisposers.length > 0, draftPresetId: this.state.draftPresetId, lastError: messageOf(error) });
      return false;
    }
  }
  /** 替换草稿层内容（编辑中防抖调用）。 */
  updateDraft(preset) {
    return this.startDraft(preset);
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
  checkCompatibility(preset) {
    if (this.currentDshVersion === void 0) return null;
    return checkDshCompatibility(preset, this.currentDshVersion);
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
function findToken(name) {
  return catalog.entries.find((entry) => entry.name === name);
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
function externalTierOf(capabilities) {
  return capabilities === "simple" ? "simple" : "standard";
}
var DEFAULT_CAPABILITIES = "standard";
function maskOf(capabilities) {
  return CAPABILITY_MASKS[capabilities];
}

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
function findCatalogEntry(name) {
  return catalog.entries.find((entry) => entry.name === name);
}

// src/core/version.ts
var CURRENT_DSH_VERSION = "0.1.0-rc.5";
export {
  CAPABILITY_MASKS,
  CURRENT_DSH_VERSION,
  DEFAULT_CAPABILITIES,
  GROUP_ORDER,
  ID_PATTERN,
  MAX_CSS_RULES_LENGTH,
  MAX_ID_LENGTH,
  MAX_NAME_LENGTH,
  MAX_TOKENS,
  PresetEngine,
  SCHEMA_VERSION,
  catalog,
  checkDshCompatibility,
  compilePreset,
  cssRulesToText,
  externalTierOf,
  findToken,
  isAllowedCssSelector,
  isColorValue,
  isResolvableColor,
  maskOf,
  resolveTokenValue,
  validatePreset
};
