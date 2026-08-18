/**
 * #86 纯 JS GIF 编解码器（壁纸图层合成"多 GIF 拼接"支持——canvas 只能画 GIF 首帧，
 * 必须自己解码逐帧位图再重编码为动图）。零依赖纯函数（node 可单测，浏览器可复用）。
 * - decodeGif：GIF87a/89a 解析（全局/局部调色板、GCE 延时/透明/清除方式、交错、LZW 解码、
 *   部分帧、帧合成到全画布 RGBA）
 * - encodeGif：GIF89a 编码（NETSCAPE 循环、逐帧局部调色板 4-4-4 桶量化、透明索引、
 *   LZW 编码含字典满清码、清除方式 2）
 * 局限（如实记录）：GIF 无逐像素 alpha（透明=索引）；调色板 256 色上限。
 */

export interface GifFrame {
  /** RGBA（全画布尺寸，w*h*4）。 */
  pixels: Uint8ClampedArray
  /** 帧延时（百分之一秒）。 */
  delayCs: number
}

export interface DecodedGif {
  width: number
  height: number
  frames: GifFrame[]
}

// ---- 解码 ----

function readBlocks(data: Uint8Array, pos: { p: number }): Uint8Array {
  const out: number[] = []
  while (true) {
    // #96（审计）：截断数据防御——长度字节越界 / 子块越界都按 EOF 终止，防死循环与 NaN 推进
    if (pos.p >= data.length) break
    const len = data[pos.p]
    pos.p += 1
    if (len === 0) break
    if (pos.p + len > data.length) {
      for (let i = pos.p; i < data.length; i++) out.push(data[i])
      pos.p = data.length
      break
    }
    for (let i = 0; i < len; i++) out.push(data[pos.p + i])
    pos.p += len
  }
  return new Uint8Array(out)
}

/** LZW 解码（GIF 变长码）。注意：字典是稀疏数组——编码器首个新增项编码 = clear+2 = 258，
 * 解码器必须把条目存在同一下标（256/257 是 clear/eoi 保留码位，绝不使用）。 */
function lzwDecode(minCodeSize: number, data: Uint8Array): number[] {
  const clear = 1 << minCodeSize
  const eoi = clear + 1
  let codeSize = minCodeSize + 1
  const dict: number[][] = []
  for (let i = 0; i < clear; i++) dict[i] = [i]
  let next = clear + 2
  let prev = -1
  const out: number[] = []
  let bitBuf = 0
  let bitPos = 0
  let pos = 0
  const readCode = (): number => {
    while (bitPos < codeSize) {
      if (pos >= data.length) return eoi
      bitBuf |= data[pos] << bitPos
      pos += 1
      bitPos += 8
    }
    const code = bitBuf & ((1 << codeSize) - 1)
    bitBuf >>>= codeSize
    bitPos -= codeSize
    return code
  }
  while (true) {
    const code = readCode()
    if (code === eoi) break
    if (code === clear) {
      codeSize = minCodeSize + 1
      for (let i = 0; i < clear; i++) dict[i] = [i]
      next = clear + 2
      prev = -1
      continue
    }
    let entry: number[] | undefined
    if (code < next) entry = dict[code]
    else if (code === next && prev >= 0 && dict[prev] !== undefined) entry = [...dict[prev], dict[prev][0]]
    else break
    if (entry === undefined) break
    out.push(...entry)
    if (prev >= 0 && next < 4096) {
      dict[next] = [...dict[prev], entry[0]]
      next += 1
      if (next === (1 << codeSize) && codeSize < 12) codeSize += 1
    }
    prev = code
  }
  return out
}

/** 交错行序还原（GIF 四遍序）。 */
function deinterlace(w: number, h: number, rows: number[]): number[] {
  const out: number[] = new Array(w * h).fill(0)
  let pos = 0
  const passes: Array<[number, number]> = [[0, 8], [4, 8], [2, 4], [1, 2]]
  for (const [start, step] of passes) {
    for (let y = start; y < h; y += step) {
      for (let x = 0; x < w; x++) out[y * w + x] = rows[pos++]
    }
  }
  return out
}

/**
 * 解码 GIF → 逐帧全画布 RGBA + 延时。
 * 帧合成语义：逐帧绘制到画布（透明索引保留原像素），快照为该帧显示结果，再按清除方式处理。
 */
export function decodeGif(bytes: Uint8Array): DecodedGif {
  const sig = String.fromCharCode(bytes[0], bytes[1], bytes[2])
  if (sig !== 'GIF') throw new Error('不是 GIF 文件')
  let p = 6
  const width = bytes[p] | (bytes[p + 1] << 8)
  const height = bytes[p + 2] | (bytes[p + 3] << 8)
  const packed = bytes[p + 4]
  const gctFlag = (packed & 0x80) !== 0
  const gctSize = 2 << (packed & 0x07)
  const bgIndex = bytes[p + 5]
  p += 7
  let gct: Uint8Array | null = null
  if (gctFlag) {
    gct = bytes.slice(p, p + gctSize * 3)
    p += gctSize * 3
  }
  const total = width * height
  // #96（审计）：画布尺寸上限——16 位头部最大 65535² 可触发 17GB 分配（恶意/损坏 GIF 的
  // 浏览器线程 OOM）；32M 像素（如 8192×4096）≈ 128MB/帧已是壁纸场景的数十倍余量
  if (total <= 0 || total > 32 * 1024 * 1024) throw new Error('GIF 尺寸过大（>8192×4096 像素）')
  let canvas = new Uint8ClampedArray(total * 4) // 透明底
  let prevCanvas = new Uint8ClampedArray(total * 4)
  const frames: GifFrame[] = []
  let loopCount = 0
  let sawNetscape = false

  while (p < bytes.length) {
    const block = bytes[p]
    p += 1
    if (block === 0x3b) break // trailer
    if (block === 0x21) {
      const label = bytes[p]
      p += 1
      if (label === 0xf9) {
        const size = bytes[p]
        const gce = bytes.slice(p + 1, p + 1 + size)
        p += 1 + size + 1
        // gce: [packed, delayLo, delayHi, transIndex]
        const transFlag = (gce[0] & 0x01) !== 0
        const delayCs = (gce[2] << 8 | gce[1]) === 0 ? 10 : (gce[2] << 8 | gce[1])
        const transIndex = gce[3]
        // 继续读图像描述
        const imgBlock = bytes[p]
        if (imgBlock !== 0x2c) { p = skipToNextBlock(bytes, p); continue }
        p += 1
        const left = bytes[p] | (bytes[p + 1] << 8)
        const top = bytes[p + 2] | (bytes[p + 3] << 8)
        const fw = bytes[p + 4] | (bytes[p + 5] << 8)
        const fh = bytes[p + 6] | (bytes[p + 7] << 8)
        const ipacked = bytes[p + 8]
        p += 9
        // 防御：垃圾尺寸描述符（越界/零）→ 跳过绘制（防超大循环挂死）
        if (fw === 0 || fh === 0 || left + fw > width || top + fh > height) {
          p = skipImageRest(bytes, p, ipacked)
          frames.push({ pixels: new Uint8ClampedArray(canvas), delayCs })
          continue
        }
        const lctFlag = (ipacked & 0x80) !== 0
        const interlaced = (ipacked & 0x40) !== 0
        const lctSize = 2 << (ipacked & 0x07)
        let lct: Uint8Array | null = null
        if (lctFlag) { lct = bytes.slice(p, p + lctSize * 3); p += lctSize * 3 }
        const palette = lct ?? gct
        if (palette === null) throw new Error('缺少调色板')
        const minCodeSize = bytes[p]
        p += 1
        const pos = { p }
        const blockData = readBlocks(bytes, pos)
        p = pos.p
        let indices = lzwDecode(minCodeSize, blockData)
        if (interlaced) indices = deinterlace(fw, fh, indices)
        // 绘制到画布
        for (let y = 0; y < fh; y++) {
          for (let x = 0; x < fw; x++) {
            const idx = indices[y * fw + x]
            if (idx === undefined) continue
            const dx = left + x
            const dy = top + y
            if (dx < 0 || dy < 0 || dx >= width || dy >= height) continue
            if (transFlag && idx === transIndex) continue
            const ci = idx * 3
            const o = (dy * width + dx) * 4
            canvas[o] = palette[ci]
            canvas[o + 1] = palette[ci + 1]
            canvas[o + 2] = palette[ci + 2]
            canvas[o + 3] = 255
          }
        }
        frames.push({ pixels: new Uint8ClampedArray(canvas), delayCs })
        // 清除方式
        const disposal = (gce[0] & 0x1c) >> 2
        if (disposal === 2) {
          for (let y = 0; y < fh; y++) {
            for (let x = 0; x < fw; x++) {
              const dx = left + x
              const dy = top + y
              if (dx < 0 || dy < 0 || dx >= width || dy >= height) continue
              const o = (dy * width + dx) * 4
              canvas[o] = 0; canvas[o + 1] = 0; canvas[o + 2] = 0; canvas[o + 3] = 0
            }
          }
        } else if (disposal === 3) {
          canvas = new Uint8ClampedArray(prevCanvas)
        }
        prevCanvas = new Uint8ClampedArray(canvas)
        continue
      }
      if (label === 0xff && !sawNetscape) {
        // 应用扩展块：读子块（p 指向 size 字节），检查 NETSCAPE2.0
        const pos = { p }
        const ext = readBlocks(bytes, pos)
        if (ext.length >= 3 && String.fromCharCode(ext[0], ext[1], ext[2]) === 'NET') {
          sawNetscape = true
          // ext = 'NETSCAPE2.0'(11) + [0x01, loopLo, loopHi](3)
          if (ext.length >= 14) loopCount = ext[12] | (ext[13] << 8)
        }
        p = skipToNextBlock(bytes, p)
        continue
      }
      p = skipToNextBlock(bytes, p)
      continue
    }
    if (block === 0x2c) {
      // 无 GCE 的裸图像（默认延时 10cs）
      const left = bytes[p] | (bytes[p + 1] << 8)
      const top = bytes[p + 2] | (bytes[p + 3] << 8)
      const fw = bytes[p + 4] | (bytes[p + 5] << 8)
      const fh = bytes[p + 6] | (bytes[p + 7] << 8)
      const ipacked = bytes[p + 8]
      p += 9
      // 防御：垃圾尺寸描述符 → 跳过绘制
      if (fw === 0 || fh === 0 || left + fw > width || top + fh > height) {
        p = skipImageRest(bytes, p, ipacked)
        frames.push({ pixels: new Uint8ClampedArray(canvas), delayCs: 10 })
        continue
      }
      const lctFlag = (ipacked & 0x80) !== 0
      const interlaced = (ipacked & 0x40) !== 0
      const lctSize = 2 << (ipacked & 0x07)
      let lct: Uint8Array | null = null
      if (lctFlag) { lct = bytes.slice(p, p + lctSize * 3); p += lctSize * 3 }
      const palette = lct ?? gct
      if (palette === null) throw new Error('缺少调色板')
      const minCodeSize = bytes[p]
      p += 1
      const pos = { p }
      const blockData = readBlocks(bytes, pos)
      p = pos.p
      let indices = lzwDecode(minCodeSize, blockData)
      if (interlaced) indices = deinterlace(fw, fh, indices)
      for (let y = 0; y < fh; y++) {
        for (let x = 0; x < fw; x++) {
          const idx = indices[y * fw + x]
          if (idx === undefined) continue
          const dx = left + x
          const dy = top + y
          if (dx < 0 || dy < 0 || dx >= width || dy >= height) continue
          const ci = idx * 3
          const o = (dy * width + dx) * 4
          canvas[o] = palette[ci]
          canvas[o + 1] = palette[ci + 1]
          canvas[o + 2] = palette[ci + 2]
          canvas[o + 3] = 255
        }
      }
      frames.push({ pixels: new Uint8ClampedArray(canvas), delayCs: 10 })
      prevCanvas = new Uint8ClampedArray(canvas)
      continue
    }
    p = skipToNextBlock(bytes, p)
  }
  return { width, height, frames }
}

/** 跳过未知扩展块（长度前缀子块直到 0x00）。 */
function skipToNextBlock(data: Uint8Array, start: number): number {
  let p = start
  while (p < data.length) {
    const len = data[p]
    p += 1
    if (len === 0) return p
    p += len
  }
  return p
}

/** 跳过图像描述剩余部分（LCT + 最小码长 + 数据块）——尺寸防御跳帧用。 */
function skipImageRest(data: Uint8Array, start: number, ipacked: number): number {
  let p = start
  if ((ipacked & 0x80) !== 0) p += (2 << (ipacked & 0x07)) * 3
  p += 1 // minCodeSize
  return skipToNextBlock(data, p)
}

// ---- 编码 ----

function crc32Table(): Uint32Array {
  const table = new Uint32Array(256)
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1))
    table[n] = c >>> 0
  }
  return table
}

/** LZW 编码（GIF 变长码，含字典满 4096 清码）。
 * #86 性能：数字键（prefix*256+char，Map<number>）每像素常数时间（1280×720 帧 39ms）。
 * #87b 关键语义：**延迟一拍建条目**——miss 时把上一轮记录的 (prev, ch) 入库，
 * 与解码器表增长节奏严格对齐（解码器要等下一码首像素才能建条目）。
 * 实证：maxwell-cat.gif 等真实 GIF 用 === 解码器完美解码；即时建条目的编码器
 * 码宽增长早一拍 → 自家往返错位（首个分歧 enc 509@10 vs dec 509@9）。
 * 双色/低色小输入码 <258 不暴露该差异（此前单测全绿的原因）。 */
function lzwEncode(indices: Uint8Array, minCodeSize: number): Uint8Array {
  const clear = 1 << minCodeSize
  const eoi = clear + 1
  let codeSize = minCodeSize + 1
  const dict = new Map<number, number>()
  let next = clear + 2
  let prev = -1
  let pendingKey = -1
  let skipAdd = false
  let bitBuf = 0
  let bitPos = 0
  const out: number[] = []
  const emit = (code: number): void => {
    bitBuf |= code << bitPos
    bitPos += codeSize
    while (bitPos >= 8) { out.push(bitBuf & 0xff); bitBuf >>>= 8; bitPos -= 8 }
  }
  emit(clear)
  for (const ch of indices) {
    if (prev < 0) { prev = ch; continue }
    const key = prev * 256 + ch
    const code = dict.get(key)
    if (code !== undefined) { prev = code; continue }
    emit(prev)
    // 延迟一拍入库（上一轮的条目；对齐解码器）——清码后的第一发射跳过建条目
    // （解码器清码后 prev=-1 也不建条目；否则新世代多一条 → 增宽错位，640×480 实测 break）
    const skip = skipAdd
    skipAdd = false
    if (pendingKey >= 0 && !skip) {
      if (next < 4096) {
        dict.set(pendingKey, next)
        next += 1
        if (next === (1 << codeSize) && codeSize < 12) codeSize += 1
      }
      if (next >= 4096) {
        // 字典满：当前串码已在顶部发射——只补发清码
        emit(clear)
        codeSize = minCodeSize + 1
        dict.clear()
        next = clear + 2
        skipAdd = true
      }
    }
    pendingKey = key
    prev = ch
  }
  if (prev >= 0) emit(prev)
  emit(eoi)
  if (bitPos > 0) out.push(bitBuf & 0xff)
  return new Uint8Array(out)
}

function chunk(type: string, data: Uint8Array): Uint8Array {
  const table = crc32Table()
  const len = new Uint8Array(4)
  len[0] = (data.length >>> 24) & 0xff
  len[1] = (data.length >>> 16) & 0xff
  len[2] = (data.length >>> 8) & 0xff
  len[3] = data.length & 0xff
  const body = new Uint8Array(4 + type.length + data.length)
  body.set(len, 0)
  for (let i = 0; i < type.length; i++) body[4 + i] = type.charCodeAt(i)
  body.set(data, 4 + type.length)
  let crc = 0xffffffff
  for (const b of body) {
    crc = (crc >>> 8) ^ table[(crc ^ b) & 0xff]
  }
  crc = (crc ^ 0xffffffff) >>> 0
  const crcBytes = new Uint8Array(4)
  crcBytes[0] = (crc >>> 24) & 0xff
  crcBytes[1] = (crc >>> 16) & 0xff
  crcBytes[2] = (crc >>> 8) & 0xff
  crcBytes[3] = crc & 0xff
  const out = new Uint8Array(body.length + 4)
  out.set(body, 0)
  out.set(crcBytes, body.length)
  return out
}

interface PaletteResult {
  palette: Uint8Array // RGB 三字节一组（≤256 项）
  indices: Uint8Array
  transIndex: number | null
}

/** 4-4-4 桶量化 → 局部调色板（≤255 色 + 可选透明索引 0）。 */
function buildPalette(pixels: Uint8ClampedArray, w: number, h: number): PaletteResult {
  const bucketKey = (r: number, g: number, b: number): number => ((r >> 4) << 8) | ((g >> 4) << 4) | (b >> 4)
  const sums = new Map<number, number[]>() // key -> [r,g,b,count]
  const order: number[] = []
  let hasAlpha = false
  for (let i = 0; i < pixels.length; i += 4) {
    const a = pixels[i + 3]
    if (a < 128) { hasAlpha = true; continue }
    const key = bucketKey(pixels[i], pixels[i + 1], pixels[i + 2])
    const entry = sums.get(key)
    if (entry === undefined) { sums.set(key, [pixels[i], pixels[i + 1], pixels[i + 2], 1]); order.push(key) }
    else { entry[0] += pixels[i]; entry[1] += pixels[i + 1]; entry[2] += pixels[i + 2]; entry[3] += 1 }
  }
  order.sort((a, b) => (sums.get(b)?.[3] ?? 0) - (sums.get(a)?.[3] ?? 0))
  const transIndex = hasAlpha ? 0 : null
  const maxColors = transIndex !== null ? 255 : 256
  const chosen = order.slice(0, maxColors)
  const paletteArr: number[] = []
  const keyToIndex = new Map<number, number>()
  chosen.forEach((key, i) => {
    const [sr, sg, sb, count] = sums.get(key) as number[]
    const idx = transIndex !== null ? i + 1 : i
    paletteArr.push(Math.round(sr / count), Math.round(sg / count), Math.round(sb / count))
    keyToIndex.set(key, idx)
  })
  // 未入选的桶 → 最近入选桶（按桶坐标距离）
  const palette = new Uint8Array(paletteArr)
  const indices = new Uint8Array(pixels.length / 4)
  for (let i = 0, p = 0; i < pixels.length; i += 4, p++) {
    const a = pixels[i + 3]
    if (a < 128) { indices[p] = transIndex ?? 0; continue }
    const key = bucketKey(pixels[i], pixels[i + 1], pixels[i + 2])
    let idx = keyToIndex.get(key)
    if (idx === undefined) {
      // 最近邻（桶坐标）
      const kr = key >> 8
      const kg = (key >> 4) & 0x0f
      const kb = key & 0x0f
      let best = 0
      let bestD = Infinity
      keyToIndex.forEach((v, k) => {
        const d = Math.abs((k >> 8) - kr) + Math.abs(((k >> 4) & 0x0f) - kg) + Math.abs((k & 0x0f) - kb)
        if (d < bestD) { bestD = d; best = v }
      })
      idx = best
    }
    indices[p] = idx
  }
  return { palette, indices, transIndex }
}

/**
 * 编码 GIF89a（循环播放）：逐帧局部调色板（4-4-4 量化 + 可选透明索引）、
 * 清除方式 2（恢复背景）、NETSCAPE 循环扩展。
 * #88 关键语义：清除方式必须为 2——播放器每帧显示完即清空画布，帧间不残留。
 * 此前用 1（保持）→ 透明动图每帧叠加在旧帧上，画面滞留累积到整轮循环结束才清除
 * （实测合成动图"帧滞留"的根因；浏览器播放器对清除方式 1 + 透明 = 不清理旧帧）。
 */
export function encodeGif(
  width: number,
  height: number,
  frames: Array<{ pixels: Uint8ClampedArray; delayCs: number }>,
): Uint8Array {
  const out: number[] = []
  const push = (bytes: Uint8Array | number[]): void => { for (const b of bytes) out.push(b) }
  push([0x47, 0x49, 0x46, 0x38, 0x39, 0x61]) // GIF89a
  // LSD：无全局调色板
  push([width & 0xff, (width >> 8) & 0xff, height & 0xff, (height >> 8) & 0xff, 0x00, 0x00, 0x00])
  // NETSCAPE 循环（无限）
  push([0x21, 0xff, 0x0b])
  push([0x4e, 0x45, 0x54, 0x53, 0x43, 0x41, 0x50, 0x45, 0x32, 0x2e, 0x30])
  push([0x03, 0x01, 0x00, 0x00, 0x00])
  for (const frame of frames) {
    const { palette, indices, transIndex } = buildPalette(frame.pixels, width, height)
    const delay = Math.max(1, Math.min(65535, Math.round(frame.delayCs)))
    // GCE：清除方式 2（恢复背景，0x08）+ 可选透明（#88——方式 1 会让透明帧残留叠加）
    const gcePacked = 0x08 | (transIndex !== null ? 0x01 : 0x00)
    push([0x21, 0xf9, 0x04, gcePacked, delay & 0xff, (delay >> 8) & 0xff, transIndex ?? 0, 0x00])
    // 图像描述：局部调色板 256 色（n=7）
    const lctSizeField = 7
    push([0x2c, 0x00, 0x00, 0x00, 0x00, width & 0xff, (width >> 8) & 0xff, height & 0xff, (height >> 8) & 0xff, 0x80 | lctSizeField])
    // 局部调色板（256 项，未用补 0；透明索引 0 时第 0 项为占位色）
    const palArr: number[] = []
    if (transIndex === 0) palArr.push(0, 0, 0)
    for (let i = 0; i < palette.length; i += 3) {
      palArr.push(palette[i], palette[i + 1], palette[i + 2])
    }
    while (palArr.length < 256 * 3) palArr.push(0, 0, 0)
    push(palArr)
    // LZW 最小码长 8
    push([8])
    const encoded = lzwEncode(indices, 8)
    for (let i = 0; i < encoded.length; i += 255) {
      const block = encoded.slice(i, i + 255)
      push([block.length])
      push(block)
    }
    push([0x00])
  }
  push([0x3b])
  return new Uint8Array(out)
}
