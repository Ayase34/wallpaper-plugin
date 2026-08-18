// src/node/index.ts
import { existsSync as existsSync2, mkdirSync as mkdirSync2, readFileSync as readFileSync2, readdirSync as readdirSync2, rmSync as rmSync2, writeFileSync as writeFileSync2 } from "node:fs";
import { homedir } from "node:os";
import { join as join2 } from "node:path";

// ../../../../deepseek-harness/vendor/cosmokit/src/misc.ts
function isNullable(value) {
  return value === null || value === void 0;
}
function isPlainObject(data) {
  return data && typeof data === "object" && !Array.isArray(data);
}
function filterKeys(object, filter) {
  return Object.fromEntries(Object.entries(object).filter(([key, value]) => filter(key, value)));
}
function mapValues(object, transform) {
  return Object.fromEntries(Object.entries(object).map(([key, value]) => [key, transform(value, key)]));
}
function pick(source, keys, forced) {
  if (!keys) return { ...source };
  const result = {};
  for (const key of keys) {
    if (forced || source[key] !== void 0) result[key] = source[key];
  }
  return result;
}

// ../../../../deepseek-harness/vendor/cosmokit/src/types.ts
function is(type, value) {
  if (arguments.length === 1) return (value2) => is(type, value2);
  return type in globalThis && value instanceof globalThis[type] || Object.prototype.toString.call(value).slice(8, -1) === type;
}
function isArrayBufferLike(value) {
  return is("ArrayBuffer", value) || is("SharedArrayBuffer", value);
}
function isArrayBufferSource(value) {
  return isArrayBufferLike(value) || ArrayBuffer.isView(value);
}
var Binary;
((Binary2) => {
  Binary2.is = isArrayBufferLike;
  Binary2.isSource = isArrayBufferSource;
  function fromSource(source) {
    if (ArrayBuffer.isView(source)) {
      return source.buffer.slice(source.byteOffset, source.byteOffset + source.byteLength);
    } else {
      return source;
    }
  }
  Binary2.fromSource = fromSource;
  function toBase64(source) {
    source = fromSource(source);
    if (typeof Buffer !== "undefined") {
      return Buffer.from(source).toString("base64");
    }
    let binary = "";
    const bytes = new Uint8Array(source);
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }
  Binary2.toBase64 = toBase64;
  function fromBase64(source) {
    if (typeof Buffer !== "undefined") return fromSource(Buffer.from(source, "base64"));
    return Uint8Array.from(atob(source), (c) => c.charCodeAt(0));
  }
  Binary2.fromBase64 = fromBase64;
  function toHex(source) {
    source = fromSource(source);
    if (typeof Buffer !== "undefined") return Buffer.from(source).toString("hex");
    return Array.from(new Uint8Array(source), (byte) => byte.toString(16).padStart(2, "0")).join("");
  }
  Binary2.toHex = toHex;
  function fromHex(source) {
    if (typeof Buffer !== "undefined") return fromSource(Buffer.from(source, "hex"));
    const hex = source.length % 2 === 0 ? source : source.slice(0, source.length - 1);
    const buffer = [];
    for (let i = 0; i < hex.length; i += 2) {
      buffer.push(parseInt(`${hex[i]}${hex[i + 1]}`, 16));
    }
    return Uint8Array.from(buffer).buffer;
  }
  Binary2.fromHex = fromHex;
})(Binary || (Binary = {}));
var base64ToArrayBuffer = Binary.fromBase64;
var arrayBufferToBase64 = Binary.toBase64;
var hexToArrayBuffer = Binary.fromHex;
var arrayBufferToHex = Binary.toHex;
function clone(source, refs = /* @__PURE__ */ new Map()) {
  if (!source || typeof source !== "object") return source;
  if (is("Date", source)) return new Date(source.valueOf());
  if (is("RegExp", source)) return new RegExp(source.source, source.flags);
  if (isArrayBufferLike(source)) return source.slice(0);
  if (ArrayBuffer.isView(source)) return source.buffer.slice(source.byteOffset, source.byteOffset + source.byteLength);
  const cached = refs.get(source);
  if (cached) return cached;
  if (Array.isArray(source)) {
    const result2 = [];
    refs.set(source, result2);
    source.forEach((value, index) => {
      result2[index] = Reflect.apply(clone, null, [value, refs]);
    });
    return result2;
  }
  const result = Object.create(Object.getPrototypeOf(source));
  refs.set(source, result);
  for (const key of Reflect.ownKeys(source)) {
    const descriptor = { ...Reflect.getOwnPropertyDescriptor(source, key) };
    if ("value" in descriptor) {
      descriptor.value = Reflect.apply(clone, null, [descriptor.value, refs]);
    }
    Reflect.defineProperty(result, key, descriptor);
  }
  return result;
}
function deepEqual(a, b, strict) {
  if (a === b) return true;
  if (!strict && isNullable(a) && isNullable(b)) return true;
  if (typeof a !== typeof b) return false;
  if (typeof a !== "object") return false;
  if (!a || !b) return false;
  function check(test, then) {
    return test(a) ? test(b) ? then(a, b) : false : test(b) ? false : void 0;
  }
  return check(Array.isArray, (a2, b2) => a2.length === b2.length && a2.every((item, index) => deepEqual(item, b2[index]))) ?? check(is("Date"), (a2, b2) => a2.valueOf() === b2.valueOf()) ?? check(is("RegExp"), (a2, b2) => a2.source === b2.source && a2.flags === b2.flags) ?? check(isArrayBufferLike, (a2, b2) => {
    if (a2.byteLength !== b2.byteLength) return false;
    const viewA = new Uint8Array(a2);
    const viewB = new Uint8Array(b2);
    for (let i = 0; i < viewA.length; i++) {
      if (viewA[i] !== viewB[i]) return false;
    }
    return true;
  }) ?? Object.keys({ ...a, ...b }).every((key) => deepEqual(a[key], b[key], strict));
}

// ../../../../deepseek-harness/vendor/cosmokit/src/time.ts
var Time;
((Time2) => {
  Time2.millisecond = 1;
  Time2.second = 1e3;
  Time2.minute = Time2.second * 60;
  Time2.hour = Time2.minute * 60;
  Time2.day = Time2.hour * 24;
  Time2.week = Time2.day * 7;
  let timezoneOffset = (/* @__PURE__ */ new Date()).getTimezoneOffset();
  function setTimezoneOffset(offset) {
    timezoneOffset = offset;
  }
  Time2.setTimezoneOffset = setTimezoneOffset;
  function getTimezoneOffset() {
    return timezoneOffset;
  }
  Time2.getTimezoneOffset = getTimezoneOffset;
  function getDateNumber(date2 = /* @__PURE__ */ new Date(), offset) {
    if (typeof date2 === "number") date2 = new Date(date2);
    if (offset === void 0) offset = timezoneOffset;
    return Math.floor((date2.valueOf() / Time2.minute - offset) / 1440);
  }
  Time2.getDateNumber = getDateNumber;
  function fromDateNumber(value, offset) {
    const date2 = new Date(value * Time2.day);
    if (offset === void 0) offset = timezoneOffset;
    return new Date(+date2 + offset * Time2.minute);
  }
  Time2.fromDateNumber = fromDateNumber;
  const numeric = /\d+(?:\.\d+)?/.source;
  const timeRegExp = new RegExp(`^${[
    "w(?:eek(?:s)?)?",
    "d(?:ay(?:s)?)?",
    "h(?:our(?:s)?)?",
    "m(?:in(?:ute)?(?:s)?)?",
    "s(?:ec(?:ond)?(?:s)?)?"
  ].map((unit) => `(${numeric}${unit})?`).join("")}$`);
  function parseTime(source) {
    const capture = timeRegExp.exec(source);
    if (!capture) return 0;
    return (parseFloat(capture[1]) * Time2.week || 0) + (parseFloat(capture[2]) * Time2.day || 0) + (parseFloat(capture[3]) * Time2.hour || 0) + (parseFloat(capture[4]) * Time2.minute || 0) + (parseFloat(capture[5]) * Time2.second || 0);
  }
  Time2.parseTime = parseTime;
  function parseDate(date2) {
    const parsed = parseTime(date2);
    if (parsed) {
      date2 = Date.now() + parsed;
    } else if (/^\d{1,2}(:\d{1,2}){1,2}$/.test(date2)) {
      date2 = `${(/* @__PURE__ */ new Date()).toLocaleDateString()}-${date2}`;
    } else if (/^\d{1,2}-\d{1,2}-\d{1,2}(:\d{1,2}){1,2}$/.test(date2)) {
      date2 = `${(/* @__PURE__ */ new Date()).getFullYear()}-${date2}`;
    }
    return date2 ? new Date(date2) : /* @__PURE__ */ new Date();
  }
  Time2.parseDate = parseDate;
  function format(ms) {
    const abs = Math.abs(ms);
    if (abs >= Time2.day - Time2.hour / 2) {
      return Math.round(ms / Time2.day) + "d";
    } else if (abs >= Time2.hour - Time2.minute / 2) {
      return Math.round(ms / Time2.hour) + "h";
    } else if (abs >= Time2.minute - Time2.second / 2) {
      return Math.round(ms / Time2.minute) + "m";
    } else if (abs >= Time2.second) {
      return Math.round(ms / Time2.second) + "s";
    }
    return ms + "ms";
  }
  Time2.format = format;
  function toDigits(source, length = 2) {
    return source.toString().padStart(length, "0");
  }
  Time2.toDigits = toDigits;
  function template(template2, time = /* @__PURE__ */ new Date()) {
    return template2.replace("yyyy", time.getFullYear().toString()).replace("yy", time.getFullYear().toString().slice(2)).replace("MM", toDigits(time.getMonth() + 1)).replace("dd", toDigits(time.getDate())).replace("hh", toDigits(time.getHours())).replace("mm", toDigits(time.getMinutes())).replace("ss", toDigits(time.getSeconds())).replace("SSS", toDigits(time.getMilliseconds(), 3));
  }
  Time2.template = template;
})(Time || (Time = {}));

// ../../../../deepseek-harness/vendor/schemastery/src/index.ts
var kSchema = /* @__PURE__ */ Symbol.for("schemastery");
var kValidationError = /* @__PURE__ */ Symbol.for("ValidationError");
globalThis.__schemastery_index__ ??= 0;
globalThis.__schemastery_refs__ = void 0;
var ValidationError = class extends TypeError {
  constructor(message, options) {
    let prefix = "$";
    for (const segment of options.path || []) {
      if (typeof segment === "string") {
        prefix += "." + segment;
      } else if (typeof segment === "number") {
        prefix += "[" + segment + "]";
      } else if (typeof segment === "symbol") {
        prefix += `[Symbol(${segment.toString()})]`;
      }
    }
    if (prefix.startsWith(".")) prefix = prefix.slice(1);
    super((prefix === "$" ? "" : `${prefix} `) + message);
    this.options = options;
  }
  options;
  name = "ValidationError";
  static is(error) {
    return !!error?.[kValidationError];
  }
};
Object.defineProperty(ValidationError.prototype, kValidationError, {
  value: true
});
var Schema = function(options) {
  const schema = function(data, options2 = {}) {
    return Schema.resolve(data, schema, options2)[0];
  };
  if (options.refs) {
    const refs = mapValues(options.refs, (options2) => new Schema(options2));
    const getRef = (uid) => refs[uid];
    for (const key in refs) {
      const options2 = refs[key];
      options2.sKey = getRef(options2.sKey);
      options2.inner = getRef(options2.inner);
      options2.list = options2.list && options2.list.map(getRef);
      options2.dict = options2.dict && mapValues(options2.dict, getRef);
    }
    return refs[options.uid];
  }
  Object.assign(schema, options);
  if (typeof schema.callback === "string") {
    try {
      schema.callback = new Function("return " + schema.callback)();
    } catch {
    }
  }
  Object.defineProperty(schema, "uid", { value: globalThis.__schemastery_index__++ });
  Object.setPrototypeOf(schema, Schema.prototype);
  schema.meta ||= {};
  schema.toString = schema.toString.bind(schema);
  return schema;
};
Schema.prototype = Object.create(Function.prototype);
Schema.prototype[kSchema] = true;
Object.defineProperty(Schema.prototype, "~standard", {
  get() {
    return {
      version: 1,
      vendor: "schemastery",
      validate: (value) => {
        try {
          return { value: Schema.resolve(value, this, {})[0] };
        } catch (error) {
          if (ValidationError.is(error)) {
            return { issues: [{ message: error.message, path: error.options.path }] };
          }
          throw error;
        }
      }
    };
  }
});
Schema.ValidationError = ValidationError;
Schema.prototype.toJSON = function toJSON() {
  if (globalThis.__schemastery_refs__) {
    globalThis.__schemastery_refs__[this.uid] ??= JSON.parse(JSON.stringify({ ...this }));
    return this.uid;
  }
  globalThis.__schemastery_refs__ = { [this.uid]: { ...this } };
  globalThis.__schemastery_refs__[this.uid] = JSON.parse(JSON.stringify({ ...this }));
  const result = { uid: this.uid, refs: globalThis.__schemastery_refs__ };
  globalThis.__schemastery_refs__ = void 0;
  return result;
};
Schema.prototype.set = function set(key, value) {
  this.dict[key] = value;
  return this;
};
Schema.prototype.push = function push(value) {
  this.list.push(value);
  return this;
};
function mergeDesc(original, messages) {
  const result = typeof original === "string" ? { "": original } : { ...original };
  for (const locale in messages) {
    const value = messages[locale];
    if (value?.$description || value?.$desc) {
      result[locale] = value.$description || value.$desc;
    } else if (typeof value === "string") {
      result[locale] = value;
    }
  }
  return result;
}
function getInner(value) {
  return value?.$value ?? value?.$inner;
}
function extractKeys(data) {
  return filterKeys(data ?? {}, (key) => !key.startsWith("$"));
}
Schema.prototype.i18n = function i18n(messages) {
  const schema = Schema(this);
  const desc = mergeDesc(schema.meta.description, messages);
  if (Object.keys(desc).length) schema.meta.description = desc;
  if (schema.dict) {
    schema.dict = mapValues(schema.dict, (inner, key) => {
      return inner.i18n(mapValues(messages, (data) => getInner(data)?.[key] ?? data?.[key]));
    });
  }
  if (schema.list) {
    schema.list = schema.list.map((inner, index) => {
      return inner.i18n(mapValues(messages, (data = {}) => {
        if (Array.isArray(getInner(data))) return getInner(data)[index];
        if (Array.isArray(data)) return data[index];
        return extractKeys(data);
      }));
    });
  }
  if (schema.inner) {
    schema.inner = schema.inner.i18n(mapValues(messages, (data) => {
      if (getInner(data)) return getInner(data);
      return extractKeys(data);
    }));
  }
  if (schema.sKey) {
    schema.sKey = schema.sKey.i18n(mapValues(messages, (data) => data?.$key));
  }
  return schema;
};
Schema.prototype.extra = function extra(key, value) {
  const schema = Schema(this);
  schema.meta = { ...schema.meta, [key]: value };
  return schema;
};
for (const key of ["required", "disabled", "collapse", "hidden", "loose"]) {
  Object.assign(Schema.prototype, {
    [key](value = true) {
      const schema = Schema(this);
      schema.meta = { ...schema.meta, [key]: value };
      return schema;
    }
  });
}
Schema.prototype.deprecated = function deprecated() {
  const schema = Schema(this);
  schema.meta.badges ||= [];
  schema.meta.badges.push({ text: "deprecated", type: "danger" });
  return schema;
};
Schema.prototype.experimental = function experimental() {
  const schema = Schema(this);
  schema.meta.badges ||= [];
  schema.meta.badges.push({ text: "experimental", type: "warning" });
  return schema;
};
Schema.prototype.pattern = function pattern(regexp) {
  const schema = Schema(this);
  const pattern2 = pick(regexp, ["source", "flags"]);
  schema.meta = { ...schema.meta, pattern: pattern2 };
  return schema;
};
Schema.prototype.simplify = function simplify(value) {
  if (deepEqual(value, this.meta.default, this.type === "dict")) return null;
  if (isNullable(value)) return value;
  if (this.type === "object" || this.type === "dict") {
    const result = {};
    for (const key in value) {
      const schema = this.type === "object" ? this.dict[key] : this.inner;
      const item = schema?.simplify(value[key]);
      if (this.type === "dict" || !isNullable(item)) result[key] = item;
    }
    if (deepEqual(result, this.meta.default, this.type === "dict")) return null;
    return result;
  } else if (this.type === "array" || this.type === "tuple") {
    const result = [];
    value.forEach((value2, index) => {
      const schema = this.type === "array" ? this.inner : this.list[index];
      const item = schema ? schema.simplify(value2) : value2;
      result.push(item);
    });
    return result;
  } else if (this.type === "intersect") {
    const result = {};
    for (const item of this.list) {
      Object.assign(result, item.simplify(value));
    }
    return result;
  } else if (this.type === "union") {
    for (const schema of this.list) {
      try {
        Schema.resolve(value, schema, {});
        return schema.simplify(value);
      } catch {
      }
    }
  }
  return value;
};
Schema.prototype.toString = function toString(inline) {
  return formatters[this.type]?.(this, inline) ?? `Schema<${this.type}>`;
};
Schema.prototype.role = function role(role, extra2) {
  const schema = Schema(this);
  schema.meta = { ...schema.meta, role, extra: extra2 };
  return schema;
};
for (const key of ["default", "link", "comment", "description", "max", "min", "step"]) {
  Object.assign(Schema.prototype, {
    [key](value) {
      const schema = Schema(this);
      schema.meta = { ...schema.meta, [key]: value };
      return schema;
    }
  });
}
var resolvers = {};
Schema.extend = function extend(type, resolve2) {
  resolvers[type] = resolve2;
};
Schema.resolve = function resolve(data, schema, options = {}, strict = false) {
  if (!schema) return [data];
  if (options.ignore?.(data, schema)) return [data];
  if (isNullable(data) && schema.type !== "lazy") {
    if (schema.meta.required) throw new ValidationError(`missing required value`, options);
    let current = schema;
    let fallback = schema.meta.default;
    while (current?.type === "intersect" && isNullable(fallback)) {
      current = current.list[0];
      fallback = current?.meta.default;
    }
    if (isNullable(fallback)) return [data];
    data = clone(fallback);
  }
  const callback = resolvers[schema.type];
  if (!callback) throw new ValidationError(`unsupported type "${schema.type}"`, options);
  try {
    return callback(data, schema, options, strict);
  } catch (error) {
    if (!schema.meta.loose) throw error;
    return [schema.meta.default];
  }
};
Schema.from = function from(source) {
  if (isNullable(source)) {
    return Schema.any();
  } else if (["string", "number", "boolean"].includes(typeof source)) {
    return Schema.const(source).required();
  } else if (source[kSchema]) {
    return source;
  } else if (typeof source === "function") {
    switch (source) {
      case String:
        return Schema.string().required();
      case Number:
        return Schema.number().required();
      case Boolean:
        return Schema.boolean().required();
      case Function:
        return Schema.function().required();
      default:
        return Schema.is(source).required();
    }
  } else {
    throw new TypeError(`cannot infer schema from ${source}`);
  }
};
Schema.lazy = function lazy(builder) {
  const toJSON2 = () => {
    if (!schema.inner[kSchema]) {
      schema.inner = schema.builder();
      schema.inner.meta = { ...schema.meta, ...schema.inner.meta };
    }
    return schema.inner.toJSON();
  };
  const schema = new Schema({ type: "lazy", builder, inner: { toJSON: toJSON2 } });
  return schema;
};
Schema.natural = function natural() {
  return Schema.number().step(1).min(0);
};
Schema.percent = function percent() {
  return Schema.number().step(0.01).min(0).max(1).role("slider");
};
Schema.date = function date() {
  return Schema.union([
    Schema.is(Date),
    Schema.transform(Schema.string().role("datetime"), (value, options) => {
      const date2 = new Date(value);
      if (isNaN(+date2)) throw new ValidationError(`invalid date "${value}"`, options);
      return date2;
    }, true)
  ]);
};
Schema.regExp = function regExp(flag = "") {
  return Schema.union([
    Schema.is(RegExp),
    Schema.transform(Schema.string().role("regexp", { flag }), (value, options) => {
      try {
        return new RegExp(value, flag);
      } catch (e) {
        throw new ValidationError(e.message, options);
      }
    }, true)
  ]);
};
Schema.arrayBuffer = function arrayBuffer(encoding) {
  return Schema.union([
    Schema.is(ArrayBuffer),
    Schema.is(SharedArrayBuffer),
    Schema.transform(Schema.any(), (value, options) => {
      if (Binary.isSource(value)) return Binary.fromSource(value);
      throw new ValidationError(`expected ArrayBufferSource but got ${value}`, options);
    }, true),
    ...encoding ? [Schema.transform(Schema.string(), (value, options) => {
      try {
        return encoding === "base64" ? Binary.fromBase64(value) : Binary.fromHex(value);
      } catch (e) {
        throw new ValidationError(e.message, options);
      }
    }, true)] : []
  ]);
};
Schema.extend("lazy", (data, schema, options, strict) => {
  if (!schema.inner[kSchema]) {
    schema.inner = schema.builder();
    schema.inner.meta = { ...schema.meta, ...schema.inner.meta };
  }
  return Schema.resolve(data, schema.inner, options, strict);
});
Schema.extend("any", (data) => {
  return [data];
});
Schema.extend("never", (data, _, options) => {
  throw new ValidationError(`expected nullable but got ${data}`, options);
});
Schema.extend("const", (data, { value }, options) => {
  if (deepEqual(data, value)) return [value];
  throw new ValidationError(`expected ${value} but got ${data}`, options);
});
function checkWithinRange(data, meta, description, options, skipMin = false) {
  const { max = Infinity, min = -Infinity } = meta;
  if (data > max) throw new ValidationError(`expected ${description} <= ${max} but got ${data}`, options);
  if (data < min && !skipMin) throw new ValidationError(`expected ${description} >= ${min} but got ${data}`, options);
}
Schema.extend("string", (data, { meta }, options) => {
  if (typeof data !== "string") throw new ValidationError(`expected string but got ${data}`, options);
  if (meta.pattern) {
    const regexp = new RegExp(meta.pattern.source, meta.pattern.flags);
    if (!regexp.test(data)) throw new ValidationError(`expect string to match regexp ${regexp}`, options);
  }
  checkWithinRange(data.length, meta, "string length", options);
  return [data];
});
function decimalShift(data, digits) {
  const str = data.toString();
  if (str.includes("e")) return data * Math.pow(10, digits);
  const index = str.indexOf(".");
  if (index === -1) return data * Math.pow(10, digits);
  const frac = str.slice(index + 1);
  const integer = str.slice(0, index);
  if (frac.length <= digits) return +(integer + frac.padEnd(digits, "0"));
  return +(integer + frac.slice(0, digits) + "." + frac.slice(digits));
}
function isMultipleOf(data, min, step) {
  step = Math.abs(step);
  if (!/^\d+\.\d+$/.test(step.toString())) {
    return (data - min) % step === 0;
  }
  const index = step.toString().indexOf(".");
  const digits = step.toString().slice(index + 1).length;
  return Math.abs(decimalShift(data, digits) - decimalShift(min, digits)) % decimalShift(step, digits) === 0;
}
Schema.extend("number", (data, { meta }, options) => {
  if (typeof data !== "number") throw new ValidationError(`expected number but got ${data}`, options);
  checkWithinRange(data, meta, "number", options);
  const { step } = meta;
  if (step && !isMultipleOf(data, meta.min ?? 0, step)) {
    throw new ValidationError(`expected number multiple of ${step} but got ${data}`, options);
  }
  return [data];
});
Schema.extend("boolean", (data, _, options) => {
  if (typeof data === "boolean") return [data];
  throw new ValidationError(`expected boolean but got ${data}`, options);
});
Schema.extend("bitset", (data, { bits, meta }, options) => {
  let value = 0, keys = [];
  if (typeof data === "number") {
    value = data;
    for (const key in bits) {
      if (data & bits[key]) {
        keys.push(key);
      }
    }
  } else if (Array.isArray(data)) {
    keys = data;
    for (const key of keys) {
      if (typeof key !== "string") throw new ValidationError(`expected string but got ${key}`, options);
      if (key in bits) value |= bits[key];
    }
  } else {
    throw new ValidationError(`expected number or array but got ${data}`, options);
  }
  if (value === meta.default) return [value];
  return [value, keys];
});
Schema.extend("function", (data, _, options) => {
  if (typeof data === "function") return [data];
  throw new ValidationError(`expected function but got ${data}`, options);
});
Schema.extend("is", (data, { constructor }, options) => {
  if (typeof constructor === "function") {
    if (data instanceof constructor) return [data];
    throw new ValidationError(`expected ${constructor.name} but got ${data}`, options);
  } else {
    if (isNullable(data)) {
      throw new ValidationError(`expected ${constructor} but got ${data}`, options);
    }
    let prototype = Object.getPrototypeOf(data);
    while (prototype) {
      if (prototype.constructor?.name === constructor) return [data];
      prototype = Object.getPrototypeOf(prototype);
    }
    throw new ValidationError(`expected ${constructor} but got ${data}`, options);
  }
});
function property(data, key, schema, options) {
  try {
    const [value, adapted] = Schema.resolve(data[key], schema, {
      ...options,
      path: [...options.path || [], key]
    });
    if (adapted !== void 0) data[key] = adapted;
    return value;
  } catch (e) {
    if (!options?.autofix) throw e;
    delete data[key];
    return schema.meta.default;
  }
}
Schema.extend("array", (data, { inner, meta }, options) => {
  if (!Array.isArray(data)) throw new ValidationError(`expected array but got ${data}`, options);
  checkWithinRange(data.length, meta, "array length", options, !isNullable(inner.meta.default));
  return [data.map((_, index) => property(data, index, inner, options))];
});
Schema.extend("dict", (data, { inner, sKey }, options, strict) => {
  if (!isPlainObject(data)) throw new ValidationError(`expected object but got ${data}`, options);
  const result = {};
  for (const key in data) {
    let rKey;
    try {
      rKey = Schema.resolve(key, sKey, options)[0];
    } catch (error) {
      if (strict) continue;
      throw error;
    }
    result[rKey] = property(data, key, inner, options);
    data[rKey] = data[key];
    if (key !== rKey) delete data[key];
  }
  return [result];
});
Schema.extend("tuple", (data, { list }, options, strict) => {
  if (!Array.isArray(data)) throw new ValidationError(`expected array but got ${data}`, options);
  const result = list.map((inner, index) => property(data, index, inner, options));
  if (strict) return [result];
  result.push(...data.slice(list.length));
  return [result];
});
function merge(result, data) {
  for (const key in data) {
    if (key in result) continue;
    result[key] = data[key];
  }
}
Schema.extend("object", (data, { dict }, options, strict) => {
  if (!isPlainObject(data)) throw new ValidationError(`expected object but got ${data}`, options);
  const result = {};
  for (const key in dict) {
    const value = property(data, key, dict[key], options);
    if (!isNullable(value) || key in data) {
      result[key] = value;
    }
  }
  if (!strict) merge(result, data);
  return [result];
});
Schema.extend("union", (data, { list, toString: toString2 }, options, strict) => {
  const messages = [];
  for (const inner of list) {
    try {
      return Schema.resolve(data, inner, options, strict);
    } catch (error) {
      messages.push(error);
    }
  }
  throw new ValidationError(`expected ${toString2()} but got ${JSON.stringify(data)}`, options);
});
Schema.extend("intersect", (data, { list, toString: toString2 }, options, strict) => {
  if (!list.length) return [data];
  let result;
  for (const inner of list) {
    const value = Schema.resolve(data, inner, options, true)[0];
    if (isNullable(value)) continue;
    if (isNullable(result)) {
      result = value;
    } else if (typeof result !== typeof value) {
      throw new ValidationError(`expected ${toString2()} but got ${JSON.stringify(data)}`, options);
    } else if (typeof value === "object") {
      merge(result ??= {}, value);
    } else if (result !== value) {
      throw new ValidationError(`expected ${toString2()} but got ${JSON.stringify(data)}`, options);
    }
  }
  if (!strict && isPlainObject(data)) merge(result, data);
  return [result];
});
Schema.extend("transform", (data, { inner, callback, preserve }, options) => {
  const [result, adapted = data] = Schema.resolve(data, inner, options, true);
  if (preserve) {
    return [callback(result)];
  } else {
    return [callback(result), callback(adapted)];
  }
});
var formatters = {};
function defineMethod(name2, keys, format) {
  formatters[name2] = format;
  Object.assign(Schema, {
    [name2](...args) {
      const schema = new Schema({ type: name2 });
      keys.forEach((key, index) => {
        switch (key) {
          case "sKey":
            schema.sKey = args[index] ?? Schema.string();
            break;
          case "inner":
            schema.inner = Schema.from(args[index]);
            break;
          case "list":
            schema.list = args[index].map(Schema.from);
            break;
          case "dict":
            schema.dict = mapValues(args[index], Schema.from);
            break;
          case "bits": {
            schema.bits = {};
            for (const key2 in args[index]) {
              if (typeof args[index][key2] !== "number") continue;
              schema.bits[key2] = args[index][key2];
            }
            break;
          }
          case "callback": {
            const callback = schema.callback = args[index];
            callback["toJSON"] ||= () => callback.toString();
            break;
          }
          case "constructor": {
            const constructor = schema.constructor = args[index];
            if (typeof constructor === "function") {
              ;
              constructor["toJSON"] ||= () => constructor["name"];
            }
            break;
          }
          default:
            schema[key] = args[index];
        }
      });
      if (name2 === "object" || name2 === "dict") {
        schema.meta.default = {};
      } else if (name2 === "array" || name2 === "tuple") {
        schema.meta.default = [];
      } else if (name2 === "bitset") {
        schema.meta.default = 0;
      }
      return schema;
    }
  });
}
defineMethod("is", ["constructor"], ({ constructor }) => {
  if (typeof constructor === "function") {
    return constructor.name;
  } else {
    return constructor;
  }
});
defineMethod("any", [], () => "any");
defineMethod("never", [], () => "never");
defineMethod("const", ["value"], ({ value }) => typeof value === "string" ? JSON.stringify(value) : value);
defineMethod("string", [], () => "string");
defineMethod("number", [], () => "number");
defineMethod("boolean", [], () => "boolean");
defineMethod("bitset", ["bits"], () => "bitset");
defineMethod("function", [], () => "function");
defineMethod("array", ["inner"], ({ inner }) => `${inner.toString(true)}[]`);
defineMethod("dict", ["inner", "sKey"], ({ inner, sKey }) => `{ [key: ${sKey.toString()}]: ${inner.toString()} }`);
defineMethod("tuple", ["list"], ({ list }) => `[${list.map((inner) => inner.toString()).join(", ")}]`);
defineMethod("object", ["dict"], ({ dict }) => {
  if (Object.keys(dict).length === 0) return "{}";
  return `{ ${Object.entries(dict).map(([key, inner]) => {
    return `${key}${inner.meta.required ? "" : "?"}: ${inner.toString()}`;
  }).join(", ")} }`;
});
defineMethod("union", ["list"], ({ list }, inline) => {
  const result = list.map(({ toString: format }) => format()).join(" | ");
  return inline ? `(${result})` : result;
});
defineMethod("intersect", ["list"], ({ list }) => {
  return `${list.map((inner) => inner.toString(true)).join(" & ")}`;
});
defineMethod("transform", ["inner", "callback", "preserve"], ({ inner }, isInner) => inner.toString(isInner));
var src_default = Schema;

// src/core/widgets.ts
var MAX_ASSETS = 100;
var MAX_ASSET_FILE_SIZE = 20 * 1024 * 1024;
var MAX_ASSET_DATAURL_LENGTH = 28e6;
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
  const extra2 = {};
  if (isRecord(raw.extra)) {
    for (const [k, v] of Object.entries(raw.extra)) {
      if (Object.hasOwn(preset2, k)) continue;
      Object.defineProperty(extra2, k, { value: v, enumerable: true, writable: true, configurable: true });
    }
  }
  for (const [k, v] of Object.entries(raw)) {
    if (Object.hasOwn(preset2, k) || k === "schemaVersion" || k === "extra") continue;
    Object.defineProperty(extra2, k, { value: v, enumerable: true, writable: true, configurable: true });
  }
  if (Object.keys(extra2).length > 0) preset2.extra = extra2;
  return { ok: true, preset: preset2 };
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

// src/core/token-utils.ts
var MAX_RESOLVE_DEPTH = 8;
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
function findCatalogEntry(name2) {
  return catalog.entries.find((entry) => entry.name === name2);
}

// src/core/cover.ts
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

// src/node/zip-util.ts
var LOCAL_SIG = 67324752;
var CENTRAL_SIG = 33639248;
var EOCD_SIG = 101010256;
var CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n += 1) {
    let c = n;
    for (let k = 0; k < 8; k += 1) c = (c & 1) !== 0 ? 3988292384 ^ c >>> 1 : c >>> 1;
    table[n] = c >>> 0;
  }
  return table;
})();
function crc32(data) {
  let crc = 4294967295;
  for (let i = 0; i < data.length; i += 1) {
    crc = CRC_TABLE[(crc ^ data[i]) & 255] ^ crc >>> 8;
  }
  return (crc ^ 4294967295) >>> 0;
}
function encodeName(name2) {
  return new TextEncoder().encode(name2);
}
function zipStore(entries) {
  const chunks = [];
  const central = [];
  let offset = 0;
  for (const entry of entries) {
    const nameBytes = encodeName(entry.name);
    const crc = crc32(entry.data);
    const size = entry.data.length;
    const header = new Uint8Array(30);
    const dv = new DataView(header.buffer);
    dv.setUint32(0, LOCAL_SIG, true);
    dv.setUint16(4, 20, true);
    dv.setUint16(6, 0, true);
    dv.setUint16(8, 0, true);
    dv.setUint16(10, 0, true);
    dv.setUint16(12, 33, true);
    dv.setUint32(14, crc, true);
    dv.setUint32(18, size, true);
    dv.setUint32(22, size, true);
    dv.setUint16(26, nameBytes.length, true);
    dv.setUint16(28, 0, true);
    chunks.push(header, nameBytes, entry.data);
    const cd = new Uint8Array(46);
    const cdv = new DataView(cd.buffer);
    cdv.setUint32(0, CENTRAL_SIG, true);
    cdv.setUint16(4, 20, true);
    cdv.setUint16(6, 20, true);
    cdv.setUint16(8, 0, true);
    cdv.setUint16(10, 0, true);
    cdv.setUint16(12, 0, true);
    cdv.setUint16(14, 33, true);
    cdv.setUint32(16, crc, true);
    cdv.setUint32(20, size, true);
    cdv.setUint32(24, size, true);
    cdv.setUint16(28, nameBytes.length, true);
    cdv.setUint16(30, 0, true);
    cdv.setUint16(32, 0, true);
    cdv.setUint16(34, 0, true);
    cdv.setUint16(36, 0, true);
    cdv.setUint32(38, 0, true);
    cdv.setUint32(42, offset, true);
    central.push(cd, nameBytes);
    offset += header.length + nameBytes.length + size;
  }
  const cdSize = central.reduce((sum, chunk) => sum + chunk.length, 0);
  const eocd = new Uint8Array(22);
  const edv = new DataView(eocd.buffer);
  edv.setUint32(0, EOCD_SIG, true);
  edv.setUint16(4, 0, true);
  edv.setUint16(6, 0, true);
  edv.setUint16(8, entries.length, true);
  edv.setUint16(10, entries.length, true);
  edv.setUint32(12, cdSize, true);
  edv.setUint32(16, offset, true);
  edv.setUint16(20, 0, true);
  const total = offset + cdSize + eocd.length;
  const out = new Uint8Array(total);
  let pos = 0;
  for (const chunk of chunks) {
    out.set(chunk, pos);
    pos += chunk.length;
  }
  for (const chunk of central) {
    out.set(chunk, pos);
    pos += chunk.length;
  }
  out.set(eocd, pos);
  return out;
}
function parseZip(buffer) {
  const errors = [];
  const entries = [];
  const min = buffer.length - 22 - 65535;
  const start = Math.max(0, min);
  let eocdIndex = -1;
  for (let i = buffer.length - 22; i >= start; i -= 1) {
    if (buffer[i] === 80 && buffer[i + 1] === 75 && buffer[i + 2] === 5 && buffer[i + 3] === 6) {
      eocdIndex = i;
      break;
    }
  }
  if (eocdIndex < 0) {
    errors.push("\u4E0D\u662F\u5408\u6CD5\u7684 ZIP \u6587\u4EF6\uFF08\u7F3A\u5C11 EOCD\uFF09");
    return { entries, errors };
  }
  const edv = new DataView(buffer.buffer, buffer.byteOffset + eocdIndex, 22);
  const entryCount = edv.getUint16(10, true);
  let cdOffset = edv.getUint32(16, true);
  for (let i = 0; i < entryCount; i += 1) {
    if (cdOffset + 46 > buffer.length) {
      errors.push(`\u4E2D\u592E\u76EE\u5F55\u6761\u76EE ${i} \u8D8A\u754C`);
      break;
    }
    const cdv = new DataView(buffer.buffer, buffer.byteOffset + cdOffset, 46);
    if (cdv.getUint32(0, true) !== CENTRAL_SIG) {
      errors.push(`\u4E2D\u592E\u76EE\u5F55\u6761\u76EE ${i} \u7B7E\u540D\u9519\u8BEF`);
      break;
    }
    const method = cdv.getUint16(10, true);
    const size = cdv.getUint32(24, true);
    const nameLen = cdv.getUint16(28, true);
    const extraLen = cdv.getUint16(30, true);
    const commentLen = cdv.getUint16(32, true);
    const localOffset = cdv.getUint32(42, true);
    const nameBytes = buffer.slice(cdOffset + 46, cdOffset + 46 + nameLen);
    const name2 = new TextDecoder().decode(nameBytes);
    if (method !== 0) {
      errors.push(`\u6761\u76EE ${name2} \u4F7F\u7528\u538B\u7F29\uFF08method ${method}\uFF09\uFF0C\u4EC5\u652F\u6301 store\u2014\u2014\u5DF2\u8DF3\u8FC7`);
    } else if (localOffset + 30 + nameLen + extraLen + size <= buffer.length) {
      const dataStart = localOffset + 30 + nameLen + extraLen;
      const data = buffer.slice(dataStart, dataStart + size);
      entries.push({ name: name2, data });
    } else {
      errors.push(`\u6761\u76EE ${name2} \u6570\u636E\u8D8A\u754C`);
    }
    cdOffset += 46 + nameLen + extraLen + commentLen;
  }
  return { entries, errors };
}

// src/node/tools.ts
import { existsSync, mkdirSync, readdirSync, readFileSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// src/core/knobs.ts
var KNOB_CATEGORIES = [
  { id: "spatial", name: "\u7A7A\u95F4\u5B9A\u4F4D", description: "\u754C\u9762\u5404\u533A\u57DF\u7684\u5E95\u8272\u4E0E\u6D6E\u5C42" },
  { id: "layers", name: "\u80CC\u666F\u5C42\u6B21", description: "\u8FB9\u6846\u4E0E\u5206\u9694" },
  { id: "accent", name: "\u5F3A\u8C03\u8272", description: "\u54C1\u724C\u4E0E\u4E3B\u64CD\u4F5C" },
  { id: "text", name: "\u6587\u5B57\u53EF\u8BFB\u6027", description: "\u6587\u5B57\u989C\u8272\u4E0E\u5B57\u4F53" },
  { id: "feedback", name: "\u4EA4\u4E92\u53CD\u9988", description: "\u72B6\u6001\u4E0E\u60AC\u505C" },
  { id: "layout", name: "\u5E03\u5C40\u4E0E\u6392\u7248", description: "\u5BBD\u5EA6\u4E0E\u9634\u5F71" }
];
var KNOBS = [
  // —— 空间定位（界面分区底色） ——
  { id: "spatial-bg", category: "spatial", name: "\u80CC\u666F", description: "\u6574\u4E2A\u754C\u9762\u7684\u5E95\u8272\uFF0C\u6700\u5F71\u54CD\u89C2\u611F", control: "color", bundle: ["--dsw-alias-bg-base"] },
  { id: "spatial-layer", category: "spatial", name: "\u62AC\u5347\u9762", description: "\u5361\u7247\u3001\u8F93\u5165\u6846\u3001\u5F39\u5C42\u6D6E\u51FA\u7684\u5C42\u6B21\u8272", control: "color", bundle: ["--dsw-alias-bg-layer-1", "--dsw-alias-bg-layer-2"] },
  { id: "spatial-sidebar", category: "spatial", name: "\u4FA7\u8FB9\u680F", description: "\u5DE6\u4FA7\u5BFC\u822A\u680F\u80CC\u666F", control: "color", bundle: ["--dsw-specific-sidebar-fill"] },
  { id: "spatial-bubble", category: "spatial", name: "\u5BF9\u8BDD\u6C14\u6CE1", description: "\u4F1A\u8BDD\u533A\u6D88\u606F\u6C14\u6CE1\u5E95\u8272", control: "color", bundle: ["--dsw-specific-bubble"] },
  { id: "spatial-input", category: "spatial", name: "\u8F93\u5165\u6846", description: "\u5E95\u90E8\u8F93\u5165\u5361\u5E95\u8272", control: "color", bundle: ["--dsw-specific-input-major"] },
  { id: "spatial-menu", category: "spatial", name: "\u83DC\u5355\u4E0E\u60AC\u6D6E\u5C42", description: "\u83DC\u5355\u3001\u63D0\u793A\u3001\u9009\u62E9\u5668\u3001\u906E\u7F69", control: "color", bundle: ["--dsw-specific-menu", "--dsw-specific-tip", "--dsw-specific-selector", "--dsw-alias-bg-overlay"] },
  // —— 背景层次（边框与分隔） ——
  { id: "border-level", category: "layers", name: "\u8FB9\u6846\u6DF1\u6D45", description: "\u5361\u7247\u4E0E\u5206\u533A\u7684\u4E00\u7EA7\u8FB9\u6846\uFF08\u7EC6\u5206\u7559\u9AD8\u7EA7\u4EE4\u724C\uFF09", control: "color", bundle: ["--dsw-alias-border-l2"] },
  // —— 强调色（品牌与主操作） ——
  { id: "accent-brand", category: "accent", name: "\u4E3B\u8272", description: "\u54C1\u724C\u4E3B\u8272\u3001\u4E3B\u6309\u94AE\u3001\u4E1A\u52A1\u72B6\u6001\u4E00\u6B21\u5168\u6539", control: "color", bundle: ["--dsw-alias-brand-primary", "--dsw-alias-button-info-fill", "--dsw-alias-state-business-primary"] },
  { id: "accent-hover", category: "accent", name: "\u60AC\u505C\u8272", description: "\u4E3B\u6309\u94AE\u60AC\u505C\u53CD\u9988", control: "color", bundle: ["--dsw-alias-button-info-hover"] },
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
  // —— 布局与排版 ——
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
  },
  {
    id: "shadow-level",
    category: "layout",
    name: "\u9634\u5F71\u6863",
    description: "\u5361\u7247\u6D6E\u8D77\u9634\u5F71\u5F3A\u5EA6",
    control: "select",
    bundle: ["--dsw-shadow-lv2"],
    options: [
      { label: "\u65E0", value: "" },
      { label: "\u67D4\u548C", value: "0 4px 12px 0 rgba(0, 0, 0, 0.02), 0 2px 8px 0 rgba(0, 0, 0, 0.04)" },
      { label: "\u660E\u663E", value: "0 8px 24px 0 rgba(0, 0, 0, 0.08), 0 4px 12px 0 rgba(0, 0, 0, 0.12)" }
    ]
  }
];

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
function isDemoPreset(id) {
  return DEMO_PRESETS.some((preset2) => preset2.id === id);
}

// src/core/css-templates.ts
var CSS_ANCHORS = [
  { selector: "[data-chat-flow]", label: "\u4F1A\u8BDD\u533A\u80CC\u666F", note: "\u4F1A\u8BDD\u6D88\u606F\u6D41\u6574\u4F53\u80CC\u666F\uFF08\u6700\u5E38\u7528\uFF09" },
  { selector: "[data-composer-seat]", label: "\u8F93\u5165\u533A\u5361\u7247", note: "\u5E95\u90E8\u8F93\u5165\u6846\u533A\u57DF" },
  { selector: "[data-ds-dark-theme]", label: "\u6DF1\u8272\u6A21\u5F0F\u5FAE\u8C03", note: "\u6DF1\u8272\u6A21\u5F0F\u4E0B\u6574\u9875\uFF08html \u7EA7\u5C5E\u6027\u9009\u62E9\u5668\uFF09" },
  { selector: "[data-conversation-scroll]", label: "\u6D88\u606F\u6EDA\u52A8\u533A", note: "\u4F1A\u8BDD\u6EDA\u52A8\u5BB9\u5668\uFF08scrollbar \u7B49\uFF09" }
];

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
function channelLinear(c) {
  const s = c / 255;
  return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
}
function relativeLuminance(rgb) {
  return 0.2126 * channelLinear(rgb.r) + 0.7152 * channelLinear(rgb.g) + 0.0722 * channelLinear(rgb.b);
}
function contrastRatio(fg, bg) {
  const l1 = relativeLuminance(fg);
  const l2 = relativeLuminance(bg);
  const [hi, lo] = l1 >= l2 ? [l1, l2] : [l2, l1];
  return (hi + 0.05) / (lo + 0.05);
}
function contrastGrade(ratio) {
  if (ratio >= 7) return "AAA";
  if (ratio >= 4.5) return "AA";
  if (ratio >= 3) return "AA-large";
  return "FAIL";
}
function contrastForValues(fg, bg) {
  const f = parseRgbColor(fg);
  const b = parseRgbColor(bg);
  if (f === null || b === null) return null;
  const ratio = contrastRatio(f, b);
  return { ratio, grade: contrastGrade(ratio) };
}

// src/core/precheck.ts
var TEXT_PAIRS = [
  { fg: "--dsw-alias-label-primary", bg: "--dsw-alias-bg-base", label: "\u4E3B\u6587\u5B57" },
  { fg: "--dsw-alias-label-secondary", bg: "--dsw-alias-bg-base", label: "\u6B21\u6587\u5B57" },
  { fg: "--dsw-alias-label-tertiary", bg: "--dsw-alias-bg-base", label: "\u8F85\u52A9\u6587\u5B57" },
  { fg: "--dsw-alias-label-primary", bg: "--dsw-alias-bg-layer-1", label: "\u5361\u7247\u6D6E\u5C42\u6587\u5B57" },
  { fg: "--dsw-alias-label-primary", bg: "--dsw-alias-bg-layer-2", label: "\u9AD8\u5C42\u6D6E\u5C42\u6587\u5B57" },
  { fg: "--dsw-alias-label-primary", bg: "--dsw-specific-sidebar-fill", label: "\u4FA7\u680F\u6587\u5B57" },
  { fg: "--dsw-alias-label-primary", bg: "--dsw-specific-bubble", label: "\u6C14\u6CE1\u6587\u5B57" },
  { fg: "--dsw-alias-label-primary", bg: "--dsw-specific-input-major", label: "\u8F93\u5165\u6846\u6587\u5B57" },
  { fg: "--dsw-alias-label-primary", bg: "--dsw-specific-menu", label: "\u83DC\u5355/\u63D0\u793A\u6587\u5B57" }
];
var BUTTON_PAIRS = [
  { bg: "--dsw-alias-button-primary-fill", label: "\u4E3B\u6309\u94AE" },
  { bg: "--dsw-alias-button-info-fill", label: "\u4FE1\u606F\u6309\u94AE" },
  { bg: "--dsw-alias-state-business-primary", label: "\u4E1A\u52A1\u72B6\u6001" }
];
var KNOWN_PREFIXES = ["--dsh-", "--ds-"];
function resolveColor(name2, scheme, tokens) {
  const override = tokens[name2];
  let value = override !== void 0 ? override[scheme] : "";
  let fromCandidate = override !== void 0;
  if (value === "") {
    const entry = catalog.entries.find((e) => e.name === name2);
    if (entry === void 0) return { color: "", fromCandidate };
    value = scheme === "light" ? entry.light : entry.dark;
  }
  for (let depth = 0; depth < 8; depth += 1) {
    const m = /^var\(\s*(--[\w-]+)/.exec(value.trim());
    if (m === null) return { color: value, fromCandidate };
    const ref = tokens[m[1]];
    if (ref !== void 0) {
      fromCandidate = true;
      value = ref[scheme];
      continue;
    }
    const entry = catalog.entries.find((e) => e.name === m[1]);
    if (entry === void 0) return { color: value, fromCandidate };
    const next = (scheme === "dark" ? entry.dark : entry.light).trim();
    if (next === value) return { color: value, fromCandidate };
    value = next;
  }
  return { color: value, fromCandidate };
}
function precheckPreset(tokens, css, extra2) {
  const issues = [];
  const pairs = {};
  for (const [name2, value] of Object.entries(tokens)) {
    if (!name2.startsWith("--")) {
      issues.push({ token: name2, severity: "error", message: "\u4EE4\u724C\u540D\u5FC5\u987B\u4EE5 -- \u5F00\u5934" });
      continue;
    }
    if (typeof value !== "object" || value === null || Array.isArray(value) || typeof value.light !== "string" || typeof value.dark !== "string") {
      issues.push({ token: name2, severity: "error", message: "\u503C\u5FC5\u987B\u662F { light, dark } \u53CC\u503C\u5B57\u7B26\u4E32" });
      continue;
    }
    pairs[name2] = { light: value.light, dark: value.dark };
    const known = catalog.entries.some((e) => e.name === name2) || KNOWN_PREFIXES.some((p) => name2.startsWith(p));
    if (!known) {
      issues.push({ token: name2, severity: "warn", message: "\u76EE\u5F55\u5916\u4EE4\u724C\uFF08\u754C\u9762\u53EF\u80FD\u4E0D\u751F\u6548\uFF0C\u5148\u7528 preset_catalog \u67E5\u8BC1\uFF09" });
    }
  }
  const fullLoad = validatePreset({
    schemaVersion: 1,
    id: "precheck",
    name: "precheck",
    edition: "standard",
    tokens: pairs,
    ...css !== void 0 ? { css } : {},
    ...extra2?.assets !== void 0 ? { assets: extra2.assets } : {},
    ...extra2?.widgets !== void 0 ? { widgets: extra2.widgets } : {},
    ...extra2?.theme !== void 0 ? { theme: extra2.theme } : {}
  });
  if (!fullLoad.ok) {
    for (const error of fullLoad.errors) issues.push({ token: "\u8F7D\u8377", severity: "error", message: error });
  }
  let contrastIssues = 0;
  const checkPair = (fgName, bgName, label, threshold) => {
    for (const scheme of ["light", "dark"]) {
      const fg = resolveColor(fgName, scheme, pairs);
      const bg = resolveColor(bgName, scheme, pairs);
      const result = fg.color !== "" && bg.color !== "" ? contrastForValues(fg.color, bg.color) : null;
      if (result === null) {
        if (fg.fromCandidate || bg.fromCandidate) {
          issues.push({
            token: fgName,
            scheme,
            severity: "warn",
            message: `\u989C\u8272\u65E0\u6CD5\u89E3\u6790\uFF08${fgName}=${fg.color || "\u7A7A"} / ${bgName}=${bg.color || "\u7A7A"}\uFF09\uFF0C\u5BF9\u6BD4\u5EA6\u8DF3\u8FC7`
          });
        }
        continue;
      }
      if (threshold === "text") {
        if (result.grade === "FAIL" || result.grade === "AA-large") {
          contrastIssues += 1;
          issues.push({
            token: fgName,
            scheme,
            severity: "warn",
            message: `${label}\u5BF9\u6BD4\u5EA6 ${result.ratio.toFixed(1)}:1 ${result.grade === "FAIL" ? "\u4E0D\u8DB3\uFF08FAIL\uFF0C\u5EFA\u8BAE \u22654.5:1\uFF09" : "\u4EC5\u8FBE\u6807\u5927\u6587\u672C\uFF08AA-large\uFF0C\u5EFA\u8BAE \u22654.5:1\uFF09"}`
          });
        }
      } else if (result.grade === "FAIL") {
        contrastIssues += 1;
        issues.push({
          token: fgName,
          scheme,
          severity: "warn",
          message: `${label}\u6587\u5B57\u5BF9\u6BD4\u5EA6 ${result.ratio.toFixed(1)}:1 \u4E0D\u8DB3\uFF08UI \u7EC4\u4EF6\u6807\u51C6 \u22653:1\uFF09`
        });
      }
    }
  };
  for (const pair of TEXT_PAIRS) checkPair(pair.fg, pair.bg, pair.label, "text");
  for (const pair of BUTTON_PAIRS) checkPair("--dsw-alias-label-primary-foreground", pair.bg, pair.label, "component");
  const bgLight = resolveColor("--dsw-alias-bg-base", "light", pairs);
  const bgDark = resolveColor("--dsw-alias-bg-base", "dark", pairs);
  if (bgLight.color !== "" && bgDark.color !== "") {
    const lLight = luminanceOf(bgLight.color);
    const lDark = luminanceOf(bgDark.color);
    if (lLight !== null && lDark !== null && lLight < lDark) {
      issues.push({
        token: "--dsw-alias-bg-base",
        severity: "warn",
        message: "\u660E\u6697\u53CD\u8F6C\uFF1A\u4EAE\u8272\u6A21\u5F0F\u7684\u5E95\u8272\u6BD4\u6697\u8272\u6A21\u5F0F\u66F4\u6DF1\uFF08\u901A\u5E38\u5E94 light \u4EAE / dark \u6697\uFF09"
      });
    }
  }
  const unknownTokens = issues.filter((i) => i.message.includes("\u76EE\u5F55\u5916\u4EE4\u724C")).length;
  return { ok: issues.every((i) => i.severity !== "error"), issues, summary: { tokenCount: Object.keys(tokens).length, unknownTokens, contrastIssues, pass: issues.every((i) => i.severity !== "error") } };
}
function luminanceOf(color) {
  const rgb = parseRgbColor(color);
  return rgb === null ? null : relativeLuminance(rgb);
}

// src/core/style-guide.ts
var STYLE_GUIDE = [
  // #82/#95：出厂预设收敛为唯一「默认」（id=default，海蓝海洋风）——风格词保留
  // 全字典（LLM 引导），demos 仅指向仍存在的预设，其余留空。
  { term: "\u6E05\u723D", guidance: "\u6D45\u8272\u5E95 + \u84DD\u8272\u7CFB\u70B9\u7F00 + \u5927\u91CF\u7559\u767D\uFF0C\u5C42\u6B21\u9760\u767D\u8272\u6D6E\u5C42", demos: ["default"] },
  { term: "\u62A4\u773C", guidance: "\u4F4E\u4EAE\u5EA6\u4F4E\u9971\u548C\uFF1A\u6696\u7EB8\u5E95\u6216\u84DD\u9ED1\u5E95\uFF0C\u907F\u514D\u9AD8\u9971\u548C\u5927\u9762\u79EF\u8272\uFF0C\u6587\u5B57\u5BF9\u6BD4\u4F18\u5148", demos: [] },
  { term: "\u6DF1\u591C", guidance: "\u6DF1\u84DD\u9ED1\u5E95 + \u51B7\u7070\u5C42\u6B21\uFF0C\u6C89\u7A33\u4E13\u6CE8\uFF0C\u4EAE\u8272\u6A21\u5F0F\u4FDD\u6301\u6D45\u8272", demos: ["default"] },
  { term: "\u6781\u7B80", guidance: "\u9ED1\u767D\u7070\u53BB\u5F69\u8272\uFF0C\u9760\u660E\u5EA6\u5C42\u6B21\u4E0E\u7559\u767D\uFF0C\u6700\u591A\u4E00\u4E2A\u5F3A\u8C03\u8272", demos: [] },
  { term: "\u9AD8\u5BF9\u6BD4", guidance: "\u7EAF\u9ED1\u7EAF\u767D\u5E95 + \u9AD8\u9971\u548C\u54C1\u724C\u8272\uFF0C\u6587\u5B57\u5BF9\u6BD4\u5EA6\u4F18\u5148\uFF08\u65E0\u969C\u788D\uFF09", demos: [] },
  { term: "\u9713\u8679", guidance: "\u6697\u8272\u5E95 + \u9AD8\u9971\u548C\u9713\u8679\u70B9\u7F00\uFF08\u9752\u7EFF/\u7C89\u7D2B\uFF09\uFF0C\u6C14\u6CE1\u53EF\u5E26\u8367\u5149\u611F", demos: [] },
  { term: "\u8D5B\u535A", guidance: "\u540C\u9713\u8679\uFF1A\u6697\u5E95 + \u7535\u5149\u8272\u70B9\u7F00\uFF0C\u53EF\u914D\u5408 CSS \u8865\u4E01\u505A\u6E10\u53D8", demos: [] },
  { term: "\u84B8\u6C7D\u6CE2", guidance: "\u6DF1\u7D2B\u5E95 + \u9713\u8679\u7C89\u54C1\u724C + \u6D45\u7D2B\u6C14\u6CE1\uFF0C\u590D\u53E4\u672A\u6765\u611F\uFF08\u53EF\u914D CSS \u6E10\u53D8\uFF09", demos: [] },
  { term: "\u649E\u8272", guidance: "\u7C73\u767D\u7EB8\u5F20\u5E95 + \u9AD8\u9971\u548C\u53CC\u8272\u649E\u8272\uFF08\u94B4\u84DD\xD7\u73CA\u745A / \u9752\u7EFF\xD7\u7C89\uFF09\uFF0C\u6742\u5FD7\u62FC\u8D34\u611F", demos: [] },
  { term: "\u7C89\u5F69", guidance: "\u4F4E\u9971\u548C\u7C89\u767D\u5E95 + \u73AB\u7C89/\u6DE1\u84DD\u70B9\u7F00\uFF0C\u751C\u7CFB\u67D4\u548C", demos: [] },
  { term: "\u6696\u8272", guidance: "\u7C73\u9EC4/\u6696\u7EB8\u5E95 + \u68D5\u8910\u6587\u5B57 + \u7425\u73C0\u5F3A\u8C03\uFF0C\u62A4\u773C\u6696\u8C03", demos: [] },
  { term: "\u6697\u8272", guidance: "\u6574\u4F53\u6DF1\u8272\u5E95\uFF08bg-base dark \u4E3A\u4E3B\uFF09\uFF0C\u4EAE\u8272\u6A21\u5F0F\u53EF\u4FDD\u7559\u6D45\u8272", demos: ["default"] }
];

// src/core/catalog-zh.ts
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

// src/node/tools.ts
function safePresetId(id) {
  return /^[a-z0-9][a-z0-9-]{0,63}$/.test(id);
}
function writeFileAtomic(file, data) {
  const tmp = `${file}.tmp`;
  writeFileSync(tmp, data, "utf8");
  renameSync(tmp, file);
}
function readActiveState(env) {
  try {
    const raw = JSON.parse(readFileSync(env.activeFile, "utf8"));
    return {
      activePresetId: typeof raw.activePresetId === "string" && safePresetId(raw.activePresetId) ? raw.activePresetId : null,
      revision: Number.isInteger(raw.revision) && raw.revision >= 0 ? raw.revision : 0
    };
  } catch {
    return { activePresetId: null, revision: 0 };
  }
}
function writeActiveState(env, id) {
  const prev = readActiveState(env);
  mkdirSync(env.dataDir, { recursive: true });
  writeFileAtomic(env.activeFile, JSON.stringify({ activePresetId: id, revision: prev.revision + 1 }));
}
function listLibraryPresets(env) {
  const out = [];
  let dirs = [];
  try {
    dirs = readdirSync(env.presetsDir);
  } catch {
  }
  for (const id of dirs) {
    if (!safePresetId(id)) continue;
    try {
      const raw = JSON.parse(readFileSync(join(env.presetsDir, id, "preset.json"), "utf8"));
      out.push({
        id,
        name: typeof raw.name === "string" ? raw.name : id,
        edition: typeof raw.edition === "string" ? raw.edition : "standard"
      });
    } catch {
    }
  }
  out.sort((a, b) => a.id.localeCompare(b.id));
  return out;
}
function readLibraryPreset(env, id) {
  if (!safePresetId(id)) return null;
  try {
    const raw = JSON.parse(readFileSync(join(env.presetsDir, id, "preset.json"), "utf8"));
    const result = validatePreset(raw);
    return result.ok ? result.preset : null;
  } catch {
    return null;
  }
}
function resolvablePresetId(env, id) {
  return isDemoPreset(id) || readLibraryPreset(env, id) !== null;
}
function getPresetDetail(env, id) {
  if (!safePresetId(id)) throw new Error("preset_get: \u975E\u6CD5 id");
  const library = readLibraryPreset(env, id);
  const demo = library === null ? DEMO_PRESETS.find((p) => p.id === id) ?? null : null;
  const preset2 = library ?? demo;
  if (preset2 === null) throw new Error(`preset_get: \u9884\u8BBE ${id} \u4E0D\u5B58\u5728\uFF08\u5148 preset_list\uFF09`);
  const wallpaperSizes = new Map(listWallpaperAssets(env).map((asset) => [asset.id, asset.size]));
  return {
    id: preset2.id,
    name: preset2.name,
    edition: preset2.edition,
    builtin: demo !== null,
    tokenCount: Object.keys(preset2.tokens).length,
    // #73：风格标签（style:xxx）——AI 可读出厂预设作风范例
    style: styleOf(preset2.tags),
    tokens: preset2.tokens,
    css: preset2.css ?? [],
    // #70：theme 可写后 AI 微调需读主题令牌（与预设 tokens 同结构）
    theme: preset2.theme !== void 0 ? { id: preset2.theme.id, colorScheme: preset2.theme.colorScheme, tokens: preset2.theme.tokens } : null,
    assets: (preset2.assets ?? []).map((asset) => ({
      id: asset.id,
      name: asset.name,
      mime: asset.mime,
      // 内嵌 dataUrl 用其长度；壁纸库文件引用查 meta 真实大小（缺文件 0）
      size: typeof asset.dataUrl === "string" ? asset.dataUrl.length : wallpaperSizes.get(asset.id) ?? 0
    })),
    widgets: (preset2.widgets ?? []).map((widget) => ({ id: widget.id, params: widget.params })),
    cover: preset2.cover ?? null,
    hasBackup: existsSync(join(env.presetsDir, id, "backup.json"))
  };
}
function listWallpaperAssets(env) {
  const out = [];
  let files = [];
  try {
    files = readdirSync(env.assetsDir);
  } catch {
    return out;
  }
  for (const file of files) {
    if (!file.endsWith(".json")) continue;
    const id = file.slice(0, -5);
    if (!safePresetId(id)) continue;
    try {
      const meta = JSON.parse(readFileSync(join(env.assetsDir, file), "utf8"));
      if (typeof meta.id === "string" && typeof meta.name === "string" && typeof meta.mime === "string") {
        const entry = {
          id: meta.id,
          name: meta.name,
          mime: meta.mime,
          size: typeof meta.size === "number" ? meta.size : 0
        };
        if (meta.layers !== void 0) entry.layers = meta.layers;
        out.push(entry);
      }
    } catch {
    }
  }
  out.sort((a, b) => a.id.localeCompare(b.id));
  return out;
}
function restoreBackupFile(env, id) {
  if (!safePresetId(id)) throw new Error("preset_restore_backup: \u975E\u6CD5 id");
  const backupFile = join(env.presetsDir, id, "backup.json");
  if (!existsSync(backupFile)) throw new Error(`preset_restore_backup: \u9884\u8BBE ${id} \u6CA1\u6709\u53EF\u7528\u5907\u4EFD\uFF08\u8986\u76D6\u4FDD\u5B58/\u66F4\u65B0\u540E\u624D\u4F1A\u4EA7\u751F\uFF09`);
  let backup;
  try {
    const result = validatePreset(JSON.parse(readFileSync(backupFile, "utf8")));
    if (!result.ok) throw new Error(`\u5907\u4EFD\u635F\u574F\uFF1A${result.errors[0] ?? "\u6821\u9A8C\u5931\u8D25"}`);
    backup = result.preset;
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("\u5907\u4EFD\u635F\u574F")) throw new Error(`preset_restore_backup: ${error.message}`);
    throw new Error(`preset_restore_backup: \u5907\u4EFD\u635F\u574F\uFF1A${error instanceof Error ? error.message : String(error)}`);
  }
  const current = readLibraryPreset(env, id);
  const dir = join(env.presetsDir, id);
  mkdirSync(dir, { recursive: true });
  writeFileAtomic(join(dir, "preset.json"), JSON.stringify(backup, null, 2));
  if (current !== null) writeFileAtomic(join(dir, "backup.json"), JSON.stringify(current, null, 2));
  return { name: backup.name };
}
function formatBytes(n) {
  if (n >= 1024 * 1024) return `${(n / (1024 * 1024)).toFixed(1)}MB`;
  if (n >= 1024) return `${(n / 1024).toFixed(1)}KB`;
  return `${n}B`;
}
function genId(prefix) {
  const rand = Math.floor(Math.random() * 36 ** 4).toString(36).padStart(4, "0");
  return `${prefix}-${Date.now().toString(36)}${rand}`;
}
function createPresetFile(env, input) {
  const name2 = typeof input.name === "string" ? input.name.trim() : "";
  if (name2 === "") throw new Error("preset_create: name \u5FC5\u586B");
  const id = genId("preset");
  const preset2 = {
    schemaVersion: 1,
    id,
    name: name2,
    edition: "standard",
    tokens: input.tokens
  };
  if (input.css !== void 0) preset2.css = input.css;
  if (input.assets !== void 0) preset2.assets = input.assets;
  if (input.widgets !== void 0) preset2.widgets = input.widgets;
  if (input.theme !== void 0 && input.theme !== null) {
    const theme = input.theme;
    if (typeof theme.id !== "string" || theme.colorScheme !== "light" && theme.colorScheme !== "dark") {
      throw new Error("preset_create: theme \u5FC5\u987B\u662F { id, colorScheme: light|dark, tokens? }");
    }
    preset2.theme = {
      id: theme.id.trim(),
      colorScheme: theme.colorScheme,
      tokens: theme.tokens !== void 0 ? theme.tokens : preset2.tokens
    };
  }
  const result = validatePreset(preset2);
  if (!result.ok) throw new Error(`preset_create: ${result.errors.join("\uFF1B")}`);
  mkdirSync(join(env.presetsDir, id), { recursive: true });
  writeFileAtomic(join(env.presetsDir, id, "preset.json"), JSON.stringify(result.preset, null, 2));
  return id;
}
function styleOf(tags) {
  if (!Array.isArray(tags)) return null;
  const tag = tags.find((t) => typeof t === "string" && t.startsWith("style:"));
  return tag !== void 0 ? tag.slice(6) : null;
}
function inspectState(env) {
  const active = readActiveState(env);
  let activeName = null;
  let tokenCount = 0;
  let appliedTokenNames = [];
  let found = false;
  if (active.activePresetId !== null) {
    const preset2 = readLibraryPreset(env, active.activePresetId) ?? DEMO_PRESETS.find((p) => p.id === active.activePresetId) ?? null;
    if (preset2 !== null) {
      found = true;
      activeName = preset2.name;
      tokenCount = Object.keys(preset2.tokens).length;
      appliedTokenNames = Object.keys(preset2.tokens);
    }
  }
  let tier = "standard";
  try {
    const raw = JSON.parse(readFileSync(env.configFile, "utf8"));
    if (raw.tier === "simple" || raw.tier === "standard") tier = raw.tier;
  } catch {
  }
  const out = {
    revision: active.revision,
    tier,
    tokenCount,
    appliedTokenNames
  };
  if (found && activeName !== null) {
    out.activePresetId = active.activePresetId ?? void 0;
    out.activeName = activeName;
  }
  return out;
}
function updatePresetFile(env, id, patch) {
  if (!safePresetId(id)) throw new Error("preset_update: \u975E\u6CD5 id");
  const existing = readLibraryPreset(env, id);
  if (existing === null) throw new Error(`preset_update: \u9884\u8BBE ${id} \u4E0D\u5B58\u5728`);
  const merged = { ...existing, ...existing.extra ?? {} };
  delete merged.extra;
  if (patch.name !== void 0) merged.name = patch.name;
  if (patch.tokens !== void 0) merged.tokens = patch.tokens;
  if (patch.mergeTokens !== void 0) {
    if (typeof patch.mergeTokens !== "object" || patch.mergeTokens === null || Array.isArray(patch.mergeTokens)) {
      throw new Error("preset_update: merge_tokens \u5FC5\u987B\u662F\u4EE4\u724C\u5BF9\u8C61\uFF08\u4EE4\u724C\u540D \u2192 { light, dark }\uFF09");
    }
    const base = existing.tokens ?? {};
    merged.tokens = { ...base, ...patch.mergeTokens };
  }
  if (patch.css !== void 0) merged.css = patch.css;
  if (patch.assets !== void 0) merged.assets = patch.assets;
  if (patch.widgets !== void 0) merged.widgets = patch.widgets;
  if (patch.theme !== void 0) {
    if (patch.theme === null) {
      delete merged.theme;
    } else {
      const theme = patch.theme;
      if (typeof theme.id !== "string" || theme.colorScheme !== "light" && theme.colorScheme !== "dark") {
        throw new Error("preset_update: theme \u5FC5\u987B\u662F { id, colorScheme: light|dark, tokens? } \u6216 null\uFF08\u6E05\u9664\uFF09");
      }
      merged.theme = {
        id: theme.id.trim(),
        colorScheme: theme.colorScheme,
        tokens: theme.tokens !== void 0 ? theme.tokens : merged.tokens
      };
    }
  }
  const result = validatePreset(merged);
  if (!result.ok) throw new Error(`preset_update: ${result.errors.join("\uFF1B")}`);
  const dir = join(env.presetsDir, id);
  mkdirSync(dir, { recursive: true });
  writeFileAtomic(join(dir, "preset.json"), JSON.stringify(result.preset, null, 2));
  writeFileAtomic(join(dir, "backup.json"), JSON.stringify(existing, null, 2));
  return id;
}
function deletePresetFile(env, id) {
  if (!safePresetId(id)) throw new Error("preset_delete: \u975E\u6CD5 id");
  if (isDemoPreset(id)) throw new Error("preset_delete: \u5185\u7F6E\u793A\u4F8B\u4E0D\u53EF\u5220\u9664");
  rmSync(join(env.presetsDir, id), { recursive: true, force: true });
}
var registered = false;
function isToolsRegistered() {
  return registered;
}
function createPresetToolDefs(env, defineTool) {
  return [
    defineTool({
      name: "preset_list",
      description: "\u5217\u51FA\u6240\u6709\u53EF\u7528\u7684\u754C\u9762\u5916\u89C2\u9884\u8BBE\uFF08\u5185\u7F6E\u793A\u4F8B + \u7528\u6237\u9884\u8BBE\u5E93\uFF09\uFF0C\u542B\u540D\u79F0/id/\u6863\u4F4D/\u4EE4\u724C\u6570\u2014\u2014\u4F5C\u4E3A\u63A8\u8350\u4E0E\u5E94\u7528\u7684\u76EE\u5F55\u6765\u6E90\u3002",
      parameters: {},
      output: {
        schema: {
          type: "object",
          additionalProperties: false,
          properties: {
            presets: {
              type: "array",
              required: true,
              items: {
                type: "object",
                additionalProperties: false,
                properties: {
                  id: { type: "string", required: true },
                  name: { type: "string", required: true },
                  edition: { type: "string", required: true },
                  builtin: { type: "boolean", required: true },
                  tokenCount: { type: "integer", required: true },
                  // #96（审计）：execute 返回 style 键（#73 风格参考）——additionalProperties:false
                  // 下未声明键会让宿主输出校验抛 ToolOutputError（测试 stub 掩盖了运行期失败）
                  style: { type: "string" }
                }
              }
            }
          }
        },
        render: (_args, value) => [{
          type: "text",
          // #102：render 必须携带 id——LLM 看到的是 render 文本（结构化输出不直达模型），
          // 原实现只拼名称，AI 无法按 id 继续 preset_get/apply
          text: `\u5171 ${value.presets.length} \u4E2A\u9884\u8BBE\uFF1A${value.presets.map((p) => `${p.id}\uFF08${p.name}${p.builtin ? "\uFF0C\u5185\u7F6E" : ""}\uFF09`).join("\u3001")}`
        }]
      },
      execute: () => {
        const library = listLibraryPresets(env);
        const merged = [
          ...DEMO_PRESETS.map((preset2) => ({
            id: preset2.id,
            name: preset2.name,
            edition: preset2.edition,
            builtin: true,
            tokenCount: Object.keys(preset2.tokens).length,
            // #73：风格标签（style:xxx）——AI 据此选择风格范例
            style: styleOf(preset2.tags)
          })),
          ...library.filter((item) => !isDemoPreset(item.id)).map((item) => {
            const preset2 = readLibraryPreset(env, item.id);
            const entry = {
              ...item,
              builtin: false,
              tokenCount: preset2 !== null ? Object.keys(preset2.tokens).length : 0
            };
            if (preset2 !== null) {
              const style = styleOf(preset2.tags);
              if (style !== null) entry.style = style;
            }
            return entry;
          })
        ];
        return Promise.resolve({ presets: merged });
      },
      presentCall: () => ({ card: "generic", title: "\u5217\u51FA\u5916\u89C2\u9884\u8BBE", kind: "other", rawInput: null })
    }),
    defineTool({
      name: "preset_apply",
      description: '\u5E94\u7528\u4E00\u4E2A\u5916\u89C2\u9884\u8BBE\uFF08id \u6765\u81EA preset_list\uFF09\u3002\u4E0E\u7528\u6237\u5728\u754C\u9762\u70B9\u51FB"\u5E94\u7528"\u7B49\u4EF7\uFF1A\u7ACB\u5373\u751F\u6548\u5E76\u6301\u4E45\u5316\uFF08\u91CD\u542F\u540E\u4FDD\u6301\uFF09\u3002',
      parameters: {
        id: { type: "string", required: true, description: "\u9884\u8BBE id\uFF08preset_list \u8FD4\u56DE\uFF09" }
      },
      output: {
        schema: {
          type: "object",
          additionalProperties: false,
          properties: {
            ok: { type: "boolean", required: true },
            id: { type: "string", required: true }
          }
        },
        render: (_args, value) => [{
          type: "text",
          text: value.ok ? `\u5DF2\u5E94\u7528\u9884\u8BBE ${value.id}` : `\u5E94\u7528\u5931\u8D25\uFF1A${value.id}`
        }]
      },
      execute: (args) => {
        if (!safePresetId(args.id) || !resolvablePresetId(env, args.id)) {
          throw new Error(`preset_apply: \u9884\u8BBE ${args.id} \u4E0D\u5B58\u5728\uFF08\u5148 preset_list\uFF09`);
        }
        writeActiveState(env, args.id);
        return Promise.resolve({ ok: true, id: args.id });
      },
      presentCall: (args) => ({ card: "generic", title: "\u5E94\u7528\u9884\u8BBE", kind: "other", rawInput: args })
    }),
    defineTool({
      name: "preset_inspect",
      description: '\u67E5\u770B\u5F53\u524D\u5916\u89C2\u72B6\u6001\uFF1A\u6D3B\u52A8\u9884\u8BBE\uFF08\u540D\u79F0/\u4EE4\u724C\u6570\uFF09\u3001\u5BF9\u5916\u6863\u4F4D\u3001\u4EE5\u53CA\u6D3B\u52A8\u9884\u8BBE\u5E94\u7528\u7684\u4EE4\u724C\u6E05\u5355\u2014\u2014\u652F\u6301"\u6211\u73B0\u5728\u662F\u4EC0\u4E48\u4E3B\u9898"\u7C7B\u63D0\u95EE\u3002',
      parameters: {},
      output: {
        schema: {
          type: "object",
          additionalProperties: false,
          properties: {
            // #68 P2 注记：activePresetId/activeName 可为 null，但 dsh-tools guard 的 DSL
            // 不支持联合类型（type: ['string','null'] 会使注册整体失败——已实测）——
            // 保持宽松声明（无 required），这是工具框架限制而非缺陷。
            activePresetId: { type: "string" },
            activeName: { type: "string" },
            revision: { type: "integer", required: true },
            tier: { type: "string", required: true },
            tokenCount: { type: "integer", required: true },
            appliedTokenNames: {
              type: "array",
              required: true,
              items: { type: "string" }
            }
          }
        },
        render: (_args, value) => [{
          type: "text",
          text: value.activeName != null ? `\u5F53\u524D\u5916\u89C2\uFF1A${value.activeName}\uFF08${value.tokenCount} \u4E2A\u4EE4\u724C\u8986\u76D6\uFF0C\u6863\u4F4D ${value.tier}\uFF09` : `\u5F53\u524D\u4E3A\u9ED8\u8BA4\u5916\u89C2\uFF08\u6863\u4F4D ${value.tier}\uFF09`
        }]
      },
      execute: () => Promise.resolve(inspectState(env)),
      presentCall: () => ({ card: "generic", title: "\u67E5\u770B\u5F53\u524D\u5916\u89C2", kind: "other", rawInput: null })
    }),
    defineTool({
      name: "preset_create",
      description: "\u6309\u81EA\u7136\u8BED\u8A00\u9700\u6C42\u521B\u5EFA\u5916\u89C2\u9884\u8BBE\uFF08\u628A\u7528\u6237\u63CF\u8FF0\u6620\u5C04\u4E3A\u4EE4\u724C\u53CC\u503C\uFF09\uFF1A\u5199\u5165\u9884\u8BBE\u5E93\u4F46\u4E0D\u81EA\u52A8\u5E94\u7528\u2014\u2014\u7528\u6237\u786E\u8BA4\u540E\u518D\u5E94\u7528/\u7F16\u8F91\u3002tokens \u683C\u5F0F\uFF1A\u4EE4\u724C\u540D\uFF08-- \u5F00\u5934\uFF09\u2192 { light, dark } \u53CC\u503C\u5B57\u7B26\u4E32\uFF1B\u660E\u6697\u4E00\u81F4\u65F6\u91CD\u590D\u540C\u4E00\u503C\u3002\u5E38\u7528\u4EE4\u724C\u793A\u4F8B\uFF1A--dsw-alias-bg-base\uFF08\u754C\u9762\u5E95\u8272\uFF09/ --dsw-alias-brand-primary\uFF08\u54C1\u724C\u4E3B\u8272\uFF09/ --dsw-alias-label-primary\uFF08\u4E3B\u6587\u5B57\uFF09\uFF1B\u54C1\u724C\u8272\u675F\uFF1A--dsw-alias-button-info-fill \u4E0E --dsw-alias-state-business-primary \u4E0E\u54C1\u724C\u4E3B\u8272\u540C\u503C\u3002\u8BBE\u8BA1\u6D41\u7A0B\uFF1A\u5148 preset_catalog \u67E5\u4EE4\u724C\u8BED\u4E49\u4E0E\u98CE\u683C\u5B57\u5178\uFF08styles\uFF09\uFF0C\u98CE\u683C\u8BCD\u53EF preset_list \u770B\u51FA\u5382\u9884\u8BBE\u7684 style \u6807\u7B7E\u6216 preset_get <demo id> \u8BFB\u5176\u4EE4\u724C\u4F5C\u98CE\u8303\u4F8B\uFF08\u5982 default \u6D77\u6D0B\u6E05\u723D\u2014\u2014\u552F\u4E00\u51FA\u5382\u9884\u8BBE\uFF09\uFF1B\u521B\u5EFA\u524D\u53EF preset_check \u9884\u68C0\u3002\u6CE8\u610F safety \u5B57\u6BB5\uFF1Acaution \u7EA7\u4EE4\u724C\u5F71\u54CD\u9762\u5927\uFF0C\u8C28\u614E\u8C03\u6574\uFF08\u4E0E\u754C\u9762\u63D0\u793A\u4E00\u81F4\uFF09\u3002",
      parameters: {
        name: { type: "string", required: true, description: "\u9884\u8BBE\u540D\u79F0\uFF08\u226464 \u5B57\u7B26\uFF09" },
        tokens: {
          type: "object",
          required: true,
          additionalProperties: true,
          description: '\u4EE4\u724C \u2192 { light, dark } \u53CC\u503C\u6620\u5C04\uFF0C\u5982 {"--dsw-alias-bg-base": {"light": "#ffffff", "dark": "#0d121b"}}'
        },
        css: {
          type: "array",
          description: "\u53EF\u9009 CSS \u8865\u4E01\uFF1A{ selector\uFF08\u987B [data- \u951A\u70B9\u5F00\u5934\uFF09, rules\uFF08\u7981\u6B62\u82B1\u62EC\u53F7\uFF09} \u6570\u7EC4"
        },
        assets: {
          type: "array",
          description: "\u53EF\u9009\u7D20\u6750\u5F15\u7528\u58F0\u660E\uFF08id \u6765\u81EA asset_list\uFF09\uFF1A[{ id, name, mime }]\u2014\u2014\u58C1\u7EB8\u5E93\u6587\u4EF6\u5F15\u7528\uFF0C\u4E0D\u542B\u56FE\u7247\u6570\u636E"
        },
        widgets: {
          type: "array",
          description: '\u53EF\u9009\u6CE8\u5165\u90E8\u4EF6\uFF1A[{ id: "chat-background"|"settings-background"|"sidebar-poster", params: { assetId: <assets \u58F0\u660E\u4E2D\u7684 id>, opacity: "0~1 \u5B57\u7B26\u4E32" } }]\u2014\u2014assetId \u5FC5\u987B\u540C\u65F6\u51FA\u73B0\u5728 assets \u58F0\u660E\u91CC\uFF1B\u88C1\u526A\u4EA4\u4E92\u7559\u7ED9 UI\uFF0C\u4E0D\u8981\u5199\u88C1\u526A\u53C2\u6570'
        },
        theme: {
          type: "object",
          additionalProperties: true,
          description: '\u53EF\u9009\u4E3B\u9898\u6CE8\u518C\uFF08\u542F\u7528\u540E\u7528\u6237\u53EF\u5728\u754C\u9762\u300C\u5207\u6362\u5230\u6B64\u4E3B\u9898\u300D\uFF09\uFF1A{ id: \u5408\u6CD5\u6807\u8BC6\u7B26\uFF08\u5C0F\u5199\u5B57\u6BCD\u6570\u5B57\u5F00\u5934\uFF0C\u5141\u8BB8\u4E2D\u5212\u7EBF\uFF0C\u60EF\u4F8B <\u9884\u8BBEid>-theme\uFF09, colorScheme: "light"|"dark"\uFF08\u51B3\u5B9A\u660E\u6697\u57FA\u8272\u677F\u65B9\u5411\uFF09, tokens?: \u4E3B\u9898\u4EE4\u724C\u53CC\u503C\uFF08\u7701\u7565 = \u81EA\u52A8\u4F7F\u7528\u672C\u9884\u8BBE\u5168\u90E8\u4EE4\u724C\uFF09}'
        }
      },
      output: {
        schema: {
          type: "object",
          additionalProperties: false,
          properties: {
            ok: { type: "boolean", required: true },
            id: { type: "string", required: true }
          }
        },
        render: (_args, value) => [{
          type: "text",
          text: value.ok ? `\u5DF2\u521B\u5EFA\u9884\u8BBE ${value.id}\uFF08\u672A\u5E94\u7528\uFF0C\u7528\u6237\u786E\u8BA4\u540E\u751F\u6548\uFF09` : "\u521B\u5EFA\u5931\u8D25"
        }]
      },
      execute: (args) => {
        const id = createPresetFile(env, {
          name: args.name,
          tokens: args.tokens,
          css: args.css,
          assets: args.assets,
          widgets: args.widgets,
          theme: args.theme
        });
        return Promise.resolve({ ok: true, id });
      },
      presentCall: (args) => ({ card: "generic", title: "\u521B\u5EFA\u9884\u8BBE", kind: "other", rawInput: args })
    }),
    defineTool({
      name: "preset_catalog",
      description: '\u67E5\u8BE2\u4EE4\u724C\u76EE\u5F55\u8BED\u4E49\u4E0E\u8BBE\u8BA1\u53C2\u8003\uFF08\u8BBE\u8BA1\u9884\u8BBE\u7684\u5B57\u5178\uFF09\uFF1A\u6309\u540D\u79F0/\u5206\u7EC4\u8FC7\u6EE4\u8FD4\u56DE\u4EE4\u724C\uFF08\u540D\u79F0/\u5206\u7EC4/\u660E\u6697\u9ED8\u8BA4\u503C/\u5B89\u5168\u7B49\u7EA7/\u53D6\u503C\u7C7B\u578B/\u5F71\u54CD\u9762 scope\uFF09\uFF0C\u8FD4\u56DE\u65CB\u94AE\u675F\u6620\u5C04\uFF08\u65CB\u94AE id/\u7C7B\u522B/\u63A7\u4EF6\u7C7B\u578B/\u6570\u503C\u8FB9\u754C/\u8986\u76D6\u7684\u4EE4\u724C\uFF09\u3001CSS \u8865\u4E01\u53EF\u7528\u951A\u70B9\uFF08css_anchors\uFF09\u4E0E\u98CE\u683C\u672F\u8BED\u5B57\u5178\uFF08styles\uFF1A\u7528\u6237\u98CE\u683C\u8BCD \u2192 \u8BBE\u8BA1\u624B\u6CD5 + \u53EF\u53C2\u8003\u7684\u51FA\u5382\u9884\u8BBE\u2014\u2014\u5982 "\u6E05\u723D" \u53EF preset_get default \u8BFB\u5176\u4EE4\u724C\u4F5C\u98CE\u8303\u4F8B\uFF09\u3002\u547D\u4E2D\u8D85\u8FC7 200 \u6761\u53EA\u8FD4\u56DE\u524D 200\uFF0C\u8BF7\u7528\u66F4\u7CBE\u786E\u7684 query \u8FC7\u6EE4\uFF08\u63D0\u793A\uFF1A\u5206\u7EC4\u540D\u53EF\u7528 alias/specific/static \u4E00\u6B21\u62FF\u5168\u5BF9\u5E94\u7EC4\uFF09\u3002preset_create/update \u524D\u5148\u67E5\u8FD9\u91CC\uFF0C\u4EE4\u724C\u540D\u5FC5\u987B -- \u5F00\u5934\uFF1B\u6CE8\u610F safety \u5B57\u6BB5\uFF1Acaution \u7EA7\u4EE4\u724C\u5F71\u54CD\u9762\u5927\uFF0C\u8C28\u614E\u8C03\u6574\uFF08\u4E0E\u754C\u9762\u63D0\u793A\u4E00\u81F4\uFF09\u3002',
      parameters: {
        query: { type: "string", description: '\u540D\u79F0\u5B50\u4E32\u6216\u5206\u7EC4\u540D\u8FC7\u6EE4\uFF08\u5982 "bg" \u6216 "bg-base"\u3001"alias" \u62FF\u5168 alias \u7EC4\uFF1B\u7701\u7565 = \u5168\u90E8\uFF0C\u6700\u591A 200 \u6761\uFF09' }
      },
      output: {
        schema: {
          type: "object",
          additionalProperties: false,
          properties: {
            matched: { type: "integer", required: true },
            tokens: {
              type: "array",
              required: true,
              items: { type: "object", additionalProperties: true }
            },
            knobs: {
              type: "array",
              required: true,
              items: { type: "object", additionalProperties: true }
            },
            knob_categories: {
              type: "array",
              required: true,
              items: { type: "object", additionalProperties: true }
            },
            css_anchors: {
              type: "array",
              required: true,
              items: { type: "object", additionalProperties: false, properties: { selector: { type: "string", required: true }, label: { type: "string", required: true }, note: { type: "string", required: true } } }
            },
            styles: {
              type: "array",
              required: true,
              items: { type: "object", additionalProperties: false, properties: { term: { type: "string", required: true }, guidance: { type: "string", required: true }, demos: { type: "array", required: true, items: { type: "string" } } } }
            }
          }
        },
        render: (_args, value) => [{
          type: "text",
          text: `\u4EE4\u724C\u76EE\u5F55\u547D\u4E2D ${value.matched} \u6761\uFF1B\u65CB\u94AE\u675F ${value.knobs.length} \u4E2A\uFF08\u5982 ${value.knobs.map((k) => k.name).slice(0, 5).join("\u3001")}\u2026\uFF09\uFF1BCSS \u951A\u70B9 ${value.css_anchors.length} \u4E2A\uFF1B\u98CE\u683C\u5B57\u5178 ${value.styles.length} \u8BCD`
        }]
      },
      execute: (args) => {
        const query = (args.query ?? "").trim().toLowerCase();
        const matchedEntries = catalog.entries.filter((entry) => query === "" || entry.name.toLowerCase().includes(query) || entry.group.includes(query));
        const tokens = matchedEntries.slice(0, 200).map((entry) => ({
          name: entry.name,
          group: entry.group,
          light: entry.light,
          dark: entry.dark,
          safety: entry.safety,
          valueType: entry.valueType,
          // #68 P2：补 scope（global/local 影响面）；#74：description 并入中文语义层（内置）
          scope: entry.scope,
          description: entry.description !== "" ? entry.description : TOKEN_DESCRIPTIONS[entry.name] ?? ""
        }));
        const knobs = KNOBS.map((knob) => {
          const entry = {
            id: knob.id,
            name: knob.name,
            description: knob.description,
            tokens: knob.bundle,
            category: knob.category,
            control: knob.control
          };
          if (knob.min !== void 0) entry.min = knob.min;
          if (knob.max !== void 0) entry.max = knob.max;
          if (knob.step !== void 0) entry.step = knob.step;
          if (knob.unit !== void 0) entry.unit = knob.unit;
          if (knob.options !== void 0) entry.options = knob.options;
          return entry;
        });
        const knobCategories = KNOB_CATEGORIES.map((cat) => ({ id: cat.id, name: cat.name, description: cat.description }));
        return Promise.resolve({ matched: matchedEntries.length, tokens, knobs, knob_categories: knobCategories, css_anchors: CSS_ANCHORS, styles: STYLE_GUIDE });
      },
      presentCall: (args) => ({ card: "generic", title: "\u67E5\u8BE2\u4EE4\u724C\u76EE\u5F55", kind: "other", rawInput: args })
    }),
    defineTool({
      name: "preset_get",
      description: '\u8BFB\u53D6\u6307\u5B9A\u9884\u8BBE\u7684\u5B8C\u6574\u8BE6\u60C5\uFF08id \u6765\u81EA preset_list\uFF09\uFF1A\u4EE4\u724C\u53CC\u503C/css \u8865\u4E01/\u4E3B\u9898/\u90E8\u4EF6\u53C2\u6570/\u5C01\u9762/\u98CE\u683C\u6807\u7B7E/\u5907\u4EFD\u6807\u8BB0\u2014\u2014preset_update \u5FAE\u8C03\u524D\u5148\u8BFB\u73B0\u503C\uFF0C\u907F\u514D\u6574\u4F53\u66FF\u6362\u8986\u76D6\u672A\u77E5\u5185\u5BB9\uFF1B\u5185\u7F6E\u793A\u4F8B\u4E5F\u53EF\u8BFB\uFF08\u542B style \u98CE\u683C\u6807\u7B7E\u2014\u2014\u53EF\u4F5C\u4E3A\u8BBE\u8BA1\u8303\u4F8B\uFF1A\u5982\u7528\u6237\u8981"\u6D77\u6D0B\u6E05\u723D\u98CE\u683C"\u5148 preset_get default \u53C2\u8003\u5176\u4EE4\u724C\u53D6\u503C\u624B\u6CD5\uFF09\u3002\u7D20\u6750\u53EA\u8FD4\u56DE\u5143\u6570\u636E\uFF08id/name/mime/\u4F53\u79EF\uFF0C\u4E0D\u542B\u56FE\u7247\u6570\u636E\uFF09\u3002',
      parameters: {
        id: { type: "string", required: true, description: "\u9884\u8BBE id\uFF08preset_list \u8FD4\u56DE\uFF09" }
      },
      output: {
        schema: {
          type: "object",
          additionalProperties: false,
          properties: {
            ok: { type: "boolean", required: true },
            preset: { type: "object", additionalProperties: true, required: true }
          }
        },
        render: (_args, value) => {
          if (value.ok !== true || value.preset === void 0) return [{ type: "text", text: "\u8BFB\u53D6\u5931\u8D25" }];
          const p = value.preset;
          const tokenNames = Object.keys(p.tokens ?? {});
          const tokenLines = tokenNames.slice(0, 30).map((name2) => {
            const v = p.tokens[name2];
            return `- ${name2}: light=${v?.light} dark=${v?.dark}`;
          });
          const moreTokens = tokenNames.length > 30 ? `\uFF08\u2026\u5171 ${tokenNames.length} \u4E2A\u4EE4\u724C\uFF09` : "";
          const widgetLines = (p.widgets ?? []).map((w) => `- ${w.id}: ${Object.entries(w.params ?? {}).map(([k, v]) => `${k}=${v}`).join(" ")}`);
          const themeLine = p.theme !== null && p.theme !== void 0 ? `\u4E3B\u9898 ${p.theme.id}\uFF08${p.theme.colorScheme}\uFF0C${Object.keys(p.theme.tokens ?? {}).length} \u4EE4\u724C\uFF09` : "\u4E3B\u9898\u65E0";
          const cover = p.cover;
          const coverLine = cover !== null && cover !== void 0 ? `\u5C01\u9762 ${cover.assetId}${cover.cropW !== void 0 && cover.cropW !== "" ? `\uFF08\u88C1\u526A ${cover.cropX},${cover.cropY} ${cover.cropW}\xD7${cover.cropH}\uFF09` : ""}` : "\u5C01\u9762\u65E0";
          const assetLines = (p.assets ?? []).map((a) => `- ${a.id}\uFF1A${a.name}\uFF08${a.mime}\uFF0C${formatBytes(a.size)}\uFF09`);
          return [{
            type: "text",
            text: [
              `\u9884\u8BBE\u300C${p.name}\u300D\uFF08id=${p.id}\uFF0C${p.edition}${p.builtin ? "\uFF0C\u5185\u7F6E" : ""}${p.hasBackup ? "\uFF0C\u6709\u5907\u4EFD" : ""}\uFF09\uFF1A${p.tokenCount} \u4EE4\u724C\uFF1Bwidgets ${(p.widgets ?? []).length} \u4E2A\uFF1B${themeLine}\uFF1B${coverLine}\uFF1BCSS \u8865\u4E01 ${(p.css ?? []).length} \u6BB5\uFF1B\u7D20\u6750 ${(p.assets ?? []).length} \u4E2A`,
              tokenLines.length > 0 ? `\u4EE4\u724C\uFF1A
${tokenLines.join("\n")}${moreTokens}` : "",
              widgetLines.length > 0 ? `widgets\uFF1A
${widgetLines.join("\n")}` : "",
              assetLines.length > 0 ? `\u7D20\u6750\uFF1A
${assetLines.join("\n")}` : ""
            ].filter(Boolean).join("\n")
          }];
        }
      },
      execute: (args) => {
        const detail = getPresetDetail(env, args.id);
        return Promise.resolve({ ok: true, preset: detail });
      },
      presentCall: (args) => ({ card: "generic", title: "\u8BFB\u53D6\u9884\u8BBE\u8BE6\u60C5", kind: "other", rawInput: args })
    }),
    defineTool({
      name: "preset_update",
      description: '\u66F4\u65B0\u4E00\u4E2A\u5DF2\u5B58\u5728\u9884\u8BBE\uFF08id \u6765\u81EA preset_list\uFF09\uFF1A\u6309\u9700\u66FF\u6362 name/tokens/css/assets/widgets\uFF08\u672A\u63D0\u4F9B\u7684\u5B57\u6BB5\u4FDD\u6301\u4E0D\u53D8\uFF09\uFF0C\u6821\u9A8C\u901A\u8FC7\u540E\u5199\u56DE\u5E76\u5907\u4EFD\u65E7\u7248\u3002\u5FAE\u8C03\u573A\u666F\uFF08\u5982"\u628A\u80CC\u666F\u6539\u6DF1\u4E00\u70B9"\uFF09\u63A8\u8350\u7528 merge_tokens \u589E\u91CF\u5408\u5E76\u4EE4\u724C\uFF08\u53EA\u66F4\u65B0\u63D0\u4F9B\u7684\u952E\uFF0C\u5176\u4F59\u4FDD\u6301\uFF09\u2014\u2014\u907F\u514D\u6574\u4F53\u66FF\u6362\u8986\u76D6\u5176\u4ED6\u4EE4\u724C\u3002\u82E5\u76EE\u6807\u9884\u8BBE\u662F\u5F53\u524D\u751F\u6548\u7684\u6D3B\u52A8\u9884\u8BBE\uFF0C\u66F4\u65B0\u540E\u81EA\u52A8\u91CD\u65B0\u5E94\u7528\uFF1A\u754C\u9762\u5373\u65F6\u751F\u6548\uFF08\u65E0\u9700\u518D preset_apply\uFF09\u3002\u5148 preset_get \u8BFB\u73B0\u503C\u3001preset_catalog \u67E5\u8BED\u4E49\uFF1Bsafety \u4E3A caution \u7684\u4EE4\u724C\u5F71\u54CD\u9762\u5927\uFF0C\u8C28\u614E\u8C03\u6574\uFF08\u4E0E\u754C\u9762\u63D0\u793A\u4E00\u81F4\uFF09\u3002\u4E3B\u9898\u53EF\u7528 theme\uFF08\u6CE8\u518C/\u66FF\u6362\uFF09\u6216 clear_theme\uFF08\u6E05\u9664\uFF09\u3002',
      parameters: {
        id: { type: "string", required: true, description: "\u76EE\u6807\u9884\u8BBE id" },
        name: { type: "string", description: "\u65B0\u540D\u79F0\uFF08\u53EF\u9009\uFF09" },
        tokens: {
          type: "object",
          additionalProperties: true,
          description: "\u4EE4\u724C \u2192 { light, dark } \u53CC\u503C\u6620\u5C04\uFF08\u53EF\u9009\uFF1B\u6574\u4F53\u66FF\u6362\u8BE5\u5B57\u6BB5\u2014\u2014\u4E0E merge_tokens \u4E8C\u9009\u4E00\uFF0C\u540C\u65F6\u63D0\u4F9B\u65F6 merge_tokens \u4F18\u5148\uFF09"
        },
        merge_tokens: {
          type: "object",
          additionalProperties: true,
          description: "\u589E\u91CF\u5408\u5E76\u4EE4\u724C\uFF08\u53EF\u9009\uFF1B\u53EA\u66F4\u65B0\u63D0\u4F9B\u7684\u952E\uFF0C\u672A\u63D0\u4F9B\u7684\u4FDD\u6301\u539F\u503C\u2014\u2014\u5FAE\u8C03\u63A8\u8350\uFF1B\u4E0E tokens \u4E8C\u9009\u4E00\uFF09"
        },
        css: { type: "array", description: "\u53EF\u9009 CSS \u8865\u4E01\uFF08\u6574\u4F53\u66FF\u6362\uFF09" },
        assets: {
          type: "array",
          description: "\u53EF\u9009\u7D20\u6750\u5F15\u7528\u58F0\u660E\uFF08\u6574\u4F53\u66FF\u6362\uFF1Bid \u6765\u81EA asset_list\uFF09\uFF1A[{ id, name, mime }]\u2014\u2014\u58C1\u7EB8\u5E93\u6587\u4EF6\u5F15\u7528\uFF0C\u4E0D\u542B\u56FE\u7247\u6570\u636E"
        },
        widgets: {
          type: "array",
          description: '\u53EF\u9009\u6CE8\u5165\u90E8\u4EF6\uFF08\u6574\u4F53\u66FF\u6362\uFF09\uFF1A[{ id: "chat-background"|"settings-background"|"sidebar-poster", params: { assetId: <assets \u58F0\u660E\u4E2D\u7684 id>, opacity: "0~1 \u5B57\u7B26\u4E32" } }]\u2014\u2014assetId \u5FC5\u987B\u540C\u65F6\u51FA\u73B0\u5728 assets \u58F0\u660E\u91CC\uFF1B\u88C1\u526A\u4EA4\u4E92\u7559\u7ED9 UI'
        },
        theme: {
          type: "object",
          additionalProperties: true,
          description: '\u53EF\u9009\u4E3B\u9898\uFF08\u6574\u4F53\u66FF\u6362\uFF1B\u4E0E clear_theme \u4E8C\u9009\u4E00\uFF09\uFF1A{ id: \u5408\u6CD5\u6807\u8BC6\u7B26\uFF08\u60EF\u4F8B <\u9884\u8BBEid>-theme\uFF09, colorScheme: "light"|"dark", tokens?: \u4E3B\u9898\u4EE4\u724C\u53CC\u503C\uFF08\u7701\u7565 = \u81EA\u52A8\u4F7F\u7528\u5F53\u524D\u9884\u8BBE\u4EE4\u724C\uFF09}'
        },
        clear_theme: {
          type: "boolean",
          description: "\u6E05\u9664\u4E3B\u9898\u6CE8\u518C\uFF08\u53EF\u9009\uFF1B\u4E0E theme \u4E8C\u9009\u4E00\uFF0C\u540C\u65F6\u63D0\u4F9B\u65F6 clear_theme \u4F18\u5148\uFF09"
        }
      },
      output: {
        schema: {
          type: "object",
          additionalProperties: false,
          properties: {
            ok: { type: "boolean", required: true },
            id: { type: "string", required: true }
          }
        },
        render: (_args, value) => [{
          type: "text",
          text: value.ok ? `\u5DF2\u66F4\u65B0\u9884\u8BBE ${value.id}\uFF08\u65E7\u7248\u5DF2\u5907\u4EFD\uFF09` : "\u66F4\u65B0\u5931\u8D25"
        }]
      },
      execute: (args) => {
        const id = updatePresetFile(env, args.id, {
          name: args.name,
          tokens: args.tokens,
          css: args.css,
          mergeTokens: args.merge_tokens,
          assets: args.assets,
          widgets: args.widgets,
          theme: args.clear_theme === true ? null : args.theme
        });
        if (readActiveState(env).activePresetId === id) writeActiveState(env, id);
        return Promise.resolve({ ok: true, id });
      },
      presentCall: (args) => ({ card: "generic", title: "\u66F4\u65B0\u9884\u8BBE", kind: "other", rawInput: args })
    }),
    defineTool({
      name: "preset_delete",
      description: "\u5220\u9664\u4E00\u4E2A\u7528\u6237\u9884\u8BBE\uFF08\u5185\u7F6E\u793A\u4F8B\u4E0D\u53EF\u5220\uFF09\u3002\u82E5\u5220\u9664\u7684\u662F\u5F53\u524D\u6D3B\u52A8\u9884\u8BBE\uFF0C\u5916\u89C2\u81EA\u52A8\u8FD8\u539F\u4E3A\u9ED8\u8BA4\u3002",
      parameters: {
        id: { type: "string", required: true, description: "\u76EE\u6807\u9884\u8BBE id" }
      },
      output: {
        schema: {
          type: "object",
          additionalProperties: false,
          properties: {
            ok: { type: "boolean", required: true },
            id: { type: "string", required: true }
          }
        },
        render: (_args, value) => [{
          type: "text",
          text: value.ok ? `\u5DF2\u5220\u9664\u9884\u8BBE ${value.id}` : "\u5220\u9664\u5931\u8D25"
        }]
      },
      execute: (args) => {
        if (!safePresetId(args.id)) throw new Error("preset_delete: \u975E\u6CD5 id");
        if (isDemoPreset(args.id)) throw new Error("preset_delete: \u5185\u7F6E\u793A\u4F8B\u4E0D\u53EF\u5220\u9664");
        deletePresetFile(env, args.id);
        if (readActiveState(env).activePresetId === args.id) writeActiveState(env, null);
        return Promise.resolve({ ok: true, id: args.id });
      },
      presentCall: (args) => ({ card: "generic", title: "\u5220\u9664\u9884\u8BBE", kind: "other", rawInput: args })
    }),
    defineTool({
      name: "preset_revert",
      description: "\u8FD8\u539F\u9ED8\u8BA4\u5916\u89C2\uFF08\u6E05\u9664\u6D3B\u52A8\u9884\u8BBE\uFF09\uFF1A\u64A4\u9500\u4E4B\u524D preset_apply \u7684\u6548\u679C\uFF0C\u56DE\u5230 DSH \u51FA\u5382\u914D\u8272\u3002",
      parameters: {},
      output: {
        schema: {
          type: "object",
          additionalProperties: false,
          properties: {
            ok: { type: "boolean", required: true }
          }
        },
        render: (_args, value) => [{
          type: "text",
          text: value.ok ? "\u5DF2\u8FD8\u539F\u9ED8\u8BA4\u5916\u89C2" : "\u64CD\u4F5C\u5931\u8D25"
        }]
      },
      execute: () => {
        writeActiveState(env, null);
        return Promise.resolve({ ok: true });
      },
      presentCall: () => ({ card: "generic", title: "\u8FD8\u539F\u9ED8\u8BA4\u5916\u89C2", kind: "other", rawInput: null })
    }),
    defineTool({
      name: "asset_list",
      description: "\u5217\u51FA\u58C1\u7EB8\u5E93\u5DF2\u6709\u7D20\u6750\uFF08\u804A\u5929\u80CC\u666F/\u8BBE\u7F6E\u5361\u80CC\u666F/\u4FA7\u680F\u6D77\u62A5\u53EF\u7528\u7684\u56FE\u7247\uFF09\uFF1Aid/\u540D\u79F0/mime/\u4F53\u79EF\u2014\u2014\u8BBE\u7F6E\u90E8\u4EF6\uFF08widgets\uFF09\u524D\u5148\u67E5\u8FD9\u91CC\uFF0C\u7528\u8FD4\u56DE\u7684 id \u5F15\u7528\u7D20\u6750\uFF08id \u4E0D\u80FD\u51ED\u7A7A\u7F16\u9020\uFF09\uFF1B\u7D20\u6750\u4E0A\u4F20\u4ECD\u7531\u7528\u6237\u5728\u754C\u9762\u5B8C\u6210\u3002",
      parameters: {},
      output: {
        schema: {
          type: "object",
          additionalProperties: false,
          properties: {
            assets: {
              type: "array",
              required: true,
              items: {
                type: "object",
                additionalProperties: false,
                properties: {
                  id: { type: "string", required: true },
                  name: { type: "string", required: true },
                  mime: { type: "string", required: true },
                  size: { type: "integer", required: true },
                  // #96（审计）：分层合成壁纸（#90）的 layers 元数据随 listWallpaperAssets 输出——
                  // additionalProperties:false 下未声明键会让宿主输出校验抛错（测试 stub 掩盖）
                  layers: {
                    type: "object",
                    additionalProperties: true,
                    properties: {
                      animAssetId: { type: "string" },
                      x: { type: "number" },
                      y: { type: "number" },
                      w: { type: "number" },
                      h: { type: "number" }
                    }
                  }
                }
              }
            }
          }
        },
        render: (_args, value) => [{
          type: "text",
          // #102：render 必须携带素材 id——LLM 看到的是 render 文本，原实现只拼中文文件名，
          // AI 拿不到合法标识符（实测只能翻磁盘目录找 id）
          text: value.assets.length === 0 ? "\u58C1\u7EB8\u5E93\u4E3A\u7A7A\uFF08\u7D20\u6750\u4E0A\u4F20\u7531\u7528\u6237\u5728\u754C\u9762\u5B8C\u6210\uFF09" : `\u58C1\u7EB8\u5E93\u5171 ${value.assets.length} \u4E2A\u7D20\u6750\uFF08widgets \u5F15\u7528\u8BF7\u7528 id\uFF09\uFF1A
${value.assets.map((a) => `- ${a.id}\uFF1A${a.name}\uFF08${a.mime}\uFF0C${formatBytes(a.size)}\uFF09`).join("\n")}`
        }]
      },
      execute: () => Promise.resolve({ assets: listWallpaperAssets(env) }),
      presentCall: () => ({ card: "generic", title: "\u5217\u51FA\u58C1\u7EB8\u5E93\u7D20\u6750", kind: "other", rawInput: null })
    }),
    defineTool({
      name: "preset_restore_backup",
      description: "\u628A\u9884\u8BBE\u8FD8\u539F\u5230\u5907\u4EFD\u7248\u672C\uFF08backup.json\u2014\u2014\u8986\u76D6\u4FDD\u5B58/\u66F4\u65B0\u65F6\u81EA\u52A8\u4FDD\u7559\u7684\u65E7\u7248\uFF1B\u4E0E\u754C\u9762\u300C\u8FD8\u539F\u5907\u4EFD\u300D\u540C\u8BED\u4E49\uFF09\uFF1A**\u4EA4\u6362\u5F0F\u8FD8\u539F**\u2014\u2014\u5F53\u524D\u7248\u672C\u81EA\u52A8\u5B58\u5165\u5907\u4EFD\uFF08\u5355\u5C42\u5907\u4EFD\uFF0C\u53EF\u518D\u8FD8\u539F\u56DE\u53BB\uFF09\u3002\u7528\u4E8E\u7EA0\u9519\uFF1Apreset_update \u6539\u574F\u4E86\u53EF\u8FD8\u539F\uFF1Bpreset_delete \u5220\u9519\u4E86\u65E0\u6CD5\u6062\u590D\uFF08\u5220\u9664\u4F1A\u8FDE\u5907\u4EFD\u9500\u6BC1\uFF0C\u8C28\u614E\uFF09\u3002\u82E5\u76EE\u6807\u662F\u5F53\u524D\u751F\u6548\u7684\u6D3B\u52A8\u9884\u8BBE\uFF0C\u8FD8\u539F\u540E\u81EA\u52A8\u91CD\u65B0\u5E94\u7528\uFF1A\u754C\u9762\u5373\u65F6\u751F\u6548\u3002\u65E0\u5907\u4EFD/\u5907\u4EFD\u635F\u574F\u4F1A\u62A5\u9519\u3002",
      parameters: {
        id: { type: "string", required: true, description: "\u76EE\u6807\u9884\u8BBE id\uFF08preset_list \u8FD4\u56DE\uFF09" }
      },
      output: {
        schema: {
          type: "object",
          additionalProperties: false,
          properties: {
            ok: { type: "boolean", required: true },
            id: { type: "string", required: true },
            name: { type: "string", required: true }
          }
        },
        render: (_args, value) => [{
          type: "text",
          text: value.ok === true ? `\u5DF2\u8FD8\u539F\u9884\u8BBE\u300C${value.name}\u300D\uFF08\u5F53\u524D\u7248\u672C\u5DF2\u5B58\u5165\u5907\u4EFD\uFF09` : "\u8FD8\u539F\u5931\u8D25"
        }]
      },
      execute: (args) => {
        const result = restoreBackupFile(env, args.id);
        if (readActiveState(env).activePresetId === args.id) writeActiveState(env, args.id);
        return Promise.resolve({ ok: true, id: args.id, name: result.name });
      },
      presentCall: (args) => ({ card: "generic", title: "\u8FD8\u539F\u9884\u8BBE\u5907\u4EFD", kind: "other", rawInput: args })
    }),
    defineTool({
      name: "preset_check",
      description: "\u8D28\u91CF\u9884\u68C0\uFF08\u521B\u5EFA/\u66F4\u65B0\u9884\u8BBE\u524D\u8C03\u7528\uFF09\uFF1A\u6821\u9A8C\u5019\u9009\u5B8C\u6574\u8F7D\u8377\uFF08tokens/css/assets/widgets/theme\uFF0C\u4E0E preset_create \u540C\u6784\u2014\u2014\u901A\u8FC7 = \u63D0\u4F9B\u7684\u5B57\u6BB5\u5FC5\u80FD\u843D\u76D8\uFF09\uFF0C\u5E76\u8BC4\u4F30\u6587\u5B57\u4E0E\u6309\u94AE\u5BF9\u6BD4\u5EA6\uFF08label \u5BB6\u65CF vs \u5404\u7EC4\u4EF6\u9762 + \u6309\u94AE\u6587\u5B57 vs \u6309\u94AE\u586B\u5145\uFF0C\u660E\u6697\u5404\u7B97\uFF1BFAIL/\u4EC5\u5927\u6587\u672C\u8FBE\u6807\u4F1A\u63D0\u793A\uFF0C\u4F4E\u5BF9\u6BD4\u53EF\u4FDD\u5B58\u4F46\u5EFA\u8BAE\u8C03\u6574\u2014\u2014\u4E0E\u754C\u9762\u5FBD\u6807\u540C\u8BED\u4E49\uFF09\u3001\u672A\u77E5\u4EE4\u724C\u3001\u660E\u6697\u53CD\u8F6C\u3002\u8F93\u51FA issues \u9010\u6761\u8BF4\u660E\uFF08error=\u963B\u65AD / warn=\u5EFA\u8BAE\uFF09\u3002",
      parameters: {
        tokens: {
          type: "object",
          required: true,
          additionalProperties: true,
          description: "\u5019\u9009\u4EE4\u724C \u2192 { light, dark } \u53CC\u503C\u6620\u5C04\uFF08\u4E0E preset_create \u7684 tokens \u540C\u683C\u5F0F\uFF09"
        },
        css: {
          type: "array",
          description: "\u53EF\u9009\u5019\u9009 CSS \u8865\u4E01\uFF08\u4E0E preset_create \u7684 css \u540C\u683C\u5F0F\uFF1B\u68C0\u67E5\u9009\u62E9\u5668\u767D\u540D\u5355\uFF09"
        },
        assets: {
          type: "array",
          description: "\u53EF\u9009\u5019\u9009\u7D20\u6750\u5F15\u7528\u58F0\u660E\uFF08\u4E0E preset_create \u7684 assets \u540C\u683C\u5F0F\uFF1B\u6821\u9A8C\u7ED3\u6784\uFF09"
        },
        widgets: {
          type: "array",
          description: "\u53EF\u9009\u5019\u9009\u90E8\u4EF6\uFF08\u4E0E preset_create \u7684 widgets \u540C\u683C\u5F0F\uFF1B\u6821\u9A8C\u7ED3\u6784\u4E0E\u5F15\u7528\uFF09"
        },
        theme: {
          type: "object",
          additionalProperties: true,
          description: "\u53EF\u9009\u5019\u9009\u4E3B\u9898\uFF08\u4E0E preset_create \u7684 theme \u540C\u683C\u5F0F\uFF1B\u6821\u9A8C\u7ED3\u6784\uFF09"
        }
      },
      output: {
        schema: {
          type: "object",
          additionalProperties: false,
          properties: {
            ok: { type: "boolean", required: true },
            issues: {
              type: "array",
              required: true,
              items: { type: "object", additionalProperties: true }
            },
            summary: { type: "object", additionalProperties: true, required: true }
          }
        },
        render: (_args, value) => [{
          type: "text",
          text: value.ok === true ? `\u9884\u68C0\u901A\u8FC7\uFF1A${value.summary.tokenCount} \u4EE4\u724C${value.summary.contrastIssues > 0 ? `\uFF0C${value.summary.contrastIssues} \u6761\u5BF9\u6BD4\u5EA6\u63D0\u793A` : ""}` : `\u9884\u68C0\u672A\u901A\u8FC7\uFF1A${value.issues.filter((i) => i.severity === "error").length} \u4E2A\u963B\u65AD\u95EE\u9898`
        }]
      },
      execute: (args) => {
        const result = precheckPreset(
          args.tokens ?? {},
          Array.isArray(args.css) ? args.css : void 0,
          { assets: args.assets, widgets: args.widgets, theme: args.theme }
        );
        return Promise.resolve(result);
      },
      presentCall: (args) => ({ card: "generic", title: "\u8D28\u91CF\u9884\u68C0", kind: "other", rawInput: args })
    })
  ];
}
async function registerPresetTools(tools, env) {
  const disposers = [];
  try {
    const { defineTool } = await import("@deepseek-ai/dsh-tools");
    const defs = createPresetToolDefs(env, defineTool);
    for (const definition of defs) {
      disposers.push(tools.register(definition));
    }
    registered = true;
    console.log("[wallpaper-plugin] AI \u5DE5\u5177\u5DF2\u6CE8\u518C\uFF08preset_list/apply/inspect/create/catalog/get/update/delete/revert/restore_backup/check + asset_list\uFF09");
    return disposers;
  } catch (error) {
    console.warn("[wallpaper-plugin] dsh-tools \u4E0D\u53EF\u7528\uFF0CAI \u5DE5\u5177\u672A\u6CE8\u518C\uFF08\u96F6\u629B\u9519\u964D\u7EA7\uFF09\uFF1A", error instanceof Error ? error.message : String(error));
    return disposers;
  }
}

// src/node/config.ts
function resolveConfiguredDirs(config, defaults) {
  const out = { ...defaults };
  const trimIfString = (value) => typeof value === "string" ? value.trim() : void 0;
  const presets = trimIfString(config.presetsDir);
  if (presets !== void 0 && presets !== "") {
    out.presetsDir = presets;
    const assets = trimIfString(config.assetsDir);
    out.assetsDir = assets !== void 0 && assets !== "" ? assets : `${presets}/assets`;
  } else {
    const assets = trimIfString(config.assetsDir);
    if (assets !== void 0 && assets !== "") out.assetsDir = assets;
  }
  return out;
}

// src/node/index.ts
var name = "wallpaper-plugin";
var Config = src_default.object({
  presetsDir: src_default.string(),
  assetsDir: src_default.string()
});
var inject = [];
var DSH_HOME = process.env.DSH_HOME ?? join2(homedir(), ".dsh");
var PRESETS_DIR = join2(DSH_HOME, ".ui-presets");
var DATA_DIR = join2(DSH_HOME, "data", "ui-presets");
var ACTIVE_FILE = join2(DATA_DIR, "active.json");
var CONFIG_FILE = join2(DATA_DIR, "config.json");
var BODY_LIMIT = 30 * 1024 * 1024;
var ZIP_BODY_LIMIT = 28 * 1024 * 1024;
var ASSET_BODY_LIMIT = MAX_ASSET_FILE_SIZE + 64 * 1024;
var ASSETS_DIR = join2(PRESETS_DIR, "assets");
function toolsEnv() {
  return {
    presetsDir: PRESETS_DIR,
    assetsDir: ASSETS_DIR,
    dataDir: DATA_DIR,
    activeFile: ACTIVE_FILE,
    configFile: CONFIG_FILE
  };
}
function applyConfigOverrides(config) {
  const resolved = resolveConfiguredDirs(config, { presetsDir: PRESETS_DIR, assetsDir: ASSETS_DIR });
  PRESETS_DIR = resolved.presetsDir;
  ASSETS_DIR = resolved.assetsDir;
}
var ROUTE_PREFIX = "/ui-presets";
var PRESETS_PATH = `${ROUTE_PREFIX}/presets`;
function json(res, status, body, extra2 = {}) {
  res.writeHead(status, { "content-type": "application/json; charset=utf-8", ...extra2 });
  res.end(JSON.stringify(body));
}
function safeErrorMessage(error) {
  const raw = error instanceof Error ? error.message : String(error);
  return raw.replace(/[A-Za-z]:\\[^\s"']*/g, "<path>").replace(/\/[A-Za-z0-9_\-./]*(?:\.[A-Za-z0-9]+)?(?=\s|$|")/g, (match) => {
    return /^\/[A-Za-z]/.test(match) ? "<path>" : match;
  }).slice(0, 500);
}
function isCrossOrigin(req) {
  const origin = req.headers.origin;
  if (origin === void 0) return false;
  const host = req.headers.host;
  if (host === void 0) return true;
  try {
    return new URL(origin).host !== host;
  } catch {
    return true;
  }
}
function registerSafe(webServer, options, label, disposers) {
  try {
    disposers.push(webServer.register(options));
  } catch (error) {
    console.warn(`[ui-presets] \u8DEF\u7531\u6CE8\u518C\u5931\u8D25\uFF08${label}\uFF09\uFF1A`, error);
  }
}
async function readBody(req) {
  let data = "";
  for await (const chunk of req) {
    data += chunk;
    if (data.length > BODY_LIMIT) return null;
  }
  return data;
}
async function readBodyBuffer(req, limit) {
  const chunks = [];
  let total = 0;
  for await (const chunk of req) {
    const bytes = typeof chunk === "string" ? new TextEncoder().encode(chunk) : new Uint8Array(chunk);
    chunks.push(bytes);
    total += bytes.length;
    if (total > limit) return null;
  }
  const out = new Uint8Array(total);
  let pos = 0;
  for (const chunk of chunks) {
    out.set(chunk, pos);
    pos += chunk.length;
  }
  return out;
}
function presetDir(id) {
  return join2(PRESETS_DIR, id);
}
function stripPrefix(pathname, prefix) {
  if (!pathname.startsWith(prefix)) return null;
  const rest = pathname.slice(prefix.length);
  return rest.startsWith("/") ? rest.slice(1) : rest;
}
function decodeSegment(segment) {
  try {
    return decodeURIComponent(segment);
  } catch {
    return null;
  }
}
function metaOf(id, preset2) {
  const record = preset2 ?? {};
  return {
    id,
    name: typeof record.name === "string" ? record.name : id,
    edition: typeof record.edition === "string" ? record.edition : "standard"
  };
}
function apply(ctx, config = {}) {
  applyConfigOverrides(config);
  ctx.inject?.(["tools"], (toolCtx) => {
    const tools = toolCtx.get("tools");
    if (tools === void 0 || typeof tools.register !== "function") return;
    toolCtx.effect(() => {
      const disposers = [];
      void registerPresetTools(tools, toolsEnv()).then((registeredDisposers) => {
        disposers.push(...registeredDisposers);
      });
      return () => {
        for (const dispose of disposers) {
          try {
            dispose();
          } catch {
          }
        }
      };
    }, "ui-presets: ai tools");
  });
  ctx.inject?.(["webServer"], (httpCtx) => {
    const webServer = httpCtx.get("webServer");
    if (webServer === void 0 || typeof webServer.register !== "function") return;
    try {
      mkdirSync2(PRESETS_DIR, { recursive: true });
      mkdirSync2(DATA_DIR, { recursive: true });
      mkdirSync2(ASSETS_DIR, { recursive: true });
    } catch {
    }
    httpCtx.effect(() => {
      const disposers = [];
      registerSafe(webServer, {
        kind: "exact",
        path: PRESETS_PATH,
        handler: async (req, res) => {
          try {
            if (req.method !== "GET") return json(res, 405, { error: "method not allowed; use GET" }, { allow: "GET" });
            const presets = [];
            let dirs = [];
            try {
              dirs = readdirSync2(PRESETS_DIR);
            } catch {
            }
            for (const id of dirs) {
              if (!safePresetId(id)) continue;
              try {
                const raw = JSON.parse(readFileSync2(join2(presetDir(id), "preset.json"), "utf8"));
                presets.push({ ...metaOf(id, raw), hasBackup: existsSync2(join2(presetDir(id), "backup.json")) });
              } catch {
              }
            }
            presets.sort((a, b) => a.id.localeCompare(b.id));
            json(res, 200, { presets }, { "cache-control": "no-store" });
          } catch (error) {
            json(res, 500, { error: safeErrorMessage(error) });
          }
        }
      }, "presets", disposers);
      registerSafe(webServer, {
        kind: "prefix",
        path: PRESETS_PATH,
        handler: async (req, res) => {
          try {
            if (req.method !== "GET" && req.method !== "PUT" && req.method !== "DELETE") {
              return json(res, 405, { error: "method not allowed" }, { allow: "GET, PUT, DELETE" });
            }
            const pathname = new URL(req.url ?? "/", "http://dsh.internal").pathname;
            const rest = stripPrefix(pathname, PRESETS_PATH);
            const decoded = rest === null ? null : decodeSegment(rest);
            if (decoded === null || !safePresetId(decoded)) return json(res, 400, { error: "invalid preset id" });
            const id = decoded;
            if (req.method === "GET") {
              const requestUrl = new URL(req.url ?? "/", "http://dsh.internal");
              if (requestUrl.searchParams.get("backup") !== null) {
                const backupFile = join2(presetDir(id), "backup.json");
                if (!existsSync2(backupFile)) return json(res, 200, { backup: null }, { "cache-control": "no-store" });
                try {
                  const raw2 = JSON.parse(readFileSync2(backupFile, "utf8"));
                  const result2 = validatePreset(raw2);
                  if (!result2.ok) {
                    return json(res, 422, { error: `\u5907\u4EFD\u635F\u574F\uFF1A${result2.errors[0] ?? "\u6821\u9A8C\u5931\u8D25"}` });
                  }
                  return json(res, 200, { backup: result2.preset }, { "cache-control": "no-store" });
                } catch (error) {
                  return json(res, 422, { error: `\u5907\u4EFD\u635F\u574F\uFF1A${safeErrorMessage(error)}` });
                }
              }
              const file = join2(presetDir(id), "preset.json");
              if (!existsSync2(file)) return json(res, 404, { error: `preset ${id} \u4E0D\u5B58\u5728` });
              let preset3;
              try {
                preset3 = JSON.parse(readFileSync2(file, "utf8"));
              } catch (error) {
                return json(res, 422, { error: `preset ${id} \u635F\u574F\uFF1A${safeErrorMessage(error)}` });
              }
              return json(res, 200, { preset: preset3 }, { "cache-control": "no-store" });
            }
            if (isCrossOrigin(req)) return json(res, 403, { error: "cross-origin request rejected" });
            if (req.method === "DELETE") {
              try {
                rmSync2(presetDir(id), { recursive: true, force: true });
              } catch (error) {
                return json(res, 500, { error: `\u5220\u9664\u5931\u8D25\uFF1A${safeErrorMessage(error)}` });
              }
              if (readActiveState(toolsEnv()).activePresetId === id) writeActiveState(toolsEnv(), null);
              return json(res, 200, { ok: true, id }, { "cache-control": "no-store" });
            }
            const raw = await readBody(req);
            if (raw === null) return json(res, 413, { error: "request body too large" });
            let parsed;
            try {
              parsed = JSON.parse(raw);
            } catch {
              return json(res, 400, { error: "invalid JSON body" });
            }
            const payload = parsed;
            const preset2 = payload?.preset;
            const result = validatePreset(preset2);
            if (!result.ok) return json(res, 422, { errors: result.errors });
            if (result.preset.id !== id) return json(res, 400, { error: "preset.id \u4E0E\u8DEF\u5F84\u4E0D\u4E00\u81F4" });
            try {
              mkdirSync2(presetDir(id), { recursive: true });
              writeFileAtomic(join2(presetDir(id), "preset.json"), JSON.stringify(result.preset, null, 2));
              if (payload?.backup !== void 0) {
                writeFileAtomic(join2(presetDir(id), "backup.json"), JSON.stringify(payload.backup, null, 2));
              }
            } catch (error) {
              return json(res, 500, { error: `\u5199\u5165\u5931\u8D25\uFF1A${safeErrorMessage(error)}` });
            }
            return json(res, 200, { ok: true, id }, { "cache-control": "no-store" });
          } catch (error) {
            json(res, 500, { error: safeErrorMessage(error) });
          }
        }
      }, "presets/:id", disposers);
      registerSafe(webServer, {
        kind: "exact",
        path: `${ROUTE_PREFIX}/active`,
        handler: async (req, res) => {
          try {
            if (req.method !== "GET" && req.method !== "PUT") {
              return json(res, 405, { error: "method not allowed" }, { allow: "GET, PUT" });
            }
            if (req.method === "GET") {
              const active = readActiveState(toolsEnv());
              return json(res, 200, { activePresetId: active.activePresetId, revision: active.revision }, { "cache-control": "no-store" });
            }
            if (isCrossOrigin(req)) return json(res, 403, { error: "cross-origin request rejected" });
            const raw = await readBody(req);
            if (raw === null) return json(res, 413, { error: "request body too large" });
            let body;
            try {
              body = JSON.parse(raw);
            } catch {
              return json(res, 400, { error: "invalid JSON body" });
            }
            const id = body?.activePresetId;
            if (id !== null && (typeof id !== "string" || !safePresetId(id))) {
              return json(res, 400, { error: "activePresetId \u5FC5\u987B\u662F\u5408\u6CD5\u9884\u8BBE id \u6216 null" });
            }
            if (id !== null && !resolvablePresetId(toolsEnv(), id)) {
              return json(res, 400, { error: `\u9884\u8BBE\u300C${id}\u300D\u4E0D\u5B58\u5728\uFF0C\u65E0\u6CD5\u8BBE\u4E3A\u6D3B\u52A8` });
            }
            try {
              writeActiveState(toolsEnv(), id);
            } catch (error) {
              return json(res, 500, { error: `\u5199\u5165\u5931\u8D25\uFF1A${safeErrorMessage(error)}` });
            }
            return json(res, 200, { ok: true, activePresetId: id }, { "cache-control": "no-store" });
          } catch (error) {
            json(res, 500, { error: safeErrorMessage(error) });
          }
        }
      }, "active", disposers);
      registerSafe(webServer, {
        kind: "exact",
        path: `${ROUTE_PREFIX}/config`,
        handler: async (req, res) => {
          try {
            if (req.method !== "GET" && req.method !== "PUT") {
              return json(res, 405, { error: "method not allowed" }, { allow: "GET, PUT" });
            }
            if (req.method === "GET") {
              let tier2 = "standard";
              try {
                const raw2 = JSON.parse(readFileSync2(CONFIG_FILE, "utf8"));
                if (raw2.tier === "simple" || raw2.tier === "standard") tier2 = raw2.tier;
              } catch {
              }
              return json(res, 200, { tier: tier2 }, { "cache-control": "no-store" });
            }
            if (isCrossOrigin(req)) return json(res, 403, { error: "cross-origin request rejected" });
            const raw = await readBody(req);
            if (raw === null) return json(res, 413, { error: "request body too large" });
            let body;
            try {
              body = JSON.parse(raw);
            } catch {
              return json(res, 400, { error: "invalid JSON body" });
            }
            const tier = body?.tier;
            if (tier !== "simple" && tier !== "standard") {
              return json(res, 400, { error: "tier \u5FC5\u987B\u662F simple | standard" });
            }
            try {
              mkdirSync2(DATA_DIR, { recursive: true });
              writeFileAtomic(CONFIG_FILE, JSON.stringify({ tier }));
            } catch (error) {
              return json(res, 500, { error: `\u5199\u5165\u5931\u8D25\uFF1A${safeErrorMessage(error)}` });
            }
            return json(res, 200, { ok: true, tier }, { "cache-control": "no-store" });
          } catch (error) {
            json(res, 500, { error: safeErrorMessage(error) });
          }
        }
      }, "config", disposers);
      registerSafe(webServer, {
        kind: "exact",
        path: `${ROUTE_PREFIX}/status`,
        handler: async (req, res) => {
          try {
            if (req.method !== "GET") return json(res, 405, { error: "method not allowed; use GET" }, { allow: "GET" });
            return json(res, 200, { tier: "standard", toolsRegistered: isToolsRegistered() }, { "cache-control": "no-store" });
          } catch (error) {
            json(res, 500, { error: safeErrorMessage(error) });
          }
        }
      }, "status", disposers);
      registerSafe(webServer, {
        kind: "exact",
        path: `${ROUTE_PREFIX}/export-zip`,
        handler: async (req, res) => {
          try {
            if (req.method !== "POST") return json(res, 405, { error: "method not allowed; use POST" }, { allow: "POST" });
            if (isCrossOrigin(req)) return json(res, 403, { error: "cross-origin request rejected" });
            const raw = await readBody(req);
            if (raw === null) return json(res, 413, { error: "request body too large" });
            let parsed;
            try {
              parsed = JSON.parse(raw);
            } catch {
              return json(res, 400, { error: "invalid JSON body" });
            }
            const result = validatePreset(parsed?.preset);
            if (!result.ok) return json(res, 422, { errors: result.errors });
            const preset2 = result.preset;
            const exportedPreset = embedAssetsToPreset(preset2);
            const manifest = {
              id: preset2.id,
              name: preset2.name,
              edition: preset2.edition,
              version: 1,
              dshVersion: preset2.targetDshVersion ?? "",
              exportedAt: (/* @__PURE__ */ new Date()).toISOString()
            };
            const zip = zipStore([
              { name: "preset.json", data: new TextEncoder().encode(JSON.stringify(exportedPreset, null, 2)) },
              { name: "cover.svg", data: new TextEncoder().encode(coverSvgFor(preset2)) },
              { name: "manifest.json", data: new TextEncoder().encode(JSON.stringify(manifest, null, 2)) }
            ]);
            res.writeHead(200, {
              "content-type": "application/zip",
              "content-disposition": `attachment; filename="${preset2.id}.zip"`,
              "content-length": String(zip.length),
              "cache-control": "no-store"
            });
            res.end(zip);
          } catch (error) {
            json(res, 500, { error: safeErrorMessage(error) });
          }
        }
      }, "export-zip", disposers);
      registerSafe(webServer, {
        kind: "exact",
        path: `${ROUTE_PREFIX}/import-zip`,
        handler: async (req, res) => {
          try {
            if (req.method !== "POST") return json(res, 405, { error: "method not allowed; use POST" }, { allow: "POST" });
            if (isCrossOrigin(req)) return json(res, 403, { error: "cross-origin request rejected" });
            const buffer = await readBodyBuffer(req, ZIP_BODY_LIMIT);
            if (buffer === null) return json(res, 413, { error: "request body too large" });
            const { entries, errors: zipErrors } = parseZip(buffer);
            const presetEntry = entries.find((entry) => entry.name === "preset.json");
            if (presetEntry === void 0) {
              return json(res, 422, { error: `zip \u4E2D\u7F3A\u5C11 preset.json${zipErrors.length > 0 ? `\uFF08${zipErrors[0]}\uFF09` : ""}` });
            }
            let rawPreset;
            try {
              rawPreset = JSON.parse(new TextDecoder().decode(presetEntry.data));
            } catch {
              return json(res, 400, { error: "zip \u5185 preset.json \u4E0D\u662F\u5408\u6CD5 JSON" });
            }
            const result = validatePreset(rawPreset);
            if (!result.ok) return json(res, 422, { errors: result.errors });
            let id = result.preset.id;
            const existing = new Set(listLibraryIds());
            let suffix = 1;
            while (existing.has(id)) {
              id = suffix === 1 ? `${result.preset.id}-imported` : `${result.preset.id}-imported-${suffix}`;
              suffix += 1;
            }
            const imported = { ...result.preset, id };
            const stored = storeEmbeddedAssets(imported);
            try {
              mkdirSync2(presetDir(id), { recursive: true });
              writeFileAtomic(join2(presetDir(id), "preset.json"), JSON.stringify(stored, null, 2));
            } catch (error) {
              return json(res, 500, { error: `\u5199\u5165\u5931\u8D25\uFF1A${safeErrorMessage(error)}` });
            }
            return json(res, 200, { ok: true, id }, { "cache-control": "no-store" });
          } catch (error) {
            json(res, 500, { error: safeErrorMessage(error) });
          }
        }
      }, "import-zip", disposers);
      registerSafe(webServer, {
        kind: "exact",
        path: `${ROUTE_PREFIX}/assets`,
        handler: async (req, res) => {
          try {
            if (req.method === "GET") {
              return json(res, 200, { assets: listAssetMetas() }, { "cache-control": "no-store" });
            }
            if (req.method !== "PUT") {
              return json(res, 405, { error: "method not allowed" }, { allow: "GET, PUT" });
            }
            if (isCrossOrigin(req)) return json(res, 403, { error: "cross-origin request rejected" });
            const url = new URL(req.url ?? "/", "http://dsh.internal");
            const name2 = (url.searchParams.get("name") ?? "asset").slice(0, 64);
            const mime = url.searchParams.get("mime") ?? "image/png";
            if (!mime.startsWith("image/")) return json(res, 400, { error: "mime \u5FC5\u987B\u662F image/*" });
            const bytes = await readBodyBuffer(req, ASSET_BODY_LIMIT);
            if (bytes === null) return json(res, 413, { error: "\u7D20\u6750\u8D85\u8FC7\u4E0A\u9650\uFF08\u226420MB\uFF09" });
            if (bytes.length === 0) return json(res, 400, { error: "\u7A7A\u6587\u4EF6" });
            if (bytes.length > MAX_ASSET_FILE_SIZE) {
              return json(res, 413, { error: "\u7D20\u6750\u8D85\u8FC7\u4E0A\u9650\uFF08\u226420MB\uFF09" });
            }
            if (listAssetMetas().length >= MAX_ASSETS) {
              return json(res, 400, { error: `\u7D20\u6750\u5E93\u5DF2\u8FBE\u4E0A\u9650 ${MAX_ASSETS} \u4E2A` });
            }
            const layersRaw = url.searchParams.get("layers");
            let layers;
            if (layersRaw !== null) {
              try {
                const parsed = JSON.parse(layersRaw);
                if (typeof parsed.animAssetId !== "string" || !safePresetId(parsed.animAssetId) || typeof parsed.x !== "number" || typeof parsed.y !== "number" || typeof parsed.w !== "number" || typeof parsed.h !== "number" || !Number.isFinite(parsed.x) || !Number.isFinite(parsed.y) || !Number.isFinite(parsed.w) || !Number.isFinite(parsed.h) || parsed.w <= 0 || parsed.h <= 0) {
                  return json(res, 400, { error: "layers \u53C2\u6570\u975E\u6CD5\uFF08\u9700 {animAssetId,x,y,w,h} \u6570\u5B57\u77E9\u5F62\uFF09" });
                }
                layers = { animAssetId: parsed.animAssetId, x: parsed.x, y: parsed.y, w: parsed.w, h: parsed.h };
              } catch {
                return json(res, 400, { error: "layers \u53C2\u6570\u975E\u6CD5\uFF08JSON \u89E3\u6790\u5931\u8D25\uFF09" });
              }
            }
            const id = genId("asset");
            try {
              mkdirSync2(ASSETS_DIR, { recursive: true });
              writeAssetFile(id, name2, mime, bytes, layers);
            } catch (error) {
              return json(res, 500, { error: `\u5199\u5165\u5931\u8D25\uFF1A${safeErrorMessage(error)}` });
            }
            return json(res, 200, { ok: true, id, name: name2, mime, size: bytes.length }, { "cache-control": "no-store" });
          } catch (error) {
            json(res, 500, { error: safeErrorMessage(error) });
          }
        }
      }, "assets", disposers);
      registerSafe(webServer, {
        kind: "prefix",
        // 修复轮 #33：prefix 路径不能带尾斜杠——宿主路由器按 `${prefix}/` 拼接匹配，
        // 带尾斜杠会变双斜杠导致永不命中（请求落到 SPA 兜底返回 HTML）
        path: `${ROUTE_PREFIX}/assets`,
        handler: async (req, res) => {
          try {
            if (req.method !== "GET" && req.method !== "DELETE") {
              return json(res, 405, { error: "method not allowed" }, { allow: "GET, DELETE" });
            }
            const pathname = new URL(req.url ?? "/", "http://dsh.internal").pathname;
            const rest = stripPrefix(pathname, `${ROUTE_PREFIX}/assets`);
            const decoded = rest === null ? null : decodeSegment(rest);
            if (decoded === null || !safePresetId(decoded)) return json(res, 400, { error: "invalid asset id" });
            if (req.method === "DELETE") {
              if (isCrossOrigin(req)) return json(res, 403, { error: "cross-origin request rejected" });
              const refs = findAssetRefPresets(decoded);
              const cleaned = stripAssetRefsFromPresets(decoded);
              const degraded = stripLayersRefsFromAssets(decoded);
              try {
                deleteAssetFile(decoded);
              } catch (error) {
                return json(res, 500, { error: `\u5220\u9664\u5931\u8D25\uFF1A${safeErrorMessage(error)}` });
              }
              return json(res, 200, {
                ok: true,
                id: decoded,
                refs: refs.map((r) => r.name),
                refCount: refs.length,
                cleanedPresets: cleaned,
                degradedCompositions: degraded
              }, { "cache-control": "no-store" });
            }
            try {
              const meta = readAssetMeta(decoded);
              const bytes = readFileSync2(assetFilePath(decoded));
              res.writeHead(200, {
                "content-type": meta?.mime ?? "application/octet-stream",
                "content-length": String(bytes.length),
                "cache-control": "no-store"
              });
              res.end(bytes);
            } catch {
              return json(res, 404, { error: `\u7D20\u6750 ${decoded} \u4E0D\u5B58\u5728` });
            }
          } catch (error) {
            json(res, 500, { error: safeErrorMessage(error) });
          }
        }
      }, "assets/:id", disposers);
      return () => {
        for (const dispose of disposers) dispose();
      };
    }, "ui-presets: routes");
  });
}
function listLibraryIds() {
  const out = [];
  let dirs = [];
  try {
    dirs = readdirSync2(PRESETS_DIR);
  } catch {
  }
  for (const id of dirs) if (safePresetId(id)) out.push(id);
  for (const demo of DEMO_PRESETS) if (!out.includes(demo.id)) out.push(demo.id);
  return out;
}
function assetFilePath(id) {
  return join2(ASSETS_DIR, id);
}
function assetMetaFile(id) {
  return join2(ASSETS_DIR, `${id}.json`);
}
function writeAssetFile(id, name2, mime, bytes, layers) {
  writeFileSync2(assetFilePath(id), bytes);
  writeFileAtomic(assetMetaFile(id), JSON.stringify(layers === void 0 ? { id, name: name2, mime, size: bytes.length } : { id, name: name2, mime, size: bytes.length, layers }));
}
function readAssetMeta(id) {
  try {
    const meta = JSON.parse(readFileSync2(assetMetaFile(id), "utf8"));
    if (typeof meta.id !== "string" || typeof meta.name !== "string" || typeof meta.mime !== "string") return null;
    return meta;
  } catch {
    return null;
  }
}
function listAssetMetas() {
  const out = [];
  let files = [];
  try {
    files = readdirSync2(ASSETS_DIR);
  } catch {
    return out;
  }
  for (const file of files) {
    if (!file.endsWith(".json")) continue;
    const meta = readAssetMeta(file.slice(0, -5));
    if (meta !== null) out.push(meta);
  }
  out.sort((a, b) => a.id.localeCompare(b.id));
  return out;
}
function deleteAssetFile(id) {
  rmSync2(assetFilePath(id), { force: true });
  rmSync2(assetMetaFile(id), { force: true });
}
function stripLayersRefsFromAssets(assetId) {
  let n = 0;
  for (const meta of listAssetMetas()) {
    if (meta.layers?.animAssetId !== assetId) continue;
    const { layers: _drop, ...rest } = meta;
    try {
      writeFileAtomic(assetMetaFile(meta.id), JSON.stringify(rest));
    } catch {
      continue;
    }
    n += 1;
  }
  return n;
}
function embedAssetsToPreset(preset2) {
  if (preset2.assets === void 0) return preset2;
  const assets = preset2.assets.map((asset) => {
    const entry = { ...asset };
    if (entry.dataUrl === void 0) {
      try {
        const bytes = readFileSync2(assetFilePath(asset.id));
        entry.dataUrl = `data:${asset.mime};base64,${Buffer.from(bytes).toString("base64")}`;
      } catch {
      }
    }
    if (entry.layers === void 0) {
      const meta = readAssetMeta(asset.id);
      if (meta?.layers !== void 0) entry.layers = meta.layers;
    }
    return entry;
  });
  return { ...preset2, assets };
}
function storeEmbeddedAssets(preset2) {
  if (preset2.assets === void 0) return preset2;
  const existing = new Set(listAssetMetas().map((meta) => meta.id));
  const used = /* @__PURE__ */ new Set();
  const assets = preset2.assets.map((asset) => {
    if (asset.dataUrl === void 0) return asset;
    const comma = asset.dataUrl.indexOf(",");
    if (comma < 0) return { id: asset.id, name: asset.name, mime: asset.mime };
    try {
      const bytes = Uint8Array.from(Buffer.from(asset.dataUrl.slice(comma + 1), "base64"));
      if (bytes.length > MAX_ASSET_FILE_SIZE) return { id: asset.id, name: asset.name, mime: asset.mime };
      if (!existing.has(asset.id) && !used.has(asset.id)) {
        if (listAssetMetas().length >= MAX_ASSETS) return { id: asset.id, name: asset.name, mime: asset.mime };
        used.add(asset.id);
        mkdirSync2(ASSETS_DIR, { recursive: true });
        writeAssetFile(asset.id, asset.name, asset.mime, bytes, asset.layers);
        existing.add(asset.id);
      }
      return { id: asset.id, name: asset.name, mime: asset.mime };
    } catch {
    }
    return { id: asset.id, name: asset.name, mime: asset.mime };
  });
  return { ...preset2, assets };
}
function findAssetRefPresets(assetId) {
  const out = [];
  let dirs = [];
  try {
    dirs = readdirSync2(PRESETS_DIR);
  } catch {
    return out;
  }
  for (const dir of dirs) {
    if (!safePresetId(dir)) continue;
    try {
      const preset2 = JSON.parse(readFileSync2(join2(PRESETS_DIR, dir, "preset.json"), "utf8"));
      const refsAssets = (preset2.assets ?? []).some((a) => a.id === assetId);
      const refsWidgets = (preset2.widgets ?? []).some((w) => Object.values(w.params ?? {}).includes(assetId));
      if (refsAssets || refsWidgets) out.push({ id: preset2.id, name: preset2.name });
    } catch {
    }
  }
  return out;
}
function stripAssetRefsFromPresets(assetId) {
  let cleaned = 0;
  let dirs = [];
  try {
    dirs = readdirSync2(PRESETS_DIR);
  } catch {
    return cleaned;
  }
  for (const dir of dirs) {
    if (!safePresetId(dir)) continue;
    const file = join2(PRESETS_DIR, dir, "preset.json");
    try {
      const preset2 = JSON.parse(readFileSync2(file, "utf8"));
      const assets = preset2.assets ?? [];
      const widgets = preset2.widgets ?? [];
      const assetsRef = assets.some((a) => a.id === assetId);
      const nextAssets = assets.filter((a) => a.id !== assetId);
      let changed = assetsRef;
      const nextWidgets = widgets.map((w) => {
        const params = { ...w.params ?? {} };
        for (const [key, value] of Object.entries(params)) {
          if (value === assetId) {
            params[key] = "";
            changed = true;
          }
        }
        return { ...w, params };
      });
      let nextCover = preset2.cover;
      if (preset2.cover?.assetId === assetId) {
        nextCover = void 0;
        changed = true;
      }
      if (!changed) continue;
      const next = {
        ...preset2,
        ...nextAssets.length > 0 || assets.length > 0 ? { assets: nextAssets } : {},
        widgets: nextWidgets,
        ...nextCover !== void 0 ? { cover: nextCover } : {}
      };
      writeFileAtomic(file, JSON.stringify(next, null, 2));
      cleaned += 1;
    } catch {
    }
  }
  return cleaned;
}
export {
  ACTIVE_FILE,
  ASSETS_DIR,
  CONFIG_FILE,
  Config,
  DATA_DIR,
  DSH_HOME,
  PRESETS_DIR,
  PRESETS_PATH,
  ROUTE_PREFIX,
  apply,
  inject,
  name
};
