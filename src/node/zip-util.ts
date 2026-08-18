/**
 * 最小 ZIP 工具（M2-5）：store 模式（无压缩）写入 + 读取。
 * 零依赖（不引 jszip/archiver——插件保持零外部运行时依赖）；
 * 三件套（JSON/SVG/Manifest）体积小，store 足够。
 * 纯函数可单测：zipStore 写 → parseZip 读 → 内容一致。
 */

const LOCAL_SIG = 0x04034b50
const CENTRAL_SIG = 0x02014b50
const EOCD_SIG = 0x06054b50

/** CRC32 表（标准多项式 0xEDB88320）。 */
const CRC_TABLE = (() => {
  const table = new Uint32Array(256)
  for (let n = 0; n < 256; n += 1) {
    let c = n
    for (let k = 0; k < 8; k += 1) c = (c & 1) !== 0 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    table[n] = c >>> 0
  }
  return table
})()

export function crc32(data: Uint8Array): number {
  let crc = 0xffffffff
  for (let i = 0; i < data.length; i += 1) {
    crc = CRC_TABLE[(crc ^ data[i]) & 0xff] ^ (crc >>> 8)
  }
  return (crc ^ 0xffffffff) >>> 0
}

export interface ZipEntry {
  name: string
  data: Uint8Array
}

function encodeName(name: string): Uint8Array {
  return new TextEncoder().encode(name)
}

/** 写 ZIP（store 模式）：entries → 字节。 */
export function zipStore(entries: ZipEntry[]): Uint8Array {
  const chunks: Uint8Array[] = []
  const central: Uint8Array[] = []
  let offset = 0
  for (const entry of entries) {
    const nameBytes = encodeName(entry.name)
    const crc = crc32(entry.data)
    const size = entry.data.length
    // 本地文件头
    const header = new Uint8Array(30)
    const dv = new DataView(header.buffer)
    dv.setUint32(0, LOCAL_SIG, true)
    dv.setUint16(4, 20, true) // version needed
    dv.setUint16(6, 0, true) // flags
    dv.setUint16(8, 0, true) // method: store
    dv.setUint16(10, 0, true) // mod time
    dv.setUint16(12, 0x21, true) // mod date (1980-01-01)
    dv.setUint32(14, crc, true)
    dv.setUint32(18, size, true)
    dv.setUint32(22, size, true)
    dv.setUint16(26, nameBytes.length, true)
    dv.setUint16(28, 0, true) // extra len
    chunks.push(header, nameBytes, entry.data)
    // 中央目录
    const cd = new Uint8Array(46)
    const cdv = new DataView(cd.buffer)
    cdv.setUint32(0, CENTRAL_SIG, true)
    cdv.setUint16(4, 20, true) // version made by
    cdv.setUint16(6, 20, true) // version needed
    cdv.setUint16(8, 0, true) // flags
    cdv.setUint16(10, 0, true) // method
    cdv.setUint16(12, 0, true)
    cdv.setUint16(14, 0x21, true)
    cdv.setUint32(16, crc, true)
    cdv.setUint32(20, size, true)
    cdv.setUint32(24, size, true)
    cdv.setUint16(28, nameBytes.length, true)
    cdv.setUint16(30, 0, true)
    cdv.setUint16(32, 0, true)
    cdv.setUint16(34, 0, true)
    cdv.setUint16(36, 0, true)
    cdv.setUint32(38, 0, true) // external attrs
    cdv.setUint32(42, offset, true) // local header offset
    central.push(cd, nameBytes)
    offset += header.length + nameBytes.length + size
  }
  const cdSize = central.reduce((sum, chunk) => sum + chunk.length, 0)
  // EOCD
  const eocd = new Uint8Array(22)
  const edv = new DataView(eocd.buffer)
  edv.setUint32(0, EOCD_SIG, true)
  edv.setUint16(4, 0, true)
  edv.setUint16(6, 0, true)
  edv.setUint16(8, entries.length, true)
  edv.setUint16(10, entries.length, true)
  edv.setUint32(12, cdSize, true)
  edv.setUint32(16, offset, true)
  edv.setUint16(20, 0, true)
  const total = offset + cdSize + eocd.length
  const out = new Uint8Array(total)
  let pos = 0
  for (const chunk of chunks) { out.set(chunk, pos); pos += chunk.length }
  for (const chunk of central) { out.set(chunk, pos); pos += chunk.length }
  out.set(eocd, pos)
  return out
}

/** 读 ZIP（store 模式条目）：解析中央目录；压缩条目跳过（返回 method 标注）。 */
export function parseZip(buffer: Uint8Array): { entries: ZipEntry[]; errors: string[] } {
  const errors: string[] = []
  const entries: ZipEntry[] = []
  // 从尾部找 EOCD（min 22 字节）
  const min = buffer.length - 22 - 65535
  const start = Math.max(0, min)
  let eocdIndex = -1
  for (let i = buffer.length - 22; i >= start; i -= 1) {
    if (buffer[i] === 0x50 && buffer[i + 1] === 0x4b && buffer[i + 2] === 0x05 && buffer[i + 3] === 0x06) {
      eocdIndex = i
      break
    }
  }
  if (eocdIndex < 0) {
    errors.push('不是合法的 ZIP 文件（缺少 EOCD）')
    return { entries, errors }
  }
  const edv = new DataView(buffer.buffer, buffer.byteOffset + eocdIndex, 22)
  const entryCount = edv.getUint16(10, true)
  let cdOffset = edv.getUint32(16, true)
  for (let i = 0; i < entryCount; i += 1) {
    if (cdOffset + 46 > buffer.length) {
      errors.push(`中央目录条目 ${i} 越界`)
      break
    }
    const cdv = new DataView(buffer.buffer, buffer.byteOffset + cdOffset, 46)
    if (cdv.getUint32(0, true) !== CENTRAL_SIG) {
      errors.push(`中央目录条目 ${i} 签名错误`)
      break
    }
    const method = cdv.getUint16(10, true)
    const size = cdv.getUint32(24, true)
    const nameLen = cdv.getUint16(28, true)
    const extraLen = cdv.getUint16(30, true)
    const commentLen = cdv.getUint16(32, true)
    const localOffset = cdv.getUint32(42, true)
    const nameBytes = buffer.slice(cdOffset + 46, cdOffset + 46 + nameLen)
    const name = new TextDecoder().decode(nameBytes)
    if (method !== 0) {
      errors.push(`条目 ${name} 使用压缩（method ${method}），仅支持 store——已跳过`)
    } else if (localOffset + 30 + nameLen + extraLen + size <= buffer.length) {
      // #96（审计）：边界检查计入 extraLen（原漏计——恶意大 extraLen 可让 dataStart+size
      // 越过缓冲区，buffer.slice 静默截断出更短数据且不记 errors）
      const dataStart = localOffset + 30 + nameLen + extraLen
      const data = buffer.slice(dataStart, dataStart + size)
      entries.push({ name, data })
    } else {
      errors.push(`条目 ${name} 数据越界`)
    }
    cdOffset += 46 + nameLen + extraLen + commentLen
  }
  return { entries, errors }
}
