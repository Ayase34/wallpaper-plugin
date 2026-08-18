// 修复轮 #20：工作室 chrome 钉定纯函数单测——原貌解析 + 活动覆盖 + 引用链覆盖。
// 目录链实证：--dsw-alias-bg-base light=var(--dsw-static-neutral-bluish-00)=rgb(255,255,255)；
// dark=var(--dsw-static-neutral-bluish-950)=rgb(21,21,23)。
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { computeChromePins, CHROME_TOKENS } from '../src/client/theme-pins.ts'

test('无活动覆盖：全部 chrome 令牌钉定为字面值（无 var() 残留）', () => {
  for (const scheme of ['light', 'dark']) {
    const pins = computeChromePins(null, scheme)
    for (const name of CHROME_TOKENS) {
      assert.ok(name in pins, `${scheme} 下 ${name} 已钉定`)
      assert.ok(!pins[name].includes('var('), `${scheme} 下 ${name} 已解析到字面值：${pins[name]}`)
    }
  }
})

test('目录默认解析正确（bg-base 链到静态色板）', () => {
  const dark = computeChromePins(null, 'dark')
  assert.equal(dark['--dsw-alias-bg-base'], 'rgb(21, 21, 23)')
  const light = computeChromePins(null, 'light')
  assert.equal(light['--dsw-alias-bg-base'], 'rgb(255, 255, 255)')
})

test('活动覆盖 alias 令牌：钉定值 = 覆盖值（亮暗各自取值）', () => {
  const active = { '--dsw-alias-bg-base': { light: '#111111', dark: '#222222' } }
  assert.equal(computeChromePins(active, 'light')['--dsw-alias-bg-base'], '#111111')
  assert.equal(computeChromePins(active, 'dark')['--dsw-alias-bg-base'], '#222222')
})

test('活动覆盖引用链底层静态令牌：钉定值随之变化（链解析走覆盖表）', () => {
  // bg-base dark 链到 --dsw-static-neutral-bluish-950；覆盖它 → 钉定值改变
  const over = computeChromePins(
    { '--dsw-static-neutral-bluish-950': { light: '#a1b2c3', dark: '#d4e5f6' } },
    'dark',
  )
  assert.equal(over['--dsw-alias-bg-base'], '#d4e5f6')
})

test('活动覆盖不存在的令牌：其余 chrome 令牌仍钉定且不受影响', () => {
  const pins = computeChromePins({ '--dsw-custom-unknown': { light: '#ff0000', dark: '#00ff00' } }, 'dark')
  assert.equal(pins['--dsw-alias-bg-base'], 'rgb(21, 21, 23)')
})
