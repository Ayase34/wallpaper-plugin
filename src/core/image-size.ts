/**
 * #112 图片尺寸读取：只读文件头（不解码像素），支持 PNG / JPEG / GIF / WebP。
 * 用途：asset_list 输出 width/height；cover/widgets 的 focus/zoom → 帧坐标裁剪换算。
 * 纯函数 + 一个薄文件包装；零依赖。
 */
import { openSync, readSync, closeSync } from 'node:fs'

export interface ImageSize { width: number; height: number }

function pngSize(buf: Buffer): ImageSize | null {
  if (buf.length < 24) return null
  if (buf.readUInt32BE(0) !== 0x89504e47) return null
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) }
}

function gifSize(buf: Buffer): ImageSize | null {
  if (buf.length < 10) return null
  if (buf.toString('latin1', 0, 3) !== 'GIF') return null
  return { width: buf.readUInt16LE(6), height: buf.readUInt16LE(8) }
}

function webpSize(buf: Buffer): ImageSize | null {
  if (buf.length < 30) return null
  if (buf.toString('latin1', 0, 4) !== 'RIFF' || buf.toString('latin1', 8, 12) !== 'WEBP') return null
  const chunk = buf.toString('latin1', 12, 16)
  if (chunk === 'VP8X') {
    return { width: 1 + buf.readUIntLE(24, 3), height: 1 + buf.readUIntLE(27, 3) }
  }
  if (chunk === 'VP8 ') {
    return { width: buf.readUInt16LE(26) & 0x3fff, height: buf.readUInt16LE(28) & 0x3fff }
  }
  if (chunk === 'VP8L') {
    const bits = buf.readUInt32LE(21)
    return { width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1 }
  }
  return null
}

function jpegSize(buf: Buffer): ImageSize | null {
  if (buf.length < 4 || buf[0] !== 0xff || buf[1] !== 0xd8) return null
  let offset = 2
  while (offset + 9 < buf.length) {
    if (buf[offset] !== 0xff) { offset += 1; continue }
    const marker = buf[offset + 1]
    if (marker === 0xd8 || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) { offset += 2; continue }
    const length = buf.readUInt16BE(offset + 2)
    // SOF0..SOF15（排除 DHT/JPG/DAC）
    if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
      return { height: buf.readUInt16BE(offset + 5), width: buf.readUInt16BE(offset + 7) }
    }
    if (length < 2) return null
    offset += 2 + length
  }
  return null
}

/** 从文件头字节解析尺寸（不可识别 → null）。 */
export function imageSizeFromBuffer(buf: Buffer): ImageSize | null {
  const jpeg = jpegSize(buf)
  if (jpeg !== null && jpeg.width > 0 && jpeg.height > 0) return jpeg
  for (const parse of [pngSize, gifSize, webpSize]) {
    const size = parse(buf)
    if (size !== null && size.width > 0 && size.height > 0) return size
  }
  return null
}

/** 读文件尺寸（只读头部；JPEG 的 SOF 可能在 EXIF 之后，按需扩大读取量）。 */
export function imageSizeOfFile(file: string): ImageSize | null {
  let fd: number | undefined
  try {
    fd = openSync(file, 'r')
    for (const size of [64 * 1024, 512 * 1024, 4 * 1024 * 1024]) {
      const buf = Buffer.alloc(size)
      const read = readSync(fd, buf, 0, size, 0)
      const parsed = imageSizeFromBuffer(buf.subarray(0, read))
      if (parsed !== null) return parsed
    }
    return null
  } catch {
    return null
  } finally {
    if (fd !== undefined) closeSync(fd)
  }
}
