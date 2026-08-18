/**
 * 当前 DSH 版本（版本契约基线，评审 P1-10/P2-11 修复：集中单一常量）。
 * 更新点：DSH 升级后同步改这里（或后续改为从宿主/环境读取注入）。
 * 注意：catalog-data.ts 的 CATALOG_DSH_VERSION 由 gen-catalog.mjs 生成，与此常量相互独立。
 */
export const CURRENT_DSH_VERSION = '0.1.0-rc.5'
