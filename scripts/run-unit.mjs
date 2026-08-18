// #96：单测运行器——显式枚举 tests/*.test.mjs（Node 20 的 node --test 不做引号内 glob 展开；
// selfcheck 同款 readdirSync 方式）。退出码透传。
import { spawnSync } from 'node:child_process'
import { readdirSync } from 'node:fs'
import { join, resolve } from 'node:path'

const ROOT = resolve(import.meta.dirname, '..')
const testsDir = join(ROOT, 'tests')
const tests = readdirSync(testsDir).filter(f => f.endsWith('.test.mjs')).sort().map(f => join(testsDir, f))
const res = spawnSync(process.execPath, ['--test', ...tests], { cwd: ROOT, stdio: 'inherit' })
process.exit(res.status ?? 1)
