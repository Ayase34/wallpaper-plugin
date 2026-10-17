// #112 图片尺寸读取 + 焦点裁剪换算单测（合成文件头，不依赖真实图片）。
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { imageSizeFromBuffer } from '../src/core/image-size.ts'
import { cropFromFocus, cropFrameSize, WIDGET_CROP_RATIOS } from '../src/core/crop.ts'

function pngBuffer(width, height) {
  const b = Buffer.alloc(33)
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]).copy(b, 0)
  b.writeUInt32BE(13, 8)
  b.write('IHDR', 12, 'latin1')
  b.writeUInt32BE(width, 16)
  b.writeUInt32BE(height, 20)
  return b
}

function gifBuffer(width, height) {
  const b = Buffer.alloc(20)
  b.write('GIF89a', 0, 'latin1')
  b.writeUInt16LE(width, 6)
  b.writeUInt16LE(height, 8)
  return b
}

function jpegBuffer(width, height) {
  const b = Buffer.alloc(40)
  b[0] = 0xff; b[1] = 0xd8
  b[2] = 0xff; b[3] = 0xe0
  b.writeUInt16BE(16, 4) // APP0 长度（含自身 2 字节）
  b.write('JFIF', 6, 'latin1')
  const sof = 2 + 2 + 16
  b[sof] = 0xff; b[sof + 1] = 0xc0
  b.writeUInt16BE(17, sof + 2)
  b[sof + 4] = 8
  b.writeUInt16BE(height, sof + 5)
  b.writeUInt16BE(width, sof + 7)
  return b
}

function webpBuffer(width, height) {
  const b = Buffer.alloc(40)
  b.write('RIFF', 0, 'latin1')
  b.writeUInt32LE(32, 4)
  b.write('WEBP', 8, 'latin1')
  b.write('VP8X', 12, 'latin1')
  b.writeUInt32LE(10, 16)
  b.writeUIntLE(width - 1, 24, 3)
  b.writeUIntLE(height - 1, 27, 3)
  return b
}

test('#112 图片尺寸：PNG / JPEG / GIF / WebP 文件头', () => {
  assert.deepEqual(imageSizeFromBuffer(pngBuffer(1920, 1080)), { width: 1920, height: 1080 })
  assert.deepEqual(imageSizeFromBuffer(jpegBuffer(3840, 2160)), { width: 3840, height: 2160 })
  assert.deepEqual(imageSizeFromBuffer(gifBuffer(320, 240)), { width: 320, height: 240 })
  assert.deepEqual(imageSizeFromBuffer(webpBuffer(800, 600)), { width: 800, height: 600 })
  assert.equal(imageSizeFromBuffer(Buffer.from('not an image')), null)
})

test('#112 焦点裁剪：居中无缩放 = 图片居中、不越界', () => {
  const rect = cropFromFocus(1000, 1000, 1920, 640, 0.5, 0.5, 1)
  assert.ok(rect !== null)
  // fit = min(1.92, 0.64) = 0.64 → 640×640，水平居中
  assert.deepEqual(rect, { x: 640, y: 0, w: 640, h: 640 })
})

test('#112 焦点裁剪：放大后可上下移动，焦点越靠上画面越靠上', () => {
  const top = cropFromFocus(1000, 1000, 1920, 640, 0.5, 0, 2)
  const bottom = cropFromFocus(1000, 1000, 1920, 640, 0.5, 1, 2)
  assert.ok(top !== null && bottom !== null)
  assert.equal(top.w, 1280)
  // y 越大画面越靠上：焦点在顶部 → y=0（图上边贴框上边）；焦点在底部 → y=-640
  assert.equal(top.y, 0)
  assert.equal(bottom.y, -640)
  assert.ok(top.y > bottom.y)
  // 覆盖整框：不产生透明边
  for (const rect of [top, bottom]) {
    assert.ok(rect.y <= 0 && rect.y + rect.h >= 640)
  }
})

test('#112 焦点裁剪：非法参数返回 null', () => {
  assert.equal(cropFromFocus(0, 100, 1920, 640, 0.5, 0.5, 1), null)
  assert.equal(cropFromFocus(100, 100, 1920, 640, 0.5, 0.5, 0), null)
  assert.equal(cropFromFocus(100, 100, 1920, 640, Number.NaN, 0.5, 1), null)
})

test('#112 封面帧 3:1、部件帧与 UI 一致', () => {
  assert.deepEqual(cropFrameSize({ w: 3, h: 1 }), { w: 1920, h: 640 })
  assert.deepEqual(cropFrameSize(WIDGET_CROP_RATIOS['chat-background']), { w: 1920, h: 1080 })
  assert.deepEqual(cropFrameSize(WIDGET_CROP_RATIOS['settings-background']), { w: 1920, h: 1920 })
  assert.deepEqual(cropFrameSize(WIDGET_CROP_RATIOS['sidebar-poster']), { w: 384, h: 1920 })
})
