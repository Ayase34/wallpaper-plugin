// #86 GIF 编解码器单测：encode→decode 往返（帧数/延时/像素）、量化容差、透明、LZW 清码路径。
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { encodeGif, decodeGif } from '../src/core/gif-codec.ts'

function solidFrame(w, h, rgb, delayCs, alpha = 255) {
  const pixels = new Uint8ClampedArray(w * h * 4)
  for (let i = 0; i < pixels.length; i += 4) {
    pixels[i] = rgb[0]; pixels[i + 1] = rgb[1]; pixels[i + 2] = rgb[2]; pixels[i + 3] = alpha
  }
  return { pixels, delayCs }
}

test('往返：双帧纯色（红/蓝）+ 延时保留', () => {
  const bytes = encodeGif(8, 8, [solidFrame(8, 8, [255, 0, 0], 50), solidFrame(8, 8, [0, 0, 255], 30)])
  assert.ok(bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46, 'GIF 签名')
  const decoded = decodeGif(bytes)
  assert.equal(decoded.width, 8)
  assert.equal(decoded.height, 8)
  assert.equal(decoded.frames.length, 2)
  assert.equal(decoded.frames[0].delayCs, 50)
  assert.equal(decoded.frames[1].delayCs, 30)
  // 帧 1 全红、帧 2 全蓝（4-4-4 桶量化：原色在桶内无损）
  const f0 = decoded.frames[0].pixels
  const f1 = decoded.frames[1].pixels
  assert.equal(f0[0], 255); assert.equal(f0[1], 0); assert.equal(f0[2], 0); assert.equal(f0[3], 255)
  assert.equal(f1[0], 0); assert.equal(f1[1], 0); assert.equal(f1[2], 255)
})

test('往返：多色帧 + 透明像素（alpha<128 → 透明索引，解码后整像素透明）', () => {
  const w = 2, h = 2
  const pixels = new Uint8ClampedArray(w * h * 4)
  const colors = [[255, 0, 0], [0, 255, 0], [0, 0, 255], [128, 64, 32]]
  for (let i = 0; i < 4; i++) {
    pixels[i * 4] = colors[i][0]; pixels[i * 4 + 1] = colors[i][1]; pixels[i * 4 + 2] = colors[i][2]
    pixels[i * 4 + 3] = i === 3 ? 0 : 255 // 最后一个像素透明
  }
  const bytes = encodeGif(w, h, [{ pixels, delayCs: 20 }])
  const decoded = decodeGif(bytes)
  assert.equal(decoded.frames.length, 1)
  const out = decoded.frames[0].pixels
  // 三色在 4-4-4 桶内往返一致
  assert.equal(out[0], 255, 'p0 R')
  assert.equal(out[4], 0, 'p1 R')
  assert.equal(out[5], 255, 'p1 G')
  assert.equal(out[10], 255, 'p2 B')
  // 透明像素：GIF 透明 = 索引（RGB 不保留），解码后整像素透明
  assert.equal(out[12], 0); assert.equal(out[13], 0); assert.equal(out[14], 0); assert.equal(out[15], 0)
  // 邻像素不污染
  assert.equal(out[3], 255)
})

test('往返：LZW 字典满清码路径（128×128 低色噪声，>4096 字典项）', () => {
  const w = 128, h = 128
  const pixels = new Uint8ClampedArray(w * h * 4)
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4
      // 低色噪声：每通道仅 4 个桶（≤255 桶，量化无损失）+ 长重复序列撑爆字典
      pixels[i] = ((x * 7) % 4) * 64
      pixels[i + 1] = ((y * 11) % 4) * 64
      pixels[i + 2] = (((x + y) % 4)) * 64
      pixels[i + 3] = 255
    }
  }
  const bytes = encodeGif(w, h, [{ pixels, delayCs: 10 }])
  const decoded = decodeGif(bytes)
  assert.equal(decoded.frames.length, 1)
  const out = decoded.frames[0].pixels
  let mismatch = 0
  for (let i = 0; i < pixels.length; i += 4) {
    if (pixels[i] !== out[i] || pixels[i + 1] !== out[i + 1] || pixels[i + 2] !== out[i + 2]) mismatch += 1
  }
  assert.equal(mismatch, 0, `桶级不一致 ${mismatch} 像素`)
})

test('延迟 0 → 编码钳制 1；超大延迟钳制 65535', () => {
  const bytes = encodeGif(4, 4, [solidFrame(4, 4, [1, 2, 3], 99999)])
  const decoded = decodeGif(bytes)
  assert.equal(decoded.frames[0].delayCs, 65535)
  const bytes2 = encodeGif(4, 4, [solidFrame(4, 4, [1, 2, 3], 0)])
  assert.equal(decodeGif(bytes2).frames[0].delayCs, 1)
})

test('非 GIF 输入抛错', () => {
  assert.throws(() => decodeGif(new Uint8Array([1, 2, 3, 4, 5, 6])), /不是 GIF/)
})

// #88 输出 GIF 必须使用清除方式 2（恢复背景）——否则播放器不清理上一帧，
// 透明动图逐帧叠加滞留到整轮循环结束（"合成后每帧滞留在屏幕上"的根因；
// 旧编码写清除方式 1，浏览器对 1 + 透明 = 不清空旧帧）。
test('encodeGif 每帧 GCE 清除方式 = 2；移动色块不残留旧帧', () => {
  const w = 40, h = 40
  const movingFrame = (x0) => {
    const pixels = new Uint8ClampedArray(w * h * 4)
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const o = (y * w + x) * 4
        if (x >= x0 && x < x0 + 8) { pixels[o] = 255; pixels[o + 1] = 0; pixels[o + 2] = 0; pixels[o + 3] = 255 }
        // 其余透明
      }
    }
    return { pixels, delayCs: 10 }
  }
  const bytes = encodeGif(w, h, [movingFrame(0), movingFrame(8), movingFrame(16)])
  // 字节级：扫描所有 GCE 块——清除方式必须全为 2、透明标志为真
  const disposals = []
  const transFlags = []
  for (let p = 0; p < bytes.length - 2; p++) {
    if (bytes[p] === 0x21 && bytes[p + 1] === 0xf9 && bytes[p + 2] === 0x04) {
      const packed = bytes[p + 3]
      disposals.push((packed & 0x1c) >> 2)
      transFlags.push((packed & 0x01) !== 0)
      p += 7
    }
  }
  assert.equal(disposals.length, 3, '应扫描到 3 个 GCE 块')
  assert.deepStrictEqual(disposals, [2, 2, 2], '每帧清除方式必须为 2（恢复背景）')
  assert.deepStrictEqual(transFlags, [true, true, true], '移动色块帧应带透明标志')
  // 行为级：解码回读——帧 2 的旧位置（x 0..7）必须已透明，不能残留帧 1 的色块
  const dec = decodeGif(bytes)
  assert.equal(dec.frames.length, 3)
  const f1 = dec.frames[1].pixels
  const oldPos = (10 * w + 0) * 4
  assert.equal(f1[oldPos + 3], 0, '帧 2 旧位置应透明（帧 1 已清除，无滞留）')
  assert.equal(f1[oldPos], 0)
  const newPos = (10 * w + 8) * 4
  assert.equal(f1[newPos + 3], 255, '帧 2 新位置有色块')
})

// 独立构造的最小 GIF89a（2 色 4×4 双帧红→蓝，minCodeSize=2——#83 探针同款结构，
// 与 encodeGif 的 8 位码流相互独立，交叉验证解码器）
function gifLzw2(pixels) {
  const minCodeSize = 2, clear = 4, eoi = 5
  let codeSize = 3
  const dict = new Map()
  let next = 6
  let bitBuf = 0, bitPos = 0
  const out = []
  const emit = (code) => { bitBuf |= code << bitPos; bitPos += codeSize; while (bitPos >= 8) { out.push(bitBuf & 0xff); bitBuf >>>= 8; bitPos -= 8 } }
  const codeOf = (str) => str.length === 1 ? str.charCodeAt(0) : dict.get(str)
  emit(clear)
  let cur = null
  for (const p of pixels) {
    const ch = String.fromCharCode(p)
    if (cur === null) { cur = ch; continue }
    const key = cur + ch
    if (dict.has(key)) { cur = key; continue }
    emit(codeOf(cur))
    if (next < 4096) { dict.set(key, next); next += 1; if (next === (1 << codeSize) && codeSize < 12) codeSize += 1 }
    cur = ch
  }
  if (cur !== null) emit(codeOf(cur))
  emit(eoi)
  if (bitPos > 0) out.push(bitBuf & 0xff)
  return out
}
function probeFrame(pixels) {
  const enc = gifLzw2(pixels)
  const blocks = []
  for (let i = 0; i < enc.length; i += 255) blocks.push(Buffer.from([Math.min(255, enc.length - i), ...enc.slice(i, i + 255)]))
  return Buffer.concat(blocks.concat([Buffer.from([0])]))
}
function probeGif() {
  const W = 4, H = 4
  const hdr = Buffer.from('GIF89a')
  const lsdt = Buffer.alloc(7)
  lsdt.writeUInt16LE(W, 0); lsdt.writeUInt16LE(H, 2)
  lsdt[4] = 0x80; lsdt[5] = 0; lsdt[6] = 0
  const gct = Buffer.from([255, 0, 0, 0, 0, 255])
  const frame = (idx) => {
    const gce = Buffer.from([0x21, 0xF9, 0x04, 0x04, 50, 0, 0x00, 0x00])
    const imgDesc = Buffer.alloc(10)
    imgDesc[0] = 0x2C
    imgDesc.writeUInt16LE(0, 1); imgDesc.writeUInt16LE(0, 3); imgDesc.writeUInt16LE(W, 5); imgDesc.writeUInt16LE(H, 7)
    imgDesc[9] = 0
    const minCode = Buffer.from([2])
    const pixels = new Array(W * H).fill(idx)
    return Buffer.concat([gce, imgDesc, minCode, frameBlock2(pixels)])
  }
  const frameBlock2 = (pixels) => {
    const enc = gifLzw2(pixels)
    const blocks = []
    for (let i = 0; i < enc.length; i += 255) blocks.push(Buffer.from([Math.min(255, enc.length - i), ...enc.slice(i, i + 255)]))
    return Buffer.concat(blocks.concat([Buffer.from([0])]))
  }
  return Buffer.concat([hdr, lsdt, gct, frame(0), frame(1), Buffer.from([0x3B])])
}

test('解码独立构造的 2 色最小码长 GIF（#83 探针结构，交叉验证）', () => {
  const gif = probeGif()
  const decoded = decodeGif(new Uint8Array(gif))
  assert.equal(decoded.width, 4)
  assert.equal(decoded.height, 4)
  assert.equal(decoded.frames.length, 2)
  assert.equal(decoded.frames[0].delayCs, 50)
  assert.equal(decoded.frames[1].delayCs, 50)
  const f0 = decoded.frames[0].pixels
  const f1 = decoded.frames[1].pixels
  assert.equal(f0[0], 255); assert.equal(f0[1], 0); assert.equal(f0[2], 0); assert.equal(f0[3], 255) // 帧 0 全红
  assert.equal(f1[0], 0); assert.equal(f1[1], 0); assert.equal(f1[2], 255) // 帧 1 全蓝
  // 两帧确实不同（动图）
  assert.notEqual(f0[0], f1[0])
})
