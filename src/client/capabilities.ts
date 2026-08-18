/**
 * 档位接入（M1 收尾：掩码驱动 UI 收敛）。
 * 当前档位来源：DEFAULT_CAPABILITIES（standard）。
 * 原则（评审 §5）：掩码只做 UI 收敛，不做引擎能力裁剪。
 * #96（审计）：subscribeCapabilities 无消费者已删（无 UI 订阅档位变化）。
 */
import { maskOf, DEFAULT_CAPABILITIES, type Capabilities, type CapabilityKey } from '../core/editions.ts'

/** 当前运行档位（M2-2b 起由插件自有配置决定，启动时拉取）。 */
let currentCapabilities: Capabilities = DEFAULT_CAPABILITIES

export function setCapabilities(capabilities: Capabilities): void {
  if (currentCapabilities === capabilities) return
  currentCapabilities = capabilities
}

export function getCapabilities(): Capabilities {
  return currentCapabilities
}

/** 查询当前档位是否具备某能力。 */
export function hasCapability(key: CapabilityKey): boolean {
  return maskOf(currentCapabilities)[key]
}
